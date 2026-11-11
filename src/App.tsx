import { useEffect, useMemo, useState } from "react"
import { categories } from "./data/categories.ts"
import { signById, signs } from "./data/signs.ts"
import { words } from "./data/words.ts"
import { lineHash, makeLine, makeToken, parseLine } from "./lib/line.ts"
import { saveRubbing } from "./lib/rubbing.ts"
import { visibleSigns } from "./lib/search.ts"
import { CategoryRail } from "./components/CategoryRail.tsx"
import { Reading } from "./components/Reading.tsx"
import { Register } from "./components/Register.tsx"
import { SearchField } from "./components/SearchField.tsx"
import { SignWall } from "./components/SignWall.tsx"
import { Tour } from "./components/Tour.tsx"
import type { Direction, Word } from "./types.ts"

const seenTour = "medu.tour"

function firstVisit() {
  if (window.location.hash.replace(/^#/, "").trim()) return false
  try {
    return localStorage.getItem(seenTour) !== "done"
  } catch {
    return false
  }
}

function opening() {
  const ids = parseLine(window.location.hash)
  const tokens = makeLine(ids)
  return {
    line: tokens,
    activeId: ids.at(-1) ?? null,
    selectedKey: tokens.at(-1)?.key ?? null,
  }
}

export default function App() {
  const [session] = useState(opening)
  const [line, setLine] = useState(session.line)
  const [activeId, setActiveId] = useState(session.activeId)
  const [selectedKey, setSelectedKey] = useState(session.selectedKey)
  const [category, setCategory] = useState("alphabet")
  const [query, setQuery] = useState("")
  const [direction, setDirection] = useState<Direction>("rtl")
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [tourOpen, setTourOpen] = useState(firstVisit)
  const [tourSession, setTourSession] = useState(0)

  const shown = useMemo(() => visibleSigns(signs, query, category), [query, category])
  const active = activeId ? signById.get(activeId) ?? null : null
  const searching = query.trim().length > 0

  useEffect(() => {
    const root = document.documentElement
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") {
        root.dataset.keyboard = "true"
      }
    }
    const onPointer = () => {
      delete root.dataset.keyboard
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onPointer)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onPointer)
    }
  }, [])

  useEffect(() => {
    const next = lineHash(line.map((token) => token.id))
    const current = decodeURIComponent(window.location.hash.replace(/^#/, ""))
    if (current === next) return
    const url = new URL(window.location.href)
    url.hash = next
    history.replaceState(null, "", url)
  }, [line])

  useEffect(() => {
    function onHashChange() {
      const ids = parseLine(window.location.hash)
      const tokens = makeLine(ids)
      setLine(tokens)
      setActiveId(ids.at(-1) ?? null)
      setSelectedKey(tokens.at(-1)?.key ?? null)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  function inspect(id: string, key: string | null = null) {
    setActiveId(id)
    setSelectedKey(key)
  }

  function carve(id: string) {
    if (!signById.has(id)) return
    const token = makeToken(id)
    setLine((current) => [...current, token])
    setActiveId(id)
    setSelectedKey(token.key)
  }

  function lift() {
    if (!selectedKey) return
    const next = line.filter((token) => token.key !== selectedKey)
    const last = next.at(-1)
    setLine(next)
    setSelectedKey(last?.key ?? null)
    if (last) setActiveId(last.id)
  }

  function loadWord(word: Word) {
    const tokens = makeLine(word.signs)
    setLine(tokens)
    setActiveId(word.signs[0] ?? null)
    setSelectedKey(tokens[0]?.key ?? null)
    setQuery("")
  }

  function finishTour() {
    try {
      localStorage.setItem(seenTour, "done")
    } catch {
      // Private browsing can block storage. The guide still closes.
    }
    setTourOpen(false)
  }

  async function copyRubbing() {
    const url = new URL(window.location.href)
    url.hash = lineHash(line.map((token) => token.id))
    const text = url.toString()
    let copiedText = false
    try {
      await navigator.clipboard.writeText(text)
      copiedText = true
    } catch {
      const area = document.createElement("textarea")
      area.value = text
      area.setAttribute("readonly", "")
      area.style.position = "fixed"
      area.style.left = "-9999px"
      document.body.append(area)
      area.select()
      copiedText = document.execCommand("copy")
      area.remove()
    }
    if (!copiedText) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function downloadRubbing() {
    const carved = line.flatMap((token) => {
      const sign = signById.get(token.id)
      return sign ? [sign] : []
    })
    void saveRubbing(carved, direction)
  }

  return (
    <div className={active ? "app has-reading" : "app"}>
      <header>
        <p className="mark">Medu</p>
        <button type="button" className="guide" onClick={() => {
          setTourSession((value) => value + 1)
          setTourOpen(true)
        }}>
          Guide
        </button>
        <SearchField query={query} onQuery={setQuery} />
        <div className="actions" data-tour="share">
          <button
            type="button"
            aria-pressed={direction === "rtl"}
            onClick={() => setDirection((current) => (current === "rtl" ? "ltr" : "rtl"))}
          >
            {direction === "rtl" ? "Right to left" : "Left to right"}
          </button>
          <button type="button" onClick={() => void copyRubbing()} disabled={line.length === 0}>
            {copied ? "Copied" : "Copy the rubbing"}
          </button>
          <button type="button" onClick={downloadRubbing} disabled={line.length === 0}>
            Save rubbing
          </button>
        </div>
      </header>
      <div className="stage">
        <Register
          line={line}
          signs={signById}
          direction={direction}
          selectedKey={selectedKey}
          words={words}
          dragOver={dragOver}
          onInspect={inspect}
          onLoadWord={loadWord}
          onDragOver={setDragOver}
          onDropSign={carve}
        />
        <Reading
          sign={active}
          canLift={selectedKey !== null}
          onCarve={carve}
          onLift={lift}
          onClose={() => {
            setActiveId(null)
            setSelectedKey(null)
          }}
        />
      </div>
      <CategoryRail categories={categories} active={category} searching={searching} onChoose={(id) => {
        setCategory(id)
        setQuery("")
      }} />
      <SignWall
        signs={shown}
        activeId={activeId}
        query={query}
        roomy={!searching && category === "alphabet"}
        onInspect={(id) => inspect(id, null)}
      />
      <Tour key={tourSession} open={tourOpen} onClose={finishTour} />
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copied." : ""}
        {active ? `${active.id}. ${active.depiction}` : ""}
      </p>
    </div>
  )
}
