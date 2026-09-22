/**
 * Joins class name fragments, dropping falsy values.
 *
 * @param parts - Class name fragments; `false`, `null` and `undefined` are skipped.
 * @returns The joined class name string.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
