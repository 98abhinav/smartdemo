define(['app/app', 'angularAMD'], function (app, sourceModule)
{
    sourceModule.service('groupsService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    sourceModule.directive('groupsRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    sourceModule.factory('groupsFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/groups';
            var groupsFactory = {};

            // Get All users
            /*groupsFactory.getGroups = function (searchText,sourceId,limit,sortBy,sortHow) {
             return $http.get(urlBase + '?q='+searchText+'&sid='+sourceId+'&limit='+limit+'&sort_by='+sortBy+'&sort_how='+sortHow);
             };*/

            groupsFactory.getGroups = function (searchText, searchType, sourceId, limit, sortBy, sortHow) {
				
				if ($rootScope.applicationName == '') {
					return $http.get(urlBase + '?q=' + searchText + '&qtype=' + searchType + '&sid=' + sourceId + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
				}
				else {
					return $http.get(urlBase + '?q=' + searchText + '&qtype=' + searchType + '&sid=' + sourceId + '&sort_by=' + sortBy + '&sort_how=' + sortHow + '&aname=' + $rootScope.applicationName);
				}
//                if (angular.isUndefined(searchType)) {
//                    return $http.get(urlBase + '?q=' + searchText + '&sid=' + sourceId + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
//
//                } else {
//                    return $http.get(urlBase + '?q=' + searchText + '&qtype=' + searchType + '&sid=' + sourceId + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
//
//                }
                //return $http.get(urlBase + '?q=' + searchText + '&sid=' + sourceId + '&limit=' + limit + '&sort_by=' + sortBy + '&sort_how=' + sortHow);

                //return $http.get(urlBase + '?q='+searchText+'&sid='+sourceId);
            };
            
            /* role search by selecting the group name in ROLE module*/
             groupsFactory.getRoles = function (searchText, applicationId, sourceId) {
                return $http.get(urlBase + '/' + sourceId + '/' + searchText + '/roles?aid='+ applicationId);
            };

            groupsFactory.getGroup = function (id) {
                return $http.get(urlBase + '/' + id);
            };

            return groupsFactory;
        }]);


    sourceModule.factory('groupsPageFactory', ['$q', '$timeout', 'groupsFactory', function ($q, $timeout, groupsFactory) {

            //call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, sourceId, sortBy, sortHow) {
                var rowCount = 0;
                var result;
                var deferred = $q.defer();
                var errorDetails;
                if (params.sort.reverse != undefined) {
                    sortHow = params.sort.reverse ? 'desc' : 'asc';
                }

                var searchText = params.search.predicateObject ? params.search.predicateObject.name : '';
                if (searchText == undefined) {
                    searchText = '';
                }

                //Hardcoded.. check if better way out.
                var resultPromise = groupsFactory.getGroups(searchText, sourceId, number, start, 'name', sortHow);
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