export enum TokenType {

    // literals

    Identifier,
    String,
    Number,
    Boolean,


    // keywords

    Keyword,


    // operators

    Plus,
    Minus,
    Multiply,
    Divide,

    Equal,
    PlusEqual,

    EqualEqual,
    NotEqual,

    Greater,
    Less,
    GreaterEqual,
    LessEqual,

    And,
    Or,
    Not,


    // punctuation

    Colon,
    Comma,
    Dot,


    // structures

    OpenBrace,
    CloseBrace,

    OpenParen,
    CloseParen,

    OpenBracket,
    CloseBracket,


    // formatting

    NewLine,


    EOF
}