"use strict";

var _client = _interopRequireWildcard(require("./client"));

var _emailjsImapHandler = require("emailjs-imap-handler");

var _common = require("./common");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint-disable no-unused-expressions */
describe('browserbox unit tests', () => {
  var br;
  beforeEach(() => {
    const auth = {
      user: 'baldrian',
      pass: 'sleeper.de'
    };
    br = new _client.default('somehost', 1234, {
      auth,
      logLevel: _common.LOG_LEVEL_NONE
    });
    br.client.socket = {
      send: () => {},
      upgradeToSecure: () => {}
    };
  });
  describe('#_onIdle', () => {
    it('should call enterIdle', () => {
      sinon.stub(br, 'enterIdle');
      br._authenticated = true;
      br._enteredIdle = false;

      br._onIdle();

      expect(br.enterIdle.callCount).to.equal(1);
    });
    it('should not call enterIdle', () => {
      sinon.stub(br, 'enterIdle');
      br._enteredIdle = true;

      br._onIdle();

      expect(br.enterIdle.callCount).to.equal(0);
    });
  });
  describe('#openConnection', () => {
    beforeEach(() => {
      sinon.stub(br.client, 'connect');
      sinon.stub(br.client, 'close');
      sinon.stub(br.client, 'enqueueCommand');
    });
    it('should open connection', () => {
      br.client.connect.returns(Promise.resolve());
      br.client.enqueueCommand.returns(Promise.resolve({
        capability: ['capa1', 'capa2']
      }));
      setTimeout(() => br.client.onready(), 0);
      return br.openConnection().then(() => {
        expect(br.client.connect.calledOnce).to.be.true;
        expect(br.client.enqueueCommand.calledOnce).to.be.true;
        expect(br._capability.length).to.equal(2);
        expect(br._capability[0]).to.equal('capa1');
        expect(br._capability[1]).to.equal('capa2');
      });
    });
  });
  describe('#connect', () => {
    beforeEach(() => {
      sinon.stub(br.client, 'connect');
      sinon.stub(br.client, 'close');
      sinon.stub(br, 'updateCapability');
      sinon.stub(br, 'upgradeConnection');
      sinon.stub(br, 'updateId');
      sinon.stub(br, 'login');
      sinon.stub(br, 'compressConnection');
    });
    it('should connect', () => {
      br.client.connect.returns(Promise.resolve());
      br.updateCapability.returns(Promise.resolve());
      br.upgradeConnection.returns(Promise.resolve());
      br.updateId.returns(Promise.resolve());
      br.login.returns(Promise.resolve());
      br.compressConnection.returns(Promise.resolve());
      setTimeout(() => br.client.onready(), 0);
      return br.connect().then(() => {
        expect(br.client.connect.calledOnce).to.be.true;
        expect(br.updateCapability.calledOnce).to.be.true;
        expect(br.upgradeConnection.calledOnce).to.be.true;
        expect(br.updateId.calledOnce).to.be.true;
        expect(br.login.calledOnce).to.be.true;
        expect(br.compressConnection.calledOnce).to.be.true;
      });
    });
    it('should fail to login', done => {
      br.client.connect.returns(Promise.resolve());
      br.updateCapability.returns(Promise.resolve());
      br.upgradeConnection.returns(Promise.resolve());
      br.updateId.returns(Promise.resolve());
      br.login.throws(new Error());
      setTimeout(() => br.client.onready(), 0);
      br.connect().catch(err => {
        expect(err).to.exist;
        expect(br.client.connect.calledOnce).to.be.true;
        expect(br.client.close.calledOnce).to.be.true;
        expect(br.updateCapability.calledOnce).to.be.true;
        expect(br.upgradeConnection.calledOnce).to.be.true;
        expect(br.updateId.calledOnce).to.be.true;
        expect(br.login.calledOnce).to.be.true;
        expect(br.compressConnection.called).to.be.false;
        done();
      });
    });
    it('should timeout', done => {
      br.client.connect.returns(Promise.resolve());
      br.timeoutConnection = 1;
      br.connect().catch(err => {
        expect(err).to.exist;
        expect(br.client.connect.calledOnce).to.be.true;
        expect(br.client.close.calledOnce).to.be.true;
        expect(br.updateCapability.called).to.be.false;
        expect(br.upgradeConnection.called).to.be.false;
        expect(br.updateId.called).to.be.false;
        expect(br.login.called).to.be.false;
        expect(br.compressConnection.called).to.be.false;
        done();
      });
    });
  });
  describe('#close', () => {
    it('should force-close', () => {
      sinon.stub(br.client, 'close').returns(Promise.resolve());
      return br.close().then(() => {
        expect(br._state).to.equal(_client.STATE_LOGOUT);
        expect(br.client.close.calledOnce).to.be.true;
      });
    });
  });
  describe('#exec', () => {
    beforeEach(() => {
      sinon.stub(br, 'breakIdle');
    });
    it('should send string command', () => {
      sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({}));
      return br.exec('TEST').then(res => {
        expect(res).to.deep.equal({});
        expect(br.client.enqueueCommand.args[0][0]).to.equal('TEST');
      });
    });
    it('should update capability from response', () => {
      sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({
        capability: ['A', 'B']
      }));
      return br.exec('TEST').then(res => {
        expect(res).to.deep.equal({
          capability: ['A', 'B']
        });
        expect(br._capability).to.deep.equal(['A', 'B']);
      });
    });
  });
  describe('#enterIdle', () => {
    it('should periodically send NOOP if IDLE not supported', done => {
      sinon.stub(br, 'exec').callsFake(command => {
        expect(command).to.equal('NOOP');
        done();
      });
      br._capability = [];
      br._selectedMailbox = 'FOO';
      br.timeoutNoop = 1;
      br.enterIdle();
    });
    it('should periodically send NOOP if no mailbox selected', done => {
      sinon.stub(br, 'exec').callsFake(command => {
        expect(command).to.equal('NOOP');
        done();
      });
      br._capability = ['IDLE'];
      br._selectedMailbox = undefined;
      br.timeoutNoop = 1;
      br.enterIdle();
    });
    it('should break IDLE after timeout', done => {
      sinon.stub(br.client, 'enqueueCommand');
      sinon.stub(br.client.socket, 'send').callsFake(payload => {
        expect(br.client.enqueueCommand.args[0][0].command).to.equal('IDLE');
        expect([].slice.call(new Uint8Array(payload))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]);
        done();
      });
      br._capability = ['IDLE'];
      br._selectedMailbox = 'FOO';
      br.timeoutIdle = 1;
      br.enterIdle();
    });
  });
  describe('#breakIdle', () => {
    it('should send DONE to socket', () => {
      sinon.stub(br.client.socket, 'send');
      br._enteredIdle = 'IDLE';
      br.breakIdle();
      expect([].slice.call(new Uint8Array(br.client.socket.send.args[0][0]))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]);
    });
  });
  describe('#upgradeConnection', () => {
    it('should do nothing if already secured', () => {
      br.client.secureMode = true;
      br._capability = ['starttls'];
      return br.upgradeConnection();
    });
    it('should do nothing if STARTTLS not available', () => {
      br.client.secureMode = false;
      br._capability = [];
      return br.upgradeConnection();
    });
    it('should run STARTTLS', () => {
      sinon.stub(br.client, 'upgrade');
      sinon.stub(br, 'exec').withArgs('STARTTLS').returns(Promise.resolve());
      sinon.stub(br, 'updateCapability').returns(Promise.resolve());
      br._capability = ['STARTTLS'];
      return br.upgradeConnection().then(() => {
        expect(br.client.upgrade.callCount).to.equal(1);
        expect(br._capability.length).to.equal(0);
      });
    });
  });
  describe('#updateCapability', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should do nothing if capability is set', () => {
      br._capability = ['abc'];
      return br.updateCapability();
    });
    it('should run CAPABILITY if capability not set', () => {
      br.exec.returns(Promise.resolve());
      br._capability = [];
      return br.updateCapability().then(() => {
        expect(br.exec.args[0][0]).to.equal('CAPABILITY');
      });
    });
    it('should force run CAPABILITY', () => {
      br.exec.returns(Promise.resolve());
      br._capability = ['abc'];
      return br.updateCapability(true).then(() => {
        expect(br.exec.args[0][0]).to.equal('CAPABILITY');
      });
    });
    it('should do nothing if connection is not yet upgraded', () => {
      br._capability = [];
      br.client.secureMode = false;
      br._requireTLS = true;
      br.updateCapability();
    });
  });
  describe('#listNamespaces', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should run NAMESPACE if supported', () => {
      br.exec.returns(Promise.resolve({
        payload: {
          NAMESPACE: [{
            attributes: [[[{
              type: 'STRING',
              value: 'INBOX.'
            }, {
              type: 'STRING',
              value: '.'
            }]], null, null]
          }]
        }
      }));
      br._capability = ['NAMESPACE'];
      return br.listNamespaces().then(namespaces => {
        expect(namespaces).to.deep.equal({
          personal: [{
            prefix: 'INBOX.',
            delimiter: '.'
          }],
          users: false,
          shared: false
        });
        expect(br.exec.args[0][0]).to.equal('NAMESPACE');
        expect(br.exec.args[0][1]).to.equal('NAMESPACE');
      });
    });
    it('should do nothing if not supported', () => {
      br._capability = [];
      return br.listNamespaces().then(namespaces => {
        expect(namespaces).to.be.false;
        expect(br.exec.callCount).to.equal(0);
      });
    });
  });
  describe('#compressConnection', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
      sinon.stub(br.client, 'enableCompression');
    });
    it('should run COMPRESS=DEFLATE if supported', () => {
      br.exec.withArgs({
        command: 'COMPRESS',
        attributes: [{
          type: 'ATOM',
          value: 'DEFLATE'
        }]
      }).returns(Promise.resolve({}));
      br._enableCompression = true;
      br._capability = ['COMPRESS=DEFLATE'];
      return br.compressConnection().then(() => {
        expect(br.exec.callCount).to.equal(1);
        expect(br.client.enableCompression.callCount).to.equal(1);
      });
    });
    it('should do nothing if not supported', () => {
      br._capability = [];
      return br.compressConnection().then(() => {
        expect(br.exec.callCount).to.equal(0);
      });
    });
    it('should do nothing if not enabled', () => {
      br._enableCompression = false;
      br._capability = ['COMPRESS=DEFLATE'];
      return br.compressConnection().then(() => {
        expect(br.exec.callCount).to.equal(0);
      });
    });
  });
  describe('#login', () => {
    it('should call LOGIN', () => {
      sinon.stub(br, 'exec').returns(Promise.resolve({}));
      sinon.stub(br, 'updateCapability').returns(Promise.resolve(true));
      return br.login({
        user: 'u1',
        pass: 'p1'
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
        expect(br.exec.args[0][0]).to.deep.equal({
          command: 'login',
          attributes: [{
            type: 'STRING',
            value: 'u1'
          }, {
            type: 'STRING',
            value: 'p1',
            sensitive: true
          }]
        });
      });
    });
    it('should call XOAUTH2', () => {
      sinon.stub(br, 'exec').returns(Promise.resolve({}));
      sinon.stub(br, 'updateCapability').returns(Promise.resolve(true));
      br._capability = ['AUTH=XOAUTH2'];
      br.login({
        user: 'u1',
        xoauth2: 'abc'
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
        expect(br.exec.args[0][0]).to.deep.equal({
          command: 'AUTHENTICATE',
          attributes: [{
            type: 'ATOM',
            value: 'XOAUTH2'
          }, {
            type: 'ATOM',
            value: 'dXNlcj11MQFhdXRoPUJlYXJlciBhYmMBAQ==',
            sensitive: true
          }]
        });
      });
    });
  });
  describe('#updateId', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should not nothing if not supported', () => {
      br._capability = [];
      return br.updateId({
        a: 'b',
        c: 'd'
      }).then(() => {
        expect(br.serverId).to.be.false;
      });
    });
    it('should send NIL', () => {
      br.exec.withArgs({
        command: 'ID',
        attributes: [null]
      }).returns(Promise.resolve({
        payload: {
          ID: [{
            attributes: [null]
          }]
        }
      }));
      br._capability = ['ID'];
      return br.updateId(null).then(() => {
        expect(br.serverId).to.deep.equal({});
      });
    });
    it('should exhange ID values', () => {
      br.exec.withArgs({
        command: 'ID',
        attributes: [['ckey1', 'cval1', 'ckey2', 'cval2']]
      }).returns(Promise.resolve({
        payload: {
          ID: [{
            attributes: [[{
              value: 'skey1'
            }, {
              value: 'sval1'
            }, {
              value: 'skey2'
            }, {
              value: 'sval2'
            }]]
          }]
        }
      }));
      br._capability = ['ID'];
      return br.updateId({
        ckey1: 'cval1',
        ckey2: 'cval2'
      }).then(() => {
        expect(br.serverId).to.deep.equal({
          skey1: 'sval1',
          skey2: 'sval2'
        });
      });
    });
  });
  describe('#listMailboxes', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should call LIST and LSUB in sequence', () => {
      br.exec.withArgs({
        command: 'LIST',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LIST: [false]
        }
      }));
      br.exec.withArgs({
        command: 'LSUB',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LSUB: [false]
        }
      }));
      return br.listMailboxes().then(tree => {
        expect(tree).to.exist;
      });
    });
    it('should not die on NIL separators', () => {
      br.exec.withArgs({
        command: 'LIST',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LIST: [(0, _emailjsImapHandler.parser)((0, _common.toTypedArray)('* LIST (\\NoInferiors) NIL "INBOX"'))]
        }
      }));
      br.exec.withArgs({
        command: 'LSUB',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LSUB: [(0, _emailjsImapHandler.parser)((0, _common.toTypedArray)('* LSUB (\\NoInferiors) NIL "INBOX"'))]
        }
      }));
      return br.listMailboxes().then(tree => {
        expect(tree).to.exist;
      });
    });
  });
  describe('#createMailbox', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should call CREATE with a string payload', () => {
      // The spec allows unquoted ATOM-style syntax too, but for
      // simplicity we always generate a string even if it could be
      // expressed as an atom.
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['mailboxname']
      }).returns(Promise.resolve());
      return br.createMailbox('mailboxname').then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
    it('should call mutf7 encode the argument', () => {
      // From RFC 3501
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['~peter/mail/&U,BTFw-/&ZeVnLIqe-']
      }).returns(Promise.resolve());
      return br.createMailbox('~peter/mail/\u53f0\u5317/\u65e5\u672c\u8a9e').then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
    it('should treat an ALREADYEXISTS response as success', () => {
      var fakeErr = {
        code: 'ALREADYEXISTS'
      };
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['mailboxname']
      }).returns(Promise.reject(fakeErr));
      return br.createMailbox('mailboxname').then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
  });
  describe('#deleteMailbox', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should call DELETE with a string payload', () => {
      br.exec.withArgs({
        command: 'DELETE',
        attributes: ['mailboxname']
      }).returns(Promise.resolve());
      return br.deleteMailbox('mailboxname').then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
    it('should call mutf7 encode the argument', () => {
      // From RFC 3501
      br.exec.withArgs({
        command: 'DELETE',
        attributes: ['~peter/mail/&U,BTFw-/&ZeVnLIqe-']
      }).returns(Promise.resolve());
      return br.deleteMailbox('~peter/mail/\u53f0\u5317/\u65e5\u672c\u8a9e').then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
  });
  describe.skip('#listMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildFETCHCommand');
      sinon.stub(br, '_parseFETCH');
    });
    it('should call FETCH', () => {
      br.exec.returns(Promise.resolve('abc'));

      br._buildFETCHCommand.withArgs(['1:2', ['uid', 'flags'], {
        byUid: true
      }]).returns({});

      return br.listMessages('INBOX', '1:2', ['uid', 'flags'], {
        byUid: true
      }).then(() => {
        expect(br._buildFETCHCommand.callCount).to.equal(1);
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
      });
    });
  });
  describe.skip('#search', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildSEARCHCommand');
      sinon.stub(br, '_parseSEARCH');
    });
    it('should call SEARCH', () => {
      br.exec.returns(Promise.resolve('abc'));

      br._buildSEARCHCommand.withArgs({
        uid: 1
      }, {
        byUid: true
      }).returns({});

      return br.search('INBOX', {
        uid: 1
      }, {
        byUid: true
      }).then(() => {
        expect(br._buildSEARCHCommand.callCount).to.equal(1);
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseSEARCH.withArgs('abc').callCount).to.equal(1);
      });
    });
  });
  describe('#upload', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should call APPEND with custom flag', () => {
      br.exec.returns(Promise.resolve());
      return br.upload('mailbox', 'this is a message', {
        flags: ['\\$MyFlag']
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
    it('should call APPEND w/o flags', () => {
      br.exec.returns(Promise.resolve());
      return br.upload('mailbox', 'this is a message').then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
  });
  describe.skip('#setFlags', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildSTORECommand');
      sinon.stub(br, '_parseFETCH');
    });
    it('should call STORE', () => {
      br.exec.returns(Promise.resolve('abc'));

      br._buildSTORECommand.withArgs('1:2', 'FLAGS', ['\\Seen', '$MyFlag'], {
        byUid: true
      }).returns({});

      return br.setFlags('INBOX', '1:2', ['\\Seen', '$MyFlag'], {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
      });
    });
  });
  describe.skip('#store', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildSTORECommand');
      sinon.stub(br, '_parseFETCH');
    });
    it('should call STORE', () => {
      br.exec.returns(Promise.resolve('abc'));

      br._buildSTORECommand.withArgs('1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
        byUid: true
      }).returns({});

      return br.store('INBOX', '1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
        byUid: true
      }).then(() => {
        expect(br._buildSTORECommand.callCount).to.equal(1);
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
      });
    });
  });
  describe('#deleteMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'setFlags');
      sinon.stub(br, 'exec');
    });
    it('should call UID EXPUNGE', () => {
      br.exec.withArgs({
        command: 'UID EXPUNGE',
        attributes: [{
          type: 'sequence',
          value: '1:2'
        }]
      }).returns(Promise.resolve('abc'));
      br.setFlags.withArgs('INBOX', '1:2', {
        add: '\\Deleted'
      }).returns(Promise.resolve());
      br._capability = ['UIDPLUS'];
      return br.deleteMessages('INBOX', '1:2', {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
    it('should call EXPUNGE', () => {
      br.exec.withArgs('EXPUNGE').returns(Promise.resolve('abc'));
      br.setFlags.withArgs('INBOX', '1:2', {
        add: '\\Deleted'
      }).returns(Promise.resolve());
      br._capability = [];
      return br.deleteMessages('INBOX', '1:2', {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
  });
  describe('#copyMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should call COPY', () => {
      br.exec.withArgs({
        command: 'UID COPY',
        attributes: [{
          type: 'sequence',
          value: '1:2'
        }, {
          type: 'atom',
          value: '[Gmail]/Trash'
        }]
      }).returns(Promise.resolve({
        copyuid: ['1', '1:2', '4,3']
      }));
      return br.copyMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(response => {
        expect(response).to.deep.equal({
          srcSeqSet: '1:2',
          destSeqSet: '4,3'
        });
        expect(br.exec.callCount).to.equal(1);
      });
    });
  });
  describe('#moveMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec');
      sinon.stub(br, 'copyMessages');
      sinon.stub(br, 'deleteMessages');
    });
    it('should call MOVE if supported', () => {
      br.exec.withArgs({
        command: 'UID MOVE',
        attributes: [{
          type: 'sequence',
          value: '1:2'
        }, {
          type: 'atom',
          value: '[Gmail]/Trash'
        }]
      }, ['OK']).returns(Promise.resolve('abc'));
      br._capability = ['MOVE'];
      return br.moveMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
      });
    });
    it('should fallback to copy+expunge', () => {
      br.copyMessages.withArgs('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).returns(Promise.resolve());
      br.deleteMessages.withArgs('1:2', {
        byUid: true
      }).returns(Promise.resolve());
      br._capability = [];
      return br.moveMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(() => {
        expect(br.deleteMessages.callCount).to.equal(1);
      });
    });
  });
  describe('#_shouldSelectMailbox', () => {
    it('should return true when ctx is undefined', () => {
      expect(br._shouldSelectMailbox('path')).to.be.true;
    });
    it('should return true when a different path is queued', () => {
      sinon.stub(br.client, 'getPreviouslyQueued').returns({
        request: {
          command: 'SELECT',
          attributes: [{
            type: 'STRING',
            value: 'queued path'
          }]
        }
      });
      expect(br._shouldSelectMailbox('path', {})).to.be.true;
    });
    it('should return false when the same path is queued', () => {
      sinon.stub(br.client, 'getPreviouslyQueued').returns({
        request: {
          command: 'SELECT',
          attributes: [{
            type: 'STRING',
            value: 'queued path'
          }]
        }
      });
      expect(br._shouldSelectMailbox('queued path', {})).to.be.false;
    });
  });
  describe('#selectMailbox', () => {
    const path = '[Gmail]/Trash';
    beforeEach(() => {
      sinon.stub(br, 'exec');
    });
    it('should run SELECT', () => {
      br.exec.withArgs({
        command: 'SELECT',
        attributes: [{
          type: 'STRING',
          value: path
        }]
      }).returns(Promise.resolve({
        code: 'READ-WRITE'
      }));
      return br.selectMailbox(path).then(() => {
        expect(br.exec.callCount).to.equal(1);
        expect(br._state).to.equal(_client.STATE_SELECTED);
      });
    });
    it('should run SELECT with CONDSTORE', () => {
      br.exec.withArgs({
        command: 'SELECT',
        attributes: [{
          type: 'STRING',
          value: path
        }, [{
          type: 'ATOM',
          value: 'CONDSTORE'
        }]]
      }).returns(Promise.resolve({
        code: 'READ-WRITE'
      }));
      br._capability = ['CONDSTORE'];
      return br.selectMailbox(path, {
        condstore: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1);
        expect(br._state).to.equal(_client.STATE_SELECTED);
      });
    });
    describe('should emit onselectmailbox before selectMailbox is resolved', () => {
      beforeEach(() => {
        br.exec.returns(Promise.resolve({
          code: 'READ-WRITE'
        }));
      });
      it('when it returns a promise', () => {
        var promiseResolved = false;

        br.onselectmailbox = () => new Promise(resolve => {
          resolve();
          promiseResolved = true;
        });

        var onselectmailboxSpy = sinon.spy(br, 'onselectmailbox');
        return br.selectMailbox(path).then(() => {
          expect(onselectmailboxSpy.withArgs(path).callCount).to.equal(1);
          expect(promiseResolved).to.equal(true);
        });
      });
      it('when it does not return a promise', () => {
        br.onselectmailbox = () => {};

        var onselectmailboxSpy = sinon.spy(br, 'onselectmailbox');
        return br.selectMailbox(path).then(() => {
          expect(onselectmailboxSpy.withArgs(path).callCount).to.equal(1);
        });
      });
    });
    it('should emit onclosemailbox', () => {
      let called = false;
      br.exec.returns(Promise.resolve('abc')).returns(Promise.resolve({
        code: 'READ-WRITE'
      }));

      br.onclosemailbox = path => {
        expect(path).to.equal('yyy');
        called = true;
      };

      br._selectedMailbox = 'yyy';
      return br.selectMailbox(path).then(() => {
        expect(called).to.be.true;
      });
    });
  });
  describe('#hasCapability', () => {
    it('should detect existing capability', () => {
      br._capability = ['ZZZ'];
      expect(br.hasCapability('zzz')).to.be.true;
    });
    it('should detect non existing capability', () => {
      br._capability = ['ZZZ'];
      expect(br.hasCapability('ooo')).to.be.false;
      expect(br.hasCapability()).to.be.false;
    });
  });
  describe('#_untaggedOkHandler', () => {
    it('should update capability if present', () => {
      br._untaggedOkHandler({
        capability: ['abc']
      }, () => {});

      expect(br._capability).to.deep.equal(['abc']);
    });
  });
  describe('#_untaggedCapabilityHandler', () => {
    it('should update capability', () => {
      br._untaggedCapabilityHandler({
        attributes: [{
          value: 'abc'
        }]
      }, () => {});

      expect(br._capability).to.deep.equal(['ABC']);
    });
  });
  describe('#_untaggedExistsHandler', () => {
    it('should emit onupdate', () => {
      br.onupdate = sinon.stub();
      br._selectedMailbox = 'FOO';

      br._untaggedExistsHandler({
        nr: 123
      }, () => {});

      expect(br.onupdate.withArgs('FOO', 'exists', 123).callCount).to.equal(1);
    });
  });
  describe('#_untaggedExpungeHandler', () => {
    it('should emit onupdate', () => {
      br.onupdate = sinon.stub();
      br._selectedMailbox = 'FOO';

      br._untaggedExpungeHandler({
        nr: 123
      }, () => {});

      expect(br.onupdate.withArgs('FOO', 'expunge', 123).callCount).to.equal(1);
    });
  });
  describe.skip('#_untaggedFetchHandler', () => {
    it('should emit onupdate', () => {
      br.onupdate = sinon.stub();
      sinon.stub(br, '_parseFETCH').returns('abc');
      br._selectedMailbox = 'FOO';

      br._untaggedFetchHandler({
        nr: 123
      }, () => {});

      expect(br.onupdate.withArgs('FOO', 'fetch', 'abc').callCount).to.equal(1);
      expect(br._parseFETCH.args[0][0]).to.deep.equal({
        payload: {
          FETCH: [{
            nr: 123
          }]
        }
      });
    });
  });
  describe('#_changeState', () => {
    it('should set the state value', () => {
      br._changeState(12345);

      expect(br._state).to.equal(12345);
    });
    it('should emit onclosemailbox if mailbox was closed', () => {
      br.onclosemailbox = sinon.stub();
      br._state = _client.STATE_SELECTED;
      br._selectedMailbox = 'aaa';

      br._changeState(12345);

      expect(br._selectedMailbox).to.be.false;
      expect(br.onclosemailbox.withArgs('aaa').callCount).to.equal(1);
    });
  });
  describe('#_ensurePath', () => {
    it('should create the path if not present', () => {
      var tree = {
        children: []
      };
      expect(br._ensurePath(tree, 'hello/world', '/')).to.deep.equal({
        name: 'world',
        delimiter: '/',
        path: 'hello/world',
        children: []
      });
      expect(tree).to.deep.equal({
        children: [{
          name: 'hello',
          delimiter: '/',
          path: 'hello',
          children: [{
            name: 'world',
            delimiter: '/',
            path: 'hello/world',
            children: []
          }]
        }]
      });
    });
    it('should return existing path if possible', () => {
      var tree = {
        children: [{
          name: 'hello',
          delimiter: '/',
          path: 'hello',
          children: [{
            name: 'world',
            delimiter: '/',
            path: 'hello/world',
            children: [],
            abc: 123
          }]
        }]
      };
      expect(br._ensurePath(tree, 'hello/world', '/')).to.deep.equal({
        name: 'world',
        delimiter: '/',
        path: 'hello/world',
        children: [],
        abc: 123
      });
    });
    it('should handle case insensitive Inbox', () => {
      var tree = {
        children: []
      };
      expect(br._ensurePath(tree, 'Inbox/world', '/')).to.deep.equal({
        name: 'world',
        delimiter: '/',
        path: 'Inbox/world',
        children: []
      });
      expect(br._ensurePath(tree, 'INBOX/worlds', '/')).to.deep.equal({
        name: 'worlds',
        delimiter: '/',
        path: 'INBOX/worlds',
        children: []
      });
      expect(tree).to.deep.equal({
        children: [{
          name: 'Inbox',
          delimiter: '/',
          path: 'Inbox',
          children: [{
            name: 'world',
            delimiter: '/',
            path: 'Inbox/world',
            children: []
          }, {
            name: 'worlds',
            delimiter: '/',
            path: 'INBOX/worlds',
            children: []
          }]
        }]
      });
    });
  });
  describe('untagged updates', () => {
    it('should receive information about untagged exists', done => {
      br.client._connectionReady = true;
      br._selectedMailbox = 'FOO';

      br.onupdate = (path, type, value) => {
        expect(path).to.equal('FOO');
        expect(type).to.equal('exists');
        expect(value).to.equal(123);
        done();
      };

      br.client._onData({
        /* * 123 EXISTS\r\n */
        data: new Uint8Array([42, 32, 49, 50, 51, 32, 69, 88, 73, 83, 84, 83, 13, 10]).buffer
      });
    });
    it('should receive information about untagged expunge', done => {
      br.client._connectionReady = true;
      br._selectedMailbox = 'FOO';

      br.onupdate = (path, type, value) => {
        expect(path).to.equal('FOO');
        expect(type).to.equal('expunge');
        expect(value).to.equal(456);
        done();
      };

      br.client._onData({
        /* * 456 EXPUNGE\r\n */
        data: new Uint8Array([42, 32, 52, 53, 54, 32, 69, 88, 80, 85, 78, 71, 69, 13, 10]).buffer
      });
    });
    it('should receive information about untagged fetch', done => {
      br.client._connectionReady = true;
      br._selectedMailbox = 'FOO';

      br.onupdate = (path, type, value) => {
        expect(path).to.equal('FOO');
        expect(type).to.equal('fetch');
        expect(value).to.deep.equal({
          '#': 123,
          flags: ['\\Seen'],
          modseq: '4'
        });
        done();
      };

      br.client._onData({
        /* * 123 FETCH (FLAGS (\\Seen) MODSEQ (4))\r\n */
        data: new Uint8Array([42, 32, 49, 50, 51, 32, 70, 69, 84, 67, 72, 32, 40, 70, 76, 65, 71, 83, 32, 40, 92, 83, 101, 101, 110, 41, 32, 77, 79, 68, 83, 69, 81, 32, 40, 52, 41, 41, 13, 10]).buffer
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQtdW5pdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImJyIiwiYmVmb3JlRWFjaCIsImF1dGgiLCJ1c2VyIiwicGFzcyIsIkltYXBDbGllbnQiLCJsb2dMZXZlbCIsImNsaWVudCIsInNvY2tldCIsInNlbmQiLCJ1cGdyYWRlVG9TZWN1cmUiLCJpdCIsInNpbm9uIiwic3R1YiIsIl9hdXRoZW50aWNhdGVkIiwiX2VudGVyZWRJZGxlIiwiX29uSWRsZSIsImV4cGVjdCIsImVudGVySWRsZSIsImNhbGxDb3VudCIsInRvIiwiZXF1YWwiLCJjb25uZWN0IiwicmV0dXJucyIsIlByb21pc2UiLCJyZXNvbHZlIiwiZW5xdWV1ZUNvbW1hbmQiLCJjYXBhYmlsaXR5Iiwic2V0VGltZW91dCIsIm9ucmVhZHkiLCJvcGVuQ29ubmVjdGlvbiIsInRoZW4iLCJjYWxsZWRPbmNlIiwiYmUiLCJ0cnVlIiwiX2NhcGFiaWxpdHkiLCJsZW5ndGgiLCJ1cGRhdGVDYXBhYmlsaXR5IiwidXBncmFkZUNvbm5lY3Rpb24iLCJ1cGRhdGVJZCIsImxvZ2luIiwiY29tcHJlc3NDb25uZWN0aW9uIiwiZG9uZSIsInRocm93cyIsIkVycm9yIiwiY2F0Y2giLCJlcnIiLCJleGlzdCIsImNsb3NlIiwiY2FsbGVkIiwiZmFsc2UiLCJ0aW1lb3V0Q29ubmVjdGlvbiIsIl9zdGF0ZSIsIlNUQVRFX0xPR09VVCIsImV4ZWMiLCJyZXMiLCJkZWVwIiwiYXJncyIsImNhbGxzRmFrZSIsImNvbW1hbmQiLCJfc2VsZWN0ZWRNYWlsYm94IiwidGltZW91dE5vb3AiLCJ1bmRlZmluZWQiLCJwYXlsb2FkIiwic2xpY2UiLCJjYWxsIiwiVWludDhBcnJheSIsInRpbWVvdXRJZGxlIiwiYnJlYWtJZGxlIiwic2VjdXJlTW9kZSIsIndpdGhBcmdzIiwidXBncmFkZSIsIl9yZXF1aXJlVExTIiwiTkFNRVNQQUNFIiwiYXR0cmlidXRlcyIsInR5cGUiLCJ2YWx1ZSIsImxpc3ROYW1lc3BhY2VzIiwibmFtZXNwYWNlcyIsInBlcnNvbmFsIiwicHJlZml4IiwiZGVsaW1pdGVyIiwidXNlcnMiLCJzaGFyZWQiLCJfZW5hYmxlQ29tcHJlc3Npb24iLCJlbmFibGVDb21wcmVzc2lvbiIsInNlbnNpdGl2ZSIsInhvYXV0aDIiLCJhIiwiYyIsInNlcnZlcklkIiwiSUQiLCJja2V5MSIsImNrZXkyIiwic2tleTEiLCJza2V5MiIsIkxJU1QiLCJMU1VCIiwibGlzdE1haWxib3hlcyIsInRyZWUiLCJjcmVhdGVNYWlsYm94IiwiZmFrZUVyciIsImNvZGUiLCJyZWplY3QiLCJkZWxldGVNYWlsYm94Iiwic2tpcCIsIl9idWlsZEZFVENIQ29tbWFuZCIsImJ5VWlkIiwibGlzdE1lc3NhZ2VzIiwiX3BhcnNlRkVUQ0giLCJfYnVpbGRTRUFSQ0hDb21tYW5kIiwidWlkIiwic2VhcmNoIiwiX3BhcnNlU0VBUkNIIiwidXBsb2FkIiwiZmxhZ3MiLCJfYnVpbGRTVE9SRUNvbW1hbmQiLCJzZXRGbGFncyIsInN0b3JlIiwiYWRkIiwiZGVsZXRlTWVzc2FnZXMiLCJjb3B5dWlkIiwiY29weU1lc3NhZ2VzIiwicmVzcG9uc2UiLCJzcmNTZXFTZXQiLCJkZXN0U2VxU2V0IiwibW92ZU1lc3NhZ2VzIiwiX3Nob3VsZFNlbGVjdE1haWxib3giLCJyZXF1ZXN0IiwicGF0aCIsInNlbGVjdE1haWxib3giLCJTVEFURV9TRUxFQ1RFRCIsImNvbmRzdG9yZSIsInByb21pc2VSZXNvbHZlZCIsIm9uc2VsZWN0bWFpbGJveCIsIm9uc2VsZWN0bWFpbGJveFNweSIsInNweSIsIm9uY2xvc2VtYWlsYm94IiwiaGFzQ2FwYWJpbGl0eSIsIl91bnRhZ2dlZE9rSGFuZGxlciIsIl91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyIiwib251cGRhdGUiLCJfdW50YWdnZWRFeGlzdHNIYW5kbGVyIiwibnIiLCJfdW50YWdnZWRFeHB1bmdlSGFuZGxlciIsIl91bnRhZ2dlZEZldGNoSGFuZGxlciIsIkZFVENIIiwiX2NoYW5nZVN0YXRlIiwiY2hpbGRyZW4iLCJfZW5zdXJlUGF0aCIsIm5hbWUiLCJhYmMiLCJfY29ubmVjdGlvblJlYWR5IiwiX29uRGF0YSIsImRhdGEiLCJidWZmZXIiLCJtb2RzZXEiXSwibWFwcGluZ3MiOiI7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7OztBQUpBO0FBU0FBLFFBQVEsQ0FBQyx1QkFBRCxFQUEwQixNQUFNO0FBQ3RDLE1BQUlDLEVBQUo7QUFFQUMsRUFBQUEsVUFBVSxDQUFDLE1BQU07QUFDZixVQUFNQyxJQUFJLEdBQUc7QUFBRUMsTUFBQUEsSUFBSSxFQUFFLFVBQVI7QUFBb0JDLE1BQUFBLElBQUksRUFBRTtBQUExQixLQUFiO0FBQ0FKLElBQUFBLEVBQUUsR0FBRyxJQUFJSyxlQUFKLENBQWUsVUFBZixFQUEyQixJQUEzQixFQUFpQztBQUFFSCxNQUFBQSxJQUFGO0FBQVFJLE1BQUFBLFFBQVEsRUFBUkE7QUFBUixLQUFqQyxDQUFMO0FBQ0FOLElBQUFBLEVBQUUsQ0FBQ08sTUFBSCxDQUFVQyxNQUFWLEdBQW1CO0FBQ2pCQyxNQUFBQSxJQUFJLEVBQUUsTUFBTSxDQUFHLENBREU7QUFFakJDLE1BQUFBLGVBQWUsRUFBRSxNQUFNLENBQUc7QUFGVCxLQUFuQjtBQUlELEdBUFMsQ0FBVjtBQVNBWCxFQUFBQSxRQUFRLENBQUMsVUFBRCxFQUFhLE1BQU07QUFDekJZLElBQUFBLEVBQUUsQ0FBQyx1QkFBRCxFQUEwQixNQUFNO0FBQ2hDQyxNQUFBQSxLQUFLLENBQUNDLElBQU4sQ0FBV2IsRUFBWCxFQUFlLFdBQWY7QUFFQUEsTUFBQUEsRUFBRSxDQUFDYyxjQUFILEdBQW9CLElBQXBCO0FBQ0FkLE1BQUFBLEVBQUUsQ0FBQ2UsWUFBSCxHQUFrQixLQUFsQjs7QUFDQWYsTUFBQUEsRUFBRSxDQUFDZ0IsT0FBSDs7QUFFQUMsTUFBQUEsTUFBTSxDQUFDakIsRUFBRSxDQUFDa0IsU0FBSCxDQUFhQyxTQUFkLENBQU4sQ0FBK0JDLEVBQS9CLENBQWtDQyxLQUFsQyxDQUF3QyxDQUF4QztBQUNELEtBUkMsQ0FBRjtB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LEVBQXpFLEVBQTZFLEVBQTdFLEVBQWlGLEVBQWpGLEVBQXFGLEVBQXJGLEVBQXlGLEdBQXpGLEVBQThGLEdBQTlGLEVBQW1HLEdBQW5HLEVBQXdHLEVBQXhHLEVBQTRHLEVBQTVHLEVBQWdILEVBQWhILEVBQW9ILEVBQXBILEVBQXdILEVBQXhILEVBQTRILEVBQTVILEVBQWdJLEVBQWhJLEVBQW9JLEVBQXBJLEVBQXdJLEVBQXhJLEVBQTRJLEVBQTVJLEVBQWdKLEVBQWhKLEVBQW9KLEVBQXBKLEVBQXdKLEVBQXhKLEVBQTRKLEVBQTVKLEVBQWdLLEVBQWhLLENBQWYsRUFBb0x5RjtBQUYxSyxPQUFsQjtBQUlELEtBakJDLENBQUY7QUFrQkQsR0FqRE8sQ0FBUjtBQWtERCxDQTVzQ08sQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuXG5pbXBvcnQgSW1hcENsaWVudCwgeyBTVEFURV9TRUxFQ1RFRCwgU1RBVEVfTE9HT1VUIH0gZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQgeyBwYXJzZXIgfSBmcm9tICdlbWFpbGpzLWltYXAtaGFuZGxlcidcbmltcG9ydCB7XG4gIHRvVHlwZWRBcnJheSxcbiAgTE9HX0xFVkVMX05PTkUgYXMgbG9nTGV2ZWxcbn0gZnJvbSAnLi9jb21tb24nXG5cbmRlc2NyaWJlKCdicm93c2VyYm94IHVuaXQgdGVzdHMnLCAoKSA9PiB7XG4gIHZhciBiclxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGNvbnN0IGF1dGggPSB7IHVzZXI6ICdiYWxkcmlhbicsIHBhc3M6ICdzbGVlcGVyLmRlJyB9XG4gICAgYnIgPSBuZXcgSW1hcENsaWVudCgnc29tZWhvc3QnLCAxMjM0LCB7IGF1dGgsIGxvZ0xldmVsIH0pXG4gICAgYnIuY2xpZW50LnNvY2tldCA9IHtcbiAgICAgIHNlbmQ6ICgpID0+IHsgfSxcbiAgICAgIHVwZ3JhZGVUb1NlY3VyZTogKCkgPT4geyB9XG4gICAgfVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX29uSWRsZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGNhbGwgZW50ZXJJZGxlJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2VudGVySWRsZScpXG5cbiAgICAgIGJyLl9hdXRoZW50aWNhdGVkID0gdHJ1ZVxuICAgICAgYnIuX2VudGVyZWRJZGxlID0gZmFsc2VcbiAgICAgIGJyLl9vbklkbGUoKVxuXG4gICAgICBleHBlY3QoYnIuZW50ZXJJZGxlLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBub3QgY2FsbCBlbnRlcklkbGUnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZW50ZXJJZGxlJylcblxuICAgICAgYnIuX2VudGVyZWRJZGxlID0gdHJ1ZVxuICAgICAgYnIuX29uSWRsZSgpXG5cbiAgICAgIGV4cGVjdChici5lbnRlcklkbGUuY2FsbENvdW50KS50by5lcXVhbCgwKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNvcGVuQ29ubmVjdGlvbicsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnY29ubmVjdCcpXG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ2Nsb3NlJylcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnZW5xdWV1ZUNvbW1hbmQnKVxuICAgIH0pXG4gICAgaXQoJ3Nob3VsZCBvcGVuIGNvbm5lY3Rpb24nLCAoKSA9PiB7XG4gICAgICBici5jbGllbnQuY29ubmVjdC5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIuY2xpZW50LmVucXVldWVDb21tYW5kLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgY2FwYWJpbGl0eTogWydjYXBhMScsICdjYXBhMiddXG4gICAgICB9KSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gYnIuY2xpZW50Lm9ucmVhZHkoKSwgMClcbiAgICAgIHJldHVybiBici5vcGVuQ29ubmVjdGlvbigpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuY2xpZW50LmNvbm5lY3QuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgICAgICBleHBlY3QoYnIuY2xpZW50LmVucXVldWVDb21tYW5kLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLl9jYXBhYmlsaXR5Lmxlbmd0aCkudG8uZXF1YWwoMilcbiAgICAgICAgZXhwZWN0KGJyLl9jYXBhYmlsaXR5WzBdKS50by5lcXVhbCgnY2FwYTEnKVxuICAgICAgICBleHBlY3QoYnIuX2NhcGFiaWxpdHlbMV0pLnRvLmVxdWFsKCdjYXBhMicpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjb25uZWN0JywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQsICdjb25uZWN0JylcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnY2xvc2UnKVxuICAgICAgc2lub24uc3R1YihiciwgJ3VwZGF0ZUNhcGFiaWxpdHknKVxuICAgICAgc2lub24uc3R1YihiciwgJ3VwZ3JhZGVDb25uZWN0aW9uJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICd1cGRhdGVJZCcpXG4gICAgICBzaW5vbi5zdHViKGJyLCAnbG9naW4nKVxuICAgICAgc2lub24uc3R1YihiciwgJ2NvbXByZXNzQ29ubmVjdGlvbicpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY29ubmVjdCcsICgpID0+IHtcbiAgICAgIGJyLmNsaWVudC5jb25uZWN0LnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici51cGRhdGVDYXBhYmlsaXR5LnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici51cGdyYWRlQ29ubmVjdGlvbi5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIudXBkYXRlSWQucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcbiAgICAgIGJyLmxvZ2luLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici5jb21wcmVzc0Nvbm5lY3Rpb24ucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiBici5jbGllbnQub25yZWFkeSgpLCAwKVxuICAgICAgcmV0dXJuIGJyLmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5jb25uZWN0LmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLnVwZGF0ZUNhcGFiaWxpdHkuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgICAgICBleHBlY3QoYnIudXBncmFkZUNvbm5lY3Rpb24uY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgICAgICBleHBlY3QoYnIudXBkYXRlSWQuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgICAgICBleHBlY3QoYnIubG9naW4uY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgICAgICBleHBlY3QoYnIuY29tcHJlc3NDb25uZWN0aW9uLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZmFpbCB0byBsb2dpbicsIChkb25lKSA9PiB7XG4gICAgICBici5jbGllbnQuY29ubmVjdC5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIudXBkYXRlQ2FwYWJpbGl0eS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIudXBncmFkZUNvbm5lY3Rpb24ucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcbiAgICAgIGJyLnVwZGF0ZUlkLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici5sb2dpbi50aHJvd3MobmV3IEVycm9yKCkpXG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gYnIuY2xpZW50Lm9ucmVhZHkoKSwgMClcbiAgICAgIGJyLmNvbm5lY3QoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG5cbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5jb25uZWN0LmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5jbG9zZS5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICAgIGV4cGVjdChici51cGRhdGVDYXBhYmlsaXR5LmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLnVwZ3JhZGVDb25uZWN0aW9uLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLnVwZGF0ZUlkLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLmxvZ2luLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcblxuICAgICAgICBleHBlY3QoYnIuY29tcHJlc3NDb25uZWN0aW9uLmNhbGxlZCkudG8uYmUuZmFsc2VcblxuICAgICAgICBkb25lKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgdGltZW91dCcsIChkb25lKSA9PiB7XG4gICAgICBici5jbGllbnQuY29ubmVjdC5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIudGltZW91dENvbm5lY3Rpb24gPSAxXG5cbiAgICAgIGJyLmNvbm5lY3QoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG5cbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5jb25uZWN0LmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5jbG9zZS5jYWxsZWRPbmNlKS50by5iZS50cnVlXG5cbiAgICAgICAgZXhwZWN0KGJyLnVwZGF0ZUNhcGFiaWxpdHkuY2FsbGVkKS50by5iZS5mYWxzZVxuICAgICAgICBleHBlY3QoYnIudXBncmFkZUNvbm5lY3Rpb24uY2FsbGVkKS50by5iZS5mYWxzZVxuICAgICAgICBleHBlY3QoYnIudXBkYXRlSWQuY2FsbGVkKS50by5iZS5mYWxzZVxuICAgICAgICBleHBlY3QoYnIubG9naW4uY2FsbGVkKS50by5iZS5mYWxzZVxuICAgICAgICBleHBlY3QoYnIuY29tcHJlc3NDb25uZWN0aW9uLmNhbGxlZCkudG8uYmUuZmFsc2VcblxuICAgICAgICBkb25lKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2Nsb3NlJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZm9yY2UtY2xvc2UnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ2Nsb3NlJykucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcblxuICAgICAgcmV0dXJuIGJyLmNsb3NlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5fc3RhdGUpLnRvLmVxdWFsKFNUQVRFX0xPR09VVClcbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5jbG9zZS5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNleGVjJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2JyZWFrSWRsZScpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgc2VuZCBzdHJpbmcgY29tbWFuZCcsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnZW5xdWV1ZUNvbW1hbmQnKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh7fSkpXG4gICAgICByZXR1cm4gYnIuZXhlYygnVEVTVCcpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBleHBlY3QocmVzKS50by5kZWVwLmVxdWFsKHt9KVxuICAgICAgICBleHBlY3QoYnIuY2xpZW50LmVucXVldWVDb21tYW5kLmFyZ3NbMF1bMF0pLnRvLmVxdWFsKCdURVNUJylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgdXBkYXRlIGNhcGFiaWxpdHkgZnJvbSByZXNwb25zZScsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnZW5xdWV1ZUNvbW1hbmQnKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIGNhcGFiaWxpdHk6IFsnQScsICdCJ11cbiAgICAgIH0pKVxuICAgICAgcmV0dXJuIGJyLmV4ZWMoJ1RFU1QnKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlcykudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgICAgY2FwYWJpbGl0eTogWydBJywgJ0InXVxuICAgICAgICB9KVxuICAgICAgICBleHBlY3QoYnIuX2NhcGFiaWxpdHkpLnRvLmRlZXAuZXF1YWwoWydBJywgJ0InXSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2VudGVySWRsZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHBlcmlvZGljYWxseSBzZW5kIE5PT1AgaWYgSURMRSBub3Qgc3VwcG9ydGVkJywgKGRvbmUpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJykuY2FsbHNGYWtlKChjb21tYW5kKSA9PiB7XG4gICAgICAgIGV4cGVjdChjb21tYW5kKS50by5lcXVhbCgnTk9PUCcpXG5cbiAgICAgICAgZG9uZSgpXG4gICAgICB9KVxuXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFtdXG4gICAgICBici5fc2VsZWN0ZWRNYWlsYm94ID0gJ0ZPTydcbiAgICAgIGJyLnRpbWVvdXROb29wID0gMVxuICAgICAgYnIuZW50ZXJJZGxlKClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwZXJpb2RpY2FsbHkgc2VuZCBOT09QIGlmIG5vIG1haWxib3ggc2VsZWN0ZWQnLCAoZG9uZSkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKS5jYWxsc0Zha2UoKGNvbW1hbmQpID0+IHtcbiAgICAgICAgZXhwZWN0KGNvbW1hbmQpLnRvLmVxdWFsKCdOT09QJylcblxuICAgICAgICBkb25lKClcbiAgICAgIH0pXG5cbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydJRExFJ11cbiAgICAgIGJyLl9zZWxlY3RlZE1haWxib3ggPSB1bmRlZmluZWRcbiAgICAgIGJyLnRpbWVvdXROb29wID0gMVxuICAgICAgYnIuZW50ZXJJZGxlKClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBicmVhayBJRExFIGFmdGVyIHRpbWVvdXQnLCAoZG9uZSkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQsICdlbnF1ZXVlQ29tbWFuZCcpXG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudC5zb2NrZXQsICdzZW5kJykuY2FsbHNGYWtlKChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5jbGllbnQuZW5xdWV1ZUNvbW1hbmQuYXJnc1swXVswXS5jb21tYW5kKS50by5lcXVhbCgnSURMRScpXG4gICAgICAgIGV4cGVjdChbXS5zbGljZS5jYWxsKG5ldyBVaW50OEFycmF5KHBheWxvYWQpKSkudG8uZGVlcC5lcXVhbChbMHg0NCwgMHg0ZiwgMHg0ZSwgMHg0NSwgMHgwZCwgMHgwYV0pXG5cbiAgICAgICAgZG9uZSgpXG4gICAgICB9KVxuXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnSURMRSddXG4gICAgICBici5fc2VsZWN0ZWRNYWlsYm94ID0gJ0ZPTydcbiAgICAgIGJyLnRpbWVvdXRJZGxlID0gMVxuICAgICAgYnIuZW50ZXJJZGxlKClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjYnJlYWtJZGxlJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgc2VuZCBET05FIHRvIHNvY2tldCcsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LnNvY2tldCwgJ3NlbmQnKVxuXG4gICAgICBici5fZW50ZXJlZElkbGUgPSAnSURMRSdcbiAgICAgIGJyLmJyZWFrSWRsZSgpXG4gICAgICBleHBlY3QoW10uc2xpY2UuY2FsbChuZXcgVWludDhBcnJheShici5jbGllbnQuc29ja2V0LnNlbmQuYXJnc1swXVswXSkpKS50by5kZWVwLmVxdWFsKFsweDQ0LCAweDRmLCAweDRlLCAweDQ1LCAweDBkLCAweDBhXSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjdXBncmFkZUNvbm5lY3Rpb24nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBkbyBub3RoaW5nIGlmIGFscmVhZHkgc2VjdXJlZCcsICgpID0+IHtcbiAgICAgIGJyLmNsaWVudC5zZWN1cmVNb2RlID0gdHJ1ZVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ3N0YXJ0dGxzJ11cbiAgICAgIHJldHVybiBici51cGdyYWRlQ29ubmVjdGlvbigpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZG8gbm90aGluZyBpZiBTVEFSVFRMUyBub3QgYXZhaWxhYmxlJywgKCkgPT4ge1xuICAgICAgYnIuY2xpZW50LnNlY3VyZU1vZGUgPSBmYWxzZVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbXVxuICAgICAgcmV0dXJuIGJyLnVwZ3JhZGVDb25uZWN0aW9uKClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBydW4gU1RBUlRUTFMnLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ3VwZ3JhZGUnKVxuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKS53aXRoQXJncygnU1RBUlRUTFMnKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgc2lub24uc3R1YihiciwgJ3VwZGF0ZUNhcGFiaWxpdHknKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnU1RBUlRUTFMnXVxuXG4gICAgICByZXR1cm4gYnIudXBncmFkZUNvbm5lY3Rpb24oKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC51cGdyYWRlLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLl9jYXBhYmlsaXR5Lmxlbmd0aCkudG8uZXF1YWwoMClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI3VwZGF0ZUNhcGFiaWxpdHknLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZG8gbm90aGluZyBpZiBjYXBhYmlsaXR5IGlzIHNldCcsICgpID0+IHtcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydhYmMnXVxuICAgICAgcmV0dXJuIGJyLnVwZGF0ZUNhcGFiaWxpdHkoKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJ1biBDQVBBQklMSVRZIGlmIGNhcGFiaWxpdHkgbm90IHNldCcsICgpID0+IHtcbiAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcblxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbXVxuXG4gICAgICByZXR1cm4gYnIudXBkYXRlQ2FwYWJpbGl0eSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5hcmdzWzBdWzBdKS50by5lcXVhbCgnQ0FQQUJJTElUWScpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZvcmNlIHJ1biBDQVBBQklMSVRZJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ2FiYyddXG5cbiAgICAgIHJldHVybiBici51cGRhdGVDYXBhYmlsaXR5KHRydWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5hcmdzWzBdWzBdKS50by5lcXVhbCgnQ0FQQUJJTElUWScpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGRvIG5vdGhpbmcgaWYgY29ubmVjdGlvbiBpcyBub3QgeWV0IHVwZ3JhZGVkJywgKCkgPT4ge1xuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbXVxuICAgICAgYnIuY2xpZW50LnNlY3VyZU1vZGUgPSBmYWxzZVxuICAgICAgYnIuX3JlcXVpcmVUTFMgPSB0cnVlXG5cbiAgICAgIGJyLnVwZGF0ZUNhcGFiaWxpdHkoKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNsaXN0TmFtZXNwYWNlcycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBydW4gTkFNRVNQQUNFIGlmIHN1cHBvcnRlZCcsICgpID0+IHtcbiAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgTkFNRVNQQUNFOiBbe1xuICAgICAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICdJTkJPWC4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJy4nXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgXSwgbnVsbCwgbnVsbFxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pKVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ05BTUVTUEFDRSddXG5cbiAgICAgIHJldHVybiBici5saXN0TmFtZXNwYWNlcygpLnRoZW4oKG5hbWVzcGFjZXMpID0+IHtcbiAgICAgICAgZXhwZWN0KG5hbWVzcGFjZXMpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICAgIHBlcnNvbmFsOiBbe1xuICAgICAgICAgICAgcHJlZml4OiAnSU5CT1guJyxcbiAgICAgICAgICAgIGRlbGltaXRlcjogJy4nXG4gICAgICAgICAgfV0sXG4gICAgICAgICAgdXNlcnM6IGZhbHNlLFxuICAgICAgICAgIHNoYXJlZDogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuYXJnc1swXVswXSkudG8uZXF1YWwoJ05BTUVTUEFDRScpXG4gICAgICAgIGV4cGVjdChici5leGVjLmFyZ3NbMF1bMV0pLnRvLmVxdWFsKCdOQU1FU1BBQ0UnKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBkbyBub3RoaW5nIGlmIG5vdCBzdXBwb3J0ZWQnLCAoKSA9PiB7XG4gICAgICBici5fY2FwYWJpbGl0eSA9IFtdXG4gICAgICByZXR1cm4gYnIubGlzdE5hbWVzcGFjZXMoKS50aGVuKChuYW1lc3BhY2VzKSA9PiB7XG4gICAgICAgIGV4cGVjdChuYW1lc3BhY2VzKS50by5iZS5mYWxzZVxuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjb21wcmVzc0Nvbm5lY3Rpb24nLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ2VuYWJsZUNvbXByZXNzaW9uJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBydW4gQ09NUFJFU1M9REVGTEFURSBpZiBzdXBwb3J0ZWQnLCAoKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ0NPTVBSRVNTJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgdmFsdWU6ICdERUZMQVRFJ1xuICAgICAgICB9XVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe30pKVxuXG4gICAgICBici5fZW5hYmxlQ29tcHJlc3Npb24gPSB0cnVlXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnQ09NUFJFU1M9REVGTEFURSddXG4gICAgICByZXR1cm4gYnIuY29tcHJlc3NDb25uZWN0aW9uKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5lbmFibGVDb21wcmVzc2lvbi5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGRvIG5vdGhpbmcgaWYgbm90IHN1cHBvcnRlZCcsICgpID0+IHtcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gW11cblxuICAgICAgcmV0dXJuIGJyLmNvbXByZXNzQ29ubmVjdGlvbigpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGRvIG5vdGhpbmcgaWYgbm90IGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICBici5fZW5hYmxlQ29tcHJlc3Npb24gPSBmYWxzZVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ0NPTVBSRVNTPURFRkxBVEUnXVxuXG4gICAgICByZXR1cm4gYnIuY29tcHJlc3NDb25uZWN0aW9uKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2xvZ2luJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgY2FsbCBMT0dJTicsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJykucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe30pKVxuICAgICAgc2lub24uc3R1YihiciwgJ3VwZGF0ZUNhcGFiaWxpdHknKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh0cnVlKSlcblxuICAgICAgcmV0dXJuIGJyLmxvZ2luKHtcbiAgICAgICAgdXNlcjogJ3UxJyxcbiAgICAgICAgcGFzczogJ3AxJ1xuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuYXJnc1swXVswXSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgICAgY29tbWFuZDogJ2xvZ2luJyxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ3UxJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgICAgdmFsdWU6ICdwMScsXG4gICAgICAgICAgICBzZW5zaXRpdmU6IHRydWVcbiAgICAgICAgICB9XVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIFhPQVVUSDInLCAoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHt9KSlcbiAgICAgIHNpbm9uLnN0dWIoYnIsICd1cGRhdGVDYXBhYmlsaXR5JykucmV0dXJucyhQcm9taXNlLnJlc29sdmUodHJ1ZSkpXG5cbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydBVVRIPVhPQVVUSDInXVxuICAgICAgYnIubG9naW4oe1xuICAgICAgICB1c2VyOiAndTEnLFxuICAgICAgICB4b2F1dGgyOiAnYWJjJ1xuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuYXJnc1swXVswXSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgICAgY29tbWFuZDogJ0FVVEhFTlRJQ0FURScsXG4gICAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgIHZhbHVlOiAnWE9BVVRIMidcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICB2YWx1ZTogJ2RYTmxjajExTVFGaGRYUm9QVUpsWVhKbGNpQmhZbU1CQVE9PScsXG4gICAgICAgICAgICBzZW5zaXRpdmU6IHRydWVcbiAgICAgICAgICB9XVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjdXBkYXRlSWQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgbm90IG5vdGhpbmcgaWYgbm90IHN1cHBvcnRlZCcsICgpID0+IHtcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gW11cblxuICAgICAgcmV0dXJuIGJyLnVwZGF0ZUlkKHtcbiAgICAgICAgYTogJ2InLFxuICAgICAgICBjOiAnZCdcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuc2VydmVySWQpLnRvLmJlLmZhbHNlXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHNlbmQgTklMJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdJRCcsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICBudWxsXG4gICAgICAgIF1cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIElEOiBbe1xuICAgICAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfSkpXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnSUQnXVxuXG4gICAgICByZXR1cm4gYnIudXBkYXRlSWQobnVsbCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5zZXJ2ZXJJZCkudG8uZGVlcC5lcXVhbCh7fSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZXhoYW5nZSBJRCB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ0lEJyxcbiAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgIFsnY2tleTEnLCAnY3ZhbDEnLCAnY2tleTInLCAnY3ZhbDInXVxuICAgICAgICBdXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBJRDogW3tcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ3NrZXkxJ1xuICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6ICdzdmFsMSdcbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnc2tleTInXG4gICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ3N2YWwyJ1xuICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pKVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ0lEJ11cblxuICAgICAgcmV0dXJuIGJyLnVwZGF0ZUlkKHtcbiAgICAgICAgY2tleTE6ICdjdmFsMScsXG4gICAgICAgIGNrZXkyOiAnY3ZhbDInXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLnNlcnZlcklkKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgICBza2V5MTogJ3N2YWwxJyxcbiAgICAgICAgICBza2V5MjogJ3N2YWwyJ1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjbGlzdE1haWxib3hlcycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIExJU1QgYW5kIExTVUIgaW4gc2VxdWVuY2UnLCAoKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ0xJU1QnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbJycsICcqJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIExJU1Q6IFtmYWxzZV1cbiAgICAgICAgfVxuICAgICAgfSkpXG5cbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnTFNVQicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFsnJywgJyonXVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgTFNVQjogW2ZhbHNlXVxuICAgICAgICB9XG4gICAgICB9KSlcblxuICAgICAgcmV0dXJuIGJyLmxpc3RNYWlsYm94ZXMoKS50aGVuKCh0cmVlKSA9PiB7XG4gICAgICAgIGV4cGVjdCh0cmVlKS50by5leGlzdFxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBub3QgZGllIG9uIE5JTCBzZXBhcmF0b3JzJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdMSVNUJyxcbiAgICAgICAgYXR0cmlidXRlczogWycnLCAnKiddXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBMSVNUOiBbXG4gICAgICAgICAgICBwYXJzZXIodG9UeXBlZEFycmF5KCcqIExJU1QgKFxcXFxOb0luZmVyaW9ycykgTklMIFwiSU5CT1hcIicpKVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSkpXG5cbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnTFNVQicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFsnJywgJyonXVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgTFNVQjogW1xuICAgICAgICAgICAgcGFyc2VyKHRvVHlwZWRBcnJheSgnKiBMU1VCIChcXFxcTm9JbmZlcmlvcnMpIE5JTCBcIklOQk9YXCInKSlcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH0pKVxuXG4gICAgICByZXR1cm4gYnIubGlzdE1haWxib3hlcygpLnRoZW4oKHRyZWUpID0+IHtcbiAgICAgICAgZXhwZWN0KHRyZWUpLnRvLmV4aXN0XG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjcmVhdGVNYWlsYm94JywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgQ1JFQVRFIHdpdGggYSBzdHJpbmcgcGF5bG9hZCcsICgpID0+IHtcbiAgICAgIC8vIFRoZSBzcGVjIGFsbG93cyB1bnF1b3RlZCBBVE9NLXN0eWxlIHN5bnRheCB0b28sIGJ1dCBmb3JcbiAgICAgIC8vIHNpbXBsaWNpdHkgd2UgYWx3YXlzIGdlbmVyYXRlIGEgc3RyaW5nIGV2ZW4gaWYgaXQgY291bGQgYmVcbiAgICAgIC8vIGV4cHJlc3NlZCBhcyBhbiBhdG9tLlxuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdDUkVBVEUnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbJ21haWxib3huYW1lJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIHJldHVybiBici5jcmVhdGVNYWlsYm94KCdtYWlsYm94bmFtZScpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgbXV0ZjcgZW5jb2RlIHRoZSBhcmd1bWVudCcsICgpID0+IHtcbiAgICAgIC8vIEZyb20gUkZDIDM1MDFcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnQ1JFQVRFJyxcbiAgICAgICAgYXR0cmlidXRlczogWyd+cGV0ZXIvbWFpbC8mVSxCVEZ3LS8mWmVWbkxJcWUtJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIHJldHVybiBici5jcmVhdGVNYWlsYm94KCd+cGV0ZXIvbWFpbC9cXHU1M2YwXFx1NTMxNy9cXHU2NWU1XFx1NjcyY1xcdThhOWUnKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCB0cmVhdCBhbiBBTFJFQURZRVhJU1RTIHJlc3BvbnNlIGFzIHN1Y2Nlc3MnLCAoKSA9PiB7XG4gICAgICB2YXIgZmFrZUVyciA9IHtcbiAgICAgICAgY29kZTogJ0FMUkVBRFlFWElTVFMnXG4gICAgICB9XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ0NSRUFURScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFsnbWFpbGJveG5hbWUnXVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlamVjdChmYWtlRXJyKSlcblxuICAgICAgcmV0dXJuIGJyLmNyZWF0ZU1haWxib3goJ21haWxib3huYW1lJykudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2RlbGV0ZU1haWxib3gnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBERUxFVEUgd2l0aCBhIHN0cmluZyBwYXlsb2FkJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdERUxFVEUnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbJ21haWxib3huYW1lJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIHJldHVybiBici5kZWxldGVNYWlsYm94KCdtYWlsYm94bmFtZScpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgbXV0ZjcgZW5jb2RlIHRoZSBhcmd1bWVudCcsICgpID0+IHtcbiAgICAgIC8vIEZyb20gUkZDIDM1MDFcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnREVMRVRFJyxcbiAgICAgICAgYXR0cmlidXRlczogWyd+cGV0ZXIvbWFpbC8mVSxCVEZ3LS8mWmVWbkxJcWUtJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIHJldHVybiBici5kZWxldGVNYWlsYm94KCd+cGV0ZXIvbWFpbC9cXHU1M2YwXFx1NTMxNy9cXHU2NWU1XFx1NjcyY1xcdThhOWUnKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlLnNraXAoJyNsaXN0TWVzc2FnZXMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgICBzaW5vbi5zdHViKGJyLCAnX2J1aWxkRkVUQ0hDb21tYW5kJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfcGFyc2VGRVRDSCcpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBGRVRDSCcsICgpID0+IHtcbiAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoJ2FiYycpKVxuICAgICAgYnIuX2J1aWxkRkVUQ0hDb21tYW5kLndpdGhBcmdzKFsnMToyJywgWyd1aWQnLCAnZmxhZ3MnXSwge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfV0pLnJldHVybnMoe30pXG5cbiAgICAgIHJldHVybiBici5saXN0TWVzc2FnZXMoJ0lOQk9YJywgJzE6MicsIFsndWlkJywgJ2ZsYWdzJ10sIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuX2J1aWxkRkVUQ0hDb21tYW5kLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLl9wYXJzZUZFVENILndpdGhBcmdzKCdhYmMnKS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUuc2tpcCgnI3NlYXJjaCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfYnVpbGRTRUFSQ0hDb21tYW5kJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfcGFyc2VTRUFSQ0gnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgU0VBUkNIJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG4gICAgICBici5fYnVpbGRTRUFSQ0hDb21tYW5kLndpdGhBcmdzKHtcbiAgICAgICAgdWlkOiAxXG4gICAgICB9LCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS5yZXR1cm5zKHt9KVxuXG4gICAgICByZXR1cm4gYnIuc2VhcmNoKCdJTkJPWCcsIHtcbiAgICAgICAgdWlkOiAxXG4gICAgICB9LCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLl9idWlsZFNFQVJDSENvbW1hbmQuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChici5fcGFyc2VTRUFSQ0gud2l0aEFyZ3MoJ2FiYycpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI3VwbG9hZCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIEFQUEVORCB3aXRoIGN1c3RvbSBmbGFnJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICByZXR1cm4gYnIudXBsb2FkKCdtYWlsYm94JywgJ3RoaXMgaXMgYSBtZXNzYWdlJywge1xuICAgICAgICBmbGFnczogWydcXFxcJE15RmxhZyddXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIEFQUEVORCB3L28gZmxhZ3MnLCAoKSA9PiB7XG4gICAgICBici5leGVjLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIHJldHVybiBici51cGxvYWQoJ21haWxib3gnLCAndGhpcyBpcyBhIG1lc3NhZ2UnKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlLnNraXAoJyNzZXRGbGFncycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfYnVpbGRTVE9SRUNvbW1hbmQnKVxuICAgICAgc2lub24uc3R1YihiciwgJ19wYXJzZUZFVENIJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIFNUT1JFJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG4gICAgICBici5fYnVpbGRTVE9SRUNvbW1hbmQud2l0aEFyZ3MoJzE6MicsICdGTEFHUycsIFsnXFxcXFNlZW4nLCAnJE15RmxhZyddLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS5yZXR1cm5zKHt9KVxuXG4gICAgICByZXR1cm4gYnIuc2V0RmxhZ3MoJ0lOQk9YJywgJzE6MicsIFsnXFxcXFNlZW4nLCAnJE15RmxhZyddLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0gud2l0aEFyZ3MoJ2FiYycpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZS5za2lwKCcjc3RvcmUnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgICBzaW5vbi5zdHViKGJyLCAnX2J1aWxkU1RPUkVDb21tYW5kJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfcGFyc2VGRVRDSCcpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBTVE9SRScsICgpID0+IHtcbiAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoJ2FiYycpKVxuICAgICAgYnIuX2J1aWxkU1RPUkVDb21tYW5kLndpdGhBcmdzKCcxOjInLCAnK1gtR00tTEFCRUxTJywgWydcXFxcU2VudCcsICdcXFxcSnVuayddLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS5yZXR1cm5zKHt9KVxuXG4gICAgICByZXR1cm4gYnIuc3RvcmUoJ0lOQk9YJywgJzE6MicsICcrWC1HTS1MQUJFTFMnLCBbJ1xcXFxTZW50JywgJ1xcXFxKdW5rJ10sIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuX2J1aWxkU1RPUkVDb21tYW5kLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0gud2l0aEFyZ3MoJ2FiYycpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2RlbGV0ZU1lc3NhZ2VzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ3NldEZsYWdzJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIFVJRCBFWFBVTkdFJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdVSUQgRVhQVU5HRScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ3NlcXVlbmNlJyxcbiAgICAgICAgICB2YWx1ZTogJzE6MidcbiAgICAgICAgfV1cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCdhYmMnKSlcbiAgICAgIGJyLnNldEZsYWdzLndpdGhBcmdzKCdJTkJPWCcsICcxOjInLCB7XG4gICAgICAgIGFkZDogJ1xcXFxEZWxldGVkJ1xuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcblxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ1VJRFBMVVMnXVxuICAgICAgcmV0dXJuIGJyLmRlbGV0ZU1lc3NhZ2VzKCdJTkJPWCcsICcxOjInLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIEVYUFVOR0UnLCAoKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKCdFWFBVTkdFJykucmV0dXJucyhQcm9taXNlLnJlc29sdmUoJ2FiYycpKVxuICAgICAgYnIuc2V0RmxhZ3Mud2l0aEFyZ3MoJ0lOQk9YJywgJzE6MicsIHtcbiAgICAgICAgYWRkOiAnXFxcXERlbGV0ZWQnXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFtdXG4gICAgICByZXR1cm4gYnIuZGVsZXRlTWVzc2FnZXMoJ0lOQk9YJywgJzE6MicsIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjb3B5TWVzc2FnZXMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBDT1BZJywgKCkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdVSUQgQ09QWScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ3NlcXVlbmNlJyxcbiAgICAgICAgICB2YWx1ZTogJzE6MidcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdhdG9tJyxcbiAgICAgICAgICB2YWx1ZTogJ1tHbWFpbF0vVHJhc2gnXG4gICAgICAgIH1dXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIGNvcHl1aWQ6IFsnMScsICcxOjInLCAnNCwzJ11cbiAgICAgIH0pKVxuXG4gICAgICByZXR1cm4gYnIuY29weU1lc3NhZ2VzKCdJTkJPWCcsICcxOjInLCAnW0dtYWlsXS9UcmFzaCcsIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgICAgc3JjU2VxU2V0OiAnMToyJyxcbiAgICAgICAgICBkZXN0U2VxU2V0OiAnNCwzJ1xuICAgICAgICB9KVxuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNtb3ZlTWVzc2FnZXMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgICBzaW5vbi5zdHViKGJyLCAnY29weU1lc3NhZ2VzJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdkZWxldGVNZXNzYWdlcycpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBNT1ZFIGlmIHN1cHBvcnRlZCcsICgpID0+IHtcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnVUlEIE1PVkUnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdzZXF1ZW5jZScsXG4gICAgICAgICAgdmFsdWU6ICcxOjInXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnYXRvbScsXG4gICAgICAgICAgdmFsdWU6ICdbR21haWxdL1RyYXNoJ1xuICAgICAgICB9XVxuICAgICAgfSwgWydPSyddKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG5cbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydNT1ZFJ11cbiAgICAgIHJldHVybiBici5tb3ZlTWVzc2FnZXMoJ0lOQk9YJywgJzE6MicsICdbR21haWxdL1RyYXNoJywge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZmFsbGJhY2sgdG8gY29weStleHB1bmdlJywgKCkgPT4ge1xuICAgICAgYnIuY29weU1lc3NhZ2VzLndpdGhBcmdzKCdJTkJPWCcsICcxOjInLCAnW0dtYWlsXS9UcmFzaCcsIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici5kZWxldGVNZXNzYWdlcy53aXRoQXJncygnMToyJywge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcblxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbXVxuICAgICAgcmV0dXJuIGJyLm1vdmVNZXNzYWdlcygnSU5CT1gnLCAnMToyJywgJ1tHbWFpbF0vVHJhc2gnLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmRlbGV0ZU1lc3NhZ2VzLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19zaG91bGRTZWxlY3RNYWlsYm94JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgd2hlbiBjdHggaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9zaG91bGRTZWxlY3RNYWlsYm94KCdwYXRoJykpLnRvLmJlLnRydWVcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIGEgZGlmZmVyZW50IHBhdGggaXMgcXVldWVkJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQsICdnZXRQcmV2aW91c2x5UXVldWVkJykucmV0dXJucyh7XG4gICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICBjb21tYW5kOiAnU0VMRUNUJyxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ3F1ZXVlZCBwYXRoJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChici5fc2hvdWxkU2VsZWN0TWFpbGJveCgncGF0aCcsIHt9KSkudG8uYmUudHJ1ZVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSB3aGVuIHRoZSBzYW1lIHBhdGggaXMgcXVldWVkJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQsICdnZXRQcmV2aW91c2x5UXVldWVkJykucmV0dXJucyh7XG4gICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICBjb21tYW5kOiAnU0VMRUNUJyxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ3F1ZXVlZCBwYXRoJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChici5fc2hvdWxkU2VsZWN0TWFpbGJveCgncXVldWVkIHBhdGgnLCB7fSkpLnRvLmJlLmZhbHNlXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI3NlbGVjdE1haWxib3gnLCAoKSA9PiB7XG4gICAgY29uc3QgcGF0aCA9ICdbR21haWxdL1RyYXNoJ1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJ1biBTRUxFQ1QnLCAoKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ1NFTEVDVCcsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgdmFsdWU6IHBhdGhcbiAgICAgICAgfV1cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgY29kZTogJ1JFQUQtV1JJVEUnXG4gICAgICB9KSlcblxuICAgICAgcmV0dXJuIGJyLnNlbGVjdE1haWxib3gocGF0aCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLl9zdGF0ZSkudG8uZXF1YWwoU1RBVEVfU0VMRUNURUQpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJ1biBTRUxFQ1Qgd2l0aCBDT05EU1RPUkUnLCAoKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ1NFTEVDVCcsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgdmFsdWU6IHBhdGhcbiAgICAgICAgfSxcbiAgICAgICAgW3tcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgdmFsdWU6ICdDT05EU1RPUkUnXG4gICAgICAgIH1dXG4gICAgICAgIF1cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgY29kZTogJ1JFQUQtV1JJVEUnXG4gICAgICB9KSlcblxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ0NPTkRTVE9SRSddXG4gICAgICByZXR1cm4gYnIuc2VsZWN0TWFpbGJveChwYXRoLCB7XG4gICAgICAgIGNvbmRzdG9yZTogdHJ1ZVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLl9zdGF0ZSkudG8uZXF1YWwoU1RBVEVfU0VMRUNURUQpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnc2hvdWxkIGVtaXQgb25zZWxlY3RtYWlsYm94IGJlZm9yZSBzZWxlY3RNYWlsYm94IGlzIHJlc29sdmVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICAgIGNvZGU6ICdSRUFELVdSSVRFJ1xuICAgICAgICB9KSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCd3aGVuIGl0IHJldHVybnMgYSBwcm9taXNlJywgKCkgPT4ge1xuICAgICAgICB2YXIgcHJvbWlzZVJlc29sdmVkID0gZmFsc2VcbiAgICAgICAgYnIub25zZWxlY3RtYWlsYm94ID0gKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICBwcm9taXNlUmVzb2x2ZWQgPSB0cnVlXG4gICAgICAgIH0pXG4gICAgICAgIHZhciBvbnNlbGVjdG1haWxib3hTcHkgPSBzaW5vbi5zcHkoYnIsICdvbnNlbGVjdG1haWxib3gnKVxuICAgICAgICByZXR1cm4gYnIuc2VsZWN0TWFpbGJveChwYXRoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBleHBlY3Qob25zZWxlY3RtYWlsYm94U3B5LndpdGhBcmdzKHBhdGgpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgICBleHBlY3QocHJvbWlzZVJlc29sdmVkKS50by5lcXVhbCh0cnVlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3doZW4gaXQgZG9lcyBub3QgcmV0dXJuIGEgcHJvbWlzZScsICgpID0+IHtcbiAgICAgICAgYnIub25zZWxlY3RtYWlsYm94ID0gKCkgPT4geyB9XG4gICAgICAgIHZhciBvbnNlbGVjdG1haWxib3hTcHkgPSBzaW5vbi5zcHkoYnIsICdvbnNlbGVjdG1haWxib3gnKVxuICAgICAgICByZXR1cm4gYnIuc2VsZWN0TWFpbGJveChwYXRoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBleHBlY3Qob25zZWxlY3RtYWlsYm94U3B5LndpdGhBcmdzKHBhdGgpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZW1pdCBvbmNsb3NlbWFpbGJveCcsICgpID0+IHtcbiAgICAgIGxldCBjYWxsZWQgPSBmYWxzZVxuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgY29kZTogJ1JFQUQtV1JJVEUnXG4gICAgICB9KSlcblxuICAgICAgYnIub25jbG9zZW1haWxib3ggPSAocGF0aCkgPT4ge1xuICAgICAgICBleHBlY3QocGF0aCkudG8uZXF1YWwoJ3l5eScpXG4gICAgICAgIGNhbGxlZCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICd5eXknXG4gICAgICByZXR1cm4gYnIuc2VsZWN0TWFpbGJveChwYXRoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNhbGxlZCkudG8uYmUudHJ1ZVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjaGFzQ2FwYWJpbGl0eScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGRldGVjdCBleGlzdGluZyBjYXBhYmlsaXR5JywgKCkgPT4ge1xuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ1paWiddXG4gICAgICBleHBlY3QoYnIuaGFzQ2FwYWJpbGl0eSgnenp6JykpLnRvLmJlLnRydWVcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBkZXRlY3Qgbm9uIGV4aXN0aW5nIGNhcGFiaWxpdHknLCAoKSA9PiB7XG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnWlpaJ11cbiAgICAgIGV4cGVjdChici5oYXNDYXBhYmlsaXR5KCdvb28nKSkudG8uYmUuZmFsc2VcbiAgICAgIGV4cGVjdChici5oYXNDYXBhYmlsaXR5KCkpLnRvLmJlLmZhbHNlXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI191bnRhZ2dlZE9rSGFuZGxlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHVwZGF0ZSBjYXBhYmlsaXR5IGlmIHByZXNlbnQnLCAoKSA9PiB7XG4gICAgICBici5fdW50YWdnZWRPa0hhbmRsZXIoe1xuICAgICAgICBjYXBhYmlsaXR5OiBbJ2FiYyddXG4gICAgICB9LCAoKSA9PiB7IH0pXG4gICAgICBleHBlY3QoYnIuX2NhcGFiaWxpdHkpLnRvLmRlZXAuZXF1YWwoWydhYmMnXSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCB1cGRhdGUgY2FwYWJpbGl0eScsICgpID0+IHtcbiAgICAgIGJyLl91bnRhZ2dlZENhcGFiaWxpdHlIYW5kbGVyKHtcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB2YWx1ZTogJ2FiYydcbiAgICAgICAgfV1cbiAgICAgIH0sICgpID0+IHsgfSlcbiAgICAgIGV4cGVjdChici5fY2FwYWJpbGl0eSkudG8uZGVlcC5lcXVhbChbJ0FCQyddKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfdW50YWdnZWRFeGlzdHNIYW5kbGVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZW1pdCBvbnVwZGF0ZScsICgpID0+IHtcbiAgICAgIGJyLm9udXBkYXRlID0gc2lub24uc3R1YigpXG4gICAgICBici5fc2VsZWN0ZWRNYWlsYm94ID0gJ0ZPTydcblxuICAgICAgYnIuX3VudGFnZ2VkRXhpc3RzSGFuZGxlcih7XG4gICAgICAgIG5yOiAxMjNcbiAgICAgIH0sICgpID0+IHsgfSlcbiAgICAgIGV4cGVjdChici5vbnVwZGF0ZS53aXRoQXJncygnRk9PJywgJ2V4aXN0cycsIDEyMykuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfdW50YWdnZWRFeHB1bmdlSGFuZGxlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGVtaXQgb251cGRhdGUnLCAoKSA9PiB7XG4gICAgICBici5vbnVwZGF0ZSA9IHNpbm9uLnN0dWIoKVxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICdGT08nXG5cbiAgICAgIGJyLl91bnRhZ2dlZEV4cHVuZ2VIYW5kbGVyKHtcbiAgICAgICAgbnI6IDEyM1xuICAgICAgfSwgKCkgPT4geyB9KVxuICAgICAgZXhwZWN0KGJyLm9udXBkYXRlLndpdGhBcmdzKCdGT08nLCAnZXhwdW5nZScsIDEyMykuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUuc2tpcCgnI191bnRhZ2dlZEZldGNoSGFuZGxlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGVtaXQgb251cGRhdGUnLCAoKSA9PiB7XG4gICAgICBici5vbnVwZGF0ZSA9IHNpbm9uLnN0dWIoKVxuICAgICAgc2lub24uc3R1YihiciwgJ19wYXJzZUZFVENIJykucmV0dXJucygnYWJjJylcbiAgICAgIGJyLl9zZWxlY3RlZE1haWxib3ggPSAnRk9PJ1xuXG4gICAgICBici5fdW50YWdnZWRGZXRjaEhhbmRsZXIoe1xuICAgICAgICBucjogMTIzXG4gICAgICB9LCAoKSA9PiB7IH0pXG4gICAgICBleHBlY3QoYnIub251cGRhdGUud2l0aEFyZ3MoJ0ZPTycsICdmZXRjaCcsICdhYmMnKS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0guYXJnc1swXVswXSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBGRVRDSDogW3tcbiAgICAgICAgICAgIG5yOiAxMjNcbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfY2hhbmdlU3RhdGUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHN0YXRlIHZhbHVlJywgKCkgPT4ge1xuICAgICAgYnIuX2NoYW5nZVN0YXRlKDEyMzQ1KVxuXG4gICAgICBleHBlY3QoYnIuX3N0YXRlKS50by5lcXVhbCgxMjM0NSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBlbWl0IG9uY2xvc2VtYWlsYm94IGlmIG1haWxib3ggd2FzIGNsb3NlZCcsICgpID0+IHtcbiAgICAgIGJyLm9uY2xvc2VtYWlsYm94ID0gc2lub24uc3R1YigpXG4gICAgICBici5fc3RhdGUgPSBTVEFURV9TRUxFQ1RFRFxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICdhYWEnXG5cbiAgICAgIGJyLl9jaGFuZ2VTdGF0ZSgxMjM0NSlcblxuICAgICAgZXhwZWN0KGJyLl9zZWxlY3RlZE1haWxib3gpLnRvLmJlLmZhbHNlXG4gICAgICBleHBlY3QoYnIub25jbG9zZW1haWxib3gud2l0aEFyZ3MoJ2FhYScpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX2Vuc3VyZVBhdGgnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgdGhlIHBhdGggaWYgbm90IHByZXNlbnQnLCAoKSA9PiB7XG4gICAgICB2YXIgdHJlZSA9IHtcbiAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICB9XG4gICAgICBleHBlY3QoYnIuX2Vuc3VyZVBhdGgodHJlZSwgJ2hlbGxvL3dvcmxkJywgJy8nKSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIG5hbWU6ICd3b3JsZCcsXG4gICAgICAgIGRlbGltaXRlcjogJy8nLFxuICAgICAgICBwYXRoOiAnaGVsbG8vd29ybGQnLFxuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH0pXG4gICAgICBleHBlY3QodHJlZSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGNoaWxkcmVuOiBbe1xuICAgICAgICAgIG5hbWU6ICdoZWxsbycsXG4gICAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgICAgcGF0aDogJ2hlbGxvJyxcbiAgICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICAgIG5hbWU6ICd3b3JsZCcsXG4gICAgICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgICAgIHBhdGg6ICdoZWxsby93b3JsZCcsXG4gICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZXhpc3RpbmcgcGF0aCBpZiBwb3NzaWJsZScsICgpID0+IHtcbiAgICAgIHZhciB0cmVlID0ge1xuICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICBuYW1lOiAnaGVsbG8nLFxuICAgICAgICAgIGRlbGltaXRlcjogJy8nLFxuICAgICAgICAgIHBhdGg6ICdoZWxsbycsXG4gICAgICAgICAgY2hpbGRyZW46IFt7XG4gICAgICAgICAgICBuYW1lOiAnd29ybGQnLFxuICAgICAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgICAgICBwYXRoOiAnaGVsbG8vd29ybGQnLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgYWJjOiAxMjNcbiAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgICAgfVxuICAgICAgZXhwZWN0KGJyLl9lbnN1cmVQYXRoKHRyZWUsICdoZWxsby93b3JsZCcsICcvJykpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBuYW1lOiAnd29ybGQnLFxuICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgcGF0aDogJ2hlbGxvL3dvcmxkJyxcbiAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICBhYmM6IDEyM1xuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBoYW5kbGUgY2FzZSBpbnNlbnNpdGl2ZSBJbmJveCcsICgpID0+IHtcbiAgICAgIHZhciB0cmVlID0ge1xuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH1cbiAgICAgIGV4cGVjdChici5fZW5zdXJlUGF0aCh0cmVlLCAnSW5ib3gvd29ybGQnLCAnLycpKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgbmFtZTogJ3dvcmxkJyxcbiAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgIHBhdGg6ICdJbmJveC93b3JsZCcsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSlcbiAgICAgIGV4cGVjdChici5fZW5zdXJlUGF0aCh0cmVlLCAnSU5CT1gvd29ybGRzJywgJy8nKSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIG5hbWU6ICd3b3JsZHMnLFxuICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgcGF0aDogJ0lOQk9YL3dvcmxkcycsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSlcblxuICAgICAgZXhwZWN0KHRyZWUpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICBuYW1lOiAnSW5ib3gnLFxuICAgICAgICAgIGRlbGltaXRlcjogJy8nLFxuICAgICAgICAgIHBhdGg6ICdJbmJveCcsXG4gICAgICAgICAgY2hpbGRyZW46IFt7XG4gICAgICAgICAgICBuYW1lOiAnd29ybGQnLFxuICAgICAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgICAgICBwYXRoOiAnSW5ib3gvd29ybGQnLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ3dvcmxkcycsXG4gICAgICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgICAgIHBhdGg6ICdJTkJPWC93b3JsZHMnLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgndW50YWdnZWQgdXBkYXRlcycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJlY2VpdmUgaW5mb3JtYXRpb24gYWJvdXQgdW50YWdnZWQgZXhpc3RzJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmNsaWVudC5fY29ubmVjdGlvblJlYWR5ID0gdHJ1ZVxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICdGT08nXG4gICAgICBici5vbnVwZGF0ZSA9IChwYXRoLCB0eXBlLCB2YWx1ZSkgPT4ge1xuICAgICAgICBleHBlY3QocGF0aCkudG8uZXF1YWwoJ0ZPTycpXG4gICAgICAgIGV4cGVjdCh0eXBlKS50by5lcXVhbCgnZXhpc3RzJylcbiAgICAgICAgZXhwZWN0KHZhbHVlKS50by5lcXVhbCgxMjMpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgICAgYnIuY2xpZW50Ll9vbkRhdGEoe1xuICAgICAgICAvKiAqIDEyMyBFWElTVFNcXHJcXG4gKi9cbiAgICAgICAgZGF0YTogbmV3IFVpbnQ4QXJyYXkoWzQyLCAzMiwgNDksIDUwLCA1MSwgMzIsIDY5LCA4OCwgNzMsIDgzLCA4NCwgODMsIDEzLCAxMF0pLmJ1ZmZlclxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZWNlaXZlIGluZm9ybWF0aW9uIGFib3V0IHVudGFnZ2VkIGV4cHVuZ2UnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuY2xpZW50Ll9jb25uZWN0aW9uUmVhZHkgPSB0cnVlXG4gICAgICBici5fc2VsZWN0ZWRNYWlsYm94ID0gJ0ZPTydcbiAgICAgIGJyLm9udXBkYXRlID0gKHBhdGgsIHR5cGUsIHZhbHVlKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXRoKS50by5lcXVhbCgnRk9PJylcbiAgICAgICAgZXhwZWN0KHR5cGUpLnRvLmVxdWFsKCdleHB1bmdlJylcbiAgICAgICAgZXhwZWN0KHZhbHVlKS50by5lcXVhbCg0NTYpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgICAgYnIuY2xpZW50Ll9vbkRhdGEoe1xuICAgICAgICAvKiAqIDQ1NiBFWFBVTkdFXFxyXFxuICovXG4gICAgICAgIGRhdGE6IG5ldyBVaW50OEFycmF5KFs0MiwgMzIsIDUyLCA1MywgNTQsIDMyLCA2OSwgODgsIDgwLCA4NSwgNzgsIDcxLCA2OSwgMTMsIDEwXSkuYnVmZmVyXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJlY2VpdmUgaW5mb3JtYXRpb24gYWJvdXQgdW50YWdnZWQgZmV0Y2gnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuY2xpZW50Ll9jb25uZWN0aW9uUmVhZHkgPSB0cnVlXG4gICAgICBici5fc2VsZWN0ZWRNYWlsYm94ID0gJ0ZPTydcbiAgICAgIGJyLm9udXBkYXRlID0gKHBhdGgsIHR5cGUsIHZhbHVlKSA9PiB7XG4gICAgICAgIGV4cGVjdChwYXRoKS50by5lcXVhbCgnRk9PJylcbiAgICAgICAgZXhwZWN0KHR5cGUpLnRvLmVxdWFsKCdmZXRjaCcpXG4gICAgICAgIGV4cGVjdCh2YWx1ZSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgICAgJyMnOiAxMjMsXG4gICAgICAgICAgZmxhZ3M6IFsnXFxcXFNlZW4nXSxcbiAgICAgICAgICBtb2RzZXE6ICc0J1xuICAgICAgICB9KVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICAgIGJyLmNsaWVudC5fb25EYXRhKHtcbiAgICAgICAgLyogKiAxMjMgRkVUQ0ggKEZMQUdTIChcXFxcU2VlbikgTU9EU0VRICg0KSlcXHJcXG4gKi9cbiAgICAgICAgZGF0YTogbmV3IFVpbnQ4QXJyYXkoWzQyLCAzMiwgNDksIDUwLCA1MSwgMzIsIDcwLCA2OSwgODQsIDY3LCA3MiwgMzIsIDQwLCA3MCwgNzYsIDY1LCA3MSwgODMsIDMyLCA0MCwgOTIsIDgzLCAxMDEsIDEwMSwgMTEwLCA0MSwgMzIsIDc3LCA3OSwgNjgsIDgzLCA2OSwgODEsIDMyLCA0MCwgNTIsIDQxLCA0MSwgMTMsIDEwXSkuYnVmZmVyXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19