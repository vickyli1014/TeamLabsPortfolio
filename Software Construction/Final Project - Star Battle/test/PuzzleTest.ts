import assert from 'assert';

import { Puzzle } from '../src/Puzzle';
import { parse } from '../src/Parser';

describe('Puzzle', function() {
    /*
     * Testing strategy for Board
     *
     * all (constructor, clear(), getRegions(), addStar(), removeStar(), checkComplete(), toString(), equalValue()):
     *      partition on this / the state of `puzzle`: blank, partially solved, fully solved
     *
     * addStar():
     *      partition on the whether star already exists at the specified location: star does not already exist, star does already exist
     *      partition on output: undefined, Puzzle instance
     *
     * removeStar():
     *      partition on whether star exists at the specified location: star exists, star does not exist
     *      partition on output: undefined, Puzzle instance
     *
     * checkComplete():
     *      partition on the output:
     *          - true
     *          - false
     *              partition on the reason for false
     *                  - exceeds the allowed # of stars in a row, column, or region
     *                      partition on the limiting factor: row only, column only, region only, a combination of any of the three
     *                  - stars are adjacent
     *                      partition on the adjacency: horizontally only, vertically only, diagonally only, a combination of any of the three
     *                  - less than 20 stars on the board
     *                  - a combination of any of the three above
     *
     * equalValue():
     *      partition on the output: true, false
     */

    it('covers blank puzzle, added star to (0,1), tried adding star to (0,1) again, removed star at (0,1)', function() {
        const blankBoard = [[[],[{row:0, col:1},{row:0, col:4},{row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
                            [[],[{row:1, col:8},{row:3, col:9},{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
                            [[],[{row:2, col:1},{row:2, col:3},{row:2, col:2}]],
                            [[],[{row:1, col:6},{row:3, col:7},{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
                            [[],[{row:5, col:0},{row:8, col:0},{row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
                            [[],[{row:4, col:3},{row:4, col:5},{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
                            [[],[{row:5, col:7},{row:7, col:6},{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
                            [[],[{row:6, col:2},{row:6, col:4},{row:5, col:2},{row:6, col:3}]],
                            [[],[{row:7, col:8},{row:9, col:9},{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
                            [[],[{row:8, col:2},{row:9, col:5},{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]]
        const game = new Puzzle(blankBoard);
        const puzzle = game.board;
        const clearedGame = game.clear();
        const clearedPuzzle = clearedGame.board;
        // test constructor and clear()
        const expectedOriginalEmpty = [new Set([{row:0, col:0}, {row:0, col:1}, {row:0, col:2}, {row:0, col:3}, {row:0, col:4}, {row:0, col:5}, {row:0, col:6}, {row:0, col:7}, {row:1, col:0}, {row:1, col:1}, {row:1, col:2}, {row:1, col:3}, {row:1, col:4}, {row:1, col:5}, {row:1, col:7}, {row:2, col:4}]),
                                       new Set([{row:0, col:8}, {row:0, col:9}, {row:1, col:8}, {row:1, col:9}, {row:2, col:8}, {row:2, col:9}, {row:3, col:8}, {row:3, col:9}, {row:4, col:8}, {row:4, col:9}, {row:5, col:8}, {row:5, col:9}, {row:6, col:9}, {row:7, col:9}]),
                                       new Set([{row:2, col:1}, {row:2, col:2}, {row:2, col:3}]),
                                       new Set([{row:1, col:6}, {row:2, col:5}, {row:2, col:6}, {row:2, col:7}, {row:3, col:7}]),
                                       new Set([{row:2, col:0}, {row:3, col:0}, {row:3, col:1}, {row:3, col:2}, {row:3, col:3}, {row:4, col:0}, {row:4, col:1}, {row:4, col:2}, {row:5, col:0}, {row:5, col:1}, {row:6, col:0}, {row:6, col:1}, {row:7, col:0}, {row:7, col:1}, {row:7, col:2}, {row:7, col:3}, {row:7, col:4}, {row:7, col:5}, {row:8, col:0}]),
                                       new Set([{row:3, col:4}, {row:4, col:3}, {row:4, col:4}, {row:4, col:5}, {row:5, col:3}, {row:5, col:4}, {row:5, col:5}]),
                                       new Set([{row:3, col:5}, {row:3, col:6}, {row:4, col:6}, {row:4, col:7}, {row:5, col:6}, {row:5, col:7}, {row:6, col:5}, {row:6, col:6}, {row:6, col:7}, {row:7, col:6}, {row:7, col:7}]),
                                       new Set([{row:5, col:2}, {row:6, col:2}, {row:6, col:3}, {row:6, col:4}]),
                                       new Set([{row:6, col:8}, {row:7, col:8}, {row:8, col:8}, {row:8, col:9}, {row:9, col:9}]),
                                       new Set([{row:8, col:1}, {row:8, col:2}, {row:8, col:3}, {row:8, col:4}, {row:8, col:5}, {row:8, col:6}, {row:8, col:7}, {row:9, col:0}, {row:9, col:1}, {row:9, col:2}, {row:9, col:3}, {row:9, col:4}, {row:9, col:5}, {row:9, col:6}, {row:9, col:7}, {row:9, col:8}])]
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            // get current region for original board and cleared board
            const currRegion = puzzle[regionInd];
            const currClearedRegion = clearedPuzzle[regionInd];
            assert(currRegion);
            assert(currClearedRegion);
            assert.strictEqual(currRegion.length, 2);
            assert.strictEqual(currClearedRegion.length, 2);
            // verify that the stars list and empty cells list exist and have the correct lengths
            const currRegionStars = currRegion[0];
            assert(currRegionStars);
            assert.strictEqual(currRegionStars.length, 0);
            const currClearedRegionStars = currClearedRegion[0];
            assert(currClearedRegionStars);
            assert.strictEqual(currClearedRegionStars.length, 0);
            const currRegionEmpty = currRegion[1];
            assert(currRegionEmpty);
            assert(currRegionEmpty.length > 0);
            const currClearedRegionEmpty = currClearedRegion[1];
            assert(currClearedRegionEmpty);
            assert(currClearedRegionEmpty.length > 0);
            // verify that all cells in the region are empty
            assert.deepStrictEqual(new Set(currRegionEmpty), expectedOriginalEmpty[regionInd]);
            assert.deepStrictEqual(new Set(currClearedRegionEmpty), expectedOriginalEmpty[regionInd]);
        }
        // test getRegions()
        const gameRegions = game.getRegions();
        const expectedRegions = [[0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                                 [0, 0, 0, 0, 0, 0, 3, 0, 1, 1],
                                 [4, 2, 2, 2, 0, 3, 3, 3, 1, 1],
                                 [4, 4, 4, 4, 5, 6, 6, 3, 1, 1],
                                 [4, 4, 4, 5, 5, 5, 6, 6, 1, 1],
                                 [4, 4, 7, 5, 5, 5, 6, 6, 1, 1],
                                 [4, 4, 7, 7, 7, 6, 6, 6, 8, 1],
                                 [4, 4, 4, 4, 4, 4, 6, 6, 8, 1],
                                 [4, 9, 9, 9, 9, 9, 9, 9, 8, 8],
                                 [9, 9, 9, 9, 9, 9, 9, 9, 9, 8]]
        assert.deepStrictEqual(gameRegions, expectedRegions);
        // test addStar()
        const updatedGame = game.addStar({row:0, col:1});
        assert(updatedGame !== undefined, 'should not be undefined as it is a valid move');
        const updatedPuzzle = updatedGame.board;
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            const currUpdatedRegion = updatedPuzzle[regionInd];
            assert(currUpdatedRegion);
            assert.strictEqual(currUpdatedRegion.length, 2);
            const currUpdatedRegionStars = currUpdatedRegion[0];
            assert(currUpdatedRegionStars);
            const currUpdatedRegionEmpty = currUpdatedRegion[1];
            assert(currUpdatedRegionEmpty);
            if (regionInd !== 0) {
                assert.strictEqual(currUpdatedRegionStars.length, 0);
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), expectedOriginalEmpty[regionInd]);
            // verify that the changes were made to the region that the star was added to
            } else {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set([{row:0, col:1}]));
            }
        }
        assert(updatedGame.addStar({row:0, col:1}) === undefined, 'star already exists at specified location');
        // test removeStar()
        const updatedGame2 = updatedGame.removeStar({row:0, col:1});
        assert(updatedGame2);
        const updatedPuzzle2 = updatedGame2.board;
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            const currRegion = updatedPuzzle2[regionInd];
            assert(currRegion);
            assert.strictEqual(currRegion.length, 2);
            const currRegionStars = currRegion[0];
            assert(currRegionStars);
            assert.strictEqual(currRegionStars.length, 0);
            const currRegionEmpty = currRegion[1];
            assert(currRegionEmpty);
            assert.deepStrictEqual(new Set(currRegionEmpty), expectedOriginalEmpty[regionInd]);
        }
        // test checkComplete()
        assert(!updatedGame2.checkComplete());
        // test toString()
        const toString = updatedGame2.toString();
        assert(updatedGame2.equalValue(parse(toString)));
        // test equalValue()
        assert(updatedGame2.equalValue(parse(toString)));
        const thatGame = new Puzzle(blankBoard);
        assert(updatedGame2.equalValue(thatGame));
    });

    it('covers partially solved puzzle with stars at (0,1), (0,4), (2,1), and (2,3), tried adding star to (2,1), added star to (2,0), tried removing star from (2,2)', function() {
        const partiallySolvedBoard = [[[{row:0, col:1}, {row:0, col:4}],[{row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
                                      [[],[{row:1, col:8},{row:3, col:9},{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
                                      [[{row:2, col:1}, {row:2, col:3}],[{row:2, col:2}]],
                                      [[],[{row:1, col:6},{row:3, col:7},{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
                                      [[],[{row:5, col:0},{row:8, col:0},{row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
                                      [[],[{row:4, col:3},{row:4, col:5},{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
                                      [[],[{row:5, col:7},{row:7, col:6},{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
                                      [[],[{row:6, col:2},{row:6, col:4},{row:5, col:2},{row:6, col:3}]],
                                      [[],[{row:7, col:8},{row:9, col:9},{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
                                      [[],[{row:8, col:2},{row:9, col:5},{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]]
        const game = new Puzzle(partiallySolvedBoard);
        const puzzle = game.board;
        const clearedGame = game.clear();
        const clearedPuzzle = clearedGame.board;
        // test constructor and clear()
        const clearedBoard = [[[],[{row:0, col:1},{row:0, col:4},{row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
                              [[],[{row:1, col:8},{row:3, col:9},{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
                              [[],[{row:2, col:1},{row:2, col:3},{row:2, col:2}]],
                              [[],[{row:1, col:6},{row:3, col:7},{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
                              [[],[{row:5, col:0},{row:8, col:0},{row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
                              [[],[{row:4, col:3},{row:4, col:5},{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
                              [[],[{row:5, col:7},{row:7, col:6},{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
                              [[],[{row:6, col:2},{row:6, col:4},{row:5, col:2},{row:6, col:3}]],
                              [[],[{row:7, col:8},{row:9, col:9},{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
                              [[],[{row:8, col:2},{row:9, col:5},{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]]
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            // get current region for original board and cleared board
            const currRegion = puzzle[regionInd];
            const currClearedRegion = clearedPuzzle[regionInd];
            assert(currRegion);
            assert(currClearedRegion);
            assert.strictEqual(currRegion.length, 2);
            assert.strictEqual(currClearedRegion.length, 2);
            // verify that the stars list and empty cells list exist and have the correct lengths
            const currRegionStars = currRegion[0];
            assert(currRegionStars);
            const currClearedRegionStars = currClearedRegion[0];
            assert(currClearedRegionStars);
            assert.strictEqual(currClearedRegionStars.length, 0);
            const currRegionEmpty = currRegion[1];
            assert(currRegionEmpty);
            assert(currRegionEmpty.length > 0);
            const currClearedRegionEmpty = currClearedRegion[1];
            assert(currClearedRegionEmpty);
            assert(currClearedRegionEmpty.length > 0);
            // verify that the stars and empty cells are constructed correctly
            const partiallySolvedRegion = partiallySolvedBoard[regionInd];
            assert(partiallySolvedRegion);
            const clearBoardRegion = clearedBoard[regionInd];
            assert(clearBoardRegion);
            assert.deepStrictEqual(new Set(currRegionStars), new Set(partiallySolvedRegion[0]));
            assert.deepStrictEqual(new Set(currRegionEmpty), new Set(partiallySolvedRegion[1]));
            assert.deepStrictEqual(new Set(currClearedRegionStars), new Set(clearBoardRegion[0]));
            assert.deepStrictEqual(new Set(currClearedRegionEmpty), new Set(clearBoardRegion[1]));
        }
        // test getRegions()
        const gameRegions = game.getRegions();
        const expectedRegions = [[0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                                 [0, 0, 0, 0, 0, 0, 3, 0, 1, 1],
                                 [4, 2, 2, 2, 0, 3, 3, 3, 1, 1],
                                 [4, 4, 4, 4, 5, 6, 6, 3, 1, 1],
                                 [4, 4, 4, 5, 5, 5, 6, 6, 1, 1],
                                 [4, 4, 7, 5, 5, 5, 6, 6, 1, 1],
                                 [4, 4, 7, 7, 7, 6, 6, 6, 8, 1],
                                 [4, 4, 4, 4, 4, 4, 6, 6, 8, 1],
                                 [4, 9, 9, 9, 9, 9, 9, 9, 8, 8],
                                 [9, 9, 9, 9, 9, 9, 9, 9, 9, 8]]
        assert.deepStrictEqual(gameRegions, expectedRegions);
        // test addStar()
        assert(game.addStar({row:2, col:1}) === undefined, 'star already exists at specified location');
        const updatedGame = game.addStar({row:2, col:0});
        assert(updatedGame !== undefined, 'should not be undefined as it is a valid move');
        const updatedPuzzle = updatedGame.board;
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            const currUpdatedRegion = updatedPuzzle[regionInd];
            assert(currUpdatedRegion);
            assert.strictEqual(currUpdatedRegion.length, 2);
            const currUpdatedRegionStars = currUpdatedRegion[0];
            assert(currUpdatedRegionStars);
            const currUpdatedRegionEmpty = currUpdatedRegion[1];
            assert(currUpdatedRegionEmpty);
            const currPuzzleRegion = puzzle[regionInd];
            assert(currPuzzleRegion);
            // verify that the changes were made to the region that the star was added to
            if (regionInd === 4) {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set([{row:2, col:0}]));
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), new Set([{row:5, col:0},{row:8, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]));
            } else {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set(currPuzzleRegion[0]));
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), new Set(currPuzzleRegion[1]));
            }
        }
        // test removeStar()
        assert(updatedGame.removeStar({row:2, col:2}) === undefined, 'no star at specified location');
        // test checkComplete()
        assert(!updatedGame.checkComplete());
        // test equalValue()
        const thatBoard = [[[{row:0, col:1}, {row:0, col:4}],[{row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
                           [[],[{row:1, col:8},{row:3, col:9},{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
                           [[{row:2, col:1}, {row:2, col:3}],[{row:2, col:2}]],
                           [[],[{row:1, col:6},{row:3, col:7},{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
                           [[{row:3, col:1}],[{row:5, col:0},{row:8, col:0},{row:2, col:0},{row:3, col:0},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
                           [[],[{row:4, col:3},{row:4, col:5},{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
                           [[],[{row:5, col:7},{row:7, col:6},{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
                           [[],[{row:6, col:2},{row:6, col:4},{row:5, col:2},{row:6, col:3}]],
                           [[],[{row:7, col:8},{row:9, col:9},{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
                           [[],[{row:8, col:2},{row:9, col:5},{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]]
        const thatGame = new Puzzle(thatBoard);
        assert(!game.equalValue(thatGame));
    });

    it('covers fully solved puzzle with many wrong intermediate steps to finally reach correct solution', function() {
        const fullySolvedBoard = [[[{row:0, col:1}, {row:0, col:4}],[{row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
                                  [[{row:1, col:8},{row:3, col:9}],[{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
                                  [[{row:2, col:1}, {row:2, col:3}],[{row:2, col:2}]],
                                  [[{row:1, col:6},{row:3, col:7}],[{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
                                  [[{row:5, col:0},{row:8, col:0}],[{row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
                                  [[{row:4, col:3},{row:4, col:5}],[{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
                                  [[{row:5, col:7},{row:7, col:6}],[{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
                                  [[{row:6, col:2},{row:6, col:4}],[{row:5, col:2},{row:6, col:3}]],
                                  [[{row:7, col:8},{row:9, col:9}],[{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
                                  [[{row:8, col:2},{row:9, col:5}],[{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]]
        const game = new Puzzle(fullySolvedBoard);
        const puzzle = game.board;
        const clearedGame = game.clear();
        const clearedPuzzle = clearedGame.board;
        // test constructor and clear()
        const clearedBoard = [[[],[{row:0, col:1},{row:0, col:4},{row:0, col:0},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
                              [[],[{row:1, col:8},{row:3, col:9},{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
                              [[],[{row:2, col:1},{row:2, col:3},{row:2, col:2}]],
                              [[],[{row:1, col:6},{row:3, col:7},{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
                              [[],[{row:5, col:0},{row:8, col:0},{row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
                              [[],[{row:4, col:3},{row:4, col:5},{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
                              [[],[{row:5, col:7},{row:7, col:6},{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
                              [[],[{row:6, col:2},{row:6, col:4},{row:5, col:2},{row:6, col:3}]],
                              [[],[{row:7, col:8},{row:9, col:9},{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
                              [[],[{row:8, col:2},{row:9, col:5},{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]]
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            // get current region for original board and cleared board
            const currRegion = puzzle[regionInd];
            const currClearedRegion = clearedPuzzle[regionInd];
            assert(currRegion);
            assert(currClearedRegion);
            assert.strictEqual(currRegion.length, 2);
            assert.strictEqual(currClearedRegion.length, 2);
            // verify that the stars list and empty cells list exist and have the correct lengths
            const currRegionStars = currRegion[0];
            assert(currRegionStars);
            const currClearedRegionStars = currClearedRegion[0];
            assert(currClearedRegionStars);
            assert.strictEqual(currClearedRegionStars.length, 0);
            const currRegionEmpty = currRegion[1];
            assert(currRegionEmpty);
            assert(currRegionEmpty.length > 0);
            const currClearedRegionEmpty = currClearedRegion[1];
            assert(currClearedRegionEmpty);
            assert(currClearedRegionEmpty.length > 0);
            // verify that the stars and empty cells are constructed correctly
            const fullySolvedRegion = fullySolvedBoard[regionInd];
            assert(fullySolvedRegion);
            const clearBoardRegion = clearedBoard[regionInd];
            assert(clearBoardRegion);
            assert.deepStrictEqual(new Set(currRegionStars), new Set(fullySolvedRegion[0]));
            assert.deepStrictEqual(new Set(currRegionEmpty), new Set(fullySolvedRegion[1]));
            assert.deepStrictEqual(new Set(currClearedRegionStars), new Set(clearBoardRegion[0]));
            assert.deepStrictEqual(new Set(currClearedRegionEmpty), new Set(clearBoardRegion[1]));
        }
        // test getRegions()
        const gameRegions = game.getRegions();
        const expectedRegions = [[0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                                 [0, 0, 0, 0, 0, 0, 3, 0, 1, 1],
                                 [4, 2, 2, 2, 0, 3, 3, 3, 1, 1],
                                 [4, 4, 4, 4, 5, 6, 6, 3, 1, 1],
                                 [4, 4, 4, 5, 5, 5, 6, 6, 1, 1],
                                 [4, 4, 7, 5, 5, 5, 6, 6, 1, 1],
                                 [4, 4, 7, 7, 7, 6, 6, 6, 8, 1],
                                 [4, 4, 4, 4, 4, 4, 6, 6, 8, 1],
                                 [4, 9, 9, 9, 9, 9, 9, 9, 8, 8],
                                 [9, 9, 9, 9, 9, 9, 9, 9, 9, 8]]
        assert.deepStrictEqual(gameRegions, expectedRegions);
        // test addStar()
        const updatedGame = game.addStar({row:5, col:2});
        assert(updatedGame !== undefined, 'should not be undefined as it is a valid move');
        const updatedPuzzle = updatedGame.board;
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            const currUpdatedRegion = updatedPuzzle[regionInd];
            assert(currUpdatedRegion);
            assert.strictEqual(currUpdatedRegion.length, 2);
            const currUpdatedRegionStars = currUpdatedRegion[0];
            assert(currUpdatedRegionStars);
            const currUpdatedRegionEmpty = currUpdatedRegion[1];
            assert(currUpdatedRegionEmpty);
            const currPuzzleRegion = puzzle[regionInd];
            assert(currPuzzleRegion);
            // verify that the changes were made to the region that the star was added to
            if (regionInd === 7) {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set([{row:5, col:2},{row:6, col:2},{row:6, col:4}]));
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), new Set([{row:6, col:3}]));
            } else {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set(currPuzzleRegion[0]));
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), new Set(currPuzzleRegion[1]));
            }
        }
        // test removeStar()
        const updatedGame2 = updatedGame.removeStar({row:5, col:7});
        assert(updatedGame2, 'should not be undefined as it is a valid move');
        const updatedPuzzle2 = updatedGame2.board;
        for (let regionInd = 0; regionInd < 10; regionInd++) {
            const currUpdatedRegion = updatedPuzzle2[regionInd];
            assert(currUpdatedRegion);
            assert.strictEqual(currUpdatedRegion.length, 2);
            const currUpdatedRegionStars = currUpdatedRegion[0];
            assert(currUpdatedRegionStars);
            const currUpdatedRegionEmpty = currUpdatedRegion[1];
            assert(currUpdatedRegionEmpty);
            const currPuzzleRegion = puzzle[regionInd];
            assert(currPuzzleRegion);
            // verify that the changes were made to the region that the star was added to
            if (regionInd === 7) {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set([{row:5, col:2},{row:6, col:2},{row:6, col:4}]));
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), new Set([{row:6, col:3}]));
            } else if (regionInd === 6) {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set([{row:7, col:6}]));
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), new Set([{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7},{row:5, col:7}]));
            }else {
                assert.deepStrictEqual(new Set(currUpdatedRegionStars), new Set(currPuzzleRegion[0]));
                assert.deepStrictEqual(new Set(currUpdatedRegionEmpty), new Set(currPuzzleRegion[1]));
            }
        }
        // test checkComplete()
        assert(!updatedGame2.checkComplete());

        const updatedGame3 = updatedGame2.removeStar({row:6, col:4});
        assert(updatedGame3, 'should not be undefined as it is a valid move');
        assert(!updatedGame3.checkComplete());

        const updatedGame4 = updatedGame3.addStar({row:6, col:4});
        assert(updatedGame4, 'should not be undefined as it is a valid move');
        const updatedGame5 = updatedGame4.removeStar({row:8, col:2});
        assert(updatedGame5, 'should not be undefined as it is a valid move');
        assert(!updatedGame5.checkComplete());

        const updatedGame6 = updatedGame5.addStar({row:8, col:2});
        assert(updatedGame6, 'should not be undefined as it is a valid move');
        const updatedGame7 = updatedGame6.removeStar({row:6, col:2});
        assert(updatedGame7, 'should not be undefined as it is a valid move');
        assert(!updatedGame5.checkComplete());

        const updatedGame8 = updatedGame7.removeStar({row:5, col:2});
        assert(updatedGame8, 'should not be undefined as it is a valid move');
        const updatedGame9 = updatedGame8.addStar({row:7, col:2});
        assert(updatedGame9, 'should not be undefined as it is a valid move');
        assert(!updatedGame5.checkComplete());

        const updatedGame10 = updatedGame9.removeStar({row:7, col:2});
        assert(updatedGame10, 'should not be undefined as it is a valid move');
        const updatedGame11 = updatedGame10.addStar({row:6, col:2});
        assert(updatedGame11, 'should not be undefined as it is a valid move');
        const updatedGame12 = updatedGame11.addStar({row:5, col:7});
        assert(updatedGame12, 'should not be undefined as it is a valid move');
        assert(updatedGame12.checkComplete());
        // test toString()
        const toString = updatedGame12.toString();
        assert(updatedGame12.equalValue(parse(toString)));
        // test equalValue()
        const thatdBoard = [[[{row:0, col:0}, {row:0, col:4}],[{row:0, col:1},{row:0, col:2},{row:0, col:3},{row:0, col:5},{row:0, col:6},{row:0, col:7},{row:1, col:0},{row:1, col:1},{row:1, col:2},{row:1, col:3},{row:1, col:4},{row:1, col:5},{row:1, col:7},{row:2, col:4}]],
                            [[{row:1, col:8},{row:3, col:9}],[{row:0, col:8},{row:0, col:9},{row:1, col:9},{row:2, col:8},{row:2, col:9},{row:3, col:8},{row:4, col:8},{row:4, col:9},{row:5, col:8},{row:5, col:9},{row:6, col:9},{row:7, col:9}]],
                            [[{row:2, col:1}, {row:2, col:3}],[{row:2, col:2}]],
                            [[{row:1, col:6},{row:3, col:7}],[{row:2, col:5},{row:2, col:6},{row:2, col:7}]],
                            [[{row:5, col:0},{row:8, col:0}],[{row:2, col:0},{row:3, col:0},{row:3, col:1},{row:3, col:2},{row:3, col:3},{row:4, col:0},{row:4, col:1},{row:4, col:2},{row:5, col:1},{row:6, col:0},{row:6, col:1},{row:7, col:0},{row:7, col:1},{row:7, col:2},{row:7, col:3},{row:7, col:4},{row:7, col:5}]],
                            [[{row:4, col:3},{row:4, col:5}],[{row:3, col:4},{row:4, col:4},{row:5, col:3},{row:5, col:4},{row:5, col:5}]],
                            [[{row:5, col:7},{row:7, col:6}],[{row:3, col:5},{row:3, col:6},{row:4, col:6},{row:4, col:7},{row:5, col:6},{row:6, col:5},{row:6, col:6},{row:6, col:7},{row:7, col:7}]],
                            [[{row:6, col:2},{row:6, col:4}],[{row:5, col:2},{row:6, col:3}]],
                            [[{row:7, col:8},{row:9, col:9}],[{row:6, col:8},{row:8, col:8},{row:8, col:9}]],
                            [[{row:8, col:2},{row:9, col:5}],[{row:8, col:1},{row:8, col:3},{row:8, col:4},{row:8, col:5},{row:8, col:6},{row:8, col:7},{row:9, col:0},{row:9, col:1},{row:9, col:2},{row:9, col:3},{row:9, col:4},{row:9, col:6},{row:9, col:7},{row:9, col:8}]]]
        const thatGame = new Puzzle(thatdBoard);
        assert(!updatedGame12.equalValue(thatGame));
    });
});
