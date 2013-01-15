describe('Observable Mixin', function() {

  _.count = function(arr, value) {
    var cnt = 0;
    _.each(arr, function(val) {
      if (val === value) cnt++;
    });
    return cnt;
  };

  var o1, o2;

  beforeEach(function() {
    o1 = { name: 'Fred' };
    o2 = (function() {
      function Foo(name){
        this.name = name;
        observable(this);
      }
      return new Foo('Barney');
    })();
  });


  describe('mixin invocation', function() {
    it('should add a `on` function to the passed object', function() {
      observable(o1);
      expect(typeof o1.on).toBe('function');
    });

    it('should add a `off` function to the passed object', function() {
      observable(o1);
      expect(typeof o1.off).toBe('function');
    });

    it('should add a `fire` function to the passed object', function() {
      observable(o1);
      expect(typeof o1.fire).toBe('function');
    });

    it('should add a `getEvents` function to the passed object', function() {
      observable(o1);
      expect(typeof o1.getEvents).toBe('function');
    });

    it('should return the target object', function() {
      var retval = observable(o1);
      expect(retval).toBe(o1);

      var myO = observable({
        fred: 'flinstone'
      });
      expect(myO.fred).toBe('flinstone');
      expect(typeof myO.on).toBe('function');
      expect(typeof myO.off).toBe('function');
      expect(typeof myO.fire).toBe('function');
    });

    it('should create and return a new object if no object is passed', function() {
      var o = observable();
      expect(typeof o.on).toBe('function');
      expect(typeof o.off).toBe('function');
      expect(typeof o.fire).toBe('function');
      expect(typeof o.getEvents).toBe('function');
    });

    it('should prevent collisions between invocations', function() {
      observable(o1);
      observable(o2);
      o1.on('foo', function(){ 'foo'; });
      o1.on('bar', function(){ 'bar'; });
      o2.on('zzz', function(){ 'zzz'; });

      var events1 = o1.getEvents();
      var events2 = o2.getEvents();

      expect(events1.foo).toBeDefined();
      expect(events1.bar).toBeDefined();
      expect(events1.zzz).not.toBeDefined();
      expect(events2.foo).not.toBeDefined();
      expect(events2.bar).not.toBeDefined();
      expect(events2.zzz).toBeDefined();
    });

    it('should work on the `prototype` of a function constructor', function() {
      function Ctor() {};
      observable(Ctor.prototype);

      var c1 = new Ctor;
      var c2 = new Ctor;
      c1.on('uno', function(){});
      c2.on('dos', function(){});

      var events1 = c1.getEvents();
      var events2 = c2.getEvents();

      expect(events1.uno).toBeDefined();
      expect(events1.dos).not.toBeDefined();
      expect(events2.uno).not.toBeDefined();
      expect(events2.dos).toBeDefined();
    });

    it('should work on `this` within a function constructor', function() {
      function Ctor() {
        observable(this);
      };

      var c1 = new Ctor;
      var c2 = new Ctor;
      c1.on('one', function(){});
      c2.on('two', function(){});

      var events1 = c1.getEvents();
      var events2 = c2.getEvents();

      expect(events1.one).toBeDefined();
      expect(events1.two).not.toBeDefined();
      expect(events2.one).not.toBeDefined();
      expect(events2.two).toBeDefined();
    });
  });


  describe('functions', function() {
    var result;
    var cb1 = function() { result.push('cb1'); }
    var cb2 = function() { result.push('cb2'); }
    var cb3 = function() { result.push('cb3'); }
    var cb4 = function() { result.push('cb4'); }
    var cb5 = function() { result.push('cb5'); }

    beforeEach(function() {
      result = [];
      observable(o1);
    });

    describe('#on', function() {
      it('should add one or more callbacks for a specified event name', function() {
        var evts = o2.getEvents();
        expect(evts['event-1']).not.toBeDefined();
        expect(evts['event-2']).not.toBeDefined();

        o2.on('event-1', cb1);
        o2.on('event-2', cb2, cb3, cb4, cb5);
        evts = o2.getEvents();

        expect(_.isArray(evts['event-1'])).toBe(true);
        expect(evts['event-1'].length).toBe(1);
        expect(_.contains(evts['event-1'], cb1)).toBe(true);

        expect(_.isArray(evts['event-2'])).toBe(true);
        expect(evts['event-2'].length).toBe(4);
        expect(_.contains(evts['event-2'], cb2)).toBe(true);
        expect(_.contains(evts['event-2'], cb3)).toBe(true);
        expect(_.contains(evts['event-2'], cb4)).toBe(true);
        expect(_.contains(evts['event-2'], cb5)).toBe(true);
      });

      it('should add an array of callbacks for a specified event name', function() {
        var evts = o2.getEvents();
        expect(evts['event-1']).not.toBeDefined();
        expect(evts['event-2']).not.toBeDefined();

        o2.on('event-1', [cb1]);
        o2.on('event-2', [cb2, cb3, cb4, cb5]);
        evts = o2.getEvents();

        expect(_.isArray(evts['event-1'])).toBe(true);
        expect(evts['event-1'].length).toBe(1);
        expect(_.contains(evts['event-1'], cb1)).toBe(true);

        expect(_.isArray(evts['event-2'])).toBe(true);
        expect(evts['event-2'].length).toBe(4);
        expect(_.contains(evts['event-2'], cb2)).toBe(true);
        expect(_.contains(evts['event-2'], cb3)).toBe(true);
        expect(_.contains(evts['event-2'], cb4)).toBe(true);
        expect(_.contains(evts['event-2'], cb5)).toBe(true);
      });

      it('should return `this`', function() {
        var x = o2.on('event-1', cb1, cb2);
        expect(x).toBe(o2);
        x = o2.on('event-1', cb1);
        expect(x).toBe(o2);
      });
    });

    describe('#off', function() {
      beforeEach(function() {
        o2.on('event-1', cb1, cb2, cb3, cb4, cb5);
        o2.on('event-2', cb1, cb2, cb3, cb4, cb5);
      });

      it('should remove one or more callbacks for a specified event name', function() {
        var evts = o2.getEvents();
        expect(evts['event-1'].length).toBe(5);

        o2.off('event-1', cb1, cb3);
        evts = o2.getEvents();
        expect(evts['event-1'].length).toBe(3);
        expect(_.contains(evts['event-1'], cb2)).toBe(true);
        expect(_.contains(evts['event-1'], cb4)).toBe(true);
        expect(_.contains(evts['event-1'], cb5)).toBe(true);

        o2.on('event-2', cb1, cb2, cb3);
        expect(evts['event-2'].length).toBe(8);
        o2.off('event-2', cb5, cb1, cb3);
        expect(evts['event-2'].length).toBe(3);
        expect(_.contains(evts['event-2'], cb2)).toBe(true);
        expect(_.contains(evts['event-2'], cb4)).toBe(true);
        expect(_.count(evts['event-2'], cb2)).toBe(2);
      });

      it('should remove an array of callbacks for a specified event name', function() {
        var evts = o2.getEvents();
        expect(evts['event-1'].length).toBe(5);

        o2.off('event-1', [cb2, cb3, cb5]);
        evts = o2.getEvents();
        expect(evts['event-1'].length).toBe(2);
        expect(_.contains(evts['event-1'], cb1)).toBe(true);
        expect(_.contains(evts['event-1'], cb4)).toBe(true);

        o2.on('event-2', cb1, cb2, cb3);
        expect(evts['event-2'].length).toBe(8);
        o2.off('event-2', [cb5, cb3, cb1]);
        expect(evts['event-2'].length).toBe(3);
        expect(_.contains(evts['event-2'], cb2)).toBe(true);
        expect(_.contains(evts['event-2'], cb4)).toBe(true);
        expect(_.count(evts['event-2'], cb2)).toBe(2);
      });

      it('should remove all callbacks for an event if only an event name is passed', function() {
        var evts = o2.getEvents();
        expect(evts['event-1'].length).toBe(5);
        o2.off('event-1');
        evts = o2.getEvents();
        expect(evts['event-1'].length).toBe(0);
        expect(evts['event-2']).toBeDefined();
        expect(evts['event-2'].length).toBe(5);
      });

      it('should delete all events if no parameters are passed', function() {
        var evts = o2.getEvents();
        expect(evts['event-1']).toBeDefined();
        expect(evts['event-1'].length).toBe(5);
        expect(evts['event-2']).toBeDefined();
        expect(evts['event-2'].length).toBe(5);

        o2.off();
        evts = o2.getEvents();
        expect(evts['event-1']).not.toBeDefined();
        expect(evts['event-2']).not.toBeDefined();
      });

      it('should return `this`', function() {
        var x = o2.off('event-1', cb1, cb2);
        expect(x).toBe(o2);

        o2.on('event-1', cb1, cb2, cb3);
        x = o2.off('event-1', cb1);
        expect(x).toBe(o2);

        o2.on('event-1', cb1, cb2, cb3);
        x = o2.off('event-1');
        expect(x).toBe(o2);

        o2.on('event-1', cb1, cb2, cb3);
        x = o2.off();
        expect(x).toBe(o2);
      });
    });

    describe('#fire', function() {
      it('should invoke all event handlers for a specified event name', function() {
        o2.on('event-1', cb2);
        o2.on('event-2', cb1, cb3);
        o2.fire('event-1');
        expect(_.indexOf(result, 'cb2')).not.toBe(-1);
        expect(_.indexOf(result, 'cb1')).toBe(-1);
        expect(_.indexOf(result, 'cb3')).toBe(-1);
        result = [];
        o2.fire('event-2');
        expect(_.indexOf(result, 'cb2')).toBe(-1);
        expect(_.indexOf(result, 'cb1')).not.toBe(-1);
        expect(_.indexOf(result, 'cb3')).not.toBe(-1);
      });

      it('should return `this`', function() {
        o2.on('event-1', cb1, cb2, cb3);
        var x = o2.fire('event-1');
        expect(x).toBe(o2);

        o2.on('event-1', cb1, cb2, cb3);
        x = o2.fire();
        expect(x).toBe(o2);
      });

      it('should pass function arguments to the event handlers', function() {
        var names       = [];
        var ages        = [];
        var occupations = [];
        o2.on('event-1', function(name, age, occupation) {
          names.push(name);
          ages.push(age);
          occupations.push(occupation);
        });
        o2.fire('event-1', 'Fred', 40, 'construction');
        o2.fire('event-1', 'Pauly', 25, 'surfer');

        expect(names[0]).toBe('Fred');
        expect(names[1]).toBe('Pauly');
        expect(ages[0]).toBe(40);
        expect(ages[1]).toBe(25);
        expect(occupations[0]).toBe('construction');
        expect(occupations[1]).toBe('surfer');
      });
    });

    describe('#fire context', function() {
      var pubsub, obj, tester;

      beforeEach(function() {
        pubsub = observable();
        obj = observable({
          trigger : function() {
            this.fire('test:new', 'obj');
            pubsub.fire('test:new', 'pubsub');
          }
        });
        tester = {
          testObj : function(cb) {
            obj.on('test:new', cb);
          },
          testPubsub : function(cb) {
            pubsub.on('test:new', cb);
          }
        };
      });

      it('should use the observable object as `this`', function() {
        tester.testObj(function() {
          expect(this).toBe(obj);
        });
        tester.testPubsub(function() {
          expect(this).toBe(pubsub);
        });
        obj.trigger();
      });
    });

    describe('#getEvents', function() {
      it('should return a copy of the events collection', function() {
        o2.on('event-1', cb1);
        o2.on('event-2', cb2, cb3);
        var evts = o2.getEvents();
        expect(evts['event-1']).toBeDefined();
        expect(evts['event-2']).toBeDefined();
        delete evts['event-1'];
        delete evts['event-2'];
        expect(evts['event-1']).not.toBeDefined();
        expect(evts['event-2']).not.toBeDefined();
        evts = o2.getEvents();
        expect(evts['event-1']).toBeDefined();
        expect(evts['event-2']).toBeDefined();

        expect(evts['event-1'].length).toBe(1);
        expect(_.contains(evts['event-1'], cb1)).toBe(true);

        expect(evts['event-2'].length).toBe(2);
        expect(_.contains(evts['event-2'], cb2)).toBe(true);
        expect(_.contains(evts['event-2'], cb3)).toBe(true);
      });
    });
  });

  describe('observable.noConflict()', function() {
    it('should restore the original `observable` and return a reference to this one', function() {
      var original = observable;

      expect(typeof observable.noConflict).toBe('function');
      var obs2 = observable.noConflict();
      expect(window.observable).toBe(undefined); // No prior def here
      expect(obs2).toBe(original);
      expect(observable).toBe(undefined);

      // Reset
      observable = obs2.noConflict();
      expect(observable).toBe(original);
    });
  });

});
