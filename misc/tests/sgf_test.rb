require "cutest"

require File.expand_path("../lib/sgf", File.dirname(__FILE__))
require File.expand_path("../lib/node", File.dirname(__FILE__))
require File.expand_path("../lib/parser", File.dirname(__FILE__))

require 'ruby-debug'

setup do

end


test "Parsing should read different props" do

  node = Node.new

  sgf = SGF::Parser.parse("mocks/markers.sgf")
  string = sgf.to_s

end

test "Parsing shold be bi-directional" do

  sgf = SGF::Parser.parse("mocks/full_parse.sgf")
  string = sgf.to_s

  sgf2 = SGF::Parser.parse(string)

end

test "should be able to load with comments with special characters" do

  sgf = SGF::Parser.parse("mocks/MoyoMagic-Leather.sgf")
end

test "should be able to load kogo" do
#TODO 
#  sgf = SGF::Parser.parse("mocks/Kogo's Joseki Dictionary.sgf")

end

test "should parse comments for node text" do

  sgf = SGF::Parser.parse("(;FF[4];B[ab]C[This guy sucks :/ \n];W[ad]C[maybe \n])")
end


test "should be able to re-create the sgf with the raw move list" do

  branched_move_list = "(;B[hh];W[ii](;B[ee];W[ab];B[al])(;B[aa]))"
  sgf = SGF::Parser.parse(branched_move_list)

  assert_equal sgf.move_list, ";B[hh];W[ii](;B[ee];W[ab];B[al])(;B[aa])" 
  assert_equal sgf.focus_to_code, "0-0-1"

end


test "should return falsy on color for config node" do

  sgf = SGF.new
  assert !sgf.last_play_color
end

test "should be able to nodify a certain move list" do


  mock_move_list  = "(;B[pd];W[jd](;B[pj])(;B[pp];B[dd]))"
  sgf = SGF::Parser.parse(mock_move_list)

  assert_equal sgf.move_list, mock_move_list[1..-2]

  #bug case
  bug_move_list = "(;B[pd](;W[pj](;B[jd];W[jj])(;B[lg];W[ih]))(;W[oh];B[kj];W[km]))(;B[ka])"
  sgf = SGF::Parser.parse(bug_move_list)

  assert_equal sgf.move_list, bug_move_list
end


test "should get the move number" do

  sgf = SGF.new
  sgf.add_move(";B[aa]")
  sgf.add_move(";W[ab]")
  sgf.add_move(";B[ac]")
  sgf.add_move(";W[ad]")
  sgf.add_move(";B[ae]")

  assert_equal sgf.move_by_number(2), sgf.focus.parent.parent
end

test "should be able to do add move without repeat rewrite" do

  sgf = SGF.new
  sgf.add_move(";B[aa]")
  sgf.add_move(";W[ab]")

  sgf.focus = sgf.focus.parent
  sgf.add_move(";W[ab]", false)

  assert_equal sgf.move_list, ";B[aa];W[ab]"

end

test "should be able to write variations" do

  sgf = SGF.new


  sgf.add_move(";B[aa]")
  sgf.add_move(";W[ab]")

  sgf.focus = sgf.focus.parent
  sgf.add_move(";W[ac]")
  assert_equal sgf.move_list, ";B[aa](;W[ab])(;W[ac])"

  assert_equal sgf.focus.node_text, ";W[ac]"

  sgf.add_move(";B[ad]")

  assert_equal sgf.move_list, ";B[aa](;W[ab])(;W[ac];B[ad])"

  sgf2 = SGF.new

  sgf2.add_move(";B[bb]")
  sgf2.add_move(";W[cc]")
  sgf2.focus = sgf2.focus.parent

  sgf2.add_move(";W[dd]")
  sgf2.add_move(";B[ee]")
  sgf2.focus = sgf2.focus.parent

  sgf2.add_move(";B[ff]")

  assert_equal sgf2.move_list, ";B[bb](;W[cc])(;W[dd](;B[ee])(;B[ff]))"

  sgf3 = SGF.new

  sgf3.add_move(";B[aa]")
  sgf3.focus = sgf3.focus.parent
  sgf3.add_move(";B[bb]")
  assert_equal sgf3.move_list, "(;B[aa])(;B[bb])"

end

