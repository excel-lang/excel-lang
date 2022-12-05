export enum ValueType {
  Boolean = "boolean",
  String = "string",
  Number = "number",
  Reference = "reference",
  Object = "object",
  Date = "date",
  Null = "null",
  Unknown = "unknown"
}

export interface Value {
  Value: any,
  Type: ValueType
}

export type Values = Value[]

export interface Variables {
  [name: string]: Value
}
