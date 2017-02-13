define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, policiesModule, smartTable, ngScrollbar)
{

    policiesModule.controller('policiesController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$timeout', '$filter', 'rolePoliciesFactory', 'rolePoliciesPageFactory', 'ngProgress', 'toasterService', '$route', 'sourceFactory', 'accessService',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $timeout, $filter, rolePoliciesFactory, rolePoliciesPageFactory, ngProgress, toasterService, $route, sourceFactory, accessService)
                {

                    ngProgress.start();

                    var message;
                    //$rootScope.module = 'rolepolicies';
                    var policyType = $routeParams.policyType.substr(0, $routeParams.policyType.length - 1);
                    $rootScope.module = policyType + 'policies';
                    $scope.section = 'Role Policy';
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.policyType = $routeParams.policyType; //Policy Type - user, group or role

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    // Reset the search rootScope
                    if (!angular.isUndefined($rootScope.rolePolicySearch)) {
                        $rootScope.rolePolicySearch = undefined;
                    }
                    if (!angular.isUndefined($rootScope.userPolicySearch)) {
                        $rootScope.userPolicySearch = undefined;
                    }
                    if (!angular.isUndefined($rootScope.groupPolicySearch)) {
                        $rootScope.groupPolicySearch = undefined;
                    }

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.policy.DELETE_CONFIRM + $scope.selectedAuthzPolicy.name + '?';
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };

                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteRolePolicy($scope.id, $scope.applicationId);
                    });

                    function deleteRolePolicy(id, applicationId) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.selectedAuthzPolicy.name, 'mode': 'delete'};

                        rolePoliciesFactory.deleteRolePolicy(id, applicationId, $scope.policyType)
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

                    /* Select First Record from the list and show details */
                    $scope.$on('FirstRecord', function (event) {
//                        $scope.authzPolicyDetails = {
//                            id: $scope.rolePolicies[0].id,
//                            name: $scope.rolePolicies[0].name,
//                            description: $scope.rolePolicies[0].description,
//                        };
//                        $scope.selectedRolePolicy = $scope.roledetails;
                        $scope.selectAuthzPolicy($scope.authzPolicies[0]);
                    });


                    $scope.selectedSource = null;
                    $scope.selectedSource = [];
                    $scope.selectedRow = 0;
                    $scope.selectAuthzPolicy = function (authzPolicyDetails, index) {
                        $scope.selectedRow = index;

//                        $scope.selectedAuthzPolicy = authzPolicyDetails;
//                        $scope.selectedAuthzPolicyPrincipalCount = authzPolicyDetails[$scope.policyType].length;
//                        $scope.selectedAuthzPolicyPrincipals = authzPolicyDetails[$scope.policyType];
//
//                        for (var i = 0; i < $scope.selectedAuthzPolicy.resourceActions.length; i++) {
//                            if ($scope.selectedAuthzPolicy.resourceActions[i].resource.group == true) {
//                                $scope.selectedAuthzPolicyResourceGroups.push($scope.selectedAuthzPolicy.resourceActions[i]);
//                                $scope.selectedAuthzPolicyResourceGroupCount++;
//                            } else {
//                                $scope.selectedAuthzPolicyResources.push($scope.selectedAuthzPolicy.resourceActions[i]);
//                                $scope.selectedAuthzPolicyResourceCount++;
//                            }
//                        }
//
//                        if ($scope.selectedAuthzPolicyResourceCount > 0 || $scope.selectedAuthzPolicyResourceGroupCount == 0) {
//                            $scope.selectedIndex = 0;
//                        } else {
//                            $scope.selectedIndex = 1;
//                        }
//
//                        $scope.selectedAuthzPolicyRoles = authzPolicyDetails.roles;
//                        $scope.selectedAuthzPolicyResources = authzPolicyDetails.resourceActions;

                        $scope.showInfo = true;
                        $scope.description.active = false; // for hide Description Read more
                    };


                    $scope.$watch('selectedRow', function () {
                        if ($scope.authzPolicies.length != 0) {
                            $scope.selectedAuthzPolicyPrincipalCount = 0;
                            $scope.selectedAuthzPolicyResourceCount = 0;
                            $scope.selectedAuthzPolicyResourceGroupCount = 0;
                            $scope.selectedAuthzPolicyResources = [];
                            $scope.selectedAuthzPolicyResourceGroups = [];
                            $scope.selectedAuthzPolicy = $scope.authzPolicies[$scope.selectedRow];
                            $scope.selectedAuthzPolicyPrincipalCount = $scope.selectedAuthzPolicy[$scope.policyType].length;
                            $scope.selectedAuthzPolicyPrincipals = $scope.selectedAuthzPolicy[$scope.policyType];

                            if ($scope.selectedAuthzPolicy.resourceActions != null) {
                                for (var i = 0; i < $scope.selectedAuthzPolicy.resourceActions.length; i++) {
                                    if ($scope.selectedAuthzPolicy.resourceActions[i].resource.group == true) {
                                        $scope.selectedAuthzPolicyResourceGroups.push($scope.selectedAuthzPolicy.resourceActions[i]);
                                        $scope.selectedAuthzPolicyResourceGroupCount++;
                                    } else {
                                        $scope.selectedAuthzPolicyResources.push($scope.selectedAuthzPolicy.resourceActions[i]);
                                        $scope.selectedAuthzPolicyResourceCount++;
                                    }
                                }
                            }
                            if ($scope.selectedAuthzPolicyResourceCount > 0 || $scope.selectedAuthzPolicyResourceGroupCount == 0) {
                                $scope.selectedIndex = 0;
                            } else {
                                $scope.selectedIndex = 1;
                            }

                            $scope.selectedAuthzPolicyRoles = $scope.selectedAuthzPolicy.roles;
                            $scope.selectedAuthzPolicyResources = $scope.selectedAuthzPolicy.resourceActions;
                        }
                    });
                    $scope.tdHeight = 10;
                    $scope.setItemsByPage = function () {
                        $('#itemsByPage').blur();
                        $scope.itemsByPage = document.getElementById('itemsByPage').value;
                        $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                    };

                    $scope.principalsearchIcon = true;
                    $scope.resourcesearchIcon = true;
                    $scope.resourcegroupsearchIcon = true;
                    $scope.startViewSearch = function (searchType) {
                        switch (searchType) {
                            case 'principals':
                                $scope.principalsearchBox = true;
                                $scope.principalfocusInput = true;
                                $scope.principalsearchIcon = false;
                                break;
                            case 'resources':
                                $scope.resourcesearchBox = true;
                                $scope.resourcefocusInput = true;
                                $scope.resourcesearchIcon = false;
                                break;
                            case 'resourcegroups':
                                $scope.resourcegroupsearchBox = true;
                                $scope.resourcegroupfocusInput = true;
                                $scope.resourcegroupsearchIcon = false;
                                break;
                        }

                    };

                    $scope.endViewSearch = function (searchType) {
                        switch (searchType) {
                            case 'principals':
                                $scope.principalsearchBox = false;
                                $scope.search_principal = '';
                                $scope.principalsearchIcon = true;
                                break;
                            case 'resources':
                                $scope.resourcesearchBox = false;
                                $scope.search_resource = '';
                                $scope.resourcesearchIcon = true;
                            case 'resourcegroups':
                                $scope.resourcegroupsearchBox = false;
                                $scope.search_resourcegroup = '';
                                $scope.resourcegroupsearchIcon = true;
                                break;
                        }
                    };

                    $scope.viewActionSearch = function (resourceId) {
                        if ($scope[resourceId] === undefined) {
                            //Valid in my application for first usage
                            $scope[resourceId] = true;
                        } else {
                            $scope[resourceId] = !$scope[resourceId];
                        }

                        //document.getElementById(resourceId).style.display = '';
                    }


