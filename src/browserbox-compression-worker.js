(function() {
    'use strict';

    // 
    // constants used for communication with the worker
    // 
    var MESSAGE_START = 'start';
    var MESSAGE_INFLATE = 'inflate';
    var MESSAGE_INFLATED_DATA_READY = 'inflated_ready';
    var MESSAGE_DEFLATE = 'deflate';
    var MESSAGE_DEFLATED_DATA_READY = 'deflated_ready';

    // require the compressor
    var Compressor = require('./browserbox-compression');
    
    var compressor = new Compressor();
    compressor.inflatedReady = inflatedReady;
    compressor.deflatedReady = deflatedReady;

    self.onmessage = function(e) {
        var message = e.data.message,
            buffer = e.data.buffer;

        switch (message) {
            case MESSAGE_START:
                // doesn't do much, just initiates the worker. a web
                // worker needs some time to synchronously load the
                // scripts, so better start it ahead of time
                break;

            case MESSAGE_INFLATE:
                compressor.inflate(buffer);
                break;

            case MESSAGE_DEFLATE:
                compressor.deflate(buffer);
                break;

        }
    };

    function inflatedReady(buffer) {
        self.postMessage(createMessage(MESSAGE_INFLATED_DATA_READY, buffer), [buffer]);
    }

    function deflatedReady(buffer) {
        self.postMessage(createMessage(MESSAGE_DEFLATED_DATA_READY, buffer), [buffer]);
    }

    // Helper function
    function createMessage(message, buffer) {
        return {
            message: message,
            buffer: buffer
        };
    }
})();