class CreatePlayers < ActiveRecord::Migration
  def self.up
    create_table :players do |t|
      t.column :name, :string, :null => false
      t.column :ip, :string, :null => false
      t.column :rank, :string, :null => false
    end
  end

  def self.down
    drop_table :players
  end
end
