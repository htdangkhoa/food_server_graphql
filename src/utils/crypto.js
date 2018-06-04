import { AES, enc } from 'crypto-js'

const secret = 'eaeda983-09a8-4f27-a2b4-fc4448b357d5'

const encrypt = data => {
  return AES.encrypt(data, secret).toString()
}

const decrypt = data => {
  return AES.decrypt(data, secret).toString(enc.Utf8)
}

export {
  encrypt,
  decrypt
}