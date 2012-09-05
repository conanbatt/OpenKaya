//BoardApproximatedAnalysis
//Analyse a board by estimating information: probable eyes, dead groups, etc
//v0.1.0

/** History
0.1.0: creation of this file
*/

/**
Constructor
Inherits from BoardExactAnalysis
board param: a square double array like board = [size][size];
*/
function BoardApproximatedAnalysis(board) {
	this._base_BoardApproximatedAnalysis.call(this, board);//call parent constructor
}

extendClass(BoardApproximatedAnalysis, BoardExactAnalysis);//define inheritance, cf inheritance.js


/** 
scoreboard param: a ScoreBoard object
return: a double-array board filled with ScoreBoard constants (like ScoreBoard.TERRITORY_BLACK etc)
 */
//static
BoardApproximatedAnalysis.launchAnalysis  = function(scoreboard) {
	var boardAnalysis = new BoardApproximatedAnalysis(scoreboard.getBoardArray());
	boardAnalysis.computeAnalysis();
	return boardExactAnalysis.getBoardArray();
}



BoardApproximatedAnalysis.prototype.computeAnalysis  = function() {
	this._base_BoardApproximatedAnalysis.prototype.computeAnalysis.call(this);//call parent function
	this.estimateTerritory();
};



BoardExactAnalysis.prototype.estimateTerritory  = function() {
//TODO
};

