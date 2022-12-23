import { expect } from "chai"
import { Compiler } from "../src/compiler"
import { Parser, ParseResult } from "../src/parser"

describe("compiler", () => {
  it("should compile user defined functions", () => {
    const code = `
    fn my_function(arg0, arg1) -> arg0 * (A2 / arg1)

    fn my_function2(arg) -> my_function(arg, arg * B2)

    model test {
      'Header 1' -> my_function2(25),
      'Header 2' -> my_function2(50)
    }
    `

    const parser = new Parser(code)
    const compiler = new Compiler({})
    let statement: ParseResult
    while (statement = parser.Parse()) {
      statement.Accept(compiler)
    }

    expect(compiler.Formulas.test['Header 1'].Value).to.equal("(25 * (A2 / (25 * B2)))")
    expect(compiler.Formulas.test['Header 2'].Value).to.equal("(50 * (A2 / (50 * B2)))")
  })
})
