# Implementation of the Glicko rating system as described at
# http://www.glicko.net/glicko/glicko.pdf
# With support to transfrom from the classic Elo/Glicko scale to the KGS dan/kyu scale

# Rating scales:
#
# Glicko: Same as the classic Elo scale
#
# Natural: Glicko * Q -- not really used directly here
#
# Gamma: log(Natural) -- not used here at all
#   Other algorithms such as Glicko2 and WHR use this scale.
#
# kyudan: 1.0 for each stone.  No gap around zero.
#   0.0+epsilon = weakest   1d
#   0.0-epsilon = strongest 1k
#   Use this to do operations like determining correct handicap, 
#   because it will work correctly across the dan/kyu boundary
#
# aga: 1.0 for each stone.  Gap from (-1.0, 1.0)
#   1.0+epsilon = weakest   1d
#  -1.0-epsilon = strongest 1k
# The aga scale is nice for displaying, because you can get the rank by chopping of the decimal portion.
# Be careful of rounding errors (1.99d should not round up to 2.0d)
#

require 'date'
require 'delegate'
require File.expand_path("../system", File.dirname(__FILE__))

module Glicko 

  #TODO
=begin
 I think this rating class can be made a module. We can do :
 def e(opp) => def self.e(a, b)
 This way its stateless, which is more appropiate to a Math module like calculating rating.
 Attributes that are tied to a player, like :rd, :time_last_played.. etc can be added to the player model.

 If you fear it might collide with future system implementations you can add this code:

 class Player
    attr_accessor :r, :rd, :time_last_played
 end

 This will reopen the Player class, add this attributes and leave them intact. You can attach this code somewhere here, and this way Player class is only modified when Glicko is loaded.

 Otherwise just add them to the Player model in system : thats how its going to happen in Kaya eventually.  

