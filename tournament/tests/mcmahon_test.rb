require File.expand_path("test_helper", File.dirname(__FILE__))

test "McMahon Base functions" do
  test_players = []
  test_players << Player.new(:name=>"Pierre", :ip=>"127.0.0.1", :rank=>"6d")
  test_players << Player.new(:name=>"Kristina", :ip=>"127.0.0.1", :rank=>"6d")
  test_players << Player.new(:name=>"Paige", :ip=>"127.0.0.1", :rank=>"6d")
  test_players << Player.new(:name=>"Karen", :ip=>"127.0.0.1", :rank=>"6d")
  test_players << Player.new(:name=>"Hazel", :ip=>"127.0.0.1", :rank=>"5d")
  test_players << Player.new(:name=>"Malcolm", :ip=>"127.0.0.1", :rank=>"5d")
  test_players << Player.new(:name=>"Dolores", :ip=>"127.0.0.1", :rank=>"5d")
  test_players << Player.new(:name=>"Pierre", :ip=>"127.0.0.1", :rank=>"3d")
  test_players << Player.new(:name=>"Paul", :ip=>"127.0.0.2", :rank=>"3d")
  test_players << Player.new(:name=>"Marion", :ip=>"127.0.0.2", :rank=>"3d")
  test_players << Player.new(:name=>"Neal", :ip=>"127.0.0.2",:rank=> "3d")
  test_players << Player.new(:name=>"Eric", :ip=>"127.0.0.2", :rank=>"2d")
  test_players << Player.new(:name=>"Alez", :ip=>"127.0.0.3", :rank=>"2d")
  test_players << Player.new(:name=>"Crystal", :ip=>"127.0.0.3", :rank=>"1d")
  test_players << Player.new(:name=>"Jack", :ip=>"127.0.0.3", :rank=>"1d")
  test_players << Player.new(:name=>"Christina", :ip=>"127.0.0.4", :rank=>"1k")
  test_players << Player.new(:name=>"Louis", :ip=>"127.0.0.4", :rank=>"2k")
  test_players << Player.new(:name=>"Jerome", :ip=>"127.0.0.4", :rank=>"3k")
  test_players << Player.new(:name=>"Simon", :ip=>"127.0.0.4", :rank=>"5k")
  test_players << Player.new(:name=>"Marie", :ip=>"127.0.0.5", :rank=>"8k")
  test_players << Player.new(:name=>"Peter", :ip=>"127.0.0.6", :rank=>"12k")
  test_players << Player.new(:name=>"Julie", :ip=>"127.0.0.7", :rank=>"12k")
  test_players << Player.new(:name=>"El Diablo", :ip=>"127.0.0.8", :rank=>"15k")
  mcmahon_tournament = Organizer.create_tournament("McMahonTournament", {:name=>"McMahonTournament1", :players=>test_players, :rounds_count=>3, :allow_handicap=>false})
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
  test_players << Player.new(:name=>"Pierre", :ip=>"127.0.0.1", :rank=>"6d")
  test_players << Player.new(:name=>"Paul", :ip=>"127.0.0.2", :rank=>"3d")
  test_players << Player.new(:name=>"Jack", :ip=>"127.0.0.3", :rank=>"1d")
  test_players << Player.new(:name=>"Simon", :ip=>"127.0.0.4", :rank=>"5k")
  test_players << Player.new(:name=>"Marie", :ip=>"127.0.0.5", :rank=>"8k")
  test_players << Player.new(:name=>"Peter", :ip=>"127.0.0.6", :rank=>"12k")
  test_players << Player.new(:name=>"Julie", :ip=>"127.0.0.7", :rank=>"12k")
  test_players << Player.new(:name=>"El Diablo", :ip=>"127.0.0.8", :rank=>"15k")
  mcmahon_tournament = Organizer.create_tournament("McMahonTournament", {:name=>"McMahonTournament2", :players=>test_players, :rounds_count=>5, :allow_handicap=>false})
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

test "a fixture from a new tournament shouldnt explode :) " do
  mcmahon = Organizer.create_tournament("McMahonTournament", {:name=>"McMahonTournament3", :players=>spawn_player_list(4), :rounds_count=>5, :allow_handicap=>false})
  mcmahon .start_round
  assert_equal mcmahon.fixture.size, 4
end
