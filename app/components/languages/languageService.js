define(['app/app'], function (app)
{
    app.service('languageService',
            [
                '$resource', '$http',
                function ($resource, $http)
                {

                    this.getTranslation = function ($scope, language) {
                        var languageFilePath = 'config/languages/' + language + '.json';
                        $resource(languageFilePath).get(function (data) {

                            $scope.translation = data;
                        });
                    };

                    this.getLanguage = function (language) {
                        var languageFilePath = 'config/languages/'+ language +'.json';
                        return $resource(languageFilePath).get();
                    };
                   

                }
            ]);
});