/*
 * The shared contracts between the layers (Assignment 2, §5.4).
 * The algorithm layer only knows these types — no React, no DOM, no timers.
 */
import type { ComponentType } from 'react';

export type Id = string;

/**
 * One recorded moment of an operation's execution. Every step carries a FULL
 * snapshot of the structure, which is what makes step-backward trivial:
 * rendering is a pure function of the step, never of playback direction.
 */
export interface Step<S> {
  /** 'compare' | 'visit' | 'commit' | 'read' | 'info' | 'error' — used for styling */
  type: string;
  /** Human caption shown in the status badge */
  message: string;
  /** Complete copy of the structure state at this moment */
  snapshot: S;
  /** Element ids being processed right now (accent fill) */
  highlight: Id[];
  /** Element ids already processed (tinted) */
  visited?: Id[];
  /** Element ids waiting to be processed — BFS queue / DFS stack contents */
  frontier?: Id[];
  /** Edge ids on the path taken */
  edges?: Id[];
  /** Traversal order produced so far */
  order?: (string | number)[];
  /** 1-based line of this operation's pseudocode that is "executing" */
  pcLine?: number;
  /** Marks a step that reports a failed/blocked action */
  error?: boolean;
}

export type OpArgs = Record<string, string>;

export interface OpResult<S> {
  steps: Step<S>[];
  next: S;
}

export interface Operation<S> {
  /** Lookup key into the complexity and pseudocode tables, e.g. 'push' */
  key: string;
  /** Display label, e.g. 'push(x)' */
  label: string;
  /** Whether a successful run changes the structure */
  mutates: boolean;
  /** Returns an error message, or null when the operation may run (A1 ER1–ER4) */
  validate(model: S, args: OpArgs): string | null;
  /** Pure: never mutates `model`; returns recorded steps plus the next model */
  run(model: S, args: OpArgs): OpResult<S>;
}

export interface HistoryEntry {
  op: string;
  value: string;
  result: string;
}

export interface ViewProps<S> {
  snapshot: S;
  step: Step<S> | null;
}

export interface ControlsProps<S> {
  model: S;
  /** True while playback is running — mutating controls must be disabled (ER6) */
  locked: boolean;
  run: (opKey: string, args: OpArgs) => void;
  /** Inline validation error from the last rejected operation */
  error: string | null;
}

/** The self-contained structure module contract (Assignment 2, §5.4). */
export interface StructureModule<S = unknown> {
  id: string;
  title: string;
  /** Terminal-style tag shown on the landing card, e.g. 'LIFO_BUFFER' */
  tag: string;
  category: 'linear' | 'tree' | 'graphs';
  blurb: string;
  chips: string[];
  headline: string; // headline complexity on the landing card
  create(): S;
  random(): S;
  /** Short text form for the history table's "resulting state" column */
  summary(model: S): string;
  /** Label/value rows for the left panel footer */
  stats(model: S): [string, string][];
  operations: Operation<S>[];
  View: ComponentType<ViewProps<S>>;
  Controls: ComponentType<ControlsProps<S>>;
}

/** Deep-copy helper used for snapshots; models are plain JSON-safe objects. */
export function snap<S>(model: S): S {
  return structuredClone(model);
}
