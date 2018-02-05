'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//events - a super-basic Javascript (publish subscribe) pattern
/*
  pubsub.on("eventName", handle);
  pubsub.emit("eventName", param);
*/
var pubsub = {
    events: {},
    on: function on(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    off: function off(eventName, fn) {
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    },
    emit: function emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (fn) {
                fn(data);
            });
        }
    }
};

/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    /*if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else*/if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
})(function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice = Array.prototype.slice,
        nullLowestDeltaTimeout,
        lowestDelta;

    if ($.event.fixHooks) {
        for (var i = toFix.length; i;) {
            $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function setup() {
            if (this.addEventListener) {
                for (var i = toBind.length; i;) {
                    this.addEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function teardown() {
            if (this.removeEventListener) {
                for (var i = toBind.length; i;) {
                    this.removeEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function getLineHeight(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function getPageHeight(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function mousewheel(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function unmousewheel(fn) {
            return this.unbind('mousewheel', fn);
        }
    });

    function handler(event) {
        var orgEvent = event || window.event,
            args = slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            offsetX = 0,
            offsetY = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ('detail' in orgEvent) {
            deltaY = orgEvent.detail * -1;
        }
        if ('wheelDelta' in orgEvent) {
            deltaY = orgEvent.wheelDelta;
        }
        if ('wheelDeltaY' in orgEvent) {
            deltaY = orgEvent.wheelDeltaY;
        }
        if ('wheelDeltaX' in orgEvent) {
            deltaX = orgEvent.wheelDeltaX * -1;
        }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ('axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ('deltaY' in orgEvent) {
            deltaY = orgEvent.deltaY * -1;
            delta = deltaY;
        }
        if ('deltaX' in orgEvent) {
            deltaX = orgEvent.deltaX;
            if (deltaY === 0) {
                delta = deltaX * -1;
            }
        }

        // No change actually happened, no reason to go any further
        if (deltaY === 0 && deltaX === 0) {
            return;
        }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if (orgEvent.deltaMode === 1) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if (orgEvent.deltaMode === 2) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

        if (!lowestDelta || absDelta < lowestDelta) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
            // Divide all the things by 40!
            delta /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
        deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
        deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if (special.settings.normalizeOffset && this.getBoundingClientRect) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) {
            clearTimeout(nullLowestDeltaTimeout);
        }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }
});

/*! lightslider - v1.1.6 - 2016-10-25
* https://github.com/sachinchoolur/lightslider
* Copyright (c) 2016 Sachin N; Licensed MIT */
!function (a, b) {
    'use strict';
    var c = { item: 3, autoWidth: !1, slideMove: 1, slideMargin: 10, addClass: '', mode: 'slide', useCSS: !0, cssEasing: 'ease', easing: 'linear', speed: 400, auto: !1, pauseOnHover: !1, loop: !1, slideEndAnimation: !0, pause: 2e3, keyPress: !1, controls: !0, prevHtml: '', nextHtml: '', rtl: !1, adaptiveHeight: !1, vertical: !1, verticalHeight: 500, vThumbWidth: 100, thumbItem: 10, pager: !0, gallery: !1, galleryMargin: 5, thumbMargin: 5, currentPagerPosition: 'middle', enableTouch: !0, enableDrag: !0, freeMove: !0, swipeThreshold: 40, responsive: [], onBeforeStart: function onBeforeStart(a) {}, onSliderLoad: function onSliderLoad(a) {}, onBeforeSlide: function onBeforeSlide(a, b) {}, onAfterSlide: function onAfterSlide(a, b) {}, onBeforeNextSlide: function onBeforeNextSlide(a, b) {}, onBeforePrevSlide: function onBeforePrevSlide(a, b) {} };a.fn.lightSlider = function (b) {
        if (0 === this.length) return this;if (this.length > 1) return this.each(function () {
            a(this).lightSlider(b);
        }), this;var d = {},
            e = a.extend(!0, {}, c, b),
            f = {},
            g = this;d.$el = this, 'fade' === e.mode && (e.vertical = !1);var h = g.children(),
            i = a(window).width(),
            j = null,
            k = null,
            l = 0,
            m = 0,
            n = !1,
            o = 0,
            p = '',
            q = 0,
            r = e.vertical === !0 ? 'height' : 'width',
            s = e.vertical === !0 ? 'margin-bottom' : 'margin-right',
            t = 0,
            u = 0,
            v = 0,
            w = 0,
            x = null,
            y = 'ontouchstart' in document.documentElement,
            z = {};return z.chbreakpoint = function () {
            if (i = a(window).width(), e.responsive.length) {
                var b;if (e.autoWidth === !1 && (b = e.item), i < e.responsive[0].breakpoint) for (var c = 0; c < e.responsive.length; c++) {
                    i < e.responsive[c].breakpoint && (j = e.responsive[c].breakpoint, k = e.responsive[c]);
                }if ('undefined' != typeof k && null !== k) for (var d in k.settings) {
                    k.settings.hasOwnProperty(d) && (('undefined' == typeof f[d] || null === f[d]) && (f[d] = e[d]), e[d] = k.settings[d]);
                }if (!a.isEmptyObject(f) && i > e.responsive[0].breakpoint) for (var g in f) {
                    f.hasOwnProperty(g) && (e[g] = f[g]);
                }e.autoWidth === !1 && t > 0 && v > 0 && b !== e.item && (q = Math.round(t / ((v + e.slideMargin) * e.slideMove)));
            }
        }, z.calSW = function () {
            e.autoWidth === !1 && (v = (o - (e.item * e.slideMargin - e.slideMargin)) / e.item);
        }, z.calWidth = function (a) {
            var b = a === !0 ? p.find('.lslide').length : h.length;if (e.autoWidth === !1) m = b * (v + e.slideMargin);else {
                m = 0;for (var c = 0; b > c; c++) {
                    m += parseInt(h.eq(c).width()) + e.slideMargin;
                }
            }return m;
        }, d = { doCss: function doCss() {
                var a = function a() {
                    for (var a = ['transition', 'MozTransition', 'WebkitTransition', 'OTransition', 'msTransition', 'KhtmlTransition'], b = document.documentElement, c = 0; c < a.length; c++) {
                        if (a[c] in b.style) return !0;
                    }
                };return e.useCSS && a() ? !0 : !1;
            }, keyPress: function keyPress() {
                e.keyPress && a(document).on('keyup.lightslider', function (b) {
                    a(':focus').is('input, textarea') || (b.preventDefault ? b.preventDefault() : b.returnValue = !1, 37 === b.keyCode ? g.goToPrevSlide() : 39 === b.keyCode && g.goToNextSlide());
                });
            }, controls: function controls() {
                e.controls && (g.after('<div class="lSAction"><a class="lSPrev">' + e.prevHtml + '</a><a class="lSNext">' + e.nextHtml + '</a></div>'), e.autoWidth ? z.calWidth(!1) < o && p.find('.lSAction').hide() : l <= e.item && p.find('.lSAction').hide(), p.find('.lSAction a').on('click', function (b) {
                    return b.preventDefault ? b.preventDefault() : b.returnValue = !1, 'lSPrev' === a(this).attr('class') ? g.goToPrevSlide() : g.goToNextSlide(), !1;
                }));
            }, initialStyle: function initialStyle() {
                var a = this;'fade' === e.mode && (e.autoWidth = !1, e.slideEndAnimation = !1), e.auto && (e.slideEndAnimation = !1), e.autoWidth && (e.slideMove = 1, e.item = 1), e.loop && (e.slideMove = 1, e.freeMove = !1), e.onBeforeStart.call(this, g), z.chbreakpoint(), g.addClass('lightSlider').wrap('<div class="lSSlideOuter ' + e.addClass + '"><div class="lSSlideWrapper"></div></div>'), p = g.parent('.lSSlideWrapper'), e.rtl === !0 && p.parent().addClass('lSrtl'), e.vertical ? (p.parent().addClass('vertical'), o = e.verticalHeight, p.css('height', o + 'px')) : o = g.outerWidth(), h.addClass('lslide'), e.loop === !0 && 'slide' === e.mode && (z.calSW(), z.clone = function () {
                    if (z.calWidth(!0) > o) {
                        for (var b = 0, c = 0, d = 0; d < h.length && (b += parseInt(g.find('.lslide').eq(d).width()) + e.slideMargin, c++, !(b >= o + e.slideMargin)); d++) {}var f = e.autoWidth === !0 ? c : e.item;if (f < g.find('.clone.left').length) for (var i = 0; i < g.find('.clone.left').length - f; i++) {
                            h.eq(i).remove();
                        }if (f < g.find('.clone.right').length) for (var j = h.length - 1; j > h.length - 1 - g.find('.clone.right').length; j--) {
                            q--, h.eq(j).remove();
                        }for (var k = g.find('.clone.right').length; f > k; k++) {
                            g.find('.lslide').eq(k).clone().removeClass('lslide').addClass('clone right').appendTo(g), q++;
                        }for (var l = g.find('.lslide').length - g.find('.clone.left').length; l > g.find('.lslide').length - f; l--) {
                            g.find('.lslide').eq(l - 1).clone().removeClass('lslide').addClass('clone left').prependTo(g);
                        }h = g.children();
                    } else h.hasClass('clone') && (g.find('.clone').remove(), a.move(g, 0));
                }, z.clone()), z.sSW = function () {
                    l = h.length, e.rtl === !0 && e.vertical === !1 && (s = 'margin-left'), e.autoWidth === !1 && h.css(r, v + 'px'), h.css(s, e.slideMargin + 'px'), m = z.calWidth(!1), g.css(r, m + 'px'), e.loop === !0 && 'slide' === e.mode && n === !1 && (q = g.find('.clone.left').length);
                }, z.calL = function () {
                    h = g.children(), l = h.length;
                }, this.doCss() && p.addClass('usingCss'), z.calL(), 'slide' === e.mode ? (z.calSW(), z.sSW(), e.loop === !0 && (t = a.slideValue(), this.move(g, t)), e.vertical === !1 && this.setHeight(g, !1)) : (this.setHeight(g, !0), g.addClass('lSFade'), this.doCss() || (h.fadeOut(0), h.eq(q).fadeIn(0))), e.loop === !0 && 'slide' === e.mode ? h.eq(q).addClass('active') : h.first().addClass('active');
            }, pager: function pager() {
                var a = this;if (z.createPager = function () {
                    w = (o - (e.thumbItem * e.thumbMargin - e.thumbMargin)) / e.thumbItem;var b = p.find('.lslide'),
                        c = p.find('.lslide').length,
                        d = 0,
                        f = '',
                        h = 0;for (d = 0; c > d; d++) {
                        'slide' === e.mode && (e.autoWidth ? h += (parseInt(b.eq(d).width()) + e.slideMargin) * e.slideMove : h = d * (v + e.slideMargin) * e.slideMove);var i = b.eq(d * e.slideMove).attr('data-thumb');if (f += e.gallery === !0 ? '<li style="width:100%;' + r + ':' + w + 'px;' + s + ':' + e.thumbMargin + 'px"><a href="#"><img src="' + i + '" /></a></li>' : '<li><a href="#">' + (d + 1) + '</a></li>', 'slide' === e.mode && h >= m - o - e.slideMargin) {
                            d += 1;var j = 2;e.autoWidth && (f += '<li><a href="#">' + (d + 1) + '</a></li>', j = 1), j > d ? (f = null, p.parent().addClass('noPager')) : p.parent().removeClass('noPager');break;
                        }
                    }var k = p.parent();k.find('.lSPager').html(f), e.gallery === !0 && (e.vertical === !0 && k.find('.lSPager').css('width', e.vThumbWidth + 'px'), u = d * (e.thumbMargin + w) + .5, k.find('.lSPager').css({ property: u + 'px', 'transition-duration': e.speed + 'ms' }), e.vertical === !0 && p.parent().css('padding-right', e.vThumbWidth + e.galleryMargin + 'px'), k.find('.lSPager').css(r, u + 'px'));var l = k.find('.lSPager').find('li');l.first().addClass('active'), l.on('click', function () {
                        return e.loop === !0 && 'slide' === e.mode ? q += l.index(this) - k.find('.lSPager').find('li.active').index() : q = l.index(this), g.mode(!1), e.gallery === !0 && a.slideThumb(), !1;
                    });
                }, e.pager) {
                    var b = 'lSpg';e.gallery && (b = 'lSGallery'), p.after('<ul class="lSPager ' + b + '"></ul>');var c = e.vertical ? 'margin-left' : 'margin-top';p.parent().find('.lSPager').css(c, e.galleryMargin + 'px'), z.createPager();
                }setTimeout(function () {
                    z.init();
                }, 0);
            }, setHeight: function setHeight(a, b) {
                var c = null,
                    d = this;c = e.loop ? a.children('.lslide ').first() : a.children().first();var f = function f() {
                    var d = c.outerHeight(),
                        e = 0,
                        f = d;b && (d = 0, e = 100 * f / o), a.css({ height: d + 'px', 'padding-bottom': e + '%' });
                };f(), c.find('img').length ? c.find('img')[0].complete ? (f(), x || d.auto()) : c.find('img').on('load', function () {
                    setTimeout(function () {
                        f(), x || d.auto();
                    }, 100);
                }) : x || d.auto();
            }, active: function active(a, b) {
                this.doCss() && 'fade' === e.mode && p.addClass('on');var c = 0;if (q * e.slideMove < l) {
                    a.removeClass('active'), this.doCss() || 'fade' !== e.mode || b !== !1 || a.fadeOut(e.speed), c = b === !0 ? q : q * e.slideMove;var d, f;b === !0 && (d = a.length, f = d - 1, c + 1 >= d && (c = f)), e.loop === !0 && 'slide' === e.mode && (c = b === !0 ? q - g.find('.clone.left').length : q * e.slideMove, b === !0 && (d = a.length, f = d - 1, c + 1 === d ? c = f : c + 1 > d && (c = 0))), this.doCss() || 'fade' !== e.mode || b !== !1 || a.eq(c).fadeIn(e.speed), a.eq(c).addClass('active');
                } else a.removeClass('active'), a.eq(a.length - 1).addClass('active'), this.doCss() || 'fade' !== e.mode || b !== !1 || (a.fadeOut(e.speed), a.eq(c).fadeIn(e.speed));
            }, move: function move(a, b) {
                e.rtl === !0 && (b = -b), this.doCss() ? a.css(e.vertical === !0 ? { transform: 'translate3d(0px, ' + -b + 'px, 0px)', '-webkit-transform': 'translate3d(0px, ' + -b + 'px, 0px)' } : { transform: 'translate3d(' + -b + 'px, 0px, 0px)', '-webkit-transform': 'translate3d(' + -b + 'px, 0px, 0px)' }) : e.vertical === !0 ? a.css('position', 'relative').animate({ top: -b + 'px' }, e.speed, e.easing) : a.css('position', 'relative').animate({ left: -b + 'px' }, e.speed, e.easing);var c = p.parent().find('.lSPager').find('li');this.active(c, !0);
            }, fade: function fade() {
                this.active(h, !1);var a = p.parent().find('.lSPager').find('li');this.active(a, !0);
            }, slide: function slide() {
                var a = this;z.calSlide = function () {
                    m > o && (t = a.slideValue(), a.active(h, !1), t > m - o - e.slideMargin ? t = m - o - e.slideMargin : 0 > t && (t = 0), a.move(g, t), e.loop === !0 && 'slide' === e.mode && (q >= l - g.find('.clone.left').length / e.slideMove && a.resetSlide(g.find('.clone.left').length), 0 === q && a.resetSlide(p.find('.lslide').length)));
                }, z.calSlide();
            }, resetSlide: function resetSlide(a) {
                var b = this;p.find('.lSAction a').addClass('disabled'), setTimeout(function () {
                    q = a, p.css('transition-duration', '0ms'), t = b.slideValue(), b.active(h, !1), d.move(g, t), setTimeout(function () {
                        p.css('transition-duration', e.speed + 'ms'), p.find('.lSAction a').removeClass('disabled');
                    }, 50);
                }, e.speed + 100);
            }, slideValue: function slideValue() {
                var a = 0;if (e.autoWidth === !1) a = q * (v + e.slideMargin) * e.slideMove;else {
                    a = 0;for (var b = 0; q > b; b++) {
                        a += parseInt(h.eq(b).width()) + e.slideMargin;
                    }
                }return a;
            }, slideThumb: function slideThumb() {
                var a;switch (e.currentPagerPosition) {case 'left':
                        a = 0;break;case 'middle':
                        a = o / 2 - w / 2;break;case 'right':
                        a = o - w;}var b = q - g.find('.clone.left').length,
                    c = p.parent().find('.lSPager');'slide' === e.mode && e.loop === !0 && (b >= c.children().length ? b = 0 : 0 > b && (b = c.children().length));var d = b * (w + e.thumbMargin) - a;d + o > u && (d = u - o - e.thumbMargin), 0 > d && (d = 0), this.move(c, d);
            }, auto: function auto() {
                e.auto && (clearInterval(x), x = setInterval(function () {
                    g.goToNextSlide();
                }, e.pause));
            }, pauseOnHover: function pauseOnHover() {
                var b = this;e.auto && e.pauseOnHover && (p.on('mouseenter', function () {
                    a(this).addClass('ls-hover'), g.pause(), e.auto = !0;
                }), p.on('mouseleave', function () {
                    a(this).removeClass('ls-hover'), p.find('.lightSlider').hasClass('lsGrabbing') || b.auto();
                }));
            }, touchMove: function touchMove(a, b) {
                if (p.css('transition-duration', '0ms'), 'slide' === e.mode) {
                    var c = a - b,
                        d = t - c;if (d >= m - o - e.slideMargin) {
                        if (e.freeMove === !1) d = m - o - e.slideMargin;else {
                            var f = m - o - e.slideMargin;d = f + (d - f) / 5;
                        }
                    } else 0 > d && (e.freeMove === !1 ? d = 0 : d /= 5);this.move(g, d);
                }
            }, touchEnd: function touchEnd(a) {
                if (p.css('transition-duration', e.speed + 'ms'), 'slide' === e.mode) {
                    var b = !1,
                        c = !0;t -= a, t > m - o - e.slideMargin ? (t = m - o - e.slideMargin, e.autoWidth === !1 && (b = !0)) : 0 > t && (t = 0);var d = function d(a) {
                        var c = 0;if (b || a && (c = 1), e.autoWidth) for (var d = 0, f = 0; f < h.length && (d += parseInt(h.eq(f).width()) + e.slideMargin, q = f + c, !(d >= t)); f++) {} else {
                            var g = t / ((v + e.slideMargin) * e.slideMove);q = parseInt(g) + c, t >= m - o - e.slideMargin && g % 1 !== 0 && q++;
                        }
                    };a >= e.swipeThreshold ? (d(!1), c = !1) : a <= -e.swipeThreshold && (d(!0), c = !1), g.mode(c), this.slideThumb();
                } else a >= e.swipeThreshold ? g.goToPrevSlide() : a <= -e.swipeThreshold && g.goToNextSlide();
            }, enableDrag: function enableDrag() {
                var b = this;if (!y) {
                    var c = 0,
                        d = 0,
                        f = !1;p.find('.lightSlider').addClass('lsGrab'), p.on('mousedown', function (b) {
                        return o > m && 0 !== m ? !1 : void ('lSPrev' !== a(b.target).attr('class') && 'lSNext' !== a(b.target).attr('class') && (c = e.vertical === !0 ? b.pageY : b.pageX, f = !0, b.preventDefault ? b.preventDefault() : b.returnValue = !1, p.scrollLeft += 1, p.scrollLeft -= 1, p.find('.lightSlider').removeClass('lsGrab').addClass('lsGrabbing'), clearInterval(x)));
                    }), a(window).on('mousemove', function (a) {
                        f && (d = e.vertical === !0 ? a.pageY : a.pageX, b.touchMove(d, c));
                    }), a(window).on('mouseup', function (g) {
                        if (f) {
                            p.find('.lightSlider').removeClass('lsGrabbing').addClass('lsGrab'), f = !1, d = e.vertical === !0 ? g.pageY : g.pageX;var h = d - c;Math.abs(h) >= e.swipeThreshold && a(window).on('click.ls', function (b) {
                                b.preventDefault ? b.preventDefault() : b.returnValue = !1, b.stopImmediatePropagation(), b.stopPropagation(), a(window).off('click.ls');
                            }), b.touchEnd(h);
                        }
                    });
                }
            }, enableTouch: function enableTouch() {
                var a = this;if (y) {
                    var b = {},
                        c = {};p.on('touchstart', function (a) {
                        c = a.originalEvent.targetTouches[0], b.pageX = a.originalEvent.targetTouches[0].pageX, b.pageY = a.originalEvent.targetTouches[0].pageY, clearInterval(x);
                    }), p.on('touchmove', function (d) {
                        if (o > m && 0 !== m) return !1;var f = d.originalEvent;c = f.targetTouches[0];var g = Math.abs(c.pageX - b.pageX),
                            h = Math.abs(c.pageY - b.pageY);e.vertical === !0 ? (3 * h > g && d.preventDefault(), a.touchMove(c.pageY, b.pageY)) : (3 * g > h && d.preventDefault(), a.touchMove(c.pageX, b.pageX));
                    }), p.on('touchend', function () {
                        if (o > m && 0 !== m) return !1;var d;d = e.vertical === !0 ? c.pageY - b.pageY : c.pageX - b.pageX, a.touchEnd(d);
                    });
                }
            }, build: function build() {
                var b = this;b.initialStyle(), this.doCss() && (e.enableTouch === !0 && b.enableTouch(), e.enableDrag === !0 && b.enableDrag()), a(window).on('focus', function () {
                    b.auto();
                }), a(window).on('blur', function () {
                    clearInterval(x);
                }), b.pager(), b.pauseOnHover(), b.controls(), b.keyPress();
            } }, d.build(), z.init = function () {
            z.chbreakpoint(), e.vertical === !0 ? (o = e.item > 1 ? e.verticalHeight : h.outerHeight(), p.css('height', o + 'px')) : o = p.outerWidth(), e.loop === !0 && 'slide' === e.mode && z.clone(), z.calL(), 'slide' === e.mode && g.removeClass('lSSlide'), 'slide' === e.mode && (z.calSW(), z.sSW()), setTimeout(function () {
                'slide' === e.mode && g.addClass('lSSlide');
            }, 1e3), e.pager && z.createPager(), e.adaptiveHeight === !0 && e.vertical === !1 && g.css('height', h.eq(q).outerHeight(!0)), e.adaptiveHeight === !1 && ('slide' === e.mode ? e.vertical === !1 ? d.setHeight(g, !1) : d.auto() : d.setHeight(g, !0)), e.gallery === !0 && d.slideThumb(), 'slide' === e.mode && d.slide(), e.autoWidth === !1 ? h.length <= e.item ? p.find('.lSAction').hide() : p.find('.lSAction').show() : z.calWidth(!1) < o && 0 !== m ? p.find('.lSAction').hide() : p.find('.lSAction').show();
        }, g.goToPrevSlide = function () {
            if (q > 0) e.onBeforePrevSlide.call(this, g, q), q--, g.mode(!1), e.gallery === !0 && d.slideThumb();else if (e.loop === !0) {
                if (e.onBeforePrevSlide.call(this, g, q), 'fade' === e.mode) {
                    var a = l - 1;q = parseInt(a / e.slideMove);
                }g.mode(!1), e.gallery === !0 && d.slideThumb();
            } else e.slideEndAnimation === !0 && (g.addClass('leftEnd'), setTimeout(function () {
                g.removeClass('leftEnd');
            }, 400));
        }, g.goToNextSlide = function () {
            var a = !0;if ('slide' === e.mode) {
                var b = d.slideValue();a = b < m - o - e.slideMargin;
            }q * e.slideMove < l - e.slideMove && a ? (e.onBeforeNextSlide.call(this, g, q), q++, g.mode(!1), e.gallery === !0 && d.slideThumb()) : e.loop === !0 ? (e.onBeforeNextSlide.call(this, g, q), q = 0, g.mode(!1), e.gallery === !0 && d.slideThumb()) : e.slideEndAnimation === !0 && (g.addClass('rightEnd'), setTimeout(function () {
                g.removeClass('rightEnd');
            }, 400));
        }, g.mode = function (a) {
            e.adaptiveHeight === !0 && e.vertical === !1 && g.css('height', h.eq(q).outerHeight(!0)), n === !1 && ('slide' === e.mode ? d.doCss() && (g.addClass('lSSlide'), '' !== e.speed && p.css('transition-duration', e.speed + 'ms'), '' !== e.cssEasing && p.css('transition-timing-function', e.cssEasing)) : d.doCss() && ('' !== e.speed && g.css('transition-duration', e.speed + 'ms'), '' !== e.cssEasing && g.css('transition-timing-function', e.cssEasing))), a || e.onBeforeSlide.call(this, g, q), 'slide' === e.mode ? d.slide() : d.fade(), p.hasClass('ls-hover') || d.auto(), setTimeout(function () {
                a || e.onAfterSlide.call(this, g, q);
            }, e.speed), n = !0;
        }, g.play = function () {
            g.goToNextSlide(), e.auto = !0, d.auto();
        }, g.pause = function () {
            e.auto = !1, clearInterval(x);
        }, g.refresh = function () {
            z.init();
        }, g.getCurrentSlideCount = function () {
            var a = q;if (e.loop) {
                var b = p.find('.lslide').length,
                    c = g.find('.clone.left').length;a = c - 1 >= q ? b + (q - c) : q >= b + c ? q - b - c : q - c;
            }return a + 1;
        }, g.getTotalSlideCount = function () {
            return p.find('.lslide').length;
        }, g.goToSlide = function (a) {
            q = e.loop ? a + g.find('.clone.left').length - 1 : a, g.mode(!1), e.gallery === !0 && d.slideThumb();
        }, g.destroy = function () {
            g.lightSlider && (g.goToPrevSlide = function () {}, g.goToNextSlide = function () {}, g.mode = function () {}, g.play = function () {}, g.pause = function () {}, g.refresh = function () {}, g.getCurrentSlideCount = function () {}, g.getTotalSlideCount = function () {}, g.goToSlide = function () {}, g.lightSlider = null, z = { init: function init() {} }, g.parent().parent().find('.lSAction, .lSPager').remove(), g.removeClass('lightSlider lSFade lSSlide lsGrab lsGrabbing leftEnd right').removeAttr('style').unwrap().unwrap(), g.children().removeAttr('style'), h.removeClass('lslide active'), g.find('.clone').remove(), h = null, x = null, n = !1, q = 0);
        }, setTimeout(function () {
            e.onSliderLoad.call(this, g);
        }, 10), a(window).on('resize orientationchange', function (a) {
            setTimeout(function () {
                a.preventDefault ? a.preventDefault() : a.returnValue = !1, z.init();
            }, 200);
        }), this;
    };
}(jQuery);

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
*/
jQuery.easing.jswing = jQuery.easing.swing;jQuery.extend(jQuery.easing, { def: 'easeOutQuad', swing: function swing(e, f, a, h, g) {
        return jQuery.easing[jQuery.easing.def](e, f, a, h, g);
    }, easeInQuad: function easeInQuad(e, f, a, h, g) {
        return h * (f /= g) * f + a;
    }, easeOutQuad: function easeOutQuad(e, f, a, h, g) {
        return -h * (f /= g) * (f - 2) + a;
    }, easeInOutQuad: function easeInOutQuad(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f + a;
        }return -h / 2 * (--f * (f - 2) - 1) + a;
    }, easeInCubic: function easeInCubic(e, f, a, h, g) {
        return h * (f /= g) * f * f + a;
    }, easeOutCubic: function easeOutCubic(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f + 1) + a;
    }, easeInOutCubic: function easeInOutCubic(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f + a;
        }return h / 2 * ((f -= 2) * f * f + 2) + a;
    }, easeInQuart: function easeInQuart(e, f, a, h, g) {
        return h * (f /= g) * f * f * f + a;
    }, easeOutQuart: function easeOutQuart(e, f, a, h, g) {
        return -h * ((f = f / g - 1) * f * f * f - 1) + a;
    }, easeInOutQuart: function easeInOutQuart(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f + a;
        }return -h / 2 * ((f -= 2) * f * f * f - 2) + a;
    }, easeInQuint: function easeInQuint(e, f, a, h, g) {
        return h * (f /= g) * f * f * f * f + a;
    }, easeOutQuint: function easeOutQuint(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f * f * f + 1) + a;
    }, easeInOutQuint: function easeInOutQuint(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f * f + a;
        }return h / 2 * ((f -= 2) * f * f * f * f + 2) + a;
    }, easeInSine: function easeInSine(e, f, a, h, g) {
        return -h * Math.cos(f / g * (Math.PI / 2)) + h + a;
    }, easeOutSine: function easeOutSine(e, f, a, h, g) {
        return h * Math.sin(f / g * (Math.PI / 2)) + a;
    }, easeInOutSine: function easeInOutSine(e, f, a, h, g) {
        return -h / 2 * (Math.cos(Math.PI * f / g) - 1) + a;
    }, easeInExpo: function easeInExpo(e, f, a, h, g) {
        return f == 0 ? a : h * Math.pow(2, 10 * (f / g - 1)) + a;
    }, easeOutExpo: function easeOutExpo(e, f, a, h, g) {
        return f == g ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a;
    }, easeInOutExpo: function easeInOutExpo(e, f, a, h, g) {
        if (f == 0) {
            return a;
        }if (f == g) {
            return a + h;
        }if ((f /= g / 2) < 1) {
            return h / 2 * Math.pow(2, 10 * (f - 1)) + a;
        }return h / 2 * (-Math.pow(2, -10 * --f) + 2) + a;
    }, easeInCirc: function easeInCirc(e, f, a, h, g) {
        return -h * (Math.sqrt(1 - (f /= g) * f) - 1) + a;
    }, easeOutCirc: function easeOutCirc(e, f, a, h, g) {
        return h * Math.sqrt(1 - (f = f / g - 1) * f) + a;
    }, easeInOutCirc: function easeInOutCirc(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return -h / 2 * (Math.sqrt(1 - f * f) - 1) + a;
        }return h / 2 * (Math.sqrt(1 - (f -= 2) * f) + 1) + a;
    }, easeInElastic: function easeInElastic(f, h, e, l, k) {
        var i = 1.70158;var j = 0;var g = l;if (h == 0) {
            return e;
        }if ((h /= k) == 1) {
            return e + l;
        }if (!j) {
            j = k * 0.3;
        }if (g < Math.abs(l)) {
            g = l;var i = j / 4;
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g);
        }return -(g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e;
    }, easeOutElastic: function easeOutElastic(f, h, e, l, k) {
        var i = 1.70158;var j = 0;var g = l;if (h == 0) {
            return e;
        }if ((h /= k) == 1) {
            return e + l;
        }if (!j) {
            j = k * 0.3;
        }if (g < Math.abs(l)) {
            g = l;var i = j / 4;
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g);
        }return g * Math.pow(2, -10 * h) * Math.sin((h * k - i) * (2 * Math.PI) / j) + l + e;
    }, easeInOutElastic: function easeInOutElastic(f, h, e, l, k) {
        var i = 1.70158;var j = 0;var g = l;if (h == 0) {
            return e;
        }if ((h /= k / 2) == 2) {
            return e + l;
        }if (!j) {
            j = k * (0.3 * 1.5);
        }if (g < Math.abs(l)) {
            g = l;var i = j / 4;
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g);
        }if (h < 1) {
            return -0.5 * (g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e;
        }return g * Math.pow(2, -10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j) * 0.5 + l + e;
    }, easeInBack: function easeInBack(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158;
        }return i * (f /= h) * f * ((g + 1) * f - g) + a;
    }, easeOutBack: function easeOutBack(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158;
        }return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a;
    }, easeInOutBack: function easeInOutBack(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158;
        }if ((f /= h / 2) < 1) {
            return i / 2 * (f * f * (((g *= 1.525) + 1) * f - g)) + a;
        }return i / 2 * ((f -= 2) * f * (((g *= 1.525) + 1) * f + g) + 2) + a;
    }, easeInBounce: function easeInBounce(e, f, a, h, g) {
        return h - jQuery.easing.easeOutBounce(e, g - f, 0, h, g) + a;
    }, easeOutBounce: function easeOutBounce(e, f, a, h, g) {
        if ((f /= g) < 1 / 2.75) {
            return h * (7.5625 * f * f) + a;
        } else {
            if (f < 2 / 2.75) {
                return h * (7.5625 * (f -= 1.5 / 2.75) * f + 0.75) + a;
            } else {
                if (f < 2.5 / 2.75) {
                    return h * (7.5625 * (f -= 2.25 / 2.75) * f + 0.9375) + a;
                } else {
                    return h * (7.5625 * (f -= 2.625 / 2.75) * f + 0.984375) + a;
                }
            }
        }
    }, easeInOutBounce: function easeInOutBounce(e, f, a, h, g) {
        if (f < g / 2) {
            return jQuery.easing.easeInBounce(e, f * 2, 0, h, g) * 0.5 + a;
        }return jQuery.easing.easeOutBounce(e, f * 2 - g, 0, h, g) * 0.5 + h * 0.5 + a;
    } });

