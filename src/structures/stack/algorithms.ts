import type { Operation, Step } from '../../core/types';
import { snap } from '../../core/types';
import { intOf } from '../../core/validate';
import type { StackModel } from './model';

const id = (i: number) => `s${i}`;

export const operations: Operation<StackModel>[] = [
  {
    key: 'push',
    label: 'push(x)',
    mutates: true,
    validate(m, args) {
      if (intOf(args.value) == null) return 'Enter a whole number to push.';
      if (m.items.length >= m.cap) return `Stack overflow: capacity ${m.cap} reached. Pop first or raise the capacity.`;
      return null;
    },
    run(m, args) {
      const x = intOf(args.value)!;
      const next = snap(m);
      next.items.push(x);
      const i = next.items.length - 1;
      const steps: Step<StackModel>[] = [
        {
          type: 'compare', pcLine: 2, snapshot: snap(m), highlight: [],
          message: `check overflow: top = ${m.items.length - 1}, capacity = ${m.cap} → ok`,
        },
        {
          type: 'commit', pcLine: 4, snapshot: snap(m), highlight: m.items.length ? [id(m.items.length - 1)] : [],
          message: `top moves from ${m.items.length - 1} to ${i}`,
        },
        {
          type: 'commit', pcLine: 5, snapshot: snap(next), highlight: [id(i)],
          message: `stack[${i}] = ${x} — pushed on top`,
        },
      ];
      return { steps, next };
    },
  },
  {
    key: 'pop',
    label: 'pop()',
    mutates: true,
    validate(m) {
      return m.items.length === 0 ? 'Stack underflow: the stack is empty, nothing to pop.' : null;
    },
    run(m) {
      const i = m.items.length - 1;
      const x = m.items[i];
      const next = snap(m);
      next.items.pop();
      const steps: Step<StackModel>[] = [
        { type: 'compare', pcLine: 2, snapshot: snap(m), highlight: [], message: `check underflow: top = ${i} → ok` },
        { type: 'read', pcLine: 4, snapshot: snap(m), highlight: [id(i)], message: `x = stack[${i}] = ${x}` },
        { type: 'commit', pcLine: 5, snapshot: snap(next), highlight: [], message: `top moves to ${i - 1} — pop() returned ${x} (LIFO)` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'peek',
    label: 'peek()',
    mutates: false,
    validate(m) {
      return m.items.length === 0 ? 'Stack is empty: nothing to peek at.' : null;
    },
    run(m) {
      const i = m.items.length - 1;
      const steps: Step<StackModel>[] = [
        { type: 'read', pcLine: 3, snapshot: snap(m), highlight: [id(i)], message: `peek() → ${m.items[i]} (stack unchanged)` },
      ];
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'isEmpty',
    label: 'isUnderflow()',
    mutates: false,
    validate: () => null,
    run(m) {
      const empty = m.items.length === 0;
      const steps: Step<StackModel>[] = [
        { type: 'info', pcLine: 2, snapshot: snap(m), highlight: [], message: `isEmpty() → ${empty} (top = ${m.items.length - 1})` },
      ];
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'isFull',
    label: 'isOverflow()',
    mutates: false,
    validate: () => null,
    run(m) {
      const full = m.items.length >= m.cap;
      const steps: Step<StackModel>[] = [
        { type: 'info', pcLine: 2, snapshot: snap(m), highlight: [], message: `isFull() → ${full} (size ${m.items.length} of ${m.cap})` },
      ];
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'setCapacity',
    label: 'setCapacity(c)',
    mutates: true,
    validate(m, args) {
      const c = intOf(args.value);
      if (c == null || c < 3 || c > 10) return 'Capacity must be a whole number from 3 to 10.';
      if (c < m.items.length) return `Capacity ${c} is smaller than the current size ${m.items.length}.`;
      return null;
    },
    run(m, args) {
      const next = snap(m);
      next.cap = intOf(args.value)!;
      const steps: Step<StackModel>[] = [
        { type: 'commit', pcLine: 3, snapshot: snap(next), highlight: [], message: `capacity set to ${next.cap}` },
      ];
      return { steps, next };
    },
  },
];
