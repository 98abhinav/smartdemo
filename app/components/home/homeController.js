// JavaScript Document
define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, homeModule, smartTable, ngScrollbar)
{
    homeModule.controller('homeController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$location', '$filter', 'applicationFactory', 'applicationPageFactory', 'languageService', 'accessService', 'ngProgress', 'toasterService', '$window', 'resourceShareDataService', 'resourcegroupShareDataService', 'sourceFactory',
                function ($scope, $rootScope, $cookies, $cookieStore, $location, $filter, applicationFactory, applicationPageFactory, languageService, accessService, ngProgress, toasterService, $window, resourceShareDataService, resourcegroupShareDataService, sourceFactory)
                {
                    ngProgress.start();
                    var message;

                    $rootScope.module = 'home';
                    $scope.section = 'Application';
                    $scope.accessdetails = '';

                    $scope.openDropdown = false;

                    /*Store the pagination config in $cookieStore */

                    $cookieStore.put('paginationStore', $rootScope.paginationStore);

                    function getApplicationAccess(selectedApplicationId) {

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.appName, 'mode': 'fetch'};

                        applicationFactory.getApplicationAccess(selectedApplicationId)
                                .then(function (response) {
                                    $scope.accessdetails = response.data.accessRights;
                                    var access = JSON.stringify(response.data.accessRights);
                                    localStorage.setItem("access", access);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                );
                    }// EO getApplicationAccess()
					$scope.isSuperAccessLoading=false;
                    function getSuperAccess() {
						
                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.appName, 'mode': 'fetch'};

                        applicationFactory.getSuperAccess()
                                .then(function (response) {
                                    $scope.superAdminRights = response.data.accessRights;
                                    //$scope.superAdminRights.reports='NONE';
                                    var superaccess = JSON.stringify($scope.superAdminRights);
                                    localStorage.setItem("superaccess", superaccess);
                                    $rootScope.superaccess = JSON.parse(localStorage['superaccess']);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {

                                $scope.isSuperAccessLoading=true;
                        });
                    }// EO getSuperAccess()

                    getSuperAccess();
//                    
                    var searchText = ""; // Search criteria for users
                    var sortBy = 'SOURCE_NAME';
                    var sortHow = 'asc';
                    var offset = 0;
                    var limit = 1000;
                    var objCustom = {'displayValue': "Source", 'mode': 'fetch'};
                    var sources = [];

                    if (angular.isUndefined(localStorage['sources'])) {
                        sourceFactory.getSources(searchText, limit, offset, sortBy, sortHow)
                                .then(function (sourceResponse) {
                                    angular.forEach(sourceResponse.data.sources, function (value) {
                                        sources.push(value);                                        
                                    })
                                    //sessionStorage['sources'] = JSON.stringify(sources);
                                    localStorage['sources'] = JSON.stringify(sources);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {


                        });
                    }

                    /****** Ajax Smart table ****************/
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var ctrl = this;
                    $scope.applications = [];
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                    $scope.sortType = arrSort[$cookieStore.get('paginationStore').application.orderBy];
                    // Get Super Access for Application, Source, System Administrator Modules


                    $scope.callServer = function (tableState) {
                        $scope.isLoading = true;
                        //tableState.pagination.numberOfPages =0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        //alert(number);
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').application.paginationSize;
                                $scope.itemsByPage = number;
                                //$scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }
                            $rootScope.paginationStore.application.paginationSize = parseInt(number);
                            $rootScope.paginationStore.application.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
                            if (!$scope.search) {
                                $scope.searchBox = false;
                                $scope.search = '';
                            }
                            applicationPageFactory.getPage(start, number, tableState, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.applications = null;
                                        $scope.error = 'No Records';
                                    } else {
                                        $scope.applications = null;
                                        $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.applications = result.data.applications;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
                    };

                    /****** Ajax smart table ends ************/

                    // Close all instances when user clicks elsewhere
                    $window.onclick = function (event) {
                        closeWhenClickingElsewhere(event, function () {
                            $scope.openDropdown = false;
                            $scope.$apply();
                        }, 'landingbox1');
                    };

                    $scope.getDropdownIconClass = function () {
                        if (!$scope.openDropdown) {
                            return "arrow-down";
                        }
                        return "arrow-up";
                    };

                    /*$scope.appName = (localStorage.getItem("selectedAppName")!='') ? localStorage.getItem("selectedAppName") : '';
                     $cookieStore.put('application',$scope.appName);*/
                    $scope.appName = '';
                    if (localStorage.getItem("selectedAppName") != null) {
                        localStorage.removeItem("selectedAppName");
                        localStorage.removeItem("selectedAppDesc");
                        localStorage.removeItem("selectedAppId");
                        resourceShareDataService.reset();
                        resourcegroupShareDataService.reset();
                    }

                    $scope.selectApplication = function (value) {
                        $scope.appName = value.name;
                        localStorage.setItem("selectedAppName", value.name);
                        localStorage.setItem("selectedAppDesc", value.description);
                        localStorage.setItem("selectedAppId", value.id);
                        $scope.openDropdown = false;
                        getApplicationAccess(value.id);
                        $location.path('/home/' + value.id);
                    };
                    
                    $scope.createApplication = function(){                        
                      if($scope.isSuperAccessLoading && JSON.parse(localStorage['superaccess']).applications==$rootScope.accessAdmin){
                          $location.path('/application/add');
                      }else{                          
                          toasterService.showToastr($rootScope.getErrorMessage("", $scope.section), 'error');
                      }
                    };

                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: '230px',
                            //color : $rootScope.listscrolltable.color                            
                        });
                    });
                    /******Scroll bar setting end*************/


                    ngProgress.complete();
                }
            ]);
    homeModule.controller('homeApplicationController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', 'applicationFactory', 'languageService', 'accessService', 'ngProgress', 'resourceShareDataService', 'resourcegroupShareDataService',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, applicationFactory, languageService, accessService, ngProgress, resourceShareDataService, resourcegroupShareDataService)
                {
                    ngProgress.start();
                    $rootScope.module = 'homeapplication';
                    $scope.applicationId = $routeParams.applicationID;
                    /*$scope.selectedApp = localStorage.getItem("selectedAppName");
                     $cookieStore.put('application',$scope.selectedAppName);*/

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    $scope.startOver = function () {
                        localStorage.removeItem("selectedAppName");
                        localStorage.removeItem("selectedAppId");
                        localStorage.removeItem("selectedAppDesc");
                        //localStorage.removeItem("selectedSourceId");
                        resourceShareDataService.reset();
                        resourcegroupShareDataService.reset();
                        $location.path('/home');
                    };
                    $scope.doMore = function (value) {
                        $location.path('/application/edit/' + $scope.applicationId);
                    };
                    ngProgress.complete();
                }
            ]);
});