test "should change the focus with a code" do

  sgf = SGF.new

  assert_equal sgf.focus_to_code, "root"

  sgf.add_move(";B[bb]")
  sgf.add_move(";W[cc]")
  assert_equal sgf.focus_to_code, "0-0"

  sgf.code_to_focus "0"

  sgf.add_move(";W[dd]")
  sgf.add_move(";B[ee]")

  assert_equal sgf.focus_to_code, "0-1-0"

  sgf.code_to_focus "0-1"

  sgf.add_move(";B[ff]")

  assert_equal sgf.move_list, ";B[bb](;W[cc])(;W[dd](;B[ee])(;B[ff]))"

end


test "Nodify moves" do
  
  sgf = SGF.new
  node = ";B[ab]"
  sgf.add_move(node)

  assert_equal sgf.move_list, ";B[ab]"

end

test "Should add comment to a node" do

  sgf = SGF.new
  node = ";B[ab]"
  sgf.add_move(node)
  sgf.add_comment("This guy sucks")

  assert_equal sgf.move_list, ";B[ab]"
  assert_equal sgf.to_s ,"(;FF[4];B[ab]C[This guy sucks\n])"

  sgf.add_comment("yeah")

  assert_equal sgf.move_list, ";B[ab]"
  assert sgf.to_s.include? "(;FF[4];B[ab]C[This guy sucks\nyeah\n])"

end

test "Should add comment to an empty sgf" do

  sgf = SGF.new
  sgf.add_comment("This guy sucks")

  assert_equal sgf.to_s , "(;FF[4]C[This guy sucks\n])"

  sgf.add_comment("yeah")

  assert_equal sgf.to_s, "(;FF[4]C[This guy sucks\nyeah\n])"

end


test "Should add semi-colon between nodes" do

  sgf = SGF.new
  b_node = ";B[ab]"
  w_node = ";W[ac]"
  sgf.add_move(b_node)
  sgf.add_move(w_node)

  assert sgf.move_list =  ";B[ab];W[ac]" 

end

test "Should validate incoming node" do

  sgf = SGF.new
  b_crap = "AG"
  
  assert_raise(RuntimeError) do
    sgf.add_move(b_crap)
  end

  b_bad_time = ";B[qd]BL[12.35]"
  
  assert_raise(RuntimeError) do
    sgf.add_move(b_bad_time)
  end

end

#(;FF[4]GM[1]SZ[19]CA[UTF-8]SO[gokifu.com]BC[kr]WC[kr]EV[7th Korean Wonik Cup Siptan]PB[Ryu Chaehyeong]BR[9p]PW[Kang Dongyun]WR[9p]KM[6.5]DT[2011-09-30]RE[W+R]

#;B[qd];W[pp]

test "Should load an sgf file" do
  filename = "mocks/mock.sgf"

  sgf = SGF::Parser.parse(filename)
  assert_equal sgf.move_list, ";B[qd];W[pp]"
end

test "should parse comments for node text" do

  node_text = ";B[ac]"

  comments = "conanbatt[5d\]: something wrong with scoring!
Genych[3k\]: maybe we both tryin' in the same time?
"
  node = Node.new(:properties => {"C" => comments, "B" => "ac"})
  assert_equal node.comments, "C[conanbatt[5d\\]: something wrong with scoring!\nGenych[3k\\]: maybe we both tryin' in the same time?\n]"
  assert_equal node.to_move_list, ";B[ac]"

end

test "Should load a full sgf file with comments" do

  filename = "mocks/full_parse.sgf"
  sgf = SGF::Parser.parse(filename)

  comment_hash = {"0"=>"C[Genych[3k\\]: onegaishimasu ^ ^\nGenych[3k\\]: can i stop your clock till you will be ready?\n]","1"=>"C[conanbatt[5d\\]: sorry\nconanbatt[5d\\]: sound was off\nGenych[3k\\]: no problem\n]", "13"=>"C[Genych[3k\\]: i don't know what to do with 7 additional stones  :\\)\n]", "14"=>"C[conanbatt[5d\\]: neither do i\n]", "93"=>"C[Genych[3k\\]: oops :\\)\nconanbatt[5d\\]: :\\)\n]", "218"=>"C[Genych[3k\\]: we must fill neitrals, right?\n]", "219"=>"C[conanbatt[5d\\]: no\n]", "220"=>"C[conanbatt[5d\\]: mm\nconanbatt[5d\\]: something wrong with scoring!\nGenych[3k\\]: maybe we both tryin' in the same time?\nGenych[3k\\]: hm. no\nconanbatt[5d\\]: this is a definite bug\nconanbatt[5d\\]: we made some big changes last friday\nconanbatt[5d\\]: gimme a sec\nGenych[3k\\]: sure\nGenych[3k\\]: i'm glad to help find bugs :\\)\nconanbatt[5d\\]: :\\)\nconanbatt[5d\\]: i win by 2.5\nconanbatt[5d\\]: amazing\nGenych[3k\\]: cool!\nconanbatt[5d\\]: you lost  when i broke through on top\nGenych[3k\\]: your yose was incredible\nconanbatt[5d\\]: gimme a sec to debug this\nGenych[3k\\]: ok\nconanbatt[5d\\]: ook\nconanbatt[5d\\]: lets leave the game like this :\\)\nGenych[3k\\]: ok\nconanbatt[5d\\]: pato is going to fix it\nGenych[3k\\]: thanks for the game, btw!\nconanbatt[5d\\]: i would comment some vars for you\nconanbatt[5d\\]: Genych click done\n]"}
  assert_equal sgf.hashify_comments , comment_hash

