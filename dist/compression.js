'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Compressor;

var _zstream = require('pako/lib/zlib/zstream');

var _zstream2 = _interopRequireDefault(_zstream);

var _deflate = require('pako/lib/zlib/deflate');

var _inflate = require('pako/lib/zlib/inflate');

var _messages = require('pako/lib/zlib/messages.js');

var _messages2 = _interopRequireDefault(_messages);

var _constants = require('pako/lib/zlib/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CHUNK_SIZE = 16384;
var WINDOW_BITS = 15;

/**
 * Handles de-/compression via #inflate() and #deflate(), calls you back via #deflatedReady() and #inflatedReady().
 * The chunk we get from deflater is actually a view of a 16kB arraybuffer, so we need to copy the relevant parts
 * memory to a new arraybuffer.
 */
function Compressor(inflatedReady, deflatedReady) {
  var _this = this;

  this.inflatedReady = inflatedReady;
  this.deflatedReady = deflatedReady;
  this._inflate = inflater(function (chunk) {
    return _this.inflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length));
  });
  this._deflate = deflater(function (chunk) {
    return _this.deflatedReady(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.length));
  });
}

Compressor.prototype.inflate = function (buffer) {
  this._inflate(new Uint8Array(buffer));
};

Compressor.prototype.deflate = function (buffer) {
  this._deflate(new Uint8Array(buffer));
};

function deflater(emit) {
  var stream = new _zstream2.default();
  var status = (0, _deflate.deflateInit2)(stream, _constants.Z_DEFAULT_COMPRESSION, _constants.Z_DEFLATED, WINDOW_BITS, 8, _constants.Z_DEFAULT_STRATEGY);
  if (status !== _constants.Z_OK) {
    throw new Error('Problem initializing deflate stream: ' + _messages2.default[status]);
  }

  return function (data) {
    if (data === undefined) return emit();

    // Attach the input data
    stream.input = data;
    stream.next_in = 0;
    stream.avail_in = stream.input.length;

    var status = void 0;
    var output = void 0;
    var start = void 0;
    var ret = true;

    do {
      // When the stream gets full, we need to create new space.
      if (stream.avail_out === 0) {
        stream.output = new Uint8Array(CHUNK_SIZE);
        start = stream.next_out = 0;
        stream.avail_out = CHUNK_SIZE;
      }

      // Perform the deflate
      status = (0, _deflate.deflate)(stream, _constants.Z_SYNC_FLUSH);
      if (status !== _constants.Z_STREAM_END && status !== _constants.Z_OK) {
        throw new Error('Deflate problem: ' + _messages2.default[status]);
      }

      // If the output buffer got full, flush the data.
      if (stream.avail_out === 0 && stream.next_out > start) {
        output = stream.output.subarray(start, start = stream.next_out);
        ret = emit(output);
      }
    } while ((stream.avail_in > 0 || stream.avail_out === 0) && status !== _constants.Z_STREAM_END);

    // Emit whatever is left in output.
    if (stream.next_out > start) {
      output = stream.output.subarray(start, start = stream.next_out);
      ret = emit(output);
    }
    return ret;
  };
}

