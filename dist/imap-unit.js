'use strict';

var _imap = require('./imap');

var _imap2 = _interopRequireDefault(_imap);

var _common = require('./common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-unused-expressions */

var host = 'localhost';
var port = 10000;

describe('browserbox imap unit tests', function () {
  var client, socketStub;

  /* jshint indent:false */

  beforeEach(function () {
    client = new _imap2.default(host, port);
    expect(client).to.exist;

    client.logger = {
      debug: function debug() {},
      error: function error() {}
    };

    var Socket = function Socket() {};
    Socket.open = function () {};
    Socket.prototype.close = function () {};
    Socket.prototype.send = function () {};
    Socket.prototype.suspend = function () {};
    Socket.prototype.resume = function () {};
    Socket.prototype.upgradeToSecure = function () {};

    socketStub = sinon.createStubInstance(Socket);
    sinon.stub(Socket, 'open').withArgs(host, port).returns(socketStub);

    var promise = client.connect(Socket).then(function () {
      expect(Socket.open.callCount).to.equal(1);

      expect(socketStub.onerror).to.exist;
      expect(socketStub.onopen).to.exist;
      expect(socketStub.onclose).to.exist;
      expect(socketStub.ondata).to.exist;
    });

    setTimeout(function () {
      return socketStub.onopen();
    }, 10);

    return promise;
  });

  describe.skip('#close', function () {
    it('should call socket.close', function (done) {
      client.socket.readyState = 'open';

      client.close().then(function () {
        expect(socketStub.close.callCount).to.equal(1);
      }).then(done).catch(done);

      setTimeout(function () {
        return socketStub.onclose();
      }, 10);
    });

    it('should not call socket.close', function (done) {
      client.socket.readyState = 'not open. duh.';

      client.close().then(function () {
        expect(socketStub.close.called).to.be.false;
      }).then(done).catch(done);

      setTimeout(function () {
        return socketStub.onclose();
      }, 10);
    });
  });

  describe('#upgrade', function () {
    it('should upgrade socket', function () {
      client.secureMode = false;
      client.upgrade();
    });

    it('should not upgrade socket', function () {
      client.secureMode = true;
      client.upgrade();
    });
  });

  describe('#setHandler', function () {
    it('should set global handler for keyword', function () {
      var handler = function handler() {};
      client.setHandler('fetch', handler);

      expect(client._globalAcceptUntagged.FETCH).to.equal(handler);
    });
  });

  describe('#socket.onerror', function () {
    it('should emit error and close connection', function (done) {
      client.socket.onerror({
        data: new Error('err')
      });

      client.onerror = function () {
        done();
      };
    });
  });

  describe('#socket.onclose', function () {
    it('should emit error ', function (done) {
      client.socket.onclose();

      client.onerror = function () {
        done();
      };
    });
  });

  describe('#_onData', function () {
    it('should process input', function () {
      sinon.stub(client, '_parseIncomingCommands');
      sinon.stub(client, '_iterateIncomingBuffer');

      client._onData({
        data: (0, _common.toTypedArray)('foobar').buffer
      });

      expect(client._parseIncomingCommands.calledOnce).to.be.true;
      expect(client._iterateIncomingBuffer.calledOnce).to.be.true;
    });
  });

  describe('rateIncomingBuffer', function () {
    it('should iterate chunked input', function () {
      appendIncomingBuffer('* 1 FETCH (UID 1)\r\n* 2 FETCH (UID 2)\r\n* 3 FETCH (UID 3)\r\n');
      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID 2)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 3 FETCH (UID 3)');
      expect(iterator.next().value).to.be.undefined;
    });

    it('should process chunked literals', function () {
      appendIncomingBuffer('* 1 FETCH (UID {1}\r\n1)\r\n* 2 FETCH (UID {4}\r\n2345)\r\n* 3 FETCH (UID {4}\r\n3789)\r\n');
      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID {1}\r\n1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID {4}\r\n2345)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 3 FETCH (UID {4}\r\n3789)');
      expect(iterator.next().value).to.be.undefined;
    });

    it('should process chunked literals 2', function () {
      appendIncomingBuffer('* 1 FETCH (UID 1)\r\n* 2 FETCH (UID {4}\r\n2345)\r\n');
      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID {4}\r\n2345)');
      expect(iterator.next().value).to.be.undefined;
    });

    it('should process chunked literals 3', function () {
      appendIncomingBuffer('* 1 FETCH (UID {1}\r\n1)\r\n* 2 FETCH (UID 4)\r\n');
      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID {1}\r\n1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID 4)');
      expect(iterator.next().value).to.be.undefined;
    });

    it('should process chunked literals 4', function () {
      appendIncomingBuffer('* SEARCH {1}\r\n1 {1}\r\n2\r\n');
      var iterator = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* SEARCH {1}\r\n1 {1}\r\n2');
    });

    it('should process CRLF literal', function () {
      appendIncomingBuffer('* 1 FETCH (UID 20 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)\r\n');
      var iterator = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 20 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)');
    });

    it('should process CRLF literal 2', function () {
      appendIncomingBuffer('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}") BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)\r\n');
      var iterator = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}") BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)');
    });

    it('should parse multiple zero-length literals', function () {
      appendIncomingBuffer('* 126015 FETCH (UID 585599 BODY[1.2] {0}\r\n BODY[1.1] {0}\r\n)\r\n');
      var iterator = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 126015 FETCH (UID 585599 BODY[1.2] {0}\r\n BODY[1.1] {0}\r\n)');
    });

    it('should process two commands when CRLF arrives in 2 parts', function () {
      appendIncomingBuffer('* 1 FETCH (UID 1)\r');
      var iterator1 = client._iterateIncomingBuffer();
      expect(iterator1.next().value).to.be.undefined;

      appendIncomingBuffer('\n* 2 FETCH (UID 2)\r\n');
      var iterator2 = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID 1)');
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 2 FETCH (UID 2)');
      expect(iterator2.next().value).to.be.undefined;
    });

    it('should process literal when literal count arrives in 2 parts', function () {
      appendIncomingBuffer('* 1 FETCH (UID {');
      var iterator1 = client._iterateIncomingBuffer();
      expect(iterator1.next().value).to.be.undefined;

      appendIncomingBuffer('2}\r\n12)\r\n');
      var iterator2 = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID {2}\r\n12)');
      expect(iterator2.next().value).to.be.undefined;
    });

    it('should process literal when literal count arrives in 2 parts 2', function () {
      appendIncomingBuffer('* 1 FETCH (UID {1');
      var iterator1 = client._iterateIncomingBuffer();
      expect(iterator1.next().value).to.be.undefined;

      appendIncomingBuffer('0}\r\n0123456789)\r\n');
      var iterator2 = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID {10}\r\n0123456789)');
      expect(iterator2.next().value).to.be.undefined;
    });

    it('should process literal when literal count arrives in 2 parts 3', function () {
      appendIncomingBuffer('* 1 FETCH (UID {');
      var iterator1 = client._iterateIncomingBuffer();
      expect(iterator1.next().value).to.be.undefined;

      appendIncomingBuffer('10}\r\n1234567890)\r\n');
      var iterator2 = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID {10}\r\n1234567890)');
      expect(iterator2.next().value).to.be.undefined;
    });

    it('should process literal when literal count arrives in 2 parts 4', function () {
      appendIncomingBuffer('* 1 FETCH (UID 1 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r');
      var iterator1 = client._iterateIncomingBuffer();
      expect(iterator1.next().value).to.be.undefined;
      appendIncomingBuffer('\nXX)\r\n');
      var iterator2 = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID 1 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\nXX)');
    });

    it('should process literal when literal count arrives in 3 parts', function () {
      appendIncomingBuffer('* 1 FETCH (UID {');
      var iterator1 = client._iterateIncomingBuffer();
      expect(iterator1.next().value).to.be.undefined;

      appendIncomingBuffer('1');
      var iterator2 = client._iterateIncomingBuffer();
      expect(iterator2.next().value).to.be.undefined;

      appendIncomingBuffer('}\r\n1)\r\n');
      var iterator3 = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator3.next().value)).to.equal('* 1 FETCH (UID {1}\r\n1)');
      expect(iterator3.next().value).to.be.undefined;
    });

    it('should process SEARCH response when it arrives in 2 parts', function () {
      appendIncomingBuffer('* SEARCH 1 2');
      var iterator1 = client._iterateIncomingBuffer();
      expect(iterator1.next().value).to.be.undefined;

      appendIncomingBuffer(' 3 4\r\n');
      var iterator2 = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* SEARCH 1 2 3 4');
      expect(iterator2.next().value).to.be.undefined;
    });

    it('should not process {} in string as literal 1', function () {
      appendIncomingBuffer('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}"))\r\n');
      var iterator = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}"))');
    });

    it('should not process {} in string as literal 2', function () {
      appendIncomingBuffer('* 1 FETCH (UID 1 ENVELOPE ("string with number in parenthesis {123}"))\r\n');
      var iterator = client._iterateIncomingBuffer();
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1 ENVELOPE ("string with number in parenthesis {123}"))');
    });

    function appendIncomingBuffer(content) {
      client._incomingBuffers.push((0, _common.toTypedArray)(content));
    }
  });

  describe('#_parseIncomingCommands', function () {
    it('should process a tagged item from the queue', function () {
      var _marked = /*#__PURE__*/regeneratorRuntime.mark(gen);

      client.onready = sinon.stub();
      sinon.stub(client, '_handleResponse');

      function gen() {
        return regeneratorRuntime.wrap(function gen$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _common.toTypedArray)('OK Hello world!');

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, _marked, this);
      }

      client._parseIncomingCommands(gen());

      expect(client.onready.callCount).to.equal(1);
      expect(client._handleResponse.withArgs({
        tag: 'OK',
        command: 'Hello',
        attributes: [{
          type: 'ATOM',
          value: 'world!'
        }]
      }).calledOnce).to.be.true;
    });

    it('should process an untagged item from the queue', function () {
      var _marked2 = /*#__PURE__*/regeneratorRuntime.mark(gen);

      sinon.stub(client, '_handleResponse');

      function gen() {
        return regeneratorRuntime.wrap(function gen$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _common.toTypedArray)('* 1 EXISTS');

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _marked2, this);
      }

      client._parseIncomingCommands(gen());

      expect(client._handleResponse.withArgs({
        tag: '*',
        command: 'EXISTS',
        attributes: [],
        nr: 1
      }).calledOnce).to.be.true;
    });

    it('should process a plus tagged item from the queue', function () {
      var _marked3 = /*#__PURE__*/regeneratorRuntime.mark(gen);

      sinon.stub(client, 'send');

      function gen() {
        return regeneratorRuntime.wrap(function gen$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _common.toTypedArray)('+ Please continue');

              case 2:
              case 'end':
                return _context3.stop();
            }
          }
        }, _marked3, this);
      }
      client._currentCommand = {
        data: ['literal data']
      };

      client._parseIncomingCommands(gen());

      expect(client.send.withArgs('literal data\r\n').callCount).to.equal(1);
    });

    it('should process an XOAUTH2 error challenge', function () {
      var _marked4 = /*#__PURE__*/regeneratorRuntime.mark(gen);

      sinon.stub(client, 'send');

      function gen() {
        return regeneratorRuntime.wrap(function gen$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _common.toTypedArray)('+ FOOBAR');

              case 2:
              case 'end':
                return _context4.stop();
            }
          }
        }, _marked4, this);
      }
      client._currentCommand = {
        data: [],
        errorResponseExpectsEmptyLine: true
      };

      client._parseIncomingCommands(gen());

      expect(client.send.withArgs('\r\n').callCount).to.equal(1);
    });
  });

  describe('#_handleResponse', function () {
    it('should invoke global handler by default', function () {
      sinon.stub(client, '_processResponse');
      sinon.stub(client, '_sendRequest');

      client._globalAcceptUntagged.TEST = function () {};
      sinon.stub(client._globalAcceptUntagged, 'TEST');

      client._currentCommand = false;
      client._handleResponse({
        tag: '*',
        command: 'test'
      });

      expect(client._sendRequest.callCount).to.equal(1);
      expect(client._globalAcceptUntagged.TEST.withArgs({
        tag: '*',
        command: 'test'
      }).callCount).to.equal(1);
    });

    it('should invoke global handler if needed', function () {
      sinon.stub(client, '_processResponse');
      client._globalAcceptUntagged.TEST = function () {};
      sinon.stub(client._globalAcceptUntagged, 'TEST');
      sinon.stub(client, '_sendRequest');

      client._currentCommand = {
        payload: {}
      };
      client._handleResponse({
        tag: '*',
        command: 'test'
      });

      expect(client._sendRequest.callCount).to.equal(0);
      expect(client._globalAcceptUntagged.TEST.withArgs({
        tag: '*',
        command: 'test'
      }).callCount).to.equal(1);
    });

    it('should push to payload', function () {
      sinon.stub(client, '_processResponse');
      client._globalAcceptUntagged.TEST = function () {};
      sinon.stub(client._globalAcceptUntagged, 'TEST');

      client._currentCommand = {
        payload: {
          TEST: []
        }
      };
      client._handleResponse({
        tag: '*',
        command: 'test'
      });

      expect(client._globalAcceptUntagged.TEST.callCount).to.equal(0);
      expect(client._currentCommand.payload.TEST).to.deep.equal([{
        tag: '*',
        command: 'test'
      }]);
    });

    it('should invoke command callback', function () {
      sinon.stub(client, '_processResponse');
      sinon.stub(client, '_sendRequest');
      client._globalAcceptUntagged.TEST = function () {};
      sinon.stub(client._globalAcceptUntagged, 'TEST');

      client._currentCommand = {
        tag: 'A',
        callback: function callback(response) {
          expect(response).to.deep.equal({
            tag: 'A',
            command: 'test',
            payload: {
              TEST: 'abc'
            }
          });
        },
        payload: {
          TEST: 'abc'
        }
      };
      client._handleResponse({
        tag: 'A',
        command: 'test'
      });

      expect(client._sendRequest.callCount).to.equal(1);
      expect(client._globalAcceptUntagged.TEST.callCount).to.equal(0);
    });
  });

  describe('#enqueueCommand', function () {
    it('should reject on NO/BAD', function (done) {
      sinon.stub(client, '_sendRequest').callsFake(function () {
        client._clientQueue[0].callback({ command: 'NO' });
      });

      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = true;

      client.enqueueCommand({
        command: 'abc'
      }, ['def'], {
        t: 1
      }).catch(function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should invoke sending', function (done) {
      sinon.stub(client, '_sendRequest').callsFake(function () {
        client._clientQueue[0].callback({});
      });

      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = true;

      client.enqueueCommand({
        command: 'abc'
      }, ['def'], {
        t: 1
      }).then(function () {
        expect(client._sendRequest.callCount).to.equal(1);
        expect(client._clientQueue.length).to.equal(1);
        expect(client._clientQueue[0].tag).to.equal('W101');
        expect(client._clientQueue[0].request).to.deep.equal({
          command: 'abc',
          tag: 'W101'
        });
        expect(client._clientQueue[0].t).to.equal(1);
      }).then(done).catch(done);
    });

    it('should only queue', function (done) {
      sinon.stub(client, '_sendRequest');

      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = false;

      client.enqueueCommand({
        command: 'abc'
      }, ['def'], {
        t: 1
      }).then(function () {
        expect(client._sendRequest.callCount).to.equal(0);
        expect(client._clientQueue.length).to.equal(1);
        expect(client._clientQueue[0].tag).to.equal('W101');
      }).then(done).catch(done);

      setTimeout(function () {
        client._clientQueue[0].callback({});
      }, 0);
    });

    it('should store valueAsString option in the command', function (done) {
      sinon.stub(client, '_sendRequest');

      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = false;

      client.enqueueCommand({
        command: 'abc',
        valueAsString: false
      }, ['def'], {
        t: 1
      }).then(function () {
        expect(client._clientQueue[0].request.valueAsString).to.equal(false);
      }).then(done).catch(done);

      setTimeout(function () {
        client._clientQueue[0].callback({});
      }, 0);
    });
  });

  describe('#_sendRequest', function () {
    it('should enter idle if nothing is to process', function () {
      sinon.stub(client, '_enterIdle');

      client._clientQueue = [];
      client._sendRequest();

      expect(client._enterIdle.callCount).to.equal(1);
    });

    it('should send data', function () {
      sinon.stub(client, '_clearIdle');
      sinon.stub(client, 'send');

      client._clientQueue = [{
        request: {
          tag: 'W101',
          command: 'TEST'
        }
      }];
      client._sendRequest();

      expect(client._clearIdle.callCount).to.equal(1);
      expect(client.send.args[0][0]).to.equal('W101 TEST\r\n');
    });

    it('should send partial data', function () {
      sinon.stub(client, '_clearIdle');
      sinon.stub(client, 'send');

      client._clientQueue = [{
        request: {
          tag: 'W101',
          command: 'TEST',
          attributes: [{
            type: 'LITERAL',
            value: 'abc'
          }]
        }
      }];
      client._sendRequest();

      expect(client._clearIdle.callCount).to.equal(1);
      expect(client.send.args[0][0]).to.equal('W101 TEST {3}\r\n');
      expect(client._currentCommand.data).to.deep.equal(['abc']);
    });

    it('should run precheck', function (done) {
      sinon.stub(client, '_clearIdle');

      client._canSend = true;
      client._clientQueue = [{
        request: {
          tag: 'W101',
          command: 'TEST',
          attributes: [{
            type: 'LITERAL',
            value: 'abc'
          }]
        },
        precheck: function precheck(ctx) {
          expect(ctx).to.exist;
          expect(client._canSend).to.be.true;
          client._sendRequest = function () {
            expect(client._clientQueue.length).to.equal(2);
            expect(client._clientQueue[0].tag).to.include('.p');
            expect(client._clientQueue[0].request.tag).to.include('.p');
            client._clearIdle.restore();
            done();
          };
          client.enqueueCommand({}, undefined, {
            ctx: ctx
          });
          return Promise.resolve();
        }
      }];
      client._sendRequest();
    });
  });

  describe('#_enterIdle', function () {
    it('should set idle timer', function (done) {
      client.onidle = function () {
        done();
      };
      client.TIMEOUT_ENTER_IDLE = 1;

      client._enterIdle();
    });
  });

  describe('#_processResponse', function () {
    it('should set humanReadable', function () {
      var response = {
        tag: '*',
        command: 'OK',
        attributes: [{
          type: 'TEXT',
          value: 'Some random text'
        }]
      };
      client._processResponse(response);

      expect(response.humanReadable).to.equal('Some random text');
    });

    it('should set response code', function () {
      var response = {
        tag: '*',
        command: 'OK',
        attributes: [{
          type: 'ATOM',
          section: [{
            type: 'ATOM',
            value: 'CAPABILITY'
          }, {
            type: 'ATOM',
            value: 'IMAP4REV1'
          }, {
            type: 'ATOM',
            value: 'UIDPLUS'
          }]
        }, {
          type: 'TEXT',
          value: 'Some random text'
        }]
      };
      client._processResponse(response);
      expect(response.code).to.equal('CAPABILITY');
      expect(response.capability).to.deep.equal(['IMAP4REV1', 'UIDPLUS']);
    });
  });

  describe('#isError', function () {
    it('should detect if an object is an error', function () {
      expect(client.isError(new RangeError('abc'))).to.be.true;
      expect(client.isError('abc')).to.be.false;
    });
  });

  describe('#enableCompression', function () {
    it('should create inflater and deflater streams', function () {
      client.socket.ondata = function () {};
      sinon.stub(client.socket, 'ondata');

      expect(client.compressed).to.be.false;
      client.enableCompression();
      expect(client.compressed).to.be.true;

      sinon.stub(client._compression, 'inflate').callsFake(function () {
        client._compression.inflatedReady(new Uint8Array([1, 2, 3]).buffer);
      });
      sinon.stub(client._compression, 'deflate').callsFake(function () {
        client._compression.deflatedReady(new Uint8Array([4, 5, 6]).buffer);
      });

      client.send('a');
      client.socket.ondata(new Uint8Array([1]).buffer);

      expect(socketStub.send.args[0][0]).to.deep.equal(new Uint8Array([4, 5, 6]).buffer);
      expect(client._socketOnData.args[0][0]).to.deep.equal({
        data: new Uint8Array([1, 2, 3]).buffer
      });
    });
  });

  describe('#getPreviouslyQueued', function () {
    var ctx = {};

    it('should return undefined with empty queue and no current command', function () {
      client._currentCommand = undefined;
      client._clientQueue = [];

      expect(testAndGetAttribute()).to.be.undefined;
    });

    it('should return undefined with empty queue and non-SELECT current command', function () {
      client._currentCommand = createCommand('TEST');
      client._clientQueue = [];

      expect(testAndGetAttribute()).to.be.undefined;
    });

    it('should return current command with empty queue and SELECT current command', function () {
      client._currentCommand = createCommand('SELECT', 'ATTR');
      client._clientQueue = [];

      expect(testAndGetAttribute()).to.equal('ATTR');
    });

    it('should return current command with non-SELECT commands in queue and SELECT current command', function () {
      client._currentCommand = createCommand('SELECT', 'ATTR');
      client._clientQueue = [createCommand('TEST01'), createCommand('TEST02')];

      expect(testAndGetAttribute()).to.equal('ATTR');
    });

    it('should return last SELECT before ctx with multiple SELECT commands in queue (1)', function () {
      client._currentCommand = createCommand('SELECT', 'ATTR01');
      client._clientQueue = [createCommand('SELECT', 'ATTR'), createCommand('TEST'), ctx, createCommand('SELECT', 'ATTR03')];

      expect(testAndGetAttribute()).to.equal('ATTR');
    });

    it('should return last SELECT before ctx with multiple SELECT commands in queue (2)', function () {
      client._clientQueue = [createCommand('SELECT', 'ATTR02'), createCommand('SELECT', 'ATTR'), ctx, createCommand('SELECT', 'ATTR03')];

      expect(testAndGetAttribute()).to.equal('ATTR');
    });

    it('should return last SELECT before ctx with multiple SELECT commands in queue (3)', function () {
      client._clientQueue = [createCommand('SELECT', 'ATTR02'), createCommand('SELECT', 'ATTR'), createCommand('TEST'), ctx, createCommand('SELECT', 'ATTR03')];

      expect(testAndGetAttribute()).to.equal('ATTR');
    });

    function testAndGetAttribute() {
      var data = client.getPreviouslyQueued(['SELECT'], ctx);
      if (data) {
        return data.request.attributes[0].value;
      }
    }

    function createCommand(command, attribute) {
      var attributes = [];
      var data = {
        request: { command: command, attributes: attributes }
      };

      if (attribute) {
        data.request.attributes.push({
          type: 'STRING',
          value: attribute
        });
      }

      return data;
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLXVuaXQuanMiXSwibmFtZXMiOlsiaG9zdCIsInBvcnQiLCJkZXNjcmliZSIsImNsaWVudCIsInNvY2tldFN0dWIiLCJiZWZvcmVFYWNoIiwiZXhwZWN0IiwidG8iLCJleGlzdCIsImxvZ2dlciIsImRlYnVnIiwiZXJyb3IiLCJTb2NrZXQiLCJvcGVuIiwicHJvdG90eXBlIiwiY2xvc2UiLCJzZW5kIiwic3VzcGVuZCIsInJlc3VtZSIsInVwZ3JhZGVUb1NlY3VyZSIsInNpbm9uIiwiY3JlYXRlU3R1Ykluc3RhbmNlIiwic3R1YiIsIndpdGhBcmdzIiwicmV0dXJucyIsInByb21pc2UiLCJjb25uZWN0IiwidGhlbiIsImNhbGxDb3VudCIsImVxdWFsIiwib25lcnJvciIsIm9ub3BlbiIsIm9uY2xvc2UiLCJvbmRhdGEiLCJzZXRUaW1lb3V0Iiwic2tpcCIsIml0IiwiZG9uZSIsInNvY2tldCIsInJlYWR5U3RhdGUiLCJjYXRjaCIsImNhbGxlZCIsImJlIiwiZmFsc2UiLCJzZWN1cmVNb2RlIiwidXBncmFkZSIsImhhbmRsZXIiLCJzZXRIYW5kbGVyIiwiX2dsb2JhbEFjY2VwdFVudGFnZ2VkIiwiRkVUQ0giLCJkYXRhIiwiRXJyb3IiLCJfb25EYXRhIiwiYnVmZmVyIiwiX3BhcnNlSW5jb21pbmdDb21tYW5kcyIsImNhbGxlZE9uY2UiLCJ0cnVlIiwiX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlciIsImFwcGVuZEluY29taW5nQnVmZmVyIiwiaXRlcmF0b3IiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJhcHBseSIsIm5leHQiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsIml0ZXJhdG9yMSIsIml0ZXJhdG9yMiIsIml0ZXJhdG9yMyIsImNvbnRlbnQiLCJfaW5jb21pbmdCdWZmZXJzIiwicHVzaCIsImdlbiIsIm9ucmVhZHkiLCJfaGFuZGxlUmVzcG9uc2UiLCJ0YWciLCJjb21tYW5kIiwiYXR0cmlidXRlcyIsInR5cGUiLCJuciIsIl9jdXJyZW50Q29tbWFuZCIsImVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lIiwiVEVTVCIsIl9zZW5kUmVxdWVzdCIsInBheWxvYWQiLCJkZWVwIiwiY2FsbGJhY2siLCJyZXNwb25zZSIsImNhbGxzRmFrZSIsIl9jbGllbnRRdWV1ZSIsIl90YWdDb3VudGVyIiwiX2NhblNlbmQiLCJlbnF1ZXVlQ29tbWFuZCIsInQiLCJlcnIiLCJsZW5ndGgiLCJyZXF1ZXN0IiwidmFsdWVBc1N0cmluZyIsIl9lbnRlcklkbGUiLCJfY2xlYXJJZGxlIiwiYXJncyIsInByZWNoZWNrIiwiY3R4IiwiaW5jbHVkZSIsInJlc3RvcmUiLCJQcm9taXNlIiwicmVzb2x2ZSIsIm9uaWRsZSIsIlRJTUVPVVRfRU5URVJfSURMRSIsIl9wcm9jZXNzUmVzcG9uc2UiLCJodW1hblJlYWRhYmxlIiwic2VjdGlvbiIsImNvZGUiLCJjYXBhYmlsaXR5IiwiaXNFcnJvciIsIlJhbmdlRXJyb3IiLCJjb21wcmVzc2VkIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJfY29tcHJlc3Npb24iLCJpbmZsYXRlZFJlYWR5IiwiVWludDhBcnJheSIsImRlZmxhdGVkUmVhZHkiLCJfc29ja2V0T25EYXRhIiwidGVzdEFuZEdldEF0dHJpYnV0ZSIsImNyZWF0ZUNvbW1hbmQiLCJnZXRQcmV2aW91c2x5UXVldWVkIiwiYXR0cmlidXRlIl0sIm1hcHBpbmdzIjoiOztBQUVBOzs7O0FBQ0E7Ozs7QUFIQTs7QUFLQSxJQUFNQSxPQUFPLFdBQWI7QUFDQSxJQUFNQyxPQUFPLEtBQWI7O0FBRUFDLFNBQVMsNEJBQVQsRUFBdUMsWUFBTTtBQUMzQyxNQUFJQyxNQUFKLEVBQVlDLFVBQVo7O0FBRUE7O0FBRUFDLGFBQVcsWUFBTTtBQUNmRixhQUFTLG1CQUFlSCxJQUFmLEVBQXFCQyxJQUFyQixDQUFUO0FBQ0FLLFdBQU9ILE1BQVAsRUFBZUksRUFBZixDQUFrQkMsS0FBbEI7O0FBRUFMLFdBQU9NLE1BQVAsR0FBZ0I7QUFDZEMsYUFBTyxpQkFBTSxDQUFHLENBREY7QUFF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QUF3QmhELE9BQXhCLEVBQWlDa0QsU0FBakMsRUFBNEM7QUFDMUMsVUFBTWpELGFBQWEsRUFBbkI7QUFDQSxVQUFNM0IsT0FBTztBQUNYOEMsaUJBQVMsRUFBRXBCLGdCQUFGLEVBQVdDLHNCQUFYO0FBREUsT0FBYjs7QUFJQSxVQUFJaUQsU0FBSixFQUFlO0FBQ2I1RSxhQUFLOEMsT0FBTCxDQUFhbkIsVUFBYixDQUF3Qk4sSUFBeEIsQ0FBNkI7QUFDM0JPLGdCQUFNLFFBRHFCO0FBRTNCZCxpQkFBTzhEO0FBRm9CLFNBQTdCO0FBSUQ7O0FBRUQsYUFBTzVFLElBQVA7QUFDRDtBQUNGLEdBM0ZEO0FBNEZELENBL3dCRCIsImZpbGUiOiJpbWFwLXVuaXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMgKi9cblxuaW1wb3J0IEltYXBDbGllbnQgZnJvbSAnLi9pbWFwJ1xuaW1wb3J0IHsgdG9UeXBlZEFycmF5IH0gZnJvbSAnLi9jb21tb24nXG5cbmNvbnN0IGhvc3QgPSAnbG9jYWxob3N0J1xuY29uc3QgcG9ydCA9IDEwMDAwXG5cbmRlc2NyaWJlKCdicm93c2VyYm94IGltYXAgdW5pdCB0ZXN0cycsICgpID0+IHtcbiAgdmFyIGNsaWVudCwgc29ja2V0U3R1YlxuXG4gIC8qIGpzaGludCBpbmRlbnQ6ZmFsc2UgKi9cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjbGllbnQgPSBuZXcgSW1hcENsaWVudChob3N0LCBwb3J0KVxuICAgIGV4cGVjdChjbGllbnQpLnRvLmV4aXN0XG5cbiAgICBjbGllbnQubG9nZ2VyID0ge1xuICAgICAgZGVidWc6ICgpID0+IHsgfSxcbiAgICAgIGVycm9yOiAoKSA9PiB7IH1cbiAgICB9XG5cbiAgICB2YXIgU29ja2V0ID0gZnVuY3Rpb24gKCkgeyB9XG4gICAgU29ja2V0Lm9wZW4gPSAoKSA9PiB7IH1cbiAgICBTb2NrZXQucHJvdG90eXBlLmNsb3NlID0gKCkgPT4geyB9XG4gICAgU29ja2V0LnByb3RvdHlwZS5zZW5kID0gKCkgPT4geyB9XG4gICAgU29ja2V0LnByb3RvdHlwZS5zdXNwZW5kID0gKCkgPT4geyB9XG4gICAgU29ja2V0LnByb3RvdHlwZS5yZXN1bWUgPSAoKSA9PiB7IH1cbiAgICBTb2NrZXQucHJvdG90eXBlLnVwZ3JhZGVUb1NlY3VyZSA9ICgpID0+IHsgfVxuXG4gICAgc29ja2V0U3R1YiA9IHNpbm9uLmNyZWF0ZVN0dWJJbnN0YW5jZShTb2NrZXQpXG4gICAgc2lub24uc3R1YihTb2NrZXQsICdvcGVuJykud2l0aEFyZ3MoaG9zdCwgcG9ydCkucmV0dXJucyhzb2NrZXRTdHViKVxuXG4gICAgdmFyIHByb21pc2UgPSBjbGllbnQuY29ubmVjdChTb2NrZXQpLnRoZW4oKCkgPT4ge1xuICAgICAgZXhwZWN0KFNvY2tldC5vcGVuLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcblxuICAgICAgZXhwZWN0KHNvY2tldFN0dWIub25lcnJvcikudG8uZXhpc3RcbiAgICAgIGV4cGVjdChzb2NrZXRTdHViLm9ub3BlbikudG8uZXhpc3RcbiAgICAgIGV4cGVjdChzb2NrZXRTdHViLm9uY2xvc2UpLnRvLmV4aXN0XG4gICAgICBleHBlY3Qoc29ja2V0U3R1Yi5vbmRhdGEpLnRvLmV4aXN0XG4gICAgfSlcblxuICAgIHNldFRpbWVvdXQoKCkgPT4gc29ja2V0U3R1Yi5vbm9wZW4oKSwgMTApXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9KVxuXG4gIGRlc2NyaWJlLnNraXAoJyNjbG9zZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGNhbGwgc29ja2V0LmNsb3NlJywgKGRvbmUpID0+IHtcbiAgICAgIGNsaWVudC5zb2NrZXQucmVhZHlTdGF0ZSA9ICdvcGVuJ1xuXG4gICAgICBjbGllbnQuY2xvc2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHNvY2tldFN0dWIuY2xvc2UuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNvY2tldFN0dWIub25jbG9zZSgpLCAxMClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBub3QgY2FsbCBzb2NrZXQuY2xvc2UnLCAoZG9uZSkgPT4ge1xuICAgICAgY2xpZW50LnNvY2tldC5yZWFkeVN0YXRlID0gJ25vdCBvcGVuLiBkdWguJ1xuXG4gICAgICBjbGllbnQuY2xvc2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHNvY2tldFN0dWIuY2xvc2UuY2FsbGVkKS50by5iZS5mYWxzZVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNvY2tldFN0dWIub25jbG9zZSgpLCAxMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjdXBncmFkZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHVwZ3JhZGUgc29ja2V0JywgKCkgPT4ge1xuICAgICAgY2xpZW50LnNlY3VyZU1vZGUgPSBmYWxzZVxuICAgICAgY2xpZW50LnVwZ3JhZGUoKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIG5vdCB1cGdyYWRlIHNvY2tldCcsICgpID0+IHtcbiAgICAgIGNsaWVudC5zZWN1cmVNb2RlID0gdHJ1ZVxuICAgICAgY2xpZW50LnVwZ3JhZGUoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNzZXRIYW5kbGVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgc2V0IGdsb2JhbCBoYW5kbGVyIGZvciBrZXl3b3JkJywgKCkgPT4ge1xuICAgICAgdmFyIGhhbmRsZXIgPSAoKSA9PiB7IH1cbiAgICAgIGNsaWVudC5zZXRIYW5kbGVyKCdmZXRjaCcsIGhhbmRsZXIpXG5cbiAgICAgIGV4cGVjdChjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLkZFVENIKS50by5lcXVhbChoYW5kbGVyKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNzb2NrZXQub25lcnJvcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGVtaXQgZXJyb3IgYW5kIGNsb3NlIGNvbm5lY3Rpb24nLCAoZG9uZSkgPT4ge1xuICAgICAgY2xpZW50LnNvY2tldC5vbmVycm9yKHtcbiAgICAgICAgZGF0YTogbmV3IEVycm9yKCdlcnInKVxuICAgICAgfSlcblxuICAgICAgY2xpZW50Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNzb2NrZXQub25jbG9zZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGVtaXQgZXJyb3IgJywgKGRvbmUpID0+IHtcbiAgICAgIGNsaWVudC5zb2NrZXQub25jbG9zZSgpXG5cbiAgICAgIGNsaWVudC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX29uRGF0YScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgaW5wdXQnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19wYXJzZUluY29taW5nQ29tbWFuZHMnKVxuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfaXRlcmF0ZUluY29taW5nQnVmZmVyJylcblxuICAgICAgY2xpZW50Ll9vbkRhdGEoe1xuICAgICAgICBkYXRhOiB0b1R5cGVkQXJyYXkoJ2Zvb2JhcicpLmJ1ZmZlclxuICAgICAgfSlcblxuICAgICAgZXhwZWN0KGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgIGV4cGVjdChjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlci5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgncmF0ZUluY29taW5nQnVmZmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgaXRlcmF0ZSBjaHVua2VkIGlucHV0JywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogMSBGRVRDSCAoVUlEIDEpXFxyXFxuKiAyIEZFVENIIChVSUQgMilcXHJcXG4qIDMgRkVUQ0ggKFVJRCAzKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG5cbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAxKScpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAyIEZFVENIIChVSUQgMiknKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMyBGRVRDSCAoVUlEIDMpJylcbiAgICAgIGV4cGVjdChpdGVyYXRvci5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgY2h1bmtlZCBsaXRlcmFscycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7MX1cXHJcXG4xKVxcclxcbiogMiBGRVRDSCAoVUlEIHs0fVxcclxcbjIzNDUpXFxyXFxuKiAzIEZFVENIIChVSUQgezR9XFxyXFxuMzc4OSlcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgezF9XFxyXFxuMSknKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMiBGRVRDSCAoVUlEIHs0fVxcclxcbjIzNDUpJylcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDMgRkVUQ0ggKFVJRCB7NH1cXHJcXG4zNzg5KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGNodW5rZWQgbGl0ZXJhbHMgMicsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCAxKVxcclxcbiogMiBGRVRDSCAoVUlEIHs0fVxcclxcbjIzNDUpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcblxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIDEpJylcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDIgRkVUQ0ggKFVJRCB7NH1cXHJcXG4yMzQ1KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGNodW5rZWQgbGl0ZXJhbHMgMycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7MX1cXHJcXG4xKVxcclxcbiogMiBGRVRDSCAoVUlEIDQpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcblxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIHsxfVxcclxcbjEpJylcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDIgRkVUQ0ggKFVJRCA0KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGNodW5rZWQgbGl0ZXJhbHMgNCcsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIFNFQVJDSCB7MX1cXHJcXG4xIHsxfVxcclxcbjJcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogU0VBUkNIIHsxfVxcclxcbjEgezF9XFxyXFxuMicpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBDUkxGIGxpdGVyYWwnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMjAgQk9EWVtIRUFERVIuRklFTERTIChSRUZFUkVOQ0VTIExJU1QtSUQpXSB7Mn1cXHJcXG5cXHJcXG4pXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAyMCBCT0RZW0hFQURFUi5GSUVMRFMgKFJFRkVSRU5DRVMgTElTVC1JRCldIHsyfVxcclxcblxcclxcbiknKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgQ1JMRiBsaXRlcmFsIDInLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMSBFTlZFTE9QRSAoXCJzdHJpbmcgd2l0aCB7cGFyZW50aGVzaXN9XCIpIEJPRFlbSEVBREVSLkZJRUxEUyAoUkVGRVJFTkNFUyBMSVNULUlEKV0gezJ9XFxyXFxuXFxyXFxuKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgMSBFTlZFTE9QRSAoXCJzdHJpbmcgd2l0aCB7cGFyZW50aGVzaXN9XCIpIEJPRFlbSEVBREVSLkZJRUxEUyAoUkVGRVJFTkNFUyBMSVNULUlEKV0gezJ9XFxyXFxuXFxyXFxuKScpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcGFyc2UgbXVsdGlwbGUgemVyby1sZW5ndGggbGl0ZXJhbHMnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxMjYwMTUgRkVUQ0ggKFVJRCA1ODU1OTkgQk9EWVsxLjJdIHswfVxcclxcbiBCT0RZWzEuMV0gezB9XFxyXFxuKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxMjYwMTUgRkVUQ0ggKFVJRCA1ODU1OTkgQk9EWVsxLjJdIHswfVxcclxcbiBCT0RZWzEuMV0gezB9XFxyXFxuKScpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyB0d28gY29tbWFuZHMgd2hlbiBDUkxGIGFycml2ZXMgaW4gMiBwYXJ0cycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCAxKVxccicpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuXG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignXFxuKiAyIEZFVENIIChVSUQgMilcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yMiA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yMi5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgMSknKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDIgRkVUQ0ggKFVJRCAyKScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBsaXRlcmFsIHdoZW4gbGl0ZXJhbCBjb3VudCBhcnJpdmVzIGluIDIgcGFydHMnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgeycpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuXG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignMn1cXHJcXG4xMilcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yMiA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yMi5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgezJ9XFxyXFxuMTIpJylcbiAgICAgIGV4cGVjdChpdGVyYXRvcjIubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGxpdGVyYWwgd2hlbiBsaXRlcmFsIGNvdW50IGFycml2ZXMgaW4gMiBwYXJ0cyAyJywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogMSBGRVRDSCAoVUlEIHsxJylcbiAgICAgIHZhciBpdGVyYXRvcjEgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IxLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcwfVxcclxcbjAxMjM0NTY3ODkpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvcjIgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvcjIubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIHsxMH1cXHJcXG4wMTIzNDU2Nzg5KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBsaXRlcmFsIHdoZW4gbGl0ZXJhbCBjb3VudCBhcnJpdmVzIGluIDIgcGFydHMgMycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7JylcbiAgICAgIHZhciBpdGVyYXRvcjEgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IxLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcxMH1cXHJcXG4xMjM0NTY3ODkwKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IyID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCB7MTB9XFxyXFxuMTIzNDU2Nzg5MCknKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMi5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgbGl0ZXJhbCB3aGVuIGxpdGVyYWwgY291bnQgYXJyaXZlcyBpbiAyIHBhcnRzIDQnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMSBCT0RZW0hFQURFUi5GSUVMRFMgKFJFRkVSRU5DRVMgTElTVC1JRCldIHsyfVxccicpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJ1xcblhYKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IyID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAxIEJPRFlbSEVBREVSLkZJRUxEUyAoUkVGRVJFTkNFUyBMSVNULUlEKV0gezJ9XFxyXFxuWFgpJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGxpdGVyYWwgd2hlbiBsaXRlcmFsIGNvdW50IGFycml2ZXMgaW4gMyBwYXJ0cycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7JylcbiAgICAgIHZhciBpdGVyYXRvcjEgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IxLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcxJylcbiAgICAgIHZhciBpdGVyYXRvcjIgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCd9XFxyXFxuMSlcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yMyA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yMy5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgezF9XFxyXFxuMSknKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMy5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgU0VBUkNIIHJlc3BvbnNlIHdoZW4gaXQgYXJyaXZlcyBpbiAyIHBhcnRzJywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogU0VBUkNIIDEgMicpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuXG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignIDMgNFxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IyID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIFNFQVJDSCAxIDIgMyA0JylcbiAgICAgIGV4cGVjdChpdGVyYXRvcjIubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBub3QgcHJvY2VzcyB7fSBpbiBzdHJpbmcgYXMgbGl0ZXJhbCAxJywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogMSBGRVRDSCAoVUlEIDEgRU5WRUxPUEUgKFwic3RyaW5nIHdpdGgge3BhcmVudGhlc2lzfVwiKSlcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIDEgRU5WRUxPUEUgKFwic3RyaW5nIHdpdGgge3BhcmVudGhlc2lzfVwiKSknKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIG5vdCBwcm9jZXNzIHt9IGluIHN0cmluZyBhcyBsaXRlcmFsIDInLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMSBFTlZFTE9QRSAoXCJzdHJpbmcgd2l0aCBudW1iZXIgaW4gcGFyZW50aGVzaXMgezEyM31cIikpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAxIEVOVkVMT1BFIChcInN0cmluZyB3aXRoIG51bWJlciBpbiBwYXJlbnRoZXNpcyB7MTIzfVwiKSknKVxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiBhcHBlbmRJbmNvbWluZ0J1ZmZlciAoY29udGVudCkge1xuICAgICAgY2xpZW50Ll9pbmNvbWluZ0J1ZmZlcnMucHVzaCh0b1R5cGVkQXJyYXkoY29udGVudCkpXG4gICAgfVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3BhcnNlSW5jb21pbmdDb21tYW5kcycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgYSB0YWdnZWQgaXRlbSBmcm9tIHRoZSBxdWV1ZScsICgpID0+IHtcbiAgICAgIGNsaWVudC5vbnJlYWR5ID0gc2lub24uc3R1YigpXG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19oYW5kbGVSZXNwb25zZScpXG5cbiAgICAgIGZ1bmN0aW9uICogZ2VuICgpIHsgeWllbGQgdG9UeXBlZEFycmF5KCdPSyBIZWxsbyB3b3JsZCEnKSB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50Lm9ucmVhZHkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgZXhwZWN0KGNsaWVudC5faGFuZGxlUmVzcG9uc2Uud2l0aEFyZ3Moe1xuICAgICAgICB0YWc6ICdPSycsXG4gICAgICAgIGNvbW1hbmQ6ICdIZWxsbycsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnd29ybGQhJ1xuICAgICAgICB9XVxuICAgICAgfSkuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgYW4gdW50YWdnZWQgaXRlbSBmcm9tIHRoZSBxdWV1ZScsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX2hhbmRsZVJlc3BvbnNlJylcblxuICAgICAgZnVuY3Rpb24gKiBnZW4gKCkgeyB5aWVsZCB0b1R5cGVkQXJyYXkoJyogMSBFWElTVFMnKSB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9oYW5kbGVSZXNwb25zZS53aXRoQXJncyh7XG4gICAgICAgIHRhZzogJyonLFxuICAgICAgICBjb21tYW5kOiAnRVhJU1RTJyxcbiAgICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICAgIG5yOiAxXG4gICAgICB9KS5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBhIHBsdXMgdGFnZ2VkIGl0ZW0gZnJvbSB0aGUgcXVldWUnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ3NlbmQnKVxuXG4gICAgICBmdW5jdGlvbiAqIGdlbiAoKSB7IHlpZWxkIHRvVHlwZWRBcnJheSgnKyBQbGVhc2UgY29udGludWUnKSB9XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0ge1xuICAgICAgICBkYXRhOiBbJ2xpdGVyYWwgZGF0YSddXG4gICAgICB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50LnNlbmQud2l0aEFyZ3MoJ2xpdGVyYWwgZGF0YVxcclxcbicpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGFuIFhPQVVUSDIgZXJyb3IgY2hhbGxlbmdlJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdzZW5kJylcblxuICAgICAgZnVuY3Rpb24gKiBnZW4gKCkgeyB5aWVsZCB0b1R5cGVkQXJyYXkoJysgRk9PQkFSJykgfVxuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IHtcbiAgICAgICAgZGF0YTogW10sXG4gICAgICAgIGVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lOiB0cnVlXG4gICAgICB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50LnNlbmQud2l0aEFyZ3MoJ1xcclxcbicpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX2hhbmRsZVJlc3BvbnNlJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgaW52b2tlIGdsb2JhbCBoYW5kbGVyIGJ5IGRlZmF1bHQnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19wcm9jZXNzUmVzcG9uc2UnKVxuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfc2VuZFJlcXVlc3QnKVxuXG4gICAgICBjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLlRFU1QgPSAoKSA9PiB7IH1cbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZCwgJ1RFU1QnKVxuXG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gZmFsc2VcbiAgICAgIGNsaWVudC5faGFuZGxlUmVzcG9uc2Uoe1xuICAgICAgICB0YWc6ICcqJyxcbiAgICAgICAgY29tbWFuZDogJ3Rlc3QnXG4gICAgICB9KVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9zZW5kUmVxdWVzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICBleHBlY3QoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZC5URVNULndpdGhBcmdzKHtcbiAgICAgICAgdGFnOiAnKicsXG4gICAgICAgIGNvbW1hbmQ6ICd0ZXN0J1xuICAgICAgfSkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGludm9rZSBnbG9iYWwgaGFuZGxlciBpZiBuZWVkZWQnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19wcm9jZXNzUmVzcG9uc2UnKVxuICAgICAgY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZC5URVNUID0gKCkgPT4geyB9XG4gICAgICBzaW5vbi5zdHViKGNsaWVudC5fZ2xvYmFsQWNjZXB0VW50YWdnZWQsICdURVNUJylcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3NlbmRSZXF1ZXN0JylcblxuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IHtcbiAgICAgICAgcGF5bG9hZDoge31cbiAgICAgIH1cbiAgICAgIGNsaWVudC5faGFuZGxlUmVzcG9uc2Uoe1xuICAgICAgICB0YWc6ICcqJyxcbiAgICAgICAgY29tbWFuZDogJ3Rlc3QnXG4gICAgICB9KVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9zZW5kUmVxdWVzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgICBleHBlY3QoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZC5URVNULndpdGhBcmdzKHtcbiAgICAgICAgdGFnOiAnKicsXG4gICAgICAgIGNvbW1hbmQ6ICd0ZXN0J1xuICAgICAgfSkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHB1c2ggdG8gcGF5bG9hZCcsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3Byb2Nlc3NSZXNwb25zZScpXG4gICAgICBjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLlRFU1QgPSAoKSA9PiB7IH1cbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZCwgJ1RFU1QnKVxuXG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0ge1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgVEVTVDogW11cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2xpZW50Ll9oYW5kbGVSZXNwb25zZSh7XG4gICAgICAgIHRhZzogJyonLFxuICAgICAgICBjb21tYW5kOiAndGVzdCdcbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLlRFU1QuY2FsbENvdW50KS50by5lcXVhbCgwKVxuICAgICAgZXhwZWN0KGNsaWVudC5fY3VycmVudENvbW1hbmQucGF5bG9hZC5URVNUKS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgIHRhZzogJyonLFxuICAgICAgICBjb21tYW5kOiAndGVzdCdcbiAgICAgIH1dKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGludm9rZSBjb21tYW5kIGNhbGxiYWNrJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfcHJvY2Vzc1Jlc3BvbnNlJylcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3NlbmRSZXF1ZXN0JylcbiAgICAgIGNsaWVudC5fZ2xvYmFsQWNjZXB0VW50YWdnZWQuVEVTVCA9ICgpID0+IHsgfVxuICAgICAgc2lub24uc3R1YihjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLCAnVEVTVCcpXG5cbiAgICAgIGNsaWVudC5fY3VycmVudENvbW1hbmQgPSB7XG4gICAgICAgIHRhZzogJ0EnLFxuICAgICAgICBjYWxsYmFjazogKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3BvbnNlKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgICAgIHRhZzogJ0EnLFxuICAgICAgICAgICAgY29tbWFuZDogJ3Rlc3QnLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICBURVNUOiAnYWJjJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBURVNUOiAnYWJjJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjbGllbnQuX2hhbmRsZVJlc3BvbnNlKHtcbiAgICAgICAgdGFnOiAnQScsXG4gICAgICAgIGNvbW1hbmQ6ICd0ZXN0J1xuICAgICAgfSlcblxuICAgICAgZXhwZWN0KGNsaWVudC5fc2VuZFJlcXVlc3QuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgZXhwZWN0KGNsaWVudC5fZ2xvYmFsQWNjZXB0VW50YWdnZWQuVEVTVC5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2VucXVldWVDb21tYW5kJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmVqZWN0IG9uIE5PL0JBRCcsIChkb25lKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19zZW5kUmVxdWVzdCcpLmNhbGxzRmFrZSgoKSA9PiB7XG4gICAgICAgIGNsaWVudC5fY2xpZW50UXVldWVbMF0uY2FsbGJhY2soeyBjb21tYW5kOiAnTk8nIH0pXG4gICAgICB9KVxuXG4gICAgICBjbGllbnQuX3RhZ0NvdW50ZXIgPSAxMDBcbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbXVxuICAgICAgY2xpZW50Ll9jYW5TZW5kID0gdHJ1ZVxuXG4gICAgICBjbGllbnQuZW5xdWV1ZUNvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnYWJjJ1xuICAgICAgfSwgWydkZWYnXSwge1xuICAgICAgICB0OiAxXG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG4gICAgICAgIGRvbmUoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBpbnZva2Ugc2VuZGluZycsIChkb25lKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19zZW5kUmVxdWVzdCcpLmNhbGxzRmFrZSgoKSA9PiB7XG4gICAgICAgIGNsaWVudC5fY2xpZW50UXVldWVbMF0uY2FsbGJhY2soe30pXG4gICAgICB9KVxuXG4gICAgICBjbGllbnQuX3RhZ0NvdW50ZXIgPSAxMDBcbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbXVxuICAgICAgY2xpZW50Ll9jYW5TZW5kID0gdHJ1ZVxuXG4gICAgICBjbGllbnQuZW5xdWV1ZUNvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnYWJjJ1xuICAgICAgfSwgWydkZWYnXSwge1xuICAgICAgICB0OiAxXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNsaWVudC5fc2VuZFJlcXVlc3QuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoY2xpZW50Ll9jbGllbnRRdWV1ZS5sZW5ndGgpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlWzBdLnRhZykudG8uZXF1YWwoJ1cxMDEnKVxuICAgICAgICBleHBlY3QoY2xpZW50Ll9jbGllbnRRdWV1ZVswXS5yZXF1ZXN0KS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgICBjb21tYW5kOiAnYWJjJyxcbiAgICAgICAgICB0YWc6ICdXMTAxJ1xuICAgICAgICB9KVxuICAgICAgICBleHBlY3QoY2xpZW50Ll9jbGllbnRRdWV1ZVswXS50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIG9ubHkgcXVldWUnLCAoZG9uZSkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfc2VuZFJlcXVlc3QnKVxuXG4gICAgICBjbGllbnQuX3RhZ0NvdW50ZXIgPSAxMDBcbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbXVxuICAgICAgY2xpZW50Ll9jYW5TZW5kID0gZmFsc2VcblxuICAgICAgY2xpZW50LmVucXVldWVDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2FiYydcbiAgICAgIH0sIFsnZGVmJ10sIHtcbiAgICAgICAgdDogMVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChjbGllbnQuX3NlbmRSZXF1ZXN0LmNhbGxDb3VudCkudG8uZXF1YWwoMClcbiAgICAgICAgZXhwZWN0KGNsaWVudC5fY2xpZW50UXVldWUubGVuZ3RoKS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoY2xpZW50Ll9jbGllbnRRdWV1ZVswXS50YWcpLnRvLmVxdWFsKCdXMTAxJylcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNsaWVudC5fY2xpZW50UXVldWVbMF0uY2FsbGJhY2soe30pXG4gICAgICB9LCAwKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHN0b3JlIHZhbHVlQXNTdHJpbmcgb3B0aW9uIGluIHRoZSBjb21tYW5kJywgKGRvbmUpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3NlbmRSZXF1ZXN0JylcblxuICAgICAgY2xpZW50Ll90YWdDb3VudGVyID0gMTAwXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW11cbiAgICAgIGNsaWVudC5fY2FuU2VuZCA9IGZhbHNlXG5cbiAgICAgIGNsaWVudC5lbnF1ZXVlQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdhYmMnLFxuICAgICAgICB2YWx1ZUFzU3RyaW5nOiBmYWxzZVxuICAgICAgfSwgWydkZWYnXSwge1xuICAgICAgICB0OiAxXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNsaWVudC5fY2xpZW50UXVldWVbMF0ucmVxdWVzdC52YWx1ZUFzU3RyaW5nKS50by5lcXVhbChmYWxzZSlcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNsaWVudC5fY2xpZW50UXVldWVbMF0uY2FsbGJhY2soe30pXG4gICAgICB9LCAwKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfc2VuZFJlcXVlc3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBlbnRlciBpZGxlIGlmIG5vdGhpbmcgaXMgdG8gcHJvY2VzcycsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX2VudGVySWRsZScpXG5cbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbXVxuICAgICAgY2xpZW50Ll9zZW5kUmVxdWVzdCgpXG5cbiAgICAgIGV4cGVjdChjbGllbnQuX2VudGVySWRsZS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgc2VuZCBkYXRhJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfY2xlYXJJZGxlJylcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnc2VuZCcpXG5cbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbe1xuICAgICAgICByZXF1ZXN0OiB7XG4gICAgICAgICAgdGFnOiAnVzEwMScsXG4gICAgICAgICAgY29tbWFuZDogJ1RFU1QnXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgICBjbGllbnQuX3NlbmRSZXF1ZXN0KClcblxuICAgICAgZXhwZWN0KGNsaWVudC5fY2xlYXJJZGxlLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIGV4cGVjdChjbGllbnQuc2VuZC5hcmdzWzBdWzBdKS50by5lcXVhbCgnVzEwMSBURVNUXFxyXFxuJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBzZW5kIHBhcnRpYWwgZGF0YScsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX2NsZWFySWRsZScpXG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ3NlbmQnKVxuXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW3tcbiAgICAgICAgcmVxdWVzdDoge1xuICAgICAgICAgIHRhZzogJ1cxMDEnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdURVNUJyxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgdHlwZTogJ0xJVEVSQUwnLFxuICAgICAgICAgICAgdmFsdWU6ICdhYmMnXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfV1cbiAgICAgIGNsaWVudC5fc2VuZFJlcXVlc3QoKVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9jbGVhcklkbGUuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgZXhwZWN0KGNsaWVudC5zZW5kLmFyZ3NbMF1bMF0pLnRvLmVxdWFsKCdXMTAxIFRFU1QgezN9XFxyXFxuJylcbiAgICAgIGV4cGVjdChjbGllbnQuX2N1cnJlbnRDb21tYW5kLmRhdGEpLnRvLmRlZXAuZXF1YWwoWydhYmMnXSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBydW4gcHJlY2hlY2snLCAoZG9uZSkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfY2xlYXJJZGxlJylcblxuICAgICAgY2xpZW50Ll9jYW5TZW5kID0gdHJ1ZVxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFt7XG4gICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICB0YWc6ICdXMTAxJyxcbiAgICAgICAgICBjb21tYW5kOiAnVEVTVCcsXG4gICAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAgIHR5cGU6ICdMSVRFUkFMJyxcbiAgICAgICAgICAgIHZhbHVlOiAnYWJjJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH0sXG4gICAgICAgIHByZWNoZWNrOiAoY3R4KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGN0eCkudG8uZXhpc3RcbiAgICAgICAgICBleHBlY3QoY2xpZW50Ll9jYW5TZW5kKS50by5iZS50cnVlXG4gICAgICAgICAgY2xpZW50Ll9zZW5kUmVxdWVzdCA9ICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlLmxlbmd0aCkudG8uZXF1YWwoMilcbiAgICAgICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlWzBdLnRhZykudG8uaW5jbHVkZSgnLnAnKVxuICAgICAgICAgICAgZXhwZWN0KGNsaWVudC5fY2xpZW50UXVldWVbMF0ucmVxdWVzdC50YWcpLnRvLmluY2x1ZGUoJy5wJylcbiAgICAgICAgICAgIGNsaWVudC5fY2xlYXJJZGxlLnJlc3RvcmUoKVxuICAgICAgICAgICAgZG9uZSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNsaWVudC5lbnF1ZXVlQ29tbWFuZCh7fSwgdW5kZWZpbmVkLCB7XG4gICAgICAgICAgICBjdHg6IGN0eFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgICBjbGllbnQuX3NlbmRSZXF1ZXN0KClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX2VudGVySWRsZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHNldCBpZGxlIHRpbWVyJywgKGRvbmUpID0+IHtcbiAgICAgIGNsaWVudC5vbmlkbGUgPSAoKSA9PiB7XG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgICAgY2xpZW50LlRJTUVPVVRfRU5URVJfSURMRSA9IDFcblxuICAgICAgY2xpZW50Ll9lbnRlcklkbGUoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfcHJvY2Vzc1Jlc3BvbnNlJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgc2V0IGh1bWFuUmVhZGFibGUnLCAoKSA9PiB7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIHRhZzogJyonLFxuICAgICAgICBjb21tYW5kOiAnT0snLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdURVhUJyxcbiAgICAgICAgICB2YWx1ZTogJ1NvbWUgcmFuZG9tIHRleHQnXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgICBjbGllbnQuX3Byb2Nlc3NSZXNwb25zZShyZXNwb25zZSlcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlLmh1bWFuUmVhZGFibGUpLnRvLmVxdWFsKCdTb21lIHJhbmRvbSB0ZXh0JylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBzZXQgcmVzcG9uc2UgY29kZScsICgpID0+IHtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgdGFnOiAnKicsXG4gICAgICAgIGNvbW1hbmQ6ICdPSycsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHNlY3Rpb246IFt7XG4gICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICB2YWx1ZTogJ0NBUEFCSUxJVFknXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgdmFsdWU6ICdJTUFQNFJFVjEnXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgdmFsdWU6ICdVSURQTFVTJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnVEVYVCcsXG4gICAgICAgICAgdmFsdWU6ICdTb21lIHJhbmRvbSB0ZXh0J1xuICAgICAgICB9XVxuICAgICAgfVxuICAgICAgY2xpZW50Ll9wcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICBleHBlY3QocmVzcG9uc2UuY29kZSkudG8uZXF1YWwoJ0NBUEFCSUxJVFknKVxuICAgICAgZXhwZWN0KHJlc3BvbnNlLmNhcGFiaWxpdHkpLnRvLmRlZXAuZXF1YWwoWydJTUFQNFJFVjEnLCAnVUlEUExVUyddKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNpc0Vycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZGV0ZWN0IGlmIGFuIG9iamVjdCBpcyBhbiBlcnJvcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChjbGllbnQuaXNFcnJvcihuZXcgUmFuZ2VFcnJvcignYWJjJykpKS50by5iZS50cnVlXG4gICAgICBleHBlY3QoY2xpZW50LmlzRXJyb3IoJ2FiYycpKS50by5iZS5mYWxzZVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNlbmFibGVDb21wcmVzc2lvbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBpbmZsYXRlciBhbmQgZGVmbGF0ZXIgc3RyZWFtcycsICgpID0+IHtcbiAgICAgIGNsaWVudC5zb2NrZXQub25kYXRhID0gKCkgPT4geyB9XG4gICAgICBzaW5vbi5zdHViKGNsaWVudC5zb2NrZXQsICdvbmRhdGEnKVxuXG4gICAgICBleHBlY3QoY2xpZW50LmNvbXByZXNzZWQpLnRvLmJlLmZhbHNlXG4gICAgICBjbGllbnQuZW5hYmxlQ29tcHJlc3Npb24oKVxuICAgICAgZXhwZWN0KGNsaWVudC5jb21wcmVzc2VkKS50by5iZS50cnVlXG5cbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50Ll9jb21wcmVzc2lvbiwgJ2luZmxhdGUnKS5jYWxsc0Zha2UoKCkgPT4ge1xuICAgICAgICBjbGllbnQuX2NvbXByZXNzaW9uLmluZmxhdGVkUmVhZHkobmV3IFVpbnQ4QXJyYXkoWzEsIDIsIDNdKS5idWZmZXIpXG4gICAgICB9KVxuICAgICAgc2lub24uc3R1YihjbGllbnQuX2NvbXByZXNzaW9uLCAnZGVmbGF0ZScpLmNhbGxzRmFrZSgoKSA9PiB7XG4gICAgICAgIGNsaWVudC5fY29tcHJlc3Npb24uZGVmbGF0ZWRSZWFkeShuZXcgVWludDhBcnJheShbNCwgNSwgNl0pLmJ1ZmZlcilcbiAgICAgIH0pXG5cbiAgICAgIGNsaWVudC5zZW5kKCdhJylcbiAgICAgIGNsaWVudC5zb2NrZXQub25kYXRhKG5ldyBVaW50OEFycmF5KFsxXSkuYnVmZmVyKVxuXG4gICAgICBleHBlY3Qoc29ja2V0U3R1Yi5zZW5kLmFyZ3NbMF1bMF0pLnRvLmRlZXAuZXF1YWwobmV3IFVpbnQ4QXJyYXkoWzQsIDUsIDZdKS5idWZmZXIpXG4gICAgICBleHBlY3QoY2xpZW50Ll9zb2NrZXRPbkRhdGEuYXJnc1swXVswXSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGRhdGE6IG5ldyBVaW50OEFycmF5KFsxLCAyLCAzXSkuYnVmZmVyXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNnZXRQcmV2aW91c2x5UXVldWVkJywgKCkgPT4ge1xuICAgIGNvbnN0IGN0eCA9IHt9XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiB1bmRlZmluZWQgd2l0aCBlbXB0eSBxdWV1ZSBhbmQgbm8gY3VycmVudCBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IHVuZGVmaW5lZFxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFtdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiB1bmRlZmluZWQgd2l0aCBlbXB0eSBxdWV1ZSBhbmQgbm9uLVNFTEVDVCBjdXJyZW50IGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gY3JlYXRlQ29tbWFuZCgnVEVTVCcpXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW11cblxuICAgICAgZXhwZWN0KHRlc3RBbmRHZXRBdHRyaWJ1dGUoKSkudG8uYmUudW5kZWZpbmVkXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGN1cnJlbnQgY29tbWFuZCB3aXRoIGVtcHR5IHF1ZXVlIGFuZCBTRUxFQ1QgY3VycmVudCBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IGNyZWF0ZUNvbW1hbmQoJ1NFTEVDVCcsICdBVFRSJylcbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbXVxuXG4gICAgICBleHBlY3QodGVzdEFuZEdldEF0dHJpYnV0ZSgpKS50by5lcXVhbCgnQVRUUicpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGN1cnJlbnQgY29tbWFuZCB3aXRoIG5vbi1TRUxFQ1QgY29tbWFuZHMgaW4gcXVldWUgYW5kIFNFTEVDVCBjdXJyZW50IGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFInKVxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFtcbiAgICAgICAgY3JlYXRlQ29tbWFuZCgnVEVTVDAxJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1RFU1QwMicpXG4gICAgICBdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmVxdWFsKCdBVFRSJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gbGFzdCBTRUxFQ1QgYmVmb3JlIGN0eCB3aXRoIG11bHRpcGxlIFNFTEVDVCBjb21tYW5kcyBpbiBxdWV1ZSAoMSknLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFIwMScpXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW1xuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUicpLFxuICAgICAgICBjcmVhdGVDb21tYW5kKCdURVNUJyksXG4gICAgICAgIGN0eCxcbiAgICAgICAgY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFIwMycpXG4gICAgICBdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmVxdWFsKCdBVFRSJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gbGFzdCBTRUxFQ1QgYmVmb3JlIGN0eCB3aXRoIG11bHRpcGxlIFNFTEVDVCBjb21tYW5kcyBpbiBxdWV1ZSAoMiknLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW1xuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUjAyJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1NFTEVDVCcsICdBVFRSJyksXG4gICAgICAgIGN0eCxcbiAgICAgICAgY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFIwMycpXG4gICAgICBdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmVxdWFsKCdBVFRSJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gbGFzdCBTRUxFQ1QgYmVmb3JlIGN0eCB3aXRoIG11bHRpcGxlIFNFTEVDVCBjb21tYW5kcyBpbiBxdWV1ZSAoMyknLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW1xuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUjAyJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1NFTEVDVCcsICdBVFRSJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1RFU1QnKSxcbiAgICAgICAgY3R4LFxuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUjAzJylcbiAgICAgIF1cblxuICAgICAgZXhwZWN0KHRlc3RBbmRHZXRBdHRyaWJ1dGUoKSkudG8uZXF1YWwoJ0FUVFInKVxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiB0ZXN0QW5kR2V0QXR0cmlidXRlICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBjbGllbnQuZ2V0UHJldmlvdXNseVF1ZXVlZChbJ1NFTEVDVCddLCBjdHgpXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YS5yZXF1ZXN0LmF0dHJpYnV0ZXNbMF0udmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDb21tYW5kIChjb21tYW5kLCBhdHRyaWJ1dGUpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBbXVxuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgcmVxdWVzdDogeyBjb21tYW5kLCBhdHRyaWJ1dGVzIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgICBkYXRhLnJlcXVlc3QuYXR0cmlidXRlcy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICB2YWx1ZTogYXR0cmlidXRlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfVxuICB9KVxufSlcbiJdfQ==