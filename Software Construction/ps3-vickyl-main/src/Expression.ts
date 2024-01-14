/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import assert from 'assert';
import { parseExpression } from './ExpressionParser';
import { Canvas, Image, createCanvas, getImage } from './image-library';

/**
 * An immutable data type representing an image expression, as defined
 * in the PS3 handout.
 * 
 * PS3 instructions: this is a required ADT interface.
 * You MUST NOT change its name or the names or type signatures of existing methods or functions.
 * You may, however, add additional methods or classes, or strengthen the specs of existing methods.
 */
export interface Expression {
    // Data type definition
    //   Expression = Filename(name: string) + 
    //                SideBySide(left: Expression, right: Expression) + 
    //                Resize(expression: Expression, dimension: string) +
    //                Caption(caption: string) + 
    //                Caret(base: Expression, top: Expression) +
    //                Underscore(base: Expression, bottom: Expression) + 
    //                TopToBottom(top: Expression, bottom: Expression)
    
    /**
     * @returns a parsable representation of this expression, such that
     *          for all e:Expression, e.equalValue(Expression.parse(e.toString()))
     */
    toString(): string;
    
    /**
     * @param that any Expression
     * @returns true if and only if this and that are structurally-equal
     *          Expressions, as defined in the PS3 handout
     */
    equalValue(that: Expression): boolean;
    
    /**
     * Calculate and returns the size of the generated image resulting from this expression
     * 
     * @returns a record type that stores the width and height of the two element array where the first 
     *          represents the width and the second represents the height of the image. 
     * @throws if the size can not be computed (i.e. if the expression contains a non-existing image file)
     */
    size(): { width:number, height:number };
    
    /**
     * Takes an expression and generates an image from it
     * 
     * @returns a Canvas object of the image generated from this expression. 
     * @throws an error if the expression contains filenames that do not currently exist or 
     *         have not been added to the iamge library
     */
    image(): Canvas;

}

/**
 * Parse an expression.
 * 
 * @param input expression to parse, as defined in the PS3 handout
 * @returns expression AST for the input
 * @throws Error if the expression is syntactically invalid
 */
export function parse(input: string): Expression {
        const parseTree = parseExpression(input);
        return parseTree;
}

// export class Empty implements Expression {

// }

export class Filename implements Expression {
    // Abstract Function
    //  AF(name) = an image whose filename is `name`
    // Rep Invariant
    //  Consists of letters, digits, or periods
    //  May contain hyphens and underscores as long as they are not the 
    //      first character in the filename
    //  Image file the name refers to must be in a format that web browsers
    //      widely support (`name` must end in a widely supported image format)
    // Safety from rep exposure
    //  all reps are immutable and unreassignable

    /**
     * Load an image with the specified filename
     * 
     * @param name name of the image file to be loaded. If the image exists it must 
     *              have positive dimensions
     */
    public constructor(public readonly name: string) {
        this.checkRep();
    }
    
    /**
     * @inheritdoc
     */
    public toString(): string {
        return this.name;
    }

    /**
     * @inheritdoc
     */
    public equalValue(that: Expression): boolean {
        if (!(that instanceof Filename)) { return false; }
        return this.name === that.name;
    }

    /**
     * @inheritdoc
     */
    public size(): {width:number, height:number} {
        const image = getImage(this.name);
        const width = image.width;
        const height = image.height;
        return { width, height };
    }

    /**
     * @inheritdoc
     */
    public image(): Canvas {
        const image = getImage(this.name);
        const imgSize = this.size();

        const upperLeftX = 0;
        const upperLeftY = 0;
        const outputImageWidth = imgSize.width;
        const outputImageHeight = imgSize.height;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');
        context.drawImage(image, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);

        return canvas;
    }

    // Check that the rep invariant is true
    private checkRep(): void {
        if (this.name[0] !== undefined)
            { assert(!this.name[0].match('_-'), "first character should not be a hyphen or underscore"); }
    }

}

export class SideBySide implements Expression {
    // Abstract Function  
    //     AF(left, right) = The expression left | right
    // Rep Invariant
    //     true
    // Safety from rep exposure
    //     all reps are immutable and unreassignable

    /**
     * Makes an expression such that two expressions are glued side-by-side
     * 
     * @param left an expression
     * @param right likewise
     */
    public constructor(public readonly left: Expression,
                       public readonly right: Expression) {
        this.checkRep();
    }
    
