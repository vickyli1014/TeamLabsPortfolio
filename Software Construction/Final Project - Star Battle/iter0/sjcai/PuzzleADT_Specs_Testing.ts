/**
 * A data type representing immutable Star Battle puzzles
 */
export class Puzzle {
    /**
     * @returns whether the Puzzle is solved
     */
    public solved():boolean {
        throw new Error();
    }

    /**
     * @row row to add star to
     * @col column to add star to
     * @throws an error if adding the star would break some rule of the game
     *      (row or column or region has more than 2 stars, stars adjacent)
     * @returns a puzzle identical to the current puzzle except with a
     *          star added at the specified row and column
     */
    public addStar(row:number, col:number):Puzzle {
        throw new Error();
    }

    /**
     * @row row of star to remove
     * @col column of star to remove
     * @throws an error if no star exists at that location
     * @returns a puzzle identical to the current puzzle except with a
     *          star removed at the specified row and column
     */
    public removeStar(row:number, col:number):Puzzle {
        throw new Error();
    }
}

/* testing strategy:
    partitions on this for all instance methods:
        - state of the board: solved, blank, partially solved

    partitions for addStar:
        - legality of adding a star here: legal, illegal
            - further partition for illegal case:
                - reason this is illegal: too many stars in region or stars would be adjacent
                    - partition for too many stars in region: limited by row, column, or region
                    - partition for stars adjacent: horizontally, vertically, diagonally adjacent
            - further partitions for legal case:
                - number of stars already in row: 0, 1
                - number of stars already in column: 0, 1
                - number of stars already in region: 0, 1
   
    partitions for removeStar:
        - legality of operation: star currently exists at that location, doesn't exist
            - further partitions for legal case:
                - number of stars already in row: 0, 1
                - number of stars already in column: 0, 1
                - number of stars already in region: 0, 1

    No additional partitions for solved
*/