export function cleanupNonAsciiChars(input: string) {
  // eslint-disable-next-line no-control-regex
  const nonAsciiChars = /[^\x00-\x7F]/g;
  return input.replace(nonAsciiChars, '');
}
