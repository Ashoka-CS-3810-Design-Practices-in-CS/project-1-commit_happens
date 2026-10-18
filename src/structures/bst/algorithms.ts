import type { Operation, Step } from '../../core/types';
import { snap } from '../../core/types';
import { intOf } from '../../core/validate';
import type { BstModel, BstNode } from './model';
import { contains } from './model';

/** Comparison path from the root to the node holding v (or to the attach point). */
function pathTo(root: BstNode | null, v: number): BstNode[] {
  const path: BstNode[] = [];
  let cur = root;
  while (cur) {
    path.push(cur);
    if (v === cur.v) break;
    cur = v < cur.v ? cur.l : cur.r;
  }
  return path;
}

/**
 * One step per comparison along the search path (shared by insert/search/
 * delete). Each caller passes its own pseudocode line numbers for the
 * go-left / go-right branches, since the three operations have different code.
 */
function compareSteps(m: BstModel, v: number, found: 'stop' | 'walk-past', pc: { left: number; right: number }): Step<BstModel>[] {
  const path = pathTo(m.root, v);
  const steps: Step<BstModel>[] = [];
  const visited: string[] = [];
  for (const node of path) {
    if (v === node.v && found === 'stop') break;
    steps.push({
      type: 'compare',
      pcLine: v < node.v ? pc.left : pc.right,
      snapshot: snap(m),
      highlight: [node.id],
      visited: [...visited],
      message: `${v} ${v < node.v ? '<' : '>'} ${node.v} → go ${v < node.v ? 'left' : 'right'}`,
    });
    visited.push(node.id);
  }
  return steps;
}

function traversal(root: BstNode | null, order: 'in' | 'pre' | 'post'): BstNode[] {
  if (!root) return [];
  const left = traversal(root.l, order);
  const right = traversal(root.r, order);
  if (order === 'pre') return [root, ...left, ...right];
  if (order === 'post') return [...left, ...right, root];
  return [...left, root, ...right];
}

function traversalOp(key: string, label: string, order: 'in' | 'pre' | 'post', why: (n: BstNode) => string): Operation<BstModel> {
  return {
    key,
    label,
    mutates: false,
    validate: m => (m.root ? null : 'The tree is empty: build it first (insert or Random).'),
    run(m) {
      const seq = traversal(m.root, order);
      const steps: Step<BstModel>[] = seq.map((node, i) => ({
        type: 'visit', pcLine: order === 'pre' ? 3 : order === 'post' ? 5 : 4,
        snapshot: snap(m),
        highlight: [node.id],
        visited: seq.slice(0, i).map(n => n.id),
        order: seq.slice(0, i + 1).map(n => n.v),
        message: `visit ${node.v} — ${why(node)}`,
      }));
      steps.push({
        type: 'info', snapshot: snap(m), highlight: [],
        visited: seq.map(n => n.id),
        order: seq.map(n => n.v),
        message: `${label} complete: ${seq.map(n => n.v).join(' → ')}`,
      });
      return { steps, next: snap(m) };
    },
  };
}

