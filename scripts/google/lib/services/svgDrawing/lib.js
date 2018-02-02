define([
    'specimenTools/services/dom-tool'
], function(
    domTool
) {
    'use strict';

    var svgns = 'http://www.w3.org/2000/svg';

    function setTransform(element, transformation) {
        element.setAttribute('transform', 'matrix('
                                    +  transformation.join(', ') + ')');
    }

    /**
     * draw an opentype.js glyph to a segment protocol pen
     */
    function draw(glyph, pen) {
        var i, l, cmd;
        glyph.getPath();
        for(i=0,l=glyph.path.commands.length;i<l;i++){
            cmd = glyph.path.commands[i];
            switch (cmd.type) {
                case 'M':
                    pen.moveTo([cmd.x, cmd.y]);
                    break;
                case 'Z':
                    pen.closePath();
                    break;
                case 'Q':
                    pen.qCurveTo([cmd.x1, cmd.y1], [cmd.x, cmd.y]);
                    break;
                case 'C':
                    pen.curveTo([cmd.x1, cmd.y1], [cmd.x2, cmd.y2],[cmd.x, cmd.y]);
                    break;
                case 'L':
                    pen.lineTo([cmd.x, cmd.y]);
                    break;
                default:
                    console.warn('Unknown path command:', cmd.type);
            }
        }
    }

    return {
        svgns: svgns
      , setTransform: setTransform
      , insertElement: domTool.insertElement
      , draw: draw
    };
});
