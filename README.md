# Alesis QuadraVerb 2 Patch Editor Web App

A hardware-faithful structural editor for the Alesis QuadraVerb 2, based on the original 8-block paradigm. This application enforces strict routing rules, DSP limits, memory limits, and microprocessor-assist exclusions exactly as the hardware operates.

## Features

- **8-Block Graphic Routing:** Visualize and interact with the effect chain via a React Flow node canvas.
- **Hardware Accuracy:**
    - 100% total DSP budget (1% cost for standard patch cords, 2% cost for attenuated routes).
    - 5455.9 ms total Delay Memory budget (max 5000 ms per delay line).
    - 4 LFOs maximum per program.
    - Single Microprocessor Assist limit (allows only one Phasor, Stereo Lezlie, or Ring Modulator).
- **Graph Traversal Audibility Validation:** Automatically highlights (via forward/backward BFS) blocks that have no direct or indirect path from `L_IN`/`R_IN` to `L_OUT`/`R_OUT`.
- **Feedback & Clipping Detection:** Uses cycle detection to warn of feedback loops, and highlights potential clipping risks.
- **Save & Load:** Export programs to JSON, and import them directly to continue editing.

## Tech Stack

- **React** & **TypeScript**
- **Vite**
- **React Flow** (for the node editor)
- **Tailwind CSS v4** (for styling)
- **Vitest** (for unit testing the core domain limits)

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the local development server:

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Running Tests

Execute the validation engine unit tests:

```bash
npm run test
```

## Architecture

The project is broken into specific modules to maintain separation of concerns:

- `src/domain/types.ts`: Core data structures (`Block`, `Route`, `MixSettings`, `Program`).
- `src/domain/metadata.ts`: Static hardware properties for various effect types (DSP costs, LFO usage).
- `src/domain/validation.ts`: The pure-function limit engine. Traverses graphs and sums budgets without side effects.
- `src/hooks/useProgramState.ts`: Manages application state and local imports/exports.
- `src/components/EditorPanel.tsx`: The side panel used for destination-based patch cord routing (per the hardware standard).
- `src/components/GraphView.tsx`: The visual node representation built with React Flow.
