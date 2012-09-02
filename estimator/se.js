//external vars
var BLACK = "B";
var WHITE = "W";
var EMPTY = "*";
var BLACK_DEAD = "N";
var WHITE_DEAD = "E";
var BLACK_ALIVE = "A";
var WHITE_ALIVE= "Z";
var NO_OWNER = "X";
var BLACK_TERRITORY = "BP";
var WHITE_TERRITORY = "WP";

//internal vars
var UNDEFINED_GROUP = "U";
var B_GROUP = "B";
var W_GROUP = "W";
var T_GROUP = "T";//territory
var S_GROUP = "S";//separation territory
var D_GROUP = "D";//dame territory (also separation)
var B_GROUP_MARKED_DEAD = "N";
var W_GROUP_MARKED_DEAD = "E";
var B_GROUP_MARKED_ALIVE = "A";
var W_GROUP_MARKED_ALIVE = "Z";

var STATUS_UNKNOWN = "UNKNOWN";
var STATUS_ALIVE = "ALIVE";
var STATUS_DEAD = "DEAD";
var STATUS_EYE_BLACK = "BLACK_EYE";
var STATUS_EYE_WHITE = "WHITE_EYE";
var STATUS_TERRITORY_BLACK = "BLACK_TERRITORY";
var STATUS_TERRITORY_WHITE = "WHITE_TERRITORY";
var STATUS_KO_BLACK = "BLACK_KO";
var STATUS_KO_WHITE = "WHITE_KO";
var STATUS_DAME = "DAME";


var DISTANCE1_I = new Array(1, -1, 0, 0);
var DISTANCE1_J = new Array(0, 0, 1 , -1);

//to be called from outside
function SE() {
    if (arguments.length > 0 && typeof arguments[0].size == "number") {
        this.size = arguments[0].size;
    } else {
        this.size = 19;
    }
    if (arguments.length > 0 && typeof arguments[0].komi == "number") {
        this.komi = arguments[0].komi;
    } else {
        this.komi = 6.5;
    }
    if (arguments.length > 0 && typeof arguments[0].black_captures == "number") {
        this.wcaptured = arguments[0].black_captures;
    } else {
        this.wcaptured = 0;
    }
    if (arguments.length > 0 && typeof arguments[0].white_captures == "number") {
        this.bcaptured = arguments[0].black_captures;
    } else {
        this.bcaptured = 0;
    }

	this.initBoard(this.size);
	this.bcount = "unknown";
	this.wcount = "unknown";
	this.black_territory = "unknown";
	this.black_captures = "unknown";
	this.white_territory = "unknown";
	this.white_captures = "unknown";
}

SE.prototype.initBoard  = function(size) {
	this.size = size;
	this.board = this.newBoard(size, UNDEFINED_GROUP);
};

SE.prototype.newBoard  = function(size, defaultValue) {
	var board = new Array(size);
	for(var i=0;i<size;i++) {
		board[i] = new Array(size);
		for(var j=0;j<size;j++) {
			board[i][j] = defaultValue;
		}
	}
	return board;
};

SE.prototype.getAsInt = function(s) {
	var n =parseInt(""+s);
	if(n == NaN) {
		n = 0;
	}
	return n;
};

SE.prototype.getAsFloat = function(s) {
	var n =parseFloat(""+s);
	if(n == NaN) {
		n = 0;
	}
	return n;
};


//TODO: move in another file (specific to jgo)
SE.prototype.load = function(board, komi, wcaptured, bcaptured) {
	this.komi = this.getAsFloat(komi);
	this.bcaptured = this.getAsInt(bcaptured);
	this.wcaptured = this.getAsInt(wcaptured);
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var color;
			var jgoID = board.get(new JGOCoordinate(i,j));
			if(jgoID == JGO_CLEAR) {
				color = EMPTY;
			} else if (jgoID == JGO_BLACK) {
				color = BLACK;
			} else if(jgoID == JGO_WHITE) {
				color = WHITE;
			}
			this.board[i][j] = color;
		}
	}
	this.estimateResult();
	this.reload(board);
};

//TODO: move in another file (specific to jgo)
SE.prototype.reload = function(board) {
	var m = this.board;
	this.display(board, m);
};

SE.prototype.estimate = function(board) {
	this.board = this.cloneBoard(board);
	this.estimateResult();

        var result = {
            white_territory: 0+this.white_territory,
            black_territory: 0+this.black_territory,
            black_captures: 0+this.black_captures,
            white_captures: 0+this.white_captures,
            estimation: ""+ this.getGameResult(),
            board: this.getResultBoard()
        };

	return result;	
};

//code from estimator.js
//better use toggleAndEstimate() (allow also to force mark dead groups as alive)
    // makes a live chain dead and a dead one live
    // returns the new board
SE.prototype.toggle_LD = function (board0, move) {
        var board_LD = this.cloneBoard(board0);
        var cur_type = board_LD[move[0]][move[1]];
        var new_type;

        if (cur_type != BLACK && cur_type != WHITE && cur_type != BLACK_DEAD && cur_type != WHITE_DEAD) {

            return board_LD;

        }

        switch (cur_type) {
        case BLACK:
            {
                new_type = BLACK_DEAD;
            }
            break;
        case WHITE:
            {
                new_type = WHITE_DEAD;
            }
            break;
        case BLACK_DEAD:
            {
                new_type = BLACK;

            }
            break;
        case WHITE_DEAD:
            {
                new_type = WHITE;
            }
            break;
            // default not to be used, but just in case, would set same as cur_type
        default:
            {
                new_type = cur_type;
            }
        }

        var chain = this.findChain(board_LD, move, cur_type);

        for (var i = 0; i < chain.length; i++) {
            var row = chain[i][0];
            var col = chain[i][1];
            board_LD[row][col] = new_type;

        }

        return board_LD;

    }

    // finds and returns the chain
SE.prototype.findChain = function (board, move, cur_type) {
        var coords = [];
        var current_coords;
        var stack_coords = [];
        var size = board.length;
        coords.push([move[0], move[1]]);
        stack_coords.push([move[0], move[1]]);

        while (current_coords = stack_coords.shift()) {

            var row = current_coords[0];
            var col = current_coords[1];

            if (row + 1 < size) {

                if (board[row + 1][col] == cur_type && !this.contains(coords, [row + 1, col])) {

                    coords.push([row + 1, col]);
                    stack_coords.push([row + 1, col]);

                }
            }

            if (row - 1 >= 0) {

                if (board[row - 1][col] == cur_type && !this.contains(coords, [row - 1, col])) {

                    coords.push([row - 1, col]);
                    stack_coords.push([row - 1, col]);

                }
            }

            if (col + 1 < size) {

                if (board[row][col + 1] == cur_type && !this.contains(coords, [row, col + 1])) {

                    coords.push([row, col + 1]);
                    stack_coords.push([row, col + 1]);

                }
            }

            if (col - 1 >= 0) {

                if (board[row][col - 1] == cur_type && !this.contains(coords, [row, col - 1])) {

                    coords.push([row, col - 1]);
                    stack_coords.push([row, col - 1]);

                }
            }
        }

        return coords;

    }

SE.prototype.cloneBoard = function (cboard) {
        var dup = [];
        var tmp = [];
        for (var row in cboard) {
            for (var col in cboard) {
                tmp[col] = (cboard[row][col] == undefined ? EMPTY : cboard[row][col]);
            }
            dup.push(tmp);
            tmp = [];
        }
        return dup;
};

SE.prototype.contains = function (a, obj) {
    var i = 0;
    for (i = 0; i < a.length; i++) {
        var tempArray = a[i];
        if (tempArray[0] == obj[0] && tempArray[1] == obj[1]) {
            return true;
        }
    }
    return false;
};

SE.prototype.reinitGroups = function(i, j) {
	for(var color in {T_GROUP:1, D_GROUP:1,S_GROUP:1}) {
		for(var i=0; i<this.nGroup[color]; i++) {
			var groupName = color+i;
			this.renameGroup(groupName, T_GROUP);
		}
		this.nGroup[D_GROUP] = 0;
		this.nGroup[S_GROUP] = 0;
	}
	for(var color in {B_GROUP:1, W_GROUP:1}) {
		for(var i=0; i<this.nGroup[color]; i++) {
			var groupName = color+i;
			this.renameGroup(groupName, color);
		}
		this.nGroup[color] = 0;
	}
};

SE.prototype.toggleAndEstimate = function(i, j) {
	this.changeStatus(i, j);
	this.initGroupStatus();
	this.initGroupEyes();
	this.sortGroups(100);
	this.reinitGroups();
	this.sortGroups(0);
	return this.estimate(this.board);
};

SE.prototype.compute = function() {
//	this.board[6][2] = BLACK_DEAD;
//	this.board[18][16] = WHITE_DEAD;
//	this.board[18][3] = WHITE_ALIVE;
	this.getGroups();
	this.sortGroups(0);
	this.initGroupStatus();
	this.initGroupEyes();
	
	this.setGroupStatusAliveFromMarkAsDead();
	if(this.nGroup[W_GROUP] == 0) {
		this.estimateUnknownTerritory();
		return;
	}
	this.checkEyes();
	this.checkSimpleEyes();
	if(this.findConnections()) {
		this.checkEyes();
	}
	var foundDeads = this.findDeadGroups(false);
	if(foundDeads)  {
		this.checkEyes();
	}
	this.findDame(true);
	if(this.checkAllResolved()) {
		this.removePseudoDame();
		this.findDame(true);
		this.estimateUnknownTerritory();
		this.removePseudoDame();
		this.findDame(false);
		return;
	}
	this.setGroupStatusAliveFromSpaceNearBorder();
	this.simplifyBorders();
	this.resetTGroups();
	this.findConnections();
	this.checkEyes();
	this.findDeadGroups(true);
	this.estimateDame();
	this.resetTGroups();
	this.findConnections();
	this.checkEyes();
	this.findDeadGroups(true);
	this.removePseudoDame();
	this.findDame(true);
	this.estimateUnknownTerritory();
	this.removePseudoDame();
	this.findDame(false);
};

//TODO: move in another file (specific to jgo)
SE.prototype.changeDisplay = function() {
	this.showNames = !this.showNames;
};

//TODO: move in another file (specific to jgo)
SE.prototype.display = function(board, m) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var mark = "";
			var status =this.getGroupStatus(m[i][j]);
			var color = this.getGroupColor(m[i][j]);
			if(color == B_GROUP_MARKED_DEAD || color == W_GROUP_MARKED_DEAD) {
				mark = "*";//"D";
			} else if(color == B_GROUP_MARKED_ALIVE || color == W_GROUP_MARKED_ALIVE) {
				mark = "";//"A";
			} else if(status == STATUS_ALIVE) {
				//mark = "0";
			} else if(status == STATUS_DEAD) {
				mark = "*";
			} else if(status == STATUS_EYE_BLACK) {
				mark = ".";//mark = ";";
			} else if(status == STATUS_EYE_WHITE) {
				mark = ",";//mark = ":";
			} else if(status == STATUS_TERRITORY_BLACK) {
				mark = ".";
			} else if(status == STATUS_TERRITORY_WHITE) {
				mark = ",";
			} else if(status == STATUS_KO_BLACK) {
				mark = ".";//"K";
			} else if(status == STATUS_KO_WHITE) {
				mark = ",";//"K";
			} else if(status == STATUS_DAME) {
				mark = "";//"#";
			} else if(color == D_GROUP) {
				//mark = "D";
			} else if(color == S_GROUP) {
				//mark = "D";
			} else if(status == STATUS_UNKNOWN) {
				//mark = "?";
			}
			if(this.showNames) {
				board.mark(new JGOCoordinate(i,j), m[i][j]);
			} else {
				board.mark(new JGOCoordinate(i,j), mark);
			}
		}
	}
};

