> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# `@corpuscule/context`
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/context.svg)](https://www.npmjs.com/package/@corpuscule/context)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/context)](https://bundlephobia.com/result?p=@corpuscule/context)

A lightweight set of decorators for creating DOM-dependent context for web components.

Context is an approach to share some data for all components in a some DOM tree branch. It creates
a local state that is accessible from any component on any nesting level without direct forwarding
properties through the whole chain of children.

It was invented and popularized by [React](https://reactjs.org/docs/context.html).

This package also uses approach to implement context for web components suggested by Justin Fagnani
in [his talk](https://youtu.be/6o5zaKHedTE).

## Features
* **Zero third-party dependencies**. Package still contains Corpuscule dependencies, but no
third-party library is used.
* **Framework agnostic**. You can use package with any Web Components compatible framework/library.
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/context)](https://bundlephobia.com/result?p=@corpuscule/context)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/context)](https://bundlephobia.com/result?p=@corpuscule/context)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save @corupuscule/context
```
or
```bash
$ yarn add @corupuscule/context
```

## Documentation
API documentation is available for the following modules:
* [@corpuscule/context](./docs/context.md).