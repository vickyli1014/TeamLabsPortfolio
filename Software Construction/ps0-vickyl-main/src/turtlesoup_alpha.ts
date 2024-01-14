/* Copyright (c) 2007-2022 MIT 6.102/6.031/6.005 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import fs from 'fs';
import open from 'open';
import { Turtle, DrawableTurtle, LineSegment, PenColor, Point } from './turtle';


/**
 * Draw a portion of a polygon.
 * 
 * @param turtle the turtle context
 * @param sideCount the number of sides, must be >= 3
 * @param sideLength length of each side, must be >=0
 * @param portion portion of the polygon to be drawn, must be 0<=x<=1
 */
export function drawPolyPortion(turtle: Turtle, sideCount: number, sideLength: number, portion: number =1): void {
    let angle: number = ((sideCount-2)*180)/sideCount;
    let numTurns = sideCount * portion;
    for (let i=0; i<numTurns; i++) {
        turtle.forward(sideLength);
        turtle.turn(90 - Math.abs(angle - 90));
    }
}

/**
 * Draw a square.
 * 
 * @param turtle the turtle context
 * @param sideLength length of each side, must be >= 0
 */
export function drawSquare(turtle: Turtle, sideLength: number): void {
    drawPolyPortion(turtle, 4, sideLength);
}

/**
 * Determine the length of a chord of a circle.
 * (There is a simple formula; derive it or look it up.)
 * 
 * @param radius radius of a circle, must be > 0
 * @param angle in radians, where 0 <= angle < Math.PI
 * @returns the length of the chord subtended by the given `angle` 
 *          in a circle of the given `radius`
 */
export function chordLength(radius: number, angle: number): number {
    return 2*radius*Math.sin(angle/2);
}

/**
 * Approximate a circle by drawing a many-sided regular polygon, 
 * using only left-hand turns, and restoring the turtle's 
 * original heading and position after the drawing is complete.
 * 
 * @param turtle the turtle context
 * @param radius radius of the circle circumscribed around the polygon, must be > 0
 * @param numSides number of sides of the polygon to draw, must be >= 10
 */
export function drawApproximateCircle(turtle: Turtle, radius: number, numSides: number, portion: number =1): void {
    let angle: number = 360/numSides;
    let sideLength: number = chordLength(radius, angle);
    drawPolyPortion(turtle, numSides, sideLength, portion);
}

/**
 * Approximate a portion of a circle by drawing a many-sided regular polygon, 
 * using only left-hand turns. 
 * 
 * @param turtle the turtle context
 * @param radius radius of the circle circumscribed around the polygon, must be > 0
 * @param numSides number of sides of the polygon to draw, must be >= 10
 * @param portion fraction of the circle to be drawn
 */
export function drawApproximateCirclePortion(turtle: Turtle, radius: number, numSides: number, portion: number): void {
    drawApproximateCircle(turtle, radius, numSides, portion);
}

/**
 * Calculate the distance between two points.
 * 
 * @param p1 one point
 * @param p2 another point
 * @returns Euclidean distance between p1 and p2
 */
export function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
}

/**
 * Given a list of points, find a sequence of turns and moves that visits the points in order.
 * 
 * @param points  array of N input points.  Adjacent points must be distinct, and the array must not start with (0,0).
 * @returns an array of length 2N+1 of the form [turn_0, move_0, ..., turn_N-1, move_N-1, turn_N]
 *    such that if the turtle starts at (0,0) heading up (positive y direction), 
 *    and executes turn(turn_i) and forward(move_i) actions in the same order, 
 *    then it will be at points[i] after move_i for all valid i,
 *    and be back to its original upward heading after turn_N.
 */
export function findPath(points: Array<Point>): Array<number> {
    const rtn = new Array<number>();    
    let p1 = new Point(0, 0);
    let currentAngle = 0;
    for (let point of points) {
        // calculate the new angle at which the new point is at relative to current point and turn the difference
        let deltY = point.y - p1.y;
        let dist = distance(p1, point);
        let newAngle = ((Math.acos(deltY/dist) * 180 / Math.PI));
        let deltAngle = (newAngle - currentAngle) % 360;
        rtn.push(deltAngle);
        rtn.push(dist);
        p1 = point;
        currentAngle = newAngle;
    }

    rtn.push(-currentAngle);
    return rtn; 
}

