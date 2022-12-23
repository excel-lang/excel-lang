import { BinaryOperator, UnaryOperator, SourcePosition } from "./token"

export interface Expression {
  readonly SourcePosition: SourcePosition
  Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType
}

export class BinaryExpression implements Expression {
  public readonly Lhs: Expression
  public readonly Op: BinaryOperator
  public readonly Rhs: Expression
  public readonly SourcePosition: SourcePosition

  constructor(lhs: Expression, op: BinaryOperator, rhs: Expression, sourcePosition: SourcePosition) {
    this.Lhs = lhs
    this.Op = op
    this.Rhs = rhs
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitBinaryExpression(this)
  }
}

export class UnaryExpression implements Expression {
  public readonly Op: UnaryOperator
  public readonly Expr: Expression
  public readonly SourcePosition: SourcePosition

  constructor(op: UnaryOperator, expr: Expression, sourcePosition: SourcePosition) {
    this.Op = op
    this.Expr = expr
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitUnaryExpression(this)
  }
}

export type CallArgs = Expression[]
export interface CallKwargs {
  [name: string]: Expression
}

export class CallExpression implements Expression {
  public readonly Name: string
  public readonly Args: CallArgs
  public readonly Kwargs: CallKwargs
  public readonly SourcePosition: SourcePosition

  constructor(name: string, args: CallArgs, kwargs: CallKwargs, sourcePosition: SourcePosition) {
    this.Name = name
    this.Args = args
    this.Kwargs = kwargs
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitCallExpression(this)
  }
}

export class NameExpression implements Expression {
  public readonly Name: string
  public readonly SourcePosition: SourcePosition
  
  constructor(name: string, sourcePosition: SourcePosition) {
    this.Name = name
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitNameExpression(this)
  }
}

export class RangeExpression implements Expression {
  public readonly Start: string
  public readonly End: string
  public readonly SourcePosition: SourcePosition

  constructor(start: string, end: string, sourcePosition: SourcePosition) {
    this.Start = start
    this.End = end
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitRangeExpression(this)
  }
}

export class OptionsValue implements Expression {
  public readonly Key: string
  public readonly SourcePosition: SourcePosition

  constructor(key: string, sourcePosition: SourcePosition) {
    this.Key = key
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitOptionsValue(this)
  }
}

export class BooleanLiteral implements Expression {
  public readonly Value: boolean
  public readonly SourcePosition: SourcePosition

  constructor(value: boolean, sourcePosition: SourcePosition) {
    this.Value = value
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitBooleanLiteral(this)
  }
}

export class NumberLiteral implements Expression {
  public readonly Value: number
  public readonly SourcePosition: SourcePosition

  constructor(value: number, sourcePosition: SourcePosition) {
    this.Value = value
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitNumberLiteral(this)
  }
}

export class StringLiteral implements Expression {
  public readonly Value: string
  public readonly SourcePosition: SourcePosition

  constructor(value: string, sourcePosition: SourcePosition) {
    this.Value = value
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitStringLiteral(this)
  }
}

export interface Statement {
  readonly SourcePosition: SourcePosition
  Accept<ReturnType>(visitor: StatementVisitor<ReturnType>): ReturnType
}

export type FunctionParameters = string[]
export type FunctionBody = Expression

export class FunctionStatement implements Statement {
  public readonly Name: string
  public readonly Parameters: FunctionParameters
  public readonly Body: FunctionBody
  public readonly SourcePosition: SourcePosition

  constructor(name: string, parameters: FunctionParameters, body: FunctionBody, sourcePosition: SourcePosition) {
    this.Name = name
    this.Parameters = parameters
    this.Body = body
    this.SourcePosition = sourcePosition
  }

  public get Arity(): number {
    return this.Parameters.length
  }

  public Accept<ReturnType>(visitor: StatementVisitor<ReturnType>): ReturnType {
    return visitor.VisitFunctionStatement(this)
  }
}

export type ModelHeaders = [string, Expression][]

export class ModelStatement implements Statement {
  public readonly Name: string
  public readonly Headers: ModelHeaders
  public readonly SourcePosition: SourcePosition

  constructor(name: string, headers: ModelHeaders, sourcePosition: SourcePosition) {
    this.Name = name
    this.Headers = headers
    this.SourcePosition = sourcePosition
  }

  public Accept<ReturnType>(visitor: StatementVisitor<ReturnType>): ReturnType {
    return visitor.VisitModelStatement(this)
  }
}

export interface ExpressionVisitor<ReturnType> {
  VisitBinaryExpression(expression: BinaryExpression): ReturnType
  VisitUnaryExpression(expression: UnaryExpression): ReturnType
  VisitCallExpression(expression: CallExpression): ReturnType
  VisitNameExpression(expression: NameExpression): ReturnType
  VisitRangeExpression(expression: RangeExpression): ReturnType
  VisitOptionsValue(val: OptionsValue): ReturnType
  VisitBooleanLiteral(val: BooleanLiteral): ReturnType
  VisitNumberLiteral(val: NumberLiteral): ReturnType
  VisitStringLiteral(val: StringLiteral): ReturnType
}

export interface StatementVisitor<ReturnType> {
  VisitFunctionStatement(func: FunctionStatement): ReturnType
  VisitModelStatement(model: ModelStatement): ReturnType
}
