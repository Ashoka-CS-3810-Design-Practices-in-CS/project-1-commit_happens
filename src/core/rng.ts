/* Random data generation (Input/Output layer, Assignment 2 §5.1). */

export function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/** n distinct random integers in [lo, hi] — distinct so BST inserts never collide. */
export function distinctInts(n: number, lo = 1, hi = 99): number[] {
  const pool = new Set<number>();
  while (pool.size < Math.min(n, hi - lo + 1)) pool.add(randInt(lo, hi));
  return [...pool];
}
