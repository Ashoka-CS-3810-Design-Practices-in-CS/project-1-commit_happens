import { distinctInts } from '../../core/rng';

/** Array-backed stack with a fixed capacity (Assignment 2 §4-A). */
export interface StackModel {
  items: number[]; // index 0 is the base; last index is the top
  cap: number;
}

export const create = (): StackModel => ({ items: [], cap: 6 });

export const random = (): StackModel => ({ items: distinctInts(4, 1, 99), cap: 6 });

export const summary = (m: StackModel): string => `[${m.items.join(', ')}]`;

export const stats = (m: StackModel): [string, string][] => [
  ['Elements', `${m.items.length} / ${m.cap} max`],
  ["Pointer 'top'", m.items.length ? `idx [${m.items.length - 1}] = ${m.items[m.items.length - 1]}` : 'idx [-1] (empty)'],
];
