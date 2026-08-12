import { Injectable } from '@angular/core';

import type { HLJSApi } from 'highlight.js';

import {
  FS_SYNTAX_LANGUAGE_ALIASES,
  FS_SYNTAX_LANGUAGES,
} from '../consts/languages.const';


/** What a highlight produced, and which grammar actually produced it. */
export interface FsSyntaxHighlightResult {
  /** Highlighted markup, or the escaped source when no grammar matched. */
  html: string;
  /** The resolved grammar name, or null when the source was rendered unhighlighted. */
  language: string | null;
}

/**
 * Loads highlight.js and its grammars on demand, and highlights a snippet.
 *
 * Everything is behind a dynamic `import()`, including the core: a document with no code blocks
 * downloads none of this. `highlight.js/lib/core` registers no grammars of its own, so each
 * language arrives as its own lazy chunk the first time a block asks for it, and is registered once.
 *
 * The core resolves through the package's ESM shim (`es/core.js`), which re-exports the CommonJS
 * implementation through a RELATIVE specifier. Angular's CommonJS checker only flags non-relative
 * imports of non-ESM modules, so this needs no `allowedCommonJsDependencies` entry — verified
 * against Angular's own checker rather than assumed.
 */
@Injectable({ providedIn: 'root' })
export class FsSyntaxHighlighterLoader {

  private _hljs: Promise<HLJSApi> | null = null;
  private readonly _languages = new Map<string, Promise<string | null>>();

  /**
   * Highlight `code` as `language`.
   *
   * An unknown or unsupported language is never an error — the source comes back HTML-escaped and
   * unhighlighted, so a block always renders readable text. That is the whole reason the markup
   * convention is `<pre><code class="language-x">`: nothing about this pipeline failing should be
   * able to hide the content.
   */
  public async highlight(code: string, language: string): Promise<FsSyntaxHighlightResult> {
    const resolved = await this._register(this.resolveLanguage(language));

    if (!resolved) {
      return { html: this._escape(code), language: null };
    }

    const hljs = await this._core();

    return {
      html: hljs.highlight(code, { language: resolved, ignoreIllegals: true }).value,
      language: resolved,
    };
  }

  /** The grammar name an author's label maps to, or null when nothing handles it. */
  public resolveLanguage(language: string): string | null {
    const name = (language || '').trim().toLowerCase();
    const resolved = FS_SYNTAX_LANGUAGE_ALIASES[name] ?? name;

    return FS_SYNTAX_LANGUAGES[resolved] ? resolved : null;
  }

  private _core(): Promise<HLJSApi> {
    this._hljs = this._hljs
      ?? import('highlight.js/lib/core').then((module) => module.default);

    return this._hljs;
  }

  /** Register a grammar once, memoising the in-flight promise so concurrent blocks share one load. */
  private _register(language: string | null): Promise<string | null> {
    if (!language) {
      return Promise.resolve(null);
    }

    let pending = this._languages.get(language);

    if (!pending) {
      pending = Promise.all([this._core(), FS_SYNTAX_LANGUAGES[language]()])
        .then(([hljs, grammar]) => {
          hljs.registerLanguage(language, grammar.default);

          return language;
        })
        // A grammar chunk that fails to load degrades to unhighlighted text rather than breaking
        // the document. The failed entry is dropped so a later block can retry.
        .catch(() => {
          this._languages.delete(language);

          return null;
        });

      this._languages.set(language, pending);
    }

    return pending;
  }

  private _escape(code: string): string {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

}
