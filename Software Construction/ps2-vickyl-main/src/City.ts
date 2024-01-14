/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from './Rect';
import { RegionSet, makeRegionSet } from './RegionSet';
import * as utils from './utils';

/**
 * A mutable set of labeled "buildings" in 3D, where a building is a contiguous set of cubic cells
 * in a 3D grid with origin at (0,0,0) and extending to (`gridSize`,`gridSize`,`gridSize`)
 * (for some nonnegative integer `gridSize`, fixed when the set is created).
 * Coordinates (x,y,z) are interpreted as points in 3D space in the conventional way.
 * 
 * Buildings must rest on the ground (the z=0 plane), and a building must be *contiguous*:
 * any cell in the building must be reachable from any other cell in the building by a path
 * passing through adjacent cells, where we define adjacent cells as sharing a face (not just an edge or corner).
 * 
 * Buildings have floors numbered from 0 (the ground floor, resting on the ground plane) upwards to at
 * most `gridSize`-1. Each individual floor of a building must be contiguous.
 * 
 * Each building is labeled uniquely, and buildings must *not intersect*: no cell may be in more than one building.
 * 
 * Labels are of arbitrary type `L` and are compared for equality using ===. They may not be null or undefined.
 * 
 * PS2 instructions: this is a required ADT interface.
 * You may not change the specifications or add new methods.
 * 
 * @param L type of labels in this city, compared for equality using ===.
 */
export class City<L> {

    private readonly map: Map<L, Array<RegionSet<L>>> = new Map();


    // Abstraction function:
    //   AF(map, gridSize) = a mutable map of labeled buildings, where each key in `map` is the 
    //      label of the building and its values are a list of rects represented by RegionSets 
    //      that the building takes up indexed by floor number. All buildings are on a gridSize
    //      x gridSize x gridSize 3D space
    // Representation invariant:
    //   No two keys in map can share the same cell in their list of RegionSets. i.e. there is no Rect in one such that its coordinates overlap
    //      the Rect coordinates in another pair (i.e. Rect(1, 3, 4, 5) and Rect(2, 4, 4, 5) overlap).
    //      Here overlap means that rect1.x1 <= rect2.x1 <= rect1.x2, or any similar inequality
    //   Each list of RegionSets must be contiguous (can't be empty in between two RegionSets of the same key,value pair)
    //   Consecutive RegionSets within an array in map value must have at least one intersecting/overlapping rect
    //   Dimensions of all Rect must be in the range [0, gridSize)
    //   For each key, value pair in `map`, if the value is a non-empty array then the first entry can not be empty/undefined
    //   All lists in map values must have length at most gridSize
    // Safety from rep exposure:
    //   All fields are unreassignable
    //   Rect is an immutable object
    //   All functions are either mutators or observers. Most of them don't take or output any of the fields 
    //      so there is no aliasing in those functions. Owners returns a set of labels according to the map
    //      keys but each entry in the set is a deep clone of the appropriate map keys

    /**
     * Create an empty city with a `gridSize` x `gridSize` x `gridSize` grid.
     * 
     * @param gridSize dimension of city grid, must be nonnegative integer
     */
    public constructor(
        public readonly gridSize: number
    ) {
        this.gridSize = gridSize;
        this.checkRep();
    }

    private checkRep(): void {
        // all other RI are checked before modifying the city
        this.map.forEach((region, label) => {
            assert(region.length <= this.gridSize);
        });
    }

    /**
     * Checks if a rect intersects a regionSet 
     * 
     * @param rect a Rect
     * @param region a RegionSet
     * @returns a boolean representing if rect1 intersects region
     */
    private checkIntersectionToRegionSet(rect:Rect, region:RegionSet<L>): boolean {
        const owners = region.owners(rect);
        if (owners.size === 0) { return false; }
        return true;
    }

    /**
     * Check that two floors are contiguous
     * 
     * @param label label of building
     * @param topFloor the upper floor to compare
     * @param bottomFloor the lower floor to compare
     * @returns true if topFloor and bottomFloor are contiguous, if they intersect at a rect
     */
    private checkContiguousVertically(label:L, topFloor:RegionSet<L>, bottomFloor:RegionSet<L>): boolean {
        const topFloorBounds = topFloor.bounds(label);
        if (topFloorBounds !== undefined) {
            for (let row=topFloorBounds.x1; row<topFloorBounds.x2; row++) {
                for (let col=topFloorBounds.y1; col<topFloorBounds.y2; col++) {
                    const topOwning = topFloor.owners(new Rect(row, col, row, col));
                    const bottomOwning = bottomFloor.owners(new Rect(row, col, row, col));
                    if (topOwning.size + bottomOwning.size === 2) { return true; }
                }
            }
        }
        return false;
    }

