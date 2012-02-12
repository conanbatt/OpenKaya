require File.expand_path("test_helper", File.dirname(__FILE__))

test "Should create a tournament object" do
  random_tournament = Organizer.create_tournament("RandomTournament",{:name=>"BaseTournamentTest0", :players=>[]})
  assert_equal random_tournament.class, RandomTournament
end

test "Should do a pairing" do
  players = [Player.new(:name=>"Carlos",:ip=>"0",:rank=>"1d"), Player.new(:name=>"Pepe",:ip=>"1",:rank=>"2d")]
  random_tournament = Organizer.create_tournament("RandomTournament",{:name=>"BaseTournamentTest1", :players=>players})
  pairings = random_tournament.do_pairings
  assert pairings.first.white_player == players[0] || pairings.first.white_player== players[1]
  assert pairings.first.black_player == players[0] || pairings.first.black_player == players[1]
end

test "should be able to add results, and not start another round until the first is over" do
  players = spawn_player_list(4)
  random_tournament = Organizer.create_tournament("RandomTournament", {:name=>"BaseTournamentTest2", :players=>players})
  assert random_tournament.start_round
  assert_raise(RuntimeError) do
    random_tournament.start_round
  end
  pairings = random_tournament.pairings
  random_tournament.add_result(pairings.first.white_player, pairings.first.black_player, "W+R")
  assert_raise(RuntimeError) do
    random_tournament.start_round
  end
  random_tournament.add_result(pairings[1].white_player, pairings[1].black_player,"B+R")
  assert random_tournament.start_round
end

test "should get results by player " do
  players = spawn_player_list(4)
  random_tournament = Organizer.create_tournament("RandomTournament", {:name=>"BaseTournamentTest3", :players=>players})
  random_tournament.start_round
  mock_results(random_tournament)
  assert_equal random_tournament.result_by_player(players.first).size,1
  random_tournament.start_round
  mock_results(random_tournament)
  assert_equal random_tournament.result_by_player(players.first).size,2
end

test "should give a fixture of the tournament" do
  players = spawn_player_list(4)
  random_tournament = Organizer.create_tournament("RandomTournament", {:name=>"BaseTournamentTest4", :players=>players})
  random_tournament.start_round
  mock_results(random_tournament)
  random_tournament.start_round
  mock_results(random_tournament)
  random_tournament.start_round
  mock_results(random_tournament)
  assert_equal random_tournament.fixture.length, 4
end

