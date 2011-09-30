require File.expand_path("../lib/sgf", File.dirname(__FILE__))

class ReplayBot

  attr_accessor :sgf, :move_number
  def initialize
    @sgf = SGF.new
    @move_number = 0
  end

  def input(move="")
    @move_number += 1
    return ";"+@sgf.split(";")[@move_number]
  end 

  def load_sgf(filename)
    @sgf.load_file(filename)
  end

end

