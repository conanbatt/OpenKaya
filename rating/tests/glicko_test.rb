require 'cutest'
require File.expand_path("../strategies/glicko", File.dirname(__FILE__))
require File.expand_path("../system", File.dirname(__FILE__))

player_a = Player.new("a", 0)
player_b = Player.new("b", 0)

test "Validate should raise error if rating is too small" do
  Glicko::set_aga_rating(player_a, -36.01)
  assert_raise(Glicko::GlickoError) do 
    Glicko::validate(player_a)
  end
  Glicko::set_aga_rating(player_a, -35.99)   # no problem here
  Glicko::validate(player_a)
end

test "Validate should raise error if rating is too large" do
  player_a = Player.new("a", 0)
  Glicko::set_aga_rating(player_a, 13.01)
  assert_raise(Glicko::GlickoError) do 
    Glicko::validate(player_a)
  end
  Glicko::set_aga_rating(player_a, 12.99)  # no problem here
  Glicko::validate(player_a)
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

test "Handicap/Komi advantage" do
  assert(Glicko::advantage_in_stones(0,  7.5, 7.5) == 0.0)
  assert(Glicko::advantage_in_stones(0,  0.5, 7.5) == 0.5)
  assert(Glicko::advantage_in_stones(0, -6.5, 7.5) == 1.0)
  print Glicko::advantage_in_stones(2,  0.5, 7.5)
  assert(Glicko::advantage_in_stones(2,  0.5, 7.5) == 1.5)
  assert(Glicko::advantage_in_stones(6,  0.5, 7.5) == 5.5)
  assert_raise(Glicko::GlickoError) do 
    assert(Glicko::advantage_in_stones(1,  0.5, 7.5))  # handi=1 is illegal -- instead just set komi=0.5
  end
end

# Just print the table for now, no actual tests
# TODO: Add tests for this
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
  assert_equal Glicko::win_probability(player_a, player_b), 0.500   # Equal ratings = 50% winrate
  player_a.rating = -Math.log(2.0)*400.0/Math.log(10.0)
  assert_equal Glicko::win_probability(player_a, player_b), 1.0/3.0   # A slightly weaker than B = 33%
  player_a.rating = Math.log(3.0)*400.0/Math.log(10.0)
  assert (Glicko::win_probability(player_a, player_b) - 0.75).abs < 0.0001  # A stronger than B = 75%
  player_a.rd = Glicko::MAX_RD
  player_b.rd = Glicko::MAX_RD
  assert Glicko::win_probability(player_a, player_b) < 0.75-0.01  # Higher RD means less confidence, so ratings tend toward 0.5
end

test "Equal wins" do
  #puts
  #puts "Equal wins"
  system = System.new(Glicko)
  for init_aga_rating in [-25, -1, 5]
    for (handi, komi) in [[0, 7.5], [0, 0.5], [0, -6.5], [2, 0.5], [6, 0.5]]
      plr_w = system.players["w"] = Glicko::set_aga_rating(Player.new("w", nil), init_aga_rating)
      plr_b = system.players["b"] = Glicko::set_aga_rating(Player.new("b", nil), init_aga_rating)
      80.times do
        system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "W", :datetime => DateTime.parse("2011-09-24")})
        system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "B", :datetime => DateTime.parse("2011-09-24")})
      end
      diff = Glicko::get_kyudan_rating(plr_w) - Glicko::get_kyudan_rating(plr_b) - Glicko::advantage_in_stones(handi, komi, 7.5)
      #puts "diff=%0.2f  %s  %s" % [diff, Glicko::rating_to_s(plr_w), Glicko::rating_to_s(plr_b)]
      assert (diff.abs < 0.2)              # Ratings should almost match the handicap advantage
      assert (plr_w.rd == Glicko::MIN_RD)  # rd should be smallest value with so many games
      assert (plr_b.rd == Glicko::MIN_RD)
    end
  end
  #puts
end

test "winratio test" do
  #puts
  #puts "winratio"
  system = System.new(Glicko)
  for init_aga_rating in [-25, -1, 5]
    (handi, komi) = [0, 7.5]
    for win_ratio in 2..9
      plr_w = system.players["w"] = Glicko::set_aga_rating(Player.new("w", nil), init_aga_rating)
      plr_b = system.players["b"] = Glicko::set_aga_rating(Player.new("b", nil), init_aga_rating)
      80.times do
        win_ratio.times do # White wins win_ratio times
          system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "W", :datetime => DateTime.parse("2011-09-24")})
        end
        system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "B", :datetime => DateTime.parse("2011-09-24")})
      end
      diff = plr_w.rating - plr_b.rating
      exp_diff = Math::log(win_ratio) / Glicko::Q
      #puts "diff=%0.2f  exp=%0.2f  %s  %s" % [diff, exp_diff, Glicko::rating_to_s(plr_w), Glicko::rating_to_s(plr_b)]
      assert ((diff - exp_diff).abs < (0.2/Glicko::Q)) # Diff should be close to expected diff
      assert (plr_w.rd == Glicko::MIN_RD)  # rd should be smallest value with so many games
      assert (plr_b.rd == Glicko::MIN_RD)
    end
  end
  #puts
