module Validator
  module Japanese

    class RuleError < StandardError

    end
    
    #Takes sgf-like node and goes through the validation process.
    #Requires a valid grid
    #def validate(node)
      
    #end
    def validate!(color,row, col)
 
      if (row.nil? || row.to_s.empty?) &&
         (col.nil? || col.to_s.empty?)
        return pass!
      end

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

      erase_ko
      apply_play(play_with_removals)

      grid
    end

    def pass!
      erase_ko
      grid
    end

  end
end

class GridBoard

  include Validator::Japanese

  attr_accessor :grid,:size

  #def initialize(:grid => [], :size => 19)
  def initialize(options = {})
    @size = options[:size] || (options[:grid] && options[:grid].size) || 19
    @grid = options[:grid] || Array.new(size) {Array.new(size)}
    if grid.size != size
      raise "invalid grid size"
    end

  end

  def self.create_from_sgf(sgf, focus_code)
    grid = GridBoard.new(:size => sgf.property(:size).to_i)
    #Setup handicap stones
    grid.setup_handicap(sgf.property("AB"))

    temp_focus = sgf.root
    return grid if focus_code == "root"
    focus_code.split("-").each do |branch|
      node = temp_focus.children[branch.to_i]
      raise "There is no node here! #{focus_code}" unless node
      if node.pass_node?
        grid.pass!
      else
        grid.validate!(node.color, node.y.ord - 97, node.x.ord - 97)
      end
      temp_focus = node
    end
    grid
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

  def setup_handicap(stones)
    return unless stones
    stones.each do |stone|
      put_stone("B",stone[1].ord - 97,stone[0].ord - 97)
    end
  end  

private

  def erase_ko
    grid.each do |row|
      if i = row.index("KO")
        row[i] = nil
      end
    end
  
  end

end

