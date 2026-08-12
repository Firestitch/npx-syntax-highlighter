import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { FsClipboard } from '@firestitch/clipboard';

import { from, of, switchMap } from 'rxjs';

import { FsSyntaxHighlighterLoader } from '../../services/syntax-highlighter-loader.service';
import { FsSyntaxHighlighterStyles } from '../../services/syntax-highlighter-styles.service';


/**
 * A read-only, syntax-highlighted code block.
 *
 * Two things about it are unusual, and both come from where it is used. It is mounted not only in
 * the application's own document but into FOREIGN ones — an AI-authored HTML document renders
 * inside a same-origin iframe, and the host mounts one of these over each `<pre><code>` it finds in
 * there.
 *
 * 1. **It carries no `styleUrls`, and encapsulation is `None`.** Angular injects component styles
 *    into the host document's head, which a guest document never reads. Instead the whole
 *    stylesheet is a string that {@link FsSyntaxHighlighterStyles} puts into this element's own
 *    `ownerDocument`, so the block looks the same wherever it lands.
 *
 * 2. **Copying goes through `FsClipboard` directly** rather than `<fs-clipboard-button>`. That
 *    component cannot work in a guest document: its tooltip uses the CDK overlay, whose container
 *    is appended to the HOST body but positioned from a rect measured in the iframe's viewport, so
 *    it lands visibly offset; and its `<mat-icon>` needs the Material Symbols webfont, which only
 *    the host page loads. The service is the part of that standard worth keeping — nothing here
 *    hand-rolls a clipboard write, and `FsClipboard` still raises the usual host-document
 *    "Copied to clipboard" toast, which is visible outside the frame where the reader can see it.
 */
@Component({
  selector: 'fs-syntax-highlighter',
  templateUrl: './syntax-highlighter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  // Same name as the element, purely so the injected stylesheet can out-specify ambient CSS.
  // See the specificity note in syntax-highlighter-styles.const.ts.
  host: { class: 'fs-syntax-highlighter' },
})
export class FsSyntaxHighlighterComponent {

  /** The source, exactly as authored. Never parsed as markup. */
  public readonly code = input.required<string>();

  /** The author's language label (`php`, `ts`, `html`, …). Unknown values render unhighlighted. */
  public readonly language = input<string>('');

  public readonly copyable = input<boolean>(true);

  /** What the header shows. Empty for an unlabelled block, which then shows only the copy button. */
  public readonly label = computed<string>(() => this.language().trim().toLowerCase());

  /**
   * The markup to render, or null while the grammar loads.
   *
   * Null is not an empty state — the template falls back to interpolating the raw source, so the
   * block is readable from the first frame and simply gains colour when the chunk arrives.
   *
   * Declared above `_highlighted` on purpose: `computed` is lazy, so reading a field declared later
   * is safe, and the class ordering standard keeps public members first.
   */
  public readonly html = computed<string | null>(() => this._highlighted()?.html ?? null);

  private readonly _loader = inject(FsSyntaxHighlighterLoader);
  private readonly _styles = inject(FsSyntaxHighlighterStyles);
  private readonly _clipboard = inject(FsClipboard);
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Highlighted markup, or null until the grammar chunk resolves.
   *
   * `toSignal` over the inputs rather than an `effect` writing a signal: highlighting is async
   * (the grammar is a lazy chunk) and `switchMap` also drops a superseded result if the inputs
   * change while a load is in flight.
   */
  private readonly _highlighted = toSignal(
    toObservable(computed(() => ({ code: this.code(), language: this.language() })))
      .pipe(
        switchMap(({ code, language }) => (code
          ? from(this._loader.highlight(code, language))
          : of(null))),
      ),
    { initialValue: null },
  );

  constructor() {
    // The element is already in its final document here: when the host mounts this into an iframe
    // it passes a host element created by that document, so `ownerDocument` is the guest's.
    this._styles.ensure(this._el.nativeElement.ownerDocument);
  }

  public copy(): void {
    this._clipboard.copy(this.code());
  }

}
