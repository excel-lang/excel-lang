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

export class ASTSerializer implements ExpressionVisitor<string>, StatementVisitor<string> {
  public VisitBinaryExpression(expression: BinaryExpression): string {
    return `(${expression.Lhs.Accept(this)}${expression.Op}${expression.Rhs.Accept(this)})`
  }

  public VisitUnaryExpression(expression: UnaryExpression): string {
    return `(${expression.Op}${expression.Expr.Accept(this)})`
  }

  public VisitCallExpression(expression: CallExpression): string {
    const args = expression.Args.map(arg => arg.Accept(this))
    return `${expression.Name}(${args.join(",")})`
  }

  public VisitNameExpression(expression: NameExpression): string {
    return `${expression.Name}`
  }

  public VisitRangeExpression(expression: RangeExpression): string {
    return `${expression.Start}:${expression.End}`
  }

  public VisitOptionsValue(val: OptionsValue): string {
    return `options.${val.Key}`
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
    const headers = model.Headers.map(([name, expr]) => `'${name}'->${expr.Accept(this)}`).join(",")
    return `model(${model.Name})(${headers})`
  }
}
