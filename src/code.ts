import { BaseError } from "./error"

export enum OpCode {
  Row = 1,
  Col,
  Options,
  Property,
  Name,
  Boolean,
  Number,
  String,
  Call,
  Range,
  Sheet,
  Or,
  And,
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
  Not
}

export interface Instruction {
  readonly OpCode: OpCode
  readonly Args: number[]
}

interface PushOptions {
  Args: number[]
  Pops: number
}

export class CodeError extends BaseError {
  public readonly OpCode: OpCode

  constructor(opCode: OpCode, message: string) {
    super(message)
    this.OpCode = opCode
  }
}

export class Code {
  public readonly Instructions: Instruction[]
  private _stack: number

  constructor() {
    this.Instructions = []
    this._stack = 0
  }

  public WriteRow() {
    this.Write(OpCode.Row, {
      Args: [],
      Pops: 0
    })
  }

  public WriteCol() {
    this.Write(OpCode.Col, {
      Args: [],
      Pops: 0
    })
  }

  public WriteOptions() {
    this.Write(OpCode.Options, {
      Args: [],
      Pops: 0
    })
  }

  public WriteProperty() {
    this.Write(OpCode.Property, {
      Args: [],
      Pops: 0
    })
  }

  public WriteName(name: string) {
    this.Write(OpCode.Name, {
      Args: this.StringToArgs(name),
      Pops: 0
    })
  }

  public WriteBoolean(val: boolean) {
    this.Write(OpCode.Boolean, {
      Args: [val ? 1 : 0],
      Pops: 0
    })
  }

  public WriteNumber(val: number) {
    this.Write(OpCode.Number, {
      Args: [val],
      Pops: 0
    })
  }

  public WriteString(val: string) {
    this.Write(OpCode.String, {
      Args: this.StringToArgs(val),
      Pops: 0
    })
  }

  public WriteCall(nArgs: number) {
    this.Write(OpCode.Call, {
      Args: [nArgs],
      Pops: nArgs
    })
  }

  public WriteRange() {
    this.Write(OpCode.Range, {
      Args: [],
      Pops: 2
    })
  }

  public WriteSheet() {
    this.Write(OpCode.Sheet, {
      Args: [],
      Pops: 2
    })
  }

  public WriteOr() {
    this.Write(OpCode.Or, {
      Args: [],
      Pops: 2
    })
  }

  public WriteAnd() {
    this.Write(OpCode.And, {
      Args: [],
      Pops: 2
    })
  }

  public WriteEq() {
    this.Write(OpCode.Eq, {
      Args: [],
      Pops: 2
    })
  }

  public WriteNeq() {
    this.Write(OpCode.Neq, {
      Args: [],
      Pops: 2
    })
  }

  public WriteLt() {
    this.Write(OpCode.Lt, {
      Args: [],
      Pops: 2
    })
  }

  public WriteGt() {
    this.Write(OpCode.Gt, {
      Args: [],
      Pops: 2
    })
  }

  public WriteLte() {
    this.Write(OpCode.Lte, {
      Args: [],
      Pops: 2
    })
  }

  public WriteGte() {
    this.Write(OpCode.Gte, {
      Args: [],
      Pops: 2
    })
  }

  public WriteAdd() {
    this.Write(OpCode.Add, {
      Args: [],
      Pops: 2
    })
  }

  public WriteSub() {
    this.Write(OpCode.Sub, {
      Args: [],
      Pops: 2
    })
  }

  public WriteMul() {
    this.Write(OpCode.Mul, {
      Args: [],
      Pops: 2
    })
  }

  public WriteDiv() {
    this.Write(OpCode.Div, {
      Args: [],
      Pops: 2
    })
  }

  public WriteMod() {
    this.Write(OpCode.Mod, {
      Args: [],
      Pops: 2
    })
  }

  public WriteNot() {
    this.Write(OpCode.Not, {
      Args: [],
      Pops: 2
    })
  }

  private Write(opCode: OpCode, options: PushOptions) {
    if (options.Pops > this._stack) {
      throw new CodeError(
        opCode,
        `OpCode requires that at least ${options.Pops} values are on the stack.`)
    }

    this._stack -= options.Pops

    this.Instructions.push({
      OpCode: opCode,
      Args: options.Args
    })
  }

  private StringToArgs(val: string) {
    const args: number[] = []
    for (let i = 0; i < val.length; i++) {
      args.push(val.charCodeAt(i))
    }
    return args
  }
}

export interface Functions {
  [name: string]: NamedFunction
}

export class Function {
  public readonly Parameters: string[]
  public readonly Code: Code

  constructor() {
    this.Parameters = []
    this.Code = new Code()
  }
}

export class NamedFunction extends Function {
  public readonly Name: string

  constructor(name: string) {
    super()
    this.Name = name
  }
}

export interface Models {
  [name: string]: Model
}

export interface Definitions {
  [name: string]: Function
}

export class Model {
  public readonly Name: string
  public readonly Options: Definitions
  public readonly Headers: Definitions

  constructor(name: string) {
    this.Name = name
    this.Options = {}
    this.Headers = {}
  }
}
