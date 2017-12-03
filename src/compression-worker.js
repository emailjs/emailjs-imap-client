import Compressor from './compression'

const MESSAGE_INITIALIZE_WORKER = 'start'
const MESSAGE_INFLATE = 'inflate'
const MESSAGE_INFLATED_DATA_READY = 'inflated_ready'
const MESSAGE_DEFLATE = 'deflate'
const MESSAGE_DEFLATED_DATA_READY = 'deflated_ready'

const createMessage = (message, buffer) => ({ message, buffer })

const inflatedReady = buffer => self.postMessage(createMessage(MESSAGE_INFLATED_DATA_READY, buffer), [buffer])
const deflatedReady = buffer => self.postMessage(createMessage(MESSAGE_DEFLATED_DATA_READY, buffer), [buffer])
const compressor = new Compressor(inflatedReady, deflatedReady)

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
