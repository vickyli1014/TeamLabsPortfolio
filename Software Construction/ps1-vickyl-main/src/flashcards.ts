/* Copyright (c) 2021-2022 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/*
 * PS1 instructions: do NOT change this file.
 */

/**
 * Immutable type representing a flashcard, e.g., for learning vocabulary words in a
 * native language or foreign language.
 * 
 * PS1 instructions: do NOT change this class.
 */
export class Flashcard {

    /**
     * Make a flashcard.
     * 
     * @param front the card's front side, e.g. a vocabulary word
     * @param back the card's back side, e.g. its definition
     * @returns flashcard with `front` and `back`
     */
    public static make(front: string, back: string): Flashcard {
        const cardId = Flashcard.getKey(front, back);
        const existingCard = Flashcard.existingCards.get(cardId);
        if (existingCard) {
            return existingCard;
        } else {
            const newCard = new Flashcard(front, back);
            Flashcard.existingCards.set(cardId, newCard);
            return newCard;
        }
    }

    // stores Flashcards that have been created by make(), indexed by getKey(front, back)
    private static readonly existingCards: Map<string, Flashcard> = new Map();

    // returns a unique key for each possible (front, back) pair
    private static getKey(front: string, back: string): string {
        return JSON.stringify([front, back]);
    }

    /**
     * Private constructor, called only if flashcard doesn't already exist.
     * 
     * @param front this card's front side, e.g. a vocabulary word
     * @param back this card's back side, e.g. its definition
     */
    private constructor(public readonly front: string, public readonly back: string) {
        this.front = front;
        this.back = back;
    }

    public toString(): string {
        return this.front + "/" + this.back;
    }

}

/**
 * Immutable type representing how the user answered some particular trial of a
 * flashcard.
 * 
 * PS1 instructions: do NOT change this class.
 */
export enum AnswerDifficulty {
    /** user got the flashcard wrong */
    WRONG,

    /** user got it right but only with difficulty */
    HARD,

    /** user got it right easily */
    EASY,
}
