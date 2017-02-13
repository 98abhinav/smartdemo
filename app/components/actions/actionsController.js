define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, actionModule, smartTable, ngScrollbar)
{

    actionModule.controller('actionController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$timeout', 'actionFactory', 'actionService', 'actionPageFactory', 'accessService', 'ngProgress', 'toasterService', '$route',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $timeout, actionFactory, actionService, actionPageFactory, accessService, ngProgress, toasterService, $route)
                {
                    ngProgress.start();

                    var message;

                    $rootScope.module = 'actions';
                    $scope.section = 'Action';
                    $scope.applicationId = $routeParams.applicationID; // application ID

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.action.DELETE_CONFIRM + $scope.selectedAction.name + '?';
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteAction($scope.id, $scope.applicationId);
                    });

                    function deleteAction(id, applicationId) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.selectedAction.name, 'mode': 'delete'};

                        actionFactory.deleteAction(id, applicationId)
                                .then(function (response) {
                                    toasterService.hideToastr();

                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);

                                    $route.reload();
                                    toasterService.showToastr(message, 'success');
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                );
                    }

                    /****** Ajax Smart table ****************/

                    //angular.element().ready(function() {

                    var applicationId = $routeParams.applicationID; // Application ID

                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };


                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.itemsByPage = $rootScope.paginationStore.action.paginationSize;
                        $scope.sortType = arrSort[$rootScope.paginationStore.action.orderBy];
                    } else {
                        $scope.itemsByPage = $cookieStore.get('paginationStore').action.paginationSize;
                        $scope.sortType = arrSort[$cookieStore.get('paginationStore').action.orderBy];

                    }



                    //$scope.sortType = arrSort[sortHow];
                    $scope.actions = [];

                    $rootScope.paginationStore.action.orderBy = sortHow;
                    $cookieStore.put('paginationStore', $rootScope.paginationStore);

                    $scope.callServer = function (tableState, ctrl) {
                        $scope.isLoading = true;
                        //tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        //$scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').action.paginationSize;
                                $scope.itemsByPage = number;
                                $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }

                            $scope.selectedRow = 0;

                            $rootScope.paginationStore.action.paginationSize = parseInt(number);
                            $rootScope.paginationStore.action.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);

                            actionPageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.actions = null;
                                        $scope.error = 'No Records';
                                    } else {
                                        $scope.actions = null;
                                        $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);

                                    }
                                } else {
                                    $scope.actions = result.data.actions;
                                    $scope.restResponse = result.data.actions;
                                    /* Show the first row details from response Start*/
                                    $scope.selectedAction = $scope.actions[0];
                                    /* Show the first row details from response Ends*/
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update                                     
                                }
                            }).finally(function () {
                                
                                $scope.isLoading = false;
                            });
                        }

                    }
                    //});

                    /****** Ajax smart table ends ************/


                    $scope.$on('FirstRecord', function (event) {
                        $scope.actiondetails = {
                            id: $scope.actions[0].id,
                            name: $scope.actions[0].name,
                            description: $scope.actions[0].description
                        };
                        $scope.selectaction($scope.actiondetails);
                    });

                    $scope.list_hide = true;

                    $scope.selectedRow = 0;
                    $scope.selectedAction = null;
                    $scope.selectaction = function (actiondetails, index) {
                        $scope.selectedRow = index;

                        //$scope.selectedAction = actiondetails;                        

                        $scope.showInfo = true;

                        //$scope.list_hide = false; // for hide Description Read more
                        $scope.description.active = false; // for hide Description Read more
                    };

                    $scope.$watch('selectedRow', function () {
                        if ($scope.actions != null) {
                            $scope.selectedAction = $scope.actions[$scope.selectedRow];
                        }
                    });

                    $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                    $scope.setItemsByPage = function () {
                        $('#itemsByPage').blur();
                        $scope.itemsByPage = document.getElementById('itemsByPage').value;
                        $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                    };

                    $scope.searchIcon = true;
                    $scope.startSearch = function () {
                        $scope.searchBox = true;
                        $scope.focusInput = true;
                    };



                    $scope.endSearch = function () {
                        $scope.searchBox = false;
                        $scope.search = '';
                    };
                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#scrollrightdiv').slimScroll({
                            height: $rootScope.listscrollrightdiv.height,
                            width: $rootScope.listscrollrightdiv.width
                        });
                    });
                    /******Scroll bar setting end*************/

                    /******Description Read more start******/
                    $scope.description = {
                        active: false
                    };
                    $scope.toggle = function () {
                        $scope.description.active = !$scope.description.active;
                        $scope.list_hide = true;
                    };

                    /******Description Read more end******/

