import type { Sign } from "../types.ts"

type ReadingProps = {
  sign: Sign | null
  canLift: boolean
  onCarve: (id: string) => void
  onLift: () => void
  onClose: () => void
}

const usageLabel: Record<NonNullable<Sign["usage"]>, string> = {
  sound: "A sound",
  word: "A whole word",
  classifier: "A silent classifier",
}

export function Reading({ sign, canLift, onCarve, onLift, onClose }: ReadingProps) {
  if (!sign) return null
  const long = sign.depiction.length > 110

  return (
    <aside className="reading" aria-label="Reading">
      <div className="reading-top">
        <p className="reading-id">
          {sign.id}
          {sign.usage === "sound" ? <span className="phonetic-name">Phonetic</span> : null}
        </p>
        <button type="button" className="sheet-close" onClick={onClose}>
          Close
        </button>
      </div>
      <p
        className="reading-glyph"
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("text/plain", sign.id)
          event.dataTransfer.effectAllowed = "copy"
        }}
      >
        {sign.glyph}
      </p>
      <p className={long ? "depiction is-long" : "depiction"}>{sign.depiction}</p>
      <div className="facts">
        <p>
          <span className="fact-label sound">Sounds like</span>
          <span className={sign.sound ? "fact-value sound-value" : "fact-value muted"}>
            {sign.sound || "No single sound"}
          </span>
        </p>
        <p>
          <span className="fact-label">Used as</span>
          <span className="fact-value">{sign.usage ? usageLabel[sign.usage] : "A sign"}</span>
        </p>
      </div>
      <div className="reading-actions">
        <button type="button" className="carve" onClick={() => onCarve(sign.id)}>
          Carve into the line
        </button>
        <button type="button" className="lift" onClick={onLift} disabled={!canLift}>
          Lift off
        </button>
      </div>
    </aside>
  )
}
