define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';

    /**
     * WebFontProvider takes the original arraybuffer of the loaded fonts
     * and adds it as a Web-Font—i.e. as loaded with @font-face—to the
     * document.
     *
     * The values for CSS 'font-style', 'font-weight' and 'font-family'
     * are taken from the font directly, via the FontData service and
     * there via opentype.js.
     *
     * The public method `setStyleOfElement(fontIndex, element)`
     * sets the element.style so that the web font with fontIndex is
     * displayed.
     *
     * The public method `getStyleProperties(fontIndex)` returns a string
     * of CSS properties that would make the font with fontIndex being
     * displayed.
     */
    function WebFontProvider(window, pubsub, fontData, options) {
        Parent.call(this, options);
        this._window = window;
        this._pubSub = pubsub;
        this._fontData = fontData;
        this._pubSub.subscribe('loadFont', this._onLoadFont.bind(this));
        this._data = [];
        this._blobs = [];

        this.__stylesheet = null;
    }

    var _p = WebFontProvider.prototype = Object.create(Parent.prototype);
    _p.constructor = WebFontProvider;

    WebFontProvider.defaultOptions = {
    };

    Object.defineProperty(_p, '_styleSheet', {
        get: function() {
            if(!this.__stylesheet) {
                var elem = this._window.document.createElement('style');
                // seems like Webkit needs this,it won't do any harm anyways.
                elem.appendChild(this._window.document.createTextNode(''));
                this._window.document.head.appendChild(elem);
                this.__stylesheet = elem.sheet;
            }
            return this.__stylesheet;
        }
    });

    _p._makeWebfont = function(fontIndex) {
        var arrBuff = this._fontData.getOriginalArraybuffer(fontIndex)
          , familyName = this._fontData.getCSSFamilyName(fontIndex)
          , weight = this._fontData.getCSSWeight(fontIndex)
          , style = this._fontData.getCSSStyle(fontIndex)
          , fontface, url, blob, styleData
          ;

        this._data[fontIndex] = styleData = Object.create(null);
        styleData['font-style'] = style;
        styleData['font-weight'] = weight;
        styleData['font-family'] = familyName;
        Object.defineProperty(styleData, '_props', {
            value: null
          , enumerable: false
          , writable: true
        });

        if('FontFace' in this._window) {
            // more modern and direct
            fontface = new this._window.FontFace(familyName, arrBuff,{
                        weight: weight
                      , style: style
                    });
            this._window.document.fonts.add( fontface );
        }
        else {
            // oldschool, a bit bloated
            blob = new this._window.Blob([arrBuff], { type: 'font/opentype' });
            this._blobs[fontIndex] = blob;
            url = this._window.URL.createObjectURL(blob);
            this._styleSheet.insertRule([
                    '@font-face {'
                , this.getStyleProperties(fontIndex)
                , 'src: url(' + url + ');'
                , '}'
                ].join(''), this._styleSheet.cssRules.length);
        }
    };

    _p._onLoadFont = function(fontIndex) {
        this._makeWebfont(fontIndex);
    };

    /**
     * use this in the style attribute or in css rules
     */
    _p.getStyleProperties = function(fontIndex) {
        var data = this._data[fontIndex]
          , props, propName
          ;
        if(!data)
            throw new Error('FontIndex "' + fontIndex + '" is not loaded.');
        props = data._props;
        if(!props) {
            props = [];
            for(propName in data)
                props.push(propName, ': ', data[propName], ';');
            props = props.join('');
        }
        return props;
    };

    _p.setStyleOfElement = function(fontIndex, element) {
        var data = this._data[fontIndex]
          , propName
          ;
        if(!data)
            throw new Error('FontIndex "' + fontIndex + '" is not loaded.');
        for(propName in data)
            element.style[this._cssName2jsName(propName)] = data[propName];
    };

    return WebFontProvider;
});
