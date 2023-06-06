export function generateRandomBigInt(length: number): bigint {
  const byteLength = Math.ceil(length / 8); // Convert bits to bytes
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);
  const hexString = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return BigInt(`0x${hexString}`);
}
