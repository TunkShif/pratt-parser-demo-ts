import { print } from "./lib/ast"
import { Lexer } from "./lib/lexer"
import { Parser } from "./lib/parser"

const source = "-sin(a+b) + f(g(x), h(-((1+2)*3)))"

const lexer = new Lexer(source)
const parser = new Parser(lexer.scanTokens())
const expr = parser.parse()

console.log(source)
console.log(print(expr))
