import type { StructureModule } from '../../core/types';
import type { GraphModel } from './model';
import { create, random, stats, summary } from './model';
import { operations } from './algorithms';
import { Controls, View } from './ui';

export const graphModule: StructureModule<GraphModel> = {
  id: 'graph',
  title: 'Graph',
  tag: 'ADJACENCY_NET',
  category: 'graphs',
  blurb: 'Points or vertices joined by connections or edges'
  chips: ['BFS / DFS', 'adjacency list', 'directed + undirected'],
  headline: 'O(V+E)',
  create,
  random,
  summary,
  stats,
  operations,
  View,
  Controls,
};
