/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import fs from 'fs';
import { Deferred } from './Deferred';

export enum ChangeControl {Give, Remove}
export enum FaceDirection {Up, Down, Removed}
export enum FlipCount {First, Second}
export type Player = {inControl:Array<Card>, previouslyFlipped:Array<Card>, flip:FlipCount};
export type Card = {content:string, faceDirection: FaceDirection, controlledBy:Player|undefined, waitlist:Array<Deferred<void>>};

/**
 * TODO specification
 * Mutable and concurrency safe.
 */
export class Board {
    public readonly cards = new Array<Array<Card>>();
    public readonly players = new Map<string, Player>();
    public readonly watchers = new Array<Deferred<void>>();

    // Abstraction function:
    // AF(cards, players, width, height, watchers) = A width x height sized Memory Scramble game board, 
    //     a grid of spaces, where cards[i][j] describe the card at position (i,j) on the board. 
    //     This description includes the contents on the front side of the card, whether it's currently
    //     faced up, down, or removed, the player that currently controls the card, and a waitlist of 
    //     players who are in line to contend for a card that is currently in control by another player.
    //     If the content of cards[i][j] is either empty or whitespace, the card at position (i,J)
    //     has been removed. `players` is a mapping from the id of players playing the 
    //     game to their status which describes the cards they are currently in control of, what cards 
    //     they have previously flipped, and if the next card they are to flip would be the first or 
    //     second card they've turned since the most recent cards they've flipped face down. 'watchers' 
    //     is the list of requests from players that are watching the board for changes
        
    // Representation invariant:
    // width and height must be positive integers
    // cards has length height
    // each array in cards has length width
    // for each card in cards, if its contents are non-empty, it can't have a mixture 
    //     of non-whitespace non-newline characters and whitespace/newline characters.
    // All Players stored in any card.controlledBy must be contained in `players`
    // No more than two cards in `cards` can store the same player in card.controlledBy
    
    // Safety from rep exposure:
    //   All fields are un-reassignable
    //   None fo the fields are returned by any operators
    //   Although the object is mutable, public methods do not take as input or output object/rep fields:
    //      flip(): takes in immuatable types as input, and returns a void type Promise. It 
    //         mutates the rep but does not pass the rep/object in or out the function
    //      addPlayer(), map(), watch(): takes a string (immutable) as input but uses that as a 
    //         key to mutate the object. Again, does not pass any of the fields of the rep so 
    //         they're safe from aliasing. Also does not output any of the object/rep fields
    //      playerToString(): input is only used as a key to mutate the rep and returns an
    //         immutable type
    //   All other methods are private and unaccessible to the client. Some of these take in and output
    //      immutable objects/types. Most of the others take as input a rep field but do not return
    //      a rep field, making them mutators. getCard returns a Card used in the rep but is only 
    //      called by flip, which is safe from rep exposure.
    //   parseFromFile() returns a Board, which is mutable, but all methods are safe from exposure


    /**
     * Creates a Memory Scramble game board 
     * 
     * @param parsedBoard 2D array representing the cards at each location on the board
     * @param width width of game board
     * @param height height of game board
     */
    public constructor(parsedBoard:Array<Array<string>>,
                        public readonly width:number, 
                        public readonly height:number) {
        for (let i=0; i<this.height; i++) {
            if (this.cards[i] === undefined) { this.cards[i] = new Array<Card>(); }
            const cardsRow = this.cards[i];
            const parsedRow = parsedBoard[i];
            assert(cardsRow);
            assert(parsedRow);
            for (let j=0; j<this.width; j++) {
                const entry = parsedRow[j];
                assert(entry !== undefined);
                const card:Card = {content:entry, faceDirection:FaceDirection.Down, controlledBy:undefined, waitlist:new Array<Deferred<void>>()};
                ['', '\n', '\r'].indexOf(card.content) !== -1 ? card.faceDirection = FaceDirection.Removed : null;
                // card.content === '' ? card.faceDirection = FaceDirection.Removed : null;
                cardsRow.push(card);
            }
        }
        this.checkRep();
    }

    private checkRep():void {
        // checking length invariants
        assert(this.width > 0);
        assert(this.height > 0);
        assert(this.cards.length === this.height);
        const allPlayers = [...this.players.values()];
        const playerCount = new Map<Player, number>();
        const maxPlayerCount = 2;
        for (const row of this.cards) { 
            assert(row.length === this.width); 
            for (const card of row) {
                // cards can't contain a mixture of both non-whitespace non-newline and whitespace newline characters
                if (card.content === '' || card.content.includes('\n') || card.content.includes('\r')) {
                    assert(card.content.replace('\n', '').replace('\r', '') === '');
                    assert(card.faceDirection === FaceDirection.Removed, 'expected ' + FaceDirection.Removed + ', got ' + card.faceDirection);
                } else {
                    // check that each player occurs in cards at most 2 times
                    if (card.controlledBy !== undefined) { 
                        const player = card.controlledBy;
                        assert(allPlayers.includes(card.controlledBy)); 
                        playerCount.get(player) === undefined ? playerCount.set(player, 0) : null;
                        const count = playerCount.get(player);
                        count !== undefined ? playerCount.set(player, count + 1) : null;
                        assert(count !== undefined && count < maxPlayerCount);
                    }
                    
                }
            }
        }
    }

