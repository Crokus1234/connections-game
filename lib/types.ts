export interface Category {
  id: number          // 0-3, maps to colour
  label: string       // e.g. "Things that are round"
  words: string[]     // exactly 4 words
  difficulty: 'easy' | 'medium' | 'hard' | 'tricky'
}

export interface Puzzle {
  categories: Category[]   // exactly 4 categories = 16 words total
  flavourText: string      // one-line theme description shown at top
}
