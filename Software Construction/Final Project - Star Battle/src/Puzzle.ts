import assert from 'assert';

export type Coordinate = {
    // Abstrction Function:
    //      AF(row, col) = the coordinate (row, col) of a cell on the puzzle board where (0, 0) is the top left corner;
    //                     the coordinates are 0-indexed
    row: number,
    col: number
}

const ROWS = 10;
const COLUMNS = 10;
const REGIONS = 10;

/**
 * An immutable data type representing a 10x10 2-Star Puzzle game.
 */
export class Puzzle {

    private readonly starsByRow: Map<number, Set<number>> = new Map();
    private readonly starsByCol: Map<number, Set<number>> = new Map();
    private readonly starsByRegion: Map<number, Set<number>> = new Map();
    private readonly emptiesByRegion: Map<number, Set<number>> = new Map();
    private readonly allStars: Set<number> = new Set();

    private readonly rowNum: number = 0;
    private readonly colNum: number = 0;
    private readonly regionNum: number = 0;

    // Abstraction function:
    //      AF(puzzle, starsByRow, starsByCol, starsByRegion, emptiesByRegion, allStars, seenCellsForRow, seenCellsForCol, seenCellsForRegion) 
    //                  = a 10x10 2-Star puzzle game where the array at each index of `board` represents a different region on the board, and within each subarray, 
    //                    it consists of two arrays of the coordinates where the first lists the locations of the stars in that corresponding region and the second
    //                    lists the locations of the empty cells; `starsByRow`, `starsByCol`, `starsByRegion` map each row, column, and region (0-indexed) of the board 
    //                    to a set of numbers where each unique number indicates the location of a unique star of the current board in the corresponding row, column, 
    //                    or region; `emptiesByRegion` serves a similar purpose except it maps the region to a set of numbers representing the empty cells of that region; 
    //                    similarly, `allStars` is a set of numbers where each number represents the location of a unique star of the current board; lastly, `seenCellsForRow`,
    //                    `seenCellsForCol`, and `seenCellsForRegion` are sets of numbers indicating which row number and column number the board has cells in (which should be
    //                    the numbers 0 to 9 for all three sets)
    // Representation invariant:
    //      - length and width of `puzzle` are both 10 
    //      - there are exactly 10 regions on the puzzle board
    // Safety from rep exposure:
    //      - all fields are private and readonly
    //      - only `puzzle` is public but every method that returns an instance of Puzzle creates a new instance

    /**
     * Creates a 10x10 2-Star Puzzle game board based according ot the given board
     * 
     * @param board array representing the current puzzle board where each index of the array represents a different 
     *               region on the board and the two arrays that each of those arrays consists of list the locations of 
     *               the stars and empty cells, respectively, of that particular region
     */
    public constructor(public readonly board: Array<Array<Array<Coordinate>>>) {
        const seenCellsForRow: Set<number> = new Set();
        const seenCellsForCol: Set<number> = new Set();
        const seenCellsForRegion: Set<number> = new Set();
        for (let regionInd = 0; regionInd < REGIONS; regionInd++) {
            const region = board[regionInd];
            assert(region);
            const stars = region[0];
            assert(stars);
            for (const star of stars) {
                const starRow = star.row;
                const starCol = star.col;
                const setRep = starRow * COLUMNS + starCol;
                // add row and column numbers to seenCellsForRow, seenCellsForCol, and seenCellsForRegion for each star
                seenCellsForRow.add(starRow);
                seenCellsForCol.add(starCol);
                seenCellsForRegion.add(regionInd);
                // add star to allStars 
                this.allStars.add(setRep);
                // adds star to starsByRow for corresponding row where rows are numbered 0-9
                if (this.starsByRow.get(starRow) === undefined) {
                    this.starsByRow.set(starRow, new Set([setRep]));
                } else {
                    this.starsByRow.get(starRow)?.add(setRep);
                }
                // adds star to starsByCol for corresponding column where columns are numbered from 0-9
                if (this.starsByCol.get(starCol) === undefined) {
                    this.starsByCol.set(starCol, new Set([setRep]));
                } else {
                    this.starsByCol.get(starCol)?.add(setRep);
                }
                // adds star to starsByRegion for corresponding region where regions are numbered from 0-9
                if (this.starsByRegion.get(regionInd) === undefined) {
                    this.starsByRegion.set(regionInd, new Set([setRep]));
                } else {
                    this.starsByRegion.get(regionInd)?.add(setRep);
                }
            }
            const empty = region[1];
            assert(empty);
            for (const emptyCellCoord of empty) {
                const setRep = emptyCellCoord.row * COLUMNS + emptyCellCoord.col;
                // add row and column numbers to seenCellsForRow, seenCellsForCol, and seenCellsForRegion for each empty cell
                seenCellsForRow.add(emptyCellCoord.row);
                seenCellsForCol.add(emptyCellCoord.col);
                seenCellsForRegion.add(regionInd);
                // adds emtpy cell to emptiesByRegion for corresponding region where regions are numbered from 0-9
                if (this.emptiesByRegion.get(regionInd) === undefined) {
                    this.emptiesByRegion.set(regionInd, new Set([setRep]));
                } else {
                    this.emptiesByRegion.get(regionInd)?.add(setRep);
                }
            }
        }
        this.rowNum = seenCellsForRow.size;
        this.colNum = seenCellsForCol.size;
        this.regionNum = seenCellsForRegion.size;

        this.checkRep();
    }

