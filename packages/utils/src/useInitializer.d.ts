declare const createInitializerDescriptor: <T = unknown>(initializer: (target: T) => void) => unknown;
export default createInitializerDescriptor;
