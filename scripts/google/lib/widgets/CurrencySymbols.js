define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';
    /*jshint esnext:true*/

    /**
     * Fill container with sample texts that display all currency
     * symbols available in the font.
     *
     * The sample texts for each currency are taken from
     *      1. 2he dictionary `options.symbolTexts` if `(int) charcode` is
     *         a key in it.
     *      2. The 3rd item in the symbols entry in the `options.symbols`
     *         array, if present (should be authored by upstream to ptovide
     *         reasonable defaults).
     *      3. `options.fallbackSymbolText`
     *
     * In a sample text, the "$" char will be replaced by the element containing
     * the symbol.
     *
     * Each symbol sample will be in a span with the class `sampleClass`.
     * Within a sample element spans with `symbolClass` will contain the
     * symbol character and spans with `textClass` will contain the
     * rest of the sample text.
     */
    function CurrencySymbols(container, pubSub, fontData, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontsData = fontData;
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));
    }

    var _p = CurrencySymbols.prototype = Object.create(Parent.prototype);
    _p.constructor = CurrencySymbols;

    CurrencySymbols.defaultOptions = {
        symbols: [
                    [0x0024, 'DOLLAR SIGN', '$18.9']
                  , [0x00A2, 'CENT SIGN', '$99']
                  , [0x00A3, 'POUND SIGN' , '$68']
                  , [0x00A4, 'CURRENCY SIGN', '1$']
                  , [0x00A5, 'YEN SIGN', '$998,000.15']
                  , [0x058F, 'ARMENIAN DRAM SIGN']
                  , [0x060B, 'AFGHANI SIGN']
                  , [0x09F2, 'BENGALI RUPEE MARK']
                  , [0x09F3, 'BENGALI RUPEE SIGN']
                  , [0x09FB, 'BENGALI GANDA MARK']
                  , [0x0AF1, 'GUJARATI RUPEE SIGN']
                  , [0x0BF9, 'TAMIL RUPEE SIGN']
                  , [0x0E3F, 'THAI CURRENCY SYMBOL BAHT']
                  , [0x17DB, 'KHMER CURRENCY SYMBOL RIEL']
                  , [0x20A0, 'EURO-CURRENCY SIGN']
                  , [0x20A1, 'COLON SIGN']
                  , [0x20A2, 'CRUZEIRO SIGN']
                  , [0x20A3, 'FRENCH FRANC SIGN']
                  , [0x20A4, 'LIRA SIGN']
                  , [0x20A5, 'MILL SIGN']
                  , [0x20A6, 'NAIRA SIGN']
                  , [0x20A7, 'PESETA SIGN']
                  , [0x20A8, 'RUPEE SIGN']
                  , [0x20A9, 'WON SIGN']
                  , [0x20AA, 'NEW SHEQEL SIGN']
                  , [0x20AB, 'DONG SIGN']
                  , [0x20AC, 'EURO SIGN', '$75']
                  , [0x20AD, 'KIP SIGN']
                  , [0x20AE, 'TUGRIK SIGN']
                  , [0x20AF, 'DRACHMA SIGN']
                  , [0x20B0, 'GERMAN PENNY SIGN']
                  , [0x20B1, 'PESO SIGN']
                  , [0x20B2, 'GUARANI SIGN']
                  , [0x20B3, 'AUSTRAL SIGN']
                  , [0x20B4, 'HRYVNIA SIGN']
                  , [0x20B5, 'CEDI SIGN']
                  , [0x20B6, 'LIVRE TOURNOIS SIGN']
                  , [0x20B7, 'SPESMILO SIGN']
                  , [0x20B8, 'TENGE SIGN']
                  , [0x20B9, 'INDIAN RUPEE SIGN']
                  , [0x20BA, 'TURKISH LIRA SIGN']
                  , [0x20BB, 'NORDIC MARK SIGN']
                  , [0x20BC, 'MANAT SIGN']
                  , [0x20BD, 'RUBLE SIGN']
                  , [0x20BE, 'LARI SIGN']
                  , [0xA838, 'NORTH INDIC RUPEE MARK']
                  , [0xFDFC, 'RIAL SIGN']
                  , [0xFE69, 'SMALL DOLLAR SIGN']
                  , [0xFF04, 'FULLWIDTH DOLLAR SIGN']
                  , [0xFFE0, 'FULLWIDTH CENT SIGN']
                  , [0xFFE1, 'FULLWIDTH POUND SIGN']
                  , [0xFFE5, 'FULLWIDTH YEN SIGN']
                  , [0xFFE6, 'FULLWIDTH WON SIGN']
                    // not in the currency symbol
                    // LATIN SMALL LETTER F WITH HOOK
                    // alternative name is FLORIN SIGN
                  , [0x00192, 'FLORIN SIGN', '$32']
        ]
      , symbolTexts: {}
      , sampleClass: 'currency-symbols__sample'
      , symbolClass: 'currency-symbols__sample-symbol'
      , textClass: 'currency-symbols__sample-text'
      , fallbackSymbolText: '$13.99'
    };

    _p._makeSample = function(charcode, char, options) {
        var name = options[1]
          , sample = this._container.ownerDocument.createElement('span')
          , sampleText = charcode in this._options.symbolTexts
                    ?  this._options.symbolTexts[charcode]
                    : (options[2] || this._options.fallbackSymbolText)
          , i, l, last, text, symbol
          ;
        sampleText = sampleText.split('$');
        sample.setAttribute('title', [name, ' (u', charcode.toString('16')
                                                        , ')'].join(''));
        this._applyClasses(sample, this._options.sampleClass);

        l=sampleText.length;
        last = l-1;
        for(i=0;i<l;i++) {
            if(sampleText[i] !== '') {
                // if it were an empty string, it would be a placeholder
                // for the symbol at the beginning or end of the string
                // or for multiple occurrences next to each other in the
                // middle.
                text = this._container.ownerDocument.createElement('span');
                text.textContent = sampleText[i];
                this._applyClasses(text, this._options.textClass);
                sample.appendChild(text);
            }

            if(i >= last)
                continue;
            // Put a symbol between all text pieces.
            symbol = this._container.ownerDocument.createElement('span');
            symbol.textContent = char;
            this._applyClasses(symbol, this._options.symbolClass);
            sample.appendChild(symbol);
        }
        return sample;
    };

    _p._onActivateFont = function(fontIndex) {
        var i, l, options, charcode, char, sample
          , font = this._fontsData.getFont(fontIndex)
          ;
        // empty this._container
        while(this._container.childNodes.length)
            this._container.removeChild(this._container.lastChild);

        for(i=0,l=this._options.symbols.length;i<l;i++) {
            options = this._options.symbols[i];
            charcode = options[0];
            char = String.fromCodePoint(charcode);

            if(!font.charToGlyphIndex(char))// 0 or null
                // the symbol is not in the font
                continue;

            sample = this._makeSample(charcode, char, options);
            this._container.appendChild(sample);
            this._container.appendChild(
                        this._container.ownerDocument.createTextNode(' '));
        }
    };

    return CurrencySymbols;
});
