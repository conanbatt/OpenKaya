//Scoreboard 
//Store a board with marked as dead/alive info
//Provide a toggle dead/alive feature
//Provide count score feature
//v0.3.0

/** History
0.1.0: creation of this file
0.2.0: added some constants + minor code changes
0.3.0: added count score feature
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
function ScoreBoard(board, komi, black_captures, white_captures) {
//TODO: test if a double array
	this.size = board.length;
	this.board = ScoreBoard.cloneBoardArray(board);
	
	this.komi = ScoreBoard.getAsFloat(komi);
	this.black_captures = ScoreBoard.getAsInt(black_captures);
	this.white_captures = ScoreBoard.getAsInt(white_captures);
	
	this.black_estimated_territory = "unknown";
	this.black_estimated_captures = "unknown";
	this.white_estimated_territory = "unknown";
	this.white_estimated_captures = "unknown";

}


ScoreBoard.getAsInt = function(s) {
	var n =parseInt(""+s);
	if(n == NaN) {
		n = 0;
	}
	return n;
};

ScoreBoard.getAsFloat = function(s) {
	var n =parseFloat(""+s);
	if(n == NaN) {
		n = 0;
	}
	return n;
};

/** board kind */
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
ScoreBoard.TERRITORY_KO_BLACK = "KB";
ScoreBoard.TERRITORY_KO_WHITE = "KW";
ScoreBoard.TERRITORY_UNKNOWN = "X";

/** group status */
ScoreBoard.STATUS_GROUP_ALIVE = "ALIVE";
ScoreBoard.STATUS_GROUP_DEAD = "DEAD";
ScoreBoard.STATUS_GROUP_SEKI = "SEKI";
ScoreBoard.STATUS_GROUP_UNKNOWN = "UNKNOWN";



//static
/**
param board: a double-array
result : a double-array, same values as the input
*/
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


/**
returns the current board content as a double-array
*/
ScoreBoard.prototype.getBoardArray  = function() {

	return ScoreBoard.cloneBoardArray(this.board);
};



/**
return a ScoreBoard copy
*/
ScoreBoard.prototype.clone  = function() {

	return new ScoreBoard(this.board, this.komi, this.black_captures, this.white_captures);
};



/**
single-array relative coordinates of neighbors for which distance == 1
*/
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


/**
return
	ScoreBoard.BLACK if the stone is black (whatever its status dead/alive etc), 
	ScoreBoard.WHITE if the stone is white (whatever its status dead/alive etc)
	null if territory
*/
//static
ScoreBoard.getBlackOrWhite  = function(kind) {

	switch(kind) {
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


ScoreBoard.prototype.getBoardKindAt  = function(i, j) {
	return this.board[i][j];
};


/**
return a boolean, true if same color
*/
ScoreBoard.prototype.isSameColorAt  = function(i, j, color) {

	return (ScoreBoard.getBlackOrWhite(this.board[i][j]) == ScoreBoard.getBlackOrWhite(color));
};


/**
return a boolean, true if territory
*/
ScoreBoard.prototype.isTerritoryAt  = function(i, j) {

	return (ScoreBoard.getBlackOrWhite(this.board[i][j]) == null);
};


/**
return a boolean, true if valid coordinates
*/
ScoreBoard.prototype.isInBoard  = function(i, j) {

	return (i >=0 && i < this.size && j>=0 && j < this.size);
};


/**
change the dead/alive status of the (i0, j0) stone
return a double-array copy of the board
*/
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

	var alreadySeenThoseCoords = new Object();
	for(;coordsToCheck.length;) {

		var i = coordsToCheck.shift();
		var j = coordsToCheck.shift();
		//use a map to remember already checked stone coordinates
		if(alreadySeenThoseCoords[i+1000*j] == true) {
			continue;
		}
		alreadySeenThoseCoords[i+1000*j] = true;
		
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
			if(!this.isInBoard(ii, jj)) {
				continue; 
			}
			coordsToCheck.push(ii);
			coordsToCheck.push(jj);
		}
	}
	return ScoreBoard.cloneBoardArray(this.board);
};


