import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import {field, lifecycleKeys, method} from '@corpuscule/utils/lib/descriptors';
import {setValue} from '@corpuscule/utils/lib/propertyUtils';
import {resolve} from './tokens/lifecycle';
import getSupers from '@corpuscule/utils/lib/getSupers';

const methods = [...lifecycleKeys, resolve];

const [connectedCallbackKey, disconnectedCallbackKey] = lifecycleKeys;

const createOutletDecorator = ({consumer, value}, {api}) => routes => descriptor => {
  assertKind('outlet', Kind.Class, descriptor);

  const {elements, kind} = consumer(descriptor);

  let constructor;
  let $api;

  const $$connectedCallback = Symbol();
  const $$disconnectedCallback = Symbol();
  const $$contextValue = Symbol();
  const $$updateRoute = Symbol();

  const [supers, finish] = getSupers(elements, methods);
  const {extras, finisher: contextFinisher, ...contextValueDescriptor} = value(
    field({key: $$contextValue}),
  );

  return {
    elements: [
      ...elements.filter(
        ({key, placement}) => !(lifecycleKeys.includes(key) && placement === 'prototype'),
      ),

      // Public
      method({
        key: connectedCallbackKey,
        method() {
          // Workaround for Custom Element spec that cannot accept anything
          // than prototype method
          this[$$connectedCallback]();
        },
      }),
      method({
        key: disconnectedCallbackKey,
        method() {
          // Workaround for Custom Element spec that cannot accept anything
          // than prototype method
          this[$$disconnectedCallback]();
        },
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

      field({
        initializer() {
          // Inheritance workaround. If class is inherited, it will use
          // user-defined callback, if not - system one.
          return this.constructor === constructor
            ? () => {
                window.addEventListener('popstate', this[$$updateRoute]);
                supers[connectedCallbackKey].call(this);

                this[$$updateRoute](location.pathname);
              }
            : supers[connectedCallbackKey];
        },
        key: $$connectedCallback,
      }),
      field({
        initializer() {
          // Inheritance workaround. If class is inherited, it will use
          // user-defined callback, if not - system one.
          return this.constructor === constructor
            ? () => {
                window.removeEventListener('popstate', this[$$updateRoute]);
                supers[disconnectedCallbackKey].call(this);
              }
            : supers[disconnectedCallbackKey];
        },
        key: $$disconnectedCallback,
      }),
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
      constructor = target;
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
