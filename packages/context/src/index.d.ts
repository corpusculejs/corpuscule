declare const createContext: <T>(
  defaultValue?: T,
) => {
  readonly consumer: ClassDecorator;
  readonly isProvider: (target: unknown) => boolean;
  readonly provider: ClassDecorator;
  readonly value: PropertyDecorator;
};

export default createContext;
