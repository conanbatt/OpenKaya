

class GridBoard

  attr_accessor :grid,:size

  #def initialize(:grid => [], :size => 19)
  def initialize(options = {})
    @size = options[:size] || 19
    @grid = options[:grid] || Array.new(size) {Array.new(size)}

    if grid.size != size
      raise "invalid grid size"
    end

  end

  def put_stone(color, row, col)
    raise "Invalid row number" if row > grid.size
    raise "Invalid col number" if col > grid.size
    grid[row][col] = color 
  end

  def remove_stone(row,col)
    raise "Invalid row number" if row > grid.size
    raise "Invalid col number" if col > grid.size
    grid[row][col] = nil
  end

  def get_pos(row,col)
    grid[row][col]
  end

  def get_adjacent(row,col)
    res = []

    [[row+1,col],[row-1,col],[row,col+1],[row,col-1]].each do |ar|
      r = ar.first
      c = ar.last
      if grid[r][c]
        res << ({:color => grid[r][c], :row => r, :col => c})
      end
    end
    res
  end

  def count_stone_liberties(row,col)
    4 - get_adjacent(row,col).count 
  end
 
  #Untested
  def get_distinct_chains 
    res,stone_touched = [];

    stone,touched,cur_chain = nil



                for (var i = 0, li = stones.length; i < li; ++i) {
                        // Escape stones already added for being part of another chain.
                        if (stone_touched[i] === true) {
                                continue;
                        }
                        cur_chain = [];
                        chains_pend = [];
                        cur_chain.push(stones[i]);
                        chains_pend.push(stones[i]);
                        stone_touched[i] = true;
                        while (chains_pend.length > 0) {
                                stone = chains_pend.pop();
                                touched = this.get_touched(stone.color, stone.row, stone.col);
                                for (var j = 0, lj = touched.length; j < lj; ++j) {
                                        // Check that the stone has not been added before.
                                        if (this.list_has_stone(cur_chain, touched[j])) {
                                                continue;
                                        }
                                        // Check if i'm including one of the original stones.
                                        for (var k = i, lk = stones.length; k < lk; ++k) {
                                                if (stones[k].color == touched[j].color && stones[k].row == touched[j].row && stones[k].col == touched[j].col) {
                                                        stone_touched[k] = true;
                                                }
                                        }
                                        cur_chain.push(touched[j]);
                                        chains_pend.push(touched[j]);
                                }
                        }
                        res.push(cur_chain);
                }
                return res;



  end
end


#Gospeed rule validator. Copy to ruby.

=begin


function GoBan(game, args) {
	this.init.call(this, game, args);
}

GoBan.prototype = {
	init: function(game, args) {

//	Manage Board

///////////// DONE ///////////////////////
	put_stone: function(color, row, col) {

		if (typeof color != "string") {
			throw new Error("Wrong type of color");
		}
		if (color != "B" && color != "W") {
			throw new Error("Wrong color");
		}
		if (row >= this.size || col >= this.size) {
			throw new Error("Stone out of board");
		}
		this.grid[row][col] = color;
	},

	remove_stone: function(row, col) {
		if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
			throw new Error("Position out of board");
		}
		this.grid[row][col] = undefined;
	},

	get_pos: function(row, col) {
		if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
			throw new Error("Position out of board");
		}
		return this.grid[row][col];
	},

	safe_get_pos: function(row, col) {
		if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
			return "";
		} else {
			return this.grid[row][col];
		}
	},
///////////// END ///////////////////////

	pos_is_ko: function(row, col) {
		var ret = false;
		var ko = this.game.get_ko();
		if (ko != undefined) {
			if (ko.row == row && ko.col == col) {
				ret = true;
			}
		}
		return ret;
	},

