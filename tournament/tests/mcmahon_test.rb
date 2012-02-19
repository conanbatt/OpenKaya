require File.expand_path("test_helper", File.dirname(__FILE__))

test "McMahon Base functions" do
  test_players = []
  test_players << Player.new(:name=>"Pierre", :rank=>"6d")
  test_players << Player.new(:name=>"Kristina",  :rank=>"6d")
  test_players << Player.new(:name=>"Paige", :rank=>"6d")
  test_players << Player.new(:name=>"Karen",  :rank=>"6d")
  test_players << Player.new(:name=>"Hazel",  :rank=>"5d")
  test_players << Player.new(:name=>"Malcolm",  :rank=>"5d")
  test_players << Player.new(:name=>"Dolores",  :rank=>"5d")
  test_players << Player.new(:name=>"Pierre",  :rank=>"3d")
  test_players << Player.new(:name=>"Paul",  :rank=>"3d")
  test_players << Player.new(:name=>"Marion",  :rank=>"3d")
  test_players << Player.new(:name=>"Neal", :rank=> "3d")
  test_players << Player.new(:name=>"Eric",  :rank=>"2d")
  test_players << Player.new(:name=>"Alez",  :rank=>"2d")
  test_players << Player.new(:name=>"Crystal",  :rank=>"1d")
  test_players << Player.new(:name=>"Jack",  :rank=>"1d")
  test_players << Player.new(:name=>"Christina",:rank=>"1k")
  test_players << Player.new(:name=>"Louis", :rank=>"2k")
  test_players << Player.new(:name=>"Jerome",  :rank=>"3k")
  test_players << Player.new(:name=>"Simon",  :rank=>"5k")
  test_players << Player.new(:name=>"Marie",  :rank=>"8k")
  test_players << Player.new(:name=>"Peter",  :rank=>"12k")
  test_players << Player.new(:name=>"Julie",  :rank=>"12k")
  test_players << Player.new(:name=>"El Diablo",  :rank=>"15k")
  mcmahon_tournament = Organizer.create_tournament("McMahonTournament", {:name=>"McMahonTournament1", :rounds_count=>3, :allow_handicap=>false})
  mcmahon_tournament.add_players(test_players)
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
  test_players << Player.new(:name=>"Pierre",:rank=>"6d")
  test_players << Player.new(:name=>"Paul",  :rank=>"3d")
  test_players << Player.new(:name=>"Jack",  :rank=>"1d")
  test_players << Player.new(:name=>"Simon", :rank=>"5k")
  test_players << Player.new(:name=>"Marie", :rank=>"8k")
  test_players << Player.new(:name=>"Peter", :rank=>"12k")
  test_players << Player.new(:name=>"Julie", :rank=>"12k")
  test_players << Player.new(:name=>"El Diablo",:rank=>"15k")
  mcmahon_tournament = Organizer.create_tournament("McMahonTournament", {:name=>"McMahonTournament2", :rounds_count=>5, :allow_handicap=>false})
  mcmahon_tournament.add_players(test_players)
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

test "fixture test" do
  mcmahon = Organizer.create_tournament("McMahonTournament", {:name=>"McMahonTournament3", :rounds_count=>5, :allow_handicap=>false})
  mcmahon.add_players(spawn_player_list(4))
  mcmahon.start_round
  assert_equal mcmahon.fixture.size, 4
  assert_equal mcmahon.fixture[0].has_key?(:sos), true
  assert_equal mcmahon.fixture[0][:sos], 19 # 1k = 19  base mcmahon score 
  mock_results_based_on_rank(mcmahon)
  assert_equal mcmahon.fixture[0][:sos]+mcmahon.fixture[0][:score], 39 # 19 bms + 19 bms + 1 win
  assert_equal mcmahon.fixture[1][:sos]+mcmahon.fixture[1][:score], 39
  assert_equal mcmahon.fixture[2][:sos]+mcmahon.fixture[2][:score], 39
  assert_equal mcmahon.fixture[3][:sos]+mcmahon.fixture[3][:score], 39
end

test "import export" do
  mcmahon = Organizer.create_tournament("McMahonTournament", {:name=>"McMahonTournament3", :rounds_count=>5, :allow_handicap=>false})
  mcmahon.add_players(spawn_player_list(4))
  mcmahon.start_round
  yaml = mcmahon.to_yaml
  tournament = Tournament.from_yaml(yaml)
  assert_equal tournament.name, "McMahonTournament3"
end
