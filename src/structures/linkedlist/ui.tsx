import type { ControlsProps, ViewProps } from '../../core/types';
import { markOf } from '../../components/viz';
import { OpButton, PanelSection, ValueOp } from '../../components/controls';
import type { ListModel } from './model';

export function View({ snapshot, step }: ViewProps<ListModel>) {
  return (
    <div className="stage-inner">
      <div className="list-stage">
        {snapshot.nodes.length === 0 ? (
          <div className="stage-empty">head → ∅ (empty list)</div>
        ) : (
          <div className="list-row">
            <span className="pointer-chip">head</span>
            <span className="list-arrow">→</span>
            {snapshot.nodes.map(node => (
              <div key={node.id} style={{ display: 'contents' }}>
                <div className={`list-node mark-${markOf(node.id, step)}`}>
                  <span className="list-val">{node.value}</span>
                  <span className="list-ptr">●</span>
                </div>
                <span className="list-arrow">→</span>
              </div>
            ))}
            <span className="null-chip">∅</span>
          </div>
        )}
        <div className="stage-caption">
          Singly linked list — each node stores a value and a pointer to the next node.
        </div>
      </div>
    </div>
  );
}

export function Controls({ model, locked, run }: ControlsProps<ListModel>) {
  const maxIns = model.nodes.length;
  return (
    <PanelSection title="OPERATIONS">
      <ValueOp title="insertHead(x)" hint="O(1)" action="Insert"
        fields={[{ name: 'value', placeholder: 'x' }]}
        disabled={locked} onRun={args => run('insertHead', args)} />
      <ValueOp title="insertTail(x)" hint="O(1)" action="Insert"
        fields={[{ name: 'value', placeholder: 'x' }]}
        disabled={locked} onRun={args => run('insertTail', args)} />
      <ValueOp title="insertAt(i, x)" hint={`O(n), i ≤ ${maxIns}`} action="Insert"
        fields={[{ name: 'index', placeholder: 'i', width: 44 }, { name: 'value', placeholder: 'x' }]}
        disabled={locked} onRun={args => run('insertAt', args)} />
      <ValueOp title="deleteAt(i)" hint="O(n)" action="Delete"
        fields={[{ name: 'index', placeholder: 'i', width: 44 }]}
        disabled={locked} onRun={args => run('deleteAt', args)} />
      <ValueOp title="search(x)" hint="O(n)" action="Search"
        fields={[{ name: 'value', placeholder: 'x' }]}
        disabled={locked} onRun={args => run('search', args)} />
      <OpButton label="traverse()" hint="walk all nodes" disabled={locked} onClick={() => run('traverse', {})} />
      <OpButton label="reverse()" hint="flip pointers" disabled={locked} onClick={() => run('reverse', {})} />
    </PanelSection>
  );
}
