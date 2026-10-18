/*
 * Integration of the static tables with the algorithm layer: every operation
 * of every registered structure has a complexity entry and pseudocode, and no
 * recorded step points at a pseudocode line that does not exist.
 */
import { describe, expect, it } from 'vitest';
import type { OpArgs } from '../src/core/types';
import { COMPLEXITY_TABLE } from '../src/core/complexity';
import { PSEUDOCODE } from '../src/core/pseudocode';
import { REGISTRY } from '../src/registry';

/** Arguments that make each operation runnable on its module's random() model. */
const SAMPLE_ARGS: Record<string, Record<string, OpArgs>> = {
  stack: { push: { value: '7' }, setCapacity: { value: '9' } },
  queue: { enqueue: { value: '7' } },
  linkedlist: {
    insertHead: { value: '7' }, insertTail: { value: '7' },
    insertAt: { index: '1', value: '7' }, deleteAt: { index: '0' }, search: { value: '7' },
  },
  bst: { insert: { value: '100' }, delete: {}, search: { value: '100' } },
  heap: { insert: { value: '100' } },
  graph: {
    addVertex: { name: 'Z' }, addEdge: {}, removeVertex: {}, removeEdge: {},
    bfs: {}, dfs: {},
  },
};

describe('static lookup tables', () => {
  for (const mod of REGISTRY) {
    it(`${mod.id}: every operation has complexity and pseudocode entries`, () => {
      for (const op of mod.operations) {
        expect(COMPLEXITY_TABLE[mod.id]?.[op.key], `complexity for ${mod.id}.${op.key}`).toBeDefined();
        expect(COMPLEXITY_TABLE[mod.id][op.key].worst).toMatch(/^O\(/);
        expect(COMPLEXITY_TABLE[mod.id][op.key].space).toMatch(/^O\(/);
        expect(PSEUDOCODE[mod.id]?.[op.key]?.length, `pseudocode for ${mod.id}.${op.key}`).toBeGreaterThan(0);
      }
    });

    it(`${mod.id}: recorded pcLines stay inside the pseudocode`, () => {
      for (const op of mod.operations) {
        const model = mod.random();
        let args = SAMPLE_ARGS[mod.id]?.[op.key] ?? {};
        // graph ops need live vertex names from the random model
        if (mod.id === 'graph') {
          const g = model as { vertices: string[]; edges: { a: string; b: string }[] };
          const [u, v] = [g.vertices[0], g.vertices[1]];
          if (op.key === 'addEdge') {
            const free = g.vertices.find(x => g.vertices.every(y => x === y || !g.edges.some(e => (e.a === x && e.b === y) || (e.a === y && e.b === x))));
            args = { from: free ?? u, to: g.vertices.find(y => y !== (free ?? u)) ?? v, directed: '1' };
          }
          if (op.key === 'removeVertex') args = { name: u };
          if (op.key === 'removeEdge') args = { from: g.edges[0].a, to: g.edges[0].b };
          if (op.key === 'bfs' || op.key === 'dfs') args = { source: u, target: '' };
        }
        if (mod.id === 'bst' && op.key === 'delete') {
          const b = model as { root: { v: number } };
          args = { value: String(b.root.v) };
        }
        if (op.validate(model, args) !== null) continue; // e.g. random duplicate edge — skip quietly
        const { steps } = op.run(model, args);
        const lines = PSEUDOCODE[mod.id][op.key].length;
        for (const s of steps) {
          if (s.pcLine != null) {
            expect(s.pcLine, `${mod.id}.${op.key} pcLine`).toBeGreaterThanOrEqual(1);
            expect(s.pcLine, `${mod.id}.${op.key} pcLine ≤ ${lines}`).toBeLessThanOrEqual(lines);
          }
        }
      }
    });
  }
});
