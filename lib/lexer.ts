import type { Token, TokenType } from "./token"

export class Lexer {
  private start = 0
  private current = 0
  private tokens: Token[] = []

  constructor(private source: string) { }

  scanTokens() {
    while (!this.isAtEnd) {
      this.start = this.current
      this.scanToken()
    }
    this.addToken("EOF", "")
    return this.tokens
  }

  private scanToken() {
    const char = this.advance()
    switch (char) {
      case "+":
        this.addToken("PLUS")
        break
      case "-":
        this.addToken("MINUS")
        break
      case "*":
        this.addToken("STAR")
        break
      case "/":
        this.addToken("SLASH")
        break
      case ",":
        this.addToken("COMMA")
        break
      case "(":
        this.addToken("LPAREN")
        break
      case ")":
        this.addToken("RPAREN")
        break
      case " ":
        break
      default: {
        if (this.isDigit(char)) {
          this.number()
        } else if (this.isAlphabet(char)) {
          this.identifier()
        } else {
          throw new Error(`Unexpected token '${this.source[this.current - 1]}'.`)
        }
      }
    }
  }

  private get isAtEnd() {
    return this.current >= this.source.length
  }

  private isDigit(char: string) {
    return /[0-9]{1}/.test(char)
  }

  private isAlphabet(char: string) {
    return /[a-zA-Z]{1}/.test(char)
  }

  private advance() {
    return this.source[this.current++]
  }

  private peek() {
    return this.source[this.current]
  }

  private peekNext() {
    return this.source[this.current + 1]
  }

  private addToken(type: TokenType, lexeme?: string) {
    this.tokens.push({ type, lexeme: lexeme ?? this.source.slice(this.start, this.current) })
  }

  private number() {
    while (this.isDigit(this.peek())) {
      this.advance()
    }
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance()
      while (this.isDigit(this.peek())) this.advance()
    }
    this.addToken("NUMBER")
  }

  private identifier() {
    while (this.isAlphabet(this.peek())) this.advance()
    this.addToken("IDENT")
  }
}
