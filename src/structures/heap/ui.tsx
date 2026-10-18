import type { ControlsProps, ViewProps } from '../../core/types';
import { markOf } from '../../components/viz';
import { OpButton, PanelSection, ValueOp } from '../../components/controls';
import type { HeapModel } from './model';
import { parent } from './model';

/** Index math gives the whole layout: depth = ⌊log2(i+1)⌋, slot within the row. */
function posOf(i: number, W: number) {
  const d = Math.floor(Math.log2(i + 1));
  const k = i + 1 - 2 ** d;
  return { x: (W * (k + 0.5)) / 2 ** d, y: 36 + d * 64 };
}

export function View({ snapshot, step }: ViewProps<HeapModel>) {
  const n = snapshot.items.length;
  if (n === 0) {
    return <div className="stage-inner"><div className="stage-empty">(empty heap — insert a value or press Random)</div></div>;
  }
  const depth = Math.floor(Math.log2(n));
  const W = Math.max(400, 2 ** depth * 88);
  const treeH = 36 + depth * 64 + 42;
  const cellW = Math.min(64, (W - 32) / n);
  const H = treeH + 72;
  const rowX0 = (W - n * cellW) / 2;
  const rowY = treeH + 6;
  return (
    <div className="stage-inner">
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }} role="img" aria-label="Min-heap tree and backing array">
          {snapshot.items.map((_, i) =>
            i === 0 ? null : (() => {
              const a = posOf(parent(i), W), b = posOf(i, W);
              return <line key={`he${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="svg-edge" />;
            })()
          )}
          {snapshot.items.map((v, i) => {
            const p = posOf(i, W);
            const mark = markOf(`h${i}`, step);
            return (
              /* circle and array cell share one group, so one highlight hits both */
              <g key={`h${i}`} className={`svg-node mark-${mark}`}>
                <circle cx={p.x} cy={p.y} r={18} />
                <text x={p.x} y={p.y + 4.5} textAnchor="middle">{v}</text>
                <rect x={rowX0 + i * cellW} y={rowY} width={cellW - 4} height={28} rx={3} />
                <text x={rowX0 + i * cellW + (cellW - 4) / 2} y={rowY + 18} textAnchor="middle">{v}</text>
                <text x={rowX0 + i * cellW + (cellW - 4) / 2} y={rowY + 42} textAnchor="middle" className="svg-sub">[{i}]</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="stage-caption">
        Min-heap: parent ≤ children. Same array drawn twice — children of [i] sit at [2i+1] and [2i+2], no pointers stored.
      </div>
    </div>
  );
}

export function Controls({ locked, run }: ControlsProps<HeapModel>) {
  return (
    <PanelSection title="OPERATIONS">
      <ValueOp title="insert(x)" hint="sift-up O(log n)" action="Insert"
        fields={[{ name: 'value', placeholder: 'x' }]}
        disabled={locked} onRun={args => run('insert', args)} />
      <OpButton label="extractMin()" hint="sift-down" danger disabled={locked} onClick={() => run('extractMin', {})} />
      <OpButton label="peekMin()" hint="O(1)" disabled={locked} onClick={() => run('peekMin', {})} />
    </PanelSection>
  );
}
