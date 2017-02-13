define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, resourceTypeModule, smartTable, ngScrollbar) {
    resourceTypeModule.controller('resourcetypeController', [
        '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', 'resourceTypeService', 'resourceTypeFactory', 'resourceTypePageFactory', 'accessService', '$timeout', 'ngProgress', 'toasterService', '$route',
        function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, resourceTypeService, resourceTypeFactory, resourceTypePageFactory, accessService, $timeout, ngProgress, toasterService, $route) {
            ngProgress.start();

            var message;
            $rootScope.module = 'resourcetypes';
            $scope.section = "Resource Type";
            $scope.applicationId = $routeParams.applicationID; // application ID
            $scope.resourcetypes;

            /* Access Check Validate */
            accessService.checkAccessDeny();

            // Delete functionality
            $scope.confirmDelete = function (id) {
                var message = $rootScope.translation.resourcetype.DELETE_CONFIRM + $scope.selectedResourceType.name + '?';
                toasterService.showToastr(message, 'warning');
                $scope.id = id;
            };
            $('body').off('click', '#confirm_delete');
            $('body').on('click', '#confirm_delete', function () {
                toasterService.hideToastr(false);
                deleteResourceType($scope.id, $scope.applicationId);
            });

            function deleteResourceType(id, applicationId) {
                message = $rootScope.translation.toaster.DELETING;
                toasterService.showToastr(message, 'loader');

                // Custom object for error & success message
                var objCustom = {
                    'displayValue': $scope.selectedResourceType.name,
                    'mode': 'delete'
                };

                resourceTypeFactory.deleteResourceType(id, applicationId)
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
            var applicationId = $routeParams.applicationID; // Application ID           
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;
            $scope.rightPageinationPerPage = 10;
            $scope.error = "No Records Found";

            var sortBy = 'name';
            var sortHow = 'asc';

            var arrSort = {
                'asc': 'true',
                'desc': 'reverse'
            };
            //$scope.sortType = arrSort[sortHow];

            if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                $scope.itemsByPage = $rootScope.paginationStore.resourceType.paginationSize;
                $scope.sortType = arrSort[$rootScope.paginationStore.resourceType.orderBy];
            } else {
                $scope.itemsByPage = $cookieStore.get('paginationStore').resourceType.paginationSize;
                $scope.sortType = arrSort[$cookieStore.get('paginationStore').resourceType.orderBy];
            }



            $scope.resourcetypes = [];

            $scope.callServer = function (tableState) {
                $scope.isLoading = true;

                tableState.pagination.numberOfPages = 0;
                var pagination = tableState.pagination;
                var start = pagination.start || 0; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || false; // Number of entries showed per page. if pagination.number not found set false .
                if (number) {
                    if ($rootScope.previousRoute != $rootScope.currentRoute
                            && !angular.isUndefined($rootScope.previousRoute)) {
                        number = $cookieStore.get('paginationStore').resourceType.paginationSize;
                        $scope.itemsByPage = number;
                        $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                        $rootScope.previousRoute = undefined;
                    }
                    $scope.selectedRow = 0;
                    $rootScope.paginationStore.resourceType.paginationSize = parseInt(number);
                    $rootScope.paginationStore.resourceType.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                    $cookieStore.put('paginationStore', $rootScope.paginationStore);
                    resourceTypePageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {

                        if (result.error) {
                            if (result.error.status == 404) {
                                $scope.resourcetypes = null;
                                $scope.error = 'No Records';
                            } else {
                                $scope.resourcetypes = null;
                                $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                            }
                        } else {
                            $scope.resourcetypes = result.data.resourceTypes;
                            $scope.restResponse = result.data.resourceTypes;
                            /* Show the first row details from response Start*/
                            $scope.selectedResourceTypeActionsCount = 0;
                            $scope.selectedResourceType = $scope.resourcetypes[0];
                            $scope.selectedResourceTypeActionsCount = $scope.selectedResourceType.actions.actions.length;
                            $scope.selectedResourceAttribute = $scope.selectedResourceType.actions.actions;
                            /* Show the first row details from response Ends*/
                            tableState.pagination.numberOfPages = result.numberOfPages; //set the number of pages so the pagination can update 
                        }
                    }).finally(function () {
                        $scope.isLoading = false;
                    });
                }
            };

            /****** Ajax smart table ends ************/

            /* Select First Record from the list and show details */
            $scope.$on('FirstRecord', function (event) {
                $scope.resourcetype = {
                    id: $scope.resourcetypes[0].id,
                    name: $scope.resourcetypes[0].name,
                    actions: $scope.resourcetypes[0].actions,
                    hierarchical: $scope.resourcetypes[0].hierarchical,
                    appID: $scope.applicationId
                };
                $scope.selectResourcetype($scope.resourcetype);
            });

            $scope.selectedResourceDetails = null;
            $scope.selectedResourceAttribute = [];
            $scope.selectedRow = 0;
            $scope.selectResourcetype = function (resourceType, index) {
                $scope.selectedRow = index;

//                $scope.selectedResourceTypeActionsCount = 0;
//                $scope.selectedResourceType = resourceType;
//                $scope.selectedResourceTypeActionsCount = resourceType.actions.actions.length;
//                $scope.selectedResourceAttribute = resourceType.actions.actions;
                $scope.showInfo = true;
            };

            $scope.$watch('selectedRow', function () {
                if ($scope.resourcetypes.length != 0) {
                    $scope.selectedResourceTypeActionsCount = 0;
                    $scope.selectedResourceType = $scope.resourcetypes[$scope.selectedRow];
                    $scope.selectedResourceTypeActionsCount = $scope.selectedResourceType.actions.actions.length;
                    $scope.selectedResourceAttribute = $scope.selectedResourceType.actions.actions;
                }
            });
            $scope.tdHeight = 10;
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

            $scope.resourceactionsearchIcon = true;
            $scope.startViewSearch = function (searchType) {
                switch (searchType) {
                    case 'resourceaction':
                        $scope.resourceactionsearchBox = true;
                        $scope.resourceactionfocusInput = true;
                        break;
                }

            };

            $scope.endViewSearch = function (searchType) {
                switch (searchType) {
                    case 'resourceaction':
                        $scope.resourceactionsearchBox = false;
                        $scope.search_user = '';
                        break;
                }
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
            $scope.$applyAsync(function () {
                $('#scrollrightinnerdiv').slimScroll({
                    height: '247px'
                });
            });
            /******Scroll bar setting end*************/
            ngProgress.complete();

        }
    ]);


    resourceTypeModule.controller('manageResourceTypeController', [
        '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$filter', 'resourceTypeService', 'resourceTypeFactory', 'actionFactory', 'accessService', 'ngProgress', 'toasterService', 'actionPageFactory',
        function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $filter, resourceTypeService, resourceTypeFactory, actionFactory, accessService, ngProgress, toasterService, actionPageFactory) {
            ngProgress.start();

            var message, redirectpath;

            /* Initialize */
            $rootScope.module = 'resourcetypes';
            $scope.section = "Resource Type";
            $scope.resourceTypes;
            $scope.resourceType;
            $scope.error;
            $scope.message;
            $scope.mode = $routeParams.mode; // add OR edit
            $scope.applicationId = $routeParams.applicationID; // application ID
            $scope.resourceTypeId = $routeParams.resourceTypeId; // resourceType ID
            $scope.dispmsg = "No Record Selected.";
            $scope.resourceGrouptargetList = null;
            $scope.sourceActionsLength = 0;
            $scope.targetActionsLength = 0;
            /* Access Check */
            accessService.checkAccess($rootScope.module, $scope.section);

            if ($scope.mode == 'edit') {
                getResourceType($scope.resourceTypeId, $scope.applicationId);
            }

            $scope.submitData = function (resourceType, mode, isValid) {
                if (!isValid) {
                    $(document).scrollTop(0);
                    return;
                }
                var actions = [];
                angular.forEach($scope.targetActions, function (item) {
                    actions.push({"id": item.id, "name": item.name})
                })

                var resourceTypeData = {
                    name: resourceType.name,
                    actions: actions,
                    hierarchical: resourceType.hierarchical,
                    appID: $scope.applicationId
                };

                // Add Application
                if (mode == 'add') {
                    $scope.insertResourceType(resourceTypeData);
                }

                // Edit Application
                if (mode == 'edit') {
                    $scope.updateResourceType(resourceType.id, resourceTypeData);
                }
            }

            /*  Get ResourceType by ID */
            function getResourceType(id, applicationId) {
                // Custom object for error & success message
                var objCustom = {
                    'displayValue': id,
                    'mode': 'fetch'
                };

                resourceTypeFactory.getResourceType(id, applicationId)
                        .then(function (response) {
                            $scope.resourceType = response.data;
                            $scope.resourceType.actions = response.data.actions;

                            $scope.targetActions = response.data.actions;
                            $scope.targetActionsLength = response.data.actions.length;
                        },
                                function (error) {
                                    toasterService.hideToastr(false);
                                    message = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                    $scope.error = message;
                                    toasterService.showToastr(message, 'error');
                                }
                        ).finally(function () {
                    toasterService.hideToastr(false);
                });
            }



            /* Insert New ResourceType */
            $scope.insertResourceType = function (resourceType) {
                message = $rootScope.translation.toaster.SAVING;
                toasterService.showToastr(message, 'loader');

                // Custom object for error & success message
                var objCustom = {
                    'displayValue': resourceType.name,
                    'mode': 'insert'
                };

                resourceTypeFactory.insertResourceType(resourceType)
                        .then(function (response) {
                            toasterService.hideToastr();

                            message = $rootScope.getSuccessMessage($scope.section, objCustom);
                            redirectpath = resourceType.appID + '/resourcetypes';
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

            /* Update resourceType */
            $scope.updateResourceType = function (id, resourceType) {
                //console.log(resourceType);
                //return;
                message = $rootScope.translation.toaster.SAVING;
                toasterService.showToastr(message, 'loader');

                // Custom object for error & success message
                var objCustom = {
                    'displayValue': resourceType.name,
                    'mode': 'update'
                };

                resourceTypeFactory.updateResourceType(id, resourceType)
                        .then(function () {
                            toasterService.hideToastr();

                            message = $rootScope.getSuccessMessage($scope.section, objCustom);
                            redirectpath = resourceType.appID + '/resourcetypes';
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
            /* ## Manage ResourceType Ends ## */



            /****** Ajax Smart table ****************/
            var applicationId = $routeParams.applicationID; // Application ID
            $scope.itemsByPage = $rootScope.itemsByPage;
            
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;
            var sortBy = 'name';
            var sortHow = 'asc';
            var arrSort = {
                'asc': 'true',
                'desc': 'reverse'
            };
            $scope.sortType = arrSort[sortHow];

            if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                $scope.itemsByPage_action = $rootScope.paginationStore.action.paginationSize;
                $scope.sortType_action = arrSort[$rootScope.paginationStore.action.orderBy];
            } else {
                $scope.itemsByPage_action = $cookieStore.get('paginationStore').action.paginationSize;
                $scope.sortType_action = arrSort[$cookieStore.get('paginationStore').action.orderBy];
            }


            
            $scope.sourceActions = [];

            $scope.callServer = function (tableState, ctrl) {
                $scope.isLoading = true;
                //tableState.pagination.numberOfPages = 0;
                var pagination = tableState.pagination;
                var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .

                if (number) {
                    if ($rootScope.previousRoute != $rootScope.currentRoute
                            && !angular.isUndefined($rootScope.previousRoute)) {
                        number = $cookieStore.get('paginationStore').action.paginationSize;
                        $scope.itemsByPage = number;
                        //$scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                        $rootScope.previousRoute = undefined;
                    }
                    $rootScope.paginationStore.action.paginationSize = parseInt(number);
                    $rootScope.paginationStore.action.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                    $cookieStore.put('paginationStore', $rootScope.paginationStore);
                    actionPageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {
                        if (result.error) {
                            if (result.error.status == 404) {
                                $scope.sourceActions = null;
                                $scope.error = 'No Records';
                            } else {
                                $scope.sourceActions = null;
                                $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);

                            }
                        } else {
                            ctrl.test = false;

                            $scope.sourceActions = [];
                            angular.forEach(result.data.actions, function (item) {
                                if (!angular.isUndefined($filter('filter')($scope.targetActions, {id: item.id})[0])) {
                                    item['mark'] = 1;
                                }
                                $scope.sourceActions.push(item);
                            })



                            //$scope.actions = result.data.actions;
                            tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update                                     
                        }
                    }).finally(function () {
                        $scope.isLoading = false;
                    });
                }

            }
            //});

            /****** Ajax smart table ends ************/

            /******Scroll bar setting start*************/
            $scope.$applyAsync(function () {
                $('#unassignscroll').slimScroll({
                    height: '410px'
                });
            });
            $scope.$applyAsync(function () {
                $('#assignscroll').slimScroll({
                    height: '410px'
                });
            });
            /******Scroll bar setting End*************/
            /********* Search list *******************/
            $scope.usersourcesearchIcon = true;
            $scope.userfulltargetsearchIcon = true;
            $scope.startSearch = function (searchType) {
                switch (searchType) {
                    case 'usersource':
                        $scope.usersourcesearchBox = true;
                        $scope.usersourcefocusInput = true;
                        $scope.usersourcesearchIcon = false;
                        break;
                    case 'userfulltarget':
                        $scope.userfulltargetsearchBox = true;
                        $scope.userfulltargetfocusInput = true;
                        $scope.userfulltargetsearchIcon = false;
                        break;
                }

            };

            $scope.endSearch = function (searchType) {
                switch (searchType) {
                    case 'usersource':
                        $scope.usersourcesearchBox = false;
                        $scope.usersourcesearchIcon = true;
                        break;
                    case 'userfulltarget':
                        $scope.userfulltargetsearchBox = false;
                        $scope.userfulltargetsearchIcon = true;
                        break;
                }
            };
            /**********Search list ends*******************/

            /* Dual-ListBox */
            $scope.selectedSourceItems = [];
            $scope.selectedTargetItems = [];


            $scope.targetActions = [];


            $scope.selectSourceItem = function (item) {

                if (angular.element(document.getElementById(item.id)).hasClass("mapped")) {
                    return false;
                }

                $scope.selectedTargetItems = [];
                var index = $scope.selectedSourceItems.indexOf(item);
                if (index == '-1') {
                    $scope.selectedSourceItems.push(item);
                } else {
                    $scope.selectedSourceItems.splice(index, 1);
                }
                $scope.showAddBtn = true;
                $scope.showRemoveBtn = false;
                if ($scope.selectedSourceItems.length == 0) {
                    $scope.showAddBtn = false;
                }
            };


            $scope.selectTargetItem = function (item) {
                $scope.selectedSourceItems = [];
                var index = $scope.selectedTargetItems.indexOf(item);
                if (index == '-1') {
                    $scope.selectedTargetItems.push(item);
                } else {
                    $scope.selectedTargetItems.splice(index, 1);
                }
                $scope.showAddBtn = false;
                $scope.showRemoveBtn = true;
                if ($scope.selectedTargetItems.length == 0) {
                    $scope.showRemoveBtn = false;
                }
            };
            $scope.isSelectedSource = function (item) {
                delete item.mark;
                if (!angular.element(document.getElementById(item.id)).hasClass("mapped")) {
                    if ($scope.selectedSourceItems.indexOf(item) > -1) {
                        angular.element(document.getElementById(item.id)).addClass("selectedActive");
                    } else {
                        angular.element(document.getElementById(item.id)).removeClass("selectedActive");
                    }
                } else {
                    item['mark'] = 1;

                }

            };
            $scope.isSelectedTarget = function (item) {
                return $scope.selectedTargetItems.indexOf(item) > -1;
            };

            $scope.addItem = function (items) {

                angular.forEach(items, function (item) {
                    item['new'] = 1;
                    angular.element(document.getElementById(item.id)).addClass("mapped");
                    angular.element(document.getElementById(item.id)).removeClass("selectedActive");
                    $scope.selectedSourceItems = [];
                    $scope.targetActions.push(item);
                    $scope.showAddBtn = false;
                    $scope.showRemoveBtn = false;
                });
                $scope.sourceActionsLength = $scope.sourceActions.length;
                $scope.targetActionsLength = $scope.targetActions.length;
            };

            $scope.removeItem = function (items) {

                angular.forEach(items, function (item) {
                    var searchArray = {};
                    searchArray['property'] = 'id';
                    searchArray['value'] = item.id;
                    findAndRemove($scope.targetActions, searchArray);

                    $scope.selectedSourceItems = [];
                    angular.element(document.getElementById(item.id)).removeClass("mapped");
                    $scope.showAddBtn = false;
                    $scope.showRemoveBtn = false;
                });
                $scope.sourceActionsLength = $scope.sourceActions.length;
                $scope.targetActionsLength = $scope.targetActions.length;
            };

            $scope.resetItem = function () {

//                angular.forEach($scope.targetActions, function (item) {
//                    if (item.new === 1) {
//                        var searchArray = {};
//                        searchArray['property'] = 'id';
//                        searchArray['value'] = item.id;
//                        findAndRemove($scope.targetActions, searchArray);
//                        angular.element(document.getElementById(item.id)).removeClass("mapped");
//                    }
//
//                })


                var resetItem = [];
                angular.forEach($scope.targetActions, function (target) {

                    if (target.new != 1) {
                        resetItem.push(target);
                    } else {
                        angular.element(document.getElementById(target.id)).removeClass("mapped");
                    }

                })
                $scope.targetActions = resetItem;

            }

            $scope.redirectList = function () {
                $location.path("/" + $scope.applicationId + '/resourcetypes');
            };



            ngProgress.complete();

        }
    ]);

});
