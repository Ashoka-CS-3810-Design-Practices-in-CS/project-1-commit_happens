/*
 * The Core Application Logic layer (Assignment 2 §5.1): validates operations,
 * runs the algorithm, commits the next model, records history, and hands the
 * recorded steps to the shared playback controller.
 */
import { useEffect, useState } from 'react';
import type { HistoryEntry, OpArgs, Step, StructureModule } from '../core/types';
import { usePlayback } from '../core/playback';
import { REGISTRY } from '../registry';
import { PlaybackBar } from './PlaybackBar';
import { Inspector } from './Inspector';
import { HelpOverlay } from './HelpOverlay';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: StructureModule<any>;
  onNavigate: (id: string | null) => void;
}

export function Workspace({ module, onNavigate }: Props) {
  // open in a realistic working state, never an empty shell
  const [model, setModel] = useState<unknown>(() => module.random());
  const [steps, setSteps] = useState<Step<unknown>[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { op: 'RANDOM', value: '—', result: module.summary(model as never) },
  ]);
  const [selectedOp, setSelectedOp] = useState(module.operations[0].key);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const playback = usePlayback();

  const locked = playback.state.playing; // mutation lock, A1 ER6
  const step = steps.length ? steps[Math.min(playback.state.index, steps.length - 1)] : null;
  const snapshot = step ? step.snapshot : model;

  function run(opKey: string, args: OpArgs) {
    if (playback.state.playing) return; // belt-and-braces: controls are also disabled
    const op = module.operations.find(o => o.key === opKey);
    if (!op) return;
    setSelectedOp(opKey); // complexity + pseudocode panels follow the selection
    const err = op.validate(model, args);
    if (err) {
      // rejected: no mutation, no history entry, no animation (A3 §3.3)
      setInlineError(err);
      return;
    }
    setInlineError(null);
    const { steps: recorded, next } = op.run(model, args);
    setModel(next);
    setSteps(recorded);
    playback.load(recorded.length, !reducedMotion());
    const value = Object.values(args).filter(Boolean).join(', ') || '—';
    setHistory(h => [...h, { op: op.label, value, result: module.summary(next) }]);
  }

  function regenerate(kind: 'random' | 'clear') {
    if (playback.state.playing) return;
    const fresh = kind === 'random' ? module.random() : module.create();
    setModel(fresh);
    setSteps([]);
    playback.load(0, false);
    setInlineError(null);
    setHistory(h => [...h, { op: kind.toUpperCase(), value: '—', result: module.summary(fresh) }]);
  }

  // keyboard playback controls: space, arrows, R (A3 §5.7)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement) return;
      if (e.key === ' ') { e.preventDefault(); playback.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); playback.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); playback.prev(); }
      else if (e.key.toLowerCase() === 'r') playback.restart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playback]);

  const { View, Controls } = module;

  return (
    <div className="ws-root">
      <div className="os-window">
        <div className="titlebar">
          <div className="titlebar-left">
            <button type="button" className="win-btn" title="Back to topics" onClick={() => onNavigate(null)}>←</button>
            <span className="brand small">&gt;_ DSA Visualiser</span>
            <span className="titlebar-crumb">[ {module.title} ]</span>
          </div>
          <div className="titlebar-right">
            <button type="button" className="win-btn" title="Help & legend" onClick={() => setHelpOpen(true)}>?</button>
            <button type="button" className="win-btn close" title="Back to topics" onClick={() => onNavigate(null)}>✕</button>
          </div>
        </div>

        <div className="ws-grid">
          <aside className="ws-left">
            <div className="panel-section">
              <span className="panel-label">STRUCTURE:</span>
              <select
                id="structure-select"
                className="structure-select"
                value={module.id}
                disabled={locked}
                onChange={e => onNavigate(e.target.value)}
              >
                {REGISTRY.map(m => (
                  <option key={m.id} value={m.id}>{m.title.toUpperCase()} ({m.tag})</option>
                ))}
              </select>
            </div>

            <div className="panel-section">
              <span className="panel-label">DATA:</span>
              <div className="value-op-row">
                <button type="button" className="op-btn slim" disabled={locked} onClick={() => regenerate('random')}>RandomGen()</button>
                <button type="button" className="op-btn slim" disabled={locked} onClick={() => regenerate('clear')}>Clear</button>
              </div>
            </div>

            <Controls model={snapshot as never} locked={locked} run={run} error={inlineError} />

            {inlineError && <p className="inline-error" role="alert">✕ {inlineError}</p>}

            <div className="panel-stats">
              {module.stats(model as never).map(([k, v]) => (
                <div key={k} className="stat-row"><span>{k}:</span><strong>{v}</strong></div>
              ))}
            </div>
          </aside>

          <main className="ws-stage">
            <div className="dot-grid" aria-hidden="true" />
            <View snapshot={snapshot as never} step={step as never} />
          </main>

          <Inspector
            structureId={module.id}
            operations={module.operations}
            selectedOp={selectedOp}
            onSelectOp={setSelectedOp}
            step={step}
            history={history}
            onClearHistory={() => setHistory([])}
          />
        </div>

        <PlaybackBar playback={playback} step={step} total={steps.length} />
      </div>
      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
