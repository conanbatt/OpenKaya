This section includes only the sgf parser from the Gospeed board, open sourced for collaboration and improvements.

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


