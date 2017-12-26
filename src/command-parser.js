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
