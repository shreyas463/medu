import { useEffect, useRef } from "react"

type DemoProps = {
  open: boolean
  onClose: () => void
}

export function Demo({ open, onClose }: DemoProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const base = import.meta.env.BASE_URL

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <div className="demo" role="dialog" aria-modal="true" aria-labelledby="demo-title">
      <div className="demo-card">
        <div className="demo-top">
          <h2 id="demo-title">How a line is read</h2>
          <button type="button" className="demo-close" ref={closeRef} onClick={onClose}>
            Close
          </button>
        </div>
        <video
          controls
          playsInline
          preload="metadata"
          poster={`${base}demo-poster.jpg`}
          autoPlay={!quiet}
        >
          <source src={`${base}demo.mp4`} type="video/mp4" />
        </video>
        <p>
          Touch a sign and Medu tells you the picture and the sound. Carve it onto the pale line.
          Read from the right, one sign at a time. The three signs of nfr mean beautiful, and Medu
          does not fold them into an English sentence.
        </p>
      </div>
    </div>
  )
}
