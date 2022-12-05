import { BaseError } from "./error"
import { Value, Variables } from "./value"

export class StackError extends BaseError {}

export class Frame {
  private readonly _data: Value[]
  private readonly _variables: Variables

  constructor() {
    this._data = []
    this._variables = {}
  }

  public GetVariable(name: string): Value {
    return this._variables[name]
  }

  public SetVariable(name: string, value: Value): void {
    this._variables[name] = value
  }

  public Push(value: Value): void {
    this._data.push(value)
  }

  public Pop(n: number): Value[] {
    if (n < this._data.length) throw new StackError("Not enough values to pop from stack")
    const popped = []
    for (let i = 0; i < n; i++) {
      const value = this._data.pop()
      popped.push(<Value>value)
    }
    return popped
  }
}

export class Stack {
  private readonly _frames: Frame[]

  constructor() {
    this._frames = []
  }

  public get CurrentFrame(): Frame {
    return this._frames[this._frames.length - 1]
  }

  public PushFrame(): void {
    this._frames.push(new Frame())
  }

  public PopFrame(): void {
    this._frames.pop()
  }
}
