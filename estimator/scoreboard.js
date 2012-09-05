//Scoreboard 
//Store a board with marked as dead/alive info
//Provide a toggle dead/alive feature
//v0.2.0

/** History
0.1.0: creation of this file
0.2.0: added some constants + minor code changes
*/

/** Note
(i, j) coords are relative to a double array board[i][j] so (i, 2) corresponds to the black group in the following example:
	var clear_territory_board = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];
*/

/**
Constructor
board param : a square double array like board = [size][size];
*/
function ScoreBoard(board) {
//TODO: test if a double array
	this.size = board.length;
	this.board = ScoreBoard.cloneBoardArray(board);
}

//static constants
ScoreBoard.BLACK = "B";
ScoreBoard.WHITE = "W";
ScoreBoard.EMPTY = "*";
ScoreBoard.BLACK_DEAD = "N";
ScoreBoard.WHITE_DEAD = "E";
ScoreBoard.BLACK_ALIVE = "A";
ScoreBoard.WHITE_ALIVE = "Z";
ScoreBoard.BLACK_SEKI = "B";
ScoreBoard.WHITE_SEKI = "Y";
ScoreBoard.TERRITORY_BLACK = "BP";
ScoreBoard.TERRITORY_WHITE = "WP";
ScoreBoard.TERRITORY_SEKI = "S";
ScoreBoard.TERRITORY_DAME = "D";
ScoreBoard.TERRITORY_KO = "K";
ScoreBoard.TERRITORY_UNKNOWN = "X";



//static
ScoreBoard.cloneBoardArray  = function(board) {

	var size = board.length;
	var newBoard = new Array(size);
	for(var i=0;i<size;i++) {
		newBoard[i] = new Array(size);
		for(var j=0;j<size;j++) {
			newBoard[i][j] = "" + board[i][j];
		}
	}
	return newBoard;
};



ScoreBoard.prototype.getSize  = function() {
	return this.size;
};



ScoreBoard.prototype.getBoardArray  = function() {

	return ScoreBoard.cloneBoardArray(this.board);
};



ScoreBoard.prototype.clone  = function() {

	return new ScoreBoard(this.board);
};



/** used by toggleAt() */
//static final
ScoreBoard.DISTANCE1 = new Array(1, 0, -1, 0, 0, 1, 0, -1);

//static
ScoreBoard.getToggleColor  = function(color) {
	switch(color) {
	case ScoreBoard.BLACK:
		return ScoreBoard.BLACK_DEAD;
	case ScoreBoard.BLACK_DEAD:
		return ScoreBoard.BLACK_ALIVE;
	case ScoreBoard.BLACK_ALIVE:
		return ScoreBoard.BLACK_DEAD;
	case ScoreBoard.WHITE:
		return ScoreBoard.WHITE_DEAD;
	case ScoreBoard.WHITE_DEAD:
		return ScoreBoard.WHITE_ALIVE;
	case ScoreBoard.WHITE_ALIVE:
		return ScoreBoard.WHITE_DEAD;
	default:
		return ScoreBoard.TERRITORY_UNKNOWN;
	}
};


//static
ScoreBoard.getBlackOrWhite  = function(color) {

	switch(color) {
	case ScoreBoard.BLACK:
	case ScoreBoard.BLACK_DEAD:
	case ScoreBoard.BLACK_ALIVE:
	case ScoreBoard.BLACK_SEKI:
		return ScoreBoard.BLACK;
	case ScoreBoard.WHITE:
	case ScoreBoard.WHITE_DEAD:
	case ScoreBoard.WHITE_ALIVE:
	case ScoreBoard.WHITE_SEKI:
		return ScoreBoard.WHITE;
	default:
		return null;
	}
};


ScoreBoard.prototype.isSameColorAt  = function(i, j, color) {

	return (ScoreBoard.getBlackOrWhite(this.board[i][j]) == ScoreBoard.getBlackOrWhite(color));
};


ScoreBoard.prototype.isTerritory  = function(i, j) {

	return (ScoreBoard.getBlackOrWhite(this.board[i][j]) == null);
};


ScoreBoard.prototype.toggleAt  = function(i0, j0) {

	var color = this.board[i0][j0];
	var newColor = ScoreBoard.getToggleColor(color);

	if(newColor == null) {//toggling a territory does nothing: return the same board
		return ScoreBoard.cloneBoardArray(this.board);
	}

	//if color at (coordsToCheck[k], coordsToCheck[k+1]) is the same color as the toggled stone, 
	//then toggle it also and add its neighbors coords to coordsToCheck
	var coordsToCheck = new Array();
	coordsToCheck.push(i0);
	coordsToCheck.push(j0);

	var alreadySeen = new Object();
	for(;coordsToCheck.length;) {

		var i = coordsToCheck.shift();
		var j = coordsToCheck.shift();

		//use a map to remember already checked stone coordinates
		if(alreadySeen[i+1000*j] == true) {
			continue;
		}
		alreadySeen[i+1000*j] = true;
		
		//toggle if same color
		if(!this.isSameColorAt(i, j, color)) {
			continue;
		}
		//the stone is in the group, toggle it
		this.board[i][j] = newColor;
		
		//add neighbors to checklist
		for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
			var ii = i+ScoreBoard.DISTANCE1[k++];
			var jj = j+ScoreBoard.DISTANCE1[k++];
			if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
				continue; 
			}
			coordsToCheck.push(ii);
			coordsToCheck.push(jj);
		}
	}
	return ScoreBoard.cloneBoardArray(this.board);
};

