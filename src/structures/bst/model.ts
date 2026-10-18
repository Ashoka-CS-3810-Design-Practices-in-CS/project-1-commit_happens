import { distinctInts } from '../../core/rng';

/** Linked node tree with a root pointer (Assignment 2 §4-A). Duplicates rejected. */
export interface BstNode {
  id: string;
  v: number;
  l: BstNode | null;
  r: BstNode | null;
}

export interface BstModel {
  root: BstNode | null;
  nid: number;
}

export const create = (): BstModel => ({ root: null, nid: 0 });

/** Insert without recording steps — used to build random trees. */
export function silentInsert(m: BstModel, v: number): void {
  const node: BstNode = { id: `b${m.nid++}`, v, l: null, r: null };
  if (!m.root) { m.root = node; return; }
  let cur = m.root;
  for (;;) {
    if (v === cur.v) return;
    if (v < cur.v) { if (!cur.l) { cur.l = node; return; } cur = cur.l; }
    else { if (!cur.r) { cur.r = node; return; } cur = cur.r; }
  }
}

export const random = (): BstModel => {
  const m = create();
  for (const v of distinctInts(7, 1, 99)) silentInsert(m, v);
  return m;
};

export function inorderValues(root: BstNode | null): number[] {
  if (!root) return [];
  return [...inorderValues(root.l), root.v, ...inorderValues(root.r)];
}

export function count(root: BstNode | null): number {
  return root ? 1 + count(root.l) + count(root.r) : 0;
}

export function height(root: BstNode | null): number {
  return root ? 1 + Math.max(height(root.l), height(root.r)) : 0;
}

export function contains(root: BstNode | null, v: number): boolean {
  let cur = root;
  while (cur) {
    if (v === cur.v) return true;
    cur = v < cur.v ? cur.l : cur.r;
  }
  return false;
}

export const summary = (m: BstModel): string => {
  const vals = inorderValues(m.root);
  return vals.length ? `in-order: [${vals.join(', ')}]` : '(empty tree)';
};

export const stats = (m: BstModel): [string, string][] => [
  ['Nodes', String(count(m.root))],
  ['Height', String(height(m.root))],
  ['Root', m.root ? String(m.root.v) : '∅'],
];
