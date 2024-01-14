/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from './Rect';
import { RegionSet } from './RegionSet';
import * as utils from './utils';

/**
 * An implementation of RegionSet.
 * 
 * PS2 instructions: you must use the provided rep.
 * You may not change the spec of the constructor.
 */
export class RepMapRegionSet<L> implements RegionSet<L> {

    private readonly map: Map<L, Array<Rect>> = new Map();

    // Abstraction function:
    //   AF(map, gridSize) = a mutable map of regions, where each key is the label of the region
    //      and its corresponding value specifying the areas the region occupies on a gridSize x
    //      gridSize grid
    //      Each region is a contiguous set of square cells in a 2D grid with origin at (0,0) and 
    //      extending to (gridSize,gridSize).
    // Representation invariant:
    //   For any two key,value pair in `map`, there is no rect in one such that its coordinates overlap
    //      the rect coordinates in another pair (i.e. Rect(1, 3, 4, 5) and Rect(2, 4, 4, 5) overlap).
    //      Here overlap means that rect1.x1 <= rect2.x1 <= rect1.x2, or any similar inequality
    //   All Rect in each array must be contiguous, meaning that all rects in each array must overlap with
    //      at least one other rect in the array such that there is a sequence of overlapping rects that can
    //      get from any one rect to another in the region
    //   Dimensions/coordinates of all Rect must be integers in the range [0, gridSize)
    // Safety from rep exposure:
    //   All fields are unreassignable
    //   Rect is an immutable object
    //   All functions are either mutators or observers. Most of them don't take or output any of the fields 
    //      so there is no aliasing in those functions. Owners returns a set of labels according to the map
    //      keys but each entry in the set is a deep clone of the appropriate map keys

    /**
     * Create an empty region set for a `gridSize` x `gridSize` grid.
     * 
     * @param gridSize dimension of grid, must be nonnegative integer
     */
    public constructor(
        public readonly gridSize: number
    ) {
        this.checkRep();
    }

    /**
     * Checks if two rects intersect
     * 
     * @param rect1 a Rect
     * @param rect2 another Rect
     * @returns a boolean representing if rect1 intersects rect2
     */
    private checkIntersection(rect1:Rect, rect2:Rect): boolean {
        if (rect1.x1 === rect1.x2 || rect1.y1 === rect1.y2 || rect2.x1 === rect2.x2 || rect2.y1 === rect2.y2) {
            const rectXInBetween = rect1.x1 <= rect2.x1 && rect2.x1 <= rect1.x2 ||
                    rect1.x1 <= rect2.x2 && rect2.x2 <= rect1.x2;
            const rectYInBetween = rect1.y1 <= rect2.y1 && rect2.y1 <= rect1.y2 ||
                    rect1.y1 <= rect2.y2 && rect2.y2 <= rect1.y2;
            return rectYInBetween && rectXInBetween;
        }

        const widthIsPositive = Math.min(rect1.x2, rect2.x2) > Math.max(rect1.x1, rect2.x1);
        const heightIsPositive = Math.min(rect1.y2, rect2.y2) > Math.max(rect1.y1, rect2.y1);
        return widthIsPositive && heightIsPositive;
    }

    /**
     * Checks if a region is contiguous
     * 
     * @param region an array of Rect representing a region
     * @returns a boolean representing if region is contiguous
     */
    private checkContiguous(region:Array<Rect>): boolean {
        if (region.length === 1) { return true; }
        let contiguous = false;
        for (const rect1 of region) {
            for (const rect2 of region) {
                if (rect1 === rect2) { continue; }
                const edgeTouching = !((rect1.x1 > rect2.x2 || rect2.x1 > rect1.x2) || (rect1.y1 > rect2.y2 || rect2.y1 > rect1.y2));
                contiguous = contiguous || this.checkIntersection(rect1, rect2) || edgeTouching;
            }
        }
        return contiguous;
    }

    // Check that the rep invariant is true
    private checkRep():void {
        let previousRegions = new Array<Rect>();
        if (this.map.size > 0) {
            this.map.forEach((region:Array<Rect>, label:L) => {
                // check for contiguous
                const contiguous = this.checkContiguous(region);
                assert(contiguous, label + " not contiguous");
                // checks for intersections with other regions
                for (const rect of region) {
                    for (const area of previousRegions) {
                        assert(!this.checkIntersection(area, rect), "regions can not intersect");
                    }
                }
                previousRegions = previousRegions.concat(region);
            });
        }
        // check all rect are within range of the grid
        this.map.forEach((region, label) => {
            for (const rect of region) {
                for (const dim of [rect.x1, rect.y1, rect.x2, rect.y2]) {
                    assert(0 <= dim && dim <= this.gridSize);
                }
            }
        });
    }

