'use strict';

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['chai', '../../src/browserbox', 'hoodiecrow'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('chai'), require('../../src/browserbox'), require('hoodiecrow'));
    }
}(function(chai, BrowserBox, hoodiecrow) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    var expect = chai.expect;
    chai.config.includeStack = true;

    describe('browserbox integration tests', () => {
        var imap, port = 10000,
            server;

        beforeEach((done) => {
            // start imap test server
            var options = {
                //debug: true,
                plugins: ["STARTTLS", "X-GM-EXT-1"],
                secureConnection: false,
                storage: {
                    "INBOX": {
                        messages: [
                            { raw: "Subject: hello 1\r\n\r\nWorld 1!" },
                            { raw: "Subject: hello 2\r\n\r\nWorld 2!", flags: ["\\Seen"] },
                            { raw: "Subject: hello 3\r\n\r\nWorld 3!", uid: 555 },
                            { raw: "From: sender name <sender@example.com>\r\nTo: Receiver name <receiver@example.com>\r\nSubject: hello 4\r\nMessage-Id: <abcde>\r\nDate: Fri, 13 Sep 2013 15:01:00 +0300\r\n\r\nWorld 4!" },
                            { raw: "Subject: hello 5\r\n\r\nWorld 5!", flags: ["$MyFlag", "\\Deleted"], uid: 557 },
                            { raw: "Subject: hello 6\r\n\r\nWorld 6!" },
                            { raw: "Subject: hello 7\r\n\r\nWorld 7!", uid: 600}
                        ]
                    },
                    "": {
                        "separator": "/",
                        "folders": {
                            "[Gmail]": {
                                "flags": ["\\Noselect"],
                                "folders": {
                                    "All Mail": { "special-use": "\\All" },
                                    "Drafts": { "special-use": "\\Drafts" },
                                    "Important": { "special-use": "\\Important" },
                                    "Sent Mail": { "special-use": "\\Sent" },
                                    "Spam": { "special-use": "\\Junk" },
                                    "Starred": { "special-use": "\\Flagged" },
                                    "Trash": { "special-use": "\\Trash" }
                                }
                            }
                        }
                    }
                }
            };

            server = hoodiecrow(options);
            server.listen(port, done);
        });

        afterEach((done) => {
            server.close(done);
        });

        describe('Connection tests', () => {
            var insecureServer;

            beforeEach((done) => {
                // start imap test server
                var options = {
                    //debug: true,
                    plugins: [],
                    secureConnection: false
                };

                insecureServer = hoodiecrow(options);
                insecureServer.listen(port + 2, done);
            });

            afterEach((done) => {
                insecureServer.close(done);
            });

            it('should use STARTTLS by default', (done) => {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    tcpSocket: {
                        useSecureTransport: false
                    }
                });

                imap.onerror = () => {
                    done();
                };

                imap.connect().then(() => {
                    expect(imap.client.secureMode).to.be.true;
                }).then(() => {
                    return imap.close();
                }).then(done).catch(done);
            });

            it('should ignore STARTTLS', (done) => {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    tcpSocket: {
                        useSecureTransport: false
                    },
                    ignoreTLS: true
                });

                imap.connect().then(() => {
                    expect(imap.client.secureMode).to.be.false;
                }).then(() => {
                    return imap.close();
                }).then(done).catch(done);
            });

            it('should fail connecting to non-STARTTLS host', (done) => {
                imap = new BrowserBox('127.0.0.1', port + 2, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    tcpSocket: {
                        useSecureTransport: false
                    },
                    requireTLS: true
                });

                imap.connect().catch((err) => {
                    expect(err).to.exist;
                    done();
                });
            });

            it('should connect to non secure host', (done) => {
                imap = new BrowserBox('127.0.0.1', port + 2, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    tcpSocket: {
                        useSecureTransport: false
                    }
                });

                imap.connect().then(() => {
                    expect(imap.client.secureMode).to.be.false;
                }).then(() => {
                    return imap.close();
                }).then(done).catch(done);
            });
        });

        describe('Post login tests', () => {

            beforeEach((done) => {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    tcpSocket: {
                        useSecureTransport: false
                    }
                });

                imap.connect().then(() => {
                    return imap.selectMailbox('[Gmail]/Spam');
                }).then(() => {
                    done();
                }).catch(done);
            });

            afterEach((done) => {
                imap.close().then(done);
            });

            describe('#listMailboxes', () => {
                it('should succeed', (done) => {
                    imap.listMailboxes().then((mailboxes) => {
                        expect(mailboxes).to.exist;
                    }).then(done).catch(done);
                });
            });

            describe('#listMessages', () => {
                it('should succeed', (done) => {
                    imap.listMessages('inbox', "1:*", ["uid", "flags", "envelope", "bodystructure", "body.peek[]"]).then((messages) => {
                        expect(messages).to.not.be.empty;
                    }).then(done).catch(done);
                });
            });

            describe('#upload', () => {
                it('should succeed', (done) => {
                    var msgCount;

                    imap.listMessages('inbox', "1:*", ["uid", "flags", "envelope", "bodystructure"]).then((messages) => {
                        expect(messages).to.not.be.empty;
                        msgCount = messages.length;
                    }).then(() => {
                        return imap.upload('inbox', 'MIME-Version: 1.0\r\nDate: Wed, 9 Jul 2014 15:07:47 +0200\r\nDelivered-To: test@test.com\r\nMessage-ID: <CAHftYYQo=5fqbtnv-DazXhL2j5AxVP1nWarjkztn-N9SV91Z2w@mail.gmail.com>\r\nSubject: test\r\nFrom: Test Test <test@test.com>\r\nTo: Test Test <test@test.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\ntest', {
                            flags: ['\\Seen', '\\Answered', '\\$MyFlag']
                        });
                    }).then(() => {
                        return imap.listMessages('inbox', "1:*", ["uid", "flags", "envelope", "bodystructure"]);
                    }).then((messages) => {
                        expect(messages.length).to.equal(msgCount + 1);
                    }).then(done).catch(done);
                });
            });

            describe('#search', () => {
                it('should return a sequence number', (done) => {
                    imap.search('inbox', {
                        header: ['subject', 'hello 3']
                    }).then((result) => {
                        expect(result).to.deep.equal([3]);
                    }).then(done).catch(done);
                });

                it('should return an uid', (done) => {
                    imap.search('inbox', {
                        header: ['subject', 'hello 3']
                    }, {
                        byUid: true
                    }).then((result) => {
                        expect(result).to.deep.equal([555]);
                    }).then(done).catch(done);
                });

                it('should work with complex queries', (done) => {
                    imap.search('inbox', {
                        header: ['subject', 'hello'],
                        seen: true
                    }).then((result) => {
                        expect(result).to.deep.equal([2]);
                    }).then(done).catch(done);
                });
            });

            describe('#setFlags', () => {
                it('should set flags for a message', (done) => {
                    imap.setFlags('inbox', '1', ['\\Seen', '$MyFlag']).then((result) => {
                        expect(result).to.deep.equal([{
                            '#': 1,
                            'flags': ['\\Seen', '$MyFlag']
                        }]);
                    }).then(done).catch(done);
                });

                it('should add flags to a message', (done) => {
                    imap.setFlags('inbox', '2', {
                        add: ['$MyFlag']
                    }).then((result) => {
                        expect(result).to.deep.equal([{
                            '#': 2,
                            'flags': ['\\Seen', '$MyFlag']
                        }]);
                    }).then(done).catch(done);
                });

                it('should remove flags from a message', (done) => {
                    imap.setFlags('inbox', '557', {
                        remove: ['\\Deleted']
                    }, {
                        byUid: true
                    }).then((result) => {
                        expect(result).to.deep.equal([{
                            '#': 5,
                            'flags': ['$MyFlag'],
                            'uid': 557
                        }]);
                    }).then(done).catch(done);
                });

                it('should not return anything on silent mode', (done) => {
                    imap.setFlags('inbox', '1', ['$MyFlag2'], {
                        silent: true
                    }).then((result) => {
                        expect(result).to.deep.equal([]);
                    }).then(done).catch(done);
                });
            });

            describe('#store', () => {
                it('should add labels for a message', (done) => {
                    imap.store('inbox', '1', '+X-GM-LABELS', ['\\Sent', '\\Junk']).then((result) => {
                        expect(result).to.deep.equal([{
                            '#': 1,
                            'x-gm-labels': ['\\Inbox', '\\Sent', '\\Junk']
                        }]);
                    }).then(done).catch(done);
                });

                it('should set labels for a message', (done) => {
                    imap.store('inbox', '1', 'X-GM-LABELS', ['\\Sent', '\\Junk']).then((result) => {
                        expect(result).to.deep.equal([{
                            '#': 1,
                            'x-gm-labels': ['\\Sent', '\\Junk']
                        }]);
                    }).then(done).catch(done);
                });

                it('should remove labels from a message', (done) => {
                    imap.store('inbox', '1', '-X-GM-LABELS', ['\\Sent', '\\Inbox']).then((result) => {
                        expect(result).to.deep.equal([{
                            '#': 1,
                            'x-gm-labels': []
                        }]);
                    }).then(done).catch(done);
                });
            });

            describe('#deleteMessages', () => {
                it('should delete a message', (done) => {
                    var initialInfo;

                    imap.selectMailbox('inbox').then((info) => {
                        initialInfo = info;
                        return imap.deleteMessages('inbox', 557, {
                            byUid: true
                        });
                    }).then(() => {
                        return imap.selectMailbox('inbox');
                    }).then((resultInfo) => {
                        expect(initialInfo.exists !== resultInfo.exists).to.be.true;
                    }).then(done).catch(done);
                });
            });

            describe('#copyMessages', () => {
                it('should copy a message', (done) => {
                    imap.copyMessages('inbox', 555, '[Gmail]/Trash', {
                        byUid: true
                    }).then(() => {
                        return imap.selectMailbox('[Gmail]/Trash');
                    }).then((info) => {
                        expect(info.exists).to.equal(1);
                    }).then(done).catch(done);
                });
            });

            describe('#moveMessages', () => {
                it('should move a message', (done) => {
                    var initialInfo;
                    imap.selectMailbox('inbox').then((info) => {
                        initialInfo = info;
                        return imap.moveMessages('inbox', 555, '[Gmail]/Spam', {
                            byUid: true
                        });
                    }).then(() => {
                        return imap.selectMailbox('[Gmail]/Spam');
                    }).then((info) => {
                        expect(info.exists).to.equal(1);
                        return imap.selectMailbox('inbox');
                    }).then((resultInfo) => {
                        expect(initialInfo.exists).to.not.equal(resultInfo.exists);
                    }).then(done).catch(done);
                });
            });
        });

        describe('Timeout', () => {

            beforeEach((done) => {
                imap = new BrowserBox('127.0.0.1', port, {
                    auth: {
                        user: "testuser",
                        pass: "testpass"
                    },
                    tcpSocket: {
                        useSecureTransport: false
                    }
                });

                imap.connect().then(done);
            });

            it('should timeout', (done) => {
                // remove the ondata event to simulate 100% packet loss and make the socket time out after 10ms
                imap.client.TIMEOUT_SOCKET_LOWER_BOUND = 10;
                imap.client.TIMEOUT_SOCKET_MULTIPLIER = 0;
                imap.client.socket.ondata = () => {};

                imap.onerror = () => {
                    done();
                };

                imap.selectMailbox('inbox');
            });
        });
    });
}));