    /**
     * Check that the rep invariant is true
     */
    private checkRep(): void {
        assert(this.rowNum === ROWS);
        assert(this.colNum === COLUMNS);
        assert(this.regionNum === REGIONS);
    }

    /**
     * Create a new Puzzle with all the stars cleared from the board 
     * 
     * @returns a blank puzzle (with the same regions) after removing all the stars
     */
    public clear(): Puzzle {
        this.checkRep();
        const newPuzzle: Array<Array<Array<Coordinate>>> = [];
        // loop through each region of the puzzle
        for (const region of this.board) {
            const newRegion: Array<Array<Coordinate>> = [[], []];
            // loop through each location of current region and push those cells to list of empty cells
            for (const subRegion of region) {
                for (const cell of subRegion) {
                    const newCell = {row: cell.row, col: cell.col};
                    newRegion[1]?.push(newCell);
                }
            }
            newPuzzle.push(newRegion);
        }
        this.checkRep();
        return new Puzzle(newPuzzle);
    }

    /**
     * Get the coordinates of the neighbors of a given location on the puzzle board
     * 
     * @param coord the coord to get neighboring coordinates of 
     * @returns an array of coordinates that are horizontally, vertically, or diagonally adjacent to a specified location
     *          on the puzzle board
     */
    private getNeighbors(coord: Coordinate): Array<Coordinate> {
        this.checkRep();
        const neighbors: Array<Coordinate> = [];
        const row = coord.row;
        const column = coord.col;
        const offsets = [-1, 0, 1];
        for (const rowOffset of offsets) {
            const newRow = row + rowOffset;
            // if newRow is not out of bounds
            if (0 <= newRow && newRow < ROWS) {
                for (const colOffset of offsets) {
                    const newColumn = column + colOffset;
                    // if newColumn is not out of bounds and if the cell is not itself
                    if ((0 <= newColumn && newColumn < COLUMNS) && (newRow !== row || newColumn !== column)) {
                        // add cell location to list of neighbors
                        neighbors.push({row: newRow, col: newColumn});
                    }
                }
            }
        }
        this.checkRep();
        return neighbors;
    }

    /**
     * Get the regions of the current puzzle board
     * 
     * @returns an array of arrays of numbers where each subarray, indexed with i, represents a row in the board and 
     *          each number in the subarray (0-9), indexed by j, represents which of the 10 distinct regions that 
     *          particular cell of at location (i+1, j+1) belongs to; regions 0-9 are in the order they appear in the 
     *          board representation
     */
    public getRegions(): Array<Array<number>> {
        this.checkRep();
        // initializes a 2d array with all -1's
        const puzzleRegions: Array<Array<number>> = new Array<Array<number>>(ROWS)
                                                            .fill([])
                                                            .map(() => new Array<number>(COLUMNS).fill(-1));
        for (let regionInd = 0; regionInd < this.board.length; regionInd++) {
            const region = this.board[regionInd];
            assert(region);
            const stars = region[0];
            assert(stars);
            const emptyCells = region[1];
            assert(emptyCells);
            const cellsOfRegion = stars.concat(emptyCells);
            // update puzzleRegions for each cell to their corresponding region number (0-9)
            for (const cell of cellsOfRegion) {
                const puzzleRegionsCurrRow = puzzleRegions[cell.row];
                assert(puzzleRegionsCurrRow);
                puzzleRegionsCurrRow[cell.col] = regionInd;
            }
        }
        this.checkRep();
        return puzzleRegions;
    }

