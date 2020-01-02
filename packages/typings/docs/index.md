# @corpuscle/typings

## API

### Structures

- [CustomElement](./CustomElement.md).

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
