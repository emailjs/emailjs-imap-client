'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CLIENT_ID = exports.STATE_LOGOUT = exports.STATE_SELECTED = exports.STATE_AUTHENTICATED = exports.STATE_NOT_AUTHENTICATED = exports.STATE_CONNECTING = exports.TIMEOUT_IDLE = exports.TIMEOUT_NOOP = exports.TIMEOUT_CONNECTION = undefined;

var _ramda = require('ramda');

var _emailjsUtf = require('emailjs-utf7');

var _commandParser = require('./command-parser');

var _commandBuilder = require('./command-builder');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _imap = require('./imap');

var _imap2 = _interopRequireDefault(_imap);

var _common = require('./common');

var _specialUse = require('./special-use');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const TIMEOUT_CONNECTION = exports.TIMEOUT_CONNECTION = 90 * 1000; // Milliseconds to wait for the IMAP greeting from the server
const TIMEOUT_NOOP = exports.TIMEOUT_NOOP = 60 * 1000; // Milliseconds between NOOP commands while idling
const TIMEOUT_IDLE = exports.TIMEOUT_IDLE = 60 * 1000; // Milliseconds until IDLE command is cancelled

const STATE_CONNECTING = exports.STATE_CONNECTING = 1;
const STATE_NOT_AUTHENTICATED = exports.STATE_NOT_AUTHENTICATED = 2;
const STATE_AUTHENTICATED = exports.STATE_AUTHENTICATED = 3;
const STATE_SELECTED = exports.STATE_SELECTED = 4;
const STATE_LOGOUT = exports.STATE_LOGOUT = 5;

