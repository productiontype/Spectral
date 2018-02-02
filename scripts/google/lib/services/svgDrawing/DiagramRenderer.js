define([
    'specimenTools/services/dom-tool'
  , './lib'
  , './Box'
  , './Glyph'
  , './Layout'
  , './YLine'
  , './Text'
], function(
    domTool
  , lib
  , Box
  , Glyph
  , Layout
  , YLine
  , Text
) {
    'use strict';

    var applyClasses = domTool.applyClasses
      , svgns = lib.svgns
      , setTransform = lib.setTransform
      ;

    /**
     * options: {constructorname} + 'Class': 'a_class_name_for_constructor'
     *      see the _constructors properties for constructor names
     *      e.g.:
     *      glyphClass: 'diagram__glyph'
     *      ylineClass: 'diagram__yline'
     *      boxClass: 'diagram__box'
     *      layoutClass: 'diagram__layout'
     *      textClass: 'diagram__text'
     *
     *
     */
    function DiagramRenderer(doc, fontsData, webFontProvider, options) {
        this._options = options || {};
        this._doc = doc;
        this._fontsData = fontsData;
        this._webFontProvider = webFontProvider;
    }

    var _p = DiagramRenderer.prototype;
    _p.constructor = DiagramRenderer;

    _p._constructors = {
        glyph: Glyph
      , layout: Layout
      , box: Box
      , yline: YLine
      , text: Text
    };

    _p._applyStyles = function(type, item) {
        var cssClass = this._options[type + 'Class']
          , cssBehaviorClass
          ;

        if(item.options.features)
            item.element.style.fontFeatureSettings = item.options.features;

        if(!cssClass)
            return;
        applyClasses(item.element, cssClass);
        if(item.options.style) {
            cssBehaviorClass = cssClass + '_' + item.options.style;
            applyClasses(item.element, cssBehaviorClass);
        }
    };

    _p._renderElement = function(instructions, fontIndex) {
        //console.log(this._fontsData)

        var type = instructions[0]
          , options = instructions[2] || {}
          , i, l
          , Type = this._constructors[type]
          , content, item, child
          ;

        switch(type) {
            case('glyph'):
                content = this._fontsData.getGlyphByName(fontIndex, instructions[1]);
                //content = this._fontsData.getGlyphByName(fontIndex, "uni0058");

                if(!content)
                    throw new Error('DiagramRenderer: can\'t find glyph '
                                    + 'with name "'+instructions[1]+'"');
                break;
            case('yline'):
                content = instructions[1] !== 'baseLine'
                        ? this._fontsData.getFontValue(fontIndex, instructions[1])
                        : 0
                        ;
                break;
            case('text'):
                content = {
                    text: instructions[1]
                  , fontIndex: fontIndex
                  , fontsData: this._fontsData
                  , webFontProvider: this._webFontProvider
                };
                break;
            default:
                content = [];
                for(i=0,l=instructions[1].length;i<l;i++) {
                    // recursion
                    child = this._renderElement(instructions[1][i], fontIndex);
                    content.push(child);
                }
        }
        item = new Type(this._doc, content, options);
        this._applyStyles(type, item);
        return item;
    };

    function getFontDimensions(font, options) {
        var ascent, descent, width, yMax, yMin, height;
        yMax = font.tables.head.yMax;
        yMin = font.tables.head.yMin;
        width =  yMax + (yMin > 0 ? 0 : Math.abs(yMin));
        //usWinAscent and usWinDescent should be the maximum values for
        // all glyphs over the complete family.
        // So,if it ain't broken, styles of the same family should
        // all render with the same size.
        ascent = 'ascent' in options
                ? options.ascent
                : font.tables.os2.usWinAscent
                ;
        descent = 'descent' in options
                ? options.descent
                : font.tables.os2.usWinDescent
                ;
        height = 'height' in options
                ? options.height
                : ascent + descent
                ;
        return {
              width: width
            , height: height
            , ascent: ascent
            , descent: descent
        };
    }

    function onHasDocument(svg, contentObject, font, options) {
        // From here on I can use getBBox()
        var width, dimensions, height, ascent;
        contentObject.initDimensions();
        width = contentObject.width;
        contentObject.setExtends(
                -contentObject.leftSideBearing
              , width-contentObject.leftSideBearing
        );

        dimensions = getFontDimensions(font, options);
        height = dimensions.height;
        ascent = dimensions.ascent;
        svg.setAttribute('viewBox', [0, 0, width, height].join(' '));
        setTransform(contentObject.element
            , [1, 0, 0, -1, contentObject.leftSideBearing, ascent]);
    }

    _p.render = function(instructions, fontIndex, options) {
        var svg = this._doc.createElementNS(svgns, 'svg')
          , contentObject = this._renderElement(instructions, fontIndex)
          , font = this._fontsData.getFont(fontIndex)
          ;

        svg.appendChild(contentObject.element);

        return {
              element: svg
            , onHasDocument: onHasDocument.bind(null, svg, contentObject
                                                        , font, options)
        };
    };

    return DiagramRenderer;
});
