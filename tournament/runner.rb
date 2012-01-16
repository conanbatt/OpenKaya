require File.expand_path("system", File.dirname(__FILE__))
Dir[File.dirname(__FILE__) + "/strategies/*.rb"].each {|file| require file }
require 'benchmark'
require 'date'

=begin

  To add a new tournament system simulation:
    1. write the algorithm in a #{algorithms name}.rb inside "strategies"
    2. add tests to verify its running correctly
    3. make sure you implemented validate method, to be able tu run the runner with validate flag
    3. call method run_simulation
  That's it!

=end
VALIDATION_MODE = false

SYSTEMS_TO_RUN = []

ARGV.each do|a|
  puts "Called with: #{a}"
  VALIDATION_MODE = true if a=="Validate"
  SYSTEMS_TO_RUN << Kernel.const_get(a) if Kernel.const_defined?(a)
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
      w, b, rules, handicap, komi, winner, datetime = line.split(",")
      handicap = handicap.to_i
      komi     = komi.to_f
      datetime = DateTime.parse(datetime)
      set << {
        :white_player => w, 
        :black_player => b, 
        :rules        => rules, 
        :handicap     => handicap, 
        :komi         => komi, 
        :winner       => winner, 
        :datetime     => datetime
      }
    end
  end
  
return set
end

set = read_data_set("data/sample_data.txt")

SYSTEMS_TO_RUN.each do |rating_system|
  run_simulation(rating_system, set)
end

