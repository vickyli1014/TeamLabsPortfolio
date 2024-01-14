# NO ADDITIONAL IMPORTS!
import doctest
from text_tokenize import tokenize_sentences

class Trie:
    def __init__(self, key_type):
        self.value = None
        self.key_type = key_type
        self.children = dict()

    def get_node(self, key):
        """
        Returns the trie following the key
        """
        if type(key) != self.key_type:
            raise TypeError
        node = self
        for el in range(len(key)):
            node = node.children[key[el:el+1]]
        return node

    def __setitem__(self, key, value):
        """
        Add a key with the given value to the trie, or reassign the associated
        value if it is already present in the trie.  Assume that key is an
        immutable ordered sequence.  Raise a TypeError if the given key is of
        the wrong type.
        """
        if type(key) != self.key_type:
            raise TypeError("key of wrong type!")
        if len(key) == 0:
            self.value = value
        else:
            child_key = key[:1]
            if child_key in self.children:
                self.children[child_key].__setitem__(key[1:], value)
            else:
                temp = Trie(self.key_type)
                temp.__setitem__(key[1:], value)
                self.children[child_key] = temp


    def __getitem__(self, key):
        """
        Return the value for the specified prefix.  If the given key is not in
        the trie, raise a KeyError.  If the given key is of the wrong type,
        raise a TypeError.
        """
        if type(key) != self.key_type:
            raise TypeError("key of wrong type!")
        if len(key) == 0:
            if self.value == None:
                raise KeyError("key not in trie O:")
            return self.value
        else:
            child_key = key[:1]
            if child_key in self.children:
                return self.children[child_key].__getitem__(key[1:])
            else:
                raise KeyError("key not in trie O:")


    def __delitem__(self, key):
        """
        Delete the given key from the trie if it exists. If the given key is not in
        the trie, raise a KeyError.  If the given key is of the wrong type,
        raise a TypeError.
        """
        if type(key) != self.key_type:
            raise TypeError("key of wrong type!")
        if len(key) == 0:
            if self.value == None:
                raise KeyError("key not in trie O:")
            self.value = None
        else:
            child_key = key[:1]
            if child_key in self.children:
                self.children[child_key].__delitem__(key[1:])
            else:
                raise KeyError("key not in trie O:")

    def __contains__(self, key):
        """
        Is key a key in the trie? return True or False.  If the given key is of
        the wrong type, raise a TypeError.
        """
        if type(key) != self.key_type:
            raise TypeError("key of wrong type!")
        try:
            self[key]
        except:
            return False
        return True


    def __iter__(self):
        """
        Generator of (key, value) pairs for all keys/values in this trie and
        its children.  Must be a generator!
        """
        # if there is a value, yield a tuple of an empty element and the value
        if self.value != None:
            yield (self.key_type(), self.value)
        # for all child
        for key, trie in self.children.items():
            # a generator with all the pairs so far
            # pairs = trie.__iter__()
            for pair in trie:  
                yield (key + pair[0], pair[1])

    def len(self):
        length = 0
        for _ in self:
            length += 1
        return length
        

def make_word_trie(text):
    """
    Given a piece of text as a single string, create a Trie whose keys are the
    words in the text, and whose values are the number of times the associated
    word appears in the text
    """
    sentences = tokenize_sentences(text)
    word_trie = Trie(str)
    for sentence in sentences:
        for word in sentence.split(' '):
            if word not in word_trie:
                word_trie[word] = 0
            word_trie[word] += 1
    return word_trie


def make_phrase_trie(text):
    """
    Given a piece of text as a single string, create a Trie whose keys are the
    sentences in the text (as tuples of individual words) and whose values are
    the number of times the associated sentence appears in the text.
    """
    sentences = tokenize_sentences(text)
    phrase_trie = Trie(tuple)
    for phrase in sentences:
        tup_phrase = tuple(phrase.split(' '))
        if tup_phrase not in phrase_trie:
            phrase_trie[tup_phrase] = 0
        phrase_trie[tup_phrase] += 1
    return phrase_trie


def autocomplete(trie, prefix, max_count=None):
    """
    Return the list of the most-frequently occurring elements that start with
    the given prefix.  Include only the top max_count elements if max_count is
    specified, otherwise return all.

    Raise a TypeError if the given prefix is of an inappropriate type for the
    trie.
    """
    if type(prefix) != trie.key_type:
        raise TypeError
    # if prefix is not in the trie, return an empty list
    try:
        node = trie.get_node(prefix)
    except: 
        return []
    # all the following keys for this prefix
    keys = [x for x in node]
    # sort by frequency, from greatest to smallest
    keys = sorted(keys, key=lambda x: x[1], reverse = True)
    keys = [ prefix + i[0] for i in keys ]
    return keys[:max_count]


