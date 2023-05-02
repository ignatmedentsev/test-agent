import crypto from 'crypto';

export function create225Uid(stringifiedParameters: string) {
  return '2.25.' + (crypto.createHash('sha1').update(stringifiedParameters)
    .digest('hex')
    .split('')
    .map(i => i.charCodeAt(0).toString())
    .join('')
    .replace(/^0+/g, '')
    .substring(0, 39));
}
