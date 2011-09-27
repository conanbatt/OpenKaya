require 'date'
require File.expand_path("../system", File.dirname(__FILE__))

module Glicko 

  INITIAL_RATING = 0.0
  MAX_RD = 350.0
  MIN_RD = 30.0
  Q = Math.log(10)/400
  C_SQUARED = (MAX_RD**2.0-MIN_RD**2.0)/180.0  # Set RD to decay from MIN to MAX in 180 days
  KGS_KYU_TRANSFORM = 139.0  # kgs 5k-
  KGS_DAN_TRANSFORM = 226.0  # kgs 2d+
  DEBUG = false
  A = (KGS_DAN_TRANSFORM - KGS_KYU_TRANSFORM) / (1.0 - -4.0) # ~ 17.4
  B = KGS_KYU_TRANSFORM + 4.0*A                              # ~ 208.6
  FIVE_KYU = (A/2.0)*((-4.0)**2) + (B*-4.0)    # ~ 695.2
  TWO_DAN  = (A/2.0)*(( 1.0)**2) + (B* 1.0)    # ~ 217.3

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
    for player in [white, black] do
      if player.time_last_played
        delta_days = (input[:datetime]-player.time_last_played).to_f
        player.rd = [MIN_RD, [Math.sqrt(player.rd**2.0+C_SQUARED*delta_days), MAX_RD].min].max
      else
        player.rd = MAX_RD
      end
    end
    new_r  = {}
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
    for player in [white, black]
      player.rating = new_r[player]
      player.rd = new_rd[player]
      player.time_last_played = input[:datetime]
      print "id=%s rating=%7.2f rd=%6.2f  " % [player.id, player.rating, player.rd] if DEBUG
    end
    print "\n" if DEBUG
  end

  def self.rating_to_kyudan_transform(rating)
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
    end
    @initialized = true
  end

  def self.rank(rating)
    r = self.rating_to_kyudan_transform(rating)
    if r < 0
      r -= 1.0
      return "%0.1fk" % [(r*10.0).ceil/10.0]
    else
      r += 1.0
      return "%0.1fd" % [(r*10.0).floor/10.0]
    end
  end

end
