require File.expand_path("system", File.dirname(__FILE__))
require File.expand_path("strategies/strategies", File.dirname(__FILE__))
require 'benchmark'

def data_set
  set = []
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
end

def assert(boolean)
  raise "Expected #{boolean} to be true" unless boolean
end

system = System.new(RatingStrategy::SimplePointSystem)


time = Benchmark.measure {
                          data_set.each do |result|
                            system.add_result(result)
                          end
                         }

system.results_to_file(time)

