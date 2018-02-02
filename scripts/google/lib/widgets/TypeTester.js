define([
    'specimenTools/_BaseWidget'
  , 'specimenTools/services/OTFeatureInfo'
], function(
    Parent
  , OTFeatureInfo
) {
    'use strict';

    /**
     * TypeTester provides interfaces that help to test the current webfont.
     * See the CurrentWebFont widget.
     *
     * The interfaces provided are:
     *
     * - Dynamic slider inputs for controlling linear css attributes of the
     *      TypeTester
     *      Use the CSS-class configured at `sliderControlsClass` on a host
     *      element for the range input element.
     *      Provide a data-target-property on the input to specify the css
     *      attribute it should affect; Further, the following data attributes
     *      can be set on the container for customizing the slider, each including
     *      the css attribute the slider controls, e.g. to customize a slider
     *      for font-size:
     *              `data-min-font-size`
     *              `data-max-font-size`
     *              `data-value-font-size`
     *              `data-unit-font-size`
     *              `data-step-font-size`
     * - Dynamic element displaying the current font size:
     *      Use the CSS-class configured at `tester__label` as well as a
     *      data-target-property with the value of the css value this label
     *      corresponds to. The `element.textContent` of elements matching this
     *      class will be set to the current value of the TypeTester widget.
     * - Switches to deactivate OpenType-Features that are activated by default.
     *      Use the CSS-class configured at `defaultFeaturesControlsClass`
     *      to have a de-/activating button appended to the host element
     *      for each OpenType Feature that is active by default.
     *      Initial button state is active.
     * - Switches to activate OpenType-Features that are optional.
     *      Use the CSS-class configured at `optionalFeaturesControlsClass`
     *      to have a de-/activating button appended to the host element
     *      for each OpenType Feature that is optional.
     *      Initial button state is inactive.
     * - An element that receives the settings made by the elements described above.
     *      Use the CSS-class configured at `contentContainerClass` to have
     *      the element.style set to the fontSize and fontFeatureSettings
     *      made by the control elements of this widget.
     *
     *      To use the current font on this element, see the CurrentWebFont
     *      widget.
     *      To enable the users typing text themselves use either the DOM
     *      attribute `contenteditable=True` or use a `<textarea>` element.
     *
     */
    function TypeTester(container, pubSub, fontsData, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontsData = fontsData;

        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));

        this._contentContainers = this._getByClass(this._options.contentContainerClass);

        this._controls = {
            features: {
                containers: Object.create(null)
              , active: Object.create(null)
              , buttons: null
              , tags: null
            }
        };

        this._activeFeatures = Object.create(null);
        this._values = Object.create(null);
        this.__sliderInputHandler = this._sliderInputHandler.bind(this);
        this._initControls();
        this._applyValues();
    }

    var _p = TypeTester.prototype = Object.create(Parent.prototype);
    _p.constructor = TypeTester;

    TypeTester.defaultOptions = {
        slider_default_min: 10
      , slider_default_max: 128
      , slider_default_value: 32
      , slider_default_step: 1
      , slider_default_unit: 'px'
      , slider_default_class: 'specimen-slider'
      , optionalFeaturesControlsClass: 'type-tester__features--optional'
      , defaultFeaturesControlsClass: 'type-tester__features--default'
      , sliderControlsClass: 'type-tester__slider'
      , contentContainerClass: 'type-tester__content'
      , labelControlsClass: 'type-tester__label'
      , setCssValueToInput: function(input, value) {
            input.value = value;
        }
      , optionalFeatureButtonClasses: ''
      , defaultFeatureButtonClasses: ''
      , activateFeatureControls: null
      , featureButtonActiveClass: 'active'
    };

    /**
     * Generic listener that reacts to a slider being moved
     * The css property being manipulates is extracted from the wrapping DOM node's
     * data-target-property value
     */
    _p._sliderInputHandler = function(evt) {
        var parentElement = evt.target.parentElement
          , cssProperty = null
          , value = evt.target.value
          ;
        while(parentElement !== this._container) {
            if(parentElement.dataset.targetProperty === undefined) {
                parentElement = parentElement.parentElement;
                continue;
            }
            cssProperty = parentElement.dataset.targetProperty;
            break;
        }
        if(cssProperty === null)
            return;
        this._setCssValue(cssProperty, value);
        this._applyValues();
    };

    /**
     * Retrieve the data-xxx attributes for a slider, where the data
     * attributes are in the form of "data-min-font-size"
     * @param sliderName: camelCase version of the css attribute this
     *    slider controls, i.e. "fontSize"
     */
    _p._setSliderOptions = function (sliderName) {
        var dataOption
          , sliderDataOptions = ['min', 'max', 'unit', 'step', 'value', 'class']
          , i
          ;

        this._options[sliderName] = {};

        for(i=0;i<sliderDataOptions.length;i++) {
            // for each slider like "font-size" iterate over all of
            // "minFontSize", "maxFontSize", etc
            dataOption = [sliderDataOptions[i]
                    , sliderName.substr(0,1).toUpperCase()
                    , sliderName.substr(1)
                ].join('');

            // fill options from data values and fallback to defaults
            if(dataOption in this._container.dataset)
                this._options[sliderName][sliderDataOptions[i]] =
                  this._container.dataset[dataOption];
            else
                this._options[sliderName][sliderDataOptions[i]] =
                  this._options['slider_default_' + sliderDataOptions[i]];
        }
    };

    _p._initSlider = function(element) {
        var input = this._container.ownerDocument.createElement('input')
          , sliderPropertyName = element.dataset.targetProperty
          , sliderName = this._cssName2jsName(sliderPropertyName)
          , controlsIndex = [sliderName, '_slider'].join('')
          , attributes = {
              min:  this._options[sliderName].min
            , max:  this._options[sliderName].max
            , step: this._options[sliderName].step
            }
          , k
          ;

        if(!(controlsIndex in this._controls))
            this._controls[controlsIndex] = [];
        this._controls[controlsIndex].push({input: input, container: element});
        this._applyClasses(input, this._options[sliderName].class);

        input.setAttribute('type', 'range');
        for(k in attributes)
            input.setAttribute(k, attributes[k]);
        element.appendChild(input);
        input.addEventListener('input', this.__sliderInputHandler);
    };

    _p._initLabel = function(element) {
        var cssName = this._cssName2jsName(element.dataset.targetProperty)
          ,  labelPropertyName = [cssName, '_label'].join('')
          ;

        if(!(labelPropertyName in this._controls))
            this._controls[labelPropertyName] = [];
        this._controls[labelPropertyName].push(element);
    };

    _p._initFeaturesControl = function(element, type) {
        if(!(type in this._controls.features.containers))
            this._controls.features.containers[type] = [];
        this._controls.features.containers[type].push(element);
        element.addEventListener('click',
            this._switchFeatureTagHandler.bind(this, element));
    };

    /**
     * Setup function that in turn initates different types of nested control elements
     */
    _p._initControls = function() {
        var sliders = this._getByClass(this._options['sliderControlsClass'])
          , labels = this._getByClass(this._options['labelControlsClass'])
          , setup = {
              optionalFeatures: [
                  this._getByClass(this._options['optionalFeaturesControlsClass'])
                , ['_initFeaturesControl', 'optional']]
              , defaultFeatures: [
                  this._getByClass(this._options['defaultFeaturesControlsClass'])
                , ['_initFeaturesControl', 'default']]
            }
          , afterInit = []
          , initFunc, initFuncArgs, containers, key
          , cssProperty, cssName, sliderPropertyName, labelPropertyName
          , i, l
          ;


        // iterate all property sliders and add them to the setup object
        for(i=0;i<sliders.length;i++) {
            cssProperty = sliders[i].dataset.targetProperty;
            cssName = this._cssName2jsName(cssProperty);
            sliderPropertyName = [cssName, '_slider'].join('');
            if (!(sliderPropertyName in setup)) {
                this._setSliderOptions(cssName);
                setup[sliderPropertyName] = [[], ['_initSlider']];
            }
            setup[sliderPropertyName][0].push(sliders[i]);
        }

        // iterate through all slider labels
        for(i=0;i<labels.length;i++) {
            cssProperty = labels[i].dataset.targetProperty;
            cssName = this._cssName2jsName(cssProperty);
            labelPropertyName = [cssName, '_label'].join('');
            if (!(labelPropertyName in setup)) {
                setup[labelPropertyName] = [[], ['_initLabel']
                  , this._setCssValue.bind(this, cssProperty, this._options[cssName].value)];
            }
            setup[labelPropertyName][0].push(labels[i]);
        }

        // iterate over all of the setup object and initiate based on
        // passed in initFunc's
        for(key in setup) {
            initFunc = setup[key][1][0];
            initFuncArgs = setup[key][1].slice(1);
            if(setup[key][2])
                afterInit.push(setup[key][2]);
            containers = setup[key][0];
            for(i=0,l=containers.length;i<l;i++) {
                this[initFunc].apply(this, [containers[i]].concat(initFuncArgs));
            }
        }

        // running these after all initializations, so `fontSizeIndicator`
        // gets initialized by the call to `_setFontSize` of `fontsize`
        for(i=0,l=afterInit.length;i<l;i++)
            afterInit[i]();
    };

    _p._switchFeatureTagHandler = function(container, evt) {
        var tag = null
          , active = this._controls.features.active
          , type, cssFeatureValue, button
          ;
        // first find the feature tag
        button = evt.target;
        while(button && button !== container) {
            if(button.hasAttribute('data-feature-tag')) {
                tag = button.getAttribute('data-feature-tag');
                break;
            }
            button = button.parentElement;
        }
        if(tag === null)
            return;

        if(tag in active)
            delete active[tag];
        else {
            type = this._getFeatureTypeByTag(tag);
            if(type === 'default')
                cssFeatureValue = '0';
            else if(type === 'optional')
                cssFeatureValue = '1';
            else
                return;
            active[tag] = cssFeatureValue;
        }
        this._setFeatureButtonsState();
        this._setFeatures();
        this._applyValues();
    };

    _p._setFeatures = function() {
        var active = this._controls.features.active
          , buttons = this._controls.features.buttons
          , values = []
          , tag
          ;
        for (tag in active) {
            // if there is a button for the tag, we currently control it
            if(tag in buttons)
                values.push('"' + tag + '" ' + active[tag]);
        }
        this._values['font-feature-settings'] = values.join(', ');
    };

    /**
     *
     * @param container
     * @param type: "optional" | "default"
     * @param features
     * @param order
     * @returns {Array}
     * @private
     */
    _p._updateFeatureControlContainer = function(container, type, features, order) {
        var doc = container.ownerDocument
          , tag, i, l, feature, label, button
          , uiElementsToActivate = []
          ;

        if(!order) order = Object.keys(features).sort();

        // delete old ...
        for(i=container.children.length-1;i>=0;i--) {
            if(type === container.children[i].getAttribute('data-feature-type'))
                container.removeChild(container.children[i]);
        }
        for(i=0,l=order.length;i<l;i++) {
            tag = order[i];
            feature = features[tag];
            label = [tag, feature.friendlyName].join(': ');
            button = doc.createElement('button');
            button.textContent = label;
            button.setAttribute('data-feature-tag', tag);
            button.setAttribute('data-feature-type', type);
            this._applyClasses(button, this._options[type + 'FeatureButtonClasses']);
            container.appendChild(button);
            uiElementsToActivate.push(button);
            if(!(tag in this._controls.features.buttons))
                this._controls.features.buttons[tag] = [];
            this._controls.features.buttons[tag].push(button);
            // TODO: set this button to it's active state
            // maybe a general function after all buttons have been created
        }
        return uiElementsToActivate;
    };

    _p._getFeatureTypeByTag = function(tag) {
        var tags = this._controls.features.tags;
        if('default' in tags && tag in tags.default.features)
            return 'default';
        else if('optional' in tags && tag in tags.optional.features)
            return 'optional';
        else
            return null;
    };

    _p._updateFeatureControls = function(fontIndex) {
        // updata feature control ...
        var fontFeatures = this._fontsData.getFeatures(fontIndex)
          , availableFeatureTags = Object.keys(fontFeatures)
          , type
          , typesOrder = ['default', 'optional']
          , i, l, j, ll
          , featureData = this._controls.features
          , uiElements, uiElementsToActivate = []
          , featureContainers
          , features, order
          ;

        // delete old tag => buttons registry
        featureData.buttons = Object.create(null);
        // these are all the features we care about
        featureData.tags = Object.create(null);


        // collect the features available for each category (type)
        for(i=0,l=typesOrder.length;i<l;i++) {
            type = typesOrder[i];
            features = OTFeatureInfo.getSubset(type, availableFeatureTags);
            order = Object.keys(features).sort();
            featureData.tags[type] = {
                features: features
              , order: order
            };

            featureContainers = featureData.containers[type] || [];
            for(j=0,ll=featureContainers.length;j<ll;j++) {
                uiElements = this._updateFeatureControlContainer(
                                                  featureContainers[j]
                                                , type, features
                                                , order);
                // Could also just push all buttons?
                // This is used, at the moment, to let mdlFontSpecimen activate
                // these items via this._options.activateFeatureControls
                // OK would be if _updateFeatureControlContainer would return
                // the a list of relevant elements. BUT: it is hard to determine
                // which level is relevant. For MDL just the
                // plain buttons would be fine, so maybe I should stick with this.
                Array.prototype.push.apply(uiElementsToActivate, uiElements);
            }

        }
        if(this._options.activateFeatureControls)
            this._options.activateFeatureControls.call(this, uiElementsToActivate);
        // We could reset active features that are no longer available:
        // But for now we don't, remembering old settings between font
        // switching.
        //for(k in this._activeFeatures)
        //    if(!(k in features))
        //        delete this._activeFeatures[k]
        this._setFeatureButtonsState();
    };

    _p._setFeatureButtonActiveState = function(element, isActive) {
        this._applyClasses(element, this._options.featureButtonActiveClass, !isActive);
    };

    _p._setFeatureButtonsState = function() {
        var tag, active, buttons, buttonIsActive
          , featureData = this._controls.features
          , type, i, l
          ;

        for(tag in featureData.buttons) {
            buttons = featureData.buttons[tag];
            active = tag in featureData.active;
            type = this._getFeatureTypeByTag(tag);
            if(type === 'default')
                // The button state should be "inactive" if this is a
                // default feature. Because, the default state is activated
                buttonIsActive = !active;
            else if(type === 'optional')
                // button state and tag active state correlate
                buttonIsActive = active;
            else
                // don't know what to do (shouldn't happen unless we implment more tags)
                continue;
            for(i=0,l=buttons.length;i<l;i++)
                this._setFeatureButtonActiveState.call(this, buttons[i], buttonIsActive);
        }
    };

    /**
     * Function that updates any slider controlled css value centrally, so that
     * any effect is mirrored on slider and label for that property
     */
    _p._setCssValue = function(property, value) {
        var i, l
          , propertyJsName = this._cssName2jsName(property)
          , valueUnit = [
                value
              , this._options[propertyJsName].unit
            ]
          , sliders = this._controls[propertyJsName + '_slider']
          , labels = this._controls[propertyJsName + '_label']
          ;

        // loop over all sliders and update their input's values
        for(i=0,l=sliders.length;i<l;i++) {
            this._options
              .setCssValueToInput.call( this, sliders[i].input, value);
        }

        // loop over all labels and update their text content
        for(i=0,l=labels.length;i<l;i++) {
          labels[i].textContent = valueUnit.join(' ');
        }

        this._values[property] = valueUnit.join('');
    };

    _p._getByClass = function(className) {
        return this._container.getElementsByClassName(className);
    };

    _p._applyValues = function() {
        var i, l, container, k;
        for(i=0,l=this._contentContainers.length;i<l;i++) {
            container = this._contentContainers[i];
            for(k in this._values)
                container.style[this._cssName2jsName(k)] = this._values[k];
        }
    };

    _p._onActivateFont = function(fontIndex) {
        this._updateFeatureControls(fontIndex);
        this._setFeatures();
        this._applyValues();
    };

    return TypeTester;
});
