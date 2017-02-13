define(['app/app', 'angularAMD'], function (app)
{

    app.service('appConfig', function appConfig($rootScope) {

        /* Application Access - Starts */
        $rootScope.accessAdmin = accessAdmin;
        $rootScope.accessViewer = accessViewer;
        $rootScope.accessNone = accessNone;
        /* Application Access - Ends */

        /* common scroll bar for list table and right nav */
        $rootScope.listscrolltable = listscrolltable;
        $rootScope.listscrollrightdiv = listscrollrightdiv;
        $rootScope.listscrollrightinnerdiv = listscrollrightinnerdiv;
        /* common scroll bar for list table - END */

        /* common pagination variable */
        $rootScope.itemsByPage = itemsByPage;
        $rootScope.paginationPageSizes = paginationPageSizes;
        $rootScope.tableState = tableState;
        /* common pagination variable ends */

        /* Common functions - starts */
        $rootScope.getErrorMessage = getErrorMessage;
        $rootScope.getSuccessMessage = getSuccessMessage;
        /* Common functions - ends */

        /*Auto scroll the div to top Start */
        $rootScope.angularscroll = angularscroll;
        /*auto scroll the div to top  Ends*/

        /*Left list scroll proportion Starts */
        $rootScope.scrollBy = scrollBy;
        /*Left list scroll proportion Ends */

        /*Set the pagination size in $cookieStore Starts*/
        $rootScope.paginationStore = paginationStore;
        /*Set the pagination size in $cookieStore Ends*/

        /**
         * Load dependent file config/conf.js in app.js that has _environment variable defined
         */
        return {
            getEnvironment: function () {
                var hostName = window.location.host;
                var hostArray = hostName.split(":");
                var host = hostArray[0];

                if (_environment) {
                    return _environment;
                }

                for (var environment in _environments) {
                    if (typeof _environments[environment].host && _environments[environment].host == host) {
                        _environment = environment;
                        return _environment;
                    }
                }

                return null;
            },
            getEnvConfig: function () {
                return _environments[this.getEnvironment()].config;
            },
            get: function (property) {
                return _environments[this.getEnvironment()].config[property];
            }
        }

    });

    app.service('toasterService', function (toastr, $location) {
        var loaderToast;
        this.showToastr = function (message, type, redirectpath) {
            switch (type) {
                case 'success':
                    if (redirectpath != 'undefined') {
                        $location.path(redirectpath);
                    }

                    $(document).scrollTop(0);
                    angular.element(document).ready(function () {
                        toastr.success(message, '', {
                            timeOut: 5000
                        });
                    });
                    break;

                case 'error':
                    $(document).scrollTop(0);
                    $('#toastrOverlay').show();
                    toastr.error(message, '', {
                        //closeButton: true
                    });
                    break;
                case 'denied':
                    $(document).scrollTop(0);
                    $('#toastrOverlay').show();
                    toastr.error(message, '', {
                        //closeButton: true
                        onHidden: function (a) {
                            //window.history.back();
                        }
                    });
                    break;
                case 'warning':
                    $(document).scrollTop(0);
                    $('#toastrOverlay').show();
                    toastr.clear();
                    loaderToast = toastr.warning(message, '', {
                        tapToDismiss: false,
                        allowHtml: true
                    });
                    break;

                case 'loader':
                default:
                    $(document).scrollTop(0);
                    $('#toastrOverlay').show();
                    loaderToast = toastr.info(message, '', {
                        tapToDismiss: false,
                        allowHtml: true
                    });
                    break;

            }

        };
        this.hideToastr = function (hideOverlay) {
            if (hideOverlay !== false) {
                $('#toastrOverlay').hide();
            }
            toastr.clear(loaderToast);
        };
    });


    app.service('Base64',
            [
                function ()
                {

                    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                    return {
                        encode: function (input) {
                            var output = "";
                            var chr1, chr2, chr3 = "";
                            var enc1, enc2, enc3, enc4 = "";
                            var i = 0;
                            do {
                                chr1 = input.charCodeAt(i++);
                                chr2 = input.charCodeAt(i++);
                                chr3 = input.charCodeAt(i++);
                                enc1 = chr1 >> 2;
                                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                                enc4 = chr3 & 63;
                                if (isNaN(chr2)) {
                                    enc3 = enc4 = 64;
                                } else if (isNaN(chr3)) {
                                    enc4 = 64;
                                }

                                output = output +
                                        keyStr.charAt(enc1) +
                                        keyStr.charAt(enc2) +
                                        keyStr.charAt(enc3) +
                                        keyStr.charAt(enc4);
                                chr1 = chr2 = chr3 = "";
                                enc1 = enc2 = enc3 = enc4 = "";
                            } while (i < input.length);
                            return output;
                        },
                        decode: function (input) {
                            var output = "";
                            var chr1, chr2, chr3 = "";
                            var enc1, enc2, enc3, enc4 = "";
                            var i = 0;
                            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                            var base64test = /[^A-Za-z0-9\+\/\=]/g;
                            if (base64test.exec(input)) {
                                window.alert("There were invalid base64 characters in the input text.\n" +
                                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                                        "Expect errors in decoding.");
                            }
                            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                            do {
                                enc1 = keyStr.indexOf(input.charAt(i++));
                                enc2 = keyStr.indexOf(input.charAt(i++));
                                enc3 = keyStr.indexOf(input.charAt(i++));
                                enc4 = keyStr.indexOf(input.charAt(i++));
                                chr1 = (enc1 << 2) | (enc2 >> 4);
                                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                                chr3 = ((enc3 & 3) << 6) | enc4;
                                output = output + String.fromCharCode(chr1);
                                if (enc3 != 64) {
                                    output = output + String.fromCharCode(chr2);
                                }
                                if (enc4 != 64) {
                                    output = output + String.fromCharCode(chr3);
                                }

                                chr1 = chr2 = chr3 = "";
                                enc1 = enc2 = enc3 = enc4 = "";
                            } while (i < input.length);
                            return output;
                        }
                    };
                }
            ]);
    app.directive('focusOn', function ($timeout) {
        return {
            scope: {trigger: '=focusOn'},
            link: function (scope, element) {
                scope.$watch('trigger', function (value) {
                    if (value === true) {
                        $timeout(function () {
                            //console.log('trigger', value);
                            element[0].focus();
                            scope.trigger = false;
                        }, 500);
                    }
                });
            }
        };
    });
    app.filter('capitalize', function () {
        return function (input) {
            return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
        }
    });
    app.factory('myCache', ['$cacheFactory', function ($cacheFactory, storeName) {
            return $cacheFactory(storeName);
        }]);

    /*
     * This service will help in sharing/accessing data within a module
     * Used in Resources module
     */
    app.factory('resourceShareDataService', function () {
        var resourceSharedData = {};
        function set(data) {
            resourceSharedData = data;
        }
        function get() {
            return resourceSharedData;
        }
        function reset() {
            return resourceSharedData = {};
        }

        return {
            set: set,
            get: get,
            reset: reset
        };
    });

    /*
     * This service will help in sharing/accessing data within a module
     * Used in Resource groups module
     */
    app.factory('resourcegroupShareDataService', function () {
        var resourcegroupSharedData = {};
        function set(data) {
            resourcegroupSharedData = data;
        }
        function get() {
            return resourcegroupSharedData;
        }
        function reset() {
            return resourcegroupSharedData = {};
        }

        return {
            set: set,
            get: get,
            reset: reset
        };
    });


    /*
     * This service will help in storing data for Access Denied page flag
     */
    app.factory('accessDeniedService', function () {
        var accessData = {};
        function set(data) {
            accessData = data;
        }
        function get() {
            return accessData;
        }
        function reset() {
            return accessData = {};
        }

        return {
            set: set,
            get: get,
            reset: reset
        }
    });

    /*
     * This service will help in user advance search 
     */
    app.factory('advnaceUserSearch', function () {
        var userSearchData = {};
        function set(data) {
            userSearchData = data;
        }
        function get() {
            return userSearchData;
        }
        function reset() {
            return userSearchData = {};
        }

        return {
            set: set,
            get: get,
            reset: reset
        }
    });
    /*
     * This is an Important Access Service to check and validate access 
     * of application for a logged in user.
     */
    app.service('accessService', function ($rootScope, $location, accessDeniedService, toasterService) {

        function checkAccessDeny() {            
            var accessDecision = JSON.parse(localStorage.getItem('accessDecision'));
            //var accessDenied = (accessDeniedService.get().accessDeniedFlag != null) ? accessDeniedService.get().accessDeniedFlag : false;
            var accessDenied = (accessDecision != null) ? accessDecision.accessDeniedFlag : false;           
            if (accessDenied) {
                //var accessDeniedSection = (accessDeniedService.get().accessDeniedSection != null) ? accessDeniedService.get().accessDeniedSection : 'Page';
                var accessDeniedSection = (accessDecision != null) ? accessDecision.accessDeniedSection : 'Page';
                message = $rootScope.translation.toaster.ACCESS_DENY + " " + accessDeniedSection + "!";
                toasterService.showToastr(message, 'error');
                accessDeniedService.reset();
                localStorage.removeItem('accessDecision');
            }// EO if($scope.accessDenied)
        }// EO checkAccessDeny()

        function checkAccess(module, section, role) {
            if (role == undefined || role == "undefined" || role == '') {
                role = 'admin';
            }
            if (role == 'super') {
                if ($rootScope.superaccess[module] != undefined) {
                    if ($rootScope.superaccess[module] != $rootScope.accessAdmin) {
                        var accessDecision = {
                            "accessDeniedFlag": true,
                            "accessDeniedSection": section
                        };
                        accessDeniedService.set(accessDecision);
                        localStorage.setItem('accessDecision', JSON.stringify(accessDecision));
                        window.history.back();

                    }
                }
            } else {
                if ($rootScope.access[module] != undefined) {
                    if ($rootScope.access[module] != $rootScope.accessAdmin) {
                        var accessDecision = {
                            "accessDeniedFlag": true,
                            "accessDeniedSection": section
                        };
                        accessDeniedService.set(accessDecision);
                        localStorage.setItem('accessDecision', JSON.stringify(accessDecision));
                        window.history.back();
                    }
                }
            }
            
        }// EO checkAccess(module)

        return {
            checkAccessDeny: checkAccessDeny,
            checkAccess: checkAccess
        }
    });


    app.directive('arrowSelector', ['$document', function ($document) {
            return{
                restrict: 'A',
                link: function (scope, elem, attrs, ctrl) {
                    var elemFocus = false;
                    elem.on('mouseenter', function () {
                        elemFocus = true;
                        //console.log(elemFocus);
                    });
                    elem.on('mouseleave', function () {
                        elemFocus = false;
                        //console.log(elemFocus);
                    });



                    $document.bind('keydown', function (e) {


                        if (elemFocus) {
                            if (e.keyCode == 38) {
                                $('#scrolltable').slimScroll({scrollBy: 0 - scope.tdHeight + 'px'});
                                if (scope.selectedRow == 0) {
                                    return;
                                }
                                scope.selectedRow--;
                                scope.$apply();
                                e.preventDefault();
                            }
                            if (e.keyCode == 40) {
                                $('#scrolltable').slimScroll({scrollBy: scope.tdHeight + 'px'});                                
                                if (scope.selectedRow == scope.restResponse.length - 1) {
                                    return;
                                }

                                scope.selectedRow++;
                                scope.$apply();
                                e.preventDefault();
                            }
                        }
                    });
                }
            };
        }]);


});


