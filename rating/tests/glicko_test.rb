require 'cutest'
require File.expand_path("../strategies/glicko", File.dirname(__FILE__))
require File.expand_path("../system", File.dirname(__FILE__))

player_a = Player.new("a", 0)
player_b = Player.new("b", 0)

test "Validate should raise error if rating is too small" do
  Glicko::set_aga_rating(player_a, -36.01)
  assert_raise(Glicko::GlickoError) do 
    Glicko.validate(player_a)
  end
  Glicko::set_aga_rating(player_a, -35.99)   # no problem here
  Glicko.validate(player_a)
end

test "Validate should raise error if rating is too large" do
  player_a = Player.new("a", 0)
  Glicko::set_aga_rating(player_a, 13.01)
  assert_raise(Glicko::GlickoError) do 
    Glicko.validate(player_a)
  end
  Glicko::set_aga_rating(player_a, 12.99)  # no problem here
  Glicko.validate(player_a)
end

test "Check rating conversion at key boundaries" do
  # rank() returns traditional ranks -- no extra accuracy, no negative signs for kyus
  assert(Glicko::rank(Glicko::set_aga_rating(Player.new("a", nil), -4.999)) == "4k")  # Weakest   4k
  assert(Glicko::rank(Glicko::set_aga_rating(Player.new("a", nil), -5.001)) == "5k")  # Strongest 5k
  assert(Glicko::rank(Glicko::set_aga_rating(Player.new("a", nil),  2.001)) == "2d")  # Weakest   2d
  assert(Glicko::rank(Glicko::set_aga_rating(Player.new("a", nil),  1.999)) == "1d")  # Strongest 1d
  assert(Glicko::rank(Glicko::set_aga_rating(Player.new("a", nil),  1.001)) == "1d")  # Weakest   1d
  assert(Glicko::rank(Glicko::set_aga_rating(Player.new("a", nil), -1.001)) == "1k")  # Strongest 1k

  # aga_rank_str() returns a tenths digit, and negative signs for kyus
  assert(Glicko::aga_rank_str(Glicko::set_aga_rating(Player.new("a", nil), -4.999)) == "-4.9k")  # Weakest   4k
  assert(Glicko::aga_rank_str(Glicko::set_aga_rating(Player.new("a", nil), -5.001)) == "-5.0k")  # Strongest 5k
  assert(Glicko::aga_rank_str(Glicko::set_aga_rating(Player.new("a", nil),  2.001)) ==  "2.0d")  # Weakest   2d
  assert(Glicko::aga_rank_str(Glicko::set_aga_rating(Player.new("a", nil),  1.999)) ==  "1.9d")  # Strongest 1d
  assert(Glicko::aga_rank_str(Glicko::set_aga_rating(Player.new("a", nil),  1.001)) ==  "1.0d")  # Weakest   1d
  assert(Glicko::aga_rank_str(Glicko::set_aga_rating(Player.new("a", nil), -1.001)) == "-1.0k")  # Strongest 1k
end

# Just print the table for now, no actual tests
test "Ratings table" do
  puts
  puts "Ratings table"
  for aga_rating in ((-30.999..-1.99).step(1.0).to_a+(1.001..10.001).step(1.0).to_a).reverse
    next if aga_rating > -1.0 && aga_rating < 1.0
    p_low  = Glicko::set_aga_rating(Player.new("a", nil), aga_rating     )
    p_high = Glicko::set_aga_rating(Player.new("a", nil), aga_rating+0.998)
    puts "%7.3f %7.3f %3s %5.0f %5.0f" % [aga_rating, aga_rating+0.998, Glicko::rank(p_low), p_low.rating, p_high.rating]
  end
end

