require File.expand_path("test_helper", File.dirname(__FILE__))

test "Half the players are eliminated after the first round, then after second round Tournament is finished" do
  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest1", :players=>spawn_player_list(4)})
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
  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest2", :players=>spawn_player_list(5)})
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
  test_players << Player.new({:name=>"Paul", :ip=>"127.0.0.2", :rank=>"3d"})
  test_players << Player.new({:name=>"Jack", :ip=>"127.0.0.3", :rank=>"1d"})
  test_players << Player.new({:name=>"Pierre", :ip=>"127.0.0.1", :rank=>"6d"})
  test_players << Player.new({:name=>"Simon", :ip=>"127.0.0.4", :rank=>"5k"})
  test_players << Player.new({:name=>"Marie", :ip=>"127.0.0.5", :rank=>"8k"})
  test_players << Player.new({:name=>"Papa", :ip=>"127.0.0.6", :rank=>"12k"})
  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest3", :players=>test_players})
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

  single_elim = Organizer.create_tournament("SingleElimination", {:name => "SingleElimTest3",:players=>spawn_player_list(4)})
  single_elim.start_round
  assert_equal single_elim.fixture.size, 4

end
