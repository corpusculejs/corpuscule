# @corpuscule/utils/lib/asserts

This module contains assertion functions that can be used to verify the
correctness of the decorator application.

For example, you want to make sure that the user applies class decorators to
classes and property decorators to properties. Or you have two decorators:
`@classDecorator` and `@propertyDecorator` and at least one property of the
class marked with the `@classDecorator` should be marked with the
`@propertyDecorator`.

This module contains assertions to check these cases.

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
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
```

## API

### assertRequiredProperty

Checks if the property decorator actually applied to a property of a class
marked with class decorator by checking the value of this property and creates a
formatted error if it does not.

##### Overload #1

```typescript
function assertRequiredProperty(
  classDecoratorName: string,
  propertyDecoratorName: string,
  propertyName: string,
  propertyValue: unknown,
): void;
```

This overload should be used if the property of the class required to be marked
with the property decorator has a specific name. The function will throw an
error like:

```
Error: @foo requires bar property marked with @baz
```

##### Overload #2

```typescript
function assertRequiredProperty(
  classDecoratorName: string,
  propertyDecoratorName: string,
  propertyValue: unknown,
): void;
```

This overload should be used if any property of the class required to be
marked with the property decorator. The function will throw an error like

```
Error: @foo requires property marked with @baz
```

##### Parameters

- **classDecoratorName**: _string_ - a name of the base class decorator that
  requires some property marked with some property decorator.
- **propertyDecoratorName**: _string_ - a name of the decorator the class
  decorator requires to mark the property with.
- <sub>[optional]</sub> **propertyName**: _string_ - a name of the property the assertion is applied
  to.
- **propertyValue**: _unknown_ - a value of the property.

##### Returns

Nothing.
