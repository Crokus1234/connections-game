'use client'

import { useCallback, useEffect, useState } from 'react'
import { Puzzle, Category } from '@/lib/types'
import WordTile from '@/components/WordTile'
import CategoryBanner from '@/components/CategoryBanner'
import MistakePips from '@/components/MistakePips'
import ScoreSubmit from '@/components/ScoreSubmit'
import Leaderboard from '@/components/Leaderboard'

const MAX_MISTAKES = 4
const MAX_SELECTION = 4

type GamePhase = 'loading' | 'playing' | 'game_over' | 'leaderboard'

function shuffleArray(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GamePage() {
  const [phase, setPhase] = useState<GamePhase>('loading')
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [tiles, setTiles] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [solvedCategories, setSolvedCategories] = useState<Category[]>([])
  const [mistakesLeft, setMistakesLeft] = useState(MAX_MISTAKES)
  const [shaking, setShaking] = useState(false)
  const [message, setMessage] = useState('')
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPuzzle = useCallback(async () => {
    setPhase('loading')
    setPuzzle(null)
    setTiles([])
    setSelected([])
    setSolvedCategories([])
    setMistakesLeft(MAX_MISTAKES)
    setMessage('')
    setScoreSubmitted(false)
    setError(null)

    try {
      const res = await fetch('/api/puzzle')
      const data = await res.json() as Puzzle & { error?: string }
      if (data.error) throw new Error(data.error)

      const words: string[] = data.categories.flatMap((c: Category) => c.words)
      const allWords: string[] = shuffleArray(words)

      setPuzzle(data)
      setTiles(allWords)
      setPhase('playing')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load puzzle.')
    }
  }, [])

  useEffect(() => { loadPuzzle() }, [loadPuzzle])

  const toggleTile = (word: string) => {
    if (phase !== 'playing') return
    setSelected((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word)
      if (prev.length >= MAX_SELECTION) return prev
      return [...prev, word]
    })
  }

  const handleSubmit = () => {
    if (selected.length !== MAX_SELECTION || !puzzle) return

    const match = puzzle.categories.find(
      (cat) =>
        !solvedCategories.find((s) => s.id === cat.id) &&
        cat.words.every((w) => selected.includes(w)) &&
        selected.every((w) => cat.words.includes(w))
    )

    if (match) {
      const newSolved = [...solvedCategories, match]
      setSolvedCategories(newSolved)
      setTiles((prev) => prev.filter((w) => !match.words.includes(w)))
      setSelected([])
      setMessage('')
      if (newSolved.length === 4) setPhase('game_over')
    } else {
      const oneAway = puzzle.categories.find(
        (cat) =>
          !solvedCategories.find((s) => s.id === cat.id) &&
          selected.filter((w) => cat.words.includes(w)).length === 3
      )

      setShaking(true)
      setTimeout(() => setShaking(false), 500)

      const newMistakes = mistakesLeft - 1
      setMistakesLeft(newMistakes)
      setMessage(oneAway ? 'One away…' : 'Not quite!')

      if (newMistakes <= 0) {
        setTimeout(() => setPhase('game_over'), 600)
      }
    }
  }

  const handleShuffle = () => {
    setTiles((prev) => shuffleArray(prev))
  }

  const score = solvedCategories.length * 100 + Math.max(0, mistakesLeft) * 25
  const won = solvedCategories.length === 4

  if (phase === 'loading' || (!puzzle && !error)) {
    return (
      <main className="game-container min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-6xl tracking-widest text-chalk">Connections</h1>
        {error ? (
          <div className="text-center space-y-3">
            <p className="font-body text-sm text-cat3 italic">{error}</p>
            <button
              onClick={loadPuzzle}
              className="font-mono text-xs tracking-widest uppercase underline text-chalk hover:text-cat0 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="font-mono text-xs tracking-widest text-subtle uppercase animate-pulse">
            Generating puzzle…
          </p>
        )}
      </main>
    )
  }

  if (phase === 'leaderboard') {
    return (
      <main className="game-container min-h-screen flex flex-col items-center justify-start px-6 py-16">
        <div className="w-full max-w-md space-y-10">
          <h1 className="font-display text-5xl tracking-widest text-chalk">Connections</h1>
          <Leaderboard />
          <button
            onClick={loadPuzzle}
            className="w-full py-3 bg-chalk text-night font-display text-2xl tracking-widest hover:bg-cat0 transition-colors"
          >
            New Puzzle
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="game-container min-h-screen flex flex-col items-center justify-start px-4 py-10 md:py-16">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">

        <div className="text-center space-y-1">
          <h1 className="font-display text-5xl md:text-6xl tracking-widest text-chalk">
            Connections
          </h1>
          {puzzle && (
            <p className="font-body text-sm text-subtle italic">{puzzle.flavourText}</p>
          )}
        </div>

        <div className="space-y-2">
          {solvedCategories.map((cat, i) => (
            <CategoryBanner key={cat.id} category={cat} animationDelay={i * 80} />
          ))}
          {phase === 'game_over' && puzzle &&
            puzzle.categories
              .filter((cat) => !solvedCategories.find((s) => s.id === cat.id))
              .map((cat) => (
                <div
                  key={cat.id}
                  className={`w-full py-4 px-5 cat-${cat.id} opacity-50 flex flex-col items-center gap-1 animate-fade-in`}
                >
                  <p className="font-display text-2xl tracking-widest uppercase">{cat.label}</p>
                  <p className="font-body text-sm opacity-80">{cat.words.join(' · ')}</p>
                </div>
              ))
          }
        </div>

        {phase === 'playing' && tiles.length > 0 && (
          <div className={`grid grid-cols-4 gap-2 ${shaking ? 'animate-shake' : ''}`}>
            {tiles.map((word, i) => (
              <WordTile
                key={word}
                word={word}
                isSelected={selected.includes(word)}
                isSolved={false}
                onClick={() => toggleTile(word)}
                animationDelay={i * 30}
              />
            ))}
          </div>
        )}

        {phase === 'playing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <MistakePips remaining={mistakesLeft} total={MAX_MISTAKES} />
              {message && (
                <span className="font-mono text-xs tracking-widest text-cat0 uppercase animate-fade-in">
                  {message}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShuffle}
                className="flex-1 py-3 border border-subtle text-subtle font-display text-xl tracking-widest hover:border-chalk hover:text-chalk transition-colors"
              >
                Shuffle
              </button>
              <button
                onClick={() => setSelected([])}
                disabled={selected.length === 0}
                className="flex-1 py-3 border border-subtle text-subtle font-display text-xl tracking-widest hover:border-chalk hover:text-chalk transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Deselect
              </button>
              <button
                onClick={handleSubmit}
                disabled={selected.length !== MAX_SELECTION}
                className="flex-1 py-3 bg-chalk text-night font-display text-xl tracking-widest hover:bg-cat0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {phase === 'game_over' && (
          <div className="space-y-5 pt-2 border-t border-dim animate-slide-up">
            <div className="text-center space-y-1">
              {won ? (
                <>
                  <p className="font-display text-3xl text-cat1 tracking-widest">Solved!</p>
                  <p className="font-body text-sm text-subtle italic">You found all four groups.</p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl text-cat3 tracking-widest">Game Over</p>
                  <p className="font-body text-sm text-subtle italic">
                    You solved {solvedCategories.length} of 4 groups.
                  </p>
                </>
              )}
              <p className="font-mono text-xs text-subtle tracking-widest">
                Score: <span className="text-chalk">{score}</span>
              </p>
            </div>

            {!scoreSubmitted ? (
              <ScoreSubmit
                score={score}
                mistakes={MAX_MISTAKES - mistakesLeft}
                onSubmitted={() => setScoreSubmitted(true)}
              />
            ) : (
              <p className="font-mono text-xs text-cat1 tracking-widest uppercase">✓ Score saved</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={loadPuzzle}
                className="flex-1 py-3 bg-chalk text-night font-display text-xl tracking-widest hover:bg-cat0 transition-colors"
              >
                New Puzzle
              </button>
              <button
                onClick={() => setPhase('leaderboard')}
                className="flex-1 py-3 border border-chalk text-chalk font-display text-xl tracking-widest hover:bg-chalk hover:text-night transition-colors"
              >
                Leaderboard
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
