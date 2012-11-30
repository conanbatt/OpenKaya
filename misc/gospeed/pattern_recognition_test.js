var basic_pattern_file = "(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]" +
";U[Japanese]SZ[19]KM[0.00]"+
";W[White]PB[Black]"+
";B[dc]"+
";W[pc]"+ 
";B[cc]"+
";W[od]"+
";B[cd]"+
";W[pe]"+
";B[cp]"+
";W[qd]"+
";B[eq]"+
";W[pp]"+
";B[qn]"+
";W[qo]"+
";B[pn]"+
";W[np])";

var recognizer;

module("Pattern recognition basic", {
    setup: function() {

        basic_pattern_sgf = new SGFParser(basic_pattern_file);
        recognizer = new PatternRecognizer(basic_pattern_sgf);
    },
    teardown: function() {
    }
});

test("Should be able to recognize shapes", function(){

    equal(recognizer.count("empty triangle"), 1);
    equal(recognizer.count("ponnuki"), 1);
    equal(recognizer.count("kick"), 1);
    equal(recognizer.count("shimari"), 1);

    equal(recognizer.count("broken ikken tobi"), 1);
    equal(recognizer.count("broken keima"), 1);
    equal(recognizer.count("broken hazama tobi"), 1);
});

