define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar', 'acuteSelect'], function (app, sourceModule, smartTable, ngScrollbar, acuteSelect)
{
    sourceModule.controller('usersController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$cookieStore', '$q', '$timeout', 'usersService', 'usersFactory', 'sourceService', 'sourceFactory', 'accessService', 'ngProgress', 'toasterService', 'myCache',
                function ($scope, $rootScope, $routeParams, $cookies, $cookieStore, $q, $timeout, usersService, usersFactory, sourceService, sourceFactory, accessService, ngProgress, toasterService, myCache)
                {
                    ngProgress.start();
                    $scope.section = 'Users';
                    $scope.activeLetter = '';
                    $scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                    var searchText = ""; // Search criteria for users                    
                    var sortHow = 'asc';
                    var limit = 100;
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    //$scope.error = "Please select alphabet to view user.";

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };

                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.itemsByPage = $rootScope.paginationStore.user.paginationSize;
                        $scope.sortType = arrSort[$rootScope.paginationStore.user.orderBy];
                    } else {
                        $scope.itemsByPage = $cookieStore.get('paginationStore').user.paginationSize;
                        $scope.sortType = arrSort[$cookieStore.get('paginationStore').user.orderBy];
                    }


                    /**************Reset the search rootScope ***************/
                    if (!angular.isUndefined($rootScope.searchData)) {
                        $rootScope.displayColumns = null;
                        $rootScope.searchData = undefined;
                        $rootScope.userDetails = null;
                    }

                    /*************Reset the search rootScope Ends*************/



                    //$scope.users = null;
                    $scope.result = [];

                    $scope.getUsers = function (searchText, searchType, sourceId, limit, sortBy, sortHow) {
                        $scope.isLoading = true;
                        usersFactory.getUsers(searchText, searchType, sourceId, limit, sortBy, sortHow)
                                .then(function (response) {
                                    $scope.selectedRow = 0;
                                    $scope.result = response.data.users;
                                    $scope.restResponse = $scope.result;

                                    /* Show the first row details from response Start*/
                                    $scope.selectedUser = $scope.result[0];
                                    $scope.selectedUserAttributes = $scope.selectedUser.attributes;

                                    angular.forEach($scope.displayAttributes, function (value1, key1) {
                                        if ($scope.selectedUser.attributes.hasOwnProperty(key1)) {
                                            var finalValue = '';
                                            angular.forEach($scope.selectedUser.attributes[key1], function (memValue, memKey) {
                                                finalValue += memValue + '<br/>';
                                            })

                                            $scope.displayFields[key1] = finalValue;
                                        } else if ($scope.selectedUser.hasOwnProperty(key1)) {
                                            var finalValue = '';
                                            angular.forEach($scope.$scope.selectedUser[key1], function (memValue, memKey) {
                                                finalValue += memValue + '<br/>';
                                            })

                                            $scope.displayFields[key1] = finalValue;
                                        } else {
                                            $scope.displayFields[key1] = '-----';
                                        }
                                    })
                                    /* Show the first row details from response Ends*/

//                                   myCache.put('user_list', $scope.result);
//                                    if ($scope.result.length) {
//                                        $scope.activeLetter = $scope.result[0].uid.charAt(0).toUpperCase();
//                                    }
                                    $scope.activeLetter = searchText.charAt(0).toUpperCase();
                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.result = null;
                                                $scope.error = 'No Records Found';
                                            } else {
                                                $scope.result = null;
                                                $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                                                //$scope.error = 'Unable to load data: ' + error.status + ' ' + error.statusText;
                                            }
                                        }
                                ).finally(function () {
                            $scope.isLoading = false;
                        });
                    };


                    //$scope.users = [].concat($scope.result); 

                    $scope.setActiveLetter = function (letter) {
                        //myCache.remove('user_list');
                        $scope.activeLetter = letter;
                        $scope.search = '';
                        //$scope.getUsers(letter, '', sourceId, limit, $scope.usersearchAttributes, sortHow);

                        $scope.getUsers(letter, $scope.searchType, sourceId, limit, $scope.searchType, sortHow);
                    }

                    //Call the letter getUsers with default letter A

                    $scope.setSortOrder = function () {
                        if (angular.element(document.getElementById('stsort')).hasClass("st-sort-descent")) {
                            $rootScope.paginationStore.user.orderBy = "desc";
                        } else {
                            $rootScope.paginationStore.user.orderBy = "asc";

                        }
                        $cookieStore.put('paginationStore', $rootScope.paginationStore);
                    };

                    $scope.setSearchField = function (criteria) {
                        var criteria = criteria.split("*");
                        $scope.searchField = criteria[1]; // Display Value
                        $scope.searchType = criteria[0]; // Display Key                      
                        angular.element(document.getElementById('field-dropdown')).removeClass("open_div");
                    }

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
                            return false
                        });
                        $(document).mouseup(function () {
                            $('div').removeClass('open_div');
                        });
                    });

                    function searchJson(Object, searchBy, search) {
                        var searchOutput = [];
                        if (!angular.isUndefined(Object)) {
                            switch (searchBy) {
                                case 'username':
                                    angular.forEach(Object, function (value, key) {
                                        if (value.uid.indexOf(search) == 0)
                                            searchOutput.push(value);
                                    });
                                    break;
                                case 'email':
                                    angular.forEach(Object, function (value, key) {
                                        var str = value.attributes.mail.toString();
                                        var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
                                        if (finalValue.indexOf(search) == 0)
                                            searchOutput.push(value);
                                    });
                                    break;
                                case 'phoneno':
                                    angular.forEach(Object, function (value, key) {
                                        var str = value.attributes.telephoneNumber.toString();
                                        var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
                                        if (finalValue.indexOf(search) == 0)
                                            searchOutput.push(value);
                                    });
                                    break;

                            }

                            return searchOutput;
                        }
                    }
                    //$scope.search=undefined;
                    $scope.placeholder = "e.g.  bjensen, 1_ahell, $jbrown";
                    $scope.submitSearch = function () {

//                        var arrSearchBy = {
//                            'username': 'uid',
//                            'email': 'attributes.mail',
//                            'phoneno': 'attributes.telephoneNumber'
//                        };
//                        var searchBy = document.getElementById('criteria').value;
//                        $scope.searchBy = arrSearchBy[searchBy];
                        //$scope.getUsers($scope.search, '', sourceId, limit, $scope.usersearchAttributes, sortHow);
                        //$scope.result = searchJson(myCache.get('user_list'), $scope.searchType, $scope.search);
                        if (angular.isUndefined($scope.search) || $scope.search == '') {
                            $scope.search = '';
                            $scope.placeholder = "Please enter the serach criteria.";
                            angular.element(document.getElementById('userSerach')).addClass("required");
                            return false;
                        }
                        $scope.getUsers($scope.search, $scope.searchType, sourceId, limit, $scope.searchType, sortHow);


                        if ($scope.result != null) {
                            $scope.userDetailsSearch = {
                                uid: $scope.result[0].uid,
                                sid: $scope.result[0].sid,
                                attributes: $scope.result[0].attributes
                            };
                            $scope.selectUser($scope.userDetailsSearch);
                        } else {
                            $scope.error = "No Records Found";
                            $scope.activeLetter = '';
                        }
                    }

                    $scope.removeClass = function () {
                        angular.element(document.getElementById('userSerach')).removeClass("required");
                    }



                    $rootScope.module = 'users';

                    var sourceId = $routeParams.sourceID; // URL source ID
                    $scope.sourceId = $routeParams.sourceID; // URL source ID



                    $scope.user;
                    $scope.source;

                    $scope.usersearchAttributes = 'uid';
                    /*  Get Source by ID */
                    function getSource(id) {
                        sourceFactory.getSource(id)
                                .then(function (response) {
                                    $scope.source = response.data;
                                    $scope.sourceName = $scope.source.name;
                                    $scope.sourceConnType = $scope.source.connectionType;
                                    $scope.displayAttributes = response.data.userDisplayAttributes;
                                    $scope.usersearchAttributes = response.data.searchAttributes.userSearchDefaultAttr;
                                    //$scope.searchType = Object.keys(response.data.userDisplayAttributes)[0];
                                    //$scope.searchField = response.data.userDisplayAttributes[Object.keys(response.data.userDisplayAttributes)[0]];                                   
                                    $scope.searchType = response.data.searchAttributes.userNameIdentifier;
                                    $scope.searchField = response.data.userDisplayAttributes[response.data.searchAttributes.userNameIdentifier];
                                    $scope.setActiveLetter('A');
                                },
                                        function (error) {
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                                        }
                                );
                    }
                    ;
                    getSource(sourceId);

                    $scope.notSorted = function (obj) {
                        if (!obj) {
                            return [];
                        }
                        return Object.keys(obj);
                    }
                    /* Select First Record from the list and show details */
                    $scope.$on('FirstRecord', function (event) {
                        $scope.userDetails = {
                            uid: $scope.users[0].uid,
                            sid: $scope.users[0].sid,
                            attributes: $scope.users[0].attributes
                        };
                        $scope.selectUser($scope.userDetails);
                    });

                    $scope.displayFields = {};
                    $scope.selectedRow = 0;
                    $scope.selectUser = function (user, index) {
                        $scope.selectedRow = index;
//                        $scope.selectedUser = user;
//                        $scope.selectedUserAttributes = user.attributes;
//                        $scope.showInfo = true;
//
//                        angular.forEach($scope.displayAttributes, function (value1, key1) {
//                            if (user.attributes.hasOwnProperty(key1)) {
//                                var str = user.attributes[key1].toString();
//                                var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
//                                $scope.displayFields[key1] = finalValue;
//                            } else if (user.hasOwnProperty(key1)) {
//                                var str = user[key1].toString();
//                                var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
//                                $scope.displayFields[key1] = finalValue;
//                            } else {
//                                $scope.displayFields[key1] = '-----';
//                            }
//                        })
                    };

                    $scope.$watch('selectedRow', function () {
                        if ($scope.result.length != 0 && angular.isDefined($scope.selectedRow)) {
                            $scope.selectedUser = $scope.result[$scope.selectedRow];
                            $scope.selectedUserAttributes = $scope.selectedUser.attributes;
                            angular.forEach($scope.displayAttributes, function (value1, key1) {
                                if ($scope.selectedUser.attributes.hasOwnProperty(key1)) {
                                    var finalValue = '';
                                    angular.forEach($scope.selectedUser.attributes[key1], function (memValue, memKey) {
                                        finalValue += memValue + '<br/>';
                                    })
                                    $scope.displayFields[key1] = finalValue;
                                } else if ($scope.selectedUser.hasOwnProperty(key1)) {
                                    var finalValue = '';
                                    angular.forEach($scope.$scope.selectedUser[key1], function (memValue, memKey) {
                                        finalValue += memValue + '<br/>';
                                    })
                                    $scope.displayFields[key1] = finalValue;
                                } else {
                                    $scope.displayFields[key1] = '-----';
                                }
                            })
                        }
                    });

                    $scope.tdHeight = 29;
                    $scope.setItemsByPage = function () {
                        $scope.selectedRow = 0;
                        $('#scrolltable').slimScroll({scrollTo: '0px'});
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
                        //$scope.result = myCache.get('user_list');
                    };
                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: "476px"
                                    //height: $rootScope.listscrolltable.height
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

    sourceModule.controller('searchUserController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$timeout', '$window', 'usersService', 'usersFactory', 'sourceService', 'sourceFactory', 'accessService', 'ngProgress', 'toasterService', 'myCache', 'sourcePageFactory',
                function ($scope, $rootScope, $routeParams, $cookies, $q, $timeout, $window, usersService, usersFactory, sourceService, sourceFactory, accessService, ngProgress, toasterService, myCache, sourcePageFactory)
                {
                    ngProgress.start();
                    $scope.section = 'Users';
                    //$scope.mode = $routeParams.mode;
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    $scope.sourceId = $routeParams.sourceID; // URL source ID
                    /****** Ajax Smart table ****************/

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
                        $scope.isLoading = true;
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
                                $scope.isLoading = false;
                            });
                        } else {
                            $scope.isLoading = false;
                            $scope.sources = null;
                            $scope.sourceLength = 0;
                            $scope.error = '';
                        }
                    };

                    /****** Ajax smart table ends ************/

                    // Close all instances when user clicks elsewhere
