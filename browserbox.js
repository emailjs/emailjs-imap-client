/* jshint browser: true */
/* global define: false, imapHandler: false, mimefuncs: false */

// AMD shim
(function(root, factory) {

    "use strict";

    if (typeof define === "function" && define.amd) {
        define([
            "./bower_components/imapHandler/imapHandler",
            "./bower_components/mimefuncs/mimefuncs"
            ], factory);
    } else {
        root.browserbox = factory(imapHandler, mimefuncs);
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
     * @param {Object} [options.auth] Authentication options. Depends on the preferred authentication method. Usually {user, pass}
     * @param {String} [options.authMethod] Force specific authentication method
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
                window.log("SERVER: " + this._command + str.substr(0, match.index));
                window.log(imapHandler.parser(this._command + str.substr(0, match.index)));

                if(!window.logOutSent){
                    window.logOutSent = true;
                    var cmd = imapHandler.compiler({
                        tag: "A",
                        command: "LOGOUT"
                    });
                    window.log("CLIENT: " + cmd);
                    this.socket.send(mimefuncs.toArrayBuffer(cmd + "\r\n").buffer);
                }

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
                str = str.substr(this._literalRemaining);
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

    return function(host, port, options){
        return new IMAPClient(host, port, options);
    };
}));
