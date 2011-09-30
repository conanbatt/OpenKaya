require 'cutest'
require File.expand_path("../kaya_bot", File.dirname(__FILE__))

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
  assert @kaya_bot.challenger == "danigabi"
  assert @kaya_bot.move == "B[aa]"
end
