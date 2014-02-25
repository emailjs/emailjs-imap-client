// Copyright © 2013 Whiteout Networks GmbH.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function(parent) {
    'use strict';

    if(parent.TCPSocket && typeof parent.TCPSocket == "object"){
        // TCPSocket is already defined
        return;
    }

    if(parent.mozTCPSocket && typeof parent.mozTCPSocket == "object"){
        // Use Mozilla specific mozTCPSocket
        parent.TCPSocket = parent.mozTCPSocket;
        return;
    }

    //
    // Constructor
    //

    var TCPSocket = function(config) {
        var self = this;

        config.options.useSSL = typeof config.options.useSSL !== 'undefined' ? config.options.useSSL : false;
        config.options.binaryType = config.options.binaryType || 'arraybuffer';

        if (config.options.binaryType !== 'arraybuffer') {
            throw 'String is not supported in this shim!';
        }

        self.host = config.host;
        self.port = config.port;
        self.ssl = config.options.useSSL;
        self.bufferedAmount = 0;
        self.readyState = 'connecting';

        // internal api
        self._socketId = 0;
        self._tlsClient = undefined;

        // connect that thing
        chrome.socket.create('tcp', {}, function(createInfo) {
            self._socketId = createInfo.socketId;

            chrome.socket.connect(self._socketId, self.host, self.port, function(result) {
                if (result !== 0) {
                    self.readyState = 'closed';
                    self._emit('error', new Error('Unable to connect'));
                    return;
                }

                // socket is up and running
                self.readyState = 'open';
                self._emit('open');

                // let's start reading
                read.bind(self)();

                return;
            });
        });
    };

    var read = function() {
        var self = this,
            buffer;

        if (self._socketId === 0) {
            // the socket is closed. omit read and stop further reads reading
            return;
        }

        chrome.socket.read(self._socketId, function(readInfo) {
            // socket closed remotely or broken
            if (readInfo.resultCode <= 0) {
                self._emit('close');
                return;
            }

            self._emit('data', readInfo.data); // emit data event
            read.bind(self)(); // start the next read
        });
    };

    //
    // API
    //

    // Class methods

    TCPSocket.open = function(host, port, options) {
        return new TCPSocket({
            host: host,
            port: port,
            options: options || {}
        });
    };

    TCPSocket.listen = function() {
        throw 'API not supported';
    };

    // Instance methods

    TCPSocket.prototype.close = function() {
        self.readyState = 'closing';
        this._emit('close');
        this._socketId = 0;
        chrome.socket.disconnect(this._socketId);
        chrome.socket.destroy(this._socketId);
        self.readyState = 'closed';
    };

    TCPSocket.prototype.send = function(data) {
        var self = this;

        chrome.socket.write(self._socketId, data, function(writeInfo) {
            if (writeInfo.bytesWritten < 0) {
                self._emit('error', new Error('Could not write to socket ' + self._socketId + '. Chrome error code: ' + writeInfo.bytesWritten));
                return;
            }

            self._emit('drain');
        });
    };

    TCPSocket.prototype.resume = TCPSocket.prototype.suspend = TCPSocket.prototype.upgradeToSecure = function() {
        throw 'API not supported';
    };

    // Internal use

    TCPSocket.prototype._emit = function(type, data) {
        var cb;
        if (type === 'open') {
            cb = this.onopen;
        } else if (type === 'error') {
            cb = this.onerror;
        } else if (type === 'data') {
            cb = this.ondata;
        } else if (type === 'drain') {
            cb = this.ondrain;
        } else if (type === 'close') {
            cb = this.onclose;
        }

        if (typeof cb === 'undefined') {
            return;
        }

        cb({
            target: this,
            type: type,
            data: data
        });
    };

    parent.TCPSocket = TCPSocket;
})(navigator);
