'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseNAMESPACE = parseNAMESPACE;
exports.parseNAMESPACEElement = parseNAMESPACEElement;
exports.parseSELECT = parseSELECT;
exports.parseENVELOPE = parseENVELOPE;
exports.parseBODYSTRUCTURE = parseBODYSTRUCTURE;
exports.parseFETCH = parseFETCH;
exports.parseSEARCH = parseSEARCH;

var _emailjsAddressparser = require('emailjs-addressparser');

var _emailjsAddressparser2 = _interopRequireDefault(_emailjsAddressparser);

var _emailjsImapHandler = require('emailjs-imap-handler');

var _ramda = require('ramda');

var _emailjsMimeCodec = require('emailjs-mime-codec');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Parses NAMESPACE response
 *
 * @param {Object} response
 * @return {Object} Namespaces object
 */
function parseNAMESPACE(response) {
  if (!response.payload || !response.payload.NAMESPACE || !response.payload.NAMESPACE.length) {
    return false;
  }

  var attributes = [].concat(response.payload.NAMESPACE.pop().attributes || []);
  if (!attributes.length) {
    return false;
  }

  return {
    personal: parseNAMESPACEElement(attributes[0]),
    users: parseNAMESPACEElement(attributes[1]),
    shared: parseNAMESPACEElement(attributes[2])
  };
}

/**
 * Parses a NAMESPACE element
 *
 * @param {Object} element
 * @return {Object} Namespaces element object
 */
function parseNAMESPACEElement(element) {
  if (!element) {
    return false;
  }

  element = [].concat(element || []);
  return element.map(function (ns) {
    if (!ns || !ns.length) {
      return false;
    }

    return {
      prefix: ns[0].value,
      delimiter: ns[1] && ns[1].value // The delimiter can legally be NIL which maps to null
    };
  });
}

/**
 * Parses SELECT response
 *
 * @param {Object} response
 * @return {Object} Mailbox information object
 */
function parseSELECT(response) {
  if (!response || !response.payload) {
    return;
  }

  var mailbox = {
    readOnly: response.code === 'READ-ONLY'
  };
  var existsResponse = response.payload.EXISTS && response.payload.EXISTS.pop();
  var flagsResponse = response.payload.FLAGS && response.payload.FLAGS.pop();
  var okResponse = response.payload.OK;

  if (existsResponse) {
    mailbox.exists = existsResponse.nr || 0;
  }

  if (flagsResponse && flagsResponse.attributes && flagsResponse.attributes.length) {
    mailbox.flags = flagsResponse.attributes[0].map(function (flag) {
      return (flag.value || '').toString().trim();
    });
  }

  [].concat(okResponse || []).forEach(function (ok) {
    switch (ok && ok.code) {
      case 'PERMANENTFLAGS':
        mailbox.permanentFlags = [].concat(ok.permanentflags || []);
        break;
      case 'UIDVALIDITY':
        mailbox.uidValidity = Number(ok.uidvalidity) || 0;
        break;
      case 'UIDNEXT':
        mailbox.uidNext = Number(ok.uidnext) || 0;
        break;
      case 'HIGHESTMODSEQ':
        mailbox.highestModseq = ok.highestmodseq || '0'; // keep 64bit uint as a string
        break;
      case 'NOMODSEQ':
        mailbox.noModseq = true;
        break;
    }
  });

  return mailbox;
}

/**
 * Parses message envelope from FETCH response. All keys in the resulting
 * object are lowercase. Address fields are all arrays with {name:, address:}
 * structured values. Unicode strings are automatically decoded.
 *
 * @param {Array} value Envelope array
 * @param {Object} Envelope object
 */
function parseENVELOPE(value) {
  var envelope = {};

  if (value[0] && value[0].value) {
    envelope.date = value[0].value;
  }

  if (value[1] && value[1].value) {
    envelope.subject = (0, _emailjsMimeCodec.mimeWordsDecode)(value[1] && value[1].value);
  }

  if (value[2] && value[2].length) {
    envelope.from = processAddresses(value[2]);
  }

  if (value[3] && value[3].length) {
    envelope.sender = processAddresses(value[3]);
  }

  if (value[4] && value[4].length) {
    envelope['reply-to'] = processAddresses(value[4]);
  }

  if (value[5] && value[5].length) {
    envelope.to = processAddresses(value[5]);
  }

  if (value[6] && value[6].length) {
    envelope.cc = processAddresses(value[6]);
  }

  if (value[7] && value[7].length) {
    envelope.bcc = processAddresses(value[7]);
  }

  if (value[8] && value[8].value) {
    envelope['in-reply-to'] = value[8].value;
  }

  if (value[9] && value[9].value) {
    envelope['message-id'] = value[9].value;
  }

  return envelope;
}

/*
 * ENVELOPE lists addresses as [name-part, source-route, username, hostname]
 * where source-route is not used anymore and can be ignored.
 * To get comparable results with other parts of the email.js stack
 * browserbox feeds the parsed address values from ENVELOPE
 * to addressparser and uses resulting values instead of the
 * pre-parsed addresses
 */
function processAddresses() {
  var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  return list.map(function (addr) {
    var name = (0, _ramda.pathOr)('', ['0', 'value'], addr).trim();
    var address = (0, _ramda.pathOr)('', ['2', 'value'], addr) + '@' + (0, _ramda.pathOr)('', ['3', 'value'], addr);
    var formatted = name ? encodeAddressName(name) + ' <' + address + '>' : address;
    var parsed = (0, _emailjsAddressparser2.default)(formatted).shift(); // there should be just a single address
    parsed.name = (0, _emailjsMimeCodec.mimeWordsDecode)(parsed.name);
    return parsed;
  });
}

/**
 * If needed, encloses with quotes or mime encodes the name part of an e-mail address
 *
 * @param {String} name Name part of an address
 * @returns {String} Mime word encoded or quoted string
 */
