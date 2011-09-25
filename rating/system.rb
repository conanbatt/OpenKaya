class Player

  attr_accessor :rating, :id

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


