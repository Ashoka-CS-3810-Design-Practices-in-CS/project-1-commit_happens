import type { StructureModule } from '../../core/types';
import type { HeapModel } from './model';
import { create, random, stats, summary } from './model';
import { operations } from './algorithms';
import { Controls, View } from './ui';

export const heapModule: StructureModule<HeapModel> = {
  id: 'heap',
  title: 'Priority Queue',
  tag: 'MIN_HEAP',
  category: 'tree',
  blurb: 'A queue where the smallest value always leaves first, not the oldest. It is stored as a min-heap.',
  chips: ['binary heap', 'extract-min', 'flat buffer'],
  headline: 'O(log N)',
  create,
  random,
  summary,
  stats,
  operations,
  View,
  Controls,
};
