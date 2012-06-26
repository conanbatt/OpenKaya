require File.expand_path("sgf", File.dirname(__FILE__))
require 'rubygems'
require 'mechanize'
require 'json'
require 'yaml'
$0='kayabot'

class KayaBot

  PLAY_URL = "/bot/play"
  OPEN_GAME_URL = "/bot/open_game"
  RESIGN_URL = "/bot/resign"
  SCORE_URL = "/bot/score"
  VERSION = "0.1.1"#Gem::Specification.find_by_name("kayabot").version.to_s

  attr_accessor :challenger, :status, :move

  def initialize(config)
    p config
    @server_url = config["url"]
    @user = config["user"]
    @pass = config["pass"]
    @size = config["size"]
    @title = config["title"]
    @agent = Mechanize.new
    @status
    @sgf
  end

  def game_configuration
     {:title => @title || "Come at me bro", :size => @size || 19}
  end

  def connect
    return if @agent.cookies.last && @agent.cookies.last.name == "kaya.session"
    page = @agent.post(@server_url+ "/session/create", {:id => @user, :password => @pass})
  end

  TIME_LAPSE = 4

  def listener_loop
    while (true) do
      connect
      fetch_and_parse_data
      open_game if @status=="connected" || @status=="finished"
      post_score if @status=="scoring"
      post_move if @bots_turn && @status=="playing"
      sleep TIME_LAPSE #lets not explode in requests
    end
  end

  def fetch_and_parse_data
     page = @agent.get(@server_url + "/bot/status", {:version => VERSION })
     json = JSON.parse(page.body)
     p json
     @status = json["status"]
     @move = json["moves"]
     @bots_turn = json["bot_play?"]
     @color = json["next"]
     @master_node = json["sgf_master_node"]
  end

  def open_game
    @agent.post(@server_url+ OPEN_GAME_URL, game_configuration)
  end
  def post_move
    #TODO should insert master node . Need handi/komi
    bot_move = ai_move("temp",sgf_content, @color)
    if (bot_move == "resign")
      resign
    else
      color_short = (@color=="black" ? "B" : "W")
      bot_move = "" if bot_move == "pass"
      bot_move = ";#{color_short}[#{bot_move}]#{color_short}L[#{(25*60) - (@move ? @move.count(";") : 1)}]"
      @agent.post(@server_url+ PLAY_URL,
                  :move => bot_move)
      #@sgf.add_move(bot_move)
      @move = nil
    end
  end
  def resign
    @agent.post(@server_url+ RESIGN_URL, {:result => "resign"})
  end

  def post_score
    result = score_game("temp", sgf_content)
    p result
    @agent.post(@server_url+ SCORE_URL, {:score => parse_result_from_bot(result[:score]), :dead_stones => result[:dead_stones]})
  end
  #Black wins by 61.5 points
  def parse_result_from_bot(result)
    color = result[0].chr
    points = result.match(/\d{0,3}\.\d/)[0]
    return "#{color}+#{points}"
  end

  def sgf_content
    @sgf = SGF.new
    @sgf.add_move(@move) if @move
    return "(#{@master_node}#{@sgf.move_list})"
  end

end
