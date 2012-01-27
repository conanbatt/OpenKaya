class Tournament

  attr_accessor :rounds, :players 

  def initialize(players)
    @players = players
    @rounds = []
  end

  def finished?
    raise "to be implemented by children"
  end
  
  def podium
    podium = @players.sort! { |x,y| score_by_player(y) <=> score_by_player(x) }.take(3)
  end
  
  def pairings
    @rounds.last.pairings
  end

  def do_pairings
    raise "to be implemented by children"
  end
  
  def already_played_together(a_player, another_player)
    @rounds.each do |r|
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
    @players.each do |p|
      res << {:ip=> p.ip, :player=> p.name, :score => score(result_by_player(p)), :rounds => result_by_player(p)}
    end
    res         
  end

  def start_round
    raise "Not all games were played in the previous round." unless @rounds.empty? || @rounds.last.finished?
    @rounds.last.end_time = Time.now unless @rounds.size == 0
    @rounds << Round.new(do_pairings)
    @rounds.last.start_time = Time.now
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

  #Rounds dont know of previous rounds or future ones, they just take a pairing and do some basic operations
  class Round

    attr_accessor :pairings, :start_time, :end_time

    def initialize(pairings)
      @pairings = pairings
    end

    def add_result(p1,p2, result)
      find_match_by_names(p1,p2).result = result
      #puts find_match_by_names(p1,p2).to_s
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

  private

    def find_match_by_names(p1,p2)
      @pairings.each do |pairing|
        return pairing if (pairing.white_player == p1 && 
                          pairing.black_player == p2)
      end
    end
  end

  #Stores players and result
  class Pairing
    attr_accessor :white_player, :black_player, :result, :handicap
    def initialize(white_player, black_player)
      raise "Invalid players" if white_player.nil? || black_player.nil?
      @white_player = white_player
      @black_player = black_player
      @handicap = 0
    end
    
    def draw?
      result == "Draw" || result == "Jigo"
    end
    
    def winner
        ((result.nil?) ? nil :(result[0] == "W") ? white_player : black_player )
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
end