    /**
     * @inheritDoc
     */
    public add(label: L, rect: Rect): void {
        // check if rect intersects existing regions
        this.map.forEach((existingRegions, existingLabel) => {
            if (existingLabel !== label) {
                for (const area of existingRegions) {
                    assert(!this.checkIntersection(rect, area));
                }
            }
        });
        // check contiguous 

        const currentRegion = this.map.get(label);
        const newRegion = ( currentRegion ? currentRegion.concat([rect]) : [rect] );
        const contiguous = this.checkContiguous(newRegion);
        assert(contiguous, "adding new rect does not keep the region contiguous");
        // add to region
        if (currentRegion === undefined) {
            this.map.set(label, [rect]);
        } else {
            this.map.set(label, currentRegion.concat([rect]));
        }
        this.checkRep();
        // decided to leave the beginning because I want to check that there are no intersections
        // and that the potential new region is contiguous before adding compared to checkRep which 
        // checks the RI of the current state. If I left it out, added and then checkRep'ed, it may 
        // leave the rect added even if it goes against the RI. I think that in terms of 
        // performance/storage it might be more expensive to make a copy, add to copy, and then 
        // checkrep. The reason why I decided to leave checkRep is because it checks a RI that I 
        // don't check in this function. Since I am kind of checking for RI twice, I don't think this
        // goes against sfb. 
    }

    /**
     * @inheritDoc
     */
    public owners(rect: Rect): Set<L> {
        const occupyingOwners = new Set<L>();
        this.map.forEach((regionArr, label) => {
            for (const region of regionArr) {
                if (this.checkIntersection(rect, region)) {
                    occupyingOwners.add(structuredClone(label));
                }
            }
        });
        return occupyingOwners;
    }

    /**
     * @inheritDoc
     */
    public bounds(label: L): Rect | undefined {
        // borders: [x1, y1, x2, y2]
        const borders = new Map<string, number>([
            ["x1", this.gridSize],
            ["y1", this.gridSize],
            ["x2", 0],
            ["y2", 0]]);
        const regionArr = this.map.get(label);
        // if label is not an existing region
        if (regionArr === undefined) {
            return undefined;
        }

        for (const region of regionArr) {
            const x1 = borders.get("x1");
            if (x1 === undefined) { assert(x1 !== undefined, "missing x1 borders"); }
                else { borders.set("x1", Math.min(x1, region.x1)); }
            const y1 = borders.get("y1");
            if (y1 === undefined) { assert(y1 !== undefined, "missing y1 borders"); }
                else { borders.set("y1", Math.min(y1, region.y1)); }
            const x2 = borders.get("x2");
            if (x2 === undefined) { assert(x2 !== undefined, "missing x2 borders"); }
                else { borders.set("x2", Math.max(x2, region.x2)); }
            const y2 = borders.get("y2");
            if (y2 === undefined) { assert(y2 !== undefined, "missing y2 borders"); }
                else { borders.set("y2", Math.max(y2, region.y2)); }
        }

        const x1 = borders.get("x1");
        const y1 = borders.get("y1");
        const x2 = borders.get("x2");
        const y2 = borders.get("y2");
        if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
            throw Error;
        }
        const boundaries = new Rect(x1, y1, x2, y2);
        return boundaries;
    }

    /**
     * Returns a string representation of the grid
     * 
     * @returns a string where cells are separated by commas. If a cell is occupied by a region, 
     *      then its corresponding cell in the string is populated by the label. If not, then it is 
     *      instead occupied by an empty space
     */
    public toString(): string {
        // initialize grid
        // adapted from https://stackoverflow.com/questions/30144580/typescript-multidimensional-array-initialization, retrieved 4/16/2023
        const grid:string[][] = new Array<string>(this.gridSize)
                            .fill(" ")
                            .map(() => new Array<string>(this.gridSize).fill(" "));
        // populate each cell with a number associated with a label that occupies it
        this.map.forEach((region, label) => {
            for (const rect of region) {
                for (let y=rect.y1; y<=rect.y2; y++) {
                    const rowInd = this.gridSize - y - 1;
                    const row = grid[rowInd];
                    for (let x=rect.x1; x<=rect.x2; x++) {
                        const colInd = this.gridSize - x - 1;
                        const labelStr: string = "" + label;
                        row ? row[colInd] = labelStr : null;
                    }
                }
            }
        });
        // convert list to string
        let stringGrid = "";
        for (let rowInd=this.gridSize-1; rowInd>=0; rowInd--) {
            for (let colInd=this.gridSize-1; colInd>=0; colInd--) {
                const row = grid[rowInd];
                row ? stringGrid += row[colInd] + ', ' : stringGrid += "_ ,";
            }
            stringGrid += "\n";
        }
        return stringGrid;
    }

}