function inflater(emit) {
  var stream = new _zstream2.default();

  var status = (0, _inflate.inflateInit2)(stream, WINDOW_BITS);
  if (status !== _constants.Z_OK) {
    throw new Error('Problem initializing inflate stream: ' + _messages2.default[status]);
  }

  return function (data) {
    if (data === undefined) return emit();

    var start = void 0;
    stream.input = data;
    stream.next_in = 0;
    stream.avail_in = stream.input.length;

    var status = void 0,
        output = void 0;
    var ret = true;

    do {
      if (stream.avail_out === 0) {
        stream.output = new Uint8Array(CHUNK_SIZE);
        start = stream.next_out = 0;
        stream.avail_out = CHUNK_SIZE;
      }

      status = (0, _inflate.inflate)(stream, _constants.Z_NO_FLUSH);
      if (status !== _constants.Z_STREAM_END && status !== _constants.Z_OK) {
        throw new Error('inflate problem: ' + _messages2.default[status]);
      }

      if (stream.next_out) {
        if (stream.avail_out === 0 || status === _constants.Z_STREAM_END) {
          output = stream.output.subarray(start, start = stream.next_out);
          ret = emit(output);
        }
      }
    } while (stream.avail_in > 0 && status !== _constants.Z_STREAM_END);

    if (stream.next_out > start) {
      output = stream.output.subarray(start, start = stream.next_out);
      ret = emit(output);
    }

    return ret;
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21wcmVzc2lvbi5qcyJdLCJuYW1lcyI6WyJDb21wcmVzc29yIiwiQ0hVTktfU0laRSIsIldJTkRPV19CSVRTIiwiaW5mbGF0ZWRSZWFkeSIsImRlZmxhdGVkUmVhZHkiLCJfaW5mbGF0ZSIsImluZmxhdGVyIiwiY2h1bmsiLCJidWZmZXIiLCJzbGljZSIsImJ5dGVPZmZzZXQiLCJsZW5ndGgiLCJfZGVmbGF0ZSIsImRlZmxhdGVyIiwicHJvdG90eXBlIiwiaW5mbGF0ZSIsIlVpbnQ4QXJyYXkiLCJkZWZsYXRlIiwiZW1pdCIsInN0cmVhbSIsInN0YXR1cyIsIkVycm9yIiwiZGF0YSIsInVuZGVmaW5lZCIsImlucHV0IiwibmV4dF9pbiIsImF2YWlsX2luIiwib3V0cHV0Iiwic3RhcnQiLCJyZXQiLCJhdmFpbF9vdXQiLCJuZXh0X291dCIsInN1YmFycmF5Il0sIm1hcHBpbmdzIjoiOzs7OztrQkFrQndCQSxVOztBQWxCeEI7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBTUEsSUFBTUMsYUFBYSxLQUFuQjtBQUNBLElBQU1DLGNBQWMsRUFBcEI7O0FBRUE7Ozs7O0FBS2UsU0FBU0YsVUFBVCxDQUFxQkcsYUFBckIsRUFBb0NDLGFBQXBDLEVBQW1EO0FBQUE7O0FBQ2hFLE9BQUtELGFBQUwsR0FBcUJBLGFBQXJCO0FBQ0EsT0FBS0MsYUFBTCxHQUFxQkEsYUFBckI7QUFDQSxPQUFLQyxRQUFMLEdBQWdCQyxTQUFTO0FBQUEsV0FBUyxNQUFLSCxhQUFMLENBQW1CSSxNQUFNQyxNQUFOLENBQWFDLEtBQWIsQ0FBbUJGLE1BQU1HLFVBQXpCLEVBQXFDSCxNQUFNRyxVQUFOLEdBQW1CSCxNQUFNSSxNQUE5RCxDQUFuQixDQUFUO0FBQUEsR0FBVCxDQUFoQjtBQUNBLE9BQUtDLFFBQUwsR0FBZ0JDLFNBQVM7QUFBQSxXQUFTLE1BQUtULGFBQUwsQ0FBbUJHLE1BQU1DLE1BQU4sQ0FBYUMsS0FBYixDQUFtQkYsTUFBTUcsVUFBekIsRUFB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Q0QsR0FyQ0Q7QUFzQ0QiLCJmaWxlIjoiY29tcHJlc3Npb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWlN0cmVhbSBmcm9tICdwYWtvL2xpYi96bGliL3pzdHJlYW0nXG5pbXBvcnQgeyBkZWZsYXRlSW5pdDIsIGRlZmxhdGUgfSBmcm9tICdwYWtvL2xpYi96bGliL2RlZmxhdGUnXG5pbXBvcnQgeyBpbmZsYXRlLCBpbmZsYXRlSW5pdDIgfSBmcm9tICdwYWtvL2xpYi96bGliL2luZmxhdGUnXG5pbXBvcnQgbWVzc2FnZXMgZnJvbSAncGFrby9saWIvemxpYi9tZXNzYWdlcy5qcydcbmltcG9ydCB7XG4gIFpfTk9fRkxVU0gsIFpfU1lOQ19GTFVTSCwgWl9PSyxcbiAgWl9TVFJFQU1fRU5ELCBaX0RFRkFVTFRfQ09NUFJFU1NJT04sXG4gIFpfREVGQVVMVF9TVFJBVEVHWSwgWl9ERUZMQVRFRFxufSBmcm9tICdwYWtvL2xpYi96bGliL2NvbnN0YW50cydcblxuY29uc3QgQ0hVTktfU0laRSA9IDE2Mzg0XG5jb25zdCBXSU5ET1dfQklUUyA9IDE1XG5cbi8qKlxuICogSGFuZGxlcyBkZS0vY29tcHJlc3Npb24gdmlhICNpbmZsYXRlKCkgYW5kICNkZWZsYXRlKCksIGNhbGxzIHlvdSBiYWNrIHZpYSAjZGVmbGF0ZWRSZWFkeSgpIGFuZCAjaW5mbGF0ZWRSZWFkeSgpLlxuICogVGhlIGNodW5rIHdlIGdldCBmcm9tIGRlZmxhdGVyIGlzIGFjdHVhbGx5IGEgdmlldyBvZiBhIDE2a0IgYXJyYXlidWZmZXIsIHNvIHdlIG5lZWQgdG8gY29weSB0aGUgcmVsZXZhbnQgcGFydHNcbiAqIG1lbW9yeSB0byBhIG5ldyBhcnJheWJ1ZmZlci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29tcHJlc3NvciAoaW5mbGF0ZWRSZWFkeSwgZGVmbGF0ZWRSZWFkeSkge1xuICB0aGlzLmluZmxhdGVkUmVhZHkgPSBpbmZsYXRlZFJlYWR5XG4gIHRoaXMuZGVmbGF0ZWRSZWFkeSA9IGRlZmxhdGVkUmVhZHlcbiAgdGhpcy5faW5mbGF0ZSA9IGluZmxhdGVyKGNodW5rID0+IHRoaXMuaW5mbGF0ZWRSZWFkeShjaHVuay5idWZmZXIuc2xpY2UoY2h1bmsuYnl0ZU9mZnNldCwgY2h1bmsuYnl0ZU9mZnNldCArIGNodW5rLmxlbmd0aCkpKVxuICB0aGlzLl9kZWZsYXRlID0gZGVmbGF0ZXIoY2h1bmsgPT4gdGhpcy5kZWZsYXRlZFJlYWR5KGNodW5rLmJ1ZmZlci5zbGljZShjaHVuay5ieXRlT2Zmc2V0LCBjaHVuay5ieXRlT2Zmc2V0ICsgY2h1bmsubGVuZ3RoKSkpXG59XG5cbkNvbXByZXNzb3IucHJvdG90eXBlLmluZmxhdGUgPSBmdW5jdGlvbiAoYnVmZmVyKSB7XG4gIHRoaXMuX2luZmxhdGUobmV3IFVpbnQ4QXJyYXkoYnVmZmVyKSlcbn1cblxuQ29tcHJlc3Nvci5wcm90b3R5cGUuZGVmbGF0ZSA9IGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgdGhpcy5fZGVmbGF0ZShuZXcgVWludDhBcnJheShidWZmZXIpKVxufVxuXG5mdW5jdGlvbiBkZWZsYXRlciAoZW1pdCkge1xuICBjb25zdCBzdHJlYW0gPSBuZXcgWlN0cmVhbSgpXG4gIGxldCBzdGF0dXMgPSBkZWZsYXRlSW5pdDIoc3RyZWFtLCBaX0RFRkFVTFRfQ09NUFJFU1NJT04sIFpfREVGTEFURUQsIFdJTkRPV19CSVRTLCA4LCBaX0RFRkFVTFRfU1RSQVRFR1kpXG4gIGlmIChzdGF0dXMgIT09IFpfT0spIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb2JsZW0gaW5pdGlhbGl6aW5nIGRlZmxhdGUgc3RyZWFtOiAnICsgbWVzc2FnZXNbc3RhdHVzXSlcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHJldHVybiBlbWl0KClcblxuICAgIC8vIEF0dGFjaCB0aGUgaW5wdXQgZGF0YVxuICAgIHN0cmVhbS5pbnB1dCA9IGRhdGFcbiAgICBzdHJlYW0ubmV4dF9pbiA9IDBcbiAgICBzdHJlYW0uYXZhaWxfaW4gPSBzdHJlYW0uaW5wdXQubGVuZ3RoXG5cbiAgICBsZXQgc3RhdHVzXG4gICAgbGV0IG91dHB1dFxuICAgIGxldCBzdGFydFxuICAgIGxldCByZXQgPSB0cnVlXG5cbiAgICBkbyB7XG4gICAgICAvLyBXaGVuIHRoZSBzdHJlYW0gZ2V0cyBmdWxsLCB3ZSBuZWVkIHRvIGNyZWF0ZSBuZXcgc3BhY2UuXG4gICAgICBpZiAoc3RyZWFtLmF2YWlsX291dCA9PT0gMCkge1xuICAgICAgICBzdHJlYW0ub3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkoQ0hVTktfU0laRSlcbiAgICAgICAgc3RhcnQgPSBzdHJlYW0ubmV4dF9vdXQgPSAwXG4gICAgICAgIHN0cmVhbS5hdmFpbF9vdXQgPSBDSFVOS19TSVpFXG4gICAgICB9XG5cbiAgICAgIC8vIFBlcmZvcm0gdGhlIGRlZmxhdGVcbiAgICAgIHN0YXR1cyA9IGRlZmxhdGUoc3RyZWFtLCBaX1NZTkNfRkxVU0gpXG4gICAgICBpZiAoc3RhdHVzICE9PSBaX1NUUkVBTV9FTkQgJiYgc3RhdHVzICE9PSBaX09LKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGVmbGF0ZSBwcm9ibGVtOiAnICsgbWVzc2FnZXNbc3RhdHVzXSlcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIG91dHB1dCBidWZmZXIgZ290IGZ1bGwsIGZsdXNoIHRoZSBkYXRhLlxuICAgICAgaWYgKHN0cmVhbS5hdmFpbF9vdXQgPT09IDAgJiYgc3RyZWFtLm5leHRfb3V0ID4gc3RhcnQpIHtcbiAgICAgICAgb3V0cHV0ID0gc3RyZWFtLm91dHB1dC5zdWJhcnJheShzdGFydCwgc3RhcnQgPSBzdHJlYW0ubmV4dF9vdXQpXG4gICAgICAgIHJldCA9IGVtaXQob3V0cHV0KVxuICAgICAgfVxuICAgIH0gd2hpbGUgKChzdHJlYW0uYXZhaWxfaW4gPiAwIHx8IHN0cmVhbS5hdmFpbF9vdXQgPT09IDApICYmIHN0YXR1cyAhPT0gWl9TVFJFQU1fRU5EKVxuXG4gICAgLy8gRW1pdCB3aGF0ZXZlciBpcyBsZWZ0IGluIG91dHB1dC5cbiAgICBpZiAoc3RyZWFtLm5leHRfb3V0ID4gc3RhcnQpIHtcbiAgICAgIG91dHB1dCA9IHN0cmVhbS5vdXRwdXQuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ID0gc3RyZWFtLm5leHRfb3V0KVxuICAgICAgcmV0ID0gZW1pdChvdXRwdXQpXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmZsYXRlciAoZW1pdCkge1xuICBsZXQgc3RyZWFtID0gbmV3IFpTdHJlYW0oKVxuXG4gIGNvbnN0IHN0YXR1cyA9IGluZmxhdGVJbml0MihzdHJlYW0sIFdJTkRPV19CSVRTKVxuICBpZiAoc3RhdHVzICE9PSBaX09LKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQcm9ibGVtIGluaXRpYWxpemluZyBpbmZsYXRlIHN0cmVhbTogJyArIG1lc3NhZ2VzW3N0YXR1c10pXG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZW1pdCgpXG5cbiAgICBsZXQgc3RhcnRcbiAgICBzdHJlYW0uaW5wdXQgPSBkYXRhXG4gICAgc3RyZWFtLm5leHRfaW4gPSAwXG4gICAgc3RyZWFtLmF2YWlsX2luID0gc3RyZWFtLmlucHV0Lmxlbmd0aFxuXG4gICAgbGV0IHN0YXR1cywgb3V0cHV0XG4gICAgbGV0IHJldCA9IHRydWVcblxuICAgIGRvIHtcbiAgICAgIGlmIChzdHJlYW0uYXZhaWxfb3V0ID09PSAwKSB7XG4gICAgICAgIHN0cmVhbS5vdXRwdXQgPSBuZXcgVWludDhBcnJheShDSFVOS19TSVpFKVxuICAgICAgICBzdGFydCA9IHN0cmVhbS5uZXh0X291dCA9IDBcbiAgICAgICAgc3RyZWFtLmF2YWlsX291dCA9IENIVU5LX1NJWkVcbiAgICAgIH1cblxuICAgICAgc3RhdHVzID0gaW5mbGF0ZShzdHJlYW0sIFpfTk9fRkxVU0gpXG4gICAgICBpZiAoc3RhdHVzICE9PSBaX1NUUkVBTV9FTkQgJiYgc3RhdHVzICE9PSBaX09LKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW5mbGF0ZSBwcm9ibGVtOiAnICsgbWVzc2FnZXNbc3RhdHVzXSlcbiAgICAgIH1cblxuICAgICAgaWYgKHN0cmVhbS5uZXh0X291dCkge1xuICAgICAgICBpZiAoc3RyZWFtLmF2YWlsX291dCA9PT0gMCB8fCBzdGF0dXMgPT09IFpfU1RSRUFNX0VORCkge1xuICAgICAgICAgIG91dHB1dCA9IHN0cmVhbS5vdXRwdXQuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ID0gc3RyZWFtLm5leHRfb3V0KVxuICAgICAgICAgIHJldCA9IGVtaXQob3V0cHV0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSB3aGlsZSAoKHN0cmVhbS5hdmFpbF9pbiA+IDApICYmIHN0YXR1cyAhPT0gWl9TVFJFQU1fRU5EKVxuXG4gICAgaWYgKHN0cmVhbS5uZXh0X291dCA+IHN0YXJ0KSB7XG4gICAgICBvdXRwdXQgPSBzdHJlYW0ub3V0cHV0LnN1YmFycmF5KHN0YXJ0LCBzdGFydCA9IHN0cmVhbS5uZXh0X291dClcbiAgICAgIHJldCA9IGVtaXQob3V0cHV0KVxuICAgIH1cblxuICAgIHJldHVybiByZXRcbiAgfVxufVxuIl19