define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';
    /*jshint esnext:true*/

    /**
     * Wigets that sets the `element.style` for the currently selected
     * font.
     *
     * Note that in conjunction with the DOM attribute `contenteditable="true"`
     * or a `<textarea>` element a simple tool for typing the current font
     * is created.
     */

    function CurrentWebFont(container, pubSub, webFontProvider, options) {
        Parent.call(this, options);
        this._container = container;
        this._webFontProvider = webFontProvider;
        this._pubSub = pubSub;
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));
    }

    var _p = CurrentWebFont.prototype = Object.create(Parent.prototype);
    _p.constructor = CurrentWebFont;

    CurrentWebFont.defaultOptions = {
    };

    _p._onActivateFont = function(fontIndex) {
        //console.log("_onActivateFont",fontIndex)
        this._webFontProvider.setStyleOfElement(fontIndex, this._container);
    };

    return CurrentWebFont;
});
