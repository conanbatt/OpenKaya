class Tournament < ActiveRecord::Base
  #TODO: fix cache issue
  
  has_many :players, :through => :tournament_players #read-only!
  has_many :tournament_players
  has_many :rounds
  
  def finished?
    raise "to be implemented by children"
  end
  
  def podium
    podium = players.all.sort! { |x,y| score_by_player(y) <=> score_by_player(x) }.take(3)
  end
  
  def pairings
    rounds.last.pairings.all
  end

  def do_pairings
    raise "to be implemented by children"
  end
  
  def already_played_together_team(a_team, another_team)
    rounds.each do |r|
      r.pairings.each do |p|
        if((a_team[:players].include?(p.black_player) and another_team[:players].include?(p.white_player)) or (another_team[:players].include?(p.black_player) and a_team[:players].include?(p.white_player)))
          return true
        end
      end
    end
    return false
  end
  
  def already_played_together(a_player, another_player)
    rounds.each do |r|
        r.pairings.each do |p|
            if (p.black_player == a_player && p.white_player == another_player) || 
               (p.white_player == a_player && p.black_player == another_player)
                return true
            end
        end
    end
    return false
  end
  
  #standard information, but can be overriden with extra columns/info by children. i.e. add SOS for swiss.
  def fixture
    res = []
    tournament_players.all.each do |p|
      res << {:seed=>p.seed, :team=>p.team, :player=> p.player.name, :score => score(result_by_player(p.player),p.player), :rounds => result_by_player(p.player)}
    end
    res         
  end

  def start_round
    ############################
    #SQLite Adapter Cache issue?
    rounds.length
    ############################
    raise "Not all games were played in the previous round." unless rounds.empty? || rounds.last.finished?
    rounds.last.end_time = Time.now unless rounds.empty?
    rounds.last.save unless rounds.empty?
    rounds << Round.new({:pairings => do_pairings})
    rounds.last.start_time = Time.now
    rounds.last.save
  end

  def get_team_by_player(player)
    tournament_players.each do |tp|
      if tp.player == player
        return tp.team
      end
    end
    return nil
  end
  
  def teams
    teams = []
    tournament_players.each do |tp|
      found = false
      teams.each do |team|
          if team[:id] == tp.team 
            found = true
            team[:players] << tp.player
            team[:seed] =  team[:seed] + tp.seed unless (tp.seed.nil? or team[:seed].nil?)
          end
      end
      unless found
        teams << {:id => tp.team, :players => [tp.player], :seed => tp.seed }
      end
    end
    teams
  end
  
  def add_players(players, auto_seed=true, team=nil)
    seed = TournamentPlayer.maximum(:seed, :conditions =>  [ "tournament_id = ?", self.id ])
    if seed.nil?
      seed = 0
    end
    players.each do |p|
      tournament_player = TournamentPlayer.new({:player => p, :seed=>(auto_seed ? seed : nil), :team=>team})
      tournament_players << tournament_player
      seed += 1
    end
  end
  
  def add_player(player, seed=nil, team=nil)
    tournament_player = TournamentPlayer.new({:player => player, :seed=>seed, :team=>team})
    tournament_players << tournament_player
  end
  
  def remove_player(player)
    tournament_players.each do |tp|
      if(tp.player == player)
        TournamentPlayer.delete(tp)
      end
    end
  end
  
  def add_result(p1,p2, result)
    raise "The tournament has not yet started" if rounds.empty?
    rounds.last.add_result(p1,p2,result)
  end

  def result_by_player(player)
    res = []
    rounds.each do |r|
      r.pairings.each do |p|
        if p.white_player == player || p.black_player == player
          res << p
        end
      end
    end
    return res
  end
  
  def score(results, player)
    points = 0
    results.each {|res| points +=1 if (res.winner == player) }
    points
  end
  
  def propose_color(player_a, player_b)
    proposal = {:black_player => nil, :white_player => nil}
    player_a_colors = []
    player_b_colors = []
    player_a_count_w = 0
    player_b_count_w = 0
    rounds.each do |r|
      r.pairings.each do |p|
        if p.white_player == player_a
          player_a_colors << "W"
          player_a_count_w += 1
        end
        if p.white_player == player_a
          player_b_colors << "W"
          player_b_count_w += 1
        end
        if p.black_player == player_a
          player_a_colors << "B"
        end
        if p.black_player == player_a
          player_b_colors << "B"
        end
      end
    end
    #best case, inverse color from previous round
    if(player_a_colors.last != player_b_colors.last)
      if(player_a_colors.last == "W")
        proposal[:black_player] = player_a
        proposal[:white_player] = player_b
      else
        proposal[:black_player] = player_b
        proposal[:white_player] = player_a
      end
      return proposal
    end
    #next, count how many times each played W, the one with the least amount gets white
    if(player_a_count_w > player_b_count_w)
      proposal[:black_player] = player_a
      proposal[:white_player] = player_b
      return proposal
    end
    if(player_a_count_w < player_b_count_w)
      proposal[:black_player] = player_b
      proposal[:white_player] = player_a
      return proposal
    end
    #worst case, can't decide => normal nigiri
    if Random.rand(100) >= 50
      proposal[:black_player] = player_a
      proposal[:white_player] = player_b
    else
      proposal[:black_player] = player_b
      proposal[:white_player] = player_a
    end
    return proposal
  end
end

class TournamentPlayer  < ActiveRecord::Base
  belongs_to :player
  belongs_to :tournament
end

#Rounds dont know of previous rounds or future ones, they just take a pairing and do some basic operations
class Round < ActiveRecord::Base

  belongs_to :tournament
  has_many :pairings
  
  def add_result(p1,p2, result)
    pairing = find_match_by_names(p1,p2)
    pairing.result = result
    pairing.save
  end

  def finished?
    pairings.each {|p| return false unless p.result}
    return true
  end

  def result_by_player(player)
    pairings.each do |p|  
      if (p.white_player == player)
        return (p.result[0] == "W" ? "+#{p.black_player.ip}": "-#{p.black_player.ip}")
      elsif(p.black_player == player)
        return (p.result[0] == "B" ? "+#{p.white_player.ip}": "-#{p.white_player.ip}")
      end
    end
  end

private

  def find_match_by_names(p1,p2)
    pairings.each do |pairing|
      return pairing if (pairing.white_player == p1 && 
                        pairing.black_player == p2)
    end
  end
end

#Stores players and result
class Pairing < ActiveRecord::Base

  belongs_to :round
  belongs_to :white_player, :class_name => "Player", :foreign_key => "white_player_id"
  belongs_to :black_player, :class_name => "Player", :foreign_key => "black_player_id"
  
  def default?
    result == "B+D" or result == "W+D" 
  end
  
  def void?
    result == "Void"
  end
  
  def is_playing(player)
    return (black_player == player || white_player==player)
  end
  
  def draw?
    (result == "Draw" || result == "Jigo")
  end
  
  def winner
      ((result.nil? || draw? || void?) ? nil :(result[0] == "W") ? white_player : black_player )
  end
  
  def to_s
      "(Black) " + black_player.name + "[" +black_player.rank + "] vs (White)" + white_player.name + "[" +white_player.rank + "] : " + ((result.nil?) ? "undecided" : result)
  end
  
  def change_players!(players_hash)
    black_player = players_hash[:black_player]
    white_player = players_hash[:white_player]
    self.save
  end
  
  def do_nigiri!
      if Random.rand(100) >= 50
          temp_swap = white_player
          white_player = black_player
          black_player = temp_swap
      end
      self.save
  end
end

