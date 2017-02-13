define(['app/app', 'angularAMD'], function (app, functionsModule)
{
    functionsModule.service('functionService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    functionsModule.directive('functionsRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    functionsModule.factory('functionFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/functions';
            var functionFactory = {};

            // Get Functions based on criteria
            functionFactory.getFunctions = function (searchText, applicationId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };

            // Get particular Function based on ID
            functionFactory.getFunction = function (id, applicationId) {
                return $http.get(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // create a new Function within ES
            functionFactory.insertFunction = function (functions) {
                return $http.post(urlBase, functions);
            };

            // update a Function based on its ID
            functionFactory.updateFunction = function (id, functions) {
                return $http.put(urlBase + '/' + id, functions);
            };

            // delete a Function based on its ID
            functionFactory.deleteFunction = function (id, applicationId) {
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // count an Factory based on its ID
            functionFactory.countFunction = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }
            return functionFactory;
        }]);

    functionsModule.factory('functionPageFactory', ['$q', '$timeout', 'functionFactory', function ($q, $timeout, functionFactory) {

            //fake call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, applicationId, sortBy, sortHow) {
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

                var resultPromise = functionFactory.getFunctions(searchText, applicationId, number, start, sortBy, sortHow);
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