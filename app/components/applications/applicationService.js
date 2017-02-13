define(['app/app', 'angularAMD'], function (app, applicationModule)
{
    applicationModule.service('applicationService',
            [
                function ()
                {
                    this.getString = function () {
                        return "Some value";
                    }
                }
            ]);


    applicationModule.factory('applicationFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/applications';
            var applicationFactory = {};

            // Get list of applications
            applicationFactory.getApplications = function (searchText, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow);
            };

            // Get list of report applications
            applicationFactory.getReportApplications = function (searchText, limit, offset, sortBy, sortHow) {
                return $http.get(urlBase + '?q=' + searchText + '&limit=' + limit + '&offset=' + offset + '&sort_by=' + sortBy + '&sort_how=' + sortHow + '&forReport=true');
            };

            // Get particular Application
            applicationFactory.getApplication = function (id) {
                return $http.get(urlBase + '/' + id);
            };

            // Get particular Application Access
            applicationFactory.getApplicationAccess = function (id) {
                return $http.get(urlBase + '/' + id + '/access');
            };

            // Get particular Application Access
            applicationFactory.getSuperAccess = function () {
                return $http.get(urlBase + '/access');
            };

            // create a new application within ES
            applicationFactory.insertApplication = function (application) {
                return $http.post(urlBase, application);
            };

            // update the name/description of an Application based on its ID
            applicationFactory.updateApplication = function (id, application) {
                //alert(id); alert(application.desc);
                return $http.put(urlBase + '/' + id, application);
            };

            // get an Application based on its ID
            applicationFactory.deleteApplication = function (id) {
                return $http.delete(urlBase + '/' + id);
            };

            // delete an Application based on its ID
            applicationFactory.getDelegatedAdmin = function (id) {
                return $http.get(urlBase + '/' + id + '/admins');
            };
            //update an permission to DelegatedAdmin                
            applicationFactory.updateDelegatedAdmin = function (id, permission) {
                return $http.put(urlBase + '/' + id + '/admins', permission);
            };

            return applicationFactory;
        }]);
    
    applicationModule.factory('applicationPolicyFactory', ['$http', '$rootScope', function ($http, $rootScope) {

        var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/policies/download';
        var applicationPolicyFactory = {};

        // Get Application Policies
        applicationPolicyFactory.getApplicationPolicies = function (id) {
            return $http.get(urlBase + '/' + id);
        };

        return applicationPolicyFactory;
    }]);

    applicationModule.factory('applicationPageFactory', ['$q', '$timeout', 'applicationFactory', function ($q, $timeout, applicationFactory) {
            //fake call to the server, normally this service would serialize table state to send it to the server (with query parameters for example) and parse the response
            //in our case, it actually performs the logic which would happened in the server
            function getPage(start, number, params, sortBy, sortHow, forReport) {
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

                if (forReport) {
                    var resultPromise = applicationFactory.getReportApplications(searchText, number, start, sortBy, sortHow);
                } else {
                    var resultPromise = applicationFactory.getApplications(searchText, number, start, sortBy, sortHow);
                }
                resultPromise.then(
                        function (response) {
                            result = response.data;
                            rowCount = response.data.totalCount;
                        },
                        function (error) {
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