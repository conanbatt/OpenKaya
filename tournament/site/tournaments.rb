require "cuba"
require 'active_record'
require File.expand_path("../organizer", File.dirname(__FILE__))
require File.expand_path("players", File.dirname(__FILE__))

Cuba.use Rack::Session::Cookie

Cuba.define do

  on "players" do
    run PLAYERS_API
  end 

  on get do
    on "home" do
      res.write render("views/home.html.erb")
    end
    on "list" do
      @tournaments = Tournament.all
      res.write render("views/list_tournaments.html.erb")
    end
    on "create" do
      res.write render("views/create_tournament.html.erb")
    end
    on "tournaments" do
      on ":id" do |id|
        @players = Player.all
        @tournament = Tournament.find(id)
        res.write render("views/tournament.html.erb")
      end
    end
     on "delete/:id" do |id|
      @tournament = Tournament.destroy(id)
      res.redirect "/list"
    end
    on "delete_player/:player_id/:tournament_id" do |player_id, tournament_id|
      @player = Player.find(player_id)
      @tournament = Tournament.find(tournament_id)
      @tournament.remove_player(@player)
      @tournament.save
      res.redirect "/tournaments/" + tournament_id.to_s
    end
    on "start_round/:id" do |id|
      @tournament = Tournament.find(id)
      @tournament.start_round
      @tournament.save
      res.redirect "/tournaments/" + id.to_s
    end
    on "add_result/:pairing_id/:result/:tournament_id" do |pairing_id, result, tournament_id|
      @pairing = Pairing.find(pairing_id)
      @pairing.result = result
      @pairing.save
      res.redirect "/tournaments/" + tournament_id.to_s
    end
    on default do
      res.redirect "/home"
    end
    
  end

  on post do
    on "create_tournament" do
      on param("system"), param("name") do |system,name|
        @tournament = Organizer.create_tournament(system, {:name => name, :players=> []})
        @tournament.save
        res.redirect "/tournaments/" + @tournament.id.to_s
      end
    end
    on "add_player" do
      on param("player_id"),param("tournament_id"), param("team_id") do |player_id, tournament_id,team_id|
        @player = Player.find(player_id)
        @tournament = Tournament.find(tournament_id)
        @tournament.add_player(@player, nil, team_id.to_i)
        @tournament.save
        res.redirect "/tournaments/" + tournament_id.to_s
      end
      on param("player_id"),param("tournament_id") do |player_id, tournament_id|
        @player = Player.find(player_id)
        @tournament = Tournament.find(tournament_id)
        @tournament.add_player(@player)
        @tournament.save
        res.redirect "/tournaments/" + tournament_id.to_s
      end
    end
  end
end
