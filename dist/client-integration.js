"use strict";

var _hoodiecrowImap = _interopRequireDefault(require("hoodiecrow-imap"));

var _ = _interopRequireWildcard(require(".."));

var _commandParser = require("./command-parser");

var _commandBuilder = require("./command-builder");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-unused-expressions */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
describe('browserbox integration tests', () => {
  let imap;
  const port = 10000;
  let server;
  beforeEach(done => {
    // start imap test server
    var options = {
      // debug: true,
      plugins: ['STARTTLS', 'X-GM-EXT-1'],
      secureConnection: false,
      storage: {
        INBOX: {
          messages: [{
            raw: 'Subject: hello 1\r\n\r\nWorld 1!'
          }, {
            raw: 'Subject: hello 2\r\n\r\nWorld 2!',
            flags: ['\\Seen']
          }, {
            raw: 'Subject: hello 3\r\n\r\nWorld 3!',
            uid: 555
          }, {
            raw: 'From: sender name <sender@example.com>\r\nTo: Receiver name <receiver@example.com>\r\nSubject: hello 4\r\nMessage-Id: <abcde>\r\nDate: Fri, 13 Sep 2013 15:01:00 +0300\r\n\r\nWorld 4!'
          }, {
            raw: 'Subject: hello 5\r\n\r\nWorld 5!',
            flags: ['$MyFlag', '\\Deleted'],
            uid: 557
          }, {
            raw: 'Subject: hello 6\r\n\r\nWorld 6!'
          }, {
            raw: 'Subject: hello 7\r\n\r\nWorld 7!',
            uid: 600
          }]
        },
        '': {
          separator: '/',
          folders: {
            '[Gmail]': {
              flags: ['\\Noselect'],
              folders: {
                'All Mail': {
                  'special-use': '\\All'
                },
                Drafts: {
                  'special-use': '\\Drafts'
                },
                Important: {
                  'special-use': '\\Important'
                },
                'Sent Mail': {
                  'special-use': '\\Sent'
                },
                Spam: {
                  'special-use': '\\Junk'
                },
                Starred: {
                  'special-use': '\\Flagged'
                },
                Trash: {
                  'special-use': '\\Trash'
                },
                A: {
                  messages: [{}]
                },
                B: {
                  messages: [{}]
                }
              }
            }
          }
        }
      }
    };
    server = (0, _hoodiecrowImap.default)(options);
    server.listen(port, done);
  });
  afterEach(done => {
    server.close(done);
  });
  describe('Connection tests', () => {
    var insecureServer;
    beforeEach(done => {
      // start imap test server
      var options = {
        // debug: true,
        plugins: [],
        secureConnection: false
      };
      insecureServer = (0, _hoodiecrowImap.default)(options);
      insecureServer.listen(port + 2, done);
    });
    afterEach(done => {
      insecureServer.close(done);
    });
    it('should use STARTTLS by default', () => {
      imap = new _.default('127.0.0.1', port, {
        logLevel: _.LOG_LEVEL_NONE,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      return imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.true;
      }).then(() => {
        return imap.close();
      });
    });
    it('should ignore STARTTLS', () => {
      imap = new _.default('127.0.0.1', port, {
        logLevel: _.LOG_LEVEL_NONE,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false,
        ignoreTLS: true
      });
      return imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.false;
      }).then(() => {
        return imap.close();
      });
    });
    it('should fail connecting to non-STARTTLS host', () => {
      imap = new _.default('127.0.0.1', port + 2, {
        logLevel: _.LOG_LEVEL_NONE,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false,
        requireTLS: true
      });
      return imap.connect().catch(err => {
        expect(err).to.exist;
      });
    });
    it('should connect to non secure host', () => {
      imap = new _.default('127.0.0.1', port + 2, {
        logLevel: _.LOG_LEVEL_NONE,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      return imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.false;
      }).then(() => {
        return imap.close();
      });
    });
    it('should fail authentication', done => {
      imap = new _.default('127.0.0.1', port + 2, {
        logLevel: _.LOG_LEVEL_NONE,
        auth: {
          user: 'invalid',
          pass: 'invalid'
        },
        useSecureTransport: false
      });
      imap.connect().then(() => {
        expect(imap.client.secureMode).to.be.false;
      }).catch(() => {
        done();
      });
    });
  });
  describe('Post login tests', () => {
    beforeEach(() => {
      imap = new _.default('127.0.0.1', port, {
        logLevel: _.LOG_LEVEL_NONE,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      return imap.connect().then(() => {
        return imap.selectMailbox('[Gmail]/Spam');
      });
    });
    afterEach(() => {
      return imap.close();
    });
    describe('#listMailboxes', () => {
      it('should succeed', () => {
        return imap.listMailboxes().then(mailboxes => {
          expect(mailboxes).to.exist;
        });
      });
    });
    describe('#listMessages', () => {
      it('should succeed', () => {
        return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure', 'body.peek[]']).then(messages => {
          expect(messages).to.not.be.empty;
        });
      });
    });
    describe('#upload', () => {
      it('should succeed', () => {
        var msgCount;
        return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure']).then(messages => {
          expect(messages).to.not.be.empty;
          msgCount = messages.length;
        }).then(() => {
          return imap.upload('inbox', 'MIME-Version: 1.0\r\nDate: Wed, 9 Jul 2014 15:07:47 +0200\r\nDelivered-To: test@test.com\r\nMessage-ID: <CAHftYYQo=5fqbtnv-DazXhL2j5AxVP1nWarjkztn-N9SV91Z2w@mail.gmail.com>\r\nSubject: test\r\nFrom: Test Test <test@test.com>\r\nTo: Test Test <test@test.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\ntest', {
            flags: ['\\Seen', '\\Answered', '\\$MyFlag']
          });
        }).then(() => {
          return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure']);
        }).then(messages => {
          expect(messages.length).to.equal(msgCount + 1);
        });
      });
    });
    describe('#search', () => {
      it('should return a sequence number', () => {
        return imap.search('inbox', {
          header: ['subject', 'hello 3']
        }).then(result => {
          expect(result).to.deep.equal([3]);
        });
      });
      it('should return an uid', () => {
        return imap.search('inbox', {
          header: ['subject', 'hello 3']
        }, {
          byUid: true
        }).then(result => {
          expect(result).to.deep.equal([555]);
        });
      });
      it('should work with complex queries', () => {
        return imap.search('inbox', {
          header: ['subject', 'hello'],
          seen: true
        }).then(result => {
          expect(result).to.deep.equal([2]);
        });
      });
    });
    describe('#setFlags', () => {
      it('should set flags for a message', () => {
        return imap.setFlags('inbox', '1', ['\\Seen', '$MyFlag']).then(result => {
          expect(result).to.deep.equal([{
            '#': 1,
            flags: ['\\Seen', '$MyFlag']
          }]);
        });
      });
      it('should add flags to a message', () => {
        return imap.setFlags('inbox', '2', {
          add: ['$MyFlag']
        }).then(result => {
          expect(result).to.deep.equal([{
            '#': 2,
            flags: ['\\Seen', '$MyFlag']
          }]);
        });
      });
      it('should remove flags from a message', () => {
        return imap.setFlags('inbox', '557', {
          remove: ['\\Deleted']
        }, {
          byUid: true
        }).then(result => {
          expect(result).to.deep.equal([{
            '#': 5,
            flags: ['$MyFlag'],
            uid: 557
          }]);
        });
      });
      it('should not return anything on silent mode', () => {
        return imap.setFlags('inbox', '1', ['$MyFlag2'], {
          silent: true
        }).then(result => {
          expect(result).to.deep.equal([]);
        });
      });
    });
    describe('#store', () => {
      it('should add labels for a message', () => {
        return imap.store('inbox', '1', '+X-GM-LABELS', ['\\Sent', '\\Junk']).then(result => {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': ['\\Inbox', '\\Sent', '\\Junk']
          }]);
        });
      });
      it('should set labels for a message', () => {
        return imap.store('inbox', '1', 'X-GM-LABELS', ['\\Sent', '\\Junk']).then(result => {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': ['\\Sent', '\\Junk']
          }]);
        });
      });
      it('should remove labels from a message', () => {
        return imap.store('inbox', '1', '-X-GM-LABELS', ['\\Sent', '\\Inbox']).then(result => {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': []
          }]);
        });
      });
    });
    describe('#deleteMessages', () => {
      it('should delete a message', () => {
        var initialInfo;
        var expungeNotified = new Promise((resolve, reject) => {
          imap.onupdate = function (mb, type
          /*, data */
          ) {
            try {
              expect(mb).to.equal('inbox');
              expect(type).to.equal('expunge');
              resolve();
            } catch (err) {
              reject(err);
            }
          };
        });
        return imap.selectMailbox('inbox').then(info => {
          initialInfo = info;
          return imap.deleteMessages('inbox', 557, {
            byUid: true
          });
        }).then(() => {
          return imap.selectMailbox('inbox');
        }).then(resultInfo => {
          expect(initialInfo.exists - 1 === resultInfo.exists).to.be.true;
        }).then(() => expungeNotified);
      });
    });
    describe('#copyMessages', () => {
      it('should copy a message', () => {
        return imap.copyMessages('inbox', 555, '[Gmail]/Trash', {
          byUid: true
        }).then(() => {
          return imap.selectMailbox('[Gmail]/Trash');
        }).then(info => {
          expect(info.exists).to.equal(1);
        });
      });
    });
    describe('#moveMessages', () => {
      it('should move a message', () => {
        var initialInfo;
        return imap.selectMailbox('inbox').then(info => {
          initialInfo = info;
          return imap.moveMessages('inbox', 555, '[Gmail]/Spam', {
            byUid: true
          });
        }).then(() => {
          return imap.selectMailbox('[Gmail]/Spam');
        }).then(info => {
          expect(info.exists).to.equal(1);
          return imap.selectMailbox('inbox');
        }).then(resultInfo => {
          expect(initialInfo.exists).to.not.equal(resultInfo.exists);
        });
      });
    });
    describe('precheck', () => {
      it('should handle precheck error correctly', () => {
        // simulates a broken search command
        var search = (query, options = {}) => {
          var command = (0, _commandBuilder.buildSEARCHCommand)(query, options);
          return imap.exec(command, 'SEARCH', {
            precheck: () => Promise.reject(new Error('FOO'))
          }).then(response => (0, _commandParser.parseSEARCH)(response));
        };

        return imap.selectMailbox('inbox').then(() => search({
          header: ['subject', 'hello 3']
        })).catch(err => {
          expect(err.message).to.equal('FOO');
          return imap.selectMailbox('[Gmail]/Spam');
        });
      });
      it('should select correct mailboxes in prechecks on concurrent calls', () => {
        return imap.selectMailbox('[Gmail]/A').then(() => {
          return Promise.all([imap.selectMailbox('[Gmail]/B'), imap.setFlags('[Gmail]/A', '1', ['\\Seen'])]);
        }).then(() => {
          return imap.listMessages('[Gmail]/A', '1:1', ['flags']);
        }).then(messages => {
          expect(messages.length).to.equal(1);
          expect(messages[0].flags).to.deep.equal(['\\Seen']);
        });
      });
      it('should send precheck commands in correct order on concurrent calls', () => {
        return Promise.all([imap.setFlags('[Gmail]/A', '1', ['\\Seen']), imap.setFlags('[Gmail]/B', '1', ['\\Seen'])]).then(() => {
          return imap.listMessages('[Gmail]/A', '1:1', ['flags']);
        }).then(messages => {
          expect(messages.length).to.equal(1);
          expect(messages[0].flags).to.deep.equal(['\\Seen']);
        }).then(() => {
          return imap.listMessages('[Gmail]/B', '1:1', ['flags']);
        }).then(messages => {
          expect(messages.length).to.equal(1);
          expect(messages[0].flags).to.deep.equal(['\\Seen']);
        });
      });
    });
  });
  describe('Timeout', () => {
    beforeEach(() => {
      imap = new _.default('127.0.0.1', port, {
        logLevel: _.LOG_LEVEL_NONE,
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      return imap.connect().then(() => {
        // remove the ondata event to simulate 100% packet loss and make the socket time out after 10ms
        imap.client.timeoutSocketLowerBound = 10;
        imap.client.timeoutSocketMultiplier = 0;

        imap.client.socket.ondata = () => {};
      });
    });
    it('should timeout', done => {
      imap.onerror = () => {
        done();
      };

      imap.selectMailbox('inbox').catch(() => {});
    });
    it('should reject all pending commands on timeout', () => {
      let rejectionCount = 0;
      return Promise.all([imap.selectMailbox('INBOX').catch(err => {
        expect(err).to.exist;
        rejectionCount++;
      }), imap.listMessages('INBOX', '1:*', ['body.peek[]']).catch(err => {
        expect(err).to.exist;
        rejectionCount++;
      })]).then(() => {
        expect(rejectionCount).to.equal(2);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQtaW50ZWdyYXRpb24uanMiXSwibmFtZXMiOlsicHJvY2VzcyIsImVudiIsIk5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQiLCJkZXNjcmliZSIsImltYXAiLCJwb3J0Iiwic2VydmVyIiwiYmVmb3JlRWFjaCIsImRvbmUiLCJvcHRpb25zIiwicGx1Z2lucyIsInNlY3VyZUNvbm5lY3Rpb24iLCJzdG9yYWdlIiwiSU5CT1giLCJtZXNzYWdlcyIsInJhdyIsImZsYWdzIiwidWlkIiwic2VwYXJhdG9yIiwiZm9sZGVycyIsIkRyYWZ0cyIsIkltcG9ydGFudCIsIlNwYW0iLCJTdGFycmVkIiwiVHJhc2giLCJBIiwiQiIsImxpc3RlbiIsImFmdGVyRWFjaCIsImNsb3NlIiwiaW5zZWN1cmVTZXJ2ZXIiLCJpdCIsIkltYXBDbGllbnQiLCJsb2dMZXZlbCIsImF1dGgiLCJ1c2VyIiwicGFzcyIsInVzZVNlY3VyZVRyYW5zcG9ydCIsImNvbm5lY3QiLCJ0aGVuIiwiZXhwZWN0IiwiY2xpZW50Iiwic2VjdXJlTW9kZSIsInRvIiwiYmUiLCJ0cnVlIiwiaWdub3JlVExTIiwiZmFsc2UiLCJyZXF1aXJlVExTIiwiY2F0Y2giLCJlcnIiLCJleGlzdCIsInNlbGVjdE1haWxib3giLCJsaXN0TWFpbGJveGVzIiwibWFpbGJveGVzIiwibGlzdE1lc3NhZ2VzIiwibm90IiwiZW1wdHkiLCJtc2dDb3VudCIsImxlbmd0aCIsInVwbG9hZCIsImVxdWFsIiwic2VhcmNoIiwiaGVhZGVyIiwicmVzdWx0IiwiZGVlcCIsImJ5VWlkIiwic2VlbiIsInNldEZsYWdzIiwiYWRkIiwicmVtb3ZlIiwic2lsZW50Iiwic3RvcmUiLCJpbml0aWFsSW5mbyIsImV4cHVuZ2VOb3RpZmllZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwib251cGRhdGUiLCJtYiIsInR5cGUiLCJpbmZvIiwiZGVsZXRlTWVzc2FnZXMiLCJyZXN1bHRJbmZvIiwiZXhpc3RzIiwiY29weU1lc3NhZ2VzIiwibW92ZU1lc3NhZ2VzIiwicXVlcnkiLCJjb21tYW5kIiwiZXhlYyIsInByZWNoZWNrIiwiRXJyb3IiLCJyZXNwb25zZSIsIm1lc3NhZ2UiLCJhbGwiLCJ0aW1lb3V0U29ja2V0TG93ZXJCb3VuZCIsInRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyIiwic29ja2V0Iiwib25kYXRhIiwib25lcnJvciIsInJlamVjdGlvbkNvdW50Il0sIm1hcHBpbmdzIjoiOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUxBO0FBT0FBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyw0QkFBWixHQUEyQyxHQUEzQztBQUVBQyxRQUFRLENBQUMsOEJBQUQsRUFBaUMsTUFBTTtBQUM3QyxNQUFJQyxJQUFKO0FBQ0EsUUFBTUMsSUFBSSxHQUFHLEtBQWI7QUFDQSxNQUFJQyxNQUFKO0FBRUFDLEVBQUFBLFVBQVUsQ0FBRUMsSUFBRCxJQUFVO0FBQ25CO0FBQ0EsUUFBSUMsT0FBTyxHQUFHO0FBQ1o7QUFDQUMsTUFBQUEsT0FBTyxFQUFFLENBQUMsVUFBRCxFQUFhLFlBQWIsQ0FGRztBQUdaQyxNQUFBQSxnQkFBZ0IsRUFBRSxLQUhOO0FBSVpDLE1BQUFBLE9BQU8sRUFBRTtBQUNQQyxRQUFBQSxLQUFLLEVBQUU7QUFDTEMsVUFBQUEsUUFBUSxFQUFFLENBQ1I7QUFBRUMsWUFBQUEsR0FBRyxFQUFFO0FBQVAsV0FEUSxFQUVSO0FBQUVBLFlBQUFBLEdBQUcsRUFBRSxrQ0FBUDtBQUEyQ0MsWUFBQUEsS0FBSyxFQUFFLENBQUMsUUFBRDtBQUFsRCxXQUZRLEVBR1I7QUFBRUQsWUFBQUEsR0FBRyxFQUFFLGtDQUFQO0FBQTJDRSxZQUFBQSxHQUFHLEVBQUU7QUFBaEQsV0FIUSxFQUlSO0FBQUVGLFlBQUFBLEdBQUcsRUFBRTtBQUFQLFdBSlEsRUFLUjtBQUFFQSxZQUFBQSxHQUFHLEVBQUUsa0NBQVA7QUFBMkNDLFlBQUFBLEtBQUssRUFBRSxDQUFDLFNBQUQsRUFBWSxXQUFaLENBQWxEO0FBQTRFQyxZQUFBQSxHQUFHLEVBQUU7QUFBakYsV0FMUSxFQU1SO0FBQUVGLFlBQUFBLEdBQUcsRUFBRTtBQUFQLFdBTlEsRUFPUjtBQUFFQSxZQUFBQSxHQUFHLEVBQUUsa0NBQVA7QUFBMkNFLFlBQUFBLEdBQUcsRUFBRTtBQUFoRCxXQVBRO0FBREwsU0FEQTtBQVlQLFlBQUk7QUFDRkMsVUFBQUEsU0FBUyxFQUFFLEdBRFQ7QUFFRkMsVUFBQUEsT0FBTyxFQUFFO0FBQ1AsdUJBQVc7QUFDVEgsY0FBQUEsS0FBSyxFQUFFLENBQUMsWUFBRCxDQURFO0FBRVRHLGNBQUFBLE9BQU8sRUFBRTtBQUNQLDRCQUFZO0FBQUUsaUNBQWU7QUFBakIsaUJBREw7QUFFUEMsZ0JBQUFBLE1BQU0sRUFBRTtBQUFFLGlDQUFlO0FBQWpCLGlCQUZEO0FBR1BDLGdCQUFBQSxTQUFTLEVBQUU7QUFBRSxpQ0FBZTtBQUFqQixpQkFISjtBQUlQLDZCQUFhO0FBQUUsaUNBQWU7QUFBakIsaUJBSk47QUFLUEMsZ0JBQUFBLElBQUksRUFBRTtBQUFFLGlDQUFlO0FBQWpCLGlCQUxDO0FBTVBDLGdCQUFBQSxPQUFPLEVBQUU7QUFBRSxpQ0FBZTtBQUFqQixpQkFORjtBQU9QQyxnQkFBQUEsS0FBSyxFQUFFO0FBQUUsaUNBQWU7QUFBakIsaUJBUEE7QUFRUEMsZ0JBQUFBLENBQUMsRUFBRTtBQUFFWCxrQkFBQUEsUUFBUSxFQUFFLENBQUMsRUFBRDtBQUFaLGlCQVJJO0FBU1BZLGdCQUFBQSxDQUFDLEVBQUU7QUFBRVosa0JBQUFBLFFBQVEsRUFBRSxDQUFDLEVBQUQ7QUFBWjtBQVRJO0FBRkE7QUFESjtBQUZQO0FBWkc7QUFKRyxLQUFkO0FBc0NBUixJQUFBQSxNQUFNLEdBQUcsNkJBQVdHLE9BQVgsQ0FBVDtBQUNBSCxJQUFBQSxNQUFNLENBQUNxQixNQUFQLENBQWN0QixJQUFkLEVBQW9CRyxJQUFwQjtBQUNELEdBMUNTLENBQVY7QUE0Q0FvQixFQUFBQSxTQUFTLENBQUVwQixJQUFELElBQVU7QUFDbEJGLElBQUFBLE1BQU0sQ0FBQ3VCLEtBQVAsQ0FBYXJCLElBQWI7QUFDRCxHQUZRLENBQVQ7QUFJQUwsRUFBQUEsUUFBUSxDQUFDLGtCQUFELEVBQXFCLE1BQU07QUFDakMsUUFBSTJCLGNBQUo7QUFFQXZCLElBQUFBLFVBQVUsQ0FBRUMsSUFBRCxJQUFVO0FBQ25CO0FBQ0EsVUFBSUMsT0FBTyxHQUFHO0FBQ1o7QUFDQUMsUUFBQUEsT0FBTyxFQUFFLEVBRkc7QUFHWkMsUUFBQUEsZ0JBQWdCLEVBQUU7QUFITixPQUFkO0FBTUFtQixNQUFBQSxjQUFjLEdBQUcsNkJBQVdyQixPQUFYLENBQWpCO0FBQ0FxQixNQUFBQSxjQUFjLENBQUNILE1BQWYsQ0FBc0J0QixJQUFJLEdBQUcsQ0FBN0IsRUFBZ0NHLElBQWhDO0FBQ0QsS0FWUyxDQUFWO0FBWUFvQixJQUFBQSxTQUFTLENBQUVwQixJQUFELElBQVU7QUFDbEJzQixNQUFBQSxjQUFjLENBQUNELEtBQWYsQ0FBcUJyQixJQUFyQjtBQUNELEtBRlEsQ0FBVDtBQUlBdUIsSUFBQUEsRUFBRSxDQUFDLGdDQUFELEVBQW1DLE1BQU07QUFDekMzQixNQUFBQSxJQUFJLEdBQUcsSUFBSTRCLFNBQUosQ0FBZSxXQUFmLEVBQTRCM0IsSUFBNUIsRUFBa0M7QUFDdkM0QixRQUFBQSxRQUFRLEVBQVJBLGdCQUR1QztBQUV2Q0MsUUFBQUEsSUFBSSxFQUFFO0FBQ0pDLFVBQUFBLElBQUksRUFBRSxVQURGO0FBRUpDLFVBQUFBLElBQUksRUFBRTtBQUZGLFNBRmlDO0FBTXZDQyxRQUFBQSxrQkFBa0IsRUFBRTtBQU5tQixPQUFsQyxDQUFQO0FBU0EsYUFBT2pDLElBQUksQ0FBQ2tDLE9BQUwsR0FBZUMsSUFBZixDQUFvQixNQUFNO0FBQy9CQyxRQUFBQSxNQUFNLENBQUNwQyxJQUFJLENBQUNxQyxNQUFMLENBQVlDLFVBQWIsQ0FBTixDQUErQkMsRUFBL0IsQ0FBa0NDLEVBQWxDLENBQXFDQyxJQUFyQztBQUNELE9BRk0sRUFFSk4sSUFGSSxDQUVDLE1BQU07QUFDWixlQUFPbkMsSUFBSSxDQUFDeUIsS0FBTCxFQUFQO0FBQ0QsT0FKTSxDQUFQO0FBS0QsS0FmQyxDQUFGO0FBaUJBRSxJQUFBQSxFQUFFLENBQUMsd0JBQUQsRUFBMkIsTUFBTTtBQUNqQzNCLE1BQUFBLElBQUksR0FBRyxJQUFJNEIsU0FBSixDQUFlLFdBQWYsRUFBNEIzQixJQUE1QixFQUFrQztBQUN2QzRCLFFBQUFBLFFBQVEsRUFBUkEsZ0JBRHVDO0FBRXZDQyxRQUFBQSxJQUFJLEVBQUU7QUFDSkMsVUFBQUEsSUFBSSxFQUFFLFVBREY7QUFFSkMsVUFBQUEsSUFBSSxFQUFFO0FBRkYsU0FGaUM7QUFNdkNDLFFBQUFBLGtCQUFrQixFQUFFLEtBTm1CO0FBT3ZDUyxRQUFBQSxTQUFTLEVBQUU7QUFQNEIsT0FBbEMsQ0FBUDtBQVVBLGFBQU8xQyxJQUFJLENBQUNrQyxPQUFMLEdBQWVDLElBQWYsQ0FBb0IsTUFBTTtBQUMvQkMsUUFBQUEsTUFBTSxDQUFDcEMsSUFBSSxDQUFDcUMsTUFBTCxDQUFZQyxVQUFiLENBQU4sQ0FBK0JDLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0csS0FBckM7QUFDRCxPQUZNLEVBRUpSLElBRkksQ0FFQyxNQUFNO0FBQ1osZUFBT25DLElBQUksQ0FBQ3lCLEtBQUwsRUFBUDtBQUNELE9BSk0sQ0FBUDtBQUtELEtBaEJDLENBQUY7QUFrQkFFLElBQUFBLEVBQUUsQ0FBQyw2Q0FBRCxFQUFnRCxNQUFNO0FBQ3REM0IsTUFBQUEsSUFBSSxHQUFHLElBQUk0QixTQUFKLENBQWUsV0FBZixFQUE0QjNCLElBQUksR0FBRyxDQUFuQyxFQUFzQztBQUMzQzRCLFFBQUFBLFFBQVEsRUFBUkEsZ0JBRDJDO0FBRTNDQyxRQUFBQSxJQUFJLEVBQUU7QUFDSkMsVUFBQUEsSUFBSSxFQUFFLFVBREY7QUFFSkMsVUFBQUEsSUFBSSxFQUFFO0FBRkYsU0FGcUM7QUFNM0NDLFFBQUFBLGtCQUFrQixFQUFFLEtBTnVCO0FBTzNDVyxRQUFBQSxVQUFVLEVBQUU7QUFQK0IsT0FBdEMsQ0FBUDtBQVVBLGFBQU81QyxJQUFJLENBQUNrQyxPQUFMLEdBQWVXLEtBQWYsQ0FBc0JDLEdBQUQsSUFBUztBQUNuQ1YsUUFBQUEsTUFBTSxDQUFDVSxHQUFELENBQU4sQ0FBWVAsRUFBWixDQUFlUSxLQUFmO0FBQ0QsT0FGTSxDQUFQO0FBR0QsS0FkQyxDQUFGO0FBZ0JBcEIsSUFBQUEsRUFBRSxDQUFDLG1DQUFELEVBQXNDLE1BQU07QUFDNUMzQixNQUFBQSxJQUFJLEdBQUcsSUFBSTRCLFNBQUosQ0FBZSxXQUFmLEVBQTRCM0IsSUFBSSxHQUFHLENBQW5DLEVBQXNDO0FBQzNDNEIsUUFBQUEsUUFBUSxFQUFSQSxnQkFEMkM7QUFFM0NDLFFBQUFBLElBQUksRUFBRTtBQUNKQyxVQUFBQSxJQUFJLEVBQUUsVUFERjtBQUVKQyxVQUFBQSxJQUFJLEVBQUU7QUFGRixTQUZxQztBQU0zQ0MsUUFBQUEsa0JBQWtCLEVBQUU7QUFOdUIsT0FBdEMsQ0FBUDtBQVNBLGFBQU9qQyxJQUFJLENBQUNrQyxPQUFMLEdBQWVDLElBQWYsQ0FBb0IsTUFBTTtBQUMvQkMsUUFBQUEsTUFBTSxDQUFDcEMsSUFBSSxDQUFDcUMsTUFBTCxDQUFZQyxVQUFiLENBQU4sQ0FBK0JDLEVBQS9CLENBQWtDQyxFQUFsQyxDQUFxQ0csS0FBckM7QUFDRCxPQUZNLEVBRUpSLElBRkksQ0FFQyxNQUFNO0FBQ1osZUFBT25DLElBQUksQ0FBQ3lCLEtBQUwsRUFBUDtBQUNELE9BSk0sQ0FBUDtBQUtELEtBZkMsQ0FBRjtBQWlCQUUsSUFBQUEsRUFBRSxDQUFDLDRCQUFELEVBQWdDdkIsSUFBRCxJQUFVO0FBQ3pDSixNQUFBQSxJQUFJLEdBQUcsSUFBSTRCLFNBQUosQ0FBZSxXQUFmLEVBQTRCM0IsSUFBSSxHQUFHLENBQW5DLEVBQXNDO0FBQzNDNEIsUUFBQUEsUUFBUSxFQUFSQSxnQkFEMkM7QUFFM0NDLFFBQUFBLElBQUksRUFBRTtBQUNKQyxVQUFBQSxJQUFJLEVBQUUsU0FERjtBQUVKQyxVQUFBQSxJQUFJLEVBQUU7QUFGRixTQUZxQztBQU0zQ0MsUUFBQUEsa0JBQWtCLEVBQUU7QUFOdUIsT0FBdEMsQ0FBUDtBQVNBakMsTUFBQUEsSUFBSSxDQUFDa0MsT0FBTCxHQUFlQyxJQUFmLENBQW9CLE1BQU07QUFDeEJDLFFBQUFBLE1BQU0sQ0FBQ3BDLElBQUksQ0FBQ3FDLE1BQUwsQ0FBWUMsVUFBYixDQUFOLENBQStCQyxFQUEvQixDQUFrQ0MsRUFBbEMsQ0FBcUNHLEtBQXJDO0FBQ0QsT0FGRCxFQUVHRSxLQUZILENBRVMsTUFBTTtBQUFFekMsUUFBQUEsSUFBSTtBQUFJLE9BRnpCO0FBR0QsS0FiQyxDQUFGO0FBY0QsR0FyR08sQ0FBUjtBQXVHQUwsRUFBQUEsUUFBUSxDQUFDLGtCQUFELEVBQXFCLE1BQU07QUFDakNJLElBQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ2ZILE1BQUFBLElBQUksR0FBRyxJQUFJNEIsU0FBSixDQUFlLFdBQWYsRUFBNEIzQixJQUE1QixFQUFrQztBQUN2QzRCLFFBQUFBLFFBQVEsRUFBUkEsZ0JBRHVDO0FBRXZDQyxRQUFBQSxJQUFJLEVBQUU7QUFDSkMsVUFBQUEsSUFBSSxFQUFFLFVBREY7QUFFSkMsVUFBQUEsSUFBSSxFQUFFO0FBRkYsU0FGaUM7QUFNdkNDLFFBQUFBLGtCQUFrQixFQUFFO0FBTm1CLE9BQWxDLENBQVA7QUFTQSxhQUFPakMsSUFBSSxDQUFDa0MsT0FBTCxHQUFlQyxJQUFmLENBQW9CLE1BQU07QUFDL0IsZUFBT25DLElBQUksQ0FBQ2dELGFBQUwsQ0FBbUIsY0FBbkIsQ0FBUDtBQUNELE9BRk0sQ0FBUDtBQUdELEtBYlMsQ0FBVjtBQWVBeEIsSUFBQUEsU0FBUyxDQUFDLE1BQU07QUFDZCxhQUFPeEIsSUFBSSxDQUFDeUIsS0FBTCxFQUFQO0FBQ0QsS0FGUSxDQUFUO0FBSUExQixJQUFBQSxRQUFRLENBQUMsZ0JBQUQsRUFBbUIsTUFBTTtBQUMvQjRCLE1BQUFBLEVBQUUsQ0FBQyxnQkFBRCxFQUFtQixNQUFNO0FBQ3pCLGVBQU8zQixJQUFJLENBQUNpRCxhQUFMLEdBQXFCZCxJQUFyQixDQUEyQmUsU0FBRCxJQUFlO0FBQzlDZCxVQUFBQSxNQUFNLENBQUNjLFNBQUQsQ0FBTixDQUFrQlgsRUFBbEIsQ0FBcUJRLEtBQXJCO0FBQ0QsU0FGTSxDQUFQO0FBR0QsT0FKQyxDQUFGO0FBS0QsS0FOTyxDQUFSO0FBUUFoRCxJQUFBQSxRQUFRLENBQUMsZUFBRCxFQUFrQixNQUFNO0FBQzlCNEIsTUFBQUEsRUFBRSxDQUFDLGdCQUFELEVBQW1CLE1BQU07QUFDekIsZUFBTzNCLElBQUksQ0FBQ21ELFlBQUwsQ0FBa0IsT0FBbEIsRUFBMkIsS0FBM0IsRUFBa0MsQ0FBQyxLQUFELEVBQVEsT0FBUixFQUFpQixVQUFqQixFQUE2QixlQUE3QixFQUE4QyxhQUE5QyxDQUFsQyxFQUFnR2hCLElBQWhHLENBQXNHekIsUUFBRCxJQUFjO0FBQ3hIMEIsVUFBQUEsTUFBTSxDQUFDMUIsUUFBRCxDQUFOLENBQWlCNkIsRUFBakIsQ0FBb0JhLEdBQXBCLENBQXdCWixFQUF4QixDQUEyQmEsS0FBM0I7QUFDRCxTQUZNLENBQVA7QUFHRCxPQUpDLENBQUY7QUFLRCxLQU5PLENBQVI7QUFRQXRELElBQUFBLFFBQVEsQ0FBQyxTQUFELEVBQVksTUFBTTtBQUN4QjRCLE1BQUFBLEVBQUUsQ0FBQyxnQkFBRCxFQUFtQixNQUFNO0FBQ3pCLFlBQUkyQixRQUFKO0FBRUEsZUFBT3RELElBQUksQ0FBQ21ELFlBQUwsQ0FBa0IsT0FBbEIsRUFBMkIsS0FBM0IsRUFBa0MsQ0FBQyxLQUFELEVBQVEsT0FBUixFQUFpQixVQUFqQixFQUE2QixlQUE3QixDQUFsQyxFQUFpRmhCLElBQWpGLENBQXVGekIsUUFBRCxJQUFjO0FBQ3pHMEIsVUFBQUEsTUFBTSxDQUFDMUIsUUFBRCxDQUFOLENBQWlCNkIsRUFBakIsQ0FBb0JhLEdBQXBCLENBQXdCWixFQUF4QixDQUEyQmEsS0FBM0I7QUFDQUMsVUFBQUEsUUFBUSxHQUFHNUMsUUFBUSxDQUFDNkMsTUFBcEI7QUFDRCxTQUhNLEVBR0pwQixJQUhJLENBR0MsTUFBTTtBQUNaLGlCQUFPbkMsSUFBSSxDQUFDd0QsTUFBTCxDQUFZLE9BQVosRUFBcUIsMFRBQXJCLEVBQWlWO0FBQ3RWNUMsWUFBQUEsS0FBSyxFQUFFLENBQUMsUUFBRCxFQUFXLFlBQVgsRUFBeUIsV0FBekI7QUFEK1UsV0FBalYsQ0FBUDtBQUdELFNBUE0sRUFPSnVCLElBUEksQ0FPQyxNQUFNO0FBQ1osaUJBQU9uQyxJQUFJLENBQUNtRCxZQUFMLENBQWtCLE9BQWxCLEVBQTJCLEtBQTNCLEVBQWtDLENBQUMsS0FBRCxFQUFRLE9BQVIsRUFBaUIsVUFBakIsRUFBNkIsZUFBN0IsQ0FBbEMsQ0FBUDtBQUNELFNBVE0sRUFTSmhCLElBVEksQ0FTRXpCLFFBQUQsSUFBYztBQUNwQjBCLFVBQUFBLE1BQU0sQ0FBQzFCLFFBQVEsQ0FBQzZDLE1BQVYsQ0FBTixDQUF3QmhCLEVBQXhCLENBQTJCa0IsS0FBM0IsQ0FBaUNILFFBQVEsR0FBRyxDQUE1QztBQUNELFNBWE0sQ0FBUDtBQVlELE9BZkMsQ0FBRjtBQWdCRCxLQWpCTyxDQUFSO0FBbUJBdkQsSUFBQUEsUUFBUSxDQUFDLFNBQUQsRUFBWSxNQUFNO0FBQ3hCNEIsTUFBQUEsRUFBRSxDQUFDLGlDQUFELEVBQW9DLE1BQU07QUFDMUMsZUFBTzNCLElBQUksQ0FBQzBELE1BQUwsQ0FBWSxPQUFaLEVBQXFCO0FBQzFCQyxVQUFBQSxNQUFNLEVBQUUsQ0FBQyxTQUFELEVBQVksU0FBWjtBQURrQixTQUFyQixFQUVKeEIsSUFGSSxDQUVFeUIsTUFBRCxJQUFZO0FBQ2xCeEIsVUFBQUEsTUFBTSxDQUFDd0IsTUFBRCxDQUFOLENBQWVyQixFQUFmLENBQWtCc0IsSUFBbEIsQ0FBdUJKLEtBQXZCLENBQTZCLENBQUMsQ0FBRCxDQUE3QjtBQUNELFNBSk0sQ0FBUDtBQUtELE9BTkMsQ0FBRjtBQVFBOUIsTUFBQUEsRUFBRSxDQUFDLHNCQUFELEVBQXlCLE1BQU07QUFDL0IsZUFBTzNCLElBQUksQ0FBQzBELE1BQUwsQ0FBWSxPQUFaLEVBQXFCO0FBQzFCQyxVQUFBQSxNQUFNLEVBQUUsQ0FBQyxTQUFELEVBQVksU0FBWjtBQURrQixTQUFyQixFQUVKO0FBQ0RHLFVBQUFBLEtBQUssRUFBRTtBQUROLFNBRkksRUFJSjNCLElBSkksQ0FJRXlCLE1BQUQsSUFBWTtBQUNsQnhCLFVBQUFBLE1BQU0sQ0FBQ3dCLE1BQUQsQ0FBTixDQUFlckIsRUFBZixDQUFrQnNCLElBQWxCLENBQXVCSixLQUF2QixDQUE2QixDQUFDLEdBQUQsQ0FBN0I7QUFDRCxTQU5NLENBQVA7QUFPRCxPQVJDLENBQUY7QUFVQTlCLE1BQUFBLEVBQUUsQ0FBQyxrQ0FBRCxFQUFxQyxNQUFNO0FBQzNDLGVBQU8zQixJQUFJLENBQUMwRCxNQUFMLENBQVksT0FBWixFQUFxQjtBQUMxQkMsVUFBQUEsTUFBTSxFQUFFLENBQUMsU0FBRCxFQUFZLE9BQVosQ0FEa0I7QUFFMUJJLFVBQUFBLElBQUksRUFBRTtBQUZvQixTQUFyQixFQUdKNUIsSUFISSxDQUdFeUIsTUFBRCxJQUFZO0FBQ2xCeEIsVUFBQUEsTUFBTSxDQUFDd0IsTUFBRCxDQUFOLENBQWVyQixFQUFmLENBQWtCc0IsSUFBbEIsQ0FBdUJKLEtBQXZCLENBQTZCLENBQUMsQ0FBRCxDQUE3QjtBQUNELFNBTE0sQ0FBUDtBQU1ELE9BUEMsQ0FBRjtBQVFELEtBM0JPLENBQVI7QUE2QkExRCxJQUFBQSxRQUFRLENBQUMsV0FBRCxFQUFjLE1BQU07QUFDMUI0QixNQUFBQSxFQUFFLENBQUMsZ0NBQUQsRUFBbUMsTUFBTTtBQUN6QyxlQUFPM0IsSUFBSSxDQUFDZ0UsUUFBTCxDQUFjLE9BQWQsRUFBdUIsR0FBdkIsRUFBNEIsQ0FBQyxRQUFELEVBQVcsU0FBWCxDQUE1QixFQUFtRDdCLElBQW5ELENBQXlEeUIsTUFBRCxJQUFZO0FBQ3pFeEIsVUFBQUEsTUFBTSxDQUFDd0IsTUFBRCxDQUFOLENBQWVyQixFQUFmLENBQWtCc0IsSUFBbEIsQ0FBdUJKLEtBQXZCLENBQTZCLENBQUM7QUFDNUIsaUJBQUssQ0FEdUI7QUFFNUI3QyxZQUFBQSxLQUFLLEVBQUUsQ0FBQyxRQUFELEVBQVcsU0FBWDtBQUZxQixXQUFELENBQTdCO0FBSUQsU0FMTSxDQUFQO0FBTUQsT0FQQyxDQUFGO0FBU0FlLE1BQUFBLEVBQUUsQ0FBQywrQkFBRCxFQUFrQyxNQUFNO0FBQ3hDLGVBQU8zQixJQUFJLENBQUNnRSxRQUFMLENBQWMsT0FBZCxFQUF1QixHQUF2QixFQUE0QjtBQUNqQ0MsVUFBQUEsR0FBRyxFQUFFLENBQUMsU0FBRDtBQUQ0QixTQUE1QixFQUVKOUIsSUFGSSxDQUVFeUIsTUFBRCxJQUFZO0FBQ2xCeEIsVUFBQUEsTUFBTSxDQUFDd0IsTUFBRCxDQUFOLENBQWVyQixFQUFmLENBQWtCc0IsSUFBbEIsQ0FBdUJKLEtBQXZCLENBQTZCLENBQUM7QUFDNUIsaUJBQUssQ0FEdUI7QUFFNUI3QyxZQUFBQSxLQUFLLEVBQUUsQ0FBQyxRQUFELEVBQVcsU0FBWDtBQUZxQixXQUFELENBQTdCO0FBSUQsU0FQTSxDQUFQO0FBUUQsT0FUQyxDQUFGO0FBV0FlLE1BQUFBLEVBQUUsQ0FBQyxvQ0FBRCxFQUF1QyxNQUFNO0FBQzdDLGVBQU8zQixJQUFJLENBQUNnRSxRQUFMLENBQWMsT0FBZCxFQUF1QixLQUF2QixFQUE4QjtBQUNuQ0UsVUFBQUEsTUFBTSxFQUFFLENBQUMsV0FBRDtBQUQyQixTQUE5QixFQUVKO0FBQ0RKLFVBQUFBLEtBQUssRUFBRTtBQUROLFNBRkksRUFJSjNCLElBSkksQ0FJRXlCLE1BQUQsSUFBWTtBQUNsQnhCLFVBQUFBLE1BQU0sQ0FBQ3dCLE1BQUQsQ0FBTixDQUFlckIsRUFBZixDQUFrQnNCLElBQWxCLENBQXVCSixLQUF2QixDQUE2QixDQUFDO0FBQzVCLGlCQUFLLENBRHVCO0FBRTVCN0MsWUFBQUEsS0FBSyxFQUFFLENBQUMsU0FBRCxDQUZxQjtBQUc1QkMsWUFBQUEsR0FBRyxFQUFFO0FBSHVCLFdBQUQsQ0FBN0I7QUFLRCxTQVZNLENBQVA7QUFXRCxPQVpDLENBQUY7QUFjQWMsTUFBQUEsRUFBRSxDQUFDLDJDQUFELEVBQThDLE1BQU07QUFDcEQsZUFBTzNCLElBQUksQ0FBQ2dFLFFBQUwsQ0FBYyxPQUFkLEVBQXVCLEdBQXZCLEVBQTRCLENBQUMsVUFBRCxDQUE1QixFQUEwQztBQUMvQ0csVUFBQUEsTUFBTSxFQUFFO0FBRHVDLFNBQTFDLEVBRUpoQyxJQUZJLENBRUV5QixNQUFELElBQVk7QUFDbEJ4QixVQUFBQSxNQUFNLENBQUN3QixNQUFELENBQU4sQ0FBZXJCLEVBQWYsQ0FBa0JzQixJQUFsQixDQUF1QkosS0FBdkIsQ0FBNkIsRUFBN0I7QUFDRCxTQUpNLENBQVA7QUFLRCxPQU5DLENBQUY7QUFPRCxLQTFDTyxDQUFSO0FBNENBMUQsSUFBQUEsUUFBUSxDQUFDLFFBQUQsRUFBVyxNQUFNO0FBQ3ZCNEIsTUFBQUEsRUFBRSxDQUFDLGlDQUFELEVBQW9DLE1BQU07QUFDMUMsZUFBTzNCLElBQUksQ0FBQ29FLEtBQUwsQ0FBVyxPQUFYLEVBQW9CLEdBQXBCLEVBQXlCLGNBQXpCLEVBQXlDLENBQUMsUUFBRCxFQUFXLFFBQVgsQ0FBekMsRUFBK0RqQyxJQUEvRCxDQUFxRXlCLE1BQUQsSUFBWTtBQUNyRnhCLFVBQUFBLE1BQU0sQ0FBQ3dCLE1BQUQsQ0FBTixDQUFlckIsRUFBZixDQUFrQnNCLElBQWxCLENBQXVCSixLQUF2QixDQUE2QixDQUFDO0FBQzVCLGlCQUFLLENBRHVCO0FBRTVCLDJCQUFlLENBQUMsU0FBRCxFQUFZLFFBQVosRUFBc0IsUUFBdEI7QUFGYSxXQUFELENBQTdCO0FBSUQsU0FMTSxDQUFQO0FBTUQsT0FQQyxDQUFGO0FBU0E5QixNQUFBQSxFQUFFLENBQUMsaUNBQUQsRUFBb0MsTUFBTTtBQUMxQyxlQUFPM0IsSUFBSSxDQUFDb0UsS0FBTCxDQUFXLE9BQVgsRUFBb0IsR0FBcEIsRUFBeUIsYUFBekIsRUFBd0MsQ0FBQyxRQUFELEVBQVcsUUFBWCxDQUF4QyxFQUE4RGpDLElBQTlELENBQW9FeUIsTUFBRCxJQUFZO0FBQ3BGeEIsVUFBQUEsTUFBTSxDQUFDd0IsTUFBRCxDQUFOLENBQWVyQixFQUFmLENBQWtCc0IsSUFBbEIsQ0FBdUJKLEtBQXZCLENBQTZCLENBQUM7QUFDNUIsaUJBQUssQ0FEdUI7QUFFNUIsMkJBQWUsQ0FBQyxRQUFELEVBQVcsUUFBWDtBQUZhLFdBQUQsQ0FBN0I7QUFJRCxTQUxNLENBQVA7QUFNRCxPQVBDLENBQUY7QUFTQTlCLE1BQUFBLEVBQUUsQ0FBQyxxQ0FBRCxFQUF3QyxNQUFNO0FBQzlDLGVBQU8zQixJQUFJLENBQUNvRSxLQUFMLENBQVcsT0FBWCxFQUFvQixHQUFwQixFQUF5QixjQUF6QixFQUF5QyxDQUFDLFFBQUQsRUFBVyxTQUFYLENBQXpDLEVBQWdFakMsSUFBaEUsQ0FBc0V5QixNQUFELElBQVk7QUFDdEZ4QixVQUFBQSxNQUFNLENBQUN3QixNQUFELENBQU4sQ0FBZXJCLEVBQWYsQ0FBa0JzQixJQUFsQixDQUF1QkosS0FBdkIsQ0FBNkIsQ0FBQztBQUM1QixpQkFBSyxDQUR1QjtBQUU1QiwyQkFBZTtBQUZhLFdBQUQsQ0FBN0I7QUFJRCxTQUxNLENBQVA7QUFNRCxPQVBDLENBQUY7QUFRRCxLQTNCTyxDQUFSO0FBNkJBMUQsSUFBQUEsUUFBUSxDQUFDLGlCQUFELEVBQW9CLE1BQU07QUFDaEM0QixNQUFBQSxFQUFFLENBQUMseUJBQUQsRUFBNEIsTUFBTTtBQUNsQyxZQUFJMEMsV0FBSjtBQUVBLFlBQUlDLGVBQWUsR0FBRyxJQUFJQyxPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQ3JEekUsVUFBQUEsSUFBSSxDQUFDMEUsUUFBTCxHQUFnQixVQUFVQyxFQUFWLEVBQWNDO0FBQUs7QUFBbkIsWUFBZ0M7QUFDOUMsZ0JBQUk7QUFDRnhDLGNBQUFBLE1BQU0sQ0FBQ3VDLEVBQUQsQ0FBTixDQUFXcEMsRUFBWCxDQUFja0IsS0FBZCxDQUFvQixPQUFwQjtBQUNBckIsY0FBQUEsTUFBTSxDQUFDd0MsSUFBRCxDQUFOLENBQWFyQyxFQUFiLENBQWdCa0IsS0FBaEIsQ0FBc0IsU0FBdEI7QUFDQWUsY0FBQUEsT0FBTztBQUNSLGFBSkQsQ0FJRSxPQUFPMUIsR0FBUCxFQUFZO0FBQ1oyQixjQUFBQSxNQUFNLENBQUMzQixHQUFELENBQU47QUFDRDtBQUNGLFdBUkQ7QUFTRCxTQVZxQixDQUF0QjtBQVlBLGVBQU85QyxJQUFJLENBQUNnRCxhQUFMLENBQW1CLE9BQW5CLEVBQTRCYixJQUE1QixDQUFrQzBDLElBQUQsSUFBVTtBQUNoRFIsVUFBQUEsV0FBVyxHQUFHUSxJQUFkO0FBQ0EsaUJBQU83RSxJQUFJLENBQUM4RSxjQUFMLENBQW9CLE9BQXBCLEVBQTZCLEdBQTdCLEVBQWtDO0FBQ3ZDaEIsWUFBQUEsS0FBSyxFQUFFO0FBRGdDLFdBQWxDLENBQVA7QUFHRCxTQUxNLEVBS0ozQixJQUxJLENBS0MsTUFBTTtBQUNaLGlCQUFPbkMsSUFBSSxDQUFDZ0QsYUFBTCxDQUFtQixPQUFuQixDQUFQO0FBQ0QsU0FQTSxFQU9KYixJQVBJLENBT0U0QyxVQUFELElBQWdCO0FBQ3RCM0MsVUFBQUEsTUFBTSxDQUFDaUMsV0FBVyxDQUFDVyxNQUFaLEdBQXFCLENBQXJCLEtBQTJCRCxVQUFVLENBQUNDLE1BQXZDLENBQU4sQ0FBcUR6QyxFQUFyRCxDQUF3REMsRUFBeEQsQ0FBMkRDLElBQTNEO0FBQ0QsU0FUTSxFQVNKTixJQVRJLENBU0MsTUFBTW1DLGVBVFAsQ0FBUDtBQVVELE9BekJDLENBQUY7QUEwQkQsS0EzQk8sQ0FBUjtBQTZCQXZFLElBQUFBLFFBQVEsQ0FBQyxlQUFELEVBQWtCLE1BQU07QUFDOUI0QixNQUFBQSxFQUFFLENBQUMsdUJBQUQsRUFBMEIsTUFBTTtBQUNoQyxlQUFPM0IsSUFBSSxDQUFDaUYsWUFBTCxDQUFrQixPQUFsQixFQUEyQixHQUEzQixFQUFnQyxlQUFoQyxFQUFpRDtBQUN0RG5CLFVBQUFBLEtBQUssRUFBRTtBQUQrQyxTQUFqRCxFQUVKM0IsSUFGSSxDQUVDLE1BQU07QUFDWixpQkFBT25DLElBQUksQ0FBQ2dELGFBQUwsQ0FBbUIsZUFBbkIsQ0FBUDtBQUNELFNBSk0sRUFJSmIsSUFKSSxDQUlFMEMsSUFBRCxJQUFVO0FBQ2hCekMsVUFBQUEsTUFBTSxDQUFDeUMsSUFBSSxDQUFDRyxNQUFOLENBQU4sQ0FBb0J6QyxFQUFwQixDQUF1QmtCLEtBQXZCLENBQTZCLENBQTdCO0FBQ0QsU0FOTSxDQUFQO0FBT0QsT0FSQyxDQUFGO0FBU0QsS0FWTyxDQUFSO0FBWUExRCxJQUFBQSxRQUFRLENBQUMsZUFBRCxFQUFrQixNQUFNO0FBQzlCNEIsTUFBQUEsRUFBRSxDQUFDLHVCQUFELEVBQTBCLE1BQU07QUFDaEMsWUFBSTBDLFdBQUo7QUFDQSxlQUFPckUsSUFBSSxDQUFDZ0QsYUFBTCxDQUFtQixPQUFuQixFQUE0QmIsSUFBNUIsQ0FBa0MwQyxJQUFELElBQVU7QUFDaERSLFVBQUFBLFdBQVcsR0FBR1EsSUFBZDtBQUNBLGlCQUFPN0UsSUFBSSxDQUFDa0YsWUFBTCxDQUFrQixPQUFsQixFQUEyQixHQUEzQixFQUFnQyxjQUFoQyxFQUFnRDtBQUNyRHBCLFlBQUFBLEtBQUssRUFBRTtBQUQ4QyxXQUFoRCxDQUFQO0FBR0QsU0FMTSxFQUtKM0IsSUFMSSxDQUtDLE1BQU07QUFDWixpQkFBT25DLElBQUksQ0FBQ2dELGFBQUwsQ0FBbUIsY0FBbkIsQ0FBUDtBQUNELFNBUE0sRUFPSmIsSUFQSSxDQU9FMEMsSUFBRCxJQUFVO0FBQ2hCekMsVUFBQUEsTUFBTSxDQUFDeUMsSUFBSSxDQUFDRyxNQUFOLENBQU4sQ0FBb0J6QyxFQUFwQixDQUF1QmtCLEtBQXZCLENBQTZCLENBQTdCO0FBQ0EsaUJBQU96RCxJQUFJLENBQUNnRCxhQUFMLENBQW1CLE9BQW5CLENBQVA7QUFDRCxTQVZNLEVBVUpiLElBVkksQ0FVRTRDLFVBQUQsSUFBZ0I7QUFDdEIzQyxVQUFBQSxNQUFNLENBQUNpQyxXQUFXLENBQUNXLE1BQWIsQ0FBTixDQUEyQnpDLEVBQTNCLENBQThCYSxHQUE5QixDQUFrQ0ssS0FBbEMsQ0FBd0NzQixVQUFVLENBQUNDLE1BQW5EO0FBQ0QsU0FaTSxDQUFQO0FBYUQsT0FmQyxDQUFGO0FBZ0JELEtBakJPLENBQVI7QUFtQkFqRixJQUFBQSxRQUFRLENBQUMsVUFBRCxFQUFhLE1BQU07QUFDekI0QixNQUFBQSxFQUFFLENBQUMsd0NBQUQsRUFBMkMsTUFBTTtBQUNqRDtBQUNBLFlBQUkrQixNQUFNLEdBQUcsQ0FBQ3lCLEtBQUQsRUFBUTlFLE9BQU8sR0FBRyxFQUFsQixLQUF5QjtBQUNwQyxjQUFJK0UsT0FBTyxHQUFHLHdDQUFtQkQsS0FBbkIsRUFBMEI5RSxPQUExQixDQUFkO0FBQ0EsaUJBQU9MLElBQUksQ0FBQ3FGLElBQUwsQ0FBVUQsT0FBVixFQUFtQixRQUFuQixFQUE2QjtBQUNsQ0UsWUFBQUEsUUFBUSxFQUFFLE1BQU1mLE9BQU8sQ0FBQ0UsTUFBUixDQUFlLElBQUljLEtBQUosQ0FBVSxLQUFWLENBQWY7QUFEa0IsV0FBN0IsRUFFSnBELElBRkksQ0FFRXFELFFBQUQsSUFBYyxnQ0FBWUEsUUFBWixDQUZmLENBQVA7QUFHRCxTQUxEOztBQU9BLGVBQU94RixJQUFJLENBQUNnRCxhQUFMLENBQW1CLE9BQW5CLEVBQ0piLElBREksQ0FDQyxNQUFNdUIsTUFBTSxDQUFDO0FBQUVDLFVBQUFBLE1BQU0sRUFBRSxDQUFDLFNBQUQsRUFBWSxTQUFaO0FBQVYsU0FBRCxDQURiLEVBRUpkLEtBRkksQ0FFR0MsR0FBRCxJQUFTO0FBQ2RWLFVBQUFBLE1BQU0sQ0FBQ1UsR0FBRyxDQUFDMkMsT0FBTCxDQUFOLENBQW9CbEQsRUFBcEIsQ0FBdUJrQixLQUF2QixDQUE2QixLQUE3QjtBQUNBLGlCQUFPekQsSUFBSSxDQUFDZ0QsYUFBTCxDQUFtQixjQUFuQixDQUFQO0FBQ0QsU0FMSSxDQUFQO0FBTUQsT0FmQyxDQUFGO0FBaUJBckIsTUFBQUEsRUFBRSxDQUFDLGtFQUFELEVBQXFFLE1BQU07QUFDM0UsZUFBTzNCLElBQUksQ0FBQ2dELGFBQUwsQ0FBbUIsV0FBbkIsRUFBZ0NiLElBQWhDLENBQXFDLE1BQU07QUFDaEQsaUJBQU9vQyxPQUFPLENBQUNtQixHQUFSLENBQVksQ0FDakIxRixJQUFJLENBQUNnRCxhQUFMLENBQW1CLFdBQW5CLENBRGlCLEVBRWpCaEQsSUFBSSxDQUFDZ0UsUUFBTCxDQUFjLFdBQWQsRUFBMkIsR0FBM0IsRUFBZ0MsQ0FBQyxRQUFELENBQWhDLENBRmlCLENBQVosQ0FBUDtBQUlELFNBTE0sRUFLSjdCLElBTEksQ0FLQyxNQUFNO0FBQ1osaUJBQU9uQyxJQUFJLENBQUNtRCxZQUFMLENBQWtCLFdBQWxCLEVBQStCLEtBQS9CLEVBQXNDLENBQUMsT0FBRCxDQUF0QyxDQUFQO0FBQ0QsU0FQTSxFQU9KaEIsSUFQSSxDQU9FekIsUUFBRCxJQUFjO0FBQ3BCMEIsVUFBQUEsTUFBTSxDQUFDMUIsUUFBUSxDQUFDNkMsTUFBVixDQUFOLENBQXdCaEIsRUFBeEIsQ0FBMkJrQixLQUEzQixDQUFpQyxDQUFqQztBQUNBckIsVUFBQUEsTUFBTSxDQUFDMUIsUUFBUSxDQUFDLENBQUQsQ0FBUixDQUFZRSxLQUFiLENBQU4sQ0FBMEIyQixFQUExQixDQUE2QnNCLElBQTdCLENBQWtDSixLQUFsQyxDQUF3QyxDQUFDLFFBQUQsQ0FBeEM7QUFDRCxTQVZNLENBQVA7QUFXRCxPQVpDLENBQUY7QUFjQTlCLE1BQUFBLEVBQUUsQ0FBQyxvRUFBRCxFQUF1RSxNQUFNO0FBQzdFLGVBQU80QyxPQUFPLENBQUNtQixHQUFSLENBQVksQ0FDakIxRixJQUFJLENBQUNnRSxRQUFMLENBQWMsV0FBZCxFQUEyQixHQUEzQixFQUFnQyxDQUFDLFFBQUQsQ0FBaEMsQ0FEaUIsRUFFakJoRSxJQUFJLENBQUNnRSxRQUFMLENBQWMsV0FBZCxFQUEyQixHQUEzQixFQUFnQyxDQUFDLFFBQUQsQ0FBaEMsQ0FGaUIsQ0FBWixFQUdKN0IsSUFISSxDQUdDLE1BQU07QUFDWixpQkFBT25DLElBQUksQ0FBQ21ELFlBQUwsQ0FBa0IsV0FBbEIsRUFBK0IsS0FBL0IsRUFBc0MsQ0FBQyxPQUFELENBQXRDLENBQVA7QUFDRCxTQUxNLEVBS0poQixJQUxJLENBS0V6QixRQUFELElBQWM7QUFDcEIwQixVQUFBQSxNQUFNLENBQUMxQixRQUFRLENBQUM2QyxNQUFWLENBQU4sQ0FBd0JoQixFQUF4QixDQUEyQmtCLEtBQTNCLENBQWlDLENBQWpDO0FBQ0FyQixVQUFBQSxNQUFNLENBQUMxQixRQUFRLENBQUMsQ0FBRCxDQUFSLENBQVlFLEtBQWIsQ0FBTixDQUEwQjJCLEVBQTFCLENBQTZCc0IsSUFBN0IsQ0FBa0NKLEtBQWxDLENBQXdDLENBQUMsUUFBRCxDQUF4QztBQUNELFNBUk0sRUFRSnRCLElBUkksQ0FRQyxNQUFNO0FBQ1osaUJBQU9uQyxJQUFJLENBQUNtRCxZQUFMLENBQWtCLFdBQWxCLEVBQStCLEtBQS9CLEVBQXNDLENBQUMsT0FBRCxDQUF0QyxDQUFQO0FBQ0QsU0FWTSxFQVVKaEIsSUFWSSxDQVVFekIsUUFBRCxJQUFjO0FBQ3BCMEIsVUFBQUEsTUFBTSxDQUFDMUIsUUFBUSxDQUFDNkMsTUFBVixDQUFOLENBQXdCaEIsRUFBeEIsQ0FBMkJrQixLQUEzQixDQUFpQyxDQUFqQztBQUNBckIsVUFBQUEsTUFBTSxDQUFDMUIsUUFBUSxDQUFDLENBQUQsQ0FBUixDQUFZRSxLQUFiLENBQU4sQ0FBMEIyQixFQUExQixDQUE2QnNCLElBQTdCLENBQWtDSixLQUFsQyxDQUF3QyxDQUFDLFFBQUQsQ0FBeEM7QUFDRCxTQWJNLENBQVA7QUFjRCxPQWZDLENBQUY7QUFnQkQsS0FoRE8sQ0FBUjtBQWlERCxHQTFRTyxDQUFSO0FBNFFBMUQsRUFBQUEsUUFBUSxDQUFDLFNBQUQsRUFBWSxNQUFNO0FBQ3hCSSxJQUFBQSxVQUFVLENBQUMsTUFBTTtBQUNmSCxNQUFBQSxJQUFJLEdBQUcsSUFBSTRCLFNBQUosQ0FBZSxXQUFmLEVBQTRCM0IsSUFBNUIsRUFBa0M7QUFDdkM0QixRQUFBQSxRQUFRLEVBQVJBLGdCQUR1QztBQUV2Q0MsUUFBQUEsSUFBSSxFQUFFO0FBQ0pDLFVBQUFBLElBQUksRUFBRSxVQURGO0FBRUpDLFVBQUFBLElBQUksRUFBRTtBQUZGLFNBRmlDO0FBTXZDQyxRQUFBQSxrQkFBa0IsRUFBRTtBQU5tQixPQUFsQyxDQUFQO0FBU0EsYUFBT2pDLElBQUksQ0FBQ2tDLE9BQUwsR0FDSkMsSUFESSxDQUNDLE1BQU07QUFDVjtBQUNBbkMsUUFBQUEsSUFBSSxDQUFDcUMsTUFBTCxDQUFZc0QsdUJBQVosR0FBc0MsRUFBdEM7QUFDQTNGLFFBQUFBLElBQUksQ0FBQ3FDLE1BQUwsQ0FBWXVELHVCQUFaLEdBQXNDLENBQXRDOztBQUNBNUYsUUFBQUEsSUFBSSxDQUFDcUMsTUFBTCxDQUFZd0QsTUFBWixDQUFtQkMsTUFBbkIsR0FBNEIsTUFBTSxDQUFHLENBQXJDO0FBQ0QsT0FOSSxDQUFQO0FBT0QsS0FqQlMsQ0FBVjtBQW1CQW5FLElBQUFBLEVBQUUsQ0FBQyxnQkFBRCxFQUFvQnZCLElBQUQsSUFBVTtBQUM3QkosTUFBQUEsSUFBSSxDQUFDK0YsT0FBTCxHQUFlLE1BQU07QUFBRTNGLFFBQUFBLElBQUk7QUFBSSxPQUEvQjs7QUFDQUosTUFBQUEsSUFBSSxDQUFDZ0QsYUFBTCxDQUFtQixPQUFuQixFQUE0QkgsS0FBNUIsQ0FBa0MsTUFBTSxDQUFFLENBQTFDO0FBQ0QsS0FIQyxDQUFGO0FBS0FsQixJQUFBQSxFQUFFLENBQUMsK0NBQUQsRUFBa0QsTUFBTTtBQUN4RCxVQUFJcUUsY0FBYyxHQUFHLENBQXJCO0FBQ0EsYUFBT3pCLE9BQU8sQ0FBQ21CLEdBQVIsQ0FBWSxDQUNqQjFGLElBQUksQ0FBQ2dELGFBQUwsQ0FBbUIsT0FBbkIsRUFDR0gsS0FESCxDQUNTQyxHQUFHLElBQUk7QUFDWlYsUUFBQUEsTUFBTSxDQUFDVSxHQUFELENBQU4sQ0FBWVAsRUFBWixDQUFlUSxLQUFmO0FBQ0FpRCxRQUFBQSxjQUFjO0FBQ2YsT0FKSCxDQURpQixFQU1qQmhHLElBQUksQ0FBQ21ELFlBQUwsQ0FBa0IsT0FBbEIsRUFBMkIsS0FBM0IsRUFBa0MsQ0FBQyxhQUFELENBQWxDLEVBQ0dOLEtBREgsQ0FDU0MsR0FBRyxJQUFJO0FBQ1pWLFFBQUFBLE1BQU0sQ0FBQ1UsR0FBRCxDQUFOLENBQVlQLEVBQVosQ0FBZVEsS0FBZjtBQUNBaUQsUUFBQUEsY0FBYztBQUNmLE9BSkgsQ0FOaUIsQ0FBWixFQVlKN0QsSUFaSSxDQVlDLE1BQU07QUFDWkMsUUFBQUEsTUFBTSxDQUFDNEQsY0FBRCxDQUFOLENBQXVCekQsRUFBdkIsQ0FBMEJrQixLQUExQixDQUFnQyxDQUFoQztBQUNELE9BZE0sQ0FBUDtBQWVELEtBakJDLENBQUY7QUFrQkQsR0EzQ08sQ0FBUjtBQTRDRCxDQXBkTyxDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLWV4cHJlc3Npb25zICovXG5cbmltcG9ydCBob29kaWVjcm93IGZyb20gJ2hvb2RpZWNyb3ctaW1hcCdcbmltcG9ydCBJbWFwQ2xpZW50LCB7IExPR19MRVZFTF9OT05FIGFzIGxvZ0xldmVsIH0gZnJvbSAnLi4nXG5pbXBvcnQgeyBwYXJzZVNFQVJDSCB9IGZyb20gJy4vY29tbWFuZC1wYXJzZXInXG5pbXBvcnQgeyBidWlsZFNFQVJDSENvbW1hbmQgfSBmcm9tICcuL2NvbW1hbmQtYnVpbGRlcidcblxucHJvY2Vzcy5lbnYuTk9ERV9UTFNfUkVKRUNUX1VOQVVUSE9SSVpFRCA9ICcwJ1xuXG5kZXNjcmliZSgnYnJvd3NlcmJveCBpbnRlZ3JhdGlvbiB0ZXN0cycsICgpID0+IHtcbiAgbGV0IGltYXBcbiAgY29uc3QgcG9ydCA9IDEwMDAwXG4gIGxldCBzZXJ2ZXJcblxuICBiZWZvcmVFYWNoKChkb25lKSA9PiB7XG4gICAgLy8gc3RhcnQgaW1hcCB0ZXN0IHNlcnZlclxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgLy8gZGVidWc6IHRydWUsXG4gICAgICBwbHVnaW5zOiBbJ1NUQVJUVExTJywgJ1gtR00tRVhULTEnXSxcbiAgICAgIHNlY3VyZUNvbm5lY3Rpb246IGZhbHNlLFxuICAgICAgc3RvcmFnZToge1xuICAgICAgICBJTkJPWDoge1xuICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICB7IHJhdzogJ1N1YmplY3Q6IGhlbGxvIDFcXHJcXG5cXHJcXG5Xb3JsZCAxIScgfSxcbiAgICAgICAgICAgIHsgcmF3OiAnU3ViamVjdDogaGVsbG8gMlxcclxcblxcclxcbldvcmxkIDIhJywgZmxhZ3M6IFsnXFxcXFNlZW4nXSB9LFxuICAgICAgICAgICAgeyByYXc6ICdTdWJqZWN0OiBoZWxsbyAzXFxyXFxuXFxyXFxuV29ybGQgMyEnLCB1aWQ6IDU1NSB9LFxuICAgICAgICAgICAgeyByYXc6ICdGcm9tOiBzZW5kZXIgbmFtZSA8c2VuZGVyQGV4YW1wbGUuY29tPlxcclxcblRvOiBSZWNlaXZlciBuYW1lIDxyZWNlaXZlckBleGFtcGxlLmNvbT5cXHJcXG5TdWJqZWN0OiBoZWxsbyA0XFxyXFxuTWVzc2FnZS1JZDogPGFiY2RlPlxcclxcbkRhdGU6IEZyaSwgMTMgU2VwIDIwMTMgMTU6MDE6MDAgKzAzMDBcXHJcXG5cXHJcXG5Xb3JsZCA0IScgfSxcbiAgICAgICAgICAgIHsgcmF3OiAnU3ViamVjdDogaGVsbG8gNVxcclxcblxcclxcbldvcmxkIDUhJywgZmxhZ3M6IFsnJE15RmxhZycsICdcXFxcRGVsZXRlZCddLCB1aWQ6IDU1NyB9LFxuICAgICAgICAgICAgeyByYXc6ICdTdWJqZWN0OiBoZWxsbyA2XFxyXFxuXFxyXFxuV29ybGQgNiEnIH0sXG4gICAgICAgICAgICB7IHJhdzogJ1N1YmplY3Q6IGhlbGxvIDdcXHJcXG5cXHJcXG5Xb3JsZCA3IScsIHVpZDogNjAwIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgICcnOiB7XG4gICAgICAgICAgc2VwYXJhdG9yOiAnLycsXG4gICAgICAgICAgZm9sZGVyczoge1xuICAgICAgICAgICAgJ1tHbWFpbF0nOiB7XG4gICAgICAgICAgICAgIGZsYWdzOiBbJ1xcXFxOb3NlbGVjdCddLFxuICAgICAgICAgICAgICBmb2xkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0FsbCBNYWlsJzogeyAnc3BlY2lhbC11c2UnOiAnXFxcXEFsbCcgfSxcbiAgICAgICAgICAgICAgICBEcmFmdHM6IHsgJ3NwZWNpYWwtdXNlJzogJ1xcXFxEcmFmdHMnIH0sXG4gICAgICAgICAgICAgICAgSW1wb3J0YW50OiB7ICdzcGVjaWFsLXVzZSc6ICdcXFxcSW1wb3J0YW50JyB9LFxuICAgICAgICAgICAgICAgICdTZW50IE1haWwnOiB7ICdzcGVjaWFsLXVzZSc6ICdcXFxcU2VudCcgfSxcbiAgICAgICAgICAgICAgICBTcGFtOiB7ICdzcGVjaWFsLXVzZSc6ICdcXFxcSnVuaycgfSxcbiAgICAgICAgICAgICAgICBTdGFycmVkOiB7ICdzcGVjaWFsLXVzZSc6ICdcXFxcRmxhZ2dlZCcgfSxcbiAgICAgICAgICAgICAgICBUcmFzaDogeyAnc3BlY2lhbC11c2UnOiAnXFxcXFRyYXNoJyB9LFxuICAgICAgICAgICAgICAgIEE6IHsgbWVzc2FnZXM6IFt7fV0gfSxcbiAgICAgICAgICAgICAgICBCOiB7IG1lc3NhZ2VzOiBbe31dIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlcnZlciA9IGhvb2RpZWNyb3cob3B0aW9ucylcbiAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsIGRvbmUpXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKChkb25lKSA9PiB7XG4gICAgc2VydmVyLmNsb3NlKGRvbmUpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ0Nvbm5lY3Rpb24gdGVzdHMnLCAoKSA9PiB7XG4gICAgdmFyIGluc2VjdXJlU2VydmVyXG5cbiAgICBiZWZvcmVFYWNoKChkb25lKSA9PiB7XG4gICAgICAvLyBzdGFydCBpbWFwIHRlc3Qgc2VydmVyXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgLy8gZGVidWc6IHRydWUsXG4gICAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgICBzZWN1cmVDb25uZWN0aW9uOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpbnNlY3VyZVNlcnZlciA9IGhvb2RpZWNyb3cob3B0aW9ucylcbiAgICAgIGluc2VjdXJlU2VydmVyLmxpc3Rlbihwb3J0ICsgMiwgZG9uZSlcbiAgICB9KVxuXG4gICAgYWZ0ZXJFYWNoKChkb25lKSA9PiB7XG4gICAgICBpbnNlY3VyZVNlcnZlci5jbG9zZShkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHVzZSBTVEFSVFRMUyBieSBkZWZhdWx0JywgKCkgPT4ge1xuICAgICAgaW1hcCA9IG5ldyBJbWFwQ2xpZW50KCcxMjcuMC4wLjEnLCBwb3J0LCB7XG4gICAgICAgIGxvZ0xldmVsLFxuICAgICAgICBhdXRoOiB7XG4gICAgICAgICAgdXNlcjogJ3Rlc3R1c2VyJyxcbiAgICAgICAgICBwYXNzOiAndGVzdHBhc3MnXG4gICAgICAgIH0sXG4gICAgICAgIHVzZVNlY3VyZVRyYW5zcG9ydDogZmFsc2VcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBpbWFwLmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGltYXAuY2xpZW50LnNlY3VyZU1vZGUpLnRvLmJlLnRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5jbG9zZSgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGlnbm9yZSBTVEFSVFRMUycsICgpID0+IHtcbiAgICAgIGltYXAgPSBuZXcgSW1hcENsaWVudCgnMTI3LjAuMC4xJywgcG9ydCwge1xuICAgICAgICBsb2dMZXZlbCxcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXI6ICd0ZXN0dXNlcicsXG4gICAgICAgICAgcGFzczogJ3Rlc3RwYXNzJ1xuICAgICAgICB9LFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlLFxuICAgICAgICBpZ25vcmVUTFM6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBpbWFwLmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGltYXAuY2xpZW50LnNlY3VyZU1vZGUpLnRvLmJlLmZhbHNlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuY2xvc2UoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBmYWlsIGNvbm5lY3RpbmcgdG8gbm9uLVNUQVJUVExTIGhvc3QnLCAoKSA9PiB7XG4gICAgICBpbWFwID0gbmV3IEltYXBDbGllbnQoJzEyNy4wLjAuMScsIHBvcnQgKyAyLCB7XG4gICAgICAgIGxvZ0xldmVsLFxuICAgICAgICBhdXRoOiB7XG4gICAgICAgICAgdXNlcjogJ3Rlc3R1c2VyJyxcbiAgICAgICAgICBwYXNzOiAndGVzdHBhc3MnXG4gICAgICAgIH0sXG4gICAgICAgIHVzZVNlY3VyZVRyYW5zcG9ydDogZmFsc2UsXG4gICAgICAgIHJlcXVpcmVUTFM6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBpbWFwLmNvbm5lY3QoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNvbm5lY3QgdG8gbm9uIHNlY3VyZSBob3N0JywgKCkgPT4ge1xuICAgICAgaW1hcCA9IG5ldyBJbWFwQ2xpZW50KCcxMjcuMC4wLjEnLCBwb3J0ICsgMiwge1xuICAgICAgICBsb2dMZXZlbCxcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXI6ICd0ZXN0dXNlcicsXG4gICAgICAgICAgcGFzczogJ3Rlc3RwYXNzJ1xuICAgICAgICB9LFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gaW1hcC5jb25uZWN0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpbWFwLmNsaWVudC5zZWN1cmVNb2RlKS50by5iZS5mYWxzZVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLmNsb3NlKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZmFpbCBhdXRoZW50aWNhdGlvbicsIChkb25lKSA9PiB7XG4gICAgICBpbWFwID0gbmV3IEltYXBDbGllbnQoJzEyNy4wLjAuMScsIHBvcnQgKyAyLCB7XG4gICAgICAgIGxvZ0xldmVsLFxuICAgICAgICBhdXRoOiB7XG4gICAgICAgICAgdXNlcjogJ2ludmFsaWQnLFxuICAgICAgICAgIHBhc3M6ICdpbnZhbGlkJ1xuICAgICAgICB9LFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICBpbWFwLmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGltYXAuY2xpZW50LnNlY3VyZU1vZGUpLnRvLmJlLmZhbHNlXG4gICAgICB9KS5jYXRjaCgoKSA9PiB7IGRvbmUoKSB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ1Bvc3QgbG9naW4gdGVzdHMnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbWFwID0gbmV3IEltYXBDbGllbnQoJzEyNy4wLjAuMScsIHBvcnQsIHtcbiAgICAgICAgbG9nTGV2ZWwsXG4gICAgICAgIGF1dGg6IHtcbiAgICAgICAgICB1c2VyOiAndGVzdHVzZXInLFxuICAgICAgICAgIHBhc3M6ICd0ZXN0cGFzcydcbiAgICAgICAgfSxcbiAgICAgICAgdXNlU2VjdXJlVHJhbnNwb3J0OiBmYWxzZVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGltYXAuY29ubmVjdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5zZWxlY3RNYWlsYm94KCdbR21haWxdL1NwYW0nKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgIHJldHVybiBpbWFwLmNsb3NlKClcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJyNsaXN0TWFpbGJveGVzJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCBzdWNjZWVkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5saXN0TWFpbGJveGVzKCkudGhlbigobWFpbGJveGVzKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1haWxib3hlcykudG8uZXhpc3RcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCcjbGlzdE1lc3NhZ2VzJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCBzdWNjZWVkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5saXN0TWVzc2FnZXMoJ2luYm94JywgJzE6KicsIFsndWlkJywgJ2ZsYWdzJywgJ2VudmVsb3BlJywgJ2JvZHlzdHJ1Y3R1cmUnLCAnYm9keS5wZWVrW10nXSkudGhlbigobWVzc2FnZXMpID0+IHtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMpLnRvLm5vdC5iZS5lbXB0eVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJyN1cGxvYWQnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIHN1Y2NlZWQnLCAoKSA9PiB7XG4gICAgICAgIHZhciBtc2dDb3VudFxuXG4gICAgICAgIHJldHVybiBpbWFwLmxpc3RNZXNzYWdlcygnaW5ib3gnLCAnMToqJywgWyd1aWQnLCAnZmxhZ3MnLCAnZW52ZWxvcGUnLCAnYm9keXN0cnVjdHVyZSddKS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcykudG8ubm90LmJlLmVtcHR5XG4gICAgICAgICAgbXNnQ291bnQgPSBtZXNzYWdlcy5sZW5ndGhcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGltYXAudXBsb2FkKCdpbmJveCcsICdNSU1FLVZlcnNpb246IDEuMFxcclxcbkRhdGU6IFdlZCwgOSBKdWwgMjAxNCAxNTowNzo0NyArMDIwMFxcclxcbkRlbGl2ZXJlZC1UbzogdGVzdEB0ZXN0LmNvbVxcclxcbk1lc3NhZ2UtSUQ6IDxDQUhmdFlZUW89NWZxYnRudi1EYXpYaEwyajVBeFZQMW5XYXJqa3p0bi1OOVNWOTFaMndAbWFpbC5nbWFpbC5jb20+XFxyXFxuU3ViamVjdDogdGVzdFxcclxcbkZyb206IFRlc3QgVGVzdCA8dGVzdEB0ZXN0LmNvbT5cXHJcXG5UbzogVGVzdCBUZXN0IDx0ZXN0QHRlc3QuY29tPlxcclxcbkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD1VVEYtOFxcclxcblxcclxcbnRlc3QnLCB7XG4gICAgICAgICAgICBmbGFnczogWydcXFxcU2VlbicsICdcXFxcQW5zd2VyZWQnLCAnXFxcXCRNeUZsYWcnXVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBpbWFwLmxpc3RNZXNzYWdlcygnaW5ib3gnLCAnMToqJywgWyd1aWQnLCAnZmxhZ3MnLCAnZW52ZWxvcGUnLCAnYm9keXN0cnVjdHVyZSddKVxuICAgICAgICB9KS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvLmVxdWFsKG1zZ0NvdW50ICsgMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCcjc2VhcmNoJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gYSBzZXF1ZW5jZSBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLnNlYXJjaCgnaW5ib3gnLCB7XG4gICAgICAgICAgaGVhZGVyOiBbJ3N1YmplY3QnLCAnaGVsbG8gMyddXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZXN1bHQpLnRvLmRlZXAuZXF1YWwoWzNdKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gYW4gdWlkJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5zZWFyY2goJ2luYm94Jywge1xuICAgICAgICAgIGhlYWRlcjogWydzdWJqZWN0JywgJ2hlbGxvIDMnXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbNTU1XSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgd29yayB3aXRoIGNvbXBsZXggcXVlcmllcycsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc2VhcmNoKCdpbmJveCcsIHtcbiAgICAgICAgICBoZWFkZXI6IFsnc3ViamVjdCcsICdoZWxsbyddLFxuICAgICAgICAgIHNlZW46IHRydWVcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbMl0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnI3NldEZsYWdzJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCBzZXQgZmxhZ3MgZm9yIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc2V0RmxhZ3MoJ2luYm94JywgJzEnLCBbJ1xcXFxTZWVuJywgJyRNeUZsYWcnXSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbe1xuICAgICAgICAgICAgJyMnOiAxLFxuICAgICAgICAgICAgZmxhZ3M6IFsnXFxcXFNlZW4nLCAnJE15RmxhZyddXG4gICAgICAgICAgfV0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIGFkZCBmbGFncyB0byBhIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLnNldEZsYWdzKCdpbmJveCcsICcyJywge1xuICAgICAgICAgIGFkZDogWyckTXlGbGFnJ11cbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbe1xuICAgICAgICAgICAgJyMnOiAyLFxuICAgICAgICAgICAgZmxhZ3M6IFsnXFxcXFNlZW4nLCAnJE15RmxhZyddXG4gICAgICAgICAgfV0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIHJlbW92ZSBmbGFncyBmcm9tIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc2V0RmxhZ3MoJ2luYm94JywgJzU1NycsIHtcbiAgICAgICAgICByZW1vdmU6IFsnXFxcXERlbGV0ZWQnXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbe1xuICAgICAgICAgICAgJyMnOiA1LFxuICAgICAgICAgICAgZmxhZ3M6IFsnJE15RmxhZyddLFxuICAgICAgICAgICAgdWlkOiA1NTdcbiAgICAgICAgICB9XSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgbm90IHJldHVybiBhbnl0aGluZyBvbiBzaWxlbnQgbW9kZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc2V0RmxhZ3MoJ2luYm94JywgJzEnLCBbJyRNeUZsYWcyJ10sIHtcbiAgICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbXSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCcjc3RvcmUnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIGFkZCBsYWJlbHMgZm9yIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc3RvcmUoJ2luYm94JywgJzEnLCAnK1gtR00tTEFCRUxTJywgWydcXFxcU2VudCcsICdcXFxcSnVuayddKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVzdWx0KS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgICAgICAnIyc6IDEsXG4gICAgICAgICAgICAneC1nbS1sYWJlbHMnOiBbJ1xcXFxJbmJveCcsICdcXFxcU2VudCcsICdcXFxcSnVuayddXG4gICAgICAgICAgfV0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIHNldCBsYWJlbHMgZm9yIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc3RvcmUoJ2luYm94JywgJzEnLCAnWC1HTS1MQUJFTFMnLCBbJ1xcXFxTZW50JywgJ1xcXFxKdW5rJ10pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZXN1bHQpLnRvLmRlZXAuZXF1YWwoW3tcbiAgICAgICAgICAgICcjJzogMSxcbiAgICAgICAgICAgICd4LWdtLWxhYmVscyc6IFsnXFxcXFNlbnQnLCAnXFxcXEp1bmsnXVxuICAgICAgICAgIH1dKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3Nob3VsZCByZW1vdmUgbGFiZWxzIGZyb20gYSBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5zdG9yZSgnaW5ib3gnLCAnMScsICctWC1HTS1MQUJFTFMnLCBbJ1xcXFxTZW50JywgJ1xcXFxJbmJveCddKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVzdWx0KS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgICAgICAnIyc6IDEsXG4gICAgICAgICAgICAneC1nbS1sYWJlbHMnOiBbXVxuICAgICAgICAgIH1dKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJyNkZWxldGVNZXNzYWdlcycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgZGVsZXRlIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgdmFyIGluaXRpYWxJbmZvXG5cbiAgICAgICAgdmFyIGV4cHVuZ2VOb3RpZmllZCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBpbWFwLm9udXBkYXRlID0gZnVuY3Rpb24gKG1iLCB0eXBlIC8qLCBkYXRhICovKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBleHBlY3QobWIpLnRvLmVxdWFsKCdpbmJveCcpXG4gICAgICAgICAgICAgIGV4cGVjdCh0eXBlKS50by5lcXVhbCgnZXhwdW5nZScpXG4gICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBpbWFwLnNlbGVjdE1haWxib3goJ2luYm94JykudGhlbigoaW5mbykgPT4ge1xuICAgICAgICAgIGluaXRpYWxJbmZvID0gaW5mb1xuICAgICAgICAgIHJldHVybiBpbWFwLmRlbGV0ZU1lc3NhZ2VzKCdpbmJveCcsIDU1Nywge1xuICAgICAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gaW1hcC5zZWxlY3RNYWlsYm94KCdpbmJveCcpXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdEluZm8pID0+IHtcbiAgICAgICAgICBleHBlY3QoaW5pdGlhbEluZm8uZXhpc3RzIC0gMSA9PT0gcmVzdWx0SW5mby5leGlzdHMpLnRvLmJlLnRydWVcbiAgICAgICAgfSkudGhlbigoKSA9PiBleHB1bmdlTm90aWZpZWQpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnI2NvcHlNZXNzYWdlcycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgY29weSBhIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLmNvcHlNZXNzYWdlcygnaW5ib3gnLCA1NTUsICdbR21haWxdL1RyYXNoJywge1xuICAgICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBpbWFwLnNlbGVjdE1haWxib3goJ1tHbWFpbF0vVHJhc2gnKVxuICAgICAgICB9KS50aGVuKChpbmZvKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGluZm8uZXhpc3RzKS50by5lcXVhbCgxKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJyNtb3ZlTWVzc2FnZXMnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIG1vdmUgYSBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgICB2YXIgaW5pdGlhbEluZm9cbiAgICAgICAgcmV0dXJuIGltYXAuc2VsZWN0TWFpbGJveCgnaW5ib3gnKS50aGVuKChpbmZvKSA9PiB7XG4gICAgICAgICAgaW5pdGlhbEluZm8gPSBpbmZvXG4gICAgICAgICAgcmV0dXJuIGltYXAubW92ZU1lc3NhZ2VzKCdpbmJveCcsIDU1NSwgJ1tHbWFpbF0vU3BhbScsIHtcbiAgICAgICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGltYXAuc2VsZWN0TWFpbGJveCgnW0dtYWlsXS9TcGFtJylcbiAgICAgICAgfSkudGhlbigoaW5mbykgPT4ge1xuICAgICAgICAgIGV4cGVjdChpbmZvLmV4aXN0cykudG8uZXF1YWwoMSlcbiAgICAgICAgICByZXR1cm4gaW1hcC5zZWxlY3RNYWlsYm94KCdpbmJveCcpXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdEluZm8pID0+IHtcbiAgICAgICAgICBleHBlY3QoaW5pdGlhbEluZm8uZXhpc3RzKS50by5ub3QuZXF1YWwocmVzdWx0SW5mby5leGlzdHMpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgncHJlY2hlY2snLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIGhhbmRsZSBwcmVjaGVjayBlcnJvciBjb3JyZWN0bHknLCAoKSA9PiB7XG4gICAgICAgIC8vIHNpbXVsYXRlcyBhIGJyb2tlbiBzZWFyY2ggY29tbWFuZFxuICAgICAgICB2YXIgc2VhcmNoID0gKHF1ZXJ5LCBvcHRpb25zID0ge30pID0+IHtcbiAgICAgICAgICB2YXIgY29tbWFuZCA9IGJ1aWxkU0VBUkNIQ29tbWFuZChxdWVyeSwgb3B0aW9ucylcbiAgICAgICAgICByZXR1cm4gaW1hcC5leGVjKGNvbW1hbmQsICdTRUFSQ0gnLCB7XG4gICAgICAgICAgICBwcmVjaGVjazogKCkgPT4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdGT08nKSlcbiAgICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4gcGFyc2VTRUFSQ0gocmVzcG9uc2UpKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGltYXAuc2VsZWN0TWFpbGJveCgnaW5ib3gnKVxuICAgICAgICAgIC50aGVuKCgpID0+IHNlYXJjaCh7IGhlYWRlcjogWydzdWJqZWN0JywgJ2hlbGxvIDMnXSB9KSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGVyci5tZXNzYWdlKS50by5lcXVhbCgnRk9PJylcbiAgICAgICAgICAgIHJldHVybiBpbWFwLnNlbGVjdE1haWxib3goJ1tHbWFpbF0vU3BhbScpXG4gICAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgc2VsZWN0IGNvcnJlY3QgbWFpbGJveGVzIGluIHByZWNoZWNrcyBvbiBjb25jdXJyZW50IGNhbGxzJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5zZWxlY3RNYWlsYm94KCdbR21haWxdL0EnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgaW1hcC5zZWxlY3RNYWlsYm94KCdbR21haWxdL0InKSxcbiAgICAgICAgICAgIGltYXAuc2V0RmxhZ3MoJ1tHbWFpbF0vQScsICcxJywgWydcXFxcU2VlbiddKVxuICAgICAgICAgIF0pXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBpbWFwLmxpc3RNZXNzYWdlcygnW0dtYWlsXS9BJywgJzE6MScsIFsnZmxhZ3MnXSlcbiAgICAgICAgfSkudGhlbigobWVzc2FnZXMpID0+IHtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50by5lcXVhbCgxKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5mbGFncykudG8uZGVlcC5lcXVhbChbJ1xcXFxTZWVuJ10pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIHNlbmQgcHJlY2hlY2sgY29tbWFuZHMgaW4gY29ycmVjdCBvcmRlciBvbiBjb25jdXJyZW50IGNhbGxzJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIGltYXAuc2V0RmxhZ3MoJ1tHbWFpbF0vQScsICcxJywgWydcXFxcU2VlbiddKSxcbiAgICAgICAgICBpbWFwLnNldEZsYWdzKCdbR21haWxdL0InLCAnMScsIFsnXFxcXFNlZW4nXSlcbiAgICAgICAgXSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGltYXAubGlzdE1lc3NhZ2VzKCdbR21haWxdL0EnLCAnMToxJywgWydmbGFncyddKVxuICAgICAgICB9KS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvLmVxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmZsYWdzKS50by5kZWVwLmVxdWFsKFsnXFxcXFNlZW4nXSlcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGltYXAubGlzdE1lc3NhZ2VzKCdbR21haWxdL0InLCAnMToxJywgWydmbGFncyddKVxuICAgICAgICB9KS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvLmVxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmZsYWdzKS50by5kZWVwLmVxdWFsKFsnXFxcXFNlZW4nXSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnVGltZW91dCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGltYXAgPSBuZXcgSW1hcENsaWVudCgnMTI3LjAuMC4xJywgcG9ydCwge1xuICAgICAgICBsb2dMZXZlbCxcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXI6ICd0ZXN0dXNlcicsXG4gICAgICAgICAgcGFzczogJ3Rlc3RwYXNzJ1xuICAgICAgICB9LFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gaW1hcC5jb25uZWN0KClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIC8vIHJlbW92ZSB0aGUgb25kYXRhIGV2ZW50IHRvIHNpbXVsYXRlIDEwMCUgcGFja2V0IGxvc3MgYW5kIG1ha2UgdGhlIHNvY2tldCB0aW1lIG91dCBhZnRlciAxMG1zXG4gICAgICAgICAgaW1hcC5jbGllbnQudGltZW91dFNvY2tldExvd2VyQm91bmQgPSAxMFxuICAgICAgICAgIGltYXAuY2xpZW50LnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyID0gMFxuICAgICAgICAgIGltYXAuY2xpZW50LnNvY2tldC5vbmRhdGEgPSAoKSA9PiB7IH1cbiAgICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCB0aW1lb3V0JywgKGRvbmUpID0+IHtcbiAgICAgIGltYXAub25lcnJvciA9ICgpID0+IHsgZG9uZSgpIH1cbiAgICAgIGltYXAuc2VsZWN0TWFpbGJveCgnaW5ib3gnKS5jYXRjaCgoKSA9PiB7fSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZWplY3QgYWxsIHBlbmRpbmcgY29tbWFuZHMgb24gdGltZW91dCcsICgpID0+IHtcbiAgICAgIGxldCByZWplY3Rpb25Db3VudCA9IDBcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgIGltYXAuc2VsZWN0TWFpbGJveCgnSU5CT1gnKVxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGVycikudG8uZXhpc3RcbiAgICAgICAgICAgIHJlamVjdGlvbkNvdW50KytcbiAgICAgICAgICB9KSxcbiAgICAgICAgaW1hcC5saXN0TWVzc2FnZXMoJ0lOQk9YJywgJzE6KicsIFsnYm9keS5wZWVrW10nXSlcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG4gICAgICAgICAgICByZWplY3Rpb25Db3VudCsrXG4gICAgICAgICAgfSlcblxuICAgICAgXSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZWplY3Rpb25Db3VudCkudG8uZXF1YWwoMilcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=