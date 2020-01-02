# @corpuscule/utils/lib/propertyUtils

This module provides tools to work with different kinds of properties: string,
symbolic, and private, — identically.

## Usage

This module provides tools to work with restrictions of the Custom Elements
spec.

## Usage

Install the package via one of the following command:

```bash
$ npm install @corpuscule/utils
```

or

```bash
$ yarn add @corpuscule/utils
```

Then import it:

```typescript
import {getName} from '@corpuscule/utils/lib/propertyUtils';
```

## API

### getName

Extracts string name from a class property. If the property is a symbol, its
description will be returned.

##### Overload #1

```typescript
function getName(property: number): number;
```

This overload accepts `number` as a property name.

```typescript
const foo = 1;

getName(foo); // 1
```

##### Overload #2

```typescript
function getName(property: symbol | string): string;
```

This overload accepts `string` or `symbol` as a property name.

```typescript
const foo = 'foo';
const bar = Symbol('bar');

getName(foo); // 'foo'
getName(bar); // 'bar'
```

##### Type Parameters

- **PropertyName**: _PropertyKey_

##### Parameters

- **property**: _PropertyKey_ - a string, a number, or a symbol property.

##### Returns

**Type**: _string | number_

A string/number name of the property.
