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

  def initialize(strategy, should_validate=false)
    @strategy = strategy
    @validate = should_validate
    @players = {}
  end

  def add_result(input)
    white = input[:white_player]
    black = input[:black_player]

    # fetch_or_create creates the player if it doesnt exist. It is implemented that way so when i include a rating system, i will only have
    # to change how the players information is accessed (Internal model, DB, etc).
    # TODO: remove this initialization.
    for player in [white, black] do
      players[player] = Player.new(player, @strategy::INITIAL_RATING) unless players[player] #fetch_or_create creates the player if it doesnt exist
    end
    strategy.add_result(input, fetch_or_create)
    if @validate
      @strategy.validate(players[white].rating)
      @strategy.validate(players[black].rating)
    end
  end

  def fetch_or_create
    ->(id) { players[id] || players[id] = Player.new(id, @strategy::INITIAL_RATING) }
  end

  def results_to_file(time="")
    File.open("Rating_results_#{@strategy}.txt", 'w') do |f|
      f.write("Benchmark results(seconds) : #{time}\n")
      @players.values.each do |player|
        line = "#{player.id} rating: #{player.rating} rank: #{@strategy.rank(player)}\n"
        f.write(line)
      end
    end 
  end

end


