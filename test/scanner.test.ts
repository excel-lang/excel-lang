import { expect } from "chai"
import { Scanner } from "../src/scanner"
import { TokenType, Token } from "../src/token"

type Expected = [TokenType, string][]

describe("scanner", () => {
  function runScanner(scanner: Scanner, expected: Expected): void {
    let token: Token = scanner.Scan()
    let i = 0
    while (token.Type != TokenType.EOF) {
      const [expectedType, expectedLiteral] = expected[i]
      expect(token.Type).to.equal(expectedType)
      expect(token.Literal).to.equal(expectedLiteral)
      token = scanner.Scan()
      i++
    }
  }

  it("should scan conditional tokens", () => {
    const tokens = "-<><<=>>=->"
    const scanner = new Scanner(tokens)
    const expected: Expected = [
      [TokenType.Sub, "-"],
      [TokenType.Neq, "<>"],
      [TokenType.Lt, "<"],
      [TokenType.Lte, "<="],
      [TokenType.Gt, ">"],
      [TokenType.Gte, ">="],
      [TokenType.Arrow, "->"]
    ]
    runScanner(scanner, expected)
  })

  it ("should ignore whitespace", () => {
    const tokens = "!     <> \n\r,"
    const scanner = new Scanner(tokens)
    const expected: Expected = [
      [TokenType.Not, "!"],
      [TokenType.Neq, "<>"],
      [TokenType.Comma, ","]
    ]
    runScanner(scanner, expected)
  })

  it ("should ignore comments", () => {
    const tokens = "# this is a long comment\n# this is another one\n:)"
    const scanner = new Scanner(tokens)
    const expected: Expected = [
      [TokenType.Colon, ":"],
      [TokenType.RParen, ")"]
    ]
    runScanner(scanner, expected)
  })

  it("should scan names", () => {
    const tokens = "fn variable_name _var True False model"
    const scanner = new Scanner(tokens)
    const expected: Expected = [
      [TokenType.Function, "fn"],
      [TokenType.Name, "variable_name"],
      [TokenType.Name, "_var"],
      [TokenType.True, "True"],
      [TokenType.False, "False"],
      [TokenType.Model, "model"]
    ]
    runScanner(scanner, expected)
  })

  it("should scan numbers", () => {
    const tokens = "5 .5234 543.432 -235 -.1"
    const scanner = new Scanner(tokens)
    const expected: Expected = [
      [TokenType.Number, "5"],
      [TokenType.Number, ".5234"],
      [TokenType.Number, "543.432"],
      [TokenType.Number, "-235"],
      [TokenType.Number, "-.1"]
    ]
    runScanner(scanner, expected)
  })

  it("should scan strings", () => {
    const tokens = "'hello world'"
    const scanner = new Scanner(tokens)
    const expected: Expected = [
      [TokenType.String, "hello world"]
    ]
    runScanner(scanner, expected)
  })

  it("should throw an error for unterminated strings", () => {
    const str = "'i am not terminated"
    expect(() => new Scanner(str)).to.throw()
  })
})
