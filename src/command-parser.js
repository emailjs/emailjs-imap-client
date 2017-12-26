import parseAddress from 'emailjs-addressparser'
import { pathOr } from 'ramda'
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

  let attributes = [].concat(response.payload.NAMESPACE.pop().attributes || [])
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

  let mailbox = {
    readOnly: response.code === 'READ-ONLY'
  }
  let existsResponse = response.payload.EXISTS && response.payload.EXISTS.pop()
  let flagsResponse = response.payload.FLAGS && response.payload.FLAGS.pop()
  let okResponse = response.payload.OK

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
  let envelope = {}

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
    let parsed = parseAddress(formatted).shift() // there should be just a single address
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
