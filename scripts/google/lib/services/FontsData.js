define([
    'specimenTools/_BaseWidget'
  , '!require/text!specimenTools/services/languageCharSets.json'
], function(
    Parent
  , languageCharSetsJson
) {
    'use strict';
    /*jshint esnext:true*/

    var weight2weightName = {
            250: 'Thin'
          , 275: 'ExtraLight'
          , 300: 'Light'
          , 400: 'Regular'
          , 500: 'Medium'
          , 600: 'SemiBold'
          , 700: 'Bold'
          , 800: 'ExtraBold'
          , 900: 'Black'
          // bad values (found first in WorkSans)
          , 260: 'Thin'
          , 280: 'ExtraLight'
        }
      , weight2cssWeight = {
            250: '100'
          , 275: '200'
          , 300: '300'
          , 400: '400'
          , 500: '500'
          , 600: '600'
          , 700: '700'
          , 800: '800'
          , 900: '900'
          // bad values (found first in WorkSans)
          , 260: '100'
          , 280: '200'
        }
      ;

    function FontsData(pubsub, options) {
        Parent.call(this, options);
        this._pubSub = pubsub;
        this._pubSub.subscribe('loadFont', this._onLoadFont.bind(this));
        this._data = [];
        Object.defineProperty(this._data, 'globalCache', {
            value: Object.create(null)
        });
    }

    var _p = FontsData.prototype = Object.create(Parent.prototype);
    _p.constructor = FontsData;

    FontsData.defaultOptions = {
        // This should be set explicitly to true (or a string containing
        // glyphs that are allowed to miss despite of being required in
        // languageCharSetsJson.
        // The builtin FontsData.DEFAULT_LAX_CHAR_LIST is there for
        // convenience but may cause trouble!
        useLaxDetection: false
    };

    FontsData._cacheDecorator = function (k) {
        return function(fontIndex) {
            /*jshint validthis:true*/
            var args = [], i, l, data, cached;

            for(i=0,l=arguments.length;i<l;i++)
                args[i] = arguments[i];

            data = this._aquireFontData(fontIndex);
            if(!(k in data.cache))
                cached = data.cache[k] = this[k].apply(this, args);
            else
                cached = data.cache[k];
            return cached;
        };
    };

    FontsData._installPublicCachedInterface = function(_p) {
        var k, newk;
        for(k in _p) {
            newk = k.slice(1);
            if(k.indexOf('_get') !== 0
                        || typeof _p[k] !== 'function'
                        // don't override if it is defined
                        || newk in _p)
                continue;
            _p[newk] = FontsData._cacheDecorator(k);
        }
    };

    FontsData._getFeatures = function _getFeatures(features, langSys, featureIndexes) {
        /*jshint validthis:true*/
        var i,l, idx, tag;
        for(i=0,l=featureIndexes.length;i<l;i++) {
            idx = featureIndexes[i];
            tag = features[idx].tag;
            if(!this[tag])
                this[tag] = [];
            this[tag].push(langSys);
        }
    };

    FontsData.getFeatures = function getFeatures(font) {
        // get all gsub features:
        var features = {/*tag: ["{script:lang}", {script:lang}]*/}
          ,  table, scripts, i, l, j, m, script, scriptTag, lang
          ;
        if(!('gsub' in font.tables) || !font.tables.gsub.scripts)
            return features;
        table = font.tables.gsub;
        scripts = font.tables.gsub.scripts;
        for(i=0,l=scripts.length;i<l;i++) {
            script = scripts[i].script;
            scriptTag = scripts[i].tag;
            if(script.defaultLangSys) {
                lang = 'Default';
                FontsData._getFeatures.call(features
                  , table.features
                  , [scriptTag, lang].join(':')
                  , script.defaultLangSys.featureIndexes
                );
            }
            if(script.langSysRecords) {
                for(j = 0, m = script.langSysRecords.length; j < m; j++) {
                    lang = script.langSysRecords[j].tag;
                    FontsData._getFeatures.call(features
                      , table.features
                      , [scriptTag, lang].join(':')
                      , script.langSysRecords[j].langSys.featureIndexes
                    );
                }
            }
            return features;
        }
        // when supported by opentype.js, get all gpos features:
    };

    FontsData.languageCharSets = JSON.parse(languageCharSetsJson);

    FontsData.sortCoverage = function sortCoverage(a, b) {
        if(a[1] === b[1])
            // compare the names of the languages, to sort alphabetical;
            return a[0].localeCompare(b[0]);
        return b[1] - a[1] ;
    };

    // These are characters that appear in the CLDR data as needed for
    // some languages, but we decided that they are not exactly needed
    // for language support.
    // These are all punctuation characters currently.
    // Don't just trust this list, and if something is terribly wrong
    // for your language, please complain!
    FontsData.DEFAULT_LAX_CHAR_LIST = new Set([
        0x2010 // HYPHEN -> we usually use/include HYPHEN-MINUS: 0x002D
      , 0x2032 // PRIME
      , 0x2033 // DOUBLE PRIME
      , 0x27e8 // MATHEMATICAL LEFT ANGLE BRACKET
      , 0x27e9 // MATHEMATICAL RIGHT ANGLE BRACKET
      , 0x2052 // COMMERCIAL MINUS SIGN
    ]);

    FontsData.getLanguageCoverage = function getLanguageCoverage(font, useLaxDetection) {
        var result = []
          , included, missing, laxSkipped
          , language, chars, charCode, found, i, l, total
          , laxCharList
          ;

        if(typeof useLaxDetection === 'string') {
            laxCharList = new Set();
            for(i=0,l=useLaxDetection.length;i<l;i++)
                laxCharList.add(useLaxDetection.codePointAt(i));
        }
        else
            laxCharList = FontsData.DEFAULT_LAX_CHAR_LIST;

        for(language in FontsData.languageCharSets) {
            // chars is a string
            chars = FontsData.languageCharSets[language];
            found = 0;
            total = l = chars.length;
            included = [];
            missing = [];
            laxSkipped = [];
            for(i=0;i<l;i++) {
                charCode = chars.codePointAt(i);
                if(charCode in font.encoding.cmap.glyphIndexMap) {
                    found += 1;
                    included.push(charCode);
                }
                else if(useLaxDetection && laxCharList.has(charCode)) {
                    total = total-1;
                    laxSkipped.push(charCode);
                }
                else
                    missing.push(charCode);
            }
            result.push([language, found/total, found, total, missing, included, laxSkipped]);
        }

        result.sort(FontsData.sortCoverage);
        return result;
    };

    _p._aquireFontData = function(fontIndex) {
        var data = this._data[fontIndex];
        if(!data)
            throw new Error('FontIndex "'+fontIndex+'" is not available.');
        return data;
    };

    _p._onLoadFont = function(fontIndex, fontFileName, font, originalArraybuffer) {
        this._data[fontIndex] = {
            font: font
          , fileName: fontFileName
          , originalArraybuffer: originalArraybuffer
          , cache: Object.create(null)
        };
    };

    _p._getLanguageCoverage = function(fontIndex) {
        return FontsData.getLanguageCoverage(this._data[fontIndex].font, this._options.useLaxDetection);
    };

    _p._getLanguageCoverageStrict = function(fontIndex) {
        return FontsData.getLanguageCoverage(this._data[fontIndex].font, false);
    };

    _p._getLanguageCoverageLax = function(fontIndex) {
        return FontsData.getLanguageCoverage(this._data[fontIndex].font, true);
    };

    _p._getSupportedLanguages = function(fontIndex) {
        var coverage = this.getLanguageCoverage(fontIndex)
          , i, l
          , result = [], language, support
          ;
        for(i=0,l=coverage.length;i<l;i++) {
            language = coverage[i][0];
            support = coverage[i][1];
            if(support === 1)
                result.push(language);
        }
        result.sort();
        return result;
    };

    _p._getNumberGlyphs = function(fontIndex) {
        return this._data[fontIndex].font.glyphNames.names.length;
    };

    _p._getFeatures = function(fontIndex) {
        return FontsData.getFeatures(this._data[fontIndex].font);
    };

    _p._getFamilyName  = function(fontIndex) {
        var font = this._data[fontIndex].font
          , fontFamily
          ;

        fontFamily = font.names.postScriptName.en
                        || Object.values(font.names.postScriptName)[0]
                        || font.names.fontFamily
                        ;
        fontFamily = fontFamily.split('-')[0];
        
        if (typeof this._options.overwrites === 'object' && typeof this._options.overwrites[fontFamily] === 'string') {
                fontFamily = this._options.overwrites[fontFamily]
        }

        return fontFamily
    };

    _p._getOS2FontWeight = function(fontIndex) {
        var font = this._data[fontIndex].font;
        return font.tables.os2.usWeightClass;
    };

    // Keeping this, maybe we'll have to transform this name further for CSS?
    _p._getCSSFamilyName = _p._getFamilyName;

    _p._getIsItalic = function(fontIndex) {
        var font = this._data[fontIndex].font
          , italicFromOS2 = !!(font.tables.os2.fsSelection & font.fsSelectionValues.ITALIC)
          , subFamily = this.getSubfamilyName(fontIndex).toLowerCase()
          , italicFromName = subFamily.indexOf('italic') !== -1
          ;
        return italicFromOS2 || italicFromName;
    };

    _p.getFamiliesData = function() {
        var cacheKey = 'getFamiliesData';
        if(cacheKey in this._data.globalCache)
            return this._data.globalCache[cacheKey];

        var families = Object.create(null)
          , weightDict, styleDict
          , fontFamily, fontWeight, fontStyle
          , fontIndex, l
          , result
          ;
        for(fontIndex=0,l=this._data.length;fontIndex<l;fontIndex++) {
            fontFamily  = this.getFamilyName(fontIndex);
            fontWeight = this.getCSSWeight(fontIndex);
            fontStyle = this.getCSSStyle(fontIndex);

            weightDict = families[fontFamily];
            if(!weightDict)
                families[fontFamily] = weightDict = Object.create(null);

            styleDict = weightDict[fontWeight];
            if(!styleDict)
                weightDict[fontWeight] = styleDict = Object.create(null);

            if(fontStyle in styleDict) {
                console.warn('A font with weight ' + fontWeight
                                + ' and style "'+fontStyle+'"'
                                + ' has already appeared for '
                                +'"' +fontFamily+'".\nFirst was the file: '
                                + styleDict[fontStyle] + ' '
                                + this.getFileName(styleDict[fontStyle])
                                + '.\nNow the file: ' + fontIndex + ' '
                                +  this.getFileName(fontIndex)
                                + ' is in conflict.\nThis may hint to a bad '
                                + 'OS/2 table entry.\nSkipping.'
                                );
                continue;
            }
            // assert(fontStyle not in weightDict)
            styleDict[fontStyle] = fontIndex;
        }

        result =  Object.keys(families).sort()
              .map(function(key){ return [key, this[key]];}, families);
        this._data.globalCache[cacheKey] = result;
        return result;
    };

    // no need to cache these: No underscore will prevent
    //_installPublicCachedInterface from doing anything.
    _p.getNumberSupportedLanguages = function(fontIndex) {
        return this.getSupportedLanguages(fontIndex).length;
    };

    _p.getFont = function(fontIndex) {
        return this._aquireFontData(fontIndex).font;
    };

    _p.getFileName = function(fontIndex) {
        return this._aquireFontData(fontIndex).fileName;
    };

    _p.getOriginalArraybuffer = function(fontIndex) {
        return this._aquireFontData(fontIndex).originalArraybuffer;
    };

    _p.getCSSWeight = function(fontIndex) {
        return weight2cssWeight[this.getOS2FontWeight(fontIndex)];
    };

    _p.getWeightName = function(fontIndex) {
        return weight2weightName[this.getOS2FontWeight(fontIndex)];
    };

    _p.getCSSStyle = function(fontIndex) {
        return this.getIsItalic(fontIndex) ? 'italic' : 'normal';
    };

    _p.getStyleName = function(fontIndex) {
        return this.getWeightName(fontIndex) + (this.getIsItalic(fontIndex) ? ' Italic' : '');
    };

    _p.getPostScriptName = function(fontIndex) {
        return this._aquireFontData(fontIndex).font.names.postScriptName;
    };

    _p.getSubfamilyName = function(fontIndex) {
        var font = this._data[fontIndex].font
          , fontFamily, subFamily
          ;

        fontFamily = font.names.postScriptName.en
                        || Object.values(font.names.postScriptName)[0]
                        || font.names.fontFamily
                        ;

        // delete all before and incuded the first "-", don't use PS subfamily string
        // but extract from full PS name;
        // also use the entrie name if no "-" was found
        if (fontFamily.indexOf('-') > -1) {
            subFamily = fontFamily.substring(fontFamily.indexOf('-') + 1);
        } else {
            subFamily = fontFamily;
        }
        return subFamily;
    }

    _p.getGlyphByName = function(fontIndex, name) {
        var font = this._aquireFontData(fontIndex).font
          , glyphIndex = font.glyphNames.nameToGlyphIndex(name)
          , glyph = font.glyphs.get(glyphIndex)
          ;
        return glyph;
    };

    _p.getFontValue = function(fontIndex, name /* like: "xHeight" */) {
        var font = this._aquireFontData(fontIndex).font;
        switch(name){
            case('xHeight'):
                return font.tables.os2.sxHeight;
            case('capHeight'):
                 return font.tables.os2.sCapHeight;
            case('ascender'):
            /*falls through*/
            case('descender'):
                return font[name];
            default:
                console.warn('getFontValue: don\'t know how to get "'+ name +'".');
        }
    };

    function familiesDataReducer(all, item) {
        var i, l, weightDict, weights, styles, result = [];
        weightDict = item[1];
        weights = Object.keys(weightDict).sort();
        for(i=0,l=weights.length;i<l;i++) {
            styles = weightDict[weights[i]];
            if('normal' in styles)
                result.push(styles.normal);
            if('italic' in styles)
                result.push(styles.italic);
        }
        return all.concat(result);
    }

    _p.getFontIndexesInFamilyOrder = function(){
        var familiesData = this.getFamiliesData();
        return familiesData.reduce(familiesDataReducer, []);
    };

    _p.getFontIndexes = function() {
        var fontIndex, l, result = [];
        for(fontIndex=0,l=this._data.length;fontIndex<l;fontIndex++)
            result.push(fontIndex);
        return result;
    };

    FontsData._installPublicCachedInterface(_p);
    return FontsData;
});
