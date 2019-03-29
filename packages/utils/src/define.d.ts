export const defaultDescriptor: PropertyDescriptor;

declare const define: {
  <N extends PropertyKey>(target: unknown, props: Record<N, unknown>): void;
  readonly raw: <N extends PropertyKey>(
    target: unknown,
    props: Record<N, PropertyDescriptor>,
  ) => void;
};

export default define;
