import {assertKind} from '@corpuscule/utils/lib/asserts';

export const assertElementDecoratorsKind = (decoratorName, kind) =>
  assertKind(
    decoratorName,
    'field',
    kind,
    {
      customMessage: `@${decoratorName} can be applied only to field, not to ${kind}. `
        + `Also @${decoratorName} expected to be the first executed decorator, so pay attention `
        + 'to an order of your decorators',
    },
  );
