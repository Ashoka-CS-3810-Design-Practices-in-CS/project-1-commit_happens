import { useState } from 'react';
import type { HistoryEntry, Operation, Step } from '../core/types';
import { COMPLEXITY_TABLE } from '../core/complexity';
import { PSEUDOCODE } from '../core/pseudocode';

type Tab = 'history' | 'pseudo' | 'complexity';

interface Props {
  structureId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operations: Operation<any>[];
  selectedOp: string;
  onSelectOp: (key: string) => void;
  step: Step<unknown> | null;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

export function Inspector(props: Props) {
  const [tab, setTab] = useState<Tab>('history');
  const code = PSEUDOCODE[props.structureId]?.[props.selectedOp] ?? [];
  const table = COMPLEXITY_TABLE[props.structureId] ?? {};
  const selected = table[props.selectedOp];
  const opLabel = props.operations.find(o => o.key === props.selectedOp)?.label ?? props.selectedOp;

  return (
    <aside className="ws-right">
      <div className="pill-tabs-wrap">
        <div className="pill-tabs" role="tablist">
          {(['history', 'pseudo', 'complexity'] as Tab[]).map(t => (
            <button key={t} type="button" role="tab" aria-selected={tab === t}
              className={'pill' + (tab === t ? ' on' : '')}
              onClick={() => setTab(t)}>
              {t === 'history' ? 'HISTORY' : t === 'pseudo' ? 'PSEUDOCODE' : 'COMPLEXITY'}
            </button>
          ))}
        </div>
      </div>

      <div className="inspector-body">
        {tab === 'history' && (
          <>
            <div className="inspector-head">
              <span>Operation log</span>
              <button type="button" className="link-btn" onClick={props.onClearHistory}>[clear]</button>
            </div>
            {props.history.length === 0 ? (
              <p className="sub">No operations yet.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr><th>OPERATION</th><th>ARGS</th><th>RESULTING STATE</th></tr>
                </thead>
                <tbody>
                  {props.history.map((h, i) => (
                    <tr key={i} className={i === props.history.length - 1 ? 'latest' : ''}>
                      <td className="op-name">{h.op}</td>
                      <td className="op-args">{h.value}</td>
                      <td className="op-result">{h.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="fineprint">Only accepted operations are logged — rejected input never mutates the structure.</p>
          </>
        )}

        {tab === 'pseudo' && (
          <>
            <div className="inspector-head">
              <span>Active trace: {opLabel}</span>
            </div>
            {code.length === 0 ? (
              <p className="sub">No pseudocode for this operation.</p>
            ) : (
              <div className="pseudo-block">
                {code.map((line, i) => {
                  const active = props.step?.pcLine === i + 1;
                  return (
                    <div key={i} className={'pc-line' + (active ? ' active' : '')}>
                      <span className="pc-num">{i + 1}</span>
                      <span className="pc-text">{line}</span>
                      {active && <span className="pc-marker">PC={i + 1}</span>}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="fineprint">The highlighted line follows the current playback step.</p>
          </>
        )}

        {tab === 'complexity' && (
          <>
            <div className="inspector-head">
              <span>Complexity profile</span>
              <span className="mono-chip">{props.structureId}::{props.selectedOp}</span>
            </div>
            {selected && (
              <div className="cx-selected">
                <div className="cx-selected-title">{opLabel}</div>
                <div className="cx-cells">
                  {selected.best && <span className="cx-cell"><em>best</em>{selected.best}</span>}
                  {selected.avg && <span className="cx-cell"><em>avg</em>{selected.avg}</span>}
                  <span className="cx-cell worst"><em>worst</em>{selected.worst}</span>
                  <span className="cx-cell"><em>space</em>{selected.space}</span>
                </div>
                {selected.note && <p className="fineprint">{selected.note}</p>}
              </div>
            )}
            <table className="cx-table">
              <thead><tr><th>operation</th><th>worst</th><th>space</th></tr></thead>
              <tbody>
                {Object.entries(table).map(([key, c]) => (
                  <tr key={key}
                    className={key === props.selectedOp ? 'latest' : ''}
                    onClick={() => props.onSelectOp(key)}>
                    <td className="op-name clickable">{key}</td>
                    <td>{c.worst}</td>
                    <td>{c.space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="fineprint">Worst-case bounds are properties of the algorithm — a static lookup, never measured from one run.</p>
          </>
        )}
      </div>

      {props.step?.order && props.step.order.length > 0 && (
        <div className="order-strip">
          <span className="memory-label">output:</span>
          {props.step.order.map((v, i) => <span key={i} className="mem-cell mark-visited">{v}</span>)}
        </div>
      )}
    </aside>
  );
}
