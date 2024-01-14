#!/usr/bin/env python3
"""6.009 Lab -- Six Double-Oh Mines"""

# NO IMPORTS ALLOWED!

def dump(game):
    """
    Prints a human-readable version of a game (provided as a dictionary)
    """
    for key, val in sorted(game.items()):
        if isinstance(val, list) and val and isinstance(val[0], list):
            print(f'{key}:')
            for inner in val:
                print(f'    {inner}')
        else:
            print(f'{key}:', val)


# 2-D IMPLEMENTATION


def new_game_2d(num_rows, num_cols, bombs):
    """
    Start a new game.

    Return a game state dictionary, with the 'dimensions', 'state', 'board' and
    'mask' fields adequately initialized.

    Parameters:
       num_rows (int): Number of rows
       num_cols (int): Number of columns
       bombs (list): List of bombs, given in (row, column) pairs, which are
                     tuples

    Returns:
       A game state dictionary

    >>> dump(new_game_2d(2, 4, [(0, 0), (1, 0), (1, 1)]))
    board:
        ['.', 3, 1, 0]
        ['.', '.', 1, 0]
    dimensions: (2, 4)
    mask:
        [False, False, False, False]
        [False, False, False, False]
    state: ongoing
    """
    board = []
    # made a new board and places bombs depending on the passed coordinates
    for r in range(num_rows):
        row = []
        for c in range(num_cols):
            if (r, c) in bombs: # removed [r,c]
                row.append('.')
            else:
                row.append(0)
        board.append(row)
    # initializes a mask of Falses
    mask = [[False] * num_cols] * num_rows # made this more readable
    # mask = []
    # for r in range(num_rows):
    #     row = []
    #     for c in range(num_cols):
    #         row.append(False)
    #     mask.append(row)
    # changes the value of each element to the number of surrounding bombs
    # if a surrounding cell is within the game then check if it's a bomb and increment
    surrounding_range = [-1, 0, 1]
    for r in range(num_rows):
        for c in range(num_cols):
            if board[r][c] == 0:
                neighbor_bombs = 0
                for i in surrounding_range:
                    if 0 <= r+i < num_rows:
                        r_temp = r+i
                        for j in surrounding_range:
                            if 0 <= c+j < num_cols:
                                c_temp = c+j
                                if board[r_temp][c_temp] == '.':
                                    neighbor_bombs += 1
                board[r][c] = neighbor_bombs
    return {
        'dimensions': (num_rows, num_cols),
        'board': board,
        'mask': mask,
        'state': 'ongoing'}


