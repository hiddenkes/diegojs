;(function(window){
	
	//TODO: Add types to the crusher as they are generated with diego. Would also need to check to prevent crushing extending classes and constructors. 
	var types = [
		"int",
		"float",
		"double",
		"long",
		"string",
		"array",
		"object",
		"char",
		"void",
		"public",
		"private"
	];
	//Filters out types and things that we can't or don't use in JavaScript
	var typeCrusher = function(key){
		keys = key.split(" ");
		keys = keys.filter(function(s){
			if(types.indexOf(s.toLowerCase()) > -1){
				return false;
			}
			return true;
		});
		key = keys.join(" ").trim();
		return key;
	}
	
	var keyParser = function(key, r){
		//Set up the object we're going to return:
		var ret = {
			type: null,
			name: null,
			key: null
		};
		
		//Just in case they include a set of parens:
		key = key.replace(/\(\)/g, "").replace(/\[\]/g, "").trim();
		
		//Tell the typeCruncher to destroy all possible types:
		key = typeCrusher(key);
		
		ret.key = key;
		
		//Split by spaces to determine types:
		keys = key.split(" ");
		
		//Check to see if it's a typed class
		if(keys[0] === "typed" && keys[1] === "class"){
			ret.typed = true;
			//Remove the typed attribute
			keys.splice(0, 1);
		}
		
		//Check to see if it's a class:
		if(keys[0] === "class"){
			ret.type = "class";
			//Name should follow class:
			ret.name = keys[1];
			//Check to see if we're extending another class:
			if(keys[2]){
				if(keys[2] === "extends"){
					//Add in extends and set it to the next param, which should be the name of the class you want to extend.
					ret.extends = keys[3];
				}else if(keys[2] === "recycle"){
					//Let them recycle classes:
					ret.recycle = true;
				}
				
			}
		}
		
		//Something static
		else if(keys[0] === "static"){
			ret.type = "static";
			ret.name = keys[1];
		}
		
		//At this point we just assume assignment:
		else {
			ret.type = "assignment";
			//We just assume that the last item is the one we want:
			ret.name = keys[keys.length - 1];
			if(r.prototype._name === ret.name){
				ret.name = "_constructor"
			}
		}
		
		return ret;
	}
	
	var diego = function(c, r){
		//Loop through the outer loop to start constructing classes:
		diego.forin(c, function(key, value){
			//Only root-levels can be classes:
			var kp = keyParser(key, r);
			if(!r){
				//We only support classes in the outer function:
				//In the future, we could mess with adding functions and such and letting you sub-class by dropping classes within classes.
				if(kp.type === "class"){
					//Make the class:
					var sh = window[kp.name] = diego.construct();
					
					//Even if a method doesn't have a super, this allows it to fail silently:
					sh.prototype.super = function(){};
					
					if(kp.extends){
						//Grab reference to class we're extending:
						var extending = window[kp.extends];
						//Copy in all properties:
						diego.mixin(sh.prototype, extending.prototype);
						//Make Base Reference:
						sh.prototype._base = extending.prototype;
					}
					
					sh.prototype._typed = kp.typed;
					
					//Add in name:
					sh.prototype._name = kp.name;
					
					//Recursively iterate over children: 
					diego(value, sh);
					
					//TODO: Defer main until the end of the current Diego call.
					//Call main function:
					if(sh.main && typeof sh.main === "function"){
						sh.main();
					}
					
					if(kp.recycle){
						//Note that you have to delete it this way:
						delete window[kp.name];
					}
					
				}
			}else{
				//Statics:
				if(kp.type === "static"){
					r[kp.name] = value;
					//Note that statics do not support super!
				}
				//Assignment:
				else{
					var proto = r.prototype;
					
					if(typeof value === "function" && proto._base && typeof proto._base[kp.name] === "function"){
						proto[kp.name] = (function(fn){
				        	return function() {
								var old = proto.super;
								proto.super = proto._base[kp.name];
								var ret = fn.apply(proto, arguments);        
								proto.super = old;
								return ret;
							};
						})(value)
					}else{
						proto[kp.name] = value;
					}
				}
			}
		});
	};
	
	diego.construct = function() {
		return function() {
			//Add in type checking:
			if(this._typed && watch){
				watch(this, diego.typeCheck);
			}
			
			//Store the result of the constructor.
			var result;
			
			//Call the constructor: if it exists:
			if(this._constructor){
				result = this._constructor.apply(this, arguments);
			}
			
			if (result) {
				return result;
			}
		};
	};
	
	diego.typeCheck = function(prop, action, newvalue, oldvalue){
		var ts = Object.prototype.toString;
		//Check types:
		if(ts.call(newvalue) !==  ts.call(oldvalue)){
			//Don't call the watching function:
			WatchJS.noMore = true;
			//Set back to old value:
			this[prop] = oldvalue;
			//Throw error:
			throw "diego: Type error with property \'" + prop + "\'";
		}
	}
	
	diego.forin = function(object, callback){
		for(var x in object){
			if(object.hasOwnProperty(x)){
				callback(x, object[x]);
			}
		}
	}
	
	diego.mixin = function(target, source) {
		if (source) {
			for (var name in source) {
				target[name] = source[name];
			}
		}
		return target;
	};
	
	//Promote diego to global object:
	window.diego = diego;
	
})(window);