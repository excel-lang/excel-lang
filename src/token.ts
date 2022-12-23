export enum Name {
  Function = "fn",
  Model = "model",
  Options = "options",
  Name = "name"
}

export enum Seperator {
  LParen = "(",
  RParen = ")",
  LBrace = "{",
  RBrace = "}",
  LBracket = "[",
  RBracket = "]",
  Comma = ",",
  Colon = ":",
  Period = ".",
  At = "@",
  Arrow = "->"
}

export enum LogicalOperator {
  And = "&",
  Or = "|"
}

export enum EqualityOperator {
  Eq = "=",
  Neq = "<>"
}

export enum ComparisonOperator {
  Lt = "<",
  Gt = ">",
  Lte = "<=",
  Gte = ">="
}

export enum ArithmeticOperator {
  Add = "+",
  Sub = "-",
  Mul = "*",
  Div = "/",
  Mod = "%"
}

export const BinaryOperator = {
  ...LogicalOperator,
  ...EqualityOperator,
  ...ComparisonOperator,
  ...ArithmeticOperator
}
export type BinaryOperator =
  LogicalOperator |
  EqualityOperator |
  ComparisonOperator |
  ArithmeticOperator


export type PrecedenceMap = {
  [op in BinaryOperator]: number
}

export const precedenceMap: PrecedenceMap = {
  [LogicalOperator.Or]: 1,
  [LogicalOperator.And]: 2,
  [EqualityOperator.Eq]: 3,
  [EqualityOperator.Neq]: 3,
  [ComparisonOperator.Lt]: 4,
  [ComparisonOperator.Gt]: 4,
  [ComparisonOperator.Lte]: 4,
  [ComparisonOperator.Gte]: 4,
  [ArithmeticOperator.Add]: 5,
  [ArithmeticOperator.Sub]: 5,
  [ArithmeticOperator.Mul]: 6,
  [ArithmeticOperator.Div]: 6,
  [ArithmeticOperator.Mod]: 6
}

export enum UnaryOperator {
  Not = "!"
}

export enum Literal {
  True = "True",
  False = "False",
  Number = "number",
  String = "string"
}

export enum Scanner {
  Empty = "empty",
  EOF = "EOF"
}

export const TokenType = {
  ...Name,
  ...Seperator,
  ...BinaryOperator,
  ...UnaryOperator,
  ...Literal,
  ...Scanner
}
export type TokenType =
  Name |
  Seperator |
  BinaryOperator |
  UnaryOperator |
  Literal |
  Scanner

export interface SourcePosition {
  Start: number
  End: number
}

export function spanSourcePosition(sp0: SourcePosition, sp1: SourcePosition): SourcePosition {
  return {
    Start: sp0.Start,
    End: sp1.End
  }
}

export interface Token {
  readonly Type: TokenType
  readonly Literal: string
  readonly SourcePosition: SourcePosition
}

export function createEmptyToken() {
  return {
    Type: TokenType.Empty,
    Literal: '',
    SourcePosition: {
      Start: -1,
      End: -1
    }
  }
}

export function isLogicalOperator(key: string) {
  return Object.values<string>(LogicalOperator).includes(key)
}

export function isEqualityOperator(key: string) {
  return Object.values<string>(EqualityOperator).includes(key)
}

export function isComparisonOperator(key: string) {
  return Object.values<string>(ComparisonOperator).includes(key)
}

export function isArithmeticOperator(key: string) {
  return Object.values<string>(ArithmeticOperator).includes(key)
}

export function isBinaryOperator(key: string) {
  return Object.values<string>(BinaryOperator).includes(key)
}

export function isUnaryOperator(key: string) {
  return Object.values<string>(UnaryOperator).includes(key)
}