def dig_2d(game, row, col):
    """
    Reveal the cell at (row, col), and, in some cases, recursively reveal its
    neighboring squares.

    Update game['mask'] to reveal (row, col).  Then, if (row, col) has no
    adjacent bombs (including diagonally), then recursively reveal (dig up) its
    eight neighbors.  Return an integer indicating how many new squares were
    revealed in total, including neighbors, and neighbors of neighbors, and so
    on.

    The state of the game should be changed to 'defeat' when at least one bomb
    is visible on the board after digging (i.e. game['mask'][bomb_location] ==
    True), 'victory' when all safe squares (squares that do not contain a bomb)
    and no bombs are visible, and 'ongoing' otherwise.

    Parameters:
       game (dict): Game state
       row (int): Where to start digging (row)
       col (int): Where to start digging (col)

    Returns:
       int: the number of new squares revealed

    >>> game = {'dimensions': (2, 4),
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'mask': [[False, True, False, False],
    ...                  [False, False, False, False]],
    ...         'state': 'ongoing'}
    >>> dig_2d(game, 0, 3)
    4
    >>> dump(game)
    board:
        ['.', 3, 1, 0]
        ['.', '.', 1, 0]
    dimensions: (2, 4)
    mask:
        [False, True, True, True]
        [False, False, True, True]
    state: victory

    >>> game = {'dimensions': [2, 4],
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'mask': [[False, True, False, False],
    ...                  [False, False, False, False]],
    ...         'state': 'ongoing'}
    >>> dig_2d(game, 0, 0)
    1
    >>> dump(game)
    board:
        ['.', 3, 1, 0]
        ['.', '.', 1, 0]
    dimensions: [2, 4]
    mask:
        [True, True, False, False]
        [False, False, False, False]
    state: defeat
    """
    # checks for game state
    if game['state'] == 'defeat' or game['state'] == 'victory':
        # game['state'] = game['state']  redundant
        return 0

    # checks if bomb
    if game['board'][row][col] == '.':
        game['mask'][row][col] = True
        game['state'] = 'defeat'
        return 1

    # bombs = 0
    # covered_squares = 0
    # for r in range(game['dimensions'][0]):
    #     for c in range(game['dimensions'][1]):
    #         if game['board'][r][c] == '.':
    #             if game['mask'][r][c] == True:
    #                 bombs += 1
    #         elif game['mask'][r][c] == False:
    #             covered_squares += 1
    # if bombs != 0:
    #     # if bombs is not equal to zero, set the game state to defeat and
    #     # return 0
    #     game['state'] = 'defeat'
    #     return 0
    

    # checks if selected cell is covered
    # if originally covered, reveal
    if game['mask'][row][col] != True:
        game['mask'][row][col] = True
        revealed = 1
    else:
        return 0

    # if zero, digs the surrounding cells
    if game['board'][row][col] == 0:
        num_rows, num_cols = game['dimensions']
        surrounding_range = [-1, 0, 1]
        # for all surrounding cells
        for i in surrounding_range:
            if 0 <= row+i < num_rows:
                r_temp = row+i
                for j in surrounding_range:
                    if 0 <= col+j < num_cols:
                        c_temp = col+j
                        # dig
                        if game['mask'][r_temp][c_temp] == False and game['board'][r_temp][c_temp] != '.':
                            revealed += dig_2d(game, r_temp, c_temp)
        # if 0 <= row-1 < num_rows:
        #     if 0 <= col-1 < num_cols:
        #         if game['board'][row-1][col-1] != '.':
        #             if game['mask'][row-1][col-1] == False:
        #                 revealed += dig_2d(game, row-1, col-1)
        # if 0 <= row < num_rows:
        #     if 0 <= col-1 < num_cols:
        #         if game['board'][row][col-1] != '.':
        #             if game['mask'][row][col-1] == False:
        #                 revealed += dig_2d(game, row, col-1)
        # if 0 <= row+1 < num_rows:
        #     if 0 <= col-1 < num_cols:
        #         if game['board'][row+1][col-1] != '.':
        #             if game['mask'][row+1][col-1] == False:
        #                 revealed += dig_2d(game, row+1, col-1)
        # if 0 <= row-1 < num_rows:
        #     if 0 <= col < num_cols:
        #         if game['board'][row-1][col] != '.':
        #             if game['mask'][row-1][col] == False:
        #                 revealed += dig_2d(game, row-1, col)
        # if 0 <= row < num_rows:
        #     if 0 <= col < num_cols:
        #         if game['board'][row][col] != '.':
        #             if game['mask'][row][col] == False:
        #                 revealed += dig_2d(game, row, col)
        # if 0 <= row+1 < num_rows:
        #     if 0 <= col < num_cols:
        #         if game['board'][row+1][col] != '.':
        #             if game['mask'][row+1][col] == False:
        #                 revealed += dig_2d(game, row+1, col)
        # if 0 <= row-1 < num_rows:
        #     if 0 <= col+1 < num_cols:
        #         if game['board'][row-1][col+1] != '.':
        #             if game['mask'][row-1][col+1] == False:
        #                 revealed += dig_2d(game, row-1, col+1)
        # if 0 <= row < num_rows:
        #     if 0 <= col+1 < num_cols:
        #         if game['board'][row][col+1] != '.':
        #             if game['mask'][row][col+1] == False:
        #                 revealed += dig_2d(game, row, col+1)
        # if 0 <= row+1 < num_rows:
        #     if 0 <= col+1 < num_cols:
        #         if game['board'][row+1][col+1] != '.':
        #             if game['mask'][row+1][col+1] == False:
        #                 revealed += dig_2d(game, row+1, col+1)
    # doesn't check if surrounding cells are bombs
    # checks all cells and all surrounding cells in nested for loops

    # checks state of game after digging
    # bombs = 0  # set number of bombs to 0
    # covered_squares = 0
    # for r in range(game['dimensions'][0]):
    #     # for each r,
    #     for c in range(game['dimensions'][1]):
    #         # for each c,
    #         if game['board'][r][c] == '.':
    #             # if game['mask'][r][c] == True:
    #                 # if the game mask is True, and the board is '.', add 1 to
    #                 # bombs
    #                 # change: instead of incrementing for number of shown bombs, increment if bomb
    #             bombs += 1
    #         if game['mask'][r][c] == False:
    #             covered_squares += 1
    # bad_squares = covered_squares - bombs
    # bad_squares always greater than 0 if it sums bombs with covered_squares
    
    # checks if victory
    # removed counting bombs since the first thing checked if selected cell is a bomb
    # moved to the end of function
    covered_squares = 0
    for r in range(game['dimensions'][0]):
        for c in range(game['dimensions'][1]):
            if game['board'][r][c] != '.' and game['mask'][r][c] == False:
                covered_squares += 1
    if covered_squares == 0:
        game['state'] = 'victory'
    return revealed


