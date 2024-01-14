"""6.009 Lab 9: Snek Interpreter Part 2"""

import sys
sys.setrecursionlimit(5000)
import doctest

# NO ADDITIONAL IMPORTS!

class Environment():
    def __init__(self, name, parent):
        self.name = name
        self.values = {'nil': 'nil'}
        self.parent = parent

    def set_value(self, name, val):
        # sets the value of a variable name to val
        self.values[name] = val

    def add_values(self, values):
        # adds values (dict) to the existing dictionary of variables: values 
        self.values = self.values | values
    
    def get_value(self, name):
        # get value from current environment, if not existing check parent environment
        if name in self.values:
            return self.values[name]
        else:
            if self.parent == None:
                raise CarlaeNameError
            return self.parent.get_value(name)

    def del_value(self, key):
        # delete value from the current environment, if not existing check parent environment
        if key in self.values:
            return self.values.pop(key)
        else:
            if self.parent == None:
                raise CarlaeNameError
            return self.parent.del_value(key)

    def get_val_env(self, name):
        # get value from the current environment, if not existing check parent environment
        if self.get_value(name):
            return self
        else:
            if self.parent == None:
                raise CarlaeNameError
            return self.parent.get_val_env(name)

class user_defined_func():
    def __init__(self, params, exp, env):
        self.params = params
        self.expression = exp
        self.environment = env
        
    def get_params(self):
        return self.params

    def get_expression(self):
        return self.expression

    def get_environment(self):
        return self.environment

    def execute(self, args):
        param = self.get_params()
        exp = self.get_expression()
        env = self.get_environment()
        # make a new environment with lexical scoping
        new_environment = create_environment(parent=env)
        # bind the function's parameters to the arguments that are passed to it.
        if len(args) != len(param):
            print(9)
            raise CarlaeEvaluationError
        for param_ind in range(len(param)):
            new_environment.add_values({param[param_ind]: args[param_ind]})
        # evaluate the body of the function in that new environment
        return evaluate(exp, new_environment)

        
class Pair():
    def __init__(self, head, tail):
        self.head = head
        self.tail = tail
    
    def get_head(self):
        return self.head

    def get_tail(self):
        return self.tail

    def set_head(self, new):
        self.head = new

    def set_tail(self, new):
        self.tail = new

    # def __str__(self):
    #     tot = []
    #     node = self
    #     while node != 'nil' or node != None:
    #         try:
    #             tot.append(node.head)
    #             node = node.tail
    #         except: 
    #             tot.append(node)
    #             node = None
    #     if node == 'nil':
    #         tot.append('nil')
    #     return str(tot)



###########################
# Carlae-related Exceptions #
###########################


class CarlaeError(Exception):
    """
    A type of exception to be raised if there is an error with a Carlae
    program.  Should never be raised directly; rather, subclasses should be
    raised.
    """

    pass


class CarlaeSyntaxError(CarlaeError):
    """
    Exception to be raised when trying to evaluate a malformed expression.
    """

    pass


class CarlaeNameError(CarlaeError):
    """
    Exception to be raised when looking up a name that has not been defined.
    """

    pass


class CarlaeEvaluationError(CarlaeError):
    """
    Exception to be raised if there is an error during evaluation other than a
    CarlaeNameError.
    """

    pass

    """
    Exception to be raised if there is an error during evaluation other than a
    CarlaeNameError.
    """
    pass


############################
# Tokenization and Parsing #
############################


def number_or_symbol(x):
    """
    Helper function: given a string, convert it to an integer or a float if
    possible; otherwise, return the string itself

    >>> number_or_symbol('8')
    8
    >>> number_or_symbol('-5.32')
    -5.32
    >>> number_or_symbol('1.2.3.4')
    '1.2.3.4'
    >>> number_or_symbol('x')
    'x'
    """
    try:
        return int(x)
    except ValueError:
        try:
            return float(x)
        except ValueError:
            return x


def invalid_name(name):
    # if arg is a list check if each element is valid
    if isinstance(name, list):
        for each in name:
            if invalid_name(each):
                return True
    # invalid name if number
    if isinstance(name, int) or isinstance(name, float):
        return True
    # if name is string, invalid if number or contains ()\s
    if isinstance(name, str):
        if name.isnumeric() or set(name).intersection(set('() ')):
            return True


