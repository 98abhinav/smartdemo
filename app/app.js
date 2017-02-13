define(function (require) {

    'use strict';

    //var angular = require('angular');
    //var ngProgress = require('ngProgress');
    var angularAMD = require('angularAMD');
    var ngroute = require('ngRoute');
    var ngcookies = require('ngCookies');
    var ngresource = require('ngResource');
    //var ngmessages = require('ngMessages');
    var ngaria = require('ngAria');
    //var ngtouch = require('ngTouch');
    var nganimate = require('ngAnimate');
    var ngmaterial = require('ngMaterial');
    var ngSanitize = require('ngSanitize');
    //var bootstrapTpl = require('bootstrapTpl');
    var ngTagsInput = require('ngTagsInput');
    var ngProgress = require('ngProgress');
    var angularToastr = require('angularToastr');
    var slimScroll = require('slimScroll');
    //var acuteSelect = require('acuteSelect');
    //var dragNdrop = require('lrDragNDrop');
    // var smartTable = require('smartTable');
    //var treeControl = require('treeControl');
    var angularUiSelect = require('angular-ui-select');
    var angularScroll = require('angular-scroll');
    var fileUpload = require('file-upload');

    var config = require('app/routes');
    var appConfig = require('../config/conf');
    var dependencyResolverFor = require('../assets/js/dependencyResolverFor');

    //#### APPLICATION MODULES ####//
    var loginModule = angular.module('LoginModule', [
        'ngRoute', 'ngCookies', 'ngAnimate', 'ngMaterial', 'ngResource', 'ngProgress', 'ngSanitize', 'ui.select', 'duScroll'
    ]);
    var homeModule = angular.module('HomeModule', [
        'toastr'
    ]);
    var applicationModule = angular.module('ApplicationModule', [
        'ngFileUpload'
    ]);
    var roleModule = angular.module('RoleModule', [
        'toastr'
    ]);
    var roleMembershipModule = angular.module('RoleMembershipModule', [
        'toastr'
    ]);
    var resourceTypeModule = angular.module('ResourceTypeModule', [
        'toastr', 'ngTagsInput'
    ]);
    var actionModule = angular.module('ActionModule', [
        'toastr', 'ngTagsInput'
    ]);
    var resourceGroupModule = angular.module('ResourceGroupModule', [
        'toastr'
    ]);
    var resourceModule = angular.module('ResourceModule', []);
    var functionsModule = angular.module('FunctionsModule', [
        'toastr'
    ]);
    var authPoliciesModule = angular.module('AuthPoliciesModule', [
        'toastr'
    ]);

    var policiesModule = angular.module('PoliciesModule', [
        'toastr']);

    var sourceModule = angular.module('SourceModule', [
        'toastr'
    ]);
    var systemAdministratorsModule = angular.module('SystemAdministratorsModule', [
        'toastr'
    ]);
    var reportModule = angular.module('ReportModule', [
        'toastr'
    ]);
    //#### APPLICATION MODULES - ENDS ####//

    var app = angular.module('app', [
        'LoginModule',
        'HomeModule',
        'ApplicationModule',
        'RoleModule',
        'RoleMembershipModule',
        'ResourceTypeModule',
        'ActionModule',
        'ResourceGroupModule',
        'ResourceModule',
        'FunctionsModule',
        'AuthPoliciesModule',
        'SystemAdministratorsModule',
        'PoliciesModule'
    ]);

    app.config(
            [
                '$routeProvider',
                '$locationProvider',
                '$controllerProvider',
                '$compileProvider',
                '$filterProvider',
                '$provide',
                function ($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $translateProvider)
                {
                    app.controller = $controllerProvider.register;
                    app.directive = $compileProvider.directive;
                    app.filter = $filterProvider.register;
                    app.factory = $provide.factory;
                    app.service = $provide.service;
                    //app.appConfig = appConfig;

                    $locationProvider.html5Mode(true);

                    if (config.routes !== undefined)
                    {

                        angular.forEach(config.routes, function (route, path)
                        {
//                            if(route.dependent!='undefined'){
//                                alert(route.dependent);
//                                require(route.dependent);
//                                dependencyResolverFor(route.dependent);
//                            }
                            $routeProvider.when(path, {templateUrl: route.templateUrl, resolve: dependencyResolverFor(route.dependencies)});
                        });
                    }

                    if (config.defaultRoutePaths !== undefined)
                    {
                        $routeProvider.otherwise({redirectTo: config.defaultRoutePaths});
                    }
                }
            ]);

    /* app.provider('appConstants', function () {
     
     
     // default values
     var values = {
     constant: appConfig
     };
     return {
     $get: function () {
     return values;
     }
     };
     })*/
    //alert(appConfig.urlPath);



    app.directive('isActiveNav', ['$location', function ($location) {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    var baseName = $location.url().substring(1);
                    if (element.parent().hasClass(baseName)) {

                        scope.location = $location;
                        scope.$watch('location.path()', function (currentPath) {

                            var children = element.children();
                            var icon = children[0];
                            var span = children[1];
                            if (appConfig.urlPath + currentPath === element[0].attributes['href'].nodeValue) {
                                //alert("Before");
                                angular.element(span).addClass("nav_title_active");
                                angular.element(icon).addClass("icon_" + baseName + "_active");

                                //angular.element(span).removeClass("nav_title");
                                //angular.element(icon).removeClass("icon_" + baseName);

                            } else {
                                //alert(currentPath);
                                //element.removeClass('');                            
                                angular.element(span).removeClass("nav_title_active");
                                angular.element(icon).removeClass("icon_" + baseName + "_active");
                                //angular.element(span).addClass("nav_title");
                                //angular.element(icon).addClass("icon_" + baseName);
                            }

                        });
                    }
                }
            };
        }]);


    app.run(['$rootScope', '$location', '$cookieStore', '$cookies', '$http','$window','appConfig', 'ngProgress', 'languageService', 'resourceShareDataService', 'resourcegroupShareDataService', 'AuthenticationService',
        function ($rootScope, $location, $cookieStore, $cookies, $http,$window, appConfig, ngProgress, languageService, resourceShareDataService, resourcegroupShareDataService, AuthenticationService) {

            angular.element().ready(function () {
                ngProgress.start();

            });

            /**** GLOBAL FUNCTIONS - starts ****/

            // Function to check empty JSON
            $rootScope.isEmptyObject = function (obj) {
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            };


            /**** GLOBAL FUNCTIONS - ends ****/

            //load the environment constants 
            //$rootScope.config = appConstants.constant;
            $rootScope.config = appConfig.getEnvConfig();
            $rootScope.noappmenumodules = ['home', 'sources', 'users', 'groups', 'addapplication', 'systemadministrators','reports'];
            $rootScope.sourcemenumodules = ['sources', 'users', 'groups', 'systemadministrators'];
            $rootScope.reportmenumodules = ['reports'];

            // keep user logged in after page refresh
            $rootScope.authorization_token = $cookieStore.get('authorization_token') || {};
            if ($rootScope.authorization_token.currentUser) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.authorization_token.currentUser.authdata; // jshint ignore:line
            }


            $rootScope.$on('$locationChangeStart', function (event, next, current) {
                $rootScope.applicationName = ($location.path() != '/home' && localStorage.getItem("selectedAppName") != null) ? localStorage.getItem("selectedAppName") : '';
                $rootScope.applicationDesc = ($location.path() != '/home' && localStorage.getItem("selectedAppDesc") != null) ? localStorage.getItem("selectedAppDesc") : '';

                $rootScope.applicationId = ($location.path() != '/home' && localStorage.getItem("selectedAppId") != null) ? localStorage.getItem("selectedAppId") : '';

                $rootScope.access = (!$rootScope.isEmptyObject(localStorage['access'])) ? JSON.parse(localStorage['access']) : '';
                $rootScope.superaccess = (!$rootScope.isEmptyObject(localStorage['superaccess'])) ? JSON.parse(localStorage['superaccess']) : '';

                var promise = languageService.getLanguage($cookies.lang).$promise;
                promise.then(function (value) {
                    $rootScope.translation = value;
                });

                // testing the login separation
                if (!$cookieStore.get('authorization_token')) {
                    //AuthenticationService.ClearCredentials();
                    window.location = $rootScope.config.domainPath + "/login.html";
                    //$location.path('/login.html');
                } else {
                    if ($cookieStore.get('authorization_token') && ($location.path() === '/' || $location.path() === '')) {
                        $location.path('/home');
                        //window.location = $scope.config.urlPath + localStorage.getItem("previousUrl");
                    }
                }

                // redirect to login page if not logged in
//                if ($location.path() !== '/login' && !$rootScope.authorization_token.currentUser) {
//                    $location.path('/login');
//                } else {
//                    if ($cookieStore.get('authorization_token') && $location.path() === '/login' || $location.path() === '/') {                        
//                        $location.path('/home');
//                    }
//                }
            });





            $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
                var route_name;
                if (!angular.isUndefined(pre)) {
                    var prev_path = pre.$$route.originalPath;
                    //console.log(prev_path);
                    route_name = prev_path.split('/')[2];
                }
                if (route_name != "resources") {
                    resourceShareDataService.reset();
                }
                if (route_name != "resourcegroups") {
                    resourcegroupShareDataService.reset();
                }
                //localStorage.setItem("previousUrl",$location.$$path);
            });

            $rootScope.$on('$locationChangeStart', function (e, current, previous) {
                //$rootScope.oldUrl = previous;                
                $rootScope.previousRoute=$window.location.pathname.replace('/ESAdmin','');
                $rootScope.currentRoute=$location.$$path;
                if($rootScope.previousRoute==$rootScope.currentRoute){
                    $rootScope.previousRoute=undefined;
                }                
                //console.log($rootScope.previousRoute);
                //console.log($rootScope.currentRoute);
            });

        }]);

    app.init = function () {
        angularAMD.bootstrap(app);
    };

    return app;
});


