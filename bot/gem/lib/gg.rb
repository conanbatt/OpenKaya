class GTP

  def self.run(bot_type, &command)
    if bot_type == 'gnugo'
      new(IO.popen("gnugo --mode gtp", "r+"), &command)
    elsif bot_type == 'fuego'
      raise "not supported yet"
#      new(IO.popen("fuego --config #{RAILS_ROOT}/public/fuego.gtp", "r+"), &command)
    end
  end

  def initialize(io)
    @io = io

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
end

SGF_FILE_PATH = "gnugo_games/"

def score_game(game_id, game_sgf)
  re = nil
  if not Dir.exists?(SGF_FILE_PATH)
    Dir.mkdir(SGF_FILE_PATH)
  end
  filepath = SGF_FILE_PATH + "#{game_id}.sgf"
  File.open(filepath, "w") do |f|
    f.write game_sgf
  end

  IO.popen("gnugo --score aftermath #{filepath}") do |f|
    re = f.read
  end
  dead_stones = ""
  GTP.run("gnugo") do |gtp|
    gtp.loadsgf filepath
    dead_stones = gtp.list_dead_stones
  end

  p dead_stones

  File.delete(filepath)
  return {:score => re, :dead_stones => dead_stones}
end

# return a move coordinates, such as "c17", or "PASS", or "resign"
def ai_move(game_id, game_sgf, color)

  re = nil
  if not Dir.exists?(SGF_FILE_PATH)
    Dir.mkdir(SGF_FILE_PATH)
  end
  filepath = SGF_FILE_PATH + "#{game_id}.sgf"
  File.open(filepath, "w") do |f|
    f.write game_sgf
  end

  #why this?
  if color == 'black' || color == 'white'
    game_bot = 'gnugo'
  end
  size = 19
  GTP.run(game_bot) do |gtp|
    gtp.loadsgf filepath
    size = gtp.send_command(:query_boardsize)
    re = gtp.genmove color
  end
  p re
  p size
  move = convert_move(re,size)

  File.delete(filepath)
  return move
end

#switches GTP move into sgf-like coordinate
def convert_move(move, size=19)
  if move == "PASS"
    return 'pass'
  elsif move == "resign"
    return 'resign'
  else
    alphabet = "ABCDEFGHIJKLMNOPQRS"[0..size.to_i - 1]
    sgf_alphabet = "ABCDEFGHJKLMNOPQRST"[0..size.to_i - 1]
    return alphabet["ABCDEFGHJKLMNOPQRST".index(move[0])].downcase + alphabet.reverse[(move[1].to_s + move[2].to_s).to_i - 1].downcase
  end
end

