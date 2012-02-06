require File.expand_path("test_helper", File.dirname(__FILE__))

test "Score computation and podium, 8 players with large rank difference, the 6d should win the tournament and 5 rounds is enough to sort out all players" do
  test_players = []
  test_players << Player.new("Pierre", "127.0.0.1", "6d")
  test_players << Player.new("Paul", "127.0.0.2", "3d")
  test_players << Player.new("Jack", "127.0.0.3", "1d")
  test_players << Player.new("Simon", "127.0.0.4", "5k")
  test_players << Player.new("Marie", "127.0.0.5", "8k")
  test_players << Player.new("Peter", "127.0.0.6", "12k")
  test_players << Player.new("Julie", "127.0.0.7", "12k")
  test_players << Player.new("El Diablo", "127.0.0.8", "15k")
  swiss_elim = Organizer.create_tournament("SwissTournament", test_players, 5)
  swiss_elim.start_round
  mock_results_based_on_rank(swiss_elim)
  swiss_elim.start_round
  mock_results_based_on_rank(swiss_elim)
  begin
    swiss_elim.start_round
    mock_results_based_on_rank(swiss_elim)
  end while swiss_elim.rounds.size < 5
  assert_equal swiss_elim.finished?,true
  assert_equal swiss_elim.podium[0].name, "Pierre"  
  assert_equal swiss_elim.podium[1].name, "Paul"  
  assert_equal swiss_elim.podium[2].name, "Jack"  
end

#TODO
test "a fixture from a new tournament shouldnt explode :) " do

  swiss = Organizer.create_tournament("SwissTournament", spawn_player_list(4),5)
  swiss.start_round
  assert_equal swiss.fixture.size, 4

end
