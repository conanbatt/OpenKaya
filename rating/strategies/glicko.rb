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

  class Rating < DelegateClass(Float)
    attr_reader :rating
    attr_writer :rating
    def initialize(rating)
      @rating = rating
      super(@rating)
    end
  end

  #INITIAL_RATING = Rating.new(0.0)  # Hmm how to do this?  Delagate pattern?
  INITIAL_RATING = 0.0
  MAX_RD = 350.0            # maximum rating deviation for new/inactive players
  MIN_RD = 30.0             # minimum rating deviation for very active players
  Q = Math.log(10)/400      # Convert from classic Elo to natural scale
  C_SQUARED = (MAX_RD**2.0-MIN_RD**2.0)/180.0  # Set RD to decay from MIN to MAX in 180 days
  KGS_KYU_TRANSFORM = 139.0  # kgs 5k-
  KGS_DAN_TRANSFORM = 226.0  # kgs 2d+
  DEBUG = false
  A = (KGS_DAN_TRANSFORM - KGS_KYU_TRANSFORM) / (1.0 - -4.0) # ~ 17.4   -- 1.0=weak2d  -4.0=strong5k
  B = KGS_KYU_TRANSFORM + 4.0*A                              # ~ 208.6
  FIVE_KYU = (A/2.0)*((-4.0)**2) + (B*-4.0)    # ~ 695.2 -- Glicko rating of the strongest 5k
  TWO_DAN  = (A/2.0)*(( 1.0)**2) + (B* 1.0)    # ~ 217.3 -- Glicko rating of the weakest 2d

  def self.win_probability(player, opp)
    return e(player, opp)
  end

  def self.g(player)
    return 1.0/Math.sqrt(1.0 + 3.0*(Q**2.0)*(player.rd**2.0)/Math::PI**2.0)
  end
 
  def self.e(player, opp)
    return 1.0 / (1.0 + 10.0**(-self.g(opp)**2.0*(player.rating-opp.rating)/400.0))
  end

  def self.d_squared(player, opp)
    e = self.e(player, opp)
    return 1.0 / (Q**2.0 * self.g(opp)**2.0 * e * (1.0-e))
  end
 
  def self.add_result(input, players)
    self.initialize_stuff() if not @initialized
    raise "Invalid arguments #{input}" unless input[:white_player] && input[:black_player] && input[:winner] && input[:datetime]
    white = players[input[:white_player]]
    black = players[input[:black_player]]
    # Initial update on RD based on how long it has been since the player's last game
    for player in [white, black] do
      if player.time_last_played
        delta_days = (input[:datetime]-player.time_last_played).to_f
        player.rd = [MIN_RD, [Math.sqrt(player.rd**2.0+C_SQUARED*delta_days), MAX_RD].min].max
      else
        player.rd = MAX_RD
      end
    end
    new_r  = {}  # Updates must be calculated first, then applied.  Temp store updates here.
    new_rd = {}
    white_won = input[:winner] == 'W'
    for player, opp, player_won in [[white, black, white_won], [black, white, !white_won]] do
      score = player_won ? 1.0 : 0.0
      d_squared = self.d_squared(player, opp)
      e = self.e(player, opp)
      q_term = Q / ((1.0/player.rd**2.0)+1.0/d_squared)
      g_term = self.g(opp)
      s_term = score - e
      new_r[player]  = player.rating + q_term*g_term*s_term
      new_rd[player] = Math.sqrt(1.0/((1.0/player.rd**2.0)+1.0/d_squared))
    end
    # Apply updates
    for player in [white, black]
      player.rating = new_r[player]
      player.rd = new_rd[player]
      player.time_last_played = input[:datetime]
      print "id=%s rating=%7.2f rd=%6.2f  " % [player.id, player.rating, player.rd] if DEBUG
    end
    print "\n" if DEBUG
  end

  def self.glicko_to_kyudan_transform(rating)
    return -4.0 + (rating-FIVE_KYU)/KGS_KYU_TRANSFORM if rating < FIVE_KYU
    return  1.0 + (rating- TWO_DAN)/KGS_DAN_TRANSFORM if rating >  TWO_DAN
    return (Math.sqrt(2.0*A*rating+B**2.0)-B)/A
  end

  def self.initialize_stuff()
    if DEBUG
      print 'a=', A, ' b=', B, ' five_kyu=', FIVE_KYU, ' two_dan=', TWO_DAN, "\n"
      puts rank(FIVE_KYU + 1.0)
      puts rank(FIVE_KYU - 1.0)
      puts rank(TWO_DAN + 1.0)
      puts rank(TWO_DAN - 1.0)
      puts rank(1.0)
      puts rank(-1.0)
      (100..2900).step(100) do |x| print [x, rank(x), rank(-x)].join(","), "\n" end
      r1 = Rating.new(2.0)
      r2 = Rating.new(3.0)
      print ['yo', r1, r2, r1+r2, "\n"].join(',')
    end
    @initialized = true
  end

  def self.rank(rating)
    r = self.glicko_to_kyudan_transform(rating)
    if r < 0
      r -= 1.0
      return "%0.1fk" % [(r*10.0).ceil/10.0]
    else
      r += 1.0
      return "%0.1fd" % [(r*10.0).floor/10.0]
    end
  end

end
