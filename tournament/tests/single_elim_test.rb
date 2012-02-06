require File.expand_path("test_helper", File.dirname(__FILE__))

test "Half the players are eliminated after the first round, then after second round Tournament is finished" do
  single_elim = Organizer.create_tournament("SingleElimination", spawn_player_list(4))
  single_elim.start_round
  assert_equal single_elim.players.size, 4
  assert_equal single_elim.live_players.size, 4
  mock_results(single_elim)
  assert_equal single_elim.players.size,4
  assert_equal single_elim.live_players.size,2
  single_elim.start_round
  mock_results(single_elim)
  assert_equal single_elim.finished?,true 
end

test "Odd number of players, similar test as first one, tournament should finish after 3 rounds" do
  single_elim = Organizer.create_tournament("SingleElimination", spawn_player_list(5))
  single_elim.start_round
  mock_results(single_elim)
  assert_equal single_elim.players.size,5
  assert_equal single_elim.live_players.size,3
  single_elim.start_round
  mock_results(single_elim)
  assert_equal single_elim.live_players.size,2
  single_elim.start_round
  mock_results(single_elim)
  assert_equal single_elim.finished?,true 
end

test "Score computation and podium, 6 players with wide rank difference, the 6d should win the tournament" do
  test_players = []
  test_players << Player.new("Paul", "127.0.0.2", "3d")
  test_players << Player.new("Jack", "127.0.0.3", "1d")
  test_players << Player.new("Pierre", "127.0.0.1", "6d")
  test_players << Player.new("Simon", "127.0.0.4", "5k")
  test_players << Player.new("Marie", "127.0.0.5", "8k")
  test_players << Player.new("Papa", "127.0.0.6", "12k")
  single_elim = Organizer.create_tournament("SingleElimination", test_players)
  single_elim.start_round
  mock_results_based_on_rank(single_elim)
  assert_equal single_elim.players.size,6
  assert_equal single_elim.live_players.size,3
  single_elim.start_round
  mock_results_based_on_rank(single_elim)
  assert_equal single_elim.live_players.size,2
  single_elim.start_round
  mock_results_based_on_rank(single_elim)
  assert_equal single_elim.finished?,true
  assert_equal single_elim.podium[0].name, "Pierre"   
end

#TODO
test "a fixture from a new tournament shouldnt explode :) " do

  single_elim = Organizer.create_tournament("SingleElimination", spawn_player_list(4))
  single_elim.start_round
  assert_equal single_elim.fixture.size, 4

end
