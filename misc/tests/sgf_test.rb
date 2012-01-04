require "cutest"

require File.expand_path("../lib/sgf", File.dirname(__FILE__))

setup do

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

  assert_equal sgf.move_list, ";B[ab]C[This guy sucks ]"

  sgf.add_comment("yeah")

  assert_equal sgf.move_list, ";B[ab]C[This guy sucks yeah ]"

end

test "Should add comment to an empty sgf" do

  sgf = SGF.new
  sgf.add_comment("This guy sucks")

  assert sgf.move_list == "C[This guy sucks ]"

  sgf.add_comment("yeah")

  assert sgf.move_list == "C[This guy sucks yeah ]"

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
  sgf = SGF.new
  sgf.load_file(filename)

  assert_equal sgf.move_list, ";B[qd];W[pp]"
end

test "should be able to add a time property to a node" do

  sgf = SGF.new
  b_node = ";B[qd]BL[100.553]"
  w_node = ";B[qa]WL[130.553]"

  sgf.add_move(b_node);
  sgf.add_move(w_node);

  assert sgf.move_list =  ";B[ab]BL[100.553];W[ac]WL[130.553]" 

end

#(;FF[4]GM[1]SZ[19]CA[UTF-8]SO[gokifu.com]BC[kr]WC[kr]EV[7th Korean Wonik Cup Siptan]PB[Ryu Chaehyeong]BR[9p]PW[Kang Dongyun]WR[9p]KM[6.5]DT[2011-09-30]RE[W+R]


test "Should load a sgf metadata" do
  filename = "mocks/mock.sgf"
  sgf = SGF.new
  sgf.load_file(filename)

  assert_equal sgf.metadata(:white_player), "Kang Dongyun"
  assert_equal sgf.metadata(:black_player), "Ryu Chaehyeong"
  assert_equal sgf.metadata(:komi), "6.5"
  assert_equal sgf.metadata(:date), "2011-09-30"
  assert_equal sgf.metadata(:result), "W+R"
  assert_equal sgf.metadata(:file_format), "4"
  assert_equal sgf.metadata(:date), "2011-09-30"
  assert_equal sgf.metadata(:source), "gokifu.com"
  assert_equal sgf.metadata(:black_country), "kr"
  assert_equal sgf.metadata(:white_country), "kr"
  assert_equal sgf.metadata(:encoding), "UTF-8"
  assert_equal sgf.metadata(:size), "19"
  assert_equal sgf.metadata(:event), "7th Korean Wonik Cup Siptan"
  assert_equal sgf.metadata(:rules), "Japanese"
  assert_equal sgf.metadata(:time_set), "5x30 byo-yomi"

end

test 'Should be able to write metadata' do 

  sgf = SGF.new

  sgf.write_metadata(:white_player, "Conan")
  assert_equal sgf.metadata(:white_player), "Conan"

  sgf.write_metadata(:white_player,"Conan2")
  assert_equal sgf.metadata(:white_player), "Conan2"

  assert_raise(RuntimeError) do
    sgf.write_metadata(:total_bs, "bs")
  end

end

test 'Should be able to send a pass move' do

  sgf = SGF.new
  sgf.add_move(";B[]")

  assert sgf.move_list =  ";B[]"

end

test 'Should create a node object' do
  node = Node.new(";B[ac]")

  assert_equal node.color, "B"
  assert_equal node.coordinate, "ac"

  node.add_comment("pepe")
  assert_equal node.comments, "pepe "

  node.add_comment("y yo")
  assert_equal node.comments, "pepe y yo "
end
