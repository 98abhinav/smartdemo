define(['app/app', 'angularAMD', 'smartTable', 'ngScrollbar'], function (app, rolePoliciesModule, smartTable, ngScrollbar)
{

    rolePoliciesModule.controller('manageRolePoliciesController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'ngProgress', 'toasterService', 'rolePageFactory', 'functionPageFactory', 'resourceFactory', 'resourcePageFactory', 'resourceTypePageFactory', 'resourceTypeFactory', 'accessService', 'resourceShareDataService','rolePoliciesFactory', 'sourcePageFactory', 'usersFactory', 'usersPageFactory', 'groupsFactory','groupsPageFactory','$filter','$window',
                function ($scope, $rootScope, $cookies, $routeParams, $location, ngProgress, toasterService, rolePageFactory, functionPageFactory, resourceFactory, resourcePageFactory, resourceTypePageFactory, resourceTypeFactory, accessService, resourceShareDataService,rolePoliciesFactory, sourcePageFactory, usersFactory, usersPageFactory, groupsFactory, groupsPageFactory, $filter, $window)
                {
                    ngProgress.start();

                    var message, redirectpath;

                    /* Initialize */
                    $rootScope.module = 'rolepolicies';
                    $scope.section = 'Role Policy';
                    $scope.selectedPrincipals = [];
                    $scope.selectedResourceActions = [];
                    $scope.authzPolicy={};
                    $scope.authzPolicy.roles=[];
					$scope.authzPolicy.resourceActions=[];
					$scope.authzPolicy.obligations=[];
                    $scope.error;
                    $scope.message;
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    $scope.policyType = $routeParams.policyType; //Policy Type - user, group or role
                    $scope.rolePolicyId = $routeParams.rolepolicyid;
                    $scope.selectedResourceActionRHS=null;
                    
                    // Get stored values from shared data
                    $scope.typeID = resourceShareDataService.get().resourcetypeid;
                    $scope.parentID = (resourceShareDataService.get().resourceparentid!=null) ? resourceShareDataService.get().resourceparentid : 0;
                    $scope.typeName = resourceShareDataService.get().resourcetypename;
                    $scope.treeNav = (resourceShareDataService.get().treeNav!=null) ? resourceShareDataService.get().treeNav : null;
                    $scope.resourcetypehierarchical = (resourceShareDataService.get().resourcetypehierarchical!=null) ? resourceShareDataService.get().resourcetypehierarchical : false;

                    if ($scope.mode == 'edit') {
                        getAuthzPolicy($scope.rolePolicyId, $scope.applicationId, $scope.policyType);
                    }


                    /* ## Manage Role Starts ## */
                    $scope.rolePolicyResourceGroups =[];
                    $scope.rolePolicyResources = [];
                    $scope.rolePolicyResourceGroupCount=0;
                    $scope.rolePolicyResourceCount;
  
                    
                    /*Search Icon Initializations */
                    $scope.principalsourcesearchIcon = true;
                    $scope.principaltargetsearchIcon = true;
                    $scope.resourcesourcesearchIcon = true;
                    $scope.resourcetargetsearchIcon = true;
                    $scope.actiontargetsearchIcon = true;
                    
                    

                    
                    /* Initializations for Resource Selection forms */
                    $scope.actionsForResource = [];
                    $scope.resourceActionForActions = null;                    
                    $scope.actionsForResource = [];                    
                    $scope.startEditActionStatus = false;

                    
                    /*  Get Role by ID */
                    function getAuthzPolicy(id, applicationId, policyType) {
                        
                        rolePoliciesFactory.getRolePolicy(id, applicationId, policyType)
                                .then(function (response) {
                                    $scope.authzPolicy = response.data;
                                    
                                    //Initialize Temp arrays for lists
                                    $scope.selectedPrincipals = angular.copy($scope.authzPolicy[$scope.policyType]);
                                    $scope.selectedResourceActions = angular.copy($scope.authzPolicy.resourceActions);
                                    
                                    
                                    
                                    for(var i=0; i<$scope.authzPolicy.resourceActions.length; i++) {
                                    	if($scope.authzPolicy.resourceActions[i].resource.group==true) {
                                    		$scope.rolePolicyResourceGroups.push(angular.copy($scope.authzPolicy.resourceActions[i]));
                                    		$scope.rolePolicyResourceGroupCount++;
                                    	} else {
                                    		$scope.rolePolicyResources.push(angular.copy($scope.authzPolicy.resourceActions[i]));
                                    		$scope.rolePolicyResourceCount++;
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
                    


                    $scope.startSearch = function(searchType) {
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
                            case 'actiontarget':
                                $scope.actiontargetsearchBox = false;
                                $scope.search_actiontarget = '';
                                $scope.actiontargetsearchIcon = true;
                                break;                                
                            	
                        }
                    };                    

               


                    $scope.toggleItemSelect = function (roledetails) {
                    	roledetails.isSelected = !roledetails.isSelected;
                    };
                    
                    

                    $scope.toggleItemSelectForAction = function (resourceAction) {
                    	$scope.actionsForResource = angular.copy(resourceAction.actions);
                    	$scope.resourceActionForActions = resourceAction;
                    	
                    	//Reset Edit status of actions
                    	$scope.startEditActionStatus=false;
                    }
                    
                  $scope.startEditActions = function (resourceAction) {
                    $scope.startEditActionStatus = true;
                	var resourceAction = $scope.resourceActionForActions;
                	for(var i=0; i<$scope.authzPolicy.resourceActions.length; i++ ) {
                		$scope.authzPolicy.resourceActions[i].isSelected=false;
                	}



                    resourceFactory.getResource(resourceAction.resource.id, $scope.applicationId)
                    .then(function (response) {
                             var resource = response.data;

                        	 resourceTypeFactory.getResourceType(resource.typeID, $scope.applicationId)
                             .then(function (resp) {
                                 $scope.actionsForResource = resp.data.actions;
                            	 for (rtAction in $scope.actionsForResource) {
                            		 for(rAction in resourceAction.actions) {
                            			 if($scope.actionsForResource[rtAction].id == resourceAction.actions[rAction].id) {
                            				 $scope.actionsForResource[rtAction].isSelected = true;
                            			 }
                            		 }
                            	 }
                             },function (err) {
                                         toasterService.hideToastr(false);
                                         message = $rootScope.getErrorMessage(err, $scope.section, objCustom);
                                         $scope.error = message;
                                         toasterService.showToastr(message, 'error');
                                     }
                             ).finally(function () {
                            	 toasterService.hideToastr(false);
                             });
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
                };
                    
                $scope.saveEditActions = function (resourceAction) {
                    $scope.startEditActionStatus = false;
                	var resourceAction = $scope.resourceActionForActions;
                	var actions = $scope.actionsForResource;
                	
                	var tempActionArr = [];
                	
                	for(var i=0;i<actions.length; i++) {
                		if(actions[i].isSelected) {
                			tempActionArr.push(actions[i]);
                			actions[i].isSelected=false;
                		}
                	}
                	resourceAction['actions'] = tempActionArr;
                	$scope.actionsForResource = resourceAction['actions'];
                };
                    

                    
                    $scope.toggleItemSelectAction = function(action) {
                    	if(!action.isSelected) {
                    		//select item now..
                    		action.isSelected = true;
                    		if(!$scope.selectedResourceAction.actions) {
                    			$scope.selectedResourceAction.actions = [];
                    		} 
                    		var isAvailable = false;
                    		for(var i=0; i<$scope.selectedResourceAction.actions.length; i++) {
                    			if($scope.selectedResourceAction.actions[i].id == action.id) {
                    				isAvailable= true;
                    				break;
                    			}
                    		}
                    		if(!isAvailable) {
                    			$scope.selectedResourceAction.actions.push(action);
                    		}
                    	} else {
                    		action.isSelected = false;
                    		if(!$scope.selectedResourceAction.actions) {
                    			$scope.selectedResourceAction.actions = [];
                    		} 
                    		var indexOfAction =-1;
                    		for(var i=0; i<$scope.selectedResourceAction.actions.length; i++) {
                    			if($scope.selectedResourceAction.actions[i].id == action.id) {
                    				indexOfAction = i;
                    			}
                    		}
                    		if(indexOfAction >=0) {
                    			$scope.selectedResourceAction.actions.splice(indexOfAction, 1);
                    		}
                    	}
                    	
                    }
                    
                    $scope.addSelectedPrincipals = function() {
                    	var source = $scope.availablePrincipals;
                    	var target = $scope.selectedPrincipals;
                    	
                    	for (var i=0;i<source.length; i++) {
                    		if(source[i].isSelected) {
                    			var isAvailable = false;
                    			for(var j=0;j<target.length; j++) {
                    				if(source[i].id && target[j].id == source[i].id) {
                    					isAvailable = true;
                    				} else if(source[i].uid && 
                    							target[j].uid == source[i].uid &&
                    							target[j].sid == source[i].sid) {
										isAvailable = true;
										break;
                    				} else if(source[i].name && 
                    							target[j].name == source[i].name &&
                    							target[j].sid == source[i].sid) {
                    					isAvailable = true;
                    					break;
                    				}
                    			} 
                    			if(!isAvailable) {
                    				source[i].isSelected = false;
                    				var clonedPrincipal = angular.copy(source[i]);
                    				target.push(clonedPrincipal);
                    			}
            					source[i].isSelected = false;                     			
                    		}
                    	}
                    	return;
                    }

                    $scope.addSelectedResourceItems = function(source) {
                    	if(!source) {
                    		source =[];
                    	}
                    	if($scope.rolePolicyResources == null || $scope.rolePolicyResources.length==0) {
                    		$scope.rolePolicyResources = [];
                    	} 
                    	target = $scope.rolePolicyResources;
                    	for (var i=0;i<source.length; i++) {
                    		if(source[i].isSelected) {
                    			var isAvailable = false;
                    			for(var j=0;j<target.length;j++) {
                    				if(source[i].id == target[j].resource.id) {
                    					isAvailable=true;
                    				}
                    			} 
                    			if(!isAvailable) {
                    				var resourceActionObj = {resource: source[i],
                    										 actions: []
                    										};
                    										
                    				$scope.rolePolicyResources.push(resourceActionObj);
                    			}
            					source[i].isSelected = false;                     			
                    		}
                    	}
                    }
                    
                    $scope.removeSelectedResourceItems = function(source) {

                    	for (var i=0;i<source.length;) {
                    		if(source[i].isSelected) {
                            	source.splice(i, 1);
                    		} else {
                    			i++;
                    		}
                    	}
                    } 
                    
                    /****** Ajax Smart table ****************/
                   $scope.itemsByPage = $rootScope.itemsByPage;
                   $scope.paginationPageSizes = $rootScope.paginationPageSizes;
                   $scope.rightPageinationPerPage = 8;
                    var sortBy = 'name';
                    var sortHow = 'asc';
                    var arrSort = {
                        'asc': 'reverse',
                        'desc': 'true'
                    };
                    $scope.sortType = arrSort[sortHow];
                    $scope.availableRoles = [];

                    $scope.callServerForRoles = function (tableState) {
                    	
                    	
                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        //var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        var number = 13;
                        	if($scope.policyType == 'roles') {
								if (number) {
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
											$scope.availablePrincipals = result.data.roles;
											tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
										}
									}).finally(function () {
										$scope.isLoading = false;
										toasterService.hideToastr();
									});
								}
                        	} else if($scope.policyType == 'users') {
                        		if($scope.sourceId==null || $scope.sourceId=='') {
                        			$scope.error = 'Please select an Identity Source';
                        			return;
                        		}
								if (number) {
									usersPageFactory.getPage(start, number, tableState, $scope.sourceId, sortBy, sortHow).then(function (result) {
										if (result.error) {
											if (result.error.status == 404) {
												$scope.availablePrincipals = null;
												$scope.error = 'No Records';
											} else {
												$scope.availablePrincipals = null;
												$scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
											}
										} else {
											$scope.availablePrincipals = result.data.users;
											tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
										}
									}).finally(function () {
										$scope.isLoading = false;
										toasterService.hideToastr();
									});
								}
                        	} else if($scope.policyType == 'groups') {
                        		if($scope.sourceId==null || $scope.sourceId=='') {
                        			$scope.error = 'Please select an Identity Source';
                        			return;
                        		}

								if (number) {
									groupsPageFactory.getPage(start, number, tableState, $scope.sourceId, sortBy, sortHow).then(function (result) {
										if (result.error) {
											if (result.error.status == 404) {
												$scope.availablePrincipals = null;
												$scope.error = 'No Records';
											} else {
												$scope.availablePrincipals = null;
												$scope.error = $rootScope.getErrorMessage(result.error, $scope.section);
											}
										} else {
											$scope.availablePrincipals = result.data.groups;
											tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
										}
									}).finally(function () {
										$scope.isLoading = false;
										toasterService.hideToastr();
									});                        		
                        	}
                        }
                    };

                    /****** Ajax smart table ends ************/
                    
                    /******Scroll bar setting start*************/
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height
                        });
                        
                        $('#scrollrightdiv').slimScroll({
                            height: $rootScope.listscrollrightdiv.height,
                            width: $rootScope.listscrollrightdiv.width
                        });
                        
                        $('#scrolluser').slimScroll({
                            height: $rootScope.listscrollrightinnerdiv.height
                        });
                        
                        $('#scrollgroup').slimScroll({
                            height: $rootScope.listscrollrightinnerdiv.height
                        });
                        
                        $('#scrolldropdown').slimScroll({
                            height: '280px'
                        });
                        
                        $('#unassignscroll').slimScroll({
                            height: '410px'
                        });
                        
                        $('#assignscroll').slimScroll({
                            height: '410px'
                        });
                    });

//                    $scope.$applyAsync(function () {
//                        $('#assignscroll').slimScroll({
//                            height: $rootScope.listscrollrightinnerdiv.height
//                        });
//                    }); 

                    /******Scroll bar setting end*************/
                    
                    
                  
                    
                    
                    
                    /**** Obligations Start *****/
                    
                    $scope.editableIndex=-1;
                    $scope.obligationTypeOptions=['Static', 'Dynamic'];
                    $scope.searchIconOnObligation=true;
                    $scope.searchBoxOnObligation=false;
                    $scope.obligationSearchCriteria='';
                    $scope.startObligationSearch = function() {
                    	$scope.searchIconOnObligation=false;
                        $scope.searchBoxOnObligation=true;
                    }   
                    
                    $scope.obligationSearchFilter = function(item) {
                    	if(item.name == obligationSearchCriteria) {
                    		return true;
                    	} else {
                    		return false;
                    	}
                    }
                    
                    $scope.endObligationSearch = function() {
                    	$scope.searchIconOnObligation=true;
                        $scope.searchBoxOnObligation=false;
                        $scope.obligationSearchCriteria='';
                    }                    
                    
                    $scope.addObligation = function(indexOf) {
                    	$scope.authzPolicy.obligations.splice(indexOf, 0, {"name": "","value": ""});
                    	editableIndex=0;
                    }
                    
                    $scope.deleteObligations = function() {
                    	$scope.authzPolicy.obligations=[];
                    }
                    
                    $scope.editObligation = function(obligation, indexOf) {
                    	$scope.obligations.splice(indexOf, 1);
                    	$scope.obligations.splice(indexOf, 0, obligation);
                    	$scope.obligations[indexOf].editable=false;
                    }
 
                    $scope.deleteObligation = function(indexOf) {
                    	$scope.authzPolicy.obligations.splice(indexOf, 1);
                    }

                    /**** Obligations End *******/                   
                    
//                    /****** Ajax Smart table ****************/
//                    var applicationId = $routeParams.applicationID; // Application ID
//                    $scope.itemsByPage = $rootScope.itemsByPage;
//                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
//                    $scope.rightPageinationPerPage = 8;
//                    var sortBy = 'name';
//                    var sortHow = 'asc';
//                    var arrSort = {
//                        'asc': 'reverse',
//                        'desc': 'true'
//                    };
//                    $scope.sortType = arrSort[sortHow];
//                    $scope.roles = [];
//
//
//                    /****** Ajax smart table ends ************/
                    


                    
                    
                    
                    
                    
//                    /************************Resource Page ********************/
//
//
//                    ngProgress.start();
//
//                    var message;
//                    $rootScope.module = 'resources';
//                    $scope.section = 'Resource';
//                    $scope.applicationId = $routeParams.applicationID; // application ID
//                    
//                    $scope.treeNav = (resourceShareDataService.get().treeNav!=null) ? resourceShareDataService.get().treeNav : [];
//                    $scope.resourcetypename = (resourceShareDataService.get().resourcetypename!=null) ? resourceShareDataService.get().resourcetypename : '';
//                    $scope.resourcetypehierarchical = (resourceShareDataService.get().resourcetypehierarchical!=null) ? resourceShareDataService.get().resourcetypehierarchical : '';
//                    
//					/* Access Check Validate */
//					accessService.checkAccessDeny();
//                   
//
//                    var applicationId = $routeParams.applicationID; // Application ID
//                    
//                    /****** Ajax Smart table ****************/
//                    $scope.itemsByPage = $rootScope.itemsByPage;
//                    $scope.paginationPageSizes = $rootScope.paginationPageSizes;
//                    var sortBy = 'name';
//                    var sortHow = 'asc';
//                    var arrSort = {
//                        'asc': 'reverse',
//                        'desc': 'true'
//                    };                    
//                    $scope.sortType = arrSort[sortHow];
//                    $scope.resources = [];
//
                    $scope.callServerForResource = function (tableState) {
                    	$scope.error = "";
                    	//console.log(tableState);
                    	var tid = (resourceShareDataService.get().resourcetypeid!=null) ? resourceShareDataService.get().resourcetypeid : '';
                    	var pid = (resourceShareDataService.get().resourceparentid!=null) ? resourceShareDataService.get().resourceparentid : 0;
                    	var hierarchical = resourceShareDataService.get().resourcetypehierarchical;
                    	$scope.resourcehierarchy = hierarchical ? 'Hierarchial Resources' : 'Non-Hierarchial Resources';
                    	if (tid=='') {
                    		$scope.resources = null;
                            $scope.error = 'Please select a Resource Type';
                    	} else {
                    		$scope.isLoading = true;
                    		var pagination = tableState.pagination;
                            var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                            //var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                            var number=10;
                            if (number) {
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
                                        $scope.resources = result.data.resources;
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
                    		var defaultNode = {'id':0, 'name':'Resources'};
                            $scope.treeNav.push(defaultNode);
                    	}
                    	
                    	var id = value.id;
                    	if (angular.isUndefined($filter('filter')($scope.treeNav, {'id':id})[0])) {
                    		var currNode = {'id':id, 'name':value.name};
                    		$scope.treeNav.push(currNode);
                    	} else {
                    		//var currId = $filter('filter')($scope.treeNav, {'id':id})[0].id;
                    		var index = $scope.treeNav.indexOf(value);
                    		if(index==0) {
                    			$scope.treeNav.splice(index, $scope.treeNav.length);
                    		} else {
                    			$scope.treeNav.splice(index+1, $scope.treeNav.length);
                    		}
                    	}
                    	
                    	var hierarchical = (resourceShareDataService.get().resourcetypehierarchical!=null) ? resourceShareDataService.get().resourcetypehierarchical : true;
                    	var typeID = (resourceShareDataService.get().resourcetypeid!=null) ? resourceShareDataService.get().resourcetypeid : '';
                    	var typeName = (resourceShareDataService.get().resourcetypename!=null) ? resourceShareDataService.get().resourcetypename : '';
                    	var resourceData = {
                    			"resourceparentid" : value.id,
                    			"resourcetypeid" : typeID,
                    			"resourcetypename" : typeName,
                    			"resourcetypehierarchical" : hierarchical,
                    			"treeNav" : $scope.treeNav,
                    		};
                    	
                    	resourceShareDataService.set(resourceData);
                    	//$route.reload();
                    	
                    	// Regenerate the smart table with default tablestate
                    	$scope.callServerForResource($rootScope.tableState);
                    };                    
//                    /****** Ajax smart table ends ************/
//
//
//                    $scope.$on('FirstRecord', function (event) {
//                        $scope.resourcedetails = {
//                            id: $scope.resources[0].id,
//                            name: $scope.resources[0].name,
//                            description: $scope.resources[0].description
//                        };
//                        $scope.selectresource($scope.resourcedetails);
//                    });
//
//                    $scope.selectresource = function (resourcedetails) {
//                        $scope.selectedResource = resourcedetails;
//                    };
//                    
//                    // Get Childs of Hierarchial resources
                    // Get Childs of Hierarchial resources
                    $scope.getChilds = function (value) {
                    	$scope.resources = null;
                    	//$scope.parentresourcename = value.name;
                    	if (!$scope.treeNav.length) {
                    		var defaultNode = {'id':0, 'name':'Resources'};
                            $scope.treeNav.push(defaultNode);
                    	}
                    	
                    	var id = value.id;
                    	if (angular.isUndefined($filter('filter')($scope.treeNav, {'id':id})[0])) {
                    		var currNode = {'id':id, 'name':value.name};
                    		$scope.treeNav.push(currNode);
                    	} else {
                    		//var currId = $filter('filter')($scope.treeNav, {'id':id})[0].id;
                    		var index = $scope.treeNav.indexOf(value);
                    		if(index==0) {
                    			$scope.treeNav.splice(index, $scope.treeNav.length);
                    		} else {
                    			$scope.treeNav.splice(index+1, $scope.treeNav.length);
                    		}
                    	}
                    	
                    	var hierarchical = (resourceShareDataService.get().resourcetypehierarchical!=null) ? resourceShareDataService.get().resourcetypehierarchical : true;
                    	var typeID = (resourceShareDataService.get().resourcetypeid!=null) ? resourceShareDataService.get().resourcetypeid : '';
                    	var typeName = (resourceShareDataService.get().resourcetypename!=null) ? resourceShareDataService.get().resourcetypename : '';
                    	var resourceData = {
                    			"resourceparentid" : value.id,
                    			"resourcetypeid" : typeID,
                    			"resourcetypename" : typeName,
                    			"resourcetypehierarchical" : hierarchical,
                    			"treeNav" : $scope.treeNav,
                    		};
                    	
                    	resourceShareDataService.set(resourceData);
                    	//$route.reload();
                    	
                    	// Regenerate the smart table with default tablestate
                    	$scope.callServerForResource($rootScope.tableState);
                    };
                    
                    
//                    
//
//                    $scope.searchIcon = true;
//                    $scope.startSearch = function () {
//                        $scope.searchBox = true;
//                        $scope.focusInput = true;
//                    };
//
//                    $scope.endSearch = function () {
//                        $scope.searchBox = false;
//                        $scope.search = '';
//                    };
//                    
//                    
                    /****Ajax Smart table dropdown for Resource type #start****/
                    $scope.openDropdown = false;
                    //$scopwn = false;
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

                    $scope.callResourceTypeDropdown = function (tableState) {
                    	var section = 'Resource Type';
                    	$scope.isLoading_dd = true;
                        //tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        //var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        var number = 5;
                        tableState.search_dd = {};
                        //alert(number);
                        if (number) {                           
                        	resourceTypePageFactory.getPage(start, number, tableState, $scope.applicationId, sortBy, sortHow).then(function (result) {
                                if (result.error) {
                                    if (result.error.status == 404) {
                                        $scope.resourcetypes = null;
                                        $scope.error_dd = 'No Records';
                                    } else {
                                        $scope.resourcetypes = null;
                                        $scope.error_dd = $rootScope.getErrorMessage(result.error,section);
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

//                    // Close all instances when user clicks elsewhere
//                    $window.onclick = function(event) {
//                    	closeWhenClickingElsewhere(event, function() {
//                    		$scope.openDropdown = false;
//                    		$scope.$apply();
//                    	}, 'list_container');
//                    };
//	                
//	                $scope.getDropdownIconClass = function() {
//	                	if(!$scope.openDropdown) {
//	                		return "arrow-down";
//	                	}
//	                	return "arrow-up";
//	                };
	                
	                $scope.selectResourcetype = function (value) {
	                	$scope.resources = null;
	                	$scope.treeNav = [];
	                	$scope.openDropdown = false;
	                	$scope.resourcetypename = value.name;
	                	$scope.resourcetypehierarchical = value.hierarchical;
                    	$scope.resourceTypeActions = value.actions;
                    	var selectedResourcetype = {
                    			"resourcetypeid" : value.id,
                    			"resourcetypename" : value.name,
                    			"resourcetypehierarchical" : value.hierarchical,
                    			"resourcetypeactions" : value.actions
                    		};
                    	
                    	resourceShareDataService.set(selectedResourcetype);
                    	//$route.reload();
                    	
                    	// Regenerate the smart table with default tablestate
                    	$scope.callServerForResource($rootScope.tableState);
                    };


                    $scope.removeSelectedPrincipals = function() {
                    	var source = $scope.selectedPrincipals;
                    	if(!source) {
                    		source =[];
                    	}
                    	for (var i=0;i<source.length;) {
                    		if(source[i].isSelected) {
                    			source.splice(i, 1);
                    		} else {
                    			i++;
                    		}
                    	}
                    	return;
                    } 
//                    
//                    /************************Resource Page Ends****************/

                    /*** Stage Navigation and Submit ****/
                     $scope.stage = [
                     	{"name": "Profile"},
                     	{"name": $scope.policyType.substring(0,1).toUpperCase() + $scope.policyType.substring(1,$scope.policyType.length)},
                     	{"name": "Targets"},
                     	{"name": "Functions"},
                     	{"name": "Obligations"}
                     ];
                    if($scope.mode == 'edit') {
                    	for(var i=0;i<$scope.stage.length; i++) {
                    		$scope.stage[i].status = "complete";
                    	}
                    }
                    
                    $scope.activeStage = 1;
                    $scope.activeStageOrigStatus="pending";
                    
                    $scope.nextStage = function() {
                    	$scope.stage[$scope.activeStage-1].status="complete";
                    	$scope.activeStage++;
                    }
                    
   

					//Navigate between Completed stages
                    $scope.goToStage = function(stage) {
                    	$scope.activeStage = stage;
                    }
                    
                    
                    $scope.sourceName = null;
                    $scope.selectSource = function (sources) {
                        $scope.sourceName = sources.name;
                        $scope.sourceId = sources.id;
                        $scope.openDropdown = false;
                        $scope.activeLetter = '';
                        $scope.callServerForRoles($rootScope.tableState);
                    };


                    /****** Principals Page Methods ******/
                    $scope.activeLetter = '';
                    $scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                    $scope.mode = $routeParams.mode; // add OR edit
                    $scope.applicationId = $routeParams.applicationID; // application ID                    
                    $scope.roleId = $routeParams.roleMemberID; // application ID

                   // $scopwn = false;
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

                    $scope.setActiveLetter = function (letter, sourceId, searchTab) {

                        $scope.info = null;
                        if (letter && sourceId) {
                            document.getElementById('usermainContent').style.display = 'block';
                            var searchType = 'uid'; // Search criteria type 
                            var sortBy; // Column Name
                            var sortHow = 'asc';
                            var limit = 100;

                            $scope.activeLetter = letter;
                            $scope.sourcelist = {
                                users: [],
                                groups: []
                            };

                            $scope.targetlist = {
                                    users: [],
                                    groups: []
                                };

                            $scope.targetlistFull = {
                                users: [],
                                groups: []
                            };

                            angular.forEach($scope.authzPolicy.users, function (value, key) {
                                if (value.uid.indexOf(letter.toLowerCase()) == 0 || value.uid.indexOf(letter) == 0) {
                                    if (value.sid == sourceId) {
                                        $scope.targetlistFull.users.push({"uid": value.uid, "sid": value.sid});
                                    }
                                }
                            })
//
//                            angular.forEach($scope.targetlist.groups, function (value, key) {
//                                if (value.name.indexOf(letter.toLowerCase()) == 0 || value.name.indexOf(letter) == 0) {
//                                    if (value.sid == sourceId) {
//                                        $scope.targetlistFull.groups.push({"name": value.name, "sid": value.sid});
//                                    }
//                                }
//                            })
                            $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
//                            $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;


  //                          $scope.getGroups(letter, sourceId, limit, 'cn', sortHow);
                            $scope.getUsers(letter, searchType, sourceId, limit, 'uid', sortHow);

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
                                                $scope.sourcelist.users.push({"uid": value.uid, "sid": value.sid});
                                            }
                                        })
                                    }
                                    $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                                    if (response.data.users.length) {
                                        $scope.activeLetter = response.data.users[0].uid.charAt(0).toUpperCase();
                                    }
                                },
                                        function (error) {
                                            if (error.status == 404) {
                                                $scope.sourcelist.users = null;
                                                $scope.usersourceListLength = 0;
                                                $scope.error = 'No Records Found';
                                            } else {
                                                $scope.sourcelist.users = null;
                                                $scope.usersourceListLength = 0;
                                                $scope.error = 'Unable to load data: ' + error.status + ' ' + error.statusText;
                                            }
                                        }
                                ).finally(function () {
                            $scope.isLoading = false;
                        });
                    };

                    $scope.getGroups = function (searchText, sourceId, limit, sortBy, sortHow) {
                        $scope.isLoading = true;
                        //$scope.sourcelist = {groups: {}};
                        groupsFactory.getGroups(searchText, sourceId, limit, sortBy, sortHow)
                                .then(function (response) {
                                    //$scope.sourcelist = response.data;
                                    if ($scope.sourcelist.groups != null) {
                                        angular.forEach(response.data.groups, function (value, key) {
                                            if (angular.isUndefined($filter('filter')($scope.targetlist.groups, {name: value.name, sid: value.sid})[0])) {
                                                $scope.sourcelist.groups.push({"name": value.name, "sid": value.sid});
                                            }
                                        })
                                    }
                                    $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;

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
                                                $scope.error = 'Unable to load data: ' + error.status + ' ' + error.statusText;
                                            }
                                        }
                                ).finally(function () {
                            $scope.isLoading = false;
                        });
                    };
                    
                    $scope.callServerForPrincipalSource = function callServer(tableState) {
                        $scope.isLoading = true;
                        tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        //var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        var number =7;
                        var sortBy  = 'SOURCE_NAME';
                        if (number) {

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
                                    tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update 
                                }
                            }).finally(function () {
                                $scope.isLoading = false;
                            });
                        }
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

                    $scope.addItem = function (items, letter) {

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

                        }
                    });

