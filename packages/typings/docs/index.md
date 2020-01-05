# @corpuscle/typings

## API

### Structures

- [BabelPropertyDescriptor](./BabelPropertyDescriptor.md).
- [CustomElement](./CustomElement.md).
- [DecoratedClassProperties](./DecoratedClassProperties.md).

### Helper Types

- [Constructor](./Constructor.md).
- [Exact](./Exact.md).

### Specialized Types

#### DecoratedClassConstructor

A subset of [Constructor](./Constructor.md) that has [DecoratedClassProperties](./DecoratedClassProperties.md)
in the class definition by default.

#### DecoratedClassPrototype

A type that describes the prototype of [DecoratedClassConstructor](#decoratedclassconstructor).

### Function Types

#### Initializer

```typescript
type Initializer = (self: object) => void;
```

An initializer function runs during the class instantiation. See more about it
in [@corpuscule/babel-preset](https://github.com/corpusculejs/babel-preset#readme)
description.

#### Registration

```typescript
type Registration = () => void;
```

A static initializer function that runs after the class definition is created.
See more about it in [@corpuscule/babel-preset](https://github.com/corpusculejs/babel-preset#readme)
description.
