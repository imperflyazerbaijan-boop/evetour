/**
 * Repairs text that was UTF-8 encoded once and then decoded as Windows-1252.
 *
 * Russian content in the seed data was double-encoded, so what is stored in
 * the database reads as `Ð¡Ñ‚Ð°Ñ€Ñ‹Ð¹` rather than `Старый`. The damage is
 * fully reversible, but only with a correct cp1252 table: characters like
 * `‚` (U+201A) and `€` (U+20AC) sit above U+00FF, so a plain latin1
 * round-trip bails out and silently leaves the text broken.
 *
 * Every function here is a no-op on text that is already correct, so these can
 * be run over a whole database without risk.
 */

/** cp1252 0x80-0x9F, where the code points differ from Latin-1. */
const CP1252_HIGH: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
}

/** The damage, inverted: character → the byte that produced it. */
const CP1252_BACK: Record<string, number> = Object.fromEntries(
  Object.entries(CP1252_HIGH).map(([cp, byte]) => [
    String.fromCodePoint(Number(cp)),
    byte,
  ]),
)

/** Latin-1 letters: the fingerprint of double-encoded Russian. */
const SUSPECT = /[À-ÿ]/

const CYRILLIC = /[Ѐ-ӿ]/

/**
 * Reverses one round of "UTF-8 bytes decoded as cp1252".
 *
 * Returns the input unchanged when it does not look damaged, or when a repair
 * would not produce Cyrillic — so it can never mangle correct text.
 */
export function repairMojibake(input: string): string {
  if (!input || !SUSPECT.test(input)) return input

  const bytes: number[] = []
  for (const ch of input) {
    const cp = ch.codePointAt(0)!
    const mapped = CP1252_BACK[ch]
    if (mapped !== undefined) bytes.push(mapped)
    else if (cp <= 0xff) bytes.push(cp)
    else return input // mixed content — not this pattern, leave it alone
  }

  try {
    // fatal: true rejects invalid sequences instead of emitting U+FFFD.
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(
      new Uint8Array(bytes),
    )
    return CYRILLIC.test(decoded) ? decoded : input
  } catch {
    return input
  }
}

/** Recursively repairs every string inside a JSON document. */
export function repairJson(raw: string): string {
  if (!raw) return raw
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return repairMojibake(raw)
  }
  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') return repairMojibake(node)
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(node)) out[k] = walk(v)
      return out
    }
    return node
  }
  return JSON.stringify(walk(value))
}

/** True when a string still looks like double-encoded text. */
export function isDamaged(input: string): boolean {
  return repairMojibake(input) !== input || repairJson(input) !== input
}