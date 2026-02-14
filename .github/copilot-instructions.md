# Vero - Visual Debugger

A zero-dependency, isomorphic visual logger for Deno, Node.js, Bun, and
Browsers. Built with TrueColor ANSI support and focused on developer experience.

**Mission**: "See the truth in your code" - A beautiful, simple debugging tool
that wraps the native console without breaking it.

## 🏛️ Core Philosophy - THE LAW

### 1. Zero Dependencies Rule (CRITICAL)

**The Core MUST remain dependency-free.** No `dependencies` in `deno.jsonc` or
`package.json` for production code.

- ✅ Core (`src/`): Pure TypeScript, Web Standards only
- ❌ External libraries in Core: Forbidden
- ✅ External integrations: Create a Plugin instead

**If you need an external package, it MUST be a Plugin.**

### 2. Isomorphism - Web Standards First

Vero runs identically across **Backend** (Deno/Node/Bun) and **Frontend**
(Browsers/Edge).

#### Environment Detection Strategy

- **Browser**: If `globalThis.window` or `globalThis.document` exists → Use CSS
  Styling (`%c`)
- **Server/Terminal**: Otherwise → Use ANSI Escape Codes (`\x1b[`)

#### API Preference Order

| Functionality | ✅ Use (Web Standard)         | ❌ Avoid (Runtime Specific)      |
| ------------- | ----------------------------- | -------------------------------- |
| Global Scope  | `globalThis`                  | `window`, `global`, `self`       |
| Colors/Style  | `VeroStyler` abstraction      | `chalk`, `colors`, external libs |
| Dates         | `Date`, `Intl.DateTimeFormat` | `moment`, `date-fns`             |
| Objects       | `JSON.stringify` (with care)  | `util.inspect` (Node-only)       |
| Timing        | `performance.now()`           | `process.hrtime()`               |

**Never** write directly to streams (`stdout`, `process.stdout.write`). Always
use the global `console` object for maximum compatibility.

### 3. Composition Over Inheritance

Vero is a **safe wrapper** around the native console, not a replacement.

- We **wrap** `console.log`, we don't **override** it
- The native console remains untouched for third-party libraries
- Use delegation pattern via `StyleDriver` interface

## 🎨 Brand Identity

### Visual Concept

**"The Prism of Truth"** - A diamond that refracts white light (confusing logs)
into an organized color spectrum (clear information).

### Official Color Palette

#### Primary Colors (Brand)

- **Amethyst** (Vero Purple): `#8b5cf6` (Tailwind Violet-500) - Main brand color
- **Obsidian** (Terminal Background): `#0f172a` (Tailwind Slate-900)
- **Starlight** (Light Text): `#f8fafc` (Tailwind Slate-50)

#### Functional Colors (Terminal States)

Hardcoded RGB values in `vero` object - **NOT configurable by design**:

```typescript
export const vero = {
  error: rgb(255, 175, 215), // Soft pink (not harsh red)
  success: rgb(135, 255, 175), // Mint green
  info: rgb(135, 215, 255), // Sky blue
  warn: rgb(255, 215, 135), // Peach orange
  type: rgb(175, 135, 255), // Lavender purple
  border: rgb(108, 108, 108), // Stone gray
};
```

### Typography

- **Marketing/Web**: Inter or Geist Sans (clean, modern)
- **Code/Terminal**: JetBrains Mono or Fira Code (with ligatures)

## 🏗️ Architecture Overview

### Core Modules (`src/`)

The library is built around several independent, zero-dependency modules:

#### `ansi.ts` - ANSI Escape Code Engine

- TrueColor (RGB) support with manual bitwise operations for hex → RGB
  conversion
- NO_COLOR environment variable support (`Deno.noColor` /
  `process.env.NO_COLOR`)
- Pastel color palette (`vero.error`, `vero.success`, etc.)
- State-based color toggling

#### `formatter.ts` - Recursive Object Formatter

- Circular reference protection using `WeakSet`
- Depth-limited recursion (default: 10 levels)
- Type-aware colorization (strings = green, numbers = orange, etc.)
- Smart single-line vs multi-line array rendering
- **NEVER use `JSON.stringify` alone** - it throws on circular refs

#### `table.ts` - ASCII Table Renderer

- Two-pass algorithm: measure column widths, then render
- Auto-detects column types for proper alignment
- Uses Unicode box-drawing characters: `┌─┬─┐` style, not `+--+`

#### `bench.ts` - Performance Timer

- High-precision timing with `performance.now()`
- Logarithmic scale for bar rendering (500ms = full bar)
- Color-coded thresholds: green (<50ms), yellow (<200ms), red (>200ms)
- Module-scoped `Map<string, number>` for timer storage

#### `mod.ts` - Main Logger Class

- Default export: `logger` (pre-configured instance)
- Named export: `Vero` class for custom configs
- All methods accept multiple arguments (spread operator)

### Runtime Compatibility

**Deno first**, but maintains full compatibility:

- **Deno**: Uses `Deno.noColor` for color detection
- **Node/Bun**: Uses `process.env.NO_COLOR`
- **Import style**: `import process from "node:process"` (not `"process"`) for
  Deno compatibility

## 📐 Key Conventions

### Timestamp Format

All logs use `HH:MM:ss.ms` format in PT-BR locale:

```typescript
d.toLocaleTimeString("pt-BR", { hour12: false });
```

### Icon-based Levels

