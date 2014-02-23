"use strict";

/**
 * @fileOverview Provides an simple API for IMAP mailbox access
 * @author Andris Reinman
 */

// TODO: On error close the connection when needed

var Stream = require("stream").Stream,
    utillib = require("util"),
    net = require("net"),
    tls = require("tls"),
    starttls = require("./starttls").starttls,
    IMAPLineParser = require("./lineparser"),
    mimelib = require("mimelib"),
    xoauth = require("./xoauth"),
    xoauth2 = require("xoauth2"),
    packageData = require("../package.json"),
    utf7 = require('utf7').imap,
    mailboxlib = require("./mailbox"),
    Mailbox = mailboxlib.Mailbox,
    detectMailboxType = mailboxlib.detectMailboxType;

var X_CLIENT_NAME = "inbox",
    X_CLIENT_URL = "https://github.com/andris9/inbox";

/**
 * Expose to the world
 * @namespace inbox
 */
module.exports.createConnection = createConnection;
module.exports.createXOAuthGenerator = createXOAuthGenerator;
module.exports.IMAPClient = IMAPClient;

/**
 * Create an IMAP inbox object, shorthand for new IMAPClient.
 *
 * @memberOf inbox
 * @param {Number} port IMAP server port to connect to
 * @param {String} host IMAP server hostname
 * @param {Object} options Options object for authentication etc.
 */
function createConnection(port, host, options){
    return new IMAPClient(port, host, options);
}

/**
 * Create a XOAUTH login token generator
 *
 * @memberOf inbox
 * @param {Object} options Options object, see {@see xoauth}
 */
function createXOAuthGenerator(options){
    return new xoauth.XOAuthGenerator(options);
}

/**
 * Creates an IMAP connection object for communicating with the server
 *
 * @constructor
 * @memberOf inbox
 * @param {Number} port IMAP server port to connect to
 * @param {String} host IMAP server hostname
 * @param {String} options Options object for authentication etc.
 */
function IMAPClient(port, host, options){
    Stream.call(this);

    /**
     * Make this stream writeable. For future reference only, currently not needed
     */
    this.writable = true;

    /**
     * Make this stream readable. Should be on by default though
     */
    this.readable = true;

    /**
     * Options object for this instance
     */
    this.options = options || {};

    /**
     * Port to use for connecting to the server
     */
    this.port = port || (this.options.secureConnection ? 993 : 143);

    /**
     * Server hostname
     */
    this.host = host || "localhost";

    /**
     * If set to true, print traffic between client and server to the console
     */
    this.debug = !!this.options.debug;

    /**
     * XOAuth2 token generator if XOAUTH2 auth is used
     * @private
     */
    this._xoauth2 = false;
    this._xoauth2RetryCount = 0;
    this._xoauth2UntaggedResponse = false;

    if(typeof this.options.auth && typeof this.options.auth.XOAuth2){
        if(typeof this.options.auth.XOAuth2 == "object" && typeof this.options.auth.XOAuth2.getToken == "function"){
            this._xoauth2 = this.options.auth.XOAuth2;
        }else if(typeof this.options.auth.XOAuth2 == "object"){
            if(!this.options.auth.XOAuth2.user && this.options.auth.user){
                this.options.auth.XOAuth2.user = this.options.auth.user;
            }
            this._xoauth2 = xoauth2.createXOAuth2Generator(this.options.auth.XOAuth2);
        }
    }

    this._init();
}
utillib.inherits(IMAPClient, Stream);

/**
 * States constants for the client FSM.
 */
IMAPClient.prototype.states = {
    NONE: 0x1,
    PREAUTH: 0x2,
    AUTH: 0x3,
    SELECTED: 0x4,
    LOGOUT: 0x5
};

/**
 * States constants for current command parsing.
 */
IMAPClient.prototype.modes = {
    COMMAND: 0x1,
    DATA: 0x2
};

/**
 * Delay for breaking IDLE loop and running NOOP
 */
IMAPClient.prototype.IDLE_TIMEOUT = 60 * 1000;

/**
 * Delay for entering IDLE mode after any command
 */
IMAPClient.prototype.ENTER_IDLE = 1 * 1000;

/**
 * How much time to wait for the initial greeting
 */
IMAPClient.prototype.GREETING_TIMEOUT = 15 * 1000;

/**
 * Reset instance variables
 */
IMAPClient.prototype._init = function(){

    /**
     * Should the connection be over TLS or NET
     */
    this.options.secureConnection = !!this.options.secureConnection;

    /**
     * Authentication details
     */
    this.options.auth = this.options.auth || {user: "", pass:""};

    /**
     * Connection socket to the server
     */
    this._connection = false;

    /**
     * Is the connection currently in secure mode, changes with STARTTLS
     */
    this._secureMode = !!this.options.secureConnection;

    /**
     * Current protocol state.
     */
    this._currentState = this.states.NONE;

    /**
     * Current stream mode for incoming data
     */
    this._currentMode = this.modes.COMMAND;

    /**
     * Expected remaining data length on stream data mode
     */
    this._expectedDataLength = 0;

    /**
     * Data that was not part of the last command
     */
    this._remainder = "";

    /**
     * Counter for generating unique command tags
     */
    this._tagCounter = 0;

    /**
     * Currently active command
     */
    this._currentRequest = false;

    /**
     * Unprocessed commands
     */
    this._commandQueue = [];

    /**
     * Server capabilities
     */
    this._capabilities = [];

    /**
     * Are the capabilities updated
     */
    this._updatedCapabilities = false;

    /**
     * Currently in idle
     */
    this.idling = false;

    /**
     * Currently "nooping" when idle not available
     */
    this.nooping = false;

    /**
     * Waiting for idle start after issuing IDLE command
     */
    this._idleWait = false;

    /**
     * Waiting for the idle to end
     */
    this._idleEnd = false;

    /**
     * Timer to run NOOP when in idle
     */
    this._idleTimer = false;

    /**
     * Timer for entering idle mode after other commands
     */
    this._shouldIdleTimer = true;

    /**
     * If true check mail before entering idle
     */
    this._shouldCheckOnIdle = false;

    /**
     * Timeout to wait for a successful greeting from the server
     */
    this._greetingTimeout = false;

    /**
     * Server ID
     */
     this._serverId = {};

    /**
     * Should the FETCH responses collected into an array
     */
    this._collectMailList = false;

    /**
     * An array of collected FETCH responses
     */
    this._mailList = [];

    /**
     * If set to true emit FETCH responses as new emails
     */
    this._checkForNewMail = false;

    /**
     * Currently selected mailbox data
     */
    this._selectedMailbox = {};

    /**
     * Currently streaming possible literal values
     */
    this._literalStreaming = false;

    /**
     * Message Stream object for streaming requested messages
     */
    this._messageStream = false;

    /**
     * Literal handler
     */
    this._literalHandler = false;

    /**
     * Personal mailbox root
     */
    this._rootPath = "";

    /**
     * Delimiter for mailbox hierarchy
     */
    this._mailboxDelimiter = "/";

    /**
     * Default INBOX name
     */
    this._inboxName = "INBOX";

    /**
     * Default Sent folder name
     */
    this._outgoingName = this.options.outgoingName || "";

    /**
     * Active mailbox list
     */
    this._mailboxList = [];

    /**
     * Is CONDSTORE enabled or not
     */
    this._condstoreEnabled = false;

    /**
     * Ignore all incoming data while in TLS negotiations
     */
    this._ignoreData = false;

    /**
     * Keep IMAP log for error trace
     */
    this._log = [];

    /**
     * IMAP log length in lines
     */
    this._logLength = 10;

    /**
     * Root mailbox
     */
    this._rootMailbox = new Mailbox({client: this});

    /**
     * Lineparser object to feed the incoming data to
     */
    this.lineparser = new IMAPLineParser();

    /**
     * Initially send the incoming data to greeting handler
     */
    this._currentHandler = this._handlerGreeting;

    this.lineparser.on("line", this._onServerResponse.bind(this));
    this.lineparser.on("log", this._onServerLog.bind(this, "S"));
};

/**
 * Connect to the server using either TLS or NET
 */
IMAPClient.prototype.connect = function(){

    if(this.options.secureConnection){
        this._connection = tls.connect(this.port, this.host, {rejectUnauthorized: false}, this._onConnect.bind(this));
    }else{
        this._connection = net.connect(this.port, this.host);
        this._connection.on("connect", this._onConnect.bind(this));
    }

    this._connection.on("error", this._onError.bind(this));

    this._greetingTimeout = setTimeout(this._handleGreetingTimeout.bind(this), this.GREETING_TIMEOUT);
};

