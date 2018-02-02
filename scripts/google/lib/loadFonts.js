define([
    'opentype'
], function(
    opentype
) {
    'use strict';
    /*globals FileReader, XMLHttpRequest, console*/

    /**
     * Callback for when a fontfile has been loaded
     *
     * @param i: index of the font loaded
     * @param fontFileName
     * @param err: null, error-object or string with error message
     * @param fontArraybuffer
     */
    function onLoadFont(i, fontFileName, err, fontArraybuffer) {
        /* jshint validthis: true */
        var font;
        if(!err) {
            try {
                font = opentype.parse(fontArraybuffer);
            }
            catch (parseError) {
                err = parseError;
            }
        }

        if(err) {
            console.warn('Can\'t load font', fontFileName, ' with error:', err);
            this.countAll--;
        }
        else {
            this.pubsub.publish('loadFont', i, fontFileName, font, fontArraybuffer);
            this.countLoaded += 1;
        }

        if(this.countLoaded === this.countAll)
            this.pubsub.publish('allFontsLoaded', this.countAll);

    }

    function loadFromUrl(fontInfo, callback) {
        var request = new XMLHttpRequest()
          , url = fontInfo.url
          ;
        request.open('get', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            if (request.status !== 200) {
                return callback('Font could not be loaded: ' + request.statusText);
            }
            return callback(null, request.response);
        };
        request.send();
    }

    function fileInputFileOnLoad(callback, loadEvent) {
        /*jshint unused: vars, validthis:true*/
        callback(null, this.result);
    }
    function fileInputFileOnError(callback, loadEvent) {
        /*jshint unused: vars, validthis:true*/
        callback(this.error);
    }
    function loadFromFileInput(file, callback) {
        var reader = new FileReader();
        reader.onload = fileInputFileOnLoad.bind(reader, callback);
        reader.onerror = fileInputFileOnError.bind(reader, callback);
        reader.readAsArrayBuffer(file);
    }

    function loadFontsFromFileInput(pubsub, fileInputFiles) {
        _loadFonts(pubsub, fileInputFiles, loadFromFileInput);
    }
    loadFontsFromFileInput.needsPubSub = true;


    function loadFontsFromUrl(pubsub, fontFiles) {
        var i, l
          , fontInfo = []
          ;
        for(i=0,l=fontFiles.length;i<l;i++) {
            if (!fontFiles[i])
                throw new Error('The url at index '+i+' appears to be invalid.');
            fontInfo.push({
                name: fontFiles[i]
                , url: fontFiles[i]
            });
        }
        _loadFonts(pubsub, fontInfo, loadFromUrl);
    }

    function _loadFonts(pubsub, fontFiles, loadFont) {
        var i, l, fontInfo, onload
          , loaderState = {
                countLoaded: 0
              , countAll: fontFiles.length
              , pubsub: pubsub
            }
          ;

        for(i=0,l=fontFiles.length;i<l;i++) {
            fontInfo = fontFiles[i];
            pubsub.publish('prepareFont', i, fontInfo.name, l);
            onload = onLoadFont.bind(loaderState, i, fontInfo.name);
            // The timeout thing is handy to slow down the load progress,
            // if development is done on that part.
            // setTimeout(function(fontInfo, onload) {
            loadFont(fontInfo, onload);
            // }.bind(null, fontInfo, onload), Math.random() * 5000);
        }
    }

    return {
        fromUrl: loadFontsFromUrl
      , fromFileInput: loadFontsFromFileInput
    };
});