end

class Hash
  def self.recursive
    new { |hash, key| hash[key] = recursive }
  end
end


test "Ratings response" do
  puts
  puts "Ratings response"
  MAX_GAMES = 30
  datetime = DateTime.parse("2011-09-24")
  system = System.new(Glicko)
  puts "days rd"
  for days_rest in (0..1200).step(30)
    plr_b = system.players["b"] = Player.new("b", nil)
    plr_b.rd = Glicko::MIN_RD
    plr_b.time_last_played = datetime
    datetime += days_rest
    #Glicko::initial_rd_update(plr_b, datetime + days_rest)
    Glicko::initial_rd_update(plr_b, datetime)
    puts "%3d %3d" % [days_rest, plr_b.rd]
  end
  for init_aga_rating in [8.0, -8.0]
    puts "  rd rd*2 newR   95%   newAGA    95%      dR  dKD  (1/dKD)"
    for rd in (Glicko::MIN_RD..Glicko::MAX_RD).step(10)
      plr_anchor = system.players["anchor"] = Glicko::set_aga_rating(Player.new("anchor", nil), init_aga_rating)
      plr_b      = system.players["b"]      = Glicko::set_aga_rating(Player.new("b"     , nil), init_aga_rating)
      plr_anchor.rd = Glicko::MIN_RD  # Assume anchor plays a lot and has low RD
      plr_b.rd = rd
      plr_b.time_last_played = plr_anchor.time_last_played = datetime  # Avoid RD update logic
      prev_plr_b      = plr_b.dup
      prev_plr_anchor = plr_anchor.dup
      # To avoid going across the weird 5k-2d transition area, 
      # do win streak for dans but loss streak for kyus
      if init_aga_rating >= 0
        system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "B", :datetime => datetime})
      else
        system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "W", :datetime => datetime})
      end
      dKD = (Glicko::get_kyudan_rating(plr_b)-Glicko::get_kyudan_rating(prev_plr_b)).abs
      puts "%3d %3d %s   %3.0f  %4.2f  (%4.1f)" % [rd, rd*2, Glicko::rating_to_s(plr_b), (plr_b.rating-prev_plr_b.rating).abs, dKD, 1/dKD]
    end
  end
  key_results = Hash.recursive
  puts "New person winning 100%, all even games against solid opponents with same rating as the new person"
  for init_aga_rating in [8.0, -8.0]
    for days_rest in [0, 1, 7, 30]
      datetime = DateTime.parse("2011-09-24")
      puts "init_aga_rating=#{init_aga_rating} days_rest=#{days_rest}"
      puts "  #  newR   95%   newAGA    95%      dR  dKD  (1/dKD)"
      plr_anchor = system.players["anchor"] = Glicko::set_aga_rating(Player.new("anchor", nil), init_aga_rating)
      plr_b      = system.players["b"]      = Glicko::set_aga_rating(Player.new("b"     , nil), init_aga_rating)
      for i in 1..MAX_GAMES
        prev_plr_b      = plr_b.dup
        prev_plr_anchor = plr_anchor.dup
        plr_anchor.rating = system.players["b"].rating  # Keep reseting the anchor to be same rating as the player
        plr_anchor.rd     = Glicko::MIN_RD              # Also assume the anchor plays a lot and has low RD
        plr_anchor.time_last_played = datetime          # Avoid RD update logic
        # To avoid going across the weird 5k-2d transition area, 
        # do win streak for dans but loss streak for kyus
        if init_aga_rating >= 0
          system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "B", :datetime => datetime})
        else
          system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => "W", :datetime => datetime})
        end
        dKD = (Glicko::get_kyudan_rating(plr_b)-Glicko::get_kyudan_rating(prev_plr_b)).abs
        puts "%3d %s   %3.0f  %4.2f  (%4.1f)" % [i, Glicko::rating_to_s(plr_b), (plr_b.rating-prev_plr_b.rating).abs, dKD, 1/dKD]
        key_results[init_aga_rating][:dKD_init     ][days_rest] = dKD    if i==1
        key_results[init_aga_rating][:numgame_minrd][days_rest] = i      if plr_b.rd==Glicko::MIN_RD and key_results[init_aga_rating][:numgame_minrd][days_rest] == {}
        key_results[init_aga_rating][:dKD_final    ][days_rest] = dKD    if i==MAX_GAMES
        key_results[init_aga_rating][:dKD_inv_final][days_rest] = 1/dKD  if i==MAX_GAMES
        datetime += days_rest  # new person waits this many days before playing again
      end
      puts
    end
  end
  for init_aga_rating,v in key_results.each
    for k,v in v.each
      for days_rest,v in v.each
        print "%15s %4.1f %6.2f %6.2f\n" % [k, days_rest, init_aga_rating, v]
      end
    end
  end
end

puts