// CONNECTION EVENTS

/**
 * 'connect' event for the connection to the server. Setup other events when connected
 *
 * @event
 */
IMAPClient.prototype._onConnect = function(){

    if(this.debug){
        console.log("Connection to server opened");
    }

    if("setKeepAlive" in this._connection){
        this._connection.setKeepAlive(true);
    }else if(this._connection.socket && "setKeepAlive" in this._connection.socket){
        this._connection.socket.setKeepAlive(true); // secure connection
    }

    this._connection.on("data", this._onData.bind(this));
    this._connection.on("close", this._onClose.bind(this));
    this._connection.on("end", this._onEnd.bind(this));

};

/**
 * 'data' event coming from the server connection. Split the lines on line breaks
 * and if in COMMAND mode pass the line to the line parser and when in DATA
 * mode, pass it as a literal or stream if needed. If there's a remainder left from
 * the end of the line, rerun the function with it
 *
 * @event
 * @param {Buffer} chunk incoming binary data chunk
 */
IMAPClient.prototype._onData = function(chunk){
    if(this._ignoreData){
        // TLS negotiations going on, ignore everything received
        return;
    }

    var data = chunk && chunk.toString("binary") || "",
        line, match;

    if(this._remainder){
        data = this._remainder + data;
        this._remainder = "";
    }

    if(this._currentMode == this.modes.DATA){
        if(this._expectedDataLength <= data.length){

            if(this._expectedDataLength){

                if(!this._literalStreaming){
                    this.lineparser.writeLiteral(data.substr(0, this._expectedDataLength));
                }else{
                    this._messageStream.emit("data", new Buffer(data.substr(0, this._expectedDataLength), "binary"));
                }

                this._remainder = data.substr(this._expectedDataLength);
                this._expectedDataLength = 0;
            }else{
                this._remainder = data;
            }

            this._currentMode = this.modes.COMMAND;

            return this._onData(); // rerun with the remainder
        }else{

            if(!this._literalStreaming){
                this.lineparser.writeLiteral(data);
            }else{
                this._messageStream.emit("data", new Buffer(data, "binary"));
            }

            this._expectedDataLength -= data.length;
            return;
        }
    }

    if(this._currentMode == this.modes.COMMAND){
        if((match = data.match(/\r?\n/))){ // find the line ending
            line = data.substr(0, match.index);
            this._remainder = data.substr(match.index + match[0].length) || "";

            if(this.debug){
                console.log("SERVER: "+line);
            }

            // check if the line ends with a literal notion
            if((match = line.match(/\{(\d+)\}\s*$/))){
                this._expectedDataLength = Number(match[1]);
                this.lineparser.write(line);

                this._currentMode = this.modes.DATA;

                if(this._literalStreaming){
                    this.lineparser.writeLiteral(""); // create empty literal object
                }
            }else{
                this.lineparser.end(line);
            }

            if(this._remainder){
                return this._onData(); // rerun with the remainder
            }
        }else{
            this._remainder = data; // keep it for later
        }
    }
};

/**
 * 'close' event when disconnected from the server
 * @event
 */
IMAPClient.prototype._onClose = function(){
    if(this.debug){
        console.log("EVENT: CLOSE");
    }

    this._close();
};

/**
 * 'end' event when disconnected from the server
 * @event
 */
IMAPClient.prototype._onEnd = function(){
    this.emit("end");

    if(this.debug){
        console.log("EVENT: END");
    }

    this._close();
};

/**
 * 'error' event, re-emit it
 * @event
 */
IMAPClient.prototype._onError = function(error){
    this.emit("error", error);
};


// INCOMING COMMANDS

/**
 * When the input command has been parsed pass it to the current command handler.
 * Basically there's just two - the initial greeting handler and universal
 * response router
 *
 * @param {Array} data Parsed command, split into parameters
 */
IMAPClient.prototype._onServerResponse = function(data){
    this._currentHandler(data);
};

/*
 * Log IMAP commands into ._log array
 *
 * @param {String} data IMAP command line
 */
IMAPClient.prototype._onServerLog = function(type, data){
    this._log.unshift((type?type + ": " :"") + (data || "").toString().trim());
    if(this._log.length > this._logLength){
        this._log.pop();
    }
};

/**
 * Run as the handler for the initial command coming from the server. If it
 * is a greeting with status OK, enter PREAUTH state and run CAPABILITY
 * command
 *
 * @param {Array} data Parsed command
 */
IMAPClient.prototype._handlerGreeting = function(data){
    clearTimeout(this._greetingTimeout);

    if(!data || !Array.isArray(data)){
        throw new Error("Invalid input");
    }

    if(data[0] != "*" && data[1] != "OK"){
        var error = new Error("Bad greeting from the server");
        error.errorType = "ProtocolError";
        error.errorLog = this._log.slice(0, this._logLength);
        this.emit("error", error);
        this._close();
        return;
    }

    this._currentState = this.states.PREAUTH;
    this._currentHandler = this._responseRouter;

    this._send("CAPABILITY", this._handlerTaggedCapability.bind(this));
};

/**
 * When the greeting is not received in GREETING_TIMEOUT time,
 * emit an error and close the socket
 */
IMAPClient.prototype._handleGreetingTimeout = function(){
    var error = new Error("Timeout waiting for a greeting");
    error.errorType = "TimeoutError";
    this.emit("error", error);
    this._close();
};

/**
 * Checks the command data and routes it to the according handler
 *
 * @param {Array} data Parsed command
 */
IMAPClient.prototype._responseRouter = function(data){
    if(!data || !Array.isArray(data)){
        return;
    }

    // Handle tagged commands
    if(this._currentRequest && this._currentRequest.tag == data[0]){
        this._currentRequest.callback(data[1], data.slice(2));
        return;
    }

    // handle commands tagged with +
    if(data[0]=="+"){
        if(this._idleWait){
            this._handlerUntaggedIdle();
        }

        if(this._literalHandler){
            this._literalHandler(data.slice(1));
        }
    }else if(this._literalHandler){
        this._literalHandler = null;
    }

    // handle untagged commands (tagged with *)
    if(data[0]=="*"){
        switch(data[1]){
            case "CAPABILITY":
                this._handlerUntaggedCapability(data.slice(2));
                return;
            case "ID":
                this._handlerUntaggedId(data.slice(2));
                return;
            case "ENABLED":
                this._handlerUntaggedEnabled(data.slice(2));
                return;
            case "FLAGS":
                this._selectedMailbox.flags = data[2] || [];
                return;
            case "SEARCH":
                this._handlerUntaggedSearch(data.slice(2));
                return;
            case "XLIST":
            case "LIST":
                this._handlerUntaggedList(data.slice(2));
                return;
            case "LSUB":
                this._handlerUntaggedLsub(data.slice(2));
                return;
            case "OK":
                if(typeof data[2] == "object"){
                    if(Array.isArray(data[2].params)){
                        if(data[2].params[0] == "UIDVALIDITY"){
                            this._selectedMailbox.UIDValidity = data[2].params[1];
                            return;
                        }else if(data[2].params[0] == "UIDNEXT"){
                            this._selectedMailbox.UIDNext = data[2].params[1];
                            return;
                        }else if(data[2].params[0] == "HIGHESTMODSEQ"){
                            this._selectedMailbox.highestModSeq = Number(data[2].params[1]);
                            return;
                        }else if(data[2].params[0] == "UNSEEN"){
                            this._selectedMailbox.unseen = data[2].params[1];
                            return;
                        }else if(data[2].params[0] == "PERMANENTFLAGS"){
                            this._selectedMailbox.permanentFlags = data[2].params[1] || [];
                            return;
                        }
                    }
                }
                return;
        }

        if(!isNaN(data[1]) && data[2] == "FETCH"){
            this._handlerUntaggedFetch(data);
            return;
        }

        if(!isNaN(data[1]) && data[2] == "EXPUNGE"){
            if(this._selectedMailbox.count){
                this._selectedMailbox.count--;
            }
        }

        if(!isNaN(data[1]) && data[2] == "EXISTS"){
            if(this._selectedMailbox.count != Number(data[1])){
                this._selectedMailbox.count = Number(data[1]) || this._selectedMailbox.count || 0;
                if(this.idling || this.nooping){
                    this._checkNewMail();
                }
            }
            return;
        }

    }
};

// OUTGOING COMMANDS

