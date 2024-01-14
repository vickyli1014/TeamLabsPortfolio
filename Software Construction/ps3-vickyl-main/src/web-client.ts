/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/**
 * Web interface to the expression system, client side.
 * 
 * PS3 instructions: you are free to change this file.
 */

import * as commands from './commands';
import * as Expression from './Expression';
import { addImageFromWeb } from './image-library';

for (const imagename of [
  'boromir.jpg',
  'tech1.png', 'tech2.png', 'tech3.png', 'tech4.png', 'tech5.png', 'tech6.png',
  'blue.png', 'red.png', 'black.png', 'white.png',
  // to work with additional images, add them here
  // keep image files small to ensure Didit can build your repo
]) {
  addImageFromWeb(`img/${imagename}`);
}

const input = {
  expression: document.getElementById('expression') as HTMLTextAreaElement,
  generate: document.getElementById('generate') as HTMLButtonElement,
};
const output = document.getElementById('output') as HTMLTableSectionElement;

/**
 * @returns DOM elements for showing a new row of output
 */
function makeOutputRow(): 
        { input: HTMLTableCellElement, tostring: HTMLTableCellElement, size: HTMLTableCellElement, image: HTMLImageElement } {
  const template = document.getElementById('row-template') as HTMLTemplateElement;
  const row = document.importNode(template.content, true).firstElementChild as HTMLTableRowElement;
  output.prepend(row);
  return {
    input: row.querySelector('.row-input') as HTMLTableCellElement,
    tostring: row.querySelector('.row-tostring') as HTMLTableCellElement,
    size: row.querySelector('.row-size') as HTMLTableCellElement,
    image: row.querySelector('.row-image') as HTMLImageElement,
  };
}

input.generate.addEventListener('click', function() {
  const output = makeOutputRow();
  output.input.textContent = input.expression.value;
  let expression;
  try {
    expression = Expression.parse(input.expression.value);
  } catch (e) {
    output.tostring.setAttribute('colspan', '3');
    output.tostring.classList.add('table-warning');
    output.tostring.textContent = 'Error calling parse(..): ' + e;
    return;
  }
  try {
    output.tostring.textContent = expression.toString();
  } catch (e) {
    output.tostring.classList.add('table-danger');
    output.tostring.textContent = 'Error calling toString(): ' + e;
  }
  try {
    output.size.textContent = commands.size(expression);
  } catch (e) {
    output.size.classList.add('table-danger');
    output.size.textContent = 'Error calling commands.size(..): ' + e;
  }
  try {
    output.image.src = commands.image(expression);
  } catch (e) {
    const parent = output.image.parentElement as HTMLTableCellElement;
    parent.classList.add('table-danger');
    parent.textContent = 'Error calling commands.image(..): ' + e;
  }
});

window.addEventListener('unload', function() {
  document.cookie = `expr=${JSON.stringify(input.expression.value)};max-age=5`;
});
const saved = new RegExp('expr=(.*)').exec(document.cookie);
if (saved !== null && saved[1] !== undefined) {
  try {
    const expression: string = JSON.parse(saved[1]) as string;
    if (expression) {
      input.expression.value = expression;
      const delayInMilliseconds = 250;
      setTimeout(function() { input.generate.click(); }, delayInMilliseconds);
    }
  } catch (e) {
    console.log('Could not restore previous expression');
  }
}
