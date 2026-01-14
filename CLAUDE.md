# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Life" is a browser-based evolution game made for GMTK Jam 2024. Players start as a small cell and evolve through increasingly complex organisms (blobs → worms → fish). All graphics are procedurally generated - no graphical assets are used.

## Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm preview  # Preview production build
```

## Architecture

### Core Systems

**Engine (`src/engine.ts`)**: Game engine wrapper around PixiJS. Manages the render loop, physics world (Rapier2D), camera system with smooth interpolation, and container hierarchy (mainContainer → zoomContainer → stageContainer). Exposes globals: `engine`, `camera`, `physicsWorld`, `addChild()`.

**Game (`src/game.ts`)**: Main game class. Manages levels, player, particles, background, and narration. Handles evolution progression and music transitions based on player level.

**Level (`src/Level.ts`)**: Spawns and manages NPC organisms. Each level corresponds to an organism size tier. Levels dynamically load/unload based on player proximity.

**Player (`src/Player.ts`)**: Handles player input (A/D keys or mouse), evolution upgrades, and eating mechanics. The `upgrades` array defines organism transformations at each level.

### Organism System

**Organism (`src/organisms/Organism.ts`)**: Base class for all creatures. Handles movement, collision groups (via Rapier2D), hunting/hunted behavior, and physics body management.

**BlobOrganism**: Simple circular organisms with procedural wiggle deformation using noise. Used for early evolution stages (levels 0-3).

**WormOrganism**: Multi-segment creatures using `Body`/`Chain` for procedural animation. Segments follow the head with angle constraints.

**FishOrganism**: Complex organisms with fins (pectoral, ventral, dorsal, caudal), eyes, and optional patterns (stripes, points). Uses same `Body`/`Chain` system.

### Procedural Animation

**Chain (`src/base/Chain.ts`)**: Inverse kinematics chain for creature spines. Uses angle constraints to limit joint rotation. The `resolve()` method propagates position from head to tail.

**Body (`src/base/Body.ts`)**: Draws smooth body shapes around a Chain spine using quadratic curves. Handles body width interpolation and eye rendering.

### Key Dependencies

- **pixi.js**: 2D rendering
- **@dimforge/rapier2d**: Physics (WASM-based)
- **pixi-filters**: Visual effects (blur, bloom)
- **@texel/color**: OKLCH color space conversions
- **simplex-noise**: Procedural noise for movement and deformation
