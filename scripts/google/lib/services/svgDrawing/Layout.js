define([
    './_BaseDrawingElement'
  , './lib'
], function(
    Parent
  , lib
) {
    'use strict';

    var svgns = lib.svgns
      , setTransform = lib.setTransform
      , insertElement = lib.insertElement
      ;

    function Layout(doc, children, options) {
        this.options = options;
        this.leftSideBearing = 0;
        this.rightSideBearing = 0;
        this._children = children;
        this.element = doc.createElementNS(svgns, 'g');
        this._addChildren(children);
    }
    var _p = Layout.prototype = Object.create(Parent.prototype);
   _p.constructor = Layout;

    Object.defineProperty(_p, 'width', {
        get: function() {
            var i, l, width=0;
            for(i=0,l=this._children.length;i<l;i++) {
                if(this._children[i].noDimensions)
                    // don't consider these
                    continue;
                if(i > 0 && this.options.spacing)
                    width += this.options.spacing;
                width += this._children[i].width;
            }
            return width;
        }
      , enumerable: true
    });

    Object.defineProperty(_p, 'rawWidth', {
        get: function() {
            return this.width - this.leftSideBearing - this.rightSideBearing;
        }
    });

    _p.initDimensions = function() {
         var i, l, child, xadvance = 0;
         for(i=0,l=this._children.length;i<l;i++) {
            child = this._children[i];
            if(child.noDimensions)
                // don't consider these
                continue;
            child.initDimensions();
            setTransform(child.element, [1, 0, 0, 1, xadvance, 0]);
            if(this.options.spacing)
                xadvance += this.options.spacing;
            xadvance += child.width;
        }
        this.leftSideBearing = this._children[0].leftSideBearing;
        this.rightSideBearing = this._children[this._children.length-1].rightSideBearing;
    };

    _p._addChildren = function(children) {
        var i, l, child;
        if(!children.length) return;
        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            insertElement(this.element, child.element, child.options.insert);
        }
    };

    return Layout;
});
