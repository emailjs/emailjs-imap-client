import parseAddress from 'emailjs-addressparser'
import { compiler } from 'emailjs-imap-handler'
import { zip, fromPairs, prop, pathOr, propOr, toLower } from 'ramda'
import { mimeWordEncode, mimeWordsDecode } from 'emailjs-mime-codec'

/**
 * Parses NAMESPACE response
 *
 * @param {Object} response
 * @return {Object} Namespaces object
 */
export function parseNAMESPACE (response) {
  if (!response.payload || !response.payload.NAMESPACE || !response.payload.NAMESPACE.length) {
    return false
  }

  const attributes = [].concat(response.payload.NAMESPACE.pop().attributes || [])
  if (!attributes.length) {
    return false
  }

  return {
    personal: parseNAMESPACEElement(attributes[0]),
    users: parseNAMESPACEElement(attributes[1]),
    shared: parseNAMESPACEElement(attributes[2])
  }
}

/**
 * Parses a NAMESPACE element
 *
 * @param {Object} element
 * @return {Object} Namespaces element object
 */
export function parseNAMESPACEElement (element) {
  if (!element) {
    return false
  }

  element = [].concat(element || [])
  return element.map((ns) => {
    if (!ns || !ns.length) {
      return false
    }

    return {
      prefix: ns[0].value,
      delimiter: ns[1] && ns[1].value // The delimiter can legally be NIL which maps to null
    }
  })
}

/**
 * Parses SELECT response
 *
 * @param {Object} response
 * @return {Object} Mailbox information object
 */
export function parseSELECT (response) {
  if (!response || !response.payload) {
    return
  }

  const mailbox = {
    readOnly: response.code === 'READ-ONLY'
  }
  const existsResponse = response.payload.EXISTS && response.payload.EXISTS.pop()
  const flagsResponse = response.payload.FLAGS && response.payload.FLAGS.pop()
  const okResponse = response.payload.OK

  if (existsResponse) {
    mailbox.exists = existsResponse.nr || 0
  }

  if (flagsResponse && flagsResponse.attributes && flagsResponse.attributes.length) {
    mailbox.flags = flagsResponse.attributes[0].map((flag) => (flag.value || '').toString().trim())
  }

  [].concat(okResponse || []).forEach((ok) => {
    switch (ok && ok.code) {
      case 'PERMANENTFLAGS':
        mailbox.permanentFlags = [].concat(ok.permanentflags || [])
        break
      case 'UIDVALIDITY':
        mailbox.uidValidity = Number(ok.uidvalidity) || 0
        break
      case 'UIDNEXT':
        mailbox.uidNext = Number(ok.uidnext) || 0
        break
      case 'HIGHESTMODSEQ':
        mailbox.highestModseq = ok.highestmodseq || '0' // keep 64bit uint as a string
        break
      case 'NOMODSEQ':
        mailbox.noModseq = true
        break
    }
  })

  return mailbox
}

/**
 * Parses message envelope from FETCH response. All keys in the resulting
 * object are lowercase. Address fields are all arrays with {name:, address:}
 * structured values. Unicode strings are automatically decoded.
 *
 * @param {Array} value Envelope array
 * @param {Object} Envelope object
 */
export function parseENVELOPE (value) {
  const envelope = {}

  if (value[0] && value[0].value) {
    envelope.date = value[0].value
  }

  if (value[1] && value[1].value) {
    envelope.subject = mimeWordsDecode(value[1] && value[1].value)
  }

  if (value[2] && value[2].length) {
    envelope.from = processAddresses(value[2])
  }

  if (value[3] && value[3].length) {
    envelope.sender = processAddresses(value[3])
  }

  if (value[4] && value[4].length) {
    envelope['reply-to'] = processAddresses(value[4])
  }

  if (value[5] && value[5].length) {
    envelope.to = processAddresses(value[5])
  }

  if (value[6] && value[6].length) {
    envelope.cc = processAddresses(value[6])
  }

  if (value[7] && value[7].length) {
    envelope.bcc = processAddresses(value[7])
  }

  if (value[8] && value[8].value) {
    envelope['in-reply-to'] = value[8].value
  }

  if (value[9] && value[9].value) {
    envelope['message-id'] = value[9].value
  }

  return envelope
}

/*
 * ENVELOPE lists addresses as [name-part, source-route, username, hostname]
 * where source-route is not used anymore and can be ignored.
 * To get comparable results with other parts of the email.js stack
 * browserbox feeds the parsed address values from ENVELOPE
 * to addressparser and uses resulting values instead of the
 * pre-parsed addresses
 */