    /**
     * Add a rectangle of grid cells to a particular floor of the building labeled by the given label (creating
     * a building or adding a floor if necessary), if the expanded building rests on the ground plane, is still
     * contiguous, and the expansion does not intersect with other existing buildings.
     * 
     * @param label label of building
     * @param floor floor of building to expand. Must be an integer in [0,`gridSize`-1].
     * @param rect rectangle to add to specified floor of the labeled building.  Required to have nonzero area
     *             and integer coordinates drawn from [0,`gridSize`].
     * @throws Error if adding the expansion would make the building ungrounded, the building or floor
     *         discontiguous, or cause an intersection with a cell in another building.
     */
    public expand(label: L, floor: number, rect: Rect): void {
        // check if rect on floor intersects any other buildings
        this.map.forEach((building, buildingLabel) => {
            if (buildingLabel !== label) {
                const level = building[floor];
                if (level !== undefined)
                    { assert(!this.checkIntersectionToRegionSet(rect, level)); }
            }
        });
        // check if building exists, if not it starts grounded
        if (!this.map.has(label)) {
            assert.strictEqual(floor, 0, "building must be grounded");
        }

        const building = this.map.get(label);
        // check contiguous to building part on floor
        if (building !== undefined) {
            let region = building[floor];
            if (region === undefined) {
                region = makeRegionSet<L>(this.gridSize);
                region.add(label, rect);
            }
            const contiguousHorizontal = this.checkIntersectionToRegionSet(rect, region);
            let contiguousVertical = true;
            if (floor > 0) {
                const lowerFloor = building[floor-1];
                if (lowerFloor === undefined) {
                    assert(lowerFloor !== undefined, "must add a story onto existing story");
                } else {
                    contiguousVertical = this.checkContiguousVertically(label, region, lowerFloor);
                }
            }
            assert(contiguousHorizontal || contiguousVertical, "must add contiguous region");
        }

        // expand building
        if (building === undefined) {
            const floors = new Array<RegionSet<L>>(this.gridSize);
            floors[0] = makeRegionSet<L>(this.gridSize);
            floors[0].add(label, rect);
            this.map.set(label, floors);
        } else {
            if (building[floor] === undefined) {
                const newFloor = makeRegionSet<L>(this.gridSize);
                newFloor.add(label, rect);
                building[floor] = newFloor;
            } else {
                building[floor]?.add(label, rect);
            }
        }

        this.checkRep();
    }

    /**
     * Get the labels of buildings whose projections onto the ground plane intersect the given rectangle
     * (where the intersection must contain at least one full grid cell).
     * 
     * @param rect rectangle to query. Its coordinates must be integers in [0,`gridSize`].
     * @returns the labels of buildings in this city whose projections onto the ground plane intersect with rect
     *          in at least one grid cell
     */
    public owners(rect: Rect): Set<L> {
        const occupyingOwners = new Set<L>();
        this.map.forEach((building, label) => {
            for (const floor of building) {
                if (this.checkIntersectionToRegionSet(rect, floor)) {
                    occupyingOwners.add(structuredClone(label));
                }
                break;
            }
        });
        return occupyingOwners;
    }

    /**
     * Get the footprint and height of a labeled building.
     * 
     * @param label label of building
     * @returns building's footprint (smallest rectangle that contains the projection of the building onto the
     *          ground plane) and height (number of floors in the building), or undefined if no building with
     *          that label exists in this city.
     */
    public bounds(label: L): { footprint: Rect, height: number } | undefined {
        const building = this.map.get(label);
        if (building === undefined) return undefined;
        let height = 0;
        for (const floor of building) {
            if (floor !== undefined) {
                height ++;
            } else { break; }
        }

        // borders: [x1, y1, x2, y2]
        const borders = new Map<string, number>([
            ["x1", this.gridSize],
            ["y1", this.gridSize],
            ["x2", 0],
            ["y2", 0]]);

        let prevFloor = building[0];
        for (const floor of building) {
            if (floor !== undefined && prevFloor !== undefined && floor !== undefined) {
                const boundaries = floor.bounds(label);
                if (boundaries !== undefined) {
                    const x1 = borders.get("x1");
                    if (x1 === undefined) { assert(x1 !== undefined, "missing x1 borders"); }
                        else { borders.set("x1", Math.min(x1, boundaries.x1)); }
                    const y1 = borders.get("y1");
                    if (y1 === undefined) { assert(y1 !== undefined, "missing y1 borders"); }
                        else { borders.set("y1", Math.min(y1, boundaries.y1)); }
                    const x2 = borders.get("x2");
                    if (x2 === undefined) { assert(x2 !== undefined, "missing x2 borders"); }
                        else { borders.set("x2", Math.max(x2, boundaries.x2)); }
                    const y2 = borders.get("y2");
                    if (y2 === undefined) { assert(y2 !== undefined, "missing y2 borders"); }
                        else { borders.set("y2", Math.max(y2, boundaries.y2)); }
                    prevFloor = floor;
                } else if (floor !== undefined && prevFloor === undefined) {
                    return undefined;
                }
            }
        }

        const x1 = borders.get("x1");
        const y1 = borders.get("y1");
        const x2 = borders.get("x2");
        const y2 = borders.get("y2");
        if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
            throw Error;
        }
        const footprint = new Rect(x1, y1, x2, y2);
        return {footprint, height};
    }

    /**
     * Returns a string representation of the city
     * 
     * @returns a string that shows where each building is in the city. For each building, shows the
     *      regions of each floor that it occupies. For each building and floor, if the building occupies
     *      a specific cell/space, then its corresponding cell in the string will be populated by the label.
     *      If not, then it is instead occupied by an empty space.
     */
    public toString(): string {
        const city : string[] = new Array<string>();
        city.push('----------------------------------');
        this.map.forEach((floor, label) => {
            city.push('Building ' + label + ": ");
            let floorNum = 0;
            floor.forEach((region, label) => {
                city.push("Floor " + floorNum);
                ++floorNum;
                city.push(region.toString());
            });
            city.push('----------------------------------');
        });
        let cityString = "";
        for (const floor of city) {
            cityString += floor + "\n";
        }
        return cityString;
    }
}
