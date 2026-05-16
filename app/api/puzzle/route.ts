import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a puzzle designer for a word connections game similar to NYT Connections.

Your job is to create a puzzle with exactly 4 categories, each containing exactly 4 words (16 words total).

Rules:
- Every word must belong to exactly ONE category — no word should plausibly fit two categories
- Words should be common English words, no proper nouns unless the theme calls for it
- Categories should range from straightforward to delightfully tricky
- The "tricky" category often involves wordplay, hidden meanings, or unexpected connections
- Words within a category should not make the category obvious (avoid "TYPES OF DOG: poodle, labrador, beagle, husky")
- Aim for wit and surprise — the best puzzles make players say "oh of course!" after solving

Difficulty labels:
- easy: the connection is clear once you see it
- medium: requires a moment of thought
- hard: non-obvious, needs lateral thinking
- tricky: wordplay, double meanings, or a surprising twist

Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure:
{
  "flavourText": "one witty sentence describing today's theme or vibe",
  "categories": [
    {
      "id": 0,
      "label": "Category name (short, revealed after solving)",
      "difficulty": "easy",
      "words": ["WORD1", "WORD2", "WORD3", "WORD4"]
    },
    {
      "id": 1,
      "label": "Category name",
      "difficulty": "medium",
      "words": ["WORD1", "WORD2", "WORD3", "WORD4"]
    },
    {
      "id": 2,
      "label": "Category name",
      "difficulty": "hard",
      "words": ["WORD1", "WORD2", "WORD3", "WORD4"]
    },
    {
      "id": 3,
      "label": "Category name",
      "difficulty": "tricky",
      "words": ["WORD1", "WORD2", "WORD3", "WORD4"]
    }
  ]
}

All words must be UPPERCASE. No word may appear in more than one category.`

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not set in environment variables.' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: 'Generate a fresh, creative connections puzzle. Make it surprising and fun!',
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json(
        { error: 'Failed to generate puzzle from AI.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text ?? ''

    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const puzzle = JSON.parse(cleaned)

    // Basic validation
    if (
      !puzzle.categories ||
      puzzle.categories.length !== 4 ||
      puzzle.categories.some((c: { words: string[] }) => c.words.length !== 4)
    ) {
      throw new Error('AI returned malformed puzzle data')
    }

    return NextResponse.json(puzzle)
  } catch (error) {
    console.error('Puzzle generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate puzzle. Please try again.' },
      { status: 500 }
    )
  }
}
