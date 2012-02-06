class League

  attr_accessor :groups, :players 

  def initialize(players)
    @players = players
    @periods = []
  end
  
  def start_period
    new_period = LeaguePeriod.new(build_groups)
    @periods.last.end_time = Time.now unless @periods.empty?
    @periods << new_period
    new_period.start_time = Time.now
  end
  
  def period
    @periods.last
  end
  
  def groups
    @periods.last.groups
  end
  
  def build_groups
    raise "to be implemented by children"
  end
  
  def score_by_player(player)
    raise "to be implemented by children"
  end
  
  def result_by_player(player)
    raise "to be implemented by children"
  end
  
  def add_result(white_player, black_player, result)
    raise "The league has not yet started" if @periods.empty?
    @periods.last.add_result(white_player, black_player, result)
  end
  
  class LeaguePeriod
  
    attr_accessor :groups, :start_time, :end_time
    
    def initialize(groups)
        @groups = groups
    end
    
    def group_by_player(player)
      @groups.each do |g|
        return g if g.players.include?(player)
      end
      return nil
    end
    
    def add_result(white_player, black_player, result)
      game = Pairing.new(white_player, black_player)
      game.result = result
      black_player_group = nil
      white_player_group = nil
      @groups.each do |g|
        g.players.each do |p|
            if(p == black_player)
              black_player_group = g
            elsif (p == white_player)
              white_player_group = g
            end
        end
      end
      if(black_player_group == nil || white_player_group == nil)
        raise "one of the player isn't part of the league"
      end
      #games are added to both group, it's the tournament system policy that will decide if it
      #should be counted or not in the score, or displayed in the game lists
      if(black_player_group == white_player_group)
        black_player_group.pairings << game
      else
        black_player_group.pairings << game
        white_player_group.pairings << game
      end
    end
  end
  
  #Groups
  class Group
    attr_accessor :pairings, :players, :name
    
    def initialize(players, name)
        @pairings = []
        @players = players
        @name = name
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

