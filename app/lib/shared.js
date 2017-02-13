
/********************************
 *	Application access modes
 *	Manage: Add/Edit/Delete allowed
 *	View: Add/Edit/Delete Not allowed
 *********************************/
var accessAdmin = 'Manage';
var accessViewer = 'View';
var accessNone = 'NONE';

/***************************** scroll config ***********************************/
var listscrolltable = {
    // width in pixels of the visible scroll area
    width: 'auto',
    // height in pixels of the visible scroll area
    height: '442px',
    // width in pixels of the scrollbar and rail
    size: '7px',
    // scrollbar color, accepts any hex/color value
    color: '#fff',
    // scrollbar position - left/right
    position: 'right',
    // distance in pixels between the side edge and the scrollbar
    distance: '1px',
    // default scroll position on load - top / bottom / $('selector')
    start: 'top',
    // sets scrollbar opacity
    opacity: .4,
    // enables always-on mode for the scrollbar
    alwaysVisible: false,
    // check if we should hide the scrollbar when user is hovering over
    disableFadeOut: false,
    // sets visibility of the rail
    railVisible: false,
    // sets rail color
    railColor: '#333',
    // sets rail opacity
    railOpacity: .2,
    // whether  we should use jQuery UI Draggable to enable bar dragging
    railDraggable: true,
    // defautlt CSS class of the slimscroll rail
    railClass: 'slimScrollRail',
    // defautlt CSS class of the slimscroll bar
    barClass: 'slimScrollBar',
    // defautlt CSS class of the slimscroll wrapper
    wrapperClass: 'slimScrollDiv',
    // check if mousewheel should scroll the window if we reach top/bottom
    allowPageScroll: false,
    // scroll amount applied to each mouse wheel step
    wheelStep: 20,
    // scroll amount applied when user is using gestures
    touchScrollStep: 200,
    // sets border radius
    borderRadius: '7px',
    // sets border radius of the rail
    railBorderRadius: '7px'
};

var listscrollrightdiv = {
    // width in pixels of the visible scroll area
    width: '100%',
    // height in pixels of the visible scroll area
    height: '453px',
    // width in pixels of the scrollbar and rail
    size: '7px',
    // scrollbar color, accepts any hex/color value
    color: '#fff',
    // scrollbar position - left/right
    position: 'right',
    // distance in pixels between the side edge and the scrollbar
    distance: '1px',
    // default scroll position on load - top / bottom / $('selector')
    start: 'top',
    // sets scrollbar opacity
    opacity: .4,
    // enables always-on mode for the scrollbar
    alwaysVisible: false,
    // check if we should hide the scrollbar when user is hovering over
    disableFadeOut: false,
    // sets visibility of the rail
    railVisible: false,
    // sets rail color
    railColor: '#333',
    // sets rail opacity
    railOpacity: .2,
    // whether  we should use jQuery UI Draggable to enable bar dragging
    railDraggable: true,
    // defautlt CSS class of the slimscroll rail
    railClass: 'slimScrollRail',
    // defautlt CSS class of the slimscroll bar
    barClass: 'slimScrollBar',
    // defautlt CSS class of the slimscroll wrapper
    wrapperClass: 'slimScrollDiv',
    // check if mousewheel should scroll the window if we reach top/bottom
    allowPageScroll: false,
    // scroll amount applied to each mouse wheel step
    wheelStep: 20,
    // scroll amount applied when user is using gestures
    touchScrollStep: 200,
    // sets border radius
    borderRadius: '7px',
    // sets border radius of the rail
    railBorderRadius: '7px'
};

var listscrollrightinnerdiv = {
    // width in pixels of the visible scroll area
    width: 'auto',
    // height in pixels of the visible scroll area
    height: '150px',
    // width in pixels of the scrollbar and rail
    size: '7px',
    // scrollbar color, accepts any hex/color value
    color: '#fff',
    // scrollbar position - left/right
    position: 'right',
    // distance in pixels between the side edge and the scrollbar
    distance: '1px',
    // default scroll position on load - top / bottom / $('selector')
    start: 'top',
    // sets scrollbar opacity
    opacity: .4,
    // enables always-on mode for the scrollbar
    alwaysVisible: false,
    // check if we should hide the scrollbar when user is hovering over
    disableFadeOut: false,
    // sets visibility of the rail
    railVisible: false,
    // sets rail color
    railColor: '#333',
    // sets rail opacity
    railOpacity: .2,
    // whether  we should use jQuery UI Draggable to enable bar dragging
    railDraggable: true,
    // defautlt CSS class of the slimscroll rail
    railClass: 'slimScrollRail',
    // defautlt CSS class of the slimscroll bar
    barClass: 'slimScrollBar',
    // defautlt CSS class of the slimscroll wrapper
    wrapperClass: 'slimScrollDiv',
    // check if mousewheel should scroll the window if we reach top/bottom
    allowPageScroll: false,
    // scroll amount applied to each mouse wheel step
    wheelStep: 20,
    // scroll amount applied when user is using gestures
    touchScrollStep: 200,
    // sets border radius
    borderRadius: '7px',
    // sets border radius of the rail
    railBorderRadius: '7px'
};
/***************************** scroll End ***********************************/

