#not real system, just for mock.
class Random

  attr_accessor :rounds, :players 

  def initialize(players)
    @players = players
    @rounds = []
  end

  def pairings
    @rounds.last.pairings
  end

  def do_pairings
    pairings = []
    matching_players = @players.dup
    index = 0
    (matching_players.length/2).times do 
      p1 = matching_players.pop
      p2 = matching_players.delete_at rand(matching_players.length)
      pairings << Pairing.new(p1,p2)
    end
    return pairings
  end

  def fixture
    res = []
    @players.each do |p|
      res << {:ip=> p.ip, :player=> p.name, :score => score(result_by_player(p)), :rounds => result_by_player(p)}
    end
    res         
  end

  def start_round
    raise "Not all games were played in the previous round." unless @rounds.empty? || @rounds.last.finished?
    @rounds << Round.new(do_pairings)
    
  end

  def add_result(p1,p2, result)
    @rounds.last.add_result(p1,p2,result)
  end

  def result_by_player(player)
    res = []
    @rounds.each do |r|
      res << r.result_by_player(player)
    end
    return res
  end
  def score(results)
    points = 0
    results.each {|res| points +=1 if (res[0]=="+") }
    points
  
  end

end

class Round

  attr_accessor :pairings

  def initialize(pairings)
    @pairings = pairings
  end

  def add_result(p1,p2, result)
    find_match_by_names(p1,p2).result = result
  end

  def finished?
    @pairings.each {|p| return false unless p.result}
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

  def to_s
    res = ""
    @pairings.each do |pairing|
    end 
  end  

private

  def find_match_by_names(p1,p2)
    @pairings.each do |pairing|
      return pairing if (pairing.white_player == p1 && 
                        pairing.black_player == p2)
    end
  end
end

class Pairing
  attr_accessor :white_player, :black_player, :result
  def initialize(white_player, black_player)
    raise "Invalid players" if white_player.nil? || black_player.nil?
    @white_player= white_player
    @black_player = black_player
  end
end
