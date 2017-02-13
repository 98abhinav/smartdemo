define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, policiesModule, smartTable, ngScrollbar)
{

    policiesModule.controller('managePoliciesController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', '$document', 'ngProgress', 'toasterService', 'rolePageFactory', 'functionPageFactory', 'resourceFactory', 'resourcePageFactory', 'resourceTypePageFactory', 'resourceTypeFactory', 'accessService', 'resourceShareDataService', 'rolePoliciesFactory', 'sourceFactory', 'sourcePageFactory', 'usersFactory', 'usersPageFactory', 'groupsFactory', 'groupsPageFactory', '$filter', '$window',
                function ($scope, $rootScope, $cookies, $routeParams, $location, $document, ngProgress, toasterService, rolePageFactory, functionPageFactory, resourceFactory, resourcePageFactory, resourceTypePageFactory, resourceTypeFactory, accessService, resourceShareDataService, rolePoliciesFactory, sourceFactory, sourcePageFactory, usersFactory, usersPageFactory, groupsFactory, groupsPageFactory, $filter, $window)
                {
                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    var policyType = $routeParams.policyType.substr(0, $routeParams.policyType.length - 1);
                    $rootScope.module = policyType + 'policies';
                    $scope.section = 'Policy';

                    $scope.selectedResourceActions = [];
                    
                    $scope.authzPolicy = {};
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.policyType = $routeParams.policyType; //Policy Type - user, group or role
                    $scope.policyId = $routeParams.policyid;
//                    $scope.selectedResourceActionRHS=null;


                    /* Access Check */
                    accessService.checkAccess($rootScope.module, $scope.section);

                    // Get stored values from shared data

                    if ($scope.mode == 'edit') {
                        getAuthzPolicy($scope.policyId, $scope.applicationId, $scope.policyType);
                        getSourceDetails();
                    }


                    /* ## Manage Role Starts ## */
                    $scope.policyResourceGroups = [];
                    $scope.policyResources = [];
                    //$scope.selectedPrincipals = [];
                    $scope.selectedRoles = [];
                    $scope.selectedPolicyRoles = [];
                    $scope.targetlistFull = {};
                    $scope.targetlistFull.users = [];
                    $scope.targetlistFull.groups = [];

                    $scope.targetlist = {'users': [],
                        'groups': []
                    };

                    function getSourceDetails() {

                        // Custom object for error & success message
                        //$scope.isLoading = true;
                        var objCustom = {'displayValue': "Source", 'mode': 'fetch'};
                        var searchText = ""; // Search criteria for users
                        var sortBy = 'SOURCE_NAME';
                        var sortHow = 'asc';
                        var offset = 0;
                        var limit = 1000;
                        sourceFactory.getSources(searchText, limit, offset, sortBy, sortHow)
                                .then(function (sourceResponse) {
                                    toasterService.hideToastr();
                                    $rootScope.getSources = sourceResponse.data;


                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            getDelegatedAdmin($routeParams.applicationID);
                        });
                    }
                    /*  Get Role by ID */
                    function getAuthzPolicy(id, applicationId, policyType) {
                        $scope.policyResources = [];
                        rolePoliciesFactory.getRolePolicy(id, applicationId, policyType)
                                .then(function (response) {
                                    $scope.authzPolicy = response.data;

                                    //Initialize Temp arrays for lists
                                    $scope.selectedPrincipals = angular.copy($scope.authzPolicy[$scope.policyType]);



                                    $scope.selectedResourceActions = angular.copy($scope.authzPolicy.resourceActions);



                                    for (var i = 0; i < $scope.authzPolicy.resourceActions.length; i++) {
                                        if ($scope.authzPolicy.resourceActions[i].resource.group == true) {
                                            var resourceGroup = angular.copy($scope.authzPolicy.resourceActions[i]);
                                            resourceGroup.resource.name = resourceGroup.resource.fqdn;
                                            //resourceGroup.resource.typeID = resourceGroup.resource.typeID;
                                            resourceGroup.resource.typeID = resourceGroup.resource.tid;

                                            //Required to allow sorting of resourceActions on UI.
                                            resourceGroup.name = resourceGroup.resource.name;
                                            $scope.policyResourceGroups.push(resourceGroup);
                                            $scope.policyResourceGroupCount++;
                                        } else {
                                            var resource = angular.copy($scope.authzPolicy.resourceActions[i]);

                                            //Required due to API nomenclature differences
                                            resource.resource.typeID = resource.resource.tid;
                                            //Required to allow sorting of resourceActions on UI.
                                            resource.name = resource.resource.fqdn;

                                            $scope.policyResources.push(angular.copy(resource));
                                            $scope.policyResourceCount++;
                                        }
                                    }

                                    if (policyType == 'roles') {
                                        //$scope.selectedRoles = angular.copy($scope.authzPolicy[$scope.policyType]);
                                        $scope.selectedPolicyRoles = angular.copy($scope.authzPolicy[$scope.policyType]);
                                    }

                                    //Put users in temp attribute
                                    if ($scope.authzPolicy != null && $scope.authzPolicy.users != null && $scope.authzPolicy.users.length > 0) {
                                        if ($scope.targetlist.users == null || $scope.targetlist.users.length == 0) {
                                            $scope.targetlist.users = $scope.authzPolicy.users;
                                        }
                                    }

                                    if ($scope.authzPolicy != null && $scope.authzPolicy.groups != null && $scope.authzPolicy.groups.length > 0) {
                                        if ($scope.targetlist.groups == null || $scope.targetlist.groups.length == 0) {
                                            $scope.targetlist.groups = $scope.authzPolicy.groups;
                                        }
                                    }

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




                    /*** Stage Navigation and Submit ****/
                    $scope.stage = [
                        {"name": "Profile"},
                        {"name": $scope.policyType.substring(0, 1).toUpperCase() + $scope.policyType.substring(1, $scope.policyType.length)},
                        {"name": "Targets"},
                        {"name": "Functions"},
                        {"name": "Obligations"}
                    ];
                    if ($scope.mode == 'edit') {
                        for (var i = 0; i < $scope.stage.length; i++) {
                            $scope.stage[i].status = "complete";
                        }
                    }

                    $scope.activeStage = 1;
                    $scope.activeStageOrigStatus = "pending";

                    $scope.nextStage = function () {
                        $scope.stage[$scope.activeStage - 1].status = "complete";
                        $scope.activeStage++;
                    }



                    //Navigate between Completed stages
                    $scope.goToStage = function (stage) {
                        //var content_area = angular.element(document.getElementById('stage_'+stage)); 
                        //$document.scrollToElementAnimated(content_area, 1000, $rootScope.angularscroll.duration);
                        for (var i = 1; i <= $scope.stage.length; i++) {
                            angular.element(document.getElementById('stage_' + i)).removeClass("fadeinpolicy fadeoutpolicy");
                        }
                        angular.element(document.getElementById('stage_' + stage)).addClass("fadeinpolicy fadeoutpolicy");
                        $scope.activeStage = stage;
                    }


                    $scope.submitData = function (authzPolicy, mode, isValid)
                    {
                        if (!isValid) {
                            $(document).scrollTop(0);
                            return;
                        }

                        var authzPolicyData = {
                            effect: authzPolicy.effect,
                            aid: $scope.applicationId,
                            resourceActions: {},
                            obligations: authzPolicy.obligations,
                            name: authzPolicy.name,
                            description: authzPolicy.description
                        };

                        for (var i = 0; i < $scope.policyResources.length; i++) {
                            var resourceStr = $scope.policyResources[i].resource.id + "|" + $scope.policyResources[i].resource.fqdn;
                            var finalActionArr = [];
                            for (var j = 0; j < $scope.policyResources[i].actions.length; j++) {
                                var finalAction = {
                                    id: $scope.policyResources[i].actions[j].id,
                                    name: $scope.policyResources[i].actions[j].name
                                };
                                finalActionArr.push(finalAction);
                            }

                            authzPolicyData.resourceActions[resourceStr] = finalActionArr;
                        }

                        for (var i = 0; i < $scope.policyResourceGroups.length; i++) {
                            var resourceStr = $scope.policyResourceGroups[i].resource.id + "|" + $scope.policyResourceGroups[i].resource.name;
                            var finalActionArr = [];
                            for (var j = 0; j < $scope.policyResourceGroups[i].actions.length; j++) {
                                var finalAction = {
                                    id: $scope.policyResourceGroups[i].actions[j].id,
                                    name: $scope.policyResourceGroups[i].actions[j].name
                                };
                                finalActionArr.push(finalAction);
                            }

                            authzPolicyData.resourceActions[resourceStr] = finalActionArr;
                        }

                        authzPolicyData[$scope.policyType] = [];
                        if ($scope.policyType == 'roles') {
                            for (var i = 0; $scope.selectedPolicyRoles && i < $scope.selectedPolicyRoles.length; i++) {
                                var principal = {};
                                if ($scope.selectedPolicyRoles[i].name) {
                                    principal['name'] = $scope.selectedPolicyRoles[i].name;
                                }
                                if ($scope.selectedPolicyRoles[i].id) {
                                    principal['id'] = $scope.selectedPolicyRoles[i].id;
                                }

                                authzPolicyData[$scope.policyType].push(principal);
                            }
                        } else {
                            authzPolicyData[$scope.policyType] = $scope.targetlist[$scope.policyType];
                        }


                        if (authzPolicy.args != null && authzPolicy.args.length > 0) {
                            if (authzPolicy.args[0].text != null) {
                                authzPolicyData.args = [];
                                //The argument object has been modified, so correct it
                                for (var i = 0; i < authzPolicy.args.length; i++) {
                                    authzPolicyData.args.push(authzPolicy.args[i].text);
                                }
                            } else {
                                //The arguement object has not been modified.
                                authzPolicyData.args = authzPolicy.args;
                            }
                        }

                        if (authzPolicy.function && authzPolicy.function.id > 0) {
                            authzPolicyData.function = {};
                            authzPolicyData.function.id = authzPolicy.function.id;
                        }


                        // Add Role Role Policy
                        if (mode == 'add') {
                            $scope.insertAuthzPolicy(authzPolicyData);
                        }

                        // Edit Role Policy
                        if (mode == 'edit') {
                            authzPolicyData.aid = $scope.applicationId;
                            $scope.updateAuthzPolicy(authzPolicy.id, authzPolicyData, $scope.policyType);
                        }
                    }

                    /* ## Manage Roles Ends ## */

                    $scope.redirectList = function () {
                        if (!angular.isUndefined($rootScope.rolePolicySearch) || !angular.isUndefined($rootScope.userPolicySearch) || !angular.isUndefined($rootScope.groupPolicySearch)) {
                            $location.path("/" + $scope.applicationId + '/search/policies/' + $scope.policyType);
                        } else {
                            $location.path("/" + $scope.applicationId + '/policies/' + $scope.policyType);
                        }
                    }
                    /*** Stage Navigation and Submit ****/

                    /* Insert New Role Policy */
                    $scope.insertAuthzPolicy = function (rolePolicy) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': rolePolicy.name, 'mode': 'insert'};

                        rolePoliciesFactory.insertRolePolicy(rolePolicy, $scope.applicationId, $scope.policyType)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = rolePolicy.aid + '/policies/' + $scope.policyType;
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

                    /* Update Policy */
                    $scope.updateAuthzPolicy = function (id, authzPolicy, policyType) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': authzPolicy.name, 'mode': 'update'};

                        rolePoliciesFactory.updateRolePolicy(id, $scope.applicationId, authzPolicy, policyType)
                                .then(function () {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = authzPolicy.aid + '/policies/' + policyType;
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



                    $scope.isStageComplete = function () {
                        switch ($scope.activeStage) {
                            case 1:
                                if ($scope.authzPolicy.effect != null && $scope.authzPolicy.name) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            case 2:
                                if (($scope.selectedPolicyRoles != null && $scope.selectedPolicyRoles.length > 0) ||
                                        ($scope.targetlist[$scope.policyType] != null && $scope.targetlist[$scope.policyType].length > 0)
                                        ) {
                                    return true;
                                } else {
                                    return false;
                                }
                                return true;
                            case 3:
                                if (($scope.policyResources == null || $scope.policyResources.length == 0) &&
                                        ($scope.policyResourceGroups == null || $scope.policyResourceGroups.length == 0)) {
                                    return false;
                                }
                                for (var i = 0; i < $scope.policyResources.length; i++) {
                                    if ($scope.policyResources[i].actions == null || $scope.policyResources[i].actions.length == 0) {
                                        //console.log("policyResources"+$scope.policyResources[i].actions.length);
                                        return false;
                                    }
                                }
                                for (var i = 0; i < $scope.policyResourceGroups.length; i++) {
                                    if ($scope.policyResourceGroups[i].actions == null || $scope.policyResourceGroups[i].actions.length == 0) {
                                        //console.log("policyResourceGroups"+$scope.policyResourceGroups[i].actions.length);
                                        return false;
                                    }
                                }
//                                console.log($scope.policyResources.length)
//                                console.log($scope.policyResourceGroups.length);

                                return true;
                            case 4:
                                return true;
                            case 5:
                                return true;

                        }
                    }

                    ngProgress.complete();
                }
            ]);

    policiesModule.controller('policiesFunctionController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'functionPageFactory', '$window',
                function ($scope, $rootScope, $cookies, $routeParams, $location, functionPageFactory, $window)
                {

                    /****Ajax Smart table dropdown for Functions #start****/
                    $scope.openDropdown = false;

                    //$scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'reverse',
                        'desc': 'true'
                    };
                    $scope.sortType = arrSort[sortHow];
                    $scope.functions = [];
                    $scope.itemsByPage = 5; //Need to change based on form stage... How to do that..??
                    $scope.callFunctionDropdown = function (tableState) {
                        var section = 'Function';
                        $scope.isLoading_dd = true;
                        //tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        //var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        var entriesPerPage = 5;
                        tableState.search_dd = {};
                        //alert(number);
                        if (entriesPerPage) {
                            functionPageFactory.getPage(start, entriesPerPage, tableState, $scope.applicationId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.functions = null;
                                        $scope.error_dd = 'No Records';
                                    } else {
                                        $scope.functions = null;
                                        $scope.error_dd = $rootScope.getErrorMessage(result.error, section);
                                    }
                                } else {
                                    $scope.functions = result.data.functions;
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

                    $scope.functionName = "";
                    $scope.selectFunctionDetail = function (value) {
                        $scope.openDropdown = false;
                        if (!$scope.authzPolicy.function) {
                            $scope.authzPolicy.function = {};
                        }
                        $scope.authzPolicy.function.name = value.name;
                        $scope.authzPolicy.function.id = value.id;
                        $scope.authzPolicy.function.className = value.className;
                        $scope.authzPolicy.function.description = value.description;
//                    	var selectedFunction = {
//                    			"function.id" : value.id,
//                    			"function.name" : value.name,
//                    			"function.className" : value.hierarchical
//                    		};
//                    	
                    };
                    /****Ajax Smart table dropdown for Functions #end****/

                    $scope.$applyAsync(function () {
                        $('#scrolldropdownFunc').slimScroll({
                            height: '136px'
                        });

                    });

                }
            ]);





    policiesModule.controller('policiesResourceController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', 'toasterService', '$location', '$filter', '$document', 'resourceFactory', 'resourcePageFactory', 'resourceTypePageFactory', 'resourceTypeFactory', 'resourceGroupFactory', 'resourceGroupPageFactory', 'resourceShareDataService', '$filter', '$window',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, toasterService, $location, $filter, $document, resourceFactory, resourcePageFactory, resourceTypePageFactory, resourceTypeFactory, resourceGroupFactory, resourceGroupPageFactory, resourceShareDataService, $filter, $window)
                {

                    /*Search Icon Initializations */
                    $scope.resourcesourcesearchIcon = true;
                    $scope.resourcetargetsearchIcon = true;
                    $scope.resourcegroupsourcesearchIcon = true;
                    $scope.resourcegrouptargetsearchIcon = true;
                    $scope.actiontargetsearchIcon = true;

                    /* Initializations for Resource Selection forms */
                    $scope.actionsForResource = [];
                    $scope.resourceActionForActions = null;
                    $scope.actionsForResourceGroup = [];
                    $scope.startEditActionStatus = false;

                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };

                    $scope.sortType = arrSort[sortHow];


                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.itemsByPage_resource = $rootScope.paginationStore.resource.paginationSize;
                        $scope.sortType_resource = arrSort[$rootScope.paginationStore.resource.orderBy];
                        $scope.itemsByPage_resourcegroup = $rootScope.paginationStore.resourceGroup.paginationSize;
                        $scope.sortType_resourcegroup = arrSort[$rootScope.paginationStore.resourceGroup.orderBy];
                        $scope.itemsByPage_resourcetype = $cookieStore.get('paginationStore').resourceType.paginationSize;
                    } else {
                        $scope.itemsByPage_resource = $cookieStore.get('paginationStore').resource.paginationSize;
                        $scope.sortType_resource = arrSort[$cookieStore.get('paginationStore').resource.orderBy];
                        $scope.itemsByPage_resourcegroup = $cookieStore.get('paginationStore').resourceGroup.paginationSize;
                        $scope.sortType_resourcegroup = arrSort[$cookieStore.get('paginationStore').resourceGroup.orderBy];
                        $scope.itemsByPage_resourcetype = $cookieStore.get('paginationStore').resourceType.paginationSize;
                    }

                    $scope.typeID = resourceShareDataService.get().resourcetypeid;
                    $scope.parentID = (resourceShareDataService.get().resourceparentid != null) ? resourceShareDataService.get().resourceparentid : 0;
                    $scope.typeName = resourceShareDataService.get().resourcetypename;
                    $scope.treeNav = (resourceShareDataService.get().treeNav != null) ? resourceShareDataService.get().treeNav : null;
                    $scope.resourcetypehierarchical = (resourceShareDataService.get().resourcetypehierarchical != null) ? resourceShareDataService.get().resourcetypehierarchical : false;

                    $scope.callServerForResource = function (tableState) {
                        var sortBy = "name";
                        $scope.error = "";
                        //console.log(tableState);
                        var tid = (resourceShareDataService.get().resourcetypeid != null) ? resourceShareDataService.get().resourcetypeid : '';
                        var pid = (resourceShareDataService.get().resourceparentid != null) ? resourceShareDataService.get().resourceparentid : 0;
                        var hierarchical = resourceShareDataService.get().resourcetypehierarchical;
                        $scope.resourcehierarchy = hierarchical ? 'Hierarchial Resources' : 'Non-Hierarchial Resources';
                        if (tid == '') {
                            $scope.resources = null;
                            $scope.error = 'Please select a Resource Type';
                            $scope.isLoading = false;
                        } else {

                            $scope.isLoading = true;

                            var pagination = tableState.pagination;
                            var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                            var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                            //var number = 10;
                            if (number) {
                                if ($rootScope.previousRoute != $rootScope.currentRoute
                                        && !angular.isUndefined($rootScope.previousRoute)) {
                                    number = $cookieStore.get('paginationStore').resource.paginationSize;
                                    $scope.itemsByPage_resource = number;
                                    $rootScope.previousRoute = undefined;
                                }

                                $rootScope.paginationStore.resource.paginationSize = parseInt(number);
                                $rootScope.paginationStore.resource.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                                $cookieStore.put('paginationStore', $rootScope.paginationStore);
                                //where do i get global??
                                resourcePageFactory.getPage(start, number, tableState, $scope.applicationId, tid, pid, hierarchical, 'false', sortBy, sortHow).then(function (result) {

                                    if (result.error) {
                                        if (result.error.status == 404) {
                                            $scope.resources = null;
                                            $scope.error = 'No Records';
                                        } else {
                                            $scope.resources = null;
                                            $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);

                                        }
                                    } else {
                                        $scope.resources = [];
                                        angular.forEach(result.data.resources, function (item) {
                                            angular.forEach($scope.policyResources, function (inneritem) {
                                                if (inneritem.resource.id == item.id) {
                                                    item['mark'] = 1;
                                                }
                                            })
                                            $scope.resources.push(item);
                                        })
                                        //$scope.resources = result.data.resources;
                                        tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update                                     
                                    }
                                }).finally(function () {
                                    $scope.isLoading = false;
                                });
                            }
                        }

                    }


                    $scope.callServerForResourceGroups = function (tableState) {
                        var sortBy = "name";
                        $scope.error = "";
                        //console.log(tableState);
                        var tid = (resourceShareDataService.get().resourcetypeid != null) ? resourceShareDataService.get().resourcetypeid : '';

                        if (tid == '') {
                            $scope.resources = null;
                            $scope.error = 'Please select a Resource Type';
                        } else {
                            $scope.isLoading = true;
                            var pagination = tableState.pagination;
                            var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                            var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                            //var number = 10;
                            if (number) {
                                //where do i get global??
                                if ($rootScope.previousRoute != $rootScope.currentRoute
                                        && !angular.isUndefined($rootScope.previousRoute)) {
                                    number = $cookieStore.get('paginationStore').resourceGroup.paginationSize;
                                    $scope.itemsByPage_resourcegroup = number;
                                    $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                    $rootScope.previousRoute = undefined;
                                }

                                $rootScope.paginationStore.resourceGroup.paginationSize = parseInt(number);
                                $rootScope.paginationStore.resourceGroup.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                                $cookieStore.put('paginationStore', $rootScope.paginationStore);
                                resourceGroupPageFactory.getPage(start, number, tableState, $scope.applicationId, tid, sortBy, sortHow).then(function (result) {
                                    if (result.error) {
                                        if (result.error.status == 404) {
                                            $scope.resourceGroups = null;
                                            $scope.error = 'No Records';
                                        } else {
                                            $scope.resourceGroups = null;
                                            $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);

                                        }
                                    } else {

                                        $scope.resourceGroups = [];
                                        angular.forEach(result.data.resourceGroups, function (item) {
                                            angular.forEach($scope.policyResourceGroups, function (inneritem) {
                                                if (inneritem.resource.id == item.id) {
                                                    item['mark'] = 1;
                                                }
                                            })
                                            $scope.resourceGroups.push(item);
                                        })

                                        //$scope.resourceGroups = result.data.resourceGroups;
                                        tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update                                     
                                    }
                                }).finally(function () {
                                    $scope.isLoading = false;
                                });
                            }
                        }

                    }


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
                        $scope.callServerForResource($rootScope.tableState);
                    };

                    /****Ajax Smart table dropdown for Resource type #start****/
                    $scope.openDropdown = false;
                    //$scopwn = false;
                    $scope.itemsByPage = $rootScope.itemsByPage;                    
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                    $scope.sortType = arrSort[sortHow];
                    $scope.resourcetypes = [];

                    $scope.callResourceTypeDropdown = function (tableState) {
                        var sortBy = "name";
                        var section = 'Resource Type';
                        $scope.isLoading_dd = true;
                        //tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        //var number = 5;
                        tableState.search_dd = {};
                        //alert(number);
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').resourceType.paginationSize;
                                $scope.itemsByPage_resourcetype = number;
                                $rootScope.previousRoute = undefined;
                            }
                            $rootScope.paginationStore.resourceType.paginationSize = parseInt(number);
                            $rootScope.paginationStore.resourceType.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
                            resourceTypePageFactory.getPage(start, number, tableState, $scope.applicationId, sortBy, sortHow).then(function (result) {
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


                    $scope.getDropdownIconClass = function () {
                        if (!$scope.openDropdown) {
                            return "arrow-down";
                        }
                        return "arrow-up";
                    };

                    $scope.clearCommonFormData = function () {
                        $scope.resourceActionForActions = null;
                        $scope.actionsForResource = null;
                        $scope.actionsForResourceGroup = null;
                    }
                    $scope.selectResourcetype = function (value) {
                        //$scope.resources = null;
                        //$scope.resourceGroups = null;
                        $scope.treeNav = [];
                        $scope.openDropdown = false;
                        $scope.resourcetypename = value.name;
                        $scope.resourcetypehierarchical = value.hierarchical;
                        $scope.resourceTypeActions = value.actions;
                        var selectedResourcetype = {
                            "resourcetypeid": value.id,
                            "resourcetypename": value.name,
                            "resourcetypehierarchical": value.hierarchical,
                            "resourcetypeactions": value.actions
                        };

                        resourceShareDataService.set(selectedResourcetype);
                        //$route.reload();

                        // Regenerate the smart table with default tablestate
                        $scope.callServerForResource($rootScope.tableState);
                        $scope.callServerForResourceGroups(($rootScope.tableState));

                        var content_area = angular.element(document.getElementById('content_area'));
                        $document.scrollToElementAnimated(content_area, $rootScope.angularscroll.offset, $rootScope.angularscroll.duration);
                    };

                    $scope.checkSelected = [];
                    $scope.selectedparent = false;
                    $scope.selectedResource = null;

                    $scope.toggleItemSelect = function (item) {
                        if (!angular.element(document.getElementById(item.id)).hasClass("mapped")) {
                            item.isSelected = !item.isSelected;
                        } else {
                            item.mark = 1;
                        }
                        $scope.selectedResource = item;

                    };

                    $scope.toggleItemSelectResourceGroup = function (item) {
                        if (!angular.element(document.getElementById(item.id)).hasClass("mapped")) {
                            item.isSelected = !item.isSelected;
                        }

                    };

                    $scope.toggleResourceAction = function (item) {
                        if ($scope.showSaveResource) {
                            item.isSelected = !item.isSelected;
                        }
                    }

                    $scope.toggleResourceGroupAction = function (item) {
                        if ($scope.showSaveResourceGroup) {
                            item.isSelected = !item.isSelected;
                        }
                    }

                    $scope.tabName = 'resources';
                    $scope.selectedTab = function (tabName) {
                        $scope.tabName = tabName;
                    }

                    $scope.numItemSelectForResourceAction = 0;
                    $scope.numItemSelectForResourceGroupAction = 0;
                    $scope.actionResourceGroupHeader = "Assigned Actions";
                    $scope.actionResourceHeader = "Assigned Actions";
                    $scope.notselectedResource = true;
                    
                    $scope.toggleItemSelectForAction = function (resourceAction, policyResourceList, flagName, $event) {
                    	
                        //toggle select
                    	resourceAction.isSelected = !resourceAction.isSelected;
                    	
                        var e = $event;
                        if (!e.ctrlKey) {
                        	for (var i = 0; i < policyResourceList.length; i++) {
                        		if (policyResourceList[i].resource.id==resourceAction.resource.id && resourceAction.isSelected) {
                        			policyResourceList[i].isSelected = true;
                        		} else {
                        			policyResourceList[i].isSelected = false;
                        		}
                        	}
                        }
                        
                        if (flagName == 'numItemSelectForResourceGroupAction') {
                            $scope.showSaveResourceGroup = false;
                            $scope.actionResourceGroupHeader = "Assigned Actions";
                            angular.element(document.getElementById('groupassignscrollaction')).addClass("remove_hover");
                            if (!resourceAction.isSelected) {
                                $scope.showMultipleSelectResourceGroup = false;
                                $scope.notselectedResourceGroup = false;
                                $scope.actionsForResourceGroup = null;
                            }
                        } else {
                            $scope.showSaveResource = false;
                            $scope.actionResourceHeader = "Assigned Actions";
                            angular.element(document.getElementById('assignscrollaction')).addClass("remove_hover");
                            if (!resourceAction.isSelected) {
                                $scope.showMultipleSelectResource = false;
                                $scope.notselectedResource = false;
                                $scope.actionsForResource = null;
                            }
                        }
                        // var flagName = (isGroup) ? 'numItemSelectForResourceGroupAction' : 'numItemSelectForResourceAction';
                        //see if there is a selected resource action already. if it is, then unselect it.

                        /*if (resourceAction.isSelected) {
                            $scope[flagName]++;

                        } else {
                            $scope[flagName]--;
                        }*/
                        $scope[flagName] = $filter('filter')(policyResourceList, {isSelected: true}).length;

                        //console.log(resourceAction.resource.id+"   "+$scope.resourceActionForActions.resource.id)
                        for (var i = 0; i < policyResourceList.length; i++) {
                            if (policyResourceList[i].isSelected) {
                                $scope.resourceActionForActions = policyResourceList[i];
                                if (flagName == 'numItemSelectForResourceGroupAction') {
                                    $scope.selectedResourceGroupAction = policyResourceList[i];
                                    $scope.actionsForResourceGroup = angular.copy(policyResourceList[i].actions);
                                    $scope.notselectedResourceGroup = true;
                                } else if (flagName == 'numItemSelectForResourceAction') {
                                    $scope.selectedResourceAct = policyResourceList[i];
                                    $scope.actionsForResource = angular.copy(policyResourceList[i].actions);
                                    $scope.notselectedResource = true;
                                }

                                //Reset the search parameters
                                $scope.actiontargetsearchBox = false;
                                $scope.search_actiontarget = '';
                                $scope.actiontargetsearchIcon = true;
                                break;
                            }
                        }

                        if (flagName == 'numItemSelectForResourceGroupAction') {
                            if ($scope[flagName] > 1) {
                                $scope.showMultipleSelectResourceGroup = false;
                                $scope.actionsForResourceGroup = null;
                            } else {
                                $scope.showMultipleSelectResourceGroup = true;
                            }
                        } else {
                            if ($scope[flagName] > 1) {
                                $scope.showMultipleSelectResource = false;
                                $scope.actionsForResource = null;
                            } else {
                                $scope.showMultipleSelectResource = true;
                            }

                        }

                        switch ($scope[flagName]) {
                            case 1:
                                break;
                            default:
                                break;
                        }
                        //Reset Edit status of actions
                        $scope.startEditActionStatus = false;
                        
                        //console.log($scope.resourceActionForActions);
                    }

                    $scope.startEditActions = function (resourceAction, selectedAction, flagName) {
                        $scope.startEditActionStatus = true;
                        var resourceAction = $scope.resourceActionForActions;
                        resourceAction.isSelected = true;
                        
                        if (flagName == 'numItemSelectForResourceGroupAction') {
                            $scope.selectedResourceGroupAction = selectedAction;
                            $scope.showSaveResourceGroup = true;
                            $scope.actionResourceGroupHeader = "Select Actions";
                            $scope.showMultipleSelectResourceGroup = true;
                            $scope.notselectedResourceGroup = true;
                            angular.element(document.getElementById('groupassignscrollaction')).removeClass("remove_hover");
                        } else {
                            $scope.selectedResourceAct = selectedAction;
                            $scope.showSaveResource = true;
                            $scope.actionResourceHeader = "Select Actions";
                            $scope.showMultipleSelectResource = true;
                            $scope.notselectedResource = true;
                            angular.element(document.getElementById('assignscrollaction')).removeClass("remove_hover");
                        }


                        var typeID = resourceAction.resource.typeID;

//                    resourceFactory.getResource(resourceAction.resource.id, $scope.applicationId)
//                    .then(function (response) {
//                             var resource = response.data;
//	
                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.authzPolicy.name, 'mode': 'insert'};
                        $scope.isLoading_action = true;
                        resourceTypeFactory.getResourceType(typeID, $scope.applicationId)
                                .then(function (resp) {

                                    if (flagName == 'numItemSelectForResourceGroupAction') {

                                        $scope.actionsForResourceGroup = resp.data.actions;
                                        for (rtAction in $scope.actionsForResourceGroup) {
                                            for (rAction in resourceAction.actions) {
                                                if ($scope.actionsForResourceGroup[rtAction].id == resourceAction.actions[rAction].id) {
                                                    $scope.actionsForResourceGroup[rtAction].isSelected = true;
                                                }
                                            }
                                        }
                                    } else {

                                        $scope.actionsForResource = resp.data.actions;
                                        for (rtAction in $scope.actionsForResource) {
                                            for (rAction in resourceAction.actions) {
                                                if ($scope.actionsForResource[rtAction].id == resourceAction.actions[rAction].id) {
                                                    $scope.actionsForResource[rtAction].isSelected = true;
                                                }
                                            }
                                        }
                                    }



                                }, function (err) {
                                    toasterService.hideToastr(false);
                                    message = $rootScope.getErrorMessage(err, $scope.section, objCustom);
                                    $scope.error = message;
                                    toasterService.showToastr(message, 'error');
                                }
                                ).finally(function () {
                            $scope.isLoading_action = false;
                            toasterService.hideToastr(false);
                        });
//                        },
//                        function (error) {
//                            toasterService.hideToastr(false);
//                            message = $rootScope.getErrorMessage(error, $scope.section);
//                            $scope.error = message;
//                            toasterService.showToastr(message, 'error');
//                        }
//                    ).finally(function () {
//                        toasterService.hideToastr(false);
//
//                    });
                    };

                    $scope.saveEditActions = function (resourceAction, flagName) {


                        $scope.startEditActionStatus = false;
                        var resourceAction = $scope.resourceActionForActions;

                        if (flagName == 'numItemSelectForResourceGroupAction') {
                            angular.element(document.getElementById('groupassignscrollaction')).addClass("remove_hover");
                            $scope.showSaveResourceGroup = false;
                            $scope.actionResourceGroupHeader = "Assigned Actions";
                            var actions = $scope.actionsForResourceGroup;

                            var tempActionArr = [];

                            for (var i = 0; i < actions.length; i++) {
                                if (actions[i].isSelected) {
                                    tempActionArr.push(actions[i]);
                                    actions[i].isSelected = false;
                                }
                            }
                            resourceAction['actions'] = tempActionArr;
                            $scope.actionsForResourceGroup = resourceAction['actions'];

                        } else {
                            angular.element(document.getElementById('assignscrollaction')).addClass("remove_hover");
                            $scope.showSaveResource = false;
                            $scope.actionResourceHeader = "Assigned Actions";
                            var actions = $scope.actionsForResource;

                            var tempActionArr = [];

                            for (var i = 0; i < actions.length; i++) {
                                if (actions[i].isSelected) {
                                    tempActionArr.push(actions[i]);
                                    actions[i].isSelected = false;
                                }
                            }
                            resourceAction['actions'] = tempActionArr;
                            $scope.actionsForResource = resourceAction['actions'];
                        }


                    };



                    $scope.toggleItemSelectAction = function (action) {
                        if (!action.isSelected) {
                            //select item now..
                            action.isSelected = true;
                            if (!$scope.selectedResourceAction.actions) {
                                $scope.selectedResourceAction.actions = [];
                            }
                            var isAvailable = false;
                            for (var i = 0; i < $scope.selectedResourceAction.actions.length; i++) {
                                if ($scope.selectedResourceAction.actions[i].id == action.id) {
                                    isAvailable = true;
                                    break;
                                }
                            }
                            if (!isAvailable) {
                                $scope.selectedResourceAction.actions.push(action);
                            }
                        } else {
                            action.isSelected = false;
                            if (!$scope.selectedResourceAction.actions) {
                                $scope.selectedResourceAction.actions = [];
                            }
                            var indexOfAction = -1;
                            for (var i = 0; i < $scope.selectedResourceAction.actions.length; i++) {
                                if ($scope.selectedResourceAction.actions[i].id == action.id) {
                                    indexOfAction = i;
                                }
                            }
                            if (indexOfAction >= 0) {
                                $scope.selectedResourceAction.actions.splice(indexOfAction, 1);
                            }
                        }

                    }


                    $scope.addSelectedResourceItems = function (source, target) {
                        if (!source) {
                            source = [];
                        }
//                    	if($scope.policyResources == null || $scope.policyResources.length==0) {
//                    		$scope.policyResources = [];
//                    	} 
//                    	target = $scope.policyResources;
                        for (var i = 0; i < source.length; i++) {
                            if (source[i].isSelected) {
                                angular.element(document.getElementById(source[i].id)).addClass("mapped");
                                var isAvailable = false;
                                for (var j = 0; j < target.length; j++) {
                                    if (source[i].id == target[j].resource.id) {
                                        isAvailable = true;
                                    }
                                }
                                if (!isAvailable) {
                                    var resourceActionObj = {resource: source[i],
                                        actions: []
                                    };
                                    //Required to support Sorting and searching
                                    resourceActionObj.name = source[i].fqdn;
                                    target.push(resourceActionObj);
                                }
                                source[i].isSelected = false;
                            }
                        }
                    }

                    $scope.removeSelectedResourceItems = function (source, flagName) {
                        for (var i = 0; i < source.length; ) {
                            if (source[i].isSelected) {
                                angular.element(document.getElementById(source[i].resource.id)).removeClass("mapped");
                                source.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                        $scope.resourceActionForActions = null;
                        if (flagName == 'numItemSelectForResourceGroupAction') {
                            $scope.actionsForResourceGroup = null;
                        } else {
                            $scope.actionsForResource = null;
                        }


                        $scope[flagName] = 0;
                    }

                    $scope.resetResourceItems = function (list, isGroup) {

                        if (isGroup) {
                            angular.forEach($scope.resourceGroups, function (item) {
                                angular.element(document.getElementById(item.id)).removeClass("mapped");
                            })
                            $scope.policyResourceGroups = [];
                            $scope.policyResourceGroupCount = 0;
                            $scope.numItemSelectForResourceGroupAction = 0;
                            if ($scope.authzPolicy != null && $scope.authzPolicy.resourceActions != null) {
                                for (var i = 0; i < $scope.authzPolicy.resourceActions.length; i++) {
                                    angular.element(document.getElementById($scope.authzPolicy.resourceActions[i].resource.id)).removeClass("mapped");
                                    if ($scope.authzPolicy.resourceActions[i].resource.group == true) {
                                        var resourceGroup = angular.copy($scope.authzPolicy.resourceActions[i]);
                                        resourceGroup.resource.name = resourceGroup.resource.fqdn;
                                        $scope.policyResourceGroups.push(resourceGroup);
                                        //angular.element(document.getElementById(principal.id)).removeClass("mapped");
//                                        $scope.policyResourceGroups.push(angular.copy($scope.authzPolicy.resourceActions[i]));
//                                        $scope.policyResourceGroupCount++;
                                    }
                                }
                            }
                        } else {


                            angular.forEach($scope.resources, function (item) {
                                angular.element(document.getElementById(item.id)).removeClass("mapped");
                            })

                            $scope.policyResources = [];
                            $scope.policyResourceCount = 0;
                            $scope.numItemSelectForResourceAction = 0;

                            if ($scope.authzPolicy != null && $scope.authzPolicy.resourceActions != null) {
                                for (var i = 0; i < $scope.authzPolicy.resourceActions.length; i++) {
                                    if ($scope.authzPolicy.resourceActions[i].resource.group == false) {
                                        $scope.policyResources.push(angular.copy($scope.authzPolicy.resourceActions[i]));
                                        $scope.policyResourceCount++;
                                    }
                                }
                            }

                        }
                    }



                    $scope.startSearch = function (searchType) {
                        switch (searchType) {

                            case 'resourcesource':
                                $scope.resourcesourcesearchBox = true;
                                $scope.resourcesourcefocusInput = true;
                                $scope.resourcesourcesearchIcon = false;
                                break;
                            case 'resourcetarget':
                                $scope.resourcetargetsearchBox = true;
                                $scope.resourcetargetfocusInput = true;
                                $scope.resourcetargetsearchIcon = false;
                                break;
                            case 'resourcegroupsource':
                                $scope.resourcegroupsourcesearchBox = true;
                                $scope.resourcegroupsourcefocusInput = true;
                                $scope.resourcegroupsourcesearchIcon = false;
                                break;
                            case 'resourcegrouptarget':
                                $scope.resourcegrouptargetsearchBox = true;
                                $scope.resourcegrouptargetfocusInput = true;
                                $scope.resourcegrouptargetsearchIcon = false;
                                break;
                            case 'actiontarget':
                                $scope.actiontargetsearchBox = true;
                                $scope.actiontargetfocusInput = true;
                                $scope.actiontargetsearchIcon = false;
                                break;


                        }

                    }

                    $scope.endSearch = function (searchType) {
                        switch (searchType) {
                            case 'principalsource':
                                $scope.principalsourcesearchBox = false;
                                $scope.search_principalsource = '';
                                $scope.principalsourcesearchIcon = true;
                                break;
                            case 'principaltarget':
                                $scope.principaltargetsearchBox = false;
                                $scope.search_principaltarget = '';
                                $scope.principaltargetsearchIcon = true;
                                break;
                            case 'resourcesource':
                                $scope.resourcesourcesearchBox = false;
                                $scope.search_resourcesource = '';
                                $scope.resourcesourcesearchIcon = true;
                                break;
                            case 'resourcetarget':
                                $scope.resourcetargetsearchBox = false;
                                $scope.search_resourcetarget = '';
                                $scope.resourcetargetsearchIcon = true;
                                break;
                            case 'resourcegroupsource':
                                $scope.resourcegroupsourcesearchBox = false;
                                $scope.search_resourcegroupsource = '';
                                $scope.resourcegroupsourcesearchIcon = true;
                                break;
                            case 'resourcegrouptarget':
                                $scope.resourcegrouptargetsearchBox = false;
                                $scope.search_resourcegrouptarget = '';
                                $scope.resourcegrouptargetsearchIcon = true;
                                break;
                            case 'actiontarget':
                                $scope.actiontargetsearchBox = false;
                                $scope.search_actiontarget = '';
                                $scope.actiontargetsearchIcon = true;
                                break;

                        }
                    };

                    // Close all instances when user clicks elsewhere
                    $window.onclick = function (event) {
                        closeWhenClickingElsewhere(event, function () {
                            $scope.openDropdown = false;
                            $scope.$apply();
                        }, 'list_container');
                    };
                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolldropdownFunc').slimScroll({
                            height: '136px'
                        });

                    });

                    $scope.$applyAsync(function () {
                        $('#scrolldropdown').slimScroll({
                            height: '136px'
                        });

                    });
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: '410px'
                                    //color : $rootScope.listscrolltable.color                            
                        });
                    });

                    $scope.$applyAsync(function () {
                        $('#assignscroll').slimScroll({
                            height: '410px'
                        });
                    });

                    $scope.$applyAsync(function () {
                        $('#assignscrollaction').slimScroll({
                            height: '410px',
                            width: '100%'
                        });
                    });

                    $scope.$applyAsync(function () {
                        $('#groupscrolltable').slimScroll({
                            height: '410px'
                                    //color : $rootScope.listscrolltable.color                            
                        });
                    });

                    $scope.$applyAsync(function () {
                        $('#groupassignscroll').slimScroll({
                            height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#groupassignscrollaction').slimScroll({
                            height: '410px',
                            width: '100%'
                        });
                    });

                    /******Scroll bar setting end*************/



                }
            ]);


    policiesModule.controller('policiesObligationController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', '$window',
                function ($scope, $rootScope, $cookies, $routeParams, $location, $window)
                {

                    /**** Obligations Start *****/

                    $scope.editableIndex = -1;
                    $scope.obligationsearchIcon = true;

                    $scope.startObligationSearch = function () {
                        $scope.searchIconOnObligation = false;
                        $scope.searchBoxOnObligation = true;
                    }

                    $scope.obligationSearchFilter = function (item) {
                        if (item.name == obligationSearchCriteria) {
                            return true;
                        } else {
                            return false;
                        }
                    }

                    $scope.endObligationSearch = function () {
                        $scope.searchIconOnObligation = true;
                        $scope.searchBoxOnObligation = false;
                        $scope.obligationSearchCriteria = '';
                    }


                    $scope.startSearch = function (searchType) {
                        switch (searchType) {
                            case 'obligation':
                                $scope.obligationsearchBox = true;
                                $scope.obligationfocusInput = true;
                                $scope.obligationsearchIcon = false;
                                break;
                        }

                    }

                    $scope.endSearch = function (searchType) {
                        switch (searchType) {
                            case 'obligation':
                                $scope.obligationsearchBox = false;
                                $scope.search_obligation = '';
                                $scope.obligationsearchIcon = true;
                                break;
                        }
                    };
                    $scope.addObligation = function (indexOf) {
                        if ($scope.authzPolicy.obligations == null) {
                            $scope.authzPolicy['obligations'] = [];
                        }
                        $scope.authzPolicy.obligations.splice(indexOf, 0, {"name": "", "value": ""});
                        editableIndex = 0;
                    }

                    $scope.deleteObligations = function () {
                        $scope.authzPolicy.obligations = [];
                    }

                    $scope.editObligation = function (obligation, indexOf) {
                        $scope.obligations.splice(indexOf, 1);
                        $scope.obligations.splice(indexOf, 0, obligation);
                        $scope.obligations[indexOf].editable = false;
                    }

                    $scope.deleteObligation = function (indexOf) {
                        $scope.authzPolicy.obligations.splice(indexOf, 1);
                    }

                    /**** Obligations End *******/
                }
            ]);


    policiesModule.controller('policiesRoleController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', 'rolePageFactory', '$window', '$filter',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, rolePageFactory, $window, $filter)
                {


                    /*Search Icon Initializations */
                    $scope.principalsourcesearchIcon = true;
                    $scope.principaltargetsearchIcon = true;
                    $scope.startSearch = function (searchType) {
                        switch (searchType) {
                            case 'principalsource':
                                $scope.principalsourcesearchBox = true;
                                $scope.principalsourcefocusInput = true;
                                $scope.principalsourcesearchIcon = false;
                                break;
                            case 'principaltarget':
                                $scope.principaltargetsearchBox = true;
                                $scope.principaltargetfocusInput = true;
                                $scope.principaltargetsearchIcon = false;
                                break;
                        }

                    }

                    $scope.endSearch = function (searchType) {
                        switch (searchType) {
                            case 'principalsource':
                                $scope.principalsourcesearchBox = false;
                                $scope.search_principalsource = '';
                                $scope.principalsourcesearchIcon = true;
                                break;
                            case 'principaltarget':
                                $scope.principaltargetsearchBox = false;
                                $scope.search_principaltarget = '';
                                $scope.principaltargetsearchIcon = true;
                                break;
                        }
                    };




                    $scope.toggleItemSelect = function (roledetails) {
                        if (!angular.element(document.getElementById(roledetails.id)).hasClass("mapped")) {
                            roledetails.isSelected = !roledetails.isSelected;
                        }
                    };



                    $scope.toggleItemSelectTarget = function (roledetailsTarget) {
                        if (!angular.element(document.getElementById(roledetailsTarget.id + '_target')).hasClass("mapped")) {
                            roledetailsTarget.isSelected = !roledetailsTarget.isSelected;
                        }
                    };





                    $scope.addSelectedPrincipals = function () {
                        var source = $scope.availablePrincipals;

//                         if($scope.selectedRoles == null || $scope.selectedRoles.length == 0) {
//                            $scope.selectedRoles = [];
//                         }
                        // var target = $scope.selectedRoles;


                        for (var i = 0; i < source.length; i++) {
                            if (source[i].isSelected) {
                                angular.element(document.getElementById(source[i].id + '_target')).removeClass("selectedActive");
                                angular.element(document.getElementById(source[i].id)).addClass("mapped");
                                var isAvailable = false;
                                for (var j = 0; j < $scope.selectedPolicyRoles.length; j++) {
                                    if (source[i].id && $scope.selectedPolicyRoles[j].id == source[i].id) {
                                        isAvailable = true;
                                    } else if (source[i].uid &&
                                            $scope.selectedPolicyRoles[j].uid == source[i].uid &&
                                            $scope.selectedPolicyRoles[j].sid == source[i].sid) {
                                        isAvailable = true;
                                        break;
                                    } else if (source[i].name &&
                                            $scope.selectedPolicyRoles[j].name == source[i].name &&
                                            $scope.selectedPolicyRoles[j].sid == source[i].sid) {
                                        isAvailable = true;
                                        break;
                                    }
                                }
                                if (!isAvailable) {
                                    source[i].isSelected = false;
                                    var clonedPrincipal = angular.copy(source[i]);
                                    $scope.selectedRoles.push(clonedPrincipal);
                                    clonedPrincipal['new'] = 1;
                                    $scope.selectedPolicyRoles.push(clonedPrincipal);

                                }
                                source[i].isSelected = false;
                            }
                        }
                        return;
                    }

                    $scope.removeSelectedPrincipals = function () {
                        var source = $scope.selectedPolicyRoles;
                        if (!source) {
                            source = [];
                        }
                        for (var i = 0; i < source.length; ) {
                            if (source[i].isSelected) {
                                angular.element(document.getElementById(source[i].id + '_target')).removeClass("selectedActive");
                                angular.element(document.getElementById(source[i].id)).removeClass("mapped");
                                source.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                        return;
                    }

                    $scope.resetPrincipalItems = function () {
                        var resetItem = [];
                        angular.forEach($scope.selectedPolicyRoles, function (principal) {
                            angular.element(document.getElementById(principal.id)).removeClass("mapped");
                            if (principal.new != 1) {
                                resetItem.push(principal);
                            }

                        })
                        $scope.selectedPolicyRoles = resetItem;
                    }

                    /****** Ajax Smart table ****************/
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.itemsByPage_role = $cookieStore.get('paginationStore').role.paginationSize;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    $scope.rightPageinationPerPage = 8;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                    $scope.sortType = arrSort[sortHow];
                    $scope.sortType_role = arrSort[$cookieStore.get('paginationStore').role.orderBy];
                    $scope.availableRoles = [];
                    $scope.callServerForRoles = function (tableState) {


                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || $scope.itemsByPage_role;  // Number of entries showed per page. if pagination.number not found set false .
                        //var number = 20;


                        //if (number) {

                        if ($rootScope.previousRoute != $rootScope.currentRoute
                                && !angular.isUndefined($rootScope.previousRoute)) {
                            number = $cookieStore.get('paginationStore').role.paginationSize;
                            $scope.itemsByPage_role = number;
                            $rootScope.previousRoute = undefined;
                        }
                        $rootScope.paginationStore.role.paginationSize = parseInt(number);
                        $rootScope.paginationStore.role.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                        $cookieStore.put('paginationStore', $rootScope.paginationStore);

                        rolePageFactory.getPage(start, number, tableState, $scope.applicationId, sortBy, sortHow).then(function (result) {
                            if (result.error) {
                                if (result.error.status == 404) {
                                    $scope.availablePrincipals = null;
                                    $scope.error = 'No Records';
                                } else {
                                    $scope.availablePrincipals = null;
                                    $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                                }
                            } else {

                                $scope.availablePrincipals = [];
                                angular.forEach(result.data.roles, function (principal) {
                                    if (!angular.isUndefined($filter('filter')($scope.selectedPolicyRoles, {id: principal.id})[0])) {
                                        principal['mark'] = 1;
                                    }
                                    $scope.availablePrincipals.push(principal);
                                })

                                //$scope.availablePrincipals = result.data.roles;
                                tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                            }
                        }).finally(function () {
                            $scope.isLoading = false;
                            //toasterService.hideToastr();
                        });
                        //}

                    }


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
                }
            ]);


    policiesModule.controller('policiesPrincipalController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$cookieStore', '$location', '$filter', '$document', 'sourcePageFactory', 'roleFactory', 'ngProgress', 'toasterService', '$window', 'sourceFactory', 'groupsFactory', 'usersFactory',
                function ($scope, $rootScope, $routeParams, $cookies, $cookieStore, $location, $filter, $document, sourcePageFactory, roleFactory, ngProgress, toasterService, $window, sourceFactory, groupsFactory, usersFactory)
                {

                    ngProgress.start();

                    var message;
                    message = $rootScope.translation.toaster.LOADING;
                    //toasterService.showToastr(message, 'loader');
                    //$rootScope.module = 'rolemembers';
                    $scope.section = 'Group Policy';
                    $scope.activeLetter = '';
                    $scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID                    
                    $scope.roleId = $routeParams.roleMemberID; // application ID

                    $scope.openDropdown = false;
                    $scope.info = "Please Select Source.";
                    $scope.dispmsg = "No Record Selected.";
                    $scope.usertargetList = null;
                    $scope.userfulltargetList = $scope.authzPolicy.users;
                    $scope.usersourceList = null;
                    $scope.grouptargetList = null;
                    $scope.groupfulltargetList = $scope.authzPolicy.groups;
                    $scope.groupsourceList = null;
                    $scope.usersourceListLength = 0;
                    $scope.groupsourceListLength = 0;
                    $scope.usertargetlistFullLength = 0;
                    $scope.grouptargetlistFullLength = 0;
                    $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                    $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;
                    var sortHow = 'asc';
                    var limit = 100;
                    $scope.sourcelist = {
                        users: null,
                        groups: null
                    };


                    /*$scope.setActiveLetter = function (letter, sourceId, searchTab) {

                        $scope.info = null;
                        if (letter && sourceId) {
//                            if ($scope.policyType == 'users') {
//                                document.getElementById('usermainContent').style.display = 'block';
//                            } else if ($scope.policyType == 'groups') {
//                                document.getElementById('groupmainContent').style.display = 'block';
//                            }
                            $scope.search = '';
                            $scope.placeholder = "e.g.  bjensen, 1_ahell, $jbrown";



                            $scope.activeLetter = letter;
                            $scope.sourcelist = {
                                users: [],
                                groups: []
                            };


                            angular.forEach($scope.targetlist.users, function (value, key) {
                                if (value.uid.indexOf(letter.toLowerCase()) == 0 || value.uid.indexOf(letter) == 0) {
                                    if (value.sid == sourceId) {
                                        $scope.targetlistFull.users.push({"uid": value.uid, "sid": value.sid});
                                    }
                                }
                            })

                            angular.forEach($scope.targetlist.groups, function (value, key) {
                                if (value.name.indexOf(letter.toLowerCase()) == 0 || value.name.indexOf(letter) == 0) {
                                    if (value.sid == sourceId) {
                                        $scope.targetlistFull.groups.push({"name": value.name, "sid": value.sid});
                                    }
                                }
                            })

                            $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                            $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;

                            if ($scope.policyType == 'users') {
                                $scope.getUsers(letter, $scope.sortByUser, sourceId, limit, $scope.sortByUser, sortHow);
                            } else if ($scope.policyType == 'groups') {
                                $scope.getGroups(letter, $scope.sortByGroup, sourceId, limit, $scope.sortByGroup, sortHow);

                            }


                        } else {
                            $scope.info = "Please Select Source.";
                        }
                    }*/

                    $scope.getUsers = function (searchText, searchType, sourceId, limit, sortBy, sortHow) {
                        $scope.isLoading = true;

                        usersFactory.getUsers(searchText, searchType, sourceId, limit, sortBy, sortHow)
                                .then(function (response) {
                                    //$scope.users = response.data.users;
                                    //$scope.sourcelist = response.data;
                                    if ($scope.sourcelist.users != null) {

                                        angular.forEach(response.data.users, function (value, key) {
                                            if (angular.isUndefined($filter('filter')($scope.targetlist.users, {uid: value.uid, sid: value.sid})[0])) {
                                                $scope.sourcelist.users.push({"uid": value.uid, "sid": $scope.sourceId});
                                            }
                                        })
                                    }
                                    $scope.usersourceListLength = $scope.sourcelist.users.length;
                                    //if (response.data.users.length) {
                                    $scope.activeLetter = response.data.users[0].uid.charAt(0).toUpperCase();
                                    //}
                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.sourcelist.users = null;
                                                $scope.usersourceListLength = 0;
                                                $scope.error = 'No Records Found';
                                            } else {
                                                $scope.sourcelist.users = null;
                                                $scope.usersourceListLength = 0;
                                                $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                                            }
                                        }
                                ).finally(function () {
                            $scope.isLoading = false;
                            if ($scope.search != '') {
                                $scope.activeLetter = $scope.search.charAt(0).toUpperCase();
                            }
                        });
                    };

                    $scope.getGroups = function (searchText, searchType, sourceId, limit, sortBy, sortHow) {
                        $scope.isLoading = true;
                        //$scope.sourcelist = {groups: {}};
                        groupsFactory.getGroups(searchText, searchType, sourceId, limit, sortBy, sortHow)
                                .then(function (response) {
                                    //$scope.sourcelist = response.data;
                                    if ($scope.sourcelist.groups != null) {
                                        angular.forEach(response.data.groups, function (value, key) {
                                            if (angular.isUndefined($filter('filter')($scope.targetlist.groups, {name: value.name, sid: value.sid})[0])) {
                                                $scope.sourcelist.groups.push({"name": value.name, "sid": $scope.sourceId});
                                            }
                                        })
                                    }
                                    $scope.groupsourceListLength = $scope.sourcelist.groups.length;

                                    //if (response.data.groups.length) {
                                    $scope.activeLetter = response.data.groups[0].name.charAt(0).toUpperCase();
                                    //}
                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.sourcelist.groups = null;
                                                $scope.error = 'No Records Found';
                                                $scope.groupsourceListLength = 0;
                                            } else {
                                                $scope.sourcelist.groups = null;
                                                $scope.groupsourceListLength = 0;
                                                $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                                            }
                                        }
                                ).finally(function () {
                            $scope.isLoading = false;
                            if ($scope.search != '') {
                                $scope.activeLetter = $scope.search.charAt(0).toUpperCase();
                            }
                        });
                    };


                    $scope.sourceName = null;
                    $scope.displayAttributes = null;
                    $scope.selectedSource = null;
                    
                    $scope.selectSource = function (sources) {
                        $scope.selectedSource = sources;
                        //console.log('selectedSource',$scope.selectedSource);
                        
                        // Set selected source Id in localstorage, to remember in memory
                        if (angular.isUndefined(localStorage['selectedSourceId']) || localStorage['selectedSourceId']!=$scope.selectedSource.id) {
                        	localStorage.setItem("selectedSourceId", $scope.selectedSource.id);
                        }
                        
                        $scope.sourcelist.users = null;
                        $scope.sourcelist.groups = null;
                        $scope.sourceName = sources.name;
                        $scope.sourceId = sources.id;
                        $scope.openDropdown = false;
                        //$scope.info = "Please select alphabet to search.";
                        $scope.info = "Please select a source and search.";
//                        if ($scope.policyType == 'users') {
//                            document.getElementById('usermainContent').style.display = 'none';
//                        } else if ($scope.policyType == 'groups') {
//                            document.getElementById('groupmainContent').style.display = 'none';
//                        }
                        $scope.sortByUser = sources.searchAttributes.userNameIdentifier;
                        $scope.sortByGroup = sources.searchAttributes.groupNameIdentifier;
                        $scope.activeLetter = '';

                        var content_area = angular.element(document.getElementById('content_area'));
                        $document.scrollToElementAnimated(content_area, $rootScope.angularscroll.offset, $rootScope.angularscroll.duration);

                        $scope.placeholder = "";
                        angular.element(document.getElementById('serach')).removeClass("required");
                        if ($scope.policyType == 'users') {
                            $scope.displayAttributes = $scope.selectedSource.userDisplayAttributes;
                            //$scope.usersearchAttributes = $scope.selectedSource.searchAttributes.userSearchDefaultAttr;
                            $scope.searchField = $scope.selectedSource.userDisplayAttributes[$scope.selectedSource.searchAttributes.userNameIdentifier];
                        } else {
                            $scope.displayAttributes = $scope.selectedSource.groupDisplayAttributes;
                            //$scope.groupsearchAttributes = $scope.selectedSource.searchAttributes.groupSearchDefaultAttr;
                            $scope.searchField = $scope.selectedSource.userDisplayAttributes[$scope.selectedSource.searchAttributes.groupNameIdentifier];
                        }

                        $scope.userSearchType = $scope.selectedSource.searchAttributes.userNameIdentifier;
                        $scope.groupSearchType = $scope.selectedSource.searchAttributes.groupNameIdentifier;
                    };
                    
                    // Fetch remembered source details, if any, from localstorage
                    var selectedSourceId = !angular.isUndefined(localStorage['selectedSourceId']) ? localStorage['selectedSourceId'] : null;
                    if ( selectedSourceId!=null && !angular.isUndefined(localStorage['sources']) ) {
                    	var selectedSource = $filter('filter')(JSON.parse(localStorage['sources']), {id: selectedSourceId})[0];
                    	$scope.selectSource(selectedSource);
                    }
                    
                    $scope.notSorted = function (obj) {
                        if (!obj) {
                            return [];
                        }
                        return Object.keys(obj);
                    }


                    $scope.opentoolbar = function (id) {
                        if ($scope.sourceName == null) {
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
                    $scope.setItemsByPage = function (type) {
                        if (type == 'user') {
                            $rootScope.paginationStore.user.paginationSize = parseInt(document.getElementById('itemsByPage_' + type).value);
                        } else {
                            $rootScope.paginationStore.group.paginationSize = parseInt(document.getElementById('itemsByPage_' + type).value);
                        }

                        $cookieStore.put('paginationStore', $rootScope.paginationStore);
                        //console.log(type+" SIZE"+JSON.stringify($rootScope.paginationStore));
                    };

                    $scope.setSortOrder = function (type) {
                        if (type == 'user') {
                            if (angular.element(document.getElementById('stsort_' + type)).hasClass("st-sort-descent")) {
                                $rootScope.paginationStore.user.orderBy = "desc";
                            } else {
                                $rootScope.paginationStore.user.orderBy = "asc";

                            }
                        } else {
                            if (angular.element(document.getElementById('stsort_' + type)).hasClass("st-sort-descent")) {
                                $rootScope.paginationStore.group.orderBy = "desc";
                            } else {
                                $rootScope.paginationStore.group.orderBy = "asc";

                            }
                        }
                        $cookieStore.put('paginationStore', $rootScope.paginationStore);
                        //console.log(type +"ORDER"+JSON.stringify($rootScope.paginationStore));
                    };


                    //Remove all search tooltip
                    $(document).ready(function () {
                        $(".serach_dropdown").mouseup(function () {
                            return false
                        });
                        $(document).mouseup(function () {
                            $('div').removeClass('open_div');
                        });
                    });

                    $scope.criteria = 'Name';
                    $scope.setSearchField = function (criteria) {
                        var criteria = criteria.split("*");
                        $scope.userName = '';
                        $scope.searchField = criteria[1]; // Display Value
                        if ($scope.policyType == 'users') {
                            $scope.userSearchType = criteria[0]; // Display Key
                        } else {
                            $scope.groupSearchType = criteria[0]; // Display Key
                        }
                        $scope.selected = '';
                        $scope.openDropdownField = false;
                        angular.element(document.getElementById('field-dropdown')).removeClass("open_div");
                    }

                    $scope.submitSearch = function () {
                        if ($scope.sourceName == null) {
                            $scope.search = '';
                            $scope.placeholder = "Please select source.";
                            angular.element(document.getElementById('serach')).addClass("required");
                            return false;
                        }
                        if (angular.isUndefined($scope.search) || $scope.search == '') {
                            $scope.search = '';
                            $scope.placeholder = "Please enter the serach criteria.";
                            angular.element(document.getElementById('serach')).addClass("required");
                            return false;
                        }

                        $scope.sourcelist = {
                            users: [],
                            groups: []
                        };

                        

                        $scope.targetlistFull = {
                            users: [],
                            groups: []
                        };

                       



                        
                        
                        
                        
                        if ($scope.policyType == 'users') {
                             angular.forEach($scope.targetlist.users, function (value, key) {
                            //if (value.uid.indexOf(letter.toLowerCase()) == 0 || value.uid.indexOf(letter) == 0) {
                            if (value.sid == $scope.sourceId) {
                                $scope.targetlistFull.users.push({"uid": value.uid, "sid": value.sid});
                            }
                            //}
                        })
                        $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;    
                            
                        $scope.getUsers($scope.search, $scope.userSearchType, $scope.sourceId, limit, $scope.userSearchType, sortHow);
                        } else {
                            angular.forEach($scope.targetlist.groups, function (value, key) {
                            //if (value.name.indexOf(letter.toLowerCase()) == 0 || value.name.indexOf(letter) == 0) {
                            if (value.sid == $scope.sourceId) {
                                $scope.targetlistFull.groups.push({"name": value.name, "sid": value.sid});
                            }
                            //}
                        })
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                        
                        $scope.getGroups($scope.search, $scope.groupSearchType, $scope.sourceId, limit, $scope.groupSearchType, sortHow);
                        }

                    }

                    $scope.placeholder = "e.g.  bjensen, 1_ahell, $jbrown";
                    $scope.removeClass = function () {
                        angular.element(document.getElementById('serach')).removeClass("required");
                    }



                    /****** Ajax Smart table ****************/

                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.itemsByPage_source = $cookieStore.get('paginationStore').source.paginationSize;
                    $scope.itemsByPage_user = $cookieStore.get('paginationStore').user.paginationSize;
                    $scope.itemsByPage_group = $cookieStore.get('paginationStore').group.paginationSize;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    var sortBy = 'SOURCE_NAME';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                    $scope.sortType = arrSort[sortHow];
                    $scope.sortTypeUser = arrSort[$cookieStore.get('paginationStore').user.orderBy];
                    $scope.sortTypeGroup = arrSort[$cookieStore.get('paginationStore').group.orderBy];
                    $scope.sources = [];

                    $scope.callServer = function callServer(tableState) {
                        $scope.isLoading_source = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').source.paginationSize;
                                $scope.itemsByPage = number;
                                //$scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }
                            $rootScope.paginationStore.source.paginationSize = parseInt(number);
                            $rootScope.paginationStore.source.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
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
                                    $scope.sources = result.data.sources;
                                    if ($scope.sources.length == 1) {
                                        $scope.sourceName = result.sources[0].name;
                                    }
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading_source = false;
                            });
                        }
                    };

                    /****** Ajax smart table ends ************/

                    $scope.usersourcesearchIcon = true;
                    $scope.userfulltargetsearchIcon = true;
                    $scope.usertargetsearchIcon = true;
                    $scope.groupsourcesearchIcon = true;
                    $scope.groupfulltargetsearchIcon = true;
                    $scope.grouptargetsearchIcon = true;
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
                            case 'groupsource':
                                $scope.groupsourcesearchBox = true;
                                $scope.groupsourcefocusInput = true;
                                $scope.groupsourcesearchIcon = false;
                                break;
                            case 'groupfulltarget':
                                $scope.groupfulltargetsearchBox = true;
                                $scope.groupfulltargetfocusInput = true;
                                $scope.groupfulltargetsearchIcon = false;
                                break;
                            case 'grouptarget':
                                $scope.grouptargetsearchBox = true;
                                $scope.grouptargetfocusInput = true;
                                $scope.grouptargetsearchIcon = false;
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
                            case 'groupsource':
                                $scope.groupsourcesearchBox = false;
                                $scope.groupsourcesearchIcon = true;
                                break;
                            case 'groupfulltarget':
                                $scope.groupfulltargetsearchBox = false;
                                $scope.groupfulltargetsearchIcon = true;
                                break;
                            case 'grouptarget':
                                $scope.grouptargetsearchBox = false;
                                $scope.grouptargetsearchIcon = true;
                                break;
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


