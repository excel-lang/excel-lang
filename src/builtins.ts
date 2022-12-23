import { BaseError } from "./error"
import { Type, Value, Values, ValueMap } from "./value"

export interface BuiltInFunction {
  RequiredParameters: Type[],
  OptionalParameters?: Map<string, Type>,
  ReturnType: Type
}

export interface BuiltInMap {
  [name: string]: BuiltInFunction
}

function createOptionalParameters(parameters: [string, Type][]): Map<string, Type> {
  const parameterMap = new Map<string, Type>
  for (const [name, type] of parameters) {
    parameterMap.set(name, type)
  }
  return parameterMap
}

export const builtInFunctions: BuiltInMap = {
  ABS: {
    RequiredParameters: [Type.Number],
    ReturnType: Type.Number
  },
  ACOS: {
    RequiredParameters: [Type.Number],
    ReturnType: Type.Number
  },
  ACOSH: {
    RequiredParameters: [Type.Number],
    ReturnType: Type.Number
  },
  ADDRESS: {
    RequiredParameters: [Type.Number, Type.Number],
    OptionalParameters: createOptionalParameters([
      ["abs_num", Type.Number],
      ["A1", Type.Boolean],
      ["sheet_text", Type.String]
    ]),
    ReturnType: Type.Reference
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

export function createBuiltinCall(name: string, args: Values, kwargs: ValueMap): Value {
  name = name.toUpperCase()
  const finalArgs: string[] = []
  const builtIn: BuiltInFunction = builtInFunctions[name]
  if (!builtIn)
    throw new Error(`${name} is not a built-in function`)
  if (args.length < builtIn.RequiredParameters.length)
    throw new InvalidArgsError(`Expected ${builtIn.RequiredParameters.length} arguments, but got ${args.length}`)
  if (args.length > builtIn.RequiredParameters.length)
    throw new InvalidArgsError(`Expected at most ${builtIn.RequiredParameters.length} arguments, but got ${args.length}`)
  for (const [i, arg] of args.entries()) {
    const parameter = builtIn.RequiredParameters[i]
    if (arg.Type !== parameter) throw new InvalidArgError(parameter, arg.Type)
    finalArgs.push(arg.Value)
  }
  if (builtIn.OptionalParameters) {
    for (const [name, parameter] of builtIn.OptionalParameters.entries()) {
      if (!kwargs.hasOwnProperty(name)) {
        finalArgs.push("")
      } else {
        const arg = kwargs[name]
        if (arg.Type !== parameter) throw new InvalidArgError(parameter, arg.Type)
        finalArgs.push(arg.Value)
      }
    }
  }
  return {
    Value: `${name.toUpperCase()}(${finalArgs.join(",")})`,
    Type: builtIn.ReturnType
  }
}
