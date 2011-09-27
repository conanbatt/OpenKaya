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