def render_2d_locations(game, xray=False):
    """
    Prepare a game for display.

    Returns a two-dimensional array (list of lists) of '_' (hidden squares),
    '.' (bombs), ' ' (empty squares), or '1', '2', etc. (squares neighboring
    bombs).  game['mask'] indicates which squares should be visible.  If xray
    is True (the default is False), game['mask'] is ignored and all cells are
    shown.

    Parameters:
       game (dict): Game state
       xray (bool): Whether to reveal all tiles or just the ones allowed by
                    game['mask']

    Returns:
       A 2D array (list of lists)

    >>> render_2d_locations({'dimensions': (2, 4),
    ...         'state': 'ongoing',
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'mask':  [[False, True, True, False],
    ...                   [False, False, True, False]]}, False)
    [['_', '3', '1', '_'], ['_', '_', '1', '_']]

    >>> render_2d_locations({'dimensions': (2, 4),
    ...         'state': 'ongoing',
    ...         'board': [['.', 3, 1, 0],
    ...                   ['.', '.', 1, 0]],
    ...         'mask':  [[False, True, False, True],
    ...                   [False, False, False, True]]}, True)
    [['.', '3', '1', ' '], ['.', '.', '1', ' ']]
    """
    def render(board, mask):
        # renders locations in any dimension
        # if last dimension, reveal cell depending on mask
        if type(mask[0]) == bool:
            return [ ' ' if board[i]==0 and (mask[i] or xray) else str(board[i]) if (mask[i] or xray) else '_' for i in range(len(mask)) ]
        board_dim = []
        for i in range(len(board)):
            # concatenate this element's previous dimension render
            board_dim.append(render(board[i], mask[i]))
        return board_dim
    return render(game['board'], game['mask'])

def render_2d_board(game, xray=False):
    """
    Render a game as ASCII art.

    Returns a string-based representation of argument 'game'.  Each tile of the
    game board should be rendered as in the function
        render_2d_locations(game)

    Parameters:
       game (dict): Game state
       xray (bool): Whether to reveal all tiles or just the ones allowed by
                    game['mask']

    Returns:
       A string-based representation of game

    >>> render_2d_board({'dimensions': (2, 4),
    ...                  'state': 'ongoing',
    ...                  'board': [['.', 3, 1, 0],
    ...                            ['.', '.', 1, 0]],
    ...                  'mask':  [[True, True, True, False],
    ...                            [False, False, True, False]]})
    '.31_\\n__1_'
    """
    board = render_2d_locations(game, xray)
    rendered = ''
    # concatenate all columns and add \n between rows
    for row in board:
        for el in row: 
            rendered += el
        rendered += '\n'
    return rendered[:-1]


