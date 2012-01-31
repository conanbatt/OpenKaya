require "cuba"

Cuba.use Rack::Session::Cookie

Cuba.define do
  on get do
    on "home" do
      res.write "Welcome to OpenKaya's tournament organizer"
    end

    on default do
      res.redirect "/home"
    end
  end
end
