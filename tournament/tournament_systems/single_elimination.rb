require File.expand_path("../tournament", File.dirname(__FILE__))

class SingleElimination < Tournament

  ########################################################
   
  # Single Elimination constraints/rules
  #- P0 only live players (never lost) - tournament finishes when only one player remains
  #- P1 players shouldn't play each other again unless there is no choice
  #- P2 top players (by score) should play together if possible
  #- P3 odd number of players the last one to be picked gets a win by default
    
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
  
  def do_pairings
    pairings = []
    available_players = live_players.sort { |x,y| score_by_player(x) <=> score_by_player(y) }
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
      pairings << Pairing.new(propose_color(p1,p2))
    end while available_players.size > 1
    if available_players.length == 1
        p1 = available_players.pop
        pairing = Pairing.new({:white_player => p1, :black_player =>p1})
        pairing.result = "B+D"
        pairing.save
        pairings << pairing
    end
    return pairings
  end
  
  def finished?
    (players.size < 2) || (live_players.size == 1)
  end
  
  def live_players
    #first round, all players are live
    if rounds.empty? || rounds.last.pairings.empty? 
        return players.all
    end
    #live players are all players from previous round minus those who lost
    live_players = []
    rounds.last.pairings.each do |p|
        if p.winner.nil?
            live_players << p.black_player
            live_players << p.white_player
        else
            live_players << p.winner
        end
    end
    return live_players
  end

end

