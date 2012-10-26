module Validator
  module Japanese

    class RuleError < StandardError

    end
    
    #Takes sgf-like node and goes through the validation process.
    #Requires a valid grid
    #def validate(node)
      
    #end
    def validate!(color,row, col)
  
      if get_pos(row,col) == "KO"
        raise RuleError.new("Position #{row},#{col} is a Ko position. #{print_grid}")
      end
      if get_pos(row,col)
        raise RuleError.new("Position #{row},#{col} is already taken! #{print_grid}")
      end
      play = GridBoard::Play.new(color,row,col)

      play_with_removals = play_eat(play)
      if play_check_suicide(play_with_removals)
        raise RuleError.new("Position #{row},#{col} is suicide! #{print_grid}")
      end

      play_check_ko(play_with_removals)

      apply_play(play_with_removals)

      grid
    end

=begin

        setup_play: function(row, col) {
                // Can't override a stone
                if (this.board.get_pos(row, col) != undefined) {
                        return false;
                }
                // Can't place a stone on ko.
                if (this.board.pos_is_ko(row, col)) {
                        return false;
                }

                // Place stone
                var tmp_play = new Play(this.get_next_move(), row, col);

                // Eat stones if surrounded
                this.board.play_eat(tmp_play);

                // Check suicide
                if (this.board.play_check_suicide(tmp_play)) {
                        return false;
                }

                // Update play's ko.
                this.board.play_check_ko(tmp_play);

                // Update play's captures
                this.update_play_captures(tmp_play);

                return tmp_play;
        },

=end


  end
end

class GridBoard

  include Validator::Japanese

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

  def get_adjacent(color,row,col)
    res = []

    [[row+1,col],[row-1,col],[row,col+1],[row,col-1]].each do |ar|
      ro = ar.first
      co = ar.last
      if (ro >= size || ro < 0) || (co >= size || co < 0)
        next
      elsif grid[ro][co] == color
        res << ({:color => grid[ro][co], :row => ro, :col => co})
      end
    end
    res
  end

  def count_stone_liberties(row,col)
    res = 0

    [[row+1,col],[row-1,col],[row,col+1],[row,col-1]].each do |ar|
      ro = ar.first
      co = ar.last
      if (ro >= size || ro < 0) || (co >= size || co < 0)
        next
      elsif (get_pos(ro,co) != "B" && get_pos(ro,co) != "W")
        res += 1
      end  
    end
    res
  end
 
  def chain_is_restricted(chain)
    chain.each {|stone| (return false) if count_stone_liberties(stone[:row],stone[:col]) > 0 }
    return true
  end

  #Untested
  def get_distinct_chains(stones)
    res = []
    stone_touched = []

    stone,touched,cur_chain = nil

    stones.each_with_index do |el,index|

      #Escape stones already added for being part of another chain.
      next if stone_touched[index]

      current_chain = [el];
      chains_pending = [el];
      
      while(!chains_pending.empty?)
        stone = chains_pending.pop
        touched = get_adjacent(stone[:color], stone[:row], stone[:col])

        touched.each do |touched_stone|
          #Check that the stone has not been added before.
          next if(current_chain.include? touched_stone) 
          #Check if i'm including one of the original stones.
          if stones.include?(touched_stone)
            stone_touched[stones.index(touched_stone)] = true
          end
          current_chain << touched_stone
          chains_pending << touched_stone
        end
      end
      res.push(current_chain)
    end
    res
  end 

  #Untested
  #Takes a play and completes it's 'remove' property with the stones that would eat from the board.
  def play_eat(play)
    #return
    stone = play.put
    put_stone(stone[:color], stone[:row], stone[:col])
    
    target_color = (stone[:color] == "W" ? "B" : "W")
    adjacent_stones = get_adjacent(target_color, stone[:row], stone[:col])
    chains = get_distinct_chains(adjacent_stones);

    chains.each do |chain|
      if (chain_is_restricted(chain))
        chain.each do |stone_in_chain|
          play.remove << ({:color => target_color, :row => stone_in_chain[:row], :col => stone_in_chain[:col]})
        end
      end
    end
    play
    #?? ASK pato remove_stone(stone[:row],stone[:col])
  end

  #Checks if the play triggers ko. Updates it's ko property.
  def play_check_ko(play);
    is_ko = false
    recapture = nil

    apply_play(play)

    if(play.remove.length == 1) 
      recapture = GridBoard::Play.new(play.remove.first[:color], play.remove.first[:row],play.remove.first[:col])
      play_eat(recapture)
      if(recapture.remove.length == 1)
        if ((play.put == recapture.remove.first) && (recapture.put == play.remove[0]))
          is_ko = true
        end

      end
    end
    undo_play(play)
    if is_ko
      play.ko = {:row => recapture.put[:row],:col => recapture.put[:col]}
    end
    play
  end 

  def print_grid
    grid.each do |row|
      line = ""
      row.each do |stone|
        line << "#{stone || "E"} "
      end
      p line
    end
  end

  def apply_play(play)
    put_stone(play.put[:color], play.put[:row], play.put[:col])
    play.remove.each do |remove|
      remove_stone(remove[:row],remove[:col])
    end
    if play.ko
      grid[play.ko[:row]][play.ko[:col]] = "KO"
    end
  end

  def undo_play(play)
    play.remove.each do |remove|
      put_stone(remove[:color],remove[:row],remove[:col])
    end
    remove_stone(play.put[:row],play.put[:col])
    if play.ko
      grid[play.ko[:row]][play.ko[:col]] = nil
    end
  end

  def play_check_suicide(play)

    res = false
    if(play.remove.empty?)
      if(count_stone_liberties(play.put[:row],play.put[:col]) == 0)
        put_stone(play.put[:color],play.put[:row],play.put[:col])
        chain = get_distinct_chains([play.put]).first
        if(chain_is_restricted(chain))
          res = true
        end
        remove_stone(play.put[:row],play.put[:col])
      end 
    end
    res
  end



  class Play
    attr_accessor :put, :remove, :ko
    def initialize(color,row,col)
      @put = {:color => color, :row => row, :col => col}
      @remove = []
    end
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
/////// DONE ////

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
/////// END //////


};

=end




