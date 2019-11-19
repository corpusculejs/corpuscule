# @corpuscule/lit-html-renderer/lib/init

This module provides a registry that contains all the custom element names
and class declarations in the reverted order than CustomElementRegistry does.
It is necessary to find the custom element name by its class.

It is possible to register all elements even they are not created with the
Corpuscule framework. To do it, import this module before any module that
creates custom element.

## Usage

```typescript
import '@corpuscule/lit-html-renderer/lib/init';
```
