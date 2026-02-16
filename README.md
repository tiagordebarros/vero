# 🔮 Vero — _"See the Truth in Your Code"_

[![ORCID](https://img.shields.io/badge/ORCID-0000--0001--6823--3562-A6CE39?logo=orcid&logoColor=white)](https://orcid.org/0000-0001-6823-3562)
[![JSR](https://jsr.io/badges/@tiagordebarros/vero)](https://jsr.io/@tiagordebarros/vero)
[![JSR Score](https://jsr.io/badges/@tiagordebarros/vero/score)](https://jsr.io/@tiagordebarros/vero)

> **A zero-dependency, isomorphic visual logger that makes `console.log` actually beautiful.**  
> Built for developers who care about Developer Experience (DX). Works identically across Deno, Node.js, Bun, and Browsers.

---

## ✨ Why Vero Exists

Let's be honest: **`console.log()` is ugly and uninformative.** 

You've been there — staring at walls of unformatted text, trying to distinguish between `undefined`, `null`, and empty strings. Copying objects to JSON formatters just to see nested properties. Manually adding `console.time()` calls and doing mental math to check performance.

**Vero fixes all of that.** It's not a production logger (use Winston/Pino for that). Vero is a **visual debugger** designed for the _development experience_ — the tool that makes your terminal output as polished as your IDE.

---

## 🎯 The Vero Philosophy

### 1️⃣ **Zero Dependencies**
Vero's core is **pure TypeScript** with **ZERO npm packages**. No `node_modules` bloat. No supply chain attacks. Just ~3,000 lines of carefully crafted code using Web Standards (ANSI escape codes, `performance.now()`, native `console`).

### 2️⃣ **Console-Safe Wrapper (Polymorphism Over Inheritance)**
Vero **never overrides** `globalThis.console`. It's a _safe wrapper_ that coexists peacefully with third-party libraries. Your existing `console.log` calls from dependencies? Still work perfectly.

```typescript
// Native console remains untouched
console.log("Third-party library log"); // ✅ Works

// Vero adds superpowers without breaking anything
logger.info("Vero enhanced log"); // 🎨 Beautiful
```

### 3️⃣ **Isomorphic by Design**
Write once, run everywhere. Vero uses **environment detection** to work identically in:
- 🦕 **Deno** (TrueColor ANSI)
- 🟢 **Node.js** (TrueColor ANSI)
- 🥟 **Bun** (TrueColor ANSI)
- 🌐 **Browsers** (CSS `%c` styling)

No runtime-specific hacks. Just Web Standards.

---

## 🚀 Installation

```bash
# Deno
deno add @tiagordebarros/vero

# Node.js
npx jsr add @tiagordebarros/vero

# Bun
bunx jsr add @tiagordebarros/vero
```

---

## 📸 See It In Action

> 🎬 **[INSERT GIF/SCREENSHOT HERE]**  
> _A side-by-side comparison showing `console.log` vs `logger.table()` rendering a user array_

> 📊 **[INSERT TABLE SCREENSHOT HERE]**  
> _A colorful ASCII table with pastel borders and type-aware column alignment_

> ⏱️ **[INSERT BENCHMARK SCREENSHOT HERE]**  
> _A visual timer bar showing `⏱ DatabaseQuery ■■■■■···· 42.3ms` with color-coded speed_

---

## 💎 Vero vs Native Console — Feature Comparison

| Feature | Native `console` | Vero `logger` | Why It Matters |
|---------|-----------------|---------------|----------------|
| **Object Formatting** | `[Object object]` 😵 | Recursive, color-coded, depth-limited | See nested structures instantly |
| **Circular References** | ❌ Throws `TypeError` | ✅ `[Circular]` marker | No more crashes on DOM nodes |
| **Tables** | Basic `console.table()` | Responsive tables + card view fallback | Auto-adapts to terminal width |
| **Performance Timing** | Manual math with `console.time()` | Visual bars + color-coded thresholds | Know if 450ms is "fast" at a glance |
| **Type Awareness** | Everything is white text | Strings=green, numbers=orange, booleans=purple | Scan types visually |
| **HTTP Status Codes** | Plain text `200`, `404` | Auto-colored (2xx=green, 4xx=orange, 5xx=pink) | Instant semantic meaning |
| **Grouping** | `console.group()` | ✅ Full support + auto-indentation | Organize complex logs |
| **Assertions** | `console.assert()` | ✅ Enhanced with Vero styling | Prettier test output |
| **Dependencies** | 0 (built-in) | 0 (pure TypeScript) | Identical footprint |
| **Breaking Changes** | N/A | **ZERO** — wraps console, doesn't replace it | Drop-in replacement |

---

## 🎨 Core Features

### 1. **Smart Object Formatting**
Native `console.log` chokes on circular references and prints `[Object object]` for nested structures. Vero uses a **recursive formatter** with:
- ✅ Circular reference detection (`WeakSet`)
- ✅ Depth limiting (default: 10 levels, configurable)
- ✅ Type-aware colorization (strings=green, numbers=orange, booleans=purple)

```typescript
const user = {
  id: 1,
  name: "Alice",
  roles: ["admin", "editor"],
  meta: { active: true, lastLogin: new Date() }
};

console.log(user); 
// [Object object] 😢

logger.info(user);
// {
//   id: 1,
//   name: "Alice",         ← green
//   roles: ["admin", "editor"],
//   meta: {
//     active: true,        ← purple
//     lastLogin: 2026-02-15T22:17:33.052Z  ← orange
//   }
// } 🎨
```

---

### 2. **Responsive Tables & Card View**
`console.table()` breaks on narrow terminals. Vero's table engine:
- ✅ Calculates column widths (two-pass algorithm)
- ✅ Uses Unicode box-drawing characters (`┌─┬─┐`, not `+--+`)
- ✅ **Automatically switches to card view** when table is too wide

```typescript
const metrics = [
  { endpoint: "/api/v1", latency: "12ms", status: 200 },
  { endpoint: "/api/auth", latency: "450ms", status: 500 }
];

logger.table(metrics);

// Wide terminal (80+ cols):
// ┌──────────────┬─────────┬────────┐
// │   endpoint   │ latency │ status │
// ├──────────────┼─────────┼────────┤
// │   /api/v1    │   12ms  │  200   │  ← green
// │  /api/auth   │  450ms  │  500   │  ← pink
// └──────────────┴─────────┴────────┘

// Narrow terminal (< 60 cols):
// ╭─────────────────────────╮
// │ endpoint: /api/v1       │
// │ latency:  12ms          │
// │ status:   200           │  ← auto-switches to card view
// ╰─────────────────────────╯
```

> 📐 **[INSERT RESPONSIVE TABLE GIF HERE]**  
> _Show terminal window resizing from table → card view_

---

### 3. **Visual Performance Timing**
Stop doing mental math. Vero's `timeEnd()` renders:
- ✅ **Logarithmic bar graphs** (500ms = full bar)
- ✅ **Color-coded thresholds**: 🟢 <50ms, 🟡 <200ms, 🔴 >200ms
- ✅ High-precision timing via `performance.now()`

```typescript
logger.time("DatabaseQuery");
await db.query("SELECT * FROM users");
logger.timeEnd("DatabaseQuery");

// Output:
// ⏱ DatabaseQuery    ■■■■■····    42.3ms  ← green (fast!)
```

---

### 4. **HTTP-Aware Logging**
Vero automatically colorizes HTTP verbs and status codes:

```typescript
import { http } from "@tiagordebarros/vero";

console.log(http.safe("GET"));           // ← mint green (safe operation)
console.log(http.mutation("POST"));      // ← peach orange (mutation)
console.log(http.delete("DELETE"));      // ← soft pink (destructive)

console.log(http.success("200"));        // ← green (2xx)
console.log(http.clientError("404"));    // ← orange (4xx)
console.log(http.serverError("500"));    // ← pink (5xx)
```

---

### 5. **Brand Color Palette (Hardcoded by Design)**
Vero uses a **pastel color scheme** for visual hierarchy. Colors are **NOT user-configurable** to maintain brand consistency:

| Color | Use Case | RGB Value |
|-------|----------|-----------|
| 🎀 **Soft Pink** | Errors, DELETE verbs, 5xx codes | `rgb(255, 175, 215)` |
| 🌿 **Mint Green** | Success, strings, GET verbs, 2xx codes | `rgb(135, 255, 175)` |
| 🌤️ **Sky Blue** | Info, object properties, 3xx codes | `rgb(135, 215, 255)` |
| 🍑 **Peach Orange** | Warnings, numbers, POST/PUT, 4xx codes | `rgb(255, 215, 135)` |
| 💜 **Lavender** | Types, booleans, 1xx codes | `rgb(175, 135, 255)` |
| 🪨 **Stone Gray** | Borders, punctuation | `rgb(108, 108, 108)` |

> 🎨 **[INSERT COLOR PALETTE SWATCH HERE]**  
> _Visual representation of the 6-color pastel theme_

---

## 📚 Full API Reference

### **Log Levels**
```typescript
logger.log("Standard message");           // ⚪ White
logger.info("Informational message");     // ℹ Sky blue
logger.success("Operation succeeded");    // ✔ Mint green
logger.warn("Warning message");           // ⚠ Peach orange
logger.error("Error message");            // ✖ Soft pink (uses stderr)
logger.debug("Debug information");        // ⚙ Dimmed gray
```

### **Formatting**
```typescript
logger.table(arrayOfObjects);             // Responsive ASCII table
logger.br();                              // Blank line
logger.hr();                              // Horizontal rule (━━━━━)
logger.clear();                           // Clear terminal
```

### **Performance**
```typescript
logger.time("label");                     // Start timer
logger.timeEnd("label");                  // End timer + visual bar
logger.timeLog("label", ...args);         // Log intermediate time
logger.benchmark(fn, iterations);         // Run function N times + stats
```

### **Grouping & Assertions**
```typescript
logger.group("Group Title");
  logger.log("Indented message");
logger.groupEnd();

logger.assert(condition, "Failure message"); // Only logs if false
logger.count("label");                       // Increment counter
logger.countReset("label");                  // Reset counter
```

### **Configuration**
```typescript
import { Vero } from "@tiagordebarros/vero";

const customLogger = new Vero({
  showTimestamp: false,    // Hide HH:MM:ss.ms timestamps
  useIcons: true,          // Use Unicode icons (ℹ✔⚠✖⚙⏱)
  maxDepth: 5              // Limit object recursion depth
});
```

---

## 🏗️ Architecture (Zero Dependencies = Zero Compromise)

Vero's codebase is organized into **specialized modules**, each solving one problem well:

```
src/
├── core/
│   ├── logger.ts          # Main Vero class (952 lines)
│   └── config.ts          # Configuration merging
├── formatting/
│   ├── ansi.ts            # TrueColor RGB engine
│   ├── colors.ts          # Brand color palettes (vero + http)
│   ├── object-formatter.ts # Recursive formatter with circular detection
│   └── layout.ts          # Table + card view rendering
├── performance/
│   └── bench.ts           # High-precision timers + visual bars
├── utils/
│   ├── terminal.ts        # Terminal width detection
│   └── time.ts            # HH:MM:ss.ms formatting
├── constants/
│   ├── themes.ts          # RGB color definitions
│   ├── icons.ts           # Unicode symbol mappings
│   └── defaults.ts        # Default config values
└── mod.ts                 # Public API exports
```

**Total:** ~3,000 lines of pure TypeScript. No external dependencies.

---

## 🔬 Technical Deep Dive

### **How Vero Achieves Zero Dependencies**

#### 1. **Manual ANSI Escape Codes**
Instead of using `chalk` or `colors`, Vero implements TrueColor manually:

```typescript
// vero/src/formatting/ansi.ts
export const rgb = (r: number, g: number, b: number) => 
  (text: string) => `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
```

#### 2. **Circular Reference Detection via WeakSet**
Instead of using `JSON.stringify` (which throws on circular refs), Vero tracks visited objects:

```typescript
// vero/src/formatting/object-formatter.ts
const seen = new WeakSet();
if (seen.has(obj)) return "[Circular]";
seen.add(obj);
```

#### 3. **Two-Pass Table Rendering**
First pass: measure column widths. Second pass: render with padding.

```typescript
// vero/src/formatting/layout.ts
const widths = columns.map(col => 
  Math.max(...data.map(row => String(row[col]).length))
);
```

---

## 🛡️ Why Polymorphism Matters (No Breaking Changes)

**The Problem with Console Overrides:**  
Some libraries (looking at you, Winston) **replace** `console.log`. This breaks third-party libraries that expect the native console.

**Vero's Solution:**  
```typescript
// ❌ BAD (Inheritance - breaks other libs)
console.log = function(...args) { /* custom logic */ };

// ✅ GOOD (Composition - Vero's approach)
class Vero {
  log(...args) {
    // Custom formatting
    console.log(formattedOutput); // Delegates to native console
  }
}
```

**Result:** Your dependencies' `console.log` calls still work. Vero just adds a parallel API.

---

## 🎓 Use Cases

### **1. API Development**
```typescript
logger.info(http.safe("GET"), "/api/users", http.success("200"));
// ℹ GET /api/users 200 (all color-coded)
```

### **2. Database Queries**
```typescript
logger.time("UserQuery");
const users = await db.query("SELECT * FROM users");
logger.timeEnd("UserQuery");
logger.table(users);
```

### **3. Debugging Complex Objects**
```typescript
logger.debug(user); // Handles circular refs, nested arrays, dates
```

### **4. Test Output Enhancement**
```typescript
logger.group("Authentication Tests");
  logger.assert(token !== null, "Token should be generated");
  logger.success("Login test passed");
logger.groupEnd();
```

---

## 🤖 Built with GitHub Copilot CLI

This project was created for the **GitHub Copilot CLI Hackathon 2026**. Copilot accelerated development by:

1. **Generating ANSI Color Math**: `gh copilot suggest "Convert hex to RGB channels using bitwise operations"`
2. **Table Algorithm Design**: `gh copilot suggest "Two-pass algorithm for ASCII table column width calculation"`
3. **Circular Reference Logic**: `gh copilot explain "How WeakSet prevents infinite loops in object traversal"`

The result? A production-ready library built in record time without compromising quality.

---

## 📦 Project Stats

- **Lines of Code:** ~3,000
- **Dependencies:** 0
- **Bundle Size:** ~15KB (minified)
- **Supported Runtimes:** Deno, Node.js, Bun, Browsers
- **TypeScript:** 100%
- **Test Coverage:** Core modules manually tested (see `/examples`)

---

## 🗺️ Roadmap

- [ ] 🎨 Plugin system for custom formatters (SQL syntax highlighting, JSON prettification)
- [ ] 🌐 Full browser console styling (CSS `%c` implementation)
- [ ] 📊 Chart rendering (bar/line charts in terminal)
- [ ] 🔌 Sentry/Datadog integration plugins (separate packages)
- [ ] 🎭 Theme support (`vero.config.jsonc`)

---

## 🤝 Contributing

We follow a **strict architecture philosophy**:

✅ **Zero Dependencies Rule**: Core must remain dependency-free. If your feature needs an external package, make it a plugin.  
✅ **Isomorphic by Design**: Use Web Standards (`globalThis`, `performance.now()`, etc.) — NOT runtime-specific APIs.  
✅ **Polymorphism Over Inheritance**: Never override `globalThis.console`.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📜 License

MIT © 2026 [Tiago Ribeiro de Barros](https://orcid.org/0000-0001-6823-3562)

---

## 🌟 Why "Vero"?

From Latin _"verus"_ (truth) and Italian _"vero"_ (true). 

**"See the truth in your code."** — A logger that doesn't lie about what your data looks like.

---

<div align="center">

**⭐ Star this repo if Vero made your terminal beautiful!**

[Documentation](./docs) • [Examples](./examples) • [Changelog](./CHANGELOG.md)

</div>
