require File.expand_path("test_helper", File.dirname(__FILE__))

test "Even number of players" do
  round_robin = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest1"})
  round_robin.add_players(spawn_player_list(4))
  3.times do
    round_robin.start_round
    mock_results(round_robin)
  end
  
  assert_equal round_robin.finished?,true 
end

test "Odd number of players" do
  round_robin = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest2"})
  round_robin.add_players(spawn_player_list(5))
  5.times do
    round_robin.start_round
    mock_results(round_robin)
  end
  
  assert_equal round_robin.finished?,true 
end

test "Use case, 6 players with wide rank difference, the 6d should win the tournament" do
  test_players = []
  test_players << Player.new(:name=>"Pierre", :rank=>"6d")
  test_players << Player.new(:name=>"Paul",   :rank=>"3d")
  test_players << Player.new(:name=>"Jack",  :rank=>"1d")
  test_players << Player.new(:name=>"Simon", :rank=>"5k")
  test_players << Player.new(:name=>"Marie", :rank=>"8k")
  test_players << Player.new(:name=>"Peter", :rank=>"12k")
  test_players << Player.new(:name=>"Julie", :rank=>"12k")
  round_robin = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest3"})
  round_robin.add_players(test_players)
  
  5.times do
    round_robin.start_round
    mock_results_based_on_rank(round_robin)
  end
  
  assert_equal round_robin.podium[0].name, "Pierre"   
end

test "a fixture from a new tournament shouldnt explode :) " do
  rr = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest4"})
  rr.add_players(spawn_player_list(4))
  rr.start_round
  assert_equal rr.fixture.size, 4
end
