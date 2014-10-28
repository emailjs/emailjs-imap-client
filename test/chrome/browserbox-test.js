define(['chai', 'browserbox'], function(chai, BrowserBox) {
    'use strict';

    var expect = chai.expect;
    chai.Assertion.includeStack = true;

    describe('browserbox integration tests', function() {
        var imap, port = 10000;

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
                            console.log(initialInfo, resultInfo);
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