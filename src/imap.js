import { propOr } from 'ramda'
import TCPSocket from 'emailjs-tcp-socket'
import { toTypedArray, fromTypedArray } from './common'
import { parser, compiler } from 'emailjs-imap-handler'
import Compression from './compression'
import CompressionBlob from '../res/compression.worker.blob'

//
// constants used for communication with the worker
//
const MESSAGE_INITIALIZE_WORKER = 'start'
const MESSAGE_INFLATE = 'inflate'
const MESSAGE_INFLATED_DATA_READY = 'inflated_ready'
const MESSAGE_DEFLATE = 'deflate'
const MESSAGE_DEFLATED_DATA_READY = 'deflated_ready'

const EOL = '\r\n'
const LINE_FEED = 10
const CARRIAGE_RETURN = 13
const LEFT_CURLY_BRACKET = 123
const RIGHT_CURLY_BRACKET = 125

const ASCII_PLUS = 43

// State tracking when constructing an IMAP command from buffers.
const BUFFER_STATE_LITERAL = 'literal'
const BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1 = 'literal_length_1'
const BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2 = 'literal_length_2'
const BUFFER_STATE_DEFAULT = 'default'

/**
 * How much time to wait since the last response until the connection is considered idling
 */
const TIMEOUT_ENTER_IDLE = 1000

/**
 * Lower Bound for socket timeout to wait since the last data was written to a socket
 */
const TIMEOUT_SOCKET_LOWER_BOUND = 10000

/**
 * Multiplier for socket timeout:
 *
 * We assume at least a GPRS connection with 115 kb/s = 14,375 kB/s tops, so 10 KB/s to be on
 * the safe side. We can timeout after a lower bound of 10s + (n KB / 10 KB/s). A 1 MB message
 * upload would be 110 seconds to wait for the timeout. 10 KB/s === 0.1 s/B
 */
const TIMEOUT_SOCKET_MULTIPLIER = 0.1

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
export default class Imap {
  constructor (host, port, options = {}) {
    this.timeoutEnterIdle = TIMEOUT_ENTER_IDLE
    this.timeoutSocketLowerBound = TIMEOUT_SOCKET_LOWER_BOUND
    this.timeoutSocketMultiplier = TIMEOUT_SOCKET_MULTIPLIER

    this.options = options

    this.port = port || (this.options.useSecureTransport ? 993 : 143)
    this.host = host || 'localhost'

    // Use a TLS connection. Port 993 also forces TLS.
    this.options.useSecureTransport = 'useSecureTransport' in this.options ? !!this.options.useSecureTransport : this.port === 993

    this.secureMode = !!this.options.useSecureTransport // Does the connection use SSL/TLS

    this._connectionReady = false // Is the conection established and greeting is received from the server

    this._globalAcceptUntagged = {} // Global handlers for unrelated responses (EXPUNGE, EXISTS etc.)

    this._clientQueue = [] // Queue of outgoing commands
    this._canSend = false // Is it OK to send something to the server
    this._tagCounter = 0 // Counter to allow uniqueue imap tags
    this._currentCommand = false // Current command that is waiting for response from the server

    this._idleTimer = false // Timer waiting to enter idle
    this._socketTimeoutTimer = false // Timer waiting to declare the socket dead starting from the last write

    this.compressed = false // Is the connection compressed and needs inflating/deflating

    //
    // HELPERS
    //

    // As the server sends data in chunks, it needs to be split into separate lines. Helps parsing the input.
    this._incomingBuffers = []
    this._bufferState = BUFFER_STATE_DEFAULT
    this._literalRemaining = 0

    //
    // Event placeholders, may be overriden with callback functions
    //
    this.oncert = null
    this.onerror = null // Irrecoverable error occurred. Connection to the server will be closed automatically.
    this.onready = null // The connection to the server has been established and greeting is received
    this.onidle = null // There are no more commands to process
  }

