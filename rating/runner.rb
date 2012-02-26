require File.expand_path("system", File.dirname(__FILE__))
Dir[File.dirname(__FILE__) + "/strategies/*.rb"].each {|file| require file }
require 'benchmark'
require 'date'

=begin

  To add a new rating system simulation:
    1. write the algorithm in a #{algorithms name}.rb inside "strategies"
    2. add tests to verify its running correctly
    3. make sure you implemented validate method, to be able tu run the runner with validate flag
    3. call method run_simulation
  That's it!

  Remember to pass on the argument to run the Rating system!

=end
VALIDATION_MODE = false

SYSTEMS_TO_RUN = [Glicko]

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

def spawn_static_players(count, min_rank, max_rank)
  players = []
  min_aga_rating = 0.0
  max_aga_rating = 0.0
  #convert KGS rank to AGA rating
  if min_rank[-1,1] == "k"
    min_aga_rating = - (min_rank[0, min_rank.length-1].to_i)
  elsif min_rank[-1,1] == "d"
    min_aga_rating =   (min_rank[0, min_rank.length-1].to_i)
  else
    raise "Error converting supplied min_rank ("+min_rank+") to aga rating"
  end
  if max_rank[-1,1] == "k"
    max_aga_rating = - (max_rank[0, max_rank.length-1].to_i)
  elsif max_rank[-1,1] == "d"
    max_aga_rating =   (max_rank[0, max_rank.length-1].to_i)
  else
    raise "Error converting supplied max_rank ("+max_rank+") to aga rating"
  end
  min_rating = Rating.new_aga(min_aga_rating).elo
  max_rating = Rating.new_aga(max_aga_rating).elo
  count.times do |id|
      rating = (min_rating + (max_rating - min_rating) * rand).to_i
      rank = Rating.new_elo(rating).aga_rank_str
      players << {:id => "player" + id.to_s, :rank => rank, :rating => rating, :played_games => 0, :won_games => 0, :winning_ratio => 0}
  end
  return players
end

def rank_distance(rank_a, rank_b)
   if rank_a[-1,1] == "k" and rank_b[-1,1] == "d"
        rank_a_k = rank_a[0, rank_a.length-1].to_f
        rank_b_d = rank_b[0, rank_b.length-1].to_f
        return (rank_a_k - rank_b_d  + 1.0)
    end
    if rank_b[-1,1] == "k" and rank_a[-1,1] == "d"
        rank_a_d = rank_a[0, rank_a.length-1].to_f
        rank_b_k = rank_b[0, rank_b.length-1].to_f
        return (rank_a_d - rank_b_k  - 1.0)
    end
    if rank_a[-1,1] == "k" 
       return (rank_a[0, rank_a.length-1].to_f - rank_b[0, rank_b.length-1].to_f)
    end
    if rank_a[-1,1] == "d"
      return (rank_a[0, rank_a.length-1].to_f - rank_b[0, rank_b.length-1].to_f)
    end
end

def create_realistic_game_result(player_a, player_b, suggested_handicap)
  real_rank_handicap = rank_distance(player_a[:rank], player_b[:rank]).to_i
  handicap = suggested_handicap[:handi]
  komi = suggested_handicap[:komi]
  played_handicap = handicap + ((komi == 0.5 || komi == -5.5) ? 1 : 0)
  white_player = suggested_handicap[:white].id
  black_player = suggested_handicap[:black].id
  if black_player == player_a[:id]
    real_rank_handicap = -real_rank_handicap
  end
  winner = nil
  winning_prob = (0.50 + (0.1 * (real_rank_handicap - played_handicap)))
  winning_prob = 0 if winning_prob < 0
  #players evenly matched: assuming 50/50
  #if ((real_rank_handicap - played_handicap).abs < 0.5)  == 0
  if rand < winning_prob
    winner = white_player
  else
    winner = black_player
  end
  #puts "#{player_a[:id]}(#{player_a[:rank]}) vs  #{player_b[:id]}(#{player_b[:rank]}) with suggested handicap of #{handicap} given by #{white_player} instead of #{real_rank_handicap} and winner is #{winner} white winning prob #{winning_prob}"
  return {
        :white_player => white_player, 
        :black_player => black_player, 
        :rules        => "aga", 
        :handicap     => handicap, 
        :komi         => komi, 
        :winner       => winner, 
        :datetime     => nil
  }
end

def rank_compare(rank_a, rank_b)
  if(rank_a == rank_b)
    return 0
  end
  if(rank_distance(rank_a, rank_b) < 0)
    return -1
  else
    return 1
  end
end

def run_simulation(strategy, players_count, games_count)
  system = System.new(strategy, VALIDATION_MODE)
  players = spawn_static_players(players_count,"30k", "9d")
  time = Benchmark.measure {
    result_count = 0
    current_time = Time.now
    begin
      opponents = players.sample(2)
      suggested_handicap = Glicko.suggest_handicap({:p1 => system.fetch_or_create[opponents[0][:id]], :p2 => system.fetch_or_create[opponents[1][:id]], :rules => "aga"})
      result = create_realistic_game_result(opponents[0], opponents[1], suggested_handicap)
      unless result.nil?
        current_time += (200 + rand*5000).to_i
        result[:datetime] = current_time
        opponents[0][:played_games] += 1
        opponents[1][:played_games] += 1
        if result[:winner] ==  opponents[0][:id]
          opponents[0][:won_games] += 1
          opponents[0][:winning_ratio] = opponents[0][:won_games].to_f / opponents[0][:played_games].to_f
        else
          opponents[1][:won_games] += 1
          opponents[1][:winning_ratio] = opponents[1][:won_games].to_f / opponents[1][:played_games].to_f
        end
        system.add_result(result)
        result_count += 1
      end
    end while result_count < games_count
  }
  players = players.sort{ |b,a| rank_compare(a[:rank],b[:rank]) }
  system.compared_results_to_file(players, time)
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

#Tests of new functions

#--- rank distance
assert(rank_distance("5d", "1d") == 4.0)
assert(rank_distance("3d", "8d") == -5.0)
assert(rank_distance("1d", "1d") == 0.0)
assert(rank_distance("-1k", "-1k") == 0.0)
assert(rank_distance("-1k", "1d") == -1.0)
assert(rank_distance("1d", "-1k") == 1.0)
assert(rank_distance("-4k", "1d") == -4.0)
assert(rank_distance("1d", "-5k") == 5.0)
assert(rank_distance("-1k", "-2k") == 1.0)
assert(rank_distance("-7k", "-2k") == -5.0)

SYSTEMS_TO_RUN.each do |rating_system|
  run_simulation(rating_system, 1500, 300000)
end

