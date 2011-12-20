# Implementation of the Glicko rating system
# See more info in README_glicko.markdown

require 'date'

# Abstract out what scale the ratings are on
class Rating
  attr_accessor :elo, :rd, :time_last_played

  Q = Math.log(10)/400.0    # Convert from classic Elo to natural scale
  KGS_KYU_TRANSFORM = 0.85/Q  # kgs 5k-
  KGS_DAN_TRANSFORM = 1.30/Q  # kgs 2d+
  KD_FIVE_KYU = -4.0         # Strongest 5k on the kyudan scale
  KD_TWO_DAN  =  1.0         # Weakest   2d on the kyudan scale
  A = (KGS_DAN_TRANSFORM - KGS_KYU_TRANSFORM) / (KD_TWO_DAN - KD_FIVE_KYU) # ~ 17.4    Intermediate constant for conversions
  B = KGS_KYU_TRANSFORM - KD_FIVE_KYU*A                                    # ~ 208.6   Intermediate constant for conversions
  FIVE_KYU = (A/2.0)*((KD_FIVE_KYU)**2) + (B*KD_FIVE_KYU)    # ~ 695.2 -- Elo rating of the strongest 5k
  TWO_DAN  = (A/2.0)*((KD_TWO_DAN )**2) + (B*KD_TWO_DAN )    # ~ 217.3 -- Elo rating of the weakest 2d

  def self.new_aga(aga_rating)
    r = Rating.new()
    r.aga = aga_rating
    return r
  end
  def self.new_kyudan(kyudan)
    r = Rating.new()
    r.kyudan = kyudan
    return r
  end
  def self.advantage_in_stones(handi, komi, even_komi)
    raise WhrError, "Handi=1 is illegal" if handi == 1
    komi = komi.floor
    even_komi = even_komi.floor
    handi -= 1 if handi > 0
    return handi + (even_komi-komi)/(even_komi*2.0)
  end
  def initialize(elo=0)
    @elo = elo
    return self
  end
  def to_s()
    return "%s" % @elo
  end
  def gamma=(gamma)
    @elo = 400.0*Math::log10(gamma)
    return self
  end
  def gamma()
    return 10**(@elo/400.0)
  end
  def kyudan()
    return KD_FIVE_KYU + (@elo-FIVE_KYU)/KGS_KYU_TRANSFORM if @elo < FIVE_KYU
    return KD_TWO_DAN  + (@elo- TWO_DAN)/KGS_DAN_TRANSFORM if @elo >  TWO_DAN
    return (Math.sqrt(2.0*A*@elo+B**2.0)-B)/A
  end
  def aga()
    r = kyudan()
    return r < 0.0 ? r - 1.0 : r + 1.0  # Add the (-1.0,1.0) gap
  end
  def kyudan=(kyudan)
    if kyudan < KD_FIVE_KYU
      @elo = (kyudan - KD_FIVE_KYU)*KGS_KYU_TRANSFORM + FIVE_KYU
    elsif kyudan > KD_TWO_DAN
      @elo = (kyudan - KD_TWO_DAN )*KGS_DAN_TRANSFORM + TWO_DAN
    else
      @elo = ((A*kyudan+B)**2.0 - B**2.0)/(2.0*A)
    end
    return self
  end
  def aga=(aga_rating)
    raise WhrError, "Illegal aga_rating #{aga_rating}" unless aga_rating.abs >= 1.0  # Ratings in (-1.0,1.0) are illegal
    self.kyudan = aga_rating < 0.0 ? aga_rating + 1.0 : aga_rating - 1.0   # Close the (-1.0,1.0) gap
    return self
  end
  def rank()
    r = self.aga
    return r < 0.0 ? "%dk" % -r.ceil : "%dd" % r.floor
  end
  def aga_rank_str()
    r = self.aga
    return r < 0.0 ?
      "%0.1fk" % [(r*10.0).ceil/10.0] :
      "%0.1fd" % [(r*10.0).floor/10.0]
  end
end


