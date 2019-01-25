declare const createContext: <T>(
  defaultValue?: T,
) => {
  readonly consumer: ClassDecorator;
  readonly provider: ClassDecorator;
  readonly value: PropertyDecorator;
};

export default createContext;
