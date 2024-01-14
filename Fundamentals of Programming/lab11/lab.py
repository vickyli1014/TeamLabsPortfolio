"""6.009 Lab 10: Snek Is You Video Game"""

import doctest

# NO ADDITIONAL IMPORTS!

# All words mentioned in lab. You can add words to these sets,
# but only these are guaranteed to have graphics.
NOUNS = {"SNEK", "FLAG", "ROCK", "WALL", "COMPUTER", "BUG"}
PROPERTIES = {"YOU", "WIN", "STOP", "PUSH", "DEFEAT", "PULL"}
WORDS = NOUNS | PROPERTIES | {"AND", "IS"}
GAME_YOU = None

# Maps a keyboard direction to a (delta_row, delta_column) vector.
direction_vector = {
    "up": (-1, 0),
    "down": (+1, 0),
    "left": (0, -1),
    "right": (0, +1),
}

class Objects():
    def can_move(self, b, direction):
        # returns if passed object is allowed to move
        current_pos = self.pos
        new_pos = (current_pos[0] + direction_vector[direction][0], current_pos[1] + direction_vector[direction][1])
        # if they are moving to a valid position on the board
        if new_pos not in b.board:
            return False
        # if the new position doesn't have an object that stops
        for obj in b.board[new_pos]:
            if isinstance(obj, graphical):
                if obj.family.rules['STOP']:
                    return False
        # if the things in the new position can move
        for obj in b.board[new_pos]:
            if (isinstance(obj, graphical) and (obj.family.rules['PUSH']) or isinstance(obj, Text)) and not obj.can_move(b, direction):
                return False
        return True

    def change_position(self, b, current, new):
        # move given object from current to new position
        b.board[new].append(self)
        b.board[current].remove(self)
        self.pos = new

    def delete(self, b):
        # deletes given object from the board
        b.objects.remove(self)
        b.board[self.pos].remove(self)
        self.pos = None
        self.family.instances.remove(self)

    def move(self, b, direction, pulled=False):
        pushed = False
        current_obj = self
        current_pos = self.pos
        new_pos = (current_pos[0] + direction_vector[direction][0], current_pos[1] + direction_vector[direction][1])
        can_pull = sum([ isinstance(i, graphical) and i.family.rules['PULL'] for i in b.board[current_pos] ]) > 0
        # if doesn't go off bound
        if new_pos in b.board and self.can_move(b, direction):
            for obj in b.board[new_pos]:
                if isinstance(obj, Text) or (obj.family.rules['PUSH']):
                    pushed = True
                    obj.move(b, direction, True)
            # change location of current object
            # if not already moved from a previous move
            for obj in b.board[new_pos]:
                if isinstance(obj, graphical) and obj.family.rules['DEFEAT']:
                    self.delete(b)
                    break
            # if not already moved by a different object
            if current_obj in b.board[current_pos]:
                self.change_position(b, current_pos, new_pos)
            # pull any objects that can be pulled
            behind = (current_pos[0] - direction_vector[direction][0], current_pos[1] - direction_vector[direction][1])
            # if something has not been pulled already by a push
            if behind in b.board and (not can_pull or (can_pull and not pushed)):
                # if something in this position can be pulled, makes sure the first element becomes that
                for j in range(len(b.board[behind])):
                    obj = b.board[behind][j]
                    if isinstance(obj, graphical) and obj.family.rules['PULL']:
                        if j != 0:
                            temp = b.board[behind][0]
                            b.board[behind][0] = obj
                            b.board[behind][j] = temp
                # starting from the last element, moves all elements forward
                # for the first element, pulls if it can
                for i in reversed(range(len(b.board[behind]))):
                    obj = b.board[behind][i]
                    if isinstance(obj, graphical) and obj.family.rules['PULL']:
                        if i == 0:
                            x = obj.move(b, direction, pulled)
                        else:
                            obj.change_position(b, behind, current_pos)
            return True
        return False

    def group(self, b, change, t):
        # when parsing, group text separated by conjunctions
        current_pos = self.pos
        parse_queue = [self]
        conj_pos = (current_pos[0] + change[0], current_pos[1] + change[1])
        property_pos = (conj_pos[0] + change[0], conj_pos[1] + change[1])
        # while connected by a conjunction and of the proper type
        while (conj_pos in b.board and b.board[conj_pos] != []) and (property_pos in b.board and b.board[property_pos] != []) and isinstance(b.board[conj_pos][0], Conjunction) and isinstance(b.board[property_pos][0], t):
            parse_queue += b.board[property_pos]
            conj_pos = (property_pos[0] + change[0], property_pos[1] + change[1])
            property_pos = (conj_pos[0] + change[0], conj_pos[1] + change[1])
        return parse_queue, conj_pos
        
