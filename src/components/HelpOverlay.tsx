export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="help-backdrop" role="dialog" aria-modal="true" aria-label="Help and legend" onClick={onClose}>
      <div className="help-panel" onClick={e => e.stopPropagation()}>
        <div className="inspector-head">
          <span>HELP / LEGEND</span>
          <button type="button" className="link-btn" onClick={onClose}>[close]</button>
        </div>
        <h3>Colour legend</h3>
        <ul className="legend-list">
          <li><span className="legend-swatch mark-current" /> current element — being processed right now</li>
          <li><span className="legend-swatch mark-visited" /> visited — already processed</li>
          <li><span className="legend-swatch mark-frontier" /> frontier — waiting in the BFS queue / DFS stack</li>
          <li><span className="legend-swatch mark-error" /> error — a blocked or failed action</li>
          <li><span className="legend-swatch" /> untouched</li>
        </ul>
        <h3>Workflow</h3>
        <ol className="help-steps">
          <li>Build a structure by hand, or press <strong>RandomGen()</strong>.</li>
          <li>Trigger an operation — its steps are recorded once, then replayed.</li>
          <li>Scrub with the playback bar; the pseudocode line and panels follow every step.</li>
        </ol>
        <h3>Keyboard</h3>
        <p className="sub">
          <kbd>space</kbd> play / pause · <kbd>←</kbd>/<kbd>→</kbd> step back / forward · <kbd>R</kbd> restart
        </p>
        <p className="fineprint">
          Mutating controls are disabled while playback runs, so the picture can never drift from the model.
          With “reduce motion” enabled in your OS, operations load paused for manual stepping.
        </p>
      </div>
    </div>
  );
}
