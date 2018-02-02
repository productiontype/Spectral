define([
    'specimenTools/loadFonts'
  , 'specimenTools/initDocumentWidgets'
  , 'specimenTools/services/PubSub'
  , 'specimenTools/services/FontsData'
  , '!require/text!specimenTools/services/languageCharSets.json'
  , '!require/text!specimenTools/services/googleFontsCharSets.json'
  , 'specimenTools/services/WebfontProvider'
  , 'specimenTools/widgets/GlyphTables'
  , 'specimenTools/widgets/FamilyChooser'
  , 'specimenTools/widgets/GenericFontData'
  , 'specimenTools/widgets/CurrentWebFont'
  , 'specimenTools/widgets/TypeTester'
  , 'specimenTools/widgets/FeatureDisplay'
  , 'specimenTools/widgets/FilesDrop'
  , 'specimenTools/widgets/LoadProgressIndicator'
  , 'specimenTools/widgets/PerFont'
  , 'specimenTools/widgets/Diagram'
  , 'specimenTools/widgets/CurrencySymbols'
  , 'specimenTools/widgets/FontLister'
  , 'specimenTools/widgets/DragScroll'
  , 'specimenTools/widgets/CharSetInfo'
], function(
    loadFonts
  , initDocumentWidgets
  , PubSub
  , FontsData
  , languageCharSetsJson
  , googleFontsCharSetsJson
  , WebFontProvider
  , GlyphTables
  , FamilyChooser
  , GenericFontData
  , CurrentWebFont
  , TypeTester
  , FeatureDisplay
  , FilesDrop
  , LoadProgressIndicator
  , PerFont
  , Diagram
  , CurrencySymbols
  , FontLister
  , DragScroll
  , CharSetInfo
) {
    'use strict';
    /*globals window */
    function main() {
        var fontSpecimenConfig = window.fontSpecimenConfig
          , componentHandler = window.componentHandler
          // TODO: assert fontSpecimenConfig and componentHandler are there
          , options = {
                glyphTables: {
                    glyphTable: {
                        glyphClass: 'mdlfs-glyph-table__glyph'
                      , glyphActiveClass: 'mdlfs-glyph-table__glyph_active'
                    }
                }
              , familyChooser: {
                    italicSwitchContainerClasses: ['mdl-switch', 'mdl-js-switch', 'mdl-js-ripple-effect', 'mdlfs-family-switcher__italic-switch']
                  , italicSwitchCheckboxClasses: ['mdl-switch__input']
                  , italicSwitchLabelClasses: ['mdl-switch__label']
                  , setItalicSwitch: function setItalicSwitch(italicSwitch, enabled, checked) {
                        var fallback;
                        if(!italicSwitch.container.MaterialSwitch) {
                            fallback = this.constructor.defaultOptions.setItalicSwitch;
                            fallback.call(this, italicSwitch, enabled, checked);
                            return;
                        }
                        italicSwitch.container.MaterialSwitch[enabled ? 'enable' : 'disable']();
                        italicSwitch.container.MaterialSwitch[checked ? 'on' : 'off']();
                    }
                  , weightButtonClasses: 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdlfs-family-switcher__button'
                  , weightButtonActiveClass: 'mdl-button--colored'
                }
              , typeTester: {
                      slider_default_min: 10
                    , slider_default_max: 128
                    , slider_default_value: 32
                    , slider_default_step: 1
                    , slider_default_unit: 'px'
                    , slider_default_class: 'mdl-slider mdl-js-slider'
                    , sliderControlsClass: 'mdlfs-type-tester__slider'
                    , labelControlsClass: 'mdlfs-type-tester__label'
                    , optionalFeaturesControlsClass: 'mdlfs-type-tester__features--optional'
                    , defaultFeaturesControlsClass: 'mdlfs-type-tester__features--default'
                    , contentContainerClass: 'mdlfs-type-tester__content'
                    , setCssValueToInput: function(input, value) {
                            if('MaterialSlider' in input)
                                input.MaterialSlider.change(value);
                            else
                                input.value = value;
                      }
                     , optionalFeatureButtonClasses:  'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdlfs-type-tester__feature-button'
                     , defaultFeatureButtonClasses: 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdlfs-type-tester__feature-button'
                     , featureButtonActiveClass: 'mdl-button--colored'
                     , activateFeatureControls: function(elements) {
                        componentHandler.upgradeElements(elements);
                    }

                }
              , fontData: {}
              , featureDisplay: {
                    itemTagClassPrefix: 'mdlfs-feature-display__item-tag_'
                  , bluePrintNodeClass: 'mdlfs-feature-display__item-blueprint'
                  , itemBeforeClass: 'mdlfs-feature-display__item__before'
                  , itemChangeIndicatorClass: 'mdlfs-feature-display__item__change-indicator'
                  , itemContentContainerClass: 'mdlfs-feature-display__item-content-container'
                   // used to be: itemAfterClass: 'mdlfs-feature-display__item__after'
                  , itemAppliedClass: 'mdlfs-feature-display__item__applied'
                  , itemTagNameClass: 'mdlfs-feature-display__item__tag-name'
                  , itemFriendlyNameClass: 'mdlfs-feature-display__item__friendly-name'
                  , highlightClasses: 'mdlfs-feature-display__item_highlight'
                  , tabularClasses: 'mdlfs-feature-display__item_tabular'
                  , itemContentTextClass: 'mdlfs-feature-display__item__content-text'
                  , itemContentStackedClass: 'mdlfs-feature-display__item__content-stacked'
                  , itemContentStackedElementClassPrefix: 'mdlfs-feature-display__content-stacked__'
                    // an array or null
                  , feaureItemsSetup: [
                        {
                            friendlyName: 'Stylistic Alternates'
                          , weight: '-10'
                          , removeClasses: ['mdl-cell--4-col', 'mdl-cell--order-3', 'mdl-cell--4-col-tablet']
                          , addClasses: ['mdl-cell--6-col', 'mdl-cell--order-1', 'mdl-cell--12-col-tablet']
                          , contents: [
                                {
                                    type: 'stacked'
                                  , features: ['ss01', 'ss02', 'ss03', 'ss04']
                                  , content: ['G', 'g', 'R'
                                              , 'outline! l:l.ss02, align:left'
                                              // This is not very well fit for the widget I think.
                                              // , 'outline! IJ:IJ.ss05, align:left'
                                              ]
                                  , behavior: 'mixed'
                                }
                            ]
                        }
                      , {
                            weight: '-9.99'
                          , contents: [
                                {
                                    type: 'text'
                                  , features: 'smcp'
                                  , content: 'F*ashion* W*eek*'
                                }
                            ]
                        }
                      , {
                            weight: '-9.98'
                          , contents: [
                                {
                                  type: 'text'
                                , features: 'tnum'
                                , behavior: 'tabular'
                                , content: '35.92604187'
                                }
                            ]
                        }
                      , {
                            weight: '-9.97'
                          , contents: [
                                {
                                  type: 'text'
                                , features: 'swsh'
                                , content: '*A*f*t*e*r* *M*us*ty*'
                                }
                            ]
                        }
                      , {
                            weight: '-9.96'
                          , contents: [
                                {
                                  type: 'text'
                                , features: 'pnum'
                                , content: '35.92604187'
                                }
                            ]
                        }
                      , {
                            weight: '-9.96'
                          , addClasses: 'mdlfs-feature-display__item__content_inline'
                          , contents: [
                                {
                                  type: 'text'
                                , features: 'titl'
                                , behavior: 'show-before'
                                , content: '*Ä*'
                                }
                              , {
                                  type: 'text'
                                , features: 'titl'
                                , behavior: 'show-before'
                                , content: '*Ö*'
                                }
                              , {
                                  type: 'text'
                                , features: 'titl'
                                , behavior: 'show-before'
                                , content: '*Ü*'
                                }
                            ]
                        }
                      , {
                            weight: '-9.95'
                          , addClasses: [
                                  'mdlfs-feature-display__item__content_inline'
                              , 'mdlfs-feature-display__item__content_inline-no-gap'
                            ]
                          , contents: [
                                {
                                  type: 'text'
                                , features: 'sups'
                                , content: 'H*2*O '
                                , featuresOnHighlights: true
                                }
                              , {
                                  type: 'text'
                                , features: 'subs'
                                , content: '(Z*9*'
                                , featuresOnHighlights: true
                                }
                              , {
                                  type: 'text'
                                , features: 'sups'
                                , content: 'X*6*'
                                , featuresOnHighlights: true
                                }
                              , {
                                  type: 'text'
                                , features: 'subs'
                                , content: 'W*3*)'
                                , featuresOnHighlights: true
                                }
                            ]
                        }
                        , {
                            weight: '-9.94'
                          , addClasses: 'mdlfs-feature-display__item__content_inline'
                          , contents: [
                                {
                                  type: 'text'
                                , features: 'frac'
                                , behavior: 'show-before'
                                , content: '*1/2*'
                                }
                              , {
                                  type: 'text'
                                , features: 'frac'
                                , behavior: 'show-before'
                                , content: '*4/5*'
                                }
                            ]
                        }
                      , {
                          contents: [
                                {
                                  type: 'text'
                                , features: 'ordn'
                                , behavior: 'show-before'
                                , content: '*1a* vez; *5o* ano'
                                }
                            ]
                        }
                    ]
                    // "complement" (default): use default feature items if
                    //        no item for a feature is in feaureItemsSetup
                    // true/truish: use all default feature items
                    // false/falsy: don't use any default feature items
                    // Todo: could also be a list of feature-tags for which default
                    // items should be added, if available
                    //, useDefaultFeatureItems: 'complement'
                }
              , loadProgressIndicator: {
                    loadedClass: 'mdlfs-load-progress_loaded'
                  , loadingClass: 'mdlfs-load-progress_loading'
                  , progressBarClass: 'mdlfs-load-progress__progress-bar'
                  , setProgressBar: function(element, percent) {
                        if(element.MaterialProgress)
                        element.MaterialProgress.setProgress(percent);
                    }
                  , percentIndicatorClass: 'mdlfs-load-progress__percent'
                  , taskIndicatorClass: 'mdlfs-load-progress__task'
                }
              , perFont: {
                    itemClass: 'mdlfs-per-font__item'
                  , bluePrintNodeClass: 'mdlfs-per-font__item-blueprint'
                  , fontDataClass:  'mdlfs-per-font__data'
                  , currentFontClass:  'mdlfs-per-font__current-font'
                }
              , diagram: {
                    glyphClass: 'mdlfs-diagram__glyph'
                  , ylineClass: 'mdlfs-diagram__yline'
                  , boxClass: 'mdlfs-diagram__box'
                  , layoutClass: 'mdlfs-diagram__layout'
                  , textClass: 'mdlfs-diagram__text'
                }
              , currencySymbols: {
                     sampleClass: 'mdlfs-currency-symbols__sample'
                   , symbolClass: 'mdlfs-currency-symbols__sample-symbol'
                   , textClass: 'mdlfs-currency-symbols__sample-text'
                }
              , fontLister: {

                }
              , charsetInfo: {
                     bluePrintNodeClass: 'mdlfs-charset-info__item-blueprint'
                   , itemContentContainerClass: 'mdlfs-charset-info__item-content-container'
                   , itemClass: 'mdlfs-charset-info__item'
                   , itemCharsetNameClass: 'mdlfs-charset-info__item__charset-name'
                   , itemLanguageClass: 'mdlfs-charset-info__item__language'
                   , itemIncludedCharsetClass: 'mdlfs-charset-info__item__included-charset'
                   , itemSampleCharClass: 'mdlfs-charset-info__item__sample-char'
                }
            }
          , pubsub = new PubSub()
          , factories, containers
          , fontsData = new FontsData(pubsub, {
                  // Array.from(FontsData.DEFAULT_LAX_CHAR_LIST) would look
                  // better here, but it needs to be polyfilled for old browsers.
                  useLaxDetection: (function(s) {
                                  var a = [];
                                  s.forEach(function(i){a.push(i);});
                                  return a;
                              })(FontsData.DEFAULT_LAX_CHAR_LIST).concat([
                  // This is for the Muli font.
                  // I believe we can add all these to the lax list,
                  // because they are not important for language support.
                  // The new GF-latin-unique defines these though.
                  // 0x0270 shoul maybe be
                          // missing from latin plus for muli
                        , 0xFB00 // LATIN SMALL LIGATURE FF
                        , 0xFB03 // LATIN SMALL LIGATURE FFI
                        , 0xFB04 // LATIN SMALL LIGATURE FFL
                          // missing from latin pro for muli
                        , 0x0270 // LATIN SMALL LETTER TURNED M WITH LONG LEG
                  ])//true
                , languageCharSets: JSON.parse(languageCharSetsJson)
                , charSets: JSON.parse(googleFontsCharSetsJson)
            })
          , webFontProvider = new WebFontProvider(window, pubsub, fontsData)
          ;

        //if(fontSpecimenConfig.widgetOptions)
        //    var result = {};
        //    for(k in fontSpecimenConfig.widgetOptions)
        //        if(!(k in options))
        //            options[k] =
        //

        factories = [
            ['mdlfs-family-switcher', FamilyChooser, fontsData, options.familyChooser]
          , ['mdlfs-glyph-table', GlyphTables, options.glyphTables]
          , ['mdlfs-font-data', GenericFontData, fontsData,  options.fontData]
          , ['mdlfs-current-font', CurrentWebFont, webFontProvider]
          , ['mdlfs-type-tester', TypeTester, fontsData, options.typeTester]
          , ['mdlfs-feature-display', FeatureDisplay, fontsData, webFontProvider, options.featureDisplay]
          , ['mdlfs-fonts-drop', FilesDrop, loadFonts.fromFileInput]
          , ['mdlfs-load-progress', LoadProgressIndicator, options.loadProgressIndicator]
          , ['mdlfs-per-font', PerFont, fontsData, webFontProvider, options.perFont]
          , ['mdlfs-diagram', Diagram, fontsData, webFontProvider, options.diagram]
          , ['mdlfs-currency-symbols', CurrencySymbols, fontsData, options.currencySymbols]
          , ['mdlfs-font-select', FontLister, fontsData, options.fontLister]
          , ['mdlfs-drag-scroll', DragScroll]
          , ['mdlfs-charset-info', CharSetInfo, fontsData, webFontProvider, options.charsetInfo]
        ];

        containers = initDocumentWidgets(window.document, factories, pubsub);
        pubsub.subscribe('allFontsLoaded', function() {
            // Init newly built MDL elements
            // componentHandler from material design lit is expected to be loaded
            // by now, though, there's no guarantee for this!
            // maybe mdl has an AMD interface? or at least a callback when
            // it is loaded.
            componentHandler.upgradeElements(containers);
            pubsub.publish('activateFont', 0);
        });

        if(fontSpecimenConfig.fontFiles)
            loadFonts.fromUrl(pubsub, fontSpecimenConfig.fontFiles);
        else if(fontSpecimenConfig.loadFromFileInput) {
            // pass, the document should have a FilesDrop widget or similar
        }
    }

    return main;
});
