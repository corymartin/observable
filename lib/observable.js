/*!
 * Observable Mixin
 * ================
 *
 * Adds basic observer (pub/sub) functionality to an object.
 *
 * Copyright (c) 2012 Cory Martin
 * Distributed under the MIT License
 */

;(function() {

  /**
   * @param {Object} Target object to receive observable functions. Passed by reference.
   * @param {Object} Optional. Configuration object.
   */

  function observable(obj, config) {
    'use strict';

    var _extend = function(target, source) {
      if (source != null)
        for (var key in source) target[key] = source[key];
      return target;
    }

    var _each = [].forEach || function(iterator, context) {
      var i   = 0;
      var len = this.length;
      for (; i < len; i++) iterator.call(context, this[i], i, this);
    }

    var _isString = function(obj) {
      return ({}).toString.call(obj) === '[object String]';
    }


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
     * @private
     */

    var _events = {};


    /**
     * Creates the bind and unbind functions.
     *
     * @param {String} `'bind'` or `'unbind'`
     * @return {Function}
     * @private
     */

    var _bind = function( /*String*/bindOrUnbind ) {
      var isBind = bindOrUnbind === 'bind';

      return function( /*String*/evt ) {
        if (evt != null && !_isString(evt)) return this;

        // Unbind all events or a specific event.
        if (!isBind) {
          // No params. Remove all events.
          if (!arguments.length) {
            _events = {};
            return this;
          }

          // 1 param: event name. Remove that event.
          if (arguments.length === 1) {
            delete _events[ evt ];
            return this;
          }
        }

        var functions = [].slice.call(arguments, 1);

        if (!functions.length) return this;

        var callbacks = _events[evt] || (_events[evt] = []);

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
      }
    }


    /**
     * On (aka Subscribe/Bind)
     *
     *    myObj.on( 'showErrors', function1, functionN )
     *
     * @param {String} Event identifier.
     * @param {Function} N functions to bind to this event.
     * @return {Object} Reference to `this` for chaining.
     */

    obj[config.on] = _bind('bind');


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
     * @return {Object} Reference to `this` for chaining.
     */

    obj[config.off] = _bind('unbind');


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
     * @return {Object} Reference to `this` for chaining.
     */

    obj[config.fire] = function() {
      if (!arguments.length) return this;

      var evt       = arguments[0];
      var callbacks = _events[evt];

      if (!callbacks) return this;

      var args = arguments;
      _each.call(callbacks, function(cb) {
        args.length === 1
          ? cb.call(this)
          : cb.apply(this, [].slice.call(args, 1));
      }, this);

      return this;
    }


    /**
     * @return {Object} Copy of the events collection.
     */

    obj.getEvents = function() {
      return _extend({}, _events);
    }
  }



  if (typeof module !== 'undefined' && module.exports)
    module.exports = observable;
  else
    this.observable = observable;

})();