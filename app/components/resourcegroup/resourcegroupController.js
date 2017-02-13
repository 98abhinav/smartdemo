define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, resourceGroupModule, smartTable, ngScrollbar) {

    resourceGroupModule.controller('resourcegroupController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$window', '$document', 'resourceGroupService', 'resourceGroupFactory', 'resourceGroupPageFactory', 'resourceGroupResourcesPageFactory', 'accessService', 'resourcegroupShareDataService', 'resourceTypePageFactory', '$timeout', 'ngProgress', 'toasterService', '$route',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $window, $document, resourceGroupService, resourceGroupFactory, resourceGroupPageFactory, resourceGroupResourcesPageFactory, accessService, resourcegroupShareDataService, resourceTypePageFactory, $timeout, ngProgress, toasterService, $route) {
                    ngProgress.start();

                    var message;
                    $rootScope.module = 'resourcegroups';
                    $scope.section = "Resource Group";
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    // $scope.resourcegroups;

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    // Reset the search rootScope
                    if (!angular.isUndefined($rootScope.resourceGroupSearch)) {
                        $rootScope.resourceGroupSearch = undefined;
                    }

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.resourcegroup.DELETE_CONFIRM + $scope.selectedResourceGroup.name + '?';
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteResourceGroup($scope.id, $scope.applicationId);
                    });

                    function deleteResourceGroup(id, applicationId) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {
                            'displayValue': $scope.selectedResourceGroup.name,
                            'mode': 'delete'
                        };

                        resourceGroupFactory.deleteResourceGroup(id, applicationId)
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

                    /* Get ResourceGroup's Resources */