/**
 * Moves the turtle to the given point.
 * 
 * @param turtle the turtle context
 * @param color the color to change the pen to after moving
 * @param point the point to move to
 */
export function moveToPoint(turtle: Turtle, color: PenColor, point: Point): void {
    turtle.color(PenColor.Transparent);
    let points = new Array<Point>();
    let path = findPath([point]);
    turtle.turn(path[0]);
    turtle.forward(path[1]);
    turtle.turn(-path[0]);
    turtle.color(color);
}

/**
 * Moves the turtle in a given direction left, right, up, or down.
 * 
 * @param turtle the turtle context
 * @param color the color to change the pen to after moving
 * @param direction the direction to turn, must be "left", "right", "down", "up"
 * @param length how far in a specific direction to move
 * @param currentAngle the angle/direction the turtle is currently pointing at
 */
export function moveInDirection(turtle: Turtle, color: PenColor, direction: string, length: number, currentAngle: number): void {
    turtle.color(PenColor.Transparent);
    let directions = new Map<string, number>([
        ["up", 0],
        ["down", 180],
        ["left", 270],
        ["right", 90]
    ]);
    turtle.turn(directions.get(direction)!-currentAngle);
    turtle.forward(length);
    turtle.color(color)
}

/**
 * Draw your personal, custom art.
 * 
 * Many interesting images can be drawn using the simple implementation of a turtle.
 * See the problem set handout for more information.
 * 
 * @param turtle the turtle context
 */
export function drawPersonalArt(turtle: Turtle): void {
    let currentAngle = 0;
    // draws the head and back
    turtle.turn(-15);
    drawApproximateCirclePortion(turtle, 7, 1000, .07);
    drawApproximateCirclePortion(turtle, 1.5, 1000, .4);
    turtle.turn(-30);
    currentAngle += -15 + 0.47*360 -30;

    // draws the goggles
    for (let i=0; i<2; i++) {
        drawApproximateCirclePortion(turtle, .8, 1000, .31);
        turtle.turn(30);
        turtle.forward(75);
        turtle.turn(39);
        currentAngle += .31 * 360 + 30 + 39;
    }

    // draws the front and legs
    moveInDirection(turtle, PenColor.Black, "down", 75, currentAngle);
    currentAngle = 180;
    turtle.forward(100);
    drawApproximateCirclePortion(turtle, .55, 1000, .5);
    currentAngle += .5*360;
    turtle.forward(10);
    turtle.turn(-90);
    turtle.forward(35);
    turtle.turn(-90);
    turtle.forward(10);
    drawApproximateCirclePortion(turtle, .55, 1000, .4);
    currentAngle += -180 + .4*360;

    // repositions the turtle
    moveInDirection(turtle, PenColor.Black, "up", 80, currentAngle);
    currentAngle = 0;
    moveInDirection(turtle, PenColor.Black, "left", 13, currentAngle);
    currentAngle = 270;

    // draws the backpack
    turtle.forward(18);
    drawApproximateCirclePortion(turtle, .3, 1000, .25);
    turtle.forward(60);
    drawApproximateCirclePortion(turtle, .3, 1000, .25);
    turtle.forward(24);
    currentAngle += .5 * 360;

    // draws the hair piece
    moveToPoint(turtle, PenColor.Black, new Point(0,30));
    moveInDirection(turtle, PenColor.Black, "up", 5, currentAngle);
    currentAngle = 0;
    turtle.color(PenColor.Red);
    for (let i=0; i<50; i++) {
        turtle.forward(50);
        turtle.turn(130);
    }
}

/**
 * Main program.
 * 
 * This function creates a turtle and draws in a window.
 */
function main(): void {
    const turtle: Turtle = new DrawableTurtle();

    const sideLength = 40;
    // drawSquare(turtle, sideLength);
    // drawApproximateCircle(turtle, 4, 100);
    drawPersonalArt(turtle);

    // draw into a file
    const svgDrawing = turtle.getSVG();
    fs.writeFileSync('output.html', `<html>\n${svgDrawing}</html>\n`);

    // open it in a web browser
    void open('output.html');
}

if (require.main === module) {
    main();
}