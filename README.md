#diego.js
Diego.js is a simple library that allows you to more simply create and extend JavaScript classes. It borrows heavily from Java's style of class declarations.

It is worth noting that diego.js puts all classes in the global object. This probably isn't the best idea, and it's being worked on.

##Using
To start using diego.js, include it in your project. You can then start using it to create classes.

####Hello World
Diego.js works by accepting an object and parsing it to create classes. Below is a HelloWorld example that creates a simple class.
	
```javascript
diego({
	"class HelloWorld": {
		"HelloWorld": function(){
			console.log("Hello, " + this.hello + "!");
		},
		"hello": "world"
	}
});
```
	
This example creates a class named HelloWorld with a constructor that logs "Hello, World!". You can initialize an instance of the class using standard JavaScript:

```javascript
var hw = new HelloWorld();
```

If you provide a function that has the same name as the class, it will be used as the constructor for the class. However, you do not have to provide a constructor in your class.

####Some Java Keyword Compatability
When creating classes, diego.js also attempts to parse out some Java keywords. Below is the same HelloWorld class above, but with some common Java keywords included.

```javascript
diego({
	"public class HelloWorld": {
		"public HelloWorld": function(){
			console.log("Hello, " + this.hello + "!");
		},
		"private string hello": "world"
	}
});
```
	
Even with the included types and using public and private modifiers, the class is identical to the example above.
	
Note that even if you denote properties of the class as private, they will still be accessible outside of the class.

####Extending Classes
You can very easily extend classes using diego.js. The example below shows the Point3D class which extends a Point class. The properties from the Point class are copied in to the Point3D class.

```javascript
diego({
	"class Point": {
		"x": 0,
		"y": 0,
		"Point": function(x, y){
			this.x = x;
			this.y = y;
		}
	},
	"class Point3D extends Point": {
		"z": 0,
		"Point3D": function(x, y, z){
			this.x = x;
			this.y = y;
			this.z = z;
		}
	}	
});
```
	
In the constructor of the Point3D class, you can also use the `super` class method to call the constructor of the extended class. Using this, you can rewrite the above example:

```javascript
diego({
	//Create the class we are going to extend named "Point".
	"class Point": {
		"x": 0,
		"y": 0,
		"Point": function(x, y){
			this.x = x;
			this.y = y;
		}
	},
	//Extend the "Point" class and create a "Point3D" class.
	"class Point3D extends Point": {
		"z": 0,
		"Point3D": function(x, y, z){
			this.super(x, y);
			this.z = z;
		}
	}
});
```
	
You can call the super function in any method that is overwriting an existing method from the extended class.

##Features
Diego.js includes several features not demonstrated in the examples. All of the features of the library are outlined below.

####Classes
To create a class, call diego with an object with a key in the format "class [name]", and the value as an object.
	
```javascript
diego({
	"class Demo": {}
});
```
	
Classes are added to the global object.

####Constructors
You can create a constructor for a class by adding a function to the class that has the same name as the class itself.

```javascript
diego({
	"class Demo": {
		"Demo": function(){
			//Constructor for class "Demo".
		}
	}
});
```

The constructor will be called whenever the class is instantiated.

####Statics
You can add static methods to classes by prepending "static" before the name of the property. In this way, adding static properties to classes is identical to Java.

```javascript
diego({
	"class Demo": {
		"static test": function(){
			console.log("Test!");
		}
	}
});
```
	
The above example adds the method "test" to the class "Demo", which is called as Demo.test().

####Main Function
You can specify a static main function in a class which will be run as soon as the class is loaded. The example below creates an App class with a main method that will initialize an App class instance.

```javascript
diego({
	"public class App": {
		"static main": function(){
			var app = new App();
			console.log("Hello, " + app.person + "!");
		},
		"person": "world"
	}
});
```
	
Note that the main method must be static.

####Extending Classes
Extending classes copies all of the class methods and properties of the extended class into a new class.

```javascript
diego({
	"class Point": {
		"x": 0,
		"y": 0
	},
	"class Point3D extends Point": {
		"z": 0
	}	
});
```
	
When extending a class, only non-static properties are copied in to the new class.

####Typed Classes
Typed Classes in diego.js allow you to enforce types of properties in the class. This utilizes Watch.js to check types when changing properties. A copy of watch.js must be included in your project before any typed class definitions. The util folder includes a version of watch.js that you can use. To define a typed class, you must prepend "typed" to the class definition.

```javascript
diego({
	"typed class TypedPoint": {
		"x": 0,
		"note": ""
	}
});
```
	
The type of the value that the property is initialized to will be enforced when setting the property later. The use of the TypedPoint class below demonstrates how this works.

```javascript
var tp = new TypedPoint();
//No error, x was initialized to a number:
tp.x = 1;
//No error, note was initialized to a string:
tp.note = "test";
//Throws an error, expects x to be a number:
tp.x = "Breaks";
//Throws an error, expects note to be a string.
tp.note = [];
```
	
If an error occurs when setting the value of a property, then the value of the property will be reverted to the original value.

####Recycled Classes
Recycled classes will be deleted after the main method in the class is called. If no main method is provided, the class will not be created. You can denote a class as recycled by adding "recycle" to the end of the class definition.

```java
diego({
	"class Demo recycle": {
		"static main": function(){
			//This function will automatically be called, and then the class will be deleted.
			console.log("Hello, World!");
		}
	}
});
```
