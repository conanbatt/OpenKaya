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

# ==  0 if same rank
# ==  1 if a rank is better than b rank
# == -1 if b rank is better than a rank
def compare_ranks(rank_a, rank_b)
   
    if rank_a == rank_b
        return 0
    end
    
    if rank_a[-1,1] == "k" and rank_b[-1,1] == "d"
        return -1
    end
    
    if rank_b[-1,1] == "k" and rank_a[-1,1] == "d"
        return 1
    end
    
    if rank_a[-1,1] == "k" 
        return (rank_a[0, rank_a.length-1].to_i < rank_b[0, rank_b.length-1].to_i) ? 1 : -1
    end
    
    if rank_a[-1,1] == "d"
        return (rank_a[0, rank_a.length-1].to_i > rank_b[0, rank_b.length-1].to_i) ? 1 : -1
    end
end

def mock_results_based_on_rank(tournament)
  tournament.pairings.each do |pairing|
    #already got a result through another mean? don't change it!
    if pairing.result.nil?
        if compare_ranks(pairing.white_player.rank, pairing.black_player.rank) > 0
            tournament.add_result(pairing.white_player, pairing.black_player, "W+R")
        else
            tournament.add_result(pairing.white_player, pairing.black_player, "B+R")
        end
    end
  end
end
