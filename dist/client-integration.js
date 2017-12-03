'use strict';

var _hoodiecrowImap = require('hoodiecrow-imap');

var _hoodiecrowImap2 = _interopRequireDefault(_hoodiecrowImap);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-unused-expressions */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('browserbox integration tests', function () {
  var imap = void 0;
  var port = 10000;
  var server = void 0;

  beforeEach(function (done) {
    // start imap test server
    var options = {
      // debug: true,
      plugins: ['STARTTLS', 'X-GM-EXT-1'],
      secureConnection: false,
      storage: {
        'INBOX': {
          messages: [{ raw: 'Subject: hello 1\r\n\r\nWorld 1!' }, { raw: 'Subject: hello 2\r\n\r\nWorld 2!', flags: ['\\Seen'] }, { raw: 'Subject: hello 3\r\n\r\nWorld 3!', uid: 555 }, { raw: 'From: sender name <sender@example.com>\r\nTo: Receiver name <receiver@example.com>\r\nSubject: hello 4\r\nMessage-Id: <abcde>\r\nDate: Fri, 13 Sep 2013 15:01:00 +0300\r\n\r\nWorld 4!' }, { raw: 'Subject: hello 5\r\n\r\nWorld 5!', flags: ['$MyFlag', '\\Deleted'], uid: 557 }, { raw: 'Subject: hello 6\r\n\r\nWorld 6!' }, { raw: 'Subject: hello 7\r\n\r\nWorld 7!', uid: 600 }]
        },
        '': {
          'separator': '/',
          'folders': {
            '[Gmail]': {
              'flags': ['\\Noselect'],
              'folders': {
                'All Mail': { 'special-use': '\\All' },
                'Drafts': { 'special-use': '\\Drafts' },
                'Important': { 'special-use': '\\Important' },
                'Sent Mail': { 'special-use': '\\Sent' },
                'Spam': { 'special-use': '\\Junk' },
                'Starred': { 'special-use': '\\Flagged' },
                'Trash': { 'special-use': '\\Trash' },
                'A': { messages: [{}] },
                'B': { messages: [{}] }
              }
            }
          }
        }
      }
    };

    server = (0, _hoodiecrowImap2.default)(options);
    server.listen(port, done);
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('Connection tests', function () {
    var insecureServer;

    beforeEach(function (done) {
      // start imap test server
      var options = {
        // debug: true,
        plugins: [],
        secureConnection: false
      };

      insecureServer = (0, _hoodiecrowImap2.default)(options);
      insecureServer.listen(port + 2, done);
    });

    afterEach(function (done) {
      insecureServer.close(done);
    });

    it('should use STARTTLS by default', function (done) {
      imap = new _client2.default('127.0.0.1', port, {
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      imap.logLevel = imap.LOG_LEVEL_NONE;

      imap.connect().then(function () {
        expect(imap.client.secureMode).to.be.true;
      }).then(function () {
        return imap.close();
      }).then(function () {
        return done();
      }).catch(done);
    });

    it('should ignore STARTTLS', function () {
      imap = new _client2.default('127.0.0.1', port, {
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false,
        ignoreTLS: true
      });
      imap.logLevel = imap.LOG_LEVEL_NONE;

      return imap.connect().then(function () {
        expect(imap.client.secureMode).to.be.false;
      }).then(function () {
        return imap.close();
      });
    });

    it('should fail connecting to non-STARTTLS host', function (done) {
      imap = new _client2.default('127.0.0.1', port + 2, {
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false,
        requireTLS: true
      });
      imap.logLevel = imap.LOG_LEVEL_NONE;

      imap.connect().catch(function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should connect to non secure host', function () {
      imap = new _client2.default('127.0.0.1', port + 2, {
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      imap.logLevel = imap.LOG_LEVEL_NONE;

      return imap.connect().then(function () {
        expect(imap.client.secureMode).to.be.false;
      }).then(function () {
        return imap.close();
      });
    });
  });

  describe('Post login tests', function () {
    beforeEach(function () {
      imap = new _client2.default('127.0.0.1', port, {
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      imap.logLevel = imap.LOG_LEVEL_NONE;

      return imap.connect().then(function () {
        return imap.selectMailbox('[Gmail]/Spam');
      });
    });

    afterEach(function () {
      return imap.close();
    });

    describe('#listMailboxes', function () {
      it('should succeed', function () {
        return imap.listMailboxes().then(function (mailboxes) {
          expect(mailboxes).to.exist;
        });
      });
    });

    describe('#listMessages', function () {
      it('should succeed', function () {
        return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure', 'body.peek[]']).then(function (messages) {
          expect(messages).to.not.be.empty;
        });
      });
    });

    describe('#upload', function () {
      it('should succeed', function () {
        var msgCount;

        return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure']).then(function (messages) {
          expect(messages).to.not.be.empty;
          msgCount = messages.length;
        }).then(function () {
          return imap.upload('inbox', 'MIME-Version: 1.0\r\nDate: Wed, 9 Jul 2014 15:07:47 +0200\r\nDelivered-To: test@test.com\r\nMessage-ID: <CAHftYYQo=5fqbtnv-DazXhL2j5AxVP1nWarjkztn-N9SV91Z2w@mail.gmail.com>\r\nSubject: test\r\nFrom: Test Test <test@test.com>\r\nTo: Test Test <test@test.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\ntest', {
            flags: ['\\Seen', '\\Answered', '\\$MyFlag']
          });
        }).then(function () {
          return imap.listMessages('inbox', '1:*', ['uid', 'flags', 'envelope', 'bodystructure']);
        }).then(function (messages) {
          expect(messages.length).to.equal(msgCount + 1);
        });
      });
    });

    describe('#search', function () {
      it('should return a sequence number', function () {
        return imap.search('inbox', {
          header: ['subject', 'hello 3']
        }).then(function (result) {
          expect(result).to.deep.equal([3]);
        });
      });

      it('should return an uid', function () {
        return imap.search('inbox', {
          header: ['subject', 'hello 3']
        }, {
          byUid: true
        }).then(function (result) {
          expect(result).to.deep.equal([555]);
        });
      });

      it('should work with complex queries', function () {
        return imap.search('inbox', {
          header: ['subject', 'hello'],
          seen: true
        }).then(function (result) {
          expect(result).to.deep.equal([2]);
        });
      });
    });

    describe('#setFlags', function () {
      it('should set flags for a message', function () {
        return imap.setFlags('inbox', '1', ['\\Seen', '$MyFlag']).then(function (result) {
          expect(result).to.deep.equal([{
            '#': 1,
            'flags': ['\\Seen', '$MyFlag']
          }]);
        });
      });

      it('should add flags to a message', function () {
        return imap.setFlags('inbox', '2', {
          add: ['$MyFlag']
        }).then(function (result) {
          expect(result).to.deep.equal([{
            '#': 2,
            'flags': ['\\Seen', '$MyFlag']
          }]);
        });
      });

      it('should remove flags from a message', function () {
        return imap.setFlags('inbox', '557', {
          remove: ['\\Deleted']
        }, {
          byUid: true
        }).then(function (result) {
          expect(result).to.deep.equal([{
            '#': 5,
            'flags': ['$MyFlag'],
            'uid': 557
          }]);
        });
      });

      it('should not return anything on silent mode', function () {
        return imap.setFlags('inbox', '1', ['$MyFlag2'], {
          silent: true
        }).then(function (result) {
          expect(result).to.deep.equal([]);
        });
      });
    });

    describe('#store', function () {
      it('should add labels for a message', function () {
        return imap.store('inbox', '1', '+X-GM-LABELS', ['\\Sent', '\\Junk']).then(function (result) {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': ['\\Inbox', '\\Sent', '\\Junk']
          }]);
        });
      });

      it('should set labels for a message', function () {
        return imap.store('inbox', '1', 'X-GM-LABELS', ['\\Sent', '\\Junk']).then(function (result) {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': ['\\Sent', '\\Junk']
          }]);
        });
      });

      it('should remove labels from a message', function () {
        return imap.store('inbox', '1', '-X-GM-LABELS', ['\\Sent', '\\Inbox']).then(function (result) {
          expect(result).to.deep.equal([{
            '#': 1,
            'x-gm-labels': []
          }]);
        });
      });
    });

    describe('#deleteMessages', function () {
      it('should delete a message', function () {
        var initialInfo;

        var expungeNotified = new Promise(function (resolve, reject) {
          imap.onupdate = function (mb, type /*, data */) {
            try {
              expect(mb).to.equal('inbox');
              expect(type).to.equal('expunge');
              resolve();
            } catch (err) {
              reject(err);
            }
          };
        });

        return imap.selectMailbox('inbox').then(function (info) {
          initialInfo = info;
          return imap.deleteMessages('inbox', 557, {
            byUid: true
          });
        }).then(function () {
          return imap.selectMailbox('inbox');
        }).then(function (resultInfo) {
          expect(initialInfo.exists - 1 === resultInfo.exists).to.be.true;
        }).then(function () {
          return expungeNotified;
        });
      });
    });

    describe('#copyMessages', function () {
      it('should copy a message', function () {
        return imap.copyMessages('inbox', 555, '[Gmail]/Trash', {
          byUid: true
        }).then(function () {
          return imap.selectMailbox('[Gmail]/Trash');
        }).then(function (info) {
          expect(info.exists).to.equal(1);
        });
      });
    });

    describe('#moveMessages', function () {
      it('should move a message', function () {
        var initialInfo;
        return imap.selectMailbox('inbox').then(function (info) {
          initialInfo = info;
          return imap.moveMessages('inbox', 555, '[Gmail]/Spam', {
            byUid: true
          });
        }).then(function () {
          return imap.selectMailbox('[Gmail]/Spam');
        }).then(function (info) {
          expect(info.exists).to.equal(1);
          return imap.selectMailbox('inbox');
        }).then(function (resultInfo) {
          expect(initialInfo.exists).to.not.equal(resultInfo.exists);
        });
      });
    });

    describe('precheck', function () {
      it('should handle precheck error correctly', function (done) {
        // simulates a broken search command
        var search = function search(query, options) {
          var command = imap._buildSEARCHCommand(query, options);
          return imap.exec(command, 'SEARCH', {
            precheck: function precheck() {
              return Promise.reject(new Error('FOO'));
            }
          }).then(function (response) {
            return imap._parseSEARCH(response);
          });
        };

        imap.selectMailbox('inbox').then(function () {
          return search({
            header: ['subject', 'hello 3']
          }, {});
        }).catch(function (err) {
          expect(err.message).to.equal('FOO');
          return imap.selectMailbox('[Gmail]/Spam').then(function () {
            done();
          }).catch(done);
        });
      });

      it('should select correct mailboxes in prechecks on concurrent calls', function (done) {
        imap.selectMailbox('[Gmail]/A').then(function () {
          return Promise.all([imap.selectMailbox('[Gmail]/B'), imap.setFlags('[Gmail]/A', '1', ['\\Seen'])]);
        }).then(function () {
          return imap.listMessages('[Gmail]/A', '1:1', ['flags']);
        }).then(function (messages) {
          expect(messages.length).to.equal(1);
          expect(messages[0].flags).to.deep.equal(['\\Seen']);
          done();
        }).catch(done);
      });

      it('should send precheck commands in correct order on concurrent calls', function (done) {
        Promise.all([imap.setFlags('[Gmail]/A', '1', ['\\Seen']), imap.setFlags('[Gmail]/B', '1', ['\\Seen'])]).then(function () {
          return imap.listMessages('[Gmail]/A', '1:1', ['flags']);
        }).then(function (messages) {
          expect(messages.length).to.equal(1);
          expect(messages[0].flags).to.deep.equal(['\\Seen']);
        }).then(function () {
          return imap.listMessages('[Gmail]/B', '1:1', ['flags']);
        }).then(function (messages) {
          expect(messages.length).to.equal(1);
          expect(messages[0].flags).to.deep.equal(['\\Seen']);
        }).then(done).catch(done);
      });
    });
  });

  describe('Timeout', function () {
    beforeEach(function () {
      imap = new _client2.default('127.0.0.1', port, {
        auth: {
          user: 'testuser',
          pass: 'testpass'
        },
        useSecureTransport: false
      });
      imap.logLevel = imap.LOG_LEVEL_NONE;

      return imap.connect().then(function () {
        // remove the ondata event to simulate 100% packet loss and make the socket time out after 10ms
        imap.client.TIMEOUT_SOCKET_LOWER_BOUND = 10;
        imap.client.TIMEOUT_SOCKET_MULTIPLIER = 0;
        imap.client.socket.ondata = function () {};
      });
    });

    it('should timeout', function (done) {
      imap.onerror = function () {
        done();
      };

      imap.selectMailbox('inbox');
    });

    it('should reject all pending commands on timeout', function (done) {
      var rejectionCount = 0;
      Promise.all([imap.selectMailbox('INBOX').catch(function (err) {
        expect(err).to.exist;
        rejectionCount++;
      }), imap.listMessages('INBOX', '1:*', ['body.peek[]']).catch(function (err) {
        expect(err).to.exist;
        rejectionCount++;
      })]).then(function () {
        expect(rejectionCount).to.equal(2);
        done();
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQtaW50ZWdyYXRpb24uanMiXSwibmFtZXMiOlsicHJvY2VzcyIsImVudiIsIk5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQiLCJkZXNjcmliZSIsImltYXAiLCJwb3J0Iiwic2VydmVyIiwiYmVmb3JlRWFjaCIsImRvbmUiLCJvcHRpb25zIiwicGx1Z2lucyIsInNlY3VyZUNvbm5lY3Rpb24iLCJzdG9yYWdlIiwibWVzc2FnZXMiLCJyYXciLCJmbGFncyIsInVpZCIsImxpc3RlbiIsImFmdGVyRWFjaCIsImNsb3NlIiwiaW5zZWN1cmVTZXJ2ZXIiLCJpdCIsImF1dGgiLCJ1c2VyIiwicGFzcyIsInVzZVNlY3VyZVRyYW5zcG9ydCIsImxvZ0xldmVsIiwiTE9HX0xFVkVMX05PTkUiLCJjb25uZWN0IiwidGhlbiIsImV4cGVjdCIsImNsaWVudCIsInNlY3VyZU1vZGUiLCJ0byIsImJlIiwidHJ1ZSIsImNhdGNoIiwiaWdub3JlVExTIiwiZmFsc2UiLCJyZXF1aXJlVExTIiwiZXJyIiwiZXhpc3QiLCJzZWxlY3RNYWlsYm94IiwibGlzdE1haWxib3hlcyIsIm1haWxib3hlcyIsImxpc3RNZXNzYWdlcyIsIm5vdCIsImVtcHR5IiwibXNnQ291bnQiLCJsZW5ndGgiLCJ1cGxvYWQiLCJlcXVhbCIsInNlYXJjaCIsImhlYWRlciIsInJlc3VsdCIsImRlZXAiLCJieVVpZCIsInNlZW4iLCJzZXRGbGFncyIsImFkZCIsInJlbW92ZSIsInNpbGVudCIsInN0b3JlIiwiaW5pdGlhbEluZm8iLCJleHB1bmdlTm90aWZpZWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9udXBkYXRlIiwibWIiLCJ0eXBlIiwiaW5mbyIsImRlbGV0ZU1lc3NhZ2VzIiwicmVzdWx0SW5mbyIsImV4aXN0cyIsImNvcHlNZXNzYWdlcyIsIm1vdmVNZXNzYWdlcyIsInF1ZXJ5IiwiY29tbWFuZCIsIl9idWlsZFNFQVJDSENvbW1hbmQiLCJleGVjIiwicHJlY2hlY2siLCJFcnJvciIsInJlc3BvbnNlIiwiX3BhcnNlU0VBUkNIIiwibWVzc2FnZSIsImFsbCIsIlRJTUVPVVRfU09DS0VUX0xPV0VSX0JPVU5EIiwiVElNRU9VVF9TT0NLRVRfTVVMVElQTElFUiIsInNvY2tldCIsIm9uZGF0YSIsIm9uZXJyb3IiLCJyZWplY3Rpb25Db3VudCJdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7OztBQUNBOzs7Ozs7QUFIQTs7QUFLQUEsUUFBUUMsR0FBUixDQUFZQyw0QkFBWixHQUEyQyxHQUEzQzs7QUFFQUMsU0FBUyw4QkFBVCxFQUF5QyxZQUFNO0FBQzdDLE1BQUlDLGFBQUo7QUFDQSxNQUFNQyxPQUFPLEtBQWI7QUFDQSxNQUFJQyxlQUFKOztBQUVBQyxhQUFXLFVBQUNDLElBQUQsRUFBVTtBQUNuQjtBQUNBLFFBQUlDLFVBQVU7QUFDWjtBQUNBQyxlQUFTLENBQUMsVUFBRCxFQUFhLFlBQWIsQ0FGRztBQUdaQyx3QkFBa0IsS0FITjtBQUlaQyxlQUFTO0FBQ1AsaUJBQVM7QUFDUEMsb0JBQVUsQ0FDUixFQUFFQyxLQUFLLGtDQUFQLEVBRFEsRUFFUixFQUFFQSxLQUFLLGtDQUFQLEVBQTJDQyxPQUFPLENBQUMsUUFBRCxDQUFsRCxFQUZRLEVBR1IsRUFBRUQsS0FBSyxrQ0FBUCxFQUEyQ0UsS0FBSyxHQUFoRCxFQUhRLEVBSVIsRUFBRUYsS0FBSyx3TEFBUCxFQUpRLEVBS1IsRUFBRUEsS0FBSyxrQ0FBUCxFQUEyQ0MsT0FBTyxDQUFDLFNBQUQsRUFBWSxXQUFaLENBQWxELEVBQTRFQyxLQUFLLEdBQWpGLEVBTFEsRUFNUixFQUFFRixLQUFLLGtDQUFQLEVBTlEsRUFPUixFQUFFQSxLQUFLLGtDQUFQLEVBQTJDRSxLQUFLLEdBQWhELEVBUFE7QUFESCxTQURGO0FBWVAsWUFBSTtBQUNGLHVCQUFhLEdBRFg7QUFFRixxQkFBVztBQUNULHVCQUFXO0FBQ1QsdUJBQVMsQ0FBQyxZQUFELENBREE7QUFFVCx5QkFBVztBQUNULDRCQUFZLEVBQUUsZUFBZSxPQUFqQixFQURI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bi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuXG5pbXBvcnQgaG9vZGllY3JvdyBmcm9tICdob29kaWVjcm93LWltYXAnXG5pbXBvcnQgSW1hcENsaWVudCBmcm9tICcuL2NsaWVudCdcblxucHJvY2Vzcy5lbnYuTk9ERV9UTFNfUkVKRUNUX1VOQVVUSE9SSVpFRCA9ICcwJ1xuXG5kZXNjcmliZSgnYnJvd3NlcmJveCBpbnRlZ3JhdGlvbiB0ZXN0cycsICgpID0+IHtcbiAgbGV0IGltYXBcbiAgY29uc3QgcG9ydCA9IDEwMDAwXG4gIGxldCBzZXJ2ZXJcblxuICBiZWZvcmVFYWNoKChkb25lKSA9PiB7XG4gICAgLy8gc3RhcnQgaW1hcCB0ZXN0IHNlcnZlclxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgLy8gZGVidWc6IHRydWUsXG4gICAgICBwbHVnaW5zOiBbJ1NUQVJUVExTJywgJ1gtR00tRVhULTEnXSxcbiAgICAgIHNlY3VyZUNvbm5lY3Rpb246IGZhbHNlLFxuICAgICAgc3RvcmFnZToge1xuICAgICAgICAnSU5CT1gnOiB7XG4gICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgIHsgcmF3OiAnU3ViamVjdDogaGVsbG8gMVxcclxcblxcclxcbldvcmxkIDEhJyB9LFxuICAgICAgICAgICAgeyByYXc6ICdTdWJqZWN0OiBoZWxsbyAyXFxyXFxuXFxyXFxuV29ybGQgMiEnLCBmbGFnczogWydcXFxcU2VlbiddIH0sXG4gICAgICAgICAgICB7IHJhdzogJ1N1YmplY3Q6IGhlbGxvIDNcXHJcXG5cXHJcXG5Xb3JsZCAzIScsIHVpZDogNTU1IH0sXG4gICAgICAgICAgICB7IHJhdzogJ0Zyb206IHNlbmRlciBuYW1lIDxzZW5kZXJAZXhhbXBsZS5jb20+XFxyXFxuVG86IFJlY2VpdmVyIG5hbWUgPHJlY2VpdmVyQGV4YW1wbGUuY29tPlxcclxcblN1YmplY3Q6IGhlbGxvIDRcXHJcXG5NZXNzYWdlLUlkOiA8YWJjZGU+XFxyXFxuRGF0ZTogRnJpLCAxMyBTZXAgMjAxMyAxNTowMTowMCArMDMwMFxcclxcblxcclxcbldvcmxkIDQhJyB9LFxuICAgICAgICAgICAgeyByYXc6ICdTdWJqZWN0OiBoZWxsbyA1XFxyXFxuXFxyXFxuV29ybGQgNSEnLCBmbGFnczogWyckTXlGbGFnJywgJ1xcXFxEZWxldGVkJ10sIHVpZDogNTU3IH0sXG4gICAgICAgICAgICB7IHJhdzogJ1N1YmplY3Q6IGhlbGxvIDZcXHJcXG5cXHJcXG5Xb3JsZCA2IScgfSxcbiAgICAgICAgICAgIHsgcmF3OiAnU3ViamVjdDogaGVsbG8gN1xcclxcblxcclxcbldvcmxkIDchJywgdWlkOiA2MDAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgJyc6IHtcbiAgICAgICAgICAnc2VwYXJhdG9yJzogJy8nLFxuICAgICAgICAgICdmb2xkZXJzJzoge1xuICAgICAgICAgICAgJ1tHbWFpbF0nOiB7XG4gICAgICAgICAgICAgICdmbGFncyc6IFsnXFxcXE5vc2VsZWN0J10sXG4gICAgICAgICAgICAgICdmb2xkZXJzJzoge1xuICAgICAgICAgICAgICAgICdBbGwgTWFpbCc6IHsgJ3NwZWNpYWwtdXNlJzogJ1xcXFxBbGwnIH0sXG4gICAgICAgICAgICAgICAgJ0RyYWZ0cyc6IHsgJ3NwZWNpYWwtdXNlJzogJ1xcXFxEcmFmdHMnIH0sXG4gICAgICAgICAgICAgICAgJ0ltcG9ydGFudCc6IHsgJ3NwZWNpYWwtdXNlJzogJ1xcXFxJbXBvcnRhbnQnIH0sXG4gICAgICAgICAgICAgICAgJ1NlbnQgTWFpbCc6IHsgJ3NwZWNpYWwtdXNlJzogJ1xcXFxTZW50JyB9LFxuICAgICAgICAgICAgICAgICdTcGFtJzogeyAnc3BlY2lhbC11c2UnOiAnXFxcXEp1bmsnIH0sXG4gICAgICAgICAgICAgICAgJ1N0YXJyZWQnOiB7ICdzcGVjaWFsLXVzZSc6ICdcXFxcRmxhZ2dlZCcgfSxcbiAgICAgICAgICAgICAgICAnVHJhc2gnOiB7ICdzcGVjaWFsLXVzZSc6ICdcXFxcVHJhc2gnIH0sXG4gICAgICAgICAgICAgICAgJ0EnOiB7IG1lc3NhZ2VzOiBbe31dIH0sXG4gICAgICAgICAgICAgICAgJ0InOiB7IG1lc3NhZ2VzOiBbe31dIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlcnZlciA9IGhvb2RpZWNyb3cob3B0aW9ucylcbiAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsIGRvbmUpXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKChkb25lKSA9PiB7XG4gICAgc2VydmVyLmNsb3NlKGRvbmUpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ0Nvbm5lY3Rpb24gdGVzdHMnLCAoKSA9PiB7XG4gICAgdmFyIGluc2VjdXJlU2VydmVyXG5cbiAgICBiZWZvcmVFYWNoKChkb25lKSA9PiB7XG4gICAgICAvLyBzdGFydCBpbWFwIHRlc3Qgc2VydmVyXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgLy8gZGVidWc6IHRydWUsXG4gICAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgICBzZWN1cmVDb25uZWN0aW9uOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBpbnNlY3VyZVNlcnZlciA9IGhvb2RpZWNyb3cob3B0aW9ucylcbiAgICAgIGluc2VjdXJlU2VydmVyLmxpc3Rlbihwb3J0ICsgMiwgZG9uZSlcbiAgICB9KVxuXG4gICAgYWZ0ZXJFYWNoKChkb25lKSA9PiB7XG4gICAgICBpbnNlY3VyZVNlcnZlci5jbG9zZShkb25lKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHVzZSBTVEFSVFRMUyBieSBkZWZhdWx0JywgKGRvbmUpID0+IHtcbiAgICAgIGltYXAgPSBuZXcgSW1hcENsaWVudCgnMTI3LjAuMC4xJywgcG9ydCwge1xuICAgICAgICBhdXRoOiB7XG4gICAgICAgICAgdXNlcjogJ3Rlc3R1c2VyJyxcbiAgICAgICAgICBwYXNzOiAndGVzdHBhc3MnXG4gICAgICAgIH0sXG4gICAgICAgIHVzZVNlY3VyZVRyYW5zcG9ydDogZmFsc2VcbiAgICAgIH0pXG4gICAgICBpbWFwLmxvZ0xldmVsID0gaW1hcC5MT0dfTEVWRUxfTk9ORVxuXG4gICAgICBpbWFwLmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGltYXAuY2xpZW50LnNlY3VyZU1vZGUpLnRvLmJlLnRydWVcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5jbG9zZSgpXG4gICAgICB9KS50aGVuKCgpID0+IGRvbmUoKSkuY2F0Y2goZG9uZSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBpZ25vcmUgU1RBUlRUTFMnLCAoKSA9PiB7XG4gICAgICBpbWFwID0gbmV3IEltYXBDbGllbnQoJzEyNy4wLjAuMScsIHBvcnQsIHtcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXI6ICd0ZXN0dXNlcicsXG4gICAgICAgICAgcGFzczogJ3Rlc3RwYXNzJ1xuICAgICAgICB9LFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlLFxuICAgICAgICBpZ25vcmVUTFM6IHRydWVcbiAgICAgIH0pXG4gICAgICBpbWFwLmxvZ0xldmVsID0gaW1hcC5MT0dfTEVWRUxfTk9ORVxuXG4gICAgICByZXR1cm4gaW1hcC5jb25uZWN0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChpbWFwLmNsaWVudC5zZWN1cmVNb2RlKS50by5iZS5mYWxzZVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLmNsb3NlKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZmFpbCBjb25uZWN0aW5nIHRvIG5vbi1TVEFSVFRMUyBob3N0JywgKGRvbmUpID0+IHtcbiAgICAgIGltYXAgPSBuZXcgSW1hcENsaWVudCgnMTI3LjAuMC4xJywgcG9ydCArIDIsIHtcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXI6ICd0ZXN0dXNlcicsXG4gICAgICAgICAgcGFzczogJ3Rlc3RwYXNzJ1xuICAgICAgICB9LFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlLFxuICAgICAgICByZXF1aXJlVExTOiB0cnVlXG4gICAgICB9KVxuICAgICAgaW1hcC5sb2dMZXZlbCA9IGltYXAuTE9HX0xFVkVMX05PTkVcblxuICAgICAgaW1hcC5jb25uZWN0KCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBleHBlY3QoZXJyKS50by5leGlzdFxuICAgICAgICBkb25lKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY29ubmVjdCB0byBub24gc2VjdXJlIGhvc3QnLCAoKSA9PiB7XG4gICAgICBpbWFwID0gbmV3IEltYXBDbGllbnQoJzEyNy4wLjAuMScsIHBvcnQgKyAyLCB7XG4gICAgICAgIGF1dGg6IHtcbiAgICAgICAgICB1c2VyOiAndGVzdHVzZXInLFxuICAgICAgICAgIHBhc3M6ICd0ZXN0cGFzcydcbiAgICAgICAgfSxcbiAgICAgICAgdXNlU2VjdXJlVHJhbnNwb3J0OiBmYWxzZVxuICAgICAgfSlcbiAgICAgIGltYXAubG9nTGV2ZWwgPSBpbWFwLkxPR19MRVZFTF9OT05FXG5cbiAgICAgIHJldHVybiBpbWFwLmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGltYXAuY2xpZW50LnNlY3VyZU1vZGUpLnRvLmJlLmZhbHNlXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuY2xvc2UoKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdQb3N0IGxvZ2luIHRlc3RzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgaW1hcCA9IG5ldyBJbWFwQ2xpZW50KCcxMjcuMC4wLjEnLCBwb3J0LCB7XG4gICAgICAgIGF1dGg6IHtcbiAgICAgICAgICB1c2VyOiAndGVzdHVzZXInLFxuICAgICAgICAgIHBhc3M6ICd0ZXN0cGFzcydcbiAgICAgICAgfSxcbiAgICAgICAgdXNlU2VjdXJlVHJhbnNwb3J0OiBmYWxzZVxuICAgICAgfSlcbiAgICAgIGltYXAubG9nTGV2ZWwgPSBpbWFwLkxPR19MRVZFTF9OT05FXG5cbiAgICAgIHJldHVybiBpbWFwLmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc2VsZWN0TWFpbGJveCgnW0dtYWlsXS9TcGFtJylcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICByZXR1cm4gaW1hcC5jbG9zZSgpXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCcjbGlzdE1haWxib3hlcycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgc3VjY2VlZCcsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAubGlzdE1haWxib3hlcygpLnRoZW4oKG1haWxib3hlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtYWlsYm94ZXMpLnRvLmV4aXN0XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnI2xpc3RNZXNzYWdlcycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgc3VjY2VlZCcsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAubGlzdE1lc3NhZ2VzKCdpbmJveCcsICcxOionLCBbJ3VpZCcsICdmbGFncycsICdlbnZlbG9wZScsICdib2R5c3RydWN0dXJlJywgJ2JvZHkucGVla1tdJ10pLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzKS50by5ub3QuYmUuZW1wdHlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCcjdXBsb2FkJywgKCkgPT4ge1xuICAgICAgaXQoJ3Nob3VsZCBzdWNjZWVkJywgKCkgPT4ge1xuICAgICAgICB2YXIgbXNnQ291bnRcblxuICAgICAgICByZXR1cm4gaW1hcC5saXN0TWVzc2FnZXMoJ2luYm94JywgJzE6KicsIFsndWlkJywgJ2ZsYWdzJywgJ2VudmVsb3BlJywgJ2JvZHlzdHJ1Y3R1cmUnXSkudGhlbigobWVzc2FnZXMpID0+IHtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMpLnRvLm5vdC5iZS5lbXB0eVxuICAgICAgICAgIG1zZ0NvdW50ID0gbWVzc2FnZXMubGVuZ3RoXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBpbWFwLnVwbG9hZCgnaW5ib3gnLCAnTUlNRS1WZXJzaW9uOiAxLjBcXHJcXG5EYXRlOiBXZWQsIDkgSnVsIDIwMTQgMTU6MDc6NDcgKzAyMDBcXHJcXG5EZWxpdmVyZWQtVG86IHRlc3RAdGVzdC5jb21cXHJcXG5NZXNzYWdlLUlEOiA8Q0FIZnRZWVFvPTVmcWJ0bnYtRGF6WGhMMmo1QXhWUDFuV2Fyamt6dG4tTjlTVjkxWjJ3QG1haWwuZ21haWwuY29tPlxcclxcblN1YmplY3Q6IHRlc3RcXHJcXG5Gcm9tOiBUZXN0IFRlc3QgPHRlc3RAdGVzdC5jb20+XFxyXFxuVG86IFRlc3QgVGVzdCA8dGVzdEB0ZXN0LmNvbT5cXHJcXG5Db250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9VVRGLThcXHJcXG5cXHJcXG50ZXN0Jywge1xuICAgICAgICAgICAgZmxhZ3M6IFsnXFxcXFNlZW4nLCAnXFxcXEFuc3dlcmVkJywgJ1xcXFwkTXlGbGFnJ11cbiAgICAgICAgICB9KVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gaW1hcC5saXN0TWVzc2FnZXMoJ2luYm94JywgJzE6KicsIFsndWlkJywgJ2ZsYWdzJywgJ2VudmVsb3BlJywgJ2JvZHlzdHJ1Y3R1cmUnXSlcbiAgICAgICAgfSkudGhlbigobWVzc2FnZXMpID0+IHtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50by5lcXVhbChtc2dDb3VudCArIDEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnI3NlYXJjaCcsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgc2VxdWVuY2UgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5zZWFyY2goJ2luYm94Jywge1xuICAgICAgICAgIGhlYWRlcjogWydzdWJqZWN0JywgJ2hlbGxvIDMnXVxuICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVzdWx0KS50by5kZWVwLmVxdWFsKFszXSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGFuIHVpZCcsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc2VhcmNoKCdpbmJveCcsIHtcbiAgICAgICAgICBoZWFkZXI6IFsnc3ViamVjdCcsICdoZWxsbyAzJ11cbiAgICAgICAgfSwge1xuICAgICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZXN1bHQpLnRvLmRlZXAuZXF1YWwoWzU1NV0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIHdvcmsgd2l0aCBjb21wbGV4IHF1ZXJpZXMnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLnNlYXJjaCgnaW5ib3gnLCB7XG4gICAgICAgICAgaGVhZGVyOiBbJ3N1YmplY3QnLCAnaGVsbG8nXSxcbiAgICAgICAgICBzZWVuOiB0cnVlXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZXN1bHQpLnRvLmRlZXAuZXF1YWwoWzJdKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJyNzZXRGbGFncycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgc2V0IGZsYWdzIGZvciBhIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLnNldEZsYWdzKCdpbmJveCcsICcxJywgWydcXFxcU2VlbicsICckTXlGbGFnJ10pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZXN1bHQpLnRvLmRlZXAuZXF1YWwoW3tcbiAgICAgICAgICAgICcjJzogMSxcbiAgICAgICAgICAgICdmbGFncyc6IFsnXFxcXFNlZW4nLCAnJE15RmxhZyddXG4gICAgICAgICAgfV0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIGFkZCBmbGFncyB0byBhIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLnNldEZsYWdzKCdpbmJveCcsICcyJywge1xuICAgICAgICAgIGFkZDogWyckTXlGbGFnJ11cbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbe1xuICAgICAgICAgICAgJyMnOiAyLFxuICAgICAgICAgICAgJ2ZsYWdzJzogWydcXFxcU2VlbicsICckTXlGbGFnJ11cbiAgICAgICAgICB9XSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgcmVtb3ZlIGZsYWdzIGZyb20gYSBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5zZXRGbGFncygnaW5ib3gnLCAnNTU3Jywge1xuICAgICAgICAgIHJlbW92ZTogWydcXFxcRGVsZXRlZCddXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBieVVpZDogdHJ1ZVxuICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVzdWx0KS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgICAgICAnIyc6IDUsXG4gICAgICAgICAgICAnZmxhZ3MnOiBbJyRNeUZsYWcnXSxcbiAgICAgICAgICAgICd1aWQnOiA1NTdcbiAgICAgICAgICB9XSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgbm90IHJldHVybiBhbnl0aGluZyBvbiBzaWxlbnQgbW9kZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc2V0RmxhZ3MoJ2luYm94JywgJzEnLCBbJyRNeUZsYWcyJ10sIHtcbiAgICAgICAgICBzaWxlbnQ6IHRydWVcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlc3VsdCkudG8uZGVlcC5lcXVhbChbXSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCcjc3RvcmUnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIGFkZCBsYWJlbHMgZm9yIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc3RvcmUoJ2luYm94JywgJzEnLCAnK1gtR00tTEFCRUxTJywgWydcXFxcU2VudCcsICdcXFxcSnVuayddKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVzdWx0KS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgICAgICAnIyc6IDEsXG4gICAgICAgICAgICAneC1nbS1sYWJlbHMnOiBbJ1xcXFxJbmJveCcsICdcXFxcU2VudCcsICdcXFxcSnVuayddXG4gICAgICAgICAgfV0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2hvdWxkIHNldCBsYWJlbHMgZm9yIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGltYXAuc3RvcmUoJ2luYm94JywgJzEnLCAnWC1HTS1MQUJFTFMnLCBbJ1xcXFxTZW50JywgJ1xcXFxKdW5rJ10pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChyZXN1bHQpLnRvLmRlZXAuZXF1YWwoW3tcbiAgICAgICAgICAgICcjJzogMSxcbiAgICAgICAgICAgICd4LWdtLWxhYmVscyc6IFsnXFxcXFNlbnQnLCAnXFxcXEp1bmsnXVxuICAgICAgICAgIH1dKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3Nob3VsZCByZW1vdmUgbGFiZWxzIGZyb20gYSBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gaW1hcC5zdG9yZSgnaW5ib3gnLCAnMScsICctWC1HTS1MQUJFTFMnLCBbJ1xcXFxTZW50JywgJ1xcXFxJbmJveCddKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBleHBlY3QocmVzdWx0KS50by5kZWVwLmVxdWFsKFt7XG4gICAgICAgICAgICAnIyc6IDEsXG4gICAgICAgICAgICAneC1nbS1sYWJlbHMnOiBbXVxuICAgICAgICAgIH1dKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJyNkZWxldGVNZXNzYWdlcycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgZGVsZXRlIGEgbWVzc2FnZScsICgpID0+IHtcbiAgICAgICAgdmFyIGluaXRpYWxJbmZvXG5cbiAgICAgICAgdmFyIGV4cHVuZ2VOb3RpZmllZCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBpbWFwLm9udXBkYXRlID0gZnVuY3Rpb24gKG1iLCB0eXBlIC8qLCBkYXRhICovKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBleHBlY3QobWIpLnRvLmVxdWFsKCdpbmJveCcpXG4gICAgICAgICAgICAgIGV4cGVjdCh0eXBlKS50by5lcXVhbCgnZXhwdW5nZScpXG4gICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBpbWFwLnNlbGVjdE1haWxib3goJ2luYm94JykudGhlbigoaW5mbykgPT4ge1xuICAgICAgICAgIGluaXRpYWxJbmZvID0gaW5mb1xuICAgICAgICAgIHJldHVybiBpbWFwLmRlbGV0ZU1lc3NhZ2VzKCdpbmJveCcsIDU1Nywge1xuICAgICAgICAgICAgYnlVaWQ6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gaW1hcC5zZWxlY3RNYWlsYm94KCdpbmJveCcpXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdEluZm8pID0+IHtcbiAgICAgICAgICBleHBlY3QoaW5pdGlhbEluZm8uZXhpc3RzIC0gMSA9PT0gcmVzdWx0SW5mby5leGlzdHMpLnRvLmJlLnRydWVcbiAgICAgICAgfSkudGhlbigoKSA9PiBleHB1bmdlTm90aWZpZWQpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnI2NvcHlNZXNzYWdlcycsICgpID0+IHtcbiAgICAgIGl0KCdzaG91bGQgY29weSBhIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbWFwLmNvcHlNZXNzYWdlcygnaW5ib3gnLCA1NTUsICdbR21haWxdL1RyYXNoJywge1xuICAgICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBpbWFwLnNlbGVjdE1haWxib3goJ1tHbWFpbF0vVHJhc2gnKVxuICAgICAgICB9KS50aGVuKChpbmZvKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGluZm8uZXhpc3RzKS50by5lcXVhbCgxKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJyNtb3ZlTWVzc2FnZXMnLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIG1vdmUgYSBtZXNzYWdlJywgKCkgPT4ge1xuICAgICAgICB2YXIgaW5pdGlhbEluZm9cbiAgICAgICAgcmV0dXJuIGltYXAuc2VsZWN0TWFpbGJveCgnaW5ib3gnKS50aGVuKChpbmZvKSA9PiB7XG4gICAgICAgICAgaW5pdGlhbEluZm8gPSBpbmZvXG4gICAgICAgICAgcmV0dXJuIGltYXAubW92ZU1lc3NhZ2VzKCdpbmJveCcsIDU1NSwgJ1tHbWFpbF0vU3BhbScsIHtcbiAgICAgICAgICAgIGJ5VWlkOiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGltYXAuc2VsZWN0TWFpbGJveCgnW0dtYWlsXS9TcGFtJylcbiAgICAgICAgfSkudGhlbigoaW5mbykgPT4ge1xuICAgICAgICAgIGV4cGVjdChpbmZvLmV4aXN0cykudG8uZXF1YWwoMSlcbiAgICAgICAgICByZXR1cm4gaW1hcC5zZWxlY3RNYWlsYm94KCdpbmJveCcpXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdEluZm8pID0+IHtcbiAgICAgICAgICBleHBlY3QoaW5pdGlhbEluZm8uZXhpc3RzKS50by5ub3QuZXF1YWwocmVzdWx0SW5mby5leGlzdHMpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgncHJlY2hlY2snLCAoKSA9PiB7XG4gICAgICBpdCgnc2hvdWxkIGhhbmRsZSBwcmVjaGVjayBlcnJvciBjb3JyZWN0bHknLCAoZG9uZSkgPT4ge1xuICAgICAgICAvLyBzaW11bGF0ZXMgYSBicm9rZW4gc2VhcmNoIGNvbW1hbmRcbiAgICAgICAgdmFyIHNlYXJjaCA9IChxdWVyeSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHZhciBjb21tYW5kID0gaW1hcC5fYnVpbGRTRUFSQ0hDb21tYW5kKHF1ZXJ5LCBvcHRpb25zKVxuICAgICAgICAgIHJldHVybiBpbWFwLmV4ZWMoY29tbWFuZCwgJ1NFQVJDSCcsIHtcbiAgICAgICAgICAgIHByZWNoZWNrOiAoKSA9PiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ0ZPTycpKVxuICAgICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiBpbWFwLl9wYXJzZVNFQVJDSChyZXNwb25zZSkpXG4gICAgICAgIH1cblxuICAgICAgICBpbWFwLnNlbGVjdE1haWxib3goJ2luYm94JykudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHNlYXJjaCh7XG4gICAgICAgICAgICBoZWFkZXI6IFsnc3ViamVjdCcsICdoZWxsbyAzJ11cbiAgICAgICAgICB9LCB7fSlcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGV4cGVjdChlcnIubWVzc2FnZSkudG8uZXF1YWwoJ0ZPTycpXG4gICAgICAgICAgcmV0dXJuIGltYXAuc2VsZWN0TWFpbGJveCgnW0dtYWlsXS9TcGFtJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBkb25lKClcbiAgICAgICAgICB9KS5jYXRjaChkb25lKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3Nob3VsZCBzZWxlY3QgY29ycmVjdCBtYWlsYm94ZXMgaW4gcHJlY2hlY2tzIG9uIGNvbmN1cnJlbnQgY2FsbHMnLCAoZG9uZSkgPT4ge1xuICAgICAgICBpbWFwLnNlbGVjdE1haWxib3goJ1tHbWFpbF0vQScpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBpbWFwLnNlbGVjdE1haWxib3goJ1tHbWFpbF0vQicpLFxuICAgICAgICAgICAgaW1hcC5zZXRGbGFncygnW0dtYWlsXS9BJywgJzEnLCBbJ1xcXFxTZWVuJ10pXG4gICAgICAgICAgXSlcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGltYXAubGlzdE1lc3NhZ2VzKCdbR21haWxdL0EnLCAnMToxJywgWydmbGFncyddKVxuICAgICAgICB9KS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvLmVxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLmZsYWdzKS50by5kZWVwLmVxdWFsKFsnXFxcXFNlZW4nXSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfSkuY2F0Y2goZG9uZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzaG91bGQgc2VuZCBwcmVjaGVjayBjb21tYW5kcyBpbiBjb3JyZWN0IG9yZGVyIG9uIGNvbmN1cnJlbnQgY2FsbHMnLCAoZG9uZSkgPT4ge1xuICAgICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgICAgaW1hcC5zZXRGbGFncygnW0dtYWlsXS9BJywgJzEnLCBbJ1xcXFxTZWVuJ10pLFxuICAgICAgICAgIGltYXAuc2V0RmxhZ3MoJ1tHbWFpbF0vQicsICcxJywgWydcXFxcU2VlbiddKVxuICAgICAgICBdKS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gaW1hcC5saXN0TWVzc2FnZXMoJ1tHbWFpbF0vQScsICcxOjEnLCBbJ2ZsYWdzJ10pXG4gICAgICAgIH0pLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG8uZXF1YWwoMSlcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uZmxhZ3MpLnRvLmRlZXAuZXF1YWwoWydcXFxcU2VlbiddKVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gaW1hcC5saXN0TWVzc2FnZXMoJ1tHbWFpbF0vQicsICcxOjEnLCBbJ2ZsYWdzJ10pXG4gICAgICAgIH0pLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG8uZXF1YWwoMSlcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uZmxhZ3MpLnRvLmRlZXAuZXF1YWwoWydcXFxcU2VlbiddKVxuICAgICAgICB9KS50aGVuKGRvbmUpLmNhdGNoKGRvbmUpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ1RpbWVvdXQnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBpbWFwID0gbmV3IEltYXBDbGllbnQoJzEyNy4wLjAuMScsIHBvcnQsIHtcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXI6ICd0ZXN0dXNlcicsXG4gICAgICAgICAgcGFzczogJ3Rlc3RwYXNzJ1xuICAgICAgICB9LFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IGZhbHNlXG4gICAgICB9KVxuICAgICAgaW1hcC5sb2dMZXZlbCA9IGltYXAuTE9HX0xFVkVMX05PTkVcblxuICAgICAgcmV0dXJuIGltYXAuY29ubmVjdCgpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIG9uZGF0YSBldmVudCB0byBzaW11bGF0ZSAxMDAlIHBhY2tldCBsb3NzIGFuZCBtYWtlIHRoZSBzb2NrZXQgdGltZSBvdXQgYWZ0ZXIgMTBtc1xuICAgICAgICAgIGltYXAuY2xpZW50LlRJTUVPVVRfU09DS0VUX0xPV0VSX0JPVU5EID0gMTBcbiAgICAgICAgICBpbWFwLmNsaWVudC5USU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSID0gMFxuICAgICAgICAgIGltYXAuY2xpZW50LnNvY2tldC5vbmRhdGEgPSAoKSA9PiB7IH1cbiAgICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCB0aW1lb3V0JywgKGRvbmUpID0+IHtcbiAgICAgIGltYXAub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG5cbiAgICAgIGltYXAuc2VsZWN0TWFpbGJveCgnaW5ib3gnKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJlamVjdCBhbGwgcGVuZGluZyBjb21tYW5kcyBvbiB0aW1lb3V0JywgKGRvbmUpID0+IHtcbiAgICAgIGxldCByZWplY3Rpb25Db3VudCA9IDBcbiAgICAgIFByb21pc2UuYWxsKFtcblxuICAgICAgICBpbWFwLnNlbGVjdE1haWxib3goJ0lOQk9YJylcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG4gICAgICAgICAgICByZWplY3Rpb25Db3VudCsrXG4gICAgICAgICAgfSksXG5cbiAgICAgICAgaW1hcC5saXN0TWVzc2FnZXMoJ0lOQk9YJywgJzE6KicsIFsnYm9keS5wZWVrW10nXSlcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChlcnIpLnRvLmV4aXN0XG4gICAgICAgICAgICByZWplY3Rpb25Db3VudCsrXG4gICAgICAgICAgfSlcblxuICAgICAgXSkudGhlbigoKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZWplY3Rpb25Db3VudCkudG8uZXF1YWwoMilcbiAgICAgICAgZG9uZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19