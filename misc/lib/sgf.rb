class SGF

  BLACK = "B"
  WHITE = "W"
  attr_accessor :move_list, :comment_buffer,:metadata

  def initialize(moves="", size=19)
    moves ||= ""
    @move_list = []
    @config = ConfigNode.new
    nodify_move_list(moves) unless moves.empty?
    @comment_buffer = ""
    @size = size
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

  def move_list
    buffer = @config.comments
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
    metadata= input.split(";")[1]
    @config = ConfigNode.new(metadata) #will process this later
    nodify_move_list(input.gsub(metadata, "").chomp[2..-2])
  end

  def metadata(symbol)
    @config.metadata(symbol)
  end

  def write_metadata(symbol, value)
    @config.write_metadata(symbol, value)
  end

  def to_s
    "(#{@config.to_s}#{move_list})"
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
    comment_node = comments.empty? ? "" : "C[#{comments}]"
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

end

class ConfigNode

  attr_accessor :node_text

  def initialize(metadata="")
    @node_text = metadata.dup
    write_metadata(:file_format,4)
    @comments = []
  end

  def validate_node_format
    return true
  end

  def add_comment(comment)
    @comments << comment + " "
  end
  def comments
    buffer = ""
    @comments.each{|c| buffer += c}
    buffer.empty? ? "" : "C[#{buffer}]"
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

  def metadata(symbol)
    return node_text if symbol == :all
    dup = node_text.dup
    dup.slice!(/.*#{METALABELS[symbol]}\[/)
    return nil if dup.length == node_text.length #means it wasnt found
    dup.slice!(/\].*/)
    return dup
  end

  def write_metadata(symbol, value)
    raise "Invalid metadata #{symbol}" unless METALABELS[symbol]
    node = "#{METALABELS[symbol]}[#{value}]"
    @node_text.gsub!(/#{METALABELS[symbol]}\[\w*\]/, "") #in case it already had it
    @node_text = node + @node_text
  end

end

