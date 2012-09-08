function extendClass(childClass, parClass) {
 
	// use an intermediate "empty" class to avoid call to parent class constructor
	var f = function() {};
	f.prototype = parClass.prototype;
	childClass.prototype = new f();
 
	var fctSource = childClass.toString();
	var className = /function\s+([^\(\s]+)\(/.exec(fctSource)[1];
	
	var baseName = "_base_" + className;
 	childClass.prototype[baseName] = parClass;
}
