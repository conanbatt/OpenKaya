require File.expand_path("test_helper", File.dirname(__FILE__))

test "McMahon Base functions" do
  test_players = []
  test_players << Player.new("Pierre", "127.0.0.1", "6d")
  test_players << Player.new("Kristina", "127.0.0.1", "6d")
  test_players << Player.new("Paige", "127.0.0.1", "6d")
  test_players << Player.new("Karen", "127.0.0.1", "6d")
  test_players << Player.new("Hazel", "127.0.0.1", "5d")
  test_players << Player.new("Malcolm", "127.0.0.1", "5d")
  test_players << Player.new("Dolores", "127.0.0.1", "5d")
  test_players << Player.new("Pierre", "127.0.0.1", "3d")
  test_players << Player.new("Paul", "127.0.0.2", "3d")
  test_players << Player.new("Marion", "127.0.0.2", "3d")
  test_players << Player.new("Neal", "127.0.0.2", "3d")
  test_players << Player.new("Eric", "127.0.0.2", "2d")
  test_players << Player.new("Alez", "127.0.0.3", "2d")
  test_players << Player.new("Crystal", "127.0.0.3", "1d")
  test_players << Player.new("Jack", "127.0.0.3", "1d")
  test_players << Player.new("Christina", "127.0.0.4", "1k")
  test_players << Player.new("Louis", "127.0.0.4", "2k")
  test_players << Player.new("Jerome", "127.0.0.4", "3k")
  test_players << Player.new("Simon", "127.0.0.4", "5k")
  test_players << Player.new("Marie", "127.0.0.5", "8k")
  test_players << Player.new("Peter", "127.0.0.6", "12k")
  test_players << Player.new("Julie", "127.0.0.7", "12k")
  test_players << Player.new("El Diablo", "127.0.0.8", "15k")
  mcmahon_tournament = Organizer.create_tournament("McMahonTournament", test_players, 3, false)
  assert_equal mcmahon_tournament.mcmahon_bar, "3d"
  assert_equal mcmahon_tournament.rank_to_scale_value("25k"), 0
  assert_equal mcmahon_tournament.rank_to_scale_value("20k"), 0
  assert_equal mcmahon_tournament.rank_to_scale_value("15k"), 5
  assert_equal mcmahon_tournament.rank_to_scale_value("1k"), 19
  assert_equal mcmahon_tournament.rank_to_scale_value("1d"), 20
  assert_equal mcmahon_tournament.rank_to_scale_value("3d"), 22
  assert_equal mcmahon_tournament.rank_to_scale_value("4d"), 23
  assert_equal mcmahon_tournament.rank_to_scale_value("6d"), 25
  assert_equal mcmahon_tournament.mcmahon_initial_score("1k"), 19
  assert_equal mcmahon_tournament.mcmahon_initial_score("15k"), 5
  assert_equal mcmahon_tournament.mcmahon_initial_score("3d"), 22
  assert_equal mcmahon_tournament.mcmahon_initial_score("6d"), 22
end

test "Score computation and podium, 8 players with large rank difference, the 6d should win the tournament and 3 rounds is enough to sort out all players" do
  test_players = []
  test_players << Player.new("Pierre", "127.0.0.1", "6d")
  test_players << Player.new("Paul", "127.0.0.2", "3d")
  test_players << Player.new("Jack", "127.0.0.3", "1d")
  test_players << Player.new("Simon", "127.0.0.4", "5k")
  test_players << Player.new("Marie", "127.0.0.5", "8k")
  test_players << Player.new("Peter", "127.0.0.6", "12k")
  test_players << Player.new("Julie", "127.0.0.7", "12k")
  test_players << Player.new("El Diablo", "127.0.0.8", "15k")
  mcmahon_tournament = Organizer.create_tournament("McMahonTournament", test_players, 5, false)
  mcmahon_tournament.mcmahon_bar
  mcmahon_tournament.start_round
  mock_results_based_on_rank(mcmahon_tournament)
  mcmahon_tournament.start_round
  mock_results_based_on_rank(mcmahon_tournament)
  begin
    mcmahon_tournament.start_round
    mock_results_based_on_rank(mcmahon_tournament)
  end while mcmahon_tournament.rounds.size < 5
  assert_equal mcmahon_tournament.finished?,true
  assert_equal mcmahon_tournament.podium[0].name, "Pierre"  
end