'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Imap;

var _ramda = require('ramda');

var _emailjsTcpSocket = require('emailjs-tcp-socket');

var _emailjsTcpSocket2 = _interopRequireDefault(_emailjsTcpSocket);

var _common = require('./common');

var _emailjsImapHandler = require('emailjs-imap-handler');

var _compression = require('./compression');

var _compression2 = _interopRequireDefault(_compression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* babel-plugin-inline-import './compression.worker' */var CompressionWorker = '!function(e){function t(n){if(a[n])return a[n].exports;var i=a[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var a={};t.m=e,t.c=a,t.d=function(e,a,n){t.o(e,a)||Object.defineProperty(e,a,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var a=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(a,"a",a),a},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=4)}([function(e,t,a){"use strict";function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;t.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var a=t.shift();if(a){if("object"!=typeof a)throw new TypeError(a+"must be non-object");for(var i in a)n(a,i)&&(e[i]=a[i])}}return e},t.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var r={arraySet:function(e,t,a,n,i){if(t.subarray&&e.subarray)return void e.set(t.subarray(a,a+n),i);for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){var t,a,n,i,r,s;for(n=0,t=0,a=e.length;t<a;t++)n+=e[t].length;for(s=new Uint8Array(n),i=0,t=0,a=e.length;t<a;t++)r=e[t],s.set(r,i),i+=r.length;return s}},s={arraySet:function(e,t,a,n,i){for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){return[].concat.apply([],e)}};t.setTyped=function(e){e?(t.Buf8=Uint8Array,t.Buf16=Uint16Array,t.Buf32=Int32Array,t.assign(t,r)):(t.Buf8=Array,t.Buf16=Array,t.Buf32=Array,t.assign(t,s))},t.setTyped(i)},function(e,t,a){"use strict";function n(e,t,a,n){for(var i=65535&e|0,r=e>>>16&65535|0,s=0;0!==a;){s=a>2e3?2e3:a,a-=s;do{i=i+t[n++]|0,r=r+i|0}while(--s);i%=65521,r%=65521}return i|r<<16|0}e.exports=n},function(e,t,a){"use strict";function n(e,t,a,n){var r=i,s=n+a;e^=-1;for(var l=n;l<s;l++)e=e>>>8^r[255&(e^t[l])];return-1^e}var i=function(){for(var e,t=[],a=0;a<256;a++){e=a;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[a]=e}return t}();e.exports=n},function(e,t,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},function(e,t,a){"use strict";var n=a(5),i=function(e){return e&&e.__esModule?e:{default:e}}(n),r=function(e,t){return{message:e,buffer:t}},s=function(e){return self.postMessage(r("inflated_ready",e),[e])},l=function(e){return self.postMessage(r("deflated_ready",e),[e])},o=new i.default(s,l);self.onmessage=function(e){var t=e.data.message,a=e.data.buffer;switch(t){case"start":break;case"inflate":o.inflate(a);break;case"deflate":o.deflate(a)}}},function(e,t,a){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var a=this;this.inflatedReady=e,this.deflatedReady=t,this._inflate=s(function(e){return a.inflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))}),this._deflate=r(function(e){return a.deflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))})}function r(e){var t=new o.default,a=(0,h.deflateInit2)(t,u.Z_DEFAULT_COMPRESSION,u.Z_DEFLATED,b,8,u.Z_DEFAULT_STRATEGY);if(a!==u.Z_OK)throw new Error("Problem initializing deflate stream: "+f.default[a]);return function(a){if(void 0===a)return e();t.input=a,t.next_in=0,t.avail_in=t.input.length;var n=void 0,i=void 0,r=void 0,s=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(c),r=t.next_out=0,t.avail_out=c),(n=(0,h.deflate)(t,u.Z_SYNC_FLUSH))!==u.Z_STREAM_END&&n!==u.Z_OK)throw new Error("Deflate problem: "+f.default[n]);0===t.avail_out&&t.next_out>r&&(i=t.output.subarray(r,r=t.next_out),s=e(i))}while((t.avail_in>0||0===t.avail_out)&&n!==u.Z_STREAM_END);return t.next_out>r&&(i=t.output.subarray(r,r=t.next_out),s=e(i)),s}}function s(e){var t=new o.default,a=(0,d.inflateInit2)(t,b);if(a!==u.Z_OK)throw new Error("Problem initializing inflate stream: "+f.default[a]);return function(a){if(void 0===a)return e();var n=void 0;t.input=a,t.next_in=0,t.avail_in=t.input.length;var i=void 0,r=void 0,s=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(c),n=t.next_out=0,t.avail_out=c),(i=(0,d.inflate)(t,u.Z_NO_FLUSH))!==u.Z_STREAM_END&&i!==u.Z_OK)throw new Error("inflate problem: "+f.default[i]);t.next_out&&(0!==t.avail_out&&i!==u.Z_STREAM_END||(r=t.output.subarray(n,n=t.next_out),s=e(r)))}while(t.avail_in>0&&i!==u.Z_STREAM_END);return t.next_out>n&&(r=t.output.subarray(n,n=t.next_out),s=e(r)),s}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var l=a(6),o=n(l),h=a(7),d=a(9),_=a(3),f=n(_),u=a(12),c=16384,b=15;i.prototype.inflate=function(e){this._inflate(new Uint8Array(e))},i.prototype.deflate=function(e){this._deflate(new Uint8Array(e))}},function(e,t,a){"use strict";function n(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}e.exports=n},function(e,t,a){"use strict";function n(e,t){return e.msg=D[t],t}function i(e){return(e<<1)-(e>4?9:0)}function r(e){for(var t=e.length;--t>=0;)e[t]=0}function s(e){var t=e.state,a=t.pending;a>e.avail_out&&(a=e.avail_out),0!==a&&(B.arraySet(e.output,t.pending_buf,t.pending_out,a,e.next_out),e.next_out+=a,t.pending_out+=a,e.total_out+=a,e.avail_out-=a,t.pending-=a,0===t.pending&&(t.pending_out=0))}function l(e,t){O._tr_flush_block(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,s(e.strm)}function o(e,t){e.pending_buf[e.pending++]=t}function h(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function d(e,t,a,n){var i=e.avail_in;return i>n&&(i=n),0===i?0:(e.avail_in-=i,B.arraySet(t,e.input,e.next_in,i,a),1===e.state.wrap?e.adler=T(e.adler,t,i,a):2===e.state.wrap&&(e.adler=N(e.adler,t,i,a)),e.next_in+=i,e.total_in+=i,i)}function _(e,t){var a,n,i=e.max_chain_length,r=e.strstart,s=e.prev_length,l=e.nice_match,o=e.strstart>e.w_size-he?e.strstart-(e.w_size-he):0,h=e.window,d=e.w_mask,_=e.prev,f=e.strstart+oe,u=h[r+s-1],c=h[r+s];e.prev_length>=e.good_match&&(i>>=2),l>e.lookahead&&(l=e.lookahead);do{if(a=t,h[a+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do{}while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&r<f);if(n=oe-(f-r),r=f-oe,n>s){if(e.match_start=t,s=n,n>=l)break;u=h[r+s-1],c=h[r+s]}}}while((t=_[t&d])>o&&0!=--i);return s<=e.lookahead?s:e.lookahead}function f(e){var t,a,n,i,r,s=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=s+(s-he)){B.arraySet(e.window,e.window,s,s,0),e.match_start-=s,e.strstart-=s,e.block_start-=s,a=e.hash_size,t=a;do{n=e.head[--t],e.head[t]=n>=s?n-s:0}while(--a);a=s,t=a;do{n=e.prev[--t],e.prev[t]=n>=s?n-s:0}while(--a);i+=s}if(0===e.strm.avail_in)break;if(a=d(e.strm,e.window,e.strstart+e.lookahead,i),e.lookahead+=a,e.lookahead+e.insert>=le)for(r=e.strstart-e.insert,e.ins_h=e.window[r],e.ins_h=(e.ins_h<<e.hash_shift^e.window[r+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[r+le-1])&e.hash_mask,e.prev[r&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=r,r++,e.insert--,!(e.lookahead+e.insert<le)););}while(e.lookahead<he&&0!==e.strm.avail_in)}function u(e,t){var a=65535;for(a>e.pending_buf_size-5&&(a=e.pending_buf_size-5);;){if(e.lookahead<=1){if(f(e),0===e.lookahead&&t===U)return we;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+a;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,l(e,!1),0===e.strm.avail_out))return we;if(e.strstart-e.block_start>=e.w_size-he&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):(e.strstart>e.block_start&&(l(e,!1),e.strm.avail_out),we)}function c(e,t){for(var a,n;;){if(e.lookahead<he){if(f(e),e.lookahead<he&&t===U)return we;if(0===e.lookahead)break}if(a=0,e.lookahead>=le&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==a&&e.strstart-a<=e.w_size-he&&(e.match_length=_(e,a)),e.match_length>=le)if(n=O._tr_tally(e,e.strstart-e.match_start,e.match_length-le),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=le){e.match_length--;do{e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart}while(0!=--e.match_length);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=e.strstart<le-1?e.strstart:le-1,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function b(e,t){for(var a,n,i;;){if(e.lookahead<he){if(f(e),e.lookahead<he&&t===U)return we;if(0===e.lookahead)break}if(a=0,e.lookahead>=le&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=le-1,0!==a&&e.prev_length<e.max_lazy_match&&e.strstart-a<=e.w_size-he&&(e.match_length=_(e,a),e.match_length<=5&&(e.strategy===G||e.match_length===le&&e.strstart-e.match_start>4096)&&(e.match_length=le-1)),e.prev_length>=le&&e.match_length<=e.prev_length){i=e.strstart+e.lookahead-le,n=O._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-le),e.lookahead-=e.prev_length-1,e.prev_length-=2;do{++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart)}while(0!=--e.prev_length);if(e.match_available=0,e.match_length=le-1,e.strstart++,n&&(l(e,!1),0===e.strm.avail_out))return we}else if(e.match_available){if(n=O._tr_tally(e,0,e.window[e.strstart-1]),n&&l(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return we}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=O._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<le-1?e.strstart:le-1,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function g(e,t){for(var a,n,i,r,s=e.window;;){if(e.lookahead<=oe){if(f(e),e.lookahead<=oe&&t===U)return we;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=le&&e.strstart>0&&(i=e.strstart-1,(n=s[i])===s[++i]&&n===s[++i]&&n===s[++i])){r=e.strstart+oe;do{}while(n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&i<r);e.match_length=oe-(r-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=le?(a=O._tr_tally(e,1,e.match_length-le),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(a=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),a&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function m(e,t){for(var a;;){if(0===e.lookahead&&(f(e),0===e.lookahead)){if(t===U)return we;break}if(e.match_length=0,a=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,a&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function w(e,t,a,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=a,this.max_chain=n,this.func=i}function p(e){e.window_size=2*e.w_size,r(e.head),e.max_lazy_match=R[e.level].max_lazy,e.good_match=R[e.level].good_length,e.nice_match=R[e.level].nice_length,e.max_chain_length=R[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=le-1,e.match_available=0,e.ins_h=0}function v(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=V,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new B.Buf16(2*re),this.dyn_dtree=new B.Buf16(2*(2*ne+1)),this.bl_tree=new B.Buf16(2*(2*ie+1)),r(this.dyn_ltree),r(this.dyn_dtree),r(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new B.Buf16(se+1),this.heap=new B.Buf16(2*ae+1),r(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new B.Buf16(2*ae+1),r(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function k(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=Q,t=e.state,t.pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?_e:ge,e.adler=2===t.wrap?0:1,t.last_flush=U,O._tr_init(t),C):n(e,H)}function x(e){var t=k(e);return t===C&&p(e.state),t}function y(e,t){return e&&e.state?2!==e.state.wrap?H:(e.state.gzhead=t,C):H}function z(e,t,a,i,r,s){if(!e)return H;var l=1;if(t===Y&&(t=6),i<0?(l=0,i=-i):i>15&&(l=2,i-=16),r<1||r>$||a!==V||i<8||i>15||t<0||t>9||s<0||s>q)return n(e,H);8===i&&(i=9);var o=new v;return e.state=o,o.strm=e,o.wrap=l,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=r+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+le-1)/le),o.window=new B.Buf8(2*o.w_size),o.head=new B.Buf16(o.hash_size),o.prev=new B.Buf16(o.w_size),o.lit_bufsize=1<<r+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new B.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=a,x(e)}function E(e,t){return z(e,t,V,ee,te,J)}function A(e,t){var a,l,d,_;if(!e||!e.state||t>M||t<0)return e?n(e,H):H;if(l=e.state,!e.output||!e.input&&0!==e.avail_in||l.status===me&&t!==L)return n(e,0===e.avail_out?j:H);if(l.strm=e,a=l.last_flush,l.last_flush=t,l.status===_e)if(2===l.wrap)e.adler=0,o(l,31),o(l,139),o(l,8),l.gzhead?(o(l,(l.gzhead.text?1:0)+(l.gzhead.hcrc?2:0)+(l.gzhead.extra?4:0)+(l.gzhead.name?8:0)+(l.gzhead.comment?16:0)),o(l,255&l.gzhead.time),o(l,l.gzhead.time>>8&255),o(l,l.gzhead.time>>16&255),o(l,l.gzhead.time>>24&255),o(l,9===l.level?2:l.strategy>=X||l.level<2?4:0),o(l,255&l.gzhead.os),l.gzhead.extra&&l.gzhead.extra.length&&(o(l,255&l.gzhead.extra.length),o(l,l.gzhead.extra.length>>8&255)),l.gzhead.hcrc&&(e.adler=N(e.adler,l.pending_buf,l.pending,0)),l.gzindex=0,l.status=fe):(o(l,0),o(l,0),o(l,0),o(l,0),o(l,0),o(l,9===l.level?2:l.strategy>=X||l.level<2?4:0),o(l,xe),l.status=ge);else{var f=V+(l.w_bits-8<<4)<<8,u=-1;u=l.strategy>=X||l.level<2?0:l.level<6?1:6===l.level?2:3,f|=u<<6,0!==l.strstart&&(f|=de),f+=31-f%31,l.status=ge,h(l,f),0!==l.strstart&&(h(l,e.adler>>>16),h(l,65535&e.adler)),e.adler=1}if(l.status===fe)if(l.gzhead.extra){for(d=l.pending;l.gzindex<(65535&l.gzhead.extra.length)&&(l.pending!==l.pending_buf_size||(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending!==l.pending_buf_size));)o(l,255&l.gzhead.extra[l.gzindex]),l.gzindex++;l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),l.gzindex===l.gzhead.extra.length&&(l.gzindex=0,l.status=ue)}else l.status=ue;if(l.status===ue)if(l.gzhead.name){d=l.pending;do{if(l.pending===l.pending_buf_size&&(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending===l.pending_buf_size)){_=1;break}_=l.gzindex<l.gzhead.name.length?255&l.gzhead.name.charCodeAt(l.gzindex++):0,o(l,_)}while(0!==_);l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),0===_&&(l.gzindex=0,l.status=ce)}else l.status=ce;if(l.status===ce)if(l.gzhead.comment){d=l.pending;do{if(l.pending===l.pending_buf_size&&(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending===l.pending_buf_size)){_=1;break}_=l.gzindex<l.gzhead.comment.length?255&l.gzhead.comment.charCodeAt(l.gzindex++):0,o(l,_)}while(0!==_);l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),0===_&&(l.status=be)}else l.status=be;if(l.status===be&&(l.gzhead.hcrc?(l.pending+2>l.pending_buf_size&&s(e),l.pending+2<=l.pending_buf_size&&(o(l,255&e.adler),o(l,e.adler>>8&255),e.adler=0,l.status=ge)):l.status=ge),0!==l.pending){if(s(e),0===e.avail_out)return l.last_flush=-1,C}else if(0===e.avail_in&&i(t)<=i(a)&&t!==L)return n(e,j);if(l.status===me&&0!==e.avail_in)return n(e,j);if(0!==e.avail_in||0!==l.lookahead||t!==U&&l.status!==me){var c=l.strategy===X?m(l,t):l.strategy===W?g(l,t):R[l.level].func(l,t);if(c!==ve&&c!==ke||(l.status=me),c===we||c===ve)return 0===e.avail_out&&(l.last_flush=-1),C;if(c===pe&&(t===I?O._tr_align(l):t!==M&&(O._tr_stored_block(l,0,0,!1),t===F&&(r(l.head),0===l.lookahead&&(l.strstart=0,l.block_start=0,l.insert=0))),s(e),0===e.avail_out))return l.last_flush=-1,C}return t!==L?C:l.wrap<=0?P:(2===l.wrap?(o(l,255&e.adler),o(l,e.adler>>8&255),o(l,e.adler>>16&255),o(l,e.adler>>24&255),o(l,255&e.total_in),o(l,e.total_in>>8&255),o(l,e.total_in>>16&255),o(l,e.total_in>>24&255)):(h(l,e.adler>>>16),h(l,65535&e.adler)),s(e),l.wrap>0&&(l.wrap=-l.wrap),0!==l.pending?C:P)}function S(e){var t;return e&&e.state?(t=e.state.status)!==_e&&t!==fe&&t!==ue&&t!==ce&&t!==be&&t!==ge&&t!==me?n(e,H):(e.state=null,t===ge?n(e,K):C):H}function Z(e,t){var a,n,i,s,l,o,h,d,_=t.length;if(!e||!e.state)return H;if(a=e.state,2===(s=a.wrap)||1===s&&a.status!==_e||a.lookahead)return H;for(1===s&&(e.adler=T(e.adler,t,_,0)),a.wrap=0,_>=a.w_size&&(0===s&&(r(a.head),a.strstart=0,a.block_start=0,a.insert=0),d=new B.Buf8(a.w_size),B.arraySet(d,t,_-a.w_size,a.w_size,0),t=d,_=a.w_size),l=e.avail_in,o=e.next_in,h=e.input,e.avail_in=_,e.next_in=0,e.input=t,f(a);a.lookahead>=le;){n=a.strstart,i=a.lookahead-(le-1);do{a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+le-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++}while(--i);a.strstart=n,a.lookahead=le-1,f(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=le-1,a.match_available=0,e.next_in=o,e.input=h,e.avail_in=l,a.wrap=s,C}var R,B=a(0),O=a(8),T=a(1),N=a(2),D=a(3),U=0,I=1,F=3,L=4,M=5,C=0,P=1,H=-2,K=-3,j=-5,Y=-1,G=1,X=2,W=3,q=4,J=0,Q=2,V=8,$=9,ee=15,te=8,ae=286,ne=30,ie=19,re=2*ae+1,se=15,le=3,oe=258,he=oe+le+1,de=32,_e=42,fe=69,ue=73,ce=91,be=103,ge=113,me=666,we=1,pe=2,ve=3,ke=4,xe=3;R=[new w(0,0,0,0,u),new w(4,4,8,4,c),new w(4,5,16,8,c),new w(4,6,32,32,c),new w(4,4,16,16,b),new w(8,16,32,32,b),new w(8,16,128,128,b),new w(8,32,128,256,b),new w(32,128,258,1024,b),new w(32,258,258,4096,b)],t.deflateInit=E,t.deflateInit2=z,t.deflateReset=x,t.deflateResetKeep=k,t.deflateSetHeader=y,t.deflate=A,t.deflateEnd=S,t.deflateSetDictionary=Z,t.deflateInfo="pako deflate (from Nodeca project)"},function(e,t,a){"use strict";function n(e){for(var t=e.length;--t>=0;)e[t]=0}function i(e,t,a,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=a,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function r(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function s(e){return e<256?re[e]:re[256+(e>>>7)]}function l(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function o(e,t,a){e.bi_valid>X-a?(e.bi_buf|=t<<e.bi_valid&65535,l(e,e.bi_buf),e.bi_buf=t>>X-e.bi_valid,e.bi_valid+=a-X):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=a)}function h(e,t,a){o(e,a[2*t],a[2*t+1])}function d(e,t){var a=0;do{a|=1&e,e>>>=1,a<<=1}while(--t>0);return a>>>1}function _(e){16===e.bi_valid?(l(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}function f(e,t){var a,n,i,r,s,l,o=t.dyn_tree,h=t.max_code,d=t.stat_desc.static_tree,_=t.stat_desc.has_stree,f=t.stat_desc.extra_bits,u=t.stat_desc.extra_base,c=t.stat_desc.max_length,b=0;for(r=0;r<=G;r++)e.bl_count[r]=0;for(o[2*e.heap[e.heap_max]+1]=0,a=e.heap_max+1;a<Y;a++)n=e.heap[a],r=o[2*o[2*n+1]+1]+1,r>c&&(r=c,b++),o[2*n+1]=r,n>h||(e.bl_count[r]++,s=0,n>=u&&(s=f[n-u]),l=o[2*n],e.opt_len+=l*(r+s),_&&(e.static_len+=l*(d[2*n+1]+s)));if(0!==b){do{for(r=c-1;0===e.bl_count[r];)r--;e.bl_count[r]--,e.bl_count[r+1]+=2,e.bl_count[c]--,b-=2}while(b>0);for(r=c;0!==r;r--)for(n=e.bl_count[r];0!==n;)(i=e.heap[--a])>h||(o[2*i+1]!==r&&(e.opt_len+=(r-o[2*i+1])*o[2*i],o[2*i+1]=r),n--)}}function u(e,t,a){var n,i,r=new Array(G+1),s=0;for(n=1;n<=G;n++)r[n]=s=s+a[n-1]<<1;for(i=0;i<=t;i++){var l=e[2*i+1];0!==l&&(e[2*i]=d(r[l]++,l))}}function c(){var e,t,a,n,r,s=new Array(G+1);for(a=0,n=0;n<C-1;n++)for(le[n]=a,e=0;e<1<<$[n];e++)se[a++]=n;for(se[a-1]=n,r=0,n=0;n<16;n++)for(oe[n]=r,e=0;e<1<<ee[n];e++)re[r++]=n;for(r>>=7;n<K;n++)for(oe[n]=r<<7,e=0;e<1<<ee[n]-7;e++)re[256+r++]=n;for(t=0;t<=G;t++)s[t]=0;for(e=0;e<=143;)ne[2*e+1]=8,e++,s[8]++;for(;e<=255;)ne[2*e+1]=9,e++,s[9]++;for(;e<=279;)ne[2*e+1]=7,e++,s[7]++;for(;e<=287;)ne[2*e+1]=8,e++,s[8]++;for(u(ne,H+1,s),e=0;e<K;e++)ie[2*e+1]=5,ie[2*e]=d(e,5);he=new i(ne,$,P+1,H,G),de=new i(ie,ee,0,K,G),_e=new i(new Array(0),te,0,j,W)}function b(e){var t;for(t=0;t<H;t++)e.dyn_ltree[2*t]=0;for(t=0;t<K;t++)e.dyn_dtree[2*t]=0;for(t=0;t<j;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*q]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function g(e){e.bi_valid>8?l(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function m(e,t,a,n){g(e),n&&(l(e,a),l(e,~a)),T.arraySet(e.pending_buf,e.window,t,a,e.pending),e.pending+=a}function w(e,t,a,n){var i=2*t,r=2*a;return e[i]<e[r]||e[i]===e[r]&&n[t]<=n[a]}function p(e,t,a){for(var n=e.heap[a],i=a<<1;i<=e.heap_len&&(i<e.heap_len&&w(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!w(t,n,e.heap[i],e.depth));)e.heap[a]=e.heap[i],a=i,i<<=1;e.heap[a]=n}function v(e,t,a){var n,i,r,l,d=0;if(0!==e.last_lit)do{n=e.pending_buf[e.d_buf+2*d]<<8|e.pending_buf[e.d_buf+2*d+1],i=e.pending_buf[e.l_buf+d],d++,0===n?h(e,i,t):(r=se[i],h(e,r+P+1,t),l=$[r],0!==l&&(i-=le[r],o(e,i,l)),n--,r=s(n),h(e,r,a),0!==(l=ee[r])&&(n-=oe[r],o(e,n,l)))}while(d<e.last_lit);h(e,q,t)}function k(e,t){var a,n,i,r=t.dyn_tree,s=t.stat_desc.static_tree,l=t.stat_desc.has_stree,o=t.stat_desc.elems,h=-1;for(e.heap_len=0,e.heap_max=Y,a=0;a<o;a++)0!==r[2*a]?(e.heap[++e.heap_len]=h=a,e.depth[a]=0):r[2*a+1]=0;for(;e.heap_len<2;)i=e.heap[++e.heap_len]=h<2?++h:0,r[2*i]=1,e.depth[i]=0,e.opt_len--,l&&(e.static_len-=s[2*i+1]);for(t.max_code=h,a=e.heap_len>>1;a>=1;a--)p(e,r,a);i=o;do{a=e.heap[1],e.heap[1]=e.heap[e.heap_len--],p(e,r,1),n=e.heap[1],e.heap[--e.heap_max]=a,e.heap[--e.heap_max]=n,r[2*i]=r[2*a]+r[2*n],e.depth[i]=(e.depth[a]>=e.depth[n]?e.depth[a]:e.depth[n])+1,r[2*a+1]=r[2*n+1]=i,e.heap[1]=i++,p(e,r,1)}while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],f(e,t),u(r,h,e.bl_count)}function x(e,t,a){var n,i,r=-1,s=t[1],l=0,o=7,h=4;for(0===s&&(o=138,h=3),t[2*(a+1)+1]=65535,n=0;n<=a;n++)i=s,s=t[2*(n+1)+1],++l<o&&i===s||(l<h?e.bl_tree[2*i]+=l:0!==i?(i!==r&&e.bl_tree[2*i]++,e.bl_tree[2*J]++):l<=10?e.bl_tree[2*Q]++:e.bl_tree[2*V]++,l=0,r=i,0===s?(o=138,h=3):i===s?(o=6,h=3):(o=7,h=4))}function y(e,t,a){var n,i,r=-1,s=t[1],l=0,d=7,_=4;for(0===s&&(d=138,_=3),n=0;n<=a;n++)if(i=s,s=t[2*(n+1)+1],!(++l<d&&i===s)){if(l<_)do{h(e,i,e.bl_tree)}while(0!=--l);else 0!==i?(i!==r&&(h(e,i,e.bl_tree),l--),h(e,J,e.bl_tree),o(e,l-3,2)):l<=10?(h(e,Q,e.bl_tree),o(e,l-3,3)):(h(e,V,e.bl_tree),o(e,l-11,7));l=0,r=i,0===s?(d=138,_=3):i===s?(d=6,_=3):(d=7,_=4)}}function z(e){var t;for(x(e,e.dyn_ltree,e.l_desc.max_code),x(e,e.dyn_dtree,e.d_desc.max_code),k(e,e.bl_desc),t=j-1;t>=3&&0===e.bl_tree[2*ae[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}function E(e,t,a,n){var i;for(o(e,t-257,5),o(e,a-1,5),o(e,n-4,4),i=0;i<n;i++)o(e,e.bl_tree[2*ae[i]+1],3);y(e,e.dyn_ltree,t-1),y(e,e.dyn_dtree,a-1)}function A(e){var t,a=4093624447;for(t=0;t<=31;t++,a>>>=1)if(1&a&&0!==e.dyn_ltree[2*t])return D;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return U;for(t=32;t<P;t++)if(0!==e.dyn_ltree[2*t])return U;return D}function S(e){fe||(c(),fe=!0),e.l_desc=new r(e.dyn_ltree,he),e.d_desc=new r(e.dyn_dtree,de),e.bl_desc=new r(e.bl_tree,_e),e.bi_buf=0,e.bi_valid=0,b(e)}function Z(e,t,a,n){o(e,(F<<1)+(n?1:0),3),m(e,t,a,!0)}function R(e){o(e,L<<1,3),h(e,q,ne),_(e)}function B(e,t,a,n){var i,r,s=0;e.level>0?(e.strm.data_type===I&&(e.strm.data_type=A(e)),k(e,e.l_desc),k(e,e.d_desc),s=z(e),i=e.opt_len+3+7>>>3,(r=e.static_len+3+7>>>3)<=i&&(i=r)):i=r=a+5,a+4<=i&&-1!==t?Z(e,t,a,n):e.strategy===N||r===i?(o(e,(L<<1)+(n?1:0),3),v(e,ne,ie)):(o(e,(M<<1)+(n?1:0),3),E(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),v(e,e.dyn_ltree,e.dyn_dtree)),b(e),n&&g(e)}function O(e,t,a){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&a,e.last_lit++,0===t?e.dyn_ltree[2*a]++:(e.matches++,t--,e.dyn_ltree[2*(se[a]+P+1)]++,e.dyn_dtree[2*s(t)]++),e.last_lit===e.lit_bufsize-1}var T=a(0),N=4,D=0,U=1,I=2,F=0,L=1,M=2,C=29,P=256,H=P+1+C,K=30,j=19,Y=2*H+1,G=15,X=16,W=7,q=256,J=16,Q=17,V=18,$=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ee=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],te=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],ae=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],ne=new Array(2*(H+2));n(ne);var ie=new Array(2*K);n(ie);var re=new Array(512);n(re);var se=new Array(256);n(se);var le=new Array(C);n(le);var oe=new Array(K);n(oe);var he,de,_e,fe=!1;t._tr_init=S,t._tr_stored_block=Z,t._tr_flush_block=B,t._tr_tally=O,t._tr_align=R},function(e,t,a){"use strict";function n(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function i(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new w.Buf16(320),this.work=new w.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function r(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=F,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new w.Buf32(be),t.distcode=t.distdyn=new w.Buf32(ge),t.sane=1,t.back=-1,R):T}function s(e){var t;return e&&e.state?(t=e.state,t.wsize=0,t.whave=0,t.wnext=0,r(e)):T}function l(e,t){var a,n;return e&&e.state?(n=e.state,t<0?(a=0,t=-t):(a=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?T:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=a,n.wbits=t,s(e))):T}function o(e,t){var a,n;return e?(n=new i,e.state=n,n.window=null,a=l(e,t),a!==R&&(e.state=null),a):T}function h(e){return o(e,me)}function d(e){if(we){var t;for(g=new w.Buf32(512),m=new w.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(x(z,e.lens,0,288,g,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;x(E,e.lens,0,32,m,0,e.work,{bits:5}),we=!1}e.lencode=g,e.lenbits=9,e.distcode=m,e.distbits=5}function _(e,t,a,n){var i,r=e.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new w.Buf8(r.wsize)),n>=r.wsize?(w.arraySet(r.window,t,a-r.wsize,r.wsize,0),r.wnext=0,r.whave=r.wsize):(i=r.wsize-r.wnext,i>n&&(i=n),w.arraySet(r.window,t,a-n,i,r.wnext),n-=i,n?(w.arraySet(r.window,t,a-n,n,0),r.wnext=n,r.whave=r.wsize):(r.wnext+=i,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=i))),0}function f(e,t){var a,i,r,s,l,o,h,f,u,c,b,g,m,be,ge,me,we,pe,ve,ke,xe,ye,ze,Ee,Ae=0,Se=new w.Buf8(4),Ze=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return T;a=e.state,a.mode===W&&(a.mode=q),l=e.next_out,r=e.output,h=e.avail_out,s=e.next_in,i=e.input,o=e.avail_in,f=a.hold,u=a.bits,c=o,b=h,ye=R;e:for(;;)switch(a.mode){case F:if(0===a.wrap){a.mode=q;break}for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(2&a.wrap&&35615===f){a.check=0,Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0),f=0,u=0,a.mode=L;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&f)<<8)+(f>>8))%31){e.msg="incorrect header check",a.mode=fe;break}if((15&f)!==I){e.msg="unknown compression method",a.mode=fe;break}if(f>>>=4,u-=4,xe=8+(15&f),0===a.wbits)a.wbits=xe;else if(xe>a.wbits){e.msg="invalid window size",a.mode=fe;break}a.dmax=1<<xe,e.adler=a.check=1,a.mode=512&f?G:W,f=0,u=0;break;case L:for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(a.flags=f,(255&a.flags)!==I){e.msg="unknown compression method",a.mode=fe;break}if(57344&a.flags){e.msg="unknown header flags set",a.mode=fe;break}a.head&&(a.head.text=f>>8&1),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0,a.mode=M;case M:for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.head&&(a.head.time=f),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,Se[2]=f>>>16&255,Se[3]=f>>>24&255,a.check=v(a.check,Se,4,0)),f=0,u=0,a.mode=C;case C:for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.head&&(a.head.xflags=255&f,a.head.os=f>>8),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0,a.mode=P;case P:if(1024&a.flags){for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.length=f,a.head&&(a.head.extra_len=f),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0}else a.head&&(a.head.extra=null);a.mode=H;case H:if(1024&a.flags&&(g=a.length,g>o&&(g=o),g&&(a.head&&(xe=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),w.arraySet(a.head.extra,i,s,g,xe)),512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,a.length-=g),a.length))break e;a.length=0,a.mode=K;case K:if(2048&a.flags){if(0===o)break e;g=0;do{xe=i[s+g++],a.head&&xe&&a.length<65536&&(a.head.name+=String.fromCharCode(xe))}while(xe&&g<o);if(512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,xe)break e}else a.head&&(a.head.name=null);a.length=0,a.mode=j;case j:if(4096&a.flags){if(0===o)break e;g=0;do{xe=i[s+g++],a.head&&xe&&a.length<65536&&(a.head.comment+=String.fromCharCode(xe))}while(xe&&g<o);if(512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,xe)break e}else a.head&&(a.head.comment=null);a.mode=Y;case Y:if(512&a.flags){for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f!==(65535&a.check)){e.msg="header crc mismatch",a.mode=fe;break}f=0,u=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),e.adler=a.check=0,a.mode=W;break;case G:for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}e.adler=a.check=n(f),f=0,u=0,a.mode=X;case X:if(0===a.havedict)return e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,O;e.adler=a.check=1,a.mode=W;case W:if(t===S||t===Z)break e;case q:if(a.last){f>>>=7&u,u-=7&u,a.mode=he;break}for(;u<3;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}switch(a.last=1&f,f>>>=1,u-=1,3&f){case 0:a.mode=J;break;case 1:if(d(a),a.mode=ae,t===Z){f>>>=2,u-=2;break e}break;case 2:a.mode=$;break;case 3:e.msg="invalid block type",a.mode=fe}f>>>=2,u-=2;break;case J:for(f>>>=7&u,u-=7&u;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if((65535&f)!=(f>>>16^65535)){e.msg="invalid stored block lengths",a.mode=fe;break}if(a.length=65535&f,f=0,u=0,a.mode=Q,t===Z)break e;case Q:a.mode=V;case V:if(g=a.length){if(g>o&&(g=o),g>h&&(g=h),0===g)break e;w.arraySet(r,i,s,g,l),o-=g,s+=g,h-=g,l+=g,a.length-=g;break}a.mode=W;break;case $:for(;u<14;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(a.nlen=257+(31&f),f>>>=5,u-=5,a.ndist=1+(31&f),f>>>=5,u-=5,a.ncode=4+(15&f),f>>>=4,u-=4,a.nlen>286||a.ndist>30){e.msg="too many length or distance symbols",a.mode=fe;break}a.have=0,a.mode=ee;case ee:for(;a.have<a.ncode;){for(;u<3;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.lens[Ze[a.have++]]=7&f,f>>>=3,u-=3}for(;a.have<19;)a.lens[Ze[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,ze={bits:a.lenbits},ye=x(y,a.lens,0,19,a.lencode,0,a.work,ze),a.lenbits=ze.bits,ye){e.msg="invalid code lengths set",a.mode=fe;break}a.have=0,a.mode=te;case te:for(;a.have<a.nlen+a.ndist;){for(;Ae=a.lencode[f&(1<<a.lenbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(we<16)f>>>=ge,u-=ge,a.lens[a.have++]=we;else{if(16===we){for(Ee=ge+2;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f>>>=ge,u-=ge,0===a.have){e.msg="invalid bit length repeat",a.mode=fe;break}xe=a.lens[a.have-1],g=3+(3&f),f>>>=2,u-=2}else if(17===we){for(Ee=ge+3;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=ge,u-=ge,xe=0,g=3+(7&f),f>>>=3,u-=3}else{for(Ee=ge+7;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=ge,u-=ge,xe=0,g=11+(127&f),f>>>=7,u-=7}if(a.have+g>a.nlen+a.ndist){e.msg="invalid bit length repeat",a.mode=fe;break}for(;g--;)a.lens[a.have++]=xe}}if(a.mode===fe)break;if(0===a.lens[256]){e.msg="invalid code -- missing end-of-block",a.mode=fe;break}if(a.lenbits=9,ze={bits:a.lenbits},ye=x(z,a.lens,0,a.nlen,a.lencode,0,a.work,ze),a.lenbits=ze.bits,ye){e.msg="invalid literal/lengths set",a.mode=fe;break}if(a.distbits=6,a.distcode=a.distdyn,ze={bits:a.distbits},ye=x(E,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,ze),a.distbits=ze.bits,ye){e.msg="invalid distances set",a.mode=fe;break}if(a.mode=ae,t===Z)break e;case ae:a.mode=ne;case ne:if(o>=6&&h>=258){e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,k(e,b),l=e.next_out,r=e.output,h=e.avail_out,s=e.next_in,i=e.input,o=e.avail_in,f=a.hold,u=a.bits,a.mode===W&&(a.back=-1);break}for(a.back=0;Ae=a.lencode[f&(1<<a.lenbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(me&&0==(240&me)){for(pe=ge,ve=me,ke=we;Ae=a.lencode[ke+((f&(1<<pe+ve)-1)>>pe)],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(pe+ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=pe,u-=pe,a.back+=pe}if(f>>>=ge,u-=ge,a.back+=ge,a.length=we,0===me){a.mode=oe;break}if(32&me){a.back=-1,a.mode=W;break}if(64&me){e.msg="invalid literal/length code",a.mode=fe;break}a.extra=15&me,a.mode=ie;case ie:if(a.extra){for(Ee=a.extra;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.length+=f&(1<<a.extra)-1,f>>>=a.extra,u-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=re;case re:for(;Ae=a.distcode[f&(1<<a.distbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(0==(240&me)){for(pe=ge,ve=me,ke=we;Ae=a.distcode[ke+((f&(1<<pe+ve)-1)>>pe)],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(pe+ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=pe,u-=pe,a.back+=pe}if(f>>>=ge,u-=ge,a.back+=ge,64&me){e.msg="invalid distance code",a.mode=fe;break}a.offset=we,a.extra=15&me,a.mode=se;case se:if(a.extra){for(Ee=a.extra;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.offset+=f&(1<<a.extra)-1,f>>>=a.extra,u-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){e.msg="invalid distance too far back",a.mode=fe;break}a.mode=le;case le:if(0===h)break e;if(g=b-h,a.offset>g){if((g=a.offset-g)>a.whave&&a.sane){e.msg="invalid distance too far back",a.mode=fe;break}g>a.wnext?(g-=a.wnext,m=a.wsize-g):m=a.wnext-g,g>a.length&&(g=a.length),be=a.window}else be=r,m=l-a.offset,g=a.length;g>h&&(g=h),h-=g,a.length-=g;do{r[l++]=be[m++]}while(--g);0===a.length&&(a.mode=ne);break;case oe:if(0===h)break e;r[l++]=a.length,h--,a.mode=ne;break;case he:if(a.wrap){for(;u<32;){if(0===o)break e;o--,f|=i[s++]<<u,u+=8}if(b-=h,e.total_out+=b,a.total+=b,b&&(e.adler=a.check=a.flags?v(a.check,r,b,l-b):p(a.check,r,b,l-b)),b=h,(a.flags?f:n(f))!==a.check){e.msg="incorrect data check",a.mode=fe;break}f=0,u=0}a.mode=de;case de:if(a.wrap&&a.flags){for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f!==(4294967295&a.total)){e.msg="incorrect length check",a.mode=fe;break}f=0,u=0}a.mode=_e;case _e:ye=B;break e;case fe:ye=N;break e;case ue:return D;case ce:default:return T}return e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,(a.wsize||b!==e.avail_out&&a.mode<fe&&(a.mode<he||t!==A))&&_(e,e.output,e.next_out,b-e.avail_out)?(a.mode=ue,D):(c-=e.avail_in,b-=e.avail_out,e.total_in+=c,e.total_out+=b,a.total+=b,a.wrap&&b&&(e.adler=a.check=a.flags?v(a.check,r,b,e.next_out-b):p(a.check,r,b,e.next_out-b)),e.data_type=a.bits+(a.last?64:0)+(a.mode===W?128:0)+(a.mode===ae||a.mode===Q?256:0),(0===c&&0===b||t===A)&&ye===R&&(ye=U),ye)}function u(e){if(!e||!e.state)return T;var t=e.state;return t.window&&(t.window=null),e.state=null,R}function c(e,t){var a;return e&&e.state?(a=e.state,0==(2&a.wrap)?T:(a.head=t,t.done=!1,R)):T}function b(e,t){var a,n,i=t.length;return e&&e.state?(a=e.state,0!==a.wrap&&a.mode!==X?T:a.mode===X&&(n=1,(n=p(n,t,i,0))!==a.check)?N:_(e,t,i,i)?(a.mode=ue,D):(a.havedict=1,R)):T}var g,m,w=a(0),p=a(1),v=a(2),k=a(10),x=a(11),y=0,z=1,E=2,A=4,S=5,Z=6,R=0,B=1,O=2,T=-2,N=-3,D=-4,U=-5,I=8,F=1,L=2,M=3,C=4,P=5,H=6,K=7,j=8,Y=9,G=10,X=11,W=12,q=13,J=14,Q=15,V=16,$=17,ee=18,te=19,ae=20,ne=21,ie=22,re=23,se=24,le=25,oe=26,he=27,de=28,_e=29,fe=30,ue=31,ce=32,be=852,ge=592,me=15,we=!0;t.inflateReset=s,t.inflateReset2=l,t.inflateResetKeep=r,t.inflateInit=h,t.inflateInit2=o,t.inflate=f,t.inflateEnd=u,t.inflateGetHeader=c,t.inflateSetDictionary=b,t.inflateInfo="pako inflate (from Nodeca project)"},function(e,t,a){"use strict";e.exports=function(e,t){var a,n,i,r,s,l,o,h,d,_,f,u,c,b,g,m,w,p,v,k,x,y,z,E,A;a=e.state,n=e.next_in,E=e.input,i=n+(e.avail_in-5),r=e.next_out,A=e.output,s=r-(t-e.avail_out),l=r+(e.avail_out-257),o=a.dmax,h=a.wsize,d=a.whave,_=a.wnext,f=a.window,u=a.hold,c=a.bits,b=a.lencode,g=a.distcode,m=(1<<a.lenbits)-1,w=(1<<a.distbits)-1;e:do{c<15&&(u+=E[n++]<<c,c+=8,u+=E[n++]<<c,c+=8),p=b[u&m];t:for(;;){if(v=p>>>24,u>>>=v,c-=v,0===(v=p>>>16&255))A[r++]=65535&p;else{if(!(16&v)){if(0==(64&v)){p=b[(65535&p)+(u&(1<<v)-1)];continue t}if(32&v){a.mode=12;break e}e.msg="invalid literal/length code",a.mode=30;break e}k=65535&p,v&=15,v&&(c<v&&(u+=E[n++]<<c,c+=8),k+=u&(1<<v)-1,u>>>=v,c-=v),c<15&&(u+=E[n++]<<c,c+=8,u+=E[n++]<<c,c+=8),p=g[u&w];a:for(;;){if(v=p>>>24,u>>>=v,c-=v,!(16&(v=p>>>16&255))){if(0==(64&v)){p=g[(65535&p)+(u&(1<<v)-1)];continue a}e.msg="invalid distance code",a.mode=30;break e}if(x=65535&p,v&=15,c<v&&(u+=E[n++]<<c,(c+=8)<v&&(u+=E[n++]<<c,c+=8)),(x+=u&(1<<v)-1)>o){e.msg="invalid distance too far back",a.mode=30;break e}if(u>>>=v,c-=v,v=r-s,x>v){if((v=x-v)>d&&a.sane){e.msg="invalid distance too far back",a.mode=30;break e}if(y=0,z=f,0===_){if(y+=h-v,v<k){k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}}else if(_<v){if(y+=h+_-v,(v-=_)<k){k-=v;do{A[r++]=f[y++]}while(--v);if(y=0,_<k){v=_,k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}}}else if(y+=_-v,v<k){k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}for(;k>2;)A[r++]=z[y++],A[r++]=z[y++],A[r++]=z[y++],k-=3;k&&(A[r++]=z[y++],k>1&&(A[r++]=z[y++]))}else{y=r-x;do{A[r++]=A[y++],A[r++]=A[y++],A[r++]=A[y++],k-=3}while(k>2);k&&(A[r++]=A[y++],k>1&&(A[r++]=A[y++]))}break}}break}}while(n<i&&r<l);k=c>>3,n-=k,c-=k<<3,u&=(1<<c)-1,e.next_in=n,e.next_out=r,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=r<l?l-r+257:257-(r-l),a.hold=u,a.bits=c}},function(e,t,a){"use strict";var n=a(0),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],r=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],l=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(e,t,a,o,h,d,_,f){var u,c,b,g,m,w,p,v,k,x=f.bits,y=0,z=0,E=0,A=0,S=0,Z=0,R=0,B=0,O=0,T=0,N=null,D=0,U=new n.Buf16(16),I=new n.Buf16(16),F=null,L=0;for(y=0;y<=15;y++)U[y]=0;for(z=0;z<o;z++)U[t[a+z]]++;for(S=x,A=15;A>=1&&0===U[A];A--);if(S>A&&(S=A),0===A)return h[d++]=20971520,h[d++]=20971520,f.bits=1,0;for(E=1;E<A&&0===U[E];E++);for(S<E&&(S=E),B=1,y=1;y<=15;y++)if(B<<=1,(B-=U[y])<0)return-1;if(B>0&&(0===e||1!==A))return-1;for(I[1]=0,y=1;y<15;y++)I[y+1]=I[y]+U[y];for(z=0;z<o;z++)0!==t[a+z]&&(_[I[t[a+z]]++]=z);if(0===e?(N=F=_,w=19):1===e?(N=i,D-=257,F=r,L-=257,w=256):(N=s,F=l,w=-1),T=0,z=0,y=E,m=d,Z=S,R=0,b=-1,O=1<<S,g=O-1,1===e&&O>852||2===e&&O>592)return 1;for(;;){p=y-R,_[z]<w?(v=0,k=_[z]):_[z]>w?(v=F[L+_[z]],k=N[D+_[z]]):(v=96,k=0),u=1<<y-R,c=1<<Z,E=c;do{c-=u,h[m+(T>>R)+c]=p<<24|v<<16|k|0}while(0!==c);for(u=1<<y-1;T&u;)u>>=1;if(0!==u?(T&=u-1,T+=u):T=0,z++,0==--U[y]){if(y===A)break;y=t[a+_[z]]}if(y>S&&(T&g)!==b){for(0===R&&(R=S),m+=E,Z=y-R,B=1<<Z;Z+R<A&&!((B-=U[Z+R])<=0);)Z++,B<<=1;if(O+=1<<Z,1===e&&O>852||2===e&&O>592)return 1;b=T&g,h[b]=S<<24|Z<<16|m-d|0}}return 0!==T&&(h[m+T]=y-R<<24|64<<16|0),f.bits=S,0}},function(e,t,a){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}}]);';

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
function Imap(host, port, options) {
  this.options = options || {};

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
  this._workerPath = this.options.compressionWorkerPath; // The path for the compressor's worker script

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

// Constants

/**
 * How much time to wait since the last response until the connection is considered idling
 */
Imap.prototype.TIMEOUT_ENTER_IDLE = 1000;

/**
 * Lower Bound for socket timeout to wait since the last data was written to a socket
 */
Imap.prototype.TIMEOUT_SOCKET_LOWER_BOUND = 10000;

/**
 * Multiplier for socket timeout:
 *
 * We assume at least a GPRS connection with 115 kb/s = 14,375 kB/s tops, so 10 KB/s to be on
 * the safe side. We can timeout after a lower bound of 10s + (n KB / 10 KB/s). A 1 MB message
 * upload would be 110 seconds to wait for the timeout. 10 KB/s === 0.1 s/B
 */
Imap.prototype.TIMEOUT_SOCKET_MULTIPLIER = 0.1;

/**
 * Timeout used in _onData, max packet size is 4096 bytes.
 */
Imap.prototype.ON_DATA_TIMEOUT = Imap.prototype.TIMEOUT_SOCKET_LOWER_BOUND + Math.floor(4096 * Imap.prototype.TIMEOUT_SOCKET_MULTIPLIER);

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
Imap.prototype.connect = function (Socket) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    _this.socket = (Socket || _emailjsTcpSocket2.default).open(_this.host, _this.port, {
      binaryType: 'arraybuffer',
      useSecureTransport: _this.secureMode,
      ca: _this.options.ca,
      tlsWorkerPath: _this.options.tlsWorkerPath
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
};

/**
 * Closes the connection to the server
 *
 * @returns {Promise} Resolves when the socket is closed
 */
Imap.prototype.close = function (error) {
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
};

/**
 * Send LOGOUT to the server.
 *
 * Use is discouraged!
 *
 * @returns {Promise} Resolves when connection is closed by server.
 */
Imap.prototype.logout = function () {
  var _this3 = this;

  return new Promise(function (resolve, reject) {
    _this3.socket.onclose = _this3.socket.onerror = function () {
      _this3.close('Client logging out').then(resolve).catch(reject);
    };

    _this3.enqueueCommand('LOGOUT');
  });
};

/**
 * Initiates TLS handshake
 */
Imap.prototype.upgrade = function () {
  this.secureMode = true;
  this.socket.upgradeToSecure();
};

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
Imap.prototype.enqueueCommand = function (request, acceptUntagged, options) {
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
        } else if (['NO', 'BAD'].indexOf((0, _ramda.propOr)('', 'command')(response).toUpperCase().trim()) >= 0) {
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
};

/**
 *
 * @param commands
 * @param ctx
 * @returns {*}
 */
Imap.prototype.getPreviouslyQueued = function (commands, ctx) {
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
};

/**
 * Send data to the TCP socket
 * Arms a timeout waiting for a response from the server.
 *
 * @param {String} str Payload
 */
Imap.prototype.send = function (str) {
  var _this5 = this;

  var buffer = (0, _common.toTypedArray)(str).buffer;
  var timeout = this.TIMEOUT_SOCKET_LOWER_BOUND + Math.floor(buffer.byteLength * this.TIMEOUT_SOCKET_MULTIPLIER);

  clearTimeout(this._socketTimeoutTimer); // clear pending timeouts
  this._socketTimeoutTimer = setTimeout(function () {
    return _this5._onError(new Error(_this5.options.sessionId + ' Socket timed out!'));
  }, timeout); // arm the next timeout

  if (this.compressed) {
    this._sendCompressed(buffer);
  } else {
    this.socket.send(buffer);
  }
};

/**
 * Set a global handler for an untagged response. If currently processed command
 * has not listed untagged command it is forwarded to the global handler. Useful
 * with EXPUNGE, EXISTS etc.
 *
 * @param {String} command Untagged command name
 * @param {Function} callback Callback function with response object and continue callback function
 */
Imap.prototype.setHandler = function (command, callback) {
  this._globalAcceptUntagged[command.toUpperCase().trim()] = callback;
};

// INTERNAL EVENTS

/**
 * Error handler for the socket
 *
 * @event
 * @param {Event} evt Event object. See evt.data for the error
 */
Imap.prototype._onError = function (evt) {
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
};

/**
 * Handler for incoming data from the server. The data is sent in arbitrary
 * chunks and can't be used directly so this function makes sure the data
 * is split into complete lines before the data is passed to the command
 * handler
 *
 * @param {Event} evt
 */
Imap.prototype._onData = function (evt) {
  var _this7 = this;

  clearTimeout(this._socketTimeoutTimer); // reset the timeout on each data packet
  this._socketTimeoutTimer = setTimeout(function () {
    return _this7._onError(new Error(_this7.options.sessionId + ' Socket timed out!'));
  }, this.ON_DATA_TIMEOUT);

  this._incomingBuffers.push(new Uint8Array(evt.data)); // append to the incoming buffer
  this._parseIncomingCommands(this._iterateIncomingBuffer()); // Consume the incoming buffer
};

Imap.prototype._iterateIncomingBuffer = /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var buf, i, diff, start, latest, prevBuf, leftIdx, leftOfLeftCurly, LFidx, commandLength, command, index, uint8Array, remainingLength, excessLength;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          buf = this._incomingBuffers[this._incomingBuffers.length - 1];
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
  }, _callee, this);
});

