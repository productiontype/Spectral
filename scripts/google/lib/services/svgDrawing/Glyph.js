define([
    './lib'
  , 'Atem-Pen-Case/pens/SVGPen'
  , 'Atem-Pen-Case/pens/BoundsPen'
  , 'Atem-Pen-Case/pens/TransformPen'
], function(
    lib
  , SVGPen
  , BoundsPen
  , TransformPen
) {
    'use strict';

    var svgns = lib.svgns
      , draw = lib.draw
      ;

    function Glyph(doc, glyph, options) {
        var boundsPen, bounds, svgPen, pen;
        this.options = options;
        boundsPen = new BoundsPen({});
        draw(glyph, boundsPen);
        // [xMin, yMin, xMax, yMax]
        bounds = boundsPen.getBounds();

        this.leftSideBearing = bounds[0];
        this.rightSideBearing = glyph.advanceWidth - bounds[2];
        this.rawWidth = bounds[2] - bounds[0];
        this.width = glyph.advanceWidth;

        this.element = doc.createElementNS(svgns, 'path');
        svgPen = new SVGPen(this.element, {});
        // so, in path is now the glyph without it's left side bearing!
        pen = new TransformPen(svgPen, [1, 0, 0, 1, -this.leftSideBearing, 0]);
        draw(glyph, pen);
    }

    var _p = Glyph.prototype;

    // not needed
    _p.initDimensions = function() {};

    return Glyph;
});