/**
 * An implementation of RegionSet.
 * 
 * PS2 instructions: you must use the provided rep.
 * You may not change the spec of the constructor.
 */
export class RepArrayRegionSet<L> implements RegionSet<L> {

    private readonly array: Array<L | undefined> = [];

    // Abstraction function:
    //   AF(array, gridSize) = a mutable set of regions, where `array` represents a gridSize x 
    //      gridSize grid such that each element represents a cell in the grid where each cell is numbered
    //      from 0 to gridSize x gridSize - 1 and the boundaries of each cell i is (floor(i/gridSize), i%gridSize), 
    //      (floor(i/gridSize)+1, i%gridSize+1). 
    //      Each region is a contiguous set of square cells in a 2D grid with origin at (0,0) and 
    //      extending to (gridSize,gridSize).
    //      If an element in `array` is populated by a label, that region occupies the corresponding cell. 
    //      Else it's undefined and not occupied. 
    //      For any element array[i] where 0 <= i < gridSize x gridSize, 
    //          this is the cell at row floor(i / gridSize), column i % gridSize.
    // Representation invariant:
    //   The size of the array must be gridSize**2, no region can be beyond this length
    //   For each index i, if array[i] === a, then >1 of array[i+1], array[i-1], array[i+gridSize]
    //      or array[i-gridSize], each < gridSize**2 and % gridSize !+== 0, must also === a. Additionally,
    //      there must be a sequence of +/-1, +/- gridSize such that one can start at any i and end at any i.
    //      (Each region within the array are contiguous)
    // Safety from rep exposure:
    //   All fields are unreassignable
    //   No function returns or takes as input `array`, so it is never passed around or aliased. Owners returns
    //      a set of elements that refer to deep clones of the entries in array.

    /**
     * Create an empty region set for a `gridSize` x `gridSize` grid.
     * 
     * @param gridSize dimension of grid, must be nonnegative integer
     */
    public constructor(
        public readonly gridSize: number
    ) {
        this.array = new Array<L | undefined>(gridSize**2);
        this.checkRep();
    }

    // Check that the rep invariant is true
    private checkRep():void {
        // check all regions are within the dimensions of gridSize
        assert(this.array.length <= this.gridSize**2);

        // check all regions are congituous
        const setOfRegions = new Set<L>();
        for (let i=0; i<this.gridSize**2; i++) {
            const label = this.array[i];
            if (label !== undefined) 
                { setOfRegions.add(label); }
        }
        for (const label of setOfRegions) 
            { this.checkContiguous(label); }
    }

    /**
     * Gets all cells occupied by a region
     * 
     * @param label label of region
     * @returns indices of all cells that are occupied by region `label`
     */
    private getOccupyingCells(label: L): Array<number> {
        const occurringIndices = new Array<number>();
        let currentIndex = 0;
        while ((currentIndex=this.array.indexOf(label, currentIndex+1)) != -1) {
            occurringIndices.push(currentIndex);
        }
        return occurringIndices;
    }

    /**
     * Checks that a region is contiguous. Throws an error if not
     * 
     * @param label label of a region
     */
    private checkContiguous(label: L): void {
        let occurringIndices = this.getOccupyingCells(label);
        const visitedIndicies = new Set<number>();
        visitedIndicies.add(occurringIndices[0] ?? -(this.gridSize));
        for (const ind of visitedIndicies) {
            const adjacents = [ind, ind-1, ind+1, ind-this.gridSize, ind+this.gridSize];
            for (const adjacentInd of adjacents) {
                if (occurringIndices.indexOf(adjacentInd) !== -1) {
                    visitedIndicies.add(adjacentInd);
                    occurringIndices = occurringIndices.filter(x => x!==adjacentInd);
                }
            }
        }
        assert(occurringIndices.length === 0, "region not continguous");

    }