//                    $window.onclick = function (event) {
//                        closeWhenClickingElsewhere(event, function () {
//                            $scope.openDropdown = false;
//                            $scope.$apply();
//                        }, 'list_container');
//                    };

                    $scope.openDropdown = false;
                    $scope.openDropdownField = false;
                    $scope.openDropdownSearchHow = false;
                    $scope.opennameDropdown = false;

                    $scope.closeall = function () {
                        if ($scope.openDropdown) {
                            $scope.openDropdown = false;
                        }
                    }

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
                            return false
                        });
                        $(document).mouseup(function () {
                            $('div').removeClass('open_div');
                        });
                    });


                    $scope.setName = function () {
                        $scope.userName = $scope.txtName;
                        angular.element(document.getElementById('name-dropdown')).removeClass("open_div");
                        $scope.txtName = '';
                    }

                    $scope.selectedRow = function (row) {
                        $rootScope.userDetails = angular.fromJson(row);
                        $rootScope.searchData = {
                            sourceId: $scope.sourceId,
                            source: $scope.sourceName,
                            searchColumn: $scope.criteria,
                            searchCondition: $scope.searchHow,
                            searchString: $scope.userName,
                            searchType: $scope.searchType, // Display Key
                            searchField: $scope.searchField, // Display Value
                            usersearchAttributes: $scope.usersearchAttributes
                        };
                    }

                    $scope.searchHow = 'Starts With';
                    $scope.setSearchHow = function (searchHow) {
                        $scope.searchHow = searchHow;
                        $scope.openDropdownSearchHow = false;
                        angular.element(document.getElementById('criteria-dropdown')).removeClass("open_div");
                    }

                    //$scope.searchField = 'Name';
                    $scope.criteria = 'Name';
                    $scope.setSearchField = function (criteria) {
                        //var criteria = $scope.criteria.split("*");
                        var criteria = criteria.split("*");
                        $scope.userName = '';
                        $scope.searchField = criteria[1]; // Display Value
                        $scope.searchType = criteria[0]; // Display Key
                        $scope.selected = '';
                        $scope.openDropdownField = false;
                        angular.element(document.getElementById('field-dropdown')).removeClass("open_div");
                    }


                    //$scope.sourceName = null;
                    $scope.showDefault = true;

                    $scope.notSorted = function (obj) {
                        if (!obj) {
                            return [];
                        }
                        return Object.keys(obj);
                    }

                    $scope.displayAttributes = null;
                    $scope.selectSource = function (sources) {
                        $scope.showRecords = false;
                        angular.element(document.getElementById('source-dropdown')).removeClass("open_div");
                        $scope.sourceName = sources.name;
                        $scope.displayAttributes = sources.userDisplayAttributes;
                        $scope.usersearchAttributes = sources.searchAttributes.userSearchDefaultAttr;
                        $scope.sourceId = sources.id;
                        $scope.openDropdown = false;
                        $scope.search = '';
                        $scope.sources = null;
                        $scope.showDefault = false;
                        $scope.displayName = Object.keys(sources.userDisplayAttributes)[0];
                        $scope.criteria = Object.keys(sources.userDisplayAttributes)[0] + '*' + sources.userDisplayAttributes[Object.keys(sources.userDisplayAttributes)[0]];
                        $scope.searchField = sources.userDisplayAttributes[Object.keys(sources.userDisplayAttributes)[0]];
                        $scope.searchType = Object.keys(sources.userDisplayAttributes)[0];
                        $rootScope.displayColumns = sources.userDisplayAttributes;
                        $scope.displayAttributesLength = Object.keys($scope.displayAttributes).length;
                        $scope.columnWidth = 'width:' + (90 / $scope.displayAttributesLength) + '%';
                    };




                    $scope.usersList = null;
                    $scope.users = [];
                    $scope.usersListLength = 0;
                    $scope.getUsers = function (searchText, highlighsearchText, searchType, sourceId, limit, sortBy, sortHow) {
                        $scope.isListLoading = true;
                        usersFactory.getUsers(searchText, searchType, sourceId, limit, sortBy, sortHow)
                                .then(function (response) {
                                    //$scope.users = response.data.users; 

                                    for (var i = 0; i < Object.keys($scope.displayAttributes).length; i++) {
                                        //window["columnName" + i] = Object.keys($scope.displayAttributes)[i];
                                        $scope["columnName" + i] = Object.keys($scope.displayAttributes)[i];
                                    }
                                    //console.log(response.data.users);
                                    var displayAttributes = {};
                                    angular.forEach(angular.fromJson(response.data.users), function (value, key) {
                                        var displayNames = {};
                                        angular.forEach($scope.displayAttributes, function (value1, key1) {
                                            if (value.attributes.hasOwnProperty(key1)) {
                                                var str = value.attributes[key1].toString();
                                                var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
                                                if (searchType == key1) {
                                                    finalValue = highlighText(finalValue, highlighsearchText, false);
                                                    displayNames[key1] = finalValue;
                                                } else {
                                                    displayNames[key1] = finalValue;
                                                }
                                            }

//                                            } else if (value.hasOwnProperty(key1)) {
//                                                var str = value[key1].toString();
//                                                var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
//                                                if (searchType == key1) {
//                                                    finalValue = highlighText(finalValue, highlighsearchText, false);
//                                                    displayNames[key1] = finalValue;
//                                                } else {
//                                                    displayNames[key1] = finalValue;
//                                                }
//                                                displayNames['link'] = value[key1];
//                                            }
                                            if (!angular.isUndefined(displayNames[key1])) {
                                                displayAttributes[key1] = value1;
                                            }
                                        })

                                        $scope.users.push(displayNames);
                                    });
                                    $scope.displayAttributes = displayAttributes;
                                    $rootScope.displayColumns = displayAttributes;
                                    $scope.columnWidth = 'width:' + (90 / Object.keys($scope.displayAttributes).length) + '%';
                                    $scope.usersListLength = $scope.users.length;
                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.users = null;
                                                $scope.usersListLength = 0;
                                                $scope.listerror = 'No Records Found';
                                            } else {
                                                $scope.users = null;
                                                $scope.usersListLength = 0;
                                                $scope.listerror = $rootScope.getErrorMessage(error, $scope.section);
                                                $scope.listerror = $rootScope.getErrorMessage(error, $scope.section);
                                            }
                                        }
                                ).finally(function () {
                            $scope.isListLoading = false;
                        });
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

                    $scope.listerror = "No Records Found";
                    $scope.showRecords = false;
                    $scope.submitSearch = function () {
                        if (angular.isUndefined($scope.sourceName) || angular.isUndefined($scope.userName) || angular.isUndefined($scope.searchField)) {
                            $scope.showRecords = true;
                            return false;
                        }
                        $scope.showRecords = true;
                        $scope.users = [];
                        var sortHow = 'asc';
                        var limit = 1000;
                        var highlighsearchText = $scope.userName;
                        var searchText = $scope.userName;
                        if (angular.equals($scope.searchHow, 'Contains')) {
                            searchText = '*' + $scope.userName;
                        }
                        $scope.getUsers(searchText, highlighsearchText, $scope.searchType, $scope.sourceId, limit, $scope.searchType, sortHow);

                        if ($scope.usersListLength == 0) {
                            $scope.listerror = "No Records Found";
                        }
                    }

                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#userscrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height,
                            width: '100%'
                        });
                    });

                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: '200px',
                            width: '100%'
                        });
                    });
                    /******Scroll bar setting end*************/


                    if (!angular.isUndefined($rootScope.searchData)) {
                        $scope.displayAttributes = $rootScope.displayColumns;
                        $scope.showDefault = false;
                        $scope.sourceName = $rootScope.searchData.source;
                        $scope.criteria = $rootScope.searchData.searchColumn;
                        $scope.searchHow = $rootScope.searchData.searchCondition;
                        $scope.userName = $rootScope.searchData.searchString;
                        $scope.sourceId = $rootScope.searchData.sourceId;
                        $scope.searchType = $rootScope.searchData.searchType;
                        $scope.searchField = $rootScope.searchData.searchField;
                        $scope.usersearchAttributes = $rootScope.searchData.usersearchAttributes;
                        $scope.columnWidth = 'width:' + (90 / Object.keys($scope.displayAttributes).length) + '%';
                        $scope.displayAttributesLength = Object.keys($scope.displayAttributes).length;
                        $scope.submitSearch();

                    }


                    ngProgress.complete();

                }

            ]);



    sourceModule.controller('viewUserController',
            [
                '$scope', '$rootScope', '$routeParams', '$cookies', '$q', '$timeout', '$window', '$location', 'usersService', 'accessService', 'ngProgress', 'toasterService',
                function ($scope, $rootScope, $routeParams, $cookies, $q, $timeout, $window, $location, usersService, accessService, ngProgress, toasterService)
                {
                    ngProgress.start();
                    $scope.section = 'Users';
                    //$scope.mode = $routeParams.mode;
                    $scope.sourceId = $routeParams.sourceID;
                    $scope.notSorted = function (obj) {
                        if (!obj) {
                            return [];
                        }
                        return Object.keys(obj);
                    }

                    $scope.redirectList = function () {
                        $location.path('/users/' + $scope.sourceId + '/search');
                    }

                    ngProgress.complete();
                }

            ]);



});