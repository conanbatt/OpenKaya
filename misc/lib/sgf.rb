class SGF

  BLACK = "B"
  WHITE = "W"
  attr_accessor :move_list, :comment_buffer,:property

  def initialize(moves="", properties={})
    moves ||= ""
    @move_list = []
    @config = ConfigNode.new
    nodify_move_list(moves) unless moves.empty?
    @comment_buffer = ""
    @size = properties[:size]
    properties.keys.each {|k| @config.write_property(k,properties[k]) }
     
  end

  def last_two_moves_are_pass?
    if @move_list.count >= 2
      return @move_list.last.pass_node? && @move_list[@move_list.count-2].pass_node?
    end
  end

  def nodify_move_list(moves)
    moves.split(";").each do |txt|
      add_move(";"+txt) unless txt.empty?
    end
  end

  def add_move(node) #TODO objetify node
    @move_list << Node.new(node)
    move_list
  end

  def last_play_color
    @move_list.last && @move_list.last.color
  end

  def add_comment(comment)
    if @move_list.empty?
      @config.add_comment(comment)
    else
      @move_list.last.add_comment(comment)
    end
    move_list
  end
  #takes a hash and inputs the contents into the nodes
  def parse_comments!(comments)
    comments.each do |key, value|
      if (key.to_i == 0)
        value.each {|v| @config.add_comment(hash_to_comment(v))}
        next
      end
      value.each{|v| @move_list[key.to_i - 1].add_comment(hash_to_comment(v))}
    end
  end

  def hash_to_comment(hash)
    raise "invalid hash" unless hash["user"] && hash["rank"] && hash["message"]
    "#{hash["user"]}#{hash["rank"]}: #{hash["message"]}"
  end
    
  def move_list
    buffer = ""
    @move_list.each {|node| buffer += node.node_text}
    buffer
  end

  def move_list_with_comments
    buffer = ""
    @move_list.each {|node| buffer += node.to_s}
    buffer
  end


  def move_by_number(index)
    @move_list[index].to_s unless index < 0 || index > @move_list.length - 1
  end

    #light validation to make sure the input is not totally bs. only makes sure the coordinate is in the board
  def validate_coordinate(x, y)
    lower_boundary = 97
    upper_boundary = 97+ @size.to_i
    valid_y_axis = y.bytes.first <= upper_boundary && y.bytes.first >= lower_boundary
    valid_x_axis = x.bytes.first <= upper_boundary && x.bytes.first >= lower_boundary
    throw "Invalid coordinate #{x},#{y}" unless valid_y_axis && valid_x_axis
  end

  def validate_node_format(node)
    valid = node.match(/;[BW]\[(|[a-z][a-z])\]/)
    if node.include?("BL") || node.include?("WL")
      valid = valid && node.match(/[BW]L\[\d{0,6}.\d{3}\]/)
    end
    raise "#{node} is invalid node format" unless valid
  end

  def load_file(filename)
    File.open(filename, 'r') do |file|
      while (line = file.gets)
        load_from_string(line)
      end
    end
  end
  def load_from_string(input)
    properties= input.split(";")[1]
    @config = ConfigNode.new(properties) #will process this later
    nodify_move_list(input.gsub(properties, "").chomp[2..-2])
  end

  def properties
    @config.to_s
  end

  def properties=(arg)
    @config.node_text = arg 
  end

  def property(symbol)
    @config.property(symbol)
  end

  def write_property(symbol, value)
    @config.write_property(symbol, value)
  end

  def to_s
    "(#{@config.to_s}#{move_list_with_comments})"
  end

  def time_left(player)
    raise "Invalid input #{player}. W or B expected" unless player == "B" || player == "W"
    ln = last_node_by_player(player)
    ln && ln.time_left
  end

  def add_time(player,time)
    ln = last_node_by_player(player)
    ln.time_left= (ln.time_left + time)
  end

  def last_node_by_player(player)
    if @move_list.last && @move_list.last.color == player
      return @move_list.last
    elsif @move_list.size >= 2
      second_last =  @move_list[@move_list.count -2]
      return second_last
    end 
  end

  def undo
    @move_list.pop
  end

  def self.handi_node(size,handicap)
    case size

    when 19
      case handicap
      when 2
        return "HA[2]AB[dd][pp]"
      when 3
        return "HA[3]AB[dd][dp][pd]"
      when 4
        return "HA[4]AB[dd][pd][dp][pp]"
      when 5
        return "HA[5]AB[dd][pd][dp][pp][jj]"
      when 6
        return "HA[6]AB[dd][pd][dp][pp][dj][pj]"
      when 7
        return "HA[7]AB[dd][pd][dp][pp][dj][pj][jj]"
      when 8
        return "HA[8]AB[dd][jd][pd][dj][pj][dp][jp][pp]"
      when 9
        return "HA[9]AB[dd][jd][pd][dj][jj][pj][dp][jp][pp]"
      else
        raise "Invalid handicap setting #{handicap}"
      end
    when 13
      case handicap
      when 2
        return "HA[2]AB[dd][jj]"
      when 3
        return "HA[3]AB[dd][dj][jd]"
      when 4
        return "HA[4]AB[dd][jd][dj][jj]"
      when 5
        return "HA[5]AB[dd][jd][dj][gg][jj]"
      when 6
        return "HA[6]AB[dd][jd][dj][jj][dg][jg]"
      when 7
        return "HA[7]AB[dd][jd][dj][jj][dg][jg][gg]"
      when 8
        return "HA[8]AB[dd][jd][dj][gj][jj][jg][gd][dg]"
      when 9
        return "HA[9]AB[dd][jd][dj][gj][jj][jg][gg][gd][dg]"
      else
        raise "Invalid handicap setting #{handicap}"
      end
    when 9
      case handicap
      when 2
        return "HA[2]AB[cc][gg]"
      when 3
        return "HA[3]AB[cc][cg][gg]"
      when 4
        return "HA[4]AB[cc][gg][cg][gc]"
      when 5
        return "HA[5]AB[cc][gg][cg][gc][ee]"
      when 6
        return "HA[6]AB[cc][gg][cg][gc][ee][ge]"
      when 7
        return "HA[7]AB[cc][gg][cg][gc][ee][ge][ee]"
      when 8
        return "HA[8]AB[cc][gc][cg][gg][ce][ge][ec][eg]"
      when 9
        return "HA[9]AB[cc][gc][cg][gg][ce][ge][ec][ee][eg]"
      else
        raise "Invalid handicap setting #{handicap}"
      end
    end
  raise "Invalid handicap setting Size: #{size} and  handicap #{handicap}"
  end
