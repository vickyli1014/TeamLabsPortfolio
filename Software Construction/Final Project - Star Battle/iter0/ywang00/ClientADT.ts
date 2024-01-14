export class Client {

    private readonly puzzle: Puzzle; // from the Puzzle ADT

    // Abstract function
    //      AF(id, puzzle) = a 10x10 2-star puzzle game for player identified by `id` that is represented by `puzzle`
    // Rep invariant
    //      `id` = integer
    //      `puzzle` has 10x10 cells with 10 regions 
    // Safety from rep exposure
    //      all fields are immutable and readonly

    public constructor(public readonly id: number) {
    }

    /**
     * Start a new game
     * 
     * @returns a new puzzle game
     */
    public startGame(): Puzzle {

    }

    /**
     * Fill a specific location on the board with a star
     * 
     * @param x the x coordinate to place the star
     * @param y the y coordinate to place the star
     */
    public fillStar(x: number, y: number): void {

    }

    /**
     * Fill a specific location on the board with a dot (indicating an empty cell)
     * 
     * @param x the x coordinate to place the dot
     * @param y the y coordinate to place the dot
     */
    public fillEmpty(x: number, y: number): void {

    }

    /**
     * Remove what has been filled at a specific location on the board. Requires that location x, y must not be empty
     * 
     * @param x the x coordinate to clear
     * @param y the y coordinate to clear
     */
    public clear(x: number, y: number): void {

    }

    /**
     * Checks whether the player has successfully arrived at the solution according to the rules of the game
     */
    public checkSolution(): void {

    }

    /**
     * Display a hint for the player
     * 
     * @returns a string that represents the hint to be displayed
     */
    public getHint(): string {

    }
}

/*
 * Testing Strategy for Client class
 * 
 * all(constructor(), startGame(), fillStar(), fillEmpty(), clear(), checkSolution(), getHint())
 *      partition on `this.id`: valid, invalid
 * 
 * constructor(), fillStar(), fillEmpty(), clear(), checkSolution(), getHint()
 *      partition on `this.puzzle`: unfilled puzzle, partially filled puzzle, entirely filled puzzle
 * 
 * fillStar(), fillEmpty(), clear()
 *      partition on validity of (x, y) (according to the rules of the game): valid, invalid
 *      partition on the location of (x, y): filled, not filled 
 * 
 * checkSolution()
 *      partition on status of `this.puzzle`: not solved, solved correctly, solved incorrectly
 * 
 * getHint() 
 *      partition on status of `this.puzzle`: all cells filled, not all cells filled
 *      parrition on output: there is a possible hint to be given, there are no possible hints to be given
 * 
 * 
 * [I noticed that the partitions here ended up being quite similar to my partitions for the server, not sure if
 * something went wrong. But I suppose this kind of makes sense since the server requests are based on the client's
 * actions, which would be included here.]
 */