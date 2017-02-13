define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar', 'acuteSelect', 'vAccordion'], function (app, sourceModule, smartTable, ngScrollbar, acuteSelect, vAccordion)
{

    sourceModule.controller('sourceController',
            [
                '$scope', '$rootScope', '$cookies', '$cookieStore', '$routeParams', '$location', '$timeout', 'sourceFactory', 'sourceService', 'sourcePageFactory', 'accessService', 'ngProgress', 'toasterService', '$route',
                function ($scope, $rootScope, $cookies, $cookieStore, $routeParams, $location, $timeout, sourceFactory, sourceService, sourcePageFactory, accessService, ngProgress, toasterService, $route)
                {

                    ngProgress.start();

                    var message;
                    $rootScope.module = 'sources';
                    $scope.section = 'Source';
                    $scope.applicationId = $routeParams.applicationID; // application ID

                    /* Access Check Validate */
                    accessService.checkAccessDeny();

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.source.DELETE_CONFIRM + $scope.selectedSource.name + '?';
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteSource($scope.id);
                    });

                    function deleteSource(id) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.selectedSource.name, 'mode': 'delete'};

                        sourceFactory.deleteSource(id)
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

                    /****** Ajax Smart table ****************/
                    var applicationId = $routeParams.applicationID; // Application ID
                    
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    $scope.rightPageinationPerPage = 5;
                    var sortBy = 'SOURCE_NAME';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                    //$scope.sortType = arrSort[sortHow];
                    
                    
                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.itemsByPage = $rootScope.paginationStore.source.paginationSize;
                        $scope.sortType_source = arrSort[$rootScope.paginationStore.source.orderBy];
                    } else {
                        $scope.itemsByPage = $cookieStore.get('paginationStore').source.paginationSize;
                        $scope.sortType_source = arrSort[$cookieStore.get('paginationStore').source.orderBy];
                    }
                    
                    
                    $scope.sources = [];

                    $scope.callServer = function callServer(tableState) {
                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        if (number) {
                            if ($rootScope.previousRoute != $rootScope.currentRoute
                                    && !angular.isUndefined($rootScope.previousRoute)) {
                                number = $cookieStore.get('paginationStore').source.paginationSize;
                                $scope.itemsByPage = number;
                                $scope.tdHeight = $rootScope.scrollBy[$scope.itemsByPage];
                                $rootScope.previousRoute = undefined;
                            }
                            $scope.selectedRow = 0;
                            $rootScope.paginationStore.source.paginationSize = parseInt(number);
                            $rootScope.paginationStore.source.orderBy = tableState.sort.reverse ? 'desc' : 'asc';
                            $cookieStore.put('paginationStore', $rootScope.paginationStore);
                            if (!$scope.search) {
                                $scope.searchBox = false;
                                $scope.search = '';
                            }
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
                                    $scope.restResponse = result.data.sources;
                                    /* Show the first row details from response Start*/
                                    $scope.connectionAttributes = [];
                                    $scope.selectedSource = $scope.sources[0];
                                    if ($scope.selectedSource.connectionAttributes != undefined) {
                                        $scope.selectedSourceCACount = Object.keys($scope.selectedSource.connectionAttributes).length;
                                    }
                                    if ($scope.selectedSource.userDisplayAttributes != undefined) {
                                        $scope.selectedSourceUserDACount = Object.keys($scope.selectedSource.userDisplayAttributes).length;
                                    }
                                    if ($scope.selectedSource.groupDisplayAttributes != undefined) {
                                        $scope.selectedSourceGroupDACount = Object.keys($scope.selectedSource.groupDisplayAttributes).length;
                                    }
                                    $scope.showInfo = true;

                                    angular.forEach($scope.selectedSource.connectionAttributes, function (value, key) {
                                        $scope.connectionAttributes.push(key + " : " + value);
                                    })
                                    /* Show the first row details from response Ends*/
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
                    };

                    /****** Ajax smart table ends ************/

                    /* Select First Record from the list and show details */
                    $scope.$on('FirstRecord', function (event) {
                        $scope.sourceDetails = {
                            id: $scope.sources[0].id,
                            name: $scope.sources[0].name,
                            connectionType: $scope.sources[0].connectionType,
                            connectionManager: $scope.sources[0].connectionManager,
                            connectionAttributes: $scope.sources[0].connectionAttributes,
                            userDisplayAttributes: $scope.sources[0].userDisplayAttributes,
                            groupDisplayAttributes: $scope.sources[0].groupDisplayAttributes,
                            searchAttributes: $scope.sources[0].searchAttributes
                        };
                        $scope.selectSource($scope.sourceDetails);
                    });

                    $scope.selectedSourceCACount = 0;
                    $scope.selectedSourceUserDACount = 0;
                    $scope.selectedSourceGroupDACount = 0;
                    $scope.connectionAttributes = [];
                    $scope.selectedRow = 0;
                    $scope.selectSource = function (sourceDetails, index) {
                        $scope.selectedRow = index;
//                        $scope.connectionAttributes = [];
//                        $scope.selectedSource = sourceDetails;
//                        if (sourceDetails.connectionAttributes != undefined) {
//                            $scope.selectedSourceCACount = Object.keys(sourceDetails.connectionAttributes).length;
//                        }
//                        if (sourceDetails.userDisplayAttributes != undefined) {
//                            $scope.selectedSourceUserDACount = Object.keys(sourceDetails.userDisplayAttributes).length;
//                        }
//                        if (sourceDetails.groupDisplayAttributes != undefined) {
//                            $scope.selectedSourceGroupDACount = Object.keys(sourceDetails.groupDisplayAttributes).length;
//                        }
//                        $scope.showInfo = true;
//
//                        angular.forEach(sourceDetails.connectionAttributes, function (value, key) {
//                            $scope.connectionAttributes.push(key + " : " + value);
//                        })


                    };

                    $scope.$watch('selectedRow', function () {
                        if ($scope.sources.length != 0) {
                            $scope.connectionAttributes = [];
                            $scope.selectedSource = $scope.sources[$scope.selectedRow];
                            ;
                            if ($scope.selectedSource.connectionAttributes != undefined) {
                                $scope.selectedSourceCACount = Object.keys($scope.selectedSource.connectionAttributes).length;
                            }
                            if ($scope.selectedSource.userDisplayAttributes != undefined) {
                                $scope.selectedSourceUserDACount = Object.keys($scope.selectedSource.userDisplayAttributes).length;
                            }
                            if ($scope.selectedSource.groupDisplayAttributes != undefined) {
                                $scope.selectedSourceGroupDACount = Object.keys($scope.selectedSource.groupDisplayAttributes).length;
                            }
                            $scope.showInfo = true;

                            angular.forEach($scope.selectedSource.connectionAttributes, function (value, key) {
                                $scope.connectionAttributes.push(key + " : " + value);
                            })
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



                    $scope.attributesearchIcon = true;
                    $scope.startViewSearch = function (searchType) {
                        switch (searchType) {
                            case 'attribute':
                                $scope.attributesearchBox = true;
                                $scope.attributefocusInput = true;
                                break;
                        }

                    };

                    $scope.endViewSearch = function (searchType) {
                        switch (searchType) {
                            case 'attribute':
                                $scope.attributesearchBox = false;
                                $scope.search_user = '';
                                break;

                        }
                    };

                    $scope.goToUsers = function (id) {
                        $location.path(id + '/users');
                    };

                    $scope.goToGroups = function (id) {
                        $location.path(id + '/groups');
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
                            width: $rootScope.listscrollrightdiv.width,
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


    sourceModule.controller('manageSourceController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'sourceFactory', 'sourceService', 'accessService', 'ngProgress', 'toasterService', '$timeout', '$filter',
                function ($scope, $rootScope, $cookies, $routeParams, $location, sourceFactory, sourceService, accessService, ngProgress, toasterService, $timeout, $filter)
                {
                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    $rootScope.module = 'sources';
                    $scope.section = 'Source';
                    $scope.sources;
                    $scope.source;
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.sourceId = $routeParams.sourceID; // Source ID
                    $scope.metadata;
                    $scope.sourceType = "";
                    $scope.selectedtype = "";

                    $scope.timeBasedConnAttr = ['searchTimeOut', 'com.sun.jndi.ldap.connect.timeout', 'com.sun.jndi.ldap.read.timeout'];


                    /* Access Check */
                    accessService.checkAccess($rootScope.module, $scope.section, 'super');

                    $scope.source = {
                        //'connectionType': '',
                        'name': '',
                        'connectionManager': '',
                        'connectionAttributes': [],
                        'displayAttributesUser': [],
                        'displayAttributesGroup': [],
                        //'searchAttributes': {},
                        'userSearchDefaultAttrCustom': '',
                        'groupSearchDefaultAttrCustom': ''
                    };
                    /*$scope.userSearchDefaultAttr = '';
                     $scope.groupSearchDefaultAttr = '';*/
                    $scope.userSearchDefaultAttr;
                    $scope.groupSearchDefaultAttr;
                    //$scope.connectionType = '';

                    getSourceMetadata();
                    if ($scope.mode == 'edit') {
                        $timeout(function () {
                            getSource($scope.sourceId);
                        }, 1000);
                    }

                    $scope.addNewConnectionAttribute = function (obj)
                    {
                        if ($scope.source.connectionAttributes.length >= 20) {
                            alert('Maximum limit for Connection Attributes exceeded.');
                            return;
                        }
                        var customAttrObj = {'name': '', 'value': '', 'placeholder': '', 'type': 'custom'};
                        var itemObj = (obj != undefined) ? obj : customAttrObj;
                        $scope.source.connectionAttributes.push(itemObj);

                        if (obj == undefined) {
                            //$(document).scrollTop($(document).height());
                            //console.log($('#conn-attr-accord').height());
                            var panePosition = $('#conn-attr-accord').offset().top;
                            $(document).scrollTop(panePosition);
                        }
                    }
                    $scope.removeConnectionAttribute = function (index)
                    {
                        $scope.source.connectionAttributes.splice(index, 1);
                    }

                    $scope.addNewDisplayAttribute = function (sourcetype, obj)
                    {
                        if (sourcetype == undefined) {
                            return;
                        }

                        var customAttrObj = {'name': '', 'value': '', 'placeholder': '', 'type': 'custom'};
                        var itemObj = (obj != undefined) ? obj : customAttrObj;

                        if (sourcetype == 'group') {
                            if ($scope.source.displayAttributesGroup.length >= 5) {
                                alert('Maximum limit for Group Display Attributes exceeded.');
                                return;
                            }
                            $scope.source.displayAttributesGroup.push(itemObj);
                            if (obj == undefined) {
                                var panePosition = $('#grp-disp-attr-accord').offset().top;
                                $(document).scrollTop(panePosition);
                            }
                        } else {
                            if ($scope.source.displayAttributesUser.length >= 10) {
                                alert('Maximum limit for User Display Attributes exceeded.');
                                return;
                            }
                            $scope.source.displayAttributesUser.push(itemObj);
                            if (obj == undefined) {
                                var panePosition = $('#usr-disp-attr-accord').offset().top;
                                $(document).scrollTop(panePosition);
                            }
                        }
                    }
                    $scope.removeDisplayAttribute = function (sourcetype, index)
                    {
                        if (sourcetype == undefined) {
                            return;
                        }
                        if (sourcetype == 'group') {
                            $scope.source.displayAttributesGroup.splice(index, 1);
                        } else {
                            $scope.source.displayAttributesUser.splice(index, 1);
                        }
                    }

                    $scope.submitData = function (source, mode, isValid)
                    {
                        if (!isValid) {
                            $(document).scrollTop(0);
                            return;
                        }
                        var caObj = {}, daUsrObj = {}, daGrpObj = {};
                        var connectionAttributes = source.connectionAttributes;
                        for (var i = 0; i < connectionAttributes.length; i++) {
                            var name = connectionAttributes[i].name;
                            var value = connectionAttributes[i].value;
                            if (name != "" && value != "") {
                                caObj[name] = value;
                            }
                        }

                        var displayAttributesUser = source.displayAttributesUser;
                        for (var i = 0; i < displayAttributesUser.length; i++) {
                            var name = displayAttributesUser[i].name;
                            var value = displayAttributesUser[i].value;
                            if (name != "" && value != "") {
                                daUsrObj[name] = value;
                            }
                        }
                        var displayAttributesGroup = source.displayAttributesGroup;
                        for (var i = 0; i < displayAttributesGroup.length; i++) {
                            var name = displayAttributesGroup[i].name;
                            var value = displayAttributesGroup[i].value;
                            if (name != "" && value != "") {
                                daGrpObj[name] = value;
                            }
                        }

                        /*var saObj = {
                         'userSearchDefaultAttr' : ($scope.userSearchDefaultAttr!=null) ? $scope.userSearchDefaultAttr.name : source.userSearchDefaultAttrCustom,
                         'groupSearchDefaultAttr' : ($scope.groupSearchDefaultAttr!=null) ? $scope.groupSearchDefaultAttr.name : source.groupSearchDefaultAttrCustom
                         };*/
                        var saObj = {};
                        var sourceSubmittableData = {
                            'connectionType': $scope.selectedtype.commonName,
                            'name': source.name,
                            'connectionManager': source.connectionManager,
                            'connectionAttributes': caObj,
                            'userDisplayAttributes': daUsrObj,
                            'groupDisplayAttributes': daGrpObj,
                            'searchAttributes': saObj
                        };
                        //console.log(JSON.stringify(sourceSubmittableData));

                        // Add Source
                        if (mode == 'add') {
                            //sourceSubmittableData.connectionType = source.connectionType.commonName;
                            $scope.insertSource(sourceSubmittableData);
                        }

                        // Edit Application
                        if (mode == 'edit') {
                            //sourceSubmittableData.connectionType = source.connectionType;
                            $scope.updateSource(source.id, sourceSubmittableData);
                        }
                    }

                    /* ## Manage Source Starts ## */

                    /*  Get Source Metadata */
                    function getSourceMetadata() {
                        sourceFactory.getSourceMetadata()
                                .then(function (response) {
                                    $scope.metadata = response.data.data;
                                    /*var customObj = {"commonName":"CUSTOM"};
                                     $scope.metadata.push(customObj);*/
                                },
                                        function (error) {
                                            var objCustom = {'displayValue': id, 'mode': 'fetch'};
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                );
                    }

                    $scope.selectType = function (value, sourceData)
                    {
                        $scope.source.connectionAttributes = [];
                        $scope.source.displayAttributesUser = [];
                        $scope.source.displayAttributesGroup = [];
                        /*$scope.source.searchAttributes = {
                         'userSearchDefaultAttr' : '',
                         'groupSearchDefaultAttr' : ''
                         };*/

                        $scope.userSearchDefaultAttr = null;
                        $scope.groupSearchDefaultAttr = null;
                        $scope.selectedtype = value;

                        if (sourceData != undefined) {
                            //console.log(sourceData);
                            $scope.source.id = sourceData.id;
                            //$scope.connectionType = sourceData.connectionType;
                            $scope.source.name = sourceData.name;
                            $scope.source.connectionManager = sourceData.connectionManager;

                            //$scope.userSearchDefaultAttr = (sourceData.searchAttributes.userSearchDefaultAttr!=undefined) ? sourceData.searchAttributes.userSearchDefaultAttr : '';
                            //$scope.groupSearchDefaultAttr = (sourceData.searchAttributes.groupSearchDefaultAttr!=undefined) ? sourceData.searchAttributes.groupSearchDefaultAttr : '';
                            var source_connectionAttributes = sourceData.connectionAttributes;
                            var source_displayAttributesUser = sourceData.userDisplayAttributes;
                            var source_displayAttributesGroup = sourceData.groupDisplayAttributes;

                            /*$scope.userSearchDefaultAttr = { name : sourceData.searchAttributes.userSearchDefaultAttr };
                             $scope.groupSearchDefaultAttr = { name : sourceData.searchAttributes.groupSearchDefaultAttr };*/

                            $scope.source.userSearchDefaultAttrCustom = sourceData.searchAttributes.userSearchDefaultAttr;
                            $scope.source.groupSearchDefaultAttrCustom = sourceData.searchAttributes.groupSearchDefaultAttr;
                        }

                        /***** Fetch CONNECTION ATTRIBUTES start *****/
                        //if ($scope.selectedtype.commonName!='CUSTOM') {
                        var mandatoryAttributes = $scope.selectedtype.mandatoryConnectionAttributesWithSampleValues;
                        for (var key in mandatoryAttributes) {
                            if (mandatoryAttributes.hasOwnProperty(key)) {
                                var caValue = "";
                                if (source_connectionAttributes != undefined && source_connectionAttributes.hasOwnProperty(key)) {
                                    caValue = source_connectionAttributes[key];
                                    delete source_connectionAttributes[key];
                                }
                                var itemObj = {'name': key, 'value': caValue, 'placeholder': mandatoryAttributes[key], 'type': 'mandatory'};
                                $scope.addNewConnectionAttribute(itemObj);
                            }
                        }

                        var optionalAttributes = $scope.selectedtype.optionalConnectionAttributesWithSampleValues;
                        for (var key in optionalAttributes) {
                            if (optionalAttributes.hasOwnProperty(key)) {
                                var caValue = "";
                                if (source_connectionAttributes != undefined && source_connectionAttributes.hasOwnProperty(key)) {
                                    caValue = source_connectionAttributes[key];
                                    delete source_connectionAttributes[key];
                                }
                                var itemObj = {'name': key, 'value': caValue, 'placeholder': optionalAttributes[key], 'type': 'optional'};
                                $scope.addNewConnectionAttribute(itemObj);
                            }
                        }
                        //}

                        //Fetch custom Connection Attributes, if any (edit mode only)
                        if (source_connectionAttributes != undefined) {
                            for (var key in source_connectionAttributes) {
                                if (source_connectionAttributes.hasOwnProperty(key)) {
                                    var caValue = source_connectionAttributes[key];
                                    var itemObj = {'name': key, 'value': caValue, 'placeholder': '', 'type': 'custom'};
                                    $scope.addNewConnectionAttribute(itemObj);
                                }
                            }
                        }

                        for (var i = $scope.source.connectionAttributes.length; i < 1; i++) {
                            $scope.addNewConnectionAttribute();
                        }
                        /***** Fetch CONNECTION ATTRIBUTES end *****/

                        /***** Fetch DISPLAY ATTRIBUTES start *****/
                        //if ($scope.selectedtype.commonName!='CUSTOM') {
                        var displayAttributesUser = $scope.selectedtype.displayNamesForSourceUserAttributes;
                        for (var key in displayAttributesUser) {
                            if (displayAttributesUser.hasOwnProperty(key)) {
                                var daValue = "";
                                if (source_displayAttributesUser != undefined && source_displayAttributesUser.hasOwnProperty(key)) {
                                    daValue = source_displayAttributesUser[key];
                                    delete source_displayAttributesUser[key];
                                }
                                var type = 'optional';
                                var itemObj = {'name': key, 'value': daValue, 'placeholder': displayAttributesUser[key], 'type': type};
                                $scope.addNewDisplayAttribute('user', itemObj);
                            }
                        }

                        var displayAttributesGroup = $scope.selectedtype.displayNamesForSourceGroupAttributes;
                        for (var key in displayAttributesGroup) {
                            if (displayAttributesGroup.hasOwnProperty(key)) {
                                var daValue = "";
                                if (source_displayAttributesGroup != undefined && source_displayAttributesGroup.hasOwnProperty(key)) {
                                    daValue = source_displayAttributesGroup[key];
                                    delete source_displayAttributesGroup[key];
                                }
                                var type = 'optional';
                                var itemObj = {'name': key, 'value': daValue, 'placeholder': displayAttributesGroup[key], 'type': type};
                                $scope.addNewDisplayAttribute('group', itemObj);
                            }
                        }
                        //}

                        //Fetch custom Display Attributes, if any (edit mode only)
                        if (source_displayAttributesUser != undefined) {
                            for (var key in source_displayAttributesUser) {
                                if (source_displayAttributesUser.hasOwnProperty(key)) {
                                    var daValue = source_displayAttributesUser[key];
                                    var itemObj = {'name': key, 'value': daValue, 'placeholder': '', 'type': 'custom'};
                                    $scope.addNewDisplayAttribute('user', itemObj);
                                }
                            }
                        }
                        if (source_displayAttributesGroup != undefined) {
                            for (var key in source_displayAttributesGroup) {
                                if (source_displayAttributesGroup.hasOwnProperty(key)) {
                                    var daValue = source_displayAttributesGroup[key];
                                    var itemObj = {'name': key, 'value': daValue, 'placeholder': '', 'type': 'custom'};
                                    $scope.addNewDisplayAttribute('group', itemObj);
                                }
                            }
                        }

                        //If Display Attributes are less than 1, add an empty Display attribute
                        for (var i = $scope.source.displayAttributesUser.length; i < 1; i++) {
                            $scope.addNewDisplayAttribute('user');
                        }
                        for (var i = $scope.source.displayAttributesGroup.length; i < 1; i++) {
                            $scope.addNewDisplayAttribute('group');
                        }
                        /***** Fetch DISPLAY ATTRIBUTES end *****/

                        if (sourceData != undefined) {
                            if (sourceData.searchAttributes.userSearchDefaultAttr != undefined) {
                                var userSearchDefaultAttr = $filter('filter')($scope.source.displayAttributesUser, {'name': sourceData.searchAttributes.userSearchDefaultAttr});
                                if (userSearchDefaultAttr[0] != undefined) {
                                    //$scope.userSearchDefaultAttr = userSearchDefaultAttr[0].name;
                                    $scope.userSearchDefaultAttr = {name: userSearchDefaultAttr[0].name};
                                }

                            }
                            if (sourceData.searchAttributes.groupSearchDefaultAttr != undefined) {
                                var groupSearchDefaultAttr = $filter('filter')($scope.source.displayAttributesGroup, {'name': sourceData.searchAttributes.groupSearchDefaultAttr});
                                if (groupSearchDefaultAttr[0] != undefined) {
                                    //$scope.groupSearchDefaultAttr = groupSearchDefaultAttr[0].name;
                                    $scope.groupSearchDefaultAttr = {name: groupSearchDefaultAttr[0].name};
                                }
                            }

                        }

                    }

                    $scope.selectSearchAttr = function (value, attrtype)
                    {
                        if (attrtype == 'user') {
                            //$scope.userSearchDefaultAttr = value;
                            $scope.userSearchDefaultAttr = {name: value.name};
                        } else if (attrtype == 'group') {
                            //$scope.groupSearchDefaultAttr = value;
                            $scope.groupSearchDefaultAttr = {name: value.name};
                        }
                    }

                    /*  Get Source by ID */
                    function getSource(id) {
                        sourceFactory.getSource(id)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    var sourceGetData = response.data;

                                    var sourceMetadata = $filter('filter')($scope.metadata, {'commonName': sourceGetData.connectionType})[0];
                                    $scope.selectType(sourceMetadata, sourceGetData);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            var objCustom = {'displayValue': id, 'mode': 'fetch'};
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            toasterService.hideToastr(false);
                        });
                    }

                    /* Insert New Source */
                    $scope.insertSource = function (source) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': source.name, 'mode': 'insert'};

                        sourceFactory.insertSource(source)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = '/sources';
                                    toasterService.showToastr(message, 'success', redirectpath);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            var objCustom = {'displayValue': source.name, 'mode': 'insert'};
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            toasterService.hideToastr(false);
                            $scope.updateLoadedSource();
                        });
                    };

                    /* Update Source */
                    $scope.updateSource = function (id, source) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': source.name, 'mode': 'update'};

                        sourceFactory.updateSource(id, source)
                                .then(function () {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = '/sources';
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
                            $scope.updateLoadedSource();
                        });
                    };


 
                    /* Update the source loaded in localstorage after creating & deleting the source
                     * 
                     * @returns {undefined}
                     */
                    $scope.updateLoadedSource = function () {
			delete localStorage['sources'];
                        var searchText = ""; // Search criteria for users
                        var sortBy = 'SOURCE_NAME';
                        var sortHow = 'asc';
                        var offset = 0;
                        var limit = 1000;
                        var objCustom = {'displayValue': "Source", 'mode': 'fetch'};
                        var sources = [];
                            //if (angular.isUndefined(localStorage['sources'])) {
                                sourceFactory.getSources(searchText, limit, offset, sortBy, sortHow)
                                        .then(function (sourceResponse) {
                                            angular.forEach(sourceResponse.data.sources, function (value) {
                                                sources.push(value);
                                            })
                                            //sessionStorage['sources'] = JSON.stringify(sources);
                                            localStorage['sources'] = JSON.stringify(sources);
                                        },
                                                function (error) {
                                                    toasterService.hideToastr(false);
                                                    $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                                    message = $scope.error;
                                                    toasterService.showToastr(message, 'error');
                                                }
                                        ).finally(function () {
                                });
                            //}
                    }


                    /* ## Manage Sources Ends ## */

                    $scope.redirectList = function () {
                        $location.path('/sources');
                    };

                    ngProgress.complete();
                }
            ]);

});
