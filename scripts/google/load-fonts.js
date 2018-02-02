define([
    'specimenTools/loadFonts'
  , 'specimenTools/initDocumentWidgets'
  , 'specimenTools/services/PubSub'
  , 'specimenTools/services/FontsData'
  , 'specimenTools/services/WebfontProvider'
  , 'specimenTools/widgets/GlyphTables'
  , 'specimenTools/widgets/FamilyChooser'
  , 'specimenTools/widgets/GenericFontData'
  , 'specimenTools/widgets/CurrentWebFont'
  , 'specimenTools/widgets/TypeTester'
  , 'specimenTools/widgets/PerFont'
  , 'specimenTools/widgets/Diagram'
], function(
    loadFonts
  , initDocumentWidgets
  , PubSub
  , FontsData
  , WebFontProvider
  , GlyphTables
  , FamilyChooser
  , GenericFontData
  , CurrentWebFont
  , TypeTester
  , PerFont
  , Diagram
) {
    'use strict';

    /**
     * A very basic initialization function without passing configuration
     * with the factories array
     */

    function main(window, fontFiles) {
        // This PubSub instance is the centrally connecting element between
        // all modules. The order in which modules subscribe to PubSub
        // channels is relevant in some cases. I.e. when a subscriber is
        // dependant on the state of another module.
        //console.log(fontFiles)
        var options = {
            glyphTables: {
                glyphTable: {
                    glyphClass: 'glyph'
                  , glyphActiveClass: 'glyph_active'
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

        var pubsub = new PubSub()
        , factories
        , fontsData = new FontsData(pubsub, {
            useLaxDetection: true, 

                // passing in this object with a font's postscript name
                // allows this name to be overwritten
                overwrites: { 
                    'Spectral-Regular': 'Testname: Spectral-Regular' 
                } 
            })
          , webFontProvider = new WebFontProvider(window, pubsub, fontsData)
          ;

        factories = [
            // [css-class of host element, Constructor(, further Constructor arguments, ...)]
            // All Constructors are given [dom-container, pubsub] as the first two arguments.
            ['family-chooser', FamilyChooser, fontsData]
          , ['glyph-tables', GlyphTables, options.glyphTables]
          , ['font-data', GenericFontData, fontsData]
          , ['current-font', CurrentWebFont, webFontProvider]
          , ['type-tester', TypeTester, fontsData]
          , ['mdlfs-per-font', PerFont, fontsData, webFontProvider, options.perFont]
          , ['mdlfs-diagram', Diagram, fontsData, webFontProvider, options.diagram]
        ];
//console.log(factories)
        initDocumentWidgets(window.document, factories, pubsub);

        pubsub.subscribe('allFontsLoaded', function() {
            //console.log('allFontsLoaded')
            pubsub.publish('activateFont', 0);

            document.dispatchEvent(new Event('_allFontsLoaded'));

        });

        loadFonts.fromUrl(pubsub, fontFiles);
    }

    return main;
});
