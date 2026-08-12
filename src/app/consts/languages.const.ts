import type { LanguageFn } from 'highlight.js';


/**
 * Grammars this package can highlight, each behind its own dynamic import.
 *
 * The set is deliberately curated rather than `highlight.js/lib/common` or the full catalogue.
 * Importing either pulls all 193 grammars into one chunk; a map of dynamic imports lets the bundler
 * emit one lazy chunk per language, so a document containing only PHP downloads only PHP (~14KB).
 *
 * Unlike some highlighters, no grammar here needs a prerequisite registered first — every
 * highlight.js grammar module is self-contained. The one exception is `php-template` (mixed
 * HTML + `<?php`), which needs `xml` and `php` registered on the same instance; it is left out
 * because the plain `php` grammar already understands an opening `<?php` tag on its own.
 *
 * Never write the `.js` extension in these specifiers. The package ships deprecation shims at
 * `lib/languages/<name>.js`, so `'highlight.js/lib/languages/php.js'` resolves to an extra module
 * that prints a deprecation warning at runtime.
 */
export const FS_SYNTAX_LANGUAGES: Record<string, () => Promise<{ default: LanguageFn }>> = {
  bash: () => import('highlight.js/lib/languages/bash'),
  c: () => import('highlight.js/lib/languages/c'),
  cpp: () => import('highlight.js/lib/languages/cpp'),
  csharp: () => import('highlight.js/lib/languages/csharp'),
  css: () => import('highlight.js/lib/languages/css'),
  diff: () => import('highlight.js/lib/languages/diff'),
  go: () => import('highlight.js/lib/languages/go'),
  graphql: () => import('highlight.js/lib/languages/graphql'),
  ini: () => import('highlight.js/lib/languages/ini'),
  java: () => import('highlight.js/lib/languages/java'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  json: () => import('highlight.js/lib/languages/json'),
  kotlin: () => import('highlight.js/lib/languages/kotlin'),
  less: () => import('highlight.js/lib/languages/less'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  php: () => import('highlight.js/lib/languages/php'),
  plaintext: () => import('highlight.js/lib/languages/plaintext'),
  python: () => import('highlight.js/lib/languages/python'),
  ruby: () => import('highlight.js/lib/languages/ruby'),
  rust: () => import('highlight.js/lib/languages/rust'),
  scss: () => import('highlight.js/lib/languages/scss'),
  sql: () => import('highlight.js/lib/languages/sql'),
  swift: () => import('highlight.js/lib/languages/swift'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  xml: () => import('highlight.js/lib/languages/xml'),
  yaml: () => import('highlight.js/lib/languages/yaml'),
};

/**
 * What an author is likely to write, mapped to the grammar that handles it.
 *
 * `html` is the one worth calling out: highlight.js has no `html` grammar — markup of every kind
 * is handled by `xml`.
 */
export const FS_SYNTAX_LANGUAGE_ALIASES: Record<string, string> = {
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
  dockerfile: 'bash',
  golang: 'go',
  html: 'xml',
  js: 'javascript',
  jsx: 'javascript',
  kt: 'kotlin',
  md: 'markdown',
  mjs: 'javascript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  sh: 'bash',
  shell: 'bash',
  svg: 'xml',
  text: 'plaintext',
  ts: 'typescript',
  tsx: 'typescript',
  txt: 'plaintext',
  vue: 'xml',
  yml: 'yaml',
  zsh: 'bash',
};
