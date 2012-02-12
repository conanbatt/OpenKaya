require File.expand_path("test_helper", File.dirname(__FILE__))

test "Korean Insei League basic run" do
  test_players = []
  
  test_players << PlayerNotAR.new("Pierre", "127.0.0.1", "6d")
  test_players << PlayerNotAR.new("Kristina", "127.0.0.1", "6d")
  test_players << PlayerNotAR.new("Paige", "127.0.0.1", "6d")
  test_players << PlayerNotAR.new("Karen", "127.0.0.1", "6d")
  test_players << PlayerNotAR.new("Hazel", "127.0.0.1", "5d")
  test_players << PlayerNotAR.new("Malcolm", "127.0.0.1", "5d")
  test_players << PlayerNotAR.new("Dolores", "127.0.0.1", "5d")
  test_players << PlayerNotAR.new("Pierre", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Paul", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Marion", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Neal", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Eric", "127.0.0.2", "2d")
  test_players << PlayerNotAR.new("Alez", "127.0.0.3", "2d")
  test_players << PlayerNotAR.new("Crystal", "127.0.0.3", "1d")
  test_players << PlayerNotAR.new("Jack", "127.0.0.3", "1d")
  test_players << PlayerNotAR.new("Christina", "127.0.0.4", "1k")
  test_players << PlayerNotAR.new("Louis", "127.0.0.4", "2k")
  test_players << PlayerNotAR.new("Jerome", "127.0.0.4", "3k")
  test_players << PlayerNotAR.new("Simon", "127.0.0.4", "5k")
  test_players << PlayerNotAR.new("Marie", "127.0.0.5", "8k")
  test_players << PlayerNotAR.new("Peter", "127.0.0.6", "12k")
  test_players << PlayerNotAR.new("Julie", "127.0.0.7", "12k")
  
  korean_insei_league = Organizer.create_league("KoreanInseiLeague", test_players, {})
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
end

test "Korean Insei League: no supergroup allowed" do

  test_players = []
  
  test_players << PlayerNotAR.new("Pierre", "127.0.0.1", "6d")
  test_players << PlayerNotAR.new("Kristina", "127.0.0.1", "4d")
  test_players << PlayerNotAR.new("Paige", "127.0.0.1", "4d")
  test_players << PlayerNotAR.new("Karen", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Hazel", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Malcolm", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Dolores", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Pierre", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Paul", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Marion", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Neal", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Eric", "127.0.0.2", "2d")
  test_players << PlayerNotAR.new("Alez", "127.0.0.3", "2d")
  test_players << PlayerNotAR.new("Crystal", "127.0.0.3", "1d")
  test_players << PlayerNotAR.new("Jack", "127.0.0.3", "1d")
  test_players << PlayerNotAR.new("Christina", "127.0.0.4", "16k")
  test_players << PlayerNotAR.new("Louis", "127.0.0.4", "2k")
  test_players << PlayerNotAR.new("Jerome", "127.0.0.4", "3k")
  test_players << PlayerNotAR.new("Simon", "127.0.0.4", "5k")
  test_players << PlayerNotAR.new("Marie", "127.0.0.5", "8k")
  test_players << PlayerNotAR.new("Peter", "127.0.0.6", "12k")
  test_players << PlayerNotAR.new("Julie", "127.0.0.7", "12k")
  
  korean_insei_league = Organizer.create_league("KoreanInseiLeague", test_players, 
    {
      :max_group_size => 8, #usual value: 12
      :upper_bar => 4, #each period, how many are promoted?
      :lower_bar => 4, #each period, how many are demoted?
      :supergroup_allowed => false,
      :group_names => ["Supergroup", "Group A","Group B","Group C","Group D","Group E1","Group E2","Group E3"]
    })
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.players << PlayerNotAR.new("Randalph", "127.0.0.4", "7k")
  korean_insei_league.players << PlayerNotAR.new("Summer", "127.0.0.5", "1k")
  korean_insei_league.players << PlayerNotAR.new("Sylvia", "127.0.0.7", "1d")
  highest_player = PlayerNotAR.new("Vincent", "127.0.0.6", "7d")
  korean_insei_league.players << highest_player
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.players << PlayerNotAR.new("Ron", "127.0.0.5", "12k")
  korean_insei_league.players << PlayerNotAR.new("Stephen", "127.0.0.6", "14k")
  korean_insei_league.players << PlayerNotAR.new("Steven", "127.0.0.7", "1k")
  lowest_player = PlayerNotAR.new("Carl", "127.0.0.4", "17k")
  korean_insei_league.players << lowest_player
  korean_insei_league.players << PlayerNotAR.new("Rocky", "127.0.0.4", "4k")
  korean_insei_league.players << PlayerNotAR.new("Daniel", "127.0.0.5", "5d")
  korean_insei_league.players << PlayerNotAR.new("Johny", "127.0.0.6", "4d")
  korean_insei_league.players << PlayerNotAR.new("Abhirup", "127.0.0.7", "1d")
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.players << PlayerNotAR.new("Ali", "127.0.0.4", "2k")
  korean_insei_league.players << PlayerNotAR.new("Manon", "127.0.0.5", "2d")
  korean_insei_league.players << PlayerNotAR.new("Cassandre", "127.0.0.6", "4k")
  korean_insei_league.players << PlayerNotAR.new("suzie", "127.0.0.7", "1k")
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  #there should be no supergroup
  assert_equal korean_insei_league.groups.first.name, "Group A"
  #7d should be in Group A
  assert_equal korean_insei_league.groups.first.players.include?(highest_player), true
  #17k should be in last group
  assert_equal korean_insei_league.groups.last.players.include?(lowest_player), true
  #no groups should be smaller than 0.5x of the normal size
  korean_insei_league.groups.each do |g|
     assert (g.name == "Supergroup" && g.players.size >= 0.5*4)||(g.name != "Supergroup" && g.players.size >= 0.5*8)
  end
  #no groups should be bigger than 1.5x of the normal size
  korean_insei_league.groups.each do |g|
     assert (g.name == "Supergroup" && g.players.size < 1.5*4)||(g.name != "Supergroup" && g.players.size < 1.5*8)
  end  
