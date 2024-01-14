import { Puzzle } from "./puzzleADT";
import { Canvas, Image, createCanvas, getImage } from './image-library';
export interface Client {
    /**
     * Requests a blank puzzle
     * 
     * @returns a blank puzzle
     */
    requestBlankPuzzle(): Puzzle;

    /**
     * Displays the puzzle on the screen
     * 
     * @returns a Canvas to be displayed on the screen?
     */
    display(): Canvas|void;

    /**
     * Places a star at a specified cell. Cell must originally be empty
     * 
     * @param row row to place the star
     * @param col column to place the star
     */
    placeStar(row:number, col:number): void;

    /**
     * Removes a star at the specified cell. Cell must originally have a star
     * 
     * @param row row coordinate to remove the star
     * @param col column to remove the star
     */
    removeStar(row:number, col:number): void;
    
    /**
     * Informs the user that they have completed the puzzle
     * 
     * @returns a Canvas that pops up to tell the user?
     */
    displayCompletion(): Canvas|void;

    /**
     * Checks if the puzzle has been completed, obeying all rules
     * 
     * @returns if the puzzle is completed
     */
    checkCompletion(): boolean;

    /**
     * Checks if the specified location is a valid cell to place a star
     * (can probably be implemented as a part of checkrep instead? but it might 
     * be useful to check this before placing)
     * 
     * @param x x coordinate to place star
     * @param y y coordinate to place star
     */
    validPlacement(x:number, y:number): boolean;
}

/**
 * Testing strategy for Client:
 * 
 * placeStar, removeStar:
 *      - partition on valid and invalid values of row, col
 * checkCompletion, validPlacement:
 *      - partition on output
 */