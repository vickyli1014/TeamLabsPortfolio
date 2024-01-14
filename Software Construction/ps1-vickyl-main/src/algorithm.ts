/* Copyright (c) 2021-2022 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { Flashcard, AnswerDifficulty } from './flashcards';

/**
 * Reorganize learning buckets from a map representation to a list-of-sets
 * representation.
 *
 * @param bucketMap maps each flashcard to a (nonnegative integer) bucket number
 * 
 * @returns a list of disjoint sets whose union is the set of cards in
 *          bucketMap, and where list[i] is the set of cards that
 *          bucketMap maps to i, for all i in [0, list.length).
 */
export function toBucketSets(bucketMap: Map<Flashcard, number>): Array<Set<Flashcard>> {
    const bucketSets = new Array<Set<Flashcard>>();
    // I decided to keep this code because I feel like it's etu and sfb. I've also talked to
    // a TA who agreed that there is nothing wrong with this code, where I first place the 
    // flashcards in their corresponding bucket (or create a bucket with a single card if the
    // bucket doesn't exist yet) and then fill the remaining undefined values with empty buckets
    // adds flashcard to corresponding bucket
    bucketMap.forEach((bucketNum, card) => {
        if (bucketSets[bucketNum] === undefined) {
            bucketSets[bucketNum] = new Set([card]);
        } else {
            bucketSets[bucketNum].add(card);
        }
    });

    // fills empty entries with empty buckets
    const numOfBuckets = bucketSets.length;
    for (let i=0; i<numOfBuckets; i++) {
        bucketSets[i] === undefined ? bucketSets[i] = new Set<Flashcard>() : null;
    }
    return bucketSets;
}

/**
 * Find a minimal range of bucket numbers covering a list of learning buckets.
 * 
 * @param buckets a list of disjoint sets representing learning buckets, where
 *                buckets[i] is the set of cards in the ith bucket,
 *                for all 0 <= i < buckets.length.
 * 
 * @returns a pair of integers [low, high], 0 <= low <= high, such that every
 *          card in buckets has an integer bucket number in the range [low...high]
 *          inclusive, and high - low is as small as possible
 */
export function getBucketRange(buckets: Array<Set<Flashcard>>): Array<number> {
    const numOfBuckets = buckets.length;
    let low = 0;
    let high = buckets.length - 1 < 0 ? 0 : buckets.length - 1 ;
    let lowFound = false;
    let highFound = false;

    // starting from both ends, stores the index of the first populated bucket
    for (let i=0; i<numOfBuckets; i++) {
        if (!lowFound && buckets[i].size !== 0) 
            { low = i; lowFound = true;}
        const backwardsIndex = numOfBuckets-i-1;
        if (!highFound && buckets[backwardsIndex].size!==0)
            { high = backwardsIndex; highFound = true; }
    }
    return [low, high];
}

/**
 * Generate a sequence of flashcards for practice on a particular day.
 *
 * @param day day of the learning process. Must be integer >= 1.
 * 
 * @param buckets a list of disjoint sets representing learning buckets,
 *                where buckets[i] is the set of cards in the ith bucket
 *                for all 0 <= i <= retiredBucket
 * 
 * @param retiredBucket number of retired bucket. Must be an integer >= 0.
 * 
 * @returns a sequence of flashcards such that a card appears in the sequence if
 *          and only if its bucket number is some i < retiredBucket such that
 *          `day` is divisible by 2^i
 */
export function practice(day: number, buckets: Array<Set<Flashcard>>, retiredBucket: number): Array<Flashcard> {
    const cardsToPractice = Array<Flashcard>();
    for (let i=0; i<retiredBucket; i++) {
        if (day % 2**i === 0) {
            for (const card of buckets[i]) {
                cardsToPractice.push(card);
            }
        }
    }
    return cardsToPractice;
}

/**
 * Update step for the Modified-Leitner algorithm.
 * 
 * @param card a flashcard the user just saw
 * 
 * @param answer the difficulty of the user's answer to the flashcard
 * 
 * @param bucketMap represents learning buckets before the flashcard was seen.
 *                  Maps each flashcard in the map to a nonnegative integer 
 *                  bucket number in the range [0...retiredBucket] inclusive.
 *                  Mutated by this method to put `card` in the appropriate bucket,
 *                  as determined by the Modified-Leitner algorithm.
 * 
 * @param retiredBucket number of retired bucket. Must be an integer >= 0.
 */
