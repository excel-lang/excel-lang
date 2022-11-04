import { BaseError } from "./error"
import { SourcePosition, TokenType, Token, createEmptyToken } from "./token"

function isLetter(c: string): boolean {
  return !!c.match(/[a-z]/i)
}

function isDigit(c: string): boolean {
  return !!c.match(/[0-9]/)
}

function isWhitespace(c: string): boolean {
  return !!c.match(/\s/)
}

function isNameStartChar(c: string): boolean {
  return isLetter(c) || c === "_"
}

function isNameChar(c: string) {
  return isNameStartChar(c) || isDigit(c)
}

export class ScannerError extends BaseError {
  public readonly SourcePosition: SourcePosition

  constructor(sourcePosition: SourcePosition, message: string) {
    super(message)
    this.SourcePosition = sourcePosition
  }
}

const EOF_MARKER = ""

export class Scanner {
  private _s : number = -1
  private _i: number = -1
  private _currentToken: Token
  private _nextToken: Token
  private readonly _input: string

  constructor(input: string) {
    this._input = input
    this._currentToken = createEmptyToken()
    this._nextToken = createEmptyToken()
    this.Scan()
  }

  public get CurrentToken() {
    return this._currentToken
  }

  public get NextToken() {
    return this._nextToken
  }

  public Scan(): Token {
    if (this._i >= this._input.length) return this.Emit(TokenType.EOF)
    do {
      this._i++
      this._s = this._i
      switch (this.Cursor) {
      case "(":
        return this.Emit(TokenType.LParen)
      case ")":
        return this.Emit(TokenType.RParen)
      case "{":
        return this.Emit(TokenType.LBrace)
      case "}":
        return this.Emit(TokenType.RBrace)
      case "[":
        return this.Emit(TokenType.LBracket)
      case "]":
        return this.Emit(TokenType.RBracket)
      case ",":
        return this.Emit(TokenType.Comma)
      case ":":
        return this.Emit(TokenType.Colon)
      case "@":
        return this.Emit(TokenType.At)
      case ".":
        if (isDigit(this.Next)) {
          return this.ScanNumber()
        }
        return this.Emit(TokenType.Period)
      case "&":
        return this.Emit(TokenType.And)
      case "|":
        return this.Emit(TokenType.Or)
      case "=":
        return this.Emit(TokenType.Eq)
      case "!":
        if (this.Match("=")) return this.Emit(TokenType.Neq)
        return this.Emit(TokenType.Not)
      case "<":
        if (this.Match("=")) return this.Emit(TokenType.Lte)
        return this.Emit(TokenType.Lt)
      case ">":
        if (this.Match("=")) return this.Emit(TokenType.Gte)
        return this.Emit(TokenType.Gt)
      case "+":
        return this.Emit(TokenType.Add)
      case "-":
        if (isDigit(this.Next) || this.Next === ".") {
          return this.ScanNumber()
        } else if (this.Match(">")) {
          return this.Emit(TokenType.Arrow)
        }
        return this.Emit(TokenType.Sub)
      case "*":
        return this.Emit(TokenType.Mul)
      case "/":
        return this.Emit(TokenType.Div)
      case "%":
        return this.Emit(TokenType.Mod)
      case "#":
        this.SkipComment()
        break
      case "'":
        return this.ScanString()
      case EOF_MARKER:
        return this.Emit(TokenType.EOF)
      default:
        if (isNameStartChar(this.Cursor)) {
          return this.ScanName()
        } else if (isDigit(this.Cursor)) {
          return this.ScanNumber()
        } else if (isWhitespace(this.Cursor)) {
          this.SkipWhitespace()
        }
        break
      }
    } while (true)
  }

  private get Cursor(): string {
    return this._input[this._i] ?? EOF_MARKER
  }

  private get Next(): string {
    return this._input[this._i + 1] ?? EOF_MARKER
  }

  private get Literal(): string {
    return this._input.slice(this._s, this._i + 1)
  }

  private get SourcePosition(): SourcePosition {
    return {
      Start: this._s,
      End: this._i
    }
  }

  private Emit(type: TokenType): Token {
    let literal: string
    if (type === TokenType.EOF) {
      literal = EOF_MARKER
    } else if (type === TokenType.String) {
      literal = this._input.slice(this._s + 1, this._i)
    } else {
      literal = this.Literal
      if (type === TokenType.Name) {
        switch (literal) {
        case "fn":
          type = TokenType.Function
          break
        case "model":
          type = TokenType.Model
          break
        case "R":
          type = TokenType.R
          break
        case "C":
          type = TokenType.C
          break
        case "options":
          type = TokenType.Options
          break
        case "True":
          type = TokenType.True
          break
        case "False":
          type = TokenType.False
          break
        }
      }
    }
    const token: Token = {
      Type: type,
      Literal: literal,
      SourcePosition: this.SourcePosition
    }
    this._currentToken = this._nextToken
    this._nextToken = token
    return this._currentToken
  }

  private Match(c: string): boolean {
    if (this.Next !== c) return false
    this._i++
    return true
  }

  private SkipComment(): void {
    while (this.Next && this.Next !== "\n") this._i++
  }

  private ScanString(): Token {
    do {
      if (!this.Next)
        throw new ScannerError(
          this.SourcePosition,
          "String literal is not closed, add a single quote character to close your string.")
      this._i++
    } while (this.Cursor !== "'")
    return this.Emit(TokenType.String)
  }

  private ScanName() {
    while (isNameChar(this.Next)) this._i++
    return this.Emit(TokenType.Name)
  }

  private ScanNumber(): Token {
    while (isDigit(this.Next)) this._i++
    if (this.Next !== ".") return this.Emit(TokenType.Number)
    do { this._i++ } while (isDigit(this.Next))
    return this.Emit(TokenType.Number)
  }

  private SkipWhitespace(): void {
    while (isWhitespace(this.Next)) this._i++
  }
}
