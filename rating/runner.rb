require File.expand_path("system", File.dirname(__FILE__))
require File.expand_path("strategies/simplepoint", File.dirname(__FILE__))
require 'benchmark'

def sample_data_set
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

def run_simulation(strategy, data_set)
  system = System.new(SimplePoint)

  time = Benchmark.measure {
                            sample_data_set.each do |result|
                              system.add_result(result)
                            end
                           }
  system.results_to_file(time)

end

run_simulation(SimplePoint, sample_data_set)
