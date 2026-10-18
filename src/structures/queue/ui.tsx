import type { ControlsProps, ViewProps } from '../../core/types';
import { markOf } from '../../components/viz';
import { OpButton, PanelSection, ValueOp } from '../../components/controls';
import type { QueueModel } from './model';
import { rearIndex } from './model';

export function View({ snapshot, step }: ViewProps<QueueModel>) {
  const n = snapshot.cells.length;
  const rear = rearIndex(snapshot);
  return (
    <div className="stage-inner">
      <div className="queue-stage">
        <div className="queue-row">
          {snapshot.cells.map((v, i) => (
            <div key={i} className="queue-slot">
              <span className={'slot-tag' + (snapshot.size > 0 && i === snapshot.front ? ' front' : '')}>
                {snapshot.size > 0 && i === snapshot.front ? 'FRONT ↓' : ' '}
              </span>
              <div className={'cell queue-cell' + (v === null ? ' empty' : ` mark-${markOf(`q${i}`, step)}`)}>
                {v === null ? '·' : v}
              </div>
              <span className="cell-idx">[{i}]</span>
              <span className={'slot-tag' + (snapshot.size > 0 && i === rear ? ' rear' : '')}>
                {snapshot.size > 0 && i === rear ? '↑ REAR' : ' '}
              </span>
            </div>
          ))}
        </div>
        <div className="stage-caption">
          Circular buffer — dequeue moves the front index, nothing shifts. rear = (front + size) mod {n}
        </div>
      </div>
    </div>
  );
}

export function Controls({ locked, run }: ControlsProps<QueueModel>) {
  return (
    <PanelSection title="OPERATIONS">
      <ValueOp title="enqueue(x)" hint="O(1)" action="Enqueue"
        fields={[{ name: 'value', placeholder: 'x' }]}
        disabled={locked} onRun={args => run('enqueue', args)} />
      <OpButton label="dequeue()" hint="remove front" danger disabled={locked} onClick={() => run('dequeue', {})} />
      <OpButton label="front()" hint="query front" disabled={locked} onClick={() => run('front', {})} />
      <OpButton label="rear()" hint="query rear" disabled={locked} onClick={() => run('rear', {})} />
      <OpButton label="isEmpty()" hint="size == 0?" disabled={locked} onClick={() => run('isEmpty', {})} />
    </PanelSection>
  );
}
