define([
    'specimenTools/_BaseWidget'
  , './GlyphTable'
], function(
    Parent
  , GlyphTable
) {
    'use strict';

    /**
     * GlyphTables manages the rendering of the GlyphTable for the current
     * font.
     *
     * The main task is switching to the GlyphTable for the active font.
     *
     * Another task is to determine a common glyph element size for all
     * fonts/GlyphTable-children:
     * When rendering a font, the size of the glyphs svg element is
     * determined by GlyphTable. But, when multiple fonts are displayed
     * this is resulting in different glyph element sizes. Thus, when all
     * fonts are available (see `_p._onAllFontsLoaded`) GlyphTable will
     * use the `setDimensions` method of its children to set a common glyph
     * element size.
     *
     * Options:
     *
     * `glyphTable`: Object, configuration passed to the children
     * `GlyphTable` constructor.
     */
    function GlyphTables(container, pubsub, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubsub;

        this._activeTable  = null;

        this._options = this._makeOptions(options);
        if(container.getAttribute('data-range'))this._options.glyphTable.range = container.getAttribute('data-range').split(',')
        //console.log(this._options)

        this._tables = [];
        this._tablesContainer = this._container.ownerDocument.createElement('div');
        this._container.appendChild(this._tablesContainer);

        this._pubSub.subscribe('loadFont', this._onLoadFont.bind(this));
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));
        this._pubSub.subscribe('allFontsLoaded', this._onAllFontsLoaded.bind(this));
    }

    var _p = GlyphTables.prototype = Object.create(Parent.prototype);
    _p.constructor = GlyphTables;

    GlyphTables.defaultOptions = {
        glyphTable: {}
    };

    _p._onLoadFont = function (i, fontFileName, font) {
        var gt = new GlyphTable(this._tablesContainer.ownerDocument, font, this._options.glyphTable);
        this._tables[i] = gt;
    };

    _p._onAllFontsLoaded = function(countAll) {
        /*jshint unused:vars*/
        var i, l, dimensions, ascent = null, descent = null, width = null;
        for(i=0,l=this._tables.length;i<l;i++) {
            dimensions = this._tables[i].getDimensions(true);
            ascent = Math.max(ascent || 0, dimensions.ascent);
            descent = Math.max(descent || 0, dimensions.descent);
            width = Math.max(width || 0, dimensions.width);
        }
        for(i=0,l=this._tables.length;i<l;i++)
            this._tables[i].setDimensions(width, ascent, descent);
    };

    _p._onActivateFont = function(i) {
        if(this._activeTable === i)
            return;
        while(this._tablesContainer.children.length)
            this._tablesContainer.removeChild(this._tablesContainer.lastChild);
        if(this._activeTable !== null)
            this._tables[this._activeTable].deactivate();
        this._tables[i].activate();
        this._tablesContainer.appendChild(this._tables[i].element);
        this._activeTable = i;
    };

    return GlyphTables;
});
