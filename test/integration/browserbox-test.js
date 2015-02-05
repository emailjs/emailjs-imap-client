'use strict';

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['chai', '../../src/browserbox', 'hoodiecrow', 'axe', 'es6-promise'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('chai'), require('../../src/browserbox'), require('hoodiecrow'), require('axe-logger'), require('es6-promise'));
    }
}(function(chai, BrowserBox, hoodiecrow, axe, ES6Promise) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    if (typeof Promise === 'undefined') {
        // load ES6 Promises polyfill
        ES6Promise.polyfill();
    }

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
                //debug: true,
                plugins: ["STARTTLS"],
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
                        }, {
                            raw: "Subject: hello 7\r\n\r\nWorld 7!",
                            uid: 600
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
            server.listen(port, done);
        });

        afterEach(function(done) {
            server.close(done);
        });

        describe('Connection tests', function() {
            var insecureServer;

            beforeEach(function(done) {
                // start imap test server
                var options = {
                    //debug: true,
                    plugins: [],
                    secureConnection: false
                };

                insecureServer = hoodiecrow(options);
                insecureServer.listen(port + 2, done);
            });

            afterEach(function(done) {
                insecureServer.close(done);
            });

            it('should use STARTTLS by default', function(done) {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    useSecureTransport: false
                });
                expect(imap).to.exist;

                imap.onclose = done;

                imap.onauth = function() {
                    expect(imap.client.secureMode).to.be.true;
                    imap.close();
                };

                imap.onerror = function(err) {
                    expect(err).to.not.exist;
                };

                imap.connect();
            });

            it('should ignore STARTTLS', function(done) {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    useSecureTransport: false,
                    ignoreTLS: true
                });
                expect(imap).to.exist;

                imap.onclose = done;

                imap.onauth = function() {
                    expect(imap.client.secureMode).to.be.false;
                    imap.close();
                };

                imap.onerror = function(err) {
                    expect(err).to.not.exist;
                };

                imap.connect();
            });

            it('should fail connecting to non-STARTTLS host', function(done) {
                imap = new BrowserBox('127.0.0.1', port + 2, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    useSecureTransport: false,
                    requireTLS: true
                });
                expect(imap).to.exist;

                imap.onclose = done;

                imap.onauth = function() {
                    expect(imap.client.secureMode).to.be.false;
                    imap.close();
                };

                imap.onerror = function(err) {
                    expect(err).to.exist;
                    expect(imap.client.secureMode).to.be.false;
                };

                imap.connect();
            });

            it('should connect to non secure host', function(done) {
                imap = new BrowserBox('127.0.0.1', port + 2, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    useSecureTransport: false
                });
                expect(imap).to.exist;

                imap.onclose = done;

                imap.onauth = function() {
                    expect(imap.client.secureMode).to.be.false;
                    imap.close();
                };

                imap.onerror = function(err) {
                    expect(err).to.not.exist;
                    expect(imap.client.secureMode).to.be.false;
                };

                imap.connect();
            });
        });

        describe('Post login tests', function() {

            beforeEach(function(done) {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    useSecureTransport: false
                });
                expect(imap).to.exist;

                imap.onauth = done;
                imap.onerror = done;
                imap.connect();
            });

            afterEach(function(done) {
                imap.onclose = done;
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

                it('should succeed with promise', function(done) {
                    imap.listMailboxes().then(function(mailboxes) {
                        expect(mailboxes).to.not.be.empty;
                        done();
                    }).catch(function(err) {
                        expect(err).to.not.exist;
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

                it('should succeed with promise', function(done) {
                    imap.selectMailbox("inbox").then(function() {
                        imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure", "body.peek[]"], function(err, messages) {
                            expect(err).to.not.exist;
                            expect(messages).to.not.be.empty;
                            done();
                        });
                    }).catch(function(err) {
                        expect(err).to.not.exist;
                        done();
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

                            imap.upload('inbox', 'MIME-Version: 1.0\r\nDate: Wed, 9 Jul 2014 15:07:47 +0200\r\nDelivered-To: test@test.com\r\nMessage-ID: <CAHftYYQo=5fqbtnv-DazXhL2j5AxVP1nWarjkztn-N9SV91Z2w@mail.gmail.com>\r\nSubject: test\r\nFrom: Test Test <test@test.com>\r\nTo: Test Test <test@test.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\ntest', {
                                flags: ['\\Seen', '\\Answered', '\\$MyFlag']
                            }, function(err, success) {
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

                it('should succeed with promise', function(done) {
                    var msgCount;

                    imap.selectMailbox("inbox").
                    then(function() {
                        return imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure"]);
                    }).
                    then(function(messages) {
                        expect(messages).to.not.be.empty;
                        msgCount = messages.length;
                        return imap.upload('inbox', 'MIME-Version: 1.0\r\nDate: Wed, 9 Jul 2014 15:07:47 +0200\r\nDelivered-To: test@test.com\r\nMessage-ID: <CAHftYYQo=5fqbtnv-DazXhL2j5AxVP1nWarjkztn-N9SV91Z2w@mail.gmail.com>\r\nSubject: test\r\nFrom: Test Test <test@test.com>\r\nTo: Test Test <test@test.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\ntest', {
                            flags: ['\\Seen', '\\Answered', '\\$MyFlag']
                        });
                    }).
                    then(function(success) {
                        expect(success).to.be.true;
                        return imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure"]);
                    }).
                    then(function(messages) {
                        expect(messages.length).to.equal(msgCount + 1);
                        done();
                    }).
                    catch(function(err) {
                        expect(err).to.not.exist;
                        done();
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

                it('should return a sequence number with promise', function(done) {
                    imap.selectMailbox('inbox').then(function() {
                        imap.search({
                            header: ['subject', 'hello 3']
                        }, function(err, result) {
                            expect(err).to.not.exist;
                            expect(result).to.deep.equal([3]);
                            done();
                        }).
                        catch(function(err) {
                            expect(err).to.not.exist;
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

                it('should return an uid with promise', function(done) {
                    imap.selectMailbox('inbox').
                    then(function() {
                        return imap.search({
                            header: ['subject', 'hello 3']
                        }, {
                            byUid: true
                        });
                    }).
                    then(function(result) {
                        expect(result).to.deep.equal([555]);
                        done();
                    }).
                    catch(function(err) {
                        expect(err).to.not.exist;
                        done();
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

                it('should set flags for a message with promise', function(done) {
                    imap.selectMailbox('inbox').
                    then(function() {
                        return imap.setFlags('1', ['\\Seen', '$MyFlag']);
                    }).
                    then(function(result) {
                        expect(result).to.deep.equal([{
                            '#': 1,
                            'flags': ['\\Seen', '$MyFlag']
                        }]);
                        done();
                    }).
                    catch(function(err) {
                        expect(err).to.not.exist;
                        done();
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

                it('should delete a message with promise', function(done) {
                    var initialInfo;
                    imap.selectMailbox('inbox').
                    then(function(info) {
                        initialInfo = info;
                        return imap.deleteMessages(557, {
                            byUid: true
                        });
                    }).
                    then(function(result) {
                        expect(result).to.be.true;
                        return imap.selectMailbox('inbox');
                    }).
                    then(function(resultInfo) {
                        expect(initialInfo.exists !== resultInfo.exists).to.be.true;
                        done();
                    }).
                    catch(function(err) {
                        expect(err).to.not.exist;
                        done();
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

                it('should copy a message with promise', function(done) {
                    imap.selectMailbox('inbox').then(function() {
                        return imap.copyMessages(555, '[Gmail]/Trash', {
                            byUid: true
                        });
                    }).then(function() {
                        return imap.selectMailbox('[Gmail]/Trash');
                    }).then(function(info) {
                        expect(info.exists).to.equal(1);
                        done();
                    }).
                    catch(function(err) {
                        expect(err).to.not.exist;
                        done();
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

                it('should move a message with promise', function(done) {
                    var initialInfo;
                    imap.selectMailbox('inbox').
                    then(function(info) {
                        initialInfo = info;
                        return imap.moveMessages(555, '[Gmail]/Spam', {
                            byUid: true
                        });
                    }).then(function(result) {
                        expect(result).to.be.true;
                        return imap.selectMailbox('[Gmail]/Spam');
                    }).then(function(info) {
                        expect(info.exists).to.equal(1);
                        return imap.selectMailbox('inbox');
                    }).then(function(resultInfo) {
                        expect(initialInfo.exists !== resultInfo.exists).to.be.true;
                        done();
                    }).
                    catch(function(err) {
                        expect(err).to.not.exist;
                        done();
                    });
                });
            });

            describe('precheck', function() {
                var callCtr;

                beforeEach(function() {
                    callCtr = 0;
                });

                it('should use nested precheck calls to cycle through mailboxes, delete mail, move stuff around etc', function(done) {
                    /*
                     * start out in [Gmail]/Drafts
                     *
                     * execution path #1:
                     *   folder? -> [Gmail]/Spam -> inbox
                     *   set flags on a message (in the inbox)
                     *
                     * execution path #2:
                     *   folder? -> inbox
                     *   move 600 to [Gmail]/Drafts
                     *   folder? -> [Gmail]/Drafts
                     *   list messages, make sure uid 1 is there
                     *   delete uid 1 from [Gmail]/Drafts
                     *
                     * execution path #3:
                     *   folder? -> inbox
                     *   search for subject 'hello 3', make sure it's there
                     */
                    imap.selectMailbox('[Gmail]/Drafts', function(err) {
                        expect(err).to.not.exist;

                        imap.setFlags('1', ['\\Seen', '$MyFlag'], {
                            precheck: function(ctx, next) {
                                imap.selectMailbox('[Gmail]/Spam', {
                                    ctx: ctx
                                }, function(err) {
                                    expect(err).to.not.exist;
                                    imap.selectMailbox('inbox', {
                                        ctx: ctx
                                    }, next);
                                });
                            }
                        }, function(err, result) {
                            expect(err).to.not.exist;
                            expect(result).to.deep.equal([{
                                '#': 1,
                                'flags': ['\\Seen', '$MyFlag']
                            }]);
                            proceed();
                        });

                        imap.moveMessages(600, '[Gmail]/Drafts', {
                            byUid: true,
                            precheck: function(ctx, next) {
                                imap.selectMailbox('inbox', {
                                    ctx: ctx
                                }, next);
                            }
                        }, function(err, result) {
                            expect(err).to.not.exist;
                            expect(result).to.be.true;

                            imap.deleteMessages(1, {
                                byUid: true,
                                precheck: function(ctx1, next1) {
                                    imap.listMessages("1:*", ["uid", "flags", "envelope", "bodystructure", "body.peek[]"], {
                                        ctx: ctx1,
                                        precheck: function(ctx2, next2) {
                                            imap.selectMailbox('[Gmail]/Drafts', {
                                                ctx: ctx2,
                                                precheck: function(ctx, next3) {
                                                    next3();
                                                }
                                            }, next2);
                                        }
                                    }, function(err, messages) {
                                        expect(err).to.not.exist;
                                        expect(messages[0].uid).to.equal(1);
                                        next1();
                                    });
                                }
                            }, function(err, result) {
                                expect(err).to.not.exist;
                                expect(result).to.be.true;
                                proceed();
                            });
                        });

                        imap.search({
                            header: ['subject', 'hello 3']
                        }, {
                            precheck: function(ctx, next) {
                                imap.selectMailbox('inbox', {
                                    ctx: ctx
                                }, next);
                            },
                            byUid: true
                        }, function(err, result) {
                            expect(err).to.not.exist;
                            expect(result).to.deep.equal([555]);
                            proceed();
                        });

                    });

                    function proceed() {
                        ++callCtr === 3 && done();
                    }
                });

                it('should error in precheck', function(done) {
                    /*
                     * start out in [Gmail]/Drafts

                     * execution path #1:
                     *   setFlags precheck() should error and never be executed
                     *
                     * execution path #2:
                     *   folder? -> inbox
                     *   search for subject 'hello 3', make sure it's there
                     */
                    imap.selectMailbox('[Gmail]/Drafts', function(err) {
                        expect(err).to.not.exist;

                        imap.setFlags('1', ['\\Seen', '$MyFlag'], {
                            precheck: function(ctx, next) {
                                next(new Error());
                            }
                        }, function(err, result) {
                            expect(err).to.exist;
                            expect(result).to.not.exist;
                            proceed();
                        });

                        imap.search({
                            header: ['subject', 'hello 3']
                        }, {
                            precheck: function(ctx, next) {
                                imap.selectMailbox('inbox', {
                                    ctx: ctx
                                }, next);
                            },
                            byUid: true
                        }, function(err, result) {
                            expect(err).to.not.exist;
                            expect(result).to.deep.equal([555]);
                            proceed();
                        });

                    });

                    function proceed() {
                        ++callCtr === 2 && done();
                    }
                });

            });

        });

        describe('Timeout', function() {

            beforeEach(function(done) {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    useSecureTransport: false
                });
                expect(imap).to.exist;

                imap.onauth = done;
                imap.connect();
            });

            it('should timeout', function(done) {
                var errored = false;

                // remove the ondata event to simulate 100% packet loss and make the socket time out after 10ms
                imap.client.TIMEOUT_SOCKET_LOWER_BOUND = 10;
                imap.client.TIMEOUT_SOCKET_MULTIPLIER = 0;
                imap.client.socket.ondata = function() {};

                imap.onerror = function() {
                    errored = true;
                };

                imap.onclose = function() {
                    expect(errored).to.be.true;
                    done();
                };

                imap.selectMailbox('inbox', function() {});
            });
        });
    });
}));