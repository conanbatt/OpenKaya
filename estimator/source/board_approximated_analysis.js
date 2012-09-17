//BoardApproximatedAnalysis
//Analyse a board by estimating information: probable eyes, dead groups, etc
//v0.2.0

/** History
0.1.0: creation of this file
0.2.0: add radiation territory estimation
*/

//TODO: estimatedDame
//TODO: removePseudoDame

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
			if(alreadySeenThoseCoords[ScoreBoard.getKey(i, j)] == true) {
				continue;
			}
			alreadySeenThoseCoords[ScoreBoard.getKey(i, j)] = true;
			
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
						var groupName = this.groupNames[ScoreBoard.getKey(ii, jj)];
						if(this.groupLibCoords[groupName].length == 2) {//atari
							multiplier = 0.1;
						} else if(this.groupCoords[groupName].length == 2) {//single stone
							multiplier = 0.66;
						}
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
