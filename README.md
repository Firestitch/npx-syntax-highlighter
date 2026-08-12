# @firestitch/syntax-highlighter

Read-only, syntax-highlighted code blocks — including ones mounted inside a **foreign document**,
such as the same-origin iframe that renders AI-authored HTML.

```html
<fs-syntax-highlighter [code]="source" [language]="'php'"></fs-syntax-highlighter>
```

| Input | Type | Default | |
|---|---|---|---|
| `code` | `string` | — | required. The source, exactly as authored. Never parsed as markup. |
| `language` | `string` | `''` | The author's label (`php`, `ts`, `html`, …). Unknown values render unhighlighted. |
| `copyable` | `boolean` | `true` | Show the copy button. |

## What is unusual about it

**It has no `styleUrls`.** Angular injects component styles into the host document's head, which a
guest document never reads — a block mounted inside an iframe would render unstyled. Instead the
whole stylesheet is a string (`getFsSyntaxHighlighterStyles`) that `FsSyntaxHighlighterStyles`
injects into the element's own `ownerDocument`. The component does this for itself, so callers
mounting it across documents need do nothing.

**Every rule is scoped under the `fs-syntax-highlighter` element.** A guest document's own
`<style>` blocks sit in its `<body>`, i.e. later in the cascade than the injected sheet, so an
author's bare `pre { … }` would otherwise win on equal specificity.

**Copying goes through `FsClipboard` directly** rather than `<fs-clipboard-button>`, which cannot
work in a guest document — its tooltip uses the CDK overlay (container on the host `body`,
positioned from an iframe-relative rect) and its `<mat-icon>` needs a webfont only the host page
loads. The clipboard write itself is not hand-rolled, and the "Copied to clipboard" toast still
appears on the host page where the reader can see it.

## Loading

Everything is behind a dynamic `import()`, including highlight.js itself, so a page with no code
blocks downloads none of it. `highlight.js/lib/core` registers no grammars, so each language is its
own lazy chunk — a document containing only PHP pulls only the PHP grammar (~14KB).

Add a language by adding one entry to `FS_SYNTAX_LANGUAGES`; add a spelling of an existing one via
`FS_SYNTAX_LANGUAGE_ALIASES`.

## Theme

VS Code **Dark+**, defined once as `FS_DARK_PLUS_PALETTE` and shared with
`@firestitch/markdown-editor`, which renders the same palette through CodeMirror for *editable*
fenced code. One palette, so a snippet does not change colour depending on which surface shows it.

Two notes on fidelity:

- highlight.js emits **tiered** scopes (`hljs-title function_ invoke__`). Most shipped themes —
  `vs2015` included — style only `.hljs-title`, leaving PHP and TypeScript class and function names
  in body-text grey. Every tier is styled here.
- highlight.js has no control-keyword scope, so Dark+'s magenta `if` / `return` / `foreach` render
  as ordinary keyword blue. The CodeMirror side, whose Lezer tags do separate them, shows the
  magenta.

## Development

```
npm install
npm run serve      # playground on :8000
npm run package    # build into package/
```

The playground's **"Mounted into an iframe"** example is the standing proof of the cross-document
technique: it mounts blocks into a sandboxed frame's own document over deliberately hostile CSS,
and exercises the copy button from inside the frame. If adoption, change detection, or the
clipboard's transient-activation crossing ever regresses, that example breaks visibly.
