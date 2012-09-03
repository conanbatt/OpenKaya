  SGF_PROPERTIES= {:black_play => "B", :white_play => "W",:black_rank => "BR", :white_rank => "WR",:white_player => "PW", 
                   :black_player => "PB", :komi => "KM", :date => "DT", :result => "RE",
                   :file_format => "FF", :black_country => "BC", :add_black => "AB", :add_white => "AW",
                   :white_country => "WC", :event => "EV", :source => "SO", :black_left => "BL", :white_left => "WL",
                   :encoding => "CA", :size => "SZ", :rules => "RU", :time_set => "OT",:handicap => "HA"}



module KayaInterface

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

class Node

  include KayaInterface

  attr_accessor :node_text, :children, :properties

  def initialize(node_text, options={})
    @comments = []
    @node_text = strip_comments!(node_text)
    validate_node_format(node_text) if options[:parent]
    @properties = options[:properties] || {}
    @children = []
    @parent = options[:parent] 
    @parent.add_child(self) if parent
  end

  def strip_comments!(node_text)
    comments = node_text.scan(/C\[(.*)/m).first
    if comments
      comments.first.split("\n")[0..-2].each {|c| add_comment(c) }
    end
    node_text.gsub(/C\[(.*)/m,"")  
  end

  def parent
    @parent
  end

  def add_child(node)
    @children.push(node)
  end

  def add_comment(comment)
    @comments << (comment + "\n")
  end
  def comments
    @comments.empty? ? "" : "C[#{@comments.join.gsub("]","\\]").gsub(")","\\)")}]"
  end

  def to_s(with_comments=true)
    children_text = @children.first.to_s
    "#{";" if node_text.empty?}" + node_text + properties_to_s + "#{ comments if with_comments}" + children_text
    
  end

  def to_move_list
    result = ""

    if @children.empty?
      result << @node_text
    elsif @children.size == 1
      result << @node_text + @children.first.to_move_list
    else 
      result << @node_text
      @children.each {|node| result += "(#{node.to_move_list})"}
    end
    result
  end

  def properties_to_s
    res = ""
    @properties.each do |prop, val|
      res << "#{SGF_PROPERTIES[prop]}[#{val}]"
    end
    res 
  end

  def property(symbol)
    @properties[symbol]
  end

  def write_property(symbol, val)
    raise "#{symbol} is not a valid SGF property" unless SGF_PROPERTIES[symbol]
    @properties[symbol] = val
  end
end

