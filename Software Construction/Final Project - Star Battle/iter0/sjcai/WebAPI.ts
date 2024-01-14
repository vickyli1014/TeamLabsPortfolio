// based on pset 4's server

import assert from 'assert';
import process from 'process';
import { Server } from 'http';
import express, { Application } from 'express';
import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

const app = express();

/**
 * Start a server that serves puzzles from the `puzzles` directory
 * on localhost:8789.
 */
async function main(): Promise<void> {
    // TODO
}

/**
 * HTTP web game server.
 */
export class WebServer {

    /**
     * Make a new web game server that listens for connections on port.
     * 
     * @param requestedPort server port number
     */
    public constructor(
    ) {
        // create app
        // set control to allow requests from anywhere

        /* Handle requests for /newPuzzle/<puzzleName>
         * - request must contain string filename of puzzle to load
         * - server responds to client by sending a string which is a parseable representation
         *      of the requested puzzle
         * @throw an error if the requested puzzle is not found
         */
    }

    /**
     * Start this server.
     * 
     * @returns (a promise that) resolves when the server is listening
     */
    public start(): Promise<void> {
        throw new Error();
    }

    /**
     * @returns the actual port that server is listening at.
     * (this function may not be needed)
     */
    public get port(): number {
        throw new Error();
    }

    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
     public stop(): void {
    }

    /**
     * Additional possible functions if we change our minds and decide to contact the server each time the user does an action:
     *  - addStar(row:number, column:number): void
     *  - removeStar(row:number, column:number): void
     *  - solved(): boolean
     * But probably better if these functions are in the client
     */
}



if (require.main === module) {
    void main();
}


/**
 * Testing strategy for server:
 * 
 * For all functions:
 *  partition on location requests come from: chrome, edge, fetch 
 *    
 * For requesting new puzzles:
 *  partition on request validity: puzzle exists, doesn't exist
 */