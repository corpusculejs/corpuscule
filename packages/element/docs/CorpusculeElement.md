# CorpusculeElement

```typescript
interface CorpusculeElement extends CustomElement {
  protected [internalChangedCallback]?(
    propertyName: PropertyKey,
    oldValue: unknown,
    newValue: unknown,
  ): void;

  protected [propertyChangedCallback]?(
    propertyName: PropertyKey,
    oldValue: unknown,
    newValue: unknown,
  ): void;

  protected [render]?(): unknown;

  protected [updatedCallback]?(): void;
}
```

Each custom element marked with an [@element](./index.md#element) decorator becomes an
implementation of the `CorpusculeElement` and gain the following lifecycle
(including standard JS class and custom element lifecycle).

> **Note**
>
> A rendering system is able to wait until multiple properties are set
> synchronously; only then the single rendering will be performed. However, be
> careful with the asynchronous setting: it may cause re-rendering on each
> assignment.

| Name                                                | Hook Type      | Stage      | Description                                                                                                                                                                                                                       |
| --------------------------------------------------- | -------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| constructor                                         | JS Class       | Creation   | Since DOM element can be created with the `document.createElement` method, this hook is separate.                                                                                                                                 |
| connectedCallback                                   | Custom Element | Connecting | Invoked whenever the element is connected to the DOM. During the connection, Corpuscule performs the initial rendering, and then user-defined `connectedCallback` is fired. Can be invoked multiple times for the single element. |
| disconnectedCallback                                | Custom Element | Connecting | Invoked after the element is disconnected from DOM. Since there is nothing for Corpuscule to do at this time, user-defined `disconnectedCallback` will be invoked directly. Can be invoked multiple times for the single element. |
| attributeChangedCallback                            | Custom Element | Update     | Invoked each time the [attribute](./index.md#attribute) property is changed. The method receives a string name of the changed property, its old and new value (in a string form).                                                 |
| [propertyChangedCallback](#propertychangedcallback) | Corpuscule     | Update     | Invoked each time the [property](./index.md#property) is changed. The method receives a name of the changed property, its old and new value.                                                                                      |
| [internalChangedCallback](#internalchangedcallback) | Corpuscule     | Update     | Invoked each time the [internal](./index.md#internal) is changed. The method receives a name of the changed property, its old and new value.                                                                                      |
| [updatedCallback](#updatedcallback)                 | Corpuscule     | Update     | Invoked each time after the [render](#render) is over (except for the first time when the `connectedCallback` is called).                                                                                                         |
| [render](#render)                                   | Corpuscule     | Rendering  | Invoked each time the [attribute](./index.md#attribute), [property](./index.md#property) or [internal](./index.md#internal) is changed. Runs as the next microtask, so is able to accumulate property changes.                    |

##### Extends

- [CustomElement](../../typings/docs/index.md#customelement).

### Methods

#### internalChangedCallback

```typescript
(propertyName: PropertyKey, oldValue: unknown, newValue: unknown) => void;
```

A method that is invoked when an [internal](./index.md#internal) property is
assigned. The behavior is identical to `attributeChangedCallback`. It does
trigger an update each time it is invoked.

##### Parameters

- **propertyName**: _PropertyKey_ - a property name (either string or symbolic).
- **oldValue**: _unknown_ - a value of the property that was before the update
  started.
- **newValue**: _unknown_ - a new value to set to the property.

##### Returns

Nothing.

#### propertyChangedCallback

```typescript
(propertyName: PropertyKey, oldValue: unknown, newValue: unknown) => void;
```

A method that is invoked when a [regular](#property) property is assigned. The
behavior is identical to `attributeChangedCallback`. It does not trigger a
re-rendering if the `oldValue` is equal to `newValue` (by the strict equality
check `===`).

##### Parameters

- **propertyName**: _PropertyKey_ - a property name (either string or symbolic).
- **oldValue**: _unknown_ - a value of the property that was before the update
  started.
- **newValue**: _unknown_ - a new value to set to the property.

##### Returns

Nothing.

#### render

```typescript
() => unknown;
```

A method that is invoked each time any of the component properties (either
[attribute](#attribute), [regular](#property) or [internal](#internal)) causes
re-rendering. The method work synchronously; returned result of its work will be
handled by a [renderer](#renderer) function.

If you do not define this method, rendering won't ever happen on your element.

##### Parameters

None.

##### Returns

Nothing.

#### updatedCallback

```typescript
() => void;
```

A method that is invoked each time the rendering is over and the component
acquires the new state. This method is not called during the initial render
(`connectedCallback` is invoked instead).

##### Parameters

None.

##### Returns

Nothing.
