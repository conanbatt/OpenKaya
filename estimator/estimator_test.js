
//TODO this should be in the SCORE board as constants
var BLACK = "B"
var WHITE = "W"
var EMPTY = "*"
var BLACK_DEAD = "N"
var WHITE_DEAD = "E"
var NO_OWNER = "X"

//STANDARD TEST BOARD SIZE IS 6x6

var estimator = new Estimator();

var no_point_board = [
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"]
                    ];

test("Should count 0 points for both on the board but account for komi", function(){
    var estimation = estimator.estimate(no_point_board);
    equal(estimation.black_territory,0);
    equal(estimation.white_territory,0);
    equal(estimation.estimation,"W+6.5"); //komi default

});


test("Should allow komi configuration", function(){

    var other_estimator = new Estimator({komi : -10});
    var estimation = other_estimator.estimate(no_point_board);

    equal(estimation.black_territory,0);
    equal(estimation.white_territory,0);
    equal(estimation.estimation,"B+10");
});


var single_stone_board = [
                        ["*","*","*","*","*","*"],
                        ["*","B","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"]
                     ]; 

test("Should make an estimation of the stone's value", function(){
    var  estimation = estimator.estimate(single_stone_board);
    ok(estimation.black_territory > 1);
    ok(estimation.black_territory < 10);
});

var neutral_space_board = [
                    ["*","*","*","*","*","*"],
                    ["*","W","*","W","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","B","*","W","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"]
                ];

test("Should take into consideration opposing stones in the vecinity", function(){

    var estimation = estimator.estimate(single_stone_board);
    var first_estimation_for_black = estimation.black_territory;

    var second_estimation = estimator.estimate(neutral_space_board);
    ok(first_estimation_for_black > second_estimation.black_territory);
});

var clear_territory_board = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

test("Should be precise on definite territories.(Check scoring algorithms for inspiration)", function(){
    var estimation = estimator.estimate(clear_territory_board);
    equal(estimation.black_territory, 6);
    equal(estimation.white_territory, 12);
});

var w_dead_stones_board = [
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"]
                          ];

test("Should account captures", function(){
    var estimation = estimator.estimate(w_dead_stones_board);
    equal(estimation.black_territory,12);
    equal(estimation.black_captures,6);
    equal(estimation.white_territory,6);
    equal(estimation.estimation,"B+5.5");
});

//only for 2-d arrays like the boards
function are_equal_boards(board1, board2){
  
    for(var i=0;i<board1.length;i++){
        for(var j=0;j<board1[i].length;j++){
            if(board1[i][j] != board2[i][j]){ return false }
        }
    }
    return true;
}

test("Should return a painted array with marked territories", function(){

    var estimation = estimator.estimate(w_dead_stones_board);

    var expected_result = [ 
                              ["BP","E","B","X","W","WP"],
                              ["BP","E","B","X","W","WP"],
                              ["BP","E","B","X","W","WP"],
                              ["BP","E","B","X","W","WP"],
                              ["BP","E","B","X","W","WP"],
                              ["BP","E","B","X","W","WP"]
                          ];
    ok(are_equal_boards(estimation.board, expected_result));
});
/*
var w_dead_stones_board = [
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"],
                              ["*","E","B","*","W","*"]
                          ];
*/

test("Should be able to mark a string of stones as dead or alive if you select one of them as dead", function(){

    var estimation = estimator.toggle_LD(w_dead_stones_board, [0,1]);
    //previously marked dead chain is now alive
    var expected_result = [
                              ["*","W","B","*","W","*"],
                              ["*","W","B","*","W","*"],
                              ["*","W","B","*","W","*"],
                              ["*","W","B","*","W","*"],
                              ["*","W","B","*","W","*"],
                              ["*","W","B","*","W","*"]
                          ];

    ok(are_equal_boards(estimation.board, expected_result));

    var estimation = estimator.toggle_LD(w_dead_stones_board, [0,2]);

    //black live chain is now dead
    var expected_result = [
                              ["*","E","N","*","W","*"],
                              ["*","E","N","*","W","*"],
                              ["*","E","N","*","W","*"],
                              ["*","E","N","*","W","*"],
                              ["*","E","N","*","W","*"],
                              ["*","E","N","*","W","*"]
                          ];

    ok(are_equal_boards(estimation.board, expected_result));

    

});

