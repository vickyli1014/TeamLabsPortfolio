/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This test file runs in Node.js, see the `npm test` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.
// See the *Testing* section of the project handout for more advice.

import assert from 'assert';
import { WebServer } from '../src/StarbServer';
import fetch from 'node-fetch';
import HttpStatus from 'http-status-codes';
import fs from 'fs';

function parseToArray(file: string): Array<Array<string>> {
    const rowsFile = file.split('\n');
    const expectedRegions = new Array<Array<string>>();
    for (const row of rowsFile) {
        const eachRegion = row.split(' ');
        expectedRegions.concat(eachRegion);
    }
    return expectedRegions;
}

describe('server', function() {

    /**
     * Testing strategy for server
     *      partition on fetched port:
     *          - 8789
     *          - not 8789
     *      partition: sovled vs blank
     */
    
    // TODO
    it('covers port 8789, input solved puzzle', async function() {
        const server = new WebServer(8789);
        await server.start();

        const url = `http://localhost:8789/kd-1-1-1.starb`;

        const response = await fetch(url);
        const blankPuzzleFile = await fs.promises.readFile('./puzzles/blank.starb', {encoding: 'utf-8'});
        
        const expected = parseToArray(blankPuzzleFile);
        const actual = parseToArray(await response.text());
        // const expectedResponse = fileContent('10x10')
        assert.deepStrictEqual(actual, expected);

        server.stop();
    });

    it('input blank puzzle', async function() {
        const server = new WebServer(8789);
        await server.start();

        const url = `http://localhost:8789/blank.starb`;

        const response = await fetch(url);
        const blankPuzzleFile = await fs.promises.readFile('./puzzles/blank.starb', {encoding: 'utf-8'});
        
        const expected = parseToArray(blankPuzzleFile);
        const actual = parseToArray(await response.text());
        // const expectedResponse = fileContent('10x10')
        assert.deepStrictEqual(actual, expected);

        server.stop();

    })
    
    it('covers not port 8789', async function() {
        const server = new WebServer(8789);
        await server.start();

        const url = `http://localhost:8780/kd-1-1-1.starb`;

        await assert.rejects(
            async () => { await fetch(url); }
        );

        server.stop();
    });


    
});
