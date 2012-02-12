require File.expand_path("../tournament", File.dirname(__FILE__))

class RoundRobinTournament < Tournament

  ########################################################
   
  # Round Robin constraints/rules
  #- use berger tables for pairing
  #- everyone will play everyone else one time and only one time
  #- odd number of players the last one to be picked gets a win by default, never the same twice in the same tournament
  #- add a bit of randomness so that the order of entry of the player has no influence
    
  # TODO
  
  # - Handle handicap tournaments
  # - Implement Time Limits
  # - Handle special external commands (bye, sleep...)
  
  ########################################################
  
  def score_by_player(player)
    score = 0
    rounds.each do |r|
        r.pairings.each do |p|
            if(p.winner == player || (p.is_playing(player) && p.draw?))
                score=score+1
            end
        end
    end
    return score
  end
  
  def number_of_games(player)
    count = 0
    rounds.each do |r|
        r.pairings.each do |p|
            if(p.is_playing(player) && !p.default? && !p.void?)
                count=count+1
            end
        end
    end
    return count    
  end
  
  def do_pairings
    pairings = []
    
    #http://fr.wikipedia.org/wiki/Table_de_Berger
    
    (players.size%2 == 0) ?  n = players.size : n = players.size + 1 #number of players, adding one when odd
    r = rounds.size+1 #current round
    
    for i in 1..n
      for j in 1..n
          if (i != n and j != n) and (( i+j-1 < n and r == i+j-1 ) or ( i+j-1 >= n and r == i+j-n ))
            p1 = players[i-1]
            p2 = players[j-1]
            if (i+j % 2 == 0 and i < j)
              pairings << Pairing.new(:white_player=>p1,:black_player=>p2)
            elsif (i+j % 2 != 0 and i > j)
              pairings << Pairing.new(:white_player=>p2,:black_player=>p1)
            end
          elsif (j == n) and ((r == 2*i-1 and 2*i <= n) or (r == 2*i-n and 2*i > n))
            if (n == players.size + 1)
              p1 = players[i-1]
              pairing = Pairing.new(:white_player=>p1,:black_player=>p1)
              pairing.result = "B+D"
              pairings << pairing
            else
              p1 = players[i-1]
              p2 = players[j-1] 
              if (r == 2*i-1 and 2*i <= n)
                pairings << Pairing.new(:white_player=>p1,:black_player=>p2)
              else (r == 2*i-n and 2*i > n)
                pairings << Pairing.new(:white_player=>p2,:black_player=>p1)
              end
            end
          end
      end
    end
    
    return pairings
  end
  
  def finished?
    players.each do |player_a|
      players.each do |player_b|
        if player_a != player_b && !already_played_together(player_a, player_b)
          #puts player_a.name + " didn't play vs " + player_b.name
          return false
        end
      end
    end
    return true
  end
  
  def output
    round_index = 0
    rounds.each do |r|
      round_index = round_index + 1
      puts "Round " + round_index.to_s
      r.pairings.each do |p|
        puts p.to_s
      end      
    end
    puts "Results:"
    players.each do |p|
      puts p.name + " (" + p.rank + ") Score: " + score_by_player(p).to_s
    end
  end
 
end

