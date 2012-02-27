require File.expand_path("test_helper", File.dirname(__FILE__))

test "4 teams of 3 players" do
  single_elim_team = Organizer.create_tournament("SingleEliminationTeam", {:name => "SingleElimTeamTest1"})
  single_elim_team.add_players(spawn_player_list(3), true, 0)
  single_elim_team.add_players(spawn_player_list(3), true, 1)
  single_elim_team.add_players(spawn_player_list(3), true, 2)
  single_elim_team.add_players(spawn_player_list(3), true, 3)
  single_elim_team.start_round
  assert_equal single_elim_team.teams.size, 4
  assert_equal single_elim_team.live_teams.size, 4
  assert_equal single_elim_team.players.size, 12
  mock_results(single_elim_team)
  assert_equal single_elim_team.live_teams.size,2
  single_elim_team.start_round
  mock_results(single_elim_team)
  assert_equal single_elim_team.finished?,true 
end

test "5 teams of 3 players" do
  single_elim_team = Organizer.create_tournament("SingleEliminationTeam", {:name => "SingleElimTeamTest2"})
  single_elim_team.add_players(spawn_player_list(3), true, 0)
  single_elim_team.add_players(spawn_player_list(3), true, 1)
  single_elim_team.add_players(spawn_player_list(3), true, 2)
  single_elim_team.add_players(spawn_player_list(3), true, 3)
  single_elim_team.add_players(spawn_player_list(3), true, 4)
  single_elim_team.start_round
  mock_results(single_elim_team)
  assert_equal single_elim_team.live_teams.size,3
  single_elim_team.start_round
  mock_results(single_elim_team)
  assert_equal single_elim_team.live_teams.size,2
  single_elim_team.start_round
  mock_results(single_elim_team)
  assert_equal single_elim_team.finished?,true 
end

test "4 teams of 3 players and a 5th team of 4 players" do
  single_elim_team = Organizer.create_tournament("SingleEliminationTeam", {:name => "SingleElimTeamTest3"})
  single_elim_team.add_players(spawn_player_list(3), true, 0)
  single_elim_team.add_players(spawn_player_list(3), true, 1)
  single_elim_team.add_players(spawn_player_list(3), true, 2)
  single_elim_team.add_players(spawn_player_list(3), true, 3)
  single_elim_team.add_players(spawn_player_list(4), true, 4)
  single_elim_team.start_round
  mock_results(single_elim_team)
  assert_equal single_elim_team.live_teams.size,3
  single_elim_team.start_round
  mock_results(single_elim_team)
  assert_equal single_elim_team.live_teams.size,2
  single_elim_team.start_round
  mock_results(single_elim_team)
  assert_equal single_elim_team.finished?,true 
end

test "a fixture from a new tournament shouldnt explode :) " do
  single_elim_team = Organizer.create_tournament("SingleEliminationTeam", {:name => "SingleElimTeamTest3"})
  single_elim_team.add_players(spawn_player_list(3), true, 0)
  single_elim_team.add_players(spawn_player_list(3), true, 1)
  single_elim_team.add_players(spawn_player_list(3), true, 2)
  single_elim_team.add_players(spawn_player_list(3), true, 3)
  single_elim_team.add_players(spawn_player_list(4), true, 4)
  assert_equal single_elim_team.fixture.size, 5
end