# N-D IMPLEMENTATION
def create_new_board(dim, val):
    '''
    Create a new board 

    Returns a board of 0's with dimension dim

    Parameters:
        dim (tuple): Dimensions of the board

    Returns:
        A (multidimensional) list filled with 0's

    >>> board = create_new_board((1, 2), 0)
    >>> board
    [[0, 0]]

    >>> board = create_new_board((2, 3, 2), 0)
    >>> board
    [[[0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0]]]

    >>> board = create_new_board((2, 3, 2), False)
    >>> board
    [[[False, False], [False, False], [False, False]],
    [[False, False], [False, False], [False, False]]]
    '''
    if len(dim) == 1:
        return ([val] * dim[0])
    return [create_new_board(dim[1:], val) for i in range(dim[0])]
    
def dict_of_surrounding_cells(dim_num, coord, dimensions):
    '''
    Creates a dictionary with the key as the dimension layer number and its values 
    as the coordinates of the surrounding cells in that dimension

    Typically the last key, value pair is most useful

    Parameters:
        dim_num (int): the dimension number we are currently trying to find the 
            surrounding coordinates for

        coord (tuple): the coordinate that we want to get the surrounding coordinates
            from

        dimensions (tuple): the dimensions of the board

    Returns: 
        A dictionary with the key as the dimension layer number and its values as 
        the coordinates of the surrounding cells in that dimension

    >>> dict_of_surrounding_cells(3, (2, 1, 2), (2, 4, 2))
    {1: [[1]], 2: [[1, 0], [1, 1], [1, 2]], 3: [[1, 0, 1], [1, 1, 1], [1, 2, 1]]}

    dict_of_surrounding_cells(4, ())
    {1: [[0], [1], [2]], 2: [[0, 1], [1, 1], [2, 1]], 3: [[0, 1, 2], [0, 1, 3], 
    [0, 1, 4], [1, 1, 2], [1, 1, 3], [1, 1, 4], [2, 1, 2], [2, 1, 3], [2, 1, 4]], 
    4: [[0, 1, 2, 0], [0, 1, 2, 1], [0, 1, 3, 0], [0, 1, 3, 1], [0, 1, 4, 0], 
    [0, 1, 4, 1], [1, 1, 2, 0], [1, 1, 2, 1], [1, 1, 3, 0], [1, 1, 3, 1], [1, 1, 4, 0], 
    [1, 1, 4, 1], [2, 1, 2, 0], [2, 1, 2, 1], [2, 1, 3, 0], [2, 1, 3, 1], [2, 1, 4, 0], [2, 1, 4, 1]]}
    '''
    # if last dimension, return a dictionary with key = 1, values = surrounding cells in 1D
    if dim_num == 1: 
        return {dim_num: [ [coord[0]+i] for i in range(-1, 2) if 0 <= coord[0]+i < dimensions[dim_num-1] ]}
    cells_in_prev_dim = dict_of_surrounding_cells(dim_num - 1, coord, dimensions)[dim_num-1]
    cells_in_this_dim = []
    # add surrounding cells from the new dimension
    # i.e. [0, 0] -> [0, 0, 0] [0, 0, 1] [0, 0, 2]
    new_plane = []
    for plane in cells_in_prev_dim:
        for i in range(-1, 2):
            # append to list if within range of board
            new_coord = coord[dim_num-1] + i
            if 0 <= new_coord < dimensions[dim_num-1]:
                new_plane.append(plane + [coord[dim_num-1] + i])
    all_coords_so_far = dict_of_surrounding_cells(dim_num - 1, coord, dimensions)
    all_coords_so_far[dim_num] = new_plane
    return all_coords_so_far

