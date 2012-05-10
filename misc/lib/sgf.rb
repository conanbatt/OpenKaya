require File.expand_path("node", File.dirname(__FILE__))

class SGF

  BLACK = "B"
  WHITE = "W"
  attr_accessor :move_list, :comment_buffer,:property, :focus

  def initialize(moves="", properties={})
    moves ||= ""
    @config = ConfigNode.new
    @focus = @config
    nodify_move_list(moves, @config) unless moves.empty?
    @comment_buffer = ""
    @size = properties[:size]
    properties.keys.each {|k| @config.write_property(k,properties[k]) }
    @config.write_property(:handicap, properties[:handicap])     
  end

  def last_two_moves_are_pass?
    if @focus && @focus.parent
      return @focus.pass_node? && @focus.parent.pass_node?
    end
    false
  end

  def nodify_move_list(moves, root_node)

    @focus = root_node
    branch_less_var = moves.gsub(/(\(;.*\))/,"")
    branch_less_var.split(";").each {|node| add_move(";#{node}") unless node.empty?}

    #The regex has 3 parts
    # 1.basic node ";B[aa]" : ;[BW]\[[a-z]?[a-z]?\]
    # 2.time property "BL[222.000]" : ([BW]L\[\d{0,6}.\d{3}\])?
    # 3.branches ";B[aa](;W[dd]) : (\(;.*\))?
    # 2 and 3 might not be there.
    total_reg = /(;[BW]\[[a-z]?[a-z]?\]([BW]L\[\d{0,6}.\d{3}\])?(\(;.*\))?)/

    focus = root_node.children.first
    moves.scan(total_reg).each do |match|

      node_text = match.first
      p "Warning! #{node_text} is not #{focus.node_text}" unless node_text.include?(focus.node_text)
      branch = match[2]
      nodify_move_list(branch[1..-2], focus) if branch
      focus = focus.children.first
    end
  end

  def add_move(node) #TODO objetify node
    @focus = Node.new(@focus,node)
    move_list
  end

  def code_to_focus(focus_code)
    @focus = @config
    focus_code.split("-").each do |branch|
      node = @focus.children[branch.to_i]
      raise "There is no node here! #{focus_code}" unless node
      @focus = node
    end
  end

  def last_play_color
    @focus != @config && @focus.color
  end

  def add_comment(comment)
    if @focus
      @focus.add_comment(comment)
    else
      @config.add_comment(comment)
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
      value.each{ |v| move_by_number(key.to_i-1) && move_by_number(key.to_i-1).add_comment(hash_to_comment(v))}
    end
  end

  def hash_to_comment(hash)
    raise "invalid hash" unless hash["user"] && hash["rank"] && hash["message"]
    "#{hash["user"]}#{hash["rank"]}: #{hash["message"]}"
  end
    
  def move_list
   @config.children.first.to_move_list unless @config.children.empty?
  end

  def move_list_with_comments
    @config.children.first.to_s
  end

  def move_by_number(index)
    index = index.to_i
    return if (index < 0)
    node = @config.children.first
    while(index >0)
      node = node.children.first
      index -= 1
    end
    node
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
    sgf =""
    File.open(filename, 'r') do |file|
      while (line = file.gets)
        sgf += line
      end
      load_from_string(sgf)
    end
  end
  def load_from_string(input)
    properties= input.split(";")[1]
    @focus = @config = ConfigNode.new(properties) #will process this later
    nodify_move_list(input.gsub(properties, "").chomp[2..-2], @config)
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
    "(#{@config.to_s})"
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
    return if @focus == @config
    if @focus.color == player
      return @focus
    elsif @focus.parent
      @focus.parent 
    end 
  end

  def undo
    to_del = @focus
    @focus = @focus.parent
    @focus.children.delete(to_del) 
  end

  def self.handi_node(size,handicap)
    case size.to_i

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

