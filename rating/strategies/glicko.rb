# Implementation of the Glicko rating system
# See more info in README_glicko.markdown

require 'date'

class Rating
  attr_accessor :elo, :rd, :time_last_played, :player_object

  Q = Math.log(10)/400.0    # Convert from classic Elo to natural scale
  KGS_KYU_TRANSFORM = 0.85/Q  # kgs 5k-
  KGS_DAN_TRANSFORM = 1.30/Q  # kgs 2d+
  KD_FIVE_KYU = -4.0         # Strongest 5k on the kyudan scale
  KD_TWO_DAN  =  1.0         # Weakest   2d on the kyudan scale
  A = (KGS_DAN_TRANSFORM - KGS_KYU_TRANSFORM) / (KD_TWO_DAN - KD_FIVE_KYU) # ~ 17.4    Intermediate constant for conversions
  B = KGS_KYU_TRANSFORM - KD_FIVE_KYU*A                                    # ~ 208.6   Intermediate constant for conversions
  FIVE_KYU = (A/2.0)*((KD_FIVE_KYU)**2) + (B*KD_FIVE_KYU)    # ~ 695.2 -- Elo rating of the strongest 5k
  TWO_DAN  = (A/2.0)*((KD_TWO_DAN )**2) + (B*KD_TWO_DAN )    # ~ 217.3 -- Elo rating of the weakest 2d

  def self.new_player_copy(player)
    r = Rating.new
    r.aga = player.rating
    r.rd  = player.rd
    r.time_last_played = player.time_last_played
    r.player_object    = player
    return r
  end
  def self.new_elo(elo_rating)
    r = Rating.new
    r.elo = elo_rating
    return r
  end
  def self.new_aga(aga_rating)
    r = Rating.new
    r.aga = aga_rating
    return r
  end
  def self.new_kyudan(kyudan)
    r = Rating.new
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
  def initialize(aga=1.5, rd=Glicko::MIN_RD, time_last_played=nil)
    self.aga = aga
    @rd  = rd
    @time_last_played = time_last_played
    return self
  end
  def to_s
    return "%s" % @elo
  end
  def gamma=(gamma)
    @elo = 400.0*Math::log10(gamma)
    return self
  end
  def gamma
    return 10**(@elo/400.0)
  end
  def kyudan
    return KD_FIVE_KYU + (@elo-FIVE_KYU)/KGS_KYU_TRANSFORM if @elo < FIVE_KYU
    return KD_TWO_DAN  + (@elo- TWO_DAN)/KGS_DAN_TRANSFORM if @elo >  TWO_DAN
    return (Math.sqrt(2.0*A*@elo+B**2.0)-B)/A
  end
  def aga
    r = kyudan
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
  def rank
    r = self.aga
    return r < 0.0 ? "%dk" % -r.ceil : "%dd" % r.floor
  end
  def aga_rank_str
    r = self.aga
    return r < 0.0 ?
      "%0.1fk" % [(r*10.0).ceil/10.0] :
      "%0.1fd" % [(r*10.0).floor/10.0]
  end
end


