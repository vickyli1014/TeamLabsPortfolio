import doctest

# NO ADDITIONAL IMPORTS ALLOWED!
# You are welcome to modify the classes below, as well as to implement new
# classes and helper functions as necessary.


class Symbol:
    def __add__(self, other):
        return Add(self, other)

    def __sub__(self, other):
        return Sub(self, other)

    def __mul__(self, other):
        return Mul(self, other)
    
    def __truediv__(self, other):
        return Div(self, other)

    def __pow__(self, other):
        return Pow(self, other)

    def __radd__(self, other):
        return Add(other, self)

    def __rsub__(self, other):
        return Sub(other, self)

    def __rmul__(self, other):
        return Mul(other, self)

    def __rtruediv__(self, other):
        return Div(other, self)

    def __rpow__(self, other):
        return Pow(other, self)

    def simplify(self):
        return self


class Var(Symbol):
    def __init__(self, n):
        """
        Initializer.  Store an instance variable called `name`, containing the
        value passed in to the initializer.
        """
        self.name = n

    def __str__(self):
        return self.name

    def __repr__(self):
        return "Var(" + repr(self.name) + ")"

    def deriv(self, wrt):
        return Num(1 if self.name == wrt else 0)

    def equal_to(self, val):
        return self.name == val

    def eval(self, map):
        # return Num object of dictionary value
        return Num(map[self.name])

class Num(Symbol):
    def __init__(self, n):
        """
        Initializer.  Store an instance variable called `n`, containing the
        value passed in to the initializer.
        """
        self.n = n

    def __str__(self):
        return str(self.n)

    def __repr__(self):
        return "Num(" + repr(self.n) + ")"

    def deriv(self, wrt):
        return Num(0)

    def equal_to(self, val):
        return self.n == val

    def eval(self, map):
        return self

class BinOp(Symbol):
    def __init__(self, left, right):
        self.left = self._type(left)
        self.right = self._type(right)

    def _type(self, val):
        if type(val) == int or type(val) == float:
            return Num(val)
        elif type(val) == str:
            return Var(val)
        else:
            return val

    def __str__(self):
        left = str(self.left)
        # if left or right is a BinOp then check for precedence
        try:
            # if exponent and left precedent is less than or equal to current precedent
            if self.oper == '**' and self.left.prio <= self.prio:
                left = '(' + left + ')'
            elif self.left.prio < self.prio:
                left = '(' + left + ')'
        except:
            pass
        right = str(self.right)
        try:
            if self.right.prio < self.prio or (self.right.prio == self.prio and self.subdiv):
                right = '(' + right + ')'
        except:
            pass
        return left + ' ' + self.oper + ' ' + right

    def __repr__(self):
        return self.oper_str + '(' + repr(self.left) + ', ' + repr(self.right) + ')' 

    # def simplify(self):
    #     # print(self)
    #     left = self.left.simplify()
    #     right = self.right.simplify()
    #     # print('left1: ', left)
    #     # print('right1: ', right)
    #     # binary operation on two numbers simplifies to one number
    #     # adding/subtraction by 0 or multiplying/dividing by 1 returns itself
    #     if isinstance(left, Num) and left.n == self.sim.n:
    #         print('left')
    #         return right
    #     elif isinstance(right, Num) and right.n == self.sim.n:
    #         print('right')
    #         return left
    #     # multiplying by 0 returns 0
    #     elif self.oper == '*' and (str(left) == '0' or str(right) == '0'):
    #         print('*')
    #         return Num(0)
    #     # dividing 0 by a number returns 0
    #     elif self.oper == '/' and str(left) == '0':
    #         print('/')
    #         return Num(0)
    #     elif isinstance(left, Num) and isinstance(right, Num):
    #         print('instance')
    #         result = self.combine(left, right)
    #         return Num(result)
    #     else:  
    #         new = self.copy(left, right)
    #         print('new')
    #         # print('left: ', left)
    #         # print('right: ', right)
    #         return new

    def simplify(self):
        # recursively simplify
        left = self.left.simplify()
        right = self.right.simplify()
        # binary operation on two numbers simplifies to one number
        if isinstance(left, Num) and isinstance(right, Num):
            return (self.combine(left, right))
        else:
            return self.simp(left, right)

    def eval(self, map):
        # recursively evaluates
        left = self.left.eval(map)
        right = self.right.eval(map)
        # keeps left and right Num objects
        if isinstance(left, int) or isinstance(left, float):
            left = Num(left)
        if isinstance(right, int) or isinstance(right, float):
            right = Num(right)
        # evaluate
        return (self.combine(left, right)).n

def equal_to(given, val):
    return isinstance(given, Num) and given.n == val

class Add(BinOp):
    oper = '+'
    oper_str = "Add"
    prio = 0
    subdiv = False
    sim = Num(0)

    def deriv(self, wrt):
        return Add(self.left.deriv(wrt), self.right.deriv(wrt))       

    def combine(self, left, right):
        return Num(left.n + right.n)

    def copy(self, left, right):
        return Add(left, right)

    def simp(self, left, right):
        # adding by 0 returns itself
        if equal_to(left, 0):
            return right
        if equal_to(right, 0):
            return left
        return Add(left, right)

