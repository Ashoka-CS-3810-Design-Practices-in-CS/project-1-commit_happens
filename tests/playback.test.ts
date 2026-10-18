/* T2 (Assignment 3 §3.5): playback controls respect bounds and state. */
import { describe, expect, it } from 'vitest';
import { initialPlayback, playbackReducer, type PlaybackState } from '../src/core/playback';

const loaded = (n: number): PlaybackState =>
  playbackReducer(initialPlayback, { kind: 'load', length: n, autoplay: false });

describe('playback controller', () => {
  it('load resets the index and stores the length', () => {
    const s = playbackReducer({ length: 3, index: 2, playing: true, speed: 1 }, { kind: 'load', length: 5, autoplay: false });
    expect(s).toMatchObject({ length: 5, index: 0, playing: false });
  });

  it('load with autoplay starts playing only when there is more than one step', () => {
    expect(playbackReducer(initialPlayback, { kind: 'load', length: 4, autoplay: true }).playing).toBe(true);
    expect(playbackReducer(initialPlayback, { kind: 'load', length: 1, autoplay: true }).playing).toBe(false);
  });

  it('next and prev move exactly one step and clamp at both boundaries', () => {
    let s = loaded(3);
    s = playbackReducer(s, { kind: 'prev' });
    expect(s.index).toBe(0); // cannot go below 0
    s = playbackReducer(s, { kind: 'next' });
    expect(s.index).toBe(1);
    s = playbackReducer(s, { kind: 'next' });
    s = playbackReducer(s, { kind: 'next' });
    s = playbackReducer(s, { kind: 'next' });
    expect(s.index).toBe(2); // cannot pass the last step
  });

  it('manual stepping pauses automatic playback', () => {
    let s = playbackReducer(loaded(3), { kind: 'play' });
    expect(s.playing).toBe(true);
    s = playbackReducer(s, { kind: 'next' });
    expect(s.playing).toBe(false);
  });

  it('tick advances while playing and auto-pauses on the last step', () => {
    let s = playbackReducer(loaded(3), { kind: 'play' });
    s = playbackReducer(s, { kind: 'tick' });
    expect(s).toMatchObject({ index: 1, playing: true });
    s = playbackReducer(s, { kind: 'tick' });
    expect(s).toMatchObject({ index: 2, playing: false });
    // further ticks change nothing
    expect(playbackReducer(s, { kind: 'tick' })).toEqual(s);
  });

  it('pause stops advancement; tick while paused is a no-op', () => {
    let s = playbackReducer(loaded(3), { kind: 'play' });
    s = playbackReducer(s, { kind: 'pause' });
    expect(playbackReducer(s, { kind: 'tick' }).index).toBe(s.index);
  });

  it('restart returns to step zero without playing', () => {
    let s = playbackReducer(loaded(4), { kind: 'next' });
    s = playbackReducer(s, { kind: 'next' });
    s = playbackReducer(s, { kind: 'restart' });
    expect(s).toMatchObject({ index: 0, playing: false });
  });

  it('pressing play at the end restarts the run', () => {
    let s = loaded(3);
    s = { ...s, index: 2 };
    s = playbackReducer(s, { kind: 'play' });
    expect(s).toMatchObject({ index: 0, playing: true });
  });

  it('speed is clamped to the supported 0.5x–2x range', () => {
    expect(playbackReducer(loaded(2), { kind: 'speed', speed: 5 }).speed).toBe(2);
    expect(playbackReducer(loaded(2), { kind: 'speed', speed: 0.1 }).speed).toBe(0.5);
    expect(playbackReducer(loaded(2), { kind: 'speed', speed: 1.5 }).speed).toBe(1.5);
  });
});
