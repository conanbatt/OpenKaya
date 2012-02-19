require File.expand_path("../tournament", File.dirname(__FILE__))

class McMahonTournament < Tournament

  ########################################################
  
  # Rules of mcmahon tournament loosely based on http://www.britgo.org/organisers/mcmahonpairing.html
  
  #1.   using BGA standards for McMahon Bar
  #2.   use of zero-20kyu McMahon scale
  
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
    {:name => self.name, :type => self.type, :id => self.id, :rounds_count => self.rounds_count, :allow_handicap => self.allow_handicap, :is_finished => finished?}
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
    score = mcmahon_initial_score(player.rank)
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
  
  def mcmahon_bar_bga_style()
    #loosely based on the official table which only contains range
    return rounds_count*2+1
  end
  
  def mcmahon_initial_score(rank)
    if compare_ranks(rank,mcmahon_bar) > 0
        return rank_to_scale_value(mcmahon_bar)
    else
        return rank_to_scale_value(rank)
    end
  end
  
  def players_above_bar(rank)
    players_above = []
    players.each do |player|
        players_above << player unless (compare_ranks(player.rank,rank) < 1)
    end
    return players_above
  end
  
  def rank_to_scale_value(rank)

    if rank[-1,1] == "k"
        return (rank[0, rank.length-1].to_i > 20) ? 0 : 20-rank[0, rank.length-1].to_i
    end
    if rank[-1,1] == "d"
        return 20 + rank[0, rank.length-1].to_i - 1
    end
    return 0
  end
  
  def mcmahon_bar
    if players.nil?
        raise "No players have been registered yet, can't calculate McMahon Bar"
    end
    index = 0
    begin
        bar = players.sort{ |x,y| compare_ranks(y.rank,x.rank) }[index].rank
        index = index + 1
        #puts index.to_s + " " + players_above_bar(bar).size.to_s + " - " + mcmahon_bar_bga_style().to_s
    end while (players_above_bar(bar).size < mcmahon_bar_bga_style && index < players.size)
    return bar
  end
  
  def mcmahon_sorting(player_a, player_b)
  
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
    #sort in descending order, using in priority mcmahon score, then sos, then rank, then order in which the player was added to list
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
    (rounds.size == rounds_count && rounds.last.finished?)
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

