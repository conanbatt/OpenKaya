require "cutest"

require File.expand_path("../lib/sgf", File.dirname(__FILE__))

setup do

end

test "Nodify moves" do

  sgf = SGF.new
  node = ";B[ab]"
  sgf.add_move(node)

  assert sgf.move_list = ";B[ab]"

end

test "Should add comment to a node" do

  sgf = SGF.new
  node = ";B[ab]"
  sgf.add_move(node)
  sgf.add_comment("this guy sucks")

  assert sgf.move_list = ";B[ab]C[This guy sucks]"

  sgf.add_comment("yeah")

  assert sgf.move_list = ";B[ab]C[This guy sucks yeah]"

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

end

#(;FF[4]GM[1]SZ[19]CA[UTF-8]SO[gokifu.com]BC[kr]WC[kr]EV[7th Korean Wonik Cup Siptan]PB[Ryu Chaehyeong]BR[9p]PW[Kang Dongyun]WR[9p]KM[6.5]DT[2011-09-30]RE[W+R]

#;B[qd];W[pp]

test "Should load an sgf file" do
  filename = "mocks/mock.sgf"
  sgf = SGF.new
  sgf.load_file(filename)

  assert_equal sgf.move_list, ";B[qd];W[pp]"
end

