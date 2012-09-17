//Check js inheritance feature
//v0.2.0

/** History
0.1.0: creation of this test file
0.2.0: rename test classes
*/

function parentClass(size) {
	//define some member variables
	this.size = size;
	this.value1 = "value1 from parent";
	this.value2 = "value2 from parent";
	this.constant1 = 1;
	this.constant2 = 1;
}

//static
parentClass.StaticConstant = 1;

//static
parentClass.staticFunction1 = function(s) {
	return "" + s + " from parentClass.staticFunction1";
};

parentClass.prototype.getSize  = function() {
	return this.size;
};

parentClass.prototype.getValue1  = function() {
	return this.value1;
};

parentClass.prototype.getValue2  = function() {
	return this.value2;
};

parentClass.prototype.doSomething  = function() {
	return this.size*this.size;
};


//childClass may be defined in another file than parentClass, but parentClass must be loaded first
function childClass(size, name) {
	this._base_childClass.call(this, size);//call parent constructor
	//new child member variables
	this.name = name;
	//redefine some parent variables
	this.value2 = "value2 from child";
	this.constant2 = 2;
}

extendClass(childClass, parentClass);//define inheritance

childClass.prototype.doSomething  = function() {
	var parentResult = this._base_childClass.prototype.doSomething.call(this);//call parent function
	return parentResult + parentClass.StaticConstant + this.constant1 + this.constant2;
};



test("Inheritance: constructor should be able to call parent class", function(){

var expected_result = 10;
var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.size == expected_result);
ok(child.size == expected_result);

});

test("Inheritance: child class should be able to use parent member variables and can overwrite them", function(){

var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.getValue1() == "value1 from parent");
ok(child.getValue1() == "value1 from parent");
ok(parent.getValue2() == "value2 from parent");
ok(child.getValue2() == "value2 from child");
});

test("Inheritance: child class should be able to call parent functions", function(){

var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.doSomething() == 100);
ok(child.doSomething() == 104);
});

