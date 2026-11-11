import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

const steps = [
  {
    title: "How Medu works",
    body: "This is a short guide. Touch a sign, read what it means, then place it on the line.",
    target: null,
  },
  {
    title: "Touch a sign",
    body: "Start with Alphabet. Those twenty-four signs are sounds, like letters. The other groups are pictures of things.",
    target: "[data-tour='signs']",
  },
  {
    title: "Place it on the line",
    body: "Press Carve to add the sign here. Read the line from the right, the way Egyptian is written.",
    target: "[data-tour='line']",
  },
  {
    title: "Or try a word",
    body: "These four words are ready to open: beautiful, life, the sun, and peace.",
    target: "[data-tour='words']",
  },
  {
    title: "Share when you want",
    body: "Copy the rubbing sends this line to someone. Save rubbing downloads a picture. Medu reads one sign at a time. It does not translate a whole sentence.",
    target: "[data-tour='share']",
  },
] as const

type TourProps = {
  open: boolean
  onClose: () => void
}

type Hole = { top: number; left: number; width: number; height: number }

export function Tour({ open, onClose }: TourProps) {
  const [step, setStep] = useState(0)
  const [hole, setHole] = useState<Hole | null>(null)
  const [cardTop, setCardTop] = useState<number | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const current = steps[step]
  const last = step === steps.length - 1

  useEffect(() => {
    if (!open) return
    nextRef.current?.focus()
  }, [open, step])

  useLayoutEffect(() => {
    if (!open) return
    const selector = current.target
    const place = () => {
      if (!selector) {
        setHole(null)
        setCardTop(null)
        return
      }
      const node = document.querySelector(selector)
      if (!node) {
        setHole(null)
        setCardTop(null)
        return
      }
      node.scrollIntoView({ block: "nearest", inline: "nearest" })
      const rect = node.getBoundingClientRect()
      const pad = 8
      const top = Math.max(8, rect.top - pad)
      const height = Math.min(rect.height + pad * 2, 240)
      setHole({
        top,
        left: Math.max(8, rect.left - pad),
        width: Math.min(rect.width + pad * 2, window.innerWidth - 16),
        height,
      })
      const cardHeight = 230
      const gap = 16
      const below = top + height + gap
      if (below + cardHeight <= window.innerHeight - 12) setCardTop(below)
      else setCardTop(Math.max(12, top - gap - cardHeight))
    }
    place()
    window.addEventListener("resize", place)
    return () => window.removeEventListener("resize", place)
  }, [open, current])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !current) return null

  function advance() {
    if (last) onClose()
    else setStep((value) => value + 1)
  }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {hole ? (
        <div
          className="tour-hole"
          style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
        />
      ) : (
        <div className="tour-dim" />
      )}
      <div
        className={hole ? "tour-card is-anchored" : "tour-card"}
        style={cardTop === null ? undefined : { top: cardTop }}
      >
        <p className="tour-count">
          {step + 1} of {steps.length}
        </p>
        <h2 id={titleId}>{current.title}</h2>
        <p>{current.body}</p>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={onClose}>
            Skip
          </button>
          <button type="button" className="tour-next" ref={nextRef} onClick={advance}>
            {last ? "Start" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
