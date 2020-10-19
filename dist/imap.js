"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ramda = require("ramda");

var _emailjsTcpSocket = _interopRequireDefault(require("emailjs-tcp-socket"));

var _common = require("./common");

var _emailjsImapHandler = require("emailjs-imap-handler");

var _compression = _interopRequireDefault(require("./compression"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* babel-plugin-inline-import '../res/compression.worker.blob' */
const CompressionBlob = "!function(e){var t={};function a(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,a),i.l=!0,i.exports}a.m=e,a.c=t,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&\"object\"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,\"default\",{enumerable:!0,value:e}),2&t&&\"string\"!=typeof e)for(var i in e)a.d(n,i,function(t){return e[t]}.bind(null,i));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,\"a\",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p=\"\",a(a.s=11)}([function(e,t,a){\"use strict\";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},function(e,t,a){\"use strict\";e.exports={2:\"need dictionary\",1:\"stream end\",0:\"\",\"-1\":\"file error\",\"-2\":\"stream error\",\"-3\":\"data error\",\"-4\":\"insufficient memory\",\"-5\":\"buffer error\",\"-6\":\"incompatible version\"}},function(e,t,a){\"use strict\";var n=\"undefined\"!=typeof Uint8Array&&\"undefined\"!=typeof Uint16Array&&\"undefined\"!=typeof Int32Array;function i(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var a=t.shift();if(a){if(\"object\"!=typeof a)throw new TypeError(a+\"must be non-object\");for(var n in a)i(a,n)&&(e[n]=a[n])}}return e},t.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var r={arraySet:function(e,t,a,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(a,a+n),i);else for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){var t,a,n,i,r,s;for(n=0,t=0,a=e.length;t<a;t++)n+=e[t].length;for(s=new Uint8Array(n),i=0,t=0,a=e.length;t<a;t++)r=e[t],s.set(r,i),i+=r.length;return s}},s={arraySet:function(e,t,a,n,i){for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){return[].concat.apply([],e)}};t.setTyped=function(e){e?(t.Buf8=Uint8Array,t.Buf16=Uint16Array,t.Buf32=Int32Array,t.assign(t,r)):(t.Buf8=Array,t.Buf16=Array,t.Buf32=Array,t.assign(t,s))},t.setTyped(n)},function(e,t,a){\"use strict\";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg=\"\",this.state=null,this.data_type=2,this.adler=0}},function(e,t,a){\"use strict\";var n,i=a(2),r=a(8),s=a(6),l=a(7),o=a(1);function h(e,t){return e.msg=o[t],t}function d(e){return(e<<1)-(e>4?9:0)}function _(e){for(var t=e.length;--t>=0;)e[t]=0}function f(e){var t=e.state,a=t.pending;a>e.avail_out&&(a=e.avail_out),0!==a&&(i.arraySet(e.output,t.pending_buf,t.pending_out,a,e.next_out),e.next_out+=a,t.pending_out+=a,e.total_out+=a,e.avail_out-=a,t.pending-=a,0===t.pending&&(t.pending_out=0))}function u(e,t){r._tr_flush_block(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,f(e.strm)}function c(e,t){e.pending_buf[e.pending++]=t}function b(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function g(e,t){var a,n,i=e.max_chain_length,r=e.strstart,s=e.prev_length,l=e.nice_match,o=e.strstart>e.w_size-262?e.strstart-(e.w_size-262):0,h=e.window,d=e.w_mask,_=e.prev,f=e.strstart+258,u=h[r+s-1],c=h[r+s];e.prev_length>=e.good_match&&(i>>=2),l>e.lookahead&&(l=e.lookahead);do{if(h[(a=t)+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do{}while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&r<f);if(n=258-(f-r),r=f-258,n>s){if(e.match_start=t,s=n,n>=l)break;u=h[r+s-1],c=h[r+s]}}}while((t=_[t&d])>o&&0!=--i);return s<=e.lookahead?s:e.lookahead}function m(e){var t,a,n,r,o,h,d,_,f,u,c=e.w_size;do{if(r=e.window_size-e.lookahead-e.strstart,e.strstart>=c+(c-262)){i.arraySet(e.window,e.window,c,c,0),e.match_start-=c,e.strstart-=c,e.block_start-=c,t=a=e.hash_size;do{n=e.head[--t],e.head[t]=n>=c?n-c:0}while(--a);t=a=c;do{n=e.prev[--t],e.prev[t]=n>=c?n-c:0}while(--a);r+=c}if(0===e.strm.avail_in)break;if(h=e.strm,d=e.window,_=e.strstart+e.lookahead,f=r,u=void 0,(u=h.avail_in)>f&&(u=f),a=0===u?0:(h.avail_in-=u,i.arraySet(d,h.input,h.next_in,u,_),1===h.state.wrap?h.adler=s(h.adler,d,u,_):2===h.state.wrap&&(h.adler=l(h.adler,d,u,_)),h.next_in+=u,h.total_in+=u,u),e.lookahead+=a,e.lookahead+e.insert>=3)for(o=e.strstart-e.insert,e.ins_h=e.window[o],e.ins_h=(e.ins_h<<e.hash_shift^e.window[o+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[o+3-1])&e.hash_mask,e.prev[o&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=o,o++,e.insert--,!(e.lookahead+e.insert<3)););}while(e.lookahead<262&&0!==e.strm.avail_in)}function w(e,t){for(var a,n;;){if(e.lookahead<262){if(m(e),e.lookahead<262&&0===t)return 1;if(0===e.lookahead)break}if(a=0,e.lookahead>=3&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==a&&e.strstart-a<=e.w_size-262&&(e.match_length=g(e,a)),e.match_length>=3)if(n=r._tr_tally(e,e.strstart-e.match_start,e.match_length-3),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=3){e.match_length--;do{e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart}while(0!=--e.match_length);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=r._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(u(e,!1),0===e.strm.avail_out))return 1}return e.insert=e.strstart<2?e.strstart:2,4===t?(u(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(u(e,!1),0===e.strm.avail_out)?1:2}function p(e,t){for(var a,n,i;;){if(e.lookahead<262){if(m(e),e.lookahead<262&&0===t)return 1;if(0===e.lookahead)break}if(a=0,e.lookahead>=3&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=2,0!==a&&e.prev_length<e.max_lazy_match&&e.strstart-a<=e.w_size-262&&(e.match_length=g(e,a),e.match_length<=5&&(1===e.strategy||3===e.match_length&&e.strstart-e.match_start>4096)&&(e.match_length=2)),e.prev_length>=3&&e.match_length<=e.prev_length){i=e.strstart+e.lookahead-3,n=r._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-3),e.lookahead-=e.prev_length-1,e.prev_length-=2;do{++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+3-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart)}while(0!=--e.prev_length);if(e.match_available=0,e.match_length=2,e.strstart++,n&&(u(e,!1),0===e.strm.avail_out))return 1}else if(e.match_available){if((n=r._tr_tally(e,0,e.window[e.strstart-1]))&&u(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return 1}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=r._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<2?e.strstart:2,4===t?(u(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(u(e,!1),0===e.strm.avail_out)?1:2}function v(e,t,a,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=a,this.max_chain=n,this.func=i}function k(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=8,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new i.Buf16(1146),this.dyn_dtree=new i.Buf16(122),this.bl_tree=new i.Buf16(78),_(this.dyn_ltree),_(this.dyn_dtree),_(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new i.Buf16(16),this.heap=new i.Buf16(573),_(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new i.Buf16(573),_(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function y(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=2,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?42:113,e.adler=2===t.wrap?0:1,t.last_flush=0,r._tr_init(t),0):h(e,-2)}function x(e){var t,a=y(e);return 0===a&&((t=e.state).window_size=2*t.w_size,_(t.head),t.max_lazy_match=n[t.level].max_lazy,t.good_match=n[t.level].good_length,t.nice_match=n[t.level].nice_length,t.max_chain_length=n[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=2,t.match_available=0,t.ins_h=0),a}function z(e,t,a,n,r,s){if(!e)return-2;var l=1;if(-1===t&&(t=6),n<0?(l=0,n=-n):n>15&&(l=2,n-=16),r<1||r>9||8!==a||n<8||n>15||t<0||t>9||s<0||s>4)return h(e,-2);8===n&&(n=9);var o=new k;return e.state=o,o.strm=e,o.wrap=l,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=r+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+3-1)/3),o.window=new i.Buf8(2*o.w_size),o.head=new i.Buf16(o.hash_size),o.prev=new i.Buf16(o.w_size),o.lit_bufsize=1<<r+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new i.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=a,x(e)}n=[new v(0,0,0,0,(function(e,t){var a=65535;for(a>e.pending_buf_size-5&&(a=e.pending_buf_size-5);;){if(e.lookahead<=1){if(m(e),0===e.lookahead&&0===t)return 1;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+a;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,u(e,!1),0===e.strm.avail_out))return 1;if(e.strstart-e.block_start>=e.w_size-262&&(u(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(u(e,!0),0===e.strm.avail_out?3:4):(e.strstart>e.block_start&&(u(e,!1),e.strm.avail_out),1)})),new v(4,4,8,4,w),new v(4,5,16,8,w),new v(4,6,32,32,w),new v(4,4,16,16,p),new v(8,16,32,32,p),new v(8,16,128,128,p),new v(8,32,128,256,p),new v(32,128,258,1024,p),new v(32,258,258,4096,p)],t.deflateInit=function(e,t){return z(e,t,8,15,8,0)},t.deflateInit2=z,t.deflateReset=x,t.deflateResetKeep=y,t.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?-2:(e.state.gzhead=t,0):-2},t.deflate=function(e,t){var a,i,s,o;if(!e||!e.state||t>5||t<0)return e?h(e,-2):-2;if(i=e.state,!e.output||!e.input&&0!==e.avail_in||666===i.status&&4!==t)return h(e,0===e.avail_out?-5:-2);if(i.strm=e,a=i.last_flush,i.last_flush=t,42===i.status)if(2===i.wrap)e.adler=0,c(i,31),c(i,139),c(i,8),i.gzhead?(c(i,(i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),c(i,255&i.gzhead.time),c(i,i.gzhead.time>>8&255),c(i,i.gzhead.time>>16&255),c(i,i.gzhead.time>>24&255),c(i,9===i.level?2:i.strategy>=2||i.level<2?4:0),c(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(c(i,255&i.gzhead.extra.length),c(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(e.adler=l(e.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=69):(c(i,0),c(i,0),c(i,0),c(i,0),c(i,0),c(i,9===i.level?2:i.strategy>=2||i.level<2?4:0),c(i,3),i.status=113);else{var g=8+(i.w_bits-8<<4)<<8;g|=(i.strategy>=2||i.level<2?0:i.level<6?1:6===i.level?2:3)<<6,0!==i.strstart&&(g|=32),g+=31-g%31,i.status=113,b(i,g),0!==i.strstart&&(b(i,e.adler>>>16),b(i,65535&e.adler)),e.adler=1}if(69===i.status)if(i.gzhead.extra){for(s=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),f(e),s=i.pending,i.pending!==i.pending_buf_size));)c(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=73)}else i.status=73;if(73===i.status)if(i.gzhead.name){s=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),f(e),s=i.pending,i.pending===i.pending_buf_size)){o=1;break}o=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0,c(i,o)}while(0!==o);i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),0===o&&(i.gzindex=0,i.status=91)}else i.status=91;if(91===i.status)if(i.gzhead.comment){s=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),f(e),s=i.pending,i.pending===i.pending_buf_size)){o=1;break}o=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0,c(i,o)}while(0!==o);i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),0===o&&(i.status=103)}else i.status=103;if(103===i.status&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&f(e),i.pending+2<=i.pending_buf_size&&(c(i,255&e.adler),c(i,e.adler>>8&255),e.adler=0,i.status=113)):i.status=113),0!==i.pending){if(f(e),0===e.avail_out)return i.last_flush=-1,0}else if(0===e.avail_in&&d(t)<=d(a)&&4!==t)return h(e,-5);if(666===i.status&&0!==e.avail_in)return h(e,-5);if(0!==e.avail_in||0!==i.lookahead||0!==t&&666!==i.status){var w=2===i.strategy?function(e,t){for(var a;;){if(0===e.lookahead&&(m(e),0===e.lookahead)){if(0===t)return 1;break}if(e.match_length=0,a=r._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,a&&(u(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(u(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(u(e,!1),0===e.strm.avail_out)?1:2}(i,t):3===i.strategy?function(e,t){for(var a,n,i,s,l=e.window;;){if(e.lookahead<=258){if(m(e),e.lookahead<=258&&0===t)return 1;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=3&&e.strstart>0&&(n=l[i=e.strstart-1])===l[++i]&&n===l[++i]&&n===l[++i]){s=e.strstart+258;do{}while(n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&i<s);e.match_length=258-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=3?(a=r._tr_tally(e,1,e.match_length-3),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(a=r._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),a&&(u(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(u(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(u(e,!1),0===e.strm.avail_out)?1:2}(i,t):n[i.level].func(i,t);if(3!==w&&4!==w||(i.status=666),1===w||3===w)return 0===e.avail_out&&(i.last_flush=-1),0;if(2===w&&(1===t?r._tr_align(i):5!==t&&(r._tr_stored_block(i,0,0,!1),3===t&&(_(i.head),0===i.lookahead&&(i.strstart=0,i.block_start=0,i.insert=0))),f(e),0===e.avail_out))return i.last_flush=-1,0}return 4!==t?0:i.wrap<=0?1:(2===i.wrap?(c(i,255&e.adler),c(i,e.adler>>8&255),c(i,e.adler>>16&255),c(i,e.adler>>24&255),c(i,255&e.total_in),c(i,e.total_in>>8&255),c(i,e.total_in>>16&255),c(i,e.total_in>>24&255)):(b(i,e.adler>>>16),b(i,65535&e.adler)),f(e),i.wrap>0&&(i.wrap=-i.wrap),0!==i.pending?0:1)},t.deflateEnd=function(e){var t;return e&&e.state?42!==(t=e.state.status)&&69!==t&&73!==t&&91!==t&&103!==t&&113!==t&&666!==t?h(e,-2):(e.state=null,113===t?h(e,-3):0):-2},t.deflateSetDictionary=function(e,t){var a,n,r,l,o,h,d,f,u=t.length;if(!e||!e.state)return-2;if(2===(l=(a=e.state).wrap)||1===l&&42!==a.status||a.lookahead)return-2;for(1===l&&(e.adler=s(e.adler,t,u,0)),a.wrap=0,u>=a.w_size&&(0===l&&(_(a.head),a.strstart=0,a.block_start=0,a.insert=0),f=new i.Buf8(a.w_size),i.arraySet(f,t,u-a.w_size,a.w_size,0),t=f,u=a.w_size),o=e.avail_in,h=e.next_in,d=e.input,e.avail_in=u,e.next_in=0,e.input=t,m(a);a.lookahead>=3;){n=a.strstart,r=a.lookahead-2;do{a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+3-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++}while(--r);a.strstart=n,a.lookahead=2,m(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=2,a.match_available=0,e.next_in=h,e.input=d,e.avail_in=o,a.wrap=l,0},t.deflateInfo=\"pako deflate (from Nodeca project)\"},function(e,t,a){\"use strict\";var n=a(2),i=a(6),r=a(7),s=a(9),l=a(10);function o(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function h(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new n.Buf16(320),this.work=new n.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function d(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg=\"\",t.wrap&&(e.adler=1&t.wrap),t.mode=1,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new n.Buf32(852),t.distcode=t.distdyn=new n.Buf32(592),t.sane=1,t.back=-1,0):-2}function _(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,d(e)):-2}function f(e,t){var a,n;return e&&e.state?(n=e.state,t<0?(a=0,t=-t):(a=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?-2:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=a,n.wbits=t,_(e))):-2}function u(e,t){var a,n;return e?(n=new h,e.state=n,n.window=null,0!==(a=f(e,t))&&(e.state=null),a):-2}var c,b,g=!0;function m(e){if(g){var t;for(c=new n.Buf32(512),b=new n.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(l(1,e.lens,0,288,c,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;l(2,e.lens,0,32,b,0,e.work,{bits:5}),g=!1}e.lencode=c,e.lenbits=9,e.distcode=b,e.distbits=5}function w(e,t,a,i){var r,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new n.Buf8(s.wsize)),i>=s.wsize?(n.arraySet(s.window,t,a-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):((r=s.wsize-s.wnext)>i&&(r=i),n.arraySet(s.window,t,a-i,r,s.wnext),(i-=r)?(n.arraySet(s.window,t,a-i,i,0),s.wnext=i,s.whave=s.wsize):(s.wnext+=r,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=r))),0}t.inflateReset=_,t.inflateReset2=f,t.inflateResetKeep=d,t.inflateInit=function(e){return u(e,15)},t.inflateInit2=u,t.inflate=function(e,t){var a,h,d,_,f,u,c,b,g,p,v,k,y,x,z,S,E,A,Z,O,R,B,T,N,D=0,U=new n.Buf8(4),I=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return-2;12===(a=e.state).mode&&(a.mode=13),f=e.next_out,d=e.output,c=e.avail_out,_=e.next_in,h=e.input,u=e.avail_in,b=a.hold,g=a.bits,p=u,v=c,B=0;e:for(;;)switch(a.mode){case 1:if(0===a.wrap){a.mode=13;break}for(;g<16;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(2&a.wrap&&35615===b){a.check=0,U[0]=255&b,U[1]=b>>>8&255,a.check=r(a.check,U,2,0),b=0,g=0,a.mode=2;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&b)<<8)+(b>>8))%31){e.msg=\"incorrect header check\",a.mode=30;break}if(8!=(15&b)){e.msg=\"unknown compression method\",a.mode=30;break}if(g-=4,R=8+(15&(b>>>=4)),0===a.wbits)a.wbits=R;else if(R>a.wbits){e.msg=\"invalid window size\",a.mode=30;break}a.dmax=1<<R,e.adler=a.check=1,a.mode=512&b?10:12,b=0,g=0;break;case 2:for(;g<16;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(a.flags=b,8!=(255&a.flags)){e.msg=\"unknown compression method\",a.mode=30;break}if(57344&a.flags){e.msg=\"unknown header flags set\",a.mode=30;break}a.head&&(a.head.text=b>>8&1),512&a.flags&&(U[0]=255&b,U[1]=b>>>8&255,a.check=r(a.check,U,2,0)),b=0,g=0,a.mode=3;case 3:for(;g<32;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}a.head&&(a.head.time=b),512&a.flags&&(U[0]=255&b,U[1]=b>>>8&255,U[2]=b>>>16&255,U[3]=b>>>24&255,a.check=r(a.check,U,4,0)),b=0,g=0,a.mode=4;case 4:for(;g<16;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}a.head&&(a.head.xflags=255&b,a.head.os=b>>8),512&a.flags&&(U[0]=255&b,U[1]=b>>>8&255,a.check=r(a.check,U,2,0)),b=0,g=0,a.mode=5;case 5:if(1024&a.flags){for(;g<16;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}a.length=b,a.head&&(a.head.extra_len=b),512&a.flags&&(U[0]=255&b,U[1]=b>>>8&255,a.check=r(a.check,U,2,0)),b=0,g=0}else a.head&&(a.head.extra=null);a.mode=6;case 6:if(1024&a.flags&&((k=a.length)>u&&(k=u),k&&(a.head&&(R=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),n.arraySet(a.head.extra,h,_,k,R)),512&a.flags&&(a.check=r(a.check,h,k,_)),u-=k,_+=k,a.length-=k),a.length))break e;a.length=0,a.mode=7;case 7:if(2048&a.flags){if(0===u)break e;k=0;do{R=h[_+k++],a.head&&R&&a.length<65536&&(a.head.name+=String.fromCharCode(R))}while(R&&k<u);if(512&a.flags&&(a.check=r(a.check,h,k,_)),u-=k,_+=k,R)break e}else a.head&&(a.head.name=null);a.length=0,a.mode=8;case 8:if(4096&a.flags){if(0===u)break e;k=0;do{R=h[_+k++],a.head&&R&&a.length<65536&&(a.head.comment+=String.fromCharCode(R))}while(R&&k<u);if(512&a.flags&&(a.check=r(a.check,h,k,_)),u-=k,_+=k,R)break e}else a.head&&(a.head.comment=null);a.mode=9;case 9:if(512&a.flags){for(;g<16;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(b!==(65535&a.check)){e.msg=\"header crc mismatch\",a.mode=30;break}b=0,g=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),e.adler=a.check=0,a.mode=12;break;case 10:for(;g<32;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}e.adler=a.check=o(b),b=0,g=0,a.mode=11;case 11:if(0===a.havedict)return e.next_out=f,e.avail_out=c,e.next_in=_,e.avail_in=u,a.hold=b,a.bits=g,2;e.adler=a.check=1,a.mode=12;case 12:if(5===t||6===t)break e;case 13:if(a.last){b>>>=7&g,g-=7&g,a.mode=27;break}for(;g<3;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}switch(a.last=1&b,g-=1,3&(b>>>=1)){case 0:a.mode=14;break;case 1:if(m(a),a.mode=20,6===t){b>>>=2,g-=2;break e}break;case 2:a.mode=17;break;case 3:e.msg=\"invalid block type\",a.mode=30}b>>>=2,g-=2;break;case 14:for(b>>>=7&g,g-=7&g;g<32;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if((65535&b)!=(b>>>16^65535)){e.msg=\"invalid stored block lengths\",a.mode=30;break}if(a.length=65535&b,b=0,g=0,a.mode=15,6===t)break e;case 15:a.mode=16;case 16:if(k=a.length){if(k>u&&(k=u),k>c&&(k=c),0===k)break e;n.arraySet(d,h,_,k,f),u-=k,_+=k,c-=k,f+=k,a.length-=k;break}a.mode=12;break;case 17:for(;g<14;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(a.nlen=257+(31&b),b>>>=5,g-=5,a.ndist=1+(31&b),b>>>=5,g-=5,a.ncode=4+(15&b),b>>>=4,g-=4,a.nlen>286||a.ndist>30){e.msg=\"too many length or distance symbols\",a.mode=30;break}a.have=0,a.mode=18;case 18:for(;a.have<a.ncode;){for(;g<3;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}a.lens[I[a.have++]]=7&b,b>>>=3,g-=3}for(;a.have<19;)a.lens[I[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,T={bits:a.lenbits},B=l(0,a.lens,0,19,a.lencode,0,a.work,T),a.lenbits=T.bits,B){e.msg=\"invalid code lengths set\",a.mode=30;break}a.have=0,a.mode=19;case 19:for(;a.have<a.nlen+a.ndist;){for(;S=(D=a.lencode[b&(1<<a.lenbits)-1])>>>16&255,E=65535&D,!((z=D>>>24)<=g);){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(E<16)b>>>=z,g-=z,a.lens[a.have++]=E;else{if(16===E){for(N=z+2;g<N;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(b>>>=z,g-=z,0===a.have){e.msg=\"invalid bit length repeat\",a.mode=30;break}R=a.lens[a.have-1],k=3+(3&b),b>>>=2,g-=2}else if(17===E){for(N=z+3;g<N;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}g-=z,R=0,k=3+(7&(b>>>=z)),b>>>=3,g-=3}else{for(N=z+7;g<N;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}g-=z,R=0,k=11+(127&(b>>>=z)),b>>>=7,g-=7}if(a.have+k>a.nlen+a.ndist){e.msg=\"invalid bit length repeat\",a.mode=30;break}for(;k--;)a.lens[a.have++]=R}}if(30===a.mode)break;if(0===a.lens[256]){e.msg=\"invalid code -- missing end-of-block\",a.mode=30;break}if(a.lenbits=9,T={bits:a.lenbits},B=l(1,a.lens,0,a.nlen,a.lencode,0,a.work,T),a.lenbits=T.bits,B){e.msg=\"invalid literal/lengths set\",a.mode=30;break}if(a.distbits=6,a.distcode=a.distdyn,T={bits:a.distbits},B=l(2,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,T),a.distbits=T.bits,B){e.msg=\"invalid distances set\",a.mode=30;break}if(a.mode=20,6===t)break e;case 20:a.mode=21;case 21:if(u>=6&&c>=258){e.next_out=f,e.avail_out=c,e.next_in=_,e.avail_in=u,a.hold=b,a.bits=g,s(e,v),f=e.next_out,d=e.output,c=e.avail_out,_=e.next_in,h=e.input,u=e.avail_in,b=a.hold,g=a.bits,12===a.mode&&(a.back=-1);break}for(a.back=0;S=(D=a.lencode[b&(1<<a.lenbits)-1])>>>16&255,E=65535&D,!((z=D>>>24)<=g);){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(S&&0==(240&S)){for(A=z,Z=S,O=E;S=(D=a.lencode[O+((b&(1<<A+Z)-1)>>A)])>>>16&255,E=65535&D,!(A+(z=D>>>24)<=g);){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}b>>>=A,g-=A,a.back+=A}if(b>>>=z,g-=z,a.back+=z,a.length=E,0===S){a.mode=26;break}if(32&S){a.back=-1,a.mode=12;break}if(64&S){e.msg=\"invalid literal/length code\",a.mode=30;break}a.extra=15&S,a.mode=22;case 22:if(a.extra){for(N=a.extra;g<N;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}a.length+=b&(1<<a.extra)-1,b>>>=a.extra,g-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=23;case 23:for(;S=(D=a.distcode[b&(1<<a.distbits)-1])>>>16&255,E=65535&D,!((z=D>>>24)<=g);){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(0==(240&S)){for(A=z,Z=S,O=E;S=(D=a.distcode[O+((b&(1<<A+Z)-1)>>A)])>>>16&255,E=65535&D,!(A+(z=D>>>24)<=g);){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}b>>>=A,g-=A,a.back+=A}if(b>>>=z,g-=z,a.back+=z,64&S){e.msg=\"invalid distance code\",a.mode=30;break}a.offset=E,a.extra=15&S,a.mode=24;case 24:if(a.extra){for(N=a.extra;g<N;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}a.offset+=b&(1<<a.extra)-1,b>>>=a.extra,g-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){e.msg=\"invalid distance too far back\",a.mode=30;break}a.mode=25;case 25:if(0===c)break e;if(k=v-c,a.offset>k){if((k=a.offset-k)>a.whave&&a.sane){e.msg=\"invalid distance too far back\",a.mode=30;break}k>a.wnext?(k-=a.wnext,y=a.wsize-k):y=a.wnext-k,k>a.length&&(k=a.length),x=a.window}else x=d,y=f-a.offset,k=a.length;k>c&&(k=c),c-=k,a.length-=k;do{d[f++]=x[y++]}while(--k);0===a.length&&(a.mode=21);break;case 26:if(0===c)break e;d[f++]=a.length,c--,a.mode=21;break;case 27:if(a.wrap){for(;g<32;){if(0===u)break e;u--,b|=h[_++]<<g,g+=8}if(v-=c,e.total_out+=v,a.total+=v,v&&(e.adler=a.check=a.flags?r(a.check,d,v,f-v):i(a.check,d,v,f-v)),v=c,(a.flags?b:o(b))!==a.check){e.msg=\"incorrect data check\",a.mode=30;break}b=0,g=0}a.mode=28;case 28:if(a.wrap&&a.flags){for(;g<32;){if(0===u)break e;u--,b+=h[_++]<<g,g+=8}if(b!==(4294967295&a.total)){e.msg=\"incorrect length check\",a.mode=30;break}b=0,g=0}a.mode=29;case 29:B=1;break e;case 30:B=-3;break e;case 31:return-4;case 32:default:return-2}return e.next_out=f,e.avail_out=c,e.next_in=_,e.avail_in=u,a.hold=b,a.bits=g,(a.wsize||v!==e.avail_out&&a.mode<30&&(a.mode<27||4!==t))&&w(e,e.output,e.next_out,v-e.avail_out)?(a.mode=31,-4):(p-=e.avail_in,v-=e.avail_out,e.total_in+=p,e.total_out+=v,a.total+=v,a.wrap&&v&&(e.adler=a.check=a.flags?r(a.check,d,v,e.next_out-v):i(a.check,d,v,e.next_out-v)),e.data_type=a.bits+(a.last?64:0)+(12===a.mode?128:0)+(20===a.mode||15===a.mode?256:0),(0===p&&0===v||4===t)&&0===B&&(B=-5),B)},t.inflateEnd=function(e){if(!e||!e.state)return-2;var t=e.state;return t.window&&(t.window=null),e.state=null,0},t.inflateGetHeader=function(e,t){var a;return e&&e.state?0==(2&(a=e.state).wrap)?-2:(a.head=t,t.done=!1,0):-2},t.inflateSetDictionary=function(e,t){var a,n=t.length;return e&&e.state?0!==(a=e.state).wrap&&11!==a.mode?-2:11===a.mode&&i(1,t,n,0)!==a.check?-3:w(e,t,n,n)?(a.mode=31,-4):(a.havedict=1,0):-2},t.inflateInfo=\"pako inflate (from Nodeca project)\"},function(e,t,a){\"use strict\";e.exports=function(e,t,a,n){for(var i=65535&e|0,r=e>>>16&65535|0,s=0;0!==a;){a-=s=a>2e3?2e3:a;do{r=r+(i=i+t[n++]|0)|0}while(--s);i%=65521,r%=65521}return i|r<<16|0}},function(e,t,a){\"use strict\";var n=function(){for(var e,t=[],a=0;a<256;a++){e=a;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[a]=e}return t}();e.exports=function(e,t,a,i){var r=n,s=i+a;e^=-1;for(var l=i;l<s;l++)e=e>>>8^r[255&(e^t[l])];return-1^e}},function(e,t,a){\"use strict\";var n=a(2);function i(e){for(var t=e.length;--t>=0;)e[t]=0}var r=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],s=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],l=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],o=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],h=new Array(576);i(h);var d=new Array(60);i(d);var _=new Array(512);i(_);var f=new Array(256);i(f);var u=new Array(29);i(u);var c,b,g,m=new Array(30);function w(e,t,a,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=a,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function p(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function v(e){return e<256?_[e]:_[256+(e>>>7)]}function k(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function y(e,t,a){e.bi_valid>16-a?(e.bi_buf|=t<<e.bi_valid&65535,k(e,e.bi_buf),e.bi_buf=t>>16-e.bi_valid,e.bi_valid+=a-16):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=a)}function x(e,t,a){y(e,a[2*t],a[2*t+1])}function z(e,t){var a=0;do{a|=1&e,e>>>=1,a<<=1}while(--t>0);return a>>>1}function S(e,t,a){var n,i,r=new Array(16),s=0;for(n=1;n<=15;n++)r[n]=s=s+a[n-1]<<1;for(i=0;i<=t;i++){var l=e[2*i+1];0!==l&&(e[2*i]=z(r[l]++,l))}}function E(e){var t;for(t=0;t<286;t++)e.dyn_ltree[2*t]=0;for(t=0;t<30;t++)e.dyn_dtree[2*t]=0;for(t=0;t<19;t++)e.bl_tree[2*t]=0;e.dyn_ltree[512]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function A(e){e.bi_valid>8?k(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function Z(e,t,a,n){var i=2*t,r=2*a;return e[i]<e[r]||e[i]===e[r]&&n[t]<=n[a]}function O(e,t,a){for(var n=e.heap[a],i=a<<1;i<=e.heap_len&&(i<e.heap_len&&Z(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!Z(t,n,e.heap[i],e.depth));)e.heap[a]=e.heap[i],a=i,i<<=1;e.heap[a]=n}function R(e,t,a){var n,i,l,o,h=0;if(0!==e.last_lit)do{n=e.pending_buf[e.d_buf+2*h]<<8|e.pending_buf[e.d_buf+2*h+1],i=e.pending_buf[e.l_buf+h],h++,0===n?x(e,i,t):(x(e,(l=f[i])+256+1,t),0!==(o=r[l])&&y(e,i-=u[l],o),x(e,l=v(--n),a),0!==(o=s[l])&&y(e,n-=m[l],o))}while(h<e.last_lit);x(e,256,t)}function B(e,t){var a,n,i,r=t.dyn_tree,s=t.stat_desc.static_tree,l=t.stat_desc.has_stree,o=t.stat_desc.elems,h=-1;for(e.heap_len=0,e.heap_max=573,a=0;a<o;a++)0!==r[2*a]?(e.heap[++e.heap_len]=h=a,e.depth[a]=0):r[2*a+1]=0;for(;e.heap_len<2;)r[2*(i=e.heap[++e.heap_len]=h<2?++h:0)]=1,e.depth[i]=0,e.opt_len--,l&&(e.static_len-=s[2*i+1]);for(t.max_code=h,a=e.heap_len>>1;a>=1;a--)O(e,r,a);i=o;do{a=e.heap[1],e.heap[1]=e.heap[e.heap_len--],O(e,r,1),n=e.heap[1],e.heap[--e.heap_max]=a,e.heap[--e.heap_max]=n,r[2*i]=r[2*a]+r[2*n],e.depth[i]=(e.depth[a]>=e.depth[n]?e.depth[a]:e.depth[n])+1,r[2*a+1]=r[2*n+1]=i,e.heap[1]=i++,O(e,r,1)}while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],function(e,t){var a,n,i,r,s,l,o=t.dyn_tree,h=t.max_code,d=t.stat_desc.static_tree,_=t.stat_desc.has_stree,f=t.stat_desc.extra_bits,u=t.stat_desc.extra_base,c=t.stat_desc.max_length,b=0;for(r=0;r<=15;r++)e.bl_count[r]=0;for(o[2*e.heap[e.heap_max]+1]=0,a=e.heap_max+1;a<573;a++)(r=o[2*o[2*(n=e.heap[a])+1]+1]+1)>c&&(r=c,b++),o[2*n+1]=r,n>h||(e.bl_count[r]++,s=0,n>=u&&(s=f[n-u]),l=o[2*n],e.opt_len+=l*(r+s),_&&(e.static_len+=l*(d[2*n+1]+s)));if(0!==b){do{for(r=c-1;0===e.bl_count[r];)r--;e.bl_count[r]--,e.bl_count[r+1]+=2,e.bl_count[c]--,b-=2}while(b>0);for(r=c;0!==r;r--)for(n=e.bl_count[r];0!==n;)(i=e.heap[--a])>h||(o[2*i+1]!==r&&(e.opt_len+=(r-o[2*i+1])*o[2*i],o[2*i+1]=r),n--)}}(e,t),S(r,h,e.bl_count)}function T(e,t,a){var n,i,r=-1,s=t[1],l=0,o=7,h=4;for(0===s&&(o=138,h=3),t[2*(a+1)+1]=65535,n=0;n<=a;n++)i=s,s=t[2*(n+1)+1],++l<o&&i===s||(l<h?e.bl_tree[2*i]+=l:0!==i?(i!==r&&e.bl_tree[2*i]++,e.bl_tree[32]++):l<=10?e.bl_tree[34]++:e.bl_tree[36]++,l=0,r=i,0===s?(o=138,h=3):i===s?(o=6,h=3):(o=7,h=4))}function N(e,t,a){var n,i,r=-1,s=t[1],l=0,o=7,h=4;for(0===s&&(o=138,h=3),n=0;n<=a;n++)if(i=s,s=t[2*(n+1)+1],!(++l<o&&i===s)){if(l<h)do{x(e,i,e.bl_tree)}while(0!=--l);else 0!==i?(i!==r&&(x(e,i,e.bl_tree),l--),x(e,16,e.bl_tree),y(e,l-3,2)):l<=10?(x(e,17,e.bl_tree),y(e,l-3,3)):(x(e,18,e.bl_tree),y(e,l-11,7));l=0,r=i,0===s?(o=138,h=3):i===s?(o=6,h=3):(o=7,h=4)}}i(m);var D=!1;function U(e,t,a,i){y(e,0+(i?1:0),3),function(e,t,a,i){A(e),i&&(k(e,a),k(e,~a)),n.arraySet(e.pending_buf,e.window,t,a,e.pending),e.pending+=a}(e,t,a,!0)}t._tr_init=function(e){D||(!function(){var e,t,a,n,i,o=new Array(16);for(a=0,n=0;n<28;n++)for(u[n]=a,e=0;e<1<<r[n];e++)f[a++]=n;for(f[a-1]=n,i=0,n=0;n<16;n++)for(m[n]=i,e=0;e<1<<s[n];e++)_[i++]=n;for(i>>=7;n<30;n++)for(m[n]=i<<7,e=0;e<1<<s[n]-7;e++)_[256+i++]=n;for(t=0;t<=15;t++)o[t]=0;for(e=0;e<=143;)h[2*e+1]=8,e++,o[8]++;for(;e<=255;)h[2*e+1]=9,e++,o[9]++;for(;e<=279;)h[2*e+1]=7,e++,o[7]++;for(;e<=287;)h[2*e+1]=8,e++,o[8]++;for(S(h,287,o),e=0;e<30;e++)d[2*e+1]=5,d[2*e]=z(e,5);c=new w(h,r,257,286,15),b=new w(d,s,0,30,15),g=new w(new Array(0),l,0,19,7)}(),D=!0),e.l_desc=new p(e.dyn_ltree,c),e.d_desc=new p(e.dyn_dtree,b),e.bl_desc=new p(e.bl_tree,g),e.bi_buf=0,e.bi_valid=0,E(e)},t._tr_stored_block=U,t._tr_flush_block=function(e,t,a,n){var i,r,s=0;e.level>0?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,a=4093624447;for(t=0;t<=31;t++,a>>>=1)if(1&a&&0!==e.dyn_ltree[2*t])return 0;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return 1;for(t=32;t<256;t++)if(0!==e.dyn_ltree[2*t])return 1;return 0}(e)),B(e,e.l_desc),B(e,e.d_desc),s=function(e){var t;for(T(e,e.dyn_ltree,e.l_desc.max_code),T(e,e.dyn_dtree,e.d_desc.max_code),B(e,e.bl_desc),t=18;t>=3&&0===e.bl_tree[2*o[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(r=e.static_len+3+7>>>3)<=i&&(i=r)):i=r=a+5,a+4<=i&&-1!==t?U(e,t,a,n):4===e.strategy||r===i?(y(e,2+(n?1:0),3),R(e,h,d)):(y(e,4+(n?1:0),3),function(e,t,a,n){var i;for(y(e,t-257,5),y(e,a-1,5),y(e,n-4,4),i=0;i<n;i++)y(e,e.bl_tree[2*o[i]+1],3);N(e,e.dyn_ltree,t-1),N(e,e.dyn_dtree,a-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),R(e,e.dyn_ltree,e.dyn_dtree)),E(e),n&&A(e)},t._tr_tally=function(e,t,a){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&a,e.last_lit++,0===t?e.dyn_ltree[2*a]++:(e.matches++,t--,e.dyn_ltree[2*(f[a]+256+1)]++,e.dyn_dtree[2*v(t)]++),e.last_lit===e.lit_bufsize-1},t._tr_align=function(e){y(e,2,3),x(e,256,h),function(e){16===e.bi_valid?(k(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},function(e,t,a){\"use strict\";e.exports=function(e,t){var a,n,i,r,s,l,o,h,d,_,f,u,c,b,g,m,w,p,v,k,y,x,z,S,E;a=e.state,n=e.next_in,S=e.input,i=n+(e.avail_in-5),r=e.next_out,E=e.output,s=r-(t-e.avail_out),l=r+(e.avail_out-257),o=a.dmax,h=a.wsize,d=a.whave,_=a.wnext,f=a.window,u=a.hold,c=a.bits,b=a.lencode,g=a.distcode,m=(1<<a.lenbits)-1,w=(1<<a.distbits)-1;e:do{c<15&&(u+=S[n++]<<c,c+=8,u+=S[n++]<<c,c+=8),p=b[u&m];t:for(;;){if(u>>>=v=p>>>24,c-=v,0===(v=p>>>16&255))E[r++]=65535&p;else{if(!(16&v)){if(0==(64&v)){p=b[(65535&p)+(u&(1<<v)-1)];continue t}if(32&v){a.mode=12;break e}e.msg=\"invalid literal/length code\",a.mode=30;break e}k=65535&p,(v&=15)&&(c<v&&(u+=S[n++]<<c,c+=8),k+=u&(1<<v)-1,u>>>=v,c-=v),c<15&&(u+=S[n++]<<c,c+=8,u+=S[n++]<<c,c+=8),p=g[u&w];a:for(;;){if(u>>>=v=p>>>24,c-=v,!(16&(v=p>>>16&255))){if(0==(64&v)){p=g[(65535&p)+(u&(1<<v)-1)];continue a}e.msg=\"invalid distance code\",a.mode=30;break e}if(y=65535&p,c<(v&=15)&&(u+=S[n++]<<c,(c+=8)<v&&(u+=S[n++]<<c,c+=8)),(y+=u&(1<<v)-1)>o){e.msg=\"invalid distance too far back\",a.mode=30;break e}if(u>>>=v,c-=v,y>(v=r-s)){if((v=y-v)>d&&a.sane){e.msg=\"invalid distance too far back\",a.mode=30;break e}if(x=0,z=f,0===_){if(x+=h-v,v<k){k-=v;do{E[r++]=f[x++]}while(--v);x=r-y,z=E}}else if(_<v){if(x+=h+_-v,(v-=_)<k){k-=v;do{E[r++]=f[x++]}while(--v);if(x=0,_<k){k-=v=_;do{E[r++]=f[x++]}while(--v);x=r-y,z=E}}}else if(x+=_-v,v<k){k-=v;do{E[r++]=f[x++]}while(--v);x=r-y,z=E}for(;k>2;)E[r++]=z[x++],E[r++]=z[x++],E[r++]=z[x++],k-=3;k&&(E[r++]=z[x++],k>1&&(E[r++]=z[x++]))}else{x=r-y;do{E[r++]=E[x++],E[r++]=E[x++],E[r++]=E[x++],k-=3}while(k>2);k&&(E[r++]=E[x++],k>1&&(E[r++]=E[x++]))}break}}break}}while(n<i&&r<l);n-=k=c>>3,u&=(1<<(c-=k<<3))-1,e.next_in=n,e.next_out=r,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=r<l?l-r+257:257-(r-l),a.hold=u,a.bits=c}},function(e,t,a){\"use strict\";var n=a(2),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],r=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],l=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(e,t,a,o,h,d,_,f){var u,c,b,g,m,w,p,v,k,y=f.bits,x=0,z=0,S=0,E=0,A=0,Z=0,O=0,R=0,B=0,T=0,N=null,D=0,U=new n.Buf16(16),I=new n.Buf16(16),F=null,L=0;for(x=0;x<=15;x++)U[x]=0;for(z=0;z<o;z++)U[t[a+z]]++;for(A=y,E=15;E>=1&&0===U[E];E--);if(A>E&&(A=E),0===E)return h[d++]=20971520,h[d++]=20971520,f.bits=1,0;for(S=1;S<E&&0===U[S];S++);for(A<S&&(A=S),R=1,x=1;x<=15;x++)if(R<<=1,(R-=U[x])<0)return-1;if(R>0&&(0===e||1!==E))return-1;for(I[1]=0,x=1;x<15;x++)I[x+1]=I[x]+U[x];for(z=0;z<o;z++)0!==t[a+z]&&(_[I[t[a+z]]++]=z);if(0===e?(N=F=_,w=19):1===e?(N=i,D-=257,F=r,L-=257,w=256):(N=s,F=l,w=-1),T=0,z=0,x=S,m=d,Z=A,O=0,b=-1,g=(B=1<<A)-1,1===e&&B>852||2===e&&B>592)return 1;for(;;){p=x-O,_[z]<w?(v=0,k=_[z]):_[z]>w?(v=F[L+_[z]],k=N[D+_[z]]):(v=96,k=0),u=1<<x-O,S=c=1<<Z;do{h[m+(T>>O)+(c-=u)]=p<<24|v<<16|k|0}while(0!==c);for(u=1<<x-1;T&u;)u>>=1;if(0!==u?(T&=u-1,T+=u):T=0,z++,0==--U[x]){if(x===E)break;x=t[a+_[z]]}if(x>A&&(T&g)!==b){for(0===O&&(O=A),m+=S,R=1<<(Z=x-O);Z+O<E&&!((R-=U[Z+O])<=0);)Z++,R<<=1;if(B+=1<<Z,1===e&&B>852||2===e&&B>592)return 1;h[b=T&g]=A<<24|Z<<16|m-d|0}}return 0!==T&&(h[m+T]=x-O<<24|64<<16|0),f.bits=A,0}},function(e,t,a){\"use strict\";a.r(t);var n=a(3),i=a.n(n),r=a(4),s=a(5),l=a(1),o=a.n(l),h=a(0);function d(e,t){var a=this;this.inflatedReady=e,this.deflatedReady=t,this._inflate=function(e){var t=new i.a,a=Object(s.inflateInit2)(t,15);if(a!==h.Z_OK)throw new Error(\"Problem initializing inflate stream: \"+o.a[a]);return function(a){if(void 0===a)return e();var n,i,r;t.input=a,t.next_in=0,t.avail_in=t.input.length;var l=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(16384),n=t.next_out=0,t.avail_out=16384),(i=Object(s.inflate)(t,h.Z_NO_FLUSH))!==h.Z_STREAM_END&&i!==h.Z_OK)throw new Error(\"inflate problem: \"+o.a[i]);t.next_out&&(0!==t.avail_out&&i!==h.Z_STREAM_END||(r=t.output.subarray(n,n=t.next_out),l=e(r)))}while(t.avail_in>0&&i!==h.Z_STREAM_END);return t.next_out>n&&(r=t.output.subarray(n,n=t.next_out),l=e(r)),l}}((function(e){return a.inflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))})),this._deflate=function(e){var t=new i.a,a=Object(r.deflateInit2)(t,h.Z_DEFAULT_COMPRESSION,h.Z_DEFLATED,15,8,h.Z_DEFAULT_STRATEGY);if(a!==h.Z_OK)throw new Error(\"Problem initializing deflate stream: \"+o.a[a]);return function(a){if(void 0===a)return e();var n,i,s;t.input=a,t.next_in=0,t.avail_in=t.input.length;var l=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(16384),s=t.next_out=0,t.avail_out=16384),(n=Object(r.deflate)(t,h.Z_SYNC_FLUSH))!==h.Z_STREAM_END&&n!==h.Z_OK)throw new Error(\"Deflate problem: \"+o.a[n]);0===t.avail_out&&t.next_out>s&&(i=t.output.subarray(s,s=t.next_out),l=e(i))}while((t.avail_in>0||0===t.avail_out)&&n!==h.Z_STREAM_END);return t.next_out>s&&(i=t.output.subarray(s,s=t.next_out),l=e(i)),l}}((function(e){return a.deflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))}))}d.prototype.inflate=function(e){this._inflate(new Uint8Array(e))},d.prototype.deflate=function(e){this._deflate(new Uint8Array(e))};var _=function(e,t){return{message:e,buffer:t}},f=new d((function(e){return self.postMessage(_(\"inflated_ready\",e),[e])}),(function(e){return self.postMessage(_(\"deflated_ready\",e),[e])}));self.onmessage=function(e){var t=e.data.message,a=e.data.buffer;switch(t){case\"start\":break;case\"inflate\":f.inflate(a);break;case\"deflate\":f.deflate(a)}}}]);"; //
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
const ASCII_PLUS = 43; // State tracking when constructing an IMAP command from buffers.

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

const TIMEOUT_SOCKET_LOWER_BOUND = 60000;
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
    this.host = host || 'localhost'; // Use a TLS connection. Port 993 also forces TLS.

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
    this._literalRemaining = 0; //
    // Event placeholders, may be overriden with callback functions
    //

    this.oncert = null;
    this.onerror = null; // Irrecoverable error occurred. Connection to the server will be closed automatically.

    this.onready = null; // The connection to the server has been established and greeting is received

    this.onidle = null; // There are no more commands to process
  } // PUBLIC METHODS

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


  connect(Socket = _emailjsTcpSocket.default) {
    return new Promise((resolve, reject) => {
      this.socket = Socket.open(this.host, this.port, {
        binaryType: 'arraybuffer',
        useSecureTransport: this.secureMode,
        ca: this.options.ca
      }); // allows certificate handling for platform w/o native tls support
      // oncert is non standard so setting it might throw if the socket object is immutable

      try {
        this.socket.oncert = cert => {
          this.oncert && this.oncert(cert);
        };
      } catch (E) {} // Connection closing unexpected is an error


      this.socket.onclose = () => this._onError(new Error('Socket closed unexpectedly!'));

      this.socket.ondata = evt => {
        try {
          this._onData(evt);
        } catch (err) {
          this._onError(err);
        }
      }; // if an error happens during create time, reject the promise


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
    if (this._enteredClosingState) {
      return Promise.resolve();
    }

    this._enteredClosingState = true;
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
    return new Promise(resolve => {
      var reject = error => {
        return resolve(this.close(error));
      };

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
      }; // apply any additional options to the command

      Object.keys(options || {}).forEach(key => {
        data[key] = options[key];
      });
      acceptUntagged.forEach(command => {
        data.payload[command] = [];
      }); // if we're in priority mode (i.e. we ran commands in a precheck),
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
    const startIndex = this._clientQueue.indexOf(ctx) - 1; // search backwards for the commands and return the first found

    for (let i = startIndex; i >= 0; i--) {
      if (isMatch(this._clientQueue[i])) {
        return this._clientQueue[i];
      }
    } // also check current command if no SELECT is queued


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
      if (!this.socket) {
        this._onError(new Error('Error :: Unexpected socket close'));
      } else {
        this.socket.send(buffer);
      }
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
  } // INTERNAL EVENTS

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

    this.logger.error(error); // always call onerror callback, no matter if close() succeeds or fails

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
    let i = 0; // loop invariant:
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
          } // find end of command


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
  } // PRIVATE METHODS

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
        response = (0, _emailjsImapHandler.parser)(command, {
          valueAsString
        });
        this.logger.debug('S:', () => (0, _emailjsImapHandler.compiler)(response, false, true));
      } catch (e) {
        this.logger.error('Error parsing imap command!', response);
        return this._onError(e);
      }

      this._processResponse(response);

      this._handleResponse(response); // first response from the server, connection is now usable


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

    this._clearIdle(); // an operation was made in the precheck, no need to restart the queue manually


    this._restartQueue = false;
    var command = this._clientQueue[0];

    if (typeof command.precheck === 'function') {
      // remember the context
      var context = command;
      var precheck = context.precheck;
      delete context.precheck; // we need to restart the queue handling if no operation was made in the precheck

      this._restartQueue = true; // invoke the precheck command and resume normal operation after the promise resolves

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
    const command = (0, _ramda.propOr)('', 'command', response).toUpperCase().trim(); // no attributes

    if (!response || !response.attributes || !response.attributes.length) {
      return;
    } // untagged responses w/ sequence numbers


    if (response.tag === '*' && /^\d+$/.test(response.command) && response.attributes[0].type === 'ATOM') {
      response.nr = Number(response.command);
      response.command = (response.attributes.shift().value || '').toString().toUpperCase().trim();
    } // no optional response code


    if (['OK', 'NO', 'BAD', 'BYE', 'PREAUTH'].indexOf(command) < 0) {
      return;
    } // If last element of the response is TEXT then this is for humans


    if (response.attributes[response.attributes.length - 1].type === 'TEXT') {
      response.humanReadable = response.attributes[response.attributes.length - 1].value;
    } // Parse and format ATOM values


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
  } // COMPRESSION RELATED METHODS

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
            this._socketOnData({
              data
            });

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
        this._socketOnData({
          data: buffer
        });
      };

      const deflatedReady = buffer => {
        this.waitDrain = this.socket.send(buffer);
      };

      this._compression = new _compression.default(inflatedReady, deflatedReady);
    } // override data handler, decompress incoming data


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

