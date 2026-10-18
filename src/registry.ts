/*
 * Structure registry (Core Application Logic layer, Assignment 2 §5.1).
 * Adding a structure = writing its module and listing it here; nothing else
 * in the app changes.
 */
import type { StructureModule } from './core/types';
import { stackModule } from './structures/stack';
import { queueModule } from './structures/queue';
import { linkedListModule } from './structures/linkedlist';
import { bstModule } from './structures/bst';
import { heapModule } from './structures/heap';
import { graphModule } from './structures/graph';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const REGISTRY: StructureModule<any>[] = [
  stackModule,
  queueModule,
  linkedListModule,
  bstModule,
  heapModule,
  graphModule,
];

export const byId = (id: string) => REGISTRY.find(m => m.id === id);
