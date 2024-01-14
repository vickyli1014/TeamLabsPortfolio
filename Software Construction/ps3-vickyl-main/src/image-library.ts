/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/**
 * Interface for accessing Images and Canvases.
 * 
 * PS3 instructions: do NOT change this file.
 */

import fs from 'fs';
import { Image, createCanvas, loadImage } from 'canvas';

export type { Canvas, Image } from 'canvas';
export { createCanvas } from 'canvas';

const library: Map<string, Image> = new Map();

/**
 * Get an image from the library by name.
 * 
 * @param name image base filename, e.g. "boromir.jpg"
 * @returns fully-loaded Image (so its dimensions and pixels are immediately available for use)
 * @throws Error if no image by that name exists in the library
 */
export function getImage(name: string): Image {
    const image = library.get(name);
    if (image === undefined) {
        throw new Error('no image named ' + name + ' found in library');
    }
    return image;
}

/**
 * @param name image base filename, e.g. "boromir.jpg"
 * @param image fully-loaded Image (so its dimensions and pixels are immediately available for use)
 */
function addLoadedImage(name: string, image: Image): void {
    library.set(name, image);
}

/**
 * Add a new image to the library, running in Node.js.
 * 
 * @param pathname pathname of image to load, relative to caller's current folder (e.g. "img/boromir.jpg")
 */
export function addImageFromFile(pathname: string): void {
    const name = basename(pathname);
    if (library.has(name)) {
        throw new Error('cannot add duplicate image "' + name + '" from ' + pathname);
    }
    const image = new Image();
    image.onload = function() {
        addLoadedImage(name, image);
    };
    image.onerror = function() {
        console.error('unable to load file image from ' + pathname);
    };
    image.src = pathname;
}

/**
 * Add a new image to the library, running in the Web browser.
 * 
 * @param pathname pathname of image to load, relative to caller's current URL (e.g. "img/boromir.jpg")
 */
export function addImageFromWeb(pathname: string): void {
    const name = basename(pathname);
    if (library.has(name)) {
        throw new Error('cannot add duplicate image "' + name + '" from ' + pathname);
    }
    loadImage(pathname).then(function (image) {
        addLoadedImage(name, image);
    }).catch(function (err) {
        console.error('unable to load web image from ' + pathname, err);
    });
}

/**
 * @param pathname pathname of a file
 * @returns final path component of pathname, must not end in '/'.
 *          For example, the basename of 'foo/bar/baz.txt' is 'baz.txt'.
 */
function basename(pathname: string): string {
    const match = pathname.match(/[^/]*$/);
    if ( ! match) { throw new Error('no basename for ' + pathname); }
    const [ basename ] = match;
    if ( ! basename) { throw new Error('emtpy basename for ' + pathname); }
    return basename;
}

/**
 * Writes an image in PNG format to a file, running in Node.js.
 * 
 * @param dataUrl data: URL containing image data
 * @param filename filename to write image to
 */
export function saveImageToFile(dataUrl: string, filename: string): void {
    const image = new Image();
    image.src = dataUrl;
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const pngData = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, pngData);
}
