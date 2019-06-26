declare const defineExtendable: <N extends PropertyKey>(
  target: unknown,
  methods: Record<N, Function>,
  supers: Record<N, Function>,
  initializers: Array<(self: unknown) => void>,
) => void;

export default defineExtendable;
