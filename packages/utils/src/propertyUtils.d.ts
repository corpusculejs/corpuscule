export const getName: <P extends PropertyKey>(property: P) => P extends number ? number : string;
