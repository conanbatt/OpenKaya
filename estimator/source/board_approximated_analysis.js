//BoardApproximatedAnalysis
//Analyse a board by estimating information: probable eyes, dead groups, etc
//v0.3.0

/*!
 * This software is licensed under a Creative Commons Attribution 3.0 Unported License:
 * http://http://creativecommons.org/licenses/by/3.0/
 *
 * Date: 2012-09-22
 */

/** History
0.1.0: creation of this file
0.2.0: add radiation territory estimation
0.3.0: cleanAloneMarkedTerritory
1.0.0: territoryCoordsToToggle
*/


/**
Constructor
Inherits from BoardExactAnalysis
board param: a square double array like board = [size][size];
*/
function BoardApproximatedAnalysis(board, komi, black_captures, white_captures, territoryCoordsToToggle) {
	this._base_BoardApproximatedAnalysis.call(this, board, komi, black_captures, white_captures, territoryCoordsToToggle);//call parent constructor
	this.findDeadGroupsMaxLibs = 6;
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
};



/**
return a BoardApproximatedAnalysis copy
*/
BoardApproximatedAnalysis.prototype.clone  = function() {
	return new BoardApproximatedAnalysis(this.board, this.komi, this.black_captures, this.white_captures, this.territoryCoordsToToggle);
};


BoardApproximatedAnalysis.prototype.computeAnalysis  = function() {
	this._base_BoardApproximatedAnalysis.prototype.computeAnalysis.call(this);//call parent function
	this.estimateTerritory();
	this.cleanAloneMarkedTerritory();
};


/**
much less restrictive than BoardExactAnalysis
and small groups near border have less options to escape?
*/
BoardApproximatedAnalysis.prototype.getFarDistance = function(metagroupName) {
	var maxDistance = 6;
	var libCoords = this.getMetagroupLibs(metagroupName);
	var nLibs = libCoords.length/2;
	if(this.metagroupChildren[metagroupName].length == 1 && nLibs < 3) {
		var hasOneLibNearBorder = false;
		for(var k=0; k < libCoords.length;) {
			var i = libCoords[k++];
			var j = libCoords[k++];
			if(i==0 || i==this.size-1 || j==0 || j==this.size-1) {
				hasOneLibNearBorder = true;
				break;
			}
		}
		if(hasOneLibNearBorder) {
			maxDistance = 5;
		}
	}
	return maxDistance;
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
			var key = ScoreBoard.getKey(i, j);
			//use a map to remember already checked stone coordinates
			if(alreadySeenThoseCoords[key] == true) {
				continue;
			}
			alreadySeenThoseCoords[key] = true;
			
			//check neighbors
			for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
				var ii = i+ScoreBoard.DISTANCE1[k++];
				var jj = j+ScoreBoard.DISTANCE1[k++];
				if(!this.isInBoard(ii, jj)) {
					continue; 
				}

				if(this.isTerritoryAt(ii, jj)) {
					if(this.territoryCoordProps[key][BoardExactAnalysis.PROPERTY_TERRITORY_IS_SEPARATOR] != true) {
						newCoordsToCheck.push(ii);
						newCoordsToCheck.push(jj);
					}
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
	
	if(sum < 25 && sum > -25) {
		return ScoreBoard.TERRITORY_UNKNOWN;
	}

	return (sum > 0) ? ScoreBoard.TERRITORY_BLACK : ScoreBoard.TERRITORY_WHITE;
};


BoardApproximatedAnalysis.prototype.checkIfKoIsStillAlive = function(i, j) {
	var oneIsDead = false;
	for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
		var ii = i+ScoreBoard.DISTANCE1[k++];
		var jj = j+ScoreBoard.DISTANCE1[k++];
		if(!this.isInBoard(ii, jj)) {
			continue; 
		}
		var status = this.getGroupStatusAt(ii, jj);
		if(status == ScoreBoard.STATUS_GROUP_ALIVE) {
			return;
		}
		if(status == ScoreBoard.STATUS_GROUP_DEAD) {
			oneIsDead = true;
		}
	}
	if(oneIsDead) {//mark all dead and reverse territory
		for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
			var ii = i+ScoreBoard.DISTANCE1[k++];
			var jj = j+ScoreBoard.DISTANCE1[k++];
			if(!this.isInBoard(ii, jj)) {
				continue; 
			}
			this.setMetagroupProp(this.getGroupNameAt(ii, jj), BoardExactAnalysis.PROPERTY_METAGROUP_IS_DEAD, true);
		}
		var kind = this.getBoardKindAt(i, j);
		if(kind == ScoreBoard.TERRITORY_KO_BLACK) {
			this.changeBoardAt(i, j, ScoreBoard.TERRITORY_WHITE);
		} else if(kind == ScoreBoard.TERRITORY_KO_WHITE) {
			this.changeBoardAt(i, j, ScoreBoard.TERRITORY_BLACK);
		}
	}
};


/**
remove marked territory if no other same mark aroud
also check ko: some can be dead now
*/
BoardApproximatedAnalysis.prototype.cleanAloneMarkedTerritory = function() {
	var nearCoord2 = new Array(1, 1, 1, -1, -1, 1, -1, -1);
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var shouldContinue = false;
			var countOtherMarkedTerritories = 0;
			var kind = this.getBoardKindAt(i, j);
			if(kind == ScoreBoard.TERRITORY_KO_BLACK || kind == ScoreBoard.TERRITORY_KO_WHITE) {
				this.checkIfKoIsStillAlive(i, j);
			}
			
			if(kind != ScoreBoard.TERRITORY_BLACK && kind != ScoreBoard.TERRITORY_WHITE) {
				continue;
			}
			for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
				var ii = i+ScoreBoard.DISTANCE1[k++];
				var jj = j+ScoreBoard.DISTANCE1[k++];
				if(!this.isInBoard(ii, jj)) {
					continue; 
				}
				var otherKind = this.getBoardKindAt(ii, jj);
				if(ScoreBoard.getBlackOrWhite(otherKind) != null) {
					shouldContinue = true;
					break;
				}
				if(otherKind == kind) {
					countOtherMarkedTerritories++;
				}
			}
			if(shouldContinue) {
				continue;
			}
			for(var k=0; k < nearCoord2.length;) {
				var ii = i+nearCoord2[k++];
				var jj = j+nearCoord2[k++];
				if(!this.isInBoard(ii, jj)) {
					continue;
				}
				var otherKind = this.getBoardKindAt(ii, jj);
				/*if(ScoreBoard.getBlackOrWhite(otherKind) != null) {
					shouldContinue = true;
					break;
				}*/
				if(otherKind == kind) {
					countOtherMarkedTerritories++;
				}
			}
			if(shouldContinue) {
				continue;
			}
			if(countOtherMarkedTerritories < 2) {
				this.changeBoardAt(i, j, ScoreBoard.TERRITORY_UNKNOWN);
			}				
		}				
	}				
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
				if(newKind == ScoreBoard.TERRITORY_BLACK && this.isNextToAliveColor(i, j, ScoreBoard.WHITE, false)) {//TODO: distance2
					newKind = ScoreBoard.TERRITORY_DAME;
				} else if(newKind == ScoreBoard.TERRITORY_WHITE && this.isNextToAliveColor(i, j, ScoreBoard.BLACK, false)) {
					newKind = ScoreBoard.TERRITORY_DAME;
				}
			
				this.changeBoardAt(i, j, newKind);
			}
		}
	}
};
