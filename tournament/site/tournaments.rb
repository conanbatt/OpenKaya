require "cuba"

Cuba.use Rack::Session::Cookie

Cuba.define do
  on get do
    on "home" do
      res.write render("views/home.html.erb")
    end

    on default do
      res.redirect "/home"
    end
  end
end
