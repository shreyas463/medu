import { alphabetSigns } from "../data/signs.ts"
import { categoryLabel } from "../data/categories.ts"
import type { Sign } from "../types.ts"

function matches(haystack: string, needle: string) {
  if (needle.length >= 3 && /^[a-z]+$/.test(needle)) {
    let from = 0
    while (from < haystack.length) {
      const at = haystack.indexOf(needle, from)
      if (at < 0) return false
      const before = at === 0 ? "" : haystack.charAt(at - 1)
      if (!/[a-z0-9]/.test(before)) return true
      from = at + needle.length
    }
    return false
  }
  return haystack.includes(needle)
}

export function visibleSigns(signs: Sign[], query: string, category: string): Sign[] {
  const needle = query.trim().toLowerCase().slice(0, 80)
  if (!needle) {
    if (category === "alphabet") return alphabetSigns
    return signs.filter((sign) => sign.category === category)
  }
  return signs.filter((sign) => {
    const group = categoryLabel.get(sign.category) ?? sign.category
    const haystack = [sign.id, sign.depiction, sign.sound, sign.meaning, sign.functionText, sign.glyph, group]
      .join(" ")
      .toLowerCase()
    return matches(haystack, needle)
  })
}
