/* eslint-disable no-invalid-this, prefer-arrow-callback */
import {CustomElement} from '@corpuscule/typings';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectMethods from '@corpuscule/utils/lib/reflectMethods';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  internalChangedCallback as $internalChangedCallback,
  propertyChangedCallback as $propertyChangedCallback,
  render as $render,
  updatedCallback as $updatedCallback,
} from './tokens';
import {CorpusculeElement, ElementClass, noop, shadowElements} from './utils';

const readonlyPropertyDescriptor = {
  configurable: true,
  enumerable: true,
  writable: false,
};

export type ElementDecoratorOptions = {
  extends?: keyof HTMLElementTagNameMap;
  lightDOM?: boolean;
  renderer?: (
    renderingResult: unknown,
    container: Element | DocumentFragment,
    context: unknown,
  ) => void;
  scheduler?: (task: () => void) => Promise<void>;
};

const element = (
  name: string,
  {
    extends: builtin,
    lightDOM,
    renderer,
    scheduler = defaultScheduler,
  }: Readonly<ElementDecoratorOptions> = {},
): ClassDecorator =>
  (<C extends CustomElement>(klass: ElementClass<C>) => {
    const {prototype} = klass;
    const isLight = lightDOM || (builtin && !shadowElements.includes(builtin));

    const $$connected = Symbol();
    const $$invalidate = Symbol();
    const $$root = Symbol();
    const $$valid = Symbol();

    type ElementClassWithPrivateMethods = {
      [$$connected]: boolean;
      [$$invalidate]: (this: C) => Promise<void>;
      [$$root]: HTMLElement | DocumentFragment | ShadowRoot;
      [$$valid]: boolean;
    };

    const supers = reflectMethods(prototype, [
      'attributeChangedCallback',
      'connectedCallback',
      $internalChangedCallback,
      $propertyChangedCallback,
      $updatedCallback,
    ]);

    Object.defineProperties(klass, {
      is: {
        ...readonlyPropertyDescriptor,
        value: name,
      },
      observedAttributes: {
        ...readonlyPropertyDescriptor,
        value: [],
      },
    });

    defineExtendable(
      klass,
      {
        async attributeChangedCallback(
          this: C & ElementClassWithPrivateMethods,
          attributeName: string,
          oldValue: string,
          newValue: string,
        ) {
          if (oldValue === newValue || !this[$$connected]) {
            return;
          }

          await supers.attributeChangedCallback.call(
            this,
            attributeName,
            oldValue,
            newValue,
          );
          await this[$$invalidate]();
        },
        async connectedCallback(this: C & ElementClassWithPrivateMethods) {
          await this[$$invalidate]();
          this[$$connected] = true;
          supers.connectedCallback.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    Object.assign(prototype, {
      [$$invalidate]:
        $render in prototype && renderer
          ? async function(
              this: C &
                Required<CorpusculeElement> &
                ElementClassWithPrivateMethods,
            ) {
              if (!this[$$valid]) {
                return;
              }

              this[$$valid] = false;

              await scheduler(() => {
                renderer(this[$render](), this[$$root], this);
                this[$$valid] = true;
              });

              if (this[$$connected]) {
                this[$updatedCallback]();
              }
            }
          : noop,
      async [$internalChangedCallback](
        this: C & Required<CorpusculeElement> & ElementClassWithPrivateMethods,
        internalName: PropertyKey,
        oldValue: unknown,
        newValue: unknown,
      ) {
        if (!this[$$connected]) {
          return;
        }

        supers[$internalChangedCallback].call(
          this,
          internalName,
          oldValue,
          newValue,
        );
        await this[$$invalidate]();
      },
      async [$propertyChangedCallback](
        this: C & Required<CorpusculeElement> & ElementClassWithPrivateMethods,
        propertyName: PropertyKey,
        oldValue: unknown,
        newValue: unknown,
      ) {
        if (oldValue === newValue || !this[$$connected]) {
          return;
        }

        supers[$propertyChangedCallback].call(
          this,
          propertyName,
          oldValue,
          newValue,
        );
        await this[$$invalidate]();
      },
      [$updatedCallback]: supers[$updatedCallback],
    });

    klass.__initializers.push(self => {
      self[$$connected] = false;
      self[$$root] =
        self.constructor !== klass
          ? null
          : isLight
          ? self
          : self.attachShadow({mode: 'open'});
      self[$$valid] = true;
    });

    // Deferring custom element definition allows to run it at the end of all
    // decorators execution which helps to fix many issues connected with
    // immediate custom element instance creation during definition.
    queueMicrotask(() => {
      customElements.define(
        name,
        klass,
        builtin ? {extends: builtin} : undefined,
      );
    });
  }) as any;

export default element;
