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

      var logger = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _logger2.default)();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsiVElNRU9VVF9DT05ORUNUSU9OIiwiVElNRU9VVF9OT09QIiwiVElNRU9VVF9JRExFIiwiU1RBVEVfQ09OTkVDVElORyIsIlNUQVRFX05PVF9BVVRIRU5USUNBVEVEIiwiU1RBVEVfQVVUSEVOVElDQVRFRCIsIlNUQVRFX1NFTEVDVEVEIiwiU1RBVEVfTE9HT1VUIiwiREVGQVVMVF9DTElFTlRfSUQiLCJuYW1lIiwiQ2xpZW50IiwiaG9zdCIsInBvcnQiLCJvcHRpb25zIiwidGltZW91dENvbm5lY3Rpb24iLCJ0aW1lb3V0Tm9vcCIsInRpbWVvdXRJZGxlIiwic2VydmVySWQiLCJvbmNlcnQiLCJvbnVwZGF0ZSIsIm9uc2VsZWN0bWFpbGJveCIsIm9uY2xvc2VtYWlsYm94IiwiX2NsaWVudElkIiwiX3N0YXRlIiwiX2F1dGhlbnRpY2F0ZWQiLCJfY2FwYWJpbGl0eSIsIl9zZWxlY3RlZE1haWxib3giLCJfZW50ZXJlZElkbGUiLCJfaWRsZVRpbWVvdXQiLCJfZW5hYmxlQ29tcHJlc3Npb24iLCJlbmFibGVDb21wcmVzc2lvbiIsIl9hdXRoIiwiYXV0aCIsIl9yZXF1aXJlVExTIiwicmVxdWlyZVRMUyIsIl9pZ25vcmVUTFMiLCJpZ25vcmVUTFMiLCJjbGllbnQiLCJvbmVycm9yIiwiX29uRXJyb3IiLCJiaW5kIiwiY2VydCIsIm9uaWRsZSIsIl9vbklkbGUiLCJzZXRIYW5kbGVyIiwicmVzcG9uc2UiLCJfdW50YWdnZWRDYXBhYmlsaXR5SGFuZGxlciIsIl91bnRhZ2dlZE9rSGFuZGxlciIsIl91bnRhZ2dlZEV4aXN0c0hhbmRsZXIiLCJfdW50YWdnZWRFeHB1bmdlSGFuZGxlciIsIl91bnRhZ2dlZEZldGNoSGFuZGxlciIsImNyZWF0ZUxvZ2dlciIsImxvZ0xldmVsIiwiTE9HX0xFVkVMX0FMTCIsImVyciIsImNsZWFyVGltZW91dCIsIl9vcGVuQ29ubmVjdGlvbiIsIl9jaGFuZ2VTdGF0ZSIsInVwZGF0ZUNhcGFiaWxpdHkiLCJ1cGdyYWRlQ29ubmVjdGlvbiIsInVwZGF0ZUlkIiwibG9nZ2VyIiwid2FybiIsIm1lc3NhZ2UiLCJsb2dpbiIsImNvbXByZXNzQ29ubmVjdGlvbiIsImRlYnVnIiwiZXJyb3IiLCJjbG9zZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiY29ubmVjdGlvblRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJjb25uZWN0IiwidGhlbiIsIm9ucmVhZHkiLCJjYXRjaCIsImxvZ291dCIsImlkIiwiaW5kZXhPZiIsImNvbW1hbmQiLCJhdHRyaWJ1dGVzIiwiT2JqZWN0IiwiZW50cmllcyIsImV4ZWMiLCJsaXN0IiwibWFwIiwidmFsdWVzIiwia2V5cyIsImZpbHRlciIsIl8iLCJpIiwicGF0aCIsImN0eCIsInByZXZpb3VzU2VsZWN0IiwiZ2V0UHJldmlvdXNseVF1ZXVlZCIsInJlcXVlc3QiLCJwYXRoQXR0cmlidXRlIiwiZmluZCIsImF0dHJpYnV0ZSIsInR5cGUiLCJ2YWx1ZSIsInF1ZXJ5IiwicmVhZE9ubHkiLCJjb25kc3RvcmUiLCJwdXNoIiwibWFpbGJveEluZm8iLCJ0cmVlIiwicm9vdCIsImNoaWxkcmVuIiwibGlzdFJlc3BvbnNlIiwiZm9yRWFjaCIsImF0dHIiLCJpdGVtIiwibGVuZ3RoIiwiZGVsaW0iLCJicmFuY2giLCJfZW5zdXJlUGF0aCIsImZsYWdzIiwibGlzdGVkIiwibHN1YlJlc3BvbnNlIiwibHN1YiIsImZsYWciLCJzdWJzY3JpYmVkIiwiY29kZSIsInNlcXVlbmNlIiwiaXRlbXMiLCJmYXN0IiwicHJlY2hlY2siLCJfc2hvdWxkU2VsZWN0TWFpbGJveCIsInNlbGVjdE1haWxib3giLCJrZXkiLCJBcnJheSIsImlzQXJyYXkiLCJjb25jYXQiLCJhZGQiLCJzZXQiLCJyZW1vdmUiLCJzdG9yZSIsImFjdGlvbiIsImRlc3RpbmF0aW9uIiwidXNlVWlkUGx1cyIsImJ5VWlkIiwidWlkRXhwdW5nZUNvbW1hbmQiLCJzZXRGbGFncyIsImNtZCIsImh1bWFuUmVhZGFibGUiLCJjb3B5TWVzc2FnZXMiLCJkZWxldGVNZXNzYWdlcyIsImNvbXByZXNzZWQiLCJ4b2F1dGgyIiwidXNlciIsInNlbnNpdGl2ZSIsImVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lIiwicGFzcyIsImNhcGFiaWxpdHkiLCJwYXlsb2FkIiwiQ0FQQUJJTElUWSIsInBvcCIsImNhcGEiLCJ0b1VwcGVyQ2FzZSIsInRyaW0iLCJhY2NlcHRVbnRhZ2dlZCIsImJyZWFrSWRsZSIsImVucXVldWVDb21tYW5kIiwic2VuZCIsInNlY3VyZU1vZGUiLCJ1cGdyYWRlIiwiZm9yY2VkIiwiaGFzT3duUHJvcGVydHkiLCJuciIsIkZFVENIIiwic2hpZnQiLCJlbnRlcklkbGUiLCJuZXdTdGF0ZSIsImRlbGltaXRlciIsIm5hbWVzIiwic3BsaXQiLCJmb3VuZCIsImoiLCJfY29tcGFyZU1haWxib3hOYW1lcyIsInNsaWNlIiwiam9pbiIsImEiLCJiIiwibXNncyIsImluZm8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBTUE7O0FBT0E7Ozs7QUFDQTs7OztBQUNBOztBQU9BOzs7Ozs7OztBQUlPLElBQU1BLGtEQUFxQixLQUFLLElBQWhDLEMsQ0FBcUM7QUFDckMsSUFBTUMsc0NBQWUsS0FBSyxJQUExQixDLENBQStCO0FBQy9CLElBQU1DLHNDQUFlLEtBQUssSUFBMUIsQyxDQUErQjs7QUFFL0IsSUFBTUMsOENBQW1CLENBQXpCO0FBQ0EsSUFBTUMsNERBQTBCLENBQWhDO0FBQ0EsSUFBTUMsb0RBQXNCLENBQTVCO0FBQ0EsSUFBTUMsMENBQWlCLENBQXZCO0FBQ0EsSUFBTUMsc0NBQWUsQ0FBckI7O0FBRUEsSUFBTUMsZ0RBQW9CO0FBQy9CQyxRQUFNOztBQUdSOzs7Ozs7Ozs7QUFKaUMsQ0FBMUI7SUFhY0MsTTtBQUNuQixrQkFBYUMsSUFBYixFQUFtQkMsSUFBbkIsRUFBdUM7QUFBQTs7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQUE7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QVM7QUFBQTs7QUFBRSxjQUFJLDJCQUFtQixRQUFLdkksUUFBNUIsRUFBc0M7QUFBRVMsbUJBQU9LLEtBQVAsQ0FBYXlILElBQWI7QUFBb0I7QUFBRSxTQURuRDtBQUVqQ0MsY0FBTSxnQkFBYTtBQUFBLDZDQUFURCxJQUFTO0FBQVRBLGdCQUFTO0FBQUE7O0FBQUUsY0FBSSwwQkFBa0IsUUFBS3ZJLFFBQTNCLEVBQXFDO0FBQUVTLG1CQUFPK0gsSUFBUCxDQUFZRCxJQUFaO0FBQW1CO0FBQUUsU0FGaEQ7QUFHakM3SCxjQUFNLGdCQUFhO0FBQUEsNkNBQVQ2SCxJQUFTO0FBQVRBLGdCQUFTO0FBQUE7O0FBQUUsY0FBSSwwQkFBa0IsUUFBS3ZJLFFBQTNCLEVBQXFDO0FBQUVTLG1CQUFPQyxJQUFQLENBQVk2SCxJQUFaO0FBQW1CO0FBQUUsU0FIaEQ7QUFJakN4SCxlQUFPLGlCQUFhO0FBQUEsNkNBQVR3SCxJQUFTO0FBQVRBLGdCQUFTO0FBQUE7O0FBQUUsY0FBSSwyQkFBbUIsUUFBS3ZJLFFBQTVCLEVBQXNDO0FBQUVTLG1CQUFPTSxLQUFQLENBQWF3SCxJQUFiO0FBQW9CO0FBQUU7QUFKbkQsT0FBbkM7QUFNRDs7Ozs7O2tCQWozQmtCakwsTSIsImZpbGUiOiJjbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtYXAsIHBpcGUsIHVuaW9uLCB6aXAsIGZyb21QYWlycywgcHJvcE9yLCBwYXRoT3IsIGZsYXR0ZW4gfSBmcm9tICdyYW1kYSdcbmltcG9ydCB7IGltYXBFbmNvZGUsIGltYXBEZWNvZGUgfSBmcm9tICdlbWFpbGpzLXV0ZjcnXG5pbXBvcnQge1xuICBwYXJzZU5BTUVTUEFDRSxcbiAgcGFyc2VTRUxFQ1QsXG4gIHBhcnNlRkVUQ0gsXG4gIHBhcnNlU0VBUkNIXG59IGZyb20gJy4vY29tbWFuZC1wYXJzZXInXG5pbXBvcnQge1xuICBidWlsZEZFVENIQ29tbWFuZCxcbiAgYnVpbGRYT0F1dGgyVG9rZW4sXG4gIGJ1aWxkU0VBUkNIQ29tbWFuZCxcbiAgYnVpbGRTVE9SRUNvbW1hbmRcbn0gZnJvbSAnLi9jb21tYW5kLWJ1aWxkZXInXG5cbmltcG9ydCBjcmVhdGVEZWZhdWx0TG9nZ2VyIGZyb20gJy4vbG9nZ2VyJ1xuaW1wb3J0IEltYXBDbGllbnQgZnJvbSAnLi9pbWFwJ1xuaW1wb3J0IHtcbiAgTE9HX0xFVkVMX0VSUk9SLFxuICBMT0dfTEVWRUxfV0FSTixcbiAgTE9HX0xFVkVMX0lORk8sXG4gIExPR19MRVZFTF9ERUJVR1xufSBmcm9tICcuL2NvbW1vbidcblxuaW1wb3J0IHtcbiAgY2hlY2tTcGVjaWFsVXNlXG59IGZyb20gJy4vc3BlY2lhbC11c2UnXG5cbmV4cG9ydCBjb25zdCBUSU1FT1VUX0NPTk5FQ1RJT04gPSA5MCAqIDEwMDAgLy8gTWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIHRoZSBJTUFQIGdyZWV0aW5nIGZyb20gdGhlIHNlcnZlclxuZXhwb3J0IGNvbnN0IFRJTUVPVVRfTk9PUCA9IDYwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgYmV0d2VlbiBOT09QIGNvbW1hbmRzIHdoaWxlIGlkbGluZ1xuZXhwb3J0IGNvbnN0IFRJTUVPVVRfSURMRSA9IDYwICogMTAwMCAvLyBNaWxsaXNlY29uZHMgdW50aWwgSURMRSBjb21tYW5kIGlzIGNhbmNlbGxlZFxuXG5leHBvcnQgY29uc3QgU1RBVEVfQ09OTkVDVElORyA9IDFcbmV4cG9ydCBjb25zdCBTVEFURV9OT1RfQVVUSEVOVElDQVRFRCA9IDJcbmV4cG9ydCBjb25zdCBTVEFURV9BVVRIRU5USUNBVEVEID0gM1xuZXhwb3J0IGNvbnN0IFNUQVRFX1NFTEVDVEVEID0gNFxuZXhwb3J0IGNvbnN0IFNUQVRFX0xPR09VVCA9IDVcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ0xJRU5UX0lEID0ge1xuICBuYW1lOiAnZW1haWxqcy1pbWFwLWNsaWVudCdcbn1cblxuLyoqXG4gKiBlbWFpbGpzIElNQVAgY2xpZW50XG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtob3N0PSdsb2NhbGhvc3QnXSBIb3N0bmFtZSB0byBjb25lbmN0IHRvXG4gKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9MTQzXSBQb3J0IG51bWJlciB0byBjb25uZWN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudCB7XG4gIGNvbnN0cnVjdG9yIChob3N0LCBwb3J0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnRpbWVvdXRDb25uZWN0aW9uID0gVElNRU9VVF9DT05ORUNUSU9OXG4gICAgdGhpcy50aW1lb3V0Tm9vcCA9IFRJTUVPVVRfTk9PUFxuICAgIHRoaXMudGltZW91dElkbGUgPSBUSU1FT1VUX0lETEVcblxuICAgIHRoaXMuc2VydmVySWQgPSBmYWxzZSAvLyBSRkMgMjk3MSBTZXJ2ZXIgSUQgYXMga2V5IHZhbHVlIHBhaXJzXG5cbiAgICAvLyBFdmVudCBwbGFjZWhvbGRlcnNcbiAgICB0aGlzLm9uY2VydCA9IG51bGxcbiAgICB0aGlzLm9udXBkYXRlID0gbnVsbFxuICAgIHRoaXMub25zZWxlY3RtYWlsYm94ID0gbnVsbFxuICAgIHRoaXMub25jbG9zZW1haWxib3ggPSBudWxsXG5cbiAgICB0aGlzLl9jbGllbnRJZCA9IHByb3BPcihERUZBVUxUX0NMSUVOVF9JRCwgJ2lkJywgb3B0aW9ucylcbiAgICB0aGlzLl9zdGF0ZSA9IGZhbHNlIC8vIEN1cnJlbnQgc3RhdGVcbiAgICB0aGlzLl9hdXRoZW50aWNhdGVkID0gZmFsc2UgLy8gSXMgdGhlIGNvbm5lY3Rpb24gYXV0aGVudGljYXRlZFxuICAgIHRoaXMuX2NhcGFiaWxpdHkgPSBbXSAvLyBMaXN0IG9mIGV4dGVuc2lvbnMgdGhlIHNlcnZlciBzdXBwb3J0c1xuICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IGZhbHNlIC8vIFNlbGVjdGVkIG1haWxib3hcbiAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IGZhbHNlXG4gICAgdGhpcy5faWRsZVRpbWVvdXQgPSBmYWxzZVxuICAgIHRoaXMuX2VuYWJsZUNvbXByZXNzaW9uID0gISFvcHRpb25zLmVuYWJsZUNvbXByZXNzaW9uXG4gICAgdGhpcy5fYXV0aCA9IG9wdGlvbnMuYXV0aFxuICAgIHRoaXMuX3JlcXVpcmVUTFMgPSAhIW9wdGlvbnMucmVxdWlyZVRMU1xuICAgIHRoaXMuX2lnbm9yZVRMUyA9ICEhb3B0aW9ucy5pZ25vcmVUTFNcblxuICAgIHRoaXMuY2xpZW50ID0gbmV3IEltYXBDbGllbnQoaG9zdCwgcG9ydCwgb3B0aW9ucykgLy8gSU1BUCBjbGllbnQgb2JqZWN0XG5cbiAgICAvLyBFdmVudCBIYW5kbGVyc1xuICAgIHRoaXMuY2xpZW50Lm9uZXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcylcbiAgICB0aGlzLmNsaWVudC5vbmNlcnQgPSAoY2VydCkgPT4gKHRoaXMub25jZXJ0ICYmIHRoaXMub25jZXJ0KGNlcnQpKSAvLyBhbGxvd3MgY2VydGlmaWNhdGUgaGFuZGxpbmcgZm9yIHBsYXRmb3JtcyB3L28gbmF0aXZlIHRscyBzdXBwb3J0XG4gICAgdGhpcy5jbGllbnQub25pZGxlID0gKCkgPT4gdGhpcy5fb25JZGxlKCkgLy8gc3RhcnQgaWRsaW5nXG5cbiAgICAvLyBEZWZhdWx0IGhhbmRsZXJzIGZvciB1bnRhZ2dlZCByZXNwb25zZXNcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdjYXBhYmlsaXR5JywgKHJlc3BvbnNlKSA9PiB0aGlzLl91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyKHJlc3BvbnNlKSkgLy8gY2FwYWJpbGl0eSB1cGRhdGVzXG4gICAgdGhpcy5jbGllbnQuc2V0SGFuZGxlcignb2snLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkT2tIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbm90aWZpY2F0aW9uc1xuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2V4aXN0cycsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRFeGlzdHNIYW5kbGVyKHJlc3BvbnNlKSkgLy8gbWVzc2FnZSBjb3VudCBoYXMgY2hhbmdlZFxuICAgIHRoaXMuY2xpZW50LnNldEhhbmRsZXIoJ2V4cHVuZ2UnLCAocmVzcG9uc2UpID0+IHRoaXMuX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGhhcyBiZWVuIGRlbGV0ZWRcbiAgICB0aGlzLmNsaWVudC5zZXRIYW5kbGVyKCdmZXRjaCcsIChyZXNwb25zZSkgPT4gdGhpcy5fdW50YWdnZWRGZXRjaEhhbmRsZXIocmVzcG9uc2UpKSAvLyBtZXNzYWdlIGhhcyBiZWVuIHVwZGF0ZWQgKGVnLiBmbGFnIGNoYW5nZSlcblxuICAgIC8vIEFjdGl2YXRlIGxvZ2dpbmdcbiAgICB0aGlzLmNyZWF0ZUxvZ2dlcigpXG4gICAgdGhpcy5sb2dMZXZlbCA9IHRoaXMuTE9HX0xFVkVMX0FMTFxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBpZiB0aGUgbG93ZXItbGV2ZWwgSW1hcENsaWVudCBoYXMgZW5jb3VudGVyZWQgYW4gdW5yZWNvdmVyYWJsZVxuICAgKiBlcnJvciBkdXJpbmcgb3BlcmF0aW9uLiBDbGVhbnMgdXAgYW5kIHByb3BhZ2F0ZXMgdGhlIGVycm9yIHVwd2FyZHMuXG4gICAqL1xuICBfb25FcnJvciAoZXJyKSB7XG4gICAgLy8gbWFrZSBzdXJlIG5vIGlkbGUgdGltZW91dCBpcyBwZW5kaW5nIGFueW1vcmVcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG5cbiAgICAvLyBwcm9wYWdhdGUgdGhlIGVycm9yIHVwd2FyZHNcbiAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycilcbiAgfVxuXG4gIC8vXG4gIC8vXG4gIC8vIFBVQkxJQyBBUElcbiAgLy9cbiAgLy9cblxuICAvKipcbiAgICogSW5pdGlhdGUgY29ubmVjdGlvbiB0byB0aGUgSU1BUCBzZXJ2ZXJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hlbiBsb2dpbiBwcm9jZWR1cmUgaXMgY29tcGxldGVcbiAgICovXG4gIGFzeW5jIGNvbm5lY3QgKCkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9vcGVuQ29ubmVjdGlvbigpXG4gICAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9OT1RfQVVUSEVOVElDQVRFRClcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ2FwYWJpbGl0eSgpXG4gICAgICBhd2FpdCB0aGlzLnVwZ3JhZGVDb25uZWN0aW9uKClcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlSWQodGhpcy5fY2xpZW50SWQpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybignRmFpbGVkIHRvIHVwZGF0ZSBzZXJ2ZXIgaWQhJywgZXJyLm1lc3NhZ2UpXG4gICAgICB9XG5cbiAgICAgIGF3YWl0IHRoaXMubG9naW4odGhpcy5fYXV0aClcbiAgICAgIGF3YWl0IHRoaXMuY29tcHJlc3NDb25uZWN0aW9uKClcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25uZWN0aW9uIGVzdGFibGlzaGVkLCByZWFkeSB0byByb2xsIScpXG4gICAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyJywgZXJyKVxuICAgICAgdGhpcy5jbG9zZShlcnIpIC8vIHdlIGRvbid0IHJlYWxseSBjYXJlIHdoZXRoZXIgdGhpcyB3b3JrcyBvciBub3RcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIF9vcGVuQ29ubmVjdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBjb25uZWN0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KG5ldyBFcnJvcignVGltZW91dCBjb25uZWN0aW5nIHRvIHNlcnZlcicpKSwgdGhpcy50aW1lb3V0Q29ubmVjdGlvbilcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25uZWN0aW5nIHRvJywgdGhpcy5jbGllbnQuaG9zdCwgJzonLCB0aGlzLmNsaWVudC5wb3J0KVxuICAgICAgdGhpcy5fY2hhbmdlU3RhdGUoU1RBVEVfQ09OTkVDVElORylcbiAgICAgIHRoaXMuY2xpZW50LmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1NvY2tldCBvcGVuZWQsIHdhaXRpbmcgZm9yIGdyZWV0aW5nIGZyb20gdGhlIHNlcnZlci4uLicpXG5cbiAgICAgICAgdGhpcy5jbGllbnQub25yZWFkeSA9ICgpID0+IHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoY29ubmVjdGlvblRpbWVvdXQpXG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsaWVudC5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgIGNsZWFyVGltZW91dChjb25uZWN0aW9uVGltZW91dClcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dvdXRcbiAgICpcbiAgICogU2VuZCBMT0dPVVQsIHRvIHdoaWNoIHRoZSBzZXJ2ZXIgcmVzcG9uZHMgYnkgY2xvc2luZyB0aGUgY29ubmVjdGlvbi5cbiAgICogVXNlIGlzIGRpc2NvdXJhZ2VkIGlmIG5ldHdvcmsgc3RhdHVzIGlzIHVuY2xlYXIhIElmIG5ldHdvcmtzIHN0YXR1cyBpc1xuICAgKiB1bmNsZWFyLCBwbGVhc2UgdXNlICNjbG9zZSBpbnN0ZWFkIVxuICAgKlxuICAgKiBMT0dPVVQgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMS4zXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNlcnZlciBoYXMgY2xvc2VkIHRoZSBjb25uZWN0aW9uXG4gICAqL1xuICBhc3luYyBsb2dvdXQgKCkge1xuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0xPR09VVClcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTG9nZ2luZyBvdXQuLi4nKVxuICAgIGF3YWl0IHRoaXMuY2xpZW50LmxvZ291dCgpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlLWNsb3NlcyB0aGUgY3VycmVudCBjb25uZWN0aW9uIGJ5IGNsb3NpbmcgdGhlIFRDUCBzb2NrZXQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNvY2tldCBpcyBjbG9zZWRcbiAgICovXG4gIGFzeW5jIGNsb3NlIChlcnIpIHtcbiAgICB0aGlzLl9jaGFuZ2VTdGF0ZShTVEFURV9MT0dPVVQpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lb3V0KVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDbG9zaW5nIGNvbm5lY3Rpb24uLi4nKVxuICAgIGF3YWl0IHRoaXMuY2xpZW50LmNsb3NlKGVycilcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBJRCBjb21tYW5kLCBwYXJzZXMgSUQgcmVzcG9uc2UsIHNldHMgdGhpcy5zZXJ2ZXJJZFxuICAgKlxuICAgKiBJRCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzI5NzFcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGlkIElEIGFzIEpTT04gb2JqZWN0LiBTZWUgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjk3MSNzZWN0aW9uLTMuMyBmb3IgcG9zc2libGUgdmFsdWVzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHJlc3BvbnNlIGhhcyBiZWVuIHBhcnNlZFxuICAgKi9cbiAgYXN5bmMgdXBkYXRlSWQgKGlkKSB7XG4gICAgaWYgKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignSUQnKSA8IDApIHJldHVyblxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1VwZGF0aW5nIGlkLi4uJylcblxuICAgIGNvbnN0IGNvbW1hbmQgPSAnSUQnXG4gICAgY29uc3QgYXR0cmlidXRlcyA9IGlkID8gWyBmbGF0dGVuKE9iamVjdC5lbnRyaWVzKGlkKSkgXSA6IFsgbnVsbCBdXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kLCBhdHRyaWJ1dGVzIH0sICdJRCcpXG4gICAgY29uc3QgbGlzdCA9IGZsYXR0ZW4ocGF0aE9yKFtdLCBbJ3BheWxvYWQnLCAnSUQnLCAnMCcsICdhdHRyaWJ1dGVzJywgJzAnXSwgcmVzcG9uc2UpLm1hcChPYmplY3QudmFsdWVzKSlcbiAgICBjb25zdCBrZXlzID0gbGlzdC5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAwKVxuICAgIGNvbnN0IHZhbHVlcyA9IGxpc3QuZmlsdGVyKChfLCBpKSA9PiBpICUgMiA9PT0gMSlcbiAgICB0aGlzLnNlcnZlcklkID0gZnJvbVBhaXJzKHppcChrZXlzLCB2YWx1ZXMpKVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZXJ2ZXIgaWQgdXBkYXRlZCEnLCB0aGlzLnNlcnZlcklkKVxuICB9XG5cbiAgX3Nob3VsZFNlbGVjdE1haWxib3ggKHBhdGgsIGN0eCkge1xuICAgIGlmICghY3R4KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzU2VsZWN0ID0gdGhpcy5jbGllbnQuZ2V0UHJldmlvdXNseVF1ZXVlZChbJ1NFTEVDVCcsICdFWEFNSU5FJ10sIGN0eClcbiAgICBpZiAocHJldmlvdXNTZWxlY3QgJiYgcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBwYXRoQXR0cmlidXRlID0gcHJldmlvdXNTZWxlY3QucmVxdWVzdC5hdHRyaWJ1dGVzLmZpbmQoKGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlLnR5cGUgPT09ICdTVFJJTkcnKVxuICAgICAgaWYgKHBhdGhBdHRyaWJ1dGUpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhBdHRyaWJ1dGUudmFsdWUgIT09IHBhdGhcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRNYWlsYm94ICE9PSBwYXRoXG4gIH1cblxuICAvKipcbiAgICogUnVucyBTRUxFQ1Qgb3IgRVhBTUlORSB0byBvcGVuIGEgbWFpbGJveFxuICAgKlxuICAgKiBTRUxFQ1QgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjFcbiAgICogRVhBTUlORSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjMuMlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBGdWxsIHBhdGggdG8gbWFpbGJveFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIHNlbGVjdGVkIG1haWxib3hcbiAgICovXG4gIGFzeW5jIHNlbGVjdE1haWxib3ggKHBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIGNvbW1hbmQ6IG9wdGlvbnMucmVhZE9ubHkgPyAnRVhBTUlORScgOiAnU0VMRUNUJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFt7IHR5cGU6ICdTVFJJTkcnLCB2YWx1ZTogcGF0aCB9XVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmNvbmRzdG9yZSAmJiB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0NPTkRTVE9SRScpID49IDApIHtcbiAgICAgIHF1ZXJ5LmF0dHJpYnV0ZXMucHVzaChbeyB0eXBlOiAnQVRPTScsIHZhbHVlOiAnQ09ORFNUT1JFJyB9XSlcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnT3BlbmluZycsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKHF1ZXJ5LCBbJ0VYSVNUUycsICdGTEFHUycsICdPSyddLCB7IGN0eDogb3B0aW9ucy5jdHggfSlcbiAgICBsZXQgbWFpbGJveEluZm8gPSBwYXJzZVNFTEVDVChyZXNwb25zZSlcblxuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX1NFTEVDVEVEKVxuXG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkTWFpbGJveCAhPT0gcGF0aCAmJiB0aGlzLm9uY2xvc2VtYWlsYm94KSB7XG4gICAgICBhd2FpdCB0aGlzLm9uY2xvc2VtYWlsYm94KHRoaXMuX3NlbGVjdGVkTWFpbGJveClcbiAgICB9XG4gICAgdGhpcy5fc2VsZWN0ZWRNYWlsYm94ID0gcGF0aFxuICAgIGlmICh0aGlzLm9uc2VsZWN0bWFpbGJveCkge1xuICAgICAgYXdhaXQgdGhpcy5vbnNlbGVjdG1haWxib3gocGF0aCwgbWFpbGJveEluZm8pXG4gICAgfVxuXG4gICAgcmV0dXJuIG1haWxib3hJbmZvXG4gIH1cblxuICAvKipcbiAgICogUnVucyBOQU1FU1BBQ0UgY29tbWFuZFxuICAgKlxuICAgKiBOQU1FU1BBQ0UgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjM0MlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aXRoIG5hbWVzcGFjZSBvYmplY3RcbiAgICovXG4gIGFzeW5jIGxpc3ROYW1lc3BhY2VzICgpIHtcbiAgICBpZiAodGhpcy5fY2FwYWJpbGl0eS5pbmRleE9mKCdOQU1FU1BBQ0UnKSA8IDApIHJldHVybiBmYWxzZVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0xpc3RpbmcgbmFtZXNwYWNlcy4uLicpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoJ05BTUVTUEFDRScsICdOQU1FU1BBQ0UnKVxuICAgIHJldHVybiBwYXJzZU5BTUVTUEFDRShyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIExJU1QgYW5kIExTVUIgY29tbWFuZHMuIFJldHJpZXZlcyBhIHRyZWUgb2YgYXZhaWxhYmxlIG1haWxib3hlc1xuICAgKlxuICAgKiBMSVNUIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMy44XG4gICAqIExTVUIgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjlcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCBsaXN0IG9mIG1haWxib3hlc1xuICAgKi9cbiAgYXN5bmMgbGlzdE1haWxib3hlcyAoKSB7XG4gICAgY29uc3QgdHJlZSA9IHsgcm9vdDogdHJ1ZSwgY2hpbGRyZW46IFtdIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMaXN0aW5nIG1haWxib3hlcy4uLicpXG4gICAgY29uc3QgbGlzdFJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKHsgY29tbWFuZDogJ0xJU1QnLCBhdHRyaWJ1dGVzOiBbJycsICcqJ10gfSwgJ0xJU1QnKVxuICAgIGNvbnN0IGxpc3QgPSBwYXRoT3IoW10sIFsncGF5bG9hZCcsICdMSVNUJ10sIGxpc3RSZXNwb25zZSlcbiAgICBsaXN0LmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb25zdCBhdHRyID0gcHJvcE9yKFtdLCAnYXR0cmlidXRlcycsIGl0ZW0pXG4gICAgICBpZiAoIWF0dHIubGVuZ3RoIDwgMykgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhdGggPSBwYXRoT3IoJycsIFsnMicsICd2YWx1ZSddLCBhdHRyKVxuICAgICAgY29uc3QgZGVsaW0gPSBwYXRoT3IoJy8nLCBbJzEnLCAndmFsdWUnXSwgYXR0cilcbiAgICAgIGNvbnN0IGJyYW5jaCA9IHRoaXMuX2Vuc3VyZVBhdGgodHJlZSwgcGF0aCwgZGVsaW0pXG4gICAgICBicmFuY2guZmxhZ3MgPSBwcm9wT3IoW10sICcwJywgYXR0cikubWFwKCh7dmFsdWV9KSA9PiB2YWx1ZSB8fCAnJylcbiAgICAgIGJyYW5jaC5saXN0ZWQgPSB0cnVlXG4gICAgICBjaGVja1NwZWNpYWxVc2UoYnJhbmNoKVxuICAgIH0pXG5cbiAgICBjb25zdCBsc3ViUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kOiAnTFNVQicsIGF0dHJpYnV0ZXM6IFsnJywgJyonXSB9LCAnTFNVQicpXG4gICAgY29uc3QgbHN1YiA9IHBhdGhPcihbXSwgWydwYXlsb2FkJywgJ0xTVUInXSwgbHN1YlJlc3BvbnNlKVxuICAgIGxzdWIuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgYXR0ciA9IHByb3BPcihbXSwgJ2F0dHJpYnV0ZXMnLCBpdGVtKVxuICAgICAgaWYgKCFhdHRyLmxlbmd0aCA8IDMpIHJldHVyblxuXG4gICAgICBjb25zdCBwYXRoID0gcGF0aE9yKCcnLCBbJzInLCAndmFsdWUnXSwgYXR0cilcbiAgICAgIGNvbnN0IGRlbGltID0gcGF0aE9yKCcvJywgWycxJywgJ3ZhbHVlJ10sIGF0dHIpXG4gICAgICBjb25zdCBicmFuY2ggPSB0aGlzLl9lbnN1cmVQYXRoKHRyZWUsIHBhdGgsIGRlbGltKVxuICAgICAgcHJvcE9yKFtdLCAnMCcsIGF0dHIpLm1hcCgoZmxhZyA9ICcnKSA9PiB7IGJyYW5jaC5mbGFncyA9IHVuaW9uKGJyYW5jaC5mbGFncywgW2ZsYWddKSB9KVxuICAgICAgYnJhbmNoLnN1YnNjcmliZWQgPSB0cnVlXG4gICAgfSlcblxuICAgIHJldHVybiB0cmVlXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbWFpbGJveCB3aXRoIHRoZSBnaXZlbiBwYXRoLlxuICAgKlxuICAgKiBDUkVBVEUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjNcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogICAgIFRoZSBwYXRoIG9mIHRoZSBtYWlsYm94IHlvdSB3b3VsZCBsaWtlIHRvIGNyZWF0ZS4gIFRoaXMgbWV0aG9kIHdpbGxcbiAgICogICAgIGhhbmRsZSB1dGY3IGVuY29kaW5nIGZvciB5b3UuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKiAgICAgUHJvbWlzZSByZXNvbHZlcyBpZiBtYWlsYm94IHdhcyBjcmVhdGVkLlxuICAgKiAgICAgSW4gdGhlIGV2ZW50IHRoZSBzZXJ2ZXIgc2F5cyBOTyBbQUxSRUFEWUVYSVNUU10sIHdlIHRyZWF0IHRoYXQgYXMgc3VjY2Vzcy5cbiAgICovXG4gIGFzeW5jIGNyZWF0ZU1haWxib3ggKHBhdGgpIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ3JlYXRpbmcgbWFpbGJveCcsIHBhdGgsICcuLi4nKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmV4ZWMoeyBjb21tYW5kOiAnQ1JFQVRFJywgYXR0cmlidXRlczogW2ltYXBFbmNvZGUocGF0aCldIH0pXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyICYmIGVyci5jb2RlID09PSAnQUxSRUFEWUVYSVNUUycpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUnVucyBGRVRDSCBjb21tYW5kXG4gICAqXG4gICAqIEZFVENIIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuNC41XG4gICAqIENIQU5HRURTSU5DRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM0NTUxI3NlY3Rpb24tMy4zXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIGZvciB0aGUgbWFpbGJveCB3aGljaCBzaG91bGQgYmUgc2VsZWN0ZWQgZm9yIHRoZSBjb21tYW5kLiBTZWxlY3RzIG1haWxib3ggaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZXF1ZW5jZSBTZXF1ZW5jZSBzZXQsIGVnIDE6KiBmb3IgYWxsIG1lc3NhZ2VzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbaXRlbXNdIE1lc3NhZ2UgZGF0YSBpdGVtIG5hbWVzIG9yIG1hY3JvXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGZldGNoZWQgbWVzc2FnZSBpbmZvXG4gICAqL1xuICBhc3luYyBsaXN0TWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBpdGVtcyA9IFt7IGZhc3Q6IHRydWUgfV0sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdGZXRjaGluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICcuLi4nKVxuICAgIGNvbnN0IGNvbW1hbmQgPSBidWlsZEZFVENIQ29tbWFuZChzZXF1ZW5jZSwgaXRlbXMsIG9wdGlvbnMpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmV4ZWMoY29tbWFuZCwgJ0ZFVENIJywge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgICByZXR1cm4gcGFyc2VGRVRDSChyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNFQVJDSCBjb21tYW5kXG4gICAqXG4gICAqIFNFQVJDSCBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge09iamVjdH0gcXVlcnkgU2VhcmNoIHRlcm1zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIGFzeW5jIHNlYXJjaCAocGF0aCwgcXVlcnksIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZWFyY2hpbmcgaW4nLCBwYXRoLCAnLi4uJylcbiAgICBjb25zdCBjb21tYW5kID0gYnVpbGRTRUFSQ0hDb21tYW5kKHF1ZXJ5LCBvcHRpb25zKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKGNvbW1hbmQsICdTRUFSQ0gnLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBwYXJzZVNFQVJDSChyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNUT1JFIGNvbW1hbmRcbiAgICpcbiAgICogU1RPUkUgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi40LjZcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2Ugc2VsZWN0b3Igd2hpY2ggdGhlIGZsYWcgY2hhbmdlIGlzIGFwcGxpZWQgdG9cbiAgICogQHBhcmFtIHtBcnJheX0gZmxhZ3NcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBRdWVyeSBtb2RpZmllcnNcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgc2V0RmxhZ3MgKHBhdGgsIHNlcXVlbmNlLCBmbGFncywgb3B0aW9ucykge1xuICAgIGxldCBrZXkgPSAnJ1xuICAgIGxldCBsaXN0ID0gW11cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGZsYWdzKSB8fCB0eXBlb2YgZmxhZ3MgIT09ICdvYmplY3QnKSB7XG4gICAgICBsaXN0ID0gW10uY29uY2F0KGZsYWdzIHx8IFtdKVxuICAgICAga2V5ID0gJydcbiAgICB9IGVsc2UgaWYgKGZsYWdzLmFkZCkge1xuICAgICAgbGlzdCA9IFtdLmNvbmNhdChmbGFncy5hZGQgfHwgW10pXG4gICAgICBrZXkgPSAnKydcbiAgICB9IGVsc2UgaWYgKGZsYWdzLnNldCkge1xuICAgICAga2V5ID0gJydcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3Muc2V0IHx8IFtdKVxuICAgIH0gZWxzZSBpZiAoZmxhZ3MucmVtb3ZlKSB7XG4gICAgICBrZXkgPSAnLSdcbiAgICAgIGxpc3QgPSBbXS5jb25jYXQoZmxhZ3MucmVtb3ZlIHx8IFtdKVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTZXR0aW5nIGZsYWdzIG9uJywgc2VxdWVuY2UsICdpbicsIHBhdGgsICcuLi4nKVxuICAgIHJldHVybiB0aGlzLnN0b3JlKHBhdGgsIHNlcXVlbmNlLCBrZXkgKyAnRkxBR1MnLCBsaXN0LCBvcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgU1RPUkUgY29tbWFuZFxuICAgKlxuICAgKiBTVE9SRSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuNlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSBzZWxlY3RvciB3aGljaCB0aGUgZmxhZyBjaGFuZ2UgaXMgYXBwbGllZCB0b1xuICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uIFNUT1JFIG1ldGhvZCB0byBjYWxsLCBlZyBcIitGTEFHU1wiXG4gICAqIEBwYXJhbSB7QXJyYXl9IGZsYWdzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdpdGggdGhlIGFycmF5IG9mIG1hdGNoaW5nIHNlcS4gb3IgdWlkIG51bWJlcnNcbiAgICovXG4gIGFzeW5jIHN0b3JlIChwYXRoLCBzZXF1ZW5jZSwgYWN0aW9uLCBmbGFncywgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgY29tbWFuZCA9IGJ1aWxkU1RPUkVDb21tYW5kKHNlcXVlbmNlLCBhY3Rpb24sIGZsYWdzLCBvcHRpb25zKVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5leGVjKGNvbW1hbmQsICdGRVRDSCcsIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gICAgcmV0dXJuIHBhcnNlRkVUQ0gocmVzcG9uc2UpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBBUFBFTkQgY29tbWFuZFxuICAgKlxuICAgKiBBUFBFTkQgZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4zLjExXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkZXN0aW5hdGlvbiBUaGUgbWFpbGJveCB3aGVyZSB0byBhcHBlbmQgdGhlIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gYXBwZW5kXG4gICAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnMuZmxhZ3MgQW55IGZsYWdzIHlvdSB3YW50IHRvIHNldCBvbiB0aGUgdXBsb2FkZWQgbWVzc2FnZS4gRGVmYXVsdHMgdG8gW1xcU2Vlbl0uIChvcHRpb25hbClcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2l0aCB0aGUgYXJyYXkgb2YgbWF0Y2hpbmcgc2VxLiBvciB1aWQgbnVtYmVyc1xuICAgKi9cbiAgdXBsb2FkIChkZXN0aW5hdGlvbiwgbWVzc2FnZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGZsYWdzID0gcHJvcE9yKFsnXFxcXFNlZW4nXSwgJ2ZsYWdzJywgb3B0aW9ucykubWFwKHZhbHVlID0+ICh7IHR5cGU6ICdhdG9tJywgdmFsdWUgfSkpXG4gICAgbGV0IGNvbW1hbmQgPSB7XG4gICAgICBjb21tYW5kOiAnQVBQRU5EJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgeyB0eXBlOiAnYXRvbScsIHZhbHVlOiBkZXN0aW5hdGlvbiB9LFxuICAgICAgICBmbGFncyxcbiAgICAgICAgeyB0eXBlOiAnbGl0ZXJhbCcsIHZhbHVlOiBtZXNzYWdlIH1cbiAgICAgIF1cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnVXBsb2FkaW5nIG1lc3NhZ2UgdG8nLCBkZXN0aW5hdGlvbiwgJy4uLicpXG4gICAgcmV0dXJuIHRoaXMuZXhlYyhjb21tYW5kKVxuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgbWVzc2FnZXMgZnJvbSBhIHNlbGVjdGVkIG1haWxib3hcbiAgICpcbiAgICogRVhQVU5HRSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuM1xuICAgKiBVSUQgRVhQVU5HRSBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM0MzE1I3NlY3Rpb24tMi4xXG4gICAqXG4gICAqIElmIHBvc3NpYmxlIChieVVpZDp0cnVlIGFuZCBVSURQTFVTIGV4dGVuc2lvbiBzdXBwb3J0ZWQpLCB1c2VzIFVJRCBFWFBVTkdFXG4gICAqIGNvbW1hbmQgdG8gZGVsZXRlIGEgcmFuZ2Ugb2YgbWVzc2FnZXMsIG90aGVyd2lzZSBmYWxscyBiYWNrIHRvIEVYUFVOR0UuXG4gICAqXG4gICAqIE5CISBUaGlzIG1ldGhvZCBtaWdodCBiZSBkZXN0cnVjdGl2ZSAtIGlmIEVYUFVOR0UgaXMgdXNlZCwgdGhlbiBhbnkgbWVzc2FnZXNcbiAgICogd2l0aCBcXERlbGV0ZWQgZmxhZyBzZXQgYXJlIGRlbGV0ZWRcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggZm9yIHRoZSBtYWlsYm94IHdoaWNoIHNob3VsZCBiZSBzZWxlY3RlZCBmb3IgdGhlIGNvbW1hbmQuIFNlbGVjdHMgbWFpbGJveCBpZiBuZWNlc3NhcnlcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNlcXVlbmNlIE1lc3NhZ2UgcmFuZ2UgdG8gYmUgZGVsZXRlZFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgZGVsZXRlTWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBvcHRpb25zID0ge30pIHtcbiAgICAvLyBhZGQgXFxEZWxldGVkIGZsYWcgdG8gdGhlIG1lc3NhZ2VzIGFuZCBydW4gRVhQVU5HRSBvciBVSUQgRVhQVU5HRVxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdEZWxldGluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnaW4nLCBwYXRoLCAnLi4uJylcbiAgICBjb25zdCB1c2VVaWRQbHVzID0gb3B0aW9ucy5ieVVpZCAmJiB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ1VJRFBMVVMnKSA+PSAwXG4gICAgY29uc3QgdWlkRXhwdW5nZUNvbW1hbmQgPSB7IGNvbW1hbmQ6ICdVSUQgRVhQVU5HRScsIGF0dHJpYnV0ZXM6IFt7IHR5cGU6ICdzZXF1ZW5jZScsIHZhbHVlOiBzZXF1ZW5jZSB9XSB9XG4gICAgYXdhaXQgdGhpcy5zZXRGbGFncyhwYXRoLCBzZXF1ZW5jZSwgeyBhZGQ6ICdcXFxcRGVsZXRlZCcgfSwgb3B0aW9ucylcbiAgICBjb25zdCBjbWQgPSB1c2VVaWRQbHVzID8gdWlkRXhwdW5nZUNvbW1hbmQgOiAnRVhQVU5HRSdcbiAgICByZXR1cm4gdGhpcy5leGVjKGNtZCwgbnVsbCwge1xuICAgICAgcHJlY2hlY2s6IChjdHgpID0+IHRoaXMuX3Nob3VsZFNlbGVjdE1haWxib3gocGF0aCwgY3R4KSA/IHRoaXMuc2VsZWN0TWFpbGJveChwYXRoLCB7IGN0eCB9KSA6IFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgYSByYW5nZSBvZiBtZXNzYWdlcyBmcm9tIHRoZSBhY3RpdmUgbWFpbGJveCB0byB0aGUgZGVzdGluYXRpb24gbWFpbGJveC5cbiAgICogU2lsZW50IG1ldGhvZCAodW5sZXNzIGFuIGVycm9yIG9jY3VycyksIGJ5IGRlZmF1bHQgcmV0dXJucyBubyBpbmZvcm1hdGlvbi5cbiAgICpcbiAgICogQ09QWSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjQuN1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSByYW5nZSB0byBiZSBjb3BpZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRlc3RpbmF0aW9uIERlc3RpbmF0aW9uIG1haWxib3ggcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFF1ZXJ5IG1vZGlmaWVyc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmJ5VWlkXSBJZiB0cnVlLCB1c2VzIFVJRCBDT1BZIGluc3RlYWQgb2YgQ09QWVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgY29weU1lc3NhZ2VzIChwYXRoLCBzZXF1ZW5jZSwgZGVzdGluYXRpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb3B5aW5nIG1lc3NhZ2VzJywgc2VxdWVuY2UsICdmcm9tJywgcGF0aCwgJ3RvJywgZGVzdGluYXRpb24sICcuLi4nKVxuICAgIGNvbnN0IHsgaHVtYW5SZWFkYWJsZSB9ID0gYXdhaXQgdGhpcy5leGVjKHtcbiAgICAgIGNvbW1hbmQ6IG9wdGlvbnMuYnlVaWQgPyAnVUlEIENPUFknIDogJ0NPUFknLFxuICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICB7IHR5cGU6ICdzZXF1ZW5jZScsIHZhbHVlOiBzZXF1ZW5jZSB9LFxuICAgICAgICB7IHR5cGU6ICdhdG9tJywgdmFsdWU6IGRlc3RpbmF0aW9uIH1cbiAgICAgIF1cbiAgICB9LCBudWxsLCB7XG4gICAgICBwcmVjaGVjazogKGN0eCkgPT4gdGhpcy5fc2hvdWxkU2VsZWN0TWFpbGJveChwYXRoLCBjdHgpID8gdGhpcy5zZWxlY3RNYWlsYm94KHBhdGgsIHsgY3R4IH0pIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9KVxuICAgIHJldHVybiBodW1hblJlYWRhYmxlIHx8ICdDT1BZIGNvbXBsZXRlZCdcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyBhIHJhbmdlIG9mIG1lc3NhZ2VzIGZyb20gdGhlIGFjdGl2ZSBtYWlsYm94IHRvIHRoZSBkZXN0aW5hdGlvbiBtYWlsYm94LlxuICAgKiBQcmVmZXJzIHRoZSBNT1ZFIGV4dGVuc2lvbiBidXQgaWYgbm90IGF2YWlsYWJsZSwgZmFsbHMgYmFjayB0b1xuICAgKiBDT1BZICsgRVhQVU5HRVxuICAgKlxuICAgKiBNT1ZFIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNjg1MVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCBmb3IgdGhlIG1haWxib3ggd2hpY2ggc2hvdWxkIGJlIHNlbGVjdGVkIGZvciB0aGUgY29tbWFuZC4gU2VsZWN0cyBtYWlsYm94IGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2VxdWVuY2UgTWVzc2FnZSByYW5nZSB0byBiZSBtb3ZlZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVzdGluYXRpb24gRGVzdGluYXRpb24gbWFpbGJveCBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gUXVlcnkgbW9kaWZpZXJzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlXG4gICAqL1xuICBhc3luYyBtb3ZlTWVzc2FnZXMgKHBhdGgsIHNlcXVlbmNlLCBkZXN0aW5hdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ01vdmluZyBtZXNzYWdlcycsIHNlcXVlbmNlLCAnZnJvbScsIHBhdGgsICd0bycsIGRlc3RpbmF0aW9uLCAnLi4uJylcblxuICAgIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ01PVkUnKSA9PT0gLTEpIHtcbiAgICAgIC8vIEZhbGxiYWNrIHRvIENPUFkgKyBFWFBVTkdFXG4gICAgICBhd2FpdCB0aGlzLmNvcHlNZXNzYWdlcyhwYXRoLCBzZXF1ZW5jZSwgZGVzdGluYXRpb24sIG9wdGlvbnMpXG4gICAgICByZXR1cm4gdGhpcy5kZWxldGVNZXNzYWdlcyhwYXRoLCBzZXF1ZW5jZSwgb3B0aW9ucylcbiAgICB9XG5cbiAgICAvLyBJZiBwb3NzaWJsZSwgdXNlIE1PVkVcbiAgICByZXR1cm4gdGhpcy5leGVjKHtcbiAgICAgIGNvbW1hbmQ6IG9wdGlvbnMuYnlVaWQgPyAnVUlEIE1PVkUnIDogJ01PVkUnLFxuICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICB7IHR5cGU6ICdzZXF1ZW5jZScsIHZhbHVlOiBzZXF1ZW5jZSB9LFxuICAgICAgICB7IHR5cGU6ICdhdG9tJywgdmFsdWU6IGRlc3RpbmF0aW9uIH1cbiAgICAgIF1cbiAgICB9LCBbJ09LJ10sIHtcbiAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB0aGlzLl9zaG91bGRTZWxlY3RNYWlsYm94KHBhdGgsIGN0eCkgPyB0aGlzLnNlbGVjdE1haWxib3gocGF0aCwgeyBjdHggfSkgOiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUnVucyBDT01QUkVTUyBjb21tYW5kXG4gICAqXG4gICAqIENPTVBSRVNTIGRldGFpbHM6XG4gICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzQ5NzhcbiAgICovXG4gIGFzeW5jIGNvbXByZXNzQ29ubmVjdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9lbmFibGVDb21wcmVzc2lvbiB8fCB0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0NPTVBSRVNTPURFRkxBVEUnKSA8IDAgfHwgdGhpcy5jbGllbnQuY29tcHJlc3NlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0VuYWJsaW5nIGNvbXByZXNzaW9uLi4uJylcbiAgICBhd2FpdCB0aGlzLmV4ZWMoe1xuICAgICAgY29tbWFuZDogJ0NPTVBSRVNTJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgdmFsdWU6ICdERUZMQVRFJ1xuICAgICAgfV1cbiAgICB9KVxuICAgIHRoaXMuY2xpZW50LmVuYWJsZUNvbXByZXNzaW9uKClcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29tcHJlc3Npb24gZW5hYmxlZCwgYWxsIGRhdGEgc2VudCBhbmQgcmVjZWl2ZWQgaXMgZGVmbGF0ZWQhJylcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIExPR0lOIG9yIEFVVEhFTlRJQ0FURSBYT0FVVEgyIGNvbW1hbmRcbiAgICpcbiAgICogTE9HSU4gZGV0YWlsczpcbiAgICogICBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tNi4yLjNcbiAgICogWE9BVVRIMiBkZXRhaWxzOlxuICAgKiAgIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2dtYWlsL3hvYXV0aDJfcHJvdG9jb2wjaW1hcF9wcm90b2NvbF9leGNoYW5nZVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYXV0aC51c2VyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhdXRoLnBhc3NcbiAgICogQHBhcmFtIHtTdHJpbmd9IGF1dGgueG9hdXRoMlxuICAgKi9cbiAgYXN5bmMgbG9naW4gKGF1dGgpIHtcbiAgICBsZXQgY29tbWFuZFxuICAgIGxldCBvcHRpb25zID0ge31cblxuICAgIGlmICghYXV0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdXRoZW50aWNhdGlvbiBpbmZvcm1hdGlvbiBub3QgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9jYXBhYmlsaXR5LmluZGV4T2YoJ0FVVEg9WE9BVVRIMicpID49IDAgJiYgYXV0aCAmJiBhdXRoLnhvYXV0aDIpIHtcbiAgICAgIGNvbW1hbmQgPSB7XG4gICAgICAgIGNvbW1hbmQ6ICdBVVRIRU5USUNBVEUnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgeyB0eXBlOiAnQVRPTScsIHZhbHVlOiAnWE9BVVRIMicgfSxcbiAgICAgICAgICB7IHR5cGU6ICdBVE9NJywgdmFsdWU6IGJ1aWxkWE9BdXRoMlRva2VuKGF1dGgudXNlciwgYXV0aC54b2F1dGgyKSwgc2Vuc2l0aXZlOiB0cnVlIH1cbiAgICAgICAgXVxuICAgICAgfVxuXG4gICAgICBvcHRpb25zLmVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lID0gdHJ1ZSAvLyArIHRhZ2dlZCBlcnJvciByZXNwb25zZSBleHBlY3RzIGFuIGVtcHR5IGxpbmUgaW4gcmV0dXJuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbW1hbmQgPSB7XG4gICAgICAgIGNvbW1hbmQ6ICdsb2dpbicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICB7IHR5cGU6ICdTVFJJTkcnLCB2YWx1ZTogYXV0aC51c2VyIHx8ICcnIH0sXG4gICAgICAgICAgeyB0eXBlOiAnU1RSSU5HJywgdmFsdWU6IGF1dGgucGFzcyB8fCAnJywgc2Vuc2l0aXZlOiB0cnVlIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluLi4uJylcbiAgICBjb25zdCByZXNwb25zZSA9IHRoaXMuZXhlYyhjb21tYW5kLCAnY2FwYWJpbGl0eScsIG9wdGlvbnMpXG4gICAgLypcbiAgICAgKiB1cGRhdGUgcG9zdC1hdXRoIGNhcGFiaWxpdGVzXG4gICAgICogY2FwYWJpbGl0eSBsaXN0IHNob3VsZG4ndCBjb250YWluIGF1dGggcmVsYXRlZCBzdHVmZiBhbnltb3JlXG4gICAgICogYnV0IHNvbWUgbmV3IGV4dGVuc2lvbnMgbWlnaHQgaGF2ZSBwb3BwZWQgdXAgdGhhdCBkbyBub3RcbiAgICAgKiBtYWtlIG11Y2ggc2Vuc2UgaW4gdGhlIG5vbi1hdXRoIHN0YXRlXG4gICAgICovXG4gICAgaWYgKHJlc3BvbnNlLmNhcGFiaWxpdHkgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eS5sZW5ndGgpIHtcbiAgICAgIC8vIGNhcGFiaWxpdGVzIHdlcmUgbGlzdGVkIHdpdGggdGhlIE9LIFtDQVBBQklMSVRZIC4uLl0gcmVzcG9uc2VcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5jYXBhYmlsaXR5XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5wYXlsb2FkICYmIHJlc3BvbnNlLnBheWxvYWQuQ0FQQUJJTElUWSAmJiByZXNwb25zZS5wYXlsb2FkLkNBUEFCSUxJVFkubGVuZ3RoKSB7XG4gICAgICAvLyBjYXBhYmlsaXRlcyB3ZXJlIGxpc3RlZCB3aXRoICogQ0FQQUJJTElUWSAuLi4gcmVzcG9uc2VcbiAgICAgIHRoaXMuX2NhcGFiaWxpdHkgPSByZXNwb25zZS5wYXlsb2FkLkNBUEFCSUxJVFkucG9wKCkuYXR0cmlidXRlcy5tYXAoKGNhcGEgPSAnJykgPT4gY2FwYS52YWx1ZS50b1VwcGVyQ2FzZSgpLnRyaW0oKSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2FwYWJpbGl0aWVzIHdlcmUgbm90IGF1dG9tYXRpY2FsbHkgbGlzdGVkLCByZWxvYWRcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ2FwYWJpbGl0eSh0cnVlKVxuICAgIH1cblxuICAgIHRoaXMuX2NoYW5nZVN0YXRlKFNUQVRFX0FVVEhFTlRJQ0FURUQpXG4gICAgdGhpcy5fYXV0aGVudGljYXRlZCA9IHRydWVcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTG9naW4gc3VjY2Vzc2Z1bCwgcG9zdC1hdXRoIGNhcGFiaWxpdGVzIHVwZGF0ZWQhJywgdGhpcy5fY2FwYWJpbGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYW4gSU1BUCBjb21tYW5kLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdCBTdHJ1Y3R1cmVkIHJlcXVlc3Qgb2JqZWN0XG4gICAqIEBwYXJhbSB7QXJyYXl9IGFjY2VwdFVudGFnZ2VkIGEgbGlzdCBvZiB1bnRhZ2dlZCByZXNwb25zZXMgdGhhdCB3aWxsIGJlIGluY2x1ZGVkIGluICdwYXlsb2FkJyBwcm9wZXJ0eVxuICAgKi9cbiAgYXN5bmMgZXhlYyAocmVxdWVzdCwgYWNjZXB0VW50YWdnZWQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmJyZWFrSWRsZSgpXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNsaWVudC5lbnF1ZXVlQ29tbWFuZChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucylcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eSkge1xuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLmNhcGFiaWxpdHlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICAvKipcbiAgICogVGhlIGNvbm5lY3Rpb24gaXMgaWRsaW5nLiBTZW5kcyBhIE5PT1Agb3IgSURMRSBjb21tYW5kXG4gICAqXG4gICAqIElETEUgZGV0YWlsczpcbiAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMjE3N1xuICAgKi9cbiAgZW50ZXJJZGxlICgpIHtcbiAgICBpZiAodGhpcy5fZW50ZXJlZElkbGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignSURMRScpID49IDAgPyAnSURMRScgOiAnTk9PUCdcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW50ZXJpbmcgaWRsZSB3aXRoICcgKyB0aGlzLl9lbnRlcmVkSWRsZSlcblxuICAgIGlmICh0aGlzLl9lbnRlcmVkSWRsZSA9PT0gJ05PT1AnKSB7XG4gICAgICB0aGlzLl9pZGxlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnU2VuZGluZyBOT09QJylcbiAgICAgICAgdGhpcy5leGVjKCdOT09QJylcbiAgICAgIH0sIHRoaXMudGltZW91dE5vb3ApXG4gICAgfSBlbHNlIGlmICh0aGlzLl9lbnRlcmVkSWRsZSA9PT0gJ0lETEUnKSB7XG4gICAgICB0aGlzLmNsaWVudC5lbnF1ZXVlQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdJRExFJ1xuICAgICAgfSlcbiAgICAgIHRoaXMuX2lkbGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xpZW50LnNlbmQoJ0RPTkVcXHJcXG4nKVxuICAgICAgICB0aGlzLl9lbnRlcmVkSWRsZSA9IGZhbHNlXG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdJZGxlIHRlcm1pbmF0ZWQnKVxuICAgICAgfSwgdGhpcy50aW1lb3V0SWRsZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgYWN0aW9ucyByZWxhdGVkIGlkbGluZywgaWYgSURMRSBpcyBzdXBwb3J0ZWQsIHNlbmRzIERPTkUgdG8gc3RvcCBpdFxuICAgKi9cbiAgYnJlYWtJZGxlICgpIHtcbiAgICBpZiAoIXRoaXMuX2VudGVyZWRJZGxlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVvdXQpXG4gICAgaWYgKHRoaXMuX2VudGVyZWRJZGxlID09PSAnSURMRScpIHtcbiAgICAgIHRoaXMuY2xpZW50LnNlbmQoJ0RPTkVcXHJcXG4nKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0lkbGUgdGVybWluYXRlZCcpXG4gICAgfVxuICAgIHRoaXMuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIFNUQVJUVExTIGNvbW1hbmQgaWYgbmVlZGVkXG4gICAqXG4gICAqIFNUQVJUVExTIGRldGFpbHM6XG4gICAqICAgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTYuMi4xXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlZF0gQnkgZGVmYXVsdCB0aGUgY29tbWFuZCBpcyBub3QgcnVuIGlmIGNhcGFiaWxpdHkgaXMgYWxyZWFkeSBsaXN0ZWQuIFNldCB0byB0cnVlIHRvIHNraXAgdGhpcyB2YWxpZGF0aW9uXG4gICAqL1xuICBhc3luYyB1cGdyYWRlQ29ubmVjdGlvbiAoKSB7XG4gICAgLy8gc2tpcCByZXF1ZXN0LCBpZiBhbHJlYWR5IHNlY3VyZWRcbiAgICBpZiAodGhpcy5jbGllbnQuc2VjdXJlTW9kZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gc2tpcCBpZiBTVEFSVFRMUyBub3QgYXZhaWxhYmxlIG9yIHN0YXJ0dGxzIHN1cHBvcnQgZGlzYWJsZWRcbiAgICBpZiAoKHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZignU1RBUlRUTFMnKSA8IDAgfHwgdGhpcy5faWdub3JlVExTKSAmJiAhdGhpcy5fcmVxdWlyZVRMUykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0VuY3J5cHRpbmcgY29ubmVjdGlvbi4uLicpXG4gICAgYXdhaXQgdGhpcy5leGVjKCdTVEFSVFRMUycpXG4gICAgdGhpcy5fY2FwYWJpbGl0eSA9IFtdXG4gICAgdGhpcy5jbGllbnQudXBncmFkZSgpXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQ2FwYWJpbGl0eSgpXG4gIH1cblxuICAvKipcbiAgICogUnVucyBDQVBBQklMSVRZIGNvbW1hbmRcbiAgICpcbiAgICogQ0FQQUJJTElUWSBkZXRhaWxzOlxuICAgKiAgIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi02LjEuMVxuICAgKlxuICAgKiBEb2Vzbid0IHJlZ2lzdGVyIHVudGFnZ2VkIENBUEFCSUxJVFkgaGFuZGxlciBhcyB0aGlzIGlzIGFscmVhZHlcbiAgICogaGFuZGxlZCBieSBnbG9iYWwgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZWRdIEJ5IGRlZmF1bHQgdGhlIGNvbW1hbmQgaXMgbm90IHJ1biBpZiBjYXBhYmlsaXR5IGlzIGFscmVhZHkgbGlzdGVkLiBTZXQgdG8gdHJ1ZSB0byBza2lwIHRoaXMgdmFsaWRhdGlvblxuICAgKi9cbiAgYXN5bmMgdXBkYXRlQ2FwYWJpbGl0eSAoZm9yY2VkKSB7XG4gICAgLy8gc2tpcCByZXF1ZXN0LCBpZiBub3QgZm9yY2VkIHVwZGF0ZSBhbmQgY2FwYWJpbGl0aWVzIGFyZSBhbHJlYWR5IGxvYWRlZFxuICAgIGlmICghZm9yY2VkICYmIHRoaXMuX2NhcGFiaWxpdHkubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiBTVEFSVFRMUyBpcyByZXF1aXJlZCB0aGVuIHNraXAgY2FwYWJpbGl0eSBsaXN0aW5nIGFzIHdlIGFyZSBnb2luZyB0byB0cnlcbiAgICAvLyBTVEFSVFRMUyBhbnl3YXkgYW5kIHdlIHJlLWNoZWNrIGNhcGFiaWxpdGllcyBhZnRlciBjb25uZWN0aW9uIGlzIHNlY3VyZWRcbiAgICBpZiAoIXRoaXMuY2xpZW50LnNlY3VyZU1vZGUgJiYgdGhpcy5fcmVxdWlyZVRMUykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ1VwZGF0aW5nIGNhcGFiaWxpdHkuLi4nKVxuICAgIHJldHVybiB0aGlzLmV4ZWMoJ0NBUEFCSUxJVFknKVxuICB9XG5cbiAgaGFzQ2FwYWJpbGl0eSAoY2FwYSA9ICcnKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhcGFiaWxpdHkuaW5kZXhPZihjYXBhLnRvVXBwZXJDYXNlKCkudHJpbSgpKSA+PSAwXG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXJzIGZvciB1bnRhZ2dlZCByZXNwb25zZXNcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGFuIHVudGFnZ2VkIE9LIGluY2x1ZGVzIFtDQVBBQklMSVRZXSB0YWcgYW5kIHVwZGF0ZXMgY2FwYWJpbGl0eSBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZE9rSGFuZGxlciAocmVzcG9uc2UpIHtcbiAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuY2FwYWJpbGl0eSkge1xuICAgICAgdGhpcy5fY2FwYWJpbGl0eSA9IHJlc3BvbnNlLmNhcGFiaWxpdHlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBjYXBhYmlsaXR5IG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5fY2FwYWJpbGl0eSA9IHBpcGUoXG4gICAgICBwcm9wT3IoW10sICdhdHRyaWJ1dGVzJyksXG4gICAgICBtYXAoKHt2YWx1ZX0pID0+ICh2YWx1ZSB8fCAnJykudG9VcHBlckNhc2UoKS50cmltKCkpXG4gICAgKShyZXNwb25zZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGV4aXN0aW5nIG1lc3NhZ2UgY291bnRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBzZXJ2ZXIgcmVzcG9uc2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dCBVbnRpbCBjYWxsZWQsIHNlcnZlciByZXNwb25zZXMgYXJlIG5vdCBwcm9jZXNzZWRcbiAgICovXG4gIF91bnRhZ2dlZEV4aXN0c0hhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmhhc093blByb3BlcnR5KCducicpKSB7XG4gICAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZXhpc3RzJywgcmVzcG9uc2UubnIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBhIG1lc3NhZ2UgaGFzIGJlZW4gZGVsZXRlZFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHNlcnZlciByZXNwb25zZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0IFVudGlsIGNhbGxlZCwgc2VydmVyIHJlc3BvbnNlcyBhcmUgbm90IHByb2Nlc3NlZFxuICAgKi9cbiAgX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmhhc093blByb3BlcnR5KCducicpKSB7XG4gICAgICB0aGlzLm9udXBkYXRlICYmIHRoaXMub251cGRhdGUodGhpcy5fc2VsZWN0ZWRNYWlsYm94LCAnZXhwdW5nZScsIHJlc3BvbnNlLm5yKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCBmbGFncyBoYXZlIGJlZW4gdXBkYXRlZCBmb3IgYSBtZXNzYWdlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgc2VydmVyIHJlc3BvbnNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHQgVW50aWwgY2FsbGVkLCBzZXJ2ZXIgcmVzcG9uc2VzIGFyZSBub3QgcHJvY2Vzc2VkXG4gICAqL1xuICBfdW50YWdnZWRGZXRjaEhhbmRsZXIgKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5vbnVwZGF0ZSAmJiB0aGlzLm9udXBkYXRlKHRoaXMuX3NlbGVjdGVkTWFpbGJveCwgJ2ZldGNoJywgW10uY29uY2F0KHBhcnNlRkVUQ0goeyBwYXlsb2FkOiB7IEZFVENIOiBbcmVzcG9uc2VdIH0gfSkgfHwgW10pLnNoaWZ0KCkpXG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlcnNcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHRoYXQgdGhlIGNvbm5lY3Rpb24gc3RhcnRlZCBpZGxpbmcuIEluaXRpYXRlcyBhIGN5Y2xlXG4gICAqIG9mIE5PT1BzIG9yIElETEVzIHRvIHJlY2VpdmUgbm90aWZpY2F0aW9ucyBhYm91dCB1cGRhdGVzIGluIHRoZSBzZXJ2ZXJcbiAgICovXG4gIF9vbklkbGUgKCkge1xuICAgIGlmICghdGhpcy5fYXV0aGVudGljYXRlZCB8fCB0aGlzLl9lbnRlcmVkSWRsZSkge1xuICAgICAgLy8gTm8gbmVlZCB0byBJRExFIHdoZW4gbm90IGxvZ2dlZCBpbiBvciBhbHJlYWR5IGlkbGluZ1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NsaWVudCBzdGFydGVkIGlkbGluZycpXG4gICAgdGhpcy5lbnRlcklkbGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIElNQVAgc3RhdGUgdmFsdWUgZm9yIHRoZSBjdXJyZW50IGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5ld1N0YXRlIFRoZSBzdGF0ZSB5b3Ugd2FudCB0byBjaGFuZ2UgdG9cbiAgICovXG4gIF9jaGFuZ2VTdGF0ZSAobmV3U3RhdGUpIHtcbiAgICBpZiAobmV3U3RhdGUgPT09IHRoaXMuX3N0YXRlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRW50ZXJpbmcgc3RhdGU6ICcgKyBuZXdTdGF0ZSlcblxuICAgIC8vIGlmIGEgbWFpbGJveCB3YXMgb3BlbmVkLCBlbWl0IG9uY2xvc2VtYWlsYm94IGFuZCBjbGVhciBzZWxlY3RlZE1haWxib3ggdmFsdWVcbiAgICBpZiAodGhpcy5fc3RhdGUgPT09IFNUQVRFX1NFTEVDVEVEICYmIHRoaXMuX3NlbGVjdGVkTWFpbGJveCkge1xuICAgICAgdGhpcy5vbmNsb3NlbWFpbGJveCAmJiB0aGlzLm9uY2xvc2VtYWlsYm94KHRoaXMuX3NlbGVjdGVkTWFpbGJveClcbiAgICAgIHRoaXMuX3NlbGVjdGVkTWFpbGJveCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fc3RhdGUgPSBuZXdTdGF0ZVxuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgYSBwYXRoIGV4aXN0cyBpbiB0aGUgTWFpbGJveCB0cmVlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0cmVlIE1haWxib3ggdHJlZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVsaW1pdGVyXG4gICAqIEByZXR1cm4ge09iamVjdH0gYnJhbmNoIGZvciB1c2VkIHBhdGhcbiAgICovXG4gIF9lbnN1cmVQYXRoICh0cmVlLCBwYXRoLCBkZWxpbWl0ZXIpIHtcbiAgICBjb25zdCBuYW1lcyA9IHBhdGguc3BsaXQoZGVsaW1pdGVyKVxuICAgIGxldCBicmFuY2ggPSB0cmVlXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZVxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBicmFuY2guY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBhcmVNYWlsYm94TmFtZXMoYnJhbmNoLmNoaWxkcmVuW2pdLm5hbWUsIGltYXBEZWNvZGUobmFtZXNbaV0pKSkge1xuICAgICAgICAgIGJyYW5jaCA9IGJyYW5jaC5jaGlsZHJlbltqXVxuICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgYnJhbmNoLmNoaWxkcmVuLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGltYXBEZWNvZGUobmFtZXNbaV0pLFxuICAgICAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLFxuICAgICAgICAgIHBhdGg6IG5hbWVzLnNsaWNlKDAsIGkgKyAxKS5qb2luKGRlbGltaXRlciksXG4gICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgIH0pXG4gICAgICAgIGJyYW5jaCA9IGJyYW5jaC5jaGlsZHJlblticmFuY2guY2hpbGRyZW4ubGVuZ3RoIC0gMV1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaFxuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIHR3byBtYWlsYm94IG5hbWVzLiBDYXNlIGluc2Vuc2l0aXZlIGluIGNhc2Ugb2YgSU5CT1gsIG90aGVyd2lzZSBjYXNlIHNlbnNpdGl2ZVxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYSBNYWlsYm94IG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGIgTWFpbGJveCBuYW1lXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBmb2xkZXIgbmFtZXMgbWF0Y2hcbiAgICovXG4gIF9jb21wYXJlTWFpbGJveE5hbWVzIChhLCBiKSB7XG4gICAgcmV0dXJuIChhLnRvVXBwZXJDYXNlKCkgPT09ICdJTkJPWCcgPyAnSU5CT1gnIDogYSkgPT09IChiLnRvVXBwZXJDYXNlKCkgPT09ICdJTkJPWCcgPyAnSU5CT1gnIDogYilcbiAgfVxuXG4gIGNyZWF0ZUxvZ2dlciAobG9nZ2VyID0gY3JlYXRlRGVmYXVsdExvZ2dlcigpKSB7XG4gICAgdGhpcy5sb2dnZXIgPSB0aGlzLmNsaWVudC5sb2dnZXIgPSB7XG4gICAgICBkZWJ1ZzogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9ERUJVRyA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci5kZWJ1Zyhtc2dzKSB9IH0sXG4gICAgICBpbmZvOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX0lORk8gPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIuaW5mbyhtc2dzKSB9IH0sXG4gICAgICB3YXJuOiAoLi4ubXNncykgPT4geyBpZiAoTE9HX0xFVkVMX1dBUk4gPj0gdGhpcy5sb2dMZXZlbCkgeyBsb2dnZXIud2Fybihtc2dzKSB9IH0sXG4gICAgICBlcnJvcjogKC4uLm1zZ3MpID0+IHsgaWYgKExPR19MRVZFTF9FUlJPUiA+PSB0aGlzLmxvZ0xldmVsKSB7IGxvZ2dlci5lcnJvcihtc2dzKSB9IH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==