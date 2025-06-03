export function isValidTimestamp(x: string) {
  const convert = new Date(x);
  return !isNaN(convert.getDate());
}
