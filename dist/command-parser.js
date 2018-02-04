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

  let attributes = [].concat(response.payload.NAMESPACE.pop().attributes || []);
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
  return element.map(ns => {
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

  let mailbox = {
    readOnly: response.code === 'READ-ONLY'
  };
  let existsResponse = response.payload.EXISTS && response.payload.EXISTS.pop();
  let flagsResponse = response.payload.FLAGS && response.payload.FLAGS.pop();
  let okResponse = response.payload.OK;

  if (existsResponse) {
    mailbox.exists = existsResponse.nr || 0;
  }

  if (flagsResponse && flagsResponse.attributes && flagsResponse.attributes.length) {
    mailbox.flags = flagsResponse.attributes[0].map(flag => (flag.value || '').toString().trim());
  }

  [].concat(okResponse || []).forEach(ok => {
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
  let envelope = {};

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
function processAddresses(list = []) {
  return list.map(addr => {
    const name = (0, _ramda.pathOr)('', ['0', 'value'], addr).trim();
    const address = (0, _ramda.pathOr)('', ['2', 'value'], addr) + '@' + (0, _ramda.pathOr)('', ['3', 'value'], addr);
    const formatted = name ? encodeAddressName(name) + ' <' + address + '>' : address;
    let parsed = (0, _emailjsAddressparser2.default)(formatted).shift(); // there should be just a single address
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
function parseBODYSTRUCTURE(node, path = []) {
  let curNode = {};
  let i = 0;
  let part = 0;

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
      curNode.language = [].concat(node[i]).map(val => (0, _ramda.propOr)('', 'value', val).toLowerCase());
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

function attributesToObject(attrs = [], keyTransform = _ramda.toLower, valueTransform = _emailjsMimeCodec.mimeWordsDecode) {
  const vals = attrs.map((0, _ramda.prop)('value'));
  const keys = vals.filter((_, i) => i % 2 === 0).map(keyTransform);
  const values = vals.filter((_, i) => i % 2 === 1).map(valueTransform);
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

  let list = [];
  let messages = {};

  response.payload.FETCH.forEach(item => {
    let params = [].concat([].concat(item.attributes || [])[0] || []); // ensure the first value is an array
    let message;
    let i, len, key;

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
      value = [].concat(value).map(flag => flag.value || '');
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
  return (0, _ramda.pipe)((0, _ramda.pathOr)([], ['payload', 'SEARCH']), (0, _ramda.map)(x => x.attributes || []), _ramda.flatten, (0, _ramda.map)(nr => Number((0, _ramda.propOr)(nr || 0, 'value', nr)) || 0), (0, _ramda.sort)((a, b) => a > b))(response);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21tYW5kLXBhcnNlci5qcyJdLCJuYW1lcyI6WyJwYXJzZU5BTUVTUEFDRSIsInBhcnNlTkFNRVNQQUNFRWxlbWVudCIsInBhcnNlU0VMRUNUIiwicGFyc2VFTlZFTE9QRSIsInBhcnNlQk9EWVNUUlVDVFVSRSIsInBhcnNlRkVUQ0giLCJwYXJzZVNFQVJDSCIsInJlc3BvbnNlIiwicGF5bG9hZCIsIk5BTUVTUEFDRSIsImxlbmd0aCIsImF0dHJpYnV0ZXMiLCJjb25jYXQiLCJwb3AiLCJwZXJzb25hbCIsInVzZXJzIiwic2hhcmVkIiwiZWxlbWVudCIsIm1hcCIsIm5zIiwicHJlZml4IiwidmFsdWUiLCJkZWxpbWl0ZXIiLCJtYWlsYm94IiwicmVhZE9ubHkiLCJjb2RlIiwiZXhpc3RzUmVzcG9uc2UiLCJFWElTVFMiLCJmbGFnc1Jlc3BvbnNlIiwiRkxBR1MiLCJva1Jlc3BvbnNlIiwiT0siLCJleGlzdHMiLCJuciIsImZsYWdzIiwiZmxhZyIsInRvU3RyaW5nIiwidHJpbSIsImZvckVhY2giLCJvayIsInBlcm1hbmVudEZsYWdzIiwicGVybWFuZW50ZmxhZ3MiLCJ1aWRWYWxpZGl0eSIsIk51bWJlciIsInVpZHZhbGlkaXR5IiwidWlkTmV4dCIsInVpZG5leHQiLCJoaWdoZXN0TW9kc2VxIiwiaGlnaGVzdG1vZHNlcSIsIm5vTW9kc2VxIiwiZW52ZWxvcGUiLCJkYXRlIiwic3ViamVjdCIsImZyb20iLCJwcm9jZXNzQWRkcmVzc2VzIiwic2VuZGVyIiwidG8iLCJjYyIsImJjYyIsImxpc3QiLCJhZGRyIiwibmFtZSIsImFkZHJlc3MiLCJmb3JtYXR0ZWQiLCJlbmNvZGVBZGRyZXNzTmFtZSIsInBhcnNlZCIsInNoaWZ0IiwidGVzdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJub2RlIiwicGF0aCIsImN1ck5vZGUiLCJpIiwicGFydCIsImpvaW4iLCJBcnJheSIsImlzQXJyYXkiLCJjaGlsZE5vZGVzIiwicHVzaCIsInR5cGUiLCJ0b0xvd2VyQ2FzZSIsInBhcmFtZXRlcnMiLCJhdHRyaWJ1dGVzVG9PYmplY3QiLCJpZCIsImRlc2NyaXB0aW9uIiwiZW5jb2RpbmciLCJzaXplIiwibGluZUNvdW50IiwibWQ1IiwiZGlzcG9zaXRpb24iLCJkaXNwb3NpdGlvblBhcmFtZXRlcnMiLCJsYW5ndWFnZSIsInZhbCIsImxvY2F0aW9uIiwiYXR0cnMiLCJrZXlUcmFuc2Zvcm0iLCJ2YWx1ZVRyYW5zZm9ybSIsInZhbHMiLCJrZXlzIiwiZmlsdGVyIiwiXyIsInZhbHVlcyIsIkZFVENIIiwibWVzc2FnZXMiLCJpdGVtIiwicGFyYW1zIiwibWVzc2FnZSIsImxlbiIsImtleSIsInJlcGxhY2UiLCJwYXJzZUZldGNoVmFsdWUiLCJ4IiwiYSIsImIiXSwibWFwcGluZ3MiOiI7Ozs7O1FBV2dCQSxjLEdBQUFBLGM7UUF1QkFDLHFCLEdBQUFBLHFCO1FBd0JBQyxXLEdBQUFBLFc7UUFtREFDLGEsR0FBQUEsYTtRQXdGQUMsa0IsR0FBQUEsa0I7UUE4SkFDLFUsR0FBQUEsVTtRQXVGQUMsVyxHQUFBQSxXOztBQTFiaEI7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBOzs7Ozs7QUFNTyxTQUFTTixjQUFULENBQXlCTyxRQUF6QixFQUFtQztBQUN4QyxNQUFJLENBQUNBLFNBQVNDLE9BQVYsSUFBcUIsQ0FBQ0QsU0FBU0MsT0FBVCxDQUFpQkMsU0FBdkMsSUFBb0QsQ0FBQ0YsU0FBU0MsT0FBVCxDQUFpQkMsU0FBakIsQ0FBMkJDLE1BQXBGLEVBQTRGO0FBQzFGLFdBQU8sS0FBUDtBQUNEOztBQUVELE1BQUlDLGFBQWEsR0FBR0MsTUFBSCxDQUFVTCxTQUFTQyxPQUFULENBQWlCQyxTQUFqQixDQUEyQkksR0FBM0IsR0FBaUNGLFVBQWpDLElBQStDLEVBQXpELENBQWpCO0FBQ0EsTUFBSSxDQUFDQSxXQUFXRCxNQUFoQixFQUF3QjtBQUN0QixXQUFPLEtBQVA7QUFDRDs7QUFFRCxTQUFPO0FBQ0xJLGNBQVViLHNCQUFzQlUsV0FBVyxDQUFYLENBQXRCLENBREw7QUFFTEksV0FBT2Qsc0JBQXNCVSxXQUFXLENBQVgsQ0FBdEIsQ0FGRjtBQUdMSyxZQUFRZixzQkFBc0JVLFdBQVcsQ0FBWCxDQUF0QjtBQUhILEdBQVA7QUFLRDs7QUFFRDs7Ozs7O0FBTU8sU0FBU1YscUJBQVQsQ0FBZ0NnQixPQUFoQyxFQUF5QztBQUM5QyxNQUFJLENBQUNBLE9BQUwsRUFBYztBQUNaLFdBQU8sS0FBUDtBQUNEOztBQUVEQSxZQUFVLEdBQUdMLE1BQUgsQ0FBVUssV0FBVyxFQUFyQixDQUFWO0FBQ0EsU0FBT0EsUUFBUUMsR0FBUixDQUFhQyxFQUFELElBQVE7QUFDekIsUUFBSSxDQUFDQSxFQUFELElBQU8sQ0FBQ0EsR0FBR1QsTUFBZixFQUF1QjtBQUNyQixhQUFPLEtBQVA7QUFDRDs7QUFFRCxXQUFPO0FBQ0xVLGNBQVFELEdBQUcsQ0FBSCxFQUFNRSxLQURUO0FBRUxDLGlCQUFXSCxHQUFHLENBQUgsS0FBU0EsR0FBRyxDQUFILEVBQU1FLEtBRnJCLENBRTJCO0FBRjNCLEtBQVA7QUFJRCxHQVRNLENBQVA7QUFVRDs7QUFFRDs7Ozs7O0FBTU8sU0FBU25CLFdBQVQsQ0FBc0JLLFFBQXRCLEVBQWdDO0FBQ3JDLE1BQUksQ0FBQ0EsUUFBRCxJQUFhLENBQUNBLFNBQVNDLE9BQTNCLEVBQW9DO0FBQ2xDO0FBQ0Q7O0FBRUQsTUFBSWUsVUFBVTtBQUNaQyxjQUFVakIsU0FBU2tCLElBQVQsS0FBa0I7QUFEaEIsR0FBZDtBQUdBLE1BQUlDLGlCQUFpQm5CLFNBQVNDLE9BQVQsQ0FBaUJtQixNQUFqQixJQUEyQnBCLFNBQVNDLE9BQVQsQ0FBaUJtQixNQUFqQixDQUF3QmQsR0FBeEIsRUFBaEQ7QUFDQSxNQUFJZSxnQkFBZ0JyQixTQUFTQyxPQUFULENBQWlCcUIsS0FBakIsSUFBMEJ0QixTQUFTQyxPQUFULENBQWlCcUIsS0FBakIsQ0FBdUJoQixHQUF2QixFQUE5QztBQUNBLE1BQUlpQixhQUFhdkIsU0FBU0MsT0FBVCxDQUFpQnVCLEVBQWxDOztBQUVBLE1BQUlMLGNBQUosRUFBb0I7QUFDbEJILFlBQVFTLE1BQVIsR0FBaUJOLGVBQWVPLEVBQWYsSUFBcUIsQ0FBdEM7QUFDRDs7QUFFRCxNQUFJTCxpQkFBaUJBLGNBQWNqQixVQUEvQixJQUE2Q2lCLGNBQWNqQixVQUFkLENBQXlCRCxNQUExRSxFQUFrRjtBQUNoRmEsWUFBUVcsS0FBUixHQUFnQk4sY0FBY2pCLFVBQWQsQ0FBeUIsQ0FBekIsRUFBNEJPLEdBQTVCLENBQWlDaUIsSUFBRCxJQUFVLENBQUNBLEtBQUtkLEtBQUwsSUFBYyxFQUFmLEVBQW1CZSxRQUFuQixHQUE4QkMsSUFBOUIsRUFBMUMsQ0FBaEI7QUFDRDs7QUFFRCxLQUFHekIsTUFBSCxDQUFVa0IsY0FBYyxFQUF4QixFQUE0QlEsT0FBNUIsQ0FBcUNDLEVBQUQsSUFBUTtBQUMxQyxZQUFRQSxNQUFNQSxHQUFHZCxJQUFqQjtBQUNFLFdBQUssZ0JBQUw7QUFDRUYsZ0JBQVFpQixjQUFSLEdBQXlCLEdBQUc1QixNQUFILENBQVUyQixHQUFHRSxjQUFILElBQXFCLEVBQS9CLENBQXpCO0FBQ0E7QUFDRixXQUFLLGFBQUw7QUFDRWxCLGdCQUFRbUIsV0FBUixHQUFzQkMsT0FBT0osR0FBR0ssV0FBVixLQUEwQixDQUFoRDtBQUNBO0FBQ0YsV0FBSyxTQUFMO0FBQ0VyQixnQkFBUXNCLE9BQVIsR0FBa0JGLE9BQU9KLEdBQUdPLE9BQVYsS0FBc0IsQ0FBeEM7QUFDQTtBQUNGLFdBQUssZUFBTDtBQUNFdkIsZ0JBQVF3QixhQUFSLEdBQXdCUixHQUFHUyxhQUFILElBQW9CLEdBQTVDLENBREYsQ0FDa0Q7QUFDaEQ7QUFDRixXQUFLLFVBQUw7QUFDRXpCLGdCQUFRMEIsUUFBUixHQUFtQixJQUFuQjtBQUNBO0FBZko7QUFpQkQsR0FsQkQ7O0FBb0JBLFNBQU8xQixPQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O0FBUU8sU0FBU3BCLGFBQVQsQ0FBd0JrQixLQUF4QixFQUErQjtBQUNwQyxNQUFJNkIsV0FBVyxFQUFmOztBQUVBLE1BQUk3QixNQUFNLENBQU4sS0FBWUEsTUFBTSxDQUFOLEVBQVNBLEtBQXpCLEVBQWdDO0FBQzlCNkIsYUFBU0MsSUFBVCxHQUFnQjlCLE1BQU0sQ0FBTixFQUFTQSxLQUF6QjtBQUNEOztBQUVELE1BQUlBLE1BQU0sQ0FBTixLQUFZQSxNQUFNLENBQU4sRUFBU0EsS0FBekIsRUFBZ0M7QUFDOUI2QixhQUFTRSxPQUFULEdBQW1CLHVDQUFnQi9CLE1BQU0sQ0FBTixLQUFZQSxNQUFNLENBQU4sRUFBU0EsS0FBckMsQ0FBbkI7QUFDRDs7QUFFRCxNQUFJQSxNQUFNLENBQU4sS0FBWUEsTUFBTSxDQUFOLEVBQVNYLE1BQXpCLEVBQWlDO0FBQy9Cd0MsYUFBU0csSUFBVCxHQUFnQkMsaUJBQWlCakMsTUFBTSxDQUFOLENBQWpCLENBQWhCO0FBQ0Q7O0FBRUQsTUFBSUEsTUFBTSxDQUFOLEtBQVlBLE1BQU0sQ0FBTixFQUFTWCxNQUF6QixFQUFpQztBQUMvQndDLGFBQVNLLE1BQVQsR0FBa0JELGlCQUFpQmpDLE1BQU0sQ0FBTixDQUFqQixDQUFsQjtBQUNEOztBQUVELE1BQUlBLE1BQU0sQ0FBTixLQUFZQSxNQUFNLENBQU4sRUFBU1gsTUFBekIsRUFBaUM7QUFDL0J3QyxhQUFTLFVBQVQsSUFBdUJJLGlCQUFpQmpDLE1BQU0sQ0FBTixDQUFqQixDQUF2QjtBQUNEOztBQUVELE1BQUlBLE1BQU0sQ0FBTixLQUFZQSxNQUFNLENBQU4sRUFBU1gsTUFBekIsRUFBaUM7QUFDL0J3QyxhQUFTTSxFQUFULEdBQWNGLGlCQUFpQmpDLE1BQU0sQ0FBTixDQUFqQixDQUFkO0FBQ0Q7O0FBRUQsTUFBSUEsTUFBTSxDQUFOLEtBQVlBLE1BQU0sQ0FBTixFQUFTWCxNQUF6QixFQUFpQztBQUMvQndDLGFBQVNPLEVBQVQsR0FBY0gsaUJBQWlCakMsTUFBTSxDQUFOLENBQWpCLENBQWQ7QUFDRDs7QUFFRCxNQUFJQSxNQUFNLENBQU4sS0FBWUEsTUFBTSxDQUFOLEVBQVNYLE1BQXpCLEVBQWlDO0FBQy9Cd0MsYUFBU1EsR0FBVCxHQUFlSixpQkFBaUJqQyxNQUFNLENBQU4sQ0FBakIsQ0FBZjtBQUNEOztBQUVELE1BQUlBLE1BQU0sQ0FBTixLQUFZQSxNQUFNLENBQU4sRUFBU0EsS0FBekIsRUFBZ0M7QUFDOUI2QixhQUFTLGFBQVQsSUFBMEI3QixNQUFNLENBQU4sRUFBU0EsS0FBbkM7QUFDRDs7QUFFRCxNQUFJQSxNQUFNLENBQU4sS0FBWUEsTUFBTSxDQUFOLEVBQVNBLEtBQXpCLEVBQWdDO0FBQzlCNkIsYUFBUyxZQUFULElBQXlCN0IsTUFBTSxDQUFOLEVBQVNBLEtBQWxDO0FBQ0Q7O0FBRUQsU0FBTzZCLFFBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7QUFRQSxTQUFTSSxnQkFBVCxDQUEyQkssT0FBTyxFQUFsQyxFQUFzQztBQUNwQyxTQUFPQSxLQUFLekMsR0FBTCxDQUFVMEMsSUFBRCxJQUFVO0FBQ3hCLFVBQU1DLE9BQVEsbUJBQU8sRUFBUCxFQUFXLENBQUMsR0FBRCxFQUFNLE9BQU4sQ0FBWCxFQUEyQkQsSUFBM0IsQ0FBRCxDQUFtQ3ZCLElBQW5DLEVBQWI7QUFDQSxVQUFNeUIsVUFBVyxtQkFBTyxFQUFQLEVBQVcsQ0FBQyxHQUFELEVBQU0sT0FBTixDQUFYLEVBQTJCRixJQUEzQixDQUFELEdBQXFDLEdBQXJDLEdBQTRDLG1CQUFPLEVBQVAsRUFBVyxDQUFDLEdBQUQsRUFBTSxPQUFOLENBQVgsRUFBMkJBLElBQTNCLENBQTVEO0FBQ0EsVUFBTUcsWUFBWUYsT0FBUUcsa0JBQWtCSCxJQUFsQixJQUEwQixJQUExQixHQUFpQ0MsT0FBakMsR0FBMkMsR0FBbkQsR0FBMERBLE9BQTVFO0FBQ0EsUUFBSUcsU0FBUyxvQ0FBYUYsU0FBYixFQUF3QkcsS0FBeEIsRUFBYixDQUp3QixDQUlxQjtBQUM3Q0QsV0FBT0osSUFBUCxHQUFjLHVDQUFnQkksT0FBT0osSUFBdkIsQ0FBZDtBQUNBLFdBQU9JLE1BQVA7QUFDRCxHQVBNLENBQVA7QUFRRDs7QUFFRDs7Ozs7O0FBTUEsU0FBU0QsaUJBQVQsQ0FBNEJILElBQTVCLEVBQWtDO0FBQ2hDLE1BQUksQ0FBQyxZQUFZTSxJQUFaLENBQWlCTixJQUFqQixDQUFMLEVBQTZCO0FBQzNCLFFBQUksaUJBQWlCTSxJQUFqQixDQUFzQk4sSUFBdEIsQ0FBSixFQUFpQztBQUMvQixhQUFPTyxLQUFLQyxTQUFMLENBQWVSLElBQWYsQ0FBUDtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8sc0NBQWVBLElBQWYsRUFBcUIsR0FBckIsRUFBMEIsRUFBMUIsQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxTQUFPQSxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztBQU1PLFNBQVN6RCxrQkFBVCxDQUE2QmtFLElBQTdCLEVBQW1DQyxPQUFPLEVBQTFDLEVBQThDO0FBQ25ELE1BQUlDLFVBQVUsRUFBZDtBQUNBLE1BQUlDLElBQUksQ0FBUjtBQUNBLE1BQUlDLE9BQU8sQ0FBWDs7QUFFQSxNQUFJSCxLQUFLN0QsTUFBVCxFQUFpQjtBQUNmOEQsWUFBUUUsSUFBUixHQUFlSCxLQUFLSSxJQUFMLENBQVUsR0FBVixDQUFmO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJQyxNQUFNQyxPQUFOLENBQWNQLEtBQUssQ0FBTCxDQUFkLENBQUosRUFBNEI7QUFDMUJFLFlBQVFNLFVBQVIsR0FBcUIsRUFBckI7QUFDQSxXQUFPRixNQUFNQyxPQUFOLENBQWNQLEtBQUtHLENBQUwsQ0FBZCxDQUFQLEVBQStCO0FBQzdCRCxjQUFRTSxVQUFSLENBQW1CQyxJQUFuQixDQUF3QjNFLG1CQUFtQmtFLEtBQUtHLENBQUwsQ0FBbkIsRUFBNEJGLEtBQUszRCxNQUFMLENBQVksRUFBRThELElBQWQsQ0FBNUIsQ0FBeEI7QUFDQUQ7QUFDRDs7QUFFRDtBQUNBRCxZQUFRUSxJQUFSLEdBQWUsZUFBZSxDQUFDLENBQUNWLEtBQUtHLEdBQUwsS0FBYSxFQUFkLEVBQWtCcEQsS0FBbEIsSUFBMkIsRUFBNUIsRUFBZ0NlLFFBQWhDLEdBQTJDNkMsV0FBM0MsRUFBOUI7O0FBRUE7O0FBRUE7QUFDQSxRQUFJUixJQUFJSCxLQUFLNUQsTUFBTCxHQUFjLENBQXRCLEVBQXlCO0FBQ3ZCLFVBQUk0RCxLQUFLRyxDQUFMLENBQUosRUFBYTtBQUNYRCxnQkFBUVUsVUFBUixHQUFxQkMsbUJBQW1CYixLQUFLRyxDQUFMLENBQW5CLENBQXJCO0FBQ0Q7QUFDREE7QUFDRDtBQUNGLEdBbkJELE1BbUJPO0FBQ0w7QUFDQUQsWUFBUVEsSUFBUixHQUFlLENBQ2IsQ0FBQyxDQUFDVixLQUFLRyxHQUFMLEtBQWEsRUFBZCxFQUFrQnBELEtBQWxCLElBQTJCLEVBQTVCLEVBQWdDZSxRQUFoQyxHQUEyQzZDLFdBQTNDLEVBRGEsRUFDNkMsQ0FBQyxDQUFDWCxLQUFLRyxHQUFMLEtBQWEsRUFBZCxFQUFrQnBELEtBQWxCLElBQTJCLEVBQTVCLEVBQWdDZSxRQUFoQyxHQUEyQzZDLFdBQTNDLEVBRDdDLEVBRWJOLElBRmEsQ0FFUixHQUZRLENBQWY7O0FBSUE7QUFDQSxRQUFJTCxLQUFLRyxDQUFMLENBQUosRUFBYTtBQUNYRCxjQUFRVSxVQUFSLEdBQXFCQyxtQkFBbUJiLEtBQUtHLENBQUwsQ0FBbkIsQ0FBckI7QUFDRDtBQUNEQTs7QUFFQTtBQUNBLFFBQUlILEtBQUtHLENBQUwsQ0FBSixFQUFhO0FBQ1hELGNBQVFZLEVBQVIsR0FBYSxDQUFDLENBQUNkLEtBQUtHLENBQUwsS0FBVyxFQUFaLEVBQWdCcEQsS0FBaEIsSUFBeUIsRUFBMUIsRUFBOEJlLFFBQTlCLEVBQWI7QUFDRDtBQUNEcUM7O0FBRUE7QUFDQSxRQUFJSCxLQUFLRyxDQUFMLENBQUosRUFBYTtBQUNYRCxjQUFRYSxXQUFSLEdBQXNCLENBQUMsQ0FBQ2YsS0FBS0csQ0FBTCxLQUFXLEVBQVosRUFBZ0JwRCxLQUFoQixJQUF5QixFQUExQixFQUE4QmUsUUFBOUIsRUFBdEI7QUFDRDtBQUNEcUM7O0FBRUE7QUFDQSxRQUFJSCxLQUFLRyxDQUFMLENBQUosRUFBYTtBQUNYRCxjQUFRYyxRQUFSLEdBQW1CLENBQUMsQ0FBQ2hCLEtBQUtHLENBQUwsS0FBVyxFQUFaLEVBQWdCcEQsS0FBaEIsSUFBeUIsRUFBMUIsRUFBOEJlLFFBQTlCLEdBQXlDNkMsV0FBekMsRUFBbkI7QUFDRDtBQUNEUjs7QUFFQTtBQUNBLFFBQUlILEtBQUtHLENBQUwsQ0FBSixFQUFhO0FBQ1hELGNBQVFlLElBQVIsR0FBZTVDLE9BQU8sQ0FBQzJCLEtBQUtHLENBQUwsS0FBVyxFQUFaLEVBQWdCcEQsS0FBaEIsSUFBeUIsQ0FBaEMsS0FBc0MsQ0FBckQ7QUFDRDtBQUNEb0Q7O0FBRUEsUUFBSUQsUUFBUVEsSUFBUixLQUFpQixnQkFBckIsRUFBdUM7QUFDckM7O0FBRUE7QUFDQSxVQUFJVixLQUFLRyxDQUFMLENBQUosRUFBYTtBQUNYRCxnQkFBUXRCLFFBQVIsR0FBbUIvQyxjQUFjLEdBQUdTLE1BQUgsQ0FBVTBELEtBQUtHLENBQUwsS0FBVyxFQUFyQixDQUFkLENBQW5CO0FBQ0Q7QUFDREE7O0FBRUEsVUFBSUgsS0FBS0csQ0FBTCxDQUFKLEVBQWE7QUFDWEQsZ0JBQVFNLFVBQVIsR0FBcUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0ExRSwyQkFBbUJrRSxLQUFLRyxDQUFMLENBQW5CLEVBQTRCRixJQUE1QixDQUptQixDQUFyQjtBQU1EO0FBQ0RFOztBQUVBO0FBQ0EsVUFBSUgsS0FBS0csQ0FBTCxDQUFKLEVBQWE7QUFDWEQsZ0JBQVFnQixTQUFSLEdBQW9CN0MsT0FBTyxDQUFDMkIsS0FBS0csQ0FBTCxLQUFXLEVBQVosRUFBZ0JwRCxLQUFoQixJQUF5QixDQUFoQyxLQUFzQyxDQUExRDtBQUNEO0FBQ0RvRDtBQUNELEtBeEJELE1Bd0JPLElBQUksVUFBVU4sSUFBVixDQUFlSyxRQUFRUSxJQUF2QixDQUFKLEVBQWtDO0FBQ3ZDOztBQUVBO0FBQ0EsVUFBSVYsS0FBS0csQ0FBTCxDQUFKLEVBQWE7QUFDWEQsZ0JBQVFnQixTQUFSLEdBQW9CN0MsT0FBTyxDQUFDMkIsS0FBS0csQ0FBTCxLQUFXLEVBQVosRUFBZ0JwRCxLQUFoQixJQUF5QixDQUFoQyxLQUFzQyxDQUExRDtBQUNEO0FBQ0RvRDtBQUNEOztBQUVEOztBQUVBO0FBQ0EsUUFBSUEsSUFBSUgsS0FBSzVELE1BQUwsR0FBYyxDQUF0QixFQUF5QjtBQUN2QixVQUFJNEQsS0FBS0csQ0FBTCxDQUFKLEVBQWE7QUFDWEQsZ0JBQVFpQixHQUFSLEdBQWMsQ0FBQyxDQUFDbkIsS0FBS0csQ0FBTCxLQUFXLEVBQVosRUFBZ0JwRCxLQUFoQixJQUF5QixFQUExQixFQUE4QmUsUUFBOUIsR0FBeUM2QyxXQUF6QyxFQUFkO0FBQ0Q7QUFDRFI7QUFDRDtBQUNGOztBQUVEO0FBQ0E7O0FBRUE7QUFDQSxNQUFJQSxJQUFJSCxLQUFLNUQsTUFBTCxHQUFjLENBQXRCLEVBQXlCO0FBQ3ZCLFFBQUlrRSxNQUFNQyxPQUFOLENBQWNQLEtBQUtHLENBQUwsQ0FBZCxLQUEwQkgsS0FBS0csQ0FBTCxFQUFRL0QsTUFBdEMsRUFBOEM7QUFDNUM4RCxjQUFRa0IsV0FBUixHQUFzQixDQUFDLENBQUNwQixLQUFLRyxDQUFMLEVBQVEsQ0FBUixLQUFjLEVBQWYsRUFBbUJwRCxLQUFuQixJQUE0QixFQUE3QixFQUFpQ2UsUUFBakMsR0FBNEM2QyxXQUE1QyxFQUF0QjtBQUNBLFVBQUlMLE1BQU1DLE9BQU4sQ0FBY1AsS0FBS0csQ0FBTCxFQUFRLENBQVIsQ0FBZCxDQUFKLEVBQStCO0FBQzdCRCxnQkFBUW1CLHFCQUFSLEdBQWdDUixtQkFBbUJiLEtBQUtHLENBQUwsRUFBUSxDQUFSLENBQW5CLENBQWhDO0FBQ0Q7QUFDRjtBQUNEQTtBQUNEOztBQUVEO0FBQ0EsTUFBSUEsSUFBSUgsS0FBSzVELE1BQUwsR0FBYyxDQUF0QixFQUF5QjtBQUN2QixRQUFJNEQsS0FBS0csQ0FBTCxDQUFKLEVBQWE7QUFDWEQsY0FBUW9CLFFBQVIsR0FBbUIsR0FBR2hGLE1BQUgsQ0FBVTBELEtBQUtHLENBQUwsQ0FBVixFQUFtQnZELEdBQW5CLENBQXdCMkUsR0FBRCxJQUFTLG1CQUFPLEVBQVAsRUFBVyxPQUFYLEVBQW9CQSxHQUFwQixFQUF5QlosV0FBekIsRUFBaEMsQ0FBbkI7QUFDRDtBQUNEUjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLE1BQUlBLElBQUlILEtBQUs1RCxNQUFMLEdBQWMsQ0FBdEIsRUFBeUI7QUFDdkIsUUFBSTRELEtBQUtHLENBQUwsQ0FBSixFQUFhO0FBQ1hELGNBQVFzQixRQUFSLEdBQW1CLENBQUMsQ0FBQ3hCLEtBQUtHLENBQUwsS0FBVyxFQUFaLEVBQWdCcEQsS0FBaEIsSUFBeUIsRUFBMUIsRUFBOEJlLFFBQTlCLEVBQW5CO0FBQ0Q7QUFDRHFDO0FBQ0Q7O0FBRUQsU0FBT0QsT0FBUDtBQUNEOztBQUVELFNBQVNXLGtCQUFULENBQTZCWSxRQUFRLEVBQXJDLEVBQXlDQyw2QkFBekMsRUFBaUVDLGtEQUFqRSxFQUFtRztBQUNqRyxRQUFNQyxPQUFPSCxNQUFNN0UsR0FBTixDQUFVLGlCQUFLLE9BQUwsQ0FBVixDQUFiO0FBQ0EsUUFBTWlGLE9BQU9ELEtBQUtFLE1BQUwsQ0FBWSxDQUFDQyxDQUFELEVBQUk1QixDQUFKLEtBQVVBLElBQUksQ0FBSixLQUFVLENBQWhDLEVBQW1DdkQsR0FBbkMsQ0FBdUM4RSxZQUF2QyxDQUFiO0FBQ0EsUUFBTU0sU0FBU0osS0FBS0UsTUFBTCxDQUFZLENBQUNDLENBQUQsRUFBSTVCLENBQUosS0FBVUEsSUFBSSxDQUFKLEtBQVUsQ0FBaEMsRUFBbUN2RCxHQUFuQyxDQUF1QytFLGNBQXZDLENBQWY7QUFDQSxTQUFPLHNCQUFVLGdCQUFJRSxJQUFKLEVBQVVHLE1BQVYsQ0FBVixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztBQU1PLFNBQVNqRyxVQUFULENBQXFCRSxRQUFyQixFQUErQjtBQUNwQyxNQUFJLENBQUNBLFFBQUQsSUFBYSxDQUFDQSxTQUFTQyxPQUF2QixJQUFrQyxDQUFDRCxTQUFTQyxPQUFULENBQWlCK0YsS0FBcEQsSUFBNkQsQ0FBQ2hHLFNBQVNDLE9BQVQsQ0FBaUIrRixLQUFqQixDQUF1QjdGLE1BQXpGLEVBQWlHO0FBQy9GLFdBQU8sRUFBUDtBQUNEOztBQUVELE1BQUlpRCxPQUFPLEVBQVg7QUFDQSxNQUFJNkMsV0FBVyxFQUFmOztBQUVBakcsV0FBU0MsT0FBVCxDQUFpQitGLEtBQWpCLENBQXVCakUsT0FBdkIsQ0FBZ0NtRSxJQUFELElBQVU7QUFDdkMsUUFBSUMsU0FBUyxHQUFHOUYsTUFBSCxDQUFVLEdBQUdBLE1BQUgsQ0FBVTZGLEtBQUs5RixVQUFMLElBQW1CLEVBQTdCLEVBQWlDLENBQWpDLEtBQXVDLEVBQWpELENBQWIsQ0FEdUMsQ0FDMkI7QUFDbEUsUUFBSWdHLE9BQUo7QUFDQSxRQUFJbEMsQ0FBSixFQUFPbUMsR0FBUCxFQUFZQyxHQUFaOztBQUVBLFFBQUlMLFNBQVNDLEtBQUt4RSxFQUFkLENBQUosRUFBdUI7QUFDckI7QUFDQTBFLGdCQUFVSCxTQUFTQyxLQUFLeEUsRUFBZCxDQUFWO0FBQ0QsS0FIRCxNQUdPO0FBQ0x1RSxlQUFTQyxLQUFLeEUsRUFBZCxJQUFvQjBFLFVBQVU7QUFDNUIsYUFBS0YsS0FBS3hFO0FBRGtCLE9BQTlCO0FBR0EwQixXQUFLb0IsSUFBTCxDQUFVNEIsT0FBVjtBQUNEOztBQUVELFNBQUtsQyxJQUFJLENBQUosRUFBT21DLE1BQU1GLE9BQU9oRyxNQUF6QixFQUFpQytELElBQUltQyxHQUFyQyxFQUEwQ25DLEdBQTFDLEVBQStDO0FBQzdDLFVBQUlBLElBQUksQ0FBSixLQUFVLENBQWQsRUFBaUI7QUFDZm9DLGNBQU0sa0NBQVM7QUFDYmxHLHNCQUFZLENBQUMrRixPQUFPakMsQ0FBUCxDQUFEO0FBREMsU0FBVCxFQUVIUSxXQUZHLEdBRVc2QixPQUZYLENBRW1CLFFBRm5CLEVBRTZCLEVBRjdCLENBQU47QUFHQTtBQUNEO0FBQ0RILGNBQVFFLEdBQVIsSUFBZUUsZ0JBQWdCRixHQUFoQixFQUFxQkgsT0FBT2pDLENBQVAsQ0FBckIsQ0FBZjtBQUNEO0FBQ0YsR0F4QkQ7O0FBMEJBLFNBQU9kLElBQVA7QUFDRDs7QUFFRDs7Ozs7OztBQU9BLFNBQVNvRCxlQUFULENBQTBCRixHQUExQixFQUErQnhGLEtBQS9CLEVBQXNDO0FBQ3BDLE1BQUksQ0FBQ0EsS0FBTCxFQUFZO0FBQ1YsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsTUFBSSxDQUFDdUQsTUFBTUMsT0FBTixDQUFjeEQsS0FBZCxDQUFMLEVBQTJCO0FBQ3pCLFlBQVF3RixHQUFSO0FBQ0UsV0FBSyxLQUFMO0FBQ0EsV0FBSyxhQUFMO0FBQ0UsZUFBT2xFLE9BQU90QixNQUFNQSxLQUFiLEtBQXVCLENBQTlCO0FBQ0YsV0FBSyxRQUFMO0FBQWU7QUFDYixlQUFPQSxNQUFNQSxLQUFOLElBQWUsR0FBdEI7QUFMSjtBQU9BLFdBQU9BLE1BQU1BLEtBQWI7QUFDRDs7QUFFRCxVQUFRd0YsR0FBUjtBQUNFLFNBQUssT0FBTDtBQUNBLFNBQUssYUFBTDtBQUNFeEYsY0FBUSxHQUFHVCxNQUFILENBQVVTLEtBQVYsRUFBaUJILEdBQWpCLENBQXNCaUIsSUFBRCxJQUFXQSxLQUFLZCxLQUFMLElBQWMsRUFBOUMsQ0FBUjtBQUNBO0FBQ0YsU0FBSyxVQUFMO0FBQ0VBLGNBQVFsQixjQUFjLEdBQUdTLE1BQUgsQ0FBVVMsU0FBUyxFQUFuQixDQUFkLENBQVI7QUFDQTtBQUNGLFNBQUssZUFBTDtBQUNFQSxjQUFRakIsbUJBQW1CLEdBQUdRLE1BQUgsQ0FBVVMsU0FBUyxFQUFuQixDQUFuQixDQUFSO0FBQ0E7QUFDRixTQUFLLFFBQUw7QUFDRUEsY0FBUSxDQUFDQSxNQUFNNkMsS0FBTixNQUFpQixFQUFsQixFQUFzQjdDLEtBQXRCLElBQStCLEdBQXZDO0FBQ0E7QUFiSjs7QUFnQkEsU0FBT0EsS0FBUDtBQUNEOztBQUVEOzs7Ozs7OztBQVFPLFNBQVNmLFdBQVQsQ0FBc0JDLFFBQXRCLEVBQWdDO0FBQ3JDLFNBQU8saUJBQ0wsbUJBQU8sRUFBUCxFQUFXLENBQUMsU0FBRCxFQUFZLFFBQVosQ0FBWCxDQURLLEVBRUwsZ0JBQUl5RyxLQUFLQSxFQUFFckcsVUFBRixJQUFnQixFQUF6QixDQUZLLGtCQUlMLGdCQUFJc0IsTUFBTVUsT0FBTyxtQkFBT1YsTUFBTSxDQUFiLEVBQWdCLE9BQWhCLEVBQXlCQSxFQUF6QixDQUFQLEtBQXdDLENBQWxELENBSkssRUFLTCxpQkFBSyxDQUFDZ0YsQ0FBRCxFQUFJQyxDQUFKLEtBQVVELElBQUlDLENBQW5CLENBTEssRUFNTDNHLFFBTkssQ0FBUDtBQU9EIiwiZmlsZSI6ImNvbW1hbmQtcGFyc2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhcnNlQWRkcmVzcyBmcm9tICdlbWFpbGpzLWFkZHJlc3NwYXJzZXInXG5pbXBvcnQgeyBjb21waWxlciB9IGZyb20gJ2VtYWlsanMtaW1hcC1oYW5kbGVyJ1xuaW1wb3J0IHsgc29ydCwgbWFwLCBwaXBlLCB6aXAsIGZyb21QYWlycywgcHJvcCwgcGF0aE9yLCBwcm9wT3IsIGZsYXR0ZW4sIHRvTG93ZXIgfSBmcm9tICdyYW1kYSdcbmltcG9ydCB7IG1pbWVXb3JkRW5jb2RlLCBtaW1lV29yZHNEZWNvZGUgfSBmcm9tICdlbWFpbGpzLW1pbWUtY29kZWMnXG5cbi8qKlxuICogUGFyc2VzIE5BTUVTUEFDRSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICogQHJldHVybiB7T2JqZWN0fSBOYW1lc3BhY2VzIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VOQU1FU1BBQ0UgKHJlc3BvbnNlKSB7XG4gIGlmICghcmVzcG9uc2UucGF5bG9hZCB8fCAhcmVzcG9uc2UucGF5bG9hZC5OQU1FU1BBQ0UgfHwgIXJlc3BvbnNlLnBheWxvYWQuTkFNRVNQQUNFLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgbGV0IGF0dHJpYnV0ZXMgPSBbXS5jb25jYXQocmVzcG9uc2UucGF5bG9hZC5OQU1FU1BBQ0UucG9wKCkuYXR0cmlidXRlcyB8fCBbXSlcbiAgaWYgKCFhdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwZXJzb25hbDogcGFyc2VOQU1FU1BBQ0VFbGVtZW50KGF0dHJpYnV0ZXNbMF0pLFxuICAgIHVzZXJzOiBwYXJzZU5BTUVTUEFDRUVsZW1lbnQoYXR0cmlidXRlc1sxXSksXG4gICAgc2hhcmVkOiBwYXJzZU5BTUVTUEFDRUVsZW1lbnQoYXR0cmlidXRlc1syXSlcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlcyBhIE5BTUVTUEFDRSBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAqIEByZXR1cm4ge09iamVjdH0gTmFtZXNwYWNlcyBlbGVtZW50IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VOQU1FU1BBQ0VFbGVtZW50IChlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgZWxlbWVudCA9IFtdLmNvbmNhdChlbGVtZW50IHx8IFtdKVxuICByZXR1cm4gZWxlbWVudC5tYXAoKG5zKSA9PiB7XG4gICAgaWYgKCFucyB8fCAhbnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJlZml4OiBuc1swXS52YWx1ZSxcbiAgICAgIGRlbGltaXRlcjogbnNbMV0gJiYgbnNbMV0udmFsdWUgLy8gVGhlIGRlbGltaXRlciBjYW4gbGVnYWxseSBiZSBOSUwgd2hpY2ggbWFwcyB0byBudWxsXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIFBhcnNlcyBTRUxFQ1QgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2VcbiAqIEByZXR1cm4ge09iamVjdH0gTWFpbGJveCBpbmZvcm1hdGlvbiBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU0VMRUNUIChyZXNwb25zZSkge1xuICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5wYXlsb2FkKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgbWFpbGJveCA9IHtcbiAgICByZWFkT25seTogcmVzcG9uc2UuY29kZSA9PT0gJ1JFQUQtT05MWSdcbiAgfVxuICBsZXQgZXhpc3RzUmVzcG9uc2UgPSByZXNwb25zZS5wYXlsb2FkLkVYSVNUUyAmJiByZXNwb25zZS5wYXlsb2FkLkVYSVNUUy5wb3AoKVxuICBsZXQgZmxhZ3NSZXNwb25zZSA9IHJlc3BvbnNlLnBheWxvYWQuRkxBR1MgJiYgcmVzcG9uc2UucGF5bG9hZC5GTEFHUy5wb3AoKVxuICBsZXQgb2tSZXNwb25zZSA9IHJlc3BvbnNlLnBheWxvYWQuT0tcblxuICBpZiAoZXhpc3RzUmVzcG9uc2UpIHtcbiAgICBtYWlsYm94LmV4aXN0cyA9IGV4aXN0c1Jlc3BvbnNlLm5yIHx8IDBcbiAgfVxuXG4gIGlmIChmbGFnc1Jlc3BvbnNlICYmIGZsYWdzUmVzcG9uc2UuYXR0cmlidXRlcyAmJiBmbGFnc1Jlc3BvbnNlLmF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgbWFpbGJveC5mbGFncyA9IGZsYWdzUmVzcG9uc2UuYXR0cmlidXRlc1swXS5tYXAoKGZsYWcpID0+IChmbGFnLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKSlcbiAgfVxuXG4gIFtdLmNvbmNhdChva1Jlc3BvbnNlIHx8IFtdKS5mb3JFYWNoKChvaykgPT4ge1xuICAgIHN3aXRjaCAob2sgJiYgb2suY29kZSkge1xuICAgICAgY2FzZSAnUEVSTUFORU5URkxBR1MnOlxuICAgICAgICBtYWlsYm94LnBlcm1hbmVudEZsYWdzID0gW10uY29uY2F0KG9rLnBlcm1hbmVudGZsYWdzIHx8IFtdKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnVUlEVkFMSURJVFknOlxuICAgICAgICBtYWlsYm94LnVpZFZhbGlkaXR5ID0gTnVtYmVyKG9rLnVpZHZhbGlkaXR5KSB8fCAwXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdVSURORVhUJzpcbiAgICAgICAgbWFpbGJveC51aWROZXh0ID0gTnVtYmVyKG9rLnVpZG5leHQpIHx8IDBcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ0hJR0hFU1RNT0RTRVEnOlxuICAgICAgICBtYWlsYm94LmhpZ2hlc3RNb2RzZXEgPSBvay5oaWdoZXN0bW9kc2VxIHx8ICcwJyAvLyBrZWVwIDY0Yml0IHVpbnQgYXMgYSBzdHJpbmdcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ05PTU9EU0VRJzpcbiAgICAgICAgbWFpbGJveC5ub01vZHNlcSA9IHRydWVcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG1haWxib3hcbn1cblxuLyoqXG4gKiBQYXJzZXMgbWVzc2FnZSBlbnZlbG9wZSBmcm9tIEZFVENIIHJlc3BvbnNlLiBBbGwga2V5cyBpbiB0aGUgcmVzdWx0aW5nXG4gKiBvYmplY3QgYXJlIGxvd2VyY2FzZS4gQWRkcmVzcyBmaWVsZHMgYXJlIGFsbCBhcnJheXMgd2l0aCB7bmFtZTosIGFkZHJlc3M6fVxuICogc3RydWN0dXJlZCB2YWx1ZXMuIFVuaWNvZGUgc3RyaW5ncyBhcmUgYXV0b21hdGljYWxseSBkZWNvZGVkLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlIEVudmVsb3BlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gRW52ZWxvcGUgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUVOVkVMT1BFICh2YWx1ZSkge1xuICBsZXQgZW52ZWxvcGUgPSB7fVxuXG4gIGlmICh2YWx1ZVswXSAmJiB2YWx1ZVswXS52YWx1ZSkge1xuICAgIGVudmVsb3BlLmRhdGUgPSB2YWx1ZVswXS52YWx1ZVxuICB9XG5cbiAgaWYgKHZhbHVlWzFdICYmIHZhbHVlWzFdLnZhbHVlKSB7XG4gICAgZW52ZWxvcGUuc3ViamVjdCA9IG1pbWVXb3Jkc0RlY29kZSh2YWx1ZVsxXSAmJiB2YWx1ZVsxXS52YWx1ZSlcbiAgfVxuXG4gIGlmICh2YWx1ZVsyXSAmJiB2YWx1ZVsyXS5sZW5ndGgpIHtcbiAgICBlbnZlbG9wZS5mcm9tID0gcHJvY2Vzc0FkZHJlc3Nlcyh2YWx1ZVsyXSlcbiAgfVxuXG4gIGlmICh2YWx1ZVszXSAmJiB2YWx1ZVszXS5sZW5ndGgpIHtcbiAgICBlbnZlbG9wZS5zZW5kZXIgPSBwcm9jZXNzQWRkcmVzc2VzKHZhbHVlWzNdKVxuICB9XG5cbiAgaWYgKHZhbHVlWzRdICYmIHZhbHVlWzRdLmxlbmd0aCkge1xuICAgIGVudmVsb3BlWydyZXBseS10byddID0gcHJvY2Vzc0FkZHJlc3Nlcyh2YWx1ZVs0XSlcbiAgfVxuXG4gIGlmICh2YWx1ZVs1XSAmJiB2YWx1ZVs1XS5sZW5ndGgpIHtcbiAgICBlbnZlbG9wZS50byA9IHByb2Nlc3NBZGRyZXNzZXModmFsdWVbNV0pXG4gIH1cblxuICBpZiAodmFsdWVbNl0gJiYgdmFsdWVbNl0ubGVuZ3RoKSB7XG4gICAgZW52ZWxvcGUuY2MgPSBwcm9jZXNzQWRkcmVzc2VzKHZhbHVlWzZdKVxuICB9XG5cbiAgaWYgKHZhbHVlWzddICYmIHZhbHVlWzddLmxlbmd0aCkge1xuICAgIGVudmVsb3BlLmJjYyA9IHByb2Nlc3NBZGRyZXNzZXModmFsdWVbN10pXG4gIH1cblxuICBpZiAodmFsdWVbOF0gJiYgdmFsdWVbOF0udmFsdWUpIHtcbiAgICBlbnZlbG9wZVsnaW4tcmVwbHktdG8nXSA9IHZhbHVlWzhdLnZhbHVlXG4gIH1cblxuICBpZiAodmFsdWVbOV0gJiYgdmFsdWVbOV0udmFsdWUpIHtcbiAgICBlbnZlbG9wZVsnbWVzc2FnZS1pZCddID0gdmFsdWVbOV0udmFsdWVcbiAgfVxuXG4gIHJldHVybiBlbnZlbG9wZVxufVxuXG4vKlxuICogRU5WRUxPUEUgbGlzdHMgYWRkcmVzc2VzIGFzIFtuYW1lLXBhcnQsIHNvdXJjZS1yb3V0ZSwgdXNlcm5hbWUsIGhvc3RuYW1lXVxuICogd2hlcmUgc291cmNlLXJvdXRlIGlzIG5vdCB1c2VkIGFueW1vcmUgYW5kIGNhbiBiZSBpZ25vcmVkLlxuICogVG8gZ2V0IGNvbXBhcmFibGUgcmVzdWx0cyB3aXRoIG90aGVyIHBhcnRzIG9mIHRoZSBlbWFpbC5qcyBzdGFja1xuICogYnJvd3NlcmJveCBmZWVkcyB0aGUgcGFyc2VkIGFkZHJlc3MgdmFsdWVzIGZyb20gRU5WRUxPUEVcbiAqIHRvIGFkZHJlc3NwYXJzZXIgYW5kIHVzZXMgcmVzdWx0aW5nIHZhbHVlcyBpbnN0ZWFkIG9mIHRoZVxuICogcHJlLXBhcnNlZCBhZGRyZXNzZXNcbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0FkZHJlc3NlcyAobGlzdCA9IFtdKSB7XG4gIHJldHVybiBsaXN0Lm1hcCgoYWRkcikgPT4ge1xuICAgIGNvbnN0IG5hbWUgPSAocGF0aE9yKCcnLCBbJzAnLCAndmFsdWUnXSwgYWRkcikpLnRyaW0oKVxuICAgIGNvbnN0IGFkZHJlc3MgPSAocGF0aE9yKCcnLCBbJzInLCAndmFsdWUnXSwgYWRkcikpICsgJ0AnICsgKHBhdGhPcignJywgWyczJywgJ3ZhbHVlJ10sIGFkZHIpKVxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IG5hbWUgPyAoZW5jb2RlQWRkcmVzc05hbWUobmFtZSkgKyAnIDwnICsgYWRkcmVzcyArICc+JykgOiBhZGRyZXNzXG4gICAgbGV0IHBhcnNlZCA9IHBhcnNlQWRkcmVzcyhmb3JtYXR0ZWQpLnNoaWZ0KCkgLy8gdGhlcmUgc2hvdWxkIGJlIGp1c3QgYSBzaW5nbGUgYWRkcmVzc1xuICAgIHBhcnNlZC5uYW1lID0gbWltZVdvcmRzRGVjb2RlKHBhcnNlZC5uYW1lKVxuICAgIHJldHVybiBwYXJzZWRcbiAgfSlcbn1cblxuLyoqXG4gKiBJZiBuZWVkZWQsIGVuY2xvc2VzIHdpdGggcXVvdGVzIG9yIG1pbWUgZW5jb2RlcyB0aGUgbmFtZSBwYXJ0IG9mIGFuIGUtbWFpbCBhZGRyZXNzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBwYXJ0IG9mIGFuIGFkZHJlc3NcbiAqIEByZXR1cm5zIHtTdHJpbmd9IE1pbWUgd29yZCBlbmNvZGVkIG9yIHF1b3RlZCBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZW5jb2RlQWRkcmVzc05hbWUgKG5hbWUpIHtcbiAgaWYgKCEvXltcXHcgJ10qJC8udGVzdChuYW1lKSkge1xuICAgIGlmICgvXltcXHgyMC1cXHg3ZV0qJC8udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG5hbWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtaW1lV29yZEVuY29kZShuYW1lLCAnUScsIDUyKVxuICAgIH1cbiAgfVxuICByZXR1cm4gbmFtZVxufVxuXG4vKipcbiAqIFBhcnNlcyBtZXNzYWdlIGJvZHkgc3RydWN0dXJlIGZyb20gRkVUQ0ggcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWUgQk9EWVNUUlVDVFVSRSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IEVudmVsb3BlIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCT0RZU1RSVUNUVVJFIChub2RlLCBwYXRoID0gW10pIHtcbiAgbGV0IGN1ck5vZGUgPSB7fVxuICBsZXQgaSA9IDBcbiAgbGV0IHBhcnQgPSAwXG5cbiAgaWYgKHBhdGgubGVuZ3RoKSB7XG4gICAgY3VyTm9kZS5wYXJ0ID0gcGF0aC5qb2luKCcuJylcbiAgfVxuXG4gIC8vIG11bHRpcGFydFxuICBpZiAoQXJyYXkuaXNBcnJheShub2RlWzBdKSkge1xuICAgIGN1ck5vZGUuY2hpbGROb2RlcyA9IFtdXG4gICAgd2hpbGUgKEFycmF5LmlzQXJyYXkobm9kZVtpXSkpIHtcbiAgICAgIGN1ck5vZGUuY2hpbGROb2Rlcy5wdXNoKHBhcnNlQk9EWVNUUlVDVFVSRShub2RlW2ldLCBwYXRoLmNvbmNhdCgrK3BhcnQpKSlcbiAgICAgIGkrK1xuICAgIH1cblxuICAgIC8vIG11bHRpcGFydCB0eXBlXG4gICAgY3VyTm9kZS50eXBlID0gJ211bHRpcGFydC8nICsgKChub2RlW2krK10gfHwge30pLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcblxuICAgIC8vIGV4dGVuc2lvbiBkYXRhIChub3QgYXZhaWxhYmxlIGZvciBCT0RZIHJlcXVlc3RzKVxuXG4gICAgLy8gYm9keSBwYXJhbWV0ZXIgcGFyZW50aGVzaXplZCBsaXN0XG4gICAgaWYgKGkgPCBub2RlLmxlbmd0aCAtIDEpIHtcbiAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgIGN1ck5vZGUucGFyYW1ldGVycyA9IGF0dHJpYnV0ZXNUb09iamVjdChub2RlW2ldKVxuICAgICAgfVxuICAgICAgaSsrXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIGNvbnRlbnQgdHlwZVxuICAgIGN1ck5vZGUudHlwZSA9IFtcbiAgICAgICgobm9kZVtpKytdIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLCAoKG5vZGVbaSsrXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKVxuICAgIF0uam9pbignLycpXG5cbiAgICAvLyBib2R5IHBhcmFtZXRlciBwYXJlbnRoZXNpemVkIGxpc3RcbiAgICBpZiAobm9kZVtpXSkge1xuICAgICAgY3VyTm9kZS5wYXJhbWV0ZXJzID0gYXR0cmlidXRlc1RvT2JqZWN0KG5vZGVbaV0pXG4gICAgfVxuICAgIGkrK1xuXG4gICAgLy8gaWRcbiAgICBpZiAobm9kZVtpXSkge1xuICAgICAgY3VyTm9kZS5pZCA9ICgobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgJycpLnRvU3RyaW5nKClcbiAgICB9XG4gICAgaSsrXG5cbiAgICAvLyBkZXNjcmlwdGlvblxuICAgIGlmIChub2RlW2ldKSB7XG4gICAgICBjdXJOb2RlLmRlc2NyaXB0aW9uID0gKChub2RlW2ldIHx8IHt9KS52YWx1ZSB8fCAnJykudG9TdHJpbmcoKVxuICAgIH1cbiAgICBpKytcblxuICAgIC8vIGVuY29kaW5nXG4gICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgIGN1ck5vZGUuZW5jb2RpbmcgPSAoKG5vZGVbaV0gfHwge30pLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICB9XG4gICAgaSsrXG5cbiAgICAvLyBzaXplXG4gICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgIGN1ck5vZGUuc2l6ZSA9IE51bWJlcigobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgMCkgfHwgMFxuICAgIH1cbiAgICBpKytcblxuICAgIGlmIChjdXJOb2RlLnR5cGUgPT09ICdtZXNzYWdlL3JmYzgyMicpIHtcbiAgICAgIC8vIG1lc3NhZ2UvcmZjIGFkZHMgYWRkaXRpb25hbCBlbnZlbG9wZSwgYm9keXN0cnVjdHVyZSBhbmQgbGluZSBjb3VudCB2YWx1ZXNcblxuICAgICAgLy8gZW52ZWxvcGVcbiAgICAgIGlmIChub2RlW2ldKSB7XG4gICAgICAgIGN1ck5vZGUuZW52ZWxvcGUgPSBwYXJzZUVOVkVMT1BFKFtdLmNvbmNhdChub2RlW2ldIHx8IFtdKSlcbiAgICAgIH1cbiAgICAgIGkrK1xuXG4gICAgICBpZiAobm9kZVtpXSkge1xuICAgICAgICBjdXJOb2RlLmNoaWxkTm9kZXMgPSBbXG4gICAgICAgICAgLy8gcmZjODIyIGJvZHlwYXJ0cyBzaGFyZSB0aGUgc2FtZSBwYXRoLCBkaWZmZXJlbmNlIGlzIGJldHdlZW4gTUlNRSBhbmQgSEVBREVSXG4gICAgICAgICAgLy8gcGF0aC5NSU1FIHJldHVybnMgbWVzc2FnZS9yZmM4MjIgaGVhZGVyXG4gICAgICAgICAgLy8gcGF0aC5IRUFERVIgcmV0dXJucyBpbmxpbmVkIG1lc3NhZ2UgaGVhZGVyXG4gICAgICAgICAgcGFyc2VCT0RZU1RSVUNUVVJFKG5vZGVbaV0sIHBhdGgpXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICAgIGkrK1xuXG4gICAgICAvLyBsaW5lIGNvdW50XG4gICAgICBpZiAobm9kZVtpXSkge1xuICAgICAgICBjdXJOb2RlLmxpbmVDb3VudCA9IE51bWJlcigobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgMCkgfHwgMFxuICAgICAgfVxuICAgICAgaSsrXG4gICAgfSBlbHNlIGlmICgvXnRleHRcXC8vLnRlc3QoY3VyTm9kZS50eXBlKSkge1xuICAgICAgLy8gdGV4dC8qIGFkZHMgYWRkaXRpb25hbCBsaW5lIGNvdW50IHZhbHVlc1xuXG4gICAgICAvLyBsaW5lIGNvdW50XG4gICAgICBpZiAobm9kZVtpXSkge1xuICAgICAgICBjdXJOb2RlLmxpbmVDb3VudCA9IE51bWJlcigobm9kZVtpXSB8fCB7fSkudmFsdWUgfHwgMCkgfHwgMFxuICAgICAgfVxuICAgICAgaSsrXG4gICAgfVxuXG4gICAgLy8gZXh0ZW5zaW9uIGRhdGEgKG5vdCBhdmFpbGFibGUgZm9yIEJPRFkgcmVxdWVzdHMpXG5cbiAgICAvLyBtZDVcbiAgICBpZiAoaSA8IG5vZGUubGVuZ3RoIC0gMSkge1xuICAgICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgICAgY3VyTm9kZS5tZDUgPSAoKG5vZGVbaV0gfHwge30pLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgIH1cbiAgICAgIGkrK1xuICAgIH1cbiAgfVxuXG4gIC8vIHRoZSBmb2xsb3dpbmcgYXJlIHNoYXJlZCBleHRlbnNpb24gdmFsdWVzIChmb3IgYm90aCBtdWx0aXBhcnQgYW5kIG5vbi1tdWx0aXBhcnQgcGFydHMpXG4gIC8vIG5vdCBhdmFpbGFibGUgZm9yIEJPRFkgcmVxdWVzdHNcblxuICAvLyBib2R5IGRpc3Bvc2l0aW9uXG4gIGlmIChpIDwgbm9kZS5sZW5ndGggLSAxKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZVtpXSkgJiYgbm9kZVtpXS5sZW5ndGgpIHtcbiAgICAgIGN1ck5vZGUuZGlzcG9zaXRpb24gPSAoKG5vZGVbaV1bMF0gfHwge30pLnZhbHVlIHx8ICcnKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGVbaV1bMV0pKSB7XG4gICAgICAgIGN1ck5vZGUuZGlzcG9zaXRpb25QYXJhbWV0ZXJzID0gYXR0cmlidXRlc1RvT2JqZWN0KG5vZGVbaV1bMV0pXG4gICAgICB9XG4gICAgfVxuICAgIGkrK1xuICB9XG5cbiAgLy8gYm9keSBsYW5ndWFnZVxuICBpZiAoaSA8IG5vZGUubGVuZ3RoIC0gMSkge1xuICAgIGlmIChub2RlW2ldKSB7XG4gICAgICBjdXJOb2RlLmxhbmd1YWdlID0gW10uY29uY2F0KG5vZGVbaV0pLm1hcCgodmFsKSA9PiBwcm9wT3IoJycsICd2YWx1ZScsIHZhbCkudG9Mb3dlckNhc2UoKSlcbiAgICB9XG4gICAgaSsrXG4gIH1cblxuICAvLyBib2R5IGxvY2F0aW9uXG4gIC8vIE5CISBkZWZpbmVkIGFzIGEgXCJzdHJpbmcgbGlzdFwiIGluIFJGQzM1MDEgYnV0IHJlcGxhY2VkIGluIGVycmF0YSBkb2N1bWVudCB3aXRoIFwic3RyaW5nXCJcbiAgLy8gRXJyYXRhOiBodHRwOi8vd3d3LnJmYy1lZGl0b3Iub3JnL2VycmF0YV9zZWFyY2gucGhwP3JmYz0zNTAxXG4gIGlmIChpIDwgbm9kZS5sZW5ndGggLSAxKSB7XG4gICAgaWYgKG5vZGVbaV0pIHtcbiAgICAgIGN1ck5vZGUubG9jYXRpb24gPSAoKG5vZGVbaV0gfHwge30pLnZhbHVlIHx8ICcnKS50b1N0cmluZygpXG4gICAgfVxuICAgIGkrK1xuICB9XG5cbiAgcmV0dXJuIGN1ck5vZGVcbn1cblxuZnVuY3Rpb24gYXR0cmlidXRlc1RvT2JqZWN0IChhdHRycyA9IFtdLCBrZXlUcmFuc2Zvcm0gPSB0b0xvd2VyLCB2YWx1ZVRyYW5zZm9ybSA9IG1pbWVXb3Jkc0RlY29kZSkge1xuICBjb25zdCB2YWxzID0gYXR0cnMubWFwKHByb3AoJ3ZhbHVlJykpXG4gIGNvbnN0IGtleXMgPSB2YWxzLmZpbHRlcigoXywgaSkgPT4gaSAlIDIgPT09IDApLm1hcChrZXlUcmFuc2Zvcm0pXG4gIGNvbnN0IHZhbHVlcyA9IHZhbHMuZmlsdGVyKChfLCBpKSA9PiBpICUgMiA9PT0gMSkubWFwKHZhbHVlVHJhbnNmb3JtKVxuICByZXR1cm4gZnJvbVBhaXJzKHppcChrZXlzLCB2YWx1ZXMpKVxufVxuXG4vKipcbiAqIFBhcnNlcyBGRVRDSCByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICogQHJldHVybiB7T2JqZWN0fSBNZXNzYWdlIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGRVRDSCAocmVzcG9uc2UpIHtcbiAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2UucGF5bG9hZCB8fCAhcmVzcG9uc2UucGF5bG9hZC5GRVRDSCB8fCAhcmVzcG9uc2UucGF5bG9hZC5GRVRDSC5sZW5ndGgpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIGxldCBsaXN0ID0gW11cbiAgbGV0IG1lc3NhZ2VzID0ge31cblxuICByZXNwb25zZS5wYXlsb2FkLkZFVENILmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBsZXQgcGFyYW1zID0gW10uY29uY2F0KFtdLmNvbmNhdChpdGVtLmF0dHJpYnV0ZXMgfHwgW10pWzBdIHx8IFtdKSAvLyBlbnN1cmUgdGhlIGZpcnN0IHZhbHVlIGlzIGFuIGFycmF5XG4gICAgbGV0IG1lc3NhZ2VcbiAgICBsZXQgaSwgbGVuLCBrZXlcblxuICAgIGlmIChtZXNzYWdlc1tpdGVtLm5yXSkge1xuICAgICAgLy8gc2FtZSBzZXF1ZW5jZSBudW1iZXIgaXMgYWxyZWFkeSB1c2VkLCBzbyBtZXJnZSB2YWx1ZXMgaW5zdGVhZCBvZiBjcmVhdGluZyBhIG5ldyBtZXNzYWdlIG9iamVjdFxuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2VzW2l0ZW0ubnJdXG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2VzW2l0ZW0ubnJdID0gbWVzc2FnZSA9IHtcbiAgICAgICAgJyMnOiBpdGVtLm5yXG4gICAgICB9XG4gICAgICBsaXN0LnB1c2gobWVzc2FnZSlcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBwYXJhbXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmIChpICUgMiA9PT0gMCkge1xuICAgICAgICBrZXkgPSBjb21waWxlcih7XG4gICAgICAgICAgYXR0cmlidXRlczogW3BhcmFtc1tpXV1cbiAgICAgICAgfSkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC88XFxkKz4kLywgJycpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBtZXNzYWdlW2tleV0gPSBwYXJzZUZldGNoVmFsdWUoa2V5LCBwYXJhbXNbaV0pXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBsaXN0XG59XG5cbi8qKlxuICogUGFyc2VzIGEgc2luZ2xlIHZhbHVlIGZyb20gdGhlIEZFVENIIHJlc3BvbnNlIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgS2V5IG5hbWUgKHVwcGVyY2FzZSlcbiAqIEBwYXJhbSB7TWl6ZWR9IHZhbHVlIFZhbHVlIGZvciB0aGUga2V5XG4gKiBAcmV0dXJuIHtNaXhlZH0gUHJvY2Vzc2VkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHBhcnNlRmV0Y2hWYWx1ZSAoa2V5LCB2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgY2FzZSAndWlkJzpcbiAgICAgIGNhc2UgJ3JmYzgyMi5zaXplJzpcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZS52YWx1ZSkgfHwgMFxuICAgICAgY2FzZSAnbW9kc2VxJzogLy8gZG8gbm90IGNhc3QgNjQgYml0IHVpbnQgdG8gYSBudW1iZXJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnZhbHVlIHx8ICcwJ1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUudmFsdWVcbiAgfVxuXG4gIHN3aXRjaCAoa2V5KSB7XG4gICAgY2FzZSAnZmxhZ3MnOlxuICAgIGNhc2UgJ3gtZ20tbGFiZWxzJzpcbiAgICAgIHZhbHVlID0gW10uY29uY2F0KHZhbHVlKS5tYXAoKGZsYWcpID0+IChmbGFnLnZhbHVlIHx8ICcnKSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnZW52ZWxvcGUnOlxuICAgICAgdmFsdWUgPSBwYXJzZUVOVkVMT1BFKFtdLmNvbmNhdCh2YWx1ZSB8fCBbXSkpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JvZHlzdHJ1Y3R1cmUnOlxuICAgICAgdmFsdWUgPSBwYXJzZUJPRFlTVFJVQ1RVUkUoW10uY29uY2F0KHZhbHVlIHx8IFtdKSlcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnbW9kc2VxJzpcbiAgICAgIHZhbHVlID0gKHZhbHVlLnNoaWZ0KCkgfHwge30pLnZhbHVlIHx8ICcwJ1xuICAgICAgYnJlYWtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZVxufVxuXG4vKipcbiAqIFBhcnNlcyBTRUFSQ0ggcmVzcG9uc2UuIEdhdGhlcnMgYWxsIHVudGFnZ2VkIFNFQVJDSCByZXNwb25zZXMsIGZldGNoZWQgc2VxLi91aWQgbnVtYmVyc1xuICogYW5kIGNvbXBpbGVzIHRoZXNlIGludG8gYSBzb3J0ZWQgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IE1lc3NhZ2Ugb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5fSBTb3J0ZWQgU2VxLi9VSUQgbnVtYmVyIGxpc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU0VBUkNIIChyZXNwb25zZSkge1xuICByZXR1cm4gcGlwZShcbiAgICBwYXRoT3IoW10sIFsncGF5bG9hZCcsICdTRUFSQ0gnXSksXG4gICAgbWFwKHggPT4geC5hdHRyaWJ1dGVzIHx8IFtdKSxcbiAgICBmbGF0dGVuLFxuICAgIG1hcChuciA9PiBOdW1iZXIocHJvcE9yKG5yIHx8IDAsICd2YWx1ZScsIG5yKSkgfHwgMCksXG4gICAgc29ydCgoYSwgYikgPT4gYSA+IGIpXG4gICkocmVzcG9uc2UpXG59XG4iXX0=