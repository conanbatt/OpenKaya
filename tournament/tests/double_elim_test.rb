require File.expand_path("test_helper", File.dirname(__FILE__))

test "Score computation and podium, 6 players with wide rank difference, the 6d should win the tournament" do
  test_players = []
  test_players << Player.new({:name=>"Paul",  :rank=>"3d"})
  test_players << Player.new({:name=>"Jack", :rank=>"1d"})
  test_players << Player.new({:name=>"Pierre", :rank=>"6d"})
  test_players << Player.new({:name=>"Simon", :rank=>"5k"})
  test_players << Player.new({:name=>"Marie", :rank=>"8k"})
  test_players << Player.new({:name=>"Papa",:rank=>"12k"})
  double_elim = Organizer.create_tournament("DoubleElimination", {:name => "DoubleElimTest1"})
  double_elim.add_players(test_players)
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

  double_elim = Organizer.create_tournament("DoubleElimination", {:name => "DoubleElimTest2"})
  double_elim.add_players(spawn_player_list(4))
  double_elim.start_round
  assert_equal double_elim.fixture.size, 4

end