/**
 * Prepend a tag for a command and put into command queue
 *
 * @param {String} data Command to be sent to the server
 * @param {Function} [callback] Callback function to run when the command is completed
 * @param {Function} [prewrite] Function to run before the command is sent
 */
IMAPClient.prototype._send = function(data, callback, prewrite){
    data = (data || "").toString();
    var tag = "A" + (++this._tagCounter);

    this._commandQueue.push({tag: tag, data: tag + " " + data + "\r\n", callback: callback, prewrite: prewrite});

    if(this.idling || !this._currentRequest){
        this._processCommandQueue();
    }
};

/**
 * Send a command form the command queue to the server
 */
IMAPClient.prototype._processCommandQueue = function(){

    if(!this._commandQueue.length || !this._connection){
        return;
    }

    // If the client is currently on idle, stop it
    clearTimeout(this._shouldIdleTimer);
    clearTimeout(this._idleTimer);
    if(this._idleWait || this.idling){
        if(!this._idleWait && this.idling && !this._idleEnd){
            if(this.debug){
                console.log("CLIENT: DONE");
            }
            this._onServerLog("C", "DONE");
            this._connection.write("DONE\r\n");
            this._idleEnd = true;
        }
        setTimeout(this._processCommandQueue.bind(this), 100);
        return;
    }

    var command = this._commandQueue.shift();

    if(typeof command.prewrite == "function"){
        command.prewrite();
    }

    this._onServerLog("C", command.data);
    this._connection.write(command.data);

    if(this.debug){
        console.log("CLIENT: "+ (command.data || "").trim());
    }

    this._currentRequest = {
        tag: command.tag,
        callback: (function(status, params){

            clearTimeout(this._shouldIdleTimer);
            clearTimeout(this._idleTimer);
            if(!this.idling && !this._idleWait && this._currentState == this.states.SELECTED){
                this._shouldIdleTimer = setTimeout(this.idle.bind(this), this.ENTER_IDLE);
            }

            if(typeof command.callback == "function"){
                command.callback(status, params);
            }
            this._currentRequest = false;

            this._processCommandQueue();
        }).bind(this)
    };
};

// HANDLERS FOR TAGGED RESPONSES

/**
 * Handle tagged CAPABILITY. If in plaintext mode and STARTTLS is advertised,
 * run STARTTLS, otherwise report success to _postCapability()
 *
 * @param {String} status If "OK" then the command succeeded
 */
IMAPClient.prototype._handlerTaggedCapability = function(status){
    if(status == "OK"){
        if(!this._secureMode && this._capabilities.indexOf("STARTTLS")>=0){
            this._send("STARTTLS", this._handlerTaggedStartTLS.bind(this));
            return;
        }

        this._postCapability();
    }else{
        var error = new Error("Invalid capability response");
        error.errorType = "ProtocolError";
        error.errorLog = this._log.slice(0, this._logLength);
        this.emit("error", error);
        this._close();
    }
};

/**
 * Handle tagged STARTTLS. If status is OK perform a TLS handshake and rerun
 * CAPABILITY on success.
 *
 * @param {String} status If "OK" then the command succeeded
 */
IMAPClient.prototype._handlerTaggedStartTLS = function(status){
    if(status == "OK"){
        this._ignoreData = true;
        starttls(this._connection, (function(socket){

            this._connection = socket;
            this._ignoreData = false;
            this._secureMode = true;
            this._connection.on("data", this._onData.bind(this));

            if("setKeepAlive" in this._connection){
                this._connection.setKeepAlive(true);
            }else if(this._connection.socket && "setKeepAlive" in this._connection.socket){
                this._connection.socket.setKeepAlive(true); // secure connection
            }

            this._send("CAPABILITY", this._handlerTaggedCapability.bind(this));
        }).bind(this));
    }else{
        var error = new Error("Invalid starttls response");
        error.errorType = "TLSError";
        error.errorLog = this._log.slice(0, this._logLength);
        this.emit("error", error);
        this._close();
    }
};

/**
 * Handle LOGIN response. If status is OK, consider the user logged in.
 *
 * @param {String} status If "OK" then the command succeeded
 */
IMAPClient.prototype._handlerTaggedLogin = function(status){
    if(status == "OK"){
        this._xoauth2RetryCount = 0;
        this._xoauth2UntaggedResponse  = false;
        this._currentState = this.states.AUTH;
        if(!this._updatedCapabilities){
            this._send("CAPABILITY", this._handlerTaggedCapability.bind(this));
        }else{
            this._postAuth();
        }
    }else{
        if(this._xoauth2 && this._xoauth2UntaggedResponse && this._xoauth2RetryCount && this._xoauth2RetryCount < 3){
            this._xoauth2.generateToken((function(err){
                var error;
                if(err){
                    if(typeof err != "object"){
                        error = new Error(err.toString());
                    }else{
                       error = err;
                    }
                    error.errorType = "XOAUTH2Error";
                    error.errorLog = this._log.slice(0, this._logLength);
                    this.emit("error", error);
                    return;
                }
                this._postCapability();
            }).bind(this));
        }else{
            var error = new Error("Authentication failed");
            error.errorType = "AuthenticationError";
            error.errorLog = this._log.slice(0, this._logLength);
            this.emit("error", error);
            this._close();
        }
    }
};

/**
 * Handle ID command. We don't reaaly care if the ID succeeded or
 * not as it is just some informational data. If it failed we still might be
 * able to access the mailbox
 */
IMAPClient.prototype._handlerTaggedId = function(){
    this._postReady();
};

/**
 * Handle CONDSTORE command. We don't reaaly care if the CONDSTORE succeeded or
 * not as it is just some informational data. If it failed we still might be
 * able to access the mailbox
 */
IMAPClient.prototype._handlerTaggedCondstore = function(){
    var clientData = {
        name: X_CLIENT_NAME
    };

    if(packageData.version){
        clientData.version = packageData.version;
    }

    if(X_CLIENT_URL){
        clientData["support-url"] = X_CLIENT_URL;
    }

    if(this.options.clientId){
        Object.keys(this.options.clientId).forEach((function(key){
            clientData[key] = this.options.clientId[key];
        }).bind(this));
    }

    clientData = Object.keys(clientData).map((function(key){
            return this._escapeString(key) + " " + this._escapeString(clientData[key]);
        }).bind(this)).join(" ");

    if(this._capabilities.indexOf("ID")>=0){
        this._send("ID (" + clientData + ")", this._handlerTaggedId.bind(this));
    }else{
        this._postReady();
    }
};

/**
 * Handle mailbox listing with LSUB
 *
 * @param {String} status If "OK" then the command succeeded
 */
IMAPClient.prototype._handlerTaggedLsub = function(xinfo, callback, status){
    if(status != "OK"){
        if(typeof callback == "function"){
            callback(new Error("Mailbox listing failed"));
        }
        return;
    }

    var curXinfo, curName;

    for(var i=0, len = xinfo.length; i<len; i++){

        curXinfo = xinfo[i];
        curXinfo.tags = curXinfo.tags || [];

        curName = curXinfo.name || "";
        if(curXinfo.tags.indexOf("\\Inbox")>=0){
            curName = "INBOX";
        }

        for(var j=0, jlen = this._mailboxList.length; j<jlen; j++){
            if(curName == this._mailboxList[j].name){

                this._mailboxList[j].name = curXinfo.name || this._mailboxList[j].name || "";
                this._mailboxList[j].tags = curXinfo.tags;

                if(curXinfo.tags.indexOf("\\Noselect")>=0){
                    this._mailboxList[j].disabled = true;
                }

                if(curXinfo.tags.indexOf("\\Inbox")>=0){
                    this._mailboxList[j].type = "Inbox";
                }else if(curXinfo.tags.indexOf("\\All")>=0 || curXinfo.tags.indexOf("\\AllMail")>=0){
                    this._mailboxList[j].type = "All Mail";
                }else if(curXinfo.tags.indexOf("\\Archive")>=0){
                    this._mailboxList[j].type = "Archive";
                }else if(curXinfo.tags.indexOf("\\Drafts")>=0){
                    this._mailboxList[j].type = "Drafts";
                }else if(curXinfo.tags.indexOf("\\Sent")>=0){
                    this._mailboxList[j].type = "Sent";
                }else if(curXinfo.tags.indexOf("\\Junk")>=0 || curXinfo.tags.indexOf("\\Spam")>=0){
                    this._mailboxList[j].type = "Junk";
                }else if(curXinfo.tags.indexOf("\\Flagged")>=0 || curXinfo.tags.indexOf("\\Starred")>=0 || curXinfo.tags.indexOf("\\Important")>=0){
                    this._mailboxList[j].type = "Flagged";
                }else if(curXinfo.tags.indexOf("\\Trash")>=0){
                    this._mailboxList[j].type = "Trash";
                }

                break;
            }
        }
    }

    if(typeof callback == "function"){
        callback(null, this._mailboxList);
    }
};

