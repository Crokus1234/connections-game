'use client'

interface WordTileProps {
  word: string
  isSelected: boolean
  isSolved: boolean
  categoryId?: number
  onClick: () => void
  animationDelay?: number
}

export default function WordTile({
  word,
  isSelected,
  isSolved,
  categoryId,
  onClick,
  animationDelay = 0,
}: WordTileProps) {
  if (isSolved && categoryId !== undefined) {
    return null // solved words are shown in the CategoryBanner, not as tiles
  }

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${animationDelay}ms` }}
      className={`
        relative w-full h-16 md:h-20 font-display text-xl md:text-2xl tracking-widest
        uppercase transition-all duration-150 select-none outline-none
        animate-fade-in
        ${isSelected
          ? 'bg-chalk text-night tile-selected scale-[1.03]'
          : 'bg-dim text-chalk hover:bg-subtle active:scale-95'
        }
      `}
    >
      {word}
    </button>
  )
}
