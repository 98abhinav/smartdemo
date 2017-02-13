define(['app/app', 'angularAMD'], function (app, systemAdministratorModule)
{
    systemAdministratorModule.service('systemAdministratorService',
		[
			function ()
			{
				this.getString = function () {
					return "Some value";
				}
			}
		]);

    systemAdministratorModule.directive('systemadministratorsRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    systemAdministratorModule.factory('systemAdministratorFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/roles/-19/users';
            var systemAdministratorFactory = {};

            // Get All SystemAdministrators
            systemAdministratorFactory.getSystemAdministrators = function (searchText, applicationId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };

            systemAdministratorFactory.getSystemAdministrator = function (id, systemAdministratorId) {
                return $http.get(urlBase + '/' + id + '?aid=' + systemAdministratorId);
            };

/*            // create a new SystemAdministrator within ES
            systemAdministratorFactory.insertSystemAdministrator = function (systemadministrator) {
                return $http.post(urlBase, systemadministrator);
            };

            // update the name/description of an SystemAdministrator based on its ID
            systemAdministratorFactory.updateSystemAdministrator = function (id, systemadministrator) {
                return $http.put(urlBase + '/' + id, systemadministrator);
            };

            // delete an SystemAdministrator based on its ID
            systemAdministratorFactory.deleteSystemAdministrator = function (id, applicationId) {
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };*/

            // count an Action based on its ID
            systemAdministratorFactory.countSystemAdministrator = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }

            return systemAdministratorFactory;
        }]);

    systemAdministratorModule.factory('systemAdministratorPageFactory', ['$q', '$timeout', 'systemAdministratorFactory', function ($q, $timeout, systemAdministratorFactory) {

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
                
                //console.log('params.search.predicateObject', params.search.predicateObject);
                var searchText;
                if (params.search.predicateObject) {
                	if (params.search.predicateObject.uid) {
                		searchText = params.search.predicateObject.uid;
                	} else if (params.search.predicateObject.$) {
                		searchText = params.search.predicateObject.$;
                	}
                } else {
                	searchText = '';
                }
                if (searchText == undefined) {
                    searchText = '';
                }
                
                var resultPromise = systemAdministratorFactory.getSystemAdministrators(searchText, applicationId, number, start, sortBy, sortHow);
					resultPromise.then(
						function (response) {
							result = response.data;
							rowCount = response.data.totalCount;
						}, 
						function (error) {
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