  // PUBLIC METHODS

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
  connect (Socket = TCPSocket) {
    return new Promise((resolve, reject) => {
      this.socket = Socket.open(this.host, this.port, {
        binaryType: 'arraybuffer',
        useSecureTransport: this.secureMode,
        ca: this.options.ca
      })

      // allows certificate handling for platform w/o native tls support
      // oncert is non standard so setting it might throw if the socket object is immutable
      try {
        this.socket.oncert = (cert) => { this.oncert && this.oncert(cert) }
      } catch (E) { }

      // Connection closing unexpected is an error
      this.socket.onclose = () => this._onError(new Error('Socket closed unexpectedly!'))
      this.socket.ondata = (evt) => {
        try {
          this._onData(evt)
        } catch (err) {
          this._onError(err)
        }
      }

      // if an error happens during create time, reject the promise
      this.socket.onerror = (e) => {
        reject(new Error('Could not open socket: ' + e.data.message))
      }

      this.socket.onopen = () => {
        // use proper "irrecoverable error, tear down everything"-handler only after socket is open
        this.socket.onerror = (e) => this._onError(e)
        resolve()
      }
    })
  }

  /**
   * Closes the connection to the server
   *
   * @returns {Promise} Resolves when the socket is closed
   */
  close (error) {
    return new Promise((resolve) => {
      var tearDown = () => {
        // fulfill pending promises
        this._clientQueue.forEach(cmd => cmd.callback(error))
        if (this._currentCommand) {
          this._currentCommand.callback(error)
        }

        this._clientQueue = []
        this._currentCommand = false

        clearTimeout(this._idleTimer)
        this._idleTimer = null

        clearTimeout(this._socketTimeoutTimer)
        this._socketTimeoutTimer = null

        if (this.socket) {
          // remove all listeners
          this.socket.onopen = null
          this.socket.onclose = null
          this.socket.ondata = null
          this.socket.onerror = null
          try {
            this.socket.oncert = null
          } catch (E) { }

          this.socket = null
        }

        resolve()
      }

      this._disableCompression()

      if (!this.socket || this.socket.readyState !== 'open') {
        return tearDown()
      }

      this.socket.onclose = this.socket.onerror = tearDown // we don't really care about the error here
      this.socket.close()
    })
  }

  /**
   * Send LOGOUT to the server.
   *
   * Use is discouraged!
   *
   * @returns {Promise} Resolves when connection is closed by server.
   */
  logout () {
    return new Promise((resolve, reject) => {
      this.socket.onclose = this.socket.onerror = () => {
        this.close('Client logging out').then(resolve).catch(reject)
      }

      this.enqueueCommand('LOGOUT')
    })
  }

