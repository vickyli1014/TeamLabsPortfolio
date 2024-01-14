/* Copyright (c) 2007-2022 MIT 6.102/6.031/6.005 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

import fs from 'fs';
import open from 'open';
import { Turtle, DrawableTurtle, LineSegment, PenColor, Point } from './turtle';

const CIRCLE_DEGREES = 360;
const HORIZONTAL_DEGREES = CIRCLE_DEGREES / 2;
enum DirectionAngle {
    UP = 0,
    DOWN = 180,
    LEFT = 270,
    RIGHT = 90,
  }

  /**
 * Draws a fraction of the lines needed to draw a polygon.
 * For example, 2/3 of a triangle would be a triangle without the third side.
 * 
 * @param turtle the turtle context
 * @param sideCount the number of sides, must be >= 3
 * @param sideLength length of each side, must be >=0
 * @param fraction fraction of the lines of the polygon to be drawn, must be 0<=x<=1. Value =1 by default.
 */
export function drawPolyPortion(turtle: Turtle, sideCount: number, sideLength: number, fraction: number =1): void {
    const angle = CIRCLE_DEGREES/sideCount;
    const numTurns = sideCount * fraction;
    for (let i=0; i<numTurns; i++) {
        turtle.forward(sideLength);
        turtle.turn(angle);
    }
}

/**
 * Draw a square.
 * 
 * @param turtle the turtle context
 * @param sideLength length of each side, must be >= 0
 */
