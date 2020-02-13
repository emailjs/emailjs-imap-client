import { map, pipe, union, zip, fromPairs, propOr, pathOr, flatten } from 'ramda'
import { imapEncode, imapDecode } from 'emailjs-utf7'
import {
  parseAPPEND,
  parseCOPY,
  parseNAMESPACE,
  parseSELECT,
  parseFETCH,
  parseSEARCH
} from './command-parser'
import {
  buildFETCHCommand,
  buildXOAuth2Token,
  buildSEARCHCommand,
  buildSTORECommand
} from './command-builder'

import createDefaultLogger from './logger'
import ImapClient from './imap'
import {
  LOG_LEVEL_ERROR,
  LOG_LEVEL_WARN,
  LOG_LEVEL_INFO,
  LOG_LEVEL_DEBUG,
  LOG_LEVEL_ALL
} from './common'

import {
  checkSpecialUse
} from './special-use'

export const TIMEOUT_CONNECTION = 90 * 1000 // Milliseconds to wait for the IMAP greeting from the server
export const TIMEOUT_NOOP = 60 * 1000 // Milliseconds between NOOP commands while idling
export const TIMEOUT_IDLE = 60 * 1000 // Milliseconds until IDLE command is cancelled

export const STATE_CONNECTING = 1
export const STATE_NOT_AUTHENTICATED = 2
export const STATE_AUTHENTICATED = 3
export const STATE_SELECTED = 4
export const STATE_LOGOUT = 5

export const DEFAULT_CLIENT_ID = {
  name: 'emailjs-imap-client'
}

/**
 * emailjs IMAP client
 *
 * @constructor
 *
 * @param {String} [host='localhost'] Hostname to conenct to
 * @param {Number} [port=143] Port number to connect to
 * @param {Object} [options] Optional options object
 */
export default class Client {
  constructor (host, port, options = {}) {
    this.timeoutConnection = TIMEOUT_CONNECTION
    this.timeoutNoop = TIMEOUT_NOOP
    this.timeoutIdle = TIMEOUT_IDLE

    this.serverId = false // RFC 2971 Server ID as key value pairs

    // Event placeholders
    this.oncert = null
    this.onupdate = null
    this.onselectmailbox = null
    this.onclosemailbox = null

    this._host = host
    this._clientId = propOr(DEFAULT_CLIENT_ID, 'id', options)
    this._state = false // Current state
    this._authenticated = false // Is the connection authenticated
    this._capability = [] // List of extensions the server supports
    this._selectedMailbox = false // Selected mailbox
    this._enteredIdle = false
    this._idleTimeout = false
    this._enableCompression = !!options.enableCompression
    this._auth = options.auth
    this._requireTLS = !!options.requireTLS
    this._ignoreTLS = !!options.ignoreTLS

    this.client = new ImapClient(host, port, options) // IMAP client object

    // Event Handlers
    this.client.onerror = this._onError.bind(this)
    this.client.oncert = (cert) => (this.oncert && this.oncert(cert)) // allows certificate handling for platforms w/o native tls support
    this.client.onidle = () => this._onIdle() // start idling

    // Default handlers for untagged responses
    this.client.setHandler('capability', (response) => this._untaggedCapabilityHandler(response)) // capability updates
    this.client.setHandler('ok', (response) => this._untaggedOkHandler(response)) // notifications
    this.client.setHandler('exists', (response) => this._untaggedExistsHandler(response)) // message count has changed
    this.client.setHandler('expunge', (response) => this._untaggedExpungeHandler(response)) // message has been deleted
    this.client.setHandler('fetch', (response) => this._untaggedFetchHandler(response)) // message has been updated (eg. flag change)

    // Activate logging
    this.createLogger()
    this.logLevel = propOr(LOG_LEVEL_ALL, 'logLevel', options)
  }

