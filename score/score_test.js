//TODO this should be in the SCORE board as constants
var BLACK = "B"
var WHITE = "W"
var EMPTY = "*"
var BLACK_DEAD = "N"
var WHITE_DEAD = "E"
var NO_OWNER = "X"

// Declaration
var japanese_score;
var chinese_score;

// Helper functions
    function genericSetup(board) {
        japanese_score = new Score("Japanese", board);
        chinese_score = new Score("Chinese", board); //TBD later ?. Main difference is that each stone is counted for territory
    }

    function genericTeardown() {
        japanese_score = undefined;
        chinese_score = undefined;
    }
    
    function countChars(array, the_char) {
        count = 0
        for(var row_index in array) 
        {
            for(var col_index in array[row_index])
            {
                if (array[row_index][col_index] == the_char)
                    count++;
            }
        }
        return count;
    }
    function sameBoards(array1, array2, verbose)
    {
        if(array1.length != array2.length)
          return false;
          
        for(var row_index in array1)
        {
          var row1 = array1[row_index];
          var row2 = array2[row_index];
          
          if(row1.length != row2.length)
            return false;
            
          for(var col_index in array2)
          {
            if (row1[col_index] != row2[col_index]) {
                if(verbose)
                    return "row: " + row_index + " col: " + col_index; 
                else
                    return false;
            }
          }
        }
        
        return true;
    }

//NOTE: standard test board is 6x6

