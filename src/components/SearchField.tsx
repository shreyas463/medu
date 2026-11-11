type SearchFieldProps = {
  query: string
  onQuery: (value: string) => void
}

export function SearchField({ query, onQuery }: SearchFieldProps) {
  return (
    <label className="search">
      <span className="sr-only">Search signs</span>
      <input
        type="search"
        value={query}
        placeholder="Search a sign, a sound, an owl"
        onChange={(event) => onQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onQuery("")
        }}
      />
    </label>
  )
}