function processAddresses (list = []) {
  return list.map((addr) => {
    const name = (pathOr('', ['0', 'value'], addr)).trim()
    const address = (pathOr('', ['2', 'value'], addr)) + '@' + (pathOr('', ['3', 'value'], addr))
    const formatted = name ? (encodeAddressName(name) + ' <' + address + '>') : address
    const parsed = parseAddress(formatted).shift() // there should be just a single address
    parsed.name = mimeWordsDecode(parsed.name)
    return parsed
  })
}

/**
 * If needed, encloses with quotes or mime encodes the name part of an e-mail address
 *
 * @param {String} name Name part of an address
 * @returns {String} Mime word encoded or quoted string
 */
function encodeAddressName (name) {
  if (!/^[\w ']*$/.test(name)) {
    if (/^[\x20-\x7e]*$/.test(name)) {
      return JSON.stringify(name)
    } else {
      return mimeWordEncode(name, 'Q', 52)
    }
  }
  return name
}

/**
 * Parses message body structure from FETCH response.
 *
 * @param {Array} value BODYSTRUCTURE array
 * @param {Object} Envelope object
 */
export function parseBODYSTRUCTURE (node, path = []) {
  const curNode = {}
  let i = 0
  let part = 0

  if (path.length) {
    curNode.part = path.join('.')
  }

  // multipart
  if (Array.isArray(node[0])) {
    curNode.childNodes = []
    while (Array.isArray(node[i])) {
      curNode.childNodes.push(parseBODYSTRUCTURE(node[i], path.concat(++part)))
      i++
    }

    // multipart type
    curNode.type = 'multipart/' + ((node[i++] || {}).value || '').toString().toLowerCase()

    // extension data (not available for BODY requests)

    // body parameter parenthesized list
    if (i < node.length - 1) {
      if (node[i]) {
        curNode.parameters = attributesToObject(node[i])
      }
      i++
    }
  } else {
    // content type
    curNode.type = [
      ((node[i++] || {}).value || '').toString().toLowerCase(), ((node[i++] || {}).value || '').toString().toLowerCase()
    ].join('/')

    // body parameter parenthesized list
    if (node[i]) {
      curNode.parameters = attributesToObject(node[i])
    }
    i++

    // id
    if (node[i]) {
      curNode.id = ((node[i] || {}).value || '').toString()
    }
    i++

    // description
    if (node[i]) {
      curNode.description = ((node[i] || {}).value || '').toString()
    }
    i++

    // encoding
    if (node[i]) {
      curNode.encoding = ((node[i] || {}).value || '').toString().toLowerCase()
    }
    i++

    // size
    if (node[i]) {
      curNode.size = Number((node[i] || {}).value || 0) || 0
    }
    i++

    if (curNode.type === 'message/rfc822') {
      // message/rfc adds additional envelope, bodystructure and line count values

      // envelope
      if (node[i]) {
        curNode.envelope = parseENVELOPE([].concat(node[i] || []))
      }
      i++

      if (node[i]) {
        curNode.childNodes = [
          // rfc822 bodyparts share the same path, difference is between MIME and HEADER
          // path.MIME returns message/rfc822 header
          // path.HEADER returns inlined message header
          parseBODYSTRUCTURE(node[i], path)
        ]
      }
      i++

      // line count
      if (node[i]) {
        curNode.lineCount = Number((node[i] || {}).value || 0) || 0
      }
      i++
    } else if (/^text\//.test(curNode.type)) {
      // text/* adds additional line count values

      // line count
      if (node[i]) {
        curNode.lineCount = Number((node[i] || {}).value || 0) || 0
      }
      i++
    }

    // extension data (not available for BODY requests)

    // md5
    if (i < node.length - 1) {
      if (node[i]) {
        curNode.md5 = ((node[i] || {}).value || '').toString().toLowerCase()
      }
      i++
    }
  }

  // the following are shared extension values (for both multipart and non-multipart parts)
  // not available for BODY requests

  // body disposition
  if (i < node.length - 1) {
    if (Array.isArray(node[i]) && node[i].length) {
      curNode.disposition = ((node[i][0] || {}).value || '').toString().toLowerCase()
      if (Array.isArray(node[i][1])) {
        curNode.dispositionParameters = attributesToObject(node[i][1])
      }
    }
    i++
  }

  // body language
  if (i < node.length - 1) {
    if (node[i]) {
      curNode.language = [].concat(node[i]).map((val) => propOr('', 'value', val).toLowerCase())
    }
    i++
  }

  // body location
  // NB! defined as a "string list" in RFC3501 but replaced in errata document with "string"
  // Errata: http://www.rfc-editor.org/errata_search.php?rfc=3501
  if (i < node.length - 1) {
    if (node[i]) {
      curNode.location = ((node[i] || {}).value || '').toString()
    }
    i++
  }

  return curNode
}

function attributesToObject (attrs = [], keyTransform = toLower, valueTransform = mimeWordsDecode) {
  const vals = attrs.map(prop('value'))
  const keys = vals.filter((_, i) => i % 2 === 0).map(keyTransform)
  const values = vals.filter((_, i) => i % 2 === 1).map(valueTransform)
  return fromPairs(zip(keys, values))
}

/**
 * Parses FETCH response
 *
 * @param {Object} response
 * @return {Object} Message object
 */
export function parseFETCH (response) {
  if (!response || !response.payload || !response.payload.FETCH || !response.payload.FETCH.length) {
    return []
  }

  const list = []
  const messages = {}

  response.payload.FETCH.forEach((item) => {
    const params = [].concat([].concat(item.attributes || [])[0] || []) // ensure the first value is an array
    let message
    let i, len, key

    if (messages[item.nr]) {
      // same sequence number is already used, so merge values instead of creating a new message object
      message = messages[item.nr]
    } else {
      messages[item.nr] = message = {
        '#': item.nr
      }
      list.push(message)
    }

    for (i = 0, len = params.length; i < len; i++) {
      if (i % 2 === 0) {
        key = compiler({
          attributes: [params[i]]
        }).toLowerCase().replace(/<\d+>$/, '')
        continue
      }
      message[key] = parseFetchValue(key, params[i])
    }
  })

  return list
}

/**
 * Parses a single value from the FETCH response object
 *
 * @param {String} key Key name (uppercase)
 * @param {Mized} value Value for the key
 * @return {Mixed} Processed value
 */
function parseFetchValue (key, value) {
  if (!value) {
    return null
  }

  if (!Array.isArray(value)) {
    switch (key) {
      case 'uid':
      case 'rfc822.size':
        return Number(value.value) || 0
      case 'modseq': // do not cast 64 bit uint to a number
        return value.value || '0'
    }
    return value.value
  }

  switch (key) {
    case 'flags':
    case 'x-gm-labels':
      value = [].concat(value).map((flag) => (flag.value || ''))
      break
    case 'envelope':
      value = parseENVELOPE([].concat(value || []))
      break
    case 'bodystructure':
      value = parseBODYSTRUCTURE([].concat(value || []))
      break
    case 'modseq':
      value = (value.shift() || {}).value || '0'
      break
  }

  return value
}

/**
  * Binary Search - from npm module binary-search, license CC0
  *
  * @param {Array} haystack Ordered array
  * @param {any} needle Item to search for in haystack
  * @param {Function} comparator Function that defines the sort order
  * @return {Number} Index of needle in haystack or if not found,
  *     -Index-1 is the position where needle could be inserted while still
  *     keeping haystack ordered.
  */
function binSearch (haystack, needle, comparator = (a, b) => a - b) {
  var mid, cmp
  var low = 0
  var high = haystack.length - 1

  while (low <= high) {
    // Note that "(low + high) >>> 1" may overflow, and results in
    // a typecast to double (which gives the wrong results).
    mid = low + (high - low >> 1)
    cmp = +comparator(haystack[mid], needle)

    if (cmp < 0.0) {
      // too low
      low = mid + 1
    } else if (cmp > 0.0) {
      // too high
      high = mid - 1
    } else {
      // key found
      return mid
    }
  }

  // key not found
  return ~low
};

/**
 * Parses SEARCH response. Gathers all untagged SEARCH responses, fetched seq./uid numbers
 * and compiles these into a sorted array.
 *
 * @param {Object} response
 * @return {Object} Message object
 * @param {Array} Sorted Seq./UID number list
 */
export function parseSEARCH (response) {
  const list = []

  if (!response || !response.payload || !response.payload.SEARCH || !response.payload.SEARCH.length) {
    return list
  }

  response.payload.SEARCH.forEach(result =>
    (result.attributes || []).forEach(nr => {
      nr = Number((nr && nr.value) || nr) || 0
      const idx = binSearch(list, nr)
      if (idx < 0) {
        list.splice(-idx - 1, 0, nr)
      }
    })
  )

  return list
};

/**
 * Parses COPY and UID COPY response.
 * https://tools.ietf.org/html/rfc4315
 * @param {Object} response
 * @returns {{destSeqSet: string, srcSeqSet: string}} Source and
 * destination uid sets if available, undefined if not.
 */
export function parseCOPY (response) {
  const copyuid = response && response.copyuid
  if (copyuid) {
    return {
      srcSeqSet: copyuid[1],
      destSeqSet: copyuid[2]
    }
  }
}

/**
 * Parses APPEND (upload) response.
 * https://tools.ietf.org/html/rfc4315
 * @param {Object} response
 * @returns {String} The uid assigned to the uploaded message if available.
 */
export function parseAPPEND (response) {
  return response && response.appenduid && response.appenduid[1]
}
