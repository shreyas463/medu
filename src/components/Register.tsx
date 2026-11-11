import type { Direction, Sign, Token, Word } from "../types.ts"

type RegisterProps = {
  line: Token[]
  signs: Map<string, Sign>
  direction: Direction
  selectedKey: string | null
  words: Word[]
  dragOver: boolean
  onInspect: (id: string, key: string) => void
  onLoadWord: (word: Word) => void
  onDragOver: (over: boolean) => void
  onDropSign: (id: string) => void
}

export function Register({
  line,
  signs,
  direction,
  selectedKey,
  words,
  dragOver,
  onInspect,
  onLoadWord,
  onDragOver,
  onDropSign,
}: RegisterProps) {
  const empty = line.length === 0

  return (
    <section
      className={dragOver ? "register dragover" : "register"}
      aria-label="The line you are writing"
      onDragOver={(event) => {
        event.preventDefault()
        onDragOver(true)
      }}
      onDragLeave={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && event.currentTarget.contains(next)) return
        onDragOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDragOver(false)
        const id = event.dataTransfer.getData("text/plain")
        if (id) onDropSign(id)
      }}
    >
      <div
        className={empty ? "register-line is-empty" : "register-line"}
        data-direction={direction}
        data-tour="line"
      >
        {empty ? (
          <p className="empty-prompt">Touch a sign.</p>
        ) : (
          line.map((token) => {
            const sign = signs.get(token.id)
            if (!sign) return null
            const selected = token.key === selectedKey
            return (
              <button
                key={token.key}
                type="button"
                className={selected ? "register-sign is-selected" : "register-sign"}
                aria-pressed={selected}
                aria-label={`${sign.id}. ${sign.depiction}`}
                onClick={() => onInspect(sign.id, token.key)}
              >
                <span className="register-glyph" aria-hidden="true">
                  {sign.glyph}
                </span>
                <span className="register-sound">{sign.sound || sign.id}</span>
              </button>
            )
          })
        )}
      </div>
      {empty ? (
        <div className="chips" data-tour="words" aria-label="Starter words">
          {words.map((word) => (
            <button key={word.id} type="button" className="chip" onClick={() => onLoadWord(word)}>
              <span className="chip-glyphs" aria-hidden="true">
                {word.signs.map((id) => signs.get(id)?.glyph ?? "").join("")}
              </span>
              <span className="chip-label">{word.label}</span>
              <span className="chip-gloss">{word.gloss}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="honesty">Read sign by sign. Medu does not translate a sentence.</p>
      )}
    </section>
  )
}
