/**
 * Convierte cualquier string a Title Case para renderizado con fuentes display/script.
 * Necesario porque las fuentes cursivas se ven mal con MAYÚSCULAS COMPLETAS.
 * "ZODIAK" → "Zodiak"  |  "ARMA TU JOYA" → "Arma Tu Joya"
 */
export function toTitleCase(str: string): string {
  if (!str) return str
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