SE.prototype.getResultBoard = function() {
	var resultBoard = this.newBoard(this.size, EMPTY);
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var mark = EMPTY;
			var status =this.getGroupStatus(this.board[i][j]);
			var color = this.getGroupColor(this.board[i][j]);
			if(color == B_GROUP_MARKED_DEAD) {
				mark = BLACK_DEAD;
			} else if(color == W_GROUP_MARKED_DEAD) {
				mark = WHITE_DEAD;
			} else if(color == B_GROUP_MARKED_ALIVE) {
				mark = BLACK;//BLACK_ALIVE;
			} else if(color == W_GROUP_MARKED_ALIVE) {
				mark = WHITE;//WHITE_ALIVE;
			} else if(status == STATUS_ALIVE) {
				if(color == B_GROUP) {
					mark = BLACK;//BLACK_ALIVE;
				} else if(color == W_GROUP) {
					mark = WHITE;//WHITE_ALIVE;
				}
			} else if(status == STATUS_DEAD) {
				if(color == B_GROUP) {
					mark = BLACK_DEAD;
				} else if(color == W_GROUP) {
					mark = WHITE_DEAD;
				}
			} else if(color == B_GROUP) {
				mark = BLACK;
			} else if(color == W_GROUP) {
				mark = WHITE;
			} else if(status == STATUS_EYE_BLACK) {
				mark = BLACK_TERRITORY;
			} else if(status == STATUS_EYE_WHITE) {
				mark = WHITE_TERRITORY;
			} else if(status == STATUS_TERRITORY_BLACK) {
				mark = BLACK_TERRITORY;
			} else if(status == STATUS_TERRITORY_WHITE) {
				mark = WHITE_TERRITORY;
			} else if(status == STATUS_KO_BLACK) {
				mark = BLACK_TERRITORY;
			} else if(status == STATUS_KO_WHITE) {
				mark = WHITE_TERRITORY;
			} else if(status == STATUS_DAME) {
				mark = NO_OWNER;
			} else if(color == S_GROUP) {
				mark = NO_OWNER;
			} else if(color == D_GROUP) {
				mark = NO_OWNER;
			} else if(status == STATUS_UNKNOWN) {
				mark = NO_OWNER;
			} else if(status == EMPTY) {//for toggle
				mark = EMPTY;
			} else {
				mark = NO_OWNER;
			}
			resultBoard[i][j] = mark;
		}
	}
	return resultBoard;
};
/*
var BLACK = "B";
var WHITE = "W";
var EMPTY = "*";
var BLACK_DEAD = "N";
var WHITE_DEAD = "E";
var BLACK_ALIVE = "A";
var WHITE_ALIVE= "Z";
var NO_OWNER = "X";
var BLACK_TERRITORY = "BP";
var WHITE_TERRITORY = "WP";

*/

//to be called from outside
SE.prototype.estimateResult = function() {
	this.compute();
	var bcount =0;
	var wcount =0;
	this.black_territory = 0;
	this.black_captures = 0 + this.wcaptured;
	this.white_territory = 0;
	this.white_captures = 0 + this.bcaptured;
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var stone = this.board[i][j];
			var status =this.getGroupStatus(stone);
			var color = this.getGroupColor(stone);
			if(color == B_GROUP_MARKED_DEAD) {
				wcount += 2;
				this.white_territory += 1;
				this.white_captures += 1;
			} else if(color == W_GROUP_MARKED_DEAD) {
				bcount += 2;
				this.black_territory += 1;
				this.black_captures += 1;
			}
			else if(status == STATUS_DEAD) {
				if(this.isBlack(color)) {
					wcount += 2;
					this.white_territory += 1;
					this.white_captures += 1;
				} else if(this.isWhite(color)) {
					bcount += 2;
					this.black_territory += 1;
					this.black_captures += 1;
				}
			} else if(status == STATUS_EYE_BLACK || status == STATUS_TERRITORY_BLACK) {
				this.black_territory += 1;
				bcount++;
			} else if(status == STATUS_EYE_WHITE || status == STATUS_TERRITORY_WHITE) {
				this.white_territory += 1;
				wcount++;
			} else if(status == STATUS_KO_BLACK) {
				bcount += 0.5;
				this.black_territory += 0.5;
			} else if(status == STATUS_KO_WHITE) {
				wcount += 0.5;
				this.white_territory += 0.5;
			}
		}
	}
	this.bcount = bcount + this.wcaptured;
	this.wcount = wcount + this.komi + this.bcaptured;
};

//to be called from outside
SE.prototype.getBScore = function() {
	return this.bcount;
};

//to be called from outside
SE.prototype.getWScore = function() {
	return this.wcount;
};

//to be called from outside
SE.prototype.getGameResult = function() {
	if(this.bcount > this.wcount) {
		return "B+"+(this.bcount - this.wcount);
	} else if(this.wcount > this.bcount) {
		return "W+"+(this.wcount - this.bcount);
	} else {
		return "Jigo!";
	}

};

SE.prototype.pushCoordsIfSameColor = function(i, j, ari, arj, color) {
	if(this.isSameColor(this.getGroupColor(this.board[i][j]), color)) {
		ari.push(i);
		arj.push(j);
	}
};

SE.prototype.changeGroupStatus = function(ci, cj, newKind) {
	var color = this.getGroupColor(this.board[ci][cj]);
	var ari = new Array();
	var arj = new Array();
	ari.push(ci);
	arj.push(cj);
	while(ari.length>0) {
		var i = ari.shift();
		var j = arj.shift();
		if(this.board[i][j] == newKind) {
			continue;
		}
		this.board[i][j] = newKind;
		for(var kk=0; kk < DISTANCE1_I.length; kk++) {
			var ii = i+DISTANCE1_I[kk];
			var jj = j+DISTANCE1_J[kk];
			if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
				continue;
			}
			this.pushCoordsIfSameColor(ii, jj, ari, arj, color);
		}
	}
};

//to be called from outside
SE.prototype.changeStatus = function(i, j) {

	var color = this.getGroupColor(this.board[i][j]);
	var status = this.getGroupStatus(this.board[i][j]);
	var newKind;
	if(color == B_GROUP && status == STATUS_ALIVE) {
		newKind = BLACK_DEAD;
	} else if(color == B_GROUP && status == STATUS_DEAD) {
		newKind = BLACK_ALIVE;
	} else if(color == B_GROUP) {
		newKind = BLACK_DEAD;
	} else if(color == B_GROUP_MARKED_DEAD) {
		newKind = B_GROUP + "999";
	} else if(color == B_GROUP_MARKED_ALIVE) {
		newKind = B_GROUP + "999";
	} else if(color == W_GROUP && status == STATUS_ALIVE) {
		newKind = WHITE_DEAD;
	} else if(color == W_GROUP && status == STATUS_DEAD) {
		newKind = WHITE_ALIVE;
	} else if(color == W_GROUP) {
		newKind = WHITE_DEAD;
	} else if(color == W_GROUP_MARKED_DEAD) {
		newKind = W_GROUP + "999";
	} else if(color == W_GROUP_MARKED_ALIVE) {
		newKind = W_GROUP + "999";
	} else {
		return;
	} 
	this.changeGroupStatus(i, j, newKind);
};

SE.prototype.initNGroups = function(n) {
	this.nGroup = new Object();
	this.nGroup[B_GROUP] = n;
	this.nGroup[W_GROUP] = n;
	this.nGroup[T_GROUP] = n;
	this.nGroup[S_GROUP] = n;
	this.nGroup[D_GROUP] = n;
	this.nGroup[B_GROUP_MARKED_DEAD] = n;
	this.nGroup[W_GROUP_MARKED_DEAD] = n;
	this.nGroup[B_GROUP_MARKED_ALIVE] = n;
	this.nGroup[W_GROUP_MARKED_ALIVE] = n;
};

SE.prototype.getGroups = function() {
	this.initNGroups(0);
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var color;
			var stone = this.board[i][j];
			if(stone == EMPTY) {
				color = T_GROUP;
			} else if (stone == BLACK) {
				color = B_GROUP;
			} else if(stone == WHITE) {
				color = W_GROUP;
			} else if (stone == B_GROUP) {
				color = B_GROUP;
			} else if(stone == W_GROUP) {
				color = W_GROUP;
			} else if(stone == BLACK_DEAD) {
				color = B_GROUP_MARKED_DEAD;
			} else if(stone == WHITE_DEAD) {
				color = W_GROUP_MARKED_DEAD;
			} else if(stone == BLACK_ALIVE) {
				color = B_GROUP_MARKED_ALIVE;
			} else if(stone == WHITE_ALIVE) {
				color = W_GROUP_MARKED_ALIVE;
			} else if(this.getGroupColor(stone) == T_GROUP) {
				color = T_GROUP;
			} else  {
				continue;
			} 
			this.board[i][j] = this.aggregateGroups(color, i, j);
		}
	}
};

SE.prototype.getGroupColor = function(groupName) {
	return groupName.substring(0,1);
};

SE.prototype.isBlack = function(color) {
	return (color == B_GROUP || color == B_GROUP_MARKED_DEAD || color == B_GROUP_MARKED_ALIVE);
};

SE.prototype.isWhite = function(color) {
	return (color == W_GROUP || color == W_GROUP_MARKED_DEAD || color == W_GROUP_MARKED_ALIVE);
};

SE.prototype.isSameColor = function(color1, color2) {
	return (color1 == color2) || (this.isBlack(color1) && this.isBlack(color2)) || (this.isWhite(color1) && this.isWhite(color2));
};

SE.prototype.isTerritory = function(groupName) {
	var color = this.getGroupColor(groupName);
	return (color == T_GROUP || color == S_GROUP || color == D_GROUP);
};

SE.prototype.isTerritoryNotTGroup = function(groupName) {
	var color = this.getGroupColor(groupName);
	return (color == S_GROUP || color == D_GROUP);
};

