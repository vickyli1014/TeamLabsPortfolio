/* Copyright (c) 2021-2022 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { AnswerDifficulty, Flashcard } from '../src/flashcards';
import { toBucketSets, getBucketRange, practice, update, getHint, computeProgress } from '../src/algorithm';

/*
 * Warning: all the tests you write in this file must be runnable against any
 * implementations that follow the spec. Your tests will be run against several staff
 * implementations.
 * 
 * DO NOT strengthen the spec of any of the tested functions (except getHint, as
 * described in the ps1 handout).
 * 
 * In particular, your test cases must not call helper functions of your own that
 * you have put in algorithms.ts or any other file in src/.
 * If you need such helper functions in your testing code, define them in
 * this test class or in another class in the test/ folder.
 */

describe('toBucketSets', function() {
    /*
     * Testing strategy for result = toBucketSets(map)
     * 
     * partition on map: empty, nonempty
     * partition on map buckets: all only contain 1 card, all contain no cards, all contain any number of cards
     * partition on map values: all values in map are consecutive, 
     *                          all values in map are not consecutive (there exists empty buckets between nonempty ones)
     * partition on map: flashcards sorted by bucket, not sorted
     */

    it('covers map: empty, map buckets contain no cards', function () {
        const emptyMap:Map<Flashcard, number> = new Map([]);
        const buckets: Array<Set<Flashcard>> = toBucketSets(emptyMap);
        for (let i = 0; i < buckets.length; ++i) {
            assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty");
        }
    });

    it('covers map: nonempty, previous partitions', function() {
        const map:Map<Flashcard, number> = new Map([[Flashcard.make("花", "flower"), 1]]);
        const buckets:Array<Set<Flashcard>> = toBucketSets(map);
        assert.deepStrictEqual(buckets[0].size, 0, "expected an empty bucket");
        assert.deepStrictEqual(buckets[1], new Set([Flashcard.make("花", "flower")]), "expected correct bucket contents");
        for (let i = 2; i < buckets.length; ++i) {
            assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty");
        }     
    });

    it('covers map buckets only contain 1 card, map values: all values in map are consecutive, map values: out of bucket order', function() {
        const map:Map<Flashcard, number> = new Map([
                    [Flashcard.make("木", "tree"), 1],
                    [Flashcard.make("土", "soil"), 2],
                    [Flashcard.make("kusa", "grass"), 0]]);
        const buckets:Array<Set<Flashcard>> = toBucketSets(map);
        assert.deepStrictEqual(buckets[0], new Set([Flashcard.make("kusa", "grass")]), "expected correct bucket contents");
        assert.deepStrictEqual(buckets[1], new Set([Flashcard.make("木", "tree")]), "expected correct bucket contents");
        assert.deepStrictEqual(buckets[2], new Set([Flashcard.make("土", "soil")]), "expected correct bucket contents");
        for (let i = 5; i < buckets.length; ++i) {
            assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty");
        }
    });

    it('covers map buckets contain any number of cards, map values: all values in map are not consecutive, map values: in bucket order', function() {
        const map:Map<Flashcard, number> = new Map([
            [Flashcard.make("木", "tree"), 1],
            [Flashcard.make("土", "soil"), 2],
            [Flashcard.make("花", "flower"), 2],
            [Flashcard.make("kusa", "grass"), 4]]);
        const buckets:Array<Set<Flashcard>> = toBucketSets(map);
        assert.deepStrictEqual(buckets[0].size, 0, "expected an empty bucket");
        assert.deepStrictEqual(buckets[1], new Set([Flashcard.make("木", "tree")]), "expected correct bucket contents");
        assert.deepStrictEqual(buckets[2], new Set([Flashcard.make("土", "soil"), Flashcard.make("花", "flower")]), "expected correct bucket contents");
        assert.deepStrictEqual(buckets[3].size, 0, "expected an empty bucket");
        assert.deepStrictEqual(buckets[4], new Set([Flashcard.make("kusa", "grass")]), "expected correct bucket contents");
        for (let i = 5; i < buckets.length; ++i) {
            assert.strictEqual(buckets[i].size, 0, "expected other buckets to be empty");
        }
    });

});

