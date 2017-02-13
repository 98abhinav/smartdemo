define(['app/app', 'angularAMD'], function (app, resourceModule)
{
    resourceModule.service('resourceService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    resourceModule.directive('resourcesRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    resourceModule.factory('resourceFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/resources';
            var resourceFactory = {};
            // Get Resources for advance search 
            resourceFactory.getResourcesSearch = function (searchText, applicationId, tid, pid, hierarchical, global, sortBy, sortHow) {
                if (pid == 0) {
                    return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&tid=' + tid +'&hierarchical=false&global=' + global + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
                }
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&tid=' + tid + '&pid=' + pid + '&hierarchical=' + hierarchical + '&global=' + global + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };
            // Get Resources for Application
            resourceFactory.getResources = function (searchText, applicationId, tid, pid, hierarchical, global, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&tid=' + tid + '&pid=' + pid + '&hierarchical=' + hierarchical + '&global=' + global + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };

            resourceFactory.getResource = function (id, applicationId) {
                return $http.get(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // create a new Resource within ES
            resourceFactory.insertResource = function (resource) {
                return $http.post(urlBase, resource);
            };

            // update the name/description of an Resource based on its ID
            resourceFactory.updateResource = function (id, resource) {
                return $http.put(urlBase + '/' + id, resource);
            };

            // delete an Resource based on its ID
            resourceFactory.deleteResource = function (id, applicationId) {
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // count an Resource based on its ID
            resourceFactory.countResource = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }

            return resourceFactory;
        }]);

    resourceModule.factory('resourcePageFactory', ['$q', '$timeout', 'resourceFactory', function ($q, $timeout, resourceFactory) {
            //fake call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, applicationId, tid, pid, hierarchical, global, sortBy, sortHow) {
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


                var resultPromise = resourceFactory.getResources(searchText, applicationId, tid, pid, hierarchical, global, number, start, sortBy, sortHow);
                resultPromise.then(
                        function (response) {
                            result = response.data;
                            rowCount = response.data.levelCount;
                        }, function (error) {
                    errorDetails = error;
                });


                //$q.all([resultPromise, countPromise]).then(
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
