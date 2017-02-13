define(['app/app', 'angularAMD'], function (app, resourceGroupModule)
{
    resourceGroupModule.service('resourceGroupService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    resourceGroupModule.directive('resourcegroupsRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    resourceGroupModule.factory('resourceGroupFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/resources/groups';
            var resourceGroupFactory = {};

            // Get Resource Groups for advance search 
            resourceGroupFactory.getResourceGroupSearch = function (searchText, applicationId, typeId, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&tid=' + typeId + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };

            // Get All ResourceGroups
            resourceGroupFactory.getResourceGroups = function (searchText, applicationId, typeId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&tid=' + typeId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);

            };

            resourceGroupFactory.getResourceGroup = function (id, resourceGroupId) {
                return $http.get(urlBase + '/' + id + '?aid=' + resourceGroupId);
            };

            // Get Resources of ResourceGroup           
            resourceGroupFactory.getResourceGroupResources = function (searchText, groupId, applicationId, limit, offset, sortBy, sortHow) {
                //return $http.get(urlBase + '/' + groupId + '/resources?aid=' + applicationId);
                return $http.get(urlBase + '/' + groupId + '/resources?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);

            };

            // create a new ResourceGroup within ES
            resourceGroupFactory.insertResourceGroup = function (resourcegroup) {
                return $http.post(urlBase, resourcegroup);
            };

            // update the name/description of an ResourceGroup based on its ID
            resourceGroupFactory.updateResourceGroup = function (id, resourcegroup) {
                return $http.put(urlBase + '/' + id, resourcegroup);
            };
            
            // Manage resources of an ResourceGroup based on its ID
            resourceGroupFactory.updateResourceGroupResources = function (id, resourcegroupresources) {
                return $http.put(urlBase + '/' + id + '/resources', resourcegroupresources);
            };

            // delete an ResourceGroup based on its ID
            resourceGroupFactory.deleteResourceGroup = function (id, applicationId) {
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // count an Action based on its ID
            resourceGroupFactory.countResourceGroup = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }

            return resourceGroupFactory;
        }]);

    resourceGroupModule.factory('resourceGroupPageFactory', ['$q', '$timeout', 'resourceGroupFactory', function ($q, $timeout, resourceGroupFactory) {


            //call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, applicationId, typeId, sortBy, sortHow) {
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


                var resultPromise = resourceGroupFactory.getResourceGroups(searchText, applicationId, typeId, number, start, sortBy, sortHow);
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
    //Factory to fetch the resources of ResourceGroup 
    resourceGroupModule.factory('resourceGroupResourcesPageFactory', ['$q', '$timeout', 'resourceGroupFactory', function ($q, $timeout, resourceGroupFactory) {


            //call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            
            function getPage(start, number, params,  groupId, applicationId, sortBy, sortHow) {
               
                var rowCount = 0;
                var result;
                var deferred = $q.defer();
                var errorDetails;
                if (params.sort.reverse != undefined) {
                    sortHow = params.sort.reverse ? 'desc' : 'asc';
                }
                
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
                
                var resultPromise = resourceGroupFactory.getResourceGroupResources(searchText, groupId, applicationId, number, start, sortBy, sortHow);
                resultPromise.then(
                        function (response) {
                            result = response.data;
                            rowCount = response.data.levelCount;
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