    /**
     * Tries to flip over a card on the board, following the rules in the ps4 handout. If
     * another player controls the card, then this operation blocks until the flip either 
     * becomes possible or fails. If player does not currently exist on the board, will add
     * the player to the board.
     * 
     * @param playerId ID of player making the flip; must be a nonempty string of alphanumeric
     *                 or underscore characters and must be in this.players
     * @param row row number of card to flip; must be an integer if [0, height), 
     *            indexed from the top of the board
     * @param column column number of card to flip; must be an integer in [0, width),
     *               indexed from the left of the board
     * @throws an error (rejecting the promise) if the flip operation fails as described in 
     *         ps4 handout
     */
    public async flip(playerId: string, row:number, column:number): Promise<void> {
        let boardChange = false;
        this.checkInRange(row, column);
        if (this.players.get(playerId) === undefined) {
            this.addPlayer(playerId);
        }
        const player = this.players.get(playerId);
        assert(player !== undefined);
        const card = this.getCard(row, column);
        // console.log comments to keep track of simulation, delete upon beta completion
        // console.log(row, column);
        // console.log(card);

        // check if first flip. do after second flip actions if so
        const previouslyFlipped = player.previouslyFlipped;
        if (player.flip === FlipCount.First) {
            for (const flipped of previouslyFlipped) {
                // if no one has control, turn the card face down
                if (flipped.controlledBy === undefined) {
                    flipped.faceDirection = FaceDirection.Down;
                    // console.log('player ', playerId, ' faced card ' + flipped.content + ' down');
                    boardChange = true;
                }
            }
            for (const flipped of player.inControl) {
                // if player has control, remove the card and relinquish control
                this.changeControl(player, flipped, ChangeControl.Remove);
                // console.log('player ', playerId, ' removed', flipped.content);
                flipped.content = '';
                flipped.faceDirection = FaceDirection.Removed;
                boardChange = true;
                for (const promise of flipped.waitlist) { promise.resolve(); }
            }
            player.previouslyFlipped = new Array<Card>();
        } 

        switch (card.faceDirection) {
            case FaceDirection.Down: {
                card.faceDirection = FaceDirection.Up;
                this.changeControl(player, card, ChangeControl.Give);
                this.changeFlip(player);
                boardChange = true;
                // console.log('player ', playerId, ' faced card ' + card.content + ' up');
                break;
            }
            case FaceDirection.Removed: {
                // if second flip, relinquish control of first card
                if (player.inControl.length === 1) { 
                    this.relinquishFirstCard(player);
                    // console.log('relinquished control from first card');
                } else {
                    // console.log('player ', playerId, ' flipped empty space');
                }
                throw Error();
                break;
            }
            case FaceDirection.Up: {
                // if the card is currently not controlled by anyone
                if (card.controlledBy === undefined) { 
                    this.changeControl(player, card, ChangeControl.Give);
                    this.changeFlip(player);
                    // console.log('card was faced up, player ', playerId, ' took over control');
                }
                // the card is controlled by someone
                else {
                    if (player.inControl.length === 1) { 
                        this.relinquishFirstCard(player); 
                        throw Error();
                        // console.log('player ', playerId, ' tried to draw a second card controlled by someone');
                    }
                    else {
                        const deferred = new Deferred<void>();
                        card.waitlist.push(deferred);
                        // console.log('player ', playerId, ' blocked, waiting for card');
                        await deferred.promise;
                        // if the card is still in play give control, if not then do nothing
                        if (['', '\n', '\r'].indexOf(card.content) === -1) {
                            this.changeControl(player, card, ChangeControl.Give);
                            this.changeFlip(player);
                            // console.log('player ', playerId, ' taking over control of card ', card.content, ' after waiting');
                        }
                        // console.log('jk card was matched and removed, player ', playerId, ' is no longer blocked');
                    }
                }
                break;
            }
        }
        // if the player is currently in control of two cards, check if they match and give/remove
        // control accordingly
        if (player.inControl.length === 2) {
            const card1 = player.inControl[0];
            const card2 = player.inControl[1];
            assert(card1);
            assert(card2);
            const matches = card1.content === card2.content;
            // if cards don't match, relinquish control from current player and give it to player on waitlist
            if (!matches) {
                for (const c of [card1, card2]) {
                    this.changeControl(player, c, ChangeControl.Remove);
                    if (c.waitlist[0] !== undefined) { c.waitlist[0].resolve(); }
                }
                console.log('cards dont match');
            } else { 
                console.log('cards match'); 
            }
        }

        boardChange ? this.resolveWatchers() : null;
        this.checkRep();
    }

