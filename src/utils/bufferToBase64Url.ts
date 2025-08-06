// src/utils/bufferToBase64Url.ts
export function bufferToBase64Url(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer)
    let string = ''
    for (let i = 0; i < uint8Array.byteLength; i++) {
      string += String.fromCharCode(uint8Array[i])
    }
    const base64 = btoa(string)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return base64
  }