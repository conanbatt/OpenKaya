class SGF 

  BLACK = "B"
  WHITE = "W"
  attr_accessor :move_list, :comment_buffer,:metadata

  def initialize(moves="", size=19)
    @move_list= moves || ""
    @comment_buffer = ""
    @size = size
  end

  def add_move(node)
    validate_node_format(node)
   
    color = node[1]
    x = node[3]
    y = node[4]

    validate_coordinate(x, y)

    @move_list += "C[#{@comment_buffer}]" unless @comment_buffer.empty?
    @comment_buffer = ""
    @move_list += ";" 
    @move_list += color+"[#{x+y}]"
  end

  def add_comment(comment)
    @comment_buffer += comment+" " if comment
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
    raise "#{node} is invalid node format" unless node.match(/;[BW]\[[a-z][a-z]\]/)
  end

  def load_file(filename)
    File.open(filename, 'r') do |file|
      while (line = file.gets)
        @metadata = line.split(";")[1] #will process this later
        @move_list = line.gsub(metadata, "")[2..-3] #chopping some extra characters
        
      end
    end
  end 

end