//Multiple row selection

                    var KeyCodes = {
                        BACKSPACE: 8,
                        TABKEY: 9,
                        RETURNKEY: 13,
                        ESCAPE: 27,
                        SPACEBAR: 32,
                        LEFTARROW: 37,
                        UPARROW: 38,
                        RIGHTARROW: 39,
                        DOWNARROW: 40,
                    };

                    $scope.onKeydown = function (item, $event) {
                        var e = $event;
                        var $target = $(e.target);
                        var nextTab;
                        switch (e.keyCode) {
                            case KeyCodes.ESCAPE:
                                $target.blur();
                                break;
                            case KeyCodes.UPARROW:
                                nextTab = -1;
                                break;
                            case KeyCodes.RETURNKEY:
                                e.preventDefault();
                            case KeyCodes.DOWNARROW:
                                nextTab = 1;
                                break;
                        }
                        item.selected = "selectedActive";
//                        if (nextTab != undefined) {
//                            // do this outside the current $digest cycle
//                            // focus the next element by tabindex
//                            $timeout =  $('[tabindex=' + (parseInt($target.attr("tabindex")) + nextTab) + ']').focus();
//                        }
                    };

                    $scope.onFocus = function (item, $event) {
                        // clear all other items
//                        angular.forEach(items, function (item) {
//                            item.selected = undefined;
//                            
//                        });

                        // select this one
                        item.selected = undefined;
                    };
//Multiple row selection Ends


                    ngProgress.complete();
                }
            ]);


    actionModule.controller('manageActionController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'actionFactory', 'actionService', 'accessService', 'ngProgress', 'toasterService',
                function ($scope, $rootScope, $cookies, $routeParams, $location, actionFactory, actionService, accessService, ngProgress, toasterService)
                {
                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    $rootScope.module = 'actions';
                    $scope.section = 'Action';
                    $scope.actions;
                    $scope.action;
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.actionId = $routeParams.actionID; // Action ID

                    /* Access Check */
                    accessService.checkAccess($rootScope.module, $scope.section);

                    if ($scope.mode == 'edit') {
                        getAction($scope.actionId, $scope.applicationId);
                    }

                    $scope.submitData = function (action, mode, isValid)
                    {
                        if (!isValid) {
                            $(document).scrollTop(0);
                            return;
                        }
                        var actionData = {
                            name: action.name,
                            description: action.description,
                            aid: $scope.applicationId
                        };

                        // Add Action
                        if (mode == 'add') {
                            $scope.insertAction(actionData);
                        }

                        // Edit Application
                        if (mode == 'edit') {
                            $scope.updateAction(action.id, actionData);
                        }
                    }

                    /* ## Manage Action Starts ## */

                    /*  Get Action by ID */
                    function getAction(id, applicationId) {
                        actionFactory.getAction(id, applicationId)
                                .then(function (response) {
                                    $scope.action = response.data;
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            message = $rootScope.getErrorMessage(error, $scope.section);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            //toasterService.hideToastr(false);
                        });
                    }
                    ;

                    /* Insert New Action */
                    $scope.insertAction = function (actions) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': actions.name, 'mode': 'insert'};

                        actionFactory.insertAction(actions)
                                .then(function (response) {
                                    toasterService.hideToastr();

                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = actions.aid + '/actions';
                                    toasterService.showToastr(message, 'success', redirectpath);
                                    //$location.path(redirectpath);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            toasterService.hideToastr(false);
                        });
                    };

                    /* Update Action */
                    $scope.updateAction = function (id, actions) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': actions.name, 'mode': 'update'};

                        actionFactory.updateAction(id, actions)
                                .then(function () {
                                    toasterService.hideToastr();

                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = actions.aid + '/actions';
                                    toasterService.showToastr(message, 'success', redirectpath);
                                    //$location.path(redirectpath);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            toasterService.hideToastr(false);
                        });
                    };

                    /* ## Manage Actions Ends ## */

                    $scope.redirectList = function () {
                        $location.path("/" + $scope.applicationId + '/actions');
                    };

                    ngProgress.complete();
                }
            ]);

});
