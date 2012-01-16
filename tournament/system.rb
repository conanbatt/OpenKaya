
class Game
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
  end

end


