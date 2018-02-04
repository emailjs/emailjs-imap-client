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
    this._socketTimeoutTimer = setTimeout(() => this._onError(new Error(' Socket timed out!')), this.ON_DATA_TIMEOUT);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLmpzIl0sIm5hbWVzIjpbIk1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIiLCJNRVNTQUdFX0lORkxBVEUiLCJNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFkiLCJNRVNTQUdFX0RFRkxBVEUiLCJNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkiLCJFT0wiLCJMSU5FX0ZFRUQiLCJDQVJSSUFHRV9SRVRVUk4iLCJMRUZUX0NVUkxZX0JSQUNLRVQiLCJSSUdIVF9DVVJMWV9CUkFDS0VUIiwiQVNDSUlfUExVUyIsIkJVRkZFUl9TVEFURV9MSVRFUkFMIiwiQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzEiLCJCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMiIsIkJVRkZFUl9TVEFURV9ERUZBVUxUIiwiVElNRU9VVF9FTlRFUl9JRExFIiwiVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkQiLCJUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSIiwiSW1hcCIsImNvbnN0cnVjdG9yIiwiaG9zdCIsInBvcnQiLCJvcHRpb25zIiwidGltZW91dEVudGVySWRsZSIsInRpbWVvdXRTb2NrZXRMb3dlckJvdW5kIiwidGltZW91dFNvY2tldE11bHRpcGxpZXIiLCJvbkRhdGFUaW1lb3V0IiwiTWF0aCIsImZsb29yIiwidXNlU2VjdXJlVHJhbnNwb3J0Iiwic2VjdXJlTW9kZSIsIl9jb25uZWN0aW9uUmVhZHkiLCJfZ2xvYmFsQWNjZXB0VW50YWdnZWQiLCJfY2xpZW50UXVldWUiLCJfY2FuU2VuZCIsIl90YWdDb3VudGVyIiwiX2N1cnJlbnRDb21tYW5kIiwiX2lkbGVUaW1lciIsIl9zb2NrZXRUaW1lb3V0VGltZXIiLCJjb21wcmVzc2VkIiwiX2luY29taW5nQnVmZmVycyIsIl9idWZmZXJTdGF0ZSIsIl9saXRlcmFsUmVtYWluaW5nIiwib25jZXJ0Iiwib25lcnJvciIsIm9ucmVhZHkiLCJvbmlkbGUiLCJjb25uZWN0IiwiU29ja2V0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzb2NrZXQiLCJvcGVuIiwiYmluYXJ5VHlwZSIsImNhIiwiY2VydCIsIkUiLCJvbmNsb3NlIiwiX29uRXJyb3IiLCJFcnJvciIsIm9uZGF0YSIsImV2dCIsIl9vbkRhdGEiLCJlcnIiLCJlIiwiZGF0YSIsIm1lc3NhZ2UiLCJvbm9wZW4iLCJjbG9zZSIsImVycm9yIiwidGVhckRvd24iLCJmb3JFYWNoIiwiY21kIiwiY2FsbGJhY2siLCJjbGVhclRpbWVvdXQiLCJfZGlzYWJsZUNvbXByZXNzaW9uIiwicmVhZHlTdGF0ZSIsImxvZ291dCIsInRoZW4iLCJjYXRjaCIsImVucXVldWVDb21tYW5kIiwidXBncmFkZSIsInVwZ3JhZGVUb1NlY3VyZSIsInJlcXVlc3QiLCJhY2NlcHRVbnRhZ2dlZCIsImNvbW1hbmQiLCJjb25jYXQiLCJtYXAiLCJ1bnRhZ2dlZCIsInRvU3RyaW5nIiwidG9VcHBlckNhc2UiLCJ0cmltIiwidGFnIiwicGF5bG9hZCIsImxlbmd0aCIsInVuZGVmaW5lZCIsInJlc3BvbnNlIiwiaXNFcnJvciIsImluZGV4T2YiLCJodW1hblJlYWRhYmxlIiwiY29kZSIsIk9iamVjdCIsImtleXMiLCJrZXkiLCJpbmRleCIsImN0eCIsInNwbGljZSIsInB1c2giLCJfc2VuZFJlcXVlc3QiLCJnZXRQcmV2aW91c2x5UXVldWVkIiwiY29tbWFuZHMiLCJzdGFydEluZGV4IiwiaSIsImlzTWF0Y2giLCJzZW5kIiwic3RyIiwiYnVmZmVyIiwidGltZW91dCIsImJ5dGVMZW5ndGgiLCJzZXRUaW1lb3V0IiwiX3NlbmRDb21wcmVzc2VkIiwic2V0SGFuZGxlciIsImxvZ2dlciIsIk9OX0RBVEFfVElNRU9VVCIsIlVpbnQ4QXJyYXkiLCJfcGFyc2VJbmNvbWluZ0NvbW1hbmRzIiwiX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlciIsImJ1ZiIsImRpZmYiLCJtaW4iLCJOdW1iZXIiLCJfbGVuZ3RoQnVmZmVyIiwic3RhcnQiLCJsYXRlc3QiLCJzdWJhcnJheSIsInByZXZCdWYiLCJzZXQiLCJsZWZ0SWR4IiwibGVmdE9mTGVmdEN1cmx5IiwiTEZpZHgiLCJjb21tYW5kTGVuZ3RoIiwicmVkdWNlIiwicHJldiIsImN1cnIiLCJ1aW50OEFycmF5Iiwic2hpZnQiLCJyZW1haW5pbmdMZW5ndGgiLCJleGNlc3NMZW5ndGgiLCJfY2xlYXJJZGxlIiwiY2h1bmsiLCJlcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSIsInZhbHVlQXNTdHJpbmciLCJkZWJ1ZyIsIl9wcm9jZXNzUmVzcG9uc2UiLCJfaGFuZGxlUmVzcG9uc2UiLCJfZW50ZXJJZGxlIiwiX3Jlc3RhcnRRdWV1ZSIsInByZWNoZWNrIiwiY29udGV4dCIsIndhaXREcmFpbiIsImF0dHJpYnV0ZXMiLCJ0ZXN0IiwidHlwZSIsIm5yIiwidmFsdWUiLCJzZWN0aW9uIiwib3B0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwidG9Mb3dlckNhc2UiLCJwcm90b3R5cGUiLCJjYWxsIiwibWF0Y2giLCJlbmFibGVDb21wcmVzc2lvbiIsIl9zb2NrZXRPbkRhdGEiLCJ3aW5kb3ciLCJXb3JrZXIiLCJfY29tcHJlc3Npb25Xb3JrZXIiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJCbG9iIiwiQ29tcHJlc3Npb25CbG9iIiwib25tZXNzYWdlIiwicG9zdE1lc3NhZ2UiLCJjcmVhdGVNZXNzYWdlIiwiaW5mbGF0ZWRSZWFkeSIsImRlZmxhdGVkUmVhZHkiLCJfY29tcHJlc3Npb24iLCJpbmZsYXRlIiwidGVybWluYXRlIiwiZGVmbGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFHQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUEsNEJBQTRCLE9BQWxDO0FBQ0EsTUFBTUMsa0JBQWtCLFNBQXhCO0FBQ0EsTUFBTUMsOEJBQThCLGdCQUFwQztBQUNBLE1BQU1DLGtCQUFrQixTQUF4QjtBQUNBLE1BQU1DLDhCQUE4QixnQkFBcEM7O0FBRUEs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Q0EsU0FBS0EsYUFBTCxHQUFxQixJQUFyQjs7QUFFQSxRQUFJLEtBQUtHLGtCQUFULEVBQTZCO0FBQzNCO0FBQ0EsV0FBS0Esa0JBQUwsQ0FBd0JZLFNBQXhCO0FBQ0EsV0FBS1osa0JBQUwsR0FBMEIsSUFBMUI7QUFDRDtBQUNGOztBQUVEOzs7OztBQUtBekQsa0JBQWlCSixNQUFqQixFQUF5QjtBQUN2QjtBQUNBLFFBQUksS0FBSzZELGtCQUFULEVBQTZCO0FBQzNCLFdBQUtBLGtCQUFMLENBQXdCTSxXQUF4QixDQUFvQ0MsY0FBY3RMLGVBQWQsRUFBK0JrSCxNQUEvQixDQUFwQyxFQUE0RSxDQUFDQSxNQUFELENBQTVFO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsV0FBS3VFLFlBQUwsQ0FBa0JHLE9BQWxCLENBQTBCMUUsTUFBMUI7QUFDRDtBQUNGO0FBMXdCdUI7O2tCQUFMbkcsSTtBQTZ3QnJCLE1BQU11SyxnQkFBZ0IsQ0FBQ3RILE9BQUQsRUFBVWtELE1BQVYsTUFBc0IsRUFBRWxELE9BQUYsRUFBV2tELE1BQVgsRUFBdEIsQ0FBdEIiLCJmaWxlIjoiaW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByb3BPciB9IGZyb20gJ3JhbWRhJ1xuaW1wb3J0IFRDUFNvY2tldCBmcm9tICdlbWFpbGpzLXRjcC1zb2NrZXQnXG5pbXBvcnQgeyB0b1R5cGVkQXJyYXksIGZyb21UeXBlZEFycmF5IH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgeyBwYXJzZXIsIGNvbXBpbGVyIH0gZnJvbSAnZW1haWxqcy1pbWFwLWhhbmRsZXInXG5pbXBvcnQgQ29tcHJlc3Npb24gZnJvbSAnLi9jb21wcmVzc2lvbidcbmltcG9ydCBDb21wcmVzc2lvbkJsb2IgZnJvbSAnLi4vcmVzL2NvbXByZXNzaW9uLndvcmtlci5ibG9iJ1xuXG4vL1xuLy8gY29uc3RhbnRzIHVzZWQgZm9yIGNvbW11bmljYXRpb24gd2l0aCB0aGUgd29ya2VyXG4vL1xuY29uc3QgTUVTU0FHRV9JTklUSUFMSVpFX1dPUktFUiA9ICdzdGFydCdcbmNvbnN0IE1FU1NBR0VfSU5GTEFURSA9ICdpbmZsYXRlJ1xuY29uc3QgTUVTU0FHRV9JTkZMQVRFRF9EQVRBX1JFQURZID0gJ2luZmxhdGVkX3JlYWR5J1xuY29uc3QgTUVTU0FHRV9ERUZMQVRFID0gJ2RlZmxhdGUnXG5jb25zdCBNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkgPSAnZGVmbGF0ZWRfcmVhZHknXG5cbmNvbnN0IEVPTCA9ICdcXHJcXG4nXG5jb25zdCBMSU5FX0ZFRUQgPSAxMFxuY29uc3QgQ0FSUklBR0VfUkVUVVJOID0gMTNcbmNvbnN0IExFRlRfQ1VSTFlfQlJBQ0tFVCA9IDEyM1xuY29uc3QgUklHSFRfQ1VSTFlfQlJBQ0tFVCA9IDEyNVxuXG5jb25zdCBBU0NJSV9QTFVTID0gNDNcblxuLy8gU3RhdGUgdHJhY2tpbmcgd2hlbiBjb25zdHJ1Y3RpbmcgYW4gSU1BUCBjb21tYW5kIGZyb20gYnVmZmVycy5cbmNvbnN0IEJVRkZFUl9TVEFURV9MSVRFUkFMID0gJ2xpdGVyYWwnXG5jb25zdCBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMSA9ICdsaXRlcmFsX2xlbmd0aF8xJ1xuY29uc3QgQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzIgPSAnbGl0ZXJhbF9sZW5ndGhfMidcbmNvbnN0IEJVRkZFUl9TVEFURV9ERUZBVUxUID0gJ2RlZmF1bHQnXG5cbi8qKlxuICogSG93IG11Y2ggdGltZSB0byB3YWl0IHNpbmNlIHRoZSBsYXN0IHJlc3BvbnNlIHVudGlsIHRoZSBjb25uZWN0aW9uIGlzIGNvbnNpZGVyZWQgaWRsaW5nXG4gKi9cbmNvbnN0IFRJTUVPVVRfRU5URVJfSURMRSA9IDEwMDBcblxuLyoqXG4gKiBMb3dlciBCb3VuZCBmb3Igc29ja2V0IHRpbWVvdXQgdG8gd2FpdCBzaW5jZSB0aGUgbGFzdCBkYXRhIHdhcyB3cml0dGVuIHRvIGEgc29ja2V0XG4gKi9cbmNvbnN0IFRJTUVPVVRfU09DS0VUX0xPV0VSX0JPVU5EID0gMTAwMDBcblxuLyoqXG4gKiBNdWx0aXBsaWVyIGZvciBzb2NrZXQgdGltZW91dDpcbiAqXG4gKiBXZSBhc3N1bWUgYXQgbGVhc3QgYSBHUFJTIGNvbm5lY3Rpb24gd2l0aCAxMTUga2IvcyA9IDE0LDM3NSBrQi9zIHRvcHMsIHNvIDEwIEtCL3MgdG8gYmUgb25cbiAqIHRoZSBzYWZlIHNpZGUuIFdlIGNhbiB0aW1lb3V0IGFmdGVyIGEgbG93ZXIgYm91bmQgb2YgMTBzICsgKG4gS0IgLyAxMCBLQi9zKS4gQSAxIE1CIG1lc3NhZ2VcbiAqIHVwbG9hZCB3b3VsZCBiZSAxMTAgc2Vjb25kcyB0byB3YWl0IGZvciB0aGUgdGltZW91dC4gMTAgS0IvcyA9PT0gMC4xIHMvQlxuICovXG5jb25zdCBUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSID0gMC4xXG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbm5lY3Rpb24gb2JqZWN0IHRvIGFuIElNQVAgc2VydmVyLiBDYWxsIGBjb25uZWN0YCBtZXRob2QgdG8gaW5pdGl0YXRlXG4gKiB0aGUgYWN0dWFsIGNvbm5lY3Rpb24sIHRoZSBjb25zdHJ1Y3RvciBvbmx5IGRlZmluZXMgdGhlIHByb3BlcnRpZXMgYnV0IGRvZXMgbm90IGFjdHVhbGx5IGNvbm5lY3QuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtob3N0PSdsb2NhbGhvc3QnXSBIb3N0bmFtZSB0byBjb25lbmN0IHRvXG4gKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9MTQzXSBQb3J0IG51bWJlciB0byBjb25uZWN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0XG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydF0gU2V0IHRvIHRydWUsIHRvIHVzZSBlbmNyeXB0ZWQgY29ubmVjdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmNvbXByZXNzaW9uV29ya2VyUGF0aF0gb2ZmbG9hZHMgZGUtL2NvbXByZXNzaW9uIGNvbXB1dGF0aW9uIHRvIGEgd2ViIHdvcmtlciwgdGhpcyBpcyB0aGUgcGF0aCB0byB0aGUgYnJvd3NlcmlmaWVkIGVtYWlsanMtY29tcHJlc3Nvci13b3JrZXIuanNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hcCB7XG4gIGNvbnN0cnVjdG9yIChob3N0LCBwb3J0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnRpbWVvdXRFbnRlcklkbGUgPSBUSU1FT1VUX0VOVEVSX0lETEVcbiAgICB0aGlzLnRpbWVvdXRTb2NrZXRMb3dlckJvdW5kID0gVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkRcbiAgICB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyID0gVElNRU9VVF9TT0NLRVRfTVVMVElQTElFUlxuICAgIHRoaXMub25EYXRhVGltZW91dCA9IHRoaXMudGltZW91dFNvY2tldExvd2VyQm91bmQgKyBNYXRoLmZsb29yKDQwOTYgKiB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyKVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuXG4gICAgdGhpcy5wb3J0ID0gcG9ydCB8fCAodGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCA/IDk5MyA6IDE0MylcbiAgICB0aGlzLmhvc3QgPSBob3N0IHx8ICdsb2NhbGhvc3QnXG5cbiAgICAvLyBVc2UgYSBUTFMgY29ubmVjdGlvbi4gUG9ydCA5OTMgYWxzbyBmb3JjZXMgVExTLlxuICAgIHRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgPSAndXNlU2VjdXJlVHJhbnNwb3J0JyBpbiB0aGlzLm9wdGlvbnMgPyAhIXRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgOiB0aGlzLnBvcnQgPT09IDk5M1xuXG4gICAgdGhpcy5zZWN1cmVNb2RlID0gISF0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0IC8vIERvZXMgdGhlIGNvbm5lY3Rpb24gdXNlIFNTTC9UTFNcblxuICAgIHRoaXMuX2Nvbm5lY3Rpb25SZWFkeSA9IGZhbHNlIC8vIElzIHRoZSBjb25lY3Rpb24gZXN0YWJsaXNoZWQgYW5kIGdyZWV0aW5nIGlzIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlclxuXG4gICAgdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWQgPSB7fSAvLyBHbG9iYWwgaGFuZGxlcnMgZm9yIHVucmVsYXRlZCByZXNwb25zZXMgKEVYUFVOR0UsIEVYSVNUUyBldGMuKVxuXG4gICAgdGhpcy5fY2xpZW50UXVldWUgPSBbXSAvLyBRdWV1ZSBvZiBvdXRnb2luZyBjb21tYW5kc1xuICAgIHRoaXMuX2NhblNlbmQgPSBmYWxzZSAvLyBJcyBpdCBPSyB0byBzZW5kIHNvbWV0aGluZyB0byB0aGUgc2VydmVyXG4gICAgdGhpcy5fdGFnQ291bnRlciA9IDAgLy8gQ291bnRlciB0byBhbGxvdyB1bmlxdWV1ZSBpbWFwIHRhZ3NcbiAgICB0aGlzLl9jdXJyZW50Q29tbWFuZCA9IGZhbHNlIC8vIEN1cnJlbnQgY29tbWFuZCB0aGF0IGlzIHdhaXRpbmcgZm9yIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlclxuXG4gICAgdGhpcy5faWRsZVRpbWVyID0gZmFsc2UgLy8gVGltZXIgd2FpdGluZyB0byBlbnRlciBpZGxlXG4gICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gZmFsc2UgLy8gVGltZXIgd2FpdGluZyB0byBkZWNsYXJlIHRoZSBzb2NrZXQgZGVhZCBzdGFydGluZyBmcm9tIHRoZSBsYXN0IHdyaXRlXG5cbiAgICB0aGlzLmNvbXByZXNzZWQgPSBmYWxzZSAvLyBJcyB0aGUgY29ubmVjdGlvbiBjb21wcmVzc2VkIGFuZCBuZWVkcyBpbmZsYXRpbmcvZGVmbGF0aW5nXG5cbiAgICAvL1xuICAgIC8vIEhFTFBFUlNcbiAgICAvL1xuXG4gICAgLy8gQXMgdGhlIHNlcnZlciBzZW5kcyBkYXRhIGluIGNodW5rcywgaXQgbmVlZHMgdG8gYmUgc3BsaXQgaW50byBzZXBhcmF0ZSBsaW5lcy4gSGVscHMgcGFyc2luZyB0aGUgaW5wdXQuXG4gICAgdGhpcy5faW5jb21pbmdCdWZmZXJzID0gW11cbiAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyA9IDBcblxuICAgIC8vXG4gICAgLy8gRXZlbnQgcGxhY2Vob2xkZXJzLCBtYXkgYmUgb3ZlcnJpZGVuIHdpdGggY2FsbGJhY2sgZnVuY3Rpb25zXG4gICAgLy9cbiAgICB0aGlzLm9uY2VydCA9IG51bGxcbiAgICB0aGlzLm9uZXJyb3IgPSBudWxsIC8vIElycmVjb3ZlcmFibGUgZXJyb3Igb2NjdXJyZWQuIENvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciB3aWxsIGJlIGNsb3NlZCBhdXRvbWF0aWNhbGx5LlxuICAgIHRoaXMub25yZWFkeSA9IG51bGwgLy8gVGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciBoYXMgYmVlbiBlc3RhYmxpc2hlZCBhbmQgZ3JlZXRpbmcgaXMgcmVjZWl2ZWRcbiAgICB0aGlzLm9uaWRsZSA9IG51bGwgIC8vIFRoZXJlIGFyZSBubyBtb3JlIGNvbW1hbmRzIHRvIHByb2Nlc3NcbiAgfVxuXG4gIC8vIFBVQkxJQyBNRVRIT0RTXG5cbiAgLyoqXG4gICAqIEluaXRpYXRlIGEgY29ubmVjdGlvbiB0byB0aGUgc2VydmVyLiBXYWl0IGZvciBvbnJlYWR5IGV2ZW50XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBTb2NrZXRcbiAgICogICAgIFRFU1RJTkcgT05MWSEgVGhlIFRDUFNvY2tldCBoYXMgYSBwcmV0dHkgbm9uc2Vuc2ljYWwgY29udmVuaWVuY2UgY29uc3RydWN0b3IsXG4gICAqICAgICB3aGljaCBtYWtlcyBpdCBoYXJkIHRvIG1vY2suIEZvciBkZXBlbmRlbmN5LWluamVjdGlvbiBwdXJwb3Nlcywgd2UgdXNlIHRoZVxuICAgKiAgICAgU29ja2V0IHBhcmFtZXRlciB0byBwYXNzIGluIGEgbW9jayBTb2NrZXQgaW1wbGVtZW50YXRpb24uIFNob3VsZCBiZSBsZWZ0IGJsYW5rXG4gICAqICAgICBpbiBwcm9kdWN0aW9uIHVzZSFcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gc29ja2V0IGlzIG9wZW5lZFxuICAgKi9cbiAgY29ubmVjdCAoU29ja2V0ID0gVENQU29ja2V0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuc29ja2V0ID0gU29ja2V0Lm9wZW4odGhpcy5ob3N0LCB0aGlzLnBvcnQsIHtcbiAgICAgICAgYmluYXJ5VHlwZTogJ2FycmF5YnVmZmVyJyxcbiAgICAgICAgdXNlU2VjdXJlVHJhbnNwb3J0OiB0aGlzLnNlY3VyZU1vZGUsXG4gICAgICAgIGNhOiB0aGlzLm9wdGlvbnMuY2FcbiAgICAgIH0pXG5cbiAgICAgIC8vIGFsbG93cyBjZXJ0aWZpY2F0ZSBoYW5kbGluZyBmb3IgcGxhdGZvcm0gdy9vIG5hdGl2ZSB0bHMgc3VwcG9ydFxuICAgICAgLy8gb25jZXJ0IGlzIG5vbiBzdGFuZGFyZCBzbyBzZXR0aW5nIGl0IG1pZ2h0IHRocm93IGlmIHRoZSBzb2NrZXQgb2JqZWN0IGlzIGltbXV0YWJsZVxuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5zb2NrZXQub25jZXJ0ID0gKGNlcnQpID0+IHsgdGhpcy5vbmNlcnQgJiYgdGhpcy5vbmNlcnQoY2VydCkgfVxuICAgICAgfSBjYXRjaCAoRSkgeyB9XG5cbiAgICAgIC8vIENvbm5lY3Rpb24gY2xvc2luZyB1bmV4cGVjdGVkIGlzIGFuIGVycm9yXG4gICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKCkgPT4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ1NvY2tldCBjbG9zZWQgdW5leGNlcHRlZGx5IScpKVxuICAgICAgdGhpcy5zb2NrZXQub25kYXRhID0gKGV2dCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuX29uRGF0YShldnQpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHRoaXMuX29uRXJyb3IoZXJyKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGFuIGVycm9yIGhhcHBlbnMgZHVyaW5nIGNyZWF0ZSB0aW1lLCByZWplY3QgdGhlIHByb21pc2VcbiAgICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoZSkgPT4ge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb3VsZCBub3Qgb3BlbiBzb2NrZXQ6ICcgKyBlLmRhdGEubWVzc2FnZSkpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc29ja2V0Lm9ub3BlbiA9ICgpID0+IHtcbiAgICAgICAgLy8gdXNlIHByb3BlciBcImlycmVjb3ZlcmFibGUgZXJyb3IsIHRlYXIgZG93biBldmVyeXRoaW5nXCItaGFuZGxlciBvbmx5IGFmdGVyIHNvY2tldCBpcyBvcGVuXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoZSkgPT4gdGhpcy5fb25FcnJvcihlKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgY29ubmVjdGlvbiB0byB0aGUgc2VydmVyXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHRoZSBzb2NrZXQgaXMgY2xvc2VkXG4gICAqL1xuICBjbG9zZSAoZXJyb3IpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHZhciB0ZWFyRG93biA9ICgpID0+IHtcbiAgICAgICAgLy8gZnVsZmlsbCBwZW5kaW5nIHByb21pc2VzXG4gICAgICAgIHRoaXMuX2NsaWVudFF1ZXVlLmZvckVhY2goY21kID0+IGNtZC5jYWxsYmFjayhlcnJvcikpXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZCkge1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kLmNhbGxiYWNrKGVycm9yKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY2xpZW50UXVldWUgPSBbXVxuICAgICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZCA9IGZhbHNlXG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lcilcbiAgICAgICAgdGhpcy5faWRsZVRpbWVyID0gbnVsbFxuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIpXG4gICAgICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IG51bGxcblxuICAgICAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgICAgICAvLyByZW1vdmUgYWxsIGxpc3RlbmVyc1xuICAgICAgICAgIHRoaXMuc29ja2V0Lm9ub3BlbiA9IG51bGxcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gbnVsbFxuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uZGF0YSA9IG51bGxcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbmVycm9yID0gbnVsbFxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnNvY2tldC5vbmNlcnQgPSBudWxsXG4gICAgICAgICAgfSBjYXRjaCAoRSkgeyB9XG5cbiAgICAgICAgICB0aGlzLnNvY2tldCA9IG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9kaXNhYmxlQ29tcHJlc3Npb24oKVxuXG4gICAgICBpZiAoIXRoaXMuc29ja2V0IHx8IHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgIT09ICdvcGVuJykge1xuICAgICAgICByZXR1cm4gdGVhckRvd24oKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gdGhpcy5zb2NrZXQub25lcnJvciA9IHRlYXJEb3duIC8vIHdlIGRvbid0IHJlYWxseSBjYXJlIGFib3V0IHRoZSBlcnJvciBoZXJlXG4gICAgICB0aGlzLnNvY2tldC5jbG9zZSgpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIExPR09VVCB0byB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBVc2UgaXMgZGlzY291cmFnZWQhXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIGNvbm5lY3Rpb24gaXMgY2xvc2VkIGJ5IHNlcnZlci5cbiAgICovXG4gIGxvZ291dCAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSB0aGlzLnNvY2tldC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmNsb3NlKCdDbGllbnQgbG9nZ2luZyBvdXQnKS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdClcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbnF1ZXVlQ29tbWFuZCgnTE9HT1VUJylcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYXRlcyBUTFMgaGFuZHNoYWtlXG4gICAqL1xuICB1cGdyYWRlICgpIHtcbiAgICB0aGlzLnNlY3VyZU1vZGUgPSB0cnVlXG4gICAgdGhpcy5zb2NrZXQudXBncmFkZVRvU2VjdXJlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXMgYSBjb21tYW5kIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbWFpbGpzL2VtYWlsanMtaW1hcC1oYW5kbGVyIGZvciByZXF1ZXN0IHN0cnVjdHVyZS5cbiAgICogRG8gbm90IHByb3ZpZGUgYSB0YWcgcHJvcGVydHksIGl0IHdpbGwgYmUgc2V0IGJ5IHRoZSBxdWV1ZSBtYW5hZ2VyLlxuICAgKlxuICAgKiBUbyBjYXRjaCB1bnRhZ2dlZCByZXNwb25zZXMgdXNlIGFjY2VwdFVudGFnZ2VkIHByb3BlcnR5LiBGb3IgZXhhbXBsZSwgaWZcbiAgICogdGhlIHZhbHVlIGZvciBpdCBpcyAnRkVUQ0gnIHRoZW4gdGhlIHJlcG9uc2UgaW5jbHVkZXMgJ3BheWxvYWQuRkVUQ0gnIHByb3BlcnR5XG4gICAqIHRoYXQgaXMgYW4gYXJyYXkgaW5jbHVkaW5nIGFsbCBsaXN0ZWQgKiBGRVRDSCByZXNwb25zZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0IFN0cnVjdHVyZWQgcmVxdWVzdCBvYmplY3RcbiAgICogQHBhcmFtIHtBcnJheX0gYWNjZXB0VW50YWdnZWQgYSBsaXN0IG9mIHVudGFnZ2VkIHJlc3BvbnNlcyB0aGF0IHdpbGwgYmUgaW5jbHVkZWQgaW4gJ3BheWxvYWQnIHByb3BlcnR5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uYWwgZGF0YSBmb3IgdGhlIGNvbW1hbmQgcGF5bG9hZFxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkXG4gICAqL1xuICBlbnF1ZXVlQ29tbWFuZCAocmVxdWVzdCwgYWNjZXB0VW50YWdnZWQsIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIHJlcXVlc3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXF1ZXN0ID0ge1xuICAgICAgICBjb21tYW5kOiByZXF1ZXN0XG4gICAgICB9XG4gICAgfVxuXG4gICAgYWNjZXB0VW50YWdnZWQgPSBbXS5jb25jYXQoYWNjZXB0VW50YWdnZWQgfHwgW10pLm1hcCgodW50YWdnZWQpID0+ICh1bnRhZ2dlZCB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSlcblxuICAgIHZhciB0YWcgPSAnVycgKyAoKyt0aGlzLl90YWdDb3VudGVyKVxuICAgIHJlcXVlc3QudGFnID0gdGFnXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIHRhZzogdGFnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgICBwYXlsb2FkOiBhY2NlcHRVbnRhZ2dlZC5sZW5ndGggPyB7fSA6IHVuZGVmaW5lZCxcbiAgICAgICAgY2FsbGJhY2s6IChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmlzRXJyb3IocmVzcG9uc2UpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgIH0gZWxzZSBpZiAoWydOTycsICdCQUQnXS5pbmRleE9mKHByb3BPcignJywgJ2NvbW1hbmQnLCByZXNwb25zZSkudG9VcHBlckNhc2UoKS50cmltKCkpID49IDApIHtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihyZXNwb25zZS5odW1hblJlYWRhYmxlIHx8ICdFcnJvcicpXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuY29kZSkge1xuICAgICAgICAgICAgICBlcnJvci5jb2RlID0gcmVzcG9uc2UuY29kZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGFwcGx5IGFueSBhZGRpdGlvbmFsIG9wdGlvbnMgdG8gdGhlIGNvbW1hbmRcbiAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMgfHwge30pLmZvckVhY2goKGtleSkgPT4geyBkYXRhW2tleV0gPSBvcHRpb25zW2tleV0gfSlcblxuICAgICAgYWNjZXB0VW50YWdnZWQuZm9yRWFjaCgoY29tbWFuZCkgPT4geyBkYXRhLnBheWxvYWRbY29tbWFuZF0gPSBbXSB9KVxuXG4gICAgICAvLyBpZiB3ZSdyZSBpbiBwcmlvcml0eSBtb2RlIChpLmUuIHdlIHJhbiBjb21tYW5kcyBpbiBhIHByZWNoZWNrKSxcbiAgICAgIC8vIHF1ZXVlIGFueSBjb21tYW5kcyBCRUZPUkUgdGhlIGNvbW1hbmQgdGhhdCBjb250aWFuZWQgdGhlIHByZWNoZWNrLFxuICAgICAgLy8gb3RoZXJ3aXNlIGp1c3QgcXVldWUgY29tbWFuZCBhcyB1c3VhbFxuICAgICAgdmFyIGluZGV4ID0gZGF0YS5jdHggPyB0aGlzLl9jbGllbnRRdWV1ZS5pbmRleE9mKGRhdGEuY3R4KSA6IC0xXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICBkYXRhLnRhZyArPSAnLnAnXG4gICAgICAgIGRhdGEucmVxdWVzdC50YWcgKz0gJy5wJ1xuICAgICAgICB0aGlzLl9jbGllbnRRdWV1ZS5zcGxpY2UoaW5kZXgsIDAsIGRhdGEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jbGllbnRRdWV1ZS5wdXNoKGRhdGEpXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9jYW5TZW5kKSB7XG4gICAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0KClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBjb21tYW5kc1xuICAgKiBAcGFyYW0gY3R4XG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgZ2V0UHJldmlvdXNseVF1ZXVlZCAoY29tbWFuZHMsIGN0eCkge1xuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSB0aGlzLl9jbGllbnRRdWV1ZS5pbmRleE9mKGN0eCkgLSAxXG5cbiAgICAvLyBzZWFyY2ggYmFja3dhcmRzIGZvciB0aGUgY29tbWFuZHMgYW5kIHJldHVybiB0aGUgZmlyc3QgZm91bmRcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmIChpc01hdGNoKHRoaXMuX2NsaWVudFF1ZXVlW2ldKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2xpZW50UXVldWVbaV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhbHNvIGNoZWNrIGN1cnJlbnQgY29tbWFuZCBpZiBubyBTRUxFQ1QgaXMgcXVldWVkXG4gICAgaWYgKGlzTWF0Y2godGhpcy5fY3VycmVudENvbW1hbmQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudENvbW1hbmRcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcblxuICAgIGZ1bmN0aW9uIGlzTWF0Y2ggKGRhdGEpIHtcbiAgICAgIHJldHVybiBkYXRhICYmIGRhdGEucmVxdWVzdCAmJiBjb21tYW5kcy5pbmRleE9mKGRhdGEucmVxdWVzdC5jb21tYW5kKSA+PSAwXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgZGF0YSB0byB0aGUgVENQIHNvY2tldFxuICAgKiBBcm1zIGEgdGltZW91dCB3YWl0aW5nIGZvciBhIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBQYXlsb2FkXG4gICAqL1xuICBzZW5kIChzdHIpIHtcbiAgICBjb25zdCBidWZmZXIgPSB0b1R5cGVkQXJyYXkoc3RyKS5idWZmZXJcbiAgICBjb25zdCB0aW1lb3V0ID0gdGhpcy50aW1lb3V0U29ja2V0TG93ZXJCb3VuZCArIE1hdGguZmxvb3IoYnVmZmVyLmJ5dGVMZW5ndGggKiB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyKVxuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lcikgLy8gY2xlYXIgcGVuZGluZyB0aW1lb3V0c1xuICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJyBTb2NrZXQgdGltZWQgb3V0IScpKSwgdGltZW91dCkgLy8gYXJtIHRoZSBuZXh0IHRpbWVvdXRcblxuICAgIGlmICh0aGlzLmNvbXByZXNzZWQpIHtcbiAgICAgIHRoaXMuX3NlbmRDb21wcmVzc2VkKGJ1ZmZlcilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zb2NrZXQuc2VuZChidWZmZXIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhIGdsb2JhbCBoYW5kbGVyIGZvciBhbiB1bnRhZ2dlZCByZXNwb25zZS4gSWYgY3VycmVudGx5IHByb2Nlc3NlZCBjb21tYW5kXG4gICAqIGhhcyBub3QgbGlzdGVkIHVudGFnZ2VkIGNvbW1hbmQgaXQgaXMgZm9yd2FyZGVkIHRvIHRoZSBnbG9iYWwgaGFuZGxlci4gVXNlZnVsXG4gICAqIHdpdGggRVhQVU5HRSwgRVhJU1RTIGV0Yy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbW1hbmQgVW50YWdnZWQgY29tbWFuZCBuYW1lXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGZ1bmN0aW9uIHdpdGggcmVzcG9uc2Ugb2JqZWN0IGFuZCBjb250aW51ZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKi9cbiAgc2V0SGFuZGxlciAoY29tbWFuZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kLnRvVXBwZXJDYXNlKCkudHJpbSgpXSA9IGNhbGxiYWNrXG4gIH1cblxuICAvLyBJTlRFUk5BTCBFVkVOVFNcblxuICAvKipcbiAgICogRXJyb3IgaGFuZGxlciBmb3IgdGhlIHNvY2tldFxuICAgKlxuICAgKiBAZXZlbnRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0IEV2ZW50IG9iamVjdC4gU2VlIGV2dC5kYXRhIGZvciB0aGUgZXJyb3JcbiAgICovXG4gIF9vbkVycm9yIChldnQpIHtcbiAgICB2YXIgZXJyb3JcbiAgICBpZiAodGhpcy5pc0Vycm9yKGV2dCkpIHtcbiAgICAgIGVycm9yID0gZXZ0XG4gICAgfSBlbHNlIGlmIChldnQgJiYgdGhpcy5pc0Vycm9yKGV2dC5kYXRhKSkge1xuICAgICAgZXJyb3IgPSBldnQuZGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcigoZXZ0ICYmIGV2dC5kYXRhICYmIGV2dC5kYXRhLm1lc3NhZ2UpIHx8IGV2dC5kYXRhIHx8IGV2dCB8fCAnRXJyb3InKVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyLmVycm9yKGVycm9yKVxuXG4gICAgLy8gYWx3YXlzIGNhbGwgb25lcnJvciBjYWxsYmFjaywgbm8gbWF0dGVyIGlmIGNsb3NlKCkgc3VjY2VlZHMgb3IgZmFpbHNcbiAgICB0aGlzLmNsb3NlKGVycm9yKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMub25lcnJvciAmJiB0aGlzLm9uZXJyb3IoZXJyb3IpXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5vbmVycm9yICYmIHRoaXMub25lcnJvcihlcnJvcilcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXIgZm9yIGluY29taW5nIGRhdGEgZnJvbSB0aGUgc2VydmVyLiBUaGUgZGF0YSBpcyBzZW50IGluIGFyYml0cmFyeVxuICAgKiBjaHVua3MgYW5kIGNhbid0IGJlIHVzZWQgZGlyZWN0bHkgc28gdGhpcyBmdW5jdGlvbiBtYWtlcyBzdXJlIHRoZSBkYXRhXG4gICAqIGlzIHNwbGl0IGludG8gY29tcGxldGUgbGluZXMgYmVmb3JlIHRoZSBkYXRhIGlzIHBhc3NlZCB0byB0aGUgY29tbWFuZFxuICAgKiBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2dFxuICAgKi9cbiAgX29uRGF0YSAoZXZ0KSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lcikgLy8gcmVzZXQgdGhlIHRpbWVvdXQgb24gZWFjaCBkYXRhIHBhY2tldFxuICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJyBTb2NrZXQgdGltZWQgb3V0IScpKSwgdGhpcy5PTl9EQVRBX1RJTUVPVVQpXG5cbiAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMucHVzaChuZXcgVWludDhBcnJheShldnQuZGF0YSkpIC8vIGFwcGVuZCB0byB0aGUgaW5jb21pbmcgYnVmZmVyXG4gICAgdGhpcy5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKHRoaXMuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpKSAvLyBDb25zdW1lIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgfVxuXG4gICogX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlciAoKSB7XG4gICAgbGV0IGJ1ZiA9IHRoaXMuX2luY29taW5nQnVmZmVyc1t0aGlzLl9pbmNvbWluZ0J1ZmZlcnMubGVuZ3RoIC0gMV0gfHwgW11cbiAgICBsZXQgaSA9IDBcblxuICAgIC8vIGxvb3AgaW52YXJpYW50OlxuICAgIC8vICAgdGhpcy5faW5jb21pbmdCdWZmZXJzIHN0YXJ0cyB3aXRoIHRoZSBiZWdpbm5pbmcgb2YgaW5jb21pbmcgY29tbWFuZC5cbiAgICAvLyAgIGJ1ZiBpcyBzaG9ydGhhbmQgZm9yIGxhc3QgZWxlbWVudCBvZiB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMuXG4gICAgLy8gICBidWZbMC4uaS0xXSBpcyBwYXJ0IG9mIGluY29taW5nIGNvbW1hbmQuXG4gICAgd2hpbGUgKGkgPCBidWYubGVuZ3RoKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMuX2J1ZmZlclN0YXRlKSB7XG4gICAgICAgIGNhc2UgQlVGRkVSX1NUQVRFX0xJVEVSQUw6XG4gICAgICAgICAgY29uc3QgZGlmZiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBpLCB0aGlzLl9saXRlcmFsUmVtYWluaW5nKVxuICAgICAgICAgIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgLT0gZGlmZlxuICAgICAgICAgIGkgKz0gZGlmZlxuICAgICAgICAgIGlmICh0aGlzLl9saXRlcmFsUmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgY2FzZSBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMjpcbiAgICAgICAgICBpZiAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChidWZbaV0gPT09IENBUlJJQUdFX1JFVFVSTikge1xuICAgICAgICAgICAgICB0aGlzLl9saXRlcmFsUmVtYWluaW5nID0gTnVtYmVyKGZyb21UeXBlZEFycmF5KHRoaXMuX2xlbmd0aEJ1ZmZlcikpICsgMiAvLyBmb3IgQ1JMRlxuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9MSVRFUkFMXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fbGVuZ3RoQnVmZmVyXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgY2FzZSBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMTpcbiAgICAgICAgICBjb25zdCBzdGFydCA9IGlcbiAgICAgICAgICB3aGlsZSAoaSA8IGJ1Zi5sZW5ndGggJiYgYnVmW2ldID49IDQ4ICYmIGJ1ZltpXSA8PSA1NykgeyAvLyBkaWdpdHNcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RhcnQgIT09IGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhdGVzdCA9IGJ1Zi5zdWJhcnJheShzdGFydCwgaSlcbiAgICAgICAgICAgIGNvbnN0IHByZXZCdWYgPSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHByZXZCdWYubGVuZ3RoICsgbGF0ZXN0Lmxlbmd0aClcbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aEJ1ZmZlci5zZXQocHJldkJ1ZilcbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aEJ1ZmZlci5zZXQobGF0ZXN0LCBwcmV2QnVmLmxlbmd0aClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGkgPCBidWYubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbGVuZ3RoQnVmZmVyLmxlbmd0aCA+IDAgJiYgYnVmW2ldID09PSBSSUdIVF9DVVJMWV9CUkFDS0VUKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfREVGQVVMVFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBmaW5kIGxpdGVyYWwgbGVuZ3RoXG4gICAgICAgICAgY29uc3QgbGVmdElkeCA9IGJ1Zi5pbmRleE9mKExFRlRfQ1VSTFlfQlJBQ0tFVCwgaSlcbiAgICAgICAgICBpZiAobGVmdElkeCA+IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBsZWZ0T2ZMZWZ0Q3VybHkgPSBuZXcgVWludDhBcnJheShidWYuYnVmZmVyLCBpLCBsZWZ0SWR4IC0gaSlcbiAgICAgICAgICAgIGlmIChsZWZ0T2ZMZWZ0Q3VybHkuaW5kZXhPZihMSU5FX0ZFRUQpID09PSAtMSkge1xuICAgICAgICAgICAgICBpID0gbGVmdElkeCArIDFcbiAgICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoMClcbiAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMVxuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGZpbmQgZW5kIG9mIGNvbW1hbmRcbiAgICAgICAgICBjb25zdCBMRmlkeCA9IGJ1Zi5pbmRleE9mKExJTkVfRkVFRCwgaSlcbiAgICAgICAgICBpZiAoTEZpZHggPiAtMSkge1xuICAgICAgICAgICAgaWYgKExGaWR4IDwgYnVmLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgdGhpcy5faW5jb21pbmdCdWZmZXJzW3RoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggLSAxXSA9IG5ldyBVaW50OEFycmF5KGJ1Zi5idWZmZXIsIDAsIExGaWR4ICsgMSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmRMZW5ndGggPSB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBwcmV2ICsgY3Vyci5sZW5ndGgsIDApIC0gMiAvLyAyIGZvciBDUkxGXG4gICAgICAgICAgICBjb25zdCBjb21tYW5kID0gbmV3IFVpbnQ4QXJyYXkoY29tbWFuZExlbmd0aClcbiAgICAgICAgICAgIGxldCBpbmRleCA9IDBcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLl9pbmNvbWluZ0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBsZXQgdWludDhBcnJheSA9IHRoaXMuX2luY29taW5nQnVmZmVycy5zaGlmdCgpXG5cbiAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nTGVuZ3RoID0gY29tbWFuZExlbmd0aCAtIGluZGV4XG4gICAgICAgICAgICAgIGlmICh1aW50OEFycmF5Lmxlbmd0aCA+IHJlbWFpbmluZ0xlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2Vzc0xlbmd0aCA9IHVpbnQ4QXJyYXkubGVuZ3RoIC0gcmVtYWluaW5nTGVuZ3RoXG4gICAgICAgICAgICAgICAgdWludDhBcnJheSA9IHVpbnQ4QXJyYXkuc3ViYXJyYXkoMCwgLWV4Y2Vzc0xlbmd0aClcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbmNvbWluZ0J1ZmZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5faW5jb21pbmdCdWZmZXJzID0gW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29tbWFuZC5zZXQodWludDhBcnJheSwgaW5kZXgpXG4gICAgICAgICAgICAgIGluZGV4ICs9IHVpbnQ4QXJyYXkubGVuZ3RoXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5aWVsZCBjb21tYW5kXG4gICAgICAgICAgICBpZiAoTEZpZHggPCBidWYubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICBidWYgPSBuZXcgVWludDhBcnJheShidWYuc3ViYXJyYXkoTEZpZHggKyAxKSlcbiAgICAgICAgICAgICAgdGhpcy5faW5jb21pbmdCdWZmZXJzLnB1c2goYnVmKVxuICAgICAgICAgICAgICBpID0gMFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gY2xlYXIgdGhlIHRpbWVvdXQgd2hlbiBhbiBlbnRpcmUgY29tbWFuZCBoYXMgYXJyaXZlZFxuICAgICAgICAgICAgICAvLyBhbmQgbm90IHdhaXRpbmcgb24gbW9yZSBkYXRhIGZvciBuZXh0IGNvbW1hbmRcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lcilcbiAgICAgICAgICAgICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gbnVsbFxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFBSSVZBVEUgTUVUSE9EU1xuXG4gIC8qKlxuICAgKiBQcm9jZXNzZXMgYSBjb21tYW5kIGZyb20gdGhlIHF1ZXVlLiBUaGUgY29tbWFuZCBpcyBwYXJzZWQgYW5kIGZlZWRlZCB0byBhIGhhbmRsZXJcbiAgICovXG4gIF9wYXJzZUluY29taW5nQ29tbWFuZHMgKGNvbW1hbmRzKSB7XG4gICAgZm9yICh2YXIgY29tbWFuZCBvZiBjb21tYW5kcykge1xuICAgICAgdGhpcy5fY2xlYXJJZGxlKClcblxuICAgICAgLypcbiAgICAgICAqIFRoZSBcIitcIi10YWdnZWQgcmVzcG9uc2UgaXMgYSBzcGVjaWFsIGNhc2U6XG4gICAgICAgKiBFaXRoZXIgdGhlIHNlcnZlciBjYW4gYXNrcyBmb3IgdGhlIG5leHQgY2h1bmsgb2YgZGF0YSwgZS5nLiBmb3IgdGhlIEFVVEhFTlRJQ0FURSBjb21tYW5kLlxuICAgICAgICpcbiAgICAgICAqIE9yIHRoZXJlIHdhcyBhbiBlcnJvciBpbiB0aGUgWE9BVVRIMiBhdXRoZW50aWNhdGlvbiwgZm9yIHdoaWNoIFNBU0wgaW5pdGlhbCBjbGllbnQgcmVzcG9uc2UgZXh0ZW5zaW9uXG4gICAgICAgKiBkaWN0YXRlcyB0aGUgY2xpZW50IHNlbmRzIGFuIGVtcHR5IEVPTCByZXNwb25zZSB0byB0aGUgY2hhbGxlbmdlIGNvbnRhaW5pbmcgdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgICAgKlxuICAgICAgICogRGV0YWlscyBvbiBcIitcIi10YWdnZWQgcmVzcG9uc2U6XG4gICAgICAgKiAgIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNTAxI3NlY3Rpb24tMi4yLjFcbiAgICAgICAqL1xuICAgICAgLy9cbiAgICAgIGlmIChjb21tYW5kWzBdID09PSBBU0NJSV9QTFVTKSB7XG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLmxlbmd0aCkge1xuICAgICAgICAgIC8vIGZlZWQgdGhlIG5leHQgY2h1bmsgb2YgZGF0YVxuICAgICAgICAgIHZhciBjaHVuayA9IHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEuc2hpZnQoKVxuICAgICAgICAgIGNodW5rICs9ICghdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5sZW5ndGggPyBFT0wgOiAnJykgLy8gRU9MIGlmIHRoZXJlJ3Mgbm90aGluZyBtb3JlIHRvIHNlbmRcbiAgICAgICAgICB0aGlzLnNlbmQoY2h1bmspXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudENvbW1hbmQuZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUpIHtcbiAgICAgICAgICB0aGlzLnNlbmQoRU9MKSAvLyBYT0FVVEgyIGVtcHR5IHJlc3BvbnNlLCBlcnJvciB3aWxsIGJlIHJlcG9ydGVkIHdoZW4gc2VydmVyIGNvbnRpbnVlcyB3aXRoIE5PIHJlc3BvbnNlXG4gICAgICAgIH1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3BvbnNlXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB2YWx1ZUFzU3RyaW5nID0gdGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdCAmJiB0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0LnZhbHVlQXNTdHJpbmdcbiAgICAgICAgcmVzcG9uc2UgPSBwYXJzZXIoY29tbWFuZCwgeyB2YWx1ZUFzU3RyaW5nIH0pXG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTOicsICgpID0+IGNvbXBpbGVyKHJlc3BvbnNlLCBmYWxzZSwgdHJ1ZSkpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBwYXJzaW5nIGltYXAgY29tbWFuZCEnLCByZXNwb25zZSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX29uRXJyb3IoZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlKVxuICAgICAgdGhpcy5faGFuZGxlUmVzcG9uc2UocmVzcG9uc2UpXG5cbiAgICAgIC8vIGZpcnN0IHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciwgY29ubmVjdGlvbiBpcyBub3cgdXNhYmxlXG4gICAgICBpZiAoIXRoaXMuX2Nvbm5lY3Rpb25SZWFkeSkge1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uUmVhZHkgPSB0cnVlXG4gICAgICAgIHRoaXMub25yZWFkeSAmJiB0aGlzLm9ucmVhZHkoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGZWVkcyBhIHBhcnNlZCByZXNwb25zZSBvYmplY3QgdG8gYW4gYXBwcm9wcmlhdGUgaGFuZGxlclxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgUGFyc2VkIGNvbW1hbmQgb2JqZWN0XG4gICAqL1xuICBfaGFuZGxlUmVzcG9uc2UgKHJlc3BvbnNlKSB7XG4gICAgdmFyIGNvbW1hbmQgPSBwcm9wT3IoJycsICdjb21tYW5kJywgcmVzcG9uc2UpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG5cbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRDb21tYW5kKSB7XG4gICAgICAvLyB1bnNvbGljaXRlZCB1bnRhZ2dlZCByZXNwb25zZVxuICAgICAgaWYgKHJlc3BvbnNlLnRhZyA9PT0gJyonICYmIGNvbW1hbmQgaW4gdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWQpIHtcbiAgICAgICAgdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWRbY29tbWFuZF0ocmVzcG9uc2UpXG4gICAgICAgIHRoaXMuX2NhblNlbmQgPSB0cnVlXG4gICAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0KClcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQgJiYgcmVzcG9uc2UudGFnID09PSAnKicgJiYgY29tbWFuZCBpbiB0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkKSB7XG4gICAgICAvLyBleHBlY3RlZCB1bnRhZ2dlZCByZXNwb25zZVxuICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZFtjb21tYW5kXS5wdXNoKHJlc3BvbnNlKVxuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgY29tbWFuZCBpbiB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCkge1xuICAgICAgLy8gdW5leHBlY3RlZCB1bnRhZ2dlZCByZXNwb25zZVxuICAgICAgdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWRbY29tbWFuZF0ocmVzcG9uc2UpXG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS50YWcgPT09IHRoaXMuX2N1cnJlbnRDb21tYW5kLnRhZykge1xuICAgICAgLy8gdGFnZ2VkIHJlc3BvbnNlXG4gICAgICBpZiAodGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZCAmJiBPYmplY3Qua2V5cyh0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkKS5sZW5ndGgpIHtcbiAgICAgICAgcmVzcG9uc2UucGF5bG9hZCA9IHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWRcbiAgICAgIH1cbiAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kLmNhbGxiYWNrKHJlc3BvbnNlKVxuICAgICAgdGhpcy5fY2FuU2VuZCA9IHRydWVcbiAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0KClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBjb21tYW5kIGZyb20gY2xpZW50IHF1ZXVlIHRvIHRoZSBzZXJ2ZXIuXG4gICAqL1xuICBfc2VuZFJlcXVlc3QgKCkge1xuICAgIGlmICghdGhpcy5fY2xpZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW50ZXJJZGxlKClcbiAgICB9XG4gICAgdGhpcy5fY2xlYXJJZGxlKClcblxuICAgIC8vIGFuIG9wZXJhdGlvbiB3YXMgbWFkZSBpbiB0aGUgcHJlY2hlY2ssIG5vIG5lZWQgdG8gcmVzdGFydCB0aGUgcXVldWUgbWFudWFsbHlcbiAgICB0aGlzLl9yZXN0YXJ0UXVldWUgPSBmYWxzZVxuXG4gICAgdmFyIGNvbW1hbmQgPSB0aGlzLl9jbGllbnRRdWV1ZVswXVxuICAgIGlmICh0eXBlb2YgY29tbWFuZC5wcmVjaGVjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gcmVtZW1iZXIgdGhlIGNvbnRleHRcbiAgICAgIHZhciBjb250ZXh0ID0gY29tbWFuZFxuICAgICAgdmFyIHByZWNoZWNrID0gY29udGV4dC5wcmVjaGVja1xuICAgICAgZGVsZXRlIGNvbnRleHQucHJlY2hlY2tcblxuICAgICAgLy8gd2UgbmVlZCB0byByZXN0YXJ0IHRoZSBxdWV1ZSBoYW5kbGluZyBpZiBubyBvcGVyYXRpb24gd2FzIG1hZGUgaW4gdGhlIHByZWNoZWNrXG4gICAgICB0aGlzLl9yZXN0YXJ0UXVldWUgPSB0cnVlXG5cbiAgICAgIC8vIGludm9rZSB0aGUgcHJlY2hlY2sgY29tbWFuZCBhbmQgcmVzdW1lIG5vcm1hbCBvcGVyYXRpb24gYWZ0ZXIgdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgIHByZWNoZWNrKGNvbnRleHQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyB3ZSdyZSBkb25lIHdpdGggdGhlIHByZWNoZWNrXG4gICAgICAgIGlmICh0aGlzLl9yZXN0YXJ0UXVldWUpIHtcbiAgICAgICAgICAvLyB3ZSBuZWVkIHRvIHJlc3RhcnQgdGhlIHF1ZXVlIGhhbmRsaW5nXG4gICAgICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIC8vIHByZWNoZWNrIGZhaWxlZCwgc28gd2UgcmVtb3ZlIHRoZSBpbml0aWFsIGNvbW1hbmRcbiAgICAgICAgLy8gZnJvbSB0aGUgcXVldWUsIGludm9rZSBpdHMgY2FsbGJhY2sgYW5kIHJlc3VtZSBub3JtYWwgb3BlcmF0aW9uXG4gICAgICAgIGxldCBjbWRcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9jbGllbnRRdWV1ZS5pbmRleE9mKGNvbnRleHQpXG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgY21kID0gdGhpcy5fY2xpZW50UXVldWUuc3BsaWNlKGluZGV4LCAxKVswXVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbWQgJiYgY21kLmNhbGxiYWNrKSB7XG4gICAgICAgICAgY21kLmNhbGxiYWNrKGVycilcbiAgICAgICAgICB0aGlzLl9jYW5TZW5kID0gdHJ1ZVxuICAgICAgICAgIHRoaXMuX3BhcnNlSW5jb21pbmdDb21tYW5kcyh0aGlzLl9pdGVyYXRlSW5jb21pbmdCdWZmZXIoKSkgLy8gQ29uc3VtZSB0aGUgcmVzdCBvZiB0aGUgaW5jb21pbmcgYnVmZmVyXG4gICAgICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKSAvLyBjb250aW51ZSBzZW5kaW5nXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9jYW5TZW5kID0gZmFsc2VcbiAgICB0aGlzLl9jdXJyZW50Q29tbWFuZCA9IHRoaXMuX2NsaWVudFF1ZXVlLnNoaWZ0KClcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhID0gY29tcGlsZXIodGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdCwgdHJ1ZSlcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDOicsICgpID0+IGNvbXBpbGVyKHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QsIGZhbHNlLCB0cnVlKSkgLy8gZXhjbHVkZXMgcGFzc3dvcmRzIGV0Yy5cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgY29tcGlsaW5nIGltYXAgY29tbWFuZCEnLCB0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0KVxuICAgICAgcmV0dXJuIHRoaXMuX29uRXJyb3IobmV3IEVycm9yKCdFcnJvciBjb21waWxpbmcgaW1hcCBjb21tYW5kIScpKVxuICAgIH1cblxuICAgIHZhciBkYXRhID0gdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5zaGlmdCgpXG5cbiAgICB0aGlzLnNlbmQoZGF0YSArICghdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5sZW5ndGggPyBFT0wgOiAnJykpXG4gICAgcmV0dXJuIHRoaXMud2FpdERyYWluXG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgb25pZGxlLCBub3RpbmcgdG8gZG8gY3VycmVudGx5XG4gICAqL1xuICBfZW50ZXJJZGxlICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVyKVxuICAgIHRoaXMuX2lkbGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gKHRoaXMub25pZGxlICYmIHRoaXMub25pZGxlKCkpLCB0aGlzLnRpbWVvdXRFbnRlcklkbGUpXG4gIH1cblxuICAvKipcbiAgICogQ2FuY2VsIGlkbGUgdGltZXJcbiAgICovXG4gIF9jbGVhcklkbGUgKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZXIpXG4gICAgdGhpcy5faWRsZVRpbWVyID0gbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCBwcm9jZXNzZXMgYSByZXNwb25zZSBpbnRvIGFuIGVhc2llciB0byBoYW5kbGUgZm9ybWF0LlxuICAgKiBBZGQgdW50YWdnZWQgbnVtYmVyZWQgcmVzcG9uc2VzIChlLmcuIEZFVENIKSBpbnRvIGEgbmljZWx5IGZlYXNpYmxlIGZvcm1cbiAgICogQ2hlY2tzIGlmIGEgcmVzcG9uc2UgaW5jbHVkZXMgb3B0aW9uYWwgcmVzcG9uc2UgY29kZXNcbiAgICogYW5kIGNvcGllcyB0aGVzZSBpbnRvIHNlcGFyYXRlIHByb3BlcnRpZXMuIEZvciBleGFtcGxlIHRoZVxuICAgKiBmb2xsb3dpbmcgcmVzcG9uc2UgaW5jbHVkZXMgYSBjYXBhYmlsaXR5IGxpc3RpbmcgYW5kIGEgaHVtYW5cbiAgICogcmVhZGFibGUgbWVzc2FnZTpcbiAgICpcbiAgICogICAgICogT0sgW0NBUEFCSUxJVFkgSUQgTkFNRVNQQUNFXSBBbGwgcmVhZHlcbiAgICpcbiAgICogVGhpcyBtZXRob2QgYWRkcyBhICdjYXBhYmlsaXR5JyBwcm9wZXJ0eSB3aXRoIGFuIGFycmF5IHZhbHVlIFsnSUQnLCAnTkFNRVNQQUNFJ11cbiAgICogdG8gdGhlIHJlc3BvbnNlIG9iamVjdC4gQWRkaXRpb25hbGx5ICdBbGwgcmVhZHknIGlzIGFkZGVkIGFzICdodW1hblJlYWRhYmxlJyBwcm9wZXJ0eS5cbiAgICpcbiAgICogU2VlIHBvc3NpYmxlbSBJTUFQIFJlc3BvbnNlIENvZGVzIGF0IGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM1NTMwXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgcmVzcG9uc2Ugb2JqZWN0XG4gICAqL1xuICBfcHJvY2Vzc1Jlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIGxldCBjb21tYW5kID0gcHJvcE9yKCcnLCAnY29tbWFuZCcsIHJlc3BvbnNlKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuXG4gICAgLy8gbm8gYXR0cmlidXRlc1xuICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLmF0dHJpYnV0ZXMgfHwgIXJlc3BvbnNlLmF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyB1bnRhZ2dlZCByZXNwb25zZXMgdy8gc2VxdWVuY2UgbnVtYmVyc1xuICAgIGlmIChyZXNwb25zZS50YWcgPT09ICcqJyAmJiAvXlxcZCskLy50ZXN0KHJlc3BvbnNlLmNvbW1hbmQpICYmIHJlc3BvbnNlLmF0dHJpYnV0ZXNbMF0udHlwZSA9PT0gJ0FUT00nKSB7XG4gICAgICByZXNwb25zZS5uciA9IE51bWJlcihyZXNwb25zZS5jb21tYW5kKVxuICAgICAgcmVzcG9uc2UuY29tbWFuZCA9IChyZXNwb25zZS5hdHRyaWJ1dGVzLnNoaWZ0KCkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICB9XG5cbiAgICAvLyBubyBvcHRpb25hbCByZXNwb25zZSBjb2RlXG4gICAgaWYgKFsnT0snLCAnTk8nLCAnQkFEJywgJ0JZRScsICdQUkVBVVRIJ10uaW5kZXhPZihjb21tYW5kKSA8IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIGxhc3QgZWxlbWVudCBvZiB0aGUgcmVzcG9uc2UgaXMgVEVYVCB0aGVuIHRoaXMgaXMgZm9yIGh1bWFuc1xuICAgIGlmIChyZXNwb25zZS5hdHRyaWJ1dGVzW3Jlc3BvbnNlLmF0dHJpYnV0ZXMubGVuZ3RoIC0gMV0udHlwZSA9PT0gJ1RFWFQnKSB7XG4gICAgICByZXNwb25zZS5odW1hblJlYWRhYmxlID0gcmVzcG9uc2UuYXR0cmlidXRlc1tyZXNwb25zZS5hdHRyaWJ1dGVzLmxlbmd0aCAtIDFdLnZhbHVlXG4gICAgfVxuXG4gICAgLy8gUGFyc2UgYW5kIGZvcm1hdCBBVE9NIHZhbHVlc1xuICAgIGlmIChyZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnR5cGUgPT09ICdBVE9NJyAmJiByZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnNlY3Rpb24pIHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHJlc3BvbnNlLmF0dHJpYnV0ZXNbMF0uc2VjdGlvbi5tYXAoKGtleSkgPT4ge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGtleSkpIHtcbiAgICAgICAgICByZXR1cm4ga2V5Lm1hcCgoa2V5KSA9PiAoa2V5LnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gKGtleS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBjb25zdCBrZXkgPSBvcHRpb24uc2hpZnQoKVxuICAgICAgcmVzcG9uc2UuY29kZSA9IGtleVxuXG4gICAgICBpZiAob3B0aW9uLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXNwb25zZVtrZXkudG9Mb3dlckNhc2UoKV0gPSBvcHRpb25bMF1cbiAgICAgIH0gZWxzZSBpZiAob3B0aW9uLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcmVzcG9uc2Vba2V5LnRvTG93ZXJDYXNlKCldID0gb3B0aW9uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGFuIEVycm9yIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSBWYWx1ZSB0byBiZSBjaGVja2VkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IHJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYW4gRXJyb3JcbiAgICovXG4gIGlzRXJyb3IgKHZhbHVlKSB7XG4gICAgcmV0dXJuICEhT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKS5tYXRjaCgvRXJyb3JcXF0kLylcbiAgfVxuXG4gIC8vIENPTVBSRVNTSU9OIFJFTEFURUQgTUVUSE9EU1xuXG4gIC8qKlxuICAgKiBTZXRzIHVwIGRlZmxhdGUvaW5mbGF0ZSBmb3IgdGhlIElPXG4gICAqL1xuICBlbmFibGVDb21wcmVzc2lvbiAoKSB7XG4gICAgdGhpcy5fc29ja2V0T25EYXRhID0gdGhpcy5zb2NrZXQub25kYXRhXG4gICAgdGhpcy5jb21wcmVzc2VkID0gdHJ1ZVxuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5Xb3JrZXIpIHtcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtDb21wcmVzc2lvbkJsb2JdKSkpXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGUuZGF0YS5tZXNzYWdlXG4gICAgICAgIHZhciBkYXRhID0gZS5kYXRhLmJ1ZmZlclxuXG4gICAgICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgICAgIGNhc2UgTUVTU0FHRV9JTkZMQVRFRF9EQVRBX1JFQURZOlxuICAgICAgICAgICAgdGhpcy5fc29ja2V0T25EYXRhKHsgZGF0YSB9KVxuICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgIGNhc2UgTUVTU0FHRV9ERUZMQVRFRF9EQVRBX1JFQURZOlxuICAgICAgICAgICAgdGhpcy53YWl0RHJhaW4gPSB0aGlzLnNvY2tldC5zZW5kKGRhdGEpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyLm9uZXJyb3IgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignRXJyb3IgaGFuZGxpbmcgY29tcHJlc3Npb24gd2ViIHdvcmtlcjogJyArIGUubWVzc2FnZSkpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyLnBvc3RNZXNzYWdlKGNyZWF0ZU1lc3NhZ2UoTUVTU0FHRV9JTklUSUFMSVpFX1dPUktFUikpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluZmxhdGVkUmVhZHkgPSAoYnVmZmVyKSA9PiB7IHRoaXMuX3NvY2tldE9uRGF0YSh7IGRhdGE6IGJ1ZmZlciB9KSB9XG4gICAgICBjb25zdCBkZWZsYXRlZFJlYWR5ID0gKGJ1ZmZlcikgPT4geyB0aGlzLndhaXREcmFpbiA9IHRoaXMuc29ja2V0LnNlbmQoYnVmZmVyKSB9XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbiA9IG5ldyBDb21wcmVzc2lvbihpbmZsYXRlZFJlYWR5LCBkZWZsYXRlZFJlYWR5KVxuICAgIH1cblxuICAgIC8vIG92ZXJyaWRlIGRhdGEgaGFuZGxlciwgZGVjb21wcmVzcyBpbmNvbWluZyBkYXRhXG4gICAgdGhpcy5zb2NrZXQub25kYXRhID0gKGV2dCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmNvbXByZXNzZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9jb21wcmVzc2lvbldvcmtlcikge1xuICAgICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5wb3N0TWVzc2FnZShjcmVhdGVNZXNzYWdlKE1FU1NBR0VfSU5GTEFURSwgZXZ0LmRhdGEpLCBbZXZ0LmRhdGFdKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29tcHJlc3Npb24uaW5mbGF0ZShldnQuZGF0YSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVW5kb2VzIGFueSBjaGFuZ2VzIHJlbGF0ZWQgdG8gY29tcHJlc3Npb24uIFRoaXMgb25seSBiZSBjYWxsZWQgd2hlbiBjbG9zaW5nIHRoZSBjb25uZWN0aW9uXG4gICAqL1xuICBfZGlzYWJsZUNvbXByZXNzaW9uICgpIHtcbiAgICBpZiAoIXRoaXMuY29tcHJlc3NlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5jb21wcmVzc2VkID0gZmFsc2VcbiAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSB0aGlzLl9zb2NrZXRPbkRhdGFcbiAgICB0aGlzLl9zb2NrZXRPbkRhdGEgPSBudWxsXG5cbiAgICBpZiAodGhpcy5fY29tcHJlc3Npb25Xb3JrZXIpIHtcbiAgICAgIC8vIHRlcm1pbmF0ZSB0aGUgd29ya2VyXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci50ZXJtaW5hdGUoKVxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE91dGdvaW5nIHBheWxvYWQgbmVlZHMgdG8gYmUgY29tcHJlc3NlZCBhbmQgc2VudCB0byBzb2NrZXRcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYnVmZmVyIE91dGdvaW5nIHVuY29tcHJlc3NlZCBhcnJheWJ1ZmZlclxuICAgKi9cbiAgX3NlbmRDb21wcmVzc2VkIChidWZmZXIpIHtcbiAgICAvLyBkZWZsYXRlXG4gICAgaWYgKHRoaXMuX2NvbXByZXNzaW9uV29ya2VyKSB7XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5wb3N0TWVzc2FnZShjcmVhdGVNZXNzYWdlKE1FU1NBR0VfREVGTEFURSwgYnVmZmVyKSwgW2J1ZmZlcl0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uLmRlZmxhdGUoYnVmZmVyKVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCBjcmVhdGVNZXNzYWdlID0gKG1lc3NhZ2UsIGJ1ZmZlcikgPT4gKHsgbWVzc2FnZSwgYnVmZmVyIH0pXG4iXX0=