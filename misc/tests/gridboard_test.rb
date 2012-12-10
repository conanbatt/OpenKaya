require "cutest"

require File.expand_path("../lib/sgf", File.dirname(__FILE__))
require File.expand_path("../lib/gridboard", File.dirname(__FILE__))

require 'ruby-debug'

setup do

  @mock_gridboard = mock_grid
end


def mock_grid
  gridboard = GridBoard.new

  gridboard.put_stone("B",3,3)
  gridboard.put_stone("W",15,3)
  gridboard.put_stone("B",15,15)
  gridboard.put_stone("W",3,15)

  gridboard
end

test "should not load the latest move(#bugcase)" do

  sgf = SGF::Parser.parse("mocks/undo_grid.sgf")
  gridboard = GridBoard.create_from_sgf(sgf, "0-0-0-0-0-0-0-0-0-0-0-0")

  assert_equal gridboard.get_pos(6,17), nil

end

test "should load handicap from sgf, not hardcoded" do

  sgf = SGF::Parser.parse("mocks/funky_handi.sgf")
  gridboard = GridBoard.create_from_sgf(sgf, sgf.focus_to_code)

  assert_equal gridboard.get_pos(0,0) , "B"
  assert_equal gridboard.get_pos(1,0) , "B"
  assert_equal gridboard.get_pos(2,0) , "B"
  assert_equal gridboard.get_pos(3,0) , "B"
  assert_equal gridboard.get_pos(4,0) , "B"
  assert_equal gridboard.get_pos(5,0) , "B"
  assert_equal gridboard.get_pos(6,0) , "B"

end

test "shold not raise error" do

  sgf = SGF::Parser.parse("mocks/conanbatt-Amadeo.sgf")
  gridboard= GridBoard.create_from_sgf(sgf, sgf.focus_to_code)

  #this is what happened in the bug case, but it doesnt fail in the library!
  gridboard.validate!("W",9,15)
end

test "should not raise error" do

  #Guys couldnt play tengen 
  sgf = SGF::Parser.parse("mocks/fly-dfunkt.sgf")
  gridboard= GridBoard.create_from_sgf(sgf, sgf.focus_to_code)

  gridboard.validate!("W",9,9)


end

test "should raise error #Bugcase" do

  sgf = SGF::Parser.parse("mocks/error_sgf.sgf")

  assert_raise(Validator::Japanese::RuleError) do
    gridboard= GridBoard.create_from_sgf(sgf, sgf.focus_to_code)
  end

end


test "GridBoard can be loaded or created" do

  gridboard = GridBoard.new

  assert_equal gridboard.grid.size, 19
  assert_equal gridboard.grid.first.size, 19

  gridboard.put_stone("B",0,0) 
  assert_equal gridboard.grid.first.first, "B"

  gridboard.put_stone("W",0,1) 
  assert_equal gridboard.grid.first[1], "W"

  reloaded_gridboard = GridBoard.new(:grid => gridboard.grid)

  assert_equal reloaded_gridboard.grid.first.first, "B"
  assert_equal reloaded_gridboard.grid.first[1], "W"
  

end

test "Can delete put stones" do 

  gridboard = GridBoard.new

  assert_equal gridboard.grid.first.first, nil

  gridboard.put_stone("B",0,0)
  assert_equal gridboard.grid.first.first, "B"

  gridboard.remove_stone(0,0)
  assert_equal gridboard.grid.first.first, nil

end

test "should be able to get adjacent stones by color" do

  gridboard = GridBoard.new

  gridboard.put_stone("B",5,5)

  assert_equal gridboard.get_adjacent("B",5,5).size, 0
  assert_equal gridboard.count_stone_liberties(5,5),4

  gridboard.put_stone("B",6,5)
  gridboard.put_stone("B",5,6)

  assert_equal gridboard.count_stone_liberties(5,5),2

  gridboard.put_stone("W",4,5)
  gridboard.put_stone("W",5,4)

  assert_equal gridboard.get_adjacent("B",5,5).size, 2
  assert_equal gridboard.get_adjacent("W",5,5).size, 2
  assert (gridboard.get_adjacent("B",5,5).include? ({:color => "B", :col => 6, :row => 5}))

  assert_equal gridboard.count_stone_liberties(5,5),0

  gridboard.put_stone("B",0,0)

  assert_equal gridboard.count_stone_liberties(0,0),2
end