end

test "should be able to add a time property to a node" do

  sgf = SGF.new
  b_node = ";B[qd]BL[100.553]"
  w_node = ";B[qa]WL[130.553]"

  sgf.add_move(b_node);
  sgf.add_move(w_node);

  assert sgf.move_list =  ";B[ab]BL[100.553];W[ac]WL[130.553]" 

end

test "should explode if try to access invalid property" do
  sgf = SGF::Parser.parse("(;FF[4]PB[CARLOS]PW[PEPE];B[aa])")

  assert sgf.property(:komi).nil?
end

#(;FF[4]GM[1]SZ[19]CA[UTF-8]SO[gokifu.com]BC[kr]WC[kr]EV[7th Korean Wonik Cup Siptan]PB[Ryu Chaehyeong]BR[9p]PW[Kang Dongyun]WR[9p]KM[6.5]DT[2011-09-30]RE[W+R]

test "Should load a sgf property" do
  filename = "mocks/mock.sgf"
  sgf = SGF::Parser.parse(filename)

  assert_equal sgf.property(:white_player), "Kang Dongyun"
  assert_equal sgf.property(:black_player), "Ryu Chaehyeong"
  assert_equal sgf.property(:komi), "6.5"
  assert_equal sgf.property(:date), "2011-09-30"
  assert_equal sgf.property(:result), "W+R"
  assert_equal sgf.property(:file_format), "4"
  assert_equal sgf.property(:date), "2011-09-30"
  assert_equal sgf.property(:source), "gokifu.com"
  assert_equal sgf.property(:black_country), "kr"
  assert_equal sgf.property(:white_country), "kr"
  assert_equal sgf.property(:encoding), "UTF-8"
  assert_equal sgf.property(:size), "19"
  assert_equal sgf.property(:event), "7th Korean Wonik Cup Siptan"
  assert_equal sgf.property(:rules), "Japanese"
  assert_equal sgf.property(:time_set), "5x30 byo-yomi"

end

test "should be able to write a full sgf" do

  filename = "mocks/mock.sgf"
  sgf = SGF::Parser.parse(filename)
  assert_equal sgf.to_s, "(;FF[4]RU[Japanese]TM[1500]OT[5x30 byo-yomi]GM[1]SZ[19]CA[UTF-8]SO[gokifu.com]BC[kr]WC[kr]EV[7th Korean Wonik Cup Siptan]PB[Ryu Chaehyeong]BR[9p]PW[Kang Dongyun]WR[9p]KM[6.5]DT[2011-09-30]RE[W+R]C[Genych[3k\\]: onegaishimasu ^ ^\nGenych[3k\\]: can i stop your clock till you will be ready?\n];B[qd];W[pp])"

end

test "should give a full sgf string" do

  sgf = SGF::Parser.parse("(;B[ac];W[ed])")

  sgf.write_property(:white_player, "Conan")
  assert_equal sgf.property(:white_player), "Conan"

  sgf.write_property(:black_player,"Conan2")
  assert_equal sgf.property(:black_player), "Conan2"

  assert_equal sgf.to_s, "(;FF[4]PW[Conan]PB[Conan2];B[ac];W[ed])"

end

test 'Should be able to write property' do 

  sgf = SGF.new


  sgf.write_property(:white_player, "Conan")
  assert_equal sgf.property(:white_player), "Conan"

  sgf.write_property(:white_player,"Conan2")
  assert_equal sgf.property(:white_player), "Conan2"

  assert_raise(RuntimeError) do
    sgf.write_property(:total_bs, "bs")
  end

