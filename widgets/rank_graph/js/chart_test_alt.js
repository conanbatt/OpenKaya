mock_games = [
	{
		datetime_played: new Date("Mon Aug 5 2012 00:00:00 GMT-0300 (ART)"),
		type: "match",
		board_id: 1,
		white_player: "Smar",
		black_player: "Fakeman",
		result: "B+6.5",
		rating: -14.12,
		color: "B",
		y: -14.12,
		name: "first",
    },
	{
		datetime_played: new Date("Mon Aug 20 2012 00:00:00 GMT-0300 (ART)"),
		type: "match",
		board_id: 2,
		white_player: "Zen",
		black_player: "Fakeman",
		result: "W+Resignation",
		rating: -12.12,
		color: "B",
		y: -12.12,
		name: "second",
    },
]

mock_games2 = [

    { date: new Date("Mon Aug 5 2012 00:00:00 GMT-0300 (ART)"),
      game_id: 3600,
      white_player:"FuegoBot",
      black_player:"GNUBot",
      opponent: "GNUBot",
      result: "B+Forfeit",
      value: 5.12
    },
]

module("basic_widget_behavior", {
	setup:function() {
        $("#user-chart").rank_graph({games: mock_games});
    },
	teardown: function() {
		//$("#user-chart").children().remove();
	}
});


test("Should be able to output a graph", function() {

    $("#user-chart").rank_graph({data: mock_games});

    ok($("#user-chart").html().length > 0);
	equal($("#user-chart").rank_graph("get_chart").series[0].points.length, mock_games.length);
});

$.ajax({
	url: "http://kaya.gs/sgf_storage_dev/rating_list.php",
	data: {
		user: "conanbatt",
		from: 0,
		count: 50,
	},
	type: "GET",
	dataType: "json",
	success: function(data){
		asyncTest("Should be able to re-draw the same graph with another data", function(){

			$("#user-chart").rank_graph("games", data);

			expect( 1 );

			equal($("#user-chart").rank_graph("get_chart").series[0].points.length, data.length);
			start();
		});
	},
	error: function(data) {
		console.log(data);
	},
});
