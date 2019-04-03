> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# @corpuscule/router
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/router.svg)](https://www.npmjs.com/package/@corpuscule/router)
[![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/router)](https://bundlephobia.com/result?p=@corpuscule/router)

A lightweight set of decorators and components for providing routing for web components. Built on
top of [Universal Router](https://github.com/kriasoft/universal-router).

## Features
* **Small**. According to [Bundlephobia](https://bundlephobia.com), it has following sizes:
  * [![Package size](https://badgen.net/bundlephobia/min/@corpuscule/router)](https://bundlephobia.com/result?p=@corpuscule/router)
  * [![Package size](https://badgen.net/bundlephobia/minzip/@corpuscule/router)](https://bundlephobia.com/result?p=@corpuscule/router)
* **Typed**. [Typescript](http://www.typescriptlang.org/) typings are included.

## Installation
```bash
$ npm install --save universal-router @corpuscule/router
``` 
or
```bash
$ yarn add universal-router @corpuscule/router
```

## Routing lifecycle
Routing system has the following lifecycle.

### Create router
First of all, you have to create `UniversalRouter` instance. To get it working with other parts of
this package you have to use [`createRouter`](#createrouterroutes-route--readonlyarrayroute-options-options-universalrouter)
over the `new` operator. [See Universal Router Getting Started section](https://github.com/kriasoft/universal-router/blob/master/docs/getting-started.md)
to understand how to create a router instance.

If you use [`lit-html`](https://lit-html.polymer-project.org/), it may look like following.
```javascript
import {createRouter} from '@corpuscule/router';
import {html} from 'lit-html';

export const routes = [
 {path: '/one', action: () => html`<x-one></x-one>`},
 {path: '/two', action: () => html`<x-two></x-two>`},
 {path: '(.*)', action: () => html`<x-404>Not Found</x-404>`}
];

export const router = createRouter(routes);
```

### Provide it down the DOM tree
The router uses [`@corpuscule/context`](../context) under the hood, so to work it requires provider
component that will send it to nested components. Use `@provider` and `@api` decorators to
accomplish it.
```javascript
import {provider, value} from '@corpuscule/router';
import {router} from './router';

@provider
class Provider extends HTMLElement {
  @api router = router;
}
```

### Create several outlets
Along with the provider component, there should be several consumer components that catch route
change and performs route's `action` to get a result. You can create it using `@outlet` decorator.
This decorator accepts the list of routes (whatever nesting they have) and on route change searches
there single route that is equal with the route chosen for the current path by Universal Router. If
a matching route is found, update for this outlet is performed; otherwise, nothing happens.

The result of route's `action` is written to the property marked with `@api` decorator.

To get more control over the path selection, you can override `[resolve]` function that can adjust
both the original path and returned component before it comes to the class `@api` property.

```javascript
import {outlet, resolve, value} from '@corpuscule/router';
import {html} from 'lit-html';
import {routes} from './router';

@outlet(routes)
class Outlet extends HTMLElement {
  @api layout;
  
  *[resolve](path) {
    const result = yield path;
    
    return html`
      ${result}
      <div>Foo</div>
    `;
  }
}
```

### Change route
There are two ways to change the current route.
* [`push`](#pushpath-string-title-string-void) function. It is an imperative way to change the
current route.
* [`Link`](#link) element. This element overrides the default scenario of `HTMLAnchorElement` and
changes route using `push` function under the hood. It is a declarative way to change the current
route. 

## API
### Default
#### `createRouter(routes: Route | ReadonlyArray<Route>, options?: Options): UniversalRouter`
Creates instance of `UniversalRouter` which should be sent down the DOM tree in the element marked
with `@provider` decorator. 

**Note**: do not use `UniversalRouter` instance created with `new` operator, it is not prepared to
work in `@corpuscule/router` system. 

#### `@provider: ClassDecorator`
[See the `@corpuscule/context` docs on `@provider` decorator](../context/README.md#provider-classdecorator).
`UniversalRouter` instance should be sent.

#### `@api: PropertyDecorator`
[See the `@corpuscule/context` docs on `@value` decorator](../context/README.md#value-propertydecorator).

##### Inside `@outlet` class
For the `@outlet` class you should define two properties.
* `layout` — this property receives the result of the route's `action` method. You can use this
property wherever it is necessary to display routing outcome.
* `route` — this property receives the route itself. It could be useful in different situations:
from understanding which route is active now up to get static information added to the route. 

Rules for setting properties are the following:
* Any property can be marked with `@api` decorator: string, symbolic or private. 
* Property should have the same name as the API element it implements.
  * String property should have the API element name, e.g. `form`.
  * Symbolic property should have description identical to the API element name, e.g. `const layout
  = Symbol('layout')`.
  * Private property should have description identical to the API element name, e.g., `#layout` or
  `new PrivateName('layout')`.
* Only one property is allowed for each API element.

```javascript
import {api, outlet} from '@corpuscule/router';
import {routes} from './router';

@outlet(routes)
class Outlet extends HTMLElement {
  _layout;
  
  @api 
  get layout() {
    return this._layout;
  };
  
  set layout(v) {
    this._layout = v;
    
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }
    
    this.shadowRoot.appendChild(v);
  }
  
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
}
```

#### `@outlet(routes: Route[]): ClassDecorator`
Basically, it is a [`@consumer` decorator](../context/README.md#consumer-classdecorator) of
`@corpuscule/context` that receives the router sent by `@provider`. Receives a list of routes where
searches a matching route when route update is performed. If the route is found, all following
lifecycle is performed; otherwise, nothing changes. 

#### `push(path: string, title?: string): void`
Changes current browser location and notifies router about it. In general, it is a wrapper over the
[HTML5 History `pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method)
method. Receives the following params:
* `path: string` - a new location URL to which browser will go.
* `title?: string` - optional property for `title` param of `pushState`.

#### `isProvider(target: unknown): boolean`
[See the `@corpuscule/context` docs on `isProvider`](../context/README.md#isprovider-token-token-target-unknown--boolean).

#### Link
This class is a customized built-in `HTMLAnchorElement` that uses [`push`](#pushpath-string-title-string-void)
under the hood. Since it is just an extended native element, it could be used everywhere native
`<a>` element is allowed and stylized as a native element.
```html
<a is="corpuscule-link" href="/path/to/route">Click me</a>
```

### Advanced
Using a set of advanced decorators allows creating a new context that is completely independent of
the default one.

#### How it works
[See `@copruscule/context` docs](../context/README.md#how-it-works).

#### `createRouterToken(): Token`
The function creates a token to bind `@provider`, `@outlet`, and `@api` together. To make a
connection, you have to send a token to all these decorators as an argument.

#### `@providerAdvanced(token: Token): ClassDecorator`
[See default `@provider` decorator](#provider-classdecorator).

#### `@apiAdvanced(token: Token): PropertyDecorator`
[See default `@api` decorator](#api-propertydecorator).

#### `@outletAdvanced(token: Token, routes: Route[]): PropertyDecorator`
[See default `@outlet` decorator](#outletroutes-route-classdecorator).

#### `isProviderAdvanced(token: Token, target: unknown): boolean`
[See default `isProvider` function](#isprovidertarget-unknown-boolean).