import { distinctInts } from '../../core/rng';

/**
 * Circular-buffer queue (Assignment 2 §4-A): a fixed array where dequeue moves
 * the front index instead of shifting every element, keeping both ends O(1).
 */
export interface QueueModel {
  cells: (number | null)[];
  front: number;
  size: number;
}

export const cap = (m: QueueModel) => m.cells.length;
export const rearIndex = (m: QueueModel) => (m.front + m.size - 1) % cap(m);

export const create = (): QueueModel => ({ cells: Array(6).fill(null), front: 0, size: 0 });

export const random = (): QueueModel => {
  const vals = distinctInts(4, 1, 99);
  const cells: (number | null)[] = Array(6).fill(null);
  vals.forEach((v, i) => (cells[i] = v));
  return { cells, front: 0, size: vals.length };
};

/** Values in queue order, front first. */
export const toArray = (m: QueueModel): number[] =>
  Array.from({ length: m.size }, (_, k) => m.cells[(m.front + k) % cap(m)] as number);

export const summary = (m: QueueModel): string => `[${toArray(m).join(', ')}]`;

export const stats = (m: QueueModel): [string, string][] => [
  ['Elements', `${m.size} / ${cap(m)} max`],
  ["Index 'front'", m.size ? `[${m.front}] = ${m.cells[m.front]}` : `[${m.front}] (empty)`],
  ["Index 'rear'", m.size ? `[${rearIndex(m)}] = ${m.cells[rearIndex(m)]}` : '—'],
];
