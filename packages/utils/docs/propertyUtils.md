# @corpuscule/utils/lib/propertyUtils

This module provides tools to work with different kinds of properties: string,
symbolic, and private, — identically.

## Usage

```typescript
import {getName} from '@corpuscule/utils/lib/propertyUtils';
```

## API

### getName

```typescript
function getName<P extends PropertyKey>(property: P): P extends number ? number : string;
```

Extracts string name from a class property. If the property is a symbol, its
description will be returned.

```typescript
const foo = 'foo';
const bar = Symbol('bar');

getName(foo); // foo
getName(bar); // bar
```

##### Parameters

- `property` - a string or a symbol property.

##### Returns
A string name of the property.