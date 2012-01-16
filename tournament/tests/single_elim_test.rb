require File.expand_path("test_helper", File.dirname(__FILE__))

#See base_tournament_test for hints and examples on what to test
#Focus on testing that the results make sense exclusively for what a single elimination tournament is

def spawn_player_list(number)
  list =[]
  number.times {|n| list << Player.new(rand(8**4).to_s, list.size, "1k")}
  list

end

def mock_results(tournament)
  tournament.pairings.each do |pairing|
    tournament.add_result(pairing.white_player, pairing.black_player, "W+R")
  end
end

test "Half the players are eliminated after the first round" do
  single_elim = Organizer.create_tournament("SingleElimination", spawn_player_list(4))

  single_elim.start_round
  assert_equal single_elim.players.size, 4
  assert_equal single_elim.live_players.size, 4

  mock_results(single_elim)

  assert_equal single_elim.players.size,4
  assert_equal single_elim.live_players.size,2
end

