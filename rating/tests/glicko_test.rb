require 'cutest'
require File.expand_path("../strategies/glicko", File.dirname(__FILE__))
require File.expand_path("../system", File.dirname(__FILE__))

Glicko::print_constants()

class Player
  attr_accessor :rating, :rd, :time_last_played
end

test "rank2rating test" do
  assert(Glicko::rank2rating("10d") == 10.5)
  assert(Glicko::rank2rating("9d")  ==  9.5)
  assert(Glicko::rank2rating("1d")  ==  1.5)
  assert(Glicko::rank2rating("1k")  == -1.5)
  assert(Glicko::rank2rating("30k")  == -30.5)
  assert_raise(Glicko::GlickoError) do
     Glicko::rank2rating("30")
  end
end

test "Validate should raise error if rating is too small" do
  player_a = Player.new("a")
  player_a.rating = Rating.new_aga(-36.01).aga
  assert_raise(Glicko::GlickoError) do
    Glicko::validate(player_a)
  end
  player_a.rating = Rating.new_aga(-35.99).aga               # no problem here
  Glicko::validate(player_a)
end

test "Validate should raise error if rating is too large" do
  player_a = Player.new("a")
  player_a.rating = Rating.new_aga(13.01).aga
  assert_raise(Glicko::GlickoError) do
    Glicko::validate(player_a)
  end
  player_a.rating = Rating.new_aga(12.99).aga  # no problem here
  Glicko::validate(player_a)
end

test "Check rating conversion at key boundaries" do
  # rank() returns traditional ranks -- no extra accuracy, no negative signs for kyus
  assert(Rating.new_aga(-4.999).rank == "4k") # Weakest   4k
  assert(Rating.new_aga(-5.001).rank == "5k") # Strongest 5k
  assert(Rating.new_aga( 2.001).rank == "2d") # Weakest   2d
  assert(Rating.new_aga( 1.999).rank == "1d") # Strongest 1d
  assert(Rating.new_aga( 1.001).rank == "1d") # Weakest   1d
  assert(Rating.new_aga(-1.001).rank == "1k") # Strongest 1k

  # aga_rank_str() returns a tenths digit, and negative signs for kyus
  assert(Rating.new_aga(-4.999).aga_rank_str == "-4.9k") # Weakest   4k
  assert(Rating.new_aga(-5.001).aga_rank_str == "-5.0k") # Strongest 5k
  assert(Rating.new_aga( 2.001).aga_rank_str ==  "2.0d") # Weakest   2d
  assert(Rating.new_aga( 1.999).aga_rank_str ==  "1.9d") # Strongest 1d
  assert(Rating.new_aga( 1.001).aga_rank_str ==  "1.0d") # Weakest   1d
  assert(Rating.new_aga(-1.001).aga_rank_str == "-1.0k") # Strongest 1k
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
    r_low  = Rating.new_aga(aga_rating      )
    r_high = Rating.new_aga(aga_rating+0.998)
    puts "%7.3f %7.3f %3s %5.0f %5.0f" % [aga_rating, aga_rating+0.998, r_low.rank, r_low.elo, r_high.elo]
  end
end

test "Calculate win probability between 2 players" do
  rating_a = Rating.new()
  rating_b = Rating.new()
  rating_a.elo = 0.0
  rating_b.elo = 0.0
  rating_a.rd = 0.0
  rating_b.rd = 0.0
  assert_equal Glicko::win_probability(rating_a, rating_b), 0.500   # Equal ratings = 50% winrate
  rating_a.elo = -Math.log(2.0)*400.0/Math.log(10.0)
  assert_equal Glicko::win_probability(rating_a, rating_b), 1.0/3.0   # A slightly weaker than B = 33%
  rating_a.elo = Math.log(3.0)*400.0/Math.log(10.0)
  assert (Glicko::win_probability(rating_a, rating_b) - 0.75).abs < 0.0001  # A stronger than B = 75%
  rating_a.rd = Glicko::MAX_RD
  rating_b.rd = Glicko::MAX_RD
  assert Glicko::win_probability(rating_a, rating_b) < 0.75-0.01  # Higher RD means less confidence, so ratings tend toward 0.5
