define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';
    /*jshint esnext:true*/

    /**
     * GenericFontData looks at the "data-getter" attribute of the host
     * element and queries FontData for that getter description and the
     * current font. Then it sets hostElement.textContent to the result
     * of the query.
     *
     * The "data-getter" attribute value should be the name of a getter function
     * in FontData without the preceding `get` e.g. for `data-getter="NumberSupportedLanguages"`
     * `fontData.getNumberSupportedLanguages(currentFontIndex)` will be called.
     *
     * The result of the call to FontData.get{...} is not specially formatted.
     * arrays are joined with ", " but everything else will just be used
     * as it.
     *
     * The option `getValue` can be used to adhoc enhance the getter and
     * string formatting. If more is needed GenericFontData should be subclassed.
     *
     */
    function GenericFontData(container, pubSub, fontData, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontData = fontData;
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));
    }

    var _p = GenericFontData.prototype = Object.create(Parent.prototype);
    _p.constructor = GenericFontData;

    GenericFontData.defaultOptions = {
        // this can be a method called instead of the native getValue
        // function. The single argument is (int) fontIndex.
        // The this-value is the instance of GenericFontData.
        getValue: null
    };

    _p._defaultGetValue  = function(fontIndex) {
        var _getter, getter;
        getter = _getter = this._container.getAttribute('data-getter');
        if(getter.indexOf('get') !== 0)
            getter = ['get', getter[0].toUpperCase(), getter.slice(1)].join('');

        if(!(getter in this._fontData) || typeof this._fontData[getter] !== 'function')
            throw new Error('Unknown getter "' + _getter + '"'
                        + (getter !== _getter
                                    ? '(as "' + getter + '")'
                                    : '')
                        +'.');
        return this._fontData[getter](fontIndex);
    };

    _p._getValue = function(fontIndex) {
        var value;
        if(this._options.getValue !== null)
            // This is a rude way to enhance this
            return this._options.getValue.call(this, fontIndex);
        value = this._defaultGetValue(fontIndex);
        if(typeof value.length === 'number' && typeof value !== 'string')
            value = Array.prototype.join.call(value, ', ');
        return value;
    };

    _p._onActivateFont = function(fontIndex) {
        this._container.textContent = this._getValue(fontIndex);
    };

    return GenericFontData;
});
