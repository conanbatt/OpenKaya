Dir[File.dirname(__FILE__) + "/tournament_systems/*.rb"].each {|file| require file }

class Player
  attr_accessor :rank,:name
end

class Organizer

  def self.create_tournament(tournament, players)
    raise "Invalid tournament system" unless Kernel.const_defined?(tournament)
    tournament = Kernel.const_get(tournament)
    tournament.new(players)
  end

  



end
