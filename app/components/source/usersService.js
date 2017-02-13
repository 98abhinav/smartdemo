define(['app/app', 'angularAMD'], function (app, sourceModule)
{
    sourceModule.service('usersService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    sourceModule.directive('usersRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    sourceModule.factory('usersFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/users';
            var usersFactory = {};

            // Get All users
            usersFactory.getUsers = function (searchText, searchType, sourceId, limit, sortBy, sortHow) {
                //return $http.get(urlBase + '?q=' + searchText + '&sid=' + sourceId);
                return $http.get(urlBase + '?q=' + searchText + '&qtype=' + searchType + '&sid=' + sourceId + '&limit=' + limit + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
//                if (searchType==='') {
//                    return $http.get(urlBase + '?q=' + searchText + '&sid=' + sourceId + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
//                } else {
//                    return $http.get(urlBase + '?q=' + searchText + '&qtype=' + searchType + '&sid=' + sourceId + '&limit=' + limit + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
//
//                }
            };

            /* role search by selecting the user name in ROLE module*/
            usersFactory.getRoles = function (searchText, applicationId, sourceId) {
                return $http.get(urlBase + '/' + sourceId + '/' + searchText + '/roles?aid=' + applicationId);
            };

            usersFactory.getUser = function (id) {
                return $http.get(urlBase + '/' + id);
            };

            return usersFactory;
        }]);


    sourceModule.factory('usersPageFactory', ['$q', '$timeout', 'usersFactory', function ($q, $timeout, usersFactory) {

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
                var resultPromise = usersFactory.getUsers(searchText, 'uid', sourceId, number, start, 'uid', sortHow);
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


