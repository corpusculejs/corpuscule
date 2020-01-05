# BabelPropertyDescriptor

```typescript
type BabelPropertyDescriptor<T = unknown> = PropertyDescriptor & {
  initializer?: () => T;
};
```

The property descriptor created by a [Babel legacy decorators plugin](https://babeljs.io/docs/en/babel-plugin-proposal-decorators).

### Extends
- [PropertyDescriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description).

### Type Parameters

- **T** - a type of the property.

### Fields

#### initializer <sub>[optional]</sub>

```typescript
() => T
```

A function that returns an initial value of the property.