  /**
   * Initiates TLS handshake
   */
  upgrade () {
    this.secureMode = true
    this.socket.upgradeToSecure()
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
  enqueueCommand (request, acceptUntagged, options) {
    if (typeof request === 'string') {
      request = {
        command: request
      }
    }

    acceptUntagged = [].concat(acceptUntagged || []).map((untagged) => (untagged || '').toString().toUpperCase().trim())

    var tag = 'W' + (++this._tagCounter)
    request.tag = tag

    return new Promise((resolve, reject) => {
      var data = {
        tag: tag,
        request: request,
        payload: acceptUntagged.length ? {} : undefined,
        callback: (response) => {
          if (this.isError(response)) {
            return reject(response)
          } else if (['NO', 'BAD'].indexOf(propOr('', 'command', response).toUpperCase().trim()) >= 0) {
            var error = new Error(response.humanReadable || 'Error')
            if (response.code) {
              error.code = response.code
            }
            return reject(error)
          }

          resolve(response)
        }
      }

      // apply any additional options to the command
      Object.keys(options || {}).forEach((key) => { data[key] = options[key] })

      acceptUntagged.forEach((command) => { data.payload[command] = [] })

      // if we're in priority mode (i.e. we ran commands in a precheck),
      // queue any commands BEFORE the command that contianed the precheck,
      // otherwise just queue command as usual
      var index = data.ctx ? this._clientQueue.indexOf(data.ctx) : -1
      if (index >= 0) {
        data.tag += '.p'
        data.request.tag += '.p'
        this._clientQueue.splice(index, 0, data)
      } else {
        this._clientQueue.push(data)
      }

      if (this._canSend) {
        this._sendRequest()
      }
    })
  }

  /**
   *
   * @param commands
   * @param ctx
   * @returns {*}
   */
  getPreviouslyQueued (commands, ctx) {
    const startIndex = this._clientQueue.indexOf(ctx) - 1

    // search backwards for the commands and return the first found
    for (let i = startIndex; i >= 0; i--) {
      if (isMatch(this._clientQueue[i])) {
        return this._clientQueue[i]
      }
    }

    // also check current command if no SELECT is queued
    if (isMatch(this._currentCommand)) {
      return this._currentCommand
    }

    return false

    function isMatch (data) {
      return data && data.request && commands.indexOf(data.request.command) >= 0
    }
  }

  /**
   * Send data to the TCP socket
   * Arms a timeout waiting for a response from the server.
   *
   * @param {String} str Payload
   */
  send (str) {
    const buffer = toTypedArray(str).buffer
    const timeout = this.timeoutSocketLowerBound + Math.floor(buffer.byteLength * this.timeoutSocketMultiplier)

    clearTimeout(this._socketTimeoutTimer) // clear pending timeouts
    this._socketTimeoutTimer = setTimeout(() => this._onError(new Error(' Socket timed out!')), timeout) // arm the next timeout

    if (this.compressed) {
      this._sendCompressed(buffer)
    } else {
      this.socket.send(buffer)
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
  setHandler (command, callback) {
    this._globalAcceptUntagged[command.toUpperCase().trim()] = callback
  }

  // INTERNAL EVENTS

  /**
   * Error handler for the socket
   *
   * @event
   * @param {Event} evt Event object. See evt.data for the error
   */
  _onError (evt) {
    var error
    if (this.isError(evt)) {
      error = evt
    } else if (evt && this.isError(evt.data)) {
      error = evt.data
    } else {
      error = new Error((evt && evt.data && evt.data.message) || evt.data || evt || 'Error')
    }

    this.logger.error(error)

    // always call onerror callback, no matter if close() succeeds or fails
    this.close(error).then(() => {
      this.onerror && this.onerror(error)
    }, () => {
      this.onerror && this.onerror(error)
    })
  }

  /**
   * Handler for incoming data from the server. The data is sent in arbitrary
   * chunks and can't be used directly so this function makes sure the data
   * is split into complete lines before the data is passed to the command
   * handler
   *
   * @param {Event} evt
   */
  _onData (evt) {
    clearTimeout(this._socketTimeoutTimer) // reset the timeout on each data packet
    const timeout = this.timeoutSocketLowerBound + Math.floor(4096 * this.timeoutSocketMultiplier) // max packet size is 4096 bytes
    this._socketTimeoutTimer = setTimeout(() => this._onError(new Error(' Socket timed out!')), timeout)

    this._incomingBuffers.push(new Uint8Array(evt.data)) // append to the incoming buffer
    this._parseIncomingCommands(this._iterateIncomingBuffer()) // Consume the incoming buffer
  }

  * _iterateIncomingBuffer () {
    let buf = this._incomingBuffers[this._incomingBuffers.length - 1] || []
    let i = 0

    // loop invariant:
    //   this._incomingBuffers starts with the beginning of incoming command.
    //   buf is shorthand for last element of this._incomingBuffers.
    //   buf[0..i-1] is part of incoming command.
    while (i < buf.length) {
      switch (this._bufferState) {
        case BUFFER_STATE_LITERAL:
          const diff = Math.min(buf.length - i, this._literalRemaining)
          this._literalRemaining -= diff
          i += diff
          if (this._literalRemaining === 0) {
            this._bufferState = BUFFER_STATE_DEFAULT
          }
          continue

        case BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2:
          if (i < buf.length) {
            if (buf[i] === CARRIAGE_RETURN) {
              this._literalRemaining = Number(fromTypedArray(this._lengthBuffer)) + 2 // for CRLF
              this._bufferState = BUFFER_STATE_LITERAL
            } else {
              this._bufferState = BUFFER_STATE_DEFAULT
            }
            delete this._lengthBuffer
          }
          continue

        case BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1:
          const start = i
          while (i < buf.length && buf[i] >= 48 && buf[i] <= 57) { // digits
            i++
          }
          if (start !== i) {
            const latest = buf.subarray(start, i)
            const prevBuf = this._lengthBuffer
            this._lengthBuffer = new Uint8Array(prevBuf.length + latest.length)
            this._lengthBuffer.set(prevBuf)
            this._lengthBuffer.set(latest, prevBuf.length)
          }
          if (i < buf.length) {
            if (this._lengthBuffer.length > 0 && buf[i] === RIGHT_CURLY_BRACKET) {
              this._bufferState = BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_2
            } else {
              delete this._lengthBuffer
              this._bufferState = BUFFER_STATE_DEFAULT
            }
            i++
          }
          continue

        default:
          // find literal length
          const leftIdx = buf.indexOf(LEFT_CURLY_BRACKET, i)
          if (leftIdx > -1) {
            const leftOfLeftCurly = new Uint8Array(buf.buffer, i, leftIdx - i)
            if (leftOfLeftCurly.indexOf(LINE_FEED) === -1) {
              i = leftIdx + 1
              this._lengthBuffer = new Uint8Array(0)
              this._bufferState = BUFFER_STATE_POSSIBLY_LITERAL_LENGTH_1
              continue
            }
          }

          // find end of command
          const LFidx = buf.indexOf(LINE_FEED, i)
          if (LFidx > -1) {
            if (LFidx < buf.length - 1) {
              this._incomingBuffers[this._incomingBuffers.length - 1] = new Uint8Array(buf.buffer, 0, LFidx + 1)
            }
            const commandLength = this._incomingBuffers.reduce((prev, curr) => prev + curr.length, 0) - 2 // 2 for CRLF
            const command = new Uint8Array(commandLength)
            let index = 0
            while (this._incomingBuffers.length > 0) {
              let uint8Array = this._incomingBuffers.shift()

              const remainingLength = commandLength - index
              if (uint8Array.length > remainingLength) {
                const excessLength = uint8Array.length - remainingLength
                uint8Array = uint8Array.subarray(0, -excessLength)

                if (this._incomingBuffers.length > 0) {
                  this._incomingBuffers = []
                }
              }
              command.set(uint8Array, index)
              index += uint8Array.length
            }
            yield command
            if (LFidx < buf.length - 1) {
              buf = new Uint8Array(buf.subarray(LFidx + 1))
              this._incomingBuffers.push(buf)
              i = 0
            } else {
              // clear the timeout when an entire command has arrived
              // and not waiting on more data for next command
              clearTimeout(this._socketTimeoutTimer)
              this._socketTimeoutTimer = null
              return
            }
          } else {
            return
          }
      }
    }
  }

  // PRIVATE METHODS

  /**
   * Processes a command from the queue. The command is parsed and feeded to a handler
   */
  _parseIncomingCommands (commands) {
    for (var command of commands) {
      this._clearIdle()

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
          var chunk = this._currentCommand.data.shift()
          chunk += (!this._currentCommand.data.length ? EOL : '') // EOL if there's nothing more to send
          this.send(chunk)
        } else if (this._currentCommand.errorResponseExpectsEmptyLine) {
          this.send(EOL) // XOAUTH2 empty response, error will be reported when server continues with NO response
        }
        continue
      }

      var response
      try {
        const valueAsString = this._currentCommand.request && this._currentCommand.request.valueAsString
        response = parser(command, { valueAsString })
        this.logger.debug('S:', () => compiler(response, false, true))
      } catch (e) {
        this.logger.error('Error parsing imap command!', response)
        return this._onError(e)
      }

      this._processResponse(response)
      this._handleResponse(response)

      // first response from the server, connection is now usable
      if (!this._connectionReady) {
        this._connectionReady = true
        this.onready && this.onready()
      }
    }
  }

  /**
   * Feeds a parsed response object to an appropriate handler
   *
   * @param {Object} response Parsed command object
   */
  _handleResponse (response) {
    var command = propOr('', 'command', response).toUpperCase().trim()

    if (!this._currentCommand) {
      // unsolicited untagged response
      if (response.tag === '*' && command in this._globalAcceptUntagged) {
        this._globalAcceptUntagged[command](response)
        this._canSend = true
        this._sendRequest()
      }
    } else if (this._currentCommand.payload && response.tag === '*' && command in this._currentCommand.payload) {
      // expected untagged response
      this._currentCommand.payload[command].push(response)
    } else if (response.tag === '*' && command in this._globalAcceptUntagged) {
      // unexpected untagged response
      this._globalAcceptUntagged[command](response)
    } else if (response.tag === this._currentCommand.tag) {
      // tagged response
      if (this._currentCommand.payload && Object.keys(this._currentCommand.payload).length) {
        response.payload = this._currentCommand.payload
      }
      this._currentCommand.callback(response)
      this._canSend = true
      this._sendRequest()
    }
  }

  /**
   * Sends a command from client queue to the server.
   */
  _sendRequest () {
    if (!this._clientQueue.length) {
      return this._enterIdle()
    }
    this._clearIdle()

    // an operation was made in the precheck, no need to restart the queue manually
    this._restartQueue = false

    var command = this._clientQueue[0]
    if (typeof command.precheck === 'function') {
      // remember the context
      var context = command
      var precheck = context.precheck
      delete context.precheck

      // we need to restart the queue handling if no operation was made in the precheck
      this._restartQueue = true

      // invoke the precheck command and resume normal operation after the promise resolves
      precheck(context).then(() => {
        // we're done with the precheck
        if (this._restartQueue) {
          // we need to restart the queue handling
          this._sendRequest()
        }
      }).catch((err) => {
        // precheck failed, so we remove the initial command
        // from the queue, invoke its callback and resume normal operation
        let cmd
        const index = this._clientQueue.indexOf(context)
        if (index >= 0) {
          cmd = this._clientQueue.splice(index, 1)[0]
        }
        if (cmd && cmd.callback) {
          cmd.callback(err)
          this._canSend = true
          this._parseIncomingCommands(this._iterateIncomingBuffer()) // Consume the rest of the incoming buffer
          this._sendRequest() // continue sending
        }
      })
      return
    }

    this._canSend = false
    this._currentCommand = this._clientQueue.shift()

    try {
      this._currentCommand.data = compiler(this._currentCommand.request, true)
      this.logger.debug('C:', () => compiler(this._currentCommand.request, false, true)) // excludes passwords etc.
    } catch (e) {
      this.logger.error('Error compiling imap command!', this._currentCommand.request)
      return this._onError(new Error('Error compiling imap command!'))
    }

    var data = this._currentCommand.data.shift()

    this.send(data + (!this._currentCommand.data.length ? EOL : ''))
    return this.waitDrain
  }

  /**
   * Emits onidle, noting to do currently
   */
  _enterIdle () {
    clearTimeout(this._idleTimer)
    this._idleTimer = setTimeout(() => (this.onidle && this.onidle()), this.timeoutEnterIdle)
  }

  /**
   * Cancel idle timer
   */
  _clearIdle () {
    clearTimeout(this._idleTimer)
    this._idleTimer = null
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
  _processResponse (response) {
    const command = propOr('', 'command', response).toUpperCase().trim()

    // no attributes
    if (!response || !response.attributes || !response.attributes.length) {
      return
    }

    // untagged responses w/ sequence numbers
    if (response.tag === '*' && /^\d+$/.test(response.command) && response.attributes[0].type === 'ATOM') {
      response.nr = Number(response.command)
      response.command = (response.attributes.shift().value || '').toString().toUpperCase().trim()
    }

    // no optional response code
    if (['OK', 'NO', 'BAD', 'BYE', 'PREAUTH'].indexOf(command) < 0) {
      return
    }

    // If last element of the response is TEXT then this is for humans
    if (response.attributes[response.attributes.length - 1].type === 'TEXT') {
      response.humanReadable = response.attributes[response.attributes.length - 1].value
    }

    // Parse and format ATOM values
    if (response.attributes[0].type === 'ATOM' && response.attributes[0].section) {
      const option = response.attributes[0].section.map((key) => {
        if (!key) {
          return
        }
        if (Array.isArray(key)) {
          return key.map((key) => (key.value || '').toString().trim())
        } else {
          return (key.value || '').toString().toUpperCase().trim()
        }
      })

      const key = option.shift()
      response.code = key

      if (option.length === 1) {
        response[key.toLowerCase()] = option[0]
      } else if (option.length > 1) {
        response[key.toLowerCase()] = option
      }
    }
  }

  /**
   * Checks if a value is an Error object
   *
   * @param {Mixed} value Value to be checked
   * @return {Boolean} returns true if the value is an Error
   */
  isError (value) {
    return !!Object.prototype.toString.call(value).match(/Error\]$/)
  }

  // COMPRESSION RELATED METHODS

  /**
   * Sets up deflate/inflate for the IO
   */
  enableCompression () {
    this._socketOnData = this.socket.ondata
    this.compressed = true

    if (typeof window !== 'undefined' && window.Worker) {
      this._compressionWorker = new Worker(URL.createObjectURL(new Blob([CompressionBlob])))
      this._compressionWorker.onmessage = (e) => {
        var message = e.data.message
        var data = e.data.buffer

        switch (message) {
          case MESSAGE_INFLATED_DATA_READY:
            this._socketOnData({ data })
            break

          case MESSAGE_DEFLATED_DATA_READY:
            this.waitDrain = this.socket.send(data)
            break
        }
      }

      this._compressionWorker.onerror = (e) => {
        this._onError(new Error('Error handling compression web worker: ' + e.message))
      }

      this._compressionWorker.postMessage(createMessage(MESSAGE_INITIALIZE_WORKER))
    } else {
      const inflatedReady = (buffer) => { this._socketOnData({ data: buffer }) }
      const deflatedReady = (buffer) => { this.waitDrain = this.socket.send(buffer) }
      this._compression = new Compression(inflatedReady, deflatedReady)
    }

    // override data handler, decompress incoming data
    this.socket.ondata = (evt) => {
      if (!this.compressed) {
        return
      }

      if (this._compressionWorker) {
        this._compressionWorker.postMessage(createMessage(MESSAGE_INFLATE, evt.data), [evt.data])
      } else {
        this._compression.inflate(evt.data)
      }
    }
  }

  /**
   * Undoes any changes related to compression. This only be called when closing the connection
   */
  _disableCompression () {
    if (!this.compressed) {
      return
    }

    this.compressed = false
    this.socket.ondata = this._socketOnData
    this._socketOnData = null

    if (this._compressionWorker) {
      // terminate the worker
      this._compressionWorker.terminate()
      this._compressionWorker = null
    }
  }

  /**
   * Outgoing payload needs to be compressed and sent to socket
   *
   * @param {ArrayBuffer} buffer Outgoing uncompressed arraybuffer
   */
  _sendCompressed (buffer) {
    // deflate
    if (this._compressionWorker) {
      this._compressionWorker.postMessage(createMessage(MESSAGE_DEFLATE, buffer), [buffer])
    } else {
      this._compression.deflate(buffer)
    }
  }
}

const createMessage = (message, buffer) => ({ message, buffer })
