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




module("Pattern recognition basic", {
    setup: function() {

    },
    teardown: function() {
    }
});
test("Should be able to recognize shapes based on last move.", function(){

    equal(testShape(emptyTriangle,board1,4,4), true);
    equal(testShape(ponnuki,board2,4,4), true);;

});
test("See when shapes no longer apply", function(){
    
    play(board1,3,4,"B");
    equal(testShape(emptyTriangle,board1,3,4), false);
    play(board2,4,5,"B");
    equal(testShape(ponnuki,board2,4,5), false);

});
