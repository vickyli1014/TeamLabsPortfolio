/**
 * No automatic testing could be done for client because of the different types that were needed for drawing in the web broswer compared to
 *  drawing for an automatic testing file. Although the handout provided suggestions for creating union types to allow for automatic testing,
 *  they did not work for us because our stars are drawn by loading images of stars. The methods needed to load an image were different and did not
 *  work with the union types. Since the testing of client relies on visual drawings anyways, we decided that manual testing would be sufficient. 
 * 
 * Manual Testing Strategy
 * 
 * partitions for clicked:
 *  - type of click made: add star, remove star
 *  - location of click: at an edge row/column or in the middle of the board
 * 
 * partitions for drawing:
 *  - adding star
 *  - removing star
 * 
 * partitions for solved:
 *  - called with solved board
 *  - called with an unsolved board
 * 
 * equalValue not being tested because it's just glue code for puzzle
 * 
 * Manual test: start game
 * 
 * Covers: start server, start new player
 * 1. navigate to the directory the project is placed in 
 * 2. run `npm run server 8789` to start server
 * 3. run `npm run watchify-client` to create a player
 * 4. open starb-client.html in a webpage => assert that there is a page with a blank puzzle, with colored cells indicating the regions,
 *    an output area under the puzzle, and a "Check Complete" button under that. Assert that all cells in the same region are colored the same color,
 *    different from other regions
 * 
 * 
 * Manual test: click on a cell at the edge of the board to add star, with drawing responding accordingly
 * 
 * Covers: click on a cell without a star
 * 1. start a new puzzle game (following instructions above)
 * 2. click on cell at location (1, 1) => assert that a star has been added there
 * 
 * Manual test: click on a cell at the edge of the board to remove a star, with drawing responding accordingly
 * Covers: click on a cell with a star
 * 1. start a new puzzle game (following instructions above)
 * 2. click on cell at location (1, 1) => assert that a star has been added there
 * 3. click on cell at location (1, 1) => assert that the star has been removed
 * 
 * Manual test: click on a cell in the center of the board to add star, with drawing responding accordingly
 * 
 * Covers: click on a cell without a star
 * 1. start a new puzzle game (following instructions above)
 * 2. click on cell at location (2, 3) => assert that a star has been added there
 * 
 * Manual test: click on a cell in the center of the board to remove a star, with drawing responding accordingly
 * Covers: click on a cell with a star
 * 1. start a new puzzle game (following instructions above)
 * 2. click on cell at location (2, 3) => assert that a star has been added there
 * 3. click on cell at location (2, 3) => assert that the star has been removed
 * 
 * 
 * Manual test: check solution once player thinks they've successfully completed the puzzle
 * 
 * Covers: puzzle is solved
 * 1. start a new puzzle game (following the start game instructions above)
 * 2. add stars at the following locations: (1, 2), (1, 5), (2, 9), (4, 10), (3, 2), (3, 4), (2, 7), (4, 8), (6, 1),
 *                                          (9, 1), (5, 4), (5, 6), (6, 8), (8, 7), (7, 3), (7, 5), (8, 9), (10, 10),
 *                                          (9, 3), (10, 6) 
 * 3. click "Check Complete" button => assert that "Puzzle solved! :)" is printed in the output area
 * 
 * Covers: puzzle is not solved
 * 1. start a new puzzle game (following the start game instructions above)
 * 2. add stars at the following locations: (1, 2), (1, 5), (2, 9), (4, 10), (3, 2)
 * 3. click "Check Complete" button => assert that "Hmmmmm, not quite solved :(" is printed in the output area
 */