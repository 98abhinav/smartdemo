define(['app/app', 'angularAMD'], function (app, roleModule)
{
    roleModule.service('roleService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    roleModule.directive('rolesRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    roleModule.factory('roleFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/roles';
            var roleFactory = {};

            // Get Roles for Application
            roleFactory.getRoles = function (searchText, applicationId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            roleFactory.getRole = function (id, applicationId) {
                return $http.get(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // Get Users/Groups for Role
            roleFactory.getRoleUsers = function (searchText, roleId, applicationId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '/' + roleId + '/users?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            roleFactory.getRoleGroups = function (searchText, roleId, applicationId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '/' + roleId + '/groups?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            
            // create a new Role within ES
            roleFactory.insertRole = function (role) {
                return $http.post(urlBase, role);
            };

            // update the name/description of an Role based on its ID
            roleFactory.updateRole = function (id, role) {
                return $http.put(urlBase + '/' + id, role);
            };
            
            // add/remove members of an Role based on its ID
            roleFactory.updateRoleMembers = function (id, applicationId, roleDetails) {
                return $http.put(urlBase + '/' + id + '/memberships?aid=' + applicationId, roleDetails);
            };

            // delete an Role based on its ID
            roleFactory.deleteRole = function (id, applicationId) {
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // count an Action based on its ID
            roleFactory.countRole = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }

            return roleFactory;
        }]);
    roleModule.factory('rolePageFactory', ['$q', '$timeout', 'roleFactory', function ($q, $timeout, roleFactory) {

            //call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, applicationId, sortBy, sortHow) {
                var rowCount = 0;
                var result;
                var deferred = $q.defer();
                var errorDetails;
                if (params.sort.reverse != undefined) {
                    sortHow = params.sort.reverse ? 'desc' : 'asc';
                }
                //console.log('params.search.predicateObject',params.search.predicateObject);
                var searchText = params.search.predicateObject ? params.search.predicateObject.name : '';
                if (searchText == undefined) {
                    searchText = '';
                }

                var resultPromise = roleFactory.getRoles(searchText, applicationId, number, start, sortBy, sortHow);
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

    //Factory to fetch the users/groups of Role 
    roleModule.factory('roleUGPageFactory', ['$q', '$timeout', 'roleFactory', function ($q, $timeout, roleFactory) {


            //call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            
            function getPage(start, number, params, roleId, applicationId, sortBy, sortHow, type) {
               
                var rowCount = 0;
                var result;
                var deferred = $q.defer();
                var errorDetails;
                if (params.sort.reverse != undefined) {
                    sortHow = params.sort.reverse ? 'desc' : 'asc';
                }
                //console.log('params.search.predicateObject',params.search.predicateObject);
                var searchText;
                if (params.search.predicateObject) {
                	if (params.search.predicateObject.name) {
                		searchText = params.search.predicateObject.name;
                	} else if (params.search.predicateObject.$) {
                		searchText = params.search.predicateObject.$;
                	}
                } else {
                	searchText = '';
                }
                if (searchText == undefined) {
                    searchText = '';
                }
                
                if (type && type=='groups') {
                	var resultPromise = roleFactory.getRoleGroups(searchText, roleId, applicationId, number, start, sortBy, sortHow);
                } else {
                	var resultPromise = roleFactory.getRoleUsers(searchText, roleId, applicationId, number, start, sortBy, sortHow);
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