Kaya Open source project.
=========================

Kaya will open source parts and bits of the application incrementally over time, until a stable development community is achieved.

Open-source code is subject to as rigorous standards as the server. Code must have decent unit test coverage, and well documented.

Dependencies & tools
====================

Javascript
----------
Current code is pure Javascript and can be run from within the browser without any installation.

Ruby
----
Code utilizes ruby 1.9.2.  

Score
=====

Score.js is the javascript that will calculate score based on an array of information of a Go Board. A first batch of tests is written that would cover most use cases of score.
It is missing some more examples of chinese scoring which is secondary at this point.

The algorithm has to spit out an object with the score of each player. A "painted" array marking which intersection was counted for whom would be very convenient also.

Some caveats: be careful with Seki! it is counted as no points under japanese rules, regardless of eyes. There is a test case that will likely fail with any intuitive algorithm for determining score.

This will probably be extended for Score estimation.

Rating FAQ
======

Why is this open?
-----------------

There are many rating systems, and even more implementations of each theoretical model. Although I (Gabriel) had an idea of a simple system, i concluded it would be better to compare options, and also making it open so it can be tweaked and improved by the community that wants to do so. 

What system will Kaya use?
--------------------------

We dont know yet and this is a vital part on deciding what are we going to use in the end. This example is mean to be able to compare different systems under the same data. Our decision will be based mainly on the balance of Accuracy and Performance. 

What else besides Accuracy and Performance matters?
--------------------------------------------------

The impression and subjectivity players get from the system. An accurate system that leaves people unhappy by any reason has a negative impact.

Examples of the psychological aspect of a system.

* If the system makes players have a very heavy rating, it will push them into constantly making new accounts, worsening the whole experience.(KGS)
* It must not be frustrating to achieve the proper rank on an account, for example, by having to play too many games to get a confident rank. (Wbaduk/Tygem)
* Unrated accounts (new players) shouldnt be uninteresting to play with, due to risk/benefit of playing them.(KGS)
* Unfair Handicaps or uneven probabilities causing different rating values on game results. Kaya will disencourage playing with imbalanced handicap and that effect can be considered to be avoided within the same category. (i.e. Strong 5d gives komi to weak 5d, to prevent the former to have to win many more games than the latter).

Rating Documentation
====================

Inside the rating folder there is a structure of files.

System : the mock of an application that would use the rating system. It is fairly straight-forward: it takes (game) results and holds the information of all players, which in turn is passed to the rating strategy.

Strategies : Inside the folder there is a ridicolously simple system as a demonstration to how to make a system. It is absolutely state-less. Systems that require other information such as date or such can be easily changed and accessed from the passed on hash. Having a more comprehensive history can also be done by Just extending the Player model under system.rb.

Runner: The script that runs the simulation. It will run with a sample data-set and simple point system and write to a file the final rating of all players, rank and a benchmark on how long the process took.




