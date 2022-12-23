import {
  Expression,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  CallArgs,
  NameExpression,
  RangeExpression,
  OptionsValue,
  BooleanLiteral,
  NumberLiteral,
  StringLiteral,
  Statement,
  FunctionStatement,
  FunctionParameters,
  FunctionBody,
  ModelStatement,
  ModelHeaders
} from "./ast"
import { BaseError } from "./error"
import { Scanner } from "./scanner"
import {
  isUnaryOperator,
  UnaryOperator,
  isEqualityOperator,
  EqualityOperator,
  isComparisonOperator,
  ComparisonOperator,
  TokenType,
  Token
} from "./token"

export class ParseError extends BaseError {
  public readonly Token: Token

  constructor(token: Token, message: string) {
    super(message)
    this.Token = token
  }
}

export class Parser {
  private readonly _scanner: Scanner

  constructor(input: string) {
    this._scanner = new Scanner(input)
  }

  public Parse(): Statement | null {
    const token: Token = this._scanner.Scan()
    switch (token.Type) {
    case TokenType.Function:
      return this.ParseFunction()
    case TokenType.Model:
      return this.ParseModel()
    case TokenType.EOF:
      return null
    default:
      throw new ParseError(token, `Unexpected Token: ${token.Type}. Expected function or model declaration.`)
    }
  }

  public ParseExpression() : Expression {
    return this.ParseLogicalOrExpressions()
  }

  private ParseFunction(): FunctionStatement {
    const name: string = this.Expect(TokenType.Name).Literal

    const parameters: FunctionParameters = []
    this.Expect(TokenType.LParen)
    if (!this.Match(TokenType.RParen)) {
      do {
        parameters.push(this.Expect(TokenType.Name).Literal)
      } while (this.Match(TokenType.Comma))
      this.Expect(TokenType.RParen)
    }

    this.Expect(TokenType.Arrow)
    const body: FunctionBody = this.ParseExpression()

    return new FunctionStatement(name, parameters, body)
  }

  private ParseModel(): ModelStatement {
    const name: string = this.Expect(TokenType.Name).Literal

    this.Expect(TokenType.LBrace)
    const headers: ModelHeaders = []
    do {
      const header: string = this.Expect(TokenType.String).Literal
      this.Expect(TokenType.Arrow)
      const expr: Expression = this.ParseExpression()
      headers.push([header, expr])
    } while (this.Match(TokenType.Comma))
    this.Expect(TokenType.RBrace)

    return new ModelStatement(name, headers)
  }

  private ParseLogicalOrExpressions(): Expression {
    let expr = this.ParseLogicalAndExpressions()
    while (this.Match(TokenType.Or)) {
      const rhs: Expression = this.ParseLogicalAndExpressions()
      expr = new BinaryExpression(expr, TokenType.Or, rhs)
    }
    return expr
  }

  private ParseLogicalAndExpressions(): Expression {
    let expr = this.ParseEqualityExpressions()
    while (this.Match(TokenType.And)) {
      const rhs: Expression = this.ParseEqualityExpressions()
      expr = new BinaryExpression(expr, TokenType.And, rhs)
    }
    return expr
  }

  private ParseEqualityExpressions(): Expression {
    let expr = this.ParseComparisonExpressions()
    while (this.MatchPredicate(type => isEqualityOperator(type))) {
      const op: EqualityOperator = this._scanner.CurrentToken.Type as EqualityOperator
      const rhs: Expression = this.ParseComparisonExpressions()
      expr = new BinaryExpression(expr, op, rhs)
    }
    return expr
  }

  private ParseComparisonExpressions(): Expression {
    let expr = this.ParseSubtractionExpressions()
    while (this.MatchPredicate(type => isComparisonOperator(type))) {
      const op: ComparisonOperator = this._scanner.CurrentToken.Type as ComparisonOperator
      const rhs: Expression = this.ParseSubtractionExpressions()
      expr = new BinaryExpression(expr, op, rhs)
    }
    return expr
  }

