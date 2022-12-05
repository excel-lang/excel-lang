import { Functions, NamedFunction, Model, Models } from "./code"

export class Context {
  private readonly _functions: Functions
  private readonly _models: Models

  constructor() {
    this._functions = {}
    this._models = {}
  }

  get Models() {
    return this._models
  }

  get Functions() {
    return this._functions
  }

  public AddModel(model: Model): void {
    this._models[model.Name] = model
  }

  public AddFunction(func: NamedFunction): void {
    this._functions[func.Name] = func
  }

  public GetFunction(name: string): NamedFunction {
    return this._functions[name]
  }

  public IsFunction(name: string): boolean {
    return this._functions.hasOwnProperty(name)
  }
}
