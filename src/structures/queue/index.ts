import type { StructureModule } from '../../core/types';
import type { QueueModel } from './model';
import { create, random, stats, summary } from './model';
import { operations } from './algorithms';
import { Controls, View } from './ui';

export const queueModule: StructureModule<QueueModel> = {
  id: 'queue',
  title: 'Queue',
  tag: 'FIFO_PIPE',
  category: 'linear',
  blurb: 'A line where items join at the back and leave from the front. The first item in is the first out, like a queue at a ticket counter.',
  chips: ['FIFO', 'enqueue / dequeue', 'ring buffer'],
  headline: 'O(1)',
  create,
  random,
  summary,
  stats,
  operations,
  View,
  Controls,
};
