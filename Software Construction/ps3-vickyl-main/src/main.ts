/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/**
 * Console interface to the expression system.
 * 
 * PS3 instructions: you are free to change this file.
 */

import readline from 'readline';
import open from 'open';
import * as commands from './commands';
import { Expression, parse } from './Expression';
import { addImageFromFile, saveImageToFile } from './image-library';

console.log('Memely console');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const SIZE_COMMAND = "!size";
const IMAGE_COMMAND = "!image";
const EXIT_COMMAND = "!quit";

const OUTPUT_FILENAME = 'main-output.png';

for (const imagename of [
    'boromir.jpg',
    'tech1.png', 'tech2.png', 'tech3.png', 'tech4.png', 'tech5.png', 'tech6.png',
    'blue.png', 'red.png', 'black.png', 'white.png',
    // to work with additional images, add them here
    // keep image files small to ensure Didit can build your repo
]) {
    addImageFromFile(`img/${imagename}`);
}

let currentExpression: Expression|undefined;

/**
 * Receive and handle user inputs.
 */
function promptForCommands(): void {
    rl.question('> ', function(command) {
        try {
            switch (command) {
                case '':
                    // ignore blank lines
                    break;

                case SIZE_COMMAND:
                    if (currentExpression === undefined) {
                        console.error('must enter an expression before using this command');
                        break;
                    }
                    console.log(commands.size(currentExpression));
                    break;

                case IMAGE_COMMAND:
                    if (currentExpression === undefined) {
                        console.error('must enter an expression before using this command');
                        break;
                    }
                    saveImageToFile(commands.image(currentExpression), OUTPUT_FILENAME);
                    void open(OUTPUT_FILENAME);
                    break;

                case EXIT_COMMAND:
                    process.exit(0);
                    break;

                default:
                    currentExpression = parse(command);
                    console.log(currentExpression.toString());
                    break;
            }
        } catch(e) {
            console.error(e);
        }
        promptForCommands();
    });
}

promptForCommands();
