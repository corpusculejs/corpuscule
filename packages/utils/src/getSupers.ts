/**
 * @module getSupers
 *
 * @import ```typescript
 *
 * import getSupers from '@corpuscule/utils/lib/getSupers'
 * ```
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

/* istanbul ignore next */
const noop = () => {};

/**
 * Extracts all methods mentioned in `names` from the `target`, puts them
 * together into the separate object and returns it. If the method does not
 * exist in the `target`, the function from the `fallbacks` under the same name
 * will be used. If there is no appropriate element in the `target` or the
 * `fallbacks`, the method will be a noop function.
 *
 * @param target a class declaration prototype.
 *
 * @param names a list of names of methods to extract.
 *
 * @param fallbacks a list of fallback functions to replace methods which are
 * missing in the `target`.
 */
export default function getSupers<N extends PropertyKey>(
  target: any,
  names: ReadonlyArray<N>,
  fallbacks: Partial<Record<N, Function>> = {},
): Record<N, Function> {
  return names.reduce(
    (supers, name) => {
      supers[name] = target[name] || fallbacks[name] || noop;

      return supers;
    },
    {} as Record<N, Function>,
  );
}
