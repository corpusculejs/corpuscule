import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

export interface AssertOptions {
  readonly correct?: boolean;
  readonly customMessage?: string;
}

export enum Kinds {
  Accessor,
  Class,
  Field,
  Method,
}

export enum Placements {
  Own,
  Prototype,
  Static,
}

export const assertKind: (
  decoratorName: string,
  types: number,
  descriptor: ExtendedPropertyDescriptor,
) => void;

export const assertPlacement: (
  decoratorName: string,
  types: number,
  descriptor: ExtendedPropertyDescriptor,
) => void;

export const assertRequiredProperty: {
  (decoratorName: string, markerName: string, propertyName: string, property: unknown): void;
  (decoratorName: string, markerName: string, property: unknown): void;
};
