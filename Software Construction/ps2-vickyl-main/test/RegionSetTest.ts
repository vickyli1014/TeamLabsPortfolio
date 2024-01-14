/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from '../src/Rect';
import { RegionSet } from '../src/RegionSet';
import { implementations } from '../src/RegionSetImpl';

/**
 * Tests for instance methods of {@link RegionSet}.
 * 
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested methods.
 * 
 * Your tests MUST only obtain RegionSet instances by calling new SomeRegionSetOfString().
 * Your tests MUST NOT refer to specific concrete implementations.
 */

// Can't use makeRegionSet here, because it will only return one particular implementation.
const makeRegionSet = undefined;
// Can't refer to specific concrete implementations.
const RepMapRegionSet = undefined, RepArrayRegionSet = undefined;

// Iterate over the different implementations and run the test suite on each of them:
implementations().forEach(SomeRegionSetOfString => describe(SomeRegionSetOfString.name, function () {
    /*
     * Testing strategy for RegionSet
     * 
     * add, bounds, owners:
     *      partition on this: empty, not empty
     * add, bound:
     *      partition on labeled region: exist, does not exist
     * owners:
     *      partition on area of rect: 0, >0
     *      partition on length of output: 0, >0
     * add: 
     *      partition on output: error for intersecting regions, error for noncontiguity, void
     */

    it('empty region set should have no owners, adding a region creates a labeled region', function () {
        const empty = new SomeRegionSetOfString(10);
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 10, 10)), new Set(), "expected no owners");
        assert(empty.bounds("test") === undefined), "expected undefined bound";
        empty.add("test", new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(empty.owners(new Rect(0, 0, 10, 10)), new Set<string>(["test"]), "expected updated owners");
    });

    it('adding contiguous rect to an existing region, new nonzero bounds', function() {
        const regionSet = new SomeRegionSetOfString(10);
        regionSet.add("one", new Rect(1, 1, 2, 2));
        regionSet.add("one", new Rect(2, 1, 3, 4));
        assert.deepStrictEqual(regionSet.bounds("one"), new Rect(1, 1, 3, 4));
        assert.deepStrictEqual(regionSet.owners(new Rect(0, 0, 10, 10)), new Set(["one"]), "expected same owner");
    });

    it('should work for zero area rect when checking owners', function() {
        const regionSet = new SomeRegionSetOfString(10);
        regionSet.add("one", new Rect(1, 1, 2, 2));
        regionSet.add("two", new Rect(3, 4, 5, 6));
        assert.deepStrictEqual(regionSet.bounds("one"), new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(regionSet.owners(new Rect(1, 1, 1, 1)), new Set(["one"]));
    });
    
    it('error when adding an intersecting rect to a region', function() {
        const regionSet = new SomeRegionSetOfString(10);
        regionSet.add("one", new Rect(1, 1, 2, 2));
        regionSet.add("two", new Rect(3, 4, 5, 6));
        assert.throws(
            () => { regionSet.add("one", new Rect(3, 4, 5, 6)); }
        );
    });

    it('error when adding a noncontiguous rect to a region', function() {
        const regionSet = new SomeRegionSetOfString(10);
        regionSet.add("one", new Rect(1, 1, 2, 2));
        assert.throws(
            () => { regionSet.add("one", new Rect(3, 4, 5, 6)); }
        );
    });

    it('should handle same rectangle added twice with same label', function() {
        const regionSet = new SomeRegionSetOfString(10);
        regionSet.add("one", new Rect(1, 1, 2, 2));
        regionSet.add("one", new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(regionSet.bounds("one"), new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(regionSet.owners(new Rect(0, 0, 10, 10)), new Set(["one"]), "expected same owner");
    });

    it('should handle two nonoverlapping regions that touch along an edge', function() {
        const regionSet = new SomeRegionSetOfString(5);
        regionSet.add("nine", new Rect(1, 1, 3, 3));
        regionSet.add("ten", new Rect(3, 1, 4, 3));
        assert.deepStrictEqual(regionSet.bounds("nine"), new Rect(1, 1, 3, 3));
        assert.deepStrictEqual(regionSet.owners(new Rect(0, 0, 10, 10)), new Set(["nine", "ten"]), "expected two owners");

    });

    it('owners should handle horizontal query rectangle that intersects two vertical regions', function() {
        const regionSet = new SomeRegionSetOfString(10);
        regionSet.add("Tufts", new Rect(1, 1, 2, 4));
        regionSet.add("UMass", new Rect(3, 1, 4, 4));
        assert.throws(
            () => { regionSet.add("BU", new Rect(1, 2, 4, 3)); }
        );
        assert.deepStrictEqual(regionSet.owners(new Rect(0, 0, 10, 10)), new Set(["Tufts", "UMass"]), "expected two owners");
    });

    it('should handle one rectangle on a 1x1 grid', function() {
        const regionSet = new SomeRegionSetOfString(1);
        regionSet.add("apples", new Rect(0, 0, 1, 1));
        assert.deepStrictEqual(regionSet.owners(new Rect(0, 0, 1, 1)), new Set(["apples"]), "expected two owners");
    });

}));
