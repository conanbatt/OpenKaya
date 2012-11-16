class GTP

  attr_accessor :size

  def self.run(bot_type, &command)
    
    if bot_type == 'gnugo'
      new(IO.popen("gnugo --mode gtp", "r+"), &command)
    elsif bot_type == 'fuego'
      new(IO.popen("fuego", "r+"), &command)
    else
      ## All falls here to accept commands from the yaml directly 
      new(IO.popen(bot_type, "r+"), &command) 
    end
  end

  def initialize(io)
    @io = io
    @size = 19
    if block_given?
      begin
        yield self
      ensure
        quit
      end
    end
  end

  def quit
    send_command(:quit)
    @io.close
  end

  def protocol_version
    send_command(:protocol_version)
  end

  def genmove(color)
    send_command(:genmove, color)
  end

  def loadsgf(path)
    send_command(:loadsgf, path)
  end

  def score(path)
    send_command(:score, "aftermath", path)
  end

  def list_stones(color)
    @io.puts [:list_stones, color].join(" ")
    return self.clean_gtp_response
  end

  def final_score()
    @io.puts [:final_score]
    return self.clean_gtp_response
  end

  def list_dead_stones()
    @io.puts [:final_status_list, "dead"].join(" ")
    return self.clean_gtp_response
  end

  def clean_gtp_response()
    response = @io.take_while { |line| line != "\n" }.join(" ")
    return response.sub(/^=\s+/, "")
  end

  def send_command(command, *arguments)
    @io.puts [command, *arguments].join(" ")
    result = @io.take_while { |line| line != "\n" }.join

    rc = result.scan(/^=\s[a-zA-Z]*[0-9]*$/)
    if rc.first.nil?
      return rc
    else
      return rc.first.sub(/^=\s/, "").sub(/\n/, "")
    end
  end

  def ai_move(color,size)
    re = genmove color
    $stdout.puts "Bot generated #{re}"
    move = convert_move(re,size)

    return move
  end

  SGF_FILE_PATH = "bot_games/"

  def load_from_sgf(game_id, game_sgf)
    if Dir[SGF_FILE_PATH].empty?
      Dir.mkdir(SGF_FILE_PATH)
    end

    filepath = SGF_FILE_PATH + "#{game_id}.sgf"
    File.open(filepath, "w") do |f|
      f.write game_sgf
    end
    loadsgf filepath

    #File.delete(filepath)
  end


end

## ASYNCHRONOUS RUNNING (For multi gaming the same process)

def score_game(game_id, game_sgf)

  re = nil
  dead_stones = ""

  GTP.run(@bot) do |gtp|
    gtp.load_from_sgf(game_id, game_sgf)
    dead_stones = gtp.list_dead_stones
    re = gtp.final_score
  end

  $stdout.puts "dead stones are #{dead_stones}"

  return {:score => re, :dead_stones => dead_stones}
end

#switches GTP move into sgf-like coordinate
def convert_move(move, size=19)
  if move.downcase == "pass"
    return 'pass'
  elsif move.downcase == "resign"
    return 'resign'
  else

    alphabet = "ABCDEFGHIJKLMNOPQRS"[0..size.to_i - 1]
	  	
    sgf_alphabet = "ABCDEFGHJKLMNOPQRST"[0..size.to_i - 1]
	  	
    return alphabet["ABCDEFGHJKLMNOPQRST".index(move[0])].downcase + alphabet.reverse[(move[1].to_s + move[2].to_s).to_i - 1].downcase
  end
end
