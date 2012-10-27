Observable.js
=============

Mixin function that adds an event system to an object.


API
===


observable(obj [, config])
--------------------------

Adds observer functions to the target object.

__Parameters__

- __*obj*__ `Object` Target object to receive observer functions.
- __*config*__ `Object` Optional settings.
  - __*on*__ `String` Name of the on/bind/subscribe function. Default is *on*
  - __*off*__ `String` Name of the off/unbind/unsubscribe function. Default is *off*
  - __*fire*__ `String` Name of the fire/trigger/publish function. Default is *fire*

__Returns__
`Object` The target object.

Applied to an existing object

```js
var myObj = { /*...*/ }
observable(myObj);
```
```js
var myObj = new MyCtor;
observable(myObj);
```

Used to initialize an object

```js
var myObj = observable({
  /*...*/
});
```

Using the config options to change the name of the observable functions

```js
var myObj = { /*...*/ }
observable(myObj, {
  on   : 'bind',
  off  : 'unbind',
  fire : 'trigger'
});
```

With a function constructor - each instance will have it's own events collection

```
function MyCtor() {};
observable(MyCtor.prototype);
var myObj = new MyCtor;
```


Observable Functions
====================

Four functions are added to the target object:
[on](#on), [off](#off), [fire](#fire), and [getEvents](#getEvents)


<a name="on"></a>
on(eventName, callback [, callbackN])
on(eventName, callbackArray)
-------------------------------------

Binds one or more callbacks to `eventName`

__Parameters__

- __*eventName*__ `String` Event identifier.
- __*callback*__ `Function` One or more callback functions (comma separated) to bind.

__Returns__
`Object` The target object.

```js
myObj.on('widgetLoaded', function(){ /*...*/ });
```


<a name="off"></a>
off(eventName, callback [, callbackN])
--------------------------------------

Unbinds one or more callbacks bound to `eventName`

__Parameters__

- __*eventName*__ `String` Event identifier.
- __*callback*__ `Function` One or more callback function references (comma separated) to unbind.

__Returns__
`Object` The target object.

```js
myObj.off('widgetLoaded', myCallback); // Unbinds callback `myCallback`
```


off(eventName)
--------------

Removes all callbacks for `eventName`

__Parameters__

- __*eventName*__ `String` Event identifier.

__Returns__
`Object` The target object.

```js
myObj.off('widgetLoaded'); // Removes event "widgetLoaded"
```


off()
-----

Removes all events.

__Returns__
`Object` The target object.

```js
myObj.off(); // myObj now has no events
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
myObj.fire('widgetLoaded');
```
```js
myObj.fire('widgetLoaded', 'some', 'args', 4, 'you');
```


<a name="getEvents"></a>
getEvents()
-----------

Returns a copy of the events collection.

__Returns__
`Object` The events collection.

```js
myObj.getEvents(); //=> { widgetLoaded: [/*functions*/], widgetError: [/*...*/] }
```


Extended Examples
=================

```js
var widget = observable({
  name: 'widgie',
  render: function(){}
});

//
// Bind some functions to an event.
//
widget.on('showError', function() {
  // do something error related
});

var highlightInputElement = function() { /*...*/ }
var recordError           = function() { /*...*/ }

myObj.on('showError', highlightInputElement, recordError);

//
// Invoke the callbacks bound to 'showError'
//
myObj.fire('showError');

//
// Unbind a callback
//
myObj.off('showError', recordError);
```

Custom event

```js
function Widget() {
  this.name = 'widgie';
};
observable(Widget.prototype);

Widget.prototype.onShowError = function() {
  [].unshift.call(arguments, 'widget:error');
  this.on.apply(this, arguments);
  return this;
}

Widget.prototype.showError = function(msg) {
  this.fire('widget:error', msg);
}

/* ... */

var w = new Widget;

w.onShowError(
  function(msg) {
    console.log('1 ' + msg);
  },
  function(msg) {
    console.log('2 ' + msg);
  }
);

w.showError('Oh No!');
//=> 1 Oh No!
//=> 2 Oh No!
```