SE.prototype.aggregateGroups = function(color, i, j) {
	var newGroupName = "" + color + this.nGroup[color];
	this.nGroup[color] = this.nGroup[color] +1;

	var foundGroup = UNDEFINED_GROUP;
	if(j>0) {
		var groupName = this.board[i][j-1];
		var otherColor = this.getGroupColor(groupName);
		if( 	  ((color == B_GROUP_MARKED_DEAD || color == B_GROUP_MARKED_ALIVE) && otherColor == B_GROUP)
			|| ((color == W_GROUP_MARKED_DEAD || color == W_GROUP_MARKED_ALIVE) && otherColor == W_GROUP)  ) {
			foundGroup = this.renameGroup(groupName, newGroupName);
		} else if(this.isSameColor(color, otherColor)) {
			foundGroup = groupName;
		}
	}
	if(i>0) {
		var groupName = this.board[i-1][j];
		var otherColor = this.getGroupColor(groupName);
		if( 	   ((color == B_GROUP_MARKED_DEAD || color == B_GROUP_MARKED_ALIVE) && otherColor == B_GROUP)
			|| ((color == W_GROUP_MARKED_DEAD || color == W_GROUP_MARKED_ALIVE) && otherColor == W_GROUP)  ) {
			foundGroup = this.renameGroup(groupName, newGroupName);
		} else if(this.isSameColor(color, otherColor)) {
			if(foundGroup == UNDEFINED_GROUP || foundGroup == groupName) {
				foundGroup = groupName;
			} else {
				this.renameGroup(groupName, foundGroup);
			}
		}
	}
	if(foundGroup == UNDEFINED_GROUP) {
		foundGroup = newGroupName;
	}
	return foundGroup;
};

SE.prototype.renameGroup = function(oldname, newname) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			if(this.board[i][j] == oldname) {
				this.board[i][j] = newname;
			}
		}
	}
	return newname;
};

SE.prototype.sortGroups = function(n) {
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
		var color = this.getGroupColor(ar[i]);
		var newName = color + this.nGroup[color];
		this.nGroup[color] += 1;
		this.renameGroup(ar[i], newName);
	}
};

SE.prototype.setAllGroupStatus = function(color, status) {
	for(var i=0; i<this.nGroup[color]; i++) {
		this.groupStatus[color+i] = status;
	}
};

SE.prototype.initGroupStatus = function() {
	this.groupStatus = new Object();
	this.setAllGroupStatus(B_GROUP, STATUS_UNKNOWN);
	this.setAllGroupStatus(W_GROUP, STATUS_UNKNOWN);
	this.setAllGroupStatus(T_GROUP, STATUS_UNKNOWN);
	this.setAllGroupStatus(D_GROUP, STATUS_UNKNOWN);
	this.setAllGroupStatus(S_GROUP, STATUS_UNKNOWN);
};

SE.prototype.setAllGroupEyesEmpty = function(color) {
	for(var i=0; i<this.nGroup[color]; i++) {
		this.groupEyes[color+i] = new Array();
	}
};

SE.prototype.initGroupEyes = function() {
	this.groupEyes = new Object();
	this.setAllGroupEyesEmpty(B_GROUP);
	this.setAllGroupEyesEmpty(W_GROUP);
};

SE.prototype.getGroupStatus = function(groupName) {
	var color = this.getGroupColor(groupName);
	if(color == B_GROUP_MARKED_DEAD || color == W_GROUP_MARKED_DEAD) {
		return STATUS_DEAD;
	}
	if(color == B_GROUP_MARKED_ALIVE || color == W_GROUP_MARKED_ALIVE) {
		return STATUS_ALIVE;
	}
	return this.groupStatus[groupName];
};

SE.prototype.isNextToColor = function(i, j, color) {
	for(var kk=0; kk < DISTANCE1_I.length; kk++) {
		var ii = i+DISTANCE1_I[kk];
		var jj = j+DISTANCE1_J[kk];
		if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
			continue; 
		}
		if(color == this.getGroupColor(this.board[ii][jj])) {
			return true;
		}
	}
	return false;
};

//neighbours of marked-as-dead are alive
SE.prototype.setGroupStatusAliveFromMarkAsDead = function() {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var groupName = this.board[i][j];
			if(this.getGroupStatus(groupName) != STATUS_UNKNOWN) {
				continue;
			}
			var color = this.getGroupColor(groupName);
			var markedColor;
			if(color == B_GROUP) {
				markedColor = W_GROUP_MARKED_DEAD;
			} else if(color == W_GROUP) {
				markedColor = B_GROUP_MARKED_DEAD;
			} else {
				if(color == B_GROUP_MARKED_DEAD || color == W_GROUP_MARKED_DEAD) {
					this.groupStatus[groupName] = STATUS_DEAD;
				}
				if(color == B_GROUP_MARKED_ALIVE || color == W_GROUP_MARKED_ALIVE) {
					this.groupStatus[groupName] = STATUS_ALIVE;
				}
				continue;
			}
			 if(this.isNextToColor(i, j, markedColor)) {
				this.groupStatus[groupName] = STATUS_ALIVE;
			}
		}
	}
};

SE.prototype.isNextToGroup = function(i, j, groupName, ari, arj) {
	if(this.board[i][j] == groupName) {
		return false;
	}
	var result = false;
	for(var kk=0; kk < DISTANCE1_I.length; kk++) {
		var ii = i+DISTANCE1_I[kk];
		var jj = j+DISTANCE1_J[kk];
		if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
			continue; 
		}
		if(groupName != this.board[ii][jj]) {
			continue; 
		}
		if(ari == null) {
			return true;
		}
		ari.push(ii);
		arj.push(jj);
		result = true;
	}
	return result;
};
SE.prototype.territoryStatusIsTerritory = function(territoryGroupName) {
	var status = this.groupStatus[territoryGroupName];
	return (status == STATUS_TERRITORY_BLACK || status == STATUS_TERRITORY_WHITE);
};

SE.prototype.territoryStatusIsEye = function(territoryGroupName) {
	var status = this.groupStatus[territoryGroupName];
	return (status == STATUS_EYE_BLACK || status == STATUS_EYE_WHITE);
};

SE.prototype.territoryStatusIsKo = function(territoryGroupName) {
	var status = this.groupStatus[territoryGroupName];
	return (status == STATUS_KO_BLACK || status == STATUS_KO_WHITE);
};

SE.prototype.countGroupSize = function(groupName) {
	var result = 0;
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			if(this.board[i][j] == groupName) {
				result++;
			}
		}
	}
	return result;
};

SE.prototype.findGroupsAround = function(groupName, resultNamesArray, mapCountArray) {
	var alreadyFound = new Object();
	var alreadyCounted = new Object();	
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var foundGroup = this.board[i][j];
			if(foundGroup == groupName) {
				continue;
			}
			var ari = new Array();
			var arj = new Array();
			if(this.isNextToGroup(i,j, groupName,ari, arj)) {
				if(alreadyFound[foundGroup] != true) {
					alreadyFound[foundGroup] = true;
					mapCountArray[foundGroup] = ari.length;
					resultNamesArray.push(foundGroup);
				} else {
					for(var k=0;k<ari.length;k++) {
						if (alreadyCounted[foundGroup + (ari[k]+1000*arj[k])] != true) {
							mapCountArray[foundGroup] += 1;
						}
					}
				}
				for(var k=0;k<ari.length;k++) {
					alreadyCounted[foundGroup + (ari[k]+1000*arj[k])] = true;
				}					
			}
		}
	}
};

SE.prototype.countGroupLiberties = function(groupName) {
	var count = 0;
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var foundGroup = this.board[i][j];
			if(!this.isTerritory(foundGroup)) {
				continue;
			}
			if(this.isNextToGroup(i,j, groupName,null, null)) {
				count++;
			}
		}
	}
	return count;
};

SE.prototype.getFirstBWColorInArray = function(ar) {
	for(var i=0;i<ar.length; i++) {
		if(this.getGroupStatus(ar[i]) == STATUS_DEAD) {
			continue;
		}
		var firstColor = this.getGroupColor(ar[i]);
		if(firstColor == B_GROUP || firstColor == W_GROUP) {
			return firstColor;
		}
		if(firstColor == B_GROUP_MARKED_ALIVE) {
			return B_GROUP;
		}
		if(firstColor == W_GROUP_MARKED_ALIVE) {
			return W_GROUP;
		}
	}
	return null;
};

SE.prototype.checkEyesInOneTerritory = function(territoryGroupName) {
	var result1 = new Array();
	var countFound = new Object();
	this.findGroupsAround(territoryGroupName, result1, countFound);
	
	var nFoundDGroups = 0;
	var result = new Array();
	for(var i=0;i<result1.length; i++) {
		if(!this.isTerritoryNotTGroup(result1[i])) {
			result.push(result1[i]);
		} else {
			nFoundDGroups++;
		}
	}
	if(result.length == 0) {
		return null;
	}
	
	var count = 0;
	var firstColor = this.getFirstBWColorInArray(result);

	var allDeadBlack = true;
	var allDeadWhite = true;
	for(var i=0;i<result.length; i++) {
		if(this.getGroupStatus(result[i]) != STATUS_DEAD) {
			allDeadBlack = false;
			allDeadWhite = false;
			break;
		}
		var color = this.getGroupColor(result[i]);
		if(color == B_GROUP || color == B_GROUP_MARKED_ALIVE || color == B_GROUP_MARKED_DEAD) {
			allDeadWhite = false;
		}
		if(color == W_GROUP || color == W_GROUP_MARKED_ALIVE || color == W_GROUP_MARKED_DEAD) {
			allDeadBlack = false;
		}
		if(!allDeadBlack && !allDeadWhite) {
			break;
		}
	}
	if(allDeadBlack) {
		this.groupStatus[territoryGroupName] = STATUS_TERRITORY_WHITE;
		return null;
	} else if(allDeadWhite) {
		this.groupStatus[territoryGroupName] = STATUS_TERRITORY_BLACK;
		return null;
	}
	
	if(firstColor != B_GROUP && firstColor != W_GROUP) {
		return null;
	}
	var firstGroup = null;
	for(var i=0;i<result.length; i++) {
		var newColor = this.getGroupColor(result[i]);
		if(newColor == S_GROUP || newColor == D_GROUP) {
			continue;
		}
		if( (firstGroup == null) && (newColor == firstColor) ) {
			firstGroup = result[i];
		}
		if(firstColor == B_GROUP && newColor == B_GROUP_MARKED_DEAD) {
			return null;
		}
		if(firstColor == W_GROUP && newColor == W_GROUP_MARKED_DEAD) {
			return null;
		}
		if(newColor != B_GROUP && newColor != W_GROUP
					&& newColor != B_GROUP_MARKED_ALIVE && newColor != W_GROUP_MARKED_ALIVE) {
			continue;
		}
		if(this.getGroupStatus(result[i]) == STATUS_DEAD) {
			continue;
		}

		if( !this.isSameColor(newColor, firstColor)) {
			return null;
		}
		count++;
	}
	
	var allMoreThanOneLiberyInT = true;
	for(var i=0;i<result.length; i++) {
		if(this.getGroupStatus(result[i]) == STATUS_DEAD) {
			continue;
		}
		if(countFound[result[i]] == 1) {
			allMoreThanOneLiberyInT = false;
			break;
		}
	}
	var territoryGroupSize = this.countGroupSize(territoryGroupName);
	var isCandidateForAnEye = (allMoreThanOneLiberyInT || territoryGroupSize > result.length);
	if(!isCandidateForAnEye && territoryGroupSize == result.length && result.length < 3) {
		isCandidateForAnEye = true;
		for(i=0;i<result.length;i++) {
			if(this.isGrouptInAtari(result[i])) {
				isCandidateForAnEye = false;
				break;
			}
		}
	}
	if(isCandidateForAnEye) {
		if(firstGroup != null) {
			for(i=0;i<result.length;i++) {
				var rcolor = this.getGroupColor(result[i]);
				if(!this.isSameColor(rcolor, firstColor)) {
					continue;
				}
				if(rcolor == B_GROUP || rcolor == W_GROUP) {//do not change marked groups
					this.renameGroup(result[i], firstGroup);
				}
			}
			this.groupEyes[firstGroup].push(territoryGroupName);
		}
		this.groupStatus[territoryGroupName] = (firstColor == B_GROUP) ? STATUS_EYE_BLACK : STATUS_EYE_WHITE;
		
		if ( (territoryGroupSize > result.length+5+nFoundDGroups) 
					|| (this.groupEyes[firstGroup].length > 1) 
					|| this.isKnownDoubleEyeShape(territoryGroupName, territoryGroupSize, result.length, nFoundDGroups) ) {
			this.groupStatus[firstGroup] = STATUS_ALIVE;
		}
	}
//t unkn ou STATUS_TERRITORY n'entourant qu'une couleur, nt >= ng? grouper et eye
//2y si nt > 5+ng ou shapes connus (L etc) -> alive
	return result;
};

