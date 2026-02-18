![Vero Cover](assets/images/vero-cover.gif)

<div align="center">

# Vero — _See the Truth in Your Code_

</div>

<div align="center">

<!-- 🔮 Project Identity -->

<!-- <img src="https://img.shields.io/badge/Vero-Visual%20Logger-8b5cf6?style=for-the-badge&logo=gem&logoColor=white" alt="Vero - Visual Logger" /> -->
<img src="https://img.shields.io/badge/Vero-Visual%20Logger-8b5cf6?logo=gem&logoColor=white" alt="Vero - Visual Logger" />
<img src="https://img.shields.io/badge/Author-Tiago%20Ribeiro%20de%20Barros-0A66C2?logo=github&logoColor=white" alt="Author" />

<!-- 📦 JSR (Primary Distribution Platform) -->

<a href="https://jsr.io/@tiagordebarros/vero">
<img src="https://jsr.io/badges/%40tiagordebarros/vero" alt="JSR Version" />
</a>

<a href="https://jsr.io/@tiagordebarros/vero">
<img src="https://jsr.io/badges/%40tiagordebarros/vero/score" alt="JSR Score" />
</a>

<!-- 🚦 CI / Build Health -->

<!-- <a href="https://github.com/tiagordebarros/vero/actions">
<img src="https://github.com/tiagordebarros/vero/actions/workflows/ci.yml/badge.svg" alt="Build Status" />
</a> -->

<!-- 📜 License -->

<a href="https://github.com/tiagordebarros/vero/blob/main/LICENSE">
<img src="https://img.shields.io/github/license/tiagordebarros/vero?logo=open-source-initiative&logoColor=white" alt="MIT License" />
</a>

<!-- 🌍 Open Source Status -->

<img src="https://img.shields.io/badge/Open%20Source-Yes-3DA639?logo=open-source-initiative&logoColor=white" alt="Open Source" />

<!-- 💰 GitHub Sponsors -->

<a href="https://github.com/sponsors/tiagordebarros">
<img src="https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-EA4AAA?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors" />
</a>

<!-- 🛡 Core Philosophy -->

<img src="https://img.shields.io/badge/Dependencies-0-success?logo=dependabot&logoColor=white" alt="Zero Dependencies" />
<img src="https://img.shields.io/badge/Web%20Standards-First-2563eb?logo=html5&logoColor=white" alt="Web Standards First" />

<!-- 🧠 Runtime Support -->

<img src="https://img.shields.io/badge/Runtime-Deno%20%7C%20Node%20%7C%20Bun%20%7C%20Browser-6366f1?logo=javascript&logoColor=white" alt="Runtime Support" />

<!-- 🟦 Language -->

<img src="https://img.shields.io/badge/Written%20in-TypeScript-3178C6?logo=typescript&logoColor=white" alt="Written in TypeScript" />

<!-- 📏 Code Standards -->

<a href="https://www.conventionalcommits.org/">
<img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits" />
</a>

<a href="https://github.com/tiagordebarros/vero/blob/main/deno.jsonc">
<img src="https://img.shields.io/badge/Code%20Style-Standard-brightgreen?logo=eslint&logoColor=white" alt="Standard Code Style" />
</a>

<!-- 🎓 Academic Identity -->

<a href="https://orcid.org/0000-0001-6823-3562">
<img src="https://img.shields.io/badge/ORCID-0000--0001--6823--3562-A6CE39?logo=orcid&logoColor=white" alt="ORCID" />
</a>

</div>

---

> **A zero-dependency, isomorphic visual logger that makes `console.log`
> actually beautiful.**\
> Built for developers who care deeply about Developer Experience (DX).

---

## 🎥 Video Demo

<div align="center">

