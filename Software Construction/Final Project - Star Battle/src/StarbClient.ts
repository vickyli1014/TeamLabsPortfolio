/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This code is loaded into starb-client.html, see the `npm compile` and
//   `npm watchify-client` scripts.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.

import assert from 'assert';
import { Puzzle } from "./Puzzle";
import { parse } from './Parser';
import fetch from 'node-fetch';

/**
 * Puzzle to request and play.
 * Project instructions: this constant is a [for now] requirement in the project spec.
 */
const PUZZLE = "kd-1-1-1.starb";
const ROWS = 10;
const COLUMNS = 10;
const REGIONCOLOR = new Map<number, string>([
    [1, '#1f77b4'],
    [2, '#ff7f0e'],
    [3, '#2ca02c'],
    [4, '#d62728'],
    [5, '#9467bd'], 
    [6, '#8c564b'],
    [7, '#e377c2'],
    [8, '#7f7f7f'],
    [9, '#bcbd22'],
    [0, '#17becf']]);

/**
 * Mutable client web page displaying Star Battle game
 */
export class Client {
    /**
     * Abstraction function:
     *  AF(display, output, puzzle): Client webpage which displays a Star Battle game `puzzle` board on the `display area`
     *              and communicates with the puzzle's player through text written to the `output area`
     * 
     * Rep invariant:
     *  RI(display, output, puzzle): True
     * 
     * Safety from rep exposure:
     *  - Display and output are private and readonly
     *      - they are directly set from parameters, but this is intentional to allow them to connect with the HTML document
     *          and actually draw onto the webpage
     *      - they are never returned from any methods
     *  - Puzzle is immutable, so it's safe to directly set puzzle instances as part of the rep without risking that they will be
     *          modified elsewhere
     *      - the puzzle field is never returned from any method
     */

    /**
     * initializes a client displaying a blank Star Battle game
     * 
     * @param display Canvas to display game on 
     * @param output Area to print output messages to
     * @param puzzle Puzzle instance that represents an initial blank game
     */
    public constructor(private readonly display:HTMLCanvasElement, 
                        private readonly output:HTMLElement, 
                        private puzzle: Puzzle) {
        this.fillColors();
        this.drawGrid();
        this.attachListeners();
        this.checkRep();
    }

    /**
     * Attaches listener for detecting clicks to each individual cell of the puzzle board
     */
    private attachListeners(): void {
        this.display.addEventListener('click', (event: MouseEvent) => {
            const x = event.offsetX;
            const y = event.offsetY;
            // get coordinates from raw x + y values
            // Board is partitioned evenly into rows and columns, 
            //      so we can simply scale values and round to integers
            const row = Math.floor(y/(this.display.height) * ROWS);
            const col = Math.floor(x/(this.display.width) * COLUMNS);
            this.clicked(row, col);
        });
        this.checkRep();
    }

    /**
     * Processes a click to a cell of the Star Battle puzzle
     * Adds a star at that location if there is currently no star there 
     * Removes the star at that location if there is currently a star there
     * Displays the new state of the puzzle to the web page
     * 
     * If a click is made on a border between cells, the click is processed as
     *     a click to the closest cell
     * 
     * @param row row of cell clicked on
     * @param column column of cell clicked on
     */
    public clicked(row:number, column:number): void {
        // tries adding star first, and if that fails tries removing star
        let newPuzzle = this.puzzle.addStar({row, col:column});
        if (newPuzzle !== undefined) {
            this.drawStar(row, column);
        }

        else {
            newPuzzle = this.puzzle.removeStar({row, col:column});
            if (newPuzzle !== undefined) {
                this.coverStar(row, column);
            }
        }

        if (newPuzzle !== undefined) {
            this.puzzle = newPuzzle;
        }
        this.checkRep();
    }

    /**
     * Checks if the game is over and displays a message to the output area saying whether it is or not
     */
    public solved(): void {
        if (this.puzzle.checkComplete()) {
            this.printOutput("Puzzle solved! :)");
        } else {
            this.printOutput("Hmmmmm, not quite solved :(");
        }
        this.checkRep();
    }

    /**
     * Print a message to the outputArea
     * 
     * @param message message to display
     */
    private printOutput(message: string): void {
        this.output.innerText += message + '\n';

        this.output.scrollTop = this.output.scrollHeight;
        this.checkRep();
    }

    // asserts that the rep invariant is satisfied
    private checkRep(): void {
        assert(true);
    }

    /**
     * @inheritdoc
     */
    public toString(): string {
        this.checkRep();
        let ret = "current puzzle:\n" + this.puzzle.toString();
        if (this.puzzle.checkComplete()) {
            ret += "\n has been solved!";
        }
        else {
            ret += "\n has not been solved yet";
        }
        return ret;
    }

    // everything below this are methods for drawing

