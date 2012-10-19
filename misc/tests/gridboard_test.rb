require "cutest"

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

test "should be able to get which adjacent stones" do

  gridboard = GridBoard.new

  gridboard.put_stone("B",5,5)

  assert_equal gridboard.get_adjacent(5,5).size, 0
  assert_equal gridboard.count_stone_liberties(5,5),4

  gridboard.put_stone("B",6,5)
  gridboard.put_stone("B",5,6)
  gridboard.put_stone("W",4,5)
  gridboard.put_stone("W",5,4)

  assert_equal gridboard.get_adjacent(5,5).size, 4
  assert (gridboard.get_adjacent(5,5).include? ({:color => "B", :col => 6, :row => 5}))

  assert_equal gridboard.count_stone_liberties(5,5),0

end