    /**
     * Removes the player's first card from its control
     * 
     * @param player player to remove control from
     */
    private relinquishFirstCard(player:Player): void {
        const firstCard = player.inControl[0];
        if (firstCard !== undefined) {
            this.changeControl(player, firstCard, ChangeControl.Remove); 
            this.changeFlip(player);
            firstCard.waitlist[0] !== undefined ? firstCard.waitlist[0].resolve() : null;
        }
        this.checkRep();
    }

    // switch the current flip count the player is on
    private changeFlip(player:Player):void {
        player.flip === FlipCount.First ? player.flip = FlipCount.Second : player.flip = FlipCount.First;
    }

    /**
     * Gives a player control of a card/space on the grid or removes it. The space specified on the grid must have a card
     * 
     * @param player a player in the game
     * @param card card to change control of
     * @param change dictates whether control of this card should be given to or removed from player
     */
    private changeControl(player:Player, card:Card, change:ChangeControl):void {
        assert(card.faceDirection !== FaceDirection.Removed);
        switch (change) {
            case ChangeControl.Give: {
                assert(card.controlledBy === undefined);
                card.controlledBy = player;
                player.inControl.push(card);
                break;
            }
            case ChangeControl.Remove: {
                assert(card.controlledBy === player);
                card.controlledBy = undefined;
                player.inControl = player.inControl.filter(c => c!==card); 
                player.previouslyFlipped.push(card);
                break;
            }
        }
        this.checkRep();
    }

    /**
     * Gets the card located at the specified location. If the card has been removed, then 
     * returns undefined
     * 
     * @param row row number of card to flip; must be an integer if [0, height), 
     *            indexed from the top of the board
     * @param column column number of card to flip; must be an integer in [0, width),
     *               indexed from the left of the board
     * @returns the card at the specified location on the board. If the string is empty or of
     *          whitespace/newline characters, return undefined
     */
    private getCard(row:number, column:number): Card {
        this.checkInRange(row, column);
        const boardRow = this.cards[row];
        assert(boardRow);
        const card = boardRow[column];
        assert(card);
        return card;
    }

    /**
     * Adds a player to this game
     * 
     * @param player player to be added
     */
    public addPlayer(player: string):void {
        const playerObj:Player = {inControl:new Array<Card>(), 
                                  previouslyFlipped:new Array<Card>(), flip:FlipCount.First};
        this.players.set(player, playerObj);
        this.checkRep();
    }

    // checks if the given dimensions are within the dimensions of the game board
    private checkInRange(row: number, column:number):void {
        assert(row >= 0 && row < this.height);
        assert(column >= 0 && column < this.width);
    }

    /**
     * 
     * @param playerId ID of player applying the map; must be a nonempty string of alphanumeric 
     *                 or underscore characters
     * @param f pure function from cards to cards
     */
    public async map(playerId:string, f: ((card: string) => Promise<string>)):Promise<void> {
        const allPromises = new Array<Promise<void>>();
        let boardChange = false;
        for (const row of this.cards) {
            for (const card of row) {
                const promise = f(card.content).then((mapped) => {
                    card.content !== mapped ? boardChange = true : null;
                    card.content = mapped;
                });
                allPromises.push(promise);
            }
        }
        await Promise.all(allPromises);
        boardChange ? this.resolveWatchers() : null;
    }

    /**
     * Watches the board for a change, blocking until any cards turn face up or face down, 
     * are removed from the board, or change from one string to a different string. This only
     * gives notification for a single change
     *
     * @param playerId ID of player watching the board; 
     *                 must be a nonempty string of alphanumeric or underscore characters
     * @returns the state of the board, in the format described in the ps4 handout
     */
    public async watch(playerId: string): Promise<void> {
        const deferred = new Deferred<void>();
        this.watchers.push(deferred);
        await deferred.promise;
    }

    // resolves all the players who are currently watching the board
    private resolveWatchers():void {
        for (const deferred of this.watchers) {
            deferred.resolve();
        }
    }

    /**
     * Shows the current state of the board from the player's persective using the grammar
     * provided in the ps4 handout
     * 
     * @param player player whose perspective the return value will be based on
     * @returns the current state of the board from the player's perspective
     */
    public playerToString(player:string):string {
        const playerObj = this.players.get(player);
        const dimensions = this.height + "x" + this.width;
        let board = "";
        for (const row of this.cards) {
            for (const card of row) {
                if (card.faceDirection === FaceDirection.Removed) {
                    board += 'none\n';
                } else if (card.faceDirection === FaceDirection.Down) {
                    board += 'down\n';
                } else if (card.controlledBy === playerObj) {
                    board += 'my ' + card.content + "\n";
                } else {
                    board += 'up ' + card.content + "\n";
                }
            }
        }
        return dimensions + "\n" + board;
    }

