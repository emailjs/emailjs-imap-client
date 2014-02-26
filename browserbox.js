/* jshint browser: true */
/* global define: false, imap: false */

// AMD shim
(function(root, factory) {

    "use strict";

    if (typeof define === "function" && define.amd) {
        define([
            "./lib/imap"
            ], factory);
    } else {
        root.browserbox = factory(imap);
    }

}(this, function(imap) {

    "use strict";

    function BrowserBox(host, port, options){
        this.options = options || {};
        this.client = imap(host, port);
        this.capabilites = [];

        this._established = false;

        this._init();
    }

    BrowserBox.prototype._init = function(){
        this.client.onlog = (function(type, payload){
            this.onlog(type, payload);
        }).bind(this);

        this.client.onerror = (function(err){
            this.onerror(err);
        }).bind(this);

        this.client.onclose = (function(){
            this.onclose();
        }).bind(this);

        this.client.onready = (function(){
            clearTimeout(this._connectionTimeout);

            this.onlog("session", "Connection established");

            if(!this.capabilites.length){
                this.exec("CAPABILITY");
            }

            if(this.options.auth){
                this.login();
            }else{
                this.exec("LOGOUT");
            }
        }).bind(this);

        this.client.setHandler("capability", function(response, next){
            this.capabilites = [].concat(response && response.attributes || []).map(function(capa){
                return (capa.value || "").toString().toUpperCase().trim();
            });

            next();
        });

        this.client.setHandler("ok", (function(response, next){
            this._processResponseCode(response);
            next();
        }).bind(this));

        this._connectionTimeout = setTimeout(this._timeout, 60 * 1000);
        setTimeout(this.client.connect.bind(this.client));
    };

    BrowserBox.prototype.onlog = function(){};
    BrowserBox.prototype.onerror = function(){};
    BrowserBox.prototype.onclose = function(){};

    BrowserBox.prototype._onClose = function(){
        this.onclose();
    };

    BrowserBox.prototype._timeout = (function(){
        this.onerror(new Error("Timeout creating connection to the IMAP server"));
        this.client._destroy();
    }).bind(this);

    BrowserBox.prototype._processResponseCode = function(response){
        if(response){
            if(response.capability){
                this.capabilites = response.capability;
            }

            if(response.code == "ALERT" && response.humanReadable){
                this.onlog("alert", response.humanReadable);
            }
        }
    };

    BrowserBox.prototype.login = function(){
        this.exec({
            command: "login",
            attributes: [this.options.auth.user, this.options.auth.pass]
        }, (function(err, response, next){
            if(err){
                this.onlog(err.code || "error", err.message);
                this.exec("LOGOUT");
            }else{
                this.
                    exec({command: "SELECT", attributes: ["INBOX"]}).
                    exec({command: "UID FETCH", attributes: [
                        {type: "SEQUENCE", value: "1:*"},
                        [
                            {type:"ATOM", value: "UID"},
                            {type:"ATOM", value: "ENVELOPE"}
                        ]
                    ]}).
                    exec("LOGOUT");
            }
            next();
        }).bind(this));
    };

    BrowserBox.prototype.exec = function(){
        var args = Array.prototype.slice.call(arguments),
            callback = args.pop();

        if(typeof callback != "function"){
            args.push(callback);
            callback = undefined;
        }

        args.push((function(response, next){
            var error = null;
            this._processResponseCode(response);
            if(["NO", "BAD"].indexOf((response && response.command || "").toString().toUpperCase().trim()) >= 0){
                error = new Error(response.humanReadable || "Error");
                if(response.code){
                    error.code = response.code;
                }
            }
            if(typeof callback == "function"){
                callback(error, response, next);
            }else{
                next();
            }
        }).bind(this));

        this.client.exec.apply(this.client, args);

        return this;
    };

    return function(host, port, options){
        return new BrowserBox(host, port, options);
    };
}));