/**
 * Handle SELECT and EXAMINE commands. If succeeded, move to SELECTED state.
 * If callback is set runs it with selected mailbox data
 *
 *
 * @param {Function} callback Callback function to run on completion
 * @param {String} status If "OK" then the command succeeded
 * @params {Array} params Parsed params excluding tag and SELECT
 */
IMAPClient.prototype._handlerTaggedSelect = function(callback, status, params){
    if(status == "OK"){
        this._currentState = this.states.SELECTED;

        if(Array.isArray(params) && params[0] && params[0].params){
            if(params[0].params[0] == "READ-WRITE"){
                this._selectedMailbox.readOnly = false;
            }else if(params[0].params[0] == "READ-ONLY"){
                this._selectedMailbox.readOnly = true;
            }
        }

        clearTimeout(this._shouldIdleTimer);
        clearTimeout(this._idleTimer);
        this._shouldIdleTimer = setTimeout(this.idle.bind(this), this.ENTER_IDLE);

        if(typeof callback == "function"){
            callback(null, this._selectedMailbox);
        }else{
            this.emit("mailbox", this._selectedMailbox);
        }
    }else{
        var error = new Error("Mailbox select failed");
        error.errorType = "MailboxError";
        error.errorLog = this._log.slice(0, this._logLength);
        if(typeof callback == "function"){
            callback(error);
        }else{
            this.emit("error", error);
        }
    }
};


// HANDLERS FOR UNTAGGED RESPONSES

/**
 * Handle untagged CAPABILITY response, store params to _capabilities array
 *
 * @param {Array} list Params for "* CAPABILITY" as an array
 */
IMAPClient.prototype._handlerUntaggedCapability = function(list){
    this._updatedCapabilities = true;
    this._capabilities = list;
};

/**
 * Handle untagged ID response.
 *
 * @param {Array} list Params
 */
IMAPClient.prototype._handlerUntaggedId = function(list){
    list = (list || [])[0] || [];
    var key;
    for(var i=0, len = list.length; i<len; i++){
        if(i % 2 === 0){
            key = list[i];
        }else{
            this._serverId[key] = list[i];
        }
    }
};

/**
 * Handle untagged ENABLED response.
 *
 * @param {Array} list Params
 */
IMAPClient.prototype._handlerUntaggedEnabled = function(list){
    list = [].concat(list || []);

    if(list[0] == "CONDSTORE"){
        this._condstoreEnabled = true;
    }

};

/**
 * Handle untagged SPECIAL-USE LIST and XLIST responses, for mailbox data.
 * Store mailbox info into _mailboxList property.
 *
 * @param {Array} list Params for LIST
 */
IMAPClient.prototype._handlerUntaggedList = function(list){
    var tags = list.shift() || [],
        delimiter = list.shift() || this._mailboxDelimiter,
        path = (list.shift() || "").substr(this._rootPath.length),
        name = delimiter?path.split(delimiter).pop():path,
        mailbox = {
            name: this._convertFromUTF7(name),
            delimiter: delimiter,
            path: path,
            tags: tags
        };

    this._mailboxDelimiter = delimiter;

    this._mailboxList.push(mailbox);
};

/**
 * Handle untagged LSUB responses, for mailbox data. Store mailbox
 * info into _mailboxList property.
 *
 * @param {Array} list Params for LIST
 */
IMAPClient.prototype._handlerUntaggedLsub = function(list){
    var tags = list.shift() || [],
        delimiter = list.shift() || this._mailboxDelimiter,
        path = (list.shift() || "").substr(this._rootPath.length),
        name = delimiter?path.split(delimiter).pop():path,
        mailbox = new Mailbox({
            client: this,
            path: path,
            name: this._convertFromUTF7(name),
            delimiter: delimiter
        });

    if(tags.indexOf("\\HasChildren")>=0){
        mailbox.hasChildren = true;
    }

    if(name == "INBOX"){
        mailbox.type="Inbox";
    }

    this._mailboxList.push(mailbox);
};

/**
 * Handle untagged IDLE, this means that idle mode has been entered.
 */
IMAPClient.prototype._handlerUntaggedIdle = function(){
    this._idleWait = false;
    this.idling = true;
    if(this._shouldCheckOnIdle){
        this._shouldCheckOnIdle = false;
        this._checkNewMail();
    }
    this._processCommandQueue();
};

/**
 * Handle untagged FETCH responses, these have data about individual messages.
 *
 * @param {Array} list Params about a message
 */
IMAPClient.prototype._handlerUntaggedFetch = function(list){
    var envelope = (list || [])[3] || [],
        envelopeData = this._formatEnvelope(envelope),
        nextUID = Number(this._selectedMailbox.UIDNext) || 0,
        currentUID = Number(envelopeData.UID) || 0;

    if(!nextUID || nextUID <= currentUID){
        this._selectedMailbox.UIDNext = currentUID + 1;
    }

    if(this._collectMailList){
        this._mailList.push(envelopeData);
    }

    // emit as new message
    if(nextUID && nextUID <= currentUID && this._checkForNewMail){
        this.emit("new", envelopeData);
    }
};

/**
 * Handle untagged SERACH responses, this is a list of seq or uid values
 *
 * @param {Array} list Params about a message
 */
IMAPClient.prototype._handlerUntaggedSearch = function(list){
    if(this._collectMailList){
        this._mailList = this._mailList.concat(list.map(Number));
    }
};

/**
 * Timeout function for idle mode - if sufficient time has passed, break the
 * idle and run NOOP. After this, re-enter IDLE
 */
IMAPClient.prototype._idleTimeout = function(){
    this._send("NOOP", this.idle.bind(this));
};

// STATE RELATED HANDLERS

/**
 * Run after CAPABILITY response is received. If in PREAUTH state, initiate login,
 * if in AUTH mode, run _postAuth
 */
IMAPClient.prototype._postCapability = function(){
    if(this._currentState == this.states.PREAUTH){
        this._updatedCapabilities = false;

        if(this._capabilities.indexOf("AUTH=XOAUTH2")>=0 && this._xoauth2){
            this._xoauth2.getToken((function(err, token){
                var error;

                if(err){
                    if(typeof err != "object"){
                        error = new Error(err.toString());
                    }else{
                       error = err;
                    }
                    error.errorType = "AuthenticationError";
                    error.errorLog = this._log.slice(0, this._logLength);
                    this.emit("error", error);
                    return;
                }
                this._send("AUTHENTICATE XOAUTH2 " + token,
                     this._handlerTaggedLogin.bind(this), (function(){
                        this._xoauth2UntaggedResponse = false;
                        this._literalHandler = (function(message){

                            this._xoauth2UntaggedResponse = true;

                            message = (Array.isArray(message) && message[0] || message || "").toString().trim();
                            var data;
                            try{
                                data = JSON.parse(new Buffer(message, "base64").toString("utf-8"));
                            }catch(E){
                                data = {
                                    status: 500,
                                    error: E.message
                                };
                            }

                            if(['400', '401'].indexOf((data.status || "").toString().trim())>=0){
                                this._xoauth2RetryCount = (this._xoauth2RetryCount || 0) + 1;
                            }

                            this._connection.write("\r\n");
                            if(this.debug){
                                console.log("CLIENT:");
                            }
                        }).bind(this);
                     }).bind(this));
            }).bind(this));
        }else if(this._capabilities.indexOf("AUTH=XOAUTH")>=0 && this.options.auth.XOAuthToken){
            if(typeof this.options.auth.XOAuthToken == "object"){
                this._send("AUTHENTICATE XOAUTH " + this.options.auth.XOAuthToken.generate(),
                     this._handlerTaggedLogin.bind(this));
            }else{
                this._send("AUTHENTICATE XOAUTH "+(this.options.auth.XOAuthToken || "").toString(),
                     this._handlerTaggedLogin.bind(this));
            }
        }else{
            this._send("LOGIN "+this._escapeString(this.options.auth.user)+" "+
                this._escapeString(this.options.auth.pass), this._handlerTaggedLogin.bind(this));
        }
    }else if(this._currentState == this.states.AUTH){
        this._postAuth();
    }else{
        throw new Error("Unhandled event state");
    }
};

