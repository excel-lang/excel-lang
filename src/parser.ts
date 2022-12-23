import {
  Expression,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  CallArgs,
  CallKwargs,
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
  isBinaryOperator,
  BinaryOperator,
  precedenceMap,
  isUnaryOperator,
  UnaryOperator,
  isEqualityOperator,
  EqualityOperator,
  isComparisonOperator,
  ComparisonOperator,
  TokenType,
  Token,
  SourcePosition,
  spanSourcePosition
} from "./token"

export type ParseResult = Statement | null

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

  public Parse(): ParseResult {
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
    return this.ParseExpressionRecursive(this.ParseUnaryExpression(), 0)
  }

  private ParseFunction(): FunctionStatement {
    const position: SourcePosition = this._scanner.CurrentToken.SourcePosition
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

    return new FunctionStatement(name, parameters, body, this.SpanFromStart(position))
  }

  private ParseModel(): ModelStatement {
    const name: string = this.Expect(TokenType.Name).Literal
    const position: SourcePosition = this._scanner.CurrentToken.SourcePosition

    this.Expect(TokenType.LBrace)
    const headers: ModelHeaders = []
    do {
      const header: string = this.Expect(TokenType.String).Literal
      this.Expect(TokenType.Arrow)
      const expr: Expression = this.ParseExpression()
      headers.push([header, expr])
    } while (this.Match(TokenType.Comma))
    this.Expect(TokenType.RBrace)

    return new ModelStatement(name, headers, this.SpanFromStart(position))
  }

  private ParseExpressionRecursive(lhs: Expression, minPrecedence: number): Expression {
    while (this.MatchPredicate(type =>
      isBinaryOperator(type) &&
      precedenceMap[type as BinaryOperator] >= minPrecedence)
    ) {
      const start: SourcePosition = this._scanner.CurrentToken.SourcePosition
      const op: TokenType = this._scanner.CurrentToken.Type
      let rhs: Expression = this.ParseUnaryExpression()
      if (this.PeekPredicate(type => 
        isBinaryOperator(type) &&
        precedenceMap[type as BinaryOperator] > precedenceMap[op as BinaryOperator])
      ) {
        rhs = this.ParseExpressionRecursive(rhs, precedenceMap[op as BinaryOperator] + 1)
      }
      lhs = new BinaryExpression(
        lhs, op as BinaryOperator, rhs, spanSourcePosition(start, this._scanner.CurrentToken.SourcePosition))
    }
    return lhs
  }

  private ParseUnaryExpression() : Expression {
    if (this.MatchPredicate(type => isUnaryOperator(type))) {
      const position: SourcePosition = this._scanner.CurrentToken.SourcePosition
      const op: UnaryOperator = this._scanner.CurrentToken.Type as UnaryOperator
      const expr: Expression = this.ParseUnaryExpression()
      return new UnaryExpression(op, expr, this.SpanFromStart(position))
    }
    return this.ParseOperandExpressions()
  }

  private ParseOperandExpressions() : Expression {
    if (this.Match(TokenType.Name)) {
      const position: SourcePosition = this._scanner.CurrentToken.SourcePosition
      const name: string = this._scanner.CurrentToken.Literal
      if (this.Match(TokenType.LParen)) {
        const args: CallArgs = []
        const kwargs: CallKwargs = {}
        let hasKwargs: boolean = false
        if (!this.Match(TokenType.RParen)) {
          do {
            if (this.Match(TokenType.LBrace)) {
              hasKwargs = true
              break
            } else {
              args.push(this.ParseExpression())
            }
          } while (this.Match(TokenType.Comma))
          if (hasKwargs) {
            do {
              const name: string = this.Expect(TokenType.Name).Literal
              this.Expect(TokenType.Eq)
              kwargs[name] = this.ParseExpression()
            } while (this.Match(TokenType.Comma))
            this.Expect(TokenType.RBrace)
          }
          this.Expect(TokenType.RParen)
        }
        return new CallExpression(name, args, kwargs, this.SpanFromStart(position))
      } else if (this.Match(TokenType.Colon)) {
        return new RangeExpression(name, this.Expect(TokenType.Name).Literal, this.SpanFromStart(position))
      }
      return new NameExpression(name, position)
    } else if (this.Match(TokenType.Number)) {
      return new NumberLiteral(parseFloat(this._scanner.CurrentToken.Literal), this._scanner.CurrentToken.SourcePosition)
    } else if (this.Match(TokenType.String)) {
      return new StringLiteral(this._scanner.CurrentToken.Literal, this._scanner.CurrentToken.SourcePosition)
    } else if (this.Match(TokenType.True)) {
      return new BooleanLiteral(true, this._scanner.CurrentToken.SourcePosition)
    } else if (this.Match(TokenType.False)) {
      return new BooleanLiteral(false, this._scanner.CurrentToken.SourcePosition)
    } else if (this.Match(TokenType.Options)) {
      this.Expect(TokenType.Period)
      const key: string = this.Expect(TokenType.Name).Literal
      return new OptionsValue(key, this.SpanFromStart(this._scanner.CurrentToken.SourcePosition))
    } else if (this.Match(TokenType.LParen)) {
      const expr: Expression = this.ParseExpression()
      this.Expect(TokenType.RParen)
      return expr
    }

    throw new ParseError(this._scanner.NextToken, `Unexpected Token: ${this._scanner.NextToken.Type}`)
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

  private PeekPredicate(predicate: (type: TokenType) => boolean) {
    return predicate(this._scanner.NextToken.Type)
  }

  private SpanFromStart(start: SourcePosition) {
    return spanSourcePosition(start, this._scanner.CurrentToken.SourcePosition)
  }
}
