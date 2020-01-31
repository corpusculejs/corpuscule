import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {internalChangedCallback as $internalChangedCallback} from './tokens';
import {CorpusculeElement, ElementPrototype} from './utils';

const internal: PropertyDecorator = (<C extends CustomElement>(
  {constructor: klass}: ElementPrototype<C>,
  key: PropertyKey,
  descriptor: BabelPropertyDescriptor,
): BabelPropertyDescriptor => {
  const {get, set} = makeAccessor(descriptor, klass.__initializers);

  return {
    configurable: true,
    get,
    set(this: C & Required<CorpusculeElement>, value: unknown) {
      const oldValue = get.call(this);
      set.call(this, value);
      this[$internalChangedCallback](key, oldValue, value);
    },
  };
}) as any;

export default internal;
