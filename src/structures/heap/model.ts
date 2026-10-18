import { distinctInts } from '../../core/rng';

/**
 * Array-based binary min-heap (Assignment 2 §4-A): children of index i live at
 * 2i+1 and 2i+2, the parent at (i-1)>>1, the minimum at index 0. The same
 * array backs both the tree view and the flat array view.
 */
export interface HeapModel {
  items: number[];
}

export const parent = (i: number) => (i - 1) >> 1;

export const create = (): HeapModel => ({ items: [] });

/** Silent insert used only for random generation. */
function push(h: number[], v: number) {
  h.push(v);
  let i = h.length - 1;
  while (i > 0 && h[parent(i)] > h[i]) {
    [h[parent(i)], h[i]] = [h[i], h[parent(i)]];
    i = parent(i);
  }
}

export const random = (): HeapModel => {
  const items: number[] = [];
  for (const v of distinctInts(6, 1, 99)) push(items, v);
  return { items };
};

/** True when every parent ≤ its children — the invariant the tests assert. */
export function isValidHeap(items: number[]): boolean {
  for (let i = 1; i < items.length; i++) if (items[parent(i)] > items[i]) return false;
  return true;
}

export const summary = (m: HeapModel): string => `[${m.items.join(', ')}]`;

export const stats = (m: HeapModel): [string, string][] => [
  ['Elements', String(m.items.length)],
  ['Min (root)', m.items.length ? String(m.items[0]) : '—'],
  ['Heap valid', m.items.length ? (isValidHeap(m.items) ? 'yes' : 'NO') : '—'],
];
