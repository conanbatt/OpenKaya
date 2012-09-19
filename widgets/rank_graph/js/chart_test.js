mock_games = [

    { date: new Date("Mon Aug 5 2012 00:00:00 GMT-0300 (ART)"),
      game_id: 3588,
      white_player:"Smar",
      black_player:"Fakeman",
      opponent: "Smar",
      result: "B+6.5",
      value: -14.12
    },
    { date: new Date("Mon Aug 20 2012 00:00:00 GMT-0300 (ART)"),
      game_id: 3589,
      white_player:"Zen",
      black_player:"Fakeman",
      opponent: "Zen",
      result: "W+Resignation",
      value: -12.12
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

module("basic_widget_behavior", {setup:function(){
        $("#user-chart").rank_graph({games: mock_games});
    }
    ,teardown: function() {
//        $("#user-chart").children().remove();
}});


test("Should be able to output a graph", function() {

    $("#user-chart").rank_graph({data: mock_games});

    ok($("#user-chart").html().length > 0);
    equal($("circle.data-point").length, 2);
});

asyncTest("Should be able to re-draw the same graph with another data", function(){

    $("#user-chart").rank_graph("games", mock_games2);

    expect( 1 );

    setTimeout(function(){ 
        console.log($("circle.data-point").length);
        equal($("circle.data-point").length, 1);
        start(); 
    }
    , 2000);

})