    /**
     * Create a new Puzzle with a star added (in addition to the current stars) to a specified location on the board 
     * 
     * @param coord the location to add the star at
     * @returns a new puzzle with a star added to location `coord` or undefined if a star already exists at the specified location
     */
    public addStar(coord: Coordinate): Puzzle | undefined {
        this.checkRep();
        const newPuzzle: Array<Array<Array<Coordinate>>> = [];
        // loop through each region of the puzzle
        for (const region of this.board) {
            const newRegion: Array<Array<Coordinate>> = [new Array<Coordinate>(), new Array<Coordinate>()];
            const stars = region[0];
            assert(stars);
            const emptyCells = region[1];
            assert(emptyCells);
            const toAdd = {row: coord.row, col: coord.col};
            // loop through each location of stars of current region
            for (const star of stars) {
                const currCell = {row: star.row, col: star.col};
                // if it finds the location in the stars array, return undefined bc a star already exists here
                if (star.row === coord.row && star.col === coord.col) {
                    return undefined;
                } else {
                    newRegion[0]?.push(currCell);
                }
            }
            // loop through each location of empty cells of current region
            for (const emptyCell of emptyCells) {
                const currCell = {row: emptyCell.row, col: emptyCell.col};
                // if it finds the location in the emptyCells array, add star to location
                if (emptyCell.row === coord.row && emptyCell.col === coord.col) {
                    newRegion[0]?.push(toAdd);
                } else {
                    newRegion[1]?.push(currCell);
                }
            }
            newPuzzle.push(newRegion);
        }
        this.checkRep();
        return new Puzzle(newPuzzle);
    }

    /**
     * Create a new Puzzle with a star at a specified location removed on the board (all other stars kept in place)
     * 
     * @param coord the location to remove the star from
     * @returns a new puzzle with the star at location `coord` removed undefined if there is no star at the specified location 
     */
    public removeStar(coord: Coordinate): Puzzle | undefined {
        this.checkRep();
        const newPuzzle: Array<Array<Array<Coordinate>>> = [];
        // loop through each region of the puzzle
        for (const region of this.board) {
            const newRegion: Array<Array<Coordinate>> = [[], []];
            const stars = region[0];
            assert(stars);
            const emptyCells = region[1];
            assert(emptyCells);
            // loop through each location of stars of current region
            for (const star of stars) {
                const currCell = {row: star.row, col: star.col};
                // if it finds the location in the stars array, remove the star at given location
                if (star.row === coord.row && star.col === coord.col) {
                    newRegion[1]?.push(currCell);
                } else {
                    newRegion[0]?.push(currCell);
                }
            }
            // loop through each location of empty cells of current region
            for (const emptyCell of emptyCells) {
                const currCell = {row: emptyCell.row, col: emptyCell.col};
                // if it finds the location in the emptyCells array, return undefined bc there is no star to remove
                if (emptyCell.row === coord.row && emptyCell.col === coord.col) {
                    return undefined;
                } else {
                    newRegion[1]?.push(currCell);
                }
            }
            newPuzzle.push(newRegion);
        }
        this.checkRep();
        return new Puzzle(newPuzzle);
    }

