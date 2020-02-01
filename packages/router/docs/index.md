# @corpuscule/router

This module provides a straightforward but comprehensive router solution for
web components via the [Universal Router](https://www.kriasoft.com/universal-router).

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/router
```

or

```bash
$ yarn add @corpuscule/router
```

Then import it:

```typescript
import {createRouter, Link, router, provider, gear} from '@corpuscule/router';
```

## API

### Structures

- [Link](./Link.md).
- [RouterProviderOptions](./RouterProviderOptions.md).

### Decorators

#### gear

```typescript
const gear: PropertyDecorator;
```

A default version of the [@gearAdvanced](#gearadvanced) with the token already
provided.

#### outlet

```typescript
function outlet(routes: ReadonlyArray<Route>): ClassDecorator;
```

A default version of the [@outletAdvanced](#outletadvanced) with the token
already provided.

#### provider

```typescript
function provider(options?: RouterProviderOptions): ClassDecorator;
```

A default version of the [@providerAdvanced](#provideradvanced) with the token
already provided.

#### gearAdvanced

```typescript
function gearAdvanced(token: Token): PropertyDecorator;
```

Works similar to the `@value` context decorator but with some specific features.

- Applied to a property of the class marked with the [@provider](#provideradvanced)
  decorator, allows sending a router to consumers.

- Applied to a property of the class marked with the [@outlet](#outletadvanced)
  decorator, allows receiving result the route action returns.

##### Extends

- [@value](../../context/docs/index.md#value).

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createRouterToken](#createroutertoken) function that connects all
  decorators in a single working system.

#### outletAdvanced

```typescript
function outletAdvanced<C extends Context = Context, R = any>(
  token: Token,
  routes: ReadonlyArray<Route<C, R>>,
): ClassDecorator;
```

A decorator that makes a class a router outlet. The outlet is a central part
of the whole routing process because the content of the outlet depends on the
current route.

The outlet class requires a property marked with the [@gear](#gearadvanced)
decorator. This property will contain a content the current router provides.

##### Extends

- [@consumer](../../context/docs/index.md#consumer).

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createRouterToken](#createroutertoken) function that connects all
  decorators in a single working system.

- **routes**: _[Route[]](https://github.com/kriasoft/universal-router/blob/master/docs/api.md#const-router--new-universalrouterroutes-options)_ -
  a list of routes the current outlet works with. You can use both routes array
  that is sent to the [createRouter](#createrouter) function or one of the
  nested children array.

  You can also put outlet elements one into another following the nested model
  of the routes you use.

  ```typescript
  const routes = [
    {
      path: '/foo1',
      action: () => '<my-foo></my-foo>',
      children: [
        {
          path: '/bar1',
          action: () => '<div>Bar #1</div>',
        },
        {
          path: '/bar2',
          action: () => '<div>Bar #2</div>',
        },
      ]
    },
    {
      path: '/foo2',
      action: () => '<my-baz></my-baz>',
    },
  ];

  @outlet(routes);
  class App extends HTMLElement {
    @gear set result(value: string) {
      this.innerHTML = value;
    }
  }

  customElements.define('my-app', App);

  @outlet(routes[0].children)
  class Foo extends HTMLElement {
    @gear set result(value: string) {
      this.innerHTML = value;
    }
  }

  customElements.define('my-foo', Foo);

  navigate('/foo1/bar2');
  ```

  The following HTML will be displayed:

  ```html
  <my-app>
    <my-foo>
      <div>Bar #2</div>
    </my-foo>
  </my-app>
  ```

#### providerAdvanced

```typescript
function providerAdvanced(
  token: Token,
  options?: RouterProviderOptions,
): ClassDecorator;
```

A decorator that creates a router provider.

##### Extends

- [@provider](../../context/docs/index.md#provider).

##### Parameters

- **token**: _[Token](../../utils/docs/tokenRegistry.md#token)_ - a token issued
  by a [createRouterToken](#createroutertoken) function that connects all
  decorators in a single working system.

* **options**: _[RouterProviderOptions](./RouterProviderOptions.md)_ - a list of
  provider options.

### Functions

#### createRouter

```typescript
function createRouter<C extends Context = Context, R = any>(
  routes: Route | ReadonlyArray<Route<C, R>>,
  options?: Options<C, R>,
): UniversalRouter<C, R>;
```

A function that creates an instance of the Universal Router. For the work
with the current module, it is essential to use this function instead of the
direct creation of the instance of the Universal Router because it adds
specific functionality to the Universal Router.

##### Parameters

- **routes**: [Route | Route[]](https://github.com/kriasoft/universal-router/blob/master/docs/api.md) -
  a list of Universal Router routes.
- **options**: [Options](https://github.com/kriasoft/universal-router/blob/master/docs/api.md) -
  a list of Universal Router options.

##### Returns

**Type**: _[UniversalRouter](https://github.com/kriasoft/universal-router/blob/master/docs/api.md#const-router--new-universalrouterroutes-options)_

#### createRouterToken

```typescript
function createRouterToken(): Token;
```

Creates tokens to bind decorators with each other.

##### Parameters

Nothing.

##### Returns

**Type**: _[Token](../../utils/docs/tokenRegistry.md#token)_

#### isProvider

```typescript
function isProvider(klass: unknown): boolean;
```

A default version of the [@isProviderAdvanced](#provideradvanced) with the token
already provided.

#### isProviderAdvanced

```typescript
function isProviderAdvanced(token: Token, klass: unknown): boolean;
```

Detects if the class declaration is a [@provider](#provideradvanced).

##### Extends

- [isProvider](../../context/docs/index.md#isprovider).

#### navigate

```typescript
function navigate(path: string, contextData?: unknown): void;
```

A function that navigates the browser to the new URL.

##### Parameters

- **path**: _string_ - a new URL to navigate to.
- <sub>[optional]</sub> **contextData**: unknown some data you want to use in
  the route action. It will be accessible as a part of the `context` parameter:

  ```typescript
  const route: Route<any, any> = {
    action({data}: RouteContext<any, any>) {
      // use `data` in some way
    },
  };
  ```
