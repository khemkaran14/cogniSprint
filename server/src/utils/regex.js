// Escapes user input before dropping it into a RegExp, so search text like
// "a+b?" is treated literally instead of as regex syntax.
export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