module Glicko
  INITIAL_RATING = 1.5
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

  def self.advantage_in_elo(white_rating, black_rating, rules, handi, komi)
    advantage_in_stones = advantage_in_stones(handi, komi, EVEN_KOMI[rules])
    avg_kyudan_rating = (white_rating.kyudan + black_rating.kyudan) / 2.0
    r1 = Rating.new_kyudan(avg_kyudan_rating + advantage_in_stones*0.5)
    r2 = Rating.new_kyudan(avg_kyudan_rating - advantage_in_stones*0.5)
    return r1.elo-r2.elo
  end

  def self.rating_to_s(player)
    r = Rating.new_player_copy(player)
    r_min = Rating.new_elo(r.elo - r.rd*2)
    r_max = Rating.new_elo(r.elo + r.rd*2)
    return "%5.0f [+-%3.0f] %6.2f [+-%5.2f]" % [r.elo, (r_max.elo-r_min.elo)/2.0, r.aga, (r_max.aga-r_min.aga)/2.0]
  end

  #
  # Handicap *stones* are always set according to rank difference.
  # After this step, komi is adjusted to make the game closer to even.
  # For players of the same rank:
  #    If they are within 0.5 stones: Colors are picked randomly and komi is 6.5
  #    Otherwise: Stronger player takes white and komi is 0.5
  # For players one rank apart:
  #    Stronger player takes white
  #    Komi can be 6.5, 0.5, or -5.5 based on rating difference.
  # For players 2-9 ranks apart:
  #    Stronger player takes white, handicap = #ranks difference
  #    Komi can be 0.5 or -5.5 based on rating difference
  # For players >9 ranks apart:
  #    Stronger player takes white, handicap = #ranks difference
  #    Komi = -5.5
  #
  def self.suggest_handicap(input)
    # Right now this will also suggest the colors
    raise GlickoError, "Invalid arguments #{input}" unless input[:p1] && input[:p2] && input[:rules]
    #print "%s\n" % [input[:p1]]
    #print "%s\n" % [input[:p2]]
    p1 = input[:p1]
    p2 = input[:p2]
    if p1.rd == nil then p1.rd = MIN_RD end  # Super hack, should be initialized on construction
    if p2.rd == nil then p2.rd = MIN_RD end
    p1_rating = Rating.new_player_copy(p1)
    p2_rating = Rating.new_player_copy(p2)
    diff = (p1_rating.kyudan - p2_rating.kyudan).abs
    # If players are the same rank and also within 0.5 stones, pick colors randomly
    # If they are >0.5 stones apart, force stronger one to be white because we will be adjusting komi
    if p1_rating.rank == p2_rating.rank and diff.abs < 0.5
      if Random.rand() < 0.5
        white_rating = p1_rating
        black_rating = p2_rating
      else
        white_rating = p2_rating
        black_rating = p1_rating
      end
    elsif p1_rating.kyudan > p2_rating.kyudan
       white_rating = p1_rating
       black_rating = p2_rating
    else
       white_rating = p2_rating
       black_rating = p1_rating
    end
    if white_rating.kyudan.floor - black_rating.kyudan.floor < 2
       handi = 0  # Rank difference of 0 or 1 is zero handicap stones -- adjust the rest with komi
       komi  = 6.5
       if diff > 0.5
          komi = 0.5
          diff -= 0.5
       end
       if diff > 0.5
          komi = -5.5
          diff -= 0.5
       end
    elsif white_rating.kyudan.floor - black_rating.kyudan.floor <= 9
       handi = white_rating.kyudan.floor - black_rating.kyudan.floor
       komi = 0.5
       diff -= handi - 0.5  # Adjust difference based on handicap
                            # Note that handicaps wth komi = 0.5 are 0.5 stones less than the number of stones
       if diff > 0.5
          komi = -5.5
          diff -= 0.5
       end
    else
       handi = 9  # Max handi is 9
       komi = 0.5
       diff -= handi - 0.5
       if diff > 0.5
          komi = -5.5
          diff -= 0.5
       end
    end
    hka = advantage_in_elo(white_rating, black_rating, input[:rules], handi, komi)
    e = win_probability(white_rating, black_rating, -hka)
    output = {}
    output[:white] = white_rating.player_object
    output[:black] = black_rating.player_object
    output[:handi] = handi
    output[:komi]  = komi
    output[:e]     = e     # e included in output for information only
    #print "w=%0.3f b=%0.3f h=%d k=%0.1f e=%0.2f\n" % [white_rating.aga, black_rating.aga, handi, komi, e]
    return output
  end

  def self.add_result(input, players)
    raise GlickoError, "Invalid arguments #{input}" unless input[:white_player] && input[:black_player] && input[:winner] && input[:datetime] && input[:rules] && input[:handicap] && input[:komi]
    white = players[input[:white_player]]
    black = players[input[:black_player]]
    handi = input[:handicap]
    komi  = (input[:komi]).floor
    white_rating = Rating.new_player_copy(white)
    black_rating = Rating.new_player_copy(black)
    hka = advantage_in_elo(white_rating, black_rating, input[:rules], handi, komi)
    white_won = input[:winner] == 'W'
    print "%sw=%s %sb=%s h=%d k=%d hka=%0.0f " % [white_won ? "+":" ", white.id, white_won ? " ":"+", black.id, handi, komi, hka] if DEBUG
    # Initial update on RD based on how long it has been since the player's last game
    for rating in [white_rating, black_rating] do
      initial_rd_update(rating, input[:datetime])
    end
    new_r  = {}  # Updates must be calculated first, then applied.  Temp store updates here.
    new_rd = {}
    for player_rating, opp_rating, player_won, hka in [[white_rating, black_rating, white_won, -hka], [black_rating, white_rating, !white_won, hka]] do
      score = player_won ? 1.0 : 0.0
      d_squared = d_squared(player_rating, opp_rating, hka)
      e = win_probability(player_rating, opp_rating, hka)
      q_term = Rating::Q / ((1.0/player_rating.rd**2.0)+1.0/d_squared)
      g_term = g(opp_rating)
      g_term_mod = g_term ** G_TERM_MOD
      s_term = score - e
      delta = q_term*g_term_mod*s_term
      new_r[player_rating.player_object]  = player_rating.elo + delta
      new_rd[player_rating.player_object] = [MIN_RD, Math.sqrt(1.0/((1.0/player_rating.rd**2.0)+1.0/d_squared))].max
    end
    #puts
    # Apply updates
    for player in [white, black]
      player.rating = Rating.new_elo(new_r[player]).aga
      player.rd = new_rd[player]
      player.time_last_played = input[:datetime]
      print "id=%s rating=%7.2f rd=%6.2f  " % [player.id, player_rating.elo, player_rating.rd] if DEBUG
    end
    print "\n" if DEBUG
  end

  def self.rank(rating)
    return Rating.new_aga(rating).rank
  end

  # Input  Output
  #  "9d"     9.5
  #  "1d"     1.5
  #  "1k"    -1.5
  #  "30k"  -30.5
  #TODO what i really need is for it to transform to Elo which is how its saved on the server.
  def self.rank2rating(rank)
    num = Float(rank[0..-2])
    if rank[-1] == "d"
      return num+0.5
    elsif rank[-1] == "k"
      return -num-0.5
    else
      raise GlickoError, "Rank must end with d/k"
    end
  end

  def self.validate(player)
    rating = Rating.new_aga(player.rating)
    rating = Rating.new(player.rating)
    raise GlickoError, "Rating less than 35k" if rating.aga <= -36.0
    raise GlickoError, "Rating more than 12d" if rating.aga >= 13.0
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
