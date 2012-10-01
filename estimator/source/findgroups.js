//FindGroups
//get a double-array board as input
//provide a double-array board as output, containing groups names
//v0.2.0

/*!
 * This software is licensed under a Creative Commons Attribution 3.0 Unported License:
 * http://http://creativecommons.org/licenses/by/3.0/
 *
 * Date: 2012-09-22
 */

/** History
0.1.0: creation of this file
0.2.0: splitTerritories
*/

/** Example
	var input = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","B"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","B"]
            ];
	var output = [
                ["T0","B0","T1","W0","T2","T2"],
                ["T0","B0","T1","W0","T2","T2"],
                ["T0","B0","T1","W0","T2","T2"],
                ["T0","B0","T1","W0","T2","B1"],
                ["T0","B0","T1","W0","T2","T2"],
                ["T0","B0","T1","W0","T2","B2"]
            ];
*/

/**
Constructor
board param : a square double array like board = [size][size];
*/
function FindGroups(board) {
//TODO: test if a double array
	this.size = board.length;
	this.board = ScoreBoard.cloneBoardArray(board);
	this.scoreBoard = new ScoreBoard(this.board, 0.5, 0, 0);
	this.nGroup = new Object();//groups number
	this.separatorsMap = new Object();//if(this.separatorsMap[ScoreBoard.getKey(i, j)] == true) then (i, j) is a separator
	this.getGroups();
}

//static constants
FindGroups.GROUP_PREFIX_BLACK = "B";
FindGroups.GROUP_PREFIX_WHITE = "W";
FindGroups.TERRITORY_PREFIX = "T";
FindGroups.EMPTY = "";

FindGroups.prototype.getBoardArray = function() {
	return this.board;
};

FindGroups.prototype.initNGroups = function(n) {
	this.nGroup[FindGroups.GROUP_PREFIX_BLACK] = n;
	this.nGroup[FindGroups.GROUP_PREFIX_WHITE] = n;
	this.nGroup[FindGroups.TERRITORY_PREFIX] = n;
};

FindGroups.prototype.getGroups = function() {
	this.initNGroups(1000);
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var kind = this.board[i][j];
			var color = ScoreBoard.getBlackOrWhite(kind);
			var prefix;
			if(color == ScoreBoard.BLACK) {
				prefix = FindGroups.GROUP_PREFIX_BLACK;
			} else if (color == ScoreBoard.WHITE) {
				prefix = FindGroups.GROUP_PREFIX_WHITE;
			} else {
				prefix = FindGroups.TERRITORY_PREFIX;
			} 
			this.board[i][j] = this.aggregateGroups(prefix, i, j);
		}
	}
	this.findSeparators();
	this.splitTerritories();
	this.sortGroups(0);
};

FindGroups.prototype.aggregateGroups = function(prefix, i, j) {
	var newGroupName = "" + prefix + this.nGroup[prefix];
	this.nGroup[prefix] = this.nGroup[prefix] +1;

	var foundGroup = FindGroups.EMPTY;
	if(j>0) {
		var groupName = this.board[i][j-1];
		var otherPrefix = this.getGroupPrefix(groupName);
		if(prefix == otherPrefix) {
			foundGroup = groupName;
		}
	}
	if(i>0) {
		var groupName = this.board[i-1][j];
		var otherPrefix = this.getGroupPrefix(groupName);
		if(prefix == otherPrefix) {
			if(foundGroup == FindGroups.EMPTY || foundGroup == groupName) {
				foundGroup = groupName;
			} else {
				this.renameGroup(groupName, foundGroup);
			}
		}
	}
	if(foundGroup == FindGroups.EMPTY) {
		foundGroup = newGroupName;
	}
	return foundGroup;
};

FindGroups.prototype.getGroupPrefix = function(groupName) {
	return groupName.substring(0,1);
};

FindGroups.prototype.renameGroup = function(oldname, newname) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			if(this.board[i][j] == oldname) {
				this.board[i][j] = newname;
			}
		}
	}
	return newname;
};

FindGroups.prototype.sortGroups = function(n) {
	var map = new Object();
	var ar = new Array();
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var name = this.board[i][j];
			if(map[name] != true) {
				map[name] = true;
				ar.push(name);
			}
		}
	}
	this.initNGroups(n);
	for(var i=0; i<ar.length; i++) {
		var prefix = this.getGroupPrefix(ar[i]);
		var newName = prefix + this.nGroup[prefix];
		this.nGroup[prefix] += 1;
		this.renameGroup(ar[i], newName);
	}
};


