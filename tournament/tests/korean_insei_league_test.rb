require File.expand_path("test_helper", File.dirname(__FILE__))

test "Korean Insei League basic run" do
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
  
  korean_insei_league = Organizer.create_league("KoreanInseiLeague", test_players)
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
end

test "Korean Insei League: no super group at beginning, then one is created by introducing a new 4d player" do
  test_players = []
  
  test_players << Player.new("Pierre", "127.0.0.1", "4d")
  test_players << Player.new("Kristina", "127.0.0.1", "4d")
  test_players << Player.new("Paige", "127.0.0.1", "4d")
  test_players << Player.new("Karen", "127.0.0.1", "3d")
  test_players << Player.new("Hazel", "127.0.0.1", "3d")
  test_players << Player.new("Malcolm", "127.0.0.1", "3d")
  test_players << Player.new("Dolores", "127.0.0.1", "3d")
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
  
  korean_insei_league = Organizer.create_league("KoreanInseiLeague", test_players)
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.output
  
  korean_insei_league.players << Player.new("Disruptor", "127.0.0.1", "4d")
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.output
end