const createMessage = (message, buffer) => ({
  message,
  buffer
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLmpzIl0sIm5hbWVzIjpbIk1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIiLCJNRVNTQUdFX0lORkxBVEUiLCJNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFkiLCJNRVNTQUdFX0RFRkxBVEUiLCJNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkiLCJFT0wiLCJMSU5FX0ZFRUQiLCJDQVJSSUFHRV9SRVRVUk4iLCJMRUZUX0NVUkxZX0JSQUNLRVQiLCJSSUdIVF9DVVJMWV9CUkFDS0VUIiwiQVNDSUlfUExVUyIsIkJVRkZFUl9TVEFURV9MSVRFUkFMIiwiQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzEiLCJCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMiIsIkJVRkZFUl9TVEFURV9ERUZBVUxUIiwiVElNRU9VVF9FTlRFUl9JRExFIiwiVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkQiLCJUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSIiwiSW1hcCIsImNvbnN0cnVjdG9yIiwiaG9zdCIsInBvcnQiLCJvcHRpb25zIiwidGltZW91dEVudGVySWRsZSIsInRpbWVvdXRTb2NrZXRMb3dlckJvdW5kIiwidGltZW91dFNvY2tldE11bHRpcGxpZXIiLCJ1c2VTZWN1cmVUcmFuc3BvcnQiLCJzZWN1cmVNb2RlIiwiX2Nvbm5lY3Rpb25SZWFkeSIsIl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCIsIl9jbGllbnRRdWV1ZSIsIl9jYW5TZW5kIiwiX3RhZ0NvdW50ZXIiLCJfY3VycmVudENvbW1hbmQiLCJfaWRsZVRpbWVyIiwiX3NvY2tldFRpbWVvdXRUaW1lciIsImNvbXByZXNzZWQiLCJfaW5jb21pbmdCdWZmZXJzIiwiX2J1ZmZlclN0YXRlIiwiX2xpdGVyYWxSZW1haW5pbmciLCJvbmNlcnQiLCJvbmVycm9yIiwib25yZWFkeSIsIm9uaWRsZSIsImNvbm5lY3QiLCJTb2NrZXQiLCJUQ1BTb2NrZXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNvY2tldCIsIm9wZW4iLCJiaW5hcnlUeXBlIiwiY2EiLCJjZXJ0IiwiRSIsIm9uY2xvc2UiLCJfb25FcnJvciIsIkVycm9yIiwib25kYXRhIiwiZXZ0IiwiX29uRGF0YSIsImVyciIsImUiLCJkYXRhIiwibWVzc2FnZSIsIm9ub3BlbiIsImNsb3NlIiwiZXJyb3IiLCJfZW50ZXJlZENsb3NpbmdTdGF0ZSIsInRlYXJEb3duIiwiZm9yRWFjaCIsImNtZCIsImNhbGxiYWNrIiwiY2xlYXJUaW1lb3V0IiwiX2Rpc2FibGVDb21wcmVzc2lvbiIsInJlYWR5U3RhdGUiLCJsb2dvdXQiLCJ0aGVuIiwiY2F0Y2giLCJlbnF1ZXVlQ29tbWFuZCIsInVwZ3JhZGUiLCJ1cGdyYWRlVG9TZWN1cmUiLCJyZXF1ZXN0IiwiYWNjZXB0VW50YWdnZWQiLCJjb21tYW5kIiwiY29uY2F0IiwibWFwIiwidW50YWdnZWQiLCJ0b1N0cmluZyIsInRvVXBwZXJDYXNlIiwidHJpbSIsInRhZyIsInBheWxvYWQiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJyZXNwb25zZSIsImlzRXJyb3IiLCJpbmRleE9mIiwiaHVtYW5SZWFkYWJsZSIsImNvZGUiLCJPYmplY3QiLCJrZXlzIiwia2V5IiwiaW5kZXgiLCJjdHgiLCJzcGxpY2UiLCJwdXNoIiwiX3NlbmRSZXF1ZXN0IiwiZ2V0UHJldmlvdXNseVF1ZXVlZCIsImNvbW1hbmRzIiwic3RhcnRJbmRleCIsImkiLCJpc01hdGNoIiwic2VuZCIsInN0ciIsImJ1ZmZlciIsInRpbWVvdXQiLCJNYXRoIiwiZmxvb3IiLCJieXRlTGVuZ3RoIiwic2V0VGltZW91dCIsIl9zZW5kQ29tcHJlc3NlZCIsInNldEhhbmRsZXIiLCJsb2dnZXIiLCJVaW50OEFycmF5IiwiX3BhcnNlSW5jb21pbmdDb21tYW5kcyIsIl9pdGVyYXRlSW5jb21pbmdCdWZmZXIiLCJidWYiLCJkaWZmIiwibWluIiwiTnVtYmVyIiwiX2xlbmd0aEJ1ZmZlciIsInN0YXJ0IiwibGF0ZXN0Iiwic3ViYXJyYXkiLCJwcmV2QnVmIiwic2V0IiwibGVmdElkeCIsImxlZnRPZkxlZnRDdXJseSIsIkxGaWR4IiwiY29tbWFuZExlbmd0aCIsInJlZHVjZSIsInByZXYiLCJjdXJyIiwidWludDhBcnJheSIsInNoaWZ0IiwicmVtYWluaW5nTGVuZ3RoIiwiZXhjZXNzTGVuZ3RoIiwiX2NsZWFySWRsZSIsImNodW5rIiwiZXJyb3JSZXNwb25zZUV4cGVjdHNFbXB0eUxpbmUiLCJ2YWx1ZUFzU3RyaW5nIiwiZGVidWciLCJfcHJvY2Vzc1Jlc3BvbnNlIiwiX2hhbmRsZVJlc3BvbnNlIiwiX2VudGVySWRsZSIsIl9yZXN0YXJ0UXVldWUiLCJwcmVjaGVjayIsImNvbnRleHQiLCJ3YWl0RHJhaW4iLCJhdHRyaWJ1dGVzIiwidGVzdCIsInR5cGUiLCJuciIsInZhbHVlIiwic2VjdGlvbiIsIm9wdGlvbiIsIkFycmF5IiwiaXNBcnJheSIsInRvTG93ZXJDYXNlIiwicHJvdG90eXBlIiwiY2FsbCIsIm1hdGNoIiwiZW5hYmxlQ29tcHJlc3Npb24iLCJfc29ja2V0T25EYXRhIiwid2luZG93IiwiV29ya2VyIiwiX2NvbXByZXNzaW9uV29ya2VyIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiQmxvYiIsIkNvbXByZXNzaW9uQmxvYiIsIm9ubWVzc2FnZSIsInBvc3RNZXNzYWdlIiwiY3JlYXRlTWVzc2FnZSIsImluZmxhdGVkUmVhZHkiLCJkZWZsYXRlZFJlYWR5IiwiX2NvbXByZXNzaW9uIiwiQ29tcHJlc3Npb24iLCJpbmZsYXRlIiwidGVybWluYXRlIiwiZGVmbGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7OztxMXZDQUdBO0FBQ0E7QUFDQTs7QUFDQSxNQUFNQSx5QkFBeUIsR0FBRyxPQUFsQztBQUNBLE1BQU1DLGVBQWUsR0FBRyxTQUF4QjtBQUNBLE1BQU1DLDJCQUEyQixHQUFHLGdCQUFwQztBQUNBLE1BQU1DLGVBQWUsR0FBRyxTQUF4QjtB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Q3RMLGVBQUQsRUFBa0JpSCxNQUFsQixDQUFqRCxFQUE0RSxDQUFDQSxNQUFELENBQTVFO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsV0FBS3dFLFlBQUwsQ0FBa0JJLE9BQWxCLENBQTBCNUUsTUFBMUI7QUFDRDtBQUNGOztBQXh4QnVCOzs7O0FBMnhCMUIsTUFBTXFFLGFBQWEsR0FBRyxDQUFDeEgsT0FBRCxFQUFVbUQsTUFBVixNQUFzQjtBQUFFbkQsRUFBQUEsT0FBRjtBQUFXbUQsRUFBQUE7QUFBWCxDQUF0QixDQUF0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByb3BPciB9IGZyb20gJ3JhbWRhJ1xuaW1wb3J0IFRDUFNvY2tldCBmcm9tICdlbWFpbGpzLXRjcC1zb2NrZXQnXG5pbXBvcnQgeyB0b1R5cGVkQXJyYXksIGZyb21UeXBlZEFycmF5IH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgeyBwYXJzZXIsIGNvbXBpbGVyIH0gZnJvbSAnZW1haWxqcy1pbWFwLWhhbmRsZXInXG5pbXBvcnQgQ29tcHJlc3Npb24gZnJvbSAnLi9jb21wcmVzc2lvbidcbmltcG9ydCBDb21wcmVzc2lvbkJsb2IgZnJvbSAnLi4vcmVzL2NvbXByZXNzaW9uLndvcmtlci5ibG9iJ1xuXG4vL1xuLy8gY29uc3RhbnRzIHVzZWQgZm9yIGNvbW11bmljYXRpb24gd2l0aCB0aGUgd29ya2VyXG4vL1xuY29uc3QgTUVTU0FHRV9JTklUSUFMSVpFX1dPUktFUiA9ICdzdGFydCdcbmNvbnN0IE1FU1NBR0VfSU5GTEFURSA9ICdpbmZsYXRlJ1xuY29uc3QgTUVTU0FHRV9JTkZMQVRFRF9EQVRBX1JFQURZID0gJ2luZmxhdGVkX3JlYWR5J1xuY29uc3QgTUVTU0FHRV9ERUZMQVRFID0gJ2RlZmxhdGUnXG5jb25zdCBNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkgPSAnZGVmbGF0ZWRfcmVhZHknXG5cbmNvbnN0IEVPTCA9ICdcXHJcXG4nXG5jb25zdCBMSU5FX0ZFRUQgPSAxMFxuY29uc3QgQ0FSUklBR0VfUkVUVVJOID0gMTNcbmNvbnN0IExFRlRfQ1VSTFlfQlJBQ0tFVCA9IDEyM1xuY29uc3QgUklHSFRfQ1VSTFlfQlJBQ0tFVCA9IDEyNVxuXG5jb25zdCBBU0NJSV9QTFVTID0gNDNcblxuLy8gU3RhdGUgdHJhY2tpbmcgd2hlbiBjb25zdHJ1Y3RpbmcgYW4gSU1BUCBjb21tYW5kIGZyb20gYnVmZmVycy5cbmNvbnN0IEJVRkZFUl9TVEFURV9MSVRFUkFMID0gJ2xpdGVyYWwnXG5jb25zdCBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMSA9ICdsaXRlcmFsX2xlbmd0aF8xJ1xuY29uc3QgQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzIgPSAnbGl0ZXJhbF9sZW5ndGhfMidcbmNvbnN0IEJVRkZFUl9TVEFURV9ERUZBVUxUID0gJ2RlZmF1bHQnXG5cbi8qKlxuICogSG93IG11Y2ggdGltZSB0byB3YWl0IHNpbmNlIHRoZSBsYXN0IHJlc3BvbnNlIHVudGlsIHRoZSBjb25uZWN0aW9uIGlzIGNvbnNpZGVyZWQgaWRsaW5nXG4gKi9cbmNvbnN0IFRJTUVPVVRfRU5URVJfSURMRSA9IDEwMDBcblxuLyoqXG4gKiBMb3dlciBCb3VuZCBmb3Igc29ja2V0IHRpbWVvdXQgdG8gd2FpdCBzaW5jZSB0aGUgbGFzdCBkYXRhIHdhcyB3cml0dGVuIHRvIGEgc29ja2V0XG4gKi9cbmNvbnN0IFRJTUVPVVRfU09DS0VUX0xPV0VSX0JPVU5EID0gNjAwMDBcblxuLyoqXG4gKiBNdWx0aXBsaWVyIGZvciBzb2NrZXQgdGltZW91dDpcbiAqXG4gKiBXZSBhc3N1bWUgYXQgbGVhc3QgYSBHUFJTIGNvbm5lY3Rpb24gd2l0aCAxMTUga2IvcyA9IDE0LDM3NSBrQi9zIHRvcHMsIHNvIDEwIEtCL3MgdG8gYmUgb25cbiAqIHRoZSBzYWZlIHNpZGUuIFdlIGNhbiB0aW1lb3V0IGFmdGVyIGEgbG93ZXIgYm91bmQgb2YgMTBzICsgKG4gS0IgLyAxMCBLQi9zKS4gQSAxIE1CIG1lc3NhZ2VcbiAqIHVwbG9hZCB3b3VsZCBiZSAxMTAgc2Vjb25kcyB0byB3YWl0IGZvciB0aGUgdGltZW91dC4gMTAgS0IvcyA9PT0gMC4xIHMvQlxuICovXG5jb25zdCBUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSID0gMC4xXG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbm5lY3Rpb24gb2JqZWN0IHRvIGFuIElNQVAgc2VydmVyLiBDYWxsIGBjb25uZWN0YCBtZXRob2QgdG8gaW5pdGl0YXRlXG4gKiB0aGUgYWN0dWFsIGNvbm5lY3Rpb24sIHRoZSBjb25zdHJ1Y3RvciBvbmx5IGRlZmluZXMgdGhlIHByb3BlcnRpZXMgYnV0IGRvZXMgbm90IGFjdHVhbGx5IGNvbm5lY3QuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtob3N0PSdsb2NhbGhvc3QnXSBIb3N0bmFtZSB0byBjb25lbmN0IHRvXG4gKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9MTQzXSBQb3J0IG51bWJlciB0byBjb25uZWN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0XG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydF0gU2V0IHRvIHRydWUsIHRvIHVzZSBlbmNyeXB0ZWQgY29ubmVjdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmNvbXByZXNzaW9uV29ya2VyUGF0aF0gb2ZmbG9hZHMgZGUtL2NvbXByZXNzaW9uIGNvbXB1dGF0aW9uIHRvIGEgd2ViIHdvcmtlciwgdGhpcyBpcyB0aGUgcGF0aCB0byB0aGUgYnJvd3NlcmlmaWVkIGVtYWlsanMtY29tcHJlc3Nvci13b3JrZXIuanNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hcCB7XG4gIGNvbnN0cnVjdG9yIChob3N0LCBwb3J0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnRpbWVvdXRFbnRlcklkbGUgPSBUSU1FT1VUX0VOVEVSX0lETEVcbiAgICB0aGlzLnRpbWVvdXRTb2NrZXRMb3dlckJvdW5kID0gVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkRcbiAgICB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyID0gVElNRU9VVF9TT0NLRVRfTVVMVElQTElFUlxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuXG4gICAgdGhpcy5wb3J0ID0gcG9ydCB8fCAodGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCA/IDk5MyA6IDE0MylcbiAgICB0aGlzLmhvc3QgPSBob3N0IHx8ICdsb2NhbGhvc3QnXG5cbiAgICAvLyBVc2UgYSBUTFMgY29ubmVjdGlvbi4gUG9ydCA5OTMgYWxzbyBmb3JjZXMgVExTLlxuICAgIHRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgPSAndXNlU2VjdXJlVHJhbnNwb3J0JyBpbiB0aGlzLm9wdGlvbnMgPyAhIXRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgOiB0aGlzLnBvcnQgPT09IDk5M1xuXG4gICAgdGhpcy5zZWN1cmVNb2RlID0gISF0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0IC8vIERvZXMgdGhlIGNvbm5lY3Rpb24gdXNlIFNTTC9UTFNcblxuICAgIHRoaXMuX2Nvbm5lY3Rpb25SZWFkeSA9IGZhbHNlIC8vIElzIHRoZSBjb25lY3Rpb24gZXN0YWJsaXNoZWQgYW5kIGdyZWV0aW5nIGlzIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlclxuXG4gICAgdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWQgPSB7fSAvLyBHbG9iYWwgaGFuZGxlcnMgZm9yIHVucmVsYXRlZCByZXNwb25zZXMgKEVYUFVOR0UsIEVYSVNUUyBldGMuKVxuXG4gICAgdGhpcy5fY2xpZW50UXVldWUgPSBbXSAvLyBRdWV1ZSBvZiBvdXRnb2luZyBjb21tYW5kc1xuICAgIHRoaXMuX2NhblNlbmQgPSBmYWxzZSAvLyBJcyBpdCBPSyB0byBzZW5kIHNvbWV0aGluZyB0byB0aGUgc2VydmVyXG4gICAgdGhpcy5fdGFnQ291bnRlciA9IDAgLy8gQ291bnRlciB0byBhbGxvdyB1bmlxdWV1ZSBpbWFwIHRhZ3NcbiAgICB0aGlzLl9jdXJyZW50Q29tbWFuZCA9IGZhbHNlIC8vIEN1cnJlbnQgY29tbWFuZCB0aGF0IGlzIHdhaXRpbmcgZm9yIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlclxuXG4gICAgdGhpcy5faWRsZVRpbWVyID0gZmFsc2UgLy8gVGltZXIgd2FpdGluZyB0byBlbnRlciBpZGxlXG4gICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gZmFsc2UgLy8gVGltZXIgd2FpdGluZyB0byBkZWNsYXJlIHRoZSBzb2NrZXQgZGVhZCBzdGFydGluZyBmcm9tIHRoZSBsYXN0IHdyaXRlXG5cbiAgICB0aGlzLmNvbXByZXNzZWQgPSBmYWxzZSAvLyBJcyB0aGUgY29ubmVjdGlvbiBjb21wcmVzc2VkIGFuZCBuZWVkcyBpbmZsYXRpbmcvZGVmbGF0aW5nXG5cbiAgICAvL1xuICAgIC8vIEhFTFBFUlNcbiAgICAvL1xuXG4gICAgLy8gQXMgdGhlIHNlcnZlciBzZW5kcyBkYXRhIGluIGNodW5rcywgaXQgbmVlZHMgdG8gYmUgc3BsaXQgaW50byBzZXBhcmF0ZSBsaW5lcy4gSGVscHMgcGFyc2luZyB0aGUgaW5wdXQuXG4gICAgdGhpcy5faW5jb21pbmdCdWZmZXJzID0gW11cbiAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyA9IDBcblxuICAgIC8vXG4gICAgLy8gRXZlbnQgcGxhY2Vob2xkZXJzLCBtYXkgYmUgb3ZlcnJpZGVuIHdpdGggY2FsbGJhY2sgZnVuY3Rpb25zXG4gICAgLy9cbiAgICB0aGlzLm9uY2VydCA9IG51bGxcbiAgICB0aGlzLm9uZXJyb3IgPSBudWxsIC8vIElycmVjb3ZlcmFibGUgZXJyb3Igb2NjdXJyZWQuIENvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciB3aWxsIGJlIGNsb3NlZCBhdXRvbWF0aWNhbGx5LlxuICAgIHRoaXMub25yZWFkeSA9IG51bGwgLy8gVGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciBoYXMgYmVlbiBlc3RhYmxpc2hlZCBhbmQgZ3JlZXRpbmcgaXMgcmVjZWl2ZWRcbiAgICB0aGlzLm9uaWRsZSA9IG51bGwgLy8gVGhlcmUgYXJlIG5vIG1vcmUgY29tbWFuZHMgdG8gcHJvY2Vzc1xuICB9XG5cbiAgLy8gUFVCTElDIE1FVEhPRFNcblxuICAvKipcbiAgICogSW5pdGlhdGUgYSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuIFdhaXQgZm9yIG9ucmVhZHkgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFNvY2tldFxuICAgKiAgICAgVEVTVElORyBPTkxZISBUaGUgVENQU29ja2V0IGhhcyBhIHByZXR0eSBub25zZW5zaWNhbCBjb252ZW5pZW5jZSBjb25zdHJ1Y3RvcixcbiAgICogICAgIHdoaWNoIG1ha2VzIGl0IGhhcmQgdG8gbW9jay4gRm9yIGRlcGVuZGVuY3ktaW5qZWN0aW9uIHB1cnBvc2VzLCB3ZSB1c2UgdGhlXG4gICAqICAgICBTb2NrZXQgcGFyYW1ldGVyIHRvIHBhc3MgaW4gYSBtb2NrIFNvY2tldCBpbXBsZW1lbnRhdGlvbi4gU2hvdWxkIGJlIGxlZnQgYmxhbmtcbiAgICogICAgIGluIHByb2R1Y3Rpb24gdXNlIVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBzb2NrZXQgaXMgb3BlbmVkXG4gICAqL1xuICBjb25uZWN0IChTb2NrZXQgPSBUQ1BTb2NrZXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zb2NrZXQgPSBTb2NrZXQub3Blbih0aGlzLmhvc3QsIHRoaXMucG9ydCwge1xuICAgICAgICBiaW5hcnlUeXBlOiAnYXJyYXlidWZmZXInLFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IHRoaXMuc2VjdXJlTW9kZSxcbiAgICAgICAgY2E6IHRoaXMub3B0aW9ucy5jYVxuICAgICAgfSlcblxuICAgICAgLy8gYWxsb3dzIGNlcnRpZmljYXRlIGhhbmRsaW5nIGZvciBwbGF0Zm9ybSB3L28gbmF0aXZlIHRscyBzdXBwb3J0XG4gICAgICAvLyBvbmNlcnQgaXMgbm9uIHN0YW5kYXJkIHNvIHNldHRpbmcgaXQgbWlnaHQgdGhyb3cgaWYgdGhlIHNvY2tldCBvYmplY3QgaXMgaW1tdXRhYmxlXG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnNvY2tldC5vbmNlcnQgPSAoY2VydCkgPT4geyB0aGlzLm9uY2VydCAmJiB0aGlzLm9uY2VydChjZXJ0KSB9XG4gICAgICB9IGNhdGNoIChFKSB7IH1cblxuICAgICAgLy8gQ29ubmVjdGlvbiBjbG9zaW5nIHVuZXhwZWN0ZWQgaXMgYW4gZXJyb3JcbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignU29ja2V0IGNsb3NlZCB1bmV4cGVjdGVkbHkhJykpXG4gICAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSAoZXZ0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fb25EYXRhKGV2dClcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5fb25FcnJvcihlcnIpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaWYgYW4gZXJyb3IgaGFwcGVucyBkdXJpbmcgY3JlYXRlIHRpbWUsIHJlamVjdCB0aGUgcHJvbWlzZVxuICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBvcGVuIHNvY2tldDogJyArIGUuZGF0YS5tZXNzYWdlKSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zb2NrZXQub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAvLyB1c2UgcHJvcGVyIFwiaXJyZWNvdmVyYWJsZSBlcnJvciwgdGVhciBkb3duIGV2ZXJ5dGhpbmdcIi1oYW5kbGVyIG9ubHkgYWZ0ZXIgc29ja2V0IGlzIG9wZW5cbiAgICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlKSA9PiB0aGlzLl9vbkVycm9yKGUpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIHNvY2tldCBpcyBjbG9zZWRcbiAgICovXG4gIGNsb3NlIChlcnJvcikge1xuICAgIGlmICh0aGlzLl9lbnRlcmVkQ2xvc2luZ1N0YXRlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICB0aGlzLl9lbnRlcmVkQ2xvc2luZ1N0YXRlID0gdHJ1ZVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB2YXIgdGVhckRvd24gPSAoKSA9PiB7XG4gICAgICAgIC8vIGZ1bGZpbGwgcGVuZGluZyBwcm9taXNlc1xuICAgICAgICB0aGlzLl9jbGllbnRRdWV1ZS5mb3JFYWNoKGNtZCA9PiBjbWQuY2FsbGJhY2soZXJyb3IpKVxuICAgICAgICBpZiAodGhpcy5fY3VycmVudENvbW1hbmQpIHtcbiAgICAgICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5jYWxsYmFjayhlcnJvcilcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NsaWVudFF1ZXVlID0gW11cbiAgICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQgPSBmYWxzZVxuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZXIpXG4gICAgICAgIHRoaXMuX2lkbGVUaW1lciA9IG51bGxcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKVxuICAgICAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBudWxsXG5cbiAgICAgICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgICAgLy8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbm9wZW4gPSBudWxsXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IG51bGxcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSBudWxsXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IG51bGxcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5zb2NrZXQub25jZXJ0ID0gbnVsbFxuICAgICAgICAgIH0gY2F0Y2ggKEUpIHsgfVxuXG4gICAgICAgICAgdGhpcy5zb2NrZXQgPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZGlzYWJsZUNvbXByZXNzaW9uKClcblxuICAgICAgaWYgKCF0aGlzLnNvY2tldCB8fCB0aGlzLnNvY2tldC5yZWFkeVN0YXRlICE9PSAnb3BlbicpIHtcbiAgICAgICAgcmV0dXJuIHRlYXJEb3duKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IHRoaXMuc29ja2V0Lm9uZXJyb3IgPSB0ZWFyRG93biAvLyB3ZSBkb24ndCByZWFsbHkgY2FyZSBhYm91dCB0aGUgZXJyb3IgaGVyZVxuICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBMT0dPVVQgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogVXNlIGlzIGRpc2NvdXJhZ2VkIVxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBjb25uZWN0aW9uIGlzIGNsb3NlZCBieSBzZXJ2ZXIuXG4gICAqL1xuICBsb2dvdXQgKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gdGhpcy5zb2NrZXQub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5jbG9zZSgnQ2xpZW50IGxvZ2dpbmcgb3V0JykudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW5xdWV1ZUNvbW1hbmQoJ0xPR09VVCcpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWF0ZXMgVExTIGhhbmRzaGFrZVxuICAgKi9cbiAgdXBncmFkZSAoKSB7XG4gICAgdGhpcy5zZWN1cmVNb2RlID0gdHJ1ZVxuICAgIHRoaXMuc29ja2V0LnVwZ3JhZGVUb1NlY3VyZSgpXG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVzIGEgY29tbWFuZCB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZW1haWxqcy9lbWFpbGpzLWltYXAtaGFuZGxlciBmb3IgcmVxdWVzdCBzdHJ1Y3R1cmUuXG4gICAqIERvIG5vdCBwcm92aWRlIGEgdGFnIHByb3BlcnR5LCBpdCB3aWxsIGJlIHNldCBieSB0aGUgcXVldWUgbWFuYWdlci5cbiAgICpcbiAgICogVG8gY2F0Y2ggdW50YWdnZWQgcmVzcG9uc2VzIHVzZSBhY2NlcHRVbnRhZ2dlZCBwcm9wZXJ0eS4gRm9yIGV4YW1wbGUsIGlmXG4gICAqIHRoZSB2YWx1ZSBmb3IgaXQgaXMgJ0ZFVENIJyB0aGVuIHRoZSByZXBvbnNlIGluY2x1ZGVzICdwYXlsb2FkLkZFVENIJyBwcm9wZXJ0eVxuICAgKiB0aGF0IGlzIGFuIGFycmF5IGluY2x1ZGluZyBhbGwgbGlzdGVkICogRkVUQ0ggcmVzcG9uc2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdCBTdHJ1Y3R1cmVkIHJlcXVlc3Qgb2JqZWN0XG4gICAqIEBwYXJhbSB7QXJyYXl9IGFjY2VwdFVudGFnZ2VkIGEgbGlzdCBvZiB1bnRhZ2dlZCByZXNwb25zZXMgdGhhdCB3aWxsIGJlIGluY2x1ZGVkIGluICdwYXlsb2FkJyBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIGRhdGEgZm9yIHRoZSBjb21tYW5kIHBheWxvYWRcbiAgICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIHJlc3BvbnNlIHdhcyByZWNlaXZlZFxuICAgKi9cbiAgZW5xdWV1ZUNvbW1hbmQgKHJlcXVlc3QsIGFjY2VwdFVudGFnZ2VkLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmVxdWVzdCA9IHtcbiAgICAgICAgY29tbWFuZDogcmVxdWVzdFxuICAgICAgfVxuICAgIH1cblxuICAgIGFjY2VwdFVudGFnZ2VkID0gW10uY29uY2F0KGFjY2VwdFVudGFnZ2VkIHx8IFtdKS5tYXAoKHVudGFnZ2VkKSA9PiAodW50YWdnZWQgfHwgJycpLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKS50cmltKCkpXG5cbiAgICB2YXIgdGFnID0gJ1cnICsgKCsrdGhpcy5fdGFnQ291bnRlcilcbiAgICByZXF1ZXN0LnRhZyA9IHRhZ1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdmFyIHJlamVjdCA9IGVycm9yID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodGhpcy5jbG9zZShlcnJvcikpXG4gICAgICB9XG5cbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICB0YWc6IHRhZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgcGF5bG9hZDogYWNjZXB0VW50YWdnZWQubGVuZ3RoID8ge30gOiB1bmRlZmluZWQsXG4gICAgICAgIGNhbGxiYWNrOiAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5pc0Vycm9yKHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICB9IGVsc2UgaWYgKFsnTk8nLCAnQkFEJ10uaW5kZXhPZihwcm9wT3IoJycsICdjb21tYW5kJywgcmVzcG9uc2UpLnRvVXBwZXJDYXNlKCkudHJpbSgpKSA+PSAwKSB7XG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IocmVzcG9uc2UuaHVtYW5SZWFkYWJsZSB8fCAnRXJyb3InKVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmNvZGUpIHtcbiAgICAgICAgICAgICAgZXJyb3IuY29kZSA9IHJlc3BvbnNlLmNvZGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhcHBseSBhbnkgYWRkaXRpb25hbCBvcHRpb25zIHRvIHRoZSBjb21tYW5kXG4gICAgICBPYmplY3Qua2V5cyhvcHRpb25zIHx8IHt9KS5mb3JFYWNoKChrZXkpID0+IHsgZGF0YVtrZXldID0gb3B0aW9uc1trZXldIH0pXG5cbiAgICAgIGFjY2VwdFVudGFnZ2VkLmZvckVhY2goKGNvbW1hbmQpID0+IHsgZGF0YS5wYXlsb2FkW2NvbW1hbmRdID0gW10gfSlcblxuICAgICAgLy8gaWYgd2UncmUgaW4gcHJpb3JpdHkgbW9kZSAoaS5lLiB3ZSByYW4gY29tbWFuZHMgaW4gYSBwcmVjaGVjayksXG4gICAgICAvLyBxdWV1ZSBhbnkgY29tbWFuZHMgQkVGT1JFIHRoZSBjb21tYW5kIHRoYXQgY29udGlhbmVkIHRoZSBwcmVjaGVjayxcbiAgICAgIC8vIG90aGVyd2lzZSBqdXN0IHF1ZXVlIGNvbW1hbmQgYXMgdXN1YWxcbiAgICAgIHZhciBpbmRleCA9IGRhdGEuY3R4ID8gdGhpcy5fY2xpZW50UXVldWUuaW5kZXhPZihkYXRhLmN0eCkgOiAtMVxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgZGF0YS50YWcgKz0gJy5wJ1xuICAgICAgICBkYXRhLnJlcXVlc3QudGFnICs9ICcucCdcbiAgICAgICAgdGhpcy5fY2xpZW50UXVldWUuc3BsaWNlKGluZGV4LCAwLCBkYXRhKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY2xpZW50UXVldWUucHVzaChkYXRhKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fY2FuU2VuZCkge1xuICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gY29tbWFuZHNcbiAgICogQHBhcmFtIGN0eFxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldFByZXZpb3VzbHlRdWV1ZWQgKGNvbW1hbmRzLCBjdHgpIHtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gdGhpcy5fY2xpZW50UXVldWUuaW5kZXhPZihjdHgpIC0gMVxuXG4gICAgLy8gc2VhcmNoIGJhY2t3YXJkcyBmb3IgdGhlIGNvbW1hbmRzIGFuZCByZXR1cm4gdGhlIGZpcnN0IGZvdW5kXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoaXNNYXRjaCh0aGlzLl9jbGllbnRRdWV1ZVtpXSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NsaWVudFF1ZXVlW2ldXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWxzbyBjaGVjayBjdXJyZW50IGNvbW1hbmQgaWYgbm8gU0VMRUNUIGlzIHF1ZXVlZFxuICAgIGlmIChpc01hdGNoKHRoaXMuX2N1cnJlbnRDb21tYW5kKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRDb21tYW5kXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgICBmdW5jdGlvbiBpc01hdGNoIChkYXRhKSB7XG4gICAgICByZXR1cm4gZGF0YSAmJiBkYXRhLnJlcXVlc3QgJiYgY29tbWFuZHMuaW5kZXhPZihkYXRhLnJlcXVlc3QuY29tbWFuZCkgPj0gMFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGRhdGEgdG8gdGhlIFRDUCBzb2NrZXRcbiAgICogQXJtcyBhIHRpbWVvdXQgd2FpdGluZyBmb3IgYSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgUGF5bG9hZFxuICAgKi9cbiAgc2VuZCAoc3RyKSB7XG4gICAgY29uc3QgYnVmZmVyID0gdG9UeXBlZEFycmF5KHN0cikuYnVmZmVyXG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMudGltZW91dFNvY2tldExvd2VyQm91bmQgKyBNYXRoLmZsb29yKGJ1ZmZlci5ieXRlTGVuZ3RoICogdGhpcy50aW1lb3V0U29ja2V0TXVsdGlwbGllcilcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIpIC8vIGNsZWFyIHBlbmRpbmcgdGltZW91dHNcbiAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX29uRXJyb3IobmV3IEVycm9yKCcgU29ja2V0IHRpbWVkIG91dCEnKSksIHRpbWVvdXQpIC8vIGFybSB0aGUgbmV4dCB0aW1lb3V0XG5cbiAgICBpZiAodGhpcy5jb21wcmVzc2VkKSB7XG4gICAgICB0aGlzLl9zZW5kQ29tcHJlc3NlZChidWZmZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5zb2NrZXQpIHtcbiAgICAgICAgdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ0Vycm9yIDo6IFVuZXhwZWN0ZWQgc29ja2V0IGNsb3NlJykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcilcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgZ2xvYmFsIGhhbmRsZXIgZm9yIGFuIHVudGFnZ2VkIHJlc3BvbnNlLiBJZiBjdXJyZW50bHkgcHJvY2Vzc2VkIGNvbW1hbmRcbiAgICogaGFzIG5vdCBsaXN0ZWQgdW50YWdnZWQgY29tbWFuZCBpdCBpcyBmb3J3YXJkZWQgdG8gdGhlIGdsb2JhbCBoYW5kbGVyLiBVc2VmdWxcbiAgICogd2l0aCBFWFBVTkdFLCBFWElTVFMgZXRjLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tbWFuZCBVbnRhZ2dlZCBjb21tYW5kIG5hbWVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgZnVuY3Rpb24gd2l0aCByZXNwb25zZSBvYmplY3QgYW5kIGNvbnRpbnVlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqL1xuICBzZXRIYW5kbGVyIChjb21tYW5kLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkW2NvbW1hbmQudG9VcHBlckNhc2UoKS50cmltKCldID0gY2FsbGJhY2tcbiAgfVxuXG4gIC8vIElOVEVSTkFMIEVWRU5UU1xuXG4gIC8qKlxuICAgKiBFcnJvciBoYW5kbGVyIGZvciB0aGUgc29ja2V0XG4gICAqXG4gICAqIEBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgRXZlbnQgb2JqZWN0LiBTZWUgZXZ0LmRhdGEgZm9yIHRoZSBlcnJvclxuICAgKi9cbiAgX29uRXJyb3IgKGV2dCkge1xuICAgIHZhciBlcnJvclxuICAgIGlmICh0aGlzLmlzRXJyb3IoZXZ0KSkge1xuICAgICAgZXJyb3IgPSBldnRcbiAgICB9IGVsc2UgaWYgKGV2dCAmJiB0aGlzLmlzRXJyb3IoZXZ0LmRhdGEpKSB7XG4gICAgICBlcnJvciA9IGV2dC5kYXRhXG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKChldnQgJiYgZXZ0LmRhdGEgJiYgZXZ0LmRhdGEubWVzc2FnZSkgfHwgZXZ0LmRhdGEgfHwgZXZ0IHx8ICdFcnJvcicpXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3IpXG5cbiAgICAvLyBhbHdheXMgY2FsbCBvbmVycm9yIGNhbGxiYWNrLCBubyBtYXR0ZXIgaWYgY2xvc2UoKSBzdWNjZWVkcyBvciBmYWlsc1xuICAgIHRoaXMuY2xvc2UoZXJyb3IpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5vbmVycm9yICYmIHRoaXMub25lcnJvcihlcnJvcilcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycm9yKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3IgaW5jb21pbmcgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuIFRoZSBkYXRhIGlzIHNlbnQgaW4gYXJiaXRyYXJ5XG4gICAqIGNodW5rcyBhbmQgY2FuJ3QgYmUgdXNlZCBkaXJlY3RseSBzbyB0aGlzIGZ1bmN0aW9uIG1ha2VzIHN1cmUgdGhlIGRhdGFcbiAgICogaXMgc3BsaXQgaW50byBjb21wbGV0ZSBsaW5lcyBiZWZvcmUgdGhlIGRhdGEgaXMgcGFzc2VkIHRvIHRoZSBjb21tYW5kXG4gICAqIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAqL1xuICBfb25EYXRhIChldnQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKSAvLyByZXNldCB0aGUgdGltZW91dCBvbiBlYWNoIGRhdGEgcGFja2V0XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMudGltZW91dFNvY2tldExvd2VyQm91bmQgKyBNYXRoLmZsb29yKDQwOTYgKiB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyKSAvLyBtYXggcGFja2V0IHNpemUgaXMgNDA5NiBieXRlc1xuICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJyBTb2NrZXQgdGltZWQgb3V0IScpKSwgdGltZW91dClcblxuICAgIHRoaXMuX2luY29taW5nQnVmZmVycy5wdXNoKG5ldyBVaW50OEFycmF5KGV2dC5kYXRhKSkgLy8gYXBwZW5kIHRvIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgICB0aGlzLl9wYXJzZUluY29taW5nQ29tbWFuZHModGhpcy5faXRlcmF0ZUluY29taW5nQnVmZmVyKCkpIC8vIENvbnN1bWUgdGhlIGluY29taW5nIGJ1ZmZlclxuICB9XG5cbiAgKiBfaXRlcmF0ZUluY29taW5nQnVmZmVyICgpIHtcbiAgICBsZXQgYnVmID0gdGhpcy5faW5jb21pbmdCdWZmZXJzW3RoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggLSAxXSB8fCBbXVxuICAgIGxldCBpID0gMFxuXG4gICAgLy8gbG9vcCBpbnZhcmlhbnQ6XG4gICAgLy8gICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgc3RhcnRzIHdpdGggdGhlIGJlZ2lubmluZyBvZiBpbmNvbWluZyBjb21tYW5kLlxuICAgIC8vICAgYnVmIGlzIHNob3J0aGFuZCBmb3IgbGFzdCBlbGVtZW50IG9mIHRoaXMuX2luY29taW5nQnVmZmVycy5cbiAgICAvLyAgIGJ1ZlswLi5pLTFdIGlzIHBhcnQgb2YgaW5jb21pbmcgY29tbWFuZC5cbiAgICB3aGlsZSAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgIHN3aXRjaCAodGhpcy5fYnVmZmVyU3RhdGUpIHtcbiAgICAgICAgY2FzZSBCVUZGRVJfU1RBVEVfTElURVJBTDpcbiAgICAgICAgICBjb25zdCBkaWZmID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIGksIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcpXG4gICAgICAgICAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyAtPSBkaWZmXG4gICAgICAgICAgaSArPSBkaWZmXG4gICAgICAgICAgaWYgKHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjYXNlIEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8yOlxuICAgICAgICAgIGlmIChpIDwgYnVmLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGJ1ZltpXSA9PT0gQ0FSUklBR0VfUkVUVVJOKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPSBOdW1iZXIoZnJvbVR5cGVkQXJyYXkodGhpcy5fbGVuZ3RoQnVmZmVyKSkgKyAyIC8vIGZvciBDUkxGXG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0xJVEVSQUxcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjYXNlIEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xOlxuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gaVxuICAgICAgICAgIHdoaWxlIChpIDwgYnVmLmxlbmd0aCAmJiBidWZbaV0gPj0gNDggJiYgYnVmW2ldIDw9IDU3KSB7IC8vIGRpZ2l0c1xuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGFydCAhPT0gaSkge1xuICAgICAgICAgICAgY29uc3QgbGF0ZXN0ID0gYnVmLnN1YmFycmF5KHN0YXJ0LCBpKVxuICAgICAgICAgICAgY29uc3QgcHJldkJ1ZiA9IHRoaXMuX2xlbmd0aEJ1ZmZlclxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkocHJldkJ1Zi5sZW5ndGggKyBsYXRlc3QubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyLnNldChwcmV2QnVmKVxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyLnNldChsYXRlc3QsIHByZXZCdWYubGVuZ3RoKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sZW5ndGhCdWZmZXIubGVuZ3RoID4gMCAmJiBidWZbaV0gPT09IFJJR0hUX0NVUkxZX0JSQUNLRVQpIHtcbiAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xlbmd0aEJ1ZmZlclxuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKytcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIGZpbmQgbGl0ZXJhbCBsZW5ndGhcbiAgICAgICAgICBjb25zdCBsZWZ0SWR4ID0gYnVmLmluZGV4T2YoTEVGVF9DVVJMWV9CUkFDS0VULCBpKVxuICAgICAgICAgIGlmIChsZWZ0SWR4ID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlZnRPZkxlZnRDdXJseSA9IG5ldyBVaW50OEFycmF5KGJ1Zi5idWZmZXIsIGksIGxlZnRJZHggLSBpKVxuICAgICAgICAgICAgaWYgKGxlZnRPZkxlZnRDdXJseS5pbmRleE9mKExJTkVfRkVFRCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgIGkgPSBsZWZ0SWR4ICsgMVxuICAgICAgICAgICAgICB0aGlzLl9sZW5ndGhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgwKVxuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZmluZCBlbmQgb2YgY29tbWFuZFxuICAgICAgICAgIGNvbnN0IExGaWR4ID0gYnVmLmluZGV4T2YoTElORV9GRUVELCBpKVxuICAgICAgICAgIGlmIChMRmlkeCA+IC0xKSB7XG4gICAgICAgICAgICBpZiAoTEZpZHggPCBidWYubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnNbdGhpcy5faW5jb21pbmdCdWZmZXJzLmxlbmd0aCAtIDFdID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ1ZmZlciwgMCwgTEZpZHggKyAxKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29tbWFuZExlbmd0aCA9IHRoaXMuX2luY29taW5nQnVmZmVycy5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYgKyBjdXJyLmxlbmd0aCwgMCkgLSAyIC8vIDIgZm9yIENSTEZcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgVWludDhBcnJheShjb21tYW5kTGVuZ3RoKVxuICAgICAgICAgICAgbGV0IGluZGV4ID0gMFxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGxldCB1aW50OEFycmF5ID0gdGhpcy5faW5jb21pbmdCdWZmZXJzLnNoaWZ0KClcblxuICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdMZW5ndGggPSBjb21tYW5kTGVuZ3RoIC0gaW5kZXhcbiAgICAgICAgICAgICAgaWYgKHVpbnQ4QXJyYXkubGVuZ3RoID4gcmVtYWluaW5nTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhjZXNzTGVuZ3RoID0gdWludDhBcnJheS5sZW5ndGggLSByZW1haW5pbmdMZW5ndGhcbiAgICAgICAgICAgICAgICB1aW50OEFycmF5ID0gdWludDhBcnJheS5zdWJhcnJheSgwLCAtZXhjZXNzTGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgPSBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb21tYW5kLnNldCh1aW50OEFycmF5LCBpbmRleClcbiAgICAgICAgICAgICAgaW5kZXggKz0gdWludDhBcnJheS5sZW5ndGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlpZWxkIGNvbW1hbmRcbiAgICAgICAgICAgIGlmIChMRmlkeCA8IGJ1Zi5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGJ1Zi5zdWJhcnJheShMRmlkeCArIDEpKVxuICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMucHVzaChidWYpXG4gICAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBjbGVhciB0aGUgdGltZW91dCB3aGVuIGFuIGVudGlyZSBjb21tYW5kIGhhcyBhcnJpdmVkXG4gICAgICAgICAgICAgIC8vIGFuZCBub3Qgd2FpdGluZyBvbiBtb3JlIGRhdGEgZm9yIG5leHQgY29tbWFuZFxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKVxuICAgICAgICAgICAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBudWxsXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUFJJVkFURSBNRVRIT0RTXG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyBhIGNvbW1hbmQgZnJvbSB0aGUgcXVldWUuIFRoZSBjb21tYW5kIGlzIHBhcnNlZCBhbmQgZmVlZGVkIHRvIGEgaGFuZGxlclxuICAgKi9cbiAgX3BhcnNlSW5jb21pbmdDb21tYW5kcyAoY29tbWFuZHMpIHtcbiAgICBmb3IgKHZhciBjb21tYW5kIG9mIGNvbW1hbmRzKSB7XG4gICAgICB0aGlzLl9jbGVhcklkbGUoKVxuXG4gICAgICAvKlxuICAgICAgICogVGhlIFwiK1wiLXRhZ2dlZCByZXNwb25zZSBpcyBhIHNwZWNpYWwgY2FzZTpcbiAgICAgICAqIEVpdGhlciB0aGUgc2VydmVyIGNhbiBhc2tzIGZvciB0aGUgbmV4dCBjaHVuayBvZiBkYXRhLCBlLmcuIGZvciB0aGUgQVVUSEVOVElDQVRFIGNvbW1hbmQuXG4gICAgICAgKlxuICAgICAgICogT3IgdGhlcmUgd2FzIGFuIGVycm9yIGluIHRoZSBYT0FVVEgyIGF1dGhlbnRpY2F0aW9uLCBmb3Igd2hpY2ggU0FTTCBpbml0aWFsIGNsaWVudCByZXNwb25zZSBleHRlbnNpb25cbiAgICAgICAqIGRpY3RhdGVzIHRoZSBjbGllbnQgc2VuZHMgYW4gZW1wdHkgRU9MIHJlc3BvbnNlIHRvIHRoZSBjaGFsbGVuZ2UgY29udGFpbmluZyB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgICAqXG4gICAgICAgKiBEZXRhaWxzIG9uIFwiK1wiLXRhZ2dlZCByZXNwb25zZTpcbiAgICAgICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi0yLjIuMVxuICAgICAgICovXG4gICAgICAvL1xuICAgICAgaWYgKGNvbW1hbmRbMF0gPT09IEFTQ0lJX1BMVVMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gZmVlZCB0aGUgbmV4dCBjaHVuayBvZiBkYXRhXG4gICAgICAgICAgdmFyIGNodW5rID0gdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5zaGlmdCgpXG4gICAgICAgICAgY2h1bmsgKz0gKCF0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLmxlbmd0aCA/IEVPTCA6ICcnKSAvLyBFT0wgaWYgdGhlcmUncyBub3RoaW5nIG1vcmUgdG8gc2VuZFxuICAgICAgICAgIHRoaXMuc2VuZChjaHVuaylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5lcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSkge1xuICAgICAgICAgIHRoaXMuc2VuZChFT0wpIC8vIFhPQVVUSDIgZW1wdHkgcmVzcG9uc2UsIGVycm9yIHdpbGwgYmUgcmVwb3J0ZWQgd2hlbiBzZXJ2ZXIgY29udGludWVzIHdpdGggTk8gcmVzcG9uc2VcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgcmVzcG9uc2VcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHZhbHVlQXNTdHJpbmcgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0ICYmIHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QudmFsdWVBc1N0cmluZ1xuICAgICAgICByZXNwb25zZSA9IHBhcnNlcihjb21tYW5kLCB7IHZhbHVlQXNTdHJpbmcgfSlcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1M6JywgKCkgPT4gY29tcGlsZXIocmVzcG9uc2UsIGZhbHNlLCB0cnVlKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHBhcnNpbmcgaW1hcCBjb21tYW5kIScsIHJlc3BvbnNlKVxuICAgICAgICByZXR1cm4gdGhpcy5fb25FcnJvcihlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICB0aGlzLl9oYW5kbGVSZXNwb25zZShyZXNwb25zZSlcblxuICAgICAgLy8gZmlyc3QgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLCBjb25uZWN0aW9uIGlzIG5vdyB1c2FibGVcbiAgICAgIGlmICghdGhpcy5fY29ubmVjdGlvblJlYWR5KSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25SZWFkeSA9IHRydWVcbiAgICAgICAgdGhpcy5vbnJlYWR5ICYmIHRoaXMub25yZWFkeSgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZlZWRzIGEgcGFyc2VkIHJlc3BvbnNlIG9iamVjdCB0byBhbiBhcHByb3ByaWF0ZSBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgY29tbWFuZCBvYmplY3RcbiAgICovXG4gIF9oYW5kbGVSZXNwb25zZSAocmVzcG9uc2UpIHtcbiAgICB2YXIgY29tbWFuZCA9IHByb3BPcignJywgJ2NvbW1hbmQnLCByZXNwb25zZSkudG9VcHBlckNhc2UoKS50cmltKClcblxuICAgIGlmICghdGhpcy5fY3VycmVudENvbW1hbmQpIHtcbiAgICAgIC8vIHVuc29saWNpdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgY29tbWFuZCBpbiB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCkge1xuICAgICAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgICAgICAgdGhpcy5fY2FuU2VuZCA9IHRydWVcbiAgICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZCAmJiByZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQpIHtcbiAgICAgIC8vIGV4cGVjdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkW2NvbW1hbmRdLnB1c2gocmVzcG9uc2UpXG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkKSB7XG4gICAgICAvLyB1bmV4cGVjdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnRhZyA9PT0gdGhpcy5fY3VycmVudENvbW1hbmQudGFnKSB7XG4gICAgICAvLyB0YWdnZWQgcmVzcG9uc2VcbiAgICAgIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkICYmIE9iamVjdC5rZXlzKHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQpLmxlbmd0aCkge1xuICAgICAgICByZXNwb25zZS5wYXlsb2FkID0gdGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZFxuICAgICAgfVxuICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQuY2FsbGJhY2socmVzcG9uc2UpXG4gICAgICB0aGlzLl9jYW5TZW5kID0gdHJ1ZVxuICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIGNvbW1hbmQgZnJvbSBjbGllbnQgcXVldWUgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIF9zZW5kUmVxdWVzdCAoKSB7XG4gICAgaWYgKCF0aGlzLl9jbGllbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbnRlcklkbGUoKVxuICAgIH1cbiAgICB0aGlzLl9jbGVhcklkbGUoKVxuXG4gICAgLy8gYW4gb3BlcmF0aW9uIHdhcyBtYWRlIGluIHRoZSBwcmVjaGVjaywgbm8gbmVlZCB0byByZXN0YXJ0IHRoZSBxdWV1ZSBtYW51YWxseVxuICAgIHRoaXMuX3Jlc3RhcnRRdWV1ZSA9IGZhbHNlXG5cbiAgICB2YXIgY29tbWFuZCA9IHRoaXMuX2NsaWVudFF1ZXVlWzBdXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kLnByZWNoZWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyByZW1lbWJlciB0aGUgY29udGV4dFxuICAgICAgdmFyIGNvbnRleHQgPSBjb21tYW5kXG4gICAgICB2YXIgcHJlY2hlY2sgPSBjb250ZXh0LnByZWNoZWNrXG4gICAgICBkZWxldGUgY29udGV4dC5wcmVjaGVja1xuXG4gICAgICAvLyB3ZSBuZWVkIHRvIHJlc3RhcnQgdGhlIHF1ZXVlIGhhbmRsaW5nIGlmIG5vIG9wZXJhdGlvbiB3YXMgbWFkZSBpbiB0aGUgcHJlY2hlY2tcbiAgICAgIHRoaXMuX3Jlc3RhcnRRdWV1ZSA9IHRydWVcblxuICAgICAgLy8gaW52b2tlIHRoZSBwcmVjaGVjayBjb21tYW5kIGFuZCByZXN1bWUgbm9ybWFsIG9wZXJhdGlvbiBhZnRlciB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgcHJlY2hlY2soY29udGV4dCkudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIHdlJ3JlIGRvbmUgd2l0aCB0aGUgcHJlY2hlY2tcbiAgICAgICAgaWYgKHRoaXMuX3Jlc3RhcnRRdWV1ZSkge1xuICAgICAgICAgIC8vIHdlIG5lZWQgdG8gcmVzdGFydCB0aGUgcXVldWUgaGFuZGxpbmdcbiAgICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgLy8gcHJlY2hlY2sgZmFpbGVkLCBzbyB3ZSByZW1vdmUgdGhlIGluaXRpYWwgY29tbWFuZFxuICAgICAgICAvLyBmcm9tIHRoZSBxdWV1ZSwgaW52b2tlIGl0cyBjYWxsYmFjayBhbmQgcmVzdW1lIG5vcm1hbCBvcGVyYXRpb25cbiAgICAgICAgbGV0IGNtZFxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoY29udGV4dClcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBjbWQgPSB0aGlzLl9jbGllbnRRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpWzBdXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNtZCAmJiBjbWQuY2FsbGJhY2spIHtcbiAgICAgICAgICBjbWQuY2FsbGJhY2soZXJyKVxuICAgICAgICAgIHRoaXMuX2NhblNlbmQgPSB0cnVlXG4gICAgICAgICAgdGhpcy5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKHRoaXMuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpKSAvLyBDb25zdW1lIHRoZSByZXN0IG9mIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpIC8vIGNvbnRpbnVlIHNlbmRpbmdcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2NhblNlbmQgPSBmYWxzZVxuICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kID0gdGhpcy5fY2xpZW50UXVldWUuc2hpZnQoKVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEgPSBjb21waWxlcih0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0LCB0cnVlKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0M6JywgKCkgPT4gY29tcGlsZXIodGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdCwgZmFsc2UsIHRydWUpKSAvLyBleGNsdWRlcyBwYXNzd29yZHMgZXRjLlxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBjb21waWxpbmcgaW1hcCBjb21tYW5kIScsIHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QpXG4gICAgICByZXR1cm4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ0Vycm9yIGNvbXBpbGluZyBpbWFwIGNvbW1hbmQhJykpXG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLnNoaWZ0KClcblxuICAgIHRoaXMuc2VuZChkYXRhICsgKCF0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLmxlbmd0aCA/IEVPTCA6ICcnKSlcbiAgICByZXR1cm4gdGhpcy53YWl0RHJhaW5cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBvbmlkbGUsIG5vdGluZyB0byBkbyBjdXJyZW50bHlcbiAgICovXG4gIF9lbnRlcklkbGUgKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZXIpXG4gICAgdGhpcy5faWRsZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiAodGhpcy5vbmlkbGUgJiYgdGhpcy5vbmlkbGUoKSksIHRoaXMudGltZW91dEVudGVySWRsZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgaWRsZSB0aW1lclxuICAgKi9cbiAgX2NsZWFySWRsZSAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lcilcbiAgICB0aGlzLl9pZGxlVGltZXIgPSBudWxsXG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHByb2Nlc3NlcyBhIHJlc3BvbnNlIGludG8gYW4gZWFzaWVyIHRvIGhhbmRsZSBmb3JtYXQuXG4gICAqIEFkZCB1bnRhZ2dlZCBudW1iZXJlZCByZXNwb25zZXMgKGUuZy4gRkVUQ0gpIGludG8gYSBuaWNlbHkgZmVhc2libGUgZm9ybVxuICAgKiBDaGVja3MgaWYgYSByZXNwb25zZSBpbmNsdWRlcyBvcHRpb25hbCByZXNwb25zZSBjb2Rlc1xuICAgKiBhbmQgY29waWVzIHRoZXNlIGludG8gc2VwYXJhdGUgcHJvcGVydGllcy4gRm9yIGV4YW1wbGUgdGhlXG4gICAqIGZvbGxvd2luZyByZXNwb25zZSBpbmNsdWRlcyBhIGNhcGFiaWxpdHkgbGlzdGluZyBhbmQgYSBodW1hblxuICAgKiByZWFkYWJsZSBtZXNzYWdlOlxuICAgKlxuICAgKiAgICAgKiBPSyBbQ0FQQUJJTElUWSBJRCBOQU1FU1BBQ0VdIEFsbCByZWFkeVxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBhZGRzIGEgJ2NhcGFiaWxpdHknIHByb3BlcnR5IHdpdGggYW4gYXJyYXkgdmFsdWUgWydJRCcsICdOQU1FU1BBQ0UnXVxuICAgKiB0byB0aGUgcmVzcG9uc2Ugb2JqZWN0LiBBZGRpdGlvbmFsbHkgJ0FsbCByZWFkeScgaXMgYWRkZWQgYXMgJ2h1bWFuUmVhZGFibGUnIHByb3BlcnR5LlxuICAgKlxuICAgKiBTZWUgcG9zc2libGVtIElNQVAgUmVzcG9uc2UgQ29kZXMgYXQgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU1MzBcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCByZXNwb25zZSBvYmplY3RcbiAgICovXG4gIF9wcm9jZXNzUmVzcG9uc2UgKHJlc3BvbnNlKSB7XG4gICAgY29uc3QgY29tbWFuZCA9IHByb3BPcignJywgJ2NvbW1hbmQnLCByZXNwb25zZSkudG9VcHBlckNhc2UoKS50cmltKClcblxuICAgIC8vIG5vIGF0dHJpYnV0ZXNcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5hdHRyaWJ1dGVzIHx8ICFyZXNwb25zZS5hdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gdW50YWdnZWQgcmVzcG9uc2VzIHcvIHNlcXVlbmNlIG51bWJlcnNcbiAgICBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgL15cXGQrJC8udGVzdChyZXNwb25zZS5jb21tYW5kKSAmJiByZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnR5cGUgPT09ICdBVE9NJykge1xuICAgICAgcmVzcG9uc2UubnIgPSBOdW1iZXIocmVzcG9uc2UuY29tbWFuZClcbiAgICAgIHJlc3BvbnNlLmNvbW1hbmQgPSAocmVzcG9uc2UuYXR0cmlidXRlcy5zaGlmdCgpLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgfVxuXG4gICAgLy8gbm8gb3B0aW9uYWwgcmVzcG9uc2UgY29kZVxuICAgIGlmIChbJ09LJywgJ05PJywgJ0JBRCcsICdCWUUnLCAnUFJFQVVUSCddLmluZGV4T2YoY29tbWFuZCkgPCAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiBsYXN0IGVsZW1lbnQgb2YgdGhlIHJlc3BvbnNlIGlzIFRFWFQgdGhlbiB0aGlzIGlzIGZvciBodW1hbnNcbiAgICBpZiAocmVzcG9uc2UuYXR0cmlidXRlc1tyZXNwb25zZS5hdHRyaWJ1dGVzLmxlbmd0aCAtIDFdLnR5cGUgPT09ICdURVhUJykge1xuICAgICAgcmVzcG9uc2UuaHVtYW5SZWFkYWJsZSA9IHJlc3BvbnNlLmF0dHJpYnV0ZXNbcmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGggLSAxXS52YWx1ZVxuICAgIH1cblxuICAgIC8vIFBhcnNlIGFuZCBmb3JtYXQgQVRPTSB2YWx1ZXNcbiAgICBpZiAocmVzcG9uc2UuYXR0cmlidXRlc1swXS50eXBlID09PSAnQVRPTScgJiYgcmVzcG9uc2UuYXR0cmlidXRlc1swXS5zZWN0aW9uKSB7XG4gICAgICBjb25zdCBvcHRpb24gPSByZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnNlY3Rpb24ubWFwKChrZXkpID0+IHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGtleS5tYXAoKGtleSkgPT4gKGtleS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50cmltKCkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIChrZXkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc3Qga2V5ID0gb3B0aW9uLnNoaWZ0KClcbiAgICAgIHJlc3BvbnNlLmNvZGUgPSBrZXlcblxuICAgICAgaWYgKG9wdGlvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVzcG9uc2Vba2V5LnRvTG93ZXJDYXNlKCldID0gb3B0aW9uWzBdXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIHJlc3BvbnNlW2tleS50b0xvd2VyQ2FzZSgpXSA9IG9wdGlvblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhbiBFcnJvciBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVmFsdWUgdG8gYmUgY2hlY2tlZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufSByZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGlzIGFuIEVycm9yXG4gICAqL1xuICBpc0Vycm9yICh2YWx1ZSkge1xuICAgIHJldHVybiAhIU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkubWF0Y2goL0Vycm9yXFxdJC8pXG4gIH1cblxuICAvLyBDT01QUkVTU0lPTiBSRUxBVEVEIE1FVEhPRFNcblxuICAvKipcbiAgICogU2V0cyB1cCBkZWZsYXRlL2luZmxhdGUgZm9yIHRoZSBJT1xuICAgKi9cbiAgZW5hYmxlQ29tcHJlc3Npb24gKCkge1xuICAgIHRoaXMuX3NvY2tldE9uRGF0YSA9IHRoaXMuc29ja2V0Lm9uZGF0YVxuICAgIHRoaXMuY29tcHJlc3NlZCA9IHRydWVcblxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuV29ya2VyKSB7XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlciA9IG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbQ29tcHJlc3Npb25CbG9iXSkpKVxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBlLmRhdGEubWVzc2FnZVxuICAgICAgICB2YXIgZGF0YSA9IGUuZGF0YS5idWZmZXJcblxuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICAgICAgICBjYXNlIE1FU1NBR0VfSU5GTEFURURfREFUQV9SRUFEWTpcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldE9uRGF0YSh7IGRhdGEgfSlcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICBjYXNlIE1FU1NBR0VfREVGTEFURURfREFUQV9SRUFEWTpcbiAgICAgICAgICAgIHRoaXMud2FpdERyYWluID0gdGhpcy5zb2NrZXQuc2VuZChkYXRhKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5vbmVycm9yID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ0Vycm9yIGhhbmRsaW5nIGNvbXByZXNzaW9uIHdlYiB3b3JrZXI6ICcgKyBlLm1lc3NhZ2UpKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5wb3N0TWVzc2FnZShjcmVhdGVNZXNzYWdlKE1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmZsYXRlZFJlYWR5ID0gKGJ1ZmZlcikgPT4geyB0aGlzLl9zb2NrZXRPbkRhdGEoeyBkYXRhOiBidWZmZXIgfSkgfVxuICAgICAgY29uc3QgZGVmbGF0ZWRSZWFkeSA9IChidWZmZXIpID0+IHsgdGhpcy53YWl0RHJhaW4gPSB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcikgfVxuICAgICAgdGhpcy5fY29tcHJlc3Npb24gPSBuZXcgQ29tcHJlc3Npb24oaW5mbGF0ZWRSZWFkeSwgZGVmbGF0ZWRSZWFkeSlcbiAgICB9XG5cbiAgICAvLyBvdmVycmlkZSBkYXRhIGhhbmRsZXIsIGRlY29tcHJlc3MgaW5jb21pbmcgZGF0YVxuICAgIHRoaXMuc29ja2V0Lm9uZGF0YSA9IChldnQpID0+IHtcbiAgICAgIGlmICghdGhpcy5jb21wcmVzc2VkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fY29tcHJlc3Npb25Xb3JrZXIpIHtcbiAgICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UoY3JlYXRlTWVzc2FnZShNRVNTQUdFX0lORkxBVEUsIGV2dC5kYXRhKSwgW2V2dC5kYXRhXSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbXByZXNzaW9uLmluZmxhdGUoZXZ0LmRhdGEpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVuZG9lcyBhbnkgY2hhbmdlcyByZWxhdGVkIHRvIGNvbXByZXNzaW9uLiBUaGlzIG9ubHkgYmUgY2FsbGVkIHdoZW4gY2xvc2luZyB0aGUgY29ubmVjdGlvblxuICAgKi9cbiAgX2Rpc2FibGVDb21wcmVzc2lvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmNvbXByZXNzZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuY29tcHJlc3NlZCA9IGZhbHNlXG4gICAgdGhpcy5zb2NrZXQub25kYXRhID0gdGhpcy5fc29ja2V0T25EYXRhXG4gICAgdGhpcy5fc29ja2V0T25EYXRhID0gbnVsbFxuXG4gICAgaWYgKHRoaXMuX2NvbXByZXNzaW9uV29ya2VyKSB7XG4gICAgICAvLyB0ZXJtaW5hdGUgdGhlIHdvcmtlclxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIudGVybWluYXRlKClcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPdXRnb2luZyBwYXlsb2FkIG5lZWRzIHRvIGJlIGNvbXByZXNzZWQgYW5kIHNlbnQgdG8gc29ja2V0XG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGJ1ZmZlciBPdXRnb2luZyB1bmNvbXByZXNzZWQgYXJyYXlidWZmZXJcbiAgICovXG4gIF9zZW5kQ29tcHJlc3NlZCAoYnVmZmVyKSB7XG4gICAgLy8gZGVmbGF0ZVxuICAgIGlmICh0aGlzLl9jb21wcmVzc2lvbldvcmtlcikge1xuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UoY3JlYXRlTWVzc2FnZShNRVNTQUdFX0RFRkxBVEUsIGJ1ZmZlciksIFtidWZmZXJdKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbi5kZWZsYXRlKGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgY3JlYXRlTWVzc2FnZSA9IChtZXNzYWdlLCBidWZmZXIpID0+ICh7IG1lc3NhZ2UsIGJ1ZmZlciB9KVxuIl19