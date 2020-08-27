"use strict";

var _imap = _interopRequireDefault(require("./imap"));

var _common = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-unused-expressions */
const host = 'localhost';
const port = 10000;
describe('browserbox imap unit tests', () => {
  var client, socketStub;
  /* jshint indent:false */

  beforeEach(() => {
    client = new _imap.default(host, port);
    expect(client).to.exist;
    client.logger = {
      debug: () => {},
      error: () => {}
    };

    var Socket = function () {};

    Socket.open = () => {};

    Socket.prototype.close = () => {};

    Socket.prototype.send = () => {};

    Socket.prototype.suspend = () => {};

    Socket.prototype.resume = () => {};

    Socket.prototype.upgradeToSecure = () => {};

    socketStub = sinon.createStubInstance(Socket);
    sinon.stub(Socket, 'open').withArgs(host, port).returns(socketStub);
    var promise = client.connect(Socket).then(() => {
      expect(Socket.open.callCount).to.equal(1);
      expect(socketStub.onerror).to.exist;
      expect(socketStub.onopen).to.exist;
      expect(socketStub.onclose).to.exist;
      expect(socketStub.ondata).to.exist;
    });
    setTimeout(() => socketStub.onopen(), 10);
    return promise;
  });
  describe.skip('#close', () => {
    it('should call socket.close', () => {
      client.socket.readyState = 'open';
      setTimeout(() => socketStub.onclose(), 10);
      return client.close().then(() => {
        expect(socketStub.close.callCount).to.equal(1);
      });
    });
    it('should not call socket.close', () => {
      client.socket.readyState = 'not open. duh.';
      setTimeout(() => socketStub.onclose(), 10);
      return client.close().then(() => {
        expect(socketStub.close.called).to.be.false;
      });
    });
  });
  describe('#upgrade', () => {
    it('should upgrade socket', () => {
      client.secureMode = false;
      client.upgrade();
    });
    it('should not upgrade socket', () => {
      client.secureMode = true;
      client.upgrade();
    });
  });
  describe('#setHandler', () => {
    it('should set global handler for keyword', () => {
      var handler = () => {};

      client.setHandler('fetch', handler);
      expect(client._globalAcceptUntagged.FETCH).to.equal(handler);
    });
  });
  describe('#socket.onerror', () => {
    it('should emit error and close connection', done => {
      client.socket.onerror({
        data: new Error('err')
      });

      client.onerror = () => {
        done();
      };
    });
  });
  describe('#socket.onclose', () => {
    it('should emit error ', done => {
      client.socket.onclose();

      client.onerror = () => {
        done();
      };
    });
  });
  describe('#_onData', () => {
    it('should process input', () => {
      sinon.stub(client, '_parseIncomingCommands');
      sinon.stub(client, '_iterateIncomingBuffer');

      client._onData({
        data: (0, _common.toTypedArray)('foobar').buffer
      });

      expect(client._parseIncomingCommands.calledOnce).to.be.true;
      expect(client._iterateIncomingBuffer.calledOnce).to.be.true;
    });
  });
  describe('rateIncomingBuffer', () => {
    it('should iterate chunked input', () => {
      appendIncomingBuffer('* 1 FETCH (UID 1)\r\n* 2 FETCH (UID 2)\r\n* 3 FETCH (UID 3)\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID 2)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 3 FETCH (UID 3)');
      expect(iterator.next().value).to.be.undefined;
    });
    it('should process chunked literals', () => {
      appendIncomingBuffer('* 1 FETCH (UID {1}\r\n1)\r\n* 2 FETCH (UID {4}\r\n2345)\r\n* 3 FETCH (UID {4}\r\n3789)\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID {1}\r\n1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID {4}\r\n2345)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 3 FETCH (UID {4}\r\n3789)');
      expect(iterator.next().value).to.be.undefined;
    });
    it('should process chunked literals 2', () => {
      appendIncomingBuffer('* 1 FETCH (UID 1)\r\n* 2 FETCH (UID {4}\r\n2345)\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID {4}\r\n2345)');
      expect(iterator.next().value).to.be.undefined;
    });
    it('should process chunked literals 3', () => {
      appendIncomingBuffer('* 1 FETCH (UID {1}\r\n1)\r\n* 2 FETCH (UID 4)\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID {1}\r\n1)');
      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 2 FETCH (UID 4)');
      expect(iterator.next().value).to.be.undefined;
    });
    it('should process chunked literals 4', () => {
      appendIncomingBuffer('* SEARCH {1}\r\n1 {1}\r\n2\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* SEARCH {1}\r\n1 {1}\r\n2');
    });
    it('should process CRLF literal', () => {
      appendIncomingBuffer('* 1 FETCH (UID 20 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 20 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)');
    });
    it('should process CRLF literal 2', () => {
      appendIncomingBuffer('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}") BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}") BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\n\r\n)');
    });
    it('should parse multiple zero-length literals', () => {
      appendIncomingBuffer('* 126015 FETCH (UID 585599 BODY[1.2] {0}\r\n BODY[1.1] {0}\r\n)\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 126015 FETCH (UID 585599 BODY[1.2] {0}\r\n BODY[1.1] {0}\r\n)');
    });
    it('should process two commands when CRLF arrives in 2 parts', () => {
      appendIncomingBuffer('* 1 FETCH (UID 1)\r');

      var iterator1 = client._iterateIncomingBuffer();

      expect(iterator1.next().value).to.be.undefined;
      appendIncomingBuffer('\n* 2 FETCH (UID 2)\r\n');

      var iterator2 = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID 1)');
      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 2 FETCH (UID 2)');
      expect(iterator2.next().value).to.be.undefined;
    });
    it('should process literal when literal count arrives in 2 parts', () => {
      appendIncomingBuffer('* 1 FETCH (UID {');

      var iterator1 = client._iterateIncomingBuffer();

      expect(iterator1.next().value).to.be.undefined;
      appendIncomingBuffer('2}\r\n12)\r\n');

      var iterator2 = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID {2}\r\n12)');
      expect(iterator2.next().value).to.be.undefined;
    });
    it('should process literal when literal count arrives in 2 parts 2', () => {
      appendIncomingBuffer('* 1 FETCH (UID {1');

      var iterator1 = client._iterateIncomingBuffer();

      expect(iterator1.next().value).to.be.undefined;
      appendIncomingBuffer('0}\r\n0123456789)\r\n');

      var iterator2 = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID {10}\r\n0123456789)');
      expect(iterator2.next().value).to.be.undefined;
    });
    it('should process literal when literal count arrives in 2 parts 3', () => {
      appendIncomingBuffer('* 1 FETCH (UID {');

      var iterator1 = client._iterateIncomingBuffer();

      expect(iterator1.next().value).to.be.undefined;
      appendIncomingBuffer('10}\r\n1234567890)\r\n');

      var iterator2 = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID {10}\r\n1234567890)');
      expect(iterator2.next().value).to.be.undefined;
    });
    it('should process literal when literal count arrives in 2 parts 4', () => {
      appendIncomingBuffer('* 1 FETCH (UID 1 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r');

      var iterator1 = client._iterateIncomingBuffer();

      expect(iterator1.next().value).to.be.undefined;
      appendIncomingBuffer('\nXX)\r\n');

      var iterator2 = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* 1 FETCH (UID 1 BODY[HEADER.FIELDS (REFERENCES LIST-ID)] {2}\r\nXX)');
    });
    it('should process literal when literal count arrives in 3 parts', () => {
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
    it('should process SEARCH response when it arrives in 2 parts', () => {
      appendIncomingBuffer('* SEARCH 1 2');

      var iterator1 = client._iterateIncomingBuffer();

      expect(iterator1.next().value).to.be.undefined;
      appendIncomingBuffer(' 3 4\r\n');

      var iterator2 = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator2.next().value)).to.equal('* SEARCH 1 2 3 4');
      expect(iterator2.next().value).to.be.undefined;
    });
    it('should not process {} in string as literal 1', () => {
      appendIncomingBuffer('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}"))\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1 ENVELOPE ("string with {parenthesis}"))');
    });
    it('should not process {} in string as literal 2', () => {
      appendIncomingBuffer('* 1 FETCH (UID 1 ENVELOPE ("string with number in parenthesis {123}"))\r\n');

      var iterator = client._iterateIncomingBuffer();

      expect(String.fromCharCode.apply(null, iterator.next().value)).to.equal('* 1 FETCH (UID 1 ENVELOPE ("string with number in parenthesis {123}"))');
    });

    function appendIncomingBuffer(content) {
      client._incomingBuffers.push((0, _common.toTypedArray)(content));
    }
  });
  describe('#_parseIncomingCommands', () => {
    it('should process a tagged item from the queue', () => {
      client.onready = sinon.stub();
      sinon.stub(client, '_handleResponse');

      function* gen() {
        yield (0, _common.toTypedArray)('OK Hello world!');
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
    it('should process an untagged item from the queue', () => {
      sinon.stub(client, '_handleResponse');

      function* gen() {
        yield (0, _common.toTypedArray)('* 1 EXISTS');
      }

      client._parseIncomingCommands(gen());

      expect(client._handleResponse.withArgs({
        tag: '*',
        command: 'EXISTS',
        attributes: [],
        nr: 1
      }).calledOnce).to.be.true;
    });
    it('should process a plus tagged item from the queue', () => {
      sinon.stub(client, 'send');

      function* gen() {
        yield (0, _common.toTypedArray)('+ Please continue');
      }

      client._currentCommand = {
        data: ['literal data']
      };

      client._parseIncomingCommands(gen());

      expect(client.send.withArgs('literal data\r\n').callCount).to.equal(1);
    });
    it('should process an XOAUTH2 error challenge', () => {
      sinon.stub(client, 'send');

      function* gen() {
        yield (0, _common.toTypedArray)('+ FOOBAR');
      }

      client._currentCommand = {
        data: [],
        errorResponseExpectsEmptyLine: true
      };

      client._parseIncomingCommands(gen());

      expect(client.send.withArgs('\r\n').callCount).to.equal(1);
    });
  });
  describe('#_handleResponse', () => {
    it('should invoke global handler by default', () => {
      sinon.stub(client, '_processResponse');
      sinon.stub(client, '_sendRequest');

      client._globalAcceptUntagged.TEST = () => {};

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
    it('should invoke global handler if needed', () => {
      sinon.stub(client, '_processResponse');

      client._globalAcceptUntagged.TEST = () => {};

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
    it('should push to payload', () => {
      sinon.stub(client, '_processResponse');

      client._globalAcceptUntagged.TEST = () => {};

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
    it('should invoke command callback', () => {
      sinon.stub(client, '_processResponse');
      sinon.stub(client, '_sendRequest');

      client._globalAcceptUntagged.TEST = () => {};

      sinon.stub(client._globalAcceptUntagged, 'TEST');
      client._currentCommand = {
        tag: 'A',
        callback: response => {
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
  describe('#enqueueCommand', () => {
    it('should reject on NO/BAD', () => {
      sinon.stub(client, '_sendRequest').callsFake(() => {
        client._clientQueue[0].callback({
          command: 'NO'
        });
      });
      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = true;
      return client.enqueueCommand({
        command: 'abc'
      }, ['def'], {
        t: 1
      }).catch(err => {
        expect(err).to.exist;
      });
    });
    it('should invoke sending', () => {
      sinon.stub(client, '_sendRequest').callsFake(() => {
        client._clientQueue[0].callback({});
      });
      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = true;
      return client.enqueueCommand({
        command: 'abc'
      }, ['def'], {
        t: 1
      }).then(() => {
        expect(client._sendRequest.callCount).to.equal(1);
        expect(client._clientQueue.length).to.equal(1);
        expect(client._clientQueue[0].tag).to.equal('W101');
        expect(client._clientQueue[0].request).to.deep.equal({
          command: 'abc',
          tag: 'W101'
        });
        expect(client._clientQueue[0].t).to.equal(1);
      });
    });
    it('should only queue', () => {
      sinon.stub(client, '_sendRequest');
      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = false;
      setTimeout(() => {
        client._clientQueue[0].callback({});
      }, 0);
      return client.enqueueCommand({
        command: 'abc'
      }, ['def'], {
        t: 1
      }).then(() => {
        expect(client._sendRequest.callCount).to.equal(0);
        expect(client._clientQueue.length).to.equal(1);
        expect(client._clientQueue[0].tag).to.equal('W101');
      });
    });
    it('should store valueAsString option in the command', () => {
      sinon.stub(client, '_sendRequest');
      client._tagCounter = 100;
      client._clientQueue = [];
      client._canSend = false;
      setTimeout(() => {
        client._clientQueue[0].callback({});
      }, 0);
      return client.enqueueCommand({
        command: 'abc',
        valueAsString: false
      }, ['def'], {
        t: 1
      }).then(() => {
        expect(client._clientQueue[0].request.valueAsString).to.equal(false);
      });
    });
  });
  describe('#_sendRequest', () => {
    it('should enter idle if nothing is to process', () => {
      sinon.stub(client, '_enterIdle');
      client._clientQueue = [];

      client._sendRequest();

      expect(client._enterIdle.callCount).to.equal(1);
    });
    it('should send data', () => {
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
    it('should send partial data', () => {
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
    it('should run precheck', done => {
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
        precheck: ctx => {
          expect(ctx).to.exist;
          expect(client._canSend).to.be.true;

          client._sendRequest = () => {
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
  describe('#_enterIdle', () => {
    it('should set idle timer', done => {
      client.onidle = () => {
        done();
      };

      client.timeoutEnterIdle = 1;

      client._enterIdle();
    });
  });
  describe('#_processResponse', () => {
    it('should set humanReadable', () => {
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
    it('should set response code', () => {
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
  describe('#isError', () => {
    it('should detect if an object is an error', () => {
      expect(client.isError(new RangeError('abc'))).to.be.true;
      expect(client.isError('abc')).to.be.false;
    });
  });
  describe('#enableCompression', () => {
    it('should create inflater and deflater streams', () => {
      client.socket.ondata = () => {};

      sinon.stub(client.socket, 'ondata');
      expect(client.compressed).to.be.false;
      client.enableCompression();
      expect(client.compressed).to.be.true;
      const payload = 'asdasd';
      const expected = payload.split('').map(char => char.charCodeAt(0));
      client.send(payload);
      const actualOut = socketStub.send.args[0][0];
      client.socket.ondata({
        data: actualOut
      });
      expect(Buffer.from(client._socketOnData.args[0][0].data)).to.deep.equal(Buffer.from(expected));
    });
  });
  describe('#getPreviouslyQueued', () => {
    const ctx = {};
    it('should return undefined with empty queue and no current command', () => {
      client._currentCommand = undefined;
      client._clientQueue = [];
      expect(testAndGetAttribute()).to.be.undefined;
    });
    it('should return undefined with empty queue and non-SELECT current command', () => {
      client._currentCommand = createCommand('TEST');
      client._clientQueue = [];
      expect(testAndGetAttribute()).to.be.undefined;
    });
    it('should return current command with empty queue and SELECT current command', () => {
      client._currentCommand = createCommand('SELECT', 'ATTR');
      client._clientQueue = [];
      expect(testAndGetAttribute()).to.equal('ATTR');
    });
    it('should return current command with non-SELECT commands in queue and SELECT current command', () => {
      client._currentCommand = createCommand('SELECT', 'ATTR');
      client._clientQueue = [createCommand('TEST01'), createCommand('TEST02')];
      expect(testAndGetAttribute()).to.equal('ATTR');
    });
    it('should return last SELECT before ctx with multiple SELECT commands in queue (1)', () => {
      client._currentCommand = createCommand('SELECT', 'ATTR01');
      client._clientQueue = [createCommand('SELECT', 'ATTR'), createCommand('TEST'), ctx, createCommand('SELECT', 'ATTR03')];
      expect(testAndGetAttribute()).to.equal('ATTR');
    });
    it('should return last SELECT before ctx with multiple SELECT commands in queue (2)', () => {
      client._clientQueue = [createCommand('SELECT', 'ATTR02'), createCommand('SELECT', 'ATTR'), ctx, createCommand('SELECT', 'ATTR03')];
      expect(testAndGetAttribute()).to.equal('ATTR');
    });
    it('should return last SELECT before ctx with multiple SELECT commands in queue (3)', () => {
      client._clientQueue = [createCommand('SELECT', 'ATTR02'), createCommand('SELECT', 'ATTR'), createCommand('TEST'), ctx, createCommand('SELECT', 'ATTR03')];
      expect(testAndGetAttribute()).to.equal('ATTR');
    });

    function testAndGetAttribute() {
      const data = client.getPreviouslyQueued(['SELECT'], ctx);

      if (data) {
        return data.request.attributes[0].value;
      }
    }

    function createCommand(command, attribute) {
      const attributes = [];
      const data = {
        request: {
          command,
          attributes
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLXVuaXQuanMiXSwibmFtZXMiOlsiaG9zdCIsInBvcnQiLCJkZXNjcmliZSIsImNsaWVudCIsInNvY2tldFN0dWIiLCJiZWZvcmVFYWNoIiwiSW1hcENsaWVudCIsImV4cGVjdCIsInRvIiwiZXhpc3QiLCJsb2dnZXIiLCJkZWJ1ZyIsImVycm9yIiwiU29ja2V0Iiwib3BlbiIsInByb3RvdHlwZSIsImNsb3NlIiwic2VuZCIsInN1c3BlbmQiLCJyZXN1bWUiLCJ1cGdyYWRlVG9TZWN1cmUiLCJzaW5vbiIsImNyZWF0ZVN0dWJJbnN0YW5jZSIsInN0dWIiLCJ3aXRoQXJncyIsInJldHVybnMiLCJwcm9taXNlIiwiY29ubmVjdCIsInRoZW4iLCJjYWxsQ291bnQiLCJlcXVhbCIsIm9uZXJyb3IiLCJvbm9wZW4iLCJvbmNsb3NlIiwib25kYXRhIiwic2V0VGltZW91dCIsInNraXAiLCJpdCIsInNvY2tldCIsInJlYWR5U3RhdGUiLCJjYWxsZWQiLCJiZSIsImZhbHNlIiwic2VjdXJlTW9kZSIsInVwZ3JhZGUiLCJoYW5kbGVyIiwic2V0SGFuZGxlciIsIl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCIsIkZFVENIIiwiZG9uZSIsImRhdGEiLCJFcnJvciIsIl9vbkRhdGEiLCJidWZmZXIiLCJfcGFyc2VJbmNvbWluZ0NvbW1hbmRzIiwiY2FsbGVkT25jZSIsInRydWUiLCJfaXRlcmF0ZUluY29taW5nQnVmZmVyIiwiYXBwZW5kSW5jb21pbmdCdWZmZXIiLCJpdGVyYXRvciIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImFwcGx5IiwibmV4dCIsInZhbHVlIiwidW5kZWZpbmVkIiwiaXRlcmF0b3IxIiwiaXRlcmF0b3IyIiwiaXRlcmF0b3IzIiwiY29udGVudCIsIl9pbmNvbWluZ0J1ZmZlcnMiLCJwdXNoIiwib25yZWFkeSIsImdlbiIsIl9oYW5kbGVSZXNwb25zZSIsInRhZyIsImNvbW1hbmQiLCJhdHRyaWJ1dGVzIiwidHlwZSIsIm5yIiwiX2N1cnJlbnRDb21tYW5kIiwiZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUiLCJURVNUIiwiX3NlbmRSZXF1ZXN0IiwicGF5bG9hZCIsImRlZXAiLCJjYWxsYmFjayIsInJlc3BvbnNlIiwiY2FsbHNGYWtlIiwiX2NsaWVudFF1ZXVlIiwiX3RhZ0NvdW50ZXIiLCJfY2FuU2VuZCIsImVucXVldWVDb21tYW5kIiwidCIsImNhdGNoIiwiZXJyIiwibGVuZ3RoIiwicmVxdWVzdCIsInZhbHVlQXNTdHJpbmciLCJfZW50ZXJJZGxlIiwiX2NsZWFySWRsZSIsImFyZ3MiLCJwcmVjaGVjayIsImN0eCIsImluY2x1ZGUiLCJyZXN0b3JlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJvbmlkbGUiLCJ0aW1lb3V0RW50ZXJJZGxlIiwiX3Byb2Nlc3NSZXNwb25zZSIsImh1bWFuUmVhZGFibGUiLCJzZWN0aW9uIiwiY29kZSIsImNhcGFiaWxpdHkiLCJpc0Vycm9yIiwiUmFuZ2VFcnJvciIsImNvbXByZXNzZWQiLCJlbmFibGVDb21wcmVzc2lvbiIsImV4cGVjdGVkIiwic3BsaXQiLCJtYXAiLCJjaGFyIiwiY2hhckNvZGVBdCIsImFjdHVhbE91dCIsIkJ1ZmZlciIsImZyb20iLCJfc29ja2V0T25EYXRhIiwidGVzdEFuZEdldEF0dHJpYnV0ZSIsImNyZWF0ZUNvbW1hbmQiLCJnZXRQcmV2aW91c2x5UXVldWVkIiwiYXR0cmlidXRlIl0sIm1hcHBpbmdzIjoiOztBQUVBOztBQUNBOzs7O0FBSEE7QUFLQSxNQUFNQSxJQUFJLEdBQUcsV0FBYjtBQUNBLE1BQU1DLElBQUksR0FBRyxLQUFiO0FBRUFDLFFBQVEsQ0FBQyw0QkFBRCxFQUErQixNQUFNO0FBQzNDLE1BQUlDLE1BQUosRUFBWUMsVUFBWjtBQUVBOztBQUVBQyxFQUFBQSxVQUFVLENBQUMsTUFBTTtBQUNmRixJQUFBQSxNQUFNLEdBQUcsSUFBSUcsYUFBSixDQUFlTixJQUFmLEVBQXFCQyxJQUFyQixDQUFUO0FBQ0FNLElBQUFBLE1BQU0sQ0FBQ0osTUFBRCxD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LG1CQUFULEdBQWdDO0FBQzlCLFlBQU05RSxJQUFJLEdBQUcvQyxNQUFNLENBQUMrSCxtQkFBUCxDQUEyQixDQUFDLFFBQUQsQ0FBM0IsRUFBdUMzQixHQUF2QyxDQUFiOztBQUNBLFVBQUlyRCxJQUFKLEVBQVU7QUFDUixlQUFPQSxJQUFJLENBQUMrQyxPQUFMLENBQWFwQixVQUFiLENBQXdCLENBQXhCLEVBQTJCYixLQUFsQztBQUNEO0FBQ0Y7O0FBRUQsYUFBU2lFLGFBQVQsQ0FBd0JyRCxPQUF4QixFQUFpQ3VELFNBQWpDLEVBQTRDO0FBQzFDLFlBQU10RCxVQUFVLEdBQUcsRUFBbkI7QUFDQSxZQUFNM0IsSUFBSSxHQUFHO0FBQ1grQyxRQUFBQSxPQUFPLEVBQUU7QUFBRXJCLFVBQUFBLE9BQUY7QUFBV0MsVUFBQUE7QUFBWDtBQURFLE9BQWI7O0FBSUEsVUFBSXNELFNBQUosRUFBZTtBQUNiakYsUUFBQUEsSUFBSSxDQUFDK0MsT0FBTCxDQUFhcEIsVUFBYixDQUF3Qk4sSUFBeEIsQ0FBNkI7QUFDM0JPLFVBQUFBLElBQUksRUFBRSxRQURxQjtBQUUzQmQsVUFBQUEsS0FBSyxFQUFFbUU7QUFGb0IsU0FBN0I7QUFJRDs7QUFFRCxhQUFPakYsSUFBUDtBQUNEO0FBQ0YsR0EzRk8sQ0FBUjtBQTRGRCxDQWh3Qk8sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuXG5pbXBvcnQgSW1hcENsaWVudCBmcm9tICcuL2ltYXAnXG5pbXBvcnQgeyB0b1R5cGVkQXJyYXkgfSBmcm9tICcuL2NvbW1vbidcblxuY29uc3QgaG9zdCA9ICdsb2NhbGhvc3QnXG5jb25zdCBwb3J0ID0gMTAwMDBcblxuZGVzY3JpYmUoJ2Jyb3dzZXJib3ggaW1hcCB1bml0IHRlc3RzJywgKCkgPT4ge1xuICB2YXIgY2xpZW50LCBzb2NrZXRTdHViXG5cbiAgLyoganNoaW50IGluZGVudDpmYWxzZSAqL1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGNsaWVudCA9IG5ldyBJbWFwQ2xpZW50KGhvc3QsIHBvcnQpXG4gICAgZXhwZWN0KGNsaWVudCkudG8uZXhpc3RcblxuICAgIGNsaWVudC5sb2dnZXIgPSB7XG4gICAgICBkZWJ1ZzogKCkgPT4geyB9LFxuICAgICAgZXJyb3I6ICgpID0+IHsgfVxuICAgIH1cblxuICAgIHZhciBTb2NrZXQgPSBmdW5jdGlvbiAoKSB7IH1cbiAgICBTb2NrZXQub3BlbiA9ICgpID0+IHsgfVxuICAgIFNvY2tldC5wcm90b3R5cGUuY2xvc2UgPSAoKSA9PiB7IH1cbiAgICBTb2NrZXQucHJvdG90eXBlLnNlbmQgPSAoKSA9PiB7IH1cbiAgICBTb2NrZXQucHJvdG90eXBlLnN1c3BlbmQgPSAoKSA9PiB7IH1cbiAgICBTb2NrZXQucHJvdG90eXBlLnJlc3VtZSA9ICgpID0+IHsgfVxuICAgIFNvY2tldC5wcm90b3R5cGUudXBncmFkZVRvU2VjdXJlID0gKCkgPT4geyB9XG5cbiAgICBzb2NrZXRTdHViID0gc2lub24uY3JlYXRlU3R1Ykluc3RhbmNlKFNvY2tldClcbiAgICBzaW5vbi5zdHViKFNvY2tldCwgJ29wZW4nKS53aXRoQXJncyhob3N0LCBwb3J0KS5yZXR1cm5zKHNvY2tldFN0dWIpXG5cbiAgICB2YXIgcHJvbWlzZSA9IGNsaWVudC5jb25uZWN0KFNvY2tldCkudGhlbigoKSA9PiB7XG4gICAgICBleHBlY3QoU29ja2V0Lm9wZW4uY2FsbENvdW50KS50by5lcXVhbCgxKVxuXG4gICAgICBleHBlY3Qoc29ja2V0U3R1Yi5vbmVycm9yKS50by5leGlzdFxuICAgICAgZXhwZWN0KHNvY2tldFN0dWIub25vcGVuKS50by5leGlzdFxuICAgICAgZXhwZWN0KHNvY2tldFN0dWIub25jbG9zZSkudG8uZXhpc3RcbiAgICAgIGV4cGVjdChzb2NrZXRTdHViLm9uZGF0YSkudG8uZXhpc3RcbiAgICB9KVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiBzb2NrZXRTdHViLm9ub3BlbigpLCAxMClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH0pXG5cbiAgZGVzY3JpYmUuc2tpcCgnI2Nsb3NlJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgY2FsbCBzb2NrZXQuY2xvc2UnLCAoKSA9PiB7XG4gICAgICBjbGllbnQuc29ja2V0LnJlYWR5U3RhdGUgPSAnb3BlbidcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzb2NrZXRTdHViLm9uY2xvc2UoKSwgMTApXG4gICAgICByZXR1cm4gY2xpZW50LmNsb3NlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChzb2NrZXRTdHViLmNsb3NlLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgbm90IGNhbGwgc29ja2V0LmNsb3NlJywgKCkgPT4ge1xuICAgICAgY2xpZW50LnNvY2tldC5yZWFkeVN0YXRlID0gJ25vdCBvcGVuLiBkdWguJ1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNvY2tldFN0dWIub25jbG9zZSgpLCAxMClcbiAgICAgIHJldHVybiBjbGllbnQuY2xvc2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHNvY2tldFN0dWIuY2xvc2UuY2FsbGVkKS50by5iZS5mYWxzZVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjdXBncmFkZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHVwZ3JhZGUgc29ja2V0JywgKCkgPT4ge1xuICAgICAgY2xpZW50LnNlY3VyZU1vZGUgPSBmYWxzZVxuICAgICAgY2xpZW50LnVwZ3JhZGUoKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIG5vdCB1cGdyYWRlIHNvY2tldCcsICgpID0+IHtcbiAgICAgIGNsaWVudC5zZWN1cmVNb2RlID0gdHJ1ZVxuICAgICAgY2xpZW50LnVwZ3JhZGUoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNzZXRIYW5kbGVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgc2V0IGdsb2JhbCBoYW5kbGVyIGZvciBrZXl3b3JkJywgKCkgPT4ge1xuICAgICAgdmFyIGhhbmRsZXIgPSAoKSA9PiB7IH1cbiAgICAgIGNsaWVudC5zZXRIYW5kbGVyKCdmZXRjaCcsIGhhbmRsZXIpXG5cbiAgICAgIGV4cGVjdChjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLkZFVENIKS50by5lcXVhbChoYW5kbGVyKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNzb2NrZXQub25lcnJvcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGVtaXQgZXJyb3IgYW5kIGNsb3NlIGNvbm5lY3Rpb24nLCAoZG9uZSkgPT4ge1xuICAgICAgY2xpZW50LnNvY2tldC5vbmVycm9yKHtcbiAgICAgICAgZGF0YTogbmV3IEVycm9yKCdlcnInKVxuICAgICAgfSlcblxuICAgICAgY2xpZW50Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNzb2NrZXQub25jbG9zZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGVtaXQgZXJyb3IgJywgKGRvbmUpID0+IHtcbiAgICAgIGNsaWVudC5zb2NrZXQub25jbG9zZSgpXG5cbiAgICAgIGNsaWVudC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX29uRGF0YScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgaW5wdXQnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19wYXJzZUluY29taW5nQ29tbWFuZHMnKVxuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfaXRlcmF0ZUluY29taW5nQnVmZmVyJylcblxuICAgICAgY2xpZW50Ll9vbkRhdGEoe1xuICAgICAgICBkYXRhOiB0b1R5cGVkQXJyYXkoJ2Zvb2JhcicpLmJ1ZmZlclxuICAgICAgfSlcblxuICAgICAgZXhwZWN0KGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgIGV4cGVjdChjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlci5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgncmF0ZUluY29taW5nQnVmZmVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgaXRlcmF0ZSBjaHVua2VkIGlucHV0JywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogMSBGRVRDSCAoVUlEIDEpXFxyXFxuKiAyIEZFVENIIChVSUQgMilcXHJcXG4qIDMgRkVUQ0ggKFVJRCAzKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG5cbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAxKScpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAyIEZFVENIIChVSUQgMiknKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMyBGRVRDSCAoVUlEIDMpJylcbiAgICAgIGV4cGVjdChpdGVyYXRvci5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgY2h1bmtlZCBsaXRlcmFscycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7MX1cXHJcXG4xKVxcclxcbiogMiBGRVRDSCAoVUlEIHs0fVxcclxcbjIzNDUpXFxyXFxuKiAzIEZFVENIIChVSUQgezR9XFxyXFxuMzc4OSlcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgezF9XFxyXFxuMSknKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMiBGRVRDSCAoVUlEIHs0fVxcclxcbjIzNDUpJylcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDMgRkVUQ0ggKFVJRCB7NH1cXHJcXG4zNzg5KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGNodW5rZWQgbGl0ZXJhbHMgMicsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCAxKVxcclxcbiogMiBGRVRDSCAoVUlEIHs0fVxcclxcbjIzNDUpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcblxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIDEpJylcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDIgRkVUQ0ggKFVJRCB7NH1cXHJcXG4yMzQ1KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGNodW5rZWQgbGl0ZXJhbHMgMycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7MX1cXHJcXG4xKVxcclxcbiogMiBGRVRDSCAoVUlEIDQpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcblxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIHsxfVxcclxcbjEpJylcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDIgRkVUQ0ggKFVJRCA0KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGNodW5rZWQgbGl0ZXJhbHMgNCcsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIFNFQVJDSCB7MX1cXHJcXG4xIHsxfVxcclxcbjJcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogU0VBUkNIIHsxfVxcclxcbjEgezF9XFxyXFxuMicpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBDUkxGIGxpdGVyYWwnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMjAgQk9EWVtIRUFERVIuRklFTERTIChSRUZFUkVOQ0VTIExJU1QtSUQpXSB7Mn1cXHJcXG5cXHJcXG4pXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAyMCBCT0RZW0hFQURFUi5GSUVMRFMgKFJFRkVSRU5DRVMgTElTVC1JRCldIHsyfVxcclxcblxcclxcbiknKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgQ1JMRiBsaXRlcmFsIDInLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMSBFTlZFTE9QRSAoXCJzdHJpbmcgd2l0aCB7cGFyZW50aGVzaXN9XCIpIEJPRFlbSEVBREVSLkZJRUxEUyAoUkVGRVJFTkNFUyBMSVNULUlEKV0gezJ9XFxyXFxuXFxyXFxuKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgMSBFTlZFTE9QRSAoXCJzdHJpbmcgd2l0aCB7cGFyZW50aGVzaXN9XCIpIEJPRFlbSEVBREVSLkZJRUxEUyAoUkVGRVJFTkNFUyBMSVNULUlEKV0gezJ9XFxyXFxuXFxyXFxuKScpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcGFyc2UgbXVsdGlwbGUgemVyby1sZW5ndGggbGl0ZXJhbHMnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxMjYwMTUgRkVUQ0ggKFVJRCA1ODU1OTkgQk9EWVsxLjJdIHswfVxcclxcbiBCT0RZWzEuMV0gezB9XFxyXFxuKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvci5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxMjYwMTUgRkVUQ0ggKFVJRCA1ODU1OTkgQk9EWVsxLjJdIHswfVxcclxcbiBCT0RZWzEuMV0gezB9XFxyXFxuKScpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyB0d28gY29tbWFuZHMgd2hlbiBDUkxGIGFycml2ZXMgaW4gMiBwYXJ0cycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCAxKVxccicpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuXG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignXFxuKiAyIEZFVENIIChVSUQgMilcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yMiA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yMi5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgMSknKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDIgRkVUQ0ggKFVJRCAyKScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBsaXRlcmFsIHdoZW4gbGl0ZXJhbCBjb3VudCBhcnJpdmVzIGluIDIgcGFydHMnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgeycpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuXG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignMn1cXHJcXG4xMilcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yMiA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yMi5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgezJ9XFxyXFxuMTIpJylcbiAgICAgIGV4cGVjdChpdGVyYXRvcjIubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGxpdGVyYWwgd2hlbiBsaXRlcmFsIGNvdW50IGFycml2ZXMgaW4gMiBwYXJ0cyAyJywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogMSBGRVRDSCAoVUlEIHsxJylcbiAgICAgIHZhciBpdGVyYXRvcjEgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IxLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcwfVxcclxcbjAxMjM0NTY3ODkpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvcjIgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBpdGVyYXRvcjIubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIHsxMH1cXHJcXG4wMTIzNDU2Nzg5KScpXG4gICAgICBleHBlY3QoaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBsaXRlcmFsIHdoZW4gbGl0ZXJhbCBjb3VudCBhcnJpdmVzIGluIDIgcGFydHMgMycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7JylcbiAgICAgIHZhciBpdGVyYXRvcjEgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IxLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcxMH1cXHJcXG4xMjM0NTY3ODkwKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IyID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCB7MTB9XFxyXFxuMTIzNDU2Nzg5MCknKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMi5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgbGl0ZXJhbCB3aGVuIGxpdGVyYWwgY291bnQgYXJyaXZlcyBpbiAyIHBhcnRzIDQnLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMSBCT0RZW0hFQURFUi5GSUVMRFMgKFJFRkVSRU5DRVMgTElTVC1JRCldIHsyfVxccicpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJ1xcblhYKVxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IyID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAxIEJPRFlbSEVBREVSLkZJRUxEUyAoUkVGRVJFTkNFUyBMSVNULUlEKV0gezJ9XFxyXFxuWFgpJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGxpdGVyYWwgd2hlbiBsaXRlcmFsIGNvdW50IGFycml2ZXMgaW4gMyBwYXJ0cycsICgpID0+IHtcbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcqIDEgRkVUQ0ggKFVJRCB7JylcbiAgICAgIHZhciBpdGVyYXRvcjEgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IxLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCcxJylcbiAgICAgIHZhciBpdGVyYXRvcjIgPSBjbGllbnQuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpXG4gICAgICBleHBlY3QoaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkudG8uYmUudW5kZWZpbmVkXG5cbiAgICAgIGFwcGVuZEluY29taW5nQnVmZmVyKCd9XFxyXFxuMSlcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yMyA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yMy5uZXh0KCkudmFsdWUpKS50by5lcXVhbCgnKiAxIEZFVENIIChVSUQgezF9XFxyXFxuMSknKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMy5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgU0VBUkNIIHJlc3BvbnNlIHdoZW4gaXQgYXJyaXZlcyBpbiAyIHBhcnRzJywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogU0VBUkNIIDEgMicpXG4gICAgICB2YXIgaXRlcmF0b3IxID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KGl0ZXJhdG9yMS5uZXh0KCkudmFsdWUpLnRvLmJlLnVuZGVmaW5lZFxuXG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignIDMgNFxcclxcbicpXG4gICAgICB2YXIgaXRlcmF0b3IyID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IyLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIFNFQVJDSCAxIDIgMyA0JylcbiAgICAgIGV4cGVjdChpdGVyYXRvcjIubmV4dCgpLnZhbHVlKS50by5iZS51bmRlZmluZWRcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBub3QgcHJvY2VzcyB7fSBpbiBzdHJpbmcgYXMgbGl0ZXJhbCAxJywgKCkgPT4ge1xuICAgICAgYXBwZW5kSW5jb21pbmdCdWZmZXIoJyogMSBGRVRDSCAoVUlEIDEgRU5WRUxPUEUgKFwic3RyaW5nIHdpdGgge3BhcmVudGhlc2lzfVwiKSlcXHJcXG4nKVxuICAgICAgdmFyIGl0ZXJhdG9yID0gY2xpZW50Ll9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKVxuICAgICAgZXhwZWN0KFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgaXRlcmF0b3IubmV4dCgpLnZhbHVlKSkudG8uZXF1YWwoJyogMSBGRVRDSCAoVUlEIDEgRU5WRUxPUEUgKFwic3RyaW5nIHdpdGgge3BhcmVudGhlc2lzfVwiKSknKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIG5vdCBwcm9jZXNzIHt9IGluIHN0cmluZyBhcyBsaXRlcmFsIDInLCAoKSA9PiB7XG4gICAgICBhcHBlbmRJbmNvbWluZ0J1ZmZlcignKiAxIEZFVENIIChVSUQgMSBFTlZFTE9QRSAoXCJzdHJpbmcgd2l0aCBudW1iZXIgaW4gcGFyZW50aGVzaXMgezEyM31cIikpXFxyXFxuJylcbiAgICAgIHZhciBpdGVyYXRvciA9IGNsaWVudC5faXRlcmF0ZUluY29taW5nQnVmZmVyKClcbiAgICAgIGV4cGVjdChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGl0ZXJhdG9yLm5leHQoKS52YWx1ZSkpLnRvLmVxdWFsKCcqIDEgRkVUQ0ggKFVJRCAxIEVOVkVMT1BFIChcInN0cmluZyB3aXRoIG51bWJlciBpbiBwYXJlbnRoZXNpcyB7MTIzfVwiKSknKVxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiBhcHBlbmRJbmNvbWluZ0J1ZmZlciAoY29udGVudCkge1xuICAgICAgY2xpZW50Ll9pbmNvbWluZ0J1ZmZlcnMucHVzaCh0b1R5cGVkQXJyYXkoY29udGVudCkpXG4gICAgfVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3BhcnNlSW5jb21pbmdDb21tYW5kcycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgYSB0YWdnZWQgaXRlbSBmcm9tIHRoZSBxdWV1ZScsICgpID0+IHtcbiAgICAgIGNsaWVudC5vbnJlYWR5ID0gc2lub24uc3R1YigpXG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19oYW5kbGVSZXNwb25zZScpXG5cbiAgICAgIGZ1bmN0aW9uICogZ2VuICgpIHsgeWllbGQgdG9UeXBlZEFycmF5KCdPSyBIZWxsbyB3b3JsZCEnKSB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50Lm9ucmVhZHkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgZXhwZWN0KGNsaWVudC5faGFuZGxlUmVzcG9uc2Uud2l0aEFyZ3Moe1xuICAgICAgICB0YWc6ICdPSycsXG4gICAgICAgIGNvbW1hbmQ6ICdIZWxsbycsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnd29ybGQhJ1xuICAgICAgICB9XVxuICAgICAgfSkuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByb2Nlc3MgYW4gdW50YWdnZWQgaXRlbSBmcm9tIHRoZSBxdWV1ZScsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX2hhbmRsZVJlc3BvbnNlJylcblxuICAgICAgZnVuY3Rpb24gKiBnZW4gKCkgeyB5aWVsZCB0b1R5cGVkQXJyYXkoJyogMSBFWElTVFMnKSB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9oYW5kbGVSZXNwb25zZS53aXRoQXJncyh7XG4gICAgICAgIHRhZzogJyonLFxuICAgICAgICBjb21tYW5kOiAnRVhJU1RTJyxcbiAgICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICAgIG5yOiAxXG4gICAgICB9KS5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcHJvY2VzcyBhIHBsdXMgdGFnZ2VkIGl0ZW0gZnJvbSB0aGUgcXVldWUnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ3NlbmQnKVxuXG4gICAgICBmdW5jdGlvbiAqIGdlbiAoKSB7IHlpZWxkIHRvVHlwZWRBcnJheSgnKyBQbGVhc2UgY29udGludWUnKSB9XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0ge1xuICAgICAgICBkYXRhOiBbJ2xpdGVyYWwgZGF0YSddXG4gICAgICB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50LnNlbmQud2l0aEFyZ3MoJ2xpdGVyYWwgZGF0YVxcclxcbicpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwcm9jZXNzIGFuIFhPQVVUSDIgZXJyb3IgY2hhbGxlbmdlJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdzZW5kJylcblxuICAgICAgZnVuY3Rpb24gKiBnZW4gKCkgeyB5aWVsZCB0b1R5cGVkQXJyYXkoJysgRk9PQkFSJykgfVxuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IHtcbiAgICAgICAgZGF0YTogW10sXG4gICAgICAgIGVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lOiB0cnVlXG4gICAgICB9XG5cbiAgICAgIGNsaWVudC5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKGdlbigpKVxuXG4gICAgICBleHBlY3QoY2xpZW50LnNlbmQud2l0aEFyZ3MoJ1xcclxcbicpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX2hhbmRsZVJlc3BvbnNlJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgaW52b2tlIGdsb2JhbCBoYW5kbGVyIGJ5IGRlZmF1bHQnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19wcm9jZXNzUmVzcG9uc2UnKVxuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfc2VuZFJlcXVlc3QnKVxuXG4gICAgICBjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLlRFU1QgPSAoKSA9PiB7IH1cbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZCwgJ1RFU1QnKVxuXG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gZmFsc2VcbiAgICAgIGNsaWVudC5faGFuZGxlUmVzcG9uc2Uoe1xuICAgICAgICB0YWc6ICcqJyxcbiAgICAgICAgY29tbWFuZDogJ3Rlc3QnXG4gICAgICB9KVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9zZW5kUmVxdWVzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICBleHBlY3QoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZC5URVNULndpdGhBcmdzKHtcbiAgICAgICAgdGFnOiAnKicsXG4gICAgICAgIGNvbW1hbmQ6ICd0ZXN0J1xuICAgICAgfSkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGludm9rZSBnbG9iYWwgaGFuZGxlciBpZiBuZWVkZWQnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19wcm9jZXNzUmVzcG9uc2UnKVxuICAgICAgY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZC5URVNUID0gKCkgPT4geyB9XG4gICAgICBzaW5vbi5zdHViKGNsaWVudC5fZ2xvYmFsQWNjZXB0VW50YWdnZWQsICdURVNUJylcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3NlbmRSZXF1ZXN0JylcblxuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IHtcbiAgICAgICAgcGF5bG9hZDoge31cbiAgICAgIH1cbiAgICAgIGNsaWVudC5faGFuZGxlUmVzcG9uc2Uoe1xuICAgICAgICB0YWc6ICcqJyxcbiAgICAgICAgY29tbWFuZDogJ3Rlc3QnXG4gICAgICB9KVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9zZW5kUmVxdWVzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgICBleHBlY3QoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZC5URVNULndpdGhBcmdzKHtcbiAgICAgICAgdGFnOiAnKicsXG4gICAgICAgIGNvbW1hbmQ6ICd0ZXN0J1xuICAgICAgfSkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHB1c2ggdG8gcGF5bG9hZCcsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3Byb2Nlc3NSZXNwb25zZScpXG4gICAgICBjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLlRFU1QgPSAoKSA9PiB7IH1cbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50Ll9nbG9iYWxBY2NlcHRVbnRhZ2dlZCwgJ1RFU1QnKVxuXG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0ge1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgVEVTVDogW11cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2xpZW50Ll9oYW5kbGVSZXNwb25zZSh7XG4gICAgICAgIHRhZzogJyonLFxuICAgICAgICBjb21tYW5kOiAndGVzdCdcbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLlRFU1QuY2FsbENvdW50KS50by5lcXVhbCgwKVxuICAgICAgZXhwZWN0KGNsaWVudC5fY3VycmVudENvbW1hbmQucGF5bG9hZC5URVNUKS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgIHRhZzogJyonLFxuICAgICAgICBjb21tYW5kOiAndGVzdCdcbiAgICAgIH1dKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGludm9rZSBjb21tYW5kIGNhbGxiYWNrJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfcHJvY2Vzc1Jlc3BvbnNlJylcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3NlbmRSZXF1ZXN0JylcbiAgICAgIGNsaWVudC5fZ2xvYmFsQWNjZXB0VW50YWdnZWQuVEVTVCA9ICgpID0+IHsgfVxuICAgICAgc2lub24uc3R1YihjbGllbnQuX2dsb2JhbEFjY2VwdFVudGFnZ2VkLCAnVEVTVCcpXG5cbiAgICAgIGNsaWVudC5fY3VycmVudENvbW1hbmQgPSB7XG4gICAgICAgIHRhZzogJ0EnLFxuICAgICAgICBjYWxsYmFjazogKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3BvbnNlKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgICAgIHRhZzogJ0EnLFxuICAgICAgICAgICAgY29tbWFuZDogJ3Rlc3QnLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICBURVNUOiAnYWJjJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBURVNUOiAnYWJjJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjbGllbnQuX2hhbmRsZVJlc3BvbnNlKHtcbiAgICAgICAgdGFnOiAnQScsXG4gICAgICAgIGNvbW1hbmQ6ICd0ZXN0J1xuICAgICAgfSlcblxuICAgICAgZXhwZWN0KGNsaWVudC5fc2VuZFJlcXVlc3QuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgZXhwZWN0KGNsaWVudC5fZ2xvYmFsQWNjZXB0VW50YWdnZWQuVEVTVC5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2VucXVldWVDb21tYW5kJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmVqZWN0IG9uIE5PL0JBRCcsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX3NlbmRSZXF1ZXN0JykuY2FsbHNGYWtlKCgpID0+IHtcbiAgICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZVswXS5jYWxsYmFjayh7IGNvbW1hbmQ6ICdOTycgfSlcbiAgICAgIH0pXG5cbiAgICAgIGNsaWVudC5fdGFnQ291bnRlciA9IDEwMFxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFtdXG4gICAgICBjbGllbnQuX2NhblNlbmQgPSB0cnVlXG5cbiAgICAgIHJldHVybiBjbGllbnQuZW5xdWV1ZUNvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiAnYWJjJ1xuICAgICAgfSwgWydkZWYnXSwge1xuICAgICAgICB0OiAxXG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGludm9rZSBzZW5kaW5nJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfc2VuZFJlcXVlc3QnKS5jYWxsc0Zha2UoKCkgPT4ge1xuICAgICAgICBjbGllbnQuX2NsaWVudFF1ZXVlWzBdLmNhbGxiYWNrKHt9KVxuICAgICAgfSlcblxuICAgICAgY2xpZW50Ll90YWdDb3VudGVyID0gMTAwXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW11cbiAgICAgIGNsaWVudC5fY2FuU2VuZCA9IHRydWVcblxuICAgICAgcmV0dXJuIGNsaWVudC5lbnF1ZXVlQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdhYmMnXG4gICAgICB9LCBbJ2RlZiddLCB7XG4gICAgICAgIHQ6IDFcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2xpZW50Ll9zZW5kUmVxdWVzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlLmxlbmd0aCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGNsaWVudC5fY2xpZW50UXVldWVbMF0udGFnKS50by5lcXVhbCgnVzEwMScpXG4gICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlWzBdLnJlcXVlc3QpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICAgIGNvbW1hbmQ6ICdhYmMnLFxuICAgICAgICAgIHRhZzogJ1cxMDEnXG4gICAgICAgIH0pXG4gICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlWzBdLnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIG9ubHkgcXVldWUnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19zZW5kUmVxdWVzdCcpXG5cbiAgICAgIGNsaWVudC5fdGFnQ291bnRlciA9IDEwMFxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFtdXG4gICAgICBjbGllbnQuX2NhblNlbmQgPSBmYWxzZVxuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHsgY2xpZW50Ll9jbGllbnRRdWV1ZVswXS5jYWxsYmFjayh7fSkgfSwgMClcblxuICAgICAgcmV0dXJuIGNsaWVudC5lbnF1ZXVlQ29tbWFuZCh7XG4gICAgICAgIGNvbW1hbmQ6ICdhYmMnXG4gICAgICB9LCBbJ2RlZiddLCB7XG4gICAgICAgIHQ6IDFcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2xpZW50Ll9zZW5kUmVxdWVzdC5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlLmxlbmd0aCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGNsaWVudC5fY2xpZW50UXVldWVbMF0udGFnKS50by5lcXVhbCgnVzEwMScpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHN0b3JlIHZhbHVlQXNTdHJpbmcgb3B0aW9uIGluIHRoZSBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihjbGllbnQsICdfc2VuZFJlcXVlc3QnKVxuXG4gICAgICBjbGllbnQuX3RhZ0NvdW50ZXIgPSAxMDBcbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbXVxuICAgICAgY2xpZW50Ll9jYW5TZW5kID0gZmFsc2VcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGNsaWVudC5fY2xpZW50UXVldWVbMF0uY2FsbGJhY2soe30pIH0sIDApXG4gICAgICByZXR1cm4gY2xpZW50LmVucXVldWVDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogJ2FiYycsXG4gICAgICAgIHZhbHVlQXNTdHJpbmc6IGZhbHNlXG4gICAgICB9LCBbJ2RlZiddLCB7XG4gICAgICAgIHQ6IDFcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2xpZW50Ll9jbGllbnRRdWV1ZVswXS5yZXF1ZXN0LnZhbHVlQXNTdHJpbmcpLnRvLmVxdWFsKGZhbHNlKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3NlbmRSZXF1ZXN0JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZW50ZXIgaWRsZSBpZiBub3RoaW5nIGlzIHRvIHByb2Nlc3MnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19lbnRlcklkbGUnKVxuXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW11cbiAgICAgIGNsaWVudC5fc2VuZFJlcXVlc3QoKVxuXG4gICAgICBleHBlY3QoY2xpZW50Ll9lbnRlcklkbGUuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHNlbmQgZGF0YScsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX2NsZWFySWRsZScpXG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ3NlbmQnKVxuXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW3tcbiAgICAgICAgcmVxdWVzdDoge1xuICAgICAgICAgIHRhZzogJ1cxMDEnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdURVNUJ1xuICAgICAgICB9XG4gICAgICB9XVxuICAgICAgY2xpZW50Ll9zZW5kUmVxdWVzdCgpXG5cbiAgICAgIGV4cGVjdChjbGllbnQuX2NsZWFySWRsZS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICBleHBlY3QoY2xpZW50LnNlbmQuYXJnc1swXVswXSkudG8uZXF1YWwoJ1cxMDEgVEVTVFxcclxcbicpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgc2VuZCBwYXJ0aWFsIGRhdGEnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGNsaWVudCwgJ19jbGVhcklkbGUnKVxuICAgICAgc2lub24uc3R1YihjbGllbnQsICdzZW5kJylcblxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFt7XG4gICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICB0YWc6ICdXMTAxJyxcbiAgICAgICAgICBjb21tYW5kOiAnVEVTVCcsXG4gICAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAgIHR5cGU6ICdMSVRFUkFMJyxcbiAgICAgICAgICAgIHZhbHVlOiAnYWJjJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgICBjbGllbnQuX3NlbmRSZXF1ZXN0KClcblxuICAgICAgZXhwZWN0KGNsaWVudC5fY2xlYXJJZGxlLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIGV4cGVjdChjbGllbnQuc2VuZC5hcmdzWzBdWzBdKS50by5lcXVhbCgnVzEwMSBURVNUIHszfVxcclxcbicpXG4gICAgICBleHBlY3QoY2xpZW50Ll9jdXJyZW50Q29tbWFuZC5kYXRhKS50by5kZWVwLmVxdWFsKFsnYWJjJ10pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcnVuIHByZWNoZWNrJywgKGRvbmUpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LCAnX2NsZWFySWRsZScpXG5cbiAgICAgIGNsaWVudC5fY2FuU2VuZCA9IHRydWVcbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbe1xuICAgICAgICByZXF1ZXN0OiB7XG4gICAgICAgICAgdGFnOiAnVzEwMScsXG4gICAgICAgICAgY29tbWFuZDogJ1RFU1QnLFxuICAgICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgICB0eXBlOiAnTElURVJBTCcsXG4gICAgICAgICAgICB2YWx1ZTogJ2FiYydcbiAgICAgICAgICB9XVxuICAgICAgICB9LFxuICAgICAgICBwcmVjaGVjazogKGN0eCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChjdHgpLnRvLmV4aXN0XG4gICAgICAgICAgZXhwZWN0KGNsaWVudC5fY2FuU2VuZCkudG8uYmUudHJ1ZVxuICAgICAgICAgIGNsaWVudC5fc2VuZFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoY2xpZW50Ll9jbGllbnRRdWV1ZS5sZW5ndGgpLnRvLmVxdWFsKDIpXG4gICAgICAgICAgICBleHBlY3QoY2xpZW50Ll9jbGllbnRRdWV1ZVswXS50YWcpLnRvLmluY2x1ZGUoJy5wJylcbiAgICAgICAgICAgIGV4cGVjdChjbGllbnQuX2NsaWVudFF1ZXVlWzBdLnJlcXVlc3QudGFnKS50by5pbmNsdWRlKCcucCcpXG4gICAgICAgICAgICBjbGllbnQuX2NsZWFySWRsZS5yZXN0b3JlKClcbiAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjbGllbnQuZW5xdWV1ZUNvbW1hbmQoe30sIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgY3R4OiBjdHhcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICB9XG4gICAgICB9XVxuICAgICAgY2xpZW50Ll9zZW5kUmVxdWVzdCgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19lbnRlcklkbGUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBzZXQgaWRsZSB0aW1lcicsIChkb25lKSA9PiB7XG4gICAgICBjbGllbnQub25pZGxlID0gKCkgPT4ge1xuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICAgIGNsaWVudC50aW1lb3V0RW50ZXJJZGxlID0gMVxuXG4gICAgICBjbGllbnQuX2VudGVySWRsZSgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19wcm9jZXNzUmVzcG9uc2UnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBzZXQgaHVtYW5SZWFkYWJsZScsICgpID0+IHtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgdGFnOiAnKicsXG4gICAgICAgIGNvbW1hbmQ6ICdPSycsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ1RFWFQnLFxuICAgICAgICAgIHZhbHVlOiAnU29tZSByYW5kb20gdGV4dCdcbiAgICAgICAgfV1cbiAgICAgIH1cbiAgICAgIGNsaWVudC5fcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlKVxuXG4gICAgICBleHBlY3QocmVzcG9uc2UuaHVtYW5SZWFkYWJsZSkudG8uZXF1YWwoJ1NvbWUgcmFuZG9tIHRleHQnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHNldCByZXNwb25zZSBjb2RlJywgKCkgPT4ge1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICB0YWc6ICcqJyxcbiAgICAgICAgY29tbWFuZDogJ09LJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgc2VjdGlvbjogW3tcbiAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgIHZhbHVlOiAnQ0FQQUJJTElUWSdcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICB2YWx1ZTogJ0lNQVA0UkVWMSdcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICB2YWx1ZTogJ1VJRFBMVVMnXG4gICAgICAgICAgfV1cbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdURVhUJyxcbiAgICAgICAgICB2YWx1ZTogJ1NvbWUgcmFuZG9tIHRleHQnXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgICBjbGllbnQuX3Byb2Nlc3NSZXNwb25zZShyZXNwb25zZSlcbiAgICAgIGV4cGVjdChyZXNwb25zZS5jb2RlKS50by5lcXVhbCgnQ0FQQUJJTElUWScpXG4gICAgICBleHBlY3QocmVzcG9uc2UuY2FwYWJpbGl0eSkudG8uZGVlcC5lcXVhbChbJ0lNQVA0UkVWMScsICdVSURQTFVTJ10pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2lzRXJyb3InLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBkZXRlY3QgaWYgYW4gb2JqZWN0IGlzIGFuIGVycm9yJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGNsaWVudC5pc0Vycm9yKG5ldyBSYW5nZUVycm9yKCdhYmMnKSkpLnRvLmJlLnRydWVcbiAgICAgIGV4cGVjdChjbGllbnQuaXNFcnJvcignYWJjJykpLnRvLmJlLmZhbHNlXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2VuYWJsZUNvbXByZXNzaW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgY3JlYXRlIGluZmxhdGVyIGFuZCBkZWZsYXRlciBzdHJlYW1zJywgKCkgPT4ge1xuICAgICAgY2xpZW50LnNvY2tldC5vbmRhdGEgPSAoKSA9PiB7IH1cbiAgICAgIHNpbm9uLnN0dWIoY2xpZW50LnNvY2tldCwgJ29uZGF0YScpXG5cbiAgICAgIGV4cGVjdChjbGllbnQuY29tcHJlc3NlZCkudG8uYmUuZmFsc2VcbiAgICAgIGNsaWVudC5lbmFibGVDb21wcmVzc2lvbigpXG4gICAgICBleHBlY3QoY2xpZW50LmNvbXByZXNzZWQpLnRvLmJlLnRydWVcblxuICAgICAgY29uc3QgcGF5bG9hZCA9ICdhc2Rhc2QnXG4gICAgICBjb25zdCBleHBlY3RlZCA9IHBheWxvYWQuc3BsaXQoJycpLm1hcChjaGFyID0+IGNoYXIuY2hhckNvZGVBdCgwKSlcblxuICAgICAgY2xpZW50LnNlbmQocGF5bG9hZClcbiAgICAgIGNvbnN0IGFjdHVhbE91dCA9IHNvY2tldFN0dWIuc2VuZC5hcmdzWzBdWzBdXG4gICAgICBjbGllbnQuc29ja2V0Lm9uZGF0YSh7IGRhdGE6IGFjdHVhbE91dCB9KVxuICAgICAgZXhwZWN0KEJ1ZmZlci5mcm9tKGNsaWVudC5fc29ja2V0T25EYXRhLmFyZ3NbMF1bMF0uZGF0YSkpLnRvLmRlZXAuZXF1YWwoQnVmZmVyLmZyb20oZXhwZWN0ZWQpKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNnZXRQcmV2aW91c2x5UXVldWVkJywgKCkgPT4ge1xuICAgIGNvbnN0IGN0eCA9IHt9XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiB1bmRlZmluZWQgd2l0aCBlbXB0eSBxdWV1ZSBhbmQgbm8gY3VycmVudCBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IHVuZGVmaW5lZFxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFtdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmJlLnVuZGVmaW5lZFxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiB1bmRlZmluZWQgd2l0aCBlbXB0eSBxdWV1ZSBhbmQgbm9uLVNFTEVDVCBjdXJyZW50IGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gY3JlYXRlQ29tbWFuZCgnVEVTVCcpXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW11cblxuICAgICAgZXhwZWN0KHRlc3RBbmRHZXRBdHRyaWJ1dGUoKSkudG8uYmUudW5kZWZpbmVkXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGN1cnJlbnQgY29tbWFuZCB3aXRoIGVtcHR5IHF1ZXVlIGFuZCBTRUxFQ1QgY3VycmVudCBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgY2xpZW50Ll9jdXJyZW50Q29tbWFuZCA9IGNyZWF0ZUNvbW1hbmQoJ1NFTEVDVCcsICdBVFRSJylcbiAgICAgIGNsaWVudC5fY2xpZW50UXVldWUgPSBbXVxuXG4gICAgICBleHBlY3QodGVzdEFuZEdldEF0dHJpYnV0ZSgpKS50by5lcXVhbCgnQVRUUicpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIGN1cnJlbnQgY29tbWFuZCB3aXRoIG5vbi1TRUxFQ1QgY29tbWFuZHMgaW4gcXVldWUgYW5kIFNFTEVDVCBjdXJyZW50IGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFInKVxuICAgICAgY2xpZW50Ll9jbGllbnRRdWV1ZSA9IFtcbiAgICAgICAgY3JlYXRlQ29tbWFuZCgnVEVTVDAxJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1RFU1QwMicpXG4gICAgICBdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmVxdWFsKCdBVFRSJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gbGFzdCBTRUxFQ1QgYmVmb3JlIGN0eCB3aXRoIG11bHRpcGxlIFNFTEVDVCBjb21tYW5kcyBpbiBxdWV1ZSAoMSknLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2N1cnJlbnRDb21tYW5kID0gY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFIwMScpXG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW1xuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUicpLFxuICAgICAgICBjcmVhdGVDb21tYW5kKCdURVNUJyksXG4gICAgICAgIGN0eCxcbiAgICAgICAgY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFIwMycpXG4gICAgICBdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmVxdWFsKCdBVFRSJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gbGFzdCBTRUxFQ1QgYmVmb3JlIGN0eCB3aXRoIG11bHRpcGxlIFNFTEVDVCBjb21tYW5kcyBpbiBxdWV1ZSAoMiknLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW1xuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUjAyJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1NFTEVDVCcsICdBVFRSJyksXG4gICAgICAgIGN0eCxcbiAgICAgICAgY3JlYXRlQ29tbWFuZCgnU0VMRUNUJywgJ0FUVFIwMycpXG4gICAgICBdXG5cbiAgICAgIGV4cGVjdCh0ZXN0QW5kR2V0QXR0cmlidXRlKCkpLnRvLmVxdWFsKCdBVFRSJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gbGFzdCBTRUxFQ1QgYmVmb3JlIGN0eCB3aXRoIG11bHRpcGxlIFNFTEVDVCBjb21tYW5kcyBpbiBxdWV1ZSAoMyknLCAoKSA9PiB7XG4gICAgICBjbGllbnQuX2NsaWVudFF1ZXVlID0gW1xuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUjAyJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1NFTEVDVCcsICdBVFRSJyksXG4gICAgICAgIGNyZWF0ZUNvbW1hbmQoJ1RFU1QnKSxcbiAgICAgICAgY3R4LFxuICAgICAgICBjcmVhdGVDb21tYW5kKCdTRUxFQ1QnLCAnQVRUUjAzJylcbiAgICAgIF1cblxuICAgICAgZXhwZWN0KHRlc3RBbmRHZXRBdHRyaWJ1dGUoKSkudG8uZXF1YWwoJ0FUVFInKVxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiB0ZXN0QW5kR2V0QXR0cmlidXRlICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBjbGllbnQuZ2V0UHJldmlvdXNseVF1ZXVlZChbJ1NFTEVDVCddLCBjdHgpXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gZGF0YS5yZXF1ZXN0LmF0dHJpYnV0ZXNbMF0udmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDb21tYW5kIChjb21tYW5kLCBhdHRyaWJ1dGUpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBbXVxuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgcmVxdWVzdDogeyBjb21tYW5kLCBhdHRyaWJ1dGVzIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgICBkYXRhLnJlcXVlc3QuYXR0cmlidXRlcy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICB2YWx1ZTogYXR0cmlidXRlXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRhXG4gICAgfVxuICB9KVxufSlcbiJdfQ==