def tokenize(source):
    """
    Splits an input string into meaningful tokens (left parens, right parens,
    other whitespace-separated values).  Returns a list of strings.

    Arguments:
        source (str): a string containing the source code of a Snek
                      expression

    >>> tokenize("(cat (dog (tomato)))")
    ['(', 'cat', '(', 'dog', '(', 'tomato', ')', ')', ')']
    """
    # print('source: ', source)
    outp = []
    i = 0
    temp = ''
    comment = False
    while i < len(source):
        char = source[i]
        if char == '#':
            comment = True
            i += 1
            continue
        if char == '\n':
            comment = False
            char = ' '
        if comment:
            i += 1
            continue
        # check for negative signs and periods to add to temp
        if (char == '-' and source[i+1] != ' ') or char == '.':
            temp += char
            i += 1
            continue
        # add numbers to temp 
        try:
            int(char)
            temp += char
        # when character is not an int
        except:
            special_chars = '() '
            if char not in special_chars:
                temp += char
            else:
                # append tokenized int/float to outp
                if temp != '':
                    outp.append(temp)
                    temp = ''
                # check for exponentials
                if char == '*' and source[i+1] == '*':
                    outp.append('**')
                    i += 2
                    continue
                # append non-whitespace token to outp
                if char != ' ':
                    outp.append(char)
        i += 1
    if temp != '' and temp != '\n':
        outp.append(temp)
    # print(outp)
    return outp


def parse(tokens):
    """
    Parses a list of tokens, constructing a representation where:
        * symbols are represented as Python strings
        * numbers are represented as Python ints or floats
        * S-expressions are represented as Python lists

    Arguments:
        tokens (list): a list of strings representing tokens

    >>> tokens = tokenize("(cat (dog (tomato)))")
    >>> parse(tokens)
    ['cat', ['dog', ['tomato']]]
    >>> tokens = tokenize('(:= five (function () (+ 2 3 )))')
    >>> parse(tokens)
    """
    # error if number of parenthasis don't match
    if tokens.count('(') != tokens.count(')'):
        print(1)
        raise CarlaeSyntaxError
    # error if expression doesn't start with parenthasis
    if len(tokens) > 1 and tokens[0] != '(':
        print(2)
        raise CarlaeSyntaxError
    def parse_expression(index):
        if index < len(tokens):
            token = tokens[index]
            # return term
            if token != '(' and token != ')':
                if token == ':=':
                    return ':=', index+1 
                if token == 'function':
                    return 'function', index+1
                if token == 'and':
                    return 'and', index+1
                if token == 'or':
                    return 'or', index+1
                if token == 'if':
                    return 'if', index+1
                if token == 'list':
                    return 'list', index+1
                return number_or_symbol(token), index+1
            # indicate end of expression
            elif token == ')':
                return None, index+1
            # start of expression
            else:
                sexp = []
                el, ind = parse_expression(index+1)
                # add terms into expression list until the end
                while el != None:
                    sexp.append(el)
                    el, ind = parse_expression(ind)
                return sexp, ind
        # error if there is no matching closing parenthasis
        raise CarlaeSyntaxError
    parsed_expression, next_index = parse_expression(0)
    if isinstance(parsed_expression, list):
        if ':=' in parsed_expression: 
            # error if not three elements in define expression
            if len(parsed_expression) != 3:
                raise CarlaeSyntaxError
            # error if name is invalid
            if invalid_name(parsed_expression[1]):
                raise CarlaeSyntaxError
            # error if second element is a list not containing one or more valid names
            if (isinstance(parsed_expression[1], list)):
                if len(parsed_expression[1])<=0:
                    raise CarlaeSyntaxError
                if invalid_name(parsed_expression[1]):
                    raise CarlaeSyntaxError
        if 'function' in parsed_expression: 
            # error if not three elements in function expression, if second element is not a list, or if invalid names in second element
            if len(parsed_expression) != 3 or not isinstance(parsed_expression[1], list) or invalid_name(parsed_expression[1]):
                raise CarlaeSyntaxError
    (parsed_expression)
    return parsed_expression

