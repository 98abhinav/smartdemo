define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, rolePoliciesModule, smartTable, ngScrollbar)
{

    rolePoliciesModule.controller('rolePoliciesController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', '$timeout','$filter', 'rolePoliciesFactory', 'rolePoliciesPageFactory', 'ngProgress', 'toasterService','$route',
                function ($scope, $rootScope, $cookies, $routeParams, $location, $timeout,$filter, rolePoliciesFactory, rolePoliciesPageFactory, ngProgress, toasterService, $route)
                {

                    ngProgress.start();

                    var message;
                    $rootScope.module = 'rolepolicies';
                    $scope.section = 'Role Policy';
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.policyType = $routeParams.policyType; //Policy Type - user, group or role
                    
                    // Reset the search rootScope
                    if (!angular.isUndefined($rootScope.rolePolicySearch)) {
                    	$rootScope.rolePolicySearch=undefined;
                    }
                    if (!angular.isUndefined($rootScope.userPolicySearch)) {
                    	$rootScope.userPolicySearch=undefined;
                    }
                    if (!angular.isUndefined($rootScope.groupPolicySearch)) {
                    	$rootScope.groupPolicySearch=undefined;
                    }
                    
                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.rolePolicy.DELETE_CONFIRM + $scope.selectedAuthzPolicy.name + '?';
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
//                    $scope.numPrincipalsPerPage = 4;
//                    $scope.numResourcesPerPage = 4;
//                    $scope.numResourceGroupsPerPage = 4;
                    $scope.selectAuthzPolicy = function (authzPolicyDetails) {
                    	
//                    	$scope.numPrincipalPages = 0;
//                    	$scope.numResourcePages = 0;
//                    	$scope.numResourceGroupsPages = 0;
                    	
//                    	$scope.currentPrincipalPage = 1;
//                    	$scope.currentResourcePage = 1;
//                    	$scope.currentResourceGroupPage = 1;
                    	
                    	$scope.selectedAuthzPolicyPrincipalCount = 0;
                        $scope.selectedAuthzPolicyResourceCount = 0;
                        $scope.selectedAuthzPolicyResourceGroupCount = 0;
                        $scope.selectedAuthzPolicyResources = [];
                        $scope.selectedAuthzPolicyResourceGroups = [];
                        

                    	$scope.selectedAuthzPolicy = authzPolicyDetails;
                    	$scope.selectedAuthzPolicyPrincipalCount = authzPolicyDetails[$scope.policyType].length;
                    	$scope.selectedAuthzPolicyPrincipals = authzPolicyDetails[$scope.policyType];
                    	
//                    	$scope.numPrincipalPages = Math.floor(authzPolicyDetails[$scope.policyType].length/ $scope.numPrincipalsPerPage) + 1;

                        for(var i=0; i<$scope.selectedAuthzPolicy.resourceActions.length; i++) {
                        	if($scope.selectedAuthzPolicy.resourceActions[i].resource.group==true) {
                        		$scope.selectedAuthzPolicyResourceGroups.push($scope.selectedAuthzPolicy.resourceActions[i]);
                        		$scope.selectedAuthzPolicyResourceGroupCount++;
                        	} else {
                        		$scope.selectedAuthzPolicyResources.push($scope.selectedAuthzPolicy.resourceActions[i]);
                        		$scope.selectedAuthzPolicyResourceCount++;
                        	}
                        }
                        
                        if($scope.selectedAuthzPolicyResourceCount>0 ||$scope.selectedAuthzPolicyResourceGroupCount == 0) {
                        	$scope.selectedIndex=0;
                        } else {
                        	$scope.selectedIndex=1;
                        }
//
//                        if($scope.selectedAuthzPolicyResources.length > 0) {
//                        	$scope.numResourcePages = Math.floor($scope.selectedAuthzPolicyResources.length/ $scope.numResourcesPerPage) + 1;
//                    	}
//                        
//                        if($scope.selectedAuthzPolicyResourceGroups.length > 0) {
//                        	$scope.numResourceGroupPages = Math.floor($scope.selectedAuthzPolicyResourceGroups.length/ $scope.numResourceGroupsPerPage) + 1;
//                    	}
//                        
                        $scope.selectedAuthzPolicyRoles = authzPolicyDetails.roles;
                        $scope.selectedAuthzPolicy.resources = [];
                        $scope.selectedAuthzPolicy.resourceGroups = [];
//                        for (key in authzPolicyDetails.resourceActions) {
//                        	var resourceInfo = key.split("|");
//                        	if(resourceInfo[0] == 0) {
//                        		var resource={};
//                        		resource.id=resourceInfo[1];
//                        		resource.fqdn=resourceInfo[2];
//                        		$scope.selectedAuthzPolicy.resources.push(resource);
//                        	} else {
//                        		//This is resourceGroup
//                        		var resourceGroup={};
//                        		resourceGroup.id=resourceInfo[1];
//                        		resourceGroup.fqdn=resourceInfo[2];
//                        		$scope.selectedAuthzPolicy.resourceGroups.push(resourceGroup);
//                        	}
//                        	console.log(key +"=" + authzPolicyDetails.resourceActions[key]);
//                        }
                        
//                        for(i=0; i < authzPolicyDetails.resourceActions.length; i++) {
//                        	var resourceSplit = 
//                        	
//                        	
//                        }
                        
//                        $scope.selectedAuthzPolicyResourceCount = authzPolicyDetails.resourceActions.length;
//                        $scope.selectedAuthzPolicyResources = authzPolicyDetails.resourceActions;

                        $scope.showInfo = true;
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
                                break; 
                        }
                    };                    
                    
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
                    
                    $scope.nextResourcePage = function() {
                    	if($scope.currentResourcePage < $scope.numResourcePages)
                    	$scope.currentResourcePage ++;
                    }
                    
                    $scope.previousResourcePage = function() {
                    	if($scope.currentResourcePage > 1) {
                    		$scope.currentResourcePage--;
                    	}
                    }

                    $scope.nextResourceGroupPage = function() {
                    	if($scope.currentResourceGroupPage < $scope.numResourceGroupPages)
                    	$scope.currentResourceGroupPage ++;
                    }
                    
                    $scope.previousResourceGroupPage = function() {
                    	if($scope.currentResourceGroupPage > 1) {
                    		$scope.currentResourceGroupPage--;
                    	}
                    }
                    
                    $scope.toggleExpand = function(obj) {
                    	if(obj.isExpanded) {
                    		obj.isExpanded = false;
                    	} else {
                    		obj.isExpanded=true;
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

                    $scope.targetTabs = [{'type':'resource', 'label': 'Resource', 'groupFlag': 'false'},
                                         {'type':'resourcetype', 'label': 'Resource Groupu', 'groupFlag': 'true'}
                                         ];
                    
                    
                    
                    
                    
                    /****** Ajax Smart table ****************/
                    var applicationId = $routeParams.applicationID; // Application ID
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    $scope.rightPageinationPerPage = 10;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'reverse',
                        'desc': 'true'
                    };
                    $scope.sortType = arrSort[sortHow];
                    $scope.rolePolicies = [];

                    $scope.callServer = function (tableState) {
                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        if (number) {
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
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
                    };

                    /****** Ajax smart table ends ************/
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
                        $('#scrolluser').slimScroll({
                            height: $rootScope.listscrollrightinnerdiv.height
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#scrollgroup').slimScroll({
                            height: $rootScope.listscrollrightinnerdiv.height
                        });
                    });

                    $scope.$applyAsync(function () {
                        $('#scrollrightinnerdiv').slimScroll({
                            height: '247px'
                        });
                    });   
                    
                    $scope.$applyAsync(function () {
                        $('#scrollrightinnerdivres').slimScroll({
                            height: '247px'
                        });
                    }); 
                    /******Scroll bar setting end*************/
                    ngProgress.complete();
                }
            ]);
    
});
