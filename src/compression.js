import ZStream from 'pako/lib/zlib/zstream'
import { deflateInit2, deflate } from 'pako/lib/zlib/deflate'
import { inflate, inflateInit2 } from 'pako/lib/zlib/inflate'
import messages from 'pako/lib/zlib/messages.js'
import {
  Z_NO_FLUSH, Z_SYNC_FLUSH, Z_OK,
  Z_STREAM_END, Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY, Z_DEFLATED
} from 'pako/lib/zlib/constants'

const CHUNK_SIZE = 16384
const WINDOW_BITS = 15

/**
 * Handles de-/compression via #inflate() and #deflate(), calls you back via #deflatedReady() and #inflatedReady().
 * The chunk we get from deflater is actually a view of a 16kB arraybuffer, so we need to copy the relevant parts
 * memory to a new arraybuffer.
 */
export default function Compressor (inflatedReady, deflatedReady) {
  this.inflatedReady = inflatedReady
  this.deflatedReady = deflatedReady
  this._inflate = inflater(chunk => this.inflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length)))
  this._deflate = deflater(chunk => this.deflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length)))
}

Compressor.prototype.inflate = function (buffer) {
  this._inflate(new Uint8Array(buffer))
}

Compressor.prototype.deflate = function (buffer) {
  this._deflate(new Uint8Array(buffer))
}

function deflater (emit) {
  const stream = new ZStream()
  const status = deflateInit2(stream, Z_DEFAULT_COMPRESSION, Z_DEFLATED, WINDOW_BITS, 8, Z_DEFAULT_STRATEGY)
  if (status !== Z_OK) {
    throw new Error('Problem initializing deflate stream: ' + messages[status])
  }

  return function (data) {
    if (data === undefined) return emit()

    // Attach the input data
    stream.input = data
    stream.next_in = 0
    stream.avail_in = stream.input.length

    let status
    let output
    let start
    let ret = true

    do {
      // When the stream gets full, we need to create new space.
      if (stream.avail_out === 0) {
        stream.output = new Uint8Array(CHUNK_SIZE)
        start = stream.next_out = 0
        stream.avail_out = CHUNK_SIZE
      }

      // Perform the deflate
      status = deflate(stream, Z_SYNC_FLUSH)
      if (status !== Z_STREAM_END && status !== Z_OK) {
        throw new Error('Deflate problem: ' + messages[status])
      }

      // If the output buffer got full, flush the data.
      if (stream.avail_out === 0 && stream.next_out > start) {
        output = stream.output.subarray(start, start = stream.next_out)
        ret = emit(output)
      }
    } while ((stream.avail_in > 0 || stream.avail_out === 0) && status !== Z_STREAM_END)

    // Emit whatever is left in output.
    if (stream.next_out > start) {
      output = stream.output.subarray(start, start = stream.next_out)
      ret = emit(output)
    }
    return ret
  }
}

function inflater (emit) {
  const stream = new ZStream()

  const status = inflateInit2(stream, WINDOW_BITS)
  if (status !== Z_OK) {
    throw new Error('Problem initializing inflate stream: ' + messages[status])
  }

  return function (data) {
    if (data === undefined) return emit()

    let start
    stream.input = data
    stream.next_in = 0
    stream.avail_in = stream.input.length

    let status, output
    let ret = true

    do {
      if (stream.avail_out === 0) {
        stream.output = new Uint8Array(CHUNK_SIZE)
        start = stream.next_out = 0
        stream.avail_out = CHUNK_SIZE
      }

      status = inflate(stream, Z_NO_FLUSH)
      if (status !== Z_STREAM_END && status !== Z_OK) {
        throw new Error('inflate problem: ' + messages[status])
      }

      if (stream.next_out) {
        if (stream.avail_out === 0 || status === Z_STREAM_END) {
          output = stream.output.subarray(start, start = stream.next_out)
          ret = emit(output)
        }
      }
    } while ((stream.avail_in > 0) && status !== Z_STREAM_END)

    if (stream.next_out > start) {
      output = stream.output.subarray(start, start = stream.next_out)
      ret = emit(output)
    }

    return ret
  }
}
