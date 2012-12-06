This section includes the sgf parser from the Gospeed board, open sourced for collaboration and improvements.

The purpose of this section is specif improvements, plug-ins or extra functionality that can be added to Gospeed. 

All improvements on the parser require working tests for them.

Pendings:

- Fix for sgfs that cant be loaded on gospeed.(Check the tweaki or the issue list on github to look for such links and games)

- Speed/performance benchmarks are welcome

- Load kogo on local storage : http://diveintohtml5.info/storage.html ?

Pattern Recognition:

Pattern recognition is an analytical feature to be used client side by GoSpeed. The main purpose of it is educational:

- For beginners, to get warned about empty triangles and bad shapes.
- For more advanced patterns, like broken shapes, table shape, etc. Pontentially tesuji.
- For analytical/statistical fanatics, that can check after a game is over who did more empty triangles, better shapes, etc. 
- Lastly maybe for joseki finding and application in combination with Kogo. For high CPU processing WebWorkers have to be used.

There is a basic scheme for adding patterns. Its extremely basic and right now the function defined on tests only counts the shape:

It should also list the shapes as they were played, with coordinates, for easy drawing on the board by Gospeed.

Touch mechanism:

Gospeed right now functions with only clicks, but touch devices are not so good for using clicks exclusively.
Demoing several systems can be a thorough approach.

Gospeed is still not available to prove the merging, so the prototype has to be rather abstract. If it requires some drawing, prototype it and then the GoSpeed Core team(dp :P) will work on it.

Objectives:

- Being safe from misclicks. This is the number one issue with touch devices and clicks.
- Be clear/quick to use. Most touch devices involve placing the finger on the same position he wants to play, blocking the view with the finger. Maybe this can be fixed.
- Be cool.
