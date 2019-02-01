> ## 🛠 Status: In Development
> This package is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# @corpuscule/router
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/router.svg)](https://www.npmjs.com/package/@corpuscule/router)

Lightweight set of decorators and components for providing routing for web components. Built on top
of [Universal Router](https://github.com/kriasoft/universal-router).

## Features
* **Small**. Only [1.9Kb gzipped](https://bundlephobia.com/result?p=@corpuscule/router@0.6.1)
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
Routing system has following lifecycle.

### Create router
First of all, you have to create `UniversalRouter` instance. To get it working with other parts of
this package you have to use [`createRouter`](#createrouterroutes-route--readonlyarrayroute-options-options-universalrouter)
over the `new` operator. [See Universal Router Getting Started section](https://github.com/kriasoft/universal-router/blob/master/docs/getting-started.md)
to understand how to create router instance.

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
Router uses [`@corpuscule/context`](../context) under the hood, so to work it requires provider
component that will sent it to nested components. Use `@provider` and `@api` decorators to
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
Along with provider component, there should be several consumer components that catches route change
and performs route's `action` to get result. You can create it using `@outlet` decorator. This
decorator accepts list of routes (whatever nesting they have) and on route change searches there
single route that is equal with the route chosen for current path by Universal Router. If matching
route is found, update for this outlet is performed, otherwise nothing happens.

Result of route's `action` is written to the property marked with `@api` decorator.

To get more control over the path selection you can override `[resolve]` function that is able to
adjust both original path and returned component before it comes to the class `@api` property.

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
There is two ways to change current route.
* [`push`](#pushpath-string-title-string-void) function. It is an imperative way to change current
route.
* [`Link`](#link) element. This element overrides the default scenario of `HTMLAnchorElement` and
changes route using `push` function under the hood. It is a declarative way to change current route. 

## API
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
For `@outlet` class it defines property where result of route's `action` method will be written.
After it, you can use this property wherever it is necessary to display routing outcome.

It works with following rules:
* Any kind of property can be marked with `@api` decorator: string, symbolic or private. 
* Property should have the same name as the API element it implements.
  * String property should just have the API element name, e.g. `form`.
  * Symbolic property should have description identical to the API element name, e.g. `const form =
  Symbol('form')`.
  * Private property should have description identical to the API element name, e.g. `#form` or
  `new PrivateName('form')`.
* Only one property is allowed for each API element.

```javascript
import {outlet, value} from '@corpuscule/router';
import {routes} from './router';

@outlet(routes)
class Outlet extends HTMLElement {
  #layout;
  
  @api 
  get layout() {
    return this.#layout;
  };
  
  set layout(v) {
    this.#layout = v;
    
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
Basically, it is [`@consumer` decorator](../context/README.md#consumer-classdecorator) of
`@corpuscule/context` that receives router sent by `@provider`. Receives list of
routes where searches a matching route when route update is performed. If route is found, all
following lifecycle is performed, otherwise nothing changes. 

#### `push(path: string, title?: string): void`
Changes current browser location and notifies router about it. In general, it is a wrapper over the
[HTML5 History `pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method)
method. Receives following params:
* `path: string` - new location URL that browser will go to.
* `title?: string` - optional property for `title` param of `pushState`.

#### Link
This class is a customized built-in `HTMLAnchorElement` that uses [`push`](#pushpath-string-title-string-void)
under the hood. Since it is just an extended native element, it could be used everywhere native
`<a>` element is allowed and stylized as a native element.
```html
<a is="corpuscule-link" href="/path/to/route">Click me</a>
```
