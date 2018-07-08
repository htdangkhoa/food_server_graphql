import jwt from 'jsonwebtoken';
import { encrypt, decrypt } from './crypto';
import User from '../models/user.model';

const secret = 'adb40a5d-2be7-4604-9bec-d2729edcdc56';

const sign = async (payload, options) => {
  if (typeof payload === 'object') payload = JSON.stringify(payload);

  const cloneSign = await jwt.sign({ data: encrypt(payload) }, secret, options || {});

  return cloneSign;
};

const verify = async (token, cb) => {
  const payload = await jwt.verify(token, secret, cb);

  const raw = decrypt(payload.data);

  try {
    const { email, password } = JSON.parse(raw);

    const user = await User.findOne({
      email,
      password,
    });

    return user;
  } catch (error) {
    throw new Error('invalid token.');
  }
};

export { sign, verify };
