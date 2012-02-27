require 'active_record'
require 'sqlite3'
require 'logger'

task :default => :migrate

desc "Migrate the database through scripts in db/migrate. Target specific version with VERSION=x"
task :migrate => :environment do
  ActiveRecord::Migrator.migrate('db/migrate', ENV["VERSION"] ? ENV["VERSION"].to_i : nil )
end

task :environment do
  DB_NAME = "db/tournament.db"
  DB_OBJECT = SQLite3::Database.new(DB_NAME)
  ActiveRecord::Base.establish_connection(:adapter => 'sqlite3', :database => DB_NAME)
  ActiveRecord::Base.logger = Logger.new(File.open('db/database.log', 'a'))
end

