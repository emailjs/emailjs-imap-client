'use strict';

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _emailjsImapHandler = require('emailjs-imap-handler');

var _mimeTortureBodystructure = require('../res/fixtures/mime-torture-bodystructure');

var _mimeTortureBodystructure2 = _interopRequireDefault(_mimeTortureBodystructure);

var _envelope = require('../res/fixtures/envelope');

var _envelope2 = _interopRequireDefault(_envelope);

var _common = require('./common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('browserbox unit tests', function () {
  var br;

  beforeEach(function () {
    br = new _client2.default();
    br.logLevel = br.LOG_LEVEL_NONE;
    br.client.socket = {
      send: function send() {},
      upgradeToSecure: function upgradeToSecure() {}
    };
  });

  describe('#_onIdle', function () {
    it('should call enterIdle', function () {
      sinon.stub(br, 'enterIdle');

      br._authenticated = true;
      br._enteredIdle = false;
      br._onIdle();

      expect(br.enterIdle.callCount).to.equal(1);
    });

    it('should not call enterIdle', function () {
      sinon.stub(br, 'enterIdle');

      br._enteredIdle = true;
      br._onIdle();

      expect(br.enterIdle.callCount).to.equal(0);
    });
  });

  describe('#connect', function () {
    beforeEach(function () {
      sinon.stub(br.client, 'connect');
      sinon.stub(br.client, 'close');
      sinon.stub(br, 'updateCapability');
      sinon.stub(br, 'upgradeConnection');
      sinon.stub(br, 'updateId');
      sinon.stub(br, 'login');
      sinon.stub(br, 'compressConnection');
    });

    it('should connect', function (done) {
      br.client.connect.returns(Promise.resolve());
      br.updateCapability.returns(Promise.resolve());
      br.upgradeConnection.returns(Promise.resolve());
      br.updateId.returns(Promise.resolve());
      br.login.returns(Promise.resolve());
      br.compressConnection.returns(Promise.resolve());

      br.connect().then(function () {
        expect(br.client.connect.calledOnce).to.be.true;
        expect(br.updateCapability.calledOnce).to.be.true;
        expect(br.upgradeConnection.calledOnce).to.be.true;
        expect(br.updateId.calledOnce).to.be.true;
        expect(br.login.calledOnce).to.be.true;
        expect(br.compressConnection.calledOnce).to.be.true;
      }).then(done).catch(done);

      setTimeout(function () {
        return br.client.onready();
      }, 0);
    });

    it('should fail to login', function (done) {
      br.client.connect.returns(Promise.resolve());
      br.updateCapability.returns(Promise.resolve());
      br.upgradeConnection.returns(Promise.resolve());
      br.updateId.returns(Promise.resolve());
      br.login.returns(Promise.reject(new Error()));

      br.connect().catch(function (err) {
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

      setTimeout(function () {
        return br.client.onready();
      }, 0);
    });

    it('should timeout', function (done) {
      br.client.connect.returns(Promise.resolve());
      br.TIMEOUT_CONNECTION = 1;

      br.connect().catch(function (err) {
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

  describe('#close', function () {
    it('should force-close', function (done) {
      sinon.stub(br.client, 'close').returns(Promise.resolve());

      br.close().then(function () {
        expect(br._state).to.equal(br.STATE_LOGOUT);
        expect(br.client.close.calledOnce).to.be.true;
        done();
      });
    });
  });

  describe('#exec', function () {
    beforeEach(function () {
      sinon.stub(br, 'breakIdle');
    });

    it('should send string command', function (done) {
      sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({}));
      br.exec('TEST').then(function (res) {
        expect(res).to.deep.equal({});
        expect(br.client.enqueueCommand.args[0][0]).to.equal('TEST');
      }).then(done).catch(done);
    });

    it('should update capability from response', function (done) {
      sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({
        capability: ['A', 'B']
      }));
      br.exec('TEST').then(function (res) {
        expect(res).to.deep.equal({
          capability: ['A', 'B']
        });
        expect(br._capability).to.deep.equal(['A', 'B']);
      }).then(done).catch(done);
    });
  });

  describe('#enterIdle', function () {
    it('should periodically send NOOP if IDLE not supported', function (done) {
      sinon.stub(br, 'exec').callsFake(function (command) {
        expect(command).to.equal('NOOP');

        done();
      });

      br._capability = [];
      br.TIMEOUT_NOOP = 1;
      br.enterIdle();
    });

    it('should break IDLE after timeout', function (done) {
      sinon.stub(br.client, 'enqueueCommand');
      sinon.stub(br.client.socket, 'send').callsFake(function (payload) {
        expect(br.client.enqueueCommand.args[0][0].command).to.equal('IDLE');
        expect([].slice.call(new Uint8Array(payload))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]);

        done();
      });

      br._capability = ['IDLE'];
      br.TIMEOUT_IDLE = 1;
      br.enterIdle();
    });
  });

  describe('#breakIdle', function () {
    it('should send DONE to socket', function (done) {
      sinon.stub(br.client.socket, 'send');

      br._enteredIdle = 'IDLE';
      br.breakIdle();
      expect([].slice.call(new Uint8Array(br.client.socket.send.args[0][0]))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]);
      done();
    });
  });

  describe('#upgradeConnection', function () {
    it('should do nothing if already secured', function (done) {
      br.client.secureMode = true;
      br._capability = ['starttls'];
      br.upgradeConnection().then(done).catch(done);
    });

    it('should do nothing if STARTTLS not available', function (done) {
      br.client.secureMode = false;
      br._capability = [];
      br.upgradeConnection().then(done).catch(done);
    });

    it('should run STARTTLS', function (done) {
      sinon.stub(br.client, 'upgrade');
      sinon.stub(br, 'exec').withArgs('STARTTLS').returns(Promise.resolve());
      sinon.stub(br, 'updateCapability').returns(Promise.resolve());

      br._capability = ['STARTTLS'];

      br.upgradeConnection().then(function () {
        expect(br.client.upgrade.callCount).to.equal(1);
        expect(br._capability.length).to.equal(0);
      }).then(done).catch(done);
    });
  });

  describe('#updateCapability', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
    });

    it('should do nothing if capability is set', function (done) {
      br._capability = ['abc'];
      br.updateCapability().then(done).catch(done);
    });

    it('should run CAPABILITY if capability not set', function (done) {
      br.exec.returns(Promise.resolve());

      br._capability = [];

      br.updateCapability().then(function () {
        expect(br.exec.args[0][0]).to.equal('CAPABILITY');
      }).then(done).catch(done);
    });

    it('should force run CAPABILITY', function (done) {
      br.exec.returns(Promise.resolve());
      br._capability = ['abc'];

      br.updateCapability(true).then(function () {
        expect(br.exec.args[0][0]).to.equal('CAPABILITY');
      }).then(done).catch(done);
    });

    it('should do nothing if connection is not yet upgraded', function (done) {
      br._capability = [];
      br.client.secureMode = false;
      br.options.requireTLS = true;

      br.updateCapability().then(done).catch(done);
    });
  });

  describe('#listNamespaces', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
    });

    it('should run NAMESPACE if supported', function (done) {
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

      br.listNamespaces().then(function (namespaces) {
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
      }).then(done).catch(done);
    });

    it('should do nothing if not supported', function (done) {
      br._capability = [];
      br.listNamespaces().then(function (namespaces) {
        expect(namespaces).to.be.false;
        expect(br.exec.callCount).to.equal(0);
      }).then(done).catch(done);
    });
  });

  describe('#compressConnection', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
      sinon.stub(br.client, 'enableCompression');
    });

    it('should run COMPRESS=DEFLATE if supported', function (done) {
      br.exec.withArgs({
        command: 'COMPRESS',
        attributes: [{
          type: 'ATOM',
          value: 'DEFLATE'
        }]
      }).returns(Promise.resolve({}));

      br.options.enableCompression = true;
      br._capability = ['COMPRESS=DEFLATE'];
      br.compressConnection().then(function () {
        expect(br.exec.callCount).to.equal(1);
        expect(br.client.enableCompression.callCount).to.equal(1);
      }).then(done).catch(done);
    });

    it('should do nothing if not supported', function (done) {
      br._capability = [];

      br.compressConnection().then(function () {
        expect(br.exec.callCount).to.equal(0);
      }).then(done).catch(done);
    });

    it('should do nothing if not enabled', function (done) {
      br.options.enableCompression = false;
      br._capability = ['COMPRESS=DEFLATE'];

      br.compressConnection().then(function () {
        expect(br.exec.callCount).to.equal(0);
      }).then(done).catch(done);
    });
  });

  describe('#login', function () {
    it('should call LOGIN', function (done) {
      sinon.stub(br, 'exec').returns(Promise.resolve({}));
      sinon.stub(br, 'updateCapability').returns(Promise.resolve(true));

      br.login({
        user: 'u1',
        pass: 'p1'
      }).then(function () {
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

        done();
      });
    });

    it('should call XOAUTH2', function () {
      sinon.stub(br, 'exec').returns(Promise.resolve({}));
      sinon.stub(br, 'updateCapability').returns(Promise.resolve(true));

      br._capability = ['AUTH=XOAUTH2'];
      br.login({
        user: 'u1',
        xoauth2: 'abc'
      }).then(function () {
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

  describe('#updateId', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
    });

    it('should not nothing if not supported', function (done) {
      br._capability = [];

      br.updateId({
        a: 'b',
        c: 'd'
      }).then(function () {
        expect(br.serverId).to.be.false;
      }).then(done).catch(done);
    });

    it('should send NIL', function (done) {
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

      br.updateId(null).then(function () {
        expect(br.serverId).to.deep.equal({});
      }).then(done).catch(done);
    });

    it('should exhange ID values', function (done) {
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

      br.updateId({
        ckey1: 'cval1',
        ckey2: 'cval2'
      }).then(function () {
        expect(br.serverId).to.deep.equal({
          skey1: 'sval1',
          skey2: 'sval2'
        });
      }).then(done).catch(done);
    });
  });

  describe('#listMailboxes', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
    });

    it('should call LIST and LSUB in sequence', function (done) {
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

      br.listMailboxes().then(function (tree) {
        expect(tree).to.exist;
      }).then(done).catch(done);
    });

    it('should not die on NIL separators', function (done) {
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

      br.listMailboxes().then(function (tree) {
        expect(tree).to.exist;
      }).then(done).catch(done);
    });
  });

  describe('#createMailbox', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
    });

    it('should call CREATE with a string payload', function (done) {
      // The spec allows unquoted ATOM-style syntax too, but for
      // simplicity we always generate a string even if it could be
      // expressed as an atom.
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['mailboxname']
      }).returns(Promise.resolve());

      br.createMailbox('mailboxname').then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });

    it('should call mutf7 encode the argument', function (done) {
      // From RFC 3501
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['~peter/mail/&U,BTFw-/&ZeVnLIqe-']
      }).returns(Promise.resolve());

      br.createMailbox('~peter/mail/\u53F0\u5317/\u65E5\u672C\u8A9E').then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });

    it('should treat an ALREADYEXISTS response as success', function (done) {
      var fakeErr = {
        code: 'ALREADYEXISTS'
      };
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['mailboxname']
      }).returns(Promise.reject(fakeErr));

      br.createMailbox('mailboxname').then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#listMessages', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildFETCHCommand');
      sinon.stub(br, '_parseFETCH');
    });

    it('should call FETCH', function (done) {
      br.exec.returns(Promise.resolve('abc'));
      br._buildFETCHCommand.withArgs(['1:2', ['uid', 'flags'], {
        byUid: true
      }]).returns({});

      br.listMessages('INBOX', '1:2', ['uid', 'flags'], {
        byUid: true
      }).then(function () {
        expect(br._buildFETCHCommand.callCount).to.equal(1);
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#search', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildSEARCHCommand');
      sinon.stub(br, '_parseSEARCH');
    });

    it('should call SEARCH', function (done) {
      br.exec.returns(Promise.resolve('abc'));
      br._buildSEARCHCommand.withArgs({
        uid: 1
      }, {
        byUid: true
      }).returns({});

      br.search('INBOX', {
        uid: 1
      }, {
        byUid: true
      }).then(function () {
        expect(br._buildSEARCHCommand.callCount).to.equal(1);
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseSEARCH.withArgs('abc').callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#upload', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
    });

    it('should call APPEND with custom flag', function (done) {
      br.exec.returns(Promise.resolve());

      br.upload('mailbox', 'this is a message', {
        flags: ['\\$MyFlag']
      }).then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });

    it('should call APPEND w/o flags', function (done) {
      br.exec.returns(Promise.resolve());

      br.upload('mailbox', 'this is a message').then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#setFlags', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildSTORECommand');
      sinon.stub(br, '_parseFETCH');
    });

    it('should call STORE', function (done) {
      br.exec.returns(Promise.resolve('abc'));
      br._buildSTORECommand.withArgs('1:2', 'FLAGS', ['\\Seen', '$MyFlag'], {
        byUid: true
      }).returns({});

      br.setFlags('INBOX', '1:2', ['\\Seen', '$MyFlag'], {
        byUid: true
      }).then(function () {
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#store', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_buildSTORECommand');
      sinon.stub(br, '_parseFETCH');
    });

    it('should call STORE', function (done) {
      br.exec.returns(Promise.resolve('abc'));
      br._buildSTORECommand.withArgs('1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
        byUid: true
      }).returns({});

      br.store('INBOX', '1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
        byUid: true
      }).then(function () {
        expect(br._buildSTORECommand.callCount).to.equal(1);
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#deleteMessages', function () {
    beforeEach(function () {
      sinon.stub(br, 'setFlags');
      sinon.stub(br, 'exec');
    });

    it('should call UID EXPUNGE', function (done) {
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
      br.deleteMessages('INBOX', '1:2', {
        byUid: true
      }).then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });

    it('should call EXPUNGE', function (done) {
      br.exec.withArgs('EXPUNGE').returns(Promise.resolve('abc'));
      br.setFlags.withArgs('INBOX', '1:2', {
        add: '\\Deleted'
      }).returns(Promise.resolve());

      br._capability = [];
      br.deleteMessages('INBOX', '1:2', {
        byUid: true
      }).then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#copyMessages', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
    });

    it('should call COPY', function (done) {
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
        humanReadable: 'abc'
      }));

      br.copyMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(function (response) {
        expect(response).to.equal('abc');
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#moveMessages', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
      sinon.stub(br, 'copyMessages');
      sinon.stub(br, 'deleteMessages');
    });

    it('should call MOVE if supported', function (done) {
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
      br.moveMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(function () {
        expect(br.exec.callCount).to.equal(1);
      }).then(done).catch(done);
    });

    it('should fallback to copy+expunge', function (done) {
      br.copyMessages.withArgs('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).returns(Promise.resolve());
      br.deleteMessages.withArgs('1:2', {
        byUid: true
      }).returns(Promise.resolve());

      br._capability = [];
      br.moveMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(function () {
        expect(br.deleteMessages.callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#_shouldSelectMailbox', function () {
    it('should return true when ctx is undefined', function () {
      expect(br._shouldSelectMailbox('path')).to.be.true;
    });

    it('should return true when a different path is queued', function () {
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

    it('should return false when the same path is queued', function () {
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

  describe('#selectMailbox', function () {
    beforeEach(function () {
      sinon.stub(br, 'exec');
      sinon.stub(br, '_parseSELECT');
    });

    it('should run SELECT', function (done) {
      br.exec.withArgs({
        command: 'SELECT',
        attributes: [{
          type: 'STRING',
          value: '[Gmail]/Trash'
        }]
      }).returns(Promise.resolve('abc'));

      br.selectMailbox('[Gmail]/Trash').then(function () {
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseSELECT.withArgs('abc').callCount).to.equal(1);
        expect(br._state).to.equal(br.STATE_SELECTED);
      }).then(done).catch(done);
    });

    it('should run SELECT with CONDSTORE', function (done) {
      br.exec.withArgs({
        command: 'SELECT',
        attributes: [{
          type: 'STRING',
          value: '[Gmail]/Trash'
        }, [{
          type: 'ATOM',
          value: 'CONDSTORE'
        }]]
      }).returns(Promise.resolve('abc'));

      br._capability = ['CONDSTORE'];
      br.selectMailbox('[Gmail]/Trash', {
        condstore: true
      }).then(function () {
        expect(br.exec.callCount).to.equal(1);
        expect(br._parseSELECT.withArgs('abc').callCount).to.equal(1);
        expect(br._state).to.equal(br.STATE_SELECTED);
      }).then(done).catch(done);
    });

    describe('should emit onselectmailbox before selectMailbox is resolved', function () {
      beforeEach(function () {
        br.exec.returns(Promise.resolve('abc'));
        br._parseSELECT.withArgs('abc').returns('def');
      });

      it('when it returns a promise', function (done) {
        var promiseResolved = false;
        br.onselectmailbox = function () {
          return new Promise(function (resolve) {
            resolve();
            promiseResolved = true;
          });
        };
        var onselectmailboxSpy = sinon.spy(br, 'onselectmailbox');
        br.selectMailbox('[Gmail]/Trash').then(function () {
          expect(br._parseSELECT.callCount).to.equal(1);
          expect(onselectmailboxSpy.withArgs('[Gmail]/Trash', 'def').callCount).to.equal(1);
          expect(promiseResolved).to.equal(true);
          done();
        }).catch(done);
      });

      it('when it does not return a promise', function (done) {
        br.onselectmailbox = function () {};
        var onselectmailboxSpy = sinon.spy(br, 'onselectmailbox');
        br.selectMailbox('[Gmail]/Trash').then(function () {
          expect(br._parseSELECT.callCount).to.equal(1);
          expect(onselectmailboxSpy.withArgs('[Gmail]/Trash', 'def').callCount).to.equal(1);
          done();
        }).catch(done);
      });
    });

    it('should emit onclosemailbox', function (done) {
      br.exec.returns(Promise.resolve('abc'));
      br._parseSELECT.withArgs('abc').returns('def');

      br.onclosemailbox = function (path) {
        return expect(path).to.equal('yyy');
      };

      br._selectedMailbox = 'yyy';
      br.selectMailbox('[Gmail]/Trash').then(function () {
        expect(br._parseSELECT.callCount).to.equal(1);
      }).then(done).catch(done);
    });
  });

  describe('#hasCapability', function () {
    it('should detect existing capability', function () {
      br._capability = ['ZZZ'];
      expect(br.hasCapability('zzz')).to.be.true;
    });

    it('should detect non existing capability', function () {
      br._capability = ['ZZZ'];
      expect(br.hasCapability('ooo')).to.be.false;
      expect(br.hasCapability()).to.be.false;
    });
  });

  describe('#_untaggedOkHandler', function () {
    it('should update capability if present', function () {
      br._untaggedOkHandler({
        capability: ['abc']
      }, function () {});
      expect(br._capability).to.deep.equal(['abc']);
    });
  });

  describe('#_untaggedCapabilityHandler', function () {
    it('should update capability', function () {
      br._untaggedCapabilityHandler({
        attributes: [{
          value: 'abc'
        }]
      }, function () {});
      expect(br._capability).to.deep.equal(['ABC']);
    });
  });

  describe('#_untaggedExistsHandler', function () {
    it('should emit onupdate', function () {
      br.onupdate = sinon.stub();
      br._selectedMailbox = 'FOO';

      br._untaggedExistsHandler({
        nr: 123
      }, function () {});
      expect(br.onupdate.withArgs('FOO', 'exists', 123).callCount).to.equal(1);
    });
  });

  describe('#_untaggedExpungeHandler', function () {
    it('should emit onupdate', function () {
      br.onupdate = sinon.stub();
      br._selectedMailbox = 'FOO';

      br._untaggedExpungeHandler({
        nr: 123
      }, function () {});
      expect(br.onupdate.withArgs('FOO', 'expunge', 123).callCount).to.equal(1);
    });
  });

  describe('#_untaggedFetchHandler', function () {
    it('should emit onupdate', function () {
      br.onupdate = sinon.stub();
      sinon.stub(br, '_parseFETCH').returns('abc');
      br._selectedMailbox = 'FOO';

      br._untaggedFetchHandler({
        nr: 123
      }, function () {});
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

  describe('#_parseSELECT', function () {
    it('should parse a complete response', function () {
      expect(br._parseSELECT({
        code: 'READ-WRITE',
        payload: {
          EXISTS: [{
            nr: 123
          }],
          FLAGS: [{
            attributes: [[{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]]
          }],
          OK: [{
            code: 'PERMANENTFLAGS',
            permanentflags: ['\\Answered', '\\Flagged']
          }, {
            code: 'UIDVALIDITY',
            uidvalidity: '2'
          }, {
            code: 'UIDNEXT',
            uidnext: '38361'
          }, {
            code: 'HIGHESTMODSEQ',
            highestmodseq: '3682918'
          }]
        }
      })).to.deep.equal({
        exists: 123,
        flags: ['\\Answered', '\\Flagged'],
        highestModseq: '3682918',
        permanentFlags: ['\\Answered', '\\Flagged'],
        readOnly: false,
        uidNext: 38361,
        uidValidity: 2
      });
    });

    it('should parse response with no modseq', function () {
      expect(br._parseSELECT({
        code: 'READ-WRITE',
        payload: {
          EXISTS: [{
            nr: 123
          }],
          FLAGS: [{
            attributes: [[{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]]
          }],
          OK: [{
            code: 'PERMANENTFLAGS',
            permanentflags: ['\\Answered', '\\Flagged']
          }, {
            code: 'UIDVALIDITY',
            uidvalidity: '2'
          }, {
            code: 'UIDNEXT',
            uidnext: '38361'
          }]
        }
      })).to.deep.equal({
        exists: 123,
        flags: ['\\Answered', '\\Flagged'],
        permanentFlags: ['\\Answered', '\\Flagged'],
        readOnly: false,
        uidNext: 38361,
        uidValidity: 2
      });
    });

    it('should parse response with read-only', function () {
      expect(br._parseSELECT({
        code: 'READ-ONLY',
        payload: {
          EXISTS: [{
            nr: 123
          }],
          FLAGS: [{
            attributes: [[{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]]
          }],
          OK: [{
            code: 'PERMANENTFLAGS',
            permanentflags: ['\\Answered', '\\Flagged']
          }, {
            code: 'UIDVALIDITY',
            uidvalidity: '2'
          }, {
            code: 'UIDNEXT',
            uidnext: '38361'
          }]
        }
      })).to.deep.equal({
        exists: 123,
        flags: ['\\Answered', '\\Flagged'],
        permanentFlags: ['\\Answered', '\\Flagged'],
        readOnly: true,
        uidNext: 38361,
        uidValidity: 2
      });
    });

    it('should parse response with NOMODSEQ flag', function () {
      expect(br._parseSELECT({
        code: 'READ-WRITE',
        payload: {
          EXISTS: [{
            nr: 123
          }],
          FLAGS: [{
            attributes: [[{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]]
          }],
          OK: [{
            code: 'PERMANENTFLAGS',
            permanentflags: ['\\Answered', '\\Flagged']
          }, {
            code: 'UIDVALIDITY',
            uidvalidity: '2'
          }, {
            code: 'UIDNEXT',
            uidnext: '38361'
          }, {
            code: 'NOMODSEQ'
          }]
        }
      })).to.deep.equal({
        exists: 123,
        flags: ['\\Answered', '\\Flagged'],
        permanentFlags: ['\\Answered', '\\Flagged'],
        readOnly: false,
        uidNext: 38361,
        uidValidity: 2,
        noModseq: true
      });
    });
  });

  describe('#_parseNAMESPACE', function () {
    it('should not succeed for no namespace response', function () {
      expect(br._parseNAMESPACE({
        payload: {
          NAMESPACE: []
        }
      })).to.be.false;
    });

    it('should return single personal namespace', function () {
      expect(br._parseNAMESPACE({
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
      })).to.deep.equal({
        personal: [{
          prefix: 'INBOX.',
          delimiter: '.'
        }],
        users: false,
        shared: false
      });
    });

    it('should return single personal, single users, multiple shared', function () {
      expect(br._parseNAMESPACE({
        payload: {
          NAMESPACE: [{
            attributes: [
            // personal
            [[{
              type: 'STRING',
              value: ''
            }, {
              type: 'STRING',
              value: '/'
            }]],
            // users
            [[{
              type: 'STRING',
              value: '~'
            }, {
              type: 'STRING',
              value: '/'
            }]],
            // shared
            [[{
              type: 'STRING',
              value: '#shared/'
            }, {
              type: 'STRING',
              value: '/'
            }], [{
              type: 'STRING',
              value: '#public/'
            }, {
              type: 'STRING',
              value: '/'
            }]]]
          }]
        }
      })).to.deep.equal({
        personal: [{
          prefix: '',
          delimiter: '/'
        }],
        users: [{
          prefix: '~',
          delimiter: '/'
        }],
        shared: [{
          prefix: '#shared/',
          delimiter: '/'
        }, {
          prefix: '#public/',
          delimiter: '/'
        }]
      });
    });

    it('should handle NIL namespace hierarchy delim', function () {
      expect(br._parseNAMESPACE({
        payload: {
          NAMESPACE: [
          // This specific value is returned by yahoo.co.jp's
          // imapgate version 0.7.68_11_1.61475 IMAP server
          (0, _emailjsImapHandler.parser)((0, _common.toTypedArray)('* NAMESPACE (("" NIL)) NIL NIL'))]
        }
      })).to.deep.equal({
        personal: [{
          prefix: '',
          delimiter: null
        }],
        users: false,
        shared: false
      });
    });
  });

  describe('#_buildFETCHCommand', function () {
    it('should build single ALL', function () {
      expect(br._buildFETCHCommand('1:*', ['all'], {})).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, {
          type: 'ATOM',
          value: 'ALL'
        }]
      });
    });

    it('should build FETCH with uid', function () {
      expect(br._buildFETCHCommand('1:*', ['all'], {
        byUid: true
      })).to.deep.equal({
        command: 'UID FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, {
          type: 'ATOM',
          value: 'ALL'
        }]
      });
    });

    it('should build FETCH with uid, envelope', function () {
      expect(br._buildFETCHCommand('1:*', ['uid', 'envelope'], {})).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, [{
          type: 'ATOM',
          value: 'UID'
        }, {
          type: 'ATOM',
          value: 'ENVELOPE'
        }]]
      });
    });

    it('should build FETCH with modseq', function () {
      expect(br._buildFETCHCommand('1:*', ['modseq (1234567)'], {})).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, [{
          type: 'ATOM',
          value: 'MODSEQ'
        }, [{
          type: 'ATOM',
          value: '1234567'
        }]]]
      });
    });

    it('should build FETCH with section', function () {
      expect(br._buildFETCHCommand('1:*', ['body[text]'], {})).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, {
          type: 'ATOM',
          value: 'BODY',
          section: [{
            type: 'ATOM',
            value: 'TEXT'
          }]
        }]
      });
    });

    it('should build FETCH with section and list', function () {
      expect(br._buildFETCHCommand('1:*', ['body[header.fields (date in-reply-to)]'], {})).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, {
          type: 'ATOM',
          value: 'BODY',
          section: [{
            type: 'ATOM',
            value: 'HEADER.FIELDS'
          }, [{
            type: 'ATOM',
            value: 'DATE'
          }, {
            type: 'ATOM',
            value: 'IN-REPLY-TO'
          }]]
        }]
      });
    });

    it('should build FETCH with ', function () {
      expect(br._buildFETCHCommand('1:*', ['all'], {
        changedSince: '123456'
      })).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, {
          type: 'ATOM',
          value: 'ALL'
        }, [{
          type: 'ATOM',
          value: 'CHANGEDSINCE'
        }, {
          type: 'ATOM',
          value: '123456'
        }]]
      });
    });

    it('should build FETCH with partial', function () {
      expect(br._buildFETCHCommand('1:*', ['body[]'], {})).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, {
          type: 'ATOM',
          value: 'BODY',
          section: []
        }]
      });
    });

    it('should build FETCH with the valueAsString option', function () {
      expect(br._buildFETCHCommand('1:*', ['body[]'], { valueAsString: false })).to.deep.equal({
        command: 'FETCH',
        attributes: [{
          type: 'SEQUENCE',
          value: '1:*'
        }, {
          type: 'ATOM',
          value: 'BODY',
          section: []
        }],
        valueAsString: false
      });
    });
  });

  describe('#_parseFETCH', function () {
    it('should return values lowercase keys', function () {
      sinon.stub(br, '_parseFetchValue').returns('def');
      expect(br._parseFETCH({
        payload: {
          FETCH: [{
            nr: 123,
            attributes: [[{
              type: 'ATOM',
              value: 'BODY',
              section: [{
                type: 'ATOM',
                value: 'HEADER'
              }, [{
                type: 'ATOM',
                value: 'DATE'
              }, {
                type: 'ATOM',
                value: 'SUBJECT'
              }]],
              partial: [0, 123]
            }, {
              type: 'ATOM',
              value: 'abc'
            }]]
          }]
        }
      })).to.deep.equal([{
        '#': 123,
        'body[header (date subject)]<0.123>': 'def'
      }]);

      expect(br._parseFetchValue.withArgs('body[header (date subject)]<0.123>', {
        type: 'ATOM',
        value: 'abc'
      }).callCount).to.equal(1);
    });

    it('should merge multiple responses based on sequence number', function () {
      expect(br._parseFETCH({
        payload: {
          FETCH: [{
            nr: 123,
            attributes: [[{
              type: 'ATOM',
              value: 'UID'
            }, {
              type: 'ATOM',
              value: 789
            }]]
          }, {
            nr: 124,
            attributes: [[{
              type: 'ATOM',
              value: 'UID'
            }, {
              type: 'ATOM',
              value: 790
            }]]
          }, {
            nr: 123,
            attributes: [[{
              type: 'ATOM',
              value: 'MODSEQ'
            }, {
              type: 'ATOM',
              value: '127'
            }]]
          }]
        }
      })).to.deep.equal([{
        '#': 123,
        'uid': 789,
        'modseq': '127'
      }, {
        '#': 124,
        'uid': 790
      }]);
    });
  });

  describe('#_parseENVELOPE', function () {
    it('should parsed envelope object', function () {
      expect(br._parseENVELOPE(_envelope2.default.source)).to.deep.equal(_envelope2.default.parsed);
    });
  });

  describe('#_parseBODYSTRUCTURE', function () {
    it('should parse bodystructure object', function () {
      expect(br._parseBODYSTRUCTURE(_mimeTortureBodystructure2.default.source)).to.deep.equal(_mimeTortureBodystructure2.default.parsed);
    });

    it('should parse bodystructure with unicode filename', function () {
      var input = [[{
        type: 'STRING',
        value: 'APPLICATION'
      }, {
        type: 'STRING',
        value: 'OCTET-STREAM'
      }, null, null, null, {
        type: 'STRING',
        value: 'BASE64'
      }, {
        type: 'ATOM',
        value: '40'
      }, null, [{
        type: 'STRING',
        value: 'ATTACHMENT'
      }, [{
        type: 'STRING',
        value: 'FILENAME'
      }, {
        type: 'STRING',
        value: '=?ISO-8859-1?Q?BBR_Handel,_Gewerbe,_B=FCrobetriebe,?= =?ISO-8859-1?Q?_private_Bildungseinrichtungen.txt?='
      }]], null], {
        type: 'STRING',
        value: 'MIXED'
      }, [{
        type: 'STRING',
        value: 'BOUNDARY'
      }, {
        type: 'STRING',
        value: '----sinikael-?=_1-14105085265110.49903922458179295'
      }], null, null];

      var expected = {
        childNodes: [{
          part: '1',
          type: 'application/octet-stream',
          encoding: 'base64',
          size: 40,
          disposition: 'attachment',
          dispositionParameters: {
            filename: 'BBR Handel, Gewerbe, Bürobetriebe, private Bildungseinrichtungen.txt'
          }
        }],
        type: 'multipart/mixed',
        parameters: {
          boundary: '----sinikael-?=_1-14105085265110.49903922458179295'
        }
      };

      expect(br._parseBODYSTRUCTURE(input)).to.deep.equal(expected);
    });
  });

  describe('#_buildSEARCHCommand', function () {
    it('should compose a search command', function () {
      expect(br._buildSEARCHCommand({
        unseen: true,
        header: ['subject', 'hello world'],
        or: {
          unseen: true,
          seen: true
        },
        not: {
          seen: true
        },
        sentbefore: new Date(2011, 1, 3, 12, 0, 0),
        since: new Date(2011, 11, 23, 12, 0, 0),
        uid: '1:*',
        'X-GM-MSGID': '1499257647490662970',
        'X-GM-THRID': '1499257647490662971'
      }, {})).to.deep.equal({
        command: 'SEARCH',
        attributes: [{
          'type': 'atom',
          'value': 'UNSEEN'
        }, {
          'type': 'atom',
          'value': 'HEADER'
        }, {
          'type': 'string',
          'value': 'subject'
        }, {
          'type': 'string',
          'value': 'hello world'
        }, {
          'type': 'atom',
          'value': 'OR'
        }, {
          'type': 'atom',
          'value': 'UNSEEN'
        }, {
          'type': 'atom',
          'value': 'SEEN'
        }, {
          'type': 'atom',
          'value': 'NOT'
        }, {
          'type': 'atom',
          'value': 'SEEN'
        }, {
          'type': 'atom',
          'value': 'SENTBEFORE'
        }, {
          'type': 'atom',
          'value': '3-Feb-2011'
        }, {
          'type': 'atom',
          'value': 'SINCE'
        }, {
          'type': 'atom',
          'value': '23-Dec-2011'
        }, {
          'type': 'atom',
          'value': 'UID'
        }, {
          'type': 'sequence',
          'value': '1:*'
        }, {
          'type': 'atom',
          'value': 'X-GM-MSGID'
        }, {
          'type': 'number',
          'value': '1499257647490662970'
        }, {
          'type': 'atom',
          'value': 'X-GM-THRID'
        }, {
          'type': 'number',
          'value': '1499257647490662971'
        }]
      });
    });

    it('should compose an unicode search command', function () {
      expect(br._buildSEARCHCommand({
        body: 'jõgeva'
      }, {})).to.deep.equal({
        command: 'SEARCH',
        attributes: [{
          type: 'atom',
          value: 'CHARSET'
        }, {
          type: 'atom',
          value: 'UTF-8'
        }, {
          type: 'atom',
          value: 'BODY'
        }, {
          type: 'literal',
          value: 'jÃµgeva'
        }]
      });
    });
  });

  describe('#_parseSEARCH', function () {
    it('should parse SEARCH response', function () {
      expect(br._parseSEARCH({
        payload: {
          SEARCH: [{
            attributes: [{
              value: 5
            }, {
              value: 7
            }]
          }, {
            attributes: [{
              value: 6
            }]
          }]
        }
      })).to.deep.equal([5, 6, 7]);
    });

    it('should parse empty SEARCH response', function () {
      expect(br._parseSEARCH({
        payload: {
          SEARCH: [{
            command: 'SEARCH',
            tag: '*'
          }]
        }
      })).to.deep.equal([]);
    });
  });

  describe('#_buildSTORECommand', function () {
    it('should compose a store command from an array', function () {
      expect(br._buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {})).to.deep.equal({
        command: 'STORE',
        attributes: [{
          'type': 'sequence',
          'value': '1,2,3'
        }, {
          'type': 'atom',
          'value': 'FLAGS'
        }, [{
          'type': 'atom',
          'value': 'a'
        }, {
          'type': 'atom',
          'value': 'b'
        }]]
      });
    });

    it('should compose a store set flags command', function () {
      expect(br._buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {})).to.deep.equal({
        command: 'STORE',
        attributes: [{
          'type': 'sequence',
          'value': '1,2,3'
        }, {
          'type': 'atom',
          'value': 'FLAGS'
        }, [{
          'type': 'atom',
          'value': 'a'
        }, {
          'type': 'atom',
          'value': 'b'
        }]]
      });
    });

    it('should compose a store add flags command', function () {
      expect(br._buildSTORECommand('1,2,3', '+FLAGS', ['a', 'b'], {})).to.deep.equal({
        command: 'STORE',
        attributes: [{
          'type': 'sequence',
          'value': '1,2,3'
        }, {
          'type': 'atom',
          'value': '+FLAGS'
        }, [{
          'type': 'atom',
          'value': 'a'
        }, {
          'type': 'atom',
          'value': 'b'
        }]]
      });
    });

    it('should compose a store remove flags command', function () {
      expect(br._buildSTORECommand('1,2,3', '-FLAGS', ['a', 'b'], {})).to.deep.equal({
        command: 'STORE',
        attributes: [{
          'type': 'sequence',
          'value': '1,2,3'
        }, {
          'type': 'atom',
          'value': '-FLAGS'
        }, [{
          'type': 'atom',
          'value': 'a'
        }, {
          'type': 'atom',
          'value': 'b'
        }]]
      });
    });

    it('should compose a store remove silent flags command', function () {
      expect(br._buildSTORECommand('1,2,3', '-FLAGS', ['a', 'b'], {
        silent: true
      })).to.deep.equal({
        command: 'STORE',
        attributes: [{
          'type': 'sequence',
          'value': '1,2,3'
        }, {
          'type': 'atom',
          'value': '-FLAGS.SILENT'
        }, [{
          'type': 'atom',
          'value': 'a'
        }, {
          'type': 'atom',
          'value': 'b'
        }]]
      });
    });

    it('should compose a uid store flags command', function () {
      expect(br._buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {
        byUid: true
      })).to.deep.equal({
        command: 'UID STORE',
        attributes: [{
          'type': 'sequence',
          'value': '1,2,3'
        }, {
          'type': 'atom',
          'value': 'FLAGS'
        }, [{
          'type': 'atom',
          'value': 'a'
        }, {
          'type': 'atom',
          'value': 'b'
        }]]
      });
    });
  });

  describe('#_changeState', function () {
    it('should set the state value', function () {
      br._changeState(12345);

      expect(br._state).to.equal(12345);
    });

    it('should emit onclosemailbox if mailbox was closed', function () {
      br.onclosemailbox = sinon.stub();
      br._state = br.STATE_SELECTED;
      br._selectedMailbox = 'aaa';

      br._changeState(12345);

      expect(br._selectedMailbox).to.be.false;
      expect(br.onclosemailbox.withArgs('aaa').callCount).to.equal(1);
    });
  });

  describe('#_ensurePath', function () {
    it('should create the path if not present', function () {
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

    it('should return existing path if possible', function () {
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

    it('should handle case insensitive Inbox', function () {
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

  describe('#_checkSpecialUse', function () {
    it('should return a matching special use flag', function () {
      expect(br._checkSpecialUse({
        flags: ['test', '\\All']
      })).to.equal('\\All');
    });

    it('should fail for non-existent flag', function () {
      expect(false, br._checkSpecialUse({}));
    });

    it('should fail for invalid flag', function () {
      expect(br._checkSpecialUse({
        flags: ['test']
      })).to.be.false;
    });

    it('should return special use flag if a matching name is found', function () {
      expect(br._checkSpecialUse({
        name: 'test'
      })).to.be.false;
      expect(br._checkSpecialUse({
        name: 'Praht'
      })).to.equal('\\Trash');
      expect(br._checkSpecialUse({
        flags: ['\HasChildren'], // not a special use flag
        name: 'Praht'
      })).to.equal('\\Trash');
    });

    it('should prefer matching special use flag over a matching name', function () {
      expect(br._checkSpecialUse({
        flags: ['\\All'],
        name: 'Praht'
      })).to.equal('\\All');
    });
  });

  describe('#_buildXOAuth2Token', function () {
    it('should return base64 encoded XOAUTH2 token', function () {
      expect(br._buildXOAuth2Token('user@host', 'abcde')).to.equal('dXNlcj11c2VyQGhvc3QBYXV0aD1CZWFyZXIgYWJjZGUBAQ==');
    });
  });

  describe('untagged updates', function () {
    it('should receive information about untagged exists', function (done) {
      br.client._connectionReady = true;
      br._selectedMailbox = 'FOO';
      br.onupdate = function (path, type, value) {
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

    it('should receive information about untagged expunge', function (done) {
      br.client._connectionReady = true;
      br._selectedMailbox = 'FOO';
      br.onupdate = function (path, type, value) {
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

    it('should receive information about untagged fetch', function (done) {
      br.client._connectionReady = true;
      br._selectedMailbox = 'FOO';
      br.onupdate = function (path, type, value) {
        expect(path).to.equal('FOO');
        expect(type).to.equal('fetch');
        expect(value).to.deep.equal({
          '#': 123,
          'flags': ['\\Seen'],
          'modseq': '4'
        });
        done();
      };
      br.client._onData({
        /* * 123 FETCH (FLAGS (\\Seen) MODSEQ (4))\r\n */
        data: new Uint8Array([42, 32, 49, 50, 51, 32, 70, 69, 84, 67, 72, 32, 40, 70, 76, 65, 71, 83, 32, 40, 92, 83, 101, 101, 110, 41, 32, 77, 79, 68, 83, 69, 81, 32, 40, 52, 41, 41, 13, 10]).buffer
      });
    });
  });
}); /* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-escape */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQtdW5pdC5qcyJdLCJuYW1lcyI6WyJkZXNjcmliZSIsImJyIiwiYmVmb3JlRWFjaCIsImxvZ0xldmVsIiwiTE9HX0xFVkVMX05PTkUiLCJjbGllbnQiLCJzb2NrZXQiLCJzZW5kIiwidXBncmFkZVRvU2VjdXJlIiwiaXQiLCJzaW5vbiIsInN0dWIiLCJfYXV0aGVudGljYXRlZCIsIl9lbnRlcmVkSWRsZSIsIl9vbklkbGUiLCJleHBlY3QiLCJlbnRlcklkbGUiLCJjYWxsQ291bnQiLCJ0byIsImVxdWFsIiwiZG9uZSIsImNvbm5lY3QiLCJyZXR1cm5zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ1cGRhdGVDYXBhYmlsaXR5IiwidXBncmFkZUNvbm5lY3Rpb24iLCJ1cGRhdGVJZCIsImxvZ2luIiwiY29tcHJlc3NDb25uZWN0aW9uIiwidGhlbiIsImNhbGxlZE9uY2UiLCJiZSIsInRydWUiLCJjYXRjaCIsInNldFRpbWVvdXQiLCJvbnJlYWR5IiwicmVqZWN0IiwiRXJyb3IiLCJlcnIiLCJleGlzdCIsImNsb3NlIiwiY2FsbGVkIiwiZmFsc2UiLCJUSU1FT1VUX0NPTk5FQ1RJT04iLCJfc3RhdGUiLCJTVEFURV9MT0dPVVQiLCJleGVjIiwicmVzIiwiZGVlcCIsImVucXVldWVDb21tYW5kIiwiYXJncyIsImNhcGFiaWxpdHkiLCJfY2FwYWJpbGl0eSIsImNhbGxzRmFrZSIsImNvbW1hbmQiLCJUSU1FT1VUX05PT1AiLCJwYXlsb2FkIiwic2xpY2UiLCJjYWxsIiwiVWludDhBcnJheSIsIlRJTUVPVVRfSURMRSIsImJyZWFrSWRsZSIsInNlY3VyZU1vZGUiLCJ3aXRoQXJncyIsInVwZ3JhZGUiLCJsZW5ndGgiLCJvcHRpb25zIiwicmVxdWlyZVRMUyIsIk5BTUVTUEFDRSIsImF0dHJpYnV0ZXMiLCJ0eXBlIiwidmFsdWUiLCJsaXN0TmFtZXNwYWNlcyIsIm5hbWVzcGFjZXMiLCJwZXJzb25hbCIsInByZWZpeCIsImRlbGltaXRlciIsInVzZXJzIiwic2hhcmVkIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJ1c2VyIiwicGFzcyIsInNlbnNpdGl2ZSIsInhvYXV0aDIiLCJhIiwiYyIsInNlcnZlcklkIiwiSUQiLCJja2V5MSIsImNrZXkyIiwic2tleTEiLCJza2V5MiIsIkxJU1QiLCJMU1VCIiwibGlzdE1haWxib3hlcyIsInRyZWUiLCJjcmVhdGVNYWlsYm94IiwiZmFrZUVyciIsImNvZGUiLCJfYnVpbGRGRVRDSENvbW1hbmQiLCJieVVpZCIsImxpc3RNZXNzYWdlcyIsIl9wYXJzZUZFVENIIiwiX2J1aWxkU0VBUkNIQ29tbWFuZCIsInVpZCIsInNlYXJjaCIsIl9wYXJzZVNFQVJDSCIsInVwbG9hZCIsImZsYWdzIiwiX2J1aWxkU1RPUkVDb21tYW5kIiwic2V0RmxhZ3MiLCJzdG9yZSIsImFkZCIsImRlbGV0ZU1lc3NhZ2VzIiwiaHVtYW5SZWFkYWJsZSIsImNvcHlNZXNzYWdlcyIsInJlc3BvbnNlIiwibW92ZU1lc3NhZ2VzIiwiX3Nob3VsZFNlbGVjdE1haWxib3giLCJyZXF1ZXN0Iiwic2VsZWN0TWFpbGJveCIsIl9wYXJzZVNFTEVDVCIsIlNUQVRFX1NFTEVDVEVEIiwiY29uZHN0b3JlIiwicHJvbWlzZVJlc29sdmVkIiwib25zZWxlY3RtYWlsYm94Iiwib25zZWxlY3RtYWlsYm94U3B5Iiwic3B5Iiwib25jbG9zZW1haWxib3giLCJwYXRoIiwiX3NlbGVjdGVkTWFpbGJveCIsImhhc0NhcGFiaWxpdHkiLCJfdW50YWdnZWRPa0hhbmRsZXIiLCJfdW50YWdnZWRDYXBhYmlsaXR5SGFuZGxlciIsIm9udXBkYXRlIiwiX3VudGFnZ2VkRXhpc3RzSGFuZGxlciIsIm5yIiwiX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIiLCJfdW50YWdnZWRGZXRjaEhhbmRsZXIiLCJGRVRDSCIsIkVYSVNUUyIsIkZMQUdTIiwiT0siLCJwZXJtYW5lbnRmbGFncyIsInVpZHZhbGlkaXR5IiwidWlkbmV4dCIsImhpZ2hlc3Rtb2RzZXEiLCJleGlzdHMiLCJoaWdoZXN0TW9kc2VxIiwicGVybWFuZW50RmxhZ3MiLCJyZWFkT25seSIsInVpZE5leHQiLCJ1aWRWYWxpZGl0eSIsIm5vTW9kc2VxIiwiX3BhcnNlTkFNRVNQQUNFIiwic2VjdGlvbiIsImNoYW5nZWRTaW5jZSIsInZhbHVlQXNTdHJpbmciLCJwYXJ0aWFsIiwiX3BhcnNlRmV0Y2hWYWx1ZSIsIl9wYXJzZUVOVkVMT1BFIiwic291cmNlIiwicGFyc2VkIiwiX3BhcnNlQk9EWVNUUlVDVFVSRSIsImlucHV0IiwiZXhwZWN0ZWQiLCJjaGlsZE5vZGVzIiwicGFydCIsImVuY29kaW5nIiwic2l6ZSIsImRpc3Bvc2l0aW9uIiwiZGlzcG9zaXRpb25QYXJhbWV0ZXJzIiwiZmlsZW5hbWUiLCJwYXJhbWV0ZXJzIiwiYm91bmRhcnkiLCJ1bnNlZW4iLCJoZWFkZXIiLCJvciIsInNlZW4iLCJub3QiLCJzZW50YmVmb3JlIiwiRGF0ZSIsInNpbmNlIiwiYm9keSIsIlNFQVJDSCIsInRhZyIsInNpbGVudCIsIl9jaGFuZ2VTdGF0ZSIsImNoaWxkcmVuIiwiX2Vuc3VyZVBhdGgiLCJuYW1lIiwiYWJjIiwiX2NoZWNrU3BlY2lhbFVzZSIsIl9idWlsZFhPQXV0aDJUb2tlbiIsIl9jb25uZWN0aW9uUmVhZHkiLCJfb25EYXRhIiwiZGF0YSIsImJ1ZmZlciJdLCJtYXBwaW5ncyI6Ijs7QUFHQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBQSxTQUFTLHVCQUFULEVBQWtDLFlBQU07QUFDdEMsTUFBSUMsRUFBSjs7QUFFQUMsYUFBVyxZQUFNO0FBQ2ZELFNBQUssc0JBQUw7QUFDQUEsT0FBR0UsUUFBSCxHQUFjRixHQUFHRyxjQUFqQjtBQUNBSCxPQUFHSSxNQUFILENBQVVDLE1BQVYsR0FBbUI7QUFDakJDLFlBQU0sZ0JBQU0sQ0FBRyxDQURFO0FBRWpCQyx1QkFBaUIsMkJBQU0sQ0FBRztBQUZULEtBQW5CO0FBSUQsR0FQRDs7QUFTQVIsV0FBUyxVQUFULEVBQXFCLFlBQU07QUFDekJTLE9BQUcsdUJB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QUF4SSxFQUE0SSxFQUE1SSxFQUFnSixFQUFoSixFQUFvSixFQUFwSixFQUF3SixFQUF4SixFQUE0SixFQUE1SixFQUFnSyxFQUFoSyxDQUFmLEVBQW9MMEk7QUFGMUssT0FBbEI7QUFJRCxLQWpCRDtBQWtCRCxHQWpERDtBQWtERCxDQXRpRUQsRSxDQVRBO0FBQ0EiLCJmaWxlIjoiY2xpZW50LXVuaXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVzZWxlc3MtZXNjYXBlICovXG5cbmltcG9ydCBJbWFwQ2xpZW50IGZyb20gJy4vY2xpZW50J1xuaW1wb3J0IHsgcGFyc2VyIH0gZnJvbSAnZW1haWxqcy1pbWFwLWhhbmRsZXInXG5pbXBvcnQgbWltZVRvcnR1cmUgZnJvbSAnLi4vcmVzL2ZpeHR1cmVzL21pbWUtdG9ydHVyZS1ib2R5c3RydWN0dXJlJ1xuaW1wb3J0IHRlc3RFbnZlbG9wZSBmcm9tICcuLi9yZXMvZml4dHVyZXMvZW52ZWxvcGUnXG5pbXBvcnQgeyB0b1R5cGVkQXJyYXkgfSBmcm9tICcuL2NvbW1vbidcblxuZGVzY3JpYmUoJ2Jyb3dzZXJib3ggdW5pdCB0ZXN0cycsICgpID0+IHtcbiAgdmFyIGJyXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYnIgPSBuZXcgSW1hcENsaWVudCgpXG4gICAgYnIubG9nTGV2ZWwgPSBici5MT0dfTEVWRUxfTk9ORVxuICAgIGJyLmNsaWVudC5zb2NrZXQgPSB7XG4gICAgICBzZW5kOiAoKSA9PiB7IH0sXG4gICAgICB1cGdyYWRlVG9TZWN1cmU6ICgpID0+IHsgfVxuICAgIH1cbiAgfSlcblxuICBkZXNjcmliZSgnI19vbklkbGUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBjYWxsIGVudGVySWRsZScsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdlbnRlcklkbGUnKVxuXG4gICAgICBici5fYXV0aGVudGljYXRlZCA9IHRydWVcbiAgICAgIGJyLl9lbnRlcmVkSWRsZSA9IGZhbHNlXG4gICAgICBici5fb25JZGxlKClcblxuICAgICAgZXhwZWN0KGJyLmVudGVySWRsZS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgbm90IGNhbGwgZW50ZXJJZGxlJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2VudGVySWRsZScpXG5cbiAgICAgIGJyLl9lbnRlcmVkSWRsZSA9IHRydWVcbiAgICAgIGJyLl9vbklkbGUoKVxuXG4gICAgICBleHBlY3QoYnIuZW50ZXJJZGxlLmNhbGxDb3VudCkudG8uZXF1YWwoMClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjY29ubmVjdCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnY29ubmVjdCcpXG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ2Nsb3NlJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICd1cGRhdGVDYXBhYmlsaXR5JylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICd1cGdyYWRlQ29ubmVjdGlvbicpXG4gICAgICBzaW5vbi5zdHViKGJyLCAndXBkYXRlSWQnKVxuICAgICAgc2lub24uc3R1YihiciwgJ2xvZ2luJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdjb21wcmVzc0Nvbm5lY3Rpb24nKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNvbm5lY3QnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuY2xpZW50LmNvbm5lY3QucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcbiAgICAgIGJyLnVwZGF0ZUNhcGFiaWxpdHkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcbiAgICAgIGJyLnVwZ3JhZGVDb25uZWN0aW9uLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici51cGRhdGVJZC5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIubG9naW4ucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcbiAgICAgIGJyLmNvbXByZXNzQ29ubmVjdGlvbi5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici5jb25uZWN0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5jbGllbnQuY29ubmVjdC5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICAgIGV4cGVjdChici51cGRhdGVDYXBhYmlsaXR5LmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLnVwZ3JhZGVDb25uZWN0aW9uLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLnVwZGF0ZUlkLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLmxvZ2luLmNhbGxlZE9uY2UpLnRvLmJlLnRydWVcbiAgICAgICAgZXhwZWN0KGJyLmNvbXByZXNzQ29ubmVjdGlvbi5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gYnIuY2xpZW50Lm9ucmVhZHkoKSwgMClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBmYWlsIHRvIGxvZ2luJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmNsaWVudC5jb25uZWN0LnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici51cGRhdGVDYXBhYmlsaXR5LnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG4gICAgICBici51cGdyYWRlQ29ubmVjdGlvbi5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIudXBkYXRlSWQucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcbiAgICAgIGJyLmxvZ2luLnJldHVybnMoUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCkpKVxuXG4gICAgICBici5jb25uZWN0KCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBleHBlY3QoZXJyKS50by5leGlzdFxuXG4gICAgICAgIGV4cGVjdChici5jbGllbnQuY29ubmVjdC5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICAgIGV4cGVjdChici5jbGllbnQuY2xvc2UuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgICAgICBleHBlY3QoYnIudXBkYXRlQ2FwYWJpbGl0eS5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICAgIGV4cGVjdChici51cGdyYWRlQ29ubmVjdGlvbi5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICAgIGV4cGVjdChici51cGRhdGVJZC5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICAgIGV4cGVjdChici5sb2dpbi5jYWxsZWRPbmNlKS50by5iZS50cnVlXG5cbiAgICAgICAgZXhwZWN0KGJyLmNvbXByZXNzQ29ubmVjdGlvbi5jYWxsZWQpLnRvLmJlLmZhbHNlXG5cbiAgICAgICAgZG9uZSgpXG4gICAgICB9KVxuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IGJyLmNsaWVudC5vbnJlYWR5KCksIDApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgdGltZW91dCcsIChkb25lKSA9PiB7XG4gICAgICBici5jbGllbnQuY29ubmVjdC5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIuVElNRU9VVF9DT05ORUNUSU9OID0gMVxuXG4gICAgICBici5jb25uZWN0KCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBleHBlY3QoZXJyKS50by5leGlzdFxuXG4gICAgICAgIGV4cGVjdChici5jbGllbnQuY29ubmVjdC5jYWxsZWRPbmNlKS50by5iZS50cnVlXG4gICAgICAgIGV4cGVjdChici5jbGllbnQuY2xvc2UuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuXG4gICAgICAgIGV4cGVjdChici51cGRhdGVDYXBhYmlsaXR5LmNhbGxlZCkudG8uYmUuZmFsc2VcbiAgICAgICAgZXhwZWN0KGJyLnVwZ3JhZGVDb25uZWN0aW9uLmNhbGxlZCkudG8uYmUuZmFsc2VcbiAgICAgICAgZXhwZWN0KGJyLnVwZGF0ZUlkLmNhbGxlZCkudG8uYmUuZmFsc2VcbiAgICAgICAgZXhwZWN0KGJyLmxvZ2luLmNhbGxlZCkudG8uYmUuZmFsc2VcbiAgICAgICAgZXhwZWN0KGJyLmNvbXByZXNzQ29ubmVjdGlvbi5jYWxsZWQpLnRvLmJlLmZhbHNlXG5cbiAgICAgICAgZG9uZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjbG9zZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGZvcmNlLWNsb3NlJywgKGRvbmUpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnY2xvc2UnKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici5jbG9zZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuX3N0YXRlKS50by5lcXVhbChici5TVEFURV9MT0dPVVQpXG4gICAgICAgIGV4cGVjdChici5jbGllbnQuY2xvc2UuY2FsbGVkT25jZSkudG8uYmUudHJ1ZVxuICAgICAgICBkb25lKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2V4ZWMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnYnJlYWtJZGxlJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBzZW5kIHN0cmluZyBjb21tYW5kJywgKGRvbmUpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LCAnZW5xdWV1ZUNvbW1hbmQnKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh7fSkpXG4gICAgICBici5leGVjKCdURVNUJykudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZXMpLnRvLmRlZXAuZXF1YWwoe30pXG4gICAgICAgIGV4cGVjdChici5jbGllbnQuZW5xdWV1ZUNvbW1hbmQuYXJnc1swXVswXSkudG8uZXF1YWwoJ1RFU1QnKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHVwZGF0ZSBjYXBhYmlsaXR5IGZyb20gcmVzcG9uc2UnLCAoZG9uZSkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQsICdlbnF1ZXVlQ29tbWFuZCcpLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgY2FwYWJpbGl0eTogWydBJywgJ0InXVxuICAgICAgfSkpXG4gICAgICBici5leGVjKCdURVNUJykudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZXMpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICAgIGNhcGFiaWxpdHk6IFsnQScsICdCJ11cbiAgICAgICAgfSlcbiAgICAgICAgZXhwZWN0KGJyLl9jYXBhYmlsaXR5KS50by5kZWVwLmVxdWFsKFsnQScsICdCJ10pXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2VudGVySWRsZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHBlcmlvZGljYWxseSBzZW5kIE5PT1AgaWYgSURMRSBub3Qgc3VwcG9ydGVkJywgKGRvbmUpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJykuY2FsbHNGYWtlKChjb21tYW5kKSA9PiB7XG4gICAgICAgIGV4cGVjdChjb21tYW5kKS50by5lcXVhbCgnTk9PUCcpXG5cbiAgICAgICAgZG9uZSgpXG4gICAgICB9KVxuXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFtdXG4gICAgICBici5USU1FT1VUX05PT1AgPSAxXG4gICAgICBici5lbnRlcklkbGUoKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGJyZWFrIElETEUgYWZ0ZXIgdGltZW91dCcsIChkb25lKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ2VucXVldWVDb21tYW5kJylcbiAgICAgIHNpbm9uLnN0dWIoYnIuY2xpZW50LnNvY2tldCwgJ3NlbmQnKS5jYWxsc0Zha2UoKHBheWxvYWQpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmNsaWVudC5lbnF1ZXVlQ29tbWFuZC5hcmdzWzBdWzBdLmNvbW1hbmQpLnRvLmVxdWFsKCdJRExFJylcbiAgICAgICAgZXhwZWN0KFtdLnNsaWNlLmNhbGwobmV3IFVpbnQ4QXJyYXkocGF5bG9hZCkpKS50by5kZWVwLmVxdWFsKFsweDQ0LCAweDRmLCAweDRlLCAweDQ1LCAweDBkLCAweDBhXSlcblxuICAgICAgICBkb25lKClcbiAgICAgIH0pXG5cbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydJRExFJ11cbiAgICAgIGJyLlRJTUVPVVRfSURMRSA9IDFcbiAgICAgIGJyLmVudGVySWRsZSgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2JyZWFrSWRsZScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHNlbmQgRE9ORSB0byBzb2NrZXQnLCAoZG9uZSkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQuc29ja2V0LCAnc2VuZCcpXG5cbiAgICAgIGJyLl9lbnRlcmVkSWRsZSA9ICdJRExFJ1xuICAgICAgYnIuYnJlYWtJZGxlKClcbiAgICAgIGV4cGVjdChbXS5zbGljZS5jYWxsKG5ldyBVaW50OEFycmF5KGJyLmNsaWVudC5zb2NrZXQuc2VuZC5hcmdzWzBdWzBdKSkpLnRvLmRlZXAuZXF1YWwoWzB4NDQsIDB4NGYsIDB4NGUsIDB4NDUsIDB4MGQsIDB4MGFdKVxuICAgICAgZG9uZSgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI3VwZ3JhZGVDb25uZWN0aW9uJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZG8gbm90aGluZyBpZiBhbHJlYWR5IHNlY3VyZWQnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuY2xpZW50LnNlY3VyZU1vZGUgPSB0cnVlXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnc3RhcnR0bHMnXVxuICAgICAgYnIudXBncmFkZUNvbm5lY3Rpb24oKS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZG8gbm90aGluZyBpZiBTVEFSVFRMUyBub3QgYXZhaWxhYmxlJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmNsaWVudC5zZWN1cmVNb2RlID0gZmFsc2VcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gW11cbiAgICAgIGJyLnVwZ3JhZGVDb25uZWN0aW9uKCkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJ1biBTVEFSVFRMUycsIChkb25lKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ3VwZ3JhZGUnKVxuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKS53aXRoQXJncygnU1RBUlRUTFMnKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgc2lub24uc3R1YihiciwgJ3VwZGF0ZUNhcGFiaWxpdHknKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnU1RBUlRUTFMnXVxuXG4gICAgICBici51cGdyYWRlQ29ubmVjdGlvbigpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuY2xpZW50LnVwZ3JhZGUuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuX2NhcGFiaWxpdHkubGVuZ3RoKS50by5lcXVhbCgwKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyN1cGRhdGVDYXBhYmlsaXR5JywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGRvIG5vdGhpbmcgaWYgY2FwYWJpbGl0eSBpcyBzZXQnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ2FiYyddXG4gICAgICBici51cGRhdGVDYXBhYmlsaXR5KCkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJ1biBDQVBBQklMSVRZIGlmIGNhcGFiaWxpdHkgbm90IHNldCcsIChkb25lKSA9PiB7XG4gICAgICBici5leGVjLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gW11cblxuICAgICAgYnIudXBkYXRlQ2FwYWJpbGl0eSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5hcmdzWzBdWzBdKS50by5lcXVhbCgnQ0FQQUJJTElUWScpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZm9yY2UgcnVuIENBUEFCSUxJVFknLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ2FiYyddXG5cbiAgICAgIGJyLnVwZGF0ZUNhcGFiaWxpdHkodHJ1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmFyZ3NbMF1bMF0pLnRvLmVxdWFsKCdDQVBBQklMSVRZJylcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBkbyBub3RoaW5nIGlmIGNvbm5lY3Rpb24gaXMgbm90IHlldCB1cGdyYWRlZCcsIChkb25lKSA9PiB7XG4gICAgICBici5fY2FwYWJpbGl0eSA9IFtdXG4gICAgICBici5jbGllbnQuc2VjdXJlTW9kZSA9IGZhbHNlXG4gICAgICBici5vcHRpb25zLnJlcXVpcmVUTFMgPSB0cnVlXG5cbiAgICAgIGJyLnVwZGF0ZUNhcGFiaWxpdHkoKS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2xpc3ROYW1lc3BhY2VzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJ1biBOQU1FU1BBQ0UgaWYgc3VwcG9ydGVkJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgTkFNRVNQQUNFOiBbe1xuICAgICAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICdJTkJPWC4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJy4nXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgXSwgbnVsbCwgbnVsbFxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pKVxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ05BTUVTUEFDRSddXG5cbiAgICAgIGJyLmxpc3ROYW1lc3BhY2VzKCkudGhlbigobmFtZXNwYWNlcykgPT4ge1xuICAgICAgICBleHBlY3QobmFtZXNwYWNlcykudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgICAgcGVyc29uYWw6IFt7XG4gICAgICAgICAgICBwcmVmaXg6ICdJTkJPWC4nLFxuICAgICAgICAgICAgZGVsaW1pdGVyOiAnLidcbiAgICAgICAgICB9XSxcbiAgICAgICAgICB1c2VyczogZmFsc2UsXG4gICAgICAgICAgc2hhcmVkOiBmYWxzZVxuICAgICAgICB9KVxuICAgICAgICBleHBlY3QoYnIuZXhlYy5hcmdzWzBdWzBdKS50by5lcXVhbCgnTkFNRVNQQUNFJylcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuYXJnc1swXVsxXSkudG8uZXF1YWwoJ05BTUVTUEFDRScpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZG8gbm90aGluZyBpZiBub3Qgc3VwcG9ydGVkJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gW11cbiAgICAgIGJyLmxpc3ROYW1lc3BhY2VzKCkudGhlbigobmFtZXNwYWNlcykgPT4ge1xuICAgICAgICBleHBlY3QobmFtZXNwYWNlcykudG8uYmUuZmFsc2VcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgwKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjb21wcmVzc0Nvbm5lY3Rpb24nLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgICBzaW5vbi5zdHViKGJyLmNsaWVudCwgJ2VuYWJsZUNvbXByZXNzaW9uJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBydW4gQ09NUFJFU1M9REVGTEFURSBpZiBzdXBwb3J0ZWQnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdDT01QUkVTUycsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnREVGTEFURSdcbiAgICAgICAgfV1cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHt9KSlcblxuICAgICAgYnIub3B0aW9ucy5lbmFibGVDb21wcmVzc2lvbiA9IHRydWVcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydDT01QUkVTUz1ERUZMQVRFJ11cbiAgICAgIGJyLmNvbXByZXNzQ29ubmVjdGlvbigpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChici5jbGllbnQuZW5hYmxlQ29tcHJlc3Npb24uY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGRvIG5vdGhpbmcgaWYgbm90IHN1cHBvcnRlZCcsIChkb25lKSA9PiB7XG4gICAgICBici5fY2FwYWJpbGl0eSA9IFtdXG5cbiAgICAgIGJyLmNvbXByZXNzQ29ubmVjdGlvbigpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDApXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZG8gbm90aGluZyBpZiBub3QgZW5hYmxlZCcsIChkb25lKSA9PiB7XG4gICAgICBici5vcHRpb25zLmVuYWJsZUNvbXByZXNzaW9uID0gZmFsc2VcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydDT01QUkVTUz1ERUZMQVRFJ11cblxuICAgICAgYnIuY29tcHJlc3NDb25uZWN0aW9uKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMClcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjbG9naW4nLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBjYWxsIExPR0lOJywgKGRvbmUpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJykucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe30pKVxuICAgICAgc2lub24uc3R1YihiciwgJ3VwZGF0ZUNhcGFiaWxpdHknKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh0cnVlKSlcblxuICAgICAgYnIubG9naW4oe1xuICAgICAgICB1c2VyOiAndTEnLFxuICAgICAgICBwYXNzOiAncDEnXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuZXhlYy5hcmdzWzBdWzBdKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgICBjb21tYW5kOiAnbG9naW4nLFxuICAgICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICAgIHZhbHVlOiAndTEnXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ3AxJyxcbiAgICAgICAgICAgIHNlbnNpdGl2ZTogdHJ1ZVxuICAgICAgICAgIH1dXG4gICAgICAgIH0pXG5cbiAgICAgICAgZG9uZSgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgWE9BVVRIMicsICgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJykucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe30pKVxuICAgICAgc2lub24uc3R1YihiciwgJ3VwZGF0ZUNhcGFiaWxpdHknKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh0cnVlKSlcblxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ0FVVEg9WE9BVVRIMiddXG4gICAgICBici5sb2dpbih7XG4gICAgICAgIHVzZXI6ICd1MScsXG4gICAgICAgIHhvYXV0aDI6ICdhYmMnXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuZXhlYy5hcmdzWzBdWzBdKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgICBjb21tYW5kOiAnQVVUSEVOVElDQVRFJyxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgdmFsdWU6ICdYT0FVVEgyJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgIHZhbHVlOiAnZFhObGNqMTFNUUZoZFhSb1BVSmxZWEpsY2lCaFltTUJBUT09JyxcbiAgICAgICAgICAgIHNlbnNpdGl2ZTogdHJ1ZVxuICAgICAgICAgIH1dXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyN1cGRhdGVJZCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBub3Qgbm90aGluZyBpZiBub3Qgc3VwcG9ydGVkJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gW11cblxuICAgICAgYnIudXBkYXRlSWQoe1xuICAgICAgICBhOiAnYicsXG4gICAgICAgIGM6ICdkJ1xuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5zZXJ2ZXJJZCkudG8uYmUuZmFsc2VcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBzZW5kIE5JTCcsIChkb25lKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ0lEJyxcbiAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgIG51bGxcbiAgICAgICAgXVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgSUQ6IFt7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydJRCddXG5cbiAgICAgIGJyLnVwZGF0ZUlkKG51bGwpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuc2VydmVySWQpLnRvLmRlZXAuZXF1YWwoe30pXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZXhoYW5nZSBJRCB2YWx1ZXMnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdJRCcsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICBbJ2NrZXkxJywgJ2N2YWwxJywgJ2NrZXkyJywgJ2N2YWwyJ11cbiAgICAgICAgXVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgSUQ6IFt7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgICAgIFt7XG4gICAgICAgICAgICAgICAgdmFsdWU6ICdza2V5MSdcbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnc3ZhbDEnXG4gICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ3NrZXkyJ1xuICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6ICdzdmFsMidcbiAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydJRCddXG5cbiAgICAgIGJyLnVwZGF0ZUlkKHtcbiAgICAgICAgY2tleTE6ICdjdmFsMScsXG4gICAgICAgIGNrZXkyOiAnY3ZhbDInXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLnNlcnZlcklkKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgICBza2V5MTogJ3N2YWwxJyxcbiAgICAgICAgICBza2V5MjogJ3N2YWwyJ1xuICAgICAgICB9KVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNsaXN0TWFpbGJveGVzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgTElTVCBhbmQgTFNVQiBpbiBzZXF1ZW5jZScsIChkb25lKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ0xJU1QnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbJycsICcqJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIExJU1Q6IFtmYWxzZV1cbiAgICAgICAgfVxuICAgICAgfSkpXG5cbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnTFNVQicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFsnJywgJyonXVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgTFNVQjogW2ZhbHNlXVxuICAgICAgICB9XG4gICAgICB9KSlcblxuICAgICAgYnIubGlzdE1haWxib3hlcygpLnRoZW4oKHRyZWUpID0+IHtcbiAgICAgICAgZXhwZWN0KHRyZWUpLnRvLmV4aXN0XG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgbm90IGRpZSBvbiBOSUwgc2VwYXJhdG9ycycsIChkb25lKSA9PiB7XG4gICAgICBici5leGVjLndpdGhBcmdzKHtcbiAgICAgICAgY29tbWFuZDogJ0xJU1QnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbJycsICcqJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIExJU1Q6IFtcbiAgICAgICAgICAgIHBhcnNlcih0b1R5cGVkQXJyYXkoJyogTElTVCAoXFxcXE5vSW5mZXJpb3JzKSBOSUwgXCJJTkJPWFwiJykpXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9KSlcblxuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdMU1VCJyxcbiAgICAgICAgYXR0cmlidXRlczogWycnLCAnKiddXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBMU1VCOiBbXG4gICAgICAgICAgICBwYXJzZXIodG9UeXBlZEFycmF5KCcqIExTVUIgKFxcXFxOb0luZmVyaW9ycykgTklMIFwiSU5CT1hcIicpKVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSkpXG5cbiAgICAgIGJyLmxpc3RNYWlsYm94ZXMoKS50aGVuKCh0cmVlKSA9PiB7XG4gICAgICAgIGV4cGVjdCh0cmVlKS50by5leGlzdFxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjcmVhdGVNYWlsYm94JywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgQ1JFQVRFIHdpdGggYSBzdHJpbmcgcGF5bG9hZCcsIChkb25lKSA9PiB7XG4gICAgICAvLyBUaGUgc3BlYyBhbGxvd3MgdW5xdW90ZWQgQVRPTS1zdHlsZSBzeW50YXggdG9vLCBidXQgZm9yXG4gICAgICAvLyBzaW1wbGljaXR5IHdlIGFsd2F5cyBnZW5lcmF0ZSBhIHN0cmluZyBldmVuIGlmIGl0IGNvdWxkIGJlXG4gICAgICAvLyBleHByZXNzZWQgYXMgYW4gYXRvbS5cbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnQ1JFQVRFJyxcbiAgICAgICAgYXR0cmlidXRlczogWydtYWlsYm94bmFtZSddXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici5jcmVhdGVNYWlsYm94KCdtYWlsYm94bmFtZScpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBtdXRmNyBlbmNvZGUgdGhlIGFyZ3VtZW50JywgKGRvbmUpID0+IHtcbiAgICAgIC8vIEZyb20gUkZDIDM1MDFcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnQ1JFQVRFJyxcbiAgICAgICAgYXR0cmlidXRlczogWyd+cGV0ZXIvbWFpbC8mVSxCVEZ3LS8mWmVWbkxJcWUtJ11cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIGJyLmNyZWF0ZU1haWxib3goJ35wZXRlci9tYWlsL1xcdTUzZjBcXHU1MzE3L1xcdTY1ZTVcXHU2NzJjXFx1OGE5ZScpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgdHJlYXQgYW4gQUxSRUFEWUVYSVNUUyByZXNwb25zZSBhcyBzdWNjZXNzJywgKGRvbmUpID0+IHtcbiAgICAgIHZhciBmYWtlRXJyID0ge1xuICAgICAgICBjb2RlOiAnQUxSRUFEWUVYSVNUUydcbiAgICAgIH1cbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnQ1JFQVRFJyxcbiAgICAgICAgYXR0cmlidXRlczogWydtYWlsYm94bmFtZSddXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVqZWN0KGZha2VFcnIpKVxuXG4gICAgICBici5jcmVhdGVNYWlsYm94KCdtYWlsYm94bmFtZScpLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI2xpc3RNZXNzYWdlcycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfYnVpbGRGRVRDSENvbW1hbmQnKVxuICAgICAgc2lub24uc3R1YihiciwgJ19wYXJzZUZFVENIJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIEZFVENIJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoJ2FiYycpKVxuICAgICAgYnIuX2J1aWxkRkVUQ0hDb21tYW5kLndpdGhBcmdzKFsnMToyJywgWyd1aWQnLCAnZmxhZ3MnXSwge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfV0pLnJldHVybnMoe30pXG5cbiAgICAgIGJyLmxpc3RNZXNzYWdlcygnSU5CT1gnLCAnMToyJywgWyd1aWQnLCAnZmxhZ3MnXSwge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5fYnVpbGRGRVRDSENvbW1hbmQuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0gud2l0aEFyZ3MoJ2FiYycpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjc2VhcmNoJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgICAgc2lub24uc3R1YihiciwgJ19idWlsZFNFQVJDSENvbW1hbmQnKVxuICAgICAgc2lub24uc3R1YihiciwgJ19wYXJzZVNFQVJDSCcpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBTRUFSQ0gnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG4gICAgICBici5fYnVpbGRTRUFSQ0hDb21tYW5kLndpdGhBcmdzKHtcbiAgICAgICAgdWlkOiAxXG4gICAgICB9LCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS5yZXR1cm5zKHt9KVxuXG4gICAgICBici5zZWFyY2goJ0lOQk9YJywge1xuICAgICAgICB1aWQ6IDFcbiAgICAgIH0sIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuX2J1aWxkU0VBUkNIQ29tbWFuZC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLl9wYXJzZVNFQVJDSC53aXRoQXJncygnYWJjJykuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyN1cGxvYWQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBBUFBFTkQgd2l0aCBjdXN0b20gZmxhZycsIChkb25lKSA9PiB7XG4gICAgICBici5leGVjLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIGJyLnVwbG9hZCgnbWFpbGJveCcsICd0aGlzIGlzIGEgbWVzc2FnZScsIHtcbiAgICAgICAgZmxhZ3M6IFsnXFxcXCRNeUZsYWcnXVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5leGVjLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIEFQUEVORCB3L28gZmxhZ3MnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici51cGxvYWQoJ21haWxib3gnLCAndGhpcyBpcyBhIG1lc3NhZ2UnKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNzZXRGbGFncycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfYnVpbGRTVE9SRUNvbW1hbmQnKVxuICAgICAgc2lub24uc3R1YihiciwgJ19wYXJzZUZFVENIJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIFNUT1JFJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmV4ZWMucmV0dXJucyhQcm9taXNlLnJlc29sdmUoJ2FiYycpKVxuICAgICAgYnIuX2J1aWxkU1RPUkVDb21tYW5kLndpdGhBcmdzKCcxOjInLCAnRkxBR1MnLCBbJ1xcXFxTZWVuJywgJyRNeUZsYWcnXSwge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkucmV0dXJucyh7fSlcblxuICAgICAgYnIuc2V0RmxhZ3MoJ0lOQk9YJywgJzE6MicsIFsnXFxcXFNlZW4nLCAnJE15RmxhZyddLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0gud2l0aEFyZ3MoJ2FiYycpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjc3RvcmUnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgICBzaW5vbi5zdHViKGJyLCAnX2J1aWxkU1RPUkVDb21tYW5kJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdfcGFyc2VGRVRDSCcpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBTVE9SRScsIChkb25lKSA9PiB7XG4gICAgICBici5leGVjLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCdhYmMnKSlcbiAgICAgIGJyLl9idWlsZFNUT1JFQ29tbWFuZC53aXRoQXJncygnMToyJywgJytYLUdNLUxBQkVMUycsIFsnXFxcXFNlbnQnLCAnXFxcXEp1bmsnXSwge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkucmV0dXJucyh7fSlcblxuICAgICAgYnIuc3RvcmUoJ0lOQk9YJywgJzE6MicsICcrWC1HTS1MQUJFTFMnLCBbJ1xcXFxTZW50JywgJ1xcXFxKdW5rJ10sIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuX2J1aWxkU1RPUkVDb21tYW5kLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0gud2l0aEFyZ3MoJ2FiYycpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgIH0pLnRoZW4oZG9uZSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjZGVsZXRlTWVzc2FnZXMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnc2V0RmxhZ3MnKVxuICAgICAgc2lub24uc3R1YihiciwgJ2V4ZWMnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgVUlEIEVYUFVOR0UnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdVSUQgRVhQVU5HRScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ3NlcXVlbmNlJyxcbiAgICAgICAgICB2YWx1ZTogJzE6MidcbiAgICAgICAgfV1cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCdhYmMnKSlcbiAgICAgIGJyLnNldEZsYWdzLndpdGhBcmdzKCdJTkJPWCcsICcxOjInLCB7XG4gICAgICAgIGFkZDogJ1xcXFxEZWxldGVkJ1xuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcblxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ1VJRFBMVVMnXVxuICAgICAgYnIuZGVsZXRlTWVzc2FnZXMoJ0lOQk9YJywgJzE6MicsIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBFWFBVTkdFJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3MoJ0VYUFVOR0UnKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG4gICAgICBici5zZXRGbGFncy53aXRoQXJncygnSU5CT1gnLCAnMToyJywge1xuICAgICAgICBhZGQ6ICdcXFxcRGVsZXRlZCdcbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCkpXG5cbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gW11cbiAgICAgIGJyLmRlbGV0ZU1lc3NhZ2VzKCdJTkJPWCcsICcxOjInLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNjb3B5TWVzc2FnZXMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBDT1BZJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnVUlEIENPUFknLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdzZXF1ZW5jZScsXG4gICAgICAgICAgdmFsdWU6ICcxOjInXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnYXRvbScsXG4gICAgICAgICAgdmFsdWU6ICdbR21haWxdL1RyYXNoJ1xuICAgICAgICB9XVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBodW1hblJlYWRhYmxlOiAnYWJjJ1xuICAgICAgfSkpXG5cbiAgICAgIGJyLmNvcHlNZXNzYWdlcygnSU5CT1gnLCAnMToyJywgJ1tHbWFpbF0vVHJhc2gnLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBleHBlY3QocmVzcG9uc2UpLnRvLmVxdWFsKCdhYmMnKVxuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI21vdmVNZXNzYWdlcycsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdleGVjJylcbiAgICAgIHNpbm9uLnN0dWIoYnIsICdjb3B5TWVzc2FnZXMnKVxuICAgICAgc2lub24uc3R1YihiciwgJ2RlbGV0ZU1lc3NhZ2VzJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIE1PVkUgaWYgc3VwcG9ydGVkJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnVUlEIE1PVkUnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdzZXF1ZW5jZScsXG4gICAgICAgICAgdmFsdWU6ICcxOjInXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnYXRvbScsXG4gICAgICAgICAgdmFsdWU6ICdbR21haWxdL1RyYXNoJ1xuICAgICAgICB9XVxuICAgICAgfSwgWydPSyddKS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG5cbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydNT1ZFJ11cbiAgICAgIGJyLm1vdmVNZXNzYWdlcygnSU5CT1gnLCAnMToyJywgJ1tHbWFpbF0vVHJhc2gnLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZhbGxiYWNrIHRvIGNvcHkrZXhwdW5nZScsIChkb25lKSA9PiB7XG4gICAgICBici5jb3B5TWVzc2FnZXMud2l0aEFyZ3MoJ0lOQk9YJywgJzE6MicsICdbR21haWxdL1RyYXNoJywge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkucmV0dXJucyhQcm9taXNlLnJlc29sdmUoKSlcbiAgICAgIGJyLmRlbGV0ZU1lc3NhZ2VzLndpdGhBcmdzKCcxOjInLCB7XG4gICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgpKVxuXG4gICAgICBici5fY2FwYWJpbGl0eSA9IFtdXG4gICAgICBici5tb3ZlTWVzc2FnZXMoJ0lOQk9YJywgJzE6MicsICdbR21haWxdL1RyYXNoJywge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5kZWxldGVNZXNzYWdlcy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19zaG91bGRTZWxlY3RNYWlsYm94JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRydWUgd2hlbiBjdHggaXMgdW5kZWZpbmVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9zaG91bGRTZWxlY3RNYWlsYm94KCdwYXRoJykpLnRvLmJlLnRydWVcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIGEgZGlmZmVyZW50IHBhdGggaXMgcXVldWVkJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQsICdnZXRQcmV2aW91c2x5UXVldWVkJykucmV0dXJucyh7XG4gICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICBjb21tYW5kOiAnU0VMRUNUJyxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ3F1ZXVlZCBwYXRoJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChici5fc2hvdWxkU2VsZWN0TWFpbGJveCgncGF0aCcsIHt9KSkudG8uYmUudHJ1ZVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSB3aGVuIHRoZSBzYW1lIHBhdGggaXMgcXVldWVkJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1Yihici5jbGllbnQsICdnZXRQcmV2aW91c2x5UXVldWVkJykucmV0dXJucyh7XG4gICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICBjb21tYW5kOiAnU0VMRUNUJyxcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ3F1ZXVlZCBwYXRoJ1xuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChici5fc2hvdWxkU2VsZWN0TWFpbGJveCgncXVldWVkIHBhdGgnLCB7fSkpLnRvLmJlLmZhbHNlXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI3NlbGVjdE1haWxib3gnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzaW5vbi5zdHViKGJyLCAnZXhlYycpXG4gICAgICBzaW5vbi5zdHViKGJyLCAnX3BhcnNlU0VMRUNUJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBydW4gU0VMRUNUJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmV4ZWMud2l0aEFyZ3Moe1xuICAgICAgICBjb21tYW5kOiAnU0VMRUNUJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICB2YWx1ZTogJ1tHbWFpbF0vVHJhc2gnXG4gICAgICAgIH1dXG4gICAgICB9KS5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG5cbiAgICAgIGJyLnNlbGVjdE1haWxib3goJ1tHbWFpbF0vVHJhc2gnKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJyLmV4ZWMuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICBleHBlY3QoYnIuX3BhcnNlU0VMRUNULndpdGhBcmdzKCdhYmMnKS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChici5fc3RhdGUpLnRvLmVxdWFsKGJyLlNUQVRFX1NFTEVDVEVEKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJ1biBTRUxFQ1Qgd2l0aCBDT05EU1RPUkUnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy53aXRoQXJncyh7XG4gICAgICAgIGNvbW1hbmQ6ICdTRUxFQ1QnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIHZhbHVlOiAnW0dtYWlsXS9UcmFzaCdcbiAgICAgICAgfSxcbiAgICAgICAgW3tcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgdmFsdWU6ICdDT05EU1RPUkUnXG4gICAgICAgIH1dXG4gICAgICAgIF1cbiAgICAgIH0pLnJldHVybnMoUHJvbWlzZS5yZXNvbHZlKCdhYmMnKSlcblxuICAgICAgYnIuX2NhcGFiaWxpdHkgPSBbJ0NPTkRTVE9SRSddXG4gICAgICBici5zZWxlY3RNYWlsYm94KCdbR21haWxdL1RyYXNoJywge1xuICAgICAgICBjb25kc3RvcmU6IHRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBleHBlY3QoYnIuZXhlYy5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIGV4cGVjdChici5fcGFyc2VTRUxFQ1Qud2l0aEFyZ3MoJ2FiYycpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KGJyLl9zdGF0ZSkudG8uZXF1YWwoYnIuU1RBVEVfU0VMRUNURUQpXG4gICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCdzaG91bGQgZW1pdCBvbnNlbGVjdG1haWxib3ggYmVmb3JlIHNlbGVjdE1haWxib3ggaXMgcmVzb2x2ZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG4gICAgICAgIGJyLl9wYXJzZVNFTEVDVC53aXRoQXJncygnYWJjJykucmV0dXJucygnZGVmJylcbiAgICAgIH0pXG5cbiAgICAgIGl0KCd3aGVuIGl0IHJldHVybnMgYSBwcm9taXNlJywgKGRvbmUpID0+IHtcbiAgICAgICAgdmFyIHByb21pc2VSZXNvbHZlZCA9IGZhbHNlXG4gICAgICAgIGJyLm9uc2VsZWN0bWFpbGJveCA9ICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgcHJvbWlzZVJlc29sdmVkID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICB2YXIgb25zZWxlY3RtYWlsYm94U3B5ID0gc2lub24uc3B5KGJyLCAnb25zZWxlY3RtYWlsYm94JylcbiAgICAgICAgYnIuc2VsZWN0TWFpbGJveCgnW0dtYWlsXS9UcmFzaCcpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChici5fcGFyc2VTRUxFQ1QuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICAgIGV4cGVjdChvbnNlbGVjdG1haWxib3hTcHkud2l0aEFyZ3MoJ1tHbWFpbF0vVHJhc2gnLCAnZGVmJykuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICAgIGV4cGVjdChwcm9taXNlUmVzb2x2ZWQpLnRvLmVxdWFsKHRydWUpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH0pLmNhdGNoKGRvbmUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnd2hlbiBpdCBkb2VzIG5vdCByZXR1cm4gYSBwcm9taXNlJywgKGRvbmUpID0+IHtcbiAgICAgICAgYnIub25zZWxlY3RtYWlsYm94ID0gKCkgPT4geyB9XG4gICAgICAgIHZhciBvbnNlbGVjdG1haWxib3hTcHkgPSBzaW5vbi5zcHkoYnIsICdvbnNlbGVjdG1haWxib3gnKVxuICAgICAgICBici5zZWxlY3RNYWlsYm94KCdbR21haWxdL1RyYXNoJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGJyLl9wYXJzZVNFTEVDVC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KG9uc2VsZWN0bWFpbGJveFNweS53aXRoQXJncygnW0dtYWlsXS9UcmFzaCcsICdkZWYnKS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH0pLmNhdGNoKGRvbmUpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGVtaXQgb25jbG9zZW1haWxib3gnLCAoZG9uZSkgPT4ge1xuICAgICAgYnIuZXhlYy5yZXR1cm5zKFByb21pc2UucmVzb2x2ZSgnYWJjJykpXG4gICAgICBici5fcGFyc2VTRUxFQ1Qud2l0aEFyZ3MoJ2FiYycpLnJldHVybnMoJ2RlZicpXG5cbiAgICAgIGJyLm9uY2xvc2VtYWlsYm94ID0gKHBhdGgpID0+IGV4cGVjdChwYXRoKS50by5lcXVhbCgneXl5JylcblxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICd5eXknXG4gICAgICBici5zZWxlY3RNYWlsYm94KCdbR21haWxdL1RyYXNoJykudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChici5fcGFyc2VTRUxFQ1QuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgfSkudGhlbihkb25lKS5jYXRjaChkb25lKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNoYXNDYXBhYmlsaXR5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZGV0ZWN0IGV4aXN0aW5nIGNhcGFiaWxpdHknLCAoKSA9PiB7XG4gICAgICBici5fY2FwYWJpbGl0eSA9IFsnWlpaJ11cbiAgICAgIGV4cGVjdChici5oYXNDYXBhYmlsaXR5KCd6enonKSkudG8uYmUudHJ1ZVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGRldGVjdCBub24gZXhpc3RpbmcgY2FwYWJpbGl0eScsICgpID0+IHtcbiAgICAgIGJyLl9jYXBhYmlsaXR5ID0gWydaWlonXVxuICAgICAgZXhwZWN0KGJyLmhhc0NhcGFiaWxpdHkoJ29vbycpKS50by5iZS5mYWxzZVxuICAgICAgZXhwZWN0KGJyLmhhc0NhcGFiaWxpdHkoKSkudG8uYmUuZmFsc2VcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3VudGFnZ2VkT2tIYW5kbGVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgdXBkYXRlIGNhcGFiaWxpdHkgaWYgcHJlc2VudCcsICgpID0+IHtcbiAgICAgIGJyLl91bnRhZ2dlZE9rSGFuZGxlcih7XG4gICAgICAgIGNhcGFiaWxpdHk6IFsnYWJjJ11cbiAgICAgIH0sICgpID0+IHsgfSlcbiAgICAgIGV4cGVjdChici5fY2FwYWJpbGl0eSkudG8uZGVlcC5lcXVhbChbJ2FiYyddKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfdW50YWdnZWRDYXBhYmlsaXR5SGFuZGxlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHVwZGF0ZSBjYXBhYmlsaXR5JywgKCkgPT4ge1xuICAgICAgYnIuX3VudGFnZ2VkQ2FwYWJpbGl0eUhhbmRsZXIoe1xuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHZhbHVlOiAnYWJjJ1xuICAgICAgICB9XVxuICAgICAgfSwgKCkgPT4geyB9KVxuICAgICAgZXhwZWN0KGJyLl9jYXBhYmlsaXR5KS50by5kZWVwLmVxdWFsKFsnQUJDJ10pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI191bnRhZ2dlZEV4aXN0c0hhbmRsZXInLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBlbWl0IG9udXBkYXRlJywgKCkgPT4ge1xuICAgICAgYnIub251cGRhdGUgPSBzaW5vbi5zdHViKClcbiAgICAgIGJyLl9zZWxlY3RlZE1haWxib3ggPSAnRk9PJ1xuXG4gICAgICBici5fdW50YWdnZWRFeGlzdHNIYW5kbGVyKHtcbiAgICAgICAgbnI6IDEyM1xuICAgICAgfSwgKCkgPT4geyB9KVxuICAgICAgZXhwZWN0KGJyLm9udXBkYXRlLndpdGhBcmdzKCdGT08nLCAnZXhpc3RzJywgMTIzKS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI191bnRhZ2dlZEV4cHVuZ2VIYW5kbGVyJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZW1pdCBvbnVwZGF0ZScsICgpID0+IHtcbiAgICAgIGJyLm9udXBkYXRlID0gc2lub24uc3R1YigpXG4gICAgICBici5fc2VsZWN0ZWRNYWlsYm94ID0gJ0ZPTydcblxuICAgICAgYnIuX3VudGFnZ2VkRXhwdW5nZUhhbmRsZXIoe1xuICAgICAgICBucjogMTIzXG4gICAgICB9LCAoKSA9PiB7IH0pXG4gICAgICBleHBlY3QoYnIub251cGRhdGUud2l0aEFyZ3MoJ0ZPTycsICdleHB1bmdlJywgMTIzKS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI191bnRhZ2dlZEZldGNoSGFuZGxlcicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGVtaXQgb251cGRhdGUnLCAoKSA9PiB7XG4gICAgICBici5vbnVwZGF0ZSA9IHNpbm9uLnN0dWIoKVxuICAgICAgc2lub24uc3R1YihiciwgJ19wYXJzZUZFVENIJykucmV0dXJucygnYWJjJylcbiAgICAgIGJyLl9zZWxlY3RlZE1haWxib3ggPSAnRk9PJ1xuXG4gICAgICBici5fdW50YWdnZWRGZXRjaEhhbmRsZXIoe1xuICAgICAgICBucjogMTIzXG4gICAgICB9LCAoKSA9PiB7IH0pXG4gICAgICBleHBlY3QoYnIub251cGRhdGUud2l0aEFyZ3MoJ0ZPTycsICdmZXRjaCcsICdhYmMnKS5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0guYXJnc1swXVswXSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBGRVRDSDogW3tcbiAgICAgICAgICAgIG5yOiAxMjNcbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfcGFyc2VTRUxFQ1QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBwYXJzZSBhIGNvbXBsZXRlIHJlc3BvbnNlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9wYXJzZVNFTEVDVCh7XG4gICAgICAgIGNvZGU6ICdSRUFELVdSSVRFJyxcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIEVYSVNUUzogW3tcbiAgICAgICAgICAgIG5yOiAxMjNcbiAgICAgICAgICB9XSxcbiAgICAgICAgICBGTEFHUzogW3tcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdcXFxcQW5zd2VyZWQnXG4gICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdcXFxcRmxhZ2dlZCdcbiAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XSxcbiAgICAgICAgICBPSzogW3tcbiAgICAgICAgICAgIGNvZGU6ICdQRVJNQU5FTlRGTEFHUycsXG4gICAgICAgICAgICBwZXJtYW5lbnRmbGFnczogWydcXFxcQW5zd2VyZWQnLCAnXFxcXEZsYWdnZWQnXVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGNvZGU6ICdVSURWQUxJRElUWScsXG4gICAgICAgICAgICB1aWR2YWxpZGl0eTogJzInXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgY29kZTogJ1VJRE5FWFQnLFxuICAgICAgICAgICAgdWlkbmV4dDogJzM4MzYxJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGNvZGU6ICdISUdIRVNUTU9EU0VRJyxcbiAgICAgICAgICAgIGhpZ2hlc3Rtb2RzZXE6ICczNjgyOTE4J1xuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgZXhpc3RzOiAxMjMsXG4gICAgICAgIGZsYWdzOiBbJ1xcXFxBbnN3ZXJlZCcsICdcXFxcRmxhZ2dlZCddLFxuICAgICAgICBoaWdoZXN0TW9kc2VxOiAnMzY4MjkxOCcsXG4gICAgICAgIHBlcm1hbmVudEZsYWdzOiBbJ1xcXFxBbnN3ZXJlZCcsICdcXFxcRmxhZ2dlZCddLFxuICAgICAgICByZWFkT25seTogZmFsc2UsXG4gICAgICAgIHVpZE5leHQ6IDM4MzYxLFxuICAgICAgICB1aWRWYWxpZGl0eTogMlxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwYXJzZSByZXNwb25zZSB3aXRoIG5vIG1vZHNlcScsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fcGFyc2VTRUxFQ1Qoe1xuICAgICAgICBjb2RlOiAnUkVBRC1XUklURScsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBFWElTVFM6IFt7XG4gICAgICAgICAgICBucjogMTIzXG4gICAgICAgICAgfV0sXG4gICAgICAgICAgRkxBR1M6IFt7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgICAgIFt7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnXFxcXEFuc3dlcmVkJ1xuICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnXFxcXEZsYWdnZWQnXG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfV0sXG4gICAgICAgICAgT0s6IFt7XG4gICAgICAgICAgICBjb2RlOiAnUEVSTUFORU5URkxBR1MnLFxuICAgICAgICAgICAgcGVybWFuZW50ZmxhZ3M6IFsnXFxcXEFuc3dlcmVkJywgJ1xcXFxGbGFnZ2VkJ11cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBjb2RlOiAnVUlEVkFMSURJVFknLFxuICAgICAgICAgICAgdWlkdmFsaWRpdHk6ICcyJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGNvZGU6ICdVSURORVhUJyxcbiAgICAgICAgICAgIHVpZG5leHQ6ICczODM2MSdcbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGV4aXN0czogMTIzLFxuICAgICAgICBmbGFnczogWydcXFxcQW5zd2VyZWQnLCAnXFxcXEZsYWdnZWQnXSxcbiAgICAgICAgcGVybWFuZW50RmxhZ3M6IFsnXFxcXEFuc3dlcmVkJywgJ1xcXFxGbGFnZ2VkJ10sXG4gICAgICAgIHJlYWRPbmx5OiBmYWxzZSxcbiAgICAgICAgdWlkTmV4dDogMzgzNjEsXG4gICAgICAgIHVpZFZhbGlkaXR5OiAyXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHBhcnNlIHJlc3BvbnNlIHdpdGggcmVhZC1vbmx5JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9wYXJzZVNFTEVDVCh7XG4gICAgICAgIGNvZGU6ICdSRUFELU9OTFknLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgRVhJU1RTOiBbe1xuICAgICAgICAgICAgbnI6IDEyM1xuICAgICAgICAgIH1dLFxuICAgICAgICAgIEZMQUdTOiBbe1xuICAgICAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgICAgICBbe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ1xcXFxBbnN3ZXJlZCdcbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ1xcXFxGbGFnZ2VkJ1xuICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1dLFxuICAgICAgICAgIE9LOiBbe1xuICAgICAgICAgICAgY29kZTogJ1BFUk1BTkVOVEZMQUdTJyxcbiAgICAgICAgICAgIHBlcm1hbmVudGZsYWdzOiBbJ1xcXFxBbnN3ZXJlZCcsICdcXFxcRmxhZ2dlZCddXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgY29kZTogJ1VJRFZBTElESVRZJyxcbiAgICAgICAgICAgIHVpZHZhbGlkaXR5OiAnMidcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBjb2RlOiAnVUlETkVYVCcsXG4gICAgICAgICAgICB1aWRuZXh0OiAnMzgzNjEnXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBleGlzdHM6IDEyMyxcbiAgICAgICAgZmxhZ3M6IFsnXFxcXEFuc3dlcmVkJywgJ1xcXFxGbGFnZ2VkJ10sXG4gICAgICAgIHBlcm1hbmVudEZsYWdzOiBbJ1xcXFxBbnN3ZXJlZCcsICdcXFxcRmxhZ2dlZCddLFxuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgdWlkTmV4dDogMzgzNjEsXG4gICAgICAgIHVpZFZhbGlkaXR5OiAyXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHBhcnNlIHJlc3BvbnNlIHdpdGggTk9NT0RTRVEgZmxhZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fcGFyc2VTRUxFQ1Qoe1xuICAgICAgICBjb2RlOiAnUkVBRC1XUklURScsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBFWElTVFM6IFt7XG4gICAgICAgICAgICBucjogMTIzXG4gICAgICAgICAgfV0sXG4gICAgICAgICAgRkxBR1M6IFt7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgICAgIFt7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnXFxcXEFuc3dlcmVkJ1xuICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnXFxcXEZsYWdnZWQnXG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfV0sXG4gICAgICAgICAgT0s6IFt7XG4gICAgICAgICAgICBjb2RlOiAnUEVSTUFORU5URkxBR1MnLFxuICAgICAgICAgICAgcGVybWFuZW50ZmxhZ3M6IFsnXFxcXEFuc3dlcmVkJywgJ1xcXFxGbGFnZ2VkJ11cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBjb2RlOiAnVUlEVkFMSURJVFknLFxuICAgICAgICAgICAgdWlkdmFsaWRpdHk6ICcyJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGNvZGU6ICdVSURORVhUJyxcbiAgICAgICAgICAgIHVpZG5leHQ6ICczODM2MSdcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBjb2RlOiAnTk9NT0RTRVEnXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBleGlzdHM6IDEyMyxcbiAgICAgICAgZmxhZ3M6IFsnXFxcXEFuc3dlcmVkJywgJ1xcXFxGbGFnZ2VkJ10sXG4gICAgICAgIHBlcm1hbmVudEZsYWdzOiBbJ1xcXFxBbnN3ZXJlZCcsICdcXFxcRmxhZ2dlZCddLFxuICAgICAgICByZWFkT25seTogZmFsc2UsXG4gICAgICAgIHVpZE5leHQ6IDM4MzYxLFxuICAgICAgICB1aWRWYWxpZGl0eTogMixcbiAgICAgICAgbm9Nb2RzZXE6IHRydWVcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19wYXJzZU5BTUVTUEFDRScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIG5vdCBzdWNjZWVkIGZvciBubyBuYW1lc3BhY2UgcmVzcG9uc2UnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX3BhcnNlTkFNRVNQQUNFKHtcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIE5BTUVTUEFDRTogW11cbiAgICAgICAgfVxuICAgICAgfSkpLnRvLmJlLmZhbHNlXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHNpbmdsZSBwZXJzb25hbCBuYW1lc3BhY2UnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX3BhcnNlTkFNRVNQQUNFKHtcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIE5BTUVTUEFDRTogW3tcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFt7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnSU5CT1guJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICcuJ1xuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgIF0sIG51bGwsIG51bGxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIHBlcnNvbmFsOiBbe1xuICAgICAgICAgIHByZWZpeDogJ0lOQk9YLicsXG4gICAgICAgICAgZGVsaW1pdGVyOiAnLidcbiAgICAgICAgfV0sXG4gICAgICAgIHVzZXJzOiBmYWxzZSxcbiAgICAgICAgc2hhcmVkOiBmYWxzZVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc2luZ2xlIHBlcnNvbmFsLCBzaW5nbGUgdXNlcnMsIG11bHRpcGxlIHNoYXJlZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fcGFyc2VOQU1FU1BBQ0Uoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgTkFNRVNQQUNFOiBbe1xuICAgICAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgICAgICAvLyBwZXJzb25hbFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJy8nXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgLy8gdXNlcnNcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFt7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnfidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnLydcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAvLyBzaGFyZWRcbiAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFt7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnI3NoYXJlZC8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJy8nXG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICcjcHVibGljLydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnLydcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBwZXJzb25hbDogW3tcbiAgICAgICAgICBwcmVmaXg6ICcnLFxuICAgICAgICAgIGRlbGltaXRlcjogJy8nXG4gICAgICAgIH1dLFxuICAgICAgICB1c2VyczogW3tcbiAgICAgICAgICBwcmVmaXg6ICd+JyxcbiAgICAgICAgICBkZWxpbWl0ZXI6ICcvJ1xuICAgICAgICB9XSxcbiAgICAgICAgc2hhcmVkOiBbe1xuICAgICAgICAgIHByZWZpeDogJyNzaGFyZWQvJyxcbiAgICAgICAgICBkZWxpbWl0ZXI6ICcvJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgcHJlZml4OiAnI3B1YmxpYy8nLFxuICAgICAgICAgIGRlbGltaXRlcjogJy8nXG4gICAgICAgIH1dXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGhhbmRsZSBOSUwgbmFtZXNwYWNlIGhpZXJhcmNoeSBkZWxpbScsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fcGFyc2VOQU1FU1BBQ0Uoe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgTkFNRVNQQUNFOiBbXG4gICAgICAgICAgICAvLyBUaGlzIHNwZWNpZmljIHZhbHVlIGlzIHJldHVybmVkIGJ5IHlhaG9vLmNvLmpwJ3NcbiAgICAgICAgICAgIC8vIGltYXBnYXRlIHZlcnNpb24gMC43LjY4XzExXzEuNjE0NzUgSU1BUCBzZXJ2ZXJcbiAgICAgICAgICAgIHBhcnNlcih0b1R5cGVkQXJyYXkoJyogTkFNRVNQQUNFICgoXCJcIiBOSUwpKSBOSUwgTklMJykpXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIHBlcnNvbmFsOiBbe1xuICAgICAgICAgIHByZWZpeDogJycsXG4gICAgICAgICAgZGVsaW1pdGVyOiBudWxsXG4gICAgICAgIH1dLFxuICAgICAgICB1c2VyczogZmFsc2UsXG4gICAgICAgIHNoYXJlZDogZmFsc2VcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19idWlsZEZFVENIQ29tbWFuZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGJ1aWxkIHNpbmdsZSBBTEwnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX2J1aWxkRkVUQ0hDb21tYW5kKCcxOionLCBbJ2FsbCddLCB7fSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjb21tYW5kOiAnRkVUQ0gnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdTRVFVRU5DRScsXG4gICAgICAgICAgdmFsdWU6ICcxOionXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgdmFsdWU6ICdBTEwnXG4gICAgICAgIH1dXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGJ1aWxkIEZFVENIIHdpdGggdWlkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZEZFVENIQ29tbWFuZCgnMToqJywgWydhbGwnXSwge1xuICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgfSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjb21tYW5kOiAnVUlEIEZFVENIJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB0eXBlOiAnU0VRVUVOQ0UnLFxuICAgICAgICAgIHZhbHVlOiAnMToqJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnQUxMJ1xuICAgICAgICB9XVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBidWlsZCBGRVRDSCB3aXRoIHVpZCwgZW52ZWxvcGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX2J1aWxkRkVUQ0hDb21tYW5kKCcxOionLCBbJ3VpZCcsICdlbnZlbG9wZSddLCB7fSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjb21tYW5kOiAnRkVUQ0gnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdTRVFVRU5DRScsXG4gICAgICAgICAgdmFsdWU6ICcxOionXG4gICAgICAgIH0sXG4gICAgICAgIFt7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnVUlEJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnRU5WRUxPUEUnXG4gICAgICAgIH1dXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgYnVpbGQgRkVUQ0ggd2l0aCBtb2RzZXEnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX2J1aWxkRkVUQ0hDb21tYW5kKCcxOionLCBbJ21vZHNlcSAoMTIzNDU2NyknXSwge30pKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgY29tbWFuZDogJ0ZFVENIJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB0eXBlOiAnU0VRVUVOQ0UnLFxuICAgICAgICAgIHZhbHVlOiAnMToqJ1xuICAgICAgICB9LFxuICAgICAgICBbe1xuICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICB2YWx1ZTogJ01PRFNFUSdcbiAgICAgICAgfSxcbiAgICAgICAgW3tcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgdmFsdWU6ICcxMjM0NTY3J1xuICAgICAgICB9XVxuICAgICAgICBdXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgYnVpbGQgRkVUQ0ggd2l0aCBzZWN0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZEZFVENIQ29tbWFuZCgnMToqJywgWydib2R5W3RleHRdJ10sIHt9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGNvbW1hbmQ6ICdGRVRDSCcsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ1NFUVVFTkNFJyxcbiAgICAgICAgICB2YWx1ZTogJzE6KidcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICB2YWx1ZTogJ0JPRFknLFxuICAgICAgICAgIHNlY3Rpb246IFt7XG4gICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICB2YWx1ZTogJ1RFWFQnXG4gICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgYnVpbGQgRkVUQ0ggd2l0aCBzZWN0aW9uIGFuZCBsaXN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZEZFVENIQ29tbWFuZCgnMToqJywgWydib2R5W2hlYWRlci5maWVsZHMgKGRhdGUgaW4tcmVwbHktdG8pXSddLCB7fSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjb21tYW5kOiAnRkVUQ0gnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdTRVFVRU5DRScsXG4gICAgICAgICAgdmFsdWU6ICcxOionXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgdmFsdWU6ICdCT0RZJyxcbiAgICAgICAgICBzZWN0aW9uOiBbe1xuICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgdmFsdWU6ICdIRUFERVIuRklFTERTJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgW3tcbiAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgIHZhbHVlOiAnREFURSdcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICB2YWx1ZTogJ0lOLVJFUExZLVRPJ1xuICAgICAgICAgIH1dXG4gICAgICAgICAgXVxuICAgICAgICB9XVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBidWlsZCBGRVRDSCB3aXRoICcsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fYnVpbGRGRVRDSENvbW1hbmQoJzE6KicsIFsnYWxsJ10sIHtcbiAgICAgICAgY2hhbmdlZFNpbmNlOiAnMTIzNDU2J1xuICAgICAgfSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjb21tYW5kOiAnRkVUQ0gnLFxuICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICdTRVFVRU5DRScsXG4gICAgICAgICAgdmFsdWU6ICcxOionXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgdmFsdWU6ICdBTEwnXG4gICAgICAgIH0sXG4gICAgICAgIFt7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnQ0hBTkdFRFNJTkNFJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgIHZhbHVlOiAnMTIzNDU2J1xuICAgICAgICB9XVxuICAgICAgICBdXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGJ1aWxkIEZFVENIIHdpdGggcGFydGlhbCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fYnVpbGRGRVRDSENvbW1hbmQoJzE6KicsIFsnYm9keVtdJ10sIHt9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGNvbW1hbmQ6ICdGRVRDSCcsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ1NFUVVFTkNFJyxcbiAgICAgICAgICB2YWx1ZTogJzE6KidcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICB2YWx1ZTogJ0JPRFknLFxuICAgICAgICAgIHNlY3Rpb246IFtdXG4gICAgICAgIH1dXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGJ1aWxkIEZFVENIIHdpdGggdGhlIHZhbHVlQXNTdHJpbmcgb3B0aW9uJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZEZFVENIQ29tbWFuZCgnMToqJywgWydib2R5W10nXSwgeyB2YWx1ZUFzU3RyaW5nOiBmYWxzZSB9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGNvbW1hbmQ6ICdGRVRDSCcsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgdHlwZTogJ1NFUVVFTkNFJyxcbiAgICAgICAgICB2YWx1ZTogJzE6KidcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICB2YWx1ZTogJ0JPRFknLFxuICAgICAgICAgIHNlY3Rpb246IFtdXG4gICAgICAgIH1dLFxuICAgICAgICB2YWx1ZUFzU3RyaW5nOiBmYWxzZVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3BhcnNlRkVUQ0gnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdmFsdWVzIGxvd2VyY2FzZSBrZXlzJywgKCkgPT4ge1xuICAgICAgc2lub24uc3R1YihiciwgJ19wYXJzZUZldGNoVmFsdWUnKS5yZXR1cm5zKCdkZWYnKVxuICAgICAgZXhwZWN0KGJyLl9wYXJzZUZFVENIKHtcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIEZFVENIOiBbe1xuICAgICAgICAgICAgbnI6IDEyMyxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdCT0RZJyxcbiAgICAgICAgICAgICAgICBzZWN0aW9uOiBbe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICdIRUFERVInXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBbe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgICAgdmFsdWU6ICdEQVRFJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiAnU1VCSkVDVCdcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcGFydGlhbDogWzAsIDEyM11cbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ2FiYydcbiAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KSkudG8uZGVlcC5lcXVhbChbe1xuICAgICAgICAnIyc6IDEyMyxcbiAgICAgICAgJ2JvZHlbaGVhZGVyIChkYXRlIHN1YmplY3QpXTwwLjEyMz4nOiAnZGVmJ1xuICAgICAgfV0pXG5cbiAgICAgIGV4cGVjdChici5fcGFyc2VGZXRjaFZhbHVlLndpdGhBcmdzKCdib2R5W2hlYWRlciAoZGF0ZSBzdWJqZWN0KV08MC4xMjM+Jywge1xuICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgIHZhbHVlOiAnYWJjJ1xuICAgICAgfSkuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIG1lcmdlIG11bHRpcGxlIHJlc3BvbnNlcyBiYXNlZCBvbiBzZXF1ZW5jZSBudW1iZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX3BhcnNlRkVUQ0goe1xuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgRkVUQ0g6IFt7XG4gICAgICAgICAgICBucjogMTIzLFxuICAgICAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgICAgICBbe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ1VJRCdcbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogNzg5XG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgbnI6IDEyNCxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtcbiAgICAgICAgICAgICAgW3tcbiAgICAgICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdVSUQnXG4gICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnQVRPTScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IDc5MFxuICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5yOiAxMjMsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXG4gICAgICAgICAgICAgIFt7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTU9EU0VRJ1xuICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0FUT00nLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnMTI3J1xuICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIH0pKS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgICcjJzogMTIzLFxuICAgICAgICAndWlkJzogNzg5LFxuICAgICAgICAnbW9kc2VxJzogJzEyNydcbiAgICAgIH0sIHtcbiAgICAgICAgJyMnOiAxMjQsXG4gICAgICAgICd1aWQnOiA3OTBcbiAgICAgIH1dKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfcGFyc2VFTlZFTE9QRScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHBhcnNlZCBlbnZlbG9wZSBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX3BhcnNlRU5WRUxPUEUodGVzdEVudmVsb3BlLnNvdXJjZSkpLnRvLmRlZXAuZXF1YWwodGVzdEVudmVsb3BlLnBhcnNlZClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3BhcnNlQk9EWVNUUlVDVFVSRScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHBhcnNlIGJvZHlzdHJ1Y3R1cmUgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9wYXJzZUJPRFlTVFJVQ1RVUkUobWltZVRvcnR1cmUuc291cmNlKSkudG8uZGVlcC5lcXVhbChtaW1lVG9ydHVyZS5wYXJzZWQpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcGFyc2UgYm9keXN0cnVjdHVyZSB3aXRoIHVuaWNvZGUgZmlsZW5hbWUnLCAoKSA9PiB7XG4gICAgICB2YXIgaW5wdXQgPSBbXG4gICAgICAgIFt7XG4gICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgdmFsdWU6ICdBUFBMSUNBVElPTidcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIHZhbHVlOiAnT0NURVQtU1RSRUFNJ1xuICAgICAgICB9LFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBudWxsLCB7XG4gICAgICAgICAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICAgICAgICAgIHZhbHVlOiAnQkFTRTY0J1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHR5cGU6ICdBVE9NJyxcbiAgICAgICAgICAgIHZhbHVlOiAnNDAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBudWxsLCBbe1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ0FUVEFDSE1FTlQnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgICB2YWx1ZTogJ0ZJTEVOQU1FJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgICAgdmFsdWU6ICc9P0lTTy04ODU5LTE/UT9CQlJfSGFuZGVsLF9HZXdlcmJlLF9CPUZDcm9iZXRyaWViZSw/PSA9P0lTTy04ODU5LTE/UT9fcHJpdmF0ZV9CaWxkdW5nc2VpbnJpY2h0dW5nZW4udHh0Pz0nXG4gICAgICAgICAgfV1cbiAgICAgICAgICBdLFxuICAgICAgICAgIG51bGxcbiAgICAgICAgXSwge1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIHZhbHVlOiAnTUlYRUQnXG4gICAgICAgIH0sXG4gICAgICAgIFt7XG4gICAgICAgICAgdHlwZTogJ1NUUklORycsXG4gICAgICAgICAgdmFsdWU6ICdCT1VOREFSWSdcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdTVFJJTkcnLFxuICAgICAgICAgIHZhbHVlOiAnLS0tLXNpbmlrYWVsLT89XzEtMTQxMDUwODUyNjUxMTAuNDk5MDM5MjI0NTgxNzkyOTUnXG4gICAgICAgIH1dLFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsXG4gICAgICBdXG5cbiAgICAgIHZhciBleHBlY3RlZCA9IHtcbiAgICAgICAgY2hpbGROb2RlczogW3tcbiAgICAgICAgICBwYXJ0OiAnMScsXG4gICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScsXG4gICAgICAgICAgZW5jb2Rpbmc6ICdiYXNlNjQnLFxuICAgICAgICAgIHNpemU6IDQwLFxuICAgICAgICAgIGRpc3Bvc2l0aW9uOiAnYXR0YWNobWVudCcsXG4gICAgICAgICAgZGlzcG9zaXRpb25QYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICBmaWxlbmFtZTogJ0JCUiBIYW5kZWwsIEdld2VyYmUsIELDvHJvYmV0cmllYmUsIHByaXZhdGUgQmlsZHVuZ3NlaW5yaWNodHVuZ2VuLnR4dCdcbiAgICAgICAgICB9XG4gICAgICAgIH1dLFxuICAgICAgICB0eXBlOiAnbXVsdGlwYXJ0L21peGVkJyxcbiAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgIGJvdW5kYXJ5OiAnLS0tLXNpbmlrYWVsLT89XzEtMTQxMDUwODUyNjUxMTAuNDk5MDM5MjI0NTgxNzkyOTUnXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZXhwZWN0KGJyLl9wYXJzZUJPRFlTVFJVQ1RVUkUoaW5wdXQpKS50by5kZWVwLmVxdWFsKGV4cGVjdGVkKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfYnVpbGRTRUFSQ0hDb21tYW5kJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgY29tcG9zZSBhIHNlYXJjaCBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZFNFQVJDSENvbW1hbmQoe1xuICAgICAgICB1bnNlZW46IHRydWUsXG4gICAgICAgIGhlYWRlcjogWydzdWJqZWN0JywgJ2hlbGxvIHdvcmxkJ10sXG4gICAgICAgIG9yOiB7XG4gICAgICAgICAgdW5zZWVuOiB0cnVlLFxuICAgICAgICAgIHNlZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgbm90OiB7XG4gICAgICAgICAgc2VlbjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBzZW50YmVmb3JlOiBuZXcgRGF0ZSgyMDExLCAxLCAzLCAxMiwgMCwgMCksXG4gICAgICAgIHNpbmNlOiBuZXcgRGF0ZSgyMDExLCAxMSwgMjMsIDEyLCAwLCAwKSxcbiAgICAgICAgdWlkOiAnMToqJyxcbiAgICAgICAgJ1gtR00tTVNHSUQnOiAnMTQ5OTI1NzY0NzQ5MDY2Mjk3MCcsXG4gICAgICAgICdYLUdNLVRIUklEJzogJzE0OTkyNTc2NDc0OTA2NjI5NzEnXG4gICAgICB9LCB7fSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjb21tYW5kOiAnU0VBUkNIJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnVU5TRUVOJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJ0hFQURFUidcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ3N0cmluZycsXG4gICAgICAgICAgJ3ZhbHVlJzogJ3N1YmplY3QnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdzdHJpbmcnLFxuICAgICAgICAgICd2YWx1ZSc6ICdoZWxsbyB3b3JsZCdcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdPUidcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdVTlNFRU4nXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnU0VFTidcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdOT1QnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnU0VFTidcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdTRU5UQkVGT1JFJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJzMtRmViLTIwMTEnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnU0lOQ0UnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnMjMtRGVjLTIwMTEnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnVUlEJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3R5cGUnOiAnc2VxdWVuY2UnLFxuICAgICAgICAgICd2YWx1ZSc6ICcxOionXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnWC1HTS1NU0dJRCdcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ251bWJlcicsXG4gICAgICAgICAgJ3ZhbHVlJzogJzE0OTkyNTc2NDc0OTA2NjI5NzAnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnWC1HTS1USFJJRCdcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ251bWJlcicsXG4gICAgICAgICAgJ3ZhbHVlJzogJzE0OTkyNTc2NDc0OTA2NjI5NzEnXG4gICAgICAgIH1dXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNvbXBvc2UgYW4gdW5pY29kZSBzZWFyY2ggY29tbWFuZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fYnVpbGRTRUFSQ0hDb21tYW5kKHtcbiAgICAgICAgYm9keTogJ2rDtWdldmEnXG4gICAgICB9LCB7fSkpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjb21tYW5kOiAnU0VBUkNIJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICB0eXBlOiAnYXRvbScsXG4gICAgICAgICAgdmFsdWU6ICdDSEFSU0VUJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ2F0b20nLFxuICAgICAgICAgIHZhbHVlOiAnVVRGLTgnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnYXRvbScsXG4gICAgICAgICAgdmFsdWU6ICdCT0RZJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ2xpdGVyYWwnLFxuICAgICAgICAgIHZhbHVlOiAnasODwrVnZXZhJ1xuICAgICAgICB9XVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX3BhcnNlU0VBUkNIJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcGFyc2UgU0VBUkNIIHJlc3BvbnNlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9wYXJzZVNFQVJDSCh7XG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBTRUFSQ0g6IFt7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgICB2YWx1ZTogNVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICB2YWx1ZTogN1xuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbe1xuICAgICAgICAgICAgICB2YWx1ZTogNlxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9KSkudG8uZGVlcC5lcXVhbChbNSwgNiwgN10pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcGFyc2UgZW1wdHkgU0VBUkNIIHJlc3BvbnNlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9wYXJzZVNFQVJDSCh7XG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBTRUFSQ0g6IFt7XG4gICAgICAgICAgICBjb21tYW5kOiAnU0VBUkNIJyxcbiAgICAgICAgICAgIHRhZzogJyonXG4gICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgfSkpLnRvLmRlZXAuZXF1YWwoW10pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19idWlsZFNUT1JFQ29tbWFuZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGNvbXBvc2UgYSBzdG9yZSBjb21tYW5kIGZyb20gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX2J1aWxkU1RPUkVDb21tYW5kKCcxLDIsMycsICdGTEFHUycsIFsnYScsICdiJ10sIHt9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGNvbW1hbmQ6ICdTVE9SRScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgJ3R5cGUnOiAnc2VxdWVuY2UnLFxuICAgICAgICAgICd2YWx1ZSc6ICcxLDIsMydcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdGTEFHUydcbiAgICAgICAgfSxcbiAgICAgICAgW3tcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnYSdcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdiJ1xuICAgICAgICB9XVxuICAgICAgICBdXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNvbXBvc2UgYSBzdG9yZSBzZXQgZmxhZ3MgY29tbWFuZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fYnVpbGRTVE9SRUNvbW1hbmQoJzEsMiwzJywgJ0ZMQUdTJywgWydhJywgJ2InXSwge30pKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgY29tbWFuZDogJ1NUT1JFJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAndHlwZSc6ICdzZXF1ZW5jZScsXG4gICAgICAgICAgJ3ZhbHVlJzogJzEsMiwzJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJ0ZMQUdTJ1xuICAgICAgICB9LFxuICAgICAgICBbe1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdhJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJ2InXG4gICAgICAgIH1dXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY29tcG9zZSBhIHN0b3JlIGFkZCBmbGFncyBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZFNUT1JFQ29tbWFuZCgnMSwyLDMnLCAnK0ZMQUdTJywgWydhJywgJ2InXSwge30pKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgY29tbWFuZDogJ1NUT1JFJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAndHlwZSc6ICdzZXF1ZW5jZScsXG4gICAgICAgICAgJ3ZhbHVlJzogJzEsMiwzJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJytGTEFHUydcbiAgICAgICAgfSxcbiAgICAgICAgW3tcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnYSdcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdiJ1xuICAgICAgICB9XVxuICAgICAgICBdXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNvbXBvc2UgYSBzdG9yZSByZW1vdmUgZmxhZ3MgY29tbWFuZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fYnVpbGRTVE9SRUNvbW1hbmQoJzEsMiwzJywgJy1GTEFHUycsIFsnYScsICdiJ10sIHt9KSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGNvbW1hbmQ6ICdTVE9SRScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgJ3R5cGUnOiAnc2VxdWVuY2UnLFxuICAgICAgICAgICd2YWx1ZSc6ICcxLDIsMydcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICctRkxBR1MnXG4gICAgICAgIH0sXG4gICAgICAgIFt7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJ2EnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnYidcbiAgICAgICAgfV1cbiAgICAgICAgXVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjb21wb3NlIGEgc3RvcmUgcmVtb3ZlIHNpbGVudCBmbGFncyBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZFNUT1JFQ29tbWFuZCgnMSwyLDMnLCAnLUZMQUdTJywgWydhJywgJ2InXSwge1xuICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgIH0pKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgY29tbWFuZDogJ1NUT1JFJyxcbiAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAndHlwZSc6ICdzZXF1ZW5jZScsXG4gICAgICAgICAgJ3ZhbHVlJzogJzEsMiwzJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJy1GTEFHUy5TSUxFTlQnXG4gICAgICAgIH0sXG4gICAgICAgIFt7XG4gICAgICAgICAgJ3R5cGUnOiAnYXRvbScsXG4gICAgICAgICAgJ3ZhbHVlJzogJ2EnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnYidcbiAgICAgICAgfV1cbiAgICAgICAgXVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjb21wb3NlIGEgdWlkIHN0b3JlIGZsYWdzIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnIuX2J1aWxkU1RPUkVDb21tYW5kKCcxLDIsMycsICdGTEFHUycsIFsnYScsICdiJ10sIHtcbiAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgIH0pKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgY29tbWFuZDogJ1VJRCBTVE9SRScsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgJ3R5cGUnOiAnc2VxdWVuY2UnLFxuICAgICAgICAgICd2YWx1ZSc6ICcxLDIsMydcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdGTEFHUydcbiAgICAgICAgfSxcbiAgICAgICAgW3tcbiAgICAgICAgICAndHlwZSc6ICdhdG9tJyxcbiAgICAgICAgICAndmFsdWUnOiAnYSdcbiAgICAgICAgfSwge1xuICAgICAgICAgICd0eXBlJzogJ2F0b20nLFxuICAgICAgICAgICd2YWx1ZSc6ICdiJ1xuICAgICAgICB9XVxuICAgICAgICBdXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJyNfY2hhbmdlU3RhdGUnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHN0YXRlIHZhbHVlJywgKCkgPT4ge1xuICAgICAgYnIuX2NoYW5nZVN0YXRlKDEyMzQ1KVxuXG4gICAgICBleHBlY3QoYnIuX3N0YXRlKS50by5lcXVhbCgxMjM0NSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBlbWl0IG9uY2xvc2VtYWlsYm94IGlmIG1haWxib3ggd2FzIGNsb3NlZCcsICgpID0+IHtcbiAgICAgIGJyLm9uY2xvc2VtYWlsYm94ID0gc2lub24uc3R1YigpXG4gICAgICBici5fc3RhdGUgPSBici5TVEFURV9TRUxFQ1RFRFxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICdhYWEnXG5cbiAgICAgIGJyLl9jaGFuZ2VTdGF0ZSgxMjM0NSlcblxuICAgICAgZXhwZWN0KGJyLl9zZWxlY3RlZE1haWxib3gpLnRvLmJlLmZhbHNlXG4gICAgICBleHBlY3QoYnIub25jbG9zZW1haWxib3gud2l0aEFyZ3MoJ2FhYScpLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCcjX2Vuc3VyZVBhdGgnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgdGhlIHBhdGggaWYgbm90IHByZXNlbnQnLCAoKSA9PiB7XG4gICAgICB2YXIgdHJlZSA9IHtcbiAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICB9XG4gICAgICBleHBlY3QoYnIuX2Vuc3VyZVBhdGgodHJlZSwgJ2hlbGxvL3dvcmxkJywgJy8nKSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIG5hbWU6ICd3b3JsZCcsXG4gICAgICAgIGRlbGltaXRlcjogJy8nLFxuICAgICAgICBwYXRoOiAnaGVsbG8vd29ybGQnLFxuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH0pXG4gICAgICBleHBlY3QodHJlZSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIGNoaWxkcmVuOiBbe1xuICAgICAgICAgIG5hbWU6ICdoZWxsbycsXG4gICAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgICAgcGF0aDogJ2hlbGxvJyxcbiAgICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICAgIG5hbWU6ICd3b3JsZCcsXG4gICAgICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgICAgIHBhdGg6ICdoZWxsby93b3JsZCcsXG4gICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZXhpc3RpbmcgcGF0aCBpZiBwb3NzaWJsZScsICgpID0+IHtcbiAgICAgIHZhciB0cmVlID0ge1xuICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICBuYW1lOiAnaGVsbG8nLFxuICAgICAgICAgIGRlbGltaXRlcjogJy8nLFxuICAgICAgICAgIHBhdGg6ICdoZWxsbycsXG4gICAgICAgICAgY2hpbGRyZW46IFt7XG4gICAgICAgICAgICBuYW1lOiAnd29ybGQnLFxuICAgICAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgICAgICBwYXRoOiAnaGVsbG8vd29ybGQnLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgYWJjOiAxMjNcbiAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgICAgfVxuICAgICAgZXhwZWN0KGJyLl9lbnN1cmVQYXRoKHRyZWUsICdoZWxsby93b3JsZCcsICcvJykpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBuYW1lOiAnd29ybGQnLFxuICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgcGF0aDogJ2hlbGxvL3dvcmxkJyxcbiAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICBhYmM6IDEyM1xuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBoYW5kbGUgY2FzZSBpbnNlbnNpdGl2ZSBJbmJveCcsICgpID0+IHtcbiAgICAgIHZhciB0cmVlID0ge1xuICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgIH1cbiAgICAgIGV4cGVjdChici5fZW5zdXJlUGF0aCh0cmVlLCAnSW5ib3gvd29ybGQnLCAnLycpKS50by5kZWVwLmVxdWFsKHtcbiAgICAgICAgbmFtZTogJ3dvcmxkJyxcbiAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgIHBhdGg6ICdJbmJveC93b3JsZCcsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSlcbiAgICAgIGV4cGVjdChici5fZW5zdXJlUGF0aCh0cmVlLCAnSU5CT1gvd29ybGRzJywgJy8nKSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIG5hbWU6ICd3b3JsZHMnLFxuICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgcGF0aDogJ0lOQk9YL3dvcmxkcycsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSlcblxuICAgICAgZXhwZWN0KHRyZWUpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICBuYW1lOiAnSW5ib3gnLFxuICAgICAgICAgIGRlbGltaXRlcjogJy8nLFxuICAgICAgICAgIHBhdGg6ICdJbmJveCcsXG4gICAgICAgICAgY2hpbGRyZW46IFt7XG4gICAgICAgICAgICBuYW1lOiAnd29ybGQnLFxuICAgICAgICAgICAgZGVsaW1pdGVyOiAnLycsXG4gICAgICAgICAgICBwYXRoOiAnSW5ib3gvd29ybGQnLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ3dvcmxkcycsXG4gICAgICAgICAgICBkZWxpbWl0ZXI6ICcvJyxcbiAgICAgICAgICAgIHBhdGg6ICdJTkJPWC93b3JsZHMnLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19jaGVja1NwZWNpYWxVc2UnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gYSBtYXRjaGluZyBzcGVjaWFsIHVzZSBmbGFnJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9jaGVja1NwZWNpYWxVc2Uoe1xuICAgICAgICBmbGFnczogWyd0ZXN0JywgJ1xcXFxBbGwnXVxuICAgICAgfSkpLnRvLmVxdWFsKCdcXFxcQWxsJylcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBmYWlsIGZvciBub24tZXhpc3RlbnQgZmxhZycsICgpID0+IHtcbiAgICAgIGV4cGVjdChmYWxzZSwgYnIuX2NoZWNrU3BlY2lhbFVzZSh7fSkpXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZmFpbCBmb3IgaW52YWxpZCBmbGFnJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9jaGVja1NwZWNpYWxVc2Uoe1xuICAgICAgICBmbGFnczogWyd0ZXN0J11cbiAgICAgIH0pKS50by5iZS5mYWxzZVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBzcGVjaWFsIHVzZSBmbGFnIGlmIGEgbWF0Y2hpbmcgbmFtZSBpcyBmb3VuZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChici5fY2hlY2tTcGVjaWFsVXNlKHtcbiAgICAgICAgbmFtZTogJ3Rlc3QnXG4gICAgICB9KSkudG8uYmUuZmFsc2VcbiAgICAgIGV4cGVjdChici5fY2hlY2tTcGVjaWFsVXNlKHtcbiAgICAgICAgbmFtZTogJ1ByYWh0J1xuICAgICAgfSkpLnRvLmVxdWFsKCdcXFxcVHJhc2gnKVxuICAgICAgZXhwZWN0KGJyLl9jaGVja1NwZWNpYWxVc2Uoe1xuICAgICAgICBmbGFnczogWydcXEhhc0NoaWxkcmVuJ10sIC8vIG5vdCBhIHNwZWNpYWwgdXNlIGZsYWdcbiAgICAgICAgbmFtZTogJ1ByYWh0J1xuICAgICAgfSkpLnRvLmVxdWFsKCdcXFxcVHJhc2gnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHByZWZlciBtYXRjaGluZyBzcGVjaWFsIHVzZSBmbGFnIG92ZXIgYSBtYXRjaGluZyBuYW1lJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9jaGVja1NwZWNpYWxVc2Uoe1xuICAgICAgICBmbGFnczogWydcXFxcQWxsJ10sXG4gICAgICAgIG5hbWU6ICdQcmFodCdcbiAgICAgIH0pKS50by5lcXVhbCgnXFxcXEFsbCcpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnI19idWlsZFhPQXV0aDJUb2tlbicsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBiYXNlNjQgZW5jb2RlZCBYT0FVVEgyIHRva2VuJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJyLl9idWlsZFhPQXV0aDJUb2tlbigndXNlckBob3N0JywgJ2FiY2RlJykpLnRvLmVxdWFsKCdkWE5sY2oxMWMyVnlRR2h2YzNRQllYVjBhRDFDWldGeVpYSWdZV0pqWkdVQkFRPT0nKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3VudGFnZ2VkIHVwZGF0ZXMnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZWNlaXZlIGluZm9ybWF0aW9uIGFib3V0IHVudGFnZ2VkIGV4aXN0cycsIChkb25lKSA9PiB7XG4gICAgICBici5jbGllbnQuX2Nvbm5lY3Rpb25SZWFkeSA9IHRydWVcbiAgICAgIGJyLl9zZWxlY3RlZE1haWxib3ggPSAnRk9PJ1xuICAgICAgYnIub251cGRhdGUgPSAocGF0aCwgdHlwZSwgdmFsdWUpID0+IHtcbiAgICAgICAgZXhwZWN0KHBhdGgpLnRvLmVxdWFsKCdGT08nKVxuICAgICAgICBleHBlY3QodHlwZSkudG8uZXF1YWwoJ2V4aXN0cycpXG4gICAgICAgIGV4cGVjdCh2YWx1ZSkudG8uZXF1YWwoMTIzKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICAgIGJyLmNsaWVudC5fb25EYXRhKHtcbiAgICAgICAgLyogKiAxMjMgRVhJU1RTXFxyXFxuICovXG4gICAgICAgIGRhdGE6IG5ldyBVaW50OEFycmF5KFs0MiwgMzIsIDQ5LCA1MCwgNTEsIDMyLCA2OSwgODgsIDczLCA4MywgODQsIDgzLCAxMywgMTBdKS5idWZmZXJcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcmVjZWl2ZSBpbmZvcm1hdGlvbiBhYm91dCB1bnRhZ2dlZCBleHB1bmdlJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmNsaWVudC5fY29ubmVjdGlvblJlYWR5ID0gdHJ1ZVxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICdGT08nXG4gICAgICBici5vbnVwZGF0ZSA9IChwYXRoLCB0eXBlLCB2YWx1ZSkgPT4ge1xuICAgICAgICBleHBlY3QocGF0aCkudG8uZXF1YWwoJ0ZPTycpXG4gICAgICAgIGV4cGVjdCh0eXBlKS50by5lcXVhbCgnZXhwdW5nZScpXG4gICAgICAgIGV4cGVjdCh2YWx1ZSkudG8uZXF1YWwoNDU2KVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICAgIGJyLmNsaWVudC5fb25EYXRhKHtcbiAgICAgICAgLyogKiA0NTYgRVhQVU5HRVxcclxcbiAqL1xuICAgICAgICBkYXRhOiBuZXcgVWludDhBcnJheShbNDIsIDMyLCA1MiwgNTMsIDU0LCAzMiwgNjksIDg4LCA4MCwgODUsIDc4LCA3MSwgNjksIDEzLCAxMF0pLmJ1ZmZlclxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZWNlaXZlIGluZm9ybWF0aW9uIGFib3V0IHVudGFnZ2VkIGZldGNoJywgKGRvbmUpID0+IHtcbiAgICAgIGJyLmNsaWVudC5fY29ubmVjdGlvblJlYWR5ID0gdHJ1ZVxuICAgICAgYnIuX3NlbGVjdGVkTWFpbGJveCA9ICdGT08nXG4gICAgICBici5vbnVwZGF0ZSA9IChwYXRoLCB0eXBlLCB2YWx1ZSkgPT4ge1xuICAgICAgICBleHBlY3QocGF0aCkudG8uZXF1YWwoJ0ZPTycpXG4gICAgICAgIGV4cGVjdCh0eXBlKS50by5lcXVhbCgnZmV0Y2gnKVxuICAgICAgICBleHBlY3QodmFsdWUpLnRvLmRlZXAuZXF1YWwoe1xuICAgICAgICAgICcjJzogMTIzLFxuICAgICAgICAgICdmbGFncyc6IFsnXFxcXFNlZW4nXSxcbiAgICAgICAgICAnbW9kc2VxJzogJzQnXG4gICAgICAgIH0pXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgICAgYnIuY2xpZW50Ll9vbkRhdGEoe1xuICAgICAgICAvKiAqIDEyMyBGRVRDSCAoRkxBR1MgKFxcXFxTZWVuKSBNT0RTRVEgKDQpKVxcclxcbiAqL1xuICAgICAgICBkYXRhOiBuZXcgVWludDhBcnJheShbNDIsIDMyLCA0OSwgNTAsIDUxLCAzMiwgNzAsIDY5LCA4NCwgNjcsIDcyLCAzMiwgNDAsIDcwLCA3NiwgNjUsIDcxLCA4MywgMzIsIDQwLCA5MiwgODMsIDEwMSwgMTAxLCAxMTAsIDQxLCAzMiwgNzcsIDc5LCA2OCwgODMsIDY5LCA4MSwgMzIsIDQwLCA1MiwgNDEsIDQxLCAxMywgMTBdKS5idWZmZXJcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=