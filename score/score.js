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
			s += "["
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
		var group = deads[BLACK].concat(deads[WHITE]);
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
			if (item.owner == BLACK) {
				result.black_points += item.score + (item.dead_count.W * this._deadStonesMultiplier);
			} else if (item.owner == WHITE) {
				result.white_points += item.score + (item.dead_count.B * this._deadStonesMultiplier);
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
					this.visited[x][y] = READY;

					stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
					break;
				}
				case (BLACK_DEAD): {
					conexa.dead_count.B++;
					conexa.coords.push({row: x, col: y});
					this.visited[x][y] = READY;

					stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);

					break;
				}
				case (WHITE_DEAD): {
					conexa.dead_count.W++;
					conexa.coords.push({row: x, col: y});
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
	}

};