//Kept to resolve groups..
//                        else {
//                            angular.forEach(items, function (item) {
//                                if (!angular.isUndefined($filter('filter')($scope.sourcelist.groups, {name: item.name, sid: item.sid})[0])) {
//                                    var searchArray = {};
//                                    searchArray['property'] = 'name';
//                                    searchArray['value'] = item.name;
//                                    findAndRemove($scope.sourcelist.groups, searchArray);
//                                    $scope.selectedSourceItems = [];
//                                    $scope.targetlist.groups.push({"name": item.name, "sid": item.sid});
//                                    $scope.targetlistFull.groups.push({"name": item.name, "sid": item.sid, "search": $scope.activeLetter});
//                                    $scope.showAddBtn = false;
//                                    $scope.showRemoveBtn = false;
//                                }
//                            });
//                        }
                        $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                        $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;
                        $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                        $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                        $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;


                    };

                    $scope.removeItem = function (items, tabName) {
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
                                }
                            });
//                        } else {
//                            angular.forEach(items, function (item) {
//                                if (!angular.isUndefined($filter('filter')($scope.targetlist.groups, {name: item.name, sid: item.sid})[0])) {
//                                    var searchArray = {};
//                                    searchArray['property'] = 'name';
//                                    searchArray['value'] = item.name;
//                                    findAndRemove($scope.targetlist.groups, searchArray);
//                                    findAndRemove($scope.targetlistFull.groups, searchArray);
//                                    $scope.selectedSourceItems = [];
//                                    $scope.sourcelist.groups.push({"name": item.name, "sid": item.sid});
//                                    $scope.showAddBtn = false;
//                                    $scope.showRemoveBtn = false;
//                                }
//                            });
//                        }
                        $scope.usersourceListLength = Object.keys($scope.sourcelist.users).length;
                        $scope.groupsourceListLength = Object.keys($scope.sourcelist.groups).length;
                        $scope.usertargetlistFullLength = Object.keys($scope.targetlistFull.users).length;
                        $scope.grouptargetlistFullLength = Object.keys($scope.targetlistFull.groups).length;
                        $scope.usertargetlistLength = Object.keys($scope.targetlist.users).length;
                        $scope.grouptargetlistLength = Object.keys($scope.targetlist.groups).length;

                    };

                    $scope.resetPrincipalItems = function () {
                    	$scope.selectedPrincipals = angular.copy($scope.authzPolicy[$scope.policyType]);
                    }                    
                    
                    /****** Ajax smart table ends ************/                    

                    $scope.submitData = function (authzPolicy, mode)
                    {

						var authzPolicyData = {
							effect: authzPolicy.effect,
							aid: $scope.applicationId,
							resourceActions: {},
							obligations: authzPolicy.obligations,
							name: authzPolicy.name,
							description: authzPolicy.description 
						};
						
						for(var i=0; i<$scope.rolePolicyResources.length; i++) {
							var resourceStr = $scope.rolePolicyResources[i].resource.id + "|" + $scope.rolePolicyResources[i].resource.fqdn; 
							var finalActionArr = [];
							for(var j=0;j<$scope.rolePolicyResources[i].actions.length; j++) {
								var finalAction = {
														id: $scope.rolePolicyResources[i].actions[j].id,
														name: $scope.rolePolicyResources[i].actions[j].name
													};
								finalActionArr.push(finalAction);
							}
							
							authzPolicyData.resourceActions[resourceStr] = finalActionArr;
						}
						
						
						authzPolicyData[$scope.policyType] = [];

						for(var i=0;$scope.selectedPrincipals && i< $scope.selectedPrincipals.length; i++) {
							var principal = {};
							if($scope.selectedPrincipals[i].uid) {
								principal['uid'] = $scope.selectedPrincipals[i].uid;
							}
							if($scope.selectedPrincipals[i].name) {
								principal['name'] = $scope.selectedPrincipals[i].name;
							}
							if($scope.selectedPrincipals[i].sid) {
								principal['sid'] = $scope.selectedPrincipals[i].sid;
							}
							if($scope.selectedPrincipals[i].id) {
								principal['id'] = $scope.selectedPrincipals[i].id;
							}


							authzPolicyData[$scope.policyType].push(principal);
						}
						
						if(authzPolicy.args!=null && authzPolicy.args.length > 0) {
							if(authzPolicy.args[0].text!=null) {
								authzPolicyData.args = [];
								//The argument object has been modified, so correct it
								for(var i=0;i<authzPolicy.args.length; i++) {
									authzPolicyData.args.push(authzPolicy.args[i].text);
								}
							} else {
								//The arguement object has not been modified.
								authzPolicyData.args = authzPolicy.args;
							}
						}
						
						if(authzPolicy.function && authzPolicy.function.id>0) {
							authzPolicyData.function = {};
							authzPolicyData.function.id=authzPolicy.function.id;
						}
						
						
                        // Add Role Role Policy
                        if (mode == 'add') {
                            $scope.insertAuthzPolicy(authzPolicyData);
                        }

                        // Edit Role Policy
                        if (mode == 'edit') {
                        	authzPolicyData.aid=$scope.applicationId;
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
                    

            		
            		$scope.isStageComplete=function() {
            			switch($scope.activeStage) {
            				case 1:
            					if($scope.authzPolicy.effect!=null && $scope.authzPolicy.name)
            						return true;
            					else 
            						return false;
            				case 2:
            					if($scope.selectedPrincipals!=null && $scope.selectedPrincipals.length>0) {
            							return true;
            					} else {
            						return false;
            					}
            				case 3:
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
    
    rolePoliciesModule.controller('policiesFunctionController',
            [
                '$scope', '$rootScope', '$cookies', '$routeParams', '$location', 'functionPageFactory','$window',
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
                    $scope.itemsByPage=5; //Need to change based on form stage... How to do that..??
                    $scope.callFunctionDropdown = function (tableState) {
                    	var section = 'Function';
                    	$scope.isLoading_dd = true;
                        //tableState.pagination.numberOfPages = 0;
                        var pagination = tableState.pagination;
                        var start = pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
                        //var number = pagination.number || false;  // Number of entries showed per page. if pagination.number not found set false .
                        var entriesPerPage=5;
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
                                        $scope.error_dd = $rootScope.getErrorMessage(result.error,section);
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
                    $window.onclick = function(event) {
                    	closeWhenClickingElsewhere(event, function() {
                    		$scope.openDropdown = false;
                    		$scope.$apply();
                    	}, 'list_container');
                    };
	                
	                $scope.getDropdownIconClass = function() {
	                	if(!$scope.openDropdown) {
	                		return "arrow-down";
	                	}
	                	return "arrow-up";
	                };
	                
	                $scope.functionName = "";
                    $scope.selectFunctionDetail = function (value) {
                    	$scope.openDropdown = false;
                    	if(!$scope.authzPolicy.function) {
                    		$scope.authzPolicy.function={};
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
    
});
