/**
 * Manual integration testing strategy:
 * partition on game state:
 *  - no puzzle displayed, puzzle displayed
 * partition on user actions:
 *  - request new puzzle, add star, remove star
 * partition on client response to user actions:
 *  - add star, remove star, load new puzzle, do nothing (because move was illegal)
 *      - further partition on adding star: also notify user that puzzle is solved, 
 *          don't notify user because puzzle not solved
 */

/**
 * Test cases:
 * 
 * Starting a new puzzle after loading the webpage
 * Covers: no puzzle displayed, request new puzzle
 * 1. Navigate to Star Battle site => assert page loads with instructions
 * 2. Click to request new puzzle => assert that a new puzzle appears
 * 
 * Legally adding a star to a puzzle
 * Covers: puzzle displayed, add star, client responds by adding star but not notifying user
 * 1. Navigate to Star Battle site => assert page loads with instructions
 * 2. Click to request new puzzle => assert that a new puzzle appears
 * 3. Click a location to add a star => assert that a star appears
 * 
 * Legally removing a star from a puzzle
 * Covers: remove star, client responds by removing star
 * 1. Navigate to Star Battle site => assert page loads with instructions
 * 2. Click to request new puzzle => assert that a new puzzle appears
 * 3. Click a location to add a star => assert that a star appears
 * 4. Click that location again to remove the star => assert that the star disappears
 * 
 * Illegal add move
 * Covers: add star, client doesn't do anything
 * 1. Navigate to Star Battle site => assert page loads with instructions
 * 2. Click to request new puzzle => assert that a new puzzle appears
 * 3. Click a location to add a star => assert that a star appears
 * 4. Click on a location next to it to add a star => assert that nothing happens
 * 
 * Solving puzzle
 * Covers: client tells user puzzle solved
 * 1. Navigate to Star Battle site => assert page loads with instructions
 * 2. Click to request new puzzle => assert that a new puzzle appears
 * 3. Solve puzzle => assert that the client notifies user that puzzle was solved
 */