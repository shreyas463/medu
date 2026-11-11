import { useRef } from "react"
import type { KeyboardEvent } from "react"
import type { Sign } from "../types.ts"

type SignWallProps = {
  signs: Sign[]
  activeId: string | null
  query: string
  roomy: boolean
  onInspect: (id: string) => void
}

export function SignWall({ signs, activeId, query, roomy, onInspect }: SignWallProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const searching = query.trim().length > 0

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const arrows = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"]
    if (!arrows.includes(event.key)) return
    const grid = gridRef.current
    if (!grid) return
    const buttons = [...grid.querySelectorAll<HTMLButtonElement>("button.cell")]
    const current = buttons.findIndex((button) => button === document.activeElement)
    if (current < 0) return
    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1
    let next = current
    if (event.key === "ArrowRight") next = current + 1
    if (event.key === "ArrowLeft") next = current - 1
    if (event.key === "ArrowDown") next = current + columns
    if (event.key === "ArrowUp") next = current - columns
    if (event.key === "Home") next = 0
    if (event.key === "End") next = buttons.length - 1
    const button = buttons[next]
    if (!button || next === current) return
    event.preventDefault()
    button.focus()
  }

  return (
    <section className={roomy ? "wall is-roomy" : "wall"} aria-label="Signs">
      <p className="wall-status">
        {searching
          ? `${signs.length} ${signs.length === 1 ? "sign matches" : "signs match"} “${query.trim()}”`
          : `${signs.length} ${signs.length === 1 ? "sign" : "signs"}`}
      </p>
      {signs.length === 0 ? (
        <p className="wall-empty">No sign matches that.</p>
      ) : (
        <div className="wall-grid" ref={gridRef} onKeyDown={onKeyDown}>
          {signs.map((sign) => (
            <button
              key={sign.id}
              type="button"
              className="cell"
              aria-pressed={sign.id === activeId}
              aria-label={`${sign.id}. ${sign.depiction}`}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", sign.id)
                event.dataTransfer.effectAllowed = "copy"
              }}
              onClick={() => onInspect(sign.id)}
            >
              <span className="cell-glyph" aria-hidden="true">
                {sign.glyph}
              </span>
              <span className="cell-code">{sign.id}</span>
            </button>
          ))}
        </div>
      )}
      <p className="colophon">
        Catalog descriptions from Unicode Unikemet. The alphabet, and the common signs Medu introduces, are written
        here. Glyphs are Noto Sans Egyptian Hieroglyphs.
      </p>
    </section>
  )
}