//                    function getResourceGroupResources(groupId, applicationId) {
//
//                        $scope.resourceGroupResources = null;
//                        $scope.resourceLoading = true;
//                        // Custom object for error & success message
//                        var objCustom = {
//                            'displayValue': groupId,
//                            'mode': 'fetch'
//                        };
//
//                        resourceGroupFactory.getResourceGroupResources(groupId, applicationId)
//                                .then(function (response) {
//                                    //$scope.resourceGroupResources = response.data;
//                                    $scope.selectedResourceAttribute = response.data.resources;
//                                    $scope.selectedResourceGroupResourcesCount = response.data.resources.length;
//                                },
//                                        function (error) {
//                                            if (error.status == 404) {
//                                                $scope.error = 'No Records';
//                                                $scope.selectedResourceAttribute = null;
//                                                $scope.selectedResourceGroupResourcesCount = 0;
//                                            } else {
//                                                $scope.selectedResourceAttribute = null;
//                                                $scope.selectedResourceGroupResourcesCount = 0;
//                                                message = $rootScope.getErrorMessage(error, $scope.section, objCustom);
//                                                $scope.error = message;
//                                                toasterService.showToastr(message, 'error');
//                                            }
//                                        }
//                                ).finally(function () {
//                            toasterService.hideToastr(false);
//                            $scope.resourceLoading = false;
//                        });
//                    }

                    var applicationId = $routeParams.applicationID; // Application ID

                    /****** Ajax Smart table ****************/

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
                        $scope.itemsByPage = $rootScope.paginationStore.resourceGroup.paginationSize;
                        $scope.sortType = arrSort[$rootScope.paginationStore.resourceGroup.orderBy];
                    } else {
                        $scope.itemsByPage = $cookieStore.get('paginationStore').resourceGroup.paginationSize;
                        $scope.sortType = arrSort[$cookieStore.get('paginationStore').resourceGroup.orderBy];
                    }

                    
                    $scope.resourceGroupsResource = [];
                    
                    $scope.callServerResources = function (tableState,ctrl) {
                        $scope.error_resource ='';
                        $scope.isLoading_resource = true;                        
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        tableState.pagination.numberOfPages = 0;
                        if (number && $scope.selectedResourceGroup!==null) {

                        	number = $cookieStore.get('paginationStore').resourceGroupResources.paginationSize;
                            $scope.itemsByPage_resource = number;
                            tableState.pagination.number = number;
                            resourceGroupResourcesPageFactory.getPage(start, number, tableState, $scope.selectedResourceGroup.id, applicationId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.resourceGroupsResource = null;
                                        $scope.error_resource = 'No Records';
                                    } else {
                                        $scope.resourceGroupsResource = null;
                                        $scope.error_resource = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.resourceGroupsResource = result.data.resources;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                    //console.log('tableState.pagination',tableState.pagination);
                                }
                            }).finally(function () {
                                $scope.isLoading_resource = false;
                                
                                //tableState.pagination.pipe();
                            });
                        }
                    };




                    $scope.resourcegroups = [];

                    $scope.callServer = function (tableState) {
                        var typeId = (resourcegroupShareDataService.get().resourcetypeid != null) ? resourcegroupShareDataService.get().resourcetypeid : ''; // Resource Type ID
                        if (typeId == '') {
                            $scope.resourcegroups = null;
                            $scope.error = 'Please select a Resource Type';
                        } else {
                            $scope.isLoading = true;
                            var pagination = tableState.pagination;
                            var start = pagination.start || 0; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                            var number = pagination.number || false; // Number of entries showed per page. if pagination.number not found set false .
                            tableState.pagination.numberOfPages = 0;
                            if (number) {
                                if ($rootScope.previousRoute != $rootScope.currentRoute
                                        && !angular.isUndefined($rootScope.previousRoute)) {
                                    number = $cookieStore.get('paginationStore').resourceGroup.paginationSize;
                                    $scope.itemsByPage = number;
                                    $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                    $rootScope.previousRoute = undefined;
                                }
                                $scope.selectedRow = 0;
                                $rootScope.paginationStore.resourceGroup.paginationSize = parseInt(number);
                                $rootScope.paginationStore.resourceGroup.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                                $cookieStore.put('paginationStore', $rootScope.paginationStore);
                                resourceGroupPageFactory.getPage(start, number, tableState, applicationId, typeId, sortBy, sortHow).then(function (result) {

                                    if (result.error) {
                                        if (result.error.status == 404) {
                                            $scope.resourcegroups = null;
                                            $scope.error = 'No Records';
                                        } else {
                                            $scope.resourcegroups = null;
                                            $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                                        }
                                    } else {
                                        $scope.resourcegroups = result.data.resourceGroups;
                                        $scope.restResponse = result.data.resourceGroups;

                                        /* Show the first row details from response Start*/
                                        $scope.selectedResourceGroup = $scope.resourcegroups[0];
                                        //getResourceGroupResources($scope.selectedResourceGroup.id, $scope.applicationId);
                                        /* Show the first row details from response Ends*/
                                        
                                        $scope.callServerResources($rootScope.tableState);

                                        tableState.pagination.numberOfPages = result.numberOfPages; //set the number of pages so the pagination can update 
                                    }
                                }).finally(function () {
                                    $scope.isLoading = false;
                                });
                            }
                        }
                    };

                    /****** Ajax smart table ends ************/

                    /* Select First Record from the list and show details */
                    $scope.$on('FirstRecord', function (event) {
                        $scope.resourcegroup = {
                            id: $scope.resourcegroups[0].id,
                            name: $scope.resourcegroups[0].name,
                            //actions: $scope.resourcegroups[0].resources,
                            description: $scope.resourcegroups[0].description,
                            appID: $scope.applicationId
                        };
                        $scope.selectResourcegroup($scope.resourcegroup);
                    });

                    $scope.selectedResourceDetails = null;
                    $scope.selectedResourceAttribute = [];
                    $scope.selectedRow = 0;
                    $scope.selectedResourceGroup = null;
                    $scope.selectResourcegroup = function (resourceGroup, index) {
                    	$scope.resourceGroupsResource = null;
                        $scope.selectedRow = index;
                        //$scope.selectedResourceGroupActionsCount = 0;
                        //$scope.selectedResourceGroup = resourceGroup;                        
                        //getResourceGroupResources(resourceGroup.id, $scope.applicationId);
                        $scope.showInfo = true;
                        $scope.description.active = false; // for hide Description Read more
                    };


                    $scope.$watch('selectedRow', function () {
                        if ($scope.resourcegroups != null) {
                            $scope.selectedResourceGroupActionsCount = 0;
                            $scope.selectedResourceGroup = $scope.resourcegroups[$scope.selectedRow];
                            if (angular.isDefined($scope.selectedResourceGroup)) {
                                //getResourceGroupResources($scope.selectedResourceGroup.id, $scope.applicationId);
                                $scope.callServerResources($rootScope.tableState);
                            }
                            
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

                    $scope.resourcetypename = (resourcegroupShareDataService.get().resourcetypename != null) ? resourcegroupShareDataService.get().resourcetypename : '';
                    $scope.viewHierarchical = true;
                    $scope.selectResourcetype = function (value) {
                    	$scope.resourcegroups = null;
                        $scope.resourceGroupsResource = null;
//                        if(value.hierarchical){
//                            $scope.error = "This hierarchical resource type doesn't have resource group.";
//                            $scope.openDropdown = false;
//                            $scope.viewHierarchical = false;
//                            $scope.resourcetypename = value.name;
//                            $scope.resourcegroups = null;
//                            return;
//                        }
                        $scope.viewHierarchical = true;
                        $scope.openDropdown = false;
                        $scope.resourcetypename = value.name;
                        
                        var selectedResourcetype = {
                            "resourceparentid": value.parentID,
                            "resourcetypeid": value.id,
                            "resourcetypename": value.name,
                            "resourcetypehierarchical": value.hierarchical
                        };

//                        var tid = (resourceShareDataService.get().resourcetypeid!=null) ? resourceShareDataService.get().resourcetypeid : '';
//                var pid = (resourceShareDataService.get().resourceparentid!=null) ? resourceShareDataService.get().resourceparentid : 0;
//                var hierarchical = resourceShareDataService.get().resourcetypehierarchical;

                        resourcegroupShareDataService.set(selectedResourcetype);
                        //$route.reload();

                        // Regenerate the smart table with default tablestate
                        $scope.callServer($rootScope.tableState);
                        
                        var content_area = angular.element(document.getElementById('content_area'));
                        $document.scrollToElementAnimated(content_area, $rootScope.angularscroll.offset, $rootScope.angularscroll.duration);
                    };
                    /****Ajax Smart table dropdown for Resource type #end****/

                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolldropdown').slimScroll({
                            height: '280px'
                        });
                    });
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
                        $('#scrollresource').slimScroll({
                            height: '247px'
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

                    $scope.resourcesearchIcon = true;

                    $scope.startViewSearch = function () {
                        $scope.resourcesearchBox = true;
                        $scope.resourcefocusInput = true;

                    };

                    $scope.endViewSearch = function () {
                        $scope.resourcesearchBox = false;
                        $scope.search_resource = '';
                    };
                    ngProgress.complete();

                }
            ]);


    resourceGroupModule.controller('manageResourceGroupController', [
        '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$filter', 'resourceGroupService', 'resourceGroupFactory','resourceGroupResourcesPageFactory', 'accessService', 'ngProgress', 'toasterService', 'resourcePageFactory', 'resourcegroupShareDataService',
        function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $filter, resourceGroupService, resourceGroupFactory,resourceGroupResourcesPageFactory, accessService, ngProgress, toasterService, resourcePageFactory, resourcegroupShareDataService) {
            ngProgress.start();

            var message, redirectpath;

            /* Initialize */
            $rootScope.module = 'resourcegroups';
            $scope.section = "Resource Group";
            $scope.resourceGroups;
            $scope.resourceGroup;
            $scope.error;
            $scope.message;
            $scope.mode = $routeParams.mode; // add OR edit
            $scope.applicationId = $routeParams.applicationID; // application ID
            $scope.resourceGroupId = $routeParams.resourceGroupID; // resourceGroup ID            
            $scope.resourceGrouptargetList = null;
            $scope.treeNav = (resourcegroupShareDataService.get().treeNav != null) ? resourcegroupShareDataService.get().treeNav : [];
            $scope.resourcetypename = (resourcegroupShareDataService.get().resourcetypename != null) ? resourcegroupShareDataService.get().resourcetypename : '';
            $scope.typeId = (resourcegroupShareDataService.get().resourcetypeid != null) ? resourcegroupShareDataService.get().resourcetypeid : ''; // Resource Type ID
            $scope.resourcetypehierarchical = (resourcegroupShareDataService.get().resourcetypehierarchical != null) ? resourcegroupShareDataService.get().resourcetypehierarchical : '';
            if ((angular.equals({}, resourcegroupShareDataService.get()))) {
                $location.path("/" + $scope.applicationId + '/resourcegroups');
            }

            $scope.dispmsg = "No Record Selected.";
            var applicationId = $routeParams.applicationID; // Application ID
            var typeId = $scope.typeId;
            $scope.sourceResourcegroupsLength = 0;
            $scope.targetResourcegroupsLength = 0;
            //resourcegroupShareDataService.get().resourceparentid=0;

            /* Access Check */
            accessService.checkAccess($rootScope.module, $scope.section);
            
            
            /* ## Manage ResourceGroup Starts ## */

            /*  Get ResourceGroup by ID */
            function getResourceGroup(id, applicationId) {
                // Custom object for error & success message
                var objCustom = {
                    'displayValue': id,
                    'mode': 'fetch'
                };

                resourceGroupFactory.getResourceGroup(id, applicationId)
                        .then(function (response) {
                            toasterService.hideToastr();
                            $scope.resourceGroup = response.data;
                            $scope.resourceGroup.actions = response.data.actions;
                            $scope.resourceGroup.name = response.data.name;
                            $scope.resourceGroup.description = response.data.description;
                            $scope.typeName = response.data.typeID;

                        },
                                function (error) {
                                    if (error.status == 404) {
                                        $scope.error = 'No Records';
                                    } else {
                                        message = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                        $scope.error = message;
                                        toasterService.showToastr(message, 'error');
                                    }
                                }


                        ).finally(function () {
                    toasterService.hideToastr(false);
                });
            }


            /****** Ajax Smart table ****************/
            $scope.itemsByPage = $rootScope.itemsByPage;
            $scope.itemsByPage_resource = $cookieStore.get('paginationStore').resource.paginationSize;
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;
            var sortBy = 'name';
            var sortHow = 'asc';
            var global = false;
            var arrSort = {
                'asc': 'true',
                'desc': 'reverse'
            };
            $scope.sortType = arrSort[sortHow];
            $scope.sortType_resource = arrSort[$cookieStore.get('paginationStore').resource.orderBy];
            $scope.sourceResourcegroups = [];
            $scope.targetResourcegroups = [];
            
            $scope.callServer = function (tableState, ctrl) {
                $scope.isLoading = true;


                var typeId = (resourcegroupShareDataService.get().resourcetypeid != null) ? resourcegroupShareDataService.get().resourcetypeid : ''; // Resource Type ID             
                var pid = (resourcegroupShareDataService.get().resourceparentid != null) ? resourcegroupShareDataService.get().resourceparentid : 0;
                var hierarchical = (resourcegroupShareDataService.get().resourcetypehierarchical != null) ? resourcegroupShareDataService.get().resourcetypehierarchical : '';
                var pagination = tableState.pagination;
                $scope.resourcehierarchy = hierarchical ? 'Hierarchial Resources' : 'Non-Hierarchial Resources';
                var start = pagination.start || 0; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || false; // Number of entries showed per page. if pagination.number not found set false .
                if (number) {
                    if ($rootScope.previousRoute != $rootScope.currentRoute
                            && !angular.isUndefined($rootScope.previousRoute)) {
                        number = $cookieStore.get('paginationStore').resource.paginationSize;
                        $scope.itemsByPage = number;
                        $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                        $rootScope.previousRoute = undefined;
                    }
                    $rootScope.paginationStore.resource.paginationSize = parseInt(number);
                    $rootScope.paginationStore.resource.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                    $cookieStore.put('paginationStore', $rootScope.paginationStore);
                    resourcePageFactory.getPage(start, number, tableState, applicationId, typeId, pid, hierarchical, global, sortBy, sortHow).then(function (result) {
                        //resourcePageFactory.getPage(start, number, tableState, applicationId, typeId, sortBy, sortHow).then(function (result) {
                        $scope.selectedSourceItems = [];

                        if (result.error) {
                            if (result.error.status == 404) {
                                $scope.sourceResourcegroups = null;
                                $scope.error = 'No Records';
                            } else {
                                $scope.sourceResourcegroups = null;
                                $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                            }
                        } else {
                            $scope.sourceResourcegroups = [];
                            angular.forEach(result.data.resources, function (item) {
                                if ($scope.targetResourcegroups && !angular.isUndefined($filter('filter')($scope.targetResourcegroups, {id: item.id})[0])) {
                                    item['mark'] = 1;
                                }
                                $scope.sourceResourcegroups.push(item);
                            })


                            //$scope.sourceResourcegroups = result.data.resourceGroups;
                            tableState.pagination.numberOfPages = result.numberOfPages; //set the number of pages so the pagination can update 

                        }
                    }).finally(function () {
                        $scope.isLoading = false;
                        //toasterService.hideToastr(false);
                        //ctrl.pipe();

                    });
                }

            };

            // Get Assigned Resources of the Resource group
            $scope.callServerResources = function (tableState) {
                $scope.error_resource ='';
                $scope.isLoading_resource = true;                        
                var pagination = tableState.pagination;
                var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                //console.log(number);
                tableState.pagination.numberOfPages = 0;
                if (number) {

                    resourceGroupResourcesPageFactory.getPage(start, number, tableState, $scope.resourceGroupId, $scope.applicationId, sortBy, sortHow).then(function (result) {
                        if (result.error) {
                            if (result.error.status == 404) {
                                //$scope.targetResourcegroups = null;
                                $scope.error_resource = 'No Records';
                            } else {
                                //$scope.targetResourcegroups = null;
                                $scope.error_resource = $rootScope.getErrorMessage(result.error, $scope.section);
                            }
                        } else {
                            $scope.targetResourcegroups = result.data.resources;
                            tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                           
                        }
                    }).finally(function () {
                        $scope.isLoading_resource = false;
                        //tableState.pagination.pipe();
                    });
                }
            };
            
            /* Access Check */
            accessService.checkAccess($rootScope.module, $scope.section);
            if ($scope.mode == 'edit') {
                getResourceGroup($scope.resourceGroupId, $scope.applicationId);
            }
            if ($scope.mode == 'assign') {
                getResourceGroup($scope.resourceGroupId, $scope.applicationId);
                //getResourceGroupResources($scope.resourceGroupId, $scope.applicationId);
                //$scope.callServerResources($rootScope.tableState);
            }

            $scope.submitData = function (resourceGroup, mode, isValid) {
                if (!isValid) {
                    $(document).scrollTop(0);
                    return;
                }
                var resourceGroupData = {
                    name: resourceGroup.name,
                    description: resourceGroup.description,
                    typeID: typeId,
                    //parentID: 0,
                    appID: $scope.applicationId
                };

                // Add Application
                if (mode == 'add') {
                    $scope.insertResourceGroup(resourceGroupData);
                }

                // Edit Application
                if (mode == 'edit') {
                    $scope.updateResourceGroup($scope.resourceGroupId, resourceGroupData);
                }
                
                // Assign Resources
                if (mode == 'assign') {
                	var resourceGroupResourcesData = {
                        aid: $scope.applicationId,
                        name: resourceGroup.name
                    };
                    $scope.updateResourceGroupResources($scope.resourceGroupId, resourceGroupResourcesData);
                }
            }
            
            
            // Get Childs of Hierarchial resources
            $scope.getChilds = function (value) {
                $scope.selectedSourceItems = [];
                $scope.sourceResourcegroups = null;
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

                var hierarchical = (resourcegroupShareDataService.get().resourcetypehierarchical != null) ? resourcegroupShareDataService.get().resourcetypehierarchical : true;
                var typeID = (resourcegroupShareDataService.get().resourcetypeid != null) ? resourcegroupShareDataService.get().resourcetypeid : '';
                var typeName = (resourcegroupShareDataService.get().resourcetypename != null) ? resourcegroupShareDataService.get().resourcetypename : '';
                var resourceData = {
                    "resourceparentid": value.id,
                    "resourcetypeid": typeID,
                    "resourcetypename": typeName,
                    "resourcetypehierarchical": hierarchical,
                    "treeNav": $scope.treeNav,
                };

                resourcegroupShareDataService.set(resourceData);
                //$route.reload();

                // Regenerate the smart table with default tablestate                
                $scope.callServer($rootScope.tableState);

            };


            /* Dual-ListBox */
            $scope.selectedSourceItems = [];
            $scope.selectedTargetItems = [];


            $scope.targetResourcegroups = [];

            $scope.addedResources = [];
            $scope.removedResources = [];

            $scope.selectedparent = false;
            $scope.selectSourceItem = function (item) {
                $scope.selectedResource = item;
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
//                var selectedparentcount = 0;
//                angular.forEach($scope.selectedSourceItems, function (item) {
//                    if (item.immediateChildrenCount > 0) {
//                         selectedparentcount++;
//                    }
//                });

                if ($scope.selectedSourceItems.length > 1) {
                    $scope.selectedparent = false;
                } else {
                    $scope.selectedparent = true;
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
                //delete item.mark;
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
            	/*if (!$scope.targetResourcegroups) {
                	$scope.targetResourcegroups = [];
                }*/
                angular.forEach(items, function (item) {
                    item['new'] = 1;
                    angular.element(document.getElementById(item.id)).addClass("mapped");
                    angular.element(document.getElementById(item.id)).removeClass("selectedActive");
                    $scope.selectedSourceItems = [];
                    $scope.targetResourcegroups.push(item);
                    $scope.showAddBtn = false;
                    $scope.showRemoveBtn = false;
                    
                    $scope.addedResources.push(item.id);
                });
                $scope.sourceResourcegroupsLength = $scope.sourceResourcegroups.length;
                $scope.targetResourcegroupsLength = $scope.targetResourcegroups.length;

            };

            $scope.removeItem = function (items) {

                angular.forEach(items, function (item) {
                    var searchArray = {};
                    searchArray['property'] = 'id';
                    searchArray['value'] = item.id;
                    findAndRemove($scope.targetResourcegroups, searchArray);

                    $scope.selectedSourceItems = [];
                    angular.element(document.getElementById(item.id)).removeClass("mapped");
                    $scope.showAddBtn = false;
                    $scope.showRemoveBtn = false;
                    
                    $scope.removedResources.push(item.id);
                });
                $scope.sourceResourcegroupsLength = $scope.sourceResourcegroups.length;
                $scope.targetResourcegroupsLength = $scope.targetResourcegroups.length;
            };

            $scope.resetItem = function () {

//                angular.forEach($scope.targetResourcegroups, function (item) {
//                    if (item.new === 1) {
//                        var searchArray = {};
//                        searchArray['property'] = 'id';
//                        searchArray['value'] = item.id;
//                        findAndRemove($scope.targetResourcegroups, searchArray);
//                        angular.element(document.getElementById(item.id)).removeClass("mapped");
//                    }
//
//                })

                var resetItem = [];
                angular.forEach($scope.targetResourcegroups, function (resourcegroup) {

                    if (resourcegroup.new != 1) {
                        resetItem.push(resourcegroup);
                    } else {
                        angular.element(document.getElementById(resourcegroup.id)).removeClass("mapped");
                    }

                })
                $scope.targetResourcegroups = resetItem;

                angular.forEach($scope.selectedSourceItems, function (item) {
                    angular.element(document.getElementById(item.id)).removeClass("selectedActive");
                });
                $scope.selectedSourceItems = [];
            }

            /* Insert New ResourceGroup */
            $scope.insertResourceGroup = function (resourceGroup) {
                var resourceGroupId = [];
                angular.forEach($scope.targetResourcegroups, function (item) {
                    resourceGroupId.push(item.id)
                })

                resourceGroup['resources'] = resourceGroupId;

                message = $rootScope.translation.toaster.SAVING;
                toasterService.showToastr(message, 'loader');


                // Custom object for error & success message
                var objCustom = {
                    'displayValue': resourceGroup.name,
                    'mode': 'insert'
                };

                resourceGroupFactory.insertResourceGroup(resourceGroup)
                        .then(function (response) {
                            toasterService.hideToastr();

                            message = $rootScope.getSuccessMessage($scope.section, objCustom);
                            redirectpath = resourceGroup.appID + '/resourcegroups';
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

            /* Update resourceGroup */
            $scope.updateResourceGroup = function (id, resourceGroup) {

                /*
                 * Resources of resource group will be managed separately now.
                 * 
                 * var resourceGroupId = [];
                angular.forEach($scope.targetResourcegroups, function (item) {
                    resourceGroupId.push(item.id)
                })
                resourceGroup['resources'] = resourceGroupId;*/
                
                var tID = resourceGroup['typeID'];
                resourceGroup['tID'] = tID;
                delete resourceGroup.typeID;

                message = $rootScope.translation.toaster.SAVING;
                toasterService.showToastr(message, 'loader');
                // Custom object for error & success message
                var objCustom = {
                    'displayValue': resourceGroup.name,
                    'mode': 'update'
                };

                resourceGroupFactory.updateResourceGroup(id, resourceGroup)
                        .then(function () {
	                            toasterService.hideToastr();
	
	                            message = $rootScope.getSuccessMessage($scope.section, objCustom);
	                            redirectpath = resourceGroup.appID + '/resourcegroups';
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
            
            /* Assign resources to Group */
            $scope.updateResourceGroupResources = function (id, resourceGroupResources) {

                /*var resourceGroupId = [];
                angular.forEach($scope.targetResourcegroups, function (item) {
                    resourceGroupId.push(item.id)
                })*/
                resourceGroupResources['addedResources'] = $scope.addedResources;
                resourceGroupResources['removedResources'] = $scope.removedResources;
                
                message = $rootScope.translation.toaster.SAVING;
                toasterService.showToastr(message, 'loader');
                // Custom object for error & success message
                var objCustom = {
                    'displayValue': resourceGroupResources.name,
                    'mode': 'update'
                };

                delete resourceGroupResources.name;
                console.log('resourceGroupResources',resourceGroupResources);
                resourceGroupFactory.updateResourceGroupResources(id, resourceGroupResources)
                        .then(function () {
	                            toasterService.hideToastr();
	
	                            message = $rootScope.getSuccessMessage($scope.section, objCustom);
	                            redirectpath = resourceGroupResources.aid + '/resourcegroups';
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
            /* ## Manage ResourceGroup Ends ## */

            $scope.redirectList = function () {
                if (!angular.isUndefined($rootScope.resourceGroupSearch)) {
                    $location.path("/" + $scope.applicationId + '/resourcegroups/search');
                } else {
                    $location.path("/" + $scope.applicationId + '/resourcegroups');
                }
            };


            /******Scroll bar setting start*************/
            $scope.$applyAsync(function () {
                $('#scrolltable').slimScroll({
                    height: '280px'
                            //color : $rootScope.listscrolltable.color                            
                });
            });
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
            $scope.$applyAsync(function () {
                $('#fullassignscroll').slimScroll({
                    height: '410px'
                });
            });


            /******Scroll bar setting end*************/
            $scope.usersourcesearchIcon = true;
            $scope.usertargetsearchIcon = true;
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
                    case 'usertarget':
                        $scope.usertargetsearchBox = true;
                        $scope.usertargetfocusInput = true;
                        $scope.usertargetsearchIcon = false;
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
                    case 'usertarget':
                        $scope.usertargetsearchBox = false;
                        $scope.usertargetsearchIcon = true;
                        break;
                }
            };

            ngProgress.complete();

        }
    ]);

    resourceGroupModule.controller('searchResourceGroupController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$window', '$cookieStore', 'resourceTypePageFactory', 'resourcePageFactory', 'resourceGroupFactory', 'accessService', 'ngProgress', 'resourcegroupShareDataService',
                function ($scope, $rootScope, $routeParams, $cookies, $q, $window, $cookieStore, resourceTypePageFactory, resourcePageFactory, resourceGroupFactory, accessService, ngProgress, resourcegroupShareDataService)
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

                        var section = 'Resource Group Search Results';
                        var resq = $scope.resourceName;
                        var resTypeq = $scope.resourcetypeName;
                        var tid = $scope.resourcetypeId; //ResourceType
                        var pid = angular.isUndefined($scope.parentID) ? 0 : $scope.parentID; //Parent
                        var hierarchical = $scope.hierarchical;
                        var global = true;

                        var resourceGroupData = {
                            "resourceparentid": pid,
                            "resourcetypeid": $scope.resourcetypeId,
                            "resourcetypename": $scope.resourcetypeName,
                            "resourcetypehierarchical": hierarchical
                        };



                        resourcegroupShareDataService.set(resourceGroupData);


                        $scope.searchResult = null;
                        $scope.searchResultLength = 0;
                        $scope.errorResult = '';
                        $scope.isLoading = true;



                        if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                            $scope.itemsByPage = $rootScope.paginationStore.resourceGroup.paginationSize;
                        } else {
                            $scope.itemsByPage = $cookieStore.get('paginationStore').resourceGroup.paginationSize;
                        }



                        if (number) {
                            $rootScope.resourceGroupSearch = {
                                'resourcetypeName': resTypeq,
                                'resourceName': resq,
                                'searchStr': $scope.searchstr,
                                'resourcetypeId': $scope.resourcetypeId,
                                'hierarchical': pid
                            };

                            var resultPromise = resourceGroupFactory.getResourceGroupSearch($scope.searchstr, $scope.applicationId, tid, sortBy, sortHow);
                            resultPromise.then(
                                    function (result) {
                                        $scope.searchResult = result.data.resourceGroups;
                                        $scope.searchResultLength = $scope.searchResult.length;
                                        $scope.errorResult = '';

                                        if ($scope.resourceName != '') {
                                            angular.forEach(angular.fromJson(result.data.resourceGroups), function (value, key) {
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
                                    number = $cookieStore.get('paginationStore').resourceGroup.paginationSize;
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
                        $rootScope.paginationStore.resourceGroup.paginationSize = parseInt($scope.itemsByPage);
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
                    if (!angular.isUndefined($rootScope.resourceGroupSearch) &&
                            (!angular.isUndefined($rootScope.resourceGroupSearch.resourcetypeName)
                                    || !angular.isUndefined($rootScope.resourceGroupSearch.resourceName)
                                    || !angular.isUndefined($rootScope.resourceGroupSearch.searchStr)
                                    || !angular.isUndefined($rootScope.resourceGroupSearch.resourcetypeId)
                                    || !angular.isUndefined($rootScope.resourceGroupSearch.hierarchical))) {
                        $scope.searchstr = $rootScope.resourceGroupSearch.searchStr;
                        $scope.resourcetypeName = $rootScope.resourceGroupSearch.resourcetypeName;
                        $scope.resourceName = $rootScope.resourceGroupSearch.resourceName;
                        $scope.resourcetypeId = $rootScope.resourceGroupSearch.resourcetypeId;
                        $scope.hierarchical = $rootScope.resourceGroupSearch.hierarchical;
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
