declare const defineExtendable: <N extends PropertyKey>(
  target: unknown,
  methods: Record<N, Function>,
  supers: Record<N, Function>,
) => void;

export default defineExtendable;
