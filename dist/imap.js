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
const CompressionBlob = "!function(e){var t={};function a(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,a),i.l=!0,i.exports}a.m=e,a.c=t,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&\"object\"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,\"default\",{enumerable:!0,value:e}),2&t&&\"string\"!=typeof e)for(var i in e)a.d(n,i,function(t){return e[t]}.bind(null,i));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,\"a\",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p=\"\",a(a.s=11)}([function(e,t,a){\"use strict\";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},function(e,t,a){\"use strict\";e.exports={2:\"need dictionary\",1:\"stream end\",0:\"\",\"-1\":\"file error\",\"-2\":\"stream error\",\"-3\":\"data error\",\"-4\":\"insufficient memory\",\"-5\":\"buffer error\",\"-6\":\"incompatible version\"}},function(e,t,a){\"use strict\";var n=\"undefined\"!=typeof Uint8Array&&\"undefined\"!=typeof Uint16Array&&\"undefined\"!=typeof Int32Array;function i(e,t){return Object.prototype.hasOwnProperty.call(e,t)}t.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var a=t.shift();if(a){if(\"object\"!=typeof a)throw new TypeError(a+\"must be non-object\");for(var n in a)i(a,n)&&(e[n]=a[n])}}return e},t.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var r={arraySet:function(e,t,a,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(a,a+n),i);else for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){var t,a,n,i,r,s;for(n=0,t=0,a=e.length;t<a;t++)n+=e[t].length;for(s=new Uint8Array(n),i=0,t=0,a=e.length;t<a;t++)r=e[t],s.set(r,i),i+=r.length;return s}},s={arraySet:function(e,t,a,n,i){for(var r=0;r<n;r++)e[i+r]=t[a+r]},flattenChunks:function(e){return[].concat.apply([],e)}};t.setTyped=function(e){e?(t.Buf8=Uint8Array,t.Buf16=Uint16Array,t.Buf32=Int32Array,t.assign(t,r)):(t.Buf8=Array,t.Buf16=Array,t.Buf32=Array,t.assign(t,s))},t.setTyped(n)},function(e,t,a){\"use strict\";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg=\"\",this.state=null,this.data_type=2,this.adler=0}},function(e,t,a){\"use strict\";var n,i=a(2),r=a(8),s=a(6),l=a(7),o=a(1),h=0,d=1,_=3,f=4,u=5,c=0,b=1,g=-2,m=-3,w=-5,p=-1,v=1,k=2,y=3,x=4,z=0,S=2,E=8,A=9,Z=15,O=8,R=286,B=30,T=19,N=2*R+1,D=15,U=3,I=258,F=I+U+1,L=32,M=42,j=69,C=73,P=91,H=103,K=113,Y=666,G=1,X=2,W=3,q=4,J=3;function Q(e,t){return e.msg=o[t],t}function V(e){return(e<<1)-(e>4?9:0)}function $(e){for(var t=e.length;--t>=0;)e[t]=0}function ee(e){var t=e.state,a=t.pending;a>e.avail_out&&(a=e.avail_out),0!==a&&(i.arraySet(e.output,t.pending_buf,t.pending_out,a,e.next_out),e.next_out+=a,t.pending_out+=a,e.total_out+=a,e.avail_out-=a,t.pending-=a,0===t.pending&&(t.pending_out=0))}function te(e,t){r._tr_flush_block(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,ee(e.strm)}function ae(e,t){e.pending_buf[e.pending++]=t}function ne(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function ie(e,t){var a,n,i=e.max_chain_length,r=e.strstart,s=e.prev_length,l=e.nice_match,o=e.strstart>e.w_size-F?e.strstart-(e.w_size-F):0,h=e.window,d=e.w_mask,_=e.prev,f=e.strstart+I,u=h[r+s-1],c=h[r+s];e.prev_length>=e.good_match&&(i>>=2),l>e.lookahead&&(l=e.lookahead);do{if(h[(a=t)+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do{}while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&r<f);if(n=I-(f-r),r=f-I,n>s){if(e.match_start=t,s=n,n>=l)break;u=h[r+s-1],c=h[r+s]}}}while((t=_[t&d])>o&&0!=--i);return s<=e.lookahead?s:e.lookahead}function re(e){var t,a,n,r,o,h,d,_,f,u,c=e.w_size;do{if(r=e.window_size-e.lookahead-e.strstart,e.strstart>=c+(c-F)){i.arraySet(e.window,e.window,c,c,0),e.match_start-=c,e.strstart-=c,e.block_start-=c,t=a=e.hash_size;do{n=e.head[--t],e.head[t]=n>=c?n-c:0}while(--a);t=a=c;do{n=e.prev[--t],e.prev[t]=n>=c?n-c:0}while(--a);r+=c}if(0===e.strm.avail_in)break;if(h=e.strm,d=e.window,_=e.strstart+e.lookahead,f=r,u=void 0,(u=h.avail_in)>f&&(u=f),a=0===u?0:(h.avail_in-=u,i.arraySet(d,h.input,h.next_in,u,_),1===h.state.wrap?h.adler=s(h.adler,d,u,_):2===h.state.wrap&&(h.adler=l(h.adler,d,u,_)),h.next_in+=u,h.total_in+=u,u),e.lookahead+=a,e.lookahead+e.insert>=U)for(o=e.strstart-e.insert,e.ins_h=e.window[o],e.ins_h=(e.ins_h<<e.hash_shift^e.window[o+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[o+U-1])&e.hash_mask,e.prev[o&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=o,o++,e.insert--,!(e.lookahead+e.insert<U)););}while(e.lookahead<F&&0!==e.strm.avail_in)}function se(e,t){for(var a,n;;){if(e.lookahead<F){if(re(e),e.lookahead<F&&t===h)return G;if(0===e.lookahead)break}if(a=0,e.lookahead>=U&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+U-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==a&&e.strstart-a<=e.w_size-F&&(e.match_length=ie(e,a)),e.match_length>=U)if(n=r._tr_tally(e,e.strstart-e.match_start,e.match_length-U),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=U){e.match_length--;do{e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+U-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart}while(0!=--e.match_length);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=r._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(te(e,!1),0===e.strm.avail_out))return G}return e.insert=e.strstart<U-1?e.strstart:U-1,t===f?(te(e,!0),0===e.strm.avail_out?W:q):e.last_lit&&(te(e,!1),0===e.strm.avail_out)?G:X}function le(e,t){for(var a,n,i;;){if(e.lookahead<F){if(re(e),e.lookahead<F&&t===h)return G;if(0===e.lookahead)break}if(a=0,e.lookahead>=U&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+U-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=U-1,0!==a&&e.prev_length<e.max_lazy_match&&e.strstart-a<=e.w_size-F&&(e.match_length=ie(e,a),e.match_length<=5&&(e.strategy===v||e.match_length===U&&e.strstart-e.match_start>4096)&&(e.match_length=U-1)),e.prev_length>=U&&e.match_length<=e.prev_length){i=e.strstart+e.lookahead-U,n=r._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-U),e.lookahead-=e.prev_length-1,e.prev_length-=2;do{++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+U-1])&e.hash_mask,a=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart)}while(0!=--e.prev_length);if(e.match_available=0,e.match_length=U-1,e.strstart++,n&&(te(e,!1),0===e.strm.avail_out))return G}else if(e.match_available){if((n=r._tr_tally(e,0,e.window[e.strstart-1]))&&te(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return G}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=r._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<U-1?e.strstart:U-1,t===f?(te(e,!0),0===e.strm.avail_out?W:q):e.last_lit&&(te(e,!1),0===e.strm.avail_out)?G:X}function oe(e,t,a,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=a,this.max_chain=n,this.func=i}function he(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=E,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new i.Buf16(2*N),this.dyn_dtree=new i.Buf16(2*(2*B+1)),this.bl_tree=new i.Buf16(2*(2*T+1)),$(this.dyn_ltree),$(this.dyn_dtree),$(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new i.Buf16(D+1),this.heap=new i.Buf16(2*R+1),$(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new i.Buf16(2*R+1),$(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function de(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=S,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?M:K,e.adler=2===t.wrap?0:1,t.last_flush=h,r._tr_init(t),c):Q(e,g)}function _e(e){var t,a=de(e);return a===c&&((t=e.state).window_size=2*t.w_size,$(t.head),t.max_lazy_match=n[t.level].max_lazy,t.good_match=n[t.level].good_length,t.nice_match=n[t.level].nice_length,t.max_chain_length=n[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=U-1,t.match_available=0,t.ins_h=0),a}function fe(e,t,a,n,r,s){if(!e)return g;var l=1;if(t===p&&(t=6),n<0?(l=0,n=-n):n>15&&(l=2,n-=16),r<1||r>A||a!==E||n<8||n>15||t<0||t>9||s<0||s>x)return Q(e,g);8===n&&(n=9);var o=new he;return e.state=o,o.strm=e,o.wrap=l,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=r+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+U-1)/U),o.window=new i.Buf8(2*o.w_size),o.head=new i.Buf16(o.hash_size),o.prev=new i.Buf16(o.w_size),o.lit_bufsize=1<<r+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new i.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=a,_e(e)}n=[new oe(0,0,0,0,function(e,t){var a=65535;for(a>e.pending_buf_size-5&&(a=e.pending_buf_size-5);;){if(e.lookahead<=1){if(re(e),0===e.lookahead&&t===h)return G;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+a;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,te(e,!1),0===e.strm.avail_out))return G;if(e.strstart-e.block_start>=e.w_size-F&&(te(e,!1),0===e.strm.avail_out))return G}return e.insert=0,t===f?(te(e,!0),0===e.strm.avail_out?W:q):(e.strstart>e.block_start&&(te(e,!1),e.strm.avail_out),G)}),new oe(4,4,8,4,se),new oe(4,5,16,8,se),new oe(4,6,32,32,se),new oe(4,4,16,16,le),new oe(8,16,32,32,le),new oe(8,16,128,128,le),new oe(8,32,128,256,le),new oe(32,128,258,1024,le),new oe(32,258,258,4096,le)],t.deflateInit=function(e,t){return fe(e,t,E,Z,O,z)},t.deflateInit2=fe,t.deflateReset=_e,t.deflateResetKeep=de,t.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?g:(e.state.gzhead=t,c):g},t.deflate=function(e,t){var a,i,s,o;if(!e||!e.state||t>u||t<0)return e?Q(e,g):g;if(i=e.state,!e.output||!e.input&&0!==e.avail_in||i.status===Y&&t!==f)return Q(e,0===e.avail_out?w:g);if(i.strm=e,a=i.last_flush,i.last_flush=t,i.status===M)if(2===i.wrap)e.adler=0,ae(i,31),ae(i,139),ae(i,8),i.gzhead?(ae(i,(i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),ae(i,255&i.gzhead.time),ae(i,i.gzhead.time>>8&255),ae(i,i.gzhead.time>>16&255),ae(i,i.gzhead.time>>24&255),ae(i,9===i.level?2:i.strategy>=k||i.level<2?4:0),ae(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(ae(i,255&i.gzhead.extra.length),ae(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(e.adler=l(e.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=j):(ae(i,0),ae(i,0),ae(i,0),ae(i,0),ae(i,0),ae(i,9===i.level?2:i.strategy>=k||i.level<2?4:0),ae(i,J),i.status=K);else{var m=E+(i.w_bits-8<<4)<<8;m|=(i.strategy>=k||i.level<2?0:i.level<6?1:6===i.level?2:3)<<6,0!==i.strstart&&(m|=L),m+=31-m%31,i.status=K,ne(i,m),0!==i.strstart&&(ne(i,e.adler>>>16),ne(i,65535&e.adler)),e.adler=1}if(i.status===j)if(i.gzhead.extra){for(s=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),ee(e),s=i.pending,i.pending!==i.pending_buf_size));)ae(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=C)}else i.status=C;if(i.status===C)if(i.gzhead.name){s=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),ee(e),s=i.pending,i.pending===i.pending_buf_size)){o=1;break}o=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0,ae(i,o)}while(0!==o);i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),0===o&&(i.gzindex=0,i.status=P)}else i.status=P;if(i.status===P)if(i.gzhead.comment){s=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),ee(e),s=i.pending,i.pending===i.pending_buf_size)){o=1;break}o=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0,ae(i,o)}while(0!==o);i.gzhead.hcrc&&i.pending>s&&(e.adler=l(e.adler,i.pending_buf,i.pending-s,s)),0===o&&(i.status=H)}else i.status=H;if(i.status===H&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&ee(e),i.pending+2<=i.pending_buf_size&&(ae(i,255&e.adler),ae(i,e.adler>>8&255),e.adler=0,i.status=K)):i.status=K),0!==i.pending){if(ee(e),0===e.avail_out)return i.last_flush=-1,c}else if(0===e.avail_in&&V(t)<=V(a)&&t!==f)return Q(e,w);if(i.status===Y&&0!==e.avail_in)return Q(e,w);if(0!==e.avail_in||0!==i.lookahead||t!==h&&i.status!==Y){var p=i.strategy===k?function(e,t){for(var a;;){if(0===e.lookahead&&(re(e),0===e.lookahead)){if(t===h)return G;break}if(e.match_length=0,a=r._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,a&&(te(e,!1),0===e.strm.avail_out))return G}return e.insert=0,t===f?(te(e,!0),0===e.strm.avail_out?W:q):e.last_lit&&(te(e,!1),0===e.strm.avail_out)?G:X}(i,t):i.strategy===y?function(e,t){for(var a,n,i,s,l=e.window;;){if(e.lookahead<=I){if(re(e),e.lookahead<=I&&t===h)return G;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=U&&e.strstart>0&&(n=l[i=e.strstart-1])===l[++i]&&n===l[++i]&&n===l[++i]){s=e.strstart+I;do{}while(n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&n===l[++i]&&i<s);e.match_length=I-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=U?(a=r._tr_tally(e,1,e.match_length-U),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(a=r._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),a&&(te(e,!1),0===e.strm.avail_out))return G}return e.insert=0,t===f?(te(e,!0),0===e.strm.avail_out?W:q):e.last_lit&&(te(e,!1),0===e.strm.avail_out)?G:X}(i,t):n[i.level].func(i,t);if(p!==W&&p!==q||(i.status=Y),p===G||p===W)return 0===e.avail_out&&(i.last_flush=-1),c;if(p===X&&(t===d?r._tr_align(i):t!==u&&(r._tr_stored_block(i,0,0,!1),t===_&&($(i.head),0===i.lookahead&&(i.strstart=0,i.block_start=0,i.insert=0))),ee(e),0===e.avail_out))return i.last_flush=-1,c}return t!==f?c:i.wrap<=0?b:(2===i.wrap?(ae(i,255&e.adler),ae(i,e.adler>>8&255),ae(i,e.adler>>16&255),ae(i,e.adler>>24&255),ae(i,255&e.total_in),ae(i,e.total_in>>8&255),ae(i,e.total_in>>16&255),ae(i,e.total_in>>24&255)):(ne(i,e.adler>>>16),ne(i,65535&e.adler)),ee(e),i.wrap>0&&(i.wrap=-i.wrap),0!==i.pending?c:b)},t.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==M&&t!==j&&t!==C&&t!==P&&t!==H&&t!==K&&t!==Y?Q(e,g):(e.state=null,t===K?Q(e,m):c):g},t.deflateSetDictionary=function(e,t){var a,n,r,l,o,h,d,_,f=t.length;if(!e||!e.state)return g;if(2===(l=(a=e.state).wrap)||1===l&&a.status!==M||a.lookahead)return g;for(1===l&&(e.adler=s(e.adler,t,f,0)),a.wrap=0,f>=a.w_size&&(0===l&&($(a.head),a.strstart=0,a.block_start=0,a.insert=0),_=new i.Buf8(a.w_size),i.arraySet(_,t,f-a.w_size,a.w_size,0),t=_,f=a.w_size),o=e.avail_in,h=e.next_in,d=e.input,e.avail_in=f,e.next_in=0,e.input=t,re(a);a.lookahead>=U;){n=a.strstart,r=a.lookahead-(U-1);do{a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+U-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++}while(--r);a.strstart=n,a.lookahead=U-1,re(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=U-1,a.match_available=0,e.next_in=h,e.input=d,e.avail_in=o,a.wrap=l,c},t.deflateInfo=\"pako deflate (from Nodeca project)\"},function(e,t,a){\"use strict\";var n=a(2),i=a(6),r=a(7),s=a(9),l=a(10),o=0,h=1,d=2,_=4,f=5,u=6,c=0,b=1,g=2,m=-2,w=-3,p=-4,v=-5,k=8,y=1,x=2,z=3,S=4,E=5,A=6,Z=7,O=8,R=9,B=10,T=11,N=12,D=13,U=14,I=15,F=16,L=17,M=18,j=19,C=20,P=21,H=22,K=23,Y=24,G=25,X=26,W=27,q=28,J=29,Q=30,V=31,$=32,ee=852,te=592,ae=15;function ne(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function ie(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new n.Buf16(320),this.work=new n.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function re(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg=\"\",t.wrap&&(e.adler=1&t.wrap),t.mode=y,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new n.Buf32(ee),t.distcode=t.distdyn=new n.Buf32(te),t.sane=1,t.back=-1,c):m}function se(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,re(e)):m}function le(e,t){var a,n;return e&&e.state?(n=e.state,t<0?(a=0,t=-t):(a=1+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?m:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=a,n.wbits=t,se(e))):m}function oe(e,t){var a,n;return e?(n=new ie,e.state=n,n.window=null,(a=le(e,t))!==c&&(e.state=null),a):m}var he,de,_e=!0;function fe(e){if(_e){var t;for(he=new n.Buf32(512),de=new n.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(l(h,e.lens,0,288,he,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;l(d,e.lens,0,32,de,0,e.work,{bits:5}),_e=!1}e.lencode=he,e.lenbits=9,e.distcode=de,e.distbits=5}function ue(e,t,a,i){var r,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new n.Buf8(s.wsize)),i>=s.wsize?(n.arraySet(s.window,t,a-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):((r=s.wsize-s.wnext)>i&&(r=i),n.arraySet(s.window,t,a-i,r,s.wnext),(i-=r)?(n.arraySet(s.window,t,a-i,i,0),s.wnext=i,s.whave=s.wsize):(s.wnext+=r,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=r))),0}t.inflateReset=se,t.inflateReset2=le,t.inflateResetKeep=re,t.inflateInit=function(e){return oe(e,ae)},t.inflateInit2=oe,t.inflate=function(e,t){var a,ee,te,ae,ie,re,se,le,oe,he,de,_e,ce,be,ge,me,we,pe,ve,ke,ye,xe,ze,Se,Ee=0,Ae=new n.Buf8(4),Ze=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return m;(a=e.state).mode===N&&(a.mode=D),ie=e.next_out,te=e.output,se=e.avail_out,ae=e.next_in,ee=e.input,re=e.avail_in,le=a.hold,oe=a.bits,he=re,de=se,xe=c;e:for(;;)switch(a.mode){case y:if(0===a.wrap){a.mode=D;break}for(;oe<16;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(2&a.wrap&&35615===le){a.check=0,Ae[0]=255&le,Ae[1]=le>>>8&255,a.check=r(a.check,Ae,2,0),le=0,oe=0,a.mode=x;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&le)<<8)+(le>>8))%31){e.msg=\"incorrect header check\",a.mode=Q;break}if((15&le)!==k){e.msg=\"unknown compression method\",a.mode=Q;break}if(oe-=4,ye=8+(15&(le>>>=4)),0===a.wbits)a.wbits=ye;else if(ye>a.wbits){e.msg=\"invalid window size\",a.mode=Q;break}a.dmax=1<<ye,e.adler=a.check=1,a.mode=512&le?B:N,le=0,oe=0;break;case x:for(;oe<16;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(a.flags=le,(255&a.flags)!==k){e.msg=\"unknown compression method\",a.mode=Q;break}if(57344&a.flags){e.msg=\"unknown header flags set\",a.mode=Q;break}a.head&&(a.head.text=le>>8&1),512&a.flags&&(Ae[0]=255&le,Ae[1]=le>>>8&255,a.check=r(a.check,Ae,2,0)),le=0,oe=0,a.mode=z;case z:for(;oe<32;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}a.head&&(a.head.time=le),512&a.flags&&(Ae[0]=255&le,Ae[1]=le>>>8&255,Ae[2]=le>>>16&255,Ae[3]=le>>>24&255,a.check=r(a.check,Ae,4,0)),le=0,oe=0,a.mode=S;case S:for(;oe<16;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}a.head&&(a.head.xflags=255&le,a.head.os=le>>8),512&a.flags&&(Ae[0]=255&le,Ae[1]=le>>>8&255,a.check=r(a.check,Ae,2,0)),le=0,oe=0,a.mode=E;case E:if(1024&a.flags){for(;oe<16;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}a.length=le,a.head&&(a.head.extra_len=le),512&a.flags&&(Ae[0]=255&le,Ae[1]=le>>>8&255,a.check=r(a.check,Ae,2,0)),le=0,oe=0}else a.head&&(a.head.extra=null);a.mode=A;case A:if(1024&a.flags&&((_e=a.length)>re&&(_e=re),_e&&(a.head&&(ye=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),n.arraySet(a.head.extra,ee,ae,_e,ye)),512&a.flags&&(a.check=r(a.check,ee,_e,ae)),re-=_e,ae+=_e,a.length-=_e),a.length))break e;a.length=0,a.mode=Z;case Z:if(2048&a.flags){if(0===re)break e;_e=0;do{ye=ee[ae+_e++],a.head&&ye&&a.length<65536&&(a.head.name+=String.fromCharCode(ye))}while(ye&&_e<re);if(512&a.flags&&(a.check=r(a.check,ee,_e,ae)),re-=_e,ae+=_e,ye)break e}else a.head&&(a.head.name=null);a.length=0,a.mode=O;case O:if(4096&a.flags){if(0===re)break e;_e=0;do{ye=ee[ae+_e++],a.head&&ye&&a.length<65536&&(a.head.comment+=String.fromCharCode(ye))}while(ye&&_e<re);if(512&a.flags&&(a.check=r(a.check,ee,_e,ae)),re-=_e,ae+=_e,ye)break e}else a.head&&(a.head.comment=null);a.mode=R;case R:if(512&a.flags){for(;oe<16;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(le!==(65535&a.check)){e.msg=\"header crc mismatch\",a.mode=Q;break}le=0,oe=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),e.adler=a.check=0,a.mode=N;break;case B:for(;oe<32;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}e.adler=a.check=ne(le),le=0,oe=0,a.mode=T;case T:if(0===a.havedict)return e.next_out=ie,e.avail_out=se,e.next_in=ae,e.avail_in=re,a.hold=le,a.bits=oe,g;e.adler=a.check=1,a.mode=N;case N:if(t===f||t===u)break e;case D:if(a.last){le>>>=7&oe,oe-=7&oe,a.mode=W;break}for(;oe<3;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}switch(a.last=1&le,oe-=1,3&(le>>>=1)){case 0:a.mode=U;break;case 1:if(fe(a),a.mode=C,t===u){le>>>=2,oe-=2;break e}break;case 2:a.mode=L;break;case 3:e.msg=\"invalid block type\",a.mode=Q}le>>>=2,oe-=2;break;case U:for(le>>>=7&oe,oe-=7&oe;oe<32;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if((65535&le)!=(le>>>16^65535)){e.msg=\"invalid stored block lengths\",a.mode=Q;break}if(a.length=65535&le,le=0,oe=0,a.mode=I,t===u)break e;case I:a.mode=F;case F:if(_e=a.length){if(_e>re&&(_e=re),_e>se&&(_e=se),0===_e)break e;n.arraySet(te,ee,ae,_e,ie),re-=_e,ae+=_e,se-=_e,ie+=_e,a.length-=_e;break}a.mode=N;break;case L:for(;oe<14;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(a.nlen=257+(31&le),le>>>=5,oe-=5,a.ndist=1+(31&le),le>>>=5,oe-=5,a.ncode=4+(15&le),le>>>=4,oe-=4,a.nlen>286||a.ndist>30){e.msg=\"too many length or distance symbols\",a.mode=Q;break}a.have=0,a.mode=M;case M:for(;a.have<a.ncode;){for(;oe<3;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}a.lens[Ze[a.have++]]=7&le,le>>>=3,oe-=3}for(;a.have<19;)a.lens[Ze[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,ze={bits:a.lenbits},xe=l(o,a.lens,0,19,a.lencode,0,a.work,ze),a.lenbits=ze.bits,xe){e.msg=\"invalid code lengths set\",a.mode=Q;break}a.have=0,a.mode=j;case j:for(;a.have<a.nlen+a.ndist;){for(;me=(Ee=a.lencode[le&(1<<a.lenbits)-1])>>>16&255,we=65535&Ee,!((ge=Ee>>>24)<=oe);){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(we<16)le>>>=ge,oe-=ge,a.lens[a.have++]=we;else{if(16===we){for(Se=ge+2;oe<Se;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(le>>>=ge,oe-=ge,0===a.have){e.msg=\"invalid bit length repeat\",a.mode=Q;break}ye=a.lens[a.have-1],_e=3+(3&le),le>>>=2,oe-=2}else if(17===we){for(Se=ge+3;oe<Se;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}oe-=ge,ye=0,_e=3+(7&(le>>>=ge)),le>>>=3,oe-=3}else{for(Se=ge+7;oe<Se;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}oe-=ge,ye=0,_e=11+(127&(le>>>=ge)),le>>>=7,oe-=7}if(a.have+_e>a.nlen+a.ndist){e.msg=\"invalid bit length repeat\",a.mode=Q;break}for(;_e--;)a.lens[a.have++]=ye}}if(a.mode===Q)break;if(0===a.lens[256]){e.msg=\"invalid code -- missing end-of-block\",a.mode=Q;break}if(a.lenbits=9,ze={bits:a.lenbits},xe=l(h,a.lens,0,a.nlen,a.lencode,0,a.work,ze),a.lenbits=ze.bits,xe){e.msg=\"invalid literal/lengths set\",a.mode=Q;break}if(a.distbits=6,a.distcode=a.distdyn,ze={bits:a.distbits},xe=l(d,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,ze),a.distbits=ze.bits,xe){e.msg=\"invalid distances set\",a.mode=Q;break}if(a.mode=C,t===u)break e;case C:a.mode=P;case P:if(re>=6&&se>=258){e.next_out=ie,e.avail_out=se,e.next_in=ae,e.avail_in=re,a.hold=le,a.bits=oe,s(e,de),ie=e.next_out,te=e.output,se=e.avail_out,ae=e.next_in,ee=e.input,re=e.avail_in,le=a.hold,oe=a.bits,a.mode===N&&(a.back=-1);break}for(a.back=0;me=(Ee=a.lencode[le&(1<<a.lenbits)-1])>>>16&255,we=65535&Ee,!((ge=Ee>>>24)<=oe);){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(me&&0==(240&me)){for(pe=ge,ve=me,ke=we;me=(Ee=a.lencode[ke+((le&(1<<pe+ve)-1)>>pe)])>>>16&255,we=65535&Ee,!(pe+(ge=Ee>>>24)<=oe);){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}le>>>=pe,oe-=pe,a.back+=pe}if(le>>>=ge,oe-=ge,a.back+=ge,a.length=we,0===me){a.mode=X;break}if(32&me){a.back=-1,a.mode=N;break}if(64&me){e.msg=\"invalid literal/length code\",a.mode=Q;break}a.extra=15&me,a.mode=H;case H:if(a.extra){for(Se=a.extra;oe<Se;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}a.length+=le&(1<<a.extra)-1,le>>>=a.extra,oe-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=K;case K:for(;me=(Ee=a.distcode[le&(1<<a.distbits)-1])>>>16&255,we=65535&Ee,!((ge=Ee>>>24)<=oe);){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(0==(240&me)){for(pe=ge,ve=me,ke=we;me=(Ee=a.distcode[ke+((le&(1<<pe+ve)-1)>>pe)])>>>16&255,we=65535&Ee,!(pe+(ge=Ee>>>24)<=oe);){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}le>>>=pe,oe-=pe,a.back+=pe}if(le>>>=ge,oe-=ge,a.back+=ge,64&me){e.msg=\"invalid distance code\",a.mode=Q;break}a.offset=we,a.extra=15&me,a.mode=Y;case Y:if(a.extra){for(Se=a.extra;oe<Se;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}a.offset+=le&(1<<a.extra)-1,le>>>=a.extra,oe-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){e.msg=\"invalid distance too far back\",a.mode=Q;break}a.mode=G;case G:if(0===se)break e;if(_e=de-se,a.offset>_e){if((_e=a.offset-_e)>a.whave&&a.sane){e.msg=\"invalid distance too far back\",a.mode=Q;break}_e>a.wnext?(_e-=a.wnext,ce=a.wsize-_e):ce=a.wnext-_e,_e>a.length&&(_e=a.length),be=a.window}else be=te,ce=ie-a.offset,_e=a.length;_e>se&&(_e=se),se-=_e,a.length-=_e;do{te[ie++]=be[ce++]}while(--_e);0===a.length&&(a.mode=P);break;case X:if(0===se)break e;te[ie++]=a.length,se--,a.mode=P;break;case W:if(a.wrap){for(;oe<32;){if(0===re)break e;re--,le|=ee[ae++]<<oe,oe+=8}if(de-=se,e.total_out+=de,a.total+=de,de&&(e.adler=a.check=a.flags?r(a.check,te,de,ie-de):i(a.check,te,de,ie-de)),de=se,(a.flags?le:ne(le))!==a.check){e.msg=\"incorrect data check\",a.mode=Q;break}le=0,oe=0}a.mode=q;case q:if(a.wrap&&a.flags){for(;oe<32;){if(0===re)break e;re--,le+=ee[ae++]<<oe,oe+=8}if(le!==(4294967295&a.total)){e.msg=\"incorrect length check\",a.mode=Q;break}le=0,oe=0}a.mode=J;case J:xe=b;break e;case Q:xe=w;break e;case V:return p;case $:default:return m}return e.next_out=ie,e.avail_out=se,e.next_in=ae,e.avail_in=re,a.hold=le,a.bits=oe,(a.wsize||de!==e.avail_out&&a.mode<Q&&(a.mode<W||t!==_))&&ue(e,e.output,e.next_out,de-e.avail_out)?(a.mode=V,p):(he-=e.avail_in,de-=e.avail_out,e.total_in+=he,e.total_out+=de,a.total+=de,a.wrap&&de&&(e.adler=a.check=a.flags?r(a.check,te,de,e.next_out-de):i(a.check,te,de,e.next_out-de)),e.data_type=a.bits+(a.last?64:0)+(a.mode===N?128:0)+(a.mode===C||a.mode===I?256:0),(0===he&&0===de||t===_)&&xe===c&&(xe=v),xe)},t.inflateEnd=function(e){if(!e||!e.state)return m;var t=e.state;return t.window&&(t.window=null),e.state=null,c},t.inflateGetHeader=function(e,t){var a;return e&&e.state?0==(2&(a=e.state).wrap)?m:(a.head=t,t.done=!1,c):m},t.inflateSetDictionary=function(e,t){var a,n=t.length;return e&&e.state?0!==(a=e.state).wrap&&a.mode!==T?m:a.mode===T&&i(1,t,n,0)!==a.check?w:ue(e,t,n,n)?(a.mode=V,p):(a.havedict=1,c):m},t.inflateInfo=\"pako inflate (from Nodeca project)\"},function(e,t,a){\"use strict\";e.exports=function(e,t,a,n){for(var i=65535&e|0,r=e>>>16&65535|0,s=0;0!==a;){a-=s=a>2e3?2e3:a;do{r=r+(i=i+t[n++]|0)|0}while(--s);i%=65521,r%=65521}return i|r<<16|0}},function(e,t,a){\"use strict\";var n=function(){for(var e,t=[],a=0;a<256;a++){e=a;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[a]=e}return t}();e.exports=function(e,t,a,i){var r=n,s=i+a;e^=-1;for(var l=i;l<s;l++)e=e>>>8^r[255&(e^t[l])];return-1^e}},function(e,t,a){\"use strict\";var n=a(2),i=4,r=0,s=1,l=2;function o(e){for(var t=e.length;--t>=0;)e[t]=0}var h=0,d=1,_=2,f=29,u=256,c=u+1+f,b=30,g=19,m=2*c+1,w=15,p=16,v=7,k=256,y=16,x=17,z=18,S=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],E=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],A=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Z=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],O=new Array(2*(c+2));o(O);var R=new Array(2*b);o(R);var B=new Array(512);o(B);var T=new Array(256);o(T);var N=new Array(f);o(N);var D,U,I,F=new Array(b);function L(e,t,a,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=a,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function M(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function j(e){return e<256?B[e]:B[256+(e>>>7)]}function C(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function P(e,t,a){e.bi_valid>p-a?(e.bi_buf|=t<<e.bi_valid&65535,C(e,e.bi_buf),e.bi_buf=t>>p-e.bi_valid,e.bi_valid+=a-p):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=a)}function H(e,t,a){P(e,a[2*t],a[2*t+1])}function K(e,t){var a=0;do{a|=1&e,e>>>=1,a<<=1}while(--t>0);return a>>>1}function Y(e,t,a){var n,i,r=new Array(w+1),s=0;for(n=1;n<=w;n++)r[n]=s=s+a[n-1]<<1;for(i=0;i<=t;i++){var l=e[2*i+1];0!==l&&(e[2*i]=K(r[l]++,l))}}function G(e){var t;for(t=0;t<c;t++)e.dyn_ltree[2*t]=0;for(t=0;t<b;t++)e.dyn_dtree[2*t]=0;for(t=0;t<g;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*k]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function X(e){e.bi_valid>8?C(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function W(e,t,a,n){var i=2*t,r=2*a;return e[i]<e[r]||e[i]===e[r]&&n[t]<=n[a]}function q(e,t,a){for(var n=e.heap[a],i=a<<1;i<=e.heap_len&&(i<e.heap_len&&W(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!W(t,n,e.heap[i],e.depth));)e.heap[a]=e.heap[i],a=i,i<<=1;e.heap[a]=n}function J(e,t,a){var n,i,r,s,l=0;if(0!==e.last_lit)do{n=e.pending_buf[e.d_buf+2*l]<<8|e.pending_buf[e.d_buf+2*l+1],i=e.pending_buf[e.l_buf+l],l++,0===n?H(e,i,t):(H(e,(r=T[i])+u+1,t),0!==(s=S[r])&&P(e,i-=N[r],s),H(e,r=j(--n),a),0!==(s=E[r])&&P(e,n-=F[r],s))}while(l<e.last_lit);H(e,k,t)}function Q(e,t){var a,n,i,r=t.dyn_tree,s=t.stat_desc.static_tree,l=t.stat_desc.has_stree,o=t.stat_desc.elems,h=-1;for(e.heap_len=0,e.heap_max=m,a=0;a<o;a++)0!==r[2*a]?(e.heap[++e.heap_len]=h=a,e.depth[a]=0):r[2*a+1]=0;for(;e.heap_len<2;)r[2*(i=e.heap[++e.heap_len]=h<2?++h:0)]=1,e.depth[i]=0,e.opt_len--,l&&(e.static_len-=s[2*i+1]);for(t.max_code=h,a=e.heap_len>>1;a>=1;a--)q(e,r,a);i=o;do{a=e.heap[1],e.heap[1]=e.heap[e.heap_len--],q(e,r,1),n=e.heap[1],e.heap[--e.heap_max]=a,e.heap[--e.heap_max]=n,r[2*i]=r[2*a]+r[2*n],e.depth[i]=(e.depth[a]>=e.depth[n]?e.depth[a]:e.depth[n])+1,r[2*a+1]=r[2*n+1]=i,e.heap[1]=i++,q(e,r,1)}while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],function(e,t){var a,n,i,r,s,l,o=t.dyn_tree,h=t.max_code,d=t.stat_desc.static_tree,_=t.stat_desc.has_stree,f=t.stat_desc.extra_bits,u=t.stat_desc.extra_base,c=t.stat_desc.max_length,b=0;for(r=0;r<=w;r++)e.bl_count[r]=0;for(o[2*e.heap[e.heap_max]+1]=0,a=e.heap_max+1;a<m;a++)(r=o[2*o[2*(n=e.heap[a])+1]+1]+1)>c&&(r=c,b++),o[2*n+1]=r,n>h||(e.bl_count[r]++,s=0,n>=u&&(s=f[n-u]),l=o[2*n],e.opt_len+=l*(r+s),_&&(e.static_len+=l*(d[2*n+1]+s)));if(0!==b){do{for(r=c-1;0===e.bl_count[r];)r--;e.bl_count[r]--,e.bl_count[r+1]+=2,e.bl_count[c]--,b-=2}while(b>0);for(r=c;0!==r;r--)for(n=e.bl_count[r];0!==n;)(i=e.heap[--a])>h||(o[2*i+1]!==r&&(e.opt_len+=(r-o[2*i+1])*o[2*i],o[2*i+1]=r),n--)}}(e,t),Y(r,h,e.bl_count)}function V(e,t,a){var n,i,r=-1,s=t[1],l=0,o=7,h=4;for(0===s&&(o=138,h=3),t[2*(a+1)+1]=65535,n=0;n<=a;n++)i=s,s=t[2*(n+1)+1],++l<o&&i===s||(l<h?e.bl_tree[2*i]+=l:0!==i?(i!==r&&e.bl_tree[2*i]++,e.bl_tree[2*y]++):l<=10?e.bl_tree[2*x]++:e.bl_tree[2*z]++,l=0,r=i,0===s?(o=138,h=3):i===s?(o=6,h=3):(o=7,h=4))}function $(e,t,a){var n,i,r=-1,s=t[1],l=0,o=7,h=4;for(0===s&&(o=138,h=3),n=0;n<=a;n++)if(i=s,s=t[2*(n+1)+1],!(++l<o&&i===s)){if(l<h)do{H(e,i,e.bl_tree)}while(0!=--l);else 0!==i?(i!==r&&(H(e,i,e.bl_tree),l--),H(e,y,e.bl_tree),P(e,l-3,2)):l<=10?(H(e,x,e.bl_tree),P(e,l-3,3)):(H(e,z,e.bl_tree),P(e,l-11,7));l=0,r=i,0===s?(o=138,h=3):i===s?(o=6,h=3):(o=7,h=4)}}o(F);var ee=!1;function te(e,t,a,i){P(e,(h<<1)+(i?1:0),3),function(e,t,a,i){X(e),i&&(C(e,a),C(e,~a)),n.arraySet(e.pending_buf,e.window,t,a,e.pending),e.pending+=a}(e,t,a,!0)}t._tr_init=function(e){ee||(function(){var e,t,a,n,i,r=new Array(w+1);for(a=0,n=0;n<f-1;n++)for(N[n]=a,e=0;e<1<<S[n];e++)T[a++]=n;for(T[a-1]=n,i=0,n=0;n<16;n++)for(F[n]=i,e=0;e<1<<E[n];e++)B[i++]=n;for(i>>=7;n<b;n++)for(F[n]=i<<7,e=0;e<1<<E[n]-7;e++)B[256+i++]=n;for(t=0;t<=w;t++)r[t]=0;for(e=0;e<=143;)O[2*e+1]=8,e++,r[8]++;for(;e<=255;)O[2*e+1]=9,e++,r[9]++;for(;e<=279;)O[2*e+1]=7,e++,r[7]++;for(;e<=287;)O[2*e+1]=8,e++,r[8]++;for(Y(O,c+1,r),e=0;e<b;e++)R[2*e+1]=5,R[2*e]=K(e,5);D=new L(O,S,u+1,c,w),U=new L(R,E,0,b,w),I=new L(new Array(0),A,0,g,v)}(),ee=!0),e.l_desc=new M(e.dyn_ltree,D),e.d_desc=new M(e.dyn_dtree,U),e.bl_desc=new M(e.bl_tree,I),e.bi_buf=0,e.bi_valid=0,G(e)},t._tr_stored_block=te,t._tr_flush_block=function(e,t,a,n){var o,h,f=0;e.level>0?(e.strm.data_type===l&&(e.strm.data_type=function(e){var t,a=4093624447;for(t=0;t<=31;t++,a>>>=1)if(1&a&&0!==e.dyn_ltree[2*t])return r;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return s;for(t=32;t<u;t++)if(0!==e.dyn_ltree[2*t])return s;return r}(e)),Q(e,e.l_desc),Q(e,e.d_desc),f=function(e){var t;for(V(e,e.dyn_ltree,e.l_desc.max_code),V(e,e.dyn_dtree,e.d_desc.max_code),Q(e,e.bl_desc),t=g-1;t>=3&&0===e.bl_tree[2*Z[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),o=e.opt_len+3+7>>>3,(h=e.static_len+3+7>>>3)<=o&&(o=h)):o=h=a+5,a+4<=o&&-1!==t?te(e,t,a,n):e.strategy===i||h===o?(P(e,(d<<1)+(n?1:0),3),J(e,O,R)):(P(e,(_<<1)+(n?1:0),3),function(e,t,a,n){var i;for(P(e,t-257,5),P(e,a-1,5),P(e,n-4,4),i=0;i<n;i++)P(e,e.bl_tree[2*Z[i]+1],3);$(e,e.dyn_ltree,t-1),$(e,e.dyn_dtree,a-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,f+1),J(e,e.dyn_ltree,e.dyn_dtree)),G(e),n&&X(e)},t._tr_tally=function(e,t,a){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&a,e.last_lit++,0===t?e.dyn_ltree[2*a]++:(e.matches++,t--,e.dyn_ltree[2*(T[a]+u+1)]++,e.dyn_dtree[2*j(t)]++),e.last_lit===e.lit_bufsize-1},t._tr_align=function(e){P(e,d<<1,3),H(e,k,O),function(e){16===e.bi_valid?(C(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},function(e,t,a){\"use strict\";e.exports=function(e,t){var a,n,i,r,s,l,o,h,d,_,f,u,c,b,g,m,w,p,v,k,y,x,z,S,E;a=e.state,n=e.next_in,S=e.input,i=n+(e.avail_in-5),r=e.next_out,E=e.output,s=r-(t-e.avail_out),l=r+(e.avail_out-257),o=a.dmax,h=a.wsize,d=a.whave,_=a.wnext,f=a.window,u=a.hold,c=a.bits,b=a.lencode,g=a.distcode,m=(1<<a.lenbits)-1,w=(1<<a.distbits)-1;e:do{c<15&&(u+=S[n++]<<c,c+=8,u+=S[n++]<<c,c+=8),p=b[u&m];t:for(;;){if(u>>>=v=p>>>24,c-=v,0===(v=p>>>16&255))E[r++]=65535&p;else{if(!(16&v)){if(0==(64&v)){p=b[(65535&p)+(u&(1<<v)-1)];continue t}if(32&v){a.mode=12;break e}e.msg=\"invalid literal/length code\",a.mode=30;break e}k=65535&p,(v&=15)&&(c<v&&(u+=S[n++]<<c,c+=8),k+=u&(1<<v)-1,u>>>=v,c-=v),c<15&&(u+=S[n++]<<c,c+=8,u+=S[n++]<<c,c+=8),p=g[u&w];a:for(;;){if(u>>>=v=p>>>24,c-=v,!(16&(v=p>>>16&255))){if(0==(64&v)){p=g[(65535&p)+(u&(1<<v)-1)];continue a}e.msg=\"invalid distance code\",a.mode=30;break e}if(y=65535&p,c<(v&=15)&&(u+=S[n++]<<c,(c+=8)<v&&(u+=S[n++]<<c,c+=8)),(y+=u&(1<<v)-1)>o){e.msg=\"invalid distance too far back\",a.mode=30;break e}if(u>>>=v,c-=v,y>(v=r-s)){if((v=y-v)>d&&a.sane){e.msg=\"invalid distance too far back\",a.mode=30;break e}if(x=0,z=f,0===_){if(x+=h-v,v<k){k-=v;do{E[r++]=f[x++]}while(--v);x=r-y,z=E}}else if(_<v){if(x+=h+_-v,(v-=_)<k){k-=v;do{E[r++]=f[x++]}while(--v);if(x=0,_<k){k-=v=_;do{E[r++]=f[x++]}while(--v);x=r-y,z=E}}}else if(x+=_-v,v<k){k-=v;do{E[r++]=f[x++]}while(--v);x=r-y,z=E}for(;k>2;)E[r++]=z[x++],E[r++]=z[x++],E[r++]=z[x++],k-=3;k&&(E[r++]=z[x++],k>1&&(E[r++]=z[x++]))}else{x=r-y;do{E[r++]=E[x++],E[r++]=E[x++],E[r++]=E[x++],k-=3}while(k>2);k&&(E[r++]=E[x++],k>1&&(E[r++]=E[x++]))}break}}break}}while(n<i&&r<l);n-=k=c>>3,u&=(1<<(c-=k<<3))-1,e.next_in=n,e.next_out=r,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=r<l?l-r+257:257-(r-l),a.hold=u,a.bits=c}},function(e,t,a){\"use strict\";var n=a(2),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],r=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],l=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(e,t,a,o,h,d,_,f){var u,c,b,g,m,w,p,v,k,y=f.bits,x=0,z=0,S=0,E=0,A=0,Z=0,O=0,R=0,B=0,T=0,N=null,D=0,U=new n.Buf16(16),I=new n.Buf16(16),F=null,L=0;for(x=0;x<=15;x++)U[x]=0;for(z=0;z<o;z++)U[t[a+z]]++;for(A=y,E=15;E>=1&&0===U[E];E--);if(A>E&&(A=E),0===E)return h[d++]=20971520,h[d++]=20971520,f.bits=1,0;for(S=1;S<E&&0===U[S];S++);for(A<S&&(A=S),R=1,x=1;x<=15;x++)if(R<<=1,(R-=U[x])<0)return-1;if(R>0&&(0===e||1!==E))return-1;for(I[1]=0,x=1;x<15;x++)I[x+1]=I[x]+U[x];for(z=0;z<o;z++)0!==t[a+z]&&(_[I[t[a+z]]++]=z);if(0===e?(N=F=_,w=19):1===e?(N=i,D-=257,F=r,L-=257,w=256):(N=s,F=l,w=-1),T=0,z=0,x=S,m=d,Z=A,O=0,b=-1,g=(B=1<<A)-1,1===e&&B>852||2===e&&B>592)return 1;for(;;){p=x-O,_[z]<w?(v=0,k=_[z]):_[z]>w?(v=F[L+_[z]],k=N[D+_[z]]):(v=96,k=0),u=1<<x-O,S=c=1<<Z;do{h[m+(T>>O)+(c-=u)]=p<<24|v<<16|k|0}while(0!==c);for(u=1<<x-1;T&u;)u>>=1;if(0!==u?(T&=u-1,T+=u):T=0,z++,0==--U[x]){if(x===E)break;x=t[a+_[z]]}if(x>A&&(T&g)!==b){for(0===O&&(O=A),m+=S,R=1<<(Z=x-O);Z+O<E&&!((R-=U[Z+O])<=0);)Z++,R<<=1;if(B+=1<<Z,1===e&&B>852||2===e&&B>592)return 1;h[b=T&g]=A<<24|Z<<16|m-d|0}}return 0!==T&&(h[m+T]=x-O<<24|64<<16|0),f.bits=A,0}},function(e,t,a){\"use strict\";a.r(t);var n=a(3),i=a.n(n),r=a(4),s=a(5),l=a(1),o=a.n(l),h=a(0),d=16384,_=15;function f(e,t){var a=this;this.inflatedReady=e,this.deflatedReady=t,this._inflate=function(e){var t=new i.a,a=Object(s.inflateInit2)(t,_);if(a!==h.Z_OK)throw new Error(\"Problem initializing inflate stream: \"+o.a[a]);return function(a){if(void 0===a)return e();var n,i,r;t.input=a,t.next_in=0,t.avail_in=t.input.length;var l=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(d),n=t.next_out=0,t.avail_out=d),(i=Object(s.inflate)(t,h.Z_NO_FLUSH))!==h.Z_STREAM_END&&i!==h.Z_OK)throw new Error(\"inflate problem: \"+o.a[i]);t.next_out&&(0!==t.avail_out&&i!==h.Z_STREAM_END||(r=t.output.subarray(n,n=t.next_out),l=e(r)))}while(t.avail_in>0&&i!==h.Z_STREAM_END);return t.next_out>n&&(r=t.output.subarray(n,n=t.next_out),l=e(r)),l}}(function(e){return a.inflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))}),this._deflate=function(e){var t=new i.a,a=Object(r.deflateInit2)(t,h.Z_DEFAULT_COMPRESSION,h.Z_DEFLATED,_,8,h.Z_DEFAULT_STRATEGY);if(a!==h.Z_OK)throw new Error(\"Problem initializing deflate stream: \"+o.a[a]);return function(a){if(void 0===a)return e();var n,i,s;t.input=a,t.next_in=0,t.avail_in=t.input.length;var l=!0;do{if(0===t.avail_out&&(t.output=new Uint8Array(d),s=t.next_out=0,t.avail_out=d),(n=Object(r.deflate)(t,h.Z_SYNC_FLUSH))!==h.Z_STREAM_END&&n!==h.Z_OK)throw new Error(\"Deflate problem: \"+o.a[n]);0===t.avail_out&&t.next_out>s&&(i=t.output.subarray(s,s=t.next_out),l=e(i))}while((t.avail_in>0||0===t.avail_out)&&n!==h.Z_STREAM_END);return t.next_out>s&&(i=t.output.subarray(s,s=t.next_out),l=e(i)),l}}(function(e){return a.deflatedReady(e.buffer.slice(e.byteOffset,e.byteOffset+e.length))})}f.prototype.inflate=function(e){this._inflate(new Uint8Array(e))},f.prototype.deflate=function(e){this._deflate(new Uint8Array(e))};var u=function(e,t){return{message:e,buffer:t}},c=new f(function(e){return self.postMessage(u(\"inflated_ready\",e),[e])},function(e){return self.postMessage(u(\"deflated_ready\",e),[e])});self.onmessage=function(e){var t=e.data.message,a=e.data.buffer;switch(t){case\"start\":break;case\"inflate\":c.inflate(a);break;case\"deflate\":c.deflate(a)}}}]);"; //
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbWFwLmpzIl0sIm5hbWVzIjpbIk1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIiLCJNRVNTQUdFX0lORkxBVEUiLCJNRVNTQUdFX0lORkxBVEVEX0RBVEFfUkVBRFkiLCJNRVNTQUdFX0RFRkxBVEUiLCJNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkiLCJFT0wiLCJMSU5FX0ZFRUQiLCJDQVJSSUFHRV9SRVRVUk4iLCJMRUZUX0NVUkxZX0JSQUNLRVQiLCJSSUdIVF9DVVJMWV9CUkFDS0VUIiwiQVNDSUlfUExVUyIsIkJVRkZFUl9TVEFURV9MSVRFUkFMIiwiQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzEiLCJCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMiIsIkJVRkZFUl9TVEFURV9ERUZBVUxUIiwiVElNRU9VVF9FTlRFUl9JRExFIiwiVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkQiLCJUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSIiwiSW1hcCIsImNvbnN0cnVjdG9yIiwiaG9zdCIsInBvcnQiLCJvcHRpb25zIiwidGltZW91dEVudGVySWRsZSIsInRpbWVvdXRTb2NrZXRMb3dlckJvdW5kIiwidGltZW91dFNvY2tldE11bHRpcGxpZXIiLCJ1c2VTZWN1cmVUcmFuc3BvcnQiLCJzZWN1cmVNb2RlIiwiX2Nvbm5lY3Rpb25SZWFkeSIsIl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCIsIl9jbGllbnRRdWV1ZSIsIl9jYW5TZW5kIiwiX3RhZ0NvdW50ZXIiLCJfY3VycmVudENvbW1hbmQiLCJfaWRsZVRpbWVyIiwiX3NvY2tldFRpbWVvdXRUaW1lciIsImNvbXByZXNzZWQiLCJfaW5jb21pbmdCdWZmZXJzIiwiX2J1ZmZlclN0YXRlIiwiX2xpdGVyYWxSZW1haW5pbmciLCJvbmNlcnQiLCJvbmVycm9yIiwib25yZWFkeSIsIm9uaWRsZSIsImNvbm5lY3QiLCJTb2NrZXQiLCJUQ1BTb2NrZXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNvY2tldCIsIm9wZW4iLCJiaW5hcnlUeXBlIiwiY2EiLCJjZXJ0IiwiRSIsIm9uY2xvc2UiLCJfb25FcnJvciIsIkVycm9yIiwib25kYXRhIiwiZXZ0IiwiX29uRGF0YSIsImVyciIsImUiLCJkYXRhIiwibWVzc2FnZSIsIm9ub3BlbiIsImNsb3NlIiwiZXJyb3IiLCJ0ZWFyRG93biIsImZvckVhY2giLCJjbWQiLCJjYWxsYmFjayIsImNsZWFyVGltZW91dCIsIl9kaXNhYmxlQ29tcHJlc3Npb24iLCJyZWFkeVN0YXRlIiwibG9nb3V0IiwidGhlbiIsImNhdGNoIiwiZW5xdWV1ZUNvbW1hbmQiLCJ1cGdyYWRlIiwidXBncmFkZVRvU2VjdXJlIiwicmVxdWVzdCIsImFjY2VwdFVudGFnZ2VkIiwiY29tbWFuZCIsImNvbmNhdCIsIm1hcCIsInVudGFnZ2VkIiwidG9TdHJpbmciLCJ0b1VwcGVyQ2FzZSIsInRyaW0iLCJ0YWciLCJwYXlsb2FkIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwicmVzcG9uc2UiLCJpc0Vycm9yIiwiaW5kZXhPZiIsImh1bWFuUmVhZGFibGUiLCJjb2RlIiwiT2JqZWN0Iiwia2V5cyIsImtleSIsImluZGV4IiwiY3R4Iiwic3BsaWNlIiwicHVzaCIsIl9zZW5kUmVxdWVzdCIsImdldFByZXZpb3VzbHlRdWV1ZWQiLCJjb21tYW5kcyIsInN0YXJ0SW5kZXgiLCJpIiwiaXNNYXRjaCIsInNlbmQiLCJzdHIiLCJidWZmZXIiLCJ0aW1lb3V0IiwiTWF0aCIsImZsb29yIiwiYnl0ZUxlbmd0aCIsInNldFRpbWVvdXQiLCJfc2VuZENvbXByZXNzZWQiLCJzZXRIYW5kbGVyIiwibG9nZ2VyIiwiVWludDhBcnJheSIsIl9wYXJzZUluY29taW5nQ29tbWFuZHMiLCJfaXRlcmF0ZUluY29taW5nQnVmZmVyIiwiYnVmIiwiZGlmZiIsIm1pbiIsIk51bWJlciIsIl9sZW5ndGhCdWZmZXIiLCJzdGFydCIsImxhdGVzdCIsInN1YmFycmF5IiwicHJldkJ1ZiIsInNldCIsImxlZnRJZHgiLCJsZWZ0T2ZMZWZ0Q3VybHkiLCJMRmlkeCIsImNvbW1hbmRMZW5ndGgiLCJyZWR1Y2UiLCJwcmV2IiwiY3VyciIsInVpbnQ4QXJyYXkiLCJzaGlmdCIsInJlbWFpbmluZ0xlbmd0aCIsImV4Y2Vzc0xlbmd0aCIsIl9jbGVhcklkbGUiLCJjaHVuayIsImVycm9yUmVzcG9uc2VFeHBlY3RzRW1wdHlMaW5lIiwidmFsdWVBc1N0cmluZyIsImRlYnVnIiwiX3Byb2Nlc3NSZXNwb25zZSIsIl9oYW5kbGVSZXNwb25zZSIsIl9lbnRlcklkbGUiLCJfcmVzdGFydFF1ZXVlIiwicHJlY2hlY2siLCJjb250ZXh0Iiwid2FpdERyYWluIiwiYXR0cmlidXRlcyIsInRlc3QiLCJ0eXBlIiwibnIiLCJ2YWx1ZSIsInNlY3Rpb24iLCJvcHRpb24iLCJBcnJheSIsImlzQXJyYXkiLCJ0b0xvd2VyQ2FzZSIsInByb3RvdHlwZSIsImNhbGwiLCJtYXRjaCIsImVuYWJsZUNvbXByZXNzaW9uIiwiX3NvY2tldE9uRGF0YSIsIndpbmRvdyIsIldvcmtlciIsIl9jb21wcmVzc2lvbldvcmtlciIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsIkJsb2IiLCJDb21wcmVzc2lvbkJsb2IiLCJvbm1lc3NhZ2UiLCJwb3N0TWVzc2FnZSIsImNyZWF0ZU1lc3NhZ2UiLCJpbmZsYXRlZFJlYWR5IiwiZGVmbGF0ZWRSZWFkeSIsIl9jb21wcmVzc2lvbiIsIkNvbXByZXNzaW9uIiwiaW5mbGF0ZSIsInRlcm1pbmF0ZSIsImRlZmxhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7cyt4Q0FHQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUEseUJBQXlCLEdBQUcsT0FBbEM7QUFDQSxNQUFNQyxlQUFlLEdBQUcsU0FBeEI7QUFDQSxNQUFNQywyQkFBMkIsR0FBRyxnQkFBcEM7QUFDQSxNQUFNQyxlQUFlLEdBQUcsU0FBeEI7QUFDQSxNQUFNQywyQkFBMkIsR0FBRyxn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eEIsQ0FBb0NDLGFBQWEsQ0FBQ3ZMLGVBQUQsRUFBa0IyRCxHQUFHLENBQUNJLElBQXRCLENBQWpELEVBQThFLENBQUNKLEdBQUcsQ0FBQ0ksSUFBTCxDQUE5RTtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUsySCxZQUFMLENBQWtCRSxPQUFsQixDQUEwQmpJLEdBQUcsQ0FBQ0ksSUFBOUI7QUFDRDtBQUNGLEtBVkQ7QUFXRDtBQUVEOzs7OztBQUdBVSxFQUFBQSxtQkFBbUIsR0FBSTtBQUNyQixRQUFJLENBQUMsS0FBS3RDLFVBQVYsRUFBc0I7QUFDcEI7QUFDRDs7QUFFRCxTQUFLQSxVQUFMLEdBQWtCLEtBQWxCO0FBQ0EsU0FBS2MsTUFBTCxDQUFZUyxNQUFaLEdBQXFCLEtBQUttSCxhQUExQjtBQUNBLFNBQUtBLGFBQUwsR0FBcUIsSUFBckI7O0FBRUEsUUFBSSxLQUFLRyxrQkFBVCxFQUE2QjtBQUMzQjtBQUNBLFdBQUtBLGtCQUFMLENBQXdCYSxTQUF4Qjs7QUFDQSxXQUFLYixrQkFBTCxHQUEwQixJQUExQjtBQUNEO0FBQ0Y7QUFFRDs7Ozs7OztBQUtBeEQsRUFBQUEsZUFBZSxDQUFFTixNQUFGLEVBQVU7QUFDdkI7QUFDQSxRQUFJLEtBQUs4RCxrQkFBVCxFQUE2QjtBQUMzQixXQUFLQSxrQkFBTCxDQUF3Qk0sV0FBeEIsQ0FBb0NDLGFBQWEsQ0FBQ3JMLGVBQUQsRUFBa0JnSCxNQUFsQixDQUFqRCxFQUE0RSxDQUFDQSxNQUFELENBQTVFO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsV0FBS3dFLFlBQUwsQ0FBa0JJLE9BQWxCLENBQTBCNUUsTUFBMUI7QUFDRDtBQUNGOztBQTF3QnVCOzs7O0FBNndCMUIsTUFBTXFFLGFBQWEsR0FBRyxDQUFDdkgsT0FBRCxFQUFVa0QsTUFBVixNQUFzQjtBQUFFbEQsRUFBQUEsT0FBRjtBQUFXa0QsRUFBQUE7QUFBWCxDQUF0QixDQUF0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByb3BPciB9IGZyb20gJ3JhbWRhJ1xuaW1wb3J0IFRDUFNvY2tldCBmcm9tICdlbWFpbGpzLXRjcC1zb2NrZXQnXG5pbXBvcnQgeyB0b1R5cGVkQXJyYXksIGZyb21UeXBlZEFycmF5IH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgeyBwYXJzZXIsIGNvbXBpbGVyIH0gZnJvbSAnZW1haWxqcy1pbWFwLWhhbmRsZXInXG5pbXBvcnQgQ29tcHJlc3Npb24gZnJvbSAnLi9jb21wcmVzc2lvbidcbmltcG9ydCBDb21wcmVzc2lvbkJsb2IgZnJvbSAnLi4vcmVzL2NvbXByZXNzaW9uLndvcmtlci5ibG9iJ1xuXG4vL1xuLy8gY29uc3RhbnRzIHVzZWQgZm9yIGNvbW11bmljYXRpb24gd2l0aCB0aGUgd29ya2VyXG4vL1xuY29uc3QgTUVTU0FHRV9JTklUSUFMSVpFX1dPUktFUiA9ICdzdGFydCdcbmNvbnN0IE1FU1NBR0VfSU5GTEFURSA9ICdpbmZsYXRlJ1xuY29uc3QgTUVTU0FHRV9JTkZMQVRFRF9EQVRBX1JFQURZID0gJ2luZmxhdGVkX3JlYWR5J1xuY29uc3QgTUVTU0FHRV9ERUZMQVRFID0gJ2RlZmxhdGUnXG5jb25zdCBNRVNTQUdFX0RFRkxBVEVEX0RBVEFfUkVBRFkgPSAnZGVmbGF0ZWRfcmVhZHknXG5cbmNvbnN0IEVPTCA9ICdcXHJcXG4nXG5jb25zdCBMSU5FX0ZFRUQgPSAxMFxuY29uc3QgQ0FSUklBR0VfUkVUVVJOID0gMTNcbmNvbnN0IExFRlRfQ1VSTFlfQlJBQ0tFVCA9IDEyM1xuY29uc3QgUklHSFRfQ1VSTFlfQlJBQ0tFVCA9IDEyNVxuXG5jb25zdCBBU0NJSV9QTFVTID0gNDNcblxuLy8gU3RhdGUgdHJhY2tpbmcgd2hlbiBjb25zdHJ1Y3RpbmcgYW4gSU1BUCBjb21tYW5kIGZyb20gYnVmZmVycy5cbmNvbnN0IEJVRkZFUl9TVEFURV9MSVRFUkFMID0gJ2xpdGVyYWwnXG5jb25zdCBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMSA9ICdsaXRlcmFsX2xlbmd0aF8xJ1xuY29uc3QgQlVGRkVSX1NUQVRFX1BPU1NJQkxZX0xJVEVSQUxfTEVOR1RIXzIgPSAnbGl0ZXJhbF9sZW5ndGhfMidcbmNvbnN0IEJVRkZFUl9TVEFURV9ERUZBVUxUID0gJ2RlZmF1bHQnXG5cbi8qKlxuICogSG93IG11Y2ggdGltZSB0byB3YWl0IHNpbmNlIHRoZSBsYXN0IHJlc3BvbnNlIHVudGlsIHRoZSBjb25uZWN0aW9uIGlzIGNvbnNpZGVyZWQgaWRsaW5nXG4gKi9cbmNvbnN0IFRJTUVPVVRfRU5URVJfSURMRSA9IDEwMDBcblxuLyoqXG4gKiBMb3dlciBCb3VuZCBmb3Igc29ja2V0IHRpbWVvdXQgdG8gd2FpdCBzaW5jZSB0aGUgbGFzdCBkYXRhIHdhcyB3cml0dGVuIHRvIGEgc29ja2V0XG4gKi9cbmNvbnN0IFRJTUVPVVRfU09DS0VUX0xPV0VSX0JPVU5EID0gMTAwMDBcblxuLyoqXG4gKiBNdWx0aXBsaWVyIGZvciBzb2NrZXQgdGltZW91dDpcbiAqXG4gKiBXZSBhc3N1bWUgYXQgbGVhc3QgYSBHUFJTIGNvbm5lY3Rpb24gd2l0aCAxMTUga2IvcyA9IDE0LDM3NSBrQi9zIHRvcHMsIHNvIDEwIEtCL3MgdG8gYmUgb25cbiAqIHRoZSBzYWZlIHNpZGUuIFdlIGNhbiB0aW1lb3V0IGFmdGVyIGEgbG93ZXIgYm91bmQgb2YgMTBzICsgKG4gS0IgLyAxMCBLQi9zKS4gQSAxIE1CIG1lc3NhZ2VcbiAqIHVwbG9hZCB3b3VsZCBiZSAxMTAgc2Vjb25kcyB0byB3YWl0IGZvciB0aGUgdGltZW91dC4gMTAgS0IvcyA9PT0gMC4xIHMvQlxuICovXG5jb25zdCBUSU1FT1VUX1NPQ0tFVF9NVUxUSVBMSUVSID0gMC4xXG5cbi8qKlxuICogQ3JlYXRlcyBhIGNvbm5lY3Rpb24gb2JqZWN0IHRvIGFuIElNQVAgc2VydmVyLiBDYWxsIGBjb25uZWN0YCBtZXRob2QgdG8gaW5pdGl0YXRlXG4gKiB0aGUgYWN0dWFsIGNvbm5lY3Rpb24sIHRoZSBjb25zdHJ1Y3RvciBvbmx5IGRlZmluZXMgdGhlIHByb3BlcnRpZXMgYnV0IGRvZXMgbm90IGFjdHVhbGx5IGNvbm5lY3QuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtob3N0PSdsb2NhbGhvc3QnXSBIb3N0bmFtZSB0byBjb25lbmN0IHRvXG4gKiBAcGFyYW0ge051bWJlcn0gW3BvcnQ9MTQzXSBQb3J0IG51bWJlciB0byBjb25uZWN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0XG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydF0gU2V0IHRvIHRydWUsIHRvIHVzZSBlbmNyeXB0ZWQgY29ubmVjdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmNvbXByZXNzaW9uV29ya2VyUGF0aF0gb2ZmbG9hZHMgZGUtL2NvbXByZXNzaW9uIGNvbXB1dGF0aW9uIHRvIGEgd2ViIHdvcmtlciwgdGhpcyBpcyB0aGUgcGF0aCB0byB0aGUgYnJvd3NlcmlmaWVkIGVtYWlsanMtY29tcHJlc3Nvci13b3JrZXIuanNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hcCB7XG4gIGNvbnN0cnVjdG9yIChob3N0LCBwb3J0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnRpbWVvdXRFbnRlcklkbGUgPSBUSU1FT1VUX0VOVEVSX0lETEVcbiAgICB0aGlzLnRpbWVvdXRTb2NrZXRMb3dlckJvdW5kID0gVElNRU9VVF9TT0NLRVRfTE9XRVJfQk9VTkRcbiAgICB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyID0gVElNRU9VVF9TT0NLRVRfTVVMVElQTElFUlxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuXG4gICAgdGhpcy5wb3J0ID0gcG9ydCB8fCAodGhpcy5vcHRpb25zLnVzZVNlY3VyZVRyYW5zcG9ydCA/IDk5MyA6IDE0MylcbiAgICB0aGlzLmhvc3QgPSBob3N0IHx8ICdsb2NhbGhvc3QnXG5cbiAgICAvLyBVc2UgYSBUTFMgY29ubmVjdGlvbi4gUG9ydCA5OTMgYWxzbyBmb3JjZXMgVExTLlxuICAgIHRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgPSAndXNlU2VjdXJlVHJhbnNwb3J0JyBpbiB0aGlzLm9wdGlvbnMgPyAhIXRoaXMub3B0aW9ucy51c2VTZWN1cmVUcmFuc3BvcnQgOiB0aGlzLnBvcnQgPT09IDk5M1xuXG4gICAgdGhpcy5zZWN1cmVNb2RlID0gISF0aGlzLm9wdGlvbnMudXNlU2VjdXJlVHJhbnNwb3J0IC8vIERvZXMgdGhlIGNvbm5lY3Rpb24gdXNlIFNTTC9UTFNcblxuICAgIHRoaXMuX2Nvbm5lY3Rpb25SZWFkeSA9IGZhbHNlIC8vIElzIHRoZSBjb25lY3Rpb24gZXN0YWJsaXNoZWQgYW5kIGdyZWV0aW5nIGlzIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlclxuXG4gICAgdGhpcy5fZ2xvYmFsQWNjZXB0VW50YWdnZWQgPSB7fSAvLyBHbG9iYWwgaGFuZGxlcnMgZm9yIHVucmVsYXRlZCByZXNwb25zZXMgKEVYUFVOR0UsIEVYSVNUUyBldGMuKVxuXG4gICAgdGhpcy5fY2xpZW50UXVldWUgPSBbXSAvLyBRdWV1ZSBvZiBvdXRnb2luZyBjb21tYW5kc1xuICAgIHRoaXMuX2NhblNlbmQgPSBmYWxzZSAvLyBJcyBpdCBPSyB0byBzZW5kIHNvbWV0aGluZyB0byB0aGUgc2VydmVyXG4gICAgdGhpcy5fdGFnQ291bnRlciA9IDAgLy8gQ291bnRlciB0byBhbGxvdyB1bmlxdWV1ZSBpbWFwIHRhZ3NcbiAgICB0aGlzLl9jdXJyZW50Q29tbWFuZCA9IGZhbHNlIC8vIEN1cnJlbnQgY29tbWFuZCB0aGF0IGlzIHdhaXRpbmcgZm9yIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlclxuXG4gICAgdGhpcy5faWRsZVRpbWVyID0gZmFsc2UgLy8gVGltZXIgd2FpdGluZyB0byBlbnRlciBpZGxlXG4gICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gZmFsc2UgLy8gVGltZXIgd2FpdGluZyB0byBkZWNsYXJlIHRoZSBzb2NrZXQgZGVhZCBzdGFydGluZyBmcm9tIHRoZSBsYXN0IHdyaXRlXG5cbiAgICB0aGlzLmNvbXByZXNzZWQgPSBmYWxzZSAvLyBJcyB0aGUgY29ubmVjdGlvbiBjb21wcmVzc2VkIGFuZCBuZWVkcyBpbmZsYXRpbmcvZGVmbGF0aW5nXG5cbiAgICAvL1xuICAgIC8vIEhFTFBFUlNcbiAgICAvL1xuXG4gICAgLy8gQXMgdGhlIHNlcnZlciBzZW5kcyBkYXRhIGluIGNodW5rcywgaXQgbmVlZHMgdG8gYmUgc3BsaXQgaW50byBzZXBhcmF0ZSBsaW5lcy4gSGVscHMgcGFyc2luZyB0aGUgaW5wdXQuXG4gICAgdGhpcy5faW5jb21pbmdCdWZmZXJzID0gW11cbiAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyA9IDBcblxuICAgIC8vXG4gICAgLy8gRXZlbnQgcGxhY2Vob2xkZXJzLCBtYXkgYmUgb3ZlcnJpZGVuIHdpdGggY2FsbGJhY2sgZnVuY3Rpb25zXG4gICAgLy9cbiAgICB0aGlzLm9uY2VydCA9IG51bGxcbiAgICB0aGlzLm9uZXJyb3IgPSBudWxsIC8vIElycmVjb3ZlcmFibGUgZXJyb3Igb2NjdXJyZWQuIENvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciB3aWxsIGJlIGNsb3NlZCBhdXRvbWF0aWNhbGx5LlxuICAgIHRoaXMub25yZWFkeSA9IG51bGwgLy8gVGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciBoYXMgYmVlbiBlc3RhYmxpc2hlZCBhbmQgZ3JlZXRpbmcgaXMgcmVjZWl2ZWRcbiAgICB0aGlzLm9uaWRsZSA9IG51bGwgLy8gVGhlcmUgYXJlIG5vIG1vcmUgY29tbWFuZHMgdG8gcHJvY2Vzc1xuICB9XG5cbiAgLy8gUFVCTElDIE1FVEhPRFNcblxuICAvKipcbiAgICogSW5pdGlhdGUgYSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuIFdhaXQgZm9yIG9ucmVhZHkgZXZlbnRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFNvY2tldFxuICAgKiAgICAgVEVTVElORyBPTkxZISBUaGUgVENQU29ja2V0IGhhcyBhIHByZXR0eSBub25zZW5zaWNhbCBjb252ZW5pZW5jZSBjb25zdHJ1Y3RvcixcbiAgICogICAgIHdoaWNoIG1ha2VzIGl0IGhhcmQgdG8gbW9jay4gRm9yIGRlcGVuZGVuY3ktaW5qZWN0aW9uIHB1cnBvc2VzLCB3ZSB1c2UgdGhlXG4gICAqICAgICBTb2NrZXQgcGFyYW1ldGVyIHRvIHBhc3MgaW4gYSBtb2NrIFNvY2tldCBpbXBsZW1lbnRhdGlvbi4gU2hvdWxkIGJlIGxlZnQgYmxhbmtcbiAgICogICAgIGluIHByb2R1Y3Rpb24gdXNlIVxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gUmVzb2x2ZXMgd2hlbiBzb2NrZXQgaXMgb3BlbmVkXG4gICAqL1xuICBjb25uZWN0IChTb2NrZXQgPSBUQ1BTb2NrZXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zb2NrZXQgPSBTb2NrZXQub3Blbih0aGlzLmhvc3QsIHRoaXMucG9ydCwge1xuICAgICAgICBiaW5hcnlUeXBlOiAnYXJyYXlidWZmZXInLFxuICAgICAgICB1c2VTZWN1cmVUcmFuc3BvcnQ6IHRoaXMuc2VjdXJlTW9kZSxcbiAgICAgICAgY2E6IHRoaXMub3B0aW9ucy5jYVxuICAgICAgfSlcblxuICAgICAgLy8gYWxsb3dzIGNlcnRpZmljYXRlIGhhbmRsaW5nIGZvciBwbGF0Zm9ybSB3L28gbmF0aXZlIHRscyBzdXBwb3J0XG4gICAgICAvLyBvbmNlcnQgaXMgbm9uIHN0YW5kYXJkIHNvIHNldHRpbmcgaXQgbWlnaHQgdGhyb3cgaWYgdGhlIHNvY2tldCBvYmplY3QgaXMgaW1tdXRhYmxlXG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnNvY2tldC5vbmNlcnQgPSAoY2VydCkgPT4geyB0aGlzLm9uY2VydCAmJiB0aGlzLm9uY2VydChjZXJ0KSB9XG4gICAgICB9IGNhdGNoIChFKSB7IH1cblxuICAgICAgLy8gQ29ubmVjdGlvbiBjbG9zaW5nIHVuZXhwZWN0ZWQgaXMgYW4gZXJyb3JcbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignU29ja2V0IGNsb3NlZCB1bmV4cGVjdGVkbHkhJykpXG4gICAgICB0aGlzLnNvY2tldC5vbmRhdGEgPSAoZXZ0KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fb25EYXRhKGV2dClcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhpcy5fb25FcnJvcihlcnIpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaWYgYW4gZXJyb3IgaGFwcGVucyBkdXJpbmcgY3JlYXRlIHRpbWUsIHJlamVjdCB0aGUgcHJvbWlzZVxuICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBvcGVuIHNvY2tldDogJyArIGUuZGF0YS5tZXNzYWdlKSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zb2NrZXQub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAvLyB1c2UgcHJvcGVyIFwiaXJyZWNvdmVyYWJsZSBlcnJvciwgdGVhciBkb3duIGV2ZXJ5dGhpbmdcIi1oYW5kbGVyIG9ubHkgYWZ0ZXIgc29ja2V0IGlzIG9wZW5cbiAgICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlKSA9PiB0aGlzLl9vbkVycm9yKGUpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXJcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIHNvY2tldCBpcyBjbG9zZWRcbiAgICovXG4gIGNsb3NlIChlcnJvcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgdmFyIHRlYXJEb3duID0gKCkgPT4ge1xuICAgICAgICAvLyBmdWxmaWxsIHBlbmRpbmcgcHJvbWlzZXNcbiAgICAgICAgdGhpcy5fY2xpZW50UXVldWUuZm9yRWFjaChjbWQgPT4gY21kLmNhbGxiYWNrKGVycm9yKSlcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kKSB7XG4gICAgICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQuY2FsbGJhY2soZXJyb3IpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jbGllbnRRdWV1ZSA9IFtdXG4gICAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kID0gZmFsc2VcblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5faWRsZVRpbWVyKVxuICAgICAgICB0aGlzLl9pZGxlVGltZXIgPSBudWxsXG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lcilcbiAgICAgICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gbnVsbFxuXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgICAgIC8vIHJlbW92ZSBhbGwgbGlzdGVuZXJzXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25vcGVuID0gbnVsbFxuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSBudWxsXG4gICAgICAgICAgdGhpcy5zb2NrZXQub25kYXRhID0gbnVsbFxuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSBudWxsXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9uY2VydCA9IG51bGxcbiAgICAgICAgICB9IGNhdGNoIChFKSB7IH1cblxuICAgICAgICAgIHRoaXMuc29ja2V0ID0gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Rpc2FibGVDb21wcmVzc2lvbigpXG5cbiAgICAgIGlmICghdGhpcy5zb2NrZXQgfHwgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSAhPT0gJ29wZW4nKSB7XG4gICAgICAgIHJldHVybiB0ZWFyRG93bigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSB0aGlzLnNvY2tldC5vbmVycm9yID0gdGVhckRvd24gLy8gd2UgZG9uJ3QgcmVhbGx5IGNhcmUgYWJvdXQgdGhlIGVycm9yIGhlcmVcbiAgICAgIHRoaXMuc29ja2V0LmNsb3NlKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgTE9HT1VUIHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIFVzZSBpcyBkaXNjb3VyYWdlZCFcbiAgICpcbiAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gY29ubmVjdGlvbiBpcyBjbG9zZWQgYnkgc2VydmVyLlxuICAgKi9cbiAgbG9nb3V0ICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoJ0NsaWVudCBsb2dnaW5nIG91dCcpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVucXVldWVDb21tYW5kKCdMT0dPVVQnKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhdGVzIFRMUyBoYW5kc2hha2VcbiAgICovXG4gIHVwZ3JhZGUgKCkge1xuICAgIHRoaXMuc2VjdXJlTW9kZSA9IHRydWVcbiAgICB0aGlzLnNvY2tldC51cGdyYWRlVG9TZWN1cmUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyBhIGNvbW1hbmQgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VtYWlsanMvZW1haWxqcy1pbWFwLWhhbmRsZXIgZm9yIHJlcXVlc3Qgc3RydWN0dXJlLlxuICAgKiBEbyBub3QgcHJvdmlkZSBhIHRhZyBwcm9wZXJ0eSwgaXQgd2lsbCBiZSBzZXQgYnkgdGhlIHF1ZXVlIG1hbmFnZXIuXG4gICAqXG4gICAqIFRvIGNhdGNoIHVudGFnZ2VkIHJlc3BvbnNlcyB1c2UgYWNjZXB0VW50YWdnZWQgcHJvcGVydHkuIEZvciBleGFtcGxlLCBpZlxuICAgKiB0aGUgdmFsdWUgZm9yIGl0IGlzICdGRVRDSCcgdGhlbiB0aGUgcmVwb25zZSBpbmNsdWRlcyAncGF5bG9hZC5GRVRDSCcgcHJvcGVydHlcbiAgICogdGhhdCBpcyBhbiBhcnJheSBpbmNsdWRpbmcgYWxsIGxpc3RlZCAqIEZFVENIIHJlc3BvbnNlcy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3QgU3RydWN0dXJlZCByZXF1ZXN0IG9iamVjdFxuICAgKiBAcGFyYW0ge0FycmF5fSBhY2NlcHRVbnRhZ2dlZCBhIGxpc3Qgb2YgdW50YWdnZWQgcmVzcG9uc2VzIHRoYXQgd2lsbCBiZSBpbmNsdWRlZCBpbiAncGF5bG9hZCcgcHJvcGVydHlcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25hbCBkYXRhIGZvciB0aGUgY29tbWFuZCBwYXlsb2FkXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgY29ycmVzcG9uZGluZyByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICovXG4gIGVucXVldWVDb21tYW5kIChyZXF1ZXN0LCBhY2NlcHRVbnRhZ2dlZCwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2YgcmVxdWVzdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlcXVlc3QgPSB7XG4gICAgICAgIGNvbW1hbmQ6IHJlcXVlc3RcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhY2NlcHRVbnRhZ2dlZCA9IFtdLmNvbmNhdChhY2NlcHRVbnRhZ2dlZCB8fCBbXSkubWFwKCh1bnRhZ2dlZCkgPT4gKHVudGFnZ2VkIHx8ICcnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkudHJpbSgpKVxuXG4gICAgdmFyIHRhZyA9ICdXJyArICgrK3RoaXMuX3RhZ0NvdW50ZXIpXG4gICAgcmVxdWVzdC50YWcgPSB0YWdcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgIHBheWxvYWQ6IGFjY2VwdFVudGFnZ2VkLmxlbmd0aCA/IHt9IDogdW5kZWZpbmVkLFxuICAgICAgICBjYWxsYmFjazogKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFcnJvcihyZXNwb25zZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgfSBlbHNlIGlmIChbJ05PJywgJ0JBRCddLmluZGV4T2YocHJvcE9yKCcnLCAnY29tbWFuZCcsIHJlc3BvbnNlKS50b1VwcGVyQ2FzZSgpLnRyaW0oKSkgPj0gMCkge1xuICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHJlc3BvbnNlLmh1bWFuUmVhZGFibGUgfHwgJ0Vycm9yJylcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5jb2RlKSB7XG4gICAgICAgICAgICAgIGVycm9yLmNvZGUgPSByZXNwb25zZS5jb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYXBwbHkgYW55IGFkZGl0aW9uYWwgb3B0aW9ucyB0byB0aGUgY29tbWFuZFxuICAgICAgT2JqZWN0LmtleXMob3B0aW9ucyB8fCB7fSkuZm9yRWFjaCgoa2V5KSA9PiB7IGRhdGFba2V5XSA9IG9wdGlvbnNba2V5XSB9KVxuXG4gICAgICBhY2NlcHRVbnRhZ2dlZC5mb3JFYWNoKChjb21tYW5kKSA9PiB7IGRhdGEucGF5bG9hZFtjb21tYW5kXSA9IFtdIH0pXG5cbiAgICAgIC8vIGlmIHdlJ3JlIGluIHByaW9yaXR5IG1vZGUgKGkuZS4gd2UgcmFuIGNvbW1hbmRzIGluIGEgcHJlY2hlY2spLFxuICAgICAgLy8gcXVldWUgYW55IGNvbW1hbmRzIEJFRk9SRSB0aGUgY29tbWFuZCB0aGF0IGNvbnRpYW5lZCB0aGUgcHJlY2hlY2ssXG4gICAgICAvLyBvdGhlcndpc2UganVzdCBxdWV1ZSBjb21tYW5kIGFzIHVzdWFsXG4gICAgICB2YXIgaW5kZXggPSBkYXRhLmN0eCA/IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoZGF0YS5jdHgpIDogLTFcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIGRhdGEudGFnICs9ICcucCdcbiAgICAgICAgZGF0YS5yZXF1ZXN0LnRhZyArPSAnLnAnXG4gICAgICAgIHRoaXMuX2NsaWVudFF1ZXVlLnNwbGljZShpbmRleCwgMCwgZGF0YSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NsaWVudFF1ZXVlLnB1c2goZGF0YSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2NhblNlbmQpIHtcbiAgICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIGNvbW1hbmRzXG4gICAqIEBwYXJhbSBjdHhcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRQcmV2aW91c2x5UXVldWVkIChjb21tYW5kcywgY3R4KSB7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoY3R4KSAtIDFcblxuICAgIC8vIHNlYXJjaCBiYWNrd2FyZHMgZm9yIHRoZSBjb21tYW5kcyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBmb3VuZFxuICAgIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKGlzTWF0Y2godGhpcy5fY2xpZW50UXVldWVbaV0pKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGllbnRRdWV1ZVtpXVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFsc28gY2hlY2sgY3VycmVudCBjb21tYW5kIGlmIG5vIFNFTEVDVCBpcyBxdWV1ZWRcbiAgICBpZiAoaXNNYXRjaCh0aGlzLl9jdXJyZW50Q29tbWFuZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50Q29tbWFuZFxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuXG4gICAgZnVuY3Rpb24gaXNNYXRjaCAoZGF0YSkge1xuICAgICAgcmV0dXJuIGRhdGEgJiYgZGF0YS5yZXF1ZXN0ICYmIGNvbW1hbmRzLmluZGV4T2YoZGF0YS5yZXF1ZXN0LmNvbW1hbmQpID49IDBcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBkYXRhIHRvIHRoZSBUQ1Agc29ja2V0XG4gICAqIEFybXMgYSB0aW1lb3V0IHdhaXRpbmcgZm9yIGEgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIFBheWxvYWRcbiAgICovXG4gIHNlbmQgKHN0cikge1xuICAgIGNvbnN0IGJ1ZmZlciA9IHRvVHlwZWRBcnJheShzdHIpLmJ1ZmZlclxuICAgIGNvbnN0IHRpbWVvdXQgPSB0aGlzLnRpbWVvdXRTb2NrZXRMb3dlckJvdW5kICsgTWF0aC5mbG9vcihidWZmZXIuYnl0ZUxlbmd0aCAqIHRoaXMudGltZW91dFNvY2tldE11bHRpcGxpZXIpXG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKSAvLyBjbGVhciBwZW5kaW5nIHRpbWVvdXRzXG4gICAgdGhpcy5fc29ja2V0VGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLl9vbkVycm9yKG5ldyBFcnJvcignIFNvY2tldCB0aW1lZCBvdXQhJykpLCB0aW1lb3V0KSAvLyBhcm0gdGhlIG5leHQgdGltZW91dFxuXG4gICAgaWYgKHRoaXMuY29tcHJlc3NlZCkge1xuICAgICAgdGhpcy5fc2VuZENvbXByZXNzZWQoYnVmZmVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgZ2xvYmFsIGhhbmRsZXIgZm9yIGFuIHVudGFnZ2VkIHJlc3BvbnNlLiBJZiBjdXJyZW50bHkgcHJvY2Vzc2VkIGNvbW1hbmRcbiAgICogaGFzIG5vdCBsaXN0ZWQgdW50YWdnZWQgY29tbWFuZCBpdCBpcyBmb3J3YXJkZWQgdG8gdGhlIGdsb2JhbCBoYW5kbGVyLiBVc2VmdWxcbiAgICogd2l0aCBFWFBVTkdFLCBFWElTVFMgZXRjLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tbWFuZCBVbnRhZ2dlZCBjb21tYW5kIG5hbWVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgZnVuY3Rpb24gd2l0aCByZXNwb25zZSBvYmplY3QgYW5kIGNvbnRpbnVlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqL1xuICBzZXRIYW5kbGVyIChjb21tYW5kLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkW2NvbW1hbmQudG9VcHBlckNhc2UoKS50cmltKCldID0gY2FsbGJhY2tcbiAgfVxuXG4gIC8vIElOVEVSTkFMIEVWRU5UU1xuXG4gIC8qKlxuICAgKiBFcnJvciBoYW5kbGVyIGZvciB0aGUgc29ja2V0XG4gICAqXG4gICAqIEBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgRXZlbnQgb2JqZWN0LiBTZWUgZXZ0LmRhdGEgZm9yIHRoZSBlcnJvclxuICAgKi9cbiAgX29uRXJyb3IgKGV2dCkge1xuICAgIHZhciBlcnJvclxuICAgIGlmICh0aGlzLmlzRXJyb3IoZXZ0KSkge1xuICAgICAgZXJyb3IgPSBldnRcbiAgICB9IGVsc2UgaWYgKGV2dCAmJiB0aGlzLmlzRXJyb3IoZXZ0LmRhdGEpKSB7XG4gICAgICBlcnJvciA9IGV2dC5kYXRhXG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKChldnQgJiYgZXZ0LmRhdGEgJiYgZXZ0LmRhdGEubWVzc2FnZSkgfHwgZXZ0LmRhdGEgfHwgZXZ0IHx8ICdFcnJvcicpXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3IpXG5cbiAgICAvLyBhbHdheXMgY2FsbCBvbmVycm9yIGNhbGxiYWNrLCBubyBtYXR0ZXIgaWYgY2xvc2UoKSBzdWNjZWVkcyBvciBmYWlsc1xuICAgIHRoaXMuY2xvc2UoZXJyb3IpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5vbmVycm9yICYmIHRoaXMub25lcnJvcihlcnJvcilcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLm9uZXJyb3IgJiYgdGhpcy5vbmVycm9yKGVycm9yKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlciBmb3IgaW5jb21pbmcgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuIFRoZSBkYXRhIGlzIHNlbnQgaW4gYXJiaXRyYXJ5XG4gICAqIGNodW5rcyBhbmQgY2FuJ3QgYmUgdXNlZCBkaXJlY3RseSBzbyB0aGlzIGZ1bmN0aW9uIG1ha2VzIHN1cmUgdGhlIGRhdGFcbiAgICogaXMgc3BsaXQgaW50byBjb21wbGV0ZSBsaW5lcyBiZWZvcmUgdGhlIGRhdGEgaXMgcGFzc2VkIHRvIHRoZSBjb21tYW5kXG4gICAqIGhhbmRsZXJcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAqL1xuICBfb25EYXRhIChldnQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKSAvLyByZXNldCB0aGUgdGltZW91dCBvbiBlYWNoIGRhdGEgcGFja2V0XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMudGltZW91dFNvY2tldExvd2VyQm91bmQgKyBNYXRoLmZsb29yKDQwOTYgKiB0aGlzLnRpbWVvdXRTb2NrZXRNdWx0aXBsaWVyKSAvLyBtYXggcGFja2V0IHNpemUgaXMgNDA5NiBieXRlc1xuICAgIHRoaXMuX3NvY2tldFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJyBTb2NrZXQgdGltZWQgb3V0IScpKSwgdGltZW91dClcblxuICAgIHRoaXMuX2luY29taW5nQnVmZmVycy5wdXNoKG5ldyBVaW50OEFycmF5KGV2dC5kYXRhKSkgLy8gYXBwZW5kIHRvIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgICB0aGlzLl9wYXJzZUluY29taW5nQ29tbWFuZHModGhpcy5faXRlcmF0ZUluY29taW5nQnVmZmVyKCkpIC8vIENvbnN1bWUgdGhlIGluY29taW5nIGJ1ZmZlclxuICB9XG5cbiAgKiBfaXRlcmF0ZUluY29taW5nQnVmZmVyICgpIHtcbiAgICBsZXQgYnVmID0gdGhpcy5faW5jb21pbmdCdWZmZXJzW3RoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggLSAxXSB8fCBbXVxuICAgIGxldCBpID0gMFxuXG4gICAgLy8gbG9vcCBpbnZhcmlhbnQ6XG4gICAgLy8gICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgc3RhcnRzIHdpdGggdGhlIGJlZ2lubmluZyBvZiBpbmNvbWluZyBjb21tYW5kLlxuICAgIC8vICAgYnVmIGlzIHNob3J0aGFuZCBmb3IgbGFzdCBlbGVtZW50IG9mIHRoaXMuX2luY29taW5nQnVmZmVycy5cbiAgICAvLyAgIGJ1ZlswLi5pLTFdIGlzIHBhcnQgb2YgaW5jb21pbmcgY29tbWFuZC5cbiAgICB3aGlsZSAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgIHN3aXRjaCAodGhpcy5fYnVmZmVyU3RhdGUpIHtcbiAgICAgICAgY2FzZSBCVUZGRVJfU1RBVEVfTElURVJBTDpcbiAgICAgICAgICBjb25zdCBkaWZmID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIGksIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcpXG4gICAgICAgICAgdGhpcy5fbGl0ZXJhbFJlbWFpbmluZyAtPSBkaWZmXG4gICAgICAgICAgaSArPSBkaWZmXG4gICAgICAgICAgaWYgKHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjYXNlIEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8yOlxuICAgICAgICAgIGlmIChpIDwgYnVmLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGJ1ZltpXSA9PT0gQ0FSUklBR0VfUkVUVVJOKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2xpdGVyYWxSZW1haW5pbmcgPSBOdW1iZXIoZnJvbVR5cGVkQXJyYXkodGhpcy5fbGVuZ3RoQnVmZmVyKSkgKyAyIC8vIGZvciBDUkxGXG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0xJVEVSQUxcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2J1ZmZlclN0YXRlID0gQlVGRkVSX1NUQVRFX0RFRkFVTFRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9sZW5ndGhCdWZmZXJcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjYXNlIEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xOlxuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gaVxuICAgICAgICAgIHdoaWxlIChpIDwgYnVmLmxlbmd0aCAmJiBidWZbaV0gPj0gNDggJiYgYnVmW2ldIDw9IDU3KSB7IC8vIGRpZ2l0c1xuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdGFydCAhPT0gaSkge1xuICAgICAgICAgICAgY29uc3QgbGF0ZXN0ID0gYnVmLnN1YmFycmF5KHN0YXJ0LCBpKVxuICAgICAgICAgICAgY29uc3QgcHJldkJ1ZiA9IHRoaXMuX2xlbmd0aEJ1ZmZlclxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkocHJldkJ1Zi5sZW5ndGggKyBsYXRlc3QubGVuZ3RoKVxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyLnNldChwcmV2QnVmKVxuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoQnVmZmVyLnNldChsYXRlc3QsIHByZXZCdWYubGVuZ3RoKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaSA8IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sZW5ndGhCdWZmZXIubGVuZ3RoID4gMCAmJiBidWZbaV0gPT09IFJJR0hUX0NVUkxZX0JSQUNLRVQpIHtcbiAgICAgICAgICAgICAgdGhpcy5fYnVmZmVyU3RhdGUgPSBCVUZGRVJfU1RBVEVfUE9TU0lCTFlfTElURVJBTF9MRU5HVEhfMlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xlbmd0aEJ1ZmZlclxuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9ERUZBVUxUXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKytcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIGZpbmQgbGl0ZXJhbCBsZW5ndGhcbiAgICAgICAgICBjb25zdCBsZWZ0SWR4ID0gYnVmLmluZGV4T2YoTEVGVF9DVVJMWV9CUkFDS0VULCBpKVxuICAgICAgICAgIGlmIChsZWZ0SWR4ID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlZnRPZkxlZnRDdXJseSA9IG5ldyBVaW50OEFycmF5KGJ1Zi5idWZmZXIsIGksIGxlZnRJZHggLSBpKVxuICAgICAgICAgICAgaWYgKGxlZnRPZkxlZnRDdXJseS5pbmRleE9mKExJTkVfRkVFRCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgIGkgPSBsZWZ0SWR4ICsgMVxuICAgICAgICAgICAgICB0aGlzLl9sZW5ndGhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgwKVxuICAgICAgICAgICAgICB0aGlzLl9idWZmZXJTdGF0ZSA9IEJVRkZFUl9TVEFURV9QT1NTSUJMWV9MSVRFUkFMX0xFTkdUSF8xXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gZmluZCBlbmQgb2YgY29tbWFuZFxuICAgICAgICAgIGNvbnN0IExGaWR4ID0gYnVmLmluZGV4T2YoTElORV9GRUVELCBpKVxuICAgICAgICAgIGlmIChMRmlkeCA+IC0xKSB7XG4gICAgICAgICAgICBpZiAoTEZpZHggPCBidWYubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnNbdGhpcy5faW5jb21pbmdCdWZmZXJzLmxlbmd0aCAtIDFdID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ1ZmZlciwgMCwgTEZpZHggKyAxKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29tbWFuZExlbmd0aCA9IHRoaXMuX2luY29taW5nQnVmZmVycy5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYgKyBjdXJyLmxlbmd0aCwgMCkgLSAyIC8vIDIgZm9yIENSTEZcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgVWludDhBcnJheShjb21tYW5kTGVuZ3RoKVxuICAgICAgICAgICAgbGV0IGluZGV4ID0gMFxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGxldCB1aW50OEFycmF5ID0gdGhpcy5faW5jb21pbmdCdWZmZXJzLnNoaWZ0KClcblxuICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdMZW5ndGggPSBjb21tYW5kTGVuZ3RoIC0gaW5kZXhcbiAgICAgICAgICAgICAgaWYgKHVpbnQ4QXJyYXkubGVuZ3RoID4gcmVtYWluaW5nTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhjZXNzTGVuZ3RoID0gdWludDhBcnJheS5sZW5ndGggLSByZW1haW5pbmdMZW5ndGhcbiAgICAgICAgICAgICAgICB1aW50OEFycmF5ID0gdWludDhBcnJheS5zdWJhcnJheSgwLCAtZXhjZXNzTGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2luY29taW5nQnVmZmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMgPSBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb21tYW5kLnNldCh1aW50OEFycmF5LCBpbmRleClcbiAgICAgICAgICAgICAgaW5kZXggKz0gdWludDhBcnJheS5sZW5ndGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHlpZWxkIGNvbW1hbmRcbiAgICAgICAgICAgIGlmIChMRmlkeCA8IGJ1Zi5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGJ1Zi5zdWJhcnJheShMRmlkeCArIDEpKVxuICAgICAgICAgICAgICB0aGlzLl9pbmNvbWluZ0J1ZmZlcnMucHVzaChidWYpXG4gICAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBjbGVhciB0aGUgdGltZW91dCB3aGVuIGFuIGVudGlyZSBjb21tYW5kIGhhcyBhcnJpdmVkXG4gICAgICAgICAgICAgIC8vIGFuZCBub3Qgd2FpdGluZyBvbiBtb3JlIGRhdGEgZm9yIG5leHQgY29tbWFuZFxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fc29ja2V0VGltZW91dFRpbWVyKVxuICAgICAgICAgICAgICB0aGlzLl9zb2NrZXRUaW1lb3V0VGltZXIgPSBudWxsXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUFJJVkFURSBNRVRIT0RTXG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyBhIGNvbW1hbmQgZnJvbSB0aGUgcXVldWUuIFRoZSBjb21tYW5kIGlzIHBhcnNlZCBhbmQgZmVlZGVkIHRvIGEgaGFuZGxlclxuICAgKi9cbiAgX3BhcnNlSW5jb21pbmdDb21tYW5kcyAoY29tbWFuZHMpIHtcbiAgICBmb3IgKHZhciBjb21tYW5kIG9mIGNvbW1hbmRzKSB7XG4gICAgICB0aGlzLl9jbGVhcklkbGUoKVxuXG4gICAgICAvKlxuICAgICAgICogVGhlIFwiK1wiLXRhZ2dlZCByZXNwb25zZSBpcyBhIHNwZWNpYWwgY2FzZTpcbiAgICAgICAqIEVpdGhlciB0aGUgc2VydmVyIGNhbiBhc2tzIGZvciB0aGUgbmV4dCBjaHVuayBvZiBkYXRhLCBlLmcuIGZvciB0aGUgQVVUSEVOVElDQVRFIGNvbW1hbmQuXG4gICAgICAgKlxuICAgICAgICogT3IgdGhlcmUgd2FzIGFuIGVycm9yIGluIHRoZSBYT0FVVEgyIGF1dGhlbnRpY2F0aW9uLCBmb3Igd2hpY2ggU0FTTCBpbml0aWFsIGNsaWVudCByZXNwb25zZSBleHRlbnNpb25cbiAgICAgICAqIGRpY3RhdGVzIHRoZSBjbGllbnQgc2VuZHMgYW4gZW1wdHkgRU9MIHJlc3BvbnNlIHRvIHRoZSBjaGFsbGVuZ2UgY29udGFpbmluZyB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgICAqXG4gICAgICAgKiBEZXRhaWxzIG9uIFwiK1wiLXRhZ2dlZCByZXNwb25zZTpcbiAgICAgICAqICAgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM1MDEjc2VjdGlvbi0yLjIuMVxuICAgICAgICovXG4gICAgICAvL1xuICAgICAgaWYgKGNvbW1hbmRbMF0gPT09IEFTQ0lJX1BMVVMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gZmVlZCB0aGUgbmV4dCBjaHVuayBvZiBkYXRhXG4gICAgICAgICAgdmFyIGNodW5rID0gdGhpcy5fY3VycmVudENvbW1hbmQuZGF0YS5zaGlmdCgpXG4gICAgICAgICAgY2h1bmsgKz0gKCF0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLmxlbmd0aCA/IEVPTCA6ICcnKSAvLyBFT0wgaWYgdGhlcmUncyBub3RoaW5nIG1vcmUgdG8gc2VuZFxuICAgICAgICAgIHRoaXMuc2VuZChjaHVuaylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5lcnJvclJlc3BvbnNlRXhwZWN0c0VtcHR5TGluZSkge1xuICAgICAgICAgIHRoaXMuc2VuZChFT0wpIC8vIFhPQVVUSDIgZW1wdHkgcmVzcG9uc2UsIGVycm9yIHdpbGwgYmUgcmVwb3J0ZWQgd2hlbiBzZXJ2ZXIgY29udGludWVzIHdpdGggTk8gcmVzcG9uc2VcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgcmVzcG9uc2VcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHZhbHVlQXNTdHJpbmcgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0ICYmIHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QudmFsdWVBc1N0cmluZ1xuICAgICAgICByZXNwb25zZSA9IHBhcnNlcihjb21tYW5kLCB7IHZhbHVlQXNTdHJpbmcgfSlcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1M6JywgKCkgPT4gY29tcGlsZXIocmVzcG9uc2UsIGZhbHNlLCB0cnVlKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHBhcnNpbmcgaW1hcCBjb21tYW5kIScsIHJlc3BvbnNlKVxuICAgICAgICByZXR1cm4gdGhpcy5fb25FcnJvcihlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9wcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICB0aGlzLl9oYW5kbGVSZXNwb25zZShyZXNwb25zZSlcblxuICAgICAgLy8gZmlyc3QgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLCBjb25uZWN0aW9uIGlzIG5vdyB1c2FibGVcbiAgICAgIGlmICghdGhpcy5fY29ubmVjdGlvblJlYWR5KSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25SZWFkeSA9IHRydWVcbiAgICAgICAgdGhpcy5vbnJlYWR5ICYmIHRoaXMub25yZWFkeSgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZlZWRzIGEgcGFyc2VkIHJlc3BvbnNlIG9iamVjdCB0byBhbiBhcHByb3ByaWF0ZSBoYW5kbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSBQYXJzZWQgY29tbWFuZCBvYmplY3RcbiAgICovXG4gIF9oYW5kbGVSZXNwb25zZSAocmVzcG9uc2UpIHtcbiAgICB2YXIgY29tbWFuZCA9IHByb3BPcignJywgJ2NvbW1hbmQnLCByZXNwb25zZSkudG9VcHBlckNhc2UoKS50cmltKClcblxuICAgIGlmICghdGhpcy5fY3VycmVudENvbW1hbmQpIHtcbiAgICAgIC8vIHVuc29saWNpdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgY29tbWFuZCBpbiB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZCkge1xuICAgICAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgICAgICAgdGhpcy5fY2FuU2VuZCA9IHRydWVcbiAgICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZCAmJiByZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQpIHtcbiAgICAgIC8vIGV4cGVjdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICB0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkW2NvbW1hbmRdLnB1c2gocmVzcG9uc2UpXG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS50YWcgPT09ICcqJyAmJiBjb21tYW5kIGluIHRoaXMuX2dsb2JhbEFjY2VwdFVudGFnZ2VkKSB7XG4gICAgICAvLyB1bmV4cGVjdGVkIHVudGFnZ2VkIHJlc3BvbnNlXG4gICAgICB0aGlzLl9nbG9iYWxBY2NlcHRVbnRhZ2dlZFtjb21tYW5kXShyZXNwb25zZSlcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnRhZyA9PT0gdGhpcy5fY3VycmVudENvbW1hbmQudGFnKSB7XG4gICAgICAvLyB0YWdnZWQgcmVzcG9uc2VcbiAgICAgIGlmICh0aGlzLl9jdXJyZW50Q29tbWFuZC5wYXlsb2FkICYmIE9iamVjdC5rZXlzKHRoaXMuX2N1cnJlbnRDb21tYW5kLnBheWxvYWQpLmxlbmd0aCkge1xuICAgICAgICByZXNwb25zZS5wYXlsb2FkID0gdGhpcy5fY3VycmVudENvbW1hbmQucGF5bG9hZFxuICAgICAgfVxuICAgICAgdGhpcy5fY3VycmVudENvbW1hbmQuY2FsbGJhY2socmVzcG9uc2UpXG4gICAgICB0aGlzLl9jYW5TZW5kID0gdHJ1ZVxuICAgICAgdGhpcy5fc2VuZFJlcXVlc3QoKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIGNvbW1hbmQgZnJvbSBjbGllbnQgcXVldWUgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIF9zZW5kUmVxdWVzdCAoKSB7XG4gICAgaWYgKCF0aGlzLl9jbGllbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbnRlcklkbGUoKVxuICAgIH1cbiAgICB0aGlzLl9jbGVhcklkbGUoKVxuXG4gICAgLy8gYW4gb3BlcmF0aW9uIHdhcyBtYWRlIGluIHRoZSBwcmVjaGVjaywgbm8gbmVlZCB0byByZXN0YXJ0IHRoZSBxdWV1ZSBtYW51YWxseVxuICAgIHRoaXMuX3Jlc3RhcnRRdWV1ZSA9IGZhbHNlXG5cbiAgICB2YXIgY29tbWFuZCA9IHRoaXMuX2NsaWVudFF1ZXVlWzBdXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kLnByZWNoZWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyByZW1lbWJlciB0aGUgY29udGV4dFxuICAgICAgdmFyIGNvbnRleHQgPSBjb21tYW5kXG4gICAgICB2YXIgcHJlY2hlY2sgPSBjb250ZXh0LnByZWNoZWNrXG4gICAgICBkZWxldGUgY29udGV4dC5wcmVjaGVja1xuXG4gICAgICAvLyB3ZSBuZWVkIHRvIHJlc3RhcnQgdGhlIHF1ZXVlIGhhbmRsaW5nIGlmIG5vIG9wZXJhdGlvbiB3YXMgbWFkZSBpbiB0aGUgcHJlY2hlY2tcbiAgICAgIHRoaXMuX3Jlc3RhcnRRdWV1ZSA9IHRydWVcblxuICAgICAgLy8gaW52b2tlIHRoZSBwcmVjaGVjayBjb21tYW5kIGFuZCByZXN1bWUgbm9ybWFsIG9wZXJhdGlvbiBhZnRlciB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgcHJlY2hlY2soY29udGV4dCkudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIHdlJ3JlIGRvbmUgd2l0aCB0aGUgcHJlY2hlY2tcbiAgICAgICAgaWYgKHRoaXMuX3Jlc3RhcnRRdWV1ZSkge1xuICAgICAgICAgIC8vIHdlIG5lZWQgdG8gcmVzdGFydCB0aGUgcXVldWUgaGFuZGxpbmdcbiAgICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpXG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgLy8gcHJlY2hlY2sgZmFpbGVkLCBzbyB3ZSByZW1vdmUgdGhlIGluaXRpYWwgY29tbWFuZFxuICAgICAgICAvLyBmcm9tIHRoZSBxdWV1ZSwgaW52b2tlIGl0cyBjYWxsYmFjayBhbmQgcmVzdW1lIG5vcm1hbCBvcGVyYXRpb25cbiAgICAgICAgbGV0IGNtZFxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2NsaWVudFF1ZXVlLmluZGV4T2YoY29udGV4dClcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBjbWQgPSB0aGlzLl9jbGllbnRRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpWzBdXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNtZCAmJiBjbWQuY2FsbGJhY2spIHtcbiAgICAgICAgICBjbWQuY2FsbGJhY2soZXJyKVxuICAgICAgICAgIHRoaXMuX2NhblNlbmQgPSB0cnVlXG4gICAgICAgICAgdGhpcy5fcGFyc2VJbmNvbWluZ0NvbW1hbmRzKHRoaXMuX2l0ZXJhdGVJbmNvbWluZ0J1ZmZlcigpKSAvLyBDb25zdW1lIHRoZSByZXN0IG9mIHRoZSBpbmNvbWluZyBidWZmZXJcbiAgICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdCgpIC8vIGNvbnRpbnVlIHNlbmRpbmdcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2NhblNlbmQgPSBmYWxzZVxuICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kID0gdGhpcy5fY2xpZW50UXVldWUuc2hpZnQoKVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2N1cnJlbnRDb21tYW5kLmRhdGEgPSBjb21waWxlcih0aGlzLl9jdXJyZW50Q29tbWFuZC5yZXF1ZXN0LCB0cnVlKVxuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0M6JywgKCkgPT4gY29tcGlsZXIodGhpcy5fY3VycmVudENvbW1hbmQucmVxdWVzdCwgZmFsc2UsIHRydWUpKSAvLyBleGNsdWRlcyBwYXNzd29yZHMgZXRjLlxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBjb21waWxpbmcgaW1hcCBjb21tYW5kIScsIHRoaXMuX2N1cnJlbnRDb21tYW5kLnJlcXVlc3QpXG4gICAgICByZXR1cm4gdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ0Vycm9yIGNvbXBpbGluZyBpbWFwIGNvbW1hbmQhJykpXG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSB0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLnNoaWZ0KClcblxuICAgIHRoaXMuc2VuZChkYXRhICsgKCF0aGlzLl9jdXJyZW50Q29tbWFuZC5kYXRhLmxlbmd0aCA/IEVPTCA6ICcnKSlcbiAgICByZXR1cm4gdGhpcy53YWl0RHJhaW5cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBvbmlkbGUsIG5vdGluZyB0byBkbyBjdXJyZW50bHlcbiAgICovXG4gIF9lbnRlcklkbGUgKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9pZGxlVGltZXIpXG4gICAgdGhpcy5faWRsZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiAodGhpcy5vbmlkbGUgJiYgdGhpcy5vbmlkbGUoKSksIHRoaXMudGltZW91dEVudGVySWRsZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgaWRsZSB0aW1lclxuICAgKi9cbiAgX2NsZWFySWRsZSAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX2lkbGVUaW1lcilcbiAgICB0aGlzLl9pZGxlVGltZXIgPSBudWxsXG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHByb2Nlc3NlcyBhIHJlc3BvbnNlIGludG8gYW4gZWFzaWVyIHRvIGhhbmRsZSBmb3JtYXQuXG4gICAqIEFkZCB1bnRhZ2dlZCBudW1iZXJlZCByZXNwb25zZXMgKGUuZy4gRkVUQ0gpIGludG8gYSBuaWNlbHkgZmVhc2libGUgZm9ybVxuICAgKiBDaGVja3MgaWYgYSByZXNwb25zZSBpbmNsdWRlcyBvcHRpb25hbCByZXNwb25zZSBjb2Rlc1xuICAgKiBhbmQgY29waWVzIHRoZXNlIGludG8gc2VwYXJhdGUgcHJvcGVydGllcy4gRm9yIGV4YW1wbGUgdGhlXG4gICAqIGZvbGxvd2luZyByZXNwb25zZSBpbmNsdWRlcyBhIGNhcGFiaWxpdHkgbGlzdGluZyBhbmQgYSBodW1hblxuICAgKiByZWFkYWJsZSBtZXNzYWdlOlxuICAgKlxuICAgKiAgICAgKiBPSyBbQ0FQQUJJTElUWSBJRCBOQU1FU1BBQ0VdIEFsbCByZWFkeVxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBhZGRzIGEgJ2NhcGFiaWxpdHknIHByb3BlcnR5IHdpdGggYW4gYXJyYXkgdmFsdWUgWydJRCcsICdOQU1FU1BBQ0UnXVxuICAgKiB0byB0aGUgcmVzcG9uc2Ugb2JqZWN0LiBBZGRpdGlvbmFsbHkgJ0FsbCByZWFkeScgaXMgYWRkZWQgYXMgJ2h1bWFuUmVhZGFibGUnIHByb3BlcnR5LlxuICAgKlxuICAgKiBTZWUgcG9zc2libGVtIElNQVAgUmVzcG9uc2UgQ29kZXMgYXQgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU1MzBcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIFBhcnNlZCByZXNwb25zZSBvYmplY3RcbiAgICovXG4gIF9wcm9jZXNzUmVzcG9uc2UgKHJlc3BvbnNlKSB7XG4gICAgY29uc3QgY29tbWFuZCA9IHByb3BPcignJywgJ2NvbW1hbmQnLCByZXNwb25zZSkudG9VcHBlckNhc2UoKS50cmltKClcblxuICAgIC8vIG5vIGF0dHJpYnV0ZXNcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5hdHRyaWJ1dGVzIHx8ICFyZXNwb25zZS5hdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gdW50YWdnZWQgcmVzcG9uc2VzIHcvIHNlcXVlbmNlIG51bWJlcnNcbiAgICBpZiAocmVzcG9uc2UudGFnID09PSAnKicgJiYgL15cXGQrJC8udGVzdChyZXNwb25zZS5jb21tYW5kKSAmJiByZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnR5cGUgPT09ICdBVE9NJykge1xuICAgICAgcmVzcG9uc2UubnIgPSBOdW1iZXIocmVzcG9uc2UuY29tbWFuZClcbiAgICAgIHJlc3BvbnNlLmNvbW1hbmQgPSAocmVzcG9uc2UuYXR0cmlidXRlcy5zaGlmdCgpLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgfVxuXG4gICAgLy8gbm8gb3B0aW9uYWwgcmVzcG9uc2UgY29kZVxuICAgIGlmIChbJ09LJywgJ05PJywgJ0JBRCcsICdCWUUnLCAnUFJFQVVUSCddLmluZGV4T2YoY29tbWFuZCkgPCAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiBsYXN0IGVsZW1lbnQgb2YgdGhlIHJlc3BvbnNlIGlzIFRFWFQgdGhlbiB0aGlzIGlzIGZvciBodW1hbnNcbiAgICBpZiAocmVzcG9uc2UuYXR0cmlidXRlc1tyZXNwb25zZS5hdHRyaWJ1dGVzLmxlbmd0aCAtIDFdLnR5cGUgPT09ICdURVhUJykge1xuICAgICAgcmVzcG9uc2UuaHVtYW5SZWFkYWJsZSA9IHJlc3BvbnNlLmF0dHJpYnV0ZXNbcmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGggLSAxXS52YWx1ZVxuICAgIH1cblxuICAgIC8vIFBhcnNlIGFuZCBmb3JtYXQgQVRPTSB2YWx1ZXNcbiAgICBpZiAocmVzcG9uc2UuYXR0cmlidXRlc1swXS50eXBlID09PSAnQVRPTScgJiYgcmVzcG9uc2UuYXR0cmlidXRlc1swXS5zZWN0aW9uKSB7XG4gICAgICBjb25zdCBvcHRpb24gPSByZXNwb25zZS5hdHRyaWJ1dGVzWzBdLnNlY3Rpb24ubWFwKChrZXkpID0+IHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGtleS5tYXAoKGtleSkgPT4gKGtleS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50cmltKCkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIChrZXkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc3Qga2V5ID0gb3B0aW9uLnNoaWZ0KClcbiAgICAgIHJlc3BvbnNlLmNvZGUgPSBrZXlcblxuICAgICAgaWYgKG9wdGlvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVzcG9uc2Vba2V5LnRvTG93ZXJDYXNlKCldID0gb3B0aW9uWzBdXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIHJlc3BvbnNlW2tleS50b0xvd2VyQ2FzZSgpXSA9IG9wdGlvblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhbiBFcnJvciBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgVmFsdWUgdG8gYmUgY2hlY2tlZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufSByZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGlzIGFuIEVycm9yXG4gICAqL1xuICBpc0Vycm9yICh2YWx1ZSkge1xuICAgIHJldHVybiAhIU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkubWF0Y2goL0Vycm9yXFxdJC8pXG4gIH1cblxuICAvLyBDT01QUkVTU0lPTiBSRUxBVEVEIE1FVEhPRFNcblxuICAvKipcbiAgICogU2V0cyB1cCBkZWZsYXRlL2luZmxhdGUgZm9yIHRoZSBJT1xuICAgKi9cbiAgZW5hYmxlQ29tcHJlc3Npb24gKCkge1xuICAgIHRoaXMuX3NvY2tldE9uRGF0YSA9IHRoaXMuc29ja2V0Lm9uZGF0YVxuICAgIHRoaXMuY29tcHJlc3NlZCA9IHRydWVcblxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuV29ya2VyKSB7XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlciA9IG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbQ29tcHJlc3Npb25CbG9iXSkpKVxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBlLmRhdGEubWVzc2FnZVxuICAgICAgICB2YXIgZGF0YSA9IGUuZGF0YS5idWZmZXJcblxuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICAgICAgICBjYXNlIE1FU1NBR0VfSU5GTEFURURfREFUQV9SRUFEWTpcbiAgICAgICAgICAgIHRoaXMuX3NvY2tldE9uRGF0YSh7IGRhdGEgfSlcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICBjYXNlIE1FU1NBR0VfREVGTEFURURfREFUQV9SRUFEWTpcbiAgICAgICAgICAgIHRoaXMud2FpdERyYWluID0gdGhpcy5zb2NrZXQuc2VuZChkYXRhKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5vbmVycm9yID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5fb25FcnJvcihuZXcgRXJyb3IoJ0Vycm9yIGhhbmRsaW5nIGNvbXByZXNzaW9uIHdlYiB3b3JrZXI6ICcgKyBlLm1lc3NhZ2UpKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wcmVzc2lvbldvcmtlci5wb3N0TWVzc2FnZShjcmVhdGVNZXNzYWdlKE1FU1NBR0VfSU5JVElBTElaRV9XT1JLRVIpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmZsYXRlZFJlYWR5ID0gKGJ1ZmZlcikgPT4geyB0aGlzLl9zb2NrZXRPbkRhdGEoeyBkYXRhOiBidWZmZXIgfSkgfVxuICAgICAgY29uc3QgZGVmbGF0ZWRSZWFkeSA9IChidWZmZXIpID0+IHsgdGhpcy53YWl0RHJhaW4gPSB0aGlzLnNvY2tldC5zZW5kKGJ1ZmZlcikgfVxuICAgICAgdGhpcy5fY29tcHJlc3Npb24gPSBuZXcgQ29tcHJlc3Npb24oaW5mbGF0ZWRSZWFkeSwgZGVmbGF0ZWRSZWFkeSlcbiAgICB9XG5cbiAgICAvLyBvdmVycmlkZSBkYXRhIGhhbmRsZXIsIGRlY29tcHJlc3MgaW5jb21pbmcgZGF0YVxuICAgIHRoaXMuc29ja2V0Lm9uZGF0YSA9IChldnQpID0+IHtcbiAgICAgIGlmICghdGhpcy5jb21wcmVzc2VkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fY29tcHJlc3Npb25Xb3JrZXIpIHtcbiAgICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UoY3JlYXRlTWVzc2FnZShNRVNTQUdFX0lORkxBVEUsIGV2dC5kYXRhKSwgW2V2dC5kYXRhXSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbXByZXNzaW9uLmluZmxhdGUoZXZ0LmRhdGEpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVuZG9lcyBhbnkgY2hhbmdlcyByZWxhdGVkIHRvIGNvbXByZXNzaW9uLiBUaGlzIG9ubHkgYmUgY2FsbGVkIHdoZW4gY2xvc2luZyB0aGUgY29ubmVjdGlvblxuICAgKi9cbiAgX2Rpc2FibGVDb21wcmVzc2lvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmNvbXByZXNzZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuY29tcHJlc3NlZCA9IGZhbHNlXG4gICAgdGhpcy5zb2NrZXQub25kYXRhID0gdGhpcy5fc29ja2V0T25EYXRhXG4gICAgdGhpcy5fc29ja2V0T25EYXRhID0gbnVsbFxuXG4gICAgaWYgKHRoaXMuX2NvbXByZXNzaW9uV29ya2VyKSB7XG4gICAgICAvLyB0ZXJtaW5hdGUgdGhlIHdvcmtlclxuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIudGVybWluYXRlKClcbiAgICAgIHRoaXMuX2NvbXByZXNzaW9uV29ya2VyID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPdXRnb2luZyBwYXlsb2FkIG5lZWRzIHRvIGJlIGNvbXByZXNzZWQgYW5kIHNlbnQgdG8gc29ja2V0XG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGJ1ZmZlciBPdXRnb2luZyB1bmNvbXByZXNzZWQgYXJyYXlidWZmZXJcbiAgICovXG4gIF9zZW5kQ29tcHJlc3NlZCAoYnVmZmVyKSB7XG4gICAgLy8gZGVmbGF0ZVxuICAgIGlmICh0aGlzLl9jb21wcmVzc2lvbldvcmtlcikge1xuICAgICAgdGhpcy5fY29tcHJlc3Npb25Xb3JrZXIucG9zdE1lc3NhZ2UoY3JlYXRlTWVzc2FnZShNRVNTQUdFX0RFRkxBVEUsIGJ1ZmZlciksIFtidWZmZXJdKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb21wcmVzc2lvbi5kZWZsYXRlKGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgY3JlYXRlTWVzc2FnZSA9IChtZXNzYWdlLCBidWZmZXIpID0+ICh7IG1lc3NhZ2UsIGJ1ZmZlciB9KVxuIl19