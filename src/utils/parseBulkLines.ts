/**
 * Splits pasted multi-line text (e.g. a checklist copied from Notes) into
 * trimmed, non-empty lines, stripping common leading bullet/number markers
 * so "- Telur" or "1. Telur" both become "Telur".
 */
export function parseBulkLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter((line) => line.length > 0)
}
