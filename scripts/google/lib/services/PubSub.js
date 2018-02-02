define([
], function(
) {
    'use strict';
    /**
     * Simple module for signaling.
     *
     * On a call to `pubSub.publish("channel-name"[, optional, arg1, ... args])`
     * the callback of all subscriptions of "channel-name" will be invoked
     * with the optional arguments given to `publish`:
     *          `callback(optional, arg1, ... args)`
     *
     * The subscriptions are always invoked in the order of subscription.
     *
     * There's no way to cancel subscription yet.
     */
    function PubSub() {
        this._callbacks = Object.create(null);
    }

    var _p = PubSub.prototype;

    _p.subscribe = function(channel, callback) {
        var callbacks = this._callbacks[channel];
        if(!callbacks)
            this._callbacks[channel] = callbacks = [];
        callbacks.push(callback);
    };

    _p.publish = function(channel /* , args, ... */) {
        var i, l
          , args = []
          , callbacks = this._callbacks[channel] || []
          ;
        for(i=1,l=arguments.length;i<l;i++)
            args.push(arguments[i]);
        for(i=0,l=callbacks.length;i<l;i++)
            callbacks[i].apply(null, args);
    };

    return PubSub;
});
