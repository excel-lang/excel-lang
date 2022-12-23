# Excel Lang
Functional Programming Language to compose and generate Excel functions to use in dynamic models.

## Table Of Contents
* [Installation](#installation)
* [Expressions](#expressions)
  - [Literals](#literals)
  - [Variables](#variables)
  - [Ranges](#ranges)
  - [Sheets](#sheets)
  - [Built In Values](#built-in-values)
  - [Binary Operators](#binary-operators)
  - [Unary Operators](#unary-operators)
  - [Calling Functions](#calling-functions)
* [Functions](#functions)
* [Models](#models)

## Installation
npm
`npm install excel-lang`

yarn
`yarn add excel-lang`

This gives you access to the Lexical Scanner, Parser and Formula and Model Generators

## Expressions

### Literals

* Booleans `True` and `False`
* Numbers can be integers or floats, ex: `25`, `15.6`, `.5`
* Strings are enclosed within single quotes, ex. `'this is a string'`

### Variables
Variables are only created through function parameters. You cannot declare/define a variable within the body a of function. If a variable is referenced that is not a parameter, the name will be passed directly to an Excel formula. This allows you to reference columns, ex. `A1` or `G7`.

### Ranges
Ranges work in the same way as in Excel and are created by seperating two expressions by a colon and enclosing it in curly braces, ex. `{A1:A10}`, `{row['A']:row['A'] + 10}`

### Sheets
You can reference values from other sheets by specifying a name or a string in the case you want to reference a sheet with whitespace. The value to get from the sheet can be any expression. This allows you to use variables or ranges.

#### Examples
`Sheet[{A1:A10}]`

`'Sheet with whitespace'[B2]`

### Built In Values
* `options.<name>` can be used to access model options

### Binary Operators
Binary operations allow you to use an operator on two operands.

| Operator  | Precedence |
| - | - |
| \|  | 0  |
| &  | 1  |
| =, <> | 2 |
| <, >, <=, >= | 3 |
| - | 4 |
| + | 5 |
| / | 6 |
| * | 7 | 

Arithmetic operators follow PEMDAS.

Example `(my_variable * 10 + options['value']) / 5`

### Unary Operators
Unary operations allow you to use an operator on an operand.

| Operator |
| - |
| ! |

Example `!some_variable`

### Calling Functions
Functions are invoked by refrencing the  defined function name and enclosing the arguments within parenthesis.

Example `some_function(5)`

Additional arguments must be seperated by a comma.

Example `another_function(variable, 'string', True)`

## Functions
The syntax to create composable Excel formulas

The `fn` keyword is used to define a new function. Functions are meant to composed and are then converted to Excel Formulas. You can use existing Excel functions. They are not case sensitive. The built in Excel functions can be overshadowed, so be aware that this may create unintended behavior.

You are able to define a name and a set of parameters. Parameters are simply identifiers that can be used in the body of the function. Multiple parameters must be seperated by a `,`. The body of the function can only be comprised of expressions. There are no statements allowed within a function.

### Function Example
```
fn my_function_name(some_value) -> (sum('Another Sheet'[A1:A10]) + sum('Some Other Sheet'[B1:B10])) / some_value
```

## Models
The syntax to create computed models in Excel.

The `model` keyword is used to defined a new model within a sheet. Multiple models can be defined within a sheet.

You are able to define a name, a set of options and the headers and their computed values.

There are 3 built in options:

* `start_row` - Defines the first row at which the model should be created (Default: `1`)
* `end_row` - Defines the row at which the model should end (Default: `2`)
* `start_col` - Defines the first column at which the model should be created (Default: `A`)

Options are declared with the following syntax `<name> -> <expression>`. Multiple options must be seperated with a `,`.

Headers are defined by specifying a name and an expression (ex. a function call or a number). Headers are declared with the following syntax `<string_literal> -> <expression>`.

### Model Example
```
model(
  end_row -> 25,
  some_custom_option -> compute_my_option()
) {
  'Header 1' -> compute_an_important_value(),
  'Static Header' -> 'Hello World'
}
```
