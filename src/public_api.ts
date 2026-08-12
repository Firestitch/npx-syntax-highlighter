/*
 * Public API Surface of fs-syntax-highlighter
 */

export { FsSyntaxHighlighterComponent } from './app/components/syntax-highlighter/syntax-highlighter.component';

export { FsSyntaxHighlighterLoader } from './app/services/syntax-highlighter-loader.service';
export { FsSyntaxHighlighterStyles } from './app/services/syntax-highlighter-styles.service';

export { FS_DARK_PLUS_PALETTE } from './app/consts/dark-plus-palette.const';
export {
  FS_SYNTAX_HIGHLIGHTER_STYLE_ID,
  getFsSyntaxHighlighterStyles,
} from './app/consts/syntax-highlighter-styles.const';
export {
  FS_SYNTAX_LANGUAGES,
  FS_SYNTAX_LANGUAGE_ALIASES,
} from './app/consts/languages.const';

export { FsSyntaxPalette } from './app/consts/dark-plus-palette.const';
export { FsSyntaxHighlightResult } from './app/services/syntax-highlighter-loader.service';