class b():
    def __init__(self, level_description):
        self.board = dict()
        self.width, self.height = len(level_description[0]), len(level_description)
        self.objects = []
        self.nouns = dict()
        self.props = dict()
        # for each item at each position, create an object for it and store it
        for i in range(self.height):
            for j in range(self.width):
                pos = level_description[i][j]
                if pos == []:
                    self.board[(i, j)] = []
                temp = []
                for item in pos:
                    if item.islower():
                        a = graphical(item, (i, j))
                        temp.append(a)
                        self.objects.append(a)
                    elif item == 'IS':
                        a = Verb((i, j))
                        temp.append(a)
                        self.objects.append(a)
                    elif item == 'AND':
                        a = Conjunction((i, j))
                        temp.append(a)
                        self.objects.append(a)
                    elif item in PROPERTIES:
                        a = Prop(item, (i, j))
                        temp.append(a)
                        self.objects.append(a)
                        self.props[item] = a
                    else:
                        a = Noun(item, (i, j))
                        temp.append(a)
                        self.objects.append(a)
                        self.nouns.setdefault(item, []).append(a)
                self.board[(i, j)] = temp  

class graphical(Objects):
    def __init__(self, t, pos):
        self.type = t
        self.pos = pos

    def add_instance(self, board):
        # store each instance within its family object
        types = ['snek', 'flag', 'rock', 'wall', 'bug', 'computer']
        for t in types:
            if self.type == t: 
                if t.upper() in board.nouns:
                    for each in board.nouns[t.upper()]:
                        each.instances.append(self)
                        self.family = board.nouns[t.upper()][0]
                # if noun not on board, make a temporary one
                else:
                    temp = Noun(t.upper(), None)
                    self.family = temp
                break

class Text(Objects):
    def __init__(self):
        pass

class Noun(Text):
    def __init__(self, t, pos):
        self.type = t
        self.pos = pos
        self.rules = {
            'YOU': False,
            'STOP': False, 
            'PUSH': False,
            'PULL': False,
            'DEFEAT': False,
            'WIN': False}
        self.instances = list()

    def change_rule(self, prop, board):
        # change the rules of the game depending on the parsing
        temp = {
            'YOU': False,
            'STOP': False, 
            'PUSH': False,
            'PULL': False,
            'DEFEAT': False,
            'WIN': False}
        for rule in self.rules:
            # if noun is you, store it into the you property 
            if prop == 'YOU' and self.type not in board.props['YOU'].obj_type:
                board.props['YOU'].obj.add(self)
                board.props['YOU'].obj_type.add(self.type)
            if prop == rule:
                self.rules[rule] = True

            # change game depending on multiple rules
            every = board.nouns[self.type]
            for each in every:
                for i in each.rules.keys():
                    if each.rules[i] == True:
                        temp[i] = True
            # if both stop and push, prioritize push
            if temp['STOP'] and temp['PUSH']:
                for each in every:
                    each.rules['STOP'] = False
                break
            # if both you and defeat, delete 
            if temp['YOU'] and temp['DEFEAT']:
                for i in reversed(range(len(self.instances))):
                    self.instances[i].delete(board)
                break
            # if you and win, set rules accordingly
            if temp['YOU'] and temp['WIN']:
                for each in every:
                    each.rules['YOU'] = True
                    each.rules['WIN'] = True
                break
            # for nouns with multiple blocks, make the rules for both the same
            for each in every:
                for i in temp.keys():
                    if temp[i]:
                        each.rules[i] = True

    def parse(self, b):
        current_pos = self.pos
        # only parse right and down
        parse_direction = [(0, 1), (1, 0)]
        parse_queue = [self]
        for change in parse_direction:
            # create a group before the verb (for nouns)
            temp = self.group(b, change, Noun)
            noun_group, verb_pos = temp[0], temp[1]
            property_pos = (verb_pos[0] + change[0], verb_pos[1] + change[1])
            if verb_pos in b.board and b.board[verb_pos] != [] and isinstance(b.board[verb_pos][0], Verb) and property_pos in b.board and b.board[property_pos] != []:
                # create a group after the verb
                prop_group = b.board[property_pos][0].group(b, change, Prop)[0]
                prop_group += b.board[property_pos][0].group(b, change, Noun)[0]
                for prop in prop_group:
                    # if word is a property, change rules accordingly
                    if isinstance(prop, Prop):
                        for each in noun_group:
                            each.change_rule(prop.type, b)
                    # if word is a noun, change the object to that noun        
                    if isinstance(prop, Noun):
                        for each in noun_group:
                            for instance in each.instances:
                                instance.type = prop.type.lower()
                                each.instances.remove(instance)
                                prop.instances.append(instance)

    def move_instances(self, b, direction):
        # order of movement depends on direction
        positions = [ i.pos for i in self.instances ]
        if direction == 'left':
            positions.sort(reverse=True)
        if direction == 'right': 
            positions.sort()
        if direction == 'up':
            positions.sort(key=lambda a: a[1], reverse=True)
        if direction == 'down':
            positions.sort(key=lambda a: a[1])
        temp = []
        for i in positions:
            for j in self.instances:
                if j.pos == i:
                    temp.append(j)
                    self.instances.remove(j)
        self.instances = temp
        # move all instances of the noun
        for i in reversed(range(len(self.instances))):
            self.instances[i].move(b, direction)

