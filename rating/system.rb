class Player

  attr_accessor :rd, :time_last_played
  attr_reader :rating, :id
  attr_writer :rating

  def initialize(id,rating=0)
    @rating = rating
    @id = id
  end
end

class System

  attr_accessor :players,:strategy

  def initialize(strategy, should_validate=false)
    @strategy = strategy
    @validate = should_validate
    @players = {}
  end

  def add_result(input)
    white = input[:white_player]
    black = input[:black_player]

    strategy.add_result(input, fetch_or_create)
    if @validate
      @strategy.validate(players[white])
      @strategy.validate(players[black])
    end
  end

  def fetch_or_create
    ->(id) { players[id] || players[id] = Player.new(id, @strategy::INITIAL_RATING) }
  end

  def results_to_file(time="")
    File.open("Rating_results_#{@strategy}.txt", 'w') do |f|
      f.write("Benchmark results(seconds) : #{time}\n")
      @players.values.each do |player|
        line = "#{player.id} rating: #{player.rating} rank: #{@strategy.rank(player.rating)}\n"
        f.write(line)
      end
    end 
  end
  
  
  def compared_results_to_file(real_players, time="")
    File.open("Compared_Rating_results_#{@strategy}.txt", 'w') do |f|
      f.write("Benchmark results(seconds) : #{time}\n")
      real_players.each do |player|
        system_player = fetch_or_create[player[:id]]
        line = "#{player[:id]}  system_rating: #{system_player.rating} system_rank: #{@strategy.rank(system_player.rating)} real_rating: #{player[:rating]} real_rank: #{player[:rank]} played_games: #{player[:played_games]} winning_ratio: #{(100.0 * player[:winning_ratio]).to_i}%\n"
        f.write(line)  
      end
    end 
  end

end


