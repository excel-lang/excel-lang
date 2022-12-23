export enum Type {
  Boolean = "boolean",
  String = "string",
  Number = "number",
  Reference = "reference",
  Null = "null",
  Any = "any"
}

export function isPrimitiveType(type: string) {
  return type !== Type.Reference
}

export interface Value {
  Value: any,
  Type: Type
}

export type Values = Value[]

export interface ValueMap {
  [name: string]: Value
}