// No point board
    module("No points", {
        setup: function() {
            genericSetup([
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("Should count 0 points for both without stones on the board(Japanese)", function(){
        var jscore = japanese_score.calculate_score();
        equal(jscore.black_points, 0);
        equal(jscore.white_points, 0);
    });

    test("Should count 0 points for both without stones on the board(Chinese)", function(){
        var cscore = chinese_score.calculate_score();
        equal(cscore.black_points, 0);
        equal(cscore.white_points, 0);
    });


// Single stone board
    module("Single stone board", {
        setup: function() {
            genericSetup([
                ["B","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("Should count 35(Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 35);
        equal(score.white_points, 0);
    });

    test("Should count 36(Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points, 36);
        equal(score.white_points, 0);
    });


// Neutral board
    module("Neutral board", {
        setup: function() {
            genericSetup([
                ["B","W","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("Should count 0 points (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 0);
        equal(score.white_points, 0);
    });
    test("Should count 1 point for each (Japanese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points, 1);
        equal(score.white_points, 1);
    });


// Black territory board
    module("Black territory board", {
        setup: function() {
            genericSetup([
                ["*","B","*","*","*","*"],
                ["*","B","*","*","*","*"],
                ["*","B","*","*","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","*","*","*"],
                ["*","B","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("Should count territory for black(Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 6);
        equal(score.white_points, 0);
    });

    test("Should count territory for black(Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points, 12);
        equal(score.white_points, 1);
    });


// Both territory board
    module("Both territory board", {
        setup: function() {
            genericSetup([
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("Should count territory for both(Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 6);
        equal(score.white_points, 12);
    });

    test("Should count territory for both(Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points, 12);
        equal(score.white_points, 18);
    });

//Life with 2 non touching groups of stones:
    module("Life with 2 non touching groups", {
        setup: function() {
            genericSetup([
                ["*","*","*","*","*","*","*","*"],
                ["*","B","B","B","B","B","B","*"],
                ["*","B","W","W","W","B","B","*"],
                ["*","B","W","*","W","B","B","*"],
                ["*","B","B","W","*","W","B","*"],
                ["*","B","B","W","W","W","B","*"],
                ["*","B","B","B","B","B","B","*"],
                ["*","*","*","*","*","*","*","*"],
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("Should count territory for both(Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 28);
        equal(score.white_points, 2);
    });


//Territory in the corner
    module("Territory in the corner", {
        setup: function() {
            genericSetup([
                ["*","B","B","W","W","W"],
                ["B","*","B","W","W","W"],
                ["B","B","B","W","W","W"],
                ["B","B","B","W","W","W"],
                ["B","B","B","W","*","W"],
                ["B","B","B","W","W","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("Should count territory for both(Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 2);
        equal(score.white_points, 2);
    });

    test("Should count territory for both(Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points, 18);
        equal(score.white_points, 18);
    });


// Seki board 1 (eyes)
    module("Seki board 1", {
        setup: function() {
            genericSetup([
                ["B","B","*","W","W","W"],
                ["B","B","B","W","W","W"],
                ["B","B","B","W","W","W"],
                ["B","B","B","W","W","W"],
                ["B","B","B","W","W","W"],
                ["*","B","B","W","W","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count 0 for both (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 0);
        equal(score.white_points, 0);
    });

      test("should count points for both (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points, 17);
        equal(score.white_points, 18);
    });


//TODO check this out : http://www.lifein19x19.com/forum/viewtopic.php?p=79204#p79204"


// Seki board 2 (eyes)
    module("Seki board 2", {
        setup: function() {
            genericSetup([
                ["B","B","*","W","*","B"],
                ["B","B","B","W","B","B"],
                ["B","B","B","W","B","B"],
                ["B","B","B","W","B","B"],
                ["B","B","B","W","B","B"],
                ["*","B","B","W","B","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count 0 for both (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,0);
        equal(score.white_points,0);
    });

    test("should count points for both (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,28);
        equal(score.white_points,6);
    });

// Seki board 3 (eyes + no eyes)
    module("Seki board 3", {
        setup: function() {
            genericSetup([
                ["W","*","B","*","B","B"],
                ["*","W","B","B","B","B"],
                ["B","B","W","W","B","B"],
                ["*","B","W","W","W","W"],
                ["B","B","W","W","*","W"],
                ["B","B","W","W","W","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });


// Seki board 4 (big eyes, small eyes...)
    module("Seki board 4", {
        setup: function() {
            genericSetup([
                ["*","*","B","*","W","*"],
                ["*","*","B","W","W","*"],
                ["B","B","B","W","W","*"],
                ["*","*","W","B","W","W"],
                ["W","W","*","B","B","B"],
                ["*","W","*","B","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count 0 for both (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,0);
        equal(score.white_points,3);
    });

    test("should count points for both (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,16);
        equal(score.white_points,15);
    });


// Seki board 5 (real game example...)
    module("Seki board 5", {
        setup: function() {
            genericSetup([
                ["*","B","B","B","W","*","*","*","*"],
                ["W","*","B","W","W","*","W","*","*"],
                ["W","W","B","W","*","*","W","*","*"],
                ["B","W","W","B","W","W","*","*","*"],
                ["B","B","B","B","W","*","W","*","*"],
                ["*","*","B","B","B","W","*","*","*"],
                ["*","*","B","B","W","*","W","*","*"],
                ["*","*","B","W","W","W","*","*","*"],
                ["*","*","B","B","W","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count points for both (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 8);
        equal(score.white_points, 30);
    });

    test("should count points for both (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,27);
        equal(score.white_points,52);
    });


// Seki board 6 (single pointers...)
    module("Seki board 6", {
        setup: function() {
            genericSetup([
                ["*","W","*","W","*","W"],
                ["W","*","W","*","W","*"],
                ["*","W","*","W","*","W"],
                ["W","*","W","*","W","*"],
                ["*","W","*","W","*","W"],
                ["W","*","W","*","W","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count points for white (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 0);
        equal(score.white_points, 18);
    });

    test("should count points for both (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points, 0);
        equal(score.white_points, 36);
    });

// Seki board 7
        module("Seki board 7", {
                setup: function() {
                        genericSetup([
                                ["*","W","W","W","*","B","B","W","*"],
                                ["B","B","W","B","B","B","W","W","W"],
                                ["B","W","W","B","B","W","W","B","B"],
                                ["B","B","B","B","W","W","*","B","*"],
                                ["B","W","B","B","B","W","W","W","B"],
                                ["W","W","B","W","W","B","W","B","B"],
                                ["*","W","W","W","W","B","B","B","B"],
                                ["W","B","W","W","B","B","B","B","*"],
                                ["*","B","*","W","W","B","B","B","B"],

                        ]);
                },
                teardown: function() {
                        genericTeardown();
                }
        });

        test("Full board jigo (Japanese)", function(){
                var score = japanese_score.calculate_score();
                equal(score.black_points, 0);
                equal(score.white_points, 0);
        });

        test("Black wins on captures(Chinese)", function(){
                var score = chinese_score.calculate_score();
                equal(score.black_points, 42);
                equal(score.white_points, 34);
        });

// Black dead stones board
    module("Black dead stones board", {
        setup: function() {
            genericSetup([
                ["B","B","*","W","W","N"],
                ["B","B","*","W","W","N"],
                ["B","B","*","W","W","N"],
                ["B","B","*","W","W","N"],
                ["B","B","*","W","W","N"],
                ["B","B","*","W","W","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count dead stones double (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,0);
        equal(score.white_points,11);
    });

    test("should not count dead stones double (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,12);
        equal(score.white_points,18);
    });


// White dead stones board
    module("White dead stones board", {
        setup: function() {
            genericSetup([
                ["*","E","B","*","*","*"],
                ["*","E","B","*","*","*"],
                ["*","E","B","*","*","*"],
                ["*","E","B","W","*","*"],
                ["*","E","B","*","*","*"],
                ["*","E","B","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count dead stones double (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,18);
        equal(score.white_points,0);

    });

    test("should not count dead stones double (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,18);
        equal(score.white_points,1);
    });

    module("Corner dead stones(bugcase)", {
        setup: function() {
            genericSetup([
                ["*","*","B","W","*","*"],
                ["E","*","B","W","*","*"],
                ["*","*","B","W","*","W"],
                ["B","B","*","W","W","*"],
                ["*","*","B","*","*","*"],
                ["*","*","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });
    test("should count proper corner territory(bug case)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,7);
        equal(score.white_points,5);
    });

    module("Point inside Ko not counted (bugcase)", {
        setup: function() {
            genericSetup([
                ["*","*","*","*","*","*"],
                ["*","E","E","B","B","*"],
                ["*","E","B","*","B","*"],
                ["*","E","E","B","B","*"],
                ["*","*","*","*","*","*"],
                ["*","*","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });
    test("should count black point inside (bug case)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points, 35);
        equal(score.white_points, 0);
    });
    
// Side kosumi issue (false eye in the middle of two living groups = should be counted as 1 point)
    module("Side kosumi issue", {
        setup: function() {
            genericSetup([
                ["*","*","*","B","W","*"],
                ["*","*","*","B","W","W"],
                ["*","*","*","B","B","W"],
                ["*","*","*","B","W","*"],
                ["*","*","*","B","W","W"],
                ["*","*","*","B","W","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count the point in the kosumi/false eye (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,18);
        equal(score.white_points,3);

    });

    test("should count the point in the kosumi/false eye (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,25);
        equal(score.white_points,11);
    });
    
// Scoring should guess when a point isn't a point after full dame filling
    module("Dame filling", {
        setup: function() {
            genericSetup([
                ["*","B","*","*","B","*"],
                ["W","W","B","B","B","B"],
                ["*","W","W","W","B","B"],
                ["W","*","W","*","W","*"],
                ["*","*","W","W","B","B"],
                ["*","*","W","W","B","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("shouldn't count the point in the false eyes as they'll be filled after dame filling (Japanese)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,3);
        equal(score.white_points,6);

    });

    test("should count the points in the false eyes as after filling, it's still one point (Chinese)", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,15);
        equal(score.white_points,19);
    });

// Scoring should guess when a point isn't a point after full dame filling (bugcase)
    module("Dame filling", {
        setup: function() {
            genericSetup([
                ["*","*","*","*","*","*","*","*","*"],
                ["B","B","*","*","*","*","*","*","*"],
                ["W","W","B","B","B","B","B","B","B"],
                ["*","W","W","W","W","W","W","W","W"],
                ["W","*","*","*","*","*","*","*","*"],
                ["*","W","*","*","*","*","*","*","*"],
                ["B","W","W","W","W","W","W","W","W"],
                ["B","B","B","W","B","B","B","B","B"],
                ["B","B","*","B","B","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("shouldn't count the point in the false eyes as they'll be filled after dame filling (Japanese) - bugcase", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,20);
        equal(score.white_points,16);

    });

    test("should count the points in the false eyes as after filling, it's still one point (Chinese) - bugcase", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,43);
        equal(score.white_points,37);
    });


    /*
    This bug case has been commented out because it seems to not be worth it to invest the time
    to fix this in a fullproof way - a naive approach was tried and failed in a previous commit. 

    For reference, as of 11/27/2012, KGS is also unable to handle this situation correctly.

    */

    // Scoring should guess when a point isn't a point after full dame filling (bugcase #2)
    // Thank you Kanin for reporting it!

    /*
    module("Dame filling", {
        setup: function() {
            genericSetup([
                ["*","W","B","B","B","W","*","*","*"],
                ["*","W","B","*","B","W","*","*","*"],
                ["*","W","B","B","B","W","*","*","*"],
                ["*","W","B","*","B","W","*","*","*"],
                ["*","W","B","B","B","W","*","*","*"],
                ["*","W","B","W","W","W","*","*","*"],
                ["*","W","B","B","*","W","*","*","*"],
                ["*","W","B","*","B","W","*","*","*"],
                ["*","W","W","B","*","W","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("shouldn't count the point in the false eyes as they'll be filled after dame filling (Japanese) - bugcase#2", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,2);
        equal(score.white_points,36);

    });

    test("should count the points in the false eyes as after filling, it's still one point (Chinese) - bugcase#2", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,22);
        equal(score.white_points,57);
    });
    */
    
    module("Miai to make a real point (bugcase extracted regression from Kanin's bug fix)", {
        setup: function() {
            genericSetup([
                ["*","B","*","W","*"],
                ["*","B","*","W","*"],
                ["*","B","W","*","*"],
                ["*","B","*","W","*"],
                ["*","B","*","W","*"],
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });
    test("should count 3-4 as a point", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,5);
        equal(score.white_points,6);
    });
    

    /* Issue #41: https://github.com/conanbatt/OpenKaya/issues/41 */
    //1 point isn't being counted in https://beta.kaya.gs/gospeed/5839
    //4 points aren't being counted in https://beta.kaya.gs/gospeed/match/36706

     module("Normal eye not being seen! (bugcase extracted from issue #41)", {
        setup: function() {
            genericSetup([
                ["B","B","B","B","B","B","B","B"],
                ["*","*","*","*","*","*","*","*"],
                ["*","*","*","*","*","*","*","*"],
                ["B","B","B","*","*","*","*","*"],
                ["W","W","B","B","*","*","*","*"],
                ["*","W","B","*","B","*","*","*"],
                ["W","W","W","B","*","*","*","*"],
                ["*","*","W","B","*","*","*","*"],
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });
    test("should count 6-4 as a point", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,37);
        equal(score.white_points,3);
    });
    
    module("Game #1 from bugcase#41 1 Point counted as Dame for no reason", {
        setup: function() {
            genericSetup([
                ["*","N","N","W","*","*","*","*","*","*","*","*","*","W","B","B","W","*","*"],
                ["W","W","*","W","N","N","W","*","*","W","*","*","*","W","B","W","W","W","*"],
                ["*","W","W","W","W","N","W","W","W","W","W","W","W","W","B","B","W","*","*"],
                ["W","W","*","*","*","W","B","B","B","B","W","B","*","W","W","B","W","W","W"],
                ["B","B","W","W","W","W","W","W","B","B","W","B","B","B","B","B","B","B","B"],
                ["*","*","B","B","B","B","*","B","*","B","B","B","B","*","*","*","B","*","*"],
                ["*","B","*","*","*","*","B","*","B","W","*","W","*","B","B","*","B","*","*"],
                ["*","*","*","*","*","*","*","*","B","W","W","*","W","W","B","*","B","*","*"],
                ["*","*","*","*","*","*","*","*","*","B","W","*","*","*","W","B","*","*","*"],
                ["*","*","B","*","*","*","*","*","*","B","B","W","*","W","W","B","B","B","*"],
                ["*","*","*","*","*","*","*","*","*","B","W","*","*","W","B","B","W","B","*"],
                ["*","*","*","*","*","*","*","*","B","B","W","W","*","*","W","B","W","W","B"],
                ["*","B","*","*","*","*","*","*","*","E","B","W","*","*","*","W","W","B","*"],
                ["B","*","*","*","*","*","*","*","*","E","B","B","W","W","*","W","B","B","*"],
                ["W","B","B","*","*","*","*","*","*","*","*","B","B","W","*","W","B","*","B"],
                ["W","W","W","B","B","B","B","*","*","E","*","*","B","W","*","*","W","B","B"],
                ["*","*","*","W","W","B","*","B","*","*","*","B","B","B","W","*","W","W","W"],
                ["*","*","W","*","*","W","B","*","*","B","*","*","*","B","W","*","W","*","*"],
                ["*","*","*","W","*","W","B","*","*","*","*","*","*","B","B","W","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count the point in this normal eye", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,119);
        equal(score.white_points,69);
        
        var expected =  [
            ["-","N","N","W","-","-","-","-","-","-","-","-","-","W","B","B","W","-","-"],
            ["W","W","-","W","N","N","W","-","-","W","-","-","-","W","B","W","W","W","-"],
            ["-","W","W","W","W","N","W","W","W","W","W","W","W","W","B","B","W","-","-"],
            ["W","W","-","-","-","W","B","B","B","B","W","B","X","W","W","B","W","W","W"],
            ["B","B","W","W","W","W","W","W","B","B","W","B","B","B","B","B","B","B","B"],
            ["+","+","B","B","B","B","X","B","+","B","B","B","B","+","+","+","B","+","+"],
            ["+","B","+","+","+","+","B","+","B","W","X","W","X","B","B","+","B","+","+"],
            ["+","+","+","+","+","+","+","+","B","W","W","-","W","W","B","+","B","+","+"],
            ["+","+","+","+","+","+","+","+","+","B","W","-","-","-","W","B","+","+","+"],
            ["+","+","B","+","+","+","+","+","+","B","B","W","-","W","W","B","B","B","+"],
            ["+","+","+","+","+","+","+","+","+","B","W","-","-","W","B","B","W","B","+"],
            ["+","+","+","+","+","+","+","+","B","B","W","W","-","-","W","B","W","W","B"],
            ["+","B","+","+","+","+","+","+","+","E","B","W","-","-","-","W","W","B","+"],
            ["B","+","+","+","+","+","+","+","+","E","B","B","W","W","-","W","B","B","+"],
            ["W","B","B","+","+","+","+","+","+","+","+","B","B","W","-","W","B","+","B"],
            ["W","W","W","B","B","B","B","+","+","E","+","+","B","W","-","-","W","B","B"],
            ["-","-","-","W","W","B","+","B","+","+","+","B","B","B","W","-","W","W","W"],
            ["-","-","W","-","-","W","B","+","+","B","+","+","+","B","W","-","W","-","-"],
            ["-","-","-","W","-","W","B","+","+","+","+","+","+","B","B","W","-","-","-"]
        ];
        equal(sameBoards(score.scoring_grid, expected), true);
    });

    test("should count the point in this normal eye", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,206);
        equal(score.white_points,151);
    });

    module("Game #2 from bugcase#41 4 Points counted as Dame for no reason", {
        setup: function() {
            genericSetup([
                ["*","*","*","*","*","*","*","*","*","*","*","*","*","*","B","W","W","*","*"],
                ["*","*","B","E","*","E","B","*","*","*","*","*","*","*","B","B","W","*","*"],
                ["*","*","B","E","*","E","B","B","B","B","*","*","*","*","*","B","W","W","*"],
                ["*","*","B","B","E","E","E","E","*","E","B","*","*","B","B","B","B","W","*"],
                ["*","*","B","E","E","B","*","*","E","E","B","*","*","B","W","W","W","N","*"],
                ["*","B","B","E","B","B","B","B","B","E","B","*","B","B","B","B","W","W","*"],
                ["*","E","E","E","B","*","*","B","E","*","E","B","B","B","B","W","W","*","*"],
                ["*","*","E","B","*","*","B","B","*","B","B","B","W","B","B","W","*","W","*"],
                ["*","B","B","B","B","B","W","B","B","B","W","W","W","W","W","B","W","W","W"],
                ["B","B","B","B","W","W","W","W","W","W","*","W","*","W","W","B","B","W","B"],
                ["B","W","B","W","*","W","N","W","W","*","*","*","*","W","W","B","*","B","B"],
                ["W","W","W","W","W","W","N","N","N","W","*","W","*","W","W","B","*","*","*"],
                ["N","N","N","N","N","W","N","*","*","W","*","*","W","W","*","B","*","*","*"],
                ["*","N","*","N","N","N","W","*","*","*","W","W","*","W","B","B","*","*","*"],
                ["*","W","N","*","W","W","W","*","*","W","*","N","*","W","*","B","*","*","*"],
                ["*","W","N","N","*","*","*","*","*","*","*","*","*","*","W","B","*","*","*"],
                ["*","N","W","N","N","W","W","*","*","W","*","N","*","W","*","W","B","*","*"],
                ["*","W","W","W","W","N","*","*","*","*","*","W","*","*","W","W","B","*","*"],
                ["*","*","*","*","*","*","*","*","*","*","*","*","*","*","W","B","B","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count this game accurately", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,119);
        equal(score.white_points,124);
    });

    test("should count this game accurately", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,177);
        equal(score.white_points,182);
    });
    
    /* End of issue #41 test cases */

/* Grid coloring testing */

    module("Basic coloring", {
        setup: function() {
            genericSetup([
                ["*","*","*","*","*","*","*","*","*"],
                ["*","*","*","*","*","*","*","*","*"],
                ["B","B","B","B","B","B","B","B","B"],
                ["W","W","W","W","W","W","W","W","W"],
                ["*","*","*","*","*","*","*","*","*"],
                ["*","*","*","*","*","*","*","*","*"],
                ["*","*","*","*","*","*","*","*","*"],
                ["*","*","*","*","*","*","*","*","*"],
                ["*","*","*","*","*","*","*","*","*"],
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count the points correctly and set all the points with the respective color", function(){
        var score = chinese_score.calculate_score();
        equal(score.black_points,27);
        equal(score.white_points,54);
        equal(sameBoards(score.scoring_grid, 
          [
                  ["+","+","+","+","+","+","+","+","+"],
                  ["+","+","+","+","+","+","+","+","+"],
                  ["B","B","B","B","B","B","B","B","B"],
                  ["W","W","W","W","W","W","W","W","W"],
                  ["-","-","-","-","-","-","-","-","-"],
                  ["-","-","-","-","-","-","-","-","-"],
                  ["-","-","-","-","-","-","-","-","-"],
                  ["-","-","-","-","-","-","-","-","-"],
                  ["-","-","-","-","-","-","-","-","-"],
          ]), true);
        });

        
    module("Advanced coloring - dead stones, seki", {
        setup: function() {
            genericSetup([
                ["*","W","W","W","*","B","B","W","*"],
                ["B","B","W","B","B","B","W","W","W"],
                ["B","W","W","B","B","W","W","B","B"],
                ["B","B","B","B","W","W","*","B","B"],
                ["B","W","B","B","B","W","W","W","B"],
                ["W","W","B","W","W","B","W","B","B"],
                ["*","W","W","W","W","B","B","B","B"],
                ["W","B","W","W","B","B","B","E","*"],
                ["*","B","*","W","W","B","B","B","B"],
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count the points correctly and set all the points with the respective color", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,1);
        equal(score.white_points,0);
        equal(sameBoards(score.scoring_grid, 
          [
                ["X","W","W","W","X","B","B","W","X"],
                ["B","B","W","B","B","B","W","W","W"],
                ["B","W","W","B","B","W","W","B","B"],
                ["B","B","B","B","W","W","X","B","B"],
                ["B","W","B","B","B","W","W","W","B"],
                ["W","W","B","W","W","B","W","B","B"],
                ["X","W","W","W","W","B","B","B","B"],
                ["W","B","W","W","B","B","B","E","X"],
                ["X","B","X","W","W","B","B","B","B"],
          ]), true);
        });
        
    module("Advanced coloring based on previous bugcase", {
        setup: function() {
            genericSetup([
                ["*","*","B","W","*","*"],
                ["E","*","B","W","*","*"],
                ["*","*","B","W","*","W"],
                ["B","B","*","W","W","*"],
                ["*","*","B","*","*","*"],
                ["*","*","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });
    test("should count proper corner territory(bug case)", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,7);
        equal(score.white_points,5);
        equal(sameBoards(score.scoring_grid, 
          [
                ["+","+","B","W","-","-"],
                ["E","+","B","W","-","-"],
                ["+","+","B","W","-","W"],
                ["B","B","X","W","W","X"],
                ["X","X","B","X","X","X"],
                ["X","X","X","X","X","X"]
          ]), true);
    });

    
    module("Advanced coloring - dame", {
        setup: function() {
            genericSetup([
                ["*","*","*","*","*","*","*","*","*"],
                ["B","B","*","*","*","*","*","*","*"],
                ["W","W","B","B","B","B","B","B","B"],
                ["*","W","W","W","W","W","W","W","W"],
                ["W","*","*","*","*","*","*","*","*"],
                ["*","W","*","*","*","*","*","*","*"],
                ["B","W","W","W","W","W","W","W","W"],
                ["B","B","B","W","B","B","B","B","B"],
                ["B","B","*","B","B","*","*","*","*"]
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });

    test("should count the points correctly and set all the points with the respective color", function(){
        var score = japanese_score.calculate_score();
        equal(score.black_points,20);
        equal(score.white_points,16);
        equal(sameBoards(score.scoring_grid, 
          [
                ["+","+","+","+","+","+","+","+","+"],
                ["B","B","+","+","+","+","+","+","+"],
                ["W","W","B","B","B","B","B","B","B"],
                ["-","W","W","W","W","W","W","W","W"],
                ["W","-","-","-","-","-","-","-","-"],
                ["X","W","-","-","-","-","-","-","-"],
                ["B","W","W","W","W","W","W","W","W"],
                ["B","B","B","W","B","B","B","B","B"],
                ["B","B","X","B","B","+","+","+","+"]
          ]), true);
        });
    
// China breaker
// Juego con reglas chinas. Archivo: ~/Downloads/sgf/juego_chino_rompe_scoring.sgf
    module("Single stone board", {
        setup: function() {
            genericSetup([
                ["W", "B", "B", "B", "*", "B", "*", "B", "W", "W", "*", "*", "N", "*", "W", "*", "W", "*", "W", ],
                ["W", "W", "B", "B", "B", "*", "B", "*", "B", "W", "*", "W", "N", "N", "W", "W", "N", "W", "*", ],
                ["W", "B", "B", "B", "W", "B", "*", "B", "B", "B", "W", "W", "W", "N", "*", "*", "N", "N", "W", ],
                ["W", "W", "W", "W", "W", "B", "B", "E", "E", "*", "B", "W", "N", "N", "N", "N", "N", "W", "*", ],
                ["*", "*", "N", "*", "W", "W", "W", "B", "*", "B", "B", "W", "W", "N", "N", "N", "N", "W", "W", ],
                ["W", "N", "N", "W", "W", "B", "B", "B", "B", "W", "B", "W", "W", "W", "N", "W", "W", "N", "*", ],
                ["*", "W", "N", "*", "W", "B", "B", "B", "W", "W", "W", "W", "*", "W", "N", "W", "*", "W", "W", ],
                ["W", "*", "W", "W", "W", "W", "B", "B", "B", "B", "W", "W", "*", "*", "W", "*", "W", "W", "*", ],
                ["*", "W", "W", "B", "W", "W", "W", "B", "W", "B", "B", "B", "W", "W", "*", "W", "W", "*", "W", ],
                ["W", "W", "B", "B", "B", "W", "B", "B", "W", "W", "W", "B", "B", "W", "W", "B", "B", "W", "W", ],
                ["W", "B", "*", "B", "E", "B", "B", "W", "W", "W", "W", "W", "B", "W", "W", "B", "B", "B", "W", ],
                ["B", "B", "*", "B", "*", "*", "B", "B", "B", "B", "W", "W", "W", "W", "W", "B", "*", "B", "W", ],
                ["*", "*", "B", "B", "B", "B", "*", "B", "B", "B", "W", "N", "N", "*", "W", "B", "*", "B", "B", ],
                ["B", "B", "*", "*", "B", "*", "*", "*", "B", "B", "B", "W", "*", "*", "W", "B", "*", "*", "*", ],
                ["B", "*", "*", "*", "*", "*", "*", "B", "W", "W", "B", "W", "*", "W", "B", "*", "*", "*", "*", ],
                ["B", "*", "B", "*", "B", "*", "B", "B", "W", "W", "W", "W", "*", "W", "B", "*", "E", "*", "*", ],
                ["B", "B", "B", "B", "B", "*", "*", "B", "B", "W", "W", "W", "W", "B", "*", "B", "B", "*", "*", ],
                ["*", "*", "B", "*", "*", "*", "B", "B", "B", "B", "W", "W", "B", "B", "B", "*", "*", "*", "*", ],
                ["*", "*", "B", "B", "B", "*", "B", "B", "B", "W", "W", "W", "W", "B", "*", "*", "*", "*", "*", ],
            ]);
        },
        teardown: function() {
            genericTeardown();
        }
    });


