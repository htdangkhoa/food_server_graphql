import { encrypt, decrypt } from './crypto'
import jwt from 'jsonwebtoken'
import User from '../models/user.model'

const secret = 'adb40a5d-2be7-4604-9bec-d2729edcdc56'

const sign = async payload => {
  if (typeof payload === "object") payload = JSON.stringify(payload)

  return await jwt.sign(encrypt(payload), secret)
}

const verify = async (token, cb) => {
  if (!token) throw `You are missing token.`

  let _tk = token.split('Bearer ')[1]

  if (!_tk) throw `invalid token.`

  let payload = await jwt.verify(_tk, secret, cb)

  let raw = decrypt(payload)

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