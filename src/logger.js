import {
  LOG_LEVEL_ERROR,
  LOG_LEVEL_WARN,
  LOG_LEVEL_INFO,
  LOG_LEVEL_DEBUG
} from './common'

let SESSIONCOUNTER = 0

export default function createDefaultLogger (username, hostname) {
  const session = ++SESSIONCOUNTER
  const log = (level, messages) => {
    messages = messages.map(msg => typeof msg === 'function' ? msg() : msg)
    const date = new Date().toISOString()
    const logMessage = `[${date}][${session}][${username}][${hostname}] ${messages.join(' ')}`
    if (level === LOG_LEVEL_DEBUG) {
      console.log('[DEBUG]' + logMessage)
    } else if (level === LOG_LEVEL_INFO) {
      console.info('[INFO]' + logMessage)
    } else if (level === LOG_LEVEL_WARN) {
      console.warn('[WARN]' + logMessage)
    } else if (level === LOG_LEVEL_ERROR) {
      console.error('[ERROR]' + logMessage)
    }
  }

  return {
    debug: msgs => log(LOG_LEVEL_DEBUG, msgs),
    info: msgs => log(LOG_LEVEL_INFO, msgs),
    warn: msgs => log(LOG_LEVEL_WARN, msgs),
    error: msgs => log(LOG_LEVEL_ERROR, msgs)
  }
}
