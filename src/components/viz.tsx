/* Small helpers shared by the structure Views. */
import type { Step } from '../core/types';

export type Mark = 'current' | 'visited' | 'frontier' | 'error' | 'none';

/** Which visual state an element id has in the given step. */
export function markOf(id: string, step: Step<unknown> | null): Mark {
  if (!step) return 'none';
  if (step.highlight.includes(id)) return step.error ? 'error' : 'current';
  if (step.frontier?.includes(id)) return 'frontier';
  if (step.visited?.includes(id)) return 'visited';
  return 'none';
}

export function edgeMarked(id: string, step: Step<unknown> | null): boolean {
  return !!step?.edges?.includes(id);
}

/** SVG arrowhead markers used by the list and graph views. */
export function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" />
      </marker>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--blue)" />
      </marker>
    </defs>
  );
}
