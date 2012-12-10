require File.expand_path("node", File.dirname(__FILE__))
require File.expand_path("parser", File.dirname(__FILE__))

class SGF

  BLACK = "B"
  WHITE = "W"
  attr_accessor :move_list, :comment_buffer,:property, :focus, :root

  def initialize(moves="", properties={})
    moves ||= ""
    @root = Node.new(:properties => properties)
    @root.write_property(:file_format, 4)
    @focus = @root
    @size = properties[:size]
  end

  def self.kaya_sgf(moves, properties)
    sgf = nil
    
    if moves && (!moves.empty?)
      moves = "(#{moves})" unless moves[0] == "("
      sgf = SGF::Parser.parse(moves)
      properties.each{|k,v| sgf.root.write_property(k,v)}
    else
      sgf= SGF.new("",properties)
    end
    sgf
  end

  def last_two_moves_are_pass?
    if @focus && @focus.parent
      return @focus.pass_node? && @focus.parent.pass_node?
    end
    false
  end

  def add_move(raw_node, rewrite=true) #TODO objetify node

    if rewrite
      @focus = Node.new(:properties=> KayaInterface::parse_raw_node(raw_node), :parent => @focus) 
    else
      found_repeated_node = false
      @focus.children.each do |child|
        if child.node_text == raw_node
          found_repeated_node = true
          @focus = child
        end
      end
      unless found_repeated_node
        @focus = Node.new(:properties => KayaInterface::parse_raw_node(raw_node), :parent => @focus) #only create a new node if there is no children with the same coordinate
      end
    end
  end

  def valid_focus?(focus_code)
    focus = @root
    return if focus_code == "root"
    focus_code.split("-").each do |branch|
      node = focus.children[branch.to_i]
      return false unless node
      focus = node
    end
    focus
  end

  def code_to_focus(focus_code)
    @focus = @root
    return if focus_code == "root"
    focus_code.split("-").each do |branch|
      node = @focus.children[branch.to_i]
      raise "There is no node here! #{focus_code}" unless node
      @focus = node
    end
    @focus
  end

  def focus_to_code
    return "root" if @focus == @root
    temp_focus = @focus
    code = ""
    while(temp_focus)

      parent = temp_focus.parent
      if(parent)
        code = "#{parent.children.index(temp_focus)}-#{code}" 
      end
      temp_focus = parent
    end
    return code.chop
  end


  def last_play_color
    @focus != @root && @focus.color
  end

  def add_comment(comment)
    if @focus
      @focus.add_comment(comment)
    else
      @root.add_comment(comment)
    end
    move_list
  end
  #takes a hash and inputs the contents into the nodes
  def parse_comments!(comments)
    comments.each do |key, value|
      if (key.to_i == 0)
        value.each {|v| @root.add_comment(hash_to_comment(v))}
        next
      end
      value.each{ |v| move_by_number(key.to_i-1) && move_by_number(key.to_i-1).add_comment(hash_to_comment(v))}
    end
  end

  def hashify_comments
    move_number = 0
    pointer = @root
    comments = {}
    while(pointer)
      comments[move_number.to_s] = pointer.comments unless pointer.comments.empty?
      move_number += 1
      pointer = pointer.children.last
    end
    comments
  end

  def hash_to_comment(hash)
    raise "invalid hash" unless hash["user"] && hash["rank"] && hash["message"]
    "#{hash["user"]}#{hash["rank"]}: #{hash["message"]}"
  end
    
  def move_list
    @root.to_move_list 
  end

  def move_list_with_comments
    @root.children.first.to_s
  end

  def move_by_number(index)
    index = index.to_i
    return if (index < 0)
    node = @root.children.first
    while(index >0)
      node = node.children.last if node.children.last #undos can mess up the move number
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
    @focus = @root = Node.new(:properties => properties) #will process this later
    nodify_move_list(input.gsub(properties, "").chomp[2..-2], @root)
  end

  def property(symbol)
    @root.property(symbol)
  end

  def write_property(symbol, value)
    @root.write_property(symbol, value)
  end

  def to_s
    "(#{@root.to_s})"
  end

  def time_left(player)
    raise "Invalid input #{player}. W or B expected" unless player == "B" || player == "W"
    ln = last_node_by_player(player)
    ln && ln.properties["#{player}L"].to_i
  end

  def last_node_by_player(player)
    return if @focus == @root
    if @focus.color == player
      return @focus
    elsif @focus.parent.color == player
      @focus.parent 
    end 
  end

  def undo
    return if @focus == @root
    to_del = @focus
    @focus = @focus.parent
    @focus.children.delete(to_del) 
  end

  def self.handi_props(size,handicap)
    case size.to_i

    when 19
      case handicap
      when 2
        return {:add_black => "dd][pp"}
      when 3
        return {:add_black => "dd][dp][pd"}
      when 4
        return {:add_black =>"dd][pd][dp][pp"}
      when 5
        return {:add_black =>"dd][pd][dp][pp][jj"}
      when 6
        return {:add_black =>"dd][pd][dp][pp][dj][pj"}
      when 7
        return {:add_black =>"dd][pd][dp][pp][dj][pj][jj"}
      when 8
        return {:add_black =>"dd][jd][pd][dj][pj][dp][jp][pp"}
      when 9
        return {:add_black =>"dd][jd][pd][dj][jj][pj][dp][jp][pp"}
      else
        raise "Invalid handicap setting #{handicap}"
      end
    when 13
      case handicap
      when 2
        return {:add_black =>"dd][jj"}
      when 3
        return {:add_black =>"dd][dj][jd"}
      when 4
        return {:add_black =>"dd][jd][dj][jj"}
      when 5
        return {:add_black =>"dd][jd][dj][gg][jj"}
      when 6
        return {:add_black =>"dd][jd][dj][jj][dg][jg"}
      when 7
        return {:add_black =>"dd][jd][dj][jj][dg][jg][gg"}
      when 8
        return {:add_black =>"dd][jd][dj][gj][jj][jg][gd][dg"}
      when 9
        return {:add_black =>"dd][jd][dj][gj][jj][jg][gg][gd][dg"}
      else
        raise "Invalid handicap setting #{handicap}"
      end
    when 9
      case handicap
      when 2
        return {:add_black =>"cc][gg"}
      when 3
        return {:add_black =>"cc][cg][gg"}
      when 4
        return {:add_black =>"cc][gg][cg][gc"}
      when 5
        return {:add_black =>"cc][gg][cg][gc][ee"}
      when 6
        return {:add_black =>"cc][gg][cg][gc][ce][ge"}
      when 7
        return {:add_black =>"cc][gg][cg][gc][ce][ge][ee"}
      when 8
        return {:add_black =>"cc][gc][cg][gg][ce][ge][ec][eg"}
      when 9
        return {:add_black =>"cc][gc][cg][gg][ce][ge][ec][ee][eg"}
      else
        raise "Invalid handicap setting #{handicap}"
      end
    end
  raise "Invalid handicap setting Size: #{size} and  handicap #{handicap}"
  end
end

