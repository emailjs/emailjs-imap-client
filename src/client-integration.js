/* eslint-disable no-unused-expressions */

import hoodiecrow from 'hoodiecrow-imap'
import ImapClient, { LOG_LEVEL_NONE as logLevel } from '..'
import { parseSEARCH } from './command-parser'
import { buildSEARCHCommand } from './command-builder'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('browserbox integration tests', () => {
  let imap
  const port = 10000
  let server

  beforeEach((done) => {
    // start imap test server
    var options = {
      // debug: true,
      plugins: ['STARTTLS', 'X-GM-EXT-1'],
      secureConnection: false,
      storage: {
        INBOX: {
          messages: [
            { raw: 'Subject: hello 1\r\n\r\nWorld 1!' },
            { raw: 'Subject: hello 2\r\n\r\nWorld 2!', flags: ['\\Seen'] },
            { raw: 'Subject: hello 3\r\n\r\nWorld 3!', uid: 555 },
            { raw: 'From: sender name <sender@example.com>\r\nTo: Receiver name <receiver@example.com>\r\nSubject: hello 4\r\nMessage-Id: <abcde>\r\nDate: Fri, 13 Sep 2013 15:01:00 +0300\r\n\r\nWorld 4!' },
            { raw: 'Subject: hello 5\r\n\r\nWorld 5!', flags: ['$MyFlag', '\\Deleted'], uid: 557 },
            { raw: 'Subject: hello 6\r\n\r\nWorld 6!' },
            { raw: 'Subject: hello 7\r\n\r\nWorld 7!', uid: 600 }
          ]
        },
        '': {
          separator: '/',
          folders: {
            '[Gmail]': {
              flags: ['\\Noselect'],
              folders: {
                'All Mail': { 'special-use': '\\All' },
                Drafts: { 'special-use': '\\Drafts' },
                Important: { 'special-use': '\\Important' },
                'Sent Mail': { 'special-use': '\\Sent' },
                Spam: { 'special-use': '\\Junk' },
                Starred: { 'special-use': '\\Flagged' },
                Trash: { 'special-use': '\\Trash' },
                A: { messages: [{}] },
                B: { messages: [{}] }
              }
            }
          }
        }
      }
    }

    server = hoodiecrow(options)
    server.listen(port, done)
  })

  afterEach((done) => {
    server.close(done)
  })

  describe('Connection tests', () => {
    var insecureServer

    beforeEach((done) => {
      // start imap test server
      var options = {
        // debug: true,
        plugins: [],
        secureConnection: false
      }

      insecureServer = hoodiecrow(options)
      insecureServer.listen(port + 2, done)
    })

    afterEach((done) => {
      insecureServer.close(done)
    })

    it('should use STARTTLS by default', () => {
      imap = new ImapClient('127.0.0.1', port, {
        logLevel,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      })

      return imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.true
      }).then(() => {
        return imap.close()
      })
    })

    it('should ignore STARTTLS', () => {
      imap = new ImapClient('127.0.0.1', port, {
        logLevel,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false,
        ignoreTLS: true
      })

      return imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.false
      }).then(() => {
        return imap.close()
      })
    })

    it('should fail connecting to non-STARTTLS host', () => {
      imap = new ImapClient('127.0.0.1', port + 2, {
        logLevel,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false,
        requireTLS: true
      })

      return imap.connect().catch((err) => {
        expect(err).to.exist
      })
    })

    it('should connect to non secure host', () => {
      imap = new ImapClient('127.0.0.1', port + 2, {
        logLevel,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      })

      return imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.false
      }).then(() => {
        return imap.close()
      })
    })

    it('should fail authentication', (done) => {
      imap = new ImapClient('127.0.0.1', port + 2, {
        logLevel,
        auth: {
          user: 'invalid',
          pass: 'invalid'
        },
        useSecureTransport: false
      })

      imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.false
      }).catch(() => { done() })
    })
  })

  describe('Post login tests', () => {
    beforeEach(() => {
      imap = new ImapClient('127.0.0.1', port, {
        logLevel,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      })

      return imap.connect().then(() => {
        return imap.selectMailbox('[Gmail]/Spam')
      })
    })

    afterEach(() => {
      return imap.close()
    })

    describe('#listMailboxes', () => {
      it('should succeed', () => {
        return imap.listMailboxes().then((mailboxes) => {
          expect(mailboxes).to.exist
        })
      })
    })

    describe('#listMessages', () => {
      it('should succeed', () => {
        return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure', 'body.peek[]']).then((messages) => {
          expect(messages).to.not.be.empty
        })
      })
    })

    describe('#upload', () => {
      it('should succeed', () => {
        var msgCount

        return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure']).then((messages) => {
          expect(messages).to.not.be.empty
          msgCount = messages.length
        }).then(() => {
          return imap.upload('inbox', 'MIME-Version: 1.0\r\nDate: Wed, 9 Jul 2014 15:07:47 +0200\r\nDelivered-To: test@test.com\r\nMessage-ID: <CAHftYYQo=5fqbtnv-DazXhL2j5AxVP1nWarjkztn-N9SV91Z2w@mail.gmail.com>\r\nSubject: test\r\nFrom: Test Test <test@test.com>\r\nTo: Test Test <test@test.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\ntest', {
            flags: ['\\Seen', '\\Answered', '\\$MyFlag']
          })
        }).then(() => {
          return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure'])
        }).then((messages) => {
          expect(messages.length).to.equal(msgCount + 1)
        })
      })
    })

    describe('#search', () => {
      it('should return a sequence number', () => {
        return imap.search('inbox', {
          header: ['subject', 'hello 3']
        }).then((result) => {
          expect(result).to.deep.equal([3])
        })
      })

      it('should return an uid', () => {
        return imap.search('inbox', {
          header: ['subject', 'hello 3']
        }, {
          byUid: true
        }).then((result) => {
          expect(result).to.deep.equal([555])
        })
      })

      it('should work with complex queries', () => {
        return imap.search('inbox', {
          header: ['subject', 'hello'],
          seen: true
        }).then((result) => {
          expect(result).to.deep.equal([2])
        })
      })
    })

    describe('#setFlags', () => {
      it('should set flags for a message', () => {
        return imap.setFlags('inbox', '1', ['\\Seen', '$MyFlag']).then((result) => {
          expect(result).to.deep.equal([{
            '#': 1,
            flags: ['\\Seen', '$MyFlag']
          }])
        })
      })

      it('should add flags to a message', () => {
        return imap.setFlags('inbox', '2', {
          add: ['$MyFlag']
        }).then((result) => {
          expect(result).to.deep.equal([{
            '#': 2,
            flags: ['\\Seen', '$MyFlag']
          }])
        })
      })

      it('should remove flags from a message', () => {
        return imap.setFlags('inbox', '557', {
          remove: ['\\Deleted']
        }, {
          byUid: true
        }).then((result) => {
          expect(result).to.deep.equal([{
            '#': 5,
            flags: ['$MyFlag'],
            uid: 557
          }])
        })
      })

      it('should not return anything on silent mode', () => {
        return imap.setFlags('inbox', '1', ['$MyFlag2'], {
          silent: true
        }).then((result) => {
          expect(result).to.deep.equal([])
        })
      })
    })

    describe('#store', () => {
      it('should add labels for a message', () => {
        return imap.store('inbox', '1', '+X-GM-LABELS', ['\\Sent', '\\Junk']).then((result) => {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': ['\\Inbox', '\\Sent', '\\Junk']
          }])
        })
      })

      it('should set labels for a message', () => {
        return imap.store('inbox', '1', 'X-GM-LABELS', ['\\Sent', '\\Junk']).then((result) => {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': ['\\Sent', '\\Junk']
          }])
        })
      })

      it('should remove labels from a message', () => {
        return imap.store('inbox', '1', '-X-GM-LABELS', ['\\Sent', '\\Inbox']).then((result) => {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': []
          }])
        })
      })
    })

    describe('#deleteMessages', () => {
      it('should delete a message', () => {
        var initialInfo

        var expungeNotified = new Promise((resolve, reject) => {
          imap.onupdate = function (mb, type /*, data */) {
            try {
              expect(mb).to.equal('inbox')
              expect(type).to.equal('expunge')
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        })

        return imap.selectMailbox('inbox').then((info) => {
          initialInfo = info
          return imap.deleteMessages('inbox', 557, {
            byUid: true
          })
        }).then(() => {
          return imap.selectMailbox('inbox')
        }).then((resultInfo) => {
          expect(initialInfo.exists - 1 === resultInfo.exists).to.be.true
        }).then(() => expungeNotified)
      })
    })

    describe('#copyMessages', () => {
      it('should copy a message', () => {
        return imap.copyMessages('inbox', 555, '[Gmail]/Trash', {
          byUid: true
        }).then(() => {
          return imap.selectMailbox('[Gmail]/Trash')
        }).then((info) => {
          expect(info.exists).to.equal(1)
        })
      })
    })

    describe('#moveMessages', () => {
      it('should move a message', () => {
        var initialInfo
        return imap.selectMailbox('inbox').then((info) => {
          initialInfo = info
          return imap.moveMessages('inbox', 555, '[Gmail]/Spam', {
            byUid: true
          })
        }).then(() => {
          return imap.selectMailbox('[Gmail]/Spam')
        }).then((info) => {
          expect(info.exists).to.equal(1)
          return imap.selectMailbox('inbox')
        }).then((resultInfo) => {
          expect(initialInfo.exists).to.not.equal(resultInfo.exists)
        })
      })
    })

    describe('precheck', () => {
      it('should handle precheck error correctly', () => {
        // simulates a broken search command
        var search = (query, options = {}) => {
          var command = buildSEARCHCommand(query, options)
          return imap.exec(command, 'SEARCH', {
            precheck: () => Promise.reject(new Error('FOO'))
          }).then((response) => parseSEARCH(response))
        }

        return imap.selectMailbox('inbox')
          .then(() => search({ header: ['subject', 'hello 3'] }))
          .catch((err) => {
            expect(err.message).to.equal('FOO')
            return imap.selectMailbox('[Gmail]/Spam')
          })
      })

      it('should select correct mailboxes in prechecks on concurrent calls', () => {
        return imap.selectMailbox('[Gmail]/A').then(() => {
          return Promise.all([
            imap.selectMailbox('[Gmail]/B'),
            imap.setFlags('[Gmail]/A', '1', ['\\Seen'])
          ])
        }).then(() => {
          return imap.listMessages('[Gmail]/A', '1:1', ['flags'])
        }).then((messages) => {
          expect(messages.length).to.equal(1)
          expect(messages[0].flags).to.deep.equal(['\\Seen'])
        })
      })

      it('should send precheck commands in correct order on concurrent calls', () => {
        return Promise.all([
          imap.setFlags('[Gmail]/A', '1', ['\\Seen']),
          imap.setFlags('[Gmail]/B', '1', ['\\Seen'])
        ]).then(() => {
          return imap.listMessages('[Gmail]/A', '1:1', ['flags'])
        }).then((messages) => {
          expect(messages.length).to.equal(1)
          expect(messages[0].flags).to.deep.equal(['\\Seen'])
        }).then(() => {
          return imap.listMessages('[Gmail]/B', '1:1', ['flags'])
        }).then((messages) => {
          expect(messages.length).to.equal(1)
          expect(messages[0].flags).to.deep.equal(['\\Seen'])
        })
      })
    })
  })

  describe('Timeout', () => {
    beforeEach(() => {
      imap = new ImapClient('127.0.0.1', port, {
        logLevel,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      })

      return imap.connect()
        .then(() => {
          // remove the ondata event to simulate 100% packet loss and make the socket time out after 10ms
          imap.client.timeoutSocketLowerBound = 10
          imap.client.timeoutSocketMultiplier = 0
          imap.client.socket.ondata = () => { }
        })
    })

    it('should timeout', (done) => {
      imap.onerror = () => { done() }
      imap.selectMailbox('inbox').catch(() => {})
    })

    it('should reject all pending commands on timeout', () => {
      let rejectionCount = 0
      return Promise.all([
        imap.selectMailbox('INBOX')
          .catch(err => {
            expect(err).to.exist
            rejectionCount++
          }),
        imap.listMessages('INBOX', '1:*', ['body.peek[]'])
          .catch(err => {
            expect(err).to.exist
            rejectionCount++
          })

      ]).then(() => {
        expect(rejectionCount).to.equal(2)
      })
    })
  })
})
