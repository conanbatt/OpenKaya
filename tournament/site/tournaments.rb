require "cuba"

Cuba.use Rack::Session::Cookie

Cuba.define do
  on get do
    on "home" do
      res.write render("views/home.html.erb")
    end
    on "create" do
      res.write render("views/create_tournament.html.erb")
    end

    on "javascripts" do
      run Rack::File.new("javascripts")
    end

    on default do
      res.redirect "/home"
    end
  end

  on post do

    on "" do
      res.write "nothing to do here"
    end

  end

end
