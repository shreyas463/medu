import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"

const steps = [
  {
    title: "Touch a sign",
    body: "Read what it means, then place it on the line.",
    target: null,
  },
  {
    title: "The alphabet is sound",
    body: "Twenty-four signs work like letters. The other groups are pictures.",
    target: "[data-tour='signs']",
  },
  {
    title: "Carve it onto the line",
    body: "Read from the right, one sign at a time.",
    target: "[data-tour='line']",
  },
  {
    title: "Or open a word",
    body: "Beautiful, life, the sun, and peace are ready.",
    target: "[data-tour='words']",
  },
  {
    title: "Keep the line",
    body: "Copy sends it. Save downloads a picture. Medu does not translate a sentence.",
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
        return
      }
      const node = document.querySelector(selector)
      if (!node) {
        setHole(null)
        return
      }
      node.scrollIntoView({ block: "center", inline: "nearest" })
      const rect = node.getBoundingClientRect()
      const pad = 12
      const dock = 168
      const top = Math.max(12, rect.top - pad)
      const height = Math.max(56, Math.min(rect.height + pad * 2, window.innerHeight - dock - top - 16))
      setHole({
        top,
        left: Math.max(12, rect.left - pad),
        width: Math.min(rect.width + pad * 2, window.innerWidth - 24),
        height,
      })
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
      <div className="tour-card">
        <p className="tour-count" aria-label={`${step + 1} of ${steps.length}`}>
          {steps.map((_, index) => (
            <span key={index} className={index === step ? "is-on" : undefined} />
          ))}
        </p>
        <div className="tour-copy">
          <h2 id={titleId}>{current.title}</h2>
          <p>{current.body}</p>
        </div>
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
