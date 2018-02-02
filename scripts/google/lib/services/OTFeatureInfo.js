define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';
    /*jshint esnext:true*/

    // feature data collected from
    // https://www.microsoft.com/typography/otspec/featuretags.htm ff.
    // Why is there no machine readable version? -- Probably because
    // everything is very vague over there.
    //
    // How to interprete this data:
    //
    // The purpose of this data is to provide a user interface for a font
    // for turning features available in the font on and off.
    // `friendlyName` used to name the feature  probably like this: "{tag} {friendlyName}"
    // `onByDefault`: Taken from "UI suggestion", can have three values:
    //                                `false`, `true`, `null`
    //              `false`: This feature is optional and must be turned on
    //                       by the user. We'll primarily focus on making these
    //                       features available
    //              `true`: This feature is on by default. Usually because
    //                      it is needed to display the font/script/language
    //                      correctly.
    //                      We could allow the user to turn these off, however
    //                      for the specimen use case this is probably overkill.
    //                      For a QA/font testing/inspection tool, this
    //                      could be more interesting!
    //                      Most prominent are examples like `kern` or `liga`
    //                      For the specimen, maybe as a hidden/expandable menu
    //                      option.
    //              `null`: These features are in one or the other way special
    //                      It's not easy to determine from the spec if they are
    //                      on or off. They are sometimes "sub-features" that
    //                      enable other user-selectable features to function
    //                      or similar. We are going to ignore these in the first
    //                      round, until good use cases emerge.
    // `slSensitivity`: array, Taken from "Script/language sensitivity" This is
    //                  basically none-data at the moment. It's here to give an
    //                  idea of the lingusitic context where th e feature is used.
    //                  An empty array usually means all scripts and languages.
    //                  This may become useful in the future, if there is an idea
    //                  how to use and represent the data properly
    //
    // For more information, look at the spec link above and consider adding
    // it here, if it can be useful, including a little description above.
    //
    // Some fetures, like `salt` are non boolean. In css we can give these
    // integer settings. For the moment, only boolean features should
    // be supported. Thus, the others should be set to onByDefault = null
    var featureData = Object.create(null);

    featureData.aalt = {
        friendlyName: 'Access All Alternates'
      , onByDefault: null
      , slSensitivity: []
    // special, not really useful for running text
    };
    featureData.abvf = {
        friendlyName: 'Above-base Forms'
      , onByDefault: true
      , slSensitivity: ['Khmer script']
    };
    featureData.abvm = {
        friendlyName: 'Above-base Mark Positioning'
      , onByDefault: true
      , slSensitivity: ['Indic scripts']
    };
    featureData.abvs = {
        friendlyName: 'Above-base Substitutions'
      , onByDefault: true
      , slSensitivity: ['Indic scripts']
    };
    featureData.afrc = {
        friendlyName: 'Alternative Fractions'
      , onByDefault: false
      , slSensitivity: []
    };
    featureData.akhn = {
        friendlyName: 'Akhands'
        // Control of the feature should not generally be exposed to the user
      , onByDefault: null
      , slSensitivity: ['Indic scripts']
    };
    featureData.blwf = {
        friendlyName: 'Below-base Forms'
        //  Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['Indic scripts']
    };
    featureData.blwm = {
        friendlyName: 'Below-base Mark Positioning'
      , onByDefault: true
      , slSensitivity: ['Indic scripts']
    };
    featureData.blws = {
        friendlyName: 'Below-base Substitutions'
      , onByDefault: true
      , slSensitivity: ['Indic scripts']
    };
    featureData.calt = {
        friendlyName: 'Contextual Alternates'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData['case'] = {
        friendlyName: 'Case-Sensitive Forms'
        // "
        // It would be good to apply this feature (or turn it off) by
        // default when the user changes case on a sequence of more than
        // one character. Applications could also detect words consisting
        // only of capitals, and apply this feature based on user preference
        // settings.
        // "
      , onByDefault: false
      , slSensitivity: ['European scripts', 'Spanish Language']
      , exampleText: '¡!(H-{E[L]L}O)'
    };
    featureData.ccmp = {
        friendlyName: 'Glyph Composition / Decomposition'
       , onByDefault: true
       , slSensitivity: []
    };
    featureData.cfar = {
        friendlyName: 'Conjunct Form After Ro'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['Khmer scripts']
    };
    featureData.cjct = {
        friendlyName: 'Conjunct Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: [' Indic scripts that show similarity to Devanagari']
    };
    featureData.clig = {
        friendlyName: 'Contextual Ligatures'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.cpct = {
        friendlyName: 'Centered CJK Punctuation'
      , onByDefault: false
      , slSensitivity: ['Chinese']
    };
    featureData.cpsp = {
        friendlyName: '	Capital Spacing'
        // This feature should be on by default.
        // Applications may want to allow the user to respecify the percentage to fit individual tastes and functions.
      , onByDefault: true
      , slSensitivity: ['Should not be used in connecting scripts (e.g. most Arabic)']
    };
    featureData.cswh = {
        friendlyName: 'Contextual Swash'
      , onByDefault: false
      , slSensitivity: []
    };
    featureData.curs = {
        friendlyName: 'Cursive Positioning'
        // This feature could be made active or inactive by default, at the user's preference.
        // (I don't know how this is handled, for Arabic I'd expect it to be
        // necessary to render the font properly if it is present. Actually
        // every font that contains this feature implies that it is needed
        // to make the font work fine ...)
      , onByDefault: null
      , slSensitivity: []
    };

    // cv01-cv99 	 Character Variants
    (function(featureData){
        var i, num, tag;
        for(i=1;i<100;i++) {
            num = ('0' + i).slice(-2);
            tag = 'cv' + num;
            featureData[tag] = {
                friendlyName: 'Character Variants ' + i
              // hmm: The Microsoft spec says these features have
              // a user-interface string: "featUiLabelNameId".
              // It would be nice to extract these  from the font if present.
              , onByDefault: false
              , slSensitivity: []
            };
        }
    })(featureData);

    featureData.c2pc = {
        friendlyName: 'Petite Capitals From Capitals'
      , onByDefault: false
      , slSensitivity: ['scripts with both upper- and lowercase forms', 'Latin', 'Cyrillic', 'Greek']
    };
    featureData.c2sc = {
        friendlyName: 'Small Capitals From Capitals'
      , onByDefault: false
      , slSensitivity: ['bicameral scripts', 'Latin', 'Greek', 'Cyrillic', 'Armenian']
      , exampleText: 'HELLO WORLD'
    };
    featureData.dist = {
        friendlyName: 'Distances'
        //  This feature could be made active or inactive by default, at the user's preference.
      , onByDefault: null
      , slSensitivity: ['Indic scripts']
    };
    featureData.dlig = {
        friendlyName: 'Discretionary Ligatures'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: 'act stand (1) (7)'
    };
    featureData.dnom = {
        friendlyName: 'Denominators'
        // This feature should normally be called by an application when the user applies the frac feature
      , onByDefault: null
      , slSensitivity: []
    };
    featureData.dtls = {
        friendlyName: 'Dotless Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['math formula layout']
    };
    featureData.expt = {
        friendlyName: 'Expert Forms'
        // UI suggestion: Applications may choose to have this feature
        // active or inactive by default, depending on their target markets.
        // (I'd expect browsers to have it off by default. But actually:
        // "depending on their target markets" is not very helpful.
        // Maybe it is on when the script is Japanese?)
      , onByDefault: null
      , slSensitivity: ['Japanese']
    };
    featureData.falt = {
        friendlyName: 'Final Glyph on Line Alternates'
        // This feature could be made active or inactive by default, at the user's preference.
      , onByDefault: null
      , slSensitivity: ['any cursive script', 'Arabic']
    };
    featureData.fin2 = {
        friendlyName: 'Terminal Forms #2'
      , onByDefault: true
      , slSensitivity: ['Syriac']
    };
    featureData.fin3 = {
        friendlyName: 'Terminal Forms #3'
      , onByDefault: true
      , slSensitivity: ['Syriac']
    };
    featureData.fina = {
        friendlyName: 'Terminal Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['script with joining behavior', 'Arabic']
    };
    featureData.flac = {
        friendlyName: 'Flattened accent forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['math formula layout']
    };
    featureData.frac = {
        friendlyName: 'Fractions'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: '1/2 1/4'
    };
    featureData.fwid = {
        friendlyName: 'Full Widths'
      , onByDefault: false
      , slSensitivity: ['scripts which can use monospaced forms']
    };
    featureData.half = {
        friendlyName: 'Half Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: [' Indic scripts that show similarity to Devanagari']
    };
    featureData.haln = {
        friendlyName: 'Halant Forms'
      , onByDefault: true
      , slSensitivity: ['Indic scripts']
    };
    featureData.halt = {
        friendlyName: 'Alternate Half Widths'
        // In general, this feature should be off by default.
      , onByDefault: false
      , slSensitivity: ['CJKV']
    };
    featureData.hist = {
        friendlyName: 'Historical Forms'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: 'basic'
    };
    featureData.hkna = {
        friendlyName: 'Horizontal Kana Alternates'
      , onByDefault: false
      , slSensitivity: ['hiragana', 'katakana']
    };
    featureData.hlig = {
        friendlyName: 'Historical Ligatures'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: 'ba\u017fic \u017fs \u017fl'
    };
    featureData.hngl = {
        // DEPRECATED in 2016
        friendlyName: 'Hangul'
      , onByDefault: false
      , slSensitivity: ['Korean']
    };
    featureData.hojo = {
        friendlyName: 'Hojo Kanji Forms (JIS X 0212-1990 Kanji Forms)'
      , onByDefault: false
      , slSensitivity: ['Kanji']
    };
    featureData.hwid = {
        friendlyName: 'Half Widths'
      , onByDefault: false
      , slSensitivity: ['CJKV']
    };
    featureData.init = {
        friendlyName: 'Initial Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['script with joining behavior', 'Arabic']
    };
    featureData.isol = {
        friendlyName: 'Isolated Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['script with joining behavior', 'Arabic']
    };
    featureData.ital = {
        friendlyName: 'Italics'
        // When a user selects text and applies an Italic style,
        // an application should check for this feature and use it if present.
      , onByDefault: null
      , slSensitivity: ['mostly Latin']
    };
    featureData.jalt = {
        friendlyName: 'Justification Alternates'
        //  This feature could be made active or inactive by default, at the user's preference.
      , onByDefault: null
      , slSensitivity: ['any cursive script']
    };
    featureData.jp78 = {
        friendlyName: 'JIS78 Forms'
      , onByDefault: false
      , slSensitivity: ['Japanese']
    };
    featureData.jp83 = {
        friendlyName: 'JIS83 Forms'
      , onByDefault: false
      , slSensitivity: ['Japanese']
    };
    featureData.jp90 = {
        friendlyName: 'JIS90 Forms'
      , onByDefault: false
      , slSensitivity: ['Japanese']
    };
    featureData.jp04 = {
        friendlyName: 'JIS2004 Forms'
      , onByDefault: false
      , slSensitivity: ['Kanji']
    };
    featureData.kern = {
        friendlyName: 'Kerning'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.lfbd = {
        friendlyName: 'Left Bounds'
        // This feature is called by an application when the user invokes the opbd feature.
      , onByDefault: null
      , slSensitivity: []
    };
    featureData.liga = {
        friendlyName: 'Standard Ligatures'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.ljmo = {
        friendlyName: 'Leading Jamo Forms'
      , onByDefault: true
      , slSensitivity: ['Hangul + Ancient Hangul']
    };
    featureData.lnum = {
        friendlyName: 'Lining Figures'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: '31337 H4X0R'
    };
    featureData.locl = {
        friendlyName: 'Localized Forms'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.ltra = {
        friendlyName: 'Left-to-right alternates'
      , onByDefault: null
      , slSensitivity: ['Left-to-right runs of text']
    };
    featureData.ltrm = {
        friendlyName: 'Left-to-right mirrored forms'
      , onByDefault: null
      , slSensitivity: ['Left-to-right runs of text']
    };
    featureData.mark = {
        friendlyName: 'Mark Positioning'
      , onByDefault: null
       , slSensitivity: []
    };
    featureData.med2 = {
        friendlyName: 'Medial Forms #2'
      , onByDefault: true
      , slSensitivity: ['Syriac']
    };
    featureData.medi = {
        friendlyName: 'Medial Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['script with joining behavior', 'Arabic']
    };
    featureData.mgrk = {
        friendlyName: 'Mathematical Greek'
      , onByDefault: false
      , slSensitivity: ['Greek script']
    };
    featureData.mkmk = {
        friendlyName: 'Mark to Mark Positioning'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.mset = {
        friendlyName: 'Mark Positioning via Substitution'
        // Positions Arabic combining marks in fonts for Windows 95 using glyph substitution
      , onByDefault: null
      , slSensitivity: ['Arabic']
    };
    featureData.nalt = {
        friendlyName: 'Alternate Annotation Forms'
      , onByDefault: false
      , slSensitivity: ['CJKV', 'European scripts']
      , exampleText: '359264'
    };
    featureData.nlck = {
        // The National Language Council (NLC) of Japan has defined new
        // glyph shapes for a number of JIS characters in 2000.
        friendlyName: 'NLC Kanji Forms'
      , onByDefault: false
      , slSensitivity: ['Kanji']
    };
    featureData.nukt = {
        friendlyName: 'Nukta Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: [' Indic scripts']
    };
    featureData.numr = {
        friendlyName: 'Numerators'
        // This feature should normally be called by an application when
        // the user applies the frac feature.
      , onByDefault: null
      , slSensitivity: []
    };
    featureData.onum = {
        friendlyName: 'Oldstyle Figures'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: '123678'
    };
    featureData.opbd = {
        friendlyName: 'Optical Bounds'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.ordn = {
        friendlyName: 'Ordinals'
      , onByDefault: false
      , slSensitivity: ['Latin']
      , exampleText: '1a 9a 2o 7o'
    };
    featureData.ornm = {
        friendlyName: 'Ornaments'
      , onByDefault: null
      , slSensitivity: []
    };
    featureData.palt = {
        friendlyName: 'Proportional Alternate Widths'
      , onByDefault: false
      , slSensitivity: ['CJKV']
    };
    featureData.pcap = {
        friendlyName: 'Petite Capitals'
      , onByDefault: false
      , slSensitivity: ['scripts with both upper- and lowercase forms', 'Latin', 'Cyrillic', 'Greek']
    };
    featureData.pkna = {
        friendlyName: 'Proportional Kana'
      , onByDefault: false
      , slSensitivity: ['Japanese']
    };
    featureData.pnum = {
        friendlyName: 'Proportional Figures'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: '123678'
    };
    featureData.pref = {
        friendlyName: 'Pre-Base Forms'
        //  Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['Khmer and Myanmar (Burmese) scripts']
    };
    featureData.pres = {
        friendlyName: 'Pre-base Substitutions'
      , onByDefault: true
      , slSensitivity: ['Indic scripts']
    };
    featureData.pstf = {
        friendlyName: 'Post-base Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['scripts of south and southeast Asia that have post-base forms for consonants', 'Gurmukhi', 'Malayalam', 'Khmer']
    };
    featureData.psts = {
        friendlyName: 'Post-base Substitutions'
      , onByDefault: true
      , slSensitivity: ['any alphabetic script', 'Indic scripts']
    };
    featureData.pwid = {
        friendlyName: 'Proportional Widths'
        // Applications may want to have this feature active or inactive by default depending on their markets.
      , onByDefault: null
      , slSensitivity: ['CJKV', 'European scripts']
    };
    featureData.qwid = {
        friendlyName: 'Quarter Widths'
      , onByDefault: false
      , slSensitivity: ['CJKV']
    };
    featureData.rand = {
        friendlyName: 'Randomize'
        // This feature should be enabled/disabled via a preference setting; “enabled” is the recommended default.
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.rclt = {
        friendlyName: 'Required Contextual Alternates'
      , onByDefault: true
      , slSensitivity: ['any script', 'important for many styles of Arabic']
    };
    featureData.rkrf = {
        friendlyName: 'Rakar Forms'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['Devanagari', 'Gujarati']
    };
    featureData.rlig = {
        friendlyName: 'Required Ligatures'
      , onByDefault: true
      , slSensitivity: ['Arabic', 'Syriac', 'May apply to some other scripts']
    };
    featureData.rphf = {
        friendlyName: 'Reph Forms'
        //  Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['Indic scripts', 'Devanagari', 'Kannada']
    };
    featureData.rtbd = {
        friendlyName: 'Right Bounds'
        // This feature is called by an application when the user invokes the opbd feature.
      , onByDefault: null
      , slSensitivity: []
    };
    featureData.rtla = {
        friendlyName: 'Right-to-left alternates'
      , onByDefault: null
      , slSensitivity: ['Right-to-left runs of text']
    };
    featureData.rtlm = {
        friendlyName: 'Right-to-left mirrored forms'
      , onByDefault: null
      , slSensitivity: ['Right-to-left runs of text']
    };
    featureData.ruby = {
        friendlyName: 'Ruby Notation Forms'
      , onByDefault: false
      , slSensitivity: ['Japanese']
    };
    featureData.rvrn = {
        friendlyName: 'Required Variation Alternates'
        // The 'rvrn' feature is mandatory: it should be active by default and not directly exposed to user control.
      , onByDefault: null
      , slSensitivity: []
    };
    featureData.salt = {
        friendlyName: 'Stylistic Alternates'
      , onByDefault: null
      , slSensitivity: []
    };
    featureData.sinf = {
        friendlyName: 'Scientific Inferiors'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: '1902835746'
    };
    featureData.size = {
        friendlyName: 'Optical size'
        // This feature should be active by default. Applications may want
        // to present the tracking curve to the user for adjustments via a GUI
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.smcp = {
        friendlyName: 'Small Capitals'
      , onByDefault: false
      , slSensitivity: [' bicameral scripts', 'Latin', 'Greek', 'Cyrillic', 'Armenian']
      , exampleText: 'Hello World'
    };
    featureData.smpl = {
        friendlyName: 'Simplified Forms'
      , onByDefault: false
      , slSensitivity: ['Chinese', 'Japanese']
    };
    // ss01-ss20 Stylistic Sets
    (function(featureData) {
        var i, num, tag;
        for(i=1;i<21;i++) {
            num = ('0' + i).slice(-2);
            tag = 'ss' + num;
            featureData[tag] = {
                // It seems these features can reference a custom name
                // in the name table
                friendlyName: 'Stylistic Set ' + i
              , onByDefault: false
              , slSensitivity: []
            };
        }
    })(featureData);
    featureData.ssty = {
        friendlyName: 'Math script style alternates'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['math formula layout']
    };
    featureData.stch = {
        friendlyName: 'Stretching Glyph Decomposition'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.subs = {
        friendlyName: 'Subscript'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: 'a1 b4 c9'
    };
    featureData.sups = {
        friendlyName: 'Superscript'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: 'x2 y5 z7'
    };
    featureData.swsh = {
        friendlyName: 'Swash'
      , onByDefault: false
      , slSensitivity: ['Does not apply to ideographic scripts']
    };
    featureData.titl = {
        friendlyName: 'Titling'
      , onByDefault: false
      , slSensitivity: []
    };
    featureData.tjmo = {
        friendlyName: 'Trailing Jamo Forms'
      , onByDefault: true
      , slSensitivity: ['Hangul + Ancient Hangul']
    };
    featureData.tnam = {
        friendlyName: 'Traditional Name Forms'
      , onByDefault: false
      , slSensitivity: ['Japanese']
    };
    featureData.tnum = {
        friendlyName: 'Tabular Figures'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: '123678'
    };
    featureData.trad = {
        friendlyName: 'Traditional Forms'
      , onByDefault: false
      , slSensitivity: ['Chinese', 'Japanese']
    };
    featureData.twid = {
        friendlyName: 'Third Widths'
      , onByDefault: false
      , slSensitivity: ['CJKV']
    };
    featureData.unic = {
        friendlyName: 'Unicase'
      , onByDefault: false
      , slSensitivity: ['scripts with both upper- and lowercase forms', 'Latin', 'Cyrillic', 'Greek']
    };
    featureData.valt = {
        friendlyName: 'Alternate Vertical Metrics'
        // This feature should be active by default in vertical-setting contexts.
      , onByDefault: null
      , slSensitivity: ['scripts with vertical writing modes']
    };
    featureData.vatu = {
        friendlyName: 'Vattu Variants'
        // Control of the feature should not generally be exposed to the user.
      , onByDefault: null
      , slSensitivity: ['Indic scripts', 'Devanagari']
    };
    featureData.vert = {
        friendlyName: 'Vertical Writing'
        // This feature should be active by default in vertical writing mode.
      , onByDefault: null
      , slSensitivity: ['scripts with vertical writing capability.']
    };
    featureData.vhal = {
        friendlyName: 'Alternate Vertical Half Metrics'
      , onByDefault: false
      , slSensitivity: ['CJKV']
    };
    featureData.vjmo = {
        friendlyName: 'Vowel Jamo Forms'
      , onByDefault: true
      , slSensitivity: ['Hangul + Ancient Hangul']
    };
    featureData.vkna = {
        friendlyName: 'Vertical Kana Alternates'
      , onByDefault: false
      , slSensitivity: ['hiragana', 'katakana']
    };
    featureData.vkrn = {
        friendlyName: 'Vertical Kerning'
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.vpal = {
        friendlyName: 'Proportional Alternate Vertical Metrics'
      , onByDefault: false
      , slSensitivity: ['CJKV']
    };
    featureData.vrt2 = {
        friendlyName: 'Vertical Alternates and Rotation'
        // This feature should be active by default when vertical writing mode is on,
        // although the user must be able to override it.
        // (don't know if I can determine if "vertical writing mode").
      , onByDefault: true
      , slSensitivity: ['scripts with vertical writing capability']
    };
    featureData.vrtr = {
        friendlyName: 'Vertical Alternates for Rotation'
        // This feature should always be active by default for sideways runs in vertical writing mode
      , onByDefault: true
      , slSensitivity: []
    };
    featureData.zero = {
        friendlyName: 'Slashed Zero'
      , onByDefault: false
      , slSensitivity: []
      , exampleText: '0123'
    };

    function deepFreeze(obj) {
        var k;
        if(typeof obj !== 'object') return;
        for(k in obj)
            deepFreeze(obj[k]);
        Object.freeze(obj);
    }

    // Don't want returned sub objects to be changeable by a client:
    deepFreeze(featureData);

    function OTFeatureInfo(pubsub, options) {
        Parent.call(this, options);
        this._pubsub = pubsub;
        this._caches = {
            optional: null
          , default: null
          , unknown: null
          , all: null
        };
    }

    var _p = OTFeatureInfo.prototype = Object.create(Parent.prototype);
    _p.constructor = OTFeatureInfo;

    OTFeatureInfo.defaultOptions = {};

    function _makeGetter(target, key, filter) {
        function getter() {
            /* jshint validthis: true*/
            var data = this._caches[key]
              , tag
              ;
            if(data === null) {
                this._caches[key] = data = Object.create(null);
                for(tag in featureData) {
                    if(filter && !filter(featureData[tag]))
                        continue;
                    data[tag] = featureData[tag];
                }
                Object.freeze(data);
            }
            return data;
        }
        Object.defineProperty(target, key, {
            get: getter
          , enumerable: true
        });
    }

    _makeGetter(_p, 'optional', function(item) {
                        return item.onByDefault === false;});

    _makeGetter(_p, 'default', function(item) {
                        return item.onByDefault === true;});

    _makeGetter(_p, 'unknown', function(item) {
                        return item.onByDefault === null;});

    _makeGetter(_p, 'all', false);

    _p.getSubset = function(key, tags) {
        var data = this[key]
          , result = Object.create(null)
          , i, l, tag
          ;
        for(i=0,l=tags.length;i<l;i++) {
            tag = tags[i];
            if(tag in data)
                result[tag] = data[tag];
        }
        return result;
    };

    _p.getFeature = function(tag) {
        return featureData[tag];
    }

    // singleton style (good idea??)
    return new OTFeatureInfo();
});
