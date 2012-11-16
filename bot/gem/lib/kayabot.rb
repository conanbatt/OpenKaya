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

  attr_accessor :gtp_controller, :server_data

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

    @rebuild_sgf = config["rebuild_sgf"] != "false"

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
        connect
        fetch_and_parse_data
        open_game if @server_data.status=="connected" || @server_data.status=="finished"
        post_score if @server_data.status=="scoring"
        post_move if @server_data.bots_turn && @server_data.status=="playing"
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
     @server_data = ServerData.new(page.body)
     page.body
  end

  def open_game
    @gtp_controller = nil #clearing up the bot process
    res = @agent.post(@server_url+ OPEN_GAME_URL, game_configuration)
    p res.body
  end

  def post_move

    bot_move = ai_move

    #TODO should insert master node . Need handi/komi
    #bot_move = ai_move("temp",sgf_content, @color)
    if (bot_move == "resign")
      resign
    else
      color_short = (@server_data.next_play_color =="black" ? "B" : "W")
      bot_move = "" if bot_move == "pass"
      bot_move = ";#{color_short}[#{bot_move}]#{color_short}L[#{(25*60) - ((@server_data.move_list && !@server_data.move_list.empty?) ? @server_data.move_list.count(";") : 1)}.000]"
      @agent.post(@server_url+ PLAY_URL,
                  :move => bot_move)
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
    result = score_game("#{@server_data.id}", @server_data.sgf_content)
    $stdout.puts result
    res = @agent.post(@server_url+ SCORE_URL, {:score => parse_result_from_bot(result[:score]), :dead_stones => result[:dead_stones]})
    res.body
  end

  def post_error(title,exception_message="Unavailable")
    return
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

  def ai_move
    if @rebuild_sgf
      GTP.run(@bot) do |gtp| 
        gtp.load_from_sgf("#{@server_data.id}.sgf", @server_data.sgf_content)
        gtp.size = @server_data.board_size
        return gtp.ai_move(@server_data.next_play_color, @server_data.board_size)
      end
    else
      if @gtp_controller
        color = @server_data.next_play_color == "W" ? "B" : "W"
        @gtp_controller.send_command(:play, color, @server_data.last_move)
      else
        @gtp_controller = GTP.run(@bot)
        @gtp_controller.size = @server_data.board_size
        @gtp_controller.load_from_sgf("#{@server_data.id}.sgf",@server_data.sgf_content)
      end
      return @gtp_controller.ai_move(@server_data.next_play_color, @server_data.board_size)
    end

  end

end

class ServerData

  attr_reader :last_move, :sgf, :status,:move_list,:bots_turn,:next_play_color, :master_node, :id

  def initialize(json_data)
     json = JSON.parse(json_data)

     $stdout.puts json

     @id = json["id"]
     @status = json["status"]
     @move_list = json["moves"]
     @bots_turn = json["bot_play?"]
     @last_move = json["last_move"]
     @next_play_color = json["next"]
     @master_node = json["sgf_master_node"]
  end

  def sgf_content
    return "(#{master_node}#{move_list})"
  end

  def board_size
    master_node.match(/SZ\[(\d+)\]/)[1]
  end

end
