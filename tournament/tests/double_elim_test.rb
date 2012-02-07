require File.expand_path("test_helper", File.dirname(__FILE__))

test "Score computation and podium, 6 players with wide rank difference, the 6d should win the tournament" do
  test_players = []
  test_players << Player.new("Pierre", "127.0.0.1", "6d")
  test_players << Player.new("Paul", "127.0.0.2", "3d")
  test_players << Player.new("Jack", "127.0.0.3", "1d")
  test_players << Player.new("Simon", "127.0.0.4", "5k")
  test_players << Player.new("Marie", "127.0.0.5", "8k")
  test_players << Player.new("Papa", "127.0.0.6", "12k")
  double_elim = Organizer.create_tournament("DoubleElimination", test_players)
  double_elim.start_round
  mock_results_based_on_rank(double_elim)
  assert_equal double_elim.players.size,6
  assert_equal double_elim.live_players.size,6
  double_elim.start_round
  mock_results_based_on_rank(double_elim)
  
  double_elim.live_players.each do |p|
     assert double_elim.count_loss(p) < 2
  end
  
  begin
    double_elim.start_round
    mock_results_based_on_rank(double_elim)
  end while double_elim.live_players.size > 1
  
  assert_equal double_elim.finished?,true
  assert_equal double_elim.podium[0].name, "Pierre"   
end

#TODO
test "a fixture from a new tournament shouldnt explode :) " do

  double_elim = Organizer.create_tournament("DoubleElimination", spawn_player_list(4))
  double_elim.start_round
  assert_equal double_elim.fixture.size, 4

end
