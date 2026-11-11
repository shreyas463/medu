import { signByLower } from "../data/signs.ts"
import type { Token } from "../types.ts"

let sequence = 0

export function makeToken(id: string): Token {
  sequence += 1
  return { key: `${id}-${sequence}`, id }
}

export function makeLine(ids: string[]): Token[] {
  return ids.map((id) => makeToken(id))
}

export function parseLine(hash: string): string[] {
  const raw = hash.replace(/^#/, "").trim().slice(0, 240)
  let body = ""
  try {
    body = decodeURIComponent(raw).trim()
  } catch {
    return []
  }
  if (!body) return []
  return body.split(/[-+.,\s]+/).flatMap((part) => {
    if (!/^[a-z0-9]+$/i.test(part)) return []
    const sign = signByLower.get(part.toLowerCase())
    return sign ? [sign.id] : []
  })
}

export function lineHash(ids: string[]): string {
  return ids.join("-")
}
