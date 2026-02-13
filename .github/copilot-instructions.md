# Vero - Visual Debugger

A zero-dependency visual logger for Deno, Node.js, and Bun. Built with TrueColor ANSI support and focused on developer experience.

## Build & Test Commands

```bash
# Run tests
deno test --allow-net

# Run single test file
deno test --allow-net main_test.ts

# Lint
deno lint

# Format
deno fmt

# Watch mode for development
deno run --watch main.ts
```

## Architecture Overview

### Core Modules (`src/`)

The library is built around several independent, zero-dependency modules:

- **`ansi.ts`** - ANSI escape code engine with TrueColor (RGB) support
  - Manual bitwise operations for hex → RGB conversion
  - NO_COLOR environment variable support
  - Pastel color palette (`vero.error`, `vero.success`, etc.)

- **`formatter.ts`** - Recursive object formatting with circular reference protection
  - Uses `WeakSet` to detect circular references
  - Depth-limited recursion (default: 10 levels)
  - Type-aware colorization (strings = green, numbers = orange, etc.)
  - Smart single-line vs multi-line array rendering

- **`table.ts`** - ASCII table renderer with Unicode box-drawing characters
  - Two-pass algorithm: measure widths, then render
  - Auto-detects column types for alignment
  - Uses `┌─┬─┐` style borders, not `+--+`

- **`bench.ts`** - Performance timer with visual progress bars
  - Uses `performance.now()` for high-precision timing
  - Logarithmic scale for bar rendering (500ms = full bar)
  - Color-coded: green (<50ms), yellow (<200ms), red (>200ms)

- **`mod.ts`** - Main logger class with configurable instances
  - Default export: `logger` (pre-configured instance)
  - Named export: `Vero` class for custom configs
  - All methods accept multiple arguments (spread operator)

### Runtime Compatibility

The library targets **Deno first**, but maintains compatibility with Node.js and Bun:

- Deno: Uses `Deno.noColor` for color detection
- Node/Bun: Uses `process.env.NO_COLOR`
- Import from `node:process` (not `"process"`) for Deno compatibility

### Color Philosophy

**Pastel palette** is the core aesthetic - hardcoded RGB values in `vero` object:
- Error: `rgb(255, 175, 215)` - soft pink, not harsh red
- Success: `rgb(135, 255, 175)` - mint green
- Info: `rgb(135, 215, 255)` - sky blue
- Warn: `rgb(255, 215, 135)` - peach orange
- Type: `rgb(175, 135, 255)` - lavender purple

These are **not configurable** by design - they define the Vero brand.

## Key Conventions

### Timestamp Format
All logs use `HH:MM:ss.ms` format in PT-BR locale:
```typescript
d.toLocaleTimeString("pt-BR", { hour12: false })
```

### Icon-based Levels
When `useIcons: true` (default), log levels use Unicode symbols instead of text:
- `info` → `ℹ`
- `success` → `✔`
- `warn` → `⚠`
- `error` → `✖`
- `debug` → `⚙`
- `timeEnd` → `⏱`

### Padding & Alignment
- Log level badges are padded to 5 characters: `level.padEnd(5)`
- Table cells add 2 spaces padding: `colWidth = max + 2`
- Timestamp and badge separated by 2 spaces: `parts.join("  ")`

### Circular Reference Detection
`formatter.ts` uses `WeakSet` to track visited objects:
```typescript
if (opts.seen.has(value)) return "[Circular]"
opts.seen.add(value)
```
Never use `JSON.stringify` - it throws on circular refs.

### Performance Timer API
Timers are scoped by string labels:
```typescript
logger.time("label")    // Stores performance.now()
logger.timeEnd("label") // Deletes from Map after calculating
```
Timer storage is a module-scoped `Map<string, number>` in `bench.ts`.

### Table Rendering Edge Cases
- Empty arrays: Returns `"(Tabela Vazia)"`
- Non-objects in array: Wraps as `{ value: item }`
- Object values in cells: Displays `"[Obj]"`
- Undefined values: Displays `"-"`

### Error Logging
`logger.error()` uses `console.error()` instead of `console.log()` so CI/CD tools can detect failures via stderr.

## Testing Notes

- Tests use `@std/assert` from JSR (not npm)
- Test files must have `--allow-net` flag for Deno compatibility checks
- The `main_test.ts` contains basic sanity checks - core logic is manually tested via demo files

## Portuguese Content
README and some comments are in Portuguese (hackathon submission requirement). Code identifiers and types are in English.
