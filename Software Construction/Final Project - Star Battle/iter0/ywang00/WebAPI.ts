import { Server } from 'http';
import express, { Application } from 'express';
import asyncHandler from 'express-async-handler';


/**
 * HTTP web game server.
 */
export class WebServer {

    private readonly app: Application;
    private server: Server|undefined;
    private readonly requestedPort = 8789;

    /**
     * Make a new web game server using puzzle that listens for connections on 8789.
     * 
     * @param puzzle shared game board
     */
    public constructor(
        private readonly puzzle: Puzzle, // from the Puzzle ADT 
    ) {
        this.app = express();

        /*
         * Handle a request for /start/<playerId>.
         */
        this.app.get('/start/:playerId', asyncHandler(async(request, response) => {

        }));

        /*
         * Handle a request for /fillStar/<playerId>/<row>,<column>.
         */
        this.app.get('/fillStar/:playerId/:coordinate', asyncHandler(async(request, response) => {

        }));

        /*
         * Handle a request for /fillEmpty/<playerId>/<row>,<column>.
         */
        this.app.get('/fillEmpty/:playerId/:coordinate', asyncHandler(async(request, response) => {

        }));

        /*
         * Handle a request for /clear/<playerId>/<row>,<column>.
         */
        this.app.get('/clear/:playerId/:coordinate', asyncHandler(async(request, response) => {

        }));

        /*
         * Handle a request for /checkSolution/<playerId>.
         */
        this.app.get('/checkSolution/:playerId', asyncHandler(async(request, response) => {

        }));

        /*
         * Handle a request for /getHint/<playerId>.
         * 
         * Not sure if we need to implement this for MVP but would be a nice feature to have but I also don't 
         * quite have a lot of the details for getHint thought out yet so I'm not too sure how exactly it'd work
         */
        this.app.get('/getHint/:playerId', asyncHandler(async(request, response) => {

        }));
    }

    /**
     * Start this server.
     * 
     * @returns (a promise that) resolves when the server is listening
     */
    public start(): Promise<void> {

    }

    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
     public stop(): void {

    }
}


/*
 * Testing Strategy for WebServer class
 * 
 * all(constructor(), start(), stop())
 *      partition on `this.server`: of type Server, = undefined
 * 
 * constructor()
 *      partition on `playerId`: valid, invalid
 * 
 * constructor() - fillStar request, fillEmpty request, clear request
 *      partition on validity of `coordinate` (according to the rules of the game): valid, invalid
 *      partition on the location of `coordinate`: filled, not filled 
 * 
 * constructor() - checkSolution request
 *      partition on status of `puzzle`: not solved, solved correctly, solved incorrectly
 * 
 * constructor() - getHint request 
 *      partition on status of `puzzle`: all cells filled, not all cells filled
 */