// PRIVATE METHODS

/**
 * Processes a command from the queue. The command is parsed and feeded to a handler
 */
Imap.prototype._parseIncomingCommands = function (commands) {
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
};

/**
 * Feeds a parsed response object to an appropriate handler
 *
 * @param {Object} response Parsed command object
 */
Imap.prototype._handleResponse = function (response) {
  var command = (0, _ramda.propOr)('', 'command')(response).toUpperCase().trim();

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
};

/**
 * Sends a command from client queue to the server.
 */
Imap.prototype._sendRequest = function () {
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
};

/**
 * Emits onidle, noting to do currently
 */
Imap.prototype._enterIdle = function () {
  var _this9 = this;

  clearTimeout(this._idleTimer);
  this._idleTimer = setTimeout(function () {
    return _this9.onidle && _this9.onidle();
  }, this.TIMEOUT_ENTER_IDLE);
};

/**
 * Cancel idle timer
 */
Imap.prototype._clearIdle = function () {
  clearTimeout(this._idleTimer);
  this._idleTimer = null;
};

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
Imap.prototype._processResponse = function (response) {
  var command = (0, _ramda.propOr)('', 'command')(response).toUpperCase().trim();
  var option = void 0;
  var key = void 0;

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
    option = response.attributes[0].section.map(function (key) {
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

    key = option.shift();
    response.code = key;

    if (option.length === 1) {
      response[key.toLowerCase()] = option[0];
    } else if (option.length > 1) {
      response[key.toLowerCase()] = option;
    }
  }
};

/**
 * Checks if a value is an Error object
 *
 * @param {Mixed} value Value to be checked
 * @return {Boolean} returns true if the value is an Error
 */
Imap.prototype.isError = function (value) {
  return !!Object.prototype.toString.call(value).match(/Error\]$/);
};

