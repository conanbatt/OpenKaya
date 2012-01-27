require File.expand_path("../tournament", File.dirname(__FILE__))

class DoubleElimination < Tournament

  def score_by_player(player)
    score = 0
    
    @rounds.each do |r|
        r.pairings.each do |p|
            if(p.winner == player || p.draw?)
                score=score+1
            end
        end
    end
    
    return score
  end
  
  def do_pairings
    pairings = []
    
    #constraints/rules (P = Priority)
    #- P0 only live players
    #- P1 players shouldn't play each other again unless there is no choice
    #- P2 top players (by score) should play together if possible
    #- P3 odd number of players the last one to be picked gets a win by default
    #- P4 add a bit of randomness so that the order of entry of the player has no influence
    
    #Todo
    #- Handle handicap tournamenents
    #- Implement time limits
    
    available_players = live_players.shuffle.sort { |x,y| score_by_player(x) <=> score_by_player(y) }
    
    begin
      p1 = available_players.pop
      p2_index = available_players.index { |p| not already_played_together(p1, p) }
      p2 = nil
      
      unless p2_index.nil?
            p2 = available_players[p2_index]
            available_players.delete_at(p2_index)
      else
            p2 = available_players.pop
      end
      pairings << Pairing.new(p1,p2)
    end while available_players.size > 1
   
    #No handicap tournament? Do Nigiri
    pairings.each do |p|
        p.do_nigiri!
    end
    
    if available_players.length == 1
        p1 = available_players.pop
        pairing = Pairing.new(p1, p1)
        pairing.result = "B+D"
        pairings << pairing
    end

    return pairings
  end
  
  
  def count_loss(player)
    count = 0
    
    @rounds.each do |r|
        r.pairings.each do |p|
            if((p.black_player == player || p.white_player == player) && p.winner != player && !p.draw?)
                count=count+1
            end
        end
    end
    
    return count
  end
  
  def finished?
    (live_players.size == 1)
  end
  
  def live_players
  
    #first round or secound round, all players are live
    if @rounds.size < 2
        return @players
    end
    
    #live players are all players from previous round minus those who lost twice
    live_players = []
    @players.each do |p|
        live_players << p if (count_loss(p) < 2)
    end
    
    return live_players
  end

end

