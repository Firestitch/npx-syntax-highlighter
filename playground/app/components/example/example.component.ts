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

const UNKNOWN = `this language has no grammar registered
so it renders as plain, readable text
which is the point of the fallback`;


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
  public readonly unknown = UNKNOWN;

}
