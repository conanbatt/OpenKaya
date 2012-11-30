function PatternRecognizer(sgf){

    this.sgf = sgf;


    function count(pattern_name){

        var pattern = PatternRecognizer.patterns[pattern_name];        
        if (!pattern){ 
            throw new Error("Pattern is not in the library! Add it");
        }
        //Do pattern matching magic based on the sgf
    }

    this.count = count; 
}


function Pattern(name, description, pattern){
    if (!name || !description || !pattern){
        throw new Error("invalid arguments"); 
    }
    this.name = name;
    this.description = description;
    this.pattern = pattern;

    return this;
}

PatternRecognizer.patterns = {
    "empty triangle" : new Pattern("empty triangle", "empty triangles are bad", ["BB","BE"]),
}

