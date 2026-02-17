# Architecture

Vero is built around three non-negotiable principles:

> Zero Dependencies.\
> Isomorphic by Design.\
> Polymorphism over Inheritance.

This document reflects the current published structure of the project.

---

# High-Level Overview

Vero is organized as a modular, layered architecture where each directory has a
single responsibility.

```
src/
├── mod.ts
├── types/
│   └── index.ts
├── core/
│   ├── logger.ts
│   └── config.ts
├── formatting/
│   ├── ansi.ts
│   ├── colors.ts
│   ├── layout.ts
│   └── object-formatter.ts
├── performance/
│   └── bench.ts
├── constants/
│   ├── box-chars.ts
│   ├── defaults.ts
│   ├── icons.ts
│   └── themes.ts
└── utils/
    ├── env.ts
    ├── terminal.ts
    ├── text.ts
    └── time.ts
```

---

# Module Responsibilities

## `mod.ts`

Public entry point.

- Exports the `Vero` class
- Exports the default `logger` instance
- Exposes public types

This file defines the public API surface.

---

## `types/`

Centralized TypeScript type definitions.

- Logger configuration types
- Runtime environment types
- Internal formatting contracts

Separating types improves clarity and API maintainability.

---

## `core/`

### `logger.ts`

The heart of Vero.

Responsibilities:

- Public logging methods (`log`, `info`, `warn`, `error`, etc.)
- Grouping
- Assertions
- Counters
- Delegation to formatting + layout layers
- Delegation to native `console`

It NEVER overrides `globalThis.console`.

### `config.ts`

Handles:

- Default configuration merging
- User configuration normalization
- Runtime-safe option handling

---

## `formatting/`

Responsible for transforming raw input into styled output.

### `ansi.ts`

Manual TrueColor implementation using ANSI escape codes.

No external color libraries.

### `colors.ts`

Maps semantic meaning to color palettes.

Separates theme semantics from ANSI engine.

### `layout.ts`

Handles:

- Table rendering
- Card view fallback
- Column width calculation (two-pass algorithm)
- Border drawing using Unicode box characters

### `object-formatter.ts`

Recursive object traversal with:

- WeakSet circular detection
- Depth limiting
- Type-aware formatting
- Array formatting
- Date detection

---

## `performance/`

### `bench.ts`

Implements:

- `time`
- `timeEnd`
- `timeLog`
- `benchmark`

Uses:

- `performance.now()` (high precision)
- Logarithmic scaling for visual bars
- Threshold-based color semantics

---

## `constants/`

Pure data layer.

No logic.

### `box-chars.ts`

Unicode box-drawing characters.

### `defaults.ts`

Default configuration values.

### `icons.ts`

Unicode symbol mapping.

### `themes.ts`

RGB theme definitions.

Brand colors live here.

---

## `utils/`

Cross-cutting utilities.

### `env.ts`

Runtime detection:

- Deno
- Node
- Bun
- Browser

Ensures isomorphic compatibility.

### `terminal.ts`

Detects terminal width.

Used by layout engine to switch between table and card mode.

### `text.ts`

Text manipulation helpers:

- Padding
- Alignment
- Truncation

### `time.ts`

HH:mm:ss.ms formatting utilities.

---

# Rendering Pipeline

1. User calls `logger.method(...)`
2. `core/logger.ts` receives arguments
3. Arguments pass to:
   - `object-formatter` (if object)
   - `layout` (if table)
   - primitive formatter
4. Semantic color applied via `colors.ts`
5. ANSI engine (`ansi.ts`) renders color
6. Output sent to native `console`

The console remains untouched.

---

# Dependency Graph

The architecture follows a strict dependency direction:

```
constants
   ↑
utils
   ↑
formatting
   ↑
performance
   ↑
core
   ↑
mod.ts (public API)
```

Rules:

- Lower layers never depend on upper layers.
- `constants` has zero imports.
- `core` orchestrates — it does not implement formatting logic.
- Public API surface is intentionally small.

---

# Isomorphic Strategy

Vero avoids runtime-specific APIs.

Allowed:

- `globalThis`
- `performance.now()`
- Native `console`
- ANSI escape codes
- `%c` styling for browsers

Not allowed:

- `process.stdout` assumptions
- Node-specific APIs
- Deno-only APIs
- Bun-only APIs

---

# Performance Characteristics

- O(n) object traversal
- O(n × m) table width calculation (two-pass)
- WeakSet ensures no infinite recursion
- No JSON.stringify for traversal

All algorithms are intentionally simple and predictable.

---

# Stability Guarantees

Vero guarantees:

- No console override
- No runtime coupling
- No external dependencies
- Backwards compatibility for minor releases

Breaking changes require major version increments.

---

# Future Evolution

Planned improvements:

- Plugin system
- Theme abstraction layer
- Extended browser styling engine
- Optional formatter extensions (outside core)

Core philosophy will not change.

---

Vero favors architectural integrity over convenience.
