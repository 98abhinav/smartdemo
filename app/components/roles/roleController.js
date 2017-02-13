define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, roleModule, smartTable, ngScrollbar)
{

    roleModule.controller('roleController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$timeout', '$filter', 'roleFactory', 'rolePageFactory', 'sourceFactory', 'roleUGPageFactory', 'accessService', 'ngProgress', 'toasterService', '$route', 'myCache',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $timeout, $filter, roleFactory, rolePageFactory, sourceFactory, roleUGPageFactory, accessService, ngProgress, toasterService, $route, myCache)
                {

                    ngProgress.start();

                    var message;
                    $rootScope.module = 'roles';
                    $scope.section = 'Role';
                    $scope.applicationId = $routeParams.applicationID; // application ID

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    // Reset the search rootScope
                    if (!angular.isUndefined($rootScope.roleAdvanceSearch)) {
                        $rootScope.roleAdvanceSearch = undefined;
                    }

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.role.DELETE_CONFIRM + $scope.selectedRole.name + '?';
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteRole($scope.id, $scope.applicationId);
                    });

                    function deleteRole(id, applicationId) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.selectedRole.name, 'mode': 'delete'};

                        roleFactory.deleteRole(id, applicationId)
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
                        $scope.roledetails = {
                            id: $scope.roles[0].id,
                            name: $scope.roles[0].name,
                            description: $scope.roles[0].description,
                            inheritsFrom: $scope.roles[0].inheritsFrom,
                            users: $scope.roles[0].users,
                            groups: $scope.roles[0].groups
                        };
                        $scope.selectrole($scope.roledetails);
                    });


                    $scope.selectedRoleUserList = null;
                    $scope.selectedRoleUser = [];
                    $scope.selectedRoleGroupList = null;
                    $scope.selectedRoleGroup = [];
                    $scope.selectedRow = 0;
                    $scope.selectrole = function (roledetails, index) {
                        $scope.selectedRow = index;
//                        $scope.selectedRoleGroupCount = 0;
//                        $scope.selectedRoleUserCount = 0;
//                        $scope.selectedRole = roledetails;
//                        $scope.selectedRoleUser = roledetails.users;
//                        $scope.selectedRoleGroup = roledetails.groups;
//                        $scope.selectedRoleGroupCount = roledetails.groups.length;
//                        $scope.selectedRoleUserCount = roledetails.users.length;
                        $scope.showInfo = true;

                        $scope.description.active = false; // for hide Description Read more                       

                    };

                    $scope.$watch('selectedRow', function () {
                    	$scope.roleUsers = null;
                    	$scope.roleGroups = null;
                        if ($scope.roles.length != 0) {
                            /*$scope.selectedRoleGroupCount = 0;
                            $scope.selectedRoleUserCount = 0;*/
                            $scope.selectedRole = $scope.roles[$scope.selectedRow];
                            /*$scope.selectedRoleUser = $scope.selectedRole.users;
                            $scope.selectedRoleGroup = $scope.selectedRole.groups;
                            $scope.selectedRoleGroupCount = $scope.selectedRole.groups.length;
                            $scope.selectedRoleUserCount = $scope.selectedRole.users.length;*/
                            $scope.callServerUsers($rootScope.tableState);
                            $scope.callServerGroups($rootScope.tableState);
                        }
                    });
                    $scope.tdHeight = 10;
                    $scope.setItemsByPage = function () {
                        $('#itemsByPage').blur();
                        $scope.itemsByPage = document.getElementById('itemsByPage').value;
                        $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                    };


                    $scope.getSource = function (sourceid) {
                        if (!angular.isUndefined(localStorage['sources'])) {
                            return $filter('filter')(JSON.parse(localStorage['sources']), {id: sourceid})[0].name;
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
                    //$scope.sortType = arrSort[sortHow];
                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.itemsByPage = $rootScope.paginationStore.role.paginationSize;
                        $scope.sortType = arrSort[$rootScope.paginationStore.role.orderBy];
                    } else {
                        $scope.itemsByPage = $cookieStore.get('paginationStore').role.paginationSize;
                        $scope.sortType = arrSort[$cookieStore.get('paginationStore').role.orderBy];
                    }

                    $scope.roles = [];

                    $scope.callServer = function (tableState) {
                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').role.paginationSize;
                                $scope.itemsByPage = number;
                                $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }
                            $scope.selectedRow = 0;
                            $rootScope.paginationStore.role.paginationSize = parseInt(number);
                            $rootScope.paginationStore.role.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
                            rolePageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.roles = null;
                                        $scope.error = 'No Records';
                                    } else {
                                        $scope.roles = null;
                                        $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.roles = result.data.roles;
                                    $scope.restResponse = result.data.roles;
                                    /* Show the first row details from response Start*/
                                    /*$scope.selectedRoleGroupCount = 0;
                                    $scope.selectedRoleUserCount = 0;*/
                                    $scope.selectedRole = $scope.roles[0];
                                    /*$scope.selectedRoleUser = $scope.selectedRole.users;
                                    $scope.selectedRoleGroup = $scope.selectedRole.groups;
                                    $scope.selectedRoleGroupCount = $scope.selectedRole.groups.length;
                                    $scope.selectedRoleUserCount = $scope.selectedRole.users.length;*/
                                    /* Show the first row details from response Ends*/
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update
                                    $scope.callServerUsers($rootScope.tableState);
                                    $scope.callServerGroups($rootScope.tableState);
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                                //toasterService.hideToastr();
                            });
                        }
                    };

                    // Get Users/Groups of the Role
                    $scope.roleUsers = [];
                    $scope.roleGroups = [];
                    $scope.itemsByPage_members = $rootScope.paginationStore.roleMembers.paginationSize;
                    
                    $scope.callServerUsers = function (tableState) {
                    	if (!$scope.selectedRole) {
                            return;
                        }
                        $scope.error_users ='';
                        $scope.isLoading_users = true;
                        tableState.pagination.numberOfPages = 0;
                        tableState.pagination.number = $scope.itemsByPage_members;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        //console.log(number);
                        
                        if (number) {
                        	
                            roleUGPageFactory.getPage(start, number, tableState, $scope.selectedRole.id, $scope.applicationId, sortBy, sortHow, 'users').then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.roleUsers = null;
                                        $scope.error_users = 'No Records';
                                    } else {
                                        $scope.roleUsers = null;
                                        $scope.error_users = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.roleUsers = result.data.users;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                    //console.log('tableState.pagination',tableState.pagination);
                                }
                            }).finally(function () {
                                $scope.isLoading_users = false;
                            });
                        }
                    };
                    
                    $scope.callServerGroups = function (tableState) {
                    	if (!$scope.selectedRole) {
                            return;
                        }
                        $scope.error_groups ='';
                        $scope.isLoading_groups = true;
                        tableState.pagination.numberOfPages = 0;
                        tableState.pagination.number = $scope.itemsByPage_members;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        //console.log(number);
                        if (number) {
                        	
                            roleUGPageFactory.getPage(start, number, tableState, $scope.selectedRole.id, $scope.applicationId, sortBy, sortHow, 'groups').then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.roleGroups = null;
                                        $scope.error_groups = 'No Records';
                                    } else {
                                        $scope.roleGroups = null;
                                        $scope.error_groups = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.roleGroups = result.data.groups;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                    //console.log('tableState.pagination',tableState.pagination);
                                }
                            }).finally(function () {
                                $scope.isLoading_groups = false;
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
                            height: '247px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#scrollgroup').slimScroll({
                            height: '247px'
                        });
                    });


                    $scope.usersourcesearchIcon = true;
                    $scope.groupsourcesearchIcon = true;
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
                        }
                    };
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
    roleModule.controller('manageRoleController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'roleFactory', 'accessService', 'ngProgress', 'toasterService',
                function ($scope, $rootScope, $cookies, $routeParams, $location, roleFactory, accessService, ngProgress, toasterService)
                {
                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    $rootScope.module = 'roles';
                    $scope.section = 'Role';
                    $scope.roles;
                    $scope.role;
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.roleId = $routeParams.roleID; // Role ID

                    /* Access Check */
                    accessService.checkAccess($rootScope.module, $scope.section);

                    if ($scope.mode == 'edit') {
                        getRole($scope.roleId, $scope.applicationId);
                    }

                    $scope.submitData = function (role, mode, isValid)
                    {
                        if (!isValid) {
                            $(document).scrollTop(0);
                            return;
                        }
                        var roleData = {
                            name: role.name,
                            description: role.description,
                            aid: $scope.applicationId
                        };

                        // Add Role
                        if (mode == 'add') {
                            $scope.insertRole(roleData);
                        }

                        // Edit Application
                        if (mode == 'edit') {
                            $scope.updateRole(role.id, roleData);
                        }
                    }

                    /* ## Manage Role Starts ## */

                    /*  Get Role by ID */
                    function getRole(id, applicationId) {

                        roleFactory.getRole(id, applicationId)
                                .then(function (response) {
                                    $scope.role = response.data;
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            message = $rootScope.getErrorMessage(error, $scope.section);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                        });
                    }

                    /* Insert New Role */
                    $scope.insertRole = function (roles) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': roles.name, 'mode': 'insert'};

                        roleFactory.insertRole(roles)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = roles.aid + '/roles';
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

                    /* Update Role */
                    $scope.updateRole = function (id, roles) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': roles.name, 'mode': 'update'};

                        roleFactory.updateRole(id, roles)
                                .then(function () {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = roles.aid + '/roles';
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

                    /* ## Manage Roles Ends ## */

                    $scope.redirectList = function () {                        
                            $location.path("/" + $scope.applicationId + '/roles');
                    }

                    ngProgress.complete();
                }
            ]);


    roleModule.controller('rolehierarchyController',
            [
                '$scope', '$rootScope', '$cookies', '$location', 'ngProgress',
                function ($scope, $rootScope, $cookies, $location, ngProgress)
                {
                    ngProgress.start();
                    //$scope.module = $location.url();
                    $rootScope.module = 'hierarchy';

                    $scope.roles = ['Role 1', 'Role 2', 'Role 3', 'Role 4', 'Role 5', 'Role 6', 'Role 7', 'Role 8', 'Role 9', 'Role 10', 'Role 11', 'Role 12', 'Role 13', 'Role 14', 'Role 15', 'Role 16', 'Role 17', 'Role 18', 'Role 19', 'Role 20'];
                    $scope.roleName = '';

                    $scope.defaultRole =
                            {
                                name: 'Resource Hierarchy 2',
                                category: 'rolecategory1',
                                desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer'
                            };

                    $scope.treeOptions = {
                        nodeChildren: "children",
                        dirSelectable: true
                    };
                    $scope.treedata =
                            [
                                {"name": "Role 1", "id": "1", "children": [
                                        {"name": "Role 6", "id": "6", "children": []},
                                        {"name": "Role 7", "id": "7", "children": [
                                                {"name": "Role 9", "id": "9", "children": [
                                                        {"name": "Role 10", "id": "10", "children": []},
                                                        {"name": "Role 11", "id": "11", "children": []}
                                                    ]}
                                            ]}
                                    ]},
                                {"name": "Role 2", "id": "2", "children": [
                                        {"name": "Role 12", "id": "12", "children": [
                                                {"name": "Role 13", "id": "13", "children": [
                                                        {"name": "Role 14", "id": "14", "children": []}
                                                    ]}
                                            ]}
                                    ]},
                                {"name": "Role 3", "id": "3", "children": [
                                        {"name": "Role 15", "id": "15", "children": []},
                                        {"name": "Role 16", "id": "16", "children": [
                                                {"name": "Role 17", "id": "17", "children": [
                                                        {"name": "Role 18", "id": "18", "children": []}
                                                    ]}
                                            ]}
                                    ]},
                                {"name": "Role 4", "id": "4", "children": []},
                                {"name": "Role 5", "id": "5", "children": []},
                            ];
                    $scope.showSelected = function (sel) {
                        $scope.selectedNode = sel;
                        $scope.showInfo = true;
                    };

                    /*$scope.expandedNodes = [];
                     $scope.expandAll = function() {
                     angular.forEach($scope.treedata, function(value, key) {
                     $scope.expandedNodes.push(value);
                     });
                     };
                     $scope.collapseAll = function() {
                     $scope.expandedNodes = [];
                     };*/

                    $scope.remove = function (scope) {
                        scope.remove();
                    };

                    $scope.toggle = function (scope) {
                        scope.toggle();
                    };

                    var getRootNodesScope = function () {
                        return angular.element(document.getElementById("tree-root")).scope();
                    };

                    $scope.collapseAll = function () {
                        var scope = getRootNodesScope();
                        scope.collapseAll();
                    };

                    $scope.expandAll = function () {
                        var scope = getRootNodesScope();
                        scope.expandAll();
                    };

                    ngProgress.complete();
                }
            ]);

    roleModule.controller('searchRoleController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$window', '$cookieStore', 'sourcePageFactory', 'accessService', 'ngProgress', 'usersFactory', 'groupsFactory',
                function ($scope, $rootScope, $routeParams, $cookies, $q, $window, $cookieStore, sourcePageFactory, accessService, ngProgress, usersFactory, groupsFactory)
                {
                    ngProgress.start();

                    /* Initialize */
                    $rootScope.module = 'roles';
                    $scope.section = 'Role';
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

                    $scope.resources;
                    $scope.resourcesLength;
                    $scope.errorResource;


                    var sortBy = 'SOURCE_NAME';
                    var sortHow = 'desc';
                    var arrSort = {
                        'asc': 'reverse',
                        'desc': 'true'
                    };

                    $scope.sortType = arrSort[sortHow];
                    $scope.sources = null;
                    $scope.sourceLength = 0;
                    $scope.callServer = function callServer(tableState) {
                        $scope.isSourceLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || $scope.itemsByPage;  // Number of entries showed per page. if pagination.number not found set false .

                        if (!angular.isUndefined($scope.search) && $scope.search !== '') {
                            sourcePageFactory.getPage(start, number, tableState, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.sources = null;
                                        $scope.error = 'No Records';
                                    } else {
                                        $scope.sources = null;
                                        $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                                    }
                                } else {
                                    $scope.sources = [];
                                    $scope.sources = result.data.sources;
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                    $scope.sourceLength = $scope.sources.length;
                                    $scope.error = '';
                                }
                            }).finally(function () {
                                $scope.isSourceLoading = false;
                            });
                        } else {
                            $scope.isSourceLoading = false;
                            $scope.sources = null;
                            $scope.sourceLength = 0;
                            $scope.error = '';
                        }
                    };

                    /****** Ajax smart table ends ************/

                    $scope.searchResult;
                    $scope.searchResultLength;
                    $scope.errorResult;

                    $scope.callServerResult = function () {

                        var section = 'Role Membership Search Results';

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
                            $rootScope.roleAdvanceSearch = {
                                'sourceName': $scope.sourceName,
                                'sourceId': $scope.sourceId,
                                'searchHow': $scope.searchHow,
                                'searchStr': $scope.searchstr

                            };
                            
                            var resultPromise = null;
                            if ($scope.searchHow === 'User') {
                                resultPromise = usersFactory.getRoles($scope.searchstr, $scope.applicationId, $scope.sourceId);
                            } else {
                                resultPromise = groupsFactory.getRoles($scope.searchstr, $scope.applicationId, $scope.sourceId);
                            }
                            resultPromise.then(
                                    function (result) {
                                        $scope.searchResult = result.data.roles;
                                        $scope.searchResultLength = $scope.searchResult.length;
                                        $scope.errorResult = '';

                                        if ($scope.searchstr != '') {
                                            angular.forEach(angular.fromJson(result.data.roles), function (value, key) {
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
                                    number = $cookieStore.get('paginationStore').role.paginationSize;
                                    $scope.itemsByPage = number;
                                    $rootScope.previousRoute = undefined;
                                }
                                $scope.isLoading = false; 
                                if($scope.searchResultLength==0){
                                    $scope.errorResult = 'No Records';
                                }
                            });

                        }

                    }

                    /****** Ajax smart table ends ************/

                    /****** Load the user ******************/
                    $scope.users = [];
                    $scope.userLength = 0;
                    $scope.getUsers = function () {
                        var sortHow = 'asc';
                        var limit = 100;
                        $scope.isUserLoading = true;
                        usersFactory.getUsers($scope.searchUser, $scope.searchType, $scope.sourceId, limit, $scope.searchType, sortHow)
                                .then(function (response) {
                                    $scope.users = response.data.users;
                                    $scope.userLength = $scope.users.length;
                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.users = null;
                                                $scope.usererror = 'No Records Found';
                                            } else {
                                                $scope.users = null;
                                                $scope.usererror = $rootScope.getErrorMessage(error, $scope.section);
                                                //$scope.error = 'Unable to load data: ' + error.status + ' ' + error.statusText;
                                            }
                                        }
                                ).finally(function () {
                            $scope.isUserLoading = false;
                        });
                    };

                    /****** Load the user ******************/
                    $scope.groups = [];
                    $scope.groupLength = 0;
                    $scope.getGroups = function () {
                        var sortHow = 'asc';
                        var limit = 100;
                        $scope.isGroupLoading = true;
                        groupsFactory.getGroups($scope.searchGroup, $scope.searchType, $scope.sourceId, limit, $scope.searchType, sortHow)
                                .then(function (response) {
                                    $scope.groups = response.data.groups;
                                    $scope.groupLength = $scope.groups.length;
                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.groups = null;
                                                $scope.grouperror = 'No Records Found';
                                            } else {
                                                $scope.groups = null;
                                                $scope.grouperror = $rootScope.getErrorMessage(error, $scope.section);
                                                //$scope.error = 'Unable to load data: ' + error.status + ' ' + error.statusText;
                                            }
                                        }
                                ).finally(function () {
                            $scope.isGroupLoading = false;
                        });
                    };



                    $scope.setItemsByPage = function () {
                        $scope.itemsByPage = document.getElementById('itemsByPage').value;
                        $rootScope.paginationStore.role.paginationSize = parseInt($scope.itemsByPage);
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

                    $scope.selectSource = null;
                    $scope.selectSource = function (sources) {
                        $scope.selectSource = sources;
                        $scope.showRecords = false;
                        angular.element(document.getElementById('source-dropdown')).removeClass("open_div");
                        $scope.sourceName = sources.name;
                        $scope.displayAttributes = sources.userDisplayAttributes;
                        $scope.usersearchAttributes = sources.searchAttributes.userSearchDefaultAttr;
                        $scope.sourceId = sources.id;
                        $scope.openDropdown = false;
                        $scope.userSearchType = $scope.selectSource.searchAttributes.userNameIdentifier;
                        $scope.groupSearchType = $scope.selectSource.searchAttributes.groupNameIdentifier;
                        $scope.searchType = $scope.userSearchType;
                    };

                    $scope.searchHow = 'User';

                    $scope.setSearchHow = function (searchHow) {
                        $scope.searchstr = 'Name';
                        $scope.searchstr = '';
                        $scope.showTypeRecords = true;
                        $scope.searchHow = searchHow;
                        $scope.openDropdownSearchHow = false;
                        $scope.searchType = $scope.searchHow == 'User' ? $scope.userSearchType : $scope.groupSearchType;
                        angular.element(document.getElementById('criteria-dropdown')).removeClass("open_div");
                    }

                    $scope.showTypeRecords = false;
                    $scope.setName = function (name) {
                        $scope.searchstr = name;
                        angular.element(document.getElementById('name-dropdown')).removeClass("open_div");
                        $scope.showTypeRecords = false;
                    }

                    // Name Dropdown
                    $scope.opentoolbar = function (id) {
                        if (id === 'name-dropdown' && $scope.sourceName == null) {
                            return false;
                        }
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
                        $scope.showTypeRecords = true;
                        $scope.callServerResult();                       
                    }


//                    $rootScope.roleAdvanceSearch = {
//                        'sourceName': $scope.sourceName,
//                        'sourceId': $scope.sourceId,
//                        'searchHow': $scope.searchHow,
//                        'searchStr': $scope.searchstr
//
//                    };



                   
                    // Re-generate Search result using last searched criteria (if any)
                    if (!angular.isUndefined($rootScope.roleAdvanceSearch) &&
                            (!angular.isUndefined($rootScope.roleAdvanceSearch.sourceName)
                                    || !angular.isUndefined($rootScope.roleAdvanceSearch.sourceId)
                                    || !angular.isUndefined($rootScope.roleAdvanceSearch.searchStr) )) {
                                   

                        $scope.searchstr = $rootScope.roleAdvanceSearch.searchStr;
                        $scope.sourceName = $rootScope.roleAdvanceSearch.sourceName;
                        $scope.sourceId = $rootScope.roleAdvanceSearch.sourceId;
                        $scope.searchHow = $rootScope.roleAdvanceSearch.searchHow;
                        
                       
                        $scope.submitSearch();
                    }

                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#resultsscrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height,
                            width: '100%'
                        });
                        $('#scrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });
                        $('#userscrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });
                        $('#groupscrolltable').slimScroll({
                            height: '210px',
                            width: '100%'
                        });

                    });

                    /******Scroll bar setting end*************/
                    ngProgress.complete();
                }

            ]);


});
