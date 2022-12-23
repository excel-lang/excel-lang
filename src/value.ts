export enum PrimitiveType {
  Boolean = "boolean",
  String = "string",
  Number = "number",
  Null = "null"
}

export enum ReferenceType {
  Cell = "cell",
  Range = "range",
  Sheet = "sheet"
}

export const Type = {
  ...PrimitiveType,
  ...ReferenceType
}
export type Type =
  PrimitiveType |
  ReferenceType

export function isPrimitiveType(type: string) {
  return Object.values<string>(PrimitiveType).includes(type)
}

export function isReferenceType(type: string) {
  return Object.values<string>(ReferenceType).includes(type)
}

export interface Value {
  Value: any,
  Type: Type
}

export type Values = Value[]

export interface Variables {
  [name: string]: Value
}
