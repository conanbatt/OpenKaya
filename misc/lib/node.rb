class Node

  attr_reader :node_text, :children, :parent

  def initialize(parent,node_text= "")
    validate_node_format(node_text)
    @comments = []
    @node_text = strip_comments!(node_text)
    @children = []
    @parent = parent
    @parent.add_child(self) if parent
  end

  def strip_comments!(node_text)
    comments = node_text.scan(/C\[(.*)/m).first
    if comments
      comments.first.split("\n")[0..-2].each {|c| add_comment(c) }
    end
    node_text.gsub(/C\[(.*)/m,"")  
  end

  def add_child(node)
    @children.push(node)
  end

  def to_move_list
    children_to_s
  end

  def children_to_s(with_comments=false)
    moves = ""
 
    if @children.size == 1
      moves += @children.first.children_to_s(with_comments)
    else
      @children.each {|node| moves += "(#{node.children_to_s(with_comments)})"}
    end

    comment_node = with_comments ? comments : "" 
    node_text + comment_node + moves
  end

  def to_s
    children_to_s(true)
  end

  def add_comment(comment)
    @comments << (comment + "\n")
  end
  def comments
    @comments.empty? ? "" : "C[#{@comments.join.gsub("]","\\]").gsub(")","\\)")}]"
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

  attr_accessor :node_text, :children

  def initialize(property="")
    @node_text = property.dup
    write_property(:file_format,4)
    handicap = property(:handicap)
    @comments = []
    @children = []
  end

  def parent
    #stub
  end

  def add_child(node)
    @children.push(node)
  end

  def validate_node_format
    return true
  end

  def add_comment(comment)
    @comments << (comment + "\n")
  end
  def comments
    @comments.empty? ? "" : "C[#{@comments.join.gsub("]","\\]").gsub(")","\\)")}]"
  end

  def to_s
    children_text = @children.first.to_s
    ";"+node_text + comments + children_text
  end

  def to_move_list
    result = ""
    if @children.size == 1
      result += @children.first.to_move_list
    else 
      @children.each {|node| result += "(#{node.to_s})"}
    end
    result
  end

  METALABELS= {:black_rank => "BR", :white_rank => "WR",:white_player => "PW", :black_player => "PB",
               :komi => "KM", :date => "DT", :result => "RE",
               :file_format => "FF", :black_country => "BC",
               :white_country => "WC", :event => "EV", :source => "SO",
               :encoding => "CA", :size => "SZ", :rules => "RU", :time_set => "OT",:handicap => "HA"}

  def property(symbol)
    return node_text if symbol == :all
    dup = node_text.dup
    dup.slice!(/.*#{METALABELS[symbol]}\[/)
    return nil if dup.length == node_text.length #means it wasnt found
    dup.slice!(/\].*/)
    return dup
  end

  def write_property(symbol, value)
    return unless value
    raise "Invalid property #{symbol}" unless METALABELS[symbol]
    node = "#{METALABELS[symbol]}[#{value}]"
    @node_text.gsub!(/#{METALABELS[symbol]}\[\w*\]/, "") #in case it already had it
    @node_text = node + @node_text 
    size = property(:size)
    #a little hackish to insert the AB node only
    @node_text += SGF.handi_node(property(:size),value)[5..-1] if(size && 
                                                           symbol == :handicap)
  end

end

