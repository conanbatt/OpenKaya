require 'rubygems'
require 'mechanize'
require 'json'

class KayaBot

  PLAY_URL = "/game/play"
  OPEN_GAME_URL = "/bot/open_game"
  RESIGN_URL = "/game/resign"

  attr_accessor :challenger, :status, :move

  def initialize(server_url, bot_class)
    @server_url = server_url
    @agent = Mechanize.new
    @status
    @bot = bot_class.new
  end

  
  #connect to server
  #open game(unify to previous action?)
  #read bot_url every time_lapse seconds
    #parse and pass to bot
    #read response and post

  def connect
    page = @agent.get(@server_url+ "/login.html")
    listener_loop
  end

  TIME_LAPSE = 10

  def listener_loop
    while (true) do
      fetch_and_parse_data
      open_game if @status=="connected"
      post_move if @move 
      sleep TIME_LAPSE #lets not explode in requests
    end
  end

  def fetch_and_parse_data
     page = @agent.get(@server_url + "/bot/status.html")
     json = JSON.parse(page.body)
     @status = json["status"]
     @move = json["move"]
  end

  def open_game
    @agent.post(@server_url+ OPEN_GAME_URL, 
                 :challenger => challenger)
  end

  def post_move
    @agent.post(@server_url+ PLAY_URL,
                  :move => @bot.input(@move))
  end
  def resign
    @agent.post(@server_url+ RESIGN_URL)
  end

end