/**
 * Run when user is successfully entered AUTH state
 */
IMAPClient.prototype._postAuth = function(){
    if(this._capabilities.indexOf("CONDSTORE")>=0){
        this._send("ENABLE CONDSTORE", this._handlerTaggedCondstore.bind(this));
    }else{
        this._handlerTaggedCondstore("OK");
    }
};

/**
 * Run it when all the required jobs for setting up an authorized connection
 * are completed. Emit 'connect' event.
 *
 * @param {Object} err Error object, if an error appeared
 */
IMAPClient.prototype._postReady = function(err){
    if(err){
        this.emit("error", err);
    }else{
        this.emit("connect");
    }
};

// HELPER FUNNCTIONS

/**
 * Escapes a string and encloses it with double quotes.
 *
 * @param {String} str String to escape
 */
IMAPClient.prototype._escapeString = function(str){
    return "\"" + (str || "").toString().replace(/(["\\])/g, "\\$1").replace(/[\r\n]/g, " ") + "\"";
};

/**
 * Format envelope object from (FLAGS ENVELOPE) response object
 *
 * @param {Array} envelopeData An array with FLAGS and ENVELOPE response data
 * @return {Object} structured envelope data
 */
IMAPClient.prototype._formatEnvelope = function(envelopeData){
    if(!Array.isArray(envelopeData)){
        return null;
    }

    var dataObject = {}, lastKey = false, i, len;

    for(i=0, len = envelopeData.length; i<len; i++){
        if(!lastKey){
            lastKey = (envelopeData[i] && envelopeData[i].value || envelopeData[i] || "").toString();
        }else{
            dataObject[lastKey] = envelopeData[i];
            lastKey = false;
        }
    }

    var message = {
        UIDValidity: this._selectedMailbox.UIDValidity,
        path: this._selectedMailbox.path
    };

    if(dataObject.UID){
        message.UID = Number(dataObject.UID) || 0;
    }

    if(dataObject.FLAGS){
        message.flags = dataObject.FLAGS || [];
    }

    if(dataObject["X-GM-THRID"]){
        message.xGMThreadId = dataObject["X-GM-THRID"];
    }

    if(dataObject.MODSEQ){
        message.modSeq = Number(dataObject.MODSEQ);
    }

    if(dataObject["BODYSTRUCTURE"]){
        message.bodystructure = this._parseBodystructure(dataObject["BODYSTRUCTURE"]);
    }

    var messageTypes = [],
        messageTypeMap = {
            "Drafts": "Draft",
            "Flagged": "Starred",
            "Spam": "Junk"
        },
        messageTypePreferenceOrder = ["Sent", "Draft", "Starred", "Junk", "Trash"];

    if(dataObject["X-GM-LABELS"]){
        message.folders = (dataObject["X-GM-LABELS"] || []).map((function(label){
            var type;

            if(label && typeof label == "object" && label.params){
                label = label.params.map((function(localLabel){
                    localLabel = this._convertFromUTF7(localLabel || "");
                    messageTypes.push(localLabel);
                    return localLabel;
                }).bind(this)).join(this._mailboxDelimiter);
            }

            label = this._convertFromUTF7(label || "");

            // trim delimiters
            if(label.charAt(0) == this._mailboxDelimiter){
                label = label.substr(1);
            }
            if(label.charAt(label.length-1) == this._mailboxDelimiter){
                label = label.substr(0, label.length-1);
            }

            if(label.search(this._mailboxDelimiter) > 0){ // ignore the first char
                return label.split(this._mailboxDelimiter).map(function(localLabel){
                    var localType;
                    if((localType = detectMailboxType(localLabel)) != "Normal"){
                        messageTypes.push(localType);
                        return localLabel;
                    }else{
                        return localLabel;
                    }
                });
            }

            // Convert name to canonized version
            if((type = detectMailboxType(label)) != "Normal"){
                // Add flag indicator
                messageTypes.push(type);
                return type;
            }

            // Convert tags to names
            if(label.charAt(0)=="\\" && label != "\\Important"){
                label = label.substr(1);
                messageTypes.push(label);
            }

            return label;
        }).bind(this));
    }else{
        message.folders = (this._selectedMailbox.path || "").split(this._mailboxDelimiter) || [];
        if(message.folders.length > 1){
            message.folders = [message.folders];
        }else if(message.folders.length){
            message.folders = [message.folders[0]];
        }

        if(message.folders.length){
            [].concat(message.folders[0]).forEach((function(localLabel){
                var type;
                if((type = detectMailboxType(localLabel)) != "Normal"){
                    // Add flag indicator
                    messageTypes.push(type);
                }
            }).bind(this));
        }
    }

    // remove duplicates
    if(message.folders){
        var folderList = [];
        for(i=0, len=message.folders.length; i<len; i++){
            if((folderList.indexOf(message.folders[i]) < 0) && (message.folders[i] != "\\Important")){
                folderList.push(message.folders[i]);
            }
        }
        message.folders = folderList;

        if(!dataObject["X-GM-LABELS"] && !message.folders.length){
            message.folders = ["Inbox"];
        }
    }

    messageTypes = messageTypes.map(function(type){
        return messageTypeMap[type] || type;
    });

    messageTypes.sort(function(a, b){
        a = messageTypePreferenceOrder.indexOf(a);
        b = messageTypePreferenceOrder.indexOf(b);
        if(a<0){
            return 1;
        }
        if(b<0){
            return -1;
        }
        return a - b;
    });

    message.type = messageTypes.length && messageTypePreferenceOrder.indexOf(messageTypes[0])>=0 && messageTypes[0] || "Normal";
    if(message.type == "Normal" && message.flags && message.flags.indexOf("\\Flagged")>=0){
        message.type = "Starred";
    }

    if(dataObject.ENVELOPE){
        message.date = new Date(dataObject.ENVELOPE[0] || Date.now());

        message.title = (dataObject.ENVELOPE[1] || "").toString().
            replace(/\=\?[^?]+\?[QqBb]\?[^?]+\?=/g,
                function(mimeWord){
                    return mimelib.decodeMimeWord(mimeWord);
                });
        if(dataObject.ENVELOPE[2] && dataObject.ENVELOPE[2].length){
            message.from = dataObject.ENVELOPE[2].map(this._formatEnvelopeAddress);
            if(message.from.length == 1){
                message.from = message.from[0];
            }
        }

        if(dataObject.ENVELOPE[5] && dataObject.ENVELOPE[5].length){
            message.to = dataObject.ENVELOPE[5].map(this._formatEnvelopeAddress);
        }
        if(dataObject.ENVELOPE[6] && dataObject.ENVELOPE[6].length){
            message.cc = dataObject.ENVELOPE[6].map(this._formatEnvelopeAddress);
        }

        if(dataObject.ENVELOPE[8] && dataObject.ENVELOPE[8].length){
            message.inReplyTo = (dataObject.ENVELOPE[8] || "").toString().replace(/\s/g,"");
        }

        message.messageId = (dataObject.ENVELOPE[9] || "").toString().toString().replace(/\s/g,"");
    }

    return message;
};

/**
 * Formats an IMAP ENVELOPE address in simpler {name, address} format
 *
 * @param {Array} address IMAP ENVELOPE address array [name, smtp route, user, domain]
 * @return {Object} simple {name, address} format
 */
IMAPClient.prototype._formatEnvelopeAddress = function(address){
    var name = address[0],
        email = (address[2] || "") + "@" + (address[3] || "");

    if(email == "@"){
        email = "";
    }

    return {
        name: (name || email).replace(/\=\?[^?]+\?[QqBb]\?[^?]+\?=/g,
                function(mimeWord){
                    return mimelib.decodeMimeWord(mimeWord);
                }),
        address: email
    };
};

/**
 * Parses bodystructure of an IMAP message according to http://tools.ietf.org/html/rfc3501#section-7.4.2
 * parsed bodystructures will look something like this
 * {
 *     'type': 'multipart/mixed',
 *     1: {
 *         'type': 'multipart/alternative',
 *         1: {
 *             'type': 'text/plain',
 *             params: {
 *                 'charset': 'utf-8'
 *             },
 *             encoding: '7bit',
 *             size: 50,
 *             lines: 10,
 *         },
 *         2: {
 *             'type': 'text/html',
 *             params: {
 *                 'charset': 'utf-8'
 *             },
 *             encoding: '7bit',
 *             size: 158,
 *         }
 *     },
 *     2: {
 *         'type': 'application/octet-stream',
 *         params: {
 *             'name': 'foobar.md'
 *         },
 *         encoding: 'base64',
 *         size: 286,
 *         disposition: [{
 *             'attachment': {
 *                 'filename': 'foobar.md'
 *             }
 *         }]
 *     }
 * }
 * 
 * @param {Array} bs Array containing the raw bodystructure array
 * @return {Object} Parsed bodystructure, see comment below
 */
IMAPClient.prototype._parseBodystructure = function(bs, parentBodypart) {
    var self = this;

    if (typeof bs === 'string') {
        // type information for multipart/alternative or multipart/mixed
        return 'multipart/' + bs.toLowerCase();
    }

    if (!Array.isArray(bs)) {
        // if it is not the information on which type of multipart/*
        // we've got here, or an array containing valuable information, 
        // it is just imap noise
        return;
    }

    if (!Array.isArray(bs[0]) && typeof bs[0] === 'string' && bs.length >= 10) {
        // we've got a single part, usually a text/plain, text/html or attachment part
        var dispositionIndex = 8,
            currentPart = {}, type, subtype;

        currentPart.part = parentBodypart || '1';
        type = bs[0].toLowerCase();
        subtype = bs[1].toLowerCase();
        currentPart.type = type + '/' + subtype;
        currentPart.parameters = {};
        if (bs[2]) {
            // the parameters are a key/value list
            var parametersIndex = 0;
            while(parametersIndex < bs[2].length) {
                currentPart.parameters[bs[2][parametersIndex].toLowerCase()] = bs[2][parametersIndex + 1].toLowerCase();
                parametersIndex += 2;
            }
        }
        currentPart.encoding = bs[5].toLowerCase();
        currentPart.size = parseInt(bs[6], 10);

        if (type === 'message' && subtype === 'rfc822') {
            // parsing of envelope and body structure information for message/rfc882 mails is not supported,
            // because there are IMAP servers which violate rfc 3501 for message/rfc882, for example gmail.
            return currentPart;
        }

        if (type === 'text') {
            // text/* body parts have an additional field for the body size in lines in its content transfer encoding.
            currentPart.lines = parseInt(bs[7], 10);
            dispositionIndex = 9;
        }

        if (bs[dispositionIndex]) {
            currentPart.disposition = [];
            if (Array.isArray(bs[dispositionIndex][0])) {
                bs[dispositionIndex].forEach(function(rawAttachment){
                    if (!rawAttachment) {
                        return;
                    }

                    currentPart.disposition.push(parseAttachment(rawAttachment));
                });
            } else {
                currentPart.disposition.push(parseAttachment(bs[dispositionIndex]));
            }
        }
        
        return currentPart;
    }

    if (Array.isArray(bs[0])) {
        // we have got a multipart/* message
        var bodypartsCounter = 1, parsedBodystructure = {},
            parsedPart, partIdentifier;

        bs.forEach(function(rawPart) {
            partIdentifier = (parentBodypart ? (parentBodypart + '.') : '') + bodypartsCounter;
            parsedPart = self._parseBodystructure(rawPart, partIdentifier);
            if (typeof parsedPart === 'string') {
                parsedBodystructure.type = parsedPart;
            } else if (typeof parsedPart === 'object') {
                parsedBodystructure[bodypartsCounter] = parsedPart;
                bodypartsCounter++;
            }
        });

        return parsedBodystructure;
    }

    // helper function to parse attachments
    function parseAttachment(rawAttachment) {
        var parsedAttachment = {};

        parsedAttachment.type = rawAttachment[0].toLowerCase();
        if (rawAttachment[1]) {
            // attachment filename, not present in inline attachments
            parsedAttachment[rawAttachment[1][0].toLowerCase()] = rawAttachment[1][1];
        }

        return parsedAttachment;
    }
};

/**
 * Convert from IMAP UTF7 to UTF-8 - useful for mailbox names
 */
IMAPClient.prototype._convertFromUTF7 = function(str){
    return utf7.decode(str);
};

/**
 * Check for new mail, since the last known UID
 */
IMAPClient.prototype._checkNewMail = function(){
    if(isNaN(this._selectedMailbox.UIDNext)){
        return;
    }

    this._send("UID FETCH " + this._selectedMailbox.UIDNext + ":* (UID BODYSTRUCTURE FLAGS ENVELOPE" +
      (this._capabilities.indexOf("X-GM-EXT-1") >= 0 ? " X-GM-LABELS X-GM-THRID" : "") +
      (this._capabilities.indexOf("CONDSTORE") >= 0 ? " MODSEQ" : "") +
      ")", (function(){
        this._checkForNewMail = false;
    }).bind(this),
    (function(){
        this._checkForNewMail = true;
    }).bind(this));
};

// PUBLIC API

/**
 * Lists root mailboxes
 *
 * @param {Function} callback Callback function to run with the mailbox list
 */
IMAPClient.prototype.listMailboxes = function(callback){
    this._rootMailbox.listChildren(callback);
};

/**
 * Opens a selected mailbox. This is needed before you can open any message.
 *
 * @param {String} path Mailbox full path, ie "INBOX/Sent Items"
 * @param {Object} [options] Optional options object
 * @param {Boolean} [options.readOnly] If set to true, open the mailbox in read-only mode (seen/unseen flags won't be touched)
 * @param {Function} callback Callback function to run when the mailbox is opened
 */
IMAPClient.prototype.openMailbox = function(path, options, callback){
    var command = "SELECT";

    if(typeof options == "function" && !callback){
        callback = options;
        options = undefined;
    }

    options = options || {};

    if(options.readOnly){
        command = "EXAMINE";
    }

    if(typeof path == "object"){
        path = path.path;
    }

    if(!path){
        return callback(new Error("Invalid or missing mailbox path provided"));
    }

    this._selectedMailbox = {
        path: path
    };

    this._send(command + " " + this._escapeString(path)+(
        this._condstoreEnabled?" (CONDSTORE)":""
      ), this._handlerTaggedSelect.bind(this, callback));
};

/**
 * Returns the current mailbox data object
 *
 * @return {Object} Information about currently selected mailbox
 */
IMAPClient.prototype.getCurrentMailbox = function(){
    return this._selectedMailbox;
};

/**
 * Lists message envelopes for selected range. Negative numbers can be used to
 * count from the end of the list (most recent messages).
 *
 * @param {Number} from List from position (0 based)
 * @param {Number} limit How many messages to fetch, defaults to all from selected position
 * @param {String} [extendedOptions] Additional string to add to the FETCH query
 * @param {Function} callback Callback function to run with the listed envelopes
 */
IMAPClient.prototype.listMessages = function(from, limit, extendedOptions, callback){
    var to;

    from = Number(from) || 0;

    if(typeof extendedOptions == "function" && !callback){
        callback = extendedOptions;
        extendedOptions = undefined;
    }

    if(typeof limit == "function" && !callback){
        callback = limit;
        limit = undefined;
    }

    extendedOptions = extendedOptions || "";
    limit = Number(limit) || 0;

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    // Nothing to retrieve
    if(!this._selectedMailbox.count){
        return callback(null, []);
    }

    if(from < 0){
        from = this._selectedMailbox.count + from;
    }

    if(from < 0){
        from = 0;
    }

    if(limit){
        to = from + limit;
    }else{
        to = "*";
    }

    from++;

    this._collectMailList = true;
    this._mailList = [];

    this._send(
      "FETCH " + from + ":" + to +
      " (UID BODYSTRUCTURE FLAGS ENVELOPE" +
      (this._capabilities.indexOf("X-GM-EXT-1")>=0?" X-GM-LABELS X-GM-THRID":"") +
      (this._capabilities.indexOf("CONDSTORE") >= 0 ? " MODSEQ" : "") +
      ")" +
      (extendedOptions ? " "+extendedOptions : ""), (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(status == "OK"){
            callback(null, this._mailList);
        }else{
            callback(new Error("Error fetching list"));
        }
    }).bind(this));
};

/**
 * Lists message envelopes for selected range. Similar to listMessages but uses UID values
 *
 * @param {Number} from First UID value
 * @param {Number} to Last UID value or "*"
 * @param {String} [extendedOptions] Additional string to add to the FETCH query
 * @param {Function} callback Callback function to run with the listed envelopes
 */
IMAPClient.prototype.listMessagesByUID = function(from, to, extendedOptions, callback){
    var to;

    from = Number(from) || 0;

    if(typeof extendedOptions == "function" && !callback){
        callback = extendedOptions;
        extendedOptions = undefined;
    }

    if(typeof to == "function" && !callback){
        callback = to;
        to = undefined;
    }

    extendedOptions = extendedOptions || "";
    to = Number(to) || "*";

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    // Nothing to retrieve
    if(!this._selectedMailbox.count){
        return callback(null, []);
    }

    this._collectMailList = true;
    this._mailList = [];

    this._send(
      "UID FETCH " + from + ":" + to +
      " (UID BODYSTRUCTURE FLAGS ENVELOPE" +
      (this._capabilities.indexOf("X-GM-EXT-1")>=0?" X-GM-LABELS X-GM-THRID":"") +
      (this._capabilities.indexOf("CONDSTORE") >= 0 ? " MODSEQ" : "") +
      ")" +
      (extendedOptions ? " "+extendedOptions : ""), (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(status == "OK"){
            callback(null, this._mailList);
        }else{
            callback(new Error("Error fetching list"));
        }
    }).bind(this));
};

/**
 * Lists flags for selected range. Negative numbers can be used to
 * count from the end of the list (most recent messages).
 *
 * @param {Number} from List from position (0 based)
 * @param {Number} limit How many messages to fetch, defaults to all from selected position
 * @param {Function} callback Callback function to run with the listed envelopes
 */
IMAPClient.prototype.listFlags = function(from, limit, callback){
    var to;

    from = Number(from) || 0;

    if(typeof limit == "function" && !callback){
        callback = limit;
        limit = undefined;
    }

    limit = Number(limit) || 0;

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    if(from < 0){
        from = this._selectedMailbox.count + from;
    }

    if(from < 0){
        from = 0;
    }

    if(limit){
        to = from + limit;
    }else{
        to = "*";
    }

    from++;

    this._collectMailList = true;
    this._mailList = [];
    this._send("FETCH " + from + ":" + to + " (UID FLAGS)", (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(status == "OK"){
            callback(null, this._mailList);
        }else{
            callback(new Error("Error fetching list"));
        }
    }).bind(this));
};

