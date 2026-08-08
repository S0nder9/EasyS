import { TokenType } from './TokenType';

export const Keywords: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  if: TokenType.If,
  else: TokenType.Else,
  return: TokenType.Return,
  function: TokenType.Function,
};
