'use strict';

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['chai', 'axe', 'browserbox-imap', 'mimefuncs'], factory.bind(null, sinon));
    } else if (typeof exports === 'object') {
        module.exports = factory(require('sinon'), require('chai'), require('axe-logger'), require('browserbox-imap'), require('mimefuncs'));
    }
}(function(sinon, chai, axe, ImapClient, mimefuncs) {
    var expect = chai.expect;
    chai.Assertion.includeStack = true;

    var host = 'localhost';
    var port = 10000;

    describe('browserbox imap unit tests', function() {
        // don't log in the tests
        axe.removeAppender(axe.defaultAppender);

        var client, TCPSocket, openStub, socketStub;

        /* jshint indent:false */

        beforeEach(function() {
            client = new ImapClient(host, port);
            expect(client).to.exist;

            TCPSocket = client._TCPSocket = function() {};

            TCPSocket.open = function() {};
            TCPSocket.prototype.close = function() {};
            TCPSocket.prototype.send = function() {};
            TCPSocket.prototype.suspend = function() {};
            TCPSocket.prototype.resume = function() {};
            TCPSocket.prototype.upgradeToSecure = function() {};

            socketStub = sinon.createStubInstance(TCPSocket);
            openStub = sinon.stub(TCPSocket, 'open');

            openStub.withArgs(host, port).returns(socketStub);

            client.connect();

            expect(openStub.callCount).to.equal(1);
            expect(socketStub.onerror).to.exist;
            expect(socketStub.onopen).to.exist;
        });

        afterEach(function() {
            TCPSocket.open.restore();
        });

        describe('#connect', function() {
            it('should not throw', function() {
                var client = new ImapClient(host, port);
                client._TCPSocket = {
                    open: function() {
                        var socket = {
                            onopen: function() {},
                            onerror: function() {}
                        };
                        // disallow setting new properties (eg. oncert)
                        Object.preventExtensions(socket);
                        return socket;
                    }
                };
                client.connect();
            });
        });

        describe('#close', function() {
            it('should call socket.close', function() {
                client.socket.readyState = 'open';

                client.close();

                expect(client.socket.close.callCount).to.equal(1);
            });

            it('should call _destroy if closed', function() {
                sinon.stub(client, '_destroy');

                client.socket.readyState = false;
                client.close();

                expect(client._destroy.callCount).to.equal(1);

                client._destroy.restore();
            });
        });

        describe('#upgrade', function() {
            it('should upgrade socket', function(done) {
                client.secureMode = false;
                client.upgrade(function(err, upgraded) {
                    expect(err).to.not.exist;
                    expect(upgraded).to.be.true;
                    done();
                });
            });

            it('should not upgrade socket', function(done) {
                client.secureMode = true;
                client.upgrade(function(err, upgraded) {
                    expect(err).to.not.exist;
                    expect(upgraded).to.be.false;
                    done();
                });
            });
        });

        describe('#exec', function() {
            it('should add command to queue', function() {
                sinon.stub(client, '_addToClientQueue');

                client.exec('a', 'b', 'c', 'd');

                expect(client._addToClientQueue.withArgs({
                    command: 'a'
                }, 'b', 'c', 'd').callCount).to.equal(1);

                client._addToClientQueue.restore();
            });
        });

        describe('#setHandler', function() {
            it('should set global handler for keyword', function() {
                var handler = function() {};
                client.setHandler('fetch', handler);

                expect(client._globalAcceptUntagged.FETCH).to.equal(handler);
            });
        });

        describe('#_onError', function() {
            it('should emit error and close connection', function() {
                sinon.stub(client, 'onerror');
                sinon.stub(client, 'close');

                client._onError({
                    data: new Error('err')
                });

                expect(client.onerror.callCount).to.equal(1);
                expect(client.onerror.args[0][0]).to.exist;
                expect(client.close.callCount).to.equal(1);

                client.onerror.restore();
                client.close.restore();
            });
        });

        describe('#_destroy', function() {
            it('should emit onclose', function() {
                sinon.stub(client, 'onclose');

                client.destroyed = false;
                client._destroy();

                expect(client.onclose.callCount).to.equal(1);

                client.onclose.restore();
            });

            it('should not emit onclose', function() {
                sinon.stub(client, 'onclose');

                client.destroyed = true;
                client._destroy();

                expect(client.onclose.callCount).to.equal(0);

                client.onclose.restore();
            });
        });

        describe('#_onClose', function() {
            it('should call _destroy', function() {
                sinon.stub(client, '_destroy');

                client._onClose();

                expect(client._destroy.callCount).to.equal(1);

                client._destroy.restore();
            });
        });

        describe('#_onDrain', function() {
            it('should emit ondrain', function() {
                sinon.stub(client, 'ondrain');

                client._onDrain();

                expect(client.ondrain.callCount).to.equal(1);

                client.ondrain.restore();
            });
        });

        describe('#_onData', function() {
            it('should process normal input', function() {
                var list = [
                        '* 1 FETCH (UID 1)',
                        '* 2 FETCH (UID 2)',
                        '* 3 FETCH (UID 3)',
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', function(cmd) {
                    expect(list[pos++]).to.equal(cmd);
                });

                for (var i = 0; i < list.length; i++) {
                    client._onData({
                        data: mimefuncs.toTypedArray(list[i] + '\r\n').buffer
                    });
                }

                client._addToServerQueue.restore();
            });

            it('should process chunked input', function() {
                var input = ['* 1 FETCH (UID 1)\r\n* 2 F', 'ETCH (UID 2)\r\n* 3 FETCH (UID 3', ')\r\n'];

                var output = [
                        '* 1 FETCH (UID 1)',
                        '* 2 FETCH (UID 2)',
                        '* 3 FETCH (UID 3)'
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', function(cmd) {
                    expect(output[pos++]).to.equal(cmd);
                });

                for (var i = 0; i < input.length; i++) {
                    client._onData({
                        data: mimefuncs.toTypedArray(input[i]).buffer
                    });
                }

                client._addToServerQueue.restore();
            });

            it('should process split input', function() {
                var input = ['* 1 ', 'F', 'ETCH (', 'UID 1)', '\r', '\n'];

                var output = [
                        '* 1 FETCH (UID 1)'
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', function(cmd) {
                    expect(output[pos++]).to.equal(cmd);
                });

                for (var i = 0; i < input.length; i++) {
                    client._onData({
                        data: mimefuncs.toTypedArray(input[i]).buffer
                    });
                }

                client._addToServerQueue.restore();
            });

            it('chould process chunked literals', function() {
                var input = [
                    '* 1 FETCH (UID {1}\r\n1)\r\n* 2 FETCH (UID {4}\r\n2345)\r\n* 3 FETCH (UID {4}', '\r\n3789)\r\n'
                ];

                var output = [
                        '* 1 FETCH (UID {1}\r\n1)',
                        '* 2 FETCH (UID {4}\r\n2345)',
                        '* 3 FETCH (UID {4}\r\n3789)'
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', function(cmd) {
                    expect(output[pos++]).to.equal(cmd);
                });

                for (var i = 0; i < input.length; i++) {
                    client._onData({
                        data: mimefuncs.toTypedArray(input[i]).buffer
                    });
                }

                client._addToServerQueue.restore();
            });
        });

        describe('#_addToServerQueue', function() {
            it('should only push', function() {
                sinon.stub(client, '_processServerQueue');

                client._processingServerData = true;
                client._serverQueue = [];
                client._addToServerQueue('abc');

                expect(client._serverQueue).to.deep.equal(['abc']);
                expect(client._processServerQueue.callCount).to.equal(0);

                client._processServerQueue.restore();
            });

            it('should push and run', function() {
                sinon.stub(client, '_processServerQueue');

                client._processingServerData = false;
                client._serverQueue = [];
                client._addToServerQueue('abc');

                expect(client._serverQueue).to.deep.equal(['abc']);
                expect(client._processServerQueue.callCount).to.equal(1);

                client._processServerQueue.restore();
            });
        });

        describe('#_processServerQueue', function() {
            it('should process a tagged item from the queue', function(done) {
                var ref = client._processServerQueue.bind(client);

                sinon.stub(client, '_sendRequest');

                sinon.stub(client, '_processServerResponse', function(response, callback) {
                    expect(response).to.deep.equal({
                        tag: 'OK',
                        command: 'Hello',
                        attributes: [{
                            type: 'ATOM',
                            value: 'world!'
                        }]
                    });
                    return callback();
                });

                sinon.stub(client, '_processServerQueue', function() {

                    expect(client._sendRequest.callCount).to.equal(1);
                    expect(client._processServerResponse.callCount).to.equal(1);

                    client._sendRequest.restore();
                    client._processServerResponse.restore();
                    client._processServerQueue.restore();
                    done();
                });

                client._serverQueue = ['OK Hello world!'];
                ref();
            });

            it('should process an untagged item from the queue', function(done) {
                var ref = client._processServerQueue.bind(client);

                sinon.stub(client, '_sendRequest');

                sinon.stub(client, '_processServerResponse', function(response, callback) {
                    expect(response).to.deep.equal({
                        tag: '*',
                        command: 'EXISTS',
                        attributes: [],
                        nr: 1
                    });
                    return callback();
                });

                sinon.stub(client, '_processServerQueue', function() {

                    expect(client._sendRequest.callCount).to.equal(1);
                    expect(client._processServerResponse.callCount).to.equal(1);

                    client._sendRequest.restore();
                    client._processServerResponse.restore();
                    client._processServerQueue.restore();
                    done();
                });

                client._serverQueue = ['* 1 EXISTS'];
                ref();
            });

            it('should process a plus tagged item from the queue', function(done) {
                var ref = client._processServerQueue.bind(client);
                sinon.stub(client, 'send');

                sinon.stub(client, '_processServerQueue', function() {

                    expect(client.send.withArgs('literal data\r\n').callCount).to.equal(1);

                    client._processServerQueue.restore();
                    client.send.restore();
                    done();
                });

                client._currentCommand = {
                    data: ['literal data']
                };
                client._serverQueue = ['+ Please continue'];
                ref();
            });
        });

        describe('#_processServerResponse', function() {
            it('should invoke global handler by default', function() {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = function() {};
                sinon.stub(client._globalAcceptUntagged, 'TEST');

                client._currentCommand = false;
                client._processServerResponse({
                    tag: '*',
                    command: 'test'
                });

                expect(client._globalAcceptUntagged.TEST.withArgs({
                    tag: '*',
                    command: 'test'
                }).callCount).to.equal(1);

                client._processResponse.restore();
                client._globalAcceptUntagged.TEST.restore();
            });

            it('should invoke global handler if needed', function() {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = function() {};
                sinon.stub(client._globalAcceptUntagged, 'TEST');

                client._currentCommand = {
                    payload: {}
                };
                client._processServerResponse({
                    tag: '*',
                    command: 'test'
                });

                expect(client._globalAcceptUntagged.TEST.withArgs({
                    tag: '*',
                    command: 'test'
                }).callCount).to.equal(1);

                client._processResponse.restore();
                client._globalAcceptUntagged.TEST.restore();
            });

            it('should push to payload', function() {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = function() {};
                sinon.stub(client._globalAcceptUntagged, 'TEST');

                client._currentCommand = {
                    payload: {
                        TEST: []
                    }
                };
                client._processServerResponse({
                    tag: '*',
                    command: 'test'
                }, function() {});

                expect(client._globalAcceptUntagged.TEST.callCount).to.equal(0);
                expect(client._currentCommand.payload.TEST).to.deep.equal([{
                    tag: '*',
                    command: 'test'
                }]);

                client._processResponse.restore();
                client._globalAcceptUntagged.TEST.restore();
            });

            it('should invoke command callback', function() {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = function() {};
                sinon.stub(client._globalAcceptUntagged, 'TEST');

                client._currentCommand = {
                    tag: 'A',
                    callback: function(response) {

                        expect(response).to.deep.equal({
                            tag: 'A',
                            command: 'test',
                            payload: {
                                TEST: 'abc'
                            }
                        });
                    },
                    payload: {
                        TEST: 'abc'
                    }
                };
                client._processServerResponse({
                    tag: 'A',
                    command: 'test'
                }, function() {});

                expect(client._globalAcceptUntagged.TEST.callCount).to.equal(0);

                client._processResponse.restore();
                client._globalAcceptUntagged.TEST.restore();
            });
        });

        describe('#_addToClientQueue', function() {
            it('should invoke sending', function() {
                sinon.stub(client, '_sendRequest');

                client._tagCounter = 100;
                client._clientQueue = [];
                client._canSend = true;

                var cb = function() {};

                client._addToClientQueue({
                    command: 'abc'
                }, ['def'], {
                    t: 1
                }, cb);

                expect(client._sendRequest.callCount).to.equal(1);
                expect(client._clientQueue.length).to.equal(1);
                expect(client._clientQueue[0].tag).to.equal('W101');
                expect(client._clientQueue[0].request).to.deep.equal({
                    command: 'abc',
                    tag: 'W101'
                });
                expect(client._clientQueue[0].t).to.equal(1);

                client._sendRequest.restore();
            });

            it('should only queue', function() {
                sinon.stub(client, '_sendRequest');

                client._tagCounter = 100;
                client._clientQueue = [];
                client._canSend = false;

                var cb = function() {};

                client._addToClientQueue({
                    command: 'abc'
                }, ['def'], {
                    t: 1
                }, cb);

                expect(client._sendRequest.callCount).to.equal(0);
                expect(client._clientQueue.length).to.equal(1);
                expect(client._clientQueue[0].tag).to.equal('W101');

                client._sendRequest.restore();
            });
        });

        describe('#_sendRequest', function() {
            it('should enter idle if nothing is to process', function() {
                sinon.stub(client, '_enterIdle');

                client._clientQueue = [];
                client._sendRequest();

                expect(client._enterIdle.callCount).to.equal(1);

                client._enterIdle.restore();
            });

            it('should send data', function() {
                sinon.stub(client, '_clearIdle');
                sinon.stub(client, 'send');

                client._clientQueue = [{
                    request: {
                        tag: 'W101',
                        command: 'TEST'
                    }
                }];
                client._sendRequest();

                expect(client._clearIdle.callCount).to.equal(1);
                expect(client.send.args[0][0]).to.equal('W101 TEST\r\n');

                client._clearIdle.restore();
                client.send.restore();
            });

            it('should send partial data', function() {
                sinon.stub(client, '_clearIdle');
                sinon.stub(client, 'send');

                client._clientQueue = [{
                    request: {
                        tag: 'W101',
                        command: 'TEST',
                        attributes: [{
                            type: 'LITERAL',
                            value: 'abc'
                        }]
                    }
                }];
                client._sendRequest();

                expect(client._clearIdle.callCount).to.equal(1);
                expect(client.send.args[0][0]).to.equal('W101 TEST {3}\r\n');
                expect(client._currentCommand.data).to.deep.equal(['abc']);
                client._clearIdle.restore();
                client.send.restore();
            });

            it('should run precheck', function(done) {
                sinon.stub(client, '_clearIdle');

                client._canSend = true;
                client._clientQueue = [{
                    request: {
                        tag: 'W101',
                        command: 'TEST',
                        attributes: [{
                            type: 'LITERAL',
                            value: 'abc'
                        }]
                    },
                    precheck: function(ctx) {
                        expect(ctx).to.exist;
                        expect(client._canSend).to.be.true;
                        client._sendRequest = function() {
                            expect(client._clientQueue.length).to.equal(2);
                            expect(client._clientQueue[0].tag).to.include('.p');
                            expect(client._clientQueue[0].request.tag).to.include('.p');
                            client._clearIdle.restore();
                            done();
                        };
                        client._addToClientQueue({}, undefined, {
                            ctx: ctx
                        });
                    }
                }];
                client._sendRequest();
            });
        });

        describe('#_enterIdle', function() {
            it('should set idle timer', function(done) {
                client.onidle = function() {
                    done();
                };
                client.TIMEOUT_ENTER_IDLE = 1;

                client._enterIdle();
            });
        });

        describe('#_processResponse', function() {
            it('should set humanReadable', function() {
                var response = {
                    tag: '*',
                    command: 'OK',
                    attributes: [{
                        type: 'TEXT',
                        value: 'Some random text'
                    }]
                };
                client._processResponse(response);

                expect(response.humanReadable).to.equal('Some random text');
            });

            it('should set response code', function() {
                var response = {
                    tag: '*',
                    command: 'OK',
                    attributes: [{
                        type: 'ATOM',
                        section: [{
                            type: 'ATOM',
                            value: 'CAPABILITY'
                        }, {
                            type: 'ATOM',
                            value: 'IMAP4REV1'
                        }, {
                            type: 'ATOM',
                            value: 'UIDPLUS'
                        }]
                    }, {
                        type: 'TEXT',
                        value: 'Some random text'
                    }]
                };
                client._processResponse(response);
                expect(response.code).to.equal('CAPABILITY');
                expect(response.capability).to.deep.equal(['IMAP4REV1', 'UIDPLUS']);
            });
        });

        describe('#isError', function() {
            it('should detect if an object is an error', function() {
                expect(client.isError(new RangeError('abc'))).to.be.true;
                expect(client.isError('abc')).to.be.false;
            });
        });

        describe('#enableCompression', function() {
            it('should create inflater and deflater streams', function() {
                client.socket.ondata = function() {};
                sinon.stub(client.socket, 'ondata');

                expect(client.compressed).to.be.false;
                client.enableCompression();
                expect(client.compressed).to.be.true;

                sinon.stub(client._compression, 'inflate', function() {
                    client._compression.inflatedReady(new Uint8Array([1, 2, 3]).buffer);
                });
                sinon.stub(client._compression, 'deflate', function() {
                    client._compression.deflatedReady(new Uint8Array([4, 5, 6]).buffer);
                });

                client.send('a');
                client.socket.ondata(new Uint8Array([1]).buffer);

                expect(socketStub.send.args[0][0]).to.deep.equal(new Uint8Array([4, 5, 6]).buffer);
                expect(client._socketOnData.args[0][0]).to.deep.equal({
                    data: new Uint8Array([1, 2, 3]).buffer
                });
            });
        });
    });
}));