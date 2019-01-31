import {assertKind, assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import {field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {setValue} from '@corpuscule/utils/lib/propertyUtils';
import {resolve} from './tokens/lifecycle';
import getSupers from '@corpuscule/utils/lib/getSupers';

const methods = [...lifecycleKeys, resolve];

const [connectedCallbackKey, disconnectedCallbackKey] = lifecycleKeys;

const createOutletDecorator = ({consumer, value}, {api}) => routes => classDescriptor => {
  assertKind('outlet', 'class', classDescriptor.kind);

  const {elements, kind} = consumer(classDescriptor);

  let $api;

  const $$contextValue = Symbol();
  const $$updateRoute = Symbol();

  const [supers, finish] = getSupers(elements, methods);
  const {extras, finisher: contextFinisher, ...contextValueDescriptor} = value(
    field({key: $$contextValue}),
  );

  return {
    elements: [
      ...elements,

      // Public
      method({
        key: connectedCallbackKey,
        method() {
          window.addEventListener('popstate', this[$$updateRoute]);
          supers[connectedCallbackKey].call(this);

          this[$$updateRoute](location.pathname);
        },
        placement: 'own',
      }),
      method({
        key: disconnectedCallbackKey,
        method() {
          window.removeEventListener('popstate', this[$$updateRoute]);
          supers[disconnectedCallbackKey].call(this);
        },
        placement: 'own',
      }),

      // Protected
      method({
        key: resolve,
        method(...args) {
          return supers[resolve].apply(this, args);
        },
      }),

      // Private
      ...extras,
      contextValueDescriptor,

      method({
        bound: true,
        key: $$updateRoute,
        async method(pathOrEvent) {
          const path = typeof pathOrEvent === 'string' ? pathOrEvent : pathOrEvent.state || '';

          const iter = this[resolve](path);

          const resolved = await this[$$contextValue].resolve(iter.next().value);

          if (resolved === undefined) {
            return;
          }

          const [result, {route}] = resolved;

          if (routes.includes(route)) {
            setValue(this, $api, iter.next(result).value);
          }
        },
      }),
    ],
    finisher(target) {
      $api = api.get(target);
      assertRequiredProperty('outlet', 'api', $api);

      finish(target, {
        *[resolve](path) {
          return yield path;
        },
      });
      contextFinisher(target);
    },
    kind,
  };
};

export default createOutletDecorator;
