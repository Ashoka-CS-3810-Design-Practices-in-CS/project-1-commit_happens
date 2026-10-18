/*
 * Algorithm-layer tests (Assignment 3 §3): every operation is a pure function
 * (model, args) → { steps, next }. The shared harness asserts, for every run:
 *   - purity: the input model is never mutated (R2),
 *   - T1 step/model consistency: the final snapshot equals the next model.
 */
import { describe, expect, it } from 'vitest';
import type { OpArgs, Operation, Step } from '../src/core/types';
import { operations as stackOps } from '../src/structures/stack/algorithms';
import * as stackM from '../src/structures/stack/model';
import { operations as queueOps } from '../src/structures/queue/algorithms';
import * as queueM from '../src/structures/queue/model';
import { operations as listOps } from '../src/structures/linkedlist/algorithms';
import type { ListModel } from '../src/structures/linkedlist/model';
import { operations as bstOps } from '../src/structures/bst/algorithms';
import * as bstM from '../src/structures/bst/model';
import { operations as heapOps } from '../src/structures/heap/algorithms';
import { isValidHeap } from '../src/structures/heap/model';
import { operations as graphOps } from '../src/structures/graph/algorithms';
import * as graphM from '../src/structures/graph/model';

function op<S>(ops: Operation<S>[], key: string): Operation<S> {
  const found = ops.find(o => o.key === key);
  if (!found) throw new Error(`no operation ${key}`);
  return found;
}

/** Validate must pass; run must be pure; final snapshot must equal next (T1). */
function runOk<S>(ops: Operation<S>[], model: S, key: string, args: OpArgs = {}) {
  const o = op(ops, key);
  expect(o.validate(model, args)).toBeNull();
  const before = JSON.stringify(model);
  const res = o.run(model, args);
  expect(JSON.stringify(model), `${key} must not mutate its input`).toBe(before);
  expect(res.steps.length).toBeGreaterThan(0);
  for (const s of res.steps) {
    expect(typeof s.message).toBe('string');
    expect(Array.isArray(s.highlight)).toBe(true);
  }
  expect(JSON.stringify(res.steps[res.steps.length - 1].snapshot), `${key}: final snapshot must equal committed model`)
    .toBe(JSON.stringify(res.next));
  return res;
}

/** The operation must be rejected by validate, with a message (T4). */
function rejected<S>(ops: Operation<S>[], model: S, key: string, args: OpArgs = {}) {
  const msg = op(ops, key).validate(model, args);
  expect(msg, `${key} should be rejected`).toBeTypeOf('string');
  return msg as string;
}

const outs = (steps: Step<unknown>[]) => steps[steps.length - 1].order;

/* ---------------- stack ---------------- */
describe('stack', () => {
  const base = (): stackM.StackModel => ({ items: [10, 20, 30], cap: 4 });

  it('push appends at the top and records check → move → write steps', () => {
    const { steps, next } = runOk(stackOps, base(), 'push', { value: '40' });
    expect(next.items).toEqual([10, 20, 30, 40]);
    expect(steps[steps.length - 1].highlight).toEqual(['s3']);
  });

  it('pop removes the last-pushed element (LIFO)', () => {
    const { next } = runOk(stackOps, base(), 'pop');
    expect(next.items).toEqual([10, 20]);
  });

  it('peek reads the top without changing the stack', () => {
    const { next, steps } = runOk(stackOps, base(), 'peek');
    expect(next.items).toEqual([10, 20, 30]);
    expect(steps[0].message).toContain('30');
  });

  it('rejects overflow, underflow, and malformed input (ER1, ER3)', () => {
    expect(rejected(stackOps, { items: [1, 2, 3, 4], cap: 4 }, 'push', { value: '5' })).toMatch(/overflow/i);
    expect(rejected(stackOps, { items: [], cap: 4 }, 'pop')).toMatch(/underflow/i);
    expect(rejected(stackOps, base(), 'push', { value: 'abc' })).toMatch(/whole number/i);
    expect(rejected(stackOps, base(), 'push', { value: '' })).toMatch(/whole number/i);
  });

  it('setCapacity cannot shrink below the current size', () => {
    expect(rejected(stackOps, { items: [1, 2, 3, 4, 5], cap: 6 }, 'setCapacity', { value: '4' })).toMatch(/smaller/i);
    expect(rejected(stackOps, base(), 'setCapacity', { value: '99' })).toMatch(/3 to 10/);
    expect(runOk(stackOps, base(), 'setCapacity', { value: '8' }).next.cap).toBe(8);
  });
});

