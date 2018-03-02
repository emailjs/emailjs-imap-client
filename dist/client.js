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
        if (attr.length < 3) return;

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
        if (attr.length < 3) return;

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
      const response = yield _this16.exec(command, 'capability', options);
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
    const logger = creator((this._auth || {}).user || '', this._host);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiVElNRU9VVF9DT05ORUNUSU9OIiwiVElNRU9VVF9OT09QIiwiVElNRU9VVF9JRExFIiwiU1RBVEVfQ09OTkVDVElORyIsIlNUQVRFX05PVF9BVVRIRU5USUNBVEVEIiwiU1RBVEVfQVVUSEVOVElDQVRFRCIsIlNUQVRFX1NFTEVDVEVEIiwiU1RBVEVfTE9HT1VUIiwiREVGQVVMVF9DTElFTlRfSUQiLCJuYW1lIiwiQ2xpZW50IiwiY29uc3RydWN0b3IiLCJob3N0IiwicG9ydCIsIm9wdGlvbnMiLCJ0aW1lb3V0Q29ubmVjdGlvbiIsInRpbWVvdXROb29wIiwidGltZW91dElkbGUiLCJzZXJ2ZXJJZCIsIm9uY2VydCIsIm9udXBkYXRlIiwib25zZWxlY3RtYWlsYm94Iiwib25jbG9zZW1haWxib3giLCJfaG9zdCIsIl9jbGllbnRJZCIsIl9zdGF0ZSIsIl9hdXRoZW50aWNhdGVkIiwiX2NhcGFiaWxpdHkiLCJfc2VsZWN0ZWRNYWlsYm94IiwiX2VudGVyZWRJZGxlIiwiX2lkbGVUaW1lb3V0IiwiX2VuYWJsZUNvbXByZXNzaW9uIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJfYXV0aCIsImF1dGgiLCJfcmVxdWlyZVRMUyIsInJlcXVpcmVUTFMiLCJfaWdub3JlVExTIiwiaWdub3JlVExTIiwiY2xpZW50Iiwib25lcnJvciIsIl9vbkVycm9yIiwiYmluZCIsImNlcnQiLCJvbmlkbGUiLCJfb25JZGxlIiwic2V0SGFuZGxlciIsInJlc3BvbnNlIiwiX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIiLCJfdW50YWdnZWRPa0hhbmRsZXIiLCJfdW50YWdnZWRFeGlzdHNIYW5kbGVyIiwiX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIiLCJfdW50YWdnZWRGZXRjaEhhbmRsZXIiLCJjcmVhdGVMb2dnZXIiLCJsb2dMZXZlbCIsImVyciIsImNsZWFyVGltZW91dCIsImNvbm5lY3QiLCJfb3BlbkNvbm5lY3Rpb24iLCJfY2hhbmdlU3RhdGUiLCJ1cGRhdGVDYXBhYmlsaXR5IiwidXBncmFkZUNvbm5lY3Rpb24iLCJ1cGRhdGVJZCIsImxvZ2dlciIsIndhcm4iLCJtZXNzYWdlIiwibG9naW4iLCJjb21wcmVzc0Nvbm5lY3Rpb24iLCJkZWJ1ZyIsImVycm9yIiwiY2xvc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNvbm5lY3Rpb25UaW1lb3V0Iiwic2V0VGltZW91dCIsIkVycm9yIiwidGhlbiIsIm9ucmVhZHkiLCJjYXRjaCIsImxvZ291dCIsImlkIiwiaW5kZXhPZiIsImNvbW1hbmQiLCJhdHRyaWJ1dGVzIiwiT2JqZWN0IiwiZW50cmllcyIsImV4ZWMiLCJsaXN0IiwibWFwIiwidmFsdWVzIiwia2V5cyIsImZpbHRlciIsIl8iLCJpIiwiX3Nob3VsZFNlbGVjdE1haWxib3giLCJwYXRoIiwiY3R4IiwicHJldmlvdXNTZWxlY3QiLCJnZXRQcmV2aW91c2x5UXVldWVkIiwicmVxdWVzdCIsInBhdGhBdHRyaWJ1dGUiLCJmaW5kIiwiYXR0cmlidXRlIiwidHlwZSIsInZhbHVlIiwic2VsZWN0TWFpbGJveCIsInF1ZXJ5IiwicmVhZE9ubHkiLCJjb25kc3RvcmUiLCJwdXNoIiwibWFpbGJveEluZm8iLCJsaXN0TmFtZXNwYWNlcyIsImxpc3RNYWlsYm94ZXMiLCJ0cmVlIiwicm9vdCIsImNoaWxkcmVuIiwibGlzdFJlc3BvbnNlIiwiZm9yRWFjaCIsImF0dHIiLCJpdGVtIiwibGVuZ3RoIiwiZGVsaW0iLCJicmFuY2giLCJfZW5zdXJlUGF0aCIsImZsYWdzIiwibGlzdGVkIiwibHN1YlJlc3BvbnNlIiwibHN1YiIsImZsYWciLCJzdWJzY3JpYmVkIiwiY3JlYXRlTWFpbGJveCIsImNvZGUiLCJsaXN0TWVzc2FnZXMiLCJzZXF1ZW5jZSIsIml0ZW1zIiwiZmFzdCIsInByZWNoZWNrIiwic2VhcmNoIiwic2V0RmxhZ3MiLCJrZXkiLCJBcnJheSIsImlzQXJyYXkiLCJjb25jYXQiLCJhZGQiLCJzZXQiLCJyZW1vdmUiLCJzdG9yZSIsImFjdGlvbiIsInVwbG9hZCIsImRlc3RpbmF0aW9uIiwiZGVsZXRlTWVzc2FnZXMiLCJ1c2VVaWRQbHVzIiwiYnlVaWQiLCJ1aWRFeHB1bmdlQ29tbWFuZCIsImNtZCIsImNvcHlNZXNzYWdlcyIsImh1bWFuUmVhZGFibGUiLCJtb3ZlTWVzc2FnZXMiLCJjb21wcmVzc2VkIiwieG9hdXRoMiIsInVzZXIiLCJzZW5zaXRpdmUiLCJlcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSIsInBhc3MiLCJjYXBhYmlsaXR5IiwicGF5bG9hZCIsIkNBUEFCSUxJVFkiLCJwb3AiLCJjYXBhIiwidG9VcHBlckNhc2UiLCJ0cmltIiwiYWNjZXB0VW50YWdnZWQiLCJicmVha0lkbGUiLCJlbnF1ZXVlQ29tbWFuZCIsImVudGVySWRsZSIsInNlbmQiLCJzZWN1cmVNb2RlIiwidXBncmFkZSIsImZvcmNlZCIsImhhc0NhcGFiaWxpdHkiLCJoYXNPd25Qcm9wZXJ0eSIsIm5yIiwiRkVUQ0giLCJzaGlmdCIsIm5ld1N0YXRlIiwiZGVsaW1pdGVyIiwibmFtZXMiLCJzcGxpdCIsImZvdW5kIiwiaiIsIl9jb21wYXJlTWFpbGJveE5hbWVzIiwic2xpY2UiLCJqb2luIiwiYSIsImIiLCJjcmVhdG9yIiwibXNncyIsImluZm8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFNQTs7QUFPQTs7OztBQUNBOzs7O0FBQ0E7O0FBUUE7Ozs7OztBQUlPLE1BQU1BLGtEQUFxQixLQUFLLElBQWhDLEMsQ0FBcUM7QUFDckMsTUFBTUMsc0NBQWUsS0FBSyxJQUExQixDLENBQStCO0FBQy9CLE1BQU1DLHNDQUFlLEtBQUssSUFBMUIsQyxDQUErQjs7QUFFL0IsTUFBTUMsOENBQW1CLENBQXpCO0FBQ0EsTUFBTUMsNERBQTBCLENBQWhDO0FBQ0EsTUFBTUMsb0RBQXNCLENBQTVCO0FBQ0EsTUFBTUMsMENBQWlCLENBQXZCO0FBQ0EsTUFBTUMsc0NBQWUsQ0FBckI7O0FBRUEsTUFBTUMsZ0RBQW9C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V0FBRixPQUFvQixPQUFwQixHQUE4QixPQUE5QixHQUF3Q3lCLENBQXpGLENBQVA7QUFDRDs7QUFFRDlJLGVBQWMrSSwwQkFBZCxFQUE2QztBQUMzQyxVQUFNckksU0FBU3FJLFFBQVEsQ0FBQyxLQUFLbkssS0FBTCxJQUFjLEVBQWYsRUFBbUJnSSxJQUFuQixJQUEyQixFQUFuQyxFQUF1QyxLQUFLMUksS0FBNUMsQ0FBZjtBQUNBLFNBQUt3QyxNQUFMLEdBQWMsS0FBS3hCLE1BQUwsQ0FBWXdCLE1BQVosR0FBcUI7QUFDakNLLGFBQU8sQ0FBQyxHQUFHaUksSUFBSixLQUFhO0FBQUUsWUFBSSwyQkFBbUIsS0FBSy9JLFFBQTVCLEVBQXNDO0FBQUVTLGlCQUFPSyxLQUFQLENBQWFpSSxJQUFiO0FBQW9CO0FBQUUsT0FEbkQ7QUFFakNDLFlBQU0sQ0FBQyxHQUFHRCxJQUFKLEtBQWE7QUFBRSxZQUFJLDBCQUFrQixLQUFLL0ksUUFBM0IsRUFBcUM7QUFBRVMsaUJBQU91SSxJQUFQLENBQVlELElBQVo7QUFBbUI7QUFBRSxPQUZoRDtBQUdqQ3JJLFlBQU0sQ0FBQyxHQUFHcUksSUFBSixLQUFhO0FBQUUsWUFBSSwwQkFBa0IsS0FBSy9JLFFBQTNCLEVBQXFDO0FBQUVTLGlCQUFPQyxJQUFQLENBQVlxSSxJQUFaO0FBQW1CO0FBQUUsT0FIaEQ7QUFJakNoSSxhQUFPLENBQUMsR0FBR2dJLElBQUosS0FBYTtBQUFFLFlBQUksMkJBQW1CLEtBQUsvSSxRQUE1QixFQUFzQztBQUFFUyxpQkFBT00sS0FBUCxDQUFhZ0ksSUFBYjtBQUFvQjtBQUFFO0FBSm5ELEtBQW5DO0FBTUQ7QUFuM0J5QjtrQkFBUDNMLE0iLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWFwLCBwaXBlLCB1bmlvbiwgemlwLCBmcm9tUGFpcnMsIHByb3BPciwgcGF0aE9yLCBmbGF0dGVuIH0gZnJvbSAncmFtZGEnXG5pbXBvcnQgeyBpbWFwRW5jb2RlLCBpbWFwRGVjb2RlIH0gZnJvbSAnZW1haWxqcy11dGY3J1xuaW1wb3J0IHtcbiAgcGFyc2VOQU1FU1BBQ0UsXG4gIHBhcnNlU0VMRUNULFxuICBwYXJzZUZFVENILFxuICBwYXJzZVNFQVJDSFxufSBmcm9tICcuL2NvbW1hbmQtcGFyc2VyJ1xuaW1wb3J0IHtcbiAgYnVpbGRGRVRDSENvbW1hbmQsXG4gIGJ1aWxkWE9BdXRoMlRva2VuLFxuICBidWlsZFNFQVJDSENvbW1hbmQsXG4gIGJ1aWxkU1RPUkVDb21tYW5kXG59IGZyb20gJy4vY29tbWFuZC1idWlsZGVyJ1xuXG5pbXBvcnQgY3JlYXRlRGVmYXVsdExvZ2dlciBmcm9tICcuL2xvZ2dlcidcbmltcG9ydCBJbWFwQ2xpZW50IGZyb20gJy4vaW1hcCdcbmltcG9ydCB7XG4gIExPR19MRVZFTF9FUlJPUixcbiAgTE9HX0xFVkVMX1dBUk4sXG4gIExPR19MRVZFTF9JTkZPLFxuICBMT0dfTEVWRUxfREVCVUcsXG4gIExPR19MRVZFTF9BTExcbn0gZnJvbSAnLi9jb21tb24nXG5cbmltcG9ydCB7XG4gIGNoZWNrU3BlY2lhbFVzZVxufSBmcm9tICcuL3NwZWNpYWwtdXNlJ1xuXG5leHBvcnQgY29uc3QgVElNRU9VVF9DT05ORUNUSU9OID0gOTAgKiAxMDAwIC8vIE1pbGxpc2Vjb25kcyB0byB3YWl0IGZvciB0aGUgSU1BUCBncmVldGluZyBmcm9tIHRoZSBzZXJ2ZXJcbmV4cG9ydCBjb25zdCBUSU1FT1VUX05PT1AgPSA2MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIGJldHdlZW4gTk9PUCBjb21tYW5kcyB3aGlsZSBpZGxpbmdcbmV4cG9ydCBjb25zdCBUSU1FT1VUX0lETEUgPSA2MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIHVudGlsIElETEUgY29tbWFuZCBpcyBjYW5jZWxsZWRcblxuZXhwb3J0IGNvbnN0IFNUQVRFX0NPTk5FQ1RJTkcgPSAxXG5leHBvcnQgY29uc3QgU1RBVEVfTk9UX0FVVEhFTlRJQ0FURUQgPSAyXG5leHBvcnQgY29uc3QgU1RBVEVfQVVUSEVOVElDQVRFRCA9IDNcbmV4cG9ydCBjb25zdCBTVEFURV9TRUxFQ1RFRCA9IDRcbmV4cG9ydCBjb25zdCBTVEFURV9MT0dPVVQgPSA1XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NMSUVOVF9JRCA9IHtcbiAgbmFtZTogJ2VtYWlsanMtaW1hcC1jbGllbnQnXG59XG5cbi8qKlxuICogZW1haWxqcyBJTUFQIGNsaWVudFxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbaG9zdD0nbG9jYWxob3N0J10gSG9zdG5hbWUgdG8gY29uZW5jdCB0b1xuICogQHBhcmFtIHtOdW1iZXJ9IFtwb3J0PTE0M10gUG9ydCBudW1iZXIgdG8gY29ubmVjdCB0b1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25hbCBvcHRpb25zIG9iamVjdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGllbnQge1xuICBjb25zdHJ1Y3RvciAoaG9zdCwgcG9ydCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy50aW1lb3V0Q29ubmVjdGlvbiA9IFRJTUVPVVRfQ09OTkVDVElPTlxuICAgIHRoaXMudGltZW91dE5vb3AgPSBUSU1FT1VUX05PT1BcbiAgICB0aGlzLnRpbWVvdXRJZGxlID0gVElNRU9VVF9JRExFXG5cbiAgICB0aGlzLnNlcnZlcklkID0gZmFsc2UgLy8gUkZDIDI5NzEgU2VydmVyIElEIGFzIGtleSB2YWx1ZSBwYWlyc1xuXG4gICAgLy8gRXZlbnQgcGxhY2Vob2xkZXJzXG4gICAgdGhpcy5vbmNlcnQgPSBudWxsXG4gICAgdGhpcy5vbnVwZGF0ZSA9IG51bGxcbiAgICB0aGlzLm9uc2VsZWN0bWFpbGJveCA9IG51bGxcbiAgICB0aGlzLm9uY2xvc2VtYWlsYm94ID0gbnVsbFxuXG4gICAgdGhpcy5faG9zdCA9IGhvc3RcbiAgICB0aGlzLl9jbGllbnRJZCA9IHByb3BPcihERUZBVUxUX0NMSUVOVF9JRCwgJ2lkJywgb3B0aW9ucylcbiAgICB0aGlzLl9zdGF0ZSA9IGZhbHNlIC8vIEN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gZmFsc2UgLy8gSXMgdGhlIGNvbm5lY3Rpb24gYXV0aGVudGljYXRlZFxuICAgIHRoaXMuX2NhcGFiaWxpdHkgPSBbXSAvLyBMaXN0IG9mIGV4dGVuc2lvbnMgdGhlIHNlcnZlciBzdXBwb3J0c1xuICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IGZhbHNlIC8vIFNlbGVjdGVkIG1haWxib3hcbiAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IGZhbHNlXG4gICAgdGhpcy5faWRsZVRpbWVvdXQgPSBmYWxzZVxuICAgIHRoaXMuX2VuYWJsZUNvbXByZXNzaW9uID0gISFvcHRpb25zLmVuYWJsZUNvbXByZXNzaW9uXG4gICAgdGhpcy5fYXV0aCA9IG9wdGlvbnMuYXV0aFxuICAgIHRoaXMuX3JlcXVpcmVUTFMgPSAhIW9wdGlvbnMucmVxdWlyZVRMU1xuICAgIHRoaXMuX2lnbm9yZVRMUyA9ICEhb3B0aW9ucy5pZ25vcmVUTFNcblxuICAgIHRoaXMuY2xpZW50ID0gbmV3IEltYXBDbGllbnQoaG9zdCwgcG9ydCwgb3B0aW9ucykgLy8gSU1BUCBjbGllbnQgb2JqZWN0XG5cbiAgICAvLyBFdmVudCBIYW5kbGVyc1xuICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcylcbiAgICB0aGlzLmNsaWVudC5vbmNlcnQgPSAoY2VydCkgPT4gKHRoaXMub25jZXJ0ICYmIHRoaXMub25jZXJ0KGNlcnQpKSAvLyBhbGxvd3MgY2VydGlmaWNhdGUgaGFuZGxpbmcgZm9yIHBsYXRmb3JtcyB3L28gbmF0aXZlIHRscyBzdXBwb3J0XG4gICAgdGhpcy5jbGllbnQub25pZGxlID0gKCkgPT4gdGhpcy5fb25JZGxlKCkgLy8gc3RhcnQgaWRsaW5nXG5cbiAgICAvLyBEZWZhdWx0IGhhbmRsZXJzIGZvciB1bnRhZ2dlZCByZXNwb25zZXNcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdjYXBhYmlsaXR5JywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyKHJlc3BvbnNlKSkgLy8gY2FwYWJpbGl0eSB1cGRhdGVzXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignb2snLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkT2tIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbm90aWZpY2F0aW9uc1xuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2V4aXN0cycsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRFeGlzdHNIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbWVzc2FnZSBjb3VudCBoYXMgY2hhbmdlZFxuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2V4cHVuZ2UnLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGhhcyBiZWVuIGRlbGV0ZWRcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdmZXRjaCcsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRGZXRjaEhhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGhhcyBiZWVuIHVwZGF0ZWQgKGVnLiBmbGFnIGNoYW5nZSlcblxuICAgIC8vIEFjdGl2YXRlIGxvZ2dpbmdcbiAgICB0aGlzLmNyZWF0ZUxvZ2dlcigpXG4gICAgdGhpcy5sb2dMZXZlbCA9IHByb3BPcihMT0dfTEVWRUxfQUxMLCAnbG9nTGV2ZWwnLCBvcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBpZiB0aGUgbG93ZXItbGV2ZWwgSW1hcENsaWVudCBoYXMgZW5jb3VudGVyZWQgYW4gdW5yZWNvdmVyYWJsZVxuICAgKiBlcnJvciBkdXJpbmcgb3BlcmF0aW9uLiBDbGVhbnMgdXAgYW5kIHByb3BhZ2F0ZXMgdGhlIGVycm9yIHVwd2FyZHMuXG4gICAqL1xuICBfb25FcnJvciAoZXJyKSB7XG4gICAgLy8gbWFrZSBzdXJlIG5vIGlkbGUgdGltZW91dCBpcyBwZW5kaW5nIGFueW1vcmVcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG5cbiAgICAvLyBwcm9wYWdhdGUgdGhlIGVycm9yIHVwd2FyZHNcbiAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycilcbiAgfVxuXG4gIC8vXG4gIC8vXG4gIC8vIFBVQkxJQyBBUElcbiAgLy9cbiAgLy9cblxuICAvKipcbiAgICogSW5pdGlhdGUgY29ubmVjdGlvbiB0byB0aGUgSU1BUCBzZXJ2ZXJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hlbiBsb2dpbiBwcm9jZWR1cmUgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIGNvbm5lY3QgKCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9vcGVuQ29ubmVjdGlvbigpXG4gICAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9OT1RfQVVUSEVOVElDQVRFRClcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ2FwYWJpbGl0eSgpXG4gICAgICBhd2FpdCB0aGlzLnVwZ3JhZGVDb25uZWN0aW9uKClcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlSWQodGhpcy5fY2xpZW50SWQpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybignRmFpbGVkIHRvIHVwZGF0ZSBzZXJ2ZXIgaWQhJywgZXJyLm1lc3NhZ2UpXG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMubG9naW4odGhpcy5fYXV0aClcbiAgICAgIGF3YWl0IHRoaXMuY29tcHJlc3NDb25uZWN0aW9uKClcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25uZWN0aW9uIGVzdGFibGlzaGVkLCByZWFkeSB0byByb2xsIScpXG4gICAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyJywgZXJyKVxuICAgICAgdGhpcy5jbG9zZShlcnIpIC8vIHdlIGRvbid0IHJlYWxseSBjYXJlIHdoZXRoZXIgdGhpcyB3b3JrcyBvciBub3RcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIF9vcGVuQ29ubmVjdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBjb25uZWN0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KG5ldyBFcnJvcignVGltZW91dCBjb25uZWN0aW5nIHRvIHNlcnZlcicpKSwgdGhpcy50aW1lb3V0Q29ubmVjdGlvbilcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25uZWN0aW5nIHRvJywgdGhpcy5jbGllbnQuaG9zdCwgJzonLCB0aGlzLmNsaWVudC5wb3J0KVxuICAgICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfQ09OTkVDVElORylcbiAgICAgIHRoaXMuY2xpZW50LmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NvY2tldCBvcGVuZWQsIHdhaXRpbmcgZm9yIGdyZWV0aW5nIGZyb20gdGhlIHNlcnZlci4uLicpXG5cbiAgICAgICAgdGhpcy5jbGllbnQub25yZWFkeSA9ICgpID0+IHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXQpXG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjb25uZWN0aW9uVGltZW91dClcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dvdXRcbiAgICpcbiAgICogU2VuZCBMT0dPVVQsIHRvIHdoaWNoIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgYnkgY2xvc2luZyB0aGUgY29ubmVjdGlvbi5cbiAgICogVXNlIGlzIGRpc2NvdXJhZ2VkIGlmIG5ldHdvcmsgc3RhdHVzIGlzIHVuY2xlYXIhIElmIG5ldHdvcmtzIHN0YXR1cyBpc1xuICAgKiB1bmNsZWFyLCBwbGVhc2UgdXNlICNjbG9zZSBpbnN0ZWFkIVxuICAgKlxuICAgKiBMT0dPVVQgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMS4zXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNlcnZlciBoYXMgY2xvc2VkIHRoZSBjb25uZWN0aW9uXG4gICAqL1xuICBhc3luYyBsb2dvdXQgKCkge1xuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0xPR09VVClcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTG9nZ2luZyBvdXQuLi4nKVxuICAgIGF3YWl0IHRoaXMuY2xpZW50LmxvZ291dCgpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlLWNsb3NlcyB0aGUgY3VycmVudCBjb25uZWN0aW9uIGJ5IGNsb3NpbmcgdGhlIFRDUCBzb2NrZXQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNvY2tldCBpcyBjbG9zZWRcbiAgICovXG4gIGFzeW5jIGNsb3NlIChlcnIpIHtcbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9MT0dPVVQpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDbG9zaW5nIGNvbm5lY3Rpb24uLi4nKVxuICAgIGF3YWl0IHRoaXMuY2xpZW50LmNsb3NlKGVycilcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBJRCBjb21tYW5kLCBwYXJzZXMgSUQgcmVzcG9uc2UsIHNldHMgdGhpcy5zZXJ2ZXJJZFxuICAgKlxuICAgKiBJRCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzI5NzFcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGlkIElEIGFzIEpTT04gb2JqZWN0LiBTZWUgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjk3MSNzZWN0aW9uLTMuMyBmb3IgcG9zc2libGUgdmFsdWVzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHJlc3BvbnNlIGhhcyBiZWVuIHBhcnNlZFxuICAgKi9cbiAgYXN5bmMgdXBkYXRlSWQgKGlkKSB7XG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignSUQnKSA8IDApIHJldHVyblxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1VwZGF0aW5nIGlkLi4uJylcblxuICAgIGNvbnN0IGNvbW1hbmQgPSAnSUQnXG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGlkID8gWyBmbGF0dGVuKE9iamVjdC5lbnRyaWVzKGlkKSkgXSA6IFsgbnVsbCBdXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kLCBhdHRyaWJ1dGVzIH0sICdJRCcpXG4gICAgY29uc3QgbGlzdCA9IGZsYXR0ZW4ocGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnSUQnLCAnMCcsICdhdHRyaWJ1dGVzJywgJzAnXSwgcmVzcG9uc2UpLm1hcChPYmplY3QudmFsdWVzKSlcbiAgICBjb25zdCBrZXlzID0gbGlzdC5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAwKVxuICAgIGNvbnN0IHZhbHVlcyA9IGxpc3QuZmlsdGVyKChfLCBpKSA9PiBpICUgMiA9PT0gMSlcbiAgICB0aGlzLnNlcnZlcklkID0gZnJvbVBhaXJzKHppcChrZXlzLCB2YWx1ZXMpKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZXJ2ZXIgaWQgdXBkYXRlZCEnLCB0aGlzLnNlcnZlcklkKVxuICB9XG5cbiAgX3Nob3VsZFNlbGVjdE1haWxib3ggKHBhdGgsIGN0eCkge1xuICAgIGlmICghY3R4KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzU2VsZWN0ID0gdGhpcy5jbGllbnQuZ2V0UHJldmlvdXNseVF1ZXVlZChbJ1NFTEVDVCcsICdFWEFNSU5FJ10sIGN0eClcbiAgICBpZiAocHJldmlvdXNTZWxlY3QgJiYgcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBwYXRoQXR0cmlidXRlID0gcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzLmZpbmQoKGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlLnR5cGUgPT09ICdTVFJJTkcnKVxuICAgICAgaWYgKHBhdGhBdHRyaWJ1dGUpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhBdHRyaWJ1dGUudmFsdWUgIT09IHBhdGhcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNYWlsYm94ICE9PSBwYXRoXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTRUxFQ1Qgb3IgRVhBTUlORSB0byBvcGVuIGEgbWFpbGJveFxuICAgKlxuICAgKiBTRUxFQ1QgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjFcbiAgICogRVhBTUlORSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBGdWxsIHBhdGggdG8gbWFpbGJveFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIHNlbGVjdGVkIG1haWxib3hcbiAgICovXG4gIGFzeW5jIHNlbGVjdE1haWxib3ggKHBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIGNvbW1hbmQ6IG9wdGlvbnMucmVhZE9ubHkgPyAnRVhBTUlORScgOiAnU0VMRUNUJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFt7IHR5cGU6ICdTVFJJTkcnLCB2YWx1ZTogcGF0aCB9XVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNvbmRzdG9yZSAmJiB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0NPTkRTVE9SRScpID49IDApIHtcbiAgICAgIHF1ZXJ5LmF0dHJpYnV0ZXMucHVzaChbeyB0eXBlOiAnQVRPTScsIHZhbHVlOiAnQ09ORFNUT1JFJyB9XSlcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnT3BlbmluZycsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKHF1ZXJ5LCBbJ0VYSVNUUycsICdGTEFHUycsICdPSyddLCB7IGN0eDogb3B0aW9ucy5jdHggfSlcbiAgICBsZXQgbWFpbGJveEluZm8gPSBwYXJzZVNFTEVDVChyZXNwb25zZSlcblxuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX1NFTEVDVEVEKVxuXG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkTWFpbGJveCAhPT0gcGF0aCAmJiB0aGlzLm9uY2xvc2VtYWlsYm94KSB7XG4gICAgICBhd2FpdCB0aGlzLm9uY2xvc2VtYWlsYm94KHRoaXMuX3NlbGVjdGVkTWFpbGJveClcbiAgICB9XG4gICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gcGF0aFxuICAgIGlmICh0aGlzLm9uc2VsZWN0bWFpbGJveCkge1xuICAgICAgYXdhaXQgdGhpcy5vbnNlbGVjdG1haWxib3gocGF0aCwgbWFpbGJveEluZm8pXG4gICAgfVxuXG4gICAgcmV0dXJuIG1haWxib3hJbmZvXG4gIH1cblxuICAvKipcbiAgICogUnVucyBOQU1FU1BBQ0UgY29tbWFuZFxuICAgKlxuICAgKiBOQU1FU1BBQ0UgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjM0MlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIG5hbWVzcGFjZSBvYmplY3RcbiAgICovXG4gIGFzeW5jIGxpc3ROYW1lc3BhY2VzICgpIHtcbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdOQU1FU1BBQ0UnKSA8IDApIHJldHVybiBmYWxzZVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xpc3RpbmcgbmFtZXNwYWNlcy4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoJ05BTUVTUEFDRScsICdOQU1FU1BBQ0UnKVxuICAgIHJldHVybiBwYXJzZU5BTUVTUEFDRShyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIExJU1QgYW5kIExTVUIgY29tbWFuZHMuIFJldHJpZXZlcyBhIHRyZWUgb2YgYXZhaWxhYmxlIG1haWxib3hlc1xuICAgKlxuICAgKiBMSVNUIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy44XG4gICAqIExTVUIgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjlcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBsaXN0IG9mIG1haWxib3hlc1xuICAgKi9cbiAgYXN5bmMgbGlzdE1haWxib3hlcyAoKSB7XG4gICAgY29uc3QgdHJlZSA9IHsgcm9vdDogdHJ1ZSwgY2hpbGRyZW46IFtdIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMaXN0aW5nIG1haWxib3hlcy4uLicpXG4gICAgY29uc3QgbGlzdFJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKHsgY29tbWFuZDogJ0xJU1QnLCBhdHRyaWJ1dGVzOiBbJycsICcqJ10gfSwgJ0xJU1QnKVxuICAgIGNvbnN0IGxpc3QgPSBwYXRoT3IoW10sIFsncGF5bG9hZCcsICdMSVNUJ10sIGxpc3RSZXNwb25zZSlcbiAgICBsaXN0LmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb25zdCBhdHRyID0gcHJvcE9yKFtdLCAnYXR0cmlidXRlcycsIGl0ZW0pXG4gICAgICBpZiAoYXR0ci5sZW5ndGggPCAzKSByZXR1cm5cblxuICAgICAgY29uc3QgcGF0aCA9IHBhdGhPcignJywgWycyJywgJ3ZhbHVlJ10sIGF0dHIpXG4gICAgICBjb25zdCBkZWxpbSA9IHBhdGhPcignLycsIFsnMScsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5fZW5zdXJlUGF0aCh0cmVlLCBwYXRoLCBkZWxpbSlcbiAgICAgIGJyYW5jaC5mbGFncyA9IHByb3BPcihbXSwgJzAnLCBhdHRyKS5tYXAoKHt2YWx1ZX0pID0+IHZhbHVlIHx8ICcnKVxuICAgICAgYnJhbmNoLmxpc3RlZCA9IHRydWVcbiAgICAgIGNoZWNrU3BlY2lhbFVzZShicmFuY2gpXG4gICAgfSlcblxuICAgIGNvbnN0IGxzdWJSZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQ6ICdMU1VCJywgYXR0cmlidXRlczogWycnLCAnKiddIH0sICdMU1VCJylcbiAgICBjb25zdCBsc3ViID0gcGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnTFNVQiddLCBsc3ViUmVzcG9uc2UpXG4gICAgbHN1Yi5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBhdHRyID0gcHJvcE9yKFtdLCAnYXR0cmlidXRlcycsIGl0ZW0pXG4gICAgICBpZiAoYXR0ci5sZW5ndGggPCAzKSByZXR1cm5cblxuICAgICAgY29uc3QgcGF0aCA9IHBhdGhPcignJywgWycyJywgJ3ZhbHVlJ10sIGF0dHIpXG4gICAgICBjb25zdCBkZWxpbSA9IHBhdGhPcignLycsIFsnMScsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5fZW5zdXJlUGF0aCh0cmVlLCBwYXRoLCBkZWxpbSlcbiAgICAgIHByb3BPcihbXSwgJzAnLCBhdHRyKS5tYXAoKGZsYWcgPSAnJykgPT4geyBicmFuY2guZmxhZ3MgPSB1bmlvbihicmFuY2guZmxhZ3MsIFtmbGFnXSkgfSlcbiAgICAgIGJyYW5jaC5zdWJzY3JpYmVkID0gdHJ1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gdHJlZVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG1haWxib3ggd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAgICpcbiAgICogQ1JFQVRFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4zXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqICAgICBUaGUgcGF0aCBvZiB0aGUgbWFpbGJveCB5b3Ugd291bGQgbGlrZSB0byBjcmVhdGUuICBUaGlzIG1ldGhvZCB3aWxsXG4gICAqICAgICBoYW5kbGUgdXRmNyBlbmNvZGluZyBmb3IgeW91LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICogICAgIFByb21pc2UgcmVzb2x2ZXMgaWYgbWFpbGJveCB3YXMgY3JlYXRlZC5cbiAgICogICAgIEluIHRoZSBldmVudCB0aGUgc2VydmVyIHNheXMgTk8gW0FMUkVBRFlFWElTVFNdLCB3ZSB0cmVhdCB0aGF0IGFzIHN1Y2Nlc3MuXG4gICAqL1xuICBhc3luYyBjcmVhdGVNYWlsYm94IChwYXRoKSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NyZWF0aW5nIG1haWxib3gnLCBwYXRoLCAnLi4uJylcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKHsgY29tbWFuZDogJ0NSRUFURScsIGF0dHJpYnV0ZXM6IFtpbWFwRW5jb2RlKHBhdGgpXSB9KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSA9PT0gJ0FMUkVBRFlFWElTVFMnKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgRkVUQ0ggY29tbWFuZFxuICAgKlxuICAgKiBGRVRDSCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNVxuICAgKiBDSEFOR0VEU0lOQ0UgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDU1MSNzZWN0aW9uLTMuM1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgU2VxdWVuY2Ugc2V0LCBlZyAxOiogZm9yIGFsbCBtZXNzYWdlc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW2l0ZW1zXSBNZXNzYWdlIGRhdGEgaXRlbSBuYW1lcyBvciBtYWNyb1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBmZXRjaGVkIG1lc3NhZ2UgaW5mb1xuICAgKi9cbiAgYXN5bmMgbGlzdE1lc3NhZ2VzIChwYXRoLCBzZXF1ZW5jZSwgaXRlbXMgPSBbeyBmYXN0OiB0cnVlIH1dLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRmV0Y2hpbmcgbWVzc2FnZXMnLCBzZXF1ZW5jZSwgJ2Zyb20nLCBwYXRoLCAnLi4uJylcbiAgICBjb25zdCBjb21tYW5kID0gYnVpbGRGRVRDSENvbW1hbmQoc2VxdWVuY2UsIGl0ZW1zLCBvcHRpb25zKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKGNvbW1hbmQsICdGRVRDSCcsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIHBhcnNlRkVUQ0gocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTRUFSQ0ggY29tbWFuZFxuICAgKlxuICAgKiBTRUFSQ0ggZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjRcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtPYmplY3R9IHF1ZXJ5IFNlYXJjaCB0ZXJtc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICBhc3luYyBzZWFyY2ggKHBhdGgsIHF1ZXJ5LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU2VhcmNoaW5nIGluJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgY29tbWFuZCA9IGJ1aWxkU0VBUkNIQ29tbWFuZChxdWVyeSwgb3B0aW9ucylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyhjb21tYW5kLCAnU0VBUkNIJywge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gcGFyc2VTRUFSQ0gocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTVE9SRSBjb21tYW5kXG4gICAqXG4gICAqIFNUT1JFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC42XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHNlbGVjdG9yIHdoaWNoIHRoZSBmbGFnIGNoYW5nZSBpcyBhcHBsaWVkIHRvXG4gICAqIEBwYXJhbSB7QXJyYXl9IGZsYWdzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIHNldEZsYWdzIChwYXRoLCBzZXF1ZW5jZSwgZmxhZ3MsIG9wdGlvbnMpIHtcbiAgICBsZXQga2V5ID0gJydcbiAgICBsZXQgbGlzdCA9IFtdXG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShmbGFncykgfHwgdHlwZW9mIGZsYWdzICE9PSAnb2JqZWN0Jykge1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncyB8fCBbXSlcbiAgICAgIGtleSA9ICcnXG4gICAgfSBlbHNlIGlmIChmbGFncy5hZGQpIHtcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3MuYWRkIHx8IFtdKVxuICAgICAga2V5ID0gJysnXG4gICAgfSBlbHNlIGlmIChmbGFncy5zZXQpIHtcbiAgICAgIGtleSA9ICcnXG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLnNldCB8fCBbXSlcbiAgICB9IGVsc2UgaWYgKGZsYWdzLnJlbW92ZSkge1xuICAgICAga2V5ID0gJy0nXG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLnJlbW92ZSB8fCBbXSlcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU2V0dGluZyBmbGFncyBvbicsIHNlcXVlbmNlLCAnaW4nLCBwYXRoLCAnLi4uJylcbiAgICByZXR1cm4gdGhpcy5zdG9yZShwYXRoLCBzZXF1ZW5jZSwga2V5ICsgJ0ZMQUdTJywgbGlzdCwgb3B0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNUT1JFIGNvbW1hbmRcbiAgICpcbiAgICogU1RPUkUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjZcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2Ugc2VsZWN0b3Igd2hpY2ggdGhlIGZsYWcgY2hhbmdlIGlzIGFwcGxpZWQgdG9cbiAgICogQHBhcmFtIHtTdHJpbmd9IGFjdGlvbiBTVE9SRSBtZXRob2QgdG8gY2FsbCwgZWcgXCIrRkxBR1NcIlxuICAgKiBAcGFyYW0ge0FycmF5fSBmbGFnc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICBhc3luYyBzdG9yZSAocGF0aCwgc2VxdWVuY2UsIGFjdGlvbiwgZmxhZ3MsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGNvbW1hbmQgPSBidWlsZFNUT1JFQ29tbWFuZChzZXF1ZW5jZSwgYWN0aW9uLCBmbGFncywgb3B0aW9ucylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyhjb21tYW5kLCAnRkVUQ0gnLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBwYXJzZUZFVENIKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgQVBQRU5EIGNvbW1hbmRcbiAgICpcbiAgICogQVBQRU5EIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4xMVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gVGhlIG1haWxib3ggd2hlcmUgdG8gYXBwZW5kIHRoZSBtZXNzYWdlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGFwcGVuZFxuICAgKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zLmZsYWdzIEFueSBmbGFncyB5b3Ugd2FudCB0byBzZXQgb24gdGhlIHVwbG9hZGVkIG1lc3NhZ2UuIERlZmF1bHRzIHRvIFtcXFNlZW5dLiAob3B0aW9uYWwpXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIHVwbG9hZCAoZGVzdGluYXRpb24sIG1lc3NhZ2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBmbGFncyA9IHByb3BPcihbJ1xcXFxTZWVuJ10sICdmbGFncycsIG9wdGlvbnMpLm1hcCh2YWx1ZSA9PiAoeyB0eXBlOiAnYXRvbScsIHZhbHVlIH0pKVxuICAgIGxldCBjb21tYW5kID0ge1xuICAgICAgY29tbWFuZDogJ0FQUEVORCcsXG4gICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgIHsgdHlwZTogJ2F0b20nLCB2YWx1ZTogZGVzdGluYXRpb24gfSxcbiAgICAgICAgZmxhZ3MsXG4gICAgICAgIHsgdHlwZTogJ2xpdGVyYWwnLCB2YWx1ZTogbWVzc2FnZSB9XG4gICAgICBdXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1VwbG9hZGluZyBtZXNzYWdlIHRvJywgZGVzdGluYXRpb24sICcuLi4nKVxuICAgIHJldHVybiB0aGlzLmV4ZWMoY29tbWFuZClcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIG1lc3NhZ2VzIGZyb20gYSBzZWxlY3RlZCBtYWlsYm94XG4gICAqXG4gICAqIEVYUFVOR0UgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjNcbiAgICogVUlEIEVYUFVOR0UgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDMxNSNzZWN0aW9uLTIuMVxuICAgKlxuICAgKiBJZiBwb3NzaWJsZSAoYnlVaWQ6dHJ1ZSBhbmQgVUlEUExVUyBleHRlbnNpb24gc3VwcG9ydGVkKSwgdXNlcyBVSUQgRVhQVU5HRVxuICAgKiBjb21tYW5kIHRvIGRlbGV0ZSBhIHJhbmdlIG9mIG1lc3NhZ2VzLCBvdGhlcndpc2UgZmFsbHMgYmFjayB0byBFWFBVTkdFLlxuICAgKlxuICAgKiBOQiEgVGhpcyBtZXRob2QgbWlnaHQgYmUgZGVzdHJ1Y3RpdmUgLSBpZiBFWFBVTkdFIGlzIHVzZWQsIHRoZW4gYW55IG1lc3NhZ2VzXG4gICAqIHdpdGggXFxEZWxldGVkIGZsYWcgc2V0IGFyZSBkZWxldGVkXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIGRlbGV0ZWRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAgICovXG4gIGFzeW5jIGRlbGV0ZU1lc3NhZ2VzIChwYXRoLCBzZXF1ZW5jZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgLy8gYWRkIFxcRGVsZXRlZCBmbGFnIHRvIHRoZSBtZXNzYWdlcyBhbmQgcnVuIEVYUFVOR0Ugb3IgVUlEIEVYUFVOR0VcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRGVsZXRpbmcgbWVzc2FnZXMnLCBzZXF1ZW5jZSwgJ2luJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgdXNlVWlkUGx1cyA9IG9wdGlvbnMuYnlVaWQgJiYgdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdVSURQTFVTJykgPj0gMFxuICAgIGNvbnN0IHVpZEV4cHVuZ2VDb21tYW5kID0geyBjb21tYW5kOiAnVUlEIEVYUFVOR0UnLCBhdHRyaWJ1dGVzOiBbeyB0eXBlOiAnc2VxdWVuY2UnLCB2YWx1ZTogc2VxdWVuY2UgfV0gfVxuICAgIGF3YWl0IHRoaXMuc2V0RmxhZ3MocGF0aCwgc2VxdWVuY2UsIHsgYWRkOiAnXFxcXERlbGV0ZWQnIH0sIG9wdGlvbnMpXG4gICAgY29uc3QgY21kID0gdXNlVWlkUGx1cyA/IHVpZEV4cHVuZ2VDb21tYW5kIDogJ0VYUFVOR0UnXG4gICAgcmV0dXJuIHRoaXMuZXhlYyhjbWQsIG51bGwsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgYWN0aXZlIG1haWxib3ggdG8gdGhlIGRlc3RpbmF0aW9uIG1haWxib3guXG4gICAqIFNpbGVudCBtZXRob2QgKHVubGVzcyBhbiBlcnJvciBvY2N1cnMpLCBieSBkZWZhdWx0IHJldHVybnMgbm8gaW5mb3JtYXRpb24uXG4gICAqXG4gICAqIENPUFkgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjdcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2UgcmFuZ2UgdG8gYmUgY29waWVkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZXN0aW5hdGlvbiBEZXN0aW5hdGlvbiBtYWlsYm94IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5ieVVpZF0gSWYgdHJ1ZSwgdXNlcyBVSUQgQ09QWSBpbnN0ZWFkIG9mIENPUFlcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAgICovXG4gIGFzeW5jIGNvcHlNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29weWluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICd0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcbiAgICBjb25zdCB7IGh1bWFuUmVhZGFibGUgfSA9IGF3YWl0IHRoaXMuZXhlYyh7XG4gICAgICBjb21tYW5kOiBvcHRpb25zLmJ5VWlkID8gJ1VJRCBDT1BZJyA6ICdDT1BZJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgeyB0eXBlOiAnc2VxdWVuY2UnLCB2YWx1ZTogc2VxdWVuY2UgfSxcbiAgICAgICAgeyB0eXBlOiAnYXRvbScsIHZhbHVlOiBkZXN0aW5hdGlvbiB9XG4gICAgICBdXG4gICAgfSwgbnVsbCwge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gaHVtYW5SZWFkYWJsZSB8fCAnQ09QWSBjb21wbGV0ZWQnXG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgYSByYW5nZSBvZiBtZXNzYWdlcyBmcm9tIHRoZSBhY3RpdmUgbWFpbGJveCB0byB0aGUgZGVzdGluYXRpb24gbWFpbGJveC5cbiAgICogUHJlZmVycyB0aGUgTU9WRSBleHRlbnNpb24gYnV0IGlmIG5vdCBhdmFpbGFibGUsIGZhbGxzIGJhY2sgdG9cbiAgICogQ09QWSArIEVYUFVOR0VcbiAgICpcbiAgICogTU9WRSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzY4NTFcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2UgcmFuZ2UgdG8gYmUgbW92ZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRlc3RpbmF0aW9uIERlc3RpbmF0aW9uIG1haWxib3ggcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgbW92ZU1lc3NhZ2VzIChwYXRoLCBzZXF1ZW5jZSwgZGVzdGluYXRpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdNb3ZpbmcgbWVzc2FnZXMnLCBzZXF1ZW5jZSwgJ2Zyb20nLCBwYXRoLCAndG8nLCBkZXN0aW5hdGlvbiwgJy4uLicpXG5cbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdNT1ZFJykgPT09IC0xKSB7XG4gICAgICAvLyBGYWxsYmFjayB0byBDT1BZICsgRVhQVU5HRVxuICAgICAgYXdhaXQgdGhpcy5jb3B5TWVzc2FnZXMocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zKVxuICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlTWVzc2FnZXMocGF0aCwgc2VxdWVuY2UsIG9wdGlvbnMpXG4gICAgfVxuXG4gICAgLy8gSWYgcG9zc2libGUsIHVzZSBNT1ZFXG4gICAgcmV0dXJuIHRoaXMuZXhlYyh7XG4gICAgICBjb21tYW5kOiBvcHRpb25zLmJ5VWlkID8gJ1VJRCBNT1ZFJyA6ICdNT1ZFJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgeyB0eXBlOiAnc2VxdWVuY2UnLCB2YWx1ZTogc2VxdWVuY2UgfSxcbiAgICAgICAgeyB0eXBlOiAnYXRvbScsIHZhbHVlOiBkZXN0aW5hdGlvbiB9XG4gICAgICBdXG4gICAgfSwgWydPSyddLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgQ09NUFJFU1MgY29tbWFuZFxuICAgKlxuICAgKiBDT01QUkVTUyBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM0OTc4XG4gICAqL1xuICBhc3luYyBjb21wcmVzc0Nvbm5lY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fZW5hYmxlQ29tcHJlc3Npb24gfHwgdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdDT01QUkVTUz1ERUZMQVRFJykgPCAwIHx8IHRoaXMuY2xpZW50LmNvbXByZXNzZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbmFibGluZyBjb21wcmVzc2lvbi4uLicpXG4gICAgYXdhaXQgdGhpcy5leGVjKHtcbiAgICAgIGNvbW1hbmQ6ICdDT01QUkVTUycsXG4gICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgIHZhbHVlOiAnREVGTEFURSdcbiAgICAgIH1dXG4gICAgfSlcbiAgICB0aGlzLmNsaWVudC5lbmFibGVDb21wcmVzc2lvbigpXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NvbXByZXNzaW9uIGVuYWJsZWQsIGFsbCBkYXRhIHNlbnQgYW5kIHJlY2VpdmVkIGlzIGRlZmxhdGVkIScpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBMT0dJTiBvciBBVVRIRU5USUNBVEUgWE9BVVRIMiBjb21tYW5kXG4gICAqXG4gICAqIExPR0lOIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMi4zXG4gICAqIFhPQVVUSDIgZGV0YWlsczpcbiAgICogICBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9nbWFpbC94b2F1dGgyX3Byb3RvY29sI2ltYXBfcHJvdG9jb2xfZXhjaGFuZ2VcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGgudXNlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aC5wYXNzXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRoLnhvYXV0aDJcbiAgICovXG4gIGFzeW5jIGxvZ2luIChhdXRoKSB7XG4gICAgbGV0IGNvbW1hbmRcbiAgICBsZXQgb3B0aW9ucyA9IHt9XG5cbiAgICBpZiAoIWF1dGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXV0aGVudGljYXRpb24gaW5mb3JtYXRpb24gbm90IHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdBVVRIPVhPQVVUSDInKSA+PSAwICYmIGF1dGggJiYgYXV0aC54b2F1dGgyKSB7XG4gICAgICBjb21tYW5kID0ge1xuICAgICAgICBjb21tYW5kOiAnQVVUSEVOVElDQVRFJyxcbiAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgIHsgdHlwZTogJ0FUT00nLCB2YWx1ZTogJ1hPQVVUSDInIH0sXG4gICAgICAgICAgeyB0eXBlOiAnQVRPTScsIHZhbHVlOiBidWlsZFhPQXV0aDJUb2tlbihhdXRoLnVzZXIsIGF1dGgueG9hdXRoMiksIHNlbnNpdGl2ZTogdHJ1ZSB9XG4gICAgICAgIF1cbiAgICAgIH1cblxuICAgICAgb3B0aW9ucy5lcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSA9IHRydWUgLy8gKyB0YWdnZWQgZXJyb3IgcmVzcG9uc2UgZXhwZWN0cyBhbiBlbXB0eSBsaW5lIGluIHJldHVyblxuICAgIH0gZWxzZSB7XG4gICAgICBjb21tYW5kID0ge1xuICAgICAgICBjb21tYW5kOiAnbG9naW4nLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgeyB0eXBlOiAnU1RSSU5HJywgdmFsdWU6IGF1dGgudXNlciB8fCAnJyB9LFxuICAgICAgICAgIHsgdHlwZTogJ1NUUklORycsIHZhbHVlOiBhdXRoLnBhc3MgfHwgJycsIHNlbnNpdGl2ZTogdHJ1ZSB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTG9nZ2luZyBpbi4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ2NhcGFiaWxpdHknLCBvcHRpb25zKVxuICAgIC8qXG4gICAgICogdXBkYXRlIHBvc3QtYXV0aCBjYXBhYmlsaXRlc1xuICAgICAqIGNhcGFiaWxpdHkgbGlzdCBzaG91bGRuJ3QgY29udGFpbiBhdXRoIHJlbGF0ZWQgc3R1ZmYgYW55bW9yZVxuICAgICAqIGJ1dCBzb21lIG5ldyBleHRlbnNpb25zIG1pZ2h0IGhhdmUgcG9wcGVkIHVwIHRoYXQgZG8gbm90XG4gICAgICogbWFrZSBtdWNoIHNlbnNlIGluIHRoZSBub24tYXV0aCBzdGF0ZVxuICAgICAqL1xuICAgIGlmIChyZXNwb25zZS5jYXBhYmlsaXR5ICYmIHJlc3BvbnNlLmNhcGFiaWxpdHkubGVuZ3RoKSB7XG4gICAgICAvLyBjYXBhYmlsaXRlcyB3ZXJlIGxpc3RlZCB3aXRoIHRoZSBPSyBbQ0FQQUJJTElUWSAuLi5dIHJlc3BvbnNlXG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UuY2FwYWJpbGl0eVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UucGF5bG9hZCAmJiByZXNwb25zZS5wYXlsb2FkLkNBUEFCSUxJVFkgJiYgcmVzcG9uc2UucGF5bG9hZC5DQVBBQklMSVRZLmxlbmd0aCkge1xuICAgICAgLy8gY2FwYWJpbGl0ZXMgd2VyZSBsaXN0ZWQgd2l0aCAqIENBUEFCSUxJVFkgLi4uIHJlc3BvbnNlXG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UucGF5bG9hZC5DQVBBQklMSVRZLnBvcCgpLmF0dHJpYnV0ZXMubWFwKChjYXBhID0gJycpID0+IGNhcGEudmFsdWUudG9VcHBlckNhc2UoKS50cmltKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNhcGFiaWxpdGllcyB3ZXJlIG5vdCBhdXRvbWF0aWNhbGx5IGxpc3RlZCwgcmVsb2FkXG4gICAgICBhd2FpdCB0aGlzLnVwZGF0ZUNhcGFiaWxpdHkodHJ1ZSlcbiAgICB9XG5cbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9BVVRIRU5USUNBVEVEKVxuICAgIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSB0cnVlXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xvZ2luIHN1Y2Nlc3NmdWwsIHBvc3QtYXV0aCBjYXBhYmlsaXRlcyB1cGRhdGVkIScsIHRoaXMuX2NhcGFiaWxpdHkpXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFuIElNQVAgY29tbWFuZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3QgU3RydWN0dXJlZCByZXF1ZXN0IG9iamVjdFxuICAgKiBAcGFyYW0ge0FycmF5fSBhY2NlcHRVbnRhZ2dlZCBhIGxpc3Qgb2YgdW50YWdnZWQgcmVzcG9uc2VzIHRoYXQgd2lsbCBiZSBpbmNsdWRlZCBpbiAncGF5bG9hZCcgcHJvcGVydHlcbiAgICovXG4gIGFzeW5jIGV4ZWMgKHJlcXVlc3QsIGFjY2VwdFVudGFnZ2VkLCBvcHRpb25zKSB7XG4gICAgdGhpcy5icmVha0lkbGUoKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5jbGllbnQuZW5xdWV1ZUNvbW1hbmQocmVxdWVzdCwgYWNjZXB0VW50YWdnZWQsIG9wdGlvbnMpXG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmNhcGFiaWxpdHkpIHtcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5jYXBhYmlsaXR5XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjb25uZWN0aW9uIGlzIGlkbGluZy4gU2VuZHMgYSBOT09QIG9yIElETEUgY29tbWFuZFxuICAgKlxuICAgKiBJRExFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzIxNzdcbiAgICovXG4gIGVudGVySWRsZSAoKSB7XG4gICAgaWYgKHRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZW50ZXJlZElkbGUgPSB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0lETEUnKSA+PSAwID8gJ0lETEUnIDogJ05PT1AnXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0VudGVyaW5nIGlkbGUgd2l0aCAnICsgdGhpcy5fZW50ZXJlZElkbGUpXG5cbiAgICBpZiAodGhpcy5fZW50ZXJlZElkbGUgPT09ICdOT09QJykge1xuICAgICAgdGhpcy5faWRsZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlbmRpbmcgTk9PUCcpXG4gICAgICAgIHRoaXMuZXhlYygnTk9PUCcpXG4gICAgICB9LCB0aGlzLnRpbWVvdXROb29wKVxuICAgIH0gZWxzZSBpZiAodGhpcy5fZW50ZXJlZElkbGUgPT09ICdJRExFJykge1xuICAgICAgdGhpcy5jbGllbnQuZW5xdWV1ZUNvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnSURMRSdcbiAgICAgIH0pXG4gICAgICB0aGlzLl9pZGxlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNsaWVudC5zZW5kKCdET05FXFxyXFxuJylcbiAgICAgICAgdGhpcy5fZW50ZXJlZElkbGUgPSBmYWxzZVxuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnSWRsZSB0ZXJtaW5hdGVkJylcbiAgICAgIH0sIHRoaXMudGltZW91dElkbGUpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIGFjdGlvbnMgcmVsYXRlZCBpZGxpbmcsIGlmIElETEUgaXMgc3VwcG9ydGVkLCBzZW5kcyBET05FIHRvIHN0b3AgaXRcbiAgICovXG4gIGJyZWFrSWRsZSAoKSB7XG4gICAgaWYgKCF0aGlzLl9lbnRlcmVkSWRsZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICAgIGlmICh0aGlzLl9lbnRlcmVkSWRsZSA9PT0gJ0lETEUnKSB7XG4gICAgICB0aGlzLmNsaWVudC5zZW5kKCdET05FXFxyXFxuJylcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdJZGxlIHRlcm1pbmF0ZWQnKVxuICAgIH1cbiAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTVEFSVFRMUyBjb21tYW5kIGlmIG5lZWRlZFxuICAgKlxuICAgKiBTVEFSVFRMUyBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjIuMVxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZWRdIEJ5IGRlZmF1bHQgdGhlIGNvbW1hbmQgaXMgbm90IHJ1biBpZiBjYXBhYmlsaXR5IGlzIGFscmVhZHkgbGlzdGVkLiBTZXQgdG8gdHJ1ZSB0byBza2lwIHRoaXMgdmFsaWRhdGlvblxuICAgKi9cbiAgYXN5bmMgdXBncmFkZUNvbm5lY3Rpb24gKCkge1xuICAgIC8vIHNraXAgcmVxdWVzdCwgaWYgYWxyZWFkeSBzZWN1cmVkXG4gICAgaWYgKHRoaXMuY2xpZW50LnNlY3VyZU1vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8vIHNraXAgaWYgU1RBUlRUTFMgbm90IGF2YWlsYWJsZSBvciBzdGFydHRscyBzdXBwb3J0IGRpc2FibGVkXG4gICAgaWYgKCh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ1NUQVJUVExTJykgPCAwIHx8IHRoaXMuX2lnbm9yZVRMUykgJiYgIXRoaXMuX3JlcXVpcmVUTFMpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbmNyeXB0aW5nIGNvbm5lY3Rpb24uLi4nKVxuICAgIGF3YWl0IHRoaXMuZXhlYygnU1RBUlRUTFMnKVxuICAgIHRoaXMuX2NhcGFiaWxpdHkgPSBbXVxuICAgIHRoaXMuY2xpZW50LnVwZ3JhZGUoKVxuICAgIHJldHVybiB0aGlzLnVwZGF0ZUNhcGFiaWxpdHkoKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgQ0FQQUJJTElUWSBjb21tYW5kXG4gICAqXG4gICAqIENBUEFCSUxJVFkgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4xLjFcbiAgICpcbiAgICogRG9lc24ndCByZWdpc3RlciB1bnRhZ2dlZCBDQVBBQklMSVRZIGhhbmRsZXIgYXMgdGhpcyBpcyBhbHJlYWR5XG4gICAqIGhhbmRsZWQgYnkgZ2xvYmFsIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VkXSBCeSBkZWZhdWx0IHRoZSBjb21tYW5kIGlzIG5vdCBydW4gaWYgY2FwYWJpbGl0eSBpcyBhbHJlYWR5IGxpc3RlZC4gU2V0IHRvIHRydWUgdG8gc2tpcCB0aGlzIHZhbGlkYXRpb25cbiAgICovXG4gIGFzeW5jIHVwZGF0ZUNhcGFiaWxpdHkgKGZvcmNlZCkge1xuICAgIC8vIHNraXAgcmVxdWVzdCwgaWYgbm90IGZvcmNlZCB1cGRhdGUgYW5kIGNhcGFiaWxpdGllcyBhcmUgYWxyZWFkeSBsb2FkZWRcbiAgICBpZiAoIWZvcmNlZCAmJiB0aGlzLl9jYXBhYmlsaXR5Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gSWYgU1RBUlRUTFMgaXMgcmVxdWlyZWQgdGhlbiBza2lwIGNhcGFiaWxpdHkgbGlzdGluZyBhcyB3ZSBhcmUgZ29pbmcgdG8gdHJ5XG4gICAgLy8gU1RBUlRUTFMgYW55d2F5IGFuZCB3ZSByZS1jaGVjayBjYXBhYmlsaXRpZXMgYWZ0ZXIgY29ubmVjdGlvbiBpcyBzZWN1cmVkXG4gICAgaWYgKCF0aGlzLmNsaWVudC5zZWN1cmVNb2RlICYmIHRoaXMuX3JlcXVpcmVUTFMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdVcGRhdGluZyBjYXBhYmlsaXR5Li4uJylcbiAgICByZXR1cm4gdGhpcy5leGVjKCdDQVBBQklMSVRZJylcbiAgfVxuXG4gIGhhc0NhcGFiaWxpdHkgKGNhcGEgPSAnJykge1xuICAgIHJldHVybiB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoY2FwYS50b1VwcGVyQ2FzZSgpLnRyaW0oKSkgPj0gMFxuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVycyBmb3IgdW50YWdnZWQgcmVzcG9uc2VzXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhbiB1bnRhZ2dlZCBPSyBpbmNsdWRlcyBbQ0FQQUJJTElUWV0gdGFnIGFuZCB1cGRhdGVzIGNhcGFiaWxpdHkgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRPa0hhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmNhcGFiaWxpdHkpIHtcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5jYXBhYmlsaXR5XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgY2FwYWJpbGl0eSBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIHRoaXMuX2NhcGFiaWxpdHkgPSBwaXBlKFxuICAgICAgcHJvcE9yKFtdLCAnYXR0cmlidXRlcycpLFxuICAgICAgbWFwKCh7dmFsdWV9KSA9PiAodmFsdWUgfHwgJycpLnRvVXBwZXJDYXNlKCkudHJpbSgpKVxuICAgICkocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBleGlzdGluZyBtZXNzYWdlIGNvdW50XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRFeGlzdHNIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5oYXNPd25Qcm9wZXJ0eSgnbnInKSkge1xuICAgICAgdGhpcy5vbnVwZGF0ZSAmJiB0aGlzLm9udXBkYXRlKHRoaXMuX3NlbGVjdGVkTWFpbGJveCwgJ2V4aXN0cycsIHJlc3BvbnNlLm5yKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgYSBtZXNzYWdlIGhhcyBiZWVuIGRlbGV0ZWRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZEV4cHVuZ2VIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5oYXNPd25Qcm9wZXJ0eSgnbnInKSkge1xuICAgICAgdGhpcy5vbnVwZGF0ZSAmJiB0aGlzLm9udXBkYXRlKHRoaXMuX3NlbGVjdGVkTWFpbGJveCwgJ2V4cHVuZ2UnLCByZXNwb25zZS5ucilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGVzIHRoYXQgZmxhZ3MgaGF2ZSBiZWVuIHVwZGF0ZWQgZm9yIGEgbWVzc2FnZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkRmV0Y2hIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIHRoaXMub251cGRhdGUgJiYgdGhpcy5vbnVwZGF0ZSh0aGlzLl9zZWxlY3RlZE1haWxib3gsICdmZXRjaCcsIFtdLmNvbmNhdChwYXJzZUZFVENIKHsgcGF5bG9hZDogeyBGRVRDSDogW3Jlc3BvbnNlXSB9IH0pIHx8IFtdKS5zaGlmdCgpKVxuICB9XG5cbiAgLy8gUHJpdmF0ZSBoZWxwZXJzXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IHRoZSBjb25uZWN0aW9uIHN0YXJ0ZWQgaWRsaW5nLiBJbml0aWF0ZXMgYSBjeWNsZVxuICAgKiBvZiBOT09QcyBvciBJRExFcyB0byByZWNlaXZlIG5vdGlmaWNhdGlvbnMgYWJvdXQgdXBkYXRlcyBpbiB0aGUgc2VydmVyXG4gICAqL1xuICBfb25JZGxlICgpIHtcbiAgICBpZiAoIXRoaXMuX2F1dGhlbnRpY2F0ZWQgfHwgdGhpcy5fZW50ZXJlZElkbGUpIHtcbiAgICAgIC8vIE5vIG5lZWQgdG8gSURMRSB3aGVuIG5vdCBsb2dnZWQgaW4gb3IgYWxyZWFkeSBpZGxpbmdcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDbGllbnQgc3RhcnRlZCBpZGxpbmcnKVxuICAgIHRoaXMuZW50ZXJJZGxlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBJTUFQIHN0YXRlIHZhbHVlIGZvciB0aGUgY3VycmVudCBjb25uZWN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBuZXdTdGF0ZSBUaGUgc3RhdGUgeW91IHdhbnQgdG8gY2hhbmdlIHRvXG4gICAqL1xuICBfY2hhbmdlU3RhdGUgKG5ld1N0YXRlKSB7XG4gICAgaWYgKG5ld1N0YXRlID09PSB0aGlzLl9zdGF0ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0VudGVyaW5nIHN0YXRlOiAnICsgbmV3U3RhdGUpXG5cbiAgICAvLyBpZiBhIG1haWxib3ggd2FzIG9wZW5lZCwgZW1pdCBvbmNsb3NlbWFpbGJveCBhbmQgY2xlYXIgc2VsZWN0ZWRNYWlsYm94IHZhbHVlXG4gICAgaWYgKHRoaXMuX3N0YXRlID09PSBTVEFURV9TRUxFQ1RFRCAmJiB0aGlzLl9zZWxlY3RlZE1haWxib3gpIHtcbiAgICAgIHRoaXMub25jbG9zZW1haWxib3ggJiYgdGhpcy5vbmNsb3NlbWFpbGJveCh0aGlzLl9zZWxlY3RlZE1haWxib3gpXG4gICAgICB0aGlzLl9zZWxlY3RlZE1haWxib3ggPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuX3N0YXRlID0gbmV3U3RhdGVcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIGEgcGF0aCBleGlzdHMgaW4gdGhlIE1haWxib3ggdHJlZVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdHJlZSBNYWlsYm94IHRyZWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRlbGltaXRlclxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGJyYW5jaCBmb3IgdXNlZCBwYXRoXG4gICAqL1xuICBfZW5zdXJlUGF0aCAodHJlZSwgcGF0aCwgZGVsaW1pdGVyKSB7XG4gICAgY29uc3QgbmFtZXMgPSBwYXRoLnNwbGl0KGRlbGltaXRlcilcbiAgICBsZXQgYnJhbmNoID0gdHJlZVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGZvdW5kID0gZmFsc2VcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYnJhbmNoLmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb21wYXJlTWFpbGJveE5hbWVzKGJyYW5jaC5jaGlsZHJlbltqXS5uYW1lLCBpbWFwRGVjb2RlKG5hbWVzW2ldKSkpIHtcbiAgICAgICAgICBicmFuY2ggPSBicmFuY2guY2hpbGRyZW5bal1cbiAgICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgIGJyYW5jaC5jaGlsZHJlbi5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBpbWFwRGVjb2RlKG5hbWVzW2ldKSxcbiAgICAgICAgICBkZWxpbWl0ZXI6IGRlbGltaXRlcixcbiAgICAgICAgICBwYXRoOiBuYW1lcy5zbGljZSgwLCBpICsgMSkuam9pbihkZWxpbWl0ZXIpLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICB9KVxuICAgICAgICBicmFuY2ggPSBicmFuY2guY2hpbGRyZW5bYnJhbmNoLmNoaWxkcmVuLmxlbmd0aCAtIDFdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBicmFuY2hcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wYXJlcyB0d28gbWFpbGJveCBuYW1lcy4gQ2FzZSBpbnNlbnNpdGl2ZSBpbiBjYXNlIG9mIElOQk9YLCBvdGhlcndpc2UgY2FzZSBzZW5zaXRpdmVcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGEgTWFpbGJveCBuYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBiIE1haWxib3ggbmFtZVxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgZm9sZGVyIG5hbWVzIG1hdGNoXG4gICAqL1xuICBfY29tcGFyZU1haWxib3hOYW1lcyAoYSwgYikge1xuICAgIHJldHVybiAoYS50b1VwcGVyQ2FzZSgpID09PSAnSU5CT1gnID8gJ0lOQk9YJyA6IGEpID09PSAoYi50b1VwcGVyQ2FzZSgpID09PSAnSU5CT1gnID8gJ0lOQk9YJyA6IGIpXG4gIH1cblxuICBjcmVhdGVMb2dnZXIgKGNyZWF0b3IgPSBjcmVhdGVEZWZhdWx0TG9nZ2VyKSB7XG4gICAgY29uc3QgbG9nZ2VyID0gY3JlYXRvcigodGhpcy5fYXV0aCB8fCB7fSkudXNlciB8fCAnJywgdGhpcy5faG9zdClcbiAgICB0aGlzLmxvZ2dlciA9IHRoaXMuY2xpZW50LmxvZ2dlciA9IHtcbiAgICAgIGRlYnVnOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX0RFQlVHID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLmRlYnVnKG1zZ3MpIH0gfSxcbiAgICAgIGluZm86ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfSU5GTyA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci5pbmZvKG1zZ3MpIH0gfSxcbiAgICAgIHdhcm46ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfV0FSTiA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci53YXJuKG1zZ3MpIH0gfSxcbiAgICAgIGVycm9yOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX0VSUk9SID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLmVycm9yKG1zZ3MpIH0gfVxuICAgIH1cbiAgfVxufVxuIl19