/**
three empty intersections on the first line below one stone on the second line -> add a separator on the first line
four empty intersections on the first line below two stones of differnt colors on the second line -> add two separators on the first line
*/
FindGroups.prototype.findSeparators = function() {
	for(var i=2; i<this.size-2; i++) {
		var j=0;
		if(!this.scoreBoard.isTerritoryAt(i-1, j) || !this.scoreBoard.isTerritoryAt(i, j) || !this.scoreBoard.isTerritoryAt(i+1, j) || this.scoreBoard.isTerritoryAt(i, j+1)) {
			continue;
		}
		if(this.separatorsMap[ScoreBoard.getKey(i-2, j)] != true && this.separatorsMap[ScoreBoard.getKey(i-1, j)] != true) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		} else if(!this.scoreBoard.haveSameColorsAt(i-1, j+1, i, j+1)) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		}
	}
	for(var i=2; i<this.size-2; i++) {
		var j=this.size-1;
		if(!this.scoreBoard.isTerritoryAt(i-1, j) || !this.scoreBoard.isTerritoryAt(i, j) || !this.scoreBoard.isTerritoryAt(i+1, j) || this.scoreBoard.isTerritoryAt(i, j-1)) {
			continue;
		}
		if(this.separatorsMap[ScoreBoard.getKey(i-2, j)] != true && this.separatorsMap[ScoreBoard.getKey(i-1, j)] != true) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		} else if(!this.scoreBoard.haveSameColorsAt(i-1, j-1, i, j-1)) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		}
	}
	for(var j=2; j<this.size-2; j++) {
		var i=0;
		if(!this.scoreBoard.isTerritoryAt(i, j-1) || !this.scoreBoard.isTerritoryAt(i, j) || !this.scoreBoard.isTerritoryAt(i, j+1) || this.scoreBoard.isTerritoryAt(i+1, j)) {
			continue;
		}
		if(this.separatorsMap[ScoreBoard.getKey(i, j-2)] != true && this.separatorsMap[ScoreBoard.getKey(i, j-1)] != true) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		} else if(!this.scoreBoard.haveSameColorsAt(i+1, j-1, i+1, j)) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		}
	}
	for(var j=2; j<this.size-2; j++) {
		var i=this.size-1;
		if(!this.scoreBoard.isTerritoryAt(i, j-1) || !this.scoreBoard.isTerritoryAt(i, j) || !this.scoreBoard.isTerritoryAt(i, j+1) || this.scoreBoard.isTerritoryAt(i-1, j)) {
			continue;
		}
		if(this.separatorsMap[ScoreBoard.getKey(i, j-2)] != true && this.separatorsMap[ScoreBoard.getKey(i, j-1)] != true) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		} else if(!this.scoreBoard.haveSameColorsAt(i-1, j-1, i-1, j)) {
			this.separatorsMap[ScoreBoard.getKey(i, j)] = true;
		}
	}
};

FindGroups.prototype.getTerritorySeparators = function() {
	var coords = new Array();
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			if(this.separatorsMap[ScoreBoard.getKey(i, j)] == true) {
				coords.push(i);
				coords.push(j);
			}
		}
	}
	return coords;
};

FindGroups.prototype.splitTerritories = function() {
	var coordsOfTerritoriesToSplit = new Array();
	for(var key in this.separatorsMap) {
		var ar = ScoreBoard.getCoordFromKey(key);
		for(var k=0; k < ScoreBoard.DISTANCE1.length;) {
			var ii = ar[0]+ScoreBoard.DISTANCE1[k++];
			var jj = ar[1]+ScoreBoard.DISTANCE1[k++];
			if(!this.scoreBoard.isInBoard(ii, jj) || !this.scoreBoard.isTerritoryAt(ii, jj)) {
				continue; 
			}
			coordsOfTerritoriesToSplit.push(ii);
			coordsOfTerritoriesToSplit.push(jj);
		}
	}

	var alreadySeen = new Object();	
	for(var k=0; k < coordsOfTerritoriesToSplit.length;) {
		var newName = FindGroups.TERRITORY_PREFIX + this.nGroup[FindGroups.TERRITORY_PREFIX];
		this.nGroup[FindGroups.TERRITORY_PREFIX] += 1;

		var i = coordsOfTerritoriesToSplit[k++];
		var j = coordsOfTerritoriesToSplit[k++];
		var coordsToAdd = new Array();
		coordsToAdd.push(i);
		coordsToAdd.push(j);
		for(var kk=0; kk < coordsToAdd.length;) {
			var ii = coordsToAdd[kk++];
			var jj = coordsToAdd[kk++];
			var key = ScoreBoard.getKey(ii, jj);
			if(alreadySeen[key] == true) {
				continue;
			}
			this.board[ii][jj] = newName;
			alreadySeen[key] = true;
			if(this.separatorsMap[key] != true) {
				for(var kkk=0; kkk < ScoreBoard.DISTANCE1.length;) {
					var iii = ii+ScoreBoard.DISTANCE1[kkk++];
					var jjj = jj+ScoreBoard.DISTANCE1[kkk++];
					if(!this.scoreBoard.isInBoard(iii, jjj) || !this.scoreBoard.isTerritoryAt(iii, jjj)) {
						continue;
					}
					coordsToAdd.push(iii);
					coordsToAdd.push(jjj);
				}
			}
		}
	}
};

