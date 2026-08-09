export type Expression =
    LiteralExpression |
    IdentifierExpression |
    BinaryExpression |
    CallExpression |
    MemberExpression;



export interface LiteralExpression {

    type:"Literal";

    value:string|number|boolean;

}



export interface IdentifierExpression {

    type:"Identifier";

    name:string;

}



export interface BinaryExpression {

    type:"Binary";

    operator:string;

    left:Expression;

    right:Expression;

}



export interface CallExpression {

    type:"Call";

    callee:Expression;

    arguments:Expression[];

}



export interface MemberExpression {

    type:"Member";

    object:Expression;

    property:string;

}