import type { StructureModule } from '../../core/types';
import type { BstModel } from './model';
import { create, random, stats, summary } from './model';
import { operations } from './algorithms';
import { Controls, View } from './ui';

export const bstModule: StructureModule<BstModel> = {
  id: 'bst',
  title: 'Binary Search Tree',
  tag: 'TREE_SEARCH',
  category: 'tree',
  blurb: 'Every comparison discards half the tree. Watch the path — it is the cost.',
  chips: ['BST', 'in-order walk', '3-case delete'],
  headline: 'O(log N)',
  create,
  random,
  summary,
  stats,
  operations,
  View,
  Controls,
};
