import { useState } from 'react';
import { REGISTRY } from '../registry';
import type { StructureModule } from '../core/types';

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: `ALL (${REGISTRY.length})` },
  { key: 'linear', label: 'LINEAR' },
  { key: 'tree', label: 'TREES & HEAPS' },
  { key: 'graphs', label: 'GRAPHS' },
];

/** Small static sketch for each landing card, in the Stitch style. */
function MiniPreview({ id }: { id: string }) {
  switch (id) {
    case 'stack':
      return (
        <div className="mini mini-stack">
          <div className="mini-bar current">TOP [99]</div>
          <div className="mini-bar visited">[42]</div>
          <div className="mini-bar">[17]</div>
        </div>
      );
    case 'queue':
      return (
        <div className="mini mini-queue">
          <div><span className="mini-tag">FRONT</span><div className="mini-box current">12</div></div>
          <span className="mini-arrow">➔</span>
          <div><span className="mini-tag">&nbsp;</span><div className="mini-box">24</div></div>
          <span className="mini-arrow">➔</span>
          <div><span className="mini-tag">REAR</span><div className="mini-box dashed">88</div></div>
        </div>
      );
    case 'linkedlist':
      return (
        <div className="mini mini-queue">
          <div className="mini-node current">10<span>●</span></div>
          <span className="mini-arrow blue">➔</span>
          <div className="mini-node">25<span>●</span></div>
          <span className="mini-arrow">➔</span>
          <span className="mini-null">NULL</span>
        </div>
      );
    case 'bst':
      return (
        <svg className="mini" viewBox="0 0 240 104">
          <line x1="120" y1="20" x2="65" y2="52" className="mini-edge dark" />
          <line x1="120" y1="20" x2="175" y2="52" className="mini-edge dark" />
          <line x1="65" y1="52" x2="35" y2="84" className="mini-edge" />
          <line x1="65" y1="52" x2="95" y2="84" className="mini-edge" />
          <line x1="175" y1="52" x2="145" y2="84" className="mini-edge" />
          <line x1="175" y1="52" x2="205" y2="84" className="mini-edge" />
          {[
            { x: 120, y: 20, v: 50, c: 'current', r: 12 },
            { x: 65, y: 52, v: 25, c: 'visited', r: 11 }, { x: 175, y: 52, v: 75, c: 'visited', r: 11 },
            { x: 35, y: 84, v: 15, c: '', r: 9 }, { x: 95, y: 84, v: 35, c: '', r: 9 },
            { x: 145, y: 84, v: 60, c: '', r: 9 }, { x: 205, y: 84, v: 85, c: '', r: 9 },
          ].map(n => (
            <g key={n.v} className={`mini-circle ${n.c}`}>
              <circle cx={n.x} cy={n.y} r={n.r} />
              <text x={n.x} y={n.y + 3.5} textAnchor="middle">{n.v}</text>
            </g>
          ))}
        </svg>
      );
    case 'heap':
      return (
        <svg className="mini" viewBox="0 0 240 104">
          <line x1="120" y1="18" x2="72" y2="46" className="mini-edge dark" />
          <line x1="120" y1="18" x2="168" y2="46" className="mini-edge dark" />
          <line x1="72" y1="46" x2="48" y2="70" className="mini-edge" />
          <line x1="72" y1="46" x2="96" y2="70" className="mini-edge" />
          {[
            { x: 120, y: 18, v: 1, c: 'current', r: 11 },
            { x: 72, y: 46, v: 4, c: 'visited', r: 10 }, { x: 168, y: 46, v: 7, c: 'visited', r: 10 },
            { x: 48, y: 70, v: 9, c: '', r: 8 }, { x: 96, y: 70, v: 12, c: '', r: 8 },
          ].map(n => (
            <g key={n.v} className={`mini-circle ${n.c}`}>
              <circle cx={n.x} cy={n.y} r={n.r} />
              <text x={n.x} y={n.y + 3} textAnchor="middle">{n.v}</text>
            </g>
          ))}
          <g className="mini-array">
            {[1, 4, 7, 9, 12].map((v, i) => (
              <g key={v} className={`mini-circle ${i === 0 ? 'current' : i < 3 ? 'visited' : ''}`}>
                <rect x={50 + i * 30} y={86} width={28} height={15} />
                <text x={64 + i * 30} y={97} textAnchor="middle">[{v}]</text>
              </g>
            ))}
          </g>
        </svg>
      );
    default:
      return (
        <svg className="mini" viewBox="0 0 240 104">
          <line x1="45" y1="52" x2="115" y2="22" className="mini-edge blue" />
          <line x1="115" y1="22" x2="195" y2="36" className="mini-edge blue" />
          <line x1="45" y1="52" x2="85" y2="84" className="mini-edge dark" />
          <line x1="115" y1="22" x2="170" y2="84" className="mini-edge dark" />
          <line x1="85" y1="84" x2="170" y2="84" className="mini-edge dashed" />
          <line x1="195" y1="36" x2="170" y2="84" className="mini-edge" />
          {[
            { x: 45, y: 52, v: 'A', c: 'current' }, { x: 115, y: 22, v: 'B', c: 'current' },
            { x: 195, y: 36, v: 'C', c: 'visited' }, { x: 85, y: 84, v: 'D', c: '' }, { x: 170, y: 84, v: 'E', c: '' },
          ].map(n => (
            <g key={n.v} className={`mini-circle ${n.c}`}>
              <circle cx={n.x} cy={n.y} r={13} />
              <text x={n.x} y={n.y + 4} textAnchor="middle">{n.v}</text>
            </g>
          ))}
        </svg>
      );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Card({ m, onOpen }: { m: StructureModule<any>; onOpen: (id: string) => void }) {
  return (
    <article className="topic-card">
      <div className="card-head">
        <span className="card-dot" /> <span className="card-tag">{m.tag}</span>
        <span className="card-big-o">{m.headline}</span>
      </div>
      <div className="card-body">
        <div className="card-preview"><MiniPreview id={m.id} /></div>
        <h2>{m.title}</h2>
        <p className="card-blurb">{m.blurb}</p>
      </div>
      <div className="card-foot">
        <button type="button" className="enter-btn" onClick={() => onOpen(m.id)}>Enter</button>
      </div>
    </article>
  );
}

export function Landing({ onOpen }: { onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const q = query.toLowerCase().trim();
  const shown = REGISTRY.filter(
    m =>
      (filter === 'all' || m.category === filter) &&
      (!q || `${m.title} ${m.tag} ${m.chips.join(' ')}`.toLowerCase().includes(q))
  );
  return (
    <div className="landing">
      <header className="site-header">
        <div className="header-inner">
          <div className="traffic">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
          </div>
          <span className="brand">&gt; DSA VISUALISER</span>
          <input
            id="topic-search"
            className="topic-search"
            type="text"
            placeholder="Search structures (e.g. stack, tree, bfs)…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setQuery(''); }}
          />
          <span className="team-badge">team: Commit Happens</span>
        </div>
      </header>
      <main className="landing-main">
        <div className="landing-headrow">
          <div>
            <h1>Algorithm &amp; Data Structure Topics</h1>
            <p className="sub">Select a module, build a structure, and step through its algorithms one state at a time.</p>
          </div>
          <div className="filters">
            {FILTERS.map(f => (
              <button key={f.key} type="button"
                className={'filter-btn' + (filter === f.key ? ' on' : '')}
                onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="cards-grid">
          {shown.map(m => <Card key={m.id} m={m} onOpen={onOpen} />)}
          {shown.length === 0 && <p className="sub">No structure matches “{query}”.</p>}
        </div>
      </main>
      <footer className="site-footer">
        <span><span className="dot blue-dot" /> Made by Commit Happens — Rehmat Kaur &amp; Savyamm Jhunjhunwala</span>
        <span>DPCS Project 3 · Interactive Data Structure &amp; Algorithms Visualizer</span>
      </footer>
    </div>
  );
}