/**
 * Updates flags for selected message
 *
 * @param {String} uid Message identifier
 * @param {Array} flags Flags to set for a message
 * @param {String} [updateType=""] If empty, replace flags; + add flag; - remove flag
 * @param {Function} callback Callback function to run, returns an array of flags
 */
IMAPClient.prototype.updateFlags = function(uid, flags, updateType, callback){
    flags = [].concat(flags || []);

    if(!callback && typeof updateType == "function"){
        callback = updateType;
        updateType = undefined;
    }

    updateType = (updateType || "").toString().trim();

    if(!uid){
        if(typeof callback == "function"){
            callback(new Error("Invalid UID value"));
        }
        return;
    }

    if(!Array.isArray(flags)){
        if(typeof callback == "function"){
            callback(new Error("Invalid flags value"));
        }
        return;
    }

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    this._send("UID STORE "+uid+" "+updateType+"FLAGS (" + flags.join(" ") + ")",
      (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(typeof callback == "function"){
            if(status == "OK"){
                if(!this._mailList.length){
                    callback(null, true);
                }else{
                    callback(null, this._mailList[0].flags || []);
                }
            }else{
                callback(new Error("Error setting flags"));
            }
        }

    }).bind(this),
    (function(){
        this._collectMailList = true;
        this._mailList = [];
    }).bind(this));
};

