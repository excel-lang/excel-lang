import { BaseError } from "./error"
import { Type, Value, Values } from "./value"

export interface BuiltInFunction {
  RequiredParameters: Type[],
  OptionalParameters?: Type[],
  ReturnType: Type
}

export interface BuiltInMap {
  [name: string]: BuiltInFunction
}

export const builtInFunctions: BuiltInMap = {
  ABS: {
    RequiredParameters: [Type.Number],
    ReturnType: Type.Number
  }
}

export class InvalidArgsError extends BaseError {}

export class InvalidArgError extends BaseError {
  public readonly Expected: Type
  public readonly Actual: Type

  constructor(expected: Type, actual: Type) {
    super(`Expected argument to be ${expected}, instead got ${actual}`)
    this.Expected = expected
    this.Actual = actual
  }
}

export function isBuiltIn(name: string): boolean {
  return builtInFunctions.hasOwnProperty(name.toUpperCase())
}

export function createBuiltinCall(name: string, args: Values): Value {
  name = name.toUpperCase()
  const builtIn: BuiltInFunction = builtInFunctions[name]
  if (args.length < builtIn.RequiredParameters.length)
    throw new InvalidArgsError(`Expected ${builtIn.RequiredParameters.length} arguments, but got ${args.length}`)
  const parameters = builtIn.RequiredParameters.concat(builtIn.OptionalParameters ?? [])
  if (args.length > parameters.length)
    throw new InvalidArgsError(`Expected at most ${parameters.length} arguments, but got ${args.length}`)
  for (const [i, arg] of args.entries()) {
    const parameter = parameters[i]
    if (arg.Type !== parameter) throw new InvalidArgError(parameter, arg.Type)
  }
  return {
    Value: `${name.toUpperCase()}(${args.map(arg => arg.Value).join(",")})`,
    Type: builtIn.ReturnType
  }
}
