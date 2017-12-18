export const LOG_LEVEL_NONE = 1000
export const LOG_LEVEL_ERROR = 40
export const LOG_LEVEL_WARN = 30
export const LOG_LEVEL_INFO = 20
export const LOG_LEVEL_DEBUG = 10
export const LOG_LEVEL_ALL = 0

export const toTypedArray = str => new Uint8Array(str.split('').map(char => char.charCodeAt(0)))
export const fromTypedArray = arr => String.fromCharCode.apply(null, arr)
