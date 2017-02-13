define(['app/app', 'angularAMD'], function (app, resourceTypeModule)
{
    resourceTypeModule.service('resourceTypeService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    resourceTypeModule.directive('resourcetypesRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    resourceTypeModule.factory('resourceTypeFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/resourcetypes';
            var resourceTypeFactory = {};

            // Get All ResourceTypes
            resourceTypeFactory.getResourceTypes = function (searchText, applicationId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);

            };

            resourceTypeFactory.getResourceType = function (id, resourceTypeId) {
                return $http.get(urlBase + '/' + id + '?aid=' + resourceTypeId);
            };

            // create a new ResourceType within ES
            resourceTypeFactory.insertResourceType = function (resourcetype) {
                return $http.post(urlBase, resourcetype);
            };

            // update the name/description of an ResourceType based on its ID
            resourceTypeFactory.updateResourceType = function (id, resourcetype) {
                return $http.put(urlBase + '/' + id, resourcetype);
            };

            // delete an ResourceType based on its ID
            resourceTypeFactory.deleteResourceType = function (id, applicationId) {
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // count an Action based on its ID
            resourceTypeFactory.countResourceType = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }

            return resourceTypeFactory;
        }]);

    resourceTypeModule.factory('resourceTypePageFactory', ['$q', '$timeout', 'resourceTypeFactory', function ($q, $timeout, resourceTypeFactory) {


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

                var searchText = params.search.predicateObject ? params.search.predicateObject.name : '';
                if (searchText == undefined) {
                    searchText = '';
                }

                
                var resultPromise = resourceTypeFactory.getResourceTypes(searchText, applicationId, number, start, sortBy, sortHow);
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
