/*
 * Static complexity lookup table (Assignment 2, §3.4).
 * Complexity is a property of the algorithm, not of the current run, so it is
 * a build-time table keyed by structure id and operation key — the panel does
 * an O(1) lookup, never a runtime computation.
 */
export interface Complexity {
  best?: string;
  avg?: string;
  worst: string;
  space: string;
  note?: string;
}

export const COMPLEXITY_TABLE: Record<string, Record<string, Complexity>> = {
  stack: {
    push:    { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', note: 'Array write at top index' },
    pop:     { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', note: 'Array read + top decrement' },
    peek:    { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', note: 'Read without mutation' },
    isEmpty: { worst: 'O(1)', space: 'O(1)' },
    isFull:  { worst: 'O(1)', space: 'O(1)', note: 'Compare size with capacity' },
    setCapacity: { worst: 'O(1)', space: 'O(n)', note: 'Whole structure stores n ≤ capacity items' },
  },
  queue: {
    enqueue: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', note: 'Circular buffer: no shifting' },
    dequeue: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', note: 'Front index moves, cells stay' },
    front:   { worst: 'O(1)', space: 'O(1)' },
    rear:    { worst: 'O(1)', space: 'O(1)', note: 'rear = (front + size − 1) mod cap' },
    isEmpty: { worst: 'O(1)', space: 'O(1)' },
  },
  linkedlist: {
    insertHead: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', note: 'Re-point head only' },
    insertTail: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)', note: 'With a tail pointer' },
    insertAt:   { best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', note: 'Walk to position first' },
    deleteAt:   { best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', note: 'Walk to position first' },
    search:     { best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', note: 'No random access — must walk' },
    traverse:   { worst: 'O(n)', space: 'O(1)' },
    reverse:    { worst: 'O(n)', space: 'O(1)', note: 'In-place pointer flipping' },
  },
  bst: {
    insert:    { best: 'O(1)', avg: 'O(log n)', worst: 'O(n)', space: 'O(h)', note: 'Worst case: degenerate (sorted input) tree' },
    delete:    { best: 'O(1)', avg: 'O(log n)', worst: 'O(n)', space: 'O(h)', note: 'Two-child case finds in-order successor' },
    search:    { best: 'O(1)', avg: 'O(log n)', worst: 'O(n)', space: 'O(h)', note: 'Each comparison discards one subtree' },
    inorder:   { worst: 'O(n)', space: 'O(h)', note: 'Visits every node once; h = recursion depth' },
    preorder:  { worst: 'O(n)', space: 'O(h)' },
    postorder: { worst: 'O(n)', space: 'O(h)' },
    levelorder:{ worst: 'O(n)', space: 'O(n)', note: 'Queue can hold a whole level' },
  },
  heap: {
    insert:     { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)', note: 'Sift-up along one root path' },
    extractMin: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)', note: 'Sift-down along one root path' },
    peekMin:    { worst: 'O(1)', space: 'O(1)', note: 'Minimum is always at index 0' },
  },
  graph: {
    addVertex:    { worst: 'O(1)', space: 'O(1)' },
    addEdge:      { worst: 'O(1)', space: 'O(1)', note: 'Append to adjacency list' },
    removeVertex: { worst: 'O(V+E)', space: 'O(1)', note: 'Must drop every incident edge' },
    removeEdge:   { worst: 'O(deg)', space: 'O(1)' },
    bfs:          { worst: 'O(V+E)', space: 'O(V)', note: 'Every vertex enqueued at most once' },
    dfs:          { worst: 'O(V+E)', space: 'O(V)', note: 'Explicit stack instead of recursion' },
  },
};

export function lookupComplexity(structure: string, op: string): Complexity | undefined {
  return COMPLEXITY_TABLE[structure]?.[op];
}
