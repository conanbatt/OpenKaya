require File.expand_path("test_helper", File.dirname(__FILE__))

test "Even number of players" do
  round_robin = Organizer.create_tournament("RoundRobinTournament", spawn_player_list(4))
  
  3.times do
    round_robin.start_round
    mock_results(round_robin)
  end
  
  assert_equal round_robin.finished?,true 
end

test "Odd number of players" do
  round_robin = Organizer.create_tournament("RoundRobinTournament", spawn_player_list(5))
  
  5.times do
    round_robin.start_round
    mock_results(round_robin)
  end
  
  assert_equal round_robin.finished?,true 
end

test "Use case, 6 players with wide rank difference, the 6d should win the tournament" do
  test_players = []
  test_players << Player.new("Paul", "127.0.0.2", "3d")
  test_players << Player.new("Jack", "127.0.0.3", "1d")
  test_players << Player.new("Pierre", "127.0.0.1", "6d")
  test_players << Player.new("Simon", "127.0.0.4", "5k")
  test_players << Player.new("Marie", "127.0.0.5", "8k")
  test_players << Player.new("Papa", "127.0.0.6", "12k")
  round_robin = Organizer.create_tournament("RoundRobinTournament", test_players)
  
  5.times do
    round_robin.start_round
    mock_results_based_on_rank(round_robin)
  end
  
  assert_equal round_robin.podium[0].name, "Pierre"   
end