require File.expand_path("../tournament", File.dirname(__FILE__))

class SingleEliminationTeam < Tournament

  ########################################################
   
  # Single Elimination in Teams constraints/rules
  #- P0 only live team (never lost) - tournament finishes when only one team remains
  #- P1 team shouldn't play each other again unless there is no choice
  #- P2 top team (by score) should play together if possible
  #- P3 odd number of team the last one to be picked gets a win by default
  #- P4 one team smaller than another? the biggest team get wins by default for each missing partner
  #- P5 only odd team size are allowed
  #- P6 colors alternate within a round/team pairing
    
  # TODO
  
  # - Handle handicap tournaments
  # - Implement Time Limits
  # - Handle special external commands (bye, sleep...)
  
  ########################################################
  
  def generate_pairings(team_a, team_b)
    pairings = []
    if(team_b[:players].size > team_a[:players].size)
      swap_temp = team_a
      team_a = team_b
      team_b = swap_temp
    end
    play_black = nil
    team_a[:players].each do |player|
      unless(team_b[:players].empty?)
        opponent = team_b[:players].pop
        if(play_black.nil?)
          play_black = (propose_color(player, opponent)[:black_player] == player)
        end
        if(play_black)
          pairing = Pairing.new({:white_player => opponent, :black_player => player})
          play_black = false
        else
          pairing = Pairing.new({:white_player => player, :black_player => opponent})
          play_black = true
        end
        pairings << pairing
      else
         pairing = Pairing.new({:white_player => player, :black_player =>player})
         pairing.result = "B+D"
         pairing.save
         pairings << pairing
      end
    end
    return pairings
  end
  
  def team_won_round?(round, team)
    win = 0
    lose = 0
    round.pairings.each do |p|
        if(team[:players].include?(p.white_player) || team[:players].include?(p.black_player))
          unless(p.winner.nil?)
            if(p.winner and team[:players].include?(p.winner))
              win += 1
            else
              lose += 1
            end
          end
        end
    end
    return (lose == 0 || win > lose)
  end
  
  def score_by_team(team)
    score = 0
    rounds.each do |r|
      if(team_won_round?(r, team))
        score = score + 1
      end
    end
    return score  
  end
  
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
    available_teams = live_teams.sort { |x,y| score_by_team(x) <=> score_by_team(y) }
    begin
      t1 = available_teams.pop
      t2_index = available_teams.index { |t| not already_played_together_team(t1, t) }
      t2 = nil
      unless t2_index.nil?
            t2 = available_teams[t2_index]
            available_teams.delete_at(t2_index)
      else
            t2 = available_teams.pop
      end
      pairings += generate_pairings(t1,t2)
    end while available_teams.size > 1
    if available_teams.length == 1
        t1 = available_teams.pop
        t1[:players].each do |p|
          pairing = Pairing.new({:white_player => p, :black_player =>p})
          pairing.result = "B+D"
          pairing.save
          pairings << pairing
        end
    end
    return pairings
  end
  
  def finished?
    (live_teams.size == 1)
  end
  
  def live_teams
    #first round, all teams are live
    unless rounds.last
        return teams
    end
    #live teams are all teams which never lost
    live_teams = []
    teams.each do |team|
      never_lost = true
      rounds.each { |r| never_lost = false unless team_won_round?(r, team) }
      live_teams << team if never_lost
    end
    return live_teams
  end

  def fixture
    res = []
    teams.each do |t|
      res_players = []
      t[:players].each do |p|
        res_players << {:name => p.name, :rank => p.rank, :score => score_by_player(p)}
      end
      res << {:id => t[:id], :score => score_by_team(t), :players => res_players}
    end
    res         
  end
end

