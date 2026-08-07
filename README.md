<p align="center"><img src="docs/assets/logo.png" width="88" alt="CallioText logo"></p>
<h1 align="center">CallioText</h1>
<p align="center">Structured like LaTeX, editable like Word, output as free as the web.</p>
<p align="center"><a href="README.zh-CN.md">中文版 README</a></p>
<p align="center">
    <a href="https://www.npmjs.com/package/@project-callio/calliotext"><img src="https://img.shields.io/npm/v/%40project-callio%2Fcalliotext" alt="npm version"></a>
    <a href="https://projectcallio.github.io/CallioText/en/"><img src="https://img.shields.io/badge/docs-online-brightgreen" alt="docs"></a>
    <a href="https://projectcallio.github.io/CallioText/demo/"><img src="https://img.shields.io/badge/demo-live-orange" alt="live demo"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="license"></a>
</p>

CallioText is a React library for building structured document editors, based on Slate and MUI.
A document here is a tree with semantics: authors manipulate the semantics, while styling and numbering
are maintained uniformly by rendering rules.

## Why

- Writing serious documents in a Word-like editor means maintaining styling and numbering by hand: insert a theorem in the middle and every number after it must be fixed one by one.
- LaTeX hands structure to the system, but its input is code that grows hard to read and change, and its output targets print, giving up the interactivity of the web.
- General-purpose rich text editors have formatting but no semantics: bold is just bold, the editor does not know "this is a theorem", so automatic numbering and cross references are out of reach.

CallioText models semantics explicitly as concepts: editing happens in a graphical interface, appearance
is decided uniformly by rendering rules, and numbering and references are maintained by the library.

## Features

- **Structure separated from styling**: a document is a tree with semantics, its appearance decided uniformly by rendering rules; restyling never touches the text.
- **Two appearances for one document**: a working interface with buttons and auxiliary information while editing, clean typeset output when reading, each customizable on its own.
- **A two-level concept system**: first-class concepts define parameters and rendering logic in code, second-class concepts can be created at runtime; authors derive new document components without writing code.
- **Automatic numbering and cross references**: theorem numbers, figure numbers and "see Theorem 3" references are maintained by the library and rearrange themselves after edits.
- **Full keyboard operation**: built-in spatial navigation and key hints; hands never leave the keyboard.
- **Replaceable at every layer**: from the ready-made default interface down to how each node kind renders, every layer can be swapped for your own.

## Live demo

[projectcallio.github.io/CallioText/demo](https://projectcallio.github.io/CallioText/demo/)
is a complete editor built with CallioText, running entirely in the browser: the left pane is the
editor, the right pane the typeset output, preloaded with a short mathematical note. No installation
required.

## Documentation

- [Tutorial](https://projectcallio.github.io/CallioText/en/tutorial/01-model.html): seven chapters, from the core ideas to automatic numbering, building a complete structured editor from zero.
- [API docs](https://projectcallio.github.io/CallioText/en/api/overview.html): the public API organized by module, for daily lookup.
- [TypeDoc full reference](https://projectcallio.github.io/CallioText/reference/): generated from source comments, covering every export.

The documentation site starts at
[projectcallio.github.io/CallioText/en](https://projectcallio.github.io/CallioText/en/),
and can also be read locally by serving the repository's `docs/` directory with any static server
(for example `npx serve docs`).

## Installation

```bash
npm install @project-callio/calliotext
```

## Repository layout and development

| Directory | Content |
| --------- | ------- |
| `lib/` | Library source |
| `test/unit/` | Unit tests (vitest) |
| `demo/` | Source of the live demo |
| `docs/` | Documentation site (GitHub Pages deploys from this directory) |

```bash
npm test              # run the unit tests
npm run build         # build the library (dist/)
npm run docs:api      # regenerate the TypeDoc reference (docs/reference/)
npm run webdemo:dev   # run the live demo locally
npm run webdemo:build # build the live demo into docs/demo/
```

Issues and ideas are welcome.

## License

GPL-3.0, see [LICENSE](LICENSE).