    /**
     * @inheritdoc
     */
    public toString(): string {
        return "(" + this.left + ") | (" + this.right + ")";
    }

    /**
     * @inheritdoc
     */
    public equalValue(that: Expression): boolean {
        if (!(that instanceof SideBySide)) { return false; }
        return this.left.equalValue(that.left) && this.right.equalValue(that.right);
    }

    /**
     * @inheritdoc
     */
    public size(): {width:number, height:number} {
        const leftSize = this.left.size();
        const rightSize = this.right.size();
        const width = leftSize.width + rightSize.width;
        const height = Math.max(leftSize.height, rightSize.height);
        return { width, height };
    }

    /**
     * @inheritdoc
     */
    public image(): Canvas {
        const leftImg = this.left.image();
        const rightImg = this.right.image();

        const size = this.size();
        const leftSize = this.left.size();
        const rightSize = this.right.size();

        const leftUpperLeftX = 0;
        const rightUpperLeftX = this.left.size().width;
        const leftUpperLeftY = Math.max(0, (size.height - leftSize.height)/2); 
        const rightUpperLeftY = Math.max(0, (size.height - rightSize.height)/2);

        const outputImageWidth = size.width;
        const outputImageHeight = size.height;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        context.drawImage(leftImg, leftUpperLeftX, leftUpperLeftY, leftSize.width, leftSize.height);
        context.drawImage(rightImg, rightUpperLeftX, rightUpperLeftY, rightSize.width, rightSize.height);

        return canvas;
    }

    // check the rep invariant is true
    private checkRep(): boolean {
        return true;
    }
}

export class Resize implements Expression {
    // Abstract Function
    //     AF(expression, width) = The expression `expression` @ `width` x `height` where if 
    //         either one of `width` or `height` is undefined, the corresponding dimension should 
    //         be a legal width or height that preserves the aspect ratio of the image as 
    //         closely as possible
    // Rep Invariant
    //     At least one of width and height of `dimension` must be positive integers
    //         the other can be a positive integer or undefined
    // Safety from rep exposure
    //     all reps are immutable and unreassignable

    /**
     * Makes an expression that resizes the passed in expression
     * 
     * @param expression An image to be resized
     * @param width new width to be resized to, if undefined, width is set to preserve original ratio of image
     * @param height similarly, new height to be resized to
     */
    public constructor(public readonly expression: Expression,
                       public readonly width: number|undefined,
                       public readonly height: number|undefined) {
        this.checkRep();
    }

    /**
     * @inheritdoc
     */
    public toString(): string {
        const width = this.width !== undefined ? this.width : "?";
        const height = this.height !== undefined ? this.height : "?";
        return "(" + this.expression + ") @ " + width + "x" + height;
    }

    /**
     * @inheritdoc
     */
    public equalValue(that: Expression): boolean {
        if (!(that instanceof Resize)) { return false; }
        return this.expression.equalValue(that.expression) && 
        this.width === that.width &&
        this.height === that.height;
    }

    /**
     * Calculate and returns the size of the generated image resulting from this expression
     * 
     * @returns a record type that stores the width and height of the two element array where the first 
     *          represents the width and the second represents the height of the image. If the image
     *          does not currently exist or has not yet been added to the library, the passed in dimensions
     *          are returned
     */
    public size(): {width:number, height:number} {
        let width = this.width;
        let height = this.height;
        if (width === undefined || height === undefined) {
            const originalSize = this.expression.size();
            const widthToHeightRatio = originalSize.width / originalSize.height;
            if (width === undefined) { width = Math.round(widthToHeightRatio * (this.height ?? 0)); } 
            if (height === undefined) { height = Math.round((this.width ?? 0) / widthToHeightRatio); }
        }
        return { width, height };
    }

    /**
     * @inheritdoc
     */
    public image(): Canvas {
        const image = this.expression.image();
        const size = this.size();
        const outputImageWidth = size.width;
        const outputImageHeight = size.height;
        const upperLeftX = 0;
        const upperLeftY = 0;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        context.drawImage(image, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);
        return canvas;
    }

    // check the rep invariant is true
    private checkRep():void {
        assert(!(this.width === undefined && this.height === undefined));
        if (this.width !== undefined)
            { assert(this.width > 0 && Math.floor(this.width) === this.width, "width must be a positive integer"); }
        if (this.height !== undefined)
            { assert(this.height > 0 && Math.floor(this.height) === this.height, "height must be a positive integer"); }
    }
}

