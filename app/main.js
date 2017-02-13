
require.config({
    paths: {
        'angular': 'assets/js/angular-1.3.14/angular.min',
        'angular-route': 'assets/js/angular-1.3.14/angular-route.min',
        'angularAMD': 'assets/js/angularAMD.min',
        'ngResource': 'assets/js/angular-1.3.14/angular-resource',
        'ngCookies': 'assets/js/angular-1.3.14/angular-cookies',
        'ngRoute': 'assets/js/angular-1.3.14/angular-route',
        'ngTouch': 'assets/js/angular-1.3.14/angular-touch',
        'ngAnimate': 'assets/js/angular-1.3.14/angular-animate',
        'ngMessages': 'assets/js/angular-1.3.14/angular-messages',
        'ngAria': 'assets/js/angular-1.3.14/angular-aria',
        'Jquery': 'assets/js/jquery-2.1.4.min',
        'ngMaterial': 'assets/js/angular-material.min',
        'bootStrap': 'assets/js/bootstrap-3.3.2.min',
        'bootstrapTpl': 'assets/js/angular-1.3.14/ui-bootstrap-tpls',
        'ngSanitize': 'assets/js/angular-1.3.14/angular-sanitize',
        'ngScrollbar': 'assets/plugins/ngscrollbar',
        'ngTagsInput': 'assets/js/ng-tags-input.min',
        'ngProgress': 'assets/plugins/ngProgress',
        //'angularToastr' : 'assets/plugins/angular-toastr/angular-toastr.tpls',
        'angularToastr': 'assets/plugins/angular-toastr/angular-toastr',
        'acuteSelect': 'assets/plugins/acute.select/acute.select',
        'treeControl': 'assets/plugins/angular-ui-tree/angular-ui-tree.min',
        'smartTable': 'assets/plugins/angular-smart-table/dist/smart-table.min',
        'slimScroll': 'assets/plugins/jquery.slimscroll',
        'vAccordion': 'assets/plugins/v-accordion/v-accordion',
        'angular-ui-select': 'assets/plugins/select',
        'angular-scroll': 'assets/plugins/angular-scroll/angular-scroll.min',
        'file-upload': 'assets/plugins/ng-file-upload.min'
    },
    shim: {
        'angularAMD': ['angular'],
        'angular-route': ['angular'],
        'smartTable': ['angular'],
        'angular-ui-select': ['angular'],
        'angular-scroll': ['angular'],
        ngResource: {
            deps: ['angular']
        },
        ngCookies: {
            deps: ['angular']
        },
        ngRoute: {
            deps: ['angular']
        },
        ngTouch: {
            deps: ['angular']
        },
        ngAnimate: {
            deps: ['angular']
        },
        ngMessages: {
            deps: ['angular']
        },
        ngAria: {
            deps: ['angular']
        },
        ngMaterial: {
            deps: ['angular']
        },
        ngSanitize: {
            deps: ['angular']
        },
        ngScrollbar: {
            deps: ['angular']
        },
        slimScroll: {
            deps: ['Jquery']
        },
        bootstrapTpl: {
            deps: ['angular']
        },
        ngTagsInput: {
            deps: ['angular']
        },
        ngProgress: {
            deps: ['angular']
        },
        angularToastr: {
            deps: ['angular']
        },
        acuteSelect: {
            deps: ['angular']
        },
        treeControl: {
            deps: ['angular']
        },
        vAccordion: {
            deps: ['angular']
        },
        'file-upload': {
            deps: ['angular']
        }
//        angular: {
//            exports: 'angular'
//        }
    },
    waitSeconds: 0,
    baseUrl: '/ESAdmin/'
});


require([
    'app/app',
    'app/lib/shared',
    'app/lib/appservices',
    'app/components/languages/languageService',
    'public/login/authenticationService',
    'app/components/header/headerController',
], function (app) {
    angular.element().ready(function () {
        // bootstrap the app manually
        app.init();



    });

});
