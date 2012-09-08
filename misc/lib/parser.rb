# Author Trevoke @ https://github.com/Trevoke/SGFParser
# Fitted to Kaya by conanbatt

require File.expand_path("sgf", File.dirname(__FILE__))
require File.expand_path("node", File.dirname(__FILE__))

require 'stringio'

class SGF

  module Parser

    NEW_NODE = ";"
    BRANCHING = %w{( )}
    PROPERTY = %w([ ])
    NODE_DELIMITERS = [NEW_NODE].concat BRANCHING
    LIST_IDENTITIES = %w(AW AB AE AR CR DD LB LN MA SL SQ TR VW TB TW)

    def self.parse sgf, strict_parsing = true
      @strict_parsing = strict_parsing
      @stream = streamably_stringify sgf
      @sgf = SGF.new
      @root = @sgf.focus
      @current_node = @sgf.focus
      @branches = []
      until @stream.eof?
        case next_character
          when "(" then open_branch
          when ";" then

            parse_node_data
            if @node_properties["FF"] #for the root node
              @node_properties.each {|k,v| @root.write_property(k, v)}
            else
              create_new_node(@node_properties)
            end
          when ")" then close_branch
          else next
        end
      end
      @sgf
    end

    private

    def self.streamably_stringify sgf
      sgf = sgf.read if sgf.instance_of?(File)
      sgf = File.read(sgf) if File.exist?(sgf)

      check_for_errors_before_parsing sgf if @strict_parsing
      StringIO.new clean(sgf), 'r'
    end

    def self.check_for_errors_before_parsing string
      unless string[/\A\s*\(\s*;/]
        msg = "The first two non-whitespace characters of the string should be (;"
        msg << " but they were #{string[0..1]} instead."
        raise("Invalid sgf format. #{msg}")
      end
    end

    def self.clean sgf
      sgf.gsub! "\\\\n\\\\r", ''
      sgf.gsub! "\\\\r\\\\n", ''
      sgf.gsub! "\\\\r", ''
      sgf.gsub! "\\\\n", ''
      sgf
    end

    def self.open_branch
      @branches.unshift @current_node
    end

    def self.close_branch
      @current_node = @branches.shift
    end

    def self.create_new_node(props)
      @current_node = Node.new(:parent => @current_node, :properties => props)
      @sgf.focus = @current_node
    end

    def self.parse_node_data
      @node_properties = {}
      while still_inside_node?
        identity =parse_identity
        parse_property(identity)
        @node_properties[identity] = @property
      end
    end

    def self.still_inside_node?
      inside_a_node = false
      while char = next_character
        next if char[/\s/]
        inside_a_node = !NODE_DELIMITERS.include?(char)
        break
      end
      @stream.pos -= 1 if char
      inside_a_node
    end

    def self.parse_identity
      identity = ""
      while char = next_character and char != "["
        identity << char unless char == "\n"
      end
      identity
    end

    def self.parse_property(identity)
      @property = ""
      case identity.upcase
        when "C" then parse_comment
        when *LIST_IDENTITIES then parse_multi_property
        else parse_generic_property
      end
    end

    def self.parse_comment
      while char = next_character and still_inside_comment? char
        @property << char
      end
      @property.gsub! "\\]", "]"
    end

    def self.parse_multi_property
      while char = next_character and still_inside_multi_property? char
        @property << char
      end
      @property = @property.gsub("][", ",").split(",")
    end

    def self.parse_generic_property
      while char = next_character and char != "]"
        @property << char
      end
    end

    def self.still_inside_comment? char
      char != "]" || (char == "]" && @property[-1..-1] == "\\")
    end

    def self.still_inside_multi_property? char
      return true if char != "]"
      inside_multi_property = false
      while char = next_character
        next if char[/\s/]
        inside_multi_property = char == "["
        break
      end
      @stream.pos -= 1 if char
      inside_multi_property
    end

    def self.next_character
      !@stream.eof? && @stream.sysread(1)
    end

  end

end
