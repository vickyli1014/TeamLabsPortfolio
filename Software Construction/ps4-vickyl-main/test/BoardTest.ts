/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import fs from 'fs';
import { Board } from '../src/Board';

/**
 * The identity pure function
 * 
 * @param str any string to take the identity of
 * @returns the identity of the input
 */
function pureF(str:string):Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        resolve(str);
    });
    return promise;
}
/**
 * Pure function that always returns 'test'
 * 
 * @param str any string
 * @returns 'test'
 */
function allTheSameOutput(str:string):Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
        resolve('test');
    });
    return promise;
}

/**
 * Tests for the Board abstract data type.
 */
describe('Board', function () {
    
    // Testing strategy
    // flip, removeCard, getCard, addPlayer, map, watch. toString:
    //     partition on this: 
    //         - contains empty spaces
    //         - does not contain empty spaces
    //         - width: 1, >1
    //         - height: 1, >1
    // flip:
    //     parition on player: 
    //         - first flip
    //         - second flip
    //     partition on the first identified space:
    //         - there is no card there (identified empty space)
    //         - the card is faced down
    //         - the card is faced up but not controlled by another player
    //         - the card is faced up and controlled by another player
    //     partition on the second flip:
    //         - matches the first flip
    //         - does not match the first flip
    //         - controlled by another player (including themselves)
    //         - not controlled by another player
    //         - blank
    //     partition condition when a player is no longer blocked:
    //         - player originally in control of card mismatches
    //         - player originally in control of card fails
    //         - pplayer originally in control of card matches
    // getCard:
    //     partition on the identified space:
    //         - there is no card there (identified empty space)
    //         - there is a card there
    // map:
    //     partition on function (output vs input):
    //         - identity function (output === input)
    //         - output !== input
    //     partition on function:
    //         - bijection
    //         - not a one to one
    // watch:
    //     partition on number of watchers: 0, 1, >1
    //     partition on actions after: 
    //         - watcher makes the next immediate move
    //         - another player makes the next immediate move
    // equalValue:
    //     partition on output: true, false
    // parseFromFile():
    //     partition on file content: 
    //         - valid string
    //         - invalid string

    it('invalid file content', async function() {
        try {
            await Board.parseFromFile('doesntexsit.txt');
        } catch {
            assert.fail;
        }
    });
            
    it('this does not contain empty spaces, first flip a card that is faced down, getting a card that is there, height & width>1', async function() {
        const board = await Board.parseFromFile('./boards/perfect.txt');
        board.addPlayer('p1');
        // assert.deepStrictEqual(board.getCard(0, 0), "hi", "expected correct card");
        await board.flip('p1', 0, 0);
        // assert.deepStrictEqual(board.getCard(0, 0), "hi", "expected correct card even after flipping");
        assert.strictEqual(board.playerToString('p1'), "3x3\nmy 🦄\ndown\ndown\ndown\ndown\ndown\ndown\ndown\ndown\n", "incorrect string representation after flipping");
    });

    it('this contains empty spaces, flipping an empty space, getting a card at an empty space, height=1', async function() {
        const board = await Board.parseFromFile('./boards/containsEmpty.txt');
        board.addPlayer('p1');

        await assert.rejects(
            async () => {  await board.flip('p1', 0, 2); }
        );
        assert.strictEqual(board.playerToString('p1'), "1x3\ndown\ndown\nnone\n", "expected nothing to happen after flipping an empty space");
        await board.flip('p1', 0, 1);
        assert.strictEqual(board.playerToString('p1'), "1x3\ndown\nmy owo\nnone\n", "expected only one card in control when first flip on empty space");
        await assert.rejects(
            async () => { await board.flip('p1', 0, 2); }
        );
        assert.strictEqual(board.playerToString('p1'), "1x3\ndown\nup owo\nnone\n", "expected nothing to happen after flipping an empty space");
        await board.flip('p1', 0, 0);
        assert.strictEqual(board.playerToString('p1'), "1x3\nmy uwu\ndown\nnone\n", "expected one card in control");

        await board.map('p1', pureF);
        assert.strictEqual(board.playerToString('p1'), "1x3\nmy uwu\ndown\nnone\n", "expected identity mapping");
    }); 

    it('flipping a second card that does not match the first, flipping a card that is faced up but not controlled by another player, one watcher', async function() {
        const board = await Board.parseFromFile('./boards/2by2.txt');
        const p1 = 'p1';
        const p2 = 'p2';
        board.addPlayer(p1);
        board.addPlayer(p2);

        await board.flip(p1, 0, 0);
        board.watch(p2);
        await board.flip(p1, 0, 1);
        assert.strictEqual(board.playerToString(p1), "2x2\nup hi\nup bye\ndown\ndown\n", "expected p1 to lose control of cards after mismatch");
        assert.strictEqual(board.playerToString(p2), "2x2\nup hi\nup bye\ndown\ndown\n", "expected p1 to lose control of cards after mismatch");

        board.watch(p2);
        await board.flip(p2, 0, 1);
        assert.strictEqual(board.playerToString(p2), "2x2\nup hi\nmy bye\ndown\ndown\n", "expected p2 to gain control of faced up card");

        await board.map(p2, allTheSameOutput);
        assert.strictEqual(board.playerToString(p2), "2x2\nup test\nmy test\ndown\ndown\n", "expected p2 to gain control of faced up card");
    });

    it('flipping a second card that matches the first, flipping a second card that is already in control', async function() {
        const board = await Board.parseFromFile('./boards/2by2.txt');
        const p1 = 'p1';
        const p2 = 'p2';
        board.addPlayer(p2);
        board.addPlayer(p1);
        await board.flip(p1, 0, 0);
        await board.flip(p1, 1, 1);
        assert.strictEqual(board.playerToString(p1), "2x2\nmy hi\ndown\ndown\nmy hi\n", "expected p1 to gain control of both cards after a match");
        assert.strictEqual(board.playerToString(p2), "2x2\nup hi\ndown\ndown\nup hi\n", "expected p1 to gain control of both cards after a match");
        await board.flip(p1, 0, 1);
        assert.strictEqual(board.playerToString(p1), "2x2\nnone\nmy bye\ndown\nnone\n", "expected matched cards to disappear after attempting to flip again");
        await assert.rejects(
            async () => { await board.flip(p2, 0, 0); }
        );

        // second card controlled by someone else 
        await board.flip(p2, 1, 0);
        assert.strictEqual(board.playerToString(p2), "2x2\nnone\nup bye\nmy bye\nnone\n", "expected p2 to gain control of first card");
        await assert.rejects(
            async () => {  await board.flip(p2, 0, 1); }
        );
        assert.strictEqual(board.playerToString(p2), "2x2\nnone\nup bye\nup bye\nnone\n", "expected operation to fail, p2 to relinquish control of first card");
        assert.strictEqual(board.playerToString(p1), "2x2\nnone\nmy bye\nup bye\nnone\n", "expected both cards to be faced up");
        // second card controlled by self
        await board.flip(p2, 1, 0);
        assert.strictEqual(board.playerToString(p2), "2x2\nnone\nup bye\nmy bye\nnone\n", "expected p2 to gain control of first card");
        await assert.rejects(
            async () => {  await board.flip(p2, 1, 0); }
        );
        assert.strictEqual(board.playerToString(p2), "2x2\nnone\nup bye\nup bye\nnone\n", "expected operation to fail, p2 to relinquish control of first card");
        assert.strictEqual(board.playerToString(p1), "2x2\nnone\nmy bye\nup bye\nnone\n", "expected both cards to be faced up");

        await board.map(p1, pureF);
        assert.strictEqual(board.playerToString(p2), "2x2\nnone\nup bye\nup bye\nnone\n", "expected operation to fail, p2 to relinquish control of first card");
        assert.strictEqual(board.playerToString(p1), "2x2\nnone\nmy bye\nup bye\nnone\n", "expected both cards to be faced up");
    });

    it('flipping a first card that is faced up and controlled by another player, mismatch happens before blocking, width=1', async function() {
        const board = await Board.parseFromFile('./boards/width1.txt');
        const p1 = 'p1';
        const p2 = 'p2';
        board.addPlayer(p1);
        board.addPlayer(p2);
        // p2 is blocked and takes control after p1 mismatches
        await board.flip(p1, 0, 0);
        await Promise.all([board.flip(p2, 0, 0), board.flip(p1, 1, 0)]);
        assert.strictEqual(board.playerToString(p1), "3x1\nup :D\nup D:\ndown\n", "expected p1 to not have control over anything");
        assert.strictEqual(board.playerToString(p2), "3x1\nmy :D\nup D:\ndown\n", "expected p2 to have control");

        await board.map(p2, allTheSameOutput);
        assert.strictEqual(board.playerToString(p1), "3x1\nup test\nup test\ndown\n", "expected p1 to not have control over anything");
        assert.strictEqual(board.playerToString(p2), "3x1\nmy test\nup test\ndown\n", "expected p2 to have control");

        const board2 = await Board.parseFromFile('./boards/width1.txt');
        assert(!board.equalValue(board2), "expected false output from equalValue");
    });

    it('player no longer blocked because another player failed, true equalValue', async function() {
        const board = await Board.parseFromFile('./boards/width1.txt');
        const p1 = 'p1';
        const p2 = 'p2';
        board.addPlayer(p1);
        board.addPlayer(p2);

        // p2 is blocked and takes control after p1 fails second flip
        await board.flip(p1, 0, 0);
        await assert.rejects(
            async () => {  await Promise.all([board.flip(p2, 0, 0), board.flip(p1, 0, 0)]); }
        );
        assert.strictEqual(board.playerToString(p1), "3x1\nup :D\ndown\ndown\n", "expected p1 to not have control over anything");
        assert.strictEqual(board.playerToString(p2), "3x1\nmy :D\ndown\ndown\n", "expected p2 to have control");

        // copy to test true equalValue
        const board2 = await Board.parseFromFile('./boards/width1.txt');
        const p12 = 'p1';
        const p22 = 'p2';
        board2.addPlayer(p12);
        board2.addPlayer(p22);

        // p2 is blocked and takes control after p1 fails second flip
        await board2.flip(p1, 0, 0);
        await assert.rejects(
            async () => {  await Promise.all([board2.flip(p22, 0, 0), board2.flip(p12, 0, 0)]); }
        )
        assert.strictEqual(board2.playerToString(p1), "3x1\nup :D\ndown\ndown\n", "expected p1 to not have control over anything");
        assert.strictEqual(board2.playerToString(p2), "3x1\nmy :D\ndown\ndown\n", "expected p2 to have control");
        
        assert(board.equalValue(board2), "expecte true output from equalValue");
    });

    it('while player is blocked, the card is matched by another player', async function() {
        const board = await Board.parseFromFile('./boards/2by2.txt');
        const p1 = 'p1';
        const p2 = 'p2';
        board.addPlayer(p1);
        board.addPlayer(p2);

        // p2 is blocked, p1 matches it before p2 can take control
        await board.flip(p1, 0, 0);
        await Promise.all([board.flip(p2, 0, 0), board.flip(p1, 1, 1), board.flip(p1, 0, 1)]);
        assert.strictEqual(board.playerToString(p1), "2x2\nnone\nmy bye\ndown\nnone\n", "expected matched cards to disappear");
        assert.strictEqual(board.playerToString(p2), "2x2\nnone\nup bye\ndown\nnone\n", "expected p2 to not be in control of any cards");
    });

    it('testing example from ps4 handout, >1 watchers', async function() {
        const board = await Board.parseFromFile('./boards/abc.txt');
        const a = 'Alice';
        const b = 'Bob';
        const c = 'Charlie';

        board.watch(a);
        await board.flip(a, 0, 0);
        Promise.all([board.flip(b, 0, 0), board.flip(c, 0, 0)]);
        assert.strictEqual(board.playerToString(a), "3x3\nmy ❤️\ndown\ndown\ndown\ndown\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(b), "3x3\nup ❤️\ndown\ndown\ndown\ndown\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(c), "3x3\nup ❤️\ndown\ndown\ndown\ndown\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");

        board.watch(b);
        this.timeout(100);
        await board.flip(a, 2, 2);
        assert.strictEqual(board.playerToString(a), "3x3\nup ❤️\ndown\ndown\ndown\ndown\ndown\ndown\ndown\nup 💜\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(b), "3x3\nmy ❤️\ndown\ndown\ndown\ndown\ndown\ndown\ndown\nup 💜\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(c), "3x3\nup ❤️\ndown\ndown\ndown\ndown\ndown\ndown\ndown\nup 💜\n", "expected Alice to be in control");

        board.watch(b);
        await board.flip(a, 1, 1);
        assert.strictEqual(board.playerToString(a), "3x3\nup ❤️\ndown\ndown\ndown\nmy 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(b), "3x3\nmy ❤️\ndown\ndown\ndown\nup 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(c), "3x3\nup ❤️\ndown\ndown\ndown\nup 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");

        await board.flip(b, 0, 2);
        assert.strictEqual(board.playerToString(a), "3x3\nup ❤️\ndown\nup ❤️\ndown\nmy 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(b), "3x3\nmy ❤️\ndown\nmy ❤️\ndown\nup 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(c), "3x3\nup ❤️\ndown\nup ❤️\ndown\nup 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");

        await board.flip(b, 1, 0);
        assert.strictEqual(board.playerToString(a), "3x3\nnone\ndown\nnone\nup 💚\nmy 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(b), "3x3\nnone\ndown\nnone\nmy 💚\nup 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(c), "3x3\nnone\ndown\nnone\nup 💚\nup 💛\ndown\ndown\ndown\ndown\n", "expected Alice to be in control");

        board.watch(b);
        await board.flip(c, 2, 2);
        assert.strictEqual(board.playerToString(a), "3x3\nnone\ndown\nnone\nup 💚\nmy 💛\ndown\ndown\ndown\nup 💜\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(b), "3x3\nnone\ndown\nnone\nmy 💚\nup 💛\ndown\ndown\ndown\nup 💜\n", "expected Alice to be in control");
        assert.strictEqual(board.playerToString(c), "3x3\nnone\ndown\nnone\nup 💚\nup 💛\ndown\ndown\ndown\nmy 💜\n", "expected Alice to be in control");

    });

    it('should behave correctly when a client flips a pair of matched cards, then another card, then a blank', async function() {
        const board = await Board.parseFromFile('./boards/2by2.txt');
        const p1 = 'p1';
        board.addPlayer(p1);

        await board.flip(p1, 0, 0);
        await board.flip(p1, 1, 1);
        assert.strictEqual(board.playerToString(p1), "2x2\nmy hi\ndown\ndown\nmy hi\n", "expected to gain control of both cards");

        await board.flip(p1, 1, 0);
        await assert.rejects(
            async () => {   await board.flip(p1, 0, 0); }
        );
        assert.strictEqual(board.playerToString(p1), "2x2\nnone\ndown\nup bye\nnone\n", "expected operation to fail, p1 to relinquish first card");
    });

    it('should behave correctly when mismatch then other client looks', async function() {
        const board = await Board.parseFromFile('./boards/2by2.txt');
        const p1 = 'p1';
        const p2 = 'p2';
        board.addPlayer(p1);
        board.addPlayer(p2);

        await board.flip(p1, 0, 0);
        await board.flip(p1, 1, 0);
        assert.strictEqual(board.playerToString(p1), "2x2\nup hi\ndown\nup bye\ndown\n", "expected operation to fail, p2 to relinquish control of first card");
        assert.strictEqual(board.playerToString(p2), "2x2\nup hi\ndown\nup bye\ndown\n", "expected operation to fail, p2 to relinquish control of first card");

        await board.flip(p2, 0, 0);
    });

    it('should allow interleaving maps to change cards', async function() {
        const board = await Board.parseFromFile('./boards/width1.txt');
        const p1 = 'p1';
        const p2 = 'p2';
        board.addPlayer(p1);
        board.addPlayer(p2);
        // p2 is blocked and takes control after p1 mismatches
        await board.flip(p1, 0, 0);
        await Promise.all([board.flip(p2, 0, 0), board.flip(p1, 1, 0)]);
        assert.strictEqual(board.playerToString(p1), "3x1\nup :D\nup D:\ndown\n", "expected p1 to not have control over anything");
        assert.strictEqual(board.playerToString(p2), "3x1\nmy :D\nup D:\ndown\n", "expected p2 to have control");

        await board.map(p1, pureF);
        assert.strictEqual(board.playerToString(p1), "3x1\nup :D\nup D:\ndown\n", "expected p1 to not have control over anything");
        assert.strictEqual(board.playerToString(p2), "3x1\nmy :D\nup D:\ndown\n", "expected p2 to have control");

        await board.map(p2, allTheSameOutput);
        assert.strictEqual(board.playerToString(p1), "3x1\nup test\nup test\ndown\n", "expected p1 to not have control over anything");
        assert.strictEqual(board.playerToString(p2), "3x1\nmy test\nup test\ndown\n", "expected p2 to have control");

    });

    it('when client flips the same location twice', async function() {
        const board = await Board.parseFromFile('./boards/2by2.txt');
        const p1 = 'p1';
        board.addPlayer(p1);

        await board.flip(p1, 0, 0);
        await assert.rejects(
            async () => {  await board.flip(p1, 0, 0); }
        );
        assert.strictEqual(board.playerToString(p1), "2x2\nup hi\ndown\ndown\ndown\n", "expected p1 to lose control of cards");
    })

});



/**
 * Example test case that uses async/await to test an asynchronous function.
 * Feel free to delete these example tests.
 */
describe('async test cases', function () {

    it('reads a file asynchronously', async function () {
        const fileContents = (await fs.promises.readFile('boards/ab.txt')).toString();
        assert(fileContents.startsWith('5x5'));
    });
});