When `useIcons: true` (default), log levels use Unicode symbols:

- `info` → `ℹ`
- `success` → `✔`
- `warn` → `⚠`
- `error` → `✖`
- `debug` → `⚙`
- `timeEnd` → `⏱`

### Padding & Alignment

- Log level badges: `level.padEnd(5)`
- Table cells: `colWidth = max + 2`
- Timestamp and badge: `parts.join("  ")` (2 spaces)

### Circular Reference Detection

```typescript
if (opts.seen.has(value)) return "[Circular]";
opts.seen.add(value);
```

### Performance Timer API

```typescript
logger.time("label"); // Stores performance.now()
logger.timeEnd("label"); // Deletes from Map after calculating
```

### Table Rendering Edge Cases

- Empty arrays: `"(Tabela Vazia)"`
- Non-objects: Wraps as `{ value: item }`
- Object values in cells: `"[Obj]"`
- Undefined values: `"-"`

### Error Logging

`logger.error()` uses `console.error()` (not `console.log()`) so CI/CD tools can
detect failures via stderr.

## 🧪 Testing & Quality

### Test Commands

```bash
deno test --allow-net              # Run all tests
deno test --allow-net main_test.ts # Single test file
deno lint                          # Lint
deno fmt                           # Format
deno run --watch main.ts           # Watch mode
```

### Test Stack

- Tests use `@std/assert` from JSR (not npm)
- Test files require `--allow-net` flag for Deno compatibility checks
- `main_test.ts` contains basic sanity checks - core logic manually tested via
  demo files

## 🔧 Configuration System

**Zero Config, but Fully Configurable** - Vero works immediately without any
config file.

Optional customization via `vero.config.jsonc` in project root:

```jsonc
{
  "theme": "dracula", // Visual theme
  "timestamp": false, // Hide timestamps
  "plugins": [
    "vero-plugin-sentry", // External plugins with their own dependencies
    "vero-plugin-sql-formatter"
  ]
}
```

## 🔌 Plugin Architecture

**Prefer Composition.** Vero exposes a simple API for plugins to manipulate
input (logs) before output (rendering).

If adding new functionality:

1. Check if it can be done via Plugin
2. If yes, create separate package (`@tiagordebarros/vero-plugin-xyz`) or
   propose official plugin in `/plugins`

## 📝 Git & Commit Standards

### Branch Naming (Kebab-case)

Format: `<type>/<short-description>`

**Types**: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/`

Examples:

- ✅ `feat/add-json-parser`
- ✅ `fix/ansi-color-windows`
- ❌ `minha-nova-feature` (no type, Portuguese)
- ❌ `feat/add_json_parser` (use kebab-case, not snake_case)

### Commit Messages (Conventional Commits)

**Write in English** for compatibility with automation tools.

Format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Examples:

- `feat: add native support for Deno` (MINOR release)
- `fix: correct warning alert color` (PATCH release)
- `docs: update readme with new flag` (no release)
- `feat(core)!: redesign plugin API` (MAJOR - breaking change)

### Semantic Versioning

- **MAJOR** (1.x.x): Breaking API changes
- **MINOR** (x.2.x): New features, backward-compatible
- **PATCH** (x.x.4): Bug fixes, no new features

## ✅ Pull Request Checklist

Before submitting:

- [ ] Branch follows `type/description` pattern in English?
- [ ] Does my change increase Core bundle size? Is it justified?
- [ ] **CRITICAL**: Did I add new dependencies to Core? (PR will be rejected)
- [ ] Code respects `vero.config.jsonc` settings (if applicable)?
- [ ] Maintains compatibility with native console?
- [ ] Commits follow Conventional Commits standard?

## 🎯 Development Guidelines

### Code Style

- **Language**: Code and documentation in **English**. Portuguese only in
  README/marketing (hackathon requirement).
- **TypeScript**: Strongly typed. Avoid `any`.
- **JSDoc**: All public APIs must have JSDoc comments in English.
- **Constants**: Use constants for magic strings/numbers (like ANSI codes).
- **Composition**: Prefer composition over inheritance.

### StyleDriver Pattern (ANSI vs CSS)

The `VeroLogger.log` method should NOT know how to colorize. Delegate to a
`StyleDriver`:

```typescript
interface StyleDriver {
  color(text: string, color: string): string[];
}

// Terminal Implementation (Returns single string with ANSI)
// log(text) -> ["\x1b[31mtexto\x1b[0m"]

// Browser Implementation (Returns array for console)
// log(text) -> ["%ctexto", "color: red"]
```

### When Contributing

1. Read `CONTRIBUTING.md`, `specs/architecture.md`, and
   `specs/brand-identity.md`
2. Check if your feature belongs in Core or should be a Plugin
3. If modifying Core, ensure zero dependencies
4. Follow brand color palette (Amethyst/Emerald/etc.)
5. Maintain isomorphism (works in Browser + Server)
6. Write tests for new features
7. Update JSDoc comments

## 🚀 Project Context

**Hackathon**: Dev.to + GitHub Copilot CLI Hackathon 2026 **License**: MIT
**Author**: Tiago Ribeiro de Barros (tiago@parceirosdenegocio.com)
**Repository**: github.com/tiagordebarros/vero **Version**: 0.1.0 (Initial
Development/Beta)

---

_"Perfection is achieved not when there is nothing more to add, but when there
is nothing left to take away."_ — Antoine de Saint-Exupéry