/***************************** pagination config ***********************************/
var itemsByPage = 20;
var paginationPageSizes = [20, 50, 100];

var scrollBy = {
    20: 10,
    50: 25,
    100:29
};
// Default tablestate for re-generating smart table explicitly
var tableState = {
    "pagination": {"start": 0, "number": itemsByPage},
    "search": {},
    "sort": {"predicate": "name", "reverse": false}
};

// Store the pagination size in $cookieStore 
var paginationStore = {
    "application" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "action" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "function" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "resource" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },    
    "policy" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "role" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "resourceType" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "resourceGroup" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "source" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "systemadministrator" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "user" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "group" : {
        "paginationSize":itemsByPage,
        "orderBy":"asc"
    },
    "resourceGroupResources" : {
        "paginationSize":itemsByPage,	//10
        "orderBy":"asc"
    },
    "roleMembers" : {
        "paginationSize":itemsByPage,	//10
        "orderBy":"asc"
    },
}
/***************************** pagination end ***********************************/

// Default settings for the angular-scroll
var angularscroll = {
    "offset": 0,
    "duration": 500
};


/* 
 * Global function to return User friendly Messages 
 * Section can be Application/Function/Resource Type/Action etc.
 * Mode is optional
 */
function getErrorMessage(objError, section, objCustom) {

    if (objCustom == undefined) {
        objCustom = {};
    }

    var displayValue = (objCustom.displayValue != undefined && objCustom.displayValue != null && objCustom.displayValue != '') ? ' "' + objCustom.displayValue + '"' : '';
    var mode = (objCustom.mode != undefined && objCustom.mode != null && objCustom.mode != '') ? objCustom.mode : '';

    var _errors = {
        400: 'Bad request for ' + section,
        403: 'Denied to get ' + section + ' as per administration policies',
        404: 'No ' + section + ' found for ID',
        405: section + ' operation not allowed!',
        409: section + displayValue + ' conflicts with existing ' + section + '!',
        413: section + ' has exceeeded the configured limit!',
        500: section + ' could not perform requested action!',
        503: 'Service temporarily unavailable!'
    }

    if (_errors[objError.status]) {
        var errorMessage = _errors[objError.status];
        return errorMessage;
    } else {
        return "Please contact system administrator.";
    }

}// EO getErrorMessage()

/* 
 * Global function to return User friendly Messages 
 * Section can be Application/Function/Resource Type/Action etc.
 * Mode can be insert/delete/update etc.
 */
function getSuccessMessage(section, objCustom) {

    if (objCustom == undefined) {
        objCustom = {};
    }

    var displayValue = (objCustom.displayValue != undefined && objCustom.displayValue != null && objCustom.displayValue != '') ? ' "'+objCustom.displayValue+'"' : '';
    var mode = (objCustom.mode != undefined && objCustom.mode != null && objCustom.mode != '') ? objCustom.mode : '';

    var _success = {
        'insert': section + displayValue + ' Created successfully!',
        'update': section + displayValue + ' Updated successfully!',
        'delete': section + displayValue + ' Deleted successfully!',
    }

    if (_success[mode]) {
        var successMessage = _success[mode];
        return successMessage;
    } else {
        return "Success!";
    }

}// EO getSuccessMessage()


/*
 * Perform an action (callbackFn) when user clicks on child elements
 * present inside the provide parent element (parentClass).
 * 
 */
function closeWhenClickingElsewhere(event, callbackFn, parentClass) {

    var element = event.target;
    if (!element)
        return;

    var clickedOnPopup = false;
    // Check up to 10 levels up the DOM tree
    for (var i = 0; i < 20 && element && !clickedOnPopup; i++) {
        var elementClasses = element.classList;
        if (elementClasses !== undefined && elementClasses.contains(parentClass)) {
            clickedOnPopup = true;
            break;
        }
        else {
            element = element.parentElement;
        }
    }

    if (!clickedOnPopup) {
        //alert('inside callback!');
        callbackFn();
    }
}

function findAndRemove(array, searchArray) {
    $.each(array, function (index, result) {
        if (!angular.isUndefined(result)) {
            if (result[searchArray['property']] == searchArray['value']) {
                //Remove from array
                array.splice(index, 1);
            }
        }
    });
}

function searchAndUpdate(array, replaceArray) {
    if (!angular.isUndefined(obj)) {
        var obj = array.filter(function (obj) {
            return obj.uid === replaceArray['find'];
        })[0];
        obj.permission = replaceArray['replace'];
    }
}

/*Constraint var used in the report*/
var constraint = 'Constraint';