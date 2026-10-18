/*
 * Shared playback controller (Assignment 2, §3.3).
 * The logic is a pure reducer so it can be unit-tested without React;
 * the usePlayback hook wires the reducer to a timer.
 */
import { useEffect, useMemo, useReducer } from 'react';

export interface PlaybackState {
  length: number;
  index: number;
  playing: boolean;
  /** Multiplier: 0.5x .. 2x */
  speed: number;
}

export type PlaybackAction =
  | { kind: 'load'; length: number; autoplay: boolean }
  | { kind: 'play' }
  | { kind: 'pause' }
  | { kind: 'toggle' }
  | { kind: 'next' }
  | { kind: 'prev' }
  | { kind: 'restart' }
  | { kind: 'tick' }
  | { kind: 'speed'; speed: number };

export const initialPlayback: PlaybackState = {
  length: 0,
  index: 0,
  playing: false,
  speed: 1,
};

/** ms between steps at 1.0x */
export const BASE_DELAY = 900;

const clamp = (i: number, len: number) => Math.max(0, Math.min(i, Math.max(0, len - 1)));

export function playbackReducer(s: PlaybackState, a: PlaybackAction): PlaybackState {
  switch (a.kind) {
    case 'load':
      return { ...s, length: a.length, index: 0, playing: a.autoplay && a.length > 1 };
    case 'play':
      if (s.length === 0) return s;
      // pressing play at the end restarts the run
      if (s.index >= s.length - 1) return { ...s, index: 0, playing: true };
      return { ...s, playing: true };
    case 'pause':
      return { ...s, playing: false };
    case 'toggle':
      return playbackReducer(s, { kind: s.playing ? 'pause' : 'play' });
    case 'next':
      return { ...s, playing: false, index: clamp(s.index + 1, s.length) };
    case 'prev':
      return { ...s, playing: false, index: clamp(s.index - 1, s.length) };
    case 'restart':
      return { ...s, playing: false, index: 0 };
    case 'tick': {
      if (!s.playing) return s;
      const next = clamp(s.index + 1, s.length);
      return { ...s, index: next, playing: next < s.length - 1 };
    }
    case 'speed':
      return { ...s, speed: Math.min(2, Math.max(0.5, a.speed)) };
  }
}

export function usePlayback() {
  const [state, dispatch] = useReducer(playbackReducer, initialPlayback);

  useEffect(() => {
    if (!state.playing) return;
    const t = setTimeout(() => dispatch({ kind: 'tick' }), BASE_DELAY / state.speed);
    return () => clearTimeout(t); // no stale timers after unmount/switch (A3 §3.2)
  }, [state.playing, state.index, state.speed]);

  const api = useMemo(
    () => ({
      load: (length: number, autoplay = true) => dispatch({ kind: 'load', length, autoplay }),
      toggle: () => dispatch({ kind: 'toggle' }),
      pause: () => dispatch({ kind: 'pause' }),
      next: () => dispatch({ kind: 'next' }),
      prev: () => dispatch({ kind: 'prev' }),
      restart: () => dispatch({ kind: 'restart' }),
      setSpeed: (speed: number) => dispatch({ kind: 'speed', speed }),
    }),
    []
  );

  return { state, ...api };
}
