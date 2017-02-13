define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, resourceModule, smartTable, ngScrollbar)
{
    resourceModule.controller('resourcesController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$timeout', '$document', 'resourceFactory', 'resourcePageFactory', 'resourceTypePageFactory', 'accessService', 'ngProgress', 'toasterService', '$route', '$window', 'resourceShareDataService', '$filter', 'rolePoliciesFactory',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $timeout, $document, resourceFactory, resourcePageFactory, resourceTypePageFactory, accessService, ngProgress, toasterService, $route, $window, resourceShareDataService, $filter, rolePoliciesFactory)
                {
                    ngProgress.start();

                    var message;
                    $rootScope.module = 'resources';
                    $scope.section = 'Resource';
                    $scope.applicationId = $routeParams.applicationID; // application ID

                    $scope.treeNav = (resourceShareDataService.get().treeNav != null) ? resourceShareDataService.get().treeNav : [];
                    $scope.resourcetypename = (resourceShareDataService.get().resourcetypename != null) ? resourceShareDataService.get().resourcetypename : '';
                    $scope.resourcetypehierarchical = (resourceShareDataService.get().resourcetypehierarchical != null) ? resourceShareDataService.get().resourcetypehierarchical : '';

                    /* Access Check Validate */
                    accessService.checkAccessDeny();


                    // Reset the search rootScope
                    if (!angular.isUndefined($rootScope.resourceSearch)) {
                        $rootScope.resourceSearch = undefined;
                    }

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.resource.DELETE_CONFIRM + $scope.selectedResource.name + '?';
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteResource($scope.id, $scope.applicationId);
                    });

                    function deleteResource(id, applicationId) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.selectedResource.name, 'mode': 'delete'};
                        resourceFactory.deleteResource(id, applicationId)
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

                    var applicationId = $routeParams.applicationID; // Application ID

                    /****** Ajax Smart table ****************/
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    $scope.rightPageinationPerPage = 10;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                    //$scope.sortType = arrSort[sortHow];

                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.itemsByPage = $rootScope.paginationStore.resource.paginationSize;
                        $scope.sortType = arrSort[$rootScope.paginationStore.resource.orderBy];
                    } else {
                        $scope.itemsByPage = $cookieStore.get('paginationStore').resource.paginationSize;
                        $scope.itemsByPage_resourceType = $cookieStore.get('paginationStore').resourceType.paginationSize;
                        $scope.sortType = arrSort[$cookieStore.get('paginationStore').resource.orderBy];
                    }

                    $scope.resources = [];

                    $scope.callServer = function (tableState) {
                        $scope.error = "";
                        //console.log(tableState);
                        var tid = (resourceShareDataService.get().resourcetypeid != null) ? resourceShareDataService.get().resourcetypeid : '';
                        var pid = (resourceShareDataService.get().resourceparentid != null) ? resourceShareDataService.get().resourceparentid : 0;
                        var hierarchical = resourceShareDataService.get().resourcetypehierarchical;
                        var global = false;
                        $scope.resourcehierarchy = hierarchical ? 'Hierarchial Resources' : 'Non-Hierarchial Resources';
                        if (tid == '') {
                            $scope.resources = null;
                            $scope.error = 'Please select a Resource Type';
                        } else {
                            $scope.isLoading = true;
                            var pagination = tableState.pagination;
                            var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                            var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .

                            if (number) {
                                if ($rootScope.previousRoute != $rootScope.currentRoute
                                        && !angular.isUndefined($rootScope.previousRoute)) {
                                    number = $cookieStore.get('paginationStore').resource.paginationSize;
                                    $scope.itemsByPage = number;
                                    $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                    $rootScope.previousRoute = undefined;
                                }
                                $scope.selectedRow = 0;
                                $rootScope.paginationStore.resource.paginationSize = parseInt(number);
                                $rootScope.paginationStore.resource.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                                $cookieStore.put('paginationStore', $rootScope.paginationStore);
                                resourcePageFactory.getPage(start, number, tableState, applicationId, tid, pid, hierarchical, global, sortBy, sortHow).then(function (result) {
                                    if (result.error) {
                                        if (result.error.status == 404) {
                                            $scope.resources = null;
                                            $scope.error = 'No Records';
                                        } else {
                                            $scope.resources = null;
                                            $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);

                                        }
                                    } else {
                                        $scope.resources = result.data.resources;

                                        $scope.restResponse = result.data.resources;
                                        /* Show the first row details from response Start*/
                                        $scope.selectedResource = $scope.resources[0];
                                        /* Load the policy associated with role*/
                                        //getResourcePolicy('Role');                                       
                                        /* Show the first row details from response Ends*/
                                        tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update                                     
                                    }
                                }).finally(function () {
                                    $scope.isLoading = false;
                                });
                            }
                        }

                    }
                    /****** Ajax smart table ends ************/


                    $scope.$on('FirstRecord', function (event) {
                        $scope.resourcedetails = {
                            id: $scope.resources[0].id,
                            name: $scope.resources[0].name,
                            description: $scope.resources[0].description
                        };
                        $scope.selectresource($scope.resourcedetails);
                    });

                    $scope.selectedRow = 0;
                    $scope.selectresource = function (resourcedetails, index) {
                        $scope.selectedRow = index;
                        //$scope.selectedResource = resourcedetails;
                    };

                    $scope.policyType = 'Role';
                    $scope.$watch('selectedRow', function () {
                        if ($scope.resources != null) {                            
                            $scope.selectedResource = $scope.resources[$scope.selectedRow];
                            $scope.selectedResourceGroupPolicy = null;
                            $scope.selectedResourceUserPolicy = null; 
                            $scope.showpolicy = false;
                        }
                    });

                    $scope.showpolicy = false;
                    $scope.showPolicies = function (){
                        $scope.showpolicy = true;
                        $scope.policyLoading = true;
                        if ($scope.policyType === 'Group') {
                                getResourcePolicy('Group');
                            } else if ($scope.policyType === 'User') {
                                getResourcePolicy('User');
                            } else {
                                getResourcePolicy('Role');
                            }
                    }

                    $scope.selectedPolicy = function (policyType) {
                        $scope.policyType = policyType;
                        getResourcePolicy(policyType);
                    }

                    /* Get Resources's policy */
                    $scope.selectedResourceRolePolicy = null;
                    $scope.selectedResourceGroupPolicy = null;
                    $scope.selectedResourceUserPolicy = null;

                    function getResourcePolicy(policyType) {
                        // Custom object for error & success message
                        var objCustom = {
                            'displayValue': policyType,
                            'mode': 'fetch'
                        };

                        rolePoliciesFactory.getResourcePolicy(policyType, $scope.applicationId, $scope.selectedResource.typeID, $scope.selectedResource.fqdn)
                                .then(function (response) {
                                    if (policyType === 'Role') {
                                        $scope.selectedResourceRolePolicy = response.data.policies;
                                        $scope.selectedResourceRolePolicyCount = response.data.policies.length;
                                    } else if (policyType === 'Group') {
                                        $scope.selectedResourceGroupPolicy = response.data.policies;
                                        $scope.selectedResourceGroupPolicyCount = response.data.policies.length;
                                    } else {
                                        $scope.selectedResourceUserPolicy = response.data.policies;
                                        $scope.selectedResourceUserPolicyCount = response.data.policies.length;
                                    }

                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.error = 'No Records';
                                            } else {
                                                message = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                                $scope.error = message;
                                                toasterService.showToastr(message, 'error');
                                            }
                                            if (policyType === 'Role') {
                                                $scope.selectedResourceRolePolicy = null;
                                                $scope.selectedResourceRolePolicyCount = 0;
                                            } else if (policyType === 'Group') {
                                                $scope.selectedResourceGroupPolicy = null;
                                                $scope.selectedResourceGroupPolicyCount = 0;
                                            } else {
                                                $scope.selectedResourceUserPolicy = null;
                                                $scope.selectedResourceUserPolicyCount = 0;
                                            }
                                        }
                                ).finally(function () {

                            toasterService.hideToastr(false);
                            $scope.policyLoading = false;
                        });
                    }


                    $scope.tdHeight = 10;
                    $scope.setItemsByPage = function () {
                        $('#itemsByPage').blur();
                        $scope.itemsByPage = document.getElementById('itemsByPage').value;
                        $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                    };



                    // Get Childs of Hierarchial resources
                    $scope.getChilds = function (value) {
                        $scope.resources = null;
                        //$scope.parentresourcename = value.name;
                        if (!$scope.treeNav.length) {
                            var defaultNode = {'id': 0, 'name': 'Resources'};
                            $scope.treeNav.push(defaultNode);
                        }

                        var id = value.id;
                        if (angular.isUndefined($filter('filter')($scope.treeNav, {'id': id})[0])) {
                            var currNode = {'id': id, 'name': value.name};
                            $scope.treeNav.push(currNode);
                        } else {
                            //var currId = $filter('filter')($scope.treeNav, {'id':id})[0].id;
                            var index = $scope.treeNav.indexOf(value);
                            if (index == 0) {
                                $scope.treeNav.splice(index, $scope.treeNav.length);
                            } else {
                                $scope.treeNav.splice(index + 1, $scope.treeNav.length);
                            }
                        }

                        var hierarchical = (resourceShareDataService.get().resourcetypehierarchical != null) ? resourceShareDataService.get().resourcetypehierarchical : true;
                        var typeID = (resourceShareDataService.get().resourcetypeid != null) ? resourceShareDataService.get().resourcetypeid : '';
                        var typeName = (resourceShareDataService.get().resourcetypename != null) ? resourceShareDataService.get().resourcetypename : '';
                        var resourceData = {
                            "resourceparentid": value.id,
                            "resourcetypeid": typeID,
                            "resourcetypename": typeName,
                            "resourcetypehierarchical": hierarchical,
                            "treeNav": $scope.treeNav,
                        };

                        resourceShareDataService.set(resourceData);
                        //$route.reload();

                        // Regenerate the smart table with default tablestate
                        $scope.callServer($rootScope.tableState);
                    };

                    // Add new Childs in empty resources
                    $scope.addChilds = function (value) {
                        if (!$scope.treeNav.length) {
                            var defaultNode = {'id': 0, 'name': 'Resources'};
                            $scope.treeNav.push(defaultNode);
                        }

                        var newNode = {'id': value.id, 'name': value.name};
                        $scope.treeNav.push(newNode);

                        var hierarchical = (resourceShareDataService.get().resourcetypehierarchical != null) ? resourceShareDataService.get().resourcetypehierarchical : true;
                        var typeID = (resourceShareDataService.get().resourcetypeid != null) ? resourceShareDataService.get().resourcetypeid : '';
                        var typeName = (resourceShareDataService.get().resourcetypename != null) ? resourceShareDataService.get().resourcetypename : '';
                        var resourceData = {
                            "resourceparentid": value.id,
                            "resourcetypeid": typeID,
                            "resourcetypename": typeName,
                            "resourcetypehierarchical": hierarchical,
                            "treeNav": $scope.treeNav,
                        };
                        resourceShareDataService.set(resourceData);

                        $location.path("/" + $scope.applicationId + '/resources/add');
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

                    $scope.usersourcesearchIcon = true;
                    $scope.groupsourcesearchIcon = true;
                    $scope.rolesourcesearchIcon = true;
                    $scope.startViewSearch = function (searchType) {
                        switch (searchType) {
                            case 'usersource':
                                $scope.usersourcesearchBox = true;
                                $scope.usersourcefocusInput = true;
                                break;
                            case 'groupsource':
                                $scope.groupsourcesearchBox = true;
                                $scope.groupsourcefocusInput = true;
                                break;
                            case 'rolesource':
                                $scope.rolesourcesearchBox = true;
                                $scope.rolesourcefocusInput = true;
                                break;

                        }

                    };

                    $scope.endViewSearch = function (searchType) {
                        switch (searchType) {
                            case 'usersource':
                                $scope.usersourcesearchBox = false;
                                $scope.search_user = '';
                                break;
                            case 'groupsource':
                                $scope.groupsourcesearchBox = false;
                                $scope.search_group = '';
                                break;
                            case 'rolesource':
                                $scope.rolesourcesearchBox = false;
                                $scope.search_group = '';
                                break;
                        }
                    };

                    /****Ajax Smart table dropdown for Resource type #start****/
                    $scope.openDropdown = false;
                    /*$scope.itemsByPage = $rootScope.itemsByPage;
                     $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                     var sortBy = 'name';
                     var sortHow = 'asc';
                     var arrSort = {
                     'asc': 'reverse',
                     'desc': 'true'
                     };                    
                     $scope.sortType = arrSort[sortHow];*/

                    $scope.resourcetypes = [];

                    $scope.callServerDropdown = function (tableState) {
                        var section = 'Resource Type';
                        $scope.isLoading_dd = true;
                        //tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        tableState.search_dd = {};
                        //alert(number);
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').resourceType.paginationSize;
                                $scope.itemsByPage_resourceType = number;
                                //$scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }
                            $rootScope.paginationStore.resourceType.paginationSize = parseInt(number);
                            $rootScope.paginationStore.resourceType.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
                            resourceTypePageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.resourcetypes = null;
                                        $scope.error_dd = 'No Records';
                                    } else {
                                        $scope.resourcetypes = null;
                                        $scope.error_dd = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.resourcetypes = result.data.resourceTypes;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading_dd = false;
                            });
                        }
                    };

                    // Close all instances when user clicks elsewhere
                    $window.onclick = function (event) {
                        closeWhenClickingElsewhere(event, function () {
                            $scope.openDropdown = false;
                            $scope.$apply();
                        }, 'list_container');
                    };

                    $scope.getDropdownIconClass = function () {
                        if (!$scope.openDropdown) {
                            return "arrow-down";
                        }
                        return "arrow-up";
                    };

                    $scope.selectResourcetype = function (value) {
                        $scope.resources = null;
                        $scope.treeNav = [];
                        $scope.openDropdown = false;
                        $scope.resourcetypename = value.name;
                        $scope.resourcetypehierarchical = value.hierarchical;

                        var selectedResourcetype = {
                            "resourcetypeid": value.id,
                            "resourcetypename": value.name,
                            "resourcetypehierarchical": value.hierarchical
                        };

                        resourceShareDataService.set(selectedResourcetype);
                        //$route.reload();

                        // Regenerate the smart table with default tablestate
                        $scope.callServer($rootScope.tableState);

                        var content_area = angular.element(document.getElementById('content_area'));
                        $document.scrollToElementAnimated(content_area, $rootScope.angularscroll.offset, $rootScope.angularscroll.duration);
                    };
                    /****Ajax Smart table dropdown for Resource type #end****/

                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height
                        });

                        $('#scrollrightdiv').slimScroll({
                            height: $rootScope.listscrollrightdiv.height,
                            width: $rootScope.listscrollrightdiv.width
                        });

                        $('#scrolldropdown').slimScroll({
                            height: '280px',
                            //color : $rootScope.listscrolltable.color                            
                        });
                    });

                    /******Scroll bar setting end*************/
                    ngProgress.complete();
                }
            ]);


    resourceModule.controller('manageResourcesController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'resourceFactory', 'accessService', 'ngProgress', 'toasterService', 'resourceShareDataService', '$route',
                function ($scope, $rootScope, $cookies, $routeParams, $location, resourceFactory, accessService, ngProgress, toasterService, resourceShareDataService, $route)
                {
                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    $rootScope.module = 'resources';
                    $scope.section = 'Resource';
                    $scope.resources;
                    $scope.resource;
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.resourceId = $routeParams.resourceID; // Resource ID
                    $scope.addmore;

                    // Redirect to Resource List controller
                    $scope.redirectList = function () {
                        if (!angular.isUndefined($rootScope.resourceSearch)) {
                            $location.path("/" + $scope.applicationId + '/resources/search');
                        } else {
                            $location.path("/" + $scope.applicationId + '/resources');
                        }
                    };

                    if (!resourceShareDataService.get().resourcetypeid) {
                        $scope.redirectList();
                    }

                    // Get stored values from shared data
                    $scope.typeID = resourceShareDataService.get().resourcetypeid;
                    $scope.parentID = (resourceShareDataService.get().resourceparentid != null) ? resourceShareDataService.get().resourceparentid : 0;
                    $scope.typeName = resourceShareDataService.get().resourcetypename;
                    $scope.treeNav = (resourceShareDataService.get().treeNav != null) ? resourceShareDataService.get().treeNav : null;
                    $scope.resourcetypehierarchical = (resourceShareDataService.get().resourcetypehierarchical != null) ? resourceShareDataService.get().resourcetypehierarchical : false;

                    /* Access Check */
                    accessService.checkAccess($rootScope.module, $scope.section);

                    if ($scope.mode == 'edit') {
                        getResource($scope.resourceId, $scope.applicationId);
                    }

                    $scope.submitData = function (resource, mode, isValid)
                    {
                        if (!isValid) {
                            $(document).scrollTop(0);
                            return;
                        }
                        var resourceData = {
                            name: resource.name,
                            description: resource.description,
                            appID: $scope.applicationId,
                            typeID: $scope.typeID
                        };

                        // Add Resource
                        if (mode == 'add') {
                            resourceData.parentID = $scope.parentID;
                            $scope.insertResource(resourceData);
                        }

                        // Edit Application
                        if (mode == 'edit') {
							resourceData.parentID = $scope.parentID;
                            $scope.updateResource(resource.id, resourceData);
                        }
                    }

                    $scope.saveAndAddSibling = function ()
                    {
                        $scope.addmore = 'sibling';
                        $scope.submitted = true;
                    }
                    $scope.saveAndAddChild = function ()
                    {
                        $scope.addmore = 'child';
                        $scope.submitted = true;
                    }
                    /* ## Manage Resource Starts ## */

                    /*  Get Resource by ID */
                    function getResource(id, applicationId) {
                        message = $rootScope.translation.toaster.LOADING;
                        toasterService.showToastr(message, 'loader');
                        resourceFactory.getResource(id, applicationId)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    $scope.resource = response.data;
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            message = $rootScope.getErrorMessage(error, $scope.section);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            toasterService.hideToastr(false);
                        });
                    }
                    ;

                    /* Insert New Resource */
                    $scope.insertResource = function (resources) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');
                        // Custom object for error & success message
                        var objCustom = {'displayValue': resources.name, 'mode': 'insert'};
                        resourceFactory.insertResource(resources)
                                .success(function (data, status, headers, config) {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    if ($scope.addmore == 'sibling') {
                                        $route.reload();
                                        toasterService.showToastr(message, 'success');
                                    } else if ($scope.addmore == 'child') {
                                        var treeNav = (resourceShareDataService.get().treeNav != null) ? resourceShareDataService.get().treeNav : [];
                                        if (!treeNav.length) {
                                            var defaultNode = {'id': 0, 'name': 'Resources'};
                                            treeNav.push(defaultNode);
                                        }

                                        var responseHeader = headers();
                                        var newNode = {'id': responseHeader.es_id, 'name': resources.name};
                                        treeNav.push(newNode);

                                        var hierarchical = (resourceShareDataService.get().resourcetypehierarchical != null) ? resourceShareDataService.get().resourcetypehierarchical : true;
                                        var typeID = (resourceShareDataService.get().resourcetypeid != null) ? resourceShareDataService.get().resourcetypeid : '';
                                        var typeName = (resourceShareDataService.get().resourcetypename != null) ? resourceShareDataService.get().resourcetypename : '';
                                        var resourceData = {
                                            "resourceparentid": responseHeader.es_id,
                                            "resourcetypeid": typeID,
                                            "resourcetypename": typeName,
                                            "resourcetypehierarchical": hierarchical,
                                            "treeNav": treeNav
                                        };
                                        resourceShareDataService.set(resourceData);

                                        $route.reload();
                                        toasterService.showToastr(message, 'success');
                                    } else {
                                        redirectpath = resources.appID + '/resources';
                                        toasterService.showToastr(message, 'success', redirectpath);
                                    }

                                }).error(function (data, status, headers, config) {
                                	var error = {'status':status};
		                            toasterService.hideToastr(false);
		                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
		                            message = $scope.error;
		                            toasterService.showToastr(message, 'error');
		                        }).finally(function () {
		                            toasterService.hideToastr(false);
		                        });
                    };

                    /* Update Resource */
                    $scope.updateResource = function (id, resources) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': resources.name, 'mode': 'update'};
                        resourceFactory.updateResource(id, resources)
                                .then(function () {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = resources.appID + '/resources';
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

                    /* ## Manage Resources Ends ## */

                    ngProgress.complete();
                }
            ]);


    resourceModule.controller('searchResourcesController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$window', '$cookieStore', 'resourceTypePageFactory', 'resourcePageFactory', 'resourceFactory', 'accessService', 'ngProgress', 'resourceShareDataService',
                function ($scope, $rootScope, $routeParams, $cookies, $q, $window, $cookieStore, resourceTypePageFactory, resourcePageFactory, resourceFactory, accessService, ngProgress, resourceShareDataService)
                {
                    ngProgress.start();

                    /* Initialize */
                    $rootScope.module = 'resources';
                    $scope.section = 'Resource';
                    $scope.applicationId = $rootScope.applicationId;
                    $scope.applicationName = $rootScope.applicationName;


                    $scope.searchstr;
                    $scope.resourcetypeName;
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
                        $scope.resourcesLength = 0;
                        $scope.errorResource = '';

                        if (!angular.isUndefined($scope.search) && $scope.search !== '') {
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


                    /****** Ajax Smart table for Resource Type ****************/
                    $scope.resourcetypes = [];
                    $scope.resourceTypeLength = 0;
                    $scope.errorResourceType = '';

                    $scope.callServerResourceType = function (tableState) {

                        if (!angular.isUndefined($scope.searchResourceType) && $scope.searchResourceType !== '') {
                            $scope.isLoadingResourceType = true;
                            resourceTypePageFactory.getPage(start, number, tableState, $scope.applicationId, sortBy, sortHow).then(function (result) {

                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.resourcetypes = null;
                                        $scope.errorResourceType = 'No Records';
                                    } else {
                                        $scope.resourcetypes = null;
                                        $scope.errorResourceType = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.resourcetypes = result.data.resourceTypes;
                                    $scope.resourceTypeLength = $scope.resourcetypes.length;
                                    $scope.errorResourceType = '';

                                }
                            }).finally(function () {
                                $scope.isLoadingResourceType = false;
                            });
                        }
                    };




                    /****** Ajax Smart table for Role Policy Search results ****************/
                    $scope.searchResult;
                    $scope.searchResultLength;
                    $scope.errorResult;
                    $scope.searchHow = 'Starts With';






                    $scope.callServerResult = function () {
                        var section = 'Resource Search Results';
                        var resq = $scope.resourceName;
                        var resTypeq = $scope.resourcetypeName;
                        var tid = $scope.resourcetypeId; //ResourceType
                        var pid = angular.isUndefined($scope.parentID) ? 0 : $scope.parentID; //Parent
                        var hierarchical = $scope.hierarchical;
                        var global = true;

                        var resourceData = {
                            "resourceparentid": pid,
                            "resourcetypeid": $scope.resourcetypeId,
                            "resourcetypename": $scope.resourcetypeName,
                            "resourcetypehierarchical": hierarchical
                        };

                        resourceShareDataService.set(resourceData);


                        if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                            $scope.itemsByPage = $rootScope.paginationStore.resource.paginationSize;
                        } else {
                            $scope.itemsByPage = $cookieStore.get('paginationStore').resource.paginationSize;
                        }

                        $scope.searchResult = null;
                        $scope.searchResultLength = 0;
                        $scope.errorResult = '';
                        $scope.isLoading = true;


                        if (number) {
                            $rootScope.resourceSearch = {
                                'resourcetypeName': resTypeq,
                                'resourceName': resq,
                                'searchStr': $scope.searchstr,
                                'resourcetypeId': $scope.resourcetypeId,
                                'hierarchical': pid
                            };

                            var resultPromise = resourceFactory.getResourcesSearch($scope.searchstr, $scope.applicationId, tid, pid, hierarchical, global, sortBy, sortHow);
                            resultPromise.then(
                                    function (result) {
                                        $scope.searchResult = result.data.resources;
                                        $scope.searchResultLength = $scope.searchResult.length;
                                        $scope.errorResult = '';

                                        if ($scope.resourceName != '') {
                                            angular.forEach(angular.fromJson(result.data.resources), function (value, key) {
                                                $scope.searchResult[key].name = highlighText(value['name'], $scope.searchstr, false);
                                            });
                                        }
                                    }, function (error) {
                                if (error.status == 404) {
                                    $scope.errorResult = 'No Records';
                                } else {
                                    $scope.errorResult = $rootScope.getErrorMessage(error, section);
                                }
                                //errorDetails = error;
                            }).finally(function () {
                                if ($rootScope.previousRoute != $rootScope.currentRoute
                                        && !angular.isUndefined($rootScope.previousRoute)) {
                                    number = $cookieStore.get('paginationStore').resource.paginationSize;
                                    $scope.itemsByPage = number;
                                    $rootScope.previousRoute = undefined;
                                }
                                $scope.isLoading = false;
                            });


                        }

                    }

                    /****** Ajax smart table ends ************/

                    $scope.setItemsByPage = function () {
                        $scope.itemsByPage = document.getElementById('itemsByPage').value;
                        $rootScope.paginationStore.resource.paginationSize = parseInt($scope.itemsByPage);
                        $cookieStore.put('paginationStore', $rootScope.paginationStore);
                    };

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
                    $scope.hierarchical = false;
                    $scope.selectResourcetype = function (resourcetype) {
                        $scope.resourcetypeName = resourcetype.name;
                        $scope.resourcetypeId = resourcetype.id;
                        $scope.hierarchical = resourcetype.hierarchical;
                        angular.element(document.getElementById('resourcetype-dropdown')).removeClass("open_div");
                    };
                    $scope.selectResource = function (resource) {
                        $scope.resourceName = resource.name;
                        $scope.parentID = resource.id;
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
                        $scope.callServerResult();
                        if (angular.isUndefined($scope.resourceName)) {
                            $scope.resourceName = 'ALL';
                        }
                    }

                    // Re-generate Search result using last searched criteria (if any)
                    if (!angular.isUndefined($rootScope.resourceSearch) &&
                            (!angular.isUndefined($rootScope.resourceSearch.resourcetypeName)
                                    || !angular.isUndefined($rootScope.resourceSearch.resourceName)
                                    || !angular.isUndefined($rootScope.resourceSearch.searchStr)
                                    || !angular.isUndefined($rootScope.resourceSearch.resourcetypeId)
                                    || !angular.isUndefined($rootScope.resourceSearch.hierarchical))) {
                        $scope.searchstr = $rootScope.resourceSearch.searchStr;
                        $scope.resourcetypeName = $rootScope.resourceSearch.resourcetypeName;
                        $scope.resourceName = $rootScope.resourceSearch.resourceName;
                        $scope.resourcetypeId = $rootScope.resourceSearch.resourcetypeId;
                        $scope.hierarchical = $rootScope.resourceSearch.hierarchical;
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


});
