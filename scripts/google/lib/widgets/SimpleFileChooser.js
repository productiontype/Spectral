define([
], function(
) {
    'use strict';

    /**
     * Very basic interface to switch between all loaded fonts.
     * See FamilyChooser for a more advanced interface.
     */

    function SimpleFileChooser(container, pubSub) {
        this._container = container;
        this._pubSub = pubSub;

        this._switches = [];
        this._switchesContainer = this._container.ownerDocument.createElement('div');
        this._container.appendChild(this._switchesContainer);

        this._pubSub.subscribe('prepareFont', this._prepareLoadHook.bind(this));
        this._pubSub.subscribe('loadFont', this._onLoadFont.bind(this));
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));
    }

    var _p = SimpleFileChooser.prototype;

    _p._prepareLoadHook = function(i, fontFileName) {
        var button = this._switchesContainer.ownerDocument.createElement('button');
        button.textContent = fontFileName;
        button.disabled = true;
        button.addEventListener('click', this._activateFont.bind(this, i), true);
        this._switches.push(button);
        this._switchesContainer.appendChild(button);
    };

    _p._onLoadFont = function (i, fontFileName, font) {
        /*jshint unused: vars*/
         this._switches[i].disabled = false;
    };

    _p._activateFont = function(i) {
        // this will call this._onActivateFont
        this._pubSub.publish('activateFont', i);
    };

    _p._onActivateFont = function(i) {
        /*jshint unused: vars*/
        // this should only change the view, not emit signals
        // ToDo: mark the button(s) active/inactive
    };

    return SimpleFileChooser;
});