describe('getBucketRange', function() {
    /*
     * Testing strategy for getBucketRange(buckets):
     * 
     * partition on buckets: all empty buckets, no empty buckets, mixture of empty and nonempty buckets, no buckets
     * partition on buckets: all nonempty buckets consecutive, all nonempty buckets not consecutive
     * partition on buckets: empty bucket at 0, 1, both ends
     * partition on output: low===high, low!==high
     */
    it('covers buckets: all empty buckets', function() {
        const buckets:Array<Set<Flashcard>> = [new Set<Flashcard>()];
        const range:Array<number> = getBucketRange(buckets);
        const low:number = range[0];
        const high:number = range[1];
        assert.strictEqual(high-low, 0, "expected smallest possible high-low");
        assert(high>=0, "expected high to be non-negative");
        assert(low>=0, "expected low to be non-negative");
    });

    it('covers buckets: no buckets', function() {
        const buckets:Array<Set<Flashcard>> = [];
        const range:Array<number> = getBucketRange(buckets);
        const low:number = range[0];
        const high:number = range[1];
        assert.strictEqual(high-low, 0, "expected smallest possible high-low");
    });

    it('covers buckets: no empty buckets, buckets: all nonempty buckets consecutive, buckets: empty bucket at 0 ends, output: low!==high', function() {
        const buckets:Array<Set<Flashcard>> = [
                    new Set([Flashcard.make("ichi", "one"), Flashcard.make("ni", "two")]),
                    new Set([Flashcard.make("san", "three")]),
                    new Set([Flashcard.make("yon", "four")])
                ];
        const range:Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low:number = range[0];
        const high:number = range[1];
        assert.strictEqual(low, 0, "expected correct low");
        assert.strictEqual(high, 2, "expected correct high");
    });

    it('covers buckets: all nonempty buckets not consecutive, buckets: mixture of empty and nonempty, buckets: empty bucket at 1 end', function() {
        const buckets:Array<Set<Flashcard>> = [
                    new Set<Flashcard>(),
                    new Set([Flashcard.make("go", "five"), Flashcard.make("roku", "six")]),
                    new Set<Flashcard>(),
                    new Set([Flashcard.make("shichi", "seven")]),
                ];
        const range:Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low:number = range[0];
        const high:number = range[1];
        assert.strictEqual(low, 1, "expected correct low");
        assert.strictEqual(high, 3, "expected correct high");
    });

    it('covers output: low===high, buckets: empty buckets at both ends', function() {
        const buckets:Array<Set<Flashcard>> = [
                    new Set<Flashcard>(),
                    new Set([Flashcard.make("hachi", "eight"), Flashcard.make("kyuu", "nine")]),
                    new Set<Flashcard>(),
                ];
        const range:Array<number> = getBucketRange(buckets);
        assert.strictEqual(range.length, 2, "expected a pair of integers");
        const low:number = range[0];
        const high:number = range[1];
        assert.strictEqual(low, 1, "expected correct low");
        assert.strictEqual(high, 1, "expected correct high");
    });
});

