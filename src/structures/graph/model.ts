import { randInt } from '../../core/rng';

/**
 * Adjacency-list graph (Assignment 2 §4-A). Edges are stored once; the
 * adjacency view is derived, so the editor and the algorithms never drift.
 */
export interface GraphEdge {
  id: string;
  a: string;
  b: string;
  directed: boolean;
  weight?: number;
}

export interface GraphModel {
  vertices: string[];
  edges: GraphEdge[];
  eid: number;
}

export const create = (): GraphModel => ({ vertices: [], edges: [], eid: 0 });

/** Neighbours of u in insertion order, with the edge that reaches each one. */
export function neighbours(m: GraphModel, u: string): { to: string; eid: string }[] {
  const out: { to: string; eid: string }[] = [];
  for (const e of m.edges) {
    if (e.a === u) out.push({ to: e.b, eid: e.id });
    else if (!e.directed && e.b === u) out.push({ to: e.a, eid: e.id });
  }
  return out;
}

export function hasEdge(m: GraphModel, a: string, b: string): boolean {
  return m.edges.some(
    e => (e.a === a && e.b === b) || (!e.directed && e.a === b && e.b === a)
  );
}

export const random = (): GraphModel => {
  const names = ['A', 'B', 'C', 'D', 'E', 'F'];
  const m: GraphModel = { vertices: [...names], edges: [], eid: 0 };
  // a random connected backbone, then a few extra edges
  for (let i = 1; i < names.length; i++) {
    const j = randInt(0, i - 1);
    m.edges.push({ id: `ge${m.eid++}`, a: names[j], b: names[i], directed: false, weight: randInt(1, 9) });
  }
  let extras = 2;
  let guard = 20;
  while (extras > 0 && guard-- > 0) {
    const a = names[randInt(0, names.length - 1)];
    const b = names[randInt(0, names.length - 1)];
    if (a !== b && !hasEdge(m, a, b)) {
      m.edges.push({ id: `ge${m.eid++}`, a, b, directed: false, weight: randInt(1, 9) });
      extras--;
    }
  }
  return m;
};

export const summary = (m: GraphModel): string =>
  `V={${m.vertices.join(',')}} E={${m.edges.map(e => `${e.a}${e.directed ? '→' : '–'}${e.b}`).join(', ')}}`;

export const stats = (m: GraphModel): [string, string][] => [
  ['Vertices |V|', String(m.vertices.length)],
  ['Edges |E|', String(m.edges.length)],
  ['Directed edges', String(m.edges.filter(e => e.directed).length)],
];
