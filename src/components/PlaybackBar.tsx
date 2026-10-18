import type { Step } from '../core/types';
import type { usePlayback } from '../core/playback';

interface Props {
  playback: ReturnType<typeof usePlayback>;
  step: Step<unknown> | null;
  total: number;
}

export function PlaybackBar({ playback, step, total }: Props) {
  const { state } = playback;
  const none = total === 0;
  return (
    <footer className="playback-bar">
      <div className={'status-badge' + (step?.error ? ' error' : '')}>
        <span className="status-step">{none ? 'READY' : `STEP ${state.index + 1}/${total}`}</span>
        <span className="status-msg">
          {!none && <span className={'pulse' + (state.playing ? ' on' : '')} />}
          {step ? step.message : 'run an operation to record steps'}
        </span>
      </div>
      <div className="playback-controls">
        <button type="button" className="pb-btn" disabled={none || state.index === 0}
          onClick={playback.prev} title="Step back (←)">
          ‹ <span className="pb-label">Step Back</span>
        </button>
        <button type="button" className="pb-btn main" disabled={none}
          onClick={playback.toggle} title="Play / pause (space)">
          {state.playing ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button type="button" className="pb-btn" disabled={none || state.index >= total - 1}
          onClick={playback.next} title="Step forward (→)">
          <span className="pb-label">Step Forward</span> ›
        </button>
        <button type="button" className="pb-btn" disabled={none}
          onClick={playback.restart} title="Restart (R)">
          ↺
        </button>
      </div>
      <div className="speed-wrap">
        <label htmlFor="speed-range">Speed:</label>
        <input
          id="speed-range"
          type="range"
          min={0.5}
          max={2}
          step={0.25}
          value={state.speed}
          onChange={e => playback.setSpeed(Number(e.target.value))}
        />
        <span className="speed-val">{state.speed.toFixed(2).replace(/0$/, '')}x</span>
      </div>
    </footer>
  );
}
