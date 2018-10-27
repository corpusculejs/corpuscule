export interface ComputingPair {
  readonly computed: MethodDecorator;
  readonly observe: PropertyDecorator;
}

declare const createComputingPair: () => ComputingPair;
export default createComputingPair;
