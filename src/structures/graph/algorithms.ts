import type { Operation, Step } from '../../core/types';
import { snap } from '../../core/types';
import { nameOf } from '../../core/validate';
import type { GraphModel } from './model';
import { hasEdge, neighbours } from './model';

const MAX_V = 12;

/** Shared traversal preconditions (A1 ER4). */
function traversalValidate(m: GraphModel, args: Record<string, string>): string | null {
  if (m.vertices.length === 0) return 'The graph is empty: add vertices first.';
  if (!args.source) return 'Choose a source vertex before starting the traversal.';
  if (!m.vertices.includes(args.source)) return `Source vertex “${args.source}” is not in the graph.`;
  if (args.target && !m.vertices.includes(args.target)) return `Destination vertex “${args.target}” is not in the graph.`;
  return null;
}

export const operations: Operation<GraphModel>[] = [
  {
    key: 'addVertex',
    label: 'addVertex(v)',
    mutates: true,
    validate(m, args) {
      const name = nameOf(args.name);
      if (!name) return 'Vertex names are 1–4 letters/digits, e.g. A or V1.';
      if (m.vertices.includes(name)) return `Vertex ${name} already exists.`;
      if (m.vertices.length >= MAX_V) return `Demo limit: at most ${MAX_V} vertices.`;
      return null;
    },
    run(m, args) {
      const name = nameOf(args.name)!;
      const next = snap(m);
      next.vertices.push(name);
      const steps: Step<GraphModel>[] = [
        { type: 'commit', pcLine: 2, snapshot: snap(next), highlight: [name], message: `adjacency[${name}] = [] — vertex ${name} added` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'addEdge',
    label: 'addEdge(u, v)',
    mutates: true,
    validate(m, args) {
      if (!args.from || !args.to) return 'Pick both endpoints of the edge.';
      if (!m.vertices.includes(args.from) || !m.vertices.includes(args.to)) return 'Both endpoints must be existing vertices.';
      if (args.from === args.to) return 'Self-loops are not supported here.';
      if (hasEdge(m, args.from, args.to)) return `An edge between ${args.from} and ${args.to} already exists.`;
      return null;
    },
    run(m, args) {
      const directed = args.directed === '1';
      const next = snap(m);
      const id = `ge${next.eid++}`;
      next.edges.push({ id, a: args.from, b: args.to, directed });
      const steps: Step<GraphModel>[] = [
        {
          type: 'commit', pcLine: directed ? 2 : 3, snapshot: snap(next),
          highlight: [args.from, args.to], edges: [id],
          message: `edge ${args.from} ${directed ? '→' : '–'} ${args.to} added ${directed ? '(one-way)' : '(both adjacency lists)'}`,
        },
      ];
      return { steps, next };
    },
  },
  {
    key: 'removeVertex',
    label: 'removeVertex(v)',
    mutates: true,
    validate(m, args) {
      if (!args.name) return 'Pick the vertex to remove.';
      if (!m.vertices.includes(args.name)) return `Vertex ${args.name} is not in the graph.`;
      return null;
    },
    run(m, args) {
      const v = args.name;
      const dropped = m.edges.filter(e => e.a === v || e.b === v);
      const next = snap(m);
      next.vertices = next.vertices.filter(x => x !== v);
      next.edges = next.edges.filter(e => e.a !== v && e.b !== v);
      const steps: Step<GraphModel>[] = [
        { type: 'read', pcLine: 3, snapshot: snap(m), highlight: [v], edges: dropped.map(e => e.id), message: `removing ${v} drops ${dropped.length} incident edge(s) — O(V+E)` },
        { type: 'commit', pcLine: 2, snapshot: snap(next), highlight: [], message: `vertex ${v} removed` },
      ];
      return { steps, next };
    },
  },
  {
    key: 'removeEdge',
    label: 'removeEdge(u, v)',
    mutates: true,
    validate(m, args) {
      if (!args.from || !args.to) return 'Pick both endpoints of the edge to remove.';
      if (!hasEdge(m, args.from, args.to)) return `There is no edge between ${args.from} and ${args.to}.`;
      return null;
    },
    run(m, args) {
      const edge = m.edges.find(
        e => (e.a === args.from && e.b === args.to) || (!e.directed && e.a === args.to && e.b === args.from)
      )!;
      const next = snap(m);
      next.edges = next.edges.filter(e => e.id !== edge.id);
      const steps: Step<GraphModel>[] = [
        { type: 'read', pcLine: 2, snapshot: snap(m), highlight: [edge.a, edge.b], edges: [edge.id], message: `remove edge ${edge.a} ${edge.directed ? '→' : '–'} ${edge.b}` },
        { type: 'commit', pcLine: 3, snapshot: snap(next), highlight: [], message: 'edge removed from the adjacency list(s)' },
      ];
      return { steps, next };
    },
  },
  {
    key: 'bfs',
    label: 'BFS(source)',
    mutates: false,
    validate: traversalValidate,
    run(m, args) {
      const start = args.source;
      const target = args.target || null;
      const steps: Step<GraphModel>[] = [];
      const visited = new Set<string>([start]);
      const order: string[] = [];
      const treeEdges: string[] = [];
      const queue: { v: string; via: string | null }[] = [{ v: start, via: null }];

      steps.push({
        type: 'info', pcLine: 2, snapshot: snap(m), highlight: [],
        frontier: [start],
        message: `visited = {${start}}, queue = [${start}] — BFS explores level by level (FIFO)`,
      });

      let found = false;
      while (queue.length && !found) {
        const { v, via } = queue.shift()!;
        if (via) treeEdges.push(via);
        order.push(v);
        const newly: string[] = [];
        for (const nb of neighbours(m, v)) {
          if (!visited.has(nb.to)) {
            visited.add(nb.to);
            queue.push({ v: nb.to, via: nb.eid });
            newly.push(nb.to);
          }
        }
        steps.push({
          type: 'visit', pcLine: 4, snapshot: snap(m),
          highlight: [v],
          visited: order.slice(0, -1),
          frontier: queue.map(q => q.v),
          edges: [...treeEdges],
          order: [...order],
          message:
            `dequeue ${v}, visit it` +
            (newly.length ? `; discover + enqueue ${newly.join(', ')}` : '; no undiscovered neighbours') +
            ` — queue: [${queue.map(q => q.v).join(', ')}]`,
        });
        if (target && v === target) found = true;
      }

      const unreached = m.vertices.filter(x => !order.includes(x));
      let message: string;
      let error = false;
      if (target && found) {
        message = `destination ${target} reached — BFS order: ${order.join(' → ')}`;
      } else if (target && !found) {
        message = `queue emptied without reaching ${target} — destination is UNREACHABLE from ${start}. Visited: ${order.join(' → ')}`;
        error = true;
      } else {
        message = `BFS complete: ${order.join(' → ')}` + (unreached.length ? ` — unreachable from ${start}: ${unreached.join(', ')}` : '');
      }
      steps.push({
        type: 'info', pcLine: 3, snapshot: snap(m), highlight: [],
        visited: order, edges: treeEdges, order, error, message,
      });
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'dfs',
    label: 'DFS(source)',
    mutates: false,
    validate: traversalValidate,
    run(m, args) {
      const start = args.source;
      const target = args.target || null;
      const steps: Step<GraphModel>[] = [];
      const visited = new Set<string>();
      const order: string[] = [];
      const treeEdges: string[] = [];
      // Explicit stack instead of recursion (Assignment 1 §5.3): the
      // algorithm's own state stays inspectable and steppable.
      const stack: { v: string; via: string | null }[] = [{ v: start, via: null }];

      steps.push({
        type: 'info', pcLine: 2, snapshot: snap(m), highlight: [],
        frontier: [start],
        message: `stack = [${start}] — DFS dives deep before going wide (LIFO)`,
      });

      let found = false;
      while (stack.length && !found) {
        const { v, via } = stack.pop()!;
        if (visited.has(v)) continue;
        visited.add(v);
        if (via) treeEdges.push(via);
        order.push(v);
        const nbs = neighbours(m, v).filter(nb => !visited.has(nb.to));
        // push in reverse so the first-listed neighbour is explored first
        for (let i = nbs.length - 1; i >= 0; i--) stack.push({ v: nbs[i].to, via: nbs[i].eid });
        steps.push({
          type: 'visit', pcLine: 6, snapshot: snap(m),
          highlight: [v],
          visited: order.slice(0, -1),
          frontier: stack.map(s => s.v),
          edges: [...treeEdges],
          order: [...order],
          message:
            `pop ${v}, visit it` +
            (nbs.length ? `; push ${nbs.map(n => n.to).join(', ')}` : '; dead end — backtrack') +
            ` — stack: [${stack.map(s => s.v).join(', ')}]`,
        });
        if (target && v === target) found = true;
      }

      let message: string;
      let error = false;
      if (target && found) {
        message = `destination ${target} reached — DFS order: ${order.join(' → ')}`;
      } else if (target && !found) {
        message = `stack emptied without reaching ${target} — destination is UNREACHABLE from ${start}. Visited: ${order.join(' → ')}`;
        error = true;
      } else {
        const unreached = m.vertices.filter(x => !order.includes(x));
        message = `DFS complete: ${order.join(' → ')}` + (unreached.length ? ` — unreachable from ${start}: ${unreached.join(', ')}` : '');
      }
      steps.push({
        type: 'info', pcLine: 3, snapshot: snap(m), highlight: [],
        visited: order, edges: treeEdges, order, error, message,
      });
      return { steps, next: snap(m) };
    },
  },
];
