# DecoratedClassProperties

```typescript
type DecoratedClassProperties = {
  __initializers: Initializer[];
  __registrations: Registration[];
};
```

A type that describes a class affected by the
`babel-plugin-inject-decorator-initializer` provided by [@corpuscule/babel-preset](https://github.com/corpusculejs/babel-preset).

### Fields

#### \_\_initializers

**Type**: _[Initializer](./index.md#initializer)[]_

A set of functions that will be called due the class instantiation.

#### \_\_registrations

**Type**: _[Registration](./index.md#registration)[]_

A set of functions that will be called immediately after the class definition
creation.