test "Calculate win probability between 2 players" do
  player_a.rating = 0.0
  player_b.rating = 0.0
  player_a.rd = 0.0
  player_b.rd = 0.0
  assert_equal Glicko.win_probability(player_a, player_b), 0.500   # Equal ratings = 50% winrate
  player_a.rating = -Math.log(2.0)*400.0/Math.log(10.0)
  assert_equal Glicko.win_probability(player_a, player_b), 1.0/3.0   # A slightly weaker than B = 33%
  player_a.rating = Math.log(3.0)*400.0/Math.log(10.0)
  assert (Glicko.win_probability(player_a, player_b) - 0.75).abs < 0.0001  # A stronger than B = 75%
  player_a.rd = Glicko::MAX_RD
  player_b.rd = Glicko::MAX_RD
  assert Glicko.win_probability(player_a, player_b) < 0.75-0.1  # Higher RD means less confidence, so ratings tend toward 0.5
end

# TODO: Add actual checking to some of these
# For now just running them
test "Even strength test" do
  set = []
  10.times do
    set << {:white_player => "a", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "W", :datetime => DateTime.parse("2011-09-24")}
    set << {:white_player => "a", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "B", :datetime => DateTime.parse("2011-09-24")}
  end
  system = System.new(Glicko)
  set.each do |result|
    system.add_result(result)
  end
end

test "No komi test" do
  set = []
  10.times do
    set << {:white_player => "a", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 0.5, :winner => "W", :datetime => DateTime.parse("2011-09-24")}
    set << {:white_player => "a", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 0.5, :winner => "B", :datetime => DateTime.parse("2011-09-24")}
  end
  system = System.new(Glicko)
  set.each do |result|
    system.add_result(result)
  end
end

test "Six stone handicap test" do
  set = []
  10.times do
    set << {:white_player => "a", :black_player => "b", :rules => "aga", :handicap => 6, :komi => 0.5, :winner => "W", :datetime => DateTime.parse("2011-09-24")}
    set << {:white_player => "a", :black_player => "b", :rules => "aga", :handicap => 6, :komi => 0.5, :winner => "B", :datetime => DateTime.parse("2011-09-24")}
  end
  system = System.new(Glicko)
  set.each do |result|
    system.add_result(result)
  end
end

test "Stronger player test" do
  set = []
  5.times do
    set << {:white_player => "c", :black_player => "d", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "B", :datetime => DateTime.parse("2011-09-24")}
    20.times do
      set << {:white_player => "c", :black_player => "d", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "W", :datetime => DateTime.parse("2011-09-24")}
    end
  end
  system = System.new(Glicko)
  set.each do |result|
    system.add_result(result)
  end
end

test "Ratings response" do
  puts
  puts "Ratings response"
  puts "New person playing all even games against solid opponents with same rating as the new person"
  system = System.new(Glicko)
  for days_rest in [0, 7, 30] do
    for init_aga_rating in [5.0, -30.0] do
      puts "init_aga_rating=#{init_aga_rating} days_rest=#{days_rest}"
      puts "  #  newR   95%   newAGA    95%      dR  dKD  (1/dKD)"
      plr_anchor = system.players["anchor"] = Glicko.set_aga_rating(Player.new("anchor", nil), init_aga_rating)
      plr_b      = system.players["b"]      = Glicko.set_aga_rating(Player.new("b"     , nil), init_aga_rating)
      datetime = DateTime.parse("2011-09-24")
      for i in 1..40 do
        prev_plr_b      = plr_b.dup
        prev_plr_anchor = plr_anchor.dup
        system.players["anchor"].rating = system.players["b"].rating  # Keep reseting the anchor to be same rating as the player
        system.players["anchor"].rd     = Glicko::MIN_RD              # Also assume the anchor plays a lot and has high confidence rating
        system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "B", :datetime => datetime})
        dKD = Glicko.get_kyudan_rating(plr_b)-Glicko.get_kyudan_rating(prev_plr_b)
        puts "%3d %s   %3.0f  %4.2f  (%4.1f)" % [i, Glicko.rating_to_s(plr_b), plr_b.rating-prev_plr_b.rating, dKD, 1/dKD]
        datetime += days_rest  # new person waits this many days before playing again
      end
      puts
    end
  end
end

puts