function encodeAddressName(name) {
  if (!/^[\w ']*$/.test(name)) {
    if (/^[\x20-\x7e]*$/.test(name)) {
      return JSON.stringify(name);
    } else {
      return (0, _emailjsMimeCodec.mimeWordEncode)(name, 'Q', 52);
    }
  }
  return name;
}

/**
 * Parses message body structure from FETCH response.
 *
 * @param {Array} value BODYSTRUCTURE array
 * @param {Object} Envelope object
 */
function parseBODYSTRUCTURE(node) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var curNode = {};
  var i = 0;
  var part = 0;

  if (path.length) {
    curNode.part = path.join('.');
  }

  // multipart
  if (Array.isArray(node[0])) {
    curNode.childNodes = [];
    while (Array.isArray(node[i])) {
      curNode.childNodes.push(parseBODYSTRUCTURE(node[i], path.concat(++part)));
      i++;
    }

    // multipart type
    curNode.type = 'multipart/' + ((node[i++] || {}).value || '').toString().toLowerCase();

    // extension data (not available for BODY requests)

    // body parameter parenthesized list
    if (i < node.length - 1) {
      if (node[i]) {
        curNode.parameters = attributesToObject(node[i]);
      }
      i++;
    }
  } else {
    // content type
    curNode.type = [((node[i++] || {}).value || '').toString().toLowerCase(), ((node[i++] || {}).value || '').toString().toLowerCase()].join('/');

    // body parameter parenthesized list
    if (node[i]) {
      curNode.parameters = attributesToObject(node[i]);
    }
    i++;

    // id
    if (node[i]) {
      curNode.id = ((node[i] || {}).value || '').toString();
    }
    i++;

    // description
    if (node[i]) {
      curNode.description = ((node[i] || {}).value || '').toString();
    }
    i++;

    // encoding
    if (node[i]) {
      curNode.encoding = ((node[i] || {}).value || '').toString().toLowerCase();
    }
    i++;

    // size
    if (node[i]) {
      curNode.size = Number((node[i] || {}).value || 0) || 0;
    }
    i++;

    if (curNode.type === 'message/rfc822') {
      // message/rfc adds additional envelope, bodystructure and line count values

      // envelope
      if (node[i]) {
        curNode.envelope = parseENVELOPE([].concat(node[i] || []));
      }
      i++;

      if (node[i]) {
        curNode.childNodes = [
        // rfc822 bodyparts share the same path, difference is between MIME and HEADER
        // path.MIME returns message/rfc822 header
        // path.HEADER returns inlined message header
        parseBODYSTRUCTURE(node[i], path)];
      }
      i++;

      // line count
      if (node[i]) {
        curNode.lineCount = Number((node[i] || {}).value || 0) || 0;
      }
      i++;
    } else if (/^text\//.test(curNode.type)) {
      // text/* adds additional line count values

      // line count
      if (node[i]) {
        curNode.lineCount = Number((node[i] || {}).value || 0) || 0;
      }
      i++;
    }

    // extension data (not available for BODY requests)

    // md5
    if (i < node.length - 1) {
      if (node[i]) {
        curNode.md5 = ((node[i] || {}).value || '').toString().toLowerCase();
      }
      i++;
    }
  }

  // the following are shared extension values (for both multipart and non-multipart parts)
  // not available for BODY requests

  // body disposition
  if (i < node.length - 1) {
    if (Array.isArray(node[i]) && node[i].length) {
      curNode.disposition = ((node[i][0] || {}).value || '').toString().toLowerCase();
      if (Array.isArray(node[i][1])) {
        curNode.dispositionParameters = attributesToObject(node[i][1]);
      }
    }
    i++;
  }

  // body language
  if (i < node.length - 1) {
    if (node[i]) {
      curNode.language = [].concat(node[i]).map(function (val) {
        return (0, _ramda.propOr)('', 'value', val).toLowerCase();
      });
    }
    i++;
  }

  // body location
  // NB! defined as a "string list" in RFC3501 but replaced in errata document with "string"
  // Errata: http://www.rfc-editor.org/errata_search.php?rfc=3501
  if (i < node.length - 1) {
    if (node[i]) {
      curNode.location = ((node[i] || {}).value || '').toString();
    }
    i++;
  }

  return curNode;
}

function attributesToObject() {
  var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var keyTransform = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _ramda.toLower;
  var valueTransform = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emailjsMimeCodec.mimeWordsDecode;

  var vals = attrs.map((0, _ramda.prop)('value'));
  var keys = vals.filter(function (_, i) {
    return i % 2 === 0;
  }).map(keyTransform);
  var values = vals.filter(function (_, i) {
    return i % 2 === 1;
  }).map(valueTransform);
  return (0, _ramda.fromPairs)((0, _ramda.zip)(keys, values));
}

/**
 * Parses FETCH response
 *
 * @param {Object} response
 * @return {Object} Message object
 */
function parseFETCH(response) {
  if (!response || !response.payload || !response.payload.FETCH || !response.payload.FETCH.length) {
    return [];
  }

  var list = [];
  var messages = {};

  response.payload.FETCH.forEach(function (item) {
    var params = [].concat([].concat(item.attributes || [])[0] || []); // ensure the first value is an array
    var message = void 0;
    var i = void 0,
        len = void 0,
        key = void 0;

    if (messages[item.nr]) {
      // same sequence number is already used, so merge values instead of creating a new message object
      message = messages[item.nr];
    } else {
      messages[item.nr] = message = {
        '#': item.nr
      };
      list.push(message);
    }

    for (i = 0, len = params.length; i < len; i++) {
      if (i % 2 === 0) {
        key = (0, _emailjsImapHandler.compiler)({
          attributes: [params[i]]
        }).toLowerCase().replace(/<\d+>$/, '');
        continue;
      }
      message[key] = parseFetchValue(key, params[i]);
    }
  });

  return list;
}

/**
 * Parses a single value from the FETCH response object
 *
 * @param {String} key Key name (uppercase)
 * @param {Mized} value Value for the key
 * @return {Mixed} Processed value
 */
function parseFetchValue(key, value) {
  if (!value) {
    return null;
  }

  if (!Array.isArray(value)) {
    switch (key) {
      case 'uid':
      case 'rfc822.size':
        return Number(value.value) || 0;
      case 'modseq':
        // do not cast 64 bit uint to a number
        return value.value || '0';
    }
    return value.value;
  }

  switch (key) {
    case 'flags':
    case 'x-gm-labels':
      value = [].concat(value).map(function (flag) {
        return flag.value || '';
      });
      break;
    case 'envelope':
      value = parseENVELOPE([].concat(value || []));
      break;
    case 'bodystructure':
      value = parseBODYSTRUCTURE([].concat(value || []));
      break;
    case 'modseq':
      value = (value.shift() || {}).value || '0';
      break;
  }

  return value;
}

