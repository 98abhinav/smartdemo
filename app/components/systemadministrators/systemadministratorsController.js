define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, systemAdministratorModule, smartTable, ngScrollbar) {
    systemAdministratorModule.controller('systemadministratorController', [
        '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$filter', 'systemAdministratorService', 'systemAdministratorFactory', 'systemAdministratorPageFactory', 'accessService', '$timeout', 'ngProgress', 'toasterService', '$route', 'sourceFactory',
        function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $filter, systemAdministratorService, systemAdministratorFactory, systemAdministratorPageFactory, accessService, $timeout, ngProgress, toasterService, $route, sourceFactory) {
            ngProgress.start();

            var message;
            $rootScope.module = 'systemadministrators';
            $scope.section = "System Administrator";
            $scope.applicationId = $routeParams.applicationID; // application ID
            $scope.systemadministrators;

            /* Access Check Validate */
            accessService.checkAccessDeny();

            // Delete functionality
            $scope.confirmDelete = function (id) {
                var message = $rootScope.translation.systemadministrator.DELETE_CONFIRM + $scope.selectedSystemAdministrator.name + '?';
                toasterService.showToastr(message, 'warning');
                $scope.id = id;
            };
            $('body').off('click', '#confirm_delete');
            $('body').on('click', '#confirm_delete', function () {
                toasterService.hideToastr(false);
                deleteSystemAdministrator($scope.id, $scope.applicationId);
            });

            function deleteSystemAdministrator(id, applicationId) {
                message = $rootScope.translation.toaster.DELETING;
                toasterService.showToastr(message, 'loader');

                // Custom object for error & success message
                var objCustom = {
                    'displayValue': $scope.selectedSystemAdministrator.name,
                    'mode': 'delete'
                };

                systemAdministratorFactory.deleteSystemAdministrator(id, applicationId)
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

            /*var searchText = ""; // Search criteria for users
            var sortBy = 'SOURCE_NAME';
            var sortHow = 'asc';
            var offset = 0;
            var limit = 1000;
            
            $rootScope.getSources = null;
            sourceFactory.getSources(searchText, limit, offset, sortBy, sortHow)
                    .then(function (sourceResponse) {
                        $rootScope.getSources = sourceResponse.data.sources;
                    },
                            function (error) {
                                $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                            }
                    ).finally(function () {

            });*/

            $scope.getSource = function (sourceid) {
                if (!angular.isUndefined(localStorage['sources'])) {
                    return $filter('filter')(JSON.parse(localStorage['sources']), {id: sourceid})[0].name;
                }
            }

            /*$scope.systemadministrators = [];
            function getSuperUsers() {
                var applicationId = 1; // Application ID, Hardcoded to get system administrators from ROOT application
                //var searchText = "SuperAdmin"; // Hardcoded to get Super Admin users from ROOT application
                var searchText = "";
                var number = 1;
                var start = 100;
                var sortBy = 'uid';
                var sortHow = 'asc';
                var arrSort = {
                    'asc': 'true',
                    'desc': 'reverse'
                };
                $scope.isLoading = true;
                if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                    $scope.itemsByPage = $rootScope.paginationStore.systemadministrator.paginationSize;
                    $scope.sortType = arrSort[$rootScope.paginationStore.systemadministrator.orderBy];
                } else {
                    $scope.itemsByPage = $cookieStore.get('paginationStore').systemadministrator.paginationSize;
                    $scope.sortType = arrSort[$cookieStore.get('paginationStore').systemadministrator.orderBy];
                }

                systemAdministratorFactory.getSystemAdministrators(searchText, applicationId, number, start, sortBy, sortHow)
                        .then(function (response) {
	                            if ($rootScope.previousRoute != $rootScope.currentRoute
	                                    && !angular.isUndefined($rootScope.previousRoute)) {
	                                number = $cookieStore.get('paginationStore').systemadministrator.paginationSize;
	                                $scope.itemsByPage = number;
	                                $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
	                                $rootScope.previousRoute = undefined;
	                            }
	                            $scope.selectedRow = 0;
	                            $scope.systemadministrators = sortJson(response.data.users);
	                            $scope.restResponse = $scope.result;
	                            // Show the first row details from response Start
	                            $scope.selectedSystemAdministratorActionsCount = 0;
	                            $scope.selectedSystemAdministrator = $scope.systemadministrators[$scope.selectedRow];
	                            $scope.sourceName = $scope.getSource($scope.selectedSystemAdministrator.sid);
	                            // Show the first row details from response Ends
	                        },
                            function (error) {
                                if (error.status == 404) {
                                    $scope.systemadministrators = null;
                                    $scope.error = 'No Records Found';
                                } else {
                                    $scope.systemadministrators = null;
                                    $scope.error = 'Unable to load data: ' + error.status + ' ' + error.statusText;
                                }
                            }
                        ).finally(function () {
		                    $scope.isLoading = false;
		                });

            }
            getSuperUsers();*/
            
            /****** Ajax Smart table ****************/
            var applicationId = 1; // Application ID, Hardcoded to get system administrators from ROOT application
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;
            var sortBy = 'uid';
            var sortHow = 'asc';
            var arrSort = {
                'asc': 'true',
                'desc': 'reverse'
            };

            if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                $scope.itemsByPage = $rootScope.paginationStore.systemadministrator.paginationSize;
                $scope.sortType = arrSort[$rootScope.paginationStore.systemadministrator.orderBy];
            } else {
                $scope.itemsByPage = $cookieStore.get('paginationStore').systemadministrator.paginationSize;
                $scope.sortType = arrSort[$cookieStore.get('paginationStore').systemadministrator.orderBy];
            }

            //$scope.sortType = arrSort[sortHow];
            $scope.systemadministrators = [];

            $rootScope.paginationStore.systemadministrator.orderBy = sortHow;
            $cookieStore.put('paginationStore', $rootScope.paginationStore);
            
            $scope.callServer = function (tableState, ctrl) {
            	$scope.isLoading = true;
                //tableState.pagination.numberOfPages = 0;
                var pagination = tableState.pagination;
                var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                
                if (number) {
                    if ($rootScope.previousRoute != $rootScope.currentRoute
                            && !angular.isUndefined($rootScope.previousRoute)) {
                        number = $cookieStore.get('paginationStore').systemadministrator.paginationSize;
                        $scope.itemsByPage = number;
                        $rootScope.previousRoute = undefined;
                    }

                    $scope.selectedRow = 0;

                    $rootScope.paginationStore.systemadministrator.paginationSize = parseInt(number);
                    $rootScope.paginationStore.systemadministrator.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                    $cookieStore.put('paginationStore', $rootScope.paginationStore);

                    systemAdministratorPageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {
                        if (result.error) {
                            if (result.error.status == 404) {
                                $scope.systemadministrators = null;
                                $scope.error = 'No Records';
                            } else {
                                $scope.systemadministrators = null;
                                $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                            }
                        } else {
                            //$scope.systemadministrators = sortJson(result.data.users);
                        	$scope.systemadministrators = result.data.users;
                        	
                            /* Show the first row details from response Start*/
                            $scope.selectedSystemAdministrator = $scope.systemadministrators[0];
                        	$scope.sourceName = $scope.getSource($scope.selectedSystemAdministrator.sid);
                            /* Show the first row details from response Ends*/
                            tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update                                     
                        }
                    }).finally(function () {
                        $scope.isLoading = false;
                    });
                }

            }

            function sortJson(arr) {
                arr = arr.sort(function (a, b) {
                    return a.uid > b.uid;
                })
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].children) {
                        sortJson(arr[i].children)
                    }
                }
                return arr;
            }
            /* Select First Record from the list and show details */
            $scope.$on('FirstRecord', function (event) {
                $scope.systemadministrator = {
                    uid: $scope.systemadministrators[0].uid,
                    sid: $scope.systemadministrators[0].sid
                };
                $scope.selectSystemAdministrator($scope.systemadministrator);
            });

            $scope.selectedResourceDetails = null;
            $scope.selectedResourceAttribute = [];
            $scope.selectedRow = 0;
            $scope.selectSystemAdministrator = function (systemAdministrator, index) {
                $scope.selectedRow = index;
//                $scope.selectedSystemAdministratorActionsCount = 0;
//                $scope.sourceName = $scope.getSource(systemAdministrator.sid);
                $scope.selectedSystemAdministrator = systemAdministrator;
                $scope.showInfo = true;
            };

            $scope.$watch('selectedRow', function () {
                if ($scope.systemadministrators.length != 0 && angular.isDefined($scope.selectedRow)) {
                    $scope.selectedSystemAdministratorActionsCount = 0;
                    //$scope.selectedSystemAdministrator = $scope.systemadministrators[$scope.selectedRow];
                    //console.log($scope.selectedSystemAdministrator);
                    $scope.sourceName = $scope.getSource($scope.selectedSystemAdministrator.sid);
                }
            });

            $scope.tdHeight = 29;
            $scope.setItemsByPage = function () {
                $scope.selectedRow = 0;
                $('#scrolltable').slimScroll({scrollTo: '0px'});
                $('#itemsByPage').blur();
                $scope.itemsByPage = document.getElementById('itemsByPage').value;

                $rootScope.paginationStore.systemadministrator.paginationSize = parseInt($scope.itemsByPage);
                $cookieStore.put('paginationStore', $rootScope.paginationStore);

                $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];

            };

            $scope.setSortOrder = function () {
                if (angular.element(document.getElementById('stsort')).hasClass("st-sort-descent")) {
                    $rootScope.paginationStore.systemadministrator.orderBy = "desc";
                } else {
                    $rootScope.paginationStore.systemadministrator.orderBy = "asc";

                }
                $cookieStore.put('paginationStore', $rootScope.paginationStore);
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
            $scope.$applyAsync(function () {
                $('#scrollrightinnerdiv').slimScroll({
                    height: $rootScope.listscrollrightinnerdiv.height
                });
            });
            /******Scroll bar setting end*************/
            ngProgress.complete();

        }
    ]);


    systemAdministratorModule.controller('manageSystemAdministratorController', [
        '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$window', '$filter', '$document', 'systemAdministratorService', 'systemAdministratorFactory', 'accessService', 'ngProgress', 'toasterService', 'sourceFactory', 'groupsFactory', 'usersFactory', 'sourcePageFactory', 'roleFactory', 'systemAdministratorPageFactory',
        function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $window, $filter, $document, systemAdministratorService, systemAdministratorFactory, accessService, ngProgress, toasterService, sourceFactory, groupsFactory, usersFactory, sourcePageFactory, roleFactory, systemAdministratorPageFactory) {
            ngProgress.start();

            var message, redirectpath;

            /* Initialize */
            $rootScope.module = 'systemadministrators';
            $scope.section = "System Administrators";
            $scope.systemAdministrators;
            $scope.systemAdministrator;
            $scope.error;
            $scope.message;
            $scope.mode = $routeParams.mode; // add OR edit
            $scope.applicationId = $routeParams.applicationID; // application ID
            $scope.systemAdministratorId = $routeParams.systemAdministratorId; // systemAdministrator ID
            //$scope.sourceId = $routeParams.sourceID;
            $scope.usertargetList = null;
            $scope.userfulltargetList = null;
            $scope.usersourceList = null;
            $scope.grouptargetList = null;
            $scope.groupfulltargetList = null;
            $scope.groupsourceList = null;
            $scope.activeLetter = '';
            $scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            $scope.dispmsg = "No Record Selected.";
            $scope.info = "Please select a source and search.";
            $scope.usersourceListLength = 0;
            $scope.groupsourceListLength = 0;
            $scope.usertargetlistFullLength = 0;
            $scope.grouptargetlistFullLength = 0;
            $scope.usertargetlistLength = 0;
            $scope.grouptargetlistLength = 0;
            /* Access Check */
            accessService.checkAccess($rootScope.module, $scope.section, 'super');
            var sortHow = 'asc';
            var limit = 100;
            if ($scope.mode == 'edit') {
                //getSource($scope.sourceId);
                //getSuperUsers();
                //getSystemAdministrator($scope.systemAdministratorId, $scope.applicationId);
            }

            $scope.submitData = function (systemAdministrator, mode) {
                var systemAdministratorData = {
                    name: systemAdministrator.name,
                    actions: systemAdministrator.actions,
                    hierarchical: systemAdministrator.hierarchical,
                    appID: $scope.applicationId
                };

                // Add Application
                if (mode == 'add') {
                    //getSource($scope.sourceId);
                    $scope.insertSystemAdministrator(systemAdministratorData);
                }

                // Edit Application
                if (mode == 'edit') {
                    //$scope.updateSystemAdministrator(systemAdministrator.id, systemAdministratorData);
                }
            }





            /* ## Manage SystemAdministrator Starts ## */


            $scope.getSource = function (sourceid) {
                if (!angular.isUndefined(localStorage['sources'])) {
                    return $filter('filter')(JSON.parse(localStorage['sources']), {id: sourceid})[0].name;
                }
            }

            $scope.sourcelist = {
                users: null,
                groups: null
            };

            $scope.targetlist = {
                users: [],
                groups: []
            };


            $scope.setActiveLetter = function (letter, sourceId, searchTab) {

                $scope.info = null;
                if (letter && sourceId) {
                    //document.getElementById('usermainContent').style.display = 'block';
                    //document.getElementById('groupmainContent').style.display = 'block';
                    $scope.search = '';
                    $scope.placeholder = "e.g.  bjensen, 1_ahell, $jbrown";

                    $scope.activeLetter = letter;
                    $scope.sourcelist = {
                        users: [],
                        groups: []
                    };

                    $scope.targetlistFull = {
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


                    //$scope.getGroups(letter, $scope.sortByGroup,sourceId, limit, $scope.sortByGroup, sortHow);
                    $scope.getUsers(letter, $scope.sortByUser, sourceId, limit, $scope.sortByUser, sortHow);

                } else {
                    $scope.info = "Please select source.";
                }
            }

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
                            // }
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

                            if (response.data.groups.length) {
                                $scope.activeLetter = response.data.groups[0].name.charAt(0).toUpperCase();
                            }
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
                });
            };





            $scope.sourceName = null;
            $scope.displayAttributes = null;
            $scope.selectedSource = null;
            $scope.selectSource = function (sources) {
                $scope.selectedSource = sources;
                if (!angular.isUndefined($scope.sourcelist)) {
                    $scope.sourcelist.users = null;
                }
                if (!angular.isUndefined($scope.sourcelist)) {
                    $scope.sourcelist.groups = null;
                }


                $scope.sourceName = sources.name;
                $scope.sourceId = sources.id;
                $scope.openDropdown = false;
                $scope.sourceerr = false;
                $scope.info = "Please select alphabet to search.";
                //document.getElementById('usermainContent').style.display = 'none';
                //document.getElementById('groupmainContent').style.display = 'none';
                $scope.activeLetter = '';

                $scope.sortByUser = sources.searchAttributes.userNameIdentifier;
                $scope.sortByGroup = sources.searchAttributes.groupNameIdentifier;

                var content_area = angular.element(document.getElementById('content_area'));
                $document.scrollToElementAnimated(content_area, $rootScope.angularscroll.offset, $rootScope.angularscroll.duration);


                $scope.placeholder = "";
                angular.element(document.getElementById('serach')).removeClass("required");
                if ($scope.tabName == 'users') {
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
                if ($scope.tabName == 'users') {
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
                    $scope.placeholder = "Please select a source and search.";
                    angular.element(document.getElementById('serach')).addClass("required");
                    return false;
                }
                if (angular.isUndefined($scope.search) || $scope.search == '') {
                    $scope.search = '';
                    $scope.placeholder = "Please enter the serach criteria.";
                    angular.element(document.getElementById('serach')).addClass("required");
                    return false;
                }

                $scope.info ="";
                $scope.sourcelist = {
                    users: [],
                    groups: []
                };
                
                $scope.targetlistFull = {
                    users: [],
                    groups: []
                };

                angular.forEach($scope.targetlist.users, function (value, key) {
                    //if (value.uid.indexOf(letter.toLowerCase()) == 0 || value.uid.indexOf(letter) == 0) {
                    if (value.sid == $scope.sourceId) {
                        $scope.targetlistFull.users.push({"uid": value.uid, "sid": value.sid});
                    }
                    //}
                })

               /*angular.forEach($scope.targetlist.groups, function (value, key) {
                    //if (value.name.indexOf(letter.toLowerCase()) == 0 || value.name.indexOf(letter) == 0) {
                    if (value.sid == $scope.sourceId) {
                        $scope.targetlistFull.groups.push({"name": value.name, "sid": value.sid});
                    }
                    //}
                })*/
                
                $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                //$scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                
                $scope.getUsers($scope.search, $scope.userSearchType, $scope.sourceId, limit, $scope.userSearchType, sortHow);
                //$scope.getGroups($scope.search, $scope.groupSearchType, $scope.sourceId, limit, $scope.groupSearchType, sortHow);

            }

            $scope.placeholder = "e.g.  bjensen, 1_ahell, $jbrown";
            $scope.removeClass = function () {
                angular.element(document.getElementById('serach')).removeClass("required");
            }

            $scope.tabName = "users";
            $scope.selectedTab = function (tabName) {
                $scope.tabName = tabName;
                if ($scope.tabName == 'users') {
                    if ($scope.selectedSource != null) {
                        $scope.displayAttributes = $scope.selectedSource.userDisplayAttributes;
                        //$scope.usersearchAttributes = $scope.selectedSource.searchAttributes.userSearchDefaultAttr;                                
                        $scope.searchField = $scope.selectedSource.userDisplayAttributes[$scope.selectedSource.searchAttributes.userNameIdentifier];
                    }

                } else {
                    if ($scope.selectedSource != null) {
                        $scope.displayAttributes = $scope.selectedSource.groupDisplayAttributes;
                        //$scope.groupsearchAttributes = $scope.selectedSource.searchAttributes.groupSearchDefaultAttr;                                
                        $scope.searchField = $scope.selectedSource.userDisplayAttributes[$scope.selectedSource.searchAttributes.groupNameIdentifier];
                    }
                }
                if ($scope.selectedSource != null) {
                    $scope.userSearchType = $scope.selectedSource.searchAttributes.userNameIdentifier;
                    $scope.groupSearchType = $scope.selectedSource.searchAttributes.groupNameIdentifier;
                }
            }

            /****** Ajax Smart table ****************/
            $scope.itemsByPage = $rootScope.itemsByPage;
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;
            var sortBy = 'SOURCE_NAME';
            var sortHow = 'asc';
            var arrSort = {
                'asc': 'true',
                'desc': 'reverse'
            };
            $scope.sortType = arrSort[sortHow];


            if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                $scope.itemsByPage_source = $rootScope.paginationStore.source.paginationSize;
                $scope.itemsByPage_user = $rootScope.paginationStore.user.paginationSize;
                $scope.itemsByPage_group = $rootScope.paginationStore.group.paginationSize;
                $scope.sortTypeUser = arrSort[$rootScope.paginationStore.user.orderBy];
                $scope.sortTypeGroup = arrSort[$rootScope.paginationStore.group.orderBy];
            } else {
                $scope.itemsByPage_source = $cookieStore.get('paginationStore').source.paginationSize;
                $scope.itemsByPage_user = $cookieStore.get('paginationStore').user.paginationSize;
                $scope.itemsByPage_group = $cookieStore.get('paginationStore').group.paginationSize;
                $scope.sortTypeUser = arrSort[$cookieStore.get('paginationStore').user.orderBy];
                $scope.sortTypeGroup = arrSort[$cookieStore.get('paginationStore').group.orderBy];
            }



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
                        $scope.itemsByPage_source = number;
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
//                            var result={"sources":[{"id":2,"name":"ATLAS_DB"}]};
//                            $scope.sources =result.sources;
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



            /*function getSuperUsers() {
                var applicationId = 1; // Application ID, Hardcoded to get system administrators from ROOT application
                //var searchText = "SuperAdmin"; // Hardcoded to get Super Admin users from ROOT application
                var searchText = "";
                var number = 1;
                var start = 100;
                var sortBy = 'uid';
                systemAdministratorFactory.getSystemAdministrators(searchText, applicationId, number, start, sortBy, sortHow)
                        .then(function (response) {
                            $scope.role = response.data;
                            angular.forEach(response.data.users, function (item) {
                                $scope.targetlist.users.push(item);
                            })
                            $scope.usertargetlistLength = $scope.targetlist.users.length;

                        },
                                function (error) {
                                    if (error.status == 404) {
                                        $scope.sourcelist.users = null;
                                        $scope.sourcelist.groups = null;
                                        $scope.error = 'No Records Found';
                                        $scope.groupsourceListLength = 0;
                                    } else {
                                        $scope.sourcelist.users = null;
                                        $scope.sourcelist.groups = null;
                                        $scope.groupsourceListLength = 0;
                                        $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                                    }
                                }
                        ).finally(function () {
                    $scope.isLoading = false;
                });

            }*/

            $scope.callServerSystemAdministrators = function (tableState, ctrl) {
            	$scope.isLoading_SA = true;
            	$scope.targetlist.users = [];
            	var applicationId = 1; // Application ID, Hardcoded to get system administrators from ROOT application
            	var sortBy = 'uid';
            	
                //tableState.pagination.numberOfPages = 0;
                var pagination = tableState.pagination;
                var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                //console.log('pagination',pagination);
                if (number) {
                    if ($rootScope.previousRoute != $rootScope.currentRoute
                            && !angular.isUndefined($rootScope.previousRoute)) {
                        number = $cookieStore.get('paginationStore').systemadministrator.paginationSize;
                        $scope.itemsByPage = number;
                        $rootScope.previousRoute = undefined;
                    }

                    $scope.selectedRow = 0;

                    $rootScope.paginationStore.systemadministrator.paginationSize = parseInt(number);
                    $rootScope.paginationStore.systemadministrator.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                    $cookieStore.put('paginationStore', $rootScope.paginationStore);

                    systemAdministratorPageFactory.getPage(start, number, tableState, applicationId, sortBy, sortHow).then(function (result) {
                        if (result.error) {
                            if (result.error.status == 404) {
                                $scope.targetlist.users = [];
                                $scope.error = 'No Records';
                            } else {
                                $scope.targetlist.users = [];
                                $scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
                            }
                        } else {
                        	angular.forEach(result.data.users, function (item) {
                                $scope.targetlist.users.push(item);
                            })
                            $scope.usertargetlistLength = $scope.targetlist.users.length;
                            
                            /* Show the first row details from response Ends*/
                            tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update                                     
                        }
                    }).finally(function () {
                        $scope.isLoading_SA = false;
                    });
                }

            }


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




            /* Dual-ListBox */
            $scope.selectedSourceItems = [];
            $scope.selectedTargetItems = [];

            $scope.targetlist = {
                users: [],
                groups: []
            };


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

            
            $scope.targetlistFull = {
                users: [],
                groups: []
            };
            
            $scope.membershipList = [];
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

                            $scope.targetlist.users.push({"uid": item.uid, "sid": item.sid});
                            $scope.targetlistFull.users.push({"uid": item.uid, "sid": item.sid, "search": $scope.activeLetter});
                            $scope.showAddBtn = false;
                            $scope.showRemoveBtn = false;

                            // Partial Add/Remove in Target List
                            $scope.membershipList.push({"name": item.uid, "sid": item.sid, "operation": 'CREATE', "user": true});
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
                            
                            $scope.targetlist.groups.push({"name": item.name, "sid": item.sid});
                            $scope.targetlistFull.groups.push({"name": item.name, "sid": item.sid, "search": $scope.activeLetter});
                            $scope.showAddBtn = false;
                            $scope.showRemoveBtn = false;
                            
                            // Partial Add/Remove in Target List
                            $scope.membershipList.push({"name": item.name, "sid": item.sid, "operation": 'CREATE', "user": false});
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
                            $scope.sourcelist.users.push({"uid": item.uid, "sid": item.sid});
                            $scope.showAddBtn = false;
                            $scope.showRemoveBtn = false;
                            
                            // Partial Add/Remove in Target List
                            $scope.membershipList.push({"name": item.uid, "sid": item.sid, "operation": 'DELETE', "user": true});
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
                            $scope.sourcelist.groups.push({"name": item.name, "sid": item.sid});
                            $scope.showAddBtn = false;
                            $scope.showRemoveBtn = false;
                            
                            // Partial Add/Remove in Target List
                            $scope.membershipList.push({"name": item.name, "sid": item.sid, "operation": 'DELETE', "user": false});
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
                            $scope.sourcelist.users.push({"uid": item.uid, "sid": item.sid});
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
                            $scope.sourcelist.groups.push({"name": item.name, "sid": item.sid});

                        }
                    })


                }
                $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;
                $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;
                
                $scope.membershipList = [];
            }

            $scope.assignRole = function () {
            	if ($scope.sourceName == null) {
                    $scope.info = "Please select a source and search.                                                     ";
                    $scope.sourceerr = true;
                    return false;
                } else if ($scope.activeLetter == '') {
                    $scope.info = "Please search for a user/group to assign.";
                    return false;
                } else if ($scope.membershipList.length == 0) {
                    $scope.info = "No changes made.";
                    return false;
                }
            	
            	//console.log(JSON.stringify(obj));
                message = $rootScope.translation.toaster.SAVING;
                toasterService.showToastr(message, 'loader');
                var objCustom = {'displayValue': '', 'mode': 'update'};

                $scope.roleId = -19; 
                $scope.applicationId = 1;
                
                var roleDetails = {};
                roleDetails['memberships'] = $scope.membershipList;
                roleFactory.updateRoleMembers($scope.roleId, $scope.applicationId, roleDetails)
                        .then(function () {
                                toasterService.hideToastr();
                                message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                redirectpath = "/systemadministrators";
                                toasterService.showToastr(message, 'success', redirectpath);
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
            }

            $scope.addAllItems = function () {
                $scope.targetlist[currenttab].push.apply($scope.targetlist[currenttab], $scope.sourcelist[currenttab]);
                $scope.sourcelist[currenttab] = [];
            };
            $scope.removeAllItems = function () {
                $scope.sourcelist[currenttab].push.apply($scope.sourcelist[currenttab], $scope.targetlist[currenttab]);
                $scope.targetlist[currenttab] = [];
            };

            $scope.redirectList = function () {
                $location.path("/systemadministrators");
            };

            /******Scroll bar setting start*************/
            $scope.$applyAsync(function () {
                $('#scrolldropdown').slimScroll({
                    //height: '280px'
                });
            });
            $scope.$applyAsync(function () {
                $('#scrolltable').slimScroll({
                    //height: '280px'
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