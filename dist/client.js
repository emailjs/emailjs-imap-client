'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = Client;

var _ramda = require('ramda');

var _imap = require('./imap');

var _imap2 = _interopRequireDefault(_imap);

var _emailjsBase = require('emailjs-base64');

var _emailjsUtf = require('emailjs-utf7');

var _emailjsImapHandler = require('emailjs-imap-handler');

var _emailjsMimeCodec = require('emailjs-mime-codec');

var _emailjsAddressparser = require('emailjs-addressparser');

var _emailjsAddressparser2 = _interopRequireDefault(_emailjsAddressparser);

var _common = require('./common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  var _this = this;

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

  this.client = new _imap2.default(host, port, this.options); // IMAP client object

  // Event Handlers
  this.client.onerror = this._onError.bind(this);
  this.client.oncert = function (cert) {
    return _this.oncert && _this.oncert(cert);
  }; // allows certificate handling for platforms w/o native tls support
  this.client.onidle = function () {
    return _this._onIdle();
  }; // start idling

  // Default handlers for untagged responses
  this.client.setHandler('capability', function (response) {
    return _this._untaggedCapabilityHandler(response);
  }); // capability updates
  this.client.setHandler('ok', function (response) {
    return _this._untaggedOkHandler(response);
  }); // notifications
  this.client.setHandler('exists', function (response) {
    return _this._untaggedExistsHandler(response);
  }); // message count has changed
  this.client.setHandler('expunge', function (response) {
    return _this._untaggedExpungeHandler(response);
  }); // message has been deleted
  this.client.setHandler('fetch', function (response) {
    return _this._untaggedFetchHandler(response);
  }); // message has been updated (eg. flag change)

  // Activate logging
  this.createLogger();
  this.logLevel = this.LOG_LEVEL_ALL;
}

/**
 * Called if the lower-level ImapClient has encountered an unrecoverable
 * error during operation. Cleans up and propagates the error upwards.
 */