def get_edits(word):
    """
    Returns a set of all possible edits with the following rules:
        - A single-character insertion (add any one character in the range "a" to "z" at any place in the word)
        - A single-character deletion (remove any one character from the word)
        - A single-character replacement (replace any one character in the word with a character in the range a-z)
        - A two-character transpose (switch the positions of any two adjacent characters in the word)
    """
    letters = 'qwertyuiopasdfghjklzxcvbnm'
    inserts = { word[:i]+l+word[i:] for i in range(len(word)) for l in letters }
    deletes = { word[:i-1]+word[i:] for i in range(len(word)+1) }
    replacements = { word[:i-1]+l+word[i:] for i in range(1,len(word)+1) for l in letters }
    transposes = { word[:i-1]+word[i]+word[i-1]+word[i+1:] for i in range(1, len(word)) }
    return {*inserts, *deletes, *replacements, *transposes}


def autocorrect(trie, prefix, max_count=None):
    """
    Return the list of the most-frequent words that start with prefix or that
    are valid words that differ from prefix by a small edit.  Include up to
    max_count elements from the autocompletion.  If autocompletion produces
    fewer than max_count elements, include the most-frequently-occurring valid
    edits of the given word as well, up to max_count total elements.
    """
    # trie.len() is the number of all possible autocompletions/autocorrects
    if max_count == None:
        max_count = trie.len()
    words = autocomplete(trie, prefix, max_count)
    if max_count > len(words):
        edits = get_edits(prefix)
        # lsit of (edit, freq) if an edited word is unique and exists in the trie
        valid_edits = [ (edit, trie[edit]) for edit in edits if (edit not in words and edit in trie) ]
        # sort by value of word, from greatest to smallest
        valid_edits = sorted(valid_edits, key=lambda x: x[1], reverse=True)
        # appends a slice of valid_edits to word so that len(word) equals max_count
        words = words + [ edits[0] for edits in valid_edits[:max_count-len(words)] ]
    return words


def word_filter(trie, pattern, prefix='', seen=None):
    """
    Return list of (word, freq) for all words in trie that match pattern.
    pattern is a string, interpreted as explained below:
         * matches any sequence of zero or more characters,
         ? matches any single character,
         otherwise char in pattern char must equal char in word.
    prefix is a string of the word to build on
    seen is the set of words that have already been matched with the pattern
    """
    # set of all already seen words
    if seen == None:
        seen = set()
    # when we run out of patterns, return empty list if pattern does not exist or word
    # already seen, else return (word, freq) 
    if pattern == '':
        if trie.value == None or prefix in seen:
            return []
        else:
            seen.add(prefix)
            return [(prefix, trie.value)]    
    words = []
    if pattern[0] == '*':
        # find words where * matches zero sequences
        words += word_filter(trie, pattern[1:], prefix, seen)
        # find words where * matches something
        for child in trie.children:
            words += word_filter(trie.children[child], pattern, prefix+child, seen)
    elif pattern[0] == '?':
        # for all of the next letter, continue matching after the ?
        for child in trie.children:
            words += word_filter(trie.children[child], pattern[1:], prefix+child, seen)
    elif pattern[0] in trie.children:
        # continue matching for words that match this current character 
        words += word_filter(trie.children[pattern[0]], pattern[1:], prefix+pattern[0], seen)

    return words



# you can include test cases of your own in the block below.
if __name__ == "__main__":
    doctest.testmod()
    # Alice in Wonderland
    with open("Caroll.txt", encoding="utf-8") as caroll:
        text = caroll.read()
        caroll_sentences = make_phrase_trie(text)
        caroll_words = make_word_trie(text)
        # print(autocomplete(caroll_sentences, (), 6))
        # print(autocorrect(caroll_words, 'hear', 12))
        # print(caroll_sentences.len())
        total_sentences = 0
        for sentence in caroll_sentences:
            total_sentences += sentence[1]
        # print(total_sentences)


    # Metamorphosis
    with open("Kafta.txt", encoding='utf-8') as kafta:
        text = kafta.read()
        kafta_words = make_word_trie(text)
        # print(autocomplete(kafta_words, 'gre', 6))
        # print(word_filter(kafta_words, 'c*h'))

    # A Tale of Two Cities
    with open('Dickens.txt', encoding='utf-8') as dickens:
        text = dickens.read()
        dickens_words = make_word_trie(text)
        # print(word_filter(dickens_words, 'r?c*t'))

    # Pride and Prejudice
    with open('Austen.txt', encoding='utf-8') as austen:
        text = austen.read()
        austen_words = make_word_trie(text)
        # print(autocorrect(austen_words, 'hear'))

    # Dracula
    with open('Stoker.txt', encoding='utf-8') as stoker:
        text = stoker.read()
        stoker_words = make_word_trie(text)
        # print(stoker_words.len())
        total_words = 0
        for word in stoker_words:
            total_words += word[1]
        # print(total_words)