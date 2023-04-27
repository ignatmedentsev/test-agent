import BigNumber from 'bignumber.js';
import type { BinaryToTextEncoding } from 'crypto';
import crypto from 'crypto';

// No system dependencies allowed because it's used in a migration

const SALT_LENGTH = 9;

export function createHash(password: string) {
  const salt = generateSalt(SALT_LENGTH);
  const hash = md5(password + salt);

  return salt + hash;
}

export function validateHash(hash: string, password: string) {
  if (!hash) {
    return false;
  }

  const salt = hash.substr(0, SALT_LENGTH);
  const validHash = salt + md5(password + salt);

  return hash === validHash;
}

export function md5(str: string, encoding: BinaryToTextEncoding = 'hex') {
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding);
}

export function generateHmac(data: string, key: string) {
  return crypto.createHmac('sha256', key).update(data).digest('base64');
}

export function generateRandomDecimalString(length?: number) {
  if (!length) {
    length = 64;
  }
  length = Math.min(Math.max(1, length), 128);

  const hex = new BigNumber(crypto.randomBytes(Math.ceil(length / 2) + 1).toString('hex'), 16);

  return hex.toString(10).slice(-length);
}

/**
 * Generates short 6-symbols UID, good for marking some parts of a whole.
 *
 * Taken from https://stackoverflow.com/a/6248722/7056287
 *
 * TODO: replace with nanoid: https://github.com/ai/nanoid with custom alphabet
 */
export function generateShortUid(length = 6) {
  let result = '';
  for (let i = 0; i < Math.ceil(length / 3); i++) {
    const rnd = (Math.random() * 46656) | 0; // eslint-disable-line no-bitwise
    result += ('000' + rnd.toString(36)).slice(-3);
  }

  return result.slice(0, length);
}

function generateSalt(len: number) {
  let salt = '';
  const set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';

  for (let i = 0; i < len; i++) {
    const p = Math.floor(Math.random() * set.length);
    salt += set[p];
  }

  return salt;
}
