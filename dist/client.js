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
    this.logLevel = this.LOG_LEVEL_ALL;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiVElNRU9VVF9DT05ORUNUSU9OIiwiVElNRU9VVF9OT09QIiwiVElNRU9VVF9JRExFIiwiU1RBVEVfQ09OTkVDVElORyIsIlNUQVRFX05PVF9BVVRIRU5USUNBVEVEIiwiU1RBVEVfQVVUSEVOVElDQVRFRCIsIlNUQVRFX1NFTEVDVEVEIiwiU1RBVEVfTE9HT1VUIiwiREVGQVVMVF9DTElFTlRfSUQiLCJuYW1lIiwiQ2xpZW50IiwiY29uc3RydWN0b3IiLCJob3N0IiwicG9ydCIsIm9wdGlvbnMiLCJ0aW1lb3V0Q29ubmVjdGlvbiIsInRpbWVvdXROb29wIiwidGltZW91dElkbGUiLCJzZXJ2ZXJJZCIsIm9uY2VydCIsIm9udXBkYXRlIiwib25zZWxlY3RtYWlsYm94Iiwib25jbG9zZW1haWxib3giLCJfaG9zdCIsIl9jbGllbnRJZCIsIl9zdGF0ZSIsIl9hdXRoZW50aWNhdGVkIiwiX2NhcGFiaWxpdHkiLCJfc2VsZWN0ZWRNYWlsYm94IiwiX2VudGVyZWRJZGxlIiwiX2lkbGVUaW1lb3V0IiwiX2VuYWJsZUNvbXByZXNzaW9uIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJfYXV0aCIsImF1dGgiLCJfcmVxdWlyZVRMUyIsInJlcXVpcmVUTFMiLCJfaWdub3JlVExTIiwiaWdub3JlVExTIiwiY2xpZW50Iiwib25lcnJvciIsIl9vbkVycm9yIiwiYmluZCIsImNlcnQiLCJvbmlkbGUiLCJfb25JZGxlIiwic2V0SGFuZGxlciIsInJlc3BvbnNlIiwiX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIiLCJfdW50YWdnZWRPa0hhbmRsZXIiLCJfdW50YWdnZWRFeGlzdHNIYW5kbGVyIiwiX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIiLCJfdW50YWdnZWRGZXRjaEhhbmRsZXIiLCJjcmVhdGVMb2dnZXIiLCJsb2dMZXZlbCIsIkxPR19MRVZFTF9BTEwiLCJlcnIiLCJjbGVhclRpbWVvdXQiLCJjb25uZWN0IiwiX29wZW5Db25uZWN0aW9uIiwiX2NoYW5nZVN0YXRlIiwidXBkYXRlQ2FwYWJpbGl0eSIsInVwZ3JhZGVDb25uZWN0aW9uIiwidXBkYXRlSWQiLCJsb2dnZXIiLCJ3YXJuIiwibWVzc2FnZSIsImxvZ2luIiwiY29tcHJlc3NDb25uZWN0aW9uIiwiZGVidWciLCJlcnJvciIsImNsb3NlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjb25uZWN0aW9uVGltZW91dCIsInNldFRpbWVvdXQiLCJFcnJvciIsInRoZW4iLCJvbnJlYWR5IiwiY2F0Y2giLCJsb2dvdXQiLCJpZCIsImluZGV4T2YiLCJjb21tYW5kIiwiYXR0cmlidXRlcyIsIk9iamVjdCIsImVudHJpZXMiLCJleGVjIiwibGlzdCIsIm1hcCIsInZhbHVlcyIsImtleXMiLCJmaWx0ZXIiLCJfIiwiaSIsIl9zaG91bGRTZWxlY3RNYWlsYm94IiwicGF0aCIsImN0eCIsInByZXZpb3VzU2VsZWN0IiwiZ2V0UHJldmlvdXNseVF1ZXVlZCIsInJlcXVlc3QiLCJwYXRoQXR0cmlidXRlIiwiZmluZCIsImF0dHJpYnV0ZSIsInR5cGUiLCJ2YWx1ZSIsInNlbGVjdE1haWxib3giLCJxdWVyeSIsInJlYWRPbmx5IiwiY29uZHN0b3JlIiwicHVzaCIsIm1haWxib3hJbmZvIiwibGlzdE5hbWVzcGFjZXMiLCJsaXN0TWFpbGJveGVzIiwidHJlZSIsInJvb3QiLCJjaGlsZHJlbiIsImxpc3RSZXNwb25zZSIsImZvckVhY2giLCJhdHRyIiwiaXRlbSIsImxlbmd0aCIsImRlbGltIiwiYnJhbmNoIiwiX2Vuc3VyZVBhdGgiLCJmbGFncyIsImxpc3RlZCIsImxzdWJSZXNwb25zZSIsImxzdWIiLCJmbGFnIiwic3Vic2NyaWJlZCIsImNyZWF0ZU1haWxib3giLCJjb2RlIiwibGlzdE1lc3NhZ2VzIiwic2VxdWVuY2UiLCJpdGVtcyIsImZhc3QiLCJwcmVjaGVjayIsInNlYXJjaCIsInNldEZsYWdzIiwia2V5IiwiQXJyYXkiLCJpc0FycmF5IiwiY29uY2F0IiwiYWRkIiwic2V0IiwicmVtb3ZlIiwic3RvcmUiLCJhY3Rpb24iLCJ1cGxvYWQiLCJkZXN0aW5hdGlvbiIsImRlbGV0ZU1lc3NhZ2VzIiwidXNlVWlkUGx1cyIsImJ5VWlkIiwidWlkRXhwdW5nZUNvbW1hbmQiLCJjbWQiLCJjb3B5TWVzc2FnZXMiLCJodW1hblJlYWRhYmxlIiwibW92ZU1lc3NhZ2VzIiwiY29tcHJlc3NlZCIsInhvYXV0aDIiLCJ1c2VyIiwic2Vuc2l0aXZlIiwiZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUiLCJwYXNzIiwiY2FwYWJpbGl0eSIsInBheWxvYWQiLCJDQVBBQklMSVRZIiwicG9wIiwiY2FwYSIsInRvVXBwZXJDYXNlIiwidHJpbSIsImFjY2VwdFVudGFnZ2VkIiwiYnJlYWtJZGxlIiwiZW5xdWV1ZUNvbW1hbmQiLCJlbnRlcklkbGUiLCJzZW5kIiwic2VjdXJlTW9kZSIsInVwZ3JhZGUiLCJmb3JjZWQiLCJoYXNDYXBhYmlsaXR5IiwiaGFzT3duUHJvcGVydHkiLCJuciIsIkZFVENIIiwic2hpZnQiLCJuZXdTdGF0ZSIsImRlbGltaXRlciIsIm5hbWVzIiwic3BsaXQiLCJmb3VuZCIsImoiLCJfY29tcGFyZU1haWxib3hOYW1lcyIsInNsaWNlIiwiam9pbiIsImEiLCJiIiwiY3JlYXRvciIsIm1zZ3MiLCJpbmZvIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBTUE7O0FBT0E7Ozs7QUFDQTs7OztBQUNBOztBQU9BOzs7Ozs7QUFJTyxNQUFNQSxrREFBcUIsS0FBSyxJQUFoQyxDLENBQXFDO0FBQ3JDLE1BQU1DLHNDQUFlLEtBQUssSUFBMUIsQyxDQUErQjtBQUMvQixNQUFNQyxzQ0FBZSxLQUFLLElBQTFCLEMsQ0FBK0I7O0FBRS9CLE1BQU1DLDhDQUFtQixDQUF6QjtBQUNBLE1BQU1DLDREQUEwQixDQUFoQztBQUNBLE1BQU1DLG9EQUFzQixDQUE1QjtBQUNBLE1BQU1DLDBDQUFpQixDQUF2QjtBQUNBLE1BQU1DLHNDQUFlLENBQXJCOztB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LFdBQUYsT0FBb0IsT0FBcEIsR0FBOEIsT0FBOUIsR0FBd0N5QixDQUF6RixDQUFQO0FBQ0Q7O0FBRUQvSSxlQUFjZ0osMEJBQWQsRUFBNkM7QUFDM0MsVUFBTXJJLFNBQVNxSSxRQUFRLEtBQUtwSyxLQUFMLENBQVdpSSxJQUFYLElBQW1CLEVBQTNCLEVBQStCLEtBQUszSSxLQUFwQyxDQUFmO0FBQ0EsU0FBS3lDLE1BQUwsR0FBYyxLQUFLekIsTUFBTCxDQUFZeUIsTUFBWixHQUFxQjtBQUNqQ0ssYUFBTyxDQUFDLEdBQUdpSSxJQUFKLEtBQWE7QUFBRSxZQUFJLDJCQUFtQixLQUFLaEosUUFBNUIsRUFBc0M7QUFBRVUsaUJBQU9LLEtBQVAsQ0FBYWlJLElBQWI7QUFBb0I7QUFBRSxPQURuRDtBQUVqQ0MsWUFBTSxDQUFDLEdBQUdELElBQUosS0FBYTtBQUFFLFlBQUksMEJBQWtCLEtBQUtoSixRQUEzQixFQUFxQztBQUFFVSxpQkFBT3VJLElBQVAsQ0FBWUQsSUFBWjtBQUFtQjtBQUFFLE9BRmhEO0FBR2pDckksWUFBTSxDQUFDLEdBQUdxSSxJQUFKLEtBQWE7QUFBRSxZQUFJLDBCQUFrQixLQUFLaEosUUFBM0IsRUFBcUM7QUFBRVUsaUJBQU9DLElBQVAsQ0FBWXFJLElBQVo7QUFBbUI7QUFBRSxPQUhoRDtBQUlqQ2hJLGFBQU8sQ0FBQyxHQUFHZ0ksSUFBSixLQUFhO0FBQUUsWUFBSSwyQkFBbUIsS0FBS2hKLFFBQTVCLEVBQXNDO0FBQUVVLGlCQUFPTSxLQUFQLENBQWFnSSxJQUFiO0FBQW9CO0FBQUU7QUFKbkQsS0FBbkM7QUFNRDtBQW4zQnlCO2tCQUFQNUwsTSIsImZpbGUiOiJjbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtYXAsIHBpcGUsIHVuaW9uLCB6aXAsIGZyb21QYWlycywgcHJvcE9yLCBwYXRoT3IsIGZsYXR0ZW4gfSBmcm9tICdyYW1kYSdcbmltcG9ydCB7IGltYXBFbmNvZGUsIGltYXBEZWNvZGUgfSBmcm9tICdlbWFpbGpzLXV0ZjcnXG5pbXBvcnQge1xuICBwYXJzZU5BTUVTUEFDRSxcbiAgcGFyc2VTRUxFQ1QsXG4gIHBhcnNlRkVUQ0gsXG4gIHBhcnNlU0VBUkNIXG59IGZyb20gJy4vY29tbWFuZC1wYXJzZXInXG5pbXBvcnQge1xuICBidWlsZEZFVENIQ29tbWFuZCxcbiAgYnVpbGRYT0F1dGgyVG9rZW4sXG4gIGJ1aWxkU0VBUkNIQ29tbWFuZCxcbiAgYnVpbGRTVE9SRUNvbW1hbmRcbn0gZnJvbSAnLi9jb21tYW5kLWJ1aWxkZXInXG5cbmltcG9ydCBjcmVhdGVEZWZhdWx0TG9nZ2VyIGZyb20gJy4vbG9nZ2VyJ1xuaW1wb3J0IEltYXBDbGllbnQgZnJvbSAnLi9pbWFwJ1xuaW1wb3J0IHtcbiAgTE9HX0xFVkVMX0VSUk9SLFxuICBMT0dfTEVWRUxfV0FSTixcbiAgTE9HX0xFVkVMX0lORk8sXG4gIExPR19MRVZFTF9ERUJVR1xufSBmcm9tICcuL2NvbW1vbidcblxuaW1wb3J0IHtcbiAgY2hlY2tTcGVjaWFsVXNlXG59IGZyb20gJy4vc3BlY2lhbC11c2UnXG5cbmV4cG9ydCBjb25zdCBUSU1FT1VUX0NPTk5FQ1RJT04gPSA5MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIHRoZSBJTUFQIGdyZWV0aW5nIGZyb20gdGhlIHNlcnZlclxuZXhwb3J0IGNvbnN0IFRJTUVPVVRfTk9PUCA9IDYwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgYmV0d2VlbiBOT09QIGNvbW1hbmRzIHdoaWxlIGlkbGluZ1xuZXhwb3J0IGNvbnN0IFRJTUVPVVRfSURMRSA9IDYwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgdW50aWwgSURMRSBjb21tYW5kIGlzIGNhbmNlbGxlZFxuXG5leHBvcnQgY29uc3QgU1RBVEVfQ09OTkVDVElORyA9IDFcbmV4cG9ydCBjb25zdCBTVEFURV9OT1RfQVVUSEVOVElDQVRFRCA9IDJcbmV4cG9ydCBjb25zdCBTVEFURV9BVVRIRU5USUNBVEVEID0gM1xuZXhwb3J0IGNvbnN0IFNUQVRFX1NFTEVDVEVEID0gNFxuZXhwb3J0IGNvbnN0IFNUQVRFX0xPR09VVCA9IDVcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ0xJRU5UX0lEID0ge1xuICBuYW1lOiAnZW1haWxqcy1pbWFwLWNsaWVudCdcbn1cblxuLyoqXG4gKiBlbWFpbGpzIElNQVAgY2xpZW50XG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtob3N0PSdsb2NhbGhvc3QnXSBIb3N0bmFtZSB0byBjb25lbmN0IHRvXG4gKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9MTQzXSBQb3J0IG51bWJlciB0byBjb25uZWN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudCB7XG4gIGNvbnN0cnVjdG9yIChob3N0LCBwb3J0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnRpbWVvdXRDb25uZWN0aW9uID0gVElNRU9VVF9DT05ORUNUSU9OXG4gICAgdGhpcy50aW1lb3V0Tm9vcCA9IFRJTUVPVVRfTk9PUFxuICAgIHRoaXMudGltZW91dElkbGUgPSBUSU1FT1VUX0lETEVcblxuICAgIHRoaXMuc2VydmVySWQgPSBmYWxzZSAvLyBSRkMgMjk3MSBTZXJ2ZXIgSUQgYXMga2V5IHZhbHVlIHBhaXJzXG5cbiAgICAvLyBFdmVudCBwbGFjZWhvbGRlcnNcbiAgICB0aGlzLm9uY2VydCA9IG51bGxcbiAgICB0aGlzLm9udXBkYXRlID0gbnVsbFxuICAgIHRoaXMub25zZWxlY3RtYWlsYm94ID0gbnVsbFxuICAgIHRoaXMub25jbG9zZW1haWxib3ggPSBudWxsXG5cbiAgICB0aGlzLl9ob3N0ID0gaG9zdFxuICAgIHRoaXMuX2NsaWVudElkID0gcHJvcE9yKERFRkFVTFRfQ0xJRU5UX0lELCAnaWQnLCBvcHRpb25zKVxuICAgIHRoaXMuX3N0YXRlID0gZmFsc2UgLy8gQ3VycmVudCBzdGF0ZVxuICAgIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZSAvLyBJcyB0aGUgY29ubmVjdGlvbiBhdXRoZW50aWNhdGVkXG4gICAgdGhpcy5fY2FwYWJpbGl0eSA9IFtdIC8vIExpc3Qgb2YgZXh0ZW5zaW9ucyB0aGUgc2VydmVyIHN1cHBvcnRzXG4gICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gZmFsc2UgLy8gU2VsZWN0ZWQgbWFpbGJveFxuICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgICB0aGlzLl9pZGxlVGltZW91dCA9IGZhbHNlXG4gICAgdGhpcy5fZW5hYmxlQ29tcHJlc3Npb24gPSAhIW9wdGlvbnMuZW5hYmxlQ29tcHJlc3Npb25cbiAgICB0aGlzLl9hdXRoID0gb3B0aW9ucy5hdXRoXG4gICAgdGhpcy5fcmVxdWlyZVRMUyA9ICEhb3B0aW9ucy5yZXF1aXJlVExTXG4gICAgdGhpcy5faWdub3JlVExTID0gISFvcHRpb25zLmlnbm9yZVRMU1xuXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgSW1hcENsaWVudChob3N0LCBwb3J0LCBvcHRpb25zKSAvLyBJTUFQIGNsaWVudCBvYmplY3RcblxuICAgIC8vIEV2ZW50IEhhbmRsZXJzXG4gICAgdGhpcy5jbGllbnQub25lcnJvciA9IHRoaXMuX29uRXJyb3IuYmluZCh0aGlzKVxuICAgIHRoaXMuY2xpZW50Lm9uY2VydCA9IChjZXJ0KSA9PiAodGhpcy5vbmNlcnQgJiYgdGhpcy5vbmNlcnQoY2VydCkpIC8vIGFsbG93cyBjZXJ0aWZpY2F0ZSBoYW5kbGluZyBmb3IgcGxhdGZvcm1zIHcvbyBuYXRpdmUgdGxzIHN1cHBvcnRcbiAgICB0aGlzLmNsaWVudC5vbmlkbGUgPSAoKSA9PiB0aGlzLl9vbklkbGUoKSAvLyBzdGFydCBpZGxpbmdcblxuICAgIC8vIERlZmF1bHQgaGFuZGxlcnMgZm9yIHVudGFnZ2VkIHJlc3BvbnNlc1xuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2NhcGFiaWxpdHknLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIocmVzcG9uc2UpKSAvLyBjYXBhYmlsaXR5IHVwZGF0ZXNcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdvaycsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRPa0hhbmRsZXIocmVzcG9uc2UpKSAvLyBub3RpZmljYXRpb25zXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignZXhpc3RzJywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZEV4aXN0c0hhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGNvdW50IGhhcyBjaGFuZ2VkXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignZXhwdW5nZScsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRFeHB1bmdlSGFuZGxlcihyZXNwb25zZSkpIC8vIG1lc3NhZ2UgaGFzIGJlZW4gZGVsZXRlZFxuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2ZldGNoJywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZEZldGNoSGFuZGxlcihyZXNwb25zZSkpIC8vIG1lc3NhZ2UgaGFzIGJlZW4gdXBkYXRlZCAoZWcuIGZsYWcgY2hhbmdlKVxuXG4gICAgLy8gQWN0aXZhdGUgbG9nZ2luZ1xuICAgIHRoaXMuY3JlYXRlTG9nZ2VyKClcbiAgICB0aGlzLmxvZ0xldmVsID0gdGhpcy5MT0dfTEVWRUxfQUxMXG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGlmIHRoZSBsb3dlci1sZXZlbCBJbWFwQ2xpZW50IGhhcyBlbmNvdW50ZXJlZCBhbiB1bnJlY292ZXJhYmxlXG4gICAqIGVycm9yIGR1cmluZyBvcGVyYXRpb24uIENsZWFucyB1cCBhbmQgcHJvcGFnYXRlcyB0aGUgZXJyb3IgdXB3YXJkcy5cbiAgICovXG4gIF9vbkVycm9yIChlcnIpIHtcbiAgICAvLyBtYWtlIHN1cmUgbm8gaWRsZSB0aW1lb3V0IGlzIHBlbmRpbmcgYW55bW9yZVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcblxuICAgIC8vIHByb3BhZ2F0ZSB0aGUgZXJyb3IgdXB3YXJkc1xuICAgIHRoaXMub25lcnJvciAmJiB0aGlzLm9uZXJyb3IoZXJyKVxuICB9XG5cbiAgLy9cbiAgLy9cbiAgLy8gUFVCTElDIEFQSVxuICAvL1xuICAvL1xuXG4gIC8qKlxuICAgKiBJbml0aWF0ZSBjb25uZWN0aW9uIHRvIHRoZSBJTUFQIHNlcnZlclxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGVuIGxvZ2luIHByb2NlZHVyZSBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgY29ubmVjdCAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuX29wZW5Db25uZWN0aW9uKClcbiAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX05PVF9BVVRIRU5USUNBVEVEKVxuICAgICAgYXdhaXQgdGhpcy51cGRhdGVDYXBhYmlsaXR5KClcbiAgICAgIGF3YWl0IHRoaXMudXBncmFkZUNvbm5lY3Rpb24oKVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVJZCh0aGlzLl9jbGllbnRJZClcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuKCdGYWlsZWQgdG8gdXBkYXRlIHNlcnZlciBpZCEnLCBlcnIubWVzc2FnZSlcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5sb2dpbih0aGlzLl9hdXRoKVxuICAgICAgYXdhaXQgdGhpcy5jb21wcmVzc0Nvbm5lY3Rpb24oKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nvbm5lY3Rpb24gZXN0YWJsaXNoZWQsIHJlYWR5IHRvIHJvbGwhJylcbiAgICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXInLCBlcnIpXG4gICAgICB0aGlzLmNsb3NlKGVycikgLy8gd2UgZG9uJ3QgcmVhbGx5IGNhcmUgd2hldGhlciB0aGlzIHdvcmtzIG9yIG5vdFxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgX29wZW5Db25uZWN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGNvbm5lY3Rpb25UaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiByZWplY3QobmV3IEVycm9yKCdUaW1lb3V0IGNvbm5lY3RpbmcgdG8gc2VydmVyJykpLCB0aGlzLnRpbWVvdXRDb25uZWN0aW9uKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nvbm5lY3RpbmcgdG8nLCB0aGlzLmNsaWVudC5ob3N0LCAnOicsIHRoaXMuY2xpZW50LnBvcnQpXG4gICAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9DT05ORUNUSU5HKVxuICAgICAgdGhpcy5jbGllbnQuY29ubmVjdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU29ja2V0IG9wZW5lZCwgd2FpdGluZyBmb3IgZ3JlZXRpbmcgZnJvbSB0aGUgc2VydmVyLi4uJylcblxuICAgICAgICB0aGlzLmNsaWVudC5vbnJlYWR5ID0gKCkgPT4ge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjb25uZWN0aW9uVGltZW91dClcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNvbm5lY3Rpb25UaW1lb3V0KVxuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIExvZ291dFxuICAgKlxuICAgKiBTZW5kIExPR09VVCwgdG8gd2hpY2ggdGhlIHNlcnZlciByZXNwb25kcyBieSBjbG9zaW5nIHRoZSBjb25uZWN0aW9uLlxuICAgKiBVc2UgaXMgZGlzY291cmFnZWQgaWYgbmV0d29yayBzdGF0dXMgaXMgdW5jbGVhciEgSWYgbmV0d29ya3Mgc3RhdHVzIGlzXG4gICAqIHVuY2xlYXIsIHBsZWFzZSB1c2UgI2Nsb3NlIGluc3RlYWQhXG4gICAqXG4gICAqIExPR09VVCBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4xLjNcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gc2VydmVyIGhhcyBjbG9zZWQgdGhlIGNvbm5lY3Rpb25cbiAgICovXG4gIGFzeW5jIGxvZ291dCAoKSB7XG4gICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfTE9HT1VUKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dnaW5nIG91dC4uLicpXG4gICAgYXdhaXQgdGhpcy5jbGllbnQubG9nb3V0KClcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gIH1cblxuICAvKipcbiAgICogRm9yY2UtY2xvc2VzIHRoZSBjdXJyZW50IGNvbm5lY3Rpb24gYnkgY2xvc2luZyB0aGUgVENQIHNvY2tldC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gc29ja2V0IGlzIGNsb3NlZFxuICAgKi9cbiAgYXN5bmMgY2xvc2UgKGVycikge1xuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0xPR09VVClcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nsb3NpbmcgY29ubmVjdGlvbi4uLicpXG4gICAgYXdhaXQgdGhpcy5jbGllbnQuY2xvc2UoZXJyKVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIElEIGNvbW1hbmQsIHBhcnNlcyBJRCByZXNwb25zZSwgc2V0cyB0aGlzLnNlcnZlcklkXG4gICAqXG4gICAqIElEIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjk3MVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gaWQgSUQgYXMgSlNPTiBvYmplY3QuIFNlZSBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyOTcxI3NlY3Rpb24tMy4zIGZvciBwb3NzaWJsZSB2YWx1ZXNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gcmVzcG9uc2UgaGFzIGJlZW4gcGFyc2VkXG4gICAqL1xuICBhc3luYyB1cGRhdGVJZCAoaWQpIHtcbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdJRCcpIDwgMCkgcmV0dXJuXG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBkYXRpbmcgaWQuLi4nKVxuXG4gICAgY29uc3QgY29tbWFuZCA9ICdJRCdcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gaWQgPyBbIGZsYXR0ZW4oT2JqZWN0LmVudHJpZXMoaWQpKSBdIDogWyBudWxsIF1cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQsIGF0dHJpYnV0ZXMgfSwgJ0lEJylcbiAgICBjb25zdCBsaXN0ID0gZmxhdHRlbihwYXRoT3IoW10sIFsncGF5bG9hZCcsICdJRCcsICcwJywgJ2F0dHJpYnV0ZXMnLCAnMCddLCByZXNwb25zZSkubWFwKE9iamVjdC52YWx1ZXMpKVxuICAgIGNvbnN0IGtleXMgPSBsaXN0LmZpbHRlcigoXywgaSkgPT4gaSAlIDIgPT09IDApXG4gICAgY29uc3QgdmFsdWVzID0gbGlzdC5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAxKVxuICAgIHRoaXMuc2VydmVySWQgPSBmcm9tUGFpcnMoemlwKGtleXMsIHZhbHVlcykpXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlcnZlciBpZCB1cGRhdGVkIScsIHRoaXMuc2VydmVySWQpXG4gIH1cblxuICBfc2hvdWxkU2VsZWN0TWFpbGJveCAocGF0aCwgY3R4KSB7XG4gICAgaWYgKCFjdHgpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNTZWxlY3QgPSB0aGlzLmNsaWVudC5nZXRQcmV2aW91c2x5UXVldWVkKFsnU0VMRUNUJywgJ0VYQU1JTkUnXSwgY3R4KVxuICAgIGlmIChwcmV2aW91c1NlbGVjdCAmJiBwcmV2aW91c1NlbGVjdC5yZXF1ZXN0LmF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHBhdGhBdHRyaWJ1dGUgPSBwcmV2aW91c1NlbGVjdC5yZXF1ZXN0LmF0dHJpYnV0ZXMuZmluZCgoYXR0cmlidXRlKSA9PiBhdHRyaWJ1dGUudHlwZSA9PT0gJ1NUUklORycpXG4gICAgICBpZiAocGF0aEF0dHJpYnV0ZSkge1xuICAgICAgICByZXR1cm4gcGF0aEF0dHJpYnV0ZS52YWx1ZSAhPT0gcGF0aFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZE1haWxib3ggIT09IHBhdGhcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNFTEVDVCBvciBFWEFNSU5FIHRvIG9wZW4gYSBtYWlsYm94XG4gICAqXG4gICAqIFNFTEVDVCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMVxuICAgKiBFWEFNSU5FIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4yXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIEZ1bGwgcGF0aCB0byBtYWlsYm94XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBvYmplY3RcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc2VsZWN0ZWQgbWFpbGJveFxuICAgKi9cbiAgYXN5bmMgc2VsZWN0TWFpbGJveCAocGF0aCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHF1ZXJ5ID0ge1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5yZWFkT25seSA/ICdFWEFNSU5FJyA6ICdTRUxFQ1QnLFxuICAgICAgYXR0cmlidXRlczogW3sgdHlwZTogJ1NUUklORycsIHZhbHVlOiBwYXRoIH1dXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuY29uZHN0b3JlICYmIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQ09ORFNUT1JFJykgPj0gMCkge1xuICAgICAgcXVlcnkuYXR0cmlidXRlcy5wdXNoKFt7IHR5cGU6ICdBVE9NJywgdmFsdWU6ICdDT05EU1RPUkUnIH1dKVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdPcGVuaW5nJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMocXVlcnksIFsnRVhJU1RTJywgJ0ZMQUdTJywgJ09LJ10sIHsgY3R4OiBvcHRpb25zLmN0eCB9KVxuICAgIGxldCBtYWlsYm94SW5mbyA9IHBhcnNlU0VMRUNUKHJlc3BvbnNlKVxuXG4gICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfU0VMRUNURUQpXG5cbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRNYWlsYm94ICE9PSBwYXRoICYmIHRoaXMub25jbG9zZW1haWxib3gpIHtcbiAgICAgIGF3YWl0IHRoaXMub25jbG9zZW1haWxib3godGhpcy5fc2VsZWN0ZWRNYWlsYm94KVxuICAgIH1cbiAgICB0aGlzLl9zZWxlY3RlZE1haWxib3ggPSBwYXRoXG4gICAgaWYgKHRoaXMub25zZWxlY3RtYWlsYm94KSB7XG4gICAgICBhd2FpdCB0aGlzLm9uc2VsZWN0bWFpbGJveChwYXRoLCBtYWlsYm94SW5mbylcbiAgICB9XG5cbiAgICByZXR1cm4gbWFpbGJveEluZm9cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIE5BTUVTUEFDRSBjb21tYW5kXG4gICAqXG4gICAqIE5BTUVTUEFDRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMzQyXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggbmFtZXNwYWNlIG9iamVjdFxuICAgKi9cbiAgYXN5bmMgbGlzdE5hbWVzcGFjZXMgKCkge1xuICAgIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ05BTUVTUEFDRScpIDwgMCkgcmV0dXJuIGZhbHNlXG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTGlzdGluZyBuYW1lc3BhY2VzLi4uJylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYygnTkFNRVNQQUNFJywgJ05BTUVTUEFDRScpXG4gICAgcmV0dXJuIHBhcnNlTkFNRVNQQUNFKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgTElTVCBhbmQgTFNVQiBjb21tYW5kcy4gUmV0cmlldmVzIGEgdHJlZSBvZiBhdmFpbGFibGUgbWFpbGJveGVzXG4gICAqXG4gICAqIExJU1QgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjhcbiAgICogTFNVQiBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuOVxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIGxpc3Qgb2YgbWFpbGJveGVzXG4gICAqL1xuICBhc3luYyBsaXN0TWFpbGJveGVzICgpIHtcbiAgICBjb25zdCB0cmVlID0geyByb290OiB0cnVlLCBjaGlsZHJlbjogW10gfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xpc3RpbmcgbWFpbGJveGVzLi4uJylcbiAgICBjb25zdCBsaXN0UmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kOiAnTElTVCcsIGF0dHJpYnV0ZXM6IFsnJywgJyonXSB9LCAnTElTVCcpXG4gICAgY29uc3QgbGlzdCA9IHBhdGhPcihbXSwgWydwYXlsb2FkJywgJ0xJU1QnXSwgbGlzdFJlc3BvbnNlKVxuICAgIGxpc3QuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IGF0dHIgPSBwcm9wT3IoW10sICdhdHRyaWJ1dGVzJywgaXRlbSlcbiAgICAgIGlmICghYXR0ci5sZW5ndGggPCAzKSByZXR1cm5cblxuICAgICAgY29uc3QgcGF0aCA9IHBhdGhPcignJywgWycyJywgJ3ZhbHVlJ10sIGF0dHIpXG4gICAgICBjb25zdCBkZWxpbSA9IHBhdGhPcignLycsIFsnMScsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5fZW5zdXJlUGF0aCh0cmVlLCBwYXRoLCBkZWxpbSlcbiAgICAgIGJyYW5jaC5mbGFncyA9IHByb3BPcihbXSwgJzAnLCBhdHRyKS5tYXAoKHt2YWx1ZX0pID0+IHZhbHVlIHx8ICcnKVxuICAgICAgYnJhbmNoLmxpc3RlZCA9IHRydWVcbiAgICAgIGNoZWNrU3BlY2lhbFVzZShicmFuY2gpXG4gICAgfSlcblxuICAgIGNvbnN0IGxzdWJSZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQ6ICdMU1VCJywgYXR0cmlidXRlczogWycnLCAnKiddIH0sICdMU1VCJylcbiAgICBjb25zdCBsc3ViID0gcGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnTFNVQiddLCBsc3ViUmVzcG9uc2UpXG4gICAgbHN1Yi5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBhdHRyID0gcHJvcE9yKFtdLCAnYXR0cmlidXRlcycsIGl0ZW0pXG4gICAgICBpZiAoIWF0dHIubGVuZ3RoIDwgMykgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhdGggPSBwYXRoT3IoJycsIFsnMicsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgZGVsaW0gPSBwYXRoT3IoJy8nLCBbJzEnLCAndmFsdWUnXSwgYXR0cilcbiAgICAgIGNvbnN0IGJyYW5jaCA9IHRoaXMuX2Vuc3VyZVBhdGgodHJlZSwgcGF0aCwgZGVsaW0pXG4gICAgICBwcm9wT3IoW10sICcwJywgYXR0cikubWFwKChmbGFnID0gJycpID0+IHsgYnJhbmNoLmZsYWdzID0gdW5pb24oYnJhbmNoLmZsYWdzLCBbZmxhZ10pIH0pXG4gICAgICBicmFuY2guc3Vic2NyaWJlZCA9IHRydWVcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRyZWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBtYWlsYm94IHdpdGggdGhlIGdpdmVuIHBhdGguXG4gICAqXG4gICAqIENSRUFURSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuM1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiAgICAgVGhlIHBhdGggb2YgdGhlIG1haWxib3ggeW91IHdvdWxkIGxpa2UgdG8gY3JlYXRlLiAgVGhpcyBtZXRob2Qgd2lsbFxuICAgKiAgICAgaGFuZGxlIHV0ZjcgZW5jb2RpbmcgZm9yIHlvdS5cbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqICAgICBQcm9taXNlIHJlc29sdmVzIGlmIG1haWxib3ggd2FzIGNyZWF0ZWQuXG4gICAqICAgICBJbiB0aGUgZXZlbnQgdGhlIHNlcnZlciBzYXlzIE5PIFtBTFJFQURZRVhJU1RTXSwgd2UgdHJlYXQgdGhhdCBhcyBzdWNjZXNzLlxuICAgKi9cbiAgYXN5bmMgY3JlYXRlTWFpbGJveCAocGF0aCkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDcmVhdGluZyBtYWlsYm94JywgcGF0aCwgJy4uLicpXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQ6ICdDUkVBVEUnLCBhdHRyaWJ1dGVzOiBbaW1hcEVuY29kZShwYXRoKV0gfSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgPT09ICdBTFJFQURZRVhJU1RTJykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIEZFVENIIGNvbW1hbmRcbiAgICpcbiAgICogRkVUQ0ggZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjVcbiAgICogQ0hBTkdFRFNJTkNFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQ1NTEjc2VjdGlvbi0zLjNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIFNlcXVlbmNlIHNldCwgZWcgMToqIGZvciBhbGwgbWVzc2FnZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtpdGVtc10gTWVzc2FnZSBkYXRhIGl0ZW0gbmFtZXMgb3IgbWFjcm9cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgZmV0Y2hlZCBtZXNzYWdlIGluZm9cbiAgICovXG4gIGFzeW5jIGxpc3RNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIGl0ZW1zID0gW3sgZmFzdDogdHJ1ZSB9XSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0ZldGNoaW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgY29tbWFuZCA9IGJ1aWxkRkVUQ0hDb21tYW5kKHNlcXVlbmNlLCBpdGVtcywgb3B0aW9ucylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyhjb21tYW5kLCAnRkVUQ0gnLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBwYXJzZUZFVENIKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU0VBUkNIIGNvbW1hbmRcbiAgICpcbiAgICogU0VBUkNIIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC40XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeSBTZWFyY2ggdGVybXNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgYXN5bmMgc2VhcmNoIChwYXRoLCBxdWVyeSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlYXJjaGluZyBpbicsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IGNvbW1hbmQgPSBidWlsZFNFQVJDSENvbW1hbmQocXVlcnksIG9wdGlvbnMpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ1NFQVJDSCcsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIHBhcnNlU0VBUkNIKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU1RPUkUgY29tbWFuZFxuICAgKlxuICAgKiBTVE9SRSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSBzZWxlY3RvciB3aGljaCB0aGUgZmxhZyBjaGFuZ2UgaXMgYXBwbGllZCB0b1xuICAgKiBAcGFyYW0ge0FycmF5fSBmbGFnc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICBzZXRGbGFncyAocGF0aCwgc2VxdWVuY2UsIGZsYWdzLCBvcHRpb25zKSB7XG4gICAgbGV0IGtleSA9ICcnXG4gICAgbGV0IGxpc3QgPSBbXVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZmxhZ3MpIHx8IHR5cGVvZiBmbGFncyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3MgfHwgW10pXG4gICAgICBrZXkgPSAnJ1xuICAgIH0gZWxzZSBpZiAoZmxhZ3MuYWRkKSB7XG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLmFkZCB8fCBbXSlcbiAgICAgIGtleSA9ICcrJ1xuICAgIH0gZWxzZSBpZiAoZmxhZ3Muc2V0KSB7XG4gICAgICBrZXkgPSAnJ1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncy5zZXQgfHwgW10pXG4gICAgfSBlbHNlIGlmIChmbGFncy5yZW1vdmUpIHtcbiAgICAgIGtleSA9ICctJ1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncy5yZW1vdmUgfHwgW10pXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NldHRpbmcgZmxhZ3Mgb24nLCBzZXF1ZW5jZSwgJ2luJywgcGF0aCwgJy4uLicpXG4gICAgcmV0dXJuIHRoaXMuc3RvcmUocGF0aCwgc2VxdWVuY2UsIGtleSArICdGTEFHUycsIGxpc3QsIG9wdGlvbnMpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTVE9SRSBjb21tYW5kXG4gICAqXG4gICAqIFNUT1JFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC42XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHNlbGVjdG9yIHdoaWNoIHRoZSBmbGFnIGNoYW5nZSBpcyBhcHBsaWVkIHRvXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb24gU1RPUkUgbWV0aG9kIHRvIGNhbGwsIGVnIFwiK0ZMQUdTXCJcbiAgICogQHBhcmFtIHtBcnJheX0gZmxhZ3NcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgYXN5bmMgc3RvcmUgKHBhdGgsIHNlcXVlbmNlLCBhY3Rpb24sIGZsYWdzLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBjb21tYW5kID0gYnVpbGRTVE9SRUNvbW1hbmQoc2VxdWVuY2UsIGFjdGlvbiwgZmxhZ3MsIG9wdGlvbnMpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ0ZFVENIJywge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gcGFyc2VGRVRDSChyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIEFQUEVORCBjb21tYW5kXG4gICAqXG4gICAqIEFQUEVORCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMTFcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRlc3RpbmF0aW9uIFRoZSBtYWlsYm94IHdoZXJlIHRvIGFwcGVuZCB0aGUgbWVzc2FnZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBhcHBlbmRcbiAgICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucy5mbGFncyBBbnkgZmxhZ3MgeW91IHdhbnQgdG8gc2V0IG9uIHRoZSB1cGxvYWRlZCBtZXNzYWdlLiBEZWZhdWx0cyB0byBbXFxTZWVuXS4gKG9wdGlvbmFsKVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICB1cGxvYWQgKGRlc3RpbmF0aW9uLCBtZXNzYWdlLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgZmxhZ3MgPSBwcm9wT3IoWydcXFxcU2VlbiddLCAnZmxhZ3MnLCBvcHRpb25zKS5tYXAodmFsdWUgPT4gKHsgdHlwZTogJ2F0b20nLCB2YWx1ZSB9KSlcbiAgICBsZXQgY29tbWFuZCA9IHtcbiAgICAgIGNvbW1hbmQ6ICdBUFBFTkQnLFxuICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICB7IHR5cGU6ICdhdG9tJywgdmFsdWU6IGRlc3RpbmF0aW9uIH0sXG4gICAgICAgIGZsYWdzLFxuICAgICAgICB7IHR5cGU6ICdsaXRlcmFsJywgdmFsdWU6IG1lc3NhZ2UgfVxuICAgICAgXVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdVcGxvYWRpbmcgbWVzc2FnZSB0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcbiAgICByZXR1cm4gdGhpcy5leGVjKGNvbW1hbmQpXG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlcyBtZXNzYWdlcyBmcm9tIGEgc2VsZWN0ZWQgbWFpbGJveFxuICAgKlxuICAgKiBFWFBVTkdFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC4zXG4gICAqIFVJRCBFWFBVTkdFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQzMTUjc2VjdGlvbi0yLjFcbiAgICpcbiAgICogSWYgcG9zc2libGUgKGJ5VWlkOnRydWUgYW5kIFVJRFBMVVMgZXh0ZW5zaW9uIHN1cHBvcnRlZCksIHVzZXMgVUlEIEVYUFVOR0VcbiAgICogY29tbWFuZCB0byBkZWxldGUgYSByYW5nZSBvZiBtZXNzYWdlcywgb3RoZXJ3aXNlIGZhbGxzIGJhY2sgdG8gRVhQVU5HRS5cbiAgICpcbiAgICogTkIhIFRoaXMgbWV0aG9kIG1pZ2h0IGJlIGRlc3RydWN0aXZlIC0gaWYgRVhQVU5HRSBpcyB1c2VkLCB0aGVuIGFueSBtZXNzYWdlc1xuICAgKiB3aXRoIFxcRGVsZXRlZCBmbGFnIHNldCBhcmUgZGVsZXRlZFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSByYW5nZSB0byBiZSBkZWxldGVkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlXG4gICAqL1xuICBhc3luYyBkZWxldGVNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIGFkZCBcXERlbGV0ZWQgZmxhZyB0byB0aGUgbWVzc2FnZXMgYW5kIHJ1biBFWFBVTkdFIG9yIFVJRCBFWFBVTkdFXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0RlbGV0aW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdpbicsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IHVzZVVpZFBsdXMgPSBvcHRpb25zLmJ5VWlkICYmIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignVUlEUExVUycpID49IDBcbiAgICBjb25zdCB1aWRFeHB1bmdlQ29tbWFuZCA9IHsgY29tbWFuZDogJ1VJRCBFWFBVTkdFJywgYXR0cmlidXRlczogW3sgdHlwZTogJ3NlcXVlbmNlJywgdmFsdWU6IHNlcXVlbmNlIH1dIH1cbiAgICBhd2FpdCB0aGlzLnNldEZsYWdzKHBhdGgsIHNlcXVlbmNlLCB7IGFkZDogJ1xcXFxEZWxldGVkJyB9LCBvcHRpb25zKVxuICAgIGNvbnN0IGNtZCA9IHVzZVVpZFBsdXMgPyB1aWRFeHB1bmdlQ29tbWFuZCA6ICdFWFBVTkdFJ1xuICAgIHJldHVybiB0aGlzLmV4ZWMoY21kLCBudWxsLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyBhIHJhbmdlIG9mIG1lc3NhZ2VzIGZyb20gdGhlIGFjdGl2ZSBtYWlsYm94IHRvIHRoZSBkZXN0aW5hdGlvbiBtYWlsYm94LlxuICAgKiBTaWxlbnQgbWV0aG9kICh1bmxlc3MgYW4gZXJyb3Igb2NjdXJzKSwgYnkgZGVmYXVsdCByZXR1cm5zIG5vIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBDT1BZIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC43XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIGNvcGllZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gRGVzdGluYXRpb24gbWFpbGJveCBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuYnlVaWRdIElmIHRydWUsIHVzZXMgVUlEIENPUFkgaW5zdGVhZCBvZiBDT1BZXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlXG4gICAqL1xuICBhc3luYyBjb3B5TWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBkZXN0aW5hdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NvcHlpbmcgbWVzc2FnZXMnLCBzZXF1ZW5jZSwgJ2Zyb20nLCBwYXRoLCAndG8nLCBkZXN0aW5hdGlvbiwgJy4uLicpXG4gICAgY29uc3QgeyBodW1hblJlYWRhYmxlIH0gPSBhd2FpdCB0aGlzLmV4ZWMoe1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgQ09QWScgOiAnQ09QWScsXG4gICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgIHsgdHlwZTogJ3NlcXVlbmNlJywgdmFsdWU6IHNlcXVlbmNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2F0b20nLCB2YWx1ZTogZGVzdGluYXRpb24gfVxuICAgICAgXVxuICAgIH0sIG51bGwsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIGh1bWFuUmVhZGFibGUgfHwgJ0NPUFkgY29tcGxldGVkJ1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgYWN0aXZlIG1haWxib3ggdG8gdGhlIGRlc3RpbmF0aW9uIG1haWxib3guXG4gICAqIFByZWZlcnMgdGhlIE1PVkUgZXh0ZW5zaW9uIGJ1dCBpZiBub3QgYXZhaWxhYmxlLCBmYWxscyBiYWNrIHRvXG4gICAqIENPUFkgKyBFWFBVTkdFXG4gICAqXG4gICAqIE1PVkUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM2ODUxXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIG1vdmVkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZXN0aW5hdGlvbiBEZXN0aW5hdGlvbiBtYWlsYm94IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAgICovXG4gIGFzeW5jIG1vdmVNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTW92aW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJ3RvJywgZGVzdGluYXRpb24sICcuLi4nKVxuXG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignTU9WRScpID09PSAtMSkge1xuICAgICAgLy8gRmFsbGJhY2sgdG8gQ09QWSArIEVYUFVOR0VcbiAgICAgIGF3YWl0IHRoaXMuY29weU1lc3NhZ2VzKHBhdGgsIHNlcXVlbmNlLCBkZXN0aW5hdGlvbiwgb3B0aW9ucylcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZU1lc3NhZ2VzKHBhdGgsIHNlcXVlbmNlLCBvcHRpb25zKVxuICAgIH1cblxuICAgIC8vIElmIHBvc3NpYmxlLCB1c2UgTU9WRVxuICAgIHJldHVybiB0aGlzLmV4ZWMoe1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgTU9WRScgOiAnTU9WRScsXG4gICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgIHsgdHlwZTogJ3NlcXVlbmNlJywgdmFsdWU6IHNlcXVlbmNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2F0b20nLCB2YWx1ZTogZGVzdGluYXRpb24gfVxuICAgICAgXVxuICAgIH0sIFsnT0snXSwge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIENPTVBSRVNTIGNvbW1hbmRcbiAgICpcbiAgICogQ09NUFJFU1MgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDk3OFxuICAgKi9cbiAgYXN5bmMgY29tcHJlc3NDb25uZWN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2VuYWJsZUNvbXByZXNzaW9uIHx8IHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQ09NUFJFU1M9REVGTEFURScpIDwgMCB8fCB0aGlzLmNsaWVudC5jb21wcmVzc2VkKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW5hYmxpbmcgY29tcHJlc3Npb24uLi4nKVxuICAgIGF3YWl0IHRoaXMuZXhlYyh7XG4gICAgICBjb21tYW5kOiAnQ09NUFJFU1MnLFxuICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICB2YWx1ZTogJ0RFRkxBVEUnXG4gICAgICB9XVxuICAgIH0pXG4gICAgdGhpcy5jbGllbnQuZW5hYmxlQ29tcHJlc3Npb24oKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb21wcmVzc2lvbiBlbmFibGVkLCBhbGwgZGF0YSBzZW50IGFuZCByZWNlaXZlZCBpcyBkZWZsYXRlZCEnKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgTE9HSU4gb3IgQVVUSEVOVElDQVRFIFhPQVVUSDIgY29tbWFuZFxuICAgKlxuICAgKiBMT0dJTiBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjIuM1xuICAgKiBYT0FVVEgyIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwveG9hdXRoMl9wcm90b2NvbCNpbWFwX3Byb3RvY29sX2V4Y2hhbmdlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRoLnVzZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGgucGFzc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aC54b2F1dGgyXG4gICAqL1xuICBhc3luYyBsb2dpbiAoYXV0aCkge1xuICAgIGxldCBjb21tYW5kXG4gICAgbGV0IG9wdGlvbnMgPSB7fVxuXG4gICAgaWYgKCFhdXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dGhlbnRpY2F0aW9uIGluZm9ybWF0aW9uIG5vdCBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQVVUSD1YT0FVVEgyJykgPj0gMCAmJiBhdXRoICYmIGF1dGgueG9hdXRoMikge1xuICAgICAgY29tbWFuZCA9IHtcbiAgICAgICAgY29tbWFuZDogJ0FVVEhFTlRJQ0FURScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICB7IHR5cGU6ICdBVE9NJywgdmFsdWU6ICdYT0FVVEgyJyB9LFxuICAgICAgICAgIHsgdHlwZTogJ0FUT00nLCB2YWx1ZTogYnVpbGRYT0F1dGgyVG9rZW4oYXV0aC51c2VyLCBhdXRoLnhvYXV0aDIpLCBzZW5zaXRpdmU6IHRydWUgfVxuICAgICAgICBdXG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnMuZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUgPSB0cnVlIC8vICsgdGFnZ2VkIGVycm9yIHJlc3BvbnNlIGV4cGVjdHMgYW4gZW1wdHkgbGluZSBpbiByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgY29tbWFuZCA9IHtcbiAgICAgICAgY29tbWFuZDogJ2xvZ2luJyxcbiAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgIHsgdHlwZTogJ1NUUklORycsIHZhbHVlOiBhdXRoLnVzZXIgfHwgJycgfSxcbiAgICAgICAgICB7IHR5cGU6ICdTVFJJTkcnLCB2YWx1ZTogYXV0aC5wYXNzIHx8ICcnLCBzZW5zaXRpdmU6IHRydWUgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4uLi4nKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gdGhpcy5leGVjKGNvbW1hbmQsICdjYXBhYmlsaXR5Jywgb3B0aW9ucylcbiAgICAvKlxuICAgICAqIHVwZGF0ZSBwb3N0LWF1dGggY2FwYWJpbGl0ZXNcbiAgICAgKiBjYXBhYmlsaXR5IGxpc3Qgc2hvdWxkbid0IGNvbnRhaW4gYXV0aCByZWxhdGVkIHN0dWZmIGFueW1vcmVcbiAgICAgKiBidXQgc29tZSBuZXcgZXh0ZW5zaW9ucyBtaWdodCBoYXZlIHBvcHBlZCB1cCB0aGF0IGRvIG5vdFxuICAgICAqIG1ha2UgbXVjaCBzZW5zZSBpbiB0aGUgbm9uLWF1dGggc3RhdGVcbiAgICAgKi9cbiAgICBpZiAocmVzcG9uc2UuY2FwYWJpbGl0eSAmJiByZXNwb25zZS5jYXBhYmlsaXR5Lmxlbmd0aCkge1xuICAgICAgLy8gY2FwYWJpbGl0ZXMgd2VyZSBsaXN0ZWQgd2l0aCB0aGUgT0sgW0NBUEFCSUxJVFkgLi4uXSByZXNwb25zZVxuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLmNhcGFiaWxpdHlcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnBheWxvYWQgJiYgcmVzcG9uc2UucGF5bG9hZC5DQVBBQklMSVRZICYmIHJlc3BvbnNlLnBheWxvYWQuQ0FQQUJJTElUWS5sZW5ndGgpIHtcbiAgICAgIC8vIGNhcGFiaWxpdGVzIHdlcmUgbGlzdGVkIHdpdGggKiBDQVBBQklMSVRZIC4uLiByZXNwb25zZVxuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLnBheWxvYWQuQ0FQQUJJTElUWS5wb3AoKS5hdHRyaWJ1dGVzLm1hcCgoY2FwYSA9ICcnKSA9PiBjYXBhLnZhbHVlLnRvVXBwZXJDYXNlKCkudHJpbSgpKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjYXBhYmlsaXRpZXMgd2VyZSBub3QgYXV0b21hdGljYWxseSBsaXN0ZWQsIHJlbG9hZFxuICAgICAgYXdhaXQgdGhpcy51cGRhdGVDYXBhYmlsaXR5KHRydWUpXG4gICAgfVxuXG4gICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfQVVUSEVOVElDQVRFRClcbiAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gdHJ1ZVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dpbiBzdWNjZXNzZnVsLCBwb3N0LWF1dGggY2FwYWJpbGl0ZXMgdXBkYXRlZCEnLCB0aGlzLl9jYXBhYmlsaXR5KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbiBJTUFQIGNvbW1hbmQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0IFN0cnVjdHVyZWQgcmVxdWVzdCBvYmplY3RcbiAgICogQHBhcmFtIHtBcnJheX0gYWNjZXB0VW50YWdnZWQgYSBsaXN0IG9mIHVudGFnZ2VkIHJlc3BvbnNlcyB0aGF0IHdpbGwgYmUgaW5jbHVkZWQgaW4gJ3BheWxvYWQnIHByb3BlcnR5XG4gICAqL1xuICBhc3luYyBleGVjIChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucykge1xuICAgIHRoaXMuYnJlYWtJZGxlKClcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuY2xpZW50LmVucXVldWVDb21tYW5kKHJlcXVlc3QsIGFjY2VwdFVudGFnZ2VkLCBvcHRpb25zKVxuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXBhYmlsaXR5KSB7XG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UuY2FwYWJpbGl0eVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29ubmVjdGlvbiBpcyBpZGxpbmcuIFNlbmRzIGEgTk9PUCBvciBJRExFIGNvbW1hbmRcbiAgICpcbiAgICogSURMRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMTc3XG4gICAqL1xuICBlbnRlcklkbGUgKCkge1xuICAgIGlmICh0aGlzLl9lbnRlcmVkSWRsZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VudGVyZWRJZGxlID0gdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdJRExFJykgPj0gMCA/ICdJRExFJyA6ICdOT09QJ1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbnRlcmluZyBpZGxlIHdpdGggJyArIHRoaXMuX2VudGVyZWRJZGxlKVxuXG4gICAgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnTk9PUCcpIHtcbiAgICAgIHRoaXMuX2lkbGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZW5kaW5nIE5PT1AnKVxuICAgICAgICB0aGlzLmV4ZWMoJ05PT1AnKVxuICAgICAgfSwgdGhpcy50aW1lb3V0Tm9vcClcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnSURMRScpIHtcbiAgICAgIHRoaXMuY2xpZW50LmVucXVldWVDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ0lETEUnXG4gICAgICB9KVxuICAgICAgdGhpcy5faWRsZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jbGllbnQuc2VuZCgnRE9ORVxcclxcbicpXG4gICAgICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0lkbGUgdGVybWluYXRlZCcpXG4gICAgICB9LCB0aGlzLnRpbWVvdXRJZGxlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBhY3Rpb25zIHJlbGF0ZWQgaWRsaW5nLCBpZiBJRExFIGlzIHN1cHBvcnRlZCwgc2VuZHMgRE9ORSB0byBzdG9wIGl0XG4gICAqL1xuICBicmVha0lkbGUgKCkge1xuICAgIGlmICghdGhpcy5fZW50ZXJlZElkbGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgICBpZiAodGhpcy5fZW50ZXJlZElkbGUgPT09ICdJRExFJykge1xuICAgICAgdGhpcy5jbGllbnQuc2VuZCgnRE9ORVxcclxcbicpXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnSWRsZSB0ZXJtaW5hdGVkJylcbiAgICB9XG4gICAgdGhpcy5fZW50ZXJlZElkbGUgPSBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU1RBUlRUTFMgY29tbWFuZCBpZiBuZWVkZWRcbiAgICpcbiAgICogU1RBUlRUTFMgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4yLjFcbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VkXSBCeSBkZWZhdWx0IHRoZSBjb21tYW5kIGlzIG5vdCBydW4gaWYgY2FwYWJpbGl0eSBpcyBhbHJlYWR5IGxpc3RlZC4gU2V0IHRvIHRydWUgdG8gc2tpcCB0aGlzIHZhbGlkYXRpb25cbiAgICovXG4gIGFzeW5jIHVwZ3JhZGVDb25uZWN0aW9uICgpIHtcbiAgICAvLyBza2lwIHJlcXVlc3QsIGlmIGFscmVhZHkgc2VjdXJlZFxuICAgIGlmICh0aGlzLmNsaWVudC5zZWN1cmVNb2RlKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBza2lwIGlmIFNUQVJUVExTIG5vdCBhdmFpbGFibGUgb3Igc3RhcnR0bHMgc3VwcG9ydCBkaXNhYmxlZFxuICAgIGlmICgodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdTVEFSVFRMUycpIDwgMCB8fCB0aGlzLl9pZ25vcmVUTFMpICYmICF0aGlzLl9yZXF1aXJlVExTKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW5jcnlwdGluZyBjb25uZWN0aW9uLi4uJylcbiAgICBhd2FpdCB0aGlzLmV4ZWMoJ1NUQVJUVExTJylcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gW11cbiAgICB0aGlzLmNsaWVudC51cGdyYWRlKClcbiAgICByZXR1cm4gdGhpcy51cGRhdGVDYXBhYmlsaXR5KClcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIENBUEFCSUxJVFkgY29tbWFuZFxuICAgKlxuICAgKiBDQVBBQklMSVRZIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMS4xXG4gICAqXG4gICAqIERvZXNuJ3QgcmVnaXN0ZXIgdW50YWdnZWQgQ0FQQUJJTElUWSBoYW5kbGVyIGFzIHRoaXMgaXMgYWxyZWFkeVxuICAgKiBoYW5kbGVkIGJ5IGdsb2JhbCBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlZF0gQnkgZGVmYXVsdCB0aGUgY29tbWFuZCBpcyBub3QgcnVuIGlmIGNhcGFiaWxpdHkgaXMgYWxyZWFkeSBsaXN0ZWQuIFNldCB0byB0cnVlIHRvIHNraXAgdGhpcyB2YWxpZGF0aW9uXG4gICAqL1xuICBhc3luYyB1cGRhdGVDYXBhYmlsaXR5IChmb3JjZWQpIHtcbiAgICAvLyBza2lwIHJlcXVlc3QsIGlmIG5vdCBmb3JjZWQgdXBkYXRlIGFuZCBjYXBhYmlsaXRpZXMgYXJlIGFscmVhZHkgbG9hZGVkXG4gICAgaWYgKCFmb3JjZWQgJiYgdGhpcy5fY2FwYWJpbGl0eS5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIFNUQVJUVExTIGlzIHJlcXVpcmVkIHRoZW4gc2tpcCBjYXBhYmlsaXR5IGxpc3RpbmcgYXMgd2UgYXJlIGdvaW5nIHRvIHRyeVxuICAgIC8vIFNUQVJUVExTIGFueXdheSBhbmQgd2UgcmUtY2hlY2sgY2FwYWJpbGl0aWVzIGFmdGVyIGNvbm5lY3Rpb24gaXMgc2VjdXJlZFxuICAgIGlmICghdGhpcy5jbGllbnQuc2VjdXJlTW9kZSAmJiB0aGlzLl9yZXF1aXJlVExTKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBkYXRpbmcgY2FwYWJpbGl0eS4uLicpXG4gICAgcmV0dXJuIHRoaXMuZXhlYygnQ0FQQUJJTElUWScpXG4gIH1cblxuICBoYXNDYXBhYmlsaXR5IChjYXBhID0gJycpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKGNhcGEudG9VcHBlckNhc2UoKS50cmltKCkpID49IDBcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlcnMgZm9yIHVudGFnZ2VkIHJlc3BvbnNlc1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYW4gdW50YWdnZWQgT0sgaW5jbHVkZXMgW0NBUEFCSUxJVFldIHRhZyBhbmQgdXBkYXRlcyBjYXBhYmlsaXR5IG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkT2tIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXBhYmlsaXR5KSB7XG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UuY2FwYWJpbGl0eVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGNhcGFiaWxpdHkgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRDYXBhYmlsaXR5SGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcGlwZShcbiAgICAgIHByb3BPcihbXSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgIG1hcCgoe3ZhbHVlfSkgPT4gKHZhbHVlIHx8ICcnKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSlcbiAgICApKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgZXhpc3RpbmcgbWVzc2FnZSBjb3VudFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkRXhpc3RzSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuaGFzT3duUHJvcGVydHkoJ25yJykpIHtcbiAgICAgIHRoaXMub251cGRhdGUgJiYgdGhpcy5vbnVwZGF0ZSh0aGlzLl9zZWxlY3RlZE1haWxib3gsICdleGlzdHMnLCByZXNwb25zZS5ucilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGVzIGEgbWVzc2FnZSBoYXMgYmVlbiBkZWxldGVkXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRFeHB1bmdlSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuaGFzT3duUHJvcGVydHkoJ25yJykpIHtcbiAgICAgIHRoaXMub251cGRhdGUgJiYgdGhpcy5vbnVwZGF0ZSh0aGlzLl9zZWxlY3RlZE1haWxib3gsICdleHB1bmdlJywgcmVzcG9uc2UubnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IGZsYWdzIGhhdmUgYmVlbiB1cGRhdGVkIGZvciBhIG1lc3NhZ2VcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZEZldGNoSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZmV0Y2gnLCBbXS5jb25jYXQocGFyc2VGRVRDSCh7IHBheWxvYWQ6IHsgRkVUQ0g6IFtyZXNwb25zZV0gfSB9KSB8fCBbXSkuc2hpZnQoKSlcbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyc1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgY29ubmVjdGlvbiBzdGFydGVkIGlkbGluZy4gSW5pdGlhdGVzIGEgY3ljbGVcbiAgICogb2YgTk9PUHMgb3IgSURMRXMgdG8gcmVjZWl2ZSBub3RpZmljYXRpb25zIGFib3V0IHVwZGF0ZXMgaW4gdGhlIHNlcnZlclxuICAgKi9cbiAgX29uSWRsZSAoKSB7XG4gICAgaWYgKCF0aGlzLl9hdXRoZW50aWNhdGVkIHx8IHRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIElETEUgd2hlbiBub3QgbG9nZ2VkIGluIG9yIGFscmVhZHkgaWRsaW5nXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ2xpZW50IHN0YXJ0ZWQgaWRsaW5nJylcbiAgICB0aGlzLmVudGVySWRsZSgpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgSU1BUCBzdGF0ZSB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgY29ubmVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbmV3U3RhdGUgVGhlIHN0YXRlIHlvdSB3YW50IHRvIGNoYW5nZSB0b1xuICAgKi9cbiAgX2NoYW5nZVN0YXRlIChuZXdTdGF0ZSkge1xuICAgIGlmIChuZXdTdGF0ZSA9PT0gdGhpcy5fc3RhdGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbnRlcmluZyBzdGF0ZTogJyArIG5ld1N0YXRlKVxuXG4gICAgLy8gaWYgYSBtYWlsYm94IHdhcyBvcGVuZWQsIGVtaXQgb25jbG9zZW1haWxib3ggYW5kIGNsZWFyIHNlbGVjdGVkTWFpbGJveCB2YWx1ZVxuICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gU1RBVEVfU0VMRUNURUQgJiYgdGhpcy5fc2VsZWN0ZWRNYWlsYm94KSB7XG4gICAgICB0aGlzLm9uY2xvc2VtYWlsYm94ICYmIHRoaXMub25jbG9zZW1haWxib3godGhpcy5fc2VsZWN0ZWRNYWlsYm94KVxuICAgICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlXG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyBhIHBhdGggZXhpc3RzIGluIHRoZSBNYWlsYm94IHRyZWVcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHRyZWUgTWFpbGJveCB0cmVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZWxpbWl0ZXJcbiAgICogQHJldHVybiB7T2JqZWN0fSBicmFuY2ggZm9yIHVzZWQgcGF0aFxuICAgKi9cbiAgX2Vuc3VyZVBhdGggKHRyZWUsIHBhdGgsIGRlbGltaXRlcikge1xuICAgIGNvbnN0IG5hbWVzID0gcGF0aC5zcGxpdChkZWxpbWl0ZXIpXG4gICAgbGV0IGJyYW5jaCA9IHRyZWVcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGJyYW5jaC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICBpZiAodGhpcy5fY29tcGFyZU1haWxib3hOYW1lcyhicmFuY2guY2hpbGRyZW5bal0ubmFtZSwgaW1hcERlY29kZShuYW1lc1tpXSkpKSB7XG4gICAgICAgICAgYnJhbmNoID0gYnJhbmNoLmNoaWxkcmVuW2pdXG4gICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICBicmFuY2guY2hpbGRyZW4ucHVzaCh7XG4gICAgICAgICAgbmFtZTogaW1hcERlY29kZShuYW1lc1tpXSksXG4gICAgICAgICAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIsXG4gICAgICAgICAgcGF0aDogbmFtZXMuc2xpY2UoMCwgaSArIDEpLmpvaW4oZGVsaW1pdGVyKSxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfSlcbiAgICAgICAgYnJhbmNoID0gYnJhbmNoLmNoaWxkcmVuW2JyYW5jaC5jaGlsZHJlbi5sZW5ndGggLSAxXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoXG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZXMgdHdvIG1haWxib3ggbmFtZXMuIENhc2UgaW5zZW5zaXRpdmUgaW4gY2FzZSBvZiBJTkJPWCwgb3RoZXJ3aXNlIGNhc2Ugc2Vuc2l0aXZlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhIE1haWxib3ggbmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYiBNYWlsYm94IG5hbWVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIGZvbGRlciBuYW1lcyBtYXRjaFxuICAgKi9cbiAgX2NvbXBhcmVNYWlsYm94TmFtZXMgKGEsIGIpIHtcbiAgICByZXR1cm4gKGEudG9VcHBlckNhc2UoKSA9PT0gJ0lOQk9YJyA/ICdJTkJPWCcgOiBhKSA9PT0gKGIudG9VcHBlckNhc2UoKSA9PT0gJ0lOQk9YJyA/ICdJTkJPWCcgOiBiKVxuICB9XG5cbiAgY3JlYXRlTG9nZ2VyIChjcmVhdG9yID0gY3JlYXRlRGVmYXVsdExvZ2dlcikge1xuICAgIGNvbnN0IGxvZ2dlciA9IGNyZWF0b3IodGhpcy5fYXV0aC51c2VyIHx8ICcnLCB0aGlzLl9ob3N0KVxuICAgIHRoaXMubG9nZ2VyID0gdGhpcy5jbGllbnQubG9nZ2VyID0ge1xuICAgICAgZGVidWc6ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfREVCVUcgPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIuZGVidWcobXNncykgfSB9LFxuICAgICAgaW5mbzogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9JTkZPID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLmluZm8obXNncykgfSB9LFxuICAgICAgd2FybjogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9XQVJOID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLndhcm4obXNncykgfSB9LFxuICAgICAgZXJyb3I6ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfRVJST1IgPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIuZXJyb3IobXNncykgfSB9XG4gICAgfVxuICB9XG59XG4iXX0=