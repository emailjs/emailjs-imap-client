/* eslint-disable no-unused-expressions */

import ImapClient, { STATE_SELECTED, STATE_LOGOUT } from './client'
import { parser } from 'emailjs-imap-handler'
import {
  toTypedArray,
  LOG_LEVEL_NONE as logLevel
} from './common'

describe('browserbox unit tests', () => {
  var br

  beforeEach(() => {
    const auth = { user: 'baldrian', pass: 'sleeper.de' }
    br = new ImapClient('somehost', 1234, { auth, logLevel })
    br.client.socket = {
      send: () => { },
      upgradeToSecure: () => { }
    }
  })

  describe('#_onIdle', () => {
    it('should call enterIdle', () => {
      sinon.stub(br, 'enterIdle')

      br._authenticated = true
      br._enteredIdle = false
      br._onIdle()

      expect(br.enterIdle.callCount).to.equal(1)
    })

    it('should not call enterIdle', () => {
      sinon.stub(br, 'enterIdle')

      br._enteredIdle = true
      br._onIdle()

      expect(br.enterIdle.callCount).to.equal(0)
    })
  })

  describe('#openConnection', () => {
    beforeEach(() => {
      sinon.stub(br.client, 'connect')
      sinon.stub(br.client, 'close')
      sinon.stub(br.client, 'enqueueCommand')
    })
    it('should open connection', () => {
      br.client.connect.returns(Promise.resolve())
      br.client.enqueueCommand.returns(Promise.resolve({
        capability: ['capa1', 'capa2']
      }))
      setTimeout(() => br.client.onready(), 0)
      return br.openConnection().then(() => {
        expect(br.client.connect.calledOnce).to.be.true
        expect(br.client.enqueueCommand.calledOnce).to.be.true
        expect(br._capability.length).to.equal(2)
        expect(br._capability[0]).to.equal('capa1')
        expect(br._capability[1]).to.equal('capa2')
      })
    })
  })

  describe('#connect', () => {
    beforeEach(() => {
      sinon.stub(br.client, 'connect')
      sinon.stub(br.client, 'close')
      sinon.stub(br, 'updateCapability')
      sinon.stub(br, 'upgradeConnection')
      sinon.stub(br, 'updateId')
      sinon.stub(br, 'login')
      sinon.stub(br, 'compressConnection')
    })

    it('should connect', () => {
      br.client.connect.returns(Promise.resolve())
      br.updateCapability.returns(Promise.resolve())
      br.upgradeConnection.returns(Promise.resolve())
      br.updateId.returns(Promise.resolve())
      br.login.returns(Promise.resolve())
      br.compressConnection.returns(Promise.resolve())

      setTimeout(() => br.client.onready(), 0)
      return br.connect().then(() => {
        expect(br.client.connect.calledOnce).to.be.true
        expect(br.updateCapability.calledOnce).to.be.true
        expect(br.upgradeConnection.calledOnce).to.be.true
        expect(br.updateId.calledOnce).to.be.true
        expect(br.login.calledOnce).to.be.true
        expect(br.compressConnection.calledOnce).to.be.true
      })
    })

    it('should fail to login', (done) => {
      br.client.connect.returns(Promise.resolve())
      br.updateCapability.returns(Promise.resolve())
      br.upgradeConnection.returns(Promise.resolve())
      br.updateId.returns(Promise.resolve())
      br.login.throws(new Error())

      setTimeout(() => br.client.onready(), 0)
      br.connect().catch((err) => {
        expect(err).to.exist

        expect(br.client.connect.calledOnce).to.be.true
        expect(br.client.close.calledOnce).to.be.true
        expect(br.updateCapability.calledOnce).to.be.true
        expect(br.upgradeConnection.calledOnce).to.be.true
        expect(br.updateId.calledOnce).to.be.true
        expect(br.login.calledOnce).to.be.true

        expect(br.compressConnection.called).to.be.false

        done()
      })
    })

    it('should timeout', (done) => {
      br.client.connect.returns(Promise.resolve())
      br.timeoutConnection = 1

      br.connect().catch((err) => {
        expect(err).to.exist

        expect(br.client.connect.calledOnce).to.be.true
        expect(br.client.close.calledOnce).to.be.true

        expect(br.updateCapability.called).to.be.false
        expect(br.upgradeConnection.called).to.be.false
        expect(br.updateId.called).to.be.false
        expect(br.login.called).to.be.false
        expect(br.compressConnection.called).to.be.false

        done()
      })
    })
  })

  describe('#close', () => {
    it('should force-close', () => {
      sinon.stub(br.client, 'close').returns(Promise.resolve())

      return br.close().then(() => {
        expect(br._state).to.equal(STATE_LOGOUT)
        expect(br.client.close.calledOnce).to.be.true
      })
    })
  })

  describe('#exec', () => {
    beforeEach(() => {
      sinon.stub(br, 'breakIdle')
    })

    it('should send string command', () => {
      sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({}))
      return br.exec('TEST').then((res) => {
        expect(res).to.deep.equal({})
        expect(br.client.enqueueCommand.args[0][0]).to.equal('TEST')
      })
    })

    it('should update capability from response', () => {
      sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({
        capability: ['A', 'B']
      }))
      return br.exec('TEST').then((res) => {
        expect(res).to.deep.equal({
          capability: ['A', 'B']
        })
        expect(br._capability).to.deep.equal(['A', 'B'])
      })
    })
  })

  describe('#enterIdle', () => {
    it('should periodically send NOOP if IDLE not supported', (done) => {
      sinon.stub(br, 'exec').callsFake((command) => {
        expect(command).to.equal('NOOP')

        done()
      })

      br._capability = []
      br._selectedMailbox = 'FOO'
      br.timeoutNoop = 1
      br.enterIdle()
    })

    it('should periodically send NOOP if no mailbox selected', (done) => {
      sinon.stub(br, 'exec').callsFake((command) => {
        expect(command).to.equal('NOOP')

        done()
      })

      br._capability = ['IDLE']
      br._selectedMailbox = undefined
      br.timeoutNoop = 1
      br.enterIdle()
    })

    it('should break IDLE after timeout', (done) => {
      sinon.stub(br.client, 'enqueueCommand')
      sinon.stub(br.client.socket, 'send').callsFake((payload) => {
        expect(br.client.enqueueCommand.args[0][0].command).to.equal('IDLE')
        expect([].slice.call(new Uint8Array(payload))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a])

        done()
      })

      br._capability = ['IDLE']
      br._selectedMailbox = 'FOO'
      br.timeoutIdle = 1
      br.enterIdle()
    })
  })

  describe('#breakIdle', () => {
    it('should send DONE to socket', () => {
      sinon.stub(br.client.socket, 'send')

      br._enteredIdle = 'IDLE'
      br.breakIdle()
      expect([].slice.call(new Uint8Array(br.client.socket.send.args[0][0]))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a])
    })
  })

  describe('#upgradeConnection', () => {
    it('should do nothing if already secured', () => {
      br.client.secureMode = true
      br._capability = ['starttls']
      return br.upgradeConnection()
    })

    it('should do nothing if STARTTLS not available', () => {
      br.client.secureMode = false
      br._capability = []
      return br.upgradeConnection()
    })

    it('should run STARTTLS', () => {
      sinon.stub(br.client, 'upgrade')
      sinon.stub(br, 'exec').withArgs('STARTTLS').returns(Promise.resolve())
      sinon.stub(br, 'updateCapability').returns(Promise.resolve())

      br._capability = ['STARTTLS']

      return br.upgradeConnection().then(() => {
        expect(br.client.upgrade.callCount).to.equal(1)
        expect(br._capability.length).to.equal(0)
      })
    })
  })

  describe('#updateCapability', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should do nothing if capability is set', () => {
      br._capability = ['abc']
      return br.updateCapability()
    })

    it('should run CAPABILITY if capability not set', () => {
      br.exec.returns(Promise.resolve())

      br._capability = []

      return br.updateCapability().then(() => {
        expect(br.exec.args[0][0]).to.equal('CAPABILITY')
      })
    })

    it('should force run CAPABILITY', () => {
      br.exec.returns(Promise.resolve())
      br._capability = ['abc']

      return br.updateCapability(true).then(() => {
        expect(br.exec.args[0][0]).to.equal('CAPABILITY')
      })
    })

    it('should do nothing if connection is not yet upgraded', () => {
      br._capability = []
      br.client.secureMode = false
      br._requireTLS = true

      br.updateCapability()
    })
  })

  describe('#listNamespaces', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should run NAMESPACE if supported', () => {
      br.exec.returns(Promise.resolve({
        payload: {
          NAMESPACE: [{
            attributes: [
              [
                [{
                  type: 'STRING',
                  value: 'INBOX.'
                }, {
                  type: 'STRING',
                  value: '.'
                }]
              ], null, null
            ]
          }]
        }
      }))
      br._capability = ['NAMESPACE']

      return br.listNamespaces().then((namespaces) => {
        expect(namespaces).to.deep.equal({
          personal: [{
            prefix: 'INBOX.',
            delimiter: '.'
          }],
          users: false,
          shared: false
        })
        expect(br.exec.args[0][0]).to.equal('NAMESPACE')
        expect(br.exec.args[0][1]).to.equal('NAMESPACE')
      })
    })

    it('should do nothing if not supported', () => {
      br._capability = []
      return br.listNamespaces().then((namespaces) => {
        expect(namespaces).to.be.false
        expect(br.exec.callCount).to.equal(0)
      })
    })
  })

  describe('#compressConnection', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
      sinon.stub(br.client, 'enableCompression')
    })

    it('should run COMPRESS=DEFLATE if supported', () => {
      br.exec.withArgs({
        command: 'COMPRESS',
        attributes: [{
          type: 'ATOM',
          value: 'DEFLATE'
        }]
      }).returns(Promise.resolve({}))

      br._enableCompression = true
      br._capability = ['COMPRESS=DEFLATE']
      return br.compressConnection().then(() => {
        expect(br.exec.callCount).to.equal(1)
        expect(br.client.enableCompression.callCount).to.equal(1)
      })
    })

    it('should do nothing if not supported', () => {
      br._capability = []

      return br.compressConnection().then(() => {
        expect(br.exec.callCount).to.equal(0)
      })
    })

    it('should do nothing if not enabled', () => {
      br._enableCompression = false
      br._capability = ['COMPRESS=DEFLATE']

      return br.compressConnection().then(() => {
        expect(br.exec.callCount).to.equal(0)
      })
    })
  })

  describe('#login', () => {
    it('should call LOGIN', () => {
      sinon.stub(br, 'exec').returns(Promise.resolve({}))
      sinon.stub(br, 'updateCapability').returns(Promise.resolve(true))

      return br.login({
        user: 'u1',
        pass: 'p1'
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
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
        })
      })
    })

    it('should call XOAUTH2', () => {
      sinon.stub(br, 'exec').returns(Promise.resolve({}))
      sinon.stub(br, 'updateCapability').returns(Promise.resolve(true))

      br._capability = ['AUTH=XOAUTH2']
      br.login({
        user: 'u1',
        xoauth2: 'abc'
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
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
        })
      })
    })
  })

  describe('#updateId', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should not nothing if not supported', () => {
      br._capability = []

      return br.updateId({
        a: 'b',
        c: 'd'
      }).then(() => {
        expect(br.serverId).to.be.false
      })
    })

    it('should send NIL', () => {
      br.exec.withArgs({
        command: 'ID',
        attributes: [
          null
        ]
      }).returns(Promise.resolve({
        payload: {
          ID: [{
            attributes: [
              null
            ]
          }]
        }
      }))
      br._capability = ['ID']

      return br.updateId(null).then(() => {
        expect(br.serverId).to.deep.equal({})
      })
    })

    it('should exhange ID values', () => {
      br.exec.withArgs({
        command: 'ID',
        attributes: [
          ['ckey1', 'cval1', 'ckey2', 'cval2']
        ]
      }).returns(Promise.resolve({
        payload: {
          ID: [{
            attributes: [
              [{
                value: 'skey1'
              }, {
                value: 'sval1'
              }, {
                value: 'skey2'
              }, {
                value: 'sval2'
              }]
            ]
          }]
        }
      }))
      br._capability = ['ID']

      return br.updateId({
        ckey1: 'cval1',
        ckey2: 'cval2'
      }).then(() => {
        expect(br.serverId).to.deep.equal({
          skey1: 'sval1',
          skey2: 'sval2'
        })
      })
    })
  })

  describe('#listMailboxes', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should call LIST and LSUB in sequence', () => {
      br.exec.withArgs({
        command: 'LIST',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LIST: [false]
        }
      }))

      br.exec.withArgs({
        command: 'LSUB',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LSUB: [false]
        }
      }))

      return br.listMailboxes().then((tree) => {
        expect(tree).to.exist
      })
    })

    it('should not die on NIL separators', () => {
      br.exec.withArgs({
        command: 'LIST',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LIST: [
            parser(toTypedArray('* LIST (\\NoInferiors) NIL "INBOX"'))
          ]
        }
      }))

      br.exec.withArgs({
        command: 'LSUB',
        attributes: ['', '*']
      }).returns(Promise.resolve({
        payload: {
          LSUB: [
            parser(toTypedArray('* LSUB (\\NoInferiors) NIL "INBOX"'))
          ]
        }
      }))

      return br.listMailboxes().then((tree) => {
        expect(tree).to.exist
      })
    })
  })

  describe('#createMailbox', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should call CREATE with a string payload', () => {
      // The spec allows unquoted ATOM-style syntax too, but for
      // simplicity we always generate a string even if it could be
      // expressed as an atom.
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['mailboxname']
      }).returns(Promise.resolve())

      return br.createMailbox('mailboxname').then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })

    it('should call mutf7 encode the argument', () => {
      // From RFC 3501
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['~peter/mail/&U,BTFw-/&ZeVnLIqe-']
      }).returns(Promise.resolve())

      return br.createMailbox('~peter/mail/\u53f0\u5317/\u65e5\u672c\u8a9e').then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })

    it('should treat an ALREADYEXISTS response as success', () => {
      var fakeErr = {
        code: 'ALREADYEXISTS'
      }
      br.exec.withArgs({
        command: 'CREATE',
        attributes: ['mailboxname']
      }).returns(Promise.reject(fakeErr))

      return br.createMailbox('mailboxname').then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })
  })

  describe('#deleteMailbox', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should call DELETE with a string payload', () => {
      br.exec.withArgs({
        command: 'DELETE',
        attributes: ['mailboxname']
      }).returns(Promise.resolve())

      return br.deleteMailbox('mailboxname').then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })

    it('should call mutf7 encode the argument', () => {
      // From RFC 3501
      br.exec.withArgs({
        command: 'DELETE',
        attributes: ['~peter/mail/&U,BTFw-/&ZeVnLIqe-']
      }).returns(Promise.resolve())

      return br.deleteMailbox('~peter/mail/\u53f0\u5317/\u65e5\u672c\u8a9e').then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })
  })

  describe.skip('#listMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
      sinon.stub(br, '_buildFETCHCommand')
      sinon.stub(br, '_parseFETCH')
    })

    it('should call FETCH', () => {
      br.exec.returns(Promise.resolve('abc'))
      br._buildFETCHCommand.withArgs(['1:2', ['uid', 'flags'], {
        byUid: true
      }]).returns({})

      return br.listMessages('INBOX', '1:2', ['uid', 'flags'], {
        byUid: true
      }).then(() => {
        expect(br._buildFETCHCommand.callCount).to.equal(1)
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1)
      })
    })
  })

  describe.skip('#search', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
      sinon.stub(br, '_buildSEARCHCommand')
      sinon.stub(br, '_parseSEARCH')
    })

    it('should call SEARCH', () => {
      br.exec.returns(Promise.resolve('abc'))
      br._buildSEARCHCommand.withArgs({
        uid: 1
      }, {
        byUid: true
      }).returns({})

      return br.search('INBOX', {
        uid: 1
      }, {
        byUid: true
      }).then(() => {
        expect(br._buildSEARCHCommand.callCount).to.equal(1)
        expect(br.exec.callCount).to.equal(1)
        expect(br._parseSEARCH.withArgs('abc').callCount).to.equal(1)
      })
    })
  })

  describe('#upload', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should call APPEND with custom flag', () => {
      br.exec.returns(Promise.resolve())

      return br.upload('mailbox', 'this is a message', {
        flags: ['\\$MyFlag']
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })

    it('should call APPEND w/o flags', () => {
      br.exec.returns(Promise.resolve())

      return br.upload('mailbox', 'this is a message').then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })
  })

  describe.skip('#setFlags', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
      sinon.stub(br, '_buildSTORECommand')
      sinon.stub(br, '_parseFETCH')
    })

    it('should call STORE', () => {
      br.exec.returns(Promise.resolve('abc'))
      br._buildSTORECommand.withArgs('1:2', 'FLAGS', ['\\Seen', '$MyFlag'], {
        byUid: true
      }).returns({})

      return br.setFlags('INBOX', '1:2', ['\\Seen', '$MyFlag'], {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1)
      })
    })
  })

  describe.skip('#store', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
      sinon.stub(br, '_buildSTORECommand')
      sinon.stub(br, '_parseFETCH')
    })

    it('should call STORE', () => {
      br.exec.returns(Promise.resolve('abc'))
      br._buildSTORECommand.withArgs('1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
        byUid: true
      }).returns({})

      return br.store('INBOX', '1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
        byUid: true
      }).then(() => {
        expect(br._buildSTORECommand.callCount).to.equal(1)
        expect(br.exec.callCount).to.equal(1)
        expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1)
      })
    })
  })

  describe('#deleteMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'setFlags')
      sinon.stub(br, 'exec')
    })

    it('should call UID EXPUNGE', () => {
      br.exec.withArgs({
        command: 'UID EXPUNGE',
        attributes: [{
          type: 'sequence',
          value: '1:2'
        }]
      }).returns(Promise.resolve('abc'))
      br.setFlags.withArgs('INBOX', '1:2', {
        add: '\\Deleted'
      }).returns(Promise.resolve())

      br._capability = ['UIDPLUS']
      return br.deleteMessages('INBOX', '1:2', {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })

    it('should call EXPUNGE', () => {
      br.exec.withArgs('EXPUNGE').returns(Promise.resolve('abc'))
      br.setFlags.withArgs('INBOX', '1:2', {
        add: '\\Deleted'
      }).returns(Promise.resolve())

      br._capability = []
      return br.deleteMessages('INBOX', '1:2', {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })
  })

  describe('#copyMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

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
      }))

      return br.copyMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then((response) => {
        expect(response).to.deep.equal({
          srcSeqSet: '1:2',
          destSeqSet: '4,3'
        })
        expect(br.exec.callCount).to.equal(1)
      })
    })
  })

  describe('#moveMessages', () => {
    beforeEach(() => {
      sinon.stub(br, 'exec')
      sinon.stub(br, 'copyMessages')
      sinon.stub(br, 'deleteMessages')
    })

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
      }, ['OK']).returns(Promise.resolve('abc'))

      br._capability = ['MOVE']
      return br.moveMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
      })
    })

    it('should fallback to copy+expunge', () => {
      br.copyMessages.withArgs('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).returns(Promise.resolve())
      br.deleteMessages.withArgs('1:2', {
        byUid: true
      }).returns(Promise.resolve())

      br._capability = []
      return br.moveMessages('INBOX', '1:2', '[Gmail]/Trash', {
        byUid: true
      }).then(() => {
        expect(br.deleteMessages.callCount).to.equal(1)
      })
    })
  })

  describe('#_shouldSelectMailbox', () => {
    it('should return true when ctx is undefined', () => {
      expect(br._shouldSelectMailbox('path')).to.be.true
    })

    it('should return true when a different path is queued', () => {
      sinon.stub(br.client, 'getPreviouslyQueued').returns({
        request: {
          command: 'SELECT',
          attributes: [{
            type: 'STRING',
            value: 'queued path'
          }]
        }
      })

      expect(br._shouldSelectMailbox('path', {})).to.be.true
    })

    it('should return false when the same path is queued', () => {
      sinon.stub(br.client, 'getPreviouslyQueued').returns({
        request: {
          command: 'SELECT',
          attributes: [{
            type: 'STRING',
            value: 'queued path'
          }]
        }
      })

      expect(br._shouldSelectMailbox('queued path', {})).to.be.false
    })
  })

  describe('#selectMailbox', () => {
    const path = '[Gmail]/Trash'
    beforeEach(() => {
      sinon.stub(br, 'exec')
    })

    it('should run SELECT', () => {
      br.exec.withArgs({
        command: 'SELECT',
        attributes: [{
          type: 'STRING',
          value: path
        }]
      }).returns(Promise.resolve({
        code: 'READ-WRITE'
      }))

      return br.selectMailbox(path).then(() => {
        expect(br.exec.callCount).to.equal(1)
        expect(br._state).to.equal(STATE_SELECTED)
      })
    })

    it('should run SELECT with CONDSTORE', () => {
      br.exec.withArgs({
        command: 'SELECT',
        attributes: [{
          type: 'STRING',
          value: path
        },
        [{
          type: 'ATOM',
          value: 'CONDSTORE'
        }]
        ]
      }).returns(Promise.resolve({
        code: 'READ-WRITE'
      }))

      br._capability = ['CONDSTORE']
      return br.selectMailbox(path, {
        condstore: true
      }).then(() => {
        expect(br.exec.callCount).to.equal(1)
        expect(br._state).to.equal(STATE_SELECTED)
      })
    })

    describe('should emit onselectmailbox before selectMailbox is resolved', () => {
      beforeEach(() => {
        br.exec.returns(Promise.resolve({
          code: 'READ-WRITE'
        }))
      })

      it('when it returns a promise', () => {
        var promiseResolved = false
        br.onselectmailbox = () => new Promise((resolve) => {
          resolve()
          promiseResolved = true
        })
        var onselectmailboxSpy = sinon.spy(br, 'onselectmailbox')
        return br.selectMailbox(path).then(() => {
          expect(onselectmailboxSpy.withArgs(path).callCount).to.equal(1)
          expect(promiseResolved).to.equal(true)
        })
      })

      it('when it does not return a promise', () => {
        br.onselectmailbox = () => { }
        var onselectmailboxSpy = sinon.spy(br, 'onselectmailbox')
        return br.selectMailbox(path).then(() => {
          expect(onselectmailboxSpy.withArgs(path).callCount).to.equal(1)
        })
      })
    })

    it('should emit onclosemailbox', () => {
      let called = false
      br.exec.returns(Promise.resolve('abc')).returns(Promise.resolve({
        code: 'READ-WRITE'
      }))

      br.onclosemailbox = (path) => {
        expect(path).to.equal('yyy')
        called = true
      }

      br._selectedMailbox = 'yyy'
      return br.selectMailbox(path).then(() => {
        expect(called).to.be.true
      })
    })
  })

  describe('#hasCapability', () => {
    it('should detect existing capability', () => {
      br._capability = ['ZZZ']
      expect(br.hasCapability('zzz')).to.be.true
    })

    it('should detect non existing capability', () => {
      br._capability = ['ZZZ']
      expect(br.hasCapability('ooo')).to.be.false
      expect(br.hasCapability()).to.be.false
    })
  })

  describe('#_untaggedOkHandler', () => {
    it('should update capability if present', () => {
      br._untaggedOkHandler({
        capability: ['abc']
      }, () => { })
      expect(br._capability).to.deep.equal(['abc'])
    })
  })

  describe('#_untaggedCapabilityHandler', () => {
    it('should update capability', () => {
      br._untaggedCapabilityHandler({
        attributes: [{
          value: 'abc'
        }]
      }, () => { })
      expect(br._capability).to.deep.equal(['ABC'])
    })
  })

  describe('#_untaggedExistsHandler', () => {
    it('should emit onupdate', () => {
      br.onupdate = sinon.stub()
      br._selectedMailbox = 'FOO'

      br._untaggedExistsHandler({
        nr: 123
      }, () => { })
      expect(br.onupdate.withArgs('FOO', 'exists', 123).callCount).to.equal(1)
    })
  })

  describe('#_untaggedExpungeHandler', () => {
    it('should emit onupdate', () => {
      br.onupdate = sinon.stub()
      br._selectedMailbox = 'FOO'

      br._untaggedExpungeHandler({
        nr: 123
      }, () => { })
      expect(br.onupdate.withArgs('FOO', 'expunge', 123).callCount).to.equal(1)
    })
  })

  describe.skip('#_untaggedFetchHandler', () => {
    it('should emit onupdate', () => {
      br.onupdate = sinon.stub()
      sinon.stub(br, '_parseFETCH').returns('abc')
      br._selectedMailbox = 'FOO'

      br._untaggedFetchHandler({
        nr: 123
      }, () => { })
      expect(br.onupdate.withArgs('FOO', 'fetch', 'abc').callCount).to.equal(1)
      expect(br._parseFETCH.args[0][0]).to.deep.equal({
        payload: {
          FETCH: [{
            nr: 123
          }]
        }
      })
    })
  })

  describe('#_changeState', () => {
    it('should set the state value', () => {
      br._changeState(12345)

      expect(br._state).to.equal(12345)
    })

    it('should emit onclosemailbox if mailbox was closed', () => {
      br.onclosemailbox = sinon.stub()
      br._state = STATE_SELECTED
      br._selectedMailbox = 'aaa'

      br._changeState(12345)

      expect(br._selectedMailbox).to.be.false
      expect(br.onclosemailbox.withArgs('aaa').callCount).to.equal(1)
    })
  })

  describe('#_ensurePath', () => {
    it('should create the path if not present', () => {
      var tree = {
        children: []
      }
      expect(br._ensurePath(tree, 'hello/world', '/')).to.deep.equal({
        name: 'world',
        delimiter: '/',
        path: 'hello/world',
        children: []
      })
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
      })
    })

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
      }
      expect(br._ensurePath(tree, 'hello/world', '/')).to.deep.equal({
        name: 'world',
        delimiter: '/',
        path: 'hello/world',
        children: [],
        abc: 123
      })
    })

    it('should handle case insensitive Inbox', () => {
      var tree = {
        children: []
      }
      expect(br._ensurePath(tree, 'Inbox/world', '/')).to.deep.equal({
        name: 'world',
        delimiter: '/',
        path: 'Inbox/world',
        children: []
      })
      expect(br._ensurePath(tree, 'INBOX/worlds', '/')).to.deep.equal({
        name: 'worlds',
        delimiter: '/',
        path: 'INBOX/worlds',
        children: []
      })

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
      })
    })
  })

  describe('untagged updates', () => {
    it('should receive information about untagged exists', (done) => {
      br.client._connectionReady = true
      br._selectedMailbox = 'FOO'
      br.onupdate = (path, type, value) => {
        expect(path).to.equal('FOO')
        expect(type).to.equal('exists')
        expect(value).to.equal(123)
        done()
      }
      br.client._onData({
        /* * 123 EXISTS\r\n */
        data: new Uint8Array([42, 32, 49, 50, 51, 32, 69, 88, 73, 83, 84, 83, 13, 10]).buffer
      })
    })

    it('should receive information about untagged expunge', (done) => {
      br.client._connectionReady = true
      br._selectedMailbox = 'FOO'
      br.onupdate = (path, type, value) => {
        expect(path).to.equal('FOO')
        expect(type).to.equal('expunge')
        expect(value).to.equal(456)
        done()
      }
      br.client._onData({
        /* * 456 EXPUNGE\r\n */
        data: new Uint8Array([42, 32, 52, 53, 54, 32, 69, 88, 80, 85, 78, 71, 69, 13, 10]).buffer
      })
    })

    it('should receive information about untagged fetch', (done) => {
      br.client._connectionReady = true
      br._selectedMailbox = 'FOO'
      br.onupdate = (path, type, value) => {
        expect(path).to.equal('FOO')
        expect(type).to.equal('fetch')
        expect(value).to.deep.equal({
          '#': 123,
          flags: ['\\Seen'],
          modseq: '4'
        })
        done()
      }
      br.client._onData({
        /* * 123 FETCH (FLAGS (\\Seen) MODSEQ (4))\r\n */
        data: new Uint8Array([42, 32, 49, 50, 51, 32, 70, 69, 84, 67, 72, 32, 40, 70, 76, 65, 71, 83, 32, 40, 92, 83, 101, 101, 110, 41, 32, 77, 79, 68, 83, 69, 81, 32, 40, 52, 41, 41, 13, 10]).buffer
      })
    })
  })
})
