/* Copyright (c) 2021-2022 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { AnswerDifficulty, Flashcard } from '../src/flashcards';
import { toBucketSets, getBucketRange, practice, update, getHint, computeProgress } from '../src/algorithm';

/**
 * @param arr array of elements
 * @returns a random element of `arr`, or undefined if `arr` is empty
 */
function randomChoiceFrom<T>(arr: Array<T>): T|undefined {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

/**
 * Simulates some days of practicing with the Modified-Leitner
 * flashcard algorithm.
 */
function main(): void {
    // retired bucket
    const RETIRED_BUCKET = 5;

    // number of practice days to simulate
    const NUMBER_OF_PRACTICE_DAYS = 40;

    // a set of flashcards to practice
    const cards: Set<Flashcard> = new Set([
        Flashcard.make("Apfel", "apple"),
        Flashcard.make("manzana", "apple"),
        Flashcard.make("pomme", "apple"),
        Flashcard.make("táo", "apple"),
        Flashcard.make("яблоко", "apples")
    ]);

    // start all unknown cards in bucket 0
    const bucketMap: Map<Flashcard, number> = new Map();
    for (const card of cards) {
        bucketMap.set(card, 0);
    }
    // and add an English one in the retired bucket
    bucketMap.set(Flashcard.make("apple", "a red or green tree fruit"), RETIRED_BUCKET);

    // simulate some days of practicing
    for (let day = 1; day <= NUMBER_OF_PRACTICE_DAYS; day++) {
        console.log("Day", day);
        console.log("buckets range is", getBucketRange(toBucketSets(bucketMap)));

        for (const card of practice(day, toBucketSets(bucketMap), RETIRED_BUCKET)) {
            const answer: AnswerDifficulty = 
                randomChoiceFrom([
                    AnswerDifficulty.EASY, AnswerDifficulty.HARD, AnswerDifficulty.WRONG
                ]) ?? assert.fail("shouldn't get here");
            console.log(card, "was", AnswerDifficulty[answer]);
            update(card, answer, bucketMap, RETIRED_BUCKET);
        }

        console.log("new buckets are", toBucketSets(bucketMap), "\n");
    }

    // display progress to the user
    // ... computeProgress() ...
}

if (require.main === module) {
    main();
}