export class Caption implements Expression {
    // Abstract Function
    //     AF(caption) = A caption to be added to an image, with default font to be 96pt bold
    // Rep Invariant  
    //     May contain any characters except newlines and double-quotes
    // Safety from rep exposure
    //     all reps are immutable and unreassinable

    /**
     * Creates an expression representing a caption
     * 
     * @param caption string to be the caption
     */
    public constructor(public readonly caption: string) {
        this.checkRep();
    }

    /**
     * @inheritdoc
     */
    public toString(): string {
        return '"' + this.caption + '"';
    }

    /**
     * @inheritdoc
     */
    public equalValue(that: Expression): boolean {
        if (!(that instanceof Caption)) { return false; }
        return this.caption === that.caption;
    }

    /**
     * @inheritdoc
     */
    public size(): {width:number, height:number} {
        const measuringContext = createCanvas(1, 1).getContext('2d');
        measuringContext.font = '96pt bold';
        const fontMetrics = measuringContext.measureText(this.caption);
        const width = Math.round(fontMetrics.width);
        const height = Math.round(fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent);
        return {width, height};
    }

    /**
     * @inheritdoc
     */
    public image(): Canvas {
        /** 
         * @param str a string representing a single line of text (newlines in the string are ignored)
         * @returns a canvas that renders the string as text using the default system font,
         *          cropped as tightly around the text as possible
         */
        function convertStringToImage(str: string): Canvas {
            const font = '96pt bold';
            const measuringContext = createCanvas(1, 1).getContext('2d');
            measuringContext.font = font;
            const fontMetrics = measuringContext.measureText(str);
            const canvas = createCanvas(fontMetrics.width, fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent);
            const context = canvas.getContext('2d');

            context.font = font;
            context.fillStyle = 'white';
            context.fillText(str, 0, fontMetrics.actualBoundingBoxAscent);

            context.strokeStyle = 'black';
            context.strokeText(str, 0, fontMetrics.actualBoundingBoxAscent);

            return canvas;
        }
        return convertStringToImage(this.caption);
    }
    
    // check the rep invariant is true
    private checkRep():void {
        assert(this.caption.indexOf('\n') === -1, "caption should not contain new lines");
        assert(this.caption.indexOf('"') === -1, "caption should not contain double quotes");
    }

}

export class Caret implements Expression {
    // Abstract Function
    //     AF(base, top) = The expression `base` ^ `top`
    // Rep Invariant
    //     true
    // Safety from Rep Exposure
    //     all reps are immutable and unreassignable

    /**
     * Makes an expression that overlays one image at the top of another image
     * 
     * @param base The base image to be placed on top of
     * @param top The image to be placed at the top of the `base` image
     */
    public constructor(public readonly base: Expression,
        public readonly top: Expression) {
            this.checkRep();
        }

    /**
     * @inheritdoc
     */
    public toString(): string {
        return "(" + this.base + ") ^ (" + this.top + ")";
    }

    /**
     * @inheritdoc
     */
    public equalValue(that: Expression): boolean {
        if (!(that instanceof Caret)) { return false; }
        return that.base.equalValue(this.base) && this.top.equalValue(that.top);
    }

    /**
     * @inheritdoc
     */
    public size(): {width:number, height:number} {
        const baseSize = this.base.size();
        const topSize = this.top.size();
        const width = Math.max(baseSize.width, topSize.width);
        const height = Math.max(baseSize.height, topSize.height);
        return {width, height};
    }

    /**
     * @inheritdoc
     */
    public image(): Canvas {
        const baseImg = this.base.image();
        const topImg = this.top.image();
        const upperLeftX = 0;
        const upperLeftY = 0;
        const outputImageWidth = this.size().width;
        const outputImageHeight = this.size().height;
        const captionFractionOfImage = 0.25;
        const outputCaptionHeight = outputImageHeight * captionFractionOfImage;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');
        context.drawImage(baseImg, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);
        context.drawImage(topImg, upperLeftX, upperLeftY, outputImageWidth, outputCaptionHeight);

        return canvas;
    }
    // check the rep invariant is true
    private checkRep():boolean {
        return true;
    }
}

export class Underscore implements Expression {
    // Abstract Function
    //     AF(base, bottom) = The expression `base` _ `bottom`
    // Rep Invariant
    //     true
    // Safety from Rep Exposure
    //     all reps are immutable and unreassignable

