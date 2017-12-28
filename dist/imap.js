'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _emailjsTcpSocket = require('emailjs-tcp-socket');

var _emailjsTcpSocket2 = _interopRequireDefault(_emailjsTcpSocket);

var _common = require('./common');

var _emailjsImapHandler = require('emailjs-imap-handler');

var _compression = require('./compression');

var _compression2 = _interopRequireDefault(_compression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* babel-plugin-inline-import '../res/compression.worker.blob' */var CompressionBlob = '!function(e){function t(n){if(a[n])return a[n].exports;var i=a[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var a={};t.m=e,t.c=a,t.d=function(e,a,n){t.o(e,a)||Object.defineProperty(e,a,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var a=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(a,"a",a),a},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=4)}([function(e,t,a){"use strict";function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;t.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var a=t.shift();if(a){if("object"!=typeof a)throw new TypeError(a+"must be non-object");for(var i in a)n(a,i)&&(e[i]=a[i])}}return e},t.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var r={arraySet:function(e,t,a,n,i){if(t.subarray&&e.subarray)return void e.set(t.subarray(a,a+n),i);for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){var t,a,n,i,r,s;for(n=0,t=0,a=e.length;t<a;t++)n+=e[t].length;for(s=new Uint8Array(n),i=0,t=0,a=e.length;t<a;t++)r=e[t],s.set(r,i),i+=r.length;return s}},s={arraySet:function(e,t,a,n,i){for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){return[].concat.apply([],e)}};t.setTyped=function(e){e?(t.Buf8=Uint8Array,t.Buf16=Uint16Array,t.Buf32=Int32Array,t.assign(t,r)):(t.Buf8=Array,t.Buf16=Array,t.Buf32=Array,t.assign(t,s))},t.setTyped(i)},function(e,t,a){"use strict";function n(e,t,a,n){for(var i=65535&e|0,r=e>>>16&65535|0,s=0;0!==a;){s=a>2e3?2e3:a,a-=s;do{i=i+t[n++]|0,r=r+i|0}while(--s);i%=65521,r%=65521}return i|r<<16|0}e.exports=n},function(e,t,a){"use strict";function n(e,t,a,n){var r=i,s=n+a;e^=-1;for(var l=n;l<s;l++)e=e>>>8^r[255&(e^t[l])];return-1^e}var i=function(){for(var e,t=[],a=0;a<256;a++){e=a;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[a]=e}return t}();e.exports=n},function(e,t,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},function(e,t,a){"use strict";var n=a(5),i=function(e){return e&&e.__esModule?e:{default:e}}(n),r=function(e,t){return{message:e,buffer:t}},s=function(e){return self.postMessage(r("inflated_ready",e),[e])},l=function(e){return self.postMessage(r("deflated_ready",e),[e])},o=new i.default(s,l);self.onmessage=function(e){var t=e.data.message,a=e.data.buffer;switch(t){case"start":break;case"inflate":o.inflate(a);break;case"deflate":o.deflate(a)}}},function(e,t,a){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var a=this;this.inflatedReady=e,this.deflatedReady=t,this._inflate=s(function(e){return a.inflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))}),this._deflate=r(function(e){return a.deflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))})}function r(e){var t=new o.default,a=(0,h.deflateInit2)(t,u.Z_DEFAULT_COMPRESSION,u.Z_DEFLATED,b,8,u.Z_DEFAULT_STRATEGY);if(a!==u.Z_OK)throw new Error("Problem initializing deflate stream: "+f.default[a]);return function(a){if(void 0===a)return e();t.input=a,t.next_in=0,t.avail_in=t.input.length;var n=void 0,i=void 0,r=void 0,s=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(c),r=t.next_out=0,t.avail_out=c),(n=(0,h.deflate)(t,u.Z_SYNC_FLUSH))!==u.Z_STREAM_END&&n!==u.Z_OK)throw new Error("Deflate problem: "+f.default[n]);0===t.avail_out&&t.next_out>r&&(i=t.output.subarray(r,r=t.next_out),s=e(i))}while((t.avail_in>0||0===t.avail_out)&&n!==u.Z_STREAM_END);return t.next_out>r&&(i=t.output.subarray(r,r=t.next_out),s=e(i)),s}}function s(e){var t=new o.default,a=(0,d.inflateInit2)(t,b);if(a!==u.Z_OK)throw new Error("Problem initializing inflate stream: "+f.default[a]);return function(a){if(void 0===a)return e();var n=void 0;t.input=a,t.next_in=0,t.avail_in=t.input.length;var i=void 0,r=void 0,s=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(c),n=t.next_out=0,t.avail_out=c),(i=(0,d.inflate)(t,u.Z_NO_FLUSH))!==u.Z_STREAM_END&&i!==u.Z_OK)throw new Error("inflate problem: "+f.default[i]);t.next_out&&(0!==t.avail_out&&i!==u.Z_STREAM_END||(r=t.output.subarray(n,n=t.next_out),s=e(r)))}while(t.avail_in>0&&i!==u.Z_STREAM_END);return t.next_out>n&&(r=t.output.subarray(n,n=t.next_out),s=e(r)),s}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var l=a(6),o=n(l),h=a(7),d=a(9),_=a(3),f=n(_),u=a(12),c=16384,b=15;i.prototype.inflate=function(e){this._inflate(new Uint8Array(e))},i.prototype.deflate=function(e){this._deflate(new Uint8Array(e))}},function(e,t,a){"use strict";function n(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}e.exports=n},function(e,t,a){"use strict";function n(e,t){return e.msg=D[t],t}function i(e){return(e<<1)-(e>4?9:0)}function r(e){for(var t=e.length;--t>=0;)e[t]=0}function s(e){var t=e.state,a=t.pending;a>e.avail_out&&(a=e.avail_out),0!==a&&(B.arraySet(e.output,t.pending_buf,t.pending_out,a,e.next_out),e.next_out+=a,t.pending_out+=a,e.total_out+=a,e.avail_out-=a,t.pending-=a,0===t.pending&&(t.pending_out=0))}function l(e,t){O._tr_flush_block(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,s(e.strm)}function o(e,t){e.pending_buf[e.pending++]=t}function h(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function d(e,t,a,n){var i=e.avail_in;return i>n&&(i=n),0===i?0:(e.avail_in-=i,B.arraySet(t,e.input,e.next_in,i,a),1===e.state.wrap?e.adler=T(e.adler,t,i,a):2===e.state.wrap&&(e.adler=N(e.adler,t,i,a)),e.next_in+=i,e.total_in+=i,i)}function _(e,t){var a,n,i=e.max_chain_length,r=e.strstart,s=e.prev_length,l=e.nice_match,o=e.strstart>e.w_size-he?e.strstart-(e.w_size-he):0,h=e.window,d=e.w_mask,_=e.prev,f=e.strstart+oe,u=h[r+s-1],c=h[r+s];e.prev_length>=e.good_match&&(i>>=2),l>e.lookahead&&(l=e.lookahead);do{if(a=t,h[a+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do{}while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&r<f);if(n=oe-(f-r),r=f-oe,n>s){if(e.match_start=t,s=n,n>=l)break;u=h[r+s-1],c=h[r+s]}}}while((t=_[t&d])>o&&0!=--i);return s<=e.lookahead?s:e.lookahead}function f(e){var t,a,n,i,r,s=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=s+(s-he)){B.arraySet(e.window,e.window,s,s,0),e.match_start-=s,e.strstart-=s,e.block_start-=s,a=e.hash_size,t=a;do{n=e.head[--t],e.head[t]=n>=s?n-s:0}while(--a);a=s,t=a;do{n=e.prev[--t],e.prev[t]=n>=s?n-s:0}while(--a);i+=s}if(0===e.strm.avail_in)break;if(a=d(e.strm,e.window,e.strstart+e.lookahead,i),e.lookahead+=a,e.lookahead+e.insert>=le)for(r=e.strstart-e.insert,e.ins_h=e.window[r],e.ins_h=(e.ins_h<<e.hash_shift^e.window[r+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[r+le-1])&e.hash_mask,e.prev[r&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=r,r++,e.insert--,!(e.lookahead+e.insert<le)););}while(e.lookahead<he&&0!==e.strm.avail_in)}function u(e,t){var a=65535;for(a>e.pending_buf_size-5&&(a=e.pending_buf_size-5);;){if(e.lookahead<=1){if(f(e),0===e.lookahead&&t===U)return we;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+a;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,l(e,!1),0===e.strm.avail_out))return we;if(e.strstart-e.block_start>=e.w_size-he&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):(e.strstart>e.block_start&&(l(e,!1),e.strm.avail_out),we)}function c(e,t){for(var a,n;;){if(e.lookahead<he){if(f(e),e.lookahead<he&&t===U)return we;if(0===e.lookahead)break}if(a=0,e.lookahead>=le&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==a&&e.strstart-a<=e.w_size-he&&(e.match_length=_(e,a)),e.match_length>=le)if(n=O._tr_tally(e,e.strstart-e.match_start,e.match_length-le),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=le){e.match_length--;do{e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart}while(0!=--e.match_length);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=e.strstart<le-1?e.strstart:le-1,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function b(e,t){for(var a,n,i;;){if(e.lookahead<he){if(f(e),e.lookahead<he&&t===U)return we;if(0===e.lookahead)break}if(a=0,e.lookahead>=le&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=le-1,0!==a&&e.prev_length<e.max_lazy_match&&e.strstart-a<=e.w_size-he&&(e.match_length=_(e,a),e.match_length<=5&&(e.strategy===G||e.match_length===le&&e.strstart-e.match_start>4096)&&(e.match_length=le-1)),e.prev_length>=le&&e.match_length<=e.prev_length){i=e.strstart+e.lookahead-le,n=O._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-le),e.lookahead-=e.prev_length-1,e.prev_length-=2;do{++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart)}while(0!=--e.prev_length);if(e.match_available=0,e.match_length=le-1,e.strstart++,n&&(l(e,!1),0===e.strm.avail_out))return we}else if(e.match_available){if(n=O._tr_tally(e,0,e.window[e.strstart-1]),n&&l(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return we}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=O._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<le-1?e.strstart:le-1,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function g(e,t){for(var a,n,i,r,s=e.window;;){if(e.lookahead<=oe){if(f(e),e.lookahead<=oe&&t===U)return we;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=le&&e.strstart>0&&(i=e.strstart-1,(n=s[i])===s[++i]&&n===s[++i]&&n===s[++i])){r=e.strstart+oe;do{}while(n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&i<r);e.match_length=oe-(r-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=le?(a=O._tr_tally(e,1,e.match_length-le),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(a=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),a&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function m(e,t){for(var a;;){if(0===e.lookahead&&(f(e),0===e.lookahead)){if(t===U)return we;break}if(e.match_length=0,a=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,a&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function w(e,t,a,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=a,this.max_chain=n,this.func=i}function p(e){e.window_size=2*e.w_size,r(e.head),e.max_lazy_match=R[e.level].max_lazy,e.good_match=R[e.level].good_length,e.nice_match=R[e.level].nice_length,e.max_chain_length=R[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=le-1,e.match_available=0,e.ins_h=0}function v(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=V,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new B.Buf16(2*re),this.dyn_dtree=new B.Buf16(2*(2*ne+1)),this.bl_tree=new B.Buf16(2*(2*ie+1)),r(this.dyn_ltree),r(this.dyn_dtree),r(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new B.Buf16(se+1),this.heap=new B.Buf16(2*ae+1),r(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new B.Buf16(2*ae+1),r(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function k(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=Q,t=e.state,t.pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?_e:ge,e.adler=2===t.wrap?0:1,t.last_flush=U,O._tr_init(t),C):n(e,H)}function x(e){var t=k(e);return t===C&&p(e.state),t}function y(e,t){return e&&e.state?2!==e.state.wrap?H:(e.state.gzhead=t,C):H}function z(e,t,a,i,r,s){if(!e)return H;var l=1;if(t===Y&&(t=6),i<0?(l=0,i=-i):i>15&&(l=2,i-=16),r<1||r>$||a!==V||i<8||i>15||t<0||t>9||s<0||s>q)return n(e,H);8===i&&(i=9);var o=new v;return e.state=o,o.strm=e,o.wrap=l,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=r+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+le-1)/le),o.window=new B.Buf8(2*o.w_size),o.head=new B.Buf16(o.hash_size),o.prev=new B.Buf16(o.w_size),o.lit_bufsize=1<<r+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new B.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=a,x(e)}function E(e,t){return z(e,t,V,ee,te,J)}function A(e,t){var a,l,d,_;if(!e||!e.state||t>M||t<0)return e?n(e,H):H;if(l=e.state,!e.output||!e.input&&0!==e.avail_in||l.status===me&&t!==L)return n(e,0===e.avail_out?j:H);if(l.strm=e,a=l.last_flush,l.last_flush=t,l.status===_e)if(2===l.wrap)e.adler=0,o(l,31),o(l,139),o(l,8),l.gzhead?(o(l,(l.gzhead.text?1:0)+(l.gzhead.hcrc?2:0)+(l.gzhead.extra?4:0)+(l.gzhead.name?8:0)+(l.gzhead.comment?16:0)),o(l,255&l.gzhead.time),o(l,l.gzhead.time>>8&255),o(l,l.gzhead.time>>16&255),o(l,l.gzhead.time>>24&255),o(l,9===l.level?2:l.strategy>=X||l.level<2?4:0),o(l,255&l.gzhead.os),l.gzhead.extra&&l.gzhead.extra.length&&(o(l,255&l.gzhead.extra.length),o(l,l.gzhead.extra.length>>8&255)),l.gzhead.hcrc&&(e.adler=N(e.adler,l.pending_buf,l.pending,0)),l.gzindex=0,l.status=fe):(o(l,0),o(l,0),o(l,0),o(l,0),o(l,0),o(l,9===l.level?2:l.strategy>=X||l.level<2?4:0),o(l,xe),l.status=ge);else{var f=V+(l.w_bits-8<<4)<<8,u=-1;u=l.strategy>=X||l.level<2?0:l.level<6?1:6===l.level?2:3,f|=u<<6,0!==l.strstart&&(f|=de),f+=31-f%31,l.status=ge,h(l,f),0!==l.strstart&&(h(l,e.adler>>>16),h(l,65535&e.adler)),e.adler=1}if(l.status===fe)if(l.gzhead.extra){for(d=l.pending;l.gzindex<(65535&l.gzhead.extra.length)&&(l.pending!==l.pending_buf_size||(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending!==l.pending_buf_size));)o(l,255&l.gzhead.extra[l.gzindex]),l.gzindex++;l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),l.gzindex===l.gzhead.extra.length&&(l.gzindex=0,l.status=ue)}else l.status=ue;if(l.status===ue)if(l.gzhead.name){d=l.pending;do{if(l.pending===l.pending_buf_size&&(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending===l.pending_buf_size)){_=1;break}_=l.gzindex<l.gzhead.name.length?255&l.gzhead.name.charCodeAt(l.gzindex++):0,o(l,_)}while(0!==_);l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),0===_&&(l.gzindex=0,l.status=ce)}else l.status=ce;if(l.status===ce)if(l.gzhead.comment){d=l.pending;do{if(l.pending===l.pending_buf_size&&(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending===l.pending_buf_size)){_=1;break}_=l.gzindex<l.gzhead.comment.length?255&l.gzhead.comment.charCodeAt(l.gzindex++):0,o(l,_)}while(0!==_);l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),0===_&&(l.status=be)}else l.status=be;if(l.status===be&&(l.gzhead.hcrc?(l.pending+2>l.pending_buf_size&&s(e),l.pending+2<=l.pending_buf_size&&(o(l,255&e.adler),o(l,e.adler>>8&255),e.adler=0,l.status=ge)):l.status=ge),0!==l.pending){if(s(e),0===e.avail_out)return l.last_flush=-1,C}else if(0===e.avail_in&&i(t)<=i(a)&&t!==L)return n(e,j);if(l.status===me&&0!==e.avail_in)return n(e,j);if(0!==e.avail_in||0!==l.lookahead||t!==U&&l.status!==me){var c=l.strategy===X?m(l,t):l.strategy===W?g(l,t):R[l.level].func(l,t);if(c!==ve&&c!==ke||(l.status=me),c===we||c===ve)return 0===e.avail_out&&(l.last_flush=-1),C;if(c===pe&&(t===I?O._tr_align(l):t!==M&&(O._tr_stored_block(l,0,0,!1),t===F&&(r(l.head),0===l.lookahead&&(l.strstart=0,l.block_start=0,l.insert=0))),s(e),0===e.avail_out))return l.last_flush=-1,C}return t!==L?C:l.wrap<=0?P:(2===l.wrap?(o(l,255&e.adler),o(l,e.adler>>8&255),o(l,e.adler>>16&255),o(l,e.adler>>24&255),o(l,255&e.total_in),o(l,e.total_in>>8&255),o(l,e.total_in>>16&255),o(l,e.total_in>>24&255)):(h(l,e.adler>>>16),h(l,65535&e.adler)),s(e),l.wrap>0&&(l.wrap=-l.wrap),0!==l.pending?C:P)}function S(e){var t;return e&&e.state?(t=e.state.status)!==_e&&t!==fe&&t!==ue&&t!==ce&&t!==be&&t!==ge&&t!==me?n(e,H):(e.state=null,t===ge?n(e,K):C):H}function Z(e,t){var a,n,i,s,l,o,h,d,_=t.length;if(!e||!e.state)return H;if(a=e.state,2===(s=a.wrap)||1===s&&a.status!==_e||a.lookahead)return H;for(1===s&&(e.adler=T(e.adler,t,_,0)),a.wrap=0,_>=a.w_size&&(0===s&&(r(a.head),a.strstart=0,a.block_start=0,a.insert=0),d=new B.Buf8(a.w_size),B.arraySet(d,t,_-a.w_size,a.w_size,0),t=d,_=a.w_size),l=e.avail_in,o=e.next_in,h=e.input,e.avail_in=_,e.next_in=0,e.input=t,f(a);a.lookahead>=le;){n=a.strstart,i=a.lookahead-(le-1);do{a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+le-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++}while(--i);a.strstart=n,a.lookahead=le-1,f(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=le-1,a.match_available=0,e.next_in=o,e.input=h,e.avail_in=l,a.wrap=s,C}var R,B=a(0),O=a(8),T=a(1),N=a(2),D=a(3),U=0,I=1,F=3,L=4,M=5,C=0,P=1,H=-2,K=-3,j=-5,Y=-1,G=1,X=2,W=3,q=4,J=0,Q=2,V=8,$=9,ee=15,te=8,ae=286,ne=30,ie=19,re=2*ae+1,se=15,le=3,oe=258,he=oe+le+1,de=32,_e=42,fe=69,ue=73,ce=91,be=103,ge=113,me=666,we=1,pe=2,ve=3,ke=4,xe=3;R=[new w(0,0,0,0,u),new w(4,4,8,4,c),new w(4,5,16,8,c),new w(4,6,32,32,c),new w(4,4,16,16,b),new w(8,16,32,32,b),new w(8,16,128,128,b),new w(8,32,128,256,b),new w(32,128,258,1024,b),new w(32,258,258,4096,b)],t.deflateInit=E,t.deflateInit2=z,t.deflateReset=x,t.deflateResetKeep=k,t.deflateSetHeader=y,t.deflate=A,t.deflateEnd=S,t.deflateSetDictionary=Z,t.deflateInfo="pako deflate (from Nodeca project)"},function(e,t,a){"use strict";function n(e){for(var t=e.length;--t>=0;)e[t]=0}function i(e,t,a,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=a,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function r(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function s(e){return e<256?re[e]:re[256+(e>>>7)]}function l(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function o(e,t,a){e.bi_valid>X-a?(e.bi_buf|=t<<e.bi_valid&65535,l(e,e.bi_buf),e.bi_buf=t>>X-e.bi_valid,e.bi_valid+=a-X):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=a)}function h(e,t,a){o(e,a[2*t],a[2*t+1])}function d(e,t){var a=0;do{a|=1&e,e>>>=1,a<<=1}while(--t>0);return a>>>1}function _(e){16===e.bi_valid?(l(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}function f(e,t){var a,n,i,r,s,l,o=t.dyn_tree,h=t.max_code,d=t.stat_desc.static_tree,_=t.stat_desc.has_stree,f=t.stat_desc.extra_bits,u=t.stat_desc.extra_base,c=t.stat_desc.max_length,b=0;for(r=0;r<=G;r++)e.bl_count[r]=0;for(o[2*e.heap[e.heap_max]+1]=0,a=e.heap_max+1;a<Y;a++)n=e.heap[a],r=o[2*o[2*n+1]+1]+1,r>c&&(r=c,b++),o[2*n+1]=r,n>h||(e.bl_count[r]++,s=0,n>=u&&(s=f[n-u]),l=o[2*n],e.opt_len+=l*(r+s),_&&(e.static_len+=l*(d[2*n+1]+s)));if(0!==b){do{for(r=c-1;0===e.bl_count[r];)r--;e.bl_count[r]--,e.bl_count[r+1]+=2,e.bl_count[c]--,b-=2}while(b>0);for(r=c;0!==r;r--)for(n=e.bl_count[r];0!==n;)(i=e.heap[--a])>h||(o[2*i+1]!==r&&(e.opt_len+=(r-o[2*i+1])*o[2*i],o[2*i+1]=r),n--)}}function u(e,t,a){var n,i,r=new Array(G+1),s=0;for(n=1;n<=G;n++)r[n]=s=s+a[n-1]<<1;for(i=0;i<=t;i++){var l=e[2*i+1];0!==l&&(e[2*i]=d(r[l]++,l))}}function c(){var e,t,a,n,r,s=new Array(G+1);for(a=0,n=0;n<C-1;n++)for(le[n]=a,e=0;e<1<<$[n];e++)se[a++]=n;for(se[a-1]=n,r=0,n=0;n<16;n++)for(oe[n]=r,e=0;e<1<<ee[n];e++)re[r++]=n;for(r>>=7;n<K;n++)for(oe[n]=r<<7,e=0;e<1<<ee[n]-7;e++)re[256+r++]=n;for(t=0;t<=G;t++)s[t]=0;for(e=0;e<=143;)ne[2*e+1]=8,e++,s[8]++;for(;e<=255;)ne[2*e+1]=9,e++,s[9]++;for(;e<=279;)ne[2*e+1]=7,e++,s[7]++;for(;e<=287;)ne[2*e+1]=8,e++,s[8]++;for(u(ne,H+1,s),e=0;e<K;e++)ie[2*e+1]=5,ie[2*e]=d(e,5);he=new i(ne,$,P+1,H,G),de=new i(ie,ee,0,K,G),_e=new i(new Array(0),te,0,j,W)}function b(e){var t;for(t=0;t<H;t++)e.dyn_ltree[2*t]=0;for(t=0;t<K;t++)e.dyn_dtree[2*t]=0;for(t=0;t<j;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*q]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function g(e){e.bi_valid>8?l(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function m(e,t,a,n){g(e),n&&(l(e,a),l(e,~a)),T.arraySet(e.pending_buf,e.window,t,a,e.pending),e.pending+=a}function w(e,t,a,n){var i=2*t,r=2*a;return e[i]<e[r]||e[i]===e[r]&&n[t]<=n[a]}function p(e,t,a){for(var n=e.heap[a],i=a<<1;i<=e.heap_len&&(i<e.heap_len&&w(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!w(t,n,e.heap[i],e.depth));)e.heap[a]=e.heap[i],a=i,i<<=1;e.heap[a]=n}function v(e,t,a){var n,i,r,l,d=0;if(0!==e.last_lit)do{n=e.pending_buf[e.d_buf+2*d]<<8|e.pending_buf[e.d_buf+2*d+1],i=e.pending_buf[e.l_buf+d],d++,0===n?h(e,i,t):(r=se[i],h(e,r+P+1,t),l=$[r],0!==l&&(i-=le[r],o(e,i,l)),n--,r=s(n),h(e,r,a),0!==(l=ee[r])&&(n-=oe[r],o(e,n,l)))}while(d<e.last_lit);h(e,q,t)}function k(e,t){var a,n,i,r=t.dyn_tree,s=t.stat_desc.static_tree,l=t.stat_desc.has_stree,o=t.stat_desc.elems,h=-1;for(e.heap_len=0,e.heap_max=Y,a=0;a<o;a++)0!==r[2*a]?(e.heap[++e.heap_len]=h=a,e.depth[a]=0):r[2*a+1]=0;for(;e.heap_len<2;)i=e.heap[++e.heap_len]=h<2?++h:0,r[2*i]=1,e.depth[i]=0,e.opt_len--,l&&(e.static_len-=s[2*i+1]);for(t.max_code=h,a=e.heap_len>>1;a>=1;a--)p(e,r,a);i=o;do{a=e.heap[1],e.heap[1]=e.heap[e.heap_len--],p(e,r,1),n=e.heap[1],e.heap[--e.heap_max]=a,e.heap[--e.heap_max]=n,r[2*i]=r[2*a]+r[2*n],e.depth[i]=(e.depth[a]>=e.depth[n]?e.depth[a]:e.depth[n])+1,r[2*a+1]=r[2*n+1]=i,e.heap[1]=i++,p(e,r,1)}while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],f(e,t),u(r,h,e.bl_count)}function x(e,t,a){var n,i,r=-1,s=t[1],l=0,o=7,h=4;for(0===s&&(o=138,h=3),t[2*(a+1)+1]=65535,n=0;n<=a;n++)i=s,s=t[2*(n+1)+1],++l<o&&i===s||(l<h?e.bl_tree[2*i]+=l:0!==i?(i!==r&&e.bl_tree[2*i]++,e.bl_tree[2*J]++):l<=10?e.bl_tree[2*Q]++:e.bl_tree[2*V]++,l=0,r=i,0===s?(o=138,h=3):i===s?(o=6,h=3):(o=7,h=4))}function y(e,t,a){var n,i,r=-1,s=t[1],l=0,d=7,_=4;for(0===s&&(d=138,_=3),n=0;n<=a;n++)if(i=s,s=t[2*(n+1)+1],!(++l<d&&i===s)){if(l<_)do{h(e,i,e.bl_tree)}while(0!=--l);else 0!==i?(i!==r&&(h(e,i,e.bl_tree),l--),h(e,J,e.bl_tree),o(e,l-3,2)):l<=10?(h(e,Q,e.bl_tree),o(e,l-3,3)):(h(e,V,e.bl_tree),o(e,l-11,7));l=0,r=i,0===s?(d=138,_=3):i===s?(d=6,_=3):(d=7,_=4)}}function z(e){var t;for(x(e,e.dyn_ltree,e.l_desc.max_code),x(e,e.dyn_dtree,e.d_desc.max_code),k(e,e.bl_desc),t=j-1;t>=3&&0===e.bl_tree[2*ae[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}function E(e,t,a,n){var i;for(o(e,t-257,5),o(e,a-1,5),o(e,n-4,4),i=0;i<n;i++)o(e,e.bl_tree[2*ae[i]+1],3);y(e,e.dyn_ltree,t-1),y(e,e.dyn_dtree,a-1)}function A(e){var t,a=4093624447;for(t=0;t<=31;t++,a>>>=1)if(1&a&&0!==e.dyn_ltree[2*t])return D;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return U;for(t=32;t<P;t++)if(0!==e.dyn_ltree[2*t])return U;return D}function S(e){fe||(c(),fe=!0),e.l_desc=new r(e.dyn_ltree,he),e.d_desc=new r(e.dyn_dtree,de),e.bl_desc=new r(e.bl_tree,_e),e.bi_buf=0,e.bi_valid=0,b(e)}function Z(e,t,a,n){o(e,(F<<1)+(n?1:0),3),m(e,t,a,!0)}function R(e){o(e,L<<1,3),h(e,q,ne),_(e)}function B(e,t,a,n){var i,r,s=0;e.level>0?(e.strm.data_type===I&&(e.strm.data_type=A(e)),k(e,e.l_desc),k(e,e.d_desc),s=z(e),i=e.opt_len+3+7>>>3,(r=e.static_len+3+7>>>3)<=i&&(i=r)):i=r=a+5,a+4<=i&&-1!==t?Z(e,t,a,n):e.strategy===N||r===i?(o(e,(L<<1)+(n?1:0),3),v(e,ne,ie)):(o(e,(M<<1)+(n?1:0),3),E(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),v(e,e.dyn_ltree,e.dyn_dtree)),b(e),n&&g(e)}function O(e,t,a){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&a,e.last_lit++,0===t?e.dyn_ltree[2*a]++:(e.matches++,t--,e.dyn_ltree[2*(se[a]+P+1)]++,e.dyn_dtree[2*s(t)]++),e.last_lit===e.lit_bufsize-1}var T=a(0),N=4,D=0,U=1,I=2,F=0,L=1,M=2,C=29,P=256,H=P+1+C,K=30,j=19,Y=2*H+1,G=15,X=16,W=7,q=256,J=16,Q=17,V=18,$=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ee=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],te=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],ae=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],ne=new Array(2*(H+2));n(ne);var ie=new Array(2*K);n(ie);var re=new Array(512);n(re);var se=new Array(256);n(se);var le=new Array(C);n(le);var oe=new Array(K);n(oe);var he,de,_e,fe=!1;t._tr_init=S,t._tr_stored_block=Z,t._tr_flush_block=B,t._tr_tally=O,t._tr_align=R},function(e,t,a){"use strict";function n(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function i(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new w.Buf16(320),this.work=new w.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function r(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=F,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new w.Buf32(be),t.distcode=t.distdyn=new w.Buf32(ge),t.sane=1,t.back=-1,R):T}function s(e){var t;return e&&e.state?(t=e.state,t.wsize=0,t.whave=0,t.wnext=0,r(e)):T}function l(e,t){var a,n;return e&&e.state?(n=e.state,t<0?(a=0,t=-t):(a=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?T:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=a,n.wbits=t,s(e))):T}function o(e,t){var a,n;return e?(n=new i,e.state=n,n.window=null,a=l(e,t),a!==R&&(e.state=null),a):T}function h(e){return o(e,me)}function d(e){if(we){var t;for(g=new w.Buf32(512),m=new w.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(x(z,e.lens,0,288,g,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;x(E,e.lens,0,32,m,0,e.work,{bits:5}),we=!1}e.lencode=g,e.lenbits=9,e.distcode=m,e.distbits=5}function _(e,t,a,n){var i,r=e.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new w.Buf8(r.wsize)),n>=r.wsize?(w.arraySet(r.window,t,a-r.wsize,r.wsize,0),r.wnext=0,r.whave=r.wsize):(i=r.wsize-r.wnext,i>n&&(i=n),w.arraySet(r.window,t,a-n,i,r.wnext),n-=i,n?(w.arraySet(r.window,t,a-n,n,0),r.wnext=n,r.whave=r.wsize):(r.wnext+=i,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=i))),0}function f(e,t){var a,i,r,s,l,o,h,f,u,c,b,g,m,be,ge,me,we,pe,ve,ke,xe,ye,ze,Ee,Ae=0,Se=new w.Buf8(4),Ze=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return T;a=e.state,a.mode===W&&(a.mode=q),l=e.next_out,r=e.output,h=e.avail_out,s=e.next_in,i=e.input,o=e.avail_in,f=a.hold,u=a.bits,c=o,b=h,ye=R;e:for(;;)switch(a.mode){case F:if(0===a.wrap){a.mode=q;break}for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(2&a.wrap&&35615===f){a.check=0,Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0),f=0,u=0,a.mode=L;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&f)<<8)+(f>>8))%31){e.msg="incorrect header check",a.mode=fe;break}if((15&f)!==I){e.msg="unknown compression method",a.mode=fe;break}if(f>>>=4,u-=4,xe=8+(15&f),0===a.wbits)a.wbits=xe;else if(xe>a.wbits){e.msg="invalid window size",a.mode=fe;break}a.dmax=1<<xe,e.adler=a.check=1,a.mode=512&f?G:W,f=0,u=0;break;case L:for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(a.flags=f,(255&a.flags)!==I){e.msg="unknown compression method",a.mode=fe;break}if(57344&a.flags){e.msg="unknown header flags set",a.mode=fe;break}a.head&&(a.head.text=f>>8&1),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0,a.mode=M;case M:for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.head&&(a.head.time=f),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,Se[2]=f>>>16&255,Se[3]=f>>>24&255,a.check=v(a.check,Se,4,0)),f=0,u=0,a.mode=C;case C:for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.head&&(a.head.xflags=255&f,a.head.os=f>>8),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0,a.mode=P;case P:if(1024&a.flags){for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.length=f,a.head&&(a.head.extra_len=f),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0}else a.head&&(a.head.extra=null);a.mode=H;case H:if(1024&a.flags&&(g=a.length,g>o&&(g=o),g&&(a.head&&(xe=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),w.arraySet(a.head.extra,i,s,g,xe)),512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,a.length-=g),a.length))break e;a.length=0,a.mode=K;case K:if(2048&a.flags){if(0===o)break e;g=0;do{xe=i[s+g++],a.head&&xe&&a.length<65536&&(a.head.name+=String.fromCharCode(xe))}while(xe&&g<o);if(512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,xe)break e}else a.head&&(a.head.name=null);a.length=0,a.mode=j;case j:if(4096&a.flags){if(0===o)break e;g=0;do{xe=i[s+g++],a.head&&xe&&a.length<65536&&(a.head.comment+=String.fromCharCode(xe))}while(xe&&g<o);if(512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,xe)break e}else a.head&&(a.head.comment=null);a.mode=Y;case Y:if(512&a.flags){for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f!==(65535&a.check)){e.msg="header crc mismatch",a.mode=fe;break}f=0,u=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),e.adler=a.check=0,a.mode=W;break;case G:for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}e.adler=a.check=n(f),f=0,u=0,a.mode=X;case X:if(0===a.havedict)return e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,O;e.adler=a.check=1,a.mode=W;case W:if(t===S||t===Z)break e;case q:if(a.last){f>>>=7&u,u-=7&u,a.mode=he;break}for(;u<3;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}switch(a.last=1&f,f>>>=1,u-=1,3&f){case 0:a.mode=J;break;case 1:if(d(a),a.mode=ae,t===Z){f>>>=2,u-=2;break e}break;case 2:a.mode=$;break;case 3:e.msg="invalid block type",a.mode=fe}f>>>=2,u-=2;break;case J:for(f>>>=7&u,u-=7&u;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if((65535&f)!=(f>>>16^65535)){e.msg="invalid stored block lengths",a.mode=fe;break}if(a.length=65535&f,f=0,u=0,a.mode=Q,t===Z)break e;case Q:a.mode=V;case V:if(g=a.length){if(g>o&&(g=o),g>h&&(g=h),0===g)break e;w.arraySet(r,i,s,g,l),o-=g,s+=g,h-=g,l+=g,a.length-=g;break}a.mode=W;break;case $:for(;u<14;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(a.nlen=257+(31&f),f>>>=5,u-=5,a.ndist=1+(31&f),f>>>=5,u-=5,a.ncode=4+(15&f),f>>>=4,u-=4,a.nlen>286||a.ndist>30){e.msg="too many length or distance symbols",a.mode=fe;break}a.have=0,a.mode=ee;case ee:for(;a.have<a.ncode;){for(;u<3;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.lens[Ze[a.have++]]=7&f,f>>>=3,u-=3}for(;a.have<19;)a.lens[Ze[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,ze={bits:a.lenbits},ye=x(y,a.lens,0,19,a.lencode,0,a.work,ze),a.lenbits=ze.bits,ye){e.msg="invalid code lengths set",a.mode=fe;break}a.have=0,a.mode=te;case te:for(;a.have<a.nlen+a.ndist;){for(;Ae=a.lencode[f&(1<<a.lenbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(we<16)f>>>=ge,u-=ge,a.lens[a.have++]=we;else{if(16===we){for(Ee=ge+2;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f>>>=ge,u-=ge,0===a.have){e.msg="invalid bit length repeat",a.mode=fe;break}xe=a.lens[a.have-1],g=3+(3&f),f>>>=2,u-=2}else if(17===we){for(Ee=ge+3;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=ge,u-=ge,xe=0,g=3+(7&f),f>>>=3,u-=3}else{for(Ee=ge+7;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=ge,u-=ge,xe=0,g=11+(127&f),f>>>=7,u-=7}if(a.have+g>a.nlen+a.ndist){e.msg="invalid bit length repeat",a.mode=fe;break}for(;g--;)a.lens[a.have++]=xe}}if(a.mode===fe)break;if(0===a.lens[256]){e.msg="invalid code -- missing end-of-block",a.mode=fe;break}if(a.lenbits=9,ze={bits:a.lenbits},ye=x(z,a.lens,0,a.nlen,a.lencode,0,a.work,ze),a.lenbits=ze.bits,ye){e.msg="invalid literal/lengths set",a.mode=fe;break}if(a.distbits=6,a.distcode=a.distdyn,ze={bits:a.distbits},ye=x(E,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,ze),a.distbits=ze.bits,ye){e.msg="invalid distances set",a.mode=fe;break}if(a.mode=ae,t===Z)break e;case ae:a.mode=ne;case ne:if(o>=6&&h>=258){e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,k(e,b),l=e.next_out,r=e.output,h=e.avail_out,s=e.next_in,i=e.input,o=e.avail_in,f=a.hold,u=a.bits,a.mode===W&&(a.back=-1);break}for(a.back=0;Ae=a.lencode[f&(1<<a.lenbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(me&&0==(240&me)){for(pe=ge,ve=me,ke=we;Ae=a.lencode[ke+((f&(1<<pe+ve)-1)>>pe)],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(pe+ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=pe,u-=pe,a.back+=pe}if(f>>>=ge,u-=ge,a.back+=ge,a.length=we,0===me){a.mode=oe;break}if(32&me){a.back=-1,a.mode=W;break}if(64&me){e.msg="invalid literal/length code",a.mode=fe;break}a.extra=15&me,a.mode=ie;case ie:if(a.extra){for(Ee=a.extra;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.length+=f&(1<<a.extra)-1,f>>>=a.extra,u-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=re;case re:for(;Ae=a.distcode[f&(1<<a.distbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(0==(240&me)){for(pe=ge,ve=me,ke=we;Ae=a.distcode[ke+((f&(1<<pe+ve)-1)>>pe)],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(pe+ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=pe,u-=pe,a.back+=pe}if(f>>>=ge,u-=ge,a.back+=ge,64&me){e.msg="invalid distance code",a.mode=fe;break}a.offset=we,a.extra=15&me,a.mode=se;case se:if(a.extra){for(Ee=a.extra;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.offset+=f&(1<<a.extra)-1,f>>>=a.extra,u-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){e.msg="invalid distance too far back",a.mode=fe;break}a.mode=le;case le:if(0===h)break e;if(g=b-h,a.offset>g){if((g=a.offset-g)>a.whave&&a.sane){e.msg="invalid distance too far back",a.mode=fe;break}g>a.wnext?(g-=a.wnext,m=a.wsize-g):m=a.wnext-g,g>a.length&&(g=a.length),be=a.window}else be=r,m=l-a.offset,g=a.length;g>h&&(g=h),h-=g,a.length-=g;do{r[l++]=be[m++]}while(--g);0===a.length&&(a.mode=ne);break;case oe:if(0===h)break e;r[l++]=a.length,h--,a.mode=ne;break;case he:if(a.wrap){for(;u<32;){if(0===o)break e;o--,f|=i[s++]<<u,u+=8}if(b-=h,e.total_out+=b,a.total+=b,b&&(e.adler=a.check=a.flags?v(a.check,r,b,l-b):p(a.check,r,b,l-b)),b=h,(a.flags?f:n(f))!==a.check){e.msg="incorrect data check",a.mode=fe;break}f=0,u=0}a.mode=de;case de:if(a.wrap&&a.flags){for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f!==(4294967295&a.total)){e.msg="incorrect length check",a.mode=fe;break}f=0,u=0}a.mode=_e;case _e:ye=B;break e;case fe:ye=N;break e;case ue:return D;case ce:default:return T}return e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,(a.wsize||b!==e.avail_out&&a.mode<fe&&(a.mode<he||t!==A))&&_(e,e.output,e.next_out,b-e.avail_out)?(a.mode=ue,D):(c-=e.avail_in,b-=e.avail_out,e.total_in+=c,e.total_out+=b,a.total+=b,a.wrap&&b&&(e.adler=a.check=a.flags?v(a.check,r,b,e.next_out-b):p(a.check,r,b,e.next_out-b)),e.data_type=a.bits+(a.last?64:0)+(a.mode===W?128:0)+(a.mode===ae||a.mode===Q?256:0),(0===c&&0===b||t===A)&&ye===R&&(ye=U),ye)}function u(e){if(!e||!e.state)return T;var t=e.state;return t.window&&(t.window=null),e.state=null,R}function c(e,t){var a;return e&&e.state?(a=e.state,0==(2&a.wrap)?T:(a.head=t,t.done=!1,R)):T}function b(e,t){var a,n,i=t.length;return e&&e.state?(a=e.state,0!==a.wrap&&a.mode!==X?T:a.mode===X&&(n=1,(n=p(n,t,i,0))!==a.check)?N:_(e,t,i,i)?(a.mode=ue,D):(a.havedict=1,R)):T}var g,m,w=a(0),p=a(1),v=a(2),k=a(10),x=a(11),y=0,z=1,E=2,A=4,S=5,Z=6,R=0,B=1,O=2,T=-2,N=-3,D=-4,U=-5,I=8,F=1,L=2,M=3,C=4,P=5,H=6,K=7,j=8,Y=9,G=10,X=11,W=12,q=13,J=14,Q=15,V=16,$=17,ee=18,te=19,ae=20,ne=21,ie=22,re=23,se=24,le=25,oe=26,he=27,de=28,_e=29,fe=30,ue=31,ce=32,be=852,ge=592,me=15,we=!0;t.inflateReset=s,t.inflateReset2=l,t.inflateResetKeep=r,t.inflateInit=h,t.inflateInit2=o,t.inflate=f,t.inflateEnd=u,t.inflateGetHeader=c,t.inflateSetDictionary=b,t.inflateInfo="pako inflate (from Nodeca project)"},function(e,t,a){"use strict";e.exports=function(e,t){var a,n,i,r,s,l,o,h,d,_,f,u,c,b,g,m,w,p,v,k,x,y,z,E,A;a=e.state,n=e.next_in,E=e.input,i=n+(e.avail_in-5),r=e.next_out,A=e.output,s=r-(t-e.avail_out),l=r+(e.avail_out-257),o=a.dmax,h=a.wsize,d=a.whave,_=a.wnext,f=a.window,u=a.hold,c=a.bits,b=a.lencode,g=a.distcode,m=(1<<a.lenbits)-1,w=(1<<a.distbits)-1;e:do{c<15&&(u+=E[n++]<<c,c+=8,u+=E[n++]<<c,c+=8),p=b[u&m];t:for(;;){if(v=p>>>24,u>>>=v,c-=v,0===(v=p>>>16&255))A[r++]=65535&p;else{if(!(16&v)){if(0==(64&v)){p=b[(65535&p)+(u&(1<<v)-1)];continue t}if(32&v){a.mode=12;break e}e.msg="invalid literal/length code",a.mode=30;break e}k=65535&p,v&=15,v&&(c<v&&(u+=E[n++]<<c,c+=8),k+=u&(1<<v)-1,u>>>=v,c-=v),c<15&&(u+=E[n++]<<c,c+=8,u+=E[n++]<<c,c+=8),p=g[u&w];a:for(;;){if(v=p>>>24,u>>>=v,c-=v,!(16&(v=p>>>16&255))){if(0==(64&v)){p=g[(65535&p)+(u&(1<<v)-1)];continue a}e.msg="invalid distance code",a.mode=30;break e}if(x=65535&p,v&=15,c<v&&(u+=E[n++]<<c,(c+=8)<v&&(u+=E[n++]<<c,c+=8)),(x+=u&(1<<v)-1)>o){e.msg="invalid distance too far back",a.mode=30;break e}if(u>>>=v,c-=v,v=r-s,x>v){if((v=x-v)>d&&a.sane){e.msg="invalid distance too far back",a.mode=30;break e}if(y=0,z=f,0===_){if(y+=h-v,v<k){k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}}else if(_<v){if(y+=h+_-v,(v-=_)<k){k-=v;do{A[r++]=f[y++]}while(--v);if(y=0,_<k){v=_,k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}}}else if(y+=_-v,v<k){k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}for(;k>2;)A[r++]=z[y++],A[r++]=z[y++],A[r++]=z[y++],k-=3;k&&(A[r++]=z[y++],k>1&&(A[r++]=z[y++]))}else{y=r-x;do{A[r++]=A[y++],A[r++]=A[y++],A[r++]=A[y++],k-=3}while(k>2);k&&(A[r++]=A[y++],k>1&&(A[r++]=A[y++]))}break}}break}}while(n<i&&r<l);k=c>>3,n-=k,c-=k<<3,u&=(1<<c)-1,e.next_in=n,e.next_out=r,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=r<l?l-r+257:257-(r-l),a.hold=u,a.bits=c}},function(e,t,a){"use strict";var n=a(0),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],r=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],l=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(e,t,a,o,h,d,_,f){var u,c,b,g,m,w,p,v,k,x=f.bits,y=0,z=0,E=0,A=0,S=0,Z=0,R=0,B=0,O=0,T=0,N=null,D=0,U=new n.Buf16(16),I=new n.Buf16(16),F=null,L=0;for(y=0;y<=15;y++)U[y]=0;for(z=0;z<o;z++)U[t[a+z]]++;for(S=x,A=15;A>=1&&0===U[A];A--);if(S>A&&(S=A),0===A)return h[d++]=20971520,h[d++]=20971520,f.bits=1,0;for(E=1;E<A&&0===U[E];E++);for(S<E&&(S=E),B=1,y=1;y<=15;y++)if(B<<=1,(B-=U[y])<0)return-1;if(B>0&&(0===e||1!==A))return-1;for(I[1]=0,y=1;y<15;y++)I[y+1]=I[y]+U[y];for(z=0;z<o;z++)0!==t[a+z]&&(_[I[t[a+z]]++]=z);if(0===e?(N=F=_,w=19):1===e?(N=i,D-=257,F=r,L-=257,w=256):(N=s,F=l,w=-1),T=0,z=0,y=E,m=d,Z=S,R=0,b=-1,O=1<<S,g=O-1,1===e&&O>852||2===e&&O>592)return 1;for(;;){p=y-R,_[z]<w?(v=0,k=_[z]):_[z]>w?(v=F[L+_[z]],k=N[D+_[z]]):(v=96,k=0),u=1<<y-R,c=1<<Z,E=c;do{c-=u,h[m+(T>>R)+c]=p<<24|v<<16|k|0}while(0!==c);for(u=1<<y-1;T&u;)u>>=1;if(0!==u?(T&=u-1,T+=u):T=0,z++,0==--U[y]){if(y===A)break;y=t[a+_[z]]}if(y>S&&(T&g)!==b){for(0===R&&(R=S),m+=E,Z=y-R,B=1<<Z;Z+R<A&&!((B-=U[Z+R])<=0);)Z++,B<<=1;if(O+=1<<Z,1===e&&O>852||2===e&&O>592)return 1;b=T&g,h[b]=S<<24|Z<<16|m-d|0}}return 0!==T&&(h[m+T]=y-R<<24|64<<16|0),f.bits=S,0}},function(e,t,a){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}}]);';

//
// constants used for communication with the worker
//

var MESSAGE_INITIALIZE_WORKER = 'start';
var MESSAGE_INFLATE = 'inflate';
var MESSAGE_INFLATED_DATA_READY = 'inflated_ready';
var MESSAGE_DEFLATE = 'deflate';
var MESSAGE_DEFLATED_DATA_READY = 'deflated_ready';

var EOL = '\r\n';
var LINE_FEED = 10;
var CARRIAGE_RETURN = 13;
var LEFT_CURLY_BRACKET = 123;
var RIGHT_CURLY_BRACKET = 125;

var ASCII_PLUS = 43;

// State tracking when constructing an IMAP command from buffers.
var BUFFER_STATE_LITERAL = 'literal';
var BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1 = 'literal_length_1';
var BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2 = 'literal_length_2';
var BUFFER_STATE_DEFAULT = 'default';

/**
 * How much time to wait since the last response until the connection is considered idling
 */
var TIMEOUT_ENTER_IDLE = 1000;

/**
 * Lower Bound for socket timeout to wait since the last data was written to a socket
 */
var TIMEOUT_SOCKET_LOWER_BOUND = 10000;

/**
 * Multiplier for socket timeout:
 *
 * We assume at least a GPRS connection with 115 kb/s = 14,375 kB/s tops, so 10 KB/s to be on
 * the safe side. We can timeout after a lower bound of 10s + (n KB / 10 KB/s). A 1 MB message
 * upload would be 110 seconds to wait for the timeout. 10 KB/s === 0.1 s/B
 */
var TIMEOUT_SOCKET_MULTIPLIER = 0.1;

/**
 * Creates a connection object to an IMAP server. Call `connect` method to inititate
 * the actual connection, the constructor only defines the properties but does not actually connect.
 *
 * @constructor
 *
 * @param {String} [host='localhost'] Hostname to conenct to
 * @param {Number} [port=143] Port number to connect to
 * @param {Object} [options] Optional options object
 * @param {Boolean} [options.useSecureTransport] Set to true, to use encrypted connection
 * @param {String} [options.compressionWorkerPath] offloads de-/compression computation to a web worker, this is the path to the browserified emailjs-compressor-worker.js
 */

var Imap = function () {
  function Imap(host, port) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Imap);

    this.timeoutEnterIdle = TIMEOUT_ENTER_IDLE;
    this.timeoutSocketLowerBound = TIMEOUT_SOCKET_LOWER_BOUND;
    this.timeoutSocketMultiplier = TIMEOUT_SOCKET_MULTIPLIER;
    this.onDataTimeout = this.timeoutSocketLowerBound + Math.floor(4096 * this.timeoutSocketMultiplier);

    this.options = options;

    this.port = port || (this.options.useSecureTransport ? 993 : 143);
    this.host = host || 'localhost';

    // Use a TLS connection. Port 993 also forces TLS.
    this.options.useSecureTransport = 'useSecureTransport' in this.options ? !!this.options.useSecureTransport : this.port === 993;

    this.secureMode = !!this.options.useSecureTransport; // Does the connection use SSL/TLS

    this._connectionReady = false; // Is the conection established and greeting is received from the server

    this._globalAcceptUntagged = {}; // Global handlers for unrelated responses (EXPUNGE, EXISTS etc.)

    this._clientQueue = []; // Queue of outgoing commands
    this._canSend = false; // Is it OK to send something to the server
    this._tagCounter = 0; // Counter to allow uniqueue imap tags
    this._currentCommand = false; // Current command that is waiting for response from the server

    this._idleTimer = false; // Timer waiting to enter idle
    this._socketTimeoutTimer = false; // Timer waiting to declare the socket dead starting from the last write

    this.compressed = false; // Is the connection compressed and needs inflating/deflating

    //
    // HELPERS
    //

    // As the server sends data in chunks, it needs to be split into separate lines. Helps parsing the input.
    this._incomingBuffers = [];
    this._bufferState = BUFFER_STATE_DEFAULT;
    this._literalRemaining = 0;

    //
    // Event placeholders, may be overriden with callback functions
    //
    this.oncert = null;
    this.onerror = null; // Irrecoverable error occurred. Connection to the server will be closed automatically.
    this.onready = null; // The connection to the server has been established and greeting is received
    this.onidle = null; // There are no more commands to process
  }

  // PUBLIC METHODS

  /**
   * Initiate a connection to the server. Wait for onready event
   *
   * @param {Object} Socket
   *     TESTING ONLY! The TCPSocket has a pretty nonsensical convenience constructor,
   *     which makes it hard to mock. For dependency-injection purposes, we use the
   *     Socket parameter to pass in a mock Socket implementation. Should be left blank
   *     in production use!
   * @returns {Promise} Resolves when socket is opened
   */


  _createClass(Imap, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      var Socket = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emailjsTcpSocket2.default;

      return new Promise(function (resolve, reject) {
        _this.socket = Socket.open(_this.host, _this.port, {
          binaryType: 'arraybuffer',
          useSecureTransport: _this.secureMode,
          ca: _this.options.ca
        });

        // allows certificate handling for platform w/o native tls support
        // oncert is non standard so setting it might throw if the socket object is immutable
        try {
          _this.socket.oncert = function (cert) {
            _this.oncert && _this.oncert(cert);
          };
        } catch (E) {}

        // Connection closing unexpected is an error
        _this.socket.onclose = function () {
          return _this._onError(new Error('Socket closed unexceptedly!'));
        };
        _this.socket.ondata = function (evt) {
          try {
            _this._onData(evt);
          } catch (err) {
            _this._onError(err);
          }
        };

        // if an error happens during create time, reject the promise
        _this.socket.onerror = function (e) {
          reject(new Error('Could not open socket: ' + e.data.message));
        };

        _this.socket.onopen = function () {
          // use proper "irrecoverable error, tear down everything"-handler only after socket is open
          _this.socket.onerror = function (e) {
            return _this._onError(e);
          };
          resolve();
        };
      });
    }

    /**
     * Closes the connection to the server
     *
     * @returns {Promise} Resolves when the socket is closed
     */

  }, {
    key: 'close',
    value: function close(error) {
      var _this2 = this;

      return new Promise(function (resolve) {
        var tearDown = function tearDown() {
          // fulfill pending promises
          _this2._clientQueue.forEach(function (cmd) {
            return cmd.callback(error);
          });
          if (_this2._currentCommand) {
            _this2._currentCommand.callback(error);
          }

          _this2._clientQueue = [];
          _this2._currentCommand = false;

          clearTimeout(_this2._idleTimer);
          _this2._idleTimer = null;

          clearTimeout(_this2._socketTimeoutTimer);
          _this2._socketTimeoutTimer = null;

          if (_this2.socket) {
            // remove all listeners
            _this2.socket.onopen = null;
            _this2.socket.onclose = null;
            _this2.socket.ondata = null;
            _this2.socket.onerror = null;
            try {
              _this2.socket.oncert = null;
            } catch (E) {}

            _this2.socket = null;
          }

          resolve();
        };

        _this2._disableCompression();

        if (!_this2.socket || _this2.socket.readyState !== 'open') {
          return tearDown();
        }

        _this2.socket.onclose = _this2.socket.onerror = tearDown; // we don't really care about the error here
        _this2.socket.close();
      });
    }

    /**
     * Send LOGOUT to the server.
     *
     * Use is discouraged!
     *
     * @returns {Promise} Resolves when connection is closed by server.
     */

  }, {
    key: 'logout',
    value: function logout() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.socket.onclose = _this3.socket.onerror = function () {
          _this3.close('Client logging out').then(resolve).catch(reject);
        };

        _this3.enqueueCommand('LOGOUT');
      });
    }

    /**
     * Initiates TLS handshake
     */

  }, {
    key: 'upgrade',
    value: function upgrade() {
      this.secureMode = true;
      this.socket.upgradeToSecure();
    }

    /**
     * Schedules a command to be sent to the server.
     * See https://github.com/emailjs/emailjs-imap-handler for request structure.
     * Do not provide a tag property, it will be set by the queue manager.
     *
     * To catch untagged responses use acceptUntagged property. For example, if
     * the value for it is 'FETCH' then the reponse includes 'payload.FETCH' property
     * that is an array including all listed * FETCH responses.
     *
     * @param {Object} request Structured request object
     * @param {Array} acceptUntagged a list of untagged responses that will be included in 'payload' property
     * @param {Object} [options] Optional data for the command payload
     * @returns {Promise} Promise that resolves when the corresponding response was received
     */

  }, {
    key: 'enqueueCommand',
    value: function enqueueCommand(request, acceptUntagged, options) {
      var _this4 = this;

      if (typeof request === 'string') {
        request = {
          command: request
        };
      }

      acceptUntagged = [].concat(acceptUntagged || []).map(function (untagged) {
        return (untagged || '').toString().toUpperCase().trim();
      });

      var tag = 'W' + ++this._tagCounter;
      request.tag = tag;

      return new Promise(function (resolve, reject) {
        var data = {
          tag: tag,
          request: request,
          payload: acceptUntagged.length ? {} : undefined,
          callback: function callback(response) {
            if (_this4.isError(response)) {
              return reject(response);
            } else if (['NO', 'BAD'].indexOf((0, _ramda.propOr)('', 'command', response).toUpperCase().trim()) >= 0) {
              var error = new Error(response.humanReadable || 'Error');
              if (response.code) {
                error.code = response.code;
              }
              return reject(error);
            }

            resolve(response);
          }

          // apply any additional options to the command
        };Object.keys(options || {}).forEach(function (key) {
          data[key] = options[key];
        });

        acceptUntagged.forEach(function (command) {
          data.payload[command] = [];
        });

        // if we're in priority mode (i.e. we ran commands in a precheck),
        // queue any commands BEFORE the command that contianed the precheck,
        // otherwise just queue command as usual
        var index = data.ctx ? _this4._clientQueue.indexOf(data.ctx) : -1;
        if (index >= 0) {
          data.tag += '.p';
          data.request.tag += '.p';
          _this4._clientQueue.splice(index, 0, data);
        } else {
          _this4._clientQueue.push(data);
        }

        if (_this4._canSend) {
          _this4._sendRequest();
        }
      });
    }

    /**
     *
     * @param commands
     * @param ctx
     * @returns {*}
     */

  }, {
    key: 'getPreviouslyQueued',
    value: function getPreviouslyQueued(commands, ctx) {
      var startIndex = this._clientQueue.indexOf(ctx) - 1;

      // search backwards for the commands and return the first found
      for (var i = startIndex; i >= 0; i--) {
        if (isMatch(this._clientQueue[i])) {
          return this._clientQueue[i];
        }
      }

      // also check current command if no SELECT is queued
      if (isMatch(this._currentCommand)) {
        return this._currentCommand;
      }

      return false;

      function isMatch(data) {
        return data && data.request && commands.indexOf(data.request.command) >= 0;
      }
    }

    /**
     * Send data to the TCP socket
     * Arms a timeout waiting for a response from the server.
     *
     * @param {String} str Payload
     */

  }, {
    key: 'send',
    value: function send(str) {
      var _this5 = this;

      var buffer = (0, _common.toTypedArray)(str).buffer;
      var timeout = this.timeoutSocketLowerBound + Math.floor(buffer.byteLength * this.timeoutSocketMultiplier);

      clearTimeout(this._socketTimeoutTimer); // clear pending timeouts
      this._socketTimeoutTimer = setTimeout(function () {
        return _this5._onError(new Error(' Socket timed out!'));
      }, timeout); // arm the next timeout

      if (this.compressed) {
        this._sendCompressed(buffer);
      } else {
        this.socket.send(buffer);
      }
    }

    /**
     * Set a global handler for an untagged response. If currently processed command
     * has not listed untagged command it is forwarded to the global handler. Useful
     * with EXPUNGE, EXISTS etc.
     *
     * @param {String} command Untagged command name
     * @param {Function} callback Callback function with response object and continue callback function
     */

  }, {
    key: 'setHandler',
    value: function setHandler(command, callback) {
      this._globalAcceptUntagged[command.toUpperCase().trim()] = callback;
    }

    // INTERNAL EVENTS

    /**
     * Error handler for the socket
     *
     * @event
     * @param {Event} evt Event object. See evt.data for the error
     */

  }, {
    key: '_onError',
    value: function _onError(evt) {
      var _this6 = this;

      var error;
      if (this.isError(evt)) {
        error = evt;
      } else if (evt && this.isError(evt.data)) {
        error = evt.data;
      } else {
        error = new Error(evt && evt.data && evt.data.message || evt.data || evt || 'Error');
      }

      this.logger.error(error);

      // always call onerror callback, no matter if close() succeeds or fails
      this.close(error).then(function () {
        _this6.onerror && _this6.onerror(error);
      }, function () {
        _this6.onerror && _this6.onerror(error);
      });
    }

    /**
     * Handler for incoming data from the server. The data is sent in arbitrary
     * chunks and can't be used directly so this function makes sure the data
     * is split into complete lines before the data is passed to the command
     * handler
     *
     * @param {Event} evt
     */

  }, {
    key: '_onData',
    value: function _onData(evt) {
      var _this7 = this;

      clearTimeout(this._socketTimeoutTimer); // reset the timeout on each data packet
      this._socketTimeoutTimer = setTimeout(function () {
        return _this7._onError(new Error(' Socket timed out!'));
      }, this.ON_DATA_TIMEOUT);

      this._incomingBuffers.push(new Uint8Array(evt.data)); // append to the incoming buffer
      this._parseIncomingCommands(this._iterateIncomingBuffer()); // Consume the incoming buffer
    }
  }, {
    key: '_iterateIncomingBuffer',
    value: /*#__PURE__*/regeneratorRuntime.mark(function _iterateIncomingBuffer() {
      var buf, i, diff, start, latest, prevBuf, leftIdx, leftOfLeftCurly, LFidx, commandLength, command, index, uint8Array, remainingLength, excessLength;
      return regeneratorRuntime.wrap(function _iterateIncomingBuffer$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              buf = this._incomingBuffers[this._incomingBuffers.length - 1] || [];
              i = 0;

              // loop invariant:
              //   this._incomingBuffers starts with the beginning of incoming command.
              //   buf is shorthand for last element of this._incomingBuffers.
              //   buf[0..i-1] is part of incoming command.

            case 2:
              if (!(i < buf.length)) {
                _context.next = 49;
                break;
              }

              _context.t0 = this._bufferState;
              _context.next = _context.t0 === BUFFER_STATE_LITERAL ? 6 : _context.t0 === BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2 ? 11 : _context.t0 === BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1 ? 13 : 18;
              break;

            case 6:
              diff = Math.min(buf.length - i, this._literalRemaining);

              this._literalRemaining -= diff;
              i += diff;
              if (this._literalRemaining === 0) {
                this._bufferState = BUFFER_STATE_DEFAULT;
              }
              return _context.abrupt('continue', 2);

            case 11:
              if (i < buf.length) {
                if (buf[i] === CARRIAGE_RETURN) {
                  this._literalRemaining = Number((0, _common.fromTypedArray)(this._lengthBuffer)) + 2; // for CRLF
                  this._bufferState = BUFFER_STATE_LITERAL;
                } else {
                  this._bufferState = BUFFER_STATE_DEFAULT;
                }
                delete this._lengthBuffer;
              }
              return _context.abrupt('continue', 2);

            case 13:
              start = i;

              while (i < buf.length && buf[i] >= 48 && buf[i] <= 57) {
                // digits
                i++;
              }
              if (start !== i) {
                latest = buf.subarray(start, i);
                prevBuf = this._lengthBuffer;

                this._lengthBuffer = new Uint8Array(prevBuf.length + latest.length);
                this._lengthBuffer.set(prevBuf);
                this._lengthBuffer.set(latest, prevBuf.length);
              }
              if (i < buf.length) {
                if (this._lengthBuffer.length > 0 && buf[i] === RIGHT_CURLY_BRACKET) {
                  this._bufferState = BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2;
                } else {
                  delete this._lengthBuffer;
                  this._bufferState = BUFFER_STATE_DEFAULT;
                }
                i++;
              }
              return _context.abrupt('continue', 2);

            case 18:
              // find literal length
              leftIdx = buf.indexOf(LEFT_CURLY_BRACKET, i);

              if (!(leftIdx > -1)) {
                _context.next = 26;
                break;
              }

              leftOfLeftCurly = new Uint8Array(buf.buffer, i, leftIdx - i);

              if (!(leftOfLeftCurly.indexOf(LINE_FEED) === -1)) {
                _context.next = 26;
                break;
              }

              i = leftIdx + 1;
              this._lengthBuffer = new Uint8Array(0);
              this._bufferState = BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1;
              return _context.abrupt('continue', 2);

            case 26:

              // find end of command
              LFidx = buf.indexOf(LINE_FEED, i);

              if (!(LFidx > -1)) {
                _context.next = 46;
                break;
              }

              if (LFidx < buf.length - 1) {
                this._incomingBuffers[this._incomingBuffers.length - 1] = new Uint8Array(buf.buffer, 0, LFidx + 1);
              }
              commandLength = this._incomingBuffers.reduce(function (prev, curr) {
                return prev + curr.length;
              }, 0) - 2; // 2 for CRLF

              command = new Uint8Array(commandLength);
              index = 0;

              while (this._incomingBuffers.length > 0) {
                uint8Array = this._incomingBuffers.shift();
                remainingLength = commandLength - index;

                if (uint8Array.length > remainingLength) {
                  excessLength = uint8Array.length - remainingLength;

                  uint8Array = uint8Array.subarray(0, -excessLength);

                  if (this._incomingBuffers.length > 0) {
                    this._incomingBuffers = [];
                  }
                }
                command.set(uint8Array, index);
                index += uint8Array.length;
              }
              _context.next = 35;
              return command;

            case 35:
              if (!(LFidx < buf.length - 1)) {
                _context.next = 41;
                break;
              }

              buf = new Uint8Array(buf.subarray(LFidx + 1));
              this._incomingBuffers.push(buf);
              i = 0;
              _context.next = 44;
              break;

            case 41:
              // clear the timeout when an entire command has arrived
              // and not waiting on more data for next command
              clearTimeout(this._socketTimeoutTimer);
              this._socketTimeoutTimer = null;
              return _context.abrupt('return');

            case 44:
              _context.next = 47;
              break;

            case 46:
              return _context.abrupt('return');

            case 47:
              _context.next = 2;
              break;

            case 49:
            case 'end':
              return _context.stop();
          }
        }
      }, _iterateIncomingBuffer, this);
    })

    // PRIVATE METHODS

    /**
     * Processes a command from the queue. The command is parsed and feeded to a handler
     */

  }, {
    key: '_parseIncomingCommands',
    value: function _parseIncomingCommands(commands) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = commands[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var command = _step.value;

          this._clearIdle();

          /*
           * The "+"-tagged response is a special case:
           * Either the server can asks for the next chunk of data, e.g. for the AUTHENTICATE command.
           *
           * Or there was an error in the XOAUTH2 authentication, for which SASL initial client response extension
           * dictates the client sends an empty EOL response to the challenge containing the error message.
           *
           * Details on "+"-tagged response:
           *   https://tools.ietf.org/html/rfc3501#section-2.2.1
           */
          //
          if (command[0] === ASCII_PLUS) {
            if (this._currentCommand.data.length) {
              // feed the next chunk of data
              var chunk = this._currentCommand.data.shift();
              chunk += !this._currentCommand.data.length ? EOL : ''; // EOL if there's nothing more to send
              this.send(chunk);
            } else if (this._currentCommand.errorResponseExpectsEmptyLine) {
              this.send(EOL); // XOAUTH2 empty response, error will be reported when server continues with NO response
            }
            continue;
          }

          var response;
          try {
            var valueAsString = this._currentCommand.request && this._currentCommand.request.valueAsString;
            response = (0, _emailjsImapHandler.parser)(command, { valueAsString: valueAsString });
            this.logger.debug('S:', function () {
              return (0, _emailjsImapHandler.compiler)(response, false, true);
            });
          } catch (e) {
            this.logger.error('Error parsing imap command!', response);
            return this._onError(e);
          }

          this._processResponse(response);
          this._handleResponse(response);

          // first response from the server, connection is now usable
          if (!this._connectionReady) {
            this._connectionReady = true;
            this.onready && this.onready();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Feeds a parsed response object to an appropriate handler
     *
     * @param {Object} response Parsed command object
     */

  }, {
    key: '_handleResponse',
    value: function _handleResponse(response) {
      var command = (0, _ramda.propOr)('', 'command', response).toUpperCase().trim();

      if (!this._currentCommand) {
        // unsolicited untagged response
        if (response.tag === '*' && command in this._globalAcceptUntagged) {
          this._globalAcceptUntagged[command](response);
          this._canSend = true;
          this._sendRequest();
        }
      } else if (this._currentCommand.payload && response.tag === '*' && command in this._currentCommand.payload) {
        // expected untagged response
        this._currentCommand.payload[command].push(response);
      } else if (response.tag === '*' && command in this._globalAcceptUntagged) {
        // unexpected untagged response
        this._globalAcceptUntagged[command](response);
      } else if (response.tag === this._currentCommand.tag) {
        // tagged response
        if (this._currentCommand.payload && Object.keys(this._currentCommand.payload).length) {
          response.payload = this._currentCommand.payload;
        }
        this._currentCommand.callback(response);
        this._canSend = true;
        this._sendRequest();
      }
    }

    /**
     * Sends a command from client queue to the server.
     */

  }, {
    key: '_sendRequest',
    value: function _sendRequest() {
      var _this8 = this;

      if (!this._clientQueue.length) {
        return this._enterIdle();
      }
      this._clearIdle();

      // an operation was made in the precheck, no need to restart the queue manually
      this._restartQueue = false;

      var command = this._clientQueue[0];
      if (typeof command.precheck === 'function') {
        // remember the context
        var context = command;
        var precheck = context.precheck;
        delete context.precheck;

        // we need to restart the queue handling if no operation was made in the precheck
        this._restartQueue = true;

        // invoke the precheck command and resume normal operation after the promise resolves
        precheck(context).then(function () {
          // we're done with the precheck
          if (_this8._restartQueue) {
            // we need to restart the queue handling
            _this8._sendRequest();
          }
        }).catch(function (err) {
          // precheck failed, so we remove the initial command
          // from the queue, invoke its callback and resume normal operation
          var cmd = void 0;
          var index = _this8._clientQueue.indexOf(context);
          if (index >= 0) {
            cmd = _this8._clientQueue.splice(index, 1)[0];
          }
          if (cmd && cmd.callback) {
            cmd.callback(err);
            _this8._canSend = true;
            _this8._parseIncomingCommands(_this8._iterateIncomingBuffer()); // Consume the rest of the incoming buffer
            _this8._sendRequest(); // continue sending
          }
        });
        return;
      }

      this._canSend = false;
      this._currentCommand = this._clientQueue.shift();

      try {
        this._currentCommand.data = (0, _emailjsImapHandler.compiler)(this._currentCommand.request, true);
        this.logger.debug('C:', function () {
          return (0, _emailjsImapHandler.compiler)(_this8._currentCommand.request, false, true);
        }); // excludes passwords etc.
      } catch (e) {
        this.logger.error('Error compiling imap command!', this._currentCommand.request);
        return this._onError(new Error('Error compiling imap command!'));
      }

      var data = this._currentCommand.data.shift();

      this.send(data + (!this._currentCommand.data.length ? EOL : ''));
      return this.waitDrain;
    }

    /**
     * Emits onidle, noting to do currently
     */

  }, {
    key: '_enterIdle',
    value: function _enterIdle() {
      var _this9 = this;

      clearTimeout(this._idleTimer);
      this._idleTimer = setTimeout(function () {
        return _this9.onidle && _this9.onidle();
      }, this.timeoutEnterIdle);
    }

    /**
     * Cancel idle timer
     */

  }, {
    key: '_clearIdle',
    value: function _clearIdle() {
      clearTimeout(this._idleTimer);
      this._idleTimer = null;
    }

    /**
     * Method processes a response into an easier to handle format.
     * Add untagged numbered responses (e.g. FETCH) into a nicely feasible form
     * Checks if a response includes optional response codes
     * and copies these into separate properties. For example the
     * following response includes a capability listing and a human
     * readable message:
     *
     *     * OK [CAPABILITY ID NAMESPACE] All ready
     *
     * This method adds a 'capability' property with an array value ['ID', 'NAMESPACE']
     * to the response object. Additionally 'All ready' is added as 'humanReadable' property.
     *
     * See possiblem IMAP Response Codes at https://tools.ietf.org/html/rfc5530
     *
     * @param {Object} response Parsed response object
     */

  }, {
    key: '_processResponse',
    value: function _processResponse(response) {
      var command = (0, _ramda.propOr)('', 'command', response).toUpperCase().trim();

      // no attributes
      if (!response || !response.attributes || !response.attributes.length) {
        return;
      }

      // untagged responses w/ sequence numbers
      if (response.tag === '*' && /^\d+$/.test(response.command) && response.attributes[0].type === 'ATOM') {
        response.nr = Number(response.command);
        response.command = (response.attributes.shift().value || '').toString().toUpperCase().trim();
      }

      // no optional response code
      if (['OK', 'NO', 'BAD', 'BYE', 'PREAUTH'].indexOf(command) < 0) {
        return;
      }

      // If last element of the response is TEXT then this is for humans
      if (response.attributes[response.attributes.length - 1].type === 'TEXT') {
        response.humanReadable = response.attributes[response.attributes.length - 1].value;
      }

      // Parse and format ATOM values
      if (response.attributes[0].type === 'ATOM' && response.attributes[0].section) {
        var option = response.attributes[0].section.map(function (key) {
          if (!key) {
            return;
          }
          if (Array.isArray(key)) {
            return key.map(function (key) {
              return (key.value || '').toString().trim();
            });
          } else {
            return (key.value || '').toString().toUpperCase().trim();
          }
        });

        var key = option.shift();
        response.code = key;

        if (option.length === 1) {
          response[key.toLowerCase()] = option[0];
        } else if (option.length > 1) {
          response[key.toLowerCase()] = option;
        }
      }
    }

    /**
     * Checks if a value is an Error object
     *
     * @param {Mixed} value Value to be checked
     * @return {Boolean} returns true if the value is an Error
     */

  }, {
    key: 'isError',
    value: function isError(value) {
      return !!Object.prototype.toString.call(value).match(/Error\]$/);
    }

    // COMPRESSION RELATED METHODS

    /**
     * Sets up deflate/inflate for the IO
     */

  }, {
    key: 'enableCompression',
    value: function enableCompression() {
      var _this10 = this;

      this._socketOnData = this.socket.ondata;
      this.compressed = true;

      if (typeof window !== 'undefined' && window.Worker) {
        this._compressionWorker = new Worker(URL.createObjectURL(new Blob([CompressionBlob])));
        this._compressionWorker.onmessage = function (e) {
          var message = e.data.message;
          var data = e.data.buffer;

          switch (message) {
            case MESSAGE_INFLATED_DATA_READY:
              _this10._socketOnData({ data: data });
              break;

            case MESSAGE_DEFLATED_DATA_READY:
              _this10.waitDrain = _this10.socket.send(data);
              break;
          }
        };

        this._compressionWorker.onerror = function (e) {
          _this10._onError(new Error('Error handling compression web worker: ' + e.message));
        };

        this._compressionWorker.postMessage(createMessage(MESSAGE_INITIALIZE_WORKER));
      } else {
        var inflatedReady = function inflatedReady(buffer) {
          _this10._socketOnData({ data: buffer });
        };
        var deflatedReady = function deflatedReady(buffer) {
          _this10.waitDrain = _this10.socket.send(buffer);
        };
        this._compression = new _compression2.default(inflatedReady, deflatedReady);
      }

      // override data handler, decompress incoming data
      this.socket.ondata = function (evt) {
        if (!_this10.compressed) {
          return;
        }

        if (_this10._compressionWorker) {
          _this10._compressionWorker.postMessage(createMessage(MESSAGE_INFLATE, evt.data), [evt.data]);
        } else {
          _this10._compression.inflate(evt.data);
        }
      };
    }

    /**
     * Undoes any changes related to compression. This only be called when closing the connection
     */

  }, {
    key: '_disableCompression',
    value: function _disableCompression() {
      if (!this.compressed) {
        return;
      }

      this.compressed = false;
      this.socket.ondata = this._socketOnData;
      this._socketOnData = null;

      if (this._compressionWorker) {
        // terminate the worker
        this._compressionWorker.terminate();
        this._compressionWorker = null;
      }
    }

    /**
     * Outgoing payload needs to be compressed and sent to socket
     *
     * @param {ArrayBuffer} buffer Outgoing uncompressed arraybuffer
     */

  }, {
    key: '_sendCompressed',
    value: function _sendCompressed(buffer) {
      // deflate
      if (this._compressionWorker) {
        this._compressionWorker.postMessage(createMessage(MESSAGE_DEFLATE, buffer), [buffer]);
      } else {
        this._compression.deflate(buffer);
      }
    }
  }]);

  return Imap;
}();

