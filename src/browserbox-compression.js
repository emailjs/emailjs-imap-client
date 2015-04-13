// Copyright (c) 2014 Andris Reinman

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

(function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['browserbox-pako'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./browserbox-pako'));
    } else {
        root.BrowserboxCompressor = factory(root.pako);
    }
}(this, function(pako) {
    'use strict';

    /**
     * @constructor
     *
     * Handles de-/compression via #inflate() and #deflate(), calls you back via #deflatedReady() and #inflatedReady().
     * The chunk we get from deflater is actually a view of a 16kB arraybuffer, so we need to copy the relevant parts
     * memory to a new arraybuffer. 
     */
    var Compressor = function() {
        this.deflatedReady = false;
        this.inflatedReady = false;

        /**
         * emit inflated data
         */
        this._inflate = pako.inflater(function(chunk) {
            if (!this.inflatedReady) {
                return;
            }

            this.inflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length));
        }.bind(this));

        /**
         * emit deflated data
         */
        this._deflate = pako.deflater(function(chunk) {
            if (!this.deflatedReady) {
                return;
            }

            this.deflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length));
        }.bind(this));
    };

    Compressor.prototype.inflate = function(buffer) {
        this._inflate(new Uint8Array(buffer));
    };

    Compressor.prototype.deflate = function(buffer) {
        this._deflate(new Uint8Array(buffer));
    };

    return Compressor;
}));