import { expect } from "chai"
import { Statement } from "../src/ast"
import { ASTSerializer } from "../src/ast_serializer"
import { Parser } from "../src/parser"

describe("parser", () => {
  const serializer = new ASTSerializer()

  function runExpressionParser(input: string, expected: string): void {
    const parser = new Parser(input)
    const result = parser.ParseExpression().Accept(serializer) as string
    expect(result).to.equal(expected)
  }

  function runParser(input: string, expected: string): void {
    const parser = new Parser(input)
    const result = (parser.Parse() as Statement).Accept(serializer) as string
    expect(result).to.equal(expected)
  }

  it("should parse range expressions", () => {
    const input = "{row['A']:row['A'] + 1}"
    const expected = "{row['A']:(row['A']+1)}"
    runExpressionParser(input, expected)
  })

  it("should parse name sheet expressions", () => {
    const input = "some_variable['some key']"
    runExpressionParser(input, input)
  })

  it("should parse string sheet expressions", () => {
    const input = "'Sheet Name'[A1]"
    runExpressionParser(input, input)
  })

  it("should parse operators with correct precedence", () => {
    const input0 = "5 + test * (A1 - 7 / 4)"
    const expected0 = "(5+(test*(A1-(7/4))))"
    const input1 = "variable & 'Sheet'[A1] | 'Other Sheet'[B2] > row['C'] >= col & !True <> 'nonsense'"
    const expected1 = "((variable&'Sheet'[A1])|((('Other Sheet'[B2]>row['C'])>=col)&((!True)<>'nonsense')))"
    runExpressionParser(input0, expected0)
    runExpressionParser(input1, expected1)
  })

  it("should parse call expressions", () => {
    const input = "some_function(1, 'My Sheet'[A7], True, {A1:B10})"
    const expected = "some_function(1,'My Sheet'[A7],True,{A1:B10})"
    runExpressionParser(input, expected)
  })

  it("should parse function statements", () => {
    const input = "fn test (sheet) -> sheet[5]"
    const expected: string = "fn(test)(sheet)(sheet[5])"
    runParser(input, expected)
  })

  it("shoud parse model statements", () => {
    const input0 = "model test { 'Header 1' -> some_function(), 'Header 2' -> 5 }" 
    const expected0 = "model(test)()('Header 1'->some_function(),'Header 2'->5)"
    const input1 = "model test (start_row -> 5, start_col -> 'A') { 'Header 1' -> options[start_row] * 5 }"
    const expected1 = "model(test)(start_row->5,start_col->'A')('Header 1'->(options[start_row]*5))"
    runParser(input0, expected0)
    runParser(input1, expected1)
  })
})
