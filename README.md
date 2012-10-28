Observable.js
=============

Mixin function that adds observer functionality to an object.


[Development](https://raw.github.com/corymartin/observable/master/build/observable.js)

[Production](https://raw.github.com/corymartin/observable/master/build/observable.min.js)
~500 bytes Minified and Gzipped


API
===


observable( [obj] )
--------------------------

Adds observer functions to the target object.

__Parameters__

- __*obj*__ `Object` Target object to receive observer functions.
  If not passed, a new object will be created and returned.

__Returns__
`Object` The target object.

Applied to an existing object

```js
var myobj = { /*...*/ };
observable(myobj);
```
```js
var myobj = new Widget;
observable(myobj);
```

Used to initialize an object

```js
var myobj = observable({ /*...*/ });
```

Used to create a new object

```js
var myobj = observable();
```

With a function constructor - each instance will have it's own events collection

```
function Widget() {};
observable(Widget.prototype);

var myobj = new Widget;
```


Observable Functions
====================

Four functions are added to the target object:
[on](#on), [off](#off), [fire](#fire), and [getEvents](#getEvents)


<a name="on"></a>
on(eventName, callback [, callbackN]) <br /> on(eventName, callbackArray)
-------------------------------------

Binds one or more callbacks to `eventName`

__Parameters__

- __*eventName*__ `String` Event identifier.
- __*callback*__ `Function | Array` Either one or more callback functions
  (comma separated) to bind or an array thereof.

__Returns__
`Object` The target object.

```js
myobj.on('widgetLoaded', function(){
  /*...*/
});
```
```js
function init(){};
function populate(){};
```
```js
myobj.on('widgetLoaded', init, populate);
```
```js
myobj.on('widgetLoaded', [init, populate]);
```


<a name="off"></a>
off(eventName, callback [, callbackN]) <br /> off(eventName, callbackArray)
--------------------------------------

Removes one or more callbacks bound to `eventName`

__Parameters__

- __*eventName*__ `String` Event identifier.
- __*callback*__ `Function` One or more callback function references
  (comma separated) to unbind or an array thereof.

__Returns__
`Object` The target object.

```js
function init(){};
function populate(){};
```
```js
myobj.off('widgetLoaded', init, populate);
```
```js
myobj.off('widgetLoaded', [init, populate]);
```


off(eventName)
--------------

Removes all callbacks bound to `eventName`

__Parameters__

- __*eventName*__ `String` Event identifier.

__Returns__
`Object` The target object.

```js
myobj.off('widgetLoaded');
```


off()
-----

Removes all events.

__Returns__
`Object` The target object.

```js
myobj.off();
```


<a name="fire"></a>
fire(eventName [, args])
------------------------

Invokes all callbacks for `eventName`

__Parameters__

- __*eventName*__ `String` Event identifier.
- __*args*__ `Mixed` Optional arguments (comma separated) passed to callbacks.

__Returns__
`Object` The target object.

```js
myobj.fire('widgetLoaded');
```
```js
myobj.fire('widgetLoaded', 'some', /args/, 4, 'you');
```


<a name="getEvents"></a>
getEvents()
-----------

Returns a copy of the events collection.

__Returns__
`Object` The events collection.

```js
myobj.getEvents();
```


Extended Examples
=================

```js
var widget = observable({
  title: 'widgie',
  render: function(){}
});

/*
 * Bind some functions to an event.
 */
widget.on('widget:update', function() {
  /*...*/
});

var highlightChange = function() { /*...*/ }
var save            = function() { /*...*/ }

myobj.on('widget:update', highlightChange, save);

/*
 * Fire the 'widget:update' event
 */
myobj.fire('widget:update');

/*
 * Unbind the 'save' handler for the 'widget:update' event
 */
myobj.off('showError', save);
```

### Custom event

```js
function Widget() {
  /*...*/
};
observable(Widget.prototype);

Widget.prototype.onError = function() {
  var callbacks = [].slice.call(arguments);
  this.on('widget:error', callbacks);
  return this;
};

Widget.prototype.error = function(msg) {
  this.fire('widget:error', msg);
};

var w = new Widget;

w.onError(
  function(msg) { /* Update UI */ },
  function(msg) { /* Log error */ }
);

w.showError('Something went wrong.');
```

### PubSub

```js
var pubsub = observable();

var todosInputWidget = {
  /*...*/
  saveTodo : function(todoData) {
    acme.pubsub.fire('todos:new', todoData);
  }
  /*...*/
};

var todosDisplayWidget = {
  /*...*/
  init : function(){
    acme.pubsub.on('todos:new', this.showTodo);
  },
  showTodo : function(todoData) {
    // Display new todo
  }
  /*...*/
};
```