######################
# Built-in Functions #
######################

def multiply(tree):
    prod = 1
    for leaf in tree:
        prod *= (leaf)
    return prod

def divide(tree):
    quot = tree[0]
    for leaf in tree[1:]:
        quot /= leaf
    return quot

def all_true(tree):
    first = tree[0]
    for leaf in tree[1:]:
        if leaf != first:
            return False
    return True

def decreasing(tree):
    current = tree[0]
    for leaf in tree[1:]:
        if leaf >= current:
            return False
        current = leaf
    return True

def nonincreasing(tree):
    current = tree[0]
    for leaf in tree[1:]:
        if leaf > current:
            return False
        current = leaf
    return True

def increasing(tree):
    current = tree[0]
    for leaf in tree[1:]:
        if leaf <= current:
            return False
        current = leaf
    return True

def nondecreasing(tree):
    current = tree[0]
    for leaf in tree[1:]:
        if leaf < current:
            return False
        current = leaf
    return True

def not_(tree):
    if len(tree) != 1:
        raise CarlaeEvaluationError
    return not tree[0]

def head(tree):
    if len(tree) != 1:
        raise CarlaeEvaluationError
    try:
        return tree[0].get_head()
    except: 
        raise CarlaeEvaluationError

def tail(tree):
    if len(tree) != 1:
        raise CarlaeEvaluationError
    try:
        return tree[0].get_tail()
    except:
        raise CarlaeEvaluationError

def list_check(tree):
    if not isinstance(tree, list):
        tree = [tree]
    if (isinstance(tree[0], Pair) and tree[0].tail == 'nil') or tree[0] == 'nil':
        return True
    if isinstance(tree[0], Pair):
        return list_check(tree[0].tail)
    return False

def length(tree):
    l = 0
    tail = tree[0]
    # loops through the linked list and increments count
    while tail:
        if not isinstance(tail, Pair) and not tail == 'nil':
            raise CarlaeEvaluationError
        if tail == 'nil':
            tail = None
        else:
            l += 1
            tail = tail.get_tail()
    return l

def nth(tup):
    '''
    parameters: 
        tup (tuple): tuple of (list, index)
    returns the element at given index in the list
    '''
    tree, ind = tup[0], tup[1]
    # error if not a list
    if not isinstance(tree, Pair):
        raise CarlaeEvaluationError
    pair = tree
    rtn = pair.get_head()
    # iterates through list until reaches ind_th element
    for i in range(ind, -1, -1):
        try:
            rtn = pair.get_head()
            pair = pair.get_tail()
        # error if index > len(list)
        except:
            print(4)
            raise CarlaeEvaluationError
    return rtn

def copy(tree):
    '''
    >>> copy(Pair(2, Pair(3, [])))
    '''
    # makes a copy of a list
    if tree == 'nil':
        return 'nil'
    head = tree.get_head()
    tail = tree.get_tail()
    if not tail:
        return Pair(head, tail)
    x = copy(tail)
    return Pair(head, x)

def concat(trees):
    try:
        # removes empty lists
        trees = [tree for tree in trees if not tree == 'nil']
        # if empty list then return empty list
        if len(trees) == 0:
            return evaluate(['list'])
        all = copy(trees[0])
        # loop through each list and add it into a superlist
        for tree in trees[1:]:
            l = length([all])
            pair = all
            for i in range(l-1, 0, -1):
                try:
                    pair = pair.get_tail()
                except:
                    raise CarlaeEvaluationError
            tree_copy = copy(tree)
            pair.set_tail(tree_copy)
        return all
    except:
        raise CarlaeEvaluationError

def map_to(inp):
    try:
        func, tree = inp[0], inp[1]
        new = copy(tree)
        pair = new
        # loops into the loop and applies the function on each value before returning 
        while pair and not pair == 'nil':
            if isinstance(func, user_defined_func):
                x = (evaluate([['function', func.get_params(), func.get_expression()], pair.get_head()], func.get_environment()))
                pair.set_head(x)
            else:
                pair.set_head(func([pair.get_head()]))
            pair = pair.get_tail()
        return new
    except:
        raise CarlaeEvaluationError

