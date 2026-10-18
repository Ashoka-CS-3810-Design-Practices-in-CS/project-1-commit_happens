import { distinctInts } from '../../core/rng';

/**
 * Singly linked list. Rendered as an ordered array of node objects whose ids
 * stay stable across operations — position k plays the role of one node, and
 * the arrow after it plays its `next` pointer (Assignment 2 §4-A).
 */
export interface ListNode {
  id: string;
  value: number;
}

export interface ListModel {
  nodes: ListNode[];
  nid: number; // id counter, so every created node gets a unique stable id
}

export const create = (): ListModel => ({ nodes: [], nid: 0 });

export const random = (): ListModel => {
  const vals = distinctInts(5, 1, 99);
  return { nodes: vals.map((v, i) => ({ id: `n${i}`, value: v })), nid: vals.length };
};

export const summary = (m: ListModel): string =>
  m.nodes.length ? m.nodes.map(n => n.value).join(' → ') + ' → ∅' : '∅ (empty)';

export const stats = (m: ListModel): [string, string][] => [
  ['Nodes', String(m.nodes.length)],
  ['Head', m.nodes.length ? String(m.nodes[0].value) : '∅'],
  ['Tail', m.nodes.length ? String(m.nodes[m.nodes.length - 1].value) : '∅'],
];
