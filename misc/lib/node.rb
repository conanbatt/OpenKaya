SYM_TO_PROP= {:black_play => "B", :white_play => "W",:black_rank => "BR", :white_rank => "WR",:white_player => "PW", 
                       :black_player => "PB", :komi => "KM", :date => "DT", :result => "RE",
                       :file_format => "FF", :black_country => "BC", :add_black => "AB", :add_white => "AW",
                       :white_country => "WC", :event => "EV", :source => "SO", :black_left => "BL", :white_left => "WL",
                       :encoding => "CA", :size => "SZ", :rules => "RU", :time_set => "OT",:handicap => "HA"}

SGF_PROPERTIES = %w(PC GC CP GN ST AP AW AB AE AR CR DD LB LN MA SL SQ TR VW TB TW B W BR PW PB KM DT RE FF BC WC EV SO BL WL CA SZ RU OT HA WR C TM GM)

module KayaInterface

  def color
    if @properties["B"]
      return "B"
    elsif @properties["W"]
      return "W"
    end
  end

  def x
    @properties[color] && @properties[color][0] 
  end
  def y
    @properties[color] && @properties[color][1] 
  end

  def coordinate
    x+y
  end

  def pass_node?
    @properties[color].empty?
  end

  def validate_node_format(node)
    valid = node.match(/;[BW]\[(|[a-z][a-z])\]/)
    if node.include?("BL") || node.include?("WL")
      valid = valid && node.match(/[BW]L\[\d{0,6}.\d{3}\]/)
    end
    raise "#{node} is invalid node format" unless valid
  end

  def time_left
    @properties["#{color}L"]
  end
  def time_left=(time_left)
    raise "Invalid time node" unless time_left.match(/\d{0,6}.\d{3}/)
    write_property("#{color}L", time_left)
  end

end

class Node

  include KayaInterface

  attr_accessor :node_text, :children, :properties

  def initialize(options={})
    @properties = options[:properties] || {}

    @node_text = play_node
    validate_node_format(@node_text) if options[:parent]
    @children = []
    @parent = options[:parent] 
    @parent.add_child(self) if parent
  end

  def play_node
    node_text = ""
    if(@properties["B"])
      node_text = ";B[#{@properties["B"]}]"
      node_text << "BL[#{@properties["BL"]}]" if @properties["BL"]
    elsif(@properties["W"])
      node_text = ";W[#{@properties["W"]}]"
      node_text << "WL[#{@properties["WL"]}]" if @properties["WL"]
    end
    node_text
  end

  def parent
    @parent
  end

  def add_child(node)
    @children.push(node)
  end

  def comments
    if property("C")
      "C[#{property("C").gsub("]","\\]")}]"
    else
      ""
    end
  end

  def add_comment(comment)
    @properties["C"] ||= ""
    @properties["C"] = "#{@properties["C"] += comment}\n"
  end

  def to_s(with_comments=true)
    children_text = @children.first.to_s
    ";" + properties_to_s + children_text
    
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
      if prop == "C"
        val = val.gsub("]","\\]")
      end
      res << "#{SYM_TO_PROP[prop] || prop}[#{val}]"
    end
    res 
  end

  def property(prop)
    key = SYM_TO_PROP[prop] || prop
    @properties[key]
  end

  def write_property(prop, val)
    key = SYM_TO_PROP[prop] || prop

    raise "#{prop} is not a valid SGF property" unless SGF_PROPERTIES.include? key
    @properties[key] = val
  end
end

