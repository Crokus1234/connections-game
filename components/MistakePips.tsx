'use client'

interface MistakePipsProps {
  remaining: number
  total: number
}

export default function MistakePips({ remaining, total }: MistakePipsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-subtle uppercase tracking-widest mr-1">
        Mistakes
      </span>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`
            inline-block w-3 h-3 rounded-full transition-all duration-300
            ${i < remaining ? 'pip-alive' : 'pip-dead'}
          `}
        />
      ))}
    </div>
  )
}