end

test "" do
  system = System.new(Glicko)
  p1 = system.players["p1"] = Player.new("p1")
  p2 = system.players["p2"] = Player.new("p2")

  p1.rating = Rating.new_aga(4.001).aga
  p2.rating = Rating.new_aga(4.01).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.50).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == 6.5)

  p2.rating = Rating.new_aga(4.49).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (((output[:e] - 0.65).abs < 0.02) or ((output[:e] - 0.35).abs < 0.02))  # Random colors will make this switch
  assert (output[:handi] == 0)
  assert (output[:komi] == 6.5)

  p2.rating = Rating.new_aga(4.51).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.50).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == 0.5)

  p2.rating = Rating.new_aga(4.99).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.65).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == 0.5)

  p2.rating = Rating.new_aga(5.01).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.50).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == -5.5)

  p2.rating = Rating.new_aga(6.01).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.50).abs < 0.02
  assert (output[:handi] == 2)
  assert (output[:komi] == -5.5)

  # Cover strong black player receiving handicap cases
  p1.rating = Rating.new_aga(4.999).aga
  p2.rating = Rating.new_aga(5.01).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.50).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == 6.5)

  p2.rating = Rating.new_aga(5.49).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.65).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == 6.5)

  p2.rating = Rating.new_aga(5.51).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.50).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == 0.5)

  p2.rating = Rating.new_aga(5.99).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.65).abs < 0.02
  assert (output[:handi] == 0)
  assert (output[:komi] == 0.5)

  p2.rating = Rating.new_aga(6.01).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:e] - 0.36).abs < 0.02
  assert (output[:handi] == 2)
  assert (output[:komi] == 0.5)


  # Failing edge test case
  p1.rating = Rating.new_aga(2.0).aga
  p2.rating = Rating.new_aga(-1.0).aga
  output = Glicko.suggest_handicap({:p1 => p1, :p2 => p2, :rules => "jpn"})
  assert (output[:handi] == 2)
  assert (output[:komi] == 0.5)
end