/* ---------------- queue (circular buffer) ---------------- */
describe('queue', () => {
  const base = (): queueM.QueueModel => {
    let m = queueM.create();
    for (const v of [4, 8, 15]) m = runOk(queueOps, m, 'enqueue', { value: String(v) }).next;
    return m;
  };

  it('enqueue writes at (front + size) mod capacity; dequeue frees the front (FIFO)', () => {
    let m = base();
    expect(queueM.toArray(m)).toEqual([4, 8, 15]);
    m = runOk(queueOps, m, 'dequeue').next;
    expect(queueM.toArray(m)).toEqual([8, 15]);
    expect(m.front).toBe(1); // nothing shifted — the index moved
  });

  it('wraps around the end of the buffer', () => {
    let m = base();
    for (const v of [16, 23, 42]) m = runOk(queueOps, m, 'enqueue', { value: String(v) }).next; // full: 6/6
    m = runOk(queueOps, m, 'dequeue').next;
    m = runOk(queueOps, m, 'dequeue').next; // front = 2
    m = runOk(queueOps, m, 'enqueue', { value: '99' }).next; // wraps into cell 0
    expect(m.cells[0]).toBe(99);
    expect(queueM.toArray(m)).toEqual([15, 16, 23, 42, 99]);
  });

  it('rejects overflow and underflow (ER1)', () => {
    let m = base();
    for (const v of [1, 2, 3]) m = runOk(queueOps, m, 'enqueue', { value: String(v) }).next;
    expect(rejected(queueOps, m, 'enqueue', { value: '7' })).toMatch(/overflow/i);
    expect(rejected(queueOps, queueM.create(), 'dequeue')).toMatch(/underflow/i);
  });

  it('front() and rear() read the correct cells without mutating', () => {
    const m = base();
    expect(runOk(queueOps, m, 'front').steps[0].message).toContain('4');
    expect(runOk(queueOps, m, 'rear').steps[0].message).toContain('15');
  });
});

/* ---------------- linked list ---------------- */
describe('linked list', () => {
  const base = (): ListModel => ({
    nodes: [12, 7, 31, 24].map((v, i) => ({ id: `n${i}`, value: v })),
    nid: 4,
  });
  const values = (m: ListModel) => m.nodes.map(n => n.value);

  it('insertHead / insertTail / insertAt put the value where asked', () => {
    expect(values(runOk(listOps, base(), 'insertHead', { value: '1' }).next)).toEqual([1, 12, 7, 31, 24]);
    expect(values(runOk(listOps, base(), 'insertTail', { value: '99' }).next)).toEqual([12, 7, 31, 24, 99]);
    expect(values(runOk(listOps, base(), 'insertAt', { index: '2', value: '50' }).next)).toEqual([12, 7, 50, 31, 24]);
  });

  it('insertAt walks the list first — one step per hop', () => {
    const { steps } = runOk(listOps, base(), 'insertAt', { index: '3', value: '5' });
    expect(steps.filter(s => s.type === 'visit')).toHaveLength(3);
  });

  it('deleteAt unlinks exactly the chosen node', () => {
    expect(values(runOk(listOps, base(), 'deleteAt', { index: '1' }).next)).toEqual([12, 31, 24]);
  });

  it('search reports the position or walks off the end', () => {
    const hit = runOk(listOps, base(), 'search', { value: '31' });
    expect(hit.steps[hit.steps.length - 1].message).toContain('position 2');
    const miss = runOk(listOps, base(), 'search', { value: '100' });
    expect(miss.steps[miss.steps.length - 1].message).toMatch(/not in the list/);
  });

  it('reverse flips the order while keeping the same nodes', () => {
    const { next } = runOk(listOps, base(), 'reverse');
    expect(values(next)).toEqual([24, 31, 7, 12]);
    expect(next.nodes.map(n => n.id).sort()).toEqual(['n0', 'n1', 'n2', 'n3']);
  });

  it('rejects out-of-range positions and operations on an empty list (ER1, ER3)', () => {
    expect(rejected(listOps, base(), 'insertAt', { index: '9', value: '1' })).toMatch(/between 0 and 4/);
    expect(rejected(listOps, base(), 'deleteAt', { index: '4' })).toMatch(/between 0 and 3/);
    expect(rejected(listOps, { nodes: [], nid: 0 }, 'deleteAt', { index: '0' })).toMatch(/empty/i);
    expect(rejected(listOps, { nodes: [], nid: 0 }, 'search', { value: '1' })).toMatch(/empty/i);
  });
});

