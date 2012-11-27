This is the Atari-Go Bot.

This bot is meant to be used to teach absolute beginners how to play the game, and provide an easy and accessible way to start fiddling with a board.

The fundamental requirement for Atari-go Bot is that it must play full Atari-Go:

  - If either player captures the stone, the game is over and that player won.

  - If neither player is capturing a stone, the bot should be able to keep playing, eventually in its own territory until either the player or the bot loses.


Additional desired/recommended/crazy features for the Atari-go Bot experience:

  * Configurable strength.

    - Atari-Go Bot will be used by absolute beginners. It shouldn't be frustrating, but it should also be able to display decent strength.

  * Multi-stone Atari-Go: be able to play to capture 1,3,5 stones, etc.

    - This will allow to raise situations like ko, ladders, snapbacks and potentially basic L&D & eyes.

  * Winning percentage guess, or positional confidence.

    - Bot should try to know if he is winning or will win. In a non-capture scenario, it would need to count open spaces to guess he wins. It might be good to show it as a termometer for the beginner to know if he is losing or winning.

  * Gospeed add-on: Shape Pattern recognition.

    - This is less Atari-Bot and more beginner experience. It might be good to be able to programatically recognize board patters like ladders and snapbacks to be able to explain or highlight them to the beginners.

  * Gospeed add-on: numbering stones per liberties.

    - Stones should be able to display the liberties of its own chain, making it trivial for beginners to understand what is going on on the first games. Could also have some alarm system or color stones regarding to its safety/hazard.

Atari-Go bot is a community effort to help introduce more beginners. 
Kaya will adopt the bot into the client so absolute beginners can have an easier time at first. Kaya will also support Atari-Go in a PvP way for beginners to play each other.


The Environment

The board technology to use is Gospeed, Kaya.gs's official Go Board.(It is yet to be packed and included into this project).

The bot is position based, in the form of a grid. It receives a set of arrays and makes the decision in base of that snapshot, making the bot state-less.