end


class Node

  attr_reader :node_text

  def initialize(node_text= "")
    validate_node_format(node_text)
    @node_text = node_text
    @comments = []
  end

  def to_s
    comment_node = comments.empty? ? "" : "C[#{comments.gsub("]","\\]").gsub(")","\\)")}]"
    node_text + comment_node
  end

  def add_comment(comment)
    @comments << comment + " "
  end
  def comments
    buffer = ""
    @comments.each{|c| buffer += c}
    buffer
  end

  def color
    @node_text[1]
  end

  def x
    @node_text[3] unless pass_node?
  end
  def y
    @node_text[4] unless pass_node?
  end
  def coordinate
    x+y
  end
  def pass_node?
    @node_text.match(/[BW]\[\]/)
  end

  def validate_node_format(node)
    valid = node.match(/;[BW]\[(|[a-z][a-z])\]/)
    if node.include?("BL") || node.include?("WL")
      valid = valid && node.match(/[BW]L\[\d{0,6}.\d{3}\]/)
    end
    raise "#{node} is invalid node format" unless valid
  end

  def time_left
    @node_text.match(/[#{color}]L\[\d{0,6}.\d{3}\]/).to_s[3..-2].to_f
  end
  def time_left=(time_left)
    @node_text.gsub!(/[#{color}]L\[\d{0,6}.\d{3}\]/, "#{color}L[%.3f]" % [time_left])
  end


end

class ConfigNode

  attr_accessor :node_text

  def initialize(property="")
    @node_text = property.dup
    write_property(:file_format,4)
    @comments = []
  end

  def validate_node_format
    return true
  end

  def add_comment(comment)
    @comments << (comment + " ")
  end
  def comments
    buffer = ""
    @comments.each{|c| buffer += c}
    #must escape ], )
    buffer.empty? ? "" : "C[#{buffer.gsub("]","\\]").gsub(")","\\)")}]"
  end

  def to_s
    #comment_node = comments.empty? ? "" : "C[#{comments}]"
    ";"+node_text + comments
  end

  METALABELS= {:black_rank => "BR", :white_rank => "WR",:white_player => "PW", :black_player => "PB",
               :komi => "KM", :date => "DT", :result => "RE",
               :file_format => "FF", :black_country => "BC",
               :white_country => "WC", :event => "EV", :source => "SO",
               :encoding => "CA", :size => "SZ", :rules => "RU", :time_set => "OT"}

  def property(symbol)
    return node_text if symbol == :all
    dup = node_text.dup
    dup.slice!(/.*#{METALABELS[symbol]}\[/)
    return nil if dup.length == node_text.length #means it wasnt found
    dup.slice!(/\].*/)
    return dup
  end

  def write_property(symbol, value)
    raise "Invalid property #{symbol}" unless METALABELS[symbol]
    node = "#{METALABELS[symbol]}[#{value}]"
    @node_text.gsub!(/#{METALABELS[symbol]}\[\w*\]/, "") #in case it already had it
    @node_text = node + @node_text
  end

end