SE.prototype.abs = function(n) {
	if(n < 0) {
		return -1*n;
	}
	return n;
};

SE.prototype.isKnownDoubleEyeShape = function(territoryGroupName, territoryGroupSize, nGroups, nDNeighbor) {
	if(nDNeighbor > 0 || territoryGroupSize<4 || nGroups > 2) {
		return false;
	}
	if(territoryGroupSize == 4 && nGroups > 1) {
		return false;
	}
	var minDist = 4;
	if(territoryGroupSize == 4) {
		minDist = 3;
	} else if(nGroups > 1) {
		minDist += nGroups;
	}
	
	var ari = new Array();
	var arj = new Array();
	this.getAllCoordinates(territoryGroupName, ari, arj);
	for(var k=0; k<ari.length; k++) {
		for(var l=k; l<ari.length; l++) {
			var dist = this.abs(ari[k]-ari[l]) + this.abs(arj[k]-arj[l]);
			if(dist >= minDist) {
				return true;
			}
		}
	}
	return false;
};

SE.prototype.isGrouptInAtari = function(groupName) {
	return this.countGroupLiberties(groupName) == 1;//TODO:optim
};

SE.prototype.checkEyes = function() {
	var keys = new Array();
	var map = new Object();
	for(var i=0; i<this.nGroup[T_GROUP]; i++) {
		var groupName = "" + T_GROUP + i;
		if(this.territoryStatusIsEye(groupName)) {
			continue;
		}
		if(this.territoryStatusIsKo(groupName)) {
			continue;
		}
		if(this.territoryStatusIsTerritory(groupName)) {
			continue;
		}
		var ar = this.checkEyesInOneTerritory(groupName);
		if(ar != null) {
			map[groupName] = ar;
			keys.push(groupName);
		}
	}
	
	for(var i = 0; i< keys.length; i++) {
		for(var j = i+1; j< keys.length; j++) {
			if(map[keys[i]].length == 2 && map[keys[j]].length == 2) {
				var i0 = map[keys[i]][0];
				var i1 = map[keys[i]][1];
				var j0 = map[keys[j]][0];
				var j1 = map[keys[j]][1];
				if( (i0 == j0 && i1 == j1) || (i0 == j1 && i1 == j0) ) {
					var color0 = this.getGroupColor(i0);
					var color1 = this.getGroupColor(i1);
					if(!this.isSameColor(color0, color1)) {
						continue;
					}
					//do not change marked groups
					if( (color0 == B_GROUP || color0 == W_GROUP) 
								&& (color1 == B_GROUP || color1 == W_GROUP) ) {
						this.renameGroup(i1, i0);
						this.groupEyes[i0].push(keys[i]);
						this.groupEyes[i0].push(keys[j]);
						this.groupStatus[i0] = STATUS_ALIVE;
					} else if(color0 == B_GROUP || color0 == W_GROUP) {
						this.groupEyes[i0].push(keys[i]);
						this.groupStatus[i0] = STATUS_ALIVE;
					} else if(color1 == B_GROUP || color1 == W_GROUP) {
						this.groupEyes[i1].push(keys[j]);
						this.groupStatus[i1] = STATUS_ALIVE;
					}
					var status = this.isBlack(color0) ? STATUS_EYE_BLACK : STATUS_EYE_WHITE;
					this.groupStatus[keys[i]] = status;
					this.groupStatus[keys[j]] = status;
				}
			}
		}
	}
	for(var i = 0; i< keys.length; i++) {
		var territoryGroupName = keys[i];
		if(this.territoryStatusIsEye(territoryGroupName)) {
			continue;
		}
		var groups = map[keys[i]];
		var groupNotInAtari = new Object();
		var firstColor = this.getFirstBWColorInArray(groups);
		var countGroupInAtari = 0;
		var aGroupInAtari = null;
		for(var j=0;j<groups.length;j++) {
			if(this.getGroupStatus(groups[j]) == STATUS_DEAD) {
				continue;
			}
			var isInAtari = this.isGrouptInAtari(groups[j]);
			groupNotInAtari[groups[j]] = !isInAtari;
			if(isInAtari) {
				aGroupInAtari = groups[j];
				countGroupInAtari++;
			}
		}
		var territoryGroupSize = this.countGroupSize(territoryGroupName);
		if(countGroupInAtari == 0) {
			this.groupStatus[territoryGroupName] = 
						(firstColor == B_GROUP) ? STATUS_TERRITORY_BLACK : STATUS_TERRITORY_WHITE;
		} else if(countGroupInAtari ==1 && territoryGroupSize == 1 && this.countGroupSize(aGroupInAtari) == 1) {
			this.groupStatus[territoryGroupName] = 
						(firstColor == B_GROUP) ? STATUS_KO_BLACK : STATUS_KO_WHITE;
		}
		if( (countGroupInAtari == 0 || territoryGroupSize>1) && territoryGroupSize <4) {
			var foundOneAlive = false;
			var ar = new Array();
			for(var j=0;j<groups.length;j++) {
				var group = groups[j];
				var color = this.getGroupColor(group);
				if(color == S_GROUP || color == D_GROUP) {
					continue;
				}
				if(color == B_GROUP_MARKED_ALIVE || color == W_GROUP_MARKED_ALIVE) {
					foundOneAlive = true;
				} else if(this.getGroupStatus(group) == STATUS_ALIVE) {
					ar.push(group);
					foundOneAlive = true;
				} else if (groupNotInAtari[groups[j]] == true) {
					ar.push(group);
				}
			}
			for(var j=1;j<ar.length;j++) {
				this.renameGroup(ar[j], ar[0]);
			}
			if(foundOneAlive) {
				this.groupStatus[ar[0]] = STATUS_ALIVE;
			}
		}
	}
};

SE.prototype.checkAllResolved = function() {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var groupName = this.board[i][j];
			if(this.getGroupColor(groupName) == T_GROUP && this.getGroupStatus(groupName) == STATUS_UNKNOWN) {
				return false;
			}
		}
	}
	return true;
};

SE.prototype.getAllCoordinates = function(groupName, ari, arj) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			if(this.board[i][j] == groupName) {
				ari.push(i);
				arj.push(j);
			}
		}
	}
};

SE.prototype.getMinColorDistanceInT = function(i0, j0, color, territoryName, dMax) {
	var oldCoords = new Object();
	var ari = new Array();
	var arj = new Array();
	ari.push(i0);
	arj.push(j0);
	var distance = 0;
	
	for(var distance=1;distance<dMax+1;distance++) {
	var newari = new Array();
	var newarj = new Array();

	for(var k=0;k<ari.length;k++) {
		var i = ari[k];
		var j = arj[k];
		if(oldCoords[i+1000*j] == true) {
			continue;
		}
		oldCoords[i+1000*j] = true;
		for(var kk=0; kk < DISTANCE1_I.length; kk++) {
			var ii = i+DISTANCE1_I[kk];
			var jj = j+DISTANCE1_J[kk];
			if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
				continue; 
			}
			var stone = this.board[ii][jj];
			var c = this.getGroupColor(stone);
			if(stone == territoryName) {// || c == S_GROUP) {
				newari.push(ii);
				newarj.push(jj);
			}
			else {
				if(this.getGroupStatus(stone) != STATUS_DEAD) {
					if(this.isSameColor(c, color)) {
						return distance;
					}
				} else {
					if(!this.isSameColor(c, color)) {
						return distance;		
					}
				}
			}
		}
	}
	ari = newari;
	arj = newarj;
	newari = new Array();
	newarj = new Array();
	}

	return distance;
};

SE.prototype.minDistanceFromSameColorInT = function(groupName1, dMax) {
	var oldCoords = new Object();
	var ari = new Array();
	var arj = new Array();
	var distance = 0;
	var color = this.getGroupColor(groupName1);

	this.getAllCoordinates(groupName1, ari, arj);
	
	for(var distance=1;distance<dMax+2;distance++) {
	var newari = new Array();
	var newarj = new Array();

	for(var k=0;k<ari.length;k++) {
		var i = ari[k];
		var j = arj[k];
		if(oldCoords[i+1000*j] == true) {
			continue;
		}
		oldCoords[i+1000*j] = true;
		for(var kk=0; kk < DISTANCE1_I.length; kk++) {
			var ii = i+DISTANCE1_I[kk];
			var jj = j+DISTANCE1_J[kk];
			if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
				continue; 
			}
			if(this.board[ii][jj] == groupName1) {
				continue;
			}
			if(this.isSameColor(this.getGroupColor(this.board[ii][jj]), color)) {
				return distance;
			}
			if(this.isTerritory(this.board[ii][jj])) {
				newari.push(ii);
				newarj.push(jj);
			}
		}
	}
	if(distance == dMax) {
		return dMax;
	}
	ari = newari;
	arj = newarj;
	newari = new Array();
	newarj = new Array();
	}

	return distance;
};

SE.prototype.minDistanceFromGroupInT = function(groupName1, groupName2, dMax) {
	var oldCoords = new Object();
	var ari = new Array();
	var arj = new Array();
	var distance = 0;
	var color = this.getGroupColor(groupName1);

	this.getAllCoordinates(groupName1, ari, arj);
	
	for(var distance=1;distance<dMax+2;distance++) {
	var newari = new Array();
	var newarj = new Array();

	for(var k=0;k<ari.length;k++) {
		var i = ari[k];
		var j = arj[k];
		if(oldCoords[i+1000*j] == true) {
			continue;
		}
		oldCoords[i+1000*j] = true;
		for(var kk=0; kk < DISTANCE1_I.length; kk++) {
			var ii = i+DISTANCE1_I[kk];
			var jj = j+DISTANCE1_J[kk];
			if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
				continue; 
			}
			if(this.board[ii][jj] == groupName1) {
				continue;
			}
			if(this.board[ii][jj] == groupName2) {
				return distance;
			}
			if(this.isTerritory(this.board[ii][jj])) {
				newari.push(ii);
				newarj.push(jj);
			}
		}
	}
	ari = newari;
	arj = newarj;
	newari = new Array();
	newarj = new Array();
	}

	return distance;
};

