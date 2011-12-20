Glicko implementation
=====================
Implementation of the Glicko rating system as described at http://www.glicko.net/glicko/glicko.pdf.
With support to transform from the classic Elo/Glicko scale to other scales such as the KGS dan/kyu scale


One change from the standard Glicko algorithm is the addition of "G_TERM_MOD"
In standard Glicko the MAX_RD parameter controls two things:

* The maximum rating change of a new player (or player who decayed to rd=MAX_RD)
* The reduction in impact of new players on other players (players with small rd)

But I wasn't happy with the relation --
Either new players impacted other's ratings too much, or new player own ratings changed too much
So I introduced this new constant to tune this behavior


Rating scales:
--------------

* Glicko:
  Same as the classic Elo scale

* Natural:
  Glicko * Q -- not really used directly here

* Gamma:
  log(Natural) -- not used here at all
  Other algorithms such as Glicko2 and WHR use this scale.

* kyudan:
  1.0 for each stone.  No gap around zero.
    0.0+epsilon = weakest   1d
    0.0-epsilon = strongest 1k
  Use this to do operations like determining correct handicap,
  because it will work correctly across the dan/kyu boundary

* aga:
  1.0 for each stone.  Gap from (-1.0, 1.0)
    1.0+epsilon = weakest   1d
   -1.0-epsilon = strongest 1k
  The aga scale is nice for displaying, because you can get the rank
  by chopping of the decimal portion.
  Be careful of rounding errors (1.99d should not round up to 2.0d)


