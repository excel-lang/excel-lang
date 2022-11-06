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

enum ValueType {
  Boolean = 1,
  String,
  Number,
  Reference,
  Unknown
}

interface PushOptions {
  Args: number[]
  Pops: number
  Returns: ValueType
}

export class CodeError extends BaseError {
  public readonly OpCode: OpCode

  constructor(opCode: OpCode, message: string) {
    super(message)
    this.OpCode = opCode
  }
}

export class Code {
  public readonly OpCodes: Instruction[]
  private _stack: ValueType[]

  constructor() {
    this.OpCodes = []
    this._stack = []
  }

  public WriteRow() {
    this.Write(OpCode.Row, {
      Args: [],
      Pops: 0,
      Returns: ValueType.Unknown
    })
  }

  public WriteCol() {
    this.Write(OpCode.Col, {
      Args: [],
      Pops: 0,
      Returns: ValueType.Unknown
    })
  }

  public WriteOptions() {
    this.Write(OpCode.Options, {
      Args: [],
      Pops: 0,
      Returns: ValueType.Unknown
    })
  }

  public WriteProperty() {
    this.Write(OpCode.Property, {
      Args: [],
      Pops: 0,
      Returns: ValueType.Unknown
    })
  }

  public WriteName(name: string) {
    this.Write(OpCode.Name, {
      Args: this.StringToArgs(name),
      Pops: 0,
      Returns: ValueType.Unknown
    })
  }

  public WriteBoolean(val: boolean) {
    this.Write(OpCode.Boolean, {
      Args: [val ? 1 : 0],
      Pops: 0,
      Returns: ValueType.Boolean
    })
  }

  public WriteNumber(val: number) {
    this.Write(OpCode.Number, {
      Args: [val],
      Pops: 0,
      Returns: ValueType.Number
    })
  }

  public WriteString(val: string) {
    this.Write(OpCode.String, {
      Args: this.StringToArgs(val),
      Pops: 0,
      Returns: ValueType.String
    })
  }

  public WriteCall(nArgs: number) {
    this.Write(OpCode.Call, {
      Args: [nArgs],
      Pops: nArgs,
      Returns: ValueType.Unknown
    })
  }

  public WriteRange() {
    this.Write(OpCode.Range, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Reference
    })
  }

  public WriteSheet() {
    this.Write(OpCode.Sheet, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Reference
    })
  }

  public WriteOr() {
    this.Write(OpCode.Or, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Unknown
    })
  }

  public WriteAnd() {
    this.Write(OpCode.And, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Unknown
    })
  }

  public WriteEq() {
    this.Write(OpCode.Eq, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Boolean
    })
  }

  public WriteNeq() {
    this.Write(OpCode.Neq, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Boolean
    })
  }

  public WriteLt() {
    this.Write(OpCode.Lt, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Boolean
    })
  }

  public WriteGt() {
    this.Write(OpCode.Gt, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Boolean
    })
  }

  public WriteLte() {
    this.Write(OpCode.Lte, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Boolean
    })
  }

  public WriteGte() {
    this.Write(OpCode.Gte, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Boolean
    })
  }

  public WriteAdd() {
    this.Write(OpCode.Add, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Unknown
    })
  }

  public WriteSub() {
    this.Write(OpCode.Sub, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Unknown
    })
  }

  public WriteMul() {
    this.Write(OpCode.Mul, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Unknown
    })
  }

  public WriteDiv() {
    this.Write(OpCode.Div, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Unknown
    })
  }

  public WriteMod() {
    this.Write(OpCode.Mod, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Unknown
    })
  }

  public WriteNot() {
    this.Write(OpCode.Not, {
      Args: [],
      Pops: 2,
      Returns: ValueType.Boolean
    })
  }

  private Write(opCode: OpCode, options: PushOptions) {
    if (options.Pops > this._stack.length) {
      throw new CodeError(
        opCode,
        `OpCode requires that at least ${options.Pops} values are on the stack.`)
    }

    // TODO: Some operations, ie. for addition, strings uses CONCAT()
    for (let i = 0; i < options.Pops; i++) this._stack.pop()
    this._stack.push(options.Returns)

    this.OpCodes.push({
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

export class Function {
  public readonly Name: string | null
  public readonly Parameters: string[]
  public readonly Code: Code

  constructor(name: string | null=null) {
    this.Name = name
    this.Parameters = []
    this.Code = new Code()
  }

  public Resolve() {}
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

  public Resolve() {}
}
