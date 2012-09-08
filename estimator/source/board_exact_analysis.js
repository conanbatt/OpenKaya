//BoardExactAnalysis
//Analyse a board by computing exact information: dame, eyes for sure, etc
//v0.2.0

/** History
0.1.0: creation of this file
0.2.0: implements findDame
*/

/**
Constructor
Inherits from ScoreBoard
board param: a square double array like board = [size][size];
*/
function BoardExactAnalysis(board, komi, black_captures, white_captures) {
	this._base_BoardExactAnalysis.call(this, board, komi, black_captures, white_captures);//call parent constructor
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
};

/**
return a BoardExactAnalysis copy
*/
BoardExactAnalysis.prototype.clone  = function() {

	return new BoardExactAnalysis(this.board, this.komi, this.black_captures, this.white_captures);
};


BoardExactAnalysis.prototype.computeAnalysis  = function() {
	this.findDame(false);
};


/** return group status */
//TODO (inherits from ScoreBoard) BoardExactAnalysis.prototype.getGroupStatusAt = function(i, j) {



/**
change the content of the board (for example newKind = ScoreBoard.TERRITORY_BLACK) 
*/
BoardExactAnalysis.prototype.changeBoardAt = function(i, j, newKind) {
	this.board[i][j] = newKind;
};



/**
return true if (i,j) is next to a non-dead color group.
if onlyIfGroupIsAlive == true, both groups must be known as alive
*/
BoardExactAnalysis.prototype.isNextToAliveColor = function(i, j, color, onlyIfGroupIsAlive) {
	for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
		var ii = i+ScoreBoard.DISTANCE1[k++];
		var jj = j+ScoreBoard.DISTANCE1[k++];
		if(!this.isInBoard(ii, jj)) {
			continue; 
		}
		if(!this.isSameColorAt(ii, jj, color)) {
			continue;
		}
		var status = this.getGroupStatusAt(ii, jj);
		if(status == ScoreBoard.STATUS_GROUP_ALIVE || status == ScoreBoard.STATUS_GROUP_SEKI) {
			return true;
		}
		if(!onlyIfGroupIsAlive && status == ScoreBoard.STATUS_GROUP_UNKNOWN) {
			return true;
		}
	}
	return false;
};


/**
change board kind to ScoreBoard.TERRITORY_DAME if relevant
*/
BoardExactAnalysis.prototype.findDameAtPoint = function(i, j, onlyIfGroupsAreAlive) {
	if(this.isNextToAliveColor(i, j, ScoreBoard.BLACK, onlyIfGroupsAreAlive) && this.isNextToAliveColor(i, j, ScoreBoard.WHITE, onlyIfGroupsAreAlive)) {
		this.changeBoardAt(i, j, ScoreBoard.TERRITORY_DAME);
	}
};

/**
search territories next to non-dead groups of both colors. 
if onlyIfGroupsAreAlive == true, both groups must be known as alive
found territories are marked as ScoreBoard.TERRITORY_DAME
*/
BoardExactAnalysis.prototype.findDame  = function(onlyIfGroupsAreAlive) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			if(this.isTerritoryAt(i, j)) {//TODO use territories coords and remove this test (perf)
				this.findDameAtPoint(i, j, onlyIfGroupsAreAlive);
			}
		}
	}
};

