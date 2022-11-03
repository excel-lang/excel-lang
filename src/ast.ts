import { BinaryOperator, UnaryOperator } from "./token"

export interface ASTNode {
  Accept(visitor: ASTVisitor): void
}

export type Expression =
  BinaryExpression |
  UnaryExpression |
  CallExpression |
  NameReference |
  SheetReference |
  Boolean |
  Number |
  String

export class BinaryExpression implements ASTNode {
  public readonly Lhs: Expression
  public readonly Op: BinaryOperator
  public readonly Rhs: Expression

  constructor(lhs: Expression, op: BinaryOperator, rhs: Expression) {
    this.Lhs = lhs
    this.Op = op
    this.Rhs = rhs
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitBinaryExpression(this)
  }
}

export class UnaryExpression implements ASTNode {
  public readonly Op: UnaryOperator
  public readonly Expr: Expression

  constructor(op: UnaryOperator, expr: Expression) {
    this.Op = op
    this.Expr = expr
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitUnaryExpression(this)
  }
}

export type CallArgs = Expression[]

export class CallExpression implements ASTNode {
  public readonly Name: string
  public readonly Args: CallArgs

  constructor(name: string, args: CallArgs) {
    this.Name = name
    this.Args = args
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitCallExpression(this)
  }
}

export class NameReference implements ASTNode {
  public readonly Name: string
  
  constructor(name: string) {
    this.Name = name
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitNameReference(this)
  }
}

export class SheetReference implements ASTNode {
  public readonly Column: string
  public readonly ColumnEnd?: string
  public readonly Sheet?: string

  constructor(column: string, columnEnd?: string, sheet?: string) {
    this.Column = column
    this.ColumnEnd = columnEnd
    this.Sheet = sheet
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitSheetReference(this)
  }
}

export class BooleanLiteral implements ASTNode {
  public readonly Value: boolean

  constructor(value: boolean) {
    this.Value = value
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitBooleanLiteral(this)
  }
}

export class NumberLiteral implements ASTNode {
  public readonly Value: number

  constructor(value: number) {
    this.Value = value
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitNumberLiteral(this)
  }
}

export class StringLiteral implements ASTNode {
  public readonly Value: string

  constructor(value: string) {
    this.Value = value
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitStringLiteral(this)
  }
}

export type Statement =
  Function |
  Model

export type FunctionParameters = string[]
export type FunctionBody = Expression[]

export class Function implements ASTNode {
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

  Accept(visitor: ASTVisitor): void {
    visitor.VisitFunction(this)
  }
}

export type ModelHeaders = [string, Expression][]

export class Model implements ASTNode {
  public readonly Name: string
  public readonly StartRow: number
  public readonly EndRow: number
  public readonly Headers: ModelHeaders

  constructor(name: string, startRow: number, endRow: number, headers: ModelHeaders) {
    this.Name = name
    this.StartRow = startRow
    this.EndRow = endRow
    this.Headers = headers
  }

  Accept(visitor: ASTVisitor): void {
    visitor.VisitModel(this)
  }
}

export interface ASTVisitor {
  VisitBinaryExpression(expression: BinaryExpression): void
  VisitUnaryExpression(expression: UnaryExpression): void
  VisitCallExpression(expression: CallExpression): void
  VisitNameReference(reference: NameReference): void
  VisitSheetReference(reference: SheetReference): void
  VisitBooleanLiteral(val: BooleanLiteral): void
  VisitNumberLiteral(val: NumberLiteral): void
  VisitStringLiteral(val: StringLiteral): void
  VisitFunction(func: Function): void
  VisitModel(model: Model): void
}