def nd_coordinates(dim):
    ''' 
    Returns a list of tuples of all coordinates in board with dim dimensions

    Parameters:
        dim (tuple): dimensions of the board

    Returns: 
        A list containing all coordinates in the board

    >>> nd_coordinates((2, 4, 2))
    [(0, 0, 0), (0, 0, 1), (0, 1, 0), (0, 1, 1), (0, 2, 0), (0, 2, 1), 
    (0, 3, 0), (0, 3, 1), (1, 0, 0), (1, 0, 1), (1, 1, 0), (1, 1, 1), 
    (1, 2, 0), (1, 2, 1), (1, 3, 0), (1, 3, 1)]

    >>> nd_coordinates((1, 2, 1))
    [(0, 0, 0), (0, 1, 0)]
    '''
    if len(dim) == 1:
        return [ (i, ) for i in range(dim[0]) ]
    # for higher level dimensions, concatenate tuples ((n, ), i) 
    # i is a coordinate from the previous dimension and 0 <= n < max value of this dimension
    prev_d = nd_coordinates(dim[1:])
    nd = []
    for n in range(dim[0]):
        for i in prev_d:
            nd.append((n, ) + i)
    return nd

def set_cell(board, coord, val):
    '''
    Sets the value of a cell to a given value

    Given a board, coordinate, and value, the value of the cell at coordinate
    is set to the value passed in

    Parameters:
        board (list): Board of current game

        coord (tuple): coordinates of the cell we want to change

        val (str or int): the new value of the cell

    >>> board = [[[3, '.'], [3, 3], [1, 1], [0, 0]], [['.', 3], [3, '.'], [1, 1], [0, 0]]]
    >>> set_cell(board, (0, 0, 0), '.')
    >>> board
    [[['.', '.'], [3, 3], [1, 1], [0, 0]], [['.', 3], [3, '.'], [1, 1], [0, 0]]]

    >>> set_cell(board, (0,3,1), 4)
    >>> board
    [[['.', '.'], [3, 3], [1, 1], [0, 4]], [['.', 3], [3, '.'], [1, 1], [0, 0]]]
    '''
    temp = board
    for i in range(len(coord)-1):
        temp = temp[coord[i]]
    temp[coord[-1]] = val

def coord_to_cell_value(board, coord):
    '''
    Returns the value of a cell

    Parameters:
        board (list): board of current game

        coord (tuple): coordinate of the cell we want the value of

    Returns:
        either '.' or an integer

    >>> board = [[[3, '.'], [3, 3], [1, 1], [0, 4]], [['.', 3], [3, '.'], [1, 1], [0, 0]]]
    >>> coord_to_cell_value(board, (0, 3, 1))
    4

    >>> coord_to_cell_value(board, (0, 0, 1))
    '.'
    '''
    temp = board
    for i in range(len(coord)-1):
        temp = temp[coord[i]]
    return temp[coord[-1]]

