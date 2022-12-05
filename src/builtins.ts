import { BaseError } from "./error"
import { Value, ValueType } from "./value"

export interface BuiltInFunction {
  RequiredParameters: ValueType[],
  OptionalParameters?: ValueType[],
  ReturnType: ValueType
}

export interface BuiltInMap {
  [name: string]: BuiltInFunction
}

export const builtInFunctions: BuiltInMap = {
  abs: {
    RequiredParameters: [ValueType.Number],
    ReturnType: ValueType.Number
  }
}

export class InvalidArgsError extends BaseError {}

export class InvalidArgError extends BaseError {
  public readonly Expected: ValueType
  public readonly Actual: ValueType

  constructor(expected: ValueType, actual: ValueType) {
    super(`Expected argument to be ${expected}, instead got ${actual}`)
    this.Expected = expected
    this.Actual = actual
  }
}

export function validateArgsForBuiltIn(name: string, ...args: Value[]): void {
  const builtIn: BuiltInFunction = builtInFunctions[name.toLowerCase()]
  if (args.length < builtIn.RequiredParameters.length)
    throw new InvalidArgsError(`Expected ${builtIn.RequiredParameters.length} arguments, but got ${args.length}`)
  const parameters = builtIn.RequiredParameters.concat(builtIn.OptionalParameters ?? [])
  if (args.length > parameters.length)
    throw new InvalidArgsError(`Expected at most ${parameters.length} arguments, but got ${args.length}`)
  for (const [i, arg] of args.entries()) {
    const parameter = parameters[i]
    if (arg.Type !== parameter) throw new InvalidArgError(parameter, arg.Type)
  }
}

export function getBuiltInReturnType(name: string): ValueType {
  return builtInFunctions[name.toLowerCase()].ReturnType
}

export function isBuiltIn(name: string): boolean {
  return builtInFunctions.hasOwnProperty(name.toLowerCase())
}
