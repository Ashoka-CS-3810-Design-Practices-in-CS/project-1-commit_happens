import type { Operation, Step } from '../../core/types';
import { snap } from '../../core/types';
import { intOf } from '../../core/validate';
import type { ListModel } from './model';

function withNode(m: ListModel, index: number, value: number): ListModel {
  const next = snap(m);
  next.nodes.splice(index, 0, { id: `n${next.nid}`, value });
  next.nid += 1;
  return next;
}

/** Steps for walking node 0..stop-1, used by positional insert/delete. */
function walkSteps(m: ListModel, stop: number, pcLine: number): Step<ListModel>[] {
  const steps: Step<ListModel>[] = [];
  for (let k = 0; k < stop; k++) {
    steps.push({
      type: 'visit', pcLine,
      snapshot: snap(m),
      highlight: [m.nodes[k].id],
      visited: m.nodes.slice(0, k).map(n => n.id),
      message: `cur = node [${k}] (value ${m.nodes[k].value}) — follow next`,
    });
  }
  return steps;
}

export const operations: Operation<ListModel>[] = [
  {
    key: 'insertHead',
    label: 'insertHead(x)',
    mutates: true,
    validate: (_m, args) => (intOf(args.value) == null ? 'Enter a whole number to insert.' : null),
    run(m, args) {
      const x = intOf(args.value)!;
      const next = withNode(m, 0, x);
      const steps: Step<ListModel>[] = [
        { type: 'commit', pcLine: 2, snapshot: snap(m), highlight: [], message: `create node(${x})` },
        { type: 'commit', pcLine: 4, snapshot: snap(next), highlight: [next.nodes[0].id], message: `node(${x}).next = old head — head now points at it` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'insertTail',
    label: 'insertTail(x)',
    mutates: true,
    validate: (_m, args) => (intOf(args.value) == null ? 'Enter a whole number to insert.' : null),
    run(m, args) {
      const x = intOf(args.value)!;
      const next = withNode(m, m.nodes.length, x);
      const steps: Step<ListModel>[] = [
        { type: 'commit', pcLine: 2, snapshot: snap(m), highlight: m.nodes.length ? [m.nodes[m.nodes.length - 1].id] : [], message: `create node(${x}); tail is ${m.nodes.length ? `node(${m.nodes[m.nodes.length - 1].value})` : '∅'}` },
        { type: 'commit', pcLine: 4, snapshot: snap(next), highlight: [next.nodes[next.nodes.length - 1].id], message: `tail.next = node(${x}) — appended in O(1) via the tail pointer` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'insertAt',
    label: 'insertAt(i, x)',
    mutates: true,
    validate(m, args) {
      if (intOf(args.value) == null) return 'Enter a whole number value.';
      const i = intOf(args.index);
      if (i == null || i < 0 || i > m.nodes.length) return `Position must be between 0 and ${m.nodes.length} (the current length).`;
      return null;
    },
    run(m, args) {
      const x = intOf(args.value)!;
      const i = intOf(args.index)!;
      const next = withNode(m, i, x);
      const steps: Step<ListModel>[] = [
        ...walkSteps(m, i, 4),
        { type: 'commit', pcLine: 6, snapshot: snap(m), highlight: [], visited: m.nodes.slice(0, i).map(n => n.id), message: `create node(${x}); point it at node [${i}]` },
        { type: 'commit', pcLine: 7, snapshot: snap(next), highlight: [next.nodes[i].id], message: `previous node's next re-pointed — ${x} inserted at position ${i}` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'deleteAt',
    label: 'deleteAt(i)',
    mutates: true,
    validate(m, args) {
      if (m.nodes.length === 0) return 'The list is empty: nothing to delete.';
      const i = intOf(args.index);
      if (i == null || i < 0 || i >= m.nodes.length) return `Position must be between 0 and ${m.nodes.length - 1}.`;
      return null;
    },
    run(m, args) {
      const i = intOf(args.index)!;
      const target = m.nodes[i];
      const next = snap(m);
      next.nodes.splice(i, 1);
      const steps: Step<ListModel>[] = [
        ...walkSteps(m, i, 3),
        { type: 'read', pcLine: 5, snapshot: snap(m), highlight: [target.id], visited: m.nodes.slice(0, i).map(n => n.id), message: `unlink node [${i}] (value ${target.value}): previous next skips over it` },
        { type: 'commit', pcLine: 5, snapshot: snap(next), highlight: [], message: `node(${target.value}) removed — no element shifting, only one pointer changed` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'search',
    label: 'search(x)',
    mutates: false,
    validate(m, args) {
      if (m.nodes.length === 0) return 'The list is empty: nothing to search.';
      return intOf(args.value) == null ? 'Enter the whole number to search for.' : null;
    },
    run(m, args) {
      const x = intOf(args.value)!;
      const steps: Step<ListModel>[] = [];
      for (let k = 0; k < m.nodes.length; k++) {
        const node = m.nodes[k];
        if (node.value === x) {
          steps.push({
            type: 'read', pcLine: 4, snapshot: snap(m), highlight: [node.id],
            visited: m.nodes.slice(0, k).map(n => n.id),
            message: `node [${k}] == ${x} → found at position ${k} after ${k + 1} comparison(s)`,
          });
          return { steps, next: snap(m) };
        }
        steps.push({
          type: 'compare', pcLine: 4, snapshot: snap(m), highlight: [node.id],
          visited: m.nodes.slice(0, k).map(n => n.id),
          message: `node [${k}] holds ${node.value} ≠ ${x} → follow next`,
        });
      }
      steps.push({
        type: 'info', pcLine: 6, snapshot: snap(m), highlight: [],
        visited: m.nodes.map(n => n.id),
        message: `reached ∅ — ${x} is not in the list (${m.nodes.length} comparisons)`,
      });
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'traverse',
    label: 'traverse()',
    mutates: false,
    validate: m => (m.nodes.length === 0 ? 'The list is empty: nothing to traverse.' : null),
    run(m) {
      const steps: Step<ListModel>[] = m.nodes.map((node, k) => ({
        type: 'visit', pcLine: 4, snapshot: snap(m), highlight: [node.id],
        visited: m.nodes.slice(0, k).map(n => n.id),
        order: m.nodes.slice(0, k + 1).map(n => n.value),
        message: `visit node [${k}] = ${node.value}, follow its next pointer`,
      }));
      steps.push({
        type: 'info', pcLine: 3, snapshot: snap(m), highlight: [],
        visited: m.nodes.map(n => n.id),
        order: m.nodes.map(n => n.value),
        message: `cur == ∅ — traversal done: ${m.nodes.map(n => n.value).join(' → ')}`,
      });
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'reverse',
    label: 'reverse()',
    mutates: true,
    validate: m => (m.nodes.length < 2 ? 'Need at least 2 nodes to reverse.' : null),
    run(m) {
      const steps: Step<ListModel>[] = m.nodes.map((node, k) => ({
        type: 'visit', pcLine: 5, snapshot: snap(m), highlight: [node.id],
        visited: m.nodes.slice(0, k).map(n => n.id),
        message: `cur = node(${node.value}): point its next at ${k === 0 ? '∅' : `node(${m.nodes[k - 1].value})`}`,
      }));
      const next = snap(m);
      next.nodes.reverse();
      steps.push({
        type: 'commit', pcLine: 7, snapshot: snap(next), highlight: [next.nodes[0].id],
        message: `head = node(${next.nodes[0].value}) — every pointer flipped in place, O(1) extra space`,
      });
      return { steps, next };
    },
  },
];
