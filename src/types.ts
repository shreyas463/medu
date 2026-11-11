export type Usage = "sound" | "word" | "classifier"

export type Direction = "rtl" | "ltr"

export type Sign = {
  id: string
  cp: string
  glyph: string
  category: string
  depiction: string
  sound: string
  usage: Usage | null
  functionText: string
  meaning: string
  curated: boolean
}

export type Token = {
  key: string
  id: string
}

export type Word = {
  id: string
  label: string
  gloss: string
  signs: string[]
}

export type Category = {
  id: string
  label: string
}
