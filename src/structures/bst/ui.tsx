import type { ControlsProps, ViewProps } from '../../core/types';
import { edgeMarked, markOf } from '../../components/viz';
import { OpButton, PanelSection, ValueOp } from '../../components/controls';
import type { BstModel, BstNode } from './model';

/** Classic clean-tree layout: x = in-order index, y = depth. Edges never cross. */
function layout(root: BstNode) {
  const pos = new Map<string, { x: number; y: number }>();
  let i = 0;
  let maxD = 0;
  (function walk(n: BstNode | null, d: number) {
    if (!n) return;
    walk(n.l, d + 1);
    pos.set(n.id, { x: i++, y: d });
    maxD = Math.max(maxD, d);
    walk(n.r, d + 1);
  })(root, 0);
  return { pos, count: i, maxD };
}

export function View({ snapshot, step }: ViewProps<BstModel>) {
  if (!snapshot.root) {
    return <div className="stage-inner"><div className="stage-empty">(empty tree — insert a value or press Random)</div></div>;
  }
  const { pos, count, maxD } = layout(snapshot.root);
  const colW = 56, rowH = 72, r = 19;
  const W = Math.max(380, count * colW + 48);
  const H = 56 + maxD * rowH + 48;
  const xy = (id: string) => {
    const p = pos.get(id)!;
    return { x: 24 + p.x * colW + colW / 2, y: 38 + p.y * rowH };
  };
  const edges: { id: string; from: string; to: string }[] = [];
  const nodes: BstNode[] = [];
  (function collect(n: BstNode | null) {
    if (!n) return;
    nodes.push(n);
    for (const c of [n.l, n.r]) if (c) edges.push({ id: `e${c.id}`, from: n.id, to: c.id });
    collect(n.l);
    collect(n.r);
  })(snapshot.root);

  return (
    <div className="stage-inner">
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }} role="img" aria-label="Binary search tree">
          {edges.map(e => {
            const a = xy(e.from), b = xy(e.to);
            return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={'svg-edge' + (edgeMarked(e.id, step) ? ' on' : '')} />;
          })}
          {nodes.map(n => {
            const p = xy(n.id);
            const mark = markOf(n.id, step);
            return (
              <g key={n.id} className={`svg-node mark-${mark}`}>
                <circle cx={p.x} cy={p.y} r={r} />
                <text x={p.x} y={p.y + 4.5} textAnchor="middle">{n.v}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="stage-caption">BST invariant: left subtree &lt; node &lt; right subtree. No self-balancing — sorted input degenerates on purpose.</div>
    </div>
  );
}

export function Controls({ locked, run }: ControlsProps<BstModel>) {
  return (
    <>
      <PanelSection title="OPERATIONS">
        <ValueOp title="insert(x)" hint="avg O(log n)" action="Insert"
          fields={[{ name: 'value', placeholder: 'x' }]}
          disabled={locked} onRun={args => run('insert', args)} />
        <ValueOp title="delete(x)" hint="3 cases" action="Delete"
          fields={[{ name: 'value', placeholder: 'x' }]}
          disabled={locked} onRun={args => run('delete', args)} />
        <ValueOp title="search(x)" hint="path = cost" action="Search"
          fields={[{ name: 'value', placeholder: 'x' }]}
          disabled={locked} onRun={args => run('search', args)} />
      </PanelSection>
      <PanelSection title="TRAVERSALS">
        <OpButton label="in-order" hint="sorted" disabled={locked} onClick={() => run('inorder', {})} />
        <OpButton label="pre-order" hint="node first" disabled={locked} onClick={() => run('preorder', {})} />
        <OpButton label="post-order" hint="node last" disabled={locked} onClick={() => run('postorder', {})} />
        <OpButton label="level-order" hint="BFS + queue" disabled={locked} onClick={() => run('levelorder', {})} />
      </PanelSection>
    </>
  );
}
