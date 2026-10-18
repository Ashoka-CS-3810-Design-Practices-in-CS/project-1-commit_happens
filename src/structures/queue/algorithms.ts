import type { Operation, Step } from '../../core/types';
import { snap } from '../../core/types';
import { intOf } from '../../core/validate';
import type { QueueModel } from './model';
import { cap, rearIndex } from './model';

const id = (i: number) => `q${i}`;

export const operations: Operation<QueueModel>[] = [
  {
    key: 'enqueue',
    label: 'enqueue(x)',
    mutates: true,
    validate(m, args) {
      if (intOf(args.value) == null) return 'Enter a whole number to enqueue.';
      if (m.size >= cap(m)) return `Queue overflow: all ${cap(m)} buffer cells are full. Dequeue first.`;
      return null;
    },
    run(m, args) {
      const x = intOf(args.value)!;
      const rear = (m.front + m.size) % cap(m);
      const next = snap(m);
      next.cells[rear] = x;
      next.size += 1;
      const steps: Step<QueueModel>[] = [
        { type: 'compare', pcLine: 2, snapshot: snap(m), highlight: [], message: `check overflow: size = ${m.size}, capacity = ${cap(m)} → ok` },
        { type: 'compare', pcLine: 4, snapshot: snap(m), highlight: [id(rear)], message: `rear = (front ${m.front} + size ${m.size}) mod ${cap(m)} = ${rear}` },
        { type: 'commit', pcLine: 5, snapshot: snap(next), highlight: [id(rear)], message: `buffer[${rear}] = ${x} — joined at the rear` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'dequeue',
    label: 'dequeue()',
    mutates: true,
    validate(m) {
      return m.size === 0 ? 'Queue underflow: the queue is empty, nothing to dequeue.' : null;
    },
    run(m) {
      const x = m.cells[m.front];
      const next = snap(m);
      next.cells[m.front] = null;
      next.front = (m.front + 1) % cap(m);
      next.size -= 1;
      const steps: Step<QueueModel>[] = [
        { type: 'compare', pcLine: 2, snapshot: snap(m), highlight: [], message: `check underflow: size = ${m.size} → ok` },
        { type: 'read', pcLine: 4, snapshot: snap(m), highlight: [id(m.front)], message: `x = buffer[front ${m.front}] = ${x}` },
        { type: 'commit', pcLine: 5, snapshot: snap(next), highlight: [id(next.front)], message: `front moves to ${next.front} — dequeue() returned ${x} (FIFO)` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'front',
    label: 'front()',
    mutates: false,
    validate: m => (m.size === 0 ? 'Queue is empty: there is no front element.' : null),
    run(m) {
      const steps: Step<QueueModel>[] = [
        { type: 'read', pcLine: 3, snapshot: snap(m), highlight: [id(m.front)], message: `front() → ${m.cells[m.front]} at index ${m.front}` },
      ];
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'rear',
    label: 'rear()',
    mutates: false,
    validate: m => (m.size === 0 ? 'Queue is empty: there is no rear element.' : null),
    run(m) {
      const r = rearIndex(m);
      const steps: Step<QueueModel>[] = [
        { type: 'read', pcLine: 3, snapshot: snap(m), highlight: [id(r)], message: `rear() → ${m.cells[r]} at index ${r}` },
      ];
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'isEmpty',
    label: 'isEmpty()',
    mutates: false,
    validate: () => null,
    run(m) {
      const steps: Step<QueueModel>[] = [
        { type: 'info', pcLine: 2, snapshot: snap(m), highlight: [], message: `isEmpty() → ${m.size === 0} (size = ${m.size})` },
      ];
      return { steps, next: snap(m) };
    },
  },
];
