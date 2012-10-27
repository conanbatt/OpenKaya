//Scoreboard 
//Store a board with marked as dead/alive info
//Provide a toggle dead/alive feature
//Provide count score feature
//v1.0.0

/*!
 * This software is licensed under a Creative Commons Attribution 3.0 Unported License:
 * http://http://creativecommons.org/licenses/by/3.0/
 *
 * Date: 2012-09-22
 */

/** History
0.1.0: creation of this file
0.2.0: added some constants + minor code changes
0.3.0: added count score feature
1.0.0: new territoryCoordsToToggle. external display code should call getBoardFinalKindAt instead of getBoardKindAt
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
function ScoreBoard(board, komi, black_captures, white_captures, territoryCoordsToToggle) {
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

	if(territoryCoordsToToggle != null && territoryCoordsToToggle != undefined) {
		this.territoryCoordsToToggle = territoryCoordsToToggle;
	} else {
		this.territoryCoordsToToggle = new Object();
	}
}


ScoreBoard.getAsInt = function(s) {
	var n =parseInt(""+s);
	if(isNaN(n)) {
		n = 0;
	}
	return n;
};

ScoreBoard.getAsFloat = function(s) {
	var n =parseFloat(""+s);
	if(isNaN(n)) {
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
ScoreBoard.BLACK_SEKI = "C";
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

	return new ScoreBoard(this.board, this.komi, this.black_captures, this.white_captures, this.territoryCoordsToToggle);
};



/**
single-array relative coordinates of neighbors for which distance == 1
*/
//static final
ScoreBoard.DISTANCE1 = new Array(1, 0, -1, 0, 0, 1, 0, -1);

/**
single-array relative coordinates of neighbors for which distance == 2
*/
//static final
ScoreBoard.DISTANCE2 = new Array(1, 1, 1, -1, -1, 1, -1, -1, 2, 0, -2, 0, 0, 2, 0, -2);

//static
ScoreBoard.getToggleColor  = function(color, isDead) {
	switch(color) {
	case ScoreBoard.BLACK:
		if(isDead == true) {
			return ScoreBoard.BLACK_ALIVE;
		}
		return ScoreBoard.BLACK_DEAD;
	case ScoreBoard.BLACK_DEAD:
		return ScoreBoard.BLACK_ALIVE;
	case ScoreBoard.BLACK_ALIVE:
		return ScoreBoard.BLACK_DEAD;
	case ScoreBoard.WHITE:
		if(isDead == true) {
			return ScoreBoard.WHITE_ALIVE;
		}
		return ScoreBoard.WHITE_DEAD;
	case ScoreBoard.WHITE_DEAD:
		return ScoreBoard.WHITE_ALIVE;
	case ScoreBoard.WHITE_ALIVE:
		return ScoreBoard.WHITE_DEAD;
	default:
		return null;
	}
};


//static
/**
when toggling same territory, the following kinds are toggled, according to the original kind (E means empty):
B -> E -> W -> E -> B
W -> E -> B -> E -> W
E -> W -> E -> B -> E
*/
ScoreBoard.getToggleTerritory  = function(kind, count) {
	if(kind == ScoreBoard.TERRITORY_BLACK || kind == ScoreBoard.TERRITORY_KO_BLACK) {
		if(count%2 == 1) {
			return ScoreBoard.TERRITORY_SEKI;
		} else if(count%4 == 2) {
			return ScoreBoard.TERRITORY_WHITE;
		}
	} else if(kind == ScoreBoard.TERRITORY_WHITE || kind == ScoreBoard.TERRITORY_KO_WHITE) {
		if(count%2 == 1) {
			return ScoreBoard.TERRITORY_SEKI;
		} else if(count%4 == 2) {
			return ScoreBoard.TERRITORY_BLACK;
		}
	} else {
		if(count%4 == 1) {
			return ScoreBoard.TERRITORY_WHITE;
		} else if(count%4 == 3) {
			return ScoreBoard.TERRITORY_BLACK;
		} else {
			return ScoreBoard.TERRITORY_SEKI;
		}
	}
	return kind;
};

//static
/**
return anything that can distinguish (i,j) pairs
allow inverse operation (ScoreBoard.getCoordFromKey)
*/
ScoreBoard.getKey  = function(i, j) {
	return i + 1000*j;
};

//static
/**
inverse method of ScoreBoard.getKey
return an array of the coord corresponding to the input param key
*/
ScoreBoard.getCoordFromKey  = function(key) {
	var i = key % 1000;
	var j = (key-i)/1000;
	return [i, j];
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

/**
used for estimation computing. use getBoardFinalKindAt instead for final display
*/
ScoreBoard.prototype.getBoardKindAt  = function(i, j) {
	var kind = this.board[i][j];
	if(kind == ScoreBoard.EMPTY) {
		kind = ScoreBoard.TERRITORY_UNKNOWN;
	}
	return kind;
};


/**
to be called for display board (take user territory toggled stones into account)
*/
ScoreBoard.prototype.getBoardFinalKindAt  = function(i, j) {
	var kind = this.board[i][j];
	if(kind == ScoreBoard.EMPTY) {
		kind = ScoreBoard.TERRITORY_UNKNOWN;
	}
	var key = ScoreBoard.getKey(i, j);
	var count = this.territoryCoordsToToggle[key];
	if(!isNaN(count)) {
			return ScoreBoard.getToggleTerritory(kind, count);
	}
	return kind;
};



/**
return a boolean, true if same color
*/
ScoreBoard.prototype.isSameColorAt  = function(i, j, color) {

	return (ScoreBoard.getBlackOrWhite(this.board[i][j]) == ScoreBoard.getBlackOrWhite(color));
};


/**
return a boolean, true if same color
*/
ScoreBoard.prototype.haveSameColorsAt  = function(i0, j0, i1, j1) {

	return (ScoreBoard.getBlackOrWhite(this.board[i0][j0]) == ScoreBoard.getBlackOrWhite(this.board[i1][j1]));
};


/**
return a boolean, true if territory
*/
ScoreBoard.prototype.isTerritoryAt  = function(i, j) {

	return (ScoreBoard.getBlackOrWhite(this.board[i][j]) == null);
};


/**
return a boolean, true if ko
*/
ScoreBoard.prototype.isKoTerritoryAt  = function(i, j) {

	return (this.board[i][j] == ScoreBoard.TERRITORY_KO_BLACK || this.board[i][j] == ScoreBoard.TERRITORY_KO_WHITE);
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
ScoreBoard.prototype.toggleAt  = function(i0, j0, isDead) {

	var color = this.board[i0][j0];
	var newColor = ScoreBoard.getToggleColor(color, isDead);

	if(newColor == null) {//toggling a territory: save coords to toggle at the end of the estimation and return the same board
		var key = ScoreBoard.getKey(i0, j0);
		var value = this.territoryCoordsToToggle[key];
		if(isNaN(value)) {
			this.territoryCoordsToToggle[key] = 1;
		} else {
			this.territoryCoordsToToggle[key] += 1;
		}
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
		if(alreadySeenThoseCoords[ScoreBoard.getKey(i, j)] == true) {
			continue;
		}
		alreadySeenThoseCoords[ScoreBoard.getKey(i, j)] = true;
		
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
			var kind = this.getBoardFinalKindAt(i, j);
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