test "should get if a chain has any liberty" do 

  gridboard = GridBoard.new

  gridboard.put_stone("B",1,1)
  gridboard.put_stone("B",1,2)

  gridboard.put_stone("W",1,0)
  gridboard.put_stone("W",0,1)
  gridboard.put_stone("W",0,2)
  gridboard.put_stone("W",2,1)
  gridboard.put_stone("W",2,2)

  chain = [{:color => "B",:row => 1,:col => 1}, {:color => "B",:row => 1,:col => 2}]

  assert !gridboard.chain_is_restricted(chain)

  gridboard.put_stone("W",1,3)

  assert gridboard.chain_is_restricted(chain)
   
end


test "should get all the groups given a set of stones" do

  gridboard = GridBoard.new

  gridboard.put_stone("B",2,2)

  gridboard.put_stone("B",3,3)

  stones = [{:color => "B",:row => 2, :col => 2}, 
            {:color => "B",:row => 3, :col => 3}]

  assert_equal gridboard.get_distinct_chains(stones).size,2

  #groups are of the same color
  gridboard.put_stone("W",3,4)  
  assert_equal gridboard.get_distinct_chains(stones).size,2

  #if the stones are connected they are a single group
  gridboard.put_stone("B",2,3)  
  assert_equal gridboard.get_distinct_chains(stones).size,1
  

end

test "should be able to apply and undo moves" do

  gridboard = GridBoard.new

  play = GridBoard::Play.new("W",2,2) 

  gridboard.apply_play(play)
  assert_equal gridboard.get_pos(2,2), "W"

  gridboard.undo_play(play)
  assert_equal gridboard.get_pos(2,2), nil

  gridboard.apply_play(play)
  assert_equal gridboard.get_pos(2,2), "W"

  play_with_remove = GridBoard::Play.new("B",3,3)
  play_with_remove.remove = [{:color => "W", :row => 2, :col => 2}]
 
  gridboard.apply_play(play_with_remove)
  assert_equal gridboard.get_pos(2,2), nil
  assert_equal gridboard.get_pos(3,3), "B"

  gridboard.undo_play(play_with_remove)
  assert_equal gridboard.get_pos(2,2), "W"
  assert_equal gridboard.get_pos(3,3), nil

  play_with_ko = GridBoard::Play.new("W",5,5)
  play_with_ko.ko = {:row =>4, :col => 4}

  gridboard.apply_play(play_with_ko)
  assert_equal gridboard.get_pos(4,4), "KO"

  gridboard.undo_play(play_with_ko)
  assert_equal gridboard.get_pos(4,4), nil

end

test "should remove the stone that was eaten" do 

  gridboard = GridBoard.new

  gridboard.put_stone("B",2,2)
  gridboard.put_stone("B",2,3)

  gridboard.put_stone("W",2,1)
  gridboard.put_stone("W",1,2)
  gridboard.put_stone("W",1,3)
  gridboard.put_stone("W",3,2)
  gridboard.put_stone("W",3,3)

  #This is a gospeed convenience? no point having it here?
  play = GridBoard::Play.new("W", 2,4)
  to_remove_stones = gridboard.play_eat(play).remove

  #the stones should no longer be in the board
  assert to_remove_stones.include? ({:color => "B", :row => 2, :col => 3})
  assert to_remove_stones.include? ({:color => "B", :row => 2, :col => 2})
  
end


test "should know if there is a ko" do

  gridboard = GridBoard.new

  gridboard.put_stone("B",2,2)
  gridboard.put_stone("B",3,3)
  gridboard.put_stone("B",3,1)
  gridboard.put_stone("B",4,2)

  gridboard.put_stone("W",4,3)
  gridboard.put_stone("W",4,1)
  gridboard.put_stone("W",5,2)
 
  play = GridBoard::Play.new("W", 3,2)
  gridboard.play_eat(play)
  
  play_with_ko = gridboard.play_check_ko(play)

  assert play_with_ko
  assert_equal play_with_ko.ko[:row], 4
  assert_equal play_with_ko.ko[:col], 2
  

end

test "should prevent suicide move" do

  gridboard = GridBoard.new

  gridboard.put_stone("B",2,2)
  gridboard.put_stone("B",3,3)
  gridboard.put_stone("B",2,4)
  gridboard.put_stone("B",1,3)

  play = GridBoard::Play.new("W",2,3)

  gridboard.play_eat(play)

  assert gridboard.play_check_suicide(play)

end

