# CustomElement

```typescript
interface CustomElement extends HTMLElement {
  adoptedCallback?(): void;
  attributeChangedCallback?(
    attrName: string,
    oldVal: string,
    newVal: string,
  ): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}
```

Each class that extends the `HTMLElement` becomes a custom element and gains the
following lifecycle. You can find details about custom elements [here](https://developers.google.com/web/fundamentals/web-components/customelements).

### Extends

- [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).

### Methods

#### adoptedCallback <sub>[optional]</sub>

Invoked each time the element is moved from one document to another via
[adoptNode](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptNode)
method.

##### Parameters

None.

##### Returns

Nothing.

#### attributeChangedCallback <sub>[optional]</sub>

Invoked each time the value of the observed attribute is updated.

##### Parameters

- **attrName**: _string_ - the attribute name.
- **oldValue**: _string_ - the value existed before the attribute is updated.
- **newValue**: _string_ - the value the attribute is updated to.

##### Returns

Nothing.

#### connectedCallback <sub>[optional]</sub>

Invoked each time the element is added to DOM.

##### Parameters

None.

##### Returns

Nothing.

#### disconnectedCallback <sub>[optional]</sub>

Invoked each time the element is removed from DOM.

##### Parameters

None.

##### Returns

Nothing.