class Sub(BinOp):
    oper = '-'
    oper_str = "Sub"
    prio = 0
    subdiv = True
    sim = Num(0)

    def deriv(self, wrt):
        return Sub(self.left.deriv(wrt), self.right.deriv(wrt))

    def combine(self, left, right):
        return Num(left.n - right.n)

    def copy(self, left, right):
        return Sub(left, right)

    def simp(self, left, right):
        # subtracting by 0 returns itself
        if equal_to(right, 0):
            return left
        return Sub(left, right)


class Mul(BinOp):
    oper = '*'
    oper_str = "Mul"
    prio = 1
    subdiv = False
    sim = Num(1)

    def deriv(self, wrt):
        return Add(Mul(self.right, self.left.deriv(wrt)), Mul(self.left, self.right.deriv(wrt)))

    def combine(self, left, right):
        return Num(left.n * right.n)

    def copy(self, left, right):
        return Mul(left, right)
        
    def simp(self, left, right):
        # multiplying by 1 returns itself
        if equal_to(left, 1):
            return right
        elif equal_to(right, 1):
            return left
        # multiplying by 0 returns 0
        elif equal_to(left, 0) or equal_to(right, 0):
            return Num(0)
        return Mul(left, right)
        
class Div(BinOp):
    oper = '/'
    oper_str = "Div"
    prio = 1
    subdiv = True
    sim = Num(1)

    def deriv(self, wrt):
        return Div(Sub(Mul(self.right, self.left.deriv(wrt)), Mul(self.left, self.right.deriv(wrt))), Mul(self.right, self.right))

    def combine(self, left, right):
        return Num(left.n / right.n)

    def copy(self, left, right):
        return Div(left, right)

    def simp(self, left, right):
        # dividing by 1 returns itself
        if equal_to(right, 1):
            return left
        # dividing 0 by something returns 0
        elif equal_to(left, 0):
            return Num(0)
        return Div(left, right)


class Pow(BinOp):
    oper = '**'
    oper_str = 'Pow'
    prio = 2
    subdiv = False

    def deriv(self, wrt):
        if not isinstance(self.right, Num):
            raise TypeError('Not raised to the power of a number')
        return Mul(Mul(self.right, Pow(self.left, self.right-1)), self.left.deriv(wrt))

    def combine(self, left, right):
        return Num(left.n ** right.n)

    def simp(self, left, right):
        if equal_to(right, 0):
            return Num(1)
        elif equal_to(right, 1):
            return left
        elif equal_to(left, 0):
            return Num(0)
        return Pow(left, right)

def tokenize(inp):
    """

    >>> tokenize("(x * (2 + 3))")
    ['(', 'x', '*', '(', '2', '+', '3', ')', ')']
    >>> tokenize('(x * (2.0 - -3 + k))')
    ['(', 'x', '*', '(', '2.0', '-', '-3', '+', 'k', ')', ')']
    >>> tokenize('20')
    ['20']
    >>> tokenize('(3 ** x )')
    ['(', '3', '**', 'x', ')']
    """
    outp = []
    i = 0
    temp = ''
    while i < len(inp):
        char = inp[i]
        # check for negative signs and periods to add to temp
        if (char == '-' and inp[i+1] != ' ') or char == '.':
            temp += char
            i += 1
            continue
        # add numbers to temp 
        try:
            int(char)
            temp += char
        # when character is not an int
        except:
            # append tokenized int/float to outp
            if temp != '':
                outp.append(temp)
                temp = ''
            # check for exponentials
            if char == '*' and inp[i+1] == '*':
                outp.append('**')
                i += 2
                continue
            # append non-whitespace token to outp
            if char != ' ':
                outp.append(char)
        i += 1
    if temp != '':
        outp.append(temp)
    return outp


def parse(tokens):
    op = {'+': Add, '-': Sub, '*': Mul, '/': Div, '**': Pow}
    def parse_expression(index):
        if index < len(tokens):
            try: 
                token = int(token[index])
            except:
                try: 
                    token = float(tokens[index])
                except:
                    token = tokens[index]
            print(token)
            if isinstance(token, int) or isinstance(token, float):
                return Num(token), index + 1
            if token in 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM':
                return Var(token), index + 1
            else:
                left, ind = parse_expression(index + 1)
                oper = tokens[ind]
                right, ind = parse_expression(ind + 1)
                oper = op[oper]
                return oper(left, right), ind + 1
    parsed_expression, next_index = parse_expression(0)
    print(parsed_expression)
    return parsed_expression


def sym(exp):
    tokens = tokenize(exp)
    print('tokens: ', tokens)
    parsed = parse(tokens)
    print('parsed: ', parsed)
    return parsed


if __name__ == "__main__":
    doctest.testmod()