[![Watch the demo](https://img.youtube.com/vi/r9H7T-_UTZI/maxresdefault.jpg)](https://www.youtube.com/watch?v=r9H7T-_UTZI)

</div>

---

## ⚡ Why Vero Exists

Let’s be honest.

`console.log()` is functional — but not expressive.

- Walls of unformatted objects
- `[Object object]` noise
- No circular reference handling
- Manual performance timing
- Tables that collapse in narrow terminals

**Vero fixes that — without breaking the console.**

It is **not** a production logger.\
Use Pino or Winston for structured production logging.

Vero is a **visual debugger for development**.

---

## 🎯 Core Principles

- 🛡 **Zero Dependencies**
- 🌐 **Isomorphic by Design**
- 🔌 **Does NOT override `globalThis.console`**
- 🎨 **Type-aware color formatting**
- 📐 **Responsive ASCII tables**
- ⏱ **Visual performance timers**
- 🧠 **Runtime-agnostic (Web Standards only)**

---

## 🚀 Installation

```bash
# Deno
deno add @tiagordebarros/vero
```

```bash
# Node
npx jsr add @tiagordebarros/vero
```

```bash
# Bun
bunx jsr add @tiagordebarros/vero
```

---

## 🧪 Quick Start

```ts
import { logger } from "@tiagordebarros/vero";

logger.info("Hello world");
logger.success("It works!");
```

---

## 🎨 Smart Object Formatting

```ts
const user = {
  id: 1,
  name: "Alice",
  roles: ["admin", "editor"],
  meta: { active: true },
};

logger.info(user);
```

<div align="center">
  <img src="assets/images/smart-object-formatting.png" width="700" />
</div>

✔ Circular-safe\
✔ Depth-limited\
✔ Type-aware coloring\
✔ Clean nested visualization

---

## 📐 Responsive Tables

```ts
logger.table([
  { endpoint: "/api/v1", latency: "12ms", status: 200 },
  { endpoint: "/api/auth", latency: "450ms", status: 500 },
]);
```

<div align="center">
  <img src="assets/images/large-table-responsive.png" width="48%" />
  <img src="assets/images/large-table-responsive-card.png" width="48%" />
</div>

- Two-pass column width calculation
- Unicode box drawing
- Auto card-view fallback on narrow terminals
- Layout adapts to terminal width

---

## ⏱ Visual Performance Timing

```ts
logger.time("DatabaseQuery");
await db.query("SELECT * FROM users");
logger.timeEnd("DatabaseQuery");
```

Example output:

```
⏱ DatabaseQuery    ■■■■■····    42.3ms
```

Color-coded thresholds:

- 🟢 < 50ms
- 🟡 < 200ms
- 🔴 > 200ms

<div align="center">
  <img src="assets/images/visual-performance-timing-desktop.png" width="48%" />
  <img src="assets/images/visual-performance-timing-mobile.png" width="48%" />
</div>

---

## 🌐 Runtime Support

Vero works identically across:

- 🦕 Deno
- 🟢 Node.js
- 🥟 Bun
- 🌐 Browsers

No runtime hacks.\
No conditional builds.\
Only Web Standards.

---

## 🏗 Architecture

The project follows a layered architecture:

- `constants/` → visual & theme primitives
- `core/` → logger engine & configuration
- `formatting/` → ANSI, layout & object formatting
- `performance/` → benchmarking & timing utilities
- `utils/` → environment & terminal helpers
- `types/` → public type definitions
- `mod.ts` → public entrypoint

For full technical details, see:

➡ **ARCHITECTURE.md**

---

## 📚 Documentation

- CONTRIBUTING.md
- SECURITY.md
- SUPPORT.md
- ARCHITECTURE.md

---

## 🛡 Stability Guarantees

Vero guarantees:

- No console override
- No runtime coupling
- No external dependencies
- Stable public API
- Deterministic formatting behavior

---

## 🗺 Roadmap

- [ ] Plugin system
- [ ] Theme system
- [ ] Extended browser styling
- [ ] Terminal charts
- [ ] Implement OSC 8
- [ ] Coverage automation

---

## 🤝 Contributing

Before submitting a PR, read **CONTRIBUTING.md**.

Architectural rules are strict:

- Zero Dependencies
- Isomorphic only
- No console override
- No runtime-specific branches

This is intentional.

---

## 💖 Support

If Vero improves your DX, consider sponsoring development.

See **FUNDING.yml** for available options.

---

## 📜 License

MIT © 2026\
Tiago Ribeiro de Barros\
ORCID: https://orcid.org/0000-0001-6823-3562

See **LICENSE** for more details.

---

## 🌟 Why “Vero”?

From Latin _verus_ — truth.

**See the truth in your code.**

---

<div align="center">

⭐ Star this repository if Vero made your terminal beautiful.

</div>
