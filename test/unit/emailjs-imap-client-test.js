'use strict';

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['chai', 'emailjs-imap-client', 'emailjs-imap-handler', 'emailjs-mime-codec', './fixtures/mime-torture-bodystructure', './fixtures/envelope'], factory.bind(null, sinon));
    } else if (typeof exports === 'object') {
        module.exports = factory(require('sinon'), require('chai'), require('../../src/emailjs-imap-client'), require('emailjs-imap-handler'), require('emailjs-mime-codec'), require('./fixtures/mime-torture-bodystructure'), require('./fixtures/envelope'));
    }
}(function(sinon, chai, ImapClient, imapHandler, mimefuncs, mimeTorture, testEnvelope) {
    var expect = chai.expect;
    chai.config.includeStack = true;

    describe('browserbox unit tests', () => {
        var br;

        beforeEach(() => {
            br = new ImapClient();
            br.logLevel = br.LOG_LEVEL_NONE;
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

            it('should connect', (done) => {
                br.client.connect.returns(Promise.resolve());
                br.updateCapability.returns(Promise.resolve());
                br.upgradeConnection.returns(Promise.resolve());
                br.updateId.returns(Promise.resolve());
                br.login.returns(Promise.resolve());
                br.compressConnection.returns(Promise.resolve());

                br.connect().then(() => {
                    expect(br.client.connect.calledOnce).to.be.true;
                    expect(br.updateCapability.calledOnce).to.be.true;
                    expect(br.upgradeConnection.calledOnce).to.be.true;
                    expect(br.updateId.calledOnce).to.be.true;
                    expect(br.login.calledOnce).to.be.true;
                    expect(br.compressConnection.calledOnce).to.be.true;
                }).then(done).catch(done);

                setTimeout(() => br.client.onready(), 0);
            });

            it('should fail to login', (done) => {
                br.client.connect.returns(Promise.resolve());
                br.updateCapability.returns(Promise.resolve());
                br.upgradeConnection.returns(Promise.resolve());
                br.updateId.returns(Promise.resolve());
                br.login.returns(Promise.reject(new Error()));

                br.connect().catch((err) => {
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

                setTimeout(() => br.client.onready(), 0);
            });

            it('should timeout', (done) => {
                br.client.connect.returns(Promise.resolve());
                br.TIMEOUT_CONNECTION = 1;

                br.connect().catch((err) => {
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
            it('should force-close', (done) => {
                sinon.stub(br.client, 'close').returns(Promise.resolve());

                br.close().then(() => {
                    expect(br._state).to.equal(br.STATE_LOGOUT);
                    expect(br.client.close.calledOnce).to.be.true;
                    done();
                });
            });
        });

        describe('#exec', () => {
            beforeEach(() => {
                sinon.stub(br, 'breakIdle');
            });

            it('should send string command', (done) => {
                sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({}));
                br.exec('TEST').then((res) => {
                    expect(res).to.deep.equal({});
                    expect(br.client.enqueueCommand.args[0][0]).to.equal('TEST');
                }).then(done).catch(done);
            });

            it('should update capability from response', (done) => {
                sinon.stub(br.client, 'enqueueCommand').returns(Promise.resolve({
                    capability: ['A', 'B']
                }));
                br.exec('TEST').then((res) => {
                    expect(res).to.deep.equal({
                        capability: ['A', 'B']
                    });
                    expect(br._capability).to.deep.equal(['A', 'B']);
                }).then(done).catch(done);
            });
        });

        describe('#enterIdle', () => {
            it('should periodically send NOOP if IDLE not supported', (done) => {
                sinon.stub(br, 'exec', (command) => {
                    expect(command).to.equal('NOOP');

                    done();
                });

                br._capability = [];
                br.TIMEOUT_NOOP = 1;
                br.enterIdle();
            });

            it('should break IDLE after timeout', (done) => {
                sinon.stub(br.client, 'enqueueCommand');
                sinon.stub(br.client.socket, 'send', (payload) => {

                    expect(br.client.enqueueCommand.args[0][0].command).to.equal('IDLE');
                    expect([].slice.call(new Uint8Array(payload))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]);

                    done();
                });

                br._capability = ['IDLE'];
                br.TIMEOUT_IDLE = 1;
                br.enterIdle();
            });
        });

        describe('#breakIdle', () => {
            it('should send DONE to socket', (done) => {
                sinon.stub(br.client.socket, 'send');

                br._enteredIdle = 'IDLE';
                br.breakIdle();
                expect([].slice.call(new Uint8Array(br.client.socket.send.args[0][0]))).to.deep.equal([0x44, 0x4f, 0x4e, 0x45, 0x0d, 0x0a]);
                done();
            });
        });

        describe('#upgradeConnection', () => {
            it('should do nothing if already secured', (done) => {
                br.client.secureMode = true;
                br._capability = ['starttls'];
                br.upgradeConnection().then(done).catch(done);
            });

            it('should do nothing if STARTTLS not available', (done) => {
                br.client.secureMode = false;
                br._capability = [];
                br.upgradeConnection().then(done).catch(done);
            });

            it('should run STARTTLS', (done) => {
                sinon.stub(br.client, 'upgrade');
                sinon.stub(br, 'exec').withArgs('STARTTLS').returns(Promise.resolve());
                sinon.stub(br, 'updateCapability').returns(Promise.resolve());

                br._capability = ['STARTTLS'];

                br.upgradeConnection().then(() => {
                    expect(br.client.upgrade.callCount).to.equal(1);
                    expect(br._capability.length).to.equal(0);
                }).then(done).catch(done);
            });

        });

        describe('#updateCapability', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
            });

            it('should do nothing if capability is set', (done) => {
                br._capability = ['abc'];
                br.updateCapability().then(done).catch(done);
            });

            it('should run CAPABILITY if capability not set', (done) => {
                br.exec.returns(Promise.resolve());

                br._capability = [];

                br.updateCapability().then(() => {
                    expect(br.exec.args[0][0]).to.equal('CAPABILITY');
                }).then(done).catch(done);
            });

            it('should force run CAPABILITY', (done) => {
                br.exec.returns(Promise.resolve());
                br._capability = ['abc'];

                br.updateCapability(true).then(() => {
                    expect(br.exec.args[0][0]).to.equal('CAPABILITY');
                }).then(done).catch(done);
            });

            it('should do nothing if connection is not yet upgraded', (done) => {
                br._capability = [];
                br.client.secureMode = false;
                br.options.requireTLS = true;

                br.updateCapability().then(done).catch(done);
            });
        });

        describe('#listNamespaces', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
            });

            it('should run NAMESPACE if supported', (done) => {
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
                }));
                br._capability = ['NAMESPACE'];

                br.listNamespaces().then((namespaces) => {
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

            it('should do nothing if not supported', (done) => {
                br._capability = [];
                br.listNamespaces().then((namespaces) => {
                    expect(namespaces).to.be.false;
                    expect(br.exec.callCount).to.equal(0);
                }).then(done).catch(done);
            });
        });

        describe('#compressConnection', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
                sinon.stub(br.client, 'enableCompression');
            });

            it('should run COMPRESS=DEFLATE if supported', (done) => {
                br.exec.withArgs({
                    command: 'COMPRESS',
                    attributes: [{
                        type: 'ATOM',
                        value: 'DEFLATE'
                    }]
                }).returns(Promise.resolve({}));

                br.options.enableCompression = true;
                br._capability = ['COMPRESS=DEFLATE'];
                br.compressConnection().then(() => {
                    expect(br.exec.callCount).to.equal(1);
                    expect(br.client.enableCompression.callCount).to.equal(1);
                }).then(done).catch(done);
            });

            it('should do nothing if not supported', (done) => {
                br._capability = [];

                br.compressConnection().then(() => {
                    expect(br.exec.callCount).to.equal(0);
                }).then(done).catch(done);
            });

            it('should do nothing if not enabled', (done) => {
                br.options.enableCompression = false;
                br._capability = ['COMPRESS=DEFLATE'];

                br.compressConnection().then(() => {
                    expect(br.exec.callCount).to.equal(0);
                }).then(done).catch(done);
            });
        });

        describe('#login', () => {
            it('should call LOGIN', (done) => {
                sinon.stub(br, 'exec').returns(Promise.resolve({}));
                sinon.stub(br, 'updateCapability').returns(Promise.resolve(true));

                br.login({
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

                    done();
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

            it('should not nothing if not supported', (done) => {
                br._capability = [];

                br.updateId({
                    a: 'b',
                    c: 'd'
                }).then(() => {
                    expect(br.serverId).to.be.false;
                }).then(done).catch(done);
            });

            it('should send NIL', (done) => {
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
                }));
                br._capability = ['ID'];

                br.updateId(null).then(() => {
                    expect(br.serverId).to.deep.equal({});
                }).then(done).catch(done);
            });

            it('should exhange ID values', (done) => {
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
                }));
                br._capability = ['ID'];

                br.updateId({
                    ckey1: 'cval1',
                    ckey2: 'cval2'
                }).then(() => {
                    expect(br.serverId).to.deep.equal({
                        skey1: 'sval1',
                        skey2: 'sval2'
                    });
                }).then(done).catch(done);
            });
        });

        describe('#listMailboxes', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
            });

            it('should call LIST and LSUB in sequence', (done) => {
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

                br.listMailboxes().then((tree) => {
                    expect(tree).to.exist;
                }).then(done).catch(done);
            });

            it('should not die on NIL separators', (done) => {
                br.exec.withArgs({
                    command: 'LIST',
                    attributes: ['', '*']
                }).returns(Promise.resolve({
                    payload: {
                        LIST: [
                            imapHandler.parser(mimefuncs.toTypedArray('* LIST (\\NoInferiors) NIL "INBOX"'))
                        ]
                    }
                }));

                br.exec.withArgs({
                    command: 'LSUB',
                    attributes: ['', '*']
                }).returns(Promise.resolve({
                    payload: {
                        LSUB: [
                            imapHandler.parser(mimefuncs.toTypedArray('* LSUB (\\NoInferiors) NIL "INBOX"'))
                        ]
                    }
                }));

                br.listMailboxes().then((tree) => {
                    expect(tree).to.exist;
                }).then(done).catch(done);
            });
        });

        describe('#createMailbox', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
            });

            it('should call CREATE with a string payload', (done) => {
                // The spec allows unquoted ATOM-style syntax too, but for
                // simplicity we always generate a string even if it could be
                // expressed as an atom.
                br.exec.withArgs({
                    command: 'CREATE',
                    attributes: ['mailboxname']
                }).returns(Promise.resolve());

                br.createMailbox('mailboxname').then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });

            it('should call mutf7 encode the argument', (done) => {
                // From RFC 3501
                br.exec.withArgs({
                    command: 'CREATE',
                    attributes: ['~peter/mail/&U,BTFw-/&ZeVnLIqe-']
                }).returns(Promise.resolve());

                br.createMailbox('~peter/mail/\u53f0\u5317/\u65e5\u672c\u8a9e').then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });

            it('should treat an ALREADYEXISTS response as success', (done) => {
                var fakeErr = {
                    code: 'ALREADYEXISTS'
                };
                br.exec.withArgs({
                    command: 'CREATE',
                    attributes: ['mailboxname']
                }).returns(Promise.reject(fakeErr));

                br.createMailbox('mailboxname').then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#listMessages', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
                sinon.stub(br, '_buildFETCHCommand');
                sinon.stub(br, '_parseFETCH');
            });

            it('should call FETCH', (done) => {
                br.exec.returns(Promise.resolve('abc'));
                br._buildFETCHCommand.withArgs(['1:2', ['uid', 'flags'], {
                    byUid: true
                }]).returns({});

                br.listMessages('INBOX', '1:2', ['uid', 'flags'], {
                    byUid: true
                }).then(() => {
                    expect(br._buildFETCHCommand.callCount).to.equal(1);
                    expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#search', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
                sinon.stub(br, '_buildSEARCHCommand');
                sinon.stub(br, '_parseSEARCH');
            });

            it('should call SEARCH', (done) => {
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
                }).then(() => {
                    expect(br._buildSEARCHCommand.callCount).to.equal(1);
                    expect(br.exec.callCount).to.equal(1);
                    expect(br._parseSEARCH.withArgs('abc').callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#upload', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
            });

            it('should call APPEND with custom flag', (done) => {
                br.exec.returns(Promise.resolve());

                br.upload('mailbox', 'this is a message', {
                    flags: ['\\$MyFlag']
                }).then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });

            it('should call APPEND w/o flags', (done) => {
                br.exec.returns(Promise.resolve());

                br.upload('mailbox', 'this is a message').then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#setFlags', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
                sinon.stub(br, '_buildSTORECommand');
                sinon.stub(br, '_parseFETCH');
            });

            it('should call STORE', (done) => {
                br.exec.returns(Promise.resolve('abc'));
                br._buildSTORECommand.withArgs('1:2','FLAGS',['\\Seen', '$MyFlag'], {
                    byUid: true
                }).returns({});

                br.setFlags('INBOX', '1:2', ['\\Seen', '$MyFlag'], {
                    byUid: true
                }).then(() => {
                    expect(br.exec.callCount).to.equal(1);
                    expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#store', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
                sinon.stub(br, '_buildSTORECommand');
                sinon.stub(br, '_parseFETCH');
            });

            it('should call STORE', (done) => {
                br.exec.returns(Promise.resolve('abc'));
                br._buildSTORECommand.withArgs('1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
                    byUid: true
                }).returns({});

                br.store('INBOX', '1:2', '+X-GM-LABELS', ['\\Sent', '\\Junk'], {
                    byUid: true
                }).then(() => {
                    expect(br._buildSTORECommand.callCount).to.equal(1);
                    expect(br.exec.callCount).to.equal(1);
                    expect(br._parseFETCH.withArgs('abc').callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#deleteMessages', () => {
            beforeEach(() => {
                sinon.stub(br, 'setFlags');
                sinon.stub(br, 'exec');
            });

            it('should call UID EXPUNGE', (done) => {
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
                }).then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });

            it('should call EXPUNGE', (done) => {
                br.exec.withArgs('EXPUNGE').returns(Promise.resolve('abc'));
                br.setFlags.withArgs('INBOX', '1:2', {
                    add: '\\Deleted'
                }).returns(Promise.resolve());

                br._capability = [];
                br.deleteMessages('INBOX', '1:2', {
                    byUid: true
                }).then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#copyMessages', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
            });

            it('should call COPY', (done) => {
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
                }).then((response) => {
                    expect(response).to.equal('abc');
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });
        });

        describe('#moveMessages', () => {
            beforeEach(() => {
                sinon.stub(br, 'exec');
                sinon.stub(br, 'copyMessages');
                sinon.stub(br, 'deleteMessages');
            });

            it('should call MOVE if supported', (done) => {
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
                }).then(() => {
                    expect(br.exec.callCount).to.equal(1);
                }).then(done).catch(done);
            });

            it('should fallback to copy+expunge', (done) => {
                br.copyMessages.withArgs('INBOX', '1:2', '[Gmail]/Trash', {
                    byUid: true
                }).returns(Promise.resolve());
                br.deleteMessages.withArgs('1:2', {
                    byUid: true
                }).returns(Promise.resolve());

                br._capability = [];
                br.moveMessages('INBOX', '1:2', '[Gmail]/Trash', {
                    byUid: true
                }).then(() => {
                    expect(br.deleteMessages.callCount).to.equal(1);
                }).then(done).catch(done);
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
            beforeEach(() => {
                sinon.stub(br, 'exec');
                sinon.stub(br, '_parseSELECT');
            });

            it('should run SELECT', (done) => {
                br.exec.withArgs({
                    command: 'SELECT',
                    attributes: [{
                        type: 'STRING',
                        value: '[Gmail]/Trash'
                    }]
                }).returns(Promise.resolve('abc'));

                br.selectMailbox('[Gmail]/Trash').then(() => {
                    expect(br.exec.callCount).to.equal(1);
                    expect(br._parseSELECT.withArgs('abc').callCount).to.equal(1);
                    expect(br._state).to.equal(br.STATE_SELECTED);
                }).then(done).catch(done);
            });

            it('should run SELECT with CONDSTORE', (done) => {
                br.exec.withArgs({
                    command: 'SELECT',
                    attributes: [{
                            type: 'STRING',
                            value: '[Gmail]/Trash'
                        },
                        [{
                            type: 'ATOM',
                            value: 'CONDSTORE'
                        }]
                    ]
                }).returns(Promise.resolve('abc'));

                br._capability = ['CONDSTORE'];
                br.selectMailbox('[Gmail]/Trash', {
                    condstore: true
                }).then(() => {
                    expect(br.exec.callCount).to.equal(1);
                    expect(br._parseSELECT.withArgs('abc').callCount).to.equal(1);
                    expect(br._state).to.equal(br.STATE_SELECTED);
                }).then(done).catch(done);
            });

            describe('should emit onselectmailbox before selectMailbox is resolved', () => {
                beforeEach(() => {
                    br.exec.returns(Promise.resolve('abc'));
                    br._parseSELECT.withArgs('abc').returns('def');
                });

                it('when it returns a promise', (done) => {
                    var promiseResolved = false;
                    br.onselectmailbox = () => new Promise((resolve) => {
                        resolve();
                        promiseResolved = true;
                    });
                    var onselectmailboxSpy = sinon.spy(br, "onselectmailbox");
                    br.selectMailbox('[Gmail]/Trash').then(() => {
                        expect(br._parseSELECT.callCount).to.equal(1);
                        expect(onselectmailboxSpy.withArgs('[Gmail]/Trash', 'def').callCount).to.equal(1);
                        expect(promiseResolved).to.equal(true);
                        done();
                    }).catch(done);
                });

                it('when it does not return a promise', (done) => {
                    br.onselectmailbox = () => {};
                    var onselectmailboxSpy = sinon.spy(br, "onselectmailbox");
                    br.selectMailbox('[Gmail]/Trash').then(() => {
                        expect(br._parseSELECT.callCount).to.equal(1);
                        expect(onselectmailboxSpy.withArgs('[Gmail]/Trash', 'def').callCount).to.equal(1);
                        done();
                    }).catch(done);
                });
            });

            it('should emit onclosemailbox', (done) => {
                br.exec.returns(Promise.resolve('abc'));
                br._parseSELECT.withArgs('abc').returns('def');

                br.onclosemailbox = (path) => expect(path).to.equal('yyy');

                br._selectedMailbox = 'yyy';
                br.selectMailbox('[Gmail]/Trash').then(() => {
                    expect(br._parseSELECT.callCount).to.equal(1);
                }).then(done).catch(done);
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

        describe('#_untaggedFetchHandler', () => {
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

        describe('#_parseSELECT', () => {
            it('should parse a complete response', () => {
                expect(br._parseSELECT({
                    code: 'READ-WRITE',
                    payload: {
                        EXISTS: [{
                            nr: 123
                        }],
                        FLAGS: [{
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: '\\Answered'
                                }, {
                                    type: 'ATOM',
                                    value: '\\Flagged'
                                }]
                            ]
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

            it('should parse response with no modseq', () => {
                expect(br._parseSELECT({
                    code: 'READ-WRITE',
                    payload: {
                        EXISTS: [{
                            nr: 123
                        }],
                        FLAGS: [{
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: '\\Answered'
                                }, {
                                    type: 'ATOM',
                                    value: '\\Flagged'
                                }]
                            ]
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

            it('should parse response with read-only', () => {
                expect(br._parseSELECT({
                    code: 'READ-ONLY',
                    payload: {
                        EXISTS: [{
                            nr: 123
                        }],
                        FLAGS: [{
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: '\\Answered'
                                }, {
                                    type: 'ATOM',
                                    value: '\\Flagged'
                                }]
                            ]
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

            it('should parse response with NOMODSEQ flag', () => {
                expect(br._parseSELECT({
                    code: 'READ-WRITE',
                    payload: {
                        EXISTS: [{
                            nr: 123
                        }],
                        FLAGS: [{
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: '\\Answered'
                                }, {
                                    type: 'ATOM',
                                    value: '\\Flagged'
                                }]
                            ]
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

        describe('#_parseNAMESPACE', () => {
            it('should not succeed for no namespace response', () => {
                expect(br._parseNAMESPACE({
                    payload: {
                        NAMESPACE: []
                    }
                })).to.be.false;
            });

            it('should return single personal namespace', () => {
                expect(br._parseNAMESPACE({
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
                })).to.deep.equal({
                    personal: [{
                        prefix: 'INBOX.',
                        delimiter: '.'
                    }],
                    users: false,
                    shared: false
                });
            });

            it('should return single personal, single users, multiple shared', () => {
                expect(br._parseNAMESPACE({
                    payload: {
                        NAMESPACE: [{
                            attributes: [
                                // personal
                                [
                                    [{
                                        type: 'STRING',
                                        value: ''
                                    }, {
                                        type: 'STRING',
                                        value: '/'
                                    }]
                                ],
                                // users
                                [
                                    [{
                                        type: 'STRING',
                                        value: '~'
                                    }, {
                                        type: 'STRING',
                                        value: '/'
                                    }]
                                ],
                                // shared
                                [
                                    [{
                                        type: 'STRING',
                                        value: '#shared/'
                                    }, {
                                        type: 'STRING',
                                        value: '/'
                                    }],
                                    [{
                                        type: 'STRING',
                                        value: '#public/'
                                    }, {
                                        type: 'STRING',
                                        value: '/'
                                    }]
                                ]
                            ]
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

            it('should handle NIL namespace hierarchy delim', () => {
                expect(br._parseNAMESPACE({
                    payload: {
                        NAMESPACE: [
                            // This specific value is returned by yahoo.co.jp's
                            // imapgate version 0.7.68_11_1.61475 IMAP server
                            imapHandler.parser(mimefuncs.toTypedArray('* NAMESPACE (("" NIL)) NIL NIL'))
                        ]
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

        describe('#_buildFETCHCommand', () => {
            it('should build single ALL', () => {
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

            it('should build FETCH with uid', () => {
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

            it('should build FETCH with uid, envelope', () => {
                expect(br._buildFETCHCommand('1:*', ['uid', 'envelope'], {})).to.deep.equal({
                    command: 'FETCH',
                    attributes: [{
                            type: 'SEQUENCE',
                            value: '1:*'
                        },
                        [{
                            type: 'ATOM',
                            value: 'UID'
                        }, {
                            type: 'ATOM',
                            value: 'ENVELOPE'
                        }]
                    ]
                });
            });

            it('should build FETCH with modseq', () => {
                expect(br._buildFETCHCommand('1:*', ['modseq (1234567)'], {})).to.deep.equal({
                    command: 'FETCH',
                    attributes: [{
                            type: 'SEQUENCE',
                            value: '1:*'
                        },
                        [{
                                type: 'ATOM',
                                value: 'MODSEQ'
                            },
                            [{
                                type: 'ATOM',
                                value: '1234567'
                            }]
                        ]
                    ]
                });
            });

            it('should build FETCH with section', () => {
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

            it('should build FETCH with section and list', () => {
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
                            },
                            [{
                                type: 'ATOM',
                                value: 'DATE'
                            }, {
                                type: 'ATOM',
                                value: 'IN-REPLY-TO'
                            }]
                        ]
                    }]
                });
            });

            it('should build FETCH with ', () => {
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
                        },
                        [{
                            type: 'ATOM',
                            value: 'CHANGEDSINCE'
                        }, {
                            type: 'ATOM',
                            value: '123456'
                        }]
                    ]
                });
            });

            it('should build FETCH with partial', () => {
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

            it('should build FETCH with the valueAsString option', () => {
                expect(br._buildFETCHCommand('1:*', ['body[]'], {valueAsString: false})).to.deep.equal({
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

        describe('#_parseFETCH', () => {
            it('should return values lowercase keys', () => {
                sinon.stub(br, '_parseFetchValue').returns('def');
                expect(br._parseFETCH({
                    payload: {
                        FETCH: [{
                            nr: 123,
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: 'BODY',
                                    section: [{
                                            type: 'ATOM',
                                            value: 'HEADER'
                                        },
                                        [{
                                            type: 'ATOM',
                                            value: 'DATE'
                                        }, {
                                            type: 'ATOM',
                                            value: 'SUBJECT'
                                        }]
                                    ],
                                    partial: [0, 123]
                                }, {
                                    type: 'ATOM',
                                    value: 'abc'
                                }]
                            ]
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

            it('should merge multiple responses based on sequence number', () => {
                expect(br._parseFETCH({
                    payload: {
                        FETCH: [{
                            nr: 123,
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: 'UID'
                                }, {
                                    type: 'ATOM',
                                    value: 789
                                }]
                            ]
                        }, {
                            nr: 124,
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: 'UID'
                                }, {
                                    type: 'ATOM',
                                    value: 790
                                }]
                            ]
                        }, {
                            nr: 123,
                            attributes: [
                                [{
                                    type: 'ATOM',
                                    value: 'MODSEQ'
                                }, {
                                    type: 'ATOM',
                                    value: '127'
                                }]
                            ]
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

        describe('#_parseENVELOPE', () => {
            it('should parsed envelope object', () => {
                expect(br._parseENVELOPE(testEnvelope.source)).to.deep.equal(testEnvelope.parsed);
            });
        });

        describe('#_parseBODYSTRUCTURE', () => {
            it('should parse bodystructure object', () => {
                expect(br._parseBODYSTRUCTURE(mimeTorture.source)).to.deep.equal(mimeTorture.parsed);
            });

            it('should parse bodystructure with unicode filename', () => {
                var input = [
                    [{
                            type: 'STRING',
                            value: 'APPLICATION'
                        }, {
                            type: 'STRING',
                            value: 'OCTET-STREAM'
                        },
                        null,
                        null,
                        null, {
                            type: 'STRING',
                            value: 'BASE64'
                        }, {
                            type: 'ATOM',
                            value: '40'
                        },
                        null, [{
                                type: 'STRING',
                                value: 'ATTACHMENT'
                            },
                            [{
                                type: 'STRING',
                                value: 'FILENAME'
                            }, {
                                type: 'STRING',
                                value: '=?ISO-8859-1?Q?BBR_Handel,_Gewerbe,_B=FCrobetriebe,?= =?ISO-8859-1?Q?_private_Bildungseinrichtungen.txt?='
                            }]
                        ],
                        null
                    ], {
                        type: 'STRING',
                        value: 'MIXED'
                    },
                    [{
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '----sinikael-?=_1-14105085265110.49903922458179295'
                    }],
                    null,
                    null
                ];

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

        describe('#_buildSEARCHCommand', () => {
            it('should compose a search command', () => {
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

            it('should compose an unicode search command', () => {
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

        describe('#_parseSEARCH', () => {
            it('should parse SEARCH response', () => {
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

            it('should parse empty SEARCH response', () => {
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

        describe('#_buildSTORECommand', () => {
            it('should compose a store command from an array', () => {
                expect(br._buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {})).to.deep.equal({
                    command: 'STORE',
                    attributes: [{
                            'type': 'sequence',
                            'value': '1,2,3'
                        }, {
                            'type': 'atom',
                            'value': 'FLAGS'
                        },
                        [{
                            'type': 'atom',
                            'value': 'a'
                        }, {
                            'type': 'atom',
                            'value': 'b'
                        }]
                    ]
                });
            });

            it('should compose a store set flags command', () => {
                expect(br._buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {})).to.deep.equal({
                    command: 'STORE',
                    attributes: [{
                            'type': 'sequence',
                            'value': '1,2,3'
                        }, {
                            'type': 'atom',
                            'value': 'FLAGS'
                        },
                        [{
                            'type': 'atom',
                            'value': 'a'
                        }, {
                            'type': 'atom',
                            'value': 'b'
                        }]
                    ]
                });
            });

            it('should compose a store add flags command', () => {
                expect(br._buildSTORECommand('1,2,3', '+FLAGS', ['a', 'b'], {})).to.deep.equal({
                    command: 'STORE',
                    attributes: [{
                            'type': 'sequence',
                            'value': '1,2,3'
                        }, {
                            'type': 'atom',
                            'value': '+FLAGS'
                        },
                        [{
                            'type': 'atom',
                            'value': 'a'
                        }, {
                            'type': 'atom',
                            'value': 'b'
                        }]
                    ]
                });
            });

            it('should compose a store remove flags command', () => {
                expect(br._buildSTORECommand('1,2,3', '-FLAGS', ['a', 'b'], {})).to.deep.equal({
                    command: 'STORE',
                    attributes: [{
                            'type': 'sequence',
                            'value': '1,2,3'
                        }, {
                            'type': 'atom',
                            'value': '-FLAGS'
                        },
                        [{
                            'type': 'atom',
                            'value': 'a'
                        }, {
                            'type': 'atom',
                            'value': 'b'
                        }]
                    ]
                });
            });

            it('should compose a store remove silent flags command', () => {
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
                        },
                        [{
                            'type': 'atom',
                            'value': 'a'
                        }, {
                            'type': 'atom',
                            'value': 'b'
                        }]
                    ]
                });
            });

            it('should compose a uid store flags command', () => {
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
                        },
                        [{
                            'type': 'atom',
                            'value': 'a'
                        }, {
                            'type': 'atom',
                            'value': 'b'
                        }]
                    ]
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
                br._state = br.STATE_SELECTED;
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

        describe('#_checkSpecialUse', () => {
            it('should return a matching special use flag', () => {
                expect(br._checkSpecialUse({
                    flags: ['test', '\\All']
                })).to.equal('\\All');

            });

            it('should fail for non-existent flag', () => {
                expect(false, br._checkSpecialUse({}));
            });

            it('should fail for invalid flag', () => {
                expect(br._checkSpecialUse({
                    flags: ['test']
                })).to.be.false;
            });

            it('should return special use flag if a matching name is found', () => {
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

            it('should prefer matching special use flag over a matching name', () => {
                expect(br._checkSpecialUse({
                    flags: ['\\All'],
                    name: 'Praht'
                })).to.equal('\\All');
            });
        });

        describe('#_buildXOAuth2Token', () => {
            it('should return base64 encoded XOAUTH2 token', () => {
                expect(br._buildXOAuth2Token('user@host', 'abcde')).to.equal('dXNlcj11c2VyQGhvc3QBYXV0aD1CZWFyZXIgYWJjZGUBAQ==');
            });
        });

        describe('untagged updates', () => {
            it('should receive information about untagged exists', (done) => {
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

            it('should receive information about untagged expunge', (done) => {
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

            it('should receive information about untagged fetch', (done) => {
                br.client._connectionReady = true;
                br._selectedMailbox = 'FOO';
                br.onupdate = (path, type, value) => {
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
    });
}));
