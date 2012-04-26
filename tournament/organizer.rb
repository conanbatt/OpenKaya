Dir[File.dirname(__FILE__) + "/tournament_systems/*.rb"].each {|file| require file }
Dir[File.dirname(__FILE__) + "/league_systems/*.rb"].each {|file| require file }
require 'active_record'

#Same as Player Class, but to be used with leagues system (persistency not yet implemented)
class PlayerNotAR
  attr_accessor :rank,:name,:ip
  def initialize(name, ip, rank)
    raise "invalid player" unless name && ip
    @name = name 
    @ip = ip
    @rank = rank
  end
end

class Player < ActiveRecord::Base
  has_and_belongs_to_many :tournaments
  validates_uniqueness_of :name 
end

class Organizer
  def self.create_tournament(tournament, *rest)
    raise "Invalid tournament system" unless Kernel.const_defined?(tournament)
    tournament = Kernel.const_get(tournament)
    new_tournament = tournament.new(*rest)
    new_tournament.save
    new_tournament
  end
  
  def self.create_league(league, *rest)
    raise "Invalid league system" unless Kernel.const_defined?(league)
    league = Kernel.const_get(league)
    league.new(*rest)
  end
end