//                    $scope.tabName = "users";
//                    $scope.selectedTab = function (tabName) {
//                        $scope.tabName = tabName;
//                    }

                    /* Dual-ListBox */
                    $scope.selectedSourceItems = [];
                    $scope.selectedTargetItems = [];

//                     $scope.targetlist = {
//                         users: [],
//                         groups: []
//                     };


                    var currenttab = 'users';
                    $scope.selectSourceItem = function (item) {
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
                        return $scope.selectedSourceItems.indexOf(item) > -1;
                    };
                    $scope.isSelectedTarget = function (item) {
                        return $scope.selectedTargetItems.indexOf(item) > -1;
                    };

                    $scope.addItem = function (items, tabName, letter) {
                        currenttab = tabName;
                        if (currenttab == 'users') {
                            angular.forEach(items, function (item) {
                                //if ($scope.sourcelist.users[item.uid + "_" + item.sid]) {
                                if (!angular.isUndefined($filter('filter')($scope.sourcelist.users, {uid: item.uid, sid: item.sid})[0])) {
                                    var searchArray = {};
                                    searchArray['property'] = 'uid';
                                    searchArray['value'] = item.uid;
                                    findAndRemove($scope.sourcelist.users, searchArray);
                                    $scope.selectedSourceItems = [];

                                    $scope.targetlist.users.push(item);
                                    $scope.targetlistFull.users.push({"uid": item.uid, "sid": item.sid, "search": $scope.activeLetter});
                                    $scope.showAddBtn = false;
                                    $scope.showRemoveBtn = false;

                                }
                            });

                        } else {
                            angular.forEach(items, function (item) {
                                if (!angular.isUndefined($filter('filter')($scope.sourcelist.groups, {name: item.name, sid: item.sid})[0])) {
                                    var searchArray = {};
                                    searchArray['property'] = 'name';
                                    searchArray['value'] = item.name;
                                    findAndRemove($scope.sourcelist.groups, searchArray);
                                    $scope.selectedSourceItems = [];
                                    $scope.targetlist.groups.push(item);
                                    $scope.targetlistFull.groups.push({"name": item.name, "sid": item.sid, "search": $scope.activeLetter});
                                    $scope.showAddBtn = false;
                                    $scope.showRemoveBtn = false;
                                }
                            });
                        }
                        $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                        $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;
                        $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                        $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                        $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;


                    };

                    $scope.removeItem = function (items, tabName) {
                        currenttab = tabName;
                        if (currenttab == 'users') {
                            angular.forEach(items, function (item) {
                                if (!angular.isUndefined($filter('filter')($scope.targetlist.users, {uid: item.uid, sid: item.sid})[0])) {
                                    var searchArray = {};
                                    searchArray['property'] = 'uid';
                                    searchArray['value'] = item.uid;
                                    findAndRemove($scope.targetlist.users, searchArray);
                                    findAndRemove($scope.targetlistFull.users, searchArray);
                                    $scope.selectedSourceItems = [];
                                    $scope.sourcelist.users.push(item);
                                    $scope.showAddBtn = false;
                                    $scope.showRemoveBtn = false;
                                }
                            });
                        } else {
                            angular.forEach(items, function (item) {
                                if (!angular.isUndefined($filter('filter')($scope.targetlist.groups, {name: item.name, sid: item.sid})[0])) {
                                    var searchArray = {};
                                    searchArray['property'] = 'name';
                                    searchArray['value'] = item.name;
                                    findAndRemove($scope.targetlist.groups, searchArray);
                                    findAndRemove($scope.targetlistFull.groups, searchArray);
                                    $scope.selectedSourceItems = [];
                                    $scope.sourcelist.groups.push(item);
                                    $scope.showAddBtn = false;
                                    $scope.showRemoveBtn = false;
                                }
                            });
                        }
                        $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                        $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;
                        $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                        $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                        $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;

                    };

                    $scope.resetItem = function (tabName, letter) {
                        currenttab = tabName;
                        if (currenttab == 'users') {
                            $scope.temp = angular.copy($scope.targetlistFull.users);
                            angular.forEach($scope.temp, function (item) {
                                if (item.search == $scope.activeLetter) {
                                    var searchArray = {};
                                    searchArray['property'] = 'uid';
                                    searchArray['value'] = item.uid;
                                    findAndRemove($scope.targetlist.users, searchArray);
                                    findAndRemove($scope.targetlistFull.users, searchArray);
                                    $scope.sourcelist.users.push(item);
                                }

                            })
                        } else {
                            $scope.temp = angular.copy($scope.targetlistFull.groups);
                            angular.forEach($scope.temp, function (item) {
                                if (item.search == $scope.activeLetter) {
                                    var searchArray = {};
                                    searchArray['property'] = 'name';
                                    searchArray['value'] = item.name;
                                    findAndRemove($scope.targetlist.groups, searchArray);
                                    findAndRemove($scope.targetlistFull.groups, searchArray);
                                    $scope.sourcelist.groups.push(item);

                                }
                            })
                        }
                        $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                        $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;
                        $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                        $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                        $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;
                    }



                    $scope.getSource = function (sourceid) {
                        if (!angular.isUndefined(localStorage['sources'])) {
                            return $filter('filter')(JSON.parse(localStorage['sources']), {id: sourceid})[0].name;
                        }
                    }



                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: '280px'
                                    //color : $rootScope.listscrolltable.color                            
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#unassignscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#assignscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#unassigngroupscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#assigngroupscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#fullassignscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#fullassigngroupscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    /******Scroll bar setting end*************/

                    ngProgress.complete();
                }
            ]);
});
