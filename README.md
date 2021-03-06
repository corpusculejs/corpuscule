> ## 🛠 Status: In Development
> Corpuscule is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# Corpuscule

[![CI Status](https://github.com/corpusculejs/corpuscule/workflows/CI/badge.svg)](https://github.com/corpusculejs/corpuscule/actions)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=corpusculejs_corpuscule&metric=coverage)](https://sonarcloud.io/dashboard?id=corpusculejs_corpuscule)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=corpusculejs_corpuscule&metric=bugs)](https://sonarcloud.io/dashboard?id=corpusculejs_corpuscule)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=corpusculejs_corpuscule&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=corpusculejs_corpuscule)

Corpuscule is a set of libraries built on top of Web Components standard. It provides all necessary
tools to built whole application from scratch including redux connector, router and form utils.

## Principles

### Be universal
You can use almost all Corpuscule tools with any Web Component based system, like [Polymer](https://www.polymer-project.org/),
[LitElement](https://lit-element.polymer-project.org/) or [SkateJS](https://skatejs.netlify.com/).
They are not bound to `@corpuscule/element` and implemented with only web components lifecycle
hooks. Also, `@corpuscule/element` can use any renderer you want: [lit-html](https://lit-html.polymer-project.org/),
[hyperHTML](https://github.com/WebReflection/hyperHTML), [preact](https://preactjs.com/) or even
[React](https://reactjs.org/).

### Be small yet powerful
Bundle size matters. It becomes critical for people with a slow internet connection. Corpuscule
already uses Web Components standard that takes care of the component system, so everything it needs
is to have as many useful features as possible in smallest size as possible. 

### Be at the bleeding edge of JavaScript
Features adding to the JavaScript language simplify developer's life, give new opportunities and
solve problems like security holes. That's why Corpuscule is trying to be on the bleeding edge of
language development and use the latest features.

### Separate semantics from logic
Semantics is a keystone of the web for a long time now. We used to make our markup as meaningful as
possible. We use `<article>` instead of `<div>` to wrap our articles because `<article>` makes way
more sense than a simple `<div>`. We have `<header>`, `<section>` and `<footer>` tags to split our
layout to parts properly.

However, with the React popularity growing we have got not only great solutions but also a handful
of doubtful patterns. One of them is an approach to put logic into the markup. This approach brings
such components as `<Provider>`, `<Suspense>`, `<Connect(MyComponent)>` etc. that can have no own
markup at all! 
 
So while it is acceptable for React components since they exist only on the JS level, it could be
wrong for web components which have their representation in the DOM. The existence of only logic
components in DOM breaks the idea of semantics.

That's why Corpuscule suggests a slightly different approach. Since it is just logic, we can apply
it to semantic web components using decorators and class properties. It means that single web
component could be a component connected to Redux, custom context provider and router outlet at the
same time.

## Technologies
Some technological solutions of Corpuscule could be surprising and confusing. This section provides
explanation of why this or that solution has been chosen.  

### Decorators (stage 2)
The [new decorators specification](https://github.com/tc39/proposal-decorators)
could become a game-changer in the JavaScript world (along with [private class fields/methods](https://github.com/tc39/proposal-private-fields)
). Decorators add a powerful system of metaprogramming to the JS language allowing to step into all
stages of the class lifecycle, to manipulate class fields in the very declarative yet incredibly
flexible way. You still could achieve some similar results using class mixins and static methods
with property definition, but it is way less descriptive and has its drawbacks.

Unfortunately, the initial proposal Corpuscule was built on is deprecated due to serious performance
issues. There is a new static decorator proposal, but it does not have Babel implementation yet, and
it is not defined when it will.

That is the reason Corpuscule moves to an emulation of static decorator proposal. What does
emulation mean? Well, it is not a specification-correct implementation, but it implements basic
ideas of the proposal. Emulation uses the legacy decorator proposal (stage 1) that is well-supported
by Babel and Typescript supplemented with a custom solution: a [Babel plugin](https://github.com/corpusculejs/babel-preset/README.md#babel-plugin-inject-decorator-initializer`)
that adds missing parts to the code generated by the legacy plugin. 

### Symbols
This solution of Corpuscule may confuse you. You may rarely meet using the regular string-named
class fields in Corpuscule tools. Why? Well, the best answer is to avoid naming conflicts. Web
components are not React. They won't pack component properties into a separate object `this.props`.
All properties come as class fields. So, to avoid a situation when you want to use property
`render`, but you have a `render` method that is a heart of your component system, Corpuscule
declares all its field names as Symbols. So you are free to use `render` property along with
`[render]` method, and you are free to create another Symbol named `render` and use it in the same
class. Symbols are unique, and that is their power. 

## How to use
To work with the Corpuscule project, you have to transpile it using [Babel](https://babeljs.io)
because decorators are not a part of the language yet. 

Along with the Babel you have to install [`@corpuscule/babel-preset`](https://github.com/corpusculejs/babel-preset)
that should be used in Babel configuration. This preset contains everything to compile decorators in
a way Corpuscule need to work.

## Documentation
API documentation is available [here](https://corpusculejs.github.io/corpuscule).


## List of tools
Corpuscule consists of following tools:

* [@corpuscule/context](https://github.com/corpusculejs/corpuscule/tree/master/packages/context).
This package allows creating a context that sends data top-down, from parents to children. Context
is DOM-dependent, so using it on different DOM branches with different values you will get different
results. It is also a base for many other Corpuscule tools like `router` or `redux`.
* [@corpuscule/element](https://github.com/corpusculejs/corpuscule/tree/master/packages/element).
This package provides a set of decorators for creating web components. It is decorator-based
analogue for Polymer's [LitElement](https://github.com/Polymer/lit-element) or [React](https://reactjs.org/).
* [@corpuscule/form](https://github.com/corpusculejs/corpuscule/tree/master/packages/form).
Connector for the [🏁 final-form](https://github.com/final-form/final-form) package that provides
Corpuscule solution for forms.
* [@corpuscule/lit-html-renderer](https://github.com/corpusculejs/corpuscule/tree/master/packages/lit-html-renderer).
[lit-html](https://github.com/Polymer/lit-html) based renderer for [`@corpuscule/element`](./packages/element).
Also includes solution for using custom element class definition as a source for custom element name
(`MyElement` -> `my-element`) that makes `lit-html` usage similar to React. 
* [@corpuscule/redux](https://github.com/corpusculejs/corpuscule/tree/master/packages/redux).
A connector for the [Redux](https://redux.js.org/) library. It is `react-redux` for Corpuscule.
* [@corpuscule/router](https://github.com/corpusculejs/corpuscule/tree/master/packages/router).
A connector for the [Universal Router](https://github.com/kriasoft/universal-router) package,
provides Corpuscule solution for routing.
* [@corpuscule/storeon](https://github.com/corpusculejs/corpuscule/tree/master/packages/storeon).
A connector for the [Storeon](https://github.com/ai/storeon) package, a tiny Redux-like state
manager. 
* [@corpuscule/styles](https://github.com/corpusculejs/corpuscule/tree/master/packages/styles).
A solution for loading CSS stylesheets.
* [@corpuscule/typings](https://github.com/corpusculejs/corpuscule/tree/master/packages/typings).
Typescript common typings for the Corpuscule.
* [@corpuscule/utils](https://github.com/corpusculejs/corpuscule/tree/master/packages/utils).
This package contains a lot of utilities used in almost all Corpuscule packages. Doesn't have single
entrypoint; each util should be loaded separately.

## Future
When the [static decorator specification]((https://github.com/tc39/proposal-decorators)) reaches
stage 3, Corpuscule will be rewritten using it. The current implementation of Corpuscule is done
with the basic ideas of the new proposal in mind (that is why it does not use some obvious ideas
like a function that creates decorators). It should reduce the number of efforts production code
refactoring will take when decorators become a standard.