require 'cutest'
require 'sqlite3'
require 'active_record'
require 'logger'
require File.expand_path("../organizer", File.dirname(__FILE__))

Dir[File.dirname(__FILE__) + "/tournament_systems/*.rb"].each {|file| require file }
Dir[File.dirname(__FILE__) + "/league_systems/*.rb"].each {|file| require file }

DB_NAME = "../db/tournament.db"
DB_OBJECT = SQLite3::Database.new(DB_NAME)
ActiveRecord::Base.establish_connection(:adapter => 'sqlite3', :database => DB_NAME, :pool => 5, :timeout => 5000)
ActiveRecord::Base.logger = Logger.new(File.open('../db/database.log', 'a'))

def spawn_player_list(number)
  list =[]
  number.times do 
    player = Player.new({:name => rand(8**4).to_s, :rank => "1k"})
    player.save
    list << player
  end
  list
end

def mock_results(tournament)
  tournament.pairings.each do |pairing|
    if pairing.result.nil?
      tournament.add_result(pairing.white_player, pairing.black_player, "W+R")
    end
  end
end

# ==  0 if same rank
# ==  1 if a rank is better than b rank
# == -1 if b rank is better than a rank
def compare_ranks(rank_a, rank_b)
   
    if rank_a == rank_b
        return 0
    end
    
    if rank_a[-1,1] == "k" and rank_b[-1,1] == "d"
        return -1
    end
    
    if rank_b[-1,1] == "k" and rank_a[-1,1] == "d"
        return 1
    end
    
    if rank_a[-1,1] == "k" 
        return (rank_a[0, rank_a.length-1].to_i < rank_b[0, rank_b.length-1].to_i) ? 1 : -1
    end
    
    if rank_a[-1,1] == "d"
        return (rank_a[0, rank_a.length-1].to_i > rank_b[0, rank_b.length-1].to_i) ? 1 : -1
    end
end

def mock_results_based_on_rank(tournament)
  tournament.pairings.each do |pairing|
    #already got a result through another mean? don't change it!
    if pairing.result.nil?
        if compare_ranks(pairing.white_player.rank, pairing.black_player.rank) > 0
            tournament.add_result(pairing.white_player, pairing.black_player, "W+R")
        else
            tournament.add_result(pairing.white_player, pairing.black_player, "B+R")
        end
    end
  end
end

def mock_league_results_based_on_rank(league)
  league.groups.each do |g|
    g.players.shuffle.each do |player_a|
      g.players.shuffle.each do |player_b|
        if player_a != player_b
          if compare_ranks(player_b.rank, player_a.rank) > 0
              league.add_result(player_b, player_a, "W+R")
          else
              league.add_result(player_b, player_a, "B+R")
          end
        end
      end
    end
  end  
end
  