def mock_grid
  
  #same play position
  #ko position
  #suicide position
  [
    [nil, "B" , nil, nil, "W", nil],
    ["B", "KO", "B", nil, "W", "W"],
    ["W", "B" , "W", nil, "B", nil],
    [nil, "W" , nil, "B", nil, "B"],
    [nil, nil , nil, "W", "B", "W"],
    [nil, nil , nil, nil, "W", nil]
  ]
end

test "should validate a play entirely(Japanese) and raise proper errors" do

  gridboard= GridBoard.new(:grid => mock_grid,:size => mock_grid.size)

  #Already occupied position
  assert_raise(Validator::Japanese::RuleError) do
    gridboard.validate!("W",1,0)
  end
  #Ko position
  assert_raise(Validator::Japanese::RuleError) do
    gridboard.validate!("W",1,1)
  end
  #suicide position
  assert_raise(Validator::Japanese::RuleError) do
    gridboard.validate!("B",0,5)
  end



end

test "should update the ko position" do
  gridboard= GridBoard.new(:grid => mock_grid,:size => mock_grid.size)

  gridboard.validate!("W",3,4)

  assert_equal gridboard.get_pos(4,4), "KO"
  assert_equal gridboard.get_pos(3,4), "W"
  #TODO add a case for capture without suicide

end

def mock_sgf
  SGF::Parser.parse("mocks/full_parse.sgf")
end

test "build the grid from an sgf and a focus" do

  gridboard = GridBoard.create_from_sgf(mock_sgf, "0-0-0")

  #handicap stones are present
  assert_equal gridboard.get_pos(3,3), "B"
  assert_equal gridboard.get_pos(3,15), "B"
  assert_equal gridboard.get_pos(15,3), "B"

  #and so are the first 3 moves. 

  assert_equal gridboard.get_pos(2,13), "W"
  assert_equal gridboard.get_pos(2,10), "B"
  assert_equal gridboard.get_pos(5,2), "W"
  
end

test "should be able to read a whole sgf and validate position" do


  sgf = mock_sgf
  gridboard = GridBoard.create_from_sgf(sgf, sgf.focus_to_code)

  assert_equal gridboard.get_pos(0,11), "B"

end

test "should wipe the ko field after the next move" do

  sgf = SGF::Parser.parse("mocks/extreme_ko.sgf")
  gridboard = GridBoard.create_from_sgf(sgf, sgf.focus_to_code)

end

test "should wipe ko on pass too" do

  grid = GridBoard.new(:grid => mock_grid, :size => mock_grid.size)
  grid.validate!("W",nil,nil)

  assert_equal grid.get_pos(1,1), nil
end

def error_grid
[
  [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil],
  [nil, nil, nil, nil, nil, nil, nil, nil, "W", nil, nil, nil, nil, nil, nil, nil, nil, nil, nil],
  [nil, nil, nil, nil, "B", "W", nil, nil, nil, nil, nil, nil, nil, nil, "W", "W", "B", nil, nil],
  [nil, nil, nil, "B", nil, "W", nil, nil, "B", nil, nil, nil, nil, "W", nil, "B", nil, nil, nil],
  [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil],
  [nil, nil, "B", nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, "B", nil, nil, nil],
  [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil],
  [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil],
  [nil, nil, "B", nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil],
  [nil, nil, nil, nil, nil, nil, nil, nil, "B", nil, nil, nil, nil, "B", "B", "B", nil, nil, nil],
  [nil, nil, "W", nil, "B", nil, nil, nil, nil, nil, nil, nil, nil, nil, "W", "W", "W", nil, nil],
  [nil, nil, nil, nil, nil, nil, "B", nil, "W", "W", nil, nil, nil, nil, "W", "B", "W", nil, nil],
  [nil, nil, "W", nil, "B", nil, nil, "W", nil, "B", "W", "W", nil, nil, nil, "B", "B", nil, nil],
  [nil, nil, nil, nil, nil, nil, "W", nil, nil, "B", "B", nil, nil, nil, nil, "B", nil, nil, nil],
  [nil, nil, nil, nil, nil, "B", "W", "B", nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil],
  [nil, "W", nil, "B", nil, "B", "W", nil, nil, "B", nil, "W", nil, nil, nil, "B", nil, nil, nil],
  [nil, nil, nil, nil, "B", "W", nil, "W", nil, nil, "W", nil, nil, "W", nil, nil, "B", nil, nil],
  [nil, nil, nil, nil, "B", "W", nil, nil, "B", nil, nil, nil, nil, nil, "W", "W", "B", nil, nil],
  [nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil]

]

end



