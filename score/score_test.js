
//TODO this should be in the SCORE board as constants
var BLACK = "B"
var WHITE = "W"
var EMPTY = "*"
var BLACK_DEAD = "N"
var WHITE_DEAD = "E"
var NO_OWNER = "X"

//STANDARD TEST BOARD SIZE IS 6x6

var japanese_score = new Score("Japanese").score;
var chinese_score = new Score("Chinese").score; //TBD later ?. Main difference is that each stone is counted for territory

var no_point_board = [
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"]
                    ];

test("Should count 0 points for both without stones on the board(Japanese)", function(){
    var jscore = japanese_score(no_point_board);
    equal(jscore.black_points,0);
    equal(jscore.white_points,0);
});

test("Should count 0 points for both without stones on the board(Chinese)", function(){
    var cscore = chinese_score(no_point_board);
    equal(cscore.black_points,0);
    equal(cscore.white_points,0);
});


var single_stone_board = [
                        ["B","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"],
                        ["*","*","*","*","*","*"]
                     ]; 

test("Should count 35(Japanese)", function(){
    var score = japanese_score(single_stone_board);
    equal(score.black_points,35);
    equal(score.white_points,0);
    console.log(score);
    console.log(single_stone_board);
});

test("Should count 36(Chinese)", function(){
    var score = chinese_score(single_stone_board);
    equal(score.black_points,36);
    equal(score.white_points,0);
});


var neutral_board = [
                    ["B","W","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"]
                ];

test("Should count 0 points (Japanese)", function(){
    var score = japanese_score(neutral_board);
    equal(score.black_points,0);
    equal(score.white_points,0);
});
test("Should count 1 point for each (Japanese)", function(){
    var score = chinese_score(neutral_board);
    equal(score.black_points,1);
    equal(score.white_points,1);
});


var b_territory_board = [
                ["*","B","*","*","*","*"],
                ["*","B","*","*","*","*"],
                ["*","B","*","*","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","*","*","*"],
                ["*","B","*","*","*","*"]
            ];

test("Should count territory for black(Japanese)", function(){
    var score = japanese_score(b_territory_board);
    equal(score.black_points,6);
    equal(score.white_points,0);
});

test("Should count territory for black(Chinese)", function(){
    var score = japanese_score(b_territory_board);
    equal(score.black_points,12);
    equal(score.white_points,1);
});


var both_territory_board = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

test("Should count territory for both(Japanese)", function(){
    var score = japanese_score(both_territory_board);
    equal(score.black_points,6);
    equal(score.white_points,12);
});

test("Should count territory for both(Chinese)", function(){
    var score = japanese_score(both_territory_board);
    equal(score.black_points,12);
    equal(score.white_points,18);
});

test("SEKI: should count 0 for both (Japanese)", function(){

   var board = [
                    ["B","B","*","W","W","W"],
                    ["B","B","B","W","W","W"],
                    ["B","B","B","W","W","W"],
                    ["B","B","B","W","W","W"],
                    ["B","B","B","W","W","W"],
                    ["*","B","B","W","W","*"]
                ];

    var score = japanese_score(board);
    equal(score.black_points,0);
    equal(score.white_points,0);
});


var seki_board = [
                ["B","B","*","W","*","B"],
                ["B","B","B","W","B","B"],
                ["B","B","B","W","B","B"],
                ["B","B","B","W","B","B"],
                ["B","B","B","W","B","B"],
                ["*","B","B","W","B","*"]
            ];

test("SEKI: should count 0 for both (Japanese)", function(){
    var score = japanese_score(seki_board);
    equal(score.black_points,0);
    equal(score.white_points,0);
});

test("SEKI: should count points for both (Chinese)", function(){
    var score = chinese_score(seki_board);
    equal(score.black_points,28);
    equal(score.white_points,6);
});

var b_dead_stones_board = [
                            ["B","B","*","W","W","N"],
                            ["B","B","*","W","W","N"],
                            ["B","B","*","W","W","N"],
                            ["B","B","*","W","W","N"],
                            ["B","B","*","W","W","N"],
                            ["B","B","*","W","W","*"]
                        ];

test("CAPTURES: should count dead stones double (Japanese)", function(){
    var score = japanese_score(b_dead_stones_board);
    equal(score.black_points,0);
    equal(score.white_points,11);
});
test("CAPTURES: should not count dead stones double (Chinese)", function(){
    var score = chinese_score(b_dead_stones_board);
    equal(score.black_points,12);
    equal(score.white_points,18);
});


var w_dead_stones_board = [
                              ["*","E","B","*","*","*"],
                              ["*","E","B","*","*","*"],
                              ["*","E","B","*","*","*"],
                              ["*","E","B","W","*","*"],
                              ["*","E","B","*","*","*"],
                              ["*","E","B","*","*","*"]
                          ];

test("CAPTURES: should count dead stones double (Japanese)", function(){
    var score = japanese_score(w_dead_stones_board);
    equal(score.black_points,18);
    equal(score.white_points,0);
});

test("CAPTURES: should not count dead stones double (Chinese)", function(){
    var score = chinese_score(w_dead_stones_board);
    equal(score.black_points,18);
    equal(score.white_points,0);
});



