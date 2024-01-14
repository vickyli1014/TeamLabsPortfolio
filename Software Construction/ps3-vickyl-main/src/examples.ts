/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import fs from 'fs';
import open from 'open';
import { Canvas, createCanvas, addImageFromFile, getImage } from './image-library';

/**
 * Examples.
 * 
 * PS3 instructions: you are free to copy and adapt code from these examples.
 * But none of this code is designed to be imported into your code unchanged.
 */

console.log('Memely examples...');

for (const imagename of [
    'boromir.jpg',
    'blue.png', 'red.png', 'black.png', 'white.png',
]) {
    addImageFromFile(`img/${imagename}`);
}

const EXAMPLE_FILENAME = 'example-output.png';

/**
 * Generate, save, and open an example image.
 */
function oneDoesNotSimply(): void {
    /**
     * @param str a string representing a single line of text (newlines in the string are ignored)
     * @returns a canvas that renders the string as text using the default system font,
     *          cropped as tightly around the text as possible
     */
    function convertStringToImage(str: string): Canvas {
        const font = '96pt bold';

        // make a tiny 1x1 image at first so that we can get a Graphics object, 
        // which we need to compute the width and height of the text
        const measuringContext = createCanvas(1, 1).getContext('2d');
        measuringContext.font = font;
        const fontMetrics = measuringContext.measureText(str);
        // console.log('metrics', fontMetrics);

        // now make a canvas sized to fit the text
        const canvas = createCanvas(fontMetrics.width, fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent);
        const context = canvas.getContext('2d');

        context.font = font;
        context.fillStyle = 'white';
        context.fillText(str, 0, fontMetrics.actualBoundingBoxAscent);

        context.strokeStyle = 'black';
        context.strokeText(str, 0, fontMetrics.actualBoundingBoxAscent);

        return canvas;
    }

    const boromir = getImage('boromir.jpg');
    console.log('boromir', boromir.width, 'x', boromir.height);

    const topCaption = convertStringToImage("ONE DOES NOT SIMPLY");
    console.log('top caption', topCaption.width, 'x', topCaption.height);

    const bottomCaption = convertStringToImage("WALK INTO MORDOR");
    console.log('bottom caption', bottomCaption.width, 'x', bottomCaption.height);

    const upperLeftX = 0;
    const upperLeftY = 0;
    const outputImageWidth = 300;
    const outputImageHeight = 200;

    const captionFractionOfImage = 0.25;
    const outputCaptionHeight = outputImageHeight * captionFractionOfImage;

    const canvas = createCanvas(outputImageWidth, outputImageHeight);
    const context = canvas.getContext('2d');
    context.drawImage(boromir, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);
    context.drawImage(topCaption, upperLeftX, upperLeftY, outputImageWidth, outputCaptionHeight);
    context.drawImage(bottomCaption, upperLeftX, outputImageHeight - outputCaptionHeight, outputImageWidth, outputCaptionHeight);

    const pngData = canvas.toBuffer('image/png');
    fs.writeFileSync(EXAMPLE_FILENAME, pngData);
    void open(EXAMPLE_FILENAME);
}


/**
 * Assert the color of selected pixels in an example image.
 */
function examinePixelsOfSimpleImage(): void {
    const blackImage = getImage("black.png");
    const whiteImage = getImage("white.png");

    const outputImageWidth = 10;
    const outputImageHeight = 10;
    const upperLeftX = 0;
    const upperLeftY = 0;
    const halfWidth = outputImageWidth/2;

    const canvas = createCanvas(outputImageWidth, outputImageHeight);
    const context = canvas.getContext('2d');
    
    context.drawImage(blackImage, upperLeftX, upperLeftY, halfWidth, outputImageHeight);
    context.drawImage(whiteImage, halfWidth, upperLeftY, outputImageWidth, outputImageHeight);
    
    const pixelFromLeftHalf: Uint8ClampedArray  = context.getImageData(halfWidth/2, outputImageHeight/2, 1, 1).data;
    const pixelFromRightHalf: Uint8ClampedArray = context.getImageData(halfWidth + halfWidth/2, outputImageHeight/2, 1, 1).data;
    
    const maxPixelValue = 255;

    console.log("pixel from left (black) half:", pixelFromLeftHalf);
    assert.deepStrictEqual(
        [...pixelFromLeftHalf], 
        [0, 0, 0, maxPixelValue] // red=0%, green=0%, blue=0%, alpha=100%
    );

    console.log("pixel from right (white) half:", pixelFromRightHalf);
    assert.deepStrictEqual(
        [...pixelFromRightHalf],
        [maxPixelValue, maxPixelValue, maxPixelValue, maxPixelValue] // red=100%, green=100%, blue=100%, alpha=100%
    );
}

oneDoesNotSimply();
examinePixelsOfSimpleImage();
