import {
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  NameExpression,
  RangeExpression,
  OptionsValue,
  BooleanLiteral,
  NumberLiteral,
  StringLiteral,
  FunctionStatement,
  ModelStatement,
  ExpressionVisitor,
  StatementVisitor
} from "./ast"
import { isBuiltIn, createBuiltinCall } from "./builtins"
import { BaseError } from "./error"
import { BinaryOperator, UnaryOperator } from "./token"
import { Type, Value, Values } from "./value"

export interface Functions {
  [name: string]: FunctionStatement
}

export interface Frame {
  Variables: {
    [name: string]: Value
  }
}

export type Stack = Frame[]

export interface Options {
  [name: string]: Value
}

export class CompilerError extends BaseError {}

export class Compiler implements ExpressionVisitor<Value>, StatementVisitor<void> {
  public readonly Options: Options

  private readonly _functions: Functions
  private readonly _stack: Stack

  constructor(options: Options) {
    this.Options = options
    this._functions = {}
    this._stack = []
  }

  public VisitFunctionStatement(func: FunctionStatement): void {
    this._functions[func.Name] = func
  }

  public VisitModelStatement(model: ModelStatement): void {
    
  }

  public VisitBinaryExpression(expression: BinaryExpression): Value {
    const left: Value = expression.Lhs.Accept(this)
    const right: Value = expression.Rhs.Accept(this)
    switch (expression.Op) {
    case BinaryOperator.Or:
      return {
        Value: `OR(${left.Value}, ${right.Value})`,
        Type: Type.Boolean
      }
    case BinaryOperator.And:
      return {
        Value: `AND(${left.Value}, ${right.Value})`,
        Type: Type.Boolean
      }
    case BinaryOperator.Eq:
      return {
        Value: `${left.Value} = ${right.Value}`,
        Type: Type.Boolean
      }
    case BinaryOperator.Neq:
      return {
        Value: `${left.Value} <> ${right.Value}`,
        Type: Type.Boolean
      }
    case BinaryOperator.Lt:
      return {
        Value: `${left.Value} < ${right.Value}`,
        Type: Type.Boolean
      }
    case BinaryOperator.Gt:
      return {
        Value: `${left.Value} > ${right.Value}`,
        Type: Type.Boolean
      }
    case BinaryOperator.Lte:
      return {
        Value: `${left.Value} <= ${right.Value}`,
        Type: Type.Boolean
      }
    case BinaryOperator.Gte:
      return {
        Value: `${left.Value} >= ${right.Value}`,
        Type: Type.Boolean
      }
    case BinaryOperator.Add:
      if (left.Type === Type.Number && right.Type === Type.Number) {
        return {
          Value: `${left.Value} + ${right.Value}`,
          Type: Type.Number
        }
      }
      return {
        Value: `CONCAT(${left.Value}, ${right.Value})`,
        Type: Type.String
      }
    case BinaryOperator.Sub:
      if (left.Type === Type.Number && right.Type === Type.Number) {
        return {
          Value: `${left.Value} - ${right.Value}`,
          Type: Type.Number
        }
      }
      return {
        Value: `SUBSTITUTE(${left.Value}, ${right.Value}, "")`,
        Type: Type.String
      }
    case BinaryOperator.Mul:
      if (right.Type !== Type.Number)
        throw new CompilerError(`Right multiplication operand must be a number, but got ${right.Type}`)
      if (left.Type === Type.Number) {
        return {
          Value: `${left.Value} * ${right.Value}`,
          Type: Type.Number
        }
      }
      return {
        Value: `REPT(${left.Value}, ${right.Value})`,
        Type: Type.String
      }
    case BinaryOperator.Div:
      if (left.Type === Type.Number && right.Type === Type.Number) {
        return {
          Value: `${left.Value} / ${right.Value}`,
          Type: Type.Number
        }
      }
      throw new CompilerError(`Both division operands must be numbers, but got ${left.Type} and ${right.Type}`)
    case BinaryOperator.Mod:
      if (left.Type === Type.Number && right.Type === Type.Number) {
        return {
          Value: `${left.Value} % ${right.Value}`,
          Type: Type.Number
        }
      }
      throw new CompilerError(`Both modulus operands must be numbers, but got ${left.Type} and ${right.Type}`)
    }
  }

  public VisitUnaryExpression(expression: UnaryExpression): Value {
    const expr: Value = expression.Expr.Accept(this)
    switch (expression.Op) {
    case UnaryOperator.Not:
      return {
        Value: `NOT(${expr.Value})`,
        Type: Type.Boolean
      }
    }
  }

  public VisitCallExpression(expression: CallExpression): Value {
    const args: Values = expression.Args.map(arg => arg.Accept(this))
    if (this._functions.hasOwnProperty(expression.Name)) {

    } else if (isBuiltIn(expression.Name)) {
      return createBuiltinCall(expression.Name, args)
    }
    throw new CompilerError(`${expression.Name} is not a function`)
  }

  public VisitNameExpression(expression: NameExpression): Value {
    if (this.CurrentFrame.Variables.hasOwnProperty(expression.Name)) {
      return this.CurrentFrame.Variables[expression.Name]
    }
    return {
      Value: expression.Name,
      Type: Type.Cell
    }
  }

  public VisitRangeExpression(expression: RangeExpression): Value {
    return {
      Value: `${expression.Start}:${expression.End}`,
      Type: Type.Range
    }
  }

  public VisitOptionsValue(val: OptionsValue): Value {
    return this.Options[val.Key]
  }

  public VisitBooleanLiteral(val: BooleanLiteral): Value {
    return {
      Value: (val.Value) ? "TRUE" : "FALSE",
      Type: Type.Boolean
    }
  }

  public VisitNumberLiteral(val: NumberLiteral): Value {
    return {
      Value: val.Value,
      Type: Type.Number
    }
  }

  public VisitStringLiteral(val: StringLiteral): Value {
    return {
      Value: `"${val.Value}"`,
      Type: Type.String
    }
  }

  private get CurrentFrame() {
    return this._stack[this._stack.length - 1]
  }
}
