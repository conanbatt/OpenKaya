
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

test("Should count 0 points for both without stones on the board", function(){

    var board = [
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"],
                    ["*","*","*","*","*","*"]
                ];

    var score = japanese_score(board);
    equal(score.black_points,0);
    equal(score.white_points,0);
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

    var score = japanese_score(board);
    console.log('EMANC*UUUUUUUUUUUUUUUUUUUUUUUUUUUUU')
    console.log(score)
    equal(score.black_points,35);
    // equal(score.white_points,0);
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


    var score = japanese_score(board);
    equal(score.black_points,0);
    equal(score.white_points,0);
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

    var score = japanese_score(board);
    equal(score.black_points,6);
    equal(score.white_points,0);
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

    var score = japanese_score(board);
    equal(score.black_points,6);
    equal(score.white_points,12);
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

test("SEKI: should count 0 for both (Japanese)", function(){

   var board = [
                    ["B","B","*","W","*","B"],
                    ["B","B","B","W","B","B"],
                    ["B","B","B","W","B","B"],
                    ["B","B","B","W","B","B"],
                    ["B","B","B","W","B","B"],
                    ["*","B","B","W","B","*"]
               ];

    var score = japanese_score(board);
    equal(score.black_points,0);
    equal(score.white_points,0);
});

test("CAPTURES: should count dead stones double (Japanese)", function(){

   var board = [
                    ["B","B","*","W","W","N"],
                    ["B","B","*","W","W","N"],
                    ["B","B","*","W","W","N"],
                    ["B","B","*","W","W","N"],
                    ["B","B","*","W","W","N"],
                    ["B","B","*","W","W","*"]
               ];

    var score = japanese_score(board);
    equal(score.black_points,0);
    equal(score.white_points,11);
});

test("CAPTURES: should count dead stones double (Japanese)", function(){

   var board = [
                   ["*","E","B","*","*","*"],
                   ["*","E","B","*","*","*"],
                   ["*","E","B","*","*","*"],
                   ["*","E","B","W","*","*"],
                   ["*","E","B","*","*","*"],
                   ["*","E","B","*","*","*"]
               ];

    var score = japanese_score(board);
    equal(score.black_points,18);
    equal(score.white_points,0);
});