//                    $scope.nextPrincipalPage = function() {
//                    	if($scope.currentPrincipalPage < $scope.numPrincipalPages)
//                    	$scope.currentPrincipalPage ++;
//                    }
//                    
//                    $scope.previousPrincipalPage = function() {
//                    	if($scope.currentPrincipalPage > 1) {
//                    		$scope.currentPrincipalPage--;
//                    	}
//                    }

                    $scope.nextResourcePage = function () {
                        if ($scope.currentResourcePage < $scope.numResourcePages)
                            $scope.currentResourcePage++;
                    }

                    $scope.previousResourcePage = function () {
                        if ($scope.currentResourcePage > 1) {
                            $scope.currentResourcePage--;
                        }
                    }

                    $scope.nextResourceGroupPage = function () {
                        if ($scope.currentResourceGroupPage < $scope.numResourceGroupPages)
                            $scope.currentResourceGroupPage++;
                    }

                    $scope.previousResourceGroupPage = function () {
                        if ($scope.currentResourceGroupPage > 1) {
                            $scope.currentResourceGroupPage--;
                        }
                    }

                    $scope.toggleExpand = function (obj) {
                        if (obj.isExpanded) {
                            obj.isExpanded = false;
                        } else {
                            obj.isExpanded = true;
                        }
                    }

                    $scope.searchIcon = true;
                    $scope.startSearch = function () {
                        $scope.searchBox = true;
                        $scope.focusInput = true;
                    };

                    $scope.endSearch = function () {
                        $scope.searchBox = false;
                        $scope.search = '';
                    };

                    $scope.targetTabs = [{'type': 'resource', 'label': 'Resource', 'groupFlag': 'false'},
                        {'type': 'resourcetype', 'label': 'Resource Group', 'groupFlag': 'true'}
                    ];





                    /****** Ajax Smart table ****************/
                    var applicationId = $routeParams.applicationID; // Application ID                   
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    $scope.rightPageinationPerPage = 10;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };

                    $scope.sortType = arrSort[sortHow];
                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.itemsByPage = $rootScope.paginationStore.policy.paginationSize;
                        $scope.sortType_policy = arrSort[$rootScope.paginationStore.policy.orderBy];
                    } else {
                        $scope.itemsByPage = $cookieStore.get('paginationStore').policy.paginationSize;
                        $scope.sortType_policy = arrSort[$cookieStore.get('paginationStore').policy.orderBy];
                    }

                    
                    
                    $scope.rolePolicies = [];
                    $scope.authzPolicies = [];
                    $scope.callServer = function (tableState) {
                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        var sortBy = 'name';
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').policy.paginationSize;
                                $scope.itemsByPage = number;
                                $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }
                            $scope.selectedRow = 0;
                            $rootScope.paginationStore.policy.paginationSize = parseInt(number);
                            $rootScope.paginationStore.policy.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
                            rolePoliciesPageFactory.getPage(start, number, tableState, $scope.applicationId, $scope.policyType, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.authzPolicies = null;
                                        $scope.error = 'No Records';
                                    } else {
                                        $scope.authzPolicies = null;
                                        $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {

                                    $scope.authzPolicies = result.data.policies;
                                    $scope.restResponse = result.data.policies;
                                    /* Show the first row details from response Start*/
                                    $scope.selectedAuthzPolicyPrincipalCount = 0;
                                    $scope.selectedAuthzPolicyResourceCount = 0;
                                    $scope.selectedAuthzPolicyResourceGroupCount = 0;
                                    $scope.selectedAuthzPolicyResources = [];
                                    $scope.selectedAuthzPolicyResourceGroups = [];
                                    $scope.selectedAuthzPolicy = $scope.authzPolicies[0];
                                    $scope.selectedAuthzPolicyPrincipalCount = $scope.selectedAuthzPolicy[$scope.policyType].length;
                                    $scope.selectedAuthzPolicyPrincipals = $scope.selectedAuthzPolicy[$scope.policyType];

                                    for (var i = 0; i < $scope.selectedAuthzPolicy.resourceActions.length; i++) {
                                        if ($scope.selectedAuthzPolicy.resourceActions[i].resource.group == true) {
                                            $scope.selectedAuthzPolicyResourceGroups.push($scope.selectedAuthzPolicy.resourceActions[i]);
                                            $scope.selectedAuthzPolicyResourceGroupCount++;
                                        } else {
                                            $scope.selectedAuthzPolicyResources.push($scope.selectedAuthzPolicy.resourceActions[i]);
                                            $scope.selectedAuthzPolicyResourceCount++;
                                        }
                                    }

                                    if ($scope.selectedAuthzPolicyResourceCount > 0 || $scope.selectedAuthzPolicyResourceGroupCount == 0) {
                                        $scope.selectedIndex = 0;
                                    } else {
                                        $scope.selectedIndex = 1;
                                    }

                                    $scope.selectedAuthzPolicyRoles = $scope.selectedAuthzPolicy.roles;
                                    $scope.selectedAuthzPolicyResources = $scope.selectedAuthzPolicy.resourceActions;
                                    /* Show the first row details from response Ends*/
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
                    };

                    /****** Ajax smart table ends ************/
                    $scope.getSourceName = function (sourceid) {
                        if (!angular.isUndefined(localStorage['sources'])) {
                            return $filter('filter')(JSON.parse(localStorage['sources']), {id: sourceid})[0].name;
                        }
                    }

                    var searchText = ""; // Search criteria for users
                    var sortBy = 'SOURCE_NAME';
                    var sortHow = 'asc';
                    var offset = 0;
                    var limit = 1000;
                    sourceFactory.getSources(searchText, limit, offset, sortBy, sortHow)
                            .then(function (sourceResponse) {
                                $rootScope.getSources = sourceResponse.data;

                            },
                                    function (error) {
                                        $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                                    }
                            ).finally(function () {

                    });


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
                    ngProgress.complete();
                }
            ]);

});
