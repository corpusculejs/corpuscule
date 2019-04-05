declare const defineExtendable: <N extends PropertyKey>(
  target: unknown,
  methods: Record<N, Function>,
  supers: Record<N, Function>,
  initializers: Array<(self: unknown) => void>, // tslint:disable-line:readonly-array
) => void;

export default defineExtendable;
