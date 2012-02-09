class NewTournamentType < ActiveRecord::Migration
  def self.up
    #handle inheritance
    add_column :tournaments, :type, :string
    #mcmahon, swiss
    add_column :tournaments, :rounds_count, :integer, :default => 5
    add_column :tournaments, :allow_handicap, :boolean, :default => false    
  end

  def self.down
    remove_column :tournaments, :type
    remove_column :tournaments, :rounds_count
    remove_column :tournaments, :allow_handicap
  end
end