SE.prototype.isAloneIntT = function(groupName, territoryName) {
	var color = this.getGroupColor(groupName);
	var groups = new Array();
	var counts = new Object();
	this.findGroupsAround(territoryName, groups, counts);
	var otherGroupsSameColor  = new Array();
	for(var i=0; i<groups.length; i++) {
		if(groups[i] == groupName) {
			continue;
		}
		if(this.groupStatus[groups[i]] == STATUS_DEAD) {
			continue;
		}
		var otherColor = this.getGroupColor(groups[i]);
		if(this.isSameColor(color, otherColor) 
						&& otherColor != B_GROUP_MARKED_DEAD 
						&& otherColor != W_GROUP_MARKED_DEAD) {
			return false;
		}
	}
	return true;
};

SE.prototype.killGroup = function(groupName, neighbors) {
	var firstNeighbor = null;
	var oneIsAlive = false;
	var j;
	for(j=0; j<neighbors.length; j++) {
		if(!this.isTerritory(neighbors[j])) {
			firstNeighbor = neighbors[j];
			j++;
			break;
		}
	}
	for(; j<neighbors.length; j++) {
		if(neighbors[j] == groupName) {
			continue;
		}
		if(!this.isTerritory(neighbors[j])) {
			oneIsAlive |= (this.getGroupStatus(neighbors[j]) == STATUS_ALIVE);
			this.renameGroup(neighbors[j], firstNeighbor);
		}
	}
	if(oneIsAlive) {
		this.groupStatus[firstNeighbor] = STATUS_ALIVE;
	}
	this.groupStatus[groupName] = STATUS_DEAD;
};

SE.prototype.checkGroupDeadInSeveralTerritories = function(groupName, nLibs, neighbors) {
//TODO: vérifier que dans chaque t il est le seul de sa couleur et qu'il a un seul voisin non mort avec moins de libs que lui
	var alreadySeen = new Object();
	var countNeighbors = 0;
	var color = this.getGroupColor(groupName);
	for(var j=0; j<neighbors.length; j++) {
		var ncolor = this.getGroupColor(neighbors[j]);
		if(this.isSameColor(ncolor, B_GROUP) || this.isSameColor(ncolor, W_GROUP)) {
			var status = this.getGroupStatus(neighbors[j]);
			if(status == STATUS_DEAD) {
				return false;
			}
			if(status == STATUS_UNKNOWN && nLibs> this.countGroupLiberties(neighbors[j])) {
				return false;
			}
			if(alreadySeen[neighbors[j]] != true) {
				alreadySeen[neighbors[j]] = true;
				countNeighbors++;
				if(countNeighbors > 1) {
					return false;
				}
			}
		} else if(ncolor == T_GROUP) {//not S_GROUP or D_GROUP
			var territoryNeighbors = new Array();
			var counts = new Object();
			this.findGroupsAround(neighbors[j], territoryNeighbors, counts);
			for(var k=0; k<territoryNeighbors.length; k++) {
				if(territoryNeighbors[k] == groupName){
					continue;
				}
				if(this.isTerritory(territoryNeighbors[k])) {
					continue;
				}
				if(this.isSameColor(this.getGroupColor(territoryNeighbors[k]), color)) {
					return false;
				}
				var status = this.getGroupStatus(territoryNeighbors[k]);
				if(status == STATUS_DEAD) {
					return false;
				}
				if(status == STATUS_UNKNOWN && nLibs> this.countGroupLiberties(territoryNeighbors[k])) {
					return false;
				}
				if(alreadySeen[territoryNeighbors[k]] != true) {
					alreadySeen[territoryNeighbors[k]] = true;
					countNeighbors++;
					if(countNeighbors > 1) {
						return false;
					}
				}
			}
		}
	}
	if(countNeighbors !=1) {
		return false;
	}
	this.killGroup(groupName, neighbors);
	return true;
};

SE.prototype.isGroupInAtariDead = function(groupName, neighbors) {
	for(var j=0; j<neighbors.length; j++) {
		if(this.isTerritory(neighbors[j])) {
			continue;
		}
		if(this.isGrouptInAtari(neighbors[j])) {
			return false;
		}
	}
	var color = this.getGroupColor(groupName);
	var ari = new Array();
	var arj = new Array();
	this.getAllLibsCoordinates(groupName, ari, arj);
	var i = ari[0];
	var j = arj[0];
	var ii;
	var jj;
	var count = 0;
	if(i>0) {
		ii = i-1;
		jj = j;
		var stone = this.board[ii][jj];
		var otherColor = this.getGroupColor(stone);
		if(stone != groupName && this.isSameColor(otherColor, color)) {
			return false;
		} else if (otherColor == T_GROUP || otherColor == S_GROUP || otherColor == D_GROUP) {
			count++;
		}
	}
	if(j>0) {
		ii = i;
		jj = j-1;
		var stone = this.board[ii][jj];
		var otherColor = this.getGroupColor(stone);
		if(stone != groupName && this.isSameColor(otherColor, color)) {
			return false;
		} else if (otherColor == T_GROUP || otherColor == S_GROUP || otherColor == D_GROUP) {
			count++;
		}
	}
	if(i<this.size-1) {
		ii = i+1;
		jj = j;
		var stone = this.board[ii][jj];
		var otherColor = this.getGroupColor(stone);
		if(stone != groupName && this.isSameColor(otherColor, color)) {
			return false;
		} else if (otherColor == T_GROUP || otherColor == S_GROUP || otherColor == D_GROUP) {
			count++;
		}
	}
	if(j<this.size-1) {
		ii = i;
		jj = j+1;
		var stone = this.board[ii][jj];
		var otherColor = this.getGroupColor(stone);
		if(stone != groupName && this.isSameColor(otherColor, color)) {
			return false;
		} else if (otherColor == T_GROUP || otherColor == S_GROUP || otherColor == D_GROUP) {
			count++;
		}
	}
	if(count<2) {
		return true;
	}
	return null;//can't say anything
};

SE.prototype.findDeadGroupsFromColor = function(color, expectedLibs, uninterrestingGroups, maxLibs, shallBeAloneInBigT, lookInSeveralTerritories) {
	var foundDead = false;
	for(var i=0; i<this.nGroup[color]; i++) {
		var groupName = color+i;
		if(uninterrestingGroups[groupName] == true) {
			continue;
		}
		if(this.getGroupStatus(groupName) != STATUS_UNKNOWN) {
			uninterrestingGroups[groupName] = true;
			continue;
		}
		var nLibs = this.countGroupLiberties(groupName);
		if(nLibs>maxLibs) {
			uninterrestingGroups[groupName] = true;
			continue;
		}
		if(nLibs != expectedLibs) {
			continue;
		}
		var neighbors = new Array();
		var counts = new Object();
		this.findGroupsAround(groupName, neighbors, counts);
		if(neighbors.length == 0) {//renamed groups
			uninterrestingGroups[groupName] = true;
			continue;
		}
		var territoryName = null;
		var hasMoreThanOneTerritory = false;
		for(var j=0; j<neighbors.length; j++) {
			if(this.isTerritory(neighbors[j])) {
				if(territoryName != null) {
					hasMoreThanOneTerritory = true;
					break;
				}
				territoryName = neighbors[j];
			}
		}
		var dMax = 6;
		var distance = this.minDistanceFromSameColorInT(groupName, dMax);
		if(nLibs != 1 && distance <dMax) {
			uninterrestingGroups[groupName] = true;
			continue;
		}
		var hasNoEye = (this.groupEyes[groupName].length == 0);
		if(hasMoreThanOneTerritory) {
			if(!hasNoEye) {
				uninterrestingGroups[groupName] = true;
				continue;
			}
			if(lookInSeveralTerritories) {
				foundDead |= this.checkGroupDeadInSeveralTerritories(groupName, nLibs, neighbors);
			}
			continue;
		}
		if(shallBeAloneInBigT && !this.isAloneIntT(groupName, territoryName)) {
			continue;
		}
		
		var canBeKilled = false;
		if(distance == null && this.countGroupSize(territoryName) > 10 && this.countGroupSize(groupName) < 3) {
				canBeKilled = true;
		} else {
			for(var j=0; j<neighbors.length; j++) {
				var ncolor = this.getGroupColor(neighbors[j]);
				if(this.isTerritory(neighbors[j])) {
					continue;
				}
				var neighborsLibs = this.countGroupLiberties(neighbors[j]);
				if(hasNoEye) {
					if(nLibs < neighborsLibs) {
		 				canBeKilled = true;
					} else if(nLibs >= neighborsLibs) {
		 				canBeKilled = false;
						break;
					}
				} else { 
					if(nLibs < neighborsLibs && this.groupEyes[groupName].length > 0) {
	 					canBeKilled = true;
					} else if(nLibs >= neighborsLibs) {
		 				canBeKilled = false;
						break;
					}
				}
			}
		}
		if(nLibs == 1) {
			var b = this.isGroupInAtariDead(groupName, neighbors);
			if( b!= null) {
				canBeKilled = b;
			} else if(distance <dMax) {
				continue;
			}
		}
		if(canBeKilled) {
			this.killGroup(groupName, neighbors);
			foundDead = true;
		}
	}
	return foundDead;
};

SE.prototype.findDeadGroups = function(lookInSeveralTerritories) {
	var foundDead = false;
	var uninterrestingBGroups = new Object();
	var uninterrestingWGroups = new Object();
	var maxLibs = 4;
	for(var expectedLibs =1; expectedLibs<maxLibs; expectedLibs++) {
		foundDead |= this.findDeadGroupsFromColor(B_GROUP, expectedLibs, uninterrestingBGroups, maxLibs, expectedLibs>2, lookInSeveralTerritories);
		foundDead |= this.findDeadGroupsFromColor(W_GROUP, expectedLibs, uninterrestingWGroups, maxLibs, expectedLibs>2, lookInSeveralTerritories);
	}
//groupes seuls (ou à plus de 10 d'un voisin) dans un seul T <=5 libs (incrémenter), avec moins de lib que ses voisins, ou n<=3(pas d'oeil) contre un >=3libs ?  ->mort + voisins connectés
//groupes n<=3 isolés dans un t entouré de couleur opposée, nt > 10 ->mort
	return foundDead;
};

SE.prototype.isNextToAliveColor = function(i, j, color, shouldBeAlive) {
	for(var kk=0; kk < DISTANCE1_I.length; kk++) {
		var ii = i+DISTANCE1_I[kk];
		var jj = j+DISTANCE1_J[kk];
		if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
			continue; 
		}
		if(color != this.getGroupColor(this.board[ii][jj])) {
			continue;
		}
		var status = this.getGroupStatus(this.board[ii][jj]);
		if(status == STATUS_ALIVE) {
			return true;
		}
		if(!shouldBeAlive && status == STATUS_UNKNOWN) {
			return true;
		}
	}
	return false;
};

