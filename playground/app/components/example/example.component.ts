import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FsSyntaxHighlighterComponent } from '../../../../src/app/components/syntax-highlighter/syntax-highlighter.component';


const PHP = `<?php

namespace Lib\\Doc\\Handler;

class DocHandler extends BaseHandler
{
    private const MAX_VERSIONS = 50;

    public function save(DocModel $doc): DocModel
    {
        if (!$doc->getId()) {
            throw new ValidationException('Doc must be persisted first');
        }

        // Coalesce rapid edits into one version.
        foreach ($this->versions($doc) as $version) {
            $version->prune(self::MAX_VERSIONS);
        }

        return $doc->save();
    }
}`;

const TYPESCRIPT = `import { computed, inject, signal } from '@angular/core';

export class DocViewer {

  public readonly doc = signal<Doc | null>(null);
  public readonly title = computed(() => this.doc()?.name ?? 'Untitled');

  private readonly _data = inject(DocData);

  public load(id: number): void {
    this._data.get(id).subscribe((doc) => this.doc.set(doc));
  }
}`;

const SQL = `SELECT d.id, d.name, COUNT(v.id) AS versions
FROM docs d
LEFT JOIN object_versions v ON v.object_id = d.id
WHERE d.state = 'active'
GROUP BY d.id
ORDER BY versions DESC
LIMIT 25;`;

const SCSS = `@use 'sass:color';

$surface: #1e1e1e;
$accent: #4ec9b0;
$radius: 6px;

@mixin scrollable($max) {
  max-height: $max;
  overflow: auto;
}

.fs-syntax-highlighter {
  @include scrollable(480px);

  background: $surface;
  border-radius: $radius;

  .copy {
    color: color.adjust($accent, $lightness: -10%);

    &:hover {
      color: $accent;
    }
  }
}`;


@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FsSyntaxHighlighterComponent,
  ],
})
export class ExampleComponent {

  public readonly php = PHP;
  public readonly typescript = TYPESCRIPT;
  public readonly sql = SQL;
  public readonly scss = SCSS;

}