Client.prototype._onError = function (err) {
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
Client.prototype.connect = function () {
  var _this2 = this;

  return new Promise(function (resolve, reject) {
    var connectionTimeout = setTimeout(function () {
      return reject(new Error('Timeout connecting to server'));
    }, _this2.TIMEOUT_CONNECTION);
    _this2.logger.debug('Connecting to', _this2.client.host, ':', _this2.client.port);
    _this2._changeState(_this2.STATE_CONNECTING);
    _this2.client.connect().then(function () {
      _this2.logger.debug('Socket opened, waiting for greeting from the server...');

      _this2.client.onready = function () {
        clearTimeout(connectionTimeout);
        resolve();
      };

      _this2.client.onerror = function (err) {
        clearTimeout(connectionTimeout);
        reject(err);
      };
    }).catch(reject);
  }).then(function () {
    _this2._changeState(_this2.STATE_NOT_AUTHENTICATED);
    return _this2.updateCapability();
  }).then(function () {
    return _this2.upgradeConnection();
  }).then(function () {
    return _this2.updateId(_this2.options.id).catch(function (err) {
      return _this2.logger.warn('Failed to update id', err);
    });
  }).then(function () {
    return _this2.login(_this2.options.auth);
  }).then(function () {
    return _this2.compressConnection();
  }).then(function () {
    _this2.logger.debug('Connection established, ready to roll!');
    _this2.client.onerror = _this2._onError.bind(_this2);
  }).catch(function (err) {
    _this2.logger.error('Could not connect to server', err);
    _this2.close(err); // we don't really care whether this works or not
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
Client.prototype.logout = function () {
  var _this3 = this;

  this._changeState(this.STATE_LOGOUT);
  this.logger.debug('Logging out...');
  return this.client.logout().then(function () {
    clearTimeout(_this3._idleTimeout);
  });
};

/**
 * Force-closes the current connection by closing the TCP socket.
 *
 * @returns {Promise} Resolves when socket is closed
 */
Client.prototype.close = function (err) {
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
Client.prototype.updateId = function (id) {
  var _this4 = this;

  if (this._capability.indexOf('ID') < 0) {
    return Promise.resolve();
  }

  var attributes = [[]];
  if (id) {
    if (typeof id === 'string') {
      id = {
        name: id
      };
    }
    Object.keys(id).forEach(function (key) {
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
  }, 'ID').then(function (response) {
    if (!response.payload || !response.payload.ID || !response.payload.ID.length) {
      return;
    }

    _this4.serverId = {};

    var key = void 0;
    [].concat([].concat(response.payload.ID.shift().attributes || []).shift() || []).forEach(function (val, i) {
      if (i % 2 === 0) {
        key = (0, _ramda.propOr)('', 'value')(val).toLowerCase().trim();
      } else {
        _this4.serverId[key] = (0, _ramda.propOr)('', 'value')(val);
      }
    });

    _this4.logger.debug('Server id updated!', _this4.serverId);
  });
};

Client.prototype._shouldSelectMailbox = function (path, ctx) {
  if (!ctx) {
    return true;
  }

  var previousSelect = this.client.getPreviouslyQueued(['SELECT', 'EXAMINE'], ctx);
  if (previousSelect && previousSelect.request.attributes) {
    var pathAttribute = previousSelect.request.attributes.find(function (attribute) {
      return attribute.type === 'STRING';
    });
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
Client.prototype.selectMailbox = function (path, options) {
  var _this5 = this;

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
  }).then(function (response) {
    _this5._changeState(_this5.STATE_SELECTED);

    if (_this5._selectedMailbox && _this5._selectedMailbox !== path) {
      _this5.onclosemailbox && _this5.onclosemailbox(_this5._selectedMailbox);
    }

    _this5._selectedMailbox = path;

    var mailboxInfo = _this5._parseSELECT(response);

    var maybePromise = _this5.onselectmailbox && _this5.onselectmailbox(path, mailboxInfo);
    if (maybePromise && typeof maybePromise.then === 'function') {
      return maybePromise.then(function () {
        return mailboxInfo;
      });
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
Client.prototype.listNamespaces = function () {
  var _this6 = this;

  if (this._capability.indexOf('NAMESPACE') < 0) {
    return Promise.resolve(false);
  }

  this.logger.debug('Listing namespaces...');
  return this.exec('NAMESPACE', 'NAMESPACE').then(function (response) {
    return _this6._parseNAMESPACE(response);
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
Client.prototype.listMailboxes = function () {
  var _this7 = this;

  var tree = void 0;

  this.logger.debug('Listing mailboxes...');
  return this.exec({
    command: 'LIST',
    attributes: ['', '*']
  }, 'LIST').then(function (response) {
    tree = {
      root: true,
      children: []
    };

    if (!response.payload || !response.payload.LIST || !response.payload.LIST.length) {
      return;
    }

    response.payload.LIST.forEach(function (item) {
      if (!item || !item.attributes || item.attributes.length < 3) {
        return;
      }
      var branch = _this7._ensurePath(tree, (item.attributes[2].value || '').toString(), (item.attributes[1] ? item.attributes[1].value : '/').toString());
      branch.flags = [].concat(item.attributes[0] || []).map(function (flag) {
        return (flag.value || '').toString();
      });
      branch.listed = true;
      _this7._checkSpecialUse(branch);
    });
  }).then(function () {
    return _this7.exec({
      command: 'LSUB',
      attributes: ['', '*']
    }, 'LSUB');
  }).then(function (response) {
    if (!response.payload || !response.payload.LSUB || !response.payload.LSUB.length) {
      return tree;
    }

    response.payload.LSUB.forEach(function (item) {
      if (!item || !item.attributes || item.attributes.length < 3) {
        return;
      }
      var branch = _this7._ensurePath(tree, (item.attributes[2].value || '').toString(), (item.attributes[1] ? item.attributes[1].value : '/').toString());
      [].concat(item.attributes[0] || []).map(function (flag) {
        flag = (flag.value || '').toString();
        if (!branch.flags || branch.flags.indexOf(flag) < 0) {
          branch.flags = [].concat(branch.flags || []).concat(flag);
        }
      });
      branch.subscribed = true;
    });
    return tree;
  }).catch(function (err) {
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
Client.prototype.createMailbox = function (path) {
  this.logger.debug('Creating mailbox', path, '...');
  return this.exec({
    command: 'CREATE',
    attributes: [(0, _emailjsUtf.imapEncode)(path)]
  }).catch(function (err) {
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
Client.prototype.listMessages = function (path, sequence, items, options) {
  var _this8 = this;

  items = items || [{
    fast: true
  }];
  options = options || {};

  this.logger.debug('Fetching messages', sequence, 'from', path, '...');
  var command = this._buildFETCHCommand(sequence, items, options);
  return this.exec(command, 'FETCH', {
    precheck: function precheck(ctx) {
      return _this8._shouldSelectMailbox(path, ctx) ? _this8.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
    }
  }).then(function (response) {
    return _this8._parseFETCH(response);
  });
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
Client.prototype.search = function (path, query, options) {
  var _this9 = this;

  options = options || {};

  this.logger.debug('Searching in', path, '...');
  var command = this._buildSEARCHCommand(query, options);
  return this.exec(command, 'SEARCH', {
    precheck: function precheck(ctx) {
      return _this9._shouldSelectMailbox(path, ctx) ? _this9.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
    }
  }).then(function (response) {
    return _this9._parseSEARCH(response);
  });
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
Client.prototype.setFlags = function (path, sequence, flags, options) {
  var key = '';
  var list = [];

  if (Array.isArray(flags) || (typeof flags === 'undefined' ? 'undefined' : _typeof(flags)) !== 'object') {
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
Client.prototype.store = function (path, sequence, action, flags, options) {
  var _this10 = this;

  options = options || {};

  var command = this._buildSTORECommand(sequence, action, flags, options);
  return this.exec(command, 'FETCH', {
    precheck: function precheck(ctx) {
      return _this10._shouldSelectMailbox(path, ctx) ? _this10.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
    }
  }).then(function (response) {
    return _this10._parseFETCH(response);
  });
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
Client.prototype.upload = function (destination, message, options) {
  options = options || {};
  options.flags = options.flags || ['\\Seen'];
  var flags = options.flags.map(function (flag) {
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
    }, flags, {
      type: 'literal',
      value: message
    }]
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
Client.prototype.deleteMessages = function (path, sequence, options) {
  var _this11 = this;

  options = options || {};

  // add \Deleted flag to the messages and run EXPUNGE or UID EXPUNGE
  this.logger.debug('Deleting messages', sequence, 'in', path, '...');
  return this.setFlags(path, sequence, {
    add: '\\Deleted'
  }, options).then(function () {
    var cmd = void 0;
    if (options.byUid && _this11._capability.indexOf('UIDPLUS') >= 0) {
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
    return _this11.exec(cmd, null, {
      precheck: function precheck(ctx) {
        return _this11._shouldSelectMailbox(path, ctx) ? _this11.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
      }
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
Client.prototype.copyMessages = function (path, sequence, destination, options) {
  var _this12 = this;

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
    precheck: function precheck(ctx) {
      return _this12._shouldSelectMailbox(path, ctx) ? _this12.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
    }
  }).then(function (response) {
    return response.humanReadable || 'COPY completed';
  });
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
Client.prototype.moveMessages = function (path, sequence, destination, options) {
  var _this13 = this;

  options = options || {};

  this.logger.debug('Moving messages', sequence, 'from', path, 'to', destination, '...');

  if (this._capability.indexOf('MOVE') === -1) {
    // Fallback to COPY + EXPUNGE
    return this.copyMessages(path, sequence, destination, options).then(function () {
      return _this13.deleteMessages(path, sequence, options);
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
    precheck: function precheck(ctx) {
      return _this13._shouldSelectMailbox(path, ctx) ? _this13.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
    }
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
Client.prototype.compressConnection = function () {
  var _this14 = this;

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
  }).then(function () {
    _this14.client.enableCompression();
    _this14.logger.debug('Compression enabled, all data sent and received is deflated!');
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
Client.prototype.login = function (auth) {
  var _this15 = this;

  var command = void 0;
  var options = {};

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
  return this.exec(command, 'capability', options).then(function (response) {
    /*
     * update post-auth capabilites
     * capability list shouldn't contain auth related stuff anymore
     * but some new extensions might have popped up that do not
     * make much sense in the non-auth state
     */
    if (response.capability && response.capability.length) {
      // capabilites were listed with the OK [CAPABILITY ...] response
      _this15._capability = [].concat(response.capability || []);
    } else if (response.payload && response.payload.CAPABILITY && response.payload.CAPABILITY.length) {
      // capabilites were listed with * CAPABILITY ... response
      _this15._capability = [].concat(response.payload.CAPABILITY.pop().attributes || []).map(function (capa) {
        return (capa.value || '').toString().toUpperCase().trim();
      });
    } else {
      // capabilities were not automatically listed, reload
      return _this15.updateCapability(true);
    }
  }).then(function () {
    _this15._changeState(_this15.STATE_AUTHENTICATED);
    _this15._authenticated = true;
    _this15.logger.debug('Login successful, post-auth capabilites updated!', _this15._capability);
  });
};

/**
 * Run an IMAP command.
 *
 * @param {Object} request Structured request object
 * @param {Array} acceptUntagged a list of untagged responses that will be included in 'payload' property
 */
Client.prototype.exec = function (request, acceptUntagged, options) {
  var _this16 = this;

  this.breakIdle();
  return this.client.enqueueCommand(request, acceptUntagged, options).then(function (response) {
    if (response && response.capability) {
      _this16._capability = response.capability;
    }
    return response;
  });
};

/**
 * Indicates that the connection started idling. Initiates a cycle
 * of NOOPs or IDLEs to receive notifications about updates in the server
 */
Client.prototype._onIdle = function () {
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
Client.prototype.enterIdle = function () {
  var _this17 = this;

  if (this._enteredIdle) {
    return;
  }
  this._enteredIdle = this._capability.indexOf('IDLE') >= 0 ? 'IDLE' : 'NOOP';
  this.logger.debug('Entering idle with ' + this._enteredIdle);

  if (this._enteredIdle === 'NOOP') {
    this._idleTimeout = setTimeout(function () {
      _this17.logger.debug('Sending NOOP');
      _this17.exec('NOOP');
    }, this.TIMEOUT_NOOP);
  } else if (this._enteredIdle === 'IDLE') {
    this.client.enqueueCommand({
      command: 'IDLE'
    });
    this._idleTimeout = setTimeout(function () {
      _this17.client.send('DONE\r\n');
      _this17._enteredIdle = false;
      _this17.logger.debug('Idle terminated');
    }, this.TIMEOUT_IDLE);
  }
};

/**
 * Stops actions related idling, if IDLE is supported, sends DONE to stop it
 */
Client.prototype.breakIdle = function () {
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
Client.prototype.upgradeConnection = function () {
  var _this18 = this;

  // skip request, if already secured
  if (this.client.secureMode) {
    return Promise.resolve(false);
  }

  // skip if STARTTLS not available or starttls support disabled
  if ((this._capability.indexOf('STARTTLS') < 0 || this.options.ignoreTLS) && !this.options.requireTLS) {
    return Promise.resolve(false);
  }

  this.logger.debug('Encrypting connection...');
  return this.exec('STARTTLS').then(function () {
    _this18._capability = [];
    _this18.client.upgrade();
    return _this18.updateCapability();
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
Client.prototype.updateCapability = function (forced) {
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

Client.prototype.hasCapability = function (capa) {
  return this._capability.indexOf((capa || '').toString().toUpperCase().trim()) >= 0;
};

// Default handlers for untagged responses

/**
 * Checks if an untagged OK includes [CAPABILITY] tag and updates capability object
 *
 * @param {Object} response Parsed server response
 * @param {Function} next Until called, server responses are not processed
 */
Client.prototype._untaggedOkHandler = function (response) {
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
Client.prototype._untaggedCapabilityHandler = function (response) {
  this._capability = [].concat((0, _ramda.propOr)([], 'attributes')(response)).map(function (capa) {
    return (capa.value || '').toString().toUpperCase().trim();
  });
};

/**
 * Updates existing message count
 *
 * @param {Object} response Parsed server response
 * @param {Function} next Until called, server responses are not processed
 */
Client.prototype._untaggedExistsHandler = function (response) {
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
Client.prototype._untaggedExpungeHandler = function (response) {
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
Client.prototype._untaggedFetchHandler = function (response) {
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
Client.prototype._parseSELECT = function (response) {
  if (!response || !response.payload) {
    return;
  }

  var mailbox = {
    readOnly: response.code === 'READ-ONLY'
  };
  var existsResponse = response.payload.EXISTS && response.payload.EXISTS.pop();
  var flagsResponse = response.payload.FLAGS && response.payload.FLAGS.pop();
  var okResponse = response.payload.OK;

  if (existsResponse) {
    mailbox.exists = existsResponse.nr || 0;
  }

  if (flagsResponse && flagsResponse.attributes && flagsResponse.attributes.length) {
    mailbox.flags = flagsResponse.attributes[0].map(function (flag) {
      return (flag.value || '').toString().trim();
    });
  }

  [].concat(okResponse || []).forEach(function (ok) {
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
Client.prototype._parseNAMESPACE = function (response) {
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
Client.prototype._parseNAMESPACEElement = function (element) {
  if (!element) {
    return false;
  }

  element = [].concat(element || []);
  return element.map(function (ns) {
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
Client.prototype._buildFETCHCommand = function (sequence, items, options) {
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

  items.forEach(function (item) {
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
        var cmd = (0, _emailjsImapHandler.parser)((0, _common.toTypedArray)('* Z ' + item));
        query = query.concat(cmd.attributes || []);
      } catch (e) {
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
Client.prototype._parseFETCH = function (response) {
  var _this19 = this;

  if (!response || !response.payload || !response.payload.FETCH || !response.payload.FETCH.length) {
    return [];
  }

  var list = [];
  var messages = {};

  [].concat(response.payload.FETCH || []).forEach(function (item) {
    var params = [].concat([].concat(item.attributes || [])[0] || []); // ensure the first value is an array
    var message = void 0;
    var i = void 0,
        len = void 0,
        key = void 0;

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
        key = (0, _emailjsImapHandler.compiler)({
          attributes: [params[i]]
        }).toLowerCase().replace(/<\d+>$/, '');
        continue;
      }
      message[key] = _this19._parseFetchValue(key, params[i]);
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
Client.prototype._parseFetchValue = function (key, value) {
  if (!value) {
    return null;
  }

  if (!Array.isArray(value)) {
    switch (key) {
      case 'uid':
      case 'rfc822.size':
        return Number(value.value) || 0;
      case 'modseq':
        // do not cast 64 bit uint to a number
        return value.value || '0';
    }
    return value.value;
  }

  switch (key) {
    case 'flags':
    case 'x-gm-labels':
      value = [].concat(value).map(function (flag) {
        return flag.value || '';
      });
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
Client.prototype._parseENVELOPE = function (value) {
  var _this20 = this;

  var envelope = {};

  /*
   * ENVELOPE lists addresses as [name-part, source-route, username, hostname]
   * where source-route is not used anymore and can be ignored.
   * To get comparable results with other parts of the email.js stack
   * browserbox feeds the parsed address values from ENVELOPE
   * to addressparser and uses resulting values instead of the
   * pre-parsed addresses
   */
  var processAddresses = function processAddresses(list) {
    return [].concat(list || []).map(function (addr) {
      var name = (0, _ramda.pathOr)('', ['0', 'value'])(addr).trim();
      var address = (0, _ramda.pathOr)('', ['2', 'value'])(addr) + '@' + (0, _ramda.pathOr)('', ['3', 'value'])(addr);
      var formatted = void 0;

      if (!name) {
        formatted = address;
      } else {
        formatted = _this20._encodeAddressName(name) + ' <' + address + '>';
      }

      var parsed = (0, _emailjsAddressparser2.default)(formatted).shift(); // there should bu just a single address
      parsed.name = (0, _emailjsMimeCodec.mimeWordsDecode)(parsed.name);
      return parsed;
    });
  };

  if (value[0] && value[0].value) {
    envelope.date = value[0].value;
  }

  if (value[1] && value[1].value) {
    envelope.subject = (0, _emailjsMimeCodec.mimeWordsDecode)(value[1] && value[1].value);
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
Client.prototype._parseBODYSTRUCTURE = function (value) {
  var _this21 = this;

  var processNode = function processNode(node) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var curNode = {};
    var i = 0;
    var key = void 0;
    var part = 0;

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
          [].concat(node[i] || []).forEach(function (val, j) {
            if (j % 2) {
              curNode.parameters[key] = (0, _emailjsMimeCodec.mimeWordsDecode)((0, _ramda.propOr)('', 'value')(val));
            } else {
              key = (0, _ramda.propOr)('', 'value')(val).toLowerCase();
            }
          });
        }
        i++;
      }
    } else {
      // content type
      curNode.type = [((node[i++] || {}).value || '').toString().toLowerCase(), ((node[i++] || {}).value || '').toString().toLowerCase()].join('/');

      // body parameter parenthesized list
      if (node[i]) {
        curNode.parameters = {};
        [].concat(node[i] || []).forEach(function (val, j) {
          if (j % 2) {
            curNode.parameters[key] = (0, _emailjsMimeCodec.mimeWordsDecode)((0, _ramda.propOr)('', 'value')(val));
          } else {
            key = (0, _ramda.propOr)('', 'value')(val).toLowerCase();
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
          curNode.envelope = _this21._parseENVELOPE([].concat(node[i] || []));
        }
        i++;

        if (node[i]) {
          curNode.childNodes = [
          // rfc822 bodyparts share the same path, difference is between MIME and HEADER
          // path.MIME returns message/rfc822 header
          // path.HEADER returns inlined message header
          processNode(node[i], path)];
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
          [].concat(node[i][1] || []).forEach(function (val, j) {
            if (j % 2) {
              curNode.dispositionParameters[key] = (0, _emailjsMimeCodec.mimeWordsDecode)((0, _ramda.propOr)('', 'value')(val));
            } else {
              key = (0, _ramda.propOr)('', 'value')(val).toLowerCase();
            }
          });
        }
      }
      i++;
    }

    // body language
    if (i < node.length - 1) {
      if (node[i]) {
        curNode.language = [].concat(node[i] || []).map(function (val) {
          return (0, _ramda.propOr)('', 'value')(val).toLowerCase();
        });
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
Client.prototype._buildSEARCHCommand = function (query, options) {
  var command = {
    command: options.byUid ? 'UID SEARCH' : 'SEARCH'
  };

  var isAscii = true;

  var buildTerm = function buildTerm(query) {
    var list = [];

    Object.keys(query).forEach(function (key) {
      var params = [];
      var formatDate = function formatDate(date) {
        return date.toUTCString().replace(/^\w+, 0?(\d+) (\w+) (\d+).*/, '$1-$2-$3');
      };
      var escapeParam = function escapeParam(param) {
        if (typeof param === 'number') {
          return {
            type: 'number',
            value: param
          };
        } else if (typeof param === 'string') {
          if (/[\u0080-\uFFFF]/.test(param)) {
            isAscii = false;
            return {
              type: 'literal',
              // cast unicode string to pseudo-binary as imap-handler compiles strings as octets
              value: (0, _common.fromTypedArray)((0, _emailjsMimeCodec.encode)(param))
            };
          }
          return {
            type: 'string',
            value: param
          };
        } else if (Object.prototype.toString.call(param) === '[object Date]') {
          // RFC 3501 allows for dates to be placed in
          // double-quotes or left without quotes.  Some
          // servers (Yandex), do not like the double quotes,
          // so we treat the date as an atom.
          return {
            type: 'atom',
            value: formatDate(param)
          };
        } else if (Array.isArray(param)) {
          return param.map(escapeParam);
        } else if ((typeof param === 'undefined' ? 'undefined' : _typeof(param)) === 'object') {
          return buildTerm(param);
        }
      };

      params.push({
        type: 'atom',
        value: key.toUpperCase()
      });

      [].concat(query[key] || []).forEach(function (param) {
        switch (key.toLowerCase()) {
          case 'uid':
            param = {
              type: 'sequence',
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
              type: 'number',
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
      type: 'atom',
      value: 'UTF-8'
    });
    command.attributes.unshift({
      type: 'atom',
      value: 'CHARSET'
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
Client.prototype._binSearch = function (haystack, needle, comparator) {
  var mid = void 0,
      cmp = void 0;
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
Client.prototype._parseSEARCH = function (response) {
  var _this22 = this;

  var cmp = function cmp(a, b) {
    return a - b;
  };
  var list = [];

  if (!response || !response.payload || !response.payload.SEARCH || !response.payload.SEARCH.length) {
    return [];
  }

  [].concat(response.payload.SEARCH || []).forEach(function (result) {
    [].concat(result.attributes || []).forEach(function (nr) {
      nr = Number((0, _ramda.propOr)(nr || 0, 'value')(nr)) || 0;
      var idx = _this22._binSearch(list, nr, cmp);
      if (idx < 0) {
        list.splice(-idx - 1, 0, nr);
      }
    });
  });

  return list;
};

/**
 * Creates an IMAP STORE command from the selected arguments
 */
Client.prototype._buildSTORECommand = function (sequence, action, flags, options) {
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

  command.attributes.push(flags.map(function (flag) {
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
Client.prototype._changeState = function (newState) {
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
Client.prototype._ensurePath = function (tree, path, delimiter) {
  var names = path.split(delimiter);
  var branch = tree;
  var i = void 0,
      j = void 0,
      found = void 0;

  for (i = 0; i < names.length; i++) {
    found = false;
    for (j = 0; j < branch.children.length; j++) {
      if (this._compareMailboxNames(branch.children[j].name, (0, _emailjsUtf.imapDecode)(names[i]))) {
        branch = branch.children[j];
        found = true;
        break;
      }
    }
    if (!found) {
      branch.children.push({
        name: (0, _emailjsUtf.imapDecode)(names[i]),
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
Client.prototype._compareMailboxNames = function (a, b) {
  return (a.toUpperCase() === 'INBOX' ? 'INBOX' : a) === (b.toUpperCase() === 'INBOX' ? 'INBOX' : b);
};

/**
 * Checks if a mailbox is for special use
 *
 * @param {Object} mailbox
 * @return {String} Special use flag (if detected)
 */
Client.prototype._checkSpecialUse = function (mailbox) {
  var i = void 0,
      type = void 0;

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

Client.prototype._checkSpecialUseByName = function (mailbox) {
  var name = (0, _ramda.propOr)('', 'name')(mailbox).toLowerCase().trim();
  var i = void 0;
  var type = void 0;

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
Client.prototype._buildXOAuth2Token = function (user, token) {
  var authData = ['user=' + (user || ''), 'auth=Bearer ' + token, '', ''];
  return (0, _emailjsBase.encode)(authData.join('\x01'));
};

/**
 * If needed, encloses with quotes or mime encodes the name part of an e-mail address
 *
 * @param {String} name Name part of an address
 * @returns {String} Mime word encoded or quoted string
 */
Client.prototype._encodeAddressName = function (name) {
  if (!/^[\w ']*$/.test(name)) {
    if (/^[\x20-\x7e]*$/.test(name)) {
      return JSON.stringify(name);
    } else {
      return (0, _emailjsMimeCodec.mimeWordEncode)(name, 'Q', 52);
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

Client.prototype.createLogger = function () {
  var _this23 = this;

  var createLogger = function createLogger(tag) {
    var log = function log(level, messages) {
      messages = messages.map(function (msg) {
        return typeof msg === 'function' ? msg() : msg;
      });
      var logMessage = '[' + new Date().toISOString() + '][' + tag + '][' + _this23.options.auth.user + '][' + _this23.client.host + '] ' + messages.join(' ');
      if (level === _this23.LOG_LEVEL_DEBUG) {
        console.log('[DEBUG]' + logMessage);
      } else if (level === _this23.LOG_LEVEL_INFO) {
        console.info('[INFO]' + logMessage);
      } else if (level === _this23.LOG_LEVEL_WARN) {
        console.warn('[WARN]' + logMessage);
      } else if (level === _this23.LOG_LEVEL_ERROR) {
        console.error('[ERROR]' + logMessage);
      }
    };

    return {
      // this could become way nicer when node supports the rest operator...
      debug: function (msgs) {
        log(this.LOG_LEVEL_DEBUG, msgs);
      }.bind(_this23),
      info: function (msgs) {
        log(this.LOG_LEVEL_INFO, msgs);
      }.bind(_this23),
      warn: function (msgs) {
        log(this.LOG_LEVEL_WARN, msgs);
      }.bind(_this23),
      error: function (msgs) {
        log(this.LOG_LEVEL_ERROR, msgs);
      }.bind(_this23)
    };
  };

  var logger = this.options.logger || createLogger(this.options.sessionId || 1);
  this.logger = this.client.logger = {
    // this could become way nicer when node supports the rest operator...
    debug: function () {
      if (this.LOG_LEVEL_DEBUG >= this.logLevel) {
        logger.debug(Array.prototype.slice.call(arguments));
      }
    }.bind(this),
    info: function () {
      if (this.LOG_LEVEL_INFO >= this.logLevel) {
        logger.info(Array.prototype.slice.call(arguments));
      }
    }.bind(this),
    warn: function () {
      if (this.LOG_LEVEL_WARN >= this.logLevel) {
        logger.warn(Array.prototype.slice.call(arguments));
      }
    }.bind(this),
    error: function () {
      if (this.LOG_LEVEL_ERROR >= this.logLevel) {
        logger.error(Array.prototype.slice.call(arguments));
      }
    }.bind(this)
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiU1BFQ0lBTF9VU0VfRkxBR1MiLCJTUEVDSUFMX1VTRV9CT1hFUyIsIlNQRUNJQUxfVVNFX0JPWF9GTEFHUyIsIk9iamVjdCIsImtleXMiLCJTRVNTSU9OQ09VTlRFUiIsImhvc3QiLCJwb3J0Iiwib3B0aW9ucyIsInNlcnZlcklkIiwib25jZXJ0Iiwib251cGRhdGUiLCJvbnNlbGVjdG1haWxib3giLCJvbmNsb3NlbWFpbGJveCIsInNlc3Npb25JZCIsIl9zdGF0ZSIsIl9hdXRoZW50aWNhdGVkIiwiX2NhcGFiaWxpdHkiLCJfc2VsZWN0ZWRNYWlsYm94IiwiX2VudGVyZWRJZGxlIiwiX2lkbGVUaW1lb3V0IiwiY2xpZW50Iiwib25lcnJvciIsIl9vbkVycm9yIiwiYmluZCIsImNlcnQiLCJvbmlkbGUiLCJfb25JZGxlIiwic2V0SGFuZGxlciIsInJlc3BvbnNlIiwiX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIiLCJfdW50YWdnZWRPa0hhbmRsZXIiLCJfdW50YWdnZWRFeGlzdHNIYW5kbGVyIiwiX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIiLCJfdW50YWdnZWRGZXRjaEhhbmRsZXIiLCJjcmVhdGVMb2dnZXIiLCJsb2dMZXZlbCIsIkxPR19MRVZFTF9BTEwiLCJwcm90b3R5cGUiLCJlcnIiLCJjbGVhclRpbWVvdXQiLCJjb25uZWN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjb25uZWN0aW9uVGltZW91dCIsInNldFRpbWVvdXQiLCJFcnJvciIsIlRJTUVPVVRfQ09OTkVDVElPTiIsImxvZ2dlciIsImRlYnVnIiwiX2NoYW5nZVN0YXRlIiwiU1RBVEVfQ09OTkVDVElORyIsInRoZW4iLCJvbnJlYWR5IiwiY2F0Y2giLCJTVEFURV9OT1RfQVVUSEVOVElDQVRFRCIsInVwZGF0ZUNhcGFiaWxpdHkiLCJ1cGdyYWRlQ29ubmVjdGlvbiIsInVwZGF0ZUlkIiwiaWQiLCJ3YXJuIiwibG9naW4iLCJhdXRoIiwiY29tcHJlc3NDb25uZWN0aW9uIiwiZXJyb3IiLCJjbG9zZSIsImxvZ291dCIsIlNUQVRFX0xPR09VVCIsImluZGV4T2YiLCJhdHRyaWJ1dGVzIiwibmFtZSIsImZvckVhY2giLCJrZXkiLCJwdXNoIiwiZXhlYyIsImNvbW1hbmQiLCJwYXlsb2FkIiwiSUQiLCJsZW5ndGgiLCJjb25jYXQiLCJzaGlmdCIsInZhbCIsImkiLCJ0b0xvd2VyQ2FzZSIsInRyaW0iLCJfc2hvdWxkU2VsZWN0TWFpbGJveCIsInBhdGgiLCJjdHgiLCJwcmV2aW91c1NlbGVjdCIsImdldFByZXZpb3VzbHlRdWV1ZWQiLCJyZXF1ZXN0IiwicGF0aEF0dHJpYnV0ZSIsImZpbmQiLCJhdHRyaWJ1dGUiLCJ0eXBlIiwidmFsdWUiLCJzZWxlY3RNYWlsYm94IiwicXVlcnkiLCJyZWFkT25seSIsImNvbmRzdG9yZSIsIlNUQVRFX1NFTEVDVEVEIiwibWFpbGJveEluZm8iLCJfcGFyc2VTRUxFQ1QiLCJtYXliZVByb21pc2UiLCJsaXN0TmFtZXNwYWNlcyIsIl9wYXJzZU5BTUVTUEFDRSIsImxpc3RNYWlsYm94ZXMiLCJ0cmVlIiwicm9vdCIsImNoaWxkcmVuIiwiTElTVCIsIml0ZW0iLCJicmFuY2giLCJfZW5zdXJlUGF0aCIsInRvU3RyaW5nIiwiZmxhZ3MiLCJtYXAiLCJmbGFnIiwibGlzdGVkIiwiX2NoZWNrU3BlY2lhbFVzZSIsIkxTVUIiLCJzdWJzY3JpYmVkIiwiY3JlYXRlTWFpbGJveCIsImNvZGUiLCJsaXN0TWVzc2FnZXMiLCJzZXF1ZW5jZSIsIml0ZW1zIiwiZmFzdCIsIl9idWlsZEZFVENIQ29tbWFuZCIsInByZWNoZWNrIiwiX3BhcnNlRkVUQ0giLCJzZWFyY2giLCJfYnVpbGRTRUFSQ0hDb21tYW5kIiwiX3BhcnNlU0VBUkNIIiwic2V0RmxhZ3MiLCJsaXN0IiwiQXJyYXkiLCJpc0FycmF5IiwiYWRkIiwic2V0IiwicmVtb3ZlIiwic3RvcmUiLCJhY3Rpb24iLCJfYnVpbGRTVE9SRUNvbW1hbmQiLCJ1cGxvYWQiLCJkZXN0aW5hdGlvbiIsIm1lc3NhZ2UiLCJkZWxldGVNZXNzYWdlcyIsImNtZCIsImJ5VWlkIiwiY29weU1lc3NhZ2VzIiwiaHVtYW5SZWFkYWJsZSIsIm1vdmVNZXNzYWdlcyIsIlNUQVRFX0FVVEhFTlRJQ0FURUQiLCJUSU1FT1VUX05PT1AiLCJUSU1FT1VUX0lETEUiLCJlbmFibGVDb21wcmVzc2lvbiIsImNvbXByZXNzZWQiLCJ4b2F1dGgyIiwiX2J1aWxkWE9BdXRoMlRva2VuIiwidXNlciIsInNlbnNpdGl2ZSIsImVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lIiwicGFzcyIsImNhcGFiaWxpdHkiLCJDQVBBQklMSVRZIiwicG9wIiwiY2FwYSIsInRvVXBwZXJDYXNlIiwiYWNjZXB0VW50YWdnZWQiLCJicmVha0lkbGUiLCJlbnF1ZXVlQ29tbWFuZCIsImVudGVySWRsZSIsInNlbmQiLCJzZWN1cmVNb2RlIiwiaWdub3JlVExTIiwicmVxdWlyZVRMUyIsInVwZ3JhZGUiLCJmb3JjZWQiLCJoYXNDYXBhYmlsaXR5IiwiaGFzT3duUHJvcGVydHkiLCJuciIsIkZFVENIIiwibWFpbGJveCIsImV4aXN0c1Jlc3BvbnNlIiwiRVhJU1RTIiwiZmxhZ3NSZXNwb25zZSIsIkZMQUdTIiwib2tSZXNwb25zZSIsIk9LIiwiZXhpc3RzIiwib2siLCJwZXJtYW5lbnRGbGFncyIsInBlcm1hbmVudGZsYWdzIiwidWlkVmFsaWRpdHkiLCJOdW1iZXIiLCJ1aWR2YWxpZGl0eSIsInVpZE5leHQiLCJ1aWRuZXh0IiwiaGlnaGVzdE1vZHNlcSIsImhpZ2hlc3Rtb2RzZXEiLCJub01vZHNlcSIsIk5BTUVTUEFDRSIsInBlcnNvbmFsIiwiX3BhcnNlTkFNRVNQQUNFRWxlbWVudCIsInVzZXJzIiwic2hhcmVkIiwiZWxlbWVudCIsIm5zIiwicHJlZml4IiwiZGVsaW1pdGVyIiwidmFsdWVBc1N0cmluZyIsInVuZGVmaW5lZCIsInRlc3QiLCJlIiwiY2hhbmdlZFNpbmNlIiwibWVzc2FnZXMiLCJwYXJhbXMiLCJsZW4iLCJyZXBsYWNlIiwiX3BhcnNlRmV0Y2hWYWx1ZSIsIl9wYXJzZUVOVkVMT1BFIiwiX3BhcnNlQk9EWVNUUlVDVFVSRSIsImVudmVsb3BlIiwicHJvY2Vzc0FkZHJlc3NlcyIsImFkZHIiLCJhZGRyZXNzIiwiZm9ybWF0dGVkIiwiX2VuY29kZUFkZHJlc3NOYW1lIiwicGFyc2VkIiwiZGF0ZSIsInN1YmplY3QiLCJmcm9tIiwic2VuZGVyIiwidG8iLCJjYyIsImJjYyIsInByb2Nlc3NOb2RlIiwibm9kZSIsImN1ck5vZGUiLCJwYXJ0Iiwiam9pbiIsImNoaWxkTm9kZXMiLCJwYXJhbWV0ZXJzIiwiaiIsImRlc2NyaXB0aW9uIiwiZW5jb2RpbmciLCJzaXplIiwibGluZUNvdW50IiwibWQ1IiwiZGlzcG9zaXRpb24iLCJkaXNwb3NpdGlvblBhcmFtZXRlcnMiLCJsYW5ndWFnZSIsImxvY2F0aW9uIiwiaXNBc2NpaSIsImJ1aWxkVGVybSIsImZvcm1hdERhdGUiLCJ0b1VUQ1N0cmluZyIsImVzY2FwZVBhcmFtIiwicGFyYW0iLCJjYWxsIiwidW5zaGlmdCIsIl9iaW5TZWFyY2giLCJoYXlzdGFjayIsIm5lZWRsZSIsImNvbXBhcmF0b3IiLCJtaWQiLCJjbXAiLCJsb3ciLCJoaWdoIiwiYSIsImIiLCJTRUFSQ0giLCJyZXN1bHQiLCJpZHgiLCJzcGxpY2UiLCJzaWxlbnQiLCJuZXdTdGF0ZSIsIm5hbWVzIiwic3BsaXQiLCJmb3VuZCIsIl9jb21wYXJlTWFpbGJveE5hbWVzIiwic2xpY2UiLCJzcGVjaWFsVXNlIiwic3BlY2lhbFVzZUZsYWciLCJfY2hlY2tTcGVjaWFsVXNlQnlOYW1lIiwidG9rZW4iLCJhdXRoRGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJMT0dfTEVWRUxfTk9ORSIsIkxPR19MRVZFTF9FUlJPUiIsIkxPR19MRVZFTF9XQVJOIiwiTE9HX0xFVkVMX0lORk8iLCJMT0dfTEVWRUxfREVCVUciLCJ0YWciLCJsb2ciLCJsZXZlbCIsIm1zZyIsImxvZ01lc3Nh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bWRhJ1xuaW1wb3J0IEltYXBDbGllbnQgZnJvbSAnLi9pbWFwJ1xuaW1wb3J0IHsgZW5jb2RlIGFzIGVuY29kZUJhc2U2NCB9IGZyb20gJ2VtYWlsanMtYmFzZTY0J1xuaW1wb3J0IHsgaW1hcEVuY29kZSwgaW1hcERlY29kZSB9IGZyb20gJ2VtYWlsanMtdXRmNydcbmltcG9ydCB7IHBhcnNlciwgY29tcGlsZXIgfSBmcm9tICdlbWFpbGpzLWltYXAtaGFuZGxlcidcbmltcG9ydCB7IGVuY29kZSwgbWltZVdvcmRFbmNvZGUsIG1pbWVXb3Jkc0RlY29kZSB9IGZyb20gJ2VtYWlsanMtbWltZS1jb2RlYydcbmltcG9ydCBwYXJzZUFkZHJlc3MgZnJvbSAnZW1haWxqcy1hZGRyZXNzcGFyc2VyJ1xuaW1wb3J0IHsgdG9UeXBlZEFycmF5LCBmcm9tVHlwZWRBcnJheSB9IGZyb20gJy4vY29tbW9uJ1xuXG5sZXQgU1BFQ0lBTF9VU0VfRkxBR1MgPSBbJ1xcXFxBbGwnLCAnXFxcXEFyY2hpdmUnLCAnXFxcXERyYWZ0cycsICdcXFxcRmxhZ2dlZCcsICdcXFxcSnVuaycsICdcXFxcU2VudCcsICdcXFxcVHJhc2gnXVxubGV0IFNQRUNJQUxfVVNFX0JPWEVTID0ge1xuICAnXFxcXFNlbnQnOiBbJ2Fpa2EnLCAnYmlkYWxpYWsnLCAnYmlkYWxpdGEnLCAnZGloYW50YXInLCAnZSByb21ldHN3ZW5nJywgJ2UgdGluZGFtaScsICdlbGvDvGxkw7Z0dCcsICdlbGvDvGxkw7Z0dGVrJywgJ2VudmlhZGFzJywgJ2VudmlhZGFzJywgJ2VudmlhZG9zJywgJ2VudmlhdHMnLCAnZW52b3nDqXMnLCAnZXRodW55ZWx3ZXlvJywgJ2V4cGVkaWF0ZScsICdlemlwdXJ1JywgJ2dlc2VuZGV0ZScsICdnZXN0dXVyJywgJ2fDtm5kZXJpbG1pxZ8gw7bEn2VsZXInLCAnZ8O2bmTJmXJpbMmZbmzJmXInLCAnaWJlcmlsZW4nLCAnaW52aWF0aScsICdpxaFzacWzc3RpZWppJywgJ2t1dGh1bnllbHdlJywgJ2xhc2EnLCAnbMOkaGV0ZXR5dCcsICdtZXNzYWdlcyBlbnZvecOpcycsICduYWlwYWRhbGEnLCAnbmFsZWZhJywgJ25hcGFkYWxhJywgJ25vc8WrdMSrdMSBcyB6acWGYXMnLCAnb2Rlc2xhbsOpJywgJ3BhZGFsYScsICdwb3NsYW5lJywgJ3Bvc2xhbm8nLCAncG9zbGFubycsICdwb3NsYW7DqScsICdwb3NsYXRvJywgJ3NhYWRldHVkJywgJ3NhYWRldHVkIGtpcmphZCcsICdzZW5kdCcsICdzZW5kdCcsICdzZW50JywgJ3NlbnQgaXRlbXMnLCAnc2VudCBtZXNzYWdlcycsICdzw6RuZGEgcG9zdGVyJywgJ3PDpG50JywgJ3RlcmtpcmltJywgJ3RpIGZpIHJhbuG5o+G6uScsICd0w6sgZMOrcmd1YXJhJywgJ3ZlcnpvbmRlbicsICd2aWxpdnlvdHVtd2EnLCAnd3lzxYJhbmUnLCAnxJHDoyBn4butaScsICfPg8+EzrHOu864zq3Ovc+EzrEnLCAn0LbQuNCx0LXRgNC40LvQs9C10L0nLCAn0LbRltCx0LXRgNGW0LvQs9C10L3QtNC10YAnLCAn0LjQt9C/0YDQsNGC0LXQvdC4JywgJ9C40LvQs9GN0Y3RgdGN0L0nLCAn0LjRgNGB0L7QuyDRiNGD0LQnLCAn0LjRgdC/0YDQsNGC0LXQvdC+JywgJ9C90LDQtNGW0YHQu9Cw0L3RlicsICfQvtGC0L/RgNCw0LLQu9C10L3QvdGL0LUnLCAn0L/QsNGB0LvQsNC90YvRjycsICfRjtCx0L7RgNC40LvQs9Cw0L0nLCAn1bjWgtWy1aHWgNWv1b7VodWuJywgJ9eg16nXnNeX15UnLCAn16TXqNeZ15jXmdedINep16DXqdec15fXlScsICfYp9mE2YXYsdiz2YTYqScsICfYqNq+24zYrNuSINqv2KbbkicsICfYs9mI2LLZhdqY24EnLCAn2YTbkNqr2YQg2LTZiNuMJywgJ9mF2YjYp9ix2K8g2KfYsdiz2KfZhCDYtNiv2YcnLCAn4KSq4KS+4KSg4KS14KS/4KSy4KWHJywgJ+CkquCkvuCkoOCkteCkv+CksuClh+CksuClhycsICfgpKrgpY3gpLDgpYfgpLfgpL/gpKQnLCAn4KSt4KWH4KSc4KS+IOCkl+Ckr+CkvicsICfgpqrgp43gprDgp4fgprDgpr/gpqQnLCAn4Kaq4KeN4Kaw4KeH4Kaw4Ka/4KakJywgJ+CmquCnjeCnsOCnh+CnsOCmv+CmpCcsICfgqK3gqYfgqJzgqYcnLCAn4Kqu4KuL4KqV4Kqy4KuH4Kqy4Kq+JywgJ+CsquCsoOCsvuCsl+CssuCsvicsICfgroXgrqngr4Hgrqrgr43grqrgrr/grq/grrXgr4gnLCAn4LCq4LCC4LCq4LC/4LCC4LCa4LCs4LCh4LC/4LCC4LCm4LC/JywgJ+CyleCys+CzgeCyueCyv+CyuOCysuCyvuCypicsICfgtIXgtK/gtJrgtY3gtJrgtYEnLCAn4La64LeQ4LeA4LeUIOC2tOC2q+C3kuC3gOC3lOC2qScsICfguKrguYjguIfguYHguKXguYnguKcnLCAn4YOS4YOQ4YOS4YOW4YOQ4YOV4YOc4YOY4YOa4YOYJywgJ+GLqOGJsOGIi+GKqScsICfhnpThnrbhnpPigIvhnpXhn5Lhnonhnr4nLCAn5a+E5Lu25YKZ5Lu9JywgJ+WvhOS7tuWCmeS7vScsICflt7Llj5Hkv6Hmga8nLCAn6YCB5L+h5riI44G/776S772w776ZJywgJ+uwnOyLoCDrqZTsi5zsp4AnLCAn67O064K4IO2OuOyngO2VqCddLFxuICAnXFxcXFRyYXNoJzogWydhcnRpY29sZSDImXRlcnNlJywgJ2JpbicsICdib3J0dGFnbmEgb2JqZWt0JywgJ2RlbGV0ZWQnLCAnZGVsZXRlZCBpdGVtcycsICdkZWxldGVkIG1lc3NhZ2VzJywgJ2VsZW1lbnRpIGVsaW1pbmF0aScsICdlbGVtZW50b3MgYm9ycmFkb3MnLCAnZWxlbWVudG9zIGVsaW1pbmFkb3MnLCAnZ2Vsw7ZzY2h0ZSBvYmpla3RlJywgJ2l0ZW0gZGlwYWRhbScsICdpdGVucyBhcGFnYWRvcycsICdpdGVucyBleGNsdcOtZG9zJywgJ23hu6VjIMSRw6MgeMOzYScsICdvZHN0cmFuxJtuw6kgcG9sb8W+a3knLCAncGVzYW4gdGVyaGFwdXMnLCAncG9pc3RldHV0JywgJ3ByYWh0JywgJ3Byw7xnaWthc3QnLCAnc2lsaW5tacWfIMO2xJ9lbGVyJywgJ3NsZXR0ZWRlIGJlc2tlZGVyJywgJ3NsZXR0ZWRlIGVsZW1lbnRlcicsICd0cmFzaCcsICd0w7Zyw7ZsdCBlbGVtZWsnLCAndXN1bmnEmXRlIHdpYWRvbW/Fm2NpJywgJ3ZlcndpamRlcmRlIGl0ZW1zJywgJ3Z5bWF6YW7DqSBzcHLDoXZ5JywgJ8OpbMOpbWVudHMgc3VwcHJpbcOpcycsICfQstC40LTQsNC70LXQvdGWJywgJ9C20L7QudGL0LvSk9Cw0L3QtNCw0YAnLCAn0YPQtNCw0LvQtdC90L3Ri9C1JywgJ9ek16jXmdeY15nXnSDXqdeg157Xl9en15UnLCAn2KfZhNi52YbYp9i12LEg2KfZhNmF2K3YsNmI2YHYqScsICfZhdmI2KfYsdivINit2LDZgSDYtNiv2YcnLCAn4Lij4Liy4Lii4LiB4Liy4Lij4LiX4Li14LmI4Lil4LiaJywgJ+W3suWIoOmZpOmCruS7ticsICflt7LliKrpmaTpoIXnm64nLCAn5bey5Yiq6Zmk6aCF55uuJ10sXG4gICdcXFxcSnVuayc6IFsnYnVsayBtYWlsJywgJ2NvcnJlbyBubyBkZXNlYWRvJywgJ2NvdXJyaWVyIGluZMOpc2lyYWJsZScsICdpc3Rlbm1leWVuJywgJ2lzdGVubWV5ZW4gZS1wb3N0YScsICdqdW5rJywgJ2xldsOpbHN6ZW3DqXQnLCAnbmV2ecW+aWFkYW7DoSBwb8WhdGEnLCAnbmV2ecW+w6FkYW7DoSBwb8WhdGEnLCAnbm8gZGVzZWFkbycsICdwb3N0YSBpbmRlc2lkZXJhdGEnLCAncG91cnJpZWwnLCAncm9za2Fwb3N0aScsICdza3LDpHBwb3N0JywgJ3NwYW0nLCAnc3BhbScsICdzcGFtb3dhbmllJywgJ3PDuHBwZWxwb3N0JywgJ3RoxrAgcsOhYycsICfRgdC/0LDQvCcsICfXk9eV15DXqCDXlteR15wnLCAn2KfZhNix2LPYp9im2YQg2KfZhNi52LTZiNin2KbZitipJywgJ9mH2LHYstmG2KfZhdmHJywgJ+C4quC5geC4m+C4oScsICfigI7lnoPlnL7pg7Xku7YnLCAn5Z6D5Zy+6YKu5Lu2JywgJ+Weg+Wcvumbu+mDtSddLFxuICAnXFxcXERyYWZ0cyc6IFsnYmEgYnJvdWlsbG9uJywgJ2JvcnJhZG9yJywgJ2JvcnJhZG9yJywgJ2JvcnJhZG9yZXMnLCAnYm96emUnLCAnYnJvdWlsbG9ucycsICdi4bqjbiB0aOG6o28nLCAnY2lvcm5lJywgJ2NvbmNlcHRlbicsICdkcmFmJywgJ2RyYWZ0cycsICdkcsO2ZycsICdlbnR3w7xyZmUnLCAnZXNib3JyYW55cycsICdnYXJhbGFtYWxhcicsICdpaGUgZWRldHVydScsICdpaWRyYWZ0aScsICdpemluaGxha2EnLCAnanVvZHJhxaHEjWlhaScsICdrbGFkZCcsICdrbGFkZGVyJywgJ2tvbmNlcHR5JywgJ2tvbmNlcHR5JywgJ2tvbnNlcCcsICdrb25zZXB0ZScsICdrb3BpZSByb2JvY3plJywgJ2xheWloyZlsyZlyJywgJ2x1b25ub2tzZXQnLCAnbWVsbnJha3N0aScsICdtZXJhbG8nLCAnbWVzYXpoZSB0w6sgcGFkw6tyZ3VhcmEnLCAnbWdhIGRyYWZ0JywgJ211c3RhbmRpZCcsICduYWNydGknLCAnbmFjcnRpJywgJ29zbnV0a2knLCAncGlzemtvemF0b2snLCAncmFzY3VuaG9zJywgJ3Jhc2ltdScsICdza2ljZScsICd0YXNsYWtsYXInLCAndHNhcmFycnVuIHNhxplvbm5pJywgJ3V0a2FzdCcsICd2YWtpcmFva2EnLCAndsOhemxhdG9rJywgJ3ppcnJpYm9ycm9haycsICfDoHfhu41uIMOga+G7jXBhbeG7jcyBJywgJ8+Az4HPjM+HzrXOuc+BzrEnLCAn0LbQvtCx0LDQu9Cw0YAnLCAn0L3QsNGG0YDRgtC4JywgJ9C90L7QvtGA0LPRg9GD0LQnLCAn0YHQuNGR0rPQvdCw0LLQuNGBJywgJ9GF0L7QvNCw0LrQuCDRhdCw0YLQu9Cw0YAnLCAn0YfQsNGA0L3QsNCy0ZbQutGWJywgJ9GH0LXRgNC90LXRgtC60LgnLCAn0YfQtdGA0L3QvtCy0LgnLCAn0YfQtdGA0L3QvtCy0LjQutC4JywgJ9GH0LXRgNC90L7QstC40LrRgtC10YAnLCAn1b3Wh9Wh1aPWgNWl1oAnLCAn15jXmdeV15jXldeqJywgJ9mF2LPZiNiv2KfYqicsICfZhdiz2YjYr9in2KonLCAn2YXZiNiz2YjYr9uQJywgJ9m+24zYtCDZhtmI24zYs9mH2KcnLCAn2ojYsdin2YHZuS8nLCAn4KSh4KWN4KSw4KS+4KWe4KWN4KSfJywgJ+CkquCljeCksOCkvuCksOClguCkqicsICfgppbgprjgp5zgpr4nLCAn4KaW4Ka44Kec4Ka+JywgJ+CmoeCnjeCnsOCmvuCmq+CnjeCmnycsICfgqKHgqY3gqLDgqL7gqKvgqJ8nLCAn4Kqh4KuN4Kqw4Kq+4Kqr4KuN4Kqf4Kq4JywgJ+CsoeCtjeCssOCsvuCsq+CtjeCsnycsICfgrrXgrrDgr4jgrrXgr4HgrpXgrrPgr40nLCAn4LCa4LC/4LCk4LGN4LCk4LGBIOCwquCxjeCwsOCwpOCxgeCwsuCxgScsICfgspXgsrDgsqHgs4HgspfgsrPgs4EnLCAn4LSV4LSw4LSf4LWB4LSV4LSz4LWN4oCNJywgJ+C2muC3meC2p+C3lOC2uOC3iiDgtrTgtq3gt4onLCAn4LiJ4Lia4Lix4Lia4Lij4LmI4Liy4LiHJywgJ+GDm+GDneGDnOGDkOGDruGDkOGDluGDlOGDkeGDmCcsICfhiKjhiYLhiYbhib0nLCAn4Z6f4Z624Z6a4Z6W4Z+S4Z6a4Z624Z6EJywgJ+S4i+abuOOBjScsICfojYnnqL8nLCAn6I2J56i/JywgJ+iNieeovycsICfsnoTsi5wg67O06rSA7ZWoJ11cbn1cbmxldCBTUEVDSUFMX1VTRV9CT1hfRkxBR1MgPSBPYmplY3Qua2V5cyhTUEVDSUFMX1VTRV9CT1hFUylcbmxldCBTRVNTSU9OQ09VTlRFUiA9IDBcblxuLyoqXG4gKiBlbWFpbGpzIElNQVAgY2xpZW50XG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtob3N0PSdsb2NhbGhvc3QnXSBIb3N0bmFtZSB0byBjb25lbmN0IHRvXG4gKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9MTQzXSBQb3J0IG51bWJlciB0byBjb25uZWN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENsaWVudCAoaG9zdCwgcG9ydCwgb3B0aW9ucykge1xuICB0aGlzLnNlcnZlcklkID0gZmFsc2UgLy8gUkZDIDI5NzEgU2VydmVyIElEIGFzIGtleSB2YWx1ZSBwYWlyc1xuXG4gIC8vIEV2ZW50IHBsYWNlaG9sZGVyc1xuICB0aGlzLm9uY2VydCA9IG51bGxcbiAgdGhpcy5vbnVwZGF0ZSA9IG51bGxcbiAgdGhpcy5vbnNlbGVjdG1haWxib3ggPSBudWxsXG4gIHRoaXMub25jbG9zZW1haWxib3ggPSBudWxsXG5cbiAgLy9cbiAgLy8gSW50ZXJuYWxzXG4gIC8vXG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB0aGlzLm9wdGlvbnMuc2Vzc2lvbklkID0gdGhpcy5vcHRpb25zLnNlc3Npb25JZCB8fCArK1NFU1NJT05DT1VOVEVSIC8vIFNlc3Npb24gaWRlbnRpZmllciAobG9nZ2luZylcbiAgdGhpcy5fc3RhdGUgPSBmYWxzZSAvLyBDdXJyZW50IHN0YXRlXG4gIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZSAvLyBJcyB0aGUgY29ubmVjdGlvbiBhdXRoZW50aWNhdGVkXG4gIHRoaXMuX2NhcGFiaWxpdHkgPSBbXSAvLyBMaXN0IG9mIGV4dGVuc2lvbnMgdGhlIHNlcnZlciBzdXBwb3J0c1xuICB0aGlzLl9zZWxlY3RlZE1haWxib3ggPSBmYWxzZSAvLyBTZWxlY3RlZCBtYWlsYm94XG4gIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgdGhpcy5faWRsZVRpbWVvdXQgPSBmYWxzZVxuXG4gIHRoaXMuY2xpZW50ID0gbmV3IEltYXBDbGllbnQoaG9zdCwgcG9ydCwgdGhpcy5vcHRpb25zKSAvLyBJTUFQIGNsaWVudCBvYmplY3RcblxuICAvLyBFdmVudCBIYW5kbGVyc1xuICB0aGlzLmNsaWVudC5vbmVycm9yID0gdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpXG4gIHRoaXMuY2xpZW50Lm9uY2VydCA9IChjZXJ0KSA9PiAodGhpcy5vbmNlcnQgJiYgdGhpcy5vbmNlcnQoY2VydCkpIC8vIGFsbG93cyBjZXJ0aWZpY2F0ZSBoYW5kbGluZyBmb3IgcGxhdGZvcm1zIHcvbyBuYXRpdmUgdGxzIHN1cHBvcnRcbiAgdGhpcy5jbGllbnQub25pZGxlID0gKCkgPT4gdGhpcy5fb25JZGxlKCkgLy8gc3RhcnQgaWRsaW5nXG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVycyBmb3IgdW50YWdnZWQgcmVzcG9uc2VzXG4gIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2NhcGFiaWxpdHknLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIocmVzcG9uc2UpKSAvLyBjYXBhYmlsaXR5IHVwZGF0ZXNcbiAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignb2snLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkT2tIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbm90aWZpY2F0aW9uc1xuICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdleGlzdHMnLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkRXhpc3RzSGFuZGxlcihyZXNwb25zZSkpIC8vIG1lc3NhZ2UgY291bnQgaGFzIGNoYW5nZWRcbiAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignZXhwdW5nZScsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRFeHB1bmdlSGFuZGxlcihyZXNwb25zZSkpIC8vIG1lc3NhZ2UgaGFzIGJlZW4gZGVsZXRlZFxuICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdmZXRjaCcsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRGZXRjaEhhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGhhcyBiZWVuIHVwZGF0ZWQgKGVnLiBmbGFnIGNoYW5nZSlcblxuICAvLyBBY3RpdmF0ZSBsb2dnaW5nXG4gIHRoaXMuY3JlYXRlTG9nZ2VyKClcbiAgdGhpcy5sb2dMZXZlbCA9IHRoaXMuTE9HX0xFVkVMX0FMTFxufVxuXG4vKipcbiAqIENhbGxlZCBpZiB0aGUgbG93ZXItbGV2ZWwgSW1hcENsaWVudCBoYXMgZW5jb3VudGVyZWQgYW4gdW5yZWNvdmVyYWJsZVxuICogZXJyb3IgZHVyaW5nIG9wZXJhdGlvbi4gQ2xlYW5zIHVwIGFuZCBwcm9wYWdhdGVzIHRoZSBlcnJvciB1cHdhcmRzLlxuICovXG5DbGllbnQucHJvdG90eXBlLl9vbkVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAvLyBtYWtlIHN1cmUgbm8gaWRsZSB0aW1lb3V0IGlzIHBlbmRpbmcgYW55bW9yZVxuICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG5cbiAgLy8gcHJvcGFnYXRlIHRoZSBlcnJvciB1cHdhcmRzXG4gIHRoaXMub25lcnJvciAmJiB0aGlzLm9uZXJyb3IoZXJyKVxufVxuXG4vL1xuLy9cbi8vIFBVQkxJQyBBUElcbi8vXG4vL1xuXG4vKipcbiAqIEluaXRpYXRlIGNvbm5lY3Rpb24gdG8gdGhlIElNQVAgc2VydmVyXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hlbiBsb2dpbiBwcm9jZWR1cmUgaXMgY29tcGxldGVcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBjb25uZWN0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KG5ldyBFcnJvcignVGltZW91dCBjb25uZWN0aW5nIHRvIHNlcnZlcicpKSwgdGhpcy5USU1FT1VUX0NPTk5FQ1RJT04pXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nvbm5lY3RpbmcgdG8nLCB0aGlzLmNsaWVudC5ob3N0LCAnOicsIHRoaXMuY2xpZW50LnBvcnQpXG4gICAgdGhpcy5fY2hhbmdlU3RhdGUodGhpcy5TVEFURV9DT05ORUNUSU5HKVxuICAgIHRoaXMuY2xpZW50LmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTb2NrZXQgb3BlbmVkLCB3YWl0aW5nIGZvciBncmVldGluZyBmcm9tIHRoZSBzZXJ2ZXIuLi4nKVxuXG4gICAgICB0aGlzLmNsaWVudC5vbnJlYWR5ID0gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXQpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXQpXG4gICAgICAgIHJlamVjdChlcnIpXG4gICAgICB9XG4gICAgfSkuY2F0Y2gocmVqZWN0KVxuICB9KS50aGVuKCgpID0+IHtcbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFX05PVF9BVVRIRU5USUNBVEVEKVxuICAgIHJldHVybiB0aGlzLnVwZGF0ZUNhcGFiaWxpdHkoKVxuICB9KS50aGVuKCgpID0+IHtcbiAgICByZXR1cm4gdGhpcy51cGdyYWRlQ29ubmVjdGlvbigpXG4gIH0pLnRoZW4oKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZUlkKHRoaXMub3B0aW9ucy5pZClcbiAgICAgIC5jYXRjaChlcnIgPT4gdGhpcy5sb2dnZXIud2FybignRmFpbGVkIHRvIHVwZGF0ZSBpZCcsIGVycikpXG4gIH0pLnRoZW4oKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmxvZ2luKHRoaXMub3B0aW9ucy5hdXRoKVxuICB9KS50aGVuKCgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb21wcmVzc0Nvbm5lY3Rpb24oKVxuICB9KS50aGVuKCgpID0+IHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29ubmVjdGlvbiBlc3RhYmxpc2hlZCwgcmVhZHkgdG8gcm9sbCEnKVxuICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcylcbiAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgIHRoaXMubG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXInLCBlcnIpXG4gICAgdGhpcy5jbG9zZShlcnIpIC8vIHdlIGRvbid0IHJlYWxseSBjYXJlIHdoZXRoZXIgdGhpcyB3b3JrcyBvciBub3RcbiAgICB0aHJvdyBlcnJcbiAgfSlcbn1cblxuLyoqXG4gKiBMb2dvdXRcbiAqXG4gKiBTZW5kIExPR09VVCwgdG8gd2hpY2ggdGhlIHNlcnZlciByZXNwb25kcyBieSBjbG9zaW5nIHRoZSBjb25uZWN0aW9uLlxuICogVXNlIGlzIGRpc2NvdXJhZ2VkIGlmIG5ldHdvcmsgc3RhdHVzIGlzIHVuY2xlYXIhIElmIG5ldHdvcmtzIHN0YXR1cyBpc1xuICogdW5jbGVhciwgcGxlYXNlIHVzZSAjY2xvc2UgaW5zdGVhZCFcbiAqXG4gKiBMT0dPVVQgZGV0YWlsczpcbiAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjEuM1xuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNlcnZlciBoYXMgY2xvc2VkIHRoZSBjb25uZWN0aW9uXG4gKi9cbkNsaWVudC5wcm90b3R5cGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFX0xPR09VVClcbiAgdGhpcy5sb2dnZXIuZGVidWcoJ0xvZ2dpbmcgb3V0Li4uJylcbiAgcmV0dXJuIHRoaXMuY2xpZW50LmxvZ291dCgpLnRoZW4oKCkgPT4ge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgfSlcbn1cblxuLyoqXG4gKiBGb3JjZS1jbG9zZXMgdGhlIGN1cnJlbnQgY29ubmVjdGlvbiBieSBjbG9zaW5nIHRoZSBUQ1Agc29ja2V0LlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNvY2tldCBpcyBjbG9zZWRcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgdGhpcy5fY2hhbmdlU3RhdGUodGhpcy5TVEFURV9MT0dPVVQpXG4gIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nsb3NpbmcgY29ubmVjdGlvbi4uLicpXG4gIHJldHVybiB0aGlzLmNsaWVudC5jbG9zZShlcnIpXG59XG5cbi8qKlxuICogUnVucyBJRCBjb21tYW5kLCBwYXJzZXMgSUQgcmVzcG9uc2UsIHNldHMgdGhpcy5zZXJ2ZXJJZFxuICpcbiAqIElEIGRldGFpbHM6XG4gKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzI5NzFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaWQgSUQgYXMga2V5IHZhbHVlIHBhaXJzLiBTZWUgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjk3MSNzZWN0aW9uLTMuMyBmb3IgcG9zc2libGUgdmFsdWVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiByZXNwb25zZSBoYXMgYmVlbiBwYXJzZWRcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS51cGRhdGVJZCA9IGZ1bmN0aW9uIChpZCkge1xuICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdJRCcpIDwgMCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICB9XG5cbiAgbGV0IGF0dHJpYnV0ZXMgPSBbXG4gICAgW11cbiAgXVxuICBpZiAoaWQpIHtcbiAgICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuICAgICAgaWQgPSB7XG4gICAgICAgIG5hbWU6IGlkXG4gICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKGlkKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGF0dHJpYnV0ZXNbMF0ucHVzaChrZXkpXG4gICAgICBhdHRyaWJ1dGVzWzBdLnB1c2goaWRba2V5XSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGF0dHJpYnV0ZXNbMF0gPSBudWxsXG4gIH1cblxuICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBkYXRpbmcgaWQuLi4nKVxuICByZXR1cm4gdGhpcy5leGVjKHtcbiAgICBjb21tYW5kOiAnSUQnLFxuICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXNcbiAgfSwgJ0lEJykudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlLnBheWxvYWQgfHwgIXJlc3BvbnNlLnBheWxvYWQuSUQgfHwgIXJlc3BvbnNlLnBheWxvYWQuSUQubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnNlcnZlcklkID0ge31cblxuICAgIGxldCBrZXk7XG4gICAgW10uY29uY2F0KFtdLmNvbmNhdChyZXNwb25zZS5wYXlsb2FkLklELnNoaWZ0KCkuYXR0cmlidXRlcyB8fCBbXSkuc2hpZnQoKSB8fCBbXSkuZm9yRWFjaCgodmFsLCBpKSA9PiB7XG4gICAgICBpZiAoaSAlIDIgPT09IDApIHtcbiAgICAgICAga2V5ID0gcHJvcE9yKCcnLCAndmFsdWUnKSh2YWwpLnRvTG93ZXJDYXNlKCkudHJpbSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlcnZlcklkW2tleV0gPSBwcm9wT3IoJycsICd2YWx1ZScpKHZhbClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlcnZlciBpZCB1cGRhdGVkIScsIHRoaXMuc2VydmVySWQpXG4gIH0pXG59XG5cbkNsaWVudC5wcm90b3R5cGUuX3Nob3VsZFNlbGVjdE1haWxib3ggPSBmdW5jdGlvbiAocGF0aCwgY3R4KSB7XG4gIGlmICghY3R4KSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGNvbnN0IHByZXZpb3VzU2VsZWN0ID0gdGhpcy5jbGllbnQuZ2V0UHJldmlvdXNseVF1ZXVlZChbJ1NFTEVDVCcsICdFWEFNSU5FJ10sIGN0eClcbiAgaWYgKHByZXZpb3VzU2VsZWN0ICYmIHByZXZpb3VzU2VsZWN0LnJlcXVlc3QuYXR0cmlidXRlcykge1xuICAgIGNvbnN0IHBhdGhBdHRyaWJ1dGUgPSBwcmV2aW91c1NlbGVjdC5yZXF1ZXN0LmF0dHJpYnV0ZXMuZmluZCgoYXR0cmlidXRlKSA9PiBhdHRyaWJ1dGUudHlwZSA9PT0gJ1NUUklORycpXG4gICAgaWYgKHBhdGhBdHRyaWJ1dGUpIHtcbiAgICAgIHJldHVybiBwYXRoQXR0cmlidXRlLnZhbHVlICE9PSBwYXRoXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkTWFpbGJveCAhPT0gcGF0aFxufVxuXG4vKipcbiAqIFJ1bnMgU0VMRUNUIG9yIEVYQU1JTkUgdG8gb3BlbiBhIG1haWxib3hcbiAqXG4gKiBTRUxFQ1QgZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4xXG4gKiBFWEFNSU5FIGRldGFpbHM6XG4gKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIEZ1bGwgcGF0aCB0byBtYWlsYm94XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzZWxlY3RlZCBtYWlsYm94XG4gKi9cbkNsaWVudC5wcm90b3R5cGUuc2VsZWN0TWFpbGJveCA9IGZ1bmN0aW9uIChwYXRoLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgbGV0IHF1ZXJ5ID0ge1xuICAgIGNvbW1hbmQ6IG9wdGlvbnMucmVhZE9ubHkgPyAnRVhBTUlORScgOiAnU0VMRUNUJyxcbiAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICB2YWx1ZTogcGF0aFxuICAgIH1dXG4gIH1cblxuICBpZiAob3B0aW9ucy5jb25kc3RvcmUgJiYgdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdDT05EU1RPUkUnKSA+PSAwKSB7XG4gICAgcXVlcnkuYXR0cmlidXRlcy5wdXNoKFt7XG4gICAgICB0eXBlOiAnQVRPTScsXG4gICAgICB2YWx1ZTogJ0NPTkRTVE9SRSdcbiAgICB9XSlcbiAgfVxuXG4gIHRoaXMubG9nZ2VyLmRlYnVnKCdPcGVuaW5nJywgcGF0aCwgJy4uLicpXG4gIHJldHVybiB0aGlzLmV4ZWMocXVlcnksIFsnRVhJU1RTJywgJ0ZMQUdTJywgJ09LJ10sIHtcbiAgICBjdHg6IG9wdGlvbnMuY3R4XG4gIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgdGhpcy5fY2hhbmdlU3RhdGUodGhpcy5TVEFURV9TRUxFQ1RFRClcblxuICAgIGlmICh0aGlzLl9zZWxlY3RlZE1haWxib3ggJiYgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ICE9PSBwYXRoKSB7XG4gICAgICB0aGlzLm9uY2xvc2VtYWlsYm94ICYmIHRoaXMub25jbG9zZW1haWxib3godGhpcy5fc2VsZWN0ZWRNYWlsYm94KVxuICAgIH1cblxuICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IHBhdGhcblxuICAgIGxldCBtYWlsYm94SW5mbyA9IHRoaXMuX3BhcnNlU0VMRUNUKHJlc3BvbnNlKVxuXG4gICAgbGV0IG1heWJlUHJvbWlzZSA9IHRoaXMub25zZWxlY3RtYWlsYm94ICYmIHRoaXMub25zZWxlY3RtYWlsYm94KHBhdGgsIG1haWxib3hJbmZvKVxuICAgIGlmIChtYXliZVByb21pc2UgJiYgdHlwZW9mIG1heWJlUHJvbWlzZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbWF5YmVQcm9taXNlLnRoZW4oKCkgPT4gbWFpbGJveEluZm8pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYWlsYm94SW5mb1xuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBSdW5zIE5BTUVTUEFDRSBjb21tYW5kXG4gKlxuICogTkFNRVNQQUNFIGRldGFpbHM6XG4gKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMzQyXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBuYW1lc3BhY2Ugb2JqZWN0XG4gKi9cbkNsaWVudC5wcm90b3R5cGUubGlzdE5hbWVzcGFjZXMgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ05BTUVTUEFDRScpIDwgMCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpXG4gIH1cblxuICB0aGlzLmxvZ2dlci5kZWJ1ZygnTGlzdGluZyBuYW1lc3BhY2VzLi4uJylcbiAgcmV0dXJuIHRoaXMuZXhlYygnTkFNRVNQQUNFJywgJ05BTUVTUEFDRScpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcnNlTkFNRVNQQUNFKHJlc3BvbnNlKVxuICB9KVxufVxuXG4vKipcbiAqIFJ1bnMgTElTVCBhbmQgTFNVQiBjb21tYW5kcy4gUmV0cmlldmVzIGEgdHJlZSBvZiBhdmFpbGFibGUgbWFpbGJveGVzXG4gKlxuICogTElTVCBkZXRhaWxzOlxuICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjhcbiAqIExTVUIgZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy45XG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBsaXN0IG9mIG1haWxib3hlc1xuICovXG5DbGllbnQucHJvdG90eXBlLmxpc3RNYWlsYm94ZXMgPSBmdW5jdGlvbiAoKSB7XG4gIGxldCB0cmVlXG5cbiAgdGhpcy5sb2dnZXIuZGVidWcoJ0xpc3RpbmcgbWFpbGJveGVzLi4uJylcbiAgcmV0dXJuIHRoaXMuZXhlYyh7XG4gICAgY29tbWFuZDogJ0xJU1QnLFxuICAgIGF0dHJpYnV0ZXM6IFsnJywgJyonXVxuICB9LCAnTElTVCcpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgdHJlZSA9IHtcbiAgICAgIHJvb3Q6IHRydWUsXG4gICAgICBjaGlsZHJlbjogW11cbiAgICB9XG5cbiAgICBpZiAoIXJlc3BvbnNlLnBheWxvYWQgfHwgIXJlc3BvbnNlLnBheWxvYWQuTElTVCB8fCAhcmVzcG9uc2UucGF5bG9hZC5MSVNULmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcmVzcG9uc2UucGF5bG9hZC5MSVNULmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGlmICghaXRlbSB8fCAhaXRlbS5hdHRyaWJ1dGVzIHx8IGl0ZW0uYXR0cmlidXRlcy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgbGV0IGJyYW5jaCA9IHRoaXMuX2Vuc3VyZVBhdGgodHJlZSwgKGl0ZW0uYXR0cmlidXRlc1syXS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKSwgKGl0ZW0uYXR0cmlidXRlc1sxXSA/IGl0ZW0uYXR0cmlidXRlc1sxXS52YWx1ZSA6ICcvJykudG9TdHJpbmcoKSlcbiAgICAgIGJyYW5jaC5mbGFncyA9IFtdLmNvbmNhdChpdGVtLmF0dHJpYnV0ZXNbMF0gfHwgW10pLm1hcCgoZmxhZykgPT4gKGZsYWcudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkpXG4gICAgICBicmFuY2gubGlzdGVkID0gdHJ1ZVxuICAgICAgdGhpcy5fY2hlY2tTcGVjaWFsVXNlKGJyYW5jaClcbiAgICB9KVxuICB9KS50aGVuKCgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5leGVjKHtcbiAgICAgIGNvbW1hbmQ6ICdMU1VCJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFsnJywgJyonXVxuICAgIH0sICdMU1VCJylcbiAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlLnBheWxvYWQgfHwgIXJlc3BvbnNlLnBheWxvYWQuTFNVQiB8fCAhcmVzcG9uc2UucGF5bG9hZC5MU1VCLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRyZWVcbiAgICB9XG5cbiAgICByZXNwb25zZS5wYXlsb2FkLkxTVUIuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKCFpdGVtIHx8ICFpdGVtLmF0dHJpYnV0ZXMgfHwgaXRlbS5hdHRyaWJ1dGVzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBsZXQgYnJhbmNoID0gdGhpcy5fZW5zdXJlUGF0aCh0cmVlLCAoaXRlbS5hdHRyaWJ1dGVzWzJdLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLCAoaXRlbS5hdHRyaWJ1dGVzWzFdID8gaXRlbS5hdHRyaWJ1dGVzWzFdLnZhbHVlIDogJy8nKS50b1N0cmluZygpKTtcbiAgICAgIFtdLmNvbmNhdChpdGVtLmF0dHJpYnV0ZXNbMF0gfHwgW10pLm1hcCgoZmxhZykgPT4ge1xuICAgICAgICBmbGFnID0gKGZsYWcudmFsdWUgfHwgJycpLnRvU3RyaW5nKClcbiAgICAgICAgaWYgKCFicmFuY2guZmxhZ3MgfHwgYnJhbmNoLmZsYWdzLmluZGV4T2YoZmxhZykgPCAwKSB7XG4gICAgICAgICAgYnJhbmNoLmZsYWdzID0gW10uY29uY2F0KGJyYW5jaC5mbGFncyB8fCBbXSkuY29uY2F0KGZsYWcpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBicmFuY2guc3Vic2NyaWJlZCA9IHRydWVcbiAgICB9KVxuICAgIHJldHVybiB0cmVlXG4gIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICBpZiAodHJlZSkge1xuICAgICAgcmV0dXJuIHRyZWUgLy8gaWdub3JlIGVycm9yIGZvciBzdWJzY3JpYmVkIG1haWxib3hlcyBpZiB0aGVyZSdzIGEgdmFsaWQgcmVzcG9uc2UgYWxyZWFkeVxuICAgIH1cblxuICAgIHRocm93IGVyclxuICB9KVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1haWxib3ggd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAqXG4gKiBDUkVBVEUgZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqICAgICBUaGUgcGF0aCBvZiB0aGUgbWFpbGJveCB5b3Ugd291bGQgbGlrZSB0byBjcmVhdGUuICBUaGlzIG1ldGhvZCB3aWxsXG4gKiAgICAgaGFuZGxlIHV0ZjcgZW5jb2RpbmcgZm9yIHlvdS5cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICogICAgIFByb21pc2UgcmVzb2x2ZXMgaWYgbWFpbGJveCB3YXMgY3JlYXRlZC5cbiAqICAgICBJbiB0aGUgZXZlbnQgdGhlIHNlcnZlciBzYXlzIE5PIFtBTFJFQURZRVhJU1RTXSwgd2UgdHJlYXQgdGhhdCBhcyBzdWNjZXNzLlxuICovXG5DbGllbnQucHJvdG90eXBlLmNyZWF0ZU1haWxib3ggPSBmdW5jdGlvbiAocGF0aCkge1xuICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ3JlYXRpbmcgbWFpbGJveCcsIHBhdGgsICcuLi4nKVxuICByZXR1cm4gdGhpcy5leGVjKHtcbiAgICBjb21tYW5kOiAnQ1JFQVRFJyxcbiAgICBhdHRyaWJ1dGVzOiBbaW1hcEVuY29kZShwYXRoKV1cbiAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgPT09ICdBTFJFQURZRVhJU1RTJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhyb3cgZXJyXG4gIH0pXG59XG5cbi8qKlxuICogUnVucyBGRVRDSCBjb21tYW5kXG4gKlxuICogRkVUQ0ggZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC41XG4gKiBDSEFOR0VEU0lOQ0UgZGV0YWlsczpcbiAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQ1NTEjc2VjdGlvbi0zLjNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIFNlcXVlbmNlIHNldCwgZWcgMToqIGZvciBhbGwgbWVzc2FnZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbaXRlbXNdIE1lc3NhZ2UgZGF0YSBpdGVtIG5hbWVzIG9yIG1hY3JvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgZmV0Y2hlZCBtZXNzYWdlIGluZm9cbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5saXN0TWVzc2FnZXMgPSBmdW5jdGlvbiAocGF0aCwgc2VxdWVuY2UsIGl0ZW1zLCBvcHRpb25zKSB7XG4gIGl0ZW1zID0gaXRlbXMgfHwgW3tcbiAgICBmYXN0OiB0cnVlXG4gIH1dXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgdGhpcy5sb2dnZXIuZGVidWcoJ0ZldGNoaW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJy4uLicpXG4gIGxldCBjb21tYW5kID0gdGhpcy5fYnVpbGRGRVRDSENvbW1hbmQoc2VxdWVuY2UsIGl0ZW1zLCBvcHRpb25zKVxuICByZXR1cm4gdGhpcy5leGVjKGNvbW1hbmQsICdGRVRDSCcsIHtcbiAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgfSkudGhlbigocmVzcG9uc2UpID0+IHRoaXMuX3BhcnNlRkVUQ0gocmVzcG9uc2UpKVxufVxuXG4vKipcbiAqIFJ1bnMgU0VBUkNIIGNvbW1hbmRcbiAqXG4gKiBTRUFSQ0ggZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC40XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeSBTZWFyY2ggdGVybXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuc2VhcmNoID0gZnVuY3Rpb24gKHBhdGgsIHF1ZXJ5LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlYXJjaGluZyBpbicsIHBhdGgsICcuLi4nKVxuICBsZXQgY29tbWFuZCA9IHRoaXMuX2J1aWxkU0VBUkNIQ29tbWFuZChxdWVyeSwgb3B0aW9ucylcbiAgcmV0dXJuIHRoaXMuZXhlYyhjb21tYW5kLCAnU0VBUkNIJywge1xuICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICB9KS50aGVuKChyZXNwb25zZSkgPT4gdGhpcy5fcGFyc2VTRUFSQ0gocmVzcG9uc2UpKVxufVxuXG4vKipcbiAqIFJ1bnMgU1RPUkUgY29tbWFuZFxuICpcbiAqIFNUT1JFIGRldGFpbHM6XG4gKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSBzZWxlY3RvciB3aGljaCB0aGUgZmxhZyBjaGFuZ2UgaXMgYXBwbGllZCB0b1xuICogQHBhcmFtIHtBcnJheX0gZmxhZ3NcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuc2V0RmxhZ3MgPSBmdW5jdGlvbiAocGF0aCwgc2VxdWVuY2UsIGZsYWdzLCBvcHRpb25zKSB7XG4gIGxldCBrZXkgPSAnJ1xuICBsZXQgbGlzdCA9IFtdXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoZmxhZ3MpIHx8IHR5cGVvZiBmbGFncyAhPT0gJ29iamVjdCcpIHtcbiAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzIHx8IFtdKVxuICAgIGtleSA9ICcnXG4gIH0gZWxzZSBpZiAoZmxhZ3MuYWRkKSB7XG4gICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncy5hZGQgfHwgW10pXG4gICAga2V5ID0gJysnXG4gIH0gZWxzZSBpZiAoZmxhZ3Muc2V0KSB7XG4gICAga2V5ID0gJydcbiAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLnNldCB8fCBbXSlcbiAgfSBlbHNlIGlmIChmbGFncy5yZW1vdmUpIHtcbiAgICBrZXkgPSAnLSdcbiAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLnJlbW92ZSB8fCBbXSlcbiAgfVxuXG4gIHRoaXMubG9nZ2VyLmRlYnVnKCdTZXR0aW5nIGZsYWdzIG9uJywgc2VxdWVuY2UsICdpbicsIHBhdGgsICcuLi4nKVxuICByZXR1cm4gdGhpcy5zdG9yZShwYXRoLCBzZXF1ZW5jZSwga2V5ICsgJ0ZMQUdTJywgbGlzdCwgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBSdW5zIFNUT1JFIGNvbW1hbmRcbiAqXG4gKiBTVE9SRSBkZXRhaWxzOlxuICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjZcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2Ugc2VsZWN0b3Igd2hpY2ggdGhlIGZsYWcgY2hhbmdlIGlzIGFwcGxpZWQgdG9cbiAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb24gU1RPUkUgbWV0aG9kIHRvIGNhbGwsIGVnIFwiK0ZMQUdTXCJcbiAqIEBwYXJhbSB7QXJyYXl9IGZsYWdzXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICovXG5DbGllbnQucHJvdG90eXBlLnN0b3JlID0gZnVuY3Rpb24gKHBhdGgsIHNlcXVlbmNlLCBhY3Rpb24sIGZsYWdzLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgbGV0IGNvbW1hbmQgPSB0aGlzLl9idWlsZFNUT1JFQ29tbWFuZChzZXF1ZW5jZSwgYWN0aW9uLCBmbGFncywgb3B0aW9ucylcbiAgcmV0dXJuIHRoaXMuZXhlYyhjb21tYW5kLCAnRkVUQ0gnLCB7XG4gICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB0aGlzLl9wYXJzZUZFVENIKHJlc3BvbnNlKSlcbn1cblxuLyoqXG4gKiBSdW5zIEFQUEVORCBjb21tYW5kXG4gKlxuICogQVBQRU5EIGRldGFpbHM6XG4gKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMTFcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gVGhlIG1haWxib3ggd2hlcmUgdG8gYXBwZW5kIHRoZSBtZXNzYWdlXG4gKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBhcHBlbmRcbiAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnMuZmxhZ3MgQW55IGZsYWdzIHlvdSB3YW50IHRvIHNldCBvbiB0aGUgdXBsb2FkZWQgbWVzc2FnZS4gRGVmYXVsdHMgdG8gW1xcU2Vlbl0uIChvcHRpb25hbClcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS51cGxvYWQgPSBmdW5jdGlvbiAoZGVzdGluYXRpb24sIG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgb3B0aW9ucy5mbGFncyA9IG9wdGlvbnMuZmxhZ3MgfHwgWydcXFxcU2VlbiddXG4gIGxldCBmbGFncyA9IG9wdGlvbnMuZmxhZ3MubWFwKChmbGFnKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdhdG9tJyxcbiAgICAgIHZhbHVlOiBmbGFnXG4gICAgfVxuICB9KVxuXG4gIGxldCBjb21tYW5kID0ge1xuICAgIGNvbW1hbmQ6ICdBUFBFTkQnLFxuICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICB0eXBlOiAnYXRvbScsXG4gICAgICB2YWx1ZTogZGVzdGluYXRpb25cbiAgICB9LFxuICAgICAgZmxhZ3MsIHtcbiAgICAgICAgdHlwZTogJ2xpdGVyYWwnLFxuICAgICAgICB2YWx1ZTogbWVzc2FnZVxuICAgICAgfVxuICAgIF1cbiAgfVxuXG4gIHRoaXMubG9nZ2VyLmRlYnVnKCdVcGxvYWRpbmcgbWVzc2FnZSB0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcbiAgcmV0dXJuIHRoaXMuZXhlYyhjb21tYW5kKVxufVxuXG4vKipcbiAqIERlbGV0ZXMgbWVzc2FnZXMgZnJvbSBhIHNlbGVjdGVkIG1haWxib3hcbiAqXG4gKiBFWFBVTkdFIGRldGFpbHM6XG4gKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuM1xuICogVUlEIEVYUFVOR0UgZGV0YWlsczpcbiAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQzMTUjc2VjdGlvbi0yLjFcbiAqXG4gKiBJZiBwb3NzaWJsZSAoYnlVaWQ6dHJ1ZSBhbmQgVUlEUExVUyBleHRlbnNpb24gc3VwcG9ydGVkKSwgdXNlcyBVSUQgRVhQVU5HRVxuICogY29tbWFuZCB0byBkZWxldGUgYSByYW5nZSBvZiBtZXNzYWdlcywgb3RoZXJ3aXNlIGZhbGxzIGJhY2sgdG8gRVhQVU5HRS5cbiAqXG4gKiBOQiEgVGhpcyBtZXRob2QgbWlnaHQgYmUgZGVzdHJ1Y3RpdmUgLSBpZiBFWFBVTkdFIGlzIHVzZWQsIHRoZW4gYW55IG1lc3NhZ2VzXG4gKiB3aXRoIFxcRGVsZXRlZCBmbGFnIHNldCBhcmUgZGVsZXRlZFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSByYW5nZSB0byBiZSBkZWxldGVkXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5kZWxldGVNZXNzYWdlcyA9IGZ1bmN0aW9uIChwYXRoLCBzZXF1ZW5jZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gIC8vIGFkZCBcXERlbGV0ZWQgZmxhZyB0byB0aGUgbWVzc2FnZXMgYW5kIHJ1biBFWFBVTkdFIG9yIFVJRCBFWFBVTkdFXG4gIHRoaXMubG9nZ2VyLmRlYnVnKCdEZWxldGluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnaW4nLCBwYXRoLCAnLi4uJylcbiAgcmV0dXJuIHRoaXMuc2V0RmxhZ3MocGF0aCwgc2VxdWVuY2UsIHtcbiAgICBhZGQ6ICdcXFxcRGVsZXRlZCdcbiAgfSwgb3B0aW9ucykudGhlbigoKSA9PiB7XG4gICAgbGV0IGNtZFxuICAgIGlmIChvcHRpb25zLmJ5VWlkICYmIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignVUlEUExVUycpID49IDApIHtcbiAgICAgIGNtZCA9IHtcbiAgICAgICAgY29tbWFuZDogJ1VJRCBFWFBVTkdFJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB0eXBlOiAnc2VxdWVuY2UnLFxuICAgICAgICAgIHZhbHVlOiBzZXF1ZW5jZVxuICAgICAgICB9XVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjbWQgPSAnRVhQVU5HRSdcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhjbWQsIG51bGwsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gIH0pXG59XG5cbi8qKlxuICogQ29waWVzIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgYWN0aXZlIG1haWxib3ggdG8gdGhlIGRlc3RpbmF0aW9uIG1haWxib3guXG4gKiBTaWxlbnQgbWV0aG9kICh1bmxlc3MgYW4gZXJyb3Igb2NjdXJzKSwgYnkgZGVmYXVsdCByZXR1cm5zIG5vIGluZm9ybWF0aW9uLlxuICpcbiAqIENPUFkgZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC43XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIGNvcGllZFxuICogQHBhcmFtIHtTdHJpbmd9IGRlc3RpbmF0aW9uIERlc3RpbmF0aW9uIG1haWxib3ggcGF0aFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuYnlVaWRdIElmIHRydWUsIHVzZXMgVUlEIENPUFkgaW5zdGVhZCBvZiBDT1BZXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZVxuICovXG5DbGllbnQucHJvdG90eXBlLmNvcHlNZXNzYWdlcyA9IGZ1bmN0aW9uIChwYXRoLCBzZXF1ZW5jZSwgZGVzdGluYXRpb24sIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29weWluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICd0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcbiAgcmV0dXJuIHRoaXMuZXhlYyh7XG4gICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgQ09QWScgOiAnQ09QWScsXG4gICAgYXR0cmlidXRlczogW3tcbiAgICAgIHR5cGU6ICdzZXF1ZW5jZScsXG4gICAgICB2YWx1ZTogc2VxdWVuY2VcbiAgICB9LCB7XG4gICAgICB0eXBlOiAnYXRvbScsXG4gICAgICB2YWx1ZTogZGVzdGluYXRpb25cbiAgICB9XVxuICB9LCBudWxsLCB7XG4gICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiAocmVzcG9uc2UuaHVtYW5SZWFkYWJsZSB8fCAnQ09QWSBjb21wbGV0ZWQnKSlcbn1cblxuLyoqXG4gKiBNb3ZlcyBhIHJhbmdlIG9mIG1lc3NhZ2VzIGZyb20gdGhlIGFjdGl2ZSBtYWlsYm94IHRvIHRoZSBkZXN0aW5hdGlvbiBtYWlsYm94LlxuICogUHJlZmVycyB0aGUgTU9WRSBleHRlbnNpb24gYnV0IGlmIG5vdCBhdmFpbGFibGUsIGZhbGxzIGJhY2sgdG9cbiAqIENPUFkgKyBFWFBVTkdFXG4gKlxuICogTU9WRSBkZXRhaWxzOlxuICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM2ODUxXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIG1vdmVkXG4gKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gRGVzdGluYXRpb24gbWFpbGJveCBwYXRoXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5tb3ZlTWVzc2FnZXMgPSBmdW5jdGlvbiAocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgdGhpcy5sb2dnZXIuZGVidWcoJ01vdmluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICd0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcblxuICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdNT1ZFJykgPT09IC0xKSB7XG4gICAgLy8gRmFsbGJhY2sgdG8gQ09QWSArIEVYUFVOR0VcbiAgICByZXR1cm4gdGhpcy5jb3B5TWVzc2FnZXMocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zKS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZU1lc3NhZ2VzKHBhdGgsIHNlcXVlbmNlLCBvcHRpb25zKVxuICAgIH0pXG4gIH1cblxuICAvLyBJZiBwb3NzaWJsZSwgdXNlIE1PVkVcbiAgcmV0dXJuIHRoaXMuZXhlYyh7XG4gICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgTU9WRScgOiAnTU9WRScsXG4gICAgYXR0cmlidXRlczogW3tcbiAgICAgIHR5cGU6ICdzZXF1ZW5jZScsXG4gICAgICB2YWx1ZTogc2VxdWVuY2VcbiAgICB9LCB7XG4gICAgICB0eXBlOiAnYXRvbScsXG4gICAgICB2YWx1ZTogZGVzdGluYXRpb25cbiAgICB9XVxuICB9LCBbJ09LJ10sIHtcbiAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgfSlcbn1cblxuLy9cbi8vXG4vLyBJTlRFUk5BTFNcbi8vXG4vL1xuXG4vLyBTdGF0ZSBjb25zdGFudHNcbkNsaWVudC5wcm90b3R5cGUuU1RBVEVfQ09OTkVDVElORyA9IDFcbkNsaWVudC5wcm90b3R5cGUuU1RBVEVfTk9UX0FVVEhFTlRJQ0FURUQgPSAyXG5DbGllbnQucHJvdG90eXBlLlNUQVRFX0FVVEhFTlRJQ0FURUQgPSAzXG5DbGllbnQucHJvdG90eXBlLlNUQVRFX1NFTEVDVEVEID0gNFxuQ2xpZW50LnByb3RvdHlwZS5TVEFURV9MT0dPVVQgPSA1XG5cbi8vIFRpbWVvdXQgY29uc3RhbnRzXG5DbGllbnQucHJvdG90eXBlLlRJTUVPVVRfQ09OTkVDVElPTiA9IDkwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgdG8gd2FpdCBmb3IgdGhlIElNQVAgZ3JlZXRpbmcgZnJvbSB0aGUgc2VydmVyXG5DbGllbnQucHJvdG90eXBlLlRJTUVPVVRfTk9PUCA9IDYwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgYmV0d2VlbiBOT09QIGNvbW1hbmRzIHdoaWxlIGlkbGluZ1xuQ2xpZW50LnByb3RvdHlwZS5USU1FT1VUX0lETEUgPSA2MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIHVudGlsIElETEUgY29tbWFuZCBpcyBjYW5jZWxsZWRcblxuLyoqXG4gKiBSdW5zIENPTVBSRVNTIGNvbW1hbmRcbiAqXG4gKiBDT01QUkVTUyBkZXRhaWxzOlxuICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDk3OFxuICovXG5DbGllbnQucHJvdG90eXBlLmNvbXByZXNzQ29ubmVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuZW5hYmxlQ29tcHJlc3Npb24gfHwgdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdDT01QUkVTUz1ERUZMQVRFJykgPCAwIHx8IHRoaXMuY2xpZW50LmNvbXByZXNzZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICB9XG5cbiAgdGhpcy5sb2dnZXIuZGVidWcoJ0VuYWJsaW5nIGNvbXByZXNzaW9uLi4uJylcbiAgcmV0dXJuIHRoaXMuZXhlYyh7XG4gICAgY29tbWFuZDogJ0NPTVBSRVNTJyxcbiAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgdmFsdWU6ICdERUZMQVRFJ1xuICAgIH1dXG4gIH0pLnRoZW4oKCkgPT4ge1xuICAgIHRoaXMuY2xpZW50LmVuYWJsZUNvbXByZXNzaW9uKClcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29tcHJlc3Npb24gZW5hYmxlZCwgYWxsIGRhdGEgc2VudCBhbmQgcmVjZWl2ZWQgaXMgZGVmbGF0ZWQhJylcbiAgfSlcbn1cblxuLyoqXG4gKiBSdW5zIExPR0lOIG9yIEFVVEhFTlRJQ0FURSBYT0FVVEgyIGNvbW1hbmRcbiAqXG4gKiBMT0dJTiBkZXRhaWxzOlxuICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4yLjNcbiAqIFhPQVVUSDIgZGV0YWlsczpcbiAqICAgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwveG9hdXRoMl9wcm90b2NvbCNpbWFwX3Byb3RvY29sX2V4Y2hhbmdlXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGF1dGgudXNlclxuICogQHBhcmFtIHtTdHJpbmd9IGF1dGgucGFzc1xuICogQHBhcmFtIHtTdHJpbmd9IGF1dGgueG9hdXRoMlxuICovXG5DbGllbnQucHJvdG90eXBlLmxvZ2luID0gZnVuY3Rpb24gKGF1dGgpIHtcbiAgbGV0IGNvbW1hbmRcbiAgbGV0IG9wdGlvbnMgPSB7fVxuXG4gIGlmICghYXV0aCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ0F1dGhlbnRpY2F0aW9uIGluZm9ybWF0aW9uIG5vdCBwcm92aWRlZCcpKVxuICB9XG5cbiAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQVVUSD1YT0FVVEgyJykgPj0gMCAmJiBhdXRoICYmIGF1dGgueG9hdXRoMikge1xuICAgIGNvbW1hbmQgPSB7XG4gICAgICBjb21tYW5kOiAnQVVUSEVOVElDQVRFJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgdmFsdWU6ICdYT0FVVEgyJ1xuICAgICAgfSwge1xuICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgIHZhbHVlOiB0aGlzLl9idWlsZFhPQXV0aDJUb2tlbihhdXRoLnVzZXIsIGF1dGgueG9hdXRoMiksXG4gICAgICAgIHNlbnNpdGl2ZTogdHJ1ZVxuICAgICAgfV1cbiAgICB9XG5cbiAgICBvcHRpb25zLmVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lID0gdHJ1ZSAvLyArIHRhZ2dlZCBlcnJvciByZXNwb25zZSBleHBlY3RzIGFuIGVtcHR5IGxpbmUgaW4gcmV0dXJuXG4gIH0gZWxzZSB7XG4gICAgY29tbWFuZCA9IHtcbiAgICAgIGNvbW1hbmQ6ICdsb2dpbicsXG4gICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgdmFsdWU6IGF1dGgudXNlciB8fCAnJ1xuICAgICAgfSwge1xuICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgdmFsdWU6IGF1dGgucGFzcyB8fCAnJyxcbiAgICAgICAgc2Vuc2l0aXZlOiB0cnVlXG4gICAgICB9XVxuICAgIH1cbiAgfVxuXG4gIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluLi4uJylcbiAgcmV0dXJuIHRoaXMuZXhlYyhjb21tYW5kLCAnY2FwYWJpbGl0eScsIG9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgLypcbiAgICAgKiB1cGRhdGUgcG9zdC1hdXRoIGNhcGFiaWxpdGVzXG4gICAgICogY2FwYWJpbGl0eSBsaXN0IHNob3VsZG4ndCBjb250YWluIGF1dGggcmVsYXRlZCBzdHVmZiBhbnltb3JlXG4gICAgICogYnV0IHNvbWUgbmV3IGV4dGVuc2lvbnMgbWlnaHQgaGF2ZSBwb3BwZWQgdXAgdGhhdCBkbyBub3RcbiAgICAgKiBtYWtlIG11Y2ggc2Vuc2UgaW4gdGhlIG5vbi1hdXRoIHN0YXRlXG4gICAgICovXG4gICAgaWYgKHJlc3BvbnNlLmNhcGFiaWxpdHkgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eS5sZW5ndGgpIHtcbiAgICAgIC8vIGNhcGFiaWxpdGVzIHdlcmUgbGlzdGVkIHdpdGggdGhlIE9LIFtDQVBBQklMSVRZIC4uLl0gcmVzcG9uc2VcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSBbXS5jb25jYXQocmVzcG9uc2UuY2FwYWJpbGl0eSB8fCBbXSlcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnBheWxvYWQgJiYgcmVzcG9uc2UucGF5bG9hZC5DQVBBQklMSVRZICYmIHJlc3BvbnNlLnBheWxvYWQuQ0FQQUJJTElUWS5sZW5ndGgpIHtcbiAgICAgIC8vIGNhcGFiaWxpdGVzIHdlcmUgbGlzdGVkIHdpdGggKiBDQVBBQklMSVRZIC4uLiByZXNwb25zZVxuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IFtdLmNvbmNhdChyZXNwb25zZS5wYXlsb2FkLkNBUEFCSUxJVFkucG9wKCkuYXR0cmlidXRlcyB8fCBbXSkubWFwKChjYXBhKSA9PiAoY2FwYS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2FwYWJpbGl0aWVzIHdlcmUgbm90IGF1dG9tYXRpY2FsbHkgbGlzdGVkLCByZWxvYWRcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUNhcGFiaWxpdHkodHJ1ZSlcbiAgICB9XG4gIH0pLnRoZW4oKCkgPT4ge1xuICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVfQVVUSEVOVElDQVRFRClcbiAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gdHJ1ZVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dpbiBzdWNjZXNzZnVsLCBwb3N0LWF1dGggY2FwYWJpbGl0ZXMgdXBkYXRlZCEnLCB0aGlzLl9jYXBhYmlsaXR5KVxuICB9KVxufVxuXG4vKipcbiAqIFJ1biBhbiBJTUFQIGNvbW1hbmQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3QgU3RydWN0dXJlZCByZXF1ZXN0IG9iamVjdFxuICogQHBhcmFtIHtBcnJheX0gYWNjZXB0VW50YWdnZWQgYSBsaXN0IG9mIHVudGFnZ2VkIHJlc3BvbnNlcyB0aGF0IHdpbGwgYmUgaW5jbHVkZWQgaW4gJ3BheWxvYWQnIHByb3BlcnR5XG4gKi9cbkNsaWVudC5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucykge1xuICB0aGlzLmJyZWFrSWRsZSgpXG4gIHJldHVybiB0aGlzLmNsaWVudC5lbnF1ZXVlQ29tbWFuZChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucykudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eSkge1xuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLmNhcGFiaWxpdHlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH0pXG59XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgdGhlIGNvbm5lY3Rpb24gc3RhcnRlZCBpZGxpbmcuIEluaXRpYXRlcyBhIGN5Y2xlXG4gKiBvZiBOT09QcyBvciBJRExFcyB0byByZWNlaXZlIG5vdGlmaWNhdGlvbnMgYWJvdXQgdXBkYXRlcyBpbiB0aGUgc2VydmVyXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX29uSWRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9hdXRoZW50aWNhdGVkIHx8IHRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgLy8gTm8gbmVlZCB0byBJRExFIHdoZW4gbm90IGxvZ2dlZCBpbiBvciBhbHJlYWR5IGlkbGluZ1xuICAgIHJldHVyblxuICB9XG5cbiAgdGhpcy5sb2dnZXIuZGVidWcoJ0NsaWVudCBzdGFydGVkIGlkbGluZycpXG4gIHRoaXMuZW50ZXJJZGxlKClcbn1cblxuLyoqXG4gKiBUaGUgY29ubmVjdGlvbiBpcyBpZGxpbmcuIFNlbmRzIGEgTk9PUCBvciBJRExFIGNvbW1hbmRcbiAqXG4gKiBJRExFIGRldGFpbHM6XG4gKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMTc3XG4gKi9cbkNsaWVudC5wcm90b3R5cGUuZW50ZXJJZGxlID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fZW50ZXJlZElkbGUpIHtcbiAgICByZXR1cm5cbiAgfVxuICB0aGlzLl9lbnRlcmVkSWRsZSA9IHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignSURMRScpID49IDAgPyAnSURMRScgOiAnTk9PUCdcbiAgdGhpcy5sb2dnZXIuZGVidWcoJ0VudGVyaW5nIGlkbGUgd2l0aCAnICsgdGhpcy5fZW50ZXJlZElkbGUpXG5cbiAgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnTk9PUCcpIHtcbiAgICB0aGlzLl9pZGxlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlbmRpbmcgTk9PUCcpXG4gICAgICB0aGlzLmV4ZWMoJ05PT1AnKVxuICAgIH0sIHRoaXMuVElNRU9VVF9OT09QKVxuICB9IGVsc2UgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnSURMRScpIHtcbiAgICB0aGlzLmNsaWVudC5lbnF1ZXVlQ29tbWFuZCh7XG4gICAgICBjb21tYW5kOiAnSURMRSdcbiAgICB9KVxuICAgIHRoaXMuX2lkbGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmNsaWVudC5zZW5kKCdET05FXFxyXFxuJylcbiAgICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdJZGxlIHRlcm1pbmF0ZWQnKVxuICAgIH0sIHRoaXMuVElNRU9VVF9JRExFKVxuICB9XG59XG5cbi8qKlxuICogU3RvcHMgYWN0aW9ucyByZWxhdGVkIGlkbGluZywgaWYgSURMRSBpcyBzdXBwb3J0ZWQsIHNlbmRzIERPTkUgdG8gc3RvcCBpdFxuICovXG5DbGllbnQucHJvdG90eXBlLmJyZWFrSWRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9lbnRlcmVkSWRsZSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICBpZiAodGhpcy5fZW50ZXJlZElkbGUgPT09ICdJRExFJykge1xuICAgIHRoaXMuY2xpZW50LnNlbmQoJ0RPTkVcXHJcXG4nKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdJZGxlIHRlcm1pbmF0ZWQnKVxuICB9XG4gIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2Vcbn1cblxuLyoqXG4gKiBSdW5zIFNUQVJUVExTIGNvbW1hbmQgaWYgbmVlZGVkXG4gKlxuICogU1RBUlRUTFMgZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMi4xXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VkXSBCeSBkZWZhdWx0IHRoZSBjb21tYW5kIGlzIG5vdCBydW4gaWYgY2FwYWJpbGl0eSBpcyBhbHJlYWR5IGxpc3RlZC4gU2V0IHRvIHRydWUgdG8gc2tpcCB0aGlzIHZhbGlkYXRpb25cbiAqL1xuQ2xpZW50LnByb3RvdHlwZS51cGdyYWRlQ29ubmVjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gc2tpcCByZXF1ZXN0LCBpZiBhbHJlYWR5IHNlY3VyZWRcbiAgaWYgKHRoaXMuY2xpZW50LnNlY3VyZU1vZGUpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICB9XG5cbiAgLy8gc2tpcCBpZiBTVEFSVFRMUyBub3QgYXZhaWxhYmxlIG9yIHN0YXJ0dGxzIHN1cHBvcnQgZGlzYWJsZWRcbiAgaWYgKCh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ1NUQVJUVExTJykgPCAwIHx8IHRoaXMub3B0aW9ucy5pZ25vcmVUTFMpICYmICF0aGlzLm9wdGlvbnMucmVxdWlyZVRMUykge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpXG4gIH1cblxuICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW5jcnlwdGluZyBjb25uZWN0aW9uLi4uJylcbiAgcmV0dXJuIHRoaXMuZXhlYygnU1RBUlRUTFMnKS50aGVuKCgpID0+IHtcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gW11cbiAgICB0aGlzLmNsaWVudC51cGdyYWRlKClcbiAgICByZXR1cm4gdGhpcy51cGRhdGVDYXBhYmlsaXR5KClcbiAgfSlcbn1cblxuLyoqXG4gKiBSdW5zIENBUEFCSUxJVFkgY29tbWFuZFxuICpcbiAqIENBUEFCSUxJVFkgZGV0YWlsczpcbiAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMS4xXG4gKlxuICogRG9lc24ndCByZWdpc3RlciB1bnRhZ2dlZCBDQVBBQklMSVRZIGhhbmRsZXIgYXMgdGhpcyBpcyBhbHJlYWR5XG4gKiBoYW5kbGVkIGJ5IGdsb2JhbCBoYW5kbGVyXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VkXSBCeSBkZWZhdWx0IHRoZSBjb21tYW5kIGlzIG5vdCBydW4gaWYgY2FwYWJpbGl0eSBpcyBhbHJlYWR5IGxpc3RlZC4gU2V0IHRvIHRydWUgdG8gc2tpcCB0aGlzIHZhbGlkYXRpb25cbiAqL1xuQ2xpZW50LnByb3RvdHlwZS51cGRhdGVDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKGZvcmNlZCkge1xuICAvLyBza2lwIHJlcXVlc3QsIGlmIG5vdCBmb3JjZWQgdXBkYXRlIGFuZCBjYXBhYmlsaXRpZXMgYXJlIGFscmVhZHkgbG9hZGVkXG4gIGlmICghZm9yY2VkICYmIHRoaXMuX2NhcGFiaWxpdHkubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIH1cblxuICAvLyBJZiBTVEFSVFRMUyBpcyByZXF1aXJlZCB0aGVuIHNraXAgY2FwYWJpbGl0eSBsaXN0aW5nIGFzIHdlIGFyZSBnb2luZyB0byB0cnlcbiAgLy8gU1RBUlRUTFMgYW55d2F5IGFuZCB3ZSByZS1jaGVjayBjYXBhYmlsaXRpZXMgYWZ0ZXIgY29ubmVjdGlvbiBpcyBzZWN1cmVkXG4gIGlmICghdGhpcy5jbGllbnQuc2VjdXJlTW9kZSAmJiB0aGlzLm9wdGlvbnMucmVxdWlyZVRMUykge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICB9XG5cbiAgdGhpcy5sb2dnZXIuZGVidWcoJ1VwZGF0aW5nIGNhcGFiaWxpdHkuLi4nKVxuICByZXR1cm4gdGhpcy5leGVjKCdDQVBBQklMSVRZJylcbn1cblxuQ2xpZW50LnByb3RvdHlwZS5oYXNDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKGNhcGEpIHtcbiAgcmV0dXJuIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZigoY2FwYSB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSkgPj0gMFxufVxuXG4vLyBEZWZhdWx0IGhhbmRsZXJzIGZvciB1bnRhZ2dlZCByZXNwb25zZXNcblxuLyoqXG4gKiBDaGVja3MgaWYgYW4gdW50YWdnZWQgT0sgaW5jbHVkZXMgW0NBUEFCSUxJVFldIHRhZyBhbmQgdXBkYXRlcyBjYXBhYmlsaXR5IG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICovXG5DbGllbnQucHJvdG90eXBlLl91bnRhZ2dlZE9rSGFuZGxlciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eSkge1xuICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5jYXBhYmlsaXR5XG4gIH1cbn1cblxuLyoqXG4gKiBVcGRhdGVzIGNhcGFiaWxpdHkgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgdGhpcy5fY2FwYWJpbGl0eSA9IFtdLmNvbmNhdChwcm9wT3IoW10sICdhdHRyaWJ1dGVzJykocmVzcG9uc2UpKS5tYXAoKGNhcGEpID0+IChjYXBhLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkudHJpbSgpKVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgZXhpc3RpbmcgbWVzc2FnZSBjb3VudFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICovXG5DbGllbnQucHJvdG90eXBlLl91bnRhZ2dlZEV4aXN0c0hhbmRsZXIgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmhhc093blByb3BlcnR5KCducicpKSB7XG4gICAgdGhpcy5vbnVwZGF0ZSAmJiB0aGlzLm9udXBkYXRlKHRoaXMuX3NlbGVjdGVkTWFpbGJveCwgJ2V4aXN0cycsIHJlc3BvbnNlLm5yKVxuICB9XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIGEgbWVzc2FnZSBoYXMgYmVlbiBkZWxldGVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmhhc093blByb3BlcnR5KCducicpKSB7XG4gICAgdGhpcy5vbnVwZGF0ZSAmJiB0aGlzLm9udXBkYXRlKHRoaXMuX3NlbGVjdGVkTWFpbGJveCwgJ2V4cHVuZ2UnLCByZXNwb25zZS5ucilcbiAgfVxufVxuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IGZsYWdzIGhhdmUgYmVlbiB1cGRhdGVkIGZvciBhIG1lc3NhZ2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5fdW50YWdnZWRGZXRjaEhhbmRsZXIgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgdGhpcy5vbnVwZGF0ZSAmJiB0aGlzLm9udXBkYXRlKHRoaXMuX3NlbGVjdGVkTWFpbGJveCwgJ2ZldGNoJywgW10uY29uY2F0KHRoaXMuX3BhcnNlRkVUQ0goe1xuICAgIHBheWxvYWQ6IHtcbiAgICAgIEZFVENIOiBbcmVzcG9uc2VdXG4gICAgfVxuICB9KSB8fCBbXSkuc2hpZnQoKSlcbn1cblxuLy8gUHJpdmF0ZSBoZWxwZXJzXG5cbi8qKlxuICogUGFyc2VzIFNFTEVDVCByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICogQHJldHVybiB7T2JqZWN0fSBNYWlsYm94IGluZm9ybWF0aW9uIG9iamVjdFxuICovXG5DbGllbnQucHJvdG90eXBlLl9wYXJzZVNFTEVDVCA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5wYXlsb2FkKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgbWFpbGJveCA9IHtcbiAgICByZWFkT25seTogcmVzcG9uc2UuY29kZSA9PT0gJ1JFQUQtT05MWSdcbiAgfVxuICBsZXQgZXhpc3RzUmVzcG9uc2UgPSByZXNwb25zZS5wYXlsb2FkLkVYSVNUUyAmJiByZXNwb25zZS5wYXlsb2FkLkVYSVNUUy5wb3AoKVxuICBsZXQgZmxhZ3NSZXNwb25zZSA9IHJlc3BvbnNlLnBheWxvYWQuRkxBR1MgJiYgcmVzcG9uc2UucGF5bG9hZC5GTEFHUy5wb3AoKVxuICBsZXQgb2tSZXNwb25zZSA9IHJlc3BvbnNlLnBheWxvYWQuT0tcblxuICBpZiAoZXhpc3RzUmVzcG9uc2UpIHtcbiAgICBtYWlsYm94LmV4aXN0cyA9IGV4aXN0c1Jlc3BvbnNlLm5yIHx8IDBcbiAgfVxuXG4gIGlmIChmbGFnc1Jlc3BvbnNlICYmIGZsYWdzUmVzcG9uc2UuYXR0cmlidXRlcyAmJiBmbGFnc1Jlc3BvbnNlLmF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgbWFpbGJveC5mbGFncyA9IGZsYWdzUmVzcG9uc2UuYXR0cmlidXRlc1swXS5tYXAoKGZsYWcpID0+IChmbGFnLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKSlcbiAgfVxuXG4gIFtdLmNvbmNhdChva1Jlc3BvbnNlIHx8IFtdKS5mb3JFYWNoKChvaykgPT4ge1xuICAgIHN3aXRjaCAob2sgJiYgb2suY29kZSkge1xuICAgICAgY2FzZSAnUEVSTUFORU5URkxBR1MnOlxuICAgICAgICBtYWlsYm94LnBlcm1hbmVudEZsYWdzID0gW10uY29uY2F0KG9rLnBlcm1hbmVudGZsYWdzIHx8IFtdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnVUlEVkFMSURJVFknOlxuICAgICAgICBtYWlsYm94LnVpZFZhbGlkaXR5ID0gTnVtYmVyKG9rLnVpZHZhbGlkaXR5KSB8fCAwXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdVSURORVhUJzpcbiAgICAgICAgbWFpbGJveC51aWROZXh0ID0gTnVtYmVyKG9rLnVpZG5leHQpIHx8IDBcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ0hJR0hFU1RNT0RTRVEnOlxuICAgICAgICBtYWlsYm94LmhpZ2hlc3RNb2RzZXEgPSBvay5oaWdoZXN0bW9kc2VxIHx8ICcwJyAvLyBrZWVwIDY0Yml0IHVpbnQgYXMgYSBzdHJpbmdcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ05PTU9EU0VRJzpcbiAgICAgICAgbWFpbGJveC5ub01vZHNlcSA9IHRydWVcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG1haWxib3hcbn1cblxuLyoqXG4gKiBQYXJzZXMgTkFNRVNQQUNFIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5hbWVzcGFjZXMgb2JqZWN0XG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX3BhcnNlTkFNRVNQQUNFID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2UucGF5bG9hZCB8fCAhcmVzcG9uc2UucGF5bG9hZC5OQU1FU1BBQ0UgfHwgIXJlc3BvbnNlLnBheWxvYWQuTkFNRVNQQUNFLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgbGV0IGF0dHJpYnV0ZXMgPSBbXS5jb25jYXQocmVzcG9uc2UucGF5bG9hZC5OQU1FU1BBQ0UucG9wKCkuYXR0cmlidXRlcyB8fCBbXSlcbiAgaWYgKCFhdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwZXJzb25hbDogdGhpcy5fcGFyc2VOQU1FU1BBQ0VFbGVtZW50KGF0dHJpYnV0ZXNbMF0pLFxuICAgIHVzZXJzOiB0aGlzLl9wYXJzZU5BTUVTUEFDRUVsZW1lbnQoYXR0cmlidXRlc1sxXSksXG4gICAgc2hhcmVkOiB0aGlzLl9wYXJzZU5BTUVTUEFDRUVsZW1lbnQoYXR0cmlidXRlc1syXSlcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlcyBhIE5BTUVTUEFDRSBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAqIEByZXR1cm4ge09iamVjdH0gTmFtZXNwYWNlcyBlbGVtZW50IG9iamVjdFxuICovXG5DbGllbnQucHJvdG90eXBlLl9wYXJzZU5BTUVTUEFDRUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGVsZW1lbnQgPSBbXS5jb25jYXQoZWxlbWVudCB8fCBbXSlcbiAgcmV0dXJuIGVsZW1lbnQubWFwKChucykgPT4ge1xuICAgIGlmICghbnMgfHwgIW5zLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHByZWZpeDogbnNbMF0udmFsdWUsXG4gICAgICBkZWxpbWl0ZXI6IG5zWzFdICYmIG5zWzFdLnZhbHVlIC8vIFRoZSBkZWxpbWl0ZXIgY2FuIGxlZ2FsbHkgYmUgTklMIHdoaWNoIG1hcHMgdG8gbnVsbFxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBGRVRDSCBjb21tYW5kXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2UgcmFuZ2Ugc2VsZWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zIExpc3Qgb2YgZWxlbWVudHMgdG8gZmV0Y2ggKGVnLiBgWyd1aWQnLCAnZW52ZWxvcGUnXWApLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25hbCBvcHRpb25zIG9iamVjdC4gVXNlIGB7YnlVaWQ6dHJ1ZX1gIGZvciBgVUlEIEZFVENIYFxuICogQHJldHVybnMge09iamVjdH0gU3RydWN0dXJlZCBJTUFQIGNvbW1hbmRcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5fYnVpbGRGRVRDSENvbW1hbmQgPSBmdW5jdGlvbiAoc2VxdWVuY2UsIGl0ZW1zLCBvcHRpb25zKSB7XG4gIGxldCBjb21tYW5kID0ge1xuICAgIGNvbW1hbmQ6IG9wdGlvbnMuYnlVaWQgPyAnVUlEIEZFVENIJyA6ICdGRVRDSCcsXG4gICAgYXR0cmlidXRlczogW3tcbiAgICAgIHR5cGU6ICdTRVFVRU5DRScsXG4gICAgICB2YWx1ZTogc2VxdWVuY2VcbiAgICB9XVxuICB9XG5cbiAgaWYgKG9wdGlvbnMudmFsdWVBc1N0cmluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29tbWFuZC52YWx1ZUFzU3RyaW5nID0gb3B0aW9ucy52YWx1ZUFzU3RyaW5nXG4gIH1cblxuICBsZXQgcXVlcnkgPSBbXVxuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBpdGVtID0gaXRlbS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuXG4gICAgaWYgKC9eXFx3KyQvLnRlc3QoaXRlbSkpIHtcbiAgICAgIC8vIGFscGhhbnVtIHN0cmluZ3MgY2FuIGJlIHVzZWQgZGlyZWN0bHlcbiAgICAgIHF1ZXJ5LnB1c2goe1xuICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgIHZhbHVlOiBpdGVtXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAoaXRlbSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gcGFyc2UgdGhlIHZhbHVlIGFzIGEgZmFrZSBjb21tYW5kLCB1c2Ugb25seSB0aGUgYXR0cmlidXRlcyBibG9ja1xuICAgICAgICBjb25zdCBjbWQgPSBwYXJzZXIodG9UeXBlZEFycmF5KCcqIFogJyArIGl0ZW0pKVxuICAgICAgICBxdWVyeSA9IHF1ZXJ5LmNvbmNhdChjbWQuYXR0cmlidXRlcyB8fCBbXSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaWYgcGFyc2UgZmFpbGVkLCB1c2UgdGhlIG9yaWdpbmFsIHN0cmluZyBhcyBvbmUgZW50aXR5XG4gICAgICAgIHF1ZXJ5LnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICB2YWx1ZTogaXRlbVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBpZiAocXVlcnkubGVuZ3RoID09PSAxKSB7XG4gICAgcXVlcnkgPSBxdWVyeS5wb3AoKVxuICB9XG5cbiAgY29tbWFuZC5hdHRyaWJ1dGVzLnB1c2gocXVlcnkpXG5cbiAgaWYgKG9wdGlvbnMuY2hhbmdlZFNpbmNlKSB7XG4gICAgY29tbWFuZC5hdHRyaWJ1dGVzLnB1c2goW3tcbiAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgIHZhbHVlOiAnQ0hBTkdFRFNJTkNFJ1xuICAgIH0sIHtcbiAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgIHZhbHVlOiBvcHRpb25zLmNoYW5nZWRTaW5jZVxuICAgIH1dKVxuICB9XG5cbiAgcmV0dXJuIGNvbW1hbmRcbn1cblxuLyoqXG4gKiBQYXJzZXMgRkVUQ0ggcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAqIEByZXR1cm4ge09iamVjdH0gTWVzc2FnZSBvYmplY3RcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5fcGFyc2VGRVRDSCA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5wYXlsb2FkIHx8ICFyZXNwb25zZS5wYXlsb2FkLkZFVENIIHx8ICFyZXNwb25zZS5wYXlsb2FkLkZFVENILmxlbmd0aCkge1xuICAgIHJldHVybiBbXVxuICB9XG5cbiAgbGV0IGxpc3QgPSBbXVxuICBsZXQgbWVzc2FnZXMgPSB7fTtcblxuICBbXS5jb25jYXQocmVzcG9uc2UucGF5bG9hZC5GRVRDSCB8fCBbXSkuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIGxldCBwYXJhbXMgPSBbXS5jb25jYXQoW10uY29uY2F0KGl0ZW0uYXR0cmlidXRlcyB8fCBbXSlbMF0gfHwgW10pIC8vIGVuc3VyZSB0aGUgZmlyc3QgdmFsdWUgaXMgYW4gYXJyYXlcbiAgICBsZXQgbWVzc2FnZVxuICAgIGxldCBpLCBsZW4sIGtleVxuXG4gICAgaWYgKG1lc3NhZ2VzW2l0ZW0ubnJdKSB7XG4gICAgICAvLyBzYW1lIHNlcXVlbmNlIG51bWJlciBpcyBhbHJlYWR5IHVzZWQsIHNvIG1lcmdlIHZhbHVlcyBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG1lc3NhZ2Ugb2JqZWN0XG4gICAgICBtZXNzYWdlID0gbWVzc2FnZXNbaXRlbS5ucl1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZXNbaXRlbS5ucl0gPSBtZXNzYWdlID0ge1xuICAgICAgICAnIyc6IGl0ZW0ubnJcbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChtZXNzYWdlKVxuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIGxlbiA9IHBhcmFtcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKGkgJSAyID09PSAwKSB7XG4gICAgICAgIGtleSA9IGNvbXBpbGVyKHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbcGFyYW1zW2ldXVxuICAgICAgICB9KS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLzxcXGQrPiQvLCAnJylcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIG1lc3NhZ2Vba2V5XSA9IHRoaXMuX3BhcnNlRmV0Y2hWYWx1ZShrZXksIHBhcmFtc1tpXSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGxpc3Rcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBzaW5nbGUgdmFsdWUgZnJvbSB0aGUgRkVUQ0ggcmVzcG9uc2Ugb2JqZWN0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBLZXkgbmFtZSAodXBwZXJjYXNlKVxuICogQHBhcmFtIHtNaXplZH0gdmFsdWUgVmFsdWUgZm9yIHRoZSBrZXlcbiAqIEByZXR1cm4ge01peGVkfSBQcm9jZXNzZWQgdmFsdWVcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5fcGFyc2VGZXRjaFZhbHVlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgc3dpdGNoIChrZXkpIHtcbiAgICAgIGNhc2UgJ3VpZCc6XG4gICAgICBjYXNlICdyZmM4MjIuc2l6ZSc6XG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUudmFsdWUpIHx8IDBcbiAgICAgIGNhc2UgJ21vZHNlcSc6IC8vIGRvIG5vdCBjYXN0IDY0IGJpdCB1aW50IHRvIGEgbnVtYmVyXG4gICAgICAgIHJldHVybiB2YWx1ZS52YWx1ZSB8fCAnMCdcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLnZhbHVlXG4gIH1cblxuICBzd2l0Y2ggKGtleSkge1xuICAgIGNhc2UgJ2ZsYWdzJzpcbiAgICBjYXNlICd4LWdtLWxhYmVscyc6XG4gICAgICB2YWx1ZSA9IFtdLmNvbmNhdCh2YWx1ZSkubWFwKChmbGFnKSA9PiAoZmxhZy52YWx1ZSB8fCAnJykpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2VudmVsb3BlJzpcbiAgICAgIHZhbHVlID0gdGhpcy5fcGFyc2VFTlZFTE9QRShbXS5jb25jYXQodmFsdWUgfHwgW10pKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdib2R5c3RydWN0dXJlJzpcbiAgICAgIHZhbHVlID0gdGhpcy5fcGFyc2VCT0RZU1RSVUNUVVJFKFtdLmNvbmNhdCh2YWx1ZSB8fCBbXSkpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ21vZHNlcSc6XG4gICAgICB2YWx1ZSA9ICh2YWx1ZS5zaGlmdCgpIHx8IHt9KS52YWx1ZSB8fCAnMCdcbiAgICAgIGJyZWFrXG4gIH1cblxuICByZXR1cm4gdmFsdWVcbn1cblxuLyoqXG4gKiBQYXJzZXMgbWVzc2FnZSBlbnZlbG9wZSBmcm9tIEZFVENIIHJlc3BvbnNlLiBBbGwga2V5cyBpbiB0aGUgcmVzdWx0aW5nXG4gKiBvYmplY3QgYXJlIGxvd2VyY2FzZS4gQWRkcmVzcyBmaWVsZHMgYXJlIGFsbCBhcnJheXMgd2l0aCB7bmFtZTosIGFkZHJlc3M6fVxuICogc3RydWN0dXJlZCB2YWx1ZXMuIFVuaWNvZGUgc3RyaW5ncyBhcmUgYXV0b21hdGljYWxseSBkZWNvZGVkLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlIEVudmVsb3BlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gRW52ZWxvcGUgb2JqZWN0XG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX3BhcnNlRU5WRUxPUEUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgbGV0IGVudmVsb3BlID0ge31cblxuICAvKlxuICAgKiBFTlZFTE9QRSBsaXN0cyBhZGRyZXNzZXMgYXMgW25hbWUtcGFydCwgc291cmNlLXJvdXRlLCB1c2VybmFtZSwgaG9zdG5hbWVdXG4gICAqIHdoZXJlIHNvdXJjZS1yb3V0ZSBpcyBub3QgdXNlZCBhbnltb3JlIGFuZCBjYW4gYmUgaWdub3JlZC5cbiAgICogVG8gZ2V0IGNvbXBhcmFibGUgcmVzdWx0cyB3aXRoIG90aGVyIHBhcnRzIG9mIHRoZSBlbWFpbC5qcyBzdGFja1xuICAgKiBicm93c2VyYm94IGZlZWRzIHRoZSBwYXJzZWQgYWRkcmVzcyB2YWx1ZXMgZnJvbSBFTlZFTE9QRVxuICAgKiB0byBhZGRyZXNzcGFyc2VyIGFuZCB1c2VzIHJlc3VsdGluZyB2YWx1ZXMgaW5zdGVhZCBvZiB0aGVcbiAgICogcHJlLXBhcnNlZCBhZGRyZXNzZXNcbiAgICovXG4gIGxldCBwcm9jZXNzQWRkcmVzc2VzID0gKGxpc3QpID0+IHtcbiAgICByZXR1cm4gW10uY29uY2F0KGxpc3QgfHwgW10pLm1hcCgoYWRkcikgPT4ge1xuICAgICAgbGV0IG5hbWUgPSAocGF0aE9yKCcnLCBbJzAnLCAndmFsdWUnXSkoYWRkcikpLnRyaW0oKVxuICAgICAgbGV0IGFkZHJlc3MgPSAocGF0aE9yKCcnLCBbJzInLCAndmFsdWUnXSkoYWRkcikpICsgJ0AnICsgKHBhdGhPcignJywgWyczJywgJ3ZhbHVlJ10pKGFkZHIpKVxuICAgICAgbGV0IGZvcm1hdHRlZFxuXG4gICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgZm9ybWF0dGVkID0gYWRkcmVzc1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9ybWF0dGVkID0gdGhpcy5fZW5jb2RlQWRkcmVzc05hbWUobmFtZSkgKyAnIDwnICsgYWRkcmVzcyArICc+J1xuICAgICAgfVxuXG4gICAgICBsZXQgcGFyc2VkID0gcGFyc2VBZGRyZXNzKGZvcm1hdHRlZCkuc2hpZnQoKSAvLyB0aGVyZSBzaG91bGQgYnUganVzdCBhIHNpbmdsZSBhZGRyZXNzXG4gICAgICBwYXJzZWQubmFtZSA9IG1pbWVXb3Jkc0RlY29kZShwYXJzZWQubmFtZSlcbiAgICAgIHJldHVybiBwYXJzZWRcbiAgICB9KVxuICB9XG5cbiAgaWYgKHZhbHVlWzBdICYmIHZhbHVlWzBdLnZhbHVlKSB7XG4gICAgZW52ZWxvcGUuZGF0ZSA9IHZhbHVlWzBdLnZhbHVlXG4gIH1cblxuICBpZiAodmFsdWVbMV0gJiYgdmFsdWVbMV0udmFsdWUpIHtcbiAgICBlbnZlbG9wZS5zdWJqZWN0ID0gbWltZVdvcmRzRGVjb2RlKHZhbHVlWzFdICYmIHZhbHVlWzFdLnZhbHVlKVxuICB9XG5cbiAgaWYgKHZhbHVlWzJdICYmIHZhbHVlWzJdLmxlbmd0aCkge1xuICAgIGVudmVsb3BlLmZyb20gPSBwcm9jZXNzQWRkcmVzc2VzKHZhbHVlWzJdKVxuICB9XG5cbiAgaWYgKHZhbHVlWzNdICYmIHZhbHVlWzNdLmxlbmd0aCkge1xuICAgIGVudmVsb3BlLnNlbmRlciA9IHByb2Nlc3NBZGRyZXNzZXModmFsdWVbM10pXG4gIH1cblxuICBpZiAodmFsdWVbNF0gJiYgdmFsdWVbNF0ubGVuZ3RoKSB7XG4gICAgZW52ZWxvcGVbJ3JlcGx5LXRvJ10gPSBwcm9jZXNzQWRkcmVzc2VzKHZhbHVlWzRdKVxuICB9XG5cbiAgaWYgKHZhbHVlWzVdICYmIHZhbHVlWzVdLmxlbmd0aCkge1xuICAgIGVudmVsb3BlLnRvID0gcHJvY2Vzc0FkZHJlc3Nlcyh2YWx1ZVs1XSlcbiAgfVxuXG4gIGlmICh2YWx1ZVs2XSAmJiB2YWx1ZVs2XS5sZW5ndGgpIHtcbiAgICBlbnZlbG9wZS5jYyA9IHByb2Nlc3NBZGRyZXNzZXModmFsdWVbNl0pXG4gIH1cblxuICBpZiAodmFsdWVbN10gJiYgdmFsdWVbN10ubGVuZ3RoKSB7XG4gICAgZW52ZWxvcGUuYmNjID0gcHJvY2Vzc0FkZHJlc3Nlcyh2YWx1ZVs3XSlcbiAgfVxuXG4gIGlmICh2YWx1ZVs4XSAmJiB2YWx1ZVs4XS52YWx1ZSkge1xuICAgIGVudmVsb3BlWydpbi1yZXBseS10byddID0gdmFsdWVbOF0udmFsdWVcbiAgfVxuXG4gIGlmICh2YWx1ZVs5XSAmJiB2YWx1ZVs5XS52YWx1ZSkge1xuICAgIGVudmVsb3BlWydtZXNzYWdlLWlkJ10gPSB2YWx1ZVs5XS52YWx1ZVxuICB9XG5cbiAgcmV0dXJuIGVudmVsb3BlXG59XG5cbi8qKlxuICogUGFyc2VzIG1lc3NhZ2UgYm9keSBzdHJ1Y3R1cmUgZnJvbSBGRVRDSCByZXNwb25zZS5cbiAqXG4gKiBUT0RPOiBpbXBsZW1lbnQgYWN0dWFsIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZSBCT0RZU1RSVUNUVVJFIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gRW52ZWxvcGUgb2JqZWN0XG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX3BhcnNlQk9EWVNUUlVDVFVSRSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBsZXQgcHJvY2Vzc05vZGUgPSAobm9kZSwgcGF0aCA9IFtdKSA9PiB7XG4gICAgbGV0IGN1ck5vZGUgPSB7fVxuICAgIGxldCBpID0gMFxuICAgIGxldCBrZXlcbiAgICBsZXQgcGFydCA9IDBcblxuICAgIGlmIChwYXRoLmxlbmd0aCkge1xuICAgICAgY3VyTm9kZS5wYXJ0ID0gcGF0aC5qb2luKCcuJylcbiAgICB9XG5cbiAgICAvLyBtdWx0aXBhcnRcbiAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlWzBdKSkge1xuICAgICAgY3VyTm9kZS5jaGlsZE5vZGVzID0gW11cbiAgICAgIHdoaWxlIChBcnJheS5pc0FycmF5KG5vZGVbaV0pKSB7XG4gICAgICAgIGN1ck5vZGUuY2hpbGROb2Rlcy5wdXNoKHByb2Nlc3NOb2RlKG5vZGVbaV0sIHBhdGguY29uY2F0KCsrcGFydCkpKVxuICAgICAgICBpKytcbiAgICAgIH1cblxuICAgICAgLy8gbXVsdGlwYXJ0IHR5cGVcbiAgICAgIGN1ck5vZGUudHlwZSA9ICdtdWx0aXBhcnQvJyArICgobm9kZVtpKytdIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpXG5cbiAgICAgIC8vIGV4dGVuc2lvbiBkYXRhIChub3QgYXZhaWxhYmxlIGZvciBCT0RZIHJlcXVlc3RzKVxuXG4gICAgICAvLyBib2R5IHBhcmFtZXRlciBwYXJlbnRoZXNpemVkIGxpc3RcbiAgICAgIGlmIChpIDwgbm9kZS5sZW5ndGggLSAxKSB7XG4gICAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgICAgY3VyTm9kZS5wYXJhbWV0ZXJzID0ge307XG4gICAgICAgICAgW10uY29uY2F0KG5vZGVbaV0gfHwgW10pLmZvckVhY2goKHZhbCwgaikgPT4ge1xuICAgICAgICAgICAgaWYgKGogJSAyKSB7XG4gICAgICAgICAgICAgIGN1ck5vZGUucGFyYW1ldGVyc1trZXldID0gbWltZVdvcmRzRGVjb2RlKHByb3BPcignJywgJ3ZhbHVlJykodmFsKSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGtleSA9IHByb3BPcignJywgJ3ZhbHVlJykodmFsKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBpKytcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29udGVudCB0eXBlXG4gICAgICBjdXJOb2RlLnR5cGUgPSBbXG4gICAgICAgICgobm9kZVtpKytdIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLCAoKG5vZGVbaSsrXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgXS5qb2luKCcvJylcblxuICAgICAgLy8gYm9keSBwYXJhbWV0ZXIgcGFyZW50aGVzaXplZCBsaXN0XG4gICAgICBpZiAobm9kZVtpXSkge1xuICAgICAgICBjdXJOb2RlLnBhcmFtZXRlcnMgPSB7fTtcbiAgICAgICAgW10uY29uY2F0KG5vZGVbaV0gfHwgW10pLmZvckVhY2goKHZhbCwgaikgPT4ge1xuICAgICAgICAgIGlmIChqICUgMikge1xuICAgICAgICAgICAgY3VyTm9kZS5wYXJhbWV0ZXJzW2tleV0gPSBtaW1lV29yZHNEZWNvZGUocHJvcE9yKCcnLCAndmFsdWUnKSh2YWwpKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXkgPSBwcm9wT3IoJycsICd2YWx1ZScpKHZhbCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGkrK1xuXG4gICAgICAvLyBpZFxuICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgY3VyTm9kZS5pZCA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKClcbiAgICAgIH1cbiAgICAgIGkrK1xuXG4gICAgICAvLyBkZXNjcmlwdGlvblxuICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgY3VyTm9kZS5kZXNjcmlwdGlvbiA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKClcbiAgICAgIH1cbiAgICAgIGkrK1xuXG4gICAgICAvLyBlbmNvZGluZ1xuICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgY3VyTm9kZS5lbmNvZGluZyA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgfVxuICAgICAgaSsrXG5cbiAgICAgIC8vIHNpemVcbiAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgIGN1ck5vZGUuc2l6ZSA9IE51bWJlcigobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgMCkgfHwgMFxuICAgICAgfVxuICAgICAgaSsrXG5cbiAgICAgIGlmIChjdXJOb2RlLnR5cGUgPT09ICdtZXNzYWdlL3JmYzgyMicpIHtcbiAgICAgICAgLy8gbWVzc2FnZS9yZmMgYWRkcyBhZGRpdGlvbmFsIGVudmVsb3BlLCBib2R5c3RydWN0dXJlIGFuZCBsaW5lIGNvdW50IHZhbHVlc1xuXG4gICAgICAgIC8vIGVudmVsb3BlXG4gICAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgICAgY3VyTm9kZS5lbnZlbG9wZSA9IHRoaXMuX3BhcnNlRU5WRUxPUEUoW10uY29uY2F0KG5vZGVbaV0gfHwgW10pKVxuICAgICAgICB9XG4gICAgICAgIGkrK1xuXG4gICAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgICAgY3VyTm9kZS5jaGlsZE5vZGVzID0gW1xuICAgICAgICAgICAgLy8gcmZjODIyIGJvZHlwYXJ0cyBzaGFyZSB0aGUgc2FtZSBwYXRoLCBkaWZmZXJlbmNlIGlzIGJldHdlZW4gTUlNRSBhbmQgSEVBREVSXG4gICAgICAgICAgICAvLyBwYXRoLk1JTUUgcmV0dXJucyBtZXNzYWdlL3JmYzgyMiBoZWFkZXJcbiAgICAgICAgICAgIC8vIHBhdGguSEVBREVSIHJldHVybnMgaW5saW5lZCBtZXNzYWdlIGhlYWRlclxuICAgICAgICAgICAgcHJvY2Vzc05vZGUobm9kZVtpXSwgcGF0aClcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgICAgaSsrXG5cbiAgICAgICAgLy8gbGluZSBjb3VudFxuICAgICAgICBpZiAobm9kZVtpXSkge1xuICAgICAgICAgIGN1ck5vZGUubGluZUNvdW50ID0gTnVtYmVyKChub2RlW2ldIHx8IHt9KS52YWx1ZSB8fCAwKSB8fCAwXG4gICAgICAgIH1cbiAgICAgICAgaSsrXG4gICAgICB9IGVsc2UgaWYgKC9edGV4dFxcLy8udGVzdChjdXJOb2RlLnR5cGUpKSB7XG4gICAgICAgIC8vIHRleHQvKiBhZGRzIGFkZGl0aW9uYWwgbGluZSBjb3VudCB2YWx1ZXNcblxuICAgICAgICAvLyBsaW5lIGNvdW50XG4gICAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgICAgY3VyTm9kZS5saW5lQ291bnQgPSBOdW1iZXIoKG5vZGVbaV0gfHwge30pLnZhbHVlIHx8IDApIHx8IDBcbiAgICAgICAgfVxuICAgICAgICBpKytcbiAgICAgIH1cblxuICAgICAgLy8gZXh0ZW5zaW9uIGRhdGEgKG5vdCBhdmFpbGFibGUgZm9yIEJPRFkgcmVxdWVzdHMpXG5cbiAgICAgIC8vIG1kNVxuICAgICAgaWYgKGkgPCBub2RlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgICBjdXJOb2RlLm1kNSA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICB9XG4gICAgICAgIGkrK1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoZSBmb2xsb3dpbmcgYXJlIHNoYXJlZCBleHRlbnNpb24gdmFsdWVzIChmb3IgYm90aCBtdWx0aXBhcnQgYW5kIG5vbi1tdWx0aXBhcnQgcGFydHMpXG4gICAgLy8gbm90IGF2YWlsYWJsZSBmb3IgQk9EWSByZXF1ZXN0c1xuXG4gICAgLy8gYm9keSBkaXNwb3NpdGlvblxuICAgIGlmIChpIDwgbm9kZS5sZW5ndGggLSAxKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlW2ldKSAmJiBub2RlW2ldLmxlbmd0aCkge1xuICAgICAgICBjdXJOb2RlLmRpc3Bvc2l0aW9uID0gKChub2RlW2ldWzBdIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGVbaV1bMV0pKSB7XG4gICAgICAgICAgY3VyTm9kZS5kaXNwb3NpdGlvblBhcmFtZXRlcnMgPSB7fTtcbiAgICAgICAgICBbXS5jb25jYXQobm9kZVtpXVsxXSB8fCBbXSkuZm9yRWFjaCgodmFsLCBqKSA9PiB7XG4gICAgICAgICAgICBpZiAoaiAlIDIpIHtcbiAgICAgICAgICAgICAgY3VyTm9kZS5kaXNwb3NpdGlvblBhcmFtZXRlcnNba2V5XSA9IG1pbWVXb3Jkc0RlY29kZShwcm9wT3IoJycsICd2YWx1ZScpKHZhbCkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBrZXkgPSBwcm9wT3IoJycsICd2YWx1ZScpKHZhbCkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkrK1xuICAgIH1cblxuICAgIC8vIGJvZHkgbGFuZ3VhZ2VcbiAgICBpZiAoaSA8IG5vZGUubGVuZ3RoIC0gMSkge1xuICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgY3VyTm9kZS5sYW5ndWFnZSA9IFtdLmNvbmNhdChub2RlW2ldIHx8IFtdKS5tYXAoKHZhbCkgPT4gcHJvcE9yKCcnLCAndmFsdWUnKSh2YWwpLnRvTG93ZXJDYXNlKCkpXG4gICAgICB9XG4gICAgICBpKytcbiAgICB9XG5cbiAgICAvLyBib2R5IGxvY2F0aW9uXG4gICAgLy8gTkIhIGRlZmluZWQgYXMgYSBcInN0cmluZyBsaXN0XCIgaW4gUkZDMzUwMSBidXQgcmVwbGFjZWQgaW4gZXJyYXRhIGRvY3VtZW50IHdpdGggXCJzdHJpbmdcIlxuICAgIC8vIEVycmF0YTogaHR0cDovL3d3dy5yZmMtZWRpdG9yLm9yZy9lcnJhdGFfc2VhcmNoLnBocD9yZmM9MzUwMVxuICAgIGlmIChpIDwgbm9kZS5sZW5ndGggLSAxKSB7XG4gICAgICBpZiAobm9kZVtpXSkge1xuICAgICAgICBjdXJOb2RlLmxvY2F0aW9uID0gKChub2RlW2ldIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKVxuICAgICAgfVxuICAgICAgaSsrXG4gICAgfVxuXG4gICAgcmV0dXJuIGN1ck5vZGVcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzTm9kZSh2YWx1ZSlcbn1cblxuLyoqXG4gKiBDb21waWxlcyBhIHNlYXJjaCBxdWVyeSBpbnRvIGFuIElNQVAgY29tbWFuZC4gUXVlcmllcyBhcmUgY29tcG9zZWQgYXMgb2JqZWN0c1xuICogd2hlcmUga2V5cyBhcmUgc2VhcmNoIHRlcm1zIGFuZCB2YWx1ZXMgYXJlIHRlcm0gYXJndW1lbnRzLiBPbmx5IHN0cmluZ3MsXG4gKiBudW1iZXJzIGFuZCBEYXRlcyBhcmUgdXNlZC4gSWYgdGhlIHZhbHVlIGlzIGFuIGFycmF5LCB0aGUgbWVtYmVycyBvZiBpdFxuICogYXJlIHByb2Nlc3NlZCBzZXBhcmF0ZWx5ICh1c2UgdGhpcyBmb3IgdGVybXMgdGhhdCByZXF1aXJlIG11bHRpcGxlIHBhcmFtcykuXG4gKiBJZiB0aGUgdmFsdWUgaXMgYSBEYXRlLCBpdCBpcyBjb252ZXJ0ZWQgdG8gdGhlIGZvcm0gb2YgXCIwMS1KYW4tMTk3MFwiLlxuICogU3VicXVlcmllcyAoT1IsIE5PVCkgYXJlIG1hZGUgdXAgb2Ygb2JqZWN0c1xuICpcbiAqICAgIHt1bnNlZW46IHRydWUsIGhlYWRlcjogW1wic3ViamVjdFwiLCBcImhlbGxvIHdvcmxkXCJdfTtcbiAqICAgIFNFQVJDSCBVTlNFRU4gSEVBREVSIFwic3ViamVjdFwiIFwiaGVsbG8gd29ybGRcIlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeSBTZWFyY2ggcXVlcnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uIG9iamVjdFxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5ieVVpZF0gSWYgdHVyZSwgdXNlIFVJRCBTRUFSQ0ggaW5zdGVhZCBvZiBTRUFSQ0hcbiAqIEByZXR1cm4ge09iamVjdH0gSU1BUCBjb21tYW5kIG9iamVjdFxuICovXG5DbGllbnQucHJvdG90eXBlLl9idWlsZFNFQVJDSENvbW1hbmQgPSBmdW5jdGlvbiAocXVlcnksIG9wdGlvbnMpIHtcbiAgbGV0IGNvbW1hbmQgPSB7XG4gICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgU0VBUkNIJyA6ICdTRUFSQ0gnXG4gIH1cblxuICBsZXQgaXNBc2NpaSA9IHRydWVcblxuICBsZXQgYnVpbGRUZXJtID0gKHF1ZXJ5KSA9PiB7XG4gICAgbGV0IGxpc3QgPSBbXVxuXG4gICAgT2JqZWN0LmtleXMocXVlcnkpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgbGV0IHBhcmFtcyA9IFtdXG4gICAgICBsZXQgZm9ybWF0RGF0ZSA9IChkYXRlKSA9PiBkYXRlLnRvVVRDU3RyaW5nKCkucmVwbGFjZSgvXlxcdyssIDA/KFxcZCspIChcXHcrKSAoXFxkKykuKi8sICckMS0kMi0kMycpXG4gICAgICBsZXQgZXNjYXBlUGFyYW0gPSAocGFyYW0pID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgICAgICB2YWx1ZTogcGFyYW1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICgvW1xcdTAwODAtXFx1RkZGRl0vLnRlc3QocGFyYW0pKSB7XG4gICAgICAgICAgICBpc0FzY2lpID0gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdsaXRlcmFsJyxcbiAgICAgICAgICAgICAgLy8gY2FzdCB1bmljb2RlIHN0cmluZyB0byBwc2V1ZG8tYmluYXJ5IGFzIGltYXAtaGFuZGxlciBjb21waWxlcyBzdHJpbmdzIGFzIG9jdGV0c1xuICAgICAgICAgICAgICB2YWx1ZTogZnJvbVR5cGVkQXJyYXkoZW5jb2RlKHBhcmFtKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgdmFsdWU6IHBhcmFtXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwYXJhbSkgPT09ICdbb2JqZWN0IERhdGVdJykge1xuICAgICAgICAgIC8vIFJGQyAzNTAxIGFsbG93cyBmb3IgZGF0ZXMgdG8gYmUgcGxhY2VkIGluXG4gICAgICAgICAgLy8gZG91YmxlLXF1b3RlcyBvciBsZWZ0IHdpdGhvdXQgcXVvdGVzLiAgU29tZVxuICAgICAgICAgIC8vIHNlcnZlcnMgKFlhbmRleCksIGRvIG5vdCBsaWtlIHRoZSBkb3VibGUgcXVvdGVzLFxuICAgICAgICAgIC8vIHNvIHdlIHRyZWF0IHRoZSBkYXRlIGFzIGFuIGF0b20uXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdhdG9tJyxcbiAgICAgICAgICAgIHZhbHVlOiBmb3JtYXREYXRlKHBhcmFtKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHBhcmFtKSkge1xuICAgICAgICAgIHJldHVybiBwYXJhbS5tYXAoZXNjYXBlUGFyYW0pXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHJldHVybiBidWlsZFRlcm0ocGFyYW0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcGFyYW1zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYXRvbScsXG4gICAgICAgIHZhbHVlOiBrZXkudG9VcHBlckNhc2UoKVxuICAgICAgfSk7XG5cbiAgICAgIFtdLmNvbmNhdChxdWVyeVtrZXldIHx8IFtdKS5mb3JFYWNoKChwYXJhbSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGtleS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgY2FzZSAndWlkJzpcbiAgICAgICAgICAgIHBhcmFtID0ge1xuICAgICAgICAgICAgICB0eXBlOiAnc2VxdWVuY2UnLFxuICAgICAgICAgICAgICB2YWx1ZTogcGFyYW1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgLy8gVGhlIEdtYWlsIGV4dGVuc2lvbiB2YWx1ZXMgb2YgWC1HTS1USFJJRCBhbmRcbiAgICAgICAgICAvLyBYLUdNLU1TR0lEIGFyZSBkZWZpbmVkIHRvIGJlIHVuc2lnbmVkIDY0LWJpdCBpbnRlZ2Vyc1xuICAgICAgICAgIC8vIGFuZCB0aGV5IG11c3Qgbm90IGJlIHF1b3RlZCBzdHJpbmdzIG9yIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAvLyB3aWxsIHJlcG9ydCBhIHBhcnNlIGVycm9yLlxuICAgICAgICAgIGNhc2UgJ3gtZ20tdGhyaWQnOlxuICAgICAgICAgIGNhc2UgJ3gtZ20tbXNnaWQnOlxuICAgICAgICAgICAgcGFyYW0gPSB7XG4gICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICAgICAgICB2YWx1ZTogcGFyYW1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHBhcmFtID0gZXNjYXBlUGFyYW0ocGFyYW0pXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmFtKSB7XG4gICAgICAgICAgcGFyYW1zID0gcGFyYW1zLmNvbmNhdChwYXJhbSB8fCBbXSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGxpc3QgPSBsaXN0LmNvbmNhdChwYXJhbXMgfHwgW10pXG4gICAgfSlcblxuICAgIHJldHVybiBsaXN0XG4gIH1cblxuICBjb21tYW5kLmF0dHJpYnV0ZXMgPSBbXS5jb25jYXQoYnVpbGRUZXJtKHF1ZXJ5IHx8IHt9KSB8fCBbXSlcblxuICAvLyBJZiBhbnkgc3RyaW5nIGlucHV0IGlzIHVzaW5nIDhiaXQgYnl0ZXMsIHByZXBlbmQgdGhlIG9wdGlvbmFsIENIQVJTRVQgYXJndW1lbnRcbiAgaWYgKCFpc0FzY2lpKSB7XG4gICAgY29tbWFuZC5hdHRyaWJ1dGVzLnVuc2hpZnQoe1xuICAgICAgdHlwZTogJ2F0b20nLFxuICAgICAgdmFsdWU6ICdVVEYtOCdcbiAgICB9KVxuICAgIGNvbW1hbmQuYXR0cmlidXRlcy51bnNoaWZ0KHtcbiAgICAgIHR5cGU6ICdhdG9tJyxcbiAgICAgIHZhbHVlOiAnQ0hBUlNFVCdcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIGNvbW1hbmRcbn1cblxuLyoqXG4gKiBCaW5hcnkgU2VhcmNoXG4gKlxuICogQHBhcmFtIHtBcnJheX0gaGF5c3RhY2sgT3JkZXJlZCBhcnJheVxuICogQHBhcmFtIHthbnl9IG5lZWRsZSBJdGVtIHRvIHNlYXJjaCBmb3IgaW4gaGF5c3RhY2tcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbXBhcmF0b3IgRnVuY3Rpb24gdGhhdCBkZWZpbmVzIHRoZSBzb3J0IG9yZGVyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEluZGV4IG9mIG5lZWRsZSBpbiBoYXlzdGFjayBvciBpZiBub3QgZm91bmQsXG4gKiAgICAgLUluZGV4LTEgaXMgdGhlIHBvc2l0aW9uIHdoZXJlIG5lZWRsZSBjb3VsZCBiZSBpbnNlcnRlZCB3aGlsZSBzdGlsbFxuICogICAgIGtlZXBpbmcgaGF5c3RhY2sgb3JkZXJlZC5cbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5fYmluU2VhcmNoID0gZnVuY3Rpb24gKGhheXN0YWNrLCBuZWVkbGUsIGNvbXBhcmF0b3IpIHtcbiAgbGV0IG1pZCwgY21wXG4gIGxldCBsb3cgPSAwXG4gIGxldCBoaWdoID0gaGF5c3RhY2subGVuZ3RoIC0gMVxuXG4gIHdoaWxlIChsb3cgPD0gaGlnaCkge1xuICAgIC8vIE5vdGUgdGhhdCBcIihsb3cgKyBoaWdoKSA+Pj4gMVwiIG1heSBvdmVyZmxvdywgYW5kIHJlc3VsdHMgaW5cbiAgICAvLyBhIHR5cGVjYXN0IHRvIGRvdWJsZSAod2hpY2ggZ2l2ZXMgdGhlIHdyb25nIHJlc3VsdHMpLlxuICAgIG1pZCA9IGxvdyArIChoaWdoIC0gbG93ID4+IDEpXG4gICAgY21wID0gK2NvbXBhcmF0b3IoaGF5c3RhY2tbbWlkXSwgbmVlZGxlKVxuXG4gICAgaWYgKGNtcCA8IDAuMCkge1xuICAgICAgLy8gdG9vIGxvd1xuICAgICAgbG93ID0gbWlkICsgMVxuICAgIH0gZWxzZSBpZiAoY21wID4gMC4wKSB7XG4gICAgICAvLyB0b28gaGlnaFxuICAgICAgaGlnaCA9IG1pZCAtIDFcbiAgICB9IGVsc2Uge1xuICAgICAgLy8ga2V5IGZvdW5kXG4gICAgICByZXR1cm4gbWlkXG4gICAgfVxuICB9XG5cbiAgLy8ga2V5IG5vdCBmb3VuZFxuICByZXR1cm4gfmxvd1xufVxuXG4vKipcbiAqIFBhcnNlcyBTRUFSQ0ggcmVzcG9uc2UuIEdhdGhlcnMgYWxsIHVudGFnZ2VkIFNFQVJDSCByZXNwb25zZXMsIGZldGNoZWQgc2VxLi91aWQgbnVtYmVyc1xuICogYW5kIGNvbXBpbGVzIHRoZXNlIGludG8gYSBzb3J0ZWQgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IE1lc3NhZ2Ugb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5fSBTb3J0ZWQgU2VxLi9VSUQgbnVtYmVyIGxpc3RcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5fcGFyc2VTRUFSQ0ggPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgbGV0IGNtcCA9IChhLCBiKSA9PiAoYSAtIGIpXG4gIGxldCBsaXN0ID0gW11cblxuICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5wYXlsb2FkIHx8ICFyZXNwb25zZS5wYXlsb2FkLlNFQVJDSCB8fCAhcmVzcG9uc2UucGF5bG9hZC5TRUFSQ0gubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFtdXG4gIH1cblxuICBbXS5jb25jYXQocmVzcG9uc2UucGF5bG9hZC5TRUFSQ0ggfHwgW10pLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgIFtdLmNvbmNhdChyZXN1bHQuYXR0cmlidXRlcyB8fCBbXSkuZm9yRWFjaCgobnIpID0+IHtcbiAgICAgIG5yID0gTnVtYmVyKHByb3BPcihuciB8fCAwLCAndmFsdWUnKShucikpIHx8IDBcbiAgICAgIGxldCBpZHggPSB0aGlzLl9iaW5TZWFyY2gobGlzdCwgbnIsIGNtcClcbiAgICAgIGlmIChpZHggPCAwKSB7XG4gICAgICAgIGxpc3Quc3BsaWNlKC1pZHggLSAxLCAwLCBucilcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiBsaXN0XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBJTUFQIFNUT1JFIGNvbW1hbmQgZnJvbSB0aGUgc2VsZWN0ZWQgYXJndW1lbnRzXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX2J1aWxkU1RPUkVDb21tYW5kID0gZnVuY3Rpb24gKHNlcXVlbmNlLCBhY3Rpb24sIGZsYWdzLCBvcHRpb25zKSB7XG4gIGxldCBjb21tYW5kID0ge1xuICAgIGNvbW1hbmQ6IG9wdGlvbnMuYnlVaWQgPyAnVUlEIFNUT1JFJyA6ICdTVE9SRScsXG4gICAgYXR0cmlidXRlczogW3tcbiAgICAgIHR5cGU6ICdzZXF1ZW5jZScsXG4gICAgICB2YWx1ZTogc2VxdWVuY2VcbiAgICB9XVxuICB9XG5cbiAgY29tbWFuZC5hdHRyaWJ1dGVzLnB1c2goe1xuICAgIHR5cGU6ICdhdG9tJyxcbiAgICB2YWx1ZTogKGFjdGlvbiB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpICsgKG9wdGlvbnMuc2lsZW50ID8gJy5TSUxFTlQnIDogJycpXG4gIH0pXG5cbiAgY29tbWFuZC5hdHRyaWJ1dGVzLnB1c2goZmxhZ3MubWFwKChmbGFnKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdhdG9tJyxcbiAgICAgIHZhbHVlOiBmbGFnXG4gICAgfVxuICB9KSlcblxuICByZXR1cm4gY29tbWFuZFxufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIElNQVAgc3RhdGUgdmFsdWUgZm9yIHRoZSBjdXJyZW50IGNvbm5lY3Rpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbmV3U3RhdGUgVGhlIHN0YXRlIHlvdSB3YW50IHRvIGNoYW5nZSB0b1xuICovXG5DbGllbnQucHJvdG90eXBlLl9jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uIChuZXdTdGF0ZSkge1xuICBpZiAobmV3U3RhdGUgPT09IHRoaXMuX3N0YXRlKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW50ZXJpbmcgc3RhdGU6ICcgKyBuZXdTdGF0ZSlcblxuICAvLyBpZiBhIG1haWxib3ggd2FzIG9wZW5lZCwgZW1pdCBvbmNsb3NlbWFpbGJveCBhbmQgY2xlYXIgc2VsZWN0ZWRNYWlsYm94IHZhbHVlXG4gIGlmICh0aGlzLl9zdGF0ZSA9PT0gdGhpcy5TVEFURV9TRUxFQ1RFRCAmJiB0aGlzLl9zZWxlY3RlZE1haWxib3gpIHtcbiAgICB0aGlzLm9uY2xvc2VtYWlsYm94ICYmIHRoaXMub25jbG9zZW1haWxib3godGhpcy5fc2VsZWN0ZWRNYWlsYm94KVxuICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IGZhbHNlXG4gIH1cblxuICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlXG59XG5cbi8qKlxuICogRW5zdXJlcyBhIHBhdGggZXhpc3RzIGluIHRoZSBNYWlsYm94IHRyZWVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdHJlZSBNYWlsYm94IHRyZWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0ge1N0cmluZ30gZGVsaW1pdGVyXG4gKiBAcmV0dXJuIHtPYmplY3R9IGJyYW5jaCBmb3IgdXNlZCBwYXRoXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuX2Vuc3VyZVBhdGggPSBmdW5jdGlvbiAodHJlZSwgcGF0aCwgZGVsaW1pdGVyKSB7XG4gIGxldCBuYW1lcyA9IHBhdGguc3BsaXQoZGVsaW1pdGVyKVxuICBsZXQgYnJhbmNoID0gdHJlZVxuICBsZXQgaSwgaiwgZm91bmRcblxuICBmb3IgKGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3VuZCA9IGZhbHNlXG4gICAgZm9yIChqID0gMDsgaiA8IGJyYW5jaC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgaWYgKHRoaXMuX2NvbXBhcmVNYWlsYm94TmFtZXMoYnJhbmNoLmNoaWxkcmVuW2pdLm5hbWUsIGltYXBEZWNvZGUobmFtZXNbaV0pKSkge1xuICAgICAgICBicmFuY2ggPSBicmFuY2guY2hpbGRyZW5bal1cbiAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghZm91bmQpIHtcbiAgICAgIGJyYW5jaC5jaGlsZHJlbi5wdXNoKHtcbiAgICAgICAgbmFtZTogaW1hcERlY29kZShuYW1lc1tpXSksXG4gICAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLFxuICAgICAgICBwYXRoOiBuYW1lcy5zbGljZSgwLCBpICsgMSkuam9pbihkZWxpbWl0ZXIpLFxuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH0pXG4gICAgICBicmFuY2ggPSBicmFuY2guY2hpbGRyZW5bYnJhbmNoLmNoaWxkcmVuLmxlbmd0aCAtIDFdXG4gICAgfVxuICB9XG4gIHJldHVybiBicmFuY2hcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0d28gbWFpbGJveCBuYW1lcy4gQ2FzZSBpbnNlbnNpdGl2ZSBpbiBjYXNlIG9mIElOQk9YLCBvdGhlcndpc2UgY2FzZSBzZW5zaXRpdmVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYSBNYWlsYm94IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBiIE1haWxib3ggbmFtZVxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIGZvbGRlciBuYW1lcyBtYXRjaFxuICovXG5DbGllbnQucHJvdG90eXBlLl9jb21wYXJlTWFpbGJveE5hbWVzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgcmV0dXJuIChhLnRvVXBwZXJDYXNlKCkgPT09ICdJTkJPWCcgPyAnSU5CT1gnIDogYSkgPT09IChiLnRvVXBwZXJDYXNlKCkgPT09ICdJTkJPWCcgPyAnSU5CT1gnIDogYilcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBtYWlsYm94IGlzIGZvciBzcGVjaWFsIHVzZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYWlsYm94XG4gKiBAcmV0dXJuIHtTdHJpbmd9IFNwZWNpYWwgdXNlIGZsYWcgKGlmIGRldGVjdGVkKVxuICovXG5DbGllbnQucHJvdG90eXBlLl9jaGVja1NwZWNpYWxVc2UgPSBmdW5jdGlvbiAobWFpbGJveCkge1xuICBsZXQgaSwgdHlwZVxuXG4gIGlmIChtYWlsYm94LmZsYWdzKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IFNQRUNJQUxfVVNFX0ZMQUdTLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0eXBlID0gU1BFQ0lBTF9VU0VfRkxBR1NbaV1cbiAgICAgIGlmICgobWFpbGJveC5mbGFncyB8fCBbXSkuaW5kZXhPZih0eXBlKSA+PSAwKSB7XG4gICAgICAgIG1haWxib3guc3BlY2lhbFVzZSA9IHR5cGVcbiAgICAgICAgbWFpbGJveC5zcGVjaWFsVXNlRmxhZyA9IHR5cGVcbiAgICAgICAgcmV0dXJuIHR5cGVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy5fY2hlY2tTcGVjaWFsVXNlQnlOYW1lKG1haWxib3gpXG59XG5cbkNsaWVudC5wcm90b3R5cGUuX2NoZWNrU3BlY2lhbFVzZUJ5TmFtZSA9IGZ1bmN0aW9uIChtYWlsYm94KSB7XG4gIGxldCBuYW1lID0gcHJvcE9yKCcnLCAnbmFtZScpKG1haWxib3gpLnRvTG93ZXJDYXNlKCkudHJpbSgpXG4gIGxldCBpXG4gIGxldCB0eXBlXG5cbiAgZm9yIChpID0gMDsgaSA8IFNQRUNJQUxfVVNFX0JPWF9GTEFHUy5sZW5ndGg7IGkrKykge1xuICAgIHR5cGUgPSBTUEVDSUFMX1VTRV9CT1hfRkxBR1NbaV1cbiAgICBpZiAoU1BFQ0lBTF9VU0VfQk9YRVNbdHlwZV0uaW5kZXhPZihuYW1lKSA+PSAwKSB7XG4gICAgICBtYWlsYm94LnNwZWNpYWxVc2UgPSB0eXBlXG4gICAgICByZXR1cm4gdHlwZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIEJ1aWxkcyBhIGxvZ2luIHRva2VuIGZvciBYT0FVVEgyIGF1dGhlbnRpY2F0aW9uIGNvbW1hbmRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlciBFLW1haWwgYWRkcmVzcyBvZiB0aGUgdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHRva2VuIFZhbGlkIGFjY2VzcyB0b2tlbiBmb3IgdGhlIHVzZXJcbiAqIEByZXR1cm4ge1N0cmluZ30gQmFzZTY0IGZvcm1hdHRlZCBsb2dpbiB0b2tlblxuICovXG5DbGllbnQucHJvdG90eXBlLl9idWlsZFhPQXV0aDJUb2tlbiA9IGZ1bmN0aW9uICh1c2VyLCB0b2tlbikge1xuICBsZXQgYXV0aERhdGEgPSBbXG4gICAgJ3VzZXI9JyArICh1c2VyIHx8ICcnKSxcbiAgICAnYXV0aD1CZWFyZXIgJyArIHRva2VuLFxuICAgICcnLFxuICAgICcnXG4gIF1cbiAgcmV0dXJuIGVuY29kZUJhc2U2NChhdXRoRGF0YS5qb2luKCdcXHgwMScpKVxufVxuXG4vKipcbiAqIElmIG5lZWRlZCwgZW5jbG9zZXMgd2l0aCBxdW90ZXMgb3IgbWltZSBlbmNvZGVzIHRoZSBuYW1lIHBhcnQgb2YgYW4gZS1tYWlsIGFkZHJlc3NcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBOYW1lIHBhcnQgb2YgYW4gYWRkcmVzc1xuICogQHJldHVybnMge1N0cmluZ30gTWltZSB3b3JkIGVuY29kZWQgb3IgcXVvdGVkIHN0cmluZ1xuICovXG5DbGllbnQucHJvdG90eXBlLl9lbmNvZGVBZGRyZXNzTmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIGlmICghL15bXFx3ICddKiQvLnRlc3QobmFtZSkpIHtcbiAgICBpZiAoL15bXFx4MjAtXFx4N2VdKiQvLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWltZVdvcmRFbmNvZGUobmFtZSwgJ1EnLCA1MilcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5hbWVcbn1cblxuQ2xpZW50LnByb3RvdHlwZS5MT0dfTEVWRUxfTk9ORSA9IDEwMDBcbkNsaWVudC5wcm90b3R5cGUuTE9HX0xFVkVMX0VSUk9SID0gNDBcbkNsaWVudC5wcm90b3R5cGUuTE9HX0xFVkVMX1dBUk4gPSAzMFxuQ2xpZW50LnByb3RvdHlwZS5MT0dfTEVWRUxfSU5GTyA9IDIwXG5DbGllbnQucHJvdG90eXBlLkxPR19MRVZFTF9ERUJVRyA9IDEwXG5DbGllbnQucHJvdG90eXBlLkxPR19MRVZFTF9BTEwgPSAwXG5cbkNsaWVudC5wcm90b3R5cGUuY3JlYXRlTG9nZ2VyID0gZnVuY3Rpb24gKCkge1xuICBsZXQgY3JlYXRlTG9nZ2VyID0gKHRhZykgPT4ge1xuICAgIGxldCBsb2cgPSAobGV2ZWwsIG1lc3NhZ2VzKSA9PiB7XG4gICAgICBtZXNzYWdlcyA9IG1lc3NhZ2VzLm1hcChtc2cgPT4gdHlwZW9mIG1zZyA9PT0gJ2Z1bmN0aW9uJyA/IG1zZygpIDogbXNnKVxuICAgICAgbGV0IGxvZ01lc3NhZ2UgPSAnWycgKyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgKyAnXVsnICsgdGFnICsgJ11bJyArXG4gICAgICAgIHRoaXMub3B0aW9ucy5hdXRoLnVzZXIgKyAnXVsnICsgdGhpcy5jbGllbnQuaG9zdCArICddICcgKyBtZXNzYWdlcy5qb2luKCcgJylcbiAgICAgIGlmIChsZXZlbCA9PT0gdGhpcy5MT0dfTEVWRUxfREVCVUcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tERUJVR10nICsgbG9nTWVzc2FnZSlcbiAgICAgIH0gZWxzZSBpZiAobGV2ZWwgPT09IHRoaXMuTE9HX0xFVkVMX0lORk8pIHtcbiAgICAgICAgY29uc29sZS5pbmZvKCdbSU5GT10nICsgbG9nTWVzc2FnZSlcbiAgICAgIH0gZWxzZSBpZiAobGV2ZWwgPT09IHRoaXMuTE9HX0xFVkVMX1dBUk4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbV0FSTl0nICsgbG9nTWVzc2FnZSlcbiAgICAgIH0gZWxzZSBpZiAobGV2ZWwgPT09IHRoaXMuTE9HX0xFVkVMX0VSUk9SKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tFUlJPUl0nICsgbG9nTWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgLy8gdGhpcyBjb3VsZCBiZWNvbWUgd2F5IG5pY2VyIHdoZW4gbm9kZSBzdXBwb3J0cyB0aGUgcmVzdCBvcGVyYXRvci4uLlxuICAgICAgZGVidWc6IGZ1bmN0aW9uIChtc2dzKSB7IGxvZyh0aGlzLkxPR19MRVZFTF9ERUJVRywgbXNncykgfS5iaW5kKHRoaXMpLFxuICAgICAgaW5mbzogZnVuY3Rpb24gKG1zZ3MpIHsgbG9nKHRoaXMuTE9HX0xFVkVMX0lORk8sIG1zZ3MpIH0uYmluZCh0aGlzKSxcbiAgICAgIHdhcm46IGZ1bmN0aW9uIChtc2dzKSB7IGxvZyh0aGlzLkxPR19MRVZFTF9XQVJOLCBtc2dzKSB9LmJpbmQodGhpcyksXG4gICAgICBlcnJvcjogZnVuY3Rpb24gKG1zZ3MpIHsgbG9nKHRoaXMuTE9HX0xFVkVMX0VSUk9SLCBtc2dzKSB9LmJpbmQodGhpcylcbiAgICB9XG4gIH1cblxuICBsZXQgbG9nZ2VyID0gdGhpcy5vcHRpb25zLmxvZ2dlciB8fCBjcmVhdGVMb2dnZXIodGhpcy5vcHRpb25zLnNlc3Npb25JZCB8fCAxKVxuICB0aGlzLmxvZ2dlciA9IHRoaXMuY2xpZW50LmxvZ2dlciA9IHtcbiAgICAvLyB0aGlzIGNvdWxkIGJlY29tZSB3YXkgbmljZXIgd2hlbiBub2RlIHN1cHBvcnRzIHRoZSByZXN0IG9wZXJhdG9yLi4uXG4gICAgZGVidWc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLkxPR19MRVZFTF9ERUJVRyA+PSB0aGlzLmxvZ0xldmVsKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSxcbiAgICBpbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5MT0dfTEVWRUxfSU5GTyA+PSB0aGlzLmxvZ0xldmVsKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpLFxuICAgIHdhcm46IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLkxPR19MRVZFTF9XQVJOID49IHRoaXMubG9nTGV2ZWwpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcyksXG4gICAgZXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLkxPR19MRVZFTF9FUlJPUiA+PSB0aGlzLmxvZ0xldmVsKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKVxuICB9XG59XG4iXX0=