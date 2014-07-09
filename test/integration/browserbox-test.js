'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {

    var chai = require('chai');
    var BrowserBox = require('../../src/browserbox');
    var hoodiecrow = require('hoodiecrow');
    var axe = require('axe');

    var expect = chai.expect;
    chai.Assertion.includeStack = true;

    describe('browserbox integration tests', function() {
        var imap, port = 10000,
            server;

        beforeEach(function(done) {
            // don't log in the tests
            axe.removeAppender(axe.defaultAppender);

            // start imap test server
            var options = {
                secureConnection: false,
                storage: {
                    "INBOX": {
                        messages: [{
                            raw: "Subject: hello 1\r\n\r\nWorld 1!"
                        }, {
                            raw: "Subject: hello 2\r\n\r\nWorld 2!",
                            flags: ["\\Seen"]
                        }, {
                            raw: "Subject: hello 3\r\n\r\nWorld 3!",
                            uid: 555
                        }, {
                            raw: "From: sender name <sender@example.com>\r\nTo: Receiver name <receiver@example.com>\r\nSubject: hello 4\r\nMessage-Id: <abcde>\r\nDate: Fri, 13 Sep 2013 15:01:00 +0300\r\n\r\nWorld 4!"
                        }, {
                            raw: "Subject: hello 5\r\n\r\nWorld 5!",
                            flags: ["$MyFlag", "\\Deleted"],
                            uid: 557
                        }, {
                            raw: "Subject: hello 6\r\n\r\nWorld 6!"
                        }]
                    },
                    "": {
                        "separator": "/",
                        "folders": {
                            "[Gmail]": {
                                "flags": ["\\Noselect"],
                                "folders": {
                                    "All Mail": {
                                        "special-use": "\\All"
                                    },
                                    "Drafts": {
                                        "special-use": "\\Drafts"
                                    },
                                    "Important": {
                                        "special-use": "\\Important"
                                    },
                                    "Sent Mail": {
                                        "special-use": "\\Sent"
                                    },
                                    "Spam": {
                                        "special-use": "\\Junk"
                                    },
                                    "Starred": {
                                        "special-use": "\\Flagged"
                                    },
                                    "Trash": {
                                        "special-use": "\\Trash"
                                    }
                                }
                            }
                        }
                    }
                }
            };

            server = hoodiecrow(options);
            server.listen(port, function() {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    useSSL: false
                });
                expect(imap).to.exist;

                imap.onauth = done;
                imap.onerror = done;
                imap.connect();
            });
        });

        afterEach(function(done) {
            imap.onclose = function() {
                server.close(done);
            };
            imap.close();
        });

        describe('#listMailboxes', function() {
            it('should succeed', function(done) {
                imap.listMailboxes(function(err, mailboxes) {
                    expect(err).to.not.exist;
                    expect(mailboxes).to.not.be.empty;

                    done();
                });
            });
        });

        describe('#listMessages', function() {
            it('should succeed', function(done) {
                imap.selectMailbox("inbox", function(err) {
                    expect(err).to.not.exist;
                    imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure", "body.peek[]"], function(err, messages) {
                        expect(err).to.not.exist;
                        expect(messages).to.not.be.empty;
                        done();
                    });
                });
            });
        });

        describe('#upload', function() {
            it('should succeed', function(done) {
                imap.selectMailbox("inbox", function(err) {
                    expect(err).to.not.exist;

                    imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure"], function(err, messages) {
                        expect(err).to.not.exist;
                        expect(messages).to.not.be.empty;
                        var msgCount = messages.length;

                        imap.upload('inbox', 'MIME-Version: 1.0\r\nDate: Wed, 9 Jul 2014 15:07:47 +0200\r\nDelivered-To: test@test.com\r\nMessage-ID: <CAHftYYQo=5fqbtnv-DazXhL2j5AxVP1nWarjkztn-N9SV91Z2w@mail.gmail.com>\r\nSubject: test\r\nFrom: Test Test <test@test.com>\r\nTo: Test Test <test@test.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\ntest', function(err, success) {
                            expect(err).to.not.exist;
                            expect(success).to.be.true;

                            imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure"], function(err, messages) {
                                expect(err).to.not.exist;
                                expect(messages.length).to.equal(msgCount + 1);
                                done();
                            });
                        });
                    });
                });
            });
        });

        describe('#search', function() {
            it('should return a sequence number', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.search({
                        header: ['subject', 'hello 3']
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([3]);
                        done();
                    });
                });
            });

            it('should return an uid', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.search({
                        header: ['subject', 'hello 3']
                    }, {
                        byUid: true
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([555]);
                        done();
                    });
                });
            });

            it('should work with complex queries', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.search({
                        header: ['subject', 'hello'],
                        seen: true
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([2]);
                        done();
                    });
                });
            });
        });

        describe('#setFlags', function() {
            it('should set flags for a message', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.setFlags('1', ['\\Seen', '$MyFlag'], function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([{
                            '#': 1,
                            'flags': ['\\Seen', '$MyFlag']
                        }]);

                        done();
                    });
                });
            });

            it('should add flags to a message', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.setFlags('2', {
                        add: ['$MyFlag']
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([{
                            '#': 2,
                            'flags': ['\\Seen', '$MyFlag']
                        }]);

                        done();
                    });
                });
            });

            it('should remove flags from a message', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.setFlags('557', {
                        remove: ['\\Deleted']
                    }, {
                        byUid: true
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([{
                            '#': 5,
                            'flags': ['$MyFlag'],
                            'uid': 557
                        }]);

                        done();
                    });
                });
            });

            it('should not return anything on silent mode', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.setFlags('1', ['$MyFlag2'], {
                        silent: true
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.deep.equal([]);

                        done();
                    });
                });
            });
        });

        describe('#deleteMessages', function() {
            it('should delete a message', function(done) {
                imap.selectMailbox('inbox', function(err, initialInfo) {
                    expect(err).to.not.exist;
                    imap.deleteMessages(557, {
                        byUid: true
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.be.true;

                        imap.selectMailbox('inbox', function(err, resultInfo) {
                            expect(err).to.not.exist;
                            expect(initialInfo.exists !== resultInfo.exists).to.be.true;
                            done();
                        });
                    });
                });
            });
        });

        describe('#copyMessages', function() {
            it('should copy a message', function(done) {
                imap.selectMailbox('inbox', function(err) {
                    expect(err).to.not.exist;
                    imap.copyMessages(555, '[Gmail]/Trash', {
                        byUid: true
                    }, function(err) {
                        expect(err).to.not.exist;
                        imap.selectMailbox('[Gmail]/Trash', function(err, info) {
                            expect(err).to.not.exist;
                            expect(info.exists).to.equal(1);
                            done();
                        });
                    });
                });
            });
        });

        describe('#moveMessages', function() {
            it('should move a message', function(done) {
                imap.selectMailbox('inbox', function(err, initialInfo) {
                    expect(err).to.not.exist;
                    imap.moveMessages(555, '[Gmail]/Spam', {
                        byUid: true
                    }, function(err, result) {
                        expect(err).to.not.exist;
                        expect(result).to.be.true;
                        imap.selectMailbox('[Gmail]/Spam', function(err, info) {
                            expect(err).to.not.exist;
                            expect(info.exists).to.equal(1);

                            imap.selectMailbox('inbox', function(err, resultInfo) {
                                expect(err).to.not.exist;
                                expect(initialInfo.exists !== resultInfo.exists).to.be.true;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});