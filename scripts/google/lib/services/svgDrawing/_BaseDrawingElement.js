define([
], function(
) {
    'use strict';
    function _BaseDrawingElement(){}

    var _p = _BaseDrawingElement.prototype;

    _p.setExtends = function(x1, x2) {
        //jshint unused:vars
        var i,l, args=[];
        for(i=0,l=arguments.length;i<l;i++)
            args.push(arguments[i]);
        for(i=0,l=this._children.length;i<l;i++) {
            if(typeof this._children[i].setExtends !== 'function')
                continue;
            this._children[i].setExtends.apply(this._children[i], args);
        }
    };

    return _BaseDrawingElement;
});
