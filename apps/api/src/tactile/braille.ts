// Grade 1 (uncontracted) braille for lowercase letters, digits and spaces,
// with the dot spacing from ADA §703.3. Dots 1,2,3 are the left column
// top to bottom; 4,5,6 the right column.

const LETTER_DOTS: Record<string, number[]> = {
  a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5],
  f: [1, 2, 4], g: [1, 2, 4, 5], h: [1, 2, 5], i: [2, 4], j: [2, 4, 5],
  k: [1, 3], l: [1, 2, 3], m: [1, 3, 4], n: [1, 3, 4, 5], o: [1, 3, 5],
  p: [1, 2, 3, 4], q: [1, 2, 3, 4, 5], r: [1, 2, 3, 5], s: [2, 3, 4], t: [2, 3, 4, 5],
  u: [1, 3, 6], v: [1, 2, 3, 6], w: [2, 4, 5, 6], x: [1, 3, 4, 6], y: [1, 3, 4, 5, 6],
  z: [1, 3, 5, 6],
}
const NUMBER_SIGN = [3, 4, 5, 6]
// Digits 1-9 and 0 reuse the letters a-j after a number sign.
const DIGIT_LETTERS = 'jabcdefghi'

export const BRAILLE_MM = {
  cellPitch: 6.1, // between cells
  dotPitchX: 2.3, // between the two columns of a cell
  dotPitchY: 2.5, // between the rows of a cell
  linePitch: 10, // between lines
  dotBaseRadius: 0.75,
  dotHeight: 0.7,
} as const

export function textToCells(text: string): number[][] {
  const cells: number[][] = []
  let inNumber = false
  for (const char of text.toLowerCase()) {
    if (char === ' ') {
      cells.push([])
      inNumber = false
    } else if (char >= '0' && char <= '9') {
      if (!inNumber) cells.push(NUMBER_SIGN)
      inNumber = true
      cells.push(LETTER_DOTS[DIGIT_LETTERS[Number(char)]!]!)
    } else if (LETTER_DOTS[char]) {
      inNumber = false
      cells.push(LETTER_DOTS[char])
    }
    // Other characters (punctuation) are skipped.
  }
  return cells
}

// Dot centers for a line of braille. origin = top-left dot of the first
// cell, in plate millimetres with y pointing DOWN (like the plan).
export function brailleDots(text: string, origin: { x: number; y: number }) {
  return textToCells(text).flatMap((cell, index) =>
    cell.map((dot) => ({
      x: origin.x + index * BRAILLE_MM.cellPitch + (dot <= 3 ? 0 : BRAILLE_MM.dotPitchX),
      y: origin.y + ((dot - 1) % 3) * BRAILLE_MM.dotPitchY,
    })),
  )
}

// Size of a line of braille in millimetres, measured from the dot centers.
export function brailleSize(text: string) {
  const cells = textToCells(text).length
  if (cells === 0) return { width: 0, height: 0 }
  return {
    width: (cells - 1) * BRAILLE_MM.cellPitch + BRAILLE_MM.dotPitchX,
    height: 2 * BRAILLE_MM.dotPitchY,
  }
}
