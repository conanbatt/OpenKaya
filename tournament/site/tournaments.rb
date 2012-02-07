require "cuba"

require File.expand_path("../organizer", File.dirname(__FILE__))

Cuba.use Rack::Session::Cookie

Cuba.define do
  on get do
    on "home" do
      res.write render("views/home.html.erb")
    end
    on "create" do
      res.write render("views/create_tournament.html.erb")
    end
    on "tournaments" do
      on ":id" do |id|
        @tournament = mock_single_elim 
        res.write render("views/tournament.html.erb")
      end
    end
    on "javascripts" do
      run Rack::File.new("javascripts")
    end

    on default do
      res.redirect "/home"
    end
  end

  on post do

    on "create" do
      on param("system"), param("participants") do |system,participants|
        single_elim = Organizer.create_tournament(system.gsub(" ",""), create_player_list(participants.values))
        single_elim.start_round
        res.write single_elim.pairings
      end
    end

  end

end

def create_player_list(players)
  result = []
  players.each do |p|
    result << Player.new(p["name"],result.count,p["rank"])
  end
  result
end

def mock_single_elim
  players = [{"name"=> "a","rank"=> "1k"},
             {"name"=> "b","rank"=> "1d"},
             {"name"=> "c","rank"=> "2d"},
             {"name"=> "d","rank"=> "2k"}
  ] 
  single_elim = Organizer.create_tournament("SingleElimination",create_player_list(players))
  single_elim.start_round
  single_elim
end
