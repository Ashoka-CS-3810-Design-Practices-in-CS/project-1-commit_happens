import type { Operation, Step } from '../../core/types';
import { snap } from '../../core/types';
import { intOf } from '../../core/validate';
import type { HeapModel } from './model';
import { parent } from './model';

const id = (i: number) => `h${i}`;

export const operations: Operation<HeapModel>[] = [
  {
    key: 'insert',
    label: 'insert(x)',
    mutates: true,
    validate(m, args) {
      if (intOf(args.value) == null) return 'Enter a whole number to insert.';
      if (m.items.length >= 15) return 'Heap is at the 15-node demo limit (4 full levels).';
      return null;
    },
    run(m, args) {
      const x = intOf(args.value)!;
      const next = snap(m);
      const h = next.items;
      h.push(x);
      let i = h.length - 1;
      const steps: Step<HeapModel>[] = [
        {
          type: 'commit', pcLine: 2, snapshot: snap(next), highlight: [id(i)],
          message: `append ${x} at the next free slot, index ${i}`,
        },
      ];
      while (i > 0 && h[parent(i)] > h[i]) {
        const p = parent(i);
        steps.push({
          type: 'compare', pcLine: 3, snapshot: snap(next), highlight: [id(i), id(p)],
          message: `parent heap[${p}] = ${h[p]} > ${h[i]} — heap property broken`,
        });
        [h[p], h[i]] = [h[i], h[p]];
        steps.push({
          type: 'commit', pcLine: 4, snapshot: snap(next), highlight: [id(p)], visited: [id(i)],
          message: `swap up: ${x} rises to index ${p}`,
        });
        i = p;
      }
      if (i > 0) {
        steps.push({
          type: 'compare', pcLine: 3, snapshot: snap(next), highlight: [id(i), id(parent(i))],
          message: `parent heap[${parent(i)}] = ${h[parent(i)]} ≤ ${x} — sift-up stops`,
        });
      }
      steps.push({
        type: 'info', pcLine: 5, snapshot: snap(next), highlight: [id(i)],
        message: `${x} settled at index ${i} — heap property holds everywhere`,
      });
      return { steps, next };
    },
  },
  {
    key: 'extractMin',
    label: 'extractMin()',
    mutates: true,
    validate: m => (m.items.length === 0 ? 'Heap underflow: the heap is empty.' : null),
    run(m) {
      const min = m.items[0];
      const next = snap(m);
      const h = next.items;
      const steps: Step<HeapModel>[] = [
        { type: 'read', pcLine: 2, snapshot: snap(m), highlight: [id(0)], message: `min is always the root: ${min}` },
      ];
      const last = h.pop()!;
      if (h.length > 0) {
        h[0] = last;
        steps.push({
          type: 'commit', pcLine: 3, snapshot: snap(next), highlight: [id(0)],
          message: `move the last element ${last} into the root hole, then sift down`,
        });
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = 2 * i + 2;
          let s = i;
          if (l < h.length && h[l] < h[s]) s = l;
          if (r < h.length && h[r] < h[s]) s = r;
          if (s === i) break;
          steps.push({
            type: 'compare', pcLine: 4, snapshot: snap(next), highlight: [id(i), id(s)],
            message: `smaller child heap[${s}] = ${h[s]} < ${h[i]} — must swap down`,
          });
          [h[s], h[i]] = [h[i], h[s]];
          steps.push({
            type: 'commit', pcLine: 5, snapshot: snap(next), highlight: [id(s)], visited: [id(i)],
            message: `swap: ${h[s]} sinks to index ${s}`,
          });
          i = s;
        }
      }
      steps.push({
        type: 'info', pcLine: 6, snapshot: snap(next), highlight: [],
        order: [min],
        message: h.length ? `extractMin() returned ${min} — new min is ${h[0]}` : `extractMin() returned ${min} — heap is now empty`,
      });
      return { steps, next };
    },
  },
  {
    key: 'peekMin',
    label: 'peekMin()',
    mutates: false,
    validate: m => (m.items.length === 0 ? 'Heap is empty: nothing to peek at.' : null),
    run(m) {
      const steps: Step<HeapModel>[] = [
        { type: 'read', pcLine: 2, snapshot: snap(m), highlight: [id(0)], message: `peekMin() → ${m.items[0]} (heap unchanged — O(1))` },
      ];
      return { steps, next: snap(m) };
    },
  },
];
