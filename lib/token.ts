export type TokenType =
  | "IDENT"
  | "NUMBER"
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "COMMA"
  | "LPAREN"
  | "RPAREN"
  | "EOF"

export type Token = {
  type: TokenType
  lexeme: string
}