    // takes in a (row, col) Cartesian coordinate and returns which numerical index it is
    private coordsToIndex(row: number, col: number):number {
        return row*this.gridSize + col;
    }

    /**
     * @inheritDoc
     */
    public add(label: L, rect: Rect): void {
        // check for intersections
        for (let row=rect.y1; row<rect.y2; row++) {
            for (let col=rect.x1; col<rect.x2; col++) {
                const cellIndex = this.coordsToIndex(row, col);
                assert(this.array[cellIndex] === undefined || this.array[cellIndex] === label, "can not add a cell that is already part of a region");
            }
        }
        // check contiguous
        this.checkContiguous(label);
        // add rect to region
        for (let row=rect.y1; row<rect.y2; row++) {
            for (let col=rect.x1; col<rect.x2; col++) {
                const cellIndex = this.coordsToIndex(row, col);
                this.array[cellIndex] = label;
            }
        }
        this.checkRep();
    }

    /**
     * @inheritDoc
     */
    public owners(rect: Rect): Set<L> {
        const occupyingOwners = new Set<L>();
        for (let row=rect.y1; row<=rect.y2; row++) {
            for (let col=rect.x1; col<=rect.x2; col++) {
                const cellIndex = this.coordsToIndex(row, col);
                const label = this.array[cellIndex];
                if (label !== undefined) {
                    occupyingOwners.add(structuredClone(label));
                }
            }
        }
        return occupyingOwners;
    }
    // did not add comments because I think that it's pretty self explanatory and the comments would
    // just be a direct transliterations of code to English, which is bad commenting

    /**
     * @inheritDoc
     */
    public bounds(label: L): Rect | undefined {
        const occurringIndices = this.getOccupyingCells(label);
        if (occurringIndices.length === 0) 
            { return undefined; }
        // borders: [x1, y1, x2, y2]
        const borders = new Map<string, number>([
            ["x1", this.gridSize],
            ["y1", this.gridSize],
            ["x2", 0],
            ["y2", 0]]);
        for (const ind of occurringIndices) {
            const row = Math.floor(ind / this.gridSize);
            const col = ind % this.gridSize;
            const x1 = borders.get("x1");
            if (x1 === undefined) { assert(x1 !== undefined, "missing x1 borders"); }
                else { borders.set("x1", Math.min(x1, col)); }
            const y1 = borders.get("y1");
            if (y1 === undefined) { assert(y1 !== undefined, "missing y1 borders"); }
                else { borders.set("y1", Math.min(y1, row)); }
            const x2 = borders.get("x2");
            if (x2 === undefined) { assert(x2 !== undefined, "missing x2 borders"); }
                else { borders.set("x2", Math.max(x2, col)); }
            const y2 = borders.get("y2");
            if (y2 === undefined) { assert(y2 !== undefined, "missing y2 borders"); }
                else { borders.set("y2", Math.max(y2, row)); }
        }
    
        const x1 = borders.get("x1");
        const y1 = borders.get("y1");
        const x2 = borders.get("x2");
        const y2 = borders.get("y2");
        if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
            throw Error;
        }
        const boundaries = new Rect(x1, y1, x2+1, y2+1);
        return boundaries;
    }

    /**
     * Returns a string representation of the grid
     * 
     * @returns a string where cells are separated by commas. If a cell is occupied by a region, 
     *      then its corresponding cell in the string is populated by the label. If not, then it is 
     *      instead occupied by an underscore
     */
    public toString():string {
        let stringGrid = "";
        for (let row=0; row<this.gridSize; row++) {
            for (let col=0; col<this.gridSize; col++) {
                const currentIndex = this.coordsToIndex(row, col);
                const label = this.array[currentIndex];
                if (label === undefined || label === null) 
                    { stringGrid += ", _ "; }
                else { stringGrid += ", " + label.toString(); }
            }
            stringGrid += "\n";
        }
        return stringGrid;
    }
}


/**
 * @returns RegionSet implementations to test, not intended for clients
 * 
 * PS2 instructions: do not modify this function.
 * The `string` that appears in this signature does *not* become a generic parameter.
 */
export function implementations(): (new (_: number) => RegionSet<string>)[] {
    return [ RepMapRegionSet, RepArrayRegionSet ];
}
