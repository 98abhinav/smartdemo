define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, sourceModule, smartTable, ngScrollbar) {

    sourceModule.controller('groupsController', [
        '$scope', '$rootScope', '$routeParams', '$cookies', '$cookieStore', 'groupsService', 'groupsFactory', 'sourceService', 'sourceFactory', 'accessService', '$q', 'ngProgress', 'toasterService', 'myCache',
        function ($scope, $rootScope, $routeParams, $cookies, $cookieStore, groupsService, groupsFactory, sourceService, sourceFactory, accessService, $q, ngProgress, toasterService, myCache) {
            ngProgress.start();

            $scope.section = 'Groups';
            $scope.activeLetter = '';
            $scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            var searchText = ""; // Search criteria for users
            //var sortBy = 'cn';
            var sortHow = 'asc';
            var limit = 1000;
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;
            //$scope.error = "Please select alphabet to view group.";

            /* Access Check Validate */
            accessService.checkAccessDeny();

            var arrSort = {
                'asc': 'true',
                'desc': 'reverse'
            };



            if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                $scope.itemsByPage = $rootScope.paginationStore.group.paginationSize;
                $scope.sortType = arrSort[$rootScope.paginationStore.group.orderBy];
            } else {
                $scope.itemsByPage = $cookieStore.get('paginationStore').group.paginationSize;
                $scope.sortType = arrSort[$cookieStore.get('paginationStore').group.orderBy];
            }


            $scope.groups = null;
            $scope.result = [];


            $scope.getGroups = function (searchText, searchType, sourceId, limit, sortBy, sortHow) {
                $scope.isLoading = true;
                groupsFactory.getGroups(searchText, searchType, sourceId, limit, sortBy, sortHow)
                        .then(function (response) {
                            $scope.selectedRow = 0;
                            $scope.result = response.data.groups;
                            $scope.restResponse = $scope.result;
                            /* Show the first row details from response Start*/
                            $scope.selectedGroup = $scope.result[0];
                            $scope.selectedGroupAttribute = $scope.selectedGroup.attributes;
                            angular.forEach($scope.displayAttributes, function (value1, key1) {
                                if ($scope.selectedGroup.attributes.hasOwnProperty(key1)) {
                                    var finalValue='';
                                    angular.forEach($scope.selectedGroup.attributes[key1], function (memValue, memKey) {
                                        finalValue += memValue + '<br/>';
                                    })
                                    
                                    //var str = $scope.selectedGroup.attributes[key1].toString();
                                    //var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
                                    $scope.displayFields[key1] = finalValue;
                                } else if ($scope.selectedGroup.hasOwnProperty(key1)) {
                                    var finalValue='';
                                    angular.forEach($scope.selectedGroup[key1], function (memValue, memKey) {
                                        finalValue += memValue + '<br/>';
                                    })
                                    
                                    //var str = $scope.selectedGroup[key1].toString();
                                    //var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
                                    $scope.displayFields[key1] = finalValue;
                                } else {
                                    $scope.displayFields[key1] = '-----';
                                }
                            })
                            /* Show the first row details from response Ends*/

                            //myCache.put('group_list', $scope.result);
                            if ($scope.result.length) {
                                $scope.activeLetter = $scope.result[0].name.charAt(0).toUpperCase();
                            }
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

            $scope.setActiveLetter = function (letter) {
                myCache.remove('group_list');
                $scope.activeLetter = letter;
                $scope.search = '';
                $scope.getGroups(letter, $scope.searchType, sourceId, limit, $scope.searchType, sortHow);
            }

            $scope.setSearchField = function (criteria) {
                var criteria = criteria.split("*");
                $scope.searchField = criteria[1]; // Display Value
                $scope.searchType = criteria[0]; // Display Key                      
                angular.element(document.getElementById('field-dropdown')).removeClass("open_div");
            }

            $scope.setSortOrder = function () {
                if (angular.element(document.getElementById('stsort')).hasClass("st-sort-descent")) {
                    $rootScope.paginationStore.group.orderBy = "desc";
                } else {
                    $rootScope.paginationStore.group.orderBy = "asc";

                }
                $cookieStore.put('paginationStore', $rootScope.paginationStore);
            };

            $scope.notSorted = function (obj) {
                if (!obj) {
                    return [];
                }
                return Object.keys(obj);
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
                                if (value.name.indexOf(search) == 0)
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
//                var arrSearchBy = {
//                    'username': 'name',
//                    'email': 'attributes.mail',
//                    'phoneno': 'attributes.telephoneNumber'
//                };
//                var searchBy = document.getElementById('criteria').value;
//                $scope.searchBy = arrSearchBy[searchBy];
//                $scope.result = searchJson(myCache.get('group_list'), searchBy, $scope.search);
//                if ($scope.result.length) {
//                    $scope.groupDetailsSearch = {
//                        name: $scope.result[0].name,
//                        sid: $scope.result[0].sid,
//                        attributes: $scope.result[0].attributes
//                    };
//                    $scope.selectGroup($scope.groupDetailsSearch);
//                } else {
//                    $scope.error = "No Records Found";
//                }
                if (angular.isUndefined($scope.search) || $scope.search == '') {
                    $scope.search = '';
                    $scope.placeholder = "Please enter the serach criteria.";
                    angular.element(document.getElementById('groupSerach')).addClass("required");
                    return false;
                }
                $scope.getGroups($scope.search, $scope.searchType, sourceId, limit, $scope.searchType, sortHow);


                if ($scope.result != null) {
                    $scope.groupDetails = {
                        name: $scope.result[0].name,
                        sid: $scope.result[0].sid,
                        attributes: $scope.result[0].attributes
                    };
                    $scope.selectGroup($scope.groupDetails);
                } else {
                    $scope.error = "No Records Found";
                    $scope.activeLetter = '';
                }


            }
            $scope.removeClass = function () {
                angular.element(document.getElementById('groupSerach')).removeClass("required");
            }




            $rootScope.module = 'groups';

            var sourceId = $routeParams.sourceID; // URL source ID                   

            $scope.groups;
            $scope.group;
            $scope.source;
            $scope.groupsearchAttributes = 'cn';
            /*  Get Source by ID */
            function getSource(id) {
                sourceFactory.getSource(id)
                        .then(function (response) {
                            $scope.source = response.data;
                            $scope.sourceName = $scope.source.name;
                            $scope.sourceConnType = $scope.source.connectionType;
                            $scope.displayAttributes = response.data.groupDisplayAttributes;
                            $scope.groupsearchAttributes = response.data.searchAttributes.groupSearchDefaultAttr;
                            //$scope.searchType = Object.keys(response.data.groupDisplayAttributes)[0];
                            //$scope.searchField = response.data.groupDisplayAttributes[Object.keys(response.data.groupDisplayAttributes)[0]];
                            $scope.searchType = response.data.searchAttributes.groupNameIdentifier;
                            $scope.searchField = response.data.userDisplayAttributes[response.data.searchAttributes.groupNameIdentifier];
                            $scope.setActiveLetter('A');
                        },
                                function (error) {
                                    $scope.error = $rootScope.getErrorMessage(error, $scope.section);
                                }
                        );
            }
            ;
            getSource(sourceId);

            /* Select First Record from the list and show details */
            $scope.$on('FirstRecord', function (event) {
                $scope.groupDetails = {
                    name: $scope.groups[0].name,
                    sid: $scope.groups[0].sid,
                    attributes: $scope.groups[0].attributes
                };
                $scope.selectGroup($scope.groupDetails);
            });

            $scope.selectedGroupDetails = null;
            $scope.selectedGroupAttribute = [];
            $scope.selectedGroupAttributeCount = 0;

            $scope.displayFields = {};
            $scope.selectedRow = 0;
            $scope.selectGroup = function (group, index) {
                $scope.selectedRow = index;
                $scope.selectedGroupCount = 0;
                $scope.noDescription = false;
                //$scope.selectedGroup = group;
                //$scope.selectedGroupAttribute = group.attributes;
                //$scope.selectedGroupAttributeCount = group.attributes.uniqueMember.length;
                //$scope.selectedGroupAttribute = group.attributes.uniqueMember;

                $scope.showInfo = true;

//                angular.forEach($scope.displayAttributes, function (value1, key1) {
//                    if (group.attributes.hasOwnProperty(key1)) {
//                        var str = group.attributes[key1].toString();
//                        var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
//                        $scope.displayFields[key1] = finalValue;
//                    } else if (group.hasOwnProperty(key1)) {
//                        var str = group[key1].toString();
//                        var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
//                        $scope.displayFields[key1] = finalValue;
//                    } else {
//                        $scope.displayFields[key1] = '-----';
//                    }
//                })

            };

            $scope.$watch('selectedRow', function () {
                if ($scope.result.length != 0 && angular.isDefined($scope.selectedRow)) {
                    $scope.selectedGroup = $scope.result[$scope.selectedRow];
                    $scope.selectedGroupAttribute = $scope.selectedGroup.attributes;
                    angular.forEach($scope.displayAttributes, function (value1, key1) {
                        if ($scope.selectedGroup.attributes.hasOwnProperty(key1)) {
                            var finalValue='';
                            angular.forEach($scope.selectedGroup.attributes[key1], function (memValue, memKey) {
                                finalValue += memValue + '<br/>';
                            })
                            //var str = $scope.selectedGroup.attributes[key1].toString();
                            //var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
                            $scope.displayFields[key1] = finalValue;
                        } else if ($scope.selectedGroup.hasOwnProperty(key1)) {
                            var finalValue='';
                            angular.forEach($scope.selectedGroup[key1], function (memValue, memKey) {
                                finalValue += memValue + '<br/>';
                            })
                            //var str = $scope.selectedGroup[key1].toString();
                            //var finalValue = str.replace('["', "").trim().replace('"]', "").trim();
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
                $scope.result = myCache.get('group_list');
            };

            /******Scroll bar setting start*************/
            $scope.$applyAsync(function () {
                $('#scrolltable').slimScroll({
                    //height: "476px"
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
                $('#scrollattribute').slimScroll({
                    height: $rootScope.listscrollrightinnerdiv.height
                });
            });
            /******Scroll bar setting end*************/
            ngProgress.complete();



        }

    ]);
    //    sourceModule.config(function (stConfig) {
    //        stConfig.pagination.template = 'shared/right-pagination.html';
    //    });

});
