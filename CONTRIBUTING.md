# Contributing to Vero

First of all, thank you for considering contributing to **Vero** ❤️

We aim to keep Vero lightweight, fast, and elegant.\
To achieve that, we follow a strict architectural philosophy.

Please read this document carefully before opening a Pull Request.\
Pull Requests that violate the principles described here may be requested to
refactor.

---

# Table of Contents

- [Architecture Philosophy](#architecture-philosophy)
- [Core Principles](#core-principles)
- [Configuration](#configuration)
- [Plugins & Extensibility](#plugins--extensibility)
- [Git Workflow](#git-workflow)
- [Versioning](#versioning)
- [Conventional Commits](#conventional-commits)
- [Pull Request Checklist](#pull-request-checklist)

---

# Architecture Philosophy

Vero resolves the paradox between **Simplicity and Power** through modular
architecture.

We prioritize:

- Minimalism
- Runtime independence
- Composability
- Zero unnecessary dependencies

---

# Core Principles

## 1. The Core Law

The **Vero Core must remain minimal, runtime-agnostic, and dependency-free**.

### What belongs in the Core

- Basic rendering engine (visual engine)
- Safe wrapper around native console
- Configuration and plugin loading system
- Fundamental error handling

### What does NOT belong in the Core

- Third-party integrations (Slack, Datadog, Sentry, etc.)
- Additional complex themes (except Default)
- Heavy data formatters (e.g., complex XML or SQL formatters)

---

## The Golden Rule of Dependencies

> The Core MUST NOT include production dependencies (`dependencies`).

If a feature requires installing an external runtime package, it **must be
implemented as a Plugin**.

No exceptions.

---

# Configuration

Vero follows the principle:

> Zero Configuration, Fully Configurable

- Vero works immediately without any configuration file.
- Customization is done through a `vero.config.jsonc` file at the project root.
- We use **JSONC (JSON with Comments)** to allow inline documentation.

## Example

```jsonc
{
  "theme": "dracula",
  "timestamp": false,
  "plugins": [
    "vero-plugin-sentry",
    "vero-plugin-sql-formatter"
  ]
}
```

---

# Plugins & Extensibility

We prefer **composition over expansion of the Core**.

Vero exposes a simple API that allows plugins to manipulate input (logs) before
rendering.

If you want to introduce new functionality:

1. Check if it can be implemented as a Plugin.
2. If yes:
   - Create a separate package (e.g., `@tiagordebarros/vero-plugin-xyz`)
   - Or propose an official plugin under `/plugins`

Core changes are reserved only for structural or architectural improvements.

---

# Git Workflow

We strictly follow naming conventions to maintain organization and enable
automation.

## Branch Naming

Before opening a PR, create a branch describing your change.

Format:

```text
<type>/<short-description>
```

- English only
- kebab-case only

### Allowed types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `chore` — Maintenance / dependencies
- `refactor` — Code refactoring
- `test` — Tests

### Examples

```text
feat/add-json-parser
fix/ansi-color-windows
docs/update-contributing-guide
```

Invalid examples:

```text
minha-nova-feature
feat/add_json_parser
```

---

# Versioning

Vero follows **Semantic Versioning (SemVer)**.

Format:

```
MAJOR.MINOR.PATCH
```

- MAJOR → Breaking API changes
- MINOR → Backward-compatible features
- PATCH → Bug fixes

---

# Conventional Commits

All commits must follow the **Conventional Commits** specification.

Structure:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Basic Examples

```text
feat: add native support for Deno
fix: correct warning alert color
docs: update readme with new flag
chore: update dev dependencies
refactor: improve parser performance
test: add unit tests for logger class
```

## Breaking Change Example

```text
feat(core)!: redesign plugin API architecture

This commit completely overhauls the way plugins are registered.
The previous method `logger.add()` was removed in favor of `logger.use()`.

BREAKING CHANGE: The `add()` method is no longer available.
All plugins must migrate to `use()`.
Closes #123
```

---

# Pull Request Checklist

Before submitting your PR, confirm:

- [ ] My branch follows `<type>/<description>` format
- [ ] My change does not increase Core bundle size unnecessarily
- [ ] I did NOT add production dependencies to the Core
- [ ] The code respects `vero.config.jsonc`
- [ ] Compatibility with native console is preserved
- [ ] Commits follow Conventional Commits

---

> “Perfection is achieved, not when there is nothing more to add,\
> but when there is nothing left to take away.”\
> — Antoine de Saint-Exupéry
