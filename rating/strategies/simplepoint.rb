module SimplePoint 

  INITIAL_RATING = 0

  def self.win_probability(rating_a, rating_b)
    return rating_a / (rating_a + rating_b)
  end

  def self.add_result(input, players)
    raise "Invalid arguments #{input}" unless input[:white_player] && input[:black_player] && input[:winner]
    if(input[:winner]=="W")
      players.call(input[:white_player]).rating += 1
      players.call(input[:black_player]).rating -= 1
    else
      players.call(input[:black_player]).rating += 1
      players.call(input[:white_player]).rating -= 1
    end
  end

  def self.rank(player)
    return "kyu" if player.rating < 20
    return "dan" if player.rating.between?(20,40)
    return "pro" if player.rating > 40
  end

end

