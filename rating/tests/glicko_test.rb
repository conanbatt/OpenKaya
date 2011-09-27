require 'cutest'
require File.expand_path("../strategies/glicko", File.dirname(__FILE__))



test "Validate should raise error if rating is negative" do #Should it?

  assert_raise(Glicko::GlickoError) do 
    Glicko.validate(-5)
  end

end

test "Validate should raise error if the rating doesnt correspond to the rank" do

  assert_raise(Glicko::GlickoError) do  
    Glicko.validate(5)
  end

end

test "Should calculate win probability between 2 players" do

  player_a = {:id => "a", :rating => 500}
  player_b = {:id => "a", :rating => 500}

  assert_equal Glicko.win_probability(player_a, player_b), 0.5
  #TODO add a few more cases than this. 
end

test "Should make a proper rating => rank transformation" do

  assert_equal Glicko.rank(5), "9p"
  #TODO its probably best to make a fixture here. [[ratinga,ranka],[ratingb, rankb]..etc] then iterate
  
end

