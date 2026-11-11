// Pulls the basic Egyptian Hieroglyphs block from Unicode Unikemet
// into src/data/signs.json. Run: npm run signs

import { writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const SOURCE = "https://www.unicode.org/Public/UCD/latest/ucd/Unikemet.txt"
const here = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(here, "../src/data/signs.json")

const text = await fetch(SOURCE).then((response) => {
  if (!response.ok) throw new Error(`Unikemet fetch failed: ${response.status}`)
  return response.text()
})

const byCodePoint = new Map()
for (const line of text.split("\n")) {
  if (!line || line.startsWith("#")) continue
  const [codePoint, tag, ...rest] = line.split("\t")
  if (!byCodePoint.has(codePoint)) byCodePoint.set(codePoint, { cp: codePoint })
  byCodePoint.get(codePoint)[tag] = rest.join("\t")
}

function normalizeUniK(unik = "") {
  const match = unik.match(/^([A-Z]+)(\d+)(.*)$/)
  if (!match) return unik
  const prefix = match[1] === "AA" ? "Aa" : match[1]
  return prefix + String(parseInt(match[2], 10)) + match[3]
}

function displayId(record) {
  if (record.kEH_JSesh && !record.kEH_JSesh.startsWith("US")) return record.kEH_JSesh
  return normalizeUniK(record.kEH_UniK || "")
}

function categoryOf(id, unik = "") {
  const source = id.startsWith("US") ? unik : id
  if (source.startsWith("Aa") || source.startsWith("AA")) return "Aa"
  if (source.startsWith("NL")) return "NL"
  if (source.startsWith("NU")) return "NU"
  const letter = source.match(/^([A-Z])/)
  return letter ? letter[1] : "Aa"
}

function usageOf(func = "") {
  const value = func.toLowerCase()
  if (value.includes("phonemogram") || value.includes("phono-repeater")) return "sound"
  if (value.includes("logogram")) return "word"
  if (value.includes("classifier")) return "classifier"
  return null
}

function firstSentence(value = "") {
  const cleaned = value.replace(/\s+/g, " ").trim()
  if (!cleaned) return ""
  const end = cleaned.search(/[.!?](\s|$)/)
  return end === -1 ? cleaned : cleaned.slice(0, end + 1)
}

const basic = [...byCodePoint.values()].filter((record) => {
  const point = Number.parseInt(record.cp.slice(2), 16)
  return point >= 0x13000 && point <= 0x1342f
})

const seen = new Set()
const signs = []
for (const record of basic) {
  let id = displayId(record)
  if (!id) id = record.cp
  if (seen.has(id)) id = `${id}-${record.cp.slice(2)}`
  seen.add(id)
  const depiction = firstSentence(record.kEH_Desc)
  signs.push({
    id,
    cp: record.cp,
    glyph: String.fromCodePoint(Number.parseInt(record.cp.slice(2), 16)),
    category: categoryOf(id, record.kEH_UniK || ""),
    depiction: depiction || `Hieroglyph ${id}.`,
    sound: (record.kEH_FVal || "").trim(),
    usage: usageOf(record.kEH_Func),
    functionText: (record.kEH_Func || "").replace(/\s+/g, " ").trim(),
  })
}

function rank(id) {
  const match = id.match(/^([A-Za-z]+)(\d+)(.*)$/)
  if (!match) return [id, 0, ""]
  return [match[1], Number(match[2]), match[3]]
}

signs.sort((a, b) => {
  const [ap, an, as] = rank(a.id)
  const [bp, bn, bs] = rank(b.id)
  if (ap !== bp) return ap < bp ? -1 : 1
  if (an !== bn) return an - bn
  return as < bs ? -1 : as > bs ? 1 : 0
})

writeFileSync(outPath, JSON.stringify(signs))
console.log(`Wrote ${signs.length} signs to ${outPath}`)
