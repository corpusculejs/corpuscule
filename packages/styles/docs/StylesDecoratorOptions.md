# StylesDecoratorOptions

```typescript
type StylesDecoratorOptions = {
  readonly adoptedStyleSheets?: boolean;
  readonly shadyCSS?: boolean;
};
```

Contains options to change the default behavior of the [@styles](./index.md#stylesadvanced)
decorator.

### Fields

#### adoptedStyleSheets

**Type**: _boolean_

Defines whether the decorator should use the [Constructible Stylesheet proposal](https://wicg.github.io/construct-stylesheets/).

#### shadyCSS

**Type**: _boolean_

Defines whether the decorator should use the [Shady CSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss)
polyfill.
