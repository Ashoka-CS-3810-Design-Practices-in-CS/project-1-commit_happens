import type { ControlsProps, ViewProps } from '../../core/types';
import { markOf } from '../../components/viz';
import { OpButton, PanelSection, ValueOp } from '../../components/controls';
import type { StackModel } from './model';

export function View({ snapshot, step }: ViewProps<StackModel>) {
  const n = snapshot.items.length;
  const slots = Array.from({ length: snapshot.cap }, (_, i) => i).reverse();
  return (
    <div className="stage-inner">
      <div className="stack-stage">
        <div className="stack-pointer-col">
          {n > 0 && (
            <div className="top-pointer" style={{ bottom: `${(n - 1) * 52 + 14}px` }}>
              <span className="pointer-chip">top</span> →
            </div>
          )}
        </div>
        <div>
          <div className="stack-bucket">
            {slots.map(i =>
              i < n ? (
                <div key={i} className={`cell stack-cell mark-${markOf(`s${i}`, step)}`}>
                  <span className="cell-idx">[{i}]</span>
                  <span className="cell-val">{snapshot.items[i]}</span>
                  <span className="cell-tag">{i === n - 1 ? 'TOP' : i === 0 ? 'base' : ''}</span>
                </div>
              ) : (
                <div key={i} className="cell stack-cell empty">[{i}] empty</div>
              )
            )}
          </div>
          <div className="stage-caption">Stack container — closed base, open top (LIFO)</div>
        </div>
      </div>
      <div className="memory-strip">
        <span className="memory-label">Memory array:</span>
        <div className="memory-cells">
          {Array.from({ length: snapshot.cap }, (_, i) => (
            <span key={i} className={'mem-cell' + (i < n ? ` mark-${markOf(`s${i}`, step)}` : ' null')}>
              {i < n ? snapshot.items[i] : 'null'}
            </span>
          ))}
        </div>
        <span className="memory-note">size: {n} | cap: {snapshot.cap}</span>
      </div>
    </div>
  );
}

export function Controls({ model, locked, run }: ControlsProps<StackModel>) {
  return (
    <>
      <PanelSection title="CAPACITY">
        <ValueOp title="setCapacity(c)" hint="3–10" action="Set"
          fields={[{ name: 'value', placeholder: String(model.cap) }]}
          disabled={locked} onRun={args => run('setCapacity', args)} />
      </PanelSection>
      <PanelSection title="OPERATIONS">
        <ValueOp title="push(x)" hint="O(1)" action="Push"
          fields={[{ name: 'value', placeholder: 'x' }]}
          disabled={locked} onRun={args => run('push', args)} />
        <OpButton label="pop()" hint="remove top" danger disabled={locked} onClick={() => run('pop', {})} />
        <OpButton label="peek()" hint="query top" disabled={locked} onClick={() => run('peek', {})} />
        <OpButton label="isUnderflow()" hint="isEmpty?" disabled={locked} onClick={() => run('isEmpty', {})} />
        <OpButton label="isOverflow()" hint={`cap = ${model.cap}`} disabled={locked} onClick={() => run('isFull', {})} />
      </PanelSection>
    </>
  );
}
