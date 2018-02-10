'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _emailjsTcpSocket = require('emailjs-tcp-socket');

var _emailjsTcpSocket2 = _interopRequireDefault(_emailjsTcpSocket);

var _common = require('./common');

var _emailjsImapHandler = require('emailjs-imap-handler');

var _compression = require('./compression');

var _compression2 = _interopRequireDefault(_compression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* babel-plugin-inline-import '../res/compression.worker.blob' */const CompressionBlob = '!function(e){function t(n){if(a[n])return a[n].exports;var i=a[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var a={};t.m=e,t.c=a,t.d=function(e,a,n){t.o(e,a)||Object.defineProperty(e,a,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var a=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(a,"a",a),a},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=4)}([function(e,t,a){"use strict";function n(e,t){return Object.prototype.hasOwnProperty.call(e,t)}var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;t.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var a=t.shift();if(a){if("object"!=typeof a)throw new TypeError(a+"must be non-object");for(var i in a)n(a,i)&&(e[i]=a[i])}}return e},t.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var r={arraySet:function(e,t,a,n,i){if(t.subarray&&e.subarray)return void e.set(t.subarray(a,a+n),i);for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){var t,a,n,i,r,s;for(n=0,t=0,a=e.length;t<a;t++)n+=e[t].length;for(s=new Uint8Array(n),i=0,t=0,a=e.length;t<a;t++)r=e[t],s.set(r,i),i+=r.length;return s}},s={arraySet:function(e,t,a,n,i){for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){return[].concat.apply([],e)}};t.setTyped=function(e){e?(t.Buf8=Uint8Array,t.Buf16=Uint16Array,t.Buf32=Int32Array,t.assign(t,r)):(t.Buf8=Array,t.Buf16=Array,t.Buf32=Array,t.assign(t,s))},t.setTyped(i)},function(e,t,a){"use strict";function n(e,t,a,n){for(var i=65535&e|0,r=e>>>16&65535|0,s=0;0!==a;){s=a>2e3?2e3:a,a-=s;do{i=i+t[n++]|0,r=r+i|0}while(--s);i%=65521,r%=65521}return i|r<<16|0}e.exports=n},function(e,t,a){"use strict";function n(e,t,a,n){var r=i,s=n+a;e^=-1;for(var l=n;l<s;l++)e=e>>>8^r[255&(e^t[l])];return-1^e}var i=function(){for(var e,t=[],a=0;a<256;a++){e=a;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[a]=e}return t}();e.exports=n},function(e,t,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},function(e,t,a){"use strict";var n=a(5),i=function(e){return e&&e.__esModule?e:{default:e}}(n),r=function(e,t){return{message:e,buffer:t}},s=function(e){return self.postMessage(r("inflated_ready",e),[e])},l=function(e){return self.postMessage(r("deflated_ready",e),[e])},o=new i.default(s,l);self.onmessage=function(e){var t=e.data.message,a=e.data.buffer;switch(t){case"start":break;case"inflate":o.inflate(a);break;case"deflate":o.deflate(a)}}},function(e,t,a){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function i(e,t){var a=this;this.inflatedReady=e,this.deflatedReady=t,this._inflate=s(function(e){return a.inflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))}),this._deflate=r(function(e){return a.deflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))})}function r(e){var t=new o.default,a=(0,h.deflateInit2)(t,u.Z_DEFAULT_COMPRESSION,u.Z_DEFLATED,b,8,u.Z_DEFAULT_STRATEGY);if(a!==u.Z_OK)throw new Error("Problem initializing deflate stream: "+f.default[a]);return function(a){if(void 0===a)return e();t.input=a,t.next_in=0,t.avail_in=t.input.length;var n=void 0,i=void 0,r=void 0,s=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(c),r=t.next_out=0,t.avail_out=c),(n=(0,h.deflate)(t,u.Z_SYNC_FLUSH))!==u.Z_STREAM_END&&n!==u.Z_OK)throw new Error("Deflate problem: "+f.default[n]);0===t.avail_out&&t.next_out>r&&(i=t.output.subarray(r,r=t.next_out),s=e(i))}while((t.avail_in>0||0===t.avail_out)&&n!==u.Z_STREAM_END);return t.next_out>r&&(i=t.output.subarray(r,r=t.next_out),s=e(i)),s}}function s(e){var t=new o.default,a=(0,d.inflateInit2)(t,b);if(a!==u.Z_OK)throw new Error("Problem initializing inflate stream: "+f.default[a]);return function(a){if(void 0===a)return e();var n=void 0;t.input=a,t.next_in=0,t.avail_in=t.input.length;var i=void 0,r=void 0,s=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(c),n=t.next_out=0,t.avail_out=c),(i=(0,d.inflate)(t,u.Z_NO_FLUSH))!==u.Z_STREAM_END&&i!==u.Z_OK)throw new Error("inflate problem: "+f.default[i]);t.next_out&&(0!==t.avail_out&&i!==u.Z_STREAM_END||(r=t.output.subarray(n,n=t.next_out),s=e(r)))}while(t.avail_in>0&&i!==u.Z_STREAM_END);return t.next_out>n&&(r=t.output.subarray(n,n=t.next_out),s=e(r)),s}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var l=a(6),o=n(l),h=a(7),d=a(9),_=a(3),f=n(_),u=a(12),c=16384,b=15;i.prototype.inflate=function(e){this._inflate(new Uint8Array(e))},i.prototype.deflate=function(e){this._deflate(new Uint8Array(e))}},function(e,t,a){"use strict";function n(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}e.exports=n},function(e,t,a){"use strict";function n(e,t){return e.msg=D[t],t}function i(e){return(e<<1)-(e>4?9:0)}function r(e){for(var t=e.length;--t>=0;)e[t]=0}function s(e){var t=e.state,a=t.pending;a>e.avail_out&&(a=e.avail_out),0!==a&&(B.arraySet(e.output,t.pending_buf,t.pending_out,a,e.next_out),e.next_out+=a,t.pending_out+=a,e.total_out+=a,e.avail_out-=a,t.pending-=a,0===t.pending&&(t.pending_out=0))}function l(e,t){O._tr_flush_block(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,s(e.strm)}function o(e,t){e.pending_buf[e.pending++]=t}function h(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function d(e,t,a,n){var i=e.avail_in;return i>n&&(i=n),0===i?0:(e.avail_in-=i,B.arraySet(t,e.input,e.next_in,i,a),1===e.state.wrap?e.adler=T(e.adler,t,i,a):2===e.state.wrap&&(e.adler=N(e.adler,t,i,a)),e.next_in+=i,e.total_in+=i,i)}function _(e,t){var a,n,i=e.max_chain_length,r=e.strstart,s=e.prev_length,l=e.nice_match,o=e.strstart>e.w_size-he?e.strstart-(e.w_size-he):0,h=e.window,d=e.w_mask,_=e.prev,f=e.strstart+oe,u=h[r+s-1],c=h[r+s];e.prev_length>=e.good_match&&(i>>=2),l>e.lookahead&&(l=e.lookahead);do{if(a=t,h[a+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do{}while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&r<f);if(n=oe-(f-r),r=f-oe,n>s){if(e.match_start=t,s=n,n>=l)break;u=h[r+s-1],c=h[r+s]}}}while((t=_[t&d])>o&&0!=--i);return s<=e.lookahead?s:e.lookahead}function f(e){var t,a,n,i,r,s=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=s+(s-he)){B.arraySet(e.window,e.window,s,s,0),e.match_start-=s,e.strstart-=s,e.block_start-=s,a=e.hash_size,t=a;do{n=e.head[--t],e.head[t]=n>=s?n-s:0}while(--a);a=s,t=a;do{n=e.prev[--t],e.prev[t]=n>=s?n-s:0}while(--a);i+=s}if(0===e.strm.avail_in)break;if(a=d(e.strm,e.window,e.strstart+e.lookahead,i),e.lookahead+=a,e.lookahead+e.insert>=le)for(r=e.strstart-e.insert,e.ins_h=e.window[r],e.ins_h=(e.ins_h<<e.hash_shift^e.window[r+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[r+le-1])&e.hash_mask,e.prev[r&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=r,r++,e.insert--,!(e.lookahead+e.insert<le)););}while(e.lookahead<he&&0!==e.strm.avail_in)}function u(e,t){var a=65535;for(a>e.pending_buf_size-5&&(a=e.pending_buf_size-5);;){if(e.lookahead<=1){if(f(e),0===e.lookahead&&t===U)return we;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+a;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,l(e,!1),0===e.strm.avail_out))return we;if(e.strstart-e.block_start>=e.w_size-he&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):(e.strstart>e.block_start&&(l(e,!1),e.strm.avail_out),we)}function c(e,t){for(var a,n;;){if(e.lookahead<he){if(f(e),e.lookahead<he&&t===U)return we;if(0===e.lookahead)break}if(a=0,e.lookahead>=le&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==a&&e.strstart-a<=e.w_size-he&&(e.match_length=_(e,a)),e.match_length>=le)if(n=O._tr_tally(e,e.strstart-e.match_start,e.match_length-le),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=le){e.match_length--;do{e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart}while(0!=--e.match_length);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=e.strstart<le-1?e.strstart:le-1,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function b(e,t){for(var a,n,i;;){if(e.lookahead<he){if(f(e),e.lookahead<he&&t===U)return we;if(0===e.lookahead)break}if(a=0,e.lookahead>=le&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=le-1,0!==a&&e.prev_length<e.max_lazy_match&&e.strstart-a<=e.w_size-he&&(e.match_length=_(e,a),e.match_length<=5&&(e.strategy===G||e.match_length===le&&e.strstart-e.match_start>4096)&&(e.match_length=le-1)),e.prev_length>=le&&e.match_length<=e.prev_length){i=e.strstart+e.lookahead-le,n=O._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-le),e.lookahead-=e.prev_length-1,e.prev_length-=2;do{++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+le-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart)}while(0!=--e.prev_length);if(e.match_available=0,e.match_length=le-1,e.strstart++,n&&(l(e,!1),0===e.strm.avail_out))return we}else if(e.match_available){if(n=O._tr_tally(e,0,e.window[e.strstart-1]),n&&l(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return we}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=O._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<le-1?e.strstart:le-1,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function g(e,t){for(var a,n,i,r,s=e.window;;){if(e.lookahead<=oe){if(f(e),e.lookahead<=oe&&t===U)return we;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=le&&e.strstart>0&&(i=e.strstart-1,(n=s[i])===s[++i]&&n===s[++i]&&n===s[++i])){r=e.strstart+oe;do{}while(n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&n===s[++i]&&i<r);e.match_length=oe-(r-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=le?(a=O._tr_tally(e,1,e.match_length-le),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(a=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),a&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function m(e,t){for(var a;;){if(0===e.lookahead&&(f(e),0===e.lookahead)){if(t===U)return we;break}if(e.match_length=0,a=O._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,a&&(l(e,!1),0===e.strm.avail_out))return we}return e.insert=0,t===L?(l(e,!0),0===e.strm.avail_out?ve:ke):e.last_lit&&(l(e,!1),0===e.strm.avail_out)?we:pe}function w(e,t,a,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=a,this.max_chain=n,this.func=i}function p(e){e.window_size=2*e.w_size,r(e.head),e.max_lazy_match=R[e.level].max_lazy,e.good_match=R[e.level].good_length,e.nice_match=R[e.level].nice_length,e.max_chain_length=R[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=le-1,e.match_available=0,e.ins_h=0}function v(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=V,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new B.Buf16(2*re),this.dyn_dtree=new B.Buf16(2*(2*ne+1)),this.bl_tree=new B.Buf16(2*(2*ie+1)),r(this.dyn_ltree),r(this.dyn_dtree),r(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new B.Buf16(se+1),this.heap=new B.Buf16(2*ae+1),r(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new B.Buf16(2*ae+1),r(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function k(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=Q,t=e.state,t.pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?_e:ge,e.adler=2===t.wrap?0:1,t.last_flush=U,O._tr_init(t),C):n(e,H)}function x(e){var t=k(e);return t===C&&p(e.state),t}function y(e,t){return e&&e.state?2!==e.state.wrap?H:(e.state.gzhead=t,C):H}function z(e,t,a,i,r,s){if(!e)return H;var l=1;if(t===Y&&(t=6),i<0?(l=0,i=-i):i>15&&(l=2,i-=16),r<1||r>$||a!==V||i<8||i>15||t<0||t>9||s<0||s>q)return n(e,H);8===i&&(i=9);var o=new v;return e.state=o,o.strm=e,o.wrap=l,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=r+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+le-1)/le),o.window=new B.Buf8(2*o.w_size),o.head=new B.Buf16(o.hash_size),o.prev=new B.Buf16(o.w_size),o.lit_bufsize=1<<r+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new B.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=a,x(e)}function E(e,t){return z(e,t,V,ee,te,J)}function A(e,t){var a,l,d,_;if(!e||!e.state||t>M||t<0)return e?n(e,H):H;if(l=e.state,!e.output||!e.input&&0!==e.avail_in||l.status===me&&t!==L)return n(e,0===e.avail_out?j:H);if(l.strm=e,a=l.last_flush,l.last_flush=t,l.status===_e)if(2===l.wrap)e.adler=0,o(l,31),o(l,139),o(l,8),l.gzhead?(o(l,(l.gzhead.text?1:0)+(l.gzhead.hcrc?2:0)+(l.gzhead.extra?4:0)+(l.gzhead.name?8:0)+(l.gzhead.comment?16:0)),o(l,255&l.gzhead.time),o(l,l.gzhead.time>>8&255),o(l,l.gzhead.time>>16&255),o(l,l.gzhead.time>>24&255),o(l,9===l.level?2:l.strategy>=X||l.level<2?4:0),o(l,255&l.gzhead.os),l.gzhead.extra&&l.gzhead.extra.length&&(o(l,255&l.gzhead.extra.length),o(l,l.gzhead.extra.length>>8&255)),l.gzhead.hcrc&&(e.adler=N(e.adler,l.pending_buf,l.pending,0)),l.gzindex=0,l.status=fe):(o(l,0),o(l,0),o(l,0),o(l,0),o(l,0),o(l,9===l.level?2:l.strategy>=X||l.level<2?4:0),o(l,xe),l.status=ge);else{var f=V+(l.w_bits-8<<4)<<8,u=-1;u=l.strategy>=X||l.level<2?0:l.level<6?1:6===l.level?2:3,f|=u<<6,0!==l.strstart&&(f|=de),f+=31-f%31,l.status=ge,h(l,f),0!==l.strstart&&(h(l,e.adler>>>16),h(l,65535&e.adler)),e.adler=1}if(l.status===fe)if(l.gzhead.extra){for(d=l.pending;l.gzindex<(65535&l.gzhead.extra.length)&&(l.pending!==l.pending_buf_size||(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending!==l.pending_buf_size));)o(l,255&l.gzhead.extra[l.gzindex]),l.gzindex++;l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),l.gzindex===l.gzhead.extra.length&&(l.gzindex=0,l.status=ue)}else l.status=ue;if(l.status===ue)if(l.gzhead.name){d=l.pending;do{if(l.pending===l.pending_buf_size&&(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending===l.pending_buf_size)){_=1;break}_=l.gzindex<l.gzhead.name.length?255&l.gzhead.name.charCodeAt(l.gzindex++):0,o(l,_)}while(0!==_);l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),0===_&&(l.gzindex=0,l.status=ce)}else l.status=ce;if(l.status===ce)if(l.gzhead.comment){d=l.pending;do{if(l.pending===l.pending_buf_size&&(l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),s(e),d=l.pending,l.pending===l.pending_buf_size)){_=1;break}_=l.gzindex<l.gzhead.comment.length?255&l.gzhead.comment.charCodeAt(l.gzindex++):0,o(l,_)}while(0!==_);l.gzhead.hcrc&&l.pending>d&&(e.adler=N(e.adler,l.pending_buf,l.pending-d,d)),0===_&&(l.status=be)}else l.status=be;if(l.status===be&&(l.gzhead.hcrc?(l.pending+2>l.pending_buf_size&&s(e),l.pending+2<=l.pending_buf_size&&(o(l,255&e.adler),o(l,e.adler>>8&255),e.adler=0,l.status=ge)):l.status=ge),0!==l.pending){if(s(e),0===e.avail_out)return l.last_flush=-1,C}else if(0===e.avail_in&&i(t)<=i(a)&&t!==L)return n(e,j);if(l.status===me&&0!==e.avail_in)return n(e,j);if(0!==e.avail_in||0!==l.lookahead||t!==U&&l.status!==me){var c=l.strategy===X?m(l,t):l.strategy===W?g(l,t):R[l.level].func(l,t);if(c!==ve&&c!==ke||(l.status=me),c===we||c===ve)return 0===e.avail_out&&(l.last_flush=-1),C;if(c===pe&&(t===I?O._tr_align(l):t!==M&&(O._tr_stored_block(l,0,0,!1),t===F&&(r(l.head),0===l.lookahead&&(l.strstart=0,l.block_start=0,l.insert=0))),s(e),0===e.avail_out))return l.last_flush=-1,C}return t!==L?C:l.wrap<=0?P:(2===l.wrap?(o(l,255&e.adler),o(l,e.adler>>8&255),o(l,e.adler>>16&255),o(l,e.adler>>24&255),o(l,255&e.total_in),o(l,e.total_in>>8&255),o(l,e.total_in>>16&255),o(l,e.total_in>>24&255)):(h(l,e.adler>>>16),h(l,65535&e.adler)),s(e),l.wrap>0&&(l.wrap=-l.wrap),0!==l.pending?C:P)}function S(e){var t;return e&&e.state?(t=e.state.status)!==_e&&t!==fe&&t!==ue&&t!==ce&&t!==be&&t!==ge&&t!==me?n(e,H):(e.state=null,t===ge?n(e,K):C):H}function Z(e,t){var a,n,i,s,l,o,h,d,_=t.length;if(!e||!e.state)return H;if(a=e.state,2===(s=a.wrap)||1===s&&a.status!==_e||a.lookahead)return H;for(1===s&&(e.adler=T(e.adler,t,_,0)),a.wrap=0,_>=a.w_size&&(0===s&&(r(a.head),a.strstart=0,a.block_start=0,a.insert=0),d=new B.Buf8(a.w_size),B.arraySet(d,t,_-a.w_size,a.w_size,0),t=d,_=a.w_size),l=e.avail_in,o=e.next_in,h=e.input,e.avail_in=_,e.next_in=0,e.input=t,f(a);a.lookahead>=le;){n=a.strstart,i=a.lookahead-(le-1);do{a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+le-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++}while(--i);a.strstart=n,a.lookahead=le-1,f(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=le-1,a.match_available=0,e.next_in=o,e.input=h,e.avail_in=l,a.wrap=s,C}var R,B=a(0),O=a(8),T=a(1),N=a(2),D=a(3),U=0,I=1,F=3,L=4,M=5,C=0,P=1,H=-2,K=-3,j=-5,Y=-1,G=1,X=2,W=3,q=4,J=0,Q=2,V=8,$=9,ee=15,te=8,ae=286,ne=30,ie=19,re=2*ae+1,se=15,le=3,oe=258,he=oe+le+1,de=32,_e=42,fe=69,ue=73,ce=91,be=103,ge=113,me=666,we=1,pe=2,ve=3,ke=4,xe=3;R=[new w(0,0,0,0,u),new w(4,4,8,4,c),new w(4,5,16,8,c),new w(4,6,32,32,c),new w(4,4,16,16,b),new w(8,16,32,32,b),new w(8,16,128,128,b),new w(8,32,128,256,b),new w(32,128,258,1024,b),new w(32,258,258,4096,b)],t.deflateInit=E,t.deflateInit2=z,t.deflateReset=x,t.deflateResetKeep=k,t.deflateSetHeader=y,t.deflate=A,t.deflateEnd=S,t.deflateSetDictionary=Z,t.deflateInfo="pako deflate (from Nodeca project)"},function(e,t,a){"use strict";function n(e){for(var t=e.length;--t>=0;)e[t]=0}function i(e,t,a,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=a,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function r(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function s(e){return e<256?re[e]:re[256+(e>>>7)]}function l(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function o(e,t,a){e.bi_valid>X-a?(e.bi_buf|=t<<e.bi_valid&65535,l(e,e.bi_buf),e.bi_buf=t>>X-e.bi_valid,e.bi_valid+=a-X):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=a)}function h(e,t,a){o(e,a[2*t],a[2*t+1])}function d(e,t){var a=0;do{a|=1&e,e>>>=1,a<<=1}while(--t>0);return a>>>1}function _(e){16===e.bi_valid?(l(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}function f(e,t){var a,n,i,r,s,l,o=t.dyn_tree,h=t.max_code,d=t.stat_desc.static_tree,_=t.stat_desc.has_stree,f=t.stat_desc.extra_bits,u=t.stat_desc.extra_base,c=t.stat_desc.max_length,b=0;for(r=0;r<=G;r++)e.bl_count[r]=0;for(o[2*e.heap[e.heap_max]+1]=0,a=e.heap_max+1;a<Y;a++)n=e.heap[a],r=o[2*o[2*n+1]+1]+1,r>c&&(r=c,b++),o[2*n+1]=r,n>h||(e.bl_count[r]++,s=0,n>=u&&(s=f[n-u]),l=o[2*n],e.opt_len+=l*(r+s),_&&(e.static_len+=l*(d[2*n+1]+s)));if(0!==b){do{for(r=c-1;0===e.bl_count[r];)r--;e.bl_count[r]--,e.bl_count[r+1]+=2,e.bl_count[c]--,b-=2}while(b>0);for(r=c;0!==r;r--)for(n=e.bl_count[r];0!==n;)(i=e.heap[--a])>h||(o[2*i+1]!==r&&(e.opt_len+=(r-o[2*i+1])*o[2*i],o[2*i+1]=r),n--)}}function u(e,t,a){var n,i,r=new Array(G+1),s=0;for(n=1;n<=G;n++)r[n]=s=s+a[n-1]<<1;for(i=0;i<=t;i++){var l=e[2*i+1];0!==l&&(e[2*i]=d(r[l]++,l))}}function c(){var e,t,a,n,r,s=new Array(G+1);for(a=0,n=0;n<C-1;n++)for(le[n]=a,e=0;e<1<<$[n];e++)se[a++]=n;for(se[a-1]=n,r=0,n=0;n<16;n++)for(oe[n]=r,e=0;e<1<<ee[n];e++)re[r++]=n;for(r>>=7;n<K;n++)for(oe[n]=r<<7,e=0;e<1<<ee[n]-7;e++)re[256+r++]=n;for(t=0;t<=G;t++)s[t]=0;for(e=0;e<=143;)ne[2*e+1]=8,e++,s[8]++;for(;e<=255;)ne[2*e+1]=9,e++,s[9]++;for(;e<=279;)ne[2*e+1]=7,e++,s[7]++;for(;e<=287;)ne[2*e+1]=8,e++,s[8]++;for(u(ne,H+1,s),e=0;e<K;e++)ie[2*e+1]=5,ie[2*e]=d(e,5);he=new i(ne,$,P+1,H,G),de=new i(ie,ee,0,K,G),_e=new i(new Array(0),te,0,j,W)}function b(e){var t;for(t=0;t<H;t++)e.dyn_ltree[2*t]=0;for(t=0;t<K;t++)e.dyn_dtree[2*t]=0;for(t=0;t<j;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*q]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function g(e){e.bi_valid>8?l(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function m(e,t,a,n){g(e),n&&(l(e,a),l(e,~a)),T.arraySet(e.pending_buf,e.window,t,a,e.pending),e.pending+=a}function w(e,t,a,n){var i=2*t,r=2*a;return e[i]<e[r]||e[i]===e[r]&&n[t]<=n[a]}function p(e,t,a){for(var n=e.heap[a],i=a<<1;i<=e.heap_len&&(i<e.heap_len&&w(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!w(t,n,e.heap[i],e.depth));)e.heap[a]=e.heap[i],a=i,i<<=1;e.heap[a]=n}function v(e,t,a){var n,i,r,l,d=0;if(0!==e.last_lit)do{n=e.pending_buf[e.d_buf+2*d]<<8|e.pending_buf[e.d_buf+2*d+1],i=e.pending_buf[e.l_buf+d],d++,0===n?h(e,i,t):(r=se[i],h(e,r+P+1,t),l=$[r],0!==l&&(i-=le[r],o(e,i,l)),n--,r=s(n),h(e,r,a),0!==(l=ee[r])&&(n-=oe[r],o(e,n,l)))}while(d<e.last_lit);h(e,q,t)}function k(e,t){var a,n,i,r=t.dyn_tree,s=t.stat_desc.static_tree,l=t.stat_desc.has_stree,o=t.stat_desc.elems,h=-1;for(e.heap_len=0,e.heap_max=Y,a=0;a<o;a++)0!==r[2*a]?(e.heap[++e.heap_len]=h=a,e.depth[a]=0):r[2*a+1]=0;for(;e.heap_len<2;)i=e.heap[++e.heap_len]=h<2?++h:0,r[2*i]=1,e.depth[i]=0,e.opt_len--,l&&(e.static_len-=s[2*i+1]);for(t.max_code=h,a=e.heap_len>>1;a>=1;a--)p(e,r,a);i=o;do{a=e.heap[1],e.heap[1]=e.heap[e.heap_len--],p(e,r,1),n=e.heap[1],e.heap[--e.heap_max]=a,e.heap[--e.heap_max]=n,r[2*i]=r[2*a]+r[2*n],e.depth[i]=(e.depth[a]>=e.depth[n]?e.depth[a]:e.depth[n])+1,r[2*a+1]=r[2*n+1]=i,e.heap[1]=i++,p(e,r,1)}while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],f(e,t),u(r,h,e.bl_count)}function x(e,t,a){var n,i,r=-1,s=t[1],l=0,o=7,h=4;for(0===s&&(o=138,h=3),t[2*(a+1)+1]=65535,n=0;n<=a;n++)i=s,s=t[2*(n+1)+1],++l<o&&i===s||(l<h?e.bl_tree[2*i]+=l:0!==i?(i!==r&&e.bl_tree[2*i]++,e.bl_tree[2*J]++):l<=10?e.bl_tree[2*Q]++:e.bl_tree[2*V]++,l=0,r=i,0===s?(o=138,h=3):i===s?(o=6,h=3):(o=7,h=4))}function y(e,t,a){var n,i,r=-1,s=t[1],l=0,d=7,_=4;for(0===s&&(d=138,_=3),n=0;n<=a;n++)if(i=s,s=t[2*(n+1)+1],!(++l<d&&i===s)){if(l<_)do{h(e,i,e.bl_tree)}while(0!=--l);else 0!==i?(i!==r&&(h(e,i,e.bl_tree),l--),h(e,J,e.bl_tree),o(e,l-3,2)):l<=10?(h(e,Q,e.bl_tree),o(e,l-3,3)):(h(e,V,e.bl_tree),o(e,l-11,7));l=0,r=i,0===s?(d=138,_=3):i===s?(d=6,_=3):(d=7,_=4)}}function z(e){var t;for(x(e,e.dyn_ltree,e.l_desc.max_code),x(e,e.dyn_dtree,e.d_desc.max_code),k(e,e.bl_desc),t=j-1;t>=3&&0===e.bl_tree[2*ae[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}function E(e,t,a,n){var i;for(o(e,t-257,5),o(e,a-1,5),o(e,n-4,4),i=0;i<n;i++)o(e,e.bl_tree[2*ae[i]+1],3);y(e,e.dyn_ltree,t-1),y(e,e.dyn_dtree,a-1)}function A(e){var t,a=4093624447;for(t=0;t<=31;t++,a>>>=1)if(1&a&&0!==e.dyn_ltree[2*t])return D;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return U;for(t=32;t<P;t++)if(0!==e.dyn_ltree[2*t])return U;return D}function S(e){fe||(c(),fe=!0),e.l_desc=new r(e.dyn_ltree,he),e.d_desc=new r(e.dyn_dtree,de),e.bl_desc=new r(e.bl_tree,_e),e.bi_buf=0,e.bi_valid=0,b(e)}function Z(e,t,a,n){o(e,(F<<1)+(n?1:0),3),m(e,t,a,!0)}function R(e){o(e,L<<1,3),h(e,q,ne),_(e)}function B(e,t,a,n){var i,r,s=0;e.level>0?(e.strm.data_type===I&&(e.strm.data_type=A(e)),k(e,e.l_desc),k(e,e.d_desc),s=z(e),i=e.opt_len+3+7>>>3,(r=e.static_len+3+7>>>3)<=i&&(i=r)):i=r=a+5,a+4<=i&&-1!==t?Z(e,t,a,n):e.strategy===N||r===i?(o(e,(L<<1)+(n?1:0),3),v(e,ne,ie)):(o(e,(M<<1)+(n?1:0),3),E(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),v(e,e.dyn_ltree,e.dyn_dtree)),b(e),n&&g(e)}function O(e,t,a){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&a,e.last_lit++,0===t?e.dyn_ltree[2*a]++:(e.matches++,t--,e.dyn_ltree[2*(se[a]+P+1)]++,e.dyn_dtree[2*s(t)]++),e.last_lit===e.lit_bufsize-1}var T=a(0),N=4,D=0,U=1,I=2,F=0,L=1,M=2,C=29,P=256,H=P+1+C,K=30,j=19,Y=2*H+1,G=15,X=16,W=7,q=256,J=16,Q=17,V=18,$=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ee=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],te=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],ae=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],ne=new Array(2*(H+2));n(ne);var ie=new Array(2*K);n(ie);var re=new Array(512);n(re);var se=new Array(256);n(se);var le=new Array(C);n(le);var oe=new Array(K);n(oe);var he,de,_e,fe=!1;t._tr_init=S,t._tr_stored_block=Z,t._tr_flush_block=B,t._tr_tally=O,t._tr_align=R},function(e,t,a){"use strict";function n(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function i(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new w.Buf16(320),this.work=new w.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function r(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=F,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new w.Buf32(be),t.distcode=t.distdyn=new w.Buf32(ge),t.sane=1,t.back=-1,R):T}function s(e){var t;return e&&e.state?(t=e.state,t.wsize=0,t.whave=0,t.wnext=0,r(e)):T}function l(e,t){var a,n;return e&&e.state?(n=e.state,t<0?(a=0,t=-t):(a=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?T:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=a,n.wbits=t,s(e))):T}function o(e,t){var a,n;return e?(n=new i,e.state=n,n.window=null,a=l(e,t),a!==R&&(e.state=null),a):T}function h(e){return o(e,me)}function d(e){if(we){var t;for(g=new w.Buf32(512),m=new w.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(x(z,e.lens,0,288,g,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;x(E,e.lens,0,32,m,0,e.work,{bits:5}),we=!1}e.lencode=g,e.lenbits=9,e.distcode=m,e.distbits=5}function _(e,t,a,n){var i,r=e.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new w.Buf8(r.wsize)),n>=r.wsize?(w.arraySet(r.window,t,a-r.wsize,r.wsize,0),r.wnext=0,r.whave=r.wsize):(i=r.wsize-r.wnext,i>n&&(i=n),w.arraySet(r.window,t,a-n,i,r.wnext),n-=i,n?(w.arraySet(r.window,t,a-n,n,0),r.wnext=n,r.whave=r.wsize):(r.wnext+=i,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=i))),0}function f(e,t){var a,i,r,s,l,o,h,f,u,c,b,g,m,be,ge,me,we,pe,ve,ke,xe,ye,ze,Ee,Ae=0,Se=new w.Buf8(4),Ze=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return T;a=e.state,a.mode===W&&(a.mode=q),l=e.next_out,r=e.output,h=e.avail_out,s=e.next_in,i=e.input,o=e.avail_in,f=a.hold,u=a.bits,c=o,b=h,ye=R;e:for(;;)switch(a.mode){case F:if(0===a.wrap){a.mode=q;break}for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(2&a.wrap&&35615===f){a.check=0,Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0),f=0,u=0,a.mode=L;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&f)<<8)+(f>>8))%31){e.msg="incorrect header check",a.mode=fe;break}if((15&f)!==I){e.msg="unknown compression method",a.mode=fe;break}if(f>>>=4,u-=4,xe=8+(15&f),0===a.wbits)a.wbits=xe;else if(xe>a.wbits){e.msg="invalid window size",a.mode=fe;break}a.dmax=1<<xe,e.adler=a.check=1,a.mode=512&f?G:W,f=0,u=0;break;case L:for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(a.flags=f,(255&a.flags)!==I){e.msg="unknown compression method",a.mode=fe;break}if(57344&a.flags){e.msg="unknown header flags set",a.mode=fe;break}a.head&&(a.head.text=f>>8&1),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0,a.mode=M;case M:for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.head&&(a.head.time=f),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,Se[2]=f>>>16&255,Se[3]=f>>>24&255,a.check=v(a.check,Se,4,0)),f=0,u=0,a.mode=C;case C:for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.head&&(a.head.xflags=255&f,a.head.os=f>>8),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0,a.mode=P;case P:if(1024&a.flags){for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.length=f,a.head&&(a.head.extra_len=f),512&a.flags&&(Se[0]=255&f,Se[1]=f>>>8&255,a.check=v(a.check,Se,2,0)),f=0,u=0}else a.head&&(a.head.extra=null);a.mode=H;case H:if(1024&a.flags&&(g=a.length,g>o&&(g=o),g&&(a.head&&(xe=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),w.arraySet(a.head.extra,i,s,g,xe)),512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,a.length-=g),a.length))break e;a.length=0,a.mode=K;case K:if(2048&a.flags){if(0===o)break e;g=0;do{xe=i[s+g++],a.head&&xe&&a.length<65536&&(a.head.name+=String.fromCharCode(xe))}while(xe&&g<o);if(512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,xe)break e}else a.head&&(a.head.name=null);a.length=0,a.mode=j;case j:if(4096&a.flags){if(0===o)break e;g=0;do{xe=i[s+g++],a.head&&xe&&a.length<65536&&(a.head.comment+=String.fromCharCode(xe))}while(xe&&g<o);if(512&a.flags&&(a.check=v(a.check,i,g,s)),o-=g,s+=g,xe)break e}else a.head&&(a.head.comment=null);a.mode=Y;case Y:if(512&a.flags){for(;u<16;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f!==(65535&a.check)){e.msg="header crc mismatch",a.mode=fe;break}f=0,u=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),e.adler=a.check=0,a.mode=W;break;case G:for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}e.adler=a.check=n(f),f=0,u=0,a.mode=X;case X:if(0===a.havedict)return e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,O;e.adler=a.check=1,a.mode=W;case W:if(t===S||t===Z)break e;case q:if(a.last){f>>>=7&u,u-=7&u,a.mode=he;break}for(;u<3;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}switch(a.last=1&f,f>>>=1,u-=1,3&f){case 0:a.mode=J;break;case 1:if(d(a),a.mode=ae,t===Z){f>>>=2,u-=2;break e}break;case 2:a.mode=$;break;case 3:e.msg="invalid block type",a.mode=fe}f>>>=2,u-=2;break;case J:for(f>>>=7&u,u-=7&u;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if((65535&f)!=(f>>>16^65535)){e.msg="invalid stored block lengths",a.mode=fe;break}if(a.length=65535&f,f=0,u=0,a.mode=Q,t===Z)break e;case Q:a.mode=V;case V:if(g=a.length){if(g>o&&(g=o),g>h&&(g=h),0===g)break e;w.arraySet(r,i,s,g,l),o-=g,s+=g,h-=g,l+=g,a.length-=g;break}a.mode=W;break;case $:for(;u<14;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(a.nlen=257+(31&f),f>>>=5,u-=5,a.ndist=1+(31&f),f>>>=5,u-=5,a.ncode=4+(15&f),f>>>=4,u-=4,a.nlen>286||a.ndist>30){e.msg="too many length or distance symbols",a.mode=fe;break}a.have=0,a.mode=ee;case ee:for(;a.have<a.ncode;){for(;u<3;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.lens[Ze[a.have++]]=7&f,f>>>=3,u-=3}for(;a.have<19;)a.lens[Ze[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,ze={bits:a.lenbits},ye=x(y,a.lens,0,19,a.lencode,0,a.work,ze),a.lenbits=ze.bits,ye){e.msg="invalid code lengths set",a.mode=fe;break}a.have=0,a.mode=te;case te:for(;a.have<a.nlen+a.ndist;){for(;Ae=a.lencode[f&(1<<a.lenbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(we<16)f>>>=ge,u-=ge,a.lens[a.have++]=we;else{if(16===we){for(Ee=ge+2;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f>>>=ge,u-=ge,0===a.have){e.msg="invalid bit length repeat",a.mode=fe;break}xe=a.lens[a.have-1],g=3+(3&f),f>>>=2,u-=2}else if(17===we){for(Ee=ge+3;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=ge,u-=ge,xe=0,g=3+(7&f),f>>>=3,u-=3}else{for(Ee=ge+7;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=ge,u-=ge,xe=0,g=11+(127&f),f>>>=7,u-=7}if(a.have+g>a.nlen+a.ndist){e.msg="invalid bit length repeat",a.mode=fe;break}for(;g--;)a.lens[a.have++]=xe}}if(a.mode===fe)break;if(0===a.lens[256]){e.msg="invalid code -- missing end-of-block",a.mode=fe;break}if(a.lenbits=9,ze={bits:a.lenbits},ye=x(z,a.lens,0,a.nlen,a.lencode,0,a.work,ze),a.lenbits=ze.bits,ye){e.msg="invalid literal/lengths set",a.mode=fe;break}if(a.distbits=6,a.distcode=a.distdyn,ze={bits:a.distbits},ye=x(E,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,ze),a.distbits=ze.bits,ye){e.msg="invalid distances set",a.mode=fe;break}if(a.mode=ae,t===Z)break e;case ae:a.mode=ne;case ne:if(o>=6&&h>=258){e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,k(e,b),l=e.next_out,r=e.output,h=e.avail_out,s=e.next_in,i=e.input,o=e.avail_in,f=a.hold,u=a.bits,a.mode===W&&(a.back=-1);break}for(a.back=0;Ae=a.lencode[f&(1<<a.lenbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(me&&0==(240&me)){for(pe=ge,ve=me,ke=we;Ae=a.lencode[ke+((f&(1<<pe+ve)-1)>>pe)],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(pe+ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=pe,u-=pe,a.back+=pe}if(f>>>=ge,u-=ge,a.back+=ge,a.length=we,0===me){a.mode=oe;break}if(32&me){a.back=-1,a.mode=W;break}if(64&me){e.msg="invalid literal/length code",a.mode=fe;break}a.extra=15&me,a.mode=ie;case ie:if(a.extra){for(Ee=a.extra;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.length+=f&(1<<a.extra)-1,f>>>=a.extra,u-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=re;case re:for(;Ae=a.distcode[f&(1<<a.distbits)-1],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(0==(240&me)){for(pe=ge,ve=me,ke=we;Ae=a.distcode[ke+((f&(1<<pe+ve)-1)>>pe)],ge=Ae>>>24,me=Ae>>>16&255,we=65535&Ae,!(pe+ge<=u);){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}f>>>=pe,u-=pe,a.back+=pe}if(f>>>=ge,u-=ge,a.back+=ge,64&me){e.msg="invalid distance code",a.mode=fe;break}a.offset=we,a.extra=15&me,a.mode=se;case se:if(a.extra){for(Ee=a.extra;u<Ee;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}a.offset+=f&(1<<a.extra)-1,f>>>=a.extra,u-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){e.msg="invalid distance too far back",a.mode=fe;break}a.mode=le;case le:if(0===h)break e;if(g=b-h,a.offset>g){if((g=a.offset-g)>a.whave&&a.sane){e.msg="invalid distance too far back",a.mode=fe;break}g>a.wnext?(g-=a.wnext,m=a.wsize-g):m=a.wnext-g,g>a.length&&(g=a.length),be=a.window}else be=r,m=l-a.offset,g=a.length;g>h&&(g=h),h-=g,a.length-=g;do{r[l++]=be[m++]}while(--g);0===a.length&&(a.mode=ne);break;case oe:if(0===h)break e;r[l++]=a.length,h--,a.mode=ne;break;case he:if(a.wrap){for(;u<32;){if(0===o)break e;o--,f|=i[s++]<<u,u+=8}if(b-=h,e.total_out+=b,a.total+=b,b&&(e.adler=a.check=a.flags?v(a.check,r,b,l-b):p(a.check,r,b,l-b)),b=h,(a.flags?f:n(f))!==a.check){e.msg="incorrect data check",a.mode=fe;break}f=0,u=0}a.mode=de;case de:if(a.wrap&&a.flags){for(;u<32;){if(0===o)break e;o--,f+=i[s++]<<u,u+=8}if(f!==(4294967295&a.total)){e.msg="incorrect length check",a.mode=fe;break}f=0,u=0}a.mode=_e;case _e:ye=B;break e;case fe:ye=N;break e;case ue:return D;case ce:default:return T}return e.next_out=l,e.avail_out=h,e.next_in=s,e.avail_in=o,a.hold=f,a.bits=u,(a.wsize||b!==e.avail_out&&a.mode<fe&&(a.mode<he||t!==A))&&_(e,e.output,e.next_out,b-e.avail_out)?(a.mode=ue,D):(c-=e.avail_in,b-=e.avail_out,e.total_in+=c,e.total_out+=b,a.total+=b,a.wrap&&b&&(e.adler=a.check=a.flags?v(a.check,r,b,e.next_out-b):p(a.check,r,b,e.next_out-b)),e.data_type=a.bits+(a.last?64:0)+(a.mode===W?128:0)+(a.mode===ae||a.mode===Q?256:0),(0===c&&0===b||t===A)&&ye===R&&(ye=U),ye)}function u(e){if(!e||!e.state)return T;var t=e.state;return t.window&&(t.window=null),e.state=null,R}function c(e,t){var a;return e&&e.state?(a=e.state,0==(2&a.wrap)?T:(a.head=t,t.done=!1,R)):T}function b(e,t){var a,n,i=t.length;return e&&e.state?(a=e.state,0!==a.wrap&&a.mode!==X?T:a.mode===X&&(n=1,(n=p(n,t,i,0))!==a.check)?N:_(e,t,i,i)?(a.mode=ue,D):(a.havedict=1,R)):T}var g,m,w=a(0),p=a(1),v=a(2),k=a(10),x=a(11),y=0,z=1,E=2,A=4,S=5,Z=6,R=0,B=1,O=2,T=-2,N=-3,D=-4,U=-5,I=8,F=1,L=2,M=3,C=4,P=5,H=6,K=7,j=8,Y=9,G=10,X=11,W=12,q=13,J=14,Q=15,V=16,$=17,ee=18,te=19,ae=20,ne=21,ie=22,re=23,se=24,le=25,oe=26,he=27,de=28,_e=29,fe=30,ue=31,ce=32,be=852,ge=592,me=15,we=!0;t.inflateReset=s,t.inflateReset2=l,t.inflateResetKeep=r,t.inflateInit=h,t.inflateInit2=o,t.inflate=f,t.inflateEnd=u,t.inflateGetHeader=c,t.inflateSetDictionary=b,t.inflateInfo="pako inflate (from Nodeca project)"},function(e,t,a){"use strict";e.exports=function(e,t){var a,n,i,r,s,l,o,h,d,_,f,u,c,b,g,m,w,p,v,k,x,y,z,E,A;a=e.state,n=e.next_in,E=e.input,i=n+(e.avail_in-5),r=e.next_out,A=e.output,s=r-(t-e.avail_out),l=r+(e.avail_out-257),o=a.dmax,h=a.wsize,d=a.whave,_=a.wnext,f=a.window,u=a.hold,c=a.bits,b=a.lencode,g=a.distcode,m=(1<<a.lenbits)-1,w=(1<<a.distbits)-1;e:do{c<15&&(u+=E[n++]<<c,c+=8,u+=E[n++]<<c,c+=8),p=b[u&m];t:for(;;){if(v=p>>>24,u>>>=v,c-=v,0===(v=p>>>16&255))A[r++]=65535&p;else{if(!(16&v)){if(0==(64&v)){p=b[(65535&p)+(u&(1<<v)-1)];continue t}if(32&v){a.mode=12;break e}e.msg="invalid literal/length code",a.mode=30;break e}k=65535&p,v&=15,v&&(c<v&&(u+=E[n++]<<c,c+=8),k+=u&(1<<v)-1,u>>>=v,c-=v),c<15&&(u+=E[n++]<<c,c+=8,u+=E[n++]<<c,c+=8),p=g[u&w];a:for(;;){if(v=p>>>24,u>>>=v,c-=v,!(16&(v=p>>>16&255))){if(0==(64&v)){p=g[(65535&p)+(u&(1<<v)-1)];continue a}e.msg="invalid distance code",a.mode=30;break e}if(x=65535&p,v&=15,c<v&&(u+=E[n++]<<c,(c+=8)<v&&(u+=E[n++]<<c,c+=8)),(x+=u&(1<<v)-1)>o){e.msg="invalid distance too far back",a.mode=30;break e}if(u>>>=v,c-=v,v=r-s,x>v){if((v=x-v)>d&&a.sane){e.msg="invalid distance too far back",a.mode=30;break e}if(y=0,z=f,0===_){if(y+=h-v,v<k){k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}}else if(_<v){if(y+=h+_-v,(v-=_)<k){k-=v;do{A[r++]=f[y++]}while(--v);if(y=0,_<k){v=_,k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}}}else if(y+=_-v,v<k){k-=v;do{A[r++]=f[y++]}while(--v);y=r-x,z=A}for(;k>2;)A[r++]=z[y++],A[r++]=z[y++],A[r++]=z[y++],k-=3;k&&(A[r++]=z[y++],k>1&&(A[r++]=z[y++]))}else{y=r-x;do{A[r++]=A[y++],A[r++]=A[y++],A[r++]=A[y++],k-=3}while(k>2);k&&(A[r++]=A[y++],k>1&&(A[r++]=A[y++]))}break}}break}}while(n<i&&r<l);k=c>>3,n-=k,c-=k<<3,u&=(1<<c)-1,e.next_in=n,e.next_out=r,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=r<l?l-r+257:257-(r-l),a.hold=u,a.bits=c}},function(e,t,a){"use strict";var n=a(0),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],r=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],l=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(e,t,a,o,h,d,_,f){var u,c,b,g,m,w,p,v,k,x=f.bits,y=0,z=0,E=0,A=0,S=0,Z=0,R=0,B=0,O=0,T=0,N=null,D=0,U=new n.Buf16(16),I=new n.Buf16(16),F=null,L=0;for(y=0;y<=15;y++)U[y]=0;for(z=0;z<o;z++)U[t[a+z]]++;for(S=x,A=15;A>=1&&0===U[A];A--);if(S>A&&(S=A),0===A)return h[d++]=20971520,h[d++]=20971520,f.bits=1,0;for(E=1;E<A&&0===U[E];E++);for(S<E&&(S=E),B=1,y=1;y<=15;y++)if(B<<=1,(B-=U[y])<0)return-1;if(B>0&&(0===e||1!==A))return-1;for(I[1]=0,y=1;y<15;y++)I[y+1]=I[y]+U[y];for(z=0;z<o;z++)0!==t[a+z]&&(_[I[t[a+z]]++]=z);if(0===e?(N=F=_,w=19):1===e?(N=i,D-=257,F=r,L-=257,w=256):(N=s,F=l,w=-1),T=0,z=0,y=E,m=d,Z=S,R=0,b=-1,O=1<<S,g=O-1,1===e&&O>852||2===e&&O>592)return 1;for(;;){p=y-R,_[z]<w?(v=0,k=_[z]):_[z]>w?(v=F[L+_[z]],k=N[D+_[z]]):(v=96,k=0),u=1<<y-R,c=1<<Z,E=c;do{c-=u,h[m+(T>>R)+c]=p<<24|v<<16|k|0}while(0!==c);for(u=1<<y-1;T&u;)u>>=1;if(0!==u?(T&=u-1,T+=u):T=0,z++,0==--U[y]){if(y===A)break;y=t[a+_[z]]}if(y>S&&(T&g)!==b){for(0===R&&(R=S),m+=E,Z=y-R,B=1<<Z;Z+R<A&&!((B-=U[Z+R])<=0);)Z++,B<<=1;if(O+=1<<Z,1===e&&O>852||2===e&&O>592)return 1;b=T&g,h[b]=S<<24|Z<<16|m-d|0}}return 0!==T&&(h[m+T]=y-R<<24|64<<16|0),f.bits=S,0}},function(e,t,a){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}}]);';

//
// constants used for communication with the worker
//

const MESSAGE_INITIALIZE_WORKER = 'start';
const MESSAGE_INFLATE = 'inflate';
const MESSAGE_INFLATED_DATA_READY = 'inflated_ready';
const MESSAGE_DEFLATE = 'deflate';
const MESSAGE_DEFLATED_DATA_READY = 'deflated_ready';

const EOL = '\r\n';
const LINE_FEED = 10;
const CARRIAGE_RETURN = 13;
const LEFT_CURLY_BRACKET = 123;
const RIGHT_CURLY_BRACKET = 125;

const ASCII_PLUS = 43;

// State tracking when constructing an IMAP command from buffers.
const BUFFER_STATE_LITERAL = 'literal';
const BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1 = 'literal_length_1';
const BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2 = 'literal_length_2';
const BUFFER_STATE_DEFAULT = 'default';

/**
 * How much time to wait since the last response until the connection is considered idling
 */
const TIMEOUT_ENTER_IDLE = 1000;

/**
 * Lower Bound for socket timeout to wait since the last data was written to a socket
 */
const TIMEOUT_SOCKET_LOWER_BOUND = 10000;

/**
 * Multiplier for socket timeout:
 *
 * We assume at least a GPRS connection with 115 kb/s = 14,375 kB/s tops, so 10 KB/s to be on
 * the safe side. We can timeout after a lower bound of 10s + (n KB / 10 KB/s). A 1 MB message
 * upload would be 110 seconds to wait for the timeout. 10 KB/s === 0.1 s/B
 */
const TIMEOUT_SOCKET_MULTIPLIER = 0.1;

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
class Imap {
  constructor(host, port, options = {}) {
    this.timeoutEnterIdle = TIMEOUT_ENTER_IDLE;
    this.timeoutSocketLowerBound = TIMEOUT_SOCKET_LOWER_BOUND;
    this.timeoutSocketMultiplier = TIMEOUT_SOCKET_MULTIPLIER;

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
  connect(Socket = _emailjsTcpSocket2.default) {
    return new Promise((resolve, reject) => {
      this.socket = Socket.open(this.host, this.port, {
        binaryType: 'arraybuffer',
        useSecureTransport: this.secureMode,
        ca: this.options.ca
      });

      // allows certificate handling for platform w/o native tls support
      // oncert is non standard so setting it might throw if the socket object is immutable
      try {
        this.socket.oncert = cert => {
          this.oncert && this.oncert(cert);
        };
      } catch (E) {}

      // Connection closing unexpected is an error
      this.socket.onclose = () => this._onError(new Error('Socket closed unexceptedly!'));
      this.socket.ondata = evt => {
        try {
          this._onData(evt);
        } catch (err) {
          this._onError(err);
        }
      };

      // if an error happens during create time, reject the promise
      this.socket.onerror = e => {
        reject(new Error('Could not open socket: ' + e.data.message));
      };

      this.socket.onopen = () => {
        // use proper "irrecoverable error, tear down everything"-handler only after socket is open
        this.socket.onerror = e => this._onError(e);
        resolve();
      };
    });
  }

  /**
   * Closes the connection to the server
   *
   * @returns {Promise} Resolves when the socket is closed
   */
  close(error) {
    return new Promise(resolve => {
      var tearDown = () => {
        // fulfill pending promises
        this._clientQueue.forEach(cmd => cmd.callback(error));
        if (this._currentCommand) {
          this._currentCommand.callback(error);
        }

        this._clientQueue = [];
        this._currentCommand = false;

        clearTimeout(this._idleTimer);
        this._idleTimer = null;

        clearTimeout(this._socketTimeoutTimer);
        this._socketTimeoutTimer = null;

        if (this.socket) {
          // remove all listeners
          this.socket.onopen = null;
          this.socket.onclose = null;
          this.socket.ondata = null;
          this.socket.onerror = null;
          try {
            this.socket.oncert = null;
          } catch (E) {}

          this.socket = null;
        }

        resolve();
      };

      this._disableCompression();

      if (!this.socket || this.socket.readyState !== 'open') {
        return tearDown();
      }

      this.socket.onclose = this.socket.onerror = tearDown; // we don't really care about the error here
      this.socket.close();
    });
  }

  /**
   * Send LOGOUT to the server.
   *
   * Use is discouraged!
   *
   * @returns {Promise} Resolves when connection is closed by server.
   */
  logout() {
    return new Promise((resolve, reject) => {
      this.socket.onclose = this.socket.onerror = () => {
        this.close('Client logging out').then(resolve).catch(reject);
      };

      this.enqueueCommand('LOGOUT');
    });
  }

  /**
   * Initiates TLS handshake
   */
  upgrade() {
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
  enqueueCommand(request, acceptUntagged, options) {
    if (typeof request === 'string') {
      request = {
        command: request
      };
    }

    acceptUntagged = [].concat(acceptUntagged || []).map(untagged => (untagged || '').toString().toUpperCase().trim());

    var tag = 'W' + ++this._tagCounter;
    request.tag = tag;

    return new Promise((resolve, reject) => {
      var data = {
        tag: tag,
        request: request,
        payload: acceptUntagged.length ? {} : undefined,
        callback: response => {
          if (this.isError(response)) {
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
      };Object.keys(options || {}).forEach(key => {
        data[key] = options[key];
      });

      acceptUntagged.forEach(command => {
        data.payload[command] = [];
      });

      // if we're in priority mode (i.e. we ran commands in a precheck),
      // queue any commands BEFORE the command that contianed the precheck,
      // otherwise just queue command as usual
      var index = data.ctx ? this._clientQueue.indexOf(data.ctx) : -1;
      if (index >= 0) {
        data.tag += '.p';
        data.request.tag += '.p';
        this._clientQueue.splice(index, 0, data);
      } else {
        this._clientQueue.push(data);
      }

      if (this._canSend) {
        this._sendRequest();
      }
    });
  }

  /**
   *
   * @param commands
   * @param ctx
   * @returns {*}
   */
  getPreviouslyQueued(commands, ctx) {
    const startIndex = this._clientQueue.indexOf(ctx) - 1;

    // search backwards for the commands and return the first found
    for (let i = startIndex; i >= 0; i--) {
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
  send(str) {
    const buffer = (0, _common.toTypedArray)(str).buffer;
    const timeout = this.timeoutSocketLowerBound + Math.floor(buffer.byteLength * this.timeoutSocketMultiplier);

    clearTimeout(this._socketTimeoutTimer); // clear pending timeouts
    this._socketTimeoutTimer = setTimeout(() => this._onError(new Error(' Socket timed out!')), timeout); // arm the next timeout

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
  setHandler(command, callback) {
    this._globalAcceptUntagged[command.toUpperCase().trim()] = callback;
  }

  // INTERNAL EVENTS

  /**
   * Error handler for the socket
   *
   * @event
   * @param {Event} evt Event object. See evt.data for the error
   */
  _onError(evt) {
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
    this.close(error).then(() => {
      this.onerror && this.onerror(error);
    }, () => {
      this.onerror && this.onerror(error);
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
  _onData(evt) {
    clearTimeout(this._socketTimeoutTimer); // reset the timeout on each data packet
    const timeout = this.timeoutSocketLowerBound + Math.floor(4096 * this.timeoutSocketMultiplier); // max packet size is 4096 bytes
    this._socketTimeoutTimer = setTimeout(() => this._onError(new Error(' Socket timed out!')), timeout);

    this._incomingBuffers.push(new Uint8Array(evt.data)); // append to the incoming buffer
    this._parseIncomingCommands(this._iterateIncomingBuffer()); // Consume the incoming buffer
  }

  *_iterateIncomingBuffer() {
    let buf = this._incomingBuffers[this._incomingBuffers.length - 1] || [];
    let i = 0;

    // loop invariant:
    //   this._incomingBuffers starts with the beginning of incoming command.
    //   buf is shorthand for last element of this._incomingBuffers.
    //   buf[0..i-1] is part of incoming command.
    while (i < buf.length) {
      switch (this._bufferState) {
        case BUFFER_STATE_LITERAL:
          const diff = Math.min(buf.length - i, this._literalRemaining);
          this._literalRemaining -= diff;
          i += diff;
          if (this._literalRemaining === 0) {
            this._bufferState = BUFFER_STATE_DEFAULT;
          }
          continue;

        case BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2:
          if (i < buf.length) {
            if (buf[i] === CARRIAGE_RETURN) {
              this._literalRemaining = Number((0, _common.fromTypedArray)(this._lengthBuffer)) + 2; // for CRLF
              this._bufferState = BUFFER_STATE_LITERAL;
            } else {
              this._bufferState = BUFFER_STATE_DEFAULT;
            }
            delete this._lengthBuffer;
          }
          continue;

        case BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1:
          const start = i;
          while (i < buf.length && buf[i] >= 48 && buf[i] <= 57) {
            // digits
            i++;
          }
          if (start !== i) {
            const latest = buf.subarray(start, i);
            const prevBuf = this._lengthBuffer;
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
          continue;

        default:
          // find literal length
          const leftIdx = buf.indexOf(LEFT_CURLY_BRACKET, i);
          if (leftIdx > -1) {
            const leftOfLeftCurly = new Uint8Array(buf.buffer, i, leftIdx - i);
            if (leftOfLeftCurly.indexOf(LINE_FEED) === -1) {
              i = leftIdx + 1;
              this._lengthBuffer = new Uint8Array(0);
              this._bufferState = BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1;
              continue;
            }
          }

          // find end of command
          const LFidx = buf.indexOf(LINE_FEED, i);
          if (LFidx > -1) {
            if (LFidx < buf.length - 1) {
              this._incomingBuffers[this._incomingBuffers.length - 1] = new Uint8Array(buf.buffer, 0, LFidx + 1);
            }
            const commandLength = this._incomingBuffers.reduce((prev, curr) => prev + curr.length, 0) - 2; // 2 for CRLF
            const command = new Uint8Array(commandLength);
            let index = 0;
            while (this._incomingBuffers.length > 0) {
              let uint8Array = this._incomingBuffers.shift();

              const remainingLength = commandLength - index;
              if (uint8Array.length > remainingLength) {
                const excessLength = uint8Array.length - remainingLength;
                uint8Array = uint8Array.subarray(0, -excessLength);

                if (this._incomingBuffers.length > 0) {
                  this._incomingBuffers = [];
                }
              }
              command.set(uint8Array, index);
              index += uint8Array.length;
            }
            yield command;
            if (LFidx < buf.length - 1) {
              buf = new Uint8Array(buf.subarray(LFidx + 1));
              this._incomingBuffers.push(buf);
              i = 0;
            } else {
              // clear the timeout when an entire command has arrived
              // and not waiting on more data for next command
              clearTimeout(this._socketTimeoutTimer);
              this._socketTimeoutTimer = null;
              return;
            }
          } else {
            return;
          }
      }
    }
  }

  // PRIVATE METHODS

  /**
   * Processes a command from the queue. The command is parsed and feeded to a handler
   */
  _parseIncomingCommands(commands) {
    for (var command of commands) {
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
        const valueAsString = this._currentCommand.request && this._currentCommand.request.valueAsString;
        response = (0, _emailjsImapHandler.parser)(command, { valueAsString });
        this.logger.debug('S:', () => (0, _emailjsImapHandler.compiler)(response, false, true));
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
  }

  /**
   * Feeds a parsed response object to an appropriate handler
   *
   * @param {Object} response Parsed command object
   */
  _handleResponse(response) {
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
  _sendRequest() {
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
      precheck(context).then(() => {
        // we're done with the precheck
        if (this._restartQueue) {
          // we need to restart the queue handling
          this._sendRequest();
        }
      }).catch(err => {
        // precheck failed, so we remove the initial command
        // from the queue, invoke its callback and resume normal operation
        let cmd;
        const index = this._clientQueue.indexOf(context);
        if (index >= 0) {
          cmd = this._clientQueue.splice(index, 1)[0];
        }
        if (cmd && cmd.callback) {
          cmd.callback(err);
          this._canSend = true;
          this._parseIncomingCommands(this._iterateIncomingBuffer()); // Consume the rest of the incoming buffer
          this._sendRequest(); // continue sending
        }
      });
      return;
    }

    this._canSend = false;
    this._currentCommand = this._clientQueue.shift();

    try {
      this._currentCommand.data = (0, _emailjsImapHandler.compiler)(this._currentCommand.request, true);
      this.logger.debug('C:', () => (0, _emailjsImapHandler.compiler)(this._currentCommand.request, false, true)); // excludes passwords etc.
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
  _enterIdle() {
    clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => this.onidle && this.onidle(), this.timeoutEnterIdle);
  }

  /**
   * Cancel idle timer
   */
  _clearIdle() {
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
  _processResponse(response) {
    let command = (0, _ramda.propOr)('', 'command', response).toUpperCase().trim();

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
      const option = response.attributes[0].section.map(key => {
        if (!key) {
          return;
        }
        if (Array.isArray(key)) {
          return key.map(key => (key.value || '').toString().trim());
        } else {
          return (key.value || '').toString().toUpperCase().trim();
        }
      });

      const key = option.shift();
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
  isError(value) {
    return !!Object.prototype.toString.call(value).match(/Error\]$/);
  }

  // COMPRESSION RELATED METHODS

  /**
   * Sets up deflate/inflate for the IO
   */
  enableCompression() {
    this._socketOnData = this.socket.ondata;
    this.compressed = true;

    if (typeof window !== 'undefined' && window.Worker) {
      this._compressionWorker = new Worker(URL.createObjectURL(new Blob([CompressionBlob])));
      this._compressionWorker.onmessage = e => {
        var message = e.data.message;
        var data = e.data.buffer;

        switch (message) {
          case MESSAGE_INFLATED_DATA_READY:
            this._socketOnData({ data });
            break;

          case MESSAGE_DEFLATED_DATA_READY:
            this.waitDrain = this.socket.send(data);
            break;
        }
      };

      this._compressionWorker.onerror = e => {
        this._onError(new Error('Error handling compression web worker: ' + e.message));
      };

      this._compressionWorker.postMessage(createMessage(MESSAGE_INITIALIZE_WORKER));
    } else {
      const inflatedReady = buffer => {
        this._socketOnData({ data: buffer });
      };
      const deflatedReady = buffer => {
        this.waitDrain = this.socket.send(buffer);
      };
      this._compression = new _compression2.default(inflatedReady, deflatedReady);
    }

    // override data handler, decompress incoming data
    this.socket.ondata = evt => {
      if (!this.compressed) {
        return;
      }

      if (this._compressionWorker) {
        this._compressionWorker.postMessage(createMessage(MESSAGE_INFLATE, evt.data), [evt.data]);
      } else {
        this._compression.inflate(evt.data);
      }
    };
  }

  /**
   * Undoes any changes related to compression. This only be called when closing the connection
   */
  _disableCompression() {
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
  _sendCompressed(buffer) {
    // deflate
    if (this._compressionWorker) {
      this._compressionWorker.postMessage(createMessage(MESSAGE_DEFLATE, buffer), [buffer]);
    } else {
      this._compression.deflate(buffer);
    }
  }
}

exports.default = Imap;
const createMessage = (message, buffer) => ({ message, buffer });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLmpzIl0sIm5hbWVzIjpbIk1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIiLCJNRVNTQUdFX0lORkxBVEUiLCJNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFkiLCJNRVNTQUdFX0RFRkxBVEUiLCJNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkiLCJFT0wiLCJMSU5FX0ZFRUQiLCJDQVJSSUFHRV9SRVRVUk4iLCJMRUZUX0NVUkxZX0JSQUNLRVQiLCJSSUdIVF9DVVJMWV9CUkFDS0VUIiwiQVNDSUlfUExVUyIsIkJVRkZFUl9TVEFURV9MSVRFUkFMIiwiQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzEiLCJCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMiIsIkJVRkZFUl9TVEFURV9ERUZBVUxUIiwiVElNRU9VVF9FTlRFUl9JRExFIiwiVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkQiLCJUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSIiwiSW1hcCIsImNvbnN0cnVjdG9yIiwiaG9zdCIsInBvcnQiLCJvcHRpb25zIiwidGltZW91dEVudGVySWRsZSIsInRpbWVvdXRTb2NrZXRMb3dlckJvdW5kIiwidGltZW91dFNvY2tldE11bHRpcGxpZXIiLCJ1c2VTZWN1cmVUcmFuc3BvcnQiLCJzZWN1cmVNb2RlIiwiX2Nvbm5lY3Rpb25SZWFkeSIsIl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCIsIl9jbGllbnRRdWV1ZSIsIl9jYW5TZW5kIiwiX3RhZ0NvdW50ZXIiLCJfY3VycmVudENvbW1hbmQiLCJfaWRsZVRpbWVyIiwiX3NvY2tldFRpbWVvdXRUaW1lciIsImNvbXByZXNzZWQiLCJfaW5jb21pbmdCdWZmZXJzIiwiX2J1ZmZlclN0YXRlIiwiX2xpdGVyYWxSZW1haW5pbmciLCJvbmNlcnQiLCJvbmVycm9yIiwib25yZWFkeSIsIm9uaWRsZSIsImNvbm5lY3QiLCJTb2NrZXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNvY2tldCIsIm9wZW4iLCJiaW5hcnlUeXBlIiwiY2EiLCJjZXJ0IiwiRSIsIm9uY2xvc2UiLCJfb25FcnJvciIsIkVycm9yIiwib25kYXRhIiwiZXZ0IiwiX29uRGF0YSIsImVyciIsImUiLCJkYXRhIiwibWVzc2FnZSIsIm9ub3BlbiIsImNsb3NlIiwiZXJyb3IiLCJ0ZWFyRG93biIsImZvckVhY2giLCJjbWQiLCJjYWxsYmFjayIsImNsZWFyVGltZW91dCIsIl9kaXNhYmxlQ29tcHJlc3Npb24iLCJyZWFkeVN0YXRlIiwibG9nb3V0IiwidGhlbiIsImNhdGNoIiwiZW5xdWV1ZUNvbW1hbmQiLCJ1cGdyYWRlIiwidXBncmFkZVRvU2VjdXJlIiwicmVxdWVzdCIsImFjY2VwdFVudGFnZ2VkIiwiY29tbWFuZCIsImNvbmNhdCIsIm1hcCIsInVudGFnZ2VkIiwidG9TdHJpbmciLCJ0b1VwcGVyQ2FzZSIsInRyaW0iLCJ0YWciLCJwYXlsb2FkIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwicmVzcG9uc2UiLCJpc0Vycm9yIiwiaW5kZXhPZiIsImh1bWFuUmVhZGFibGUiLCJjb2RlIiwiT2JqZWN0Iiwia2V5cyIsImtleSIsImluZGV4IiwiY3R4Iiwic3BsaWNlIiwicHVzaCIsIl9zZW5kUmVxdWVzdCIsImdldFByZXZpb3VzbHlRdWV1ZWQiLCJjb21tYW5kcyIsInN0YXJ0SW5kZXgiLCJpIiwiaXNNYXRjaCIsInNlbmQiLCJzdHIiLCJidWZmZXIiLCJ0aW1lb3V0IiwiTWF0aCIsImZsb29yIiwiYnl0ZUxlbmd0aCIsInNldFRpbWVvdXQiLCJfc2VuZENvbXByZXNzZWQiLCJzZXRIYW5kbGVyIiwibG9nZ2VyIiwiVWludDhBcnJheSIsIl9wYXJzZUluY29taW5nQ29tbWFuZHMiLCJfaXRlcmF0ZUluY29taW5nQnVmZmVyIiwiYnVmIiwiZGlmZiIsIm1pbiIsIk51bWJlciIsIl9sZW5ndGhCdWZmZXIiLCJzdGFydCIsImxhdGVzdCIsInN1YmFycmF5IiwicHJldkJ1ZiIsInNldCIsImxlZnRJZHgiLCJsZWZ0T2ZMZWZ0Q3VybHkiLCJMRmlkeCIsImNvbW1hbmRMZW5ndGgiLCJyZWR1Y2UiLCJwcmV2IiwiY3VyciIsInVpbnQ4QXJyYXkiLCJzaGlmdCIsInJlbWFpbmluZ0xlbmd0aCIsImV4Y2Vzc0xlbmd0aCIsIl9jbGVhcklkbGUiLCJjaHVuayIsImVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lIiwidmFsdWVBc1N0cmluZyIsImRlYnVnIiwiX3Byb2Nlc3NSZXNwb25zZSIsIl9oYW5kbGVSZXNwb25zZSIsIl9lbnRlcklkbGUiLCJfcmVzdGFydFF1ZXVlIiwicHJlY2hlY2siLCJjb250ZXh0Iiwid2FpdERyYWluIiwiYXR0cmlidXRlcyIsInRlc3QiLCJ0eXBlIiwibnIiLCJ2YWx1ZSIsInNlY3Rpb24iLCJvcHRpb24iLCJBcnJheSIsImlzQXJyYXkiLCJ0b0xvd2VyQ2FzZSIsInByb3RvdHlwZSIsImNhbGwiLCJtYXRjaCIsImVuYWJsZUNvbXByZXNzaW9uIiwiX3NvY2tldE9uRGF0YSIsIndpbmRvdyIsIldvcmtlciIsIl9jb21wcmVzc2lvbldvcmtlciIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsIkJsb2IiLCJDb21wcmVzc2lvbkJsb2IiLCJvbm1lc3NhZ2UiLCJwb3N0TWVzc2FnZSIsImNyZWF0ZU1lc3NhZ2UiLCJpbmZsYXRlZFJlYWR5IiwiZGVmbGF0ZWRSZWFkeSIsIl9jb21wcmVzc2lvbiIsImluZmxhdGUiLCJ0ZXJtaW5hdGUiLCJkZWZsYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUdBO0FBQ0E7QUFDQTs7QUFDQSxNQUFNQSw0QkFBNEIsT0FBbEM7QUFDQSxNQUFNQyxrQkFBa0IsU0FBeEI7QUFDQSxNQUFNQyw4QkFBOEIsZ0JBQXBDO0FBQ0EsTUFBTUMsa0JBQWtCLFNBQXhCO0FBQ0EsTUFBTUMsOEJBQThCLGdCQUFwQzs7QUFFQSxNQUFNQyxNQUFNLE1BQVo7QUFDQSxNQUFNQyxZQUFZLEVB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QXJCOztBQUVBLFFBQUksS0FBS0csa0JBQVQsRUFBNkI7QUFDM0I7QUFDQSxXQUFLQSxrQkFBTCxDQUF3QlksU0FBeEI7QUFDQSxXQUFLWixrQkFBTCxHQUEwQixJQUExQjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7O0FBS0F4RCxrQkFBaUJOLE1BQWpCLEVBQXlCO0FBQ3ZCO0FBQ0EsUUFBSSxLQUFLOEQsa0JBQVQsRUFBNkI7QUFDM0IsV0FBS0Esa0JBQUwsQ0FBd0JNLFdBQXhCLENBQW9DQyxjQUFjcEwsZUFBZCxFQUErQitHLE1BQS9CLENBQXBDLEVBQTRFLENBQUNBLE1BQUQsQ0FBNUU7QUFDRCxLQUZELE1BRU87QUFDTCxXQUFLd0UsWUFBTCxDQUFrQkcsT0FBbEIsQ0FBMEIzRSxNQUExQjtBQUNEO0FBQ0Y7QUExd0J1Qjs7a0JBQUxoRyxJO0FBNndCckIsTUFBTXFLLGdCQUFnQixDQUFDdkgsT0FBRCxFQUFVa0QsTUFBVixNQUFzQixFQUFFbEQsT0FBRixFQUFXa0QsTUFBWCxFQUF0QixDQUF0QiIsImZpbGUiOiJpbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcHJvcE9yIH0gZnJvbSAncmFtZGEnXG5pbXBvcnQgVENQU29ja2V0IGZyb20gJ2VtYWlsanMtdGNwLXNvY2tldCdcbmltcG9ydCB7IHRvVHlwZWRBcnJheSwgZnJvbVR5cGVkQXJyYXkgfSBmcm9tICcuL2NvbW1vbidcbmltcG9ydCB7IHBhcnNlciwgY29tcGlsZXIgfSBmcm9tICdlbWFpbGpzLWltYXAtaGFuZGxlcidcbmltcG9ydCBDb21wcmVzc2lvbiBmcm9tICcuL2NvbXByZXNzaW9uJ1xuaW1wb3J0IENvbXByZXNzaW9uQmxvYiBmcm9tICcuLi9yZXMvY29tcHJlc3Npb24ud29ya2VyLmJsb2InXG5cbi8vXG4vLyBjb25zdGFudHMgdXNlZCBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIHRoZSB3b3JrZXJcbi8vXG5jb25zdCBNRVNTQUdFX0lOSVRJQUxJWkVfV09SS0VSID0gJ3N0YXJ0J1xuY29uc3QgTUVTU0FHRV9JTkZMQVRFID0gJ2luZmxhdGUnXG5jb25zdCBNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFkgPSAnaW5mbGF0ZWRfcmVhZHknXG5jb25zdCBNRVNTQUdFX0RFRkxBVEUgPSAnZGVmbGF0ZSdcbmNvbnN0IE1FU1NBR0VfREVGTEFURURfREFUQV9SRUFEWSA9ICdkZWZsYXRlZF9yZWFkeSdcblxuY29uc3QgRU9MID0gJ1xcclxcbidcbmNvbnN0IExJTkVfRkVFRCA9IDEwXG5jb25zdCBDQVJSSUFHRV9SRVRVUk4gPSAxM1xuY29uc3QgTEVGVF9DVVJMWV9CUkFDS0VUID0gMTIzXG5jb25zdCBSSUdIVF9DVVJMWV9CUkFDS0VUID0gMTI1XG5cbmNvbnN0IEFTQ0lJX1BMVVMgPSA0M1xuXG4vLyBTdGF0ZSB0cmFja2luZyB3aGVuIGNvbnN0cnVjdGluZyBhbiBJTUFQIGNvbW1hbmQgZnJvbSBidWZmZXJzLlxuY29uc3QgQlVGRkVSX1NUQVRFX0xJVEVSQUwgPSAnbGl0ZXJhbCdcbmNvbnN0IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xID0gJ2xpdGVyYWxfbGVuZ3RoXzEnXG5jb25zdCBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMiA9ICdsaXRlcmFsX2xlbmd0aF8yJ1xuY29uc3QgQlVGRkVSX1NUQVRFX0RFRkFVTFQgPSAnZGVmYXVsdCdcblxuLyoqXG4gKiBIb3cgbXVjaCB0aW1lIHRvIHdhaXQgc2luY2UgdGhlIGxhc3QgcmVzcG9uc2UgdW50aWwgdGhlIGNvbm5lY3Rpb24gaXMgY29uc2lkZXJlZCBpZGxpbmdcbiAqL1xuY29uc3QgVElNRU9VVF9FTlRFUl9JRExFID0gMTAwMFxuXG4vKipcbiAqIExvd2VyIEJvdW5kIGZvciBzb2NrZXQgdGltZW91dCB0byB3YWl0IHNpbmNlIHRoZSBsYXN0IGRhdGEgd2FzIHdyaXR0ZW4gdG8gYSBzb2NrZXRcbiAqL1xuY29uc3QgVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkQgPSAxMDAwMFxuXG4vKipcbiAqIE11bHRpcGxpZXIgZm9yIHNvY2tldCB0aW1lb3V0OlxuICpcbiAqIFdlIGFzc3VtZSBhdCBsZWFzdCBhIEdQUlMgY29ubmVjdGlvbiB3aXRoIDExNSBrYi9zID0gMTQsMzc1IGtCL3MgdG9wcywgc28gMTAgS0IvcyB0byBiZSBvblxuICogdGhlIHNhZmUgc2lkZS4gV2UgY2FuIHRpbWVvdXQgYWZ0ZXIgYSBsb3dlciBib3VuZCBvZiAxMHMgKyAobiBLQiAvIDEwIEtCL3MpLiBBIDEgTUIgbWVzc2FnZVxuICogdXBsb2FkIHdvdWxkIGJlIDExMCBzZWNvbmRzIHRvIHdhaXQgZm9yIHRoZSB0aW1lb3V0LiAxMCBLQi9zID09PSAwLjEgcy9CXG4gKi9cbmNvbnN0IFRJTUVPVVRfU09DS0VUX01VTFRJUExJRVIgPSAwLjFcblxuLyoqXG4gKiBDcmVhdGVzIGEgY29ubmVjdGlvbiBvYmplY3QgdG8gYW4gSU1BUCBzZXJ2ZXIuIENhbGwgYGNvbm5lY3RgIG1ldGhvZCB0byBpbml0aXRhdGVcbiAqIHRoZSBhY3R1YWwgY29ubmVjdGlvbiwgdGhlIGNvbnN0cnVjdG9yIG9ubHkgZGVmaW5lcyB0aGUgcHJvcGVydGllcyBidXQgZG9lcyBub3QgYWN0dWFsbHkgY29ubmVjdC5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW2hvc3Q9J2xvY2FsaG9zdCddIEhvc3RuYW1lIHRvIGNvbmVuY3QgdG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBbcG9ydD0xNDNdIFBvcnQgbnVtYmVyIHRvIGNvbm5lY3QgdG9cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uYWwgb3B0aW9ucyBvYmplY3RcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0XSBTZXQgdG8gdHJ1ZSwgdG8gdXNlIGVuY3J5cHRlZCBjb25uZWN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuY29tcHJlc3Npb25Xb3JrZXJQYXRoXSBvZmZsb2FkcyBkZS0vY29tcHJlc3Npb24gY29tcHV0YXRpb24gdG8gYSB3ZWIgd29ya2VyLCB0aGlzIGlzIHRoZSBwYXRoIHRvIHRoZSBicm93c2VyaWZpZWQgZW1haWxqcy1jb21wcmVzc29yLXdvcmtlci5qc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFwIHtcbiAgY29uc3RydWN0b3IgKGhvc3QsIHBvcnQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMudGltZW91dEVudGVySWRsZSA9IFRJTUVPVVRfRU5URVJfSURMRVxuICAgIHRoaXMudGltZW91dFNvY2tldExvd2VyQm91bmQgPSBUSU1FT1VUX1NPQ0tFVF9MT1dFUl9CT1VORFxuICAgIHRoaXMudGltZW91dFNvY2tldE11bHRpcGxpZXIgPSBUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSXG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG5cbiAgICB0aGlzLnBvcnQgPSBwb3J0IHx8ICh0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0ID8gOTkzIDogMTQzKVxuICAgIHRoaXMuaG9zdCA9IGhvc3QgfHwgJ2xvY2FsaG9zdCdcblxuICAgIC8vIFVzZSBhIFRMUyBjb25uZWN0aW9uLiBQb3J0IDk5MyBhbHNvIGZvcmNlcyBUTFMuXG4gICAgdGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCA9ICd1c2VTZWN1cmVUcmFuc3BvcnQnIGluIHRoaXMub3B0aW9ucyA/ICEhdGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCA6IHRoaXMucG9ydCA9PT0gOTkzXG5cbiAgICB0aGlzLnNlY3VyZU1vZGUgPSAhIXRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgLy8gRG9lcyB0aGUgY29ubmVjdGlvbiB1c2UgU1NML1RMU1xuXG4gICAgdGhpcy5fY29ubmVjdGlvblJlYWR5ID0gZmFsc2UgLy8gSXMgdGhlIGNvbmVjdGlvbiBlc3RhYmxpc2hlZCBhbmQgZ3JlZXRpbmcgaXMgcmVjZWl2ZWQgZnJvbSB0aGUgc2VydmVyXG5cbiAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCA9IHt9IC8vIEdsb2JhbCBoYW5kbGVycyBmb3IgdW5yZWxhdGVkIHJlc3BvbnNlcyAoRVhQVU5HRSwgRVhJU1RTIGV0Yy4pXG5cbiAgICB0aGlzLl9jbGllbnRRdWV1ZSA9IFtdIC8vIFF1ZXVlIG9mIG91dGdvaW5nIGNvbW1hbmRzXG4gICAgdGhpcy5fY2FuU2VuZCA9IGZhbHNlIC8vIElzIGl0IE9LIHRvIHNlbmQgc29tZXRoaW5nIHRvIHRoZSBzZXJ2ZXJcbiAgICB0aGlzLl90YWdDb3VudGVyID0gMCAvLyBDb3VudGVyIHRvIGFsbG93IHVuaXF1ZXVlIGltYXAgdGFnc1xuICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kID0gZmFsc2UgLy8gQ3VycmVudCBjb21tYW5kIHRoYXQgaXMgd2FpdGluZyBmb3IgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyXG5cbiAgICB0aGlzLl9pZGxlVGltZXIgPSBmYWxzZSAvLyBUaW1lciB3YWl0aW5nIHRvIGVudGVyIGlkbGVcbiAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBmYWxzZSAvLyBUaW1lciB3YWl0aW5nIHRvIGRlY2xhcmUgdGhlIHNvY2tldCBkZWFkIHN0YXJ0aW5nIGZyb20gdGhlIGxhc3Qgd3JpdGVcblxuICAgIHRoaXMuY29tcHJlc3NlZCA9IGZhbHNlIC8vIElzIHRoZSBjb25uZWN0aW9uIGNvbXByZXNzZWQgYW5kIG5lZWRzIGluZmxhdGluZy9kZWZsYXRpbmdcblxuICAgIC8vXG4gICAgLy8gSEVMUEVSU1xuICAgIC8vXG5cbiAgICAvLyBBcyB0aGUgc2VydmVyIHNlbmRzIGRhdGEgaW4gY2h1bmtzLCBpdCBuZWVkcyB0byBiZSBzcGxpdCBpbnRvIHNlcGFyYXRlIGxpbmVzLiBIZWxwcyBwYXJzaW5nIHRoZSBpbnB1dC5cbiAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgPSBbXVxuICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICB0aGlzLl9saXRlcmFsUmVtYWluaW5nID0gMFxuXG4gICAgLy9cbiAgICAvLyBFdmVudCBwbGFjZWhvbGRlcnMsIG1heSBiZSBvdmVycmlkZW4gd2l0aCBjYWxsYmFjayBmdW5jdGlvbnNcbiAgICAvL1xuICAgIHRoaXMub25jZXJ0ID0gbnVsbFxuICAgIHRoaXMub25lcnJvciA9IG51bGwgLy8gSXJyZWNvdmVyYWJsZSBlcnJvciBvY2N1cnJlZC4gQ29ubmVjdGlvbiB0byB0aGUgc2VydmVyIHdpbGwgYmUgY2xvc2VkIGF1dG9tYXRpY2FsbHkuXG4gICAgdGhpcy5vbnJlYWR5ID0gbnVsbCAvLyBUaGUgY29ubmVjdGlvbiB0byB0aGUgc2VydmVyIGhhcyBiZWVuIGVzdGFibGlzaGVkIGFuZCBncmVldGluZyBpcyByZWNlaXZlZFxuICAgIHRoaXMub25pZGxlID0gbnVsbCAgLy8gVGhlcmUgYXJlIG5vIG1vcmUgY29tbWFuZHMgdG8gcHJvY2Vzc1xuICB9XG5cbiAgLy8gUFVCTElDIE1FVEhPRFNcblxuICAvKipcbiAgICogSW5pdGlhdGUgYSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuIFdhaXQgZm9yIG9ucmVhZHkgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFNvY2tldFxuICAgKiAgICAgVEVTVElORyBPTkxZISBUaGUgVENQU29ja2V0IGhhcyBhIHByZXR0eSBub25zZW5zaWNhbCBjb252ZW5pZW5jZSBjb25zdHJ1Y3RvcixcbiAgICogICAgIHdoaWNoIG1ha2VzIGl0IGhhcmQgdG8gbW9jay4gRm9yIGRlcGVuZGVuY3ktaW5qZWN0aW9uIHB1cnBvc2VzLCB3ZSB1c2UgdGhlXG4gICAqICAgICBTb2NrZXQgcGFyYW1ldGVyIHRvIHBhc3MgaW4gYSBtb2NrIFNvY2tldCBpbXBsZW1lbnRhdGlvbi4gU2hvdWxkIGJlIGxlZnQgYmxhbmtcbiAgICogICAgIGluIHByb2R1Y3Rpb24gdXNlIVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBzb2NrZXQgaXMgb3BlbmVkXG4gICAqL1xuICBjb25uZWN0IChTb2NrZXQgPSBUQ1BTb2NrZXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zb2NrZXQgPSBTb2NrZXQub3Blbih0aGlzLmhvc3QsIHRoaXMucG9ydCwge1xuICAgICAgICBiaW5hcnlUeXBlOiAnYXJyYXlidWZmZXInLFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IHRoaXMuc2VjdXJlTW9kZSxcbiAgICAgICAgY2E6IHRoaXMub3B0aW9ucy5jYVxuICAgICAgfSlcblxuICAgICAgLy8gYWxsb3dzIGNlcnRpZmljYXRlIGhhbmRsaW5nIGZvciBwbGF0Zm9ybSB3L28gbmF0aXZlIHRscyBzdXBwb3J0XG4gICAgICAvLyBvbmNlcnQgaXMgbm9uIHN0YW5kYXJkIHNvIHNldHRpbmcgaXQgbWlnaHQgdGhyb3cgaWYgdGhlIHNvY2tldCBvYmplY3QgaXMgaW1tdXRhYmxlXG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnNvY2tldC5vbmNlcnQgPSAoY2VydCkgPT4geyB0aGlzLm9uY2VydCAmJiB0aGlzLm9uY2VydChjZXJ0KSB9XG4gICAgICB9IGNhdGNoIChFKSB7IH1cblxuICAgICAgLy8gQ29ubmVjdGlvbiBjbG9zaW5nIHVuZXhwZWN0ZWQgaXMgYW4gZXJyb3JcbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignU29ja2V0IGNsb3NlZCB1bmV4Y2VwdGVkbHkhJykpXG4gICAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSAoZXZ0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fb25EYXRhKGV2dClcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5fb25FcnJvcihlcnIpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaWYgYW4gZXJyb3IgaGFwcGVucyBkdXJpbmcgY3JlYXRlIHRpbWUsIHJlamVjdCB0aGUgcHJvbWlzZVxuICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBvcGVuIHNvY2tldDogJyArIGUuZGF0YS5tZXNzYWdlKSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zb2NrZXQub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAvLyB1c2UgcHJvcGVyIFwiaXJyZWNvdmVyYWJsZSBlcnJvciwgdGVhciBkb3duIGV2ZXJ5dGhpbmdcIi1oYW5kbGVyIG9ubHkgYWZ0ZXIgc29ja2V0IGlzIG9wZW5cbiAgICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlKSA9PiB0aGlzLl9vbkVycm9yKGUpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIHNvY2tldCBpcyBjbG9zZWRcbiAgICovXG4gIGNsb3NlIChlcnJvcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgdmFyIHRlYXJEb3duID0gKCkgPT4ge1xuICAgICAgICAvLyBmdWxmaWxsIHBlbmRpbmcgcHJvbWlzZXNcbiAgICAgICAgdGhpcy5fY2xpZW50UXVldWUuZm9yRWFjaChjbWQgPT4gY21kLmNhbGxiYWNrKGVycm9yKSlcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kKSB7XG4gICAgICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQuY2FsbGJhY2soZXJyb3IpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jbGllbnRRdWV1ZSA9IFtdXG4gICAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kID0gZmFsc2VcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVyKVxuICAgICAgICB0aGlzLl9pZGxlVGltZXIgPSBudWxsXG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lcilcbiAgICAgICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgICAgIC8vIHJlbW92ZSBhbGwgbGlzdGVuZXJzXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25vcGVuID0gbnVsbFxuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSBudWxsXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25kYXRhID0gbnVsbFxuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSBudWxsXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9uY2VydCA9IG51bGxcbiAgICAgICAgICB9IGNhdGNoIChFKSB7IH1cblxuICAgICAgICAgIHRoaXMuc29ja2V0ID0gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Rpc2FibGVDb21wcmVzc2lvbigpXG5cbiAgICAgIGlmICghdGhpcy5zb2NrZXQgfHwgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSAhPT0gJ29wZW4nKSB7XG4gICAgICAgIHJldHVybiB0ZWFyRG93bigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSB0aGlzLnNvY2tldC5vbmVycm9yID0gdGVhckRvd24gLy8gd2UgZG9uJ3QgcmVhbGx5IGNhcmUgYWJvdXQgdGhlIGVycm9yIGhlcmVcbiAgICAgIHRoaXMuc29ja2V0LmNsb3NlKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgTE9HT1VUIHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIFVzZSBpcyBkaXNjb3VyYWdlZCFcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gY29ubmVjdGlvbiBpcyBjbG9zZWQgYnkgc2VydmVyLlxuICAgKi9cbiAgbG9nb3V0ICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoJ0NsaWVudCBsb2dnaW5nIG91dCcpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVucXVldWVDb21tYW5kKCdMT0dPVVQnKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhdGVzIFRMUyBoYW5kc2hha2VcbiAgICovXG4gIHVwZ3JhZGUgKCkge1xuICAgIHRoaXMuc2VjdXJlTW9kZSA9IHRydWVcbiAgICB0aGlzLnNvY2tldC51cGdyYWRlVG9TZWN1cmUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyBhIGNvbW1hbmQgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VtYWlsanMvZW1haWxqcy1pbWFwLWhhbmRsZXIgZm9yIHJlcXVlc3Qgc3RydWN0dXJlLlxuICAgKiBEbyBub3QgcHJvdmlkZSBhIHRhZyBwcm9wZXJ0eSwgaXQgd2lsbCBiZSBzZXQgYnkgdGhlIHF1ZXVlIG1hbmFnZXIuXG4gICAqXG4gICAqIFRvIGNhdGNoIHVudGFnZ2VkIHJlc3BvbnNlcyB1c2UgYWNjZXB0VW50YWdnZWQgcHJvcGVydHkuIEZvciBleGFtcGxlLCBpZlxuICAgKiB0aGUgdmFsdWUgZm9yIGl0IGlzICdGRVRDSCcgdGhlbiB0aGUgcmVwb25zZSBpbmNsdWRlcyAncGF5bG9hZC5GRVRDSCcgcHJvcGVydHlcbiAgICogdGhhdCBpcyBhbiBhcnJheSBpbmNsdWRpbmcgYWxsIGxpc3RlZCAqIEZFVENIIHJlc3BvbnNlcy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3QgU3RydWN0dXJlZCByZXF1ZXN0IG9iamVjdFxuICAgKiBAcGFyYW0ge0FycmF5fSBhY2NlcHRVbnRhZ2dlZCBhIGxpc3Qgb2YgdW50YWdnZWQgcmVzcG9uc2VzIHRoYXQgd2lsbCBiZSBpbmNsdWRlZCBpbiAncGF5bG9hZCcgcHJvcGVydHlcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25hbCBkYXRhIGZvciB0aGUgY29tbWFuZCBwYXlsb2FkXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgY29ycmVzcG9uZGluZyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICovXG4gIGVucXVldWVDb21tYW5kIChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2YgcmVxdWVzdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlcXVlc3QgPSB7XG4gICAgICAgIGNvbW1hbmQ6IHJlcXVlc3RcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhY2NlcHRVbnRhZ2dlZCA9IFtdLmNvbmNhdChhY2NlcHRVbnRhZ2dlZCB8fCBbXSkubWFwKCh1bnRhZ2dlZCkgPT4gKHVudGFnZ2VkIHx8ICcnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkudHJpbSgpKVxuXG4gICAgdmFyIHRhZyA9ICdXJyArICgrK3RoaXMuX3RhZ0NvdW50ZXIpXG4gICAgcmVxdWVzdC50YWcgPSB0YWdcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgIHBheWxvYWQ6IGFjY2VwdFVudGFnZ2VkLmxlbmd0aCA/IHt9IDogdW5kZWZpbmVkLFxuICAgICAgICBjYWxsYmFjazogKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFcnJvcihyZXNwb25zZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgfSBlbHNlIGlmIChbJ05PJywgJ0JBRCddLmluZGV4T2YocHJvcE9yKCcnLCAnY29tbWFuZCcsIHJlc3BvbnNlKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSkgPj0gMCkge1xuICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHJlc3BvbnNlLmh1bWFuUmVhZGFibGUgfHwgJ0Vycm9yJylcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5jb2RlKSB7XG4gICAgICAgICAgICAgIGVycm9yLmNvZGUgPSByZXNwb25zZS5jb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYXBwbHkgYW55IGFkZGl0aW9uYWwgb3B0aW9ucyB0byB0aGUgY29tbWFuZFxuICAgICAgT2JqZWN0LmtleXMob3B0aW9ucyB8fCB7fSkuZm9yRWFjaCgoa2V5KSA9PiB7IGRhdGFba2V5XSA9IG9wdGlvbnNba2V5XSB9KVxuXG4gICAgICBhY2NlcHRVbnRhZ2dlZC5mb3JFYWNoKChjb21tYW5kKSA9PiB7IGRhdGEucGF5bG9hZFtjb21tYW5kXSA9IFtdIH0pXG5cbiAgICAgIC8vIGlmIHdlJ3JlIGluIHByaW9yaXR5IG1vZGUgKGkuZS4gd2UgcmFuIGNvbW1hbmRzIGluIGEgcHJlY2hlY2spLFxuICAgICAgLy8gcXVldWUgYW55IGNvbW1hbmRzIEJFRk9SRSB0aGUgY29tbWFuZCB0aGF0IGNvbnRpYW5lZCB0aGUgcHJlY2hlY2ssXG4gICAgICAvLyBvdGhlcndpc2UganVzdCBxdWV1ZSBjb21tYW5kIGFzIHVzdWFsXG4gICAgICB2YXIgaW5kZXggPSBkYXRhLmN0eCA/IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoZGF0YS5jdHgpIDogLTFcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIGRhdGEudGFnICs9ICcucCdcbiAgICAgICAgZGF0YS5yZXF1ZXN0LnRhZyArPSAnLnAnXG4gICAgICAgIHRoaXMuX2NsaWVudFF1ZXVlLnNwbGljZShpbmRleCwgMCwgZGF0YSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NsaWVudFF1ZXVlLnB1c2goZGF0YSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2NhblNlbmQpIHtcbiAgICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIGNvbW1hbmRzXG4gICAqIEBwYXJhbSBjdHhcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRQcmV2aW91c2x5UXVldWVkIChjb21tYW5kcywgY3R4KSB7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoY3R4KSAtIDFcblxuICAgIC8vIHNlYXJjaCBiYWNrd2FyZHMgZm9yIHRoZSBjb21tYW5kcyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBmb3VuZFxuICAgIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKGlzTWF0Y2godGhpcy5fY2xpZW50UXVldWVbaV0pKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGllbnRRdWV1ZVtpXVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFsc28gY2hlY2sgY3VycmVudCBjb21tYW5kIGlmIG5vIFNFTEVDVCBpcyBxdWV1ZWRcbiAgICBpZiAoaXNNYXRjaCh0aGlzLl9jdXJyZW50Q29tbWFuZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50Q29tbWFuZFxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuXG4gICAgZnVuY3Rpb24gaXNNYXRjaCAoZGF0YSkge1xuICAgICAgcmV0dXJuIGRhdGEgJiYgZGF0YS5yZXF1ZXN0ICYmIGNvbW1hbmRzLmluZGV4T2YoZGF0YS5yZXF1ZXN0LmNvbW1hbmQpID49IDBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBkYXRhIHRvIHRoZSBUQ1Agc29ja2V0XG4gICAqIEFybXMgYSB0aW1lb3V0IHdhaXRpbmcgZm9yIGEgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFBheWxvYWRcbiAgICovXG4gIHNlbmQgKHN0cikge1xuICAgIGNvbnN0IGJ1ZmZlciA9IHRvVHlwZWRBcnJheShzdHIpLmJ1ZmZlclxuICAgIGNvbnN0IHRpbWVvdXQgPSB0aGlzLnRpbWVvdXRTb2NrZXRMb3dlckJvdW5kICsgTWF0aC5mbG9vcihidWZmZXIuYnl0ZUxlbmd0aCAqIHRoaXMudGltZW91dFNvY2tldE11bHRpcGxpZXIpXG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKSAvLyBjbGVhciBwZW5kaW5nIHRpbWVvdXRzXG4gICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignIFNvY2tldCB0aW1lZCBvdXQhJykpLCB0aW1lb3V0KSAvLyBhcm0gdGhlIG5leHQgdGltZW91dFxuXG4gICAgaWYgKHRoaXMuY29tcHJlc3NlZCkge1xuICAgICAgdGhpcy5fc2VuZENvbXByZXNzZWQoYnVmZmVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgZ2xvYmFsIGhhbmRsZXIgZm9yIGFuIHVudGFnZ2VkIHJlc3BvbnNlLiBJZiBjdXJyZW50bHkgcHJvY2Vzc2VkIGNvbW1hbmRcbiAgICogaGFzIG5vdCBsaXN0ZWQgdW50YWdnZWQgY29tbWFuZCBpdCBpcyBmb3J3YXJkZWQgdG8gdGhlIGdsb2JhbCBoYW5kbGVyLiBVc2VmdWxcbiAgICogd2l0aCBFWFBVTkdFLCBFWElTVFMgZXRjLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tbWFuZCBVbnRhZ2dlZCBjb21tYW5kIG5hbWVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgZnVuY3Rpb24gd2l0aCByZXNwb25zZSBvYmplY3QgYW5kIGNvbnRpbnVlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqL1xuICBzZXRIYW5kbGVyIChjb21tYW5kLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkW2NvbW1hbmQudG9VcHBlckNhc2UoKS50cmltKCldID0gY2FsbGJhY2tcbiAgfVxuXG4gIC8vIElOVEVSTkFMIEVWRU5UU1xuXG4gIC8qKlxuICAgKiBFcnJvciBoYW5kbGVyIGZvciB0aGUgc29ja2V0XG4gICAqXG4gICAqIEBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgRXZlbnQgb2JqZWN0LiBTZWUgZXZ0LmRhdGEgZm9yIHRoZSBlcnJvclxuICAgKi9cbiAgX29uRXJyb3IgKGV2dCkge1xuICAgIHZhciBlcnJvclxuICAgIGlmICh0aGlzLmlzRXJyb3IoZXZ0KSkge1xuICAgICAgZXJyb3IgPSBldnRcbiAgICB9IGVsc2UgaWYgKGV2dCAmJiB0aGlzLmlzRXJyb3IoZXZ0LmRhdGEpKSB7XG4gICAgICBlcnJvciA9IGV2dC5kYXRhXG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKChldnQgJiYgZXZ0LmRhdGEgJiYgZXZ0LmRhdGEubWVzc2FnZSkgfHwgZXZ0LmRhdGEgfHwgZXZ0IHx8ICdFcnJvcicpXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3IpXG5cbiAgICAvLyBhbHdheXMgY2FsbCBvbmVycm9yIGNhbGxiYWNrLCBubyBtYXR0ZXIgaWYgY2xvc2UoKSBzdWNjZWVkcyBvciBmYWlsc1xuICAgIHRoaXMuY2xvc2UoZXJyb3IpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5vbmVycm9yICYmIHRoaXMub25lcnJvcihlcnJvcilcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycm9yKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3IgaW5jb21pbmcgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuIFRoZSBkYXRhIGlzIHNlbnQgaW4gYXJiaXRyYXJ5XG4gICAqIGNodW5rcyBhbmQgY2FuJ3QgYmUgdXNlZCBkaXJlY3RseSBzbyB0aGlzIGZ1bmN0aW9uIG1ha2VzIHN1cmUgdGhlIGRhdGFcbiAgICogaXMgc3BsaXQgaW50byBjb21wbGV0ZSBsaW5lcyBiZWZvcmUgdGhlIGRhdGEgaXMgcGFzc2VkIHRvIHRoZSBjb21tYW5kXG4gICAqIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAqL1xuICBfb25EYXRhIChldnQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKSAvLyByZXNldCB0aGUgdGltZW91dCBvbiBlYWNoIGRhdGEgcGFja2V0XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMudGltZW91dFNvY2tldExvd2VyQm91bmQgKyBNYXRoLmZsb29yKDQwOTYgKiB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyKSAvLyBtYXggcGFja2V0IHNpemUgaXMgNDA5NiBieXRlc1xuICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJyBTb2NrZXQgdGltZWQgb3V0IScpKSwgdGltZW91dClcblxuICAgIHRoaXMuX2luY29taW5nQnVmZmVycy5wdXNoKG5ldyBVaW50OEFycmF5KGV2dC5kYXRhKSkgLy8gYXBwZW5kIHRvIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgICB0aGlzLl9wYXJzZUluY29taW5nQ29tbWFuZHModGhpcy5faXRlcmF0ZUluY29taW5nQnVmZmVyKCkpIC8vIENvbnN1bWUgdGhlIGluY29taW5nIGJ1ZmZlclxuICB9XG5cbiAgKiBfaXRlcmF0ZUluY29taW5nQnVmZmVyICgpIHtcbiAgICBsZXQgYnVmID0gdGhpcy5faW5jb21pbmdCdWZmZXJzW3RoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggLSAxXSB8fCBbXVxuICAgIGxldCBpID0gMFxuXG4gICAgLy8gbG9vcCBpbnZhcmlhbnQ6XG4gICAgLy8gICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgc3RhcnRzIHdpdGggdGhlIGJlZ2lubmluZyBvZiBpbmNvbWluZyBjb21tYW5kLlxuICAgIC8vICAgYnVmIGlzIHNob3J0aGFuZCBmb3IgbGFzdCBlbGVtZW50IG9mIHRoaXMuX2luY29taW5nQnVmZmVycy5cbiAgICAvLyAgIGJ1ZlswLi5pLTFdIGlzIHBhcnQgb2YgaW5jb21pbmcgY29tbWFuZC5cbiAgICB3aGlsZSAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgIHN3aXRjaCAodGhpcy5fYnVmZmVyU3RhdGUpIHtcbiAgICAgICAgY2FzZSBCVUZGRVJfU1RBVEVfTElURVJBTDpcbiAgICAgICAgICBjb25zdCBkaWZmID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIGksIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcpXG4gICAgICAgICAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyAtPSBkaWZmXG4gICAgICAgICAgaSArPSBkaWZmXG4gICAgICAgICAgaWYgKHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjYXNlIEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8yOlxuICAgICAgICAgIGlmIChpIDwgYnVmLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGJ1ZltpXSA9PT0gQ0FSUklBR0VfUkVUVVJOKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPSBOdW1iZXIoZnJvbVR5cGVkQXJyYXkodGhpcy5fbGVuZ3RoQnVmZmVyKSkgKyAyIC8vIGZvciBDUkxGXG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0xJVEVSQUxcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjYXNlIEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xOlxuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gaVxuICAgICAgICAgIHdoaWxlIChpIDwgYnVmLmxlbmd0aCAmJiBidWZbaV0gPj0gNDggJiYgYnVmW2ldIDw9IDU3KSB7IC8vIGRpZ2l0c1xuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGFydCAhPT0gaSkge1xuICAgICAgICAgICAgY29uc3QgbGF0ZXN0ID0gYnVmLnN1YmFycmF5KHN0YXJ0LCBpKVxuICAgICAgICAgICAgY29uc3QgcHJldkJ1ZiA9IHRoaXMuX2xlbmd0aEJ1ZmZlclxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkocHJldkJ1Zi5sZW5ndGggKyBsYXRlc3QubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyLnNldChwcmV2QnVmKVxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyLnNldChsYXRlc3QsIHByZXZCdWYubGVuZ3RoKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sZW5ndGhCdWZmZXIubGVuZ3RoID4gMCAmJiBidWZbaV0gPT09IFJJR0hUX0NVUkxZX0JSQUNLRVQpIHtcbiAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xlbmd0aEJ1ZmZlclxuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKytcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIGZpbmQgbGl0ZXJhbCBsZW5ndGhcbiAgICAgICAgICBjb25zdCBsZWZ0SWR4ID0gYnVmLmluZGV4T2YoTEVGVF9DVVJMWV9CUkFDS0VULCBpKVxuICAgICAgICAgIGlmIChsZWZ0SWR4ID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlZnRPZkxlZnRDdXJseSA9IG5ldyBVaW50OEFycmF5KGJ1Zi5idWZmZXIsIGksIGxlZnRJZHggLSBpKVxuICAgICAgICAgICAgaWYgKGxlZnRPZkxlZnRDdXJseS5pbmRleE9mKExJTkVfRkVFRCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgIGkgPSBsZWZ0SWR4ICsgMVxuICAgICAgICAgICAgICB0aGlzLl9sZW5ndGhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgwKVxuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZmluZCBlbmQgb2YgY29tbWFuZFxuICAgICAgICAgIGNvbnN0IExGaWR4ID0gYnVmLmluZGV4T2YoTElORV9GRUVELCBpKVxuICAgICAgICAgIGlmIChMRmlkeCA+IC0xKSB7XG4gICAgICAgICAgICBpZiAoTEZpZHggPCBidWYubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnNbdGhpcy5faW5jb21pbmdCdWZmZXJzLmxlbmd0aCAtIDFdID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ1ZmZlciwgMCwgTEZpZHggKyAxKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29tbWFuZExlbmd0aCA9IHRoaXMuX2luY29taW5nQnVmZmVycy5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYgKyBjdXJyLmxlbmd0aCwgMCkgLSAyIC8vIDIgZm9yIENSTEZcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgVWludDhBcnJheShjb21tYW5kTGVuZ3RoKVxuICAgICAgICAgICAgbGV0IGluZGV4ID0gMFxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGxldCB1aW50OEFycmF5ID0gdGhpcy5faW5jb21pbmdCdWZmZXJzLnNoaWZ0KClcblxuICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdMZW5ndGggPSBjb21tYW5kTGVuZ3RoIC0gaW5kZXhcbiAgICAgICAgICAgICAgaWYgKHVpbnQ4QXJyYXkubGVuZ3RoID4gcmVtYWluaW5nTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhjZXNzTGVuZ3RoID0gdWludDhBcnJheS5sZW5ndGggLSByZW1haW5pbmdMZW5ndGhcbiAgICAgICAgICAgICAgICB1aW50OEFycmF5ID0gdWludDhBcnJheS5zdWJhcnJheSgwLCAtZXhjZXNzTGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgPSBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb21tYW5kLnNldCh1aW50OEFycmF5LCBpbmRleClcbiAgICAgICAgICAgICAgaW5kZXggKz0gdWludDhBcnJheS5sZW5ndGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlpZWxkIGNvbW1hbmRcbiAgICAgICAgICAgIGlmIChMRmlkeCA8IGJ1Zi5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGJ1Zi5zdWJhcnJheShMRmlkeCArIDEpKVxuICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMucHVzaChidWYpXG4gICAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBjbGVhciB0aGUgdGltZW91dCB3aGVuIGFuIGVudGlyZSBjb21tYW5kIGhhcyBhcnJpdmVkXG4gICAgICAgICAgICAgIC8vIGFuZCBub3Qgd2FpdGluZyBvbiBtb3JlIGRhdGEgZm9yIG5leHQgY29tbWFuZFxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKVxuICAgICAgICAgICAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBudWxsXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUFJJVkFURSBNRVRIT0RTXG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyBhIGNvbW1hbmQgZnJvbSB0aGUgcXVldWUuIFRoZSBjb21tYW5kIGlzIHBhcnNlZCBhbmQgZmVlZGVkIHRvIGEgaGFuZGxlclxuICAgKi9cbiAgX3BhcnNlSW5jb21pbmdDb21tYW5kcyAoY29tbWFuZHMpIHtcbiAgICBmb3IgKHZhciBjb21tYW5kIG9mIGNvbW1hbmRzKSB7XG4gICAgICB0aGlzLl9jbGVhcklkbGUoKVxuXG4gICAgICAvKlxuICAgICAgICogVGhlIFwiK1wiLXRhZ2dlZCByZXNwb25zZSBpcyBhIHNwZWNpYWwgY2FzZTpcbiAgICAgICAqIEVpdGhlciB0aGUgc2VydmVyIGNhbiBhc2tzIGZvciB0aGUgbmV4dCBjaHVuayBvZiBkYXRhLCBlLmcuIGZvciB0aGUgQVVUSEVOVElDQVRFIGNvbW1hbmQuXG4gICAgICAgKlxuICAgICAgICogT3IgdGhlcmUgd2FzIGFuIGVycm9yIGluIHRoZSBYT0FVVEgyIGF1dGhlbnRpY2F0aW9uLCBmb3Igd2hpY2ggU0FTTCBpbml0aWFsIGNsaWVudCByZXNwb25zZSBleHRlbnNpb25cbiAgICAgICAqIGRpY3RhdGVzIHRoZSBjbGllbnQgc2VuZHMgYW4gZW1wdHkgRU9MIHJlc3BvbnNlIHRvIHRoZSBjaGFsbGVuZ2UgY29udGFpbmluZyB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgICAqXG4gICAgICAgKiBEZXRhaWxzIG9uIFwiK1wiLXRhZ2dlZCByZXNwb25zZTpcbiAgICAgICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi0yLjIuMVxuICAgICAgICovXG4gICAgICAvL1xuICAgICAgaWYgKGNvbW1hbmRbMF0gPT09IEFTQ0lJX1BMVVMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gZmVlZCB0aGUgbmV4dCBjaHVuayBvZiBkYXRhXG4gICAgICAgICAgdmFyIGNodW5rID0gdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5zaGlmdCgpXG4gICAgICAgICAgY2h1bmsgKz0gKCF0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLmxlbmd0aCA/IEVPTCA6ICcnKSAvLyBFT0wgaWYgdGhlcmUncyBub3RoaW5nIG1vcmUgdG8gc2VuZFxuICAgICAgICAgIHRoaXMuc2VuZChjaHVuaylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5lcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSkge1xuICAgICAgICAgIHRoaXMuc2VuZChFT0wpIC8vIFhPQVVUSDIgZW1wdHkgcmVzcG9uc2UsIGVycm9yIHdpbGwgYmUgcmVwb3J0ZWQgd2hlbiBzZXJ2ZXIgY29udGludWVzIHdpdGggTk8gcmVzcG9uc2VcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgcmVzcG9uc2VcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHZhbHVlQXNTdHJpbmcgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0ICYmIHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QudmFsdWVBc1N0cmluZ1xuICAgICAgICByZXNwb25zZSA9IHBhcnNlcihjb21tYW5kLCB7IHZhbHVlQXNTdHJpbmcgfSlcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1M6JywgKCkgPT4gY29tcGlsZXIocmVzcG9uc2UsIGZhbHNlLCB0cnVlKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHBhcnNpbmcgaW1hcCBjb21tYW5kIScsIHJlc3BvbnNlKVxuICAgICAgICByZXR1cm4gdGhpcy5fb25FcnJvcihlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICB0aGlzLl9oYW5kbGVSZXNwb25zZShyZXNwb25zZSlcblxuICAgICAgLy8gZmlyc3QgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLCBjb25uZWN0aW9uIGlzIG5vdyB1c2FibGVcbiAgICAgIGlmICghdGhpcy5fY29ubmVjdGlvblJlYWR5KSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25SZWFkeSA9IHRydWVcbiAgICAgICAgdGhpcy5vbnJlYWR5ICYmIHRoaXMub25yZWFkeSgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZlZWRzIGEgcGFyc2VkIHJlc3BvbnNlIG9iamVjdCB0byBhbiBhcHByb3ByaWF0ZSBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgY29tbWFuZCBvYmplY3RcbiAgICovXG4gIF9oYW5kbGVSZXNwb25zZSAocmVzcG9uc2UpIHtcbiAgICB2YXIgY29tbWFuZCA9IHByb3BPcignJywgJ2NvbW1hbmQnLCByZXNwb25zZSkudG9VcHBlckNhc2UoKS50cmltKClcblxuICAgIGlmICghdGhpcy5fY3VycmVudENvbW1hbmQpIHtcbiAgICAgIC8vIHVuc29saWNpdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgY29tbWFuZCBpbiB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCkge1xuICAgICAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgICAgICAgdGhpcy5fY2FuU2VuZCA9IHRydWVcbiAgICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZCAmJiByZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQpIHtcbiAgICAgIC8vIGV4cGVjdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkW2NvbW1hbmRdLnB1c2gocmVzcG9uc2UpXG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkKSB7XG4gICAgICAvLyB1bmV4cGVjdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnRhZyA9PT0gdGhpcy5fY3VycmVudENvbW1hbmQudGFnKSB7XG4gICAgICAvLyB0YWdnZWQgcmVzcG9uc2VcbiAgICAgIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkICYmIE9iamVjdC5rZXlzKHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQpLmxlbmd0aCkge1xuICAgICAgICByZXNwb25zZS5wYXlsb2FkID0gdGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZFxuICAgICAgfVxuICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQuY2FsbGJhY2socmVzcG9uc2UpXG4gICAgICB0aGlzLl9jYW5TZW5kID0gdHJ1ZVxuICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIGNvbW1hbmQgZnJvbSBjbGllbnQgcXVldWUgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIF9zZW5kUmVxdWVzdCAoKSB7XG4gICAgaWYgKCF0aGlzLl9jbGllbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbnRlcklkbGUoKVxuICAgIH1cbiAgICB0aGlzLl9jbGVhcklkbGUoKVxuXG4gICAgLy8gYW4gb3BlcmF0aW9uIHdhcyBtYWRlIGluIHRoZSBwcmVjaGVjaywgbm8gbmVlZCB0byByZXN0YXJ0IHRoZSBxdWV1ZSBtYW51YWxseVxuICAgIHRoaXMuX3Jlc3RhcnRRdWV1ZSA9IGZhbHNlXG5cbiAgICB2YXIgY29tbWFuZCA9IHRoaXMuX2NsaWVudFF1ZXVlWzBdXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kLnByZWNoZWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyByZW1lbWJlciB0aGUgY29udGV4dFxuICAgICAgdmFyIGNvbnRleHQgPSBjb21tYW5kXG4gICAgICB2YXIgcHJlY2hlY2sgPSBjb250ZXh0LnByZWNoZWNrXG4gICAgICBkZWxldGUgY29udGV4dC5wcmVjaGVja1xuXG4gICAgICAvLyB3ZSBuZWVkIHRvIHJlc3RhcnQgdGhlIHF1ZXVlIGhhbmRsaW5nIGlmIG5vIG9wZXJhdGlvbiB3YXMgbWFkZSBpbiB0aGUgcHJlY2hlY2tcbiAgICAgIHRoaXMuX3Jlc3RhcnRRdWV1ZSA9IHRydWVcblxuICAgICAgLy8gaW52b2tlIHRoZSBwcmVjaGVjayBjb21tYW5kIGFuZCByZXN1bWUgbm9ybWFsIG9wZXJhdGlvbiBhZnRlciB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgcHJlY2hlY2soY29udGV4dCkudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIHdlJ3JlIGRvbmUgd2l0aCB0aGUgcHJlY2hlY2tcbiAgICAgICAgaWYgKHRoaXMuX3Jlc3RhcnRRdWV1ZSkge1xuICAgICAgICAgIC8vIHdlIG5lZWQgdG8gcmVzdGFydCB0aGUgcXVldWUgaGFuZGxpbmdcbiAgICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgLy8gcHJlY2hlY2sgZmFpbGVkLCBzbyB3ZSByZW1vdmUgdGhlIGluaXRpYWwgY29tbWFuZFxuICAgICAgICAvLyBmcm9tIHRoZSBxdWV1ZSwgaW52b2tlIGl0cyBjYWxsYmFjayBhbmQgcmVzdW1lIG5vcm1hbCBvcGVyYXRpb25cbiAgICAgICAgbGV0IGNtZFxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoY29udGV4dClcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBjbWQgPSB0aGlzLl9jbGllbnRRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpWzBdXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNtZCAmJiBjbWQuY2FsbGJhY2spIHtcbiAgICAgICAgICBjbWQuY2FsbGJhY2soZXJyKVxuICAgICAgICAgIHRoaXMuX2NhblNlbmQgPSB0cnVlXG4gICAgICAgICAgdGhpcy5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKHRoaXMuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpKSAvLyBDb25zdW1lIHRoZSByZXN0IG9mIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpIC8vIGNvbnRpbnVlIHNlbmRpbmdcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2NhblNlbmQgPSBmYWxzZVxuICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kID0gdGhpcy5fY2xpZW50UXVldWUuc2hpZnQoKVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEgPSBjb21waWxlcih0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0LCB0cnVlKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0M6JywgKCkgPT4gY29tcGlsZXIodGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdCwgZmFsc2UsIHRydWUpKSAvLyBleGNsdWRlcyBwYXNzd29yZHMgZXRjLlxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBjb21waWxpbmcgaW1hcCBjb21tYW5kIScsIHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QpXG4gICAgICByZXR1cm4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ0Vycm9yIGNvbXBpbGluZyBpbWFwIGNvbW1hbmQhJykpXG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLnNoaWZ0KClcblxuICAgIHRoaXMuc2VuZChkYXRhICsgKCF0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLmxlbmd0aCA/IEVPTCA6ICcnKSlcbiAgICByZXR1cm4gdGhpcy53YWl0RHJhaW5cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBvbmlkbGUsIG5vdGluZyB0byBkbyBjdXJyZW50bHlcbiAgICovXG4gIF9lbnRlcklkbGUgKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZXIpXG4gICAgdGhpcy5faWRsZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiAodGhpcy5vbmlkbGUgJiYgdGhpcy5vbmlkbGUoKSksIHRoaXMudGltZW91dEVudGVySWRsZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgaWRsZSB0aW1lclxuICAgKi9cbiAgX2NsZWFySWRsZSAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lcilcbiAgICB0aGlzLl9pZGxlVGltZXIgPSBudWxsXG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHByb2Nlc3NlcyBhIHJlc3BvbnNlIGludG8gYW4gZWFzaWVyIHRvIGhhbmRsZSBmb3JtYXQuXG4gICAqIEFkZCB1bnRhZ2dlZCBudW1iZXJlZCByZXNwb25zZXMgKGUuZy4gRkVUQ0gpIGludG8gYSBuaWNlbHkgZmVhc2libGUgZm9ybVxuICAgKiBDaGVja3MgaWYgYSByZXNwb25zZSBpbmNsdWRlcyBvcHRpb25hbCByZXNwb25zZSBjb2Rlc1xuICAgKiBhbmQgY29waWVzIHRoZXNlIGludG8gc2VwYXJhdGUgcHJvcGVydGllcy4gRm9yIGV4YW1wbGUgdGhlXG4gICAqIGZvbGxvd2luZyByZXNwb25zZSBpbmNsdWRlcyBhIGNhcGFiaWxpdHkgbGlzdGluZyBhbmQgYSBodW1hblxuICAgKiByZWFkYWJsZSBtZXNzYWdlOlxuICAgKlxuICAgKiAgICAgKiBPSyBbQ0FQQUJJTElUWSBJRCBOQU1FU1BBQ0VdIEFsbCByZWFkeVxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBhZGRzIGEgJ2NhcGFiaWxpdHknIHByb3BlcnR5IHdpdGggYW4gYXJyYXkgdmFsdWUgWydJRCcsICdOQU1FU1BBQ0UnXVxuICAgKiB0byB0aGUgcmVzcG9uc2Ugb2JqZWN0LiBBZGRpdGlvbmFsbHkgJ0FsbCByZWFkeScgaXMgYWRkZWQgYXMgJ2h1bWFuUmVhZGFibGUnIHByb3BlcnR5LlxuICAgKlxuICAgKiBTZWUgcG9zc2libGVtIElNQVAgUmVzcG9uc2UgQ29kZXMgYXQgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU1MzBcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCByZXNwb25zZSBvYmplY3RcbiAgICovXG4gIF9wcm9jZXNzUmVzcG9uc2UgKHJlc3BvbnNlKSB7XG4gICAgbGV0IGNvbW1hbmQgPSBwcm9wT3IoJycsICdjb21tYW5kJywgcmVzcG9uc2UpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG5cbiAgICAvLyBubyBhdHRyaWJ1dGVzXG4gICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2UuYXR0cmlidXRlcyB8fCAhcmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHVudGFnZ2VkIHJlc3BvbnNlcyB3LyBzZXF1ZW5jZSBudW1iZXJzXG4gICAgaWYgKHJlc3BvbnNlLnRhZyA9PT0gJyonICYmIC9eXFxkKyQvLnRlc3QocmVzcG9uc2UuY29tbWFuZCkgJiYgcmVzcG9uc2UuYXR0cmlidXRlc1swXS50eXBlID09PSAnQVRPTScpIHtcbiAgICAgIHJlc3BvbnNlLm5yID0gTnVtYmVyKHJlc3BvbnNlLmNvbW1hbmQpXG4gICAgICByZXNwb25zZS5jb21tYW5kID0gKHJlc3BvbnNlLmF0dHJpYnV0ZXMuc2hpZnQoKS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgIH1cblxuICAgIC8vIG5vIG9wdGlvbmFsIHJlc3BvbnNlIGNvZGVcbiAgICBpZiAoWydPSycsICdOTycsICdCQUQnLCAnQllFJywgJ1BSRUFVVEgnXS5pbmRleE9mKGNvbW1hbmQpIDwgMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gSWYgbGFzdCBlbGVtZW50IG9mIHRoZSByZXNwb25zZSBpcyBURVhUIHRoZW4gdGhpcyBpcyBmb3IgaHVtYW5zXG4gICAgaWYgKHJlc3BvbnNlLmF0dHJpYnV0ZXNbcmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGggLSAxXS50eXBlID09PSAnVEVYVCcpIHtcbiAgICAgIHJlc3BvbnNlLmh1bWFuUmVhZGFibGUgPSByZXNwb25zZS5hdHRyaWJ1dGVzW3Jlc3BvbnNlLmF0dHJpYnV0ZXMubGVuZ3RoIC0gMV0udmFsdWVcbiAgICB9XG5cbiAgICAvLyBQYXJzZSBhbmQgZm9ybWF0IEFUT00gdmFsdWVzXG4gICAgaWYgKHJlc3BvbnNlLmF0dHJpYnV0ZXNbMF0udHlwZSA9PT0gJ0FUT00nICYmIHJlc3BvbnNlLmF0dHJpYnV0ZXNbMF0uc2VjdGlvbikge1xuICAgICAgY29uc3Qgb3B0aW9uID0gcmVzcG9uc2UuYXR0cmlidXRlc1swXS5zZWN0aW9uLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5KSkge1xuICAgICAgICAgIHJldHVybiBrZXkubWFwKChrZXkpID0+IChrZXkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAoa2V5LnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGtleSA9IG9wdGlvbi5zaGlmdCgpXG4gICAgICByZXNwb25zZS5jb2RlID0ga2V5XG5cbiAgICAgIGlmIChvcHRpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJlc3BvbnNlW2tleS50b0xvd2VyQ2FzZSgpXSA9IG9wdGlvblswXVxuICAgICAgfSBlbHNlIGlmIChvcHRpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICByZXNwb25zZVtrZXkudG9Mb3dlckNhc2UoKV0gPSBvcHRpb25cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYW4gRXJyb3Igb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlIFZhbHVlIHRvIGJlIGNoZWNrZWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gcmV0dXJucyB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBhbiBFcnJvclxuICAgKi9cbiAgaXNFcnJvciAodmFsdWUpIHtcbiAgICByZXR1cm4gISFPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLm1hdGNoKC9FcnJvclxcXSQvKVxuICB9XG5cbiAgLy8gQ09NUFJFU1NJT04gUkVMQVRFRCBNRVRIT0RTXG5cbiAgLyoqXG4gICAqIFNldHMgdXAgZGVmbGF0ZS9pbmZsYXRlIGZvciB0aGUgSU9cbiAgICovXG4gIGVuYWJsZUNvbXByZXNzaW9uICgpIHtcbiAgICB0aGlzLl9zb2NrZXRPbkRhdGEgPSB0aGlzLnNvY2tldC5vbmRhdGFcbiAgICB0aGlzLmNvbXByZXNzZWQgPSB0cnVlXG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lldvcmtlcikge1xuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW0NvbXByZXNzaW9uQmxvYl0pKSlcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyLm9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gZS5kYXRhLm1lc3NhZ2VcbiAgICAgICAgdmFyIGRhdGEgPSBlLmRhdGEuYnVmZmVyXG5cbiAgICAgICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICAgICAgY2FzZSBNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFk6XG4gICAgICAgICAgICB0aGlzLl9zb2NrZXRPbkRhdGEoeyBkYXRhIH0pXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgY2FzZSBNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFk6XG4gICAgICAgICAgICB0aGlzLndhaXREcmFpbiA9IHRoaXMuc29ja2V0LnNlbmQoZGF0YSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIub25lcnJvciA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuX29uRXJyb3IobmV3IEVycm9yKCdFcnJvciBoYW5kbGluZyBjb21wcmVzc2lvbiB3ZWIgd29ya2VyOiAnICsgZS5tZXNzYWdlKSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UoY3JlYXRlTWVzc2FnZShNRVNTQUdFX0lOSVRJQUxJWkVfV09SS0VSKSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5mbGF0ZWRSZWFkeSA9IChidWZmZXIpID0+IHsgdGhpcy5fc29ja2V0T25EYXRhKHsgZGF0YTogYnVmZmVyIH0pIH1cbiAgICAgIGNvbnN0IGRlZmxhdGVkUmVhZHkgPSAoYnVmZmVyKSA9PiB7IHRoaXMud2FpdERyYWluID0gdGhpcy5zb2NrZXQuc2VuZChidWZmZXIpIH1cbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uID0gbmV3IENvbXByZXNzaW9uKGluZmxhdGVkUmVhZHksIGRlZmxhdGVkUmVhZHkpXG4gICAgfVxuXG4gICAgLy8gb3ZlcnJpZGUgZGF0YSBoYW5kbGVyLCBkZWNvbXByZXNzIGluY29taW5nIGRhdGFcbiAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSAoZXZ0KSA9PiB7XG4gICAgICBpZiAoIXRoaXMuY29tcHJlc3NlZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2NvbXByZXNzaW9uV29ya2VyKSB7XG4gICAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyLnBvc3RNZXNzYWdlKGNyZWF0ZU1lc3NhZ2UoTUVTU0FHRV9JTkZMQVRFLCBldnQuZGF0YSksIFtldnQuZGF0YV0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb21wcmVzc2lvbi5pbmZsYXRlKGV2dC5kYXRhKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVbmRvZXMgYW55IGNoYW5nZXMgcmVsYXRlZCB0byBjb21wcmVzc2lvbi4gVGhpcyBvbmx5IGJlIGNhbGxlZCB3aGVuIGNsb3NpbmcgdGhlIGNvbm5lY3Rpb25cbiAgICovXG4gIF9kaXNhYmxlQ29tcHJlc3Npb24gKCkge1xuICAgIGlmICghdGhpcy5jb21wcmVzc2VkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmNvbXByZXNzZWQgPSBmYWxzZVxuICAgIHRoaXMuc29ja2V0Lm9uZGF0YSA9IHRoaXMuX3NvY2tldE9uRGF0YVxuICAgIHRoaXMuX3NvY2tldE9uRGF0YSA9IG51bGxcblxuICAgIGlmICh0aGlzLl9jb21wcmVzc2lvbldvcmtlcikge1xuICAgICAgLy8gdGVybWluYXRlIHRoZSB3b3JrZXJcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyLnRlcm1pbmF0ZSgpXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlciA9IG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3V0Z29pbmcgcGF5bG9hZCBuZWVkcyB0byBiZSBjb21wcmVzc2VkIGFuZCBzZW50IHRvIHNvY2tldFxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBidWZmZXIgT3V0Z29pbmcgdW5jb21wcmVzc2VkIGFycmF5YnVmZmVyXG4gICAqL1xuICBfc2VuZENvbXByZXNzZWQgKGJ1ZmZlcikge1xuICAgIC8vIGRlZmxhdGVcbiAgICBpZiAodGhpcy5fY29tcHJlc3Npb25Xb3JrZXIpIHtcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyLnBvc3RNZXNzYWdlKGNyZWF0ZU1lc3NhZ2UoTUVTU0FHRV9ERUZMQVRFLCBidWZmZXIpLCBbYnVmZmVyXSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29tcHJlc3Npb24uZGVmbGF0ZShidWZmZXIpXG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGNyZWF0ZU1lc3NhZ2UgPSAobWVzc2FnZSwgYnVmZmVyKSA9PiAoeyBtZXNzYWdlLCBidWZmZXIgfSlcbiJdfQ==