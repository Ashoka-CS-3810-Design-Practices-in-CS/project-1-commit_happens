import type { StructureModule } from '../../core/types';
import type { StackModel } from './model';
import { create, random, stats, summary } from './model';
import { operations } from './algorithms';
import { Controls, View } from './ui';

export const stackModule: StructureModule<StackModel> = {
  id: 'stack',
  title: 'Stack',
  tag: 'LIFO_BUFFER',
  category: 'linear',
  blurb: 'Array-backed, last in first out. Push and pop touch only the top.',
  chips: ['LIFO', 'push / pop', 'call-stack'],
  headline: 'O(1)',
  create,
  random,
  summary,
  stats,
  operations,
  View,
  Controls,
};
