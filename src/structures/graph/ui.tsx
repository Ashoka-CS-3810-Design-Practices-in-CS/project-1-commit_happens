import { useMemo, useRef, useState } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import type { ControlsProps, ViewProps } from '../../core/types';
import { ArrowDefs, edgeMarked, markOf } from '../../components/viz';
import { OpButton, PanelSection } from '../../components/controls';
import type { GraphModel } from './model';

const W = 560;
const H = 400;
const R = 19;

interface SimNode { id: string; x?: number; y?: number }

/**
 * Force-directed layout (Assignment 2 §3.2): D3's simulation is run
 * synchronously for a fixed number of ticks. Previous positions seed the next
 * run so vertices stay put while the user edits or traverses the graph —
 * layout is fully decoupled from the traversal algorithms.
 */
function useForceLayout(m: GraphModel) {
  const cache = useRef(new Map<string, { x: number; y: number }>());
  const key = m.vertices.join(',') + '|' + m.edges.map(e => e.id).join(',');
  return useMemo(() => {
    const nodes: SimNode[] = m.vertices.map(v => ({ id: v, ...cache.current.get(v) }));
    const links = m.edges.map(e => ({ source: e.a, target: e.b }));
    const sim = forceSimulation(nodes as never[])
      .force('charge', forceManyBody().strength(-420))
      .force('link', forceLink(links).id((d: unknown) => (d as SimNode).id).distance(95))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide(R + 12))
      .stop();
    for (let i = 0; i < 200; i++) sim.tick();
    const pos = new Map<string, { x: number; y: number }>();
    for (const n of nodes) {
      const x = Math.max(R + 8, Math.min(W - R - 8, n.x ?? W / 2));
      const y = Math.max(R + 8, Math.min(H - R - 8, n.y ?? H / 2));
      pos.set(n.id, { x, y });
      cache.current.set(n.id, { x, y });
    }
    return pos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function View({ snapshot, step }: ViewProps<GraphModel>) {
  const pos = useForceLayout(snapshot);
  if (snapshot.vertices.length === 0) {
    return <div className="stage-inner"><div className="stage-empty">(empty graph — add vertices, or press Random)</div></div>;
  }
  return (
    <div className="stage-inner">
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }} role="img" aria-label="Graph">
          <ArrowDefs />
          {snapshot.edges.map(e => {
            const a = pos.get(e.a)!;
            const b = pos.get(e.b)!;
            const dx = b.x - a.x, dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len, uy = dy / len;
            const on = edgeMarked(e.id, step);
            return (
              <line
                key={e.id}
                x1={a.x + ux * R} y1={a.y + uy * R}
                x2={b.x - ux * (e.directed ? R + 4 : R)} y2={b.y - uy * (e.directed ? R + 4 : R)}
                className={'svg-edge' + (on ? ' on' : '')}
                markerEnd={e.directed ? `url(#arrow-${on ? 'blue' : 'ink'})` : undefined}
              />
            );
          })}
          {snapshot.vertices.map(v => {
            const p = pos.get(v)!;
            return (
              <g key={v} className={`svg-node mark-${markOf(v, step)}`}>
                <circle cx={p.x} cy={p.y} r={R} />
                <text x={p.x} y={p.y + 4.5} textAnchor="middle">{v}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {step?.frontier && step.frontier.length > 0 && (
        <div className="frontier-strip">
          <span className="memory-label">frontier:</span>
          {step.frontier.map((v, i) => (
            <span key={`${v}${i}`} className="mem-cell mark-frontier">{v}</span>
          ))}
        </div>
      )}
      <div className="stage-caption">
        Adjacency-list graph — solid arrowheads mark directed edges. Highlighted edges form the traversal tree.
      </div>
    </div>
  );
}

export function Controls({ model, locked, run }: ControlsProps<GraphModel>) {
  const [vname, setVname] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [directed, setDirected] = useState(false);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const vs = model.vertices;
  const sel = (value: string, set: (s: string) => void, idPrefix: string, blank: string) => (
    <select id={`${idPrefix}-select`} value={vs.includes(value) ? value : ''} disabled={locked} onChange={e => set(e.target.value)}>
      <option value="">{blank}</option>
      {vs.map(v => <option key={v} value={v}>{v}</option>)}
    </select>
  );
  return (
    <>
      <PanelSection title="GRAPH EDITOR">
        <div className="value-op">
          <div className="value-op-head"><span className="value-op-title">addVertex(v)</span><span className="op-hint">O(1)</span></div>
          <div className="value-op-row">
            <input id="graph-vname" type="text" placeholder="name" maxLength={4} style={{ width: 64 }}
              value={vname} disabled={locked}
              onChange={e => setVname(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { run('addVertex', { name: vname }); setVname(''); } }} />
            <button type="button" className="primary-btn" disabled={locked}
              onClick={() => { run('addVertex', { name: vname }); setVname(''); }}>Add</button>
          </div>
        </div>
        <div className="value-op">
          <div className="value-op-head"><span className="value-op-title">addEdge(u, v)</span><span className="op-hint">O(1)</span></div>
          <div className="value-op-row">
            {sel(from, setFrom, 'edge-from', 'u')}
            <span className="op-hint">{directed ? '→' : '–'}</span>
            {sel(to, setTo, 'edge-to', 'v')}
            <button type="button" className="primary-btn" disabled={locked}
              onClick={() => run('addEdge', { from, to, directed: directed ? '1' : '' })}>Add</button>
          </div>
          <label className="check-row">
            <input id="edge-directed" type="checkbox" checked={directed} disabled={locked} onChange={e => setDirected(e.target.checked)} />
            directed edge
          </label>
        </div>
        <div className="value-op">
          <div className="value-op-head"><span className="value-op-title">remove…</span></div>
          <div className="value-op-row">
            <button type="button" className="op-btn slim" disabled={locked || !from} onClick={() => run('removeVertex', { name: from })}>vertex u</button>
            <button type="button" className="op-btn slim" disabled={locked || !from || !to} onClick={() => run('removeEdge', { from, to })}>edge u–v</button>
          </div>
          <span className="op-hint">uses the u / v pickers above</span>
        </div>
      </PanelSection>
      <PanelSection title="TRAVERSAL">
        <div className="value-op">
          <div className="value-op-head"><span className="value-op-title">source / destination</span><span className="op-hint">O(V+E)</span></div>
          <div className="value-op-row">
            {sel(source, setSource, 'trav-source', 'source')}
            {sel(target, setTarget, 'trav-target', 'dest (opt.)')}
          </div>
        </div>
        <OpButton label="BFS — breadth first" hint="queue" disabled={locked} onClick={() => run('bfs', { source, target })} />
        <OpButton label="DFS — depth first" hint="stack" disabled={locked} onClick={() => run('dfs', { source, target })} />
      </PanelSection>
    </>
  );
}
