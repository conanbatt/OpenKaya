class Tournament < ActiveRecord::Base
  #TODO: fix cache issue
  has_and_belongs_to_many :players
  has_many :rounds

  validate :no_repeated_players  
  def no_repeated_players
    if(!(players.uniq.count == players.count))
      errors.add(:repeated_players, "a same player cant be twice in the same tournament")
    end
  end

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
    players.all.each do |p|
      res << {:ip=> p.ip, :player=> p.name, :score => score(result_by_player(p),p), :rounds => result_by_player(p)}
    end
    res         
  end

  def start_round
    #SQLite Adapter Cache issue?
    rounds.length
    raise "Not all games were played in the previous round." unless rounds.empty? || rounds.last.finished?
    rounds.last.end_time = Time.now unless rounds.empty?
    rounds.last.save unless rounds.empty?
    rounds << Round.new({:pairings => do_pairings})
    rounds.last.start_time = Time.now
    rounds.last.save

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
  
  def do_nigiri!
      if Random.rand(100) >= 50
          temp_swap = white_player
          white_player = black_player
          black_player = temp_swap
      end
  end
end