export const operations: Operation<BstModel>[] = [
  {
    key: 'insert',
    label: 'insert(x)',
    mutates: true,
    validate(m, args) {
      const v = intOf(args.value);
      if (v == null) return 'Enter a whole number to insert.';
      if (contains(m.root, v)) return `${v} is already in the tree — this BST keeps keys unique (duplicate rejected, tree unchanged).`;
      return null;
    },
    run(m, args) {
      const v = intOf(args.value)!;
      const steps = compareSteps(m, v, 'walk-past', { left: 4, right: 6 });
      const next = snap(m);
      const fresh: BstNode = { id: `b${next.nid++}`, v, l: null, r: null };
      if (!next.root) next.root = fresh;
      else {
        let cur = next.root;
        for (;;) {
          if (v < cur.v) { if (!cur.l) { cur.l = fresh; break; } cur = cur.l; }
          else { if (!cur.r) { cur.r = fresh; break; } cur = cur.r; }
        }
      }
      const parent = steps.length ? `as a child of ${pathTo(m.root, v).slice(-1)[0].v}` : 'as the root';
      steps.push({
        type: 'commit', pcLine: 2, snapshot: snap(next), highlight: [fresh.id],
        visited: pathTo(m.root, v).map(n => n.id),
        edges: [`e${fresh.id}`],
        message: `null link reached — attach ${v} here ${parent}`,
      });
      return { steps, next };
    },
  },
  {
    key: 'search',
    label: 'search(x)',
    mutates: false,
    validate(m, args) {
      if (!m.root) return 'The tree is empty: nothing to search.';
      return intOf(args.value) == null ? 'Enter the whole number to search for.' : null;
    },
    run(m, args) {
      const v = intOf(args.value)!;
      const steps = compareSteps(m, v, 'stop', { left: 4, right: 5 });
      const path = pathTo(m.root, v);
      const last = path[path.length - 1];
      if (last && last.v === v) {
        steps.push({
          type: 'read', pcLine: 3, snapshot: snap(m), highlight: [last.id],
          visited: path.slice(0, -1).map(n => n.id),
          edges: path.slice(1).map(n => `e${n.id}`),
          message: `${v} == ${last.v} → found after ${path.length} comparison(s) — the path length is the cost`,
        });
      } else {
        steps.push({
          type: 'info', pcLine: 2, snapshot: snap(m), highlight: [],
          visited: path.map(n => n.id),
          message: `hit a null link — ${v} is not in the tree (${path.length} comparisons)`,
        });
      }
      return { steps, next: snap(m) };
    },
  },
  {
    key: 'delete',
    label: 'delete(x)',
    mutates: true,
    validate(m, args) {
      if (!m.root) return 'The tree is empty: nothing to delete.';
      const v = intOf(args.value);
      if (v == null) return 'Enter the whole number to delete.';
      if (!contains(m.root, v)) return `${v} is not in the tree — delete rejected, tree unchanged.`;
      return null;
    },
    run(m, args) {
      const v = intOf(args.value)!;
      const steps = compareSteps(m, v, 'stop', { left: 2, right: 2 });
      const next = snap(m);

      // locate target and its parent inside the cloned tree
      let parent: BstNode | null = null;
      let cur = next.root!;
      while (cur.v !== v) {
        parent = cur;
        cur = (v < cur.v ? cur.l : cur.r)!;
      }
      const pathIds = pathTo(m.root, v).slice(0, -1).map(n => n.id);
      steps.push({
        type: 'read', pcLine: 2, snapshot: snap(m), highlight: [cur.id], visited: pathIds,
        message: `found ${v} — it has ${cur.l && cur.r ? 'two children' : cur.l || cur.r ? 'one child' : 'no children'}`,
      });

      const replaceInParent = (replacement: BstNode | null) => {
        if (!parent) next.root = replacement;
        else if (parent.l === cur) parent.l = replacement;
        else parent.r = replacement;
      };

      if (!cur.l && !cur.r) {
        replaceInParent(null);
        steps.push({ type: 'commit', pcLine: 3, snapshot: snap(next), highlight: [], message: `${v} is a leaf — simply remove it` });
      } else if (!cur.l || !cur.r) {
        const child = (cur.l ?? cur.r)!;
        replaceInParent(child);
        steps.push({
          type: 'commit', pcLine: 4, snapshot: snap(next), highlight: [child.id],
          message: `${v} has one child (${child.v}) — the child takes its place`,
        });
      } else {
        // two children: in-order successor = minimum of the right subtree
        let sParent = cur;
        let succ = cur.r!;
        const succPath: string[] = [cur.r!.id];
        while (succ.l) { sParent = succ; succ = succ.l; succPath.push(succ.id); }
        steps.push({
          type: 'visit', pcLine: 5, snapshot: snap(m), highlight: [succ.id], visited: [cur.id],
          message: `two children: find the in-order successor = min of right subtree = ${succ.v}`,
        });
        const sv = succ.v;
        cur.v = sv;
        steps.push({
          type: 'commit', pcLine: 6, snapshot: snap(next), highlight: [cur.id],
          message: `copy successor value ${sv} into the deleted node`,
        });
        // remove successor (it has at most a right child)
        if (sParent.l === succ) sParent.l = succ.r;
        else sParent.r = succ.r;
        steps.push({
          type: 'commit', pcLine: 7, snapshot: snap(next), highlight: [],
          message: `remove the duplicate successor node ${sv} from the right subtree — BST ordering preserved`,
        });
      }
      return { steps, next };
    },
  },
  traversalOp('inorder', 'In-order traversal', 'in', () => 'left subtree done, now the node (sorted order)'),
  traversalOp('preorder', 'Pre-order traversal', 'pre', () => 'node first, then its subtrees'),
  traversalOp('postorder', 'Post-order traversal', 'post', () => 'both subtrees done, node last'),
  {
    key: 'levelorder',
    label: 'Level-order traversal',
    mutates: false,
    validate: m => (m.root ? null : 'The tree is empty: build it first (insert or Random).'),
    run(m) {
      const steps: Step<BstModel>[] = [];
      const queue: { n: BstNode; d: number }[] = [{ n: m.root!, d: 0 }];
      const visited: string[] = [];
      const order: number[] = [];
      while (queue.length) {
        const { n, d } = queue.shift()!;
        order.push(n.v);
        if (n.l) queue.push({ n: n.l, d: d + 1 });
        if (n.r) queue.push({ n: n.r, d: d + 1 });
        steps.push({
          type: 'visit', pcLine: 5, snapshot: snap(m),
          highlight: [n.id],
          visited: [...visited],
          frontier: queue.map(q => q.n.id),
          order: [...order],
          message: `visit ${n.v} (level ${d}) — queue: [${queue.map(q => q.n.v).join(', ')}]`,
        });
        visited.push(n.id);
      }
      steps.push({
        type: 'info', snapshot: snap(m), highlight: [], visited, order,
        message: `level-order complete: ${order.join(' → ')} — breadth-first, one level at a time`,
      });
      return { steps, next: snap(m) };
    },
  },
];
