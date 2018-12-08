declare const createContext: <T>(
  defaultValue?: T,
) => {
  readonly consumer: ClassDecorator;
  readonly contextValue: 'contextValue'; // hack to resolve unique symbol widening
  readonly provider: ClassDecorator;
  readonly providingValue: 'providingValue'; // hack to resolve unique symbol widening
};

export default createContext;
