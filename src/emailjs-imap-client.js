(function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['./emailjs-imap-client-imap', 'emailjs-utf7', 'emailjs-imap-handler', 'emailjs-mime-codec', 'emailjs-addressparser'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./emailjs-imap-client-imap'), require('emailjs-utf7'), require('emailjs-imap-handler'), require('emailjs-mime-codec'), require('emailjs-addressparser'));
    }
}(this, function(ImapClient, utf7, imapHandler, mimefuncs, addressparser) {
    'use strict';

    var SPECIAL_USE_FLAGS = ['\\All', '\\Archive', '\\Drafts', '\\Flagged', '\\Junk', '\\Sent', '\\Trash'];
    var SPECIAL_USE_BOXES = {
        '\\Sent': ['aika', 'bidaliak', 'bidalita', 'dihantar', 'e rometsweng', 'e tindami', 'elküldött', 'elküldöttek', 'enviadas', 'enviadas', 'enviados', 'enviats', 'envoyés', 'ethunyelweyo', 'expediate', 'ezipuru', 'gesendete', 'gestuur', 'gönderilmiş öğeler', 'göndərilənlər', 'iberilen', 'inviati', 'išsiųstieji', 'kuthunyelwe', 'lasa', 'lähetetyt', 'messages envoyés', 'naipadala', 'nalefa', 'napadala', 'nosūtītās ziņas', 'odeslané', 'padala', 'poslane', 'poslano', 'poslano', 'poslané', 'poslato', 'saadetud', 'saadetud kirjad', 'sendt', 'sendt', 'sent', 'sent items', 'sent messages', 'sända poster', 'sänt', 'terkirim', 'ti fi ranṣẹ', 'të dërguara', 'verzonden', 'vilivyotumwa', 'wysłane', 'đã gửi', 'σταλθέντα', 'жиберилген', 'жіберілгендер', 'изпратени', 'илгээсэн', 'ирсол шуд', 'испратено', 'надіслані', 'отправленные', 'пасланыя', 'юборилган', 'ուղարկված', 'נשלחו', 'פריטים שנשלחו', 'المرسلة', 'بھیجے گئے', 'سوزمژہ', 'لېګل شوی', 'موارد ارسال شده', 'पाठविले', 'पाठविलेले', 'प्रेषित', 'भेजा गया', 'প্রেরিত', 'প্রেরিত', 'প্ৰেৰিত', 'ਭੇਜੇ', 'મોકલેલા', 'ପଠାଗଲା', 'அனுப்பியவை', 'పంపించబడింది', 'ಕಳುಹಿಸಲಾದ', 'അയച്ചു', 'යැවු පණිවුඩ', 'ส่งแล้ว', 'გაგზავნილი', 'የተላኩ', 'បាន​ផ្ញើ', '寄件備份', '寄件備份', '已发信息', '送信済みﾒｰﾙ', '발신 메시지', '보낸 편지함'],
        '\\Trash': ['articole șterse', 'bin', 'borttagna objekt', 'deleted', 'deleted items', 'deleted messages', 'elementi eliminati', 'elementos borrados', 'elementos eliminados', 'gelöschte objekte', 'item dipadam', 'itens apagados', 'itens excluídos', 'mục đã xóa', 'odstraněné položky', 'pesan terhapus', 'poistetut', 'praht', 'prügikast', 'silinmiş öğeler', 'slettede beskeder', 'slettede elementer', 'trash', 'törölt elemek', 'usunięte wiadomości', 'verwijderde items', 'vymazané správy', 'éléments supprimés', 'видалені', 'жойылғандар', 'удаленные', 'פריטים שנמחקו', 'العناصر المحذوفة', 'موارد حذف شده', 'รายการที่ลบ', '已删除邮件', '已刪除項目', '已刪除項目'],
        '\\Junk': ['bulk mail', 'correo no deseado', 'courrier indésirable', 'istenmeyen', 'istenmeyen e-posta', 'junk', 'levélszemét', 'nevyžiadaná pošta', 'nevyžádaná pošta', 'no deseado', 'posta indesiderata', 'pourriel', 'roskaposti', 'skräppost', 'spam', 'spam', 'spamowanie', 'søppelpost', 'thư rác', 'спам', 'דואר זבל', 'الرسائل العشوائية', 'هرزنامه', 'สแปม', '‎垃圾郵件', '垃圾邮件', '垃圾電郵'],
        '\\Drafts': ['ba brouillon', 'borrador', 'borrador', 'borradores', 'bozze', 'brouillons', 'bản thảo', 'ciorne', 'concepten', 'draf', 'drafts', 'drög', 'entwürfe', 'esborranys', 'garalamalar', 'ihe edeturu', 'iidrafti', 'izinhlaka', 'juodraščiai', 'kladd', 'kladder', 'koncepty', 'koncepty', 'konsep', 'konsepte', 'kopie robocze', 'layihələr', 'luonnokset', 'melnraksti', 'meralo', 'mesazhe të padërguara', 'mga draft', 'mustandid', 'nacrti', 'nacrti', 'osnutki', 'piszkozatok', 'rascunhos', 'rasimu', 'skice', 'taslaklar', 'tsararrun saƙonni', 'utkast', 'vakiraoka', 'vázlatok', 'zirriborroak', 'àwọn àkọpamọ́', 'πρόχειρα', 'жобалар', 'нацрти', 'нооргууд', 'сиёҳнавис', 'хомаки хатлар', 'чарнавікі', 'чернетки', 'чернови', 'черновики', 'черновиктер', 'սևագրեր', 'טיוטות', 'مسودات', 'مسودات', 'موسودې', 'پیش نویسها', 'ڈرافٹ/', 'ड्राफ़्ट', 'प्रारूप', 'খসড়া', 'খসড়া', 'ড্ৰাফ্ট', 'ਡ੍ਰਾਫਟ', 'ડ્રાફ્ટસ', 'ଡ୍ରାଫ୍ଟ', 'வரைவுகள்', 'చిత్తు ప్రతులు', 'ಕರಡುಗಳು', 'കരടുകള്‍', 'කෙටුම් පත්', 'ฉบับร่าง', 'მონახაზები', 'ረቂቆች', 'សារព្រាង', '下書き', '草稿', '草稿', '草稿', '임시 보관함']
    };
    var SPECIAL_USE_BOX_FLAGS = Object.keys(SPECIAL_USE_BOXES);
    var SESSIONCOUNTER = 0;

    /**
     * emailjs IMAP client
     *
     * @constructor
     *
     * @param {String} [host='localhost'] Hostname to conenct to
     * @param {Number} [port=143] Port number to connect to
     * @param {Object} [options] Optional options object
     */
    function Client(host, port, options) {
        this.serverId = false; // RFC 2971 Server ID as key value pairs

        // Event placeholders
        this.oncert = null;
        this.onupdate = null;
        this.onselectmailbox = null;
        this.onclosemailbox = null;

        //
        // Internals
        //

        this.options = options || {};
        this.options.sessionId = this.options.sessionId || ++SESSIONCOUNTER; // Session identifier (logging)
        this._state = false; // Current state
        this._authenticated = false; // Is the connection authenticated
        this._capability = []; // List of extensions the server supports
        this._selectedMailbox = false; // Selected mailbox
        this._enteredIdle = false;
        this._idleTimeout = false;

        this.client = new ImapClient(host, port, this.options); // IMAP client object

        // Event Handlers
        this.client.onerror = this._onError.bind(this);
        this.client.oncert = (cert) => (this.oncert && this.oncert(cert)); // allows certificate handling for platforms w/o native tls support
        this.client.onidle = () => this._onIdle(); // start idling

        // Default handlers for untagged responses
        this.client.setHandler('capability', (response) => this._untaggedCapabilityHandler(response)); // capability updates
        this.client.setHandler('ok', (response) => this._untaggedOkHandler(response)); // notifications
        this.client.setHandler('exists', (response) => this._untaggedExistsHandler(response)); // message count has changed
        this.client.setHandler('expunge', (response) => this._untaggedExpungeHandler(response)); // message has been deleted
        this.client.setHandler('fetch', (response) => this._untaggedFetchHandler(response)); // message has been updated (eg. flag change)

        // Activate logging
        this.createLogger();
        this.logLevel = this.LOG_LEVEL_ALL;
    }

    /**
     * Called if the lower-level ImapClient has encountered an unrecoverable
     * error during operation. Cleans up and propagates the error upwards.
     */
    Client.prototype._onError = function(err) {
        // make sure no idle timeout is pending anymore
        clearTimeout(this._idleTimeout);

        // propagate the error upwards
        this.onerror && this.onerror(err);
    };

    //
    //
    // PUBLIC API
    //
    //


    /**
     * Initiate connection to the IMAP server
     *
     * @returns {Promise} Promise when login procedure is complete
     */
    Client.prototype.connect = function() {
        return new Promise((resolve, reject) => {
            var connectionTimeout = setTimeout(() => reject(new Error('Timeout connecting to server')), this.TIMEOUT_CONNECTION);
            this.logger.debug('Connecting to', this.client.host, ':',  this.client.port);
            this._changeState(this.STATE_CONNECTING);
            this.client.connect().then(() => {
                this.logger.debug('Socket opened, waiting for greeting from the server...');

                this.client.onready = () => {
                    clearTimeout(connectionTimeout);
                    resolve();
                };

                this.client.onerror = (err) => {
                    clearTimeout(connectionTimeout);
                    reject(err);
                };
            }).catch(reject);
        }).then(() => {
            this._changeState(this.STATE_NOT_AUTHENTICATED);
            return this.updateCapability();
        }).then(() => {
            return this.upgradeConnection();
        }).then(() => {
            return this.updateId(this.options.id)
            .catch(err => this.logger.warn('Failed to update id', err));
        }).then(() => {
            return this.login(this.options.auth);
        }).then(() => {
            return this.compressConnection();
        }).then(() => {
            this.logger.debug('Connection established, ready to roll!');
            this.client.onerror = this._onError.bind(this);
        }).catch((err) => {
            this.logger.error('Could not connect to server', err);
            this.close(err); // we don't really care whether this works or not
            throw err;
        });
    };

    /**
     * Logout
     *
     * Send LOGOUT, to which the server responds by closing the connection.
     * Use is discouraged if network status is unclear! If networks status is
     * unclear, please use #close instead!
     *
     * LOGOUT details:
     *   https://tools.ietf.org/html/rfc3501#section-6.1.3
     *
     * @returns {Promise} Resolves when server has closed the connection
     */
    Client.prototype.logout = function() {
        this._changeState(this.STATE_LOGOUT);
        this.logger.debug('Logging out...');
        return this.client.logout().then(() => {
            clearTimeout(this._idleTimeout);
        });
    };

    /**
     * Force-closes the current connection by closing the TCP socket.
     *
     * @returns {Promise} Resolves when socket is closed
     */
    Client.prototype.close = function(err) {
        this._changeState(this.STATE_LOGOUT);
        clearTimeout(this._idleTimeout);
        this.logger.debug('Closing connection...');
        return this.client.close(err);
    };

    /**
     * Runs ID command, parses ID response, sets this.serverId
     *
     * ID details:
     *   http://tools.ietf.org/html/rfc2971
     *
     * @param {Object} id ID as key value pairs. See http://tools.ietf.org/html/rfc2971#section-3.3 for possible values
     * @returns {Promise} Resolves when response has been parsed
     */
    Client.prototype.updateId = function(id) {
        if (this._capability.indexOf('ID') < 0) {
            return Promise.resolve();
        }

        var attributes = [
            []
        ];
        if (id) {
            if (typeof id === 'string') {
                id = {
                    name: id
                };
            }
            Object.keys(id).forEach((key) => {
                attributes[0].push(key);
                attributes[0].push(id[key]);
            });
        } else {
            attributes[0] = null;
        }

        this.logger.debug('Updating id...');
        return this.exec({
            command: 'ID',
            attributes: attributes
        }, 'ID').then((response) => {
            if (!response.payload || !response.payload.ID || !response.payload.ID.length) {
                return;
            }

            this.serverId = {};

            var key;
            [].concat([].concat(response.payload.ID.shift().attributes || []).shift() || []).forEach((val, i) => {
                if (i % 2 === 0) {
                    key = (val && val.value || '').toString().toLowerCase().trim();
                } else {
                    this.serverId[key] = (val && val.value || '').toString();
                }
            });

            this.logger.debug('Server id updated!', this.serverId);
        });
    };

    Client.prototype._shouldSelectMailbox = function(path, ctx) {
        if (!ctx) {
          return true;
        }

        const previousSelect = this.client.getPreviouslyQueued(['SELECT', 'EXAMINE'], ctx);
        if (previousSelect && previousSelect.request.attributes) {
            const pathAttribute = previousSelect.request.attributes.find((attribute) => attribute.type === 'STRING');
            if (pathAttribute) {
                return pathAttribute.value !== path;
            }
        }

        return this._selectedMailbox !== path;
    };

    /**
     * Runs SELECT or EXAMINE to open a mailbox
     *
     * SELECT details:
     *   http://tools.ietf.org/html/rfc3501#section-6.3.1
     * EXAMINE details:
     *   http://tools.ietf.org/html/rfc3501#section-6.3.2
     *
     * @param {String} path Full path to mailbox
     * @param {Object} [options] Options object
     * @returns {Promise} Promise with information about the selected mailbox
     */
    Client.prototype.selectMailbox = function(path, options) {
        options = options || {};

        var query = {
            command: options.readOnly ? 'EXAMINE' : 'SELECT',
            attributes: [{
                type: 'STRING',
                value: path
            }]
        };

        if (options.condstore && this._capability.indexOf('CONDSTORE') >= 0) {
            query.attributes.push([{
                type: 'ATOM',
                value: 'CONDSTORE'
            }]);
        }

        this.logger.debug('Opening', path, '...');
        return this.exec(query, ['EXISTS', 'FLAGS', 'OK'], {
            ctx: options.ctx
        }).then((response) => {
            this._changeState(this.STATE_SELECTED);

            if (this._selectedMailbox && this._selectedMailbox !== path) {
                this.onclosemailbox && this.onclosemailbox(this._selectedMailbox);
            }

            this._selectedMailbox = path;

            var mailboxInfo = this._parseSELECT(response);

            var maybePromise = this.onselectmailbox && this.onselectmailbox(path, mailboxInfo);
            if (maybePromise && typeof maybePromise.then === 'function') {
                return maybePromise.then(() => mailboxInfo);
            } else {
                return mailboxInfo;
            }
        });
    };

    /**
     * Runs NAMESPACE command
     *
     * NAMESPACE details:
     *   https://tools.ietf.org/html/rfc2342
     *
     * @returns {Promise} Promise with namespace object
     */
    Client.prototype.listNamespaces = function() {
        if (this._capability.indexOf('NAMESPACE') < 0) {
            return Promise.resolve(false);
        }

        this.logger.debug('Listing namespaces...');
        return this.exec('NAMESPACE', 'NAMESPACE').then((response) => {
            return this._parseNAMESPACE(response);
        });
    };

    /**
     * Runs LIST and LSUB commands. Retrieves a tree of available mailboxes
     *
     * LIST details:
     *   http://tools.ietf.org/html/rfc3501#section-6.3.8
     * LSUB details:
     *   http://tools.ietf.org/html/rfc3501#section-6.3.9
     *
     * @returns {Promise} Promise with list of mailboxes
     */
    Client.prototype.listMailboxes = function() {
        var tree;

        this.logger.debug('Listing mailboxes...');
        return this.exec({
            command: 'LIST',
            attributes: ['', '*']
        }, 'LIST').then((response) => {
            tree = {
                root: true,
                children: []
            };

            if (!response.payload || !response.payload.LIST || !response.payload.LIST.length) {
                return;
            }

            response.payload.LIST.forEach((item) => {
                if (!item || !item.attributes || item.attributes.length < 3) {
                    return;
                }
                var branch = this._ensurePath(tree, (item.attributes[2].value || '').toString(), (item.attributes[1] ? item.attributes[1].value : '/').toString());
                branch.flags = [].concat(item.attributes[0] || []).map((flag) => (flag.value || '').toString());
                branch.listed = true;
                this._checkSpecialUse(branch);
            });

        }).then(() => {
            return this.exec({
                command: 'LSUB',
                attributes: ['', '*']
            }, 'LSUB');

        }).then((response) => {
            if (!response.payload || !response.payload.LSUB || !response.payload.LSUB.length) {
                return tree;
            }

            response.payload.LSUB.forEach((item) => {
                if (!item || !item.attributes || item.attributes.length < 3) {
                    return;
                }
                var branch = this._ensurePath(tree, (item.attributes[2].value || '').toString(), (item.attributes[1] ? item.attributes[1].value : '/').toString());
                [].concat(item.attributes[0] || []).map((flag) => {
                    flag = (flag.value || '').toString();
                    if (!branch.flags || branch.flags.indexOf(flag) < 0) {
                        branch.flags = [].concat(branch.flags || []).concat(flag);
                    }
                });
                branch.subscribed = true;
            });
            return tree;

        }).catch((err) => {
            if (tree) {
                return tree; // ignore error for subscribed mailboxes if there's a valid response already
            }

            throw err;
        });
    };

    /**
     * Create a mailbox with the given path.
     *
     * CREATE details:
     *   http://tools.ietf.org/html/rfc3501#section-6.3.3
     *
     * @param {String} path
     *     The path of the mailbox you would like to create.  This method will
     *     handle utf7 encoding for you.
     * @returns {Promise}
     *     Promise resolves if mailbox was created.
     *     In the event the server says NO [ALREADYEXISTS], we treat that as success.
     */
    Client.prototype.createMailbox = function(path) {
        this.logger.debug('Creating mailbox', path, '...');
        return this.exec({
            command: 'CREATE',
            attributes: [utf7.imap.encode(path)]
        }).catch((err) => {
            if (err && err.code === 'ALREADYEXISTS') {
                return;
            }

            throw err;
        });
    };

    /**
     * Runs FETCH command
     *
     * FETCH details:
     *   http://tools.ietf.org/html/rfc3501#section-6.4.5
     * CHANGEDSINCE details:
     *   https://tools.ietf.org/html/rfc4551#section-3.3
     *
     * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
     * @param {String} sequence Sequence set, eg 1:* for all messages
     * @param {Object} [items] Message data item names or macro
     * @param {Object} [options] Query modifiers
     * @returns {Promise} Promise with the fetched message info
     */
    Client.prototype.listMessages = function(path, sequence, items, options) {
        items = items || [{
            fast: true
        }];
        options = options || {};

        this.logger.debug('Fetching messages', sequence, 'from', path, '...');
        var command = this._buildFETCHCommand(sequence, items, options);
        return this.exec(command, 'FETCH', {
            precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
        }).then((response) => this._parseFETCH(response));
    };

    /**
     * Runs SEARCH command
     *
     * SEARCH details:
     *   http://tools.ietf.org/html/rfc3501#section-6.4.4
     *
     * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
     * @param {Object} query Search terms
     * @param {Object} [options] Query modifiers
     * @returns {Promise} Promise with the array of matching seq. or uid numbers
     */
    Client.prototype.search = function(path, query, options) {
        options = options || {};

        this.logger.debug('Searching in', path, '...');
        var command = this._buildSEARCHCommand(query, options);
        return this.exec(command, 'SEARCH', {
            precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
        }).then((response) => this._parseSEARCH(response));
    };

    /**
     * Runs STORE command
     *
     * STORE details:
     *   http://tools.ietf.org/html/rfc3501#section-6.4.6
     *
     * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
     * @param {String} sequence Message selector which the flag change is applied to
     * @param {Array} flags
     * @param {Object} [options] Query modifiers
     * @returns {Promise} Promise with the array of matching seq. or uid numbers
     */
    Client.prototype.setFlags = function(path, sequence, flags, options) {
        var key = '';
        var list = [];

        if (Array.isArray(flags) || typeof flags !== 'object') {
            list = [].concat(flags || []);
            key = '';
        } else if (flags.add) {
            list = [].concat(flags.add || []);
            key = '+';
        } else if (flags.set) {
            key = '';
            list = [].concat(flags.set || []);
        } else if (flags.remove) {
            key = '-';
            list = [].concat(flags.remove || []);
        }

        this.logger.debug('Setting flags on', sequence, 'in', path, '...');
        return this.store(path, sequence, key + 'FLAGS', list, options);
    };

    /**
     * Runs STORE command
     *
     * STORE details:
     *   http://tools.ietf.org/html/rfc3501#section-6.4.6
     *
     * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
     * @param {String} sequence Message selector which the flag change is applied to
     * @param {String} action STORE method to call, eg "+FLAGS"
     * @param {Array} flags
     * @param {Object} [options] Query modifiers
     * @returns {Promise} Promise with the array of matching seq. or uid numbers
     */
    Client.prototype.store = function(path, sequence, action, flags, options) {
        options = options || {};

        var command = this._buildSTORECommand(sequence, action, flags, options);
        return this.exec(command, 'FETCH', {
            precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
        }).then((response) => this._parseFETCH(response));
    };

    /**
     * Runs APPEND command
     *
     * APPEND details:
     *   http://tools.ietf.org/html/rfc3501#section-6.3.11
     *
     * @param {String} destination The mailbox where to append the message
     * @param {String} message The message to append
     * @param {Array} options.flags Any flags you want to set on the uploaded message. Defaults to [\Seen]. (optional)
     * @returns {Promise} Promise with the array of matching seq. or uid numbers
     */
    Client.prototype.upload = function(destination, message, options) {
        options = options || {};
        options.flags = options.flags || ['\\Seen'];
        var flags = options.flags.map((flag) => {
            return {
                type: 'atom',
                value: flag
            };
        });

        var command = {
            command: 'APPEND',
            attributes: [{
                    type: 'atom',
                    value: destination
                },
                flags, {
                    type: 'literal',
                    value: message
                }
            ]
        };

        this.logger.debug('Uploading message to', destination, '...');
        return this.exec(command);
    };

    /**
     * Deletes messages from a selected mailbox
     *
     * EXPUNGE details:
     *   http://tools.ietf.org/html/rfc3501#section-6.4.3
     * UID EXPUNGE details:
     *   https://tools.ietf.org/html/rfc4315#section-2.1
     *
     * If possible (byUid:true and UIDPLUS extension supported), uses UID EXPUNGE
     * command to delete a range of messages, otherwise falls back to EXPUNGE.
     *
     * NB! This method might be destructive - if EXPUNGE is used, then any messages
     * with \Deleted flag set are deleted
     *
     * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
     * @param {String} sequence Message range to be deleted
     * @param {Object} [options] Query modifiers
     * @returns {Promise} Promise
     */
    Client.prototype.deleteMessages = function(path, sequence, options) {
        options = options || {};

        // add \Deleted flag to the messages and run EXPUNGE or UID EXPUNGE
        this.logger.debug('Deleting messages', sequence, 'in', path, '...');
        return this.setFlags(path, sequence, {
            add: '\\Deleted'
        }, options).then(() => {
            var cmd;
            if (options.byUid && this._capability.indexOf('UIDPLUS') >= 0) {
                cmd = {
                    command: 'UID EXPUNGE',
                    attributes: [{
                        type: 'sequence',
                        value: sequence
                    }]
                };
            } else {
                cmd = 'EXPUNGE';
            }
            return this.exec(cmd, null, {
                precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
            });
        });
    };

    /**
     * Copies a range of messages from the active mailbox to the destination mailbox.
     * Silent method (unless an error occurs), by default returns no information.
     *
     * COPY details:
     *   http://tools.ietf.org/html/rfc3501#section-6.4.7
     *
     * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
     * @param {String} sequence Message range to be copied
     * @param {String} destination Destination mailbox path
     * @param {Object} [options] Query modifiers
     * @param {Boolean} [options.byUid] If true, uses UID COPY instead of COPY
     * @returns {Promise} Promise
     */
    Client.prototype.copyMessages = function(path, sequence, destination, options) {
        options = options || {};

        this.logger.debug('Copying messages', sequence, 'from', path, 'to', destination, '...');
        return this.exec({
            command: options.byUid ? 'UID COPY' : 'COPY',
            attributes: [{
                type: 'sequence',
                value: sequence
            }, {
                type: 'atom',
                value: destination
            }]
        }, null, {
            precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
        }).then((response) => (response.humanReadable || 'COPY completed'));
    };

    /**
     * Moves a range of messages from the active mailbox to the destination mailbox.
     * Prefers the MOVE extension but if not available, falls back to
     * COPY + EXPUNGE
     *
     * MOVE details:
     *   http://tools.ietf.org/html/rfc6851
     *
     * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
     * @param {String} sequence Message range to be moved
     * @param {String} destination Destination mailbox path
     * @param {Object} [options] Query modifiers
     * @returns {Promise} Promise
     */
    Client.prototype.moveMessages = function(path, sequence, destination, options) {
        options = options || {};

        this.logger.debug('Moving messages', sequence, 'from', path, 'to', destination, '...');

        if (this._capability.indexOf('MOVE') === -1) {
            // Fallback to COPY + EXPUNGE
            return this.copyMessages(path, sequence, destination, options).then(() => {
                return this.deleteMessages(path, sequence, options);
            });
        }

        // If possible, use MOVE
        return this.exec({
            command: options.byUid ? 'UID MOVE' : 'MOVE',
            attributes: [{
                type: 'sequence',
                value: sequence
            }, {
                type: 'atom',
                value: destination
            }]
        }, ['OK'], {
            precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
        });
    };


    //
    //
    // INTERNALS
    //
    //


    // State constants
    Client.prototype.STATE_CONNECTING = 1;
    Client.prototype.STATE_NOT_AUTHENTICATED = 2;
    Client.prototype.STATE_AUTHENTICATED = 3;
    Client.prototype.STATE_SELECTED = 4;
    Client.prototype.STATE_LOGOUT = 5;

    // Timeout constants
    Client.prototype.TIMEOUT_CONNECTION = 90 * 1000; // Milliseconds to wait for the IMAP greeting from the server
    Client.prototype.TIMEOUT_NOOP = 60 * 1000; // Milliseconds between NOOP commands while idling
    Client.prototype.TIMEOUT_IDLE = 60 * 1000; // Milliseconds until IDLE command is cancelled


    /**
     * Runs COMPRESS command
     *
     * COMPRESS details:
     *   https://tools.ietf.org/html/rfc4978
     */
    Client.prototype.compressConnection = function() {
        if (!this.options.enableCompression || this._capability.indexOf('COMPRESS=DEFLATE') < 0 || this.client.compressed) {
            return Promise.resolve(false);
        }

        this.logger.debug('Enabling compression...');
        return this.exec({
            command: 'COMPRESS',
            attributes: [{
                type: 'ATOM',
                value: 'DEFLATE'
            }]
        }).then(() => {
            this.client.enableCompression();
            this.logger.debug('Compression enabled, all data sent and received is deflated!');
        });
    };

    /**
     * Runs LOGIN or AUTHENTICATE XOAUTH2 command
     *
     * LOGIN details:
     *   http://tools.ietf.org/html/rfc3501#section-6.2.3
     * XOAUTH2 details:
     *   https://developers.google.com/gmail/xoauth2_protocol#imap_protocol_exchange
     *
     * @param {String} auth.user
     * @param {String} auth.pass
     * @param {String} auth.xoauth2
     */
    Client.prototype.login = function(auth) {
        var command, options = {};

        if (!auth) {
            return Promise.reject(new Error('Authentication information not provided'));
        }

        if (this._capability.indexOf('AUTH=XOAUTH2') >= 0 && auth && auth.xoauth2) {
            command = {
                command: 'AUTHENTICATE',
                attributes: [{
                    type: 'ATOM',
                    value: 'XOAUTH2'
                }, {
                    type: 'ATOM',
                    value: this._buildXOAuth2Token(auth.user, auth.xoauth2),
                    sensitive: true
                }]
            };

            options.errorResponseExpectsEmptyLine = true; // + tagged error response expects an empty line in return
        } else {
            command = {
                command: 'login',
                attributes: [{
                    type: 'STRING',
                    value: auth.user || ''
                }, {
                    type: 'STRING',
                    value: auth.pass || '',
                    sensitive: true
                }]
            };
        }

        this.logger.debug('Logging in...');
        return this.exec(command, 'capability', options).then((response) => {
            /*
             * update post-auth capabilites
             * capability list shouldn't contain auth related stuff anymore
             * but some new extensions might have popped up that do not
             * make much sense in the non-auth state
             */
            if (response.capability && response.capability.length) {
                // capabilites were listed with the OK [CAPABILITY ...] response
                this._capability = [].concat(response.capability || []);
            } else if (response.payload && response.payload.CAPABILITY && response.payload.CAPABILITY.length) {
                // capabilites were listed with * CAPABILITY ... response
                this._capability = [].concat(response.payload.CAPABILITY.pop().attributes || []).map((capa) => (capa.value || '').toString().toUpperCase().trim());
            } else {
                // capabilities were not automatically listed, reload
                return this.updateCapability(true);
            }
        }).then(() => {
            this._changeState(this.STATE_AUTHENTICATED);
            this._authenticated = true;
            this.logger.debug('Login successful, post-auth capabilites updated!', this._capability);
        });
    };

    /**
     * Run an IMAP command.
     *
     * @param {Object} request Structured request object
     * @param {Array} acceptUntagged a list of untagged responses that will be included in 'payload' property
     */
    Client.prototype.exec = function(request, acceptUntagged, options) {
        this.breakIdle();
        return this.client.enqueueCommand(request, acceptUntagged, options).then((response) => {
            if (response && response.capability) {
                this._capability = response.capability;
            }
            return response;
        });
    };

    /**
     * Indicates that the connection started idling. Initiates a cycle
     * of NOOPs or IDLEs to receive notifications about updates in the server
     */
    Client.prototype._onIdle = function() {
        if (!this._authenticated || this._enteredIdle) {
            // No need to IDLE when not logged in or already idling
            return;
        }

        this.logger.debug('Client started idling');
        this.enterIdle();
    };

    /**
     * The connection is idling. Sends a NOOP or IDLE command
     *
     * IDLE details:
     *   https://tools.ietf.org/html/rfc2177
     */
    Client.prototype.enterIdle = function() {
        if (this._enteredIdle) {
            return;
        }
        this._enteredIdle = this._capability.indexOf('IDLE') >= 0 ? 'IDLE' : 'NOOP';
        this.logger.debug('Entering idle with ' + this._enteredIdle);

        if (this._enteredIdle === 'NOOP') {
            this._idleTimeout = setTimeout(() => {
                this.logger.debug('Sending NOOP');
                this.exec('NOOP');
            }, this.TIMEOUT_NOOP);
        } else if (this._enteredIdle === 'IDLE') {
            this.client.enqueueCommand({
                command: 'IDLE'
            });
            this._idleTimeout = setTimeout(() => {
                this.client.send('DONE\r\n');
                this._enteredIdle = false;
                this.logger.debug('Idle terminated');
            }, this.TIMEOUT_IDLE);
        }
    };

    /**
     * Stops actions related idling, if IDLE is supported, sends DONE to stop it
     */
    Client.prototype.breakIdle = function() {
        if (!this._enteredIdle) {
            return;
        }

        clearTimeout(this._idleTimeout);
        if (this._enteredIdle === 'IDLE') {
            this.client.send('DONE\r\n');
            this.logger.debug('Idle terminated');
        }
        this._enteredIdle = false;
    };

    /**
     * Runs STARTTLS command if needed
     *
     * STARTTLS details:
     *   http://tools.ietf.org/html/rfc3501#section-6.2.1
     *
     * @param {Boolean} [forced] By default the command is not run if capability is already listed. Set to true to skip this validation
     */
    Client.prototype.upgradeConnection = function() {
        // skip request, if already secured
        if (this.client.secureMode) {
            return Promise.resolve(false);
        }

        // skip if STARTTLS not available or starttls support disabled
        if ((this._capability.indexOf('STARTTLS') < 0 || this.options.ignoreTLS) && !this.options.requireTLS) {
            return Promise.resolve(false);
        }

        this.logger.debug('Encrypting connection...');
        return this.exec('STARTTLS').then(() => {
            this._capability = [];
            this.client.upgrade();
            return this.updateCapability();
        });
    };

    /**
     * Runs CAPABILITY command
     *
     * CAPABILITY details:
     *   http://tools.ietf.org/html/rfc3501#section-6.1.1
     *
     * Doesn't register untagged CAPABILITY handler as this is already
     * handled by global handler
     *
     * @param {Boolean} [forced] By default the command is not run if capability is already listed. Set to true to skip this validation
     */
    Client.prototype.updateCapability = function(forced) {
        // skip request, if not forced update and capabilities are already loaded
        if (!forced && this._capability.length) {
            return Promise.resolve();
        }

        // If STARTTLS is required then skip capability listing as we are going to try
        // STARTTLS anyway and we re-check capabilities after connection is secured
        if (!this.client.secureMode && this.options.requireTLS) {
            return Promise.resolve();
        }

        this.logger.debug('Updating capability...');
        return this.exec('CAPABILITY');
    };

    Client.prototype.hasCapability = function(capa) {
        return this._capability.indexOf((capa || '').toString().toUpperCase().trim()) >= 0;
    };

    // Default handlers for untagged responses

    /**
     * Checks if an untagged OK includes [CAPABILITY] tag and updates capability object
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    Client.prototype._untaggedOkHandler = function(response) {
        if (response && response.capability) {
            this._capability = response.capability;
        }
    };

    /**
     * Updates capability object
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    Client.prototype._untaggedCapabilityHandler = function(response) {
        this._capability = [].concat(response && response.attributes || []).map((capa) => (capa.value || '').toString().toUpperCase().trim());
    };

    /**
     * Updates existing message count
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    Client.prototype._untaggedExistsHandler = function(response) {
        if (response && response.hasOwnProperty('nr')) {
            this.onupdate && this.onupdate(this._selectedMailbox, 'exists', response.nr);
        }
    };

    /**
     * Indicates a message has been deleted
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    Client.prototype._untaggedExpungeHandler = function(response) {
        if (response && response.hasOwnProperty('nr')) {
            this.onupdate && this.onupdate(this._selectedMailbox, 'expunge', response.nr);
        }
    };

    /**
     * Indicates that flags have been updated for a message
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */
    Client.prototype._untaggedFetchHandler = function(response) {
        this.onupdate && this.onupdate(this._selectedMailbox, 'fetch', [].concat(this._parseFETCH({
            payload: {
                FETCH: [response]
            }
        }) || []).shift());
    };

    // Private helpers

    /**
     * Parses SELECT response
     *
     * @param {Object} response
     * @return {Object} Mailbox information object
     */
    Client.prototype._parseSELECT = function(response) {
        if (!response || !response.payload) {
            return;
        }

        var mailbox = {
                readOnly: response.code === 'READ-ONLY'
            },

            existsResponse = response.payload.EXISTS && response.payload.EXISTS.pop(),
            flagsResponse = response.payload.FLAGS && response.payload.FLAGS.pop(),
            okResponse = response.payload.OK;

        if (existsResponse) {
            mailbox.exists = existsResponse.nr || 0;
        }

        if (flagsResponse && flagsResponse.attributes && flagsResponse.attributes.length) {
            mailbox.flags = flagsResponse.attributes[0].map((flag) => (flag.value || '').toString().trim());
        }

        [].concat(okResponse || []).forEach((ok) => {
            switch (ok && ok.code) {
                case 'PERMANENTFLAGS':
                    mailbox.permanentFlags = [].concat(ok.permanentflags || []);
                    break;
                case 'UIDVALIDITY':
                    mailbox.uidValidity = Number(ok.uidvalidity) || 0;
                    break;
                case 'UIDNEXT':
                    mailbox.uidNext = Number(ok.uidnext) || 0;
                    break;
                case 'HIGHESTMODSEQ':
                    mailbox.highestModseq = ok.highestmodseq || '0'; // keep 64bit uint as a string
                    break;
                case 'NOMODSEQ':
                    mailbox.noModseq = true;
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
    Client.prototype._parseNAMESPACE = function(response) {
        if (!response.payload || !response.payload.NAMESPACE || !response.payload.NAMESPACE.length) {
            return false;
        }

        var attributes = [].concat(response.payload.NAMESPACE.pop().attributes || []);
        if (!attributes.length) {
            return false;
        }

        return {
            personal: this._parseNAMESPACEElement(attributes[0]),
            users: this._parseNAMESPACEElement(attributes[1]),
            shared: this._parseNAMESPACEElement(attributes[2])
        };
    };

    /**
     * Parses a NAMESPACE element
     *
     * @param {Object} element
     * @return {Object} Namespaces element object
     */
    Client.prototype._parseNAMESPACEElement = function(element) {
        if (!element) {
            return false;
        }

        element = [].concat(element || []);
        return element.map((ns) => {
            if (!ns || !ns.length) {
                return false;
            }

            return {
                prefix: ns[0].value,
                delimiter: ns[1] && ns[1].value // The delimiter can legally be NIL which maps to null
            };
        });
    };

    /**
     * Builds a FETCH command
     *
     * @param {String} sequence Message range selector
     * @param {Array} items List of elements to fetch (eg. `['uid', 'envelope']`).
     * @param {Object} [options] Optional options object. Use `{byUid:true}` for `UID FETCH`
     * @returns {Object} Structured IMAP command
     */
    Client.prototype._buildFETCHCommand = function(sequence, items, options) {
        var command = {
            command: options.byUid ? 'UID FETCH' : 'FETCH',
            attributes: [{
                type: 'SEQUENCE',
                value: sequence
            }]
        };

        if (options.valueAsString !== undefined) {
            command.valueAsString = options.valueAsString;
        }

        var query = [];

        items.forEach((item) => {
            var cmd;
            item = item.toUpperCase().trim();

            if (/^\w+$/.test(item)) {
                // alphanum strings can be used directly
                query.push({
                    type: 'ATOM',
                    value: item
                });
            } else if (item) {
                try {
                    // parse the value as a fake command, use only the attributes block
                    cmd = imapHandler.parser(mimefuncs.toTypedArray('* Z ' + item));
                    query = query.concat(cmd.attributes || []);
                } catch (E) {
                    // if parse failed, use the original string as one entity
                    query.push({
                        type: 'ATOM',
                        value: item
                    });
                }
            }
        });

        if (query.length === 1) {
            query = query.pop();
        }

        command.attributes.push(query);

        if (options.changedSince) {
            command.attributes.push([{
                type: 'ATOM',
                value: 'CHANGEDSINCE'
            }, {
                type: 'ATOM',
                value: options.changedSince
            }]);
        }

        return command;
    };

    /**
     * Parses FETCH response
     *
     * @param {Object} response
     * @return {Object} Message object
     */
    Client.prototype._parseFETCH = function(response) {
        if (!response || !response.payload || !response.payload.FETCH || !response.payload.FETCH.length) {
            return [];
        }

        var list = [];
        var messages = {};

        [].concat(response.payload.FETCH || []).forEach((item) => {
            var params = [].concat([].concat(item.attributes || [])[0] || []); // ensure the first value is an array
            var message;
            var i, len, key;

            if (messages[item.nr]) {
                // same sequence number is already used, so merge values instead of creating a new message object
                message = messages[item.nr];
            } else {
                messages[item.nr] = message = {
                    '#': item.nr
                };
                list.push(message);
            }

            for (i = 0, len = params.length; i < len; i++) {
                if (i % 2 === 0) {
                    key = imapHandler.compiler({
                        attributes: [params[i]]
                    }).toLowerCase().replace(/<\d+>$/, '');
                    continue;
                }
                message[key] = this._parseFetchValue(key, params[i]);
            }
        });

        return list;
    };

    /**
     * Parses a single value from the FETCH response object
     *
     * @param {String} key Key name (uppercase)
     * @param {Mized} value Value for the key
     * @return {Mixed} Processed value
     */
    Client.prototype._parseFetchValue = function(key, value) {
        if (!value) {
            return null;
        }

        if (!Array.isArray(value)) {
            switch (key) {
                case 'uid':
                case 'rfc822.size':
                    return Number(value.value) || 0;
                case 'modseq': // do not cast 64 bit uint to a number
                    return value.value || '0';
            }
            return value.value;
        }

        switch (key) {
            case 'flags':
            case 'x-gm-labels':
                value = [].concat(value).map((flag) => (flag.value || ''));
                break;
            case 'envelope':
                value = this._parseENVELOPE([].concat(value || []));
                break;
            case 'bodystructure':
                value = this._parseBODYSTRUCTURE([].concat(value || []));
                break;
            case 'modseq':
                value = (value.shift() || {}).value || '0';
                break;
        }

        return value;
    };

    /**
     * Parses message envelope from FETCH response. All keys in the resulting
     * object are lowercase. Address fields are all arrays with {name:, address:}
     * structured values. Unicode strings are automatically decoded.
     *
     * @param {Array} value Envelope array
     * @param {Object} Envelope object
     */
    Client.prototype._parseENVELOPE = function(value) {
        var envelope = {};

        /*
         * ENVELOPE lists addresses as [name-part, source-route, username, hostname]
         * where source-route is not used anymore and can be ignored.
         * To get comparable results with other parts of the email.js stack
         * browserbox feeds the parsed address values from ENVELOPE
         * to addressparser and uses resulting values instead of the
         * pre-parsed addresses
         */
        var processAddresses = (list) => {
            return [].concat(list || []).map((addr) => {

                var name = (addr[0] && addr[0].value || '').trim();
                var address = (addr[2] && addr[2].value || '') + '@' + (addr[3] && addr[3].value || '');
                var formatted;

                if (!name) {
                    formatted = address;
                } else {
                    formatted = this._encodeAddressName(name) + ' <' + address + '>';
                }

                var parsed = addressparser.parse(formatted).shift(); // there should bu just a single address
                parsed.name = mimefuncs.mimeWordsDecode(parsed.name);
                return parsed;
            });
        };

        if (value[0] && value[0].value) {
            envelope.date = value[0].value;
        }

        if (value[1] && value[1].value) {
            envelope.subject = mimefuncs.mimeWordsDecode(value[1] && value[1].value);
        }

        if (value[2] && value[2].length) {
            envelope.from = processAddresses(value[2]);
        }

        if (value[3] && value[3].length) {
            envelope.sender = processAddresses(value[3]);
        }

        if (value[4] && value[4].length) {
            envelope['reply-to'] = processAddresses(value[4]);
        }

        if (value[5] && value[5].length) {
            envelope.to = processAddresses(value[5]);
        }

        if (value[6] && value[6].length) {
            envelope.cc = processAddresses(value[6]);
        }

        if (value[7] && value[7].length) {
            envelope.bcc = processAddresses(value[7]);
        }

        if (value[8] && value[8].value) {
            envelope['in-reply-to'] = value[8].value;
        }

        if (value[9] && value[9].value) {
            envelope['message-id'] = value[9].value;
        }

        return envelope;
    };

    /**
     * Parses message body structure from FETCH response.
     *
     * TODO: implement actual handler
     *
     * @param {Array} value BODYSTRUCTURE array
     * @param {Object} Envelope object
     */
    Client.prototype._parseBODYSTRUCTURE = function(value) {
        var processNode = (node, path) => {
            path = path || [];

            var curNode = {},
                i = 0,
                key, part = 0;

            if (path.length) {
                curNode.part = path.join('.');
            }

            // multipart
            if (Array.isArray(node[0])) {
                curNode.childNodes = [];
                while (Array.isArray(node[i])) {
                    curNode.childNodes.push(processNode(node[i], path.concat(++part)));
                    i++;
                }

                // multipart type
                curNode.type = 'multipart/' + ((node[i++] || {}).value || '').toString().toLowerCase();

                // extension data (not available for BODY requests)

                // body parameter parenthesized list
                if (i < node.length - 1) {
                    if (node[i]) {
                        curNode.parameters = {};
                        [].concat(node[i] || []).forEach((val, j) => {
                            if (j % 2) {
                                curNode.parameters[key] = mimefuncs.mimeWordsDecode((val && val.value || '').toString());
                            } else {
                                key = (val && val.value || '').toString().toLowerCase();
                            }
                        });
                    }
                    i++;
                }
            } else {
                // content type
                curNode.type = [
                    ((node[i++] || {}).value || '').toString().toLowerCase(), ((node[i++] || {}).value || '').toString().toLowerCase()
                ].join('/');

                // body parameter parenthesized list
                if (node[i]) {
                    curNode.parameters = {};
                    [].concat(node[i] || []).forEach((val, j) => {
                        if (j % 2) {
                            curNode.parameters[key] = mimefuncs.mimeWordsDecode((val && val.value || '').toString());
                        } else {
                            key = (val && val.value || '').toString().toLowerCase();
                        }
                    });
                }
                i++;

                // id
                if (node[i]) {
                    curNode.id = ((node[i] || {}).value || '').toString();
                }
                i++;

                // description
                if (node[i]) {
                    curNode.description = ((node[i] || {}).value || '').toString();
                }
                i++;

                // encoding
                if (node[i]) {
                    curNode.encoding = ((node[i] || {}).value || '').toString().toLowerCase();
                }
                i++;

                // size
                if (node[i]) {
                    curNode.size = Number((node[i] || {}).value || 0) || 0;
                }
                i++;

                if (curNode.type === 'message/rfc822') {
                    // message/rfc adds additional envelope, bodystructure and line count values

                    // envelope
                    if (node[i]) {
                        curNode.envelope = this._parseENVELOPE([].concat(node[i] || []));
                    }
                    i++;

                    if (node[i]) {
                        curNode.childNodes = [
                            // rfc822 bodyparts share the same path, difference is between MIME and HEADER
                            // path.MIME returns message/rfc822 header
                            // path.HEADER returns inlined message header
                            processNode(node[i], path)
                        ];
                    }
                    i++;

                    // line count
                    if (node[i]) {
                        curNode.lineCount = Number((node[i] || {}).value || 0) || 0;
                    }
                    i++;

                } else if (/^text\//.test(curNode.type)) {
                    // text/* adds additional line count values

                    // line count
                    if (node[i]) {
                        curNode.lineCount = Number((node[i] || {}).value || 0) || 0;
                    }
                    i++;

                }

                // extension data (not available for BODY requests)

                // md5
                if (i < node.length - 1) {
                    if (node[i]) {
                        curNode.md5 = ((node[i] || {}).value || '').toString().toLowerCase();
                    }
                    i++;
                }
            }

            // the following are shared extension values (for both multipart and non-multipart parts)
            // not available for BODY requests

            // body disposition
            if (i < node.length - 1) {
                if (Array.isArray(node[i]) && node[i].length) {
                    curNode.disposition = ((node[i][0] || {}).value || '').toString().toLowerCase();
                    if (Array.isArray(node[i][1])) {
                        curNode.dispositionParameters = {};
                        [].concat(node[i][1] || []).forEach((val, j) => {
                            if (j % 2) {
                                curNode.dispositionParameters[key] = mimefuncs.mimeWordsDecode((val && val.value || '').toString());
                            } else {
                                key = (val && val.value || '').toString().toLowerCase();
                            }
                        });
                    }
                }
                i++;
            }

            // body language
            if (i < node.length - 1) {
                if (node[i]) {
                    curNode.language = [].concat(node[i] || []).map((val) => (val && val.value || '').toString().toLowerCase());
                }
                i++;
            }

            // body location
            // NB! defined as a "string list" in RFC3501 but replaced in errata document with "string"
            // Errata: http://www.rfc-editor.org/errata_search.php?rfc=3501
            if (i < node.length - 1) {
                if (node[i]) {
                    curNode.location = ((node[i] || {}).value || '').toString();
                }
                i++;
            }

            return curNode;
        };

        return processNode(value);
    };

    /**
     * Compiles a search query into an IMAP command. Queries are composed as objects
     * where keys are search terms and values are term arguments. Only strings,
     * numbers and Dates are used. If the value is an array, the members of it
     * are processed separately (use this for terms that require multiple params).
     * If the value is a Date, it is converted to the form of "01-Jan-1970".
     * Subqueries (OR, NOT) are made up of objects
     *
     *    {unseen: true, header: ["subject", "hello world"]};
     *    SEARCH UNSEEN HEADER "subject" "hello world"
     *
     * @param {Object} query Search query
     * @param {Object} [options] Option object
     * @param {Boolean} [options.byUid] If ture, use UID SEARCH instead of SEARCH
     * @return {Object} IMAP command object
     */
    Client.prototype._buildSEARCHCommand = function(query, options) {
        var command = {
            command: options.byUid ? 'UID SEARCH' : 'SEARCH'
        };

        var isAscii = true;

        var buildTerm = (query) => {
            var list = [];

            Object.keys(query).forEach((key) => {
                var params = [];
                var formatDate = (date) => date.toUTCString().replace(/^\w+, 0?(\d+) (\w+) (\d+).*/, "$1-$2-$3");
                var escapeParam = (param) => {
                    if (typeof param === "number") {
                        return {
                            type: "number",
                            value: param
                        };
                    } else if (typeof param === "string") {
                        if (/[\u0080-\uFFFF]/.test(param)) {
                            isAscii = false;
                            return {
                                type: "literal",
                                // cast unicode string to pseudo-binary as imap-handler compiles strings as octets
                                value: mimefuncs.fromTypedArray(mimefuncs.charset.encode(param))
                            };
                        }
                        return {
                            type: "string",
                            value: param
                        };
                    } else if (Object.prototype.toString.call(param) === "[object Date]") {
                        // RFC 3501 allows for dates to be placed in
                        // double-quotes or left without quotes.  Some
                        // servers (Yandex), do not like the double quotes,
                        // so we treat the date as an atom.
                        return {
                            type: "atom",
                            value: formatDate(param)
                        };
                    } else if (Array.isArray(param)) {
                        return param.map(escapeParam);
                    } else if (typeof param === "object") {
                        return buildTerm(param);
                    }
                };

                params.push({
                    type: "atom",
                    value: key.toUpperCase()
                });

                [].concat(query[key] || []).forEach((param) => {
                    switch (key.toLowerCase()) {
                        case 'uid':
                            param = {
                                type: "sequence",
                                value: param
                            };
                            break;
                            // The Gmail extension values of X-GM-THRID and
                            // X-GM-MSGID are defined to be unsigned 64-bit integers
                            // and they must not be quoted strings or the server
                            // will report a parse error.
                        case 'x-gm-thrid':
                        case 'x-gm-msgid':
                            param = {
                                type: "number",
                                value: param
                            };
                            break;
                        default:
                            param = escapeParam(param);
                    }
                    if (param) {
                        params = params.concat(param || []);
                    }
                });
                list = list.concat(params || []);
            });

            return list;
        };

        command.attributes = [].concat(buildTerm(query || {}) || []);

        // If any string input is using 8bit bytes, prepend the optional CHARSET argument
        if (!isAscii) {
            command.attributes.unshift({
                type: "atom",
                value: "UTF-8"
            });
            command.attributes.unshift({
                type: "atom",
                value: "CHARSET"
            });
        }

        return command;
    };

    /**
     * Binary Search
     *
     * @param {Array} haystack Ordered array
     * @param {any} needle Item to search for in haystack
     * @param {Function} comparator Function that defines the sort order
     * @return {Number} Index of needle in haystack or if not found,
     *     -Index-1 is the position where needle could be inserted while still
     *     keeping haystack ordered.
     */
    Client.prototype._binSearch = function(haystack, needle, comparator) {
        var mid, cmp;
        var low = 0;
        var high = haystack.length - 1;

        while (low <= high) {
            // Note that "(low + high) >>> 1" may overflow, and results in
            // a typecast to double (which gives the wrong results).
            mid = low + (high - low >> 1);
            cmp = +comparator(haystack[mid], needle);

            if (cmp < 0.0) {
                // too low
                low = mid + 1;
            } else if (cmp > 0.0) {
                // too high
                high = mid - 1;
            } else {
                // key found
                return mid;
            }
        }

        // key not found
        return ~low;
    };

    /**
     * Parses SEARCH response. Gathers all untagged SEARCH responses, fetched seq./uid numbers
     * and compiles these into a sorted array.
     *
     * @param {Object} response
     * @return {Object} Message object
     * @param {Array} Sorted Seq./UID number list
     */
    Client.prototype._parseSEARCH = function(response) {
        var cmp = (a, b) => (a - b);
        var list = [];

        if (!response || !response.payload || !response.payload.SEARCH || !response.payload.SEARCH.length) {
            return [];
        }

        [].concat(response.payload.SEARCH || []).forEach((result) => {
            [].concat(result.attributes || []).forEach((nr) => {
                nr = Number(nr && nr.value || nr || 0) || 0;
                var idx = this._binSearch(list, nr, cmp);
                if (idx < 0) {
                    list.splice(-idx-1, 0, nr);
                }
            });
        });

        return list;
    };

    /**
     * Creates an IMAP STORE command from the selected arguments
     */
    Client.prototype._buildSTORECommand = function(sequence, action, flags, options) {
        var command = {
            command: options.byUid ? 'UID STORE' : 'STORE',
            attributes: [{
                type: 'sequence',
                value: sequence
            }]
        };

        command.attributes.push({
            type: 'atom',
            value: (action || '').toString().toUpperCase() + (options.silent ? '.SILENT' : '')
        });

        command.attributes.push(flags.map((flag) => {
            return {
                type: 'atom',
                value: flag
            };
        }));

        return command;
    };

    /**
     * Updates the IMAP state value for the current connection
     *
     * @param {Number} newState The state you want to change to
     */
    Client.prototype._changeState = function(newState) {
        if (newState === this._state) {
            return;
        }

        this.logger.debug('Entering state: ' + newState);

        // if a mailbox was opened, emit onclosemailbox and clear selectedMailbox value
        if (this._state === this.STATE_SELECTED && this._selectedMailbox) {
            this.onclosemailbox && this.onclosemailbox(this._selectedMailbox);
            this._selectedMailbox = false;
        }

        this._state = newState;
    };

    /**
     * Ensures a path exists in the Mailbox tree
     *
     * @param {Object} tree Mailbox tree
     * @param {String} path
     * @param {String} delimiter
     * @return {Object} branch for used path
     */
    Client.prototype._ensurePath = function(tree, path, delimiter) {
        var names = path.split(delimiter);
        var branch = tree;
        var i, j, found;

        for (i = 0; i < names.length; i++) {
            found = false;
            for (j = 0; j < branch.children.length; j++) {
                if (this._compareMailboxNames(branch.children[j].name, utf7.imap.decode(names[i]))) {
                    branch = branch.children[j];
                    found = true;
                    break;
                }
            }
            if (!found) {
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
     * Compares two mailbox names. Case insensitive in case of INBOX, otherwise case sensitive
     *
     * @param {String} a Mailbox name
     * @param {String} b Mailbox name
     * @returns {Boolean} True if the folder names match
     */
    Client.prototype._compareMailboxNames = function(a, b) {
        return (a.toUpperCase() === 'INBOX' ? 'INBOX' : a) === (b.toUpperCase() === 'INBOX' ? 'INBOX' : b);
    };

    /**
     * Checks if a mailbox is for special use
     *
     * @param {Object} mailbox
     * @return {String} Special use flag (if detected)
     */
    Client.prototype._checkSpecialUse = function(mailbox) {
        var i, type;

        if (mailbox.flags) {
            for (i = 0; i < SPECIAL_USE_FLAGS.length; i++) {
                type = SPECIAL_USE_FLAGS[i];
                if ((mailbox.flags || []).indexOf(type) >= 0) {
                    mailbox.specialUse = type;
                    mailbox.specialUseFlag = type;
                    return type;
                }
            }
        }

        return this._checkSpecialUseByName(mailbox);
    };

    Client.prototype._checkSpecialUseByName = function(mailbox) {
        var name = (mailbox.name || '').toLowerCase().trim(),
            i, type;

        for (i = 0; i < SPECIAL_USE_BOX_FLAGS.length; i++) {
            type = SPECIAL_USE_BOX_FLAGS[i];
            if (SPECIAL_USE_BOXES[type].indexOf(name) >= 0) {
                mailbox.specialUse = type;
                return type;
            }
        }

        return false;
    };

    /**
     * Builds a login token for XOAUTH2 authentication command
     *
     * @param {String} user E-mail address of the user
     * @param {String} token Valid access token for the user
     * @return {String} Base64 formatted login token
     */
    Client.prototype._buildXOAuth2Token = function(user, token) {
        var authData = [
            'user=' + (user || ''),
            'auth=Bearer ' + token,
            '',
            ''
        ];
        return mimefuncs.base64.encode(authData.join('\x01'));
    };

    /**
     * If needed, encloses with quotes or mime encodes the name part of an e-mail address
     *
     * @param {String} name Name part of an address
     * @returns {String} Mime word encoded or quoted string
     */
    Client.prototype._encodeAddressName = function(name) {
        if (!/^[\w ']*$/.test(name)) {
            if (/^[\x20-\x7e]*$/.test(name)) {
                return JSON.stringify(name);
            } else {
                return mimefuncs.mimeWordEncode(name, 'Q', 52);
            }
        }
        return name;
    };

    Client.prototype.LOG_LEVEL_NONE = 1000;
    Client.prototype.LOG_LEVEL_ERROR = 40;
    Client.prototype.LOG_LEVEL_WARN = 30;
    Client.prototype.LOG_LEVEL_INFO = 20;
    Client.prototype.LOG_LEVEL_DEBUG = 10;
    Client.prototype.LOG_LEVEL_ALL = 0;

    Client.prototype.createLogger = function() {
        var createLogger = (tag) => {
            var log = (level, messages) => {
                messages = messages.map(msg => typeof msg === 'function' ? msg() : msg);
                var logMessage = '[' + new Date().toISOString() + '][' + tag + '][' +
                    this.options.auth.user + '][' + this.client.host  + '] ' + messages.join(' ');
                if (level === this.LOG_LEVEL_DEBUG) {
                   console.log('[DEBUG]' + logMessage);
                } else if (level === this.LOG_LEVEL_INFO) {
                   console.info('[INFO]' + logMessage);
                } else if (level === this.LOG_LEVEL_WARN) {
                   console.warn('[WARN]' + logMessage);
                } else if (level === this.LOG_LEVEL_ERROR) {
                   console.error('[ERROR]' + logMessage);
                }
            };

            return {
                // this could become way nicer when node supports the rest operator...
                debug: function(msgs){ log(this.LOG_LEVEL_DEBUG, msgs); }.bind(this),
                info: function(msgs){ log(this.LOG_LEVEL_INFO, msgs); }.bind(this),
                warn: function(msgs){ log(this.LOG_LEVEL_WARN, msgs); }.bind(this),
                error: function(msgs){ log(this.LOG_LEVEL_ERROR, msgs); }.bind(this)
            };
        };

        var logger = this.options.logger || createLogger(this.options.sessionId || 1);
        this.logger = this.client.logger = {
            // this could become way nicer when node supports the rest operator...
            debug: function() {
                if (this.LOG_LEVEL_DEBUG >= this.logLevel) {
                    logger.debug(Array.prototype.slice.call(arguments));
                }
            }.bind(this),
            info: function() {
                if (this.LOG_LEVEL_INFO >= this.logLevel) {
                    logger.info(Array.prototype.slice.call(arguments));
                }
            }.bind(this),
            warn: function() {
                if (this.LOG_LEVEL_WARN >= this.logLevel) {
                    logger.warn(Array.prototype.slice.call(arguments));
                }
            }.bind(this),
            error: function() {
                if (this.LOG_LEVEL_ERROR >= this.logLevel) {
                    logger.error(Array.prototype.slice.call(arguments));
                }
            }.bind(this)
        };
    };

    return Client;
}));
