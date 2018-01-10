'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CLIENT_ID = exports.STATE_LOGOUT = exports.STATE_SELECTED = exports.STATE_AUTHENTICATED = exports.STATE_NOT_AUTHENTICATED = exports.STATE_CONNECTING = exports.TIMEOUT_IDLE = exports.TIMEOUT_NOOP = exports.TIMEOUT_CONNECTION = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TIMEOUT_CONNECTION = exports.TIMEOUT_CONNECTION = 90 * 1000; // Milliseconds to wait for the IMAP greeting from the server
var TIMEOUT_NOOP = exports.TIMEOUT_NOOP = 60 * 1000; // Milliseconds between NOOP commands while idling
var TIMEOUT_IDLE = exports.TIMEOUT_IDLE = 60 * 1000; // Milliseconds until IDLE command is cancelled

var STATE_CONNECTING = exports.STATE_CONNECTING = 1;
var STATE_NOT_AUTHENTICATED = exports.STATE_NOT_AUTHENTICATED = 2;
var STATE_AUTHENTICATED = exports.STATE_AUTHENTICATED = 3;
var STATE_SELECTED = exports.STATE_SELECTED = 4;
var STATE_LOGOUT = exports.STATE_LOGOUT = 5;

var DEFAULT_CLIENT_ID = exports.DEFAULT_CLIENT_ID = {
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
};
var Client = function () {
  function Client(host, port) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Client);

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


  _createClass(Client, [{
    key: '_onError',
    value: function _onError(err) {
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

  }, {
    key: 'connect',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this._openConnection();

              case 3:
                this._changeState(STATE_NOT_AUTHENTICATED);
                _context.next = 6;
                return this.updateCapability();

              case 6:
                _context.next = 8;
                return this.upgradeConnection();

              case 8:
                _context.prev = 8;
                _context.next = 11;
                return this.updateId(this._clientId);

              case 11:
                _context.next = 16;
                break;

              case 13:
                _context.prev = 13;
                _context.t0 = _context['catch'](8);

                this.logger.warn('Failed to update server id!', _context.t0.message);

              case 16:
                _context.next = 18;
                return this.login(this._auth);

              case 18:
                _context.next = 20;
                return this.compressConnection();

              case 20:
                this.logger.debug('Connection established, ready to roll!');
                this.client.onerror = this._onError.bind(this);
                _context.next = 29;
                break;

              case 24:
                _context.prev = 24;
                _context.t1 = _context['catch'](0);

                this.logger.error('Could not connect to server', _context.t1);
                this.close(_context.t1); // we don't really care whether this works or not
                throw _context.t1;

              case 29:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 24], [8, 13]]);
      }));

      function connect() {
        return _ref.apply(this, arguments);
      }

      return connect;
    }()
  }, {
    key: '_openConnection',
    value: function _openConnection() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var connectionTimeout = setTimeout(function () {
          return reject(new Error('Timeout connecting to server'));
        }, _this2.timeoutConnection);
        _this2.logger.debug('Connecting to', _this2.client.host, ':', _this2.client.port);
        _this2._changeState(STATE_CONNECTING);
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

  }, {
    key: 'logout',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this._changeState(STATE_LOGOUT);
                this.logger.debug('Logging out...');
                _context2.next = 4;
                return this.client.logout();

              case 4:
                clearTimeout(this._idleTimeout);

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function logout() {
        return _ref2.apply(this, arguments);
      }

      return logout;
    }()

    /**
     * Force-closes the current connection by closing the TCP socket.
     *
     * @returns {Promise} Resolves when socket is closed
     */

  }, {
    key: 'close',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this._changeState(STATE_LOGOUT);
                clearTimeout(this._idleTimeout);
                this.logger.debug('Closing connection...');
                _context3.next = 5;
                return this.client.close(err);

              case 5:
                clearTimeout(this._idleTimeout);

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function close(_x2) {
        return _ref3.apply(this, arguments);
      }

      return close;
    }()

    /**
     * Runs ID command, parses ID response, sets this.serverId
     *
     * ID details:
     *   http://tools.ietf.org/html/rfc2971
     *
     * @param {Object} id ID as JSON object. See http://tools.ietf.org/html/rfc2971#section-3.3 for possible values
     * @returns {Promise} Resolves when response has been parsed
     */

  }, {
    key: 'updateId',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(id) {
        var command, attributes, response, list, keys, values;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(this._capability.indexOf('ID') < 0)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return');

              case 2:

                this.logger.debug('Updating id...');

                command = 'ID';
                attributes = id ? [(0, _ramda.flatten)(Object.entries(id))] : [null];
                _context4.next = 7;
                return this.exec({ command: command, attributes: attributes }, 'ID');

              case 7:
                response = _context4.sent;
                list = (0, _ramda.flatten)((0, _ramda.pathOr)([], ['payload', 'ID', '0', 'attributes', '0'], response).map(Object.values));
                keys = list.filter(function (_, i) {
                  return i % 2 === 0;
                });
                values = list.filter(function (_, i) {
                  return i % 2 === 1;
                });

                this.serverId = (0, _ramda.fromPairs)((0, _ramda.zip)(keys, values));
                this.logger.debug('Server id updated!', this.serverId);

              case 13:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function updateId(_x3) {
        return _ref4.apply(this, arguments);
      }

      return updateId;
    }()
  }, {
    key: '_shouldSelectMailbox',
    value: function _shouldSelectMailbox(path, ctx) {
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

  }, {
    key: 'selectMailbox',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(path) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var query, response, mailboxInfo;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                query = {
                  command: options.readOnly ? 'EXAMINE' : 'SELECT',
                  attributes: [{ type: 'STRING', value: path }]
                };


                if (options.condstore && this._capability.indexOf('CONDSTORE') >= 0) {
                  query.attributes.push([{ type: 'ATOM', value: 'CONDSTORE' }]);
                }

                this.logger.debug('Opening', path, '...');
                _context5.next = 5;
                return this.exec(query, ['EXISTS', 'FLAGS', 'OK'], { ctx: options.ctx });

              case 5:
                response = _context5.sent;
                mailboxInfo = (0, _commandParser.parseSELECT)(response);


                this._changeState(STATE_SELECTED);

                if (!(this._selectedMailbox !== path && this.onclosemailbox)) {
                  _context5.next = 11;
                  break;
                }

                _context5.next = 11;
                return this.onclosemailbox(this._selectedMailbox);

              case 11:
                this._selectedMailbox = path;

                if (!this.onselectmailbox) {
                  _context5.next = 15;
                  break;
                }

                _context5.next = 15;
                return this.onselectmailbox(path, mailboxInfo);

              case 15:
                return _context5.abrupt('return', mailboxInfo);

              case 16:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function selectMailbox(_x5) {
        return _ref5.apply(this, arguments);
      }

      return selectMailbox;
    }()

    /**
     * Runs NAMESPACE command
     *
     * NAMESPACE details:
     *   https://tools.ietf.org/html/rfc2342
     *
     * @returns {Promise} Promise with namespace object
     */

  }, {
    key: 'listNamespaces',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var response;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!(this._capability.indexOf('NAMESPACE') < 0)) {
                  _context6.next = 2;
                  break;
                }

                return _context6.abrupt('return', false);

              case 2:

                this.logger.debug('Listing namespaces...');
                _context6.next = 5;
                return this.exec('NAMESPACE', 'NAMESPACE');

              case 5:
                response = _context6.sent;
                return _context6.abrupt('return', (0, _commandParser.parseNAMESPACE)(response));

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function listNamespaces() {
        return _ref6.apply(this, arguments);
      }

      return listNamespaces;
    }()

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

  }, {
    key: 'listMailboxes',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var _this3 = this;

        var tree, listResponse, list, lsubResponse, lsub;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                tree = { root: true, children: [] };


                this.logger.debug('Listing mailboxes...');
                _context7.next = 4;
                return this.exec({ command: 'LIST', attributes: ['', '*'] }, 'LIST');

              case 4:
                listResponse = _context7.sent;
                list = (0, _ramda.pathOr)([], ['payload', 'LIST'], listResponse);

                list.forEach(function (item) {
                  var attr = (0, _ramda.propOr)([], 'attributes', item);
                  if (!attr.length < 3) return;

                  var path = (0, _ramda.pathOr)('', ['2', 'value'], attr);
                  var delim = (0, _ramda.pathOr)('/', ['1', 'value'], attr);
                  var branch = _this3._ensurePath(tree, path, delim);
                  branch.flags = (0, _ramda.propOr)([], '0', attr).map(function (_ref8) {
                    var value = _ref8.value;
                    return value || '';
                  });
                  branch.listed = true;
                  (0, _specialUse.checkSpecialUse)(branch);
                });

                _context7.next = 9;
                return this.exec({ command: 'LSUB', attributes: ['', '*'] }, 'LSUB');

              case 9:
                lsubResponse = _context7.sent;
                lsub = (0, _ramda.pathOr)([], ['payload', 'LSUB'], lsubResponse);

                lsub.forEach(function (item) {
                  var attr = (0, _ramda.propOr)([], 'attributes', item);
                  if (!attr.length < 3) return;

                  var path = (0, _ramda.pathOr)('', ['2', 'value'], attr);
                  var delim = (0, _ramda.pathOr)('/', ['1', 'value'], attr);
                  var branch = _this3._ensurePath(tree, path, delim);
                  (0, _ramda.propOr)([], '0', attr).map(function () {
                    var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                    branch.flags = (0, _ramda.union)(branch.flags, [flag]);
                  });
                  branch.subscribed = true;
                });

                return _context7.abrupt('return', tree);

              case 13:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function listMailboxes() {
        return _ref7.apply(this, arguments);
      }

      return listMailboxes;
    }()

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

  }, {
    key: 'createMailbox',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(path) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                this.logger.debug('Creating mailbox', path, '...');
                _context8.prev = 1;
                _context8.next = 4;
                return this.exec({ command: 'CREATE', attributes: [(0, _emailjsUtf.imapEncode)(path)] });

              case 4:
                _context8.next = 11;
                break;

              case 6:
                _context8.prev = 6;
                _context8.t0 = _context8['catch'](1);

                if (!(_context8.t0 && _context8.t0.code === 'ALREADYEXISTS')) {
                  _context8.next = 10;
                  break;
                }

                return _context8.abrupt('return');

              case 10:
                throw _context8.t0;

              case 11:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this, [[1, 6]]);
      }));

      function createMailbox(_x7) {
        return _ref9.apply(this, arguments);
      }

      return createMailbox;
    }()

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

  }, {
    key: 'listMessages',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(path, sequence) {
        var _this4 = this;

        var items = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [{ fast: true }];
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var command, response;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                this.logger.debug('Fetching messages', sequence, 'from', path, '...');
                command = (0, _commandBuilder.buildFETCHCommand)(sequence, items, options);
                _context9.next = 4;
                return this.exec(command, 'FETCH', {
                  precheck: function precheck(ctx) {
                    return _this4._shouldSelectMailbox(path, ctx) ? _this4.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
                  }
                });

              case 4:
                response = _context9.sent;
                return _context9.abrupt('return', (0, _commandParser.parseFETCH)(response));

              case 6:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function listMessages(_x10, _x11) {
        return _ref10.apply(this, arguments);
      }

      return listMessages;
    }()

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

  }, {
    key: 'search',
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(path, query) {
        var _this5 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var command, response;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                this.logger.debug('Searching in', path, '...');
                command = (0, _commandBuilder.buildSEARCHCommand)(query, options);
                _context10.next = 4;
                return this.exec(command, 'SEARCH', {
                  precheck: function precheck(ctx) {
                    return _this5._shouldSelectMailbox(path, ctx) ? _this5.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
                  }
                });

              case 4:
                response = _context10.sent;
                return _context10.abrupt('return', (0, _commandParser.parseSEARCH)(response));

              case 6:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function search(_x13, _x14) {
        return _ref11.apply(this, arguments);
      }

      return search;
    }()

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

  }, {
    key: 'setFlags',
    value: function setFlags(path, sequence, flags, options) {
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

  }, {
    key: 'store',
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(path, sequence, action, flags) {
        var _this6 = this;

        var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
        var command, response;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                command = (0, _commandBuilder.buildSTORECommand)(sequence, action, flags, options);
                _context11.next = 3;
                return this.exec(command, 'FETCH', {
                  precheck: function precheck(ctx) {
                    return _this6._shouldSelectMailbox(path, ctx) ? _this6.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
                  }
                });

              case 3:
                response = _context11.sent;
                return _context11.abrupt('return', (0, _commandParser.parseFETCH)(response));

              case 5:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function store(_x16, _x17, _x18, _x19) {
        return _ref12.apply(this, arguments);
      }

      return store;
    }()

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

  }, {
    key: 'upload',
    value: function upload(destination, message) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var flags = (0, _ramda.propOr)(['\\Seen'], 'flags', options).map(function (value) {
        return { type: 'atom', value: value };
      });
      var command = {
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

  }, {
    key: 'deleteMessages',
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(path, sequence) {
        var _this7 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var useUidPlus, uidExpungeCommand, cmd;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                // add \Deleted flag to the messages and run EXPUNGE or UID EXPUNGE
                this.logger.debug('Deleting messages', sequence, 'in', path, '...');
                useUidPlus = options.byUid && this._capability.indexOf('UIDPLUS') >= 0;
                uidExpungeCommand = { command: 'UID EXPUNGE', attributes: [{ type: 'sequence', value: sequence }] };
                _context12.next = 5;
                return this.setFlags(path, sequence, { add: '\\Deleted' }, options);

              case 5:
                cmd = useUidPlus ? uidExpungeCommand : 'EXPUNGE';
                return _context12.abrupt('return', this.exec(cmd, null, {
                  precheck: function precheck(ctx) {
                    return _this7._shouldSelectMailbox(path, ctx) ? _this7.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
                  }
                }));

              case 7:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function deleteMessages(_x22, _x23) {
        return _ref13.apply(this, arguments);
      }

      return deleteMessages;
    }()

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

  }, {
    key: 'copyMessages',
    value: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(path, sequence, destination) {
        var _this8 = this;

        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        var _ref15, humanReadable;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                this.logger.debug('Copying messages', sequence, 'from', path, 'to', destination, '...');
                _context13.next = 3;
                return this.exec({
                  command: options.byUid ? 'UID COPY' : 'COPY',
                  attributes: [{ type: 'sequence', value: sequence }, { type: 'atom', value: destination }]
                }, null, {
                  precheck: function precheck(ctx) {
                    return _this8._shouldSelectMailbox(path, ctx) ? _this8.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
                  }
                });

              case 3:
                _ref15 = _context13.sent;
                humanReadable = _ref15.humanReadable;
                return _context13.abrupt('return', humanReadable || 'COPY completed');

              case 6:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function copyMessages(_x25, _x26, _x27) {
        return _ref14.apply(this, arguments);
      }

      return copyMessages;
    }()

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

  }, {
    key: 'moveMessages',
    value: function () {
      var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(path, sequence, destination) {
        var _this9 = this;

        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                this.logger.debug('Moving messages', sequence, 'from', path, 'to', destination, '...');

                if (!(this._capability.indexOf('MOVE') === -1)) {
                  _context14.next = 5;
                  break;
                }

                _context14.next = 4;
                return this.copyMessages(path, sequence, destination, options);

              case 4:
                return _context14.abrupt('return', this.deleteMessages(path, sequence, options));

              case 5:
                return _context14.abrupt('return', this.exec({
                  command: options.byUid ? 'UID MOVE' : 'MOVE',
                  attributes: [{ type: 'sequence', value: sequence }, { type: 'atom', value: destination }]
                }, ['OK'], {
                  precheck: function precheck(ctx) {
                    return _this9._shouldSelectMailbox(path, ctx) ? _this9.selectMailbox(path, { ctx: ctx }) : Promise.resolve();
                  }
                }));

              case 6:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function moveMessages(_x29, _x30, _x31) {
        return _ref16.apply(this, arguments);
      }

      return moveMessages;
    }()

    /**
     * Runs COMPRESS command
     *
     * COMPRESS details:
     *   https://tools.ietf.org/html/rfc4978
     */

  }, {
    key: 'compressConnection',
    value: function () {
      var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                if (!(!this._enableCompression || this._capability.indexOf('COMPRESS=DEFLATE') < 0 || this.client.compressed)) {
                  _context15.next = 2;
                  break;
                }

                return _context15.abrupt('return', false);

              case 2:

                this.logger.debug('Enabling compression...');
                _context15.next = 5;
                return this.exec({
                  command: 'COMPRESS',
                  attributes: [{
                    type: 'ATOM',
                    value: 'DEFLATE'
                  }]
                });

              case 5:
                this.client.enableCompression();
                this.logger.debug('Compression enabled, all data sent and received is deflated!');

              case 7:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function compressConnection() {
        return _ref17.apply(this, arguments);
      }

      return compressConnection;
    }()

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

  }, {
    key: 'login',
    value: function () {
      var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(auth) {
        var command, options, response;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                command = void 0;
                options = {};

                if (auth) {
                  _context16.next = 4;
                  break;
                }

                throw new Error('Authentication information not provided');

              case 4:

                if (this._capability.indexOf('AUTH=XOAUTH2') >= 0 && auth && auth.xoauth2) {
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

                this.logger.debug('Logging in...');
                response = this.exec(command, 'capability', options);
                /*
                 * update post-auth capabilites
                 * capability list shouldn't contain auth related stuff anymore
                 * but some new extensions might have popped up that do not
                 * make much sense in the non-auth state
                 */

                if (!(response.capability && response.capability.length)) {
                  _context16.next = 11;
                  break;
                }

                // capabilites were listed with the OK [CAPABILITY ...] response
                this._capability = response.capability;
                _context16.next = 17;
                break;

              case 11:
                if (!(response.payload && response.payload.CAPABILITY && response.payload.CAPABILITY.length)) {
                  _context16.next = 15;
                  break;
                }

                // capabilites were listed with * CAPABILITY ... response
                this._capability = response.payload.CAPABILITY.pop().attributes.map(function () {
                  var capa = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                  return capa.value.toUpperCase().trim();
                });
                _context16.next = 17;
                break;

              case 15:
                _context16.next = 17;
                return this.updateCapability(true);

              case 17:

                this._changeState(STATE_AUTHENTICATED);
                this._authenticated = true;
                this.logger.debug('Login successful, post-auth capabilites updated!', this._capability);

              case 20:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function login(_x32) {
        return _ref18.apply(this, arguments);
      }

      return login;
    }()

    /**
     * Run an IMAP command.
     *
     * @param {Object} request Structured request object
     * @param {Array} acceptUntagged a list of untagged responses that will be included in 'payload' property
     */

  }, {
    key: 'exec',
    value: function () {
      var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(request, acceptUntagged, options) {
        var response;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                this.breakIdle();
                _context17.next = 3;
                return this.client.enqueueCommand(request, acceptUntagged, options);

              case 3:
                response = _context17.sent;

                if (response && response.capability) {
                  this._capability = response.capability;
                }
                return _context17.abrupt('return', response);

              case 6:
              case 'end':
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function exec(_x34, _x35, _x36) {
        return _ref19.apply(this, arguments);
      }

      return exec;
    }()

    /**
     * The connection is idling. Sends a NOOP or IDLE command
     *
     * IDLE details:
     *   https://tools.ietf.org/html/rfc2177
     */

  }, {
    key: 'enterIdle',
    value: function enterIdle() {
      var _this10 = this;

      if (this._enteredIdle) {
        return;
      }
      this._enteredIdle = this._capability.indexOf('IDLE') >= 0 ? 'IDLE' : 'NOOP';
      this.logger.debug('Entering idle with ' + this._enteredIdle);

      if (this._enteredIdle === 'NOOP') {
        this._idleTimeout = setTimeout(function () {
          _this10.logger.debug('Sending NOOP');
          _this10.exec('NOOP');
        }, this.timeoutNoop);
      } else if (this._enteredIdle === 'IDLE') {
        this.client.enqueueCommand({
          command: 'IDLE'
        });
        this._idleTimeout = setTimeout(function () {
          _this10.client.send('DONE\r\n');
          _this10._enteredIdle = false;
          _this10.logger.debug('Idle terminated');
        }, this.timeoutIdle);
      }
    }

    /**
     * Stops actions related idling, if IDLE is supported, sends DONE to stop it
     */

  }, {
    key: 'breakIdle',
    value: function breakIdle() {
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

  }, {
    key: 'upgradeConnection',
    value: function () {
      var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                if (!this.client.secureMode) {
                  _context18.next = 2;
                  break;
                }

                return _context18.abrupt('return', false);

              case 2:
                if (!((this._capability.indexOf('STARTTLS') < 0 || this._ignoreTLS) && !this._requireTLS)) {
                  _context18.next = 4;
                  break;
                }

                return _context18.abrupt('return', false);

              case 4:

                this.logger.debug('Encrypting connection...');
                _context18.next = 7;
                return this.exec('STARTTLS');

              case 7:
                this._capability = [];
                this.client.upgrade();
                return _context18.abrupt('return', this.updateCapability());

              case 10:
              case 'end':
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function upgradeConnection() {
        return _ref20.apply(this, arguments);
      }

      return upgradeConnection;
    }()

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

  }, {
    key: 'updateCapability',
    value: function () {
      var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(forced) {
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                if (!(!forced && this._capability.length)) {
                  _context19.next = 2;
                  break;
                }

                return _context19.abrupt('return');

              case 2:
                if (!(!this.client.secureMode && this._requireTLS)) {
                  _context19.next = 4;
                  break;
                }

                return _context19.abrupt('return');

              case 4:

                this.logger.debug('Updating capability...');
                return _context19.abrupt('return', this.exec('CAPABILITY'));

              case 6:
              case 'end':
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function updateCapability(_x37) {
        return _ref21.apply(this, arguments);
      }

      return updateCapability;
    }()
  }, {
    key: 'hasCapability',
    value: function hasCapability() {
      var capa = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      return this._capability.indexOf(capa.toUpperCase().trim()) >= 0;
    }

    // Default handlers for untagged responses

    /**
     * Checks if an untagged OK includes [CAPABILITY] tag and updates capability object
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */

  }, {
    key: '_untaggedOkHandler',
    value: function _untaggedOkHandler(response) {
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

  }, {
    key: '_untaggedCapabilityHandler',
    value: function _untaggedCapabilityHandler(response) {
      this._capability = (0, _ramda.pipe)((0, _ramda.propOr)([], 'attributes'), (0, _ramda.map)(function (_ref22) {
        var value = _ref22.value;
        return (value || '').toUpperCase().trim();
      }))(response);
    }

    /**
     * Updates existing message count
     *
     * @param {Object} response Parsed server response
     * @param {Function} next Until called, server responses are not processed
     */

  }, {
    key: '_untaggedExistsHandler',
    value: function _untaggedExistsHandler(response) {
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

  }, {
    key: '_untaggedExpungeHandler',
    value: function _untaggedExpungeHandler(response) {
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

  }, {
    key: '_untaggedFetchHandler',
    value: function _untaggedFetchHandler(response) {
      this.onupdate && this.onupdate(this._selectedMailbox, 'fetch', [].concat((0, _commandParser.parseFETCH)({ payload: { FETCH: [response] } }) || []).shift());
    }

    // Private helpers

    /**
     * Indicates that the connection started idling. Initiates a cycle
     * of NOOPs or IDLEs to receive notifications about updates in the server
     */

  }, {
    key: '_onIdle',
    value: function _onIdle() {
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

  }, {
    key: '_changeState',
    value: function _changeState(newState) {
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

  }, {
    key: '_ensurePath',
    value: function _ensurePath(tree, path, delimiter) {
      var names = path.split(delimiter);
      var branch = tree;

      for (var i = 0; i < names.length; i++) {
        var found = false;
        for (var j = 0; j < branch.children.length; j++) {
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

  }, {
    key: '_compareMailboxNames',
    value: function _compareMailboxNames(a, b) {
      return (a.toUpperCase() === 'INBOX' ? 'INBOX' : a) === (b.toUpperCase() === 'INBOX' ? 'INBOX' : b);
    }
  }, {
    key: 'createLogger',
    value: function createLogger() {
      var _this11 = this;

      var creator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _logger2.default;

      var logger = creator(this._auth.user || '', this._host);
      this.logger = this.client.logger = {
        debug: function debug() {
          for (var _len = arguments.length, msgs = Array(_len), _key = 0; _key < _len; _key++) {
            msgs[_key] = arguments[_key];
          }

          if (_common.LOG_LEVEL_DEBUG >= _this11.logLevel) {
            logger.debug(msgs);
          }
        },
        info: function info() {
          for (var _len2 = arguments.length, msgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            msgs[_key2] = arguments[_key2];
          }

          if (_common.LOG_LEVEL_INFO >= _this11.logLevel) {
            logger.info(msgs);
          }
        },
        warn: function warn() {
          for (var _len3 = arguments.length, msgs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            msgs[_key3] = arguments[_key3];
          }

          if (_common.LOG_LEVEL_WARN >= _this11.logLevel) {
            logger.warn(msgs);
          }
        },
        error: function error() {
          for (var _len4 = arguments.length, msgs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            msgs[_key4] = arguments[_key4];
          }

          if (_common.LOG_LEVEL_ERROR >= _this11.logLevel) {
            logger.error(msgs);
          }
        }
      };
    }
  }]);

  return Client;
}();

exports.default = Client;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiVElNRU9VVF9DT05ORUNUSU9OIiwiVElNRU9VVF9OT09QIiwiVElNRU9VVF9JRExFIiwiU1RBVEVfQ09OTkVDVElORyIsIlNUQVRFX05PVF9BVVRIRU5USUNBVEVEIiwiU1RBVEVfQVVUSEVOVElDQVRFRCIsIlNUQVRFX1NFTEVDVEVEIiwiU1RBVEVfTE9HT1VUIiwiREVGQVVMVF9DTElFTlRfSUQiLCJuYW1lIiwiQ2xpZW50IiwiaG9zdCIsInBvcnQiLCJvcHRpb25zIiwidGltZW91dENvbm5lY3Rpb24iLCJ0aW1lb3V0Tm9vcCIsInRpbWVvdXRJZGxlIiwic2VydmVySWQiLCJvbmNlcnQiLCJvbnVwZGF0ZSIsIm9uc2VsZWN0bWFpbGJveCIsIm9uY2xvc2VtYWlsYm94IiwiX2hvc3QiLCJfY2xpZW50SWQiLCJfc3RhdGUiLCJfYXV0aGVudGljYXRlZCIsIl9jYXBhYmlsaXR5IiwiX3NlbGVjdGVkTWFpbGJveCIsIl9lbnRlcmVkSWRsZSIsIl9pZGxlVGltZW91dCIsIl9lbmFibGVDb21wcmVzc2lvbiIsImVuYWJsZUNvbXByZXNzaW9uIiwiX2F1dGgiLCJhdXRoIiwiX3JlcXVpcmVUTFMiLCJyZXF1aXJlVExTIiwiX2lnbm9yZVRMUyIsImlnbm9yZVRMUyIsImNsaWVudCIsIm9uZXJyb3IiLCJfb25FcnJvciIsImJpbmQiLCJjZXJ0Iiwib25pZGxlIiwiX29uSWRsZSIsInNldEhhbmRsZXIiLCJyZXNwb25zZSIsIl91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyIiwiX3VudGFnZ2VkT2tIYW5kbGVyIiwiX3VudGFnZ2VkRXhpc3RzSGFuZGxlciIsIl91bnRhZ2dlZEV4cHVuZ2VIYW5kbGVyIiwiX3VudGFnZ2VkRmV0Y2hIYW5kbGVyIiwiY3JlYXRlTG9nZ2VyIiwibG9nTGV2ZWwiLCJMT0dfTEVWRUxfQUxMIiwiZXJyIiwiY2xlYXJUaW1lb3V0IiwiX29wZW5Db25uZWN0aW9uIiwiX2NoYW5nZVN0YXRlIiwidXBkYXRlQ2FwYWJpbGl0eSIsInVwZ3JhZGVDb25uZWN0aW9uIiwidXBkYXRlSWQiLCJsb2dnZXIiLCJ3YXJuIiwibWVzc2FnZSIsImxvZ2luIiwiY29tcHJlc3NDb25uZWN0aW9uIiwiZGVidWciLCJlcnJvciIsImNsb3NlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjb25uZWN0aW9uVGltZW91dCIsInNldFRpbWVvdXQiLCJFcnJvciIsImNvbm5lY3QiLCJ0aGVuIiwib25yZWFkeSIsImNhdGNoIiwibG9nb3V0IiwiaWQiLCJpbmRleE9mIiwiY29tbWFuZCIsImF0dHJpYnV0ZXMiLCJPYmplY3QiLCJlbnRyaWVzIiwiZXhlYyIsImxpc3QiLCJtYXAiLCJ2YWx1ZXMiLCJrZXlzIiwiZmlsdGVyIiwiXyIsImkiLCJwYXRoIiwiY3R4IiwicHJldmlvdXNTZWxlY3QiLCJnZXRQcmV2aW91c2x5UXVldWVkIiwicmVxdWVzdCIsInBhdGhBdHRyaWJ1dGUiLCJmaW5kIiwiYXR0cmlidXRlIiwidHlwZSIsInZhbHVlIiwicXVlcnkiLCJyZWFkT25seSIsImNvbmRzdG9yZSIsInB1c2giLCJtYWlsYm94SW5mbyIsInRyZWUiLCJyb290IiwiY2hpbGRyZW4iLCJsaXN0UmVzcG9uc2UiLCJmb3JFYWNoIiwiYXR0ciIsIml0ZW0iLCJsZW5ndGgiLCJkZWxpbSIsImJyYW5jaCIsIl9lbnN1cmVQYXRoIiwiZmxhZ3MiLCJsaXN0ZWQiLCJsc3ViUmVzcG9uc2UiLCJsc3ViIiwiZmxhZyIsInN1YnNjcmliZWQiLCJjb2RlIiwic2VxdWVuY2UiLCJpdGVtcyIsImZhc3QiLCJwcmVjaGVjayIsIl9zaG91bGRTZWxlY3RNYWlsYm94Iiwic2VsZWN0TWFpbGJveCIsImtleSIsIkFycmF5IiwiaXNBcnJheSIsImNvbmNhdCIsImFkZCIsInNldCIsInJlbW92ZSIsInN0b3JlIiwiYWN0aW9uIiwiZGVzdGluYXRpb24iLCJ1c2VVaWRQbHVzIiwiYnlVaWQiLCJ1aWRFeHB1bmdlQ29tbWFuZCIsInNldEZsYWdzIiwiY21kIiwiaHVtYW5SZWFkYWJsZSIsImNvcHlNZXNzYWdlcyIsImRlbGV0ZU1lc3NhZ2VzIiwiY29tcHJlc3NlZCIsInhvYXV0aDIiLCJ1c2VyIiwic2Vuc2l0aXZlIiwiZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUiLCJwYXNzIiwiY2FwYWJpbGl0eSIsInBheWxvYWQiLCJDQVBBQklMSVRZIiwicG9wIiwiY2FwYSIsInRvVXBwZXJDYXNlIiwidHJpbSIsImFjY2VwdFVudGFnZ2VkIiwiYnJlYWtJZGxlIiwiZW5xdWV1ZUNvbW1hbmQiLCJzZW5kIiwic2VjdXJlTW9kZSIsInVwZ3JhZGUiLCJmb3JjZWQiLCJoYXNPd25Qcm9wZXJ0eSIsIm5yIiwiRkVUQ0giLCJzaGlmdCIsImVudGVySWRsZSIsIm5ld1N0YXRlIiwiZGVsaW1pdGVyIiwibmFtZXMiLCJzcGxpdCIsImZvdW5kIiwiaiIsIl9jb21wYXJlTWFpbGJveE5hbWVzIiwic2xpY2UiLCJqb2luIiwiYSIsImIiLCJjcmVhdG9yIiwibXNncyIsImluZm8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBTUE7O0FBT0E7Ozs7QUFDQTs7OztBQUNBOztBQU9BOzs7Ozs7OztBQUlPLElBQU1BLGtEQUFxQixLQUFLLElBQWhDLEMsQ0FBcUM7QUFDckMsSUFBTUMsc0NBQWUsS0FBSyxJQUExQixDLENBQStCO0FBQy9CLElBQU1DLHNDQUFlLEtBQUssSUFBMUIsQyxDQUErQjs7QUFFL0IsSUFBTUMsOENBQW1CLENBQXpCO0FBQ0EsSUFBTUMsNERBQTBCLENBQWhDO0FBQ0EsSUFBTUMsb0RBQXNCLENBQTVCO0FBQ0EsSUFBTUMsMENBQWlCLENBQXZCO0FBQ0EsSUFBTUMsc0NBQWUsQ0FBckI7O0FBRUEsSUFBTUMsZ0RBQW9CO0FBQy9CQyxRQUFNOztBQUdSOzs7Ozs7Ozs7QUFKaUMsQ0FBMUI7SUFhY0MsTTtBQUNuQixrQkFBYUMsSUFBYixFQUFtQkMsSUFBbkIsRUFBdUM7QUFBQTs7QUFBQSxRQUFkQyxPQUFj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QixLQUFLcEksS0FBcEMsQ0FBZjtBQUNBLFdBQUt3QyxNQUFMLEdBQWMsS0FBS3hCLE1BQUwsQ0FBWXdCLE1BQVosR0FBcUI7QUFDakNLLGVBQU8saUJBQWE7QUFBQSw0Q0FBVDBILElBQVM7QUFBVEEsZ0JBQVM7QUFBQTs7QUFBRSxjQUFJLDJCQUFtQixRQUFLeEksUUFBNUIsRUFBc0M7QUFBRVMsbUJBQU9LLEtBQVAsQ0FBYTBILElBQWI7QUFBb0I7QUFBRSxTQURuRDtBQUVqQ0MsY0FBTSxnQkFBYTtBQUFBLDZDQUFURCxJQUFTO0FBQVRBLGdCQUFTO0FBQUE7O0FBQUUsY0FBSSwwQkFBa0IsUUFBS3hJLFFBQTNCLEVBQXFDO0FBQUVTLG1CQUFPZ0ksSUFBUCxDQUFZRCxJQUFaO0FBQW1CO0FBQUUsU0FGaEQ7QUFHakM5SCxjQUFNLGdCQUFhO0FBQUEsNkNBQVQ4SCxJQUFTO0FBQVRBLGdCQUFTO0FBQUE7O0FBQUUsY0FBSSwwQkFBa0IsUUFBS3hJLFFBQTNCLEVBQXFDO0FBQUVTLG1CQUFPQyxJQUFQLENBQVk4SCxJQUFaO0FBQW1CO0FBQUUsU0FIaEQ7QUFJakN6SCxlQUFPLGlCQUFhO0FBQUEsNkNBQVR5SCxJQUFTO0FBQVRBLGdCQUFTO0FBQUE7O0FBQUUsY0FBSSwyQkFBbUIsUUFBS3hJLFFBQTVCLEVBQXNDO0FBQUVTLG1CQUFPTSxLQUFQLENBQWF5SCxJQUFiO0FBQW9CO0FBQUU7QUFKbkQsT0FBbkM7QUFNRDs7Ozs7O2tCQW4zQmtCbkwsTSIsImZpbGUiOiJjbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtYXAsIHBpcGUsIHVuaW9uLCB6aXAsIGZyb21QYWlycywgcHJvcE9yLCBwYXRoT3IsIGZsYXR0ZW4gfSBmcm9tICdyYW1kYSdcbmltcG9ydCB7IGltYXBFbmNvZGUsIGltYXBEZWNvZGUgfSBmcm9tICdlbWFpbGpzLXV0ZjcnXG5pbXBvcnQge1xuICBwYXJzZU5BTUVTUEFDRSxcbiAgcGFyc2VTRUxFQ1QsXG4gIHBhcnNlRkVUQ0gsXG4gIHBhcnNlU0VBUkNIXG59IGZyb20gJy4vY29tbWFuZC1wYXJzZXInXG5pbXBvcnQge1xuICBidWlsZEZFVENIQ29tbWFuZCxcbiAgYnVpbGRYT0F1dGgyVG9rZW4sXG4gIGJ1aWxkU0VBUkNIQ29tbWFuZCxcbiAgYnVpbGRTVE9SRUNvbW1hbmRcbn0gZnJvbSAnLi9jb21tYW5kLWJ1aWxkZXInXG5cbmltcG9ydCBjcmVhdGVEZWZhdWx0TG9nZ2VyIGZyb20gJy4vbG9nZ2VyJ1xuaW1wb3J0IEltYXBDbGllbnQgZnJvbSAnLi9pbWFwJ1xuaW1wb3J0IHtcbiAgTE9HX0xFVkVMX0VSUk9SLFxuICBMT0dfTEVWRUxfV0FSTixcbiAgTE9HX0xFVkVMX0lORk8sXG4gIExPR19MRVZFTF9ERUJVR1xufSBmcm9tICcuL2NvbW1vbidcblxuaW1wb3J0IHtcbiAgY2hlY2tTcGVjaWFsVXNlXG59IGZyb20gJy4vc3BlY2lhbC11c2UnXG5cbmV4cG9ydCBjb25zdCBUSU1FT1VUX0NPTk5FQ1RJT04gPSA5MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIHRoZSBJTUFQIGdyZWV0aW5nIGZyb20gdGhlIHNlcnZlclxuZXhwb3J0IGNvbnN0IFRJTUVPVVRfTk9PUCA9IDYwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgYmV0d2VlbiBOT09QIGNvbW1hbmRzIHdoaWxlIGlkbGluZ1xuZXhwb3J0IGNvbnN0IFRJTUVPVVRfSURMRSA9IDYwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgdW50aWwgSURMRSBjb21tYW5kIGlzIGNhbmNlbGxlZFxuXG5leHBvcnQgY29uc3QgU1RBVEVfQ09OTkVDVElORyA9IDFcbmV4cG9ydCBjb25zdCBTVEFURV9OT1RfQVVUSEVOVElDQVRFRCA9IDJcbmV4cG9ydCBjb25zdCBTVEFURV9BVVRIRU5USUNBVEVEID0gM1xuZXhwb3J0IGNvbnN0IFNUQVRFX1NFTEVDVEVEID0gNFxuZXhwb3J0IGNvbnN0IFNUQVRFX0xPR09VVCA9IDVcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ0xJRU5UX0lEID0ge1xuICBuYW1lOiAnZW1haWxqcy1pbWFwLWNsaWVudCdcbn1cblxuLyoqXG4gKiBlbWFpbGpzIElNQVAgY2xpZW50XG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtob3N0PSdsb2NhbGhvc3QnXSBIb3N0bmFtZSB0byBjb25lbmN0IHRvXG4gKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9MTQzXSBQb3J0IG51bWJlciB0byBjb25uZWN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudCB7XG4gIGNvbnN0cnVjdG9yIChob3N0LCBwb3J0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnRpbWVvdXRDb25uZWN0aW9uID0gVElNRU9VVF9DT05ORUNUSU9OXG4gICAgdGhpcy50aW1lb3V0Tm9vcCA9IFRJTUVPVVRfTk9PUFxuICAgIHRoaXMudGltZW91dElkbGUgPSBUSU1FT1VUX0lETEVcblxuICAgIHRoaXMuc2VydmVySWQgPSBmYWxzZSAvLyBSRkMgMjk3MSBTZXJ2ZXIgSUQgYXMga2V5IHZhbHVlIHBhaXJzXG5cbiAgICAvLyBFdmVudCBwbGFjZWhvbGRlcnNcbiAgICB0aGlzLm9uY2VydCA9IG51bGxcbiAgICB0aGlzLm9udXBkYXRlID0gbnVsbFxuICAgIHRoaXMub25zZWxlY3RtYWlsYm94ID0gbnVsbFxuICAgIHRoaXMub25jbG9zZW1haWxib3ggPSBudWxsXG5cbiAgICB0aGlzLl9ob3N0ID0gaG9zdFxuICAgIHRoaXMuX2NsaWVudElkID0gcHJvcE9yKERFRkFVTFRfQ0xJRU5UX0lELCAnaWQnLCBvcHRpb25zKVxuICAgIHRoaXMuX3N0YXRlID0gZmFsc2UgLy8gQ3VycmVudCBzdGF0ZVxuICAgIHRoaXMuX2F1dGhlbnRpY2F0ZWQgPSBmYWxzZSAvLyBJcyB0aGUgY29ubmVjdGlvbiBhdXRoZW50aWNhdGVkXG4gICAgdGhpcy5fY2FwYWJpbGl0eSA9IFtdIC8vIExpc3Qgb2YgZXh0ZW5zaW9ucyB0aGUgc2VydmVyIHN1cHBvcnRzXG4gICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gZmFsc2UgLy8gU2VsZWN0ZWQgbWFpbGJveFxuICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgICB0aGlzLl9pZGxlVGltZW91dCA9IGZhbHNlXG4gICAgdGhpcy5fZW5hYmxlQ29tcHJlc3Npb24gPSAhIW9wdGlvbnMuZW5hYmxlQ29tcHJlc3Npb25cbiAgICB0aGlzLl9hdXRoID0gb3B0aW9ucy5hdXRoXG4gICAgdGhpcy5fcmVxdWlyZVRMUyA9ICEhb3B0aW9ucy5yZXF1aXJlVExTXG4gICAgdGhpcy5faWdub3JlVExTID0gISFvcHRpb25zLmlnbm9yZVRMU1xuXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgSW1hcENsaWVudChob3N0LCBwb3J0LCBvcHRpb25zKSAvLyBJTUFQIGNsaWVudCBvYmplY3RcblxuICAgIC8vIEV2ZW50IEhhbmRsZXJzXG4gICAgdGhpcy5jbGllbnQub25lcnJvciA9IHRoaXMuX29uRXJyb3IuYmluZCh0aGlzKVxuICAgIHRoaXMuY2xpZW50Lm9uY2VydCA9IChjZXJ0KSA9PiAodGhpcy5vbmNlcnQgJiYgdGhpcy5vbmNlcnQoY2VydCkpIC8vIGFsbG93cyBjZXJ0aWZpY2F0ZSBoYW5kbGluZyBmb3IgcGxhdGZvcm1zIHcvbyBuYXRpdmUgdGxzIHN1cHBvcnRcbiAgICB0aGlzLmNsaWVudC5vbmlkbGUgPSAoKSA9PiB0aGlzLl9vbklkbGUoKSAvLyBzdGFydCBpZGxpbmdcblxuICAgIC8vIERlZmF1bHQgaGFuZGxlcnMgZm9yIHVudGFnZ2VkIHJlc3BvbnNlc1xuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2NhcGFiaWxpdHknLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIocmVzcG9uc2UpKSAvLyBjYXBhYmlsaXR5IHVwZGF0ZXNcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdvaycsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRPa0hhbmRsZXIocmVzcG9uc2UpKSAvLyBub3RpZmljYXRpb25zXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignZXhpc3RzJywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZEV4aXN0c0hhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGNvdW50IGhhcyBjaGFuZ2VkXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignZXhwdW5nZScsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRFeHB1bmdlSGFuZGxlcihyZXNwb25zZSkpIC8vIG1lc3NhZ2UgaGFzIGJlZW4gZGVsZXRlZFxuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2ZldGNoJywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZEZldGNoSGFuZGxlcihyZXNwb25zZSkpIC8vIG1lc3NhZ2UgaGFzIGJlZW4gdXBkYXRlZCAoZWcuIGZsYWcgY2hhbmdlKVxuXG4gICAgLy8gQWN0aXZhdGUgbG9nZ2luZ1xuICAgIHRoaXMuY3JlYXRlTG9nZ2VyKClcbiAgICB0aGlzLmxvZ0xldmVsID0gdGhpcy5MT0dfTEVWRUxfQUxMXG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGlmIHRoZSBsb3dlci1sZXZlbCBJbWFwQ2xpZW50IGhhcyBlbmNvdW50ZXJlZCBhbiB1bnJlY292ZXJhYmxlXG4gICAqIGVycm9yIGR1cmluZyBvcGVyYXRpb24uIENsZWFucyB1cCBhbmQgcHJvcGFnYXRlcyB0aGUgZXJyb3IgdXB3YXJkcy5cbiAgICovXG4gIF9vbkVycm9yIChlcnIpIHtcbiAgICAvLyBtYWtlIHN1cmUgbm8gaWRsZSB0aW1lb3V0IGlzIHBlbmRpbmcgYW55bW9yZVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcblxuICAgIC8vIHByb3BhZ2F0ZSB0aGUgZXJyb3IgdXB3YXJkc1xuICAgIHRoaXMub25lcnJvciAmJiB0aGlzLm9uZXJyb3IoZXJyKVxuICB9XG5cbiAgLy9cbiAgLy9cbiAgLy8gUFVCTElDIEFQSVxuICAvL1xuICAvL1xuXG4gIC8qKlxuICAgKiBJbml0aWF0ZSBjb25uZWN0aW9uIHRvIHRoZSBJTUFQIHNlcnZlclxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGVuIGxvZ2luIHByb2NlZHVyZSBpcyBjb21wbGV0ZVxuICAgKi9cbiAgYXN5bmMgY29ubmVjdCAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuX29wZW5Db25uZWN0aW9uKClcbiAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX05PVF9BVVRIRU5USUNBVEVEKVxuICAgICAgYXdhaXQgdGhpcy51cGRhdGVDYXBhYmlsaXR5KClcbiAgICAgIGF3YWl0IHRoaXMudXBncmFkZUNvbm5lY3Rpb24oKVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVJZCh0aGlzLl9jbGllbnRJZClcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuKCdGYWlsZWQgdG8gdXBkYXRlIHNlcnZlciBpZCEnLCBlcnIubWVzc2FnZSlcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdGhpcy5sb2dpbih0aGlzLl9hdXRoKVxuICAgICAgYXdhaXQgdGhpcy5jb21wcmVzc0Nvbm5lY3Rpb24oKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nvbm5lY3Rpb24gZXN0YWJsaXNoZWQsIHJlYWR5IHRvIHJvbGwhJylcbiAgICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXInLCBlcnIpXG4gICAgICB0aGlzLmNsb3NlKGVycikgLy8gd2UgZG9uJ3QgcmVhbGx5IGNhcmUgd2hldGhlciB0aGlzIHdvcmtzIG9yIG5vdFxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgX29wZW5Db25uZWN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGNvbm5lY3Rpb25UaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiByZWplY3QobmV3IEVycm9yKCdUaW1lb3V0IGNvbm5lY3RpbmcgdG8gc2VydmVyJykpLCB0aGlzLnRpbWVvdXRDb25uZWN0aW9uKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nvbm5lY3RpbmcgdG8nLCB0aGlzLmNsaWVudC5ob3N0LCAnOicsIHRoaXMuY2xpZW50LnBvcnQpXG4gICAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9DT05ORUNUSU5HKVxuICAgICAgdGhpcy5jbGllbnQuY29ubmVjdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU29ja2V0IG9wZW5lZCwgd2FpdGluZyBmb3IgZ3JlZXRpbmcgZnJvbSB0aGUgc2VydmVyLi4uJylcblxuICAgICAgICB0aGlzLmNsaWVudC5vbnJlYWR5ID0gKCkgPT4ge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjb25uZWN0aW9uVGltZW91dClcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNvbm5lY3Rpb25UaW1lb3V0KVxuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIExvZ291dFxuICAgKlxuICAgKiBTZW5kIExPR09VVCwgdG8gd2hpY2ggdGhlIHNlcnZlciByZXNwb25kcyBieSBjbG9zaW5nIHRoZSBjb25uZWN0aW9uLlxuICAgKiBVc2UgaXMgZGlzY291cmFnZWQgaWYgbmV0d29yayBzdGF0dXMgaXMgdW5jbGVhciEgSWYgbmV0d29ya3Mgc3RhdHVzIGlzXG4gICAqIHVuY2xlYXIsIHBsZWFzZSB1c2UgI2Nsb3NlIGluc3RlYWQhXG4gICAqXG4gICAqIExPR09VVCBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4xLjNcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gc2VydmVyIGhhcyBjbG9zZWQgdGhlIGNvbm5lY3Rpb25cbiAgICovXG4gIGFzeW5jIGxvZ291dCAoKSB7XG4gICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfTE9HT1VUKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dnaW5nIG91dC4uLicpXG4gICAgYXdhaXQgdGhpcy5jbGllbnQubG9nb3V0KClcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gIH1cblxuICAvKipcbiAgICogRm9yY2UtY2xvc2VzIHRoZSBjdXJyZW50IGNvbm5lY3Rpb24gYnkgY2xvc2luZyB0aGUgVENQIHNvY2tldC5cbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gc29ja2V0IGlzIGNsb3NlZFxuICAgKi9cbiAgYXN5bmMgY2xvc2UgKGVycikge1xuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0xPR09VVClcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0Nsb3NpbmcgY29ubmVjdGlvbi4uLicpXG4gICAgYXdhaXQgdGhpcy5jbGllbnQuY2xvc2UoZXJyKVxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIElEIGNvbW1hbmQsIHBhcnNlcyBJRCByZXNwb25zZSwgc2V0cyB0aGlzLnNlcnZlcklkXG4gICAqXG4gICAqIElEIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjk3MVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gaWQgSUQgYXMgSlNPTiBvYmplY3QuIFNlZSBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyOTcxI3NlY3Rpb24tMy4zIGZvciBwb3NzaWJsZSB2YWx1ZXNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gcmVzcG9uc2UgaGFzIGJlZW4gcGFyc2VkXG4gICAqL1xuICBhc3luYyB1cGRhdGVJZCAoaWQpIHtcbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdJRCcpIDwgMCkgcmV0dXJuXG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBkYXRpbmcgaWQuLi4nKVxuXG4gICAgY29uc3QgY29tbWFuZCA9ICdJRCdcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gaWQgPyBbIGZsYXR0ZW4oT2JqZWN0LmVudHJpZXMoaWQpKSBdIDogWyBudWxsIF1cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQsIGF0dHJpYnV0ZXMgfSwgJ0lEJylcbiAgICBjb25zdCBsaXN0ID0gZmxhdHRlbihwYXRoT3IoW10sIFsncGF5bG9hZCcsICdJRCcsICcwJywgJ2F0dHJpYnV0ZXMnLCAnMCddLCByZXNwb25zZSkubWFwKE9iamVjdC52YWx1ZXMpKVxuICAgIGNvbnN0IGtleXMgPSBsaXN0LmZpbHRlcigoXywgaSkgPT4gaSAlIDIgPT09IDApXG4gICAgY29uc3QgdmFsdWVzID0gbGlzdC5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAxKVxuICAgIHRoaXMuc2VydmVySWQgPSBmcm9tUGFpcnMoemlwKGtleXMsIHZhbHVlcykpXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlcnZlciBpZCB1cGRhdGVkIScsIHRoaXMuc2VydmVySWQpXG4gIH1cblxuICBfc2hvdWxkU2VsZWN0TWFpbGJveCAocGF0aCwgY3R4KSB7XG4gICAgaWYgKCFjdHgpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNTZWxlY3QgPSB0aGlzLmNsaWVudC5nZXRQcmV2aW91c2x5UXVldWVkKFsnU0VMRUNUJywgJ0VYQU1JTkUnXSwgY3R4KVxuICAgIGlmIChwcmV2aW91c1NlbGVjdCAmJiBwcmV2aW91c1NlbGVjdC5yZXF1ZXN0LmF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHBhdGhBdHRyaWJ1dGUgPSBwcmV2aW91c1NlbGVjdC5yZXF1ZXN0LmF0dHJpYnV0ZXMuZmluZCgoYXR0cmlidXRlKSA9PiBhdHRyaWJ1dGUudHlwZSA9PT0gJ1NUUklORycpXG4gICAgICBpZiAocGF0aEF0dHJpYnV0ZSkge1xuICAgICAgICByZXR1cm4gcGF0aEF0dHJpYnV0ZS52YWx1ZSAhPT0gcGF0aFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZE1haWxib3ggIT09IHBhdGhcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNFTEVDVCBvciBFWEFNSU5FIHRvIG9wZW4gYSBtYWlsYm94XG4gICAqXG4gICAqIFNFTEVDVCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMVxuICAgKiBFWEFNSU5FIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy4yXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIEZ1bGwgcGF0aCB0byBtYWlsYm94XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBvYmplY3RcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc2VsZWN0ZWQgbWFpbGJveFxuICAgKi9cbiAgYXN5bmMgc2VsZWN0TWFpbGJveCAocGF0aCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHF1ZXJ5ID0ge1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5yZWFkT25seSA/ICdFWEFNSU5FJyA6ICdTRUxFQ1QnLFxuICAgICAgYXR0cmlidXRlczogW3sgdHlwZTogJ1NUUklORycsIHZhbHVlOiBwYXRoIH1dXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuY29uZHN0b3JlICYmIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQ09ORFNUT1JFJykgPj0gMCkge1xuICAgICAgcXVlcnkuYXR0cmlidXRlcy5wdXNoKFt7IHR5cGU6ICdBVE9NJywgdmFsdWU6ICdDT05EU1RPUkUnIH1dKVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdPcGVuaW5nJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMocXVlcnksIFsnRVhJU1RTJywgJ0ZMQUdTJywgJ09LJ10sIHsgY3R4OiBvcHRpb25zLmN0eCB9KVxuICAgIGxldCBtYWlsYm94SW5mbyA9IHBhcnNlU0VMRUNUKHJlc3BvbnNlKVxuXG4gICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfU0VMRUNURUQpXG5cbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRNYWlsYm94ICE9PSBwYXRoICYmIHRoaXMub25jbG9zZW1haWxib3gpIHtcbiAgICAgIGF3YWl0IHRoaXMub25jbG9zZW1haWxib3godGhpcy5fc2VsZWN0ZWRNYWlsYm94KVxuICAgIH1cbiAgICB0aGlzLl9zZWxlY3RlZE1haWxib3ggPSBwYXRoXG4gICAgaWYgKHRoaXMub25zZWxlY3RtYWlsYm94KSB7XG4gICAgICBhd2FpdCB0aGlzLm9uc2VsZWN0bWFpbGJveChwYXRoLCBtYWlsYm94SW5mbylcbiAgICB9XG5cbiAgICByZXR1cm4gbWFpbGJveEluZm9cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIE5BTUVTUEFDRSBjb21tYW5kXG4gICAqXG4gICAqIE5BTUVTUEFDRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMzQyXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggbmFtZXNwYWNlIG9iamVjdFxuICAgKi9cbiAgYXN5bmMgbGlzdE5hbWVzcGFjZXMgKCkge1xuICAgIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ05BTUVTUEFDRScpIDwgMCkgcmV0dXJuIGZhbHNlXG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTGlzdGluZyBuYW1lc3BhY2VzLi4uJylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYygnTkFNRVNQQUNFJywgJ05BTUVTUEFDRScpXG4gICAgcmV0dXJuIHBhcnNlTkFNRVNQQUNFKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgTElTVCBhbmQgTFNVQiBjb21tYW5kcy4gUmV0cmlldmVzIGEgdHJlZSBvZiBhdmFpbGFibGUgbWFpbGJveGVzXG4gICAqXG4gICAqIExJU1QgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjhcbiAgICogTFNVQiBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuOVxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIGxpc3Qgb2YgbWFpbGJveGVzXG4gICAqL1xuICBhc3luYyBsaXN0TWFpbGJveGVzICgpIHtcbiAgICBjb25zdCB0cmVlID0geyByb290OiB0cnVlLCBjaGlsZHJlbjogW10gfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xpc3RpbmcgbWFpbGJveGVzLi4uJylcbiAgICBjb25zdCBsaXN0UmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kOiAnTElTVCcsIGF0dHJpYnV0ZXM6IFsnJywgJyonXSB9LCAnTElTVCcpXG4gICAgY29uc3QgbGlzdCA9IHBhdGhPcihbXSwgWydwYXlsb2FkJywgJ0xJU1QnXSwgbGlzdFJlc3BvbnNlKVxuICAgIGxpc3QuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IGF0dHIgPSBwcm9wT3IoW10sICdhdHRyaWJ1dGVzJywgaXRlbSlcbiAgICAgIGlmICghYXR0ci5sZW5ndGggPCAzKSByZXR1cm5cblxuICAgICAgY29uc3QgcGF0aCA9IHBhdGhPcignJywgWycyJywgJ3ZhbHVlJ10sIGF0dHIpXG4gICAgICBjb25zdCBkZWxpbSA9IHBhdGhPcignLycsIFsnMScsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgYnJhbmNoID0gdGhpcy5fZW5zdXJlUGF0aCh0cmVlLCBwYXRoLCBkZWxpbSlcbiAgICAgIGJyYW5jaC5mbGFncyA9IHByb3BPcihbXSwgJzAnLCBhdHRyKS5tYXAoKHt2YWx1ZX0pID0+IHZhbHVlIHx8ICcnKVxuICAgICAgYnJhbmNoLmxpc3RlZCA9IHRydWVcbiAgICAgIGNoZWNrU3BlY2lhbFVzZShicmFuY2gpXG4gICAgfSlcblxuICAgIGNvbnN0IGxzdWJSZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQ6ICdMU1VCJywgYXR0cmlidXRlczogWycnLCAnKiddIH0sICdMU1VCJylcbiAgICBjb25zdCBsc3ViID0gcGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnTFNVQiddLCBsc3ViUmVzcG9uc2UpXG4gICAgbHN1Yi5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBhdHRyID0gcHJvcE9yKFtdLCAnYXR0cmlidXRlcycsIGl0ZW0pXG4gICAgICBpZiAoIWF0dHIubGVuZ3RoIDwgMykgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhdGggPSBwYXRoT3IoJycsIFsnMicsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgZGVsaW0gPSBwYXRoT3IoJy8nLCBbJzEnLCAndmFsdWUnXSwgYXR0cilcbiAgICAgIGNvbnN0IGJyYW5jaCA9IHRoaXMuX2Vuc3VyZVBhdGgodHJlZSwgcGF0aCwgZGVsaW0pXG4gICAgICBwcm9wT3IoW10sICcwJywgYXR0cikubWFwKChmbGFnID0gJycpID0+IHsgYnJhbmNoLmZsYWdzID0gdW5pb24oYnJhbmNoLmZsYWdzLCBbZmxhZ10pIH0pXG4gICAgICBicmFuY2guc3Vic2NyaWJlZCA9IHRydWVcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRyZWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBtYWlsYm94IHdpdGggdGhlIGdpdmVuIHBhdGguXG4gICAqXG4gICAqIENSRUFURSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuM1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiAgICAgVGhlIHBhdGggb2YgdGhlIG1haWxib3ggeW91IHdvdWxkIGxpa2UgdG8gY3JlYXRlLiAgVGhpcyBtZXRob2Qgd2lsbFxuICAgKiAgICAgaGFuZGxlIHV0ZjcgZW5jb2RpbmcgZm9yIHlvdS5cbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqICAgICBQcm9taXNlIHJlc29sdmVzIGlmIG1haWxib3ggd2FzIGNyZWF0ZWQuXG4gICAqICAgICBJbiB0aGUgZXZlbnQgdGhlIHNlcnZlciBzYXlzIE5PIFtBTFJFQURZRVhJU1RTXSwgd2UgdHJlYXQgdGhhdCBhcyBzdWNjZXNzLlxuICAgKi9cbiAgYXN5bmMgY3JlYXRlTWFpbGJveCAocGF0aCkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDcmVhdGluZyBtYWlsYm94JywgcGF0aCwgJy4uLicpXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZXhlYyh7IGNvbW1hbmQ6ICdDUkVBVEUnLCBhdHRyaWJ1dGVzOiBbaW1hcEVuY29kZShwYXRoKV0gfSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgPT09ICdBTFJFQURZRVhJU1RTJykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIEZFVENIIGNvbW1hbmRcbiAgICpcbiAgICogRkVUQ0ggZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjVcbiAgICogQ0hBTkdFRFNJTkNFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQ1NTEjc2VjdGlvbi0zLjNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIFNlcXVlbmNlIHNldCwgZWcgMToqIGZvciBhbGwgbWVzc2FnZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtpdGVtc10gTWVzc2FnZSBkYXRhIGl0ZW0gbmFtZXMgb3IgbWFjcm9cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgZmV0Y2hlZCBtZXNzYWdlIGluZm9cbiAgICovXG4gIGFzeW5jIGxpc3RNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIGl0ZW1zID0gW3sgZmFzdDogdHJ1ZSB9XSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0ZldGNoaW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJy4uLicpXG4gICAgY29uc3QgY29tbWFuZCA9IGJ1aWxkRkVUQ0hDb21tYW5kKHNlcXVlbmNlLCBpdGVtcywgb3B0aW9ucylcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZXhlYyhjb21tYW5kLCAnRkVUQ0gnLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBwYXJzZUZFVENIKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU0VBUkNIIGNvbW1hbmRcbiAgICpcbiAgICogU0VBUkNIIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC40XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeSBTZWFyY2ggdGVybXNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgYXN5bmMgc2VhcmNoIChwYXRoLCBxdWVyeSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NlYXJjaGluZyBpbicsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IGNvbW1hbmQgPSBidWlsZFNFQVJDSENvbW1hbmQocXVlcnksIG9wdGlvbnMpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ1NFQVJDSCcsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIHBhcnNlU0VBUkNIKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU1RPUkUgY29tbWFuZFxuICAgKlxuICAgKiBTVE9SRSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSBzZWxlY3RvciB3aGljaCB0aGUgZmxhZyBjaGFuZ2UgaXMgYXBwbGllZCB0b1xuICAgKiBAcGFyYW0ge0FycmF5fSBmbGFnc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICBzZXRGbGFncyAocGF0aCwgc2VxdWVuY2UsIGZsYWdzLCBvcHRpb25zKSB7XG4gICAgbGV0IGtleSA9ICcnXG4gICAgbGV0IGxpc3QgPSBbXVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZmxhZ3MpIHx8IHR5cGVvZiBmbGFncyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3MgfHwgW10pXG4gICAgICBrZXkgPSAnJ1xuICAgIH0gZWxzZSBpZiAoZmxhZ3MuYWRkKSB7XG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzLmFkZCB8fCBbXSlcbiAgICAgIGtleSA9ICcrJ1xuICAgIH0gZWxzZSBpZiAoZmxhZ3Muc2V0KSB7XG4gICAgICBrZXkgPSAnJ1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncy5zZXQgfHwgW10pXG4gICAgfSBlbHNlIGlmIChmbGFncy5yZW1vdmUpIHtcbiAgICAgIGtleSA9ICctJ1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncy5yZW1vdmUgfHwgW10pXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NldHRpbmcgZmxhZ3Mgb24nLCBzZXF1ZW5jZSwgJ2luJywgcGF0aCwgJy4uLicpXG4gICAgcmV0dXJuIHRoaXMuc3RvcmUocGF0aCwgc2VxdWVuY2UsIGtleSArICdGTEFHUycsIGxpc3QsIG9wdGlvbnMpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTVE9SRSBjb21tYW5kXG4gICAqXG4gICAqIFNUT1JFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC42XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHNlbGVjdG9yIHdoaWNoIHRoZSBmbGFnIGNoYW5nZSBpcyBhcHBsaWVkIHRvXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb24gU1RPUkUgbWV0aG9kIHRvIGNhbGwsIGVnIFwiK0ZMQUdTXCJcbiAgICogQHBhcmFtIHtBcnJheX0gZmxhZ3NcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgYXN5bmMgc3RvcmUgKHBhdGgsIHNlcXVlbmNlLCBhY3Rpb24sIGZsYWdzLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBjb21tYW5kID0gYnVpbGRTVE9SRUNvbW1hbmQoc2VxdWVuY2UsIGFjdGlvbiwgZmxhZ3MsIG9wdGlvbnMpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ0ZFVENIJywge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gcGFyc2VGRVRDSChyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIEFQUEVORCBjb21tYW5kXG4gICAqXG4gICAqIEFQUEVORCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMTFcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRlc3RpbmF0aW9uIFRoZSBtYWlsYm94IHdoZXJlIHRvIGFwcGVuZCB0aGUgbWVzc2FnZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBhcHBlbmRcbiAgICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucy5mbGFncyBBbnkgZmxhZ3MgeW91IHdhbnQgdG8gc2V0IG9uIHRoZSB1cGxvYWRlZCBtZXNzYWdlLiBEZWZhdWx0cyB0byBbXFxTZWVuXS4gKG9wdGlvbmFsKVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIHRoZSBhcnJheSBvZiBtYXRjaGluZyBzZXEuIG9yIHVpZCBudW1iZXJzXG4gICAqL1xuICB1cGxvYWQgKGRlc3RpbmF0aW9uLCBtZXNzYWdlLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgZmxhZ3MgPSBwcm9wT3IoWydcXFxcU2VlbiddLCAnZmxhZ3MnLCBvcHRpb25zKS5tYXAodmFsdWUgPT4gKHsgdHlwZTogJ2F0b20nLCB2YWx1ZSB9KSlcbiAgICBsZXQgY29tbWFuZCA9IHtcbiAgICAgIGNvbW1hbmQ6ICdBUFBFTkQnLFxuICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICB7IHR5cGU6ICdhdG9tJywgdmFsdWU6IGRlc3RpbmF0aW9uIH0sXG4gICAgICAgIGZsYWdzLFxuICAgICAgICB7IHR5cGU6ICdsaXRlcmFsJywgdmFsdWU6IG1lc3NhZ2UgfVxuICAgICAgXVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdVcGxvYWRpbmcgbWVzc2FnZSB0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcbiAgICByZXR1cm4gdGhpcy5leGVjKGNvbW1hbmQpXG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlcyBtZXNzYWdlcyBmcm9tIGEgc2VsZWN0ZWQgbWFpbGJveFxuICAgKlxuICAgKiBFWFBVTkdFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC4zXG4gICAqIFVJRCBFWFBVTkdFIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQzMTUjc2VjdGlvbi0yLjFcbiAgICpcbiAgICogSWYgcG9zc2libGUgKGJ5VWlkOnRydWUgYW5kIFVJRFBMVVMgZXh0ZW5zaW9uIHN1cHBvcnRlZCksIHVzZXMgVUlEIEVYUFVOR0VcbiAgICogY29tbWFuZCB0byBkZWxldGUgYSByYW5nZSBvZiBtZXNzYWdlcywgb3RoZXJ3aXNlIGZhbGxzIGJhY2sgdG8gRVhQVU5HRS5cbiAgICpcbiAgICogTkIhIFRoaXMgbWV0aG9kIG1pZ2h0IGJlIGRlc3RydWN0aXZlIC0gaWYgRVhQVU5HRSBpcyB1c2VkLCB0aGVuIGFueSBtZXNzYWdlc1xuICAgKiB3aXRoIFxcRGVsZXRlZCBmbGFnIHNldCBhcmUgZGVsZXRlZFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSByYW5nZSB0byBiZSBkZWxldGVkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlXG4gICAqL1xuICBhc3luYyBkZWxldGVNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIGFkZCBcXERlbGV0ZWQgZmxhZyB0byB0aGUgbWVzc2FnZXMgYW5kIHJ1biBFWFBVTkdFIG9yIFVJRCBFWFBVTkdFXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0RlbGV0aW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdpbicsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IHVzZVVpZFBsdXMgPSBvcHRpb25zLmJ5VWlkICYmIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignVUlEUExVUycpID49IDBcbiAgICBjb25zdCB1aWRFeHB1bmdlQ29tbWFuZCA9IHsgY29tbWFuZDogJ1VJRCBFWFBVTkdFJywgYXR0cmlidXRlczogW3sgdHlwZTogJ3NlcXVlbmNlJywgdmFsdWU6IHNlcXVlbmNlIH1dIH1cbiAgICBhd2FpdCB0aGlzLnNldEZsYWdzKHBhdGgsIHNlcXVlbmNlLCB7IGFkZDogJ1xcXFxEZWxldGVkJyB9LCBvcHRpb25zKVxuICAgIGNvbnN0IGNtZCA9IHVzZVVpZFBsdXMgPyB1aWRFeHB1bmdlQ29tbWFuZCA6ICdFWFBVTkdFJ1xuICAgIHJldHVybiB0aGlzLmV4ZWMoY21kLCBudWxsLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyBhIHJhbmdlIG9mIG1lc3NhZ2VzIGZyb20gdGhlIGFjdGl2ZSBtYWlsYm94IHRvIHRoZSBkZXN0aW5hdGlvbiBtYWlsYm94LlxuICAgKiBTaWxlbnQgbWV0aG9kICh1bmxlc3MgYW4gZXJyb3Igb2NjdXJzKSwgYnkgZGVmYXVsdCByZXR1cm5zIG5vIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBDT1BZIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC43XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIGNvcGllZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gRGVzdGluYXRpb24gbWFpbGJveCBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuYnlVaWRdIElmIHRydWUsIHVzZXMgVUlEIENPUFkgaW5zdGVhZCBvZiBDT1BZXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlXG4gICAqL1xuICBhc3luYyBjb3B5TWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBkZXN0aW5hdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NvcHlpbmcgbWVzc2FnZXMnLCBzZXF1ZW5jZSwgJ2Zyb20nLCBwYXRoLCAndG8nLCBkZXN0aW5hdGlvbiwgJy4uLicpXG4gICAgY29uc3QgeyBodW1hblJlYWRhYmxlIH0gPSBhd2FpdCB0aGlzLmV4ZWMoe1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgQ09QWScgOiAnQ09QWScsXG4gICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgIHsgdHlwZTogJ3NlcXVlbmNlJywgdmFsdWU6IHNlcXVlbmNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2F0b20nLCB2YWx1ZTogZGVzdGluYXRpb24gfVxuICAgICAgXVxuICAgIH0sIG51bGwsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIGh1bWFuUmVhZGFibGUgfHwgJ0NPUFkgY29tcGxldGVkJ1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIGEgcmFuZ2Ugb2YgbWVzc2FnZXMgZnJvbSB0aGUgYWN0aXZlIG1haWxib3ggdG8gdGhlIGRlc3RpbmF0aW9uIG1haWxib3guXG4gICAqIFByZWZlcnMgdGhlIE1PVkUgZXh0ZW5zaW9uIGJ1dCBpZiBub3QgYXZhaWxhYmxlLCBmYWxscyBiYWNrIHRvXG4gICAqIENPUFkgKyBFWFBVTkdFXG4gICAqXG4gICAqIE1PVkUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM2ODUxXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBNZXNzYWdlIHJhbmdlIHRvIGJlIG1vdmVkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZXN0aW5hdGlvbiBEZXN0aW5hdGlvbiBtYWlsYm94IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2VcbiAgICovXG4gIGFzeW5jIG1vdmVNZXNzYWdlcyAocGF0aCwgc2VxdWVuY2UsIGRlc3RpbmF0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTW92aW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJ3RvJywgZGVzdGluYXRpb24sICcuLi4nKVxuXG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignTU9WRScpID09PSAtMSkge1xuICAgICAgLy8gRmFsbGJhY2sgdG8gQ09QWSArIEVYUFVOR0VcbiAgICAgIGF3YWl0IHRoaXMuY29weU1lc3NhZ2VzKHBhdGgsIHNlcXVlbmNlLCBkZXN0aW5hdGlvbiwgb3B0aW9ucylcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZU1lc3NhZ2VzKHBhdGgsIHNlcXVlbmNlLCBvcHRpb25zKVxuICAgIH1cblxuICAgIC8vIElmIHBvc3NpYmxlLCB1c2UgTU9WRVxuICAgIHJldHVybiB0aGlzLmV4ZWMoe1xuICAgICAgY29tbWFuZDogb3B0aW9ucy5ieVVpZCA/ICdVSUQgTU9WRScgOiAnTU9WRScsXG4gICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgIHsgdHlwZTogJ3NlcXVlbmNlJywgdmFsdWU6IHNlcXVlbmNlIH0sXG4gICAgICAgIHsgdHlwZTogJ2F0b20nLCB2YWx1ZTogZGVzdGluYXRpb24gfVxuICAgICAgXVxuICAgIH0sIFsnT0snXSwge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIENPTVBSRVNTIGNvbW1hbmRcbiAgICpcbiAgICogQ09NUFJFU1MgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNDk3OFxuICAgKi9cbiAgYXN5bmMgY29tcHJlc3NDb25uZWN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2VuYWJsZUNvbXByZXNzaW9uIHx8IHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQ09NUFJFU1M9REVGTEFURScpIDwgMCB8fCB0aGlzLmNsaWVudC5jb21wcmVzc2VkKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW5hYmxpbmcgY29tcHJlc3Npb24uLi4nKVxuICAgIGF3YWl0IHRoaXMuZXhlYyh7XG4gICAgICBjb21tYW5kOiAnQ09NUFJFU1MnLFxuICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICB2YWx1ZTogJ0RFRkxBVEUnXG4gICAgICB9XVxuICAgIH0pXG4gICAgdGhpcy5jbGllbnQuZW5hYmxlQ29tcHJlc3Npb24oKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb21wcmVzc2lvbiBlbmFibGVkLCBhbGwgZGF0YSBzZW50IGFuZCByZWNlaXZlZCBpcyBkZWZsYXRlZCEnKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgTE9HSU4gb3IgQVVUSEVOVElDQVRFIFhPQVVUSDIgY29tbWFuZFxuICAgKlxuICAgKiBMT0dJTiBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjIuM1xuICAgKiBYT0FVVEgyIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZ21haWwveG9hdXRoMl9wcm90b2NvbCNpbWFwX3Byb3RvY29sX2V4Y2hhbmdlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRoLnVzZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGgucGFzc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aC54b2F1dGgyXG4gICAqL1xuICBhc3luYyBsb2dpbiAoYXV0aCkge1xuICAgIGxldCBjb21tYW5kXG4gICAgbGV0IG9wdGlvbnMgPSB7fVxuXG4gICAgaWYgKCFhdXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dGhlbnRpY2F0aW9uIGluZm9ybWF0aW9uIG5vdCBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignQVVUSD1YT0FVVEgyJykgPj0gMCAmJiBhdXRoICYmIGF1dGgueG9hdXRoMikge1xuICAgICAgY29tbWFuZCA9IHtcbiAgICAgICAgY29tbWFuZDogJ0FVVEhFTlRJQ0FURScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICB7IHR5cGU6ICdBVE9NJywgdmFsdWU6ICdYT0FVVEgyJyB9LFxuICAgICAgICAgIHsgdHlwZTogJ0FUT00nLCB2YWx1ZTogYnVpbGRYT0F1dGgyVG9rZW4oYXV0aC51c2VyLCBhdXRoLnhvYXV0aDIpLCBzZW5zaXRpdmU6IHRydWUgfVxuICAgICAgICBdXG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnMuZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUgPSB0cnVlIC8vICsgdGFnZ2VkIGVycm9yIHJlc3BvbnNlIGV4cGVjdHMgYW4gZW1wdHkgbGluZSBpbiByZXR1cm5cbiAgICB9IGVsc2Uge1xuICAgICAgY29tbWFuZCA9IHtcbiAgICAgICAgY29tbWFuZDogJ2xvZ2luJyxcbiAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgIHsgdHlwZTogJ1NUUklORycsIHZhbHVlOiBhdXRoLnVzZXIgfHwgJycgfSxcbiAgICAgICAgICB7IHR5cGU6ICdTVFJJTkcnLCB2YWx1ZTogYXV0aC5wYXNzIHx8ICcnLCBzZW5zaXRpdmU6IHRydWUgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4uLi4nKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gdGhpcy5leGVjKGNvbW1hbmQsICdjYXBhYmlsaXR5Jywgb3B0aW9ucylcbiAgICAvKlxuICAgICAqIHVwZGF0ZSBwb3N0LWF1dGggY2FwYWJpbGl0ZXNcbiAgICAgKiBjYXBhYmlsaXR5IGxpc3Qgc2hvdWxkbid0IGNvbnRhaW4gYXV0aCByZWxhdGVkIHN0dWZmIGFueW1vcmVcbiAgICAgKiBidXQgc29tZSBuZXcgZXh0ZW5zaW9ucyBtaWdodCBoYXZlIHBvcHBlZCB1cCB0aGF0IGRvIG5vdFxuICAgICAqIG1ha2UgbXVjaCBzZW5zZSBpbiB0aGUgbm9uLWF1dGggc3RhdGVcbiAgICAgKi9cbiAgICBpZiAocmVzcG9uc2UuY2FwYWJpbGl0eSAmJiByZXNwb25zZS5jYXBhYmlsaXR5Lmxlbmd0aCkge1xuICAgICAgLy8gY2FwYWJpbGl0ZXMgd2VyZSBsaXN0ZWQgd2l0aCB0aGUgT0sgW0NBUEFCSUxJVFkgLi4uXSByZXNwb25zZVxuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLmNhcGFiaWxpdHlcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnBheWxvYWQgJiYgcmVzcG9uc2UucGF5bG9hZC5DQVBBQklMSVRZICYmIHJlc3BvbnNlLnBheWxvYWQuQ0FQQUJJTElUWS5sZW5ndGgpIHtcbiAgICAgIC8vIGNhcGFiaWxpdGVzIHdlcmUgbGlzdGVkIHdpdGggKiBDQVBBQklMSVRZIC4uLiByZXNwb25zZVxuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLnBheWxvYWQuQ0FQQUJJTElUWS5wb3AoKS5hdHRyaWJ1dGVzLm1hcCgoY2FwYSA9ICcnKSA9PiBjYXBhLnZhbHVlLnRvVXBwZXJDYXNlKCkudHJpbSgpKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjYXBhYmlsaXRpZXMgd2VyZSBub3QgYXV0b21hdGljYWxseSBsaXN0ZWQsIHJlbG9hZFxuICAgICAgYXdhaXQgdGhpcy51cGRhdGVDYXBhYmlsaXR5KHRydWUpXG4gICAgfVxuXG4gICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfQVVUSEVOVElDQVRFRClcbiAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gdHJ1ZVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dpbiBzdWNjZXNzZnVsLCBwb3N0LWF1dGggY2FwYWJpbGl0ZXMgdXBkYXRlZCEnLCB0aGlzLl9jYXBhYmlsaXR5KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbiBJTUFQIGNvbW1hbmQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0IFN0cnVjdHVyZWQgcmVxdWVzdCBvYmplY3RcbiAgICogQHBhcmFtIHtBcnJheX0gYWNjZXB0VW50YWdnZWQgYSBsaXN0IG9mIHVudGFnZ2VkIHJlc3BvbnNlcyB0aGF0IHdpbGwgYmUgaW5jbHVkZWQgaW4gJ3BheWxvYWQnIHByb3BlcnR5XG4gICAqL1xuICBhc3luYyBleGVjIChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucykge1xuICAgIHRoaXMuYnJlYWtJZGxlKClcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuY2xpZW50LmVucXVldWVDb21tYW5kKHJlcXVlc3QsIGFjY2VwdFVudGFnZ2VkLCBvcHRpb25zKVxuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXBhYmlsaXR5KSB7XG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UuY2FwYWJpbGl0eVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29ubmVjdGlvbiBpcyBpZGxpbmcuIFNlbmRzIGEgTk9PUCBvciBJRExFIGNvbW1hbmRcbiAgICpcbiAgICogSURMRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMyMTc3XG4gICAqL1xuICBlbnRlcklkbGUgKCkge1xuICAgIGlmICh0aGlzLl9lbnRlcmVkSWRsZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VudGVyZWRJZGxlID0gdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdJRExFJykgPj0gMCA/ICdJRExFJyA6ICdOT09QJ1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbnRlcmluZyBpZGxlIHdpdGggJyArIHRoaXMuX2VudGVyZWRJZGxlKVxuXG4gICAgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnTk9PUCcpIHtcbiAgICAgIHRoaXMuX2lkbGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZW5kaW5nIE5PT1AnKVxuICAgICAgICB0aGlzLmV4ZWMoJ05PT1AnKVxuICAgICAgfSwgdGhpcy50aW1lb3V0Tm9vcClcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnSURMRScpIHtcbiAgICAgIHRoaXMuY2xpZW50LmVucXVldWVDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ0lETEUnXG4gICAgICB9KVxuICAgICAgdGhpcy5faWRsZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5jbGllbnQuc2VuZCgnRE9ORVxcclxcbicpXG4gICAgICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0lkbGUgdGVybWluYXRlZCcpXG4gICAgICB9LCB0aGlzLnRpbWVvdXRJZGxlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBhY3Rpb25zIHJlbGF0ZWQgaWRsaW5nLCBpZiBJRExFIGlzIHN1cHBvcnRlZCwgc2VuZHMgRE9ORSB0byBzdG9wIGl0XG4gICAqL1xuICBicmVha0lkbGUgKCkge1xuICAgIGlmICghdGhpcy5fZW50ZXJlZElkbGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZW91dClcbiAgICBpZiAodGhpcy5fZW50ZXJlZElkbGUgPT09ICdJRExFJykge1xuICAgICAgdGhpcy5jbGllbnQuc2VuZCgnRE9ORVxcclxcbicpXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnSWRsZSB0ZXJtaW5hdGVkJylcbiAgICB9XG4gICAgdGhpcy5fZW50ZXJlZElkbGUgPSBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU1RBUlRUTFMgY29tbWFuZCBpZiBuZWVkZWRcbiAgICpcbiAgICogU1RBUlRUTFMgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4yLjFcbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBbZm9yY2VkXSBCeSBkZWZhdWx0IHRoZSBjb21tYW5kIGlzIG5vdCBydW4gaWYgY2FwYWJpbGl0eSBpcyBhbHJlYWR5IGxpc3RlZC4gU2V0IHRvIHRydWUgdG8gc2tpcCB0aGlzIHZhbGlkYXRpb25cbiAgICovXG4gIGFzeW5jIHVwZ3JhZGVDb25uZWN0aW9uICgpIHtcbiAgICAvLyBza2lwIHJlcXVlc3QsIGlmIGFscmVhZHkgc2VjdXJlZFxuICAgIGlmICh0aGlzLmNsaWVudC5zZWN1cmVNb2RlKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBza2lwIGlmIFNUQVJUVExTIG5vdCBhdmFpbGFibGUgb3Igc3RhcnR0bHMgc3VwcG9ydCBkaXNhYmxlZFxuICAgIGlmICgodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdTVEFSVFRMUycpIDwgMCB8fCB0aGlzLl9pZ25vcmVUTFMpICYmICF0aGlzLl9yZXF1aXJlVExTKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW5jcnlwdGluZyBjb25uZWN0aW9uLi4uJylcbiAgICBhd2FpdCB0aGlzLmV4ZWMoJ1NUQVJUVExTJylcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gW11cbiAgICB0aGlzLmNsaWVudC51cGdyYWRlKClcbiAgICByZXR1cm4gdGhpcy51cGRhdGVDYXBhYmlsaXR5KClcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIENBUEFCSUxJVFkgY29tbWFuZFxuICAgKlxuICAgKiBDQVBBQklMSVRZIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMS4xXG4gICAqXG4gICAqIERvZXNuJ3QgcmVnaXN0ZXIgdW50YWdnZWQgQ0FQQUJJTElUWSBoYW5kbGVyIGFzIHRoaXMgaXMgYWxyZWFkeVxuICAgKiBoYW5kbGVkIGJ5IGdsb2JhbCBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlZF0gQnkgZGVmYXVsdCB0aGUgY29tbWFuZCBpcyBub3QgcnVuIGlmIGNhcGFiaWxpdHkgaXMgYWxyZWFkeSBsaXN0ZWQuIFNldCB0byB0cnVlIHRvIHNraXAgdGhpcyB2YWxpZGF0aW9uXG4gICAqL1xuICBhc3luYyB1cGRhdGVDYXBhYmlsaXR5IChmb3JjZWQpIHtcbiAgICAvLyBza2lwIHJlcXVlc3QsIGlmIG5vdCBmb3JjZWQgdXBkYXRlIGFuZCBjYXBhYmlsaXRpZXMgYXJlIGFscmVhZHkgbG9hZGVkXG4gICAgaWYgKCFmb3JjZWQgJiYgdGhpcy5fY2FwYWJpbGl0eS5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIFNUQVJUVExTIGlzIHJlcXVpcmVkIHRoZW4gc2tpcCBjYXBhYmlsaXR5IGxpc3RpbmcgYXMgd2UgYXJlIGdvaW5nIHRvIHRyeVxuICAgIC8vIFNUQVJUVExTIGFueXdheSBhbmQgd2UgcmUtY2hlY2sgY2FwYWJpbGl0aWVzIGFmdGVyIGNvbm5lY3Rpb24gaXMgc2VjdXJlZFxuICAgIGlmICghdGhpcy5jbGllbnQuc2VjdXJlTW9kZSAmJiB0aGlzLl9yZXF1aXJlVExTKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBkYXRpbmcgY2FwYWJpbGl0eS4uLicpXG4gICAgcmV0dXJuIHRoaXMuZXhlYygnQ0FQQUJJTElUWScpXG4gIH1cblxuICBoYXNDYXBhYmlsaXR5IChjYXBhID0gJycpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKGNhcGEudG9VcHBlckNhc2UoKS50cmltKCkpID49IDBcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlcnMgZm9yIHVudGFnZ2VkIHJlc3BvbnNlc1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYW4gdW50YWdnZWQgT0sgaW5jbHVkZXMgW0NBUEFCSUxJVFldIHRhZyBhbmQgdXBkYXRlcyBjYXBhYmlsaXR5IG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkT2tIYW5kbGVyIChyZXNwb25zZSkge1xuICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5jYXBhYmlsaXR5KSB7XG4gICAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcmVzcG9uc2UuY2FwYWJpbGl0eVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGNhcGFiaWxpdHkgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRDYXBhYmlsaXR5SGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICB0aGlzLl9jYXBhYmlsaXR5ID0gcGlwZShcbiAgICAgIHByb3BPcihbXSwgJ2F0dHJpYnV0ZXMnKSxcbiAgICAgIG1hcCgoe3ZhbHVlfSkgPT4gKHZhbHVlIHx8ICcnKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSlcbiAgICApKHJlc3BvbnNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgZXhpc3RpbmcgbWVzc2FnZSBjb3VudFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkRXhpc3RzSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuaGFzT3duUHJvcGVydHkoJ25yJykpIHtcbiAgICAgIHRoaXMub251cGRhdGUgJiYgdGhpcy5vbnVwZGF0ZSh0aGlzLl9zZWxlY3RlZE1haWxib3gsICdleGlzdHMnLCByZXNwb25zZS5ucilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5kaWNhdGVzIGEgbWVzc2FnZSBoYXMgYmVlbiBkZWxldGVkXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRFeHB1bmdlSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuaGFzT3duUHJvcGVydHkoJ25yJykpIHtcbiAgICAgIHRoaXMub251cGRhdGUgJiYgdGhpcy5vbnVwZGF0ZSh0aGlzLl9zZWxlY3RlZE1haWxib3gsICdleHB1bmdlJywgcmVzcG9uc2UubnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IGZsYWdzIGhhdmUgYmVlbiB1cGRhdGVkIGZvciBhIG1lc3NhZ2VcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZEZldGNoSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZmV0Y2gnLCBbXS5jb25jYXQocGFyc2VGRVRDSCh7IHBheWxvYWQ6IHsgRkVUQ0g6IFtyZXNwb25zZV0gfSB9KSB8fCBbXSkuc2hpZnQoKSlcbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyc1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgY29ubmVjdGlvbiBzdGFydGVkIGlkbGluZy4gSW5pdGlhdGVzIGEgY3ljbGVcbiAgICogb2YgTk9PUHMgb3IgSURMRXMgdG8gcmVjZWl2ZSBub3RpZmljYXRpb25zIGFib3V0IHVwZGF0ZXMgaW4gdGhlIHNlcnZlclxuICAgKi9cbiAgX29uSWRsZSAoKSB7XG4gICAgaWYgKCF0aGlzLl9hdXRoZW50aWNhdGVkIHx8IHRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIElETEUgd2hlbiBub3QgbG9nZ2VkIGluIG9yIGFscmVhZHkgaWRsaW5nXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ2xpZW50IHN0YXJ0ZWQgaWRsaW5nJylcbiAgICB0aGlzLmVudGVySWRsZSgpXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgSU1BUCBzdGF0ZSB2YWx1ZSBmb3IgdGhlIGN1cnJlbnQgY29ubmVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbmV3U3RhdGUgVGhlIHN0YXRlIHlvdSB3YW50IHRvIGNoYW5nZSB0b1xuICAgKi9cbiAgX2NoYW5nZVN0YXRlIChuZXdTdGF0ZSkge1xuICAgIGlmIChuZXdTdGF0ZSA9PT0gdGhpcy5fc3RhdGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbnRlcmluZyBzdGF0ZTogJyArIG5ld1N0YXRlKVxuXG4gICAgLy8gaWYgYSBtYWlsYm94IHdhcyBvcGVuZWQsIGVtaXQgb25jbG9zZW1haWxib3ggYW5kIGNsZWFyIHNlbGVjdGVkTWFpbGJveCB2YWx1ZVxuICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gU1RBVEVfU0VMRUNURUQgJiYgdGhpcy5fc2VsZWN0ZWRNYWlsYm94KSB7XG4gICAgICB0aGlzLm9uY2xvc2VtYWlsYm94ICYmIHRoaXMub25jbG9zZW1haWxib3godGhpcy5fc2VsZWN0ZWRNYWlsYm94KVxuICAgICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9zdGF0ZSA9IG5ld1N0YXRlXG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyBhIHBhdGggZXhpc3RzIGluIHRoZSBNYWlsYm94IHRyZWVcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHRyZWUgTWFpbGJveCB0cmVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZWxpbWl0ZXJcbiAgICogQHJldHVybiB7T2JqZWN0fSBicmFuY2ggZm9yIHVzZWQgcGF0aFxuICAgKi9cbiAgX2Vuc3VyZVBhdGggKHRyZWUsIHBhdGgsIGRlbGltaXRlcikge1xuICAgIGNvbnN0IG5hbWVzID0gcGF0aC5zcGxpdChkZWxpbWl0ZXIpXG4gICAgbGV0IGJyYW5jaCA9IHRyZWVcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGJyYW5jaC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICBpZiAodGhpcy5fY29tcGFyZU1haWxib3hOYW1lcyhicmFuY2guY2hpbGRyZW5bal0ubmFtZSwgaW1hcERlY29kZShuYW1lc1tpXSkpKSB7XG4gICAgICAgICAgYnJhbmNoID0gYnJhbmNoLmNoaWxkcmVuW2pdXG4gICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICBicmFuY2guY2hpbGRyZW4ucHVzaCh7XG4gICAgICAgICAgbmFtZTogaW1hcERlY29kZShuYW1lc1tpXSksXG4gICAgICAgICAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIsXG4gICAgICAgICAgcGF0aDogbmFtZXMuc2xpY2UoMCwgaSArIDEpLmpvaW4oZGVsaW1pdGVyKSxcbiAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgfSlcbiAgICAgICAgYnJhbmNoID0gYnJhbmNoLmNoaWxkcmVuW2JyYW5jaC5jaGlsZHJlbi5sZW5ndGggLSAxXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoXG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZXMgdHdvIG1haWxib3ggbmFtZXMuIENhc2UgaW5zZW5zaXRpdmUgaW4gY2FzZSBvZiBJTkJPWCwgb3RoZXJ3aXNlIGNhc2Ugc2Vuc2l0aXZlXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhIE1haWxib3ggbmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYiBNYWlsYm94IG5hbWVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIGZvbGRlciBuYW1lcyBtYXRjaFxuICAgKi9cbiAgX2NvbXBhcmVNYWlsYm94TmFtZXMgKGEsIGIpIHtcbiAgICByZXR1cm4gKGEudG9VcHBlckNhc2UoKSA9PT0gJ0lOQk9YJyA/ICdJTkJPWCcgOiBhKSA9PT0gKGIudG9VcHBlckNhc2UoKSA9PT0gJ0lOQk9YJyA/ICdJTkJPWCcgOiBiKVxuICB9XG5cbiAgY3JlYXRlTG9nZ2VyIChjcmVhdG9yID0gY3JlYXRlRGVmYXVsdExvZ2dlcikge1xuICAgIGNvbnN0IGxvZ2dlciA9IGNyZWF0b3IodGhpcy5fYXV0aC51c2VyIHx8ICcnLCB0aGlzLl9ob3N0KVxuICAgIHRoaXMubG9nZ2VyID0gdGhpcy5jbGllbnQubG9nZ2VyID0ge1xuICAgICAgZGVidWc6ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfREVCVUcgPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIuZGVidWcobXNncykgfSB9LFxuICAgICAgaW5mbzogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9JTkZPID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLmluZm8obXNncykgfSB9LFxuICAgICAgd2FybjogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9XQVJOID49IHRoaXMubG9nTGV2ZWwpIHsgbG9nZ2VyLndhcm4obXNncykgfSB9LFxuICAgICAgZXJyb3I6ICguLi5tc2dzKSA9PiB7IGlmIChMT0dfTEVWRUxfRVJST1IgPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIuZXJyb3IobXNncykgfSB9XG4gICAgfVxuICB9XG59XG4iXX0=