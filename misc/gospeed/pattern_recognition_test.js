// all patterns must be square.
var emptyTriangle = [["B","B"],
		     ["B","E"]];
var ponnuki = [["A","B","A"],
	       ["B","E","B"],
	       ["A","B","A"]];



var board1 = make2dArray(9);
fill2dArray(board1);
play(board1,3,3,"W");
play(board1,3,4,"W");
play(board1,4,4,"W");



var board2 = make2dArray(9);
fill2dArray(board2);
play(board2,4,4,"B");
play(board2,3,5,"B");
play(board2,5,5,"B");
play(board2,4,6,"B");

var missboard = make2dArray(9);
fill2dArray(missboard);
play(missboard,5,4,"B");
play(missboard,4,4,"B");
play(missboard,3,5,"B");
play(missboard,5,5,"B");
play(missboard,4,6,"B");

var missboard2 = make2dArray(9);
fill2dArray(missboard2);
play(missboard2,4,4,"A");
play(missboard2,3,5,"B");
play(missboard2,5,5,"B");
play(missboard2,4,6,"B");

var missboard3 = make2dArray(9);
fill2dArray(missboard3);
play(missboard3,1,1,"B");
play(missboard3,1,2,"B");
play(missboard3,2,2,"W");
play(missboard3,2,1,"B");


module("Pattern recognition basic", {
    setup: function() {

    },
    teardown: function() {
    }
});
test("Should be able to recognize shapes based on last move.", function(){

    //TODO Using a function so open like this is bad practice. Use an object like in pattern_matcher js. Also rename testShape to "match" as in PatternRecognizer.match(pattern)

    equal(PatternRecognizer.testShape(emptyTriangle,board1,4,4), true);
    equal(PatternRecognizer.testShape(ponnuki,board2,4,4), true);

});
test("Should not recognize patterns that dont fit", function(){ 
   //TODO This one shows the short coming of the current design. Any stone around the ponnuki pattern will trigger it. Somehow, the B stones should be the ones that can trigger the pattern!
   //Being nitpicky, the ponnuki pattern also requires that a stone gets captured, which the pattern itself doesnt cover. But that is a rare case so we can look over it.
    equal(PatternRecognizer.testShape(ponnuki, missboard,5,4),false); 
    equal(PatternRecognizer.testShape(ponnuki, missboard2,4,4),false);
    equal(PatternRecognizer.testShape(ponnuki, missboard3,2,1),false);

});

test("Should have a libarry of patterns", function(){

    //TODO check pattern_recognizer  and use it to store patterns. 
    ok(PatternRecognizer.patterns["empty triangle"]);
    ok(PatternRecognizer.patterns["ponnuki"]);

});
test("See when shapes no longer apply", function(){
    
    play(board1,3,4,"B");
    equal(testShape(emptyTriangle,board1,3,4), false);
    play(board2,4,5,"B");
    equal(testShape(ponnuki,board2,4,5), false);

test("Should match all patterns in the loaded library given a position", function(){

    var patterns = PatternRecognizer.find_patterns(board2);
    equal(patterns.length,1);
    equal(patterns[0].name, "empty triangle");
    //TODO This can be useful to understand what the pattern matcher returned. Becuase patterns have diffuse stones ("A",or "any stone") having the actual pattern from the game can be clarifying.
    equal(pattern[0].matched_pattern,  "real_game pattern matched");

});

test("See when shapes no longer apply", function(){
    
    play(board1,3,4,"B");
    equal(PatternRecognizer.testShape(emptyTriangle,board1,3,4), false);
    play(board2,4,5,"B");
    equal(PatternRecognizer.testShape(ponnuki,board2,4,5), false);

});