(function () {
    var hidden = 'hidden';

    // Standards:
    if (hidden in document) document.addEventListener('visibilitychange', onchange);else if ((hidden = 'mozHidden') in document) document.addEventListener('mozvisibilitychange', onchange);else if ((hidden = 'webkitHidden') in document) document.addEventListener('webkitvisibilitychange', onchange);else if ((hidden = 'msHidden') in document) document.addEventListener('msvisibilitychange', onchange);
    // IE 9 and lower:
    else if ('onfocusin' in document) document.onfocusin = document.onfocusout = onchange;
        // All others:
        else window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

    function onchange(evt) {
        var v = 'visible',
            h = 'hidden',
            evtMap = {
            focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
        };

        if (this && this[hidden]) {
            pubsub.emit('windowHidden');
        } else {
            pubsub.emit('windowVisible');
        }

        /*evt = evt || window.event;
        if (evt.type in evtMap)
          document.body.className = evtMap[evt.type];
        else
          document.body.className = this[hidden] ? "hidden" : "visible";
        */
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if (document[hidden] !== undefined) onchange({ type: document[hidden] ? 'blur' : 'focus' });
})();
//# sourceMappingURL=plugins.js.map

'use strict';

var particleAlphabet = function particleAlphabet() {
	var _this = this;
	var $window = $(window);
	var _timer;
	var _delay = 3000;
	var _particlesLength = 1350;
	var _grid = 16;
	var _ease = 0.1;
	var currentPos = 0;
	var cb;
	var listening = false;

	this.init = function (_canvas, _letters, _font, _color, _fontSize, _cb) {
		cb = _cb;
		_this.LETTERS = _letters.split('');
		_this.font = _font;
		_this.fontSize = _fontSize;
		_this.color = _color;
		_this.radius = parseFloat(_grid / 2.3);
		if (_color == '#ffdc2d' || _color == '#eb212e') _this.radius += 0.4;
		_this.canvas = document.querySelector(_canvas);
		_this.ctx = _this.canvas.getContext('2d');
		_this.W = window.innerWidth;
		_this.H = window.innerHeight;
		_this.particlePositionsByLetter = [];
		_this.currentParticlePositionsLetter = [];
		_this.particles = [];
		_this.tmpCanvas = document.createElement('canvas');
		_this.tmpCtx = _this.tmpCanvas.getContext('2d');

		_this.canvas.width = _this.W;
		_this.canvas.height = _this.H;

		var x = -_this.W / 2;
		var y = -_this.H / 2;

		_this.render();
	};

	this.render = function () {
		_this.generateCoords();
		_this.makeParticles(_particlesLength);
	};

	this.makeParticles = function (num) {
		for (var i = 0; i <= num; i++) {
			_this.particles.push(new Particle(_this.H / 2 + Math.random() * 400, _this.W / 2 + Math.random() * 400, _this.color, _this.radius));
		}
	};

	this.generateCoords = function () {
		for (var i in _this.LETTERS) {
			_this.getPixels(_this.tmpCanvas, _this.tmpCtx, _this.LETTERS[i]);
		}

		cb();
	};

	this.getPixels = function (canvas, ctx, word) {
		var gridX = _grid,
		    gridY = _grid;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		ctx.font = _this.font;
		var metrics = ctx.measureText(word);

		ctx.fillText(word, canvas.width / 2 - metrics.width / 2, canvas.height / 2 + (_this.fontSize - 100) / 2);

		if (_this.particlePositionsByLetter.length < _this.LETTERS.length) {
			var idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
			var buffer32 = new Uint32Array(idata.data.buffer);

			var a = [];

			for (var y = 0; y < canvas.height; y += gridY) {
				for (var x = 0; x < canvas.width; x += gridX) {
					if (buffer32[y * canvas.width + x]) {
						a.push({ x: x, y: y });
					}
				}
			}
			_this.particlePositionsByLetter.push(a);
		}
	};

	this.launch = function () {
		$('canvas').show();
		movable = true;
		_this.play();
		_this.animate();
		if (!listening) _this.listeners();
	};

	this.play = function () {
		currentPos = 0;
		movable = true;
		_this.changeLetter();
	};

	this.pause = function () {
		if (_timer) clearInterval(_timer);
	};

	this.listeners = function () {
		listening = true;
		pubsub.on('animationIn', function () {
			cb();
		});

		pubsub.on('animationOut', function () {
			_this.pause();
		});

		pubsub.on('windowVisible', function () {
			if ($(window).scrollTop() == 0) {
				cb();
			}
		});

		pubsub.on('windowHidden', function () {
			_this.pause();
			$('canvas').hide();
		});

		pubsub.on('animationForward', function () {
			_this.changeLetter();
		});
	};

	this.changeLetter = function () {
		if (currentPos >= this.LETTERS.length) {
			currentPos = 0;
		}

		_this.currentParticlePositionsLetter = _this.particlePositionsByLetter[currentPos];

		currentPos++;
	};

	this.animateParticles = function () {
		var particle, pPos, newX, newY;

		for (var i = 0, num = _this.particles.length; i < num; i++) {
			particle = _this.particles[i];
			pPos = _this.currentParticlePositionsLetter[i];
			if (_this.particles.indexOf(particle) === _this.currentParticlePositionsLetter.indexOf(pPos)) {

				newX = (pPos.x - particle.x) * _ease;
				newY = (pPos.y - particle.y) * _ease;

				particle.x += newX;
				particle.y += newY;

				particle.draw(_this.ctx);

				particle.moving = true;
			}
		}
	};

	this.animate = function () {
		window.requestAnimationFrame(_this.animate);
		_this.ctx.clearRect(0, 0, _this.W, _this.H);
		_this.animateParticles();
	};
};

var movable = false;
var Particle = function Particle(x, y, color, radius) {
	this.x = x;
	this.y = y;
	this.radius = radius;

	this.draw = function (ctx) {
		if (!this.moving) {
			return;
		}
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = color;
		ctx.fill();
	};
};

var fps = 15;
// shim layer with setTimeout fallback
window.requestAnimFrame = function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
		window.setTimeout(callback, 1000 / fps);
	};
}();
//# sourceMappingURL=particleAlphabet.js.map

