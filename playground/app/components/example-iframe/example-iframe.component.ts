import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  afterNextRender,
  createComponent,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { FsSyntaxHighlighterComponent } from '../../../../src/app/components/syntax-highlighter/syntax-highlighter.component';


/**
 * The cross-document case, which is what this package exists for.
 *
 * A same-origin sandboxed iframe holds plain `<pre><code class="language-*">` markup — the shape an
 * AI-authored HTML document arrives in — and this mounts a real Angular component over each block
 * INSIDE that frame's own document.
 *
 * It is also the standing proof of the two things that make the technique work at all, both of
 * which are easy to assume and expensive to be wrong about:
 *
 *   1. A component created by the host and appended into a guest document keeps working. The DOM
 *      "adopt" step re-parents the node without touching its listener list, so `(click)` still
 *      fires and change detection still runs.
 *   2. `FsClipboard.copy()` still succeeds when the click that triggered it happened inside the
 *      frame — transient user activation and document focus have to cross the boundary.
 *
 * If either ever regresses, this example breaks visibly rather than silently.
 */
@Component({
  selector: 'example-iframe',
  templateUrl: './example-iframe.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ExampleIframeComponent {

  public readonly mounted = signal<number>(0);

  private readonly _frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private readonly _appRef = inject(ApplicationRef);
  private readonly _environmentInjector = inject(EnvironmentInjector);
  private readonly _refs: ComponentRef<FsSyntaxHighlighterComponent>[] = [];

  /**
   * Assigned to the element rather than bound in the template.
   *
   * `iframe[srcdoc]` is a sanitized binding (SecurityContext.HTML), and Angular's sanitizer strips
   * `<style>` — which would quietly delete the hostile CSS this example exists to defeat. The real
   * `fs-iframe` sets the property directly for the same reason.
   */
  private readonly _srcdoc = `
    <style>
      body { font-family: Roboto, sans-serif; margin: 16px; color: #222; }
      /* Deliberately hostile: a bare rule the injected stylesheet has to out-specify. */
      pre { background: #ffe; border: 2px dashed #c00; padding: 20px; }
    </style>
    <h3>A document this app does not control</h3>
    <p>The block below arrives as plain markup and is replaced after load.</p>
    <pre><code class="language-php">public function save(DocModel $doc): DocModel
{
    return $doc-&gt;save();
}</code></pre>
    <p>Text after the block, so anchor offsets can be eyeballed.</p>
  `;

  constructor() {
    inject(DestroyRef).onDestroy(() => this._destroy());

    afterNextRender(() => {
      this._frame().nativeElement.srcdoc = this._srcdoc;
    });
  }

  public onLoad(): void {
    const guest = this._frame().nativeElement.contentDocument;

    if (!guest?.body) {
      return;
    }

    this._destroy();

    guest.body.querySelectorAll<HTMLElement>('pre > code').forEach((code) => {
      this._mount(code.parentElement as HTMLElement, code);
    });

    this.mounted.set(this._refs.length);
  }

  private _mount(pre: HTMLElement, code: HTMLElement): void {
    const guest = pre.ownerDocument;
    const language = (/language-([\w+#-]+)/.exec(code.className) ?? [])[1] ?? '';

    // Created BY the guest document, so the host element is native to the tree the guest's own
    // CSS and querySelector run against. Only the view Angular renders inside it is adopted across.
    const host = guest.createElement('fs-syntax-highlighter');

    pre.replaceWith(host);

    const ref = createComponent(FsSyntaxHighlighterComponent, {
      environmentInjector: this._environmentInjector,
      hostElement: host,
    });

    ref.setInput('code', code.textContent ?? '');
    ref.setInput('language', language);

    this._appRef.attachView(ref.hostView);
    this._refs.push(ref);
  }

  private _destroy(): void {
    for (const ref of this._refs) {
      ref.destroy();
    }

    this._refs.length = 0;
  }

}
