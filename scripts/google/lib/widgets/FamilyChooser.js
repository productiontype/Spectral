define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';

    /**
     * FamilyChooser provides an interface to switch between all
     * loaded fonts. Therefore, it analyzes the available fonts, groups
     * them by family and orders them by weight. If italic styles are
     * present a switch to change to the italics is included per family.
     */

    var cssWeight2weightNames = {
            100: 'Thin'
          , 200: 'ExtraLight'
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
        };

    function FamilyChooser(container, pubSub, fontsData, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontsDataObject = fontsData;

        this._switches = [];
        this._switchesContainer = this._container.ownerDocument.createElement('div');
        this._container.appendChild(this._switchesContainer);

        this._pubSub.subscribe('loadFont', this._onLoadFont.bind(this));
        this._pubSub.subscribe('allFontsLoaded', this._onAllFontsLoaded.bind(this));
        this._pubSub.subscribe('activateFont', this._onActivateFont.bind(this));

        this._fonts = [];
        this._activeFont = null;
        this._familiesData = null;
        this._fontData = null;
        this._familyElements = null;

        let self = this;
        document.addEventListener('_switchWeight', function(e){
          var weight = e.detail.weight;
          var currentStyle = self._activeFont !== null
                  ? self._fontData[self._activeFont].style
                  : 'normal'
            , styleDict = self._familiesData[0][1][weight]
            , fontId = currentStyle in styleDict
                  // if the family is well organized, this is the expected case
                  ? styleDict[currentStyle]
                  // fringe again, family has not all styles for all fonts
                  : styleDict[self._otherStyle(currentStyle)]
            ;
          self._pubSub.publish('activateFont', fontId);
        }, false);
    }

    var _p = FamilyChooser.prototype = Object.create(Parent.prototype);
    _p.constructor = FamilyChooser;

    FamilyChooser.defaultOptions = {
            italicSwitchContainerClasses: []
          , italicSwitchCheckboxClasses: []
          , italicSwitchLabelClasses: []
          , setItalicSwitch: function setItalicSwitch(italicSwitch, enabled, checked) {
                italicSwitch.checkbox.disabled = !enabled;
                italicSwitch.checkbox.checked = checked;
            }
          , weightButtonClasses: []
          , weightButtonActiveClass: 'active'
    };

    _p._otherStyle = function otherStyle(style) {
        return style === 'normal' ? 'italic' : 'normal';
    };

    _p._onLoadFont = function (fontIndex, fontFileName, font) {
        this._fonts[fontIndex] = font;
    };

    _p._switchItalic = function(checkbox) {
        var fontData = this._fontData[this._activeFont]
         , fontId
         ;
        // did not change anything
        if(checkbox.checked && fontData.style === 'italic')
            return;

        if(!fontData || fontData.otherStyle === null)
            // the second case shouldn't really happen, because the
            // italic switch should be inactive or not available.
            return;
        fontId = fontData.otherStyle;
        this._pubSub.publish('activateFont', fontId);
    };

    _p._switchFont = function(familyIndex, weight) {
        // get Font Id ...
        console.log('_switchFont',familyIndex,weight)
        var currentStyle = this._activeFont !== null
                ? this._fontData[this._activeFont].style
                : 'normal'
          , styleDict = this._familiesData[familyIndex][1][weight]
          , fontId = currentStyle in styleDict
                // if the family is well organized, this is the expected case
                ? styleDict[currentStyle]
                // fringe again, family has not all styles for all fonts
                : styleDict[this._otherStyle(currentStyle)]
          ;
        this._pubSub.publish('activateFont', fontId);
    };

    _p._makeItalicSwitch = function() {
        var doc = this._container.ownerDocument
          , italicSwitch = {}
          ;
        italicSwitch.container = doc.createElement('label');
        this._applyClasses(italicSwitch.container, this._options.italicSwitchContainerClasses);

        italicSwitch.checkbox = doc.createElement('input');
        italicSwitch.checkbox.setAttribute('type', 'checkbox');
        this._applyClasses(italicSwitch.checkbox, this._options.italicSwitchCheckboxClasses);
        italicSwitch.checkbox.addEventListener('change', this._switchItalic.bind(this, italicSwitch.checkbox));

        italicSwitch.label = doc.createElement('span');
        italicSwitch.label.textContent = 'italic';
        italicSwitch.label.classList.add('mdl-switch__label');
        this._applyClasses(italicSwitch.label, this._options.italicSwitchLabelClasses);

        italicSwitch.container.appendChild(italicSwitch.checkbox);
        italicSwitch.container.appendChild(italicSwitch.label);

        return italicSwitch;
    };

    _p._makeWeightButton = function(familyIndex, weight) {
      //console.log("_makeWeightButton",familyIndex,weight)
        var doc = this._container.ownerDocument
          , weightButton = doc.createElement('button')
          , label = weight + ' ' + cssWeight2weightNames[weight]
          ;
        weightButton.textContent = label;
        this._applyClasses(weightButton, this._options.weightButtonClasses);
        weightButton.addEventListener('click', this._switchFont.bind(this, familyIndex, weight));
        return weightButton;
    };

    // TODO!!
    _p._makeFamilyElement = function(familyIndex, familyName, weightDict) {
            // default text-sort should suffice here
        var weights = Object.keys(weightDict).sort()
          , familyHasTwoStyles = false
          , result = Object.create(null)
          , doc = this._container.ownerDocument
          , titleElement, weightsElement, weightButton
          , i, l, weight
          ;

        result.weights = Object.create(null);
        result.element = doc.createElement('div');
        titleElement = doc.createElement('h4');
        titleElement.textContent = familyName;
        result.element.appendChild(titleElement);


        for(i=0,l=weights.length;i<l;i++) {
            weight = weightDict[weights[i]];
            if('normal' in weight && 'italic' in weight) {
                familyHasTwoStyles = true;
                break;
            }
        }

        if(familyHasTwoStyles) {
            // make italic checkbox/control
            result.italicSwitch = this._makeItalicSwitch();
            result.element.appendChild(result.italicSwitch.container);
        }

        weightsElement = doc.createElement('div');
        for(i=0,l=weights.length;i<l;i++) {
            weight = weights[i];
            // add weight selection button
            weightButton = this._makeWeightButton(familyIndex, weight);
            weightsElement.appendChild(weightButton);
            result.weights[weight] = weightButton;
        }
        result.element.appendChild(weightsElement);

        return result;
    };

    _p._getFontData = function(familiesData) {
        var fontData = []
          , familyIndex, fontIndex, l, familyName, weightDict, weight
          , styleDict, style, otherStyle
          ;

        for(familyIndex=0,l=familiesData.length;familyIndex<l;familyIndex++) {
            familyName = familiesData[familyIndex][0];
            weightDict = familiesData[familyIndex][1];
            for(weight in weightDict) {
                styleDict = weightDict[weight];
                for(style in styleDict) {
                    fontIndex = styleDict[style];
                    otherStyle = styleDict[this._otherStyle(style)];
                    otherStyle = otherStyle !== undefined ? otherStyle : null;

                    fontData[fontIndex] = {
                        familyIndex: familyIndex
                      , weight: weight
                      , style: style
                        // basically the style link:
                      , otherStyle: otherStyle
                    };
                }
            }
        }
        return fontData;
    };

    _p._onAllFontsLoaded = function(countAll) {
        /*jshint unused:vars*/
        var familiesData = this._fontsDataObject.getFamiliesData()
          , familyElements = []
          , doc = this._container.ownerDocument
          , i, l
          ;
        for(i=0,l=familiesData.length;i<l;i++) {
            if(i > 0)
                this._container.appendChild(doc.createElement('hr'));

            familyElements[i] = this._makeFamilyElement(i, familiesData[i][0]
                                                         , familiesData[i][1]);

            // put all family elements into the FamilyController block
            this._container.appendChild(familyElements[i].element);

        }
        this._familiesData = familiesData;
        this._fontData = this._getFontData(familiesData);
        this._familyElements = familyElements;
    };

    _p._activateFont = function(i) {
        // this will call this._onActivateFont
        this._pubSub.publish('activateFont', i);
    };

    _p._setWeightButton = function(weightButton, isActive) {
        this._applyClasses(weightButton, this._options.weightButtonActiveClass, !isActive);
    };

    _p._setItalicSwitch = function(italicSwitch, enabled, checked) {
        /*jshint unused:vars*/
        var args = [], i, l;
        for(i=0,l=arguments.length;i<l;i++) args.push(arguments[i]);
        this._options.setItalicSwitch.apply(this, args);
    };

    _p._setFamilyElement = function(familyElement, isActive) {
        familyElement.classList[isActive ? 'add' : 'remove']('active');
    };

    _p._onActivateFont = function(fontIndex) {
        // this should only change the view, not emit signals
        // make the button(s) enabled/disabled and active/inactive etc.
        var fontData = this._fontData[fontIndex]
          , familyIndex = fontData.familyIndex, familyIdx, l
            // all families: check/uncheck italic switches
          , italicChecked = fontData.style === 'italic'
          , italicSwitch, italicEnabled
          , weights, weight, weightActive, familyActive
          ;
        for(familyIdx=0,l=this._familyElements.length;familyIdx<l;familyIdx++) {
            familyActive = familyIdx === familyIndex;
            this._setFamilyElement(this._familyElements[familyIdx].element, familyActive);

            // set the state to all italic switches
            italicSwitch = this._familyElements[familyIdx].italicSwitch;
            if(italicSwitch) {
                // can only be enabled when its family is active.
                // AND there must be another style to switch to
                italicEnabled = familyIdx === familyIndex && fontData.otherStyle !== null;
                this._setItalicSwitch(italicSwitch, italicEnabled, italicChecked);
            }

            // set the active weight button active and all others inactive
            weights = this._familyElements[familyIdx].weights;
            for(weight in weights) {
                weightActive = familyIdx === familyIndex && weight === fontData.weight;
                this._setWeightButton(weights[weight], weightActive);
            }
        }
        this._activeFont = fontIndex;
    };

    return FamilyChooser;
});
