/*!
 * @preserve
 * Observable Mixin
 * v0.3.0
 * Adds basic observer pattern functionality to an object.
 * https://github.com/corymartin/observable
 * Copyright (c) 2012 Cory Martin
 * Distributed under the MIT License
 */
;(function() {
  'use strict';

  var root = this;
  var previousObservable = root.observable;

  /*
   * Utils
   */
  var _slice = [].slice;

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
      iterator.call(context, array[i], i);
    }
  };

  var _toString   = ({}).toString;
  var _arrayClass = '[object Array]';

  var _isArray = Array.isArray || function(obj) {
    return _toString.call(obj) === _arrayClass;
  };


  var _observable = {
    /**
     * On (aka Subscribe/Bind)
     *
     *    myObj.on( 'showErrors', function1, functionN )
     *    myObj.on( 'showErrors', [function1, functionN] )
     *
     * @param {String} evt Event identifier.
     * @param {Function|Array} callbacks N functions to bind to this event.
     * @returns {Object} Reference to `this` for chaining.
     * @api public
     */
    on : function on(evt, callbacks) {
      // Lazy init events collection
      if (!this._events) this._events = {};

      var handlers = this._events[evt] = this._events[evt] || [];

      if (!_isArray(callbacks)) {
        if (arguments.length === 2) {
          handlers.push(callbacks);
          return this;
        }
        callbacks = _slice.call(arguments, 1);
      }

      _each(callbacks, function(cb) {
        handlers.push(cb);
      });

      return this;
    },

    /**
     * Off (aka Unsubscribe/Unbind)
     *
     *    // Remove all events.
     *    myObj.off()
     *
     *    // Delete specific event.
     *    myObj.off( 'showErrors' )
     *
     *    // Unbind specific callbacks.
     *    myObj.off( 'showErrors', function1, functionN )
     *    myObj.off( 'showErrors', [function1, functionN] )
     *
     * @param {String} evt Optional. Event identifier.
     * @param {Function|Array} callbacks Optional. N functions to unbind from Event identifier. If none are passed the event is deleted entirely.
     * @returns {Object} Reference to `this` for chaining.
     * @api public
     */
    off : function off(evt, callbacks) {
      if (!this._events) return this;

      if (evt == null) {
        this._events = {};
        return this;
      }
      if (arguments.length === 1) {
        this._events[evt] = [];
        return this;
      }

      var handlers = this._events[evt];
      if (!handlers || !handlers.length) return this;

      if (!_isArray(callbacks)) {
        if (arguments.length === 2) callbacks = [callbacks];
        else callbacks = _slice.call(arguments, 1);
      }

      _each(callbacks, function(cb) {
        _each(handlers, function(fn, i) {
          if (fn === cb) handlers.splice(i, 1);
        });
      });

      return this;
    },

    /**
     * Fire (aka Publish/Trigger)
     *
     *    // Trigger all handlers for a specific event.
     *    myObj.fire( 'showErrors' )
     *
     *    // Trigger all handlers for a specific event, with arguments.
     *    myObj.fire( 'showErrors', 'some', 'args', 4, 'you' )
     *
     * @param {String} evt Event identifier.
     * @param {Mixed} args Optional. N additional arguments to be passed to the hanlders
     * @returns {Object} Reference to `this` for chaining.
     * @api public
     */
    fire : function fire(evt) {
      if (!this._events) return this;

      var handlers = this._events[evt];
      if (!handlers || !handlers.length) return this;

      var args = arguments.length > 1
        ? _slice.call(arguments, 1)
        : [];

      _each(handlers, function(fn) {
        fn.apply(this, args);
      }, this);

      return this;
    },

    /**
     * @returns {Object|Array} Copy of the events collection, or an array of handlers for a particular event..
     * @api public
     */
    getEvents : function getEvents() {
      return _extend({}, this._events);
    }
  };


  /**
   * @param {Object} obj Target object to receive observable functions. Passed by reference.
   * @returns {Object}
   * @api public
   */
  function observable(obj) {
    return _extend(obj || {}, _observable);
  };


  observable.VERSION = '0.3.0';


  /*
   * Export
   */
  if (typeof module !== 'undefined' && module.exports)
    module.exports = observable;
  else
    root.observable = observable;


  /**
   * @returns {Function}
   * @api public
   */
  observable.noConflict = function() {
    root.observable = previousObservable;
    return observable;
  };

}).call(this);
