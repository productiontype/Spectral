define([
    './lib'
], function(
    lib
) {
    'use strict';

    var svgns = lib.svgns
      , setTransform = lib.setTransform
      ;

    function Text(doc, val, options) {
        var font = val.fontsData.getFont(val.fontIndex)
          , unitsPerEm = font.unitsPerEm
          ;
        this.options = options;

        this.textElement = doc.createElementNS(svgns, 'text');
        this.textElement.setAttribute('font-size', unitsPerEm);
        this.textElement.textContent = val.text;

        // This may help with alignment of separate layers,
        // but it needs adjustments in initDimensions.
        // e.g: this.textElement.getBBox() usually returns a negative
        // value for x when using "end"
        // "start|middle|end"
        // this.textElement.setAttribute('text-anchor', 'end');

        val.webFontProvider.setStyleOfElement(val.fontIndex, this.textElement);
        setTransform(this.textElement, [1, 0, 0, -1, 0, 0]);
        this.element = doc.createElementNS(svgns, 'g');
        this.element.appendChild(this.textElement);
    }

    var _p = Text.prototype;

    _p.initDimensions = function() {
        var bbox = this.element.getBBox();
        // don't know how to figure these out, if there's a way in
        // SVG at all
        this.leftSideBearing = 0;
        this.rightSideBearing = 0;
        // without side bearingd width and raw width are the same
        this.rawWidth = this.width = bbox.width;
    };

    return Text;
});
