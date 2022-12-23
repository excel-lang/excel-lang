import { BinaryOperator, UnaryOperator } from "./token"

export interface ASTNode<VisitorType> {
  Accept(visitor: VisitorType): unknown
}

export interface Expression {
  Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType
}

export class BinaryExpression implements Expression {
  public readonly Lhs: Expression
  public readonly Op: BinaryOperator
  public readonly Rhs: Expression

  constructor(lhs: Expression, op: BinaryOperator, rhs: Expression) {
    this.Lhs = lhs
    this.Op = op
    this.Rhs = rhs
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitBinaryExpression(this)
  }
}

export class UnaryExpression implements Expression {
  public readonly Op: UnaryOperator
  public readonly Expr: Expression

  constructor(op: UnaryOperator, expr: Expression) {
    this.Op = op
    this.Expr = expr
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitUnaryExpression(this)
  }
}

export type CallArgs = Expression[]

export class CallExpression implements Expression {
  public readonly Name: string
  public readonly Args: CallArgs

  constructor(name: string, args: CallArgs) {
    this.Name = name
    this.Args = args
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitCallExpression(this)
  }
}

export class NameExpression implements Expression {
  public readonly Name: string
  
  constructor(name: string) {
    this.Name = name
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitNameExpression(this)
  }
}

export class RangeExpression implements Expression {
  public readonly Start: string
  public readonly End: string

  constructor(start: string, end: string) {
    this.Start = start
    this.End = end
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitRangeExpression(this)
  }
}

export class OptionsValue implements Expression {
  public readonly Key: string

  constructor(key: string) {
    this.Key = key
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitOptionsValue(this)
  }
}

export class BooleanLiteral implements Expression {
  public readonly Value: boolean

  constructor(value: boolean) {
    this.Value = value
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitBooleanLiteral(this)
  }
}

export class NumberLiteral implements Expression {
  public readonly Value: number

  constructor(value: number) {
    this.Value = value
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitNumberLiteral(this)
  }
}

export class StringLiteral implements Expression {
  public readonly Value: string

  constructor(value: string) {
    this.Value = value
  }

  public Accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.VisitStringLiteral(this)
  }
}

export interface Statement {
  Accept<ReturnType>(visitor: StatementVisitor<ReturnType>): ReturnType
}

export type FunctionParameters = string[]
export type FunctionBody = Expression

export class FunctionStatement implements Statement {
  public readonly Name: string
  public readonly Parameters: FunctionParameters
  public readonly Body: FunctionBody

  constructor(name: string, parameters: FunctionParameters, body: FunctionBody) {
    this.Name = name
    this.Parameters = parameters
    this.Body = body
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

  constructor(name: string, headers: ModelHeaders) {
    this.Name = name
    this.Headers = headers
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
