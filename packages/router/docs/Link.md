# Link

```typescript
class Link extends HTMLAnchorElement implements CustomElement {
  public static readonly is: 'corpuscule-link';
  public contextData: any;
  public connectedCallback(): void;
  public disconnectedCallback(): void;
}
```

A customized `<a>` element that provides declarative navigation around the
application. It should be used for all internal links to make the router working
correctly.

##### Extends

- [HTMLAnchorElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement).
- [CustomElement](../../typings/docs/index.md#customelement).

### Static Fields

#### is

**Type**: _string_

A name of the element registered in the custom element registry.

### Fields

#### contextData <sub>[optional]</sub>

A custom context data that will be send as a second parameter to the
[navigate](./index.md#navigate) function.