    /**
     * Check if the player has solved the puzzle successfully according to the rules specified in the project handout
     * 
     * @returns true if the player has successfully solved the puzzle, false otherwise
     */
    public checkComplete(): boolean {
        this.checkRep();
        // loop through each region of the puzzle
        for (const region of this.board) {
            const stars = region[0];
            assert(stars);
            // verify that each region has exactly 2 stars
            if (stars.length !== 2) {
                return false;
            }
            // loop through each location of stars of current region
            for (const star of stars) {
                // verify that each row has exactly 2 stars
                if (this.starsByRow.get(star.row) !== undefined) {
                    const starsInRow = this.starsByRow.get(star.row);
                    assert(starsInRow);
                    if (starsInRow.size !== 2) {
                        return false;
                    }
                }
                // verify that each column has exactly 2 stars
                if (this.starsByCol.get(star.col) !== undefined) {
                    const starsInCol= this.starsByCol.get(star.col);
                    assert(starsInCol);
                    if (starsInCol.size !== 2) {
                        return false;
                    }
                }
                // verify that no stars are horizontally, vertically, or diagonally adjacent
                const neighbors = this.getNeighbors(star);
                for (const neighbor of neighbors) {
                    const setRep = neighbor.row * COLUMNS + neighbor.col;
                    if(this.allStars.has(setRep)) {
                        return false;
                    }
                }
            }
        }
        // if all these conditions are satisfied, the player has successfully solved the puzzle
        return true;
    }

    /**
     * @returns a human-readable representation of the current state of this puzzle board following a similar format as 
     *          the example puzzle files; this.equalValue(parse(this.toString())) must return true for blank and solved
     *          puzzles
     */
    public toString(): string {
        let puzzleState = '10x10\n';
        for (const region of this.board) {
            const stars = region[0];
            assert(stars);
            // loop through each location of stars of current region
            for (const star of stars) {
                const starRow = star.row + 1;
                const starCol = star.col + 1;
                puzzleState = puzzleState + starRow.toString() + ',' + starCol.toString() + ' ';
            }
            puzzleState = puzzleState + '| ';
            const emptyCells = region[1];
            assert(emptyCells);
            for (const emptyCell of emptyCells) {
                const emptyCellRow = emptyCell.row + 1;
                const emptyCellCol = emptyCell.col + 1;
                puzzleState = puzzleState + emptyCellRow.toString() + ',' + emptyCellCol.toString() + ' ';
            }
            puzzleState = puzzleState + '\n';
        }

        return puzzleState;
    }

    /**
     * Check if another puzzle is equal to `this`
     * 
     * @param that an instance of Puzzle
     * @returns true if and only if `this` and `that` have the same regions, same cells with stars, and same 
     *          cells that are empty
     */
    public equalValue(that: Puzzle): boolean {
        // if `that` does not have 10 regions, return false
        if (that.board.length !== REGIONS) {
            return false;
        }
        // for every region
        for (let regionInd = 0; regionInd < REGIONS; regionInd++) {
            const thisRegion = this.board[regionInd];
            assert(thisRegion);
            const thisStars = thisRegion[0];
            assert(thisStars);
            const thisEmptyCells = thisRegion[1];
            assert(thisEmptyCells);
            const thatRegion = that.board[regionInd];
            // if that region is undefined, return false
            if (thatRegion === undefined) {
                return false;
            // otherwise
            } else {
                const thatStars = thatRegion[0];
                assert(thatStars);
                const thatEmptyCells = thatRegion[1];
                assert(thatEmptyCells);
                // if the number of stars for `this` and `that` do not match, return false
                if (thisStars.length !== thatStars.length) {
                    return false;
                }
                // if the number of empty cells for `this` and `that` do not match, return false
                if (thisEmptyCells.length !== thatEmptyCells.length) {
                    return false;
                }
                // check to see that the locations for stars match
                for (const star of thatStars) {
                    const setRep = star.row * COLUMNS + star.col;
                    if (this.starsByRegion.get(regionInd) === undefined) {
                        return false;
                    } else {
                        const stars = this.starsByRegion.get(regionInd);
                        assert(stars);
                        if (!stars.has(setRep)) {
                            return false;
                        }
                    }
                }
                // check to see that the locations for each empty cell match
                for (const emptyCell of thatEmptyCells) {
                    const setRep = emptyCell.row * COLUMNS + emptyCell.col;
                    if (this.emptiesByRegion.get(regionInd) === undefined) {
                        return false;
                    } else {
                        const emptyCells = this.emptiesByRegion.get(regionInd);
                        assert(emptyCells);
                        if (!emptyCells.has(setRep)) {
                            return false;
                        }
                    }
                }
            }

        }
        return true;
    }
    
}