end

test 'Should be able to send a pass move' do

  sgf = SGF.new
  sgf.add_move(";B[]")

  assert sgf.move_list =  ";B[]"

end

test 'Should create a node object' do
  
  node = Node.new(:properties => {"B"=>"ac"})

  assert_equal node.color, "B"
  assert_equal node.coordinate, "ac"

  node.add_comment("pepe")
  assert_equal node.comments, "C[pepe\n]"

  node.add_comment("y yo")
  assert_equal node.comments, "C[pepe\ny yo\n]"
end

test 'should create the sgf node list with initialization' do

  sgf = SGF::Parser.parse("(;B[ac];W[ed])")
  assert_equal sgf.move_list, ";B[ac];W[ed]"
end

test 'should have handicap node settings' do

  assert !SGF.handi_props(19,5).nil?

end

test 'should recognize if last two moves are pass' do
 
  sgf = SGF::Parser.parse("(;B[];W[])")
  assert_equal sgf.move_list, ";B[];W[]"


# TODO FOCUS ISSUE
#  debugger
#  assert sgf.last_two_moves_are_pass?

  sgf = SGF::Parser.parse("(;B[]BL[500.000];W[]WL[500.000])")
  assert_equal sgf.move_list, ";B[]BL[500.000];W[]WL[500.000]"
#  assert sgf.last_two_moves_are_pass?

end

test "should be able to make an sgf with the initial config node properties as params" do

  params = {:size => 9, :white_player => "blanco", :black_player => "negro"}

  sgf = SGF::Parser.parse("(;B[];W[])")

  params.each {|k,v| sgf.root.write_property(k,v)}

  assert_equal sgf.to_s, "(;FF[4]SZ[9]PW[blanco]PB[negro];B[];W[])"
end

test "should be able to parse comments into it" do

  sgf = SGF::Parser.parse("(;B[aa];W[bb])")

  comments = {"0"=>[{"timestamp"=>"[1327727980000]",
                     "user"=>"dp",
                     "rank"=>"[7d]",
                     "message"=>"fgsfgafha",
                     "visibility"=>"",
                     "move_number"=>"0"},
                    {"timestamp"=>"[1327727987000]",
                     "user"=>"conanbatt",
                     "rank"=>"[7d]",
                     "message"=>"aaa",
                     "visibility"=>"",
                     "move_number" =>"0"}
                   ]
             }
  sgf.parse_comments!(comments)

  assert_equal sgf.to_s, "(;FF[4]C[dp[7d\\]: fgsfgafha\nconanbatt[7d\\]: aaa\n];B[aa];W[bb])" 

  sgf2 = SGF.new(";B[aa];W[bb]")

  comments["5"] = comments["0"]
  sgf.parse_comments!(comments)
end

test "should be able to undo" do

  sgf = SGF::Parser.parse("(;B[aa];W[bb];B[cc])")
  sgf.undo
  assert_equal sgf.move_list, ";B[aa];W[bb]"

end

test "should be able to undo even if there are comments still" do

  sgf = SGF::Parser.parse("(;B[aa];W[bb];B[cc])")

  sgf.add_comment("wow")
  sgf.undo
  assert_equal sgf.move_list, ";B[aa];W[bb]"

  sgf.undo
  assert_equal sgf.focus_to_code, "0"
  sgf.undo
  assert_equal sgf.focus_to_code, "root"
  sgf.undo
  assert_equal sgf.focus_to_code, "root"

end

test "should write the hadnicap info" do

  params = {:size => 19, :white_player => "fuerte", :black_player => "debil", :handicap => 9}.merge(SGF.handi_props(19,9))
  sgf = SGF::Parser.parse("(;B[aa];W[bb];B[cc])")

  params.each {|k,v| sgf.root.write_property(k,v)}

  assert_equal sgf.to_s, "(;FF[4]SZ[19]PW[fuerte]PB[debil]HA[9]AB[dd][jd][pd][dj][jj][pj][dp][jp][pp];B[aa];W[bb];B[cc])"

end

test "should be able to know if the focus points to a node" do

  sgf = SGF::Parser.parse("(;B[aa];W[bb];B[cc])")

  assert sgf.code_to_focus("0-0-0")
  assert sgf.valid_focus?("0-0-0")

  assert_raise(RuntimeError) do
    sgf.code_to_focus("0-0-0-0")
  end

  assert !sgf.valid_focus?("0-0-0-0")
  

end
