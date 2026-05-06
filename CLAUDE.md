# CLAUDE.md

Instructions for Claude Code when working in this project.

## Project Overview

Vanilla HTML/CSS/JS portfolio site. No framework, no bundler, no package.json.

- `sections/` — individual HTML partials (one per page section)
- `build.js` — assembles `sections/*.html` into `index.html` via Node.js `fs`
- `styles.css` — all styles in one file
- `main.js` — runtime JS (scroll animations, Discord status, theme toggle)
- `bg-animation.js` — canvas background animation

**Never edit `index.html` directly.** Edit the relevant file in `sections/`, then run `node build.js` to regenerate it.

---

## Brace Style (Stroustrup)

`else` / `catch` / `finally` go on their own line after `}`.

```js
// correct
if (condition) {
  doSomething();
}
else {
  doOther();
}

try {
  riskyOp();
}
catch (e) {
  handle(e);
}
```

Always use braces, always expand to multiple lines — no braceless or single-line blocks.

```js
// correct
if (!value) {
  return "";
}

for (const item of list) {
  process(item);
}

// wrong
if (!value) return "";
for (const item of list) process(item);
```

---

## Comment Style

Add a comment above every significant function and every non-obvious logical flow.

- Use JSDoc (`/** */`) for exported functions and at the top of every custom file
- Use `//` for everything else
- The last line of a comment never ends with a period — a period only separates sentences within a multi-sentence comment
- No all-caps emphasis words (MUST, IMPORTANT, etc.)
- Keep comments to one to three lines
- Skip the comment if the logic is self-evident — name the intent instead

Every custom file should begin with a JSDoc comment explaining its purpose:

```js
/**
 * Handles scroll-driven fade animations and the Discord live status card.
 * Runs after DOMContentLoaded
 */
```

---

## Public-Facing Text

- Never use em dashes (`—`) in headings, body text, labels, or any user-visible copy. Use a comma, period, or rewrite the sentence
- Never use `{" "}` to inject spaces in JSX (if this project ever gains a framework)

---

## Tailwind v4 (for future projects)

Several class names changed from v3. Always use v4 names:

| Deprecated (v3) | Current (v4) |
|---|---|
| `bg-gradient-to-{dir}` | `bg-linear-to-{dir}` |
| `flex-shrink-0` / `flex-shrink` | `shrink-0` / `shrink` |
| `flex-grow-0` / `flex-grow` | `grow-0` / `grow` |
| `overflow-ellipsis` | `text-ellipsis` |
| `bg-opacity-{n}` | `bg-{color}/{n}` |
| `text-opacity-{n}` | `text-{color}/{n}` |