//	Plays and Moves
	// Takes a play and spreads it's content to the grid
	make_play: function(play) {
		if (play instanceof FreePlay) {
			for (var s = 0, ls = play.remove.length; s < ls; ++s) {
				this.remove_stone(play.remove[s].row, play.remove[s].col);
			}
			for (var s = 0, ls = play.put.length; s < ls; ++s) {
				this.put_stone(play.put[s].color, play.put[s].row, play.put[s].col);
			}
		} else if (play instanceof Play) {
			this.put_stone(play.put.color, play.put.row, play.put.col);
			for (var s = 0, ls = play.remove.length; s < ls; ++s) {
				this.remove_stone(play.remove[s].row, play.remove[s].col);
			}
		}
	},

	// Takes a play and undoes it's content to the grid
	undo_play: function(play) {
		if (play instanceof FreePlay) {
			for (var s = 0, ls = play.put.length; s < ls; ++s) {
				this.remove_stone(play.put[s].row, play.put[s].col);
			}
			for (var s = 0, ls = play.remove.length; s < ls; ++s) {
				this.put_stone(play.remove[s].color, play.remove[s].row, play.remove[s].col);
			}
		} else if (play instanceof Play) {
			this.remove_stone(play.put.row, play.put.col);
			for (var s = 0, ls = play.remove.length; s < ls; ++s) {
				this.put_stone(play.remove[s].color, play.remove[s].row, play.remove[s].col);
			}
		}
	},

	// Takes a play and completes it's 'remove' property with the stones that would eat from the board.
	play_eat: function(play) {
		this.put_stone(play.put.color, play.put.row, play.put.col);

		var target_color = (play.put.color == "W" ? "B" : "W");
		var adj = this.get_touched(target_color, play.put.row, play.put.col);
		var chains = this.get_distinct_chains(adj);

		for (var c = 0, lc = chains.length; c < lc; ++c) {
			if (this.chain_is_restricted(chains[c])) {
				for (var s = 0, ls = chains[c].length; s < ls; ++s) {
					play.remove.push(new Stone(target_color, chains[c][s].row, chains[c][s].col));
				}
			}
		}

		this.remove_stone(play.put.row, play.put.col);
	},

	// Checks if the play triggers ko. Updates it's ko property.
	play_check_ko: function(play) {
		var is_ko = false;
		var tmp_play;
		this.make_play(play);
		if (play.remove.length == 1) {
			tmp_play = new Play(play.remove[0].color, play.remove[0].row, play.remove[0].col);
			this.play_eat(tmp_play);
			if (tmp_play.remove.length == 1) {
				if (play.put.equals(tmp_play.remove[0]) && tmp_play.put.equals(play.remove[0])) {
					is_ko = true;
				}
			}
		}
		this.undo_play(play);
		if (is_ko) {
			play.ko = {
				row: tmp_play.put.row,
				col: tmp_play.put.col,
			};
		} else {
			play.ko = undefined;
		}
	},

	// Takes a play and checks if it's suicide.
	// WARNING: use this after play_eat, otherwise you might be using an incomplete play, and fake truth might occur.
	play_check_suicide: function(play) {
		var res = false;
		if (play.remove.length == 0) {
			if (this.count_stone_liberties(play.put) == 0) {
				this.put_stone(play.put.color, play.put.row, play.put.col);
				var chain = this.get_distinct_chains([play.put])[0];
				if (this.chain_is_restricted(chain)) {
					res = true;
				}
				this.remove_stone(play.put.row, play.put.col);
			}
		}
		return res;
	},

//	Auxiliar functions
	chain_is_restricted: function(chain) {
		for (var i = 0, li = chain.length; i < li; ++i) {
			if (this.count_stone_liberties(chain[i]) > 0) {
				return false;
			}
		}
		return true;
	},
/////// DONE ////

	get_adjacent: function(color, row, col) {
		var res = [];
		for (i = row - 1 ; i <= row + 1 ; i++) {
			for (j = col - 1 ; j <= col + 1 ; j++) {
				if (this.safe_get_pos(i, j) == color) {
					res.push({color: color, row: i, col: j});
				}
			}
		}
		return res;
	},
	get_touched: function(color, row, col) {
		var res = [];
		if (this.safe_get_pos(row - 1, col) == color) {
			res.push({color: color, row: row - 1, col: col});
		}
		if (this.safe_get_pos(row, col - 1) == color) {
			res.push({color: color, row: row, col: col - 1});
		}
		if (this.safe_get_pos(row, col + 1) == color) {
			res.push({color: color, row: row, col: col + 1});
		}
		if (this.safe_get_pos(row + 1, col) == color) {
			res.push({color: color, row: row + 1, col: col});
		}
		return res;
	},

	count_stone_liberties: function(stone) {
		var count = 0;
		if (this.safe_get_pos(stone.row - 1, stone.col) == undefined) {
			count++;
		}
		if (this.safe_get_pos(stone.row, stone.col - 1) == undefined) {
			count++;
		}
		if (this.safe_get_pos(stone.row, stone.col + 1) == undefined) {
			count++;
		}
		if (this.safe_get_pos(stone.row + 1, stone.col) == undefined) {
			count++;
		}
		return count;
	},
/////// END //////

	list_has_stone: function(list, stone) {
		for (var i = 0, li = list.length; i < li; ++i) {
			if (list[i].color == stone.color && list[i].row == stone.row && list[i].col == stone.col) {
				return true;
			}
		}
		return false;
	},

	get_distinct_chains: function(stones) {
		var res = [];
		var stone;
		var touched;
		var cur_chain;
		var chains_pend;
		var stone_touched = [];
		for (var i = 0, li = stones.length; i < li; ++i) {
			// Escape stones already added for being part of another chain.
			if (stone_touched[i] === true) {
				continue;
			}
			cur_chain = [];
			chains_pend = [];
			cur_chain.push(stones[i]);
			chains_pend.push(stones[i]);
			stone_touched[i] = true;
			while (chains_pend.length > 0) {
				stone = chains_pend.pop();
				touched = this.get_touched(stone.color, stone.row, stone.col);
				for (var j = 0, lj = touched.length; j < lj; ++j) {
					// Check that the stone has not been added before.
					if (this.list_has_stone(cur_chain, touched[j])) {
						continue;
					}
					// Check if i'm including one of the original stones.
					for (var k = i, lk = stones.length; k < lk; ++k) {
						if (stones[k].color == touched[j].color && stones[k].row == touched[j].row && stones[k].col == touched[j].col) {
							stone_touched[k] = true;
						}
					}
					cur_chain.push(touched[j]);
					chains_pend.push(touched[j]);
				}
			}
			res.push(cur_chain);
		}
		return res;
	},


};

=end

