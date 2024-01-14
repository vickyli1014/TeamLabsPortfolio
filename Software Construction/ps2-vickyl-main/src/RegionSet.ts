/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/**
 * PS2 instructions: change this file only to implement {@link makeRegionSet}.
 */

import assert from 'assert';
import { Rect } from './Rect';
import { RepMapRegionSet, RepArrayRegionSet } from './RegionSetImpl';

/**
 * A mutable set of labeled "regions", where each region is a contiguous set of square cells 
 * in a 2D grid with origin at (0,0) and extending to (`gridSize`,`gridSize`)
 * (for some nonnegative integer `gridSize`, fixed when the set is created).
 * Coordinates (x,y) are interpreted as points in the 2D plane in the conventional way.
 * 
 * A region must be *contiguous*: any cell in the region must be reachable from any other cell in the region
 * by a path passing through adjacent cells, where we define adjacent cells as sharing an edge (not just a corner).
 * 
 * Each region is labeled uniquely, and regions must *not intersect*: no cell may be in more than one region.
 * 
 * Labels are of arbitrary type `L` and are compared for equality using ===. They may not be null or undefined.
 * 
 * PS2 instructions: this is a required ADT interface.
 * You may not change the specifications or add new methods.
 *
 * @template L type of labels in this set, compared for equality using ===.
 */
export interface RegionSet<L> {

    /**
     * @returns the dimension of the grid, such that this set uses a `gridSize` x `gridSize` grid.
     *          Must be nonnegative.
     */
    readonly gridSize: number; 

    /**
     * Add a rectangle of grid cells to the region labeled by the given label (or create such a labeled region 
     * if it was not already present), if it does not intersect with other existing labeled regions.
     * 
     * @param label label of region
     * @param rect rectangle to add to labeled region. Required to have nonzero area and integer coordinates
     *             drawn from [0,`gridSize`].
     * @throws Error if adding the rectangle would make label's region discontiguous or would intersect 
     *         with a cell in another labeled region
     */
    add(label: L, rect: Rect): void;

    /**
     * Get the labels of regions that intersect the given rectangle (where the intersection contains at least one
     * full grid cell).
     * 
     * @param rect rectangle to query. Its coordinates must be integers in [0,`gridSize`].
     * @returns the labels of regions in this set whose intersection with rect contains at least one grid cell
     */
    owners(rect: Rect): Set<L>;

    /**
     * Get the bounding box of a labeled region.
     * 
     * @param label label of region
     * @returns the smallest rectangle that contains all the grid cells in the labeled region, or undefined if
     *          no region with that label exists.
     */
    bounds(label: L): Rect | undefined;

}

/**
 * Create an empty region set for a `gridSize` x `gridSize` grid.
 * 
 * @template L type of labels in the set
 * @param gridSize dimension of grid, must be nonnegative integer
 * @returns a new empty region set
 */
export function makeRegionSet<L>(gridSize: number): RegionSet<L> {
    return new RepMapRegionSet<L>(gridSize);
}
