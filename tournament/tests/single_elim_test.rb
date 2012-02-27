require File.expand_path("test_helper", File.dirname(__FILE__))

test "Half the players are eliminated after the first round, then after second round Tournament is finished" do
  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest1"})
  single_elim.add_players(spawn_player_list(4))
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
  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest2"})
  single_elim.add_players(spawn_player_list(5))
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
  test_players << Player.new({:name=>"Paul",:rank=>"3d"})
  test_players << Player.new({:name=>"Jack",  :rank=>"1d"})
  test_players << Player.new({:name=>"Pierre", :rank=>"6d"})
  test_players << Player.new({:name=>"Simon", :rank=>"5k"})
  test_players << Player.new({:name=>"Marie", :rank=>"8k"})
  test_players << Player.new({:name=>"Papa", :rank=>"12k"})
  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest3"})
  single_elim.add_players(test_players)
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

test "a fixture from a new tournament shouldnt explode :) " do
  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest4"})
  single_elim.add_players(spawn_player_list(4))
  single_elim.start_round
  assert_equal single_elim.fixture.size, 4
end
