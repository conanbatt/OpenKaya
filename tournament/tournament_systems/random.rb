#not real system, just for mock.

require File.expand_path("../tournament", File.dirname(__FILE__))

class RandomTournament < Tournament
  def do_pairings
    pairings = []
    matching_players = players.all.dup
    index = 0
    (matching_players.length/2).times do 
      p1 = matching_players.pop
      p2 = matching_players.delete_at rand(matching_players.length)
      pairings << Pairing.new(propose_color(p1,p2))
    end
    return pairings
  end
  
  def finished?
    true
  end
end
