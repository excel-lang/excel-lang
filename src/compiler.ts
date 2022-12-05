import {
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  NameExpression,
  RangeExpression,
  SheetExpression,
  RowValue,
  ColValue,
  OptionsValue,
  BooleanLiteral,
  NumberLiteral,
  StringLiteral,
  FunctionStatement,
  ModelStatement,
  ExpressionVisitor,
  StatementVisitor
} from "./ast"
import { BinaryOperator, UnaryOperator } from './token'
import {
  Code,
  Function,
  NamedFunction,
  Model
} from './code'
import { Context } from './context'

export class ExpressionCompiler implements ExpressionVisitor {
  public readonly Code: Code

  constructor(code?: Code) {
    this.Code = code ?? new Code()
  }

  public VisitBinaryExpression(expression: BinaryExpression): void {
    expression.Rhs.Accept(this)
    expression.Lhs.Accept(this)
    switch (expression.Op) {
    case BinaryOperator.Or:
      this.Code.WriteOr()
      break
    case BinaryOperator.And:
      this.Code.WriteAnd()
      break
    case BinaryOperator.Eq:
      this.Code.WriteEq()
      break
    case BinaryOperator.Neq:
      this.Code.WriteNeq()
      break
    case BinaryOperator.Lt:
      this.Code.WriteLt()
      break
    case BinaryOperator.Gt:
      this.Code.WriteGt()
      break
    case BinaryOperator.Lte:
      this.Code.WriteLte()
      break
    case BinaryOperator.Gte:
      this.Code.WriteGte()
      break
    case BinaryOperator.Add:
      this.Code.WriteAdd()
      break
    case BinaryOperator.Sub:
      this.Code.WriteSub()
      break
    case BinaryOperator.Mul:
      this.Code.WriteMul()
      break
    case BinaryOperator.Div:
      this.Code.WriteDiv()
      break
    case BinaryOperator.Mod:
      this.Code.WriteMod()
      break
    }
  }

  public VisitUnaryExpression(expression: UnaryExpression): void {
    expression.Expr.Accept(this)
    switch (expression.Op) {
    case UnaryOperator.Not:
      this.Code.WriteNot()
      break
    }
  }

  public VisitCallExpression(expression: CallExpression): void {
    for (let i = expression.Args.length - 1; i >= 0; i--) {
      expression.Args[i].Accept(this)
    }
    expression.Name.Accept(this)
    this.Code.WriteCall(expression.Args.length)
  }

  public VisitNameExpression(expression: NameExpression): void {
    this.Code.WriteName(expression.Name)
  }

  public VisitRangeExpression(expression: RangeExpression): void {
    expression.End.Accept(this)
    expression.Start.Accept(this)
    this.Code.WriteRange()
  }

  public VisitSheetExpression(expression: SheetExpression): void {
    expression.Expr.Accept(this)
    expression.Name.Accept(this)
    this.Code.WriteSheet()
  }

  public VisitRowValue(val: RowValue): void {
    this.Code.WriteRow()
    val.Key.Accept(this)
    this.Code.WriteProperty()
  }

  public VisitColValue(val: ColValue): void {
    this.Code.WriteCol()
  }

  public VisitOptionsValue(val: OptionsValue): void {
    this.Code.WriteOptions()
    val.Key.Accept(this)
    this.Code.WriteProperty()
  }

  public VisitBooleanLiteral(val: BooleanLiteral): void {
    this.Code.WriteBoolean(val.Value)
  }

  public VisitNumberLiteral(val: NumberLiteral): void {
    this.Code.WriteNumber(val.Value)
  }

  public VisitStringLiteral(val: StringLiteral): void {
    this.Code.WriteString(val.Value)
  }
}

export class Compiler implements StatementVisitor {
  public readonly Context: Context

  constructor() {
    this.Context = new Context()
  }

  public VisitFunctionStatement(func: FunctionStatement): void {
    const value = new NamedFunction(func.Name)

    for(const parameter of func.Parameters) {
      value.Parameters.push(parameter)
    }

    const compiler = new ExpressionCompiler(value.Code)
    func.Body.Accept(compiler)

    this.Context.AddFunction(value)
  }

  public VisitModelStatement(model: ModelStatement): void {
    const value = new Model(model.Name)

    for (const option of model.Options) {
      const func = new Function()
      const compiler = new ExpressionCompiler(func.Code)
      option[1].Accept(compiler)
      value.Options[option[0]] = func
    }

    for (const header of model.Headers) {
      const func = new Function()
      const compiler = new ExpressionCompiler(func.Code)
      header[1].Accept(compiler)
      value.Headers[header[0]] = func
    }

    this.Context.AddModel(value)
  }
}
