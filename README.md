# DSA Visualiser — DPCS Project 3

Interactive Data Structure and Algorithms Visualizer. Team **Commit Happens**
(Rehmat Kaur, Savyamm Jhunjhunwala).

Six structures — stack, queue (circular buffer), singly linked list, BST,
min-heap priority queue, graph — with every operation recorded as a step list
and replayed through a shared playback controller (play / pause / step forward /
**step back** / restart / 0.5–2× speed), plus complexity, pseudocode and
history panels.

## Run

```bash
npm install
npm run dev       # dev server on http://localhost:5173
```

## Test / build

```bash
npm test          # 56 Vitest tests over the algorithm + playback layers
npm run build     # type-check + production bundle in dist/
npm run preview   # serve the production bundle
```

## Stack

React 18 + TypeScript + Vite. Native SVG/CSS for all rendering; D3 (`d3-force`)
is used **only** for automatic graph vertex layout, exactly as scoped in
Assignment 2. No other runtime dependencies.

## Layout

```
src/
  core/          types (Step, StructureModule), playback reducer+hook,
                 complexity table, pseudocode table, validation, rng
  structures/    one self-contained module per structure:
    <name>/model.ts        internal representation + random generator
    <name>/algorithms.ts   pure (model, args) → { steps, next } operations
    <name>/ui.tsx          View (SVG/HTML renderer) + Controls (operation panel)
    <name>/index.ts        assembles the StructureModule contract
  components/    Landing, Workspace (core app logic), Inspector (history /
                 pseudocode / complexity tabs), PlaybackBar, HelpOverlay
  registry.ts    the list of installed structure modules
tests/           Vitest suites: structures, playback controller, static tables
```
