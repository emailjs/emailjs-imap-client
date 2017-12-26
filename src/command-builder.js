import { parser } from 'emailjs-imap-handler'
import {
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
  let command = {
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
