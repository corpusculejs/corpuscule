/**
 * A workaround for a Corpuscule-decorated class inheritance. Corpuscule
 * decorators applied to a class override user-defined Custom Elements
 * lifecycle hooks like `connectedCallback` etc. creating an internal worker
 * method which is necessary for Corpuscule elements to work correctly.
 * However, if the user wants to extend the class, the wrapper is unnecessary
 * and could cause undefined behavior and harm the runtime execution.
 *
 * This function is a solution to this problem. It replaces a lifecycle hook
 * with a wrapper that calls two different methods depending on whether the
 * class is extended or not. If the class is not extended, the Corpuscule
 * worker is called; otherwise, the original user-defined method is used.
 *
 * @param target a class declaration which lifecycle hooks should be redefined
 * to be extendable.
 *
 * @param methods an object with methods that should be used in case the class
 * is not extended.
 *
 * @param supers an object with methods that should be used in case the class
 * is extended.
 *
 * @param initializers an array of functions to register the function to
 * execute during the class instantiation.
 */
const defineExtendable = <N extends PropertyKey>(
  target: any,
  methods: Record<N, Function>,
  supers: Record<N, Function>,
  initializers: Array<(self: object) => void>,
): void =>
  Reflect.ownKeys(methods).forEach(key => {
    const selfKey = Symbol();

    target.prototype[key] = function(this: any, ...args: any[]): void {
      this[selfKey](...args);
    };

    initializers.push(self => {
      self[selfKey] = self.constructor !== target ? supers[key] : methods[key];
    });
  });

export default defineExtendable;
