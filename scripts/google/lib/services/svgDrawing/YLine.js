define([
    './lib'
], function(
    lib
) {
    'use strict';

    var svgns = lib.svgns;

    function YLine(doc, val, options) {
        this.options = options;
        this.element = doc.createElementNS(svgns, 'line');
        this.element.setAttribute('x1', 0);
        this.element.setAttribute('x2', 0);
        this.element.setAttribute('y1', val);
        this.element.setAttribute('y2', val);
    }

    var _p  = YLine.prototype;

    _p.noDimensions = true;
    _p.setExtends = function(x1, x2/*, height*/) {
        if(x1 !== null)
            this.element.setAttribute('x1', x1);
        if(x2 !== null)
            this.element.setAttribute('x2', x2);
        //if(height !== null)
        //    this.element.setAttribute('y2', height);
    };

    return YLine;
});
