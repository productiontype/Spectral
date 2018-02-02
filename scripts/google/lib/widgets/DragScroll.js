define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';

    function DragScroll(container, pubSub, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;

        this._container.addEventListener('mousedown', this._initDrag.bind(this));
        this._container.addEventListener('touchstart', this._initDrag.bind(this));

        this.__endDrag = this._endDrag.bind(this);
        this.__performMove = this._performMove.bind(this);
        this.__move = this._move.bind(this);
        this._startPos = null;
        this._lastPos = null;
        this._requestID = null;
    }

    var _p = DragScroll.prototype = Object.create(Parent.prototype);
    _p.constructor = DragScroll;

    DragScroll.defaultOptions = {
    };

    _p._initDrag = function(event) {
        if('touches' in event)
            event = event.touches[0];
        this._startPos = {x: event.screenX, y:event.screenY};
        this._container.ownerDocument.addEventListener('mouseup', this.__endDrag);
        this._container.ownerDocument.addEventListener('touchend', this.__endDrag);
        this._container.ownerDocument.addEventListener('mousemove', this.__move);
        this._container.ownerDocument.addEventListener('touchmove', this.__move);
    };

    _p._endDrag =function() {
        this._container.ownerDocument.removeEventListener('mouseup', this.__endDrag);
        this._container.ownerDocument.removeEventListener('touchend', this.__endDrag);
        this._container.ownerDocument.removeEventListener('mousemove', this.__move);
        this._container.ownerDocument.removeEventListener('touchmove', this.__move);
        this._startPos = null;
        this._lastPos = null;
        if(this._requestID !== null) {
            window.cancelAnimationFrame(this._requestID);
            this._requestID = null;
        }
    };

    _p._performMove = function() {
        this._container.scrollLeft = this._container.scrollLeft + this._startPos.x - this._lastPos.x;
        this._container.scrollTop =  this._container.scrollTop + this._startPos.y - this._lastPos.y;
        this._requestID = null;
    }

    _p._move = function(event) {
        if('touches' in event)
            event = event.touches[0];
        if(this._lastPos !== null)
            this._startPos = this._lastPos;
        this._lastPos = {x: event.screenX, y:event.screenY};
        // throttle
        if(this._requestID === null)
            this._requestID = window.requestAnimationFrame(this.__performMove);
    };

    return DragScroll;
});
