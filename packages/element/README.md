> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# `@corpuscule/element`
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/element.svg)](https://www.npmjs.com/package/@corpuscule/element)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/element)](https://bundlephobia.com/result?p=@corpuscule/element)

A lightweight set of decorators for creating web components. It is a decorator-based analog for
Polymer's [LitElement](https://github.com/Polymer/lit-element) or a web components based view
rendering library like React or Vue. 

## Features
* **Zero third-party dependencies**. The package still contains Corpuscule dependencies, but no
third-party library is used.
* **Renderer agnostic**. You can use `@corpuscule/element` with any renderer you want: `lit-html`,
`hyperHTML`, `preact` or even `React`. Just choose an existing renderer or create a new one and send
it as a decorator option.
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/element)](https://bundlephobia.com/result?p=@corpuscule/element)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/element)](https://bundlephobia.com/result?p=@corpuscule/element)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save @corpuscule/element
``` 
or
```bash
$ yarn add @corpuscule/element
```

## Documentation
API documentation is available for the following modules:
* [@corpuscule/element](./docs/element.md).

## Future
There are plans to create Babel plugin that will remove `guard`s from the production builds.
Since the source of inspiration for them were PropTypes, workflow should be the same: working during
development, removed in production.

Common future plans for all Corpuscule packages can be found [here](../../README.md#future).