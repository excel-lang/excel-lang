export enum TokenType {
  Function,
  Model,
  Identifier,
  LParen,
  RParen,
  LBracket,
  RBracket,
  Comma,
  Colon,
  Period,
  Arrow,
  And,
  Or,
  Eq,
  Neq,
  Lt,
  Gt,
  Lte,
  Gte,
  Add,
  Sub,
  Mul,
  Div,
  Mod,
  Not,
  True,
  False,
  Number,
  String,
  EOF
}

export class Token {
  public readonly type: TokenType
  public readonly literal: string

  constructor(type: TokenType, literal: string) {
    this.type = type
    this.literal = literal
  }
}
