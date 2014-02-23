// Copyright (c) 2013 Andris Reinman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/* jshint browser: true */
/* global define: false, imapHandler: false */

// AMD shim
(function(root, factory) {

    "use strict";

    if (typeof define === "function" && define.amd) {
        define(["./bower_components/imapHandler/imapHandler"], factory);
    } else {
        root.browserbox = factory(imapHandler);
    }
}(this, function(imapHandler) {

    "use strict";

    /**
     * Creates a connection object to a IMAP server and allows to send mail through it.
     * Call `connect` method to inititate the actual connection, the constructor only
     * defines the properties but does not actually connect.
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
         * Downstream TCP socket to the IMAP server, created with mozTCPSocket
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
        // only mozTCPSocket exists currently but you'll never know when it's going to change
        var socket = navigator.TCPSocket || navigator.mozTCPSocket;

        this.socket = socket.open(this.host, this.port, {
            binaryType: "arraybuffer",
            useSSL: this._secureMode
        });

        this.socket.onerror = this._onError.bind(this);
        this.socket.onopen = this._onOpen.bind(this);
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
    }

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

    /**
     * Connection listener that is run when the connection to the server is opened.
     * Sets up different event handlers for the opened socket
     *
     * @event
     * @param {Event} evt Event object. Not used
     */
    IMAPClient.prototype._onOpen = function(evt){
        this.socket.ondata = function(evt){
            console.log(evt);
            try{
                if(evt && evt.data && evt.data.byteLength){
                    var str = (new TextDecoder("utf-8")).decode(new Uint8Array(evt.data));
                    str = str.trim();
                    console.log(str);
                    window.log(imapHandler.parser(str, {allowUntagged: true}));
                }
            }catch(E){
                console.log(E.message);
            }
        }

        this.socket.onclose = this._onClose.bind(this);
        this.socket.ondrain = this._onDrain.bind(this);
    };

    return function(host, port, options){
        return new IMAPClient(host, port, options);
    };
}));