describe('practice', function() {
    /*
     * Testing strategy for practice(day, buckets, retiredBucket):
     * 
     * partitions of day: 1 < day < 2^(retiredBucket), >= 2^(retiredBucket), = 1
     * partitions of buckets: no empty buckets, all buckets empty, mixture of empty buckets and nonempty buckets
     * partition of output: practicing some cards, 
     *                      practicing all non-retired cards, 
     *                      practicing no cards
     * paritions of retiredBucket: = 0, > 0
     *                        
     */
    
    it('covers buckets: all buckets empty', function() {
        assert.deepStrictEqual(practice(1, [new Set()], 3), [], "expected no cards to practice");
    });

    it('covers retiredBucket=0, no empty buckets', function() {
        const buckets = [new Set([Flashcard.make("shiro", "white"), Flashcard.make("kuro", "black")])];
        const day = 5;
        const retiredBucket = 0;
        const cards:Array<Flashcard> = practice(day, buckets, retiredBucket);
        const expected:Array<Flashcard> = [];
        assert.deepStrictEqual(cards, expected, "expected no practice cards");
    });

    it("covers day < 2^(retiredBucket), buckets: mixture of empty and nonempty buckets, practicing some cards, retiredBuckets>0", function() {
        const buckets = [new Set([Flashcard.make("shiro", "white"), Flashcard.make("kuro", "black")]),
                        new Set<Flashcard>(),
                        new Set([Flashcard.make("aka", "red")]),
                        new Set([Flashcard.make("midori", "green")]),
                        new Set<Flashcard>()];
        const day = 4;
        const retiredBucket = 4;
        const cards:Array<Flashcard> = practice(day, buckets, retiredBucket);
        const expected:Array<Flashcard> = [Flashcard.make("shiro", "white"), Flashcard.make("kuro", "black"), 
                                            Flashcard.make("aka", "red")];
        for (const card of cards) {
            assert(expected.includes(card), "produced incorrect practice card");
        }
        for (const card of expected) {
            assert(cards.includes(card), "expected practice card missing");
        }
    });

    it("covers day=1, buckets: mixture of empty and nonempty buckets", function() {
        const buckets = [new Set([Flashcard.make("kiiro", "yellow"), Flashcard.make("murasaki", "purple")]),
                        new Set<Flashcard>(),
                        new Set([Flashcard.make("haiiro", "gray")]),
                        new Set<Flashcard>()];
        const day = 1;
        const retiredBucket = 3;
        const cards:Array<Flashcard> = practice(day, buckets, retiredBucket);
        const expected:Array<Flashcard> = [Flashcard.make("kiiro", "yellow"), Flashcard.make("murasaki", "purple")];
        for (const card of cards) {
            assert(expected.includes(card), "produced incorrect practice card");
        }
        for (const card of expected) {
            assert(cards.includes(card), "expected practice card missing");
        }
    });

    it("covers day>=2^(retiredBuckets), practicing all non-retired cards", function() {
        const buckets = [new Set([Flashcard.make("haairo", "gray"), Flashcard.make("chairo", "brown")]),
                        new Set<Flashcard>(),
                        new Set([Flashcard.make("orenji", "orange"), Flashcard.make("pinku", "pink")]),
                        new Set([Flashcard.make("nijiiro", "raibow")])];
        const day = 16;
        const retiredBucket = 3;
        const cards:Array<Flashcard> = practice(day, buckets, retiredBucket);
        const expected:Array<Flashcard> = [Flashcard.make("haairo", "gray"), Flashcard.make("chairo", "brown"),
                                            Flashcard.make("orenji", "orange"), Flashcard.make("pinku", "pink")];
        for (const card of cards) {
            assert(expected.includes(card), "produced incorrect practice card");
        }
        for (const card of expected) {
            assert(cards.includes(card), "expected practice card missing");
        }
    });

    it("covers practicing no cards", function() {
        const buckets = [new Set<Flashcard>(),
                        new Set([Flashcard.make("shiro", "white"), Flashcard.make("kuro", "black")]),
                        new Set<Flashcard>(),
                        new Set([Flashcard.make("aka", "red")]),
                        new Set([Flashcard.make("midori", "green")])];
        const day = 5;
        const retiredBucket = 4;
        const cards:Array<Flashcard> = practice(day, buckets, retiredBucket);
        const expected:Array<Flashcard> = Array<Flashcard>();
        for (const card of cards) {
            assert(expected.includes(card), "produced incorrect practice card");
        }
        for (const card of expected) {
            assert(cards.includes(card), "expected practice card missing");
        }
    });

});

