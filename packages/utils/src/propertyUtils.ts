export const getName: {
  (property: number): number;
  (property: symbol | string): string;
} = (property: any) =>
  typeof property === 'symbol' ? property.description : property;