def filt(inp):
    func, tree = inp[0], inp[1]
    new = 'nil'
    tail = new
    cop = tree
    # loop through all elements in list
    while cop and not cop == 'nil':
        pair = Pair(cop.get_head(), 'nil')
        # only add into new list if map_to function returns True
        if map_to((func, pair)).get_head():
            if new == 'nil':
                new = pair
                tail = new
            else:
                tail.set_tail(pair)
                tail = tail.get_tail()
        cop = cop.get_tail()
    return new

def redu(inp):
    try:
        func, lst, initval = inp[0], inp[1], inp[2]
        result = initval
        pair = lst
        # for each value in the list operate between value and initial value
        while pair and not pair == 'nil':
            if isinstance(func, user_defined_func):
                result = evaluate([['function', func.get_params(), func.get_expression()], result, pair.get_head()], func.get_environment())
            else:
                result = func((result, pair.get_head()))
            pair = pair.get_tail()
        return result
    except:
        raise CarlaeEvaluationError
    
def begin(inp):
    return inp[-1]

snek_builtins = {
    "+": sum,
    "-": lambda args: -args[0] if len(args) == 1 else (args[0] - sum(args[1:])),
    "*": multiply,
    "/": divide,
    '@f': False,
    '@t': True,
    '=?': all_true,
    '>': decreasing,
    '>=': nonincreasing,
    '<': increasing,
    '<=': nondecreasing,
    'not': not_,
    'head': head,
    'tail': tail,
    'list?': list_check,
    'length': length,
    'nth': nth,
    'concat': concat,
    'map': map_to,
    'filter': filt,
    'reduce': redu,
    'begin': begin,
}

def evaluate_file(f, env = None):
    if not env:
        env = create_environment()
    with open(f, 'r') as file:
        inp = ''
        for line in file:
            inp += line
    token = tokenize(inp)
    parsed = parse(token)
    result = evaluate(parsed, env)
    return result

# global environment called built_in
built_in = Environment('built-in', None)
built_in.add_values(snek_builtins)


##############
# Evaluation #
##############

def create_environment(name='empty', parent=built_in):
    # Creates an empty environment with default name empty and default parent built_in
    return Environment(name, parent)