  private ParseSubtractionExpressions(): Expression {
    let expr = this.ParseAdditionExpressions()
    while (this.Match(TokenType.Sub)) {
      const rhs: Expression = this.ParseAdditionExpressions()
      expr = new BinaryExpression(expr, TokenType.Sub, rhs)
    }
    return expr
  }

  private ParseAdditionExpressions(): Expression {
    let expr = this.ParseDivisionExpressions()
    while (this.Match(TokenType.Add)) {
      const rhs: Expression = this.ParseDivisionExpressions()
      expr = new BinaryExpression(expr, TokenType.Add, rhs)
    }
    return expr
  }

  private ParseDivisionExpressions() : Expression {
    let expr = this.ParseMultiplicationExpressions()
    while (this.Match(TokenType.Div)) {
      const rhs: Expression = this.ParseMultiplicationExpressions()
      expr = new BinaryExpression(expr, TokenType.Div, rhs)
    }
    return expr
  }

  private ParseMultiplicationExpressions(): Expression {
    let expr = this.ParseUnaryExpression()
    while (this.Match(TokenType.Mul)) {
      const rhs: Expression = this.ParseUnaryExpression()
      expr = new BinaryExpression(expr, TokenType.Mul, rhs)
    }
    return expr
  }

  private ParseUnaryExpression() : Expression {
    if (this.MatchPredicate(type => isUnaryOperator(type))) {
      const op: UnaryOperator = this._scanner.CurrentToken.Type as UnaryOperator
      const expr: Expression = this.ParseUnaryExpression()
      return new UnaryExpression(op, expr)
    }
    return this.ParseOperandExpressions()
  }

  private ParseOperandExpressions() : Expression {
    if (this.Match(TokenType.Name)) {
      const name: string = this._scanner.CurrentToken.Literal
      if (this.Match(TokenType.LParen)) {
        const args: CallArgs = []
        if (!this.Match(TokenType.RParen)) {
          do {
            args.push(this.ParseExpression())
          } while (this.Match(TokenType.Comma))
          this.Expect(TokenType.RParen)
        }
        return new CallExpression(name, args)
      } else if (this.Match(TokenType.Colon)) {
        return new RangeExpression(name, this.Expect(TokenType.Name).Literal)
      }
      return new NameExpression(name)
    } else if (this.Match(TokenType.Number)) {
      return new NumberLiteral(parseFloat(this._scanner.CurrentToken.Literal))
    } else if (this.Match(TokenType.String)) {
      return new StringLiteral(this._scanner.CurrentToken.Literal)
    } else if (this.Match(TokenType.True)) {
      return new BooleanLiteral(true)
    } else if (this.Match(TokenType.False)) {
      return new BooleanLiteral(false)
    } else if (this.Match(TokenType.Options)) {
      this.Expect(TokenType.Period)
      const key: string = this.Expect(TokenType.Name).Literal
      return new OptionsValue(key)
    } else if (this.Match(TokenType.LParen)) {
      const expr: Expression = this.ParseExpression()
      this.Expect(TokenType.RParen)
      return expr
    }

    throw new ParseError(this._scanner.CurrentToken, `Unexpected Token: ${this._scanner.CurrentToken.Type}`)
  }

  private Expect(type: TokenType): Token {
    const token: Token = this._scanner.Scan()
    if (token.Type !== type) throw new ParseError(token, `Expected ${type}, got ${token.Type}`)
    return token
  }

  private Match(type: TokenType): boolean {
    if (this._scanner.NextToken.Type !== type) return false
    this._scanner.Scan()
    return true
  }

  private MatchPredicate(predicate: (type: TokenType) => boolean) {
    if (!predicate(this._scanner.NextToken.Type)) return false
    this._scanner.Scan()
    return true
  }
}
