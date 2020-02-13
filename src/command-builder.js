import { parser } from 'emailjs-imap-handler'
import { encode } from 'emailjs-mime-codec'
import { encode as encodeBase64 } from 'emailjs-base64'
import {
  fromTypedArray,
  toTypedArray
} from './common'

/**
 * Builds a FETCH command
 *
 * @param {String} sequence Message range selector
 * @param {Array} items List of elements to fetch (eg. `['uid', 'envelope']`).
 * @param {Object} [options] Optional options object. Use `{byUid:true}` for `UID FETCH`
 * @returns {Object} Structured IMAP command
 */
export function buildFETCHCommand (sequence, items, options) {
  const command = {
    command: options.byUid ? 'UID FETCH' : 'FETCH',
    attributes: [{
      type: 'SEQUENCE',
      value: sequence
    }]
  }

  if (options.valueAsString !== undefined) {
    command.valueAsString = options.valueAsString
  }

  let query = []

  items.forEach((item) => {
    item = item.toUpperCase().trim()

    if (/^\w+$/.test(item)) {
      // alphanum strings can be used directly
      query.push({
        type: 'ATOM',
        value: item
      })
    } else if (item) {
      try {
        // parse the value as a fake command, use only the attributes block
        const cmd = parser(toTypedArray('* Z ' + item))
        query = query.concat(cmd.attributes || [])
      } catch (e) {
        // if parse failed, use the original string as one entity
        query.push({
          type: 'ATOM',
          value: item
        })
      }
    }
  })

  if (query.length === 1) {
    query = query.pop()
  }

  command.attributes.push(query)

  if (options.changedSince) {
    command.attributes.push([{
      type: 'ATOM',
      value: 'CHANGEDSINCE'
    }, {
      type: 'ATOM',
      value: options.changedSince
    }])
  }

  return command
}

/**
 * Builds a login token for XOAUTH2 authentication command
 *
 * @param {String} user E-mail address of the user
 * @param {String} token Valid access token for the user
 * @return {String} Base64 formatted login token
 */
export function buildXOAuth2Token (user = '', token) {
  const authData = [
    `user=${user}`,
    `auth=Bearer ${token}`,
    '',
    ''
  ]
  return encodeBase64(authData.join('\x01'))
}

/**
 * Compiles a search query into an IMAP command. Queries are composed as objects
 * where keys are search terms and values are term arguments. Only strings,
 * numbers and Dates are used. If the value is an array, the members of it
 * are processed separately (use this for terms that require multiple params).
 * If the value is a Date, it is converted to the form of "01-Jan-1970".
 * Subqueries (OR, NOT) are made up of objects
 *
 *    {unseen: true, header: ["subject", "hello world"]};
 *    SEARCH UNSEEN HEADER "subject" "hello world"
 *
 * @param {Object} query Search query
 * @param {Object} [options] Option object
 * @param {Boolean} [options.byUid] If ture, use UID SEARCH instead of SEARCH
 * @return {Object} IMAP command object
 */
export function buildSEARCHCommand (query = {}, options = {}) {
  const command = {
    command: options.byUid ? 'UID SEARCH' : 'SEARCH'
  }

  let isAscii = true

  const buildTerm = (query) => {
    let list = []

    Object.keys(query).forEach((key) => {
      let params = []
      const formatDate = (date) => date.toUTCString().replace(/^\w+, 0?(\d+) (\w+) (\d+).*/, '$1-$2-$3')
      const escapeParam = (param) => {
        if (typeof param === 'number') {
          return {
            type: 'number',
            value: param
          }
        } else if (typeof param === 'string') {
          if (/[\u0080-\uFFFF]/.test(param)) {
            isAscii = false
            return {
              type: 'literal',
              value: fromTypedArray(encode(param)) // cast unicode string to pseudo-binary as imap-handler compiles strings as octets
            }
          }
          return {
            type: 'string',
            value: param
          }
        } else if (Object.prototype.toString.call(param) === '[object Date]') {
          // RFC 3501 allows for dates to be placed in
          // double-quotes or left without quotes.  Some
          // servers (Yandex), do not like the double quotes,
          // so we treat the date as an atom.
          return {
            type: 'atom',
            value: formatDate(param)
          }
        } else if (Array.isArray(param)) {
          return param.map(escapeParam)
        } else if (typeof param === 'object') {
          return buildTerm(param)
        }
      }

      params.push({
        type: 'atom',
        value: key.toUpperCase()
      });

      [].concat(query[key] || []).forEach((param) => {
        switch (key.toLowerCase()) {
          case 'uid':
            param = {
              type: 'sequence',
              value: param
            }
            break
          // The Gmail extension values of X-GM-THRID and
          // X-GM-MSGID are defined to be unsigned 64-bit integers
          // and they must not be quoted strings or the server
          // will report a parse error.
          case 'x-gm-thrid':
          case 'x-gm-msgid':
            param = {
              type: 'number',
              value: param
            }
            break
          default:
            param = escapeParam(param)
        }
        if (param) {
          params = params.concat(param || [])
        }
      })
      list = list.concat(params || [])
    })

    return list
  }

  command.attributes = buildTerm(query)

  // If any string input is using 8bit bytes, prepend the optional CHARSET argument
  if (!isAscii) {
    command.attributes.unshift({
      type: 'atom',
      value: 'UTF-8'
    })
    command.attributes.unshift({
      type: 'atom',
      value: 'CHARSET'
    })
  }

  return command
}

/**
 * Creates an IMAP STORE command from the selected arguments
 */
export function buildSTORECommand (sequence, action = '', flags = [], options = {}) {
  const command = {
    command: options.byUid ? 'UID STORE' : 'STORE',
    attributes: [{
      type: 'sequence',
      value: sequence
    }]
  }

  command.attributes.push({
    type: 'atom',
    value: action.toUpperCase() + (options.silent ? '.SILENT' : '')
  })

  command.attributes.push(flags.map((flag) => {
    return {
      type: 'atom',
      value: flag
    }
  }))

  return command
}
