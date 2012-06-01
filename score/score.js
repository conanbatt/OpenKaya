var BLACK = "B";
var WHITE = "W";
var EMPTY = "*";
var BLACK_DEAD = "N";
var WHITE_DEAD = "E";
var NO_OWNER = "X";
var READY = "R";


function Score(ruleset, board_original) {
	this.init.apply(this, [ruleset, board_original]);
}

Score.prototype = {
	init: function(ruleset, board_original) {
		if (ruleset == "Japanese") {
			this._deadStonesMultiplier = 2
		}
		if (ruleset == "Chinese") {
			this._deadStonesMultiplier = 1
		}
		this.grid = this.clone_board(board_original);
		this.ruleset = ruleset;
		this.dead_groups = [];
	},

	string_grid: function() {
		var size = this.grid.length;
		var s = "[\n";
		for (var row in this.grid) {
			s += "[";
			for (var col in this.grid[row]) {
				s += '"' + this.grid[row][col] + '", ';
			}
			s += "],\n";
		}
		return s + "]";
	},

	clone_board: function(board) {
		var dup = [];
		var tmp = [];
		for (var row in board) {
			for (var col in board) {
				tmp[col] = (board[row][col] == undefined ? EMPTY : board[row][col]);
			}
			dup.push(tmp);
			tmp = [];
		}
		return dup;
	},

	set_dead_group: function(dead_group) {
		var size = dead_group.length;
		if (size <= 0) {
			return false;
		}
		var color = (dead_group[0].color == BLACK ? BLACK_DEAD : WHITE_DEAD);
		for (var i = 0; i < size; i++) {
			this.grid[dead_group[i].row][dead_group[i].col] = color;
		}
	},

	kill_stone: function(color, row, col) {
		if (color == BLACK) {
			if (this.grid[row][col] == BLACK_DEAD) {
				return false;
			}
			this.grid[row][col] = BLACK_DEAD;
		} else {
			if (this.grid[row][col] == WHITE_DEAD) {
				return false;
			}
			this.grid[row][col] = WHITE_DEAD;
		}

		this.clear_visited();
		/*
		// Hellrider version, maybe too agressive.
		var deads = this.connected_component(row, col).deads;
		deads[color].push({color: color, row: row, col: col});
		this.dead_groups.push(deads[WHITE]);
		this.dead_groups.push(deads[BLACK]);

		var dead_color = (color == BLACK ? BLACK_DEAD : WHITE_DEAD);
		for (var i = 0, li = deads[WHITE].length; i < li; ++i) {
			this.grid[deads[WHITE][i].row][deads[WHITE][i].col] = WHITE;
		}
		for (var i = 0, li = deads[BLACK].length; i < li; ++i) {
			this.grid[deads[BLACK][i].row][deads[BLACK][i].col] = BLACK;
		}
		*/
		var group = this.connected_component(row, col).deads[color];
		group.push({color: color, row: row, col: col});
		this.dead_groups.push(group);

		var dead_color = (color == BLACK ? BLACK_DEAD : WHITE_DEAD);
		for (var i = 0, li = group.length; i < li; ++i) {
			this.grid[group[i].row][group[i].col] = dead_color;
		}
		return true;
	},

	revive_stone: function(color, row, col) {
		if (this.grid[row][col] == BLACK || this.grid[row][col] == WHITE) {
			return false;
		}
		var group;
		var i = 0;
		while (i < this.dead_groups.length) {
			if (inArrayDeep({color: color, row: row, col: col}, this.dead_groups[i])) {
				group = this.dead_groups.splice(i, 1)[0]; //XXX Warning [0]
				for (var j = 0, lj = group.length; j < lj; ++j) {
					this.grid[group[j].row][group[j].col] = group[j].color;
				}
				//break; // TODO: check if enabling this could help with performance.
				         // The fact is that it was enabled before the bug, and it was disabled to fix it.
				         // but now that the stones are all marked in the grid, and thus is not possible to have a repeated dead_group, this might be unhelpful.
				         // NOTE: with the stones marked, IS IT IMPOSSIBLE TO HAVE DUPLICATED DEAD GROUPS????
			} else {
				i++;
			}
		}
		return true;
	},

	can_kill_stone: function(color, row, col) {
		if (color == BLACK) {
			if (this.grid[row][col] == BLACK_DEAD) {
				return false;
			}
			this.grid[row][col] = BLACK_DEAD;
		} else {
			if (this.grid[row][col] == WHITE_DEAD) {
				return false;
			}
			this.grid[row][col] = WHITE_DEAD;
		}

		this.clear_visited();
		var res = this.connected_component(row, col);

		this.grid[row][col] = color;

		return !(res.dead_count[BLACK] > 0 && res.dead_count[WHITE] > 0);
	},

	clear_visited: function() {
		// Visited grid (to avoid changes in Score.grid)
		var size = this.grid.length;
		this.visited = Array(size);
		for (var row = 0 ; row < size ; row++) {
			this.visited[row] = Array(size);
		}
	},

	calculate_score: function() {
		var board = this.grid;
		var size = board.length; // Localize length for better performance
		var cur_type;
		var result = {
			white_points: 0,
			black_points: 0,
			groups: []
		};

		this.clear_visited();

		for (var i = 0, li = this.dead_groups.length; i < li; ++i) {
			this.set_dead_group(this.dead_groups[i]);
		}

		for (var row = 0; row < size; ++row) {
			for (var col = 0; col < size; ++col) {
				cur_type = board[row][col];
				if (cur_type == EMPTY) {
					result.groups = result.groups.concat(this.connected_component(row, col));
				} else if (this.ruleset == 'Chinese') {
					if (cur_type == WHITE) {
						result.white_points++;
					} else if (cur_type == BLACK) {
						result.black_points++;
					}
				}
			}
		}

		// Post process
		var item;
		for (var index in result.groups) {
			item = result.groups[index];
			if(this.ruleset == 'Chinese') {
				if (item.owner == BLACK) {
					result.black_points += item.score + (item.dead_count.W * this._deadStonesMultiplier);
				} else if (item.owner == WHITE) {
					result.white_points += item.score + (item.dead_count.B * this._deadStonesMultiplier);
				}
			}
			if(this.ruleset == 'Japanese') {
				if (item.owner == BLACK || item.owner == WHITE) {
					//check the empty intersections surrounded by the group = is it one or more empty intersections? 2+ = alive, not seki for sure
					one_eye = !this.other_empty_space(item, result.groups);
					//if only one eye, check if it's a living shape: if it's a dead shape, it's a seki, the points don't count
					living_shape = (one_eye && this.living_shape(item.empty));
					if (item.owner == BLACK) {
						if(one_eye && !living_shape) {
							result.black_points += item.dead_count.W;
							item.owner = NO_OWNER;
						} else {
							result.black_points += item.score + (item.dead_count.W * this._deadStonesMultiplier);
						}
					} else if (item.owner == WHITE) {
						if(one_eye && !living_shape) {
							result.white_points += item.dead_count.B;
							item.owner = NO_OWNER;
						} else {
							result.white_points += item.score + (item.dead_count.B * this._deadStonesMultiplier);
						}
					}
				}
			}
		}

		this.white_points = result.white_points;
		this.black_points = result.black_points;

		return result;
	},

	calculate_result: function(captured, komi) {
		var res_white = 0;
		var res_black = 0;
		if (komi != undefined) {
			if (komi > 0) {
				res_white += komi;
			} else {
				res_black += Math.abs(komi);
			}
		}
		if (this.white_points != undefined) {
			res_white += this.white_points;
		}
		if (this.black_points != undefined) {
			res_black += this.black_points;
		}
		if (captured != undefined) {
			if (captured[BLACK] != undefined) {
				res_white += captured[BLACK];
			}
			if (captured[WHITE] != undefined) {
				res_black += captured[WHITE];
			}
		}
		this.score = {};
		this.score[BLACK] = res_black;
		this.score[WHITE] = res_white;

		var res_diff = res_white - res_black;
		if (res_diff == 0) {
			this.result = "Jigo";
		} else if (res_diff < 0) {
			this.result = "B+" + Math.abs(res_diff);
		} else {
			this.result = "W+" + res_diff;
		}
		return this.result;
	},

	connected_component: function(x, y) {
		var board = this.grid;
		var size = board.length; // Localize length for better performance
		var stack_coord = [[x,y]];

		var conexa = {
			owner: null,
			score: 0,
			empty: [],
			owner_coordinate: null,
			deads: {
				B: [],
				W: [],
			},
			dead_count: {
				B: 0,
				W: 0,
			},
			coords: [],
		};

		while (current_coord = stack_coord.shift()) {
			x = current_coord[0]; y = current_coord[1];

			// Out of bounds
			if ( x < 0 || x >= size || y < 0 || y >= size) {
				continue;
			}
			if (this.visited[x][y] != undefined) {
				continue;
			}

			switch (board[x][y]) {
				case (EMPTY): {
					conexa.score++;
					conexa.coords.push({row: x, col: y});
					conexa.empty.push([x, y]);
					this.visited[x][y] = READY;
					stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
					break;
				}
				case (BLACK_DEAD): {
					conexa.dead_count.B++;
					conexa.coords.push({row: x, col: y});
					conexa.empty.push([x, y]);
					this.visited[x][y] = READY;
					stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
					break;
				}
				case (WHITE_DEAD): {
					conexa.dead_count.W++;
					conexa.coords.push({row: x, col: y});
					conexa.empty.push([x, y]);
					this.visited[x][y] = READY;
					stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
					break;
				}
				case(BLACK): {
					if (conexa.dead_count.B > 0) {
						conexa.deads.B.push({color: BLACK, row: x, col: y});
						conexa.dead_count.B++;
						conexa.coords.push({row: x, col: y});
						this.visited[x][y] = READY;
						stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
					} else {
						if (!conexa.owner) {
							conexa.owner = BLACK;
							conexa.owner_coordinate = [x, y];
						} else {
							if (conexa.owner == WHITE) {
								conexa.owner = NO_OWNER;
							}
						}
					}
					break;
				}
				case(WHITE): {
					if (conexa.dead_count.W > 0) {
						conexa.deads.W.push({color: WHITE, row: x, col: y});
						conexa.dead_count.W++;
						conexa.coords.push({row: x, col: y});
						this.visited[x][y] = READY;
						stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
					} else {
						if (!conexa.owner) {
							conexa.owner = WHITE;
							conexa.owner_coordinate = [x, y];
						} else {
							if (conexa.owner == BLACK) {
								conexa.owner = NO_OWNER;
							}
						}
					}
					break;
				}
			}
		}

		return conexa;
	},

	living_shape: function(shape) {
		//http://senseis.xmp.net/?path=EyesCollection&page=TableOfEyeShapes
		//it's assumed that alive and unsettled shapes are alive, otherwise the group would be marked as dead / the game wouldn't be over
		if(shape.length <= 2) { return false; }
		if(shape.length == 4){
			//squared four recognition
			var max_x_abs = 0; var max_y_abs = 0;
			var starting_point = shape.shift();
			while (current_coord = shape.shift()) {
				if(Math.abs(current_coord[0] - starting_point[0]) > max_x_abs) { max_x_abs = Math.abs(current_coord[0] - starting_point[0]); }
				if(Math.abs(current_coord[1] - starting_point[1]) > max_y_abs) { max_y_abs = Math.abs(current_coord[1] - starting_point[1]); }
			}
			if(max_x_abs == 1 && max_y_abs == 1) { return false; }
		}
		return true;
	},

	same_group: function(coor_a, coor_b) {
		var board = this.grid;
		var size = board.length;
		var stack_coord = [coor_a];
		var owner = board[coor_a[0]][coor_a[1]];
		var size = this.grid.length;
		var visited = Array(size);
		for (var row = 0 ; row < size ; row++) {
			visited[row] = Array(size);
		}
		while (current_coord = stack_coord.shift()) {
			x = current_coord[0]; y = current_coord[1];
			if ( x < 0 || x >= size || y < 0 || y >= size) { continue; }
			if (visited[x][y] != undefined) { continue; }
			visited[x][y] = READY;
			switch (board[x][y]) {
				case (owner): {
					if(x == coor_b[0] && y == coor_b[1]) { return true; }
					stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
					//possible clean kosumis
					if(this.indirectly_connected_stones([x,y],[x+1,y+1])) {  stack_coord = stack_coord.concat([[x+1, y+1]]); }
					if(this.indirectly_connected_stones([x,y],[x-1,y-1])) {  stack_coord = stack_coord.concat([[x-1, y-1]]); }
					if(this.indirectly_connected_stones([x,y],[x+1,y-1])) {  stack_coord = stack_coord.concat([[x+1, y-1]]); }
					if(this.indirectly_connected_stones([x,y],[x-1,y+1])) {  stack_coord = stack_coord.concat([[x-1, y+1]]); }
					//possible clean bamboo joints
					if(this.indirectly_connected_stones([x,y],[x,y+2])) {  stack_coord = stack_coord.concat([[x, y+2]]); }
					if(this.indirectly_connected_stones([x,y],[x+2,y])) {  stack_coord = stack_coord.concat([[x+2, y]]); }
					if(this.indirectly_connected_stones([x,y],[x-2,y])) {  stack_coord = stack_coord.concat([[x-2, y]]); }
					if(this.indirectly_connected_stones([x,y],[x,y-2])) {  stack_coord = stack_coord.concat([[x, y-2]]); }
					break;
				}
			}
		}
		return false;
	},

	indirectly_connected_stones: function(coor_a, coor_b) {
		var board = this.grid;
		var size = board.length;
		var xa = coor_a[0]; var xb = coor_b[0];
		var ya = coor_a[1]; var yb = coor_b[1];
		var delta_x = xb-xa; var delta_y = yb-ya;
		if ( xa < 0 || xa >= size || ya < 0 || ya >= size) { return false; }
		if ( xb < 0 || xb >= size || yb < 0 || yb >= size) { return false; }
    var owner = board[coor_a[0]][coor_a[1]];
    var other_owner =  board[coor_b[0]][coor_b[1]];
    if ( owner != other_owner) { return false; } 
		//kosumi: one of the spots must be empty!
		if((delta_x == 1 && delta_y == 1) || (delta_x == 1 && delta_y == -1) || (delta_x == -1 && delta_y == 1) || (delta_x == -1 && delta_y == -1)) {
			if(board[xa+delta_x][ya] == EMPTY || board[xa][ya+delta_y] == EMPTY) { return true; }
		}
		//bamboo joint: the spot in between must be empty!
		if((delta_x == 2 && delta_y == 0) || (delta_x == 0 && delta_y == 2) || (delta_x == -2 && delta_y == 0) || (delta_x == 0 && delta_y == -2)) {
			if(delta_x == 0) {
        if(board[xa][ya+delta_y/2] != EMPTY) { return false; }
				if(xa-1 >=0	 && board[xa-1][ya+delta_y] == owner && board[xa-1][ya] == owner) { return true; }
				if(xa+1 < size && board[xa+1][ya+delta_y] == owner && board[xa+1][ya] == owner) { return true; }
			}
			if(delta_y == 0) {
        if(board[xa+delta_y/2][ya] != EMPTY) { return false; }
				if(ya-1 >=0	&& board[xa+delta_x][ya-1] == owner && board[xa][ya-1] == owner) { return true; }
				if(ya+1 < size && board[xa+delta_x][ya+1] == owner && board[xa][ya+1] == owner) { return true; }
			}
		}
		return false;
	},

	other_empty_space: function(group, all_groups) {
		var g;
		for(var index in all_groups) {
			g = all_groups[index];
			if(g == group) { continue; }
			if(g.owner == group.owner) {
				if(this.same_group(g.owner_coordinate, group.owner_coordinate)) { return true; }
			}
		}
		return false;
	}
};
