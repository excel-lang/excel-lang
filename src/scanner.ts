import { TokenType, Token } from "./token"

function isLetter(c: string): boolean {
  return !!c.match(/[a-z]/i)
}

function isDigit(c: string): boolean {
  return !!c.match(/[0-9]/)
}

function isWhitespace(c: string): boolean {
  return !!c.match(/\s/)
}

function isIdentifierStartChar(c: string): boolean {
  return isLetter(c) || c === '_'
}

function isIdentifierChar(c: string) {
  return isIdentifierStartChar(c) || isDigit(c)
}

function getTokenTypeForIdentifier(identifier: string): TokenType {
  switch (identifier) {
  case "fn":
    return TokenType.Function
  case "model":
    return TokenType.Model
  case "True":
    return TokenType.True
  case "False":
    return TokenType.False
  default:
    return TokenType.Identifier
  }
}

export class Scanner {
  private s : number = -1
  private i: number = -1
  private readonly input: string

  constructor(input: string) {
    this.input = input
  }

  public Scan(): Token {
    if (this.i >= this.input.length) return this.Emit(TokenType.EOF)
    do {
      this.i++
      this.s = this.i
      switch (this.Current) {
      case "(":
        return this.Emit(TokenType.LParen)
      case ")":
        return this.Emit(TokenType.RParen)
      case "{":
        return this.Emit(TokenType.LBracket)
      case "}":
        return this.Emit(TokenType.RBracket)
      case ",":
        return this.Emit(TokenType.Comma)
      case ":":
        return this.Emit(TokenType.Colon)
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
      case "":
        return this.Emit(TokenType.EOF)
      default:
        if (isIdentifierStartChar(this.Current)) {
          return this.ScanIdentifierOrKeyword()
        } else if (isDigit(this.Current)) {
          return this.ScanNumber()
        } else if (isWhitespace(this.Current)) {
          this.SkipWhitespace()
        }
        break
      }
    } while (true)
  }

  private get Current(): string {
    return this.input[this.i] ?? ""
  }

  private get Next(): string {
    return this.input[this.i + 1] ?? ""
  }

  private get Literal(): string {
    return this.input.slice(this.s, this.i + 1)
  }

  private Emit(type: TokenType): Token {
    const literal: string =
      (type === TokenType.EOF)
        ? '' : (type === TokenType.String)
          ? this.input.slice(this.s + 1, this.i) : this.Literal
    return new Token(type, literal)
  }

  private Match(c: string): boolean {
    if (this.Next !== c) return false
    this.i++
    return true
  }

  private SkipComment(): void {
    while (this.Next && this.Next !== "\n") this.i++
  }

  private ScanString(): Token {
    do {
      if (!this.Next)
        throw new Error("String literal is not closed, add a single quote character to close your string.")
      this.i++
    } while (this.Current !== "'")
    return this.Emit(TokenType.String)
  }

  private ScanIdentifierOrKeyword(): Token {
    while (isIdentifierChar(this.Next)) this.i++
    const type: TokenType = getTokenTypeForIdentifier(this.Literal)
    return new Token(type, this.Literal)
  }

  private ScanNumber(): Token {
    while (isDigit(this.Next)) this.i++
    if (this.Next !== ".") return this.Emit(TokenType.Number)
    do { this.i++ } while (isDigit(this.Next))
    return this.Emit(TokenType.Number)
  }

  private SkipWhitespace(): void {
    while (isWhitespace(this.Next)) this.i++
  }
}
