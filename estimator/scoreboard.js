//Scoreboard 
//Store a board with marked as dead/alive info
//Provide a toggle dead/alive feature
//v0.1.0

/** History
0.1.0: creation of this file
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
ScoreBoard.TERRITORY_BLACK = "BP";
ScoreBoard.TERRITORY_WHITE = "WP";
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
//private static final
ScoreBoard.DISTANCE1_I = new Array(1, -1, 0, 0);
ScoreBoard.DISTANCE1_J = new Array(0, 0, 1 , -1);

//private static
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
		return ScoreBoard.BLACK;
	case ScoreBoard.WHITE:
	case ScoreBoard.WHITE_DEAD:
	case ScoreBoard.WHITE_ALIVE:
		return ScoreBoard.WHITE;
	default:
		return null;
	}
};


ScoreBoard.prototype.isSameColorAt  = function(i, j, color) {

	return (ScoreBoard.getBlackOrWhite(this.board[i][j]) == ScoreBoard.getBlackOrWhite(color));
};


ScoreBoard.prototype.toggleAt  = function(i0, j0) {

	var color = this.board[i0][j0];
	var newColor = ScoreBoard.getToggleColor(color);

	if(newColor == null) {//toggling a territory does nothing: return the same board
		return ScoreBoard.cloneBoardArray(this.board);
	}

	//ari and arj are arrays of coordinates that we need to check. 
	//if color at (ari[k], arj[k]) is the same color as the toggled stone, then toggle it also and add its neighbors coords to the arrays
	var ari = new Array();
	var arj = new Array();
	ari.push(i0);
	arj.push(j0);

	var alreadySeen = new Object();
	for(var n=0;n<ari.length;n++) {

		var i = ari[n];
		var j = arj[n];

		//use a map to remember already checked stone coordinates
		if(alreadySeen[i+1000*j] == true) {
			continue;
		}
		alreadySeen[i+1000*j] = true;
		
		//toggle if same color
		if(!this.isSameColorAt(i, j, color)) {//not in the same group, then do nothing
			continue;
		}
		//the stone is in the group, toggle it
		this.board[i][j] = newColor;

		
		//add neighbors
		for(var k=0; k < ScoreBoard.DISTANCE1_I.length; k++) {
			var ii = i+ScoreBoard.DISTANCE1_I[k];
			var jj = j+ScoreBoard.DISTANCE1_J[k];
			if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
				continue; 
			}
			ari.push(ii);
			arj.push(jj);
		}
	}
	return ScoreBoard.cloneBoardArray(this.board);
};