SE.prototype.findDameAtPoint = function(i, j, shouldBeAlive) {
	var groupName = this.board[i][j];
	if(this.isTerritory(groupName)) {
		if(this.isNextToAliveColor(i, j, B_GROUP, shouldBeAlive) && this.isNextToAliveColor(i, j, W_GROUP, shouldBeAlive)) {
			groupName = this.newDGroup();
			this.board[i][j] = groupName;
			this.groupStatus[groupName] = STATUS_DAME;
		}
	}
};

SE.prototype.findDame = function(shouldBeAlive) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			this.findDameAtPoint(i, j, shouldBeAlive);
		}
	}
//t unkn entouré de couleurs différentes opposées et alive
//crée un nouveau group t !
};

SE.prototype.getAllLibsCoordinates = function(groupName, ari, arj) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			if(!this.isTerritory(this.board[i][j])) {
				continue;
			}
			if(this.isNextToGroup(i,j, groupName,null, null)) {
				ari.push(i);
				arj.push(j);
			}
		}
	}
};

SE.prototype.findGroupNamesNextToCoord = function(k, ari, arj, color, alreadyFound, counts, excludedGroupName) {
	var i = ari[k];
	var j = arj[k];
	var checkSameGroup = new Object();
	for(var kk=0; kk < DISTANCE1_I.length; kk++) {
		var ii = i+DISTANCE1_I[kk];
		var jj = j+DISTANCE1_J[kk];
		if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
			continue; 
		}
		var foundGroup = this.board[ii][jj];
		if(foundGroup != excludedGroupName && checkSameGroup[foundGroup] != true && color == this.getGroupColor(foundGroup)) {
			if(alreadyFound[foundGroup] != true) {
				alreadyFound[foundGroup] = true;
				counts[foundGroup] = new Array();
			}
			counts[foundGroup].push(k);
			checkSameGroup[foundGroup] = true;
		}
	}
};

SE.prototype.newDGroup = function() {
	var newDGroup = S_GROUP + this.nGroup[S_GROUP];
	this.nGroup[S_GROUP] += 1;
	this.groupStatus[newDGroup] = STATUS_UNKNOWN;
	return newDGroup;
};

SE.prototype.newSGroup = function() {
	//return this.newDGroup();
	var newSGroup = D_GROUP + this.nGroup[D_GROUP];
	this.nGroup[D_GROUP] += 1;
	this.groupStatus[newSGroup] = STATUS_UNKNOWN;
	return newSGroup;
};

SE.prototype.findConnectionsFromColor = function(color) {
	var found = false;

	for(var i=1;i<this.size-1;i++) {
		for(var j=1;j<this.size-1;j++) {
			found |= this.findTriangleConnections(i, j, color);
		}
	}

	for(var i=0; i<this.nGroup[color]; i++) {
		var groupName = color+i;
		if(this.getGroupStatus(groupName) != STATUS_UNKNOWN) {
			continue;
		}
		var ari = new Array();
		var arj = new Array();
		this.getAllLibsCoordinates(groupName, ari, arj);
		if(ari.length == 0) {//renamed group
			continue;
		}
		var alreadyFound = new Object();
		var counts = new Object();
		for(var k=0; k<ari.length; k++) {
			this.findGroupNamesNextToCoord(k, ari, arj, color, alreadyFound, counts, groupName);
		}
		for(var name in counts) {
			if(counts[name].length >1) {
				for(var j=0; j<counts[name].length; j++) {
					var k = counts[name][j];
					this.board[ari[k]][arj[k]] = this.newDGroup();
					this.groupStatus[this.board[ari[k]][arj[k]]] = STATUS_UNKNOWN;
					this.findDameAtPoint(ari[k], arj[k], true);
				}
				//TOCHECK: correct also if name is dead?			
				this.renameGroup(groupName, name);
				found = true;
			}
		}
	}

	return found;
};


SE.prototype.findTriangleConnections = function(i, j, color) {
	var stone = this.board[i][j];
	if(this.getGroupStatus(stone) != STATUS_UNKNOWN) {
		return false;
	}
	if(this.getGroupColor(stone) != T_GROUP) {
		return false;
	}
	var territoryFound = false;
	var oneIsALive = false;
	var cGroups = new Array();
	
	for(var k=0; k < DISTANCE1_I.length; k++) {
		var ii = i+DISTANCE1_I[k];
		var jj = j+DISTANCE1_J[k];
		if(ii<0 || jj<0 || ii>this.size-1 || jj>this.size-1) {
			continue;
		}
		var s = this.board[ii][jj];
		var c = this.getGroupColor(s);
		if(this.isTerritory(s)) {
			if(territoryFound) {
				return false;
			} else {
				territoryFound = true;
			}
		} else if(this.isSameColor(c, color)) {
			if(this.isGrouptInAtari(s)) {
				return false;
			}
			if(c == B_GROUP || c == W_GROUP) {//not marked
				cGroups.push(s);
			}
			if(this.getGroupStatus(s) == STATUS_ALIVE){
				oneIsALive = true;
			}
		} else {
			return false;
		}
	}
	var found = false;
	for(var k=1; k < cGroups.length; k++) {
		this.renameGroup(cGroups[k], cGroups[0]);
		if(oneIsALive) {
			this.groupStatus[cGroups[0]] = STATUS_ALIVE;
		}
		found = true;
	}
	return found;
};


SE.prototype.findConnections = function() {
//les groupes ayant deux libs en commun sont connectés (et vivants si l'un l'est)
	var found = false;
	found |= this.findConnectionsFromColor(B_GROUP);
	found |= this.findConnectionsFromColor(W_GROUP);
	found |= this.estimateConnection1122();
	return found;
};

SE.prototype.setGroupStatusAliveFromSpaceNearBorder = function() {
//faire un nouveau groupe t y?
//au moins 6 sous le bord à moins de 2 de distance d'un même groupe et plus de 2 de la couleur opposée, sur les deux premieres lignes = 1y
//au moins 8 = 2y -> alive?
//ne sert pas à déterminer t, que alive
};


SE.prototype.simplifyBorders = function() {
	this.simplifyBorders11();
	this.simplifyBorders12();
};

SE.prototype.simplifyBorders11 = function() {
	for(var i=1; i <this.size-2; i++) {
		var j=0;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j]) != STATUS_UNKNOWN) {
			continue;
		}

/*		if(!this.isTerritory(this.board[i-1][j])) {
			continue;
		}*/
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i+1][j])) {
			continue;
		}
/*		if(!this.isTerritory(this.board[i+2][j])) {
			continue;
		}*/
		var color1 = this.getGroupColor(this.board[i][j+1]);
		if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i][j+1]) == STATUS_DEAD) {
			continue;
		}		
		var color2 = this.getGroupColor(this.board[i+1][j+1]);
		if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j+1]) == STATUS_DEAD) {
			continue;
		}		
		this.board[i][j] = this.newSGroup();
		this.board[i+1][j] = this.newSGroup();
		if(!this.isSameColor(color1, color2)) {
			this.groupStatus[this.board[i][j]] = STATUS_DAME;
			this.groupStatus[this.board[i+1][j]] = STATUS_DAME;
		}
	}
	for(var i=1; i <this.size-2; i++) {
		var j=this.size-1;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j]) != STATUS_UNKNOWN) {
			continue;
		}

/*		if(!this.isTerritory(this.board[i-1][j])) {
			continue;
		}*/
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i+1][j])) {
			continue;
		}
/*		if(!this.isTerritory(this.board[i+2][j])) {
			continue;
		}*/
		var color1 = this.getGroupColor(this.board[i][j-1]);
		if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i][j-1]) == STATUS_DEAD) {
			continue;
		}		
		var color2 = this.getGroupColor(this.board[i+1][j-1]);
		if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j-1]) == STATUS_DEAD) {
			continue;
		}		
		this.board[i][j] = this.newSGroup();
		this.board[i+1][j] = this.newSGroup();
		if(!this.isSameColor(color1, color2)) {
			this.groupStatus[this.board[i][j]] = STATUS_DAME;
			this.groupStatus[this.board[i+1][j]] = STATUS_DAME;
		}
	}
	for(var j=1; j<this.size-2; j++) {
		var i=0;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i][j+1]) != STATUS_UNKNOWN) {
			continue;
		}

/*		if(!this.isTerritory(this.board[i][j-1])) {
			continue;
		}*/
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j+1])) {
			continue;
		}
/*		if(!this.isTerritory(this.board[i][j+2])) {
			continue;
		}*/
		var color1 = this.getGroupColor(this.board[i+1][j]);
		if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j]) == STATUS_DEAD) {
			continue;
		}		
		var color2 = this.getGroupColor(this.board[i+1][j+1]);
		if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j+1]) == STATUS_DEAD) {
			continue;
		}		
		this.board[i][j] = this.newSGroup();
		this.board[i][j+1] = this.newSGroup();
		if(!this.isSameColor(color1, color2)) {
			this.groupStatus[this.board[i][j]] = STATUS_DAME;
			this.groupStatus[this.board[i][j+1]] = STATUS_DAME;
		}
	}
	for(var j=1; j<this.size-2; j++) {
		var i=this.size-1;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i][j+1]) != STATUS_UNKNOWN) {
			continue;
		}

/*		if(!this.isTerritory(this.board[i][j-1])) {
			continue;
		}*/
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j+1])) {
			continue;
		}
/*		if(!this.isTerritory(this.board[i][j+2])) {
			continue;
		}*/
		var color1 = this.getGroupColor(this.board[i-1][j]);
		if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i-1][j]) == STATUS_DEAD) {
			continue;
		}		
		var color2 = this.getGroupColor(this.board[i-1][j+1]);
		if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
			continue;
		}
		if(this.getGroupStatus(this.board[i-1][j+1]) == STATUS_DEAD) {
			continue;
		}		
		this.board[i][j] = this.newSGroup();
		this.board[i][j+1] = this.newSGroup();
		if(!this.isSameColor(color1, color2)) {
			this.groupStatus[this.board[i][j]] = STATUS_DAME;
			this.groupStatus[this.board[i][j+1]] = STATUS_DAME;
		}
	}
};