end

test "Korean Insei League: no super group at beginning, then one is created by introducing a new 4d player, then normal league life" do
  test_players = []

  
  test_players << PlayerNotAR.new("Pierre", "127.0.0.1", "4d")
  test_players << PlayerNotAR.new("Kristina", "127.0.0.1", "4d")
  test_players << PlayerNotAR.new("Paige", "127.0.0.1", "4d")
  test_players << PlayerNotAR.new("Karen", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Hazel", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Malcolm", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Dolores", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Pierre", "127.0.0.1", "3d")
  test_players << PlayerNotAR.new("Paul", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Marion", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Neal", "127.0.0.2", "3d")
  test_players << PlayerNotAR.new("Eric", "127.0.0.2", "2d")
  test_players << PlayerNotAR.new("Alez", "127.0.0.3", "2d")
  test_players << PlayerNotAR.new("Crystal", "127.0.0.3", "1d")
  test_players << PlayerNotAR.new("Jack", "127.0.0.3", "1d")
  test_players << PlayerNotAR.new("Christina", "127.0.0.4", "1k")
  test_players << PlayerNotAR.new("Louis", "127.0.0.4", "2k")
  test_players << PlayerNotAR.new("Jerome", "127.0.0.4", "3k")
  test_players << PlayerNotAR.new("Simon", "127.0.0.4", "5k")
  test_players << PlayerNotAR.new("Marie", "127.0.0.5", "8k")
  test_players << PlayerNotAR.new("Peter", "127.0.0.6", "12k")
  test_players << PlayerNotAR.new("Julie", "127.0.0.7", "12k")
  
  korean_insei_league = Organizer.create_league("KoreanInseiLeague", test_players, 
    {
      :max_group_size => 8, #usual value: 12
      :upper_bar => 4, #each period, how many are promoted?
      :lower_bar => 4, #each period, how many are demoted?
      :supergroup_allowed => true,
      :supergroup_size => 4, #usual value: 5 
      :supergroup_min_rank => "4d",#only used when SuperGroup is created
      :supergroup_lower_bar => 1, #each period, how many are demoted from SuperGroup?
      :supergroup_upper_bar => 1, #each period, how many are promoted from A group?
      :group_names => ["Supergroup", "Group A","Group B","Group C","Group D","Group E1","Group E2","Group E3"]
    })
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
 
  korean_insei_league.players << PlayerNotAR.new("Disruptor", "127.0.0.1", "4d")
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.players << PlayerNotAR.new("Randalph", "127.0.0.4", "7k")
  korean_insei_league.players << PlayerNotAR.new("Summer", "127.0.0.5", "1k")
  korean_insei_league.players << PlayerNotAR.new("Sylvia", "127.0.0.7", "1d")
  highest_player = PlayerNotAR.new("Vincent", "127.0.0.6", "7d")
  korean_insei_league.players << highest_player
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.players << PlayerNotAR.new("Ron", "127.0.0.5", "12k")
  korean_insei_league.players << PlayerNotAR.new("Stephen", "127.0.0.6", "14k")
  korean_insei_league.players << PlayerNotAR.new("Steven", "127.0.0.7", "1k")
  lowest_player = PlayerNotAR.new("Carl", "127.0.0.4", "17k")
  korean_insei_league.players << lowest_player
  korean_insei_league.players << PlayerNotAR.new("Rocky", "127.0.0.4", "4k")
  korean_insei_league.players << PlayerNotAR.new("Daniel", "127.0.0.5", "5d")
  korean_insei_league.players << PlayerNotAR.new("Johny", "127.0.0.6", "4d")
  korean_insei_league.players << PlayerNotAR.new("Abhirup", "127.0.0.7", "1d")
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  korean_insei_league.players << PlayerNotAR.new("Ali", "127.0.0.4", "2k")
  korean_insei_league.players << PlayerNotAR.new("Manon", "127.0.0.5", "2d")
  korean_insei_league.players << PlayerNotAR.new("Cassandre", "127.0.0.6", "4k")
  korean_insei_league.players << PlayerNotAR.new("suzie", "127.0.0.7", "1k")
  
  korean_insei_league.start_period
  mock_league_results_based_on_rank(korean_insei_league)
  
  #there should be a supergroup
  assert_equal korean_insei_league.groups.first.name, "Supergroup"
  #7d should be in supergroup
  assert_equal korean_insei_league.groups.first.players.include?(highest_player), true
  #17k should be in last group
  assert_equal korean_insei_league.groups.last.players.include?(lowest_player), true
  #no groups should be smaller than 0.5x of the normal size
  korean_insei_league.groups.each do |g|
     assert (g.name == "Supergroup" && g.players.size >= 0.5*4)||(g.name != "Supergroup" && g.players.size >= 0.5*8)
  end
  #no groups should be bigger than 1.5x of the normal size
  korean_insei_league.groups.each do |g|
     assert (g.name == "Supergroup" && g.players.size < 1.5*4)||(g.name != "Supergroup" && g.players.size < 1.5*8)
  end  
end