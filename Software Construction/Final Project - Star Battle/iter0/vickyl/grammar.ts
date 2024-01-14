const grammar=`
@skip whitespace {
    puzzle ::= (row newline){10};
    row ::= cell{10};
    cell ::= region star? '|';
}
region ::= [0-9];
star ::= '*';
whitespace ::= [ \\t\\r\\n]+;
`