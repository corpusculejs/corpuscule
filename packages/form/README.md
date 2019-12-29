> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# `@corpuscule/form`
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/form.svg)](https://www.npmjs.com/package/@corpuscule/form)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/form)](https://bundlephobia.com/result?p=@corpuscule/form)

Lightweight set of decorators for providing solid form experience for web components. Works as a
connector to [🏁 Final Form](https://github.com/final-form/final-form).

## Features
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/form)](https://bundlephobia.com/result?p=@corpuscule/form)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/form)](https://bundlephobia.com/result?p=@corpuscule/form)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save final-form @corpuscule/form
``` 
or
```bash
$ yarn add final-form @corpuscule/form
```

## Documentation
API documentation is available for the following modules:
* [@corpuscule/form](./docs/index.md).

## Examples
### [Simple Form](https://codesandbox.io/s/9j90pjrprw)
Uses the default inputs: `input`, `select`, and `textarea` to build a form with no validation.

### [Synchronous Record-Level Validation](https://codesandbox.io/s/ol86m353kq)
Introduces a whole-record validation function and demonstrates how to use Field component to display
errors next to fields.

### [Synchronous Field-Level Validation](https://codesandbox.io/s/wyx5l5vxlw)
Introduces field-level validation functions and demonstrates how to use Field component to display
errors next to fields.