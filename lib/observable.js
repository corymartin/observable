/*!
 * Observable Mixin
 * ================
 * v0.2.0
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
      iterator.call(context, array[i], i, array);
    }
  };

  var _isArray = Array.isArray || (function() {
    var _toString   = ({}).toString;
    var _arrayClass = '[object Array]';
    return function(obj) {
      return _toString.call(obj) === _arrayClass;
    };
  })();


  var _observable = {
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
    on : function on(evt, callbacks) {
      // Lazy init events collection
      if (!this._events) this._events = {};

      var handlers  = this._events[evt] = this._events[evt] || [];
      var functions = _isArray(callbacks)
        ? callbacks
        : _slice.call(arguments, 1);

      _each(functions, function(fn) {
        handlers.push(fn);
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
     *    // Unbind specific handlers
     *    myObj.off( 'showErrors', function1, functionN )
     *    myObj.off( 'showErrors', [function1, functionN] )
     *
     * @param {String} Optional. Event identifier.
     * @param {Function|Array} Optional. N functions to unbind from Event identifier. If none are passed the event is deleted entirely.
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

      var functions = _isArray(callbacks)
        ? callbacks
        : _slice.call(arguments, 1);
      var handlers = this._events[evt];

      _each(functions, function(fn) {
        _each(handlers, function(cb, i) {
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
     * @param {String} Event identifier.
     * @param {Mixed} Optional. N additional arguments to be passed to the hanlders
     * @returns {Object} Reference to `this` for chaining.
     * @api public
     */
    fire : function fire(evt) {
      if (!this._events || !this._events[evt]) return this;

      var args = arguments.length > 1
        ? _slice.call(arguments, 1)
        : [];

      _each(this._events[evt], function(cb) {
        cb.apply(this, args)
      }, this);

      return this;
    },

    /**
     * @returns {Object|Array} Copy of the events collection, or an array of callbacks for a particular event..
     * @api public
     */
    getEvents : function getEvents() {
      return _extend({}, this._events);
    }
  };


  /**
   * @param {Object} obj Target object to receive observable functions. Passed by reference.
   * @param {Object} config Optional. Configuration object.
   * @returns {Object}
   * @api public
   */
  function observable(obj) {
    return _extend(obj || {}, _observable);
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
