/*!
 * Observable Mixin
 * ================
 * v0.1.1
 * Adds basic observer pattern functionality to an object.
 * https://github.com/corymartin/observable
 * Copyright (c) 2012 Cory Martin
 * Distributed under the MIT License
 */

;(function() {
  'use strict';

  /**
   * Simple object extend/property copy util.
   *
   * @param {Object} target
   * @param {Object} source
   * @returns {Object}
   * @api private
   */
  var _extend = function(target, source) {
    if (source != null) {
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target;
  };

  var ArrProto = Array.prototype;

  var _slice = ArrProto.slice;

  var _each = ArrProto.forEach || function(iterator, context) {
    var i = 0;
    for (; i < this.length; i++) {
      iterator.call(context, this[i], i, this);
    }
  };

  var _isString = (function() {
    var _toString = Object.prototype.toString;
    return function(obj) {
      return _toString.call(obj) === '[object String]';
    };
  })();

  /**
   * Creates the bind and unbind functions.
   *
   * @param {String} bindOrUnbind `'bind'` or `'unbind'`
   * @returns {Function}
   * @api private
   */
  var _bind = function(bindOrUnbind) {
    var isBind = bindOrUnbind === 'bind';

    return function(evt) {
      if (evt != null && !_isString(evt)) return this;

      // Unbind all events or a specific event.
      if (!isBind) {
        // No params. Remove all events.
        if (!arguments.length) {
          this._events = {};
          return this;
        }

        // 1 param: event name. Remove that event.
        if (arguments.length === 1) {
          delete this._events[ evt ];
          return this;
        }
      }

      if (arguments.length < 2) return this;

      var functions = _slice.call(arguments, 1);
      var callbacks = this._events[evt] = this._events[evt] || [];

      //TODO: Efficient?
      _each.call(functions, function(fn) {
        if (typeof fn !== 'function') return;

        // On / Bind / Subscribe
        if (isBind) return callbacks.push(fn);

        // Off / Unbind / Unsubscribe
        _each.call(callbacks, function(cb, i) {
          if (fn === cb) callbacks.splice(i, 1);
        });
      });

      return this;
    };
  };

  /*
   * Event function triad.
   * on, off, fire
   */
  var _on  = _bind('bind');
  var _off = _bind('unbind');


  var _fire = function() {
    if (!arguments.length) return this;

    var evt       = arguments[0];
    var callbacks = this._events[evt];

    if (!callbacks) return this;

    var args = arguments.length > 1
      ? _slice.call(arguments, 1)
      : null;

    _each.call(callbacks, function(cb) {
      args !== null
        ? cb.apply(this, args)
        : cb.call(this);
    }, this);

    return this;
  };

  var _getEvents = function() {
    return _extend({}, this._events);
  };


  /**
   * @param {Object} obj Target object to receive observable functions. Passed by reference.
   * @param {Object} config Optional. Configuration object.
   * @returns {Object}
   * @api public
   */
  function observable(obj, config) {
    /**
     * Configuration Options
     *
     * - `on`   : Name of the subscribe/bind function added to the object. Default is `"on"`
     * - `off`  : Name of the unsubscribe/unbind function added to the object. Default is `"off"`
     * - `fire` : Name of the publish/trigger function added to the object. Default is `"fire"`
     */
    config = _extend({
      on    : 'on',
      off   : 'off',
      fire  : 'fire'
    }, config);


    /**
     * Events collection.
     *
     * @api private
     */
    obj._events = {};


    /**
     * On (aka Subscribe/Bind)
     *
     *    myObj.on( 'showErrors', function1, functionN )
     *
     * @param {String} Event identifier.
     * @param {Function} N functions to bind to this event.
     * @returns {Object} Reference to `this` for chaining.
     * @api public
     */
    obj[config.on] = _on;


    /**
     * Off (aka Unsubscribe/Unbind)
     *
     *    // Unbind specific handlers
     *    myObj.off( 'showErrors', function1, functionN )
     *
     *    // Delete specific event.
     *    myObj.off( 'showErrors' )
     *
     *    // Remove all events.
     *    myObj.off()
     *
     * @param {String} Optional. Event identifier.
     * @param {Function} Optional. N functions to unbind from Event identifier. If none are passed the event is deleted entirely.
     * @returns {Object} Reference to `this` for chaining.
     * @api public
     */
    obj[config.off] = _off;


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
    obj[config.fire] = _fire;


    /**
     * @returns {Object|Array} Copy of the events collection, or an array of callbacks for a particular event..
     * @api public
     */
    obj.getEvents = _getEvents;


    return obj;
  };


  observable.VERSION = '0.1.2';


  /*
   * Export
   */
  if (typeof module !== 'undefined' && module.exports)
    module.exports = observable;
  else
    this.observable = observable;

}).call(this);
