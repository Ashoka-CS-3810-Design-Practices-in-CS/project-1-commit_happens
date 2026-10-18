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
  blurb: 'Circular buffer, first in first out. Front and rear are just indices.',
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
