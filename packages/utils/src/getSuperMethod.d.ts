declare const getSuperMethod: (name: string, elements: ReadonlyArray<unknown>) => (target: unknown) => void;

export default getSuperMethod;