/**
 * Parses SEARCH response. Gathers all untagged SEARCH responses, fetched seq./uid numbers
 * and compiles these into a sorted array.
 *
 * @param {Object} response
 * @return {Object} Message object
 * @param {Array} Sorted Seq./UID number list
 */
function parseSEARCH(response) {
  return (0, _ramda.pipe)((0, _ramda.pathOr)([], ['payload', 'SEARCH']), (0, _ramda.map)(function (x) {
    return x.attributes || [];
  }), _ramda.flatten, (0, _ramda.map)(function (nr) {
    return Number((0, _ramda.propOr)(nr || 0, 'value', nr)) || 0;
  }), (0, _ramda.sort)(function (a, b) {
    return a > b;
  }))(response);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21tYW5kLXBhcnNlci5qcyJdLCJuYW1lcyI6WyJwYXJzZU5BTUVTUEFDRSIsInBhcnNlTkFNRVNQQUNFRWxlbWVudCIsInBhcnNlU0VMRUNUIiwicGFyc2VFTlZFTE9QRSIsInBhcnNlQk9EWVNUUlVDVFVSRSIsInBhcnNlRkVUQ0giLCJwYXJzZVNFQVJDSCIsInJlc3BvbnNlIiwicGF5bG9hZCIsIk5BTUVTUEFDRSIsImxlbmd0aCIsImF0dHJpYnV0ZXMiLCJjb25jYXQiLCJwb3AiLCJwZXJzb25hbCIsInVzZXJzIiwic2hhcmVkIiwiZWxlbWVudCIsIm1hcCIsIm5zIiwicHJlZml4IiwidmFsdWUiLCJkZWxpbWl0ZXIiLCJtYWlsYm94IiwicmVhZE9ubHkiLCJjb2RlIiwiZXhpc3RzUmVzcG9uc2UiLCJFWElTVFMiLCJmbGFnc1Jlc3BvbnNlIiwiRkxBR1MiLCJva1Jlc3BvbnNlIiwiT0siLCJleGlzdHMiLCJuciIsImZsYWdzIiwiZmxhZyIsInRvU3RyaW5nIiwidHJpbSIsImZvckVhY2giLCJvayIsInBlcm1hbmVudEZsYWdzIiwicGVybWFuZW50ZmxhZ3MiLCJ1aWRWYWxpZGl0eSIsIk51bWJlciIsInVpZHZhbGlkaXR5IiwidWlkTmV4dCIsInVpZG5leHQiLCJoaWdoZXN0TW9kc2VxIiwiaGlnaGVzdG1vZHNlcSIsIm5vTW9kc2VxIiwiZW52ZWxvcGUiLCJkYXRlIiwic3ViamVjdCIsImZyb20iLCJwcm9jZXNzQWRkcmVzc2VzIiwic2VuZGVyIiwidG8iLCJjYyIsImJjYyIsImxpc3QiLCJhZGRyIiwibmFtZSIsImFkZHJlc3MiLCJmb3JtYXR0ZWQiLCJlbmNvZGVBZGRyZXNzTmFtZSIsInBhcnNlZCIsInNoaWZ0IiwidGVzdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJub2RlIiwicGF0aCIsImN1ck5vZGUiLCJpIiwicGFydCIsImpvaW4iLCJBcnJheSIsImlzQXJyYXkiLCJjaGlsZE5vZGVzIiwicHVzaCIsInR5cGUiLCJ0b0xvd2VyQ2FzZSIsInBhcmFtZXRlcnMiLCJhdHRyaWJ1dGVzVG9PYmplY3QiLCJpZCIsImRlc2NyaXB0aW9uIiwiZW5jb2RpbmciLCJzaXplIiwibGluZUNvdW50IiwibWQ1IiwiZGlzcG9zaXRpb24iLCJkaXNwb3NpdGlvblBhcmFtZXRlcnMiLCJsYW5ndWFnZSIsInZhbCIsImxvY2F0aW9uIiwiYXR0cnMiLCJrZXlUcmFuc2Zvcm0iLCJ2YWx1ZVRyYW5zZm9ybSIsInZhbHMiLCJrZXlzIiwiZmlsdGVyIiwiXyIsInZhbHVlcyIsIkZFVENIIiwibWVzc2FnZXMiLCJpdGVtIiwicGFyYW1zIiwibWVzc2FnZSIsImxlbiIsImtleSIsInJlcGxhY2UiLCJwYXJzZUZldGNoVmFsdWUiLCJ4IiwiYSIsImIiXSwibWFwcGluZ3MiOiI7Ozs7O1FBV2dCQSxjLEdBQUFBLGM7UUF1QkFDLHFCLEdBQUFBLHFCO1FBd0JBQyxXLEdBQUFBLFc7UUFtREFDLGEsR0FBQUEsYTtRQXdGQUMsa0IsR0FBQUEsa0I7UUE4SkFDLFUsR0FBQUEsVTtRQXVGQUMsVyxHQUFBQSxXOztBQTFiaEI7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBOzs7Ozs7QUFNTyxTQUFTTixjQUFULENBQXlCTyxRQUF6QixFQUFtQztBQUN4QyxNQUFJLENBQUNBLFNBQVNDLE9BQVYsSUFBcUIsQ0FBQ0QsU0FBU0MsT0FBVCxDQUFpQkMsU0FBdkMsSUFBb0QsQ0FBQ0YsU0FBU0MsT0FBVCxDQUFpQkMsU0FBakIsQ0FBMkJDLE1BQXBGLEVBQTRGO0FBQzFGLFdBQU8sS0FBUDtBQUNEOztBQUVELE1BQUlDLGFBQWEsR0FBR0MsTUFBSCxDQUFVTCxTQUFTQyxPQUFULENBQWlCQyxTQUFqQixDQUEyQkksR0FBM0IsR0FBaUNGLFVBQWpDLElBQStDLEVBQXpELENBQWpCO0FBQ0EsTUFBSSxDQUFDQSxXQUFXRCxNQUFoQixFQUF3QjtBQUN0QixXQUFPLEtBQVA7QUFDRDs7QUFFRCxTQUFPO0FBQ0xJLGNBQVViLHNCQUFzQlUsV0FBVyxDQUFYLENBQXRCLENBREw7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TCxnQkFBSTtBQUFBLFdBQUt5RyxFQUFFckcsVUFBRixJQUFnQixFQUFyQjtBQUFBLEdBQUosQ0FGSyxrQkFJTCxnQkFBSTtBQUFBLFdBQU1nQyxPQUFPLG1CQUFPVixNQUFNLENBQWIsRUFBZ0IsT0FBaEIsRUFBeUJBLEVBQXpCLENBQVAsS0FBd0MsQ0FBOUM7QUFBQSxHQUFKLENBSkssRUFLTCxpQkFBSyxVQUFDZ0YsQ0FBRCxFQUFJQyxDQUFKO0FBQUEsV0FBVUQsSUFBSUMsQ0FBZDtBQUFBLEdBQUwsQ0FMSyxFQU1MM0csUUFOSyxDQUFQO0FBT0QiLCJmaWxlIjoiY29tbWFuZC1wYXJzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFyc2VBZGRyZXNzIGZyb20gJ2VtYWlsanMtYWRkcmVzc3BhcnNlcidcbmltcG9ydCB7IGNvbXBpbGVyIH0gZnJvbSAnZW1haWxqcy1pbWFwLWhhbmRsZXInXG5pbXBvcnQgeyBzb3J0LCBtYXAsIHBpcGUsIHppcCwgZnJvbVBhaXJzLCBwcm9wLCBwYXRoT3IsIHByb3BPciwgZmxhdHRlbiwgdG9Mb3dlciB9IGZyb20gJ3JhbWRhJ1xuaW1wb3J0IHsgbWltZVdvcmRFbmNvZGUsIG1pbWVXb3Jkc0RlY29kZSB9IGZyb20gJ2VtYWlsanMtbWltZS1jb2RlYydcblxuLyoqXG4gKiBQYXJzZXMgTkFNRVNQQUNFIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5hbWVzcGFjZXMgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU5BTUVTUEFDRSAocmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZS5wYXlsb2FkIHx8ICFyZXNwb25zZS5wYXlsb2FkLk5BTUVTUEFDRSB8fCAhcmVzcG9uc2UucGF5bG9hZC5OQU1FU1BBQ0UubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBsZXQgYXR0cmlidXRlcyA9IFtdLmNvbmNhdChyZXNwb25zZS5wYXlsb2FkLk5BTUVTUEFDRS5wb3AoKS5hdHRyaWJ1dGVzIHx8IFtdKVxuICBpZiAoIWF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBlcnNvbmFsOiBwYXJzZU5BTUVTUEFDRUVsZW1lbnQoYXR0cmlidXRlc1swXSksXG4gICAgdXNlcnM6IHBhcnNlTkFNRVNQQUNFRWxlbWVudChhdHRyaWJ1dGVzWzFdKSxcbiAgICBzaGFyZWQ6IHBhcnNlTkFNRVNQQUNFRWxlbWVudChhdHRyaWJ1dGVzWzJdKVxuICB9XG59XG5cbi8qKlxuICogUGFyc2VzIGEgTkFNRVNQQUNFIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICogQHJldHVybiB7T2JqZWN0fSBOYW1lc3BhY2VzIGVsZW1lbnQgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU5BTUVTUEFDRUVsZW1lbnQgKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBlbGVtZW50ID0gW10uY29uY2F0KGVsZW1lbnQgfHwgW10pXG4gIHJldHVybiBlbGVtZW50Lm1hcCgobnMpID0+IHtcbiAgICBpZiAoIW5zIHx8ICFucy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwcmVmaXg6IG5zWzBdLnZhbHVlLFxuICAgICAgZGVsaW1pdGVyOiBuc1sxXSAmJiBuc1sxXS52YWx1ZSAvLyBUaGUgZGVsaW1pdGVyIGNhbiBsZWdhbGx5IGJlIE5JTCB3aGljaCBtYXBzIHRvIG51bGxcbiAgICB9XG4gIH0pXG59XG5cbi8qKlxuICogUGFyc2VzIFNFTEVDVCByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICogQHJldHVybiB7T2JqZWN0fSBNYWlsYm94IGluZm9ybWF0aW9uIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTRUxFQ1QgKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLnBheWxvYWQpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGxldCBtYWlsYm94ID0ge1xuICAgIHJlYWRPbmx5OiByZXNwb25zZS5jb2RlID09PSAnUkVBRC1PTkxZJ1xuICB9XG4gIGxldCBleGlzdHNSZXNwb25zZSA9IHJlc3BvbnNlLnBheWxvYWQuRVhJU1RTICYmIHJlc3BvbnNlLnBheWxvYWQuRVhJU1RTLnBvcCgpXG4gIGxldCBmbGFnc1Jlc3BvbnNlID0gcmVzcG9uc2UucGF5bG9hZC5GTEFHUyAmJiByZXNwb25zZS5wYXlsb2FkLkZMQUdTLnBvcCgpXG4gIGxldCBva1Jlc3BvbnNlID0gcmVzcG9uc2UucGF5bG9hZC5PS1xuXG4gIGlmIChleGlzdHNSZXNwb25zZSkge1xuICAgIG1haWxib3guZXhpc3RzID0gZXhpc3RzUmVzcG9uc2UubnIgfHwgMFxuICB9XG5cbiAgaWYgKGZsYWdzUmVzcG9uc2UgJiYgZmxhZ3NSZXNwb25zZS5hdHRyaWJ1dGVzICYmIGZsYWdzUmVzcG9uc2UuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICBtYWlsYm94LmZsYWdzID0gZmxhZ3NSZXNwb25zZS5hdHRyaWJ1dGVzWzBdLm1hcCgoZmxhZykgPT4gKGZsYWcudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpKVxuICB9XG5cbiAgW10uY29uY2F0KG9rUmVzcG9uc2UgfHwgW10pLmZvckVhY2goKG9rKSA9PiB7XG4gICAgc3dpdGNoIChvayAmJiBvay5jb2RlKSB7XG4gICAgICBjYXNlICdQRVJNQU5FTlRGTEFHUyc6XG4gICAgICAgIG1haWxib3gucGVybWFuZW50RmxhZ3MgPSBbXS5jb25jYXQob2sucGVybWFuZW50ZmxhZ3MgfHwgW10pXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdVSURWQUxJRElUWSc6XG4gICAgICAgIG1haWxib3gudWlkVmFsaWRpdHkgPSBOdW1iZXIob2sudWlkdmFsaWRpdHkpIHx8IDBcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ1VJRE5FWFQnOlxuICAgICAgICBtYWlsYm94LnVpZE5leHQgPSBOdW1iZXIob2sudWlkbmV4dCkgfHwgMFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnSElHSEVTVE1PRFNFUSc6XG4gICAgICAgIG1haWxib3guaGlnaGVzdE1vZHNlcSA9IG9rLmhpZ2hlc3Rtb2RzZXEgfHwgJzAnIC8vIGtlZXAgNjRiaXQgdWludCBhcyBhIHN0cmluZ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnTk9NT0RTRVEnOlxuICAgICAgICBtYWlsYm94Lm5vTW9kc2VxID0gdHJ1ZVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfSlcblxuICByZXR1cm4gbWFpbGJveFxufVxuXG4vKipcbiAqIFBhcnNlcyBtZXNzYWdlIGVudmVsb3BlIGZyb20gRkVUQ0ggcmVzcG9uc2UuIEFsbCBrZXlzIGluIHRoZSByZXN1bHRpbmdcbiAqIG9iamVjdCBhcmUgbG93ZXJjYXNlLiBBZGRyZXNzIGZpZWxkcyBhcmUgYWxsIGFycmF5cyB3aXRoIHtuYW1lOiwgYWRkcmVzczp9XG4gKiBzdHJ1Y3R1cmVkIHZhbHVlcy4gVW5pY29kZSBzdHJpbmdzIGFyZSBhdXRvbWF0aWNhbGx5IGRlY29kZWQuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWUgRW52ZWxvcGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBFbnZlbG9wZSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRU5WRUxPUEUgKHZhbHVlKSB7XG4gIGxldCBlbnZlbG9wZSA9IHt9XG5cbiAgaWYgKHZhbHVlWzBdICYmIHZhbHVlWzBdLnZhbHVlKSB7XG4gICAgZW52ZWxvcGUuZGF0ZSA9IHZhbHVlWzBdLnZhbHVlXG4gIH1cblxuICBpZiAodmFsdWVbMV0gJiYgdmFsdWVbMV0udmFsdWUpIHtcbiAgICBlbnZlbG9wZS5zdWJqZWN0ID0gbWltZVdvcmRzRGVjb2RlKHZhbHVlWzFdICYmIHZhbHVlWzFdLnZhbHVlKVxuICB9XG5cbiAgaWYgKHZhbHVlWzJdICYmIHZhbHVlWzJdLmxlbmd0aCkge1xuICAgIGVudmVsb3BlLmZyb20gPSBwcm9jZXNzQWRkcmVzc2VzKHZhbHVlWzJdKVxuICB9XG5cbiAgaWYgKHZhbHVlWzNdICYmIHZhbHVlWzNdLmxlbmd0aCkge1xuICAgIGVudmVsb3BlLnNlbmRlciA9IHByb2Nlc3NBZGRyZXNzZXModmFsdWVbM10pXG4gIH1cblxuICBpZiAodmFsdWVbNF0gJiYgdmFsdWVbNF0ubGVuZ3RoKSB7XG4gICAgZW52ZWxvcGVbJ3JlcGx5LXRvJ10gPSBwcm9jZXNzQWRkcmVzc2VzKHZhbHVlWzRdKVxuICB9XG5cbiAgaWYgKHZhbHVlWzVdICYmIHZhbHVlWzVdLmxlbmd0aCkge1xuICAgIGVudmVsb3BlLnRvID0gcHJvY2Vzc0FkZHJlc3Nlcyh2YWx1ZVs1XSlcbiAgfVxuXG4gIGlmICh2YWx1ZVs2XSAmJiB2YWx1ZVs2XS5sZW5ndGgpIHtcbiAgICBlbnZlbG9wZS5jYyA9IHByb2Nlc3NBZGRyZXNzZXModmFsdWVbNl0pXG4gIH1cblxuICBpZiAodmFsdWVbN10gJiYgdmFsdWVbN10ubGVuZ3RoKSB7XG4gICAgZW52ZWxvcGUuYmNjID0gcHJvY2Vzc0FkZHJlc3Nlcyh2YWx1ZVs3XSlcbiAgfVxuXG4gIGlmICh2YWx1ZVs4XSAmJiB2YWx1ZVs4XS52YWx1ZSkge1xuICAgIGVudmVsb3BlWydpbi1yZXBseS10byddID0gdmFsdWVbOF0udmFsdWVcbiAgfVxuXG4gIGlmICh2YWx1ZVs5XSAmJiB2YWx1ZVs5XS52YWx1ZSkge1xuICAgIGVudmVsb3BlWydtZXNzYWdlLWlkJ10gPSB2YWx1ZVs5XS52YWx1ZVxuICB9XG5cbiAgcmV0dXJuIGVudmVsb3BlXG59XG5cbi8qXG4gKiBFTlZFTE9QRSBsaXN0cyBhZGRyZXNzZXMgYXMgW25hbWUtcGFydCwgc291cmNlLXJvdXRlLCB1c2VybmFtZSwgaG9zdG5hbWVdXG4gKiB3aGVyZSBzb3VyY2Utcm91dGUgaXMgbm90IHVzZWQgYW55bW9yZSBhbmQgY2FuIGJlIGlnbm9yZWQuXG4gKiBUbyBnZXQgY29tcGFyYWJsZSByZXN1bHRzIHdpdGggb3RoZXIgcGFydHMgb2YgdGhlIGVtYWlsLmpzIHN0YWNrXG4gKiBicm93c2VyYm94IGZlZWRzIHRoZSBwYXJzZWQgYWRkcmVzcyB2YWx1ZXMgZnJvbSBFTlZFTE9QRVxuICogdG8gYWRkcmVzc3BhcnNlciBhbmQgdXNlcyByZXN1bHRpbmcgdmFsdWVzIGluc3RlYWQgb2YgdGhlXG4gKiBwcmUtcGFyc2VkIGFkZHJlc3Nlc1xuICovXG5mdW5jdGlvbiBwcm9jZXNzQWRkcmVzc2VzIChsaXN0ID0gW10pIHtcbiAgcmV0dXJuIGxpc3QubWFwKChhZGRyKSA9PiB7XG4gICAgY29uc3QgbmFtZSA9IChwYXRoT3IoJycsIFsnMCcsICd2YWx1ZSddLCBhZGRyKSkudHJpbSgpXG4gICAgY29uc3QgYWRkcmVzcyA9IChwYXRoT3IoJycsIFsnMicsICd2YWx1ZSddLCBhZGRyKSkgKyAnQCcgKyAocGF0aE9yKCcnLCBbJzMnLCAndmFsdWUnXSwgYWRkcikpXG4gICAgY29uc3QgZm9ybWF0dGVkID0gbmFtZSA/IChlbmNvZGVBZGRyZXNzTmFtZShuYW1lKSArICcgPCcgKyBhZGRyZXNzICsgJz4nKSA6IGFkZHJlc3NcbiAgICBsZXQgcGFyc2VkID0gcGFyc2VBZGRyZXNzKGZvcm1hdHRlZCkuc2hpZnQoKSAvLyB0aGVyZSBzaG91bGQgYmUganVzdCBhIHNpbmdsZSBhZGRyZXNzXG4gICAgcGFyc2VkLm5hbWUgPSBtaW1lV29yZHNEZWNvZGUocGFyc2VkLm5hbWUpXG4gICAgcmV0dXJuIHBhcnNlZFxuICB9KVxufVxuXG4vKipcbiAqIElmIG5lZWRlZCwgZW5jbG9zZXMgd2l0aCBxdW90ZXMgb3IgbWltZSBlbmNvZGVzIHRoZSBuYW1lIHBhcnQgb2YgYW4gZS1tYWlsIGFkZHJlc3NcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBOYW1lIHBhcnQgb2YgYW4gYWRkcmVzc1xuICogQHJldHVybnMge1N0cmluZ30gTWltZSB3b3JkIGVuY29kZWQgb3IgcXVvdGVkIHN0cmluZ1xuICovXG5mdW5jdGlvbiBlbmNvZGVBZGRyZXNzTmFtZSAobmFtZSkge1xuICBpZiAoIS9eW1xcdyAnXSokLy50ZXN0KG5hbWUpKSB7XG4gICAgaWYgKC9eW1xceDIwLVxceDdlXSokLy50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobmFtZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1pbWVXb3JkRW5jb2RlKG5hbWUsICdRJywgNTIpXG4gICAgfVxuICB9XG4gIHJldHVybiBuYW1lXG59XG5cbi8qKlxuICogUGFyc2VzIG1lc3NhZ2UgYm9keSBzdHJ1Y3R1cmUgZnJvbSBGRVRDSCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZSBCT0RZU1RSVUNUVVJFIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gRW52ZWxvcGUgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJPRFlTVFJVQ1RVUkUgKG5vZGUsIHBhdGggPSBbXSkge1xuICBsZXQgY3VyTm9kZSA9IHt9XG4gIGxldCBpID0gMFxuICBsZXQgcGFydCA9IDBcblxuICBpZiAocGF0aC5sZW5ndGgpIHtcbiAgICBjdXJOb2RlLnBhcnQgPSBwYXRoLmpvaW4oJy4nKVxuICB9XG5cbiAgLy8gbXVsdGlwYXJ0XG4gIGlmIChBcnJheS5pc0FycmF5KG5vZGVbMF0pKSB7XG4gICAgY3VyTm9kZS5jaGlsZE5vZGVzID0gW11cbiAgICB3aGlsZSAoQXJyYXkuaXNBcnJheShub2RlW2ldKSkge1xuICAgICAgY3VyTm9kZS5jaGlsZE5vZGVzLnB1c2gocGFyc2VCT0RZU1RSVUNUVVJFKG5vZGVbaV0sIHBhdGguY29uY2F0KCsrcGFydCkpKVxuICAgICAgaSsrXG4gICAgfVxuXG4gICAgLy8gbXVsdGlwYXJ0IHR5cGVcbiAgICBjdXJOb2RlLnR5cGUgPSAnbXVsdGlwYXJ0LycgKyAoKG5vZGVbaSsrXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuXG4gICAgLy8gZXh0ZW5zaW9uIGRhdGEgKG5vdCBhdmFpbGFibGUgZm9yIEJPRFkgcmVxdWVzdHMpXG5cbiAgICAvLyBib2R5IHBhcmFtZXRlciBwYXJlbnRoZXNpemVkIGxpc3RcbiAgICBpZiAoaSA8IG5vZGUubGVuZ3RoIC0gMSkge1xuICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgY3VyTm9kZS5wYXJhbWV0ZXJzID0gYXR0cmlidXRlc1RvT2JqZWN0KG5vZGVbaV0pXG4gICAgICB9XG4gICAgICBpKytcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gY29udGVudCB0eXBlXG4gICAgY3VyTm9kZS50eXBlID0gW1xuICAgICAgKChub2RlW2krK10gfHwge30pLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCksICgobm9kZVtpKytdIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpXG4gICAgXS5qb2luKCcvJylcblxuICAgIC8vIGJvZHkgcGFyYW1ldGVyIHBhcmVudGhlc2l6ZWQgbGlzdFxuICAgIGlmIChub2RlW2ldKSB7XG4gICAgICBjdXJOb2RlLnBhcmFtZXRlcnMgPSBhdHRyaWJ1dGVzVG9PYmplY3Qobm9kZVtpXSlcbiAgICB9XG4gICAgaSsrXG5cbiAgICAvLyBpZFxuICAgIGlmIChub2RlW2ldKSB7XG4gICAgICBjdXJOb2RlLmlkID0gKChub2RlW2ldIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKVxuICAgIH1cbiAgICBpKytcblxuICAgIC8vIGRlc2NyaXB0aW9uXG4gICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgIGN1ck5vZGUuZGVzY3JpcHRpb24gPSAoKG5vZGVbaV0gfHwge30pLnZhbHVlIHx8ICcnKS50b1N0cmluZygpXG4gICAgfVxuICAgIGkrK1xuXG4gICAgLy8gZW5jb2RpbmdcbiAgICBpZiAobm9kZVtpXSkge1xuICAgICAgY3VyTm9kZS5lbmNvZGluZyA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgIH1cbiAgICBpKytcblxuICAgIC8vIHNpemVcbiAgICBpZiAobm9kZVtpXSkge1xuICAgICAgY3VyTm9kZS5zaXplID0gTnVtYmVyKChub2RlW2ldIHx8IHt9KS52YWx1ZSB8fCAwKSB8fCAwXG4gICAgfVxuICAgIGkrK1xuXG4gICAgaWYgKGN1ck5vZGUudHlwZSA9PT0gJ21lc3NhZ2UvcmZjODIyJykge1xuICAgICAgLy8gbWVzc2FnZS9yZmMgYWRkcyBhZGRpdGlvbmFsIGVudmVsb3BlLCBib2R5c3RydWN0dXJlIGFuZCBsaW5lIGNvdW50IHZhbHVlc1xuXG4gICAgICAvLyBlbnZlbG9wZVxuICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgY3VyTm9kZS5lbnZlbG9wZSA9IHBhcnNlRU5WRUxPUEUoW10uY29uY2F0KG5vZGVbaV0gfHwgW10pKVxuICAgICAgfVxuICAgICAgaSsrXG5cbiAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgIGN1ck5vZGUuY2hpbGROb2RlcyA9IFtcbiAgICAgICAgICAvLyByZmM4MjIgYm9keXBhcnRzIHNoYXJlIHRoZSBzYW1lIHBhdGgsIGRpZmZlcmVuY2UgaXMgYmV0d2VlbiBNSU1FIGFuZCBIRUFERVJcbiAgICAgICAgICAvLyBwYXRoLk1JTUUgcmV0dXJucyBtZXNzYWdlL3JmYzgyMiBoZWFkZXJcbiAgICAgICAgICAvLyBwYXRoLkhFQURFUiByZXR1cm5zIGlubGluZWQgbWVzc2FnZSBoZWFkZXJcbiAgICAgICAgICBwYXJzZUJPRFlTVFJVQ1RVUkUobm9kZVtpXSwgcGF0aClcbiAgICAgICAgXVxuICAgICAgfVxuICAgICAgaSsrXG5cbiAgICAgIC8vIGxpbmUgY291bnRcbiAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgIGN1ck5vZGUubGluZUNvdW50ID0gTnVtYmVyKChub2RlW2ldIHx8IHt9KS52YWx1ZSB8fCAwKSB8fCAwXG4gICAgICB9XG4gICAgICBpKytcbiAgICB9IGVsc2UgaWYgKC9edGV4dFxcLy8udGVzdChjdXJOb2RlLnR5cGUpKSB7XG4gICAgICAvLyB0ZXh0LyogYWRkcyBhZGRpdGlvbmFsIGxpbmUgY291bnQgdmFsdWVzXG5cbiAgICAgIC8vIGxpbmUgY291bnRcbiAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgIGN1ck5vZGUubGluZUNvdW50ID0gTnVtYmVyKChub2RlW2ldIHx8IHt9KS52YWx1ZSB8fCAwKSB8fCAwXG4gICAgICB9XG4gICAgICBpKytcbiAgICB9XG5cbiAgICAvLyBleHRlbnNpb24gZGF0YSAobm90IGF2YWlsYWJsZSBmb3IgQk9EWSByZXF1ZXN0cylcblxuICAgIC8vIG1kNVxuICAgIGlmIChpIDwgbm9kZS5sZW5ndGggLSAxKSB7XG4gICAgICBpZiAobm9kZVtpXSkge1xuICAgICAgICBjdXJOb2RlLm1kNSA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgfVxuICAgICAgaSsrXG4gICAgfVxuICB9XG5cbiAgLy8gdGhlIGZvbGxvd2luZyBhcmUgc2hhcmVkIGV4dGVuc2lvbiB2YWx1ZXMgKGZvciBib3RoIG11bHRpcGFydCBhbmQgbm9uLW11bHRpcGFydCBwYXJ0cylcbiAgLy8gbm90IGF2YWlsYWJsZSBmb3IgQk9EWSByZXF1ZXN0c1xuXG4gIC8vIGJvZHkgZGlzcG9zaXRpb25cbiAgaWYgKGkgPCBub2RlLmxlbmd0aCAtIDEpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlW2ldKSAmJiBub2RlW2ldLmxlbmd0aCkge1xuICAgICAgY3VyTm9kZS5kaXNwb3NpdGlvbiA9ICgobm9kZVtpXVswXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZVtpXVsxXSkpIHtcbiAgICAgICAgY3VyTm9kZS5kaXNwb3NpdGlvblBhcmFtZXRlcnMgPSBhdHRyaWJ1dGVzVG9PYmplY3Qobm9kZVtpXVsxXSlcbiAgICAgIH1cbiAgICB9XG4gICAgaSsrXG4gIH1cblxuICAvLyBib2R5IGxhbmd1YWdlXG4gIGlmIChpIDwgbm9kZS5sZW5ndGggLSAxKSB7XG4gICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgIGN1ck5vZGUubGFuZ3VhZ2UgPSBbXS5jb25jYXQobm9kZVtpXSkubWFwKCh2YWwpID0+IHByb3BPcignJywgJ3ZhbHVlJywgdmFsKS50b0xvd2VyQ2FzZSgpKVxuICAgIH1cbiAgICBpKytcbiAgfVxuXG4gIC8vIGJvZHkgbG9jYXRpb25cbiAgLy8gTkIhIGRlZmluZWQgYXMgYSBcInN0cmluZyBsaXN0XCIgaW4gUkZDMzUwMSBidXQgcmVwbGFjZWQgaW4gZXJyYXRhIGRvY3VtZW50IHdpdGggXCJzdHJpbmdcIlxuICAvLyBFcnJhdGE6IGh0dHA6Ly93d3cucmZjLWVkaXRvci5vcmcvZXJyYXRhX3NlYXJjaC5waHA/cmZjPTM1MDFcbiAgaWYgKGkgPCBub2RlLmxlbmd0aCAtIDEpIHtcbiAgICBpZiAobm9kZVtpXSkge1xuICAgICAgY3VyTm9kZS5sb2NhdGlvbiA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKClcbiAgICB9XG4gICAgaSsrXG4gIH1cblxuICByZXR1cm4gY3VyTm9kZVxufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVzVG9PYmplY3QgKGF0dHJzID0gW10sIGtleVRyYW5zZm9ybSA9IHRvTG93ZXIsIHZhbHVlVHJhbnNmb3JtID0gbWltZVdvcmRzRGVjb2RlKSB7XG4gIGNvbnN0IHZhbHMgPSBhdHRycy5tYXAocHJvcCgndmFsdWUnKSlcbiAgY29uc3Qga2V5cyA9IHZhbHMuZmlsdGVyKChfLCBpKSA9PiBpICUgMiA9PT0gMCkubWFwKGtleVRyYW5zZm9ybSlcbiAgY29uc3QgdmFsdWVzID0gdmFscy5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAxKS5tYXAodmFsdWVUcmFuc2Zvcm0pXG4gIHJldHVybiBmcm9tUGFpcnMoemlwKGtleXMsIHZhbHVlcykpXG59XG5cbi8qKlxuICogUGFyc2VzIEZFVENIIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IE1lc3NhZ2Ugb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZFVENIIChyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5wYXlsb2FkIHx8ICFyZXNwb25zZS5wYXlsb2FkLkZFVENIIHx8ICFyZXNwb25zZS5wYXlsb2FkLkZFVENILmxlbmd0aCkge1xuICAgIHJldHVybiBbXVxuICB9XG5cbiAgbGV0IGxpc3QgPSBbXVxuICBsZXQgbWVzc2FnZXMgPSB7fVxuXG4gIHJlc3BvbnNlLnBheWxvYWQuRkVUQ0guZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIGxldCBwYXJhbXMgPSBbXS5jb25jYXQoW10uY29uY2F0KGl0ZW0uYXR0cmlidXRlcyB8fCBbXSlbMF0gfHwgW10pIC8vIGVuc3VyZSB0aGUgZmlyc3QgdmFsdWUgaXMgYW4gYXJyYXlcbiAgICBsZXQgbWVzc2FnZVxuICAgIGxldCBpLCBsZW4sIGtleVxuXG4gICAgaWYgKG1lc3NhZ2VzW2l0ZW0ubnJdKSB7XG4gICAgICAvLyBzYW1lIHNlcXVlbmNlIG51bWJlciBpcyBhbHJlYWR5IHVzZWQsIHNvIG1lcmdlIHZhbHVlcyBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG1lc3NhZ2Ugb2JqZWN0XG4gICAgICBtZXNzYWdlID0gbWVzc2FnZXNbaXRlbS5ucl1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZXNbaXRlbS5ucl0gPSBtZXNzYWdlID0ge1xuICAgICAgICAnIyc6IGl0ZW0ubnJcbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChtZXNzYWdlKVxuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIGxlbiA9IHBhcmFtcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKGkgJSAyID09PSAwKSB7XG4gICAgICAgIGtleSA9IGNvbXBpbGVyKHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBbcGFyYW1zW2ldXVxuICAgICAgICB9KS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLzxcXGQrPiQvLCAnJylcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIG1lc3NhZ2Vba2V5XSA9IHBhcnNlRmV0Y2hWYWx1ZShrZXksIHBhcmFtc1tpXSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGxpc3Rcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBzaW5nbGUgdmFsdWUgZnJvbSB0aGUgRkVUQ0ggcmVzcG9uc2Ugb2JqZWN0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBLZXkgbmFtZSAodXBwZXJjYXNlKVxuICogQHBhcmFtIHtNaXplZH0gdmFsdWUgVmFsdWUgZm9yIHRoZSBrZXlcbiAqIEByZXR1cm4ge01peGVkfSBQcm9jZXNzZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gcGFyc2VGZXRjaFZhbHVlIChrZXksIHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICBjYXNlICd1aWQnOlxuICAgICAgY2FzZSAncmZjODIyLnNpemUnOlxuICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlLnZhbHVlKSB8fCAwXG4gICAgICBjYXNlICdtb2RzZXEnOiAvLyBkbyBub3QgY2FzdCA2NCBiaXQgdWludCB0byBhIG51bWJlclxuICAgICAgICByZXR1cm4gdmFsdWUudmFsdWUgfHwgJzAnXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS52YWx1ZVxuICB9XG5cbiAgc3dpdGNoIChrZXkpIHtcbiAgICBjYXNlICdmbGFncyc6XG4gICAgY2FzZSAneC1nbS1sYWJlbHMnOlxuICAgICAgdmFsdWUgPSBbXS5jb25jYXQodmFsdWUpLm1hcCgoZmxhZykgPT4gKGZsYWcudmFsdWUgfHwgJycpKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdlbnZlbG9wZSc6XG4gICAgICB2YWx1ZSA9IHBhcnNlRU5WRUxPUEUoW10uY29uY2F0KHZhbHVlIHx8IFtdKSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYm9keXN0cnVjdHVyZSc6XG4gICAgICB2YWx1ZSA9IHBhcnNlQk9EWVNUUlVDVFVSRShbXS5jb25jYXQodmFsdWUgfHwgW10pKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdtb2RzZXEnOlxuICAgICAgdmFsdWUgPSAodmFsdWUuc2hpZnQoKSB8fCB7fSkudmFsdWUgfHwgJzAnXG4gICAgICBicmVha1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8qKlxuICogUGFyc2VzIFNFQVJDSCByZXNwb25zZS4gR2F0aGVycyBhbGwgdW50YWdnZWQgU0VBUkNIIHJlc3BvbnNlcywgZmV0Y2hlZCBzZXEuL3VpZCBudW1iZXJzXG4gKiBhbmQgY29tcGlsZXMgdGhlc2UgaW50byBhIHNvcnRlZCBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAqIEByZXR1cm4ge09iamVjdH0gTWVzc2FnZSBvYmplY3RcbiAqIEBwYXJhbSB7QXJyYXl9IFNvcnRlZCBTZXEuL1VJRCBudW1iZXIgbGlzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTRUFSQ0ggKHJlc3BvbnNlKSB7XG4gIHJldHVybiBwaXBlKFxuICAgIHBhdGhPcihbXSwgWydwYXlsb2FkJywgJ1NFQVJDSCddKSxcbiAgICBtYXAoeCA9PiB4LmF0dHJpYnV0ZXMgfHwgW10pLFxuICAgIGZsYXR0ZW4sXG4gICAgbWFwKG5yID0+IE51bWJlcihwcm9wT3IobnIgfHwgMCwgJ3ZhbHVlJywgbnIpKSB8fCAwKSxcbiAgICBzb3J0KChhLCBiKSA9PiBhID4gYilcbiAgKShyZXNwb25zZSlcbn1cbiJdfQ==