    /**
     * Makes an expression that overlays one image at the bottom of another image
     * 
     * @param base The image to be placed on top of
     * @param bottom The image to be placed on the bottom of the `base` image
     */
    public constructor(public readonly base: Expression,
        public readonly bottom: Expression) {
        this.checkRep();
    }
        
    /**
     * @inheritdoc
     */
    public toString(): string {
        return "(" + this.base + ") _ (" + this.bottom + ")";
    }

    /**
     * @inheritdoc
     */
    public equalValue(that: Expression): boolean {
        if (!(that instanceof Underscore)) { return false; }
        return that.base.equalValue(this.base) && this.bottom.equalValue(that.bottom);
    }

    /**
     * @inheritdoc
     */
    public size(): {width:number, height:number} {
        const baseSize = this.base.size();
        const bottomSize = this.bottom.size();
        const width = Math.max(baseSize.width, bottomSize.width);
        const height = Math.max(baseSize.height, bottomSize.height);
        return {width, height};
    }

    /**
     * @inheritdoc
     */
    public image(): Canvas {
        const baseImg = this.base.image();
        const bottomImg = this.bottom.image();
        const upperLeftX = 0;
        const upperLeftY = 0;
        const outputImageWidth = this.size().width;
        const outputImageHeight = this.size().height;
        const captionFractionOfImage = 0.25;
        const outputCaptionHeight = outputImageHeight * captionFractionOfImage;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');
        context.drawImage(baseImg, upperLeftX, upperLeftY, outputImageWidth, outputImageHeight);
        context.drawImage(bottomImg, upperLeftX, outputImageHeight-outputCaptionHeight, outputImageWidth, outputCaptionHeight);

        return canvas;
    }

    // check the rep invariant is true
    private checkRep(): boolean {
        return true;
    }
}

export class TopToBottom implements Expression {
    // Abstraction Function
    //     AF(top, bottom) = the expression `top` --- `bottom`
    // Rep Invariant
    //     true
    // Safety from rep exposure
    //     all reps are immutable and unreassignable

    /**
     * Makes an expression such that two expressions are glued top-to-bottom
     * 
     * @param top an expression
     * @param bottom likewise
     */
    public constructor(public readonly top: Expression,
                       public readonly bottom: Expression) {
        this.checkRep();
    }

    /**
     * @inheritdoc
     */
    public toString(): string {
        return "(" + this.top + ") --- (" + this.bottom + ")";
    }

    /**
     * @inheritdoc
     */
    public equalValue(that: Expression): boolean {
        if (! (that instanceof TopToBottom)) { return false; }
        return this.top.equalValue(that.top) && this.bottom.equalValue(that.bottom);
    }

    /**
     * @inheritdoc
     */
    public size(): { width: number; height: number; } {
        const topSize = this.top.size();
        const bottomSize = this.bottom.size();
        const width = Math.max(topSize.width, bottomSize.width);
        const height = topSize.height + bottomSize.height;
        return {width, height};
    }

    /**
     * @inheritdoc
     */
    public image(): Canvas {
        const topImg = this.top.image();
        const bottomImg = this.bottom.image();

        const size = this.size();
        const topSize = this.top.size();
        const bottomSize = this.bottom.size();

        const topUpperLeftX = Math.max(0, (size.width - topSize.width)/2);
        const bottomUpperLeftX = Math.max(0, (size.width - bottomSize.height)/2);
        const topUpperLeftY = 0;
        const bottomUpperLeftY = this.top.size().height;

        const outputImageWidth = size.width;
        const outputImageHeight = size.height;

        const canvas = createCanvas(outputImageWidth, outputImageHeight);
        const context = canvas.getContext('2d');

        context.drawImage(topImg, topUpperLeftX, topUpperLeftY, topSize.width, topSize.height);
        context.drawImage(bottomImg, bottomUpperLeftX, bottomUpperLeftY, bottomSize.width, bottomSize.height);

        return canvas;
    }

    // check the rep invariant is true
    private checkRep(): boolean {
        return true;
    }
}

/**
 * Create a new expression for an image
 * 
 * @param imgName the filename for the image
 * @returns a new Expression for a single image
 */
export function newExpression(imgName: string): Expression {
    return new Filename(imgName);
}

/**
 * Create a new expression for a caption
 * 
 * @param caption the caption to be generated
 * @returns a new Expression for a caption
 */
export function newCaption(caption: string): Expression {
    return new Caption(caption);
}
