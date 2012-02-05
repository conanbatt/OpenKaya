require "cuba/test"
require File.expand_path("../tournaments.rb", File.dirname(__FILE__))
scope do
  test "Homepage" do
    visit "/"
    assert has_content?("Welcome to OpenKaya's tournament organizer")
  end
end
