export function cleanupNonAsciiChars(input: string) {
  const nonAsciiChars = /[^\x00-\x7F]/g;
  return input.replace(nonAsciiChars, '');
}