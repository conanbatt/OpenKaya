require 'cutest'
require File.expand_path("../organizer", File.dirname(__FILE__))
Dir[File.dirname(__FILE__) + "/tournament_systems/*.rb"].each {|file| require file }


def spawn_player_list(number)
  list =[]
  number.times {|n| list << Player.new(rand(8**4).to_s, list.size, "1k")}
  list

end

def mock_results(tournament)
  tournament.pairings.each do |pairing|
    tournament.add_result(pairing.white_player, pairing.black_player, "W+R")
  end
end

