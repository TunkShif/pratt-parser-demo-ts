import type { Token } from "./token"

export type Expr =
  | { type: "NUMBER"; value: string }
  | { type: "IDENT"; name: string }
  | { type: "CALL"; name: string; arguments: Expr[] }
  | { type: "UNARY"; operator: Token; body: Expr }
  | { type: "BINARY"; operator: Token; left: Expr; right: Expr }

export const print = (expr: Expr): string => {
  switch (expr.type) {
    case "NUMBER":
      return `${expr.value}`
    case "IDENT":
      return `${expr.name}`
    case "UNARY":
      return `(${expr.operator.lexeme} ${print(expr.body)})`
    case "BINARY":
      return `(${expr.operator.lexeme} ${print(expr.left)} ${print(expr.right)})`
    case "CALL":
      return `(${[expr.name].concat(expr.arguments.map(print)).join(" ")})`
    default:
      return ""
  }
}