export function update(card: Flashcard, answer: AnswerDifficulty, bucketMap: Map<Flashcard, number>, retiredBucket: number): void {
    const bucketZero = 0;
    const deltaBucketAdvance = 1;
    const deltaBucketRegress = -1;
    // puts new cards in bucket 0
    if (!bucketMap.has(card)) {
        bucketMap.set(card, bucketZero);
    }

    const currentBucket:number = bucketMap.get(card) ?? bucketZero;
    let newBucket:number;

    if (answer === AnswerDifficulty.WRONG) {
        newBucket = bucketZero;
    } else if (answer === AnswerDifficulty.EASY) {
        bucketMap.get(card) !== retiredBucket ? newBucket = currentBucket + deltaBucketAdvance : newBucket = currentBucket;
    } else {
        newBucket = Math.max(currentBucket + deltaBucketRegress, bucketZero);
    }
    bucketMap.set(card, newBucket);
    return;
}

/**
 * Generate a hint about the back of a flashcard, to display if the user asks for it.
 * 
 * For a flashcard with a word, phrase, or sentence on front and a word, phrase, or sentence on back, both in languages 
 * that use the latin alphabet. The hint is the back with some letters hidden by underscores.
 * If the back has 3 or less words (if back is a word or phrase), the first letter of every multi-letter word is revealed.
 * If the the back contains more than 3 words, the first occurrence of the second longest word is revealed
 * 
 * @param card a flashcard.  Both sides must be in languages read from left to right, each word separated by a space
 * @returns a hint providing some (but not all) of the information from the back of the card, as described above,
 *          or undefined if no hint can be generated for this card.
 */
export function getHint(card: Flashcard): string|undefined {
    const answer = card.back.trim();
    // checks if hint can be generated
    if (answer.length === 0) { return undefined; }
    const words = answer.split(' ');
    const numOfWords = words.length;
    const maxWordsInPhrase = 3;
    let hint = "";


    // reveal first letters if there are 3 or less words on the back of the card
    if (numOfWords <= maxWordsInPhrase && numOfWords > 0) {
        for (let i=0; i<numOfWords; i++) {
            const word = words[i];
            if (word.length === 1) {
                hint += "_";
            } else {
                const firstLetter = word[0];
                const remainingLetters = word.slice(1);
                hint += firstLetter + "_".repeat(remainingLetters.length);
            }

            if (i !== numOfWords-1) {
                hint += " ";
            }
        }
    } else {
        // reveal second longest word if there are more than 3 words on the back of the card 

        // adapted from https://stackoverflow.com/questions/10630766/how-to-sort-an-array-based-on-the-length-of-each-element, retrieved 2/27/2023
        const sortedWordsDesc = words.slice(0).sort(function(a, b){
            return b.length - a.length;
          });

        const secondLongestWord = sortedWordsDesc[1];
        let secondLongestWordRevealed = false;
        for (let i=0; i<numOfWords; i++) {
            const word = words[i];
            if (word === secondLongestWord && !secondLongestWordRevealed) {
                hint += word;
                secondLongestWordRevealed = true;
            } else {
                hint += "_".repeat(word.length);
            }

            if (i !== numOfWords-1) {
                hint += " ";
            }
        }
    } 
    return hint;
}

/**
 * Computes statistics about the user's learning progress so far:
 *      (1) Number of times the user got each card right or wrong
 *      (2) The most recent date each card was practiced
 *      (3) Average number of attempts it takes for a card to reach retiredBucket
 * This is returned as a two element tuple, where the first element is a mapping from a flashcard to a three 
 * element tuple containing (1) and (2). If a card has never been practiced yet then it will instead map to 
 * an undefined value. The second element of the tuple contains (3). If no cards have been retired yet then 
 * this is equal to -1.
 * 
 * @param buckets a list of disjoint sets representing learning buckets, where
 *                buckets[i] is the set of cards in the ith bucket, for all 
 *                0 <= i < buckets.length where retiredBucket is the last bucket. 
 *                Must contain the correct flashcards after practicing and updating
 * @param history maps each flashcard to an array representing the history of the 
 *                user's answers to the flashcards. Each attempt at a flashcard is 
 *                represented as a 2 element tuple containing the AnswerDifficulty and 
 *                date of attempt in the form [AnswerDifficulty, Date]. Flashcards in history
 *                must be a subset of the set of flashcards in buckets
 * @returns a two element tuple. First element is a map from all flashcards in `buckets` to a tuple of two 
 *          numbers and a Date [right, wrong, mostRecent], secone element is a number avgAttempts. 
 *          [right, wrong, mostRecent] represents the total number of correct attempts, total number of 
 *          incorrect attempts, and most recent attempt at a flashcard respectively according to `history`. 
 *          avgAttempts is the average number of attempts per card until it's placed in the retiredBucket. 
 *          If no cards are currently in retiredBucket, avgAttemps = -1.
 *          If a flashcard was never practiced, it is mapped to undefined instead.
 * 
 */
