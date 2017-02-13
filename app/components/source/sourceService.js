define(['app/app', 'angularAMD'], function (app, sourceModule)
{
    sourceModule.service('sourceService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    sourceModule.directive('sourcesRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    sourceModule.factory('sourceFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/sources';
            var sourceFactory = {};

            // Get All sources
            sourceFactory.getSources = function (searchText, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };

            // Get a source's detail based on its ID
            sourceFactory.getSource = function (id) {
                return $http.get(urlBase + '/' + id);
            };

            // Get source attributes based on its ID
            sourceFactory.getSourceAttributes = function (id) {
                return $http.get(urlBase + '/' + id);
            };
            
            // Get source metadata
            sourceFactory.getSourceMetadata = function () {
                return $http.get(urlBase + '/metadata');
            };

            // create a new source within ES
            sourceFactory.insertSource = function (source) {
                return $http.post(urlBase, source);
            };

            // update the name / connection manager / connection attriobutes associated to a source based on its ID
            sourceFactory.updateSource = function (id, source) {
                return $http.put(urlBase + '/' + id, source);
            };

            // delete a source based on its ID. As part of this operation, dependent users/groups will be checked to be present as well
            sourceFactory.deleteSource = function (id) {
                return $http.delete(urlBase + '/' + id);
            };

            // count an Action based on its ID
            sourceFactory.countSource = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText);
            }

            return sourceFactory;
        }]);
    sourceModule.factory('sourcePageFactory', ['$q', '$timeout', 'sourceFactory', function ($q, $timeout, sourceFactory) {
            //fake call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, sortBy, sortHow) {
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

                var resultPromise = sourceFactory.getSources(searchText, number, start, sortBy, sortHow);
                resultPromise.then(
                        function (response) {
                            result = response.data;
                            rowCount = response.data.totalCount;
                        }, function (error) {
                        	errorDetails = error;
                        });

                //console.log(rowCount);

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