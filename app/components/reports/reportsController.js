define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, sourceModule, smartTable, ngScrollbar) {

    sourceModule.controller('reportsController', [
        '$scope', '$rootScope', '$routeParams', '$cookies', '$cookieStore', '$window', 'accessService', 'ngProgress', 'toasterService', 'reportsFactory', 'applicationPageFactory', 'sourcePageFactory', 'usersFactory',
        function ($scope, $rootScope, $routeParams, $cookies, $cookieStore, $window, accessService, ngProgress, toasterService, reportsFactory, applicationPageFactory, sourcePageFactory, usersFactory) {
            ngProgress.start();
            $scope.section = 'Reports';
            var searchText = ""; // Search criteria for users
            var sortHow = 'asc';
            var limit = 1000;
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;

            $rootScope.module = 'reports';

            /* Access Check Validate */
            accessService.checkAccessDeny();
            var arrSort = {
                'asc': 'true',
                'desc': 'reverse'
            };



            $scope.getDropdownIconClass = function () {
                if (!$scope.openDropdown) {
                    return "arrow-down";
                }
                return "arrow-up";
            };

            $scope.isInArray = function (value, array) {
                return array.indexOf(value) > -1;
            }
            
            /*  Get ReportTypes */
            $scope.metadata = null;
            $scope.metadataLength = 0;
            function getReportTypes() {
                $scope.isTypeLoading = true;
                reportsFactory.getReportTypes()
                        .then(function (response) {
                            $scope.metadata = response.data.reports;
                            $scope.metadataLength = Object.keys(response.data.reports).length;
                        },
                                function (error) {
                                    $scope.metadata = null;
                                    var objCustom = {'displayValue': 'ReportType', 'mode': 'fetch'};
                                    $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                    //$scope.error = message;
                                    toasterService.showToastr($scope.error, 'error');
                                }
                        ).finally(function () {
                    $scope.isTypeLoading = false;
                });
            }
            getReportTypes();
            // selected Report Type
            $scope.selectedtype = "";
            $scope.selectType = function (value) {
                $scope.openDropdown = false;
                $scope.showTable = false;
                $scope.result = [];
                $scope.resultListLength = 0;
                $scope.targets = null;
                $scope.selectedtype = value;
                $scope.selectedtype.commonName = value.name;
                $scope.reportType = value.name;
                $scope.invocationURL = value.invocationURL;
                $scope.targetBased = value.targetBased;
                if ($scope.targetBased) {
                    getTargets();
                }
                getPattern($scope.invocationURL);
                
                /*Reset the search field */
                $scope.appName='';
                $scope.targetName ='';
                $scope.sourceName='';
                $scope.userName='';
                angular.forEach($scope.patternInput, function (value, key) {
                    $scope[key]=undefined;
                })
                
            }

            /* Get Targets */
            $scope.targets = null;
            function getTargets() {
                $scope.isTargetLoading = true;
                reportsFactory.getTargets()
                        .then(function (response) {
                            $scope.targets = response.data.targets;
                        },
                                function (error) {
                                    $scope.targets = null;
                                    var objCustom = {'displayValue': 'target', 'mode': 'fetch'};
                                    $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                    //$scope.error = error;
                                    toasterService.showToastr($scope.error, 'error');
                                }
                        ).finally(function () {
                    $scope.isTargetLoading = false;
                });
            }

            /* Selected Target Type */
            $scope.selectedTarget = null;
            $scope.selectTarget = function (value) {
                angular.element(document.getElementById('target-dropdown')).removeClass("open_div");
                $scope.selectedTarget = value;
                $scope.targetName = value.targetName;
                $scope.targetID = value.targetId;
                $scope.patternInput.targetID =value.targetId;
            }

            /* Get userEntitlementsReport/userRoleMatrixReport Pattern (Search Filters) */
            $scope.pattern = null;
            $scope.mandatoryInputFields = [];
            $scope.patternOutput = null;
            $scope.patternInput = null;
            function getPattern(patternType) {
                reportsFactory.getPattern(patternType)
                        .then(function (response) {
                            $scope.pattern = response.data;
                            $scope.patternOutput = $scope.pattern.sampleOutput.values;
                            $scope.patternInput = $scope.pattern.sampleInput;
                            $scope.mandatoryInputFields = $scope.pattern.mandatoryInputFields;
                            $scope.columnWidth = 'width:' + (100 / Object.keys($scope.patternOutput[0]).length) + '%';
                        },
                                function (error) {
                                    $scope.pattern = null;
                                    var objCustom = {'displayValue': $scope.invocationURL, 'mode': 'fetch'};
                                    $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                    //$scope.error = error;
                                    toasterService.showToastr($scope.error, 'error');
                                }
                        ).finally(function () {

                });
            }


            /****** Load the user ******************/
            $scope.users = [];
            $scope.userLength = 0;
            $scope.getUsers = function () {
                var sortHow = 'asc';
                var limit = 100;
                $scope.isUserLoading = true;
                usersFactory.getUsers($scope.searchUser, $scope.searchType, $scope.sid, limit, $scope.searchType, sortHow)
                        .then(function (response) {
                            $scope.users = response.data.users;
                            $scope.userLength = $scope.users.length;
                            $scope.usererror = '';
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

            // Set the user search 
            //$scope.userName = '';
            $scope.setName = function (name) {
                $scope.userName = name;
                $scope.patternInput.userName=name;
                angular.element(document.getElementById('user-name-dropdown')).removeClass("open_div");
                angular.element(document.getElementById('userrole-name-dropdown')).removeClass("open_div");

            }



            /****** Ajax Smart table Start ****************/
            $scope.itemsByPage = $rootScope.itemsByPage;
            $scope.paginationPageSizes = $rootScope.paginationPageSizes;
            var sortBy = 'name';
            var sortHow = 'asc';
            var arrSort = {
                'asc': 'reverse',
                'desc': 'true'
            };
            $scope.sortType = arrSort[sortHow];
            //Load the list of application
            $scope.applications = null;
            $scope.appLength = 0;

            $scope.callServer = function (tableState) {
                $scope.isAppLoading = true;
                var forReport = true;
                //tableState.pagination.numberOfPages =0;
                var pagination = tableState.pagination;
                var start = pagination.start || 0; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || $scope.itemsByPage; // Number of entries showed per page. if pagination.number not found set false .
                //alert(number);
                if (!angular.isUndefined($scope.searchapp) && $scope.searchapp !== '') {
                    applicationPageFactory.getPage(start, number, tableState, sortBy, sortHow, forReport).then(function (result) {
                        if (result.error) {
                            if (result.error.status == 404) {
                                $scope.applications = null;
                                $scope.apperror = 'No Records';
                            } else {
                                $scope.applications = null;
                                $scope.apperror = $rootScope.getErrorMessage(result.error, $scope.section);
                            }
                        } else {
                            $scope.applications = result.data.applications;
                            tableState.pagination.numberOfPages = result.numberOfPages; //set the number of pages so the pagination can update 
                            $scope.appLength = $scope.applications.length;
                            $scope.apperror = '';
                        }
                    }).finally(function () {
                        $scope.isAppLoading = false;
                    });
                }
                {
                    $scope.isAppLoading = false;
                    $scope.applications = null;
                    $scope.appLength = 0;
                    $scope.apperror = '';
                }
            };
            //Load the list of sources
            $scope.sources = null;
            $scope.sourceLength = 0;
            $scope.callSourceServer = function callServer(tableState) {
                var sortBy = 'SOURCE_NAME';
                $scope.isLoading = true;
                tableState.pagination.numberOfPages = 0;
                var pagination = tableState.pagination;
                var start = pagination.start || 0; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                var number = pagination.number || $scope.itemsByPage; // Number of entries showed per page. if pagination.number not found set false .

                if (!angular.isUndefined($scope.searchsource) && $scope.searchsource !== '') {
                    sourcePageFactory.getPage(start, number, tableState, sortBy, sortHow).then(function (result) {
                        if (result.error) {
                            if (result.error.status == 404) {
                                $scope.sources = null;
                                $scope.sourceerror = 'No Records';
                            } else {
                                $scope.sources = null;
                                $scope.sourceerror = $rootScope.getErrorMessage(result.error, $scope.section);
                            }
                        } else {
                            $scope.sources = [];
                            $scope.sources = result.data.sources;
                            tableState.pagination.numberOfPages = result.numberOfPages; //set the number of pages so the pagination can update 
                            $scope.sourceLength = $scope.sources.length;
                            $scope.sourceerror = '';
                        }
                    }).finally(function () {
                        $scope.isLoading = false;
                    });
                } else {
                    $scope.isLoading = false;
                    $scope.sources = null;
                    $scope.sourceLength = 0;
                    $scope.sourceerror = '';
                }
            };
            /****** Ajax smart table ends ************/
            // selected Source 
            $scope.selectedSource = null;
            $scope.selectSource = function (sources) {
                $scope.selectedSource = sources;
                $scope.showRecords = false;
                angular.element(document.getElementById('source-dropdown')).removeClass("open_div");
                $scope.sourceName = sources.name;
                $scope.sid = sources.id;
                $scope.patternInput.sid=sources.id;
                $scope.userSearchType = $scope.selectedSource.searchAttributes.userNameIdentifier;
                $scope.searchType = $scope.userSearchType;
            };
            //Highlight the text after search
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

            // Name Dropdown
            $scope.opentoolbar = function (id) {
//                if (id === 'name-dropdown' && $scope.sourceName == null) {
//                    return false;
//                }
                $(document).ready(function () {
                    $('div').removeClass('open_div');
                });
                if (angular.element(document.getElementById(id)).hasClass("open_div")) {
                    angular.element(document.getElementById(id)).removeClass("open_div");
                } else {

                    angular.element(document.getElementById(id)).addClass("open_div");
                }
            }




            $scope.submitSearch = function () {

                $rootScope.searchData = {
                    userName: $scope.userName,
                    selectApp: $scope.selectApp,
                    aid: $scope.aid,
                    appName: $scope.appName,
                    targetID: $scope.targetID,
                    targetName: $scope.targetName,
                    sid: $scope.sid,
                    sourceName: $scope.sourceName,
                    invocationURL: $scope.invocationURL,
                    selectedtype: $scope.selectedtype,
                    pattern: $scope.pattern,
                    patternOutput: $scope.patternOutput,
                    columnWidth: $scope.columnWidth,
                    reportType: $scope.reportType,
                    patternInput:$scope.patternInput
                };


                $scope.listerror = '';







             
                angular.forEach($scope.patternInput, function (value, key) {
                    $scope.patternInput[key] = $scope[key];
                })

                
                var keepGoing = true;
                angular.forEach($scope.patternInput, function (value, key) {
                    if (keepGoing) {
                        if ($scope.isInArray(key, $scope.mandatoryInputFields)) {
                            if (angular.isUndefined(value) || value=='') {
                                keepGoing = false;
                            }
                        }
                    }

                })
                if (!keepGoing) {
                    //$scope.showRecords = true;
                    return false;
                }


                $scope.showTable = true;
                $scope.getReport();


            }


            // Generate report            
            $scope.result = [];
            $scope.resultListLength = 0;
            $scope.getReport = function () {
                $scope.result = [];
                $scope.resultListLength = 0;
                $scope.isListLoading = true;
                reportsFactory.getReport($scope.invocationURL, $scope.patternInput)
                        .then(function (response) {
                            angular.forEach(response.data.values, function (value, key) {
                                if (value.obligations != null) {
                                    var combineString = '';
                                    var height = 0;
                                    angular.forEach(value.obligations, function (value1, key1) {
                                        combineString += key1==constraint ? '<span class="constraint">'+key1+" : "+value1+'</span><br/>':key1+ " : " + value1 + "<br/>";
                                        //combineString +=  ;
                                        height = height + 29.6;

                                    })
                                    value.obligations = combineString;
                                    value['height'] = ";height:" + height + 'px;';

                                }
                                if(value.appName === null){
                                    value['markRow']=true;
                                }
                                $scope.result[key] = value;
                            })

                            $scope.resultListLength = $scope.result.length;
                            if ($scope.resultListLength == 0) {
                                $scope.listerror = "No Records Found";
                            }
                        },
                                function (error) {
                                    if (error.status == 404) {
                                        $scope.result = null;
                                        $scope.resultListLength = 0;
                                        $scope.listerror = 'No Records Found';
                                    } else {
                                        $scope.result = null;
                                        $scope.resultListLength = 0;
                                        $scope.listerror = $rootScope.getErrorMessage(error, $scope.section);
                                    }
                                }
                        ).finally(function () {
                    $scope.isListLoading = false;
                });
            };
            $scope.notSorted = function (obj) {
                if (!obj) {
                    return [];
                }
                return Object.keys(obj);
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
            $scope.selectApp = null;
            $scope.selectApplication = function (app) {
                $scope.showRecords = false;
                $scope.selectApp = app;
                $scope.appName = app.name;
                $scope.aid = app.id;
                $scope.patternInput.aid = app.id;
                angular.element(document.getElementById('app-dropdown')).removeClass("open_div");
            };


            if (!angular.isUndefined($rootScope.searchData)) {
                $scope.invocationURL = $rootScope.searchData.invocationURL;
                $scope.userName = $rootScope.searchData.userName;
                $scope.aid = $rootScope.searchData.aid;
                $scope.appName = $rootScope.searchData.appName;
                $scope.targetID = $rootScope.searchData.targetID;
                $scope.targetName = $rootScope.searchData.targetName;
                $scope.sid = $rootScope.searchData.sid;
                $scope.sourceName = $rootScope.searchData.sourceName;
                $scope.selectedtype = $rootScope.searchData.selectedtype;
                $scope.pattern = $rootScope.searchData.pattern;
                $scope.patternOutput = $rootScope.searchData.patternOutput;
                $scope.columnWidth = $rootScope.searchData.columnWidth;
                $scope.reportType = $rootScope.searchData.reportType;
                $scope.patternInput = $rootScope.searchData.patternInput;
                $scope.submitSearch();
            }

            // Close all instances when user clicks elsewhere
            $window.onclick = function (event) {
                closeWhenClickingElsewhere(event, function () {
                    $scope.openDropdown = false;
                    $scope.$apply();
                }, 'list_container');
            };

            /******Scroll bar setting start*************/
            $scope.$applyAsync(function () {
                $('.scrolltable').slimScroll({
                    height: '200px',
                    width: '100%'
                });

                $('#userscrolltable').slimScroll({
                    height: '210px',
                    width: '100%'
                });

                $('#sourcescrolltable').slimScroll({
                    height: '210px',
                    width: '100%'
                });

                $('#appscrolltable').slimScroll({
                    height: '210px',
                    width: '100%'
                });


                $('.reportscrolltable').slimScroll({
                    height: $rootScope.listscrolltable.height,
                    width: '100%'
                });
            });


            /******Scroll bar setting end*************/
            ngProgress.complete();
        }

    ]);
});