'use strict';

var scrollUtils = function () {

    var self;
    var prev_st = 0;

    pubsub.on('windowLoaded', init);
    //init()

    function init() {
        handle_body_scroll();
        handle_hz_scroll();
    }

    function handle_body_scroll() {
        $(window).scroll(function () {
            self = this;

            if ($(window).scrollTop() == 0) {
                $('.header').removeClass('slideTop');
            } else {
                $('.header').addClass('slideTop');
            }

            clearTimeout($.data(self, '____scrollTimer'));
            $.data(self, '____scrollTimer', setTimeout(function () {
                if ($(window).scrollTop() == 0) {
                    pubsub.emit('animationIn');
                } else {
                    pubsub.emit('animationOut');
                }
            }, 250));

            prev_st = $(window).scrollTop();
        });
    }

    function handle_hz_scroll() {
        var sectionW = ww - 60;
        $('html.no-touch').on('mousewheel DOMMouseScroll', '.scroll-hz', function (event, delta) {

            if ($(this).parents('section').hasClass('active')) {
                this.scrollLeft -= delta * 1;
                if (this.scrollLeft > 0 && this.scrollLeft + sectionW < this.scrollWidth) {
                    //console.log('ok')
                    event.preventDefault();
                }
            }
        });
    }
}();
//# sourceMappingURL=scroll-utils.js.map

'use strict';

var ww, wh;
jQuery(document).ready(function ($) {

	init();

	function init() {
		format();
	}
});

$(window).load(function () {
	pubsub.emit('windowLoaded');
});

$(window).resize(function () {
	format();
});

function format() {
	ww = $(window).width();
	wh = $(window).height();
}
//# sourceMappingURL=main.js.map
