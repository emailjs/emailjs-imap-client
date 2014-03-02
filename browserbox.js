/* jshint browser: true */
/* global define: false, imap: false, specialUse: false */

// AMD shim
(function(root, factory) {

    "use strict";

    if (typeof define === "function" && define.amd) {
        define([
            "./lib/imap",
            "./lib/specialUse",
            "./bower_components/utf7/utf7"
            ], factory);
    } else {
        root.browserbox = factory(imap, specialUse);
    }

}(this, function(imap, specialUse, utf7) {

    "use strict";

    /**
     * High level IMAP client
     *
     * @constructor
     *
     * @param {String} [host="localhost"] Hostname to conenct to
     * @param {Number} [port=143] Port number to connect to
     * @param {Object} [options] Optional options object
     */
    function BrowserBox(host, port, options){

        this.options = options || {};

        /**
         * List of extensions the server supports
         */
        this.capability = [];

        /**
         * Server ID (rfc2971) as key value pairs
         */
        this.serverId = false;

        /**
         * Current state
         */
        this.state = false;

        /**
         * Is the connection authenticated
         */
        this.authenticated = false;

        /**
         * IMAP client object
         */
        this.client = imap(host, port);

        this._enteredIdle = false;
        this._idleTimeout = false;

        this._init();
    }

    // State constants

    BrowserBox.prototype.STATE_CONNECTING = 1;
    BrowserBox.prototype.STATE_NOT_AUTHENTICATED = 2;
    BrowserBox.prototype.STATE_AUTHENTICATED = 3;
    BrowserBox.prototype.STATE_SELECTED = 4;
    BrowserBox.prototype.STATE_LOGOUT = 5;

    // Timeout constants

    /**
     * How much time to wait for the greeting from the server until the connection is considered failed
     */
    BrowserBox.prototype.TIMEOUT_CONNECTION = 60 * 1000;

    /**
     * Time between NOOP commands while idling
     */
    BrowserBox.prototype.TIMEOUT_NOOP = 18 * 1000;

    /**
     * Time until IDLE command is cancelled
     */
    BrowserBox.prototype.TIMEOUT_IDLE = 18 * 1000;

    /**
     * Initialization method. Setup event handlers and such
     */
    BrowserBox.prototype._init = function(){
        this.client.onlog = (function(type, payload){
            this.onlog(type, payload);
        }).bind(this);

        // proxy error events
        this.client.onerror = (function(err){
            this.onerror(err);
        }).bind(this);

        // proxy close events
        this.client.onclose = (function(){
            clearTimeout(this._connectionTimeout);
            clearTimeout(this._idleTimeout);
            this.onclose();
        }).bind(this);

        // handle ready event which is fired when server has sent the greeting
        this.client.onready = this._onReady.bind(this);

        // start idling
        this.client.onidle = this._onIdle.bind(this);

        // set default handlers for untagged responses
        // capability updates
        this.client.setHandler("capability", this._untaggedCapabilityHandler.bind(this));
        // notifications
        this.client.setHandler("ok", this._untaggedOkHandler.bind(this));
        // message count has changed
        this.client.setHandler("exists", this._untaggedExistsHandler.bind(this));
        // message has been deleted
        this.client.setHandler("expunge", this._untaggedExpungeHandler.bind(this));
        // message has been updated (eg. flag change), not supported by gmail
        this.client.setHandler("fetch", this._untaggedFetchHandler.bind(this));
    };

    // Event placeholders
    BrowserBox.prototype.onlog = function(type, message){};
    BrowserBox.prototype.onclose = function(){};
    BrowserBox.prototype.onauth = function(){};
    /* BrowserBox.prototype.onerror = function(err){}; // not defined by default */

    // Event handlers

    /**
     * Connection to the server is closed. Proxies to 'onclose'.
     *
     * @event
     */
    BrowserBox.prototype._onClose = function(){
        this.onclose();
    };

    /**
     * Connection to the server was not established. Proxies to 'onerror'.
     *
     * @event
     */
    BrowserBox.prototype._onTimeout = (function(){
        this.onerror(new Error("Timeout creating connection to the IMAP server"));
        this.client._destroy();
    }).bind(this);

    /**
     * Connection to the server is established. Method performs initial
     * tasks like updating capabilities and authenticating the user
     *
     * @event
     */
    BrowserBox.prototype._onReady = function(){
        clearTimeout(this._connectionTimeout);
        this.onlog("session", "Connection established");
        this.state = this.STATE_NOT_AUTHENTICATED;

        this.updateCapability((function(){
            this.updateId(this.options.id, (function(){
                this.login(this.options.auth.user, this.options.auth.pass, (function(err){
                    if(err){
                        // emit an error
                        this.onerror(err);
                        this.close();
                        return;
                    }
                    // emit
                    this.onauth();
                }).bind(this));
            }).bind(this));
        }).bind(this));
    };

    /**
     * Indicates that the connection started idling. Initiates a cycle
     * of NOOPs or IDLEs to receive notifications about updates in the server
     */
    BrowserBox.prototype._onIdle = function(){
        if(!this.authenticated || this._enteredIdle){
            // No need to IDLE when not logged in or already idling
            return;
        }

        this.onlog("idle", "Started idling");
        this.enterIdle();
    };

    // Public methods

    /**
     * Initiate connection to the IMAP server
     */
    BrowserBox.prototype.connect = function(){
        this.state = this.STATE_CONNECTING;

        // set timeout to fail connection establishing
        clearTimeout(this._connectionTimeout);
        this._connectionTimeout = setTimeout(this._onTimeout, this.TIMEOUT_CONNECTION);
        this.client.connect();
    };

    /**
     * Close current connection
     */
    BrowserBox.prototype.close = function(callback){
        this.state = this.STATE_LOGOUT;

        this.exec("LOGOUT", function(err){
            if(typeof callback == "function"){
                callback(err || null);
            }
        });
    };

    /**
     * Run an IMAP command.
     *
     * @param {Object} request Structured request object
     * @param {Array} acceptUntagged a list of untagged responses that will be included in "payload" property
     * @param {Function} callback Callback function to run once the command has been processed
     */
    BrowserBox.prototype.exec = function(){
        var args = Array.prototype.slice.call(arguments),
            callback = args.pop();
        if(typeof callback != "function"){
            args.push(callback);
            callback = undefined;
        }

        args.push((function(response, next){
            var error = null;

            if(response && response.capability){
                this.capability = response.capability;
            }

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

        this.breakIdle((function(){
            this.client.exec.apply(this.client, args);
        }).bind(this));
    };

    // IMAP macros

    /**
     * The connection is idling. Sends a NOOP or IDLE command
     * IDLE: https://tools.ietf.org/html/rfc2177
     */
    BrowserBox.prototype.enterIdle = function(){
        if(this._enteredIdle){
            return;
        }
        this._enteredIdle = this.capability.indexOf("IDLE") >= 0 ? "IDLE" : "NOOP";

        if(this._enteredIdle == "NOOP"){
            this._idleTimeout = setTimeout((function(){
                this.exec("NOOP");
            }).bind(this), this.TIMEOUT_NOOP);
        }else if(this._enteredIdle == "IDLE"){
            this.client.exec({command: "IDLE"}, (function(response, next){
                next();
            }).bind(this));
            this._idleTimeout = setTimeout((function(){
                this.onlog("client", "DONE");
                this.client.socket.send(new Uint8Array([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]).buffer);
                this._enteredIdle = false;
            }).bind(this), this.TIMEOUT_IDLE);
        }
    };

    /**
     * Stops actions related idling, if IDLE is supported, sends DONE to stop it
     *
     * @param {Function} callback Function to run after required actions are performed
     */
    BrowserBox.prototype.breakIdle = function(callback){
        if(!this._enteredIdle){
            return callback();
        }

        clearTimeout(this._idleTimeout);
        if(this._enteredIdle == "IDLE"){
            this.onlog("client", "DONE");
            this.client.socket.send(new Uint8Array([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]).buffer);
        }
        this._enteredIdle = false;

        this.onlog("idle", "terminated");

        return callback();
    };

    /**
     * Runs CAPABILITY command
     * http://tools.ietf.org/html/rfc3501#section-6.1.1
     * Doesn't register untagged CAPABILITY handler as this is already
     * handled by global handler
     *
     * @param {Boolean} [forced] By default the command is not run if capability is already listed. Set to true to skip this validation
     * @param {Function} callback Callback function
     */
    BrowserBox.prototype.updateCapability = function(forced, callback){
        if(!callback && typeof forced == "function"){
            callback = forced;
            forced = undefined;
        }

        // skip request, if not forced update and capabilities are already loaded
        if(!forced && this.capability.length){
            return callback(null, false);
        }

        this.exec("CAPABILITY", function(err, response, next){
            if(err){
                callback(err);
            }else{
                callback(null, true);
            }
            next();
        });
    };

    /**
     * Runs NAMESPACE command
     * https://tools.ietf.org/html/rfc2342
     *
     * @param {Function} callback Callback function with the namespace information
     */
    BrowserBox.prototype.listNamespaces = function(callback){
        if(this.capability.indexOf("NAMESPACE") < 0){
            return callback(null, false);
        }

        this.exec("NAMESPACE", "NAMESPACE", (function(err, response, next){
            if(err){
                callback(err);
            }else{
                callback(null, this._parseNAMESPACE(response));
            }
            next();
        }).bind(this));
    };

    /**
     * Runs LOGIN command
     * http://tools.ietf.org/html/rfc3501#section-6.2.3
     *
     * @param {String} username
     * @param {String} password
     * @param {Function} callback Returns error if login failed
     */
    BrowserBox.prototype.login = function(username, password, callback){
        this.exec({
            command: "login",
            attributes: [{type: "LITERAL", value: username}, {type: "LITERAL", value: password}]
        }, "capability", (function(err, response, next){
            var capabilityUpdated = false;

            if(err){
                callback(err);
                return next();
            }

            this.state = this.STATE_AUTHENTICATED;
            this.authenticated = true;

            // update post-auth capabilites
            if(response.capability && response.capability.length){
                // capabilites were listed with the OK [CAPABILITY ...] response
                this.capability = [].concat(response.capability || []);
                capabilityUpdated = true;
                callback(null, true);
            }else if(response.payload && response.payload.CAPABILITY && response.payload.CAPABILITY.length){
                // capabilites were listed with * CAPABILITY ... response
                this.capability = [].concat(response.payload.CAPABILITY.pop().attributes || []).map(function(capa){
                    return (capa.value || "").toString().toUpperCase().trim();
                });
                capabilityUpdated = true;
                callback(null, true);
            }else{
                // capabilities were not automatically listed, reload
                this.updateCapability(true, function(err){
                    if(err){
                        callback(err);
                    }else{
                        callback(null, true);
                    }
                });
            }

            next();
        }).bind(this));
    };

    /**
     * Runs ID command. Retrieves server ID
     * http://tools.ietf.org/html/rfc2971
     * Sets this.serverId value
     *
     * @param {Object} id ID as key value pairs. See http://tools.ietf.org/html/rfc2971#section-3.3 for possible values
     * @param {Function} callback
     */
    BrowserBox.prototype.updateId = function(id, callback){
        if(this.capability.indexOf("ID") < 0){
            return callback(null, false);
        }

        var attributes = [[]];
        if(id){
            if(typeof id == "string"){
                id = {
                    name: id
                };
            }
            Object.keys(id).forEach(function(key){
                attributes[0].push(key);
                attributes[0].push(id[key]);
            });
        }else{
            attributes.push(null);
        }

        this.exec({command: "ID", attributes: attributes}, "ID", (function(err, response, next){
            if(err){
                callback(err);
                return next();
            }

            if(!response.payload || !response.payload.ID || !response.payload.ID.length){
                callback(null, false);
                return next();
            }

            this.serverId = {};

            var key;
            [].concat([].concat(response.payload.ID.shift().attributes || []).shift() || []).forEach((function(val, i){
                if(i % 2 === 0){
                    key = (val.value || "").toString().toLowerCase().trim();
                }else{
                    this.serverId[key] = (val.value || "").toString();
                }
            }).bind(this));

            this.onlog("server id", JSON.stringify(this.serverId));

            callback(null, this.serverId);

            next();
        }).bind(this));
    };

    /**
     * Runs LIST and LSUB commands. Retrieves a tree of available mailboxes
     * http://tools.ietf.org/html/rfc3501#section-6.3.8
     * http://tools.ietf.org/html/rfc3501#section-6.3.9
     *
     * @param {Function} callback Returns mailbox tree object
     */
    BrowserBox.prototype.listMailboxes = function(callback){
        this.exec({command: "LIST", attributes: ["", "*"]}, "LIST", (function(err, response, next){
            if(err){
                callback(err);
                return next();
            }

            var tree = {root: true, children: []};

            if(!response.payload || !response.payload.LIST || !response.payload.LIST.length){
                callback(null, false);
                return next();
            }

            response.payload.LIST.forEach((function(item){
                if(!item || !item.attributes || item.attributes.length < 3){
                    return;
                }
                var branch = this._ensurePath(tree, (item.attributes[2].value || "").toString(), (item.attributes[1].value).toString());
                branch.flags = [].concat(item.attributes[0] || []).map(function(flag){
                    return (flag.value || "").toString();
                });
                branch.listed = true;
                this._checkSpecialUse(branch);
            }).bind(this));

            this.exec({command: "LSUB", attributes: ["", "*"]}, "LSUB", (function(err, response, next){
                if(err){
                    callback(null, tree);
                    return next();
                }

                if(!response.payload || !response.payload.LSUB || !response.payload.LSUB.length){
                    callback(null, tree);
                    return next();
                }

                response.payload.LSUB.forEach((function(item){
                    if(!item || !item.attributes || item.attributes.length < 3){
                        return;
                    }
                    var branch = this._ensurePath(tree, (item.attributes[2].value || "").toString(), (item.attributes[1].value).toString());
                    [].concat(item.attributes[0] || []).map(function(flag){
                        flag = (flag.value || "").toString();
                        if(!branch.flags || branch.flags.indexOf(flag) < 0){
                            branch.flags = [].concat(branch.flags || []).concat(flag);
                        }
                    });
                    branch.subscribed = true;
                }).bind(this));

                callback(null, tree);

                next();
            }).bind(this));

            next();
        }).bind(this));
    };

    /**
     * TODO: Write docs
     * Runs FETCH command
     * http://tools.ietf.org/html/rfc3501#section-6.4.5
     *
     * CHANGEDSINCE: https://tools.ietf.org/html/rfc4551#section-3.3
     *
     * @param {String} sequence Sequence set, eg 1:* for all messages
     * @param {Object} [items] Message data item names or macro
     * @param {Object} [options] Query modifiers
     * @param {Function} callback Callback function with fetched message info
     */
    BrowserBox.prototype.listMessages = function(sequence, items, options, callback){
        if(!callback && typeof options == "function"){
            callback = options;
            options = undefined;
        }

        if(!callback && typeof items == "function"){
            callback = items;
            items = undefined;
        }

        items = items || {
            fast: true
        };

        options = options || {};

        var command = this._buildFETCHCommand(sequence, items, options);

        this.exec(command, "FETCH", (function(err, response, next){
            console.log("FETCH");
            console.log(JSON.stringify(response, false, 4));
            if(err){
                callback(err);
            }else{
                callback(null, true);
            }
            next();
        }).bind(this));
    };

    /**
     * Runs SELECT or EXAMINE to open a mailbox
     * http://tools.ietf.org/html/rfc3501#section-6.3.1
     * http://tools.ietf.org/html/rfc3501#section-6.3.2
     *
     * @param {String} path Full path to mailbox
     * @param {Object} [options] Options object
     * @param {Function} callback Return information about selected mailbox
     */
    BrowserBox.prototype.selectMailbox = function(path, options, callback){
        if(!callback && typeof options == "function"){
            callback = options;
            options = undefined;
        }
        options = options || {};

        var query = {
            command: options.readOnly ? "EXAMINE" : "SELECT",
            attributes: [
                {
                    type: "STRING",
                    value: path
                }
            ]
        };

        if(options.condstore && this.capability.indexOf("CONDSTORE") >= 0){
            query.attributes.push([{type: "ATOM", value: "CONDSTORE"}]);
        }

        this.exec(query, ["EXISTS", "FLAGS", "OK"], (function(err, response, next){
            if(err){
                callback(err);
                return next();
            }

            this.state = this.STATE_SELECTED;

            callback(null, this._parseSELECT(response));

            next();
        }).bind(this));
    };

    // Default handlers for untagged responses

    /**
     * Checks if an untagged OK includes [CAPABILITY] tag and updates capability object
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    BrowserBox.prototype._untaggedOkHandler = function(response, next){
        if(response && response.capability){
            this.capability = response.capability;
        }
        next();
    };

    /**
     * Updates capability object
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    BrowserBox.prototype._untaggedCapabilityHandler = function(response, next){
        this.capability = [].concat(response && response.attributes || []).map(function(capa){
            return (capa.value || "").toString().toUpperCase().trim();
        });
        next();
    };

    /**
     * Updates existing message count
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    BrowserBox.prototype._untaggedExistsHandler = function(response, next){
        console.log("Untagged EXISTS");
        console.log(response);
        next();
    };

    /**
     * Indicates a message has been deleted
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    BrowserBox.prototype._untaggedExpungeHandler = function(response, next){
        console.log("Untagged EXPUNGE");
        console.log(response);
        next();
    };

    /**
     * Indicates that flags have been updated for a message
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    BrowserBox.prototype._untaggedFetchHandler = function(response, next){
        console.log("Untagged FETCH");
        console.log(response);
        next();
    };

    // Private helpers

    /**
     * Parses SELECT response
     *
     * @param {Object} response
     * @return {Object} Mailbox information object
     */
    BrowserBox.prototype._parseSELECT = function(response){
        if(!response || !response.payload){
            return;
        }

        var mailbox = {
                readOnly: response.code == "READ-ONLY"
            },

            existsResponse = response.payload.EXISTS && response.payload.EXISTS.pop(),
            flagsResponse = response.payload.FLAGS && response.payload.FLAGS.pop(),
            okResponse = response.payload.OK;

        if(existsResponse){
            mailbox.exists = existsResponse.nr || 0;
        }

        if(flagsResponse && flagsResponse.attributes && flagsResponse.attributes.length){
            mailbox.flags = flagsResponse.attributes[0].map(function(flag){
                return (flag.value || "").toString().trim();
            });
        }

        [].concat(okResponse || []).forEach(function(ok){
            switch(ok && ok.code){
                case "PERMANENTFLAGS":
                    mailbox.permanentFlags = [].concat(ok.permanentflags || []);
                    break;
                case "UIDVALIDITY":
                    mailbox.uidValidity = Number(ok.uidvalidity) || 0;
                    break;
                case "UIDNEXT":
                    mailbox.uidNext = Number(ok.uidnext) || 0;
                    break;
                case "HIGHESTMODSEQ":
                    mailbox.highestModseq = Number(ok.highestmodseq) || 0;
                    break;
            }
        });

        return mailbox;
    };

    /**
     * Parses NAMESPACE response
     *
     * @param {Object} response
     * @return {Object} Namespaces object
     */
    BrowserBox.prototype._parseNAMESPACE = function(response){
        var attributes,
            namespaces = false,
            parseNsElement = function(arr){
                return !arr ? false : [].concat(arr || []).map(function(ns){
                    return !ns || !ns.length ? false : {
                        prefix: ns[0].value,
                        delimiter: ns[1].value
                    };
                });
            };

        if(response.payload &&
            response.payload.NAMESPACE &&
            response.payload.NAMESPACE.length &&
            (attributes = [].concat(response.payload.NAMESPACE.pop().attributes || [])).length){

            namespaces = {
                personal: parseNsElement(attributes[0]),
                users: parseNsElement(attributes[1]),
                shared: parseNsElement(attributes[2])
            };
        }

        return namespaces;
    };

    /**
     * TODO: Write docs.
     * FIXME: Does not support partials <start.stop>
     */
    BrowserBox.prototype._buildFETCHCommand = function(sequence, items, options){
        var command = {
                command: options.byUid ? "UID FETCH" : "FETCH",
                attributes: [
                    {type: "SEQUENCE", value: sequence}
                ]
            },

            query = [],

            walkItems = function(parent, itemBlock){
                Object.keys(itemBlock).forEach(function(key){
                    var element = {type: "ATOM", value: key.toUpperCase()},
                        list;

                    if(Array.isArray(itemBlock[key])){
                        element.section = [];
                        itemBlock[key].forEach(function(item){
                            walkItems(element.section, item);
                        });
                    }else if(typeof itemBlock[key] == "object" && itemBlock[key]){
                        list = [];
                        walkItems(list, itemBlock[key]);
                    }else if(["string", "number"].indexOf(typeof itemBlock[key]) >= 0){
                        list = [itemBlock[key]];
                    }

                    parent.push(element);
                    if(list){
                        parent.push(list);
                    }
                });
            };

        walkItems(query, items);

        if(query.length == 1){
            query = query.pop();
        }

        command.attributes.push(query);

        if(options.changedSince){
            command.attributes.push([
                {type: "ATOM", value: "CHANGEDSINCE"},
                options.changedSince
            ]);
        }

        return command;
    };

    /**
     * Ensures a path exists in the Mailbox tree
     *
     * @param {Object} tree Mailbox tree
     * @param {String} path
     * @param {String} delimiter
     * @return {Object} branch for used path
     */
    BrowserBox.prototype._ensurePath = function(tree, path, delimiter){
        var names = path.split(delimiter), branch = tree, i, j, found;
        for(i = 0; i < names.length; i++){
            found = false;
            for(j = 0; j < branch.children.length; j++){
                if(branch.children[j].name == names[i]){
                    branch = branch.children[j];
                    found = true;
                    break;
                }
            }
            if(!found){
                branch.children.push({
                    name: utf7.imap.decode(names[i]),
                    delimiter: delimiter,
                    path: names.slice(0, i + 1).join(delimiter),
                    children: []
                });
                branch = branch.children[branch.children.length - 1];
            }
        }
        return branch;
    };

    /**
     * Checks if a mailbox is for special use
     *
     * @param {Object} mailbox
     * @return {String|Boolean} Special use flag (if detected) or false
     */
    BrowserBox.prototype._checkSpecialUse = function(mailbox){
        var type, specialFlags = ["\\All", "\\Archive", "\\Drafts", "\\Flagged", "\\Junk", "\\Sent", "\\Trash"];
        if(this.capability.indexOf("SPECIAL-USE") >= 0){
            if(!mailbox.flags || !mailbox.flags.length){
                return false;
            }
            for(var i = 0, len = specialFlags.length; i < len; i++){
                if(mailbox.flags.indexOf(specialFlags[i]) >= 0){
                    type = specialFlags[i];
                    break;
                }
            }
        }else{
            if((type = specialUse(mailbox.name))){
                mailbox.flags = [].concat(mailbox.flags || []).concat(name);
            }
        }
        if(!type){
            return false;
        }

        mailbox.specialUse = type.substr(1).toLowerCase();
        return type;
    };

    // Exposed function
    return function(host, port, options){
        return new BrowserBox(host, port, options);
    };
}));