export function drawSquare(turtle: Turtle, sideLength: number): void {
    const sidesOfSquare = 4;
    drawPolyPortion(turtle, sidesOfSquare, sideLength);
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
 * @param portion fraction of the circle to be drawn
 */
export function drawApproximateCircle(turtle: Turtle, radius: number, numSides: number, portion: number =1): void {
    const angle: number = CIRCLE_DEGREES/numSides;
    const sideLength: number = chordLength(radius, angle);
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
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
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
    const moves = new Array<number>();    
    let currentPoint = new Point(0, 0);
    let currentAngle = 0;
    for (const point of points) {
        // calculate the new angle at which the new point is at relative to current point and turn the difference
        const deltY = point.y - currentPoint.y;
        const deltX = point.x - currentPoint.x;
        const dist = distance(currentPoint, point);
        let newAngle = ((Math.acos(deltY/dist) * HORIZONTAL_DEGREES / Math.PI));
        if (deltX < 0) {
            newAngle *= -1;
        }
        const deltAngle = (newAngle - currentAngle) % CIRCLE_DEGREES;
        moves.push(deltAngle);
        moves.push(dist);
        currentPoint = point;
        currentAngle = newAngle;
    }
    // add the angle that resets the turtle to its original heading
    moves.push(-currentAngle);
    return moves; 
}

/**
 * Moves the turtle to the given point. 
 * Then changes the PenColor to the specified color.
 * 
 * @param turtle the turtle context
 * @param color the color to change the pen to after moving, usually the color the pen 
 * is when calling this function
 * @param point the point to move to
 */
export function moveToPoint(turtle: Turtle, color: PenColor, point: Point): void {
    turtle.color(PenColor.Transparent);
    const path = findPath([point]);
    const angle = path[0];
    const length = path[1];
    turtle.turn(angle);
    turtle.forward(length);
    turtle.turn(-angle);
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
export function moveInDirection(turtle: Turtle, color: PenColor, direction: DirectionAngle, 
    length: number, currentAngle: number): void {
    turtle.color(PenColor.Transparent);
    turtle.turn(direction-currentAngle);
    turtle.forward(length);
    turtle.color(color);
}

/**
 * Draws an Amogus!
 * 
 * Many interesting images can be drawn using the simple implementation of a turtle.
 * See the problem set handout for more information.
 * 
 * @param turtle the turtle context
 */
export function drawPersonalArt(turtle: Turtle): void {
    const approxCircleSideCount = 1000;
    let currentAngle = 0;
    // draws the head and back
    const amogusBackStartAngle = -15;
    const backRadius = 7;
    const headRadius = 1.5;
    const backCircleFraction = 0.07;
    const headCircleFraction = 0.4;
    const turnToDrawGoggles = -30;

    turtle.turn(amogusBackStartAngle);
    drawApproximateCirclePortion(turtle, backRadius, approxCircleSideCount, backCircleFraction);
    drawApproximateCirclePortion(turtle, headRadius, approxCircleSideCount, headCircleFraction);
    turtle.turn(turnToDrawGoggles);
    currentAngle += amogusBackStartAngle + (backCircleFraction + headCircleFraction)*CIRCLE_DEGREES
        + turnToDrawGoggles;

    // draws the goggles
    const gogglesSemiCricleRadius = 0.8;
    const gogglesSemiCircleFraction = 0.31;
    const turnToDrawGogglesLength = 30;
    const gogglesLength = 75;
    const turnToDrawGogglesSemiCircle = 39;
    for (let i=0; i<2; i++) {
        drawApproximateCirclePortion(turtle, gogglesSemiCricleRadius, approxCircleSideCount, 
            gogglesSemiCircleFraction);
        turtle.turn(turnToDrawGogglesLength);
        turtle.forward(gogglesLength);
        turtle.turn(turnToDrawGogglesSemiCircle);
        currentAngle += gogglesSemiCircleFraction * CIRCLE_DEGREES + turnToDrawGogglesLength 
            + turnToDrawGogglesSemiCircle;
    }

    // draws the front and legs
    const gogglesHeight = 75;
    const bodyHeight = 100;
    const legRadius = 0.55;
    const legCircleFractionRight = 0.5;
    const legCircleFractionLeft = 0.4;
    const legLength = 10;
    const bootyLength = 35;
    moveInDirection(turtle, PenColor.Black, DirectionAngle.DOWN, gogglesHeight, currentAngle);
    currentAngle = DirectionAngle.DOWN;
    turtle.forward(bodyHeight);
    drawApproximateCirclePortion(turtle, legRadius, approxCircleSideCount, legCircleFractionRight);
    currentAngle += legCircleFractionRight*CIRCLE_DEGREES;
    turtle.forward(legLength);
    turtle.turn(DirectionAngle.LEFT);
    turtle.forward(bootyLength);
    turtle.turn(DirectionAngle.LEFT);
    turtle.forward(legLength);
    drawApproximateCirclePortion(turtle, legRadius, approxCircleSideCount, legCircleFractionLeft);
    currentAngle += DirectionAngle.LEFT + DirectionAngle.LEFT + legCircleFractionLeft*CIRCLE_DEGREES;

    // repositions the turtle to draw the backpack
    const yDistToBackpack = 80;
    const xDistToBackpack = 13;
    moveInDirection(turtle, PenColor.Black, DirectionAngle.UP, yDistToBackpack, currentAngle);
    currentAngle = DirectionAngle.UP;
    moveInDirection(turtle, PenColor.Black, DirectionAngle.LEFT, xDistToBackpack, currentAngle);
    currentAngle = DirectionAngle.LEFT;

    // draws the backpack, which is in the shape of a squircle.
    const backpackTopWidth = 18;
    const backpackBottomWidth = 24;
    const backpackHeight = 60;
    const backpackRadius = 0.3;
    const backpackCircleFraction = 0.25;
    turtle.forward(backpackTopWidth);
    drawApproximateCirclePortion(turtle, backpackRadius, approxCircleSideCount, backpackCircleFraction);
    turtle.forward(backpackHeight);
    drawApproximateCirclePortion(turtle, backpackRadius, approxCircleSideCount, backpackCircleFraction);
    turtle.forward(backpackBottomWidth);
    currentAngle += (backpackCircleFraction + backpackCircleFraction) * CIRCLE_DEGREES;

    // draws the hair piece
    const startAccessoryPoint = new Point(-30,20)
    moveToPoint(turtle, PenColor.Black, startAccessoryPoint);
    turtle.color(PenColor.Red);
    const sidesOfStar = 40;
    const starLength = 50;
    const starInnerAngle = 130;
    for (let i=0; i<sidesOfStar; i++) {
        turtle.forward(starLength);
        turtle.turn(starInnerAngle);
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
    // drawPolyPortion(turtle, 3, 120);
    // drawApproximateCircle(turtle, 4, 100);
    drawPersonalArt(turtle);

    // draw a square using findPath
    // const squarePath = findPath([new Point(-20, 0), new Point(-20, -20), new Point(0, -20), new Point(0, 0)]);
    // for (let i=0; i<squarePath.length; i+=2) {
    //     turtle.turn(squarePath[i]);
    //     turtle.forward(squarePath[i+1]);
    // }

    // draw an X using findPath
    // const xPath = findPath([new Point(-20, 20), new Point(20, -20), new Point(0, 0), new Point(20, 20), new Point(-20, -20)]);
    // for (let i=0; i<xPath.length; i+=2) {
    //     turtle.turn(xPath[i]);
    //     turtle.forward(xPath[i+1]);
    // }

    // draw into a file
    const svgDrawing = turtle.getSVG();
    fs.writeFileSync('output.html', `<html>\n${svgDrawing}</html>\n`);

    // open it in a web browser
    void open('output.html');
}

if (require.main === module) {
    main();
}
