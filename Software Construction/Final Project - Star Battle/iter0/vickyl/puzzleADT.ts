enum gameStatus {Unsolved, PartiallySolved, Solved}
export interface Puzzle {
    // these specs were written under the assumption that each time the player makes a 
    // placement, something will be sent to the server and then sent back to the client.
    // But if we're only sending after player thinks it's solved, then we might only need
    // to check if the game is solved or not. (edit: I think this might make more sense since 
    // this ADT is supposed to be immutable and the placements is done in the client ADT but I'll
    // leave this up to the implementor)

    /**
     * Checks the current status of the game
     * 
     * @returns the status of the game, whether it's been unsolved, partially solved,
     *          or fully-solved
     */
    checkGameStatus(): gameStatus;
    //OR
    /**
     * Checks if the puzzle has been completed, obeying all rules
     * 
     * @returns if the puzzle is completed
     */
    checkGameComplete(): boolean;

    /**
     * Places a star at a specified location
     * 
     * @param x x coordinate to place the star
     * @param y y coordinate to place the star
     * @returns a new puzzle board including the new placement
     */
    placeStar(x:number, y:number): Puzzle;

    /**
     * Checks if the specified location is a valid cell to place a star
     * (can probably be implemented as a part of checkrep instead? but it might 
     * be useful to check this before placing)
     * 
     * @param x x coordinate to place star
     * @param y y coordinate to place star
     */
    validPlacement(x:number, y:number): boolean;

    /**
     * Undoes the most recent move
     * 
     * @returns the puzzle board without the most recent move
     */
    undo(): Puzzle;
}

/**
 * Testing strategy for Puzzle:
 * 
 *      partition on this:
 *          - unsolved
 *          - partially solved
 *          - fully solved
 * checkGameStatus, checkGameComplete, validPlacement:
 *      - partition on output
 * placeStar:
 *      - partition on valid and invalid values of x, y
 *      - partition on number of times each cell has been "placed" a star on
 * undo:
 *      - partition on if there's a change in the board after the undo
 *      - parition on number of consecutive undo moves have been done
 */