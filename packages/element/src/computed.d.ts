export interface ComputingEntanglement {
  readonly computed: MethodDecorator;
  readonly observe: PropertyDecorator;
}

declare const createComputingEntanglement: () => ComputingEntanglement;
export default createComputingEntanglement;
