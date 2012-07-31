require 'cutest'
require File.expand_path("../gem/lib/gg", File.dirname(__FILE__))


test "should convert gtp moves accordingly" do

  #should account the "i"
  assert_equal convert_move("P7"), "om"

end
