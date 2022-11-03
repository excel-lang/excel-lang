export enum TokenType {
  Function,
  Model,
  Name,
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

export interface SourcePosition {
  Start: number
  End: number
}

export interface Token {
  readonly Type: TokenType
  readonly Literal: string
  readonly SourcePosition: SourcePosition
}