/**
 * Add flags for selected message
 *
 * @param {String} uid Message identifier
 * @param {Array} flags Flags to set for a message
 * @param {Function} callback Callback function to run, returns an array of flags
 */
IMAPClient.prototype.addFlags = function(uid, flags, callback){
    flags = [].concat(flags || []);
    this.updateFlags(uid, flags, "+", callback);
};

/**
 * Removes flags for selected message
 *
 * @param {String} uid Message identifier
 * @param {Array} flags Flags to remove from a message
 * @param {Function} callback Callback function to run, returns an array of flags
 */
IMAPClient.prototype.removeFlags = function(uid, flags, callback){
    flags = [].concat(flags || []);
    this.updateFlags(uid, flags, "-", callback);
};

/**
 * Updates labels for selected message
 *
 * @param {String} uid Message identifier
 * @param {Array} labels Labels to set for a message
 * @param {String} [updateType=""] If empty, replace labels; + add label; - remove label
 * @param {Function} callback Callback function to run, returns an array of labels
 */
IMAPClient.prototype.updateLabels = function(uid, labels, updateType, callback){
    labels = [].concat(labels || []);

    if(!callback && typeof updateType == "function"){
        callback = updateType;
        updateType = undefined;
    }

    updateType = (updateType || "").toString().trim();

    if(!uid){
        if(typeof callback == "function"){
            callback(new Error("Invalid UID value"));
        }
        return;
    }

    if(!Array.isArray(labels)){
        if(typeof callback == "function"){
            callback(new Error("Invalid labels value"));
        }
        return;
    }

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    this._send("UID STORE "+uid+" "+updateType+"X-GM-LABELS (" + labels.join(" ") + ")",
      (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(typeof callback == "function"){
            if(status == "OK"){
                if(!this._mailList.length){
                    callback(null, true);
                }else{
                    callback(null, this._mailList[0].labels || []);
                }
            }else{
                callback(new Error("Error setting labels"));
            }
        }

    }).bind(this),
    (function(){
        this._collectMailList = true;
        this._mailList = [];
    }).bind(this));
};

/**
 * Add labels for selected message
 *
 * @param {String} uid Message identifier
 * @param {Array} labels Labels to set for a message
 * @param {Function} callback Callback function to run, returns an array of labels
 */
IMAPClient.prototype.addLabels = function(uid, labels, callback){
    labels = [].concat(labels || []);
    this.updateLabels(uid, labels, "+", callback);
};

/**
 * Removes labels for selected message
 *
 * @param {String} uid Message identifier
 * @param {Array} labels Labels to remove from a message
 * @param {Function} callback Callback function to run, returns an array of labels
 */
IMAPClient.prototype.removeLabels = function(uid, labels, callback){
    labels = [].concat(labels || []);
    this.updateLabels(uid, labels, "-", callback);
};

/**
 * Fetches flags for selected message
 *
 * @param {Number} uid Message identifier
 * @param {Function} callback Callback function to run with the flags array
 */
IMAPClient.prototype.fetchFlags = function(uid, callback){
    uid = Number(uid) || 0;

    if(!uid){
        if(typeof callback == "function"){
            callback(new Error("Invalid UID value"));
        }
        return;
    }

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    this._send("UID FETCH " + uid + " (UID FLAGS)", (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(typeof callback == "function"){
            if(status == "OK"){
                if(!this._mailList.length){
                    callback(null, null);
                }else{
                    callback(null, this._mailList[0].flags || []);
                }
            }else{
                callback(new Error("Error fetching message flags"));
            }
        }

    }).bind(this),
    (function(){
        this._collectMailList = true;
        this._mailList = [];
    }).bind(this));
};

/**
 * Fetches envelope object for selected message
 *
 * @param {Number} uid Message identifier
 * @param {Function} callback Callback function to run with the envelope object
 */
IMAPClient.prototype.fetchData = function(uid, callback){
    uid = Number(uid) || 0;

    if(!uid){
        if(typeof callback == "function"){
            callback(new Error("Invalid UID value"));
        }
        return;
    }

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    this._send("UID FETCH " + uid + " (UID FLAGS ENVELOPE" +
      (this._capabilities.indexOf("X-GM-EXT-1")>=0?" X-GM-LABELS X-GM-THRID":"") +
      (this._capabilities.indexOf("CONDSTORE") >= 0 ? " MODSEQ" : "") +
      ")", (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(typeof callback == "function"){
            if(status == "OK"){
                if(!this._mailList.length){
                    callback(null, null);
                }else{
                    callback(null, this._mailList[0]);
                }
            }else{
                callback(new Error("Error fetching message data"));
            }
        }

    }).bind(this),
    (function(){
        this._collectMailList = true;
        this._mailList = [];
    }).bind(this));
};

/**
 * Creates a Readable Stream for a selected message.
 *
 * @param {Number} uid Message identifier
 */
