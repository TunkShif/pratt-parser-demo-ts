type TokenType = "PLUS" | "MINUS" | "STAR" | "SLASH" | "NUMBER"

type Token = {
  type: TokenType
  lexeme: string
}

type Expr =
  | { type: "unary"; operator: Token; value: Expr }
  | { type: "binary"; operator: Token; left: Expr; right: Expr }
  | { type: "number"; value: number }

type PrefixParselet = {
  precedence: number
  parseFn: (parser: Parser, token: Token) => Expr
}

type InfixParselet = {
  precedence: number
  parseFn: (parser: Parser, left: Expr, token: Token) => Expr
}

class Lexer {
  private current = 0
  private tokens: Token[] = []

  constructor(private source: string) { }

  tokenize() {
    while (this.hasNext()) {
      this.nextToken()
    }
    return this.tokens
  }

  private nextToken() {
    const char = this.consume()
    switch (char) {
      case "+":
        this.tokens.push({ type: "PLUS", lexeme: "+" })
        break
      case "-":
        this.tokens.push({ type: "MINUS", lexeme: "-" })
        break
      case "*":
        this.tokens.push({ type: "STAR", lexeme: "*" })
        break
      case "/":
        this.tokens.push({ type: "SLASH", lexeme: "/" })
        break
      case " ":
        break
      default: {
        if (this.isDigit(char)) {
          this.parseNumber()
        } else {
          throw new Error("Unexpected chartacter.")
        }
      }
    }
  }

  private isDigit(char: string) {
    return /[0-9]{1}/.test(char)
  }

  private hasNext() {
    return this.current < this.source.length
  }

  private peek() {
    return this.source[this.current]
  }

  private consume() {
    return this.source[this.current++]
  }

  private parseNumber() {
    const start = this.current - 1
    while (this.isDigit(this.peek())) this.consume()
    const end = this.current
    const number = this.source.slice(start, end)
    this.tokens.push({ type: "NUMBER", lexeme: number })
  }
}

const UnaryOperatorParselet: (precedence: number) => PrefixParselet = (precedence) => ({
  parseFn: (parser, token) => {
    const right = parser.parseExpression(precedence)
    return { type: "unary", operator: token, value: right }
  },
  precedence
})

const BinaryOperatorParselet: (precedence: number) => InfixParselet = (precedence) => ({
  parseFn: (parser, left, token) => {
    const right = parser.parseExpression(precedence)
    return { type: "binary", operator: token, left, right }
  },
  precedence
})

const NumberParselet: PrefixParselet = {
  parseFn: (_parser, token) => {
    return { type: "number", value: parseInt(token.lexeme) }
  },
  precedence: 0
}

class Parser {
  private current = 0
  private tokens: Token[] = []
  private prefixParselets: Partial<Record<TokenType, PrefixParselet>> = {
    MINUS: UnaryOperatorParselet(3),
    NUMBER: NumberParselet
  }
  private infixParselets: Partial<Record<TokenType, InfixParselet>> = {
    PLUS: BinaryOperatorParselet(1),
    MINUS: BinaryOperatorParselet(1),
    STAR: BinaryOperatorParselet(2),
    SLASH: BinaryOperatorParselet(2)
  }

  parse(source: string) {
    this.current = 0
    this.tokens = new Lexer(source).tokenize()
    debugger
    return this.parseExpression(0)
  }

  parseExpression(precedence: number) {
    const token = this.consume()
    const prefix = this.prefixParselets[token.type]
    if (!prefix) throw new Error("Unexpected token.")

    let left = prefix.parseFn(this, token)
    while (this.getPrecedence() > precedence) {
      const nextToken = this.consume()
      const infix = this.infixParselets[nextToken.type]!
      left = infix.parseFn(this, left, nextToken)
    }

    return left
  }

  private consume() {
    return this.tokens[this.current++]
  }

  private peek() {
    return this.tokens[this.current]
  }

  private getPrecedence() {
    const token = this.peek()
    if (!token) return 0
    const infix = this.infixParselets[token.type]
    return infix?.precedence ?? 0
  }
}
