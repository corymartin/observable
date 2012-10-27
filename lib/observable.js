/*!
 * Observable Mixin
 * ================
 * Adds basic observer pattern functionality to an object.
 * https://github.com/corymartin/observable
 * Copyright (c) 2012 Cory Martin
 * Distributed under the MIT License
 */

;(function() {
  'use strict';

  /*
   * Utils
   */
  var _slice       = [].slice;
  var _toString    = ({}).toString;
  var _stringClass = '[object String]';
  var _arrayClass  = '[object Array]';

  var _extend = function(target, source) {
    if (source != null) {
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target;
  };

  var _each = function(array, iterator, context) {
    for (var i = 0; i < array.length; i++) {
      iterator.call(context, array[i], i, array);
    }
  };

  var _isString = function(obj) {
    return _toString.call(obj) === _stringClass;
  };

  var _isArray = Array.isArray || function(obj) {
    return _toString.call(obj) === _arrayClass;
  };


  /**
   * On (aka Subscribe/Bind)
   *
   *    myObj.on( 'showErrors', function1, functionN )
   *    myObj.on( 'showErrors', [function1, functionN] )
   *
   * @param {String} Event identifier.
   * @param {Function|Array} N functions to bind to this event.
   * @returns {Object} Reference to `this` for chaining.
   * @api public
   */
  function on(evt) {
    if (evt == null || !_isString(evt)) return this;
    if (arguments.length < 2)           return this;

    // Lazy init events collection
    if (!this._events) this._events = {};

    if (!this._events[evt]) this._events[evt] = [];

    var functions = _isArray(arguments[1])
      ? arguments[1]
      : _slice.call(arguments, 1);

    _each(functions, function(fn) {
      if (typeof fn !== 'function') return;
      this._events[evt].push(fn);
    }, this);

    return this;
  };


  /**
   * Off (aka Unsubscribe/Unbind)
   *
   *    // Unbind specific handlers
   *    myObj.off( 'showErrors', function1, functionN )
   *    myObj.off( 'showErrors', [function1, functionN] )
   *
   *    // Delete specific event.
   *    myObj.off( 'showErrors' )
   *
   *    // Remove all events.
   *    myObj.off()
   *
   * @param {String} Optional. Event identifier.
   * @param {Function|Array} Optional. N functions to unbind from Event identifier. If none are passed the event is deleted entirely.
   * @returns {Object} Reference to `this` for chaining.
   * @api public
   */
  function off(evt) {
    if (evt != null && !_isString(evt)) return this;

    if (!this._events) return this;

    if (!arguments.length) {
      // No params. Remove all events.
      delete this._events;
      return this;
    }

    if (arguments.length === 1) {
      // 1 param: event name. Remove that event.
      delete this._events[evt];
      return this;
    }

    var functions = _isArray(arguments[1])
      ? arguments[1]
      : _slice.call(arguments, 1);

    var callbacks = this._events[evt];
    if (!callbacks || !callbacks.length) return this;

    _each(functions, function(fn) {
      _each(callbacks, function(cb, i) {
        if (fn === cb) callbacks.splice(i, 1);
      });
    });

    return this;
  };


  /**
   * Fire (aka Publish/Trigger)
   *
   *    // Trigger all handlers for a specific event.
   *    myObj.fire( 'showErrors' )
   *
   *    // Trigger all handlers for a specific event, with arguments.
   *    myObj.fire( 'showErrors', 'some', 'args', 4, 'you' )
   *
   * @param {String} Event identifier.
   * @param {Mixed} Optional. N additional arguments to be passed to the hanlders
   * @returns {Object} Reference to `this` for chaining.
   * @api public
   */
  function fire() {
    if (!arguments.length || !this._events) return this;

    var evt       = arguments[0];
    var callbacks = this._events[evt];

    if (!callbacks) return this;

    var args = arguments.length > 1
      ? _slice.call(arguments, 1)
      : [];

    _each(callbacks, function(cb) {
      cb.apply(this, args)
    }, this);

    return this;
  };


  /**
   * @returns {Object|Array} Copy of the events collection, or an array of callbacks for a particular event..
   * @api public
   */
  function getEvents() {
    return _extend({}, this._events);
  };


  /**
   * @param {Object} obj Target object to receive observable functions. Passed by reference.
   * @param {Object} config Optional. Configuration object.
   * @returns {Object}
   * @api public
   */
  function observable(obj) {
    return _extend(obj, {
        on        : on
      , off       : off
      , fire      : fire
      , getEvents : getEvents
    });
  };


  observable.VERSION = '0.2.0';


  /*
   * Export
   */
  if (typeof module !== 'undefined' && module.exports)
    module.exports = observable;
  else
    this.observable = observable;

}).call(this);