exports.default = Imap;


var createMessage = function createMessage(message, buffer) {
  return { message: message, buffer: buffer };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLmpzIl0sIm5hbWVzIjpbIk1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIiLCJNRVNTQUdFX0lORkxBVEUiLCJNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFkiLCJNRVNTQUdFX0RFRkxBVEUiLCJNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkiLCJFT0wiLCJMSU5FX0ZFRUQiLCJDQVJSSUFHRV9SRVRVUk4iLCJMRUZUX0NVUkxZX0JSQUNLRVQiLCJSSUdIVF9DVVJMWV9CUkFDS0VUIiwiQVNDSUlfUExVUyIsIkJVRkZFUl9TVEFURV9MSVRFUkFMIiwiQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzEiLCJCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMiIsIkJVRkZFUl9TVEFURV9ERUZBVUxUIiwiVElNRU9VVF9FTlRFUl9JRExFIiwiVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkQiLCJUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSIiwiSW1hcCIsImhvc3QiLCJwb3J0Iiwib3B0aW9ucyIsInRpbWVvdXRFbnRlcklkbGUiLCJ0aW1lb3V0U29ja2V0TG93ZXJCb3VuZCIsInRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyIiwib25EYXRhVGltZW91dCIsIk1hdGgiLCJmbG9vciIsInVzZVNlY3VyZVRyYW5zcG9ydCIsInNlY3VyZU1vZGUiLCJfY29ubmVjdGlvblJlYWR5IiwiX2dsb2JhbEFjY2VwdFVudGFnZ2VkIiwiX2NsaWVudFF1ZXVlIiwiX2NhblNlbmQiLCJfdGFnQ291bnRlciIsIl9jdXJyZW50Q29tbWFuZCIsIl9pZGxlVGltZXIiLCJfc29ja2V0VGltZW91dFRpbWVyIiwiY29tcHJlc3NlZCIsIl9pbmNvbWluZ0J1ZmZlcnMiLCJfYnVmZmVyU3RhdGUiLCJfbGl0ZXJhbFJlbWFpbmluZyIsIm9uY2VydCIsIm9uZXJyb3IiLCJvbnJlYWR5Iiwib25pZGxlIiwiU29ja2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzb2NrZXQiLCJvcGVuIiwiYmluYXJ5VHlwZSIsImNhIiwiY2VydCIsIkUiLCJvbmNsb3NlIiwiX29uRXJyb3IiLCJFcnJvciIsIm9uZGF0YSIsImV2dCIsIl9vbkRhdGEiLCJlcnIiLCJlIiwiZGF0YSIsIm1lc3NhZ2UiLCJvbm9wZW4iLCJlcnJvciIsInRlYXJEb3duIiwiZm9yRWFjaCIsImNtZCIsImNhbGxiYWNrIiwiY2xlYXJUaW1lb3V0IiwiX2Rpc2FibGVDb21wcmVzc2lvbiIsInJlYWR5U3RhdGUiLCJjbG9zZSIsInRoZW4iLCJjYXRjaCIsImVucXVldWVDb21tYW5kIiwidXBncmFkZVRvU2VjdXJlIiwicmVxdWVzdCIsImFjY2VwdFVudGFnZ2VkIiwiY29tbWFuZCIsImNvbmNhdCIsIm1hcCIsInVudGFnZ2VkIiwidG9TdHJpbmciLCJ0b1VwcGVyQ2FzZSIsInRyaW0iLCJ0YWciLCJwYXlsb2FkIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwicmVzcG9uc2UiLCJpc0Vycm9yIiwiaW5kZXhPZiIsImh1bWFuUmVhZGFibGUiLCJjb2RlIiwiT2JqZWN0Iiwia2V5cyIsImtleSIsImluZGV4IiwiY3R4Iiwic3BsaWNlIiwicHVzaCIsIl9zZW5kUmVxdWVzdCIsImNvbW1hbmRzIiwic3RhcnRJbmRleCIsImkiLCJpc01hdGNoIiwic3RyIiwiYnVmZmVyIiwidGltZW91dCIsImJ5dGVMZW5ndGgiLCJzZXRUaW1lb3V0IiwiX3NlbmRDb21wcmVzc2VkIiwic2VuZCIsImxvZ2dlciIsIk9OX0RBVEFfVElNRU9VVCIsIlVpbnQ4QXJyYXkiLCJfcGFyc2VJbmNvbWluZ0NvbW1hbmRzIiwiX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlciIsImJ1ZiIsImRpZmYiLCJtaW4iLCJOdW1iZXIiLCJfbGVuZ3RoQnVmZmVyIiwic3RhcnQiLCJsYXRlc3QiLCJzdWJhcnJheSIsInByZXZCdWYiLCJzZXQiLCJsZWZ0SWR4IiwibGVmdE9mTGVmdEN1cmx5IiwiTEZpZHgiLCJjb21tYW5kTGVuZ3RoIiwicmVkdWNlIiwicHJldiIsImN1cnIiLCJ1aW50OEFycmF5Iiwic2hpZnQiLCJyZW1haW5pbmdMZW5ndGgiLCJleGNlc3NMZW5ndGgiLCJfY2xlYXJJZGxlIiwiY2h1bmsiLCJlcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSIsInZhbHVlQXNTdHJpbmciLCJkZWJ1ZyIsIl9wcm9jZXNzUmVzcG9uc2UiLCJfaGFuZGxlUmVzcG9uc2UiLCJfZW50ZXJJZGxlIiwiX3Jlc3RhcnRRdWV1ZSIsInByZWNoZWNrIiwiY29udGV4dCIsIndhaXREcmFpbiIsImF0dHJpYnV0ZXMiLCJ0ZXN0IiwidHlwZSIsIm5yIiwidmFsdWUiLCJzZWN0aW9uIiwib3B0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwidG9Mb3dlckNhc2UiLCJwcm90b3R5cGUiLCJjYWxsIiwibWF0Y2giLCJfc29ja2V0T25EYXRhIiwid2luZG93IiwiV29ya2VyIiwiX2NvbXByZXNzaW9uV29ya2VyIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiQmxvYiIsIkNvbXByZXNzaW9uQmxvYiIsIm9ubWVzc2FnZSIsInBvc3RNZXNzYWdlIiwiY3JlYXRlTWVzc2FnZSIsImluZmxhdGVkUmVhZHkiLCJkZWZsYXRlZFJlYWR5IiwiX2NvbXByZXNzaW9uIiwiaW5mbGF0ZSIsInRlcm1pbmF0ZSIsImRlZmxhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUdBO0FBQ0E7QUFDQTs7QUFDQSxJQUFNQSw0QkFBNEIsT0FBbEM7QUFDQSxJQUFNQyxrQkFBa0IsU0FBeEI7QUFDQSxJQUFNQyw4QkFBOEIsZ0JBQXBDO0FBQ0EsSUFBTUMsa0JBQWtCLFNBQXhCO0FBQ0EsSUFBTUMsOEJBQThCLGdCQUFwQzs7QUFFQSxJQUFNQyxNQUFNLE1BQVo7QUFDQSxJQUFNQyxZQUFZLEVBQWxCO0FBQ0EsSUFBTUMsa0JBQWtCLEVBQXhCO0FBQ0EsSUFBTUMscUJBQXFCLEdBQTNCO0FBQ0EsSUFBTUMsc0JBQXNCLEdBQTVCOztBQUVBLElBQU1DLGFBQWEsRUFBbkI7O0FBRUE7QUFDQSxJQUFNQyx1QkFBdUIsU0FBN0I7QUFDQSxJQUFNQyx5Q0FBeUMsa0JBQS9DO0FBQ0EsSUFBTUMseUNBQXlDLGtCQUEvQztBQUNBLElBQU1DLHVCQUF1QixTQUE3Qjs7QUFFQTs7O0FBR0EsSUFBTUMscUJBQXFCLElBQTNCOztBQUVBOzs7QUFHQSxJQUFNQyw2QkFBNkIsS0FBbkM7O0FBRUE7Ozs7Ozs7QUFPQSxJQUFNQyw0QkFBNEIsR0FBbEM7O0FBRUE7Ozs7Ozs7Ozs7Ozs7SUFZcUJDLEk7QUFDbkIsZ0JBQWFDLElBQWIsRUFBbUJDLElBQW5CLEVBQXVDO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUNyQyxTQUFLQyxnQkFBTCxHQUF3QlAsa0JBQXhCO0FBQ0EsU0FBS1EsdUJBQUwsR0FBK0JQLDBCQUEvQjtBQUNBLFNBQUtRLHVCQUFMLEdBQStCUCx5QkFBL0I7QUFDQSxTQUFLUSxhQUFMLEdBQXFCLEtBQUtGLHVCQUFMLEdBQStCRyxLQUFLQyxLQUFMLENBQVcsT0FBTyxLQUFLSCx1QkFBdkIsQ0FBcEQ7O0FBRUEsU0FBS0gsT0FBTCxHQUFlQSxPQUFmOztBQUVBLFNBQUtELElBQUwsR0FBWUEsU0FBUyxLQUFLQyxPQUFMLENBQWFPLGtCQUFiLEdBQWtDLEdBQWxDLEdBQXdDLEdBQWpELENBQVo7QUFDQSxTQUFLVCxJQUFMLEdBQVlBLFFBQVEsV0FBcEI7O0FBRUE7QUFDQSxTQUFLRSxPQUFMLENBQWFPLGtCQUFiLEdBQWtDLHdCQUF3QixLQUFLUCxPQUE3QixHQUF1QyxDQUFDLENBQUMsS0FBS0EsT0FBTCxDQUFhTyxrQkFBdEQsR0FBMkUsS0FBS1IsSUFBTCxLQUFjLEdBQTNIOztBQUVBLFNBQUtTLFVBQUwsR0FBa0IsQ0FBQyxDQUFDLEtBQUtSLE9BQUwsQ0FBYU8sa0JBQWpDLENBZHFDLENBY2U7O0FBRXBELFNBQUtFLGdCQUFMLEdBQXdCLEtBQXhCLENBaEJxQyxDQWdCUDs7QUFFOUIsU0FBS0MscUJBQUwsR0FBNkIsRUFBN0IsQ0FsQnFDLENBa0JMOztBQUVoQyxTQUFLQyxZQUFMLEdBQW9CLEVBQXBCLENBcEJxQyxDQW9CZDtBQUN2QixTQUFLQyxRQUFMLEdBQWdCLEtBQWhCLENBckJxQyxDQXFCZjtBQUN0QixTQUFLQyxXQUFMLEdBQW1CLENBQW5CLENBdEJxQyxDQXNCaEI7QUFDckIsU0FBS0MsZUFBTCxHQUF1QixLQUF2QixDQXZCcUMsQ0F1QlI7O0FBRTdCLFNBQUtDLFVBQUwsR0FBa0IsS0FBbEIsQ0F6QnFDLENBeUJiO0FBQ3hCLFNBQUtDLG1CQUFMLEdBQTJCLEtBQTNCLENBMUJxQyxDQTBCSjs7QUFFakMsU0FBS0MsVUFBTCxHQUFrQixLQUFsQixDQTVCcUMsQ0E0QmI7O0FBRXhCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCLEVBQXhCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQjFCLG9CQUFwQjtBQUNBLFNBQUsyQixpQkFBTCxHQUF5QixDQUF6Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFLQyxNQUFMLEdBQWMsSUFBZDtBQUNBLFNBQUtDLE9BQUwsR0FBZSxJQUFmLENBM0NxQyxDQTJDakI7QUFDcEIsU0FBS0MsT0FBTCxHQUFlLElBQWYsQ0E1Q3FDLENBNENqQjtBQUNwQixTQUFLQyxNQUFMLEdBQWMsSUFBZCxDQTdDcUMsQ0E2Q2pCO0FBQ3JCOztBQUVEOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs4QkFVNkI7QUFBQTs7QUFBQSxVQUFwQkMsTUFBb0I7O0FBQzNCLGFBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0QyxjQUFLQyxNQUFMLEdBQWNKLE9BQU9LLElBQVAsQ0FBWSxNQUFLaEMsSUFBakIsRUFBdUIsTUFBS0MsSUFBNUIsRUFBa0M7QUFDOUNnQyxzQkFBWSxhQURrQztBQUU5Q3hCLDhCQUFvQixNQUFLQyxVQUZxQjtBQUc5Q3dCLGNBQUksTUFBS2hDLE9BQUwsQ0FBYWdDO0FBSDZCLFNBQWxDLENBQWQ7O0FBTUE7QUFDQTtBQUNBLFlBQUk7QUFDRixnQkFBS0gsTUFBTCxDQUFZUixNQUFaLEdBQXFCLFVBQUNZLElBQUQsRUFBVTtBQUFFLGtCQUFLWixNQUFMLElBQWUsTUFBS0EsTUFBTCxDQUFZWSxJQUFaLENBQWY7QUFBa0MsV0FBbkU7QUFDRCxTQUZELENBRUUsT0FBT0MsQ0FBUCxFQUFVLENBQUc7O0FBRWY7QUFDQSxjQUFLTCxNQUFMLENBQVlNLE9BQVosR0FBc0I7QUFBQSxpQkFBTSxNQUFLQyxRQUFMLENBQWMsSUFBSUMsS0FBSixDQUFVLDZCQUFWLENBQWQsQ0FBTjtBQUFBLFNBQXRCO0FBQ0EsY0FBS1IsTUFBTCxDQUFZUyxNQUFaLEdBQXFCLFVBQUNDLEdBQUQsRUFBUztBQUM1QixjQUFJO0FBQ0Ysa0JBQUtDLE9BQUwsQ0FBYUQsR0FBYjtBQUNELFdBRkQsQ0FFRSxPQUFPRSxHQUFQLEVBQVk7QUFDWixrQkFBS0wsUUFBTCxDQUFjSyxHQUFkO0FBQ0Q7QUFDRixTQU5EOztBQVFBO0FBQ0EsY0FBS1osTUFBTCxDQUFZUCxPQUFaLEdBQXNCLFVBQUNvQixDQUFELEVBQU87QUFDM0JkLGlCQUFPLElBQUlTLEtBQUosQ0FBVSw0QkFBNEJLLEVBQUVDLElBQUYsQ0FBT0MsT0FBN0MsQ0FBUDtBQUNELFNBRkQ7O0FBSUEsY0FBS2YsTUFBTCxDQUFZZ0IsTUFBWixHQUFxQixZQUFNO0FBQ3pCO0FBQ0EsZ0JBQUtoQixNQUFMLENBQVlQLE9BQVosR0FBc0IsVUFBQ29CLENBQUQ7QUFBQSxtQkFBTyxNQUFLTixRQUFMLENBQWNNLENBQWQsQ0FBUDtBQUFBLFdBQXRCO0FBQ0FmO0FBQ0QsU0FKRDtBQUtELE9BakNNLENBQVA7QUFrQ0Q7O0FBRUQ7Ozs7Ozs7OzBCQUtPbUIsSyxFQUFPO0FBQUE7O0FBQ1osYUFBTyxJQUFJcEIsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBYTtBQUM5QixZQUFJb0IsV0FBVyxTQUFYQSxRQUFXLEdBQU07QUFDbkI7QUFDQSxpQkFBS3BDLFlBQUwsQ0FBa0JxQyxPQUFsQixDQUEwQjtBQUFBLG1CQUFPQyxJQUFJQyxRQUFKLENBQWFKLEtBQWIsQ0FBUDtBQUFBLFdBQTFCO0FBQ0EsY0FBSSxPQUFLaEMsZUFBVCxFQUEwQjtBQUN4QixtQkFBS0EsZUFBTCxDQUFxQm9DLFFBQXJCLENBQThCSixLQUE5QjtBQUNEOztBQUVELGlCQUFLbkMsWUFBTCxHQUFvQixFQUFwQjtBQUNBLGlCQUFLRyxlQUFMLEdBQXVCLEtBQXZCOztBQUVBcUMsdUJBQWEsT0FBS3BDLFVBQWxCO0FBQ0EsaUJBQUtBLFVBQUwsR0FBa0IsSUFBbEI7O0FBRUFvQyx1QkFBYSxPQUFLbkMsbUJBQWxCO0FBQ0EsaUJBQUtBLG1CQUFMLEdBQTJCLElBQTNCOztBQUVBLGNBQUksT0FBS2EsTUFBVCxFQUFpQjtBQUNmO0FBQ0EsbUJBQUtBLE1BQUwsQ0FBWWdCLE1BQVosR0FBcUIsSUFBckI7QUFDQSxtQkFBS2hCLE1BQUwsQ0FBWU0sT0FBWixHQUFzQixJQUF0QjtBQUNBLG1CQUFLTixNQUFMLENBQVlTLE1BQVosR0FBcUIsSUFBckI7QUFDQSxtQkFBS1QsTUFBTCxDQUFZUCxPQUFaLEdBQXNCLElBQXRCO0FBQ0EsZ0JBQUk7QUFDRixxQkFBS08sTUFBTCxDQUFZUixNQUFaLEdBQXFCLElBQXJCO0FBQ0QsYUFGRCxDQUVFLE9BQU9hLENBQVAsRUFBVSxDQUFHOztBQUVmLG1CQUFLTCxNQUFMLEdBQWMsSUFBZDtBQUNEOztBQUVERjtBQUNELFNBOUJEOztBQWdDQSxlQUFLeUIsbUJBQUw7O0FBRUEsWUFBSSxDQUFDLE9BQUt2QixNQUFOLElBQWdCLE9BQUtBLE1BQUwsQ0FBWXdCLFVBQVosS0FBMkIsTUFBL0MsRUFBdUQ7QUFDckQsaUJBQU9OLFVBQVA7QUFDRDs7QUFFRCxlQUFLbEIsTUFBTCxDQUFZTSxPQUFaLEdBQXNCLE9BQUtOLE1BQUwsQ0FBWVAsT0FBWixHQUFzQnlCLFFBQTVDLENBdkM4QixDQXVDdUI7QUFDckQsZUFBS2xCLE1BQUwsQ0FBWXlCLEtBQVo7QUFDRCxPQXpDTSxDQUFQO0FBMENEOztBQUVEOzs7Ozs7Ozs7OzZCQU9VO0FBQUE7O0FBQ1IsYUFBTyxJQUFJNUIsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0QyxlQUFLQyxNQUFMLENBQVlNLE9BQVosR0FBc0IsT0FBS04sTUFBTCxDQUFZUCxPQUFaLEdBQXNCLFlBQU07QUFDaEQsaUJBQUtnQyxLQUFMLENBQVcsb0JBQVgsRUFBaUNDLElBQWpDLENBQXNDNUIsT0FBdEMsRUFBK0M2QixLQUEvQyxDQUFxRDVCLE1BQXJEO0FBQ0QsU0FGRDs7QUFJQSxlQUFLNkIsY0FBTCxDQUFvQixRQUFwQjtBQUNELE9BTk0sQ0FBUDtBQU9EOztBQUVEOzs7Ozs7OEJBR1c7QUFDVCxXQUFLakQsVUFBTCxHQUFrQixJQUFsQjtBQUNBLFdBQUtxQixNQUFMLENBQVk2QixlQUFaO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O21DQWNnQkMsTyxFQUFTQyxjLEVBQWdCNUQsTyxFQUFTO0FBQUE7O0FBQ2hELFVBQUksT0FBTzJELE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDL0JBLGtCQUFVO0FBQ1JFLG1CQUFTRjtBQURELFNBQVY7QUFHRDs7QUFFREMsdUJBQWlCLEdBQUdFLE1BQUgsQ0FBVUYsa0JBQWtCLEVBQTVCLEVBQWdDRyxHQUFoQyxDQUFvQyxVQUFDQyxRQUFEO0FBQUEsZUFBYyxDQUFDQSxZQUFZLEVBQWIsRUFBaUJDLFFBQWpCLEdBQTRCQyxXQUE1QixHQUEwQ0MsSUFBMUMsRUFBZDtBQUFBLE9BQXBDLENBQWpCOztBQUVBLFVBQUlDLE1BQU0sTUFBTyxFQUFFLEtBQUt2RCxXQUF4QjtBQUNBOEMsY0FBUVMsR0FBUixHQUFjQSxHQUFkOztBQUVBLGFBQU8sSUFBSTFDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEMsWUFBSWUsT0FBTztBQUNUeUIsZUFBS0EsR0FESTtBQUVUVCxtQkFBU0EsT0FGQTtBQUdUVSxtQkFBU1QsZUFBZVUsTUFBZixHQUF3QixFQUF4QixHQUE2QkMsU0FIN0I7QUFJVHJCLG9CQUFVLGtCQUFDc0IsUUFBRCxFQUFjO0FBQ3RCLGdCQUFJLE9BQUtDLE9BQUwsQ0FBYUQsUUFBYixDQUFKLEVBQTRCO0FBQzFCLHFCQUFPNUMsT0FBTzRDLFFBQVAsQ0FBUDtBQUNELGFBRkQsTUFFTyxJQUFJLENBQUMsSUFBRCxFQUFPLEtBQVAsRUFBY0UsT0FBZCxDQUFzQixtQkFBTyxFQUFQLEVBQVcsU0FBWCxFQUFzQkYsUUFBdEIsRUFBZ0NOLFdBQWhDLEdBQThDQyxJQUE5QyxFQUF0QixLQUErRSxDQUFuRixFQUFzRjtBQUMzRixrQkFBSXJCLFFBQVEsSUFBSVQsS0FBSixDQUFVbUMsU0FBU0csYUFBVCxJQUEwQixPQUFwQyxDQUFaO0FBQ0Esa0JBQUlILFNBQVNJLElBQWIsRUFBbUI7QUFDakI5QixzQkFBTThCLElBQU4sR0FBYUosU0FBU0ksSUFBdEI7QUFDRDtBQUNELHFCQUFPaEQsT0FBT2tCLEtBQVAsQ0FBUDtBQUNEOztBQUVEbkIsb0JBQVE2QyxRQUFSO0FBQ0Q7O0FBR0g7QUFuQlcsU0FBWCxDQW9CQUssT0FBT0MsSUFBUCxDQUFZOUUsV0FBVyxFQUF2QixFQUEyQmdELE9BQTNCLENBQW1DLFVBQUMrQixHQUFELEVBQVM7QUFBRXBDLGVBQUtvQyxHQUFMLElBQVkvRSxRQUFRK0UsR0FBUixDQUFaO0FBQTBCLFNBQXhFOztBQUVBbkIsdUJBQWVaLE9BQWYsQ0FBdUIsVUFBQ2EsT0FBRCxFQUFhO0FBQUVsQixlQUFLMEIsT0FBTCxDQUFhUixPQUFiLElBQXdCLEVBQXhCO0FBQTRCLFNBQWxFOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQUltQixRQUFRckMsS0FBS3NDLEdBQUwsR0FBVyxPQUFLdEUsWUFBTCxDQUFrQitELE9BQWxCLENBQTBCL0IsS0FBS3NDLEdBQS9CLENBQVgsR0FBaUQsQ0FBQyxDQUE5RDtBQUNBLFlBQUlELFNBQVMsQ0FBYixFQUFnQjtBQUNkckMsZUFBS3lCLEdBQUwsSUFBWSxJQUFaO0FBQ0F6QixlQUFLZ0IsT0FBTCxDQUFhUyxHQUFiLElBQW9CLElBQXBCO0FBQ0EsaUJBQUt6RCxZQUFMLENBQWtCdUUsTUFBbEIsQ0FBeUJGLEtBQXpCLEVBQWdDLENBQWhDLEVBQW1DckMsSUFBbkM7QUFDRCxTQUpELE1BSU87QUFDTCxpQkFBS2hDLFlBQUwsQ0FBa0J3RSxJQUFsQixDQUF1QnhDLElBQXZCO0FBQ0Q7O0FBRUQsWUFBSSxPQUFLL0IsUUFBVCxFQUFtQjtBQUNqQixpQkFBS3dFLFlBQUw7QUFDRDtBQUNGLE9BeENNLENBQVA7QUF5Q0Q7O0FBRUQ7Ozs7Ozs7Ozt3Q0FNcUJDLFEsRUFBVUosRyxFQUFLO0FBQ2xDLFVBQU1LLGFBQWEsS0FBSzNFLFlBQUwsQ0FBa0IrRCxPQUFsQixDQUEwQk8sR0FBMUIsSUFBaUMsQ0FBcEQ7O0FBRUE7QUFDQSxXQUFLLElBQUlNLElBQUlELFVBQWIsRUFBeUJDLEtBQUssQ0FBOUIsRUFBaUNBLEdBQWpDLEVBQXNDO0FBQ3BDLFlBQUlDLFFBQVEsS0FBSzdFLFlBQUwsQ0FBa0I0RSxDQUFsQixDQUFSLENBQUosRUFBbUM7QUFDakMsaUJBQU8sS0FBSzVFLFlBQUwsQ0FBa0I0RSxDQUFsQixDQUFQO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLFVBQUlDLFFBQVEsS0FBSzFFLGVBQWIsQ0FBSixFQUFtQztBQUNqQyxlQUFPLEtBQUtBLGVBQVo7QUFDRDs7QUFFRCxhQUFPLEtBQVA7O0FBRUEsZUFBUzBFLE9BQVQsQ0FBa0I3QyxJQUFsQixFQUF3QjtBQUN0QixlQUFPQSxRQUFRQSxLQUFLZ0IsT0FBYixJQUF3QjBCLFNBQVNYLE9BQVQsQ0FBaUIvQixLQUFLZ0IsT0FBTCxDQUFhRSxPQUE5QixLQUEwQyxDQUF6RTtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7Ozt5QkFNTTRCLEcsRUFBSztBQUFBOztBQUNULFVBQU1DLFNBQVMsMEJBQWFELEdBQWIsRUFBa0JDLE1BQWpDO0FBQ0EsVUFBTUMsVUFBVSxLQUFLekYsdUJBQUwsR0FBK0JHLEtBQUtDLEtBQUwsQ0FBV29GLE9BQU9FLFVBQVAsR0FBb0IsS0FBS3pGLHVCQUFwQyxDQUEvQzs7QUFFQWdELG1CQUFhLEtBQUtuQyxtQkFBbEIsRUFKUyxDQUk4QjtBQUN2QyxXQUFLQSxtQkFBTCxHQUEyQjZFLFdBQVc7QUFBQSxlQUFNLE9BQUt6RCxRQUFMLENBQWMsSUFBSUMsS0FBSixDQUFVLG9CQUFWLENBQWQsQ0FBTjtBQUFBLE9BQVgsRUFBaUVzRCxPQUFqRSxDQUEzQixDQUxTLENBSzRGOztBQUVyRyxVQUFJLEtBQUsxRSxVQUFULEVBQXFCO0FBQ25CLGFBQUs2RSxlQUFMLENBQXFCSixNQUFyQjtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUs3RCxNQUFMLENBQVlrRSxJQUFaLENBQWlCTCxNQUFqQjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7Ozs7OytCQVFZN0IsTyxFQUFTWCxRLEVBQVU7QUFDN0IsV0FBS3hDLHFCQUFMLENBQTJCbUQsUUFBUUssV0FBUixHQUFzQkMsSUFBdEIsRUFBM0IsSUFBMkRqQixRQUEzRDtBQUNEOztBQUVEOztBQUVBOzs7Ozs7Ozs7NkJBTVVYLEcsRUFBSztBQUFBOztBQUNiLFVBQUlPLEtBQUo7QUFDQSxVQUFJLEtBQUsyQixPQUFMLENBQWFsQyxHQUFiLENBQUosRUFBdUI7QUFDckJPLGdCQUFRUCxHQUFSO0FBQ0QsT0FGRCxNQUVPLElBQUlBLE9BQU8sS0FBS2tDLE9BQUwsQ0FBYWxDLElBQUlJLElBQWpCLENBQVgsRUFBbUM7QUFDeENHLGdCQUFRUCxJQUFJSSxJQUFaO0FBQ0QsT0FGTSxNQUVBO0FBQ0xHLGdCQUFRLElBQUlULEtBQUosQ0FBV0UsT0FBT0EsSUFBSUksSUFBWCxJQUFtQkosSUFBSUksSUFBSixDQUFTQyxPQUE3QixJQUF5Q0wsSUFBSUksSUFBN0MsSUFBcURKLEdBQXJELElBQTRELE9BQXRFLENBQVI7QUFDRDs7QUFFRCxXQUFLeUQsTUFBTCxDQUFZbEQsS0FBWixDQUFrQkEsS0FBbEI7O0FBRUE7QUFDQSxXQUFLUSxLQUFMLENBQVdSLEtBQVgsRUFBa0JTLElBQWxCLENBQXVCLFlBQU07QUFDM0IsZUFBS2pDLE9BQUwsSUFBZ0IsT0FBS0EsT0FBTCxDQUFhd0IsS0FBYixDQUFoQjtBQUNELE9BRkQsRUFFRyxZQUFNO0FBQ1AsZUFBS3hCLE9BQUwsSUFBZ0IsT0FBS0EsT0FBTCxDQUFhd0IsS0FBYixDQUFoQjtBQUNELE9BSkQ7QUFLRDs7QUFFRDs7Ozs7Ozs7Ozs7NEJBUVNQLEcsRUFBSztBQUFBOztBQUNaWSxtQkFBYSxLQUFLbkMsbUJBQWxCLEVBRFksQ0FDMkI7QUFDdkMsV0FBS0EsbUJBQUwsR0FBMkI2RSxXQUFXO0FBQUEsZUFBTSxPQUFLekQsUUFBTCxDQUFjLElBQUlDLEtBQUosQ0FBVSxvQkFBVixDQUFkLENBQU47QUFBQSxPQUFYLEVBQWlFLEtBQUs0RCxlQUF0RSxDQUEzQjs7QUFFQSxXQUFLL0UsZ0JBQUwsQ0FBc0JpRSxJQUF0QixDQUEyQixJQUFJZSxVQUFKLENBQWUzRCxJQUFJSSxJQUFuQixDQUEzQixFQUpZLENBSXlDO0FBQ3JELFdBQUt3RCxzQkFBTCxDQUE0QixLQUFLQyxzQkFBTCxFQUE1QixFQUxZLENBSytDO0FBQzVEOzs7Ozs7Ozs7QUFHS0MsaUIsR0FBTSxLQUFLbkYsZ0JBQUwsQ0FBc0IsS0FBS0EsZ0JBQUwsQ0FBc0JvRCxNQUF0QixHQUErQixDQUFyRCxLQUEyRCxFO0FBQ2pFaUIsZSxHQUFJLEM7O0FBRVI7QUFDQTtBQUNBO0FBQ0E7OztvQkFDT0EsSUFBSWMsSUFBSS9CLE07Ozs7OzRCQUNMLEtBQUtuRCxZOzhDQUNON0Isb0IsdUJBU0FFLHNDLHdCQVlBRCxzQzs7OztBQXBCRytHLGtCLEdBQU9qRyxLQUFLa0csR0FBTCxDQUFTRixJQUFJL0IsTUFBSixHQUFhaUIsQ0FBdEIsRUFBeUIsS0FBS25FLGlCQUE5QixDOztBQUNiLG1CQUFLQSxpQkFBTCxJQUEwQmtGLElBQTFCO0FBQ0FmLG1CQUFLZSxJQUFMO0FBQ0Esa0JBQUksS0FBS2xGLGlCQUFMLEtBQTJCLENBQS9CLEVBQWtDO0FBQ2hDLHFCQUFLRCxZQUFMLEdBQW9CMUIsb0JBQXBCO0FBQ0Q7Ozs7QUFJRCxrQkFBSThGLElBQUljLElBQUkvQixNQUFaLEVBQW9CO0FBQ2xCLG9CQUFJK0IsSUFBSWQsQ0FBSixNQUFXckcsZUFBZixFQUFnQztBQUM5Qix1QkFBS2tDLGlCQUFMLEdBQXlCb0YsT0FBTyw0QkFBZSxLQUFLQyxhQUFwQixDQUFQLElBQTZDLENBQXRFLENBRDhCLENBQzBDO0FBQ3hFLHVCQUFLdEYsWUFBTCxHQUFvQjdCLG9CQUFwQjtBQUNELGlCQUhELE1BR087QUFDTCx1QkFBSzZCLFlBQUwsR0FBb0IxQixvQkFBcEI7QUFDRDtBQUNELHVCQUFPLEtBQUtnSCxhQUFaO0FBQ0Q7Ozs7QUFJS0MsbUIsR0FBUW5CLEM7O0FBQ2QscUJBQU9BLElBQUljLElBQUkvQixNQUFSLElBQWtCK0IsSUFBSWQsQ0FBSixLQUFVLEVBQTVCLElBQWtDYyxJQUFJZCxDQUFKLEtBQVUsRUFBbkQsRUFBdUQ7QUFBRTtBQUN2REE7QUFDRDtBQUNELGtCQUFJbUIsVUFBVW5CLENBQWQsRUFBaUI7QUFDVG9CLHNCQURTLEdBQ0FOLElBQUlPLFFBQUosQ0FBYUYsS0FBYixFQUFvQm5CLENBQXBCLENBREE7QUFFVHNCLHVCQUZTLEdBRUMsS0FBS0osYUFGTjs7QUFHZixxQkFBS0EsYUFBTCxHQUFxQixJQUFJUCxVQUFKLENBQWVXLFFBQVF2QyxNQUFSLEdBQWlCcUMsT0FBT3JDLE1BQXZDLENBQXJCO0FBQ0EscUJBQUttQyxhQUFMLENBQW1CSyxHQUFuQixDQUF1QkQsT0FBdkI7QUFDQSxxQkFBS0osYUFBTCxDQUFtQkssR0FBbkIsQ0FBdUJILE1BQXZCLEVBQStCRSxRQUFRdkMsTUFBdkM7QUFDRDtBQUNELGtCQUFJaUIsSUFBSWMsSUFBSS9CLE1BQVosRUFBb0I7QUFDbEIsb0JBQUksS0FBS21DLGFBQUwsQ0FBbUJuQyxNQUFuQixHQUE0QixDQUE1QixJQUFpQytCLElBQUlkLENBQUosTUFBV25HLG1CQUFoRCxFQUFxRTtBQUNuRSx1QkFBSytCLFlBQUwsR0FBb0IzQixzQ0FBcEI7QUFDRCxpQkFGRCxNQUVPO0FBQ0wseUJBQU8sS0FBS2lILGFBQVo7QUFDQSx1QkFBS3RGLFlBQUwsR0FBb0IxQixvQkFBcEI7QUFDRDtBQUNEOEY7QUFDRDs7OztBQUlEO0FBQ013QixxQixHQUFVVixJQUFJM0IsT0FBSixDQUFZdkYsa0JBQVosRUFBZ0NvRyxDQUFoQyxDOztvQkFDWndCLFVBQVUsQ0FBQyxDOzs7OztBQUNQQyw2QixHQUFrQixJQUFJZCxVQUFKLENBQWVHLElBQUlYLE1BQW5CLEVBQTJCSCxDQUEzQixFQUE4QndCLFVBQVV4QixDQUF4QyxDOztvQkFDcEJ5QixnQkFBZ0J0QyxPQUFoQixDQUF3QnpGLFNBQXhCLE1BQXVDLENBQUMsQzs7Ozs7QUFDMUNzRyxrQkFBSXdCLFVBQVUsQ0FBZDtBQUNBLG1CQUFLTixhQUFMLEdBQXFCLElBQUlQLFVBQUosQ0FBZSxDQUFmLENBQXJCO0FBQ0EsbUJBQUsvRSxZQUFMLEdBQW9CNUIsc0NBQXBCOzs7OztBQUtKO0FBQ00wSCxtQixHQUFRWixJQUFJM0IsT0FBSixDQUFZekYsU0FBWixFQUF1QnNHLENBQXZCLEM7O29CQUNWMEIsUUFBUSxDQUFDLEM7Ozs7O0FBQ1gsa0JBQUlBLFFBQVFaLElBQUkvQixNQUFKLEdBQWEsQ0FBekIsRUFBNEI7QUFDMUIscUJBQUtwRCxnQkFBTCxDQUFzQixLQUFLQSxnQkFBTCxDQUFzQm9ELE1BQXRCLEdBQStCLENBQXJELElBQTBELElBQUk0QixVQUFKLENBQWVHLElBQUlYLE1BQW5CLEVBQTJCLENBQTNCLEVBQThCdUIsUUFBUSxDQUF0QyxDQUExRDtBQUNEO0FBQ0tDLDJCLEdBQWdCLEtBQUtoRyxnQkFBTCxDQUFzQmlHLE1BQXRCLENBQTZCLFVBQUNDLElBQUQsRUFBT0MsSUFBUDtBQUFBLHVCQUFnQkQsT0FBT0MsS0FBSy9DLE1BQTVCO0FBQUEsZUFBN0IsRUFBaUUsQ0FBakUsSUFBc0UsQyxFQUFFOztBQUN4RlQscUIsR0FBVSxJQUFJcUMsVUFBSixDQUFlZ0IsYUFBZixDO0FBQ1psQyxtQixHQUFRLEM7O0FBQ1oscUJBQU8sS0FBSzlELGdCQUFMLENBQXNCb0QsTUFBdEIsR0FBK0IsQ0FBdEMsRUFBeUM7QUFDbkNnRCwwQkFEbUMsR0FDdEIsS0FBS3BHLGdCQUFMLENBQXNCcUcsS0FBdEIsRUFEc0I7QUFHakNDLCtCQUhpQyxHQUdmTixnQkFBZ0JsQyxLQUhEOztBQUl2QyxvQkFBSXNDLFdBQVdoRCxNQUFYLEdBQW9Ca0QsZUFBeEIsRUFBeUM7QUFDakNDLDhCQURpQyxHQUNsQkgsV0FBV2hELE1BQVgsR0FBb0JrRCxlQURGOztBQUV2Q0YsK0JBQWFBLFdBQVdWLFFBQVgsQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBQ2EsWUFBeEIsQ0FBYjs7QUFFQSxzQkFBSSxLQUFLdkcsZ0JBQUwsQ0FBc0JvRCxNQUF0QixHQUErQixDQUFuQyxFQUFzQztBQUNwQyx5QkFBS3BELGdCQUFMLEdBQXdCLEVBQXhCO0FBQ0Q7QUFDRjtBQUNEMkMsd0JBQVFpRCxHQUFSLENBQVlRLFVBQVosRUFBd0J0QyxLQUF4QjtBQUNBQSx5QkFBU3NDLFdBQVdoRCxNQUFwQjtBQUNEOztxQkFDS1QsTzs7O29CQUNGb0QsUUFBUVosSUFBSS9CLE1BQUosR0FBYSxDOzs7OztBQUN2QitCLG9CQUFNLElBQUlILFVBQUosQ0FBZUcsSUFBSU8sUUFBSixDQUFhSyxRQUFRLENBQXJCLENBQWYsQ0FBTjtBQUNBLG1CQUFLL0YsZ0JBQUwsQ0FBc0JpRSxJQUF0QixDQUEyQmtCLEdBQTNCO0FBQ0FkLGtCQUFJLENBQUo7Ozs7O0FBRUE7QUFDQTtBQUNBcEMsMkJBQWEsS0FBS25DLG1CQUFsQjtBQUNBLG1CQUFLQSxtQkFBTCxHQUEyQixJQUEzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVVaOztBQUVBOzs7Ozs7MkNBR3dCcUUsUSxFQUFVO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ2hDLDZCQUFvQkEsUUFBcEIsOEhBQThCO0FBQUEsY0FBckJ4QixPQUFxQjs7QUFDNUIsZUFBSzZELFVBQUw7O0FBRUE7Ozs7Ozs7Ozs7QUFVQTtBQUNBLGNBQUk3RCxRQUFRLENBQVIsTUFBZXhFLFVBQW5CLEVBQStCO0FBQzdCLGdCQUFJLEtBQUt5QixlQUFMLENBQXFCNkIsSUFBckIsQ0FBMEIyQixNQUE5QixFQUFzQztBQUNwQztBQUNBLGtCQUFJcUQsUUFBUSxLQUFLN0csZUFBTCxDQUFxQjZCLElBQXJCLENBQTBCNEUsS0FBMUIsRUFBWjtBQUNBSSx1QkFBVSxDQUFDLEtBQUs3RyxlQUFMLENBQXFCNkIsSUFBckIsQ0FBMEIyQixNQUEzQixHQUFvQ3RGLEdBQXBDLEdBQTBDLEVBQXBELENBSG9DLENBR29CO0FBQ3hELG1CQUFLK0csSUFBTCxDQUFVNEIsS0FBVjtBQUNELGFBTEQsTUFLTyxJQUFJLEtBQUs3RyxlQUFMLENBQXFCOEcsNkJBQXpCLEVBQXdEO0FBQzdELG1CQUFLN0IsSUFBTCxDQUFVL0csR0FBVixFQUQ2RCxDQUM5QztBQUNoQjtBQUNEO0FBQ0Q7O0FBRUQsY0FBSXdGLFFBQUo7QUFDQSxjQUFJO0FBQ0YsZ0JBQU1xRCxnQkFBZ0IsS0FBSy9HLGVBQUwsQ0FBcUI2QyxPQUFyQixJQUFnQyxLQUFLN0MsZUFBTCxDQUFxQjZDLE9BQXJCLENBQTZCa0UsYUFBbkY7QUFDQXJELHVCQUFXLGdDQUFPWCxPQUFQLEVBQWdCLEVBQUVnRSw0QkFBRixFQUFoQixDQUFYO0FBQ0EsaUJBQUs3QixNQUFMLENBQVk4QixLQUFaLENBQWtCLElBQWxCLEVBQXdCO0FBQUEscUJBQU0sa0NBQVN0RCxRQUFULEVBQW1CLEtBQW5CLEVBQTBCLElBQTFCLENBQU47QUFBQSxhQUF4QjtBQUNELFdBSkQsQ0FJRSxPQUFPOUIsQ0FBUCxFQUFVO0FBQ1YsaUJBQUtzRCxNQUFMLENBQVlsRCxLQUFaLENBQWtCLDZCQUFsQixFQUFpRDBCLFFBQWpEO0FBQ0EsbUJBQU8sS0FBS3BDLFFBQUwsQ0FBY00sQ0FBZCxDQUFQO0FBQ0Q7O0FBRUQsZUFBS3FGLGdCQUFMLENBQXNCdkQsUUFBdEI7QUFDQSxlQUFLd0QsZUFBTCxDQUFxQnhELFFBQXJCOztBQUVBO0FBQ0EsY0FBSSxDQUFDLEtBQUsvRCxnQkFBVixFQUE0QjtBQUMxQixpQkFBS0EsZ0JBQUwsR0FBd0IsSUFBeEI7QUFDQSxpQkFBS2MsT0FBTCxJQUFnQixLQUFLQSxPQUFMLEVBQWhCO0FBQ0Q7QUFDRjtBQTdDK0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQThDakM7O0FBRUQ7Ozs7Ozs7O29DQUtpQmlELFEsRUFBVTtBQUN6QixVQUFJWCxVQUFVLG1CQUFPLEVBQVAsRUFBVyxTQUFYLEVBQXNCVyxRQUF0QixFQUFnQ04sV0FBaEMsR0FBOENDLElBQTlDLEVBQWQ7O0FBRUEsVUFBSSxDQUFDLEtBQUtyRCxlQUFWLEVBQTJCO0FBQ3pCO0FBQ0EsWUFBSTBELFNBQVNKLEdBQVQsS0FBaUIsR0FBakIsSUFBd0JQLFdBQVcsS0FBS25ELHFCQUE1QyxFQUFtRTtBQUNqRSxlQUFLQSxxQkFBTCxDQUEyQm1ELE9BQTNCLEVBQW9DVyxRQUFwQztBQUNBLGVBQUs1RCxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsZUFBS3dFLFlBQUw7QUFDRDtBQUNGLE9BUEQsTUFPTyxJQUFJLEtBQUt0RSxlQUFMLENBQXFCdUQsT0FBckIsSUFBZ0NHLFNBQVNKLEdBQVQsS0FBaUIsR0FBakQsSUFBd0RQLFdBQVcsS0FBSy9DLGVBQUwsQ0FBcUJ1RCxPQUE1RixFQUFxRztBQUMxRztBQUNBLGFBQUt2RCxlQUFMLENBQXFCdUQsT0FBckIsQ0FBNkJSLE9BQTdCLEVBQXNDc0IsSUFBdEMsQ0FBMkNYLFFBQTNDO0FBQ0QsT0FITSxNQUdBLElBQUlBLFNBQVNKLEdBQVQsS0FBaUIsR0FBakIsSUFBd0JQLFdBQVcsS0FBS25ELHFCQUE1QyxFQUFtRTtBQUN4RTtBQUNBLGFBQUtBLHFCQUFMLENBQTJCbUQsT0FBM0IsRUFBb0NXLFFBQXBDO0FBQ0QsT0FITSxNQUdBLElBQUlBLFNBQVNKLEdBQVQsS0FBaUIsS0FBS3RELGVBQUwsQ0FBcUJzRCxHQUExQyxFQUErQztBQUNwRDtBQUNBLFlBQUksS0FBS3RELGVBQUwsQ0FBcUJ1RCxPQUFyQixJQUFnQ1EsT0FBT0MsSUFBUCxDQUFZLEtBQUtoRSxlQUFMLENBQXFCdUQsT0FBakMsRUFBMENDLE1BQTlFLEVBQXNGO0FBQ3BGRSxtQkFBU0gsT0FBVCxHQUFtQixLQUFLdkQsZUFBTCxDQUFxQnVELE9BQXhDO0FBQ0Q7QUFDRCxhQUFLdkQsZUFBTCxDQUFxQm9DLFFBQXJCLENBQThCc0IsUUFBOUI7QUFDQSxhQUFLNUQsUUFBTCxHQUFnQixJQUFoQjtBQUNBLGFBQUt3RSxZQUFMO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7O21DQUdnQjtBQUFBOztBQUNkLFVBQUksQ0FBQyxLQUFLekUsWUFBTCxDQUFrQjJELE1BQXZCLEVBQStCO0FBQzdCLGVBQU8sS0FBSzJELFVBQUwsRUFBUDtBQUNEO0FBQ0QsV0FBS1AsVUFBTDs7QUFFQTtBQUNBLFdBQUtRLGFBQUwsR0FBcUIsS0FBckI7O0FBRUEsVUFBSXJFLFVBQVUsS0FBS2xELFlBQUwsQ0FBa0IsQ0FBbEIsQ0FBZDtBQUNBLFVBQUksT0FBT2tELFFBQVFzRSxRQUFmLEtBQTRCLFVBQWhDLEVBQTRDO0FBQzFDO0FBQ0EsWUFBSUMsVUFBVXZFLE9BQWQ7QUFDQSxZQUFJc0UsV0FBV0MsUUFBUUQsUUFBdkI7QUFDQSxlQUFPQyxRQUFRRCxRQUFmOztBQUVBO0FBQ0EsYUFBS0QsYUFBTCxHQUFxQixJQUFyQjs7QUFFQTtBQUNBQyxpQkFBU0MsT0FBVCxFQUFrQjdFLElBQWxCLENBQXVCLFlBQU07QUFDM0I7QUFDQSxjQUFJLE9BQUsyRSxhQUFULEVBQXdCO0FBQ3RCO0FBQ0EsbUJBQUs5QyxZQUFMO0FBQ0Q7QUFDRixTQU5ELEVBTUc1QixLQU5ILENBTVMsVUFBQ2YsR0FBRCxFQUFTO0FBQ2hCO0FBQ0E7QUFDQSxjQUFJUSxZQUFKO0FBQ0EsY0FBTStCLFFBQVEsT0FBS3JFLFlBQUwsQ0FBa0IrRCxPQUFsQixDQUEwQjBELE9BQTFCLENBQWQ7QUFDQSxjQUFJcEQsU0FBUyxDQUFiLEVBQWdCO0FBQ2QvQixrQkFBTSxPQUFLdEMsWUFBTCxDQUFrQnVFLE1BQWxCLENBQXlCRixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxDQUFOO0FBQ0Q7QUFDRCxjQUFJL0IsT0FBT0EsSUFBSUMsUUFBZixFQUF5QjtBQUN2QkQsZ0JBQUlDLFFBQUosQ0FBYVQsR0FBYjtBQUNBLG1CQUFLN0IsUUFBTCxHQUFnQixJQUFoQjtBQUNBLG1CQUFLdUYsc0JBQUwsQ0FBNEIsT0FBS0Msc0JBQUwsRUFBNUIsRUFIdUIsQ0FHb0M7QUFDM0QsbUJBQUtoQixZQUFMLEdBSnVCLENBSUg7QUFDckI7QUFDRixTQXBCRDtBQXFCQTtBQUNEOztBQUVELFdBQUt4RSxRQUFMLEdBQWdCLEtBQWhCO0FBQ0EsV0FBS0UsZUFBTCxHQUF1QixLQUFLSCxZQUFMLENBQWtCNEcsS0FBbEIsRUFBdkI7O0FBRUEsVUFBSTtBQUNGLGFBQUt6RyxlQUFMLENBQXFCNkIsSUFBckIsR0FBNEIsa0NBQVMsS0FBSzdCLGVBQUwsQ0FBcUI2QyxPQUE5QixFQUF1QyxJQUF2QyxDQUE1QjtBQUNBLGFBQUtxQyxNQUFMLENBQVk4QixLQUFaLENBQWtCLElBQWxCLEVBQXdCO0FBQUEsaUJBQU0sa0NBQVMsT0FBS2hILGVBQUwsQ0FBcUI2QyxPQUE5QixFQUF1QyxLQUF2QyxFQUE4QyxJQUE5QyxDQUFOO0FBQUEsU0FBeEIsRUFGRSxDQUVpRjtBQUNwRixPQUhELENBR0UsT0FBT2pCLENBQVAsRUFBVTtBQUNWLGFBQUtzRCxNQUFMLENBQVlsRCxLQUFaLENBQWtCLCtCQUFsQixFQUFtRCxLQUFLaEMsZUFBTCxDQUFxQjZDLE9BQXhFO0FBQ0EsZUFBTyxLQUFLdkIsUUFBTCxDQUFjLElBQUlDLEtBQUosQ0FBVSwrQkFBVixDQUFkLENBQVA7QUFDRDs7QUFFRCxVQUFJTSxPQUFPLEtBQUs3QixlQUFMLENBQXFCNkIsSUFBckIsQ0FBMEI0RSxLQUExQixFQUFYOztBQUVBLFdBQUt4QixJQUFMLENBQVVwRCxRQUFRLENBQUMsS0FBSzdCLGVBQUwsQ0FBcUI2QixJQUFyQixDQUEwQjJCLE1BQTNCLEdBQW9DdEYsR0FBcEMsR0FBMEMsRUFBbEQsQ0FBVjtBQUNBLGFBQU8sS0FBS3FKLFNBQVo7QUFDRDs7QUFFRDs7Ozs7O2lDQUdjO0FBQUE7O0FBQ1psRixtQkFBYSxLQUFLcEMsVUFBbEI7QUFDQSxXQUFLQSxVQUFMLEdBQWtCOEUsV0FBVztBQUFBLGVBQU8sT0FBS3JFLE1BQUwsSUFBZSxPQUFLQSxNQUFMLEVBQXRCO0FBQUEsT0FBWCxFQUFpRCxLQUFLdkIsZ0JBQXRELENBQWxCO0FBQ0Q7O0FBRUQ7Ozs7OztpQ0FHYztBQUNaa0QsbUJBQWEsS0FBS3BDLFVBQWxCO0FBQ0EsV0FBS0EsVUFBTCxHQUFrQixJQUFsQjtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztxQ0FpQmtCeUQsUSxFQUFVO0FBQzFCLFVBQUlYLFVBQVUsbUJBQU8sRUFBUCxFQUFXLFNBQVgsRUFBc0JXLFFBQXRCLEVBQWdDTixXQUFoQyxHQUE4Q0MsSUFBOUMsRUFBZDs7QUFFQTtBQUNBLFVBQUksQ0FBQ0ssUUFBRCxJQUFhLENBQUNBLFNBQVM4RCxVQUF2QixJQUFxQyxDQUFDOUQsU0FBUzhELFVBQVQsQ0FBb0JoRSxNQUE5RCxFQUFzRTtBQUNwRTtBQUNEOztBQUVEO0FBQ0EsVUFBSUUsU0FBU0osR0FBVCxLQUFpQixHQUFqQixJQUF3QixRQUFRbUUsSUFBUixDQUFhL0QsU0FBU1gsT0FBdEIsQ0FBeEIsSUFBMERXLFNBQVM4RCxVQUFULENBQW9CLENBQXBCLEVBQXVCRSxJQUF2QixLQUFnQyxNQUE5RixFQUFzRztBQUNwR2hFLGlCQUFTaUUsRUFBVCxHQUFjakMsT0FBT2hDLFNBQVNYLE9BQWhCLENBQWQ7QUFDQVcsaUJBQVNYLE9BQVQsR0FBbUIsQ0FBQ1csU0FBUzhELFVBQVQsQ0FBb0JmLEtBQXBCLEdBQTRCbUIsS0FBNUIsSUFBcUMsRUFBdEMsRUFBMEN6RSxRQUExQyxHQUFxREMsV0FBckQsR0FBbUVDLElBQW5FLEVBQW5CO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxLQUFiLEVBQW9CLEtBQXBCLEVBQTJCLFNBQTNCLEVBQXNDTyxPQUF0QyxDQUE4Q2IsT0FBOUMsSUFBeUQsQ0FBN0QsRUFBZ0U7QUFDOUQ7QUFDRDs7QUFFRDtBQUNBLFVBQUlXLFNBQVM4RCxVQUFULENBQW9COUQsU0FBUzhELFVBQVQsQ0FBb0JoRSxNQUFwQixHQUE2QixDQUFqRCxFQUFvRGtFLElBQXBELEtBQTZELE1BQWpFLEVBQXlFO0FBQ3ZFaEUsaUJBQVNHLGFBQVQsR0FBeUJILFNBQVM4RCxVQUFULENBQW9COUQsU0FBUzhELFVBQVQsQ0FBb0JoRSxNQUFwQixHQUE2QixDQUFqRCxFQUFvRG9FLEtBQTdFO0FBQ0Q7O0FBRUQ7QUFDQSxVQUFJbEUsU0FBUzhELFVBQVQsQ0FBb0IsQ0FBcEIsRUFBdUJFLElBQXZCLEtBQWdDLE1BQWhDLElBQTBDaEUsU0FBUzhELFVBQVQsQ0FBb0IsQ0FBcEIsRUFBdUJLLE9BQXJFLEVBQThFO0FBQzVFLFlBQU1DLFNBQVNwRSxTQUFTOEQsVUFBVCxDQUFvQixDQUFwQixFQUF1QkssT0FBdkIsQ0FBK0I1RSxHQUEvQixDQUFtQyxVQUFDZ0IsR0FBRCxFQUFTO0FBQ3pELGNBQUksQ0FBQ0EsR0FBTCxFQUFVO0FBQ1I7QUFDRDtBQUNELGNBQUk4RCxNQUFNQyxPQUFOLENBQWMvRCxHQUFkLENBQUosRUFBd0I7QUFDdEIsbUJBQU9BLElBQUloQixHQUFKLENBQVEsVUFBQ2dCLEdBQUQ7QUFBQSxxQkFBUyxDQUFDQSxJQUFJMkQsS0FBSixJQUFhLEVBQWQsRUFBa0J6RSxRQUFsQixHQUE2QkUsSUFBN0IsRUFBVDtBQUFBLGFBQVIsQ0FBUDtBQUNELFdBRkQsTUFFTztBQUNMLG1CQUFPLENBQUNZLElBQUkyRCxLQUFKLElBQWEsRUFBZCxFQUFrQnpFLFFBQWxCLEdBQTZCQyxXQUE3QixHQUEyQ0MsSUFBM0MsRUFBUDtBQUNEO0FBQ0YsU0FUYyxDQUFmOztBQVdBLFlBQU1ZLE1BQU02RCxPQUFPckIsS0FBUCxFQUFaO0FBQ0EvQyxpQkFBU0ksSUFBVCxHQUFnQkcsR0FBaEI7O0FBRUEsWUFBSTZELE9BQU90RSxNQUFQLEtBQWtCLENBQXRCLEVBQXlCO0FBQ3ZCRSxtQkFBU08sSUFBSWdFLFdBQUosRUFBVCxJQUE4QkgsT0FBTyxDQUFQLENBQTlCO0FBQ0QsU0FGRCxNQUVPLElBQUlBLE9BQU90RSxNQUFQLEdBQWdCLENBQXBCLEVBQXVCO0FBQzVCRSxtQkFBU08sSUFBSWdFLFdBQUosRUFBVCxJQUE4QkgsTUFBOUI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7Ozs7Ozs0QkFNU0YsSyxFQUFPO0FBQ2QsYUFBTyxDQUFDLENBQUM3RCxPQUFPbUUsU0FBUCxDQUFpQi9FLFFBQWpCLENBQTBCZ0YsSUFBMUIsQ0FBK0JQLEtBQS9CLEVBQXNDUSxLQUF0QyxDQUE0QyxVQUE1QyxDQUFUO0FBQ0Q7O0FBRUQ7O0FBRUE7Ozs7Ozt3Q0FHcUI7QUFBQTs7QUFDbkIsV0FBS0MsYUFBTCxHQUFxQixLQUFLdEgsTUFBTCxDQUFZUyxNQUFqQztBQUNBLFdBQUtyQixVQUFMLEdBQWtCLElBQWxCOztBQUVBLFVBQUksT0FBT21JLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE9BQU9DLE1BQTVDLEVBQW9EO0FBQ2xELGFBQUtDLGtCQUFMLEdBQTBCLElBQUlELE1BQUosQ0FBV0UsSUFBSUMsZUFBSixDQUFvQixJQUFJQyxJQUFKLENBQVMsQ0FBQ0MsZUFBRCxDQUFULENBQXBCLENBQVgsQ0FBMUI7QUFDQSxhQUFLSixrQkFBTCxDQUF3QkssU0FBeEIsR0FBb0MsVUFBQ2pILENBQUQsRUFBTztBQUN6QyxjQUFJRSxVQUFVRixFQUFFQyxJQUFGLENBQU9DLE9BQXJCO0FBQ0EsY0FBSUQsT0FBT0QsRUFBRUMsSUFBRixDQUFPK0MsTUFBbEI7O0FBRUEsa0JBQVE5QyxPQUFSO0FBQ0UsaUJBQUsvRCwyQkFBTDtBQUNFLHNCQUFLc0ssYUFBTCxDQUFtQixFQUFFeEcsVUFBRixFQUFuQjtBQUNBOztBQUVGLGlCQUFLNUQsMkJBQUw7QUFDRSxzQkFBS3NKLFNBQUwsR0FBaUIsUUFBS3hHLE1BQUwsQ0FBWWtFLElBQVosQ0FBaUJwRCxJQUFqQixDQUFqQjtBQUNBO0FBUEo7QUFTRCxTQWJEOztBQWVBLGFBQUsyRyxrQkFBTCxDQUF3QmhJLE9BQXhCLEdBQWtDLFVBQUNvQixDQUFELEVBQU87QUFDdkMsa0JBQUtOLFFBQUwsQ0FBYyxJQUFJQyxLQUFKLENBQVUsNENBQTRDSyxFQUFFRSxPQUF4RCxDQUFkO0FBQ0QsU0FGRDs7QUFJQSxhQUFLMEcsa0JBQUwsQ0FBd0JNLFdBQXhCLENBQW9DQyxjQUFjbEwseUJBQWQsQ0FBcEM7QUFDRCxPQXRCRCxNQXNCTztBQUNMLFlBQU1tTCxnQkFBZ0IsU0FBaEJBLGFBQWdCLENBQUNwRSxNQUFELEVBQVk7QUFBRSxrQkFBS3lELGFBQUwsQ0FBbUIsRUFBRXhHLE1BQU0rQyxNQUFSLEVBQW5CO0FBQXNDLFNBQTFFO0FBQ0EsWUFBTXFFLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBQ3JFLE1BQUQsRUFBWTtBQUFFLGtCQUFLMkMsU0FBTCxHQUFpQixRQUFLeEcsTUFBTCxDQUFZa0UsSUFBWixDQUFpQkwsTUFBakIsQ0FBakI7QUFBMkMsU0FBL0U7QUFDQSxhQUFLc0UsWUFBTCxHQUFvQiwwQkFBZ0JGLGFBQWhCLEVBQStCQyxhQUEvQixDQUFwQjtBQUNEOztBQUVEO0FBQ0EsV0FBS2xJLE1BQUwsQ0FBWVMsTUFBWixHQUFxQixVQUFDQyxHQUFELEVBQVM7QUFDNUIsWUFBSSxDQUFDLFFBQUt0QixVQUFWLEVBQXNCO0FBQ3BCO0FBQ0Q7O0FBRUQsWUFBSSxRQUFLcUksa0JBQVQsRUFBNkI7QUFDM0Isa0JBQUtBLGtCQUFMLENBQXdCTSxXQUF4QixDQUFvQ0MsY0FBY2pMLGVBQWQsRUFBK0IyRCxJQUFJSSxJQUFuQyxDQUFwQyxFQUE4RSxDQUFDSixJQUFJSSxJQUFMLENBQTlFO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsa0JBQUtxSCxZQUFMLENBQWtCQyxPQUFsQixDQUEwQjFILElBQUlJLElBQTlCO0FBQ0Q7QUFDRixPQVZEO0FBV0Q7O0FBRUQ7Ozs7OzswQ0FHdUI7QUFDckIsVUFBSSxDQUFDLEtBQUsxQixVQUFWLEVBQXNCO0FBQ3BCO0FBQ0Q7O0FBRUQsV0FBS0EsVUFBTCxHQUFrQixLQUFsQjtBQUNBLFdBQUtZLE1BQUwsQ0FBWVMsTUFBWixHQUFxQixLQUFLNkcsYUFBMUI7QUFDQSxXQUFLQSxhQUFMLEdBQXFCLElBQXJCOztBQUVBLFVBQUksS0FBS0csa0JBQVQsRUFBNkI7QUFDM0I7QUFDQSxhQUFLQSxrQkFBTCxDQUF3QlksU0FBeEI7QUFDQSxhQUFLWixrQkFBTCxHQUEwQixJQUExQjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O29DQUtpQjVELE0sRUFBUTtBQUN2QjtBQUNBLFVBQUksS0FBSzRELGtCQUFULEVBQTZCO0FBQzNCLGFBQUtBLGtCQUFMLENBQXdCTSxXQUF4QixDQUFvQ0MsY0FBYy9LLGVBQWQsRUFBK0I0RyxNQUEvQixDQUFwQyxFQUE0RSxDQUFDQSxNQUFELENBQTVFO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBS3NFLFlBQUwsQ0FBa0JHLE9BQWxCLENBQTBCekUsTUFBMUI7QUFDRDtBQUNGOzs7Ozs7a0JBMXdCa0I3RixJOzs7QUE2d0JyQixJQUFNZ0ssZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFDakgsT0FBRCxFQUFVOEMsTUFBVjtBQUFBLFNBQXNCLEVBQUU5QyxnQkFBRixFQUFXOEMsY0FBWCxFQUF0QjtBQUFBLENBQXRCIiwiZmlsZSI6ImltYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwcm9wT3IgfSBmcm9tICdyYW1kYSdcbmltcG9ydCBUQ1BTb2NrZXQgZnJvbSAnZW1haWxqcy10Y3Atc29ja2V0J1xuaW1wb3J0IHsgdG9UeXBlZEFycmF5LCBmcm9tVHlwZWRBcnJheSB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IHsgcGFyc2VyLCBjb21waWxlciB9IGZyb20gJ2VtYWlsanMtaW1hcC1oYW5kbGVyJ1xuaW1wb3J0IENvbXByZXNzaW9uIGZyb20gJy4vY29tcHJlc3Npb24nXG5pbXBvcnQgQ29tcHJlc3Npb25CbG9iIGZyb20gJy4uL3Jlcy9jb21wcmVzc2lvbi53b3JrZXIuYmxvYidcblxuLy9cbi8vIGNvbnN0YW50cyB1c2VkIGZvciBjb21tdW5pY2F0aW9uIHdpdGggdGhlIHdvcmtlclxuLy9cbmNvbnN0IE1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIgPSAnc3RhcnQnXG5jb25zdCBNRVNTQUdFX0lORkxBVEUgPSAnaW5mbGF0ZSdcbmNvbnN0IE1FU1NBR0VfSU5GTEFURURfREFUQV9SRUFEWSA9ICdpbmZsYXRlZF9yZWFkeSdcbmNvbnN0IE1FU1NBR0VfREVGTEFURSA9ICdkZWZsYXRlJ1xuY29uc3QgTUVTU0FHRV9ERUZMQVRFRF9EQVRBX1JFQURZID0gJ2RlZmxhdGVkX3JlYWR5J1xuXG5jb25zdCBFT0wgPSAnXFxyXFxuJ1xuY29uc3QgTElORV9GRUVEID0gMTBcbmNvbnN0IENBUlJJQUdFX1JFVFVSTiA9IDEzXG5jb25zdCBMRUZUX0NVUkxZX0JSQUNLRVQgPSAxMjNcbmNvbnN0IFJJR0hUX0NVUkxZX0JSQUNLRVQgPSAxMjVcblxuY29uc3QgQVNDSUlfUExVUyA9IDQzXG5cbi8vIFN0YXRlIHRyYWNraW5nIHdoZW4gY29uc3RydWN0aW5nIGFuIElNQVAgY29tbWFuZCBmcm9tIGJ1ZmZlcnMuXG5jb25zdCBCVUZGRVJfU1RBVEVfTElURVJBTCA9ICdsaXRlcmFsJ1xuY29uc3QgQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzEgPSAnbGl0ZXJhbF9sZW5ndGhfMSdcbmNvbnN0IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8yID0gJ2xpdGVyYWxfbGVuZ3RoXzInXG5jb25zdCBCVUZGRVJfU1RBVEVfREVGQVVMVCA9ICdkZWZhdWx0J1xuXG4vKipcbiAqIEhvdyBtdWNoIHRpbWUgdG8gd2FpdCBzaW5jZSB0aGUgbGFzdCByZXNwb25zZSB1bnRpbCB0aGUgY29ubmVjdGlvbiBpcyBjb25zaWRlcmVkIGlkbGluZ1xuICovXG5jb25zdCBUSU1FT1VUX0VOVEVSX0lETEUgPSAxMDAwXG5cbi8qKlxuICogTG93ZXIgQm91bmQgZm9yIHNvY2tldCB0aW1lb3V0IHRvIHdhaXQgc2luY2UgdGhlIGxhc3QgZGF0YSB3YXMgd3JpdHRlbiB0byBhIHNvY2tldFxuICovXG5jb25zdCBUSU1FT1VUX1NPQ0tFVF9MT1dFUl9CT1VORCA9IDEwMDAwXG5cbi8qKlxuICogTXVsdGlwbGllciBmb3Igc29ja2V0IHRpbWVvdXQ6XG4gKlxuICogV2UgYXNzdW1lIGF0IGxlYXN0IGEgR1BSUyBjb25uZWN0aW9uIHdpdGggMTE1IGtiL3MgPSAxNCwzNzUga0IvcyB0b3BzLCBzbyAxMCBLQi9zIHRvIGJlIG9uXG4gKiB0aGUgc2FmZSBzaWRlLiBXZSBjYW4gdGltZW91dCBhZnRlciBhIGxvd2VyIGJvdW5kIG9mIDEwcyArIChuIEtCIC8gMTAgS0IvcykuIEEgMSBNQiBtZXNzYWdlXG4gKiB1cGxvYWQgd291bGQgYmUgMTEwIHNlY29uZHMgdG8gd2FpdCBmb3IgdGhlIHRpbWVvdXQuIDEwIEtCL3MgPT09IDAuMSBzL0JcbiAqL1xuY29uc3QgVElNRU9VVF9TT0NLRVRfTVVMVElQTElFUiA9IDAuMVxuXG4vKipcbiAqIENyZWF0ZXMgYSBjb25uZWN0aW9uIG9iamVjdCB0byBhbiBJTUFQIHNlcnZlci4gQ2FsbCBgY29ubmVjdGAgbWV0aG9kIHRvIGluaXRpdGF0ZVxuICogdGhlIGFjdHVhbCBjb25uZWN0aW9uLCB0aGUgY29uc3RydWN0b3Igb25seSBkZWZpbmVzIHRoZSBwcm9wZXJ0aWVzIGJ1dCBkb2VzIG5vdCBhY3R1YWxseSBjb25uZWN0LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbaG9zdD0nbG9jYWxob3N0J10gSG9zdG5hbWUgdG8gY29uZW5jdCB0b1xuICogQHBhcmFtIHtOdW1iZXJ9IFtwb3J0PTE0M10gUG9ydCBudW1iZXIgdG8gY29ubmVjdCB0b1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25hbCBvcHRpb25zIG9iamVjdFxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnRdIFNldCB0byB0cnVlLCB0byB1c2UgZW5jcnlwdGVkIGNvbm5lY3Rpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5jb21wcmVzc2lvbldvcmtlclBhdGhdIG9mZmxvYWRzIGRlLS9jb21wcmVzc2lvbiBjb21wdXRhdGlvbiB0byBhIHdlYiB3b3JrZXIsIHRoaXMgaXMgdGhlIHBhdGggdG8gdGhlIGJyb3dzZXJpZmllZCBlbWFpbGpzLWNvbXByZXNzb3Itd29ya2VyLmpzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltYXAge1xuICBjb25zdHJ1Y3RvciAoaG9zdCwgcG9ydCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy50aW1lb3V0RW50ZXJJZGxlID0gVElNRU9VVF9FTlRFUl9JRExFXG4gICAgdGhpcy50aW1lb3V0U29ja2V0TG93ZXJCb3VuZCA9IFRJTUVPVVRfU09DS0VUX0xPV0VSX0JPVU5EXG4gICAgdGhpcy50aW1lb3V0U29ja2V0TXVsdGlwbGllciA9IFRJTUVPVVRfU09DS0VUX01VTFRJUExJRVJcbiAgICB0aGlzLm9uRGF0YVRpbWVvdXQgPSB0aGlzLnRpbWVvdXRTb2NrZXRMb3dlckJvdW5kICsgTWF0aC5mbG9vcig0MDk2ICogdGhpcy50aW1lb3V0U29ja2V0TXVsdGlwbGllcilcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcblxuICAgIHRoaXMucG9ydCA9IHBvcnQgfHwgKHRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgPyA5OTMgOiAxNDMpXG4gICAgdGhpcy5ob3N0ID0gaG9zdCB8fCAnbG9jYWxob3N0J1xuXG4gICAgLy8gVXNlIGEgVExTIGNvbm5lY3Rpb24uIFBvcnQgOTkzIGFsc28gZm9yY2VzIFRMUy5cbiAgICB0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0ID0gJ3VzZVNlY3VyZVRyYW5zcG9ydCcgaW4gdGhpcy5vcHRpb25zID8gISF0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0IDogdGhpcy5wb3J0ID09PSA5OTNcblxuICAgIHRoaXMuc2VjdXJlTW9kZSA9ICEhdGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCAvLyBEb2VzIHRoZSBjb25uZWN0aW9uIHVzZSBTU0wvVExTXG5cbiAgICB0aGlzLl9jb25uZWN0aW9uUmVhZHkgPSBmYWxzZSAvLyBJcyB0aGUgY29uZWN0aW9uIGVzdGFibGlzaGVkIGFuZCBncmVldGluZyBpcyByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXJcblxuICAgIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkID0ge30gLy8gR2xvYmFsIGhhbmRsZXJzIGZvciB1bnJlbGF0ZWQgcmVzcG9uc2VzIChFWFBVTkdFLCBFWElTVFMgZXRjLilcblxuICAgIHRoaXMuX2NsaWVudFF1ZXVlID0gW10gLy8gUXVldWUgb2Ygb3V0Z29pbmcgY29tbWFuZHNcbiAgICB0aGlzLl9jYW5TZW5kID0gZmFsc2UgLy8gSXMgaXQgT0sgdG8gc2VuZCBzb21ldGhpbmcgdG8gdGhlIHNlcnZlclxuICAgIHRoaXMuX3RhZ0NvdW50ZXIgPSAwIC8vIENvdW50ZXIgdG8gYWxsb3cgdW5pcXVldWUgaW1hcCB0YWdzXG4gICAgdGhpcy5fY3VycmVudENvbW1hbmQgPSBmYWxzZSAvLyBDdXJyZW50IGNvbW1hbmQgdGhhdCBpcyB3YWl0aW5nIGZvciByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXJcblxuICAgIHRoaXMuX2lkbGVUaW1lciA9IGZhbHNlIC8vIFRpbWVyIHdhaXRpbmcgdG8gZW50ZXIgaWRsZVxuICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IGZhbHNlIC8vIFRpbWVyIHdhaXRpbmcgdG8gZGVjbGFyZSB0aGUgc29ja2V0IGRlYWQgc3RhcnRpbmcgZnJvbSB0aGUgbGFzdCB3cml0ZVxuXG4gICAgdGhpcy5jb21wcmVzc2VkID0gZmFsc2UgLy8gSXMgdGhlIGNvbm5lY3Rpb24gY29tcHJlc3NlZCBhbmQgbmVlZHMgaW5mbGF0aW5nL2RlZmxhdGluZ1xuXG4gICAgLy9cbiAgICAvLyBIRUxQRVJTXG4gICAgLy9cblxuICAgIC8vIEFzIHRoZSBzZXJ2ZXIgc2VuZHMgZGF0YSBpbiBjaHVua3MsIGl0IG5lZWRzIHRvIGJlIHNwbGl0IGludG8gc2VwYXJhdGUgbGluZXMuIEhlbHBzIHBhcnNpbmcgdGhlIGlucHV0LlxuICAgIHRoaXMuX2luY29taW5nQnVmZmVycyA9IFtdXG4gICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfREVGQVVMVFxuICAgIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPSAwXG5cbiAgICAvL1xuICAgIC8vIEV2ZW50IHBsYWNlaG9sZGVycywgbWF5IGJlIG92ZXJyaWRlbiB3aXRoIGNhbGxiYWNrIGZ1bmN0aW9uc1xuICAgIC8vXG4gICAgdGhpcy5vbmNlcnQgPSBudWxsXG4gICAgdGhpcy5vbmVycm9yID0gbnVsbCAvLyBJcnJlY292ZXJhYmxlIGVycm9yIG9jY3VycmVkLiBDb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIgd2lsbCBiZSBjbG9zZWQgYXV0b21hdGljYWxseS5cbiAgICB0aGlzLm9ucmVhZHkgPSBudWxsIC8vIFRoZSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIgaGFzIGJlZW4gZXN0YWJsaXNoZWQgYW5kIGdyZWV0aW5nIGlzIHJlY2VpdmVkXG4gICAgdGhpcy5vbmlkbGUgPSBudWxsICAvLyBUaGVyZSBhcmUgbm8gbW9yZSBjb21tYW5kcyB0byBwcm9jZXNzXG4gIH1cblxuICAvLyBQVUJMSUMgTUVUSE9EU1xuXG4gIC8qKlxuICAgKiBJbml0aWF0ZSBhIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlci4gV2FpdCBmb3Igb25yZWFkeSBldmVudFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gU29ja2V0XG4gICAqICAgICBURVNUSU5HIE9OTFkhIFRoZSBUQ1BTb2NrZXQgaGFzIGEgcHJldHR5IG5vbnNlbnNpY2FsIGNvbnZlbmllbmNlIGNvbnN0cnVjdG9yLFxuICAgKiAgICAgd2hpY2ggbWFrZXMgaXQgaGFyZCB0byBtb2NrLiBGb3IgZGVwZW5kZW5jeS1pbmplY3Rpb24gcHVycG9zZXMsIHdlIHVzZSB0aGVcbiAgICogICAgIFNvY2tldCBwYXJhbWV0ZXIgdG8gcGFzcyBpbiBhIG1vY2sgU29ja2V0IGltcGxlbWVudGF0aW9uLiBTaG91bGQgYmUgbGVmdCBibGFua1xuICAgKiAgICAgaW4gcHJvZHVjdGlvbiB1c2UhXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNvY2tldCBpcyBvcGVuZWRcbiAgICovXG4gIGNvbm5lY3QgKFNvY2tldCA9IFRDUFNvY2tldCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNvY2tldCA9IFNvY2tldC5vcGVuKHRoaXMuaG9zdCwgdGhpcy5wb3J0LCB7XG4gICAgICAgIGJpbmFyeVR5cGU6ICdhcnJheWJ1ZmZlcicsXG4gICAgICAgIHVzZVNlY3VyZVRyYW5zcG9ydDogdGhpcy5zZWN1cmVNb2RlLFxuICAgICAgICBjYTogdGhpcy5vcHRpb25zLmNhXG4gICAgICB9KVxuXG4gICAgICAvLyBhbGxvd3MgY2VydGlmaWNhdGUgaGFuZGxpbmcgZm9yIHBsYXRmb3JtIHcvbyBuYXRpdmUgdGxzIHN1cHBvcnRcbiAgICAgIC8vIG9uY2VydCBpcyBub24gc3RhbmRhcmQgc28gc2V0dGluZyBpdCBtaWdodCB0aHJvdyBpZiB0aGUgc29ja2V0IG9iamVjdCBpcyBpbW11dGFibGVcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuc29ja2V0Lm9uY2VydCA9IChjZXJ0KSA9PiB7IHRoaXMub25jZXJ0ICYmIHRoaXMub25jZXJ0KGNlcnQpIH1cbiAgICAgIH0gY2F0Y2ggKEUpIHsgfVxuXG4gICAgICAvLyBDb25uZWN0aW9uIGNsb3NpbmcgdW5leHBlY3RlZCBpcyBhbiBlcnJvclxuICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9ICgpID0+IHRoaXMuX29uRXJyb3IobmV3IEVycm9yKCdTb2NrZXQgY2xvc2VkIHVuZXhjZXB0ZWRseSEnKSlcbiAgICAgIHRoaXMuc29ja2V0Lm9uZGF0YSA9IChldnQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLl9vbkRhdGEoZXZ0KVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aGlzLl9vbkVycm9yKGVycilcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpZiBhbiBlcnJvciBoYXBwZW5zIGR1cmluZyBjcmVhdGUgdGltZSwgcmVqZWN0IHRoZSBwcm9taXNlXG4gICAgICB0aGlzLnNvY2tldC5vbmVycm9yID0gKGUpID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ291bGQgbm90IG9wZW4gc29ja2V0OiAnICsgZS5kYXRhLm1lc3NhZ2UpKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNvY2tldC5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICAgIC8vIHVzZSBwcm9wZXIgXCJpcnJlY292ZXJhYmxlIGVycm9yLCB0ZWFyIGRvd24gZXZlcnl0aGluZ1wiLWhhbmRsZXIgb25seSBhZnRlciBzb2NrZXQgaXMgb3BlblxuICAgICAgICB0aGlzLnNvY2tldC5vbmVycm9yID0gKGUpID0+IHRoaXMuX29uRXJyb3IoZSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlclxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiB0aGUgc29ja2V0IGlzIGNsb3NlZFxuICAgKi9cbiAgY2xvc2UgKGVycm9yKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB2YXIgdGVhckRvd24gPSAoKSA9PiB7XG4gICAgICAgIC8vIGZ1bGZpbGwgcGVuZGluZyBwcm9taXNlc1xuICAgICAgICB0aGlzLl9jbGllbnRRdWV1ZS5mb3JFYWNoKGNtZCA9PiBjbWQuY2FsbGJhY2soZXJyb3IpKVxuICAgICAgICBpZiAodGhpcy5fY3VycmVudENvbW1hbmQpIHtcbiAgICAgICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5jYWxsYmFjayhlcnJvcilcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NsaWVudFF1ZXVlID0gW11cbiAgICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQgPSBmYWxzZVxuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZXIpXG4gICAgICAgIHRoaXMuX2lkbGVUaW1lciA9IG51bGxcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKVxuICAgICAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBudWxsXG5cbiAgICAgICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgICAgLy8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbm9wZW4gPSBudWxsXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IG51bGxcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSBudWxsXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IG51bGxcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5zb2NrZXQub25jZXJ0ID0gbnVsbFxuICAgICAgICAgIH0gY2F0Y2ggKEUpIHsgfVxuXG4gICAgICAgICAgdGhpcy5zb2NrZXQgPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZGlzYWJsZUNvbXByZXNzaW9uKClcblxuICAgICAgaWYgKCF0aGlzLnNvY2tldCB8fCB0aGlzLnNvY2tldC5yZWFkeVN0YXRlICE9PSAnb3BlbicpIHtcbiAgICAgICAgcmV0dXJuIHRlYXJEb3duKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IHRoaXMuc29ja2V0Lm9uZXJyb3IgPSB0ZWFyRG93biAvLyB3ZSBkb24ndCByZWFsbHkgY2FyZSBhYm91dCB0aGUgZXJyb3IgaGVyZVxuICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBMT0dPVVQgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogVXNlIGlzIGRpc2NvdXJhZ2VkIVxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBjb25uZWN0aW9uIGlzIGNsb3NlZCBieSBzZXJ2ZXIuXG4gICAqL1xuICBsb2dvdXQgKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gdGhpcy5zb2NrZXQub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgnQ2xpZW50IGxvZ2dpbmcgb3V0JykudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW5xdWV1ZUNvbW1hbmQoJ0xPR09VVCcpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWF0ZXMgVExTIGhhbmRzaGFrZVxuICAgKi9cbiAgdXBncmFkZSAoKSB7XG4gICAgdGhpcy5zZWN1cmVNb2RlID0gdHJ1ZVxuICAgIHRoaXMuc29ja2V0LnVwZ3JhZGVUb1NlY3VyZSgpXG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVzIGEgY29tbWFuZCB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZW1haWxqcy9lbWFpbGpzLWltYXAtaGFuZGxlciBmb3IgcmVxdWVzdCBzdHJ1Y3R1cmUuXG4gICAqIERvIG5vdCBwcm92aWRlIGEgdGFnIHByb3BlcnR5LCBpdCB3aWxsIGJlIHNldCBieSB0aGUgcXVldWUgbWFuYWdlci5cbiAgICpcbiAgICogVG8gY2F0Y2ggdW50YWdnZWQgcmVzcG9uc2VzIHVzZSBhY2NlcHRVbnRhZ2dlZCBwcm9wZXJ0eS4gRm9yIGV4YW1wbGUsIGlmXG4gICAqIHRoZSB2YWx1ZSBmb3IgaXQgaXMgJ0ZFVENIJyB0aGVuIHRoZSByZXBvbnNlIGluY2x1ZGVzICdwYXlsb2FkLkZFVENIJyBwcm9wZXJ0eVxuICAgKiB0aGF0IGlzIGFuIGFycmF5IGluY2x1ZGluZyBhbGwgbGlzdGVkICogRkVUQ0ggcmVzcG9uc2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdCBTdHJ1Y3R1cmVkIHJlcXVlc3Qgb2JqZWN0XG4gICAqIEBwYXJhbSB7QXJyYXl9IGFjY2VwdFVudGFnZ2VkIGEgbGlzdCBvZiB1bnRhZ2dlZCByZXNwb25zZXMgdGhhdCB3aWxsIGJlIGluY2x1ZGVkIGluICdwYXlsb2FkJyBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIGRhdGEgZm9yIHRoZSBjb21tYW5kIHBheWxvYWRcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgKi9cbiAgZW5xdWV1ZUNvbW1hbmQgKHJlcXVlc3QsIGFjY2VwdFVudGFnZ2VkLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmVxdWVzdCA9IHtcbiAgICAgICAgY29tbWFuZDogcmVxdWVzdFxuICAgICAgfVxuICAgIH1cblxuICAgIGFjY2VwdFVudGFnZ2VkID0gW10uY29uY2F0KGFjY2VwdFVudGFnZ2VkIHx8IFtdKS5tYXAoKHVudGFnZ2VkKSA9PiAodW50YWdnZWQgfHwgJycpLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKS50cmltKCkpXG5cbiAgICB2YXIgdGFnID0gJ1cnICsgKCsrdGhpcy5fdGFnQ291bnRlcilcbiAgICByZXF1ZXN0LnRhZyA9IHRhZ1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICB0YWc6IHRhZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgcGF5bG9hZDogYWNjZXB0VW50YWdnZWQubGVuZ3RoID8ge30gOiB1bmRlZmluZWQsXG4gICAgICAgIGNhbGxiYWNrOiAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5pc0Vycm9yKHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICB9IGVsc2UgaWYgKFsnTk8nLCAnQkFEJ10uaW5kZXhPZihwcm9wT3IoJycsICdjb21tYW5kJywgcmVzcG9uc2UpLnRvVXBwZXJDYXNlKCkudHJpbSgpKSA+PSAwKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IocmVzcG9uc2UuaHVtYW5SZWFkYWJsZSB8fCAnRXJyb3InKVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmNvZGUpIHtcbiAgICAgICAgICAgICAgZXJyb3IuY29kZSA9IHJlc3BvbnNlLmNvZGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhcHBseSBhbnkgYWRkaXRpb25hbCBvcHRpb25zIHRvIHRoZSBjb21tYW5kXG4gICAgICBPYmplY3Qua2V5cyhvcHRpb25zIHx8IHt9KS5mb3JFYWNoKChrZXkpID0+IHsgZGF0YVtrZXldID0gb3B0aW9uc1trZXldIH0pXG5cbiAgICAgIGFjY2VwdFVudGFnZ2VkLmZvckVhY2goKGNvbW1hbmQpID0+IHsgZGF0YS5wYXlsb2FkW2NvbW1hbmRdID0gW10gfSlcblxuICAgICAgLy8gaWYgd2UncmUgaW4gcHJpb3JpdHkgbW9kZSAoaS5lLiB3ZSByYW4gY29tbWFuZHMgaW4gYSBwcmVjaGVjayksXG4gICAgICAvLyBxdWV1ZSBhbnkgY29tbWFuZHMgQkVGT1JFIHRoZSBjb21tYW5kIHRoYXQgY29udGlhbmVkIHRoZSBwcmVjaGVjayxcbiAgICAgIC8vIG90aGVyd2lzZSBqdXN0IHF1ZXVlIGNvbW1hbmQgYXMgdXN1YWxcbiAgICAgIHZhciBpbmRleCA9IGRhdGEuY3R4ID8gdGhpcy5fY2xpZW50UXVldWUuaW5kZXhPZihkYXRhLmN0eCkgOiAtMVxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgZGF0YS50YWcgKz0gJy5wJ1xuICAgICAgICBkYXRhLnJlcXVlc3QudGFnICs9ICcucCdcbiAgICAgICAgdGhpcy5fY2xpZW50UXVldWUuc3BsaWNlKGluZGV4LCAwLCBkYXRhKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY2xpZW50UXVldWUucHVzaChkYXRhKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fY2FuU2VuZCkge1xuICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gY29tbWFuZHNcbiAgICogQHBhcmFtIGN0eFxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldFByZXZpb3VzbHlRdWV1ZWQgKGNvbW1hbmRzLCBjdHgpIHtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gdGhpcy5fY2xpZW50UXVldWUuaW5kZXhPZihjdHgpIC0gMVxuXG4gICAgLy8gc2VhcmNoIGJhY2t3YXJkcyBmb3IgdGhlIGNvbW1hbmRzIGFuZCByZXR1cm4gdGhlIGZpcnN0IGZvdW5kXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoaXNNYXRjaCh0aGlzLl9jbGllbnRRdWV1ZVtpXSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsaWVudFF1ZXVlW2ldXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWxzbyBjaGVjayBjdXJyZW50IGNvbW1hbmQgaWYgbm8gU0VMRUNUIGlzIHF1ZXVlZFxuICAgIGlmIChpc01hdGNoKHRoaXMuX2N1cnJlbnRDb21tYW5kKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb21tYW5kXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgICBmdW5jdGlvbiBpc01hdGNoIChkYXRhKSB7XG4gICAgICByZXR1cm4gZGF0YSAmJiBkYXRhLnJlcXVlc3QgJiYgY29tbWFuZHMuaW5kZXhPZihkYXRhLnJlcXVlc3QuY29tbWFuZCkgPj0gMFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGRhdGEgdG8gdGhlIFRDUCBzb2NrZXRcbiAgICogQXJtcyBhIHRpbWVvdXQgd2FpdGluZyBmb3IgYSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgUGF5bG9hZFxuICAgKi9cbiAgc2VuZCAoc3RyKSB7XG4gICAgY29uc3QgYnVmZmVyID0gdG9UeXBlZEFycmF5KHN0cikuYnVmZmVyXG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMudGltZW91dFNvY2tldExvd2VyQm91bmQgKyBNYXRoLmZsb29yKGJ1ZmZlci5ieXRlTGVuZ3RoICogdGhpcy50aW1lb3V0U29ja2V0TXVsdGlwbGllcilcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIpIC8vIGNsZWFyIHBlbmRpbmcgdGltZW91dHNcbiAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX29uRXJyb3IobmV3IEVycm9yKCcgU29ja2V0IHRpbWVkIG91dCEnKSksIHRpbWVvdXQpIC8vIGFybSB0aGUgbmV4dCB0aW1lb3V0XG5cbiAgICBpZiAodGhpcy5jb21wcmVzc2VkKSB7XG4gICAgICB0aGlzLl9zZW5kQ29tcHJlc3NlZChidWZmZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc29ja2V0LnNlbmQoYnVmZmVyKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSBnbG9iYWwgaGFuZGxlciBmb3IgYW4gdW50YWdnZWQgcmVzcG9uc2UuIElmIGN1cnJlbnRseSBwcm9jZXNzZWQgY29tbWFuZFxuICAgKiBoYXMgbm90IGxpc3RlZCB1bnRhZ2dlZCBjb21tYW5kIGl0IGlzIGZvcndhcmRlZCB0byB0aGUgZ2xvYmFsIGhhbmRsZXIuIFVzZWZ1bFxuICAgKiB3aXRoIEVYUFVOR0UsIEVYSVNUUyBldGMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb21tYW5kIFVudGFnZ2VkIGNvbW1hbmQgbmFtZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmdW5jdGlvbiB3aXRoIHJlc3BvbnNlIG9iamVjdCBhbmQgY29udGludWUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICovXG4gIHNldEhhbmRsZXIgKGNvbW1hbmQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWRbY29tbWFuZC50b1VwcGVyQ2FzZSgpLnRyaW0oKV0gPSBjYWxsYmFja1xuICB9XG5cbiAgLy8gSU5URVJOQUwgRVZFTlRTXG5cbiAgLyoqXG4gICAqIEVycm9yIGhhbmRsZXIgZm9yIHRoZSBzb2NrZXRcbiAgICpcbiAgICogQGV2ZW50XG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2dCBFdmVudCBvYmplY3QuIFNlZSBldnQuZGF0YSBmb3IgdGhlIGVycm9yXG4gICAqL1xuICBfb25FcnJvciAoZXZ0KSB7XG4gICAgdmFyIGVycm9yXG4gICAgaWYgKHRoaXMuaXNFcnJvcihldnQpKSB7XG4gICAgICBlcnJvciA9IGV2dFxuICAgIH0gZWxzZSBpZiAoZXZ0ICYmIHRoaXMuaXNFcnJvcihldnQuZGF0YSkpIHtcbiAgICAgIGVycm9yID0gZXZ0LmRhdGFcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoKGV2dCAmJiBldnQuZGF0YSAmJiBldnQuZGF0YS5tZXNzYWdlKSB8fCBldnQuZGF0YSB8fCBldnQgfHwgJ0Vycm9yJylcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5lcnJvcihlcnJvcilcblxuICAgIC8vIGFsd2F5cyBjYWxsIG9uZXJyb3IgY2FsbGJhY2ssIG5vIG1hdHRlciBpZiBjbG9zZSgpIHN1Y2NlZWRzIG9yIGZhaWxzXG4gICAgdGhpcy5jbG9zZShlcnJvcikudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycm9yKVxuICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMub25lcnJvciAmJiB0aGlzLm9uZXJyb3IoZXJyb3IpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVyIGZvciBpbmNvbWluZyBkYXRhIGZyb20gdGhlIHNlcnZlci4gVGhlIGRhdGEgaXMgc2VudCBpbiBhcmJpdHJhcnlcbiAgICogY2h1bmtzIGFuZCBjYW4ndCBiZSB1c2VkIGRpcmVjdGx5IHNvIHRoaXMgZnVuY3Rpb24gbWFrZXMgc3VyZSB0aGUgZGF0YVxuICAgKiBpcyBzcGxpdCBpbnRvIGNvbXBsZXRlIGxpbmVzIGJlZm9yZSB0aGUgZGF0YSBpcyBwYXNzZWQgdG8gdGhlIGNvbW1hbmRcbiAgICogaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnRcbiAgICovXG4gIF9vbkRhdGEgKGV2dCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIpIC8vIHJlc2V0IHRoZSB0aW1lb3V0IG9uIGVhY2ggZGF0YSBwYWNrZXRcbiAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX29uRXJyb3IobmV3IEVycm9yKCcgU29ja2V0IHRpbWVkIG91dCEnKSksIHRoaXMuT05fREFUQV9USU1FT1VUKVxuXG4gICAgdGhpcy5faW5jb21pbmdCdWZmZXJzLnB1c2gobmV3IFVpbnQ4QXJyYXkoZXZ0LmRhdGEpKSAvLyBhcHBlbmQgdG8gdGhlIGluY29taW5nIGJ1ZmZlclxuICAgIHRoaXMuX3BhcnNlSW5jb21pbmdDb21tYW5kcyh0aGlzLl9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKSkgLy8gQ29uc3VtZSB0aGUgaW5jb21pbmcgYnVmZmVyXG4gIH1cblxuICAqIF9pdGVyYXRlSW5jb21pbmdCdWZmZXIgKCkge1xuICAgIGxldCBidWYgPSB0aGlzLl9pbmNvbWluZ0J1ZmZlcnNbdGhpcy5faW5jb21pbmdCdWZmZXJzLmxlbmd0aCAtIDFdIHx8IFtdXG4gICAgbGV0IGkgPSAwXG5cbiAgICAvLyBsb29wIGludmFyaWFudDpcbiAgICAvLyAgIHRoaXMuX2luY29taW5nQnVmZmVycyBzdGFydHMgd2l0aCB0aGUgYmVnaW5uaW5nIG9mIGluY29taW5nIGNvbW1hbmQuXG4gICAgLy8gICBidWYgaXMgc2hvcnRoYW5kIGZvciBsYXN0IGVsZW1lbnQgb2YgdGhpcy5faW5jb21pbmdCdWZmZXJzLlxuICAgIC8vICAgYnVmWzAuLmktMV0gaXMgcGFydCBvZiBpbmNvbWluZyBjb21tYW5kLlxuICAgIHdoaWxlIChpIDwgYnVmLmxlbmd0aCkge1xuICAgICAgc3dpdGNoICh0aGlzLl9idWZmZXJTdGF0ZSkge1xuICAgICAgICBjYXNlIEJVRkZFUl9TVEFURV9MSVRFUkFMOlxuICAgICAgICAgIGNvbnN0IGRpZmYgPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gaSwgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZylcbiAgICAgICAgICB0aGlzLl9saXRlcmFsUmVtYWluaW5nIC09IGRpZmZcbiAgICAgICAgICBpICs9IGRpZmZcbiAgICAgICAgICBpZiAodGhpcy5fbGl0ZXJhbFJlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfREVGQVVMVFxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgIGNhc2UgQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzI6XG4gICAgICAgICAgaWYgKGkgPCBidWYubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoYnVmW2ldID09PSBDQVJSSUFHRV9SRVRVUk4pIHtcbiAgICAgICAgICAgICAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyA9IE51bWJlcihmcm9tVHlwZWRBcnJheSh0aGlzLl9sZW5ndGhCdWZmZXIpKSArIDIgLy8gZm9yIENSTEZcbiAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfTElURVJBTFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfREVGQVVMVFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xlbmd0aEJ1ZmZlclxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgIGNhc2UgQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzE6XG4gICAgICAgICAgY29uc3Qgc3RhcnQgPSBpXG4gICAgICAgICAgd2hpbGUgKGkgPCBidWYubGVuZ3RoICYmIGJ1ZltpXSA+PSA0OCAmJiBidWZbaV0gPD0gNTcpIHsgLy8gZGlnaXRzXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0YXJ0ICE9PSBpKSB7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3QgPSBidWYuc3ViYXJyYXkoc3RhcnQsIGkpXG4gICAgICAgICAgICBjb25zdCBwcmV2QnVmID0gdGhpcy5fbGVuZ3RoQnVmZmVyXG4gICAgICAgICAgICB0aGlzLl9sZW5ndGhCdWZmZXIgPSBuZXcgVWludDhBcnJheShwcmV2QnVmLmxlbmd0aCArIGxhdGVzdC5sZW5ndGgpXG4gICAgICAgICAgICB0aGlzLl9sZW5ndGhCdWZmZXIuc2V0KHByZXZCdWYpXG4gICAgICAgICAgICB0aGlzLl9sZW5ndGhCdWZmZXIuc2V0KGxhdGVzdCwgcHJldkJ1Zi5sZW5ndGgpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpIDwgYnVmLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xlbmd0aEJ1ZmZlci5sZW5ndGggPiAwICYmIGJ1ZltpXSA9PT0gUklHSFRfQ1VSTFlfQlJBQ0tFVCkge1xuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8yXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fbGVuZ3RoQnVmZmVyXG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gZmluZCBsaXRlcmFsIGxlbmd0aFxuICAgICAgICAgIGNvbnN0IGxlZnRJZHggPSBidWYuaW5kZXhPZihMRUZUX0NVUkxZX0JSQUNLRVQsIGkpXG4gICAgICAgICAgaWYgKGxlZnRJZHggPiAtMSkge1xuICAgICAgICAgICAgY29uc3QgbGVmdE9mTGVmdEN1cmx5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ1ZmZlciwgaSwgbGVmdElkeCAtIGkpXG4gICAgICAgICAgICBpZiAobGVmdE9mTGVmdEN1cmx5LmluZGV4T2YoTElORV9GRUVEKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgaSA9IGxlZnRJZHggKyAxXG4gICAgICAgICAgICAgIHRoaXMuX2xlbmd0aEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KDApXG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzFcbiAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBmaW5kIGVuZCBvZiBjb21tYW5kXG4gICAgICAgICAgY29uc3QgTEZpZHggPSBidWYuaW5kZXhPZihMSU5FX0ZFRUQsIGkpXG4gICAgICAgICAgaWYgKExGaWR4ID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChMRmlkeCA8IGJ1Zi5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2luY29taW5nQnVmZmVyc1t0aGlzLl9pbmNvbWluZ0J1ZmZlcnMubGVuZ3RoIC0gMV0gPSBuZXcgVWludDhBcnJheShidWYuYnVmZmVyLCAwLCBMRmlkeCArIDEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjb21tYW5kTGVuZ3RoID0gdGhpcy5faW5jb21pbmdCdWZmZXJzLnJlZHVjZSgocHJldiwgY3VycikgPT4gcHJldiArIGN1cnIubGVuZ3RoLCAwKSAtIDIgLy8gMiBmb3IgQ1JMRlxuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBVaW50OEFycmF5KGNvbW1hbmRMZW5ndGgpXG4gICAgICAgICAgICBsZXQgaW5kZXggPSAwXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5faW5jb21pbmdCdWZmZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgbGV0IHVpbnQ4QXJyYXkgPSB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMuc2hpZnQoKVxuXG4gICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ0xlbmd0aCA9IGNvbW1hbmRMZW5ndGggLSBpbmRleFxuICAgICAgICAgICAgICBpZiAodWludDhBcnJheS5sZW5ndGggPiByZW1haW5pbmdMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBleGNlc3NMZW5ndGggPSB1aW50OEFycmF5Lmxlbmd0aCAtIHJlbWFpbmluZ0xlbmd0aFxuICAgICAgICAgICAgICAgIHVpbnQ4QXJyYXkgPSB1aW50OEFycmF5LnN1YmFycmF5KDAsIC1leGNlc3NMZW5ndGgpXG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faW5jb21pbmdCdWZmZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2luY29taW5nQnVmZmVycyA9IFtdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbW1hbmQuc2V0KHVpbnQ4QXJyYXksIGluZGV4KVxuICAgICAgICAgICAgICBpbmRleCArPSB1aW50OEFycmF5Lmxlbmd0aFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeWllbGQgY29tbWFuZFxuICAgICAgICAgICAgaWYgKExGaWR4IDwgYnVmLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYnVmLnN1YmFycmF5KExGaWR4ICsgMSkpXG4gICAgICAgICAgICAgIHRoaXMuX2luY29taW5nQnVmZmVycy5wdXNoKGJ1ZilcbiAgICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGNsZWFyIHRoZSB0aW1lb3V0IHdoZW4gYW4gZW50aXJlIGNvbW1hbmQgaGFzIGFycml2ZWRcbiAgICAgICAgICAgICAgLy8gYW5kIG5vdCB3YWl0aW5nIG9uIG1vcmUgZGF0YSBmb3IgbmV4dCBjb21tYW5kXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIpXG4gICAgICAgICAgICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IG51bGxcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBQUklWQVRFIE1FVEhPRFNcblxuICAvKipcbiAgICogUHJvY2Vzc2VzIGEgY29tbWFuZCBmcm9tIHRoZSBxdWV1ZS4gVGhlIGNvbW1hbmQgaXMgcGFyc2VkIGFuZCBmZWVkZWQgdG8gYSBoYW5kbGVyXG4gICAqL1xuICBfcGFyc2VJbmNvbWluZ0NvbW1hbmRzIChjb21tYW5kcykge1xuICAgIGZvciAodmFyIGNvbW1hbmQgb2YgY29tbWFuZHMpIHtcbiAgICAgIHRoaXMuX2NsZWFySWRsZSgpXG5cbiAgICAgIC8qXG4gICAgICAgKiBUaGUgXCIrXCItdGFnZ2VkIHJlc3BvbnNlIGlzIGEgc3BlY2lhbCBjYXNlOlxuICAgICAgICogRWl0aGVyIHRoZSBzZXJ2ZXIgY2FuIGFza3MgZm9yIHRoZSBuZXh0IGNodW5rIG9mIGRhdGEsIGUuZy4gZm9yIHRoZSBBVVRIRU5USUNBVEUgY29tbWFuZC5cbiAgICAgICAqXG4gICAgICAgKiBPciB0aGVyZSB3YXMgYW4gZXJyb3IgaW4gdGhlIFhPQVVUSDIgYXV0aGVudGljYXRpb24sIGZvciB3aGljaCBTQVNMIGluaXRpYWwgY2xpZW50IHJlc3BvbnNlIGV4dGVuc2lvblxuICAgICAgICogZGljdGF0ZXMgdGhlIGNsaWVudCBzZW5kcyBhbiBlbXB0eSBFT0wgcmVzcG9uc2UgdG8gdGhlIGNoYWxsZW5nZSBjb250YWluaW5nIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgICAgICpcbiAgICAgICAqIERldGFpbHMgb24gXCIrXCItdGFnZ2VkIHJlc3BvbnNlOlxuICAgICAgICogICBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzUwMSNzZWN0aW9uLTIuMi4xXG4gICAgICAgKi9cbiAgICAgIC8vXG4gICAgICBpZiAoY29tbWFuZFswXSA9PT0gQVNDSUlfUExVUykge1xuICAgICAgICBpZiAodGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBmZWVkIHRoZSBuZXh0IGNodW5rIG9mIGRhdGFcbiAgICAgICAgICB2YXIgY2h1bmsgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLnNoaWZ0KClcbiAgICAgICAgICBjaHVuayArPSAoIXRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEubGVuZ3RoID8gRU9MIDogJycpIC8vIEVPTCBpZiB0aGVyZSdzIG5vdGhpbmcgbW9yZSB0byBzZW5kXG4gICAgICAgICAgdGhpcy5zZW5kKGNodW5rKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kLmVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lKSB7XG4gICAgICAgICAgdGhpcy5zZW5kKEVPTCkgLy8gWE9BVVRIMiBlbXB0eSByZXNwb25zZSwgZXJyb3Igd2lsbCBiZSByZXBvcnRlZCB3aGVuIHNlcnZlciBjb250aW51ZXMgd2l0aCBOTyByZXNwb25zZVxuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHZhciByZXNwb25zZVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdmFsdWVBc1N0cmluZyA9IHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QgJiYgdGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdC52YWx1ZUFzU3RyaW5nXG4gICAgICAgIHJlc3BvbnNlID0gcGFyc2VyKGNvbW1hbmQsIHsgdmFsdWVBc1N0cmluZyB9KVxuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnUzonLCAoKSA9PiBjb21waWxlcihyZXNwb25zZSwgZmFsc2UsIHRydWUpKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgcGFyc2luZyBpbWFwIGNvbW1hbmQhJywgcmVzcG9uc2UpXG4gICAgICAgIHJldHVybiB0aGlzLl9vbkVycm9yKGUpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3Byb2Nlc3NSZXNwb25zZShyZXNwb25zZSlcbiAgICAgIHRoaXMuX2hhbmRsZVJlc3BvbnNlKHJlc3BvbnNlKVxuXG4gICAgICAvLyBmaXJzdCByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIsIGNvbm5lY3Rpb24gaXMgbm93IHVzYWJsZVxuICAgICAgaWYgKCF0aGlzLl9jb25uZWN0aW9uUmVhZHkpIHtcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvblJlYWR5ID0gdHJ1ZVxuICAgICAgICB0aGlzLm9ucmVhZHkgJiYgdGhpcy5vbnJlYWR5KClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmVlZHMgYSBwYXJzZWQgcmVzcG9uc2Ugb2JqZWN0IHRvIGFuIGFwcHJvcHJpYXRlIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCBjb21tYW5kIG9iamVjdFxuICAgKi9cbiAgX2hhbmRsZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIHZhciBjb21tYW5kID0gcHJvcE9yKCcnLCAnY29tbWFuZCcsIHJlc3BvbnNlKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuXG4gICAgaWYgKCF0aGlzLl9jdXJyZW50Q29tbWFuZCkge1xuICAgICAgLy8gdW5zb2xpY2l0ZWQgdW50YWdnZWQgcmVzcG9uc2VcbiAgICAgIGlmIChyZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkKSB7XG4gICAgICAgIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkW2NvbW1hbmRdKHJlc3BvbnNlKVxuICAgICAgICB0aGlzLl9jYW5TZW5kID0gdHJ1ZVxuICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkICYmIHJlc3BvbnNlLnRhZyA9PT0gJyonICYmIGNvbW1hbmQgaW4gdGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZCkge1xuICAgICAgLy8gZXhwZWN0ZWQgdW50YWdnZWQgcmVzcG9uc2VcbiAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWRbY29tbWFuZF0ucHVzaChyZXNwb25zZSlcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnRhZyA9PT0gJyonICYmIGNvbW1hbmQgaW4gdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWQpIHtcbiAgICAgIC8vIHVuZXhwZWN0ZWQgdW50YWdnZWQgcmVzcG9uc2VcbiAgICAgIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkW2NvbW1hbmRdKHJlc3BvbnNlKVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UudGFnID09PSB0aGlzLl9jdXJyZW50Q29tbWFuZC50YWcpIHtcbiAgICAgIC8vIHRhZ2dlZCByZXNwb25zZVxuICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQgJiYgT2JqZWN0LmtleXModGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZCkubGVuZ3RoKSB7XG4gICAgICAgIHJlc3BvbnNlLnBheWxvYWQgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkXG4gICAgICB9XG4gICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5jYWxsYmFjayhyZXNwb25zZSlcbiAgICAgIHRoaXMuX2NhblNlbmQgPSB0cnVlXG4gICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgY29tbWFuZCBmcm9tIGNsaWVudCBxdWV1ZSB0byB0aGUgc2VydmVyLlxuICAgKi9cbiAgX3NlbmRSZXF1ZXN0ICgpIHtcbiAgICBpZiAoIXRoaXMuX2NsaWVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VudGVySWRsZSgpXG4gICAgfVxuICAgIHRoaXMuX2NsZWFySWRsZSgpXG5cbiAgICAvLyBhbiBvcGVyYXRpb24gd2FzIG1hZGUgaW4gdGhlIHByZWNoZWNrLCBubyBuZWVkIHRvIHJlc3RhcnQgdGhlIHF1ZXVlIG1hbnVhbGx5XG4gICAgdGhpcy5fcmVzdGFydFF1ZXVlID0gZmFsc2VcblxuICAgIHZhciBjb21tYW5kID0gdGhpcy5fY2xpZW50UXVldWVbMF1cbiAgICBpZiAodHlwZW9mIGNvbW1hbmQucHJlY2hlY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIHJlbWVtYmVyIHRoZSBjb250ZXh0XG4gICAgICB2YXIgY29udGV4dCA9IGNvbW1hbmRcbiAgICAgIHZhciBwcmVjaGVjayA9IGNvbnRleHQucHJlY2hlY2tcbiAgICAgIGRlbGV0ZSBjb250ZXh0LnByZWNoZWNrXG5cbiAgICAgIC8vIHdlIG5lZWQgdG8gcmVzdGFydCB0aGUgcXVldWUgaGFuZGxpbmcgaWYgbm8gb3BlcmF0aW9uIHdhcyBtYWRlIGluIHRoZSBwcmVjaGVja1xuICAgICAgdGhpcy5fcmVzdGFydFF1ZXVlID0gdHJ1ZVxuXG4gICAgICAvLyBpbnZva2UgdGhlIHByZWNoZWNrIGNvbW1hbmQgYW5kIHJlc3VtZSBub3JtYWwgb3BlcmF0aW9uIGFmdGVyIHRoZSBwcm9taXNlIHJlc29sdmVzXG4gICAgICBwcmVjaGVjayhjb250ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gd2UncmUgZG9uZSB3aXRoIHRoZSBwcmVjaGVja1xuICAgICAgICBpZiAodGhpcy5fcmVzdGFydFF1ZXVlKSB7XG4gICAgICAgICAgLy8gd2UgbmVlZCB0byByZXN0YXJ0IHRoZSBxdWV1ZSBoYW5kbGluZ1xuICAgICAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0KClcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAvLyBwcmVjaGVjayBmYWlsZWQsIHNvIHdlIHJlbW92ZSB0aGUgaW5pdGlhbCBjb21tYW5kXG4gICAgICAgIC8vIGZyb20gdGhlIHF1ZXVlLCBpbnZva2UgaXRzIGNhbGxiYWNrIGFuZCByZXN1bWUgbm9ybWFsIG9wZXJhdGlvblxuICAgICAgICBsZXQgY21kXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fY2xpZW50UXVldWUuaW5kZXhPZihjb250ZXh0KVxuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIGNtZCA9IHRoaXMuX2NsaWVudFF1ZXVlLnNwbGljZShpbmRleCwgMSlbMF1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY21kICYmIGNtZC5jYWxsYmFjaykge1xuICAgICAgICAgIGNtZC5jYWxsYmFjayhlcnIpXG4gICAgICAgICAgdGhpcy5fY2FuU2VuZCA9IHRydWVcbiAgICAgICAgICB0aGlzLl9wYXJzZUluY29taW5nQ29tbWFuZHModGhpcy5faXRlcmF0ZUluY29taW5nQnVmZmVyKCkpIC8vIENvbnN1bWUgdGhlIHJlc3Qgb2YgdGhlIGluY29taW5nIGJ1ZmZlclxuICAgICAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0KCkgLy8gY29udGludWUgc2VuZGluZ1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fY2FuU2VuZCA9IGZhbHNlXG4gICAgdGhpcy5fY3VycmVudENvbW1hbmQgPSB0aGlzLl9jbGllbnRRdWV1ZS5zaGlmdCgpXG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YSA9IGNvbXBpbGVyKHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QsIHRydWUpXG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQzonLCAoKSA9PiBjb21waWxlcih0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0LCBmYWxzZSwgdHJ1ZSkpIC8vIGV4Y2x1ZGVzIHBhc3N3b3JkcyBldGMuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGNvbXBpbGluZyBpbWFwIGNvbW1hbmQhJywgdGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdClcbiAgICAgIHJldHVybiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignRXJyb3IgY29tcGlsaW5nIGltYXAgY29tbWFuZCEnKSlcbiAgICB9XG5cbiAgICB2YXIgZGF0YSA9IHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEuc2hpZnQoKVxuXG4gICAgdGhpcy5zZW5kKGRhdGEgKyAoIXRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEubGVuZ3RoID8gRU9MIDogJycpKVxuICAgIHJldHVybiB0aGlzLndhaXREcmFpblxuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIG9uaWRsZSwgbm90aW5nIHRvIGRvIGN1cnJlbnRseVxuICAgKi9cbiAgX2VudGVySWRsZSAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lcilcbiAgICB0aGlzLl9pZGxlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+ICh0aGlzLm9uaWRsZSAmJiB0aGlzLm9uaWRsZSgpKSwgdGhpcy50aW1lb3V0RW50ZXJJZGxlKVxuICB9XG5cbiAgLyoqXG4gICAqIENhbmNlbCBpZGxlIHRpbWVyXG4gICAqL1xuICBfY2xlYXJJZGxlICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVyKVxuICAgIHRoaXMuX2lkbGVUaW1lciA9IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgcHJvY2Vzc2VzIGEgcmVzcG9uc2UgaW50byBhbiBlYXNpZXIgdG8gaGFuZGxlIGZvcm1hdC5cbiAgICogQWRkIHVudGFnZ2VkIG51bWJlcmVkIHJlc3BvbnNlcyAoZS5nLiBGRVRDSCkgaW50byBhIG5pY2VseSBmZWFzaWJsZSBmb3JtXG4gICAqIENoZWNrcyBpZiBhIHJlc3BvbnNlIGluY2x1ZGVzIG9wdGlvbmFsIHJlc3BvbnNlIGNvZGVzXG4gICAqIGFuZCBjb3BpZXMgdGhlc2UgaW50byBzZXBhcmF0ZSBwcm9wZXJ0aWVzLiBGb3IgZXhhbXBsZSB0aGVcbiAgICogZm9sbG93aW5nIHJlc3BvbnNlIGluY2x1ZGVzIGEgY2FwYWJpbGl0eSBsaXN0aW5nIGFuZCBhIGh1bWFuXG4gICAqIHJlYWRhYmxlIG1lc3NhZ2U6XG4gICAqXG4gICAqICAgICAqIE9LIFtDQVBBQklMSVRZIElEIE5BTUVTUEFDRV0gQWxsIHJlYWR5XG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGFkZHMgYSAnY2FwYWJpbGl0eScgcHJvcGVydHkgd2l0aCBhbiBhcnJheSB2YWx1ZSBbJ0lEJywgJ05BTUVTUEFDRSddXG4gICAqIHRvIHRoZSByZXNwb25zZSBvYmplY3QuIEFkZGl0aW9uYWxseSAnQWxsIHJlYWR5JyBpcyBhZGRlZCBhcyAnaHVtYW5SZWFkYWJsZScgcHJvcGVydHkuXG4gICAqXG4gICAqIFNlZSBwb3NzaWJsZW0gSU1BUCBSZXNwb25zZSBDb2RlcyBhdCBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNTUzMFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIHJlc3BvbnNlIG9iamVjdFxuICAgKi9cbiAgX3Byb2Nlc3NSZXNwb25zZSAocmVzcG9uc2UpIHtcbiAgICBsZXQgY29tbWFuZCA9IHByb3BPcignJywgJ2NvbW1hbmQnLCByZXNwb25zZSkudG9VcHBlckNhc2UoKS50cmltKClcblxuICAgIC8vIG5vIGF0dHJpYnV0ZXNcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5hdHRyaWJ1dGVzIHx8ICFyZXNwb25zZS5hdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gdW50YWdnZWQgcmVzcG9uc2VzIHcvIHNlcXVlbmNlIG51bWJlcnNcbiAgICBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgL15cXGQrJC8udGVzdChyZXNwb25zZS5jb21tYW5kKSAmJiByZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnR5cGUgPT09ICdBVE9NJykge1xuICAgICAgcmVzcG9uc2UubnIgPSBOdW1iZXIocmVzcG9uc2UuY29tbWFuZClcbiAgICAgIHJlc3BvbnNlLmNvbW1hbmQgPSAocmVzcG9uc2UuYXR0cmlidXRlcy5zaGlmdCgpLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgfVxuXG4gICAgLy8gbm8gb3B0aW9uYWwgcmVzcG9uc2UgY29kZVxuICAgIGlmIChbJ09LJywgJ05PJywgJ0JBRCcsICdCWUUnLCAnUFJFQVVUSCddLmluZGV4T2YoY29tbWFuZCkgPCAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiBsYXN0IGVsZW1lbnQgb2YgdGhlIHJlc3BvbnNlIGlzIFRFWFQgdGhlbiB0aGlzIGlzIGZvciBodW1hbnNcbiAgICBpZiAocmVzcG9uc2UuYXR0cmlidXRlc1tyZXNwb25zZS5hdHRyaWJ1dGVzLmxlbmd0aCAtIDFdLnR5cGUgPT09ICdURVhUJykge1xuICAgICAgcmVzcG9uc2UuaHVtYW5SZWFkYWJsZSA9IHJlc3BvbnNlLmF0dHJpYnV0ZXNbcmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGggLSAxXS52YWx1ZVxuICAgIH1cblxuICAgIC8vIFBhcnNlIGFuZCBmb3JtYXQgQVRPTSB2YWx1ZXNcbiAgICBpZiAocmVzcG9uc2UuYXR0cmlidXRlc1swXS50eXBlID09PSAnQVRPTScgJiYgcmVzcG9uc2UuYXR0cmlidXRlc1swXS5zZWN0aW9uKSB7XG4gICAgICBjb25zdCBvcHRpb24gPSByZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnNlY3Rpb24ubWFwKChrZXkpID0+IHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGtleS5tYXAoKGtleSkgPT4gKGtleS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50cmltKCkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIChrZXkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc3Qga2V5ID0gb3B0aW9uLnNoaWZ0KClcbiAgICAgIHJlc3BvbnNlLmNvZGUgPSBrZXlcblxuICAgICAgaWYgKG9wdGlvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVzcG9uc2Vba2V5LnRvTG93ZXJDYXNlKCldID0gb3B0aW9uWzBdXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIHJlc3BvbnNlW2tleS50b0xvd2VyQ2FzZSgpXSA9IG9wdGlvblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhbiBFcnJvciBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVmFsdWUgdG8gYmUgY2hlY2tlZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufSByZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGlzIGFuIEVycm9yXG4gICAqL1xuICBpc0Vycm9yICh2YWx1ZSkge1xuICAgIHJldHVybiAhIU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkubWF0Y2goL0Vycm9yXFxdJC8pXG4gIH1cblxuICAvLyBDT01QUkVTU0lPTiBSRUxBVEVEIE1FVEhPRFNcblxuICAvKipcbiAgICogU2V0cyB1cCBkZWZsYXRlL2luZmxhdGUgZm9yIHRoZSBJT1xuICAgKi9cbiAgZW5hYmxlQ29tcHJlc3Npb24gKCkge1xuICAgIHRoaXMuX3NvY2tldE9uRGF0YSA9IHRoaXMuc29ja2V0Lm9uZGF0YVxuICAgIHRoaXMuY29tcHJlc3NlZCA9IHRydWVcblxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuV29ya2VyKSB7XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlciA9IG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbQ29tcHJlc3Npb25CbG9iXSkpKVxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBlLmRhdGEubWVzc2FnZVxuICAgICAgICB2YXIgZGF0YSA9IGUuZGF0YS5idWZmZXJcblxuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICAgICAgICBjYXNlIE1FU1NBR0VfSU5GTEFURURfREFUQV9SRUFEWTpcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldE9uRGF0YSh7IGRhdGEgfSlcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICBjYXNlIE1FU1NBR0VfREVGTEFURURfREFUQV9SRUFEWTpcbiAgICAgICAgICAgIHRoaXMud2FpdERyYWluID0gdGhpcy5zb2NrZXQuc2VuZChkYXRhKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5vbmVycm9yID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ0Vycm9yIGhhbmRsaW5nIGNvbXByZXNzaW9uIHdlYiB3b3JrZXI6ICcgKyBlLm1lc3NhZ2UpKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5wb3N0TWVzc2FnZShjcmVhdGVNZXNzYWdlKE1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmZsYXRlZFJlYWR5ID0gKGJ1ZmZlcikgPT4geyB0aGlzLl9zb2NrZXRPbkRhdGEoeyBkYXRhOiBidWZmZXIgfSkgfVxuICAgICAgY29uc3QgZGVmbGF0ZWRSZWFkeSA9IChidWZmZXIpID0+IHsgdGhpcy53YWl0RHJhaW4gPSB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcikgfVxuICAgICAgdGhpcy5fY29tcHJlc3Npb24gPSBuZXcgQ29tcHJlc3Npb24oaW5mbGF0ZWRSZWFkeSwgZGVmbGF0ZWRSZWFkeSlcbiAgICB9XG5cbiAgICAvLyBvdmVycmlkZSBkYXRhIGhhbmRsZXIsIGRlY29tcHJlc3MgaW5jb21pbmcgZGF0YVxuICAgIHRoaXMuc29ja2V0Lm9uZGF0YSA9IChldnQpID0+IHtcbiAgICAgIGlmICghdGhpcy5jb21wcmVzc2VkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fY29tcHJlc3Npb25Xb3JrZXIpIHtcbiAgICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UoY3JlYXRlTWVzc2FnZShNRVNTQUdFX0lORkxBVEUsIGV2dC5kYXRhKSwgW2V2dC5kYXRhXSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbXByZXNzaW9uLmluZmxhdGUoZXZ0LmRhdGEpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVuZG9lcyBhbnkgY2hhbmdlcyByZWxhdGVkIHRvIGNvbXByZXNzaW9uLiBUaGlzIG9ubHkgYmUgY2FsbGVkIHdoZW4gY2xvc2luZyB0aGUgY29ubmVjdGlvblxuICAgKi9cbiAgX2Rpc2FibGVDb21wcmVzc2lvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmNvbXByZXNzZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuY29tcHJlc3NlZCA9IGZhbHNlXG4gICAgdGhpcy5zb2NrZXQub25kYXRhID0gdGhpcy5fc29ja2V0T25EYXRhXG4gICAgdGhpcy5fc29ja2V0T25EYXRhID0gbnVsbFxuXG4gICAgaWYgKHRoaXMuX2NvbXByZXNzaW9uV29ya2VyKSB7XG4gICAgICAvLyB0ZXJtaW5hdGUgdGhlIHdvcmtlclxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIudGVybWluYXRlKClcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPdXRnb2luZyBwYXlsb2FkIG5lZWRzIHRvIGJlIGNvbXByZXNzZWQgYW5kIHNlbnQgdG8gc29ja2V0XG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGJ1ZmZlciBPdXRnb2luZyB1bmNvbXByZXNzZWQgYXJyYXlidWZmZXJcbiAgICovXG4gIF9zZW5kQ29tcHJlc3NlZCAoYnVmZmVyKSB7XG4gICAgLy8gZGVmbGF0ZVxuICAgIGlmICh0aGlzLl9jb21wcmVzc2lvbldvcmtlcikge1xuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UoY3JlYXRlTWVzc2FnZShNRVNTQUdFX0RFRkxBVEUsIGJ1ZmZlciksIFtidWZmZXJdKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbi5kZWZsYXRlKGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgY3JlYXRlTWVzc2FnZSA9IChtZXNzYWdlLCBidWZmZXIpID0+ICh7IG1lc3NhZ2UsIGJ1ZmZlciB9KVxuIl19