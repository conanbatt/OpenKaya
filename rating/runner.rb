require File.expand_path("system", File.dirname(__FILE__))
require File.expand_path("strategies/simplepoint", File.dirname(__FILE__))
require File.expand_path("strategies/glicko", File.dirname(__FILE__))
require 'benchmark'
require 'date'

=begin

  To add a new rating system simulation:
    1. write the algorithm in a #{algorithms name}.rb inside "strategies"
    2. add corresponding require as seen for simple point at the top of this file
    3. call method run_simulation
  That's it!

=end
VALIDATION_MODE = false

ARGV.each do|a|
  puts "Called with: #{a}"
  VALIDATION_MODE = true if a=="validate"
end

def sample_data_set
  set = []
  set << {:white_player => "pepe",:black_player => "carlos",:winner => "W"}
end

def assert(boolean)
  raise "Expected #{boolean} to be true" unless boolean
end

def run_simulation(strategy, data_set)
  system = System.new(strategy, VALIDATION_MODE)

  time = Benchmark.measure {
                            data_set.each do |result|
                              system.add_result(result)
                            end
                           }
  system.results_to_file(time)

end

def read_data_set(filename)
  set = []
  File.open(filename, "r") do |infile|
    while (line = infile.gets)
      next if line =~ /^\s*#/  # Skip comments
      next if line =~ /^\s*$/  # Skip empty lines
      w, b, winner, datetime = line.split(",")
      datetime   = DateTime.parse(datetime)
      set << {:white_player => w, :black_player => b, :winner => winner, :datetime => datetime}
    end
  end
  
return set
end

def even_test()
  set = []
  10.times do
    set << {:white_player => "a", :black_player => "b", :winner => "W", :datetime => DateTime.parse("2011-09-24")}
    set << {:white_player => "a", :black_player => "b", :winner => "B", :datetime => DateTime.parse("2011-09-24")}
  end
  return set
end

def stronger_player_test()
  set = []
  5.times do
    set << {:white_player => "c", :black_player => "d", :winner => "B", :datetime => DateTime.parse("2011-09-24")}
    20.times do
      set << {:white_player => "c", :black_player => "d", :winner => "W", :datetime => DateTime.parse("2011-09-24")}
    end
  end
  return set
end

set = read_data_set("data/sample_data.txt")
#run_simulation(SimplePoint, set)
run_simulation(Glicko, set)
#run_simulation(Glicko, even_test() + stronger_player_test())

