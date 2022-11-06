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
  ASTVisitor
} from "./ast"

export class ASTSerializer implements ASTVisitor {
  public VisitBinaryExpression(expression: BinaryExpression): string {
    return `(${expression.Lhs.Accept(this)}${expression.Op}${expression.Rhs.Accept(this)})`
  }

  public VisitUnaryExpression(expression: UnaryExpression): string {
    return `(${expression.Op}${expression.Expr.Accept(this)})`
  }

  public VisitCallExpression(expression: CallExpression): string {
    const args = expression.Args.map(arg => arg.Accept(this))
    return `${expression.Name.Accept(this)}(${args.join(",")})`
  }

  public VisitNameExpression(expression: NameExpression): string {
    return `${expression.Name}`
  }

  public VisitRangeExpression(expression: RangeExpression): string {
    return `{${expression.Start.Accept(this)}:${expression.End.Accept(this)}}`
  }

  public VisitSheetExpression(expression: SheetExpression): string {
    return `${expression.Name.Accept(this)}[${expression.Expr.Accept(this)}]`
  }

  public VisitRowValue(val: RowValue): string {
    return `row[${val.Key.Accept(this)}]`
  }

  public VisitColValue(val: ColValue): string {
    return "col"
  }

  public VisitOptionsValue(val: OptionsValue): unknown {
    return `options[${val.Key.Accept(this)}]`
  }

  public VisitBooleanLiteral(val: BooleanLiteral): string {
    return `${val.Value ? "True" : "False"}`
  }

  public VisitNumberLiteral(val: NumberLiteral): string {
    return `${val.Value}`
  }

  public VisitStringLiteral(val: StringLiteral): string {
    return `'${val.Value}'`
  }

  public VisitFunctionStatement(func: FunctionStatement): string {
    return `fn(${func.Name})(${func.Parameters.join(",")})(${func.Body.Accept(this)})`
  }

  public VisitModelStatement(model: ModelStatement): string {
    const options = model.Options.map(([name, expr]) => `${name}->${expr.Accept(this)}`).join(",")
    const headers = model.Headers.map(([name, expr]) => `'${name}'->${expr.Accept(this)}`).join(",")
    return `model(${model.Name})(${options})(${headers})`
  }
}
