
//TODO this should be in the SCORE board as constants
var BLACK = "B"
var WHITE = "W"
var EMPTY = "*"
var BLACK_DEAD = "N"
var WHITE_DEAD = "E"

//STANDARD TEST BOARD SIZE IS 6x6

var japanese_score = new Score("Japanese").score;
var chinese_score = new Score("Chinese").score; //TBD later ?. Main difference is that each stone is counted for territory

test("Should count 0 points for both without stones on the board", function(){

    var board = [
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"]
                ];
    equal(japanese_score(board).black_points,0);
    equal(japanese_score(board).white_points,0);
});

test("Should count 35 by Japanese Rules", function(){

    var board = [
                    ["B","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"]
                ];
    equal(japanese_score(board).black_points,35);
    equal(japanese_score(board).white_points,0);
});

test("Should count 0 points as all is neutral", function(){
    var board = [
                    ["B","W","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"]
                ];

    equal(japanese_score(board).black_points,0);
    equal(japanese_score(board).white_points,0);
});

test("Should count territory for black", function(){

   var board = [
                    ["*","B","*","*","*","*"],
                    ["*","B","*","*","*","*"],
                    ["*","B","*","*","*","*"],
                    ["*","B","*","W","*","*"],
                    ["*","B","*","*","*","*"],
                    ["*","B","*","*","*","*"]
                ];
    equal(japanese_score(board).black_points,5);
    equal(japanese_score(board).white_points,0);
});

test("Should count territory for both", function(){

   var board = [
                    ["*","B","*","W","*","*"],
                    ["*","B","*","W","*","*"],
                    ["*","B","*","W","*","*"],
                    ["*","B","*","W","*","*"],
                    ["*","B","*","W","*","*"],
                    ["*","B","*","W","*","*"]
                ];
    equal(japanese_score(board).black_points,5);
    equal(japanese_score(board).white_points,10);
});


