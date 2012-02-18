class RemoveIpCreateTournamentPlayer < ActiveRecord::Migration
  def self.up
    remove_column :players, :ip
    drop_table :players_tournaments
    create_table :tournament_players do |t|
      t.column :player_id, :integer, :null => false
      t.column :tournament_id, :integer, :null => false
      t.column :seed, :integer, :default => 0
      t.column :team, :integer, :default => nil
    end
  end

  def self.down
    add_column  :players, :ip, :string, :null => false
    drop_table :tournament_players
    create_table :players_tournaments do |t|
      t.column :tournament_id, :integer
      t.column :player_id, :integer     
    end
  end
end
