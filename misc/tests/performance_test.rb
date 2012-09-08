require "cutest"
require 'benchmark'

require File.expand_path("../lib/sgf", File.dirname(__FILE__))
require File.expand_path("../lib/node", File.dirname(__FILE__))
require File.expand_path("../lib/parser", File.dirname(__FILE__))

setup do

end

def create_full_sgf

  alf = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r"]

  black = true
  str = ""
  alf.each do |char|

    alf.each do |dhar|
      str += (black ? ";B[" : ";W[")
      str += "#{char}#{dhar}]"
      black = !black
    end

  end
  "(#{str})"

end

test "should be able to re-create the sgf with the raw move list" do

  sgf_string = create_full_sgf

  @sgf1 = ""
  @sgf2 = ""

  puts "benchmarking SGFParser parser"
  puts Benchmark.measure { 50.times {@sgf1 = Parser.new.parse(sgf_string)} }


 
  puts "benchmarking regex parser"
  puts Benchmark.measure { 50.times {@sgf2 = SGF.new(sgf_string)} } 

  p @sgf1
  p @sgf2
end



