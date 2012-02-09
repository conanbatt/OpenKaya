require File.expand_path("test_helper", File.dirname(__FILE__))

test "Even number of players" do
  round_robin = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest1", :players=>spawn_player_list(4)})
  
  3.times do
    round_robin.start_round
    mock_results(round_robin)
  end
  
  assert_equal round_robin.finished?,true 
end

test "Odd number of players" do
  round_robin = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest2", :players=>spawn_player_list(5)})
  
  5.times do
    round_robin.start_round
    mock_results(round_robin)
  end
  
  assert_equal round_robin.finished?,true 
end

test "Use case, 6 players with wide rank difference, the 6d should win the tournament" do
  test_players = []
  test_players << Player.new(:name=>"Pierre", :ip=>"127.0.0.1", :rank=>"6d")
  test_players << Player.new(:name=>"Paul", :ip=>"127.0.0.2", :rank=>"3d")
  test_players << Player.new(:name=>"Jack", :ip=>"127.0.0.3", :rank=>"1d")
  test_players << Player.new(:name=>"Simon", :ip=>"127.0.0.4", :rank=>"5k")
  test_players << Player.new(:name=>"Marie", :ip=>"127.0.0.5", :rank=>"8k")
  test_players << Player.new(:name=>"Peter", :ip=>"127.0.0.6", :rank=>"12k")
  test_players << Player.new(:name=>"Julie", :ip=>"127.0.0.7", :rank=>"12k")
  round_robin = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest3", :players=>test_players})
  
  5.times do
    round_robin.start_round
    mock_results_based_on_rank(round_robin)
  end
  
  assert_equal round_robin.podium[0].name, "Pierre"   
end

test "a fixture from a new tournament shouldnt explode :) " do
  rr = Organizer.create_tournament("RoundRobinTournament", {:name=>"RoundRobinTournamentTest4", :players=>spawn_player_list(4)})
  rr.start_round
  assert_equal rr.fixture.size, 4
end