=end

  class Rating < DelegateClass(Float)
    MAX_RD = 350.0            # maximum rating deviation for new/inactive players
    MIN_RD = 30.0             # minimum rating deviation for very active players
    Q = Math.log(10)/400      # Convert from classic Elo to natural scale
    C_SQUARED = (MAX_RD**2.0-MIN_RD**2.0)/180.0  # Set RD to decay from MIN to MAX in 180 days
    KGS_KYU_TRANSFORM = 139.0  # kgs 5k-
    KGS_DAN_TRANSFORM = 226.0  # kgs 2d+
    A = (KGS_DAN_TRANSFORM - KGS_KYU_TRANSFORM) / (1.0 - -4.0) # ~ 17.4   -- 1.0=weak2d  -4.0=strong5k
    B = KGS_KYU_TRANSFORM + 4.0*A                              # ~ 208.6
    FIVE_KYU = (A/2.0)*((-4.0)**2) + (B*-4.0)    # ~ 695.2 -- Glicko rating of the strongest 5k
    TWO_DAN  = (A/2.0)*(( 1.0)**2) + (B* 1.0)    # ~ 217.3 -- Glicko rating of the weakest 2d

    attr_accessor :r, :rd, :time_last_played

    def initialize(rating)
      @r  = rating
      @rd = 350.0
      @time_last_played = nil
      super(@r)
    end

    def g()
      return 1.0/Math.sqrt(1.0 + 3.0*(Q**2.0)*(@rd**2.0)/Math::PI**2.0)
    end
   
    def e(opp)
      return 1.0 / (1.0 + 10.0**(-opp.rating.g()**2.0*(@r-opp.rating.r)/400.0))
    end

    def d_squared(opp)
      e_tmp = e(opp)
      return 1.0 / (Q**2.0 * opp.rating.g()**2.0 * e_tmp * (1.0-e_tmp))
    end

    def glicko_to_kyudan_transform()
      return -4.0 + (@r-FIVE_KYU)/KGS_KYU_TRANSFORM if @r < FIVE_KYU
      return  1.0 + (@r- TWO_DAN)/KGS_DAN_TRANSFORM if @r >  TWO_DAN
      return (Math.sqrt(2.0*A*@r+B**2.0)-B)/A
    end

    def initial_rd_update(currTime)
      if @time_last_played
        delta_days = (currTime-@time_last_played).to_f
        @rd = [MIN_RD, [Math.sqrt(@rd**2.0+C_SQUARED*delta_days), MAX_RD].min].max
      else
        @rd = MAX_RD
      end
    end

  end

  INITIAL_RATING = Rating.new(0.0)
  #INITIAL_RATING = 0.0
  DEBUG = true

  def self.win_probability(player, opp)
    return player.e(opp)
  end

  def self.add_result(input, players)
    raise "Invalid arguments #{input}" unless input[:white_player] && input[:black_player] && input[:winner] && input[:datetime]
    white = players[input[:white_player]]
    black = players[input[:black_player]]
    self.initialize_stuff(white, black) if not @initialized
    # Initial update on RD based on how long it has been since the player's last game
    for player in [white, black] do
      player.rating.initial_rd_update(input[:datetime])
    end
    new_r  = {}  # Updates must be calculated first, then applied.  Temp store updates here.
    new_rd = {}
    white_won = input[:winner] == 'W'
    for player, opp, player_won in [[white, black, white_won], [black, white, !white_won]] do
      score = player_won ? 1.0 : 0.0
      d_squared = player.rating.d_squared(opp)
      e = player.rating.e(opp)
      q_term = Rating::Q / ((1.0/player.rating.rd**2.0)+1.0/d_squared)
      g_term = opp.rating.g()
      s_term = score - e
      new_r[player]  = player.rating.r + q_term*g_term*s_term
      new_rd[player] = Math.sqrt(1.0/((1.0/player.rating.rd**2.0)+1.0/d_squared))
    end
    # Apply updates
    for player in [white, black]
      player.rating.r = new_r[player]
      player.rating.rd = new_rd[player]
      player.rating.time_last_played = input[:datetime]
      print "id=%s rating=%7.2f rd=%6.2f  " % [player.id, player.rating.r, player.rating.rd] if DEBUG
    end
    print "\n" if DEBUG
  end

  def self.initialize_stuff(white, black)
    if DEBUG
      print 'a=', Rating::A, ' b=', Rating::B, ' five_kyu=', Rating::FIVE_KYU, ' two_dan=', Rating::TWO_DAN, "\n"
      puts rank(Rating.new(Rating::FIVE_KYU + 1.0))
      puts rank(Rating.new(Rating::FIVE_KYU - 1.0))
      puts rank(Rating.new(Rating::TWO_DAN + 1.0))
      puts rank(Rating.new(Rating::TWO_DAN - 1.0))
      puts rank(Rating.new(1.0))
      puts rank(Rating.new(-1.0))
      (100..2900).step(100) do |x| print [x, rank(Rating.new(x)), rank(Rating.new(-x))].join(","), "\n" end
      r1 = Rating.new(2.0)
      r2 = Rating.new(3.0)
      print ['yo', r1, r2, r1+r2, "\n"].join(',')
      print ['white.rating=', white.rating.r, 'white.rating.rd=', white.rating.rd, "\n"].join(',')
      white.rating.rd = 5.0
      print ['white.rating=', white.rating.r, 'white.rating.rd=', white.rating.rd, "\n"].join(',')
      print r1.class
    end
    @initialized = true
  end

  def self.rank(rating)
    r = rating.glicko_to_kyudan_transform()
    if r < 0
      r -= 1.0
      return "%0.1fk" % [(r*10.0).ceil/10.0]
    else
      r += 1.0
      return "%0.1fd" % [(r*10.0).floor/10.0]
    end
  end

  class GlickoError < StandardError; end

  def self.validate(rating)

    #TODO: write validation rules. i.e.
    # raise GlickoError, "Rating must be positive" if rating < 0
    raise RuntimeError, "Unimplemented"

 
  end

  

end
