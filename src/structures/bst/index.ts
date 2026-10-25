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
  blurb: 'A binary tree wherein each node has at most two children and smaller values go left while larger go right',
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
