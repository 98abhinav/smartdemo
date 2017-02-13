define(['app/app', 'angularAMD', 'ngScrollbar', 'acuteSelect', 'smartTable'], function (app, applicationModule, ngScrollbar, acuteSelect, smartTable)
{

    applicationModule.controller('manageApplicationController',
            [
                '$scope', '$rootScope', '$routeParams', '$location', '$cookies', '$cookieStore', '$filter', '$timeout', 'applicationService', 'applicationFactory', 'accessService', 'sourceFactory', 'applicationPolicyFactory', 'ngProgress', 'toasterService', 'myCache', 'Upload',
                function ($scope, $rootScope, $routeParams, $location, $cookies, $cookieStore, $filter, $timeout, applicationService, applicationFactory, accessService, sourceFactory, applicationPolicyFactory, ngProgress, toasterService, myCache, Upload)
                {

                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    //$rootScope.module = 'applications';
                    $scope.section = "Application";
                    $scope.applications;
                    $scope.application;
                    $scope.applicationName = "";
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.delegated = false;
                    $scope.blockevent = 'pointer-events:none';
                    if ($scope.mode == 'add') {
                        $rootScope.selectedIndex = 0;
                        $scope.application = {name: ''}; // Initialize application.name for ng-model
                        $rootScope.module = 'addapplication';
                    } else {
                        $rootScope.module = 'applications';
                    }




                    $scope.isInArray = function (value, array) {
                        return array.indexOf(value) > -1;
                    }


                    $scope.getPermissions = function (array) {
                        var displayString = '';
                        angular.forEach(array, function (value, key) {
                            displayString += ", " + value;
                        })
                        return displayString.substring(1);
                    }
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'true',
                        'desc': 'reverse'
                    };
                    $scope.sortType = arrSort[sortHow];


                    if (angular.isUndefined($cookieStore.get('paginationStore'))) {
                        $scope.sortTypeUser = arrSort[$rootScope.paginationStore.user.orderBy];
                        $scope.sortTypeGroup = arrSort[$rootScope.paginationStore.group.orderBy];
                    } else {
                        $scope.sortTypeUser = arrSort[$cookieStore.get('paginationStore').user.orderBy];
                        $scope.sortTypeGroup = arrSort[$cookieStore.get('paginationStore').group.orderBy];
                    }

                    /* Access Check */
                    accessService.checkAccess($rootScope.module, $scope.section, 'super');



                    $scope.deligatedDetails = {
                        users: [],
                        groups: []
                    };
                    $scope.userdeligatedDetails = null;
                    $scope.groupdeligatedDetails = null;


                    if ($scope.mode == 'edit') {
                        $scope.delegated = true;
                        $scope.blockevent = '';
                        getApplication($routeParams.applicationID);
                        getSourceDetails();
                    }



                    $scope.submitData = function (application, mode, isValid)
                    {
                        if (!isValid) {
                            $(document).scrollTop(0);
                            return;
                        }
                        var applicationData = {
                            name: application.name,
                            description: application.description
                        };

                        // Add Application
                        if (mode == 'add') {
                            $scope.insertApplication(applicationData);
                        }

                        // Edit Application
                        if (mode == 'edit') {
                            $scope.updateApplication($routeParams.applicationID, applicationData);
                        }
                    }


                    /* ## Manage Application Starts ## */

                    /*  Get Application by ID */
                    function getApplication(id) {

                        // Custom object for error & success message
                        var objCustom = {'displayValue': id, 'mode': 'fetch'};

                        applicationFactory.getApplication(id)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    $scope.application = response.data;
                                    // Set Application Name in cookie
                                    $scope.applicationName = $scope.application.name;
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            toasterService.hideToastr(false);
                        });
                    }
                    ;

                    /* Insert New Application */
                    $scope.insertApplication = function (application) {

                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': application.name, 'mode': 'insert'};

                        applicationFactory.insertApplication(application)
                                .success(function (data, status, headers, config) {
                                    toasterService.hideToastr();
                                    var responseHeader = headers();
                                    // Set local storage name too
                                    localStorage.setItem("selectedAppName", application.name);
                                    localStorage.setItem("selectedAppDesc", application['description']);
                                    localStorage.setItem("selectedAppId", responseHeader.es_id);

                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = '/home/' + responseHeader.es_id;
                                    toasterService.showToastr(message, 'success', redirectpath);
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

                    /* Update Application */
                    $scope.updateApplication = function (id, application) {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': application.name, 'mode': 'update'};

                        applicationFactory.updateApplication(id, application)
                                .then(function () {
                                    toasterService.hideToastr();

                                    // Update local storage name too
                                    localStorage.setItem("selectedAppName", application.name);
                                    localStorage.setItem("selectedAppDesc", application.description);

                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = '/home/' + id;
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
                    };

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.application.DELETE_CONFIRM;
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteApplication($scope.id, $scope.application);
                    });

                    /* Delete Application */
                    function deleteApplication(id, application) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': localStorage.getItem("selectedAppName"), 'mode': 'delete'};

                        applicationFactory.deleteApplication(id)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);

                                    redirectpath = '/home';
                                    toasterService.showToastr(message, 'success', redirectpath);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                );
                    }

                    /* ## Manage Application Ends ## */


                    $scope.model =
                            {
                                message: applicationService.getString()
                            };
                    $scope.redirectList = function () {
                        if ($scope.mode == 'edit') {
                            $location.path('/home/' + $scope.applicationId);
                        } else {
                            $location.path('/home');
                        }
                    }

                    $scope.tabName = 'user';
                    $scope.markSelected = function (tabId) {
                        $scope.tabName = tabId;
                        if (tabId + 'tab' == 'usertab') {
                            angular.element(document.getElementById('usertab')).addClass("selected");
                            angular.element(document.getElementById('grouptab')).removeClass("selected");
                            document.getElementById('user').style.display = 'block';
                            document.getElementById('group').style.display = 'none';
                        } else {
                            angular.element(document.getElementById('grouptab')).addClass("selected");
                            angular.element(document.getElementById('usertab')).removeClass("selected");
                            document.getElementById('group').style.display = 'block';
                            document.getElementById('user').style.display = 'none';
                        }
                    }

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

                    $scope.searchIcon = true;
                    $scope.startSearch = function () {
                        $scope.searchBox = true;
                        $scope.focusInput = true;
                    };
                    $scope.endSearch = function () {
                        $scope.searchBox = false;
                        $scope.userSearch = '';
                    };

                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#userscrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height,
                            width: '100%'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#groupscrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height,
                            width: '100%'
                        });
                    });
                    /******Scroll bar setting end*************/


                    $scope.manageEye = function (id, tabName) {
                        var eyeid = "manage_eye" + id;
                        var manageid = "manage_setting" + id;

                        if (angular.element(document.getElementById(eyeid)).hasClass('disabled_eye')) {
                            angular.element(document.getElementById(eyeid)).removeClass("disabled_eye");
                            angular.element(document.getElementById(eyeid)).addClass("enable_eye");
                            angular.element(document.getElementById(manageid)).removeClass("enable_setting");
                            angular.element(document.getElementById(manageid)).addClass("disabled_setting");
                            if (tabName == 'user') {
                                var obj = $scope.deligatedDetails.users.filter(function (obj) {
                                    return obj.uid + '_' + obj.sid === id;
                                })[0];
                                if (!$scope.isInArray('VIEWER', obj.permissions)) {

                                    var index = obj.permissions.indexOf('MANAGER');
                                    if (index != -1) {
                                        delete obj.permissions[index];
                                    }

                                    obj.permissions.push('VIEWER');
                                }
                                document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                            } else {
                                var obj = $scope.deligatedDetails.groups.filter(function (obj) {
                                    return obj.name + '_' + obj.sid === id;
                                })[0];
                                if (!$scope.isInArray('VIEWER', obj.permissions)) {
                                    var index = obj.permissions.indexOf('MANAGER');
                                    if (index != -1) {
                                        delete obj.permissions[index];
                                    }

                                    obj.permissions.push('VIEWER');
                                }
                                document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                            }


                        }

                    };


                    $scope.manageSetting = function (id, tabName) {
                        var eyeid = "manage_eye" + id;
                        var manageid = "manage_setting" + id;

                        if (angular.element(document.getElementById(manageid)).hasClass('disabled_setting')) {
                            angular.element(document.getElementById(eyeid)).removeClass("enable_eye");
                            angular.element(document.getElementById(eyeid)).addClass("disabled_eye");
                            angular.element(document.getElementById(manageid)).removeClass("disabled_setting");
                            angular.element(document.getElementById(manageid)).addClass("enable_setting");

                            if (tabName == 'user') {
                                var obj = $scope.deligatedDetails.users.filter(function (obj) {
                                    return obj.uid + '_' + obj.sid === id;
                                })[0];
                                if (!$scope.isInArray('MANAGER', obj.permissions)) {
                                    var index = obj.permissions.indexOf('VIEWER');
                                    if (index != -1) {
                                        delete obj.permissions[index];
                                    }
                                    obj.permissions.push('MANAGER');
                                }
                                document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                            } else {
                                var obj = $scope.deligatedDetails.groups.filter(function (obj) {
                                    return obj.name + '_' + obj.sid === id;
                                })[0];
                                if (!$scope.isInArray('MANAGER', obj.permissions)) {
                                    var index = obj.permissions.indexOf('VIEWER');
                                    if (index != -1) {
                                        delete obj.permissions[index];
                                    }
                                    obj.permissions.push('MANAGER');
                                }
                                document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                            }

                        }


                    }


                    $scope.manageView = function (tabName, id) {
                        if (!angular.element(document.getElementById("view" + id)).hasClass("md-checked")) {                            
                            var element=tabName=='user'?'uid':'name';
                            var obj = $scope.deligatedDetails[tabName + 's'].filter(function (obj) {                                
                                return obj[element] + '_' + obj.sid === id;
                            })[0];
                            obj.permissions.push('VIEWER');
                            document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                        }else{
                            var element=tabName=='user'?'uid':'name';
                            var obj = $scope.deligatedDetails[tabName + 's'].filter(function (obj) {
                                return obj[element] + '_' + obj.sid === id;
                            })[0];
                            var index = obj.permissions.indexOf('VIEWER');
                            if (index != -1) {
                                delete obj.permissions[index];
                            }
                            document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                        }
                    }
                    
                    $scope.manageSetting = function (tabName, id) {
                        if (!angular.element(document.getElementById("manage" + id)).hasClass("md-checked")) {                            
                            var element=tabName=='user'?'uid':'name';
                            var obj = $scope.deligatedDetails[tabName + 's'].filter(function (obj) {                                
                                return obj[element] + '_' + obj.sid === id;
                            })[0];
                            obj.permissions.push('MANAGER');
                            document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                        }else{
                            var element=tabName=='user'?'uid':'name';
                            var obj = $scope.deligatedDetails[tabName + 's'].filter(function (obj) {
                                return obj[element] + '_' + obj.sid === id;
                            })[0];
                            var index = obj.permissions.indexOf('MANAGER');
                            if (index != -1) {
                                delete obj.permissions[index];
                            }
                            document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                        }
                    }
                    $scope.manageReport = function (tabName, id) {
                        
                        if (!angular.element(document.getElementById("report" + id)).hasClass("md-checked")) {                            
                            var element=tabName=='user'?'uid':'name';
                            var obj = $scope.deligatedDetails[tabName + 's'].filter(function (obj) {                                
                                return obj[element] + '_' + obj.sid === id;
                            })[0];
                            obj.permissions.push('REPORTER');
                            document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                        }else{
                            var element=tabName=='user'?'uid':'name';
                            var obj = $scope.deligatedDetails[tabName + 's'].filter(function (obj) {
                                return obj[element] + '_' + obj.sid === id;
                            })[0];
                            var index = obj.permissions.indexOf('REPORTER');
                            if (index != -1) {
                                delete obj.permissions[index];
                            }
                            document.getElementById(id).innerHTML = $scope.getPermissions(obj.permissions);
                        }

                    }
                    
                    $scope.removeuser = function (tabName,index,id){                        
                        if(tabName=='user'){
                            $scope.deligatedDetails.users.splice(index, 1);
                        }else{
                            $scope.deligatedDetails.groups.splice(index, 1);
                        }
                        
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

                    function getSourceDetails() {

                        // Custom object for error & success message
                        $scope.isLoading = true;
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

                    function getDelegatedAdmin(applicationId) {

                        var objCustom = {'displayValue': applicationId, 'mode': 'fetch'};
                        applicationFactory.getDelegatedAdmin(applicationId)
                                .then(function (response) {
                                    //$scope.deligatedDetails = response.data;
                                    angular.forEach(response.data.users, function (value, key) {
                                        $scope.deligatedDetails.users.push({"uid": value.uid, "sid": value.sid, "permissions": value.permissions});
                                    })
                                    angular.forEach(response.data.groups, function (value, key) {
                                        $scope.deligatedDetails.groups.push({"name": value.name, "sid": value.sid, "permissions": value.permissions});
                                    })
                                    $scope.userDetailsLength = Object.keys(response.data.users).length;
                                    $scope.groupDetailsLength = Object.keys(response.data.groups).length;

                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {
                            $scope.isLoading = false;
                        });
                    }

                    //console.log(JSON.parse(localStorage['sources'])[1].name);
                    $scope.getSource = function (sourceid) {
                        if (!angular.isUndefined(localStorage['sources'])) {
                            return $filter('filter')(JSON.parse(localStorage['sources']), {id: sourceid})[0].name;                            
                        }
                    }

                    $scope.resetPermission = function () {
                        getDelegatedAdmin($scope.applicationId);
                    }

                    $scope.savePermission = function () {
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');
                        $scope.submitlist = {
                            users: {},
                            groups: {}
                        };
                        angular.forEach($scope.deligatedDetails.users, function (value) {
                            $scope.submitlist.users[value.uid + "_" + value.sid] = {"uid": value.uid, "sid": value.sid, "permissions": value.permissions};
                        })
                        angular.forEach($scope.deligatedDetails.groups, function (value) {
                            $scope.submitlist.groups[value.name + "_" + value.sid] = {"name": value.name, "sid": value.sid, "permissions": value.permissions};

                        })
                        
                       
                        var objCustom = {'displayValue': localStorage.getItem("selectedAppName"), 'mode': 'update'};
                        var permisssionDetails = JSON.stringify($scope.submitlist);
                        applicationFactory.updateDelegatedAdmin($scope.applicationId, permisssionDetails)
                                .then(function () {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    redirectpath = '/application/edit/' + $scope.applicationId;
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

                    $scope.importPolicy = function(file, errFiles, purge) {
                    	$scope.hideprogress = false;
                    	toasterService.hideToastr(false);
                    	$scope.f = file;
                        $scope.errFile = errFiles && errFiles[0];
                        var qs = '';
                        if (purge===true) {
                        	qs = '?purge='+purge;
                        }
                        if (file) {
                            file.upload = Upload.http({
                            	url: $rootScope.config.apiPath + '/ESAdmin/v1/policies/upload/' + $scope.applicationId + qs,
                            	headers : {
                            		'Content-Type': 'application/octet-stream'
                            	},
                            	data: file
                        	});

                            file.upload.then(
                            	function (response) {
                            		$timeout(function () {
                            			file.result = response.data;
	                                    var message = 'Successfully imported ' + response.config.data.name;
	                                    toasterService.showToastr(message, 'success');
	                                    //$timeout(function(){
	                                    	$scope.hideprogress = true;
	                                    //},5000);
	                                    
	                                });
	                            }, function (error) {
	                            	if (error.status > 0) {
	                            		var message;
	                            		// Show error from API response for NotFound and Conflict cases, else show configured messages
	                            		if(error.status==404 || error.status==409) {
	                            			message = error.data;
	                            		} else {
	                            			message = $rootScope.getErrorMessage(error, 'Policies');
	                            		}
	                                    $scope.errorMsg = message;
	                                    toasterService.showToastr(message, 'error');
	                                    $scope.hideprogress = true;
	                                }
	                            }, function (evt) {
	                            	file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
	                            }
                            );
                        }
                    };
                    
                    $scope.exportPolicy = function() {
                    	var path = $rootScope.config.apiPath + '/ESAdmin/v1/policies/download/' + $scope.applicationId;
                    	window.location.href = path;
                    	
                    	/*
                    	 * Parses the JSON response, and if valid proceeds for export 
                    	 */
                    	/*applicationPolicyFactory.getApplicationPolicies($scope.applicationId)
                            .then(function (response) {
                            		
                                },
                                function (error) {
                                	if (error.status) {
                                		toasterService.hideToastr(false);
                                    	var message = $rootScope.getErrorMessage(error, 'Policies');
                                        toasterService.showToastr(message, 'error');
                                	} else {
                                		var path = $rootScope.config.apiPath + '/ESAdmin/v1/policies/download/' + $scope.applicationId;
                                		window.location.href = path;
                                	}
                                }
                            );*/
                    };
                            
                    ngProgress.complete();
                }
            ]);


    applicationModule.controller('delegatedadminController',
            [
                '$scope', '$rootScope', '$http', '$timeout', '$cookies', '$cookieStore', '$location', '$routeParams', '$window', '$filter', '$document', 'ngProgress', 'sourceFactory', 'applicationFactory', 'toasterService', 'usersFactory', 'groupsFactory', 'sourcePageFactory', 'myCache',
                function ($scope, $rootScope, $http, $timeout, $cookies, $cookieStore, $location, $routeParams, $window, $filter, $document, ngProgress, sourceFactory, applicationFactory, toasterService, usersFactory, groupsFactory, sourcePageFactory, myCache) {

                    ngProgress.start();
                    $scope.section = "Application";
                    $scope.activeLetter = '';
                    $scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                    $rootScope.selectedIndex = 1;
                    $scope.applicationName = localStorage.getItem("selectedAppName");
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.itemsByPage = $rootScope.itemsByPage;
                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                    $scope.info = "Please select source.";
                    $scope.dispmsg = "No Record Selected.";
                    $scope.usertargetList = null;
                    $scope.userfulltargetList = null;
                    $scope.usersourceList = null;
                    $scope.grouptargetList = null;
                    $scope.groupfulltargetList = null;
                    $scope.groupsourceList = null;
                    $scope.usersourceListLength = 0;
                    $scope.groupsourceListLength = 0;
                    $scope.usertargetlistFullLength = 0;
                    $scope.grouptargetlistFullLength = 0;
                    $scope.usertargetlistLength = 0;
                    $scope.grouptargetlistLength = 0;
                    var sortHow = 'asc';
                    var limit = 100;
                    $scope.sourcelist = {
                        users: null,
                        groups: null
                    };
                    $scope.targetlist = {
                        users: [],
                        groups: []
                    };

                    /*** Search by letter ******/
                    /*
                     $scope.setActiveLetter = function (letter, sourceId, searchTab) {
                     $scope.search = '';
                     $scope.placeholder = "e.g.  bjensen, 1_ahell, $jbrown";
                     $scope.info = null;
                     if (letter && sourceId) {
                     document.getElementById('mainContent').style.display = 'block';
                     
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
                     $scope.targetlistFull.users.push({"uid": value.uid, "sid": value.sid, "permissions": value.permissions});
                     }
                     }
                     })
                     
                     
                     
                     angular.forEach($scope.targetlist.groups, function (value, key) {
                     if (value.name.indexOf(letter.toLowerCase()) == 0 || value.name.indexOf(letter) == 0) {
                     if (value.sid == sourceId) {
                     $scope.targetlistFull.groups.push({"name": value.name, "sid": value.sid, "permissions": value.permissions});
                     }
                     }
                     })
                     $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                     $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                     
                     
                     $scope.getGroups(letter, $scope.sortByGroup, sourceId, limit, $scope.sortByGroup, sortHow);
                     $scope.getUsers(letter, $scope.sortByUser, sourceId, limit, $scope.sortByUser, sortHow);
                     
                     } else {
                     $scope.info = "Please select source.";
                     }
                     }
                     */




                    $scope.getUsers = function (searchText, searchType, sourceId, limit, sortBy, sortHow) {
                        $scope.isLoading = true;
                        usersFactory.getUsers(searchText, searchType, sourceId, limit, sortBy, sortHow)
                                .then(function (response) {
                                    //$scope.users = response.data.users;
                                    //$scope.sourcelist = response.data;
                                    if ($scope.sourcelist.users != null) {

                                        angular.forEach(response.data.users, function (value, key) {
                                            if (angular.isUndefined($filter('filter')($scope.targetlist.users, {uid: value.uid, sid: value.sid})[0])) {
                                                $scope.sourcelist.users.push({"uid": value.uid, "sid": $scope.sourceId, "permissions": ["VIEWER"]});
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
                                                //$scope.error = 'Unable to load data: ' + error.status + ' ' + error.statusText;
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
                                                $scope.sourcelist.groups.push({"name": value.name, "sid": $scope.sourceId, "permissions": ["VIEWER"]});
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
                            if ($scope.search != '') {
                                $scope.activeLetter = $scope.search.charAt(0).toUpperCase();
                            }
                        });
                    };

                    function getDelegatedAdmin(applicationId) {
                        var objCustom = {'displayValue': applicationId, 'mode': 'fetch'};
                        applicationFactory.getDelegatedAdmin(applicationId)
                                .then(function (response) {
                                    $scope.deligatedDetails = response.data;
                                    angular.forEach(response.data.users, function (value, key) {
                                        $scope.targetlist.users.push({"uid": value.uid, "sid": value.sid, "permissions": value.permissions});
                                    })
                                    angular.forEach(response.data.groups, function (value, key) {
                                        $scope.targetlist.groups.push({"name": value.name, "sid": value.sid, "permissions": value.permissions});
                                    })

                                    $scope.usertargetlistLength = Object.keys($scope.deligatedDetails.users).length;
                                    $scope.grouptargetlistLength = Object.keys($scope.deligatedDetails.groups).length;

                                },
                                        function (error) {
                                            $scope.sourcelist.users = null;
                                            $scope.sourcelist.groups = null;
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            $scope.error = message;
                                            toasterService.showToastr(message, 'error');
                                        }
                                ).finally(function () {

                        });
                    }
                    getDelegatedAdmin($scope.applicationId);
                    /*** Tab Selection ******/
                    $scope.tabName = "user";
                    $scope.markSelected = function (letter, sourceId, tabId) {
                        $scope.tabName = tabId;
                        if (tabId + 'tab' === 'usertab') {
                            angular.element(document.getElementById('usertab')).addClass("selected");
                            angular.element(document.getElementById('grouptab')).removeClass("selected");
                            document.getElementById('user').style.display = 'block';
                            document.getElementById('group').style.display = 'none';
                            //$scope.setActiveLetter(letter, sourceId, tabId);
                            if ($scope.selectedSource != null) {
                                $scope.displayAttributes = $scope.selectedSource.userDisplayAttributes;
                                //$scope.usersearchAttributes = $scope.selectedSource.searchAttributes.userSearchDefaultAttr;                                
                                $scope.searchField = $scope.selectedSource.userDisplayAttributes[$scope.selectedSource.searchAttributes.userNameIdentifier];
                            }

                        } else {
                            angular.element(document.getElementById('grouptab')).addClass("selected");
                            angular.element(document.getElementById('usertab')).removeClass("selected");
                            document.getElementById('group').style.display = 'block';
                            document.getElementById('user').style.display = 'none';
                            //$scope.setActiveLetter(letter, sourceId, tabId);

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

                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolldropdown').slimScroll({
                            //height: '280px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            //height: $rootScope.listscrolltable.height
                            //height: '280px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#unassignscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#assignscroll').slimScroll({
                            // height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#unassigngroupscroll').slimScroll({
                            // height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#assigngroupscroll').slimScroll({
                            //height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#fullassignscroll').slimScroll({
                            // height: '410px'
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#fullassigngroupscroll').slimScroll({
                            // height: '410px'
                        });
                    });
                    /******Scroll bar setting end*************/

                    // Close all instances when user clicks elsewhere
                    $window.onclick = function (event) {
                        closeWhenClickingElsewhere(event, function () {
                            $scope.openDropdown = false;
                            $scope.$apply();
                        }, 'selectbox1');
                    };

                    $scope.getDropdownIconClass = function () {
                        if (!$scope.openDropdown) {
                            return "arrow-down";
                        }
                        return "arrow-up";
                    };




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


                    $scope.sourceName = null;
                    $scope.displayAttributes = null;
                    $scope.selectedSource = null;
                    $scope.selectSource = function (sources) {
                        $scope.selectedSource = sources;

                        // Set selected source Id in localstorage, to remember in memory
                        if (angular.isUndefined(localStorage['selectedSourceId']) || localStorage['selectedSourceId'] != $scope.selectedSource.id) {
                            localStorage.setItem("selectedSourceId", $scope.selectedSource.id);
                        }

                        $scope.sourcelist.users = null;
                        $scope.sourcelist.groups = null;
                        $scope.sourceName = sources.name;
                        $scope.sourceId = sources.id;
                        $scope.openDropdown = false;
                        $scope.sourceerr = false;
                        //$scope.info = "Please select alphabet to search.";
                        $scope.info = "Please select a source and search.";
                        //document.getElementById('mainContent').style.display = 'none';
                        $scope.activeLetter = '';
                        $scope.sortByUser = sources.searchAttributes.userNameIdentifier;
                        $scope.sortByGroup = sources.searchAttributes.groupNameIdentifier;

                        var content_area = angular.element(document.getElementById('content_area'));
                        $document.scrollToElementAnimated(content_area, $rootScope.angularscroll.offset, $rootScope.angularscroll.duration);

                        $scope.placeholder = "";
                        angular.element(document.getElementById('serach')).removeClass("required");
                        if ($scope.tabName + 'tab' === 'usertab') {
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
                    if (selectedSourceId != null && !angular.isUndefined(localStorage['sources'])) {
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
                        if ($scope.tabName + 'tab' === 'usertab') {
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

                        angular.forEach($scope.targetlist.users, function (value, key) {
                            //if (value.uid.indexOf(letter.toLowerCase()) == 0 || value.uid.indexOf(letter) == 0) {
                            if (value.sid == $scope.sourceId) {
                                $scope.targetlistFull.users.push({"uid": value.uid, "sid": value.sid, "permissions": value.permissions});
                            }
                            //}
                        })



                        angular.forEach($scope.targetlist.groups, function (value, key) {
                            //if (value.name.indexOf(letter.toLowerCase()) == 0 || value.name.indexOf(letter) == 0) {
                            if (value.sid == $scope.sourceId) {
                                $scope.targetlistFull.groups.push({"name": value.name, "sid": value.sid, "permissions": value.permissions});
                            }
                            //}
                        })
                        $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;

                        $scope.getUsers($scope.search, $scope.userSearchType, $scope.sourceId, limit, $scope.userSearchType, sortHow);
                        $scope.getGroups($scope.search, $scope.groupSearchType, $scope.sourceId, limit, $scope.groupSearchType, sortHow);

                    }

                    $scope.placeholder = "e.g.  bjensen, 1_ahell, $jbrown";
                    $scope.removeClass = function () {
                        angular.element(document.getElementById('serach')).removeClass("required");
                    }

                    // Delete functionality
                    $scope.confirmDelete = function (id) {
                        var message = $rootScope.translation.application.DELETE_CONFIRM;
                        toasterService.showToastr(message, 'warning');
                        $scope.id = id;
                    };
                    $('body').off('click', '#confirm_delete');
                    $('body').on('click', '#confirm_delete', function () {
                        toasterService.hideToastr(false);
                        deleteApplication($scope.id);
                    });
                    /* Delete Application */
                    var message, redirectpath;
                    function deleteApplication(id) {
                        message = $rootScope.translation.toaster.DELETING;
                        toasterService.showToastr(message, 'loader');

                        // Custom object for error & success message
                        var objCustom = {'displayValue': $scope.applicationName, 'mode': 'delete'};

                        applicationFactory.deleteApplication(id)
                                .then(function (response) {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);

                                    redirectpath = '/home';
                                    toasterService.showToastr(message, 'success', redirectpath);
                                },
                                        function (error) {
                                            toasterService.hideToastr(false);
                                            $scope.error = $rootScope.getErrorMessage(error, $scope.section, objCustom);
                                            message = $scope.error;
                                            toasterService.showToastr(message, 'error');
                                        }
                                );
                    }



                    /* Dual-ListBox */
                    $scope.selectedSourceItems = [];
                    $scope.selectedTargetItems = [];




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
                        currenttab = tabName + 's';
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
                                    $scope.targetlistFull.users.push({"uid": item.uid, "sid": item.sid, "permissions": item.permissions, "search": $scope.activeLetter});
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
                                    $scope.targetlistFull.groups.push({"name": item.name, "sid": item.sid, "permissions": item.permissions, "search": $scope.activeLetter});
                                    $scope.showAddBtn = false;
                                    $scope.showRemoveBtn = false;
                                }
                            });
                        }

                        $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                        $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;
                        $scope.usertargetlistFullLength = $scope.targetlistFull.users.length;
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                        $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                        $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;

                    };

                    $scope.removeItem = function (items, tabName) {
                        currenttab = tabName + 's';
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
                        currenttab = tabName + 's';
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

                    $scope.assignDeligated = function () {

                        $scope.submitlist = {
                            users: {},
                            groups: {}
                        };
                        //console.log($scope.targetlist.users);
                        angular.forEach($scope.targetlist.users, function (value) {
                            $scope.submitlist.users[value.uid + "_" + value.sid] = {"uid": value.uid, "sid": value.sid, "permissions": value.permissions};
                        })
                        angular.forEach($scope.targetlist.groups, function (value) {
                            $scope.submitlist.groups[value.name + "_" + value.sid] = {"name": value.name, "sid": value.sid, "permissions": value.permissions};

                        })
                        if ($scope.sourceName == null) {
                            $scope.info = "Please select source.";
                            $scope.sourceerr = true;
                            return false;
                        } else if ($scope.activeLetter == '') {
                            $scope.info = "Please select alphabet to search.";
                            return false;
                        }
                        message = $rootScope.translation.toaster.SAVING;
                        toasterService.showToastr(message, 'loader');

                        var objCustom = {'displayValue': $scope.applicationName, 'mode': 'update'};
                        var permisssionDetails = JSON.stringify($scope.submitlist);
                        applicationFactory.updateDelegatedAdmin($scope.applicationId, permisssionDetails)
                                .then(function () {
                                    toasterService.hideToastr();
                                    message = $rootScope.getSuccessMessage($scope.section, objCustom);
                                    //redirectpath = '/delegatedadmin/' + $scope.applicationId;
                                    redirectpath = '/application/edit/' + $scope.applicationId;
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

                    $scope.addAllItems = function () {
                        $scope.targetlist[currenttab].push.apply($scope.targetlist[currenttab], $scope.sourcelist[currenttab]);
                        $scope.sourcelist[currenttab] = [];
                    };
                    $scope.removeAllItems = function () {
                        $scope.sourcelist[currenttab].push.apply($scope.sourcelist[currenttab], $scope.targetlist[currenttab]);
                        $scope.targetlist[currenttab] = [];
                    };

                    $scope.redirectList = function () {
                        $location.path('/application/edit/' + $scope.applicationId);
                    }
                    
                    $scope.getSource = function (sourceid) {
                        if (!angular.isUndefined(localStorage['sources'])) {
                            return $filter('filter')(JSON.parse(localStorage['sources']), {id: sourceid})[0].name;
                        }
                    }
                    ngProgress.complete();
                }
            ]);
});