  /**
   * Called if the lower-level ImapClient has encountered an unrecoverable
   * error during operation. Cleans up and propagates the error upwards.
   */
  _onError (err) {
    // make sure no idle timeout is pending anymore
    clearTimeout(this._idleTimeout)

    // propagate the error upwards
    this.onerror && this.onerror(err)
  }

  //
  //
  // PUBLIC API
  //
  //

  /**
   * Initiate connection and login to the IMAP server
   *
   * @returns {Promise} Promise when login procedure is complete
   */
  async connect () {
    try {
      await this.openConnection()
      await this.upgradeConnection()
      try {
        await this.updateId(this._clientId)
      } catch (err) {
        this.logger.warn('Failed to update server id!', err.message)
      }

      await this.login(this._auth)
      await this.compressConnection()
      this.logger.debug('Connection established, ready to roll!')
      this.client.onerror = this._onError.bind(this)
    } catch (err) {
      this.logger.error('Could not connect to server', err)
      this.close(err) // we don't really care whether this works or not
      throw err
    }
  }

  /**
   * Initiate connection to the IMAP server
   *
   * @returns {Promise} capability of server without login
   */
  openConnection () {
    return new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => reject(new Error('Timeout connecting to server')), this.timeoutConnection)
      this.logger.debug('Connecting to', this.client.host, ':', this.client.port)
      this._changeState(STATE_CONNECTING)
      this.client.connect().then(() => {
        this.logger.debug('Socket opened, waiting for greeting from the server...')

        this.client.onready = () => {
          clearTimeout(connectionTimeout)
          this._changeState(STATE_NOT_AUTHENTICATED)
          this.updateCapability()
            .then(() => resolve(this._capability))
        }

        this.client.onerror = (err) => {
          clearTimeout(connectionTimeout)
          reject(err)
        }
      }).catch(reject)
    })
  }

  /**
   * Logout
   *
   * Send LOGOUT, to which the server responds by closing the connection.
   * Use is discouraged if network status is unclear! If networks status is
   * unclear, please use #close instead!
   *
   * LOGOUT details:
   *   https://tools.ietf.org/html/rfc3501#section-6.1.3
   *
   * @returns {Promise} Resolves when server has closed the connection
   */
  async logout () {
    this._changeState(STATE_LOGOUT)
    this.logger.debug('Logging out...')
    await this.client.logout()
    clearTimeout(this._idleTimeout)
  }

  /**
   * Force-closes the current connection by closing the TCP socket.
   *
   * @returns {Promise} Resolves when socket is closed
   */
  async close (err) {
    this._changeState(STATE_LOGOUT)
    clearTimeout(this._idleTimeout)
    this.logger.debug('Closing connection...')
    await this.client.close(err)
    clearTimeout(this._idleTimeout)
  }

  /**
   * Runs ID command, parses ID response, sets this.serverId
   *
   * ID details:
   *   http://tools.ietf.org/html/rfc2971
   *
   * @param {Object} id ID as JSON object. See http://tools.ietf.org/html/rfc2971#section-3.3 for possible values
   * @returns {Promise} Resolves when response has been parsed
   */
  async updateId (id) {
    if (this._capability.indexOf('ID') < 0) return

    this.logger.debug('Updating id...')

    const command = 'ID'
    const attributes = id ? [flatten(Object.entries(id))] : [null]
    const response = await this.exec({ command, attributes }, 'ID')
    const list = flatten(pathOr([], ['payload', 'ID', '0', 'attributes', '0'], response).map(Object.values))
    const keys = list.filter((_, i) => i % 2 === 0)
    const values = list.filter((_, i) => i % 2 === 1)
    this.serverId = fromPairs(zip(keys, values))
    this.logger.debug('Server id updated!', this.serverId)
  }

  _shouldSelectMailbox (path, ctx) {
    if (!ctx) {
      return true
    }

    const previousSelect = this.client.getPreviouslyQueued(['SELECT', 'EXAMINE'], ctx)
    if (previousSelect && previousSelect.request.attributes) {
      const pathAttribute = previousSelect.request.attributes.find((attribute) => attribute.type === 'STRING')
      if (pathAttribute) {
        return pathAttribute.value !== path
      }
    }

    return this._selectedMailbox !== path
  }

  /**
   * Runs SELECT or EXAMINE to open a mailbox
   *
   * SELECT details:
   *   http://tools.ietf.org/html/rfc3501#section-6.3.1
   * EXAMINE details:
   *   http://tools.ietf.org/html/rfc3501#section-6.3.2
   *
   * @param {String} path Full path to mailbox
   * @param {Object} [options] Options object
   * @returns {Promise} Promise with information about the selected mailbox
   */
  async selectMailbox (path, options = {}) {
    const query = {
      command: options.readOnly ? 'EXAMINE' : 'SELECT',
      attributes: [{ type: 'STRING', value: path }]
    }

    if (options.condstore && this._capability.indexOf('CONDSTORE') >= 0) {
      query.attributes.push([{ type: 'ATOM', value: 'CONDSTORE' }])
    }

    this.logger.debug('Opening', path, '...')
    const response = await this.exec(query, ['EXISTS', 'FLAGS', 'OK'], { ctx: options.ctx })
    const mailboxInfo = parseSELECT(response)

    this._changeState(STATE_SELECTED)

    if (this._selectedMailbox !== path && this.onclosemailbox) {
      await this.onclosemailbox(this._selectedMailbox)
    }
    this._selectedMailbox = path
    if (this.onselectmailbox) {
      await this.onselectmailbox(path, mailboxInfo)
    }

    return mailboxInfo
  }

  /**
   * Runs NAMESPACE command
   *
   * NAMESPACE details:
   *   https://tools.ietf.org/html/rfc2342
   *
   * @returns {Promise} Promise with namespace object
   */
  async listNamespaces () {
    if (this._capability.indexOf('NAMESPACE') < 0) return false

    this.logger.debug('Listing namespaces...')
    const response = await this.exec('NAMESPACE', 'NAMESPACE')
    return parseNAMESPACE(response)
  }

  /**
   * Runs LIST and LSUB commands. Retrieves a tree of available mailboxes
   *
   * LIST details:
   *   http://tools.ietf.org/html/rfc3501#section-6.3.8
   * LSUB details:
   *   http://tools.ietf.org/html/rfc3501#section-6.3.9
   *
   * @returns {Promise} Promise with list of mailboxes
   */
  async listMailboxes () {
    const tree = { root: true, children: [] }

    this.logger.debug('Listing mailboxes...')
    const listResponse = await this.exec({ command: 'LIST', attributes: ['', '*'] }, 'LIST')
    const list = pathOr([], ['payload', 'LIST'], listResponse)
    list.forEach(item => {
      const attr = propOr([], 'attributes', item)
      if (attr.length < 3) return

      const path = pathOr('', ['2', 'value'], attr)
      const delim = pathOr('/', ['1', 'value'], attr)
      const branch = this._ensurePath(tree, path, delim)
      branch.flags = propOr([], '0', attr).map(({ value }) => value || '')
      branch.listed = true
      checkSpecialUse(branch)
    })

    const lsubResponse = await this.exec({ command: 'LSUB', attributes: ['', '*'] }, 'LSUB')
    const lsub = pathOr([], ['payload', 'LSUB'], lsubResponse)
    lsub.forEach((item) => {
      const attr = propOr([], 'attributes', item)
      if (attr.length < 3) return

      const path = pathOr('', ['2', 'value'], attr)
      const delim = pathOr('/', ['1', 'value'], attr)
      const branch = this._ensurePath(tree, path, delim)
      propOr([], '0', attr).map((flag = '') => { branch.flags = union(branch.flags, [flag]) })
      branch.subscribed = true
    })

    return tree
  }

  /**
   * Create a mailbox with the given path.
   *
   * CREATE details:
   *   http://tools.ietf.org/html/rfc3501#section-6.3.3
   *
   * @param {String} path
   *     The path of the mailbox you would like to create.  This method will
   *     handle utf7 encoding for you.
   * @returns {Promise}
   *     Promise resolves if mailbox was created.
   *     In the event the server says NO [ALREADYEXISTS], we treat that as success.
   */
  async createMailbox (path) {
    this.logger.debug('Creating mailbox', path, '...')
    try {
      await this.exec({ command: 'CREATE', attributes: [imapEncode(path)] })
    } catch (err) {
      if (err && err.code === 'ALREADYEXISTS') {
        return
      }
      throw err
    }
  }

  /**
   * Delete a mailbox with the given path.
   *
   * DELETE details:
   *   https://tools.ietf.org/html/rfc3501#section-6.3.4
   *
   * @param {String} path
   *     The path of the mailbox you would like to delete.  This method will
   *     handle utf7 encoding for you.
   * @returns {Promise}
   *     Promise resolves if mailbox was deleted.
   */
  deleteMailbox (path) {
    this.logger.debug('Deleting mailbox', path, '...')
    return this.exec({ command: 'DELETE', attributes: [imapEncode(path)] })
  }

  /**
   * Runs FETCH command
   *
   * FETCH details:
   *   http://tools.ietf.org/html/rfc3501#section-6.4.5
   * CHANGEDSINCE details:
   *   https://tools.ietf.org/html/rfc4551#section-3.3
   *
   * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
   * @param {String} sequence Sequence set, eg 1:* for all messages
   * @param {Object} [items] Message data item names or macro
   * @param {Object} [options] Query modifiers
   * @returns {Promise} Promise with the fetched message info
   */
  async listMessages (path, sequence, items = [{ fast: true }], options = {}) {
    this.logger.debug('Fetching messages', sequence, 'from', path, '...')
    const command = buildFETCHCommand(sequence, items, options)
    const response = await this.exec(command, 'FETCH', {
      precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
    })
    return parseFETCH(response)
  }

  /**
   * Runs SEARCH command
   *
   * SEARCH details:
   *   http://tools.ietf.org/html/rfc3501#section-6.4.4
   *
   * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
   * @param {Object} query Search terms
   * @param {Object} [options] Query modifiers
   * @returns {Promise} Promise with the array of matching seq. or uid numbers
   */
  async search (path, query, options = {}) {
    this.logger.debug('Searching in', path, '...')
    const command = buildSEARCHCommand(query, options)
    const response = await this.exec(command, 'SEARCH', {
      precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
    })
    return parseSEARCH(response)
  }

  /**
   * Runs STORE command
   *
   * STORE details:
   *   http://tools.ietf.org/html/rfc3501#section-6.4.6
   *
   * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
   * @param {String} sequence Message selector which the flag change is applied to
   * @param {Array} flags
   * @param {Object} [options] Query modifiers
   * @returns {Promise} Promise with the array of matching seq. or uid numbers
   */
  setFlags (path, sequence, flags, options) {
    let key = ''
    let list = []

    if (Array.isArray(flags) || typeof flags !== 'object') {
      list = [].concat(flags || [])
      key = ''
    } else if (flags.add) {
      list = [].concat(flags.add || [])
      key = '+'
    } else if (flags.set) {
      key = ''
      list = [].concat(flags.set || [])
    } else if (flags.remove) {
      key = '-'
      list = [].concat(flags.remove || [])
    }

    this.logger.debug('Setting flags on', sequence, 'in', path, '...')
    return this.store(path, sequence, key + 'FLAGS', list, options)
  }

  /**
   * Runs STORE command
   *
   * STORE details:
   *   http://tools.ietf.org/html/rfc3501#section-6.4.6
   *
   * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
   * @param {String} sequence Message selector which the flag change is applied to
   * @param {String} action STORE method to call, eg "+FLAGS"
   * @param {Array} flags
   * @param {Object} [options] Query modifiers
   * @returns {Promise} Promise with the array of matching seq. or uid numbers
   */
  async store (path, sequence, action, flags, options = {}) {
    const command = buildSTORECommand(sequence, action, flags, options)
    const response = await this.exec(command, 'FETCH', {
      precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
    })
    return parseFETCH(response)
  }

  /**
   * Runs APPEND command
   *
   * APPEND details:
   *   http://tools.ietf.org/html/rfc3501#section-6.3.11
   *
   * @param {String} destination The mailbox where to append the message
   * @param {String} message The message to append
   * @param {Array} options.flags Any flags you want to set on the uploaded message. Defaults to [\Seen]. (optional)
   * @returns {Promise} Promise with the array of matching seq. or uid numbers
   */
  async upload (destination, message, options = {}) {
    const flags = propOr(['\\Seen'], 'flags', options).map(value => ({ type: 'atom', value }))
    const command = {
      command: 'APPEND',
      attributes: [
        { type: 'atom', value: destination },
        flags,
        { type: 'literal', value: message }
      ]
    }

    this.logger.debug('Uploading message to', destination, '...')
    const response = await this.exec(command)
    return parseAPPEND(response)
  }

  /**
   * Deletes messages from a selected mailbox
   *
   * EXPUNGE details:
   *   http://tools.ietf.org/html/rfc3501#section-6.4.3
   * UID EXPUNGE details:
   *   https://tools.ietf.org/html/rfc4315#section-2.1
   *
   * If possible (byUid:true and UIDPLUS extension supported), uses UID EXPUNGE
   * command to delete a range of messages, otherwise falls back to EXPUNGE.
   *
   * NB! This method might be destructive - if EXPUNGE is used, then any messages
   * with \Deleted flag set are deleted
   *
   * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
   * @param {String} sequence Message range to be deleted
   * @param {Object} [options] Query modifiers
   * @returns {Promise} Promise
   */
  async deleteMessages (path, sequence, options = {}) {
    // add \Deleted flag to the messages and run EXPUNGE or UID EXPUNGE
    this.logger.debug('Deleting messages', sequence, 'in', path, '...')
    const useUidPlus = options.byUid && this._capability.indexOf('UIDPLUS') >= 0
    const uidExpungeCommand = { command: 'UID EXPUNGE', attributes: [{ type: 'sequence', value: sequence }] }
    await this.setFlags(path, sequence, { add: '\\Deleted' }, options)
    const cmd = useUidPlus ? uidExpungeCommand : 'EXPUNGE'
    return this.exec(cmd, null, {
      precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
    })
  }

  /**
   * Copies a range of messages from the active mailbox to the destination mailbox.
   * Silent method (unless an error occurs), by default returns no information.
   *
   * COPY details:
   *   http://tools.ietf.org/html/rfc3501#section-6.4.7
   *
   * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
   * @param {String} sequence Message range to be copied
   * @param {String} destination Destination mailbox path
   * @param {Object} [options] Query modifiers
   * @param {Boolean} [options.byUid] If true, uses UID COPY instead of COPY
   * @returns {Promise} Promise
   */
  async copyMessages (path, sequence, destination, options = {}) {
    this.logger.debug('Copying messages', sequence, 'from', path, 'to', destination, '...')
    const response = await this.exec({
      command: options.byUid ? 'UID COPY' : 'COPY',
      attributes: [
        { type: 'sequence', value: sequence },
        { type: 'atom', value: destination }
      ]
    }, null, {
      precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
    })
    return parseCOPY(response)
  }

  /**
   * Moves a range of messages from the active mailbox to the destination mailbox.
   * Prefers the MOVE extension but if not available, falls back to
   * COPY + EXPUNGE
   *
   * MOVE details:
   *   http://tools.ietf.org/html/rfc6851
   *
   * @param {String} path The path for the mailbox which should be selected for the command. Selects mailbox if necessary
   * @param {String} sequence Message range to be moved
   * @param {String} destination Destination mailbox path
   * @param {Object} [options] Query modifiers
   * @returns {Promise} Promise
   */
  async moveMessages (path, sequence, destination, options = {}) {
    this.logger.debug('Moving messages', sequence, 'from', path, 'to', destination, '...')

    if (this._capability.indexOf('MOVE') === -1) {
      // Fallback to COPY + EXPUNGE
      await this.copyMessages(path, sequence, destination, options)
      return this.deleteMessages(path, sequence, options)
    }

    // If possible, use MOVE
    return this.exec({
      command: options.byUid ? 'UID MOVE' : 'MOVE',
      attributes: [
        { type: 'sequence', value: sequence },
        { type: 'atom', value: destination }
      ]
    }, ['OK'], {
      precheck: (ctx) => this._shouldSelectMailbox(path, ctx) ? this.selectMailbox(path, { ctx }) : Promise.resolve()
    })
  }

  /**
   * Runs COMPRESS command
   *
   * COMPRESS details:
   *   https://tools.ietf.org/html/rfc4978
   */
  async compressConnection () {
    if (!this._enableCompression || this._capability.indexOf('COMPRESS=DEFLATE') < 0 || this.client.compressed) {
      return false
    }

    this.logger.debug('Enabling compression...')
    await this.exec({
      command: 'COMPRESS',
      attributes: [{
        type: 'ATOM',
        value: 'DEFLATE'
      }]
    })
    this.client.enableCompression()
    this.logger.debug('Compression enabled, all data sent and received is deflated!')
  }

  /**
   * Runs LOGIN or AUTHENTICATE XOAUTH2 command
   *
   * LOGIN details:
   *   http://tools.ietf.org/html/rfc3501#section-6.2.3
   * XOAUTH2 details:
   *   https://developers.google.com/gmail/xoauth2_protocol#imap_protocol_exchange
   *
   * @param {String} auth.user
   * @param {String} auth.pass
   * @param {String} auth.xoauth2
   */
  async login (auth) {
    let command
    const options = {}

    if (!auth) {
      throw new Error('Authentication information not provided')
    }

    if (this._capability.indexOf('AUTH=XOAUTH2') >= 0 && auth && auth.xoauth2) {
      command = {
        command: 'AUTHENTICATE',
        attributes: [
          { type: 'ATOM', value: 'XOAUTH2' },
          { type: 'ATOM', value: buildXOAuth2Token(auth.user, auth.xoauth2), sensitive: true }
        ]
      }

      options.errorResponseExpectsEmptyLine = true // + tagged error response expects an empty line in return
    } else {
      command = {
        command: 'login',
        attributes: [
          { type: 'STRING', value: auth.user || '' },
          { type: 'STRING', value: auth.pass || '', sensitive: true }
        ]
      }
    }

    this.logger.debug('Logging in...')
    const response = await this.exec(command, 'capability', options)
    /*
     * update post-auth capabilites
     * capability list shouldn't contain auth related stuff anymore
     * but some new extensions might have popped up that do not
     * make much sense in the non-auth state
     */
    if (response.capability && response.capability.length) {
      // capabilites were listed with the OK [CAPABILITY ...] response
      this._capability = response.capability
    } else if (response.payload && response.payload.CAPABILITY && response.payload.CAPABILITY.length) {
      // capabilites were listed with * CAPABILITY ... response
      this._capability = response.payload.CAPABILITY.pop().attributes.map((capa = '') => capa.value.toUpperCase().trim())
    } else {
      // capabilities were not automatically listed, reload
      await this.updateCapability(true)
    }

    this._changeState(STATE_AUTHENTICATED)
    this._authenticated = true
    this.logger.debug('Login successful, post-auth capabilites updated!', this._capability)
  }

  /**
   * Run an IMAP command.
   *
   * @param {Object} request Structured request object
   * @param {Array} acceptUntagged a list of untagged responses that will be included in 'payload' property
   */
  async exec (request, acceptUntagged, options) {
    this.breakIdle()
    const response = await this.client.enqueueCommand(request, acceptUntagged, options)
    if (response && response.capability) {
      this._capability = response.capability
    }
    return response
  }

  /**
   * The connection is idling. Sends a NOOP or IDLE command
   *
   * IDLE details:
   *   https://tools.ietf.org/html/rfc2177
   */
  enterIdle () {
    if (this._enteredIdle) {
      return
    }
    const supportsIdle = this._capability.indexOf('IDLE') >= 0
    this._enteredIdle = supportsIdle && this._selectedMailbox ? 'IDLE' : 'NOOP'
    this.logger.debug('Entering idle with ' + this._enteredIdle)

    if (this._enteredIdle === 'NOOP') {
      this._idleTimeout = setTimeout(() => {
        this.logger.debug('Sending NOOP')
        this.exec('NOOP')
      }, this.timeoutNoop)
    } else if (this._enteredIdle === 'IDLE') {
      this.client.enqueueCommand({
        command: 'IDLE'
      })
      this._idleTimeout = setTimeout(() => {
        this.client.send('DONE\r\n')
        this._enteredIdle = false
        this.logger.debug('Idle terminated')
      }, this.timeoutIdle)
    }
  }

  /**
   * Stops actions related idling, if IDLE is supported, sends DONE to stop it
   */
  breakIdle () {
    if (!this._enteredIdle) {
      return
    }

    clearTimeout(this._idleTimeout)
    if (this._enteredIdle === 'IDLE') {
      this.client.send('DONE\r\n')
      this.logger.debug('Idle terminated')
    }
    this._enteredIdle = false
  }

  /**
   * Runs STARTTLS command if needed
   *
   * STARTTLS details:
   *   http://tools.ietf.org/html/rfc3501#section-6.2.1
   *
   * @param {Boolean} [forced] By default the command is not run if capability is already listed. Set to true to skip this validation
   */
  async upgradeConnection () {
    // skip request, if already secured
    if (this.client.secureMode) {
      return false
    }

    // skip if STARTTLS not available or starttls support disabled
    if ((this._capability.indexOf('STARTTLS') < 0 || this._ignoreTLS) && !this._requireTLS) {
      return false
    }

    this.logger.debug('Encrypting connection...')
    await this.exec('STARTTLS')
    this._capability = []
    this.client.upgrade()
    return this.updateCapability()
  }

  /**
   * Runs CAPABILITY command
   *
   * CAPABILITY details:
   *   http://tools.ietf.org/html/rfc3501#section-6.1.1
   *
   * Doesn't register untagged CAPABILITY handler as this is already
   * handled by global handler
   *
   * @param {Boolean} [forced] By default the command is not run if capability is already listed. Set to true to skip this validation
   */
  async updateCapability (forced) {
    // skip request, if not forced update and capabilities are already loaded
    if (!forced && this._capability.length) {
      return
    }

    // If STARTTLS is required then skip capability listing as we are going to try
    // STARTTLS anyway and we re-check capabilities after connection is secured
    if (!this.client.secureMode && this._requireTLS) {
      return
    }

    this.logger.debug('Updating capability...')
    return this.exec('CAPABILITY')
  }

  hasCapability (capa = '') {
    return this._capability.indexOf(capa.toUpperCase().trim()) >= 0
  }

  // Default handlers for untagged responses

  /**
   * Checks if an untagged OK includes [CAPABILITY] tag and updates capability object
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedOkHandler (response) {
    if (response && response.capability) {
      this._capability = response.capability
    }
  }

  /**
   * Updates capability object
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedCapabilityHandler (response) {
    this._capability = pipe(
      propOr([], 'attributes'),
      map(({ value }) => (value || '').toUpperCase().trim())
    )(response)
  }

  /**
   * Updates existing message count
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedExistsHandler (response) {
    if (response && Object.prototype.hasOwnProperty.call(response, 'nr')) {
      this.onupdate && this.onupdate(this._selectedMailbox, 'exists', response.nr)
    }
  }

  /**
   * Indicates a message has been deleted
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedExpungeHandler (response) {
    if (response && Object.prototype.hasOwnProperty.call(response, 'nr')) {
      this.onupdate && this.onupdate(this._selectedMailbox, 'expunge', response.nr)
    }
  }

  /**
   * Indicates that flags have been updated for a message
   *
   * @param {Object} response Parsed server response
   * @param {Function} next Until called, server responses are not processed
   */
  _untaggedFetchHandler (response) {
    this.onupdate && this.onupdate(this._selectedMailbox, 'fetch', [].concat(parseFETCH({ payload: { FETCH: [response] } }) || []).shift())
  }

  // Private helpers

  /**
   * Indicates that the connection started idling. Initiates a cycle
   * of NOOPs or IDLEs to receive notifications about updates in the server
   */
  _onIdle () {
    if (!this._authenticated || this._enteredIdle) {
      // No need to IDLE when not logged in or already idling
      return
    }

    this.logger.debug('Client started idling')
    this.enterIdle()
  }

  /**
   * Updates the IMAP state value for the current connection
   *
   * @param {Number} newState The state you want to change to
   */
  _changeState (newState) {
    if (newState === this._state) {
      return
    }

    this.logger.debug('Entering state: ' + newState)

    // if a mailbox was opened, emit onclosemailbox and clear selectedMailbox value
    if (this._state === STATE_SELECTED && this._selectedMailbox) {
      this.onclosemailbox && this.onclosemailbox(this._selectedMailbox)
      this._selectedMailbox = false
    }

    this._state = newState
  }

  /**
   * Ensures a path exists in the Mailbox tree
   *
   * @param {Object} tree Mailbox tree
   * @param {String} path
   * @param {String} delimiter
   * @return {Object} branch for used path
   */
  _ensurePath (tree, path, delimiter) {
    const names = path.split(delimiter)
    let branch = tree

    for (let i = 0; i < names.length; i++) {
      let found = false
      for (let j = 0; j < branch.children.length; j++) {
        if (this._compareMailboxNames(branch.children[j].name, imapDecode(names[i]))) {
          branch = branch.children[j]
          found = true
          break
        }
      }
      if (!found) {
        branch.children.push({
          name: imapDecode(names[i]),
          delimiter: delimiter,
          path: names.slice(0, i + 1).join(delimiter),
          children: []
        })
        branch = branch.children[branch.children.length - 1]
      }
    }
    return branch
  }

  /**
   * Compares two mailbox names. Case insensitive in case of INBOX, otherwise case sensitive
   *
   * @param {String} a Mailbox name
   * @param {String} b Mailbox name
   * @returns {Boolean} True if the folder names match
   */
  _compareMailboxNames (a, b) {
    return (a.toUpperCase() === 'INBOX' ? 'INBOX' : a) === (b.toUpperCase() === 'INBOX' ? 'INBOX' : b)
  }

  createLogger (creator = createDefaultLogger) {
    const logger = creator((this._auth || {}).user || '', this._host)
    this.logger = this.client.logger = {
      debug: (...msgs) => { if (LOG_LEVEL_DEBUG >= this.logLevel) { logger.debug(msgs) } },
      info: (...msgs) => { if (LOG_LEVEL_INFO >= this.logLevel) { logger.info(msgs) } },
      warn: (...msgs) => { if (LOG_LEVEL_WARN >= this.logLevel) { logger.warn(msgs) } },
      error: (...msgs) => { if (LOG_LEVEL_ERROR >= this.logLevel) { logger.error(msgs) } }
    }
  }
}