IMAPClient.prototype.createMessageStream = function(uid){
    var stream = new Stream();

    uid = Number(uid) || 0;

    if(!uid){
        process.nextTick(this.emit.bind(this, new Error("Invalid UID value")));
        return;
    }

    if(this._currentState != this.states.SELECTED){
        process.nextTick(this.emit.bind(this, new Error("No inbox selected")));
        return;
    }

    this._send("UID FETCH " + uid + " BODY.PEEK[]", (function(status){
        this._collectMailList = false;
        this._literalStreaming = false;

        if(!this._mailList.length){
            if(status == "OK"){
                stream.emit("error", new Error("Selected message not found: "+uid+"; "+this.port+"; "+this.host+"; "+JSON.stringify(this._selectedMailbox)));
            }else{
                stream.emit("error", new Error("Error fetching message: "+uid+"; "+this.port+"; "+this.host+"; "+JSON.stringify(this._selectedMailbox)));
            }
        }

        this._messageStream.emit("end");
        this._messageStream.removeAllListeners();

        this._messageStream = null;

    }).bind(this),
    (function(){
        this._collectMailList = true;
        this._literalStreaming = true;
        this._mailList = [];
        this._messageStream = stream;
    }).bind(this));

    return stream;
};

/**
 * Copy message from the active mailbox to the end of destination mailbox
 *
 * @param {Number} uid Message identifier
 * @param {String} destination Destination folder to copy the message to
 * @param {Function} callback Callback function to run after the copy succeeded or failed
 */
IMAPClient.prototype.copyMessage = function(uid, destination, callback){
    uid = Number(uid) || 0;

    if(!uid){
        if(typeof callback == "function"){
            callback(new Error("Invalid UID value"));
        }
        return;
    }

    if(this._currentState != this.states.SELECTED){
        if(typeof callback == "function"){
            callback(new Error("No mailbox selected"));
        }
        return;
    }

    this._send("UID COPY " + uid + " " + this._escapeString(destination), (function(status){
        if(status != "OK"){
            return callback(new Error("Error copying message"));
        }
        return callback(null, true);
    }).bind(this));
};

/**
 * Delete message from the active mailbox
 *
 * @param {Number} uid Message identifier
 * @param {Function} callback Callback function to run after the removal succeeded or failed
 */
IMAPClient.prototype.deleteMessage = function(uid, callback){
    uid = Number(uid) || 0;

    if(!uid){
        if(typeof callback == "function"){
            callback(new Error("Invalid UID value"));
        }
        return;
    }

    this.addFlags(uid, "\\Deleted", (function(error){
        if(error){
            return callback(error);
        }

        this._send("EXPUNGE", (function(status){
            if(status != "OK"){
                return callback(new Error("Error removing message"));
            }
            return callback(null, true);
        }).bind(this));

    }).bind(this));
};

/**
 * Move message from the active mailbox to the end of destination mailbox
 *
 * @param {Number} uid Message identifier
 * @param {String} destination Destination folder to move the message to
 * @param {Function} callback Callback function to run after the move succeeded or failed
 */
IMAPClient.prototype.moveMessage = function(uid, destination, callback){
    this.copyMessage(uid, destination, (function(error){
        if(error){
            return callback(error);
        }
        this.deleteMessage(uid, function(error){
            // we don't really care if the removal succeeded or not at this point
            return callback(null, !error);
        });
    }).bind(this));
};

/**
 * Upload a message to the mailbox
 *
 * This totally sucks but as the length of the message need to be known
 * beforehand, it is probably a good idea to include it in whole - easier
 * to implement and gives as total byte count
 */
IMAPClient.prototype.storeMessage = function(message, flags, callback){
    if(typeof flags == "function" && !callback){
        callback = flags;
        flags = undefined;
    }

    message = message || "";
    if(typeof message == "string"){
        message = new Buffer(message, "utf-8");
    }

    flags = [].concat(flags || []);
    this._send("APPEND " + this._escapeString(this._selectedMailbox.path) + (flags.length ? " (" + flags.join(" ")+")":"") + " {" + message.length+"}", (function(status, data){
        this._literalHandler = null;
        if(status == "OK"){
            this._shouldCheckOnIdle = true;

            // supports APPENDUID
            if(data && data[0] && data[0].params && data[0].params[0] == "APPENDUID"){
                return callback(null, {
                    UIDValidity: data[0].params[1] || "",
                    UID: data[0].params[2] || ""
                });
            }

            // Guess the values from mailbox data. Not sure if it really works :S
            return callback(null, {
                UIDValidity: this._selectedMailbox.UIDValidity,
                UID: this._selectedMailbox.UIDNext
            });
        }else{
            return callback(new Error("Error saving message to mailbox"));
        }
    }).bind(this), (function(){
        this._literalHandler = (function(){
            this._connection.write(message);
            this._connection.write("\r\n");
        }).bind(this);
    }).bind(this));
};

/**
 *
 */
IMAPClient.prototype.getMailbox = function(path, callback){
    this._rootMailbox.listChildren(path, function(error, mailboxes){
        if(error){
            callback(error);
        }else if(mailboxes && mailboxes.length){
            callback(null, mailboxes[0]);
        }else{
            callback(null, null);
        }
    });
};

/**
 * Enter IDLE mode
 */
IMAPClient.prototype.idle = function(){
    if(this._capabilities.indexOf("IDLE")>=0){
        this._send("IDLE", (function(){
            this.idling = false;
            this._idleEnd = false;
        }).bind(this), (function(){
            this._idleWait = true;
            this._idleEnd = false;
            this._idleTimer = setTimeout(this._idleTimeout.bind(this), this.IDLE_TIMEOUT);
        }).bind(this));
    }else{
        if(this.debug){
            console.log("WARNING: Server does not support IDLE, fallback to NOOP");
        }
        this._idleTimer = setTimeout((function(){
            this._send("NOOP", (function(){
                this.nooping = false;
            }).bind(this), (function(){
                this.nooping = true;
            }).bind(this));
        }).bind(this), this.IDLE_TIMEOUT);
    }
};

/**
 * Lists seq or uid values for a search. Query is an object where keys are query terms and
 * values are params. Use arrays for multiple terms or true for just the key.
 *
 * connection.search({new: true, header: ["subject", "test"]}, function(err, list))
 *
 * @param {Object} Search query
 * @param {Boolean} [isUID] If true perform an UID search
 * @param {Function} callback Callback function to run with the listed envelopes
 */
IMAPClient.prototype.search = function(query, isUid, callback){
    if(!callback && typeof isUid == "function"){
        callback = isUid;
        isUid = undefined;
    }

    var queryType = isUid ? "UID SEARCH" : "SEARCH",
        self = this,

        buildTerm = function(query){
            return Object.keys(query).map(function(key){
                var term = key.toUpperCase(),
                    params = [],
                    escapeDate = function(date){
                        return self._escapeString(date.toUTCString().replace(/^\w+, (\d+) (\w+) (\d+).*/, "$1-$2-$3"));
                    },
                    escapeParam = function(param){
                        var list = [];
                        if(typeof param == "number"){
                            list.push(String(param));
                        }else if(typeof param == "string"){
                            list.push(self._escapeString(param));
                        }else if(Object.prototype.toString.call(param) == "[object Date]"){
                            list.push(escapeDate(param));
                        }else if(Array.isArray(param)){
                            param.map(escapeParam).forEach(function(p){
                                if(typeof p == "string"){
                                    list.push(p);
                                }
                            });
                        }else if(typeof param == "object"){
                            return buildTerm(param);
                        }
                        return list.join(" ");
                    };

                [].concat(query[key] || []).forEach(function(param){
                    var param = escapeParam(param);
                    if(param){
                        params.push(param);
                    }
                });

                return term + (params.length ? " " + params.join(" ") : "");
            }).join(" ");
        },

        queryTerm = buildTerm(query);

    this._collectMailList = true;
    this._mailList = [];

    this._send(queryType + (queryTerm ? " " + queryTerm : ""), (function(status){
        this._collectMailList = false;

        if(typeof callback != "function"){
            return;
        }

        if(status == "OK"){
            callback(null, this._mailList.sort(function(a, b){return a-b;}));
        }else{
            callback(new Error("Error searching messages"));
        }
    }).bind(this));
};

/**
 * Closes the socket to the server
 * // FIXME - should LOGOUT first!
 */
IMAPClient.prototype._close = function(){
    if(!this._connection){
        return;
    }

    clearTimeout(this._shouldIdleTimer);
    clearTimeout(this._idleTimer);
    clearTimeout(this._greetingTimeout);

    var socket = this._connection.socket || this._connection;

    if(socket && !socket.destroyed){
        socket.destroy();
    }

    if(this.debug){
        console.log("Connection to server closed");
    }

    this._connection = false;
    this._commandQueue = [];
    this.emit("close");

    this.removeAllListeners();
};

// Calls LOGOUT
IMAPClient.prototype.close = function(){
    this._send("LOGOUT", (function (){
        this._close();
    }).bind(this));
};
