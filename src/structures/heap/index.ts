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
  blurb: 'Binary min-heap in a flat array. Every sift swap is one animation step.',
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