def evaluate(tree, environment=None):
    """
    Evaluate the given syntax tree according to the rules of the Snek
    language.

    Arguments:
        tree (type varies): a fully parsed expression, as the output from the
                            parse function
        environment (Environemnt object): environment in which the expression is evaluated in

    >>> evaluate(['+', 3, ['-', 7, 5]])
    5
    """
    # evalerror if nothing passed in
    if isinstance(tree, list) and len(tree) == 0:
        print(7)
        raise CarlaeEvaluationError
    
    # assigns current environment
    if not environment:
        empty_env = create_environment()
        current_env = empty_env
    else:
        current_env = environment

    # if a single value (not an expression)
    if not isinstance(tree, list):
        if isinstance(tree, Pair):
            return tree
        # return the result of the associated operation or the number if in environment
        while current_env:
            if tree in current_env.values:
                return current_env.values[tree]
            if isinstance(tree, int) or isinstance(tree, float):
                return tree
            current_env = current_env.parent
        print(17)
        raise CarlaeNameError

    # when defining, store value to variable in current environment
    if tree[0] == ':=': 
        if isinstance(tree[1], list) and len(tree[1]) > 0:
            exp = ['function', tree[1][1:] if tree[1][1:] else [], tree[2]]
            name = tree[1][0]
            val = evaluate(exp, current_env)
            current_env.add_values({name: val})
        else:
            val = evaluate(tree[2], current_env)
            current_env.add_values({tree[1]: val})
        return val

    # if a user defined function, creates a user_defined_function object
    if tree[0] == 'function': 
        function = user_defined_func(tree[1], tree[2], current_env)
        return function

    # if checking and, checks that all elements in the list are True
    if tree[0] == 'and':
        for leaf in tree[1:]:
            if not evaluate(leaf, current_env):
                return False
        return True

    # if checking or, checks that there is one True in list
    if tree[0] == 'or':
        for leaf in tree[1:]:
            if evaluate(leaf, current_env):
                return True
        return False

    # for if statements, return based on if condition is fulfilled
    if tree[0] == 'if':
        cond = evaluate(tree[1], current_env)
        if cond:
            return evaluate(tree[2], current_env)
        return evaluate(tree[3], current_env)
        
    # when calling pair, creates a Pair object
    if tree[0] == 'pair':
        if len(tree) != 3:
            raise CarlaeEvaluationError
        head = evaluate(tree[1], current_env)
        tail = evaluate(tree[2], current_env)
        construct = Pair(head, tail)
        return construct

    # when constructing a list, creates a linked list
    if tree[0] == 'list':
        if len(tree) == 1:
            return evaluate('nil', current_env)
        if len(tree) == 2:
            return evaluate(['pair', (tree[1]), 'nil'], current_env)
        vals = ' '.join(str(item) for item in tree[2:])
        con = evaluate(['pair', (tree[1]), ['list'] + tree[2:]], current_env)
        return con

    # deletes the value in the environment
    if tree[0] == 'del':
        try:
            return current_env.values.pop(tree[1])
        except:
            raise CarlaeNameError

    # creates a local environment and defines variables in the environment
    if tree[0] == 'let':
        local = create_environment(parent=current_env)
        vars, body = tree[1], tree[2]
        for var in vars:
            evaluate([':=', var[0], var[1]], local)
        return evaluate(body, local)

    # evaluates expression in current value, then binds the value to the variable in the closest env
    if tree[0] == 'set!':
        var, expr = tree[1], tree[2]
        new_expr = evaluate(expr, current_env)
        def get_val_env(env, name):
            try:
                return env.values[name], env
            except:
                try:
                    return get_val_env(env.parent, name)
                except:
                    raise CarlaeNameError
        val, env = get_val_env(current_env, var)
        env.set_value(var, new_expr)
        return new_expr

    # nested expressions
    new_tree = []
    # evaluate all arguments
    # if the first element is an s-expression evaluate it
    if isinstance(tree[0], list):
        func = evaluate(tree[0], current_env)
    else:
        try:
            func = current_env.get_value(tree[0])
        # if the first element is not a valid function raise error
        except:
            if isinstance(tree[0], str):
            # if not isinstance(tree[0], int) and not isinstance(tree[0], float):
                raise CarlaeNameError
            raise CarlaeEvaluationError
    # evaluate all other elements 
    for element in tree[1:]:
        new_tree.append(evaluate(element, current_env))
    # if the function is a user defined function
    if isinstance(func, user_defined_func):
        return func.execute(new_tree)
        # evaluate the body of the function in that new environment
        return evaluate(func.expression, new_environment)
    try: 
        x = func(new_tree)
        print('func: ', func)
        print('x: ', x)
        return x
    except:
        return evaluate(tree[0], current_env)(new_tree)

def REPL():
    current_env = create_environment()
    while True: 
        inp = input('in> ')
        if inp == 'QUIT':
            break
        tokens = tokenize(inp)
        parsed = parse(tokens)
        print('out> ', evaluate(parsed, current_env))


def result_and_env(tree, environment=None):
    '''
    Evaluate the given syntax tree according to the rules of the Snek
    language. Returns the result and the evnironment in which the expression
    was evaluated

    Arguments:
        tree (type varies): a fully parsed expression, as the output from the
                            parse function
        environment (Environemnt object): environment in which the expression is evaluated in

    Returns:
        evaluated: the evaluated expression/result of tree
        environment: the environment in which the tree is evaluated in
    '''
    # create new environment if not specified
    if not environment: 
        environment = create_environment()
    evaluated = evaluate(tree, environment)
    # print('evaulated: ', evaluated)
    return evaluated, environment

if __name__ == "__main__":
    # code in this block will only be executed if lab.py is the main file being
    # run (not when this module is imported)
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            evaluate_file(arg, built_in)
    # uncommenting the following line will run doctests from above
    doctest.testmod()
    REPL()
    pass
