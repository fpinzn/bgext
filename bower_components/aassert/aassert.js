/*Made by Francisco Pinzon (hello@pacho.me) - 2014*/

(function(){

var root = this;

var aa={}, AA={};

/*
Stolen from the underscore code: Export the AA and aa objects
for Node.js, with backwards-compatibility for the old require() API.
 If we’re in the browser, add AA and aa as global objects.
*/
if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports={AA:AA,aa:aa};
	}
	exports.aa = aa;
	exports.AA = AA;

} else {
	root.aa = aa;
	root.AA = AA;
}

AA.VERSION = aa.VERSION = '0.1.0';

/*
Primitives
*/
aa.number = function(theNumber){
	if(isNaN(theNumber)) return false;
	else return typeof(theNumber) === "number";
}

aa.boolean = function(theBoolean){
	return typeof(theBoolean) === "boolean";
}

aa.string = function(theString){
	return typeof(theString) === "string";
}

aa.array = function(theArray){
	return Array.isArray(theArray);
}

/*This returns false when null is passed, not like the js perpetual bug*/
aa.object = function(theObject){
	if(theObject===null) return false
	else return typeof(theObject) === "object";
}

aa.function = function(theFunction){
	return typeof(theFunction) === "function";
}

aa.undefined = function(theUndefined){
	if(theUndefined===null) return true
	else return typeof(theUndefined) === "undefined";
}

/*
Inner utilities
*/

var shorthands = {"b":"boolean",
					"n":"number",
					"s":"string",
					"a":"array",
					"o":"object",
					"f":"function",
					"u":"undefined"}

void function createPrimitiveShorthandsAndStrictVersions(){
	for(var key in shorthands){
		var name = shorthands[key];
		//assign strict version
		AA[name] = createStrictVersion(name,aa[name]);
		//assign the shorthand for aa
		aa[key]=aa[name];
		//assign the shorthand for AA
		AA[key]=AA[name];
	};
}();

function CustomError(name, message){
	this.name = name;
	this.message = message;
	this.toString = function() {
		return this.value + ": "+this.message
	};
}


function createStrictVersion(name, checker){
	if(!aa.function(checker)) throw new CustomError("AAssertionNotDefined", name+ " is not a function.");
	return function(theThing){
		if(!checker(theThing)){
			throw new CustomError("AAssertionNotMetException", "Type checking for "+name+ " not met");
		}
		else{
			return AA;
		}
	}
}

/*
Custom types
*/
aa.define= function(typeName,typeDescription){
	AA.s(typeName);
	AA.o(typeDescription);
	if(Object.getOwnPropertyNames(typeDescription).length === 0){
		throw new CustomError("EmptyTypeDescriptionError",
		"The type description can not be an empty object");
	}
	else{
		aa[typeName] = aa.customCheck(typeDescription);
		AA[typeName] = createStrictVersion(typeName, aa[typeName]);
	}
}
aa.customCheck = function(typeDescriptor){
	AA.o(typeDescriptor);
	return function(object){
		AA.o(object);
		for(var key in typeDescriptor){
			var type = typeDescriptor[key], value = object[key];
			//If the type is an object go recursive.
			if(aa.o(type)){
				if(!aa.customCheck(type)(value)) return false;
			}
			else{
				AA.s(type);
				if (!aa[type](value)) return false;
			}
		}
		return true;
	}
}

/*
ad hoc types
*/
aa.c = function(theThing, typeDescriptor){
	return aa.customCheck(typeDescriptor)(theThing);
}

AA.c = function(theThing, typeDescriptor){
	return createStrictVersion("ad-hoc type", function(object){aa.c(object, typeDescriptor)});
}

/*
json file loading
*/
aa.import = AA.import = function(jsonUrl, callback){
	AA.s(jsonUrl);
	var oReq = new XMLHttpRequest();

	oReq.onload = function() {
		var jsonObject = JSON.parse(this.responseText);
		for(var key in jsonObject){
			aa.define(key, jsonObject[key])
		}
		if(!aa.u(callback)) callback();
	};

	oReq.open("get", jsonUrl, true);
	oReq.send();
}

})();