/** return group status */
ScoreBoard.prototype.getGroupStatusAt = function(i, j) {
	switch(this.board[i][j]) {
	case ScoreBoard.BLACK:
	case ScoreBoard.WHITE:
		return ScoreBoard.STATUS_GROUP_UNKNOWN;
	case ScoreBoard.BLACK_DEAD:
	case ScoreBoard.WHITE_DEAD:
		return ScoreBoard.STATUS_GROUP_DEAD;
	case ScoreBoard.BLACK_ALIVE:
	case ScoreBoard.WHITE_ALIVE:
		return ScoreBoard.STATUS_GROUP_ALIVE;
	case ScoreBoard.BLACK_SEKI:
	case ScoreBoard.WHITE_SEKI:
		return ScoreBoard.STATUS_GROUP_SEKI;
	default: return null;
	}
};


//prototype
ScoreBoard.prototype.computeAnalysis  = function() {
	//NOP
};


ScoreBoard.prototype.getBlackScore  = function() {
	return this.black_estimated_territory + this.black_estimated_captures;
};


ScoreBoard.prototype.getWhiteScore  = function() {
	return this.white_estimated_territory + this.white_estimated_captures + this.komi;
};


ScoreBoard.prototype.getGameResult = function() {
	var bscore = this.getBlackScore();
	var wscore = this.getWhiteScore();
	if(bscore > wscore) {
		return "B+"+(bscore - wscore);
	} else if(wscore > bscore) {
		return "W+"+(wscore - bscore);
	} else {
		return "Jigo!";
	}
};


ScoreBoard.prototype.countJapaneseResult = function() {

	this.black_estimated_territory = 0;
	this.black_estimated_captures = 0 + this.black_captures;
	this.white_estimated_territory = 0;
	this.white_estimated_captures = 0 + this.white_captures;

	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var kind = this.getBoardKindAt(i, j);
			if(kind == ScoreBoard.BLACK_DEAD) {
				this.white_estimated_territory += 1;
				this.white_estimated_captures += 1;
			} else if(kind == ScoreBoard.WHITE_DEAD) {
				this.black_estimated_territory += 1;
				this.black_estimated_captures += 1;
			} else if(kind == ScoreBoard.TERRITORY_BLACK) {
				this.black_estimated_territory += 1;
			} else if(kind == ScoreBoard.TERRITORY_WHITE) {
				this.white_estimated_territory += 1;
			} else if(kind == ScoreBoard.TERRITORY_KO_BLACK) {
				this.black_estimated_territory += 0.5;
			} else if(kind == ScoreBoard.TERRITORY_KO_WHITE) {
				this.white_estimated_territory += 0.5;
			}
			else if(this.getGroupStatusAt(i, j) == ScoreBoard.STATUS_GROUP_DEAD) {
				var color = ScoreBoard.getBlackOrWhite(kind);
				if(color == ScoreBoard.BLACK) {
					this.white_estimated_territory += 1;
					this.white_estimated_captures += 1;
				} else if(color == ScoreBoard.WHITE) {
					this.black_estimated_territory += 1;
					this.black_estimated_captures += 1;
				}
			}
		}
	}
};

