import { BinaryOperator, UnaryOperator } from "./token"

export interface ASTNode {
  Accept(visitor: ASTVisitor): unknown
}

export interface Expression extends ASTNode {}

export class BinaryExpression implements Expression {
  public readonly Lhs: Expression
  public readonly Op: BinaryOperator
  public readonly Rhs: Expression

  constructor(lhs: Expression, op: BinaryOperator, rhs: Expression) {
    this.Lhs = lhs
    this.Op = op
    this.Rhs = rhs
  }

  public Accept(visitor: ASTVisitor): unknown {
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

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitUnaryExpression(this)
  }
}

export type CallArgs = Expression[]

export class CallExpression implements Expression {
  public readonly Name: NameExpression
  public readonly Args: CallArgs

  constructor(name: NameExpression, args: CallArgs) {
    this.Name = name
    this.Args = args
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitCallExpression(this)
  }
}

export class NameExpression implements Expression {
  public readonly Name: string
  
  constructor(name: string) {
    this.Name = name
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitNameExpression(this)
  }
}

export class RangeExpression implements Expression {
  public readonly Start: Expression
  public readonly End: Expression

  constructor(start: Expression, end: Expression) {
    this.Start = start
    this.End = end
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitRangeExpression(this)
  }
}

export type SheetName = NameExpression | StringLiteral

export class SheetExpression implements Expression {
  public readonly Name: SheetName
  public readonly Expr: Expression

  constructor(name: SheetName, expr: Expression) {
    this.Name = name
    this.Expr = expr
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitSheetExpression(this)
  }
}

export class RowValue implements Expression {
  public readonly Key: Expression

  constructor(key: Expression) {
    this.Key = key
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitRowValue(this)
  }
}

export class ColValue implements Expression {
  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitColValue(this)
  }
}

export class OptionsValue implements Expression {
  public readonly Key: Expression

  constructor(key: Expression) {
    this.Key = key
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitOptionsValue(this)
  }
}

export class BooleanLiteral implements Expression {
  public readonly Value: boolean

  constructor(value: boolean) {
    this.Value = value
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitBooleanLiteral(this)
  }
}

export class NumberLiteral implements Expression {
  public readonly Value: number

  constructor(value: number) {
    this.Value = value
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitNumberLiteral(this)
  }
}

export class StringLiteral implements Expression {
  public readonly Value: string

  constructor(value: string) {
    this.Value = value
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitStringLiteral(this)
  }
}

export interface Statement extends ASTNode {}

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

  get Arity(): number {
    return this.Parameters.length
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitFunctionStatement(this)
  }
}

export type ModelOptions = [string, Expression][]
export type ModelHeaders = [string, Expression][]

export class ModelStatement implements Statement {
  public readonly Name: string
  public readonly Options: ModelOptions
  public readonly Headers: ModelHeaders

  constructor(name: string, options: ModelOptions, headers: ModelHeaders) {
    this.Name = name
    this.Options = options
    this.Headers = headers
  }

  public Accept(visitor: ASTVisitor): unknown {
    return visitor.VisitModelStatement(this)
  }
}

export interface ExpressionVisitor {
  VisitBinaryExpression(expression: BinaryExpression): unknown
  VisitUnaryExpression(expression: UnaryExpression): unknown
  VisitCallExpression(expression: CallExpression): unknown
  VisitNameExpression(expression: NameExpression): unknown
  VisitRangeExpression(expression: RangeExpression): unknown
  VisitSheetExpression(expression: SheetExpression): unknown
  VisitRowValue(val: RowValue): unknown
  VisitColValue(val: ColValue): unknown
  VisitOptionsValue(val: OptionsValue): unknown
  VisitBooleanLiteral(val: BooleanLiteral): unknown
  VisitNumberLiteral(val: NumberLiteral): unknown
  VisitStringLiteral(val: StringLiteral): unknown
}

export interface ASTVisitor extends ExpressionVisitor {
  VisitFunctionStatement(func: FunctionStatement): unknown
  VisitModelStatement(model: ModelStatement): unknown
}