    /**
     * Draws the grid of the board. This is not including the different regions 
     * and star placements
     */
    private drawGrid(): void {
        const context = this.display.getContext('2d');
        assert(context);
        // draw horizontal lines
        for (let yCoord=0; yCoord<=this.display.height; yCoord+=this.display.height/ROWS) {
            context.moveTo(0, yCoord);
            context.lineTo(this.display.width, yCoord);
            context.stroke();
        }
        // draw vertical lines
        for (let xCoord=0; xCoord<=this.display.width; xCoord+=this.display.width/COLUMNS) {
            context.moveTo(xCoord, 0);
            context.lineTo(xCoord, this.display.height);
            context.stroke();
        }
        this.checkRep();
    }

    /**
     * Fills in the colors of each cell according to the region it belongs in
     */
    private fillColors(): void{
        const context = this.display.getContext('2d');
        assert(context);
        for (let i=0; i<ROWS; i++) {
            for (let j=0; j<COLUMNS; j++) {
                this.coverStar(i, j);
            }
        }
        this.checkRep();
    }

    /**
     * Draws a star on the specified cell
     * 
     * @param row row index of cell
     * @param column column index of cell
     */
    private drawStar (row:number, column:number):void {
        // draw star to this.cells[row][column]
        const { startX, startY } = this.getCellBorders(row, column);
        const context = this.display.getContext('2d');
        assert(context);
        const width = this.display.width/COLUMNS;
        const height = this.display.height/ROWS;

        const image = new Image();
        image.onload = () => {
            context.drawImage(image, startX, startY, width, height);
        };
        image.src = "src/star.png";

        // reset the origin and styles back to defaults
        context.restore();
        this.checkRep();
    }

    /**
     * Fills in the cell with its region's color to cover a star that exists there.
     * Essentially removes the star
     * 
     * @param row row index of cell
     * @param column column index of cell
     */
    private coverStar (row:number, column:number):void {
        const { startX, startY} = this.getCellBorders(row, column);
        const region = this.regionOf(row, column); 
        const context = this.display.getContext('2d');
        assert(context);
        const width = this.display.width/COLUMNS;
        const height = this.display.height/ROWS;

        context.fillStyle = REGIONCOLOR.get(region) ?? assert.fail('invalid region');
        context.fillRect(startX, startY, width, height);
        this.drawGrid();
        this.checkRep();
    }

    /**
     * Identifies and returns the region that a specified cell is a part of
     * 
     * @param row row of cell
     * @param col column of cell
     * @returns The region that the cell belongs to
     */
    private regionOf(row:number, col:number): number {
        const allRegions = this.puzzle.getRegions();
        const specifiedRow = allRegions[row];
        assert(specifiedRow);

        const cell = specifiedRow[col];
        assert(cell !== undefined && cell >= 0 && cell < COLUMNS); 
        this.checkRep();
        return cell;
    }

    /**
     * Returns the coordinates of the opposing corners of a specified cell
     * 
     * @param row row of cell
     * @param col column of cell
     * @returns the x and y values that border the cell
     */
    private getCellBorders(row:number, col:number): {startX:number, startY:number} {
        const cellWidth = this.display.width/COLUMNS;
        const cellHeight = this.display.height/ROWS;
        const startY = row * cellWidth;
        const startX = col * cellHeight;

        this.checkRep();
        return {startX, startY};
    }

    /**
     * @param that client this is being compared to
     * @returns whether the two clients have observational equality
     */
    public equalValue(that:Client): boolean {
        // check each part of the client for equality
        if (!this.puzzle.equalValue(that.puzzle)) {
            return false;
        }
        if (!(this.output.innerText === that.output.innerText)) {
            return false;
        }

        // check whether all pixels of the display match
        const context = this.display.getContext("2d");
        const thatContext = that.display.getContext("2d");
        assert(context !== null);
        assert(thatContext !== null);
        for (let i = 0; i < this.display.width; i++) {
            for (let j = 0; j < this.display.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1).data;
                const thatPixel = thatContext.getImageData(i, j, 1, 1).data;
                const expandedPixel = [...pixel];
                const expandedThat = [...thatPixel];
                // 4 values make up a pixel's data
                for (let pixelVal = 0; pixelVal < 4; pixelVal++) {
                    if (expandedPixel[pixelVal] !== expandedThat[pixelVal]) {
                        return false;
                    }
                }
            }
        }
        // reaching this point means no values were unequal
        return true;
    }

    /**
     * Initializes a new client displaying a blank Star Battle game
     * 
     * @param display Canvas to display game on 
     * @param output Area to print output messages
     * @returns (a promise for) a new client with a blank game of the puzzle fetched from the server
     */
    public static async parseFromServer(display: HTMLCanvasElement, output: HTMLElement): Promise<Client> {
        const puzzleStr = (await fetch('http://localhost:8789/'+PUZZLE)).text();
        const puzzle = parse(await puzzleStr);
        const client = new Client(display, output, puzzle);
        return client;
    }
}

/**
 * Set up the page
 */
async function main(): Promise<void> {

    const outputArea: HTMLElement = document.getElementById('outputArea') ?? assert.fail('missing output area');
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement ?? assert.fail('missing drawing canvas');

    const player = await Client.parseFromServer(canvas, outputArea);

    const checkCompleteButton: HTMLElement = document.getElementById('checkCompleteButton') ?? assert.fail('missing check complete button');
    checkCompleteButton.addEventListener('click', () => {
        player.solved();
    });
}

void main();