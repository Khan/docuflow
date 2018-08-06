# docuflow

The goal of this project it to produce a tool for generating documentation for 
npm packages based on flow types and markdown.  Although it supports documenting
React components, it also handles documenting classes and functions and will
eventually document anything that can be exported by an ES6 module.

Documentation is generated based on what a package exports which means you don't 
have to worry about excluding tests or files that internal to the module.

`docuflow` processes the entry file to package, determines which identifiers are
exported and then traverses imports to fine the declarations within the project
that correspond to those identifiers.

It will also find types which an export depend on, even if they appear in different
files.

`docuflow` can process multiple packages to create documentation for monorepos 
containing multiple packages.

## Quick start

- git submodule update --init --recursive
- yarn
- node gen-data.js
- yarn start

## Requirements

- all modules must be ES6 modules and use `import`/`export` statements exclusively
  (no `require` or `module.exporst`)
- use `flow` for annotating types directly in the code, `flow` (or `jsdoc`) aren't
  supported

## Roadmap

- expand/collpase types that are spread into exact object types
- include a section for types that explicitly exported by a package
- handle packages that export objects
- reduce size of .json blob
- render Markdown from .md files that might appear in the project being documented
- render code snippets that might appear in .md files
- support documenting multiple versions of the same component
- split .json blob to be per package
- code splitting
