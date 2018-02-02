define([
    'specimenTools/_BaseWidget'
  , 'Atem-Pen-Case/pens/SVGPen'
], function(
    Parent
  , SVGPen
){
    'use strict';
    /*globals window, console*/

    /**
     * GlyphTable renders a all Glyphs of a opentype.js font as SVG elements.
     * It is not initialized as a widget directly, but via the GlyphsTables
     * widget.
     *
     * Rendering all glyphs of a font takes a moment. To prevent the user
     * interface from being blocked GlyphTable renders the glyphs in batches
     * and in between interrupts using the window.requestAnimationFrame
     * interface. This behavior can be controlled by options:
     *
     * `loadAtOnce`: The number of glyphs to render per iteration, default 50
     * `loadSerial`: render all glyphs at once, default false
     */

    var svgns = 'http://www.w3.org/2000/svg';

    function GlyphTable(doc, font, options) {
        Parent.call(this, options);
        this._element = doc.createElement('div');
        this._font = font;
        this._setDimensions = null;
        this._loadProgress = [0, null];
        //console.log(this._font)
        //console.log(options)
        this.__initCells = this._initCells.bind(this);

        this._element.addEventListener('click', this._glyphClickHandler.bind(this));
    }

    var _p = GlyphTable.prototype = Object.create(Parent.prototype);
    _p.constructor = GlyphTable;

    GlyphTable.defaultOptions = {
        glyphClass: 'glyph'
      , loadAtOnce: 50
      , loadSerial: false
      , glyphActiveClass: 'active'
    };

    Object.defineProperty(_p, 'element', {
        get: function() {
            this.activate();
            return this._element;
        }
    });

    function draw(glyph, pen) {
        var i, l, cmd;
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

    _p.setDimensions = function(width, ascent, descent) {
        this._setDimensions = {
            width: width
          , ascent: ascent
          , descent: descent
        };
    };

    _p.getDimensions = function(forceOwnDimensions) {
        var ascent, descent, width, yMax, yMin;
        if(!forceOwnDimensions && this._setDimensions) {
            width = this._setDimensions.width;
            ascent = this._setDimensions.ascent;
            descent = this._setDimensions.descent;
        }
        else {
            yMax = this._font.tables.head.yMax;
            yMin = this._font.tables.head.yMin;
            width =  yMax + (yMin > 0 ? 0 : Math.abs(yMin));
            //usWinAscent and usWinDescent should be the maximum values for
            // all glyphs over the complete family.
            // So,if it ain't broken, styles of the same family should
            // all render with the same size.
            ascent =  this._font.tables.os2.usWinAscent;
            descent = this._font.tables.os2.usWinDescent;

        }
        return {
              width: width
            , height: ascent + descent
            , ascent: ascent
            , descent: descent
        };
    };

    _p._glyphClickHandler = function(evt) {
        var active = this._element.getElementsByClassName(this._options.glyphActiveClass)
          , i, l
          , element
          , glyph = null
          ;

        element = evt.target;
        while(element && element !== this._element) {
            if(element.classList.contains(this._options.glyphClass)) {
                glyph = element;
                break;
            }
            else
                element = element.parentElement;
        }

        for(i=0,l=active.length;i<l;i++) {
            if (active[i] === glyph)
                // the clicked element was active, so we just deactivate it
                glyph = null;
            active[i].classList.remove(this._options.glyphActiveClass);
        }

        if(glyph)
            glyph.classList.add(this._options.glyphActiveClass);
    };


    _p._initCell = function(glyphName, glyphIndex) {
        //console.log(glyphName, glyphIndex)
        if('range' in this._options){
            if(glyphIndex < this._options.range[0])return;
            if(glyphIndex > this._options.range[1])return;
        }

        var element = this._element.ownerDocument.createElement('div')
          , svg = this._element.ownerDocument.createElementNS(svgns, 'svg')
          , path = this._element.ownerDocument.createElementNS(svgns, 'path')
          , glyphSet = {}
          , pen = new SVGPen(path, glyphSet)
          , glyph = this._font.glyphs.get(glyphIndex)
          , dimensions = this.getDimensions()
          , width = dimensions.width
          , height = dimensions.height
          , ascent = dimensions.ascent
          , glyphWidth = (glyph.xMax || 0) - (glyph.xMin || 0)
            // move it `-glyph.xMin` horizontally to have it start at x=0
            // move it `width * 0.5` horizontally to have it start in the center
            // move it `-glyphWidth * 0.5` horizontally to center the glyph
          , centered = - (glyph.xMin || 0) + (width * 0.5) - (glyphWidth * 0.5)
          , transformation = [1, 0, 0, -1, centered, ascent]
          ;
        element.classList.add(this._options.glyphClass);
        svg.setAttribute('viewBox', [0, 0, width, height].join(' '));
        path.setAttribute('transform', 'matrix(' +  transformation.join(', ') + ')');

        svg.appendChild(path);
        draw(glyph, pen);
        element.appendChild(svg);
        element.setAttribute('title', glyph.name);
        this._element.appendChild(element);
    };

    _p._initCells = function() {
        //console.log(this._font)
        var i = this._loadProgress[0]
          , l = this._font.glyphNames.names.length
          , loadAtOnce = this._options.loadAtOnce
          ;
        for(;i<l && loadAtOnce>0;i++,loadAtOnce--)
            this._initCell(this._font.glyphNames[i], i);
            //console.log(this._font.glyphNames[i])

        this._loadProgress[0] = i;
        this._loadProgress[1] = null;
        if(i<l)
            this._loadProgress[1] = window.requestAnimationFrame(this.__initCells);
    };

    _p._initCellsSerial = function() {
        var i=0
          , l= this._font.glyphNames.names.length
          ;
        for(;i<l;i++)
            this._initCell(this._font.glyphNames[i], i);
        this._loadProgress[0] = l;
    };

    _p.activate = function() {
        if(this._loadProgress[1] !== null
                || this._loadProgress[0] >= (this._font.glyphNames.names.length))
            return;
        if(this._options.loadSerial)
            this._initCellsSerial();
        else
            this._initCells();
    };

    _p.deactivate = function() {
        if(this._loadProgress[1] === null)
            return;
        window.cancelAnimationFrame(this._loadProgress[1]);
        this._loadProgress[1] = null;

    };

    return GlyphTable;
});
