const BASE64URL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function generateUUIdUser(length: number): string {
  const bytesNeeded = Math.ceil((length * 6) / 8);
  const bytes = new Uint8Array(bytesNeeded);
  crypto.getRandomValues(bytes);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE64URL_CHARS[bytes[i] % 64];
  }

  return result;
}
