define([
    'specimenTools/_BaseWidget'
], function(
    Parent
) {
    'use strict';

    /**
     * PerFont clones blueprint elements with the CSS-class `{bluePrintNodeClass}`
     * once nodes per loaded font file and applies the style for the font
     * to elements marked with CSS-class `{currentFontClass}`.
     * Elements marked with CSS-class `{fontDataClass}` behave similar
     * to the host elements of the widget `GenericFontData`. The DOM-attribute
     * "data-getter" is also used in this context.
     *
     * The font files are ordered by: FamilyName, Weight, Style (normal < italic)
     */
    function PerFont(container, pubSub, fontsData, webFontProvider, options) {
        Parent.call(this, options);
        this._container = container;
        this._pubSub = pubSub;
        this._fontsData = fontsData;
        this._webFontProvider = webFontProvider;
        this._pubSub.subscribe('allFontsLoaded', this._onAllFontsLoaded.bind(this));
        this._contentElements = [];
        this._bluePrintNodes = this._getBluePrintNodes();
    }


    var _p = PerFont.prototype = Object.create(Parent.prototype);
    _p.constructor = PerFont;

    PerFont.defaultOptions = {
          bluePrintNodeClass: 'per-font__item-blueprint'
        , itemClass: 'per-font__item'
        , fontDataClass:  'per-font__data'
        , currentFontClass:  'per-font__current-font'
    };

    _p._getBluePrintNodes = function() {
        var nodes = this._container.getElementsByClassName(
                                    this._options.bluePrintNodeClass)
          , i, l, node
          , result = []
          ;
        for(i=0,l=nodes.length;i<l;i++) {
            // I expect the blueprint class to be "display: none"
            node = nodes[i].cloneNode(true);
            result.push([nodes[i], nodes[i].parentNode, node]);
            node.style.display = null;
            this._applyClasses(node, this._options.bluePrintNodeClass, true);
            this._applyClasses(node, this._options.itemClass);
        }
        return result;
    };

    function _mapToClass(parent, class_, func, thisArg) {
        var items = []
          , i, l
          ;
        if(parent.classList.contains(class_))
            items.push(parent);

        Array.prototype.push.apply(items, parent.getElementsByClassName(class_));

        for(i=0,l=items.length;i<l;i++)
            func.call(thisArg || null, items[i], i);
    }

    _p._defaultGetValue  = function(item, fontIndex) {
        var _getter, getter;
        getter = _getter = item.getAttribute('data-getter');
        if(getter.indexOf('get') !== 0)
            getter = ['get', getter[0].toUpperCase(), getter.slice(1)].join('');

        if(!(getter in this._fontsData) || typeof this._fontsData[getter] !== 'function')
            throw new Error('Unknown getter "' + _getter + '"'
                        + (getter !== _getter
                                    ? '(as "' + getter + '")'
                                    : '')
                        +'.');
        return this._fontsData[getter](fontIndex);
    };

    _p._makeRotationItem = function(bluePrintNode, index) {
        var item = bluePrintNode.cloneNode(false)
          , rotationContent = []
          , rotationContents = [rotationContent]
          , childNode
          , i, l, rotationIndex
          ;
        // Get all the rotation contents
        // a special comment: <!-- rotate -->
        // is used to separate the rotation contents
        for(i=0,l=bluePrintNode.childNodes.length;i<l;i++) {
            childNode = bluePrintNode.childNodes[i];
            if(childNode.nodeType === 8 //Node.COMMENT_NODE == 8
                           && childNode.textContent.trim() === 'rotate') {
                rotationContent = [];
                rotationContents.push(rotationContent);
                continue;
            }

            rotationContent.push(childNode);
        }

        // apply rotationContent
        rotationIndex = index % rotationContents.length;
        rotationContent = rotationContents[rotationIndex];
        for(i=0,l=rotationContent.length;i<l;i++)
            item.appendChild(rotationContent[i].cloneNode(true));
        return item;
    };

    _p._createItem = function(index, bluePrintNode, fontIndex) {
        var item = bluePrintNode.hasAttribute('data-per-font-rotate')
                        ? this._makeRotationItem(bluePrintNode, index)
                        : bluePrintNode.cloneNode(true)
                        ;

        _mapToClass(item, this._options.currentFontClass, function(item, i) {
            /*jshint unused:vars, validthis:true*/
           this._webFontProvider.setStyleOfElement(fontIndex, item);
        }, this);

        _mapToClass(item, this._options.fontDataClass, function(item, i) {
            /*jshint unused:vars, validthis:true*/
            item.textContent = this._defaultGetValue(item, fontIndex);
        }, this);

        return item;
    };

    _p._createItems = function(index, fonts) {
        // create new _contentElements
        var i, l, originalBluePrintNode, itemParentContainer
          , bluePrintNode, item, fontIndex
          , items = []
          ;
        for(i=0,l=this._bluePrintNodes.length;i<l;i++) {
            originalBluePrintNode = this._bluePrintNodes[i][0];
            itemParentContainer = this._bluePrintNodes[i][1];
            bluePrintNode = this._bluePrintNodes[i][2];

            if(bluePrintNode.hasAttribute('data-reverse-font-order'))
                fontIndex = fonts[fonts.length - 1 - index];
            else
                fontIndex = fonts[index];


            item = this._createItem(index, bluePrintNode, fontIndex);
            if(originalBluePrintNode !== null)
                itemParentContainer.insertBefore(item, originalBluePrintNode);
            else
                itemParentContainer.appendChild(item);
            items.push(item);
        }
        return items;
    };

    _p._onAllFontsLoaded = function(numberAllFonts) {
        //jshint unused:vars
        var fonts = this._fontsData.getFontIndexesInFamilyOrder()
          , items, i, l
          ;

        for(i=this._contentElements.length-1;i>=0;i--)
            this._contentElements[i].parentNode.removeChild(this._contentElements[i]);

        for(i=0,l=fonts.length;i<l;i++) {
            items = this._createItems(i, fonts);
            Array.prototype.push.apply(this._contentElements, items);
        }
    };


    return PerFont;
});