function extendClass(childClass, parClass) {
 
	// use an intermediate "empty" class to avoid call to parent class constructor
	var f = function() {};
	f.prototype = parClass.prototype;
	childClass.prototype = new f();
 
	var fctSource = childClass.toString();
	var className = /function\s+([^\(\s]+)\(/.exec(fctSource)[1];
	
	var baseName = "_base_" + className;
 	childClass.prototype[baseName] = parClass;
}

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


//BoardApproximatedAnalysis
//Analyse a board by estimating information: probable eyes, dead groups, etc
//v0.2.0

/** History
0.1.0: creation of this file
0.2.0: add radiation territory estimation
*/

/**
Constructor
Inherits from BoardExactAnalysis
board param: a square double array like board = [size][size];
*/
function BoardApproximatedAnalysis(board, komi, black_captures, white_captures) {
	this._base_BoardApproximatedAnalysis.call(this, board, komi, black_captures, white_captures);//call parent constructor
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



/**
return a BoardApproximatedAnalysis copy
*/
BoardApproximatedAnalysis.prototype.clone  = function() {

	return new BoardApproximatedAnalysis(this.board, this.komi, this.black_captures, this.white_captures);
};


BoardApproximatedAnalysis.prototype.computeAnalysis  = function() {
	this._base_BoardApproximatedAnalysis.prototype.computeAnalysis.call(this);//call parent function
	this.findDame(true);
	this.estimateTerritory();
};


/**
return ScoreBoard.TERRITORY_UNKNOWN, ScoreBoard.TERRITORY_BLACK or ScoreBoard.TERRITORY_WHITE
*/
BoardApproximatedAnalysis.prototype.getStatusByRadiation = function(i0, j0, dMax) {
	
	var weights = [100, 80, 40, 20, 10, 5, 2, 1];
	var alreadySeenThoseCoords = new Object();
	var distance = 0;
	var found = false;
	var sum = 0;

	var coordsToCheck = new Array();
	coordsToCheck.push(i0);
	coordsToCheck.push(j0);
	
	for(var distance=1;distance<dMax+3;distance++) {

		if(distance > dMax && !found) {
			break;
		}

		var newCoordsToCheck = new Array();
		for(;coordsToCheck.length;) {

			var i = coordsToCheck.shift();
			var j = coordsToCheck.shift();
			//use a map to remember already checked stone coordinates
			if(alreadySeenThoseCoords[i+1000*j] == true) {
				continue;
			}
			alreadySeenThoseCoords[i+1000*j] = true;
			
			//check neighbors
			for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
				var ii = i+ScoreBoard.DISTANCE1[k++];
				var jj = j+ScoreBoard.DISTANCE1[k++];
				if(!this.isInBoard(ii, jj)) {
					continue; 
				}

				if(this.isTerritoryAt(ii, jj)) {
					newCoordsToCheck.push(ii);
					newCoordsToCheck.push(jj);
				} else {
					found = true;
					var color = ScoreBoard.getBlackOrWhite(this.getBoardKindAt(ii, jj));
					if(this.getGroupStatusAt(ii, jj) != ScoreBoard.STATUS_GROUP_DEAD) {
						var multiplier = 1;
						/*if(this.countGroupSize(stone) == 1) {//TODO
							multiplier = 0.6;
						}*/
						if(color == ScoreBoard.BLACK) {
							sum += weights[distance]*multiplier;
						} else if(color == ScoreBoard.WHITE) {
							sum -= weights[distance]*multiplier;
						}
					} else {
						if(color == ScoreBoard.BLACK) {
							sum -= weights[distance];
						} else if(color == ScoreBoard.WHITE) {
							sum += weights[distance];
						}
					}
				}
			}
		}
		coordsToCheck = newCoordsToCheck;
	}
	
	if(sum < 20 && sum > -20) {
		return ScoreBoard.TERRITORY_UNKNOWN;
	}

	return (sum > 0) ? ScoreBoard.TERRITORY_BLACK : ScoreBoard.TERRITORY_WHITE;
};


BoardApproximatedAnalysis.prototype.estimateTerritory = function() {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var kind = this.getBoardKindAt(i, j);
			if(kind != ScoreBoard.TERRITORY_UNKNOWN && kind != ScoreBoard.EMPTY) {
				continue;
			}
			var maxDist = 2;
			if(i<3 || j < 3 || i>this.size-3 || j>this.size-3) {//more territories near border
				maxDist =3;
			}
			var newKind = this.getStatusByRadiation(i, j, maxDist);
			if(newKind != ScoreBoard.TERRITORY_UNKNOWN) {
				if(newKind == ScoreBoard.TERRITORY_BLACK && this.isNextToAliveColor(i, j, ScoreBoard.WHITE, false)) {
					newKind = ScoreBoard.TERRITORY_DAME;
				} else if(newKind == ScoreBoard.TERRITORY_WHITE && this.isNextToAliveColor(i, j, ScoreBoard.BLACK, false)) {
					newKind = ScoreBoard.TERRITORY_DAME;
				}
			
				this.changeBoardAt(i, j, newKind);
			}
		}
	}
};

