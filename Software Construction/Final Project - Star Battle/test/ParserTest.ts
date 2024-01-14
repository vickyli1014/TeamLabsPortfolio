import assert from "assert";
import { parseToArray } from '../src/Parser';
import * as parserlib from 'parserlib';
import { Puzzle, Coordinate } from '../src/Puzzle';
import fs from 'fs';

/**
 * Testing strategy for parser:
 * 
 * Only parsePuzzle is being explicitly tested, since all other functions (except parse) in Parser.ts
 *      are helper functions for parsePuzzle, so parsePuzzle covers all cases of their use
 * parse is just glue code, so not being tested.
 * 
 * partition on parsePuzzle input:
 *      - whether input is solved or empty
 *      - whether input contains comments or not
 */

describe('Parser', function () {
    it ("covers solved puzzle with comments", async function () {
        const solvedPuzzle = await fs.promises.readFile('puzzles/kd-1-1-1.starb', { encoding: 'utf-8' });
        const parsed = parseToArray(solvedPuzzle);
        assert.deepStrictEqual(parsed, [
            [[{row:0, col:1},{row:0, col:4}],[{row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
            [[{row:1, col:8},{row:3, col:9}],[{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
            [[{row:2, col:1},{row:2, col:3}],[{row:2, col:2}]],
            [[{row:1, col:6},{row:3, col:7}],[{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
            [[{row:5, col:0},{row:8, col:0}],[{row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
            [[{row:4, col:3},{row:4, col:5}],[{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
            [[{row:5, col:7},{row:7, col:6}],[{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
            [[{row:6, col:2},{row:6, col:4}],[{row:5, col:2},{row:6, col:3}]],
            [[{row:7, col:8},{row:9, col:9}],[{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
            [[{row:8, col:2},{row:9, col:5}],[{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]
        ])
    });

    it ("covers empty puzzle with no comments", async function () {
        const solvedPuzzle = await fs.promises.readFile('puzzles/blank.starb', { encoding: 'utf-8' });
        const parsed = parseToArray(solvedPuzzle);
        const expected = [
            [[], [{row:0, col:1}, {row:0, col:4}, {row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
            [[], [{row:1, col:8},{row:3, col:9}, {row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
            [[], [{row:2, col:1},{row:2, col:3}, {row:2, col:2}]],
            [[], [{row:1, col:6},{row:3, col:7}, {row:2, col:5},{row:2, col:6},{row:2, col:7}]],
            [[], [{row:5, col:0},{row:8, col:0}, {row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
            [[], [{row:4, col:3},{row:4, col:5}, {row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
            [[], [{row:5, col:7},{row:7, col:6}, {row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
            [[], [{row:6, col:2},{row:6, col:4}, {row:5, col:2},{row:6, col:3}]],
            [[], [{row:7, col:8},{row:9, col:9}, {row:6, col:8},{row:8, col:8},{row:8, col:9}]],
            [[], [{row:8, col:2},{row:9, col:5}, {row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]
        ];
        const expected_sets = new Array<Set<Coordinate>>;
        for (const region of expected) {
            expected_sets.push(new Set(region[1]));
        }
        const actual_sets = new Array<Set<Coordinate>>; 
        for (const region of parsed) {
            actual_sets.push(new Set(region[1]));
        }
        for (let i = 0; i < actual_sets.length; i++) {
            assert.deepStrictEqual(expected_sets[i], actual_sets[i]);
        }
    });
});


