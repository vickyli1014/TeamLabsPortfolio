/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import * as parserlib from 'parserlib';
import { Canvas, Image, createCanvas, addImageFromFile, getImage } from '../src/image-library';
import { Expression, parse, newExpression, SideBySide, Resize, Caption, newCaption, Caret, Underscore, TopToBottom } from '../src/Expression';

for (const imagename of [
    'boromir.jpg',
    'tech1.png', 'tech2.png', 'tech3.png', 'tech4.png', 'tech5.png', 'tech6.png',
    'blue.png', 'red.png', 'black.png', 'white.png',
    // if you depend on additional images in your tests, add them here
    // keep image files small to ensure Didit can build your repo
]) {
    addImageFromFile(`img/${imagename}`);
}

/**
 * Tests for the Expression abstract data type.
 */
 describe('Expression', function () {
    /*
    * Testing strategy for Expression:
    *  
    * toString, equalValue, parse, size:
    *      partition on this: 
    *           Contains only one Filename, contains multiple Filenames
    *           Contains SideBySideGlue operator:            yes, no
    *           Contains TopToBottom operator:               yes, no
    *           Contains Resize operator:                    yes, no
    *           Contains a Caption:                          yes, no
    *           Contains Caret operator:                     yes, no
    *           Contains Underscore operator:                yes, no
    *           Overrules order of operations:               yes, no
    * equalValue():
    *      partition on output: true, false
    *      partition on type: same, different
    * parse():
    *      Contains nonexisting filenames: yes, no  
    *      partition on output: error, no error   
    * size():
    *      partition on output vs input: same dimensions, different dimensions (resized)
    *      partition on number of '?' in Resize: 0, 1, 2
    * image():
    *      partition on size: changes, is the same as original inputted image
    */

    it('parserlib needs to be version 3.2.x', function() {
        assert(parserlib.VERSION.startsWith("3.2"));
    });

    it('this contains one Filename, contains filename that does not exist', function() {
        const fileName = 'doesNot_Exist123.jpg';
        const expr = newExpression(fileName);
        // testing equalValue
        assert(expr.equalValue(expr), "expected reflexive equality");
        assert(expr.equalValue(newExpression(fileName)), "expected equality");
        // testing parse
        assert(expr.equalValue(parse(fileName)), "expected correct expression from string");
        // testing toString
        assert(expr.equalValue(parse(expr.toString())), "expected correct toString() output");
        // testing size and image
        assert.throws(
            () => { expr.size(); }
        );
        assert.throws(
            () => { expr.image(); }
        );


    });

    it("contains >1 Filename, SideBySide, Resize, contains only existing filenames, overrules OOP, 0 '?'"
                + "in Resize, image size changes, size() output different from original images", function() {
        // expression = (expr1 | expr2) @ 20x20
        const expr1 = newExpression('black.png');
        const expr2 = newExpression('white.png');

        const sbs = new SideBySide(expr1, expr2);
        const resize = new Resize(sbs, 20, 20);
        const resizeStr = resize.toString();
        // equalValue
        assert(sbs.equalValue(new SideBySide(expr1, expr2)), "expected SideBySide equality");
        assert(resize.equalValue(new Resize(sbs, 20, 20)), "expected resize equality");
        // parse
        assert(sbs.equalValue(parse('black.png | white.png')), "expected correct sbs expression from string");
        assert(resize.equalValue(parse('(black.png | white.png) @ 20x20')), "expected correct resize expression from string");
        // toString
        assert(sbs.equalValue(parse(sbs.toString())), "expected correct sbs conversion to string to expression");
        assert(resize.equalValue(parse(resizeStr)), "expected correct resize conversion to string to expression");
        // size
        const resizeSize = resize.size();
        assert.deepStrictEqual(sbs.size(), {width: 60, height:30}, "expected correct sideBySide size");
        assert.deepStrictEqual(resizeSize, {width: 20, height:20}, "expected correct resize size");
        // image
        const canvas = resize.image();
        const context = canvas.getContext('2d');
        const pixelFromLeftHalf: Uint8ClampedArray  = context.getImageData(resizeSize.width/4, resizeSize.height/2, 1, 1).data;
        const pixelFromRightHalf: Uint8ClampedArray = context.getImageData(resizeSize.width*3/4, resizeSize.height/2, 1, 1).data;
        const maxPixelValue = 255;
        // console.log("pixel from left (black) half:", pixelFromLeftHalf);
        assert.deepStrictEqual(
            [...pixelFromLeftHalf], 
            [0, 0, 0, maxPixelValue], // red=0%, green=0%, blue=0%, alpha=100%
        "expected left image to be all black");
        assert.deepStrictEqual(
            [...pixelFromRightHalf],
            [maxPixelValue, maxPixelValue, maxPixelValue, maxPixelValue], // red=100%, green=100%, blue=100%, alpha=100%
        "expected right image to be all white");
        assert.strictEqual(canvas.width, 20, "expected correct image width");
        assert.strictEqual(canvas.height, 20, "expected correct image height");
    });

    it('contains nonexisting filenames', function() {
        const noExist = newExpression('doesnt_Exist.jpg');
        // equalValue
        assert(noExist.equalValue(noExist), "expected reflexive equality");
        assert(noExist.equalValue(newExpression('doesnt_Exist.jpg')), "expected equality");
        // parse
        assert(noExist.equalValue(parse('doesnt_Exist.jpg')), "expected correct expression from string");
        // toString
        assert(noExist.equalValue(parse(noExist.toString())), "expected correct toString");
        // testing resize interaction with non-existing filename
        const resizeNoExpr = new Resize(noExist, 1, 2);
        assert.deepStrictEqual(resizeNoExpr.size(), {width: 1, height:2}, "expected to resize even if image does not exist");
    });

    it('true equalValue output, does not overrule OOP, size does not return mutated dimensions', function() {
        const black = newExpression('black.png');
        const white = newExpression('white.png');

        const resize1 = new Resize(black, 20, 20);
        const resize2 = new Resize(black, 20, 20);
        assert(resize1.equalValue(resize2), "expected equality after same resizing");

        // testing image
        const canvas = black.image();
        assert.strictEqual(canvas.width, 30, "expected correct image width");
        assert.strictEqual(canvas.height, 30, "expected correct image height");
        
        // testing equality
        const sbs1 = new SideBySide(black, white);
        const sbs2 = new SideBySide(black, white);
        assert(sbs1.equalValue(sbs2), "expected equality after same sbs");
        const sbs3 = new SideBySide(white, black);
        assert(!sbs1.equalValue(sbs3), "reflected images should not be equal");
    });

    it('contains Caption, Caret, Underscore', function() {
        const boromir = newExpression('boromir.jpg');
        const topCaption = newCaption("ONE DOES NOT SIMPLY");
        const bottomCaption = newCaption("WALK INTO MORDOR");
        const expression = 'boromir.jpg ^ "ONE DOES NOT SIMPLY" _ "WALK INTO MORDOR"';
        const caretted = new Caret(boromir, topCaption);
        const underscored = new Underscore(caretted, bottomCaption);

        // testing equalValue
        assert(topCaption.equalValue(newCaption("ONE DOES NOT SIMPLY")));
        assert(topCaption.equalValue(topCaption), "expected caption reflexive equality");
        assert(caretted.equalValue(caretted), "expected caret reflexive equality");
        assert(caretted.equalValue(new Caret(newExpression('boromir.jpg'), newCaption("ONE DOES NOT SIMPLY"))));
        assert(underscored.equalValue(new Underscore(new Caret(boromir, topCaption), bottomCaption)), "expected equality");
        assert(underscored.equalValue(underscored), "expected underscore reflexive equality");
        // testing parse
        assert(topCaption.equalValue(parse('"ONE DOES NOT SIMPLY"')), "expected correct caption expression from string");
        assert(caretted.equalValue(parse('boromir.jpg ^ "ONE DOES NOT SIMPLY"')), "expected correct caret expression from string");
        assert(underscored.equalValue(parse(expression)), "expected correct expression from string");
        // toString
        assert(topCaption.equalValue(parse(topCaption.toString())), "expected correct caption toString output");
        assert(caretted.equalValue(parse(caretted.toString())), "expected correct caret toString output");
        assert(underscored.equalValue(parse(underscored.toString())), "expected correct underscored toString output");
        // size, image
        const expectedCaretWidth = Math.max(550, Math.max(topCaption.size().width, bottomCaption.size().width));
        const expectedCaretHeight = Math.max(325, Math.max(topCaption.size().height, bottomCaption.size().height));
        assert.deepStrictEqual(caretted.size(), {width: expectedCaretWidth, height: expectedCaretHeight}, "expected correct Caret size");
        const expectedUnderscoreWidth = Math.max(expectedCaretWidth, bottomCaption.size().width);
        const expectedUnderscoreHeight = Math.max(expectedCaretHeight, bottomCaption.size().height);
        assert.deepStrictEqual(underscored.size(), {width: expectedUnderscoreWidth, height: expectedUnderscoreHeight}, "expected correct underscore height");
    });

    it('testing Caret image method, image size is the same as original inputted image', function() {
        const expr = parse('white.png ^ black.png');
        const size = expr.size();

        const canvas = expr.image();
        const context = canvas.getContext('2d');
        const pixelFromTopHalf: Uint8ClampedArray  = context.getImageData(size.width/2, 0, 1, 1).data;
        const pixelFromBottomHalf: Uint8ClampedArray = context.getImageData(size.width/2, size.height-1, 1, 1).data;
        const maxPixelValue = 255;
        assert.deepStrictEqual(
            [...pixelFromTopHalf], 
            [0, 0, 0, maxPixelValue], // red=0%, green=0%, blue=0%, alpha=100%
        "expected left image to be all black");
        assert.deepStrictEqual(
            [...pixelFromBottomHalf],
            [maxPixelValue, maxPixelValue, maxPixelValue, maxPixelValue], // red=100%, green=100%, blue=100%, alpha=100%
        "expected right image to be all white");
        assert.strictEqual(canvas.width, 30, "expected correct image width");
        assert.strictEqual(canvas.height, 30, "expected correct image height");
    });

    it('testing Underscore image method', function() {
        const expr = parse('white.png _ black.png');
        const size = expr.size();

        const canvas = expr.image();
        const context = canvas.getContext('2d');
        const pixelFromTopHalf: Uint8ClampedArray  = context.getImageData(size.width/2, 0, 1, 1).data;
        const pixelFromBottomHalf: Uint8ClampedArray = context.getImageData(size.width/2, size.height-1, 1, 1).data;
        const maxPixelValue = 255;
        assert.deepStrictEqual(
            [...pixelFromTopHalf], 
            [maxPixelValue, maxPixelValue, maxPixelValue, maxPixelValue], // red=100%, green=100%, blue=100%, alpha=100%
        "expected left image to be all black");
        assert.deepStrictEqual(
            [...pixelFromBottomHalf],
            [0, 0, 0, maxPixelValue], // red=0%, green=0%, blue=0%, alpha=100%
        "expected right image to be all white");
        assert.strictEqual(canvas.width, 30, "expected correct image width");
        assert.strictEqual(canvas.height, 30, "expected correct image height");
    });

    it('contains TopToBottom', function() {
        const black = newExpression('black.png');
        const white = newExpression('white.png');
        const ttb = new TopToBottom(black, white);
        // testing equalValue
        assert(ttb.equalValue(new TopToBottom(black, white)), "expected SideBySide equality");
        // testing parse
        assert(ttb.equalValue(parse('(black.png --- white.png)')), "expected correct expression from string");
        assert(ttb.equalValue(parse('(black.png ------ white.png)')), "expected correct expression from string with more than 3 dashes");
        assert.throws(
            () => { ttb.equalValue(parse('(black.png -- white.png)')); }
        );
        // testing toString
        assert(ttb.equalValue(parse(ttb.toString())), "expected correct ttb conversion to string to expression");
        // testing size
        const size = ttb.size();
        assert.deepStrictEqual(size, {width: 30, height:60}, "expected correct top to bottom size");
        // image
        const canvas = ttb.image();
        const context = canvas.getContext('2d');
        const pixelFromTopHalf: Uint8ClampedArray  = context.getImageData(size.width/2, size.height/4, 1, 1).data;
        const pixelFromBottomHalf: Uint8ClampedArray = context.getImageData(size.width/2, size.height*3/4, 1, 1).data;
        const maxPixelValue = 255;
        // console.log("pixel from left (black) half:", pixelFromLeftHalf);
        assert.deepStrictEqual(
            [...pixelFromTopHalf], 
            [0, 0, 0, maxPixelValue], // red=0%, green=0%, blue=0%, alpha=100%
        "expected left image to be all black");
        assert.deepStrictEqual(
            [...pixelFromBottomHalf],
            [maxPixelValue, maxPixelValue, maxPixelValue, maxPixelValue], // red=100%, green=100%, blue=100%, alpha=100%
        "expected right image to be all white");
        assert.strictEqual(canvas.width, 30, "expected correct image width");
        assert.strictEqual(canvas.height, 60, "expected correct image height");
    });

    it('testing inequality', function() {
        const black = newExpression('black.png');
        const white = newExpression('white.png');
        // testing filename
        assert(!black.equalValue(white));
        assert(!white.equalValue(black));
        //testing sidebyside and toptobottom
        const ssb = new SideBySide(black, white);
        const ttb = new TopToBottom(black, white);
        assert(!ssb.equalValue(ttb));
        assert(!ttb.equalValue(ssb));
        //testing caret and underscore
        const caret = new Caret(white, black);
        const underscore = new Underscore(white, black);
        assert(!caret.equalValue(underscore));
        assert(!underscore.equalValue(caret));
        //testing resize
        const resized = new Resize(black, 20, 20);
        assert(!resized.equalValue(black));
        assert(!ttb.equalValue(resized));
    });

    it('contains 1 "?" in Resize dimensions', function() {
        const adjustHeight = parse('black.png@10x?');
        const adjustWidth = parse('black.png@?x10');
        for (const resize of [adjustHeight, adjustWidth]) {
            // testing size
            assert.deepStrictEqual(resize.size(), {width:10, height:10}, "expected ratio preserving dimensions");
            // testing toString
            assert(resize.equalValue(parse(resize.toString())), "expected correct toString");
            // testing image
            const canvas = resize.image();
            assert.strictEqual(canvas.width, 10, "expected correct image width");
            assert.strictEqual(canvas.height, 10, "expected correct image height");
        }
    });

    it('contains 2 "?" in Resize dimensions', function() {
        assert.throws(
            () => { parse('black.png@?x?'); }
        );
    });

    it('contains syntatically incorrect expression', function() {
        const incorrectStrExpr = "a -- b";
        assert.throws(
            () => { parse(incorrectStrExpr); }
        );
    });    
});