export function computeProgress(buckets: Array<Set<Flashcard>>, history: Map<Flashcard, [AnswerDifficulty, Date][]>): [Map<Flashcard, [number, number, Date]|undefined>, number] {
    history.forEach((attempts, card) => {
        for (const attempt of attempts) {
            assert(attempt.length === 2, "each history entry can only have two inputs");
            // adapted from https://stackoverflow.com/questions/43804805/check-if-value-exists-in-enum-in-typescript, retrieved 3/20/2023
            assert(Object.values(AnswerDifficulty).includes(attempt[0]), "first input of each attempt must be an AnswerDifficulty");
            assert(attempt[1] instanceof Date, "second input of each attempt must be a Date");
        }
    });

    const progressMap = computeRightWrongDate(buckets, history);
    const avgAttemps = computeAverageNumAttempts(buckets, history);
    
    const stats:[Map<Flashcard, [number, number, Date]|undefined>, number] = [progressMap, avgAttemps];
    return stats;
}

/**
 * For each flashcard computes the total number of right and wrong attempts, as well as the
 * most recent attempted date
 * 
 * @param buckets a list of disjoint sets representing learning buckets, where
 *                buckets[i] is the set of cards in the ith bucket, for all 
 *                0 <= i < buckets.length where retiredBucket is the last bucket. 
 *                Must contain the correct flashcards after practicing and updating
 * @param history maps each flashcard to an array representing the history of the 
 *                user's answers to the flashcards. Each attempt at a flashcard is 
 *                represented as a 2 element tuple containing the AnswerDifficulty and 
 *                date of attempt in the form [AnswerDifficulty, Date]. Flashcards in history
 *                must be a subset of the set of flashcards in buckets
 * @returns a map from all flashcards in `buckets` to a tuple of two numbers and a
 *          Date [right, wrong, mostRecent]. [right, wrong, mostRecent] represents the 
 *          total number of correct attempts, total number of incorrect attempts, and most 
 *          recent attempt at a flashcard respectively according to `history`. 
 *          If a flashcard was never practiced, it is mapped to undefined instead.
 */
function computeRightWrongDate(buckets: Array<Set<Flashcard>>, history: Map<Flashcard, [AnswerDifficulty, Date][]>):Map<Flashcard, [number, number, Date]|undefined> {
    const progressMap = new Map<Flashcard, [number, number, Date]|undefined>();
    for (const bucket of buckets) {
        for (const card of bucket) {
            progressMap.set(card, undefined);
        }
    }

    // if a card has been practiced on, update progressMap with its progress
    history.forEach((attempts:Array<[AnswerDifficulty, Date]>, card:Flashcard) => {
        if (attempts.length !== 0) {
            let rightCount = 0;
            let wrongCount = 0;
            const earliestDate = -8640000000000000; // the smallest number Date() can compute
            let mostRecentDate = new Date(earliestDate);

            for (const attempt of attempts) {
                const response = attempt[0];
                const date = attempt[1];

                if (response === AnswerDifficulty.WRONG) {
                    wrongCount++;
                } else {
                    rightCount++;
                }
                if (date > mostRecentDate) {
                    mostRecentDate = date;
                }
            }

            const cardStat:[number, number, Date] = [rightCount, wrongCount, mostRecentDate];
            progressMap.set(card, cardStat);
        }
    });
    return progressMap;
}

/**
 * Compute the average number of attempts it takes for a card to reach retiredBuckets
 * 
 * @param buckets a list of disjoint sets representing learning buckets, where
 *                buckets[i] is the set of cards in the ith bucket, for all 
 *                0 <= i < buckets.length where retiredBucket is the last bucket. 
 *                Must contain the correct flashcards after practicing and updating
 * @param history maps each flashcard to an array representing the history of the 
 *                user's answers to the flashcards. Each attempt at a flashcard is 
 *                represented as a 2 element tuple containing the AnswerDifficulty and 
 *                date of attempt in the form [AnswerDifficulty, Date]. Flashcards in history
 *                must be a subset of the set of flashcards in buckets
 * @returns the average number of attempts to retiredBuckets
 */
function computeAverageNumAttempts(buckets: Array<Set<Flashcard>>, history: Map<Flashcard, [AnswerDifficulty, Date][]>): number {
    let avgAttemps = -1;
    const retiredCards = buckets[buckets.length - 1];
    if (retiredCards !== undefined && retiredCards.size > 0){
        let totalAttempts = 0;
        for (const card of retiredCards) {
            totalAttempts += history.get(card)?.length ?? 0;
        }
        avgAttemps = totalAttempts / retiredCards.size;
    }
    return avgAttemps;
}