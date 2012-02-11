require 'sqlite3'
require 'active_record'
require 'logger'


DB_NAME = "../db/tournament.db"
DB_OBJECT = SQLite3::Database.new(DB_NAME)
ActiveRecord::Base.establish_connection(:adapter => 'sqlite3', :database => DB_NAME, :pool => 5, :timeout => 5000)
ActiveRecord::Base.logger = Logger.new(File.open('../db/database.log', 'a'))

require "./tournaments"

use Rack::ShowExceptions

run Cuba
