/**
 * VS Code Dark+ colours, which is what most people reading code here see all day in their editor.
 *
 * The palette matters more than it looks like it should. Most highlighters' defaults map plain
 * identifiers and property names to a hot colour — and grammars tag most identifiers as one of
 * those, so a block of PHP or TypeScript comes out overwhelmingly red, with class names, argument
 * labels and property access all shouting at the same volume. Dark+ keeps plain identifiers a calm
 * blue and spends colour on the things a parser can actually be sure about: keywords, strings,
 * comments, numbers, and definitions.
 *
 * This lives here rather than beside any one engine because two engines render from it: the
 * highlight.js stylesheet in this package (read-only code blocks) and the CodeMirror
 * `HighlightStyle` in `@firestitch/markdown-editor` (editable fenced code). One palette, so a
 * snippet cannot change colour depending on which surface is showing it.
 *
 * What cannot be reproduced by either: an editor colours class names differently from variables
 * because a language server told it which is which. A grammar has no such knowledge, so anything
 * it can only call "an identifier" lands on {@link FsSyntaxPalette.identifier}.
 */
export interface FsSyntaxPalette {
  background: string;
  foreground: string;
  comment: string;
  string: string;
  escape: string;
  number: string;
  literal: string;
  keyword: string;
  /**
   * Dark+ gives control flow (`if`, `return`, `foreach`) its own magenta.
   *
   * Only engines whose grammars separate control keywords from declaration keywords can use it —
   * CodeMirror's Lezer tags do, highlight.js's flat `hljs-keyword` scope does not.
   */
  controlKeyword: string;
  type: string;
  function: string;
  identifier: string;
  constant: string;
  punctuation: string;
  regexp: string;
  meta: string;
  invalid: string;
}

export const FS_DARK_PLUS_PALETTE: FsSyntaxPalette = {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  comment: '#6a9955',
  string: '#ce9178',
  escape: '#d7ba7d',
  number: '#b5cea8',
  literal: '#569cd6',
  keyword: '#569cd6',
  controlKeyword: '#c586c0',
  type: '#4ec9b0',
  function: '#dcdcaa',
  identifier: '#9cdcfe',
  constant: '#4fc1ff',
  punctuation: '#d4d4d4',
  regexp: '#d16969',
  meta: '#808080',
  invalid: '#f44747',
};
