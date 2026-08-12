import { FS_DARK_PLUS_PALETTE, FsSyntaxPalette } from './dark-plus-palette.const';


/** `id` of the injected `<style>`, so injection into a given document is idempotent. */
export const FS_SYNTAX_HIGHLIGHTER_STYLE_ID = 'fs-syntax-highlighter-styles';

/** Root selector every rule is scoped under. See the specificity note in {@link getFsSyntaxHighlighterStyles}. */
const HOST = 'fs-syntax-highlighter';

/**
 * highlight.js emits TIERED scopes.
 *
 * A scope of `title.function_.invoke__` becomes `class="hljs-title function_ invoke__"` — the first
 * piece gets the `hljs-` prefix and each deeper piece is bare with one more trailing underscore
 * (see highlight.js `scopeToCSSClass`). A stylesheet that only knows `.hljs-title` therefore leaves
 * every PHP and TypeScript class and function name in body-text grey, which is exactly what most
 * shipped themes — `vs2015` included — get wrong. Every tier is styled below.
 */
function tokens(palette: FsSyntaxPalette): string {
  return `
${HOST} .hljs-comment,
${HOST} .hljs-quote{color:${palette.comment};font-style:italic;}
${HOST} .hljs-doctag{color:${palette.comment};}

${HOST} .hljs-keyword,
${HOST} .hljs-name,
${HOST} .hljs-selector-tag,
${HOST} .hljs-literal,
${HOST} .hljs-variable.language_,
${HOST} .hljs-meta .hljs-keyword,
${HOST} .hljs-meta.keyword_{color:${palette.keyword};}

${HOST} .hljs-built_in,
${HOST} .hljs-type,
${HOST} .hljs-class,
${HOST} .hljs-title.class_,
${HOST} .hljs-title.class_.inherited__,
${HOST} .hljs-class.title_{color:${palette.type};}

${HOST} .hljs-title,
${HOST} .hljs-title.function_,
${HOST} .hljs-title.function_.invoke__,
${HOST} .hljs-function,
${HOST} .hljs-function.dispatch_,
${HOST} .hljs-section{color:${palette.function};}

${HOST} .hljs-string,
${HOST} .hljs-meta .hljs-string,
${HOST} .hljs-meta.string_,
${HOST} .hljs-code{color:${palette.string};}

${HOST} .hljs-char.escape_,
${HOST} .hljs-subst,
${HOST} .hljs-template-tag,
${HOST} .hljs-template-variable,
${HOST} .hljs-selector-attr,
${HOST} .hljs-selector-pseudo,
${HOST} .hljs-selector-class,
${HOST} .hljs-selector-id{color:${palette.escape};}

${HOST} .hljs-number{color:${palette.number};}
${HOST} .hljs-regexp{color:${palette.regexp};}

${HOST} .hljs-symbol,
${HOST} .hljs-variable.constant_{color:${palette.constant};}

${HOST} .hljs-variable,
${HOST} .hljs-attr,
${HOST} .hljs-attribute,
${HOST} .hljs-property,
${HOST} .hljs-params,
${HOST} .hljs-formula,
${HOST} .hljs-char{color:${palette.identifier};}

${HOST} .hljs-operator,
${HOST} .hljs-punctuation,
${HOST} .hljs-bullet,
${HOST} .hljs-tag{color:${palette.punctuation};}

${HOST} .hljs-meta,
${HOST} .hljs-meta.prompt_{color:${palette.meta};}

${HOST} .hljs-link{color:${palette.type};text-decoration:underline;}
${HOST} .hljs-emphasis{font-style:italic;}
${HOST} .hljs-strong{font-weight:bold;}
${HOST} .hljs-strikethrough{text-decoration:line-through;}

${HOST} .hljs-addition{background-color:rgba(155,185,85,0.2);display:inline-block;width:100%;}
${HOST} .hljs-deletion{background-color:rgba(255,0,0,0.2);display:inline-block;width:100%;}
`;
}

/** The block itself: surface, header bar, copy affordance. */
function chrome(palette: FsSyntaxPalette): string {
  return `
${HOST}{display:block;margin:16px 0;border-radius:6px;overflow:hidden;background:${palette.background};
  font-family:Consolas,'Courier New',ui-monospace,SFMono-Regular,Menlo,Monaco,monospace;}

${HOST} .fs-syntax-highlighter-header{display:flex;align-items:center;justify-content:space-between;
  gap:10px;padding:6px 8px 6px 12px;background:rgba(255,255,255,0.04);
  border-bottom:1px solid rgba(255,255,255,0.07);}

${HOST} .fs-syntax-highlighter-language{font-size:11px;line-height:1;letter-spacing:0.06em;
  text-transform:uppercase;color:rgba(255,255,255,0.45);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}

${HOST} .fs-syntax-highlighter-copy{display:inline-flex;align-items:center;justify-content:center;
  width:26px;height:26px;padding:0;border:0;border-radius:4px;background:transparent;cursor:pointer;
  color:rgba(255,255,255,0.45);transition:background-color .12s ease,color .12s ease;}
${HOST} .fs-syntax-highlighter-copy:hover{background:rgba(255,255,255,0.09);color:rgba(255,255,255,0.85);}
${HOST} .fs-syntax-highlighter-copy svg{width:15px;height:15px;display:block;fill:currentColor;}

${HOST} pre{margin:0;padding:12px 14px;overflow-x:auto;background:transparent;}
${HOST} code{display:block;background:transparent;padding:0;border:0;border-radius:0;
  color:${palette.foreground};font-family:inherit;font-size:13px;line-height:1.55;
  white-space:pre;tab-size:4;}
`;
}

/**
 * The complete stylesheet, as a string, for injection into whichever document the block renders in.
 *
 * It is a string rather than component `styleUrls` because these blocks are mounted into FOREIGN
 * documents — an AI-authored HTML doc renders inside a same-origin iframe, and Angular's emulated
 * component styles are injected into the HOST document's head where that guest never sees them.
 * `FsSyntaxHighlighterStyles` injects this into whatever `ownerDocument` the component lands in, so
 * the same text styles the block in the app and in the frame.
 *
 * Every rule is scoped under the `fs-syntax-highlighter` element. That is not tidiness: a guest
 * document's own `<style>` blocks sit in its `<body>`, i.e. LATER in the cascade than this
 * injection, so an author's bare `pre { … }` would win on equal specificity. Scoping under the
 * element puts these rules ahead.
 */
export function getFsSyntaxHighlighterStyles(
  palette: FsSyntaxPalette = FS_DARK_PLUS_PALETTE,
): string {
  return chrome(palette) + tokens(palette);
}
