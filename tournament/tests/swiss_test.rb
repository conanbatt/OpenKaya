require File.expand_path("test_helper", File.dirname(__FILE__))

test "Score computation and podium, 8 players with large rank difference, the 6d should win the tournament and 5 rounds is enough to sort out all players" do
  test_players = []
  test_players << Player.new(:name=>"Pierre", :ip=>"127.0.0.1", :rank=>"6d")
  test_players << Player.new(:name=>"Paul", :ip=>"127.0.0.2", :rank=>"3d")
  test_players << Player.new(:name=>"Jack", :ip=>"127.0.0.3", :rank=>"1d")
  test_players << Player.new(:name=>"Simon", :ip=>"127.0.0.4", :rank=>"5k")
  test_players << Player.new(:name=>"Marie", :ip=>"127.0.0.5", :rank=>"8k")
  test_players << Player.new(:name=>"Peter", :ip=>"127.0.0.6", :rank=>"12k")
  test_players << Player.new(:name=>"Julie", :ip=>"127.0.0.7", :rank=>"12k")
  test_players << Player.new(:name=>"El Diablo", :ip=>"127.0.0.8", :rank=>"15k")
  swiss_elim = Organizer.create_tournament("SwissTournament", {:name=>"SwissTournamentTest1", :players=>test_players, :rounds_count=>5})
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

test "a fixture from a new tournament shouldnt explode :) " do
  swiss = Organizer.create_tournament("SwissTournament", {:name=>"SwissTournamentTest2", :players=>spawn_player_list(4), :rounds_count=>5})
  swiss.start_round
  assert_equal swiss.fixture.size, 4
end
