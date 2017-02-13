define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, rolePoliciesModule, smartTable, ngScrollbar)
{

    rolePoliciesModule.controller('searchRolePoliciesController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$window', 'rolePoliciesPageFactory', 'rolePageFactory', 'resourcePageFactory', 'accessService', 'ngProgress',
                function ($scope, $rootScope, $routeParams, $cookies, $q, $window, rolePoliciesPageFactory, rolePageFactory, resourcePageFactory, accessService, ngProgress)
                {
                    ngProgress.start();
                    
                    /* Initialize */
                    $rootScope.module = 'rolepolicies';
                    $scope.section = 'Role Policy';
                    $scope.applicationId = $rootScope.applicationId;
                    $scope.applicationName = $rootScope.applicationName;
                    $scope.policyType = 'roles';
                    $scope.ccomb = 'AND';
                    
                    $scope.searchstr;
                    $scope.roleName;
                    $scope.resourceName;
                    
                    /****** Ajax Smart table Start ****************/
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var start = 0;
                    var number = $scope.itemsByPage;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'reverse',
                        'desc': 'true'
                    };
                    $scope.sortType = arrSort[sortHow];
                    
                    /****** Ajax Smart table for Roles ****************/
                    $scope.roles;
                    $scope.rolesLength;
                    $scope.errorRole;
                    
                    $scope.callServerRole = function (tableState) {
                    	var section = 'Role';
                    	$scope.roles = null;
                    	$scope.rolesLength=0;
                    	$scope.errorRole = '';
                    	
                        if(!angular.isUndefined($scope.searchRole) && $scope.searchRole!=='') {
                        	$scope.isLoadingRole = true;
                            rolePageFactory.getPage(start, number, tableState, $scope.applicationId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.errorRole = 'No Records';
                                    } else {
                                        $scope.errorRole = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.roles = result.data.roles;
                                    $scope.rolesLength = $scope.roles.length;
                                    $scope.errorRole = '';
                                }
                            }).finally(function () {
                                $scope.isLoadingRole = false;
                            });
                        }
                    };
                    
                    /****** Ajax Smart table for Resources ****************/
                    $scope.resources;
                    $scope.resourcesLength;
                    $scope.errorResource;
                    
                    $scope.callServerResource = function (tableState) {
                    	var section = 'Resource';
                        var tid = ''; //ResourceType
                    	var pid = ''; //Parent
                    	var hierarchical = false;
                    	var global = true;
                    	$scope.resources = null;
                    	$scope.resourcesLength=0;
                    	$scope.errorResource = '';
                    	
                        if(!angular.isUndefined($scope.searchResource) && $scope.searchResource!=='') {
                        	$scope.isLoadingResource = true;
                        	resourcePageFactory.getPage(start, number, tableState, $scope.applicationId, tid, pid, hierarchical, global, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.errorResource = 'No Records';
                                    } else {
                                        $scope.errorResource = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.resources = result.data.resources;
                                    $scope.resourcesLength = $scope.resources.length;
                                    $scope.errorResource = '';
                                }
                            }).finally(function () {
                                $scope.isLoadingResource = false;
                            });
                        }
                    };
                    
                    /****** Ajax Smart table for Role Policy Search results ****************/
                    $scope.searchResult;
                    $scope.searchResultLength;
                    $scope.errorResult;
                    $scope.searchHow = 'Starts With';
                    
                    $scope.callServerResult = function (tableState) {
                    	var section = 'Role Policy Search Results';
                        var resq = $scope.resourceName;
                    	var rolq = $scope.roleName;
                    	var ccomb = $scope.ccomb;
                    	/*var effect = 0;
                    	if($scope.policy_effect=="grant"){
                    		effect = 1;
                    	}else if($scope.policy_effect=="deny"){
                    		effect = 2;
                    	}*/
                    	
                    	$scope.searchResult = null;
                        $scope.searchResultLength = 0;
                        $scope.errorResult = '';
                        $scope.isLoading = true;
                    	var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .

                        if (number) {
                        	$rootScope.rolePolicySearch = {
                        			'roleName' : rolq,
                        			'resourceName' : resq,
                        			'searchStr' : $scope.searchstr
                        		};
                        	rolePoliciesPageFactory.getPage(start, number, tableState, $scope.applicationId, $scope.policyType, sortBy, sortHow, resq, rolq, ccomb, $scope.searchstr).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.errorResult = 'No Records';
                                    } else {
                                        $scope.errorResult = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.searchResult = result.data.policies;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update
                                    $scope.searchResultLength = $scope.searchResult.length;
                                    $scope.errorResult = '';
                                    
                                    if ($scope.searchstr!='') {
                                    	angular.forEach(angular.fromJson(result.data.policies), function (value, key) {
                                        	$scope.searchResult[key].name = highlighText(value['name'], $scope.searchstr, false);
                                        });
                                    }
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
                        
                    }
                    
                    /****** Ajax smart table ends ************/
                    
                    function highlighText(text, search, caseSensitive) {
                        if (text && (search || angular.isNumber(search))) {
                            text = text.toString();
                            search = search.toString();
                            if (caseSensitive) {
                                return text.split(search).join('<span class="highlighted">' + search + '</span>');
                            } else {
                                if (angular.equals($scope.searchHow, 'Contains')) {
                                    return text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>');
                                } else {
                                    return text.replace(new RegExp('^' + search, 'gi'), '<span class="highlighted">$&</span>');
                                }
                            }
                        } else {
                            return text;
                        }
                    }
                    
                    $scope.selectRole = function (role) {
                        $scope.roleName = role.name;
                        angular.element(document.getElementById('role-dropdown')).removeClass("open_div");
                    };
                    $scope.selectResource = function (resource) {
                        $scope.resourceName = resource.name;
                        angular.element(document.getElementById('resource-dropdown')).removeClass("open_div");
                    };
                    $scope.setName = function () {
                        $scope.searchstr = $scope.txtName;
                        angular.element(document.getElementById('name-dropdown')).removeClass("open_div");
                        $scope.txtName = '';
                    }
                    
                    // Name Dropdown
                    $scope.opentoolbar = function (id) {
                        $(document).ready(function () {
                            $('div').removeClass('open_div');
                        });

                        if (angular.element(document.getElementById(id)).hasClass("open_div")) {
                            angular.element(document.getElementById(id)).removeClass("open_div");
                        } else {
                            angular.element(document.getElementById(id)).addClass("open_div");
                        }
                    }
                    
                    //Remove all search tooltip
                    $(document).ready(function () {
                        $(".serach_dropdown").mouseup(function () {
                            return false;
                        });
                        $(document).mouseup(function () {
                            $('div').removeClass('open_div');
                        });
                    });
                    
                    // Submit Search Request with search criteria
                    $scope.showRecords = false;
                    $scope.submitSearch = function () {
                        $scope.showRecords = true;
                        $scope.callServerResult($rootScope.tableState);
                    }
                    
                    // Re-generate Search result using last searched criteria (if any)
                    if (!angular.isUndefined($rootScope.rolePolicySearch) && 
                    		(!angular.isUndefined($rootScope.rolePolicySearch.roleName) 
                    		|| !angular.isUndefined($rootScope.rolePolicySearch.resourceName)
                    		|| !angular.isUndefined($rootScope.rolePolicySearch.searchStr))) {
                    	$scope.searchstr = $rootScope.rolePolicySearch.searchStr;
                        $scope.roleName = $rootScope.rolePolicySearch.roleName;
                        $scope.resourceName = $rootScope.rolePolicySearch.resourceName;
                        
                        $scope.submitSearch();
                    }
                    
                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#resultsscrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height,
                            width: '100%'
                        });
                        $('#rolescrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });
                        $('#resourcescrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });
                        
                    });
                    
                    /******Scroll bar setting end*************/
                    ngProgress.complete();
                }

            ]);
    
    rolePoliciesModule.controller('searchUserPoliciesController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$window', 'rolePoliciesPageFactory', 'sourcePageFactory', 'usersPageFactory', 'resourcePageFactory', 'accessService', 'ngProgress',
                function ($scope, $rootScope, $routeParams, $cookies, $q, $window, rolePoliciesPageFactory, sourcePageFactory, usersPageFactory, resourcePageFactory, accessService, ngProgress)
                {
                    ngProgress.start();
                    
                    /* Initialize */
                    $rootScope.module = 'userpolicies';
                    $scope.section = 'User Policy';
                    $scope.applicationId = $rootScope.applicationId;
                    $scope.applicationName = $rootScope.applicationName;
                    $scope.policyType = 'users';
                    $scope.ccomb = 'AND';
                    
                    $scope.searchstr;
                    $scope.sourceName;
                    $scope.sourceId;
                    //$scope.userSearchDefaultAttr;
                    $scope.userName;
                    $scope.resourceName;
                    
                    /****** Ajax Smart table Start ****************/
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var start = 0;
                    var number = $scope.itemsByPage;
                    //var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'reverse',
                        'desc': 'true'
                    };
                    $scope.sortType = arrSort[sortHow];
                    
                    /****** Ajax Smart table for Sources ****************/
                    $scope.sources;
                    $scope.errorSource;
                    $scope.sourceLength;
                    
                    $scope.callServerSource = function (tableState) {
                    	var section = 'Source';
                    	var sortBy = 'SOURCE_NAME';
                    	$scope.sources = null;
                        $scope.sourceLength = 0;
                        $scope.errorSource = '';
                        
                        if (!angular.isUndefined($scope.searchSource) && $scope.searchSource !== '') {
                        	$scope.isLoadingSource = true;
                            sourcePageFactory.getPage(start, number, tableState, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.errorSource = 'No Records';
                                    } else {
                                        $scope.errorSource = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.sources = result.data.sources;
                                    $scope.sourceLength = $scope.sources.length;
                                    $scope.errorSource = '';
                                }
                            }).finally(function () {
                                $scope.isLoadingSource = false;
                            });
                        }
                    };
                    
                    /****** Ajax Smart table for Users ****************/
                    $scope.users;
                    $scope.errorUser;
                    $scope.userLength;
                    
                    $scope.callServerUser = function (tableState) {
                    	var section = 'User';
                    	var sortBy = 'name';
                    	$scope.users = null;
                    	$scope.userLength=0;
                    	$scope.errorUser = '';
                    	
                    	if(!angular.isUndefined($scope.searchUser) && $scope.searchUser!=='') {
                        	$scope.isLoadingUser = true;
                        	usersPageFactory.getPage(start, number, tableState, $scope.sourceId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.errorUser = 'No Records';
                                    } else {
                                        $scope.errorUser = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.users = result.data.users;
                                    $scope.userLength = $scope.users.length;
                                    $scope.errorUser = '';
                                }
                            }).finally(function () {
                                $scope.isLoadingUser = false;
                            });
                        	
                        }
                    };
                    
                    /****** Ajax Smart table for Resources ****************/
                    $scope.resources;
                    $scope.errorResource;
                    $scope.resourcesLength;
                    
                    $scope.callServerResource = function (tableState) {
                    	var section = 'Resource';
                    	var sortBy = 'name';
                        var tid = ''; //ResourceType
                    	var pid = ''; //Parent
                    	var hierarchical = false;
                    	var global = true;
                    	$scope.resources = null;
                    	$scope.resourcesLength=0;
                    	$scope.errorResource = '';
                    	
                        if(!angular.isUndefined($scope.searchResource) && $scope.searchResource!=='') {
                        	$scope.isLoadingResource = true;
                        	resourcePageFactory.getPage(start, number, tableState, $scope.applicationId, tid, pid, hierarchical, global, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.errorResource = 'No Records';
                                    } else {
                                        $scope.errorResource = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.resources = result.data.resources;
                                    $scope.resourcesLength = $scope.resources.length;
                                    $scope.errorResource = '';
                                }
                            }).finally(function () {
                                $scope.isLoadingResource = false;
                            });
                        }
                    };
                    
                    /****** Ajax Smart table for Role Policy Search results ****************/
                    $scope.searchResult;
                    $scope.searchResultLength;
                    $scope.errorResult;
                    $scope.searchHow = 'Starts With';

                    $scope.callServerResult = function (tableState) {
                    	var section = 'User Policy Search Results';
                    	var sortBy = 'name';
                    	var resq = $scope.resourceName;
                    	var usrq = $scope.userName;
                    	var ccomb = $scope.ccomb;
                    	
                    	$scope.searchResult = null;
                    	$scope.searchResultLength=0;
                    	$scope.errorResult = '';
                    	$scope.isLoading = true;
                    	var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .

                        if (number) {
                        	
                        	$rootScope.userPolicySearch = {
                        			'sourceName' : $scope.sourceName,
                        			'sourceId' : $scope.sourceId,
                         			'userName' : $scope.userName,
                        			'resourceName' : $scope.resourceName,
                        			'searchStr' : $scope.searchstr
                        		};
                        	rolePoliciesPageFactory.getPage(start, number, tableState, $scope.applicationId, $scope.policyType, sortBy, sortHow, resq, usrq, ccomb, $scope.searchstr).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.errorResult = 'No Records';
                                    } else {
                                        $scope.errorResult = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.searchResult = result.data.policies;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update
                                    $scope.searchResultLength = $scope.searchResult.length;
                                    $scope.errorResult = '';
                                    
                                    if ($scope.searchstr!='') {
                                    	angular.forEach(angular.fromJson(result.data.policies), function (value, key) {
                                        	$scope.searchResult[key].name = highlighText(value['name'], $scope.searchstr, false);
                                        });
                                    }
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
                        
                    }
                    
                    /****** Ajax smart table ends ************/
                    
                    
                    function highlighText(text, search, caseSensitive) {
                        if (text && (search || angular.isNumber(search))) {
                            text = text.toString();
                            search = search.toString();
                            if (caseSensitive) {
                                return text.split(search).join('<span class="highlighted">' + search + '</span>');
                            } else {
                                if (angular.equals($scope.searchHow, 'Contains')) {
                                    return text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>');
                                } else {
                                    return text.replace(new RegExp('^' + search, 'gi'), '<span class="highlighted">$&</span>');
                                }
                            }
                        } else {
                            return text;
                        }
                    }
                    
                    $scope.selectSource = function (source) {
                    	$scope.sourceName = source.name;
                        $scope.sourceId = source.id;
                        //$scope.userSearchDefaultAttr = source.searchAttributes.userSearchDefaultAttr;
                        angular.element(document.getElementById('source-dropdown')).removeClass("open_div");
                    };
                    $scope.selectUser = function (user) {
                        $scope.userName = user.uid;
                        angular.element(document.getElementById('user-dropdown')).removeClass("open_div");
                    };
                    $scope.selectResource = function (resource) {
                        $scope.resourceName = resource.name;
                        angular.element(document.getElementById('resource-dropdown')).removeClass("open_div");
                    };
                    $scope.setName = function () {
                        $scope.searchstr = $scope.txtName;
                        angular.element(document.getElementById('name-dropdown')).removeClass("open_div");
                        $scope.txtName = '';
                    }
                    
                    // Name Dropdown
                    $scope.opentoolbar = function (id) {
                        $(document).ready(function () {
                            $('div').removeClass('open_div');
                        });

                        if (angular.element(document.getElementById(id)).hasClass("open_div")) {
                            angular.element(document.getElementById(id)).removeClass("open_div");
                        } else {
                            angular.element(document.getElementById(id)).addClass("open_div");
                        }
                    }
                    
                    //Remove all search tooltip
                    $(document).ready(function () {
                        $(".serach_dropdown").mouseup(function () {
                            return false;
                        });
                        $(document).mouseup(function () {
                            $('div').removeClass('open_div');
                        });
                    });
                    
                    // Submit Search Request with search criteria
                    $scope.showRecords = false;
                    $scope.submitSearch = function () {
                        $scope.showRecords = true;
                        $scope.callServerResult($rootScope.tableState);
                    }
                    
                    // Re-generate Search result using last searched criteria (if any)
                    if (!angular.isUndefined($rootScope.userPolicySearch) && 
                    		(!angular.isUndefined($rootScope.userPolicySearch.sourceName) 
                    		|| !angular.isUndefined($rootScope.userPolicySearch.userName) 
                    		|| !angular.isUndefined($rootScope.userPolicySearch.resourceName)
                    		|| !angular.isUndefined($rootScope.userPolicySearch.searchStr))) {
                    	$scope.searchstr = $rootScope.userPolicySearch.searchStr;
                    	$scope.sourceName = $rootScope.userPolicySearch.sourceName;
                    	$scope.sourceId = $rootScope.userPolicySearch.sourceId;
                        $scope.userName = $rootScope.userPolicySearch.userName;
                        $scope.resourceName = $rootScope.userPolicySearch.resourceName;
                        
                        $scope.submitSearch();
                    }
                    
                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#resultsscrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height,
                            width: '100%'
                        });
                        $('#sourcescrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });
                        $('#userscrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });
                        $('#resourcescrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });
                        
                    });
                    
                    /******Scroll bar setting end*************/
                    ngProgress.complete();
                }

            ]);
    
    rolePoliciesModule.controller('searchGroupPoliciesController',
            [
             '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$window', 'rolePoliciesPageFactory', 'sourcePageFactory', 'groupsPageFactory', 'resourcePageFactory', 'accessService', 'ngProgress',
             function ($scope, $rootScope, $routeParams, $cookies, $q, $window, rolePoliciesPageFactory, sourcePageFactory, groupsPageFactory, resourcePageFactory, accessService, ngProgress)
             {
                 ngProgress.start();
                 
                 /* Initialize */
                 $rootScope.module = 'grouppolicies';
                 $scope.section = 'Group Policy';
                 $scope.applicationId = $rootScope.applicationId;
                 $scope.applicationName = $rootScope.applicationName;
                 $scope.policyType = 'groups';
                 $scope.ccomb = 'AND';
                 
                 $scope.searchstr;
                 $scope.sourceName;
                 $scope.sourceId;
                 //$scope.groupSearchDefaultAttr;
                 $scope.groupName;
                 $scope.resourceName;
                 
                 /****** Ajax Smart table Start ****************/
                 $scope.itemsByPage = $rootScope.itemsByPage;
                 $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                 var start = 0;
                 var number = $scope.itemsByPage;
                 //var sortBy = 'name';
                 var sortHow = 'asc';
                 var arrSort = {
                     'asc': 'reverse',
                     'desc': 'true'
                 };
                 $scope.sortType = arrSort[sortHow];
                 
                 /****** Ajax Smart table for Sources ****************/
                 $scope.sources;
                 $scope.errorSource;
                 $scope.sourceLength;
                 
                 $scope.callServerSource = function (tableState) {
                 	var section = 'Source';
                 	var sortBy = 'SOURCE_NAME';
                 	$scope.sources = null;
                     $scope.sourceLength = 0;
                     $scope.errorSource = '';
                     
                     if (!angular.isUndefined($scope.searchSource) && $scope.searchSource !== '') {
                     	$scope.isLoadingSource = true;
                         sourcePageFactory.getPage(start, number, tableState, sortBy, sortHow).then(function (result) {
                             if (result.error) {
                                 if (result.error.status == 404) {
                                     $scope.errorSource = 'No Records';
                                 } else {
                                     $scope.errorSource = $rootScope.getErrorMessage(result.error, section);
                                 }
                             } else {
                                 $scope.sources = result.data.sources;
                                 $scope.sourceLength = $scope.sources.length;
                                 $scope.errorSource = '';
                             }
                         }).finally(function () {
                             $scope.isLoadingSource = false;
                         });
                     }
                 };
                 
                 /****** Ajax Smart table for Groups ****************/
                 $scope.groups;
                 $scope.errorGroup;
                 $scope.groupLength;
                 
                 $scope.callServerGroup = function (tableState) {
                 	var section = 'Group';
                 	var sortBy = 'name';
                 	$scope.groups = null;
                 	$scope.groupLength=0;
                 	$scope.errorGroup = '';
                 	
                 	if(!angular.isUndefined($scope.searchGroup) && $scope.searchGroup!=='') {
                     	$scope.isLoadingGroup = true;
                     	groupsPageFactory.getPage(start, number, tableState, $scope.sourceId, sortBy, sortHow).then(function (result) {
                             if (result.error) {
                                 if (result.error.status == 404) {
                                     $scope.errorGroup = 'No Records';
                                 } else {
                                     $scope.errorGroup = $rootScope.getErrorMessage(result.error, section);
                                 }
                             } else {
                                 $scope.groups = result.data.groups;
                                 $scope.groupLength = $scope.groups.length;
                                 $scope.errorGroup = '';
                             }
                         }).finally(function () {
                             $scope.isLoadingGroup = false;
                         });
                     	
                     }
                 };
                 
                 /****** Ajax Smart table for Resources ****************/
                 $scope.resources;
                 $scope.errorResource;
                 $scope.resourcesLength;
                 
                 $scope.callServerResource = function (tableState) {
                 	var section = 'Resource';
                 	var sortBy = 'name';
                     var tid = ''; //ResourceType
                 	var pid = ''; //Parent
                 	var hierarchical = false;
                 	var global = true;
                 	$scope.resources = null;
                 	$scope.resourcesLength=0;
                 	$scope.errorResource = '';
                 	
                     if(!angular.isUndefined($scope.searchResource) && $scope.searchResource!=='') {
                     	$scope.isLoadingResource = true;
                     	resourcePageFactory.getPage(start, number, tableState, $scope.applicationId, tid, pid, hierarchical, global, sortBy, sortHow).then(function (result) {
                             if (result.error) {
                                 if (result.error.status == 404) {
                                     $scope.errorResource = 'No Records';
                                 } else {
                                     $scope.errorResource = $rootScope.getErrorMessage(result.error, section);
                                 }
                             } else {
                                 $scope.resources = result.data.resources;
                                 $scope.resourcesLength = $scope.resources.length;
                                 $scope.errorResource = '';
                             }
                         }).finally(function () {
                             $scope.isLoadingResource = false;
                         });
                     }
                 };
                 
                 /****** Ajax Smart table for Role Policy Search results ****************/
                 $scope.searchResult;
                 $scope.searchResultLength;
                 $scope.errorResult;
                 $scope.searchHow = 'Starts With';

                 $scope.callServerResult = function (tableState) {
                 	var section = 'Group Policy Search Results';
                 	var sortBy = 'name';
                 	var resq = $scope.resourceName;
                 	var grpq = $scope.groupName;
                 	var ccomb = $scope.ccomb;
                 	
                 	$scope.searchResult = null;
                 	$scope.searchResultLength=0;
                 	$scope.errorResult = '';
                 	$scope.isLoading = true;
                 	var pagination = tableState.pagination;
                 	var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                 	var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .

                 	if (number) {
                     	
                     	$rootScope.groupPolicySearch = {
                     			'sourceName' : $scope.sourceName,
                     			'sourceId' : $scope.sourceId,
                     			'groupName' : $scope.groupName,
                     			'resourceName' : $scope.resourceName,
                     			'searchStr' : $scope.searchstr
                     		};
                     	rolePoliciesPageFactory.getPage(start, number, tableState, $scope.applicationId, $scope.policyType, sortBy, sortHow, resq, grpq, ccomb, $scope.searchstr).then(function (result) {
                             if (result.error) {
                                 if (result.error.status == 404) {
                                     $scope.errorResult = 'No Records';
                                 } else {
                                     $scope.errorResult = $rootScope.getErrorMessage(result.error, section);
                                 }
                             } else {
                                 $scope.searchResult = result.data.policies;
                                 tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update
                                 $scope.searchResultLength = $scope.searchResult.length;
                                 $scope.errorResult = '';
                                 
                                 if ($scope.searchstr!='') {
                                 	angular.forEach(angular.fromJson(result.data.policies), function (value, key) {
                                     	$scope.searchResult[key].name = highlighText(value['name'], $scope.searchstr, false);
                                     });
                                 }
                             }
                         }).finally(function () {
                             $scope.isLoading = false;
                         });
                     }
                     
                 }
                 
                 /****** Ajax smart table ends ************/
                 
                 
                 function highlighText(text, search, caseSensitive) {
                     if (text && (search || angular.isNumber(search))) {
                         text = text.toString();
                         search = search.toString();
                         if (caseSensitive) {
                             return text.split(search).join('<span class="highlighted">' + search + '</span>');
                         } else {
                             if (angular.equals($scope.searchHow, 'Contains')) {
                                 return text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>');
                             } else {
                                 return text.replace(new RegExp('^' + search, 'gi'), '<span class="highlighted">$&</span>');
                             }
                         }
                     } else {
                         return text;
                     }
                 }
                 
                 $scope.selectSource = function (source) {
                	 $scope.sourceName = source.name;
                     $scope.sourceId = source.id;
                     //$scope.groupSearchDefaultAttr = source.searchAttributes.groupSearchDefaultAttr;
                     angular.element(document.getElementById('source-dropdown')).removeClass("open_div");
                 };
                 $scope.selectGroup = function (group) {
                     $scope.groupName = group.name;
                     angular.element(document.getElementById('group-dropdown')).removeClass("open_div");
                 };
                 $scope.selectResource = function (resource) {
                     $scope.resourceName = resource.name;
                     angular.element(document.getElementById('resource-dropdown')).removeClass("open_div");
                 };
                 $scope.setName = function () {
                     $scope.searchstr = $scope.txtName;
                     angular.element(document.getElementById('name-dropdown')).removeClass("open_div");
                     $scope.txtName = '';
                 }
                 
                 // Name Dropdown
                 $scope.opentoolbar = function (id) {
                     $(document).ready(function () {
                         $('div').removeClass('open_div');
                     });

                     if (angular.element(document.getElementById(id)).hasClass("open_div")) {
                         angular.element(document.getElementById(id)).removeClass("open_div");
                     } else {
                         angular.element(document.getElementById(id)).addClass("open_div");
                     }
                 }
                 
                 //Remove all search tooltip
                 $(document).ready(function () {
                     $(".serach_dropdown").mouseup(function () {
                         return false;
                     });
                     $(document).mouseup(function () {
                         $('div').removeClass('open_div');
                     });
                 });
                 
                 // Submit Search Request with search criteria
                 $scope.showRecords = false;
                 $scope.submitSearch = function () {
                     $scope.showRecords = true;
                     $scope.callServerResult($rootScope.tableState);
                 }
                 
                 // Re-generate Search result using last searched criteria (if any)
                 if (!angular.isUndefined($rootScope.groupPolicySearch) && 
                 		(!angular.isUndefined($rootScope.groupPolicySearch.sourceName) 
                 		|| !angular.isUndefined($rootScope.groupPolicySearch.groupName) 
                 		|| !angular.isUndefined($rootScope.groupPolicySearch.resourceName)
                 		|| !angular.isUndefined($rootScope.groupPolicySearch.searchStr))) {
                	 
                	 $scope.searchstr = $rootScope.groupPolicySearch.searchStr;
                	 $scope.sourceName = $rootScope.groupPolicySearch.sourceName;
                     $scope.sourceId = $rootScope.groupPolicySearch.sourceId;
                     $scope.groupName = $rootScope.groupPolicySearch.groupName;
                     $scope.resourceName = $rootScope.groupPolicySearch.resourceName;
                     
                     $scope.submitSearch();
                 }
                 
                 /******Scroll bar setting start*************/
                 $scope.$applyAsync(function () {
                     $('#resultsscrolltable').slimScroll({
                         height: $rootScope.listscrolltable.height,
                         width: '100%'
                     });
                     $('#sourcescrolltable').slimScroll({
                         height: '210px',
                         width: '100%'
                     });
                     $('#groupscrolltable').slimScroll({
                         height: '210px',
                         width: '100%'
                     });
                     $('#resourcescrolltable').slimScroll({
                         height: '210px',
                         width: '100%'
                     });
                     
                 });
                 
                 /******Scroll bar setting end*************/
                 ngProgress.complete();
             }

         ]);
    
});