SE.prototype.simplifyBorders12 = function() {
	for(var i=1; i <this.size-2; i++) {
		var j=0;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j]) != STATUS_UNKNOWN) {
			continue;
		}

		if(!this.isTerritory(this.board[i-1][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i+1][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i+2][j])) {
			continue;
		}
		if(this.getGroupColor(this.board[i][j+1]) != T_GROUP && this.getGroupColor(this.board[i+1][j+1]) == T_GROUP
											 && this.getGroupColor(this.board[i+1][j+2]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i][j+1]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i+1][j+2]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i+1][j] = this.newDGroup();
			}
		} else if(this.getGroupColor(this.board[i+1][j+1]) != T_GROUP && this.getGroupColor(this.board[i][j+1]) == T_GROUP
											 && this.getGroupColor(this.board[i][j+2]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i+1][j+1]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i][j+2]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i][j] = this.newDGroup();
			}
		}
	}
	for(var i=1; i <this.size-2; i++) {
		var j=this.size-1;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i+1][j]) != STATUS_UNKNOWN) {
			continue;
		}

		if(!this.isTerritory(this.board[i-1][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i+1][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i+2][j])) {
			continue;
		}
		if(this.getGroupColor(this.board[i][j-1]) != T_GROUP && this.getGroupColor(this.board[i+1][j-1]) == T_GROUP
											 && this.getGroupColor(this.board[i+1][j-2]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i][j-1]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i+1][j-2]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i+1][j] = this.newDGroup();
			}
		} else if(this.getGroupColor(this.board[i+1][j-1]) != T_GROUP && this.getGroupColor(this.board[i][j-1]) == T_GROUP
											 && this.getGroupColor(this.board[i][j-2]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i+1][j-1]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i][j-2]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i][j] = this.newDGroup();
			}
		}
	}
	for(var j=1; j<this.size-2; j++) {
		var i=0;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i][j+1]) != STATUS_UNKNOWN) {
			continue;
		}

		if(!this.isTerritory(this.board[i][j-1])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j+1])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j+2])) {
			continue;
		}
		if(this.getGroupColor(this.board[i+1][j]) != T_GROUP && this.getGroupColor(this.board[i+1][j+1]) == T_GROUP
											 && this.getGroupColor(this.board[i+2][j+1]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i+1][j]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i+2][j+1]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i][j+1] = this.newDGroup();
			}
		} else if(this.getGroupColor(this.board[i+1][j+1]) != T_GROUP && this.getGroupColor(this.board[i+1][j]) == T_GROUP
											 && this.getGroupColor(this.board[i+2][j]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i+1][j+1]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i+2][j]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i][j] = this.newDGroup();
			}
		}
	}
	for(var j=1; j<this.size-2; j++) {
		var i=this.size-1;
		if(this.getGroupStatus(this.board[i][j]) != STATUS_UNKNOWN) {
			continue;
		}
		if(this.getGroupStatus(this.board[i][j+1]) != STATUS_UNKNOWN) {
			continue;
		}

		if(!this.isTerritory(this.board[i][j-1])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j+1])) {
			continue;
		}
		if(!this.isTerritory(this.board[i][j+2])) {
			continue;
		}
		if(this.getGroupColor(this.board[i-1][j]) != T_GROUP && this.getGroupColor(this.board[i-1][j+1]) == T_GROUP
											 && this.getGroupColor(this.board[i-2][j+1]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i-1][j]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i-2][j+1]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i][j+1] = this.newDGroup();
			}
		} else if(this.getGroupColor(this.board[i-1][j+1]) != T_GROUP && this.getGroupColor(this.board[i-1][j]) == T_GROUP
											 && this.getGroupColor(this.board[i-2][j]) != T_GROUP) {
			var color1 = this.getGroupColor(this.board[i-1][j+1]);
			if(color1 == T_GROUP || color1 == S_GROUP || color1 == D_GROUP) {
				continue;
			}
			var color2 = this.getGroupColor(this.board[i-2][j]);
			if(color2 == T_GROUP || color2 == S_GROUP || color2 == D_GROUP) {
				continue;
			}
			if(!this.isSameColor(color1, color2)) {
				this.board[i][j] = this.newDGroup();
			}
		}
	}

};

SE.prototype.resetTGroups = function() {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var color;
			var stone = this.board[i][j];
			if(this.getGroupStatus(stone) != STATUS_UNKNOWN) {
				continue;
			}
			if(this.getGroupColor(stone) != T_GROUP) {
				continue;
			}
			var newSGroup = this.aggregateGroups(T_GROUP, i, j);
			this.board[i][j] = newSGroup;
			this.groupStatus[newSGroup] = STATUS_UNKNOWN;
		}
	}
};

SE.prototype.shouldDame = function(i, j, groups) {
	var stone = this.board[i][j];
	if(this.isTerritory(stone) || this.getGroupStatus(stone) == STATUS_DEAD) {
		return false;
	}
	var color = this.getGroupColor(stone);
	for(var name in groups) {
		if(!this.isSameColor(color, groups[name])) {
			return true;
		}
	}
	groups[this.board[i][j]] = color;
	return false;
};

SE.prototype.estimateDame = function() {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var color;
			var stone = this.board[i][j];
			if(this.getGroupStatus(stone) != STATUS_UNKNOWN) {
				continue;
			}
			if(this.getGroupColor(stone) != T_GROUP) {
				continue;
			}
			var groups = new Object();
			var addDame = false;
			if(!addDame && i>0) {
				addDame = this.shouldDame(i-1,j, groups);
			}
			if(!addDame && i < this.size-1) {
				addDame = this.shouldDame(i+1,j, groups);
			}
			if(!addDame && j>0) {
				addDame = this.shouldDame(i,j-1, groups);
			}
			if(!addDame && j<this.size-1) {
				addDame = this.shouldDame(i,j+1, groups);
			}
			if(addDame) {
				this.board[i][j] = this.newDGroup();
				this.groupStatus[this.board[i][j]] = STATUS_UNKNOWN;
			}
		}
	}
	//TODO: deux meme couleurs sur 2eme ligne -> dame en dessous pour fermer
};

SE.prototype.checkSimpleEyesAtPoint = function(i, j) {
/*chercher
?BB
B.B
?BB
*/
	var groupName = this.board[i][j];
	if(this.isTerritory(groupName)) {
		var isNextToBlack = this.isNextToAliveColor(i, j, B_GROUP, false);
		var isNextToWhite = this.isNextToAliveColor(i, j, W_GROUP, false);
		if(isNextToBlack == isNextToWhite) {
			return;
		}
		if(this.isNextToColor(i, j, T_GROUP) || this.isNextToColor(i, j, S_GROUP) || this.isNextToColor(i, j, D_GROUP)) {
			return;
		}
		var okColor;
		var badColor;
		var statusEye;
		if(isNextToBlack) {
			okColor = B_GROUP;
			badColor = W_GROUP;
			statusEye = STATUS_EYE_BLACK;
		} else {
			okColor = W_GROUP;
			badColor = B_GROUP;
			statusEye = STATUS_EYE_WHITE;
		}

		var needThreeConnections = false;
		var color;
		var stone;
		var ii;
		var jj;
		
		ii = i-1;
		jj = j-1;
		var stone = this.board[ii][jj];
		var color = this.getGroupColor(stone);
		if(color == T_GROUP || color == S_GROUP || color == D_GROUP) {
			color = T_GROUP;
			if(this.isNextToColor(ii, jj, badColor)) {
				needThreeConnections = true;
			} else if(this.findTriangleConnections(ii, jj, okColor)) {
				color = okColor;
			}
		} else if(color == badColor && this.isGrouptInAtari(stone)) {
			color = T_GROUP;
		}
		var stone00 = stone;
		var color00 = color;

		ii = i+1;
		jj = j-1;
		var stone = this.board[ii][jj];
		var color = this.getGroupColor(stone);
		if(color == T_GROUP || color == S_GROUP || color == D_GROUP) {
			color = T_GROUP;
			if(this.isNextToColor(ii, jj, badColor)) {
				needThreeConnections = true;
			} else if(this.findTriangleConnections(ii, jj, okColor)) {
				color = okColor;
			}
		} else if(color == badColor && this.isGrouptInAtari(stone)) {
			color = T_GROUP;
		}
		var stone20 = stone;
		var color20 = color;

		ii = i+1;
		jj = j+1;
		var stone = this.board[ii][jj];
		var color = this.getGroupColor(stone);
		if(color == T_GROUP || color == S_GROUP || color == D_GROUP) {
			color = T_GROUP;
			if(this.isNextToColor(ii, jj, badColor)) {
				needThreeConnections = true;
			} else if(this.findTriangleConnections(ii, jj, okColor)) {
				color = okColor;
			}
		} else if(color == badColor && this.isGrouptInAtari(stone)) {
			color = T_GROUP;
		}
		var stone22 = stone;
		var color22 = color;

		ii = i-1;
		jj = j+1;
		var stone = this.board[ii][jj];
		var color = this.getGroupColor(stone);
		if(color == T_GROUP || color == S_GROUP || color == D_GROUP) {
			color = T_GROUP;
			if(this.isNextToColor(ii, jj, badColor)) {
				needThreeConnections = true;
			} else if(this.findTriangleConnections(ii, jj, okColor)) {
				color = okColor;
			}
		} else if(color == badColor && this.isGrouptInAtari(stone)) {
			color = T_GROUP;
		}
		var stone02 = stone;
		var color02 = color;
		
		var count=0;
		if(color00 == okColor) {
			count++;
		}
		if(color02 == okColor) {
			count++;
		}
		if(color22 == okColor) {
			count++;
		}
		if(color20 == okColor) {
			count++;
		}
		if(count<2) {
			return;
		} else if(count == 2) {
			if((color00 == T_GROUP || color00 == badColor) && (color22 == T_GROUP || color22 == badColor)) {
				return;
			}
			if((color20 == T_GROUP || color20 == badColor) && (color02 == T_GROUP || color02 == badColor)) {
				return;
			}
			var countT = 0;
			if(color00 == T_GROUP && !this.territoryStatusIsKo(stone00)) {
				count++;
			}
			if(color02 == T_GROUP && !this.territoryStatusIsKo(stone02)) {
				count++;
			}
			if(color22 == T_GROUP && !this.territoryStatusIsKo(stone22)) {
				count++;
			}
			if(color20 == T_GROUP && !this.territoryStatusIsKo(stone20)) {
				count++;
			}
			if(countT != 2) {
				return;
			}
		}
		
		this.board[i][j] = this.newSGroup();
		this.groupStatus[this.board[i][j]] = statusEye;
		//console.log("found eye at: "+i+", "+j);
	}
};

SE.prototype.checkSimpleEyes = function() {
	for(var i=1;i<this.size-1;i++) {
		for(var j=1;j<this.size-1;j++) {
			this.checkSimpleEyesAtPoint(i, j);
		}
	}
};

SE.prototype.removePseudoDameAtPoint = function(i, j) {
	var territoryStatus = null;
	var color = null;
	var territoryName = null;
	for(var k=0; k < DISTANCE1_I.length; k++) {
		var ii = i+DISTANCE1_I[k];
		var jj = j+DISTANCE1_J[k];
		if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
			continue; 
		}
		var s = this.board[ii][jj];
		var c = this.getGroupColor(s);
		if(c == S_GROUP || c == D_GROUP) {
			continue;
		}
		var status = this.getGroupStatus(s);
		if(status == STATUS_EYE_BLACK) {
			status = STATUS_TERRITORY_BLACK;
		} else if(status == STATUS_EYE_WHITE) {
			status = STATUS_TERRITORY_WHITE;
		}
		if(c == T_GROUP) {
			if(territoryStatus == null) {
				territoryStatus = status;
				territoryName = s;
			} else {
				if(status != territoryStatus) {
					return;
				}
			}
		} else {
			if(c == B_GROUP_MARKED_DEAD) {
				c = W_GROUP;
			} else if(c == W_GROUP_MARKED_DEAD) {
				c = B_GROUP;
			} else if(status == STATUS_DEAD) {
				if(this.isSameColor(c, B_GROUP)) {
					c = W_GROUP;
				} else {
					c = B_GROUP;
				}
			}
			if(color == null) {
				color = c;
			} else{
				if(!this.isSameColor(c, color)){
					return;
				}
			}
		}
	}
	if(territoryName == null) {
		if(color == null) {
			return;
		}
		territoryName = T_GROUP + this.nGroup[T_GROUP];
		this.nGroup[T_GROUP] += 1;
		if(this.isBlack(color)) {
			this.groupStatus[territoryName] = STATUS_TERRITORY_BLACK;
		} else {
			this.groupStatus[territoryName] = STATUS_TERRITORY_WHITE;
		}
	}
	this.board[i][j] = territoryName;
};

