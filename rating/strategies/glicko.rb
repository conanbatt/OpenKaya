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

# Glicko requires :rd, :time_last_player, in addition to simply :rating.
# Add them in here.  Intial value of nil is fine.
class Player
  attr_accessor :rd, :time_last_played
end

module Glicko 
  INITIAL_RATING = 0.0
  DEBUG = false
  MAX_RD = 350.0            # maximum rating deviation for new/inactive players
  MIN_RD = 30.0             # minimum rating deviation for very active players
  Q = Math.log(10)/400      # Convert from classic Elo to natural scale
  C_SQUARED = (MAX_RD**2.0-MIN_RD**2.0)/180.0  # Set RD to decay from MIN to MAX in 180 days
  KGS_KYU_TRANSFORM = 139.0  # kgs 5k-
  KGS_DAN_TRANSFORM = 226.0  # kgs 2d+
  KD_FIVE_KYU = -4.0
  KD_TWO_DAN  =  1.0
  A = (KGS_DAN_TRANSFORM - KGS_KYU_TRANSFORM) / (KD_TWO_DAN - KD_FIVE_KYU) # ~ 17.4 
  B = KGS_KYU_TRANSFORM - KD_FIVE_KYU*A                                     # ~ 208.6
  FIVE_KYU = (A/2.0)*((KD_FIVE_KYU)**2) + (B*KD_FIVE_KYU)    # ~ 695.2 -- Glicko rating of the strongest 5k
  TWO_DAN  = (A/2.0)*((KD_TWO_DAN )**2) + (B*KD_TWO_DAN )    # ~ 217.3 -- Glicko rating of the weakest 2d

  def self.g(player)
    return 1.0/Math.sqrt(1.0 + 3.0*(Q**2.0)*(player.rd**2.0)/Math::PI**2.0)
  end
 
  def self.win_probability(player, opp)
    return 1.0 / (1.0 + 10.0**(-g(opp)**2.0*(player.rating-opp.rating)/400.0))
  end

  def self.d_squared(player, opp)
    e = win_probability(player, opp)
    return 1.0 / (Q**2.0 * g(opp)**2.0 * e * (1.0-e))
  end

  def self.initial_rd_update(player, currTime)
    if player.time_last_played
      delta_days = (currTime-player.time_last_played).to_f
      player.rd = [MIN_RD, [Math.sqrt(player.rd**2.0+C_SQUARED*delta_days), MAX_RD].min].max
    else
      player.rd = MAX_RD
    end
    return player
  end

  def self.get_kyudan_rating(player)
    return KD_FIVE_KYU + (player.rating-FIVE_KYU)/KGS_KYU_TRANSFORM if player.rating < FIVE_KYU
    return KD_TWO_DAN  + (player.rating- TWO_DAN)/KGS_DAN_TRANSFORM if player.rating >  TWO_DAN
    return (Math.sqrt(2.0*A*player.rating+B**2.0)-B)/A
  end

  def self.get_aga_rating(player)
    r = get_kyudan_rating(player)
    return r < 0.0 ? r - 1.0 : r + 1.0  # Add the (-1.0,1.0) gap
  end

  def self.set_kyudan_rating(player, kyudan_rating)
    if kyudan_rating < KD_FIVE_KYU
      r = (kyudan_rating - KD_FIVE_KYU)*KGS_KYU_TRANSFORM + FIVE_KYU
    elsif kyudan_rating > KD_TWO_DAN
      r = (kyudan_rating - KD_TWO_DAN )*KGS_DAN_TRANSFORM + TWO_DAN
    else
      r = ((A*kyudan_rating+B)**2.0 - B**2.0)/(2.0*A)
    end
    player.rating = r
    return player
  end

  def self.set_aga_rating(player, aga_rating)
    kyudan_rating = aga_rating < 0.0 ? aga_rating + 1.0 : aga_rating - 1.0   # Close the (-1.0,1.0) gap
    set_kyudan_rating(player, kyudan_rating)
    return player
  end

  def self.add_result(input, players)
    raise "Invalid arguments #{input}" unless input[:white_player] && input[:black_player] && input[:winner] && input[:datetime]
    white = players[input[:white_player]]
    black = players[input[:black_player]]
    # Initial update on RD based on how long it has been since the player's last game
    for player in [white, black] do
      initial_rd_update(player, input[:datetime])
    end
    new_r  = {}  # Updates must be calculated first, then applied.  Temp store updates here.
    new_rd = {}
    white_won = input[:winner] == 'W'
    for player, opp, player_won in [[white, black, white_won], [black, white, !white_won]] do
      score = player_won ? 1.0 : 0.0
      d_squared = d_squared(player, opp)
      e = win_probability(player, opp)
      q_term = Q / ((1.0/player.rd**2.0)+1.0/d_squared)
      g_term = g(opp)
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

  def self.rank(player)
    r = get_aga_rating(player)
    return r < 0.0 ? "%dk" % -r.ceil : "%dd" % r.floor
  end

  def self.aga_rank_str(player)
    r = get_aga_rating(player)
    return r < 0.0 ? 
      "%0.1fk" % [(r*10.0).ceil/10.0] : 
      "%0.1fd" % [(r*10.0).floor/10.0]
  end

  class GlickoError < StandardError; end

  def self.validate(player)
    aga_rating = get_aga_rating(player)
    raise GlickoError, "Rating less than 35k" if aga_rating <= -36.0
    raise GlickoError, "Rating more than 12d" if aga_rating >= 13.0
  end

end
