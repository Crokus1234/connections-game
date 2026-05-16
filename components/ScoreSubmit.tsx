'use client'

import { useState } from 'react'

interface ScoreSubmitProps {
  score: number
  mistakes: number
  onSubmitted: () => void
}

export default function ScoreSubmit({ score, mistakes, onSubmitted }: ScoreSubmitProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setStatus('loading')

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name.trim(), score, mistakes }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error)
      setStatus('done')
      setTimeout(onSubmitted, 1000)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p className="font-mono text-xs tracking-widest text-cat1 uppercase animate-fade-in">
        ✓ Score saved to leaderboard
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 animate-slide-up">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name…"
        maxLength={24}
        disabled={status === 'loading'}
        className="
          flex-1 px-4 py-2.5 bg-dim text-chalk font-body text-sm
          border-b-2 border-subtle focus:border-chalk outline-none
          placeholder:text-subtle transition-colors disabled:opacity-50
        "
      />
      <button
        type="submit"
        disabled={status === 'loading' || !name.trim()}
        className="
          px-5 py-2.5 bg-chalk text-night font-display text-lg tracking-widest
          hover:bg-cat0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed
        "
      >
        {status === 'loading' ? '…' : 'Save'}
      </button>
      {status === 'error' && (
        <p className="font-mono text-xs text-cat3 mt-1">Failed to save. Try again.</p>
      )}
    </form>
  )
}
