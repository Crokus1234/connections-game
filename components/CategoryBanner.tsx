'use client'

import { Category } from '@/lib/types'

interface CategoryBannerProps {
  category: Category
  animationDelay?: number
}

const DIFFICULTY_LABEL = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  tricky: 'Tricky',
}

export default function CategoryBanner({ category, animationDelay = 0 }: CategoryBannerProps) {
  return (
    <div
      style={{ animationDelay: `${animationDelay}ms` }}
      className={`
        w-full py-4 px-5 cat-${category.id}
        animate-bounce-in opacity-0
        flex flex-col items-center gap-1
      `}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs opacity-60 uppercase tracking-widest">
          {DIFFICULTY_LABEL[category.difficulty]}
        </span>
      </div>
      <p className="font-display text-2xl tracking-widest uppercase">{category.label}</p>
      <p className="font-body text-sm opacity-80 tracking-wide">
        {category.words.join(' · ')}
      </p>
    </div>
  )
}