SE.prototype.removePseudoDame = function() {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var color;
			var stone = this.board[i][j];
			if(this.getGroupColor(stone) != S_GROUP) {
				continue;
			}
			var status = this.getGroupStatus(stone);
			if(status == STATUS_EYE_BLACK || status == STATUS_EYE_WHITE) {
				continue;
			} else if (status == STATUS_DAME) {
				this.groupStatus[stone] = STATUS_UNKNOWN;
			}
			this.removePseudoDameAtPoint(i, j);
		}
	}
};

SE.prototype.isConnected1122 = function(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32 ) {
	if(stone11 == stone22) {
		return false;
	}
	if(!this.isTerritory(stone00) || !this.isTerritory(stone10) || !this.isTerritory(stone20) || !this.isTerritory(stone30)) {
		return false;
	}
	if(this.isTerritory(stone11) || !this.isTerritory(stone21) || this.isTerritory(stone22) ) {
		return false;
	}
	if(this.getGroupStatus(stone11) == STATUS_DEAD || this.getGroupStatus(stone22) == STATUS_DEAD) {
		return false;
	}
	var color = this.getGroupColor(stone11);
	if(!this.isSameColor(this.getGroupColor(stone22), color)) {
		return false;
	}
	if(!this.isTerritory(stone01) && !this.isSameColor(this.getGroupColor(stone01), color)) {
		return false;
	}
	if(!this.isTerritory(stone31) && !this.isSameColor(this.getGroupColor(stone31), color)) {
		return false;
	}
	if(!this.isTerritory(stone32) && !this.isSameColor(this.getGroupColor(stone32), color)) {
		return false;
	}
	return true;
};

SE.prototype.estimateConnection1122 = function() {
/*
?=B ou *
   B?
?B*?
****
----
*/
	var found = false;

	for(var i=1; i <this.size-2; i++) {
		var j=0;

		var stone00=this.board[i-1][j];
		var stone10=this.board[i][j];
		var stone20=this.board[i+1][j];
		var stone30=this.board[i+2][j];
		var stone01=this.board[i-1][j+1];
		var stone11=this.board[i][j+1];
		var stone21=this.board[i+1][j+1];
		var stone31=this.board[i+2][j+1];
		var stone22=this.board[i+1][j+2];
		var stone32=this.board[i+2][j+2];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i][j+1], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i+1][j] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}

		var stone30=this.board[i-1][j];
		var stone20=this.board[i][j];
		var stone10=this.board[i+1][j];
		var stone00=this.board[i+2][j];
		var stone31=this.board[i-1][j+1];
		var stone21=this.board[i][j+1];
		var stone11=this.board[i+1][j+1];
		var stone01=this.board[i+2][j+1];
		var stone32=this.board[i-1][j+2];
		var stone22=this.board[i][j+2];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i+1][j+1], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i][j] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}
	}
		
	for(var i=1; i <this.size-2; i++) {
		var j=this.size-1;

		var stone00=this.board[i-1][j];
		var stone10=this.board[i][j];
		var stone20=this.board[i+1][j];
		var stone30=this.board[i+2][j];
		var stone01=this.board[i-1][j-1];
		var stone11=this.board[i][j-1];
		var stone21=this.board[i+1][j-1];
		var stone31=this.board[i+2][j-1];
		var stone22=this.board[i+1][j-2];
		var stone32=this.board[i+2][j-2];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i][j-1], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i+1][j] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}

		var stone30=this.board[i-1][j];
		var stone20=this.board[i][j];
		var stone10=this.board[i+1][j];
		var stone00=this.board[i+2][j];
		var stone31=this.board[i-1][j-1];
		var stone21=this.board[i][j-1];
		var stone11=this.board[i+1][j-1];
		var stone01=this.board[i+2][j-1];
		var stone32=this.board[i-1][j-2];
		var stone22=this.board[i][j-2];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i+1][j-1], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i][j] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}
	}
		
	for(var j=1; j <this.size-2; j++) {
		var i=0;

		var stone00=this.board[i][j-1];
		var stone10=this.board[i][j];
		var stone20=this.board[i][j+1];
		var stone30=this.board[i+2][j];
		var stone01=this.board[i+1][j-1];
		var stone11=this.board[i+1][j];
		var stone21=this.board[i+1][j+1];
		var stone31=this.board[i+1][j+2];
		var stone22=this.board[i+2][j+1];
		var stone32=this.board[i+2][j+2];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i+1][j], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i][j+1] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}

		var stone30=this.board[i][j-1];
		var stone20=this.board[i][j];
		var stone10=this.board[i][j+1];
		var stone00=this.board[i][j+2];
		var stone31=this.board[i+1][j-1];
		var stone21=this.board[i+1][j];
		var stone11=this.board[i+1][j+1];
		var stone01=this.board[i+1][j+2];
		var stone32=this.board[i+2][j-1];
		var stone22=this.board[i+2][j];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i+1][j+1], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i][j] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}
	}

	for(var j=1; j <this.size-2; j++) {
		var i=this.size-1;

		var stone00=this.board[i][j-1];
		var stone10=this.board[i][j];
		var stone20=this.board[i][j+1];
		var stone30=this.board[i-2][j];
		var stone01=this.board[i-1][j-1];
		var stone11=this.board[i-1][j];
		var stone21=this.board[i-1][j+1];
		var stone31=this.board[i-1][j+2];
		var stone22=this.board[i-2][j+1];
		var stone32=this.board[i-2][j+2];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i-1][j], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i][j+1] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}

		var stone30=this.board[i][j-1];
		var stone20=this.board[i][j];
		var stone10=this.board[i][j+1];
		var stone00=this.board[i][j+2];
		var stone31=this.board[i-1][j-1];
		var stone21=this.board[i-1][j];
		var stone11=this.board[i-1][j+1];
		var stone01=this.board[i-1][j+2];
		var stone32=this.board[i-2][j-1];
		var stone22=this.board[i-2][j];

		if(this.isConnected1122(stone00, stone10, stone20, stone30, stone01, stone11, stone21, stone31, stone22, stone32)) {
			var alive = (this.getGroupStatus(stone11) == STATUS_ALIVE);
			this.renameGroup(this.board[i-1][j+1], stone22);
			if(alive) {
				this.groupStatus[stone22] = STATUS_ALIVE;
			}
			if(this.getGroupStatus(stone20) == STATUS_UNKNOWN) {
				var newDame = this.newDGroup();
				this.board[i][j] = newDame;
				this.groupStatus[newDame] = STATUS_DAME;
			}
			found = true;
		}
	}
	return found;
};

SE.prototype.getStatusByRadiation = function(i0, j0, dMax) {
	
	var weight = [100, 80, 40, 20, 10, 5, 2, 1];
	var oldCoords = new Object();
	var ari = new Array();
	var arj = new Array();
	ari.push(i0);
	arj.push(j0);
	var distance = 0;
	
	var found = false;
	var sum = 0;
	
	for(var distance=1;distance<dMax+3;distance++) {
	if(distance > dMax && !found) {
		break;
	}

	var newari = new Array();
	var newarj = new Array();

	for(var k=0;k<ari.length;k++) {
		var i = ari[k];
		var j = arj[k];
		if(oldCoords[i+1000*j] == true) {
			continue;
		}
		oldCoords[i+1000*j] = true;
		for(var kk=0; kk < DISTANCE1_I.length; kk++) {
			var ii = i+DISTANCE1_I[kk];
			var jj = j+DISTANCE1_J[kk];
			if(ii <0 || ii > this.size-1 || jj<0 || jj > this.size-1) {
				continue; 
			}
			var stone = this.board[ii][jj];
			var color = this.getGroupColor(stone);
			if(this.isTerritory(stone)) {
				newari.push(ii);
				newarj.push(jj);
			}
			else {
				found = true;
				if(this.getGroupStatus(stone) != STATUS_DEAD) {
					var multiplier = 1;
					if(this.countGroupSize(stone) == 1) {
						multiplier = 0.6;
					}
					if(this.isBlack(color)) {
						sum += weight[distance]*multiplier;
					} else if(this.isWhite(color)) {
						sum -= weight[distance]*multiplier;
					}
				} else {
					if(this.isBlack(color)) {
						sum -= weight[distance];
					} else if(this.isWhite(color)) {
						sum += weight[distance];
					}
				}
			}
		}
	}
	ari = newari;
	arj = newarj;
	newari = new Array();
	newarj = new Array();
	}
	
	if(sum < 20 && sum > -20) {
		return STATUS_UNKNOWN;
	}

	return (sum > 0) ? STATUS_TERRITORY_BLACK : STATUS_TERRITORY_WHITE;
};

SE.prototype.estimateUnknownTerritory = function() {
//distance(noir vivant)<4 et distance(noir vivant)>distance(blanc vivant)+1 -> t
	var ari_b = new Array();
	var arj_b = new Array();
	var ari_w = new Array();
	var arj_w = new Array();
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var color;
			var stone = this.board[i][j];
			if(this.getGroupStatus(stone) != STATUS_UNKNOWN) {
				continue;
			}
			if(!this.isTerritory(stone)) {
				continue;
			}
			var maxDist = 2;
			if(i<3 || j < 3 || i>this.size-3 || j>this.size-3) {
				maxDist =3;
			}
			var newStatus = this.getStatusByRadiation(i, j, maxDist);
			if(newStatus != STATUS_UNKNOWN) {
				if(newStatus == STATUS_TERRITORY_BLACK && this.isNextToAliveColor(i, j, W_GROUP, false)) {
					newStatus = STATUS_DAME;
				} else if(newStatus == STATUS_TERRITORY_WHITE && this.isNextToAliveColor(i, j, B_GROUP, false)) {
					newStatus = STATUS_DAME;
				}
			
				var newSGroup = T_GROUP + this.nGroup[T_GROUP];
				this.board[i][j] = newSGroup;
				this.nGroup[T_GROUP] += 1;
				this.groupStatus[newSGroup] = newStatus;
			}
		}
	}
};

/*
-- dame
-- some dead groups
-- some patterns along border
-- some eyes
-- some double-eyes
-- ko
-- groups info used for better territory estimation
-- for unknown territories, estimation from distance to stones with more territory near border
-- toggle can be called several times (seems to fail with "estimator")
*/
