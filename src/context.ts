interface ContextValues {
  [name: string]: Object
}

export class Context {
  private readonly _outerContext: Context | null
  private readonly _values: ContextValues

  constructor(outerContext: Context | null=null) {
    this._outerContext = outerContext
    this._values = {}
  }

  public AddValue(name: string, value: Object): void {
    this._values[name] = value
  }

  public GetValue(name: string): Object | null {
    if (this._values.hasOwnProperty(name)) {
      return this._values[name]
    }

    if (this._outerContext) {
      return this._outerContext.GetValue(name)
    }

    return null
  }
}
