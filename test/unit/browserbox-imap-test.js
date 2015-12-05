'use strict';

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['chai', 'browserbox-imap', 'mimefuncs'], factory.bind(null, sinon));
    } else if (typeof exports === 'object') {
        module.exports = factory(require('sinon'), require('chai'), require('../../src/browserbox-imap'), require('mimefuncs'));
    }
}(function(sinon, chai, ImapClient, mimefuncs) {
    var expect = chai.expect;
    chai.config.includeStack = true;

    var host = 'localhost';
    var port = 10000;

    describe('browserbox imap unit tests', () => {
        var client, socketStub;

        /* jshint indent:false */

        beforeEach((done) => {
            client = new ImapClient(host, port);
            expect(client).to.exist;

            var TCPSocket = client._TCPSocket = function() {};
            TCPSocket.open = () => {};
            TCPSocket.prototype.close = () => {};
            TCPSocket.prototype.send = () => {};
            TCPSocket.prototype.suspend = () => {};
            TCPSocket.prototype.resume = () => {};
            TCPSocket.prototype.upgradeToSecure = () => {};

            socketStub = sinon.createStubInstance(TCPSocket);
            sinon.stub(TCPSocket, 'open').withArgs(host, port).returns(socketStub);

            client.connect().then(() => {
                expect(TCPSocket.open.callCount).to.equal(1);

                expect(socketStub.onerror).to.exist;
                expect(socketStub.onopen).to.exist;
                expect(socketStub.onclose).to.exist;
                expect(socketStub.ondata).to.exist;
            }).then(done).catch(done);

            setTimeout(() => socketStub.onopen(), 0);
        });

        describe('#close', () => {
            it('should call socket.close', (done) => {
                client.socket.readyState = 'open';

                client.close().then(() => {
                    expect(client.socket.close.callCount).to.equal(1);
                }).then(done).catch(done);

                setTimeout(() => socketStub.onclose(), 0);
            });

            it('should call socket.close', (done) => {
                client.socket.readyState = 'not open. duh.';

                client.close().then(() => {
                    expect(client.socket.close.called).to.be.false;
                }).then(done).catch(done);

                setTimeout(() => socketStub.onclose(), 0);
            });
        });

        describe('#upgrade', () => {
            it('should upgrade socket', () => {
                client.secureMode = false;
                client.upgrade();
            });

            it('should not upgrade socket', () => {
                client.secureMode = true;
                client.upgrade();
            });
        });

        describe('#setHandler', () => {
            it('should set global handler for keyword', () => {
                var handler = () => {};
                client.setHandler('fetch', handler);

                expect(client._globalAcceptUntagged.FETCH).to.equal(handler);
            });
        });

        describe('#socket.onerror', () => {
            it('should emit error and close connection', (done) => {
                client.socket.onerror({
                    data: new Error('err')
                });

                client.onerror = () => {
                    done();
                };
            });
        });

        describe('#socket.onclose', () => {
            it('should emit error ', (done) => {
                client.socket.onclose();

                client.onerror = () => {
                    done();
                };
            });
        });

        describe('#_onData', () => {
            it('should process normal input', () => {
                var list = [
                        '* 1 FETCH (UID 1)',
                        '* 2 FETCH (UID 2)',
                        '* 3 FETCH (UID 3)',
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', (cmd) => {
                    expect(list[pos++]).to.equal(cmd);
                });

                for (var i = 0; i < list.length; i++) {
                    client._onData({
                        data: mimefuncs.toTypedArray(list[i] + '\r\n').buffer
                    });
                }

                client._addToServerQueue.restore();
            });

            it('should process chunked input', () => {
                var input = ['* 1 FETCH (UID 1)\r\n* 2 F', 'ETCH (UID 2)\r\n* 3 FETCH (UID 3', ')\r\n'];

                var output = [
                        '* 1 FETCH (UID 1)',
                        '* 2 FETCH (UID 2)',
                        '* 3 FETCH (UID 3)'
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', (cmd) => {
                    expect(output[pos++]).to.equal(cmd);
                });

                for (var i = 0; i < input.length; i++) {
                    client._onData({
                        data: mimefuncs.toTypedArray(input[i]).buffer
                    });
                }

                client._addToServerQueue.restore();
            });

            it('should process split input', () => {
                var input = ['* 1 ', 'F', 'ETCH (', 'UID 1)', '\r', '\n'];

                var output = [
                        '* 1 FETCH (UID 1)'
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', (cmd) => {
                    expect(output[pos++]).to.equal(cmd);
                });

                for (var i = 0; i < input.length; i++) {
                    client._onData({
                        data: mimefuncs.toTypedArray(input[i]).buffer
                    });
                }

                client._addToServerQueue.restore();
            });

            it('chould process chunked literals', () => {
                var input = [
                    '* 1 FETCH (UID {1}\r\n1)\r\n* 2 FETCH (UID {4}\r\n2345)\r\n* 3 FETCH (UID {4}', '\r\n3789)\r\n'
                ];

                var output = [
                        '* 1 FETCH (UID {1}\r\n1)',
                        '* 2 FETCH (UID {4}\r\n2345)',
                        '* 3 FETCH (UID {4}\r\n3789)'
                    ],
                    pos = 0;

                sinon.stub(client, '_addToServerQueue', (cmd) => {
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

        describe('#_addToServerQueue', () => {
            it('should only push', () => {
                sinon.stub(client, '_processServerQueue');

                client._processingServerData = true;
                client._serverQueue = [];
                client._addToServerQueue('abc');

                expect(client._serverQueue).to.deep.equal(['abc']);
                expect(client._processServerQueue.callCount).to.equal(0);

                client._processServerQueue.restore();
            });

            it('should push and run', () => {
                sinon.stub(client, '_processServerQueue');

                client._processingServerData = false;
                client._serverQueue = [];
                client._addToServerQueue('abc');

                expect(client._serverQueue).to.deep.equal(['abc']);
                expect(client._processServerQueue.callCount).to.equal(1);

                client._processServerQueue.restore();
            });
        });

        describe('#_processServerQueue', () => {
            it('should process a tagged item from the queue', (done) => {
                var ref = client._processServerQueue.bind(client);

                sinon.stub(client, '_sendRequest');

                sinon.stub(client, '_processServerResponse', (response) => {
                    expect(response).to.deep.equal({
                        tag: 'OK',
                        command: 'Hello',
                        attributes: [{
                            type: 'ATOM',
                            value: 'world!'
                        }]
                    });
                });

                sinon.stub(client, '_processServerQueue', () => {

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

            it('should process an untagged item from the queue', (done) => {
                var ref = client._processServerQueue.bind(client);

                sinon.stub(client, '_sendRequest');

                sinon.stub(client, '_processServerResponse', (response) => {
                    expect(response).to.deep.equal({
                        tag: '*',
                        command: 'EXISTS',
                        attributes: [],
                        nr: 1
                    });
                });

                sinon.stub(client, '_processServerQueue', () => {

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

            it('should process a plus tagged item from the queue', (done) => {
                var ref = client._processServerQueue.bind(client);
                sinon.stub(client, 'send');

                sinon.stub(client, '_processServerQueue', () => {

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

        describe('#_processServerResponse', () => {
            it('should invoke global handler by default', () => {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = () => {};
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

            it('should invoke global handler if needed', () => {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = () => {};
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

            it('should push to payload', () => {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = () => {};
                sinon.stub(client._globalAcceptUntagged, 'TEST');

                client._currentCommand = {
                    payload: {
                        TEST: []
                    }
                };
                client._processServerResponse({
                    tag: '*',
                    command: 'test'
                });

                expect(client._globalAcceptUntagged.TEST.callCount).to.equal(0);
                expect(client._currentCommand.payload.TEST).to.deep.equal([{
                    tag: '*',
                    command: 'test'
                }]);

                client._processResponse.restore();
                client._globalAcceptUntagged.TEST.restore();
            });

            it('should invoke command callback', () => {
                sinon.stub(client, '_processResponse');
                client._globalAcceptUntagged.TEST = () => {};
                sinon.stub(client._globalAcceptUntagged, 'TEST');

                client._currentCommand = {
                    tag: 'A',
                    callback: (response) => {

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
                });

                expect(client._globalAcceptUntagged.TEST.callCount).to.equal(0);

                client._processResponse.restore();
                client._globalAcceptUntagged.TEST.restore();
            });
        });

        describe('#enqueueCommand', () => {
            it('should reject on NO/BAD', (done) => {
                sinon.stub(client, '_sendRequest', function() {
                    client._clientQueue[0].callback({ command: 'NO' });
                });

                client._tagCounter = 100;
                client._clientQueue = [];
                client._canSend = true;

                client.enqueueCommand({
                    command: 'abc'
                }, ['def'], {
                    t: 1
                }).catch((err) => {
                    expect(err).to.exist;
                    done();
                });
            });

            it('should invoke sending', (done) => {
                sinon.stub(client, '_sendRequest', function() {
                    client._clientQueue[0].callback({});
                });

                client._tagCounter = 100;
                client._clientQueue = [];
                client._canSend = true;

                client.enqueueCommand({
                    command: 'abc'
                }, ['def'], {
                    t: 1
                }).then(() => {
                    expect(client._sendRequest.callCount).to.equal(1);
                    expect(client._clientQueue.length).to.equal(1);
                    expect(client._clientQueue[0].tag).to.equal('W101');
                    expect(client._clientQueue[0].request).to.deep.equal({
                        command: 'abc',
                        tag: 'W101'
                    });
                    expect(client._clientQueue[0].t).to.equal(1);

                    client._sendRequest.restore();
                }).then(done).catch(done);
            });

            it('should only queue', (done) => {
                sinon.stub(client, '_sendRequest');

                client._tagCounter = 100;
                client._clientQueue = [];
                client._canSend = false;

                client.enqueueCommand({
                    command: 'abc'
                }, ['def'], {
                    t: 1
                }).then(() => {
                    expect(client._sendRequest.callCount).to.equal(0);
                    expect(client._clientQueue.length).to.equal(1);
                    expect(client._clientQueue[0].tag).to.equal('W101');

                    client._sendRequest.restore();
                }).then(done).catch(done);

                setTimeout(() => {
                    client._clientQueue[0].callback({});
                }, 0);
            });
        });

        describe('#_sendRequest', () => {
            it('should enter idle if nothing is to process', () => {
                sinon.stub(client, '_enterIdle');

                client._clientQueue = [];
                client._sendRequest();

                expect(client._enterIdle.callCount).to.equal(1);

                client._enterIdle.restore();
            });

            it('should send data', () => {
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

            it('should send partial data', () => {
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
        });

        describe('#_enterIdle', () => {
            it('should set idle timer', (done) => {
                client.onidle = () => {
                    done();
                };
                client.TIMEOUT_ENTER_IDLE = 1;

                client._enterIdle();
            });
        });

        describe('#_processResponse', () => {
            it('should set humanReadable', () => {
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

            it('should set response code', () => {
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

        describe('#isError', () => {
            it('should detect if an object is an error', () => {
                expect(client.isError(new RangeError('abc'))).to.be.true;
                expect(client.isError('abc')).to.be.false;
            });
        });

        describe('#enableCompression', () => {
            it('should create inflater and deflater streams', () => {
                client.socket.ondata = () => {};
                sinon.stub(client.socket, 'ondata');

                expect(client.compressed).to.be.false;
                client.enableCompression();
                expect(client.compressed).to.be.true;

                sinon.stub(client._compression, 'inflate', () => {
                    client._compression.inflatedReady(new Uint8Array([1, 2, 3]).buffer);
                });
                sinon.stub(client._compression, 'deflate', () => {
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
