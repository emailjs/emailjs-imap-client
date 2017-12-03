import Compressor from './emailjs-imap-client-compression'

const MESSAGE_INITIALIZE_WORKER = 'start'
const MESSAGE_INFLATE = 'inflate'
const MESSAGE_INFLATED_DATA_READY = 'inflated_ready'
const MESSAGE_DEFLATE = 'deflate'
const MESSAGE_DEFLATED_DATA_READY = 'deflated_ready'

const createMessage = (message, buffer) => ({ message, buffer })

var compressor = new Compressor()
compressor.inflatedReady = buffer => self.postMessage(createMessage(MESSAGE_INFLATED_DATA_READY, buffer), [buffer])
compressor.deflatedReady = buffer => self.postMessage(createMessage(MESSAGE_DEFLATED_DATA_READY, buffer), [buffer])

self.onmessage = function (e) {
  const message = e.data.message
  const buffer = e.data.buffer

  switch (message) {
    case MESSAGE_INITIALIZE_WORKER:
      break

    case MESSAGE_INFLATE:
      compressor.inflate(buffer)
      break

    case MESSAGE_DEFLATE:
      compressor.deflate(buffer)
      break
  }
}
