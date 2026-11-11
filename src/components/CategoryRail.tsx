import type { Category } from "../types.ts"

type CategoryRailProps = {
  categories: Category[]
  active: string
  searching: boolean
  onChoose: (id: string) => void
}

export function CategoryRail({ categories, active, searching, onChoose }: CategoryRailProps) {
  return (
    <div className={searching ? "rail is-searching" : "rail"} role="toolbar" aria-label="Sign groups">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          aria-pressed={!searching && category.id === active}
          onClick={() => onChoose(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
