This is the official Gem to run a bot in Kaya.

Right now only gnubot is default and has to be installed. 

Feel free to expand the gem to allow other bots with GTP interface, should work plug-play easily.


On Ubuntu:

   sudo apt-get install gnugo

To install :

    gem install kayabot

To run:

    kayabot my_configuration.yaml

The configuration yaml must look like this:

    url  : "http://alpha.kaya.gs:9292"
    user : "MyBot"
    pass : "MyBot's password"

Ask for a bot account at info@kaya.gs to run it!

You can get a personalized bot account and if you run many games you can get a collaborator account.




