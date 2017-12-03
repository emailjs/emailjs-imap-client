import pako from '../lib/pako'

/**
 * @constructor
 *
 * Handles de-/compression via #inflate() and #deflate(), calls you back via #deflatedReady() and #inflatedReady().
 * The chunk we get from deflater is actually a view of a 16kB arraybuffer, so we need to copy the relevant parts
 * memory to a new arraybuffer.
 */
export default function Compressor () {
  this.deflatedReady = false
  this.inflatedReady = false

  /**
   * emit inflated data
   */
  this._inflate = pako.inflater(function (chunk) {
    if (!this.inflatedReady) {
      return
    }

    this.inflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length))
  }.bind(this))

  /**
   * emit deflated data
   */
  this._deflate = pako.deflater(function (chunk) {
    if (!this.deflatedReady) {
      return
    }

    this.deflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length))
  }.bind(this))
}

Compressor.prototype.inflate = function (buffer) {
  this._inflate(new Uint8Array(buffer))
}

Compressor.prototype.deflate = function (buffer) {
  this._deflate(new Uint8Array(buffer))
}
