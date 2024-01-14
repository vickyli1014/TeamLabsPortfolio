import { Puzzle, Coordinate } from "./Puzzle";
import assert from 'assert';
import { Parser, ParseTree, compile, visualizeAsUrl } from 'parserlib';

// the grammar for solved and empty puzzles
const grammar = `
@skip comments {
    puzzleGram ::= "10x10" (newline region){10} (newline)*;
    region ::= left (whitespace)* "|" whitespace right;
    left ::= (coordinate whitespace coordinate)?;
    right ::= (coordinate (whitespace)?)*;
    coordinate ::= xyValue "," xyValue;
    xyValue ::= ("10" | [1-9]);
}
newline ::= "\\r"? "\\n";
whitespace ::= [\\t\\r" "]+;
comments ::= ("#" [^\\n]* newline);
`;

// the nonterminals of the grammar
enum PuzzleGrammar { PuzzleGram, Region, Left, Right, Coordinate, XYValue, Comments,
            Newline, Whitespace}

// compile the grammar into a parser
const parser: Parser<PuzzleGrammar> = compile(grammar, PuzzleGrammar, PuzzleGrammar.PuzzleGram);

/**
 * parses string representation of an empty or solved puzzle into a Puzzle object
 * 
 * @param input string describing puzzle to be parsed (must be either empty or solved puzzle)
 * @returns Puzzle described by the input string
 * @throws an error if given input doesn't match puzzle grammar
 */
export function parse(input: string): Puzzle {
    return new Puzzle(parseToArray(input));  
}

/**
 * parses string describing a Star Battle puzzle into an array which can be passed into the constructor
 * of Puzzle to create the specified puzzle object
 * 
 * @param input string describing puzzle to be parsed (must be either empty or solved puzzle)
 * @returns An array of regions in a Star Battle puzzle, where each region is formatted
 *          as an array with exactly two elements,
 *          the first of which holds all coordinates in the region that have stars and the
 *          second of which holds all coordinates in the region without stars
 */
export function parseToArray(input: string):Array<Array<Array<Coordinate>>> {
    // parse the example into a parse tree
    const parseTree: ParseTree<PuzzleGrammar> = parser.parse(input);
    assert (parseTree.name === PuzzleGrammar.PuzzleGram);
    const children: Array<ParseTree<PuzzleGrammar>> = parseTree.childrenByName(PuzzleGrammar.Region);
    assert(children.length, "missing children");
    const regions: Array<Array<Array<Coordinate>>> = children.map(makeRegion);
    return regions;
}

/**
 * @param parseTree constructed according to the grammar for a region of a Star Battle board
 * @returns An array of array of Coordinates, where the outermost array has exactly two elements,
 *          the first of which holds all coordinates in the region that have stars and the
 *          second of which holds all coordinates in the region without stars
 */
export function makeRegion(parseTree: ParseTree<PuzzleGrammar>): Array<Array<Coordinate>> {
    assert(parseTree.name === PuzzleGrammar.Region);
    const left: Array<ParseTree<PuzzleGrammar>> = parseTree.childrenByName(PuzzleGrammar.Left);
    const right: Array<ParseTree<PuzzleGrammar>> = parseTree.childrenByName(PuzzleGrammar.Right);
    const leftCoords = left.map(makeSide)[0];
    const rightCoords = right.map(makeSide)[0];
    assert(leftCoords !== undefined);
    assert(rightCoords !== undefined);
    return [leftCoords, rightCoords];
}

/**
 * @param parseTree constructed according to the grammar of one side of a specified region of a Star Battle
 *                  board (a "side" of a region being all Coordinates of the region that are blank, or all 
 *                  Coordinates of the region that are filled with stars)
 * @returns an array of all Coordinates in this side of the region
 */
function makeSide(parseTree: ParseTree<PuzzleGrammar>): Array<Coordinate> {
    assert(parseTree.name === PuzzleGrammar.Right || parseTree.name === PuzzleGrammar.Left);
    const children: Array<ParseTree<PuzzleGrammar>> = parseTree.childrenByName(PuzzleGrammar.Coordinate);
    if (children.length == 0) {
        return [];
    }
    return children.map(makeCoordinate);
}

/**
 * @param parseTree constructed according to the grammar of a single coordinate point
 * @returns a Coordinate instance of the specified point, adjusted to 0-indexing
 */
function makeCoordinate(parseTree: ParseTree<PuzzleGrammar>): Coordinate {
    assert(parseTree.name === PuzzleGrammar.Coordinate);
    const children: Array<ParseTree<PuzzleGrammar>> = parseTree.childrenByName(PuzzleGrammar.XYValue);
    assert(children.length, "missing children");
    const coordinates: Array<number> = children.map(makeSingleCoord);
    const row = coordinates[0];
    const col = coordinates[1];
    assert(row !== undefined);
    assert(col !== undefined);
    return {row:row, col:col}; 
}

/**
 * @param parseTree constructed according to the grammar of a single coordinate value (x or y)
 * @returns that value as a number
 */
function makeSingleCoord(parseTree: ParseTree<PuzzleGrammar>): number {
    assert(parseTree.name === PuzzleGrammar.XYValue);
    const coord = parseInt(parseTree.text);
    assert(coord !== undefined);
    return coord - 1; // subtracting 1 since rest of code works with 0 indexing
}