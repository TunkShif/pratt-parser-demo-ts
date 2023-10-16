import { Expr } from "./ast"
import { Token, TokenType } from "./token"

enum Precedence {
  NONE,
  TERM, // + -
  FACTOR, // * /
  UNARY, // -
  CALL, // ()
  PRIMARY
}

type ParseRule = {
  precedence: Precedence
  prefixFn: ((parser: Parser, token: Token) => Expr) | null
  infixFn: ((parser: Parser, token: Token, left: Expr) => Expr) | null
}

export class Parser {
  static rules: Record<TokenType, ParseRule> = {
    IDENT: { precedence: Precedence.NONE, prefixFn: Parser.identifier, infixFn: null },
    NUMBER: { precedence: Precedence.NONE, prefixFn: Parser.number, infixFn: null },
    PLUS: { precedence: Precedence.TERM, prefixFn: null, infixFn: Parser.binary },
    MINUS: { precedence: Precedence.TERM, prefixFn: Parser.unary, infixFn: Parser.binary },
    STAR: { precedence: Precedence.FACTOR, prefixFn: null, infixFn: Parser.binary },
    SLASH: { precedence: Precedence.FACTOR, prefixFn: null, infixFn: Parser.binary },
    COMMA: { precedence: Precedence.NONE, prefixFn: null, infixFn: null },
    LPAREN: { precedence: Precedence.CALL, prefixFn: Parser.grouping, infixFn: Parser.call },
    RPAREN: { precedence: Precedence.NONE, prefixFn: null, infixFn: null },
    EOF: { precedence: Precedence.NONE, prefixFn: null, infixFn: null }
  }

  private current = 0

  constructor(private tokens: Token[]) { }

  parse() {
    return this.expression()
  }

  private parsePrecedence(precedence: Precedence) {
    const token = this.advance()
    const prefixFn = Parser.rules[token.type].prefixFn

    if (!prefixFn) {
      throw new Error("Expect expression.")
    }

    let left = prefixFn(this, token)
    while (Parser.rules[this.peek().type].precedence >= precedence) {
      const nextToken = this.advance()
      const infixFn = Parser.rules[nextToken.type].infixFn!
      left = infixFn(this, nextToken, left)
    }

    return left
  }

  private advance() {
    return this.tokens[this.current++]
  }

  private consume(tokenType: TokenType, message: string) {
    const nextToken = this.advance()
    if (nextToken.type !== tokenType) {
      throw new Error(message)
    }
  }

  private peek() {
    return this.tokens[this.current]
  }

  private expression() {
    return this.parsePrecedence(Precedence.TERM)
  }

  private static number(_parser: Parser, token: Token): Expr {
    return { type: "NUMBER", value: token.lexeme }
  }

  private static identifier(_parser: Parser, token: Token): Expr {
    return { type: "IDENT", name: token.lexeme }
  }

  private static call(parser: Parser, _token: Token, left: Expr): Expr {
    const args: Expr[] = []

    while (parser.peek().type !== "RPAREN") {
      args.push(parser.expression())

      if (parser.peek().type === "COMMA") {
        parser.advance()
      }
    }

    parser.consume("RPAREN", "Expect ')' after arguments.")

    return { type: "CALL", name: (left as { type: "IDENT"; name: string }).name, arguments: args }
  }

  private static grouping(parser: Parser, _token: Token): Expr {
    const expr = parser.expression()
    parser.consume("RPAREN", "Expect ')' after expression.")
    return expr
  }

  private static unary(parser: Parser, token: Token): Expr {
    const body = parser.parsePrecedence(Precedence.UNARY)
    return { type: "UNARY", operator: token, body }
  }

  private static binary(parser: Parser, token: Token, left: Expr): Expr {
    const precedence = Parser.rules[token.type].precedence
    const right = parser.parsePrecedence(precedence + 1)
    return { type: "BINARY", operator: token, left, right }
  }
}
