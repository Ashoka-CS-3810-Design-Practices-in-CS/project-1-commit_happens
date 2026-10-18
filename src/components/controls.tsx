/* Reusable control primitives for the left operations panel. */
import { useState, type ReactNode } from 'react';

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel-section">
      <span className="panel-label">{title}</span>
      {children}
    </div>
  );
}

/** A plain operation button with a right-aligned hint, e.g. pop() | O(1). */
export function OpButton(props: { label: string; hint?: string; danger?: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" className="op-btn" disabled={props.disabled} onClick={props.onClick}>
      <span>{props.label}</span>
      {props.hint && <span className={'op-hint' + (props.danger ? ' danger' : '')}>{props.hint}</span>}
    </button>
  );
}

/** A boxed operation with one or two inline inputs and a primary action button. */
export function ValueOp(props: {
  title: string;
  hint?: string;
  fields: { name: string; placeholder: string; width?: number }[];
  action: string;
  disabled: boolean;
  onRun: (args: Record<string, string>) => void;
}) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const submit = () => props.onRun(vals);
  return (
    <div className="value-op">
      <div className="value-op-head">
        <span className="value-op-title">{props.title}</span>
        {props.hint && <span className="op-hint">{props.hint}</span>}
      </div>
      <div className="value-op-row">
        {props.fields.map(f => (
          <input
            key={f.name}
            id={`op-${props.title.replace(/\W+/g, '')}-${f.name}`}
            type="text"
            inputMode="numeric"
            placeholder={f.placeholder}
            style={{ width: f.width ?? 56 }}
            value={vals[f.name] ?? ''}
            disabled={props.disabled}
            onChange={e => setVals(v => ({ ...v, [f.name]: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          />
        ))}
        <button type="button" className="primary-btn" disabled={props.disabled} onClick={submit}>
          {props.action}
        </button>
      </div>
    </div>
  );
}
