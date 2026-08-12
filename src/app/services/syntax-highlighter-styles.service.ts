import { Injectable } from '@angular/core';

import {
  FS_SYNTAX_HIGHLIGHTER_STYLE_ID,
  getFsSyntaxHighlighterStyles,
} from '../consts/syntax-highlighter-styles.const';


/**
 * Puts the block's stylesheet into whichever document a block is rendering in.
 *
 * A block is not always in the application's document. AI-authored HTML renders inside a
 * same-origin iframe, and Angular's component styles are injected into the HOST document's head —
 * a guest document never sees them, so a block mounted in one would render unstyled. Rather than
 * make every caller think about that, the component asks for styles in its own `ownerDocument` and
 * this puts them wherever that turns out to be.
 *
 * Injection is id-guarded, so it is safe to call per block. A guest document gets a fresh head on
 * every content reload, which is exactly when the styles need re-injecting anyway.
 */
@Injectable({ providedIn: 'root' })
export class FsSyntaxHighlighterStyles {

  public ensure(doc: Document = document): void {
    if (!doc || doc.getElementById(FS_SYNTAX_HIGHLIGHTER_STYLE_ID)) {
      return;
    }

    const style = doc.createElement('style');

    style.id = FS_SYNTAX_HIGHLIGHTER_STYLE_ID;
    style.textContent = getFsSyntaxHighlighterStyles();

    (doc.head ?? doc.documentElement).appendChild(style);
  }

}