/* ---------------- BST ---------------- */
describe('bst', () => {
  const base = (): bstM.BstModel => {
    const m = bstM.create();
    for (const v of [50, 30, 70, 20, 40, 60, 80]) bstM.silentInsert(m, v);
    return m;
  };

  it('insert walks the comparison path and attaches a leaf', () => {
    const { steps, next } = runOk(bstOps, base(), 'insert', { value: '45' });
    expect(bstM.inorderValues(next.root)).toEqual([20, 30, 40, 45, 50, 60, 70, 80]);
    const msgs = steps.map(s => s.message);
    expect(msgs[0]).toContain('45 < 50');
    expect(msgs[1]).toContain('45 > 30');
    expect(msgs[2]).toContain('45 > 40');
  });

  it('rejects duplicates without touching the tree (ER2)', () => {
    expect(rejected(bstOps, base(), 'insert', { value: '40' })).toMatch(/already in the tree/);
  });

  it('search finds by comparisons; a miss reports the comparison count', () => {
    const hit = runOk(bstOps, base(), 'search', { value: '60' });
    expect(hit.steps[hit.steps.length - 1].message).toMatch(/found/);
    const miss = runOk(bstOps, base(), 'search', { value: '65' });
    expect(miss.steps[miss.steps.length - 1].message).toMatch(/not in the tree/);
  });

  it('delete: leaf case', () => {
    const { next } = runOk(bstOps, base(), 'delete', { value: '20' });
    expect(bstM.inorderValues(next.root)).toEqual([30, 40, 50, 60, 70, 80]);
  });

  it('delete: one-child case promotes the child', () => {
    const m = base();
    bstM.silentInsert(m, 45); // 40 now has a single right child
    const { next } = runOk(bstOps, m, 'delete', { value: '40' });
    expect(bstM.inorderValues(next.root)).toEqual([20, 30, 45, 50, 60, 70, 80]);
  });

  it('delete: two-children case uses the in-order successor and stays a valid BST', () => {
    const { next, steps } = runOk(bstOps, base(), 'delete', { value: '50' });
    expect(bstM.inorderValues(next.root)).toEqual([20, 30, 40, 60, 70, 80]);
    expect(next.root!.v).toBe(60); // successor value copied into the root
    expect(steps.some(s => s.message.includes('successor'))).toBe(true);
  });

  it('the four traversals visit in the textbook orders', () => {
    const m = base();
    expect(outs(runOk(bstOps, m, 'inorder').steps)).toEqual([20, 30, 40, 50, 60, 70, 80]);
    expect(outs(runOk(bstOps, m, 'preorder').steps)).toEqual([50, 30, 20, 40, 70, 60, 80]);
    expect(outs(runOk(bstOps, m, 'postorder').steps)).toEqual([20, 40, 30, 60, 80, 70, 50]);
    expect(outs(runOk(bstOps, m, 'levelorder').steps)).toEqual([50, 30, 70, 20, 40, 60, 80]);
  });

  it('level-order exposes the queue as the frontier', () => {
    const { steps } = runOk(bstOps, base(), 'levelorder');
    expect(steps[0].frontier?.length).toBe(2); // after visiting the root, its two children wait
  });

  it('rejects traversals and searches on an empty tree (ER1)', () => {
    expect(rejected(bstOps, bstM.create(), 'inorder')).toMatch(/empty/i);
    expect(rejected(bstOps, bstM.create(), 'search', { value: '5' })).toMatch(/empty/i);
  });
});

/* ---------------- heap ---------------- */
describe('heap (priority queue)', () => {
  it('insert sifts up and preserves the heap invariant', () => {
    let m = { items: [] as number[] };
    for (const v of [5, 3, 8, 1, 9, 2]) {
      m = runOk(heapOps, m, 'insert', { value: String(v) }).next;
      expect(isValidHeap(m.items)).toBe(true);
    }
    expect(m.items[0]).toBe(1);
  });

  it('repeated extractMin drains in ascending order (heap sort)', () => {
    let m = { items: [] as number[] };
    for (const v of [5, 3, 8, 1, 9, 2, 7]) m = runOk(heapOps, m, 'insert', { value: String(v) }).next;
    const got: number[] = [];
    while (m.items.length) {
      const res = runOk(heapOps, m, 'extractMin');
      got.push(Number(res.steps[res.steps.length - 1].order![0]));
      expect(isValidHeap(res.next.items)).toBe(true);
      m = res.next;
    }
    expect(got).toEqual([1, 2, 3, 5, 7, 8, 9]);
  });

  it('peekMin reads without mutating; empty heap is rejected (ER1)', () => {
    const m = { items: [2, 4, 3] };
    expect(runOk(heapOps, m, 'peekMin').next.items).toEqual([2, 4, 3]);
    expect(rejected(heapOps, { items: [] }, 'extractMin')).toMatch(/underflow/i);
    expect(rejected(heapOps, { items: [] }, 'peekMin')).toMatch(/empty/i);
  });
});