def new_game_nd(dimensions, bombs):
    """
    Start a new game.

    Return a game state dictionary, with the 'dimensions', 'state', 'board' and
    'mask' fields adequately initialized.


    Args:
       dimensions (tuple): Dimensions of the board
       bombs (list): Bomb locations as a list of lists, each an
                     N-dimensional coordinate

    Returns:
       A game state dictionary

    >>> g = new_game_nd((2, 4, 2), [(0, 0, 1), (1, 0, 0), (1, 1, 1)])
    >>> dump(g)
    board:
        [[3, '.'], [3, 3], [1, 1], [0, 0]]
        [['.', 3], [3, '.'], [1, 1], [0, 0]]
    dimensions: (2, 4, 2)
    mask:
        [[False, False], [False, False], [False, False], [False, False]]
        [[False, False], [False, False], [False, False], [False, False]]
    state: ongoing
    """
    # makes an empty board and mask of Falses 
    mask = create_new_board(dimensions, False)
    board = create_new_board(dimensions, 0)
    # sets bombs
    for bomb in bombs:
        set_cell(board, bomb, '.')
    # changes all non-bombs to the count of bombs in surrounding cells
    cell_coordinates = nd_coordinates(dimensions)
    i = 0
    for coord in cell_coordinates:
        if coord_to_cell_value(board, coord) == '.':
            continue
        surrounding_cell_coords = dict_of_surrounding_cells(len(dimensions), coord, dimensions)[len(dimensions)]
        surrounding_cells = [ coord_to_cell_value(board, surrounding_coord) for surrounding_coord in surrounding_cell_coords ]
        number_bombs = surrounding_cells.count('.')
        set_cell(board, coord, number_bombs)
    
    return {
        'board': board, 
        'dimensions': dimensions,
        'mask': mask,
        'state': 'ongoing'}

def dig_nd(game, coordinates, prev_checked = None, check_for_victory = True):
    """
    Recursively dig up square at coords and neighboring squares.

    Update the mask to reveal square at coords; then recursively reveal its
    neighbors, as long as coords does not contain and is not adjacent to a
    bomb.  Return a number indicating how many squares were revealed.  No
    action should be taken and 0 returned if the incoming state of the game
    is not 'ongoing'.

    The updated state is 'defeat' when at least one bomb is visible on the
    board after digging, 'victory' when all safe squares (squares that do
    not contain a bomb) and no bombs are visible, and 'ongoing' otherwise.

    Args:
       coordinates (tuple): Where to start digging

    Returns:
       int: number of squares revealed

    >>> g = {'dimensions': (2, 4, 2),
    ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
    ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
    ...      'mask': [[[False, False], [False, True], [False, False],
    ...                [False, False]],
    ...               [[False, False], [False, False], [False, False],
    ...                [False, False]]],
    ...      'state': 'ongoing'}
    >>> dig_nd(g, (0, 3, 0))
    8
    >>> dump(g)
    board:
        [[3, '.'], [3, 3], [1, 1], [0, 0]]
        [['.', 3], [3, '.'], [1, 1], [0, 0]]
    dimensions: (2, 4, 2)
    mask:
        [[False, False], [False, True], [True, True], [True, True]]
        [[False, False], [False, False], [True, True], [True, True]]
    state: ongoing
    >>> g = {'dimensions': (2, 4, 2),
    ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
    ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
    ...      'mask': [[[False, False], [False, True], [False, False],
    ...                [False, False]],
    ...               [[False, False], [False, False], [False, False],
    ...                [False, False]]],
    ...      'state': 'ongoing'}
    >>> dig_nd(g, (0, 0, 1))
    1
    >>> dump(g)
    board:
        [[3, '.'], [3, 3], [1, 1], [0, 0]]
        [['.', 3], [3, '.'], [1, 1], [0, 0]]
    dimensions: (2, 4, 2)
    mask:
        [[False, True], [False, True], [False, False], [False, False]]
        [[False, False], [False, False], [False, False], [False, False]]
    state: defeat
    """ 
    board = game['board']
    mask = game['mask']
    dimensions = game['dimensions']
    if prev_checked == None:
        prev_checked = set()

    # checks for game state
    if game['state'] == 'defeat' or game['state'] == 'victory':
        return 0

    # checks if bomb
    if coord_to_cell_value(board, coordinates) == '.':
        set_cell(mask, coordinates, True)
        game['state'] = 'defeat'
        return 1


    # checks if selected cell is covered
    if coord_to_cell_value(mask, coordinates) != True:
        set_cell(mask, coordinates, True)
        revealed = 1
    else:
        return 0
        
    # if zero, digs surrounding cells
    if coord_to_cell_value(board, coordinates) == 0:
        # adds to a list of previously checked cells if haven't been checked yet
        if coordinates not in prev_checked:
            prev_checked.add(coordinates)
            # if the surrounding cell has not been revealed yet, dig
            surrounding_cells = dict_of_surrounding_cells(len(dimensions), coordinates, dimensions)[len(dimensions)]
            for cell_coord in surrounding_cells:
                mask_val = coord_to_cell_value(mask, cell_coord)
                if mask_val == False:
                    revealed += dig_nd(game, tuple(cell_coord), prev_checked, False)

    # checks if victory
    if check_for_victory:
        cell_coordinates = nd_coordinates(dimensions)
        covered_squares = 0
        # counts the number of non-bombs that are hidden
        for coord in cell_coordinates:
            if coord_to_cell_value(board, coord) != '.' and coord_to_cell_value(mask, coord) == False:
                covered_squares += 1
        # if all non-bombs are shown, victory
        if covered_squares == 0:
            game['state'] = 'victory'
    return revealed

