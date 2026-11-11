import type { Direction, Sign } from "../types.ts"

export async function saveRubbing(line: Sign[], direction: Direction) {
  if (line.length === 0) return
  await document.fonts.load('92px "Noto Egyptian"')
  await document.fonts.load("500 18px Fraunces")
  await document.fonts.load("600 13px Outfit")

  const cell = 128
  const pad = 56
  const width = pad * 2 + cell * line.length
  const height = 340
  const scale = 2
  const canvas = document.createElement("canvas")
  canvas.width = width * scale
  canvas.height = height * scale
  const context = canvas.getContext("2d")
  if (!context) return
  context.scale(scale, scale)
  context.fillStyle = "#1a1814"
  context.fillRect(0, 0, width, height)

  context.fillStyle = "#c4a574"
  context.font = "600 13px Outfit, sans-serif"
  context.textAlign = "left"
  context.textBaseline = "alphabetic"
  context.fillText("MEDU", pad, 46)

  context.strokeStyle = "rgba(196, 165, 116, 0.9)"
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(pad, 228)
  context.lineTo(width - pad, 228)
  context.stroke()

  const visual = direction === "rtl" ? [...line].reverse() : line
  visual.forEach((sign, index) => {
    const x = pad + cell * index + cell / 2
    context.fillStyle = "#f3efe4"
    context.font = '92px "Noto Egyptian", sans-serif'
    context.textAlign = "center"
    context.textBaseline = "alphabetic"
    context.fillText(sign.glyph, x, 210)
    context.fillStyle = "#c4a574"
    context.font = "500 18px Fraunces, serif"
    context.fillText(sign.sound || sign.id, x, 268)
  })

  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = "medu-rubbing.png"
  link.click()
}
