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


  /**
   * @param {Object} obj Target object to receive observable functions. Passed by reference.
   * @returns {Object}
   * @api public
   */
  function observable(obj) {
    return extend(obj || {}, _observable);
  };


  observable.VERSION = '0.3.2';


  /**
   * @param {Object} target
   * @param {Object} source
   * @returns {Object}
   * @api private
   */
  var extend = function(target, source) {
    if (! source) return target;
    for (var key in source) {
      target[key] = source[key];
    }
    return target;
  };


  /**
   * Cuz Array#slice.call() is slooow.
   *
   * @param {Object} obj Array like object.
   * @param {Number} index
   * @returns {Array}
   * @api private
   */
  var slice = function(obj, index) {
    var arr = [];
    index <<= 0;
    for (; index < obj.length; index++) {
      arr.push(obj[index]);
    }
    return arr;
  };


  /*
   * Observable functions
   */
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
      if (! this._events) this._events = {};
      var handlers = this._events[evt] = this._events[evt] || [];

      if (typeof callbacks === 'function') {
        callbacks = slice(arguments, 1);
      }
      for (var i = 0; i < callbacks.length; i++) {
        handlers.push(callbacks[i]);
      }
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
      if (! this._events) return this;

      switch(arguments.length) {
        // Remove all events.
        case 0:
          this._events = {};
          return this;
        // Remove specific event.
        case 1:
          this._events[evt] = [];
          return this;
        // Remove specific handlers from an event.
        default:
          var handlers = this._events[evt];
          if (! handlers || ! handlers.length) return this;

          if (typeof callbacks === 'function') {
            callbacks = slice(arguments, 1);
          }
          for (var i = 0; i < callbacks.length; i++) {
            var cb = callbacks[i];
            for (var idx = 0; idx < handlers.length; idx++) {
              if (handlers[idx] === cb) handlers.splice(idx, 1);
            }
          }
          return this;
      }
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
      if (! this._events) return this;

      var handlers = this._events[evt];
      if (! handlers) return this;

      var args = arguments;
      for (var i = 0; i < handlers.length; i++) {
        // Optimize for most common argument counts.
        switch(args.length) {
          case 1:  handlers[i].call(this); break;
          case 2:  handlers[i].call(this, args[1]); break;
          case 3:  handlers[i].call(this, args[1], args[2]); break;
          case 4:  handlers[i].call(this, args[1], args[2], args[3]); break;
          default: handlers[i].apply(this, slice(args, 1)); break;
        }
      }
      return this;
    },

    /**
     * @returns {Object|Array} Copy of the events collection, or an array of handlers for a particular event..
     * @api public
     */
    getEvents : function getEvents() {
      return extend({}, this._events);
    }
  };


  /**
   * @returns {Function}
   * @api public
   */
  observable.noConflict = function() {
    root.observable = previousObservable;
    return observable;
  };


  /*
   * Export
   */
  // CommonJS/Node
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = observable;
  }
  // AMD/Require.js
  else if (typeof define === 'function' && define.amd) {
    define(function() {
      return observable;
    });
  }
  // Browser
  else {
    root.observable = observable;
  }

}).call(this);
