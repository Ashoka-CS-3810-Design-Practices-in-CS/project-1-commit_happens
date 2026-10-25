import type { StructureModule } from '../../core/types';
import type { ListModel } from './model';
import { create, random, stats, summary } from './model';
import { operations } from './algorithms';
import { Controls, View } from './ui';

export const linkedListModule: StructureModule<ListModel> = {
  id: 'linkedlist',
  title: 'Linked List',
  tag: 'NODE_CHAIN',
  category: 'linear',
  blurb: 'A chain of nodes, each holding a value and a pointer to the next one',
  chips: ['Singly linked', '*next ptr', 'dynamic'],
  headline: 'O(N)',
  create,
  random,
  summary,
  stats,
  operations,
  View,
  Controls,
};
