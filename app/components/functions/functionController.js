define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, functionsModule, smartTable, ngScrollbar)
{
    functionsModule.controller('functionController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$timeout', 'functionFactory', 'functionService', 'functionPageFactory', 'accessService', 'ngProgress', 'toasterService', '$route',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $timeout, functionFactory, functionService, functionPageFactory, accessService, ngProgress, toasterService, $route)
                {

                    ngProgress.start();

                    var message;
                    $rootScope.module = 'functions';
                    $scope.section = 'Function';
                    $scope.applicationId = $routeParams.applicationID; // application ID

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.function.DELETE_CONFIRM + $scope.selectedFunction.name + '?';
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteFunction($scope.id, $scope.applicationId);
                    });

                    function deleteFunction(id, applicationId) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.selectedFunction.name, 'mode': 'delete'};

                        functionFactory.deleteFunction(id, applicationId)
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
                    }// EO deleteFunction(id, applicationId)

                    /****** Ajax Smart table ****************/
                    var applicationId = $routeParams.applicationID; // Application ID                    
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                                                           
                    
                    
                    if(angular.isUndefined($cookieStore.get('paginationStore'))){
                        $scope.itemsByPage = $rootScope.paginationStore.function.paginationSize;
                        $scope.sortType = arrSort[$rootScope.paginationStore.function.orderBy];
                    }else{
                        $scope.itemsByPage = $cookieStore.get('paginationStore').function.paginationSize;
                        $scope.sortType = arrSort[$cookieStore.get('paginationStore').function.orderBy];
                    }


                    $scope.functions = [];
                    $scope.callServer = function (tableState) {
                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
//                        if(!number){
//                            number = $cookieStore.get('paginationStore').function.paginationSize;
//                            $scope.itemsByPage = number;
//                            $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
//                        }

                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').function.paginationSize;
                                $scope.itemsByPage = number;
                                $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }
                            $scope.selectedRow = 0;
                            $rootScope.paginationStore.function.paginationSize = parseInt(number);
                            $rootScope.paginationStore.function.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
                            functionPageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {

                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.functions = null;
                                        $scope.error = 'No Records';
                                    } else {
                                        $scope.functions = null;
                                        $scope.error = $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.functions = result.data.functions;
                                    $scope.restResponse = result.data.functions;
                                    /* Show the first row details from response Start*/
                                    $scope.selectedFunction = $scope.functions[0];
                                    $scope.selectedFunctionAid = $scope.selectedFunction.aid;
                                    /* Show the first row details from response Ends*/
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
                    };

                    /****** Ajax smart table ends ************/

                    /* Select First Record from the list and show details */
                    $scope.$on('FirstRecord', function (event) {
                        $scope.functiondetails = {
                            id: $scope.functions[0].id,
                            name: $scope.functions[0].name,
                            className: $scope.functions[0].className,
                            description: $scope.functions[0].description,
                            aid: $scope.functions[0].aid
                        };
                        $scope.selectfunction($scope.functiondetails);
                    });


                    $scope.selectedRow = 0;
                    $scope.selectedFunction = null;
                    $scope.selectfunction = function (functiondetails, index) {
                        $scope.selectedRow = index;
                        //$scope.selectedFunction = functiondetails;
                        //$scope.selectedFunctionAid = functiondetails.aid;
                        $scope.showInfo = true;
                    };


                    $scope.$watch('selectedRow', function () {
                        if ($scope.functions.length != 0) {
                            $scope.selectedFunction = $scope.functions[$scope.selectedRow];
                            $scope.selectedFunctionAid = $scope.selectedFunction.aid;
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


                    ngProgress.complete();
                }
            ]);

    functionsModule.controller('manageFunctionController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'functionFactory', 'functionService', 'accessService', 'ngProgress', 'toasterService',
                function ($scope, $rootScope, $cookies, $routeParams, $location, functionFactory, functionService, accessService, ngProgress, toasterService)
                {
                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    $rootScope.module = 'functions';
                    $scope.section = 'Function';
                    $scope.functions;
                    $scope.singlefunction;
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.functionId = $routeParams.functionId; // Function ID

                    /* Access Check */
                    accessService.checkAccess($rootScope.module, $scope.section);

                    if ($scope.mode == 'edit') {
                        getFunction($scope.functionId, $scope.applicationId);
                    }

                    $scope.submitData = function (functions, mode, isValid)
                    {
                        if (!isValid) {
                            $(document).scrollTop(0);
                            return;
                        }
                        var functionData = {
                            name: functions.name,
                            className: functions.className,
                            description: functions.description,
                            aid: $scope.applicationId
                        };

                        // Add Function
                        if (mode == 'add') {
                            $scope.insertFunction(functionData);
                        }

                        // Edit Application
                        if (mode == 'edit') {

                            $scope.updateFunction(functions.id, functionData);
                        }
                    }

                    /* ## Manage Function Starts ## */

                    /*  Get Function by ID */
                    function getFunction(id, applicationId) {
                        message = $rootScope.translation.toaster.LOADING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': id, 'mode': 'fetch'};

                        functionFactory.getFunction(id, applicationId)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    $scope.functions = response.data;
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            message = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            //message = 'Unable to get data: ' + error.status + ' ' + error.statusText;
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            toasterService.hideToastr(false);
                        });
                    }

                    /* Insert New Function */
                    $scope.insertFunction = function (functions) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': functions.name, 'mode': 'insert'};

                        functionFactory.insertFunction(functions)
                                .then(function (response) {
                                    toasterService.hideToastr();

                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = functions.aid + '/functions';
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

                    /* Update Function */
                    $scope.updateFunction = function (id, functions) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': functions.name, 'mode': 'update'};

                        functionFactory.updateFunction(id, functions)
                                .then(function () {
                                    toasterService.hideToastr();

                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = functions.aid + '/functions';
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

                    /* ## Manage Functions Ends ## */

                    $scope.redirectList = function () {
                        $location.path("/" + $scope.applicationId + '/functions');
                    };

                    ngProgress.complete();
                }
            ]);

});
