#!/usr/bin/env python3
"""6.009 Lab 8: Carlae (LISP) Interpreter"""

import doctest

# NO ADDITIONAL IMPORTS!

class Environment():
    def __init__(self, name, parent):
        self.name = name
        self.values = {}
        self.parent = parent

    def set_value(self, name, val):
        # sets the value of a variable name to val
        self.values[name] = val

    def add_values(self, values):
        # adds values (dict) to the existing dictionary of variables: values 
        self.values = self.values | values
    
    def get_value(self, name):
        # get value from current environment, if not existing check parent environment
        try:
            return self.values[name]
        except:
            try:
                return self.parent.get_value(name)
            except:
                raise CarlaeNameError


class user_defined_func():
    def __init__(self, params, exp, env):
        self.params = params
        self.expression = exp
        self.environment = env

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
            print(name.isnumeric())
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
    >>> parse(['(', '+', '2', '(', '-', '5', '3', ')', '7', '8', ')'])
    """
    # error if number of parenthasis don't match
    if tokens.count('(') != tokens.count(')'):
        raise CarlaeSyntaxError
    # error if expression doesn't start with parenthasis
    if len(tokens) > 1 and tokens[0] != '(':
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
            # error if not three elements in lambda expression, if second element is not a list, or if invalid names in second element
            if len(parsed_expression) != 3 or not isinstance(parsed_expression[1], list) or invalid_name(parsed_expression[1]):
                raise CarlaeSyntaxError
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

snek_builtins = {
    "+": sum,
    "-": lambda args: -args[0] if len(args) == 1 else (args[0] - sum(args[1:])),
    "*": multiply,
    "/": divide,
}

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
    # assigns current environment
    if not environment:
        empty_env = create_environment()
        current_env = empty_env
    else:
        current_env = environment

    # if a single value (not an expression)
    if not isinstance(tree, list):
        # return the result of the associated operation or the number if in environment
        while current_env:
            if tree in current_env.values:
                return current_env.values[tree]
            if isinstance(tree, int) or isinstance(tree, float):
                return tree
            current_env = current_env.parent
        raise CarlaeNameError

    # when defining, store value to variable in current environment
    if tree[0] == ':=':
        if isinstance(tree[1], list) and len(tree[1]) > 0:
            tree[2] = ['function', tree[1][1:] if tree[1][1:] else [], tree[2]]
            tree[1] = tree[1][0]
        val = evaluate(tree[2], current_env)
        current_env.add_values({tree[1]: val})
        return val

    # if a user defined function, creates a user_defined_function object
    if tree[0] == 'function':
        function = user_defined_func(tree[1], tree[2], current_env)
        return function

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
            print(2)
            raise CarlaeEvaluationError
    # evaluate all other elements 
    for element in tree[1:]:
        new_tree.append(evaluate(element, current_env))
    # if the function is a user defined function
    if isinstance(func, user_defined_func):
        # make a new environment with lexical scoping
        new_environment = create_environment(parent=func.environment)
        # bind the function's parameters to the arguments that are passed to it.
        try:
            if len(new_tree) != len(func.params):
                print(3)
                raise CarlaeEvaluationError
            for param_ind in range(len(func.params)):
                new_environment.add_values({func.params[param_ind]: new_tree[param_ind]})
        except:
            print(4)
            raise CarlaeEvaluationError
        # evaluate the body of the function in that new environment
        return evaluate([':=', 'temp', func.expression], new_environment)
    return evaluate(tree[0], current_env)(new_tree)

def REPL():
    while True: 
        inp = input('in> ')
        if inp == 'QUIT':
            break
        tokens = tokenize(inp)
        parsed = parse(tokens)
        print('out> ', evaluate(parsed))


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
    return evaluated, environment

if __name__ == "__main__":
    # code in this block will only be executed if lab.py is the main file being
    # run (not when this module is imported)

    # uncommenting the following line will run doctests from above
    doctest.testmod()
    REPL()
    pass
