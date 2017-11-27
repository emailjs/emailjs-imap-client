export const toTypedArray = str => new Uint8Array(str.split('').map(char => char.charCodeAt(0)))
export const fromTypedArray = arr => String.fromCharCode.apply(null, arr)
