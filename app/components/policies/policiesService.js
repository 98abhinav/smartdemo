define(['app/app', 'angularAMD'], function (app, policiesModule)
{
    policiesModule.service('rolePoliciesService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    policiesModule.directive('rolePoliciesRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    policiesModule.factory('rolePoliciesFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            
            var rolePoliciesFactory = {};

            rolePoliciesFactory.getResourcePolicy = function (policyType, applicationId, typeId, fqdn) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/resources/'+'policies';
                return $http.get(urlBase + '?t=' + policyType + '&aid=' + applicationId+'&tid=' + typeId+'&fqdn=' + fqdn);
            };



            // Get Roles for Application
            rolePoliciesFactory.getRolePolicies = function (searchText, applicationId, policyType, limit, offset, sortBy, sortHow) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/' + policyType;
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            
            //Get Policies based on Search criteria
            rolePoliciesFactory.searchRolePolicies = function (searchText, applicationId, resq, rolq, ccomb, limit, offset, sortBy, sortHow) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/roles';
                if(angular.isUndefined(resq)||resq=='ALL'){
                    return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&rolq=' + rolq + '&ccomb=' + ccomb + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
                }
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&resq=' + resq + '&rolq=' + rolq + '&ccomb=' + ccomb + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            rolePoliciesFactory.searchUserPolicies = function (searchText, applicationId, resq, usrq, ccomb, limit, offset, sortBy, sortHow) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/users';
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&resq=' + resq + '&usrq=' + usrq + '&ccomb=' + ccomb + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            rolePoliciesFactory.searchGroupPolicies = function (searchText, applicationId, resq, grpq, ccomb, limit, offset, sortBy, sortHow) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/groups';
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&resq=' + resq + '&grpq=' + grpq + '&ccomb=' + ccomb + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            
            rolePoliciesFactory.getRolePolicy = function (id, applicationId, policyType) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/' + policyType;
                return $http.get(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // create a new Role within ES
            rolePoliciesFactory.insertRolePolicy = function (rolePolicy, applicationId, policyType) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/' + policyType;
                return $http.post(urlBase + '?aid=' + applicationId, rolePolicy);
            };

            // update the name/description of an Role based on its ID
            rolePoliciesFactory.updateRolePolicy = function (id, applicationId, rolePolicy, policyType) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/' + policyType;
                return $http.put(urlBase + '/' + id+ '?aid=' + applicationId, rolePolicy);
            };

            // delete an Role based on its ID
            rolePoliciesFactory.deleteRolePolicy = function (id, applicationId, policyType) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/' + policyType;
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // count an Action based on its ID
            rolePoliciesFactory.countRolePolicies = function (searchText, applicationId, policyType) {
            	var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/'+'policies/' + policyType;
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }

            return rolePoliciesFactory;
        }]);
    policiesModule.factory('rolePoliciesPageFactory', ['$q', '$timeout', 'rolePoliciesFactory', function ($q, $timeout, rolePoliciesFactory) {

            //call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, applicationId, policyType, sortBy, sortHow, resq, roleOrUserOrGroup, ccomb, searchstr) {
                var rowCount = 0;
                var result;
                var deferred = $q.defer();
                var errorDetails;
                if (params.sort.reverse != undefined) {
                    sortHow = params.sort.reverse ? 'desc' : 'asc';
                }

                if (searchstr != undefined) {
                	var searchText = searchstr;
                } else {
                	var searchText = params.search.predicateObject ? params.search.predicateObject.name : '';
                    if (searchText == undefined) {
                        searchText = '';
                    }
                }
                
                if (resq!=undefined || ccomb!=undefined || roleOrUserOrGroup!=undefined) {
                	switch (policyType) {
                		case 'roles':
                			var resultPromise = rolePoliciesFactory.searchRolePolicies(searchText, applicationId, resq, roleOrUserOrGroup, ccomb, number, start, sortBy, sortHow);
                			break;
                			
                		case 'users':
                			var resultPromise = rolePoliciesFactory.searchUserPolicies(searchText, applicationId, resq, roleOrUserOrGroup, ccomb, number, start, sortBy, sortHow);
                			break;
                			
                		case 'groups':
                			var resultPromise = rolePoliciesFactory.searchGroupPolicies(searchText, applicationId, resq, roleOrUserOrGroup, ccomb, number, start, sortBy, sortHow);
                			break;
                			
                		default:
                			break;
                	}
                	//var resultPromise = rolePoliciesFactory.searchRolePolicies(searchText, applicationId, policyType, resq, rolq, ccomb, number, start, sortBy, sortHow);
                } else {
                	var resultPromise = rolePoliciesFactory.getRolePolicies(searchText, applicationId, policyType, number, start, sortBy, sortHow);
                }
                
                resultPromise.then(
                        function (response) {
                            result = response.data;
                            rowCount = response.data.totalCount;
                        }, function (error) {
                        	errorDetails = error;
                        });

                resultPromise.then(
                        function () {
                            deferred.resolve({
                                data: result,
                                numberOfPages: Math.ceil(rowCount / number),
                                error: errorDetails

                            });
                        },
                        function (errorDetails) {

                            deferred.resolve({
                                data: result,
                                numberOfPages: Math.ceil(rowCount / number),
                                error: errorDetails

                            });
                        });

                return deferred.promise;
            }

            return {
                getPage: getPage
            };

        }]);


});