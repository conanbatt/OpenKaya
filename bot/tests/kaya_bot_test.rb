require 'cutest'
require File.expand_path("../kaya_bot", File.dirname(__FILE__))
require File.expand_path("../bots/rando_bot", File.dirname(__FILE__))
require File.expand_path("../bots/replay_bot", File.dirname(__FILE__))

require 'ruby-debug'
MOCK_SERVER_URL = "file:///home/conanbatt/Kaya.gs/OpenKaya/bot/tests"
#"login.html"

@kaya_bot = KayaBot.new(MOCK_SERVER_URL, RandoBot)

test "should connect to the server" do
#  @kaya_bot.connect
end

test "should fetch and parse data" do
  @kaya_bot.fetch_and_parse_data
  assert @kaya_bot.status == "connected"
  assert @kaya_bot.move == ";B[aa]"
end

test "should give me the correct move according to the order" do

  replay_bot = ReplayBot.new
  sgf = SGF.new
  sgf.move_list = ";B[aa];W[bb];B[cc];W[dd]" 
  replay_bot.sgf = sgf

  assert_equal replay_bot.input, ";B[aa]"
  assert_equal replay_bot.move_number, 1
  assert_equal replay_bot.input, ";W[bb]"
  assert_equal replay_bot.move_number, 2
  assert_equal replay_bot.input, ";B[cc]"
  assert_equal replay_bot.move_number, 3

end
