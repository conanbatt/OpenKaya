require File.expand_path("../tournament", File.dirname(__FILE__))

class SwissTournament < Tournament

  ########################################################
  
  # Rules of swiss tournament implemented here (loosely based on FIDE definition)
  
  #1.   The number of rounds to be played is declared beforehand. [ENFORCED]
  #2.   Two players may play each other only once. [ENFORCED]
  #3.   Players are paired with others of the same score, or nearest score. [ENFORCED]
  #4.   When possible, a player is given the white pieces as many times as he is given the black pieces. [NOT ENFORCED]
  #5.   When possible, a player is given the colour other than that he was given the previous round. [NOT ENFORCED]
  #6.   The final ranking order is determined by the aggregate of points won: 1 point for a win, 0.5 points for a draw and 0 point for a loss. A player whose opponent fails to appear for a scheduled game receives one point. [ENFORCED]
  #7.   Tie breaking is determined by SOS [ENFORCED]
  
  # TODO
  
  # - No handling of handicap
  # - Implement Time Limits
  # - Handle special external commands (bye, sleep...)
  
  ########################################################
  
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
  
  def podium()
    podium = players.sort! { |x,y| swiss_sorting(y,x) }.take(3)
  end
  
  def fixture       
    res = []
    tournament_players.all.each do |p|
      res << {:seed=>p.seed, :player=> p.player.name, :score => score_by_player(p.player), :rounds => result_by_player(p.player), :sos => sos_by_player(p.player) }
    end
    res        
  end
  
  def to_yaml_tournament
    {:name => self.name, :type => self.type, :id => self.id, :rounds_count => self.rounds_count, :is_finished => finished?}
  end
  
  def sos_by_player(player)
    sos = 0
    rounds.each do |r|
        r.pairings.each do |p|
            if(p.black_player == player)
              sos = sos + score_by_player(p.white_player)
            elsif (p.white_player == player)
              sos = sos + score_by_player(p.black_player)
            end
        end
    end
    return sos
  end
  
  def score_by_player(player)
    score = 0
    rounds.each do |r|
        r.pairings.each do |p|
            if(p.winner == player)
              score = score + 1
            elsif(p.is_playing(player) && p.draw?)
              score = score + 0.5
            end
        end
    end
    return score
  end
  
  def swiss_sorting(player_a, player_b)
    if(score_by_player(player_a) != score_by_player(player_b))
      return score_by_player(player_a) <=> score_by_player(player_b)
    elsif (sos_by_player(player_a) != sos_by_player(player_b))
      return sos_by_player(player_a) <=> sos_by_player(player_b)
    elsif (compare_ranks(player_a.rank, player_b.rank))
      return compare_ranks(player_a.rank, player_b.rank)
    else
      return players.index(player_a) <=> players.index(player_b)
    end
  end
  
  def do_pairings
    pairings = []
    #sort in descending order, using in priority score, then sos, then rank, then order in which the player was added to list
    available_players = players.sort { |x,y| swiss_sorting(y,x) }
    begin
      p1 = available_players.shift
      p2_index = available_players.index { |p| !already_played_together(p1, p) }
      if p2_index.nil?
        p2 = available_players.shift
      else
        p2 = available_players[p2_index]
        available_players.delete_at(p2_index)
      end
      pairings << Pairing.new(propose_color(p1,p2))
    end while available_players.size > 1
    if available_players.length == 1
        p1 = available_players.shift
        pairing = Pairing.new(:white_player=>p1,:black_player=>p1)
        pairing.result = "B+D"
        pairings << pairing
    end
    return pairings
  end
  
  def finished?
    (rounds.size == rounds_count && !rounds.last.nil? && rounds.last.finished?)
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
      puts p.name + " (" + p.rank + ") Score: " + score_by_player(p).to_s + " SOS: "+ sos_by_player(p).to_s
    end
  end
  
end

