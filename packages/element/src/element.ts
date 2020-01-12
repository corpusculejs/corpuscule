/* eslint-disable no-invalid-this, prefer-arrow-callback */
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectMethods from '@corpuscule/utils/lib/reflectMethods';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {
  $connected,
  $invalidate,
  $root,
  $valid,
  CorpusculeElement,
  ElementClass,
  noop,
  shadowElements,
} from './utils';

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

const methodNames = [
  'attributeChangedCallback',
  'connectedCallback',
  'internalChangedCallback',
  'propertyChangedCallback',
  'updatedCallback',
] as const;

const element = (
  name: string,
  {
    extends: builtin,
    lightDOM,
    renderer,
    scheduler = defaultScheduler,
  }: Readonly<ElementDecoratorOptions> = {},
): ClassDecorator =>
  (<C extends CorpusculeElement>(klass: ElementClass<C>) => {
    const {prototype} = klass;
    const isLight = lightDOM || (builtin && !shadowElements.includes(builtin));

    const supers = reflectMethods(prototype, methodNames);

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
          this: C,
          attributeName: string,
          oldValue: string,
          newValue: string,
        ): Promise<void> {
          if (oldValue === newValue || !$connected.get(this)) {
            return;
          }

          await supers.attributeChangedCallback.call(
            this,
            attributeName,
            oldValue,
            newValue,
          );
          await $invalidate.get(this.constructor)!.call(this);
        },
        async connectedCallback(this: C): Promise<void> {
          await $invalidate.get(this.constructor)!.call(this);
          $connected.set(this, true);
          supers.connectedCallback.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    $invalidate.set(
      klass,
      'renderCallback' in prototype && renderer
        ? async function(this: C) {
            if (!$valid.get(this)) {
              return;
            }

            $valid.set(this, false);

            await scheduler(() => {
              renderer(this.renderCallback!(), $root.get(this)!, this);
              $valid.set(this, true);
            });

            if ($connected.get(this)) {
              this.updatedCallback!();
            }
          }
        : noop,
    );

    Object.assign(prototype, {
      async internalChangedCallback(
        this: C,
        internalName: PropertyKey,
        oldValue: unknown,
        newValue: unknown,
      ) {
        if (!$connected.get(this)) {
          return;
        }

        supers.internalChangedCallback.call(
          this,
          internalName,
          oldValue,
          newValue,
        );
        await $invalidate.get(this)!.call(this);
      },
      async propertyChangedCallback(
        this: C,
        propertyName: PropertyKey,
        oldValue: unknown,
        newValue: unknown,
      ) {
        if (oldValue === newValue || !$connected.get(this)) {
          return;
        }

        supers.propertyChangedCallback.call(
          this,
          propertyName,
          oldValue,
          newValue,
        );
        await $invalidate.get(this)!.call(this);
      },
      updatedCallback: supers.updatedCallback,
    });

    klass.__initializers.push(self => {
      $connected.set(self, false);
      $root.set(
        self,
        self.constructor !== klass
          ? null
          : isLight
          ? self
          : self.attachShadow({mode: 'open'}),
      );
      $valid.set(self, true);
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