def render_nd(game, xray=False):
    """
    Prepare the game for display.

    Returns an N-dimensional array (nested lists) of '_' (hidden squares),
    '.' (bombs), ' ' (empty squares), or '1', '2', etc. (squares
    neighboring bombs).  The mask indicates which squares should be
    visible.  If xray is True (the default is False), the mask is ignored
    and all cells are shown.

    Args:
       xray (bool): Whether to reveal all tiles or just the ones allowed by
                    the mask

    Returns:
       An n-dimensional array of strings (nested lists)

    >>> g = {'dimensions': (2, 4, 2),
    ...      'board': [[[3, '.'], [3, 3], [1, 1], [0, 0]],
    ...                [['.', 3], [3, '.'], [1, 1], [0, 0]]],
    ...      'mask': [[[False, False], [False, True], [True, True],
    ...                [True, True]],
    ...               [[False, False], [False, False], [True, True],
    ...                [True, True]]],
    ...      'state': 'ongoing'}
    >>> render_nd(g, False)
    [[['_', '_'], ['_', '3'], ['1', '1'], [' ', ' ']],
     [['_', '_'], ['_', '_'], ['1', '1'], [' ', ' ']]]

    >>> render_nd(g, True)
    [[['3', '.'], ['3', '3'], ['1', '1'], [' ', ' ']],
     [['.', '3'], ['3', '.'], ['1', '1'], [' ', ' ']]]
    """
    def render(board, mask):
        # renders locations in any dimension
        # if last dimension, reveal cell depending on mask
        if type(mask[0]) == bool:
            return [ ' ' if board[i]==0 and (mask[i] or xray) else str(board[i]) if (mask[i] or xray) else '_' for i in range(len(mask)) ]
        board_dim = []
        for i in range(len(board)):
            # concatenate this element's previous dimension render
            board_dim.append(render(board[i], mask[i]))
        return board_dim
    return render(game['board'], game['mask'])


if __name__ == "__main__":
    # Test with doctests. Helpful to debug individual lab.py functions.
    import doctest
    _doctest_flags = doctest.NORMALIZE_WHITESPACE | doctest.ELLIPSIS
    doctest.testmod(optionflags=_doctest_flags)  # runs ALL doctests
    # dimensions = (2, 4, 2)
    # bombs = [(0, 0, 1), (1, 0, 0), (1, 1, 1)]
    # print(new_game_nd(dimensions, bombs))
    # Alternatively, can run the doctests JUST for specified function/methods,
    # e.g., for render_2d_locations or any other function you might want.  To
    # do so, comment out the above line, and uncomment the below line of code.
    # This may be useful as you write/debug individual doctests or functions.
    # Also, the verbose flag can be set to True to see all test results,
    # including those that pass.
    #
    # doctest.run_docstring_examples(
    #    render_2d_locations,
    #    globals(),
    #    optionflags=_doctest_flags,
    #    verbose=False
    # )
