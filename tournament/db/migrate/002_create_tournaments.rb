class CreateTournaments < ActiveRecord::Migration
  def self.up
    create_table :tournaments do |t|
      t.column :name, :string
      t.column :organizer, :integer
    end
    create_table :rounds do |t|
      t.column :tournament_id, :integer
      t.column :start_time, :datetime
      t.column :end_time, :datetime
    end
    create_table :pairings do |t|
      t.column :round_id, :integer
      t.column :white_player_id, :integer
      t.column :black_player_id, :integer
      t.column :handicap, :integer
      t.column :result, :string
    end
    create_table :players_tournaments do |t|
      t.column :tournament_id, :integer
      t.column :player_id, :integer     
    end
  end

  def self.down
    drop_table :tournaments
    drop_table :rounds
    drop_table :pairings
    drop_table :players_tournaments
  end
end