const DEFAULT_CLIENT_ID = exports.DEFAULT_CLIENT_ID = {
  name: 'emailjs-imap-client'

  /**
   * emailjs IMAP client
   *
   * @constructor
   *
   * @param {String} [host='localhost'] Hostname to conenct to
   * @param {Number} [port=143] Port number to connect to
   * @param {Object} [options] Optional options object
   */
};class Client {
  constructor(host, port, options = {}) {
    this.timeoutConnection = TIMEOUT_CONNECTION;
    this.timeoutNoop = TIMEOUT_NOOP;
    this.timeoutIdle = TIMEOUT_IDLE;

    this.serverId = false; // RFC 2971 Server ID as key value pairs

    // Event placeholders
    this.oncert = null;
    this.onupdate = null;
    this.onselectmailbox = null;
    this.onclosemailbox = null;

    this._host = host;
    this._clientId = (0, _ramda.propOr)(DEFAULT_CLIENT_ID, 'id', options);
    this._state = false; // Current state
    this._authenticated = false; // Is the connection authenticated
    this._capability = []; // List of extensions the server supports
    this._selectedMailbox = false; // Selected mailbox
    this._enteredIdle = false;
    this._idleTimeout = false;
    this._enableCompression = !!options.enableCompression;
    this._auth = options.auth;
    this._requireTLS = !!options.requireTLS;
    this._ignoreTLS = !!options.ignoreTLS;

    this.client = new _imap2.default(host, port, options); // IMAP client object

    // Event Handlers
    this.client.onerror = this._onError.bind(this);
    this.client.oncert = cert => this.oncert && this.oncert(cert); // allows certificate handling for platforms w/o native tls support
    this.client.onidle = () => this._onIdle(); // start idling

    // Default handlers for untagged responses
    this.client.setHandler('capability', response => this._untaggedCapabilityHandler(response)); // capability updates
    this.client.setHandler('ok', response => this._untaggedOkHandler(response)); // notifications
    this.client.setHandler('exists', response => this._untaggedExistsHandler(response)); // message count has changed
    this.client.setHandler('expunge', response => this._untaggedExpungeHandler(response)); // message has been deleted
    this.client.setHandler('fetch', response => this._untaggedFetchHandler(response)); // message has been updated (eg. flag change)

    // Activate logging
    this.createLogger();
    this.logLevel = (0, _ramda.propOr)(_common.LOG_LEVEL_ALL, 'logLevel', options);
  }

  /**
   * Called if the lower-level ImapClient has encountered an unrecoverable
   * error during operation. Cleans up and propagates the error upwards.
   */
  _onError(err) {
    // make sure no idle timeout is pending anymore
    clearTimeout(this._idleTimeout);

    // propagate the error upwards
    this.onerror && this.onerror(err);
  }

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
  connect() {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        yield _this._openConnection();
        _this._changeState(STATE_NOT_AUTHENTICATED);
        yield _this.updateCapability();
        yield _this.upgradeConnection();
        try {
          yield _this.updateId(_this._clientId);
        } catch (err) {
          _this.logger.warn('Failed to update server id!', err.message);
        }

        yield _this.login(_this._auth);
        yield _this.compressConnection();
        _this.logger.debug('Connection established, ready to roll!');
        _this.client.onerror = _this._onError.bind(_this);
      } catch (err) {
        _this.logger.error('Could not connect to server', err);
        _this.close(err); // we don't really care whether this works or not
        throw err;
      }
    })();
  }

  _openConnection() {
    return new Promise((resolve, reject) => {
      let connectionTimeout = setTimeout(() => reject(new Error('Timeout connecting to server')), this.timeoutConnection);
      this.logger.debug('Connecting to', this.client.host, ':', this.client.port);
      this._changeState(STATE_CONNECTING);
      this.client.connect().then(() => {
        this.logger.debug('Socket opened, waiting for greeting from the server...');

        this.client.onready = () => {
          clearTimeout(connectionTimeout);
          resolve();
        };

        this.client.onerror = err => {
          clearTimeout(connectionTimeout);
          reject(err);
        };
      }).catch(reject);
    });
  }

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
  logout() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2._changeState(STATE_LOGOUT);
      _this2.logger.debug('Logging out...');
      yield _this2.client.logout();
      clearTimeout(_this2._idleTimeout);
    })();
  }

  /**
   * Force-closes the current connection by closing the TCP socket.
   *
   * @returns {Promise} Resolves when socket is closed
   */
  close(err) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3._changeState(STATE_LOGOUT);
      clearTimeout(_this3._idleTimeout);
      _this3.logger.debug('Closing connection...');
      yield _this3.client.close(err);
      clearTimeout(_this3._idleTimeout);
    })();
  }

  /**
   * Runs ID command, parses ID response, sets this.serverId
   *
   * ID details:
   *   http://tools.ietf.org/html/rfc2971
   *
   * @param {Object} id ID as JSON object. See http://tools.ietf.org/html/rfc2971#section-3.3 for possible values
   * @returns {Promise} Resolves when response has been parsed
   */
  updateId(id) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      if (_this4._capability.indexOf('ID') < 0) return;

      _this4.logger.debug('Updating id...');

      const command = 'ID';
      const attributes = id ? [(0, _ramda.flatten)(Object.entries(id))] : [null];
      const response = yield _this4.exec({ command, attributes }, 'ID');
      const list = (0, _ramda.flatten)((0, _ramda.pathOr)([], ['payload', 'ID', '0', 'attributes', '0'], response).map(Object.values));
      const keys = list.filter(function (_, i) {
        return i % 2 === 0;
      });
      const values = list.filter(function (_, i) {
        return i % 2 === 1;
      });
      _this4.serverId = (0, _ramda.fromPairs)((0, _ramda.zip)(keys, values));
      _this4.logger.debug('Server id updated!', _this4.serverId);
    })();
  }

  _shouldSelectMailbox(path, ctx) {
    if (!ctx) {
      return true;
    }

    const previousSelect = this.client.getPreviouslyQueued(['SELECT', 'EXAMINE'], ctx);
    if (previousSelect && previousSelect.request.attributes) {
      const pathAttribute = previousSelect.request.attributes.find(attribute => attribute.type === 'STRING');
      if (pathAttribute) {
        return pathAttribute.value !== path;
      }
    }

    return this._selectedMailbox !== path;
  }

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
  selectMailbox(path, options = {}) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      let query = {
        command: options.readOnly ? 'EXAMINE' : 'SELECT',
        attributes: [{ type: 'STRING', value: path }]
      };

      if (options.condstore && _this5._capability.indexOf('CONDSTORE') >= 0) {
        query.attributes.push([{ type: 'ATOM', value: 'CONDSTORE' }]);
      }

      _this5.logger.debug('Opening', path, '...');
      const response = yield _this5.exec(query, ['EXISTS', 'FLAGS', 'OK'], { ctx: options.ctx });
      let mailboxInfo = (0, _commandParser.parseSELECT)(response);

      _this5._changeState(STATE_SELECTED);

      if (_this5._selectedMailbox !== path && _this5.onclosemailbox) {
        yield _this5.onclosemailbox(_this5._selectedMailbox);
      }
      _this5._selectedMailbox = path;
      if (_this5.onselectmailbox) {
        yield _this5.onselectmailbox(path, mailboxInfo);
      }

      return mailboxInfo;
    })();
  }

  /**
   * Runs NAMESPACE command
   *
   * NAMESPACE details:
   *   https://tools.ietf.org/html/rfc2342
   *
   * @returns {Promise} Promise with namespace object
   */
  listNamespaces() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      if (_this6._capability.indexOf('NAMESPACE') < 0) return false;

      _this6.logger.debug('Listing namespaces...');
      const response = yield _this6.exec('NAMESPACE', 'NAMESPACE');
      return (0, _commandParser.parseNAMESPACE)(response);
    })();
  }

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
  listMailboxes() {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const tree = { root: true, children: [] };

      _this7.logger.debug('Listing mailboxes...');
      const listResponse = yield _this7.exec({ command: 'LIST', attributes: ['', '*'] }, 'LIST');
      const list = (0, _ramda.pathOr)([], ['payload', 'LIST'], listResponse);
      list.forEach(function (item) {
        const attr = (0, _ramda.propOr)([], 'attributes', item);
        if (!attr.length < 3) return;

        const path = (0, _ramda.pathOr)('', ['2', 'value'], attr);
        const delim = (0, _ramda.pathOr)('/', ['1', 'value'], attr);
        const branch = _this7._ensurePath(tree, path, delim);
        branch.flags = (0, _ramda.propOr)([], '0', attr).map(function ({ value }) {
          return value || '';
        });
        branch.listed = true;
        (0, _specialUse.checkSpecialUse)(branch);
      });

      const lsubResponse = yield _this7.exec({ command: 'LSUB', attributes: ['', '*'] }, 'LSUB');
      const lsub = (0, _ramda.pathOr)([], ['payload', 'LSUB'], lsubResponse);
      lsub.forEach(function (item) {
        const attr = (0, _ramda.propOr)([], 'attributes', item);
        if (!attr.length < 3) return;

        const path = (0, _ramda.pathOr)('', ['2', 'value'], attr);
        const delim = (0, _ramda.pathOr)('/', ['1', 'value'], attr);
        const branch = _this7._ensurePath(tree, path, delim);
        (0, _ramda.propOr)([], '0', attr).map(function (flag = '') {
          branch.flags = (0, _ramda.union)(branch.flags, [flag]);
        });
        branch.subscribed = true;
      });

      return tree;
    })();
  }

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
  createMailbox(path) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      _this8.logger.debug('Creating mailbox', path, '...');
      try {
        yield _this8.exec({ command: 'CREATE', attributes: [(0, _emailjsUtf.imapEncode)(path)] });
      } catch (err) {
        if (err && err.code === 'ALREADYEXISTS') {
          return;
        }
        throw err;
      }
    })();
  }

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
  listMessages(path, sequence, items = [{ fast: true }], options = {}) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      _this9.logger.debug('Fetching messages', sequence, 'from', path, '...');
      const command = (0, _commandBuilder.buildFETCHCommand)(sequence, items, options);
      const response = yield _this9.exec(command, 'FETCH', {
        precheck: function (ctx) {
          return _this9._shouldSelectMailbox(path, ctx) ? _this9.selectMailbox(path, { ctx }) : Promise.resolve();
        }
      });
      return (0, _commandParser.parseFETCH)(response);
    })();
  }

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
  search(path, query, options = {}) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      _this10.logger.debug('Searching in', path, '...');
      const command = (0, _commandBuilder.buildSEARCHCommand)(query, options);
      const response = yield _this10.exec(command, 'SEARCH', {
        precheck: function (ctx) {
          return _this10._shouldSelectMailbox(path, ctx) ? _this10.selectMailbox(path, { ctx }) : Promise.resolve();
        }
      });
      return (0, _commandParser.parseSEARCH)(response);
    })();
  }

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
  setFlags(path, sequence, flags, options) {
    let key = '';
    let list = [];

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
  }

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
  store(path, sequence, action, flags, options = {}) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      const command = (0, _commandBuilder.buildSTORECommand)(sequence, action, flags, options);
      const response = yield _this11.exec(command, 'FETCH', {
        precheck: function (ctx) {
          return _this11._shouldSelectMailbox(path, ctx) ? _this11.selectMailbox(path, { ctx }) : Promise.resolve();
        }
      });
      return (0, _commandParser.parseFETCH)(response);
    })();
  }

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
  upload(destination, message, options = {}) {
    let flags = (0, _ramda.propOr)(['\\Seen'], 'flags', options).map(value => ({ type: 'atom', value }));
    let command = {
      command: 'APPEND',
      attributes: [{ type: 'atom', value: destination }, flags, { type: 'literal', value: message }]
    };

    this.logger.debug('Uploading message to', destination, '...');
    return this.exec(command);
  }

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
  deleteMessages(path, sequence, options = {}) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      // add \Deleted flag to the messages and run EXPUNGE or UID EXPUNGE
      _this12.logger.debug('Deleting messages', sequence, 'in', path, '...');
      const useUidPlus = options.byUid && _this12._capability.indexOf('UIDPLUS') >= 0;
      const uidExpungeCommand = { command: 'UID EXPUNGE', attributes: [{ type: 'sequence', value: sequence }] };
      yield _this12.setFlags(path, sequence, { add: '\\Deleted' }, options);
      const cmd = useUidPlus ? uidExpungeCommand : 'EXPUNGE';
      return _this12.exec(cmd, null, {
        precheck: function (ctx) {
          return _this12._shouldSelectMailbox(path, ctx) ? _this12.selectMailbox(path, { ctx }) : Promise.resolve();
        }
      });
    })();
  }

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
  copyMessages(path, sequence, destination, options = {}) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      _this13.logger.debug('Copying messages', sequence, 'from', path, 'to', destination, '...');
      const { humanReadable } = yield _this13.exec({
        command: options.byUid ? 'UID COPY' : 'COPY',
        attributes: [{ type: 'sequence', value: sequence }, { type: 'atom', value: destination }]
      }, null, {
        precheck: function (ctx) {
          return _this13._shouldSelectMailbox(path, ctx) ? _this13.selectMailbox(path, { ctx }) : Promise.resolve();
        }
      });
      return humanReadable || 'COPY completed';
    })();
  }

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
  moveMessages(path, sequence, destination, options = {}) {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      _this14.logger.debug('Moving messages', sequence, 'from', path, 'to', destination, '...');

      if (_this14._capability.indexOf('MOVE') === -1) {
        // Fallback to COPY + EXPUNGE
        yield _this14.copyMessages(path, sequence, destination, options);
        return _this14.deleteMessages(path, sequence, options);
      }

      // If possible, use MOVE
      return _this14.exec({
        command: options.byUid ? 'UID MOVE' : 'MOVE',
        attributes: [{ type: 'sequence', value: sequence }, { type: 'atom', value: destination }]
      }, ['OK'], {
        precheck: function (ctx) {
          return _this14._shouldSelectMailbox(path, ctx) ? _this14.selectMailbox(path, { ctx }) : Promise.resolve();
        }
      });
    })();
  }

  /**
   * Runs COMPRESS command
   *
   * COMPRESS details:
   *   https://tools.ietf.org/html/rfc4978
   */
  compressConnection() {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      if (!_this15._enableCompression || _this15._capability.indexOf('COMPRESS=DEFLATE') < 0 || _this15.client.compressed) {
        return false;
      }

      _this15.logger.debug('Enabling compression...');
      yield _this15.exec({
        command: 'COMPRESS',
        attributes: [{
          type: 'ATOM',
          value: 'DEFLATE'
        }]
      });
      _this15.client.enableCompression();
      _this15.logger.debug('Compression enabled, all data sent and received is deflated!');
    })();
  }

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
  login(auth) {
    var _this16 = this;

    return _asyncToGenerator(function* () {
      let command;
      let options = {};

      if (!auth) {
        throw new Error('Authentication information not provided');
      }

      if (_this16._capability.indexOf('AUTH=XOAUTH2') >= 0 && auth && auth.xoauth2) {
        command = {
          command: 'AUTHENTICATE',
          attributes: [{ type: 'ATOM', value: 'XOAUTH2' }, { type: 'ATOM', value: (0, _commandBuilder.buildXOAuth2Token)(auth.user, auth.xoauth2), sensitive: true }]
        };

        options.errorResponseExpectsEmptyLine = true; // + tagged error response expects an empty line in return
      } else {
        command = {
          command: 'login',
          attributes: [{ type: 'STRING', value: auth.user || '' }, { type: 'STRING', value: auth.pass || '', sensitive: true }]
        };
      }

      _this16.logger.debug('Logging in...');
      const response = _this16.exec(command, 'capability', options);
      /*
       * update post-auth capabilites
       * capability list shouldn't contain auth related stuff anymore
       * but some new extensions might have popped up that do not
       * make much sense in the non-auth state
       */
      if (response.capability && response.capability.length) {
        // capabilites were listed with the OK [CAPABILITY ...] response
        _this16._capability = response.capability;
      } else if (response.payload && response.payload.CAPABILITY && response.payload.CAPABILITY.length) {
        // capabilites were listed with * CAPABILITY ... response
        _this16._capability = response.payload.CAPABILITY.pop().attributes.map(function (capa = '') {
          return capa.value.toUpperCase().trim();
        });
      } else {
        // capabilities were not automatically listed, reload
        yield _this16.updateCapability(true);
      }

      _this16._changeState(STATE_AUTHENTICATED);
      _this16._authenticated = true;
      _this16.logger.debug('Login successful, post-auth capabilites updated!', _this16._capability);
    })();
  }

  /**
   * Run an IMAP command.
   *
   * @param {Object} request Structured request object
   * @param {Array} acceptUntagged a list of untagged responses that will be included in 'payload' property
   */
  exec(request, acceptUntagged, options) {
    var _this17 = this;

    return _asyncToGenerator(function* () {
      _this17.breakIdle();
      const response = yield _this17.client.enqueueCommand(request, acceptUntagged, options);
      if (response && response.capability) {
        _this17._capability = response.capability;
      }
      return response;
    })();
  }

  /**
   * The connection is idling. Sends a NOOP or IDLE command
   *
   * IDLE details:
   *   https://tools.ietf.org/html/rfc2177
   */
  enterIdle() {
    if (this._enteredIdle) {
      return;
    }
    this._enteredIdle = this._capability.indexOf('IDLE') >= 0 ? 'IDLE' : 'NOOP';
    this.logger.debug('Entering idle with ' + this._enteredIdle);

    if (this._enteredIdle === 'NOOP') {
      this._idleTimeout = setTimeout(() => {
        this.logger.debug('Sending NOOP');
        this.exec('NOOP');
      }, this.timeoutNoop);
    } else if (this._enteredIdle === 'IDLE') {
      this.client.enqueueCommand({
        command: 'IDLE'
      });
      this._idleTimeout = setTimeout(() => {
        this.client.send('DONE\r\n');
        this._enteredIdle = false;
        this.logger.debug('Idle terminated');
      }, this.timeoutIdle);
    }
  }

  /**
   * Stops actions related idling, if IDLE is supported, sends DONE to stop it
   */
  breakIdle() {
    if (!this._enteredIdle) {
      return;
    }

    clearTimeout(this._idleTimeout);
    if (this._enteredIdle === 'IDLE') {
      this.client.send('DONE\r\n');
      this.logger.debug('Idle terminated');
    }
    this._enteredIdle = false;
  }

  /**
   * Runs STARTTLS command if needed
   *
   * STARTTLS details:
   *   http://tools.ietf.org/html/rfc3501#section-6.2.1
   *
   * @param {Boolean} [forced] By default the command is not run if capability is already listed. Set to true to skip this validation
   */
  upgradeConnection() {
    var _this18 = this;

    return _asyncToGenerator(function* () {
      // skip request, if already secured
      if (_this18.client.secureMode) {
        return false;
      }

      // skip if STARTTLS not available or starttls support disabled
      if ((_this18._capability.indexOf('STARTTLS') < 0 || _this18._ignoreTLS) && !_this18._requireTLS) {
        return false;
      }

      _this18.logger.debug('Encrypting connection...');
      yield _this18.exec('STARTTLS');
      _this18._capability = [];
      _this18.client.upgrade();
      return _this18.updateCapability();
    })();
  }

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
  updateCapability(forced) {
    var _this19 = this;

    return _asyncToGenerator(function* () {
      // skip request, if not forced update and capabilities are already loaded
      if (!forced && _this19._capability.length) {
        return;
      }

      // If STARTTLS is required then skip capability listing as we are going to try
      // STARTTLS anyway and we re-check capabilities after connection is secured
      if (!_this19.client.secureMode && _this19._requireTLS) {
        return;
      }

      _this19.logger.debug('Updating capability...');
      return _this19.exec('CAPABILITY');
    })();
  }

  hasCapability(capa = '') {
    return this._capability.indexOf(capa.toUpperCase().trim()) >= 0;
  }

  // Default handlers for untagged responses

  /**
   * Checks if an untagged OK includes [CAPABILITY] tag and updates capability object
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedOkHandler(response) {
    if (response && response.capability) {
      this._capability = response.capability;
    }
  }

  /**
   * Updates capability object
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedCapabilityHandler(response) {
    this._capability = (0, _ramda.pipe)((0, _ramda.propOr)([], 'attributes'), (0, _ramda.map)(({ value }) => (value || '').toUpperCase().trim()))(response);
  }

  /**
   * Updates existing message count
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedExistsHandler(response) {
    if (response && response.hasOwnProperty('nr')) {
      this.onupdate && this.onupdate(this._selectedMailbox, 'exists', response.nr);
    }
  }

  /**
   * Indicates a message has been deleted
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedExpungeHandler(response) {
    if (response && response.hasOwnProperty('nr')) {
      this.onupdate && this.onupdate(this._selectedMailbox, 'expunge', response.nr);
    }
  }

  /**
   * Indicates that flags have been updated for a message
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedFetchHandler(response) {
    this.onupdate && this.onupdate(this._selectedMailbox, 'fetch', [].concat((0, _commandParser.parseFETCH)({ payload: { FETCH: [response] } }) || []).shift());
  }

  // Private helpers

  /**
   * Indicates that the connection started idling. Initiates a cycle
   * of NOOPs or IDLEs to receive notifications about updates in the server
   */
  _onIdle() {
    if (!this._authenticated || this._enteredIdle) {
      // No need to IDLE when not logged in or already idling
      return;
    }

    this.logger.debug('Client started idling');
    this.enterIdle();
  }

  /**
   * Updates the IMAP state value for the current connection
   *
   * @param {Number} newState The state you want to change to
   */
  _changeState(newState) {
    if (newState === this._state) {
      return;
    }

    this.logger.debug('Entering state: ' + newState);

    // if a mailbox was opened, emit onclosemailbox and clear selectedMailbox value
    if (this._state === STATE_SELECTED && this._selectedMailbox) {
      this.onclosemailbox && this.onclosemailbox(this._selectedMailbox);
      this._selectedMailbox = false;
    }

    this._state = newState;
  }

  /**
   * Ensures a path exists in the Mailbox tree
   *
   * @param {Object} tree Mailbox tree
   * @param {String} path
   * @param {String} delimiter
   * @return {Object} branch for used path
   */
  _ensurePath(tree, path, delimiter) {
    const names = path.split(delimiter);
    let branch = tree;

    for (let i = 0; i < names.length; i++) {
      let found = false;
      for (let j = 0; j < branch.children.length; j++) {
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
  }

  /**
   * Compares two mailbox names. Case insensitive in case of INBOX, otherwise case sensitive
   *
   * @param {String} a Mailbox name
   * @param {String} b Mailbox name
   * @returns {Boolean} True if the folder names match
   */
  _compareMailboxNames(a, b) {
    return (a.toUpperCase() === 'INBOX' ? 'INBOX' : a) === (b.toUpperCase() === 'INBOX' ? 'INBOX' : b);
  }

  createLogger(creator = _logger2.default) {
    const logger = creator(this._auth.user || '', this._host);
    this.logger = this.client.logger = {
      debug: (...msgs) => {
        if (_common.LOG_LEVEL_DEBUG >= this.logLevel) {
          logger.debug(msgs);
        }
      },
      info: (...msgs) => {
        if (_common.LOG_LEVEL_INFO >= this.logLevel) {
          logger.info(msgs);
        }
      },
      warn: (...msgs) => {
        if (_common.LOG_LEVEL_WARN >= this.logLevel) {
          logger.warn(msgs);
        }
      },
      error: (...msgs) => {
        if (_common.LOG_LEVEL_ERROR >= this.logLevel) {
          logger.error(msgs);
        }
      }
    };
  }
}
exports.default = Client;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiVElNRU9VVF9DT05ORUNUSU9OIiwiVElNRU9VVF9OT09QIiwiVElNRU9VVF9JRExFIiwiU1RBVEVfQ09OTkVDVElORyIsIlNUQVRFX05PVF9BVVRIRU5USUNBVEVEIiwiU1RBVEVfQVVUSEVOVElDQVRFRCIsIlNUQVRFX1NFTEVDVEVEIiwiU1RBVEVfTE9HT1VUIiwiREVGQVVMVF9DTElFTlRfSUQiLCJuYW1lIiwiQ2xpZW50IiwiY29uc3RydWN0b3IiLCJob3N0IiwicG9ydCIsIm9wdGlvbnMiLCJ0aW1lb3V0Q29ubmVjdGlvbiIsInRpbWVvdXROb29wIiwidGltZW91dElkbGUiLCJzZXJ2ZXJJZCIsIm9uY2VydCIsIm9udXBkYXRlIiwib25zZWxlY3RtYWlsYm94Iiwib25jbG9zZW1haWxib3giLCJfaG9zdCIsIl9jbGllbnRJZCIsIl9zdGF0ZSIsIl9hdXRoZW50aWNhdGVkIiwiX2NhcGFiaWxpdHkiLCJfc2VsZWN0ZWRNYWlsYm94IiwiX2VudGVyZWRJZGxlIiwiX2lkbGVUaW1lb3V0IiwiX2VuYWJsZUNvbXByZXNzaW9uIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJfYXV0aCIsImF1dGgiLCJfcmVxdWlyZVRMUyIsInJlcXVpcmVUTFMiLCJfaWdub3JlVExTIiwiaWdub3JlVExTIiwiY2xpZW50Iiwib25lcnJvciIsIl9vbkVycm9yIiwiYmluZCIsImNlcnQiLCJvbmlkbGUiLCJfb25JZGxlIiwic2V0SGFuZGxlciIsInJlc3BvbnNlIiwiX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIiLCJfdW50YWdnZWRPa0hhbmRsZXIiLCJfdW50YWdnZWRFeGlzdHNIYW5kbGVyIiwiX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIiLCJfdW50YWdnZWRGZXRjaEhhbmRsZXIiLCJjcmVhdGVMb2dnZXIiLCJsb2dMZXZlbCIsImVyciIsImNsZWFyVGltZW91dCIsImNvbm5lY3QiLCJfb3BlbkNvbm5lY3Rpb24iLCJfY2hhbmdlU3RhdGUiLCJ1cGRhdGVDYXBhYmlsaXR5IiwidXBncmFkZUNvbm5lY3Rpb24iLCJ1cGRhdGVJZCIsImxvZ2dlciIsIndhcm4iLCJtZXNzYWdlIiwibG9naW4iLCJjb21wcmVzc0Nvbm5lY3Rpb24iLCJkZWJ1ZyIsImVycm9yIiwiY2xvc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNvbm5lY3Rpb25UaW1lb3V0Iiwic2V0VGltZW91dCIsIkVycm9yIiwidGhlbiIsIm9ucmVhZHkiLCJjYXRjaCIsImxvZ291dCIsImlkIiwiaW5kZXhPZiIsImNvbW1hbmQiLCJhdHRyaWJ1dGVzIiwiT2JqZWN0IiwiZW50cmllcyIsImV4ZWMiLCJsaXN0IiwibWFwIiwidmFsdWVzIiwia2V5cyIsImZpbHRlciIsIl8iLCJpIiwiX3Nob3VsZFNlbGVjdE1haWxib3giLCJwYXRoIiwiY3R4IiwicHJldmlvdXNTZWxlY3QiLCJnZXRQcmV2aW91c2x5UXVldWVkIiwicmVxdWVzdCIsInBhdGhBdHRyaWJ1dGUiLCJmaW5kIiwiYXR0cmlidXRlIiwidHlwZSIsInZhbHVlIiwic2VsZWN0TWFpbGJveCIsInF1ZXJ5IiwicmVhZE9ubHkiLCJjb25kc3RvcmUiLCJwdXNoIiwibWFpbGJveEluZm8iLCJsaXN0TmFtZXNwYWNlcyIsImxpc3RNYWlsYm94ZXMiLCJ0cmVlIiwicm9vdCIsImNoaWxkcmVuIiwibGlzdFJlc3BvbnNlIiwiZm9yRWFjaCIsImF0dHIiLCJpdGVtIiwibGVuZ3RoIiwiZGVsaW0iLCJicmFuY2giLCJfZW5zdXJlUGF0aCIsImZsYWdzIiwibGlzdGVkIiwibHN1YlJlc3BvbnNlIiwibHN1YiIsImZsYWciLCJzdWJzY3JpYmVkIiwiY3JlYXRlTWFpbGJveCIsImNvZGUiLCJsaXN0TWVzc2FnZXMiLCJzZXF1ZW5jZSIsIml0ZW1zIiwiZmFzdCIsInByZWNoZWNrIiwic2VhcmNoIiwic2V0RmxhZ3MiLCJrZXkiLCJBcnJheSIsImlzQXJyYXkiLCJjb25jYXQiLCJhZGQiLCJzZXQiLCJyZW1vdmUiLCJzdG9yZSIsImFjdGlvbiIsInVwbG9hZCIsImRlc3RpbmF0aW9uIiwiZGVsZXRlTWVzc2FnZXMiLCJ1c2VVaWRQbHVzIiwiYnlVaWQiLCJ1aWRFeHB1bmdlQ29tbWFuZCIsImNtZCIsImNvcHlNZXNzYWdlcyIsImh1bWFuUmVhZGFibGUiLCJtb3ZlTWVzc2FnZXMiLCJjb21wcmVzc2VkIiwieG9hdXRoMiIsInVzZXIiLCJzZW5zaXRpdmUiLCJlcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSIsInBhc3MiLCJjYXBhYmlsaXR5IiwicGF5bG9hZCIsIkNBUEFCSUxJVFkiLCJwb3AiLCJjYXBhIiwidG9VcHBlckNhc2UiLCJ0cmltIiwiYWNjZXB0VW50YWdnZWQiLCJicmVha0lkbGUiLCJlbnF1ZXVlQ29tbWFuZCIsImVudGVySWRsZSIsInNlbmQiLCJzZWN1cmVNb2RlIiwidXBncmFkZSIsImZvcmNlZCIsImhhc0NhcGFiaWxpdHkiLCJoYXNPd25Qcm9wZXJ0eSIsIm5yIiwiRkVUQ0giLCJzaGlmdCIsIm5ld1N0YXRlIiwiZGVsaW1pdGVyIiwibmFtZXMiLCJzcGxpdCIsImZvdW5kIiwiaiIsIl9jb21wYXJlTWFpbGJveE5hbWVzIiwic2xpY2UiLCJqb2luIiwiYSIsImIiLCJjcmVhdG9yIiwibXNncyIsImluZm8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFNQTs7QUFPQTs7OztBQUNBOzs7O0FBQ0E7O0FBUUE7Ozs7OztBQUlPLE1BQU1BLGtEQUFxQixLQUFLLElBQWhDLEMsQ0FBcUM7QUFDckMsTUFBTUMsc0NBQWUsS0FBSyxJQUExQixDLENBQStCO0FBQy9CLE1BQU1DLHNDQUFlLEtBQUssSUFBMUIsQyxDQUErQjs7QUFFL0IsTUFBTUMsOENBQW1CLENBQXpCO0FBQ0EsTUFBTUMsNERBQTBCLENBQWhDO0FBQ0EsTUFBTUMsb0RBQXNCLENBQTVCO0FBQ0EsTUFBTUMsMENBQWlCLENBQXZCO0FBQ0EsTUFBTUMsc0NBQWUsQ0FBckI7O0FBRUEsTUFBTUMsZ0RBQW9C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QUV6QixXQUFGLE9BQW9CLE9BQXBCLEdBQThCLE9BQTlCLEdBQXdDeUIsQ0FBekYsQ0FBUDtBQUNEOztBQUVEOUksZUFBYytJLDBCQUFkLEVBQTZDO0FBQzNDLFVBQU1ySSxTQUFTcUksUUFBUSxLQUFLbkssS0FBTCxDQUFXZ0ksSUFBWCxJQUFtQixFQUEzQixFQUErQixLQUFLMUksS0FBcEMsQ0FBZjtBQUNBLFNBQUt3QyxNQUFMLEdBQWMsS0FBS3hCLE1BQUwsQ0FBWXdCLE1BQVosR0FBcUI7QUFDakNLLGFBQU8sQ0FBQyxHQUFHaUksSUFBSixLQUFhO0FBQUUsWUFBSSwyQkFBbUIsS0FBSy9JLFFBQTVCLEVBQXNDO0FBQUVTLGlCQUFPSyxLQUFQLENBQWFpSSxJQUFiO0FBQW9CO0FBQUUsT0FEbkQ7QUFFakNDLFlBQU0sQ0FBQyxHQUFHRCxJQUFKLEtBQWE7QUFBRSxZQUFJLDBCQUFrQixLQUFLL0ksUUFBM0IsRUFBcUM7QUFBRVMsaUJBQU91SSxJQUFQLENBQVlELElBQVo7QUFBbUI7QUFBRSxPQUZoRDtBQUdqQ3JJLFlBQU0sQ0FBQyxHQUFHcUksSUFBSixLQUFhO0FBQUUsWUFBSSwwQkFBa0IsS0FBSy9JLFFBQTNCLEVBQXFDO0FBQUVTLGlCQUFPQyxJQUFQLENBQVlxSSxJQUFaO0FBQW1CO0FBQUUsT0FIaEQ7QUFJakNoSSxhQUFPLENBQUMsR0FBR2dJLElBQUosS0FBYTtBQUFFLFlBQUksMkJBQW1CLEtBQUsvSSxRQUE1QixFQUFzQztBQUFFUyxpQkFBT00sS0FBUCxDQUFhZ0ksSUFBYjtBQUFvQjtBQUFFO0FBSm5ELEtBQW5DO0FBTUQ7QUFuM0J5QjtrQkFBUDNMLE0iLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWFwLCBwaXBlLCB1bmlvbiwgemlwLCBmcm9tUGFpcnMsIHByb3BPciwgcGF0aE9yLCBmbGF0dGVuIH0gZnJvbSAncmFtZGEnXG5pbXBvcnQgeyBpbWFwRW5jb2RlLCBpbWFwRGVjb2RlIH0gZnJvbSAnZW1haWxqcy11dGY3J1xuaW1wb3J0IHtcbiAgcGFyc2VOQU1FU1BBQ0UsXG4gIHBhcnNlU0VMRUNULFxuICBwYXJzZUZFVENILFxuICBwYXJzZVNFQVJDSFxufSBmcm9tICcuL2NvbW1hbmQtcGFyc2VyJ1xuaW1wb3J0IHtcbiAgYnVpbGRGRVRDSENvbW1hbmQsXG4gIGJ1aWxkWE9BdXRoMlRva2VuLFxuICBidWlsZFNFQVJDSENvbW1hbmQsXG4gIGJ1aWxkU1RPUkVDb21tYW5kXG59IGZyb20gJy4vY29tbWFuZC1idWlsZGVyJ1xuXG5pbXBvcnQgY3JlYXRlRGVmYXVsdExvZ2dlciBmcm9tICcuL2xvZ2dlcidcbmltcG9ydCBJbWFwQ2xpZW50IGZyb20gJy4vaW1hcCdcbmltcG9ydCB7XG4gIExPR19MRVZFTF9FUlJPUixcbiAgTE9HX0xFVkVMX1dBUk4sXG4gIExPR19MRVZFTF9JTkZPLFxuICBMT0dfTEVWRUxfREVCVUcsXG4gIExPR19MRVZFTF9BTExcbn0gZnJvbSAnLi9jb21tb24nXG5cbmltcG9ydCB7XG4gIGNoZWNrU3BlY2lhbFVzZVxufSBmcm9tICcuL3NwZWNpYWwtdXNlJ1xuXG5leHBvcnQgY29uc3QgVElNRU9VVF9DT05ORUNUSU9OID0gOTAgKiAxMDAwIC8vIE1pbGxpc2Vjb25kcyB0byB3YWl0IGZvciB0aGUgSU1BUCBncmVldGluZyBmcm9tIHRoZSBzZXJ2ZXJcbmV4cG9ydCBjb25zdCBUSU1FT1VUX05PT1AgPSA2MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIGJldHdlZW4gTk9PUCBjb21tYW5kcyB3aGlsZSBpZGxpbmdcbmV4cG9ydCBjb25zdCBUSU1FT1VUX0lETEUgPSA2MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIHVudGlsIElETEUgY29tbWFuZCBpcyBjYW5jZWxsZWRcblxuZXhwb3J0IGNvbnN0IFNUQVRFX0NPTk5FQ1RJTkcgPSAxXG5leHBvcnQgY29uc3QgU1RBVEVfTk9UX0FVVEhFTlRJQ0FURUQgPSAyXG5leHBvcnQgY29uc3QgU1RBVEVfQVVUSEVOVElDQVRFRCA9IDNcbmV4cG9ydCBjb25zdCBTVEFURV9TRUxFQ1RFRCA9IDRcbmV4cG9ydCBjb25zdCBTVEFURV9MT0dPVVQgPSA1XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NMSUVOVF9JRCA9IHtcbiAgbmFtZTogJ2VtYWlsanMtaW1hcC1jbGllbnQnXG59XG5cbi8qKlxuICogZW1haWxqcyBJTUFQIGNsaWVudFxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbaG9zdD0nbG9jYWxob3N0J10gSG9zdG5hbWUgdG8gY29uZW5jdCB0b1xuICogQHBhcmFtIHtOdW1iZXJ9IFtwb3J0PTE0M10gUG9ydCBudW1iZXIgdG8gY29ubmVjdCB0b1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25hbCBvcHRpb25zIG9iamVjdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGllbnQge1xuICBjb25zdHJ1Y3RvciAoaG9zdCwgcG9ydCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy50aW1lb3V0Q29ubmVjdGlvbiA9IFRJTUVPVVRfQ09OTkVDVElPTlxuICAgIHRoaXMudGltZW91dE5vb3AgPSBUSU1FT1VUX05PT1BcbiAgICB0aGlzLnRpbWVvdXRJZGxlID0gVElNRU9VVF9JRExFXG5cbiAgICB0aGlzLnNlcnZlcklkID0gZmFsc2UgLy8gUkZDIDI5NzEgU2VydmVyIElEIGFzIGtleSB2YWx1ZSBwYWlyc1xuXG4gICAgLy8gRXZlbnQgcGxhY2Vob2xkZXJzXG4gICAgdGhpcy5vbmNlcnQgPSBudWxsXG4gICAgdGhpcy5vbnVwZGF0ZSA9IG51bGxcbiAgICB0aGlzLm9uc2VsZWN0bWFpbGJveCA9IG51bGxcbiAgICB0aGlzLm9uY2xvc2VtYWlsYm94ID0gbnVsbFxuXG4gICAgdGhpcy5faG9zdCA9IGhvc3RcbiAgICB0aGlzLl9jbGllbnRJZCA9IHByb3BPcihERUZBVUxUX0NMSUVOVF9JRCwgJ2lkJywgb3B0aW9ucylcbiAgICB0aGlzLl9zdGF0ZSA9IGZhbHNlIC8vIEN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gZmFsc2UgLy8gSXMgdGhlIGNvbm5lY3Rpb24gYXV0aGVudGljYXRlZFxuICAgIHRoaXMuX2NhcGFiaWxpdHkgPSBbXSAvLyBMaXN0IG9mIGV4dGVuc2lvbnMgdGhlIHNlcnZlciBzdXBwb3J0c1xuICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IGZhbHNlIC8vIFNlbGVjdGVkIG1haWxib3hcbiAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IGZhbHNlXG4gICAgdGhpcy5faWRsZVRpbWVvdXQgPSBmYWxzZVxuICAgIHRoaXMuX2VuYWJsZUNvbXByZXNzaW9uID0gISFvcHRpb25zLmVuYWJsZUNvbXByZXNzaW9uXG4gICAgdGhpcy5fYXV0aCA9IG9wdGlvbnMuYXV0aFxuICAgIHRoaXMuX3JlcXVpcmVUTFMgPSAhIW9wdGlvbnMucmVxdWlyZVRMU1xuICAgIHRoaXMuX2lnbm9yZVRMUyA9ICEhb3B0aW9ucy5pZ25vcmVUTFNcblxuICAgIHRoaXMuY2xpZW50ID0gbmV3IEltYXBDbGllbnQoaG9zdCwgcG9ydCwgb3B0aW9ucykgLy8gSU1BUCBjbGllbnQgb2JqZWN0XG5cbiAgICAvLyBFdmVudCBIYW5kbGVyc1xuICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcylcbiAgICB0aGlzLmNsaWVudC5vbmNlcnQgPSAoY2VydCkgPT4gKHRoaXMub25jZXJ0ICYmIHRoaXMub25jZXJ0KGNlcnQpKSAvLyBhbGxvd3MgY2VydGlmaWNhdGUgaGFuZGxpbmcgZm9yIHBsYXRmb3JtcyB3L28gbmF0aXZlIHRscyBzdXBwb3J0XG4gICAgdGhpcy5jbGllbnQub25pZGxlID0gKCkgPT4gdGhpcy5fb25JZGxlKCkgLy8gc3RhcnQgaWRsaW5nXG5cbiAgICAvLyBEZWZhdWx0IGhhbmRsZXJzIGZvciB1bnRhZ2dlZCByZXNwb25zZXNcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdjYXBhYmlsaXR5JywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyKHJlc3BvbnNlKSkgLy8gY2FwYWJpbGl0eSB1cGRhdGVzXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignb2snLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkT2tIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbm90aWZpY2F0aW9uc1xuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2V4aXN0cycsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRFeGlzdHNIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbWVzc2FnZSBjb3VudCBoYXMgY2hhbmdlZFxuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2V4cHVuZ2UnLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGhhcyBiZWVuIGRlbGV0ZWRcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdmZXRjaCcsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRGZXRjaEhhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGhhcyBiZWVuIHVwZGF0ZWQgKGVnLiBmbGFnIGNoYW5nZSlcblxuICAgIC8vIEFjdGl2YXRlIGxvZ2dpbmdcbiAgICB0aGlzLmNyZWF0ZUxvZ2dlcigpXG4gICAgdGhpcy5sb2dMZXZlbCA9IHByb3BPcihMT0dfTEVWRUxfQUxMLCAnbG9nTGV2ZWwnLCBvcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBpZiB0aGUgbG93ZXItbGV2ZWwgSW1hcENsaWVudCBoYXMgZW5jb3VudGVyZWQgYW4gdW5yZWNvdmVyYWJsZVxuICAgKiBlcnJvciBkdXJpbmcgb3BlcmF0aW9uLiBDbGVhbnMgdXAgYW5kIHByb3BhZ2F0ZXMgdGhlIGVycm9yIHVwd2FyZHMuXG4gICAqL1xuICBfb25FcnJvciAoZXJyKSB7XG4gICAgLy8gbWFrZSBzdXJlIG5vIGlkbGUgdGltZW91dCBpcyBwZW5kaW5nIGFueW1vcmVcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG5cbiAgICAvLyBwcm9wYWdhdGUgdGhlIGVycm9yIHVwd2FyZHNcbiAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycilcbiAgfVxuXG4gIC8vXG4gIC8vXG4gIC8vIFBVQkxJQyBBUElcbiAgLy9cbiAgLy9cblxuICAvKipcbiAgICogSW5pdGlhdGUgY29ubmVjdGlvbiB0byB0aGUgSU1BUCBzZXJ2ZXJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hlbiBsb2dpbiBwcm9jZWR1cmUgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIGNvbm5lY3QgKCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9vcGVuQ29ubmVjdGlvbigpXG4gICAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9OT1RfQVVUSEVOVElDQVRFRClcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ2FwYWJpbGl0eSgpXG4gICAgICBhd2FpdCB0aGlzLnVwZ3JhZGVDb25uZWN0aW9uKClcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlSWQodGhpcy5fY2xpZW50SWQpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybignRmFpbGVkIHRvIHVwZGF0ZSBzZXJ2ZXIgaWQhJywgZXJyLm1lc3NhZ2UpXG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMubG9naW4odGhpcy5fYXV0aClcbiAgICAgIGF3YWl0IHRoaXMuY29tcHJlc3NDb25uZWN0aW9uKClcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25uZWN0aW9uIGVzdGFibGlzaGVkLCByZWFkeSB0byByb2xsIScpXG4gICAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyJywgZXJyKVxuICAgICAgdGhpcy5jbG9zZShlcnIpIC8vIHdlIGRvbid0IHJlYWxseSBjYXJlIHdoZXRoZXIgdGhpcyB3b3JrcyBvciBub3RcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIF9vcGVuQ29ubmVjdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBjb25uZWN0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KG5ldyBFcnJvcignVGltZW91dCBjb25uZWN0aW5nIHRvIHNlcnZlcicpKSwgdGhpcy50aW1lb3V0Q29ubmVjdGlvbilcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25uZWN0aW5nIHRvJywgdGhpcy5jbGllbnQuaG9zdCwgJzonLCB0aGlzLmNsaWVudC5wb3J0KVxuICAgICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfQ09OTkVDVElORylcbiAgICAgIHRoaXMuY2xpZW50LmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NvY2tldCBvcGVuZWQsIHdhaXRpbmcgZm9yIGdyZWV0aW5nIGZyb20gdGhlIHNlcnZlci4uLicpXG5cbiAgICAgICAgdGhpcy5jbGllbnQub25yZWFkeSA9ICgpID0+IHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXQpXG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjb25uZWN0aW9uVGltZW91dClcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dvdXRcbiAgICpcbiAgICogU2VuZCBMT0dPVVQsIHRvIHdoaWNoIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgYnkgY2xvc2luZyB0aGUgY29ubmVjdGlvbi5cbiAgICogVXNlIGlzIGRpc2NvdXJhZ2VkIGlmIG5ldHdvcmsgc3RhdHVzIGlzIHVuY2xlYXIhIElmIG5ldHdvcmtzIHN0YXR1cyBpc1xuICAgKiB1bmNsZWFyLCBwbGVhc2UgdXNlICNjbG9zZSBpbnN0ZWFkIVxuICAgKlxuICAgKiBMT0dPVVQgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMS4zXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNlcnZlciBoYXMgY2xvc2VkIHRoZSBjb25uZWN0aW9uXG4gICAqL1xuICBhc3luYyBsb2dvdXQgKCkge1xuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0xPR09VVClcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTG9nZ2luZyBvdXQuLi4nKVxuICAgIGF3YWl0IHRoaXMuY2xpZW50LmxvZ291dCgpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlLWNsb3NlcyB0aGUgY3VycmVudCBjb25uZWN0aW9uIGJ5IGNsb3NpbmcgdGhlIFRDUCBzb2NrZXQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNvY2tldCBpcyBjbG9zZWRcbiAgICovXG4gIGFzeW5jIGNsb3NlIChlcnIpIHtcbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9MT0dPVVQpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDbG9zaW5nIGNvbm5lY3Rpb24uLi4nKVxuICAgIGF3YWl0IHRoaXMuY2xpZW50LmNsb3NlKGVycilcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBJRCBjb21tYW5kLCBwYXJzZXMgSUQgcmVzcG9uc2UsIHNldHMgdGhpcy5zZXJ2ZXJJZFxuICAgKlxuICAgKiBJRCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzI5NzFcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGlkIElEIGFzIEpTT04gb2JqZWN0LiBTZWUgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjk3MSNzZWN0aW9uLTMuMyBmb3IgcG9zc2libGUgdmFsdWVzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHJlc3BvbnNlIGhhcyBiZWVuIHBhcnNlZFxuICAgKi9cbiAgYXN5bmMgdXBkYXRlSWQgKGlkKSB7XG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignSUQnKSA8IDApIHJldHVyblxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1VwZGF0aW5nIGlkLi4uJylcblxuICAgIGNvbnN0IGNvbW1hbmQgPSAnSUQnXG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGlkID8gWyBmbGF0dGVuKE9iamVjdC5lbnRyaWVzKGlkKSkgXSA6IFsgbnVsbCBdXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kLCBhdHRyaWJ1dGVzIH0sICdJRCcpXG4gICAgY29uc3QgbGlzdCA9IGZsYXR0ZW4ocGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnSUQnLCAnMCcsICdhdHRyaWJ1dGVzJywgJzAnXSwgcmVzcG9uc2UpLm1hcChPYmplY3QudmFsdWVzKSlcbiAgICBjb25zdCBrZXlzID0gbGlzdC5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAwKVxuICAgIGNvbnN0IHZhbHVlcyA9IGxpc3QuZmlsdGVyKChfLCBpKSA9PiBpICUgMiA9PT0gMSlcbiAgICB0aGlzLnNlcnZlcklkID0gZnJvbVBhaXJzKHppcChrZXlzLCB2YWx1ZXMpKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZXJ2ZXIgaWQgdXBkYXRlZCEnLCB0aGlzLnNlcnZlcklkKVxuICB9XG5cbiAgX3Nob3VsZFNlbGVjdE1haWxib3ggKHBhdGgsIGN0eCkge1xuICAgIGlmICghY3R4KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzU2VsZWN0ID0gdGhpcy5jbGllbnQuZ2V0UHJldmlvdXNseVF1ZXVlZChbJ1NFTEVDVCcsICdFWEFNSU5FJ10sIGN0eClcbiAgICBpZiAocHJldmlvdXNTZWxlY3QgJiYgcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBwYXRoQXR0cmlidXRlID0gcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzLmZpbmQoKGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlLnR5cGUgPT09ICdTVFJJTkcnKVxuICAgICAgaWYgKHBhdGhBdHRyaWJ1dGUpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhBdHRyaWJ1dGUudmFsdWUgIT09IHBhdGhcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNYWlsYm94ICE9PSBwYXRoXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTRUxFQ1Qgb3IgRVhBTUlORSB0byBvcGVuIGEgbWFpbGJveFxuICAgKlxuICAgKiBTRUxFQ1QgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjFcbiAgICogRVhBTUlORSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBGdWxsIHBhdGggdG8gbWFpbGJveFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIHNlbGVjdGVkIG1haWxib3hcbiAgICovXG4gIGFzeW5jIHNlbGVjdE1haWxib3ggKHBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIGNvbW1hbmQ6IG9wdGlvbnMucmVhZE9ubHkgPyAnRVhBTUlORScgOiAnU0VMRUNUJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFt7IHR5cGU6ICdTVFJJTkcnLCB2YWx1ZTogcGF0aCB9XVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNvbmRzdG9yZSAmJiB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0NPTkRTVE9SRScpID49IDApIHtcbiAgICAgIHF1ZXJ5LmF0dHJpYnV0ZXMucHVzaChbeyB0eXBlOiAnQVRPTScsIHZhbHVlOiAnQ09ORFNUT1JFJyB9XSlcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnT3BlbmluZycsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKHF1ZXJ5LCBbJ0VYSVNUUycsICdGTEFHUycsICdPSyddLCB7IGN0eDogb3B0aW9ucy5jdHggfSlcbiAgICBsZXQgbWFpbGJveEluZm8gPSBwYXJzZVNFTEVDVChyZXNwb25zZSlcblxuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX1NFTEVDVEVEKVxuXG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkTWFpbGJveCAhPT0gcGF0aCAmJiB0aGlzLm9uY2xvc2VtYWlsYm94KSB7XG4gICAgICBhd2FpdCB0aGlzLm9uY2xvc2VtYWlsYm94KHRoaXMuX3NlbGVjdGVkTWFpbGJveClcbiAgICB9XG4gICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gcGF0aFxuICAgIGlmICh0aGlzLm9uc2VsZWN0bWFpbGJveCkge1xuICAgICAgYXdhaXQgdGhpcy5vbnNlbGVjdG1haWxib3gocGF0aCwgbWFpbGJveEluZm8pXG4gICAgfVxuXG4gICAgcmV0dXJuIG1haWxib3hJbmZvXG4gIH1cblxuICAvKipcbiAgICogUnVucyBOQU1FU1BBQ0UgY29tbWFuZFxuICAgKlxuICAgKiBOQU1FU1BBQ0UgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjM0MlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIG5hbWVzcGFjZSBvYmplY3RcbiAgICovXG4gIGFzeW5jIGxpc3ROYW1lc3BhY2VzICgpIHtcbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdOQU1FU1BBQ0UnKSA8IDApIHJldHVybiBmYWxzZVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xpc3RpbmcgbmFtZXNwYWNlcy4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoJ05BTUVTUEFDRScsICdOQU1FU1BBQ0UnKVxuICAgIHJldHVybiBwYXJzZU5BTUVTUEFDRShyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIExJU1QgYW5kIExTVUIgY29tbWFuZHMuIFJldHJpZXZlcyBhIHRyZWUgb2YgYXZhaWxhYmxlIG1haWxib3hlc1xuICAgKlxuICAgKiBMSVNUIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy44XG4gICAqIExTVUIgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjlcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBsaXN0IG9mIG1haWxib3hlc1xuICAgKi9cbiAgYXN5bmMgbGlzdE1haWxib3hlcyAoKSB7XG4gICAgY29uc3QgdHJlZSA9IHsgcm9vdDogdHJ1ZSwgY2hpbGRyZW46IFtdIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMaXN0aW5nIG1haWxib3hlcy4uLicpXG4gICAgY29uc3QgbGlzdFJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKHsgY29tbWFuZDogJ0xJU1QnLCBhdHRyaWJ1dGVzOiBbJycsICcqJ10gfSwgJ0xJU1QnKVxuICAgIGNvbnN0IGxpc3QgPSBwYXRoT3IoW10sIFsncGF5bG9hZCcsICdMSVNUJ10sIGxpc3RSZXNwb25zZSlcbiAgICBsaXN0LmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb25zdCBhdHRyID0gcHJvcE9yKFtdLCAnYXR0cmlidXRlcycsIGl0ZW0pXG4gICAgICBpZiAoIWF0dHIubGVuZ3RoIDwgMykgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhdGggPSBwYXRoT3IoJycsIFsnMicsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgZGVsaW0gPSBwYXRoT3IoJy8nLCBbJzEnLCAndmFsdWUnXSwgYXR0cilcbiAgICAgIGNvbnN0IGJyYW5jaCA9IHRoaXMuX2Vuc3VyZVBhdGgodHJlZSwgcGF0aCwgZGVsaW0pXG4gICAgICBicmFuY2guZmxhZ3MgPSBwcm9wT3IoW10sICcwJywgYXR0cikubWFwKCh7dmFsdWV9KSA9PiB2YWx1ZSB8fCAnJylcbiAgICAgIGJyYW5jaC5saXN0ZWQgPSB0cnVlXG4gICAgICBjaGVja1NwZWNpYWxVc2UoYnJhbmNoKVxuICAgIH0pXG5cbiAgICBjb25zdCBsc3ViUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kOiAnTFNVQicsIGF0dHJpYnV0ZXM6IFsnJywgJyonXSB9LCAnTFNVQicpXG4gICAgY29uc3QgbHN1YiA9IHBhdGhPcihbXSwgWydwYXlsb2FkJywgJ0xTVUInXSwgbHN1YlJlc3BvbnNlKVxuICAgIGxzdWIuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgYXR0ciA9IHByb3BPcihbXSwgJ2F0dHJpYnV0ZXMnLCBpdGVtKVxuICAgICAgaWYgKCFhdHRyLmxlbmd0aCA8IDMpIHJldHVyblxuXG4gICAgICBjb25zdCBwYXRoID0gcGF0aE9yKCcnLCBbJzInLCAndmFsdWUnXSwgYXR0cilcbiAgICAgIGNvbnN0IGRlbGltID0gcGF0aE9yKCcvJywgWycxJywgJ3ZhbHVlJ10sIGF0dHIpXG4gICAgICBjb25zdCBicmFuY2ggPSB0aGlzLl9lbnN1cmVQYXRoKHRyZWUsIHBhdGgsIGRlbGltKVxuICAgICAgcHJvcE9yKFtdLCAnMCcsIGF0dHIpLm1hcCgoZmxhZyA9ICcnKSA9PiB7IGJyYW5jaC5mbGFncyA9IHVuaW9uKGJyYW5jaC5mbGFncywgW2ZsYWddKSB9KVxuICAgICAgYnJhbmNoLnN1YnNjcmliZWQgPSB0cnVlXG4gICAgfSlcblxuICAgIHJldHVybiB0cmVlXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbWFpbGJveCB3aXRoIHRoZSBnaXZlbiBwYXRoLlxuICAgKlxuICAgKiBDUkVBVEUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogICAgIFRoZSBwYXRoIG9mIHRoZSBtYWlsYm94IHlvdSB3b3VsZCBsaWtlIHRvIGNyZWF0ZS4gIFRoaXMgbWV0aG9kIHdpbGxcbiAgICogICAgIGhhbmRsZSB1dGY3IGVuY29kaW5nIGZvciB5b3UuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKiAgICAgUHJvbWlzZSByZXNvbHZlcyBpZiBtYWlsYm94IHdhcyBjcmVhdGVkLlxuICAgKiAgICAgSW4gdGhlIGV2ZW50IHRoZSBzZXJ2ZXIgc2F5cyBOTyBbQUxSRUFEWUVYSVNUU10sIHdlIHRyZWF0IHRoYXQgYXMgc3VjY2Vzcy5cbiAgICovXG4gIGFzeW5jIGNyZWF0ZU1haWxib3ggKHBhdGgpIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ3JlYXRpbmcgbWFpbGJveCcsIHBhdGgsICcuLi4nKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kOiAnQ1JFQVRFJywgYXR0cmlidXRlczogW2ltYXBFbmNvZGUocGF0aCldIH0pXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyICYmIGVyci5jb2RlID09PSAnQUxSRUFEWUVYSVNUUycpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUnVucyBGRVRDSCBjb21tYW5kXG4gICAqXG4gICAqIEZFVENIIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC41XG4gICAqIENIQU5HRURTSU5DRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM0NTUxI3NlY3Rpb24tMy4zXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBTZXF1ZW5jZSBzZXQsIGVnIDE6KiBmb3IgYWxsIG1lc3NhZ2VzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbaXRlbXNdIE1lc3NhZ2UgZGF0YSBpdGVtIG5hbWVzIG9yIG1hY3JvXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGZldGNoZWQgbWVzc2FnZSBpbmZvXG4gICAqL1xuICBhc3luYyBsaXN0TWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBpdGVtcyA9IFt7IGZhc3Q6IHRydWUgfV0sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdGZXRjaGluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IGNvbW1hbmQgPSBidWlsZEZFVENIQ29tbWFuZChzZXF1ZW5jZSwgaXRlbXMsIG9wdGlvbnMpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ0ZFVENIJywge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gcGFyc2VGRVRDSChyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNFQVJDSCBjb21tYW5kXG4gICAqXG4gICAqIFNFQVJDSCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge09iamVjdH0gcXVlcnkgU2VhcmNoIHRlcm1zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIGFzeW5jIHNlYXJjaCAocGF0aCwgcXVlcnksIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZWFyY2hpbmcgaW4nLCBwYXRoLCAnLi4uJylcbiAgICBjb25zdCBjb21tYW5kID0gYnVpbGRTRUFSQ0hDb21tYW5kKHF1ZXJ5LCBvcHRpb25zKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKGNvbW1hbmQsICdTRUFSQ0gnLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBwYXJzZVNFQVJDSChyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNUT1JFIGNvbW1hbmRcbiAgICpcbiAgICogU1RPUkUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjZcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2Ugc2VsZWN0b3Igd2hpY2ggdGhlIGZsYWcgY2hhbmdlIGlzIGFwcGxpZWQgdG9cbiAgICogQHBhcmFtIHtBcnJheX0gZmxhZ3NcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgc2V0RmxhZ3MgKHBhdGgsIHNlcXVlbmNlLCBmbGFncywgb3B0aW9ucykge1xuICAgIGxldCBrZXkgPSAnJ1xuICAgIGxldCBsaXN0ID0gW11cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGZsYWdzKSB8fCB0eXBlb2YgZmxhZ3MgIT09ICdvYmplY3QnKSB7XG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzIHx8IFtdKVxuICAgICAga2V5ID0gJydcbiAgICB9IGVsc2UgaWYgKGZsYWdzLmFkZCkge1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncy5hZGQgfHwgW10pXG4gICAgICBrZXkgPSAnKydcbiAgICB9IGVsc2UgaWYgKGZsYWdzLnNldCkge1xuICAgICAga2V5ID0gJydcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3Muc2V0IHx8IFtdKVxuICAgIH0gZWxzZSBpZiAoZmxhZ3MucmVtb3ZlKSB7XG4gICAgICBrZXkgPSAnLSdcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3MucmVtb3ZlIHx8IFtdKVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZXR0aW5nIGZsYWdzIG9uJywgc2VxdWVuY2UsICdpbicsIHBhdGgsICcuLi4nKVxuICAgIHJldHVybiB0aGlzLnN0b3JlKHBhdGgsIHNlcXVlbmNlLCBrZXkgKyAnRkxBR1MnLCBsaXN0LCBvcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU1RPUkUgY29tbWFuZFxuICAgKlxuICAgKiBTVE9SRSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSBzZWxlY3RvciB3aGljaCB0aGUgZmxhZyBjaGFuZ2UgaXMgYXBwbGllZCB0b1xuICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uIFNUT1JFIG1ldGhvZCB0byBjYWxsLCBlZyBcIitGTEFHU1wiXG4gICAqIEBwYXJhbSB7QXJyYXl9IGZsYWdzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIGFzeW5jIHN0b3JlIChwYXRoLCBzZXF1ZW5jZSwgYWN0aW9uLCBmbGFncywgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgY29tbWFuZCA9IGJ1aWxkU1RPUkVDb21tYW5kKHNlcXVlbmNlLCBhY3Rpb24sIGZsYWdzLCBvcHRpb25zKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKGNvbW1hbmQsICdGRVRDSCcsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIHBhcnNlRkVUQ0gocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBBUFBFTkQgY29tbWFuZFxuICAgKlxuICAgKiBBUFBFTkQgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjExXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZXN0aW5hdGlvbiBUaGUgbWFpbGJveCB3aGVyZSB0byBhcHBlbmQgdGhlIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gYXBwZW5kXG4gICAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnMuZmxhZ3MgQW55IGZsYWdzIHlvdSB3YW50IHRvIHNldCBvbiB0aGUgdXBsb2FkZWQgbWVzc2FnZS4gRGVmYXVsdHMgdG8gW1xcU2Vlbl0uIChvcHRpb25hbClcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgdXBsb2FkIChkZXN0aW5hdGlvbiwgbWVzc2FnZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGZsYWdzID0gcHJvcE9yKFsnXFxcXFNlZW4nXSwgJ2ZsYWdzJywgb3B0aW9ucykubWFwKHZhbHVlID0+ICh7IHR5cGU6ICdhdG9tJywgdmFsdWUgfSkpXG4gICAgbGV0IGNvbW1hbmQgPSB7XG4gICAgICBjb21tYW5kOiAnQVBQRU5EJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgeyB0eXBlOiAnYXRvbScsIHZhbHVlOiBkZXN0aW5hdGlvbiB9LFxuICAgICAgICBmbGFncyxcbiAgICAgICAgeyB0eXBlOiAnbGl0ZXJhbCcsIHZhbHVlOiBtZXNzYWdlIH1cbiAgICAgIF1cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBsb2FkaW5nIG1lc3NhZ2UgdG8nLCBkZXN0aW5hdGlvbiwgJy4uLicpXG4gICAgcmV0dXJuIHRoaXMuZXhlYyhjb21tYW5kKVxuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgbWVzc2FnZXMgZnJvbSBhIHNlbGVjdGVkIG1haWxib3hcbiAgICpcbiAgICogRVhQVU5HRSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuM1xuICAgKiBVSUQgRVhQVU5HRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM0MzE1I3NlY3Rpb24tMi4xXG4gICAqXG4gICAqIElmIHBvc3NpYmxlIChieVVpZDp0cnVlIGFuZCBVSURQTFVTIGV4dGVuc2lvbiBzdXBwb3J0ZWQpLCB1c2VzIFVJRCBFWFBVTkdFXG4gICAqIGNvbW1hbmQgdG8gZGVsZXRlIGEgcmFuZ2Ugb2YgbWVzc2FnZXMsIG90aGVyd2lzZSBmYWxscyBiYWNrIHRvIEVYUFVOR0UuXG4gICAqXG4gICAqIE5CISBUaGlzIG1ldGhvZCBtaWdodCBiZSBkZXN0cnVjdGl2ZSAtIGlmIEVYUFVOR0UgaXMgdXNlZCwgdGhlbiBhbnkgbWVzc2FnZXNcbiAgICogd2l0aCBcXERlbGV0ZWQgZmxhZyBzZXQgYXJlIGRlbGV0ZWRcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2UgcmFuZ2UgdG8gYmUgZGVsZXRlZFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgZGVsZXRlTWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBvcHRpb25zID0ge30pIHtcbiAgICAvLyBhZGQgXFxEZWxldGVkIGZsYWcgdG8gdGhlIG1lc3NhZ2VzIGFuZCBydW4gRVhQVU5HRSBvciBVSUQgRVhQVU5HRVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdEZWxldGluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnaW4nLCBwYXRoLCAnLi4uJylcbiAgICBjb25zdCB1c2VVaWRQbHVzID0gb3B0aW9ucy5ieVVpZCAmJiB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ1VJRFBMVVMnKSA+PSAwXG4gICAgY29uc3QgdWlkRXhwdW5nZUNvbW1hbmQgPSB7IGNvbW1hbmQ6ICdVSUQgRVhQVU5HRScsIGF0dHJpYnV0ZXM6IFt7IHR5cGU6ICdzZXF1ZW5jZScsIHZhbHVlOiBzZXF1ZW5jZSB9XSB9XG4gICAgYXdhaXQgdGhpcy5zZXRGbGFncyhwYXRoLCBzZXF1ZW5jZSwgeyBhZGQ6ICdcXFxcRGVsZXRlZCcgfSwgb3B0aW9ucylcbiAgICBjb25zdCBjbWQgPSB1c2VVaWRQbHVzID8gdWlkRXhwdW5nZUNvbW1hbmQgOiAnRVhQVU5HRSdcbiAgICByZXR1cm4gdGhpcy5leGVjKGNtZCwgbnVsbCwge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgYSByYW5nZSBvZiBtZXNzYWdlcyBmcm9tIHRoZSBhY3RpdmUgbWFpbGJveCB0byB0aGUgZGVzdGluYXRpb24gbWFpbGJveC5cbiAgICogU2lsZW50IG1ldGhvZCAodW5sZXNzIGFuIGVycm9yIG9jY3VycyksIGJ5IGRlZmF1bHQgcmV0dXJucyBubyBpbmZvcm1hdGlvbi5cbiAgICpcbiAgICogQ09QWSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuN1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSByYW5nZSB0byBiZSBjb3BpZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRlc3RpbmF0aW9uIERlc3RpbmF0aW9uIG1haWxib3ggcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmJ5VWlkXSBJZiB0cnVlLCB1c2VzIFVJRCBDT1BZIGluc3RlYWQgb2YgQ09QWVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgY29weU1lc3NhZ2VzIChwYXRoLCBzZXF1ZW5jZSwgZGVzdGluYXRpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb3B5aW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJ3RvJywgZGVzdGluYXRpb24sICcuLi4nKVxuICAgIGNvbnN0IHsgaHVtYW5SZWFkYWJsZSB9ID0gYXdhaXQgdGhpcy5leGVjKHtcbiAgICAgIGNvbW1hbmQ6IG9wdGlvbnMuYnlVaWQgPyAnVUlEIENPUFknIDogJ0NPUFknLFxuICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICB7IHR5cGU6ICdzZXF1ZW5jZScsIHZhbHVlOiBzZXF1ZW5jZSB9LFxuICAgICAgICB7IHR5cGU6ICdhdG9tJywgdmFsdWU6IGRlc3RpbmF0aW9uIH1cbiAgICAgIF1cbiAgICB9LCBudWxsLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBodW1hblJlYWRhYmxlIHx8ICdDT1BZIGNvbXBsZXRlZCdcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyBhIHJhbmdlIG9mIG1lc3NhZ2VzIGZyb20gdGhlIGFjdGl2ZSBtYWlsYm94IHRvIHRoZSBkZXN0aW5hdGlvbiBtYWlsYm94LlxuICAgKiBQcmVmZXJzIHRoZSBNT1ZFIGV4dGVuc2lvbiBidXQgaWYgbm90IGF2YWlsYWJsZSwgZmFsbHMgYmFjayB0b1xuICAgKiBDT1BZICsgRVhQVU5HRVxuICAgKlxuICAgKiBNT1ZFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNjg1MVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSByYW5nZSB0byBiZSBtb3ZlZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gRGVzdGluYXRpb24gbWFpbGJveCBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlXG4gICAqL1xuICBhc3luYyBtb3ZlTWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBkZXN0aW5hdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ01vdmluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICd0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcblxuICAgIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ01PVkUnKSA9PT0gLTEpIHtcbiAgICAgIC8vIEZhbGxiYWNrIHRvIENPUFkgKyBFWFBVTkdFXG4gICAgICBhd2FpdCB0aGlzLmNvcHlNZXNzYWdlcyhwYXRoLCBzZXF1ZW5jZSwgZGVzdGluYXRpb24sIG9wdGlvbnMpXG4gICAgICByZXR1cm4gdGhpcy5kZWxldGVNZXNzYWdlcyhwYXRoLCBzZXF1ZW5jZSwgb3B0aW9ucylcbiAgICB9XG5cbiAgICAvLyBJZiBwb3NzaWJsZSwgdXNlIE1PVkVcbiAgICByZXR1cm4gdGhpcy5leGVjKHtcbiAgICAgIGNvbW1hbmQ6IG9wdGlvbnMuYnlVaWQgPyAnVUlEIE1PVkUnIDogJ01PVkUnLFxuICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICB7IHR5cGU6ICdzZXF1ZW5jZScsIHZhbHVlOiBzZXF1ZW5jZSB9LFxuICAgICAgICB7IHR5cGU6ICdhdG9tJywgdmFsdWU6IGRlc3RpbmF0aW9uIH1cbiAgICAgIF1cbiAgICB9LCBbJ09LJ10sIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUnVucyBDT01QUkVTUyBjb21tYW5kXG4gICAqXG4gICAqIENPTVBSRVNTIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQ5NzhcbiAgICovXG4gIGFzeW5jIGNvbXByZXNzQ29ubmVjdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9lbmFibGVDb21wcmVzc2lvbiB8fCB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0NPTVBSRVNTPURFRkxBVEUnKSA8IDAgfHwgdGhpcy5jbGllbnQuY29tcHJlc3NlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0VuYWJsaW5nIGNvbXByZXNzaW9uLi4uJylcbiAgICBhd2FpdCB0aGlzLmV4ZWMoe1xuICAgICAgY29tbWFuZDogJ0NPTVBSRVNTJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgdmFsdWU6ICdERUZMQVRFJ1xuICAgICAgfV1cbiAgICB9KVxuICAgIHRoaXMuY2xpZW50LmVuYWJsZUNvbXByZXNzaW9uKClcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29tcHJlc3Npb24gZW5hYmxlZCwgYWxsIGRhdGEgc2VudCBhbmQgcmVjZWl2ZWQgaXMgZGVmbGF0ZWQhJylcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIExPR0lOIG9yIEFVVEhFTlRJQ0FURSBYT0FVVEgyIGNvbW1hbmRcbiAgICpcbiAgICogTE9HSU4gZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4yLjNcbiAgICogWE9BVVRIMiBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2dtYWlsL3hvYXV0aDJfcHJvdG9jb2wjaW1hcF9wcm90b2NvbF9leGNoYW5nZVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aC51c2VyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRoLnBhc3NcbiAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGgueG9hdXRoMlxuICAgKi9cbiAgYXN5bmMgbG9naW4gKGF1dGgpIHtcbiAgICBsZXQgY29tbWFuZFxuICAgIGxldCBvcHRpb25zID0ge31cblxuICAgIGlmICghYXV0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdXRoZW50aWNhdGlvbiBpbmZvcm1hdGlvbiBub3QgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0FVVEg9WE9BVVRIMicpID49IDAgJiYgYXV0aCAmJiBhdXRoLnhvYXV0aDIpIHtcbiAgICAgIGNvbW1hbmQgPSB7XG4gICAgICAgIGNvbW1hbmQ6ICdBVVRIRU5USUNBVEUnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgeyB0eXBlOiAnQVRPTScsIHZhbHVlOiAnWE9BVVRIMicgfSxcbiAgICAgICAgICB7IHR5cGU6ICdBVE9NJywgdmFsdWU6IGJ1aWxkWE9BdXRoMlRva2VuKGF1dGgudXNlciwgYXV0aC54b2F1dGgyKSwgc2Vuc2l0aXZlOiB0cnVlIH1cbiAgICAgICAgXVxuICAgICAgfVxuXG4gICAgICBvcHRpb25zLmVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lID0gdHJ1ZSAvLyArIHRhZ2dlZCBlcnJvciByZXNwb25zZSBleHBlY3RzIGFuIGVtcHR5IGxpbmUgaW4gcmV0dXJuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbW1hbmQgPSB7XG4gICAgICAgIGNvbW1hbmQ6ICdsb2dpbicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICB7IHR5cGU6ICdTVFJJTkcnLCB2YWx1ZTogYXV0aC51c2VyIHx8ICcnIH0sXG4gICAgICAgICAgeyB0eXBlOiAnU1RSSU5HJywgdmFsdWU6IGF1dGgucGFzcyB8fCAnJywgc2Vuc2l0aXZlOiB0cnVlIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluLi4uJylcbiAgICBjb25zdCByZXNwb25zZSA9IHRoaXMuZXhlYyhjb21tYW5kLCAnY2FwYWJpbGl0eScsIG9wdGlvbnMpXG4gICAgLypcbiAgICAgKiB1cGRhdGUgcG9zdC1hdXRoIGNhcGFiaWxpdGVzXG4gICAgICogY2FwYWJpbGl0eSBsaXN0IHNob3VsZG4ndCBjb250YWluIGF1dGggcmVsYXRlZCBzdHVmZiBhbnltb3JlXG4gICAgICogYnV0IHNvbWUgbmV3IGV4dGVuc2lvbnMgbWlnaHQgaGF2ZSBwb3BwZWQgdXAgdGhhdCBkbyBub3RcbiAgICAgKiBtYWtlIG11Y2ggc2Vuc2UgaW4gdGhlIG5vbi1hdXRoIHN0YXRlXG4gICAgICovXG4gICAgaWYgKHJlc3BvbnNlLmNhcGFiaWxpdHkgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eS5sZW5ndGgpIHtcbiAgICAgIC8vIGNhcGFiaWxpdGVzIHdlcmUgbGlzdGVkIHdpdGggdGhlIE9LIFtDQVBBQklMSVRZIC4uLl0gcmVzcG9uc2VcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5jYXBhYmlsaXR5XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5wYXlsb2FkICYmIHJlc3BvbnNlLnBheWxvYWQuQ0FQQUJJTElUWSAmJiByZXNwb25zZS5wYXlsb2FkLkNBUEFCSUxJVFkubGVuZ3RoKSB7XG4gICAgICAvLyBjYXBhYmlsaXRlcyB3ZXJlIGxpc3RlZCB3aXRoICogQ0FQQUJJTElUWSAuLi4gcmVzcG9uc2VcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5wYXlsb2FkLkNBUEFCSUxJVFkucG9wKCkuYXR0cmlidXRlcy5tYXAoKGNhcGEgPSAnJykgPT4gY2FwYS52YWx1ZS50b1VwcGVyQ2FzZSgpLnRyaW0oKSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2FwYWJpbGl0aWVzIHdlcmUgbm90IGF1dG9tYXRpY2FsbHkgbGlzdGVkLCByZWxvYWRcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ2FwYWJpbGl0eSh0cnVlKVxuICAgIH1cblxuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0FVVEhFTlRJQ0FURUQpXG4gICAgdGhpcy5fYXV0aGVudGljYXRlZCA9IHRydWVcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTG9naW4gc3VjY2Vzc2Z1bCwgcG9zdC1hdXRoIGNhcGFiaWxpdGVzIHVwZGF0ZWQhJywgdGhpcy5fY2FwYWJpbGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYW4gSU1BUCBjb21tYW5kLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdCBTdHJ1Y3R1cmVkIHJlcXVlc3Qgb2JqZWN0XG4gICAqIEBwYXJhbSB7QXJyYXl9IGFjY2VwdFVudGFnZ2VkIGEgbGlzdCBvZiB1bnRhZ2dlZCByZXNwb25zZXMgdGhhdCB3aWxsIGJlIGluY2x1ZGVkIGluICdwYXlsb2FkJyBwcm9wZXJ0eVxuICAgKi9cbiAgYXN5bmMgZXhlYyAocmVxdWVzdCwgYWNjZXB0VW50YWdnZWQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmJyZWFrSWRsZSgpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNsaWVudC5lbnF1ZXVlQ29tbWFuZChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucylcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eSkge1xuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLmNhcGFiaWxpdHlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICAvKipcbiAgICogVGhlIGNvbm5lY3Rpb24gaXMgaWRsaW5nLiBTZW5kcyBhIE5PT1Agb3IgSURMRSBjb21tYW5kXG4gICAqXG4gICAqIElETEUgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjE3N1xuICAgKi9cbiAgZW50ZXJJZGxlICgpIHtcbiAgICBpZiAodGhpcy5fZW50ZXJlZElkbGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignSURMRScpID49IDAgPyAnSURMRScgOiAnTk9PUCdcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW50ZXJpbmcgaWRsZSB3aXRoICcgKyB0aGlzLl9lbnRlcmVkSWRsZSlcblxuICAgIGlmICh0aGlzLl9lbnRlcmVkSWRsZSA9PT0gJ05PT1AnKSB7XG4gICAgICB0aGlzLl9pZGxlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU2VuZGluZyBOT09QJylcbiAgICAgICAgdGhpcy5leGVjKCdOT09QJylcbiAgICAgIH0sIHRoaXMudGltZW91dE5vb3ApXG4gICAgfSBlbHNlIGlmICh0aGlzLl9lbnRlcmVkSWRsZSA9PT0gJ0lETEUnKSB7XG4gICAgICB0aGlzLmNsaWVudC5lbnF1ZXVlQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdJRExFJ1xuICAgICAgfSlcbiAgICAgIHRoaXMuX2lkbGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xpZW50LnNlbmQoJ0RPTkVcXHJcXG4nKVxuICAgICAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IGZhbHNlXG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdJZGxlIHRlcm1pbmF0ZWQnKVxuICAgICAgfSwgdGhpcy50aW1lb3V0SWRsZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgYWN0aW9ucyByZWxhdGVkIGlkbGluZywgaWYgSURMRSBpcyBzdXBwb3J0ZWQsIHNlbmRzIERPTkUgdG8gc3RvcCBpdFxuICAgKi9cbiAgYnJlYWtJZGxlICgpIHtcbiAgICBpZiAoIXRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gICAgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnSURMRScpIHtcbiAgICAgIHRoaXMuY2xpZW50LnNlbmQoJ0RPTkVcXHJcXG4nKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0lkbGUgdGVybWluYXRlZCcpXG4gICAgfVxuICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNUQVJUVExTIGNvbW1hbmQgaWYgbmVlZGVkXG4gICAqXG4gICAqIFNUQVJUVExTIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMi4xXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlZF0gQnkgZGVmYXVsdCB0aGUgY29tbWFuZCBpcyBub3QgcnVuIGlmIGNhcGFiaWxpdHkgaXMgYWxyZWFkeSBsaXN0ZWQuIFNldCB0byB0cnVlIHRvIHNraXAgdGhpcyB2YWxpZGF0aW9uXG4gICAqL1xuICBhc3luYyB1cGdyYWRlQ29ubmVjdGlvbiAoKSB7XG4gICAgLy8gc2tpcCByZXF1ZXN0LCBpZiBhbHJlYWR5IHNlY3VyZWRcbiAgICBpZiAodGhpcy5jbGllbnQuc2VjdXJlTW9kZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gc2tpcCBpZiBTVEFSVFRMUyBub3QgYXZhaWxhYmxlIG9yIHN0YXJ0dGxzIHN1cHBvcnQgZGlzYWJsZWRcbiAgICBpZiAoKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignU1RBUlRUTFMnKSA8IDAgfHwgdGhpcy5faWdub3JlVExTKSAmJiAhdGhpcy5fcmVxdWlyZVRMUykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0VuY3J5cHRpbmcgY29ubmVjdGlvbi4uLicpXG4gICAgYXdhaXQgdGhpcy5leGVjKCdTVEFSVFRMUycpXG4gICAgdGhpcy5fY2FwYWJpbGl0eSA9IFtdXG4gICAgdGhpcy5jbGllbnQudXBncmFkZSgpXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQ2FwYWJpbGl0eSgpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBDQVBBQklMSVRZIGNvbW1hbmRcbiAgICpcbiAgICogQ0FQQUJJTElUWSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjEuMVxuICAgKlxuICAgKiBEb2Vzbid0IHJlZ2lzdGVyIHVudGFnZ2VkIENBUEFCSUxJVFkgaGFuZGxlciBhcyB0aGlzIGlzIGFscmVhZHlcbiAgICogaGFuZGxlZCBieSBnbG9iYWwgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZWRdIEJ5IGRlZmF1bHQgdGhlIGNvbW1hbmQgaXMgbm90IHJ1biBpZiBjYXBhYmlsaXR5IGlzIGFscmVhZHkgbGlzdGVkLiBTZXQgdG8gdHJ1ZSB0byBza2lwIHRoaXMgdmFsaWRhdGlvblxuICAgKi9cbiAgYXN5bmMgdXBkYXRlQ2FwYWJpbGl0eSAoZm9yY2VkKSB7XG4gICAgLy8gc2tpcCByZXF1ZXN0LCBpZiBub3QgZm9yY2VkIHVwZGF0ZSBhbmQgY2FwYWJpbGl0aWVzIGFyZSBhbHJlYWR5IGxvYWRlZFxuICAgIGlmICghZm9yY2VkICYmIHRoaXMuX2NhcGFiaWxpdHkubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiBTVEFSVFRMUyBpcyByZXF1aXJlZCB0aGVuIHNraXAgY2FwYWJpbGl0eSBsaXN0aW5nIGFzIHdlIGFyZSBnb2luZyB0byB0cnlcbiAgICAvLyBTVEFSVFRMUyBhbnl3YXkgYW5kIHdlIHJlLWNoZWNrIGNhcGFiaWxpdGllcyBhZnRlciBjb25uZWN0aW9uIGlzIHNlY3VyZWRcbiAgICBpZiAoIXRoaXMuY2xpZW50LnNlY3VyZU1vZGUgJiYgdGhpcy5fcmVxdWlyZVRMUykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1VwZGF0aW5nIGNhcGFiaWxpdHkuLi4nKVxuICAgIHJldHVybiB0aGlzLmV4ZWMoJ0NBUEFCSUxJVFknKVxuICB9XG5cbiAgaGFzQ2FwYWJpbGl0eSAoY2FwYSA9ICcnKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZihjYXBhLnRvVXBwZXJDYXNlKCkudHJpbSgpKSA+PSAwXG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXJzIGZvciB1bnRhZ2dlZCByZXNwb25zZXNcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGFuIHVudGFnZ2VkIE9LIGluY2x1ZGVzIFtDQVBBQklMSVRZXSB0YWcgYW5kIHVwZGF0ZXMgY2FwYWJpbGl0eSBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZE9rSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eSkge1xuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLmNhcGFiaWxpdHlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBjYXBhYmlsaXR5IG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5fY2FwYWJpbGl0eSA9IHBpcGUoXG4gICAgICBwcm9wT3IoW10sICdhdHRyaWJ1dGVzJyksXG4gICAgICBtYXAoKHt2YWx1ZX0pID0+ICh2YWx1ZSB8fCAnJykudG9VcHBlckNhc2UoKS50cmltKCkpXG4gICAgKShyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGV4aXN0aW5nIG1lc3NhZ2UgY291bnRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZEV4aXN0c0hhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmhhc093blByb3BlcnR5KCducicpKSB7XG4gICAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZXhpc3RzJywgcmVzcG9uc2UubnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBhIG1lc3NhZ2UgaGFzIGJlZW4gZGVsZXRlZFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmhhc093blByb3BlcnR5KCducicpKSB7XG4gICAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZXhwdW5nZScsIHJlc3BvbnNlLm5yKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCBmbGFncyBoYXZlIGJlZW4gdXBkYXRlZCBmb3IgYSBtZXNzYWdlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRGZXRjaEhhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5vbnVwZGF0ZSAmJiB0aGlzLm9udXBkYXRlKHRoaXMuX3NlbGVjdGVkTWFpbGJveCwgJ2ZldGNoJywgW10uY29uY2F0KHBhcnNlRkVUQ0goeyBwYXlsb2FkOiB7IEZFVENIOiBbcmVzcG9uc2VdIH0gfSkgfHwgW10pLnNoaWZ0KCkpXG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlcnNcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHRoYXQgdGhlIGNvbm5lY3Rpb24gc3RhcnRlZCBpZGxpbmcuIEluaXRpYXRlcyBhIGN5Y2xlXG4gICAqIG9mIE5PT1BzIG9yIElETEVzIHRvIHJlY2VpdmUgbm90aWZpY2F0aW9ucyBhYm91dCB1cGRhdGVzIGluIHRoZSBzZXJ2ZXJcbiAgICovXG4gIF9vbklkbGUgKCkge1xuICAgIGlmICghdGhpcy5fYXV0aGVudGljYXRlZCB8fCB0aGlzLl9lbnRlcmVkSWRsZSkge1xuICAgICAgLy8gTm8gbmVlZCB0byBJRExFIHdoZW4gbm90IGxvZ2dlZCBpbiBvciBhbHJlYWR5IGlkbGluZ1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NsaWVudCBzdGFydGVkIGlkbGluZycpXG4gICAgdGhpcy5lbnRlcklkbGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIElNQVAgc3RhdGUgdmFsdWUgZm9yIHRoZSBjdXJyZW50IGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5ld1N0YXRlIFRoZSBzdGF0ZSB5b3Ugd2FudCB0byBjaGFuZ2UgdG9cbiAgICovXG4gIF9jaGFuZ2VTdGF0ZSAobmV3U3RhdGUpIHtcbiAgICBpZiAobmV3U3RhdGUgPT09IHRoaXMuX3N0YXRlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW50ZXJpbmcgc3RhdGU6ICcgKyBuZXdTdGF0ZSlcblxuICAgIC8vIGlmIGEgbWFpbGJveCB3YXMgb3BlbmVkLCBlbWl0IG9uY2xvc2VtYWlsYm94IGFuZCBjbGVhciBzZWxlY3RlZE1haWxib3ggdmFsdWVcbiAgICBpZiAodGhpcy5fc3RhdGUgPT09IFNUQVRFX1NFTEVDVEVEICYmIHRoaXMuX3NlbGVjdGVkTWFpbGJveCkge1xuICAgICAgdGhpcy5vbmNsb3NlbWFpbGJveCAmJiB0aGlzLm9uY2xvc2VtYWlsYm94KHRoaXMuX3NlbGVjdGVkTWFpbGJveClcbiAgICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fc3RhdGUgPSBuZXdTdGF0ZVxuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgYSBwYXRoIGV4aXN0cyBpbiB0aGUgTWFpbGJveCB0cmVlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmVlIE1haWxib3ggdHJlZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVsaW1pdGVyXG4gICAqIEByZXR1cm4ge09iamVjdH0gYnJhbmNoIGZvciB1c2VkIHBhdGhcbiAgICovXG4gIF9lbnN1cmVQYXRoICh0cmVlLCBwYXRoLCBkZWxpbWl0ZXIpIHtcbiAgICBjb25zdCBuYW1lcyA9IHBhdGguc3BsaXQoZGVsaW1pdGVyKVxuICAgIGxldCBicmFuY2ggPSB0cmVlXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBicmFuY2guY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBhcmVNYWlsYm94TmFtZXMoYnJhbmNoLmNoaWxkcmVuW2pdLm5hbWUsIGltYXBEZWNvZGUobmFtZXNbaV0pKSkge1xuICAgICAgICAgIGJyYW5jaCA9IGJyYW5jaC5jaGlsZHJlbltqXVxuICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgYnJhbmNoLmNoaWxkcmVuLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGltYXBEZWNvZGUobmFtZXNbaV0pLFxuICAgICAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLFxuICAgICAgICAgIHBhdGg6IG5hbWVzLnNsaWNlKDAsIGkgKyAxKS5qb2luKGRlbGltaXRlciksXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH0pXG4gICAgICAgIGJyYW5jaCA9IGJyYW5jaC5jaGlsZHJlblticmFuY2guY2hpbGRyZW4ubGVuZ3RoIC0gMV1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaFxuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIHR3byBtYWlsYm94IG5hbWVzLiBDYXNlIGluc2Vuc2l0aXZlIGluIGNhc2Ugb2YgSU5CT1gsIG90aGVyd2lzZSBjYXNlIHNlbnNpdGl2ZVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYSBNYWlsYm94IG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGIgTWFpbGJveCBuYW1lXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBmb2xkZXIgbmFtZXMgbWF0Y2hcbiAgICovXG4gIF9jb21wYXJlTWFpbGJveE5hbWVzIChhLCBiKSB7XG4gICAgcmV0dXJuIChhLnRvVXBwZXJDYXNlKCkgPT09ICdJTkJPWCcgPyAnSU5CT1gnIDogYSkgPT09IChiLnRvVXBwZXJDYXNlKCkgPT09ICdJTkJPWCcgPyAnSU5CT1gnIDogYilcbiAgfVxuXG4gIGNyZWF0ZUxvZ2dlciAoY3JlYXRvciA9IGNyZWF0ZURlZmF1bHRMb2dnZXIpIHtcbiAgICBjb25zdCBsb2dnZXIgPSBjcmVhdG9yKHRoaXMuX2F1dGgudXNlciB8fCAnJywgdGhpcy5faG9zdClcbiAgICB0aGlzLmxvZ2dlciA9IHRoaXMuY2xpZW50LmxvZ2dlciA9IHtcbiAgICAgIGRlYnVnOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX0RFQlVHID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLmRlYnVnKG1zZ3MpIH0gfSxcbiAgICAgIGluZm86ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfSU5GTyA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci5pbmZvKG1zZ3MpIH0gfSxcbiAgICAgIHdhcm46ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfV0FSTiA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci53YXJuKG1zZ3MpIH0gfSxcbiAgICAgIGVycm9yOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX0VSUk9SID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLmVycm9yKG1zZ3MpIH0gfVxuICAgIH1cbiAgfVxufVxuIl19