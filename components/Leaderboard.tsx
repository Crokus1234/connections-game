'use client'

import { useEffect, useState } from 'react'

interface Entry {
  player_name: string
  score: number
  mistakes: number
  created_at: string
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => setEntries(d.leaderboard ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="font-display text-3xl tracking-widest text-chalk">Top Scores</h2>
      {loading ? (
        <p className="font-mono text-xs text-subtle animate-pulse tracking-widest">LOADING…</p>
      ) : entries.length === 0 ? (
        <p className="font-body text-sm text-subtle italic">No scores yet — be the first!</p>
      ) : (
        <div className="space-y-1">
          {entries.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-2.5 px-4 bg-dim"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="font-mono text-xs text-subtle w-5">{i + 1}.</span>
              <span className="flex-1 font-body text-chalk">{e.player_name}</span>
              <span className="font-mono text-xs text-subtle">
                {e.mistakes} ✗
              </span>
              <span className="font-display text-xl text-cat0 tracking-widest">{e.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
