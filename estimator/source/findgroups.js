//FindGroups
//get a double-array board as input
//provide a double-array board as output, containing groups names
//v0.1.0

/** History
0.1.0: creation of this file
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
	this.nGroup = new Object();//groups number
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
