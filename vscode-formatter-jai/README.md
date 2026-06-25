# Jai Formatter

A VS Code extension that formats [Jai](https://github.com/Jonathan-Blow/Jai-Community-Library) source code (`.jai`).

It is a token-aware re-indenter: it normalizes indentation based on bracket nesting
without needing a full parser, so it works on any Jai code even as the language evolves.

## Features

- **Re-indents** by `{}`, `()` and `[]` nesting (format document and format selection).
- **`case` blocks**: statements after a `case` label are indented one extra level,
  and a statement written on the same line as the label is moved onto its own line.
- **Operator spacing** — puts single spaces around `:= :: == != <= >= += -= *= /= && || -> << >> = < >`,
  while leaving ambiguous `* + -` (pointers, unary, `---`) and `..` ranges untouched.
- **Aligns declarations** — lines up the colons and value `=` of consecutive declarations.
- **Comma spacing** — one space after a comma, none before commas/semicolons.
- **Collapses blank lines** to a configurable maximum and ensures a final newline.
- **Respects your editor settings** — uses the active tab size and spaces/tabs choice.
- **Strips trailing whitespace** and empties whitespace-only lines.
- **Never corrupts literals** — text inside `"strings"`, `// line comments`,
  nested `/* block /* comments */ */`, and `#string` here-strings is left byte-for-byte
  untouched (here-string content is never re-indented, so the string value is preserved).
- **Idempotent** — formatting an already-formatted file changes nothing.

## Try it

```bash
bun install
bun test        # run the formatter test suite
bun run compile # build to ./out
```

Then press <kbd>F5</kbd> ("Run Extension") to open an Extension Development Host,
open [samples/example.jai](samples/example.jai), and run **Format Document**
(<kbd>⇧⌥F</kbd> / <kbd>Shift+Alt+F</kbd>).

To format on save, add to your settings:

```json
{
  "[jai]": {
    "editor.defaultFormatter": "local.jai-formatter",
    "editor.formatOnSave": true
  }
}
```

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `jai.format.indentCaseContents` | `true` | Indent statements that follow a `case` label inside an `if`/`switch` block. |
| `jai.format.spaceAfterComma` | `true` | One space after a comma, none before commas/semicolons. |
| `jai.format.maxBlankLines` | `1` | Maximum consecutive blank lines to keep (never collapses blanks inside strings/comments). |
| `jai.format.insertFinalNewline` | `true` | Ensure the file ends with exactly one trailing newline. |
| `jai.format.operatorSpacing` | `true` | Put single spaces around operators (leaves `* + -` and `..` alone). |
| `jai.format.splitInlineCaseBodies` | `true` | Move a statement on a `case` label's line onto its own line (whole-document only). |
| `jai.format.alignDeclarations` | `true` | Align colons / value `=` of consecutive declarations (whole-document only). |

> `splitInlineCaseBodies` and `alignDeclarations` add or re-space lines using full-file
> context, so they run for **Format Document** only — **Format Selection** applies the
> per-line passes (indentation, operator/comma spacing) but not these two.

## Install locally

```bash
bun install
bun run compile
bunx @vscode/vsce package   # produces jai-formatter-0.0.1.vsix
```

Then in VS Code: **Extensions → ⋯ → Install from VSIX…**

## Scope & limitations

This is a whitespace formatter, not a full pretty-printer. By design it does **not**:

- touch the ambiguous `*`, `+`, `-` operators (pointers, unary, `---`) or `..` ranges,
- add/remove spaces inside `( )` / `[ ]`,
- wrap long lines or reflow comments,
- modify `#string` here-string contents (they are raw literals).

It also does not provide syntax highlighting — pair it with a Jai TextMate grammar
extension for colors. These are deliberate trade-offs to keep formatting predictable
and non-destructive.

## Project layout

- [src/formatter.ts](src/formatter.ts) — pure, dependency-free formatting logic.
- [src/extension.ts](src/extension.ts) — registers the document/range formatting providers.
- [test/formatter.test.ts](test/formatter.test.ts) — `bun test` suite.
- [language-configuration.json](language-configuration.json) — comments, brackets, auto-closing.
