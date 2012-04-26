# Tournament & League Systems

## Dependencies & tools

Ruby 1.9.2, cutest gem. (for engine & tests)

    cutest, cuba, active record, gems, selenium, sqlite3. (for the site)

## Intro

It is a tactical aim for us to provide a flexible and usable Tournament organizer for users of the system. Organizing tournaments is one of the most common activities, and also one of the most difficult ones to do properly. 
The tournament engine is a core library to manage and organize a tournament. It is designed to be flexible, to be able to implement numerous systems. 

## Start-up

### Site
Install the gems detailed in the default.gems file. If you have rvm, do rvm gemset import.

Run the db migration inside the tournament folder

    rake migrate

Go to the "site" folder and do 

    rackup

Then open your browser in localhost:9292 and voila!

You can run the tests using

    cutest tests/tournaments_test.rb

### Engine

Refer to the tests and code for documentation on each system and its use.

## Details

Right now the following systems are supported:

* Single Elimination
* Double Elimination
* Swiss
* McMahon
* Round Robin


## Notes

Always remember to produce tests for the code you make. It is much easier for us to verify code with tests than without it,which means 
we will only accept the former.

Keep in mind that you can change the base class in case you think that it will enrich all tournament systems, but it doesnt clutter it. Making a lean base tournament class makes it much easier for new systems to be implemented without backward-supporting useless functionality for its type. 

Strongly suggested that you keep your code very strict. Add validation functions that can detect critical cases in each round(i.e. 2 players playing each other again).

## Pending work

- Right now there is no league code whatsoever, but the ability to organize leagues is also desired. 
- Functional page to organize/display tournaments. (Doesn't need to be stylized, just functional)
- Persistency in Sql.
- File export/import.
- Reports (on tournament types, users, etc)

# LICENSE

<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/3.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">OpenKaya</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://kaya.gs" property="cc:attributionName" rel="cc:attributionURL">Kaya</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.