describe('update', function() {
    /*
     * testing strategy for update(card, answer, bucketMap, retiredBucket):
     * 
     * parition on card: new card, already seen card
     * partition on answer and card: 
     *      HARD and bucket 0
     *      HARD and bucket !==0
     *      EASY and retired
     *      EASY and not retired
     *      WRONG and any bucket
     * partition on bucketMap: empty, nonempty
     * partition on retiredBucket: =0, >0
     */

    it('covers card: new card, bucketMap: empty, answer and card: EASY and not retired', function() {
        const newCard:Flashcard = Flashcard.make('ichi', 'one');
        const bucketMap:Map<Flashcard, number> = new Map([]);
        update(newCard, AnswerDifficulty.EASY, bucketMap, 3);
        assert.deepStrictEqual(bucketMap, new Map([[newCard, 1]]), "expected card to move up");
    });

    it('covers card: non-new card, answer and card: HARD and bucket 0, bucketMap: nonempty, retiredBucket > 0', function() {
        const card:Flashcard = Flashcard.make("jyu", "ten");
        const bucketMap:Map<Flashcard, number> = new Map([[card, 0]]);
        update(card, AnswerDifficulty.HARD, bucketMap, 5);
        assert.deepStrictEqual(bucketMap, new Map([[card, 0]]), "expected card to stay");
    });

    it('covers answer and card: HARD and !==0', function() {
        const card:Flashcard = Flashcard.make("hyaku", "hundred");
        const bucketMap:Map<Flashcard, number> = new Map([[card, 2]]);
        update(card, AnswerDifficulty.HARD, bucketMap, 5);
        assert.deepStrictEqual(bucketMap, new Map([[card, 1]]), "expected card to move down");
    });

    it('covers answer and card: EASY and retired, retiredBucket=0', function() {
        const card:Flashcard = Flashcard.make("sen", "thousand");
        const bucketMap:Map<Flashcard, number> = new Map([[card, 0]]);
        update(card, AnswerDifficulty.EASY, bucketMap, 0);
        assert.deepStrictEqual(bucketMap, new Map([[card, 0]]), "expected card to stay");
    });

    it('covers answer: WRONG', function() {
        const card:Flashcard = Flashcard.make("man", "ten thousand");
        const bucketMap:Map<Flashcard, number> = new Map([[card, 4]]);
        update(card, AnswerDifficulty.WRONG, bucketMap, 5);
        assert.deepStrictEqual(bucketMap, new Map([[card, 0]]), "expected card to move to bucket 0");
    });
});

describe('getHint', function() {
    /*
     * testing strategy for getHint(card)
     * 
     * Include a testing strategy for the original weak spec,
     * plus a testing strategy for your new stronger spec.
     *
     * See the Testing reading for examples of what a testing strategy comment looks
     * like. Make sure you have partitions.
     * partition on relationship between length and contents of back of card:
     *      length = 0, 
     *      0 < length <= 3, back of card contains >=1 single lettered word
     *      0 < length <= 3, back of card contains no single lettered word
     *      length > 3, back of card contains 1 word with second longest length
     *      length > 3, back of card contains >1 word with second longest length
     * partition on output: undefined, something revealed, nothing revealed
     */

    it('covers 0 < length <= 3, contains >=1 single lettered word, nothing revealed', function() {
        assert.strictEqual(getHint(Flashcard.make("un",  "a")), '_');
    });

    it('covers length=0, output=undefined', function() {
        const card = Flashcard.make('', '');
        const hint = getHint(card);
        assert(hint === undefined, "expected undefined");
    });

    it('covers 0<length<=3, contains no single lettered word, output something revealed', function() {
        const card = Flashcard.make('uno', 'one');
        const emptyHint = "___";
        const hint = getHint(card);
        if (hint !== undefined) {
            assert.notEqual(hint.match(/[_]/), emptyHint.length, "expected some kind of hint");
            for (let i=0; i<emptyHint.length; i++) {
                assert(hint[i] === "_" || hint[i] === card.back[i], "expected correct hint");
            }
        } else {
            assert(hint !== undefined, "expecting hint");
        }
    });

    it('covers test case from weaker spec', function() {
        const card = Flashcard.make('dos minutos', 'two minutes');
        const emptyHint = "___________";
        const hint = getHint(card);
        if (hint !== undefined) {
            assert.notEqual(hint.match(/[_]/), emptyHint.length, "expected some kind of hint");
            for (let i=0; i<emptyHint.length; i++) {
                assert(hint[i] === "_" || hint[i] === card.back[i], "expected correct hint");
            }
        } else {
            assert(hint !== undefined, "expecting hint");
        }
    });

    it('covers length>3, contains 1 word with second longest length', function() {
        const card = Flashcard.make('uno dos tres quatro', 'one two three four');
        const hint = getHint(card);
        assert.strictEqual(hint, "___ ___ _____ four", "expected second longest word to be revealed");
    });

    it('covers length>3, contains >1 word with second longest length', function() {
        const card = Flashcard.make('aka ao midori pinku ao', 'red blue green pink blue');
        const hint = getHint(card);
        assert.strictEqual(hint, "___ blue _____ ____ ____", "expected only the first occurrence of the second longest word to be revealed");
    });
    /*
     * Note: unlike other functions in this problem set, the tests you write here
     * will *not* be run against any staff implementations of getHint.
     * 
     * You SHOULD strengthen the spec of getHint, and write your tests against
     * your stronger spec.
     */
});

