require 'rubygems'
require 'mechanize'

require 'json'
#agent = Mechanize.new

class KayaBot

  attr_accessor :challenger, :status, :move

  def initialize(server_url, bot_class)
    @server_url = server_url
    @agent = Mechanize.new
    @status
    @bot = bot_class.new
  end

  
  #connect to server
  #open game(same action as before? )
  #check for challenge every time_lapse seconds
  #accept
  #read bot_url every time_lapse seconds
    #parse and pass to bot
    #read response and post

  def connect
    page = @agent.get(@server_url+ "/login.html")
    #status_page = page.links[0].click
    listener_loop
  end

  TIME_LAPSE = 10

  def listener_loop
    while (true) do
      fetch_and_parse_data
      accept_challenge(@challenger) if @challenger && @status=="connected"
      post_move if @move 
      sleep TIME_LAPSE #lets not explode in requests
    end
  end

  def fetch_and_parse_data
     page = @agent.get(@server_url + "/status.html")
     json = JSON.parse(page.body)
     @status = json["status"]
     @challenger = json["challenger"]
     @move = json["move"]
  end

  def accept_challenge(challenger)
    @agent.post(@server_url+ "/accept.html", 
                 :challenger => challenger)
  end

  def post_move
    @agent.post(@server_url+ "/play",
                  :move => @bot.input(@move))
  end

end

class RandoBot
  def input(move)
    return [random_letter,random_letter]
    #%x[command computer to play]
  end

  def random_letter
    (rand(19)+97).chr
  end
end

