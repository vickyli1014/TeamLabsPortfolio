/* Copyright (c) 2021-2023 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Rect } from '../src/Rect';
import { City } from '../src/City';

/**
 * Tests for instance methods of {@link City}.
 * 
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested methods.
 */

describe('City', function () {
    /*
     * Testing strategy for City
     * 
     * bounds, expand, owners:
     *      partition on this: empty, not empty
     * expand, bounds:
     *      partition on label: exists, doesn't exist
     * expand: 
     *      partition on output: error for intersecting regions, error for noncontiguity, 
     *          error for ungroundness, none
     *      partition on floor: floor<height, floor=height, floor>height
     * bounds:
     *      partition on height: 1, >1
     * owners:
     *      partition on the area of rect: 0, >0
     *      partition on length of output: 0, >0
     *      
     */

    // TODO: partitions that this test covers
    it('empty city should have no owners, expanding on floor 0 creates a labeled region', function () {
        const city = new City(10);
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 10, 10)), new Set());
        assert(city.bounds("test") === undefined, "expected undefined bound");
        city.expand("test", 0, new Rect(1, 1, 2, 2));
        assert.deepStrictEqual(city.bounds("test"), {footprint: new Rect(1, 1, 2, 2), height: 1});
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 10, 10)), new Set<string>(["test"]), "expected updated owners");
    });

    it('adding contiguous rect on top of existing building, new nonzero bounds', function() {
        const city = new City(12);
        city.expand("one", 0, new Rect(1, 1, 2, 2));
        city.expand("one", 1, new Rect(1, 1, 10, 10));
        assert.deepStrictEqual(city.bounds("one"), {footprint: new Rect(1, 1, 10, 10), height: 2});
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 10, 10)), new Set(["one"]), "expected same owner");

    });

    it('adding contingous rect within an existing floor of a building', function() {
        const city = new City(10);
        city.expand("two", 0, new Rect(1, 1, 2, 2));
        city.expand("two", 1, new Rect(1, 1, 2, 2));
        city.expand("two", 1, new Rect(1, 1, 10, 10));
        assert.deepStrictEqual(city.bounds("two"), {footprint: new Rect(1, 1, 10, 10), height: 2});
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 10, 10)), new Set(["two"]), "expected same owner");
    });

    it('should work for zero area rect when checking owners', function() {
        const city = new City(10);
        city.expand("four", 0, new Rect(1, 1, 2, 2));
        city.expand("three", 0, new Rect(2, 3, 4, 5));
        assert.deepStrictEqual(city.bounds("four"), {footprint: new Rect(1, 1, 2, 2), height: 1});
        assert.deepStrictEqual(city.owners(new Rect(1, 1, 1, 1)), new Set(["four"]));
    });

    it('error when expanding an intersecting rect to a building', function() {
        const city = new City(10);
        city.expand("one", 0, new Rect(1, 1, 2, 2));
        city.expand("two", 0, new Rect(3, 4, 5, 6));
        assert.throws(
            () => { city.expand("one", 0, new Rect(2, 3, 4, 5)) ;}
        );
    });

    it('error when expanding a noncontiguous rect to a floor of a building', function() {
        const city = new City(10);
        city.expand("one", 0, new Rect(1, 1, 2, 2));
        assert.throws(
            () => { city.expand("one", 0, new Rect(3, 4, 5, 6)); }
        );
    });

    it('error when expanding a rect to a floor greater than the height of the building', function() {
        const city = new City(10);
        city.expand("one", 0, new Rect(1, 1, 1, 2,));
        assert.throws(
            () => { city.expand("one", 2, new Rect(1, 1, 1, 2)); }
        );
    });

    it('error when building is not grounded', function() {
        const city = new City(10);
        assert.throws(
            () => { city.expand("one", 2, new Rect(1, 1, 1, 2)); }
        );
    });

    it('should allow two buildings to touch faces with one building jutting above the other', function() {
        const city = new City(4);
        city.expand("pink", 0, new Rect(1, 1, 2, 3));
        city.expand("blue", 0, new Rect(2, 1, 3, 3));
        city.expand("blue", 1, new Rect(1, 1, 3, 3));
        assert.deepStrictEqual(city.bounds("blue"), {footprint: new Rect(1, 1, 3, 3), height: 2});
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 3, 3)), new Set(["pink", "blue"]));
    });

    it('should handle a pyramid nested close to an identical inverted pyramid', function() {
        const city = new City(10);
        city.expand("pink", 0, new Rect(1, 2, 2, 3));
        city.expand("blue", 0, new Rect(2, 1, 5, 4));
        city.expand("pink", 1, new Rect(0, 1, 3, 4));
        city.expand("blue", 1, new Rect(3, 2, 4, 3));
        assert.deepStrictEqual(city.bounds("blue"), {footprint: new Rect(2, 1, 5, 4), height: 2});
        assert.deepStrictEqual(city.bounds("pink"), {footprint: new Rect(0, 1, 3, 4), height: 2});
        assert.deepStrictEqual(city.owners(new Rect(0, 0, 10, 10)), new Set(["pink", "blue"]));
        console.log(city.toString());
    });


});
