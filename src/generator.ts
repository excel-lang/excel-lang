import { validateArgsForBuiltIn, getBuiltInReturnType, isBuiltIn } from './builtins'
import { Function, OpCode } from "./code"
import { Context } from "./context"
import { BaseError } from "./error"
import { Stack } from "./stack"
import { Value, Values, ValueType } from "./value"

export class GeneratorError extends BaseError {}

export class Generator {
  private readonly _context: Context
  private readonly _stack: Stack

  constructor(context: Context) {
    this._context = context
    this._stack = new Stack()
  }

  public Evaluate() {}

  private GenerateFormula(func: Function, ...args: Values): Value {
    this._stack.PushFrame()

    for (const [i, parameter] of func.Parameters.entries()) {
      this._stack.CurrentFrame.SetVariable(parameter, args[i] ?? {
        Vaue: "NULL",
        Type: ValueType.Null
      })
    }

    for (const instruction of func.Code.Instructions) {
      switch (instruction.OpCode) {
      case OpCode.Boolean:
        this._stack.CurrentFrame.Push({
          Value: instruction.Args[0] ? "TRUE" : "FALSE",
          Type: ValueType.Boolean
        })
        break
      case OpCode.Number:
        this._stack.CurrentFrame.Push({
          Value: instruction.Args[0],
          Type: ValueType.Number
        })
        break
      case OpCode.String:
        this._stack.CurrentFrame.Push({
          Value: `"${instruction.Args[0]}"`,
          Type: ValueType.String
        })
        break
      case OpCode.Call: {
        const nArgs: number = instruction.Args[0]
        const [name, ...args]: Values = this._stack.CurrentFrame.Pop(nArgs + 1)
        if (!this._context.IsFunction(name.Value)) {
          if (!isBuiltIn(name.Value))
            throw new GeneratorError(`${name.Value} is not a user defined function or an Excel function`)
          validateArgsForBuiltIn(name.Value)  
          this._stack.CurrentFrame.Push({
            Value: `${name}(${args.map(arg => arg.Value).join(',')})`,
            Type: getBuiltInReturnType(name.Value)
          })
        } else {
          this.GenerateFormula(this._context.GetFunction(name.Value), ...args)
        }
        break
      }
      case OpCode.Or:
        this.GenerateSimpleFunctionCall("OR", 2, ValueType.Boolean)
        break
      case OpCode.And:
        this.GenerateSimpleFunctionCall("AND", 2, ValueType.Boolean)
        break
      case OpCode.Eq:
        this.GenerateSimpleBinaryExpression("=", ValueType.Boolean)
        break
      case OpCode.Neq:
        this.GenerateSimpleBinaryExpression("<>", ValueType.Boolean)
        break
      case OpCode.Lt:
        this.GenerateSimpleBinaryExpression("<", ValueType.Boolean)
        break
      case OpCode.Gt:
        this.GenerateSimpleBinaryExpression(">", ValueType.Boolean)
        break
      case OpCode.Lte:
        this.GenerateSimpleBinaryExpression("<=", ValueType.Boolean)
        break
      case OpCode.Gte:
        this.GenerateSimpleBinaryExpression(">=", ValueType.Boolean)
        break
      case OpCode.Add: {
        const [left, right]: Values = this._stack.CurrentFrame.Pop(2)
        if (left.Type === ValueType.Number && right.Type === ValueType.Number) {
          this._stack.CurrentFrame.Push({
            Value: `${left.Value} + ${right.Value}`,
            Type: ValueType.Number
          })
        } else {
          this._stack.CurrentFrame.Push({
            Value: `CONCAT(${left.Value}, ${right.Value})`,
            Type: ValueType.String
          })
        }
        break
      }
      case OpCode.Sub: {
        const [left, right]: Values = this._stack.CurrentFrame.Pop(2)
        if (left.Type === ValueType.Number && right.Type === ValueType.Number) {
          this._stack.CurrentFrame.Push({
            Value: `${left.Value} - ${right.Value}`,
            Type: ValueType.Number
          })
        } else {
          this._stack.CurrentFrame.Push({
            Value: `SUBSTITUTE(${left.Value}, ${right.Value}, "")`,
            Type: ValueType.String
          })
        }
        break
      }
      case OpCode.Mul: {
        const [left, right]: Values = this._stack.CurrentFrame.Pop(2)
        if (right.Type === ValueType.Number) {
          if (left.Type === ValueType.Number) {
            this._stack.CurrentFrame.Push({
              Value: `${left.Value} * ${right.Value}`,
              Type: ValueType.Number
            })
          } else {
            this._stack.CurrentFrame.Push({
              Value: `REPT(${left.Value}, ${right.Value})`,
              Type: ValueType.String
            })
          }
        } else {
          throw new GeneratorError(`Right multiplication operand must be a number, but got ${right.Type}`)
        }
        break
      }
      case OpCode.Div: {
        const [left, right]: Values = this._stack.CurrentFrame.Pop(2)
        if (left.Type === ValueType.Number && right.Type === ValueType.Number) {
          this._stack.CurrentFrame.Push({
            Value: `${left.Value} / ${right.Value}`,
            Type: ValueType.Number
          })
        } else {
          throw new GeneratorError(`Both division operands must be numbers, but got ${left.Type} and ${right.Type}`)
        }
        break
      }
      case OpCode.Mod: {
        const [left, right]: Values = this._stack.CurrentFrame.Pop(2)
        if (left.Type === ValueType.Number && right.Type === ValueType.Number) {
          this._stack.CurrentFrame.Push({
            Value: `${left.Value} % ${right.Value}`,
            Type: ValueType.Number
          })
        } else {
          throw new GeneratorError(`Both modulus operands must be numbers, but got ${left.Type} and ${right.Type}`)
        }
        break
      }
      case OpCode.Not:
        this.GenerateSimpleFunctionCall("NOT", 1, ValueType.Boolean)
        break
      }
    }

    const [ret]: Value[] = this._stack.CurrentFrame.Pop(1)
    this._stack.PopFrame()
    return ret
  }

  private GenerateSimpleFunctionCall(name: string, nArgs: number, type: ValueType) {
    const args: Values = this._stack.CurrentFrame.Pop(nArgs)
    this._stack.CurrentFrame.Push({
      Value: `${name}(${args.map(arg => arg.Value).join(",")})`,
      Type: type
    })
  }

  private GenerateSimpleBinaryExpression(op: string, type: ValueType): void {
    const [left, right]: Values = this._stack.CurrentFrame.Pop(2)
    this._stack.CurrentFrame.Push({
      Value: `${left.Value} ${op} ${right.Value}`,
      Type: type
    })
  }
}
