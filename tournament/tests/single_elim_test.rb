require 'cutest'
require File.expand_path("../organiser", File.dirname(__FILE__))
Dir[File.dirname(__FILE__) + "/tournament_systems/*.rb"].each {|file| require file }

test "Must do some testing" do
  assert false
end

