//Check js inheritance feature
//v0.1.0

/** History
0.1.0: creation of this test file
*/

function classParent(size) {
	//define some member variables
	this.size = size;
	this.value1 = "value1 from parent";
	this.value2 = "value2 from parent";
	this.constant1 = 1;
	this.constant2 = 1;
}

//static
classParent.StaticConstant = 1;

//static
classParent.staticFunction1 = function(s) {
	return "" + s + " from classParent.staticFunction1";
};

classParent.prototype.getSize  = function() {
	return this.size;
};

classParent.prototype.getValue1  = function() {
	return this.value1;
};

classParent.prototype.getValue2  = function() {
	return this.value2;
};

classParent.prototype.doSomething  = function() {
	return this.size*this.size;
};


//classChild may be defined in another file than classParent, but classParent must be loaded first
function classChild(size, name) {
	this._base_classChild.call(this, size);//call parent constructor
	//new child member variables
	this.name = name;
	//redefine some parent variables
	this.value2 = "value2 from child";
	this.constant2 = 2;
}

extendClass(classChild, classParent);//define inheritance

classChild.prototype.doSomething  = function() {
	var parentResult = this._base_classChild.prototype.doSomething.call(this);//call parent function
	return parentResult + classParent.StaticConstant + this.constant1 + this.constant2;
};



test("Constructor should be able to call parent class", function(){

var expected_result = 10;
var parent = new classParent(10);
var child = new classChild(10, "child");
ok(parent.size == expected_result);
ok(child.size == expected_result);

});

test("Child should be able to use parent member variables and can overwrite them", function(){

var parent = new classParent(10);
var child = new classChild(10, "child");
ok(parent.getValue1() == "value1 from parent");
ok(child.getValue1() == "value1 from parent");
ok(parent.getValue2() == "value2 from parent");
ok(child.getValue2() == "value2 from child");
});

test("Child should be able to call parent functions", function(){

var parent = new classParent(10);
var child = new classChild(10, "child");
ok(parent.doSomething() == 100);
ok(child.doSomething() == 104);
});

