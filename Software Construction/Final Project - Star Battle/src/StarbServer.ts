/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

// This file runs in Node.js, see the `npm server` script.
// Remember that you will *not* be able to use DOM APIs in Node, only in the web browser.

import assert from 'assert';
import express, { Application } from 'express';
import { Server } from 'http';
import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';
import { parse } from './Parser';
import fs from 'fs';

/**
 * HTTP web game server on port 8789
 */
export class WebServer {
    private readonly app: Application;
    private server: Server|undefined;

    /**
     * Make a new web game server using board that listens for connections on port.
     * 
     * @param requestedPort server port number
     */
    public constructor(
        private readonly requestedPort: number) 
        {
            this.app = express();
            this.app.use((request, response, next) => {
                // allow requests from web pages hosted anywhere
                response.set('Access-Control-Allow-Origin', '*');
                next();
            });

            /*
            * Handle a request for /newPuzzle
            */
            this.app.get('/:filename', asyncHandler(async(request, response) => {
                const { filename } = request.params;
                assert(filename);

                const fileContents = await fs.promises.readFile('./puzzles/' + filename, {encoding: 'utf-8'});
                const board = parse(fileContents).clear().toString();
                response
                    .status(HttpStatus.OK)
                    .type('text')
                    .send(board);
       }));
    }

    /**
     * Start this server
     * 
     * @returns (a promise that) resolves when the server is listening
     */
    public start(): Promise<void> {
        return new Promise(resolve => {
            this.server = this.app.listen(this.requestedPort, () => {
                console.log('server now listening at', this.port); 
                resolve();
            });
        });
    }

    /**
     * @returns the actual port that server is listening at. (May be different
     *          than the requestedPort used in the constructor, since if
     *          requestedPort = 0 then an arbitrary available port is chosen.)
     *          Requires that start() has already been called and completed.
     */
    public get port(): number {
        const address = this.server?.address() ?? 'not connected';
        console.log('address: ', address);
        if (typeof(address) === 'string') {
            throw new Error('server is not listening at a port');
        }
        return address.port;
    }
    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
     public stop(): void {
        this.server?.close();
        console.log('server stopped');
    }
}

if (require.main === module) {
    void main();
}

/**
 * Start a server that serves puzzles from the `puzzles` directory
 * on localhost:8789.
 */
async function main(): Promise<void> { 
    const expectedPort = 8789;
    const [portString] = process.argv.slice(2);
    if (portString === undefined) { throw new Error('missing PORT'); }
    const port = parseInt(portString);
    if (isNaN(port) || port !== expectedPort) { throw new Error('invalid PORT'); }

    const server = new WebServer(port);
    await server.start();
}