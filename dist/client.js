"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DEFAULT_CLIENT_ID = exports.STATE_LOGOUT = exports.STATE_SELECTED = exports.STATE_AUTHENTICATED = exports.STATE_NOT_AUTHENTICATED = exports.STATE_CONNECTING = exports.TIMEOUT_IDLE = exports.TIMEOUT_NOOP = exports.TIMEOUT_CONNECTION = void 0;

var _ramda = require("ramda");

var _emailjsUtf = require("emailjs-utf7");

var _commandParser = require("./command-parser");

var _commandBuilder = require("./command-builder");

var _logger = _interopRequireDefault(require("./logger"));

var _imap = _interopRequireDefault(require("./imap"));

var _common = require("./common");

var _specialUse = require("./special-use");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const TIMEOUT_CONNECTION = 90 * 1000; // Milliseconds to wait for the IMAP greeting from the server

exports.TIMEOUT_CONNECTION = TIMEOUT_CONNECTION;
const TIMEOUT_NOOP = 60 * 1000; // Milliseconds between NOOP commands while idling

exports.TIMEOUT_NOOP = TIMEOUT_NOOP;
const TIMEOUT_IDLE = 60 * 1000; // Milliseconds until IDLE command is cancelled

exports.TIMEOUT_IDLE = TIMEOUT_IDLE;
const STATE_CONNECTING = 1;
exports.STATE_CONNECTING = STATE_CONNECTING;
const STATE_NOT_AUTHENTICATED = 2;
exports.STATE_NOT_AUTHENTICATED = STATE_NOT_AUTHENTICATED;
const STATE_AUTHENTICATED = 3;
exports.STATE_AUTHENTICATED = STATE_AUTHENTICATED;
const STATE_SELECTED = 4;
exports.STATE_SELECTED = STATE_SELECTED;
const STATE_LOGOUT = 5;
exports.STATE_LOGOUT = STATE_LOGOUT;
const DEFAULT_CLIENT_ID = {
  name: 'emailjs-imap-client'
};
/**
 * emailjs IMAP client
 *
 * @constructor
 *
 * @param {String} [host='localhost'] Hostname to conenct to
 * @param {Number} [port=143] Port number to connect to
 * @param {Object} [options] Optional options object
 */

exports.DEFAULT_CLIENT_ID = DEFAULT_CLIENT_ID;

class Client {
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
    this.client = new _imap.default(host, port, options); // IMAP client object
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
    clearTimeout(this._idleTimeout); // propagate the error upwards

    if (!this.onerror) {
      throw err;
    }

