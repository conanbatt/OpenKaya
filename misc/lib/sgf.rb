class SGF 

  BLACK = "B"
  WHITE = "W"
  attr_accessor :move_list, :comment_buffer,:metadata

  def initialize(moves="", size=19)
    @move_list= moves || ""
    @comment_buffer = ""
    @size = size
    @metadata =""
  end

  def add_move(node) #TODO objetify node
    validate_node_format(node)
   
    color = node[1]
    x = node[3]
    y = node[4]
 
    validate_coordinate(x, y)

    @move_list += "C[#{@comment_buffer}]" unless @comment_buffer.empty?
    @comment_buffer = ""
    @move_list += node
  end

  def add_comment(comment)
    @comment_buffer += comment+" " if comment
    move_list
  end

  def move_list
    @move_list + (@comment_buffer.empty? ? "" : "C[#{@comment_buffer}]") #Best way to handle comment node? avoids string parsing
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
    @metadata = input.split(";")[1] #will process this later
    @move_list = input.gsub(@metadata, "")[2..-3] #chopping some extra characters
  end

  METALABELS= {:white_player => "PW", :black_player => "PB", 
               :komi => "KM", :date => "DT", :result => "RE", 
               :file_format => "FF", :black_country => "BC", 
               :white_country => "WC", :event => "EV", :source => "SO",
               :encoding => "CA", :size => "SZ", :rules => "RU", :time_set => "OT"}

  def metadata(symbol)
    return @metadata if symbol == :all
    dup = @metadata.dup
    dup.slice!(/.*#{METALABELS[symbol]}\[/)
    dup.slice!(/\].*/)
    return dup
  end

  def write_metadata(symbol, value)
    raise "Invalid metadata #{symbol}" unless METALABELS[symbol]
    node = ";#{METALABELS[symbol]}[#{value}]"
    @metadata.gsub!(/;#{METALABELS[symbol]}\[\w*\]/, "")
    @metadata = node + @metadata
  end

end