describe('computeProgress', function() {
    /*
     * testing strategy for computeProgress(buckets, history):
     * 
     * partition on buckets: no buckets, empty buckets, some nonempty buckets, all buckets nonempty
     * partition on history: no cards practiced, some cards practiced, all cards practiced
     * partition on history: cards practiced 0, >=1 times
     * partition on right: 0, >0
     * partition on wrong: 0, >0
     * partition on dates: practiced cards, did not practice cards
     * partition on output tuples: all undefined, all defined, a mixture of undefined and defined tuples
     * partition on output avgAttempts: undefined, defined
     */

    it('covers no buckets', function() {
        const buckets = new Array<Set<Flashcard>>();
        const history = new Map<Flashcard, Array<[AnswerDifficulty, Date]>>;
        const progress = computeProgress(buckets, history);
        assert.strictEqual(progress[0].size, 0, "expected empty map");
        assert.strictEqual(progress[1], -1, "expected negative average");
    });

    it('covers empty buckets', function() {
        const buckets:Array<Set<Flashcard>> = [new Set<Flashcard>(), new Set<Flashcard>()];
        const history = new Map<Flashcard, Array<[AnswerDifficulty, Date]>>;
        const progress = computeProgress(buckets, history);
        assert.strictEqual(progress[0].size, 0, "expected empty map");
        assert.strictEqual(progress[1], -1, "expected negative average");
    });

    it('covers some nonempty buckets, all cards practiced, all cards practiced >= 1 time, right=0, wrong>0, output all defined, avgAttempt undefined', function (){
        const card = Flashcard.make("ichi", "one");
        const buckets:Array<Set<Flashcard>> = [new Set([card]), new Set<Flashcard>()];
        const date = new Date();
        const attempt: [AnswerDifficulty, Date] = [AnswerDifficulty.WRONG, date];
        const history = new Map([[card, [attempt]]]);
        const stats = computeProgress(buckets, history);
        const progress = stats[0];
        const cardProgress = progress.get(card);
        assert(cardProgress !== undefined, "expected stats");
        if (progress !== undefined) {
            assert.deepStrictEqual(cardProgress.length, 3, "expected a list of length 3");
            assert.strictEqual(cardProgress[0], 0, "expected correct right count");
            assert.strictEqual(cardProgress[1], 1, "expected correct wrong count");
            assert.deepStrictEqual(cardProgress[2], date, "expected correct date");
            assert.strictEqual(stats[1], -1, "expected negative average");
        }
    });

    it('covers all buckets nonempty, some cards practiced, right>0, wrong=0, output a mixture of defined and undefined', function() {
        const cards = [Flashcard.make("ichi", "one"), Flashcard.make("dos", "two"), Flashcard.make("san", "three")];
        const buckets:Array<Set<Flashcard>> = [new Set([cards[0], cards[2]]), new Set([cards[1]])];
        const dates = [new Date(), new Date(500)];
        const attempts: [AnswerDifficulty, Date][] = [[AnswerDifficulty.HARD, dates[0]], [AnswerDifficulty.EASY, dates[1]]];
        const history = new Map([[cards[0], [attempts[0]]], [cards[1], [attempts[1]]]]);
        const stats = computeProgress(buckets, history);
        const progress = stats[0];
        for (const key of [cards[0], cards[1]]) {
            const stats = progress.get(key);
            if (stats === undefined) {
                assert(stats !== undefined, "expected stats");
            } else {
                assert.strictEqual(stats.length, 3, "expected a list of length 3");
                assert.strictEqual(stats[0], 1, "expected correct right count");
                assert.strictEqual(stats[1], 0, "expected correct wrong count");
            }
        }
        const card1Progress = progress.get(cards[0]);
        const card2Progress = progress.get(cards[1]);
        const card3Progress = progress.get(cards[2]);
        if (card1Progress !== undefined) 
            { assert.deepStrictEqual(progress.get(cards[0])![2], dates[0], "expected correct date for first card"); }
        else { assert(card1Progress!==undefined); }
        if (card2Progress !== undefined) 
            { assert.deepStrictEqual(progress.get(cards[1])![2], dates[1], "expected correct date for second card"); }
        else { assert(card2Progress!==undefined); }
        assert(card3Progress === undefined, "expected undefined tuple");
        assert.strictEqual(stats[1], 1, "expected correct average attempt");
    });

    it('no cards practiced, card practiced 0 times, output undefined', function() {
        const card1 = Flashcard.make("ichi", "one");
        const card2 = Flashcard.make("dos", "two");
        const buckets:Array<Set<Flashcard>> = [new Set([card1]), new Set([card2]), new Set<Flashcard>()];
        const history = new Map([[card1, new Array<[AnswerDifficulty, Date]>()], [card2, new Array<[AnswerDifficulty, Date]>()]]);
        const stats = computeProgress(buckets, history);
        const progress = stats[0];
        for (const key of [card1, card2]) {
            const cardProgress = progress.get(key);
            if (cardProgress !== undefined)
                { assert(cardProgress === undefined, "expected undefined tuple"); }
        }
        assert.strictEqual(stats[1], -1, "expected negative average");
    });

    it('test case to test avgAttempts', function() {
        const card1 = Flashcard.make("ichi", "one");
        const card2 = Flashcard.make("dos", "two");
        const date = new Date();
        const buckets:Array<Set<Flashcard>> = [new Set<Flashcard>(), new Set([card2, card1])];
        const attempts: [AnswerDifficulty, Date][] = [[AnswerDifficulty.HARD, date], [AnswerDifficulty.EASY, date], [AnswerDifficulty.WRONG, date]];
        const history = new Map([[card1, [attempts[0], attempts[0], attempts[2], attempts[1]]], [card2, [attempts[1], attempts[0], attempts[1]]]]);
        const stats = computeProgress(buckets, history);
        const progress = stats[0];
        const expected:[Map<Flashcard, [number, number, Date]|undefined>, number] = [new Map([[card1, [3, 1, date]], [card2, [3, 0, date]]]), 3.5];
        for (const key of [card1, card2]) {
            const stats = progress.get(key);
            if (stats === undefined) 
                { assert(stats!==undefined, "expected progress"); }
            const cardProgressExpected = expected[0].get(key);
            if (cardProgressExpected === undefined) 
                { assert(cardProgressExpected!==undefined); }
            assert.strictEqual(stats.length, 3, "expected a list of length 3");
            assert.strictEqual(stats[0], cardProgressExpected[0], "expected correct right count");
            assert.strictEqual(stats[1], cardProgressExpected[1], "expected correct wrong count");
            assert.deepStrictEqual(progress.get(card1)![2], date, "expected correct date for first card");
        }
        assert.strictEqual(stats[1], 3.5, "expected correct average attempt");
    });

});
