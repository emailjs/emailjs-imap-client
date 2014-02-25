/* jshint browser: true */
/* global define: false, imapHandler: false, mimefuncs: false */

// AMD shim
(function(root, factory) {

    "use strict";

    if (typeof define === "function" && define.amd) {
        define([
            "../bower_components/imapHandler/imapHandler",
            "../bower_components/mimefuncs/mimefuncs"
            ], factory);
    } else {
        root.imap = factory(imapHandler, mimefuncs);
    }

}(this, function(imapHandler, mimefuncs) {

    "use strict";

    /**
     * Creates a connection object to an IMAP server. Call `connect` method to inititate
     * the actual connection, the constructor only defines the properties but does not actually connect.
     *
     * @constructor
     *
     * @param {String} [host="localhost"] Hostname to conenct to
     * @param {Number} [port=143] Port number to connect to
     * @param {Object} [options] Optional options object
     * @param {Boolean} [options.useSSL] Set to true, to use encrypted connection
     */
    function IMAPClient(host, port, options){

        this.options = options || {};

        this.port = port || (this.options.useSSL ? 993 : 143);
        this.host = host || "localhost";

        /**
         * If set to true, start an encrypted connection instead of the plaintext one
         * (recommended if applicable). If useSSL is not set but the port used is 993,
         * then ecryption is used by default.
         */
        this.options.useSSL = "useSSL" in this.options ? !!this.options.useSSL : this.port == 993;

        /**
         * Authentication object. If not set, authentication step will be skipped.
         */
        this.options.auth = this.options.auth || false;

        /**
         * Downstream TCP socket to the IMAP server, created with TCPSocket
         */
        this.socket = false;

        /**
         * Indicates if the connection has been closed and can't be used anymore
         *
         */
        this.destroyed = false;

        /**
         * Keeps track if the downstream socket is currently full and
         * a drain event should be waited for or not
         */
        this.waitDrain = false;

        // Private properties

        /**
         * If STARTTLS support lands in TCPSocket, _secureMode can be set to
         * true, once the connection is upgraded
         */
        this._secureMode = !!this.options.useSSL;

        this._remainder = "";
        this._command = "";
        this._literalRemaining = 0;

        this._processingServerData = false;
        this._serverQueue = [];

        this._canSend = false;
        this._clientQueue = [];

        this._tagCounter = 0;
        this._currentCommand = false;

        this._globalAcceptUntagged = {};
    }

    // Event functions should be overriden, these are just placeholders

    /**
     * Will be run when an error occurs. Connection to the server will be closed automatically,
     * so wait for an `onclose` event as well.
     *
     * @param {Error} err Error object
     */
    IMAPClient.prototype.onerror = function(err){};

    /**
     * More data can be buffered in the socket. See `waitDrain` property or
     * check if `send` method returns false to see if you should be waiting
     * for the drain event. Before sending anything else.
     */
    IMAPClient.prototype.ondrain = function(){};

    /**
     * The connection to the server has been closed
     */
    IMAPClient.prototype.onclose = function(){};

    IMAPClient.prototype.onlog = function(type, payload){};

    /**
     * Initiate a connection to the server
     */
    IMAPClient.prototype.connect = function(){
        this.socket = navigator.TCPSocket.open(this.host, this.port, {
            binaryType: "arraybuffer",
            useSSL: this._secureMode
        });

        this.socket.onerror = this._onError.bind(this);
        this.socket.onopen = this._onOpen.bind(this);
    };

    /**
     * Closes the connection to the server
     */
    IMAPClient.prototype.close = function(){
        if(this.socket && this.socket.readyState === "open"){
            this.socket.close();
        }else{
            this._destroy();
        }
    };

    /**
     * Error handler for the socket
     *
     * @event
     * @param {Event} evt Event object. See evt.data for the error
     */
    IMAPClient.prototype._onError = function(evt){
        if(this.isError(evt)){
            this.onerror(evt);
        }else if(evt && this.isError(evt.data)){
            this.onerror(evt.data);
        }else{
            this.onerror(new Error(evt && evt.data && evt.data.message || evt.data || evt || "Error"));
        }

        this.close();
    };

    IMAPClient.prototype.isError = function(value){
        return !!Object.prototype.toString.call(value).match(/Error\]$/);
    };

    /**
     * Ensures that the connection is closed and such
     */
    IMAPClient.prototype._destroy = function(){
        this._serverQueue = [];
        this._clientQueue = [];
        this._currentCommand = false;

        if(!this.destroyed){
            this.destroyed = true;
            this.onclose();
        }
    };

    /**
     * Indicates that the socket has been closed
     *
     * @event
     * @param {Event} evt Event object. Not used
     */
    IMAPClient.prototype._onClose = function(evt){
        this._destroy();
    };

    /**
     * More data can be buffered in the socket, `waitDrain` is reset to false
     *
     * @event
     * @param {Event} evt Event object. Not used
     */
    IMAPClient.prototype._onDrain = function(evt){
        this.waitDrain = false;
        this.ondrain();
    };

    IMAPClient.prototype._onData = function(evt){
        if(!evt || !evt.data){
            return;
        }

        var match,
            str = mimefuncs.fromArrayBuffer(evt.data);

        this.onlog("raw", str);

        if(this._literalRemaining){
            if(this._literalRemaining > str.length){
                this._literalRemaining -= str.length;
                this._command += str;
                return;
            }
            this._command += str.substr(0, this._literalRemaining);
            str = str.substr(this._literalRemaining);
            this._literalRemaining = 0;
        }
        str = this._remainder + str;
        while((match = str.match(/(\{(\d+)(\+)?\})?\r?\n/))){

            if(!match[2]){
                // Now we have a full command line, so lets do something with it
                this._addToServerQueue(this._command + str.substr(0, match.index));

                this._remainder = str = str.substr(match.index + match[0].length);
                this._command = "";
                continue;
            }

            this._remainder = "";

            this._command += str.substr(0, match.index + match[0].length);

            this._literalRemaining = Number(match[2]);

            str = str.substr(match.index + match[0].length);

            if(this._literalRemaining > str.length){
                this._command += str;
                this._literalRemaining -= str.length;
                return;
            }else{
                this._command += str.substr(0, this._literalRemaining);
                this._remainder = str = str.substr(this._literalRemaining);
                this._literalRemaining = 0;
            }
        }
    };

    /**
     * Connection listener that is run when the connection to the server is opened.
     * Sets up different event handlers for the opened socket
     *
     * @event
     * @param {Event} evt Event object. Not used
     */
    IMAPClient.prototype._onOpen = function(evt){
        this.socket.ondata = this._onData.bind(this);
        this.socket.onclose = this._onClose.bind(this);
        this.socket.ondrain = this._onDrain.bind(this);
    };

    IMAPClient.prototype._addToServerQueue = function(cmd){
        this._serverQueue.push(cmd);

        if(this._processingServerData){
            return;
        }

        this._processingServerData = true;
        this._processServerQueue();
    };

    IMAPClient.prototype._processServerQueue = function(){
        if(!this._serverQueue.length){
            this._processingServerData = false;
            this._canSend = true;
            this._sendRequest();
            return;
        }

        var data = this._serverQueue.shift(),
            response;

        this.onlog("server", data);

        try{
            response = imapHandler.parser(data);
        }catch(E){
            return this._onError(E);
        }

        if(response.tag == "*" &&
            /^\d+$/.test(response.command) &&
            response.attributes && response.attributes.length && response.attributes[0].type == "ATOM"){

            response.nr = Number(response.command);
            response.command = (response.attributes.shift().value || "").toString().toUpperCase().trim();
        }

        this._processServerResponse(response, (function(err){
            if(err){
                return this._onError(err);
            }
            setTimeout(this._processServerQueue.bind(this), 0);
        }).bind(this));
    };

    IMAPClient.prototype._processServerResponse = function(response, callback){
        var command = (response && response.command || "").toUpperCase().trim();

        this._processResponse(response);

        this.onlog("parsed", JSON.stringify(response, false, 4));

        if(!this._currentCommand){
            if(response.tag == "*" && command in this._globalAcceptUntagged){
                return this._globalAcceptUntagged[command](response, callback);
            }else{
                return callback();
            }
        }

        if(this._currentCommand.payload && response.tag == "*" && command in this._currentCommand.payload){

            this._currentCommand.payload[command].push(response);
            return callback();

        }else if(response.tag == "*" && command in this._globalAcceptUntagged){

            this._globalAcceptUntagged[command](response, callback);

        }else if(response.tag == this._currentCommand.tag){

            if(typeof this._currentCommand.callback == "function"){
                return this._currentCommand.callback(response, callback);
            }else{
                return callback();
            }

        }else{
            // Unexpected response
            return callback();
        }
    };

    IMAPClient.prototype._addToClientQueue = function(request, acceptUntagged, callback){
        var tag = "W" + (++this._tagCounter), data;

        if(!callback && typeof acceptUntagged == "function"){
            callback = acceptUntagged;
            acceptUntagged = undefined;
        }

        acceptUntagged = [].concat(acceptUntagged || []).map(function(untagged){
            return (untagged || "").toString().toUpperCase().trim();
        });

        request.tag = tag;

        data = {
            tag: tag,
            request: request,
            payload: acceptUntagged.length ? {} : undefined,
            callback: callback
        };

        acceptUntagged.forEach(function(command){
            data.payload[command] = [];
        });

        this._clientQueue.push(data);

        if(this._canSend){
            this._sendRequest();
        }
    };

    IMAPClient.prototype._sendRequest = function(){
        if(!this._clientQueue.length){
            return;
        }

        var data;

        this._canSend = false;
        this._currentCommand = this._clientQueue.shift();

        try{
            data = imapHandler.compiler(this._currentCommand.request);
        }catch(E){
            return this._onError(E);
        }

        this.onlog("client", data);
        this.socket.send(mimefuncs.toArrayBuffer(data + "\r\n").buffer);
    };

    // IMAP Response Codes
    // https://tools.ietf.org/html/rfc5530
    IMAPClient.prototype._processResponse = function(response){
        var command = (response && response.command || "").toString().toUpperCase().trim(),
            option,
            key;

        if(["OK", "NO", "BAD", "BYE", "PREAUTH"].indexOf(command) >= 0){
            // Check if the response includes an optional response code
            if(
                (option = response && response.attributes &&
                response.attributes.length && response.attributes[0].type == "ATOM" &&
                response.attributes[0].section && response.attributes[0].section.map(function(key){
                    if(!key){
                        return;
                    }
                    if(Array.isArray(key)){
                        return key.map(function(key){
                            return (key.value || "").toString().trim();
                        });
                    }else{
                        return (key.value || "").toString().toUpperCase().trim();
                    }
                }))){

                key = option && option.shift();

                response.code = key;

                if(option.length){
                    option = [].concat(option || []);
                    response[key.toLowerCase()] = option.length == 1 ? option[0] : option;
                }
            }

            // If last element of the response is TEXT then this is for humans
            if(response && response.attributes && response.attributes.length &&
                response.attributes[response.attributes.length - 1].type == "TEXT"){

                response.humanText = response.attributes[response.attributes.length - 1].value;
            }
        }
    }

    IMAPClient.prototype.exec = function(request, acceptUntagged, callback){
        if(typeof request == "string"){
            request = {command: request};
        }
        this._addToClientQueue(request, acceptUntagged, callback);
        return this;
    };

    IMAPClient.prototype.setHandler = function(command, callback){
        this._globalAcceptUntagged[(command || "").toString().toUpperCase().trim()] = callback;
    };

    return function(host, port, options){
        return new IMAPClient(host, port, options);
    };
}));
