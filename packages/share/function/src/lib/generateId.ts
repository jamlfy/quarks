export function generateHexId(length: 4 | 8 | 10 | 14 | 16 = 14): string {
  const bytesCount = length / 2;
  const bytes = new Uint8Array(bytesCount);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