    /**
     * @inheritdoc
     */
    public toString():string {
        let boardString = '';
        for (const row of this.cards) {
            assert(row);
            for (const card of row) {
                assert(card);
                if (card.faceDirection === FaceDirection.Up) {
                    boardString += " " + card.content;
                } else if (card.faceDirection == FaceDirection.Down) {
                    boardString += " D";
                } else {
                    boardString += " _";
                }
            }
            boardString += '\n';
        }
        return boardString;
    }

    public equalValue(that: Board): boolean {
        function cardEqualValue(this:Card, that:Card):boolean {
            let cardMatch = true;
            cardMatch = cardMatch && this.content === that.content;
            cardMatch = cardMatch && this.faceDirection === that.faceDirection;
            cardMatch = cardMatch && this.waitlist.length === that.waitlist.length;
            return cardMatch;
        }
        const widthMatch = this.width === that.width;
        const heightMatch = this.height === that.height;
        let cardMatch = true;
        for (let i=0; i<this.cards.length; i++) {
            assert(this.cards[0])
            for (let j=0; j<this.cards[0].length; j++) {
                    const cardsRowThis = this.cards[i];
                    const cardsRowThat = that.cards[i];
                    assert(cardsRowThis);
                    assert(cardsRowThat);
                    // console.log('that' , cardsRowThat[j]);
                    const thisCard = cardsRowThis[j];
                    const thatCard = cardsRowThat[j];
                    assert(thisCard !== undefined);
                    assert(thatCard !== undefined);
                    cardMatch = cardMatch && thisCard.content === thatCard.content;
                    cardMatch = cardMatch && thisCard.faceDirection === thatCard.faceDirection;
                    cardMatch = cardMatch && thisCard.waitlist.length === thatCard.waitlist.length;
                    // controlled by will be checked when checking players
            } 
        }
        const watchMatch = this.watchers.length === that.watchers.length;
        let playersMatch = true;
        for (const id of this.players.keys()) {
            const thisPlayer = this.players.get(id);
            const thatPlayer = that.players.get(id);
            assert(thisPlayer);
            if (thatPlayer === undefined) { return false; }
            playersMatch = playersMatch && thisPlayer.flip === thatPlayer.flip;
            if (thisPlayer.inControl[0] !== undefined && thatPlayer.inControl[0] !== undefined) {
                playersMatch = playersMatch && thisPlayer.inControl[0].content === thatPlayer.inControl[0].content;
            } else if (!(thisPlayer.inControl[0] === undefined && thatPlayer.inControl[0] === undefined)) {
                return false;
            }
            if (thisPlayer.inControl[1] !== undefined && thatPlayer.inControl[1] !== undefined) {
                playersMatch = playersMatch && thisPlayer.inControl[1].content === thatPlayer.inControl[1].content;
            } else if (!(thisPlayer.inControl[1] === undefined && thatPlayer.inControl[1] === undefined)) {
                return false;
            }
        }
        return widthMatch && heightMatch && cardMatch && watchMatch && playersMatch;
    }

    /**
     * Make a new board by parsing a file.
     * 
     * PS4 instructions: the specification of this method may not be changed.
     * 
     * @param filename path to game board file
     * @returns (a promise for) a new board with the size and cards from the file
     * @throws Error if the file cannot be read or is not a valid game board
     */
    public static async parseFromFile(filename: string): Promise<Board> {
        const boardFile = fs.promises.readFile(filename, { encoding: 'utf-8' });
        const contents = (await boardFile).split('\n');

        assert(contents[0] !== undefined);
        const dimensions = contents[0].split('x');
        assert(dimensions !== undefined && dimensions.length === 2);

        const boardArray = new Array<Array<string>>();
        assert(dimensions[0] !== undefined && dimensions[1] !== undefined);
        const height = parseInt(dimensions[0]);
        const width = parseInt(dimensions[1]);
        for (let row=0; row<height; row++) {
            if (boardArray[row] === undefined) { boardArray[row] = new Array<string>(); }
            const rowArray = boardArray[row];
            assert(rowArray);
            for (let col=0; col<width; col++) {
                const cardIndex = row * width + col + 1;
                const card = contents[cardIndex];
                assert(card !== undefined, "" + row + " " +  col);
                card !== undefined ? rowArray[col] = card : null;
                
            }
        }
        // assert.fail("" + boardArray.length);
        return new Board(boardArray, width, height);
    }
}
