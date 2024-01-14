const grammar = `
@skip whitespace {
    puzzle ::= "10x10" newline (region newline){10}
    region ::= left | right
    left ::= (coord coord)?
    right ::= (coord)+
    coord ::= [0-9]+ "," [0-9]+
}
newline ::= "\r"? "\n"
whitespace ::= [ \\t\\r\\n]+
`;

// Not very sure if this is entirely correct