// COMPRESSION RELATED METHODS

/**
 * Sets up deflate/inflate for the IO
 */
Imap.prototype.enableCompression = function () {
  var _this10 = this;

  this._socketOnData = this.socket.ondata;
  this.compressed = true;

  if (typeof window !== 'undefined' && window.Worker && typeof this._workerPath === 'string') {
    //
    // web worker support
    //

    this._compressionWorker = new Worker(URL.createObjectURL(new Blob([CompressionWorker])));
    this._compressionWorker.onmessage = function (e) {
      var message = e.data.message;
      var buffer = e.data.buffer;

      switch (message) {
        case MESSAGE_INFLATED_DATA_READY:
          _this10._socketOnData({
            data: buffer
          });
          break;

        case MESSAGE_DEFLATED_DATA_READY:
          _this10.waitDrain = _this10.socket.send(buffer);
          break;
      }
    };

    this._compressionWorker.onerror = function (e) {
      _this10._onError(new Error('Error handling compression web worker: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message));
    };

    // first message starts the worker
    this._compressionWorker.postMessage(this._createMessage(MESSAGE_INITIALIZE_WORKER));
  } else {
    //
    // without web worker support
    //

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

    // inflate
    if (_this10._compressionWorker) {
      _this10._compressionWorker.postMessage(_this10._createMessage(MESSAGE_INFLATE, evt.data), [evt.data]);
    } else {
      _this10._compression.inflate(evt.data);
    }
  };
};

/**
 * Undoes any changes related to compression. This only be called when closing the connection
 */
Imap.prototype._disableCompression = function () {
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
};

/**
 * Outgoing payload needs to be compressed and sent to socket
 *
 * @param {ArrayBuffer} buffer Outgoing uncompressed arraybuffer
 */
Imap.prototype._sendCompressed = function (buffer) {
  // deflate
  if (this._compressionWorker) {
    this._compressionWorker.postMessage(this._createMessage(MESSAGE_DEFLATE, buffer), [buffer]);
  } else {
    this._compression.deflate(buffer);
  }
};

Imap.prototype._createMessage = function (message, buffer) {
  return {
    message: message,
    buffer: buffer
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLmpzIl0sIm5hbWVzIjpbIkltYXAiLCJNRVNTQUdFX0lOSVRJQUxJWkVfV09SS0VSIiwiTUVTU0FHRV9JTkZMQVRFIiwiTUVTU0FHRV9JTkZMQVRFRF9EQVRBX1JFQURZIiwiTUVTU0FHRV9ERUZMQVRFIiwiTUVTU0FHRV9ERUZMQVRFRF9EQVRBX1JFQURZIiwiRU9MIiwiTElORV9GRUVEIiwiQ0FSUklBR0VfUkVUVVJOIiwiTEVGVF9DVVJMWV9CUkFDS0VUIiwiUklHSFRfQ1VSTFlfQlJBQ0tFVCIsIkFTQ0lJX1BMVVMiLCJCVUZGRVJfU1RBVEVfTElURVJBTCIsIkJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xIiwiQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzIiLCJCVUZGRVJfU1RBVEVfREVGQVVMVCIsImhvc3QiLCJwb3J0Iiwib3B0aW9ucyIsInVzZVNlY3VyZVRyYW5zcG9ydCIsInNlY3VyZU1vZGUiLCJfY29ubmVjdGlvblJlYWR5IiwiX2dsb2JhbEFjY2VwdFVudGFnZ2VkIiwiX2NsaWVudFF1ZXVlIiwiX2NhblNlbmQiLCJfdGFnQ291bnRlciIsIl9jdXJyZW50Q29tbWFuZCIsIl9pZGxlVGltZXIiLCJfc29ja2V0VGltZW91dFRpbWVyIiwiY29tcHJlc3NlZCIsIl93b3JrZXJQYXRoIiwiY29tcHJlc3Npb25Xb3JrZXJQYXRoIiwiX2luY29taW5nQnVmZmVycyIsIl9idWZmZXJTdGF0ZSIsIl9saXRlcmFsUmVtYWluaW5nIiwib25jZXJ0Iiwib25lcnJvciIsIm9ucmVhZHkiLCJvbmlkbGUiLCJwcm90b3R5cGUiLCJUSU1FT1VUX0VOVEVSX0lETEUiLCJUSU1FT1VUX1NPQ0tFVF9MT1dFUl9CT1VORCIsIlRJTUVPVVRfU09DS0VUX01VTFRJUExJRVIiLCJPTl9EQVRBX1RJTUVPVVQiLCJNYXRoIiwiZmxvb3IiLCJjb25uZWN0IiwiU29ja2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzb2NrZXQiLCJvcGVuIiwiYmluYXJ5VHlwZSIsImNhIiwidGxzV29ya2VyUGF0aCIsImNlcnQiLCJFIiwib25jbG9zZSIsIl9vbkVycm9yIiwiRXJyb3IiLCJvbmRhdGEiLCJldnQiLCJfb25EYXRhIiwiZXJyIiwiZSIsImRhdGEiLCJtZXNzYWdlIiwib25vcGVuIiwiY2xvc2UiLCJlcnJvciIsInRlYXJEb3duIiwiZm9yRWFjaCIsImNtZCIsImNhbGxiYWNrIiwiY2xlYXJUaW1lb3V0IiwiX2Rpc2FibGVDb21wcmVzc2lvbiIsInJlYWR5U3RhdGUiLCJsb2dvdXQiLCJ0aGVuIiwiY2F0Y2giLCJlbnF1ZXVlQ29tbWFuZCIsInVwZ3JhZGUiLCJ1cGdyYWRlVG9TZWN1cmUiLCJyZXF1ZXN0IiwiYWNjZXB0VW50YWdnZWQiLCJjb21tYW5kIiwiY29uY2F0IiwibWFwIiwidW50YWdnZWQiLCJ0b1N0cmluZyIsInRvVXBwZXJDYXNlIiwidHJpbSIsInRhZyIsInBheWxvYWQiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJyZXNwb25zZSIsImlzRXJyb3IiLCJpbmRleE9mIiwiaHVtYW5SZWFkYWJsZSIsImNvZGUiLCJPYmplY3QiLCJrZXlzIiwia2V5IiwiaW5kZXgiLCJjdHgiLCJzcGxpY2UiLCJwdXNoIiwiX3NlbmRSZXF1ZXN0IiwiZ2V0UHJldmlvdXNseVF1ZXVlZCIsImNvbW1hbmRzIiwic3RhcnRJbmRleCIsImkiLCJpc01hdGNoIiwic2VuZCIsInN0ciIsImJ1ZmZlciIsInRpbWVvdXQiLCJieXRlTGVuZ3RoIiwic2V0VGltZW91dCIsInNlc3Npb25JZCIsIl9zZW5kQ29tcHJlc3NlZCIsInNldEhhbmRsZXIiLCJsb2dnZXIiLCJVaW50OEFycmF5IiwiX3BhcnNlSW5jb21pbmdDb21tYW5kcyIsIl9pdGVyYXRlSW5jb21pbmdCdWZmZXIiLCJidWYiLCJkaWZmIiwibWluIiwiTnVtYmVyIiwiX2xlbmd0aEJ1ZmZlciIsInN0YXJ0IiwibGF0ZXN0Iiwic3ViYXJyYXkiLCJwcmV2QnVmIiwic2V0IiwibGVmdElkeCIsImxlZnRPZkxlZnRDdXJseSIsIkxGaWR4IiwiY29tbWFuZExlbmd0aCIsInJlZHVjZSIsInByZXYiLCJjdXJyIiwidWludDhBcnJheSIsInNoaWZ0IiwicmVtYWluaW5nTGVuZ3RoIiwiZXhjZXNzTGVuZ3RoIiwiX2NsZWFySWRsZSIsImNodW5rIiwiZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUiLCJ2YWx1ZUFzU3RyaW5nIiwiZGVidWciLCJfcHJvY2Vzc1Jlc3BvbnNlIiwiX2hhbmRsZVJlc3BvbnNlIiwiX2VudGVySWRsZSIsIl9yZXN0YXJ0UXVldWUiLCJwcmVjaGVjayIsImNvbnRleHQiLCJ3YWl0RHJhaW4iLCJvcHRpb24iLCJhdHRyaWJ1dGVzIiwidGVzdCIsInR5cGUiLCJuciIsInZhbHVlIiwic2VjdGlvbiIsIkFycmF5IiwiaXNBcnJheSIsInRvTG93ZXJDYXNlIiwiY2FsbCIsIm1hdGNoIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJfc29ja2V0T25EYXRhIiwid2luZG93IiwiV29ya2VyIiwiX2NvbXByZXNzaW9uV29ya2VyIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiQmxvYiIsIkNvbXByZXNzaW9uV29ya2VyIiwib25tZXNzYWdlIiwibGluZW5vIiwiZmlsZW5hbWUiLCJwb3N0TWVzc2FnZSIsIl9jcmVhdGVNZXNzYWdlIiwiaW5mbGF0ZWRSZWFkeSIsImRlZmxhdGVkUmVhZHkiLCJfY29tcHJlc3Npb24iLCJpbmZsYXRlIiwidGVybWluYXRlIiwiZGVmbGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBMEN3QkEsSTs7QUExQ3hCOztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBR0E7QUFDQTtBQUNBOztBQUNBLElBQU1DLDRCQUE0QixPQUFsQztBQUNBLElBQU1DLGtCQUFrQixTQUF4QjtBQUNBLElBQU1DLDhCQUE4QixnQkFBcEM7QUFDQSxJQUFNQyxrQkFBa0IsU0FBeEI7QUFDQSxJQUFNQyw4QkFBOEIsZ0JBQXBDOztBQUVB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RUEsTUFBSSxLQUFLRyxrQkFBVCxFQUE2QjtBQUMzQjtBQUNBLFNBQUtBLGtCQUFMLENBQXdCYyxTQUF4QjtBQUNBLFNBQUtkLGtCQUFMLEdBQTBCLElBQTFCO0FBQ0Q7QUFDRixDQWREOztBQWdCQTs7Ozs7QUFLQWpMLEtBQUt1QyxTQUFMLENBQWVtRixlQUFmLEdBQWlDLFVBQVVMLE1BQVYsRUFBa0I7QUFDakQ7QUFDQSxNQUFJLEtBQUs0RCxrQkFBVCxFQUE2QjtBQUMzQixTQUFLQSxrQkFBTCxDQUF3QlEsV0FBeEIsQ0FBb0MsS0FBS0MsY0FBTCxDQUFvQnRMLGVBQXBCLEVBQXFDaUgsTUFBckMsQ0FBcEMsRUFBa0YsQ0FBQ0EsTUFBRCxDQUFsRjtBQUNELEdBRkQsTUFFTztBQUNMLFNBQUt3RSxZQUFMLENBQWtCRyxPQUFsQixDQUEwQjNFLE1BQTFCO0FBQ0Q7QUFDRixDQVBEOztBQVNBckgsS0FBS3VDLFNBQUwsQ0FBZW1KLGNBQWYsR0FBZ0MsVUFBVXZILE9BQVYsRUFBbUJrRCxNQUFuQixFQUEyQjtBQUN6RCxTQUFPO0FBQ0xsRCxhQUFTQSxPQURKO0FBRUxrRCxZQUFRQTtBQUZILEdBQVA7QUFJRCxDQUxEIiwiZmlsZSI6ImltYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwcm9wT3IgfSBmcm9tICdyYW1kYSdcbmltcG9ydCBUQ1BTb2NrZXQgZnJvbSAnZW1haWxqcy10Y3Atc29ja2V0J1xuaW1wb3J0IHsgdG9UeXBlZEFycmF5LCBmcm9tVHlwZWRBcnJheSB9IGZyb20gJy4vY29tbW9uJ1xuaW1wb3J0IHsgcGFyc2VyLCBjb21waWxlciB9IGZyb20gJ2VtYWlsanMtaW1hcC1oYW5kbGVyJ1xuaW1wb3J0IENvbXByZXNzaW9uIGZyb20gJy4vY29tcHJlc3Npb24nXG5pbXBvcnQgQ29tcHJlc3Npb25Xb3JrZXIgZnJvbSAnLi9jb21wcmVzc2lvbi53b3JrZXInXG5cbi8vXG4vLyBjb25zdGFudHMgdXNlZCBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIHRoZSB3b3JrZXJcbi8vXG5jb25zdCBNRVNTQUdFX0lOSVRJQUxJWkVfV09SS0VSID0gJ3N0YXJ0J1xuY29uc3QgTUVTU0FHRV9JTkZMQVRFID0gJ2luZmxhdGUnXG5jb25zdCBNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFkgPSAnaW5mbGF0ZWRfcmVhZHknXG5jb25zdCBNRVNTQUdFX0RFRkxBVEUgPSAnZGVmbGF0ZSdcbmNvbnN0IE1FU1NBR0VfREVGTEFURURfREFUQV9SRUFEWSA9ICdkZWZsYXRlZF9yZWFkeSdcblxuY29uc3QgRU9MID0gJ1xcclxcbidcbmNvbnN0IExJTkVfRkVFRCA9IDEwXG5jb25zdCBDQVJSSUFHRV9SRVRVUk4gPSAxM1xuY29uc3QgTEVGVF9DVVJMWV9CUkFDS0VUID0gMTIzXG5jb25zdCBSSUdIVF9DVVJMWV9CUkFDS0VUID0gMTI1XG5cbmNvbnN0IEFTQ0lJX1BMVVMgPSA0M1xuXG4vLyBTdGF0ZSB0cmFja2luZyB3aGVuIGNvbnN0cnVjdGluZyBhbiBJTUFQIGNvbW1hbmQgZnJvbSBidWZmZXJzLlxuY29uc3QgQlVGRkVSX1NUQVRFX0xJVEVSQUwgPSAnbGl0ZXJhbCdcbmNvbnN0IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xID0gJ2xpdGVyYWxfbGVuZ3RoXzEnXG5jb25zdCBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMiA9ICdsaXRlcmFsX2xlbmd0aF8yJ1xuY29uc3QgQlVGRkVSX1NUQVRFX0RFRkFVTFQgPSAnZGVmYXVsdCdcblxuLyoqXG4gKiBDcmVhdGVzIGEgY29ubmVjdGlvbiBvYmplY3QgdG8gYW4gSU1BUCBzZXJ2ZXIuIENhbGwgYGNvbm5lY3RgIG1ldGhvZCB0byBpbml0aXRhdGVcbiAqIHRoZSBhY3R1YWwgY29ubmVjdGlvbiwgdGhlIGNvbnN0cnVjdG9yIG9ubHkgZGVmaW5lcyB0aGUgcHJvcGVydGllcyBidXQgZG9lcyBub3QgYWN0dWFsbHkgY29ubmVjdC5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW2hvc3Q9J2xvY2FsaG9zdCddIEhvc3RuYW1lIHRvIGNvbmVuY3QgdG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBbcG9ydD0xNDNdIFBvcnQgbnVtYmVyIHRvIGNvbm5lY3QgdG9cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uYWwgb3B0aW9ucyBvYmplY3RcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0XSBTZXQgdG8gdHJ1ZSwgdG8gdXNlIGVuY3J5cHRlZCBjb25uZWN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuY29tcHJlc3Npb25Xb3JrZXJQYXRoXSBvZmZsb2FkcyBkZS0vY29tcHJlc3Npb24gY29tcHV0YXRpb24gdG8gYSB3ZWIgd29ya2VyLCB0aGlzIGlzIHRoZSBwYXRoIHRvIHRoZSBicm93c2VyaWZpZWQgZW1haWxqcy1jb21wcmVzc29yLXdvcmtlci5qc1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbWFwIChob3N0LCBwb3J0LCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICB0aGlzLnBvcnQgPSBwb3J0IHx8ICh0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0ID8gOTkzIDogMTQzKVxuICB0aGlzLmhvc3QgPSBob3N0IHx8ICdsb2NhbGhvc3QnXG5cbiAgLy8gVXNlIGEgVExTIGNvbm5lY3Rpb24uIFBvcnQgOTkzIGFsc28gZm9yY2VzIFRMUy5cbiAgdGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCA9ICd1c2VTZWN1cmVUcmFuc3BvcnQnIGluIHRoaXMub3B0aW9ucyA/ICEhdGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCA6IHRoaXMucG9ydCA9PT0gOTkzXG5cbiAgdGhpcy5zZWN1cmVNb2RlID0gISF0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0IC8vIERvZXMgdGhlIGNvbm5lY3Rpb24gdXNlIFNTTC9UTFNcblxuICB0aGlzLl9jb25uZWN0aW9uUmVhZHkgPSBmYWxzZSAvLyBJcyB0aGUgY29uZWN0aW9uIGVzdGFibGlzaGVkIGFuZCBncmVldGluZyBpcyByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXJcblxuICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCA9IHt9IC8vIEdsb2JhbCBoYW5kbGVycyBmb3IgdW5yZWxhdGVkIHJlc3BvbnNlcyAoRVhQVU5HRSwgRVhJU1RTIGV0Yy4pXG5cbiAgdGhpcy5fY2xpZW50UXVldWUgPSBbXSAvLyBRdWV1ZSBvZiBvdXRnb2luZyBjb21tYW5kc1xuICB0aGlzLl9jYW5TZW5kID0gZmFsc2UgLy8gSXMgaXQgT0sgdG8gc2VuZCBzb21ldGhpbmcgdG8gdGhlIHNlcnZlclxuICB0aGlzLl90YWdDb3VudGVyID0gMCAvLyBDb3VudGVyIHRvIGFsbG93IHVuaXF1ZXVlIGltYXAgdGFnc1xuICB0aGlzLl9jdXJyZW50Q29tbWFuZCA9IGZhbHNlIC8vIEN1cnJlbnQgY29tbWFuZCB0aGF0IGlzIHdhaXRpbmcgZm9yIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlclxuXG4gIHRoaXMuX2lkbGVUaW1lciA9IGZhbHNlIC8vIFRpbWVyIHdhaXRpbmcgdG8gZW50ZXIgaWRsZVxuICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBmYWxzZSAvLyBUaW1lciB3YWl0aW5nIHRvIGRlY2xhcmUgdGhlIHNvY2tldCBkZWFkIHN0YXJ0aW5nIGZyb20gdGhlIGxhc3Qgd3JpdGVcblxuICB0aGlzLmNvbXByZXNzZWQgPSBmYWxzZSAvLyBJcyB0aGUgY29ubmVjdGlvbiBjb21wcmVzc2VkIGFuZCBuZWVkcyBpbmZsYXRpbmcvZGVmbGF0aW5nXG4gIHRoaXMuX3dvcmtlclBhdGggPSB0aGlzLm9wdGlvbnMuY29tcHJlc3Npb25Xb3JrZXJQYXRoIC8vIFRoZSBwYXRoIGZvciB0aGUgY29tcHJlc3NvcidzIHdvcmtlciBzY3JpcHRcblxuICAvL1xuICAvLyBIRUxQRVJTXG4gIC8vXG5cbiAgLy8gQXMgdGhlIHNlcnZlciBzZW5kcyBkYXRhIGluIGNodW5rcywgaXQgbmVlZHMgdG8gYmUgc3BsaXQgaW50byBzZXBhcmF0ZSBsaW5lcy4gSGVscHMgcGFyc2luZyB0aGUgaW5wdXQuXG4gIHRoaXMuX2luY29taW5nQnVmZmVycyA9IFtdXG4gIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyA9IDBcblxuICAvL1xuICAvLyBFdmVudCBwbGFjZWhvbGRlcnMsIG1heSBiZSBvdmVycmlkZW4gd2l0aCBjYWxsYmFjayBmdW5jdGlvbnNcbiAgLy9cbiAgdGhpcy5vbmNlcnQgPSBudWxsXG4gIHRoaXMub25lcnJvciA9IG51bGwgLy8gSXJyZWNvdmVyYWJsZSBlcnJvciBvY2N1cnJlZC4gQ29ubmVjdGlvbiB0byB0aGUgc2VydmVyIHdpbGwgYmUgY2xvc2VkIGF1dG9tYXRpY2FsbHkuXG4gIHRoaXMub25yZWFkeSA9IG51bGwgLy8gVGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciBoYXMgYmVlbiBlc3RhYmxpc2hlZCBhbmQgZ3JlZXRpbmcgaXMgcmVjZWl2ZWRcbiAgdGhpcy5vbmlkbGUgPSBudWxsICAvLyBUaGVyZSBhcmUgbm8gbW9yZSBjb21tYW5kcyB0byBwcm9jZXNzXG59XG5cbi8vIENvbnN0YW50c1xuXG4vKipcbiAqIEhvdyBtdWNoIHRpbWUgdG8gd2FpdCBzaW5jZSB0aGUgbGFzdCByZXNwb25zZSB1bnRpbCB0aGUgY29ubmVjdGlvbiBpcyBjb25zaWRlcmVkIGlkbGluZ1xuICovXG5JbWFwLnByb3RvdHlwZS5USU1FT1VUX0VOVEVSX0lETEUgPSAxMDAwXG5cbi8qKlxuICogTG93ZXIgQm91bmQgZm9yIHNvY2tldCB0aW1lb3V0IHRvIHdhaXQgc2luY2UgdGhlIGxhc3QgZGF0YSB3YXMgd3JpdHRlbiB0byBhIHNvY2tldFxuICovXG5JbWFwLnByb3RvdHlwZS5USU1FT1VUX1NPQ0tFVF9MT1dFUl9CT1VORCA9IDEwMDAwXG5cbi8qKlxuICogTXVsdGlwbGllciBmb3Igc29ja2V0IHRpbWVvdXQ6XG4gKlxuICogV2UgYXNzdW1lIGF0IGxlYXN0IGEgR1BSUyBjb25uZWN0aW9uIHdpdGggMTE1IGtiL3MgPSAxNCwzNzUga0IvcyB0b3BzLCBzbyAxMCBLQi9zIHRvIGJlIG9uXG4gKiB0aGUgc2FmZSBzaWRlLiBXZSBjYW4gdGltZW91dCBhZnRlciBhIGxvd2VyIGJvdW5kIG9mIDEwcyArIChuIEtCIC8gMTAgS0IvcykuIEEgMSBNQiBtZXNzYWdlXG4gKiB1cGxvYWQgd291bGQgYmUgMTEwIHNlY29uZHMgdG8gd2FpdCBmb3IgdGhlIHRpbWVvdXQuIDEwIEtCL3MgPT09IDAuMSBzL0JcbiAqL1xuSW1hcC5wcm90b3R5cGUuVElNRU9VVF9TT0NLRVRfTVVMVElQTElFUiA9IDAuMVxuXG4vKipcbiAqIFRpbWVvdXQgdXNlZCBpbiBfb25EYXRhLCBtYXggcGFja2V0IHNpemUgaXMgNDA5NiBieXRlcy5cbiAqL1xuSW1hcC5wcm90b3R5cGUuT05fREFUQV9USU1FT1VUID0gSW1hcC5wcm90b3R5cGUuVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkQgKyBNYXRoLmZsb29yKDQwOTYgKiBJbWFwLnByb3RvdHlwZS5USU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSKVxuXG4vLyBQVUJMSUMgTUVUSE9EU1xuXG4vKipcbiAqIEluaXRpYXRlIGEgY29ubmVjdGlvbiB0byB0aGUgc2VydmVyLiBXYWl0IGZvciBvbnJlYWR5IGV2ZW50XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFNvY2tldFxuICogICAgIFRFU1RJTkcgT05MWSEgVGhlIFRDUFNvY2tldCBoYXMgYSBwcmV0dHkgbm9uc2Vuc2ljYWwgY29udmVuaWVuY2UgY29uc3RydWN0b3IsXG4gKiAgICAgd2hpY2ggbWFrZXMgaXQgaGFyZCB0byBtb2NrLiBGb3IgZGVwZW5kZW5jeS1pbmplY3Rpb24gcHVycG9zZXMsIHdlIHVzZSB0aGVcbiAqICAgICBTb2NrZXQgcGFyYW1ldGVyIHRvIHBhc3MgaW4gYSBtb2NrIFNvY2tldCBpbXBsZW1lbnRhdGlvbi4gU2hvdWxkIGJlIGxlZnQgYmxhbmtcbiAqICAgICBpbiBwcm9kdWN0aW9uIHVzZSFcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNvY2tldCBpcyBvcGVuZWRcbiAqL1xuSW1hcC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChTb2NrZXQpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICB0aGlzLnNvY2tldCA9IChTb2NrZXQgfHwgVENQU29ja2V0KS5vcGVuKHRoaXMuaG9zdCwgdGhpcy5wb3J0LCB7XG4gICAgICBiaW5hcnlUeXBlOiAnYXJyYXlidWZmZXInLFxuICAgICAgdXNlU2VjdXJlVHJhbnNwb3J0OiB0aGlzLnNlY3VyZU1vZGUsXG4gICAgICBjYTogdGhpcy5vcHRpb25zLmNhLFxuICAgICAgdGxzV29ya2VyUGF0aDogdGhpcy5vcHRpb25zLnRsc1dvcmtlclBhdGhcbiAgICB9KVxuXG4gICAgLy8gYWxsb3dzIGNlcnRpZmljYXRlIGhhbmRsaW5nIGZvciBwbGF0Zm9ybSB3L28gbmF0aXZlIHRscyBzdXBwb3J0XG4gICAgLy8gb25jZXJ0IGlzIG5vbiBzdGFuZGFyZCBzbyBzZXR0aW5nIGl0IG1pZ2h0IHRocm93IGlmIHRoZSBzb2NrZXQgb2JqZWN0IGlzIGltbXV0YWJsZVxuICAgIHRyeSB7XG4gICAgICB0aGlzLnNvY2tldC5vbmNlcnQgPSAoY2VydCkgPT4geyB0aGlzLm9uY2VydCAmJiB0aGlzLm9uY2VydChjZXJ0KSB9XG4gICAgfSBjYXRjaCAoRSkgeyB9XG5cbiAgICAvLyBDb25uZWN0aW9uIGNsb3NpbmcgdW5leHBlY3RlZCBpcyBhbiBlcnJvclxuICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignU29ja2V0IGNsb3NlZCB1bmV4Y2VwdGVkbHkhJykpXG4gICAgdGhpcy5zb2NrZXQub25kYXRhID0gKGV2dCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fb25EYXRhKGV2dClcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLl9vbkVycm9yKGVycilcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiBhbiBlcnJvciBoYXBwZW5zIGR1cmluZyBjcmVhdGUgdGltZSwgcmVqZWN0IHRoZSBwcm9taXNlXG4gICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlKSA9PiB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdDb3VsZCBub3Qgb3BlbiBzb2NrZXQ6ICcgKyBlLmRhdGEubWVzc2FnZSkpXG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQub25vcGVuID0gKCkgPT4ge1xuICAgICAgLy8gdXNlIHByb3BlciBcImlycmVjb3ZlcmFibGUgZXJyb3IsIHRlYXIgZG93biBldmVyeXRoaW5nXCItaGFuZGxlciBvbmx5IGFmdGVyIHNvY2tldCBpcyBvcGVuXG4gICAgICB0aGlzLnNvY2tldC5vbmVycm9yID0gKGUpID0+IHRoaXMuX29uRXJyb3IoZSlcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBDbG9zZXMgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlclxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHRoZSBzb2NrZXQgaXMgY2xvc2VkXG4gKi9cbkltYXAucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHZhciB0ZWFyRG93biA9ICgpID0+IHtcbiAgICAgIC8vIGZ1bGZpbGwgcGVuZGluZyBwcm9taXNlc1xuICAgICAgdGhpcy5fY2xpZW50UXVldWUuZm9yRWFjaChjbWQgPT4gY21kLmNhbGxiYWNrKGVycm9yKSlcbiAgICAgIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZCkge1xuICAgICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5jYWxsYmFjayhlcnJvcilcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xpZW50UXVldWUgPSBbXVxuICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQgPSBmYWxzZVxuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVyKVxuICAgICAgdGhpcy5faWRsZVRpbWVyID0gbnVsbFxuXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKVxuICAgICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gbnVsbFxuXG4gICAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5zb2NrZXQub25vcGVuID0gbnVsbFxuICAgICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gbnVsbFxuICAgICAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSBudWxsXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSBudWxsXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5zb2NrZXQub25jZXJ0ID0gbnVsbFxuICAgICAgICB9IGNhdGNoIChFKSB7IH1cblxuICAgICAgICB0aGlzLnNvY2tldCA9IG51bGxcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZSgpXG4gICAgfVxuXG4gICAgdGhpcy5fZGlzYWJsZUNvbXByZXNzaW9uKClcblxuICAgIGlmICghdGhpcy5zb2NrZXQgfHwgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSAhPT0gJ29wZW4nKSB7XG4gICAgICByZXR1cm4gdGVhckRvd24oKVxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSB0aGlzLnNvY2tldC5vbmVycm9yID0gdGVhckRvd24gLy8gd2UgZG9uJ3QgcmVhbGx5IGNhcmUgYWJvdXQgdGhlIGVycm9yIGhlcmVcbiAgICB0aGlzLnNvY2tldC5jbG9zZSgpXG4gIH0pXG59XG5cbi8qKlxuICogU2VuZCBMT0dPVVQgdG8gdGhlIHNlcnZlci5cbiAqXG4gKiBVc2UgaXMgZGlzY291cmFnZWQhXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gY29ubmVjdGlvbiBpcyBjbG9zZWQgYnkgc2VydmVyLlxuICovXG5JbWFwLnByb3RvdHlwZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICB0aGlzLmNsb3NlKCdDbGllbnQgbG9nZ2luZyBvdXQnKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdClcbiAgICB9XG5cbiAgICB0aGlzLmVucXVldWVDb21tYW5kKCdMT0dPVVQnKVxuICB9KVxufVxuXG4vKipcbiAqIEluaXRpYXRlcyBUTFMgaGFuZHNoYWtlXG4gKi9cbkltYXAucHJvdG90eXBlLnVwZ3JhZGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2VjdXJlTW9kZSA9IHRydWVcbiAgdGhpcy5zb2NrZXQudXBncmFkZVRvU2VjdXJlKClcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYSBjb21tYW5kIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZW1haWxqcy9lbWFpbGpzLWltYXAtaGFuZGxlciBmb3IgcmVxdWVzdCBzdHJ1Y3R1cmUuXG4gKiBEbyBub3QgcHJvdmlkZSBhIHRhZyBwcm9wZXJ0eSwgaXQgd2lsbCBiZSBzZXQgYnkgdGhlIHF1ZXVlIG1hbmFnZXIuXG4gKlxuICogVG8gY2F0Y2ggdW50YWdnZWQgcmVzcG9uc2VzIHVzZSBhY2NlcHRVbnRhZ2dlZCBwcm9wZXJ0eS4gRm9yIGV4YW1wbGUsIGlmXG4gKiB0aGUgdmFsdWUgZm9yIGl0IGlzICdGRVRDSCcgdGhlbiB0aGUgcmVwb25zZSBpbmNsdWRlcyAncGF5bG9hZC5GRVRDSCcgcHJvcGVydHlcbiAqIHRoYXQgaXMgYW4gYXJyYXkgaW5jbHVkaW5nIGFsbCBsaXN0ZWQgKiBGRVRDSCByZXNwb25zZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3QgU3RydWN0dXJlZCByZXF1ZXN0IG9iamVjdFxuICogQHBhcmFtIHtBcnJheX0gYWNjZXB0VW50YWdnZWQgYSBsaXN0IG9mIHVudGFnZ2VkIHJlc3BvbnNlcyB0aGF0IHdpbGwgYmUgaW5jbHVkZWQgaW4gJ3BheWxvYWQnIHByb3BlcnR5XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIGRhdGEgZm9yIHRoZSBjb21tYW5kIHBheWxvYWRcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgY29ycmVzcG9uZGluZyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAqL1xuSW1hcC5wcm90b3R5cGUuZW5xdWV1ZUNvbW1hbmQgPSBmdW5jdGlvbiAocmVxdWVzdCwgYWNjZXB0VW50YWdnZWQsIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiByZXF1ZXN0ID09PSAnc3RyaW5nJykge1xuICAgIHJlcXVlc3QgPSB7XG4gICAgICBjb21tYW5kOiByZXF1ZXN0XG4gICAgfVxuICB9XG5cbiAgYWNjZXB0VW50YWdnZWQgPSBbXS5jb25jYXQoYWNjZXB0VW50YWdnZWQgfHwgW10pLm1hcCgodW50YWdnZWQpID0+ICh1bnRhZ2dlZCB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSlcblxuICB2YXIgdGFnID0gJ1cnICsgKCsrdGhpcy5fdGFnQ291bnRlcilcbiAgcmVxdWVzdC50YWcgPSB0YWdcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgdGFnOiB0YWcsXG4gICAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgcGF5bG9hZDogYWNjZXB0VW50YWdnZWQubGVuZ3RoID8ge30gOiB1bmRlZmluZWQsXG4gICAgICBjYWxsYmFjazogKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlzRXJyb3IocmVzcG9uc2UpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChyZXNwb25zZSlcbiAgICAgICAgfSBlbHNlIGlmIChbJ05PJywgJ0JBRCddLmluZGV4T2YocHJvcE9yKCcnLCAnY29tbWFuZCcpKHJlc3BvbnNlKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSkgPj0gMCkge1xuICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihyZXNwb25zZS5odW1hblJlYWRhYmxlIHx8ICdFcnJvcicpXG4gICAgICAgICAgaWYgKHJlc3BvbnNlLmNvZGUpIHtcbiAgICAgICAgICAgIGVycm9yLmNvZGUgPSByZXNwb25zZS5jb2RlXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHJlc3BvbnNlKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFwcGx5IGFueSBhZGRpdGlvbmFsIG9wdGlvbnMgdG8gdGhlIGNvbW1hbmRcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zIHx8IHt9KS5mb3JFYWNoKChrZXkpID0+IHsgZGF0YVtrZXldID0gb3B0aW9uc1trZXldIH0pXG5cbiAgICBhY2NlcHRVbnRhZ2dlZC5mb3JFYWNoKChjb21tYW5kKSA9PiB7IGRhdGEucGF5bG9hZFtjb21tYW5kXSA9IFtdIH0pXG5cbiAgICAvLyBpZiB3ZSdyZSBpbiBwcmlvcml0eSBtb2RlIChpLmUuIHdlIHJhbiBjb21tYW5kcyBpbiBhIHByZWNoZWNrKSxcbiAgICAvLyBxdWV1ZSBhbnkgY29tbWFuZHMgQkVGT1JFIHRoZSBjb21tYW5kIHRoYXQgY29udGlhbmVkIHRoZSBwcmVjaGVjayxcbiAgICAvLyBvdGhlcndpc2UganVzdCBxdWV1ZSBjb21tYW5kIGFzIHVzdWFsXG4gICAgdmFyIGluZGV4ID0gZGF0YS5jdHggPyB0aGlzLl9jbGllbnRRdWV1ZS5pbmRleE9mKGRhdGEuY3R4KSA6IC0xXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIGRhdGEudGFnICs9ICcucCdcbiAgICAgIGRhdGEucmVxdWVzdC50YWcgKz0gJy5wJ1xuICAgICAgdGhpcy5fY2xpZW50UXVldWUuc3BsaWNlKGluZGV4LCAwLCBkYXRhKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jbGllbnRRdWV1ZS5wdXNoKGRhdGEpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NhblNlbmQpIHtcbiAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0KClcbiAgICB9XG4gIH0pXG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBjb21tYW5kc1xuICogQHBhcmFtIGN0eFxuICogQHJldHVybnMgeyp9XG4gKi9cbkltYXAucHJvdG90eXBlLmdldFByZXZpb3VzbHlRdWV1ZWQgPSBmdW5jdGlvbiAoY29tbWFuZHMsIGN0eCkge1xuICBjb25zdCBzdGFydEluZGV4ID0gdGhpcy5fY2xpZW50UXVldWUuaW5kZXhPZihjdHgpIC0gMVxuXG4gIC8vIHNlYXJjaCBiYWNrd2FyZHMgZm9yIHRoZSBjb21tYW5kcyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBmb3VuZFxuICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoaXNNYXRjaCh0aGlzLl9jbGllbnRRdWV1ZVtpXSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jbGllbnRRdWV1ZVtpXVxuICAgIH1cbiAgfVxuXG4gIC8vIGFsc28gY2hlY2sgY3VycmVudCBjb21tYW5kIGlmIG5vIFNFTEVDVCBpcyBxdWV1ZWRcbiAgaWYgKGlzTWF0Y2godGhpcy5fY3VycmVudENvbW1hbmQpKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb21tYW5kXG4gIH1cblxuICByZXR1cm4gZmFsc2VcblxuICBmdW5jdGlvbiBpc01hdGNoIChkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEgJiYgZGF0YS5yZXF1ZXN0ICYmIGNvbW1hbmRzLmluZGV4T2YoZGF0YS5yZXF1ZXN0LmNvbW1hbmQpID49IDBcbiAgfVxufVxuXG4vKipcbiAqIFNlbmQgZGF0YSB0byB0aGUgVENQIHNvY2tldFxuICogQXJtcyBhIHRpbWVvdXQgd2FpdGluZyBmb3IgYSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBQYXlsb2FkXG4gKi9cbkltYXAucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIGNvbnN0IGJ1ZmZlciA9IHRvVHlwZWRBcnJheShzdHIpLmJ1ZmZlclxuICBjb25zdCB0aW1lb3V0ID0gdGhpcy5USU1FT1VUX1NPQ0tFVF9MT1dFUl9CT1VORCArIE1hdGguZmxvb3IoYnVmZmVyLmJ5dGVMZW5ndGggKiB0aGlzLlRJTUVPVVRfU09DS0VUX01VTFRJUExJRVIpXG5cbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lcikgLy8gY2xlYXIgcGVuZGluZyB0aW1lb3V0c1xuICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX29uRXJyb3IobmV3IEVycm9yKHRoaXMub3B0aW9ucy5zZXNzaW9uSWQgKyAnIFNvY2tldCB0aW1lZCBvdXQhJykpLCB0aW1lb3V0KSAvLyBhcm0gdGhlIG5leHQgdGltZW91dFxuXG4gIGlmICh0aGlzLmNvbXByZXNzZWQpIHtcbiAgICB0aGlzLl9zZW5kQ29tcHJlc3NlZChidWZmZXIpXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zb2NrZXQuc2VuZChidWZmZXIpXG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgYSBnbG9iYWwgaGFuZGxlciBmb3IgYW4gdW50YWdnZWQgcmVzcG9uc2UuIElmIGN1cnJlbnRseSBwcm9jZXNzZWQgY29tbWFuZFxuICogaGFzIG5vdCBsaXN0ZWQgdW50YWdnZWQgY29tbWFuZCBpdCBpcyBmb3J3YXJkZWQgdG8gdGhlIGdsb2JhbCBoYW5kbGVyLiBVc2VmdWxcbiAqIHdpdGggRVhQVU5HRSwgRVhJU1RTIGV0Yy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY29tbWFuZCBVbnRhZ2dlZCBjb21tYW5kIG5hbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGZ1bmN0aW9uIHdpdGggcmVzcG9uc2Ugb2JqZWN0IGFuZCBjb250aW51ZSBjYWxsYmFjayBmdW5jdGlvblxuICovXG5JbWFwLnByb3RvdHlwZS5zZXRIYW5kbGVyID0gZnVuY3Rpb24gKGNvbW1hbmQsIGNhbGxiYWNrKSB7XG4gIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkW2NvbW1hbmQudG9VcHBlckNhc2UoKS50cmltKCldID0gY2FsbGJhY2tcbn1cblxuLy8gSU5URVJOQUwgRVZFTlRTXG5cbi8qKlxuICogRXJyb3IgaGFuZGxlciBmb3IgdGhlIHNvY2tldFxuICpcbiAqIEBldmVudFxuICogQHBhcmFtIHtFdmVudH0gZXZ0IEV2ZW50IG9iamVjdC4gU2VlIGV2dC5kYXRhIGZvciB0aGUgZXJyb3JcbiAqL1xuSW1hcC5wcm90b3R5cGUuX29uRXJyb3IgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gIHZhciBlcnJvclxuICBpZiAodGhpcy5pc0Vycm9yKGV2dCkpIHtcbiAgICBlcnJvciA9IGV2dFxuICB9IGVsc2UgaWYgKGV2dCAmJiB0aGlzLmlzRXJyb3IoZXZ0LmRhdGEpKSB7XG4gICAgZXJyb3IgPSBldnQuZGF0YVxuICB9IGVsc2Uge1xuICAgIGVycm9yID0gbmV3IEVycm9yKChldnQgJiYgZXZ0LmRhdGEgJiYgZXZ0LmRhdGEubWVzc2FnZSkgfHwgZXZ0LmRhdGEgfHwgZXZ0IHx8ICdFcnJvcicpXG4gIH1cblxuICB0aGlzLmxvZ2dlci5lcnJvcihlcnJvcilcblxuICAvLyBhbHdheXMgY2FsbCBvbmVycm9yIGNhbGxiYWNrLCBubyBtYXR0ZXIgaWYgY2xvc2UoKSBzdWNjZWVkcyBvciBmYWlsc1xuICB0aGlzLmNsb3NlKGVycm9yKS50aGVuKCgpID0+IHtcbiAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycm9yKVxuICB9LCAoKSA9PiB7XG4gICAgdGhpcy5vbmVycm9yICYmIHRoaXMub25lcnJvcihlcnJvcilcbiAgfSlcbn1cblxuLyoqXG4gKiBIYW5kbGVyIGZvciBpbmNvbWluZyBkYXRhIGZyb20gdGhlIHNlcnZlci4gVGhlIGRhdGEgaXMgc2VudCBpbiBhcmJpdHJhcnlcbiAqIGNodW5rcyBhbmQgY2FuJ3QgYmUgdXNlZCBkaXJlY3RseSBzbyB0aGlzIGZ1bmN0aW9uIG1ha2VzIHN1cmUgdGhlIGRhdGFcbiAqIGlzIHNwbGl0IGludG8gY29tcGxldGUgbGluZXMgYmVmb3JlIHRoZSBkYXRhIGlzIHBhc3NlZCB0byB0aGUgY29tbWFuZFxuICogaGFuZGxlclxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2dFxuICovXG5JbWFwLnByb3RvdHlwZS5fb25EYXRhID0gZnVuY3Rpb24gKGV2dCkge1xuICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKSAvLyByZXNldCB0aGUgdGltZW91dCBvbiBlYWNoIGRhdGEgcGFja2V0XG4gIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IodGhpcy5vcHRpb25zLnNlc3Npb25JZCArICcgU29ja2V0IHRpbWVkIG91dCEnKSksIHRoaXMuT05fREFUQV9USU1FT1VUKVxuXG4gIHRoaXMuX2luY29taW5nQnVmZmVycy5wdXNoKG5ldyBVaW50OEFycmF5KGV2dC5kYXRhKSkgLy8gYXBwZW5kIHRvIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgdGhpcy5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKHRoaXMuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpKSAvLyBDb25zdW1lIHRoZSBpbmNvbWluZyBidWZmZXJcbn1cblxuSW1hcC5wcm90b3R5cGUuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlciA9IGZ1bmN0aW9uICogKCkge1xuICBsZXQgYnVmID0gdGhpcy5faW5jb21pbmdCdWZmZXJzW3RoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggLSAxXVxuICBsZXQgaSA9IDBcblxuICAvLyBsb29wIGludmFyaWFudDpcbiAgLy8gICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgc3RhcnRzIHdpdGggdGhlIGJlZ2lubmluZyBvZiBpbmNvbWluZyBjb21tYW5kLlxuICAvLyAgIGJ1ZiBpcyBzaG9ydGhhbmQgZm9yIGxhc3QgZWxlbWVudCBvZiB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMuXG4gIC8vICAgYnVmWzAuLmktMV0gaXMgcGFydCBvZiBpbmNvbWluZyBjb21tYW5kLlxuICB3aGlsZSAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX2J1ZmZlclN0YXRlKSB7XG4gICAgICBjYXNlIEJVRkZFUl9TVEFURV9MSVRFUkFMOlxuICAgICAgICBjb25zdCBkaWZmID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIGksIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcpXG4gICAgICAgIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgLT0gZGlmZlxuICAgICAgICBpICs9IGRpZmZcbiAgICAgICAgaWYgKHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgICAgIH1cbiAgICAgICAgY29udGludWVcblxuICAgICAgY2FzZSBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMjpcbiAgICAgICAgaWYgKGkgPCBidWYubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKGJ1ZltpXSA9PT0gQ0FSUklBR0VfUkVUVVJOKSB7XG4gICAgICAgICAgICB0aGlzLl9saXRlcmFsUmVtYWluaW5nID0gTnVtYmVyKGZyb21UeXBlZEFycmF5KHRoaXMuX2xlbmd0aEJ1ZmZlcikpICsgMiAvLyBmb3IgQ1JMRlxuICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfTElURVJBTFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZVxuXG4gICAgICBjYXNlIEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xOlxuICAgICAgICBjb25zdCBzdGFydCA9IGlcbiAgICAgICAgd2hpbGUgKGkgPCBidWYubGVuZ3RoICYmIGJ1ZltpXSA+PSA0OCAmJiBidWZbaV0gPD0gNTcpIHsgLy8gZGlnaXRzXG4gICAgICAgICAgaSsrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ICE9PSBpKSB7XG4gICAgICAgICAgY29uc3QgbGF0ZXN0ID0gYnVmLnN1YmFycmF5KHN0YXJ0LCBpKVxuICAgICAgICAgIGNvbnN0IHByZXZCdWYgPSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgICB0aGlzLl9sZW5ndGhCdWZmZXIgPSBuZXcgVWludDhBcnJheShwcmV2QnVmLmxlbmd0aCArIGxhdGVzdC5sZW5ndGgpXG4gICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyLnNldChwcmV2QnVmKVxuICAgICAgICAgIHRoaXMuX2xlbmd0aEJ1ZmZlci5zZXQobGF0ZXN0LCBwcmV2QnVmLmxlbmd0aClcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5fbGVuZ3RoQnVmZmVyLmxlbmd0aCA+IDAgJiYgYnVmW2ldID09PSBSSUdIVF9DVVJMWV9CUkFDS0VUKSB7XG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8yXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICB9XG4gICAgICAgICAgaSsrXG4gICAgICAgIH1cbiAgICAgICAgY29udGludWVcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gZmluZCBsaXRlcmFsIGxlbmd0aFxuICAgICAgICBjb25zdCBsZWZ0SWR4ID0gYnVmLmluZGV4T2YoTEVGVF9DVVJMWV9CUkFDS0VULCBpKVxuICAgICAgICBpZiAobGVmdElkeCA+IC0xKSB7XG4gICAgICAgICAgY29uc3QgbGVmdE9mTGVmdEN1cmx5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ1ZmZlciwgaSwgbGVmdElkeCAtIGkpXG4gICAgICAgICAgaWYgKGxlZnRPZkxlZnRDdXJseS5pbmRleE9mKExJTkVfRkVFRCkgPT09IC0xKSB7XG4gICAgICAgICAgICBpID0gbGVmdElkeCArIDFcbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KDApXG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbmQgZW5kIG9mIGNvbW1hbmRcbiAgICAgICAgY29uc3QgTEZpZHggPSBidWYuaW5kZXhPZihMSU5FX0ZFRUQsIGkpXG4gICAgICAgIGlmIChMRmlkeCA+IC0xKSB7XG4gICAgICAgICAgaWYgKExGaWR4IDwgYnVmLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2luY29taW5nQnVmZmVyc1t0aGlzLl9pbmNvbWluZ0J1ZmZlcnMubGVuZ3RoIC0gMV0gPSBuZXcgVWludDhBcnJheShidWYuYnVmZmVyLCAwLCBMRmlkeCArIDEpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNvbW1hbmRMZW5ndGggPSB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBwcmV2ICsgY3Vyci5sZW5ndGgsIDApIC0gMiAvLyAyIGZvciBDUkxGXG4gICAgICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBVaW50OEFycmF5KGNvbW1hbmRMZW5ndGgpXG4gICAgICAgICAgbGV0IGluZGV4ID0gMFxuICAgICAgICAgIHdoaWxlICh0aGlzLl9pbmNvbWluZ0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHVpbnQ4QXJyYXkgPSB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMuc2hpZnQoKVxuXG4gICAgICAgICAgICBjb25zdCByZW1haW5pbmdMZW5ndGggPSBjb21tYW5kTGVuZ3RoIC0gaW5kZXhcbiAgICAgICAgICAgIGlmICh1aW50OEFycmF5Lmxlbmd0aCA+IHJlbWFpbmluZ0xlbmd0aCkge1xuICAgICAgICAgICAgICBjb25zdCBleGNlc3NMZW5ndGggPSB1aW50OEFycmF5Lmxlbmd0aCAtIHJlbWFpbmluZ0xlbmd0aFxuICAgICAgICAgICAgICB1aW50OEFycmF5ID0gdWludDhBcnJheS5zdWJhcnJheSgwLCAtZXhjZXNzTGVuZ3RoKVxuXG4gICAgICAgICAgICAgIGlmICh0aGlzLl9pbmNvbWluZ0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luY29taW5nQnVmZmVycyA9IFtdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbW1hbmQuc2V0KHVpbnQ4QXJyYXksIGluZGV4KVxuICAgICAgICAgICAgaW5kZXggKz0gdWludDhBcnJheS5sZW5ndGhcbiAgICAgICAgICB9XG4gICAgICAgICAgeWllbGQgY29tbWFuZFxuICAgICAgICAgIGlmIChMRmlkeCA8IGJ1Zi5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBidWYgPSBuZXcgVWludDhBcnJheShidWYuc3ViYXJyYXkoTEZpZHggKyAxKSlcbiAgICAgICAgICAgIHRoaXMuX2luY29taW5nQnVmZmVycy5wdXNoKGJ1ZilcbiAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSB0aW1lb3V0IHdoZW4gYW4gZW50aXJlIGNvbW1hbmQgaGFzIGFycml2ZWRcbiAgICAgICAgICAgIC8vIGFuZCBub3Qgd2FpdGluZyBvbiBtb3JlIGRhdGEgZm9yIG5leHQgY29tbWFuZFxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lcilcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IG51bGxcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBQUklWQVRFIE1FVEhPRFNcblxuLyoqXG4gKiBQcm9jZXNzZXMgYSBjb21tYW5kIGZyb20gdGhlIHF1ZXVlLiBUaGUgY29tbWFuZCBpcyBwYXJzZWQgYW5kIGZlZWRlZCB0byBhIGhhbmRsZXJcbiAqL1xuSW1hcC5wcm90b3R5cGUuX3BhcnNlSW5jb21pbmdDb21tYW5kcyA9IGZ1bmN0aW9uIChjb21tYW5kcykge1xuICBmb3IgKHZhciBjb21tYW5kIG9mIGNvbW1hbmRzKSB7XG4gICAgdGhpcy5fY2xlYXJJZGxlKClcblxuICAgIC8qXG4gICAgICogVGhlIFwiK1wiLXRhZ2dlZCByZXNwb25zZSBpcyBhIHNwZWNpYWwgY2FzZTpcbiAgICAgKiBFaXRoZXIgdGhlIHNlcnZlciBjYW4gYXNrcyBmb3IgdGhlIG5leHQgY2h1bmsgb2YgZGF0YSwgZS5nLiBmb3IgdGhlIEFVVEhFTlRJQ0FURSBjb21tYW5kLlxuICAgICAqXG4gICAgICogT3IgdGhlcmUgd2FzIGFuIGVycm9yIGluIHRoZSBYT0FVVEgyIGF1dGhlbnRpY2F0aW9uLCBmb3Igd2hpY2ggU0FTTCBpbml0aWFsIGNsaWVudCByZXNwb25zZSBleHRlbnNpb25cbiAgICAgKiBkaWN0YXRlcyB0aGUgY2xpZW50IHNlbmRzIGFuIGVtcHR5IEVPTCByZXNwb25zZSB0byB0aGUgY2hhbGxlbmdlIGNvbnRhaW5pbmcgdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgICpcbiAgICAgKiBEZXRhaWxzIG9uIFwiK1wiLXRhZ2dlZCByZXNwb25zZTpcbiAgICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tMi4yLjFcbiAgICAgKi9cbiAgICAvL1xuICAgIGlmIChjb21tYW5kWzBdID09PSBBU0NJSV9QTFVTKSB7XG4gICAgICBpZiAodGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgLy8gZmVlZCB0aGUgbmV4dCBjaHVuayBvZiBkYXRhXG4gICAgICAgIHZhciBjaHVuayA9IHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEuc2hpZnQoKVxuICAgICAgICBjaHVuayArPSAoIXRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEubGVuZ3RoID8gRU9MIDogJycpIC8vIEVPTCBpZiB0aGVyZSdzIG5vdGhpbmcgbW9yZSB0byBzZW5kXG4gICAgICAgIHRoaXMuc2VuZChjaHVuaylcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudENvbW1hbmQuZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUpIHtcbiAgICAgICAgdGhpcy5zZW5kKEVPTCkgLy8gWE9BVVRIMiBlbXB0eSByZXNwb25zZSwgZXJyb3Igd2lsbCBiZSByZXBvcnRlZCB3aGVuIHNlcnZlciBjb250aW51ZXMgd2l0aCBOTyByZXNwb25zZVxuICAgICAgfVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICB2YXIgcmVzcG9uc2VcbiAgICB0cnkge1xuICAgICAgY29uc3QgdmFsdWVBc1N0cmluZyA9IHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QgJiYgdGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdC52YWx1ZUFzU3RyaW5nXG4gICAgICByZXNwb25zZSA9IHBhcnNlcihjb21tYW5kLCB7IHZhbHVlQXNTdHJpbmcgfSlcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTOicsICgpID0+IGNvbXBpbGVyKHJlc3BvbnNlLCBmYWxzZSwgdHJ1ZSkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHBhcnNpbmcgaW1hcCBjb21tYW5kIScsIHJlc3BvbnNlKVxuICAgICAgcmV0dXJuIHRoaXMuX29uRXJyb3IoZSlcbiAgICB9XG5cbiAgICB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgdGhpcy5faGFuZGxlUmVzcG9uc2UocmVzcG9uc2UpXG5cbiAgICAvLyBmaXJzdCByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIsIGNvbm5lY3Rpb24gaXMgbm93IHVzYWJsZVxuICAgIGlmICghdGhpcy5fY29ubmVjdGlvblJlYWR5KSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uUmVhZHkgPSB0cnVlXG4gICAgICB0aGlzLm9ucmVhZHkgJiYgdGhpcy5vbnJlYWR5KClcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBGZWVkcyBhIHBhcnNlZCByZXNwb25zZSBvYmplY3QgdG8gYW4gYXBwcm9wcmlhdGUgaGFuZGxlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgY29tbWFuZCBvYmplY3RcbiAqL1xuSW1hcC5wcm90b3R5cGUuX2hhbmRsZVJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gIHZhciBjb21tYW5kID0gcHJvcE9yKCcnLCAnY29tbWFuZCcpKHJlc3BvbnNlKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuXG4gIGlmICghdGhpcy5fY3VycmVudENvbW1hbmQpIHtcbiAgICAvLyB1bnNvbGljaXRlZCB1bnRhZ2dlZCByZXNwb25zZVxuICAgIGlmIChyZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkKSB7XG4gICAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgICAgIHRoaXMuX2NhblNlbmQgPSB0cnVlXG4gICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQgJiYgcmVzcG9uc2UudGFnID09PSAnKicgJiYgY29tbWFuZCBpbiB0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkKSB7XG4gICAgLy8gZXhwZWN0ZWQgdW50YWdnZWQgcmVzcG9uc2VcbiAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkW2NvbW1hbmRdLnB1c2gocmVzcG9uc2UpXG4gIH0gZWxzZSBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgY29tbWFuZCBpbiB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCkge1xuICAgIC8vIHVuZXhwZWN0ZWQgdW50YWdnZWQgcmVzcG9uc2VcbiAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgfSBlbHNlIGlmIChyZXNwb25zZS50YWcgPT09IHRoaXMuX2N1cnJlbnRDb21tYW5kLnRhZykge1xuICAgIC8vIHRhZ2dlZCByZXNwb25zZVxuICAgIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkICYmIE9iamVjdC5rZXlzKHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQpLmxlbmd0aCkge1xuICAgICAgcmVzcG9uc2UucGF5bG9hZCA9IHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWRcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudENvbW1hbmQuY2FsbGJhY2socmVzcG9uc2UpXG4gICAgdGhpcy5fY2FuU2VuZCA9IHRydWVcbiAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gIH1cbn1cblxuLyoqXG4gKiBTZW5kcyBhIGNvbW1hbmQgZnJvbSBjbGllbnQgcXVldWUgdG8gdGhlIHNlcnZlci5cbiAqL1xuSW1hcC5wcm90b3R5cGUuX3NlbmRSZXF1ZXN0ID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuX2NsaWVudFF1ZXVlLmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLl9lbnRlcklkbGUoKVxuICB9XG4gIHRoaXMuX2NsZWFySWRsZSgpXG5cbiAgLy8gYW4gb3BlcmF0aW9uIHdhcyBtYWRlIGluIHRoZSBwcmVjaGVjaywgbm8gbmVlZCB0byByZXN0YXJ0IHRoZSBxdWV1ZSBtYW51YWxseVxuICB0aGlzLl9yZXN0YXJ0UXVldWUgPSBmYWxzZVxuXG4gIHZhciBjb21tYW5kID0gdGhpcy5fY2xpZW50UXVldWVbMF1cbiAgaWYgKHR5cGVvZiBjb21tYW5kLnByZWNoZWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gcmVtZW1iZXIgdGhlIGNvbnRleHRcbiAgICB2YXIgY29udGV4dCA9IGNvbW1hbmRcbiAgICB2YXIgcHJlY2hlY2sgPSBjb250ZXh0LnByZWNoZWNrXG4gICAgZGVsZXRlIGNvbnRleHQucHJlY2hlY2tcblxuICAgIC8vIHdlIG5lZWQgdG8gcmVzdGFydCB0aGUgcXVldWUgaGFuZGxpbmcgaWYgbm8gb3BlcmF0aW9uIHdhcyBtYWRlIGluIHRoZSBwcmVjaGVja1xuICAgIHRoaXMuX3Jlc3RhcnRRdWV1ZSA9IHRydWVcblxuICAgIC8vIGludm9rZSB0aGUgcHJlY2hlY2sgY29tbWFuZCBhbmQgcmVzdW1lIG5vcm1hbCBvcGVyYXRpb24gYWZ0ZXIgdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICBwcmVjaGVjayhjb250ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgIC8vIHdlJ3JlIGRvbmUgd2l0aCB0aGUgcHJlY2hlY2tcbiAgICAgIGlmICh0aGlzLl9yZXN0YXJ0UXVldWUpIHtcbiAgICAgICAgLy8gd2UgbmVlZCB0byByZXN0YXJ0IHRoZSBxdWV1ZSBoYW5kbGluZ1xuICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgICB9XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgLy8gcHJlY2hlY2sgZmFpbGVkLCBzbyB3ZSByZW1vdmUgdGhlIGluaXRpYWwgY29tbWFuZFxuICAgICAgLy8gZnJvbSB0aGUgcXVldWUsIGludm9rZSBpdHMgY2FsbGJhY2sgYW5kIHJlc3VtZSBub3JtYWwgb3BlcmF0aW9uXG4gICAgICBsZXQgY21kXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoY29udGV4dClcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIGNtZCA9IHRoaXMuX2NsaWVudFF1ZXVlLnNwbGljZShpbmRleCwgMSlbMF1cbiAgICAgIH1cbiAgICAgIGlmIChjbWQgJiYgY21kLmNhbGxiYWNrKSB7XG4gICAgICAgIGNtZC5jYWxsYmFjayhlcnIpXG4gICAgICAgIHRoaXMuX2NhblNlbmQgPSB0cnVlXG4gICAgICAgIHRoaXMuX3BhcnNlSW5jb21pbmdDb21tYW5kcyh0aGlzLl9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKSkgLy8gQ29uc3VtZSB0aGUgcmVzdCBvZiB0aGUgaW5jb21pbmcgYnVmZmVyXG4gICAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0KCkgLy8gY29udGludWUgc2VuZGluZ1xuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLl9jYW5TZW5kID0gZmFsc2VcbiAgdGhpcy5fY3VycmVudENvbW1hbmQgPSB0aGlzLl9jbGllbnRRdWV1ZS5zaGlmdCgpXG5cbiAgdHJ5IHtcbiAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhID0gY29tcGlsZXIodGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdCwgdHJ1ZSlcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQzonLCAoKSA9PiBjb21waWxlcih0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0LCBmYWxzZSwgdHJ1ZSkpIC8vIGV4Y2x1ZGVzIHBhc3N3b3JkcyBldGMuXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgY29tcGlsaW5nIGltYXAgY29tbWFuZCEnLCB0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0KVxuICAgIHJldHVybiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignRXJyb3IgY29tcGlsaW5nIGltYXAgY29tbWFuZCEnKSlcbiAgfVxuXG4gIHZhciBkYXRhID0gdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5zaGlmdCgpXG5cbiAgdGhpcy5zZW5kKGRhdGEgKyAoIXRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEubGVuZ3RoID8gRU9MIDogJycpKVxuICByZXR1cm4gdGhpcy53YWl0RHJhaW5cbn1cblxuLyoqXG4gKiBFbWl0cyBvbmlkbGUsIG5vdGluZyB0byBkbyBjdXJyZW50bHlcbiAqL1xuSW1hcC5wcm90b3R5cGUuX2VudGVySWRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lcilcbiAgdGhpcy5faWRsZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiAodGhpcy5vbmlkbGUgJiYgdGhpcy5vbmlkbGUoKSksIHRoaXMuVElNRU9VVF9FTlRFUl9JRExFKVxufVxuXG4vKipcbiAqIENhbmNlbCBpZGxlIHRpbWVyXG4gKi9cbkltYXAucHJvdG90eXBlLl9jbGVhcklkbGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZXIpXG4gIHRoaXMuX2lkbGVUaW1lciA9IG51bGxcbn1cblxuLyoqXG4gKiBNZXRob2QgcHJvY2Vzc2VzIGEgcmVzcG9uc2UgaW50byBhbiBlYXNpZXIgdG8gaGFuZGxlIGZvcm1hdC5cbiAqIEFkZCB1bnRhZ2dlZCBudW1iZXJlZCByZXNwb25zZXMgKGUuZy4gRkVUQ0gpIGludG8gYSBuaWNlbHkgZmVhc2libGUgZm9ybVxuICogQ2hlY2tzIGlmIGEgcmVzcG9uc2UgaW5jbHVkZXMgb3B0aW9uYWwgcmVzcG9uc2UgY29kZXNcbiAqIGFuZCBjb3BpZXMgdGhlc2UgaW50byBzZXBhcmF0ZSBwcm9wZXJ0aWVzLiBGb3IgZXhhbXBsZSB0aGVcbiAqIGZvbGxvd2luZyByZXNwb25zZSBpbmNsdWRlcyBhIGNhcGFiaWxpdHkgbGlzdGluZyBhbmQgYSBodW1hblxuICogcmVhZGFibGUgbWVzc2FnZTpcbiAqXG4gKiAgICAgKiBPSyBbQ0FQQUJJTElUWSBJRCBOQU1FU1BBQ0VdIEFsbCByZWFkeVxuICpcbiAqIFRoaXMgbWV0aG9kIGFkZHMgYSAnY2FwYWJpbGl0eScgcHJvcGVydHkgd2l0aCBhbiBhcnJheSB2YWx1ZSBbJ0lEJywgJ05BTUVTUEFDRSddXG4gKiB0byB0aGUgcmVzcG9uc2Ugb2JqZWN0LiBBZGRpdGlvbmFsbHkgJ0FsbCByZWFkeScgaXMgYWRkZWQgYXMgJ2h1bWFuUmVhZGFibGUnIHByb3BlcnR5LlxuICpcbiAqIFNlZSBwb3NzaWJsZW0gSU1BUCBSZXNwb25zZSBDb2RlcyBhdCBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNTUzMFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgcmVzcG9uc2Ugb2JqZWN0XG4gKi9cbkltYXAucHJvdG90eXBlLl9wcm9jZXNzUmVzcG9uc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgbGV0IGNvbW1hbmQgPSBwcm9wT3IoJycsICdjb21tYW5kJykocmVzcG9uc2UpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gIGxldCBvcHRpb25cbiAgbGV0IGtleVxuXG4gIC8vIG5vIGF0dHJpYnV0ZXNcbiAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2UuYXR0cmlidXRlcyB8fCAhcmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIHVudGFnZ2VkIHJlc3BvbnNlcyB3LyBzZXF1ZW5jZSBudW1iZXJzXG4gIGlmIChyZXNwb25zZS50YWcgPT09ICcqJyAmJiAvXlxcZCskLy50ZXN0KHJlc3BvbnNlLmNvbW1hbmQpICYmIHJlc3BvbnNlLmF0dHJpYnV0ZXNbMF0udHlwZSA9PT0gJ0FUT00nKSB7XG4gICAgcmVzcG9uc2UubnIgPSBOdW1iZXIocmVzcG9uc2UuY29tbWFuZClcbiAgICByZXNwb25zZS5jb21tYW5kID0gKHJlc3BvbnNlLmF0dHJpYnV0ZXMuc2hpZnQoKS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICB9XG5cbiAgLy8gbm8gb3B0aW9uYWwgcmVzcG9uc2UgY29kZVxuICBpZiAoWydPSycsICdOTycsICdCQUQnLCAnQllFJywgJ1BSRUFVVEgnXS5pbmRleE9mKGNvbW1hbmQpIDwgMCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgbGFzdCBlbGVtZW50IG9mIHRoZSByZXNwb25zZSBpcyBURVhUIHRoZW4gdGhpcyBpcyBmb3IgaHVtYW5zXG4gIGlmIChyZXNwb25zZS5hdHRyaWJ1dGVzW3Jlc3BvbnNlLmF0dHJpYnV0ZXMubGVuZ3RoIC0gMV0udHlwZSA9PT0gJ1RFWFQnKSB7XG4gICAgcmVzcG9uc2UuaHVtYW5SZWFkYWJsZSA9IHJlc3BvbnNlLmF0dHJpYnV0ZXNbcmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGggLSAxXS52YWx1ZVxuICB9XG5cbiAgLy8gUGFyc2UgYW5kIGZvcm1hdCBBVE9NIHZhbHVlc1xuICBpZiAocmVzcG9uc2UuYXR0cmlidXRlc1swXS50eXBlID09PSAnQVRPTScgJiYgcmVzcG9uc2UuYXR0cmlidXRlc1swXS5zZWN0aW9uKSB7XG4gICAgb3B0aW9uID0gcmVzcG9uc2UuYXR0cmlidXRlc1swXS5zZWN0aW9uLm1hcCgoa2V5KSA9PiB7XG4gICAgICBpZiAoIWtleSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGtleS5tYXAoKGtleSkgPT4gKGtleS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50cmltKCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKGtleS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBrZXkgPSBvcHRpb24uc2hpZnQoKVxuICAgIHJlc3BvbnNlLmNvZGUgPSBrZXlcblxuICAgIGlmIChvcHRpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXNwb25zZVtrZXkudG9Mb3dlckNhc2UoKV0gPSBvcHRpb25bMF1cbiAgICB9IGVsc2UgaWYgKG9wdGlvbi5sZW5ndGggPiAxKSB7XG4gICAgICByZXNwb25zZVtrZXkudG9Mb3dlckNhc2UoKV0gPSBvcHRpb25cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhbiBFcnJvciBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBWYWx1ZSB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJuIHtCb29sZWFufSByZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGlzIGFuIEVycm9yXG4gKi9cbkltYXAucHJvdG90eXBlLmlzRXJyb3IgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuICEhT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKS5tYXRjaCgvRXJyb3JcXF0kLylcbn1cblxuLy8gQ09NUFJFU1NJT04gUkVMQVRFRCBNRVRIT0RTXG5cbi8qKlxuICogU2V0cyB1cCBkZWZsYXRlL2luZmxhdGUgZm9yIHRoZSBJT1xuICovXG5JbWFwLnByb3RvdHlwZS5lbmFibGVDb21wcmVzc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fc29ja2V0T25EYXRhID0gdGhpcy5zb2NrZXQub25kYXRhXG4gIHRoaXMuY29tcHJlc3NlZCA9IHRydWVcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LldvcmtlciAmJiB0eXBlb2YgdGhpcy5fd29ya2VyUGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAvL1xuICAgIC8vIHdlYiB3b3JrZXIgc3VwcG9ydFxuICAgIC8vXG5cbiAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlciA9IG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbQ29tcHJlc3Npb25Xb3JrZXJdKSkpXG4gICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgIHZhciBtZXNzYWdlID0gZS5kYXRhLm1lc3NhZ2VcbiAgICAgIHZhciBidWZmZXIgPSBlLmRhdGEuYnVmZmVyXG5cbiAgICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgICBjYXNlIE1FU1NBR0VfSU5GTEFURURfREFUQV9SRUFEWTpcbiAgICAgICAgICB0aGlzLl9zb2NrZXRPbkRhdGEoe1xuICAgICAgICAgICAgZGF0YTogYnVmZmVyXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgTUVTU0FHRV9ERUZMQVRFRF9EQVRBX1JFQURZOlxuICAgICAgICAgIHRoaXMud2FpdERyYWluID0gdGhpcy5zb2NrZXQuc2VuZChidWZmZXIpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5vbmVycm9yID0gKGUpID0+IHtcbiAgICAgIHRoaXMuX29uRXJyb3IobmV3IEVycm9yKCdFcnJvciBoYW5kbGluZyBjb21wcmVzc2lvbiB3ZWIgd29ya2VyOiBMaW5lICcgKyBlLmxpbmVubyArICcgaW4gJyArIGUuZmlsZW5hbWUgKyAnOiAnICsgZS5tZXNzYWdlKSlcbiAgICB9XG5cbiAgICAvLyBmaXJzdCBtZXNzYWdlIHN0YXJ0cyB0aGUgd29ya2VyXG4gICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UodGhpcy5fY3JlYXRlTWVzc2FnZShNRVNTQUdFX0lOSVRJQUxJWkVfV09SS0VSKSlcbiAgfSBlbHNlIHtcbiAgICAvL1xuICAgIC8vIHdpdGhvdXQgd2ViIHdvcmtlciBzdXBwb3J0XG4gICAgLy9cblxuICAgIGNvbnN0IGluZmxhdGVkUmVhZHkgPSAoYnVmZmVyKSA9PiB7IHRoaXMuX3NvY2tldE9uRGF0YSh7IGRhdGE6IGJ1ZmZlciB9KSB9XG4gICAgY29uc3QgZGVmbGF0ZWRSZWFkeSA9IChidWZmZXIpID0+IHsgdGhpcy53YWl0RHJhaW4gPSB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcikgfVxuICAgIHRoaXMuX2NvbXByZXNzaW9uID0gbmV3IENvbXByZXNzaW9uKGluZmxhdGVkUmVhZHksIGRlZmxhdGVkUmVhZHkpXG4gIH1cblxuICAvLyBvdmVycmlkZSBkYXRhIGhhbmRsZXIsIGRlY29tcHJlc3MgaW5jb21pbmcgZGF0YVxuICB0aGlzLnNvY2tldC5vbmRhdGEgPSAoZXZ0KSA9PiB7XG4gICAgaWYgKCF0aGlzLmNvbXByZXNzZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGluZmxhdGVcbiAgICBpZiAodGhpcy5fY29tcHJlc3Npb25Xb3JrZXIpIHtcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyLnBvc3RNZXNzYWdlKHRoaXMuX2NyZWF0ZU1lc3NhZ2UoTUVTU0FHRV9JTkZMQVRFLCBldnQuZGF0YSksIFtldnQuZGF0YV0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uLmluZmxhdGUoZXZ0LmRhdGEpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVW5kb2VzIGFueSBjaGFuZ2VzIHJlbGF0ZWQgdG8gY29tcHJlc3Npb24uIFRoaXMgb25seSBiZSBjYWxsZWQgd2hlbiBjbG9zaW5nIHRoZSBjb25uZWN0aW9uXG4gKi9cbkltYXAucHJvdG90eXBlLl9kaXNhYmxlQ29tcHJlc3Npb24gPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5jb21wcmVzc2VkKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLmNvbXByZXNzZWQgPSBmYWxzZVxuICB0aGlzLnNvY2tldC5vbmRhdGEgPSB0aGlzLl9zb2NrZXRPbkRhdGFcbiAgdGhpcy5fc29ja2V0T25EYXRhID0gbnVsbFxuXG4gIGlmICh0aGlzLl9jb21wcmVzc2lvbldvcmtlcikge1xuICAgIC8vIHRlcm1pbmF0ZSB0aGUgd29ya2VyXG4gICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIudGVybWluYXRlKClcbiAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlciA9IG51bGxcbiAgfVxufVxuXG4vKipcbiAqIE91dGdvaW5nIHBheWxvYWQgbmVlZHMgdG8gYmUgY29tcHJlc3NlZCBhbmQgc2VudCB0byBzb2NrZXRcbiAqXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWZmZXIgT3V0Z29pbmcgdW5jb21wcmVzc2VkIGFycmF5YnVmZmVyXG4gKi9cbkltYXAucHJvdG90eXBlLl9zZW5kQ29tcHJlc3NlZCA9IGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgLy8gZGVmbGF0ZVxuICBpZiAodGhpcy5fY29tcHJlc3Npb25Xb3JrZXIpIHtcbiAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5wb3N0TWVzc2FnZSh0aGlzLl9jcmVhdGVNZXNzYWdlKE1FU1NBR0VfREVGTEFURSwgYnVmZmVyKSwgW2J1ZmZlcl0pXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fY29tcHJlc3Npb24uZGVmbGF0ZShidWZmZXIpXG4gIH1cbn1cblxuSW1hcC5wcm90b3R5cGUuX2NyZWF0ZU1lc3NhZ2UgPSBmdW5jdGlvbiAobWVzc2FnZSwgYnVmZmVyKSB7XG4gIHJldHVybiB7XG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICBidWZmZXI6IGJ1ZmZlclxuICB9XG59XG4iXX0=