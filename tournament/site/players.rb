require "cuba"

Cuba.use Rack::Session::Cookie

PLAYERS_API = Cuba.new do

  on get do
    on "list" do
      @players = Player.all
      res.write render("views/list_players.html.erb")
    end
    on ":id" do |id|
      @player = Player.find(id)
      res.write "Name: #{@player.name} \n Rank: #{@player.rank}"
    end
    on default do
      res.redirect "list"
    end
  end

  on post do
    on "create" do 
      on param("name"),param("rank") do |name, rank|
        player = Player.new(:name => name, :rank => rank)
        player.save
        res.redirect "list"
      end
    end
  end

end
