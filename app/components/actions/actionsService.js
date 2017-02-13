define(['app/app', 'angularAMD'], function (app, actionModule)
{
    actionModule.service('actionService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);

    actionModule.directive('actionsRepeatDirective', function () {
        return function (scope, element, attrs) {
            if (scope.$first) {
                scope.$emit('FirstRecord');
                //angular.element(element).css('border','5px solid red');
                //angular.element(element).addClass('selectedActive');
            }
        };
    });

    actionModule.factory('actionFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/actions';
            var actionFactory = {};

            // Get Actions for Application
            actionFactory.getActions = function (searchText, applicationId, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&aid=' + applicationId + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };

            actionFactory.getAction = function (id, applicationId) {
                return $http.get(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // create a new Action within ES
            actionFactory.insertAction = function (action) {
                return $http.post(urlBase, action);
            };

            // update the name/description of an Action based on its ID
            actionFactory.updateAction = function (id, action) {
                return $http.put(urlBase + '/' + id, action);
            };

            // delete an Action based on its ID
            actionFactory.deleteAction = function (id, applicationId) {
                return $http.delete(urlBase + '/' + id + '?aid=' + applicationId);
            };

            // count an Action based on its ID
            actionFactory.countAction = function (searchText, applicationId) {
                return $http.get(urlBase + '/count?q=' + searchText + '&aid=' + applicationId);
            }

            return actionFactory;
        }]);

    actionModule.factory('actionPageFactory', ['$q', '$timeout', 'actionFactory', function ($q, $timeout, actionFactory) {
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

                
                var resultPromise = actionFactory.getActions(searchText, applicationId, number, start, sortBy, sortHow);
                resultPromise.then(
                        function (response) {
                        	result = response.data;
                        	rowCount = response.data.totalCount;
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
