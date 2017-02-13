//(function () {
// class helper functions from bonzo https://github.com/ded/bonzo

function classReg(className) {
    return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ('classList' in document.documentElement) {
    hasClass = function (elem, c) {
        return elem.classList.contains(c);
    };
    addClass = function (elem, c) {
        elem.classList.add(c);
    };
    removeClass = function (elem, c) {
        elem.classList.remove(c);
    };
}
else {
    hasClass = function (elem, c) {
        return classReg(c).test(elem.className);
    };
    addClass = function (elem, c) {
        if (!hasClass(elem, c)) {
            elem.className = elem.className + ' ' + c;
        }
    };
    removeClass = function (elem, c) {
        elem.className = elem.className.replace(classReg(c), ' ');
    };
}

function toggleClass(elem, c) {
    var fn = hasClass(elem, c) ? removeClass : addClass;
    fn(elem, c);
}

var classie = {
    // full names
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    // short names
    has: hasClass,
    add: addClass,
    remove: removeClass,
    toggle: toggleClass
};

// transport
if (typeof define === 'function' && define.amd) {
    // AMD
    define(classie);
} else {
    // browser global
    window.classie = classie;
}


function triggerButton(mode) {

    
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
    var triggerBttn = document.getElementById(mode);
//    var overlay = document.querySelector('div.overlay');
//    //var closeBttn = overlay.querySelector('button.overlay-close');
//
//
    transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    },
    transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ],
            support = {transitions: Modernizr.csstransitions};
//    
//
    triggerBttn.addEventListener('click', toggleOverlay);
    //toggleOverlay();
}

function closeButton(mode) {
    //alert(mode);
    //var triggerBttn = document.getElementById('trigger-overlay');
//    var overlay = document.querySelector('div.overlay');
//    var closeBttn = overlay.querySelector('button.overlay-close');
    //var closeBttn = overlay.querySelector('button.add_overlay-close');
  
//    transEndEventNames = {
//        'WebkitTransition': 'webkitTransitionEnd',
//        'MozTransition': 'transitionend',
//        'OTransition': 'oTransitionEnd',
//        'msTransition': 'MSTransitionEnd',
//        'transition': 'transitionend'
//    },
//    transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ],
//            support = {transitions: Modernizr.csstransitions};
    
//    closeBttn.addEventListener('click', toggleOverlay);
document.documentElement.style.overflow = 'auto';  // firefox, chrome
    document.body.scroll = "yes"; // ie only
toggleOverlay();
}

function toggleOverlay() {
    //alert("In toggle");
    var overlay = document.querySelector('div.overlay');
    //alert(classie.has(overlay, 'open'));
    if (classie.has(overlay, 'open')) {
        classie.remove(overlay, 'open');
        classie.add(overlay, 'close');
        var onEndTransitionFn = function (ev) {
            if (support.transitions) {
                if (ev.propertyName !== 'visibility')
                    return;
                this.removeEventListener(transEndEventName, onEndTransitionFn);
            }
            classie.remove(overlay, 'close');
        };
        if (support.transitions) {
            overlay.addEventListener(transEndEventName, onEndTransitionFn);
        }
        else {
            onEndTransitionFn();
        }
    }
    else if (!classie.has(overlay, 'close')) {
        classie.add(overlay, 'open');
    }
}




//})();