test "Equal wins" do
  #puts
  #puts "Equal wins"
  system = System.new(Glicko)
  for init_aga_rating in [-25, -1, 5]
    for (handi, komi) in [[0, 7.5], [0, 0.5], [0, -6.5], [2, 0.5], [6, 0.5]]
      plr_w = system.players["w"] = Player.new("w", Rating.new_aga(init_aga_rating).aga)
      plr_b = system.players["b"] = Player.new("b", Rating.new_aga(init_aga_rating).aga)
      80.times do
        system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "W", :datetime => DateTime.parse("2011-09-24")})
        system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "B", :datetime => DateTime.parse("2011-09-24")})
      end
      diff = Rating.new(plr_w.rating).kyudan - Rating.new(plr_b.rating).kyudan - Glicko::advantage_in_stones(handi, komi, 7.5)
      #puts "diff=%0.2f  %s  %s init_aga_rating=%0.1f handi=%d komi=%0.1f" % [diff, Glicko::rating_to_s(plr_w), Glicko::rating_to_s(plr_b), init_aga_rating, handi, komi]
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
    for win_ratio in 1..9
      plr_w = system.players["w"] = Player.new("w", Rating.new_aga(init_aga_rating).aga)
      plr_b = system.players["b"] = Player.new("b", Rating.new_aga(init_aga_rating).aga)
      80.times do
        win_ratio.times do # White wins win_ratio times
          system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "W", :datetime => DateTime.parse("2011-09-24")})
        end
        system.add_result({:white_player => "w", :black_player => "b", :rules => "aga", :handicap => handi, :komi => komi, :winner => "B", :datetime => DateTime.parse("2011-09-24")})
      end
      diff = Rating.new_aga(plr_w.rating).elo - Rating.new_aga(plr_b.rating).elo
      exp_diff = Math::log(win_ratio) / Rating::Q
      #puts "diff=%0.2f  exp=%0.2f elos:%0.0f %0.0f agas:%0.2f %0.2f" % [diff, exp_diff, plr_w.rating.elo, plr_b.rating.elo, plr_w.rating.aga, plr_b.rating.aga]
      assert ((diff - exp_diff).abs < (0.2/Rating::Q)) # Diff should be close to expected diff
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
  MAX_GAMES = 30
  datetime = DateTime.parse("2011-09-24")
  system = System.new(Glicko)
  anchor_rd = Glicko::MIN_RD
  test_rd = Glicko::MIN_RD
  for init_aga_rating in [8.0, -8.0]
    puts "Measure time it takes for RD to decay, and results for one game with init_aga_rating=%0.2f" % [init_aga_rating]
    puts "days rd  newR   95%   newAGA    95%      dR  dKD  (1/dKD)"
    for days_rest in (0..30).step(1).to_a + (30..Glicko::RD_DECAY).step(30).to_a
      plr_anchor = system.players["anchor"] = Player.new("anchor", Rating.new_aga(init_aga_rating).aga)
      plr_b      = system.players["b"]      = Player.new("b"     , Rating.new_aga(init_aga_rating).aga)
      plr_b.rd = test_rd
      plr_b.time_last_played = datetime
      datetime += days_rest
      plr_anchor.rd = anchor_rd  # Reset anchor's rd
      plr_anchor.time_last_played = datetime  # Avoid RD update logic
      prev_rat_anchor = plr_anchor.dup
      prev_rat_b      = plr_b.dup
      Glicko::initial_rd_update(plr_b, datetime)
      # To avoid going across the weird 5k-2d transition area,
      # do win streak for dans but loss streak for kyus
      winner = init_aga_rating >=0 ? "B" : "W"
      system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => winner, :datetime => datetime})
      dKD = (Rating.new(plr_b.rating).kyudan-Rating.new(prev_rat_b.rating).kyudan).abs
      puts "%3d %3d %s   %3.0f  %4.2f  (%4.1f)" % [days_rest, plr_b.rd, Glicko::rating_to_s(plr_b), (plr_b.rating-prev_rat_b.rating).abs, dKD, 1/dKD]
    end
  end
  for init_aga_rating in [8.0, -8.0]
  for anchor_rd in [Glicko::MIN_RD, Glicko::MAX_RD]  # Test against low rd and high rd opponents
    puts "Measure effect of rd on rating change for one game with init_aga_rating=%0.2f" % (init_aga_rating)
    print "  rd rd*2 newR   95%   newAGA    95%      dR  dKD  (1/dKD)"
    puts "   rd rd*2 newR   95%   newAGA    95%      dR  dKD  (1/dKD)"
    for test_rd in (Glicko::MIN_RD..Glicko::MAX_RD).step(10)
      plr_anchor = system.players["anchor"] = Player.new("anchor", Rating.new_aga(init_aga_rating).aga)
      plr_b      = system.players["b"]      = Player.new("b"     , Rating.new_aga(init_aga_rating).aga)
      plr_anchor.rd = anchor_rd  # Reset anchor's rd
      prev_rat_anchor = plr_anchor.dup
      plr_b.rd = test_rd
      plr_b.time_last_played = plr_anchor.time_last_played = datetime  # Avoid RD update logic
      prev_rat_b      = plr_b.dup
      # To avoid going across the weird 5k-2d transition area,
      # do win streak for dans but loss streak for kyus
      winner = init_aga_rating >= 0 ? "B" : "W"
      system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => winner, :datetime => datetime})
      dKD = (Rating.new(plr_b.rating).kyudan-Rating.new(prev_rat_b.rating).kyudan).abs
      print "%3d %3d %s   %3.0f  %4.2f  (%4.1f)" % [test_rd, test_rd*2, Glicko::rating_to_s(plr_b), (plr_b.rating-prev_rat_b.rating).abs, dKD, 1/dKD]
      dKD = (Rating.new(plr_anchor.rating).kyudan-Rating.new(prev_rat_anchor.rating).kyudan).abs
      puts " %3d %3d %s   %3.0f  %4.2f  (%4.1f)" % [anchor_rd, anchor_rd*2, Glicko::rating_to_s(plr_anchor), (plr_anchor.rating-prev_rat_anchor.rating).abs, dKD, 1/dKD]
    end
    end
  end
  key_results = Hash.recursive
  puts "New person winning 100%, all even games against solid opponents with same rating as the new person"
  for init_aga_rating in [8.0, -8.0]
    for days_rest in [0, 1, 7, 30]
      datetime = DateTime.parse("2011-09-24")
      puts "init_aga_rating=#{init_aga_rating} days_rest=#{days_rest}"
      puts "  #  newR   95%   newAGA    95%      dR  dKD  (1/dKD)"
      plr_anchor = system.players["anchor"] = Player.new("anchor", Rating.new_aga(init_aga_rating).aga)
      plr_b      = system.players["b"]      = Player.new("b"     , Rating.new_aga(init_aga_rating).aga)
      for i in 1..MAX_GAMES
        prev_rat_b      = plr_b.dup
        plr_anchor.rating = system.players["b"].rating = plr_b.rating  # Keep reseting the anchor to be same rating as the player
        #print "anchor_rat = %0.2f rd=%0.2f time=%s b_rat = %0.2f\n" % [plr_anchor.rating, plr_anchor.rd==nil ? 0.0 : plr_anchor.rd, "", plr_b.rating]
        plr_anchor.rd   = Glicko::MIN_RD           # Also assume the anchor plays a lot and has low RD
        plr_anchor.time_last_played = datetime       # Avoid RD update logic
        # To avoid going across the weird 5k-2d transition area,
        # do win streak for dans but loss streak for kyus
        winner = init_aga_rating >= 0 ? "B" : "W"
        system.add_result({:white_player => "anchor", :black_player => "b", :rules => "aga", :handicap => 0, :komi => 7.5, :winner => winner, :datetime => datetime})
        dKD = (Rating.new(plr_b.rating).kyudan-Rating.new(prev_rat_b.rating).kyudan).abs
        puts "%3d %s   %3.0f  %4.2f  (%4.1f)" % [i, Glicko::rating_to_s(plr_b), (plr_b.rating-prev_rat_b.rating).abs, dKD, 1/dKD]
        key_results[init_aga_rating][:dKD_init     ][days_rest] = dKD    if i==1
        if plr_b.rd==Glicko::MIN_RD and key_results[init_aga_rating][:numgame_minrd][days_rest] == {}
          key_results[init_aga_rating][:numgame_minrd][days_rest] = i
        end
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
  # dan stats
  assert (key_results[ 8.0][:dKD_inv_final][0] > 12.0)   # need around this many games to move a rank
  assert (key_results[ 8.0][:dKD_inv_final][0] < 15.0)
  assert (key_results[ 8.0][:dKD_init     ][0] < 1.0 )
  assert (key_results[ 8.0][:dKD_init     ][0] > 0.5 )
  assert (key_results[ 8.0][:numgame_minrd][0] > 15  )   # Takes this many games to get full confidence rank
  # dKD_inv_final of a once-a-week player is ~75%(+-10%) of a many games a day player
  assert (((key_results[ 8.0][:dKD_inv_final][7] / key_results[8.0][:dKD_inv_final][0]) - 0.75).abs < 0.10)

  # kyu stats
  assert (key_results[-8.0][:dKD_inv_final][0] >  6)   # need around this many games to move a rank
  assert (key_results[-8.0][:dKD_inv_final][0] < 10)
  assert (key_results[ 8.0][:dKD_init     ][0] < 1.0 )
  assert (key_results[ 8.0][:dKD_init     ][0] > 0.5 )
  # dKD_inv_final of a once-a-week player is ~75%(+-10%) of a many games a day player
  assert (((key_results[-8.0][:dKD_inv_final][7] / key_results[-8.0][:dKD_inv_final][0]) - 0.75).abs < 0.10)

  # relative dan - kyu stats
  assert (key_results[-8.0][:dKD_inv_final][0] <  key_results[8.0][:dKD_inv_final][0]) # kyus move faster
  assert (key_results[-8.0][:dKD_init     ][0] >  key_results[8.0][:dKD_init     ][0]) # kyus move faster
  assert (key_results[-8.0][:numgame_minrd][0] == key_results[8.0][:numgame_minrd][0]) # Takes same num games as dans
end

puts

