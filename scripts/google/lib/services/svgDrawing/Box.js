define([
    './_BaseDrawingElement'
  , './lib'
], function(
    Parent
  , lib
) {
    'use strict';

    var svgns = lib.svgns
      , insertElement = lib.insertElement
      , setTransform = lib.setTransform
      ;

    /**
     * options:
     *   minLeftSideBearing
     *   minRightSideBearing
     *   align left|centert|right
     */
    function Box(doc, children, options) {
        this.options = options;
        this.leftSideBearing = null;
        this.rightSideBearing = null;
        this.rawWidth = 0;
        this._children = children;
        this.element = doc.createElementNS(svgns, 'g');
        this._addChildren(children);
    }
    var _p = Box.prototype = Object.create(Parent.prototype);
    _p.constructor = Box;

    _p._addChildren = function(children) {
        var i, l, child;
        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            insertElement(this.element, child.element, child.options.insert);
        }
    };

    _p._allignChildren = function(xpos) {
        var sorted = this._children
                            .filter(function(child){ return !child.noDimensions;})
                            .sort(function(childA, childB) {
                // narrowest item first
                return childA.rawWidth - childB.rawWidth;
            })
          , widest = sorted.pop()
          , i, l, x
          ;
        for(i=0,l=sorted.length;i<l;i++) {
            switch(xpos) {
                case('right'):
                    x = widest.rawWidth - sorted[i].rawWidth;
                    break;
                case('center'):
                    x = (widest.rawWidth - sorted[i].rawWidth) * 0.5;
                    break;
                case('left'):
                    /* falls through */
                default:
                    x=0;
                    break;
            }
            setTransform(sorted[i].element, [1, 0, 0, 1, x, 0]);
        }
    };

    _p.initDimensions = function() {
        var i, l, child, lsb = [], rsb = [];
        if(this.options.minLeftSideBearing)
            lsb.push(this.options.minLeftSideBearing);
        if(this.options.minRightSideBearing)
             rsb.push(this.options.minRightSideBearing);

        for(i=0,l=this._children.length;i<l;i++) {
            child = this._children[i];
            if(child.noDimensions)
                // don't consider these
                continue;
            child.initDimensions();
            lsb.push(child.leftSideBearing);
            rsb.push(child.rightSideBearing);
            this.rawWidth = i === 0
                        ? child.rawWidth
                        : Math.max(this.rawWidth, child.rawWidth);
        }
        this.leftSideBearing = lsb.length
                    ? Math.max.apply(null, lsb)
                    : 0
                    ;
        this.rightSideBearing = rsb.length
                    ? Math.max.apply(null, rsb)
                    : 0
                    ;
        this._allignChildren(this.options.align);
    };

    Object.defineProperty(_p, 'width', {
        get: function() {
            return this.leftSideBearing + this.rawWidth + this.rightSideBearing;
        }
      , enumerable: true
    });

    return Box;
});
