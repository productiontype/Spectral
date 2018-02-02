define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';

    /**
     * LoadProgressIndicator visualizes the progress of the loading of the
     * font files.
     * It also applies CSS-classes to its container element to help styling
     * the document while loading the fonts.
     *
     * Before loading, no CSS-Classes are set by this widget.
     * While loading the fonts `loadingClass` is set to the container.
     * When loading is finished `loadedClass` is set to the container and
     * `loadingClass` is removed.
     *
     * So, when `loadedClass` is present, the specimen content can be shown
     * and when none of these classes or `loadingClass` are present a progress
     * indicator window can be shown.
     *
     * Child elements with the CSS-Class configured at `progressBarClass`
     * will either get their `element.style.width` set to "{percent}%"
     * or the configurable method at `setProgressBar` will be called
     * like this: `setProgressBar.call(widgetInstance, element, percent)`.
     *
     * Child elements with the CSS-Class configured at `percentIndicatorClass`
     * will have their element.textContent set to: "{percent} %"
     *
     * Child elements with the CSS-Class configured at `taskIndicatorClass`
     * will have their element.innerHTML set to: "<em>{task}:</em> {fontFileName}"
     *
     * The idea is to initialize this widget on the <body> element.
     */
    function LoadProgressIndicator(container, pubSub, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;

        this._pubSub.subscribe('prepareFont', this._onPrepareFont.bind(this));
        this._pubSub.subscribe('loadFont', this._onLoadFont.bind(this));
        this._pubSub.subscribe('allFontsLoaded', this._onAllFontsLoaded.bind(this));

        this._numAllFonts = null;
        this._fontsLoaded = 0;

        this._elements = {
            progressBar: this._container.getElementsByClassName(this._options.progressBarClass)
          , percentIndicator: this._container.getElementsByClassName(this._options.percentIndicatorClass)
          , taskIndicator: this._container.getElementsByClassName(this._options.taskIndicatorClass)
        };
    }

    var _p = LoadProgressIndicator.prototype = Object.create(Parent.prototype);

    LoadProgressIndicator.defaultOptions = {
        loadedClass: 'load-progress_loaded'
      , loadingClass: 'load-progress_loading'
      , progressBarClass: 'load-progress__progress-bar'
      , setProgressBar: function(element, percent) {
            element.style.width = percent + '%';
        }
      , percentIndicatorClass: 'load-progress__percent'
      , taskIndicatorClass: 'load-progress__task'
    };

    _p._updateProgress = function(label, fontIndex, fontFileName) {
        var percent, i, l;

        percent = Math.round(this._fontsLoaded /this._numAllFonts * 10000) / 100;

        for(i=0,l=this._elements.taskIndicator.length;i<l;i++)
            this._elements.taskIndicator[i].innerHTML = [
                                '<em>', label, '</em> ',(
                                fontFileName.lastIndexOf('/') === -1
                                    ? fontFileName
                                    : '…' + fontFileName.slice(fontFileName.lastIndexOf('/'))
                                )].join('');

        for(i=0,l=this._elements.percentIndicator.length;i<l;i++)
            this._elements.percentIndicator[i].textContent = percent + ' %';

        for(i=0,l=this._elements.progressBar.length;i<l;i++)
            this._options.setProgressBar.call(this, this._elements.progressBar[i], percent);
    };

    _p._onPrepareFont = function(fontIndex, fontFileName, numAllFonts) {
        if(this._numAllFonts === null) {
            this._applyClasses(this._container, this._options.loadingClass);
            this._applyClasses(this._container, this._options.loadedClass, true);
            this._numAllFonts = numAllFonts;
            this._numAllFonts = numAllFonts;
        }
        this._updateProgress('Requesting:', fontIndex, fontFileName);
    };

    _p._onLoadFont = function (fontIndex, fontFileName, font) {
        /*jshint unused: vars*/
        this._fontsLoaded += 1;
        this._updateProgress('Loaded:', fontIndex, fontFileName);
    };

    _p._onAllFontsLoaded = function(numAllFonts) {
        /*jshint unused: vars*/
        this._applyClasses(this._container, this._options.loadedClass);
        this._applyClasses(this._container, this._options.loadingClass, true);
    };

    return LoadProgressIndicator;
});
