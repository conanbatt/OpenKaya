# Kaya Open Source Project.

Kaya will open source parts and bits of the application incrementally over time, until a stable development community is achieved.

Open-source code is subject to as rigorous standards as the server. Code must have decent unit test coverage, and well documented.


## Open Sourced Modules

This modules have been opened and are ready to be forked:

* Rating System
* Game Scoring
* Tournament & League systems
* Time System

# Rating System

## Dependencies & tools

Code utilizes ruby 1.9.2 which is the version used by the server.

## FAQ

### Why is this open?

There are many rating systems, and even more implementations of each theoretical model. Although I (Gabriel) had an idea of a simple system, i concluded it would be better to compare options, and also making it open so it can be tweaked and improved by the community that wants to do so.

### What system will Kaya use?

We dont know yet and this is a vital part on deciding what are we going to use in the end. This example is mean to be able to compare different systems under the same data. Our decision will be based mainly on the balance of Accuracy and Performance.

### What else besides Accuracy and Performance matters?

The impression and subjectivity players get from the system. An accurate system that leaves people unhappy by any reason has a negative impact.

Examples of the psychological aspect of a system.

* If the system makes players have a very heavy rating, it will push them into constantly making new accounts, worsening the whole experience.(KGS)
* It must not be frustrating to achieve the proper rank on an account, for example, by having to play too many games to get a confident rank. (Wbaduk/Tygem)
* Unrated accounts (new players) shouldnt be uninteresting to play with, due to risk/benefit of playing them.(KGS)
* Unfair Handicaps or uneven probabilities causing different rating values on game results. Kaya will disencourage playing with imbalanced handicap and that effect can be considered to be avoided within the same category. (i.e. Strong 5d gives komi to weak 5d, to prevent the former to have to win many more games than the latter).

## Notes

Remember that there will be a handicap! The rating system must support that to some degree. There are basically 2 strategies to deal with this (and their mix):

* Making the rating impact differently if two players of different rating play even
* Making all games have equal importance for both players by adjusting the probabilities of winning with handicap (to any degree, including in the same rank)

## Documentation

Inside the rating folder there is a structure of files.

System : the mock of an application that would use the rating system. It is fairly straight-forward: it takes (game) results and holds the information of all players, which in turn is passed to the rating strategy.

Strategies : Inside the folder there is a ridicolously simple system as a demonstration to how to make a system. It is absolutely state-less. Systems that require other information such as date or such can be easily changed and accessed from the passed on hash. Having a more comprehensive history can also be done by Just extending the Player model under system.rb.

Runner: The script that runs the simulation. It will run with a sample data-set and simple point system and write to a file the final rating of all players, rank and a benchmark on how long the process took.

**new** Added arguments parsing on runner.
You need to specify which rating system to use through the args (more than one possible).

    ruby runner.rb Glicko SimplePoint

Use "Validate" argument to make the system validate users rating after each result is added. Good to check consistency at any point.

    ruby runner.rb Glicko Validate

## Tests

To make sure the rating systems do what they intended, unit tests must be implemented. After adding a rating system, you can add code under tests/#{rating_system}_test.rb that verifies its not giving crazy results. This is a vital requirement to merge rating systems into master, as it is the only way i have to know the code works without going deep into the details of each implementation.

To run tests:

    gem install cutest

    ruby tests/#{rating_system}_test.rb


# Game Scoring

## Dependencies & tools

Current code is pure Javascript and can be run from within the browser without any installation.

## Details

Score.js is the javascript that will calculate score based on an array of information of a Go Board. A first batch of tests is written that would cover most use cases of score.
It is missing some more examples of chinese scoring which is secondary at this point.

The algorithm has to spit out an object with the score of each player. A "painted" array marking which intersection was counted for whom would be very convenient also.

Some caveats: be careful with Seki! it is counted as no points under japanese rules, regardless of eyes. There is a test case that will likely fail with any intuitive algorithm for determining score.

This will probably be extended for Score estimation.


# Bot Interface
To be documented and updated. Current code is not usable by Kaya.gs server.

## Dependencies & tools

Ruby 1.8.7 as required by mechanize.

## Details

Working on an interface to run bots remotely as if they were users. Bots will have a special dedicated api for simplicity, easy maintenance and increased performance.

WARNING: Current code is highly unstable and subject to big changes, depending on the implementation of the routes in the server.

# Tournament & League Systems

## Dependencies & tools

Ruby 1.9.2, cutest gem.

## Intro

It is a tactical aim for us to provide a flexible and usable Tournament organizer for users of the system. Organizing tournaments is one of the most common activities, and also one of the most difficult ones to do properly. 
The tournament engine is a core library to manage and organize a tournament. It is designed to be flexible, to be able to implement numerous systems. As with everything in OpenKaya, its has a flexible license for the code to be used anywhere.

## Details

Right now there is only a demo-system implemented (Random tournament) and some hints on a Single Elimination tournament.
Eventually the list should include:

* Single Elimination
* Double Elimination
* Swiss
* McMahon
* Round Robin

Right now there is no league code whatsoever, but the ability to organize leagues is also desired. 

## Notes

Always remember to produce tests for the code you make. It is much easier for us to verify code with tests than without it,which means 
we will only accept the former.

Keep in mind that you can change the base class in case you think that it will enrich all tournament systems, but it doesnt clutter it. Making a lean base tournament class makes it much easier for new systems to be implemented without backward-supporting useless functionality for its type. 

Strongly suggested that you keep your code very strict. Add validation functions that can detect critical cases in each round(i.e. 2 players playing each other again).

# Time Systems

## Dependencies & tools

Current code is pure Javascript and can be run from within the browser without any installation.

## Details

A full interface wich supports time systems has been implemented. It's fully written in JavaScript and emulates the interaction between the board, the timesystem and the server. It's fully tested with QUnit. Further implementations must respect the interaction and testing structure.

Checkout the "time" folder if you're interested in working on this.

You can see some time systems explained in the link ahead.

http://en.wikipedia.org/wiki/Game_clock#Time_controls


# LICENSE

<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/3.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">OpenKaya</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://kaya.gs" property="cc:attributionName" rel="cc:attributionURL">Kaya</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.
