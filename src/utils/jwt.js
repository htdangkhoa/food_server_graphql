import { encrypt, decrypt } from './crypto'
import jwt from 'jsonwebtoken'
import User from '../models/user.model'

const secret = 'adb40a5d-2be7-4604-9bec-d2729edcdc56'

const sign = async (payload, options) => {
  if (typeof payload === "object") payload = JSON.stringify(payload)

  return await jwt.sign({ data: encrypt(payload) }, secret, options || {})
}

const verify = async (token, cb) => {
  let payload = await jwt.verify(token, secret, cb)

  let raw = decrypt(payload.data)

  try {
    let { email, password } = JSON.parse(raw)

    let user = await User.findOne({
      email,
      password
    })

    return user
  } catch (error) {
    throw `invalid token.`
  }
}

export {
  sign,
  verify
}