module Glicko
  INITIAL_RATING = Rating.new()
  DEBUG = false
  MAX_RD = 300.0            # maximum rating deviation for new/inactive players
  MIN_RD = 80.0             # minimum rating deviation for very active players
  G_TERM_MOD = 2.0          # Reduce impact of players with large RD even more then standard Glicko calls for
  RD_DECAY = 3*365          # Number of days for RD to decay from MIN to MAX
  C_SQUARED = (MAX_RD**2.0-MIN_RD**2.0)/RD_DECAY
  EVEN_KOMI = { "aga" => 7, "jpn" => 6 }    # even komi, after doing floor()

  class GlickoError < StandardError; end

  def self.g(rating)
    return 1.0/Math.sqrt(1.0 + 3.0*(Rating::Q**2.0)*(rating.rd**2.0)/Math::PI**2.0)
  end

  def self.win_probability(player_r, opp_r, hka=0)
    return 1.0 / (1.0 + 10.0**(-g(opp_r)**2.0*(player_r.elo+hka-opp_r.elo)/400.0))
  end

  def self.d_squared(player_r, opp_r, hka)
    e = win_probability(player_r, opp_r, hka)
    return 1.0 / (Rating::Q**2.0 * g(opp_r)**2.0 * e * (1.0-e))
  end

  def self.initial_rd_update(player_r, curr_time)
    if player_r.time_last_played
      delta_days = (curr_time-player_r.time_last_played).to_f
      player_r.rd = [Math.sqrt(player_r.rd**2.0+C_SQUARED*delta_days), MAX_RD].min
    else
      player_r.rd = MAX_RD
    end
    return player_r
  end

  def self.advantage_in_stones(handi, komi, even_komi)
    raise GlickoError, "Handi=1 is illegal" if handi == 1
    komi = komi.floor
    even_komi = even_komi.floor
    handi -= 1 if handi > 0
    return handi + (even_komi-komi)/(even_komi*2.0)
  end

  def self.advantage_in_elo(white, black, rules, handi, komi)
    advantage_in_stones = advantage_in_stones(handi, komi, EVEN_KOMI[rules])
    avg_kyudan_rating = (white.rating.kyudan + black.rating.kyudan) / 2.0
    r1 = Rating.new_kyudan(avg_kyudan_rating + advantage_in_stones*0.5)
    r2 = Rating.new_kyudan(avg_kyudan_rating - advantage_in_stones*0.5)
    return r1.elo-r2.elo
  end

  def self.rating_to_s(player)
    r_min = Rating.new(player.rating.elo - player.rating.rd*2)
    r_max = Rating.new(player.rating.elo + player.rating.rd*2)
    return "%5.0f [+-%3.0f] %6.2f [+-%5.2f]" % [player.rating.elo, (r_max.elo-r_min.elo)/2.0, player.rating.aga, (r_max.aga-r_min.aga)/2.0]
  end

  def self.suggest_handicap(input, players)
    # Right now this will also suggest the colors
    raise GlickoError, "Invalid arguments #{input}" unless input[:p1] && input[:p2] && input[:rules]
    #print "%s\n" % [input[:p1]]
    #print "%s\n" % [input[:p2]]
    p1 = players[input[:p1]]
    p2 = players[input[:p2]]
    if p1.rating.rd == nil then p1.rating.rd = MIN_RD end  # Super hack, should be initialized on construction
    if p2.rating.rd == nil then p2.rating.rd = MIN_RD end
    if p1.rating.kyudan > p2.rating.kyudan
       white = p1
       black = p2
    else
       white = p2
       black = p1
    end
    diff = white.rating.kyudan - black.rating.kyudan
    # traditional handicaps:
    #if    diff < 0.50 then handi = 0; komi =  6.5
    #elsif diff < 1.50 then handi = 0; komi =  0.5
    #elsif diff < 2.50 then handi = 2; komi =  0.5
    #elsif diff < 3.50 then handi = 3; komi =  0.5
    #else                   handi = 4; komi =  0.5
    #end
    # 2X the granularity of traditional handicaps:
    if    diff < 0.25 then handi = 0; komi =  6.5
    elsif diff < 0.75 then handi = 0; komi =  0.5
    elsif diff < 1.25 then handi = 0; komi = -5.5
    elsif diff < 1.75 then handi = 2; komi =  0.5
    elsif diff < 2.25 then handi = 2; komi = -5.5
    elsif diff < 2.70 then handi = 3; komi =  0.5
    elsif diff < 3.25 then handi = 3; komi = -5.5
    elsif diff < 3.70 then handi = 4; komi =  0.5
    elsif diff < 4.25 then handi = 4; komi = -5.5
    elsif diff < 4.70 then handi = 5; komi =  0.5
    elsif diff < 5.25 then handi = 5; komi = -5.5
    elsif diff < 5.70 then handi = 6; komi =  0.5
    elsif diff < 6.25 then handi = 6; komi = -5.5
    elsif diff < 6.70 then handi = 7; komi =  0.5
    elsif diff < 7.25 then handi = 7; komi = -5.5
    elsif diff < 7.70 then handi = 8; komi =  0.5
    elsif diff < 8.25 then handi = 8; komi = -5.5
    elsif diff < 8.70 then handi = 9; komi =  0.5
    else                   handi = 9; komi = -5.5
    end
    # 4X the granularity of traditional handicaps:
    # not sure if I made the boundaries correct
    #if    diff < 0.25 then handi = 0; komi =  6.5
    #elsif diff < 0.50 then handi = 0; komi =  3.5
    #elsif diff < 0.75 then handi = 0; komi =  0.5
    #elsif diff < 1.00 then handi = 0; komi = -3.5
    #elsif diff < 1.25 then handi = 0; komi = -5.5
    #elsif diff < 1.50 then handi = 2; komi =  3.5
    #elsif diff < 1.75 then handi = 2; komi =  0.5
    #elsif diff < 2.00 then handi = 2; komi = -3.5
    #elsif diff < 2.25 then handi = 2; komi = -5.5
    #elsif diff < 2.50 then handi = 3; komi =  3.5
    #elsif diff < 2.70 then handi = 3; komi =  0.5
    #elsif diff < 3.00 then handi = 3; komi = -3.5
    #elsif diff < 3.25 then handi = 3; komi = -5.5
    #end
    hka = advantage_in_elo(white, black, input[:rules], handi, komi)
    e = win_probability(white.rating, black.rating, -hka)
    print "white_rating=%0.2f black_rating=%0.2f diff=%0.2f H=%d K=%0.1f pwin=%0.2f\n" % [white.rating.kyudan, black.rating.kyudan, white.rating.kyudan-black.rating.kyudan, handi, komi, e]
    output = {}
    output[:white] = white
    output[:black] = black
    output[:handi] = handi
    output[:komi]  = komi
    return output
  end

  def self.add_result(input, players)
    raise GlickoError, "Invalid arguments #{input}" unless input[:white_player] && input[:black_player] && input[:winner] && input[:datetime] && input[:rules] && input[:handicap] && input[:komi]
    white = players[input[:white_player]]
    black = players[input[:black_player]]
    handi = input[:handicap]
    komi  = (input[:komi]).floor
    hka = advantage_in_elo(white, black, input[:rules], handi, komi)
    white_won = input[:winner] == 'W'
    print "%sw=%s %sb=%s h=%d k=%d hka=%0.0f " % [white_won ? "+":" ", white.id, white_won ? " ":"+", black.id, handi, komi, hka] if DEBUG
    # Initial update on RD based on how long it has been since the player's last game
    for player in [white, black] do
      initial_rd_update(player.rating, input[:datetime])
    end
    new_r  = {}  # Updates must be calculated first, then applied.  Temp store updates here.
    new_rd = {}
    for player, opp, player_won, hka in [[white, black, white_won, -hka], [black, white, !white_won, hka]] do
      score = player_won ? 1.0 : 0.0
      d_squared = d_squared(player.rating, opp.rating, hka)
      e = win_probability(player.rating, opp.rating, hka)
      q_term = Rating::Q / ((1.0/player.rating.rd**2.0)+1.0/d_squared)
      g_term = g(opp.rating)
      g_term_mod = g_term ** G_TERM_MOD
      s_term = score - e
      #delta = q_term*g_term*s_term
      delta = q_term*g_term_mod*s_term
      new_r[player]  = player.rating.elo + delta
      new_rd[player] = [MIN_RD, Math.sqrt(1.0/((1.0/player.rating.rd**2.0)+1.0/d_squared))].max
      #print "q=%6.2f g=%4.2f g_term_mod=%4.2f s=%5.2f d=%7.2f  " % [q_term, g_term, g_term_mod, s_term, delta]
    end
    #puts
    # Apply updates
    for player in [white, black]
      player.rating.elo = new_r[player]
      player.rating.rd = new_rd[player]
      player.rating.time_last_played = input[:datetime]
      print "id=%s rating=%7.2f rd=%6.2f  " % [player.id, player.rating.elo, player.rating.rd] if DEBUG
    end
    print "\n" if DEBUG
  end

  def self.rank(player)
    return player.rating.rank
  end

  def self.validate(player)
    aga_rating = player.rating.aga
    raise GlickoError, "Rating less than 35k" if aga_rating <= -36.0
    raise GlickoError, "Rating more than 12d" if aga_rating >= 13.0
  end

  def self.print_constants()
    puts "MAX_RD            = %8.2f" % [ MAX_RD             ]
    puts "MIN_RD            = %8.2f" % [ MIN_RD             ]
    puts "G_TERM_MOD        = %8.2f" % [ G_TERM_MOD  ]
    puts "RD_DECAY          = %8.2f" % [ RD_DECAY           ]
    puts "C_SQUARED         = %8.2f" % [ C_SQUARED          ]
    puts "Q                 = %8.2f" % [ Rating::Q                  ]
    puts "KGS_KYU_TRANSFORM = %8.2f" % [ Rating::KGS_KYU_TRANSFORM  ]
    puts "KGS_DAN_TRANSFORM = %8.2f" % [ Rating::KGS_DAN_TRANSFORM  ]
    puts "KD_FIVE_KYU       = %8.2f" % [ Rating::KD_FIVE_KYU        ]
    puts "KD_TWO_DAN        = %8.2f" % [ Rating::KD_TWO_DAN         ]
    puts "A                 = %8.2f" % [ Rating::A                  ]
    puts "B                 = %8.2f" % [ Rating::B                  ]
    puts "FIVE_KYU          = %8.2f" % [ Rating::FIVE_KYU           ]
    puts "TWO_DAN           = %8.2f" % [ Rating::TWO_DAN            ]
  end

end
