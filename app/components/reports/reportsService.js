define(['app/app', 'angularAMD'], function (app, reportModule)
{
    

    reportModule.factory('reportsFactory', ['$http', '$rootScope', function ($http, $rootScope) {

            var urlBase = $rootScope.config.apiPath + '/ESAdmin/v1/reports';
            var reportsFactory = {};

            //Get the supported reports
            reportsFactory.getReportTypes = function () {
                return $http.get(urlBase);
            };
            //Get all targets
            reportsFactory.getTargets = function () {
                return $http.get(urlBase+"/targets");
            };
            //Get Report I/O pattern
            reportsFactory.getPattern = function (patternType) {
                return $http.get(urlBase+"/"+patternType);
            };
            //
            // create a new Action within ES
            reportsFactory.getReport = function (patternType,reportInput) {
                return $http.post(urlBase+"/"+patternType, reportInput);
            };
          
          
            return reportsFactory;
        }]);


    


});