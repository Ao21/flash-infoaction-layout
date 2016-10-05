'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*
 * Anime v1.1.1
 * http://anime-js.com
 * JavaScript animation engine
 * Copyright (c) 2016 Julian Garnier
 * http://juliangarnier.com
 * Released under the MIT license
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    window.anime = factory();
  }
})(undefined, function () {

  var version = '1.1.1';

  // Defaults

  var defaultSettings = {
    duration: 1000,
    delay: 0,
    loop: false,
    autoplay: true,
    direction: 'normal',
    easing: 'easeOutElastic',
    elasticity: 400,
    round: false,
    begin: undefined,
    update: undefined,
    complete: undefined
  };

  // Transforms

  var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY'];
  var transform,
      transformStr = 'transform';

  // Utils

  var is = {
    arr: function arr(a) {
      return Array.isArray(a);
    },
    obj: function obj(a) {
      return Object.prototype.toString.call(a).indexOf('Object') > -1;
    },
    svg: function svg(a) {
      return a instanceof SVGElement;
    },
    dom: function dom(a) {
      return a.nodeType || is.svg(a);
    },
    num: function num(a) {
      return !isNaN(parseInt(a));
    },
    str: function str(a) {
      return typeof a === 'string';
    },
    fnc: function fnc(a) {
      return typeof a === 'function';
    },
    und: function und(a) {
      return typeof a === 'undefined';
    },
    nul: function nul(a) {
      return typeof a === 'null';
    },
    hex: function hex(a) {
      return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)
      );
    },
    rgb: function rgb(a) {
      return (/^rgb/.test(a)
      );
    },
    hsl: function hsl(a) {
      return (/^hsl/.test(a)
      );
    },
    col: function col(a) {
      return is.hex(a) || is.rgb(a) || is.hsl(a);
    }
  };

  // Easings functions adapted from http://jqueryui.com/

  var easings = function () {
    var eases = {};
    var names = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];
    var functions = {
      Sine: function Sine(t) {
        return 1 - Math.cos(t * Math.PI / 2);
      },
      Circ: function Circ(t) {
        return 1 - Math.sqrt(1 - t * t);
      },
      Elastic: function Elastic(t, m) {
        if (t === 0 || t === 1) return t;
        var p = 1 - Math.min(m, 998) / 1000,
            st = t / 1,
            st1 = st - 1,
            s = p / (2 * Math.PI) * Math.asin(1);
        return -(Math.pow(2, 10 * st1) * Math.sin((st1 - s) * (2 * Math.PI) / p));
      },
      Back: function Back(t) {
        return t * t * (3 * t - 2);
      },
      Bounce: function Bounce(t) {
        var pow2,
            bounce = 4;
        while (t < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
      }
    };
    names.forEach(function (name, i) {
      functions[name] = function (t) {
        return Math.pow(t, i + 2);
      };
    });
    Object.keys(functions).forEach(function (name) {
      var easeIn = functions[name];
      eases['easeIn' + name] = easeIn;
      eases['easeOut' + name] = function (t, m) {
        return 1 - easeIn(1 - t, m);
      };
      eases['easeInOut' + name] = function (t, m) {
        return t < 0.5 ? easeIn(t * 2, m) / 2 : 1 - easeIn(t * -2 + 2, m) / 2;
      };
      eases['easeOutIn' + name] = function (t, m) {
        return t < 0.5 ? (1 - easeIn(1 - 2 * t, m)) / 2 : (easeIn(t * 2 - 1, m) + 1) / 2;
      };
    });
    eases.linear = function (t) {
      return t;
    };
    return eases;
  }();

  // Strings

  var numberToString = function numberToString(val) {
    return is.str(val) ? val : val + '';
  };

  var stringToHyphens = function stringToHyphens(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  };

  var selectString = function selectString(str) {
    if (is.col(str)) return false;
    try {
      var nodes = document.querySelectorAll(str);
      return nodes;
    } catch (e) {
      return false;
    }
  };

  // Numbers

  var random = function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Arrays

  var flattenArray = function flattenArray(arr) {
    return arr.reduce(function (a, b) {
      return a.concat(is.arr(b) ? flattenArray(b) : b);
    }, []);
  };

  var toArray = function toArray(o) {
    if (is.arr(o)) return o;
    if (is.str(o)) o = selectString(o) || o;
    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
    return [o];
  };

  var arrayContains = function arrayContains(arr, val) {
    return arr.some(function (a) {
      return a === val;
    });
  };

  var groupArrayByProps = function groupArrayByProps(arr, propsArr) {
    var groups = {};
    arr.forEach(function (o) {
      var group = JSON.stringify(propsArr.map(function (p) {
        return o[p];
      }));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
      return groups[group];
    });
  };

  var removeArrayDuplicates = function removeArrayDuplicates(arr) {
    return arr.filter(function (item, pos, self) {
      return self.indexOf(item) === pos;
    });
  };

  // Objects

  var cloneObject = function cloneObject(o) {
    var newObject = {};
    for (var p in o) {
      newObject[p] = o[p];
    }return newObject;
  };

  var mergeObjects = function mergeObjects(o1, o2) {
    for (var p in o2) {
      o1[p] = !is.und(o1[p]) ? o1[p] : o2[p];
    }return o1;
  };

  // Colors

  var hexToRgb = function hexToRgb(hex) {
    var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = hex.replace(rgx, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r = parseInt(rgb[1], 16);
    var g = parseInt(rgb[2], 16);
    var b = parseInt(rgb[3], 16);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  var hslToRgb = function hslToRgb(hsl) {
    var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hsl);
    var h = parseInt(hsl[1]) / 360;
    var s = parseInt(hsl[2]) / 100;
    var l = parseInt(hsl[3]) / 100;
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    var r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return 'rgb(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ')';
  };

  var colorToRgb = function colorToRgb(val) {
    if (is.rgb(val)) return val;
    if (is.hex(val)) return hexToRgb(val);
    if (is.hsl(val)) return hslToRgb(val);
  };

  // Units

  var getUnit = function getUnit(val) {
    return (/([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(val)[2]
    );
  };

  var addDefaultTransformUnit = function addDefaultTransformUnit(prop, val, intialVal) {
    if (getUnit(val)) return val;
    if (prop.indexOf('translate') > -1) return getUnit(intialVal) ? val + getUnit(intialVal) : val + 'px';
    if (prop.indexOf('rotate') > -1 || prop.indexOf('skew') > -1) return val + 'deg';
    return val;
  };

  // Values

  var getCSSValue = function getCSSValue(el, prop) {
    // First check if prop is a valid CSS property
    if (prop in el.style) {
      // Then return the property value or fallback to '0' when getPropertyValue fails
      return getComputedStyle(el).getPropertyValue(stringToHyphens(prop)) || '0';
    }
  };

  var getTransformValue = function getTransformValue(el, prop) {
    var defaultVal = prop.indexOf('scale') > -1 ? 1 : 0;
    var str = el.style.transform;
    if (!str) return defaultVal;
    var rgx = /(\w+)\((.+?)\)/g;
    var match = [];
    var props = [];
    var values = [];
    while (match = rgx.exec(str)) {
      props.push(match[1]);
      values.push(match[2]);
    }
    var val = values.filter(function (f, i) {
      return props[i] === prop;
    });
    return val.length ? val[0] : defaultVal;
  };

  var getAnimationType = function getAnimationType(el, prop) {
    if (is.dom(el) && arrayContains(validTransforms, prop)) return 'transform';
    if (is.dom(el) && (el.getAttribute(prop) || is.svg(el) && el[prop])) return 'attribute';
    if (is.dom(el) && prop !== 'transform' && getCSSValue(el, prop)) return 'css';
    if (!is.nul(el[prop]) && !is.und(el[prop])) return 'object';
  };

  var getInitialTargetValue = function getInitialTargetValue(target, prop) {
    switch (getAnimationType(target, prop)) {
      case 'transform':
        return getTransformValue(target, prop);
      case 'css':
        return getCSSValue(target, prop);
      case 'attribute':
        return target.getAttribute(prop);
    }
    return target[prop] || 0;
  };

  var getValidValue = function getValidValue(values, val, originalCSS) {
    if (is.col(val)) return colorToRgb(val);
    if (getUnit(val)) return val;
    var unit = getUnit(values.to) ? getUnit(values.to) : getUnit(values.from);
    if (!unit && originalCSS) unit = getUnit(originalCSS);
    return unit ? val + unit : val;
  };

  var decomposeValue = function decomposeValue(val) {
    var rgx = /-?\d*\.?\d+/g;
    return {
      original: val,
      numbers: numberToString(val).match(rgx) ? numberToString(val).match(rgx).map(Number) : [0],
      strings: numberToString(val).split(rgx)
    };
  };

  var recomposeValue = function recomposeValue(numbers, strings, initialStrings) {
    return strings.reduce(function (a, b, i) {
      var b = b ? b : initialStrings[i - 1];
      return a + numbers[i - 1] + b;
    });
  };

  // Animatables

  var getAnimatables = function getAnimatables(targets) {
    var targets = targets ? flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets)) : [];
    return targets.map(function (t, i) {
      return { target: t, id: i };
    });
  };

  // Properties

  var getProperties = function getProperties(params, settings) {
    var props = [];
    for (var p in params) {
      if (!defaultSettings.hasOwnProperty(p) && p !== 'targets') {
        var prop = is.obj(params[p]) ? cloneObject(params[p]) : { value: params[p] };
        prop.name = p;
        props.push(mergeObjects(prop, settings));
      }
    }
    return props;
  };

  var getPropertiesValues = function getPropertiesValues(target, prop, value, i) {
    var values = toArray(is.fnc(value) ? value(target, i) : value);
    return {
      from: values.length > 1 ? values[0] : getInitialTargetValue(target, prop),
      to: values.length > 1 ? values[1] : values[0]
    };
  };

  // Tweens

  var getTweenValues = function getTweenValues(prop, values, type, target) {
    var valid = {};
    if (type === 'transform') {
      valid.from = prop + '(' + addDefaultTransformUnit(prop, values.from, values.to) + ')';
      valid.to = prop + '(' + addDefaultTransformUnit(prop, values.to) + ')';
    } else {
      var originalCSS = type === 'css' ? getCSSValue(target, prop) : undefined;
      valid.from = getValidValue(values, values.from, originalCSS);
      valid.to = getValidValue(values, values.to, originalCSS);
    }
    return { from: decomposeValue(valid.from), to: decomposeValue(valid.to) };
  };

  var getTweensProps = function getTweensProps(animatables, props) {
    var tweensProps = [];
    animatables.forEach(function (animatable, i) {
      var target = animatable.target;
      return props.forEach(function (prop) {
        var animType = getAnimationType(target, prop.name);
        if (animType) {
          var values = getPropertiesValues(target, prop.name, prop.value, i);
          var tween = cloneObject(prop);
          tween.animatables = animatable;
          tween.type = animType;
          tween.from = getTweenValues(prop.name, values, tween.type, target).from;
          tween.to = getTweenValues(prop.name, values, tween.type, target).to;
          tween.round = is.col(values.from) || tween.round ? 1 : 0;
          tween.delay = (is.fnc(tween.delay) ? tween.delay(target, i, animatables.length) : tween.delay) / animation.speed;
          tween.duration = (is.fnc(tween.duration) ? tween.duration(target, i, animatables.length) : tween.duration) / animation.speed;
          tweensProps.push(tween);
        }
      });
    });
    return tweensProps;
  };

  var getTweens = function getTweens(animatables, props) {
    var tweensProps = getTweensProps(animatables, props);
    var splittedProps = groupArrayByProps(tweensProps, ['name', 'from', 'to', 'delay', 'duration']);
    return splittedProps.map(function (tweenProps) {
      var tween = cloneObject(tweenProps[0]);
      tween.animatables = tweenProps.map(function (p) {
        return p.animatables;
      });
      tween.totalDuration = tween.delay + tween.duration;
      return tween;
    });
  };

  var reverseTweens = function reverseTweens(anim, delays) {
    anim.tweens.forEach(function (tween) {
      var toVal = tween.to;
      var fromVal = tween.from;
      var delayVal = anim.duration - (tween.delay + tween.duration);
      tween.from = toVal;
      tween.to = fromVal;
      if (delays) tween.delay = delayVal;
    });
    anim.reversed = anim.reversed ? false : true;
  };

  var getTweensDuration = function getTweensDuration(tweens) {
    if (tweens.length) return Math.max.apply(Math, tweens.map(function (tween) {
      return tween.totalDuration;
    }));
  };

  // will-change

  var getWillChange = function getWillChange(anim) {
    var props = [];
    var els = [];
    anim.tweens.forEach(function (tween) {
      if (tween.type === 'css' || tween.type === 'transform') {
        props.push(tween.type === 'css' ? stringToHyphens(tween.name) : 'transform');
        tween.animatables.forEach(function (animatable) {
          els.push(animatable.target);
        });
      }
    });
    return {
      properties: removeArrayDuplicates(props).join(', '),
      elements: removeArrayDuplicates(els)
    };
  };

  var setWillChange = function setWillChange(anim) {
    var willChange = getWillChange(anim);
    willChange.elements.forEach(function (element) {
      element.style.willChange = willChange.properties;
    });
  };

  var removeWillChange = function removeWillChange(anim) {
    var willChange = getWillChange(anim);
    willChange.elements.forEach(function (element) {
      element.style.removeProperty('will-change');
    });
  };

  /* Svg path */

  var getPathProps = function getPathProps(path) {
    var el = is.str(path) ? selectString(path)[0] : path;
    return {
      path: el,
      value: el.getTotalLength()
    };
  };

  var snapProgressToPath = function snapProgressToPath(tween, progress) {
    var pathEl = tween.path;
    var pathProgress = tween.value * progress;
    var point = function point(offset) {
      var o = offset || 0;
      var p = progress > 1 ? tween.value + o : pathProgress + o;
      return pathEl.getPointAtLength(p);
    };
    var p = point();
    var p0 = point(-1);
    var p1 = point(+1);
    switch (tween.name) {
      case 'translateX':
        return p.x;
      case 'translateY':
        return p.y;
      case 'rotate':
        return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    }
  };

  // Progress

  var getTweenProgress = function getTweenProgress(tween, time) {
    var elapsed = Math.min(Math.max(time - tween.delay, 0), tween.duration);
    var percent = elapsed / tween.duration;
    var progress = tween.to.numbers.map(function (number, p) {
      var start = tween.from.numbers[p];
      var eased = easings[tween.easing](percent, tween.elasticity);
      var val = tween.path ? snapProgressToPath(tween, eased) : start + eased * (number - start);
      val = tween.round ? Math.round(val * tween.round) / tween.round : val;
      return val;
    });
    return recomposeValue(progress, tween.to.strings, tween.from.strings);
  };

  var setAnimationProgress = function setAnimationProgress(anim, time) {
    var transforms;
    anim.currentTime = time;
    anim.progress = time / anim.duration * 100;
    for (var t = 0; t < anim.tweens.length; t++) {
      var tween = anim.tweens[t];
      tween.currentValue = getTweenProgress(tween, time);
      var progress = tween.currentValue;
      for (var a = 0; a < tween.animatables.length; a++) {
        var animatable = tween.animatables[a];
        var id = animatable.id;
        var target = animatable.target;
        var name = tween.name;
        switch (tween.type) {
          case 'css':
            target.style[name] = progress;break;
          case 'attribute':
            target.setAttribute(name, progress);break;
          case 'object':
            target[name] = progress;break;
          case 'transform':
            if (!transforms) transforms = {};
            if (!transforms[id]) transforms[id] = [];
            transforms[id].push(progress);
            break;
        }
      }
    }
    if (transforms) {
      if (!transform) transform = (getCSSValue(document.body, transformStr) ? '' : '-webkit-') + transformStr;
      for (var t in transforms) {
        anim.animatables[t].target.style[transform] = transforms[t].join(' ');
      }
    }
    if (anim.settings.update) anim.settings.update(anim);
  };

  // Animation

  var createAnimation = function createAnimation(params) {
    var anim = {};
    anim.animatables = getAnimatables(params.targets);
    anim.settings = mergeObjects(params, defaultSettings);
    anim.properties = getProperties(params, anim.settings);
    anim.tweens = getTweens(anim.animatables, anim.properties);
    anim.duration = getTweensDuration(anim.tweens) || params.duration;
    anim.currentTime = 0;
    anim.progress = 0;
    anim.ended = false;
    return anim;
  };

  // Public

  var animations = [];
  var raf = 0;

  var engine = function () {
    var play = function play() {
      raf = requestAnimationFrame(step);
    };
    var step = function step(t) {
      if (animations.length) {
        for (var i = 0; i < animations.length; i++) {
          animations[i].tick(t);
        }play();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    return play;
  }();

  var animation = function animation(params) {

    var anim = createAnimation(params);
    var time = {};

    anim.tick = function (now) {
      anim.ended = false;
      if (!time.start) time.start = now;
      time.current = Math.min(Math.max(time.last + now - time.start, 0), anim.duration);
      setAnimationProgress(anim, time.current);
      var s = anim.settings;
      if (s.begin && time.current >= s.delay) {
        s.begin(anim);s.begin = undefined;
      };
      if (time.current >= anim.duration) {
        if (s.loop) {
          time.start = now;
          if (s.direction === 'alternate') reverseTweens(anim, true);
          if (is.num(s.loop)) s.loop--;
        } else {
          anim.ended = true;
          anim.pause();
          if (s.complete) s.complete(anim);
        }
        time.last = 0;
      }
    };

    anim.seek = function (progress) {
      setAnimationProgress(anim, progress / 100 * anim.duration);
    };

    anim.pause = function () {
      removeWillChange(anim);
      var i = animations.indexOf(anim);
      if (i > -1) animations.splice(i, 1);
    };

    anim.play = function (params) {
      anim.pause();
      if (params) anim = mergeObjects(createAnimation(mergeObjects(params, anim.settings)), anim);
      time.start = 0;
      time.last = anim.ended ? 0 : anim.currentTime;
      var s = anim.settings;
      if (s.direction === 'reverse') reverseTweens(anim);
      if (s.direction === 'alternate' && !s.loop) s.loop = 1;
      setWillChange(anim);
      animations.push(anim);
      if (!raf) engine();
    };

    anim.restart = function () {
      if (anim.reversed) reverseTweens(anim);
      anim.pause();
      anim.seek(0);
      anim.play();
    };

    if (anim.settings.autoplay) anim.play();

    return anim;
  };

  // Remove one or multiple targets from all active animations.

  var remove = function remove(elements) {
    var targets = flattenArray(is.arr(elements) ? elements.map(toArray) : toArray(elements));
    for (var i = animations.length - 1; i >= 0; i--) {
      var animation = animations[i];
      var tweens = animation.tweens;
      for (var t = tweens.length - 1; t >= 0; t--) {
        var animatables = tweens[t].animatables;
        for (var a = animatables.length - 1; a >= 0; a--) {
          if (arrayContains(targets, animatables[a].target)) {
            animatables.splice(a, 1);
            if (!animatables.length) tweens.splice(t, 1);
            if (!tweens.length) animation.pause();
          }
        }
      }
    }
  };

  animation.version = version;
  animation.speed = 1;
  animation.list = animations;
  animation.remove = remove;
  animation.easings = easings;
  animation.getValue = getInitialTargetValue;
  animation.path = getPathProps;
  animation.random = random;

  return animation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1lLmpzIl0sIm5hbWVzIjpbInJvb3QiLCJmYWN0b3J5IiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsIndpbmRvdyIsImFuaW1lIiwidmVyc2lvbiIsImRlZmF1bHRTZXR0aW5ncyIsImR1cmF0aW9uIiwiZGVsYXkiLCJsb29wIiwiYXV0b3BsYXkiLCJkaXJlY3Rpb24iLCJlYXNpbmciLCJlbGFzdGljaXR5Iiwicm91bmQiLCJiZWdpbiIsInVuZGVmaW5lZCIsInVwZGF0ZSIsImNvbXBsZXRlIiwidmFsaWRUcmFuc2Zvcm1zIiwidHJhbnNmb3JtIiwidHJhbnNmb3JtU3RyIiwiaXMiLCJhcnIiLCJhIiwiQXJyYXkiLCJpc0FycmF5Iiwib2JqIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiaW5kZXhPZiIsInN2ZyIsIlNWR0VsZW1lbnQiLCJkb20iLCJub2RlVHlwZSIsIm51bSIsImlzTmFOIiwicGFyc2VJbnQiLCJzdHIiLCJmbmMiLCJ1bmQiLCJudWwiLCJoZXgiLCJ0ZXN0IiwicmdiIiwiaHNsIiwiY29sIiwiZWFzaW5ncyIsImVhc2VzIiwibmFtZXMiLCJmdW5jdGlvbnMiLCJTaW5lIiwidCIsIk1hdGgiLCJjb3MiLCJQSSIsIkNpcmMiLCJzcXJ0IiwiRWxhc3RpYyIsIm0iLCJwIiwibWluIiwic3QiLCJzdDEiLCJzIiwiYXNpbiIsInBvdyIsInNpbiIsIkJhY2siLCJCb3VuY2UiLCJwb3cyIiwiYm91bmNlIiwiZm9yRWFjaCIsIm5hbWUiLCJpIiwia2V5cyIsImVhc2VJbiIsImxpbmVhciIsIm51bWJlclRvU3RyaW5nIiwidmFsIiwic3RyaW5nVG9IeXBoZW5zIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwic2VsZWN0U3RyaW5nIiwibm9kZXMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlIiwicmFuZG9tIiwibWF4IiwiZmxvb3IiLCJmbGF0dGVuQXJyYXkiLCJyZWR1Y2UiLCJiIiwiY29uY2F0IiwidG9BcnJheSIsIm8iLCJOb2RlTGlzdCIsIkhUTUxDb2xsZWN0aW9uIiwic2xpY2UiLCJhcnJheUNvbnRhaW5zIiwic29tZSIsImdyb3VwQXJyYXlCeVByb3BzIiwicHJvcHNBcnIiLCJncm91cHMiLCJncm91cCIsIkpTT04iLCJzdHJpbmdpZnkiLCJtYXAiLCJwdXNoIiwicmVtb3ZlQXJyYXlEdXBsaWNhdGVzIiwiZmlsdGVyIiwiaXRlbSIsInBvcyIsInNlbGYiLCJjbG9uZU9iamVjdCIsIm5ld09iamVjdCIsIm1lcmdlT2JqZWN0cyIsIm8xIiwibzIiLCJoZXhUb1JnYiIsInJneCIsInIiLCJnIiwiZXhlYyIsImhzbFRvUmdiIiwiaCIsImwiLCJodWUycmdiIiwicSIsImNvbG9yVG9SZ2IiLCJnZXRVbml0IiwiYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQiLCJwcm9wIiwiaW50aWFsVmFsIiwiZ2V0Q1NTVmFsdWUiLCJlbCIsInN0eWxlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImdldFByb3BlcnR5VmFsdWUiLCJnZXRUcmFuc2Zvcm1WYWx1ZSIsImRlZmF1bHRWYWwiLCJtYXRjaCIsInByb3BzIiwidmFsdWVzIiwiZiIsImxlbmd0aCIsImdldEFuaW1hdGlvblR5cGUiLCJnZXRBdHRyaWJ1dGUiLCJnZXRJbml0aWFsVGFyZ2V0VmFsdWUiLCJ0YXJnZXQiLCJnZXRWYWxpZFZhbHVlIiwib3JpZ2luYWxDU1MiLCJ1bml0IiwidG8iLCJmcm9tIiwiZGVjb21wb3NlVmFsdWUiLCJvcmlnaW5hbCIsIm51bWJlcnMiLCJOdW1iZXIiLCJzdHJpbmdzIiwic3BsaXQiLCJyZWNvbXBvc2VWYWx1ZSIsImluaXRpYWxTdHJpbmdzIiwiZ2V0QW5pbWF0YWJsZXMiLCJ0YXJnZXRzIiwiaWQiLCJnZXRQcm9wZXJ0aWVzIiwicGFyYW1zIiwic2V0dGluZ3MiLCJoYXNPd25Qcm9wZXJ0eSIsInZhbHVlIiwiZ2V0UHJvcGVydGllc1ZhbHVlcyIsImdldFR3ZWVuVmFsdWVzIiwidHlwZSIsInZhbGlkIiwiZ2V0VHdlZW5zUHJvcHMiLCJhbmltYXRhYmxlcyIsInR3ZWVuc1Byb3BzIiwiYW5pbWF0YWJsZSIsImFuaW1UeXBlIiwidHdlZW4iLCJhbmltYXRpb24iLCJzcGVlZCIsImdldFR3ZWVucyIsInNwbGl0dGVkUHJvcHMiLCJ0d2VlblByb3BzIiwidG90YWxEdXJhdGlvbiIsInJldmVyc2VUd2VlbnMiLCJhbmltIiwiZGVsYXlzIiwidHdlZW5zIiwidG9WYWwiLCJmcm9tVmFsIiwiZGVsYXlWYWwiLCJyZXZlcnNlZCIsImdldFR3ZWVuc0R1cmF0aW9uIiwiYXBwbHkiLCJnZXRXaWxsQ2hhbmdlIiwiZWxzIiwicHJvcGVydGllcyIsImpvaW4iLCJlbGVtZW50cyIsInNldFdpbGxDaGFuZ2UiLCJ3aWxsQ2hhbmdlIiwiZWxlbWVudCIsInJlbW92ZVdpbGxDaGFuZ2UiLCJyZW1vdmVQcm9wZXJ0eSIsImdldFBhdGhQcm9wcyIsInBhdGgiLCJnZXRUb3RhbExlbmd0aCIsInNuYXBQcm9ncmVzc1RvUGF0aCIsInByb2dyZXNzIiwicGF0aEVsIiwicGF0aFByb2dyZXNzIiwicG9pbnQiLCJvZmZzZXQiLCJnZXRQb2ludEF0TGVuZ3RoIiwicDAiLCJwMSIsIngiLCJ5IiwiYXRhbjIiLCJnZXRUd2VlblByb2dyZXNzIiwidGltZSIsImVsYXBzZWQiLCJwZXJjZW50IiwibnVtYmVyIiwic3RhcnQiLCJlYXNlZCIsInNldEFuaW1hdGlvblByb2dyZXNzIiwidHJhbnNmb3JtcyIsImN1cnJlbnRUaW1lIiwiY3VycmVudFZhbHVlIiwic2V0QXR0cmlidXRlIiwiYm9keSIsImNyZWF0ZUFuaW1hdGlvbiIsImVuZGVkIiwiYW5pbWF0aW9ucyIsInJhZiIsImVuZ2luZSIsInBsYXkiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzdGVwIiwidGljayIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwibm93IiwiY3VycmVudCIsImxhc3QiLCJwYXVzZSIsInNlZWsiLCJzcGxpY2UiLCJyZXN0YXJ0IiwicmVtb3ZlIiwibGlzdCIsImdl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ckI7QUFDRjtBQUNGO0FBQ0Y7QUFDRixHQWhCRDs7QUFrQkFuRSxZQUFVbkwsT0FBVixHQUFvQkEsT0FBcEI7QUFDQW1MLFlBQVVDLEtBQVYsR0FBa0IsQ0FBbEI7QUFDQUQsWUFBVXdFLElBQVYsR0FBaUJoQixVQUFqQjtBQUNBeEQsWUFBVXVFLE1BQVYsR0FBbUJBLE1BQW5CO0FBQ0F2RSxZQUFVdkksT0FBVixHQUFvQkEsT0FBcEI7QUFDQXVJLFlBQVV5RSxRQUFWLEdBQXFCMUcscUJBQXJCO0FBQ0FpQyxZQUFVMkIsSUFBVixHQUFpQkQsWUFBakI7QUFDQTFCLFlBQVU5RixNQUFWLEdBQW1CQSxNQUFuQjs7QUFFQSxTQUFPOEYsU0FBUDtBQUVELENBOW1CQSxDQUFEIiwiZmlsZSI6ImFuaW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEFuaW1lIHYxLjEuMVxuICogaHR0cDovL2FuaW1lLWpzLmNvbVxuICogSmF2YVNjcmlwdCBhbmltYXRpb24gZW5naW5lXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgSnVsaWFuIEdhcm5pZXJcbiAqIGh0dHA6Ly9qdWxpYW5nYXJuaWVyLmNvbVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHdpbmRvdy5hbmltZSA9IGZhY3RvcnkoKTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHZlcnNpb24gPSAnMS4xLjEnO1xuXG4gIC8vIERlZmF1bHRzXG5cbiAgdmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgICBkdXJhdGlvbjogMTAwMCxcbiAgICBkZWxheTogMCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBhdXRvcGxheTogdHJ1ZSxcbiAgICBkaXJlY3Rpb246ICdub3JtYWwnLFxuICAgIGVhc2luZzogJ2Vhc2VPdXRFbGFzdGljJyxcbiAgICBlbGFzdGljaXR5OiA0MDAsXG4gICAgcm91bmQ6IGZhbHNlLFxuICAgIGJlZ2luOiB1bmRlZmluZWQsXG4gICAgdXBkYXRlOiB1bmRlZmluZWQsXG4gICAgY29tcGxldGU6IHVuZGVmaW5lZFxuICB9XG5cbiAgLy8gVHJhbnNmb3Jtc1xuXG4gIHZhciB2YWxpZFRyYW5zZm9ybXMgPSBbJ3RyYW5zbGF0ZVgnLCAndHJhbnNsYXRlWScsICd0cmFuc2xhdGVaJywgJ3JvdGF0ZScsICdyb3RhdGVYJywgJ3JvdGF0ZVknLCAncm90YXRlWicsICdzY2FsZScsICdzY2FsZVgnLCAnc2NhbGVZJywgJ3NjYWxlWicsICdza2V3WCcsICdza2V3WSddO1xuICB2YXIgdHJhbnNmb3JtLCB0cmFuc2Zvcm1TdHIgPSAndHJhbnNmb3JtJztcblxuICAvLyBVdGlsc1xuXG4gIHZhciBpcyA9IHtcbiAgICBhcnI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgfSxcbiAgICBvYmo6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKS5pbmRleE9mKCdPYmplY3QnKSA+IC0xIH0sXG4gICAgc3ZnOiBmdW5jdGlvbihhKSB7IHJldHVybiBhIGluc3RhbmNlb2YgU1ZHRWxlbWVudCB9LFxuICAgIGRvbTogZnVuY3Rpb24oYSkgeyByZXR1cm4gYS5ub2RlVHlwZSB8fCBpcy5zdmcoYSkgfSxcbiAgICBudW06IGZ1bmN0aW9uKGEpIHsgcmV0dXJuICFpc05hTihwYXJzZUludChhKSkgfSxcbiAgICBzdHI6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnc3RyaW5nJyB9LFxuICAgIGZuYzogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbicgfSxcbiAgICB1bmQ6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAndW5kZWZpbmVkJyB9LFxuICAgIG51bDogZnVuY3Rpb24oYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdudWxsJyB9LFxuICAgIGhleDogZnVuY3Rpb24oYSkgeyByZXR1cm4gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSkgfSxcbiAgICByZ2I6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIC9ecmdiLy50ZXN0KGEpIH0sXG4gICAgaHNsOiBmdW5jdGlvbihhKSB7IHJldHVybiAvXmhzbC8udGVzdChhKSB9LFxuICAgIGNvbDogZnVuY3Rpb24oYSkgeyByZXR1cm4gKGlzLmhleChhKSB8fCBpcy5yZ2IoYSkgfHwgaXMuaHNsKGEpKSB9XG4gIH1cblxuICAvLyBFYXNpbmdzIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gaHR0cDovL2pxdWVyeXVpLmNvbS9cblxuICB2YXIgZWFzaW5ncyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgZWFzZXMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBbJ1F1YWQnLCAnQ3ViaWMnLCAnUXVhcnQnLCAnUXVpbnQnLCAnRXhwbyddO1xuICAgIHZhciBmdW5jdGlvbnMgPSB7XG4gICAgICBTaW5lOiBmdW5jdGlvbih0KSB7IHJldHVybiAxIC0gTWF0aC5jb3MoIHQgKiBNYXRoLlBJIC8gMiApOyB9LFxuICAgICAgQ2lyYzogZnVuY3Rpb24odCkgeyByZXR1cm4gMSAtIE1hdGguc3FydCggMSAtIHQgKiB0ICk7IH0sXG4gICAgICBFbGFzdGljOiBmdW5jdGlvbih0LCBtKSB7XG4gICAgICAgIGlmKCB0ID09PSAwIHx8IHQgPT09IDEgKSByZXR1cm4gdDtcbiAgICAgICAgdmFyIHAgPSAoMSAtIE1hdGgubWluKG0sIDk5OCkgLyAxMDAwKSwgc3QgPSB0IC8gMSwgc3QxID0gc3QgLSAxLCBzID0gcCAvICggMiAqIE1hdGguUEkgKSAqIE1hdGguYXNpbiggMSApO1xuICAgICAgICByZXR1cm4gLSggTWF0aC5wb3coIDIsIDEwICogc3QxICkgKiBNYXRoLnNpbiggKCBzdDEgLSBzICkgKiAoIDIgKiBNYXRoLlBJICkgLyBwICkgKTtcbiAgICAgIH0sXG4gICAgICBCYWNrOiBmdW5jdGlvbih0KSB7IHJldHVybiB0ICogdCAqICggMyAqIHQgLSAyICk7IH0sXG4gICAgICBCb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHBvdzIsIGJvdW5jZSA9IDQ7XG4gICAgICAgIHdoaWxlICggdCA8ICggKCBwb3cyID0gTWF0aC5wb3coIDIsIC0tYm91bmNlICkgKSAtIDEgKSAvIDExICkge31cbiAgICAgICAgcmV0dXJuIDEgLyBNYXRoLnBvdyggNCwgMyAtIGJvdW5jZSApIC0gNy41NjI1ICogTWF0aC5wb3coICggcG93MiAqIDMgLSAyICkgLyAyMiAtIHQsIDIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgICBmdW5jdGlvbnNbbmFtZV0gPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdyggdCwgaSArIDIgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3Qua2V5cyhmdW5jdGlvbnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGVhc2VJbiA9IGZ1bmN0aW9uc1tuYW1lXTtcbiAgICAgIGVhc2VzWydlYXNlSW4nICsgbmFtZV0gPSBlYXNlSW47XG4gICAgICBlYXNlc1snZWFzZU91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIDEgLSBlYXNlSW4oMSAtIHQsIG0pOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VJbk91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyBlYXNlSW4odCAqIDIsIG0pIC8gMiA6IDEgLSBlYXNlSW4odCAqIC0yICsgMiwgbSkgLyAyOyB9O1xuICAgICAgZWFzZXNbJ2Vhc2VPdXRJbicgKyBuYW1lXSA9IGZ1bmN0aW9uKHQsIG0pIHsgcmV0dXJuIHQgPCAwLjUgPyAoMSAtIGVhc2VJbigxIC0gMiAqIHQsIG0pKSAvIDIgOiAoZWFzZUluKHQgKiAyIC0gMSwgbSkgKyAxKSAvIDI7IH07XG4gICAgfSk7XG4gICAgZWFzZXMubGluZWFyID0gZnVuY3Rpb24odCkgeyByZXR1cm4gdDsgfTtcbiAgICByZXR1cm4gZWFzZXM7XG4gIH0pKCk7XG5cbiAgLy8gU3RyaW5nc1xuXG4gIHZhciBudW1iZXJUb1N0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAoaXMuc3RyKHZhbCkpID8gdmFsIDogdmFsICsgJyc7XG4gIH1cblxuICB2YXIgc3RyaW5nVG9IeXBoZW5zID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgdmFyIHNlbGVjdFN0cmluZyA9IGZ1bmN0aW9uKHN0cikge1xuICAgIGlmIChpcy5jb2woc3RyKSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICB2YXIgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0cik7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gTnVtYmVyc1xuXG4gIHZhciByYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbiAgLy8gQXJyYXlzXG5cbiAgdmFyIGZsYXR0ZW5BcnJheSA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChpcy5hcnIoYikgPyBmbGF0dGVuQXJyYXkoYikgOiBiKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uKG8pIHtcbiAgICBpZiAoaXMuYXJyKG8pKSByZXR1cm4gbztcbiAgICBpZiAoaXMuc3RyKG8pKSBvID0gc2VsZWN0U3RyaW5nKG8pIHx8IG87XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBOb2RlTGlzdCB8fCBvIGluc3RhbmNlb2YgSFRNTENvbGxlY3Rpb24pIHJldHVybiBbXS5zbGljZS5jYWxsKG8pO1xuICAgIHJldHVybiBbb107XG4gIH1cblxuICB2YXIgYXJyYXlDb250YWlucyA9IGZ1bmN0aW9uKGFyciwgdmFsKSB7XG4gICAgcmV0dXJuIGFyci5zb21lKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEgPT09IHZhbDsgfSk7XG4gIH1cblxuICB2YXIgZ3JvdXBBcnJheUJ5UHJvcHMgPSBmdW5jdGlvbihhcnIsIHByb3BzQXJyKSB7XG4gICAgdmFyIGdyb3VwcyA9IHt9O1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKG8pIHtcbiAgICAgIHZhciBncm91cCA9IEpTT04uc3RyaW5naWZ5KHByb3BzQXJyLm1hcChmdW5jdGlvbihwKSB7IHJldHVybiBvW3BdOyB9KSk7XG4gICAgICBncm91cHNbZ3JvdXBdID0gZ3JvdXBzW2dyb3VwXSB8fCBbXTtcbiAgICAgIGdyb3Vwc1tncm91cF0ucHVzaChvKTtcbiAgICB9KTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZ3JvdXBzKS5tYXAoZnVuY3Rpb24oZ3JvdXApIHtcbiAgICAgIHJldHVybiBncm91cHNbZ3JvdXBdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHJlbW92ZUFycmF5RHVwbGljYXRlcyA9IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0sIHBvcywgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZihpdGVtKSA9PT0gcG9zO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gT2JqZWN0c1xuXG4gIHZhciBjbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgbmV3T2JqZWN0ID0ge307XG4gICAgZm9yICh2YXIgcCBpbiBvKSBuZXdPYmplY3RbcF0gPSBvW3BdO1xuICAgIHJldHVybiBuZXdPYmplY3Q7XG4gIH1cblxuICB2YXIgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24obzEsIG8yKSB7XG4gICAgZm9yICh2YXIgcCBpbiBvMikgbzFbcF0gPSAhaXMudW5kKG8xW3BdKSA/IG8xW3BdIDogbzJbcF07XG4gICAgcmV0dXJuIG8xO1xuICB9XG5cbiAgLy8gQ29sb3JzXG5cbiAgdmFyIGhleFRvUmdiID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgdmFyIHJneCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG4gICAgdmFyIGhleCA9IGhleC5yZXBsYWNlKHJneCwgZnVuY3Rpb24obSwgciwgZywgYikgeyByZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiOyB9KTtcbiAgICB2YXIgcmdiID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgdmFyIHIgPSBwYXJzZUludChyZ2JbMV0sIDE2KTtcbiAgICB2YXIgZyA9IHBhcnNlSW50KHJnYlsyXSwgMTYpO1xuICAgIHZhciBiID0gcGFyc2VJbnQocmdiWzNdLCAxNik7XG4gICAgcmV0dXJuICdyZ2IoJyArIHIgKyAnLCcgKyBnICsgJywnICsgYiArICcpJztcbiAgfVxuXG4gIHZhciBoc2xUb1JnYiA9IGZ1bmN0aW9uKGhzbCkge1xuICAgIHZhciBoc2wgPSAvaHNsXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklXFwpL2cuZXhlYyhoc2wpO1xuICAgIHZhciBoID0gcGFyc2VJbnQoaHNsWzFdKSAvIDM2MDtcbiAgICB2YXIgcyA9IHBhcnNlSW50KGhzbFsyXSkgLyAxMDA7XG4gICAgdmFyIGwgPSBwYXJzZUludChoc2xbM10pIC8gMTAwO1xuICAgIHZhciBodWUycmdiID0gZnVuY3Rpb24ocCwgcSwgdCkge1xuICAgICAgaWYgKHQgPCAwKSB0ICs9IDE7XG4gICAgICBpZiAodCA+IDEpIHQgLT0gMTtcbiAgICAgIGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICAgIGlmICh0IDwgMS8yKSByZXR1cm4gcTtcbiAgICAgIGlmICh0IDwgMi8zKSByZXR1cm4gcCArIChxIC0gcCkgKiAoMi8zIC0gdCkgKiA2O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIHZhciByLCBnLCBiO1xuICAgIGlmIChzID09IDApIHtcbiAgICAgIHIgPSBnID0gYiA9IGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgIHZhciBwID0gMiAqIGwgLSBxO1xuICAgICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICBnID0gaHVlMnJnYihwLCBxLCBoKTtcbiAgICAgIGIgPSBodWUycmdiKHAsIHEsIGggLSAxLzMpO1xuICAgIH1cbiAgICByZXR1cm4gJ3JnYignICsgciAqIDI1NSArICcsJyArIGcgKiAyNTUgKyAnLCcgKyBiICogMjU1ICsgJyknO1xuICB9XG5cbiAgdmFyIGNvbG9yVG9SZ2IgPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZiAoaXMucmdiKHZhbCkpIHJldHVybiB2YWw7XG4gICAgaWYgKGlzLmhleCh2YWwpKSByZXR1cm4gaGV4VG9SZ2IodmFsKTtcbiAgICBpZiAoaXMuaHNsKHZhbCkpIHJldHVybiBoc2xUb1JnYih2YWwpO1xuICB9XG5cbiAgLy8gVW5pdHNcblxuICB2YXIgZ2V0VW5pdCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAvKFtcXCtcXC1dP1swLTl8YXV0b1xcLl0rKSglfHB4fHB0fGVtfHJlbXxpbnxjbXxtbXxleHxwY3x2d3x2aHxkZWcpPy8uZXhlYyh2YWwpWzJdO1xuICB9XG5cbiAgdmFyIGFkZERlZmF1bHRUcmFuc2Zvcm1Vbml0ID0gZnVuY3Rpb24ocHJvcCwgdmFsLCBpbnRpYWxWYWwpIHtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3RyYW5zbGF0ZScpID4gLTEpIHJldHVybiBnZXRVbml0KGludGlhbFZhbCkgPyB2YWwgKyBnZXRVbml0KGludGlhbFZhbCkgOiB2YWwgKyAncHgnO1xuICAgIGlmIChwcm9wLmluZGV4T2YoJ3JvdGF0ZScpID4gLTEgfHwgcHJvcC5pbmRleE9mKCdza2V3JykgPiAtMSkgcmV0dXJuIHZhbCArICdkZWcnO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBWYWx1ZXNcblxuICB2YXIgZ2V0Q1NTVmFsdWUgPSBmdW5jdGlvbihlbCwgcHJvcCkge1xuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHByb3AgaXMgYSB2YWxpZCBDU1MgcHJvcGVydHlcbiAgICBpZiAocHJvcCBpbiBlbC5zdHlsZSkge1xuICAgICAgLy8gVGhlbiByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9yIGZhbGxiYWNrIHRvICcwJyB3aGVuIGdldFByb3BlcnR5VmFsdWUgZmFpbHNcbiAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKHN0cmluZ1RvSHlwaGVucyhwcm9wKSkgfHwgJzAnO1xuICAgIH1cbiAgfVxuXG4gIHZhciBnZXRUcmFuc2Zvcm1WYWx1ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgdmFyIGRlZmF1bHRWYWwgPSBwcm9wLmluZGV4T2YoJ3NjYWxlJykgPiAtMSA/IDEgOiAwO1xuICAgIHZhciBzdHIgPSBlbC5zdHlsZS50cmFuc2Zvcm07XG4gICAgaWYgKCFzdHIpIHJldHVybiBkZWZhdWx0VmFsO1xuICAgIHZhciByZ3ggPSAvKFxcdyspXFwoKC4rPylcXCkvZztcbiAgICB2YXIgbWF0Y2ggPSBbXTtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgd2hpbGUgKG1hdGNoID0gcmd4LmV4ZWMoc3RyKSkge1xuICAgICAgcHJvcHMucHVzaChtYXRjaFsxXSk7XG4gICAgICB2YWx1ZXMucHVzaChtYXRjaFsyXSk7XG4gICAgfVxuICAgIHZhciB2YWwgPSB2YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGYsIGkpIHsgcmV0dXJuIHByb3BzW2ldID09PSBwcm9wOyB9KTtcbiAgICByZXR1cm4gdmFsLmxlbmd0aCA/IHZhbFswXSA6IGRlZmF1bHRWYWw7XG4gIH1cblxuICB2YXIgZ2V0QW5pbWF0aW9uVHlwZSA9IGZ1bmN0aW9uKGVsLCBwcm9wKSB7XG4gICAgaWYgKCBpcy5kb20oZWwpICYmIGFycmF5Q29udGFpbnModmFsaWRUcmFuc2Zvcm1zLCBwcm9wKSkgcmV0dXJuICd0cmFuc2Zvcm0nO1xuICAgIGlmICggaXMuZG9tKGVsKSAmJiAoZWwuZ2V0QXR0cmlidXRlKHByb3ApIHx8IChpcy5zdmcoZWwpICYmIGVsW3Byb3BdKSkpIHJldHVybiAnYXR0cmlidXRlJztcbiAgICBpZiAoIGlzLmRvbShlbCkgJiYgKHByb3AgIT09ICd0cmFuc2Zvcm0nICYmIGdldENTU1ZhbHVlKGVsLCBwcm9wKSkpIHJldHVybiAnY3NzJztcbiAgICBpZiAoIWlzLm51bChlbFtwcm9wXSkgJiYgIWlzLnVuZChlbFtwcm9wXSkpIHJldHVybiAnb2JqZWN0JztcbiAgfVxuXG4gIHZhciBnZXRJbml0aWFsVGFyZ2V0VmFsdWUgPSBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICBzd2l0Y2ggKGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wKSkge1xuICAgICAgY2FzZSAndHJhbnNmb3JtJzogcmV0dXJuIGdldFRyYW5zZm9ybVZhbHVlKHRhcmdldCwgcHJvcCk7XG4gICAgICBjYXNlICdjc3MnOiByZXR1cm4gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKTtcbiAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHJldHVybiB0YXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdIHx8IDA7XG4gIH1cblxuICB2YXIgZ2V0VmFsaWRWYWx1ZSA9IGZ1bmN0aW9uKHZhbHVlcywgdmFsLCBvcmlnaW5hbENTUykge1xuICAgIGlmIChpcy5jb2wodmFsKSkgcmV0dXJuIGNvbG9yVG9SZ2IodmFsKTtcbiAgICBpZiAoZ2V0VW5pdCh2YWwpKSByZXR1cm4gdmFsO1xuICAgIHZhciB1bml0ID0gZ2V0VW5pdCh2YWx1ZXMudG8pID8gZ2V0VW5pdCh2YWx1ZXMudG8pIDogZ2V0VW5pdCh2YWx1ZXMuZnJvbSk7XG4gICAgaWYgKCF1bml0ICYmIG9yaWdpbmFsQ1NTKSB1bml0ID0gZ2V0VW5pdChvcmlnaW5hbENTUyk7XG4gICAgcmV0dXJuIHVuaXQgPyB2YWwgKyB1bml0IDogdmFsO1xuICB9XG5cbiAgdmFyIGRlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJneCA9IC8tP1xcZCpcXC4/XFxkKy9nO1xuICAgIHJldHVybiB7XG4gICAgICBvcmlnaW5hbDogdmFsLFxuICAgICAgbnVtYmVyczogbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpID8gbnVtYmVyVG9TdHJpbmcodmFsKS5tYXRjaChyZ3gpLm1hcChOdW1iZXIpIDogWzBdLFxuICAgICAgc3RyaW5nczogbnVtYmVyVG9TdHJpbmcodmFsKS5zcGxpdChyZ3gpXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlY29tcG9zZVZhbHVlID0gZnVuY3Rpb24obnVtYmVycywgc3RyaW5ncywgaW5pdGlhbFN0cmluZ3MpIHtcbiAgICByZXR1cm4gc3RyaW5ncy5yZWR1Y2UoZnVuY3Rpb24oYSwgYiwgaSkge1xuICAgICAgdmFyIGIgPSAoYiA/IGIgOiBpbml0aWFsU3RyaW5nc1tpIC0gMV0pO1xuICAgICAgcmV0dXJuIGEgKyBudW1iZXJzW2kgLSAxXSArIGI7XG4gICAgfSk7XG4gIH1cblxuICAvLyBBbmltYXRhYmxlc1xuXG4gIHZhciBnZXRBbmltYXRhYmxlcyA9IGZ1bmN0aW9uKHRhcmdldHMpIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHRhcmdldHMgPyAoZmxhdHRlbkFycmF5KGlzLmFycih0YXJnZXRzKSA/IHRhcmdldHMubWFwKHRvQXJyYXkpIDogdG9BcnJheSh0YXJnZXRzKSkpIDogW107XG4gICAgcmV0dXJuIHRhcmdldHMubWFwKGZ1bmN0aW9uKHQsIGkpIHtcbiAgICAgIHJldHVybiB7IHRhcmdldDogdCwgaWQ6IGkgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFByb3BlcnRpZXNcblxuICB2YXIgZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHBhcmFtcywgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICBmb3IgKHZhciBwIGluIHBhcmFtcykge1xuICAgICAgaWYgKCFkZWZhdWx0U2V0dGluZ3MuaGFzT3duUHJvcGVydHkocCkgJiYgcCAhPT0gJ3RhcmdldHMnKSB7XG4gICAgICAgIHZhciBwcm9wID0gaXMub2JqKHBhcmFtc1twXSkgPyBjbG9uZU9iamVjdChwYXJhbXNbcF0pIDoge3ZhbHVlOiBwYXJhbXNbcF19O1xuICAgICAgICBwcm9wLm5hbWUgPSBwO1xuICAgICAgICBwcm9wcy5wdXNoKG1lcmdlT2JqZWN0cyhwcm9wLCBzZXR0aW5ncykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0UHJvcGVydGllc1ZhbHVlcyA9IGZ1bmN0aW9uKHRhcmdldCwgcHJvcCwgdmFsdWUsIGkpIHtcbiAgICB2YXIgdmFsdWVzID0gdG9BcnJheSggaXMuZm5jKHZhbHVlKSA/IHZhbHVlKHRhcmdldCwgaSkgOiB2YWx1ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZyb206ICh2YWx1ZXMubGVuZ3RoID4gMSkgPyB2YWx1ZXNbMF0gOiBnZXRJbml0aWFsVGFyZ2V0VmFsdWUodGFyZ2V0LCBwcm9wKSxcbiAgICAgIHRvOiAodmFsdWVzLmxlbmd0aCA+IDEpID8gdmFsdWVzWzFdIDogdmFsdWVzWzBdXG4gICAgfVxuICB9XG5cbiAgLy8gVHdlZW5zXG5cbiAgdmFyIGdldFR3ZWVuVmFsdWVzID0gZnVuY3Rpb24ocHJvcCwgdmFsdWVzLCB0eXBlLCB0YXJnZXQpIHtcbiAgICB2YXIgdmFsaWQgPSB7fTtcbiAgICBpZiAodHlwZSA9PT0gJ3RyYW5zZm9ybScpIHtcbiAgICAgIHZhbGlkLmZyb20gPSBwcm9wICsgJygnICsgYWRkRGVmYXVsdFRyYW5zZm9ybVVuaXQocHJvcCwgdmFsdWVzLmZyb20sIHZhbHVlcy50bykgKyAnKSc7XG4gICAgICB2YWxpZC50byA9IHByb3AgKyAnKCcgKyBhZGREZWZhdWx0VHJhbnNmb3JtVW5pdChwcm9wLCB2YWx1ZXMudG8pICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3JpZ2luYWxDU1MgPSAodHlwZSA9PT0gJ2NzcycpID8gZ2V0Q1NTVmFsdWUodGFyZ2V0LCBwcm9wKSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhbGlkLmZyb20gPSBnZXRWYWxpZFZhbHVlKHZhbHVlcywgdmFsdWVzLmZyb20sIG9yaWdpbmFsQ1NTKTtcbiAgICAgIHZhbGlkLnRvID0gZ2V0VmFsaWRWYWx1ZSh2YWx1ZXMsIHZhbHVlcy50bywgb3JpZ2luYWxDU1MpO1xuICAgIH1cbiAgICByZXR1cm4geyBmcm9tOiBkZWNvbXBvc2VWYWx1ZSh2YWxpZC5mcm9tKSwgdG86IGRlY29tcG9zZVZhbHVlKHZhbGlkLnRvKSB9O1xuICB9XG5cbiAgdmFyIGdldFR3ZWVuc1Byb3BzID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gW107XG4gICAgYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbihhbmltYXRhYmxlLCBpKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICByZXR1cm4gcHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgIHZhciBhbmltVHlwZSA9IGdldEFuaW1hdGlvblR5cGUodGFyZ2V0LCBwcm9wLm5hbWUpO1xuICAgICAgICBpZiAoYW5pbVR5cGUpIHtcbiAgICAgICAgICB2YXIgdmFsdWVzID0gZ2V0UHJvcGVydGllc1ZhbHVlcyh0YXJnZXQsIHByb3AubmFtZSwgcHJvcC52YWx1ZSwgaSk7XG4gICAgICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QocHJvcCk7XG4gICAgICAgICAgdHdlZW4uYW5pbWF0YWJsZXMgPSBhbmltYXRhYmxlO1xuICAgICAgICAgIHR3ZWVuLnR5cGUgPSBhbmltVHlwZTtcbiAgICAgICAgICB0d2Vlbi5mcm9tID0gZ2V0VHdlZW5WYWx1ZXMocHJvcC5uYW1lLCB2YWx1ZXMsIHR3ZWVuLnR5cGUsIHRhcmdldCkuZnJvbTtcbiAgICAgICAgICB0d2Vlbi50byA9IGdldFR3ZWVuVmFsdWVzKHByb3AubmFtZSwgdmFsdWVzLCB0d2Vlbi50eXBlLCB0YXJnZXQpLnRvO1xuICAgICAgICAgIHR3ZWVuLnJvdW5kID0gKGlzLmNvbCh2YWx1ZXMuZnJvbSkgfHwgdHdlZW4ucm91bmQpID8gMSA6IDA7XG4gICAgICAgICAgdHdlZW4uZGVsYXkgPSAoaXMuZm5jKHR3ZWVuLmRlbGF5KSA/IHR3ZWVuLmRlbGF5KHRhcmdldCwgaSwgYW5pbWF0YWJsZXMubGVuZ3RoKSA6IHR3ZWVuLmRlbGF5KSAvIGFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgICB0d2Vlbi5kdXJhdGlvbiA9IChpcy5mbmModHdlZW4uZHVyYXRpb24pID8gdHdlZW4uZHVyYXRpb24odGFyZ2V0LCBpLCBhbmltYXRhYmxlcy5sZW5ndGgpIDogdHdlZW4uZHVyYXRpb24pIC8gYW5pbWF0aW9uLnNwZWVkO1xuICAgICAgICAgIHR3ZWVuc1Byb3BzLnB1c2godHdlZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHdlZW5zUHJvcHM7XG4gIH1cblxuICB2YXIgZ2V0VHdlZW5zID0gZnVuY3Rpb24oYW5pbWF0YWJsZXMsIHByb3BzKSB7XG4gICAgdmFyIHR3ZWVuc1Byb3BzID0gZ2V0VHdlZW5zUHJvcHMoYW5pbWF0YWJsZXMsIHByb3BzKTtcbiAgICB2YXIgc3BsaXR0ZWRQcm9wcyA9IGdyb3VwQXJyYXlCeVByb3BzKHR3ZWVuc1Byb3BzLCBbJ25hbWUnLCAnZnJvbScsICd0bycsICdkZWxheScsICdkdXJhdGlvbiddKTtcbiAgICByZXR1cm4gc3BsaXR0ZWRQcm9wcy5tYXAoZnVuY3Rpb24odHdlZW5Qcm9wcykge1xuICAgICAgdmFyIHR3ZWVuID0gY2xvbmVPYmplY3QodHdlZW5Qcm9wc1swXSk7XG4gICAgICB0d2Vlbi5hbmltYXRhYmxlcyA9IHR3ZWVuUHJvcHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAuYW5pbWF0YWJsZXMgfSk7XG4gICAgICB0d2Vlbi50b3RhbER1cmF0aW9uID0gdHdlZW4uZGVsYXkgKyB0d2Vlbi5kdXJhdGlvbjtcbiAgICAgIHJldHVybiB0d2VlbjtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZXZlcnNlVHdlZW5zID0gZnVuY3Rpb24oYW5pbSwgZGVsYXlzKSB7XG4gICAgYW5pbS50d2VlbnMuZm9yRWFjaChmdW5jdGlvbih0d2Vlbikge1xuICAgICAgdmFyIHRvVmFsID0gdHdlZW4udG87XG4gICAgICB2YXIgZnJvbVZhbCA9IHR3ZWVuLmZyb207XG4gICAgICB2YXIgZGVsYXlWYWwgPSBhbmltLmR1cmF0aW9uIC0gKHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb24pO1xuICAgICAgdHdlZW4uZnJvbSA9IHRvVmFsO1xuICAgICAgdHdlZW4udG8gPSBmcm9tVmFsO1xuICAgICAgaWYgKGRlbGF5cykgdHdlZW4uZGVsYXkgPSBkZWxheVZhbDtcbiAgICB9KTtcbiAgICBhbmltLnJldmVyc2VkID0gYW5pbS5yZXZlcnNlZCA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuXG4gIHZhciBnZXRUd2VlbnNEdXJhdGlvbiA9IGZ1bmN0aW9uKHR3ZWVucykge1xuICAgIGlmICh0d2VlbnMubGVuZ3RoKSByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgdHdlZW5zLm1hcChmdW5jdGlvbih0d2Vlbil7IHJldHVybiB0d2Vlbi50b3RhbER1cmF0aW9uOyB9KSk7XG4gIH1cblxuICAvLyB3aWxsLWNoYW5nZVxuXG4gIHZhciBnZXRXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciBwcm9wcyA9IFtdO1xuICAgIHZhciBlbHMgPSBbXTtcbiAgICBhbmltLnR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uKHR3ZWVuKSB7XG4gICAgICBpZiAodHdlZW4udHlwZSA9PT0gJ2NzcycgfHwgdHdlZW4udHlwZSA9PT0gJ3RyYW5zZm9ybScgKSB7XG4gICAgICAgIHByb3BzLnB1c2godHdlZW4udHlwZSA9PT0gJ2NzcycgPyBzdHJpbmdUb0h5cGhlbnModHdlZW4ubmFtZSkgOiAndHJhbnNmb3JtJyk7XG4gICAgICAgIHR3ZWVuLmFuaW1hdGFibGVzLmZvckVhY2goZnVuY3Rpb24oYW5pbWF0YWJsZSkgeyBlbHMucHVzaChhbmltYXRhYmxlLnRhcmdldCk7IH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wZXJ0aWVzOiByZW1vdmVBcnJheUR1cGxpY2F0ZXMocHJvcHMpLmpvaW4oJywgJyksXG4gICAgICBlbGVtZW50czogcmVtb3ZlQXJyYXlEdXBsaWNhdGVzKGVscylcbiAgICB9XG4gIH1cblxuICB2YXIgc2V0V2lsbENoYW5nZSA9IGZ1bmN0aW9uKGFuaW0pIHtcbiAgICB2YXIgd2lsbENoYW5nZSA9IGdldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgd2lsbENoYW5nZS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGVsZW1lbnQuc3R5bGUud2lsbENoYW5nZSA9IHdpbGxDaGFuZ2UucHJvcGVydGllcztcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZW1vdmVXaWxsQ2hhbmdlID0gZnVuY3Rpb24oYW5pbSkge1xuICAgIHZhciB3aWxsQ2hhbmdlID0gZ2V0V2lsbENoYW5nZShhbmltKTtcbiAgICB3aWxsQ2hhbmdlLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnd2lsbC1jaGFuZ2UnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFN2ZyBwYXRoICovXG5cbiAgdmFyIGdldFBhdGhQcm9wcyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgZWwgPSBpcy5zdHIocGF0aCkgPyBzZWxlY3RTdHJpbmcocGF0aClbMF0gOiBwYXRoO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoOiBlbCxcbiAgICAgIHZhbHVlOiBlbC5nZXRUb3RhbExlbmd0aCgpXG4gICAgfVxuICB9XG5cbiAgdmFyIHNuYXBQcm9ncmVzc1RvUGF0aCA9IGZ1bmN0aW9uKHR3ZWVuLCBwcm9ncmVzcykge1xuICAgIHZhciBwYXRoRWwgPSB0d2Vlbi5wYXRoO1xuICAgIHZhciBwYXRoUHJvZ3Jlc3MgPSB0d2Vlbi52YWx1ZSAqIHByb2dyZXNzO1xuICAgIHZhciBwb2ludCA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgICAgdmFyIG8gPSBvZmZzZXQgfHwgMDtcbiAgICAgIHZhciBwID0gcHJvZ3Jlc3MgPiAxID8gdHdlZW4udmFsdWUgKyBvIDogcGF0aFByb2dyZXNzICsgbztcbiAgICAgIHJldHVybiBwYXRoRWwuZ2V0UG9pbnRBdExlbmd0aChwKTtcbiAgICB9XG4gICAgdmFyIHAgPSBwb2ludCgpO1xuICAgIHZhciBwMCA9IHBvaW50KC0xKTtcbiAgICB2YXIgcDEgPSBwb2ludCgrMSk7XG4gICAgc3dpdGNoICh0d2Vlbi5uYW1lKSB7XG4gICAgICBjYXNlICd0cmFuc2xhdGVYJzogcmV0dXJuIHAueDtcbiAgICAgIGNhc2UgJ3RyYW5zbGF0ZVknOiByZXR1cm4gcC55O1xuICAgICAgY2FzZSAncm90YXRlJzogcmV0dXJuIE1hdGguYXRhbjIocDEueSAtIHAwLnksIHAxLnggLSBwMC54KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgfVxuICB9XG5cbiAgLy8gUHJvZ3Jlc3NcblxuICB2YXIgZ2V0VHdlZW5Qcm9ncmVzcyA9IGZ1bmN0aW9uKHR3ZWVuLCB0aW1lKSB7XG4gICAgdmFyIGVsYXBzZWQgPSBNYXRoLm1pbihNYXRoLm1heCh0aW1lIC0gdHdlZW4uZGVsYXksIDApLCB0d2Vlbi5kdXJhdGlvbik7XG4gICAgdmFyIHBlcmNlbnQgPSBlbGFwc2VkIC8gdHdlZW4uZHVyYXRpb247XG4gICAgdmFyIHByb2dyZXNzID0gdHdlZW4udG8ubnVtYmVycy5tYXAoZnVuY3Rpb24obnVtYmVyLCBwKSB7XG4gICAgICB2YXIgc3RhcnQgPSB0d2Vlbi5mcm9tLm51bWJlcnNbcF07XG4gICAgICB2YXIgZWFzZWQgPSBlYXNpbmdzW3R3ZWVuLmVhc2luZ10ocGVyY2VudCwgdHdlZW4uZWxhc3RpY2l0eSk7XG4gICAgICB2YXIgdmFsID0gdHdlZW4ucGF0aCA/IHNuYXBQcm9ncmVzc1RvUGF0aCh0d2VlbiwgZWFzZWQpIDogc3RhcnQgKyBlYXNlZCAqIChudW1iZXIgLSBzdGFydCk7XG4gICAgICB2YWwgPSB0d2Vlbi5yb3VuZCA/IE1hdGgucm91bmQodmFsICogdHdlZW4ucm91bmQpIC8gdHdlZW4ucm91bmQgOiB2YWw7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuICAgIHJldHVybiByZWNvbXBvc2VWYWx1ZShwcm9ncmVzcywgdHdlZW4udG8uc3RyaW5ncywgdHdlZW4uZnJvbS5zdHJpbmdzKTtcbiAgfVxuXG4gIHZhciBzZXRBbmltYXRpb25Qcm9ncmVzcyA9IGZ1bmN0aW9uKGFuaW0sIHRpbWUpIHtcbiAgICB2YXIgdHJhbnNmb3JtcztcbiAgICBhbmltLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgICBhbmltLnByb2dyZXNzID0gKHRpbWUgLyBhbmltLmR1cmF0aW9uKSAqIDEwMDtcbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IGFuaW0udHdlZW5zLmxlbmd0aDsgdCsrKSB7XG4gICAgICB2YXIgdHdlZW4gPSBhbmltLnR3ZWVuc1t0XTtcbiAgICAgIHR3ZWVuLmN1cnJlbnRWYWx1ZSA9IGdldFR3ZWVuUHJvZ3Jlc3ModHdlZW4sIHRpbWUpO1xuICAgICAgdmFyIHByb2dyZXNzID0gdHdlZW4uY3VycmVudFZhbHVlO1xuICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB0d2Vlbi5hbmltYXRhYmxlcy5sZW5ndGg7IGErKykge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZSA9IHR3ZWVuLmFuaW1hdGFibGVzW2FdO1xuICAgICAgICB2YXIgaWQgPSBhbmltYXRhYmxlLmlkO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gYW5pbWF0YWJsZS50YXJnZXQ7XG4gICAgICAgIHZhciBuYW1lID0gdHdlZW4ubmFtZTtcbiAgICAgICAgc3dpdGNoICh0d2Vlbi50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnY3NzJzogdGFyZ2V0LnN0eWxlW25hbWVdID0gcHJvZ3Jlc3M7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6IHRhcmdldC5zZXRBdHRyaWJ1dGUobmFtZSwgcHJvZ3Jlc3MpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdvYmplY3QnOiB0YXJnZXRbbmFtZV0gPSBwcm9ncmVzczsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXMpIHRyYW5zZm9ybXMgPSB7fTtcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybXNbaWRdKSB0cmFuc2Zvcm1zW2lkXSA9IFtdO1xuICAgICAgICAgIHRyYW5zZm9ybXNbaWRdLnB1c2gocHJvZ3Jlc3MpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgICBpZiAoIXRyYW5zZm9ybSkgdHJhbnNmb3JtID0gKGdldENTU1ZhbHVlKGRvY3VtZW50LmJvZHksIHRyYW5zZm9ybVN0cikgPyAnJyA6ICctd2Via2l0LScpICsgdHJhbnNmb3JtU3RyO1xuICAgICAgZm9yICh2YXIgdCBpbiB0cmFuc2Zvcm1zKSB7XG4gICAgICAgIGFuaW0uYW5pbWF0YWJsZXNbdF0udGFyZ2V0LnN0eWxlW3RyYW5zZm9ybV0gPSB0cmFuc2Zvcm1zW3RdLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFuaW0uc2V0dGluZ3MudXBkYXRlKSBhbmltLnNldHRpbmdzLnVwZGF0ZShhbmltKTtcbiAgfVxuXG4gIC8vIEFuaW1hdGlvblxuXG4gIHZhciBjcmVhdGVBbmltYXRpb24gPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICB2YXIgYW5pbSA9IHt9O1xuICAgIGFuaW0uYW5pbWF0YWJsZXMgPSBnZXRBbmltYXRhYmxlcyhwYXJhbXMudGFyZ2V0cyk7XG4gICAgYW5pbS5zZXR0aW5ncyA9IG1lcmdlT2JqZWN0cyhwYXJhbXMsIGRlZmF1bHRTZXR0aW5ncyk7XG4gICAgYW5pbS5wcm9wZXJ0aWVzID0gZ2V0UHJvcGVydGllcyhwYXJhbXMsIGFuaW0uc2V0dGluZ3MpO1xuICAgIGFuaW0udHdlZW5zID0gZ2V0VHdlZW5zKGFuaW0uYW5pbWF0YWJsZXMsIGFuaW0ucHJvcGVydGllcyk7XG4gICAgYW5pbS5kdXJhdGlvbiA9IGdldFR3ZWVuc0R1cmF0aW9uKGFuaW0udHdlZW5zKSB8fCBwYXJhbXMuZHVyYXRpb247XG4gICAgYW5pbS5jdXJyZW50VGltZSA9IDA7XG4gICAgYW5pbS5wcm9ncmVzcyA9IDA7XG4gICAgYW5pbS5lbmRlZCA9IGZhbHNlO1xuICAgIHJldHVybiBhbmltO1xuICB9XG5cbiAgLy8gUHVibGljXG5cbiAgdmFyIGFuaW1hdGlvbnMgPSBbXTtcbiAgdmFyIHJhZiA9IDA7XG5cbiAgdmFyIGVuZ2luZSA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgcGxheSA9IGZ1bmN0aW9uKCkgeyByYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7IH07XG4gICAgdmFyIHN0ZXAgPSBmdW5jdGlvbih0KSB7XG4gICAgICBpZiAoYW5pbWF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb25zLmxlbmd0aDsgaSsrKSBhbmltYXRpb25zW2ldLnRpY2sodCk7XG4gICAgICAgIHBsYXkoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZik7XG4gICAgICAgIHJhZiA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwbGF5O1xuICB9KSgpO1xuXG4gIHZhciBhbmltYXRpb24gPSBmdW5jdGlvbihwYXJhbXMpIHtcblxuICAgIHZhciBhbmltID0gY3JlYXRlQW5pbWF0aW9uKHBhcmFtcyk7XG4gICAgdmFyIHRpbWUgPSB7fTtcblxuICAgIGFuaW0udGljayA9IGZ1bmN0aW9uKG5vdykge1xuICAgICAgYW5pbS5lbmRlZCA9IGZhbHNlO1xuICAgICAgaWYgKCF0aW1lLnN0YXJ0KSB0aW1lLnN0YXJ0ID0gbm93O1xuICAgICAgdGltZS5jdXJyZW50ID0gTWF0aC5taW4oTWF0aC5tYXgodGltZS5sYXN0ICsgbm93IC0gdGltZS5zdGFydCwgMCksIGFuaW0uZHVyYXRpb24pO1xuICAgICAgc2V0QW5pbWF0aW9uUHJvZ3Jlc3MoYW5pbSwgdGltZS5jdXJyZW50KTtcbiAgICAgIHZhciBzID0gYW5pbS5zZXR0aW5ncztcbiAgICAgIGlmIChzLmJlZ2luICYmIHRpbWUuY3VycmVudCA+PSBzLmRlbGF5KSB7IHMuYmVnaW4oYW5pbSk7IHMuYmVnaW4gPSB1bmRlZmluZWQ7IH07XG4gICAgICBpZiAodGltZS5jdXJyZW50ID49IGFuaW0uZHVyYXRpb24pIHtcbiAgICAgICAgaWYgKHMubG9vcCkge1xuICAgICAgICAgIHRpbWUuc3RhcnQgPSBub3c7XG4gICAgICAgICAgaWYgKHMuZGlyZWN0aW9uID09PSAnYWx0ZXJuYXRlJykgcmV2ZXJzZVR3ZWVucyhhbmltLCB0cnVlKTtcbiAgICAgICAgICBpZiAoaXMubnVtKHMubG9vcCkpIHMubG9vcC0tO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuaW0uZW5kZWQgPSB0cnVlO1xuICAgICAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgICAgICBpZiAocy5jb21wbGV0ZSkgcy5jb21wbGV0ZShhbmltKTtcbiAgICAgICAgfVxuICAgICAgICB0aW1lLmxhc3QgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFuaW0uc2VlayA9IGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgICBzZXRBbmltYXRpb25Qcm9ncmVzcyhhbmltLCAocHJvZ3Jlc3MgLyAxMDApICogYW5pbS5kdXJhdGlvbik7XG4gICAgfVxuXG4gICAgYW5pbS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVtb3ZlV2lsbENoYW5nZShhbmltKTtcbiAgICAgIHZhciBpID0gYW5pbWF0aW9ucy5pbmRleE9mKGFuaW0pO1xuICAgICAgaWYgKGkgPiAtMSkgYW5pbWF0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuXG4gICAgYW5pbS5wbGF5ID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICBhbmltLnBhdXNlKCk7XG4gICAgICBpZiAocGFyYW1zKSBhbmltID0gbWVyZ2VPYmplY3RzKGNyZWF0ZUFuaW1hdGlvbihtZXJnZU9iamVjdHMocGFyYW1zLCBhbmltLnNldHRpbmdzKSksIGFuaW0pO1xuICAgICAgdGltZS5zdGFydCA9IDA7XG4gICAgICB0aW1lLmxhc3QgPSBhbmltLmVuZGVkID8gMCA6IGFuaW0uY3VycmVudFRpbWU7XG4gICAgICB2YXIgcyA9IGFuaW0uc2V0dGluZ3M7XG4gICAgICBpZiAocy5kaXJlY3Rpb24gPT09ICdyZXZlcnNlJykgcmV2ZXJzZVR3ZWVucyhhbmltKTtcbiAgICAgIGlmIChzLmRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScgJiYgIXMubG9vcCkgcy5sb29wID0gMTtcbiAgICAgIHNldFdpbGxDaGFuZ2UoYW5pbSk7XG4gICAgICBhbmltYXRpb25zLnB1c2goYW5pbSk7XG4gICAgICBpZiAoIXJhZikgZW5naW5lKCk7XG4gICAgfVxuXG4gICAgYW5pbS5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYW5pbS5yZXZlcnNlZCkgcmV2ZXJzZVR3ZWVucyhhbmltKTtcbiAgICAgIGFuaW0ucGF1c2UoKTtcbiAgICAgIGFuaW0uc2VlaygwKTtcbiAgICAgIGFuaW0ucGxheSgpO1xuICAgIH1cblxuICAgIGlmIChhbmltLnNldHRpbmdzLmF1dG9wbGF5KSBhbmltLnBsYXkoKTtcblxuICAgIHJldHVybiBhbmltO1xuXG4gIH1cblxuICAvLyBSZW1vdmUgb25lIG9yIG11bHRpcGxlIHRhcmdldHMgZnJvbSBhbGwgYWN0aXZlIGFuaW1hdGlvbnMuXG5cbiAgdmFyIHJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgdmFyIHRhcmdldHMgPSBmbGF0dGVuQXJyYXkoaXMuYXJyKGVsZW1lbnRzKSA/IGVsZW1lbnRzLm1hcCh0b0FycmF5KSA6IHRvQXJyYXkoZWxlbWVudHMpKTtcbiAgICBmb3IgKHZhciBpID0gYW5pbWF0aW9ucy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBhbmltYXRpb24gPSBhbmltYXRpb25zW2ldO1xuICAgICAgdmFyIHR3ZWVucyA9IGFuaW1hdGlvbi50d2VlbnM7XG4gICAgICBmb3IgKHZhciB0ID0gdHdlZW5zLmxlbmd0aC0xOyB0ID49IDA7IHQtLSkge1xuICAgICAgICB2YXIgYW5pbWF0YWJsZXMgPSB0d2VlbnNbdF0uYW5pbWF0YWJsZXM7XG4gICAgICAgIGZvciAodmFyIGEgPSBhbmltYXRhYmxlcy5sZW5ndGgtMTsgYSA+PSAwOyBhLS0pIHtcbiAgICAgICAgICBpZiAoYXJyYXlDb250YWlucyh0YXJnZXRzLCBhbmltYXRhYmxlc1thXS50YXJnZXQpKSB7XG4gICAgICAgICAgICBhbmltYXRhYmxlcy5zcGxpY2UoYSwgMSk7XG4gICAgICAgICAgICBpZiAoIWFuaW1hdGFibGVzLmxlbmd0aCkgdHdlZW5zLnNwbGljZSh0LCAxKTtcbiAgICAgICAgICAgIGlmICghdHdlZW5zLmxlbmd0aCkgYW5pbWF0aW9uLnBhdXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0aW9uLnZlcnNpb24gPSB2ZXJzaW9uO1xuICBhbmltYXRpb24uc3BlZWQgPSAxO1xuICBhbmltYXRpb24ubGlzdCA9IGFuaW1hdGlvbnM7XG4gIGFuaW1hdGlvbi5yZW1vdmUgPSByZW1vdmU7XG4gIGFuaW1hdGlvbi5lYXNpbmdzID0gZWFzaW5ncztcbiAgYW5pbWF0aW9uLmdldFZhbHVlID0gZ2V0SW5pdGlhbFRhcmdldFZhbHVlO1xuICBhbmltYXRpb24ucGF0aCA9IGdldFBhdGhQcm9wcztcbiAgYW5pbWF0aW9uLnJhbmRvbSA9IHJhbmRvbTtcblxuICByZXR1cm4gYW5pbWF0aW9uO1xuXG59KSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
