import rawSigns from "./signs.json"
import { alphabetIds, curated } from "./curated.ts"
import type { Sign } from "../types.ts"

type RawSign = Omit<Sign, "meaning" | "curated">

export const signs: Sign[] = (rawSigns as RawSign[]).map((sign) => {
  const extra = curated[sign.id]
  if (!extra) {
    return { ...sign, meaning: "", curated: false }
  }
  return { ...sign, ...extra, curated: true }
})

export const signById = new Map(signs.map((sign) => [sign.id, sign]))

export const signByLower = new Map(signs.map((sign) => [sign.id.toLowerCase(), sign]))

export const alphabetSigns = alphabetIds.flatMap((id) => {
  const sign = signById.get(id)
  return sign ? [sign] : []
})