    this.onerror(err);
  } //
  //
  // PUBLIC API
  //
  //

  /**
   * Initiate connection and login to the IMAP server
   *
   * @returns {Promise} Promise when login procedure is complete
   */


  connect() {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        yield _this.openConnection();
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
  /**
   * Initiate connection to the IMAP server
   *
   * @returns {Promise} capability of server without login
   */


  openConnection() {
    return new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => reject(new Error('Timeout connecting to server')), this.timeoutConnection);
      this.logger.debug('Connecting to', this.client.host, ':', this.client.port);

      this._changeState(STATE_CONNECTING);

      this.client.connect().then(() => {
        this.logger.debug('Socket opened, waiting for greeting from the server...');

        this.client.onready = () => {
          clearTimeout(connectionTimeout);

          this._changeState(STATE_NOT_AUTHENTICATED);

          this.updateCapability().then(() => resolve(this._capability));
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
      const response = yield _this4.exec({
        command,
        attributes
      }, 'ID');
      const list = (0, _ramda.flatten)((0, _ramda.pathOr)([], ['payload', 'ID', '0', 'attributes', '0'], response).map(Object.values));
      const keys = list.filter((_, i) => i % 2 === 0);
      const values = list.filter((_, i) => i % 2 === 1);
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
      const query = {
        command: options.readOnly ? 'EXAMINE' : 'SELECT',
        attributes: [{
          type: 'STRING',
          value: path
        }]
      };

      if (options.condstore && _this5._capability.indexOf('CONDSTORE') >= 0) {
        query.attributes.push([{
          type: 'ATOM',
          value: 'CONDSTORE'
        }]);
      }

      _this5.logger.debug('Opening', path, '...');

      const response = yield _this5.exec(query, ['EXISTS', 'FLAGS', 'OK'], {
        ctx: options.ctx
      });
      const mailboxInfo = (0, _commandParser.parseSELECT)(response);

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
      const tree = {
        root: true,
        children: []
      };

      _this7.logger.debug('Listing mailboxes...');

      const listResponse = yield _this7.exec({
        command: 'LIST',
        attributes: ['', '*']
      }, 'LIST');
      const list = (0, _ramda.pathOr)([], ['payload', 'LIST'], listResponse);
      list.forEach(item => {
        const attr = (0, _ramda.propOr)([], 'attributes', item);
        if (attr.length < 3) return;
        const path = (0, _ramda.pathOr)('', ['2', 'value'], attr);
        const delim = (0, _ramda.pathOr)('/', ['1', 'value'], attr);

        const branch = _this7._ensurePath(tree, path, delim);

        branch.flags = (0, _ramda.propOr)([], '0', attr).map(({
          value
        }) => value || '');
        branch.listed = true;
        (0, _specialUse.checkSpecialUse)(branch);
      });
      const lsubResponse = yield _this7.exec({
        command: 'LSUB',
        attributes: ['', '*']
      }, 'LSUB');
      const lsub = (0, _ramda.pathOr)([], ['payload', 'LSUB'], lsubResponse);
      lsub.forEach(item => {
        const attr = (0, _ramda.propOr)([], 'attributes', item);
        if (attr.length < 3) return;
        const path = (0, _ramda.pathOr)('', ['2', 'value'], attr);
        const delim = (0, _ramda.pathOr)('/', ['1', 'value'], attr);

        const branch = _this7._ensurePath(tree, path, delim);

        (0, _ramda.propOr)([], '0', attr).map((flag = '') => {
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
        yield _this8.exec({
          command: 'CREATE',
          attributes: [(0, _emailjsUtf.imapEncode)(path)]
        });
      } catch (err) {
        if (err && err.code === 'ALREADYEXISTS') {
          return;
        }

        throw err;
      }
    })();
  }
  /**
   * Delete a mailbox with the given path.
   *
   * DELETE details:
   *   https://tools.ietf.org/html/rfc3501#section-6.3.4
   *
   * @param {String} path
   *     The path of the mailbox you would like to delete.  This method will
   *     handle utf7 encoding for you.
   * @returns {Promise}
   *     Promise resolves if mailbox was deleted.
   */


  deleteMailbox(path) {
    this.logger.debug('Deleting mailbox', path, '...');
    return this.exec({
      command: 'DELETE',
      attributes: [(0, _emailjsUtf.imapEncode)(path)]
    });
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


  listMessages(path, sequence, items = [{
    fast: true
  }], options = {}) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      _this9.logger.debug('Fetching messages', sequence, 'from', path, '...');

      const command = (0, _commandBuilder.buildFETCHCommand)(sequence, items, options);
      const response = yield _this9.exec(command, 'FETCH', {
        precheck: ctx => _this9._shouldSelectMailbox(path, ctx) ? _this9.selectMailbox(path, {
          ctx
        }) : Promise.resolve()
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
        precheck: ctx => _this10._shouldSelectMailbox(path, ctx) ? _this10.selectMailbox(path, {
          ctx
        }) : Promise.resolve()
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
        precheck: ctx => _this11._shouldSelectMailbox(path, ctx) ? _this11.selectMailbox(path, {
          ctx
        }) : Promise.resolve()
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
    var _this12 = this;

    return _asyncToGenerator(function* () {
      const flags = (0, _ramda.propOr)(['\\Seen'], 'flags', options).map(value => ({
        type: 'atom',
        value
      }));
      const command = {
        command: 'APPEND',
        attributes: [{
          type: 'atom',
          value: destination
        }, flags, {
          type: 'literal',
          value: message
        }]
      };

      _this12.logger.debug('Uploading message to', destination, '...');

      const response = yield _this12.exec(command);
      return (0, _commandParser.parseAPPEND)(response);
    })();
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
    var _this13 = this;

    return _asyncToGenerator(function* () {
      // add \Deleted flag to the messages and run EXPUNGE or UID EXPUNGE
      _this13.logger.debug('Deleting messages', sequence, 'in', path, '...');

      const useUidPlus = options.byUid && _this13._capability.indexOf('UIDPLUS') >= 0;
      const uidExpungeCommand = {
        command: 'UID EXPUNGE',
        attributes: [{
          type: 'sequence',
          value: sequence
        }]
      };
      yield _this13.setFlags(path, sequence, {
        add: '\\Deleted'
      }, options);
      const cmd = useUidPlus ? uidExpungeCommand : 'EXPUNGE';
      return _this13.exec(cmd, null, {
        precheck: ctx => _this13._shouldSelectMailbox(path, ctx) ? _this13.selectMailbox(path, {
          ctx
        }) : Promise.resolve()
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
    var _this14 = this;

    return _asyncToGenerator(function* () {
      _this14.logger.debug('Copying messages', sequence, 'from', path, 'to', destination, '...');

      const response = yield _this14.exec({
        command: options.byUid ? 'UID COPY' : 'COPY',
        attributes: [{
          type: 'sequence',
          value: sequence
        }, {
          type: 'atom',
          value: destination
        }]
      }, null, {
        precheck: ctx => _this14._shouldSelectMailbox(path, ctx) ? _this14.selectMailbox(path, {
          ctx
        }) : Promise.resolve()
      });
      return (0, _commandParser.parseCOPY)(response);
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
    var _this15 = this;

    return _asyncToGenerator(function* () {
      _this15.logger.debug('Moving messages', sequence, 'from', path, 'to', destination, '...');

      if (_this15._capability.indexOf('MOVE') === -1) {
        // Fallback to COPY + EXPUNGE
        yield _this15.copyMessages(path, sequence, destination, options);
        return _this15.deleteMessages(path, sequence, options);
      } // If possible, use MOVE


      return _this15.exec({
        command: options.byUid ? 'UID MOVE' : 'MOVE',
        attributes: [{
          type: 'sequence',
          value: sequence
        }, {
          type: 'atom',
          value: destination
        }]
      }, ['OK'], {
        precheck: ctx => _this15._shouldSelectMailbox(path, ctx) ? _this15.selectMailbox(path, {
          ctx
        }) : Promise.resolve()
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
    var _this16 = this;

    return _asyncToGenerator(function* () {
      if (!_this16._enableCompression || _this16._capability.indexOf('COMPRESS=DEFLATE') < 0 || _this16.client.compressed) {
        return false;
      }

      _this16.logger.debug('Enabling compression...');

      yield _this16.exec({
        command: 'COMPRESS',
        attributes: [{
          type: 'ATOM',
          value: 'DEFLATE'
        }]
      });

      _this16.client.enableCompression();

      _this16.logger.debug('Compression enabled, all data sent and received is deflated!');
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
    var _this17 = this;

    return _asyncToGenerator(function* () {
      let command;
      const options = {};

      if (!auth) {
        throw new Error('Authentication information not provided');
      }

      if (_this17._capability.indexOf('AUTH=XOAUTH2') >= 0 && auth && auth.xoauth2) {
        command = {
          command: 'AUTHENTICATE',
          attributes: [{
            type: 'ATOM',
            value: 'XOAUTH2'
          }, {
            type: 'ATOM',
            value: (0, _commandBuilder.buildXOAuth2Token)(auth.user, auth.xoauth2),
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

      _this17.logger.debug('Logging in...');

      const response = yield _this17.exec(command, 'capability', options);
      /*
       * update post-auth capabilites
       * capability list shouldn't contain auth related stuff anymore
       * but some new extensions might have popped up that do not
       * make much sense in the non-auth state
       */

      if (response.capability && response.capability.length) {
        // capabilites were listed with the OK [CAPABILITY ...] response
        _this17._capability = response.capability;
      } else if (response.payload && response.payload.CAPABILITY && response.payload.CAPABILITY.length) {
        // capabilites were listed with * CAPABILITY ... response
        _this17._capability = response.payload.CAPABILITY.pop().attributes.map((capa = '') => capa.value.toUpperCase().trim());
      } else {
        // capabilities were not automatically listed, reload
        yield _this17.updateCapability(true);
      }

      _this17._changeState(STATE_AUTHENTICATED);

      _this17._authenticated = true;

      _this17.logger.debug('Login successful, post-auth capabilites updated!', _this17._capability);
    })();
  }
  /**
   * Run an IMAP command.
   *
   * @param {Object} request Structured request object
   * @param {Array} acceptUntagged a list of untagged responses that will be included in 'payload' property
   */


  exec(request, acceptUntagged, options) {
    var _this18 = this;

    return _asyncToGenerator(function* () {
      _this18.breakIdle();

      const response = yield _this18.client.enqueueCommand(request, acceptUntagged, options);

      if (response && response.capability) {
        _this18._capability = response.capability;
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

    const supportsIdle = this._capability.indexOf('IDLE') >= 0;
    this._enteredIdle = supportsIdle && this._selectedMailbox ? 'IDLE' : 'NOOP';
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
    var _this19 = this;

    return _asyncToGenerator(function* () {
      // skip request, if already secured
      if (_this19.client.secureMode) {
        return false;
      } // skip if STARTTLS not available or starttls support disabled


      if ((_this19._capability.indexOf('STARTTLS') < 0 || _this19._ignoreTLS) && !_this19._requireTLS) {
        return false;
      }

      _this19.logger.debug('Encrypting connection...');

      yield _this19.exec('STARTTLS');
      _this19._capability = [];

      _this19.client.upgrade();

      return _this19.updateCapability();
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
    var _this20 = this;

    return _asyncToGenerator(function* () {
      // skip request, if not forced update and capabilities are already loaded
      if (!forced && _this20._capability.length) {
        return;
      } // If STARTTLS is required then skip capability listing as we are going to try
      // STARTTLS anyway and we re-check capabilities after connection is secured


      if (!_this20.client.secureMode && _this20._requireTLS) {
        return;
      }

      _this20.logger.debug('Updating capability...');

      return _this20.exec('CAPABILITY');
    })();
  }

  hasCapability(capa = '') {
    return this._capability.indexOf(capa.toUpperCase().trim()) >= 0;
  } // Default handlers for untagged responses

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
    this._capability = (0, _ramda.pipe)((0, _ramda.propOr)([], 'attributes'), (0, _ramda.map)(({
      value
    }) => (value || '').toUpperCase().trim()))(response);
  }
  /**
   * Updates existing message count
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */


  _untaggedExistsHandler(response) {
    if (response && Object.prototype.hasOwnProperty.call(response, 'nr')) {
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
    if (response && Object.prototype.hasOwnProperty.call(response, 'nr')) {
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
    this.onupdate && this.onupdate(this._selectedMailbox, 'fetch', [].concat((0, _commandParser.parseFETCH)({
      payload: {
        FETCH: [response]
      }
    }) || []).shift());
  } // Private helpers

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

    this.logger.debug('Entering state: ' + newState); // if a mailbox was opened, emit onclosemailbox and clear selectedMailbox value

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

  createLogger(creator = _logger.default) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiVElNRU9VVF9DT05ORUNUSU9OIiwiVElNRU9VVF9OT09QIiwiVElNRU9VVF9JRExFIiwiU1RBVEVfQ09OTkVDVElORyIsIlNUQVRFX05PVF9BVVRIRU5USUNBVEVEIiwiU1RBVEVfQVVUSEVOVElDQVRFRCIsIlNUQVRFX1NFTEVDVEVEIiwiU1RBVEVfTE9HT1VUIiwiREVGQVVMVF9DTElFTlRfSUQiLCJuYW1lIiwiQ2xpZW50IiwiY29uc3RydWN0b3IiLCJob3N0IiwicG9ydCIsIm9wdGlvbnMiLCJ0aW1lb3V0Q29ubmVjdGlvbiIsInRpbWVvdXROb29wIiwidGltZW91dElkbGUiLCJzZXJ2ZXJJZCIsIm9uY2VydCIsIm9udXBkYXRlIiwib25zZWxlY3RtYWlsYm94Iiwib25jbG9zZW1haWxib3giLCJfaG9zdCIsIl9jbGllbnRJZCIsIl9zdGF0ZSIsIl9hdXRoZW50aWNhdGVkIiwiX2NhcGFiaWxpdHkiLCJfc2VsZWN0ZWRNYWlsYm94IiwiX2VudGVyZWRJZGxlIiwiX2lkbGVUaW1lb3V0IiwiX2VuYWJsZUNvbXByZXNzaW9uIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJfYXV0aCIsImF1dGgiLCJfcmVxdWlyZVRMUyIsInJlcXVpcmVUTFMiLCJfaWdub3JlVExTIiwiaWdub3JlVExTIiwiY2xpZW50IiwiSW1hcENsaWVudCIsIm9uZXJyb3IiLCJfb25FcnJvciIsImJpbmQiLCJjZXJ0Iiwib25pZGxlIiwiX29uSWRsZSIsInNldEhhbmRsZXIiLCJyZXNwb25zZSIsIl91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyIiwiX3VudGFnZ2VkT2tIYW5kbGVyIiwiX3VudGFnZ2VkRXhpc3RzSGFuZGxlciIsIl91bnRhZ2dlZEV4cHVuZ2VIYW5kbGVyIiwiX3VudGFnZ2VkRmV0Y2hIYW5kbGVyIiwiY3JlYXRlTG9nZ2VyIiwibG9nTGV2ZWwiLCJMT0dfTEVWRUxfQUxMIiwiZXJyIiwiY2xlYXJUaW1lb3V0IiwiY29ubmVjdCIsIm9wZW5Db25uZWN0aW9uIiwidXBncmFkZUNvbm5lY3Rpb24iLCJ1cGRhdGVJZCIsImxvZ2dlciIsIndhcm4iLCJtZXNzYWdlIiwibG9naW4iLCJjb21wcmVzc0Nvbm5lY3Rpb24iLCJkZWJ1ZyIsImVycm9yIiwiY2xvc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNvbm5lY3Rpb25UaW1lb3V0Iiwic2V0VGltZW91dCIsIkVycm9yIiwiX2NoYW5nZVN0YXRlIiwidGhlbiIsIm9ucmVhZHkiLCJ1cGRhdGVDYXBhYmlsaXR5IiwiY2F0Y2giLCJsb2dvdXQiLCJpZCIsImluZGV4T2YiLCJjb21tYW5kIiwiYXR0cmlidXRlcyIsIk9iamVjdCIsImVudHJpZXMiLCJleGVjIiwibGlzdCIsIm1hcCIsInZhbHVlcyIsImtleXMiLCJmaWx0ZXIiLCJfIiwiaSIsIl9zaG91bGRTZWxlY3RNYWlsYm94IiwicGF0aCIsImN0eCIsInByZXZpb3VzU2VsZWN0IiwiZ2V0UHJldmlvdXNseVF1ZXVlZCIsInJlcXVlc3QiLCJwYXRoQXR0cmlidXRlIiwiZmluZCIsImF0dHJpYnV0ZSIsInR5cGUiLCJ2YWx1ZSIsInNlbGVjdE1haWxib3giLCJxdWVyeSIsInJlYWRPbmx5IiwiY29uZHN0b3JlIiwicHVzaCIsIm1haWxib3hJbmZvIiwibGlzdE5hbWVzcGFjZXMiLCJsaXN0TWFpbGJveGVzIiwidHJlZSIsInJvb3QiLCJjaGlsZHJlbiIsImxpc3RSZXNwb25zZSIsImZvckVhY2giLCJpdGVtIiwiYXR0ciIsImxlbmd0aCIsImRlbGltIiwiYnJhbmNoIiwiX2Vuc3VyZVBhdGgiLCJmbGFncyIsImxpc3RlZCIsImxzdWJSZXNwb25zZSIsImxzdWIiLCJmbGFnIiwic3Vic2NyaWJlZCIsImNyZWF0ZU1haWxib3giLCJjb2RlIiwiZGVsZXRlTWFpbGJveCIsImxpc3RNZXNzYWdlcyIsInNlcXVlbmNlIiwiaXRlbXMiLCJmYXN0IiwicHJlY2hlY2siLCJzZWFyY2giLCJzZXRGbGFncyIsImtleSIsIkFycmF5IiwiaXNBcnJheSIsImNvbmNhdCIsImFkZCIsInNldCIsInJlbW92ZSIsInN0b3JlIiwiYWN0aW9uIiwidXBsb2FkIiwiZGVzdGluYXRpb24iLCJkZWxldGVNZXNzYWdlcyIsInVzZVVpZFBsdXMiLCJieVVpZCIsInVpZEV4cHVuZ2VDb21tYW5kIiwiY21kIiwiY29weU1lc3NhZ2VzIiwibW92ZU1lc3NhZ2VzIiwiY29tcHJlc3NlZCIsInhvYXV0aDIiLCJ1c2VyIiwic2Vuc2l0aXZlIiwiZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUiLCJwYXNzIiwiY2FwYWJpbGl0eSIsInBheWxvYWQiLCJDQVBBQklMSVRZIiwicG9wIiwiY2FwYSIsInRvVXBwZXJDYXNlIiwidHJpbSIsImFjY2VwdFVudGFnZ2VkIiwiYnJlYWtJZGxlIiwiZW5xdWV1ZUNvbW1hbmQiLCJlbnRlcklkbGUiLCJzdXBwb3J0c0lkbGUiLCJzZW5kIiwic2VjdXJlTW9kZSIsInVwZ3JhZGUiLCJmb3JjZWQiLCJoYXNDYXBhYmlsaXR5IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwibnIiLCJGRVRDSCIsInNoaWZ0IiwibmV3U3RhdGUiLCJkZWxpbWl0ZXIiLCJuYW1lcyIsInNwbGl0IiwiZm91bmQiLCJqIiwiX2NvbXBhcmVNYWlsYm94TmFtZXMiLCJzbGljZSIsImpvaW4iLCJhIiwiYiIsImNyZWF0b3IiLCJjcmVhdGVEZWZhdWx0TG9nZ2VyIiwibXNncyIsIkxPR19MRVZFTF9ERUJVRyIsImluZm8iLCJMT0dfTEVWRUxfSU5GTyIsIkxPR19MRVZFTF9XQVJOIiwiTE9HX0xFVkVMX0VSUk9SIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBUUE7O0FBT0E7O0FBQ0E7O0FBQ0E7O0FBUUE7Ozs7Ozs7O0FBSU8sTUFBTUEsa0JBQWtCLEdBQUcsS0FBSyxJQUFoQyxDLENBQXFDOzs7QUFDckMsTUFBTUMsWUFBWSxHQUFHLEtBQUssSUFBMUIsQyxDQUErQjs7O0FBQy9CLE1BQU1D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b250ZW50IjpbImltcG9ydCB7IG1hcCwgcGlwZSwgdW5pb24sIHppcCwgZnJvbVBhaXJzLCBwcm9wT3IsIHBhdGhPciwgZmxhdHRlbiB9IGZyb20gJ3JhbWRhJ1xuaW1wb3J0IHsgaW1hcEVuY29kZSwgaW1hcERlY29kZSB9IGZyb20gJ2VtYWlsanMtdXRmNydcbmltcG9ydCB7XG4gIHBhcnNlQVBQRU5ELFxuICBwYXJzZUNPUFksXG4gIHBhcnNlTkFNRVNQQUNFLFxuICBwYXJzZVNFTEVDVCxcbiAgcGFyc2VGRVRDSCxcbiAgcGFyc2VTRUFSQ0hcbn0gZnJvbSAnLi9jb21tYW5kLXBhcnNlcidcbmltcG9ydCB7XG4gIGJ1aWxkRkVUQ0hDb21tYW5kLFxuICBidWlsZFhPQXV0aDJUb2tlbixcbiAgYnVpbGRTRUFSQ0hDb21tYW5kLFxuICBidWlsZFNUT1JFQ29tbWFuZFxufSBmcm9tICcuL2NvbW1hbmQtYnVpbGRlcidcblxuaW1wb3J0IGNyZWF0ZURlZmF1bHRMb2dnZXIgZnJvbSAnLi9sb2dnZXInXG5pbXBvcnQgSW1hcENsaWVudCBmcm9tICcuL2ltYXAnXG5pbXBvcnQge1xuICBMT0dfTEVWRUxfRVJST1IsXG4gIExPR19MRVZFTF9XQVJOLFxuICBMT0dfTEVWRUxfSU5GTyxcbiAgTE9HX0xFVkVMX0RFQlVHLFxuICBMT0dfTEVWRUxfQUxMXG59IGZyb20gJy4vY29tbW9uJ1xuXG5pbXBvcnQge1xuICBjaGVja1NwZWNpYWxVc2Vcbn0gZnJvbSAnLi9zcGVjaWFsLXVzZSdcblxuZXhwb3J0IGNvbnN0IFRJTUVPVVRfQ09OTkVDVElPTiA9IDkwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgdG8gd2FpdCBmb3IgdGhlIElNQVAgZ3JlZXRpbmcgZnJvbSB0aGUgc2VydmVyXG5leHBvcnQgY29uc3QgVElNRU9VVF9OT09QID0gNjAgKiAxMDAwIC8vIE1pbGxpc2Vjb25kcyBiZXR3ZWVuIE5PT1AgY29tbWFuZHMgd2hpbGUgaWRsaW5nXG5leHBvcnQgY29uc3QgVElNRU9VVF9JRExFID0gNjAgKiAxMDAwIC8vIE1pbGxpc2Vjb25kcyB1bnRpbCBJRExFIGNvbW1hbmQgaXMgY2FuY2VsbGVkXG5cbmV4cG9ydCBjb25zdCBTVEFURV9DT05ORUNUSU5HID0gMVxuZXhwb3J0IGNvbnN0IFNUQVRFX05PVF9BVVRIRU5USUNBVEVEID0gMlxuZXhwb3J0IGNvbnN0IFNUQVRFX0FVVEhFTlRJQ0FURUQgPSAzXG5leHBvcnQgY29uc3QgU1RBVEVfU0VMRUNURUQgPSA0XG5leHBvcnQgY29uc3QgU1RBVEVfTE9HT1VUID0gNVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DTElFTlRfSUQgPSB7XG4gIG5hbWU6ICdlbWFpbGpzLWltYXAtY2xpZW50J1xufVxuXG4vKipcbiAqIGVtYWlsanMgSU1BUCBjbGllbnRcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW2hvc3Q9J2xvY2FsaG9zdCddIEhvc3RuYW1lIHRvIGNvbmVuY3QgdG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBbcG9ydD0xNDNdIFBvcnQgbnVtYmVyIHRvIGNvbm5lY3QgdG9cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uYWwgb3B0aW9ucyBvYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50IHtcbiAgY29uc3RydWN0b3IgKGhvc3QsIHBvcnQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMudGltZW91dENvbm5lY3Rpb24gPSBUSU1FT1VUX0NPTk5FQ1RJT05cbiAgICB0aGlzLnRpbWVvdXROb29wID0gVElNRU9VVF9OT09QXG4gICAgdGhpcy50aW1lb3V0SWRsZSA9IFRJTUVPVVRfSURMRVxuXG4gICAgdGhpcy5zZXJ2ZXJJZCA9IGZhbHNlIC8vIFJGQyAyOTcxIFNlcnZlciBJRCBhcyBrZXkgdmFsdWUgcGFpcnNcblxuICAgIC8vIEV2ZW50IHBsYWNlaG9sZGVyc1xuICAgIHRoaXMub25jZXJ0ID0gbnVsbFxuICAgIHRoaXMub251cGRhdGUgPSBudWxsXG4gICAgdGhpcy5vbnNlbGVjdG1haWxib3ggPSBudWxsXG4gICAgdGhpcy5vbmNsb3NlbWFpbGJveCA9IG51bGxcblxuICAgIHRoaXMuX2hvc3QgPSBob3N0XG4gICAgdGhpcy5fY2xpZW50SWQgPSBwcm9wT3IoREVGQVVMVF9DTElFTlRfSUQsICdpZCcsIG9wdGlvbnMpXG4gICAgdGhpcy5fc3RhdGUgPSBmYWxzZSAvLyBDdXJyZW50IHN0YXRlXG4gICAgdGhpcy5fYXV0aGVudGljYXRlZCA9IGZhbHNlIC8vIElzIHRoZSBjb25uZWN0aW9uIGF1dGhlbnRpY2F0ZWRcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gW10gLy8gTGlzdCBvZiBleHRlbnNpb25zIHRoZSBzZXJ2ZXIgc3VwcG9ydHNcbiAgICB0aGlzLl9zZWxlY3RlZE1haWxib3ggPSBmYWxzZSAvLyBTZWxlY3RlZCBtYWlsYm94XG4gICAgdGhpcy5fZW50ZXJlZElkbGUgPSBmYWxzZVxuICAgIHRoaXMuX2lkbGVUaW1lb3V0ID0gZmFsc2VcbiAgICB0aGlzLl9lbmFibGVDb21wcmVzc2lvbiA9ICEhb3B0aW9ucy5lbmFibGVDb21wcmVzc2lvblxuICAgIHRoaXMuX2F1dGggPSBvcHRpb25zLmF1dGhcbiAgICB0aGlzLl9yZXF1aXJlVExTID0gISFvcHRpb25zLnJlcXVpcmVUTFNcbiAgICB0aGlzLl9pZ25vcmVUTFMgPSAhIW9wdGlvbnMuaWdub3JlVExTXG5cbiAgICB0aGlzLmNsaWVudCA9IG5ldyBJbWFwQ2xpZW50KGhvc3QsIHBvcnQsIG9wdGlvbnMpIC8vIElNQVAgY2xpZW50IG9iamVjdFxuXG4gICAgLy8gRXZlbnQgSGFuZGxlcnNcbiAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpXG4gICAgdGhpcy5jbGllbnQub25jZXJ0ID0gKGNlcnQpID0+ICh0aGlzLm9uY2VydCAmJiB0aGlzLm9uY2VydChjZXJ0KSkgLy8gYWxsb3dzIGNlcnRpZmljYXRlIGhhbmRsaW5nIGZvciBwbGF0Zm9ybXMgdy9vIG5hdGl2ZSB0bHMgc3VwcG9ydFxuICAgIHRoaXMuY2xpZW50Lm9uaWRsZSA9ICgpID0+IHRoaXMuX29uSWRsZSgpIC8vIHN0YXJ0IGlkbGluZ1xuXG4gICAgLy8gRGVmYXVsdCBoYW5kbGVycyBmb3IgdW50YWdnZWQgcmVzcG9uc2VzXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignY2FwYWJpbGl0eScsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRDYXBhYmlsaXR5SGFuZGxlcihyZXNwb25zZSkpIC8vIGNhcGFiaWxpdHkgdXBkYXRlc1xuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ29rJywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZE9rSGFuZGxlcihyZXNwb25zZSkpIC8vIG5vdGlmaWNhdGlvbnNcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdleGlzdHMnLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkRXhpc3RzSGFuZGxlcihyZXNwb25zZSkpIC8vIG1lc3NhZ2UgY291bnQgaGFzIGNoYW5nZWRcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdleHB1bmdlJywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZEV4cHVuZ2VIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbWVzc2FnZSBoYXMgYmVlbiBkZWxldGVkXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignZmV0Y2gnLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkRmV0Y2hIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbWVzc2FnZSBoYXMgYmVlbiB1cGRhdGVkIChlZy4gZmxhZyBjaGFuZ2UpXG5cbiAgICAvLyBBY3RpdmF0ZSBsb2dnaW5nXG4gICAgdGhpcy5jcmVhdGVMb2dnZXIoKVxuICAgIHRoaXMubG9nTGV2ZWwgPSBwcm9wT3IoTE9HX0xFVkVMX0FMTCwgJ2xvZ0xldmVsJywgb3B0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgaWYgdGhlIGxvd2VyLWxldmVsIEltYXBDbGllbnQgaGFzIGVuY291bnRlcmVkIGFuIHVucmVjb3ZlcmFibGVcbiAgICogZXJyb3IgZHVyaW5nIG9wZXJhdGlvbi4gQ2xlYW5zIHVwIGFuZCBwcm9wYWdhdGVzIHRoZSBlcnJvciB1cHdhcmRzLlxuICAgKi9cbiAgX29uRXJyb3IgKGVycikge1xuICAgIC8vIG1ha2Ugc3VyZSBubyBpZGxlIHRpbWVvdXQgaXMgcGVuZGluZyBhbnltb3JlXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuXG4gICAgLy8gcHJvcGFnYXRlIHRoZSBlcnJvciB1cHdhcmRzXG4gICAgaWYgKCF0aGlzLm9uZXJyb3IpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cblxuICAgIHRoaXMub25lcnJvcihlcnIpXG4gIH1cblxuICAvL1xuICAvL1xuICAvLyBQVUJMSUMgQVBJXG4gIC8vXG4gIC8vXG5cbiAgLyoqXG4gICAqIEluaXRpYXRlIGNvbm5lY3Rpb24gYW5kIGxvZ2luIHRvIHRoZSBJTUFQIHNlcnZlclxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGVuIGxvZ2luIHByb2NlZHVyZSBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgY29ubmVjdCAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMub3BlbkNvbm5lY3Rpb24oKVxuICAgICAgYXdhaXQgdGhpcy51cGdyYWRlQ29ubmVjdGlvbigpXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZUlkKHRoaXMuX2NsaWVudElkKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byB1cGRhdGUgc2VydmVyIGlkIScsIGVyci5tZXNzYWdlKVxuICAgICAgfVxuXG4gICAgICBhd2FpdCB0aGlzLmxvZ2luKHRoaXMuX2F1dGgpXG4gICAgICBhd2FpdCB0aGlzLmNvbXByZXNzQ29ubmVjdGlvbigpXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29ubmVjdGlvbiBlc3RhYmxpc2hlZCwgcmVhZHkgdG8gcm9sbCEnKVxuICAgICAgdGhpcy5jbGllbnQub25lcnJvciA9IHRoaXMuX29uRXJyb3IuYmluZCh0aGlzKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0NvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlcicsIGVycilcbiAgICAgIHRoaXMuY2xvc2UoZXJyKSAvLyB3ZSBkb24ndCByZWFsbHkgY2FyZSB3aGV0aGVyIHRoaXMgd29ya3Mgb3Igbm90XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhdGUgY29ubmVjdGlvbiB0byB0aGUgSU1BUCBzZXJ2ZXJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IGNhcGFiaWxpdHkgb2Ygc2VydmVyIHdpdGhvdXQgbG9naW5cbiAgICovXG4gIG9wZW5Db25uZWN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY29ubmVjdGlvblRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHJlamVjdChuZXcgRXJyb3IoJ1RpbWVvdXQgY29ubmVjdGluZyB0byBzZXJ2ZXInKSksIHRoaXMudGltZW91dENvbm5lY3Rpb24pXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29ubmVjdGluZyB0bycsIHRoaXMuY2xpZW50Lmhvc3QsICc6JywgdGhpcy5jbGllbnQucG9ydClcbiAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0NPTk5FQ1RJTkcpXG4gICAgICB0aGlzLmNsaWVudC5jb25uZWN0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTb2NrZXQgb3BlbmVkLCB3YWl0aW5nIGZvciBncmVldGluZyBmcm9tIHRoZSBzZXJ2ZXIuLi4nKVxuXG4gICAgICAgIHRoaXMuY2xpZW50Lm9ucmVhZHkgPSAoKSA9PiB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNvbm5lY3Rpb25UaW1lb3V0KVxuICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX05PVF9BVVRIRU5USUNBVEVEKVxuICAgICAgICAgIHRoaXMudXBkYXRlQ2FwYWJpbGl0eSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiByZXNvbHZlKHRoaXMuX2NhcGFiaWxpdHkpKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGllbnQub25lcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXQpXG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2gocmVqZWN0KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTG9nb3V0XG4gICAqXG4gICAqIFNlbmQgTE9HT1VULCB0byB3aGljaCB0aGUgc2VydmVyIHJlc3BvbmRzIGJ5IGNsb3NpbmcgdGhlIGNvbm5lY3Rpb24uXG4gICAqIFVzZSBpcyBkaXNjb3VyYWdlZCBpZiBuZXR3b3JrIHN0YXR1cyBpcyB1bmNsZWFyISBJZiBuZXR3b3JrcyBzdGF0dXMgaXNcbiAgICogdW5jbGVhciwgcGxlYXNlIHVzZSAjY2xvc2UgaW5zdGVhZCFcbiAgICpcbiAgICogTE9HT1VUIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjEuM1xuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBzZXJ2ZXIgaGFzIGNsb3NlZCB0aGUgY29ubmVjdGlvblxuICAgKi9cbiAgYXN5bmMgbG9nb3V0ICgpIHtcbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9MT0dPVVQpXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xvZ2dpbmcgb3V0Li4uJylcbiAgICBhd2FpdCB0aGlzLmNsaWVudC5sb2dvdXQoKVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZS1jbG9zZXMgdGhlIGN1cnJlbnQgY29ubmVjdGlvbiBieSBjbG9zaW5nIHRoZSBUQ1Agc29ja2V0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBzb2NrZXQgaXMgY2xvc2VkXG4gICAqL1xuICBhc3luYyBjbG9zZSAoZXJyKSB7XG4gICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfTE9HT1VUKVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ2xvc2luZyBjb25uZWN0aW9uLi4uJylcbiAgICBhd2FpdCB0aGlzLmNsaWVudC5jbG9zZShlcnIpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgSUQgY29tbWFuZCwgcGFyc2VzIElEIHJlc3BvbnNlLCBzZXRzIHRoaXMuc2VydmVySWRcbiAgICpcbiAgICogSUQgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyOTcxXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpZCBJRCBhcyBKU09OIG9iamVjdC4gU2VlIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzI5NzEjc2VjdGlvbi0zLjMgZm9yIHBvc3NpYmxlIHZhbHVlc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiByZXNwb25zZSBoYXMgYmVlbiBwYXJzZWRcbiAgICovXG4gIGFzeW5jIHVwZGF0ZUlkIChpZCkge1xuICAgIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0lEJykgPCAwKSByZXR1cm5cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdVcGRhdGluZyBpZC4uLicpXG5cbiAgICBjb25zdCBjb21tYW5kID0gJ0lEJ1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBpZCA/IFtmbGF0dGVuKE9iamVjdC5lbnRyaWVzKGlkKSldIDogW251bGxdXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kLCBhdHRyaWJ1dGVzIH0sICdJRCcpXG4gICAgY29uc3QgbGlzdCA9IGZsYXR0ZW4ocGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnSUQnLCAnMCcsICdhdHRyaWJ1dGVzJywgJzAnXSwgcmVzcG9uc2UpLm1hcChPYmplY3QudmFsdWVzKSlcbiAgICBjb25zdCBrZXlzID0gbGlzdC5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAwKVxuICAgIGNvbnN0IHZhbHVlcyA9IGxpc3QuZmlsdGVyKChfLCBpKSA9PiBpICUgMiA9PT0gMSlcbiAgICB0aGlzLnNlcnZlcklkID0gZnJvbVBhaXJzKHppcChrZXlzLCB2YWx1ZXMpKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZXJ2ZXIgaWQgdXBkYXRlZCEnLCB0aGlzLnNlcnZlcklkKVxuICB9XG5cbiAgX3Nob3VsZFNlbGVjdE1haWxib3ggKHBhdGgsIGN0eCkge1xuICAgIGlmICghY3R4KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzU2VsZWN0ID0gdGhpcy5jbGllbnQuZ2V0UHJldmlvdXNseVF1ZXVlZChbJ1NFTEVDVCcsICdFWEFNSU5FJ10sIGN0eClcbiAgICBpZiAocHJldmlvdXNTZWxlY3QgJiYgcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBwYXRoQXR0cmlidXRlID0gcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzLmZpbmQoKGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlLnR5cGUgPT09ICdTVFJJTkcnKVxuICAgICAgaWYgKHBhdGhBdHRyaWJ1dGUpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhBdHRyaWJ1dGUudmFsdWUgIT09IHBhdGhcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNYWlsYm94ICE9PSBwYXRoXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTRUxFQ1Qgb3IgRVhBTUlORSB0byBvcGVuIGEgbWFpbGJveFxuICAgKlxuICAgKiBTRUxFQ1QgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjFcbiAgICogRVhBTUlORSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBGdWxsIHBhdGggdG8gbWFpbGJveFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIHNlbGVjdGVkIG1haWxib3hcbiAgICovXG4gIGFzeW5jIHNlbGVjdE1haWxib3ggKHBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXJ5ID0ge1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5yZWFkT25seSA/ICdFWEFNSU5FJyA6ICdTRUxFQ1QnLFxuICAgICAgYXR0cmlidXRlczogW3sgdHlwZTogJ1NUUklORycsIHZhbHVlOiBwYXRoIH1dXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuY29uZHN0b3JlICYmIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQ09ORFNUT1JFJykgPj0gMCkge1xuICAgICAgcXVlcnkuYXR0cmlidXRlcy5wdXNoKFt7IHR5cGU6ICdBVE9NJywgdmFsdWU6ICdDT05EU1RPUkUnIH1dKVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdPcGVuaW5nJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMocXVlcnksIFsnRVhJU1RTJywgJ0ZMQUdTJywgJ09LJ10sIHsgY3R4OiBvcHRpb25zLmN0eCB9KVxuICAgIGNvbnN0IG1haWxib3hJbmZvID0gcGFyc2VTRUxFQ1QocmVzcG9uc2UpXG5cbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9TRUxFQ1RFRClcblxuICAgIGlmICh0aGlzLl9zZWxlY3RlZE1haWxib3ggIT09IHBhdGggJiYgdGhpcy5vbmNsb3NlbWFpbGJveCkge1xuICAgICAgYXdhaXQgdGhpcy5vbmNsb3NlbWFpbGJveCh0aGlzLl9zZWxlY3RlZE1haWxib3gpXG4gICAgfVxuICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IHBhdGhcbiAgICBpZiAodGhpcy5vbnNlbGVjdG1haWxib3gpIHtcbiAgICAgIGF3YWl0IHRoaXMub25zZWxlY3RtYWlsYm94KHBhdGgsIG1haWxib3hJbmZvKVxuICAgIH1cblxuICAgIHJldHVybiBtYWlsYm94SW5mb1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgTkFNRVNQQUNFIGNvbW1hbmRcbiAgICpcbiAgICogTkFNRVNQQUNFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzIzNDJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBuYW1lc3BhY2Ugb2JqZWN0XG4gICAqL1xuICBhc3luYyBsaXN0TmFtZXNwYWNlcyAoKSB7XG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignTkFNRVNQQUNFJykgPCAwKSByZXR1cm4gZmFsc2VcblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMaXN0aW5nIG5hbWVzcGFjZXMuLi4nKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKCdOQU1FU1BBQ0UnLCAnTkFNRVNQQUNFJylcbiAgICByZXR1cm4gcGFyc2VOQU1FU1BBQ0UocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBMSVNUIGFuZCBMU1VCIGNvbW1hbmRzLiBSZXRyaWV2ZXMgYSB0cmVlIG9mIGF2YWlsYWJsZSBtYWlsYm94ZXNcbiAgICpcbiAgICogTElTVCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuOFxuICAgKiBMU1VCIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy45XG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggbGlzdCBvZiBtYWlsYm94ZXNcbiAgICovXG4gIGFzeW5jIGxpc3RNYWlsYm94ZXMgKCkge1xuICAgIGNvbnN0IHRyZWUgPSB7IHJvb3Q6IHRydWUsIGNoaWxkcmVuOiBbXSB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTGlzdGluZyBtYWlsYm94ZXMuLi4nKVxuICAgIGNvbnN0IGxpc3RSZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQ6ICdMSVNUJywgYXR0cmlidXRlczogWycnLCAnKiddIH0sICdMSVNUJylcbiAgICBjb25zdCBsaXN0ID0gcGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnTElTVCddLCBsaXN0UmVzcG9uc2UpXG4gICAgbGlzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgY29uc3QgYXR0ciA9IHByb3BPcihbXSwgJ2F0dHJpYnV0ZXMnLCBpdGVtKVxuICAgICAgaWYgKGF0dHIubGVuZ3RoIDwgMykgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhdGggPSBwYXRoT3IoJycsIFsnMicsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgZGVsaW0gPSBwYXRoT3IoJy8nLCBbJzEnLCAndmFsdWUnXSwgYXR0cilcbiAgICAgIGNvbnN0IGJyYW5jaCA9IHRoaXMuX2Vuc3VyZVBhdGgodHJlZSwgcGF0aCwgZGVsaW0pXG4gICAgICBicmFuY2guZmxhZ3MgPSBwcm9wT3IoW10sICcwJywgYXR0cikubWFwKCh7IHZhbHVlIH0pID0+IHZhbHVlIHx8ICcnKVxuICAgICAgYnJhbmNoLmxpc3RlZCA9IHRydWVcbiAgICAgIGNoZWNrU3BlY2lhbFVzZShicmFuY2gpXG4gICAgfSlcblxuICAgIGNvbnN0IGxzdWJSZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQ6ICdMU1VCJywgYXR0cmlidXRlczogWycnLCAnKiddIH0sICdMU1VCJylcbiAgICBjb25zdCBsc3ViID0gcGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnTFNVQiddLCBsc3ViUmVzcG9uc2UpXG4gICAgbHN1Yi5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBhdHRyID0gcHJvcE9yKFtdLCAnYXR0cmlidXRlcycsIGl0ZW0pXG4gICAgICBpZiAoYXR0ci5sZW5ndGggPCAzKSByZXR1cm5cblxuICAgICAgY29uc3QgcGF0aCA9IHBhdGhPcignJywgWycyJywgJ3ZhbHVlJ10sIGF0dHIpXG4gICAgICBjb25zdCBkZWxpbSA9IHBhdGhPcignLycsIFsnMScsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5fZW5zdXJlUGF0aCh0cmVlLCBwYXRoLCBkZWxpbSlcbiAgICAgIHByb3BPcihbXSwgJzAnLCBhdHRyKS5tYXAoKGZsYWcgPSAnJykgPT4geyBicmFuY2guZmxhZ3MgPSB1bmlvbihicmFuY2guZmxhZ3MsIFtmbGFnXSkgfSlcbiAgICAgIGJyYW5jaC5zdWJzY3JpYmVkID0gdHJ1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gdHJlZVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG1haWxib3ggd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAgICpcbiAgICogQ1JFQVRFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4zXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqICAgICBUaGUgcGF0aCBvZiB0aGUgbWFpbGJveCB5b3Ugd291bGQgbGlrZSB0byBjcmVhdGUuICBUaGlzIG1ldGhvZCB3aWxsXG4gICAqICAgICBoYW5kbGUgdXRmNyBlbmNvZGluZyBmb3IgeW91LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICogICAgIFByb21pc2UgcmVzb2x2ZXMgaWYgbWFpbGJveCB3YXMgY3JlYXRlZC5cbiAgICogICAgIEluIHRoZSBldmVudCB0aGUgc2VydmVyIHNheXMgTk8gW0FMUkVBRFlFWElTVFNdLCB3ZSB0cmVhdCB0aGF0IGFzIHN1Y2Nlc3MuXG4gICAqL1xuICBhc3luYyBjcmVhdGVNYWlsYm94IChwYXRoKSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NyZWF0aW5nIG1haWxib3gnLCBwYXRoLCAnLi4uJylcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5leGVjKHsgY29tbWFuZDogJ0NSRUFURScsIGF0dHJpYnV0ZXM6IFtpbWFwRW5jb2RlKHBhdGgpXSB9KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciAmJiBlcnIuY29kZSA9PT0gJ0FMUkVBRFlFWElTVFMnKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIG1haWxib3ggd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAgICpcbiAgICogREVMRVRFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuNFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiAgICAgVGhlIHBhdGggb2YgdGhlIG1haWxib3ggeW91IHdvdWxkIGxpa2UgdG8gZGVsZXRlLiAgVGhpcyBtZXRob2Qgd2lsbFxuICAgKiAgICAgaGFuZGxlIHV0ZjcgZW5jb2RpbmcgZm9yIHlvdS5cbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqICAgICBQcm9taXNlIHJlc29sdmVzIGlmIG1haWxib3ggd2FzIGRlbGV0ZWQuXG4gICAqL1xuICBkZWxldGVNYWlsYm94IChwYXRoKSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0RlbGV0aW5nIG1haWxib3gnLCBwYXRoLCAnLi4uJylcbiAgICByZXR1cm4gdGhpcy5leGVjKHsgY29tbWFuZDogJ0RFTEVURScsIGF0dHJpYnV0ZXM6IFtpbWFwRW5jb2RlKHBhdGgpXSB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgRkVUQ0ggY29tbWFuZFxuICAgKlxuICAgKiBGRVRDSCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNVxuICAgKiBDSEFOR0VEU0lOQ0UgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDU1MSNzZWN0aW9uLTMuM1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgU2VxdWVuY2Ugc2V0LCBlZyAxOiogZm9yIGFsbCBtZXNzYWdlc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW2l0ZW1zXSBNZXNzYWdlIGRhdGEgaXRlbSBuYW1lcyBvciBtYWNyb1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBmZXRjaGVkIG1lc3NhZ2UgaW5mb1xuICAgKi9cbiAgYXN5bmMgbGlzdE1lc3NhZ2VzIChwYXRoLCBzZXF1ZW5jZSwgaXRlbXMgPSBbeyBmYXN0OiB0cnVlIH1dLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRmV0Y2hpbmcgbWVzc2FnZXMnLCBzZXF1ZW5jZSwgJ2Zyb20nLCBwYXRoLCAnLi4uJylcbiAgICBjb25zdCBjb21tYW5kID0gYnVpbGRGRVRDSENvbW1hbmQoc2VxdWVuY2UsIGl0ZW1zLCBvcHRpb25zKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKGNvbW1hbmQsICdGRVRDSCcsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIHBhcnNlRkVUQ0gocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTRUFSQ0ggY29tbWFuZFxuICAgKlxuICAgKiBTRUFSQ0ggZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjRcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtPYmplY3R9IHF1ZXJ5IFNlYXJjaCB0ZXJtc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICBhc3luYyBzZWFyY2ggKHBhdGgsIHF1ZXJ5LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU2VhcmNoaW5nIGluJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgY29tbWFuZCA9IGJ1aWxkU0VBUkNIQ29tbWFuZChxdWVyeSwgb3B0aW9ucylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyhjb21tYW5kLCAnU0VBUkNIJywge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gcGFyc2VTRUFSQ0gocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTVE9SRSBjb21tYW5kXG4gICAqXG4gICAqIFNUT1JFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC42XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHNlbGVjdG9yIHdoaWNoIHRoZSBmbGFnIGNoYW5nZSBpcyBhcHBsaWVkIHRvXG4gICAqIEBwYXJhbSB7QXJyYXl9IGZsYWdzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIHNldEZsYWdzIChwYXRoLCBzZXF1ZW5jZSwgZmxhZ3MsIG9wdGlvbnMpIHtcbiAgICBsZXQga2V5ID0gJydcbiAgICBsZXQgbGlzdCA9IFtdXG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShmbGFncykgfHwgdHlwZW9mIGZsYWdzICE9PSAnb2JqZWN0Jykge1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncyB8fCBbXSlcbiAgICAgIGtleSA9ICcnXG4gICAgfSBlbHNlIGlmIChmbGFncy5hZGQpIHtcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3MuYWRkIHx8IFtdKVxuICAgICAga2V5ID0gJysnXG4gICAgfSBlbHNlIGlmIChmbGFncy5zZXQpIHtcbiAgICAgIGtleSA9ICcnXG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLnNldCB8fCBbXSlcbiAgICB9IGVsc2UgaWYgKGZsYWdzLnJlbW92ZSkge1xuICAgICAga2V5ID0gJy0nXG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLnJlbW92ZSB8fCBbXSlcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU2V0dGluZyBmbGFncyBvbicsIHNlcXVlbmNlLCAnaW4nLCBwYXRoLCAnLi4uJylcbiAgICByZXR1cm4gdGhpcy5zdG9yZShwYXRoLCBzZXF1ZW5jZSwga2V5ICsgJ0ZMQUdTJywgbGlzdCwgb3B0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNUT1JFIGNvbW1hbmRcbiAgICpcbiAgICogU1RPUkUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjZcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2Ugc2VsZWN0b3Igd2hpY2ggdGhlIGZsYWcgY2hhbmdlIGlzIGFwcGxpZWQgdG9cbiAgICogQHBhcmFtIHtTdHJpbmd9IGFjdGlvbiBTVE9SRSBtZXRob2QgdG8gY2FsbCwgZWcgXCIrRkxBR1NcIlxuICAgKiBAcGFyYW0ge0FycmF5fSBmbGFnc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICBhc3luYyBzdG9yZSAocGF0aCwgc2VxdWVuY2UsIGFjdGlvbiwgZmxhZ3MsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGNvbW1hbmQgPSBidWlsZFNUT1JFQ29tbWFuZChzZXF1ZW5jZSwgYWN0aW9uLCBmbGFncywgb3B0aW9ucylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyhjb21tYW5kLCAnRkVUQ0gnLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBwYXJzZUZFVENIKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgQVBQRU5EIGNvbW1hbmRcbiAgICpcbiAgICogQVBQRU5EIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4xMVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gVGhlIG1haWxib3ggd2hlcmUgdG8gYXBwZW5kIHRoZSBtZXNzYWdlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGFwcGVuZFxuICAgKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zLmZsYWdzIEFueSBmbGFncyB5b3Ugd2FudCB0byBzZXQgb24gdGhlIHVwbG9hZGVkIG1lc3NhZ2UuIERlZmF1bHRzIHRvIFtcXFNlZW5dLiAob3B0aW9uYWwpXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIGFzeW5jIHVwbG9hZCAoZGVzdGluYXRpb24sIG1lc3NhZ2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGZsYWdzID0gcHJvcE9yKFsnXFxcXFNlZW4nXSwgJ2ZsYWdzJywgb3B0aW9ucykubWFwKHZhbHVlID0+ICh7IHR5cGU6ICdhdG9tJywgdmFsdWUgfSkpXG4gICAgY29uc3QgY29tbWFuZCA9IHtcbiAgICAgIGNvbW1hbmQ6ICdBUFBFTkQnLFxuICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICB7IHR5cGU6ICdhdG9tJywgdmFsdWU6IGRlc3RpbmF0aW9uIH0sXG4gICAgICAgIGZsYWdzLFxuICAgICAgICB7IHR5cGU6ICdsaXRlcmFsJywgdmFsdWU6IG1lc3NhZ2UgfVxuICAgICAgXVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdVcGxvYWRpbmcgbWVzc2FnZSB0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyhjb21tYW5kKVxuICAgIHJldHVybiBwYXJzZUFQUEVORChyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIG1lc3NhZ2VzIGZyb20gYSBzZWxlY3RlZCBtYWlsYm94XG4gICAqXG4gICAqIEVYUFVOR0UgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjNcbiAgICogVUlEIEVYUFVOR0UgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDMxNSNzZWN0aW9uLTIuMVxuICAgKlxuICAgKiBJZiBwb3NzaWJsZSAoYnlVaWQ6dHJ1ZSBhbmQgVUlEUExVUyBleHRlbnNpb24gc3VwcG9ydGVkKSwgdXNlcyBVSUQgRVhQVU5HRVxuICAgKiBjb21tYW5kIHRvIGRlbGV0ZSBhIHJhbmdlIG9mIG1lc3NhZ2VzLCBvdGhlcndpc2UgZmFsbHMgYmFjayB0byBFWFBVTkdFLlxuICAgKlxuICAgKiBOQiEgVGhpcyBtZXRob2QgbWlnaHQgYmUgZGVzdHJ1Y3RpdmUgLSBpZiBFWFBVTkdFIGlzIHVzZWQsIHRoZW4gYW55IG1lc3NhZ2VzXG4gICAqIHdpdGggXFxEZWxldGVkIGZsYWcgc2V0IGFyZSBkZWxldGVkXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIGRlbGV0ZWRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAgICovXG4gIGFzeW5jIGRlbGV0ZU1lc3NhZ2VzIChwYXRoLCBzZXF1ZW5jZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgLy8gYWRkIFxcRGVsZXRlZCBmbGFnIHRvIHRoZSBtZXNzYWdlcyBhbmQgcnVuIEVYUFVOR0Ugb3IgVUlEIEVYUFVOR0VcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRGVsZXRpbmcgbWVzc2FnZXMnLCBzZXF1ZW5jZSwgJ2luJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgdXNlVWlkUGx1cyA9IG9wdGlvbnMuYnlVaWQgJiYgdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdVSURQTFVTJykgPj0gMFxuICAgIGNvbnN0IHVpZEV4cHVuZ2VDb21tYW5kID0geyBjb21tYW5kOiAnVUlEIEVYUFVOR0UnLCBhdHRyaWJ1dGVzOiBbeyB0eXBlOiAnc2VxdWVuY2UnLCB2YWx1ZTogc2VxdWVuY2UgfV0gfVxuICAgIGF3YWl0IHRoaXMuc2V0RmxhZ3MocGF0aCwgc2VxdWVuY2UsIHsgYWRkOiAnXFxcXERlbGV0ZWQnIH0sIG9wdGlvbnMpXG4gICAgY29uc3QgY21kID0gdXNlVWlkUGx1cyA/IHVpZEV4cHVuZ2VDb21tYW5kIDogJ0VYUFVOR0UnXG4gICAgcmV0dXJuIHRoaXMuZXhlYyhjbWQsIG51bGwsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgYWN0aXZlIG1haWxib3ggdG8gdGhlIGRlc3RpbmF0aW9uIG1haWxib3guXG4gICAqIFNpbGVudCBtZXRob2QgKHVubGVzcyBhbiBlcnJvciBvY2N1cnMpLCBieSBkZWZhdWx0IHJldHVybnMgbm8gaW5mb3JtYXRpb24uXG4gICAqXG4gICAqIENPUFkgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjdcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2UgcmFuZ2UgdG8gYmUgY29waWVkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZXN0aW5hdGlvbiBEZXN0aW5hdGlvbiBtYWlsYm94IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5ieVVpZF0gSWYgdHJ1ZSwgdXNlcyBVSUQgQ09QWSBpbnN0ZWFkIG9mIENPUFlcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAgICovXG4gIGFzeW5jIGNvcHlNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29weWluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICd0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7XG4gICAgICBjb21tYW5kOiBvcHRpb25zLmJ5VWlkID8gJ1VJRCBDT1BZJyA6ICdDT1BZJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgeyB0eXBlOiAnc2VxdWVuY2UnLCB2YWx1ZTogc2VxdWVuY2UgfSxcbiAgICAgICAgeyB0eXBlOiAnYXRvbScsIHZhbHVlOiBkZXN0aW5hdGlvbiB9XG4gICAgICBdXG4gICAgfSwgbnVsbCwge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gcGFyc2VDT1BZKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgYWN0aXZlIG1haWxib3ggdG8gdGhlIGRlc3RpbmF0aW9uIG1haWxib3guXG4gICAqIFByZWZlcnMgdGhlIE1PVkUgZXh0ZW5zaW9uIGJ1dCBpZiBub3QgYXZhaWxhYmxlLCBmYWxscyBiYWNrIHRvXG4gICAqIENPUFkgKyBFWFBVTkdFXG4gICAqXG4gICAqIE1PVkUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM2ODUxXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIG1vdmVkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZXN0aW5hdGlvbiBEZXN0aW5hdGlvbiBtYWlsYm94IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAgICovXG4gIGFzeW5jIG1vdmVNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTW92aW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJ3RvJywgZGVzdGluYXRpb24sICcuLi4nKVxuXG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignTU9WRScpID09PSAtMSkge1xuICAgICAgLy8gRmFsbGJhY2sgdG8gQ09QWSArIEVYUFVOR0VcbiAgICAgIGF3YWl0IHRoaXMuY29weU1lc3NhZ2VzKHBhdGgsIHNlcXVlbmNlLCBkZXN0aW5hdGlvbiwgb3B0aW9ucylcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZU1lc3NhZ2VzKHBhdGgsIHNlcXVlbmNlLCBvcHRpb25zKVxuICAgIH1cblxuICAgIC8vIElmIHBvc3NpYmxlLCB1c2UgTU9WRVxuICAgIHJldHVybiB0aGlzLmV4ZWMoe1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgTU9WRScgOiAnTU9WRScsXG4gICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgIHsgdHlwZTogJ3NlcXVlbmNlJywgdmFsdWU6IHNlcXVlbmNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2F0b20nLCB2YWx1ZTogZGVzdGluYXRpb24gfVxuICAgICAgXVxuICAgIH0sIFsnT0snXSwge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIENPTVBSRVNTIGNvbW1hbmRcbiAgICpcbiAgICogQ09NUFJFU1MgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDk3OFxuICAgKi9cbiAgYXN5bmMgY29tcHJlc3NDb25uZWN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2VuYWJsZUNvbXByZXNzaW9uIHx8IHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQ09NUFJFU1M9REVGTEFURScpIDwgMCB8fCB0aGlzLmNsaWVudC5jb21wcmVzc2VkKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW5hYmxpbmcgY29tcHJlc3Npb24uLi4nKVxuICAgIGF3YWl0IHRoaXMuZXhlYyh7XG4gICAgICBjb21tYW5kOiAnQ09NUFJFU1MnLFxuICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICB2YWx1ZTogJ0RFRkxBVEUnXG4gICAgICB9XVxuICAgIH0pXG4gICAgdGhpcy5jbGllbnQuZW5hYmxlQ29tcHJlc3Npb24oKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb21wcmVzc2lvbiBlbmFibGVkLCBhbGwgZGF0YSBzZW50IGFuZCByZWNlaXZlZCBpcyBkZWZsYXRlZCEnKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgTE9HSU4gb3IgQVVUSEVOVElDQVRFIFhPQVVUSDIgY29tbWFuZFxuICAgKlxuICAgKiBMT0dJTiBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjIuM1xuICAgKiBYT0FVVEgyIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwveG9hdXRoMl9wcm90b2NvbCNpbWFwX3Byb3RvY29sX2V4Y2hhbmdlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRoLnVzZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGgucGFzc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aC54b2F1dGgyXG4gICAqL1xuICBhc3luYyBsb2dpbiAoYXV0aCkge1xuICAgIGxldCBjb21tYW5kXG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9XG5cbiAgICBpZiAoIWF1dGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXV0aGVudGljYXRpb24gaW5mb3JtYXRpb24gbm90IHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdBVVRIPVhPQVVUSDInKSA+PSAwICYmIGF1dGggJiYgYXV0aC54b2F1dGgyKSB7XG4gICAgICBjb21tYW5kID0ge1xuICAgICAgICBjb21tYW5kOiAnQVVUSEVOVElDQVRFJyxcbiAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgIHsgdHlwZTogJ0FUT00nLCB2YWx1ZTogJ1hPQVVUSDInIH0sXG4gICAgICAgICAgeyB0eXBlOiAnQVRPTScsIHZhbHVlOiBidWlsZFhPQXV0aDJUb2tlbihhdXRoLnVzZXIsIGF1dGgueG9hdXRoMiksIHNlbnNpdGl2ZTogdHJ1ZSB9XG4gICAgICAgIF1cbiAgICAgIH1cblxuICAgICAgb3B0aW9ucy5lcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSA9IHRydWUgLy8gKyB0YWdnZWQgZXJyb3IgcmVzcG9uc2UgZXhwZWN0cyBhbiBlbXB0eSBsaW5lIGluIHJldHVyblxuICAgIH0gZWxzZSB7XG4gICAgICBjb21tYW5kID0ge1xuICAgICAgICBjb21tYW5kOiAnbG9naW4nLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgeyB0eXBlOiAnU1RSSU5HJywgdmFsdWU6IGF1dGgudXNlciB8fCAnJyB9LFxuICAgICAgICAgIHsgdHlwZTogJ1NUUklORycsIHZhbHVlOiBhdXRoLnBhc3MgfHwgJycsIHNlbnNpdGl2ZTogdHJ1ZSB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTG9nZ2luZyBpbi4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ2NhcGFiaWxpdHknLCBvcHRpb25zKVxuICAgIC8qXG4gICAgICogdXBkYXRlIHBvc3QtYXV0aCBjYXBhYmlsaXRlc1xuICAgICAqIGNhcGFiaWxpdHkgbGlzdCBzaG91bGRuJ3QgY29udGFpbiBhdXRoIHJlbGF0ZWQgc3R1ZmYgYW55bW9yZVxuICAgICAqIGJ1dCBzb21lIG5ldyBleHRlbnNpb25zIG1pZ2h0IGhhdmUgcG9wcGVkIHVwIHRoYXQgZG8gbm90XG4gICAgICogbWFrZSBtdWNoIHNlbnNlIGluIHRoZSBub24tYXV0aCBzdGF0ZVxuICAgICAqL1xuICAgIGlmIChyZXNwb25zZS5jYXBhYmlsaXR5ICYmIHJlc3BvbnNlLmNhcGFiaWxpdHkubGVuZ3RoKSB7XG4gICAgICAvLyBjYXBhYmlsaXRlcyB3ZXJlIGxpc3RlZCB3aXRoIHRoZSBPSyBbQ0FQQUJJTElUWSAuLi5dIHJlc3BvbnNlXG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UuY2FwYWJpbGl0eVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UucGF5bG9hZCAmJiByZXNwb25zZS5wYXlsb2FkLkNBUEFCSUxJVFkgJiYgcmVzcG9uc2UucGF5bG9hZC5DQVBBQklMSVRZLmxlbmd0aCkge1xuICAgICAgLy8gY2FwYWJpbGl0ZXMgd2VyZSBsaXN0ZWQgd2l0aCAqIENBUEFCSUxJVFkgLi4uIHJlc3BvbnNlXG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UucGF5bG9hZC5DQVBBQklMSVRZLnBvcCgpLmF0dHJpYnV0ZXMubWFwKChjYXBhID0gJycpID0+IGNhcGEudmFsdWUudG9VcHBlckNhc2UoKS50cmltKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNhcGFiaWxpdGllcyB3ZXJlIG5vdCBhdXRvbWF0aWNhbGx5IGxpc3RlZCwgcmVsb2FkXG4gICAgICBhd2FpdCB0aGlzLnVwZGF0ZUNhcGFiaWxpdHkodHJ1ZSlcbiAgICB9XG5cbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9BVVRIRU5USUNBVEVEKVxuICAgIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSB0cnVlXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xvZ2luIHN1Y2Nlc3NmdWwsIHBvc3QtYXV0aCBjYXBhYmlsaXRlcyB1cGRhdGVkIScsIHRoaXMuX2NhcGFiaWxpdHkpXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFuIElNQVAgY29tbWFuZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3QgU3RydWN0dXJlZCByZXF1ZXN0IG9iamVjdFxuICAgKiBAcGFyYW0ge0FycmF5fSBhY2NlcHRVbnRhZ2dlZCBhIGxpc3Qgb2YgdW50YWdnZWQgcmVzcG9uc2VzIHRoYXQgd2lsbCBiZSBpbmNsdWRlZCBpbiAncGF5bG9hZCcgcHJvcGVydHlcbiAgICovXG4gIGFzeW5jIGV4ZWMgKHJlcXVlc3QsIGFjY2VwdFVudGFnZ2VkLCBvcHRpb25zKSB7XG4gICAgdGhpcy5icmVha0lkbGUoKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5jbGllbnQuZW5xdWV1ZUNvbW1hbmQocmVxdWVzdCwgYWNjZXB0VW50YWdnZWQsIG9wdGlvbnMpXG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmNhcGFiaWxpdHkpIHtcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5jYXBhYmlsaXR5XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBjb25uZWN0aW9uIGlzIGlkbGluZy4gU2VuZHMgYSBOT09QIG9yIElETEUgY29tbWFuZFxuICAgKlxuICAgKiBJRExFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzIxNzdcbiAgICovXG4gIGVudGVySWRsZSAoKSB7XG4gICAgaWYgKHRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc3VwcG9ydHNJZGxlID0gdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdJRExFJykgPj0gMFxuICAgIHRoaXMuX2VudGVyZWRJZGxlID0gc3VwcG9ydHNJZGxlICYmIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA/ICdJRExFJyA6ICdOT09QJ1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbnRlcmluZyBpZGxlIHdpdGggJyArIHRoaXMuX2VudGVyZWRJZGxlKVxuXG4gICAgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnTk9PUCcpIHtcbiAgICAgIHRoaXMuX2lkbGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZW5kaW5nIE5PT1AnKVxuICAgICAgICB0aGlzLmV4ZWMoJ05PT1AnKVxuICAgICAgfSwgdGhpcy50aW1lb3V0Tm9vcClcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnSURMRScpIHtcbiAgICAgIHRoaXMuY2xpZW50LmVucXVldWVDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ0lETEUnXG4gICAgICB9KVxuICAgICAgdGhpcy5faWRsZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jbGllbnQuc2VuZCgnRE9ORVxcclxcbicpXG4gICAgICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0lkbGUgdGVybWluYXRlZCcpXG4gICAgICB9LCB0aGlzLnRpbWVvdXRJZGxlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBhY3Rpb25zIHJlbGF0ZWQgaWRsaW5nLCBpZiBJRExFIGlzIHN1cHBvcnRlZCwgc2VuZHMgRE9ORSB0byBzdG9wIGl0XG4gICAqL1xuICBicmVha0lkbGUgKCkge1xuICAgIGlmICghdGhpcy5fZW50ZXJlZElkbGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgICBpZiAodGhpcy5fZW50ZXJlZElkbGUgPT09ICdJRExFJykge1xuICAgICAgdGhpcy5jbGllbnQuc2VuZCgnRE9ORVxcclxcbicpXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnSWRsZSB0ZXJtaW5hdGVkJylcbiAgICB9XG4gICAgdGhpcy5fZW50ZXJlZElkbGUgPSBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU1RBUlRUTFMgY29tbWFuZCBpZiBuZWVkZWRcbiAgICpcbiAgICogU1RBUlRUTFMgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4yLjFcbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VkXSBCeSBkZWZhdWx0IHRoZSBjb21tYW5kIGlzIG5vdCBydW4gaWYgY2FwYWJpbGl0eSBpcyBhbHJlYWR5IGxpc3RlZC4gU2V0IHRvIHRydWUgdG8gc2tpcCB0aGlzIHZhbGlkYXRpb25cbiAgICovXG4gIGFzeW5jIHVwZ3JhZGVDb25uZWN0aW9uICgpIHtcbiAgICAvLyBza2lwIHJlcXVlc3QsIGlmIGFscmVhZHkgc2VjdXJlZFxuICAgIGlmICh0aGlzLmNsaWVudC5zZWN1cmVNb2RlKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBza2lwIGlmIFNUQVJUVExTIG5vdCBhdmFpbGFibGUgb3Igc3RhcnR0bHMgc3VwcG9ydCBkaXNhYmxlZFxuICAgIGlmICgodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdTVEFSVFRMUycpIDwgMCB8fCB0aGlzLl9pZ25vcmVUTFMpICYmICF0aGlzLl9yZXF1aXJlVExTKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW5jcnlwdGluZyBjb25uZWN0aW9uLi4uJylcbiAgICBhd2FpdCB0aGlzLmV4ZWMoJ1NUQVJUVExTJylcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gW11cbiAgICB0aGlzLmNsaWVudC51cGdyYWRlKClcbiAgICByZXR1cm4gdGhpcy51cGRhdGVDYXBhYmlsaXR5KClcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIENBUEFCSUxJVFkgY29tbWFuZFxuICAgKlxuICAgKiBDQVBBQklMSVRZIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMS4xXG4gICAqXG4gICAqIERvZXNuJ3QgcmVnaXN0ZXIgdW50YWdnZWQgQ0FQQUJJTElUWSBoYW5kbGVyIGFzIHRoaXMgaXMgYWxyZWFkeVxuICAgKiBoYW5kbGVkIGJ5IGdsb2JhbCBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlZF0gQnkgZGVmYXVsdCB0aGUgY29tbWFuZCBpcyBub3QgcnVuIGlmIGNhcGFiaWxpdHkgaXMgYWxyZWFkeSBsaXN0ZWQuIFNldCB0byB0cnVlIHRvIHNraXAgdGhpcyB2YWxpZGF0aW9uXG4gICAqL1xuICBhc3luYyB1cGRhdGVDYXBhYmlsaXR5IChmb3JjZWQpIHtcbiAgICAvLyBza2lwIHJlcXVlc3QsIGlmIG5vdCBmb3JjZWQgdXBkYXRlIGFuZCBjYXBhYmlsaXRpZXMgYXJlIGFscmVhZHkgbG9hZGVkXG4gICAgaWYgKCFmb3JjZWQgJiYgdGhpcy5fY2FwYWJpbGl0eS5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIFNUQVJUVExTIGlzIHJlcXVpcmVkIHRoZW4gc2tpcCBjYXBhYmlsaXR5IGxpc3RpbmcgYXMgd2UgYXJlIGdvaW5nIHRvIHRyeVxuICAgIC8vIFNUQVJUVExTIGFueXdheSBhbmQgd2UgcmUtY2hlY2sgY2FwYWJpbGl0aWVzIGFmdGVyIGNvbm5lY3Rpb24gaXMgc2VjdXJlZFxuICAgIGlmICghdGhpcy5jbGllbnQuc2VjdXJlTW9kZSAmJiB0aGlzLl9yZXF1aXJlVExTKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBkYXRpbmcgY2FwYWJpbGl0eS4uLicpXG4gICAgcmV0dXJuIHRoaXMuZXhlYygnQ0FQQUJJTElUWScpXG4gIH1cblxuICBoYXNDYXBhYmlsaXR5IChjYXBhID0gJycpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKGNhcGEudG9VcHBlckNhc2UoKS50cmltKCkpID49IDBcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlcnMgZm9yIHVudGFnZ2VkIHJlc3BvbnNlc1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYW4gdW50YWdnZWQgT0sgaW5jbHVkZXMgW0NBUEFCSUxJVFldIHRhZyBhbmQgdXBkYXRlcyBjYXBhYmlsaXR5IG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkT2tIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXBhYmlsaXR5KSB7XG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UuY2FwYWJpbGl0eVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGNhcGFiaWxpdHkgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRDYXBhYmlsaXR5SGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcGlwZShcbiAgICAgIHByb3BPcihbXSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgIG1hcCgoeyB2YWx1ZSB9KSA9PiAodmFsdWUgfHwgJycpLnRvVXBwZXJDYXNlKCkudHJpbSgpKVxuICAgICkocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBleGlzdGluZyBtZXNzYWdlIGNvdW50XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRFeGlzdHNIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzcG9uc2UsICducicpKSB7XG4gICAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZXhpc3RzJywgcmVzcG9uc2UubnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBhIG1lc3NhZ2UgaGFzIGJlZW4gZGVsZXRlZFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXNwb25zZSwgJ25yJykpIHtcbiAgICAgIHRoaXMub251cGRhdGUgJiYgdGhpcy5vbnVwZGF0ZSh0aGlzLl9zZWxlY3RlZE1haWxib3gsICdleHB1bmdlJywgcmVzcG9uc2UubnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IGZsYWdzIGhhdmUgYmVlbiB1cGRhdGVkIGZvciBhIG1lc3NhZ2VcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZEZldGNoSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZmV0Y2gnLCBbXS5jb25jYXQocGFyc2VGRVRDSCh7IHBheWxvYWQ6IHsgRkVUQ0g6IFtyZXNwb25zZV0gfSB9KSB8fCBbXSkuc2hpZnQoKSlcbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyc1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgY29ubmVjdGlvbiBzdGFydGVkIGlkbGluZy4gSW5pdGlhdGVzIGEgY3ljbGVcbiAgICogb2YgTk9PUHMgb3IgSURMRXMgdG8gcmVjZWl2ZSBub3RpZmljYXRpb25zIGFib3V0IHVwZGF0ZXMgaW4gdGhlIHNlcnZlclxuICAgKi9cbiAgX29uSWRsZSAoKSB7XG4gICAgaWYgKCF0aGlzLl9hdXRoZW50aWNhdGVkIHx8IHRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIElETEUgd2hlbiBub3QgbG9nZ2VkIGluIG9yIGFscmVhZHkgaWRsaW5nXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ2xpZW50IHN0YXJ0ZWQgaWRsaW5nJylcbiAgICB0aGlzLmVudGVySWRsZSgpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgSU1BUCBzdGF0ZSB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgY29ubmVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbmV3U3RhdGUgVGhlIHN0YXRlIHlvdSB3YW50IHRvIGNoYW5nZSB0b1xuICAgKi9cbiAgX2NoYW5nZVN0YXRlIChuZXdTdGF0ZSkge1xuICAgIGlmIChuZXdTdGF0ZSA9PT0gdGhpcy5fc3RhdGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbnRlcmluZyBzdGF0ZTogJyArIG5ld1N0YXRlKVxuXG4gICAgLy8gaWYgYSBtYWlsYm94IHdhcyBvcGVuZWQsIGVtaXQgb25jbG9zZW1haWxib3ggYW5kIGNsZWFyIHNlbGVjdGVkTWFpbGJveCB2YWx1ZVxuICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gU1RBVEVfU0VMRUNURUQgJiYgdGhpcy5fc2VsZWN0ZWRNYWlsYm94KSB7XG4gICAgICB0aGlzLm9uY2xvc2VtYWlsYm94ICYmIHRoaXMub25jbG9zZW1haWxib3godGhpcy5fc2VsZWN0ZWRNYWlsYm94KVxuICAgICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlXG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyBhIHBhdGggZXhpc3RzIGluIHRoZSBNYWlsYm94IHRyZWVcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHRyZWUgTWFpbGJveCB0cmVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZWxpbWl0ZXJcbiAgICogQHJldHVybiB7T2JqZWN0fSBicmFuY2ggZm9yIHVzZWQgcGF0aFxuICAgKi9cbiAgX2Vuc3VyZVBhdGggKHRyZWUsIHBhdGgsIGRlbGltaXRlcikge1xuICAgIGNvbnN0IG5hbWVzID0gcGF0aC5zcGxpdChkZWxpbWl0ZXIpXG4gICAgbGV0IGJyYW5jaCA9IHRyZWVcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGJyYW5jaC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICBpZiAodGhpcy5fY29tcGFyZU1haWxib3hOYW1lcyhicmFuY2guY2hpbGRyZW5bal0ubmFtZSwgaW1hcERlY29kZShuYW1lc1tpXSkpKSB7XG4gICAgICAgICAgYnJhbmNoID0gYnJhbmNoLmNoaWxkcmVuW2pdXG4gICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICBicmFuY2guY2hpbGRyZW4ucHVzaCh7XG4gICAgICAgICAgbmFtZTogaW1hcERlY29kZShuYW1lc1tpXSksXG4gICAgICAgICAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIsXG4gICAgICAgICAgcGF0aDogbmFtZXMuc2xpY2UoMCwgaSArIDEpLmpvaW4oZGVsaW1pdGVyKSxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfSlcbiAgICAgICAgYnJhbmNoID0gYnJhbmNoLmNoaWxkcmVuW2JyYW5jaC5jaGlsZHJlbi5sZW5ndGggLSAxXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoXG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZXMgdHdvIG1haWxib3ggbmFtZXMuIENhc2UgaW5zZW5zaXRpdmUgaW4gY2FzZSBvZiBJTkJPWCwgb3RoZXJ3aXNlIGNhc2Ugc2Vuc2l0aXZlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhIE1haWxib3ggbmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYiBNYWlsYm94IG5hbWVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIGZvbGRlciBuYW1lcyBtYXRjaFxuICAgKi9cbiAgX2NvbXBhcmVNYWlsYm94TmFtZXMgKGEsIGIpIHtcbiAgICByZXR1cm4gKGEudG9VcHBlckNhc2UoKSA9PT0gJ0lOQk9YJyA/ICdJTkJPWCcgOiBhKSA9PT0gKGIudG9VcHBlckNhc2UoKSA9PT0gJ0lOQk9YJyA/ICdJTkJPWCcgOiBiKVxuICB9XG5cbiAgY3JlYXRlTG9nZ2VyIChjcmVhdG9yID0gY3JlYXRlRGVmYXVsdExvZ2dlcikge1xuICAgIGNvbnN0IGxvZ2dlciA9IGNyZWF0b3IoKHRoaXMuX2F1dGggfHwge30pLnVzZXIgfHwgJycsIHRoaXMuX2hvc3QpXG4gICAgdGhpcy5sb2dnZXIgPSB0aGlzLmNsaWVudC5sb2dnZXIgPSB7XG4gICAgICBkZWJ1ZzogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9ERUJVRyA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci5kZWJ1Zyhtc2dzKSB9IH0sXG4gICAgICBpbmZvOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX0lORk8gPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIuaW5mbyhtc2dzKSB9IH0sXG4gICAgICB3YXJuOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX1dBUk4gPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIud2Fybihtc2dzKSB9IH0sXG4gICAgICBlcnJvcjogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9FUlJPUiA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci5lcnJvcihtc2dzKSB9IH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==