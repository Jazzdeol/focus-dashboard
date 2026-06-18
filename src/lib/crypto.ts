import crypto from 'crypto';

// Symmetric encryption for integration tokens at rest.
// The key lives ONLY in the server env var TOKEN_ENCRYPTION_KEY (32 bytes, base64).
// Generate one with:  openssl rand -base64 32
// Tokens are never sent to the browser; only this server code ever decrypts them.

function key(): Buffer {
  const k = process.env.TOKEN_ENCRYPTION_KEY;
  if (!k) throw new Error('TOKEN_ENCRYPTION_KEY is not set');
  const buf = Buffer.from(k, 'base64');
  if (buf.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must decode to 32 bytes (use: openssl rand -base64 32)');
  return buf;
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // iv:tag:ciphertext, all base64
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decrypt(payload: string): string {
  const [ivB, tagB, dataB] = payload.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataB, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}

// safe wrappers (null in -> null out)
export const enc = (s?: string | null) => (s ? encrypt(s) : null);
export const dec = (s?: string | null) => (s ? decrypt(s) : null);
