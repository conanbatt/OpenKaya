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
  CLOSE_GAME_URL = "/bot/close_game"
  ERROR_REPORT_URL = "/bot/error"
  VERSION =  Gem::Specification.find_by_name("kayabot").version.to_s

  OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

  attr_accessor :challenger, :status, :move

  def initialize(config)
    p config
    @server_url = config["url"]
    @user = config["user"]
    @pass = config["pass"]
    @size = config["size"]
    @title = config["title"]
    @bot = config["bot"]
    @agent = Mechanize.new
    @agent.max_history = 2
    @error_limit = 3
    @loop_reading = 50
  end

  def game_configuration
     {:title => @title || "Come at me bro", :size => @size || 19}
  end

  def connect
    return if @agent.cookies.last && @agent.cookies.last.name == "rack.session"
    page = @agent.post(@server_url+ "/session/create", {:id => @user, :password => @pass})
    page.body
  end

  TIME_LAPSE = 4

  def listener_loop
    begin
      while (true) do
        $stdout.puts GC::Profiler.report
        connect
        fetch_and_parse_data
        open_game if @status=="connected" || @status=="finished"
        post_score if @status=="scoring"
        post_move if @bots_turn && @status=="playing"
        sleep TIME_LAPSE #lets not explode in requests
      end
    rescue SystemExit, Interrupt
      close_game
      raise
    rescue Exception => e
      $stderr.puts "There was an error. Will try to run again. If problems persist, contact Kaya at info@kaya.gs"
      $stderr.puts e
      $stderr.puts e.backtrace[0]
      btrace = "" 
      e.backtrace.each {|line| btrace < "\n#{line}"}
      post_error(e.to_s,btrace)
      sleep 5
      listener_loop
    end
  end

  def fetch_and_parse_data
     page = @agent.get(@server_url + "/bot/status", {:version => VERSION })
     json = JSON.parse(page.body)
     $stdout.puts json
     @status = json["status"]
     @move = json["moves"]
     @bots_turn = json["bot_play?"]
     @color = json["next"]
     @master_node = json["sgf_master_node"]
     page.body
  end

  def open_game
    res = @agent.post(@server_url+ OPEN_GAME_URL, game_configuration)
    p res.body
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
      @move = nil
    end
  end
  def resign
    $stdout.puts (@agent.post(@server_url+ RESIGN_URL, {:result => "resign"}).body)
  end
  def close_game
    res = @agent.post(@server_url + CLOSE_GAME_URL)
    $stdout.puts res.body
  end

  def post_score
    result = score_game("temp", sgf_content)
    $stdout.puts result
    res = @agent.post(@server_url+ SCORE_URL, {:score => parse_result_from_bot(result[:score]), :dead_stones => result[:dead_stones]})
    res.body
  end

  def post_error(title,exception_message="Unavailable")
    if @error_limit > 0
      exception_message = "Unavailable" if exception_message.empty?
      res = @agent.post(@server_url + ERROR_REPORT_URL, {:title=> title, :content => exception_message})
      $stdout.puts res.body
      @error_limit -= 1
    else
      $stdout.puts "Error report limit passed."
    end
  end

  #Black wins by 61.5 points
  def parse_result_from_bot(result)
    color = result[0].chr
    points = result.match(/\d{0,3}\.\d/)[0]
    return "#{color}+#{points}"
  end

  def sgf_content
    sgf = SGF.new
    sgf.add_move(@move) if @move
    return "(#{@master_node}#{sgf.move_list})"
  end

end