/* ---------------- graph ---------------- */
describe('graph', () => {
  /** A–B, A–C, B–D, C–E, D–E plus isolated F. */
  const base = (): graphM.GraphModel => {
    let m = graphM.create();
    for (const v of ['A', 'B', 'C', 'D', 'E', 'F']) m = runOk(graphOps, m, 'addVertex', { name: v }).next;
    for (const [a, b] of [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'E']]) {
      m = runOk(graphOps, m, 'addEdge', { from: a, to: b, directed: '' }).next;
    }
    return m;
  };

  it('editor validations: duplicates, self-loops, unknown vertices (ER3)', () => {
    const m = base();
    expect(rejected(graphOps, m, 'addVertex', { name: 'A' })).toMatch(/already exists/);
    expect(rejected(graphOps, m, 'addVertex', { name: '!!' })).toMatch(/names/i);
    expect(rejected(graphOps, m, 'addEdge', { from: 'A', to: 'A' })).toMatch(/self-loop/i);
    expect(rejected(graphOps, m, 'addEdge', { from: 'A', to: 'B' })).toMatch(/already exists/);
    expect(rejected(graphOps, m, 'removeEdge', { from: 'A', to: 'F' })).toMatch(/no edge/i);
  });

  it('BFS visits level by level and reports the unreachable vertex (T5, ER5)', () => {
    const { steps } = runOk(graphOps, base(), 'bfs', { source: 'A' });
    const final = steps[steps.length - 1];
    expect(final.order).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(final.message).toMatch(/unreachable from A: F/i);
  });

  it('BFS exposes the queue as the frontier at every step', () => {
    const { steps } = runOk(graphOps, base(), 'bfs', { source: 'A' });
    const visitA = steps.find(s => s.highlight.includes('A'))!;
    expect(visitA.frontier).toEqual(['B', 'C']);
  });

  it('DFS goes deep before wide using an explicit stack', () => {
    const { steps } = runOk(graphOps, base(), 'dfs', { source: 'A' });
    expect(steps[steps.length - 1].order).toEqual(['A', 'B', 'D', 'E', 'C']);
  });

  it('a directed edge is one-way for traversal', () => {
    let m = graphM.create();
    for (const v of ['X', 'Y']) m = runOk(graphOps, m, 'addVertex', { name: v }).next;
    m = runOk(graphOps, m, 'addEdge', { from: 'X', to: 'Y', directed: '1' }).next;
    expect(runOk(graphOps, m, 'bfs', { source: 'X' }).steps.at(-1)!.order).toEqual(['X', 'Y']);
    expect(runOk(graphOps, m, 'bfs', { source: 'Y' }).steps.at(-1)!.order).toEqual(['Y']);
  });

  it('an unreachable destination is reported, not silently finished (ER5)', () => {
    const { steps } = runOk(graphOps, base(), 'bfs', { source: 'A', target: 'F' });
    const final = steps[steps.length - 1];
    expect(final.error).toBe(true);
    expect(final.message).toMatch(/UNREACHABLE/);
  });

  it('traversal preconditions: empty graph and missing source are blocked (ER4)', () => {
    expect(rejected(graphOps, graphM.create(), 'bfs', { source: 'A' })).toMatch(/empty/i);
    expect(rejected(graphOps, base(), 'bfs', { source: '' })).toMatch(/source/i);
    expect(rejected(graphOps, base(), 'bfs', { source: 'Z' })).toMatch(/not in the graph/);
  });

  it('removeVertex drops the vertex and every incident edge', () => {
    const { next } = runOk(graphOps, base(), 'removeVertex', { name: 'E' });
    expect(next.vertices).toEqual(['A', 'B', 'C', 'D', 'F']);
    expect(next.edges.every(e => e.a !== 'E' && e.b !== 'E')).toBe(true);
    expect(next.edges).toHaveLength(3);
  });
});
