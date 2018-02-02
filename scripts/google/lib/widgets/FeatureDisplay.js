define([
    'specimenTools/_BaseWidget'
  , 'specimenTools/services/OTFeatureInfo'
  , 'specimenTools/services/svgDrawing/DiagramRenderer'
], function(
    Parent
  , OTFeatureInfo
  , DiagramRenderer
) {
    'use strict';

    /**
     * FeatureDisplay creates small cards demoing OpenType-Features found
     * in the font.
     *
     * Because of our very diverse needs to show different features, the
     * setup of this widget has become a bit more complex than I like it
     * to be. Thus this may be a good candidate for a complete rewrite.
     *
     *
     *
     * FeatureDisplay searches its host element for elements that have the CSS-class
     * `{bluePrintNodeClass}`. These blueprint nodes will be cloned and
     * augmented for each feature that is feasible to demo.
     * The cloned and augmented feature-cards will be inserted at the place
     * where the bluprint-node is located.
     * Since the bluprint-node is never removed, it should be set to
     * `style="display:none"`.
     * If more than one blueprint nodes are found, all are treated as described above.
     * If no blueprint node is found, a basic blueprint-node is generated
     * and appended to the host container.
     *
     * TODO: more specific docs!
     *
     * A blueprint node should contain nodes for different kinds of content,
     * currently: {itemContentTextClass}, {itemContentStackedClass}
     *
     * Each of these content nodes can be use zero or more times and will
     * be appended as a child to {itemContentContainerClass} or inserted
     * into {itemContentContainerClass} where a specially crafted
     * HTML-Comment "<!-- content -->" is located.
     *
     * The amount and content of content nodes is configurable via {feaureItemsSetup}
     * at the moment, the best would be to check out real world examples
     * of this configuration.
     *
     * TODO: more documentation is needed here.
     *
     * If the option {useDefaultFeatureItems} is set to true, features with
     * a default demo content will be displayed. If it is set to "complement"
     * the default demo content will only be displayed if the feature is not
     * used in any of the {feaureItemsSetup} configuration.
     */
    function FeatureDisplay(container, pubSub, fontsData, webFontProvider, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontsData = fontsData;
        this._webFontProvider = webFontProvider;
        this._pubSub.subscribe('activateFont'
                                     , this._onActivateFont.bind(this));
        this._contentElements = [];
        this._itemParentContainer = null;
        this._bluePrintNodes = this._getBluePrintNodes(
                                this._options.bluePrintNodeClass, true);

        this._feaureItemsSetup = this._options.feaureItemsSetup
                    ? this._prepareFeatureItems(this._options.feaureItemsSetup)
                    : []
                    ;
        this._defaultFeaureItemsCache = Object.create(null);
    }

    var _p = FeatureDisplay.prototype = Object.create(Parent.prototype);
    _p.constructor = FeatureDisplay;

    FeatureDisplay.defaultOptions = {
        bluePrintNodeClass: 'feature-display__item-blueprint'
      , itemTagClassPrefix: 'feature-display__item-tag_'
      , itemContentContainerClass: 'feature-display__item-content-container'
      , itemBeforeClass: 'feature-display__item__before'
      , itemChangeIndicatorClass: 'feature-display__item__change-indicator'
        // used to be: itemAfterClass: 'feature-display__item__after'
      , itemAppliedClass: 'feature-display__item__applied'
      , itemTagNameClass: 'feature-display__item__tag-name'
      , itemContentTextClass: 'feature-display__item__content-text'
      , highlightClasses: 'feature-display__item_highlight'
      , tabularClasses: 'feature-display__item_tabular'
      , itemContentStackedClass: 'feature-display__item__content-stacked'
      , itemContentStackedElementClassPrefix: 'feature-display__content-stacked__'
      , itemFriendlyNameClass: 'feature-display__item__friendly-name'
        // an array or null
      , feaureItemsSetup: null
        // "complement" (default): use default feature items if
        //        no item for a feature is in feaureItemsSetup
        // true/truish: use all default feature items
        // false/falsy: don't use any default feature items
        // Todo: could also be a list of feature-tags for which default
        // items should be added, if available
      , useDefaultFeatureItems: 'complement'
        // the default should be by weight -> name, where the default weight is 0
        // and the name is alphabetically first of all features per item
      , featureSortfunction: function(itemA, itemB) {
            var weightA = itemA.weight || 0
              , weightB = itemB.weight || 0
              , featuresA, featuresB
              ;
            if(weightA !== weightB)
                return weightA - weightB;

            featuresA = itemA.features.join(' ');
            featuresB = itemB.features.join(' ');
            if(featuresA === featuresB)
                return 0;
            return featuresA < featuresB ? -1 : 1;
        }
    };

    _p._getBluePrintNodes = function(className) {
        var nodes = this._container.getElementsByClassName(className)
          , i, l, node
          , result = []
          ;

        if(nodes.length) {
            for(i=0,l=nodes.length;i<l;i++) {
                // I expect the blueprint class to be "display: none"
                node = nodes[i].cloneNode(true);
                node.style.display = null;
                this._applyClasses(node, className, true);
                result.push([nodes[i], node]);
            }
        }
        return result;
    };

    /**
     *  Available Features:
     *        -> optional features
     *        -> present in the font
     */
    _p._getAvailableFeatures = function(fontIndex) {
        var fontFeatures = this._fontsData.getFeatures(fontIndex)
          , availableFeatures = OTFeatureInfo.getSubset('optional', Object.keys(fontFeatures))
          , order =  Object.keys(availableFeatures).sort()
          , tag, i, l
          , result = []
          ;
        for(i=0,l=order.length;i<l;i++) {
            tag = order[i];
            result.push([tag, availableFeatures[tag]]);
        }
        return result;
    };

    _p._getDefaultFeatureItems = function(availableFeatures, filterFunc) {
        var i, l, result = [], tag, data, item, setup;
        for(i=0,l=availableFeatures.length;i<l;i++) {
            tag = availableFeatures[i][0];
            data = availableFeatures[i][1];
            if(!data.exampleText)
                continue;
            if(filterFunc && !filterFunc(tag))
                continue;
            item = this._defaultFeaureItemsCache[tag];
            if(!item) {
                // this should be enough to recreate the original display items
                setup = {
                    contents: [
                        {
                            type: 'text'
                          , behavior: 'show-before'
                          , features: tag
                          , content: data.exampleText
                        }
                    ]
                };
                item = this._prepareFeatureItem(setup);
                this._defaultFeaureItemsCache[tag] = item;
            }
            result.push(item);
        }
        return result;
    };

    /**
     * Decorator to inverse a filter function.
     *
     * ```
     * inputItems = ['a', 'b', 'c', 'd', 'e', 'f']
     * s = new Set(['a', 'b', 'c'])
     * inputItems.filter(s.has, s)
     * > [ 'a', 'b', 'c' ]
     * inputItems.filter(inverseFilter(s.has, s))
     * > [ 'd', 'e', 'f' ]
     * // also:
     * inputItems.filter(inverseFilter(s.has), s)
     * ```
     */
    function inverseFilter(filterFunc/*, thisArg*/) {
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        return function(element, index, array) {
            return !filterFunc.call(thisArg !== void 0 ? thisArg : this
                                                , element, index, array);
        };
    }

    _p._onActivateFont = function(fontIndex) {
        var featureItems
          , usedFeatures
          , availableFeatures
          , availableFeaturesTags
          , i, l
          , filterFunc
          ;
        for(i=this._contentElements.length-1;i>=0;i--)
            this._contentElements[i].parentNode.removeChild(this._contentElements[i]);

        availableFeatures = this._getAvailableFeatures(fontIndex);
        availableFeaturesTags = new Set();
        availableFeatures.forEach(function(item) {
                                availableFeaturesTags.add(item[0]); });
        // all features used by the featureItems must be available in the font
        function filterAvailableFeatureItems(featureItem) {
            var i,l;
            for(i=0,l=featureItem.features.length;i<l;i++)
                if(!availableFeaturesTags.has(featureItem.features[i]))
                    return false;
            return true;
        }

        featureItems = this._feaureItemsSetup
                           // filter also copies this._feaureItemsSetup
                           // this is important! We will change the
                           // featureItems array later.
                           .filter(filterAvailableFeatureItems);

        if(this._options.useDefaultFeatureItems) {
            // add default
            filterFunc = null;
            if(this._options.useDefaultFeatureItems === 'complement') {
                // all available features that are not yet in featureItems
                usedFeatures = new Set();
                for(i=0,l=featureItems.length;i<l;i++)
                    featureItems[i].features.forEach(usedFeatures.add, usedFeatures);
                             // `inverseFilter` takes care of the "not yet
                             // in featureItems" part; as if there was
                             // a `usedFeatures.hasNot` method.
                filterFunc = inverseFilter(usedFeatures.has, usedFeatures);
            }
            Array.prototype.push.apply(featureItems
                , this._getDefaultFeatureItems(availableFeatures, filterFunc));
        }
        if(this._options.featureSortfunction)
            featureItems.sort(this._options.featureSortfunction);
        this._contentElements = this._buildFeatures(featureItems, fontIndex);
    };

    _p._simpleMarkupAddItem = function (doc, element, type, text, contentSetup) {
        var textNode, node;
        textNode = doc.createTextNode(text.join(''));
        switch(type){
            case('highlight'):
                node = doc.createElement('span');
                this._applyClasses(node, this._options.highlightClasses);

                if(contentSetup.featuresOnHighlights)
                    _setFeaturesToElementStyle(node, contentSetup.features);

                node.appendChild(textNode);
                break;
            default:
                node = textNode;
                break;
        }
        element.appendChild(node);
    };

    _p._simpleMarkup = function (doc, contentSetup) {
        var i, l, type = null
          , parent = doc.createDocumentFragment()
          , currentText = []
          , text = contentSetup.content
          ;

        for(i=0,l=text.length;i<l;i++) {
            if(text[i] === '*') {
                if(currentText.length) {
                    this._simpleMarkupAddItem(doc, parent, type, currentText, contentSetup);
                    currentText = [];
                }
                // switch type
                type = type === 'highlight' ? null : 'highlight';
                continue;
            }
            // a backslash escapes the asterix
            if(text[i] === '\\' && text[i + 1] === '*')
                i += 1;
            currentText.push(text[i]);
        }
        if(currentText.length)
            this._simpleMarkupAddItem(doc, parent, type, currentText, contentSetup);

        return parent;
    };

    _p._textTabularContent = function(doc, setup) {
        var i, l, node
          , parent = doc.createDocumentFragment()
          , text = setup.content
          ;
        for(i=0,l=text.length;i<l;i++) {
            node = doc.createElement('span');
            node.textContent = text[i];
            this._applyClasses(node, this._options.tabularClasses);
            parent.appendChild(node);
        }
        return parent;
    };

    function __collectFeatures(item) {
        //jshint validthis: true
        // this is a Set
        var features, i, l;
        features = typeof item.features === 'string'
                    ? [item.features]
                    : item.features
                    ;
        for(i=0,l=features.length;i<l;i++)
            this.add(features[i]);
    }

    _p._prepareFeatureItem = function(setup) {
        var features = new Set()
          , item = {
                contents: setup.contents || []
              , features: null
           }
          , k
          ;
        for(k in setup) {
            if(k in item) continue;
            item[k] = setup[k];
        }
        item.contents.forEach(__collectFeatures, features);
        item.features = Array.from(features).sort();
        return item;
    };

    _p._prepareFeatureItems = function(setup) {
        var i, l, featureItems = [];
        for(i=0,l=setup.length;i<l;i++)
            featureItems.push(this._prepareFeatureItem(setup[i]));
        return featureItems;
    };

    function _mapToClass(parent, class_, func, thisArg, includeParent) {
        var items = []
          , i, l
          ;
        if(includeParent && parent.classList.contains(class_))
            items.push(parent);

        Array.prototype.push.apply(items, parent.getElementsByClassName(class_));

        for(i=0,l=items.length;i<l;i++)
            func.call(thisArg || null, items[i], i);
    }

    function _getFontFeatureSettings(features) {
        var _features = typeof features === 'string'
                    ? [features]
                    : features
                    ;
        return _features.map(function(tag) {
                var onVal = OTFeatureInfo.getFeature(tag).onByDefault
                            ? '0' : '1' ;
                return '"' + tag + '" ' + onVal;
            }).join(', ');
    }

    function _setFeaturesToElementStyle(item, features) {
        item.style.fontFeatureSettings = _getFontFeatureSettings(features);
    }

    /**
     * contentSetup = {
     *      type: "text"
     *    , features: "tag" || ["tag", "tag", ...]
     *    , content: "sample text"
     *    , behavior: "show-before" || "tabular" ||  falsy
     * }
     *
     * behavior: 'tabular' and `falsy` are both removing the "before" elements from the blueprint
     *
     * <div class="mdlfs-feature-display__item__content_text">
     *     <!-- removed if not in `show-before` mode-->
     *     <div class="mdlfs-feature-display__item__before"></div>
     *     <div class="material-icons mdlfs-feature-display__item__change-indicator">arrow_downward</div>
     *     <!-- end removed -->
     *     <div class="mdlfs-feature-display__item__applied"></div>
     * </div>
     */
    _p._textTypeFactory = function(contentSetup, contentTemplate, fontIndex) {
        var element
          , item = {
                element: null
              , onHasDocument: false
            }
          ;

        function setContent(item, i) {
            /*jshint unused:vars, validthis:true*/
            var content = contentSetup.behavior === 'tabular'
                ? this._textTabularContent(this._container.ownerDocument, contentSetup)
                : this._simpleMarkup(this._container.ownerDocument, contentSetup)
                ;
            item.appendChild(content);
            this._webFontProvider.setStyleOfElement(fontIndex, item);
        }

        function del (item) {
            if (item.parentNode) item.parentNode.removeChild(item);
        }

        // create and fill the contentTemplates for this contentSetup
        element = contentTemplate.cloneNode(true);

        if(contentSetup.behavior !== 'show-before') {
            _mapToClass(element, this._options.itemBeforeClass, del, this);
            _mapToClass(element, this._options.itemChangeIndicatorClass, del, this);
        }
        else
            _mapToClass(element, this._options.itemBeforeClass, setContent, this, true);

        _mapToClass(element, this._options.itemAppliedClass, setContent, this, true);

        if(!contentSetup.featuresOnHighlights)
            _mapToClass(element, this._options.itemAppliedClass, function(item, i) {
                /*jshint unused:vars*/
                _setFeaturesToElementStyle(item, contentSetup.features);
            }, this, true);

        item.element = element;
        return item;
    };

    _p._renderSVG = function(instructions, fontIndex) {
        var contructorOptions = {
                glyphClass: 'glyph'
              , ylineClass: 'yline'
              , boxClass: 'box'
              , layoutClass: 'layout'
              , textClass: 'text'
          }
          , classPrefix = this._options.itemContentStackedElementClassPrefix
          , k
          , renderOptions = {}
          , renderer
          ;
        for(k in contructorOptions)
            contructorOptions[k] = classPrefix + contructorOptions[k];

        renderer = new DiagramRenderer(
              this._container.ownerDocument
            , this._fontsData
            , this._webFontProvider
            , contructorOptions
        );

        return renderer.render(instructions, fontIndex, renderOptions);
    };

    function _getStackedBehavior(text) {
         var behaviorKeywords = [
                // keep sorted by longest keyword first!
                ['webfont!', 'webfont']
              , ['outline!', 'outline']
              , ['w!', 'webfont']
              , ['o!', 'outline']
            ]
           , i, l, kw, behavior
           ;
         for(i=0,l=behaviorKeywords.length;i<l;i++) {
             kw = behaviorKeywords[i][0];
             if(text.indexOf(kw) !== 0)
                 continue;
             behavior = behaviorKeywords[i][1];
             return [behavior, text.slice(kw.length).trim()];
         }
         // default
         return ['webfont', text];
    }

    function _parseSeparatedList(separatorCharacter, escapeCharacter, trim, text) {
        var i, l, char, items = [], accumulated = [];
        for(i=0,l=text.length;i<l;i++) {
            char = text[i];
            if(char === escapeCharacter && text[i+1] === separatorCharacter) {
                // escaped
                i++;
                char = text[i];
            }
            else if(char === separatorCharacter) {
                // argument separator
                items.push(accumulated.join(''));
                accumulated = [];
                continue;
            }
            // just a part of the argument
            accumulated.push(char);
        }
        if(accumulated.length)
            // left overs
            items.push(accumulated.join(''));
        return (trim !== false
                    ? items.map(function(item){return item.trim();})
                    : items
                );
    }

    function _parseStackedOutlineContent(text) {
        // text = "l:l.ss02, align:left"
        var args, content, optionsList, i, l, options = Object.create(null)
          , result = {
                before: null
              , after: null
              , options: options
            };

        args = _parseSeparatedList(',', '\\', true, text);
        if(!args.length)
            throw new Error('StackedOutlineContent: Can\'t find a content '
                                            + 'argument in "'+text+'"');

        content = _parseSeparatedList(':', '\\', true, args[0]);
        if(content.length !== 2)
            throw new Error('StackedOutlineContent: content must have two '
                                    + 'items but has: ' + content.length);
        result.before = content[0];
        result.after = content[1];

        if(args[1]) {
            optionsList = _parseSeparatedList(':', '\\', true, args[0]);
            for(i=0,l=optionsList.length;i<l;i+=2)
                options[optionsList[i]] = optionsList[i+1];
        }
        return result;
    }

    function _getStackedOutlineBox(text, contentSetup) {
        // jshint unused:vars
        var setup = _parseStackedOutlineContent(text);
        return ['box', [
              ['glyph', setup.after, {style: 'highlighted'}]
            , ['glyph', setup.before, {style: 'muted'}]
            ]
          , setup.options
        ];
    }

    function _getStackedWebfontBox(text, contentSetup) {
        var features = _getFontFeatureSettings(contentSetup.features);
        return ['box', [
              ['text', text, {style: 'highlighted', features: features}]
            , ['text', text, {style: 'muted'}]
            ]
        ];
    }

    /**
     * <div class="mdlfs-feature-display__item__content_stacked"></div>
     *
     * FeatureItems of `type` "stacked" can use `behavior`
     * with following values:
     *
     * "webfont": draws text as webfont
     *        - applies features, kerning
     *        - limited glyph alignment control, because we can't do it
     *          without the side bearing, i.e. using the pure outlines.
     *        - example: "l"
     * "mixed" (default): decides per content
     *      "webfont!", "w!": at the beginning of a content
     *                 interprets it as a webfont content.
     *                 example: "webfont l"
     *      (default): no marking makes it a "webfont"
     *      "outline!" "w!" at the beginning of a content
     *                 makes it an outline content.
     *                 example: "outline l:l.ss02, align:left"
     * "outline": draws glyphs as outlines
     *          - no kerning, features etc.
     *          - better glyph alignment control
     *          - needs more information
     *         example: "l:l.ss02;align: left"
     *
     *  [{
     *      type: "stacked"
     *    , features: ["ss01", "ss02", "ss03", "ss04"]
     *    , content: ["G", "g", "R", "l", "outline! l:l.ss02, align:left"]
     *    , behavior: 'mixed'
     *  }
     *  ]
     */
    _p._stackedTypeFactory = function(contentSetup, contentTemplate, fontIndex) {
        var content = typeof contentSetup.content === 'string'
                    ? [contentSetup.content]
                    : contentSetup.content
          , boxes = [], text
          , instructions = ['layout', boxes]
          , i, l
          , contentBehavior, behavior
          , box
          ;
        // build a stacked setup
        // 'mixed'|'webfont'|'outline'|falsy
        contentBehavior = contentSetup.behavior || 'mixed';
        if(!(contentBehavior in {'mixed': true, 'webfont': true, 'outline': true}))
            throw new Error('Unknown "stacked" content behavior "' + behavior + '"');

        for(i=0,l=content.length;i<l;i++) {
            if(contentBehavior === 'mixed') {
                behavior = _getStackedBehavior(content[i]);
                text = behavior[1];
                behavior = behavior[0];
            }
            else {
                text = content[i];
                behavior = contentBehavior;
            }

            switch(behavior) {
                case('outline'):
                    box =_getStackedOutlineBox(text, contentSetup);
                    break;
                case('webfont'):
                    /* falls through */
                default:
                    box = _getStackedWebfontBox(text, contentSetup);
                    break;
            }
            boxes.push(box);
        }

        // return {
        //      element: aDOMElement
        //    , onHasDocument: function(){/*...*/}
        // }
        return this._renderSVG(instructions, fontIndex);
    };

    _p._contentFactories = {
        stacked: '_stackedTypeFactory'
      , text: '_textTypeFactory'
    };

    _p._getContentFactory = function(contentSetup) {
        var factory = this._contentFactories[contentSetup.type];
        if(typeof factory === 'string')
            factory = this[factory];
        if(!factory)
            throw new Error('FeatureDisplay: Factory for "'
                                + contentSetup.type + '" is not implemented.');
        return factory;
    };

    _p._runContentFactory = function(contentSetup, contentTemplate, fontIndex) {
        var factory = this._getContentFactory(contentSetup);
        return factory.call(this, contentSetup, contentTemplate, fontIndex);
    };

    function getMarkerComments(markerContent, element, first) {
        var i, l, childNode
          , marker = markerContent.trim()
          , result = first ? null : []
          ;
        // Get all the special comments: <!-- {markercontent} -->
        for(i=0,l=element.childNodes.length;i<l;i++) {
            childNode = element.childNodes[i];
            if(!(childNode.nodeType === 8 //Node.COMMENT_NODE == 8
                           && childNode.textContent.trim() === marker))
                continue;
            if(first)
                return childNode;
            else
                result.push(childNode);
        }
        // null if first is truish
        return result;
    }

    _p._makeElementFromBluePrint = function(bluePrintNode) {
        // Could be done once for the blueprint node,
        // But to much caching can cause maintenance trouble as well.
        var element = bluePrintNode.cloneNode(true)
          , contentTemplates = Object.create(null)
          , templateElements
          , contentTypes = {
                text: this._options.itemContentTextClass
              , stacked: this._options.itemContentStackedClass
            }
          , key
          , templates = [], i, l
          , contentContainer
          ;

        // get content templates
        for(key in contentTypes) {
            templateElements = element.getElementsByClassName(
                                                        contentTypes[key]);
            // use the last found element
            if(templateElements.length)
                contentTemplates[key] = templateElements[templateElements.length-1];

            Array.prototype.push.apply(templates, templateElements);
        }

        // delete all template children
        for(i=0,l=templates.length;i<l;i++) {
            if(templates[i].parentNode)
                templates[i].parentNode.removeChild(templates[i]);
        }

        if(this._options.itemContentContainerClass) {
            contentContainer = element.getElementsByClassName(
                            this._options.itemContentContainerClass)[0];
        }
        contentContainer = contentContainer || element;

        return {
            element: element
          , contentTemplates: contentTemplates
                          // <!-- contents -->
          , insertionMarker: getMarkerComments('contents', contentContainer, true)
        };
    };

    _p._buildFeatureItem = function(setup, bluePrintNode, fontIndex) {
        var elementData = this._makeElementFromBluePrint(bluePrintNode)
          , element = elementData.element
          , contents = []
          , item = {
                element:element
              , contents: contents
            }
          , i,l, contentSetup, contentTemplate, contentItem
          , contentsFragment = this._container.ownerDocument.createDocumentFragment()
          ;
        if('removeClasses' in setup)
            this._applyClasses(element, setup.removeClasses, true);
        if('addClasses' in setup)
            this._applyClasses(element, setup.addClasses);

        _mapToClass(element, this._options.itemTagNameClass, function(item, i) {
            /*jshint unused:vars*/
            item.textContent = setup.features.join(', ');
        }, this, true);

        _mapToClass(element, this._options.itemFriendlyNameClass, function(item, i) {
            /*jshint unused:vars*/
            item.textContent = 'friendlyName' in setup
                  ? setup.friendlyName
                  : setup.features.map(function(tag) {
                        return OTFeatureInfo.getFeature(tag).friendlyName;
                    }).join('/')
                  ;
        }, this, true);

        for(i=0,l=setup.contents.length;i<l;i++) {
            contentSetup = setup.contents[i];
            contentTemplate = elementData.contentTemplates[contentSetup.type];
            if(!contentTemplate)
                continue;
            contentItem = this._runContentFactory(contentSetup
                                            , contentTemplate, fontIndex);
            contentsFragment.appendChild(contentItem.element);
            contents.push(contentItem);
        }
        if(contents.length) {
            if(elementData.insertionMarker)
                elementData.insertionMarker
                           .parentNode
                           .insertBefore(contentsFragment, elementData.insertionMarker);
            else
                element.appendChild(contentsFragment);
        }
        return item;
    };

    _p._buildFeatureItems = function (featureItem, fontIndex) {
        var i, l
          , originalBluePrintNode, bluePrintNode, item
          , elements = []
          ;

        for(i=0,l=this._bluePrintNodes.length;i<l;i++) {
            originalBluePrintNode = this._bluePrintNodes[i][0];
            bluePrintNode = this._bluePrintNodes[i][1];
            item = this._buildFeatureItem(featureItem, bluePrintNode
                                                            , fontIndex);
            if(!item.contents.length)
                continue;
            // insert at blueprint node position
            originalBluePrintNode.parentNode.insertBefore(item.element
                                                , originalBluePrintNode);
            for(i=0,l=item.contents.length;i<l;i++) {
                if(item.contents[i].onHasDocument)
                    // so the item can gather actual size information, i.e.
                    // some svg based contents need this
                    item.contents[i].onHasDocument();
            }
            elements.push(item.element);
        }
        return elements;
    };

    _p._buildFeatures = function(featureItems, fontIndex) {
        var i, l, featureItem, elements = [];
        for (i=0,l=featureItems.length;i<l;i++) {
            featureItem = featureItems[i];
            Array.prototype.push.apply(elements,
                           this._buildFeatureItems(featureItem, fontIndex));
        }
        return elements;
    };

    return FeatureDisplay;
});
