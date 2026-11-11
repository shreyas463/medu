import { alphabetSigns } from "../data/signs.ts"
import { categoryLabel } from "../data/categories.ts"
import type { Sign } from "../types.ts"

function matches(haystack: string, needle: string) {
  if (needle.length >= 3 && /^[a-z]+$/.test(needle)) {
    return new RegExp(`(?:^|[^a-z0-9])${needle}`).test(haystack)
  }
  return haystack.includes(needle)
}

export function visibleSigns(signs: Sign[], query: string, category: string): Sign[] {
  const needle = query.trim().toLowerCase()
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