class Prop(Text):
    def __init__(self, t, pos):
        self.type = t
        self.pos = pos
        self.obj = set()
        self.obj_type = set()

class Verb(Text):
    def __init__(self, pos):
        self.pos = pos
        self.type = "IS"

class Conjunction(Text):
    def __init__(self, pos):
        self.pos = pos
        self.type = "AND"

def new_game(level_description):
    """
    Given a description of a game state, create and return a game
    representation of your choice.

    The given description is a list of lists of lists of strs, where UPPERCASE
    strings represent word objects and lowercase strings represent regular
    objects (as described in the lab writeup).

    For example, a valid level_description is:

    [
        [[], ['snek'], []],
        [['SNEK'], ['IS'], ['YOU']],
    ]

    The exact choice of representation is up to you; but note that what you
    return will be used as input to the other functions.
    """
    # represent the board as a board object
    board = b(level_description)
    # add instances of graphicals to its family object
    for obj in board.objects:
        if isinstance(obj, graphical):
            obj.add_instance(board)
    return board


def step_game(game, direction):
    """
    Given a game representation (as returned from new_game), modify that game
    representation in-place according to one step of the game.  The user's
    input is given by direction, which is one of the following:
    {'up', 'down', 'left', 'right'}.

    step_game should return a Boolean: True if the game has been won after
    updating the state, and False otherwise.
    """
    # reset rules and reparse
    game.props['YOU'].obj, game.props['YOU'].obj_type = set(), set()
    for k, v in game.nouns.items():
        for noun in v:
            for rule in noun.rules:
                noun.rules[rule] = False
            noun.parse(game)
    you = game.props['YOU'].obj
    for i in you:
        i.move_instances(game, direction)
    # parse again after moving
    game.props['YOU'].obj, game.props['YOU'].obj_type = set(), set()
    for k, v in game.nouns.items():
        for noun in v:
            for rule in noun.rules:
                noun.rules[rule] = False
            noun.parse(game)
    # check for victory
    you = game.props['YOU'].obj
    for i in you:
        for instance in i.instances:
            position = instance.pos
            for item in game.board[position]:
                if isinstance(item, graphical) and item.family.rules['WIN']:
                    return True
    return False


def dump_game(game):
    """
    Given a game representation (as returned from new_game), convert it back
    into a level description that would be a suitable input to new_game.

    This function is used by the GUI and tests to see what your game
    implementation has done, and it can also serve as a rudimentary way to
    print out the current state of your game for testing and debugging on your
    own.
    """
    new_board = [ [ [None] for i in range(game.width)] for i in range(game.height) ]
    for k, v in game.board.items():
        i, j = k[0], k[1]
        if v == []:
            new_board[i][j] = []
        else:
            temp = []
            for item in v:
                temp.append(item.type)
            new_board[i][j] = temp
    return new_board

if __name__ == '__main__':
    # code in this block will only be executed if lab.py is the main file being
    # run (not when this module is imported)

    # uncommenting the following line will run doctests from above
    doctest.testmod()
    # l = [[[], ['snek'], []], [['SNEK'], ['IS'], ['YOU']]]
    # game = b(l)
    # print(dump_game(game))