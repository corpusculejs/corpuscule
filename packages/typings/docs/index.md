# @corpuscle/typings

## API

### Structures

#### CustomElement

```typescript
interface CustomElement extends HTMLElement {
  adoptedCallback?(): void;
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}
```

#### adoptedCallback

Invoked each time the element is moved from one document to another via
[adoptNode](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptNode)
method.

##### Parameters

None.

##### Returns

Nothing.

#### attributeChangedCallback

Invoked each time the value of the observed attribute is updated.

##### Parameters

- **attrName**: _string_ - the attribute name.
- **oldValue**: _string_ - the value existed before the attribute is updated.
- **newValue**: _string_ - the value the attribute is updated to.

##### Returns

Nothing.

#### connectedCallback

Invoked each time the element is added to DOM.

##### Parameters

None.

##### Returns

Nothing.

#### disconnectedCallback

Invoked each time the element is removed from DOM.

##### Parameters

None.

##### Returns

Nothing.
