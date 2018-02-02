define([
    './services/dom-tool'
], function(
    domTool
){
    'use strict';

    function _BaseWidget(options) {
        this._options = this._makeOptions(options);
    }

    _BaseWidget.defaultOptions = {};

    var _p = _BaseWidget.prototype;
    _p.constructor = _BaseWidget;

    _p._makeOptions = function(options) {
            // With Object.keys we won't get keys from the prototype
            // of options but maybe we want this!?
        var keys = options ? Object.keys(options) : []
          , i, l
          , result = Object.create(this.constructor.defaultOptions)
          ;
        for(i=0,l=keys.length;i<l;i++)
            result[keys[i]] = options[keys[i]];
        return result;
    };

    _p._applyClasses = domTool.applyClasses;

    _p._cssName2jsName = function (name) {
        var pieces = name.split('-'), i, l;
        for(i=1,l=pieces.length;i<l;i++)
            pieces[i] = pieces[i][0].toUpperCase() + pieces[i].slice(1);
        return pieces.join('');
    };

    return _BaseWidget;
});
