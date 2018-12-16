# Corpuscule

[![Build Status](https://img.shields.io/travis/corpusculejs/corpuscule/master.svg)](https://travis-ci.org/corpusculejs/corpuscule)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Test Coverage](https://img.shields.io/codecov/c/github/corpusculejs/corpuscule/master.svg)](https://codecov.io/gh/corpusculejs/corpuscule)

Corpuscule is a library set built on top of WebComponents standard. It provides all necessary tools
to built whole application from scratch including redux connector, router and form utils.

Corpuscule is based on following concepts:

* **Be universal**. You can use almost all Corpuscule tools with any WebComponent-based system, like
`Polymer`, `lit-element` or `SkateJS`. They are not bound to `@corpuscule/element` and implemented
with only web component lifecycle hooks. Also, `@corpuscule/element` can use any renderer you want:
`lit-html`, `hyperHTML`, `preact` or even `React`.

* **Be small yet powerful**. Bundle size matters. It becomes critical for people with slow internet
connection. Corpuscule already uses WebComponents standard that takes care of component system, so
everything it needs is to have as many useful features as possible in smallest size as possible. 

* **Be at the bleeding edge of JavaScript**. Features adding to the JavaScript language simplify
developer's life, give new opportunities and solve problems like security holes. That's why 
Corpuscule is trying to be on the bleeding edge of language development and use the newest features.

## Technologies
Some technological solutions of Corpuscule could be surprising and confusing. This section provides
explanation of why this or that solution has been chosen.  

* **Decorators (stage 2)**. The [new decorators specification](https://github.com/tc39/proposal-decorators)
could become a game-changer in the JavaScript world (along with [private class fields/methods](https://github.com/tc39/proposal-private-fields)
). Decorators add a powerful system of metaprogramming to the JS language allowing to step into
all stages of class lifecycle, to manipulate class fields in the very declarative yet incredibly 
flexible way. You still could achieve some similar results using class mixins and static methods
with property definition, but it is way less descriptive and has its own drawbacks.

* **Symbols**. The most confusing solution of Corpuscule is using Symbols everywhere. You may almost
never meet using the regular string-named class fields in Corpuscule tools. Why? Well, the best
answer is to avoid naming conflicts. Web components are not React. They won't pack component
properties into a separate object `this.props`. All properties come as a class fields. So, to avoid
a situation when you want to use property `render`, but you have a `render` method that is a heart
of your component system, Corpuscule declares all its field names as Symbols. So you are free to 
use `render` property along with `[render]` method, and you are free to create another Symbol named
`render` and use it in the same class. Symbols are unique, and that is their power. 

## List of tools
Corpuscule consists of following tools:

* [`@corpuscule/context`](./packages/context). This package allows to create a context that sends
data top-down, from parents to children. Context is DOM-dependent, so using it on different DOM
branches with different values you will get different results. This is also a base for many other
Corpuscule tools like `router` or `redux`. 
* [`@corpuscule/element`](./packages/element). This package provides a set of decorators for
creating web components. It is decorator-based analogue for Polymer's [LitElement](https://github.com/Polymer/lit-element)
or [React](https://reactjs.org/).
* [`@corpuscule/form`](./packages/form). Connector for the [🏁 final-form](https://github.com/final-form/final-form)
package that provides Corpuscule solution for forms.
* [`@corpuscule/lit-html-renderer`](./packages/lit-html-renderer). [lit-html](https://github.com/Polymer/lit-html) 
based renderer for [`@corpuscule/element`](./packages/element). Also includes solution for using
custom element class definition as a source for custom element name (`MyElement` -> `my-element`)
that makes `lit-html` usage similar to React. 
* [`@corpuscule/redux`](./packages/redux). Connector for the [Redux](https://redux.js.org/) library.
 It is `react-redux` for Corpuscule.
* [`@corpuscule/router`](./packages/router). Connector for the [Universal Router](https://github.com/kriasoft/universal-router)
package, provides Corpuscule solution for routing. 
* [`@corpuscule/styles`](./packages/styles). Solution for loading CSS stylesheets.
* [`@corpuscule/typings`](./packages/typings). Typescript and Flow (in future) common typings for
the Corpuscule.
* [`@corpuscule/utils`](./packages/utils). Utilities package that is used in almost all Corpuscule
packages. Doesn't have single entrypoint, each util can be loaded separately. 