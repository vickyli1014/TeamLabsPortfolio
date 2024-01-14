/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Expression, Resize, SideBySide, Filename, TopToBottom, Underscore, Caret, Caption } from './Expression';
import { Parser, ParseTree, compile, visualizeAsUrl } from 'parserlib';

/**
 * Parser for image meme expressions.
 * 
 * PS3 instructions: you are free to change this file.
 */

const grammar = `
@skip whitespace { 
    expression ::= sidebyside (topToBottomOperator sidebyside)*;
    sidebyside ::= underscore ('|' underscore)*;
    underscore ::= caret ('_' caret)*;
    caret ::= resize ('^' resize)*;
    resize ::= primitive ('@' dimension 'x' dimension)*; 
    primitive ::= filename | '(' expression ')' | caption;
}
topToBottomOperator ::= '---' '-'*;
filename ::= [A-Za-z0-9.][A-Za-z0-9._-]*;
number ::= [0-9]+;
dimension ::= number|'?';
whitespace ::= [ \\t\\r\\n]+;
caption ::= '"' [^\\n\\"]* '"';`;

// the nonterminals of the grammar
enum ExpressionGrammar {
    Expression, Resize, Primitive, TopToBottomOperator, Filename, Number, 
    Whitespace, SideBySide, Underscore, Caret, Caption, Dimension
}

// compile the grammar into a parser
const parser: Parser<ExpressionGrammar> = compile(grammar, ExpressionGrammar, ExpressionGrammar.Expression);

/**
 * Parse a string into an expression.
 * 
 * @param input string to parse
 * @returns Expression parsed from the string
 * @throws ParseError if the string doesn't match the Expression grammar
 */
export function parseExpression(input: string): Expression {
    // parse the example into a parse tree
    const parseTree: ParseTree<ExpressionGrammar> = parser.parse(input);

    // display the parse tree in various ways, for debugging only
    // console.log("parse tree:\n" + parseTree);
    // console.log(visualizeAsUrl(parseTree, ExpressionGrammar));

    // make an AST from the parse tree
    const expression: Expression = makeAbstractSyntaxTree(parseTree);
    // console.log("abstract syntax tree:\n" + expression);
    
    return expression;
}
    
/**
 * Convert a parse tree into an abstract syntax tree.
 * 
 * @param parseTree constructed according to the grammar for image meme expressions
 * @returns abstract syntax tree corresponding to the parseTree
 */
function makeAbstractSyntaxTree(parseTree: ParseTree<ExpressionGrammar>): Expression {
    if (parseTree.name === ExpressionGrammar.Expression) {
        // expression ::= sidebyside (topToBottomOperator sidebyside)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.SideBySide);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((result, subexpr) => new TopToBottom(result, subexpr));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.SideBySide) {
        // sidebyside ::= underscore ('|' underscore)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Underscore);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((result, subexpr) => new SideBySide(result, subexpr));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Underscore) {
        // underscore ::= caret ('_' caret)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Caret);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((result, subexpr) => new Underscore(result, subexpr));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Caret) {
        // caret ::= resize ('^' resize)*;
        const children: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Resize);
        const subexprs: Array<Expression> = children.map(makeAbstractSyntaxTree);
        const expression: Expression = subexprs.reduce((result, subexpr) => new Caret(result, subexpr));
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Resize) {
        // resize ::= primitive ('@' number 'x' number)*;
        const child: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Primitive);
        const dimensions: Array<ParseTree<ExpressionGrammar>> = parseTree.childrenByName(ExpressionGrammar.Dimension);
        let expression: Expression = makeAbstractSyntaxTree(child[0] ?? assert.fail("missing child"));
        for (let i=0; i<dimensions.length; i+=2) {
            const width = dimensions[i] ?? assert.fail("missing width");
            const height = dimensions[i+1] ?? assert.fail("missing height");
            const widthInp = width.text === '?' ? undefined : parseInt(width.text);
            const heightInp = height.text === '?' ? undefined : parseInt(height.text);
            expression = new Resize(expression, widthInp, heightInp);
        }
        return expression;

    } else if (parseTree.name === ExpressionGrammar.Primitive) {
        // primitive ::= filename | '(' expression ')' | caption;;
        const child: ParseTree<ExpressionGrammar> = parseTree.children[0] ?? assert.fail('missing child');
        if (child.name === ExpressionGrammar.Filename || child.name === ExpressionGrammar.Expression || child.name === ExpressionGrammar.Caption) {
            return makeAbstractSyntaxTree(child);
        } else {
            assert.fail(`Primitive node unexpected child ${ExpressionGrammar[child.name]}`);
        }

    } else if (parseTree.name === ExpressionGrammar.Filename) {
        // filename ::= [A-Za-z0-9./][A-Za-z0-9./_-]*;
        const file:string = parseTree.text;
        return new Filename(file);


    } if (parseTree.name === ExpressionGrammar.Caption) {
        // caption ::= '"'[^\\n\\"]*'"';`
        const caption:string = (parseTree.text).slice(1, -1);
        return new Caption(caption);
    } else {
        assert.fail(`cannot make AST for ${ExpressionGrammar[parseTree.name]} node`);
    }
}

/**
 * Main function. Parses and then reprints an example expression.
 */
function main(): void {
    const input = "foo_bar.png|baz-qux.jpg";
    console.log(input);
    const expression = parseExpression(input);
    console.log(expression);
}

if (require.main === module) {
    main();
}
