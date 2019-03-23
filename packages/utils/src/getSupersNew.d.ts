declare const getSupers: <N extends PropertyKey>(
  target: unknown,
  names: ReadonlyArray<N>,
  fallbacks?: Partial<Record<N, Function>>,
) => Record<N, Function>;

export default getSupers;
