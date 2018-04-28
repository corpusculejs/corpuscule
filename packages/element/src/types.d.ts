export interface PropertiesList {
  [name: string]: any; // tslint:disable-line:readonly-keyword
}

export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}

export const enum InvalidationType {
  Mounting = 'mounting',
  Props = 'props',
  State = 'state',
}

export type AttributeConverter = (value: string | null) => any;
