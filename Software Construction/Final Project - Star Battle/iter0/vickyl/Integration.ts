/**
 * Testing strategy for manual integration:
 * partition on placing a star:
 *      - valid and invalid placements
 * partition on action:
 *      - navigating to website
 *      - placing a star
 *      - removing a star
 *      - requesting completion determination from server
 */

/**
 * Manual test: placing a star
 * Covers: navigating to webiste, valid placement of star
 * 1. Open the website => assert the blank puzzle is displayed
 * 2. Click on any cell in the grid => assert that the cell contains a star
 */

/**
 * Manual test: removing a star
 * Covers: removing a star
 * 1. Open the website => assert the blank puzzle is displayed
 * 2. Click on any cell in the grid => assert that the cell contains a star
 * 3. Repeat (2) for 1+ times
 * 4. Click on the most recent star => assert that the cell is empty
 * 5. Click on another cell that has a star => assert the cell is empty after click
 */

/**
 * Manual test: displaying that the puzzle has been solved
 * Covers: completion displayed
 * 1. Open website => assert the blank puzzle is displayed
 * 2. Solve puzzle ( => assert the display for completion is shown if not requesting determination )
 * 3. Ask if the puzzle has been solved => assert the display for completion is shown
 */

/**
 * Manual test: displaying that puzzle has not been solved
 * Covers: requesting completion determination from server, incompletion displayed
 * 1. Open website => assert the blank puzzle is displayed
 * 2. Partially solve the puzzle
 * 3. Ask if the puzzle has been solved => assert the display for incompletion is shown
 * 
 */

/** 
 * Manual test: illegal move:
 * Covers: invalid placement of star
 * 1. Open website => assert the blank puzzle is displayed
 * 2. Click two cells next to each other => assert some sort of error after the second click
 */
