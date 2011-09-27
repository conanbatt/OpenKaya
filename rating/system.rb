class Player

  attr_reader :rating, :id
  attr_writer :rating

  def initialize(id,rating)
    @rating = rating
    @id = id
  end

end

class System

  attr_accessor :players,:strategy

  def initialize(strategy)
    @strategy = strategy
    @players = {}
  end

  def add_result(input)
    white = input[:white_player]
    black = input[:black_player]
    for player in [white, black] do
      players[player] = Player.new(player, @strategy::INITIAL_RATING) if not players[player]
    end
    strategy.add_result(input, fetch_or_create) 
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

end


