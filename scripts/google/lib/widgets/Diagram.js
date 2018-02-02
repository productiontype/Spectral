define([
    'specimenTools/_BaseWidget'
  , 'specimenTools/services/svgDrawing/DiagramRenderer'
], function(
    Parent
  , DiagramRenderer
) {
    'use strict';

    /**
     * This is a stub!
     *
     * The aim of the Diagram widget is to enable the rendering of SVG
     * based diagrams to illustrate certain aspects of the font.
     * Examples are right now a rather generic x-height diagram and a
     * rather specific `stylisticSets` diagram, that renders two glyph
     * alternates on top of each other.
     * Eventually, a small domain specific language or something similar
     * should be available to describe such diagrams, so that it is easy
     * for a designer or a specialized tool, to create these diagrams
     * for specific fonts.
     */

    function Diagram(container, pubSub, fontsData, webFontProvider, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontsData = fontsData;
        this._webFontProvider = webFontProvider;
        this._svg = null;
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));
    }

    var _p = Diagram.prototype = Object.create(Parent.prototype);
    _p.constructor = Diagram;

    Diagram.defaultOptions = {
        glyphClass: 'diagram__glyph'
      , ylineClass: 'diagram__yline'
      , boxClass: 'diagram__box'
      , layoutClass: 'diagram__layout'
      , textClass: 'diagram__text'
    };

    var instructions = {
        xHeight: ['box',
            [
                ['layout', [
                        ['glyph', 'x', {style: 'highlighted'}]
                      , ['glyph', 'X', {style: 'normal'}]
                    ]
                  , {spacing: 40}
                ]
              , ['yline', 'baseLine', {style: 'normal', insert: 0}]// 0 = insert as first element, -1 = insert as last element
              , ['yline', 'xHeight', {style: 'highlighted', insert: 0}]
            ]
          , {
                minLeftSideBearing: 50
              , minRightSideBearing: 50
            }
        ]
      , stylisticSets: ['layout',
            [
                ['box', [
                        ['glyph', 'G.ss04', {style: 'highlighted'}]
                      , ['glyph',  'G', {style: 'muted'}]
                    ]
                  , {align: 'left'}
                ]
              , ['box', [
                        ['glyph', 'g.ss01', {style: 'highlighted'}]
                      , ['glyph',  'g', {style: 'muted'}]
                    ]
                  , {align: 'right'}
                ]
              , ['box', [
                        ['glyph', 'R.ss03', {style: 'highlighted'}]
                      , ['glyph',  'R', {style: 'muted'}]
                    ]
                  , {align: 'left'}
                ]
              , ['box', [
                        ['glyph', 'l.ss02', {style: 'highlighted'}]
                      , ['glyph',  'l', {style: 'muted'}]
                    ]
                  , {align: 'left'}
                ]
            ]
        ]
      , basicLines: function() {
            /* jshint validthis:true */
            var text = this._container.hasAttribute('data-text-content')
                ?  this._container.getAttribute('data-text-content')
                : 'Hamburger'
                ;
            return ['box',
                [
                    ['text', text, {align: 'center', style: 'normal'}]
                  , ['yline', 'baseLine', {style: 'normal', insert: 0}]// 0 = insert as first element, -1 = insert as last element
                  , ['yline', 'xHeight', {style: 'normal', insert: 0}]
                  , ['yline', 'capHeight', {style: 'normal', insert: 0}]
                  , ['yline', 'descender', {style: 'normal', insert: 0}]
                ]
              , {
                    minLeftSideBearing: 350
                  , minRightSideBearing: 350
                }
            ];
        }
    };

    _p._onActivateFont = function(fontIndex) {
        var instructionsKey = this._container.getAttribute('data-diagram-name')
          , instructionSet = instructions[instructionsKey]
          , result
          , optionKeys = {
                ascent: 'data-diagram-ascent'
               , descent: 'data-diagram-descent'
               , height: 'data-diagram-height'
            }
          , k
          , options = Object.create(null)
          , renderer
          ;
        if(this._svg)
            this._container.removeChild(this._svg);

        if(typeof instructionSet === 'function')
            instructionSet = instructionSet.call(this);
        if(!instructionSet)
            return;

        renderer = new DiagramRenderer(
              this._container.ownerDocument
            , this._fontsData
            , this._webFontProvider
            , this._options
        );

        for(k in optionKeys)
            if(this._container.hasAttribute(optionKeys[k]))
                options[k] = parseFloat(this._container.getAttribute(optionKeys[k]));
        result = renderer.render(instructionSet, fontIndex, options);
        this._svg = result.element;
        this._container.appendChild(this._svg);
        result.onHasDocument();
    };

    return Diagram;
});
