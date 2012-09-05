//BoardExactAnalysis
//Analyse a board by computing exact information: dame, eyes for sure, etc
//v0.1.0

/** History
0.1.0: creation of this file
*/

/**
Constructor
Inherits from ScoreBoard
board param: a square double array like board = [size][size];
*/
function BoardExactAnalysis(board) {
	this._base_BoardExactAnalysis.call(this, board);//call parent constructor
}

extendClass(BoardExactAnalysis, ScoreBoard);//define inheritance, cf inheritance.js


/** 
scoreboard param: a ScoreBoard object
return: a double-array board filled with ScoreBoard constants (like ScoreBoard.TERRITORY_BLACK etc)
 */
//static
BoardExactAnalysis.launchAnalysis  = function(scoreboard) {
	var boardAnalysis = new BoardExactAnalysis(scoreboard.getBoardArray());
	boardAnalysis.computeAnalysis();
	return boardAnalysis.getBoardArray();
}

BoardExactAnalysis.prototype.computeAnalysis  = function() {
	this.findDame();
};




BoardExactAnalysis.prototype.findDame  = function() {
//TODO
};

