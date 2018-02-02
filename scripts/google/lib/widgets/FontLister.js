define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';

    /**
     * Very basic <select> interface to switch between all loaded fonts.
     * See FamilyChooser for a more advanced interface.
     */

    function FontLister(container, pubSub, fontData, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontsData = fontData;

        this._elements = [];
        this._selectContainer = this._container.ownerDocument.createElement('select');
        this._selectContainer.addEventListener('change', this._selectFont.bind(this));
        this._selectContainer.enabled = false;
        this._container.appendChild(this._selectContainer);

        this._pubSub.subscribe('allFontsLoaded', this._onAllFontsLoaded.bind(this));
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));
    }
    var _p = FontLister.prototype = Object.create(Parent.prototype);
    _p.constructor = FontLister;

    FontLister.defaultOptions = {
        order: 'load' // OR: 'family'
    };

    _p._onActivateFont = function (fontIndex) {
        var i,l
          , options = this._selectContainer.children
          , option
          ;
        for(i=0,l=options.length;i<l;i++) {
            option = options[i];
            option.selected = option.value == fontIndex;
        }
    };

    _p._onAllFontsLoaded = function() {
        var fonts
          , i, l, option, fontIndex
          ;

        switch(this._options.order){
            case 'family':
                fonts = this._fontsData.getFontIndexesInFamilyOrder();
            case 'load':
                /* falls through */
            default:
                fonts = this._fontsData.getFontIndexes();
        }

        for(i=0,l=fonts.length;i<l;i++) {
            fontIndex = fonts[i];
            option = this._selectContainer.ownerDocument.createElement('option');
            option.textContent = [
                        this._fontsData.getFamilyName(fontIndex)
                      , this._fontsData.getStyleName(fontIndex)
                      ].join(' ');

            option.value = fontIndex;
            this._elements.push(option);
            this._selectContainer.appendChild(option);
        }
        this._selectContainer.enabled = true;
    };

    _p._selectFont = function(event) {
        this._pubSub.publish('activateFont', event.target.value);
    